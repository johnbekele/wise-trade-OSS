import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, Activity } from 'lucide-react';
import { useStockDetail } from '../hooks/useStocks';
import { getLogoProps } from '../utils/helpers';

export default function StockDetail() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [interval, setInterval] = useState('5min');

  const {
    quote,
    intraday,
    overview,
    isLoading,
    isError,
    error,
    refetch
  } = useStockDetail(symbol, interval);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground text-lg">Loading {symbol} data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="card bg-destructive/10 border-destructive/20 text-center py-12 max-w-2xl mx-auto mt-8">
        <h2 className="text-2xl font-bold text-destructive mb-4">Error Loading Stock</h2>
        <p className="text-destructive/80 mb-6">{error?.message || 'Failed to load stock data'}</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => navigate(-1)} className="btn btn-secondary">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </button>
          <button onClick={refetch} className="btn btn-primary">
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const quoteData = quote?.data?.['Global Quote'] || {};
  const price = parseFloat(quoteData['05. price'] || 0);
  const change = parseFloat(quoteData['09. change'] || 0);
  const changePercent = quoteData['10. change percent'] || '0%';
  const isPositive = change >= 0;

  const timeSeries = intraday?.data?.['Time Series (5min)'] || intraday?.data?.['Time Series (15min)'] || {};
  const chartData = Object.entries(timeSeries)
    .slice(0, 50)
    .reverse()
    .map(([time, data]) => ({
      time: new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      price: parseFloat(data['4. close']),
      volume: parseInt(data['5. volume']),
    }));

  const overviewData = overview?.data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="btn btn-primary flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stock Header */}
      <div className="card overflow-hidden">
        <div className={`h-1 ${isPositive ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`} />
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center overflow-hidden ring-2 ring-border">
                <img
                  {...getLogoProps(symbol)}
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{symbol}</h1>
                <p className="text-muted-foreground">{overviewData.Name || quoteData['01. symbol']}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-lg font-medium
              ${isPositive ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}
            >
              {isPositive ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              {changePercent}
            </div>
          </div>

          <div className="mt-6 flex items-end justify-between">
            <div>
              <div className="text-4xl font-bold text-foreground tabular-nums">${price.toFixed(2)}</div>
              <div className={`text-lg font-medium mt-1 tabular-nums ${isPositive ? 'text-green-600' : 'text-destructive'}`}>
                {isPositive ? '+' : ''}{change.toFixed(2)} ({changePercent})
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>Last Updated</div>
              <div className="font-medium text-foreground">{quoteData['07. latest trading day']}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Intraday Chart</h2>
          <div className="flex gap-2">
            {['5min', '15min', '30min', '60min'].map((int) => (
              <button
                key={int}
                onClick={() => setInterval(int)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors
                  ${interval === int
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                  }`}
              >
                {int}
              </button>
            ))}
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="time"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                domain={['auto', 'auto']}
                tickFormatter={(value) => `$${value.toFixed(2)}`}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip
                formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
                labelFormatter={(label) => `Time: ${label}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No intraday data available
          </div>
        )}
      </div>

      {/* Stock Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Stats */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Key Statistics
          </h3>
          <div className="space-y-1">
            {[
              ['Open', parseFloat(quoteData['02. open'] || 0).toFixed(2), true],
              ['High', parseFloat(quoteData['03. high'] || 0).toFixed(2), true],
              ['Low', parseFloat(quoteData['04. low'] || 0).toFixed(2), true],
              ['Previous Close', parseFloat(quoteData['08. previous close'] || 0).toFixed(2), true],
              ['Volume', parseInt(quoteData['06. volume'] || 0).toLocaleString(), false],
            ].map(([label, value, isDollar], i) => (
              <div key={label} className={`flex justify-between py-2.5 ${i < 4 ? 'border-b border-border' : ''}`}>
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium tabular-nums">{isDollar ? `$${value}` : value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Company Info */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Company Information</h3>
          {overviewData.Name ? (
            <div className="space-y-1">
              {[
                ['Sector', overviewData.Sector || 'N/A'],
                ['Industry', overviewData.Industry || 'N/A'],
                ['Market Cap', overviewData.MarketCapitalization ? `$${(parseInt(overviewData.MarketCapitalization) / 1e9).toFixed(2)}B` : 'N/A'],
                ['P/E Ratio', parseFloat(overviewData.PERatio || 0).toFixed(2)],
                ['52 Week High', `$${parseFloat(overviewData['52WeekHigh'] || 0).toFixed(2)}`],
              ].map(([label, value], i) => (
                <div key={label} className={`flex justify-between py-2.5 ${i < 4 ? 'border-b border-border' : ''}`}>
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-8 text-center">Company information not available</p>
          )}
        </div>
      </div>

      {/* Description */}
      {overviewData.Description && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">About {symbol}</h3>
          <p className="text-muted-foreground leading-relaxed">{overviewData.Description}</p>
        </div>
      )}
    </div>
  );
}
