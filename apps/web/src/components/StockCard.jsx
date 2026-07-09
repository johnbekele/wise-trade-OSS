import { TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getLogoProps } from '../utils/helpers';

export default function StockCard({ symbol, data, onClick }) {
  const quote = data?.data?.['Global Quote'] || {};
  const price = parseFloat(quote['05. price'] || 0);
  const change = parseFloat(quote['09. change'] || 0);
  const changePercent = quote['10. change percent'] || '0%';
  const isPositive = change >= 0;

  return (
    <div
      onClick={onClick}
      className="card-interactive group overflow-hidden"
    >
      <div className={`h-0.5 ${isPositive ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-red-400 to-red-600'}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden ring-1 ring-border group-hover:ring-primary/30 transition-all">
              <img
                {...getLogoProps(symbol)}
                className="w-full h-full object-contain p-1"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground">{symbol}</h3>
              <p className="text-sm text-muted-foreground">{quote['01. symbol']}</p>
            </div>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
            ${isPositive ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}
          >
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {changePercent}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-3xl font-bold tabular-nums">${price.toFixed(2)}</span>
            <span className={`text-lg font-medium tabular-nums ${isPositive ? 'text-green-600' : 'text-destructive'}`}>
              {isPositive ? '+' : ''}{change.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border text-sm">
            <div className="rounded p-2 hover:bg-muted/50 transition-colors">
              <p className="text-muted-foreground">High</p>
              <p className="font-medium tabular-nums">${parseFloat(quote['03. high'] || 0).toFixed(2)}</p>
            </div>
            <div className="rounded p-2 hover:bg-muted/50 transition-colors">
              <p className="text-muted-foreground">Low</p>
              <p className="font-medium tabular-nums">${parseFloat(quote['04. low'] || 0).toFixed(2)}</p>
            </div>
            <div className="rounded p-2 hover:bg-muted/50 transition-colors">
              <p className="text-muted-foreground">Volume</p>
              <p className="font-medium tabular-nums">{parseInt(quote['06. volume'] || 0).toLocaleString()}</p>
            </div>
            <div className="rounded p-2 hover:bg-muted/50 transition-colors">
              <p className="text-muted-foreground">Prev Close</p>
              <p className="font-medium tabular-nums">${parseFloat(quote['08. previous close'] || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
