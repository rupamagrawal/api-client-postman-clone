# Project: ApiClient (Postman Clone)

## What this is
A full-stack Postman clone. Assignment for SDE Fullstack internship evaluation.
Must visually and functionally replicate Postman's UI/UX exactly.

## Tech Stack
- Frontend: Next.js 14, TypeScript, Tailwind CSS, Zustand
- Backend: Python FastAPI, SQLite, SQLAlchemy
- Frontend port: 3000
- Backend port: 8000

## Project Structure
root/
├── frontend/         # Next.js app
├── backend/          # FastAPI app
├── AGENTS.md         # This file
└── README.md

## Coding Rules (follow strictly)
- TypeScript: zero `any` types allowed
- Max 150 lines per component file
- Every component in its own file
- All colors from tailwind config only — no hardcoded hex in JSX
- Backend: every endpoint must have a docstring
- Use async/await everywhere, no .then() chains
- All API calls go through a single axios instance in frontend/lib/api.ts

## Design Rules
- Must look like Postman dark theme — not a generic form app
- Postman orange accent: #ff6c37
- Dark bg: #2c2c2c, Sidebar: #1a1a1a
- Method colors: GET=#49cc90 POST=#fca130 PUT=#9b59b6 DELETE=#f93e3e
- Font: Inter for UI, JetBrains Mono for code

## What NOT to do
- Do not use any pre-built Postman UI component library
- Do not send HTTP requests directly from browser — always proxy through FastAPI
- Do not use localStorage for anything — use Zustand
- Do not skip error handling
- Do not create mega files — split into small focused components

## API Base URL
Frontend calls: http://localhost:8000
Env variable: NEXT_PUBLIC_API_URL