import { ArrowUp, ArrowDown, Minus, Target, ChevronRight } from 'lucide-react';

export function ImpactBadge({ level, direction }) {
  const dirIcon = direction === 'positive'
    ? <ArrowUp className="w-3.5 h-3.5 text-green-600" />
    : direction === 'negative'
    ? <ArrowDown className="w-3.5 h-3.5 text-destructive" />
    : <Minus className="w-3.5 h-3.5 text-muted-foreground" />;

  const levelStyles = level === 'high'
    ? 'bg-destructive/10 text-destructive border-destructive/20'
    : level === 'medium'
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-blue-50 text-blue-700 border-blue-200';

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${levelStyles}`}>
      {dirIcon}
      {level} impact
    </div>
  );
}

export default function ImpactCard({ item, onClick, index = 0 }) {
  return (
    <button
      onClick={onClick}
      className="card group text-left w-full p-5 hover:shadow-md transition-all duration-200 opacity-0 animate-fade-up animate-fill-forwards"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-1.5 flex-1 min-w-0 pr-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">{item.source}</span>
            {item.published_date && (
              <>
                <span className="text-border">|</span>
                <span>{item.published_date}</span>
              </>
            )}
          </div>
          <h4 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {item.title}
          </h4>
        </div>
        <ImpactBadge level={item.impact_level} direction={item.impact_direction} />
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.why_it_matters}</p>

      {item.trading_insight && (
        <div className="text-xs text-primary/80 bg-primary/5 rounded px-2.5 py-1.5 mb-3 line-clamp-1">
          <Target className="w-3 h-3 inline mr-1.5 -mt-px" />
          {item.trading_insight}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {item.affected_companies?.slice(0, 3).map((company, i) => (
            <span key={i} className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-[10px] font-medium">
              {company}
            </span>
          ))}
          {(item.affected_companies?.length > 3) && (
            <span className="text-[10px] text-muted-foreground">+{item.affected_companies.length - 3}</span>
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
}
