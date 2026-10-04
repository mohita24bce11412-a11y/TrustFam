from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import json

from app.database import engine, Base, get_db
from app.models import User, TrustLink, HelpRequest, AuditEvent, RequestStatus
from app.schemas import TextAnalysisRequest, AnalysisResult, TrustLinkInvite, HelpRequestCreate
from app.security import get_current_user_id
from app.analysis.engine import analyze_text_engine
from app.ocr.pipeline import process_image_ocr
from app.services.sharing import redact_sensitive_info, sanitize_analysis_for_sharing
from app.config import settings

# Create DB Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TrustFam Backend", version="1.0.0")

# --- ANALYZE ENDPOINTS (Stateless) ---

@app.post("/api/analyze/text", response_model=AnalysisResult)
def analyze_text(payload: TextAnalysisRequest):
    res = analyze_text_engine(payload.text)
    return res

@app.post("/api/analyze/image", response_model=AnalysisResult)
async def analyze_image(file: UploadFile = File(...), lang: str = Form("auto")):
    contents = await file.read()
    extracted_text, low_conf = process_image_ocr(contents)
    res = analyze_text_engine(extracted_text)
    res["ocr_low_confidence"] = low_conf
    return res

# --- USER ENDPOINTS ---

@app.post("/api/users")
def create_user(db: Session = Depends(get_db)):
    user = User()
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"user_id": user.id}

@app.get("/api/me")
def get_me(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "created_at": user.created_at}

@app.delete("/api/me")
def delete_me(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    return {"message": "Account wiped successfully"}

# --- TRUST CIRCLE ENDPOINTS ---

@app.get("/api/circle")
def get_circle(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    links = db.query(TrustLink).filter(
        (TrustLink.user_id == user_id) | (TrustLink.contact_id == user_id)
    ).all()
    return {"circle": links}

@app.post("/api/circle/invite")
def invite_contact(
    req: TrustLinkInvite, 
    user_id: str = Depends(get_current_user_id), 
    db: Session = Depends(get_db)
):
    link = TrustLink(user_id=user_id, contact_id=req.contact_id, status="PENDING")
    db.add(link)
    db.commit()
    return {"invite_id": link.id, "status": link.status}

@app.post("/api/circle/invitations/{invite_id}/accept")
def accept_invite(
    invite_id: str, 
    user_id: str = Depends(get_current_user_id), 
    db: Session = Depends(get_db)
):
    link = db.query(TrustLink).filter(TrustLink.id == invite_id, TrustLink.contact_id == user_id).first()
    if not link:
        raise HTTPException(status_code=404, detail="Invitation not found")
    
    link.status = "ACCEPTED"
    db.commit()
    return {"message": "Invitation accepted"}

@app.delete("/api/circle/{link_id}")
def remove_contact(
    link_id: str, 
    user_id: str = Depends(get_current_user_id), 
    db: Session = Depends(get_db)
):
    link = db.query(TrustLink).filter(
        TrustLink.id == link_id, 
        (TrustLink.user_id == user_id) | (TrustLink.contact_id == user_id)
    ).first()
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
    
    db.delete(link)
    db.commit()
    return {"message": "Contact removed"}

# --- HELP REQUEST ENDPOINTS ---

@app.post("/api/help-requests")
def create_help_request(
    req: HelpRequestCreate, 
    user_id: str = Depends(get_current_user_id), 
    db: Session = Depends(get_db)
):
    # Verify accepted trust link exists
    link = db.query(TrustLink).filter(
        TrustLink.status == "ACCEPTED",
        ((TrustLink.user_id == user_id) & (TrustLink.contact_id == req.contact_id)) |
        ((TrustLink.contact_id == user_id) & (TrustLink.user_id == req.contact_id))
    ).first()
    
    if not link:
        raise HTTPException(status_code=403, detail="Active trust link required to send help requests")

    # Analyze & Redact on Server Side
    redacted_message = redact_sensitive_info(req.text) if (req.share_message and req.text) else None
    
    analysis_res = analyze_text_engine(req.text) if req.text else {"risk_level": "NONE", "signals": [], "actions": [], "verify_steps": []}
    sanitized_analysis = sanitize_analysis_for_sharing(analysis_res, req.share_message) if req.share_analysis else None

    expires = datetime.now(timezone.utc) + timedelta(days=settings.HELP_REQUEST_EXPIRY_DAYS)

    help_req = HelpRequest(
        sender_id=user_id,
        contact_id=req.contact_id,
        share_message=req.share_message,
        share_analysis=req.share_analysis,
        message_text=redacted_message,
        analysis_json=json.dumps(sanitized_analysis) if sanitized_analysis else None,
        expires_at=expires
    )
    
    db.add(help_req)
    # Log Audit
    audit = AuditEvent(user_id=user_id, action="CREATE_HELP_REQUEST", target_id=help_req.id)
    db.add(audit)
    
    db.commit()
    return {"request_id": help_req.id, "expires_at": expires}

@app.get("/api/help-requests/sent")
def get_sent_requests(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    reqs = db.query(HelpRequest).filter(HelpRequest.sender_id == user_id).all()
    return reqs

@app.get("/api/help-requests/received")
def get_received_requests(user_id: str = Depends(get_current_user_id), db: Session = Depends(get_db)):
    reqs = db.query(HelpRequest).filter(HelpRequest.contact_id == user_id).all()
    # Content-free listing
    return [{"id": r.id, "sender_id": r.sender_id, "status": r.status, "created_at": r.created_at} for r in reqs]

@app.get("/api/help-requests/{request_id}")
def get_request_detail(
    request_id: str, 
    user_id: str = Depends(get_current_user_id), 
    db: Session = Depends(get_db)
):
    req = db.query(HelpRequest).filter(HelpRequest.id == request_id).first()
    if not req or (req.sender_id != user_id and req.contact_id != user_id):
        raise HTTPException(status_code=404, detail="Request not found")
    
    # Check expiry
    if datetime.now(timezone.utc) > req.expires_at.replace(tzinfo=timezone.utc):
        req.status = RequestStatus.EXPIRED
        req.message_text = None
        req.analysis_json = None
        db.commit()
        raise HTTPException(status_code=410, detail="Request expired and content wiped")

    return {
        "id": req.id,
        "sender_id": req.sender_id,
        "status": req.status,
        "message_text": req.message_text,
        "analysis": json.loads(req.analysis_json) if req.analysis_json else None
    }

@app.post("/api/help-requests/{request_id}/revoke")
def revoke_request(
    request_id: str, 
    user_id: str = Depends(get_current_user_id), 
    db: Session = Depends(get_db)
):
    req = db.query(HelpRequest).filter(HelpRequest.id == request_id, HelpRequest.sender_id == user_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    req.status = RequestStatus.REVOKED
    req.message_text = None
    req.analysis_json = None
    db.commit()
    return {"message": "Request revoked and content wiped"}