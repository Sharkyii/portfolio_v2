// Mirrors the FastAPI backend's response shapes exactly (see ../../app/routers/*.py
// and ../../app/services/*.py) — keep in sync by hand, there's no shared schema.

export interface Project {
  id: string;
  title: string;
  summary: string;
  github_url: string | null;
  live_url: string | null;
  category: string | null;
  stack: string[];
  image: string | null;
}

export interface MergedPR {
  title: string;
  repo: string;
  url: string;
  merged_at: string | null;
}

export interface ContributionDay {
  date: string;
  count: number;
}

export interface OpenSourceStats {
  username: string;
  merged_pr_count: number;
  recent_prs: MergedPR[];
  total_stars: number;
  top_languages: [string, number][];
  contribution_calendar: ContributionDay[] | null;
}

export interface AskSource {
  project_id: string;
  title: string;
  github_url: string | null;
}

export interface AskResponse {
  answer: string;
  sources: AskSource[];
  blocked: boolean;
  image_url: string | null;
}

export interface BioResponse {
  sonnet: string;
}

export interface BookingRequest {
  name: string;
  email: string;
  start: string; // ISO datetime
  duration_minutes: number;
  topic: string;
}

export interface BookingResponse {
  event_id: string;
  calendar_link: string;
  meet_link: string | null;
  email_sent: boolean;
}

export interface ScheduleRequest {
  name: string;
  email: string;
  message: string;
}

export interface ScheduleResponse {
  booked: boolean;
  clarification_question: string | null;
  resolved_start: string | null;
  resolved_topic: string | null;
  event_id: string | null;
  calendar_link: string | null;
  meet_link: string | null;
  email_sent: boolean;
}

export interface AvailabilityResponse {
  free: boolean;
}

export interface ProfileEducation {
  institution: string;
  credential: string;
  start: string;
  end: string;
  detail?: string;
}

export interface ProfileExperience {
  role: string;
  org: string;
  location: string;
  start: string;
  end: string;
  highlights: string[];
}

export interface ProfileResearch {
  title: string;
  org: string;
  start: string;
  end: string;
  highlights: string[];
}

export interface ProfileAchievement {
  title: string;
  detail?: string;
}

export interface Profile {
  name: string;
  links: {
    email: string;
    linkedin: string;
    github: string;
    codeforces: string;
    leetcode: string;
  };
  education: ProfileEducation[];
  experience: ProfileExperience[];
  research: ProfileResearch[];
  achievements: ProfileAchievement[];
  leadership: ProfileAchievement[];
  skills: Record<string, string[]>;
}

/** Shape of FastAPI's default error body: {"detail": "..."} */
export interface ApiErrorBody {
  detail: string;
}
