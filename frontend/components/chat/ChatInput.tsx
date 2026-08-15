"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";

const PROMPTS = [
  "Ask about Cascade's architecture...",
  "What stack does FinGraph use?",
  "How does the vehicle complaint chatbot validate VINs?",
  "Schedule a meeting with me",
  "What's Sneh's education background?",
];

interface ChatInputProps {
  onSubmit: (value: string) => void;
  isLoading: boolean;
  autoFocus?: boolean;
}

export function ChatInput({ onSubmit, isLoading, autoFocus }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PROMPTS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    function handleFocusEvent() {
      inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      inputRef.current?.focus();
    }
    window.addEventListener("focus-chat-input", handleFocusEvent);
    return () => window.removeEventListener("focus-chat-input", handleFocusEvent);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    onSubmit(value);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={PROMPTS[placeholderIndex]}
        disabled={isLoading}
        className="w-full rounded-2xl border border-border bg-surface px-5 py-4 pr-28 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-r from-accent to-accent-2 px-4 py-2.5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
      >
        {isLoading ? "..." : "Ask"}
      </button>
    </form>
  );
}
