# Influence Platform: Frontend

React + TypeScript + Vite + Tailwind CSS.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

The app opens at http://localhost:3000. The backend (`influencer_backend`) must also be running.

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
