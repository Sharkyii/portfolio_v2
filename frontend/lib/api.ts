import type {
  ApiErrorBody,
  AskResponse,
  AvailabilityResponse,
  BioResponse,
  BookingRequest,
  BookingResponse,
  OpenSourceStats,
  Profile,
  Project,
  ScheduleRequest,
  ScheduleResponse,
} from "./types";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as ApiErrorBody;
      if (body.detail) detail = body.detail;
    } catch {
      // body wasn't JSON — fall back to statusText
    }
    throw new ApiError(res.status, detail);
  }

  return res.json() as Promise<T>;
}

export const api = {
  ask: (question: string) =>
    request<AskResponse>("/api/ask", { method: "POST", body: JSON.stringify({ question }) }),

  bio: (message: string) =>
    request<BioResponse>("/api/bio", { method: "POST", body: JSON.stringify({ message }) }),

  projects: () => request<Project[]>("/api/projects"),

  opensource: () => request<OpenSourceStats>("/api/opensource"),

  profile: () => request<Profile>("/api/profile"),

  resumeUrl: "/api/resume",

  memeUrl: "/api/meme",

  bookMeeting: (body: BookingRequest) =>
    request<BookingResponse>("/api/meetings", { method: "POST", body: JSON.stringify(body) }),

  scheduleMeeting: (body: ScheduleRequest) =>
    request<ScheduleResponse>("/api/meetings/schedule", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  availability: (start: string, end: string) =>
    request<AvailabilityResponse>(
      `/api/meetings/availability?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    ),
};
