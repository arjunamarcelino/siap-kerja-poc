from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    service: str


class CVAnalysisRequest(BaseModel):
    cv_text: str


class CVAnalysisResponse(BaseModel):
    skills: list[str]
    experience_level: str
    summary: str


class RoadmapRequest(BaseModel):
    user_skills: list[str]
    target_role: str


class RoadmapResponse(BaseModel):
    roadmap: list[dict]
    estimated_duration: str


class JobMatchRequest(BaseModel):
    user_skills: list[str]


class JobMatchResponse(BaseModel):
    jobs: list[dict]


class ErrorResponse(BaseModel):
    message: str
