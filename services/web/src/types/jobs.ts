export interface JobMatch {
  title: string;
  company: string;
  /** Integer 0-100 representing skill coverage percentage */
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  total_required: number;
}

export interface JobMatchResponse {
  matches: JobMatch[];
}
