import { Link } from 'react-router-dom';
import {
  TrendingUp, Zap, Shield, BarChart3, Newspaper, Search, Globe, Database,
  ArrowRight, CheckCircle, Activity, Brain, LineChart, Users, Lock, Sparkles
} from 'lucide-react';

const DATA_SOURCES = [
  {
    icon: LineChart,
    title: 'Yahoo Finance',
    description: 'Real-time stock quotes, intraday charts, market movers (gainers, losers, most active), company fundamentals, and historical data for thousands of tickers.',
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Globe,
    title: 'Web Intelligence',
    description: 'Live scanning of financial news (Bloomberg, Reuters, CNBC), social media sentiment (Reddit, X/Twitter), SEC filings, insider trading reports, and geopolitical events.',
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Brain,
    title: 'Claude AI Synthesis',
    description: 'Anthropic\'s Claude AI connects the dots — linking price movements to news catalysts, identifying market disconnects, and producing actionable trading insights with cited sources.',
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
  },
];

const FEATURES = [
  {
    icon: Newspaper,
    title: 'Market Impact Monitor',
    description: 'AI continuously scans news, social media, and market data to surface the highest-impact events. Each alert includes impact level, affected companies, trading insights, and source citations.',
    details: ['Impact-rated news events (High / Medium / Low)', 'Affected companies and sectors identified', 'Actionable trading insights with entry/exit reasoning', 'Source URLs for independent verification'],
  },
  {
    icon: Search,
    title: 'Deep Dive Analysis',
    description: 'Ask any question about markets, companies, or trends. Claude researches financial news, stock data, and web intelligence in parallel, then streams a comprehensive analysis in real-time.',
    details: ['Real-time streaming as AI writes the analysis', 'Multi-phase pipeline: data collection, web research, synthesis', 'Cites specific data points and sources', 'Search history for revisiting past analyses'],
  },
  {
    icon: BarChart3,
    title: 'Real-time Watchlist & Charts',
    description: 'Track your favorite stocks with live quotes, interactive intraday charts, company fundamentals, and market mover rankings — all updated in real-time.',
    details: ['Live stock quotes with price, change, volume', 'Interactive intraday charts with interval selection', 'Company fundamentals (P/E, market cap, sector)', 'Top gainers, losers, and most active stocks'],
  },
];

const STEPS = [
  { step: '1', title: 'Create Your Account', description: 'Sign up in seconds with email or Google. Verify your email to get started.', icon: Users },
  { step: '2', title: 'Explore Market Intelligence', description: 'Browse AI-detected market impact events, build your watchlist, and track real-time data.', icon: Activity },
  { step: '3', title: 'Ask AI Anything', description: 'Type any market question. Claude researches, analyzes, and streams a professional report with citations.', icon: Sparkles },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <TrendingUp className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight">Wise Trade</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn btn-ghost h-8 px-3 text-sm">Sign In</Link>
            <Link to="/signup" className="btn btn-primary h-8 px-4 text-sm">
              Get Started
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-card text-sm font-medium mb-6 animate-fade-up">
              <Sparkles className="h-4 w-4 text-primary" />
              Powered by Claude AI + Real-time Market Data
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight animate-fade-up" style={{ animationDelay: '100ms' }}>
              AI-Powered Trading
              <span className="block bg-gradient-to-r from-[hsl(221.2,83.2%,53.3%)] to-[hsl(250,83%,60%)] bg-clip-text text-transparent">
                Intelligence Platform
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-up animate-fill-forwards" style={{ animationDelay: '200ms' }}>
              Wise Trade aggregates real-time stock data from Yahoo Finance, scans the web for market-moving news, and uses Claude AI to synthesize actionable trading insights — all in one platform.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-fade-up animate-fill-forwards" style={{ animationDelay: '300ms' }}>
              <Link to="/signup" className="btn btn-gradient inline-flex items-center justify-center rounded-md text-base h-12 px-8">
                Start Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <a href="#features" className="btn btn-outline h-12 px-8 text-base">
                See How It Works
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-muted-foreground opacity-0 animate-fade-up animate-fill-forwards" style={{ animationDelay: '400ms' }}>
              {[
                { icon: Shield, text: 'Enterprise-grade security' },
                { icon: Zap, text: 'Real-time data' },
                { icon: Brain, text: 'Claude AI analysis' },
                { icon: Lock, text: 'SOC 2 compliant APIs' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section className="py-20 sm:py-24 bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">Data Sources</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Where Your Intelligence Comes From</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Three powerful data streams converge into one unified analysis.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {DATA_SOURCES.map(({ icon: Icon, title, description, color, bg }, index) => (
              <div key={title} className="card p-8 text-center hover:shadow-md transition-shadow opacity-0 animate-fade-up animate-fill-forwards" style={{ animationDelay: `${index * 100}ms` }}>
                <div className={`inline-flex items-center justify-center w-14 h-14 ${bg} rounded-xl mb-5`}>
                  <Icon className={`h-7 w-7 ${color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">From Question to Insight in Seconds</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-border" />

            {STEPS.map(({ step, title, description, icon: Icon }, index) => (
              <div key={step} className="relative text-center opacity-0 animate-fade-up animate-fill-forwards" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white text-lg font-bold mb-5 relative z-10 shadow-md">
                  {step}
                </div>
                <div className="bg-card border rounded-xl p-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24 bg-muted/30 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything You Need for Smarter Trading</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-grade tools that were previously only available to institutional traders.
            </p>
          </div>

          <div className="space-y-16">
            {FEATURES.map(({ icon: Icon, title, description, details }, index) => (
              <div key={title} className={`grid md:grid-cols-2 gap-10 items-center ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-card text-xs font-medium mb-4">
                    <Icon className="h-3.5 w-3.5 text-primary" />
                    Feature
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed mb-6">{description}</p>
                  <ul className="space-y-3">
                    {details.map((detail) => (
                      <li key={detail} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                  <div className="bg-gradient-to-br from-muted/50 to-muted rounded-xl border p-6 shadow-inner">
                    {index === 0 && (
                      /* Market Impact Monitor Preview */
                      <div className="space-y-3">
                        {[
                          { level: 'high', title: 'Fed Holds Rates Steady', dir: 'positive', source: 'Reuters' },
                          { level: 'medium', title: 'NVDA Earnings Beat Expectations', dir: 'positive', source: 'Bloomberg' },
                          { level: 'high', title: 'China Trade Tensions Escalate', dir: 'negative', source: 'CNBC' },
                        ].map((item, i) => (
                          <div key={i} className={`bg-card border rounded-lg p-4 border-l-4 ${item.level === 'high' ? 'border-l-destructive' : 'border-l-amber-400'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-sm">{item.title}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${item.level === 'high' ? 'bg-destructive/10 text-destructive' : 'bg-amber-50 text-amber-700'}`}>{item.level}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{item.source}</span>
                              <span>&#183;</span>
                              <span className={item.dir === 'positive' ? 'text-green-600' : 'text-destructive'}>{item.dir === 'positive' ? 'Bullish' : 'Bearish'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {index === 1 && (
                      /* Deep Dive Preview */
                      <div className="space-y-3">
                        <div className="bg-card border rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Impact of AI chip demand on semiconductor stocks...</span>
                          </div>
                        </div>
                        <div className="bg-card border rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="step-dot step-dot-done" />
                            <span className="text-xs text-green-600">Collecting</span>
                            <div className="flex-1 h-px bg-green-500" />
                            <div className="step-dot step-dot-active animate-pulse" />
                            <span className="text-xs text-primary">Synthesizing</span>
                            <div className="flex-1 h-px bg-border" />
                            <div className="step-dot step-dot-pending" />
                            <span className="text-xs text-muted-foreground">Done</span>
                          </div>
                          <div className="text-sm text-foreground/70 leading-relaxed">
                            <span>The semiconductor sector is experiencing a structural shift driven by AI compute demand. NVDA's data center revenue grew 427% YoY...</span>
                            <span className="inline-block w-0.5 h-3.5 bg-primary animate-typewriter-blink ml-0.5 align-middle" />
                          </div>
                        </div>
                      </div>
                    )}
                    {index === 2 && (
                      /* Watchlist Preview */
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { sym: 'AAPL', price: '198.45', change: '+1.23%', positive: true },
                          { sym: 'NVDA', price: '875.30', change: '+3.41%', positive: true },
                          { sym: 'TSLA', price: '241.67', change: '-2.15%', positive: false },
                          { sym: 'MSFT', price: '415.22', change: '+0.87%', positive: true },
                        ].map((stock) => (
                          <div key={stock.sym} className="bg-card border rounded-lg p-3">
                            <div className="font-bold text-sm">{stock.sym}</div>
                            <div className="text-lg font-bold tabular-nums mt-1">${stock.price}</div>
                            <div className={`text-xs font-medium mt-1 ${stock.positive ? 'text-green-600' : 'text-destructive'}`}>
                              {stock.change}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-purple-500/5 rounded-2xl border p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl mb-5">
              <Database className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Programmatic API Access</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Access all market intelligence programmatically. Generate API keys, integrate with your trading systems, and automate your research pipeline.
            </p>
            <div className="flex flex-wrap gap-3 justify-center text-sm">
              {['GET /api/v1/ai/market-impact', 'GET /api/v1/ai/analyze-news', 'GET /api/v1/stocks/quote'].map((endpoint) => (
                <code key={endpoint} className="px-3 py-1.5 bg-card border rounded-md font-mono text-xs">{endpoint}</code>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-[hsl(221.2,83.2%,53.3%)] to-[hsl(250,83%,60%)] relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-white/5 rounded-full" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Start Making Smarter Trading Decisions
          </h2>
          <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto">
            Join traders who use AI-powered intelligence to stay ahead of the market. Free to get started.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup" className="btn bg-white text-primary hover:bg-white/90 h-12 px-8 text-base font-semibold inline-flex items-center justify-center rounded-md shadow-lg">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/login" className="btn border-white/30 text-white hover:bg-white/10 h-12 px-8 text-base inline-flex items-center justify-center rounded-md border">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-primary to-primary/70 p-1 rounded-md">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold">Wise Trade</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Market data provided by Yahoo Finance. AI analysis powered by Anthropic Claude.
          </p>
        </div>
      </footer>
    </div>
  );
}
