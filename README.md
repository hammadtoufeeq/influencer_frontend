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
| `/dashboard` | Logged-in home per account type. Talent sees their profile / claim status and incoming hire requests (accept / decline). Business sees its verification status and the hire requests it sent. Admins get People and Claim requests tabs |
| `/dashboard/business` | Business only: send company details for verification (or edit them) |
| `/agreements`, `/agreements/:id` | Business and talent: their agreements; terms, signing, milestones, disputes, reviews and "Download PDF" (browser print) |
| `/agreements/new?hire=` | Business only: draft an agreement from an accepted hire request |
| `/shortlists`, `/shortlists/:id` | Business, agency, organization: named lists of people with private notes, hiring status, Hire button and a compare view (2–4 people) |
| `/dashboard/people/new`, `/dashboard/people/:id/edit` 



| Admin only: create or edit a profile |

## Business verification and hiring

A business account fills in its company details at `/dashboard/business`. Verification works like a talent claim: the admin sends a 6-digit code to one of the business's contacts (login email, website, proof link or phone) from `/admin/businesses/:id`, the business enters it on its dashboard (5 wrong tries lock it; the admin can reset the code or verify manually), and the admin then gives final approval. Only an approved business sees an active **Hire** button on a profile, and only on verified talents (claimed + verified badge). Everyone else still sees the disabled "Contact / Hire" button. The talent sees the request near the top of their dashboard with the business details (verified badge, industry, location, website) and accepts or declines it. Once accepted, both sides see each other's contact details (the talent gets the business contact's name, email and phone; the business gets the talent's name and email). `LiveUpdates` refreshes the business verification and hire requests every few seconds and shows a toast when the admin sends a code, approves or rejects, when a new hire request arrives, or when the talent replies, so nobody has to reload the page. Code lives in `src/components/business/`, `src/api/business.ts` and `src/types/business.ts`.

## Agreements

After a talent accepts a hire request, the business drafts an agreement (scope, milestones with amounts and due dates, payment terms, usage rights, rounds of changes, cancellation). Either side can propose new terms; every version is kept. Each side signs by entering a code emailed to them, and when both have signed the same version the terms are locked and get a SHA-256 fingerprint. The talent delivers each milestone, the business approves it or asks for changes (up to the agreed rounds), either side can report a problem that an admin resolves, and both leave a review at the end. Business reviews of a talent show on the public profile; talents see a business's rating on its hire requests. "Download PDF" prints a formal version of the agreement (the navbar and footer are hidden when printing). Code lives in `src/pages/agreements/`, `src/components/agreements/`, `src/api/agreements.ts` and `src/types/agreement.ts`.

## Deleting an account

Settings → Delete account. A talent who owns a public-source profile chooses: **keep it as a public profile** (everything they added is removed and it goes back to the public version, unclaimed) or **remove my public profile** (hidden at once; a removal request goes to the admins). A profile the talent created themselves is deleted with the account. On a removal request report, admins can tick **Delete the profile permanently**; it won't be re-added from public sources. Reports opened by a profile's owner show an "Owner" badge.

## Shortlists

Business, agency and organization accounts see a star on every profile card (Explore, Home) and on profile pages. It opens a picker to add the person to one or more named lists, or create a new list on the spot. `/shortlists/:id` shows each person with a private note, rating, starting price, availability and hiring status (hire request, agreement, or a Hire button for verified talents when the account is a business). Tick 2–4 people and press Compare to see them side by side. Code lives in `src/pages/shortlists/`, `src/components/shortlists/`, `src/api/shortlists.ts` and `src/types/shortlist.ts`.

## Managers / agents

A manager (representative account) sends their details from **Manager details** (`/dashboard/manager`) and an admin verifies them at `/admin/managers`. A verified manager links to a talent only with the talent's consent: the manager clicks **Request to represent** on the talent's profile, or the talent invites them by email from **My manager** (`/dashboard/my-manager`). A talent has one manager at a time and picks what they may do: **Handle hire requests** and / or **Manage profile** (profile, services, availability); signing agreements stays with the talent. The manager's **My talents** (`/talents`) lists the roster and invitations, `/talents/:personId` is the workspace for one talent (hire requests, services, profile, each locked without the permission), and **Hire requests** combines all their talents. Hire requests a manager answered show "Answered by …", and public profiles show "Represented by …". Code lives in `src/pages/manager/`, `src/components/manager/`, `src/pages/dashboards/ManagerProfileForm.tsx`, `src/pages/dashboards/MyManagerPage.tsx`, `src/api/manager.ts` and `src/types/manager.ts`.

## Footer, newsletter and legal pages

The footer (`src/components/Footer.tsx`) has Product, Solutions, Resources, Company and Legal columns, the social links from `src/constants/config.ts` and a newsletter form (`src/components/NewsletterForm.tsx`, `POST /api/newsletter/subscribe`). Resources link to homepage sections (`/#how-it-works`, `/#features`, `/#faq`); `ScrollManager` scrolls to any `#id` in the URL. `/privacy` and `/terms` (`src/pages/LegalPage.tsx`) read their sections from `legal.*` in the locale files; change `UPDATED_AT` there when the text changes. `/newsletter/unsubscribe?token=…` is the page for the unsubscribe link in future emails. Admins see subscribers at `/admin/newsletter` (search, status filter, CSV export, delete).

Homepage testimonials come from `src/constants/testimonials.ts`; the section is hidden while that list is empty.

## Navigation

All navbar links live in `src/constants/navigation.ts` (`MAIN_NAV`, `UTILITY_NAV`, `ACCOUNT_NAV`), each with the roles that can see it. Talent, business and manager accounts reach their own pages (profile, Services, Hire requests, Agreements, business or manager details, Shortlists, My talents, My manager) from a sidebar like the admin panel's, built in `src/components/dashboard-panel/DashboardLayout.tsx`, instead of the navbar. Pages that are planned but not built yet (`/inbox`) show a "Coming soon" page.

## Admin panel (`/admin`)

Admins only (`ProtectedRoute roles={['admin']}`). Sidebar: Dashboard, Claims, Businesses, Agreements, Users, Reports, Audit log.

| URL | Page |
|---|---|
| `/admin` | Overview: claims needing action, open reports, users, profiles |
| `/admin/claims`, `/admin/claims/:id` | Claims table (status filter) and detail: evidence, code, approve/reject |
| `/admin/businesses`, `/admin/businesses/:id` | Business verification queue and detail: company details, send / reset the code, verify manually, approve after the correct code, reject / revoke |
| `/admin/agreements`, `/admin/agreements/:id` | All agreements; resolve disputes (continue / complete / cancel) |
| `/admin/users` | Search, role/status filter, change role, suspend/unsuspend |
| `/admin/reports`, `/admin/reports/:id` | Reports queue and detail: status, admin note, takedown |
| `/admin/audit-logs` | Read-only audit log with filters and before/after view |
| `/people/:slug/report` | Public "Report an error or request removal" form |

The older admin dashboard at `/dashboard` (profile cards, create/edit) is unchanged.

## i18n

`react-i18next` with English, Urdu and Arabic in `src/i18n/locales/*.json`. The admin panel has a language switch; Urdu and Arabic set `dir="rtl"` on the admin area. Use `t('key')` for new strings and add the key to all three files.

## Author

Built and maintained by [Hammad Toufeeq](https://github.com/hammadtoufeeq).
