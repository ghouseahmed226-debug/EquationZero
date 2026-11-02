"""Project schemas"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    domain: Optional[str] = None
    is_public: bool = False
    tags: List[str] = []


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    domain: Optional[str] = None
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = None


class ProjectResponse(BaseModel):
    id: str
    owner_id: str
    name: str
    description: Optional[str]
    domain: Optional[str]
    is_public: bool
    tags: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
