"use client";

import { useCallback, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { AskSource } from "@/lib/types";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: AskSource[];
  blocked?: boolean;
  imageUrl?: string | null;
  isError?: boolean;
}

let nextId = 0;
const newId = () => `msg-${nextId++}`;

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const send = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { id: newId(), role: "user", content: trimmed }]);
    setIsLoading(true);

    try {
      const res = await api.ask(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: "assistant",
          content: res.answer,
          sources: res.sources,
          blocked: res.blocked,
          imageUrl: res.image_url,
        },
      ]);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 503
            ? "The chatbot isn't configured yet — the Anthropic API key is missing on the backend."
            : err.message
          : "Something went wrong reaching the chatbot.";
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: "assistant", content: message, isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { messages, isLoading, send };
}
