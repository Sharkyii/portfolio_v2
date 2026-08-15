"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/cn";
import type { ChatMessage } from "./useChat";

export function ChatMessageView({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const isWaitingForFirstToken = message.isStreaming && !message.content;

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-gradient-to-r from-accent to-accent-2 text-background"
            : message.isError
              ? "border border-red-500/30 bg-red-500/10 text-red-200"
              : "border border-border bg-surface text-foreground"
        )}
      >
        {!isUser ? (
          <div className="prose-chat">
            {isWaitingForFirstToken ? (
              <span className="inline-flex gap-1 py-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
              </span>
            ) : (
              <>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: ({ className, children, ...props }) => (
                      <code
                        className={cn(
                          "rounded bg-surface-raised px-1.5 py-0.5 font-mono text-[0.85em]",
                          className
                        )}
                        {...props}
                      >
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="my-2 overflow-x-auto rounded-lg border border-border bg-surface-raised p-3 font-mono text-xs">
                        {children}
                      </pre>
                    ),
                    a: ({ children, ...props }) => (
                      <a className="text-accent-2 underline underline-offset-2" {...props}>
                        {children}
                      </a>
                    ),
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="mb-2 list-disc pl-5">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-2 list-decimal pl-5">{children}</ol>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {message.isStreaming && (
                  <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-0.5 animate-pulse bg-foreground" />
                )}
              </>
            )}
          </div>
        ) : (
          <p>{message.content}</p>
        )}

        {message.imageUrl && (
          <Image
            src={message.imageUrl}
            alt="response"
            width={200}
            height={200}
            unoptimized
            className="mt-3 rounded-lg border border-border"
          />
        )}

        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-2">
            {message.sources.map((s) => (
              <a
                key={s.project_id}
                href={s.github_url ?? undefined}
                target={s.github_url ? "_blank" : undefined}
                rel={s.github_url ? "noopener noreferrer" : undefined}
                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted hover:border-accent-2 hover:text-accent-2"
              >
                {s.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
