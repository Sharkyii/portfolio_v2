import type {
  ApiErrorBody,
  AskStreamEvent,
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

/** Reads /api/ask's NDJSON body (one JSON object per line — see
 * AskStreamEvent) and yields parsed events as they arrive, rather than
 * waiting for the full response like `request()` does. A trailing partial
 * line is buffered until the next chunk completes it. */
async function* streamAsk(question: string): AsyncGenerator<AskStreamEvent> {
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok || !res.body) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as ApiErrorBody;
      if (body.detail) detail = body.detail;
    } catch {
      // body wasn't JSON — fall back to statusText
    }
    throw new ApiError(res.status, detail);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (line.trim()) yield JSON.parse(line) as AskStreamEvent;
    }
  }

  if (buffer.trim()) yield JSON.parse(buffer) as AskStreamEvent;
}

export const api = {
  askStream: streamAsk,

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
