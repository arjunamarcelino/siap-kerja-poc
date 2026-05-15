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

export interface StepProgress {
  skills_done: string[];
  resources_done: number[];
  completed_at: string | null;
}

export interface RoadmapProgressData {
  progress: Record<string, StepProgress>;
  progress_percentage: number;
}

interface ToggleRequestBase {
  step: number;
  done: boolean;
}

interface ToggleSkillRequest extends ToggleRequestBase {
  type: "skill";
  value: string;
}

interface ToggleResourceRequest extends ToggleRequestBase {
  type: "resource";
  index: number;
}

export type ToggleRequest = ToggleSkillRequest | ToggleResourceRequest;
