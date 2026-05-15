# NoteWise — AI-Powered Notes Workspace

A full-stack collaborative notes app with AI summaries, smart search, public sharing, and productivity insights.

## Tech Stack
- **Frontend**: React 18, Vite, React Router, Axios, react-hot-toast
- **Backend**: Node.js, Express, better-sqlite3
- **AI**: Anthropic Claude (claude-opus-4-5)
- **Auth**: JWT + bcrypt

## Setup

### 1. Backend
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Fill in your ANTHROPIC_API_KEY and JWT_SECRET in .env
npm run dev
\`\`\`

### 2. Frontend
\`\`\`bash
cd frontend
npm install
cp .env.example .env
npm run dev
\`\`\`

Open http://localhost:5173

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Current user |
| GET | /api/notes | List notes (search, filter) |
| POST | /api/notes | Create note |
| GET | /api/notes/:id | Get note |
| PATCH | /api/notes/:id | Update note |
| DELETE | /api/notes/:id | Delete note |
| POST | /api/notes/:id/generate-summary | AI insights |
| POST | /api/notes/:id/share | Share note |
| DELETE | /api/notes/:id/share | Revoke share |
| GET | /api/shared/:shareId | Public note |
| GET | /api/insights | Dashboard stats |

## Features
- ✅ JWT Auth (signup/login/protected routes)
- ✅ Notes with auto-save, tags, categories, archive
- ✅ AI summaries, action items, title suggestions via Claude
- ✅ Keyword search + tag/category filtering
- ✅ Public share links (no login required)
- ✅ Productivity dashboard (stats, weekly chart, top tags)
- ✅ Dark UI, responsive layout