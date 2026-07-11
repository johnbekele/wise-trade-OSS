import { X, ExternalLink, Target, BarChart3 } from 'lucide-react';
import { ImpactBadge } from './ImpactCard';

export default function ImpactDetailModal({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-card border rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b px-6 py-4 flex items-start justify-between z-10">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span className="font-medium">{item.source}</span>
              {item.published_date && (
                <>
                  <span className="text-border">|</span>
                  <span>{item.published_date}</span>
                </>
              )}
              <span className="text-border">|</span>
              <span>Rank #{item.rank}</span>
            </div>
            <h2 className="text-lg font-bold leading-tight">{item.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-md transition-colors flex-shrink-0 -mt-0.5">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="flex items-center gap-3">
            <ImpactBadge level={item.impact_level} direction={item.impact_direction} />
            {item.source_url && (
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Source
              </a>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Why It Matters</h3>
            <p className="text-sm leading-relaxed">{item.why_it_matters}</p>
          </div>

          {item.trading_insight && (
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
                <Target className="h-3.5 w-3.5" />
                Trading Insight
              </h3>
              <p className="text-sm leading-relaxed">{item.trading_insight}</p>
            </div>
          )}

          {item.data_signal && (
            <div className="bg-muted/50 border rounded-lg p-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5" />
                Supporting Data Signal
              </h3>
              <p className="text-sm leading-relaxed">{item.data_signal}</p>
            </div>
          )}

          {(item.affected_companies?.length > 0 || item.affected_sectors?.length > 0) && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Affected</h3>
              <div className="flex flex-wrap gap-2">
                {item.affected_companies?.map((company, i) => (
                  <span key={`c-${i}`} className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-700 text-xs font-medium border border-blue-100">
                    {company}
                  </span>
                ))}
                {item.affected_sectors?.map((sector, i) => (
                  <span key={`s-${i}`} className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border">
                    {sector}
                  </span>
                ))}
              </div>
            </div>
          )}

          {item.source_url && (
            <div className="pt-4 border-t">
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
              >
                <ExternalLink className="h-4 w-4" />
                Read full article on {item.source}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
