# NoteWise — AI-Powered Collaborative Notes Workspace

> A full-stack, AI-enhanced notes application that helps users capture ideas, organize knowledge, generate intelligent summaries, share notes publicly, and track productivity insights.

Built as part of the **Peblo Full Stack Developer Challenge**, this project demonstrates end-to-end product development across frontend, backend, authentication, AI integration, and analytics. :contentReference[oaicite:0]{index=0} :contentReference[oaicite:1]{index=1}

---

##  Overview

NoteWise is a modern collaborative notes workspace designed to make note-taking more productive and intelligent.

Users can:

- Create, edit, and organize notes with tags and categories
- Auto-save content in real time
- Generate AI-powered summaries, action items, and title suggestions
- Search and filter notes instantly
- Share notes publicly through secure links
- View personal productivity insights and usage analytics

The application combines a responsive React frontend, a secure Node.js API, SQLite storage, and Anthropic Claude AI to deliver a seamless writing experience.

---

##  Key Features

### Authentication & Security
- Secure user signup and login
- Password hashing using bcrypt
- JWT-based authentication
- Protected API routes and persistent sessions

###  Notes Workspace
- Rich note creation and editing
- Automatic saving
- Tags and categories
- Archive/unarchive notes
- Last updated timestamps

###  AI Assistant
Generate intelligent insights from your notes using Anthropic Claude:
- Concise summaries
- Extracted action items
- Suggested titles

###  Smart Search & Filtering
- Full-text keyword search
- Filter by tags and categories
- Sort by most recently updated

###  Public Sharing
- Generate public share links
- View shared notes without login
- Revoke access anytime

###  Productivity Dashboard
- Total notes created
- Recently edited notes
- Most-used tags
- Weekly activity chart
- AI usage statistics

###  Modern UI
- Fully responsive design
- Dark theme interface
- Toast notifications
- Clean and intuitive UX

---

##  Screenshots

> Add screenshots here after deployment.

| Authentication | Notes Workspace | AI Summary | Dashboard |
|---------------|----------------|-----------|----------|
| ![](docs/login.png) | ![](docs/editor.png) | ![](docs/summary.png) | ![](docs/dashboard.png) |

---

##  Architecture

```text
Frontend (React + Vite)
        │
        ▼
REST API (Express.js)
        │
        ├── JWT Authentication
        ├── AI Service (Anthropic Claude)
        └── SQLite Database
