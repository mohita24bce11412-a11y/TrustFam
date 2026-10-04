from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

class TextAnalysisRequest(BaseModel):
    text: str
    lang: str = "auto"  # en, hi, auto

class Signal(BaseModel):
    category: str
    severity: str
    evidence: str
    span: List[int]
    explanation_en: str
    explanation_hi: str

class AnalysisResult(BaseModel):
    risk_level: str  # NONE, LOW, MEDIUM, HIGH
    signals: List[Signal]
    actions: List[str]
    verify_steps: List[str]
    ocr_low_confidence: Optional[bool] = None

class TrustLinkInvite(BaseModel):
    contact_id: str

class HelpRequestCreate(BaseModel):
    contact_id: str
    text: Optional[str] = None
    share_message: bool = False
    share_analysis: bool = True