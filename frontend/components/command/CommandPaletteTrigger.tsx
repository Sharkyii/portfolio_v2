"use client";

export function CommandPaletteTrigger() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
      className="hidden items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted transition-colors hover:border-border-strong hover:text-foreground sm:inline-flex"
    >
      <kbd className="font-sans">⌘K</kbd>
    </button>
  );
}
