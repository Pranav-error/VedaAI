# VedaAI Assignment — Build Progress

## STATUS KEY
- [ ] Not started
- [~] In progress
- [x] Done

---

## SCAFFOLD & INFRA
- [x] Root project structure
- [x] TODO.md + README.md
- [x] docker-compose.yml (reference — using Homebrew services locally)
- [x] MongoDB running via Homebrew (`brew services start mongodb-community`)
- [x] Redis running via Homebrew (`brew services start redis`)

---

## BACKEND (Node.js + Express + TypeScript)
- [x] package.json + tsconfig.json
- [x] .env + .env.example (PORT=5001)
- [x] src/index.ts — Express + HTTP server + Socket.io init + worker start
- [x] src/config/database.ts — MongoDB connection
- [x] src/config/redis.ts — Redis (ioredis) connection
- [x] src/config/queue.ts — BullMQ queue setup
- [x] src/models/Assignment.ts — Mongoose model (title, dueDate, questionTypes, status, generatedPaper)
- [x] src/services/gemini.ts — Gemini 2.5 Flash prompt + strict JSON parser (strips markdown fences)
- [x] src/workers/generation.ts — BullMQ worker → calls Gemini → stores result → emits Socket.io event
- [x] src/socket/index.ts — Socket.io room management + emitToAssignment helper
- [x] src/routes/assignments.ts — REST API
  - [x] POST /api/assignments — multer file upload, create doc, enqueue job, return { assignmentId }
  - [x] GET /api/assignments — list all (no generatedPaper)
  - [x] GET /api/assignments/:id — full doc with generatedPaper
  - [x] DELETE /api/assignments/:id
- [x] GET /health — health check endpoint

---

## FRONTEND (Next.js 14 App Router + TypeScript + Zustand + Tailwind)
- [x] package.json + tsconfig.json + next.config.mjs
- [x] tailwind.config.ts + postcss.config.mjs
- [x] src/types/index.ts — shared TypeScript types
- [x] src/lib/api.ts — axios API client
- [x] src/store/useAssignmentStore.ts — Zustand (form state + assignments list)
- [x] src/hooks/useSocket.ts — Socket.io-client hook (join room, listen for events)
- [x] src/app/layout.tsx — root layout + metadata
- [x] src/app/icon.png — browser tab favicon
- [x] public/logo.png — app logo (V mark)
- [x] public/profile.png — user profile photo

### Components
- [x] src/components/Sidebar.tsx
  - [x] 240px wide, VedaAI logo (real PNG), nav items with SVG icons
  - [x] Create Assignment button (dark pill + orange ring + sparkle icon)
  - [x] My Library, My Groups, Home, AI Teacher's Toolkit, Assignments links
  - [x] Settings link + profile avatar (profile.png) + school name at bottom
- [x] src/components/Header.tsx
  - [x] Back button (conditional), breadcrumb title
  - [x] Notification bell with red dot
  - [x] User dropdown (profile.png avatar, My Profile, Settings, Help, Log Out)

### Pages
- [x] src/app/page.tsx — Home dashboard (stats cards, quick actions, recent activity)
- [x] src/app/assignments/page.tsx — list, search, filter, assignment cards, delete
- [x] src/app/assignments/create/page.tsx — full create form
  - [x] Controlled title input
  - [x] Drag & drop file upload (FileUpload.tsx)
  - [x] DD-MM-YYYY text input + calendar icon (native date picker, auto-fills on select)
  - [x] Question type rows with ±stepper (QuestionTypeRow.tsx)
  - [x] Additional instructions textarea with mic icon + char counter
  - [x] Touch-based validation (blur + submit)
  - [x] Previous / Next (Generate) footer buttons
- [x] src/app/assignments/[id]/page.tsx — output page
  - [x] Loading / Processing / Failed / Completed states
  - [x] Real-time updates via Socket.io
  - [x] AI message banner on completion
- [x] src/app/groups/page.tsx — My Groups (group cards + create group placeholder)
- [x] src/app/library/page.tsx — My Library (searchable table, category filters, upload button)
- [x] src/app/toolkit/page.tsx — AI Teacher's Toolkit (6 tool cards with real SVG icons)
- [x] src/app/settings/page.tsx — Settings (profile editor, notification toggles, security, logout)
- [x] src/app/not-found.tsx — 404 page (same sidebar/header layout)

### Output Components
- [x] src/components/output/QuestionPaper.tsx
  - [x] School header, meta row, student info fields
  - [x] Sections with question type labels and instructions
  - [x] Questions with marks (difficulty tags removed)
  - [x] MCQ options, answer key
  - [x] data-pdf-section attributes for PDF page-break detection
- [x] src/components/output/DownloadPDF.tsx
  - [x] html2canvas + jsPDF
  - [x] Smart section-aware page break algorithm (prevents orphan headers)
  - [x] Top/bottom margin masking to prevent content overlap between pages

---

## UI POLISH (all completed)
- [x] Pixel-perfect Create Assignment form matching Figma
- [x] Sidebar: 240px, orange ring + sparkle on Create Assignment, proper nav icons
- [x] Step indicator removed from create page
- [x] Difficulty tags (Easy/Moderate/Hard) removed from question paper
- [x] Regenerate button removed from output page
- [x] Date field: digit-only controlled input, calendar auto-populates DD-MM-YYYY
- [x] Logo (V mark PNG) in sidebar + browser favicon
- [x] profile.png used in header dropdown, settings, sidebar footer (DPS avatar)
- [x] Home page: real SVG icons (no emojis)
- [x] Toolkit page: real colored SVG icons per tool (no emojis)
- [x] Appearance section removed from Settings
- [x] All nav pages have real content (no empty "coming soon" shells)

---

## BONUS FEATURES (completed)
- [x] PDF export with smart page breaks
- [x] Drag & drop file upload
- [x] Real-time WebSocket generation updates
- [x] Full navigation with linked pages
- [x] Profile image used throughout
- [x] Header user dropdown with logout
- [x] Settings page with profile, notifications, security

---

## BUILD STATUS
- [x] Frontend: `next build` — zero errors ✅
- [x] Backend: TypeScript — zero errors ✅
- [x] All 10 routes compile and render ✅
- [x] API test suite: 7/7 tests pass (real Gemini AI) ✅

## LOCAL TESTING CHECKLIST
- [x] MongoDB running on :27017
- [x] Redis running on :6379
- [x] Backend running on :5001
- [x] Frontend running on :3000
- [x] Create assignment → BullMQ job → Gemini AI → MongoDB → Socket.io → renders paper
- [x] PDF download (smart page breaks, no content duplication)
- [x] Delete assignment works
- [x] All nav pages linked and functional
- [x] Header dropdown opens with profile info and logout

---

## DEPLOYMENT (next step)
- [ ] Push clean repo to GitHub
- [ ] Frontend → Vercel (set NEXT_PUBLIC_API_URL + NEXT_PUBLIC_WS_URL)
- [ ] Backend → Render (set all .env vars, GEMINI_API_KEY, CLIENT_URL)
- [ ] Smoke test deployed app end-to-end
- [ ] Submit GitHub repo + deployed URLs to Google Form

---

## KEY DECISIONS
- Port 5001 (not 5000 — macOS AirPlay/ControlCenter occupies 5000)
- Gemini 2.5 Flash 
- Homebrew for MongoDB + Redis (Docker not installed)
- USE_MOCK=false in production .env; USE_MOCK=true available for local testing without AI
- Tests in tests/ folder — gitignored (not pushed to repo)
- Deadline: Thursday 28 May 2026, 11:59 PM
