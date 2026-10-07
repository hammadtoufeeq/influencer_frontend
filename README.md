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
├─ api/auth.ts   register / login / logout / me calls
├─ api/people.ts people search, profile, taxonomy calls
├─ components/   reusable UI pieces (Navbar, Footer, Layout, FormField, ProtectedRoute)
├─ pages/        full pages, one per route (Home, Search, Profile, Login, Register, Dashboard, NotFound)
├─ context/      AuthProvider (who is logged in)
├─ hooks/        custom hooks (useAuth, useTaxonomy)
├─ types/        TypeScript types (API response, User)
├─ constants/    app-wide constants (PLATFORM_NAME, signup roles)
├─ utils/        helpers (backend error messages, number / country / language formatting)
├─ App.tsx       routes
└─ main.tsx      entry point (providers)
```

## Auth

- `useAuth()` gives `user`, `isLoading`, `login`, `register`, `logout`.
- Wrap a page in `<ProtectedRoute>` (optionally `roles={['business']}`) to require login.
- Tokens are httpOnly cookies set by the backend. When the access token expires, `api/axios.ts` calls `/auth/refresh` once and retries the request.

## Pages

| URL | Page |
|---|---|
| `/` | Home: search bar, browse by industry, most followed |
| `/search?q=&profession=&industry=&topic=&country=&city=&language=&minFollowers=&status=&sort=&page=` | Search with filters. All filters live in the URL, so results can be shared and the back button works |
| `/browse` | Browse by industry, profession, topic and country |
| `/people/:slug` | Public profile (Claim button for talents) |
| `/people/:slug/claim` | Talent only: send a claim with proof |
| `/dashboard/profile/edit` | Talent only: edit the profile you own |
| `/dashboard` | Logged-in home per account type. Talent sees their profile / claim status. Admins get People and Claim requests tabs |
| `/dashboard/people/new`, `/dashboard/people/:id/edit` | Admin only: create or edit a profile |

## Navigation

All navbar links live in `src/constants/navigation.ts` (`MAIN_NAV`, `UTILITY_NAV`, `ACCOUNT_NAV`), each with the roles that can see it. Pages that are planned but not built yet (`/inbox`, `/notifications`, `/shortlists`, `/talents`, `/settings`, `/dashboard/services`) show a "Coming soon" page.
