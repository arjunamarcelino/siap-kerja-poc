from enum import StrEnum

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str


class CareerRole(StrEnum):
    """Closed set of supported career roles."""

    DATA_ANALYST = "Data Analyst"
    UI_UX_DESIGNER = "UI/UX Designer"
    AI_ML_ENGINEER = "AI / ML Engineer"
    PRODUCT_MANAGER = "Product Manager"
    BACKEND_DEVELOPER = "Backend Developer"
    FRONTEND_DEVELOPER = "Frontend Developer"
    FULL_STACK_DEVELOPER = "Full Stack Developer"
    DEVOPS_ENGINEER = "DevOps Engineer"
    DATA_SCIENTIST = "Data Scientist"
    MOBILE_DEVELOPER = "Mobile Developer"


class ExperienceLevel(StrEnum):
    """Constrained experience levels."""

    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"


class RoadmapStep(BaseModel):
    step: int
    title: str
    description: str
    skills_covered: list[str]
    resources: list[str] = Field(
        description="2-3 specific learning resources. Prefer free resources."
    )
    duration: str  # e.g. "2-3 weeks"


class CVExtraction(BaseModel):
    """Output of the first LLM call: extract skills from CV text."""

    identified_skills: list[str] = Field(
        description=(
            "All technical and soft skills found in the CV. "
            "Use standardized names (e.g., 'JavaScript' not 'JS')."
        )
    )
    experience_level: ExperienceLevel
    cv_summary: str = Field(
        description=(
            "A 2-3 sentence professional summary focusing on skills and experience. "
            "Do NOT include personal information like name, email, phone, or address."
        )
    )


class GapAndRoadmap(BaseModel):
    """Output of the second LLM call: gap analysis + roadmap."""

    required_skills: list[str] = Field(
        description="Skills required by the job market for the target role."
    )
    skill_gaps: list[str] = Field(
        description="Skills the candidate is missing (required - identified)."
    )
    matching_skills: list[str] = Field(
        description="Skills the candidate already has that match requirements."
    )
    roadmap: list[RoadmapStep] = Field(
        description="Ordered learning roadmap to close skill gaps."
    )
    estimated_duration: str = Field(
        description="Total estimated time to complete the roadmap, e.g. '3-6 months'."
    )


class AnalysisResult(BaseModel):
    """Combined result returned to the client."""

    identified_skills: list[str]
    experience_level: ExperienceLevel
    cv_summary: str

    required_skills: list[str]
    skill_gaps: list[str]
    matching_skills: list[str]

    roadmap: list[RoadmapStep]
    estimated_duration: str

    jobs_analyzed: int
    target_role: str


class ErrorResponse(BaseModel):
    message: str
