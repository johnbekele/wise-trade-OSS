# Wise Trade — Project Documentation

**Student:** Yohannes Bekele
**Date:** June 25, 2026

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Application Overview](#2-application-overview)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Backend Documentation](#5-backend-documentation)
   - 5.1 Application Entry Point
   - 5.2 Configuration
   - 5.3 Database Connection
   - 5.4 Security & Authentication
   - 5.5 API Routers
   - 5.6 Services
   - 5.7 AI Agent (LLM)
   - 5.8 Data Models
   - 5.9 Request/Response Schemas
6. [Frontend Documentation](#6-frontend-documentation)
   - 6.1 Application Entry Point
   - 6.2 Routing
   - 6.3 Authentication Context
   - 6.4 API Service Layer
   - 6.5 Custom Hooks
   - 6.6 Pages
   - 6.7 Reusable Components
7. [Database Documentation](#7-database-documentation)
   - 7.1 MongoDB Collections
   - 7.2 Turso (SQL) Tables
   - 7.3 Entity Relationship Diagram
8. [API Reference](#8-api-reference)
   - 8.1 Authentication Endpoints
   - 8.2 User Endpoints
   - 8.3 Stock Endpoints
   - 8.4 AI Analysis Endpoints
   - 8.5 API Key Endpoints
   - 8.6 Admin Endpoints
   - 8.7 External API Endpoints
9. [Authentication & Authorization](#9-authentication--authorization)
   - 9.1 Email/Password Flow
   - 9.2 Google OAuth 2.0 Flow
   - 9.3 API Key Authentication
   - 9.4 Role-Based Access Control
10. [AI Agent Architecture](#10-ai-agent-architecture)
    - 10.1 Pipeline Overview
    - 10.2 Phase 1A — Stock Data Collection
    - 10.3 Phase 1B — Web Intelligence
    - 10.4 Phase 2 — Synthesis
    - 10.5 Caching Strategy
    - 10.6 Streaming
11. [Deployment](#11-deployment)
    - 11.1 Environment Variables
    - 11.2 Docker Setup
    - 11.3 Running Locally
    - 11.4 Production Deployment
12. [Third-Party Services](#12-third-party-services)

---

## 1. Introduction

This document provides complete technical documentation for **Wise Trade**, an AI-powered stock market analysis web application. It covers every component of the system: backend API, frontend interface, database design, authentication, AI integration, and deployment.

The purpose of this document is to serve as a reference for understanding how the application is built, how each part works, and how the parts connect together.

---

## 2. Application Overview

Wise Trade is a full-stack web application that helps users analyze the stock market using artificial intelligence. Users can:

- View real-time stock prices, market movers, and company profiles
- Ask any market-related question and receive an AI-generated analysis
- See structured reports of the top news stories currently moving the market
- Manage their account (email login, Google login, password reset)
- Generate API keys for programmatic access
- (Admin) Manage users and control platform access

The application is organized as a **monorepo** containing two applications:
- **apps/api** — Python backend (FastAPI)
- **apps/web** — JavaScript frontend (React)

---

## 3. Technology Stack

### 3.1 Backend

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Programming language |
| FastAPI | 0.119.0 | Web framework |
| Uvicorn | 0.24.0 | ASGI server |
| Beanie | 1.26.0 | MongoDB async ODM |
| Motor | 3.3.2 | MongoDB async driver |
| PyMongo | 4.6.1 | MongoDB driver |
| Pydantic | 2.10.3 | Data validation |
| python-jose | 3.3.0 | JWT token handling |
| passlib + bcrypt | 1.7.4 / 4.0.1 | Password hashing |
| anthropic | 0.39.0+ | Claude AI SDK |
| aiosmtplib | 4.0.2 | Async email sending |
| authlib | 1.3.0 | OAuth library |
| libsql-experimental | 0.0.49+ | Turso database client |
| requests | 2.32.5 | HTTP client (Yahoo Finance) |
| gunicorn | 21.2.0 | Production WSGI server |

### 3.2 Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| Vite | 4.5.3 | Build tool and dev server |
| React Router | 6.30.2 | Client-side routing |
| TanStack React Query | 5.28.4 | Server state management |
| Axios | 1.13.2 | HTTP client |
| Tailwind CSS | 3.4.18 | Utility-first CSS framework |
| Recharts | 2.15.4 | Chart library |
| Lucide React | 0.379.0 | Icon library |

### 3.3 Infrastructure

| Technology | Purpose |
|---|---|
| MongoDB 7 | Primary database (users, tokens, keys) |
| Turso (libSQL) | Cache database (AI results, search history) |
| Docker + Docker Compose | Containerization and orchestration |
| Nginx | Reverse proxy and static file serving |
| Turborepo 2 | Monorepo task runner |

---

## 4. Project Structure

```
wise-trade-OSS/
|
|-- apps/
|   |-- api/                          # BACKEND (Python/FastAPI)
|   |   |-- app/
|   |   |   |-- core/                 # Framework configuration
|   |   |   |   |-- config.py         # Environment variable loader
|   |   |   |   |-- database.py       # MongoDB connection setup
|   |   |   |   |-- security.py       # JWT, password hashing, auth middleware
|   |   |   |   |-- turso_db.py       # Turso cache/history database
|   |   |   |   |-- startup_checks.py # Verify API keys on startup
|   |   |   |
|   |   |   |-- models/               # MongoDB document models
|   |   |   |   |-- users.py          # User model
|   |   |   |   |-- auth.py           # AuthToken model
|   |   |   |   |-- api_key.py        # ApiKey model
|   |   |   |
|   |   |   |-- routers/              # API endpoint handlers
|   |   |   |   |-- auth.py           # Login, OAuth, verification, reset
|   |   |   |   |-- users.py          # Signup, user list
|   |   |   |   |-- stocks.py         # Stock quotes, search, movers
|   |   |   |   |-- ai.py             # AI analysis, market impact
|   |   |   |   |-- api_keys.py       # API key CRUD
|   |   |   |   |-- admin.py          # Admin user management
|   |   |   |   |-- test.py           # Health check endpoint
|   |   |   |   |-- external/
|   |   |   |       |-- stocks.py     # External stock API (API key auth)
|   |   |   |       |-- ai.py         # External AI API (API key auth)
|   |   |   |
|   |   |   |-- services/             # Business logic layer
|   |   |   |   |-- auth_service.py   # Token management, verification
|   |   |   |   |-- users_service.py  # User creation, lookup
|   |   |   |   |-- api_key_service.py# Key generation, validation
|   |   |   |   |-- email_service.py  # Send verification/reset emails
|   |   |   |   |-- google_oauth_service.py # Google token exchange
|   |   |   |   |-- yahoo_finance_service.py# Stock data fetching
|   |   |   |
|   |   |   |-- schemas/              # Pydantic request/response models
|   |   |   |   |-- user_schema.py    # User create/read/update schemas
|   |   |   |   |-- auth_schema.py    # Login, token, reset schemas
|   |   |   |   |-- api_key_schema.py # API key schemas
|   |   |   |
|   |   |   |-- LLM/                  # AI agent implementation
|   |   |   |   |-- api_agent.py      # Multi-phase analysis pipeline
|   |   |   |
|   |   |   |-- utils/                # Utility functions
|   |   |   |   |-- email_templates.py# HTML email templates
|   |   |   |
|   |   |   |-- main.py              # FastAPI app entry point
|   |   |
|   |   |-- requirements.txt          # Python dependencies
|   |   |-- Dockerfile                 # Backend container
|   |
|   |-- web/                           # FRONTEND (React/Vite)
|       |-- src/
|       |   |-- pages/                 # Route-level page components
|       |   |   |-- Dashboard.jsx      # Stock watchlist + market movers
|       |   |   |-- StockDetail.jsx    # Stock chart + company info
|       |   |   |-- NewsAnalysis.jsx   # AI analysis + market impact
|       |   |   |-- AdminPanel.jsx     # Admin user management
|       |   |   |-- ApiKeys.jsx        # API key management
|       |   |   |-- ApiDocumentation.jsx# API reference page
|       |   |   |-- Login.jsx          # Login form
|       |   |   |-- Signup.jsx         # Registration form
|       |   |   |-- EmailVerification.jsx
|       |   |   |-- ForgotPassword.jsx
|       |   |   |-- ResetPassword.jsx
|       |   |   |-- ResendVerification.jsx
|       |   |
|       |   |-- components/            # Reusable UI components
|       |   |   |-- Layout.jsx         # Main layout (navbar + sidebar)
|       |   |   |-- StockCard.jsx      # Individual stock display
|       |   |   |-- StockChart.jsx     # Price chart (Recharts)
|       |   |   |-- StockSearch.jsx    # Search autocomplete
|       |   |
|       |   |-- context/
|       |   |   |-- AuthContext.jsx    # Global authentication state
|       |   |
|       |   |-- hooks/                 # Custom data-fetching hooks
|       |   |   |-- useStocks.js       # Stock data queries
|       |   |   |-- useNews.js         # AI analysis queries
|       |   |   |-- useSearchHistory.js# Search history queries
|       |   |   |-- useAdmin.js        # Admin operations
|       |   |
|       |   |-- services/
|       |   |   |-- api.js            # Axios HTTP client + endpoints
|       |   |
|       |   |-- config/
|       |   |   |-- config.js         # API base URL configuration
|       |   |
|       |   |-- utils/
|       |   |   |-- helpers.js        # Utility functions
|       |   |
|       |   |-- App.jsx              # Root component with routes
|       |   |-- main.jsx             # React DOM entry point
|       |   |-- index.css            # Global Tailwind styles
|       |
|       |-- package.json
|       |-- vite.config.js
|       |-- tailwind.config.js
|       |-- Dockerfile                 # Frontend container (Nginx)
|
|-- docker-compose.yml                 # Production deployment
|-- docker-compose.dev.yml             # Development overlay
|-- docker-compose.local.yml           # Local + cloud DB setup
|-- turbo.json                         # Turborepo task configuration
|-- package.json                       # Root workspace + scripts
|-- .env.example                       # Environment variable template
```

---

## 5. Backend Documentation

### 5.1 Application Entry Point

**File:** `apps/api/app/main.py`

The FastAPI application is created here. On startup it:

1. Runs startup checks (verifies API keys are configured)
2. Connects to MongoDB and initializes Beanie ODM
3. Creates Turso database tables if they don't exist
4. Registers all middleware (CORS, session)
5. Mounts all API routers

**Middleware:**
- **SessionMiddleware** — Required for Google OAuth state management. In production (HTTPS), cookies use `Secure` + `SameSite=none`.
- **CORSMiddleware** — Restricts cross-origin requests to allowed domains:
  - `http://localhost:3000` (development)
  - `http://127.0.0.1:3000` (development)
  - `https://wise-trade-client.vercel.app` (production)
  - `https://wise-trade-oss.vercel.app` (production)
  - `https://wise-trade-oss-web.vercel.app` (production)

**Router Registration:**

| Router | Prefix | Tag | Auth |
|---|---|---|---|
| test | `/api/test` | test | None |
| users | `/api/users` | users | Mixed |
| auth | `/api/auth` | auth | Mixed |
| ai | `/api/ai` | ai | JWT |
| stocks | `/api/stocks` | stocks | JWT |
| admin | `/api/admin` | admin | JWT + Admin |
| api_keys | `/api/api-keys` | api-keys | JWT |
| external_stocks | `/api/v1/external/stocks` | external-stocks | API Key |
| external_ai | `/api/v1/external/ai` | external-ai | API Key |

### 5.2 Configuration

**File:** `apps/api/app/core/config.py`

The `Config` class loads all settings from environment variables using `python-dotenv`. A single `settings` instance is exported for use throughout the application.

**Configuration groups:**

| Group | Variables | Description |
|---|---|---|
| MongoDB | `MONGO_URI`, `MONGO_DATABASE`, `MONGO_USERNAME`, `MONGO_PASSWORD` | Database connection |
| JWT | `SECRET_KEY`, `REFRESH_SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS` | Token signing |
| SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | Email sending |
| Claude AI | `CLAUDE_API_KEY`, `CLAUDE_MODEL` | AI analysis |
| RapidAPI | `RAPIDAPI_KEY`, `RAPIDAPI_HOST`, `RAPIDAPI_URL` | Yahoo Finance |
| Google OAuth | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Social login |
| Turso | `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` | Cache database |
| App | `FRONTEND_URL` | Frontend URL for email links and CORS |

### 5.3 Database Connection

**File:** `apps/api/app/core/database.py`

Handles MongoDB connection with retry logic:
- **Retry attempts:** 3 times with 5-second delays between attempts
- **Timeouts:** 30 seconds for server selection (cloud-optimized)
- **TLS/SSL:** Enabled with certificate verification (falls back to without if needed)
- **Beanie initialization:** Registers `User`, `AuthToken`, and `ApiKey` document models
- **Shutdown:** Gracefully closes the MongoDB connection

### 5.4 Security & Authentication

**File:** `apps/api/app/core/security.py`

The `SecurityManager` class provides all security operations:

**Password operations:**
- `get_password_hash(password)` — Hashes a plain-text password using bcrypt
- `verify_password(plain, hashed)` — Verifies a password against its hash

**Token operations:**
- `create_access_token(subject)` — Creates a JWT access token (default: 30 min expiry)
- `create_refresh_token(subject)` — Creates a JWT refresh token (default: 7 day expiry)
- `verify_token(token)` — Decodes and validates a JWT token

**Authentication dependencies (FastAPI Depends):**
- `get_current_user(token)` — Extracts user from JWT Bearer token. Used on most protected routes.
- `check_ai_access(user)` — Verifies user has AI access (not blocked by admin). Used on AI endpoints.
- `check_ai_access_api_key_only(api_key)` — Validates an API key from `X-API-Key` header. Used on external API routes.

### 5.5 API Routers

Each router handles a group of related endpoints. The routers delegate business logic to service classes and return Pydantic-validated responses.

#### 5.5.1 Auth Router (`apps/api/app/routers/auth.py`)

Handles all authentication flows:

- **Email login:** Validates credentials, returns JWT access + refresh tokens
- **Email verification:** User clicks link in email, token is verified, account is activated
- **Password reset:** User requests reset email, clicks link, sets new password
- **Google OAuth:** Redirects to Google consent screen, handles callback, creates/updates user, redirects to frontend with token
- **Session management:** Google users can fetch their profile via cookie-based session

#### 5.5.2 Users Router (`apps/api/app/routers/users.py`)

- **Signup:** Creates new user, sends verification email in background
- **Get user:** Fetch user by ID
- **List users:** Get all users
- **Delete user:** Remove user account

#### 5.5.3 Stocks Router (`apps/api/app/routers/stocks.py`)

All endpoints require JWT authentication.

- **Quote:** Fetches real-time price, change, volume, market cap from Yahoo Finance
- **Candles:** Retrieves candlestick chart data for a given resolution and date range
- **Profile:** Returns company description, sector, industry, CEO, employees
- **Search:** Searches for stocks by company name or ticker symbol
- **Market movers:** Returns top gainers, top losers, and most active stocks

#### 5.5.4 AI Router (`apps/api/app/routers/ai.py`)

All endpoints require JWT + AI access check.

- **Analyze news (POST/GET):** Accepts a market query, runs the AI agent pipeline, returns the analysis
- **Analyze news stream (GET):** Same analysis but streamed via Server-Sent Events (SSE)
- **Market impact (GET):** Returns structured JSON of top market-moving news stories
- **Search history (GET):** Returns the user's past AI queries and results

#### 5.5.5 API Keys Router (`apps/api/app/routers/api_keys.py`)

Requires JWT authentication.

- **Create:** Generates a cryptographically random API key, hashes it, stores the hash. Returns the full key only once.
- **List:** Returns all of the user's API keys (prefix only, not the full key)
- **Delete:** Deactivates and removes an API key

#### 5.5.6 Admin Router (`apps/api/app/routers/admin.py`)

Requires JWT + `is_super_Admin = true`.

- **User CRUD:** List (paginated), create, read, update, delete users
- **Password reset:** Admin can change any user's password
- **AI block/unblock:** Toggle a user's access to AI features
- **Statistics:** Returns counts: total users, active, verified, admins, AI-blocked

#### 5.5.7 External Routers (`apps/api/app/routers/external/`)

These endpoints use API key authentication (no JWT required). They are designed for developers and automated systems.

- **External stocks:** Stock quote endpoint authenticated by API key
- **External AI:** AI analysis and market impact endpoints authenticated by API key

### 5.6 Services

Services contain the core business logic, called by routers.

#### 5.6.1 AuthService (`apps/api/app/services/auth_service.py`)

- `login(username, password)` — Authenticates user, creates and stores JWT tokens
- `create_verification_token(user)` — Generates email verification token (15 min TTL)
- `verify_email(token)` — Validates verification token, activates user account
- `create_reset_token(email)` — Generates password reset token, sends reset email
- `reset_password(token, new_password)` — Validates reset token, updates password

#### 5.6.2 UserService (`apps/api/app/services/users_service.py`)

- `create_user(data)` — Creates new user with hashed password
- `get_user_by_email(email)` — Lookup user by email
- `get_user_by_id(id)` — Lookup user by ID

#### 5.6.3 EmailService (`apps/api/app/services/email_service.py`)

- Sends HTML emails via Gmail SMTP (async with `aiosmtplib`)
- Uses HTML templates from `utils/email_templates.py`
- 30-second timeout; failures are non-blocking (user registration succeeds even if email fails)
- Email types: verification link, password reset link

#### 5.6.4 YahooFinanceService (`apps/api/app/services/yahoo_finance_service.py`)

- Fetches live stock data from Yahoo Finance via RapidAPI
- Contains a mapping of 195+ company names to ticker symbols
- **Mock data fallback:** When the API is rate-limited or unavailable, returns realistic mock data for popular stocks (AAPL, GOOGL, MSFT, AMZN, TSLA, NVDA, META, NFLX, AMD)
- Methods: `get_quote()`, `get_market_movers()`, `search_stocks()`, `get_profile()`, `get_candles()`

#### 5.6.5 GoogleOAuthService (`apps/api/app/services/google_oauth_service.py`)

- `get_authorization_url()` — Generates the Google consent screen URL
- `exchange_code(code)` — Exchanges authorization code for access/ID tokens
- `get_user_info(token)` — Fetches user profile from Google
- Creates or updates the local user record with Google profile data

#### 5.6.6 ApiKeyService (`apps/api/app/services/api_key_service.py`)

- `create_key(user_id, name, expires_at)` — Generates random key, hashes it, stores hash + prefix
- `validate_key(key)` — Hashes provided key, looks up matching record, checks expiration
- `list_keys(user_id)` — Returns all keys for a user
- `delete_key(key_id)` — Removes key from database

### 5.7 AI Agent (LLM)

**File:** `apps/api/app/LLM/api_agent.py`

This is the core of the application. The `APIAgent` class orchestrates a multi-phase AI analysis pipeline. See [Section 10](#10-ai-agent-architecture) for full details.

### 5.8 Data Models

**MongoDB document models** using Beanie (async ODM for MongoDB):

#### User (`apps/api/app/models/users.py`)
```python
class User(Document):
    username: str
    first_name: str
    last_name: str
    email: EmailStr
    hashed_password: Optional[str]     # null for Google OAuth users
    is_active: bool = False
    is_super_Admin: bool = False
    is_verified: bool = False
    ai_access_blocked: bool = False
    reset_token: Optional[str]
    google_id: Optional[str]           # Google user ID
    profile_picture: Optional[str]     # Google profile picture URL
    auth_provider: str = "email"       # "email" or "google"
    created_at: datetime
    updated_at: datetime
```

#### AuthToken (`apps/api/app/models/auth.py`)
```python
class AuthToken(Document):
    token: str
    token_type: Literal["access", "refresh", "password_reset", "email_verification"]
    user_id: str
    created_at: datetime
    expires_at: datetime
```

#### ApiKey (`apps/api/app/models/api_key.py`)
```python
class ApiKey(Document):
    key: str                          # hashed, never stored plain
    key_prefix: str                   # first 8 characters for display
    user_id: Indexed(str)             # owner (indexed for fast lookup)
    name: str                         # user-friendly label
    is_active: bool = True
    created_at: datetime
    last_used_at: Optional[datetime]
    expires_at: Optional[datetime]
```

### 5.9 Request/Response Schemas

Pydantic models that validate incoming requests and structure outgoing responses.

**Auth schemas:**
- `LoginRequest` — `username`, `password`
- `LoginResponse` — `access_token`, `refresh_token`, `token_type`, `user`
- `ForgotPasswordRequest` — `email`
- `ResetPasswordRequest` — `token`, `new_password`
- `VerifyEmailRequest` — `token`

**User schemas:**
- `UserCreate` — `username`, `email`, `password`, `first_name`, `last_name`
- `UserRead` — All user fields (for API responses)
- `UserUpdate` — Optional fields for partial updates

**API Key schemas:**
- `ApiKeyCreate` — `name`, optional `expires_at`
- `ApiKeyResponse` — `id`, `key_prefix`, `name`, `is_active`, `created_at`, `last_used_at`, `expires_at`
- `ApiKeyCreateResponse` — Same as above + `key` (full key, shown only once)

---

## 6. Frontend Documentation

### 6.1 Application Entry Point

**File:** `apps/web/src/main.jsx`

Renders the root `<App />` component into the DOM.

**File:** `apps/web/src/App.jsx`

Sets up:
1. **React Query client** — Configured with 5-minute stale time, 30-minute garbage collection, single retry on failure
2. **AuthProvider** — Wraps the entire app with authentication context
3. **Router** — Defines all client-side routes

### 6.2 Routing

| Route | Component | Layout | Auth |
|---|---|---|---|
| `/login` | Login | No | Public |
| `/signup` | Signup | No | Public |
| `/verify-email` | EmailVerification | No | Public |
| `/forgot-password` | ForgotPassword | No | Public |
| `/reset-password` | ResetPassword | No | Public |
| `/resend-verification` | ResendVerification | No | Public |
| `/` | Dashboard | Yes | Protected |
| `/stock/:symbol` | StockDetail | Yes | Protected |
| `/news` | NewsAnalysis | Yes | Protected |
| `/admin` | AdminPanel | Yes | Admin only |
| `/api-keys` | ApiKeys | Yes | Protected |
| `/api-docs` | ApiDocumentation | Yes | Protected |

Auth pages render without the sidebar/navbar layout. App pages render inside `<Layout>`.

### 6.3 Authentication Context

**File:** `apps/web/src/context/AuthContext.jsx`

Provides global authentication state to all components via React Context.

**State:**
- `user` — Current user object (or null)
- `token` — JWT access token (or null)
- `loading` — Whether auth state is being resolved

**Methods:**
- `login(username, password)` — Calls `/api/auth/login`, stores token in `localStorage`, sets Axios default header
- `signup(userData)` — Calls `/api/users/signup`
- `logout()` — Clears token from `localStorage` and state
- `loginWithGoogle()` — Redirects browser to `/api/auth/google/login`

**Initialization flow:**
1. On mount, checks `localStorage` for existing token
2. If found, sets the Axios `Authorization` header
3. Fetches user profile from `/api/auth/me`
4. Also checks URL for `?token=` parameter (set by Google OAuth callback)
5. If Google token found, stores it and fetches user profile

### 6.4 API Service Layer

**File:** `apps/web/src/services/api.js`

Centralized Axios client with all API endpoint functions:

**Stock API:**
- `stockAPI.getQuote(symbol)` — GET `/api/stocks/quote/{symbol}`
- `stockAPI.searchSymbol(keywords)` — GET `/api/stocks/search?keywords=`
- `stockAPI.getMarketMovers()` — GET `/api/stocks/market-movers`
- `stockAPI.getProfile(symbol)` — GET `/api/stocks/profile/{symbol}`
- `stockAPI.getIntraday(symbol)` — GET `/api/stocks/candles/{symbol}?resolution=5m`
- `stockAPI.getDaily(symbol)` — GET `/api/stocks/candles/{symbol}?resolution=1d`
- `stockAPI.getBatchQuotes(symbols)` — Multiple parallel quote requests

**News API:**
- `newsAPI.analyzeNews(query)` — POST `/api/ai/analyze-news`
- `newsAPI.getMarketImpact(limit, forceRefresh)` — GET `/api/ai/market-impact`
- `newsAPI.getSearchHistory(limit)` — GET `/api/ai/search-history`

### 6.5 Custom Hooks

Custom React hooks wrap React Query for data fetching:

**useStocks.js:**
- `useStockQuote(symbol)` — Fetches a single stock quote
- `useStockSearch(keywords)` — Searches for stocks
- `useMarketMovers()` — Fetches gainers/losers/active
- `useBatchQuotes(symbols)` — Fetches multiple quotes

**useNews.js:**
- `useMarketImpact(limit)` — Fetches market impact news
- `useAnalyzeNews()` — Mutation hook for AI analysis

**useSearchHistory.js:**
- `useSearchHistory(limit)` — Fetches user's AI search history

**useAdmin.js:**
- `useAdminUsers()` — Fetches user list for admin
- `useAdminStats()` — Fetches platform statistics
- `useCreateUser()`, `useUpdateUser()`, `useDeleteUser()` — Mutation hooks

### 6.6 Pages

#### 6.6.1 Dashboard (`/`)

The main landing page after login. Contains:

- **Watchlist section:** Displays stock cards for user's watched stocks. Each card shows symbol, company name, price, and daily change percentage. Users can add/remove stocks.
- **Market movers section:** Three tabs — Top Gainers, Top Losers, Most Active. Shows ranked lists with price and change data.
- **Stock search:** Search bar at the top to find and add stocks to watchlist.
- **Refresh button:** Manually re-fetches all stock data.

Data is fetched using `useMarketMovers()` and `useBatchQuotes()` hooks.

#### 6.6.2 Stock Detail (`/stock/:symbol`)

Displays detailed information for a single stock:

- **Price chart:** Interactive line/area chart built with Recharts. Supports multiple timeframes (1 minute, 5 minutes, 15 minutes, 30 minutes, 1 hour, 1 day).
- **Price header:** Current price, dollar change, percentage change (green/red coloring).
- **Company info:** Company name, sector, industry, description, CEO, number of employees.

Data is fetched using `useStockQuote()` and candle data hooks.

#### 6.6.3 News Analysis (`/news`)

The AI-powered analysis page. Contains three sections:

- **Deep Dive search bar:** User types a market question (e.g., "What's happening with AI stocks?"). Clicking "Analyze" triggers the AI agent. Results stream in real time via SSE with phase indicators ("Collecting data...", "Analyzing web...", "Synthesizing...").
- **Market Impact monitor:** Displays structured cards of the top market-moving news stories. Each card shows headline, impact level (high/medium/low), affected sectors, affected companies, and trading insight.
- **Search history:** List of the user's recent AI queries. Clicking a past query re-runs it.

#### 6.6.4 Admin Panel (`/admin`)

Available only to super admin users:

- **Statistics cards:** Total users, active users, verified users, admin count, AI-blocked count
- **User table:** Paginated list of all users with columns for username, email, role, status, and actions
- **Actions:** Edit user, reset password, block/unblock AI access, delete user
- **Create user form:** Modal form to create new users directly

#### 6.6.5 API Keys (`/api-keys`)

- **Create key form:** Enter a name and optional expiration date. On creation, the full API key is displayed once (user must copy it).
- **Key list:** Table showing key name, prefix (first 8 characters), status, creation date, last used date, and expiration. Delete button to revoke keys.

#### 6.6.6 API Documentation (`/api-docs`)

Static documentation page showing:
- Available API endpoints
- Request/response formats
- Authentication methods (JWT and API key)
- Example requests using curl

#### 6.6.7 Authentication Pages

- **Login:** Email/password form + "Login with Google" button
- **Signup:** Registration form (username, email, password, first name, last name)
- **Email Verification:** Reads token from URL, calls verification endpoint, shows success/error
- **Forgot Password:** Enter email to receive reset link
- **Reset Password:** Enter new password (token from URL)
- **Resend Verification:** Enter email to resend verification link

### 6.7 Reusable Components

- **Layout** — Page wrapper with navigation bar (logo, links) and sidebar. Wraps protected pages.
- **StockCard** — Displays a single stock's symbol, name, price, and change. Clickable to navigate to stock detail.
- **StockChart** — Recharts-based price chart with timeframe selector. Supports line and area chart modes.
- **StockSearch** — Search input with autocomplete dropdown. Calls the search API on typing.

---

## 7. Database Documentation

### 7.1 MongoDB Collections

The application uses three MongoDB collections stored in the `wisetrade` database.

#### 7.1.1 `users` Collection

Stores all registered user accounts.

| Field | Type | Required | Default | Indexed | Description |
|---|---|---|---|---|---|
| `_id` | ObjectId | Auto | Auto | Yes (PK) | Unique document identifier |
| `username` | String | Yes | — | No | Display name |
| `first_name` | String | Yes | — | No | First name |
| `last_name` | String | Yes | — | No | Last name |
| `email` | String | Yes | — | No | Email address (unique) |
| `hashed_password` | String | No | null | No | Bcrypt hash (null for Google users) |
| `is_active` | Boolean | No | false | No | Account activated status |
| `is_verified` | Boolean | No | false | No | Email verified status |
| `is_super_Admin` | Boolean | No | false | No | Admin privilege flag |
| `ai_access_blocked` | Boolean | No | false | No | AI feature restriction flag |
| `reset_token` | String | No | null | No | Password reset token |
| `google_id` | String | No | null | No | Google account identifier |
| `profile_picture` | String | No | null | No | Profile image URL (from Google) |
| `auth_provider` | String | No | "email" | No | Login method: "email" or "google" |
| `created_at` | DateTime | No | now() | No | Account creation timestamp |
| `updated_at` | DateTime | No | now() | No | Last modification timestamp |

#### 7.1.2 `auth_tokens` Collection

Stores all issued tokens (access, refresh, verification, reset).

| Field | Type | Required | Indexed | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | Yes (PK) | Unique document identifier |
| `token` | String | Yes | No | The token string (JWT or random) |
| `token_type` | String | Yes | No | "access", "refresh", "password_reset", or "email_verification" |
| `user_id` | String | Yes | No | Reference to the owning user |
| `created_at` | DateTime | Yes | No | Token creation timestamp |
| `expires_at` | DateTime | Yes | No | Token expiration timestamp |

#### 7.1.3 `api_keys` Collection

Stores hashed API keys for external access.

| Field | Type | Required | Default | Indexed | Description |
|---|---|---|---|---|---|
| `_id` | ObjectId | Auto | Auto | Yes (PK) | Unique document identifier |
| `key` | String | Yes | — | No | Hashed API key |
| `key_prefix` | String | Yes | — | Yes | First 8 characters (for display) |
| `user_id` | String | Yes | — | Yes | Reference to the owning user |
| `name` | String | Yes | — | No | User-friendly key name |
| `is_active` | Boolean | No | true | No | Whether the key is active |
| `created_at` | DateTime | No | now() | No | Key creation timestamp |
| `last_used_at` | DateTime | No | null | No | Last usage timestamp |
| `expires_at` | DateTime | No | null | No | Optional expiration date |

### 7.2 Turso (SQL) Tables

Turso is a cloud-hosted SQLite-compatible database used for caching and search history.

#### 7.2.1 `analysis_cache` Table

Caches AI analysis results to avoid redundant API calls.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `cache_key` | TEXT | PRIMARY KEY | Hash of the normalized query |
| `result_json` | TEXT | NOT NULL | Full AI response stored as JSON string |
| `query` | TEXT | NOT NULL | Original user query text |
| `cache_type` | TEXT | NOT NULL | "deep_dive" or "market_impact" |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp of creation |
| `expires_at` | TEXT | NOT NULL | ISO 8601 timestamp of expiration |

**TTL:** 24 hours. Expired entries are deleted on next read.

#### 7.2.2 `search_history` Table

Stores every AI analysis query and its result per user.

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Auto-incrementing unique ID |
| `user_id` | TEXT | NOT NULL | User who performed the search |
| `query` | TEXT | NOT NULL | The search query text |
| `result_text` | TEXT | NOT NULL | The AI-generated analysis result |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp |

**Index:** `idx_search_history_user` on (`user_id`, `created_at` DESC) — Enables fast retrieval of a user's most recent searches.

### 7.3 Entity Relationship Diagram

```
+=========================+
|         USERS           |
+=========================+
| _id          (PK)       |
| username                |
| email        (unique)   |
| hashed_password         |
| first_name, last_name   |
| is_active               |
| is_verified             |
| is_super_Admin          |
| ai_access_blocked       |
| google_id               |
| profile_picture         |
| auth_provider           |
| created_at, updated_at  |
+=========================+
     |                |
     | 1:N            | 1:N
     |                |
     v                v
+=============+  +=============+
| AUTH_TOKENS |  |  API_KEYS   |
+=============+  +=============+
| _id    (PK) |  | _id    (PK) |
| token       |  | key (hashed)|
| token_type  |  | key_prefix  |
| user_id (FK)|  | user_id (FK)|
| created_at  |  | name        |
| expires_at  |  | is_active   |
+=============+  | created_at  |
                 | last_used_at|
                 | expires_at  |
                 +=============+
                      |
                      | authenticates
                      v
               +================+
               | EXTERNAL API   |
               | /v1/external/* |
               +================+


+==================+     +==================+
| ANALYSIS_CACHE   |     | SEARCH_HISTORY   |
| (Turso/SQL)      |     | (Turso/SQL)      |
+==================+     +==================+
| cache_key  (PK)  |     | id (PK, auto)    |
| result_json      |     | user_id          |
| query            |     | query            |
| cache_type       |     | result_text      |
| created_at       |     | created_at       |
| expires_at       |     +==================+
+==================+

Relationships:
  Users  ---(1:N)--- Auth Tokens    (one user has many tokens)
  Users  ---(1:N)--- API Keys       (one user has many keys)
  Users  ---(1:N)--- Search History  (one user has many searches)
  API Keys ---> External API routes  (key authenticates external access)
```

---

## 8. API Reference

Base URL: `/api`

### 8.1 Authentication Endpoints

#### POST `/api/auth/login`
Login with email/password credentials.

**Request body:**
```json
{
  "username": "johndoe",
  "password": "mypassword"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": "6650a1b2c3d4e5f6a7b8c9d0",
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "is_active": true,
    "is_verified": true,
    "is_super_Admin": false,
    "ai_access_blocked": false,
    "auth_provider": "email"
  }
}
```

#### GET `/api/auth/me`
Get the currently authenticated user's profile.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):** User object (same as login response `user` field)

#### GET `/api/auth/verify-email?token=<token>`
Verify a user's email address using the token sent via email.

**Response (200):**
```json
{
  "message": "Email verified successfully"
}
```

#### POST `/api/auth/forgot-password`
Request a password reset email.

**Request body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "Password reset email sent"
}
```

#### POST `/api/auth/reset-password`
Reset password using the token from the reset email.

**Request body:**
```json
{
  "token": "reset-token-from-email",
  "new_password": "mynewpassword"
}
```

#### POST `/api/auth/resend-email-verification`
Resend the verification email.

**Request body:**
```json
{
  "email": "john@example.com"
}
```

#### GET `/api/auth/google/login`
Redirects the browser to Google's OAuth consent screen. No request body needed.

#### GET `/api/auth/google/callback?code=<auth_code>`
Handles the Google OAuth callback. Exchanges the authorization code for tokens, creates or updates the user, and redirects to the frontend with `?token=<jwt>` in the URL.

#### GET `/api/auth/google/me`
Get the current Google-authenticated user from the session cookie.

#### POST `/api/auth/google/logout`
Clears the Google OAuth session cookie.

### 8.2 User Endpoints

#### POST `/api/users/signup`
Register a new user account.

**Request body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "mypassword",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response (201):**
```json
{
  "message": "User created successfully. Please check your email to verify your account.",
  "user": { ... }
}
```

#### GET `/api/users/`
List all users. **Headers:** `Authorization: Bearer <token>`

#### DELETE `/api/users/{user_id}`
Delete a user. **Headers:** `Authorization: Bearer <token>`

### 8.3 Stock Endpoints

All require `Authorization: Bearer <token>`.

#### GET `/api/stocks/quote/{symbol}`
Get real-time stock quote.

**Example:** `/api/stocks/quote/AAPL`

**Response (200):**
```json
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "price": 195.27,
  "change": 2.45,
  "changePercent": 1.27,
  "volume": 54213000,
  "marketCap": 3020000000000,
  "high": 196.10,
  "low": 192.80,
  "open": 193.50,
  "previousClose": 192.82
}
```

#### GET `/api/stocks/search?keywords=<query>`
Search stocks by company name or ticker.

**Example:** `/api/stocks/search?keywords=apple`

#### GET `/api/stocks/market-movers`
Get top gainers, losers, and most active stocks.

**Response (200):**
```json
{
  "gainers": [ ... ],
  "losers": [ ... ],
  "active": [ ... ]
}
```

#### GET `/api/stocks/profile/{symbol}`
Get company profile information.

#### GET `/api/stocks/candles/{symbol}?resolution=1d&days=30`
Get candlestick chart data. Supported resolutions: `1m`, `5m`, `15m`, `30m`, `1h`, `1d`.

### 8.4 AI Analysis Endpoints

All require `Authorization: Bearer <token>` and AI access must not be blocked.

#### GET `/api/ai/analyze-news/stream?query=<query>`
Stream AI analysis via Server-Sent Events (SSE).

**Response:** `text/event-stream` content type. Events:
```
data: {"type": "phase", "content": "Collecting stock data..."}
data: {"type": "chunk", "content": "The tech sector is showing..."}
data: {"type": "phase", "content": "Searching the web..."}
data: {"type": "chunk", "content": "According to recent reports..."}
data: {"type": "done", "content": ""}
```

#### POST `/api/ai/analyze-news`
Non-streaming AI analysis.

**Request body:**
```json
{
  "query": "What's happening with tech stocks?"
}
```

**Response (200):**
```json
{
  "analysis": "## Market Analysis: Tech Stocks\n\n..."
}
```

#### GET `/api/ai/market-impact?limit=10&force_refresh=false`
Get the top market-impacting news stories as structured data.

**Response (200):**
```json
{
  "top_stories": [
    {
      "headline": "Fed Holds Rates Steady",
      "impact_level": "high",
      "affected_sectors": ["Financials", "Real Estate"],
      "affected_companies": ["JPM", "GS", "BAC"],
      "trading_insight": "Rate-sensitive stocks likely to rally...",
      "entry_signal": "Buy on breakout above resistance",
      "data_signals": ["Bond yields declining", "VIX dropping"]
    }
  ]
}
```

#### GET `/api/ai/search-history?limit=20`
Get the user's past AI analysis queries.

**Response (200):**
```json
[
  {
    "id": 1,
    "query": "tech stocks analysis",
    "result_text": "## Market Analysis...",
    "created_at": "2026-06-25T10:30:00"
  }
]
```

### 8.5 API Key Endpoints

All require `Authorization: Bearer <token>`.

#### POST `/api/api-keys/`
Create a new API key.

**Request body:**
```json
{
  "name": "My Trading Bot",
  "expires_at": "2026-12-31T23:59:59"
}
```

**Response (201):**
```json
{
  "id": "6650a1b2c3d4e5f6a7b8c9d0",
  "key": "wt_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
  "key_prefix": "wt_a1b2c",
  "name": "My Trading Bot",
  "is_active": true,
  "created_at": "2026-06-25T10:00:00",
  "expires_at": "2026-12-31T23:59:59"
}
```

**Note:** The full `key` value is returned only on creation. It cannot be retrieved later.

#### GET `/api/api-keys/`
List all API keys for the current user (prefix only).

#### DELETE `/api/api-keys/{api_key_id}`
Delete an API key.

### 8.6 Admin Endpoints

All require `Authorization: Bearer <token>` and the user must have `is_super_Admin = true`.

#### GET `/api/admin/users?skip=0&limit=100`
List all users with pagination.

#### POST `/api/admin/users`
Create a new user (admin-created).

#### GET `/api/admin/users/{user_id}`
Get detailed user information.

#### PUT `/api/admin/users/{user_id}`
Update a user's profile.

#### PUT `/api/admin/users/{user_id}/password`
Change a user's password.

**Request body:**
```json
{
  "new_password": "newpassword123"
}
```

#### PUT `/api/admin/users/{user_id}/block-ai?blocked=true`
Block or unblock a user from AI features.

#### DELETE `/api/admin/users/{user_id}`
Delete a user account.

#### GET `/api/admin/stats`
Get platform statistics.

**Response (200):**
```json
{
  "total_users": 150,
  "active_users": 120,
  "verified_users": 130,
  "admin_users": 3,
  "ai_blocked_users": 5
}
```

### 8.7 External API Endpoints

These use API key authentication via the `X-API-Key` header (no JWT required).

#### GET `/api/v1/external/stocks/{symbol}`
Get stock quote. **Headers:** `X-API-Key: <your_api_key>`

#### GET `/api/v1/external/ai/analyze-news?query=<query>`
Get AI analysis. **Headers:** `X-API-Key: <your_api_key>`

#### GET `/api/v1/external/ai/market-impact?limit=10`
Get market impact news. **Headers:** `X-API-Key: <your_api_key>`

---

## 9. Authentication & Authorization

### 9.1 Email/Password Flow

```
1. User fills signup form
       |
       v
2. POST /api/users/signup
   - Create user (is_active=false, is_verified=false)
   - Hash password with bcrypt
   - Send verification email (background task)
       |
       v
3. User clicks email link
       |
       v
4. GET /api/auth/verify-email?token=...
   - Validate token (15-minute expiry)
   - Set is_verified=true, is_active=true
       |
       v
5. User fills login form
       |
       v
6. POST /api/auth/login
   - Verify password against bcrypt hash
   - Generate access token (30 min) + refresh token (7 days)
   - Store tokens in auth_tokens collection
   - Return tokens + user object
       |
       v
7. Frontend stores token in localStorage
   Sets Authorization header on all subsequent requests
```

### 9.2 Google OAuth 2.0 Flow

```
1. User clicks "Login with Google"
       |
       v
2. Frontend redirects to GET /api/auth/google/login
       |
       v
3. Backend generates state parameter, redirects to Google consent screen
       |
       v
4. User authorizes on Google
       |
       v
5. Google redirects to GET /api/auth/google/callback?code=...
       |
       v
6. Backend exchanges code for Google tokens
   Fetches user info (email, name, picture) from Google
       |
       v
7. Backend creates new user OR updates existing user
   - If email exists: link Google account, update picture
   - If new: create user with auth_provider="google", no password
       |
       v
8. Backend generates JWT, sets session cookie
   Redirects to frontend: http://frontend-url?token=<jwt>
       |
       v
9. Frontend extracts token from URL parameter
   Stores in localStorage, fetches user profile
```

### 9.3 API Key Authentication

```
1. User goes to /api-keys page
       |
       v
2. POST /api/api-keys/ with name and optional expiration
       |
       v
3. Backend generates random key, stores hash + prefix
   Returns full key (one time only)
       |
       v
4. User copies key, uses in external requests:
   GET /api/v1/external/stocks/AAPL
   Header: X-API-Key: wt_a1b2c3d4...
       |
       v
5. Backend hashes provided key, looks up in database
   Checks: key exists, is_active=true, not expired
   Updates last_used_at timestamp
```

### 9.4 Role-Based Access Control

| Role | Determined By | Access Level |
|---|---|---|
| **Unauthenticated** | No token | Public routes only (login, signup, verification, reset) |
| **Regular user** | Valid JWT token | Stocks, AI analysis, API keys, own profile |
| **AI-blocked user** | `ai_access_blocked = true` | Everything except AI analysis and market impact endpoints |
| **Super admin** | `is_super_Admin = true` | Full access including admin panel (user CRUD, stats, AI controls) |
| **API key holder** | Valid `X-API-Key` header | External API routes only (`/api/v1/external/*`) |

---

## 10. AI Agent Architecture

### 10.1 Pipeline Overview

The AI agent in `apps/api/app/LLM/api_agent.py` implements a multi-phase analysis pipeline that processes user queries about the stock market.

```
User Query
    |
    v
+-------------------+
| CACHE LOOKUP      |
|                   |
| L1: In-memory     |     Cache hit
|     (10 min TTL)  | ----------------> Return cached result
|                   |
| L2: Turso DB      |     Cache hit
|     (24 hour TTL) | ----------------> Return cached result
+-------------------+
    | Cache miss
    v
+-------------------+     +-------------------+
| PHASE 1A          |     | PHASE 1B          |
| Stock Data        |     | Web Intelligence  |
|                   |     |                   |
| - Fetch quotes    |     | - Claude AI with  |
|   from Yahoo      |     |   web_search tool |
|   Finance         |     | - Up to 8 web     |
| - Get market      |     |   searches        |
|   movers          |     | - Breaking news   |
| - Claude analyzes |     | - Economic data   |
|   patterns,       |     | - Geopolitics     |
|   anomalies,      |     | - Social media    |
|   sector moves    |     |   sentiment       |
+-------------------+     +-------------------+
    |                         |
    +------------+------------+
                 |
                 v
    +----------------------------+
    | PHASE 2: SYNTHESIS         |
    |                            |
    | Claude receives:           |
    | - Phase 1A stock analysis  |
    | - Phase 1B web intelligence|
    | - Original user query      |
    |                            |
    | Claude produces:           |
    | - Connected insights       |
    | - Actionable suggestions   |
    | - Risk factors             |
    | - Sector implications      |
    +----------------------------+
                 |
                 v
    +----------------------------+
    | POST-PROCESSING            |
    |                            |
    | - Cache in L1 (memory)     |
    | - Cache in L2 (Turso)      |
    | - Save to search_history   |
    | - Return to user           |
    +----------------------------+
```

### 10.2 Phase 1A — Stock Data Collection

**System prompt role:** Senior quantitative analyst

**What it does:**
1. Calls Yahoo Finance API to fetch real-time stock quotes and market movers
2. Sends the raw data to Claude with the `STOCK_PATTERN_SYSTEM` prompt
3. Claude identifies:
   - Price patterns and anomalies (unusual volume, gap ups/downs, breakouts)
   - Sector rotations or correlated moves
   - Technical signals (momentum shifts, support/resistance levels)
   - Current market sentiment based on data

**Output format:**
```
### Market Data Patterns
- Key observations from prices and volume
### Unusual Activity
- Stocks with abnormal moves or volume
### Sector Signals
- Which sectors are strong/weak
### Technical Flags
- Notable patterns or levels
```

### 10.3 Phase 1B — Web Intelligence

**System prompt role:** Financial intelligence researcher

**What it does:**
1. Sends the user's query to Claude with the `WEB_INTEL_SYSTEM` prompt
2. Claude uses the `web_search` tool (up to 8 searches) to find:
   - Breaking financial news (earnings, mergers, FDA approvals)
   - Economic indicators (Fed decisions, jobs data, inflation)
   - Geopolitical events (trade wars, sanctions, elections)
   - Social media sentiment (trending stocks on Reddit, X)
   - Insider activity (large buys/sells, institutional filings)
   - Global markets (how Asia/Europe traded, currency moves)

**Output format:**
```
### Breaking News
- Top stories affecting markets
### Economic Indicators
- Recent data releases
### Geopolitical Factors
- Global events affecting markets
### Market Sentiment
- Social media and retail trends
### Insider & Institutional Moves
- Notable large transactions
```

### 10.4 Phase 2 — Synthesis

**System prompt role:** Chief Market Strategist

**What it does:**
1. Receives the output from Phase 1A (stock data) and Phase 1B (web intelligence)
2. Connects the dots: links price movements to news causes
3. Identifies trading opportunities and risks
4. Produces a unified analysis in clear, actionable language

**For market impact requests**, the synthesis uses a different prompt (`MARKET_IMPACT_SYNTHESIS_SYSTEM`) that returns structured JSON:

```json
{
  "top_stories": [
    {
      "headline": "...",
      "impact_level": "high|medium|low",
      "affected_sectors": ["...", "..."],
      "affected_companies": ["...", "..."],
      "trading_insight": "...",
      "entry_signal": "...",
      "data_signals": ["...", "..."]
    }
  ]
}
```

### 10.5 Caching Strategy

The application uses two cache layers to minimize redundant AI API calls:

| Layer | Storage | TTL | Speed | Survives Restart |
|---|---|---|---|---|
| **L1** | Python dictionary (in-memory) | 10 minutes | Instant (no I/O) | No |
| **L2** | Turso cloud database | 24 hours | Fast (single SQL query) | Yes |

**Cache lookup order:**
1. Check L1 (memory) — if found and not expired, return immediately
2. Check L2 (Turso) — if found and not expired, populate L1 and return
3. Cache miss — run full AI pipeline, store result in both L1 and L2

**Cache key:** The normalized and lowercased query string.

**Impact:** Reduces Claude API costs by approximately 80% for repeated or similar queries.

### 10.6 Streaming

The streaming endpoint (`/api/ai/analyze-news/stream`) uses **Server-Sent Events (SSE)** to deliver the AI analysis in real time as it is generated.

**Event format:**
```
data: {"type": "phase", "content": "Collecting stock data..."}
data: {"type": "chunk", "content": "partial text..."}
data: {"type": "done", "content": ""}
```

**Event types:**
- `phase` — Indicates the current processing stage (collecting, analyzing, synthesizing)
- `chunk` — A piece of the AI-generated text
- `done` — Analysis is complete

The frontend reads these events and appends each chunk to the displayed text, giving the user real-time feedback.

---

## 11. Deployment

### 11.1 Environment Variables

All configuration is managed through environment variables. Copy `.env.example` to `.env` and fill in the values:

```env
# MongoDB Connection
MONGO_USERNAME=admin
MONGO_PASSWORD=changeme
MONGO_DATABASE=wisetrade

# JWT Security
SECRET_KEY=your-secret-key
REFRESH_SECRET_KEY=your-refresh-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Claude AI
CLAUDE_API_KEY=your-anthropic-api-key
CLAUDE_MODEL=claude-sonnet-4-6

# Yahoo Finance (RapidAPI)
RAPIDAPI_KEY=your-rapidapi-key

# Email (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:8001/api/auth/google/callback

# Turso Cache Database
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# Frontend URL (used for email links and CORS)
FRONTEND_URL=http://localhost:3000
```

### 11.2 Docker Setup

The application provides three Docker Compose configurations:

#### Production (`docker-compose.yml`)
```
Services:
  - mongodb     (Mongo 7, port 27017, with health check)
  - backend     (FastAPI, port 8001, depends on mongodb)
  - frontend    (Nginx serving React build, port 80)

Volumes:
  - mongo_data  (persistent MongoDB storage)
```

#### Development (`docker-compose.dev.yml`)
Used as an overlay on top of the production file. Adds:
- Hot-reload for backend (Uvicorn `--reload`)
- Source code mounted as volumes for live editing
- Mongo Express admin UI on port 8081

#### Local Cloud (`docker-compose.local.yml`)
- No local MongoDB container (uses MongoDB Atlas cloud)
- Only backend + frontend containers

### 11.3 Running Locally

**Option 1: Docker (recommended)**
```bash
# Copy environment file
cp .env.example .env
# Edit .env with your API keys

# Start all services
npm run docker:up

# Or for development with hot-reload
npm run docker:dev
```

Access: Frontend at `http://localhost:80`, Backend at `http://localhost:8001`

**Option 2: Without Docker**

Terminal 1 — Backend:
```bash
cd apps/api
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Terminal 2 — Frontend:
```bash
cd apps/web
npm install
npm run dev
```

Terminal 3 — MongoDB:
```bash
# Must have MongoDB running locally or use Atlas URI in .env
```

Access: Frontend at `http://localhost:3000`, Backend at `http://localhost:8001`

**Option 3: Turborepo**
```bash
npm install      # Install all dependencies
npm run dev      # Start both apps concurrently
```

### 11.4 Production Deployment

**Backend Dockerfile** (`apps/api/Dockerfile`):
- Base image: `python:3.10-slim`
- Installs dependencies from `requirements.txt`
- Runs: `uvicorn app.main:app --host 0.0.0.0 --port 8001`

**Frontend Dockerfile** (`apps/web/Dockerfile`):
- Build stage: Node.js, `npm install`, `npm run build` (produces static files in `dist/`)
- Serve stage: `nginx:stable-alpine` serves the static files
- Nginx proxies `/api` requests to the backend container
- Health check: HTTP GET to port 80 every 30 seconds

**Frontend on Vercel:**
- The React app can also be deployed to Vercel as a static site
- Set build command: `npm run build`
- Set output directory: `dist`
- Set `VITE_API_BASE_URL` environment variable to the backend URL

---

## 12. Third-Party Services

### 12.1 Anthropic Claude API

- **Purpose:** AI-powered market analysis and web search
- **Model used:** `claude-sonnet-4-6`
- **Features used:** Text generation, web search tool (`web_search_20250305`), streaming
- **Authentication:** API key via `CLAUDE_API_KEY` environment variable
- **Rate control:** Max 8 web searches per analysis request
- **Documentation:** https://docs.anthropic.com

### 12.2 Yahoo Finance via RapidAPI

- **Purpose:** Real-time stock market data
- **Host:** `yahoo-finance174.p.rapidapi.com`
- **Data provided:** Stock quotes, market movers, company profiles, stock search
- **Authentication:** API key via `RAPIDAPI_KEY` in `X-RapidAPI-Key` header
- **Fallback:** Mock data for 9 popular stocks when rate-limited
- **Documentation:** Available on RapidAPI marketplace

### 12.3 Google OAuth 2.0

- **Purpose:** Social login (sign in with Google)
- **Scopes:** `email`, `profile`
- **Configuration:** Client ID, Client Secret, Redirect URI
- **User data received:** Email, name, profile picture, Google user ID
- **Documentation:** https://developers.google.com/identity

### 12.4 MongoDB Atlas

- **Purpose:** Primary database (users, tokens, API keys)
- **Connection:** Async via Motor driver with Beanie ODM
- **Features used:** Document storage, unique indexes, TTL
- **Free tier:** 512 MB storage, shared cluster

### 12.5 Turso

- **Purpose:** AI result caching and search history storage
- **Protocol:** libSQL (SQLite-compatible, cloud-hosted)
- **Connection:** Via `libsql-experimental` Python client
- **Features used:** SQL tables, indexes, TTL-based expiration
- **Free tier:** 9 GB storage, 500 million row reads/month

### 12.6 Gmail SMTP

- **Purpose:** Sending verification and password reset emails
- **Host:** `smtp.gmail.com`
- **Port:** 587 (TLS)
- **Authentication:** Email + App Password (not regular password)
- **Library:** `aiosmtplib` (async, non-blocking)
- **Note:** Requires enabling "App Passwords" in Google account settings
