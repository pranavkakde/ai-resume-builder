export interface SkillItem {
  name: string;
  proficiency: string;
}

export interface ExperienceItem {
  title: string;
  company: string;
  duration: string;
  description: string;
  technologies: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
  gpa: string | null;
}

export interface StructuredResume {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  summary: string;
  skills: SkillItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
  certifications: string[];
  total_years_experience: number;
}

export interface JDRequirement {
  name: string;
  importance: string;
}

export interface StructuredJD {
  title: string;
  company?: string;
  required_skills: JDRequirement[];
  preferred_skills: JDRequirement[];
  experience_min_years: number;
  experience_max_years?: number;
  education_requirements: string[];
  responsibilities: string[];
  qualifications: string[];
}

export interface Recommendation {
  id: string;
  category: string;
  title: string;
  original_text: string | null;
  suggested_text: string;
  reasoning: string;
  priority: string;
  action: string;
}

export interface MatchDimension {
  name: string;
  score: number;
  weight: number;
  matched_items: string[];
  missing_items: string[];
  details: string;
}

export interface MatchResult {
  overall_score: number;
  color: string;
  dimensions: MatchDimension[];
  summary: string;
}

export interface AnalyzeResponse {
  match_result: MatchResult;
  recommendations: Recommendation[];
  structured_resume: StructuredResume;
  structured_jd: StructuredJD;
}

export interface Application {
  id: number;
  company_name: string;
  job_title: string;
  jd_text: string;
  match_score: number;
  match_color: string;
  resume_snapshot: string;
  status: string;
  notes: string;
  applied_date: string | null;
  created_at: string;
  updated_at: string;
}

export type Theme = 'midnight' | 'aurora' | 'ivory' | 'ocean';

export type GenerateMode = 'enhanced' | 'accept_all' | 'overhaul';

export interface LLMSettings {
  provider: string;
  apiKey: string;
  azureEndpoint?: string;
  azureDeployment?: string;
  azureApiVersion?: string;
}

export interface GenerateRequest {
  resume_text: string;
  jd_text: string;
  mode: GenerateMode;
  accepted_recommendations: Recommendation[];
  provider: string;
  api_key: string;
  azure_endpoint?: string;
  azure_deployment?: string;
  azure_api_version?: string;
  structured_resume?: StructuredResume;
  structured_jd?: StructuredJD;
}

export interface RecommendationState {
  recommendation: Recommendation;
  status: 'pending' | 'accepted' | 'rejected';
  editedText: string | null;
  isEditing: boolean;
}
