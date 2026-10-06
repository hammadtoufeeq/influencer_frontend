# Influence Platform: Frontend

React + TypeScript + Vite + Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

The app opens at http://localhost:3000. The backend (`influencer_backend`) must also be running on port 5000.

## How the frontend reaches the backend

The app always calls `/api/...` on its own domain, so no environment variable is needed:

- Locally, the Vite dev server proxies `/api` to `http://localhost:5000` (see `vite.config.ts`).
- On Vercel, `vercel.json` rewrites `/api/*` to `https://influencer-backend.vercel.app/api/*`.

## Folder structure

```
src/
├─ api/          axios instance (backend se baat karne ke liye)
├─ components/   reusable UI pieces (Navbar, Footer, Layout)
├─ pages/        full pages, one per route (Home, NotFound)
├─ context/      React context (AuthContext later)
├─ hooks/        custom hooks
├─ types/        TypeScript types (API response shape)
├─ constants/    app-wide constants (PLATFORM_NAME)
├─ App.tsx       routes
└─ main.tsx      entry point (providers)
```
