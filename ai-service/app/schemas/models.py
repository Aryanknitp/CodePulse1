from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional

class ContextPayload(BaseModel):
    context: Dict[str, Any] = Field(default_factory=dict)

class ChatPayload(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    history: List[Dict[str, str]] = Field(default_factory=list)
    context: Dict[str, Any] = Field(default_factory=dict)
    focus: str = Field(default="balanced", max_length=80)

class AIContextPayload(BaseModel):
    context: Dict[str, Any] = Field(default_factory=dict)
    candidates: List[Dict[str, Any]] = Field(default_factory=list)
    days: int = Field(default=7, ge=1, le=30)

class AIResponse(BaseModel):
    response: str

class InsightResponse(BaseModel):
    summary: str
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[Dict[str, str]]

class WeeklyResponse(BaseModel):
    summary: str
    highlights: List[str]
    focus: List[str]
    nextWeekPlan: List[str]
