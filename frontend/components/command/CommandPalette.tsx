"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { api } from "@/lib/api";
import { cn } from "@/lib/cn";

interface CommandItem {
  id: string;
  label: string;
  hint: string;
  action: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIndex(0);
  }, []);

  const goToSection = useCallback(
    (hash: string) => {
      if (pathname !== "/") {
        router.push(`/${hash}`);
      } else {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
      }
      close();
    },
    [pathname, router, close]
  );

  const focusChat = useCallback(() => {
    if (pathname !== "/") {
      router.push("/");
      setTimeout(() => window.dispatchEvent(new Event("focus-chat-input")), 300);
    } else {
      window.dispatchEvent(new Event("focus-chat-input"));
    }
    close();
  }, [pathname, router, close]);

  const items: CommandItem[] = [
    { id: "chat", label: "Ask the chatbot", hint: "Home", action: focusChat },
    { id: "projects", label: "View projects", hint: "Section", action: () => goToSection("#projects") },
    {
      id: "opensource",
      label: "Open-source activity",
      hint: "Section",
      action: () => goToSection("#open-source"),
    },
    {
      id: "experience",
      label: "Experience & achievements",
      hint: "Section",
      action: () => goToSection("#experience"),
    },
    { id: "skills", label: "Skills", hint: "Section", action: () => goToSection("#skills") },
    {
      id: "meet",
      label: "Book a meeting",
      hint: "Page",
      action: () => {
        router.push("/meet");
        close();
      },
    },
    {
      id: "resume",
      label: "Download resume",
      hint: "File",
      action: () => {
        window.open(api.resumeUrl, "_blank");
        close();
      },
    },
  ];

  const filtered = items.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));

  const openPalette = useCallback(() => {
    setOpen(true);
    setActiveIndex(0);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (prev) return false;
          setActiveIndex(0);
          return true;
        });
      } else if (e.key === "Escape") {
        close();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", openPalette);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", openPalette);
    };
  }, [close, openPalette]);

  // Focusing the input on open is a legitimate effect (syncing with the DOM);
  // resetting activeIndex is not, and is handled at each state-change call
  // site instead (openPalette, handleQueryChange) per the lint rule below.
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(id);
  }, [open]);

  function handleQueryChange(value: string) {
    setQuery(value);
    setActiveIndex(0);
  }

  function handleInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      filtered[activeIndex]?.action();
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center bg-black/60 pt-[15vh] backdrop-blur-sm"
      onClick={close}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Type a command..."
          className="w-full border-b border-border bg-transparent px-4 py-3.5 text-sm text-foreground placeholder:text-muted focus:outline-none"
        />
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted">No matches</p>
          )}
          {filtered.map((item, i) => (
            <button
              key={item.id}
              onClick={item.action}
              onMouseEnter={() => setActiveIndex(i)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                i === activeIndex ? "bg-white/10 text-foreground" : "text-muted"
              )}
            >
              <span>{item.label}</span>
              <span className="text-xs text-muted">{item.hint}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3 border-t border-border px-4 py-2 text-xs text-muted">
          <span>
            <kbd className="rounded border border-border px-1.5 py-0.5">↑↓</kbd> navigate
          </span>
          <span>
            <kbd className="rounded border border-border px-1.5 py-0.5">↵</kbd> select
          </span>
          <span>
            <kbd className="rounded border border-border px-1.5 py-0.5">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
