import os
import getpass
from dotenv import load_dotenv
import pymongo

load_dotenv(override=True)



class Config:

    #  MongoDB configuration
    MONGO_URI = os.getenv("MONGO_URI")
    MONGO_DATABASE = os.getenv("MONGO_DATABASE")
    MONGO_COLLECTION = os.getenv("MONGO_COLLECTION")
    MONGO_USERNAME = os.getenv("MONGO_USERNAME")
    MONGO_PASSWORD = os.getenv("MONGO_PASSWORD")

    # SMTP configuration
    SMTP_HOST = os.getenv("SMTP_HOST")
    SMTP_PORT = int(os.getenv("SMTP_PORT", "587")) if os.getenv("SMTP_PORT") else 587
    SMTP_USER = os.getenv("SMTP_USER")
    SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

    # Secret key
    SECRET_KEY=os.getenv("SECRET_KEY")
    REFRESH_SECRET_KEY=os.getenv("REFRESH_SECRET_KEY")
    ALGORITHM=os.getenv("ALGORITHM", "HS256")  # Default to HS256 if not set
    ACCESS_TOKEN_EXPIRE_MINUTES=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    REFRESH_TOKEN_EXPIRE_DAYS=int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))
    TOKEN_EXPIRE_DAYS=int(os.getenv("TOKEN_EXPIRE_DAYS", 1))
    TOKEN_EXPIRE_MINUTES=int(os.getenv("TOKEN_EXPIRE_MINUTES", 15))


    # Backend URL
    FRONTEND_URL=os.getenv("FRONTEND_URL")


    # RapidAPI Yahoo Finance configuration
    RAPIDAPI_KEY=os.getenv("RAPIDAPI_KEY")
    RAPIDAPI_HOST=os.getenv("RAPIDAPI_HOST", "yahoo-finance174.p.rapidapi.com")
    RAPIDAPI_URL=os.getenv("RAPIDAPI_URL", "https://yahoo-finance174.p.rapidapi.com")

    # AI API configuration - Claude (Anthropic)
    CLAUDE_API_KEY=os.getenv("CLAUDE_API_KEY") or os.getenv("ANTHROPIC_API_KEY")
    CLAUDE_MODEL=os.getenv("CLAUDE_MODEL", "claude-sonnet-4-6")
    
    # Turso (libsql) configuration
    TURSO_DATABASE_URL=os.getenv("TURSO_DATABASE_URL")
    TURSO_AUTH_TOKEN=os.getenv("TURSO_AUTH_TOKEN")

    # Google OAuth2 configuration
    GOOGLE_CLIENT_ID=os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET=os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI=os.getenv("GOOGLE_REDIRECT_URI", "http://127.0.0.1:8001/api/auth/google/callback")
    GOOGLE_AUTHORIZED_ORIGINS=os.getenv("GOOGLE_AUTHORIZED_ORIGINS", "http://127.0.0.1:8001,http://localhost:3000").split(",")
    



settings = Config()
