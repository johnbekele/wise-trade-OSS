from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, Dict, Any
import asyncio
import json
import queue
import threading
from app.LLM.api_agent import agent
from app.core.jwt_auth import check_ai_access_jwt_only
from app.core import turso_db

router = APIRouter()


class NewsAnalysisRequest(BaseModel):
    query: str
    limit: Optional[int] = 10


class NewsAnalysisResponse(BaseModel):
    analysis: str
    query: str


# IMPORTANT: /stream must be registered BEFORE /{query} to avoid route shadowing

@router.get("/analyze-news/stream")
async def analyze_news_stream(query: str, auth: Dict[str, Any] = Depends(check_ai_access_jwt_only)):
    """SSE streaming endpoint for deep dive analysis."""
    user_id = str(auth.get("user_id", auth.get("sub", "")))

    q: queue.Queue = queue.Queue()

    def run():
        try:
            full_text = None
            for event in agent.analyze_market_news_stream(query):
                q.put(event)
                if event["event"] == "done":
                    full_text = event["data"]["full_text"]
            if full_text and user_id:
                try:
                    turso_db.save_history(user_id, query, full_text)
                except Exception:
                    pass
        except Exception as e:
            q.put({"event": "error", "data": {"message": str(e)[:200]}})
        finally:
            q.put(None)

    threading.Thread(target=run, daemon=True).start()

    async def generate():
        while True:
            event = await asyncio.get_event_loop().run_in_executor(None, q.get)
            if event is None:
                break
            yield f"event: {event['event']}\ndata: {json.dumps(event['data'])}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/analyze-news/{query}", response_model=NewsAnalysisResponse)
async def analyze_news_path(query: str, auth: Dict[str, Any] = Depends(check_ai_access_jwt_only)):
    try:
        loop = asyncio.get_event_loop()
        analysis = await loop.run_in_executor(None, agent.analyze_market_news, query)
        return NewsAnalysisResponse(analysis=analysis, query=query)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing news: {str(e)}")


@router.get("/analyze-news", response_model=NewsAnalysisResponse)
async def analyze_news_get(query: str, auth: Dict[str, Any] = Depends(check_ai_access_jwt_only)):
    try:
        loop = asyncio.get_event_loop()
        analysis = await loop.run_in_executor(None, agent.analyze_market_news, query)
        return NewsAnalysisResponse(analysis=analysis, query=query)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing news: {str(e)}")


@router.post("/analyze-news", response_model=NewsAnalysisResponse)
async def analyze_news_post(request: NewsAnalysisRequest, auth: Dict[str, Any] = Depends(check_ai_access_jwt_only)):
    try:
        loop = asyncio.get_event_loop()
        analysis = await loop.run_in_executor(None, agent.analyze_market_news, request.query)
        return NewsAnalysisResponse(analysis=analysis, query=request.query)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing news: {str(e)}")


@router.get("/market-impact")
async def get_market_impact_news(
    limit: int = 10,
    force_refresh: bool = False,
    auth: Dict[str, Any] = Depends(check_ai_access_jwt_only),
):
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, lambda: agent.find_market_impact_news(limit, force_refresh=force_refresh)
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching market impact news: {str(e)}")


@router.get("/search-history")
async def get_search_history(
    limit: int = 20,
    auth: Dict[str, Any] = Depends(check_ai_access_jwt_only),
):
    """Get the current user's deep dive search history."""
    user_id = str(auth.get("user_id", auth.get("sub", "")))
    try:
        history = await asyncio.get_event_loop().run_in_executor(
            None, turso_db.get_history, user_id, limit
        )
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching search history: {str(e)}")
