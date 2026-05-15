export const CAREER_ROLES = [
  "Data Analyst",
  "UI/UX Designer",
  "AI / ML Engineer",
  "Product Manager",
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Mobile Developer",
] as const;

export type CareerRole = (typeof CAREER_ROLES)[number];

export interface RoadmapStep {
  step: number;
  title: string;
  description: string;
  skills_covered: string[];
  resources: string[];
  duration: string;
}

export interface AnalysisResult {
  id: string;
  identified_skills: string[];
  experience_level: string;
  cv_summary: string;
  required_skills: string[];
  skill_gaps: string[];
  matching_skills: string[];
  roadmap: RoadmapStep[];
  estimated_duration: string;
  jobs_analyzed: number;
  target_role: string;
  career_aspiration: string;
  created_at: string;
}
