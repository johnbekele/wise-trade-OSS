import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StockCard from '../components/StockCard';
import StockSearch from '../components/StockSearch';
import { useWatchlist, useMarketMovers } from '../hooks/useStocks';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Activity, RefreshCw, Eye, Sparkles, ArrowRight } from 'lucide-react';

function MarketMoverList({ title, icon: Icon, iconColor, items, loading, onItemClick, formatValue }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="divide-y">
        {loading ? (
          [1, 2, 3, 4, 5].map(i => <div key={i} className="h-11 skeleton mx-4 my-1.5 rounded" />)
        ) : (
          items?.slice(0, 5).map((stock, index) => (
            <button
              key={index}
              onClick={() => onItemClick(stock.ticker)}
              className="flex items-center justify-between w-full px-5 py-2.5 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4 tabular-nums">{index + 1}</span>
                <span className="text-sm font-medium">{stock.ticker}</span>
                {stock.price && (
                  <span className="text-xs text-muted-foreground tabular-nums">${stock.price}</span>
                )}
              </div>
              <span className="text-xs font-medium tabular-nums">{formatValue(stock)}</span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState(['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']);

  const { data: stockData = [], isLoading, isError, refetch: refetchStocks } = useWatchlist(watchlist);
  const { data: marketMovers, isLoading: loadingMovers, refetch: refetchMovers } = useMarketMovers();

  const handleAddStock = (symbol) => {
    if (!watchlist.includes(symbol)) setWatchlist([...watchlist, symbol]);
  };

  const handleRemoveStock = (symbol) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  const handleRefresh = () => {
    refetchStocks();
    refetchMovers();
  };

  const stockDataMap = {};
  stockData.forEach((item, index) => {
    if (!item.error) stockDataMap[watchlist[index]] = item;
  });

  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Markets Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{dateStr}</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading || loadingMovers}
          className="btn btn-outline h-9 px-3 text-sm"
        >
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${(isLoading || loadingMovers) ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* AI CTA Banner */}
      <Link
        to="/news"
        className="flex items-center gap-4 p-4 rounded-lg border bg-primary/[0.03] hover:bg-primary/[0.06] transition-colors group"
      >
        <Sparkles className="h-5 w-5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium">AI Trading Insights</span>
          <span className="text-sm text-muted-foreground ml-2 hidden sm:inline">
            — Market impact analysis, deep dive research, and real-time intelligence
          </span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
      </Link>

      {/* Market Movers */}
      <div className="grid gap-4 md:grid-cols-3">
        <MarketMoverList
          title="Top Gainers"
          icon={TrendingUp}
          iconColor="text-green-600"
          items={marketMovers?.top_gainers}
          loading={loadingMovers}
          onItemClick={(ticker) => navigate(`/stock/${ticker}`)}
          formatValue={(stock) => (
            <span className="text-green-600">+{parseFloat(stock.change_percentage).toFixed(2)}%</span>
          )}
        />
        <MarketMoverList
          title="Top Losers"
          icon={TrendingDown}
          iconColor="text-destructive"
          items={marketMovers?.top_losers}
          loading={loadingMovers}
          onItemClick={(ticker) => navigate(`/stock/${ticker}`)}
          formatValue={(stock) => (
            <span className="text-destructive">{parseFloat(stock.change_percentage).toFixed(2)}%</span>
          )}
        />
        <MarketMoverList
          title="Most Active"
          icon={Activity}
          iconColor="text-primary"
          items={marketMovers?.most_actively_traded}
          loading={loadingMovers}
          onItemClick={(ticker) => navigate(`/stock/${ticker}`)}
          formatValue={(stock) => (
            <span className="text-muted-foreground">{parseInt(stock.volume).toLocaleString()}</span>
          )}
        />
      </div>

      {/* Watchlist */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold tracking-tight">Watchlist</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{watchlist.length}</span>
          </div>
          <div className="w-56">
            <StockSearch onSelect={handleAddStock} />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-44 skeleton rounded-lg" />)}
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-8 text-center">
            <p className="text-sm text-destructive font-medium">Failed to load watchlist data</p>
            <button onClick={refetchStocks} className="btn btn-outline text-sm h-8 mt-3 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground">
              Retry
            </button>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-sm text-muted-foreground">Search for stocks above to start tracking them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watchlist.map((symbol, index) => (
              <div
                key={symbol}
                className="group relative opacity-0 animate-fade-up animate-fill-forwards"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <button
                  onClick={() => handleRemoveStock(symbol)}
                  className="absolute -top-1.5 -right-1.5 z-10 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm text-xs"
                  title="Remove"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <StockCard
                  symbol={symbol}
                  data={stockDataMap[symbol]}
                  onClick={() => navigate(`/stock/${symbol}`)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
