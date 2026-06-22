"""
Startup checks for API keys and endpoint connectivity
"""
import os
from typing import Dict, Tuple
from app.core.config import settings


def check_api_keys() -> Dict[str, Tuple[bool, str]]:
    """
    Check if required API keys are present
    
    Returns:
        Dictionary mapping API name to (is_present, message) tuple
    """
    checks = {}
    
    # Check Claude API Key
    claude_key = settings.CLAUDE_API_KEY
    if claude_key:
        checks["Claude API"] = (True, f"✓ Key present (length: {len(claude_key)})")
    else:
        checks["Claude API"] = (False, "✗ Missing CLAUDE_API_KEY or ANTHROPIC_API_KEY")
    
    # Legacy Google AI API Key check (deprecated)
    google_key = settings.GEMINI_API_KEY
    if google_key:
        checks["Google AI API (Legacy)"] = (True, f"✓ Key present (length: {len(google_key)})")
    else:
        checks["Google AI API (Legacy)"] = (False, "✗ Missing GOOGLE_API_KEY or GEMINI_API_KEY")
    
    # Check RapidAPI Key
    rapidapi_key = settings.RAPIDAPI_KEY
    if rapidapi_key:
        checks["RapidAPI"] = (True, f"✓ Key present (length: {len(rapidapi_key)})")
    else:
        checks["RapidAPI"] = (False, "✗ Missing RAPIDAPI_KEY")
    
    # Check MongoDB URI
    mongo_uri = settings.MONGO_URI
    if mongo_uri:
        checks["MongoDB"] = (True, "✓ URI configured")
    else:
        checks["MongoDB"] = (False, "✗ Missing MONGO_URI")
    
    # Check Secret Key
    secret_key = settings.SECRET_KEY
    if secret_key:
        checks["Secret Key"] = (True, "✓ Secret key configured")
    else:
        checks["Secret Key"] = (False, "✗ Missing SECRET_KEY")
    
    return checks


def test_claude_api() -> Tuple[bool, str]:
    """
    Test Claude API connectivity
    
    Returns:
        (is_working, message) tuple
    """
    api_key = settings.CLAUDE_API_KEY
    
    if not api_key:
        return (False, "✗ Cannot test - API key missing")
    
    try:
        # Try to import and test Claude
        from anthropic import Anthropic
        
        # Create Claude client
        client = Anthropic(api_key=api_key)
        
        # Make a simple test call
        try:
            response = client.messages.create(
                model=settings.CLAUDE_MODEL,
                max_tokens=10,
                messages=[{"role": "user", "content": "Say OK"}]
            )
            
            if response and response.content:
                content = response.content[0].text if response.content else ""
                if content:
                    return (True, f"✓ Connected successfully (model: {settings.CLAUDE_MODEL})")
                else:
                    return (False, "✗ No response content from API")
            else:
                return (False, "✗ No response from API")
        except Exception as api_error:
            error_msg = str(api_error)
            # Check for specific error types
            if "API_KEY" in error_msg or "authentication" in error_msg.lower() or "invalid" in error_msg.lower():
                return (False, "✗ Authentication failed - Invalid API key")
            elif "quota" in error_msg.lower() or "limit" in error_msg.lower():
                return (False, "✗ Quota exceeded or rate limited")
            elif "model" in error_msg.lower() and "not found" in error_msg.lower():
                return (False, f"✗ Model not found: {settings.CLAUDE_MODEL}")
            else:
                return (False, f"✗ API call failed: {error_msg[:100]}")
            
    except ImportError:
        return (False, "✗ anthropic package not installed. Install with: pip install anthropic")
    except Exception as e:
        error_msg = str(e)
        if "API_KEY" in error_msg or "authentication" in error_msg.lower() or "invalid" in error_msg.lower():
            return (False, "✗ Authentication failed - Invalid API key")
        elif "quota" in error_msg.lower() or "limit" in error_msg.lower():
            return (False, "✗ Quota exceeded or rate limited")
        else:
            return (False, f"✗ Error: {error_msg[:100]}")


def run_startup_checks() -> bool:
    """
    Run all startup checks and print results
    
    Returns:
        True if all critical checks pass, False otherwise
    """
    print("\n" + "="*60)
    print("🔍 Running Startup Checks...")
    print("="*60 + "\n")
    
    # Check API keys
    print("📋 Checking API Keys:")
    print("-" * 60)
    api_key_checks = check_api_keys()
    all_keys_present = True
    
    for api_name, (is_present, message) in api_key_checks.items():
        status_icon = "✅" if is_present else "❌"
        print(f"  {status_icon} {api_name}: {message}")
        if not is_present:
            all_keys_present = False
    
    print()
    
    # Test Claude API
    print("🤖 Testing Claude API Connectivity:")
    print("-" * 60)
    claude_working, claude_msg = test_claude_api()
    status_icon = "✅" if claude_working else "❌"
    print(f"  {status_icon} Claude API: {claude_msg}")
    print()
    
    # Summary
    print("="*60)
    critical_checks = [
        api_key_checks.get("Claude API", (False, ""))[0],
        claude_working
    ]
    
    all_passed = all(critical_checks)
    
    if all_passed:
        print("✅ All critical checks passed! Server ready to start.")
    else:
        print("⚠️  Some checks failed. Server will start but some features may not work.")
        print("   Please check your API keys and network connectivity.")
    
    print("="*60 + "\n")
    
    return all_passed

