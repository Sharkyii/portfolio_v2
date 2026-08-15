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
  isStreaming?: boolean;
}

let nextId = 0;
const newId = () => `msg-${nextId++}`;

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  function patchMessage(id: string, patch: Partial<ChatMessage>) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  const send = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { id: newId(), role: "user", content: trimmed }]);
    setIsLoading(true);

    const assistantId = newId();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", isStreaming: true },
    ]);

    try {
      for await (const event of api.askStream(trimmed)) {
        if (event.type === "meta") {
          patchMessage(assistantId, {
            sources: event.sources,
            blocked: event.blocked,
            imageUrl: event.image_url,
          });
        } else if (event.type === "delta") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: m.content + event.text } : m
            )
          );
        } else if (event.type === "done") {
          patchMessage(assistantId, { isStreaming: false });
        }
      }
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.status === 503
            ? "The chatbot isn't configured yet — the Anthropic API key is missing on the backend."
            : err.message
          : "Something went wrong reaching the chatbot.";
      patchMessage(assistantId, { content: message, isError: true, isStreaming: false });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { messages, isLoading, send };
}
