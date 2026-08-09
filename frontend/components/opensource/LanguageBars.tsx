export function LanguageBars({ languages }: { languages: [string, number][] }) {
  const max = Math.max(...languages.map(([, count]) => count), 1);

  return (
    <div className="space-y-3">
      {languages.map(([name, count]) => (
        <div key={name}>
          <div className="mb-1 flex justify-between text-sm">
            <span>{name}</span>
            <span className="text-muted">{count}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
