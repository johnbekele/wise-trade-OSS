"""
Turso (libsql) database layer for caching and search history.
Lazy-initialized to avoid cold-start penalty.
"""
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

import libsql_experimental as libsql
from app.core.config import settings

_conn = None


def _get_conn():
    """Lazy connection — only connect on first use."""
    global _conn
    if _conn is None:
        url = settings.TURSO_DATABASE_URL
        token = settings.TURSO_AUTH_TOKEN
        if not url or not token:
            raise RuntimeError("TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set")
        _conn = libsql.connect(database=url, auth_token=token)
    return _conn


def init_tables():
    """Create tables if they don't exist. Safe to call on every startup."""
    conn = _get_conn()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS analysis_cache (
            cache_key TEXT PRIMARY KEY,
            result_json TEXT NOT NULL,
            query TEXT NOT NULL,
            cache_type TEXT NOT NULL,
            created_at TEXT NOT NULL,
            expires_at TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS search_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            query TEXT NOT NULL,
            result_text TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_search_history_user
        ON search_history(user_id, created_at DESC)
    """)
    conn.commit()


# ── Cache operations ───────────────────────────────────────────────────────


def get_cache(cache_key: str) -> Optional[str]:
    """Return cached result if not expired, else None."""
    conn = _get_conn()
    row = conn.execute(
        "SELECT result_json, expires_at FROM analysis_cache WHERE cache_key = ?",
        [cache_key],
    ).fetchone()
    if row is None:
        return None
    result_json, expires_at = row
    if datetime.fromisoformat(expires_at) < datetime.utcnow():
        # Expired — clean it up
        conn.execute("DELETE FROM analysis_cache WHERE cache_key = ?", [cache_key])
        conn.commit()
        return None
    return result_json


def set_cache(cache_key: str, result: Any, query: str, cache_type: str, ttl_hours: int = 24):
    """Upsert a cache entry with the given TTL."""
    conn = _get_conn()
    now = datetime.utcnow()
    expires = now + timedelta(hours=ttl_hours)
    result_json = json.dumps(result, default=str) if not isinstance(result, str) else result
    conn.execute(
        """INSERT OR REPLACE INTO analysis_cache
           (cache_key, result_json, query, cache_type, created_at, expires_at)
           VALUES (?, ?, ?, ?, ?, ?)""",
        [cache_key, result_json, query, cache_type, now.isoformat(), expires.isoformat()],
    )
    conn.commit()


def delete_cache(cache_key: str):
    """Remove a specific cache entry."""
    conn = _get_conn()
    conn.execute("DELETE FROM analysis_cache WHERE cache_key = ?", [cache_key])
    conn.commit()


# ── Search history operations ──────────────────────────────────────────────


def save_history(user_id: str, query: str, result_text: str):
    """Save a completed analysis to search history."""
    conn = _get_conn()
    conn.execute(
        """INSERT INTO search_history (user_id, query, result_text, created_at)
           VALUES (?, ?, ?, ?)""",
        [user_id, query, result_text, datetime.utcnow().isoformat()],
    )
    conn.commit()


def get_history(user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
    """Get recent search history for a user."""
    try:
        conn = _get_conn()
        rows = conn.execute(
            """SELECT id, query, result_text, created_at
               FROM search_history
               WHERE user_id = ?
               ORDER BY created_at DESC
               LIMIT ?""",
            [user_id, limit],
        ).fetchall()
        return [
            {"id": r[0], "query": r[1], "result_text": r[2], "created_at": r[3]}
            for r in rows
        ]
    except Exception:
        return []
