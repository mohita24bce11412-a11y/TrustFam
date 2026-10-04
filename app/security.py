from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db

def get_current_user_id(x_user_id: str = Header(None, alias="X-User-Id")) -> str:
    """Demo Stub Auth Header validation."""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="X-User-Id header missing")
    return x_user_id