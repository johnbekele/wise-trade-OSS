import { useState } from 'react';
import {
  TrendingUp, RefreshCw, Search, AlertCircle, ArrowUp, ArrowDown, Minus,
  Lightbulb, CheckCircle, Target, Zap, Lock, ChevronRight, History,
  Sparkles, ExternalLink, ChevronDown, ChevronUp, BarChart3, Globe,
  Brain, LineChart, Newspaper, X
} from 'lucide-react';
import { useMarketImpactNews, useNewsAnalysis } from '../hooks/useNews';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function StreamingTextRenderer({ text }) {
  if (!text) return null;
  return (
    <div className="p-6 space-y-2 text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
      {text}
      <span className="inline-block w-0.5 h-4 bg-primary animate-typewriter-blink ml-0.5 align-middle" />
    </div>
  );
}

function AnalysisRenderer({ text }) {
  if (!text) return null;
  return (
    <div className="p-6 space-y-4">
      {text.split('\n').map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-2"></div>;

        if (trimmed.match(/^#{1,4}\s/) || trimmed.match(/^\d+\.\s+[A-Z]/)) {
          const headerText = trimmed.replace(/^#{1,4}\s+/, '').replace(/^\d+\.\s+/, '');
          return (
            <h3 key={idx} className="text-lg font-bold text-foreground flex items-center gap-2 mt-6 mb-2 pb-2 border-b border-border">
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

function ImpactCardDetail({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-card border rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-card border-b p-5 flex items-start justify-between z-10">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-2">
              <span className="px-2 py-0.5 bg-secondary rounded text-foreground">{item.source}</span>
              {item.published_date && <span>{item.published_date}</span>}
              <span>Rank #{item.rank}</span>
            </div>
            <h2 className="text-xl font-bold leading-tight">{item.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-muted rounded-md transition-colors flex-shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Impact Badge */}
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

          {/* Why It Matters */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">Why It Matters</h3>
            <p className="text-sm leading-relaxed">{item.why_it_matters}</p>
          </div>

          {/* Trading Insight */}
          {item.trading_insight && (
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-primary mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Trading Insight
              </h3>
              <p className="text-sm leading-relaxed">{item.trading_insight}</p>
            </div>
          )}

          {/* Data Signal */}
          {item.data_signal && (
            <div className="bg-muted/50 border rounded-lg p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Supporting Data Signal
              </h3>
              <p className="text-sm leading-relaxed">{item.data_signal}</p>
            </div>
          )}

          {/* Affected Companies & Sectors */}
          {(item.affected_companies?.length > 0 || item.affected_sectors?.length > 0) && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Affected</h3>
              <div className="flex flex-wrap gap-2">
                {item.affected_companies?.map((company, i) => (
                  <span key={`c-${i}`} className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-700 text-xs font-medium border border-blue-100">
                    {company}
                  </span>
                ))}
                {item.affected_sectors?.map((sector, i) => (
                  <span key={`s-${i}`} className="inline-flex items-center px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border">
                    {sector}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Source Link */}
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

function ImpactBadge({ level, direction }) {
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

const SUGGESTED_QUERIES = [
  'Impact of Fed rate decisions on tech stocks',
  'AI sector outlook this quarter',
  'Earnings season preview and expectations',
  'Energy sector trends and oil prices',
];

export default function NewsAnalysis() {
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { isAuthenticated } = useAuth();

  const {
    data: marketImpactData,
    isLoading: loadingMarket,
    forceRefresh: forceRefreshMarket,
    fetchOnce: fetchMarketOnce,
  } = useMarketImpactNews(10);

  const {
    analyze,
    streamingText,
    phase,
    data: analysisData,
    isLoading: loadingAnalysis,
    isError,
    error: analysisError,
    reset: resetAnalysis
  } = useNewsAnalysis();

  const {
    data: historyData,
    refetch: refetchHistory,
  } = useSearchHistory(10, { enabled: isAuthenticated });

  const marketImpactNews = marketImpactData?.news_items || [];
  const searchHistory = historyData?.history || [];

  const handleAnalyze = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    analyze(query);
  };

  const handleRefreshMarket = async () => {
    setRefreshing(true);
    try {
      await forceRefreshMarket();
    } finally {
      setRefreshing(false);
    }
  };

  const handleLoadMarket = async () => {
    setRefreshing(true);
    try {
      await fetchMarketOnce();
    } finally {
      setRefreshing(false);
    }
  };

  const handleHistoryClick = (historyQuery) => {
    setQuery(historyQuery);
    analyze(historyQuery);
  };

  const getImpactBorderColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'border-l-destructive';
      case 'medium': return 'border-l-amber-400';
      case 'low': return 'border-l-blue-400';
      default: return 'border-l-border';
    }
  };

  const getPhaseMessage = () => {
    switch (phase) {
      case 'collecting': return 'Gathering market data and web intelligence...';
      case 'synthesizing': return 'Claude is synthesizing insights from collected data...';
      case 'cached': return 'Loading cached results...';
      default: return '';
    }
  };

  const showStreaming = phase === 'synthesizing' || phase === 'cached';
  const showFinalResult = phase === 'done' && analysisData;
  const showAnalysisContainer = showStreaming || showFinalResult;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-br from-primary to-primary/70 p-2 rounded-lg shadow-sm">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI News Analysis</h2>
          <p className="text-muted-foreground mt-0.5">Deep insights powered by Claude AI</p>
        </div>
      </div>

      {!isAuthenticated ? (
        /* ── Unauthenticated: Full feature showcase ── */
        <div className="space-y-8">
          <div className="card border-dashed">
            <div className="card-content py-16 flex flex-col items-center text-center">
              <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-4 rounded-full mb-6">
                <Lock className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Sign In to Access AI Analysis</h2>
              <p className="text-muted-foreground max-w-lg mb-8 leading-relaxed">
                Wise Trade uses Claude AI to scan financial news, analyze stock data from Yahoo Finance,
                and deliver actionable trading insights — all in real-time.
              </p>
              <div className="flex gap-4 mb-12">
                <Link to="/login" className="btn btn-gradient px-8 inline-flex items-center justify-center rounded-md">Sign In</Link>
                <Link to="/signup" className="btn btn-outline px-8">Create Account</Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl text-left">
                {[
                  { icon: Newspaper, title: 'Market Impact Monitor', desc: 'AI detects high-impact news events and rates them by severity. Click any alert for full analysis, trading insights, and source citations.' },
                  { icon: Search, title: 'Deep Dive Analysis', desc: 'Ask any market question. Claude researches news, stock data, and web intelligence, then streams a comprehensive report with specific data points.' },
                  { icon: Globe, title: 'Multi-Source Intelligence', desc: 'Data from Yahoo Finance, Bloomberg, Reuters, CNBC, Reddit, X/Twitter, SEC filings — all synthesized into one coherent analysis.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="space-y-3">
                    <div className="bg-secondary w-10 h-10 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How it works for unauthenticated users */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title text-xl">How AI Analysis Works</h3>
              <p className="card-description">Three phases of intelligence gathering and synthesis</p>
            </div>
            <div className="card-content">
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { step: '1', icon: LineChart, title: 'Stock Data Collection', desc: 'Live quotes, market movers, volume analysis, and technical patterns from Yahoo Finance.' },
                  { step: '2', icon: Globe, title: 'Web Intelligence Scan', desc: 'Claude searches news, social media, SEC filings, and global markets for signals.' },
                  { step: '3', icon: Brain, title: 'AI Synthesis', desc: 'Both data streams are combined into a professional research report with cited sources.' },
                ].map(({ step, icon: Icon, title, desc }) => (
                  <div key={step} className="text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white font-bold mb-4 shadow-sm">
                      {step}
                    </div>
                    <div className="bg-muted/30 rounded-lg p-4 border">
                      <Icon className="h-6 w-6 text-primary mx-auto mb-3" />
                      <h4 className="font-semibold mb-1">{title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* ── Market Impact Section ── */}
          <div className="card">
            <div className="card-header flex flex-row items-center justify-between">
              <div>
                <h3 className="card-title text-xl">Market Impact Monitor</h3>
                <p className="card-description">
                  AI-detected high-impact events from news, social media, and market data.
                  {marketImpactData?.fetched_at && (
                    <span className="ml-1">
                      Last updated: {new Date(marketImpactData.fetched_at).toLocaleString()}
                    </span>
                  )}
                </p>
              </div>
              {marketImpactNews.length > 0 && (
                <button
                  onClick={handleRefreshMarket}
                  disabled={loadingMarket || refreshing}
                  className="btn btn-ghost btn-sm"
                  title="Re-run AI analysis with fresh data"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${(loadingMarket || refreshing) ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Analyzing...' : 'Re-run'}
                </button>
              )}
            </div>
            <div className="card-content">
              {(loadingMarket || refreshing) && !marketImpactNews.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-48 skeleton rounded-lg" />)}
                </div>
              ) : marketImpactNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketImpactNews.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedItem(item)}
                      className={`card-interactive border-l-4 ${getImpactBorderColor(item.impact_level)} p-5 text-left opacity-0 animate-fade-up animate-fill-forwards`}
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <span className="px-2 py-0.5 bg-secondary rounded text-foreground">{item.source}</span>
                            {item.published_date && <span>{item.published_date}</span>}
                            <span>#{item.rank}</span>
                          </div>
                          <h4 className="font-bold text-base leading-tight line-clamp-2">
                            {item.title}
                          </h4>
                        </div>
                        <div className="ml-3 flex-shrink-0">
                          <ImpactBadge level={item.impact_level} direction={item.impact_direction} />
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{item.why_it_matters}</p>

                      {/* Preview of trading insight */}
                      {item.trading_insight && (
                        <div className="text-xs text-primary/80 bg-primary/5 rounded px-2.5 py-1.5 mb-3 line-clamp-1">
                          <Target className="w-3 h-3 inline mr-1" />
                          {item.trading_insight}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {item.affected_companies?.slice(0, 3).map((company, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 text-[10px] border border-blue-100">
                              {company}
                            </span>
                          ))}
                          {(item.affected_companies?.length > 3) && (
                            <span className="text-[10px] text-muted-foreground">+{item.affected_companies.length - 3} more</span>
                          )}
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                /* Empty state — user must explicitly trigger */
                <div className="py-12 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                    <Newspaper className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Run Market Impact Analysis</h3>
                  <p className="text-muted-foreground max-w-lg mx-auto mb-6 text-sm leading-relaxed">
                    Click below to have Claude AI scan financial news from Bloomberg, Reuters, CNBC,
                    social media (Reddit, X), and SEC filings. It will cross-reference this with real-time stock data
                    from Yahoo Finance and surface the most impactful market events with actionable trading insights.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center text-xs text-muted-foreground mb-6">
                    {['Bloomberg', 'Reuters', 'CNBC', 'Yahoo Finance', 'Reddit', 'SEC Filings'].map(source => (
                      <span key={source} className="px-2.5 py-1 bg-secondary rounded-full">{source}</span>
                    ))}
                  </div>
                  <button
                    onClick={handleLoadMarket}
                    disabled={loadingMarket || refreshing}
                    className="btn btn-gradient inline-flex items-center justify-center rounded-md px-8 h-11"
                  >
                    {refreshing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Run AI Analysis
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-muted-foreground/60 mt-3">
                    Analysis typically takes 15-30 seconds. Results are cached for 24 hours.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Deep Dive Analysis Section ── */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title text-xl">Deep Dive Analysis</h3>
              <p className="card-description">
                Ask Claude to analyze any company, sector, or market trend.
                It searches the web, pulls stock data, and streams a professional research report.
              </p>
            </div>
            <div className="card-content space-y-4">
              <form onSubmit={handleAnalyze} className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Impact of interest rate hikes on tech stocks..."
                    className="input pl-9"
                    disabled={loadingAnalysis}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingAnalysis || !query.trim()}
                  className="btn btn-gradient inline-flex items-center justify-center rounded-md px-6"
                >
                  {loadingAnalysis ? (
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Zap className="w-4 h-4 mr-2" />
                  )}
                  Analyze
                </button>
              </form>

              {/* Suggested queries */}
              {!loadingAnalysis && !showAnalysisContainer && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground font-medium">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_QUERIES.map(q => (
                      <button
                        key={q}
                        onClick={() => setQuery(q)}
                        className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Data sources info (shown when idle) */}
              {!loadingAnalysis && !showAnalysisContainer && !isError && (
                <div className="bg-muted/20 rounded-lg border p-4 mt-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">When you submit a query, Claude will:</p>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { icon: LineChart, text: 'Pull live stock data and market movers from Yahoo Finance' },
                      { icon: Globe, text: 'Search news, social media, and financial publications for relevant intelligence' },
                      { icon: Brain, text: 'Synthesize both into an actionable research report with citations' },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Icon className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multi-step progress indicator */}
              {loadingAnalysis && phase && phase !== 'done' && (
                <div className="p-5 rounded-lg border bg-card animate-fade-in">
                  <div className="flex items-center gap-0 mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`step-dot ${
                        phase === 'collecting' ? 'step-dot-active animate-pulse' :
                        ['synthesizing', 'cached', 'done'].includes(phase) ? 'step-dot-done' : 'step-dot-pending'
                      }`} />
                      <span className={`text-xs font-medium ${phase === 'collecting' ? 'text-primary' : ['synthesizing', 'cached', 'done'].includes(phase) ? 'text-green-600' : 'text-muted-foreground'}`}>
                        Collecting
                      </span>
                    </div>
                    <div className={`flex-1 h-px mx-3 transition-colors duration-500 ${['synthesizing', 'cached', 'done'].includes(phase) ? 'bg-green-500' : 'bg-border'}`} />
                    <div className="flex items-center gap-2">
                      <div className={`step-dot ${
                        phase === 'synthesizing' || phase === 'cached' ? 'step-dot-active animate-pulse' :
                        phase === 'done' ? 'step-dot-done' : 'step-dot-pending'
                      }`} />
                      <span className={`text-xs font-medium ${phase === 'synthesizing' || phase === 'cached' ? 'text-primary' : phase === 'done' ? 'text-green-600' : 'text-muted-foreground'}`}>
                        Synthesizing
                      </span>
                    </div>
                    <div className={`flex-1 h-px mx-3 transition-colors duration-500 ${phase === 'done' ? 'bg-green-500' : 'bg-border'}`} />
                    <div className="flex items-center gap-2">
                      <div className={`step-dot ${phase === 'done' ? 'step-dot-done' : 'step-dot-pending'}`} />
                      <span className="text-xs font-medium text-muted-foreground">Complete</span>
                    </div>
                  </div>
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-1/4 bg-primary rounded-full animate-progress-indeterminate" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">{getPhaseMessage()}</p>
                  {phase === 'collecting' && (
                    <p className="text-xs text-muted-foreground/60 mt-1">Pulling stock quotes from Yahoo Finance and searching financial news, social media, and SEC filings...</p>
                  )}
                </div>
              )}

              {/* Error state */}
              {isError && (
                <div className="flex items-center gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5 animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{analysisError || 'Analysis failed. Please try again.'}</p>
                </div>
              )}

              {/* Unified analysis container */}
              {showAnalysisContainer && (
                <div className="rounded-lg border bg-card overflow-hidden animate-fade-in">
                  <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded">
                        <TrendingUp className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm">
                        {showFinalResult ? 'Analysis Results' : 'Streaming Analysis'}
                      </span>
                      {showFinalResult ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <span className="text-xs text-primary animate-pulse font-medium">Live</span>
                      )}
                    </div>
                    {showFinalResult && (
                      <button onClick={() => { resetAnalysis(); refetchHistory(); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted">
                        Clear Results
                      </button>
                    )}
                  </div>
                  {showStreaming && streamingText && <StreamingTextRenderer text={streamingText} />}
                  {showFinalResult && <AnalysisRenderer text={analysisData.analysis} />}
                </div>
              )}
            </div>
          </div>

          {/* ── Search History ── */}
          {searchHistory.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title text-xl flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Searches
                </h3>
                <p className="card-description">Your recent deep dive analyses — click to re-run</p>
              </div>
              <div className="card-content">
                <div className="space-y-1">
                  {searchHistory.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleHistoryClick(item.query)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-all text-left group"
                      disabled={loadingAnalysis}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{item.query}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <ImpactCardDetail item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}
