import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StockCard from '../components/StockCard';
import StockSearch from '../components/StockSearch';
import { useWatchlist, useMarketMovers } from '../hooks/useStocks';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, TrendingDown, Activity, RefreshCw, BarChart3, Eye } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState(['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']);

  const {
    data: stockData = [],
    isLoading,
    isError,
    refetch: refetchStocks
  } = useWatchlist(watchlist);

  const {
    data: marketMovers,
    isLoading: loadingMovers,
    refetch: refetchMovers
  } = useMarketMovers();

  const handleAddStock = (symbol) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
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
    if (!item.error) {
      stockDataMap[watchlist[index]] = item;
    }
  });

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent rounded-xl p-6 border border-primary/10 animate-fade-in">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{greeting}, {user?.first_name || user?.username || 'Trader'}</h2>
            <p className="text-muted-foreground text-sm mt-1">{dateStr}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center px-4 py-2 bg-card rounded-lg border shadow-sm">
              <div className="text-2xl font-bold tabular-nums">{watchlist.length}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Watchlist</div>
            </div>
            <div className="text-center px-4 py-2 bg-card rounded-lg border shadow-sm">
              <div className="text-2xl font-bold tabular-nums text-green-600">{marketMovers?.top_gainers?.length || 0}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Gainers</div>
            </div>
            <div className="text-center px-4 py-2 bg-card rounded-lg border shadow-sm">
              <div className="text-2xl font-bold tabular-nums text-destructive">{marketMovers?.top_losers?.length || 0}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Losers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 justify-end">
        <div className="w-full sm:w-64">
          <StockSearch onSelect={handleAddStock} />
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading || loadingMovers}
          className="btn btn-outline whitespace-nowrap"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Market Movers Section */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Gainers */}
        <div className="card border-l-4 border-l-green-500 overflow-hidden">
          <div className="card-header pb-2">
            <div className="text-sm font-medium text-muted-foreground">Top Gainers</div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Market Leaders
            </h3>
          </div>
          <div className="card-content">
            <div className="space-y-1">
              {loadingMovers ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-10 skeleton" />)}
                </div>
              ) : (
                marketMovers?.top_gainers?.slice(0, 5).map((stock, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(`/stock/${stock.ticker}`)}
                    className="flex items-center justify-between w-full px-2 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-4 tabular-nums">#{index + 1}</span>
                      <div className="font-semibold text-sm">{stock.ticker}</div>
                      <div className="text-xs text-muted-foreground hidden xl:block tabular-nums">${stock.price}</div>
                    </div>
                    <div className="text-xs font-medium text-green-600 bg-green-500/10 px-2 py-1 rounded tabular-nums">
                      +{parseFloat(stock.change_percentage).toFixed(2)}%
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Losers */}
        <div className="card border-l-4 border-l-destructive overflow-hidden">
          <div className="card-header pb-2">
            <div className="text-sm font-medium text-muted-foreground">Top Losers</div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Market Laggards
            </h3>
          </div>
          <div className="card-content">
            <div className="space-y-1">
              {loadingMovers ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-10 skeleton" />)}
                </div>
              ) : (
                marketMovers?.top_losers?.slice(0, 5).map((stock, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(`/stock/${stock.ticker}`)}
                    className="flex items-center justify-between w-full px-2 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-4 tabular-nums">#{index + 1}</span>
                      <div className="font-semibold text-sm">{stock.ticker}</div>
                      <div className="text-xs text-muted-foreground hidden xl:block tabular-nums">${stock.price}</div>
                    </div>
                    <div className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-1 rounded tabular-nums">
                      {parseFloat(stock.change_percentage).toFixed(2)}%
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Active */}
        <div className="card border-l-4 border-l-blue-500 overflow-hidden">
          <div className="card-header pb-2">
            <div className="text-sm font-medium text-muted-foreground">Most Active</div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              High Volume
            </h3>
          </div>
          <div className="card-content">
            <div className="space-y-1">
              {loadingMovers ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => <div key={i} className="h-10 skeleton" />)}
                </div>
              ) : (
                marketMovers?.most_actively_traded?.slice(0, 5).map((stock, index) => (
                  <button
                    key={index}
                    onClick={() => navigate(`/stock/${stock.ticker}`)}
                    className="flex items-center justify-between w-full px-2 py-2 rounded-md hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-4 tabular-nums">#{index + 1}</span>
                      <div className="font-semibold text-sm">{stock.ticker}</div>
                    </div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {parseInt(stock.volume).toLocaleString()}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Watchlist Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Eye className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="text-xl font-semibold tracking-tight">
              Your Watchlist
              <span className="ml-2 text-xs font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full align-middle">
                {watchlist.length} stocks
              </span>
            </h3>
            <p className="text-sm text-muted-foreground">Track your favorite stocks in real-time</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 skeleton rounded-lg"></div>
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center text-destructive">
            <p className="font-medium">Error loading watchlist data</p>
            <button onClick={refetchStocks} className="btn btn-outline border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground mt-4">
              Retry
            </button>
          </div>
        ) : watchlist.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg bg-gradient-to-b from-muted/20 to-transparent">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">Your watchlist is empty</h3>
            <p className="text-muted-foreground mb-6">Search for stocks above to start tracking them.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlist.map((symbol, index) => (
              <div
                key={symbol}
                className="group relative opacity-0 animate-fade-up animate-fill-forwards"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <button
                  onClick={() => handleRemoveStock(symbol)}
                  className="absolute -top-2 -right-2 z-10 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-destructive/90"
                  title="Remove from watchlist"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <div className="h-full">
                  <StockCard
                    symbol={symbol}
                    data={stockDataMap[symbol]}
                    onClick={() => navigate(`/stock/${symbol}`)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
