from typing import Optional, Dict, Any, List
import json
import re
from datetime import datetime, timedelta

from anthropic import Anthropic
from app.core.config import settings

_cache = {}
_cache_ttl = {}

ANALYZE_SYSTEM_PROMPT = """You are an expert financial analyst AI agent. Your role is to:
1. Use web search to find the latest relevant financial news based on user queries
2. Analyze the fetched news to identify market-moving events
3. Provide comprehensive insights in a structured format

IMPORTANT: Format your response using markdown-style structure:
- Use section headers: "### 1. Most Impactful News Items"
- Use numbered items with bold titles: "1. **News Title**"
- Use bullet points for details: "* Why it matters: ..."

Structure your response with these sections:
1. Most Impactful News Items and Why They Matter
2. Which Companies or Sectors Are Affected
3. Potential Market Impact (high/medium/low) and Direction (positive/negative)
4. Actionable Insights for Traders

Search for the most recent news. Be concise and efficient."""

MARKET_IMPACT_SYSTEM_PROMPT = """You are a financial news analysis agent. Your task is to:
1. Search the web for the latest top financial and market-moving news
2. Analyze and rank the news by market impact
3. Return your analysis as a JSON object with this EXACT structure:

{{"news_items": [{{"rank": 1, "title": "News headline", "impact_level": "high|medium|low", "impact_direction": "positive|negative|neutral", "why_it_matters": "Brief explanation", "affected_sectors": ["sector1"], "affected_companies": ["company1"], "trading_insight": "Actionable insight", "source": "source name"}}]}}

CRITICAL: Return ONLY valid JSON after your analysis. No markdown code fences."""


class APIAgent:
    def __init__(self):
        self.client = Anthropic(api_key=settings.CLAUDE_API_KEY)
        self.model = settings.CLAUDE_MODEL
        self.web_search_tool = {"type": "web_search_20250305"}

    def _call_with_web_search(
        self,
        user_message: str,
        system: str,
        temperature: float = 0.7,
        max_tokens: int = 4096,
    ) -> str:
        response = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system,
            tools=[self.web_search_tool],
            messages=[{"role": "user", "content": user_message}],
        )

        # Extract text blocks from the response
        text_parts = []
        for block in response.content:
            if block.type == "text":
                text_parts.append(block.text)

        return "\n".join(text_parts) if text_parts else ""

    def analyze_market_news(self, query: str) -> str:
        cache_key = f"analyze_{query.lower().strip()}"
        if cache_key in _cache and datetime.now() < _cache_ttl.get(cache_key, datetime.min):
            return _cache[cache_key]

        try:
            user_message = (
                f"Search for the latest financial news about: {query}\n"
                "Focus on the most recent and impactful stories. "
                "Provide a comprehensive market analysis."
            )

            response = self._call_with_web_search(
                user_message=user_message,
                system=ANALYZE_SYSTEM_PROMPT,
                temperature=0.7,
                max_tokens=2048,
            )

            if not response or len(response.strip()) == 0:
                return "No analysis could be generated. Please try a different query."

            _cache[cache_key] = response
            _cache_ttl[cache_key] = datetime.now() + timedelta(minutes=5)
            return response
        except Exception as e:
            return f"Error during agent analysis: {str(e)[:200]}"

    def find_market_impact_news(self, limit: int = 10) -> dict:
        cache_key = f"market_impact_{limit}"
        if cache_key in _cache and datetime.now() < _cache_ttl.get(cache_key, datetime.min):
            return _cache[cache_key]

        try:
            user_message = (
                f"Search for today's top {limit} most impactful financial and stock market news. "
                "Include news about major companies, economic indicators, Fed decisions, "
                "earnings reports, and any breaking market-moving events. "
                f"Return exactly {limit} items ranked by market impact."
            )

            system = MARKET_IMPACT_SYSTEM_PROMPT.replace(
                "{limit}", str(limit)
            )

            response = self._call_with_web_search(
                user_message=user_message,
                system=system,
                temperature=0.3,
                max_tokens=2048,
            )

            if not response:
                return {"success": False, "message": "No response from AI", "news_items": []}

            # Parse JSON from response
            cleaned = re.sub(r"```json\s*|\s*```", "", response).strip()

            # Try full response first
            try:
                parsed = json.loads(cleaned)
                if "news_items" in parsed:
                    result = {"success": True, "news_items": self._validate_items(parsed["news_items"], limit)}
                    _cache[cache_key] = result
                    _cache_ttl[cache_key] = datetime.now() + timedelta(minutes=2)
                    return result
            except json.JSONDecodeError:
                pass

            # Try to find JSON object in response
            json_match = re.search(r"\{[^{}]*\"news_items\"[^{}]*\[[^\]]*\][^{}]*\}", cleaned, re.DOTALL)
            if json_match:
                try:
                    parsed = json.loads(json_match.group(0))
                    items = self._validate_items(parsed.get("news_items", []), limit)
                    if items:
                        result = {"success": True, "news_items": items}
                        _cache[cache_key] = result
                        _cache_ttl[cache_key] = datetime.now() + timedelta(minutes=2)
                        return result
                except json.JSONDecodeError:
                    pass

            return {"success": False, "message": "Unable to parse response", "news_items": []}
        except Exception as e:
            return {"success": False, "message": f"Error: {str(e)[:200]}", "news_items": []}

    def _validate_items(self, items: list, limit: int) -> list:
        validated = []
        for item in items[:limit]:
            if isinstance(item, dict):
                validated.append({
                    "rank": item.get("rank", len(validated) + 1),
                    "title": str(item.get("title", "Unknown"))[:200],
                    "impact_level": item.get("impact_level", "medium").lower(),
                    "impact_direction": item.get("impact_direction", "neutral").lower(),
                    "why_it_matters": str(item.get("why_it_matters", ""))[:500],
                    "affected_sectors": item.get("affected_sectors", []) if isinstance(item.get("affected_sectors"), list) else [],
                    "affected_companies": item.get("affected_companies", []) if isinstance(item.get("affected_companies"), list) else [],
                    "trading_insight": str(item.get("trading_insight", ""))[:500],
                    "source": str(item.get("source", "Unknown"))[:100],
                })
        return validated


agent = APIAgent()
