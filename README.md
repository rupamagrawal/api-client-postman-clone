# ApiClient — Postman Clone

> A full-stack Postman clone built as an SDE Fullstack internship assignment.  
> Supports real HTTP requests, collections, environments, history, and a pixel-perfect Postman-like dark UI.

## 🚀 Live Demo

- **Frontend:** https://api-client-postman-clone.vercel.app
- **Backend API:** https://apiclient-backend.onrender.com
- **API Docs (Swagger):** https://apiclient-backend.onrender.com/docs

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| State Management | Zustand |
| UI Components | Radix UI, Lucide React |
| HTTP Client | Axios |
| Notifications | react-hot-toast |
| Backend | Python FastAPI |
| ORM | SQLAlchemy (async) |
| Database | SQLite (aiosqlite) |
| Proxy Client | httpx |
| Deployment | Vercel (frontend), Render (backend) |

---

## ✨ Features

### Core
- ✅ Send real HTTP requests (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- ✅ All requests proxied through FastAPI backend (avoids browser CORS)
- ✅ Collections with full CRUD — create, rename, delete, save requests
- ✅ Environment variables with `{{variable}}` syntax resolution
- ✅ Variable highlighting in URL bar (orange = defined, red = undefined)
- ✅ Request history — auto-saved, re-openable
- ✅ Multi-tab workspace like Postman
- ✅ Params tab with bidirectional URL sync
- ✅ Headers, Body (raw/form-data/urlencoded), Authorization tabs
- ✅ Auto Content-Type header when selecting raw body format
- ✅ Bearer Token and Basic Auth support
- ✅ Pretty JSON response with syntax highlighting
- ✅ Raw response and Headers viewer
- ✅ Status code, response time, and size display
- ✅ Import Postman Collection v2.1 JSON
- ✅ Export collection as Postman Collection v2.1 JSON
- ✅ Import via cURL command paste
- ✅ cURL snippet generator for current request
- ✅ Global search bar (Ctrl+K)
- ✅ Keyboard shortcuts (Ctrl+Enter send, Ctrl+T new tab, Ctrl+W close tab)
- ✅ Unsaved changes detection with save/discard dialog
- ✅ Database seeded with sample collections on first startup

### Placeholder (UI present, logic coming soon)
- Team workspaces & collaboration
- Mock servers
- API documentation generation
- Monitors & scheduled runs
- Pre-request and post-response scripts

---

## 📁 Project Structure

```
root/
├── frontend/                        # Next.js 14 app
│   ├── app/
│   │   ├── globals.css              # Global styles + Google Fonts
│   │   ├── layout.tsx               # Root layout with Toaster
│   │   └── page.tsx                 # Main workspace page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopBar.tsx           # Top navigation bar
│   │   │   ├── Sidebar.tsx          # Collections & History sidebar
│   │   │   ├── TabBar.tsx           # Request tabs
│   │   │   └── NewRequestDropdown.tsx
│   │   ├── request/
│   │   │   ├── RequestPanel.tsx     # Main request builder
│   │   │   ├── UrlBar.tsx           # URL input with variable highlight
│   │   │   ├── MethodSelector.tsx   # HTTP method dropdown
│   │   │   ├── ParamsTab.tsx        # Query params editor
│   │   │   ├── HeadersTab.tsx       # Headers editor
│   │   │   ├── BodyTab.tsx          # Body editor (raw/form/urlencoded)
│   │   │   └── AuthTab.tsx          # Authorization tab
│   │   ├── response/
│   │   │   ├── ResponseViewer.tsx   # Response panel
│   │   │   ├── PrettyView.tsx       # Syntax highlighted JSON
│   │   │   └── HeadersView.tsx      # Response headers table
│   │   ├── modals/
│   │   │   ├── NewCollectionModal.tsx
│   │   │   ├── SaveRequestModal.tsx
│   │   │   ├── EnvironmentModal.tsx
│   │   │   ├── ImportModal.tsx
│   │   │   ├── GlobalSearchModal.tsx
│   │   │   ├── AppSettingsModal.tsx
│   │   │   └── DeleteConfirmModal.tsx
│   │   └── shared/
│   │       ├── KeyValueEditor.tsx   # Reusable key-value table
│   │       └── MethodBadge.tsx      # Colored HTTP method badge
│   ├── lib/
│   │   ├── api.ts                   # Axios client + all API functions
│   │   ├── store.ts                 # Zustand global state
│   │   ├── utils.ts                 # Helper functions
│   │   ├── curlParser.ts            # cURL command parser
│   │   └── collectionImporter.ts   # Postman v2.1 importer
│   └── types/
│       └── index.ts                 # TypeScript interfaces
│
├── backend/                         # FastAPI app
│   ├── routers/
│   │   ├── runner.py                # POST /api/run — HTTP proxy
│   │   ├── collections.py           # Collections CRUD
│   │   ├── requests.py              # Saved requests CRUD
│   │   ├── environments.py          # Environments CRUD
│   │   └── history.py               # Request history
│   ├── main.py                      # FastAPI app + CORS + startup
│   ├── models.py                    # SQLAlchemy models
│   ├── schemas.py                   # Pydantic v2 schemas
│   ├── database.py                  # Async DB engine + session
│   ├── seed.py                      # Initial data seeding
│   ├── requirements.txt
│   ├── Procfile                     # Render deployment
│   └── render.yaml                  # Render config
│
├── AGENTS.md                        # AI agent instructions
├── SCHEMA.md                        # Database schema reference
├── TASKS.md                         # Development task tracker
├── start.sh                         # Start both servers (Linux/Mac)
├── start.bat                        # Start both servers (Windows)
└── README.md
```

---

## 🗄 Database Schema

### collections
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (String) | Primary Key |
| name | String | Required |
| description | String | Nullable |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |

### requests
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (String) | Primary Key |
| collection_id | UUID | FK → collections (cascade delete) |
| name | String | |
| method | String | GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS |
| url | String | |
| headers | JSON | |
| params | JSON | |
| body_type | String | none/raw/form-data/urlencoded |
| body_content | Text | Nullable |
| auth_type | String | none/bearer/basic |
| auth_config | JSON | |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |

### environments
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (String) | Primary Key |
| name | String | |
| created_at | DateTime | Auto |
| updated_at | DateTime | Auto |

### environment_variables
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (String) | Primary Key |
| environment_id | UUID | FK → environments (cascade delete) |
| key | String | |
| value | String | |
| enabled | Boolean | Default: true |

### history
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (String) | Primary Key |
| method | String | |
| url | String | |
| headers | JSON | |
| params | JSON | |
| body_type | String | |
| body_content | Text | |
| auth_type | String | |
| auth_config | JSON | |
| response_status | Integer | |
| response_time_ms | Integer | |
| response_size_bytes | Integer | |
| response_headers | JSON | |
| response_body | Text | |
| executed_at | DateTime | |

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/health | Health check |
| POST | /api/run | Execute HTTP request (proxy) |
| GET | /api/collections | List all collections with requests |
| POST | /api/collections | Create collection |
| PUT | /api/collections/{id} | Update collection |
| DELETE | /api/collections/{id} | Delete collection (cascades) |
| POST | /api/collections/{id}/requests | Save request to collection |
| PUT | /api/requests/{id} | Update saved request |
| DELETE | /api/requests/{id} | Delete saved request |
| GET | /api/environments | List environments with variables |
| POST | /api/environments | Create environment |
| PUT | /api/environments/{id} | Update environment name |
| DELETE | /api/environments/{id} | Delete environment |
| POST | /api/environments/{id}/variables | Add variable |
| PUT | /api/environments/{id}/variables/{vid} | Update variable |
| DELETE | /api/environments/{id}/variables/{vid} | Delete variable |
| GET | /api/history | Get last 100 history entries |
| DELETE | /api/history/{id} | Delete one history entry |
| DELETE | /api/history | Clear all history |

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- pip

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- Runs at: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- DB is auto-created and seeded on first run

### Frontend
```bash
cd frontend
npm install
npm run dev
```

- Runs at: http://localhost:3000
- Requires backend running on port 8000

### Environment Variables

Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Run both together

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```bat
start.bat
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────┐
│           Browser (localhost:3000)               │
│         Next.js 14 + TypeScript                  │
│                                                   │
│  ┌─────────┐  ┌──────────┐  ┌────────────────┐  │
│  │ Zustand │  │ Radix UI │  │ Tailwind CSS   │  │
│  │  Store  │  │Components│  │ (Postman theme)│  │
│  └─────────┘  └──────────┘  └────────────────┘  │
└──────────────────┬──────────────────────────────┘
                   │ axios (REST)
                   ▼
┌─────────────────────────────────────────────────┐
│        FastAPI Backend (localhost:8000)           │
│                                                   │
│  ┌─────────────────┐   ┌──────────────────────┐  │
│  │  CRUD Routers   │   │   /api/run (Proxy)   │  │
│  │  collections    │   │   httpx async client │  │
│  │  environments   │   │   {{var}} resolver   │  │
│  │  history        │   │   auth injector      │  │
│  └────────┬────────┘   └──────────┬───────────┘  │
│           │                        │              │
│  ┌────────▼────────────────────────▼───────────┐ │
│  │     SQLAlchemy ORM + SQLite Database        │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
                   │ httpx
                   ▼
┌─────────────────────────────────────────────────┐
│              External APIs                        │
│   jsonplaceholder.typicode.com                   │
│   httpbin.org                                    │
│   Any public/private API                         │
└─────────────────────────────────────────────────┘
```

---

## 💡 Assumptions

- **Single user** — no authentication required (default logged-in user assumed)
- **SQLite** used for simplicity — easily swappable for PostgreSQL in production
- **All HTTP requests proxied** through FastAPI to avoid browser CORS restrictions
- **Database auto-seeded** on first startup with sample collections and environments
- **Environment variables resolved at send time** — not stored in the request itself
- **Free tier deployment** — Render instance may take ~50s to wake from sleep

---

## 👨‍💻 Author

**Rupam Agrawal**  
Final Year IT Student | PCCOER, Pune  
GitHub: [@rupamagrawal](https://github.com/rupamagrawal)
