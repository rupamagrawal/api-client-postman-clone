from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, ConfigDict

# ==========================================
# Environment Variable Schemas
# ==========================================
class EnvironmentVariableBase(BaseModel):
    key: str
    value: str = ""
    enabled: bool = True

class EnvironmentVariableCreate(EnvironmentVariableBase):
    pass

class EnvironmentVariableUpdate(BaseModel):
    key: Optional[str] = None
    value: Optional[str] = None
    enabled: Optional[bool] = None

class EnvironmentVariableResponse(EnvironmentVariableBase):
    id: str
    environment_id: str

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Environment Schemas
# ==========================================
class EnvironmentBase(BaseModel):
    name: str

class EnvironmentCreate(EnvironmentBase):
    pass

class EnvironmentUpdate(BaseModel):
    name: Optional[str] = None

class EnvironmentResponse(EnvironmentBase):
    id: str
    created_at: datetime
    updated_at: datetime
    variables: List[EnvironmentVariableResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Request Schemas
# ==========================================
class RequestBase(BaseModel):
    name: str
    method: str
    url: str
    headers: Dict[str, str] = Field(default_factory=dict)
    params: Dict[str, str] = Field(default_factory=dict)
    body_type: str = "none"
    body_content: Optional[str] = None
    auth_type: str = "none"
    auth_config: Dict[str, str] = Field(default_factory=dict)
    collection_id: Optional[str] = None

class RequestCreate(RequestBase):
    pass

class RequestUpdate(BaseModel):
    name: Optional[str] = None
    method: Optional[str] = None
    url: Optional[str] = None
    headers: Optional[Dict[str, str]] = None
    params: Optional[Dict[str, str]] = None
    body_type: Optional[str] = None
    body_content: Optional[str] = None
    auth_type: Optional[str] = None
    auth_config: Optional[Dict[str, str]] = None
    collection_id: Optional[str] = None

class RequestResponse(RequestBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Collection Schemas
# ==========================================
class CollectionBase(BaseModel):
    name: str
    description: Optional[str] = None

class CollectionCreate(CollectionBase):
    pass

class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class CollectionResponse(CollectionBase):
    id: str
    created_at: datetime
    updated_at: datetime
    requests: List[RequestResponse] = []

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# History Schemas
# ==========================================
class HistoryBase(BaseModel):
    method: str
    url: str
    headers: Dict[str, str] = Field(default_factory=dict)
    params: Dict[str, str] = Field(default_factory=dict)
    body_type: str = "none"
    body_content: Optional[str] = None
    auth_type: str = "none"
    auth_config: Dict[str, str] = Field(default_factory=dict)
    response_status: int
    response_time_ms: int
    response_size_bytes: int
    response_headers: Dict[str, str] = Field(default_factory=dict)
    response_body: Optional[str] = None

class HistoryResponse(HistoryBase):
    id: str
    executed_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ==========================================
# Request Runner Schemas
# ==========================================
class RunRequest(BaseModel):
    method: str
    url: str
    headers: Dict[str, str] = Field(default_factory=dict)
    params: Dict[str, str] = Field(default_factory=dict)
    body_type: str = "none"
    body_content: Optional[str] = None
    auth_type: str = "none"
    auth_config: Dict[str, str] = Field(default_factory=dict)
    environment_variables: Dict[str, str] = Field(default_factory=dict)

class RunResponse(BaseModel):
    status_code: int
    headers: Dict[str, str]
    body: Optional[str] = None
    time_ms: int
    size_bytes: int
    error: Optional[str] = None
    error_type: Optional[str] = None  # timeout, connection_error, invalid_url, unknown
