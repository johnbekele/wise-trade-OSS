import { useState } from 'react';
import {
  RefreshCw, Search, AlertCircle, CheckCircle, Zap, Lock,
  History, ChevronRight, TrendingUp, Globe, Brain, LineChart, Newspaper
} from 'lucide-react';
import { useMarketImpactNews, useNewsAnalysis } from '../hooks/useNews';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ImpactCard from '../components/ImpactCard';
import ImpactDetailModal from '../components/ImpactDetailModal';
import StreamingText from '../components/StreamingText';
import AnalysisRenderer from '../components/AnalysisRenderer';

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

  const handleHistoryClick = (historyQuery) => {
    setQuery(historyQuery);
    analyze(historyQuery);
  };

  const getPhaseMessage = () => {
    switch (phase) {
      case 'collecting': return 'Gathering market data and web intelligence...';
      case 'synthesizing': return 'Claude is synthesizing insights...';
      case 'cached': return 'Loading cached results...';
      default: return '';
    }
  };

  const showStreaming = phase === 'synthesizing' || phase === 'cached';
  const showFinalResult = phase === 'done' && analysisData;
  const showAnalysisContainer = showStreaming || showFinalResult;

  if (!isAuthenticated) {
    return <UnauthenticatedView />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Market impact analysis and deep dive research</p>
      </div>

      {/* Market Impact */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold">Market Impact Monitor</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              High-impact events detected by AI
              {marketImpactData?.fetched_at && (
                <span className="ml-1">
                  — updated {new Date(marketImpactData.fetched_at).toLocaleString()}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleRefreshMarket}
            disabled={loadingMarket || refreshing}
            className="btn btn-outline h-8 px-3 text-xs"
            title="Re-run AI analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${(loadingMarket || refreshing) ? 'animate-spin' : ''}`} />
            {refreshing ? 'Analyzing...' : 'Refresh'}
          </button>
        </div>

        {(loadingMarket || refreshing) && !marketImpactNews.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-44 skeleton rounded-lg" />)}
          </div>
        ) : marketImpactNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {marketImpactNews.map((item, index) => (
              <ImpactCard
                key={index}
                item={item}
                index={index}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/20 p-8 text-center">
            <Newspaper className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No market impact data yet. Click Refresh to run AI analysis.
            </p>
          </div>
        )}
      </section>

      {/* Deep Dive Analysis */}
      <section>
        <div className="mb-4">
          <h2 className="text-base font-semibold">Deep Dive Analysis</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ask Claude to analyze any company, sector, or market trend
          </p>
        </div>

        <div className="space-y-4">
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
              className="btn btn-primary h-10 px-5"
            >
              {loadingAnalysis ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-1.5" />
                  Analyze
                </>
              )}
            </button>
          </form>

          {/* Suggested queries */}
          {!loadingAnalysis && !showAnalysisContainer && (
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
          )}

          {/* Progress indicator */}
          {loadingAnalysis && phase && phase !== 'done' && (
            <div className="p-4 rounded-lg border bg-card animate-fade-in">
              <div className="flex items-center gap-0 mb-3">
                {[
                  { key: 'collecting', label: 'Collecting' },
                  { key: 'synthesizing', label: 'Synthesizing' },
                  { key: 'done', label: 'Complete' },
                ].map((step, i) => {
                  const isCurrent = phase === step.key || (step.key === 'synthesizing' && phase === 'cached');
                  const isDone = (step.key === 'collecting' && ['synthesizing', 'cached', 'done'].includes(phase))
                    || (step.key === 'synthesizing' && phase === 'done');
                  return (
                    <div key={step.key} className="flex items-center gap-2 flex-1">
                      {i > 0 && <div className={`flex-1 h-px transition-colors ${isDone || isCurrent ? 'bg-primary' : 'bg-border'}`} />}
                      <div className={`step-dot ${isCurrent ? 'step-dot-active animate-pulse' : isDone ? 'step-dot-done' : 'step-dot-pending'}`} />
                      <span className={`text-xs font-medium ${isCurrent ? 'text-primary' : isDone ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-1/4 bg-primary rounded-full animate-progress-indeterminate" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{getPhaseMessage()}</p>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex items-center gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
              <p className="text-sm text-destructive">{analysisError || 'Analysis failed. Please try again.'}</p>
            </div>
          )}

          {/* Analysis results */}
          {showAnalysisContainer && (
            <div className="rounded-lg border bg-card overflow-hidden animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {showFinalResult ? 'Analysis Results' : 'Streaming Analysis'}
                  </span>
                  {showFinalResult ? (
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <span className="text-xs text-primary animate-pulse font-medium">Live</span>
                  )}
                </div>
                {showFinalResult && (
                  <button onClick={() => { resetAnalysis(); refetchHistory(); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-muted">
                    Clear
                  </button>
                )}
              </div>
              {showStreaming && streamingText && <StreamingText text={streamingText} />}
              {showFinalResult && <AnalysisRenderer text={analysisData.analysis} />}
            </div>
          )}
        </div>
      </section>

      {/* Search History */}
      {searchHistory.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-base font-semibold">Recent Searches</h2>
          </div>
          <div className="card divide-y">
            {searchHistory.map((item) => (
              <button
                key={item.id}
                onClick={() => handleHistoryClick(item.query)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors text-left group"
                disabled={loadingAnalysis}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{item.query}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <ImpactDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  );
}

function UnauthenticatedView() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Market impact analysis and deep dive research</p>
      </div>

      <div className="card">
        <div className="p-8 sm:p-12 flex flex-col items-center text-center">
          <Lock className="w-10 h-10 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Sign in to access AI analysis</h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
            Claude AI scans financial news, analyzes stock data from Yahoo Finance,
            and delivers actionable trading insights in real-time.
          </p>
          <div className="flex gap-3 mb-10">
            <Link to="/login" className="btn btn-primary h-9 px-6 text-sm">Sign In</Link>
            <Link to="/signup" className="btn btn-outline h-9 px-6 text-sm">Create Account</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl text-left">
            {[
              { icon: Newspaper, title: 'Market Impact Monitor', desc: 'AI-rated news events with trading insights and citations.' },
              { icon: Search, title: 'Deep Dive Analysis', desc: 'Ask any question — get a streamed research report.' },
              { icon: Globe, title: 'Multi-Source Intelligence', desc: 'Yahoo Finance, Bloomberg, Reuters, Reddit, SEC filings.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="space-y-2">
                <Icon className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold mb-4">How it works</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: LineChart, title: 'Data Collection', desc: 'Live quotes and market data from Yahoo Finance.' },
            { icon: Globe, title: 'Web Intelligence', desc: 'News, social media, and SEC filing scans.' },
            { icon: Brain, title: 'AI Synthesis', desc: 'Combined into actionable research with citations.' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="bg-primary/10 p-2 rounded-lg flex-shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-medium">{title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
