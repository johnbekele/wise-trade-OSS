# Wise Trade OSS

An AI-powered stock market analysis web application that combines real-time market data with intelligent news analysis to deliver actionable trading insights.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Demo Credentials](#demo-credentials)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Run with Docker (Recommended)](#run-with-docker-recommended)
  - [Run without Docker](#run-without-docker)
- [Frontend](#frontend)
  - [Pages](#pages)
  - [Components](#components)
  - [State Management](#state-management)
- [Backend](#backend)
  - [API Endpoints](#api-endpoints)
  - [Services](#services)
  - [Data Models](#data-models)
- [AI Agent Pipeline](#ai-agent-pipeline)
- [Database Design](#database-design)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [API Usage Examples](#api-usage-examples)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

Wise Trade is a full-stack web application that helps investors analyze the stock market using artificial intelligence. Instead of manually reading through dozens of news articles and checking stock prices across multiple websites, users ask a question like *"What's happening with tech stocks?"* and the AI agent:

1. **Collects real-time stock data** — prices, volume, gainers, losers, market movers
2. **Searches the web for breaking news** — earnings, Fed decisions, geopolitics, social media sentiment
3. **Synthesizes both into a clear analysis** — connects price movements to their causes and identifies opportunities

The platform also provides a stock dashboard with interactive charts, user authentication (email + Google OAuth), an admin panel for user management, and an API key system for programmatic access.

### Why Wise Trade?

| Problem | How Wise Trade Solves It |
|---|---|
| Information overload — too many sources to track | AI reads and synthesizes everything in seconds |
| Delayed insights — news is stale by the time you act | Real-time web search + streaming AI responses |
| Expensive tools — Bloomberg costs $25,000/year | Open source, self-hostable, ~$15-60/month to run |
| Disconnected data — price charts and news are on separate sites | Multi-phase pipeline connects price data to news causes |

---

## Features

### Stock Market Data
- **Real-time stock quotes** — price, change, volume, market cap, high/low
- **Market movers** — top gainers, top losers, and most active stocks
- **Stock search** — find any company by name or ticker symbol
- **Interactive charts** — price charts with multiple timeframes (5m, 15m, 30m, 1h, 1d)
- **Company profiles** — sector, industry, description, CEO, employee count

### AI-Powered Analysis
- **Deep Dive Analysis** — ask any market question and receive a comprehensive AI-generated report
- **Streaming responses** — analysis streams in real time as the AI processes (Server-Sent Events)
- **Market Impact News** — structured reports of the top news stories moving the market, with affected sectors, companies, and trading signals
- **Multi-phase pipeline** — parallel data collection (stock data + web search) followed by intelligent synthesis
- **Search history** — all past queries and results saved for reference
- **Two-tier caching** — in-memory (10 min) + Turso database (24 hours) to reduce costs by ~80%

### User Management
- **Email registration** with email verification
- **Google OAuth 2.0** — sign in with Google
- **Password reset** via email
- **JWT authentication** with access and refresh tokens

### Admin Dashboard
- **User management** — create, edit, delete users
- **AI access control** — block/unblock individual users from AI features
- **Platform statistics** — total users, active, verified, admins, AI-blocked
- **Password management** — admin can reset any user's password

### Developer API
- **API key generation** — create keys with optional expiration
- **External API endpoints** — access stock data and AI analysis programmatically
- **Key security** — keys are hashed before storage, only prefix is displayed
- **Usage tracking** — last-used timestamps on every key

---

## Demo Credentials

A test user is automatically created on every deployment:

| Field | Value |
|---|---|
| Email | `test@wisetrade.com` |
| Password | `test1234` |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| [React](https://react.dev) | 18.3 | UI framework |
| [Vite](https://vitejs.dev) | 4.5 | Build tool and dev server |
| [Tailwind CSS](https://tailwindcss.com) | 3.4 | Utility-first CSS styling |
| [React Router](https://reactrouter.com) | 6.30 | Client-side routing |
| [TanStack React Query](https://tanstack.com/query) | 5.28 | Server state management and caching |
| [Recharts](https://recharts.org) | 2.15 | Interactive stock price charts |
| [Axios](https://axios-http.com) | 1.13 | HTTP client |
| [Lucide React](https://lucide.dev) | 0.379 | Icon library |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| [FastAPI](https://fastapi.tiangolo.com) | 0.119 | Python web framework |
| [Uvicorn](https://www.uvicorn.org) | 0.24 | ASGI server |
| [Beanie](https://beanie-odm.dev) | 1.26 | Async MongoDB ODM |
| [Motor](https://motor.readthedocs.io) | 3.3 | Async MongoDB driver |
| [Pydantic](https://docs.pydantic.dev) | 2.10 | Data validation |
| [python-jose](https://python-jose.readthedocs.io) | 3.3 | JWT token handling |
| [passlib](https://passlib.readthedocs.io) + bcrypt | 1.7 / 4.0 | Password hashing |
| [Anthropic SDK](https://docs.anthropic.com) | 0.39+ | Claude AI integration |
| [aiosmtplib](https://aiosmtplib.readthedocs.io) | 4.0 | Async email sending |

### Infrastructure

| Technology | Purpose |
|---|---|
| [MongoDB Atlas](https://www.mongodb.com/atlas) | Primary database (users, tokens, API keys) |
| [Turso](https://turso.tech) | Edge SQL database for caching and search history |
| [Docker](https://www.docker.com) + Docker Compose | Containerization and orchestration |
| [Nginx](https://nginx.org) | Reverse proxy and static file serving |
| [Turborepo](https://turbo.build) | Monorepo task orchestration |

### External APIs

| Service | Purpose |
|---|---|
| [Anthropic Claude API](https://docs.anthropic.com) | AI analysis with web search |
| [Yahoo Finance (RapidAPI)](https://rapidapi.com) | Real-time stock market data |
| [Google OAuth 2.0](https://developers.google.com/identity) | Social login |
| Gmail SMTP | Transactional emails (verification, password reset) |

---

## Architecture

```
                        +---------------------------+
                        |       USER BROWSER        |
                        |                           |
                        |  React SPA (Vite)         |
                        |  Tailwind CSS + Recharts  |
                        +------------+--------------+
                                     |
                                     | HTTP / SSE
                                     v
+--------------------------------------------------------------------+
|                        FASTAPI SERVER                               |
|                                                                     |
|  +------------------+  +------------------+  +------------------+  |
|  | Auth Router      |  | Stocks Router    |  | AI Router        |  |
|  | /api/auth/*      |  | /api/stocks/*    |  | /api/ai/*        |  |
|  +------------------+  +------------------+  +------------------+  |
|  +------------------+  +------------------+  +------------------+  |
|  | Admin Router     |  | API Keys Router  |  | External Router  |  |
|  | /api/admin/*     |  | /api/api-keys/*  |  | /api/v1/ext/*    |  |
|  +------------------+  +------------------+  +------------------+  |
|                                                                     |
|  +--------------------------------------------------------------+  |
|  |                    AI AGENT PIPELINE                          |  |
|  |                                                               |  |
|  |  Phase 1A: Stock Data ---+                                   |  |
|  |  (Yahoo Finance)        |---> Phase 2: Synthesis (Claude)    |  |
|  |  Phase 1B: Web Intel ----+                                   |  |
|  |  (Claude + Web Search)                                       |  |
|  +--------------------------------------------------------------+  |
+----------+-------------------+-------------------+------------------+
           |                   |                   |
           v                   v                   v
   +---------------+  +---------------+  +------------------+
   |   MongoDB     |  |   Turso       |  |  External APIs   |
   |   (Atlas)     |  |   (libSQL)    |  |                  |
   |               |  |               |  |  Claude AI       |
   |  - users      |  |  - cache      |  |  Yahoo Finance   |
   |  - tokens     |  |  - history    |  |  Google OAuth    |
   |  - api_keys   |  |               |  |  Gmail SMTP      |
   +---------------+  +---------------+  +------------------+
```

---

## Project Structure

```
wise-trade-OSS/
|
+-- apps/
|   +-- api/                             # BACKEND (Python / FastAPI)
|   |   +-- app/
|   |   |   +-- main.py                  # App entry point, middleware, router registration
|   |   |   +-- core/
|   |   |   |   +-- config.py            # Environment variable loader
|   |   |   |   +-- database.py          # MongoDB connection with retry logic
|   |   |   |   +-- security.py          # JWT tokens, password hashing, auth middleware
|   |   |   |   +-- turso_db.py          # Turso cache and search history operations
|   |   |   |   +-- seeder.py            # Test user creation on startup
|   |   |   |   +-- startup_checks.py    # API key validation on startup
|   |   |   +-- models/
|   |   |   |   +-- users.py             # User document model
|   |   |   |   +-- auth.py              # AuthToken document model
|   |   |   |   +-- api_key.py           # ApiKey document model
|   |   |   +-- routers/
|   |   |   |   +-- auth.py              # Login, OAuth, verification, password reset
|   |   |   |   +-- users.py             # Signup, user listing
|   |   |   |   +-- stocks.py            # Stock quotes, search, market movers
|   |   |   |   +-- ai.py                # AI analysis, market impact, search history
|   |   |   |   +-- admin.py             # Admin user management, statistics
|   |   |   |   +-- api_keys.py          # API key CRUD
|   |   |   |   +-- test.py              # Health check endpoint
|   |   |   |   +-- external/
|   |   |   |       +-- stocks.py        # Stock API (API key auth)
|   |   |   |       +-- ai.py            # AI API (API key auth)
|   |   |   +-- services/
|   |   |   |   +-- auth_service.py      # Token management, login, verification
|   |   |   |   +-- users_service.py     # User creation, lookup
|   |   |   |   +-- api_key_service.py   # Key generation, validation, hashing
|   |   |   |   +-- email_service.py     # Async email sending via SMTP
|   |   |   |   +-- google_oauth_service.py  # Google OAuth token exchange
|   |   |   |   +-- yahoo_finance_service.py # Stock data + mock fallback
|   |   |   +-- schemas/
|   |   |   |   +-- user_schema.py       # User create/read/update schemas
|   |   |   |   +-- auth_schema.py       # Login, token, reset schemas
|   |   |   |   +-- api_key_schema.py    # API key request/response schemas
|   |   |   +-- repositories/
|   |   |   |   +-- users_repository.py  # User database queries
|   |   |   +-- LLM/
|   |   |   |   +-- api_agent.py         # Multi-phase AI analysis pipeline
|   |   |   +-- utils/
|   |   |       +-- email_templates.py   # HTML email templates
|   |   +-- requirements.txt             # Python dependencies (49 packages)
|   |   +-- Dockerfile                   # Python 3.10-slim container
|   |   +-- README.md
|   |
|   +-- web/                              # FRONTEND (React / Vite)
|       +-- src/
|       |   +-- App.jsx                   # Root component, React Query, routing
|       |   +-- main.jsx                  # DOM entry point
|       |   +-- index.css                 # Tailwind base styles
|       |   +-- pages/
|       |   |   +-- Dashboard.jsx         # Watchlist + market movers
|       |   |   +-- StockDetail.jsx       # Stock chart + company info
|       |   |   +-- NewsAnalysis.jsx      # AI analysis + market impact + history
|       |   |   +-- AdminPanel.jsx        # User management + statistics
|       |   |   +-- ApiKeys.jsx           # API key management
|       |   |   +-- ApiDocumentation.jsx  # API reference page
|       |   |   +-- Login.jsx             # Email + Google login
|       |   |   +-- Signup.jsx            # Registration form
|       |   |   +-- EmailVerification.jsx # Email verification handler
|       |   |   +-- ForgotPassword.jsx    # Password reset request
|       |   |   +-- ResetPassword.jsx     # New password form
|       |   |   +-- ResendVerification.jsx # Resend verification email
|       |   +-- components/
|       |   |   +-- Layout.jsx            # Navbar + sidebar wrapper
|       |   |   +-- StockCard.jsx         # Individual stock display card
|       |   |   +-- StockChart.jsx        # Recharts price chart
|       |   |   +-- StockSearch.jsx       # Search autocomplete input
|       |   +-- context/
|       |   |   +-- AuthContext.jsx       # Global auth state (user, token, methods)
|       |   +-- hooks/
|       |   |   +-- useStocks.js          # Stock data React Query hooks
|       |   |   +-- useNews.js            # AI analysis + SSE streaming hooks
|       |   |   +-- useSearchHistory.js   # Search history hook
|       |   |   +-- useAdmin.js           # Admin operations hooks
|       |   +-- services/
|       |   |   +-- api.js               # Axios client + all API endpoint functions
|       |   +-- config/
|       |   |   +-- config.js            # API base URL configuration
|       |   +-- utils/
|       |       +-- helpers.js           # Utility functions
|       +-- package.json                  # Node dependencies
|       +-- vite.config.js               # Vite dev server + API proxy
|       +-- tailwind.config.js           # Custom theme (colors, fonts, shadows)
|       +-- nginx.conf                   # Production reverse proxy config
|       +-- Dockerfile                   # Multi-stage build (Node + Nginx)
|       +-- README.md
|
+-- docs/
|   +-- Wise_Trade_Project_Proposal.md   # Project proposal document
|   +-- Wise_Trade_Documentation.md      # Full technical documentation
|
+-- docker-compose.yml                   # Production (MongoDB + Backend + Frontend)
+-- docker-compose.dev.yml               # Development overlay (hot reload + Mongo Express)
+-- docker-compose.local.yml             # Local dev with cloud databases
+-- turbo.json                           # Turborepo task configuration
+-- package.json                         # Root workspace scripts
+-- .env.example                         # Environment variable template
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and **npm** 10+
- **Python** 3.10+
- **Docker** and **Docker Compose** (recommended)
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)

You will also need API keys for:
- [Anthropic](https://console.anthropic.com) — Claude AI (required for AI features)
- [RapidAPI](https://rapidapi.com) — Yahoo Finance API (required for stock data)
- [Google Cloud Console](https://console.cloud.google.com) — OAuth 2.0 (optional, for Google login)
- [Turso](https://turso.tech) — Edge database (optional, for caching)

### Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
# MongoDB
MONGO_URI=mongodb://admin:changeme@localhost:27017/wisetrade?authSource=admin
MONGO_USERNAME=admin
MONGO_PASSWORD=changeme
MONGO_DATABASE=wisetrade

# JWT Security (generate random strings for these)
SECRET_KEY=your-secret-key-here
REFRESH_SECRET_KEY=your-refresh-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Claude AI (required for AI features)
CLAUDE_API_KEY=sk-ant-your-key-here
CLAUDE_MODEL=claude-sonnet-4-6

# Yahoo Finance via RapidAPI (required for stock data)
RAPIDAPI_KEY=your-rapidapi-key-here

# Email - Gmail SMTP (required for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Google OAuth (optional - for "Login with Google")
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:8001/api/auth/google/callback

# Turso Cache (optional - for AI result caching)
TURSO_DATABASE_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your-turso-token

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Run with Docker (Recommended)

**Production mode:**
```bash
docker compose up --build
```
This starts MongoDB, the FastAPI backend, and the Nginx frontend. Access the app at `http://localhost`.

**Development mode (with hot reload):**
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```
This adds hot-reload for both frontend and backend, plus Mongo Express at `http://localhost:8081`.

**Local mode (cloud databases):**
```bash
docker compose -f docker-compose.local.yml up --build
```
Uses your MongoDB Atlas and Turso cloud instances instead of a local MongoDB container.

### Run without Docker

**Terminal 1 — Backend:**
```bash
cd apps/api
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 — Frontend:**
```bash
cd apps/web
npm install
npm run dev
```

**Terminal 3 — MongoDB** (if not using Atlas):
```bash
# Make sure MongoDB is running locally on port 27017
# Or use the Docker MongoDB only:
docker compose up mongodb
```

**Using Turborepo (both apps at once):**
```bash
npm install
npm run dev
```

### Access the Application

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` (dev) or `http://localhost` (Docker) |
| Backend API | `http://localhost:8001` |
| API Docs (Swagger) | `http://localhost:8001/docs` |
| Mongo Express | `http://localhost:8081` (dev Docker only) |

---

## Frontend

### Pages

| Page | Route | Description |
|---|---|---|
| **Dashboard** | `/` | Stock watchlist with add/remove, market movers (gainers, losers, active), stock search |
| **Stock Detail** | `/stock/:symbol` | Interactive price chart (Recharts) with 5 timeframes, company profile, key statistics |
| **News Analysis** | `/news` | AI deep dive with streaming responses, market impact cards with severity badges, search history |
| **Admin Panel** | `/admin` | Statistics dashboard, user table with search, create/edit/delete users, AI access control |
| **API Keys** | `/api-keys` | Generate API keys, view active keys, copy-to-clipboard, usage tracking, delete keys |
| **API Docs** | `/api-docs` | Interactive API documentation with endpoint reference and curl examples |
| **Login** | `/login` | Email/password form + Google OAuth button |
| **Signup** | `/signup` | Registration form (username, email, password, name) |
| **Email Verification** | `/verify-email` | Handles email verification token from URL |
| **Forgot Password** | `/forgot-password` | Request password reset email |
| **Reset Password** | `/reset-password` | Set new password using reset token |
| **Resend Verification** | `/resend-verification` | Resend verification email |

### Components

| Component | Description |
|---|---|
| `Layout` | Main page wrapper with sticky header, collapsible sidebar navigation, user profile display, and responsive mobile menu |
| `StockCard` | Displays stock symbol, price, change percentage (green/red), and key stats (high, low, volume). Clickable to navigate to detail page |
| `StockChart` | Interactive area/line chart built with Recharts. Supports multiple timeframes with interval selector buttons |
| `StockSearch` | Search input with autocomplete dropdown. Debounced API calls as user types |

### State Management

| Type | Tool | Scope |
|---|---|---|
| Authentication | React Context (`AuthContext`) | Global — user object, JWT token, login/signup/logout methods |
| Server data | TanStack React Query | Per-hook — stock quotes, AI results, user lists, with automatic caching and refetching |
| UI state | React `useState` | Local — form inputs, modals, tabs, loading indicators |

### Custom Hooks

| Hook | Description |
|---|---|
| `useStockQuote(symbol)` | Fetches a single stock quote (30s cache) |
| `useWatchlist(symbols)` | Fetches multiple stock quotes for the watchlist |
| `useMarketMovers()` | Fetches top gainers, losers, and most active |
| `useStockSearch(keywords)` | Searches stocks by name/symbol |
| `useStockDetail(symbol, interval)` | Composite hook: quote + intraday chart + company overview |
| `useMarketImpactNews(limit)` | Fetches AI-generated market impact news |
| `useNewsAnalysis()` | SSE streaming hook for real-time AI analysis with phase tracking |
| `useSearchHistory(limit)` | Fetches user's past AI queries and results |
| `useAdminUsers()` | Fetches all users for admin panel |
| `useAdminStats()` | Fetches platform statistics |

---

## Backend

### API Endpoints

#### Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/login` | No | Login with email/password, returns JWT tokens |
| GET | `/me` | JWT | Get current user profile |
| GET | `/verify-email?token=` | No | Verify email address |
| POST | `/forgot-password` | No | Send password reset email |
| POST | `/reset-password` | No | Reset password with token |
| POST | `/resend-email-verification` | No | Resend verification email |
| GET | `/google/login` | No | Start Google OAuth flow |
| GET | `/google/callback` | No | Google OAuth callback |
| GET | `/google/me` | Cookie | Get Google user from session |
| POST | `/google/logout` | Cookie | Clear Google session |

#### Users — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/signup` | No | Register new user |
| GET | `/` | JWT | List all users |
| POST | `/get-user/{user_id}` | JWT | Get user by ID |
| DELETE | `/{user_id}` | JWT | Delete user |

#### Stocks — `/api/stocks`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/quote/{symbol}` | JWT | Real-time stock quote |
| GET | `/search?keywords=` | JWT | Search stocks by name or symbol |
| GET | `/market-movers` | JWT | Top gainers, losers, most active |
| GET | `/profile/{symbol}` | JWT | Company profile |
| GET | `/candles/{symbol}?resolution=&days=` | JWT | Candlestick chart data |

#### AI Analysis — `/api/ai`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/analyze-news/stream?query=` | JWT | Stream AI analysis via SSE |
| GET | `/analyze-news/{query}` | JWT | AI analysis (non-streaming) |
| POST | `/analyze-news` | JWT | AI analysis with JSON body |
| GET | `/market-impact?limit=&force_refresh=` | JWT | Structured market impact news |
| GET | `/search-history?limit=` | JWT | User's past AI searches |

#### API Keys — `/api/api-keys`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/` | JWT | Create new API key |
| GET | `/` | JWT | List user's API keys |
| DELETE | `/{api_key_id}` | JWT | Delete API key |

#### Admin — `/api/admin`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users?skip=&limit=` | Admin | List users (paginated) |
| POST | `/users` | Admin | Create user |
| GET | `/users/{user_id}` | Admin | Get user details |
| PUT | `/users/{user_id}` | Admin | Update user |
| PUT | `/users/{user_id}/password` | Admin | Change user password |
| PUT | `/users/{user_id}/block-ai?blocked=` | Admin | Toggle AI access |
| DELETE | `/users/{user_id}` | Admin | Delete user |
| GET | `/stats` | Admin | Platform statistics |

#### External API — `/api/v1/external`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/stocks/{symbol}` | API Key | Stock quote |
| GET | `/ai/analyze-news?query=` | API Key | AI analysis |
| GET | `/ai/market-impact?limit=` | API Key | Market impact news |

**Total: 34 endpoints**

### Services

| Service | File | Responsibility |
|---|---|---|
| `AuthService` | `services/auth_service.py` | Login, token creation/verification, email verification, password reset |
| `UserService` | `services/users_service.py` | User creation, lookup by email/ID |
| `ApiKeyService` | `services/api_key_service.py` | Key generation, hashing, validation, lookup |
| `EmailService` | `services/email_service.py` | Async SMTP email sending (verification, reset) |
| `GoogleOAuthService` | `services/google_oauth_service.py` | OAuth URL generation, code exchange, user sync |
| `YahooFinanceService` | `services/yahoo_finance_service.py` | Stock data fetching, 195+ company mappings, mock fallback |
| `APIAgent` | `LLM/api_agent.py` | Multi-phase AI analysis pipeline |

### Data Models

#### User
```python
class User(Document):
    username: str                      # Unique display name
    first_name: str
    last_name: str
    email: EmailStr                    # Unique email
    hashed_password: Optional[str]     # Null for Google OAuth users
    is_active: bool = False            # Activated after email verification
    is_verified: bool = False          # Email verified
    is_super_Admin: bool = False       # Admin privileges
    ai_access_blocked: bool = False    # AI feature restriction
    google_id: Optional[str]           # Google account ID
    profile_picture: Optional[str]     # Google profile picture URL
    auth_provider: str = "email"       # "email" or "google"
    created_at: datetime
    updated_at: datetime
```

#### AuthToken
```python
class AuthToken(Document):
    token: str                         # JWT string
    token_type: Literal["access", "refresh", "password_reset", "email_verification"]
    user_id: str                       # Reference to User
    created_at: datetime
    expires_at: datetime
```

#### ApiKey
```python
class ApiKey(Document):
    key: str                           # Hashed key (never plain text)
    key_prefix: str                    # First 8 chars (for display)
    user_id: Indexed(str)              # Owner reference (indexed)
    name: str                          # User-friendly label
    is_active: bool = True
    created_at: datetime
    last_used_at: Optional[datetime]   # Updated on each use
    expires_at: Optional[datetime]     # Optional expiration
```

---

## AI Agent Pipeline

The AI agent is the core feature of Wise Trade. It uses Anthropic's Claude API to perform a **three-phase analysis pipeline**:

```
User: "What's happening with tech stocks?"
              |
              v
     +------------------+
     |   CACHE CHECK    |
     |                  |
     |  L1: Memory      |  hit
     |     (10 min)     +-------> Return instantly
     |  L2: Turso DB    |  hit
     |     (24 hours)   +-------> Return from cache
     +--------+---------+
              | miss
              v
 +------------+-------------+
 |                           |
 v                           v
Phase 1A                  Phase 1B
STOCK DATA                WEB INTELLIGENCE
                          
- Fetch live quotes       - Claude + web_search tool
  from Yahoo Finance      - Up to 8 web searches
- Get market movers       - Breaking news
- Claude identifies:      - Fed decisions, GDP, jobs
  - Price patterns        - Geopolitical events
  - Volume anomalies      - Social media sentiment
  - Sector rotations      - Insider activity
  - Technical signals     - Global market moves
 |                           |
 +------------+--------------+
              |
              v
        +----------+
        | Phase 2  |
        | SYNTHESIS|
        |          |
        | Claude connects stock
        | data patterns to news
        | causes, identifies
        | opportunities and risks
        +-----+----+
              |
              v
    +-------------------+
    | - Stream to user  |
    | - Cache in L1+L2  |
    | - Save to history |
    +-------------------+
```

### System Prompts

| Phase | AI Role | Focus |
|---|---|---|
| **1A** | Quantitative analyst | Price patterns, volume anomalies, sector rotation, technical signals |
| **1B** | Intelligence researcher | Breaking news, economic data, geopolitics, sentiment, insider moves |
| **2** | Chief Market Strategist | Connect data to news, identify opportunities, assess risks |

### Caching

| Layer | Storage | TTL | Speed |
|---|---|---|---|
| L1 | Python dictionary | 10 minutes | Instant (no I/O) |
| L2 | Turso cloud database | 24 hours | Fast (single SQL query) |

This reduces Claude API costs by ~80% for repeated queries.

---

## Database Design

### MongoDB Collections

```
+========================+
|         USERS          |
+========================+         +========================+
| _id          (PK)      |----+    |      AUTH_TOKENS       |
| username     (unique)  |    |    +========================+
| email        (unique)  |    +--->| _id          (PK)      |
| hashed_password        |    |    | token                  |
| first_name             |    |    | token_type             |
| last_name              |    |    | user_id      (FK)      |
| is_active              |    |    | created_at             |
| is_verified            |    |    | expires_at             |
| is_super_Admin         |    |    +========================+
| ai_access_blocked      |    |
| google_id              |    |    +========================+
| profile_picture        |    |    |       API_KEYS         |
| auth_provider          |    |    +========================+
| created_at             |    +--->| _id          (PK)      |
| updated_at             |         | key          (hashed)  |
+========================+         | key_prefix   (indexed) |
                                   | user_id      (FK, idx) |
                                   | name                   |
                                   | is_active              |
                                   | created_at             |
                                   | last_used_at           |
                                   | expires_at             |
                                   +========================+
```

### Turso SQL Tables

```sql
-- AI analysis result cache (24-hour TTL)
CREATE TABLE analysis_cache (
    cache_key   TEXT PRIMARY KEY,
    result_json TEXT NOT NULL,
    query       TEXT NOT NULL,
    cache_type  TEXT NOT NULL,        -- "deep_dive" or "market_impact"
    created_at  TEXT NOT NULL,
    expires_at  TEXT NOT NULL
);

-- User search history
CREATE TABLE search_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     TEXT NOT NULL,
    query       TEXT NOT NULL,
    result_text TEXT NOT NULL,
    created_at  TEXT NOT NULL
);

CREATE INDEX idx_search_history_user ON search_history(user_id, created_at DESC);
```

---

## Authentication

### Supported Methods

| Method | How It Works |
|---|---|
| **Email/Password** | Register, verify email, login with JWT (access + refresh tokens stored in localStorage) |
| **Google OAuth 2.0** | Redirect to Google consent screen, callback creates/links user, returns JWT |
| **API Key** | Generated from dashboard, sent via `X-API-Key` header for external API access |

### Token Configuration

| Token | Expiration | Algorithm |
|---|---|---|
| Access token | 30 minutes | HS256 |
| Refresh token | 7 days | HS256 |
| Verification token | 15 minutes | HS256 |
| Reset token | 15 minutes | HS256 |

### Authorization Roles

| Role | Access |
|---|---|
| Unauthenticated | Login, signup, password reset pages only |
| Regular user | Stocks, AI analysis, API keys, own profile |
| AI-blocked user | Everything except AI analysis endpoints |
| Super admin | Full access + admin panel |
| API key holder | External API endpoints only |

---

## Deployment

### Docker Production

```bash
# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f

# Stop
docker compose down
```

Services started:
- **mongodb** — MongoDB 7 on port 27017 (with health check)
- **backend** — FastAPI on port 8001 (waits for healthy MongoDB)
- **frontend** — Nginx on port 80 (serves React build, proxies `/api` to backend)

### Vercel (Frontend Only)

The React frontend can be deployed to Vercel:

1. Connect repo to Vercel
2. Set root directory to `apps/web`
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable: `VITE_API_BASE_URL=https://your-backend-url`

### Startup Behavior

On every deployment, the backend automatically:

1. Validates API key configuration
2. Connects to MongoDB (3 retries with 5-second delays)
3. Initializes Beanie ODM (User, AuthToken, ApiKey models)
4. **Creates the test user** (`test@wisetrade.com` / `test1234`) if it doesn't exist
5. Creates Turso cache tables if they don't exist

---

## API Usage Examples

### Login
```bash
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test@wisetrade.com", "password": "test1234"}'
```

### Get Stock Quote
```bash
curl http://localhost:8001/api/stocks/quote/AAPL \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### AI Analysis (Streaming)
```bash
curl -N http://localhost:8001/api/ai/analyze-news/stream?query=tech+stocks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Market Impact News
```bash
curl http://localhost:8001/api/ai/market-impact?limit=10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using API Key (External)
```bash
# Generate key from /api-keys page first, then:
curl http://localhost:8001/api/v1/external/stocks/TSLA \
  -H "X-API-Key: YOUR_API_KEY"
```

---

## Scripts Reference

### Root (Turborepo)

```bash
npm run dev          # Start both frontend and backend
npm run build        # Build both apps
npm run dev:web      # Start frontend only
npm run dev:api      # Start backend only
npm run docker:up    # Production Docker
npm run docker:dev   # Development Docker (hot reload)
npm run docker:down  # Stop Docker containers
```

### Frontend (`apps/web`)

```bash
npm run dev          # Vite dev server on port 3000
npm run build        # Production build to dist/
npm run preview      # Preview production build
```

### Backend (`apps/api`)

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).
