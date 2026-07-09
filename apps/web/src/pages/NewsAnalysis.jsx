import { useState, useCallback } from 'react';
import { Newspaper, TrendingUp, RefreshCw, Search, AlertCircle, ArrowUp, ArrowDown, Minus, Building2, Lightbulb, CheckCircle, Target, Zap, Lock, LogIn, ChevronRight, Clock, History, Sparkles } from 'lucide-react';
import { useMarketImpactNews, useNewsAnalysis } from '../hooks/useNews';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { getLogoProps } from '../utils/helpers';
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

const SUGGESTED_QUERIES = [
  'Impact of Fed rate decisions on tech stocks',
  'AI sector outlook this quarter',
  'Earnings season preview and expectations',
  'Energy sector trends and oil prices',
];

export default function NewsAnalysis() {
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { isAuthenticated } = useAuth();

  const {
    data: marketImpactData,
    isLoading: loadingMarket,
    forceRefresh: forceRefreshMarket,
  } = useMarketImpactNews(10, { enabled: isAuthenticated });

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

  const handleHistoryClick = (historyQuery) => {
    setQuery(historyQuery);
    analyze(historyQuery);
  };

  const getImpactBadgeStyles = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getImpactBorderColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'border-l-destructive';
      case 'medium': return 'border-l-amber-400';
      case 'low': return 'border-l-blue-400';
      default: return 'border-l-border';
    }
  };

  const getImpactDirectionIcon = (direction) => {
    switch (direction?.toLowerCase()) {
      case 'positive': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'negative': return <ArrowDown className="w-4 h-4 text-destructive" />;
      case 'neutral': return <Minus className="w-4 h-4 text-muted-foreground" />;
      default: return null;
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
        <div className="card border-dashed">
          <div className="card-content py-16 flex flex-col items-center text-center">
            <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-4 rounded-full mb-6">
              <Lock className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Sign in to access enterprise-grade market analysis and AI trading insights.
            </p>
            <div className="flex gap-4">
              <Link to="/login" className="btn btn-gradient px-8 inline-flex items-center justify-center rounded-md">Sign In</Link>
              <Link to="/signup" className="btn btn-outline px-8">Create Account</Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-4xl text-left">
              {[
                { icon: Target, title: 'Precise Impact Analysis', desc: 'Understand exactly how news affects specific sectors and companies.' },
                { icon: Zap, title: 'Real-time Processing', desc: 'Analysis generated in seconds using advanced LLMs.' },
                { icon: Lightbulb, title: 'Actionable Insights', desc: 'Clear trading signals and risk assessments.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="space-y-2">
                  <div className="bg-secondary w-10 h-10 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Market Impact Section */}
          <div className="card">
            <div className="card-header flex flex-row items-center justify-between">
              <div>
                <h3 className="card-title text-xl">Market Impact Monitor</h3>
                <p className="card-description">High-impact news events detected by AI (cached daily)</p>
              </div>
              <button
                onClick={handleRefreshMarket}
                disabled={loadingMarket || refreshing}
                className="btn btn-ghost btn-sm"
                title="Force refresh — re-runs AI analysis"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${(loadingMarket || refreshing) ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <div className="card-content">
              {loadingMarket ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => <div key={i} className="h-48 skeleton rounded-lg" />)}
                </div>
              ) : marketImpactNews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {marketImpactNews.map((item, index) => (
                    <div
                      key={index}
                      className={`card-interactive border-l-4 ${getImpactBorderColor(item.impact_level)} p-5 opacity-0 animate-fade-up animate-fill-forwards`}
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <span className="px-2 py-0.5 bg-secondary rounded text-foreground">{item.source}</span>
                            <span>Rank #{item.rank}</span>
                          </div>
                          <h4 className="font-bold text-base leading-tight line-clamp-2">
                            {item.title}
                          </h4>
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ml-3 flex-shrink-0 ${getImpactBadgeStyles(item.impact_level)}`}>
                          {getImpactDirectionIcon(item.impact_direction)}
                          {item.impact_level}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm text-muted-foreground line-clamp-3">
                          <span className="font-semibold text-foreground">Impact: </span>
                          {item.why_it_matters}
                        </div>

                        {(item.affected_companies?.length > 0 || item.affected_sectors?.length > 0) && (
                          <div className="flex flex-wrap gap-1.5">
                            {item.affected_companies?.slice(0, 3).map((company, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 text-xs border border-blue-100">
                                {company}
                              </span>
                            ))}
                            {item.affected_sectors?.slice(0, 2).map((sector, i) => (
                              <span key={i} className="inline-flex items-center px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs border">
                                {sector}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No high-impact news detected at this moment. Click Refresh to analyze.
                </div>
              )}
            </div>
          </div>

          {/* Custom Analysis Section */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title text-xl">Deep Dive Analysis</h3>
              <p className="card-description">Ask Claude to analyze specific companies, sectors, or market trends</p>
            </div>
            <div className="card-content space-y-4">
              <form onSubmit={handleAnalyze} className="flex gap-3">
                <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Impact of interest rate hikes on tech stocks..."
                    className="input pl-9 focus:ring-primary/50"
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
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUERIES.map(q => (
                    <button
                      key={q}
                      onClick={() => { setQuery(q); }}
                      className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Multi-step progress indicator */}
              {loadingAnalysis && phase && phase !== 'done' && (
                <div className="p-5 rounded-lg border bg-card animate-fade-in">
                  <div className="flex items-center gap-0 mb-4">
                    {/* Step 1: Collecting */}
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
                    {/* Step 2: Synthesizing */}
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
                    {/* Step 3: Complete */}
                    <div className="flex items-center gap-2">
                      <div className={`step-dot ${phase === 'done' ? 'step-dot-done' : 'step-dot-pending'}`} />
                      <span className="text-xs font-medium text-muted-foreground">Complete</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-1/4 bg-primary rounded-full animate-progress-indeterminate" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">{getPhaseMessage()}</p>
                  {phase === 'collecting' && (
                    <p className="text-xs text-muted-foreground/60 mt-1">Searching financial news, analyzing stock data, and scanning the web...</p>
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

              {/* Unified analysis container (streaming + final) */}
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

          {/* Search History Section */}
          {searchHistory.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title text-xl flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Recent Searches
                </h3>
                <p className="card-description">Your recent deep dive analyses</p>
              </div>
              <div className="card-content">
                <div className="space-y-1">
                  {searchHistory.map((item, index) => (
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
    </div>
  );
}
