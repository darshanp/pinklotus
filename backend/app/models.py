from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    profile = relationship("UserProfile", back_populates="user", uselist=False)
    terms_consents = relationship("TermsConsent", back_populates="user")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    
    user = relationship("User", back_populates="profile")

class TermsVersion(Base):
    __tablename__ = "terms_versions"

    id = Column(Integer, primary_key=True, index=True)
    version_string = Column(String, unique=True, nullable=False)  # e.g., "1.0"
    content = Column(Text, nullable=False)
    is_active = Column(Boolean, default=False)
    published_at = Column(DateTime(timezone=True), server_default=func.now())
    
    consents = relationship("TermsConsent", back_populates="terms_version")

class TermsConsent(Base):
    __tablename__ = "terms_consents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    terms_version_id = Column(Integer, ForeignKey("terms_versions.id"), nullable=False)
    base_terms_version_content_snapshot = Column(Text, nullable=True) # Optional: snapshot of what they agreed to if we want strict audit
    accepted_at = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)

    user = relationship("User", back_populates="terms_consents")
    terms_version = relationship("TermsVersion", back_populates="consents")
