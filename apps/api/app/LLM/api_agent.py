from typing import Optional, Dict, Any, List, Generator
import json
import re
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor

from anthropic import Anthropic
from app.core.config import settings
from app.services.yahoo_finance_service import YahooFinanceService
from app.core import turso_db

# L1 in-memory cache (process-lifetime, in front of Turso)
_mem_cache: Dict[str, Any] = {}
_mem_cache_ts: Dict[str, datetime] = {}
_MEM_TTL = timedelta(minutes=10)

# ── Phase 1A: Stock data collector ──────────────────────────────────────────

STOCK_PATTERN_SYSTEM = """You are a quantitative market analyst. You will receive raw stock market data
(prices, volume, movers, chart data). Your job is to:

1. Identify price patterns and anomalies (unusual volume, gap ups/downs, breakouts)
2. Spot sector rotations or correlated moves across stocks
3. Flag any technical signals (momentum shifts, support/resistance levels)
4. Summarize the current market sentiment based on the data

Return a structured analysis in this format:
### Market Data Patterns
- Key observations from prices and volume
### Unusual Activity
- Stocks with abnormal moves or volume
### Sector Signals
- Which sectors are strong/weak
### Technical Flags
- Notable patterns or levels

Be data-driven. Reference specific numbers."""

# ── Phase 1B: Web intelligence collector ────────────────────────────────────

WEB_INTEL_SYSTEM = """You are a financial intelligence researcher. Your job is to cast a WIDE net
across the internet to find everything that could move markets. Search for:

1. **Breaking financial news** - earnings, mergers, FDA approvals, lawsuits, bankruptcies
2. **Economic indicators** - Fed decisions, jobs data, inflation, GDP, housing
3. **Geopolitical events** - trade wars, sanctions, conflicts, elections, regulations
4. **Social media & retail sentiment** - trending stocks on Reddit/X/StockTwits, viral posts, meme stocks
5. **Insider activity** - large insider buys/sells, institutional filings, hedge fund moves
6. **Global markets** - how Asia/Europe traded, currency moves, commodity prices

Search MULTIPLE times to cover different angles. Be thorough.

Return your findings organized by category with sources cited."""

# ── Phase 2: Synthesis agent ───────────────────────────────────────────────

SYNTHESIS_SYSTEM = """You are a senior portfolio strategist at a top hedge fund. You have received two
research briefs from your team:

1. **MARKET DATA ANALYSIS** — patterns from real stock price/volume data
2. **WEB INTELLIGENCE REPORT** — breaking news, social media, geopolitical events

Your job is to SYNTHESIZE both into a single actionable research report. You must:

1. **Connect the dots** — link price movements to news catalysts (e.g., "NVDA up 4% on volume 2x average —
   likely driven by the new AI chip announcement found in web intel")
2. **Identify disconnects** — where market price hasn't yet reacted to news (opportunity signals)
3. **Assess market regime** — risk-on vs risk-off, sector rotation themes
4. **Rate conviction** — high/medium/low confidence for each insight

IMPORTANT: Format your response using markdown:
### 1. Market Regime & Sentiment
### 2. Top Market-Moving Events (with price impact)
### 3. Pattern-News Connections
### 4. Potential Disconnects & Opportunities
### 5. Risk Factors to Watch
### 6. Actionable Trading Insights

Be specific. Cite data points and sources. This is for professional traders."""

MARKET_IMPACT_SYNTHESIS_SYSTEM = """You are a senior portfolio strategist. You received two research briefs:

1. **MARKET DATA ANALYSIS** — stock price/volume patterns
2. **WEB INTELLIGENCE REPORT** — news, social media, geopolitical events

Synthesize into a JSON object with this EXACT structure:

{{"news_items": [{{"rank": 1, "title": "Event/headline", "impact_level": "high|medium|low", "impact_direction": "positive|negative|neutral", "why_it_matters": "Connect the news to actual market data - cite price moves, volume. Be detailed and thorough.", "affected_sectors": ["sector1"], "affected_companies": ["TICKER1"], "trading_insight": "Specific actionable insight with entry/exit reasoning", "source": "source name (e.g. Bloomberg, Reuters, CNBC)", "source_url": "https://full-url-to-the-original-article-or-source", "data_signal": "Supporting market data pattern with specific numbers", "published_date": "YYYY-MM-DD or approximate date"}}]}}

CRITICAL RULES:
1. Return ONLY valid JSON. Connect every news item to observable market data where possible.
2. For source_url: include the ACTUAL URL from your web search results. If no exact URL, use the publication's homepage (e.g. https://www.reuters.com).
3. For published_date: use the article's date or today's date if breaking news.
4. For why_it_matters: be DETAILED — explain the full chain of cause and effect, cite specific data points.
5. For trading_insight: provide specific, actionable advice with reasoning."""


class APIAgent:
    def __init__(self):
        self.client = Anthropic(api_key=settings.CLAUDE_API_KEY)
        self.model = settings.CLAUDE_MODEL
        self.web_search_tool = {"type": "web_search_20250305", "name": "web_search", "max_uses": 5}
        self.yahoo = YahooFinanceService()
        self.executor = ThreadPoolExecutor(max_workers=2)

    # ── Data collectors (Phase 1 — run in parallel) ─────────────────────────

    def _collect_stock_data(self, query: str) -> str:
        """Phase 1A: Gather raw stock market data from Yahoo Finance."""
        data = {}

        symbols = self._extract_symbols(query)
        top_symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "NVDA", "META"]

        for sym in symbols[:5]:
            data[f"quote_{sym}"] = self.yahoo.get_quote(sym)

        data["market_movers"] = self.yahoo.get_market_movers()

        for sym in top_symbols[:5]:
            if sym not in symbols:
                data[f"quote_{sym}"] = self.yahoo.get_quote(sym)

        data_summary = json.dumps(data, indent=2, default=str)

        response = self.client.messages.create(
            model=self.model,
            max_tokens=1500,
            temperature=0.3,
            system=STOCK_PATTERN_SYSTEM,
            messages=[{
                "role": "user",
                "content": f"Analyze this market data for patterns related to: {query}\n\n{data_summary}"
            }],
        )

        return self._extract_text(response)

    def _collect_web_intel(self, query: str) -> str:
        """Phase 1B: Search the web broadly for market-moving intelligence."""
        response = self.client.messages.create(
            model=self.model,
            max_tokens=2000,
            temperature=0.4,
            system=WEB_INTEL_SYSTEM,
            tools=[{"type": "web_search_20250305", "name": "web_search", "max_uses": 8}],
            messages=[{
                "role": "user",
                "content": (
                    f"Research everything happening right now that could affect: {query}\n\n"
                    "Search for:\n"
                    "1. Latest financial news and earnings\n"
                    "2. Reddit WallStreetBets and X/Twitter trending stocks\n"
                    "3. Economic data releases today\n"
                    "4. Geopolitical events affecting markets\n"
                    "5. Insider trading activity and institutional moves\n"
                    "6. Global market performance (Asia, Europe)\n"
                    "Be thorough — search multiple times for different angles."
                )
            }],
        )

        return self._extract_text(response)

    # ── Synthesis (Phase 2) ────────────────────────────────────────────────

    def _synthesize(self, query: str, stock_data: str, web_intel: str, system: str, max_tokens: int = 3000) -> str:
        """Phase 2: Combine stock patterns + web intelligence into final analysis."""
        response = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            temperature=0.5,
            system=system,
            messages=[{
                "role": "user",
                "content": (
                    f"## Query: {query}\n\n"
                    f"## MARKET DATA ANALYSIS (from live stock data)\n{stock_data}\n\n"
                    f"## WEB INTELLIGENCE REPORT (from internet research)\n{web_intel}\n\n"
                    "Now synthesize both into your final analysis."
                )
            }],
        )

        return self._extract_text(response)

    # ── Public API ──────────────────────────────────────────────────────────

    def analyze_market_news(self, query: str) -> str:
        """Full parallel pipeline: stock data + web search -> synthesis."""
        cache_key = f"analyze_{query.lower().strip()}"

        # L1: in-memory
        if cache_key in _mem_cache and datetime.now() < _mem_cache_ts.get(cache_key, datetime.min):
            return _mem_cache[cache_key]

        # L2: Turso persistent cache
        try:
            cached = turso_db.get_cache(cache_key)
            if cached is not None:
                _mem_cache[cache_key] = cached
                _mem_cache_ts[cache_key] = datetime.now() + _MEM_TTL
                return cached
        except Exception:
            pass

        try:
            future_stock = self.executor.submit(self._collect_stock_data, query)
            future_web = self.executor.submit(self._collect_web_intel, query)

            stock_data = future_stock.result(timeout=60)
            web_intel = future_web.result(timeout=90)

            analysis = self._synthesize(query, stock_data, web_intel, SYNTHESIS_SYSTEM, max_tokens=3000)

            if not analysis or len(analysis.strip()) == 0:
                return "No analysis could be generated. Please try a different query."

            # Store in both caches
            _mem_cache[cache_key] = analysis
            _mem_cache_ts[cache_key] = datetime.now() + _MEM_TTL
            try:
                turso_db.set_cache(cache_key, analysis, query, "deep_dive", ttl_hours=24)
            except Exception:
                pass

            return analysis
        except Exception as e:
            return f"Error during parallel analysis: {str(e)[:200]}"

    def analyze_market_news_stream(self, query: str) -> Generator[Dict[str, Any], None, None]:
        """Streaming version: yields SSE events as analysis progresses."""
        cache_key = f"analyze_{query.lower().strip()}"

        # Check caches first — if cached, stream the full result immediately
        cached = None
        if cache_key in _mem_cache and datetime.now() < _mem_cache_ts.get(cache_key, datetime.min):
            cached = _mem_cache[cache_key]
        else:
            try:
                cached = turso_db.get_cache(cache_key)
            except Exception:
                pass

        if cached is not None:
            yield {"event": "status", "data": {"phase": "cached"}}
            yield {"event": "delta", "data": {"text": cached}}
            yield {"event": "done", "data": {"full_text": cached}}
            return

        # Phase 1: Parallel data collection
        yield {"event": "status", "data": {"phase": "collecting", "message": "Gathering market data and web intelligence..."}}

        try:
            future_stock = self.executor.submit(self._collect_stock_data, query)
            future_web = self.executor.submit(self._collect_web_intel, query)

            stock_data = future_stock.result(timeout=60)
            web_intel = future_web.result(timeout=90)
        except Exception as e:
            yield {"event": "error", "data": {"message": f"Data collection failed: {str(e)[:200]}"}}
            return

        # Phase 2: Streaming synthesis
        yield {"event": "status", "data": {"phase": "synthesizing", "message": "Synthesizing insights..."}}

        full_text = ""
        try:
            with self.client.messages.stream(
                model=self.model,
                max_tokens=3000,
                temperature=0.5,
                system=SYNTHESIS_SYSTEM,
                messages=[{
                    "role": "user",
                    "content": (
                        f"## Query: {query}\n\n"
                        f"## MARKET DATA ANALYSIS (from live stock data)\n{stock_data}\n\n"
                        f"## WEB INTELLIGENCE REPORT (from internet research)\n{web_intel}\n\n"
                        "Now synthesize both into your final analysis."
                    )
                }],
            ) as stream:
                for text in stream.text_stream:
                    full_text += text
                    yield {"event": "delta", "data": {"text": text}}
        except Exception as e:
            yield {"event": "error", "data": {"message": f"Synthesis failed: {str(e)[:200]}"}}
            return

        yield {"event": "done", "data": {"full_text": full_text}}

        # Cache the result
        _mem_cache[cache_key] = full_text
        _mem_cache_ts[cache_key] = datetime.now() + _MEM_TTL
        try:
            turso_db.set_cache(cache_key, full_text, query, "deep_dive", ttl_hours=24)
        except Exception:
            pass

    def find_market_impact_news(self, limit: int = 10, force_refresh: bool = False) -> dict:
        """Full parallel pipeline for structured market impact data."""
        cache_key = f"market_impact_{limit}"

        if not force_refresh:
            # L1: in-memory
            if cache_key in _mem_cache and datetime.now() < _mem_cache_ts.get(cache_key, datetime.min):
                return _mem_cache[cache_key]

            # L2: Turso persistent cache (24h TTL)
            try:
                cached = turso_db.get_cache(cache_key)
                if cached is not None:
                    result = json.loads(cached)
                    _mem_cache[cache_key] = result
                    _mem_cache_ts[cache_key] = datetime.now() + _MEM_TTL
                    return result
            except Exception:
                pass

        try:
            query = "top market-moving financial news today"

            future_stock = self.executor.submit(self._collect_stock_data, query)
            future_web = self.executor.submit(self._collect_web_intel, query)

            stock_data = future_stock.result(timeout=60)
            web_intel = future_web.result(timeout=90)

            system = MARKET_IMPACT_SYNTHESIS_SYSTEM.replace("{limit}", str(limit))
            response = self._synthesize(
                f"Find the top {limit} most impactful market events right now. Keep each field concise (under 150 chars).",
                stock_data, web_intel, system, max_tokens=4096
            )

            if not response:
                return {"success": False, "message": "No response from AI", "news_items": []}

            result = self._parse_impact_json(response, limit)

            # Store in both caches
            _mem_cache[cache_key] = result
            _mem_cache_ts[cache_key] = datetime.now() + _MEM_TTL
            try:
                turso_db.set_cache(cache_key, result, "market_impact", "market_impact", ttl_hours=24)
            except Exception:
                pass

            return result
        except Exception as e:
            return {"success": False, "message": f"Error: {str(e)[:200]}", "news_items": []}

    # ── Helpers ──────────────────────────────────────────────────────────────

    def _extract_text(self, response) -> str:
        """Extract text blocks from an Anthropic API response."""
        parts = []
        for block in response.content:
            if block.type == "text":
                parts.append(block.text)
        return "\n".join(parts) if parts else ""

    def _extract_symbols(self, query: str) -> list:
        """Extract stock ticker symbols from a query string."""
        tickers = re.findall(r'\b([A-Z]{1,5})\b', query)
        name_map = {
            "apple": "AAPL", "google": "GOOGL", "microsoft": "MSFT",
            "amazon": "AMZN", "tesla": "TSLA", "nvidia": "NVDA",
            "meta": "META", "netflix": "NFLX", "amd": "AMD",
        }
        for name, sym in name_map.items():
            if name in query.lower():
                tickers.append(sym)
        seen = set()
        return [t for t in tickers if not (t in seen or seen.add(t))]

    def _parse_impact_json(self, response: str, limit: int) -> dict:
        """Parse structured JSON from the synthesis response."""
        cleaned = re.sub(r"```json\s*|\s*```", "", response).strip()

        try:
            parsed = json.loads(cleaned)
            if "news_items" in parsed:
                return {"success": True, "news_items": self._validate_items(parsed["news_items"], limit)}
        except json.JSONDecodeError:
            pass

        start = cleaned.find('{"news_items"')
        if start == -1:
            start = cleaned.find('"news_items"')
            if start != -1:
                start = cleaned.rfind('{', 0, start)

        if start != -1:
            depth = 0
            for i in range(start, len(cleaned)):
                if cleaned[i] == '{':
                    depth += 1
                elif cleaned[i] == '}':
                    depth -= 1
                    if depth == 0:
                        try:
                            parsed = json.loads(cleaned[start:i + 1])
                            if "news_items" in parsed:
                                return {"success": True, "news_items": self._validate_items(parsed["news_items"], limit)}
                        except json.JSONDecodeError:
                            pass
                        break

        return {"success": False, "message": "Unable to parse response", "news_items": []}

    def _validate_items(self, items: list, limit: int) -> list:
        validated = []
        for item in items[:limit]:
            if isinstance(item, dict):
                validated.append({
                    "rank": item.get("rank", len(validated) + 1),
                    "title": str(item.get("title", "Unknown"))[:200],
                    "impact_level": item.get("impact_level", "medium").lower(),
                    "impact_direction": item.get("impact_direction", "neutral").lower(),
                    "why_it_matters": str(item.get("why_it_matters", ""))[:800],
                    "affected_sectors": item.get("affected_sectors", []) if isinstance(item.get("affected_sectors"), list) else [],
                    "affected_companies": item.get("affected_companies", []) if isinstance(item.get("affected_companies"), list) else [],
                    "trading_insight": str(item.get("trading_insight", ""))[:800],
                    "source": str(item.get("source", "Unknown"))[:100],
                    "source_url": str(item.get("source_url", ""))[:500],
                    "data_signal": str(item.get("data_signal", ""))[:500],
                    "published_date": str(item.get("published_date", ""))[:20],
                })
        return validated


agent = APIAgent()
