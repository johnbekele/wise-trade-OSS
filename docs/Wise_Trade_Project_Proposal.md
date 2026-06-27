# Wise Trade — Project Proposal

**Course:** Web Application Development
**Student:** Yohannes Bekele
**Date:** June 25, 2026

---

## 1. Project Title

**Wise Trade** — AI-Powered Stock Market Analysis Web Application

---

## 2. Brief Description

Wise Trade is a full-stack web application that helps users analyze the stock market using artificial intelligence. The application combines real-time stock market data (prices, market movers, company profiles) with AI-powered news analysis to give users actionable trading insights.

The core idea is simple: instead of manually reading dozens of news articles and checking stock prices across multiple websites, a user types a question like *"What's happening with tech stocks?"* and the AI agent automatically:

1. Collects real-time stock data (prices, volume, gainers/losers)
2. Searches the web for breaking news, economic reports, and global events
3. Synthesizes both into a clear, actionable analysis

The platform also includes user authentication (email and Google login), an admin dashboard for user management, and an API key system so developers can access the data programmatically.

---

## 3. Problem Statement

Retail (individual) investors face three major challenges:

1. **Information overload** — Stock prices, news articles, economic reports, and social media posts are scattered across dozens of websites. It is impossible to process all of it manually in real time.
2. **Delayed insights** — By the time a regular investor reads a news article and understands how it affects a specific stock, professional traders have already acted on it.
3. **High cost of tools** — Professional trading terminals (Bloomberg, Refinitiv) cost $20,000+/year, putting them out of reach for students and individual investors.

**Wise Trade solves this** by using AI to do the research automatically and deliver a synthesized analysis in seconds, for free.

---

## 4. Target Users

| User Type | Need |
|---|---|
| Individual investors | Quick, AI-generated market insights without manual research |
| Finance students | Learning tool to understand how news affects stock prices |
| Developers | API access to build their own trading tools on top of Wise Trade |
| Platform administrators | Manage users, control access, monitor platform usage |

---

## 5. Key Features

### 5.1 User-Facing Features

| # | Feature | Description |
|---|---|---|
| 1 | **Stock Dashboard** | View real-time stock prices, daily gainers/losers, and most active stocks |
| 2 | **Stock Detail Page** | Interactive price chart with multiple timeframes, company profile, and key statistics |
| 3 | **Stock Search** | Search for any company by name or ticker symbol |
| 4 | **AI Deep Dive Analysis** | Ask any market question and receive a comprehensive AI-generated analysis with streaming (real-time) response |
| 5 | **Market Impact News** | AI identifies the top news stories currently moving the market, with affected sectors and trading signals |
| 6 | **Search History** | View past AI queries and their results |
| 7 | **User Registration & Login** | Sign up with email/password or Google account |
| 8 | **Email Verification** | Verify account via email link |
| 9 | **Password Reset** | Forgot password flow via email |
| 10 | **API Key Management** | Generate API keys for programmatic access to the platform |

### 5.2 Admin Features

| # | Feature | Description |
|---|---|---|
| 1 | **User Management** | View, create, edit, and delete user accounts |
| 2 | **AI Access Control** | Block or unblock specific users from AI features |
| 3 | **Platform Statistics** | Dashboard showing total users, verified users, active users, admin count |
| 4 | **Password Management** | Reset any user's password |

---

## 6. Technology Stack

### 6.1 Overview

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS | User interface (Single Page Application) |
| **Backend** | FastAPI (Python) | REST API server |
| **Primary Database** | MongoDB (Atlas) | Store users, tokens, API keys |
| **Cache Database** | Turso (libSQL) | Cache AI results, store search history |
| **AI Engine** | Anthropic Claude API | Market analysis, web search, text generation |
| **Market Data** | Yahoo Finance (RapidAPI) | Real-time stock quotes and market data |
| **Authentication** | JWT + Google OAuth 2.0 | User login and session management |
| **Email** | Gmail SMTP | Verification and password reset emails |
| **Deployment** | Docker, Nginx, Vercel | Containerized deployment |
| **Monorepo** | Turborepo | Manage frontend and backend in one repository |

### 6.2 Why These Technologies?

- **React + Vite** — Industry-standard frontend framework; Vite provides fast development builds
- **FastAPI** — Modern Python web framework with automatic API documentation, async support, and built-in data validation
- **MongoDB** — Flexible document database; no rigid schema means the user model can evolve easily
- **Turso** — Lightweight edge SQL database; perfect for caching (cheaper and faster than hitting the AI API repeatedly)
- **Claude API** — Advanced AI with built-in web search capability, enabling real-time news gathering
- **Docker** — Ensures the app runs identically on any machine

---

## 7. System Architecture

```
+--------------------------------------------------+
|                   CLIENT (Browser)                |
|                                                   |
|   React SPA (Vite + Tailwind CSS)                |
|   - Dashboard        - Stock Detail               |
|   - News Analysis    - Admin Panel                |
|   - Login/Signup     - API Keys                   |
|                                                   |
+------------------------+-------------------------+
                         | HTTP / SSE (Streaming)
                         v
+--------------------------------------------------+
|                  API SERVER                        |
|                                                   |
|   FastAPI (Python) on Uvicorn                     |
|                                                   |
|   Routers:                                        |
|   /api/auth      - Login, signup, OAuth, verify   |
|   /api/stocks    - Quotes, search, market movers  |
|   /api/ai        - AI analysis, market impact     |
|   /api/api-keys  - Key generation & management    |
|   /api/admin     - User management, statistics    |
|   /api/v1/external - Public API (API key auth)    |
|                                                   |
|   Services:                                       |
|   AuthService, UserService, EmailService,         |
|   YahooFinanceService, GoogleOAuthService,        |
|   ApiKeyService, AIAgent (LLM)                    |
|                                                   |
+-------+------------------+-----------------------+
        |                  |            |
        v                  v            v
+-------------+  +---------------+  +--------------+
|  MongoDB    |  |  Turso        |  | External APIs|
|  (Atlas)    |  |  (libSQL)     |  |              |
|             |  |               |  | - Claude AI  |
| - users     |  | - analysis_   |  | - Yahoo      |
| - auth_     |  |   cache       |  |   Finance    |
|   tokens    |  | - search_     |  | - Google     |
| - api_keys  |  |   history     |  |   OAuth      |
+-------------+  +---------------+  | - Gmail SMTP |
                                    +--------------+
```

---

## 8. Database Model

The application uses **two databases**: MongoDB for core entities and Turso (SQL) for caching.

### 8.1 MongoDB Collections

#### 8.1.1 Entity Relationship Diagram

```
+========================+
|        USERS           |
+========================+
| _id        : ObjectId  |  (PK)
| username   : String    |
| first_name : String    |
| last_name  : String    |
| email      : String    |  (unique)
| hashed_    : String?   |  (null for Google OAuth users)
|   password             |
| is_active  : Boolean   |
| is_verified: Boolean   |
| is_super_  : Boolean   |
|   Admin                |
| ai_access_ : Boolean   |
|   blocked              |
| reset_token: String?   |
| google_id  : String?   |
| profile_   : String?   |
|   picture              |
| auth_      : String    |  ("email" or "google")
|   provider             |
| created_at : DateTime  |
| updated_at : DateTime  |
+========================+
        |  1
        |
        |  has many
        |
        v  *
+========================+          +========================+
|     AUTH_TOKENS        |          |       API_KEYS         |
+========================+          +========================+
| _id       : ObjectId  | (PK)     | _id       : ObjectId  | (PK)
| token     : String    |          | key       : String    | (hashed)
| token_type: String    |          | key_prefix: String    | (first 8 chars)
|   ("access"|"refresh" |          | user_id   : String    | (FK -> Users)
|   |"password_reset"   |          | name      : String    |
|   |"email_            |          | is_active : Boolean   |
|     verification")    |          | created_at: DateTime  |
| user_id   : String    | (FK)     | last_used_: DateTime? |
| created_at: DateTime  |          |   at                  |
| expires_at: DateTime  |          | expires_at: DateTime? |
+========================+          +========================+
                                          |  1
                                          |
                                          |  authenticates
                                          |
                                          v  *
                                   +========================+
                                   |  EXTERNAL API ACCESS   |
                                   |  (via /api/v1/external)|
                                   +========================+
                                   | Stocks, AI Analysis,   |
                                   | Market Impact          |
                                   +========================+
```

**Relationships:**
- **Users → Auth Tokens:** One-to-Many (a user can have multiple active tokens)
- **Users → API Keys:** One-to-Many (a user can generate multiple API keys)

#### 8.1.2 Users Collection

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | Auto-generated | Primary key |
| `username` | String | Yes | — | Unique display name |
| `first_name` | String | Yes | — | User's first name |
| `last_name` | String | Yes | — | User's last name |
| `email` | String (Email) | Yes | — | Unique email address |
| `hashed_password` | String | No | null | Bcrypt-hashed password (null for Google users) |
| `is_active` | Boolean | No | false | Account activated |
| `is_verified` | Boolean | No | false | Email verified |
| `is_super_Admin` | Boolean | No | false | Admin privileges |
| `ai_access_blocked` | Boolean | No | false | Blocked from AI features |
| `reset_token` | String | No | null | Password reset token |
| `google_id` | String | No | null | Google account ID |
| `profile_picture` | String | No | null | Profile picture URL |
| `auth_provider` | String | No | "email" | "email" or "google" |
| `created_at` | DateTime | No | Current time | Account creation timestamp |
| `updated_at` | DateTime | No | Current time | Last update timestamp |

#### 8.1.3 Auth Tokens Collection

| Field | Type | Required | Description |
|---|---|---|---|
| `_id` | ObjectId | Auto | Primary key |
| `token` | String | Yes | The JWT token string |
| `token_type` | String | Yes | One of: "access", "refresh", "password_reset", "email_verification" |
| `user_id` | String | Yes | Reference to the user (foreign key) |
| `created_at` | DateTime | Yes | Token creation time |
| `expires_at` | DateTime | Yes | Token expiration time |

#### 8.1.4 API Keys Collection

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `_id` | ObjectId | Auto | Auto-generated | Primary key |
| `key` | String | Yes | — | Hashed API key (never stored in plain text) |
| `key_prefix` | String | Yes | — | First 8 characters (for display only) |
| `user_id` | String | Yes | — | Owner's user ID (indexed) |
| `name` | String | Yes | — | User-friendly label |
| `is_active` | Boolean | No | true | Whether the key is active |
| `created_at` | DateTime | No | Current time | Key creation time |
| `last_used_at` | DateTime | No | null | Last usage timestamp |
| `expires_at` | DateTime | No | null | Optional expiration date |

### 8.2 Turso (SQL) Tables

These tables handle caching and history — data that is temporary or high-volume.

#### 8.2.1 analysis_cache

| Column | Type | Constraint | Description |
|---|---|---|---|
| `cache_key` | TEXT | PRIMARY KEY | Hash of the query (unique identifier) |
| `result_json` | TEXT | NOT NULL | The full AI response stored as JSON |
| `query` | TEXT | NOT NULL | The original user query |
| `cache_type` | TEXT | NOT NULL | "deep_dive" or "market_impact" |
| `created_at` | TEXT | NOT NULL | ISO timestamp of cache creation |
| `expires_at` | TEXT | NOT NULL | ISO timestamp of expiration (24h TTL) |

#### 8.2.2 search_history

| Column | Type | Constraint | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Auto-incrementing ID |
| `user_id` | TEXT | NOT NULL | Reference to the user who searched |
| `query` | TEXT | NOT NULL | The search query text |
| `result_text` | TEXT | NOT NULL | The AI analysis result |
| `created_at` | TEXT | NOT NULL | ISO timestamp of the search |

**Index:** `idx_search_history_user` on (`user_id`, `created_at` DESC) — for fast retrieval of a user's recent searches.

---

## 9. API Endpoints Summary

### 9.1 Authentication (8 endpoints)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | No | Login with email and password |
| GET | `/api/auth/me` | JWT | Get current logged-in user |
| GET | `/api/auth/verify-email` | No | Verify email with token |
| POST | `/api/auth/forgot-password` | No | Request password reset email |
| POST | `/api/auth/reset-password` | No | Reset password using token |
| POST | `/api/auth/resend-email-verification` | No | Resend verification email |
| GET | `/api/auth/google/login` | No | Start Google OAuth flow |
| GET | `/api/auth/google/callback` | No | Google OAuth callback |

### 9.2 Users (2 endpoints)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/users/signup` | No | Register a new user |
| GET | `/api/users/` | JWT | List all users |

### 9.3 Stocks (5 endpoints)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/stocks/quote/{symbol}` | JWT | Get real-time stock quote |
| GET | `/api/stocks/search?keywords=` | JWT | Search stocks by name/symbol |
| GET | `/api/stocks/market-movers` | JWT | Get top gainers, losers, most active |
| GET | `/api/stocks/profile/{symbol}` | JWT | Get company profile |
| GET | `/api/stocks/candles/{symbol}` | JWT | Get chart data |

### 9.4 AI Analysis (5 endpoints)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/ai/analyze-news/stream?query=` | JWT | Stream AI analysis (real-time) |
| GET | `/api/ai/analyze-news/{query}` | JWT | Get AI analysis (non-streaming) |
| POST | `/api/ai/analyze-news` | JWT | AI analysis with JSON body |
| GET | `/api/ai/market-impact` | JWT | Top market-moving news (structured) |
| GET | `/api/ai/search-history` | JWT | User's past searches |

### 9.5 API Keys (3 endpoints)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/api-keys/` | JWT | Create a new API key |
| GET | `/api/api-keys/` | JWT | List user's API keys |
| DELETE | `/api/api-keys/{id}` | JWT | Delete an API key |

### 9.6 Admin (8 endpoints)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/users` | Admin | List all users (paginated) |
| POST | `/api/admin/users` | Admin | Create a new user |
| GET | `/api/admin/users/{id}` | Admin | Get user details |
| PUT | `/api/admin/users/{id}` | Admin | Update user |
| PUT | `/api/admin/users/{id}/password` | Admin | Change user password |
| PUT | `/api/admin/users/{id}/block-ai` | Admin | Block/unblock AI access |
| DELETE | `/api/admin/users/{id}` | Admin | Delete user |
| GET | `/api/admin/stats` | Admin | Platform statistics |

### 9.7 External / Public API (3 endpoints)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/v1/external/stocks/{symbol}` | API Key | Stock quote |
| GET | `/api/v1/external/ai/analyze-news` | API Key | AI analysis |
| GET | `/api/v1/external/ai/market-impact` | API Key | Market impact news |

**Total: 34 API endpoints**

---

## 10. Authentication & Security Design

### 10.1 Authentication Flow

```
                    +--- Email/Password ---+
                    |                      |
USER ---+--- Login -+                      +---> JWT Token ---> Access API
        |           |                      |
        |           +--- Google OAuth -----+
        |
        +--- API Key (for developers) ----------> Access External API
```

### 10.2 Token Types

| Token | Algorithm | Expires | Purpose |
|---|---|---|---|
| Access Token | HS256 (JWT) | 30 minutes | Authenticate API requests |
| Refresh Token | HS256 (JWT) | 7 days | Get a new access token |
| Verification Token | — | 15 minutes | Confirm email address |
| Reset Token | — | 15 minutes | Reset forgotten password |

### 10.3 Authorization Roles

| Role | Can Access |
|---|---|
| **Unauthenticated** | Login, signup, password reset pages |
| **Regular User** | Stock data, AI analysis, API key management, own profile |
| **Blocked User** | Everything except AI features (set by admin) |
| **Super Admin** | Everything + admin panel (user management, statistics) |
| **API Key Holder** | External API endpoints only (stocks, AI analysis) |

### 10.4 Security Measures

- Passwords hashed with **bcrypt** (never stored in plain text)
- API keys **hashed** before storage; only first 8 characters shown to user
- **CORS** restricted to allowed origins only
- **JWT secrets** stored in environment variables
- Input validated using **Pydantic** models on every request

---

## 11. AI Agent Architecture

The AI analysis feature uses a **multi-phase pipeline** — the core innovation of the application.

```
User Query: "What's happening with tech stocks?"
                    |
                    v
        +---------------------+
        |    CACHE CHECK      |
        |  Memory (10 min)    |
        |  Turso DB (24 hrs)  |
        +-----+--------+------+
              |  miss   | hit --> Return cached result
              v
   +----------+----------+
   |                      |
   v                      v
Phase 1A               Phase 1B
STOCK DATA             WEB SEARCH
                       
- Fetch quotes         - Search breaking news
- Market movers        - Economic indicators
- Identify patterns    - Geopolitical events
- Spot anomalies       - Market sentiment
                       (up to 8 web searches)
   |                      |
   v                      v
   +----------+----------+
              |
              v
        +-----------+
        | Phase 2:  |
        | SYNTHESIS |
        |           |
        | Combine   |
        | data +    |
        | news into |
        | actionable|
        | insights  |
        +-----------+
              |
              v
     +------------------+
     | Return to user   |
     | (streaming or    |
     |  complete)       |
     | + cache result   |
     | + save to        |
     |   history        |
     +------------------+
```

**Why two phases?** This mimics how a professional analyst works: first gather data from multiple sources independently, then connect the dots. Running Phase 1A and 1B in parallel also makes the analysis faster.

---

## 12. User Interface Pages

| # | Page | Route | Description |
|---|---|---|---|
| 1 | Login | `/login` | Email/password form + Google login button |
| 2 | Sign Up | `/signup` | Registration form |
| 3 | Email Verification | `/verify-email` | Confirms email via token |
| 4 | Forgot Password | `/forgot-password` | Enter email to receive reset link |
| 5 | Reset Password | `/reset-password` | Set new password via token |
| 6 | Dashboard | `/` | Stock watchlist, market movers, search bar |
| 7 | Stock Detail | `/stock/:symbol` | Price chart, company info, statistics |
| 8 | News Analysis | `/news` | AI search bar, streaming results, market impact cards, history |
| 9 | Admin Panel | `/admin` | User table, stats cards, create/edit/delete users |
| 10 | API Keys | `/api-keys` | Generate keys, view active keys, delete keys |
| 11 | API Documentation | `/api-docs` | Endpoint reference for developers |

---

## 13. Project Structure

```
wise-trade-OSS/
|
+-- apps/
|   +-- api/                        # Backend (Python)
|   |   +-- app/
|   |   |   +-- core/               # Config, database, security
|   |   |   +-- models/             # MongoDB document models
|   |   |   +-- routers/            # API endpoint definitions
|   |   |   +-- services/           # Business logic
|   |   |   +-- schemas/            # Request/response validation
|   |   |   +-- LLM/                # AI agent implementation
|   |   |   +-- utils/              # Helpers, email templates
|   |   +-- requirements.txt        # Python dependencies
|   |   +-- Dockerfile
|   |
|   +-- web/                        # Frontend (JavaScript)
|       +-- src/
|       |   +-- components/         # Reusable UI components
|       |   +-- pages/              # Page components (11 pages)
|       |   +-- context/            # Auth state management
|       |   +-- hooks/              # Data fetching hooks
|       |   +-- services/           # API client (Axios)
|       +-- package.json
|       +-- Dockerfile
|
+-- docker-compose.yml              # Production deployment
+-- docker-compose.dev.yml          # Development setup
+-- turbo.json                      # Monorepo configuration
+-- .env.example                    # Environment variable template
+-- package.json                    # Root workspace config
```

---

## 14. Deployment Plan

| Environment | Frontend | Backend | Database |
|---|---|---|---|
| **Development** | Vite dev server (localhost:3000) | Uvicorn with hot-reload (localhost:8001) | Local MongoDB via Docker |
| **Production** | Nginx serving static build (port 80) | Uvicorn (port 8001) | MongoDB Atlas (cloud) |
| **Alternative** | Vercel (CDN) | Docker container | MongoDB Atlas + Turso Cloud |

All services are containerized with **Docker** and orchestrated with **Docker Compose** for one-command deployment.

---

## 15. Summary

Wise Trade is a web application that solves the problem of information overload for stock market investors by using AI to automatically research and synthesize market data and news. The application features:

- **11 user-facing pages** covering stock data, AI analysis, authentication, and administration
- **34 API endpoints** organized into 7 groups
- **3 MongoDB collections** (users, auth tokens, API keys) and **2 SQL tables** (cache, search history)
- **Multi-phase AI pipeline** that combines real-time stock data with web search for comprehensive analysis
- **4 authentication methods** (email/password, Google OAuth, JWT tokens, API keys)
- **Role-based access control** with regular users, blocked users, and super admins
- **Full deployment setup** with Docker, Nginx, and cloud database support

The application is built as a monorepo with clear separation between frontend (React) and backend (FastAPI), making it maintainable and easy to extend.
