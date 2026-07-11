export default function AnalysisRenderer({ text }) {
  if (!text) return null;
  return (
    <div className="p-6 space-y-4">
      {text.split('\n').map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2" />;

        if (trimmed.match(/^#{1,4}\s/) || trimmed.match(/^\d+\.\s+[A-Z]/)) {
          const headerText = trimmed.replace(/^#{1,4}\s+/, '').replace(/^\d+\.\s+/, '');
          return (
            <h3 key={idx} className="text-base font-bold text-foreground mt-6 mb-2 pb-2 border-b border-border">
              {headerText}
            </h3>
          );
        }

        if (trimmed.match(/^\d+\.\s+\*\*/)) {
          const match = trimmed.match(/^\d+\.\s+\*\*(.+?)\*\*(.*)/) || trimmed.match(/^\d+\.\s+(.+)/);
          const title = match[1]?.trim();
          const desc = match[2]?.trim();
          const num = trimmed.match(/^(\d+)\./)[1];

          return (
            <div key={idx} className="bg-muted/30 border border-border/50 p-4 rounded-lg ml-4 relative animate-fade-in" style={{ animationDelay: `${idx * 20}ms` }}>
              <div className="absolute -left-3 top-4 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold border-2 border-background shadow-sm">
                {num}
              </div>
              <h4 className="font-semibold text-foreground mb-1">{title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          );
        }

        if (trimmed.match(/^\s*[\*\-•]\s+/)) {
          const match = trimmed.match(/^\s*[\*\-•]\s+\*\*(.+?)\*\*:?\s*(.*)/) || trimmed.match(/^\s*[\*\-•]\s+(.+)/);
          const label = match[1]?.replace(':', '').trim();
          const bulletText = match[2]?.trim() || match[0]?.replace(/^\s*[\*\-•]\s+/, '').trim();

          return (
            <div key={idx} className="flex gap-3 ml-6 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                {label && <span className="font-medium text-foreground">{label}: </span>}
                {bulletText}
              </p>
            </div>
          );
        }

        return (
          <p key={idx} className="text-muted-foreground leading-relaxed">
            {trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').split(/<strong>|<\/strong>/).map((part, i) =>
              i % 2 === 0 ? part : <strong key={i} className="font-medium text-foreground">{part}</strong>
            )}
          </p>
        );
      })}
    </div>
  );
}
