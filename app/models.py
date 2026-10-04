import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
import enum
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class RequestStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    REVOKED = "REVOKED"
    RESOLVED = "RESOLVED"
    EXPIRED = "EXPIRED"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    # Relationships
    initiated_links = relationship("TrustLink", foreign_keys="TrustLink.user_id", cascade="all, delete-orphan")
    received_links = relationship("TrustLink", foreign_keys="TrustLink.contact_id", cascade="all, delete-orphan")
    sent_requests = relationship("HelpRequest", foreign_keys="HelpRequest.sender_id", cascade="all, delete-orphan")

class TrustLink(Base):
    __tablename__ = "trust_links"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    contact_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, default="PENDING")  # PENDING, ACCEPTED
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class HelpRequest(Base):
    __tablename__ = "help_requests"

    id = Column(String, primary_key=True, default=generate_uuid)
    sender_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    contact_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    share_message = Column(Boolean, default=False)
    share_analysis = Column(Boolean, default=True)
    
    # Store redacted payload or wiped content
    message_text = Column(Text, nullable=True)
    analysis_json = Column(Text, nullable=True)
    
    status = Column(Enum(RequestStatus), default=RequestStatus.ACTIVE)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    expires_at = Column(DateTime, nullable=False)

class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, nullable=False)
    action = Column(String, nullable=False)
    target_id = Column(String, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))