# VedaAI – AI Assessment Creator

An AI-powered question paper generator for teachers. Fill in a form, and Gemini AI produces a fully structured, multi-section question paper in real time — delivered over WebSocket and exportable as PDF.

---

## Architecture Overview

```
Browser (Next.js 14)
  │
  │  POST /api/assignments (form data + optional file)
  ▼
Express API  ──►  BullMQ Queue  ──►  Worker
  │                                      │
  │◄── Socket.io (generation:complete) ◄─┘
  │
MongoDB  ←  stores assignment doc + generated paper
Redis    ←  BullMQ job state + queue backing
Gemini 2.5 Flash  ←  AI model called by the worker
```

### Request Flow
1. Teacher fills the create form (title, question types, marks, topic, optional file)
2. `POST /api/assignments` creates a MongoDB document and enqueues a BullMQ job → returns `{ assignmentId }`
3. Frontend navigates to `/assignments/:id` and joins a Socket.io room
4. The BullMQ worker picks up the job, builds a structured prompt, calls **Gemini 2.5 Flash**
5. Gemini returns strict JSON — the worker strips any markdown fences, parses, validates, and stores in MongoDB
6. Worker emits `generation:complete` to the Socket.io room
7. Frontend receives the event, renders the question paper immediately (no polling)
8. Teacher can download the paper as a PDF

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand |
| Realtime | Socket.io (client + server) |
| Backend | Node.js, Express, TypeScript |
| Queue | BullMQ + Redis |
| Database | MongoDB (Mongoose) |
| AI | Google Gemini 2.5 Flash (`@google/generative-ai`) |
| PDF Export | html2canvas + jsPDF (smart section-aware page breaks) |
| File Upload | Multer (multipart/form-data) |

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local instance on port 27017)
- Redis (local instance on port 6379)

**macOS — install via Homebrew:**
```bash
brew tap mongodb/brew && brew install mongodb-community
brew install redis

brew services start mongodb-community
brew services start redis
```

---

### 1. Backend
```bash
cd backend
cp .env.example .env
# Open .env and set your GEMINI_API_KEY
npm install
npm run dev
# Server runs on http://localhost:5001
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

Open `http://localhost:3000` → navigates to the Home dashboard.

---

## Environment Variables

### `backend/.env`
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_HOST=localhost
REDIS_PORT=6379
GEMINI_API_KEY=your_gemini_api_key_here
CLIENT_URL=http://localhost:3000
USE_MOCK=false          # set to true to bypass Gemini during testing
```

### `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_WS_URL=http://localhost:5001
```

---

## Features

### Core
| Feature | Detail |
|---|---|
| Assignment creation | Title, due date (DD-MM-YYYY + native calendar picker), question types with ±stepper counts/marks, topic textarea with mic icon, optional file upload (drag & drop) |
| AI generation | Gemini 2.5 Flash generates a strict JSON question paper — sections A/B/C…, questions, options (MCQ), marks per question, answer key, general instructions |
| Real-time delivery | Socket.io WebSocket pushes `generation:complete` the moment the worker finishes — no polling |
| Question paper view | Clean structured layout: school header, meta row (time/marks), student info fields, sections with instructions, questions with marks |
| PDF export | Smart page-break algorithm detects section header positions in the canvas and avoids orphan headers; top/bottom margin masks prevent content overlap across pages |
| Assignment management | List view with search, assignment cards, delete |
| State management | Zustand store for form state + assignment list |

### UI Pages
| Page | Route |
|---|---|
| Home dashboard | `/` — stats cards, quick actions, recent activity |
| Assignments list | `/assignments` |
| Create assignment | `/assignments/create` |
| Output / paper view | `/assignments/:id` |
| My Groups | `/groups` |
| My Library | `/library` — searchable resource table with category filters |
| AI Teacher's Toolkit | `/toolkit` — 6 tool cards with icons and active/coming-soon states |
| Settings | `/settings` — profile editor, notification toggles, security/password, logout |
| 404 | `/_not-found` — same sidebar/header layout |

### Bonus (Completed)
- **PDF export** — multi-page with section-aware page breaks and margin masking
- **Custom logo** — real PNG logo served from `/public`, used in sidebar and browser favicon
- **Profile image** — used in header dropdown, settings profile card, and sidebar footer
- **UI polish** — pixel-perfect Figma replication: sparkle icon on Create Assignment button, orange ring, custom steppers, mic icon, drag-and-drop file upload, controlled date input
- **Header dropdown** — profile info, My Profile, Settings, Help & Support, Log Out

---

## Project Structure

```
VedaAI/
├── backend/
│   ├── src/
│   │   ├── config/          # database, redis, queue
│   │   ├── models/          # Assignment mongoose model
│   │   ├── routes/          # assignments REST API
│   │   ├── services/        # gemini.ts — AI prompt + parser
│   │   ├── socket/          # socket.io init + emit helpers
│   │   ├── workers/         # BullMQ generation worker
│   │   └── index.ts         # Express + HTTP + Socket.io entry
│   └── .env
├── frontend/
│   ├── public/              # logo.png, profile.png, favicon
│   └── src/
│       ├── app/             # Next.js App Router pages
│       ├── components/      # Sidebar, Header, create/*, output/*, assignments/*
│       ├── hooks/           # useSocket.ts
│       ├── lib/             # api.ts (axios client)
│       ├── store/           # useAssignmentStore.ts (Zustand)
│       └── types/           # shared TypeScript types
└── README.md
```

---

## Approach

The core design goal was **minimal latency from form submit to rendered paper**.

- **Queue-first**: The API returns immediately after enqueueing. The worker runs independently, meaning the HTTP response is never blocked by AI generation time (which can be 10–30 seconds).
- **Socket.io rooms**: Each assignment gets its own room (`join:assignment`). The worker emits directly to that room, so only the browser viewing that assignment receives the update.
- **Strict JSON prompt**: Gemini is instructed to return *only* valid JSON matching a known schema. The worker strips any accidental markdown fences before parsing, making the pipeline robust to model quirks.
- **Zustand for form state**: Persists the create form across component re-renders without prop drilling, and resets cleanly on successful submission.
- **Smart PDF page breaks**: Instead of slicing a canvas image at raw page height (which cuts through text), the PDF exporter reads section positions from the DOM and inserts page breaks before section headers that would otherwise appear orphaned at the bottom of a page.
