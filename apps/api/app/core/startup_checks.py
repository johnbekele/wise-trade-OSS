"""
Startup checks for API keys and endpoint connectivity.
Optimized for free-tier: no live API calls on startup to save costs and reduce cold start time.
"""
from typing import Dict, Tuple
from app.core.config import settings


def check_api_keys() -> Dict[str, Tuple[bool, str]]:
    checks = {}

    claude_key = settings.CLAUDE_API_KEY
    if claude_key:
        checks["Claude API"] = (True, f"Key present (length: {len(claude_key)})")
    else:
        checks["Claude API"] = (False, "Missing CLAUDE_API_KEY or ANTHROPIC_API_KEY")

    rapidapi_key = settings.RAPIDAPI_KEY
    if rapidapi_key:
        checks["RapidAPI"] = (True, f"Key present (length: {len(rapidapi_key)})")
    else:
        checks["RapidAPI"] = (False, "Missing RAPIDAPI_KEY")

    mongo_uri = settings.MONGO_URI
    if mongo_uri:
        checks["MongoDB"] = (True, "URI configured")
    else:
        checks["MongoDB"] = (False, "Missing MONGO_URI")

    secret_key = settings.SECRET_KEY
    if secret_key:
        checks["Secret Key"] = (True, "Secret key configured")
    else:
        checks["Secret Key"] = (False, "Missing SECRET_KEY")

    turso_url = settings.TURSO_DATABASE_URL
    if turso_url:
        checks["Turso"] = (True, "Database URL configured")
    else:
        checks["Turso"] = (False, "Missing TURSO_DATABASE_URL (cache/history disabled)")

    return checks


def run_startup_checks() -> bool:
    print("\n" + "=" * 60)
    print("Running Startup Checks...")
    print("=" * 60 + "\n")

    api_key_checks = check_api_keys()
    all_critical = True

    for api_name, (is_present, message) in api_key_checks.items():
        status = "OK" if is_present else "MISSING"
        print(f"  [{status}] {api_name}: {message}")
        if not is_present and api_name in ("Claude API", "MongoDB", "Secret Key"):
            all_critical = False

    print()
    print("=" * 60)
    if all_critical:
        print("All critical checks passed. Server ready.")
    else:
        print("Some critical checks failed. Server will start but some features may not work.")
    print("=" * 60 + "\n")

    return all_critical
