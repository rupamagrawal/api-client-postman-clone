import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Collection(Base):
    __tablename__ = "collections"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    requests = relationship(
        "Request",
        back_populates="collection",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Request(Base):
    __tablename__ = "requests"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    collection_id = Column(
        String(36),
        ForeignKey("collections.id", ondelete="CASCADE"),
        nullable=True,
    )
    name = Column(String, nullable=False)
    method = Column(String, nullable=False)  # GET, POST, PUT, DELETE, etc.
    url = Column(String, nullable=False)
    headers = Column(JSON, nullable=False, default=dict)
    params = Column(JSON, nullable=False, default=dict)
    body_type = Column(String, nullable=False, default="none")  # none, raw, form-data, urlencoded
    body_content = Column(Text, nullable=True)
    auth_type = Column(String, nullable=False, default="none")  # none, bearer, basic
    auth_config = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    collection = relationship("Collection", back_populates="requests")


class Environment(Base):
    __tablename__ = "environments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    variables = relationship(
        "EnvironmentVariable",
        back_populates="environment",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class EnvironmentVariable(Base):
    __tablename__ = "environment_variables"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    environment_id = Column(
        String(36),
        ForeignKey("environments.id", ondelete="CASCADE"),
        nullable=False,
    )
    key = Column(String, nullable=False)
    value = Column(String, nullable=False, default="")
    enabled = Column(Boolean, nullable=False, default=True)

    # Relationships
    environment = relationship("Environment", back_populates="variables")


class History(Base):
    __tablename__ = "history"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    method = Column(String, nullable=False)
    url = Column(String, nullable=False)
    headers = Column(JSON, nullable=False, default=dict)
    params = Column(JSON, nullable=False, default=dict)
    body_type = Column(String, nullable=False, default="none")
    body_content = Column(Text, nullable=True)
    auth_type = Column(String, nullable=False, default="none")
    auth_config = Column(JSON, nullable=False, default=dict)
    
    # Response fields
    response_status = Column(Integer, nullable=False)
    response_time_ms = Column(Integer, nullable=False)
    response_size_bytes = Column(Integer, nullable=False)
    response_headers = Column(JSON, nullable=False, default=dict)
    response_body = Column(Text, nullable=True)
    
    executed_at = Column(DateTime, default=datetime.utcnow)
