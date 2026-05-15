from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings

from app.config import Settings


class LLMService:
    """Wrapper around Google Generative AI models via LangChain."""

    def __init__(self, settings: Settings) -> None:
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=settings.google_api_key,
        )
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=settings.google_api_key,
        )

    async def analyze_cv(self, cv_text: str) -> dict:
        """Analyze a CV and extract skills, experience level, and a summary.

        Returns a placeholder response. The real implementation will invoke
        the LLM with a structured prompt and parse the output.
        """
        return {
            "skills": ["Python", "FastAPI", "SQL"],
            "experience_level": "mid",
            "summary": (
                f"Analyzed CV ({len(cv_text)} chars). "
                "Candidate demonstrates solid technical skills."
            ),
        }

    async def generate_roadmap(self, user_skills: list, target_role: str) -> dict:
        """Generate a learning roadmap to transition into a target role.

        Returns a placeholder response. The real implementation will use
        the LLM to create a personalised learning plan.
        """
        return {
            "roadmap": [
                {
                    "step": 1,
                    "title": f"Foundation for {target_role}",
                    "description": "Build core competencies required for the role.",
                    "resources": ["Online courses", "Documentation"],
                },
                {
                    "step": 2,
                    "title": "Hands-on projects",
                    "description": "Apply skills through practical projects.",
                    "resources": ["GitHub projects", "Hackathons"],
                },
                {
                    "step": 3,
                    "title": "Portfolio & job applications",
                    "description": "Prepare portfolio and start applying.",
                    "resources": ["Resume builder", "Job boards"],
                },
            ],
            "estimated_duration": "3-6 months",
        }

    async def match_jobs(self, user_skills: list) -> dict:
        """Match a user's skills to relevant job openings.

        Returns a placeholder response. The real implementation will
        query a vector store and use the LLM to rank results.
        """
        return {
            "jobs": [
                {
                    "title": "Backend Developer",
                    "company": "TechCorp",
                    "match_score": 0.92,
                    "matched_skills": [s for s in user_skills[:3]],
                },
                {
                    "title": "Full-Stack Engineer",
                    "company": "StartupXYZ",
                    "match_score": 0.85,
                    "matched_skills": [s for s in user_skills[:2]],
                },
            ]
        }
