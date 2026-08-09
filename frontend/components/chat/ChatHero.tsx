"use client";

import { useEffect, useRef } from "react";
import { Glow } from "@/components/ui/Glow";
import { ChatInput } from "./ChatInput";
import { ChatMessageView } from "./ChatMessageView";
import { QuickNav } from "./QuickNav";
import { useChat } from "./useChat";

export function ChatHero() {
  const { messages, isLoading, send } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const hasStarted = messages.length > 0;

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      <Glow className="left-1/2 top-1/4 h-[700px] w-[900px] -translate-x-1/2" />

      <div className="relative z-10 w-full max-w-2xl">
        {!hasStarted && (
          <div className="mb-10 text-center">
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-accent-2">
              AI Engineer
            </p>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              <span className="gradient-text">Sneh Kansagara</span>
            </h1>
            <p className="mt-2 text-sm text-muted">
              goes by <span className="text-foreground">Sharkyi</span> &middot; JEE percentile
              99.35
            </p>
            <p className="mx-auto mt-5 max-w-md text-muted">
              Building AI systems, graph intelligence platforms, and contributing to open
              source.
            </p>
          </div>
        )}

        {hasStarted && (
          <div
            ref={scrollRef}
            className="mb-4 max-h-[50vh] space-y-3 overflow-y-auto rounded-2xl border border-border bg-surface/40 p-4 backdrop-blur-sm"
          >
            {messages.map((m) => (
              <ChatMessageView key={m.id} message={m} />
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted">
                  Thinking...
                </div>
              </div>
            )}
          </div>
        )}

        <ChatInput onSubmit={send} isLoading={isLoading} />

        {!hasStarted && <QuickNav />}
      </div>
    </section>
  );
}
