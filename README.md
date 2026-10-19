# Influence Platform

**Live website:** https://influencer-frontend-kappa.vercel.app

Influence Platform is a website where **businesses find, hire and work with talent**: creators, journalists, speakers, experts and public figures. It keeps everything in one place, from the first search to a signed agreement and a final review.

This guide explains **every page, every tab and every button** in plain language. You do not need any technical knowledge to read it.

---

## Contents

1. [The idea in one minute](#1-the-idea-in-one-minute)
2. [The four kinds of accounts](#2-the-four-kinds-of-accounts)
3. [The top bar (navbar)](#3-the-top-bar-navbar)
4. [Pages anyone can visit](#4-pages-anyone-can-visit)
5. [Creating an account, logging in and passwords](#5-creating-an-account-logging-in-and-passwords)
6. [Talent: dashboard and every tab](#6-talent-dashboard-and-every-tab)
7. [Business / Organization: dashboard and every tab](#7-business--organization-dashboard-and-every-tab)
8. [Manager / Agent: dashboard and every tab](#8-manager--agent-dashboard-and-every-tab)
9. [Admin panel: every tab](#9-admin-panel-every-tab)
10. [Pages every logged-in user has](#10-pages-every-logged-in-user-has)
11. [Full journeys, step by step](#11-full-journeys-step-by-step)
12. [What the coloured labels mean](#12-what-the-coloured-labels-mean)
13. [Languages, dark mode and mobile](#13-languages-dark-mode-and-mobile)
14. [Trust, safety and privacy](#14-trust-safety-and-privacy)
15. [Frequently asked questions](#15-frequently-asked-questions)
16. [For the technical team](#16-for-the-technical-team)

---

## 1. The idea in one minute

Finding the right person for a campaign, event or story is usually slow. Follower numbers are scattered across apps, you never know who is real, and deals happen over chats with nothing in writing.

Influence Platform fixes this in four steps:

| Step | What happens |
|---|---|
| **1. Discover** | Search talent by profession, industry, topic, country, city, language and number of followers. |
| **2. Connect and hire** | A verified business sends a **hire request**, or posts a **campaign** that talent can apply to. |
| **3. Agree and sign** | Both sides agree on the work, milestones and payments in a digital **agreement**, then sign it with a code sent to their email. |
| **4. Deliver and review** | The talent delivers each milestone, the business approves it, and at the end both sides leave a **star review**. |

The platform is **free to use** right now. It is a platform, **not an agency**: businesses deal with talent (or their manager) directly. Payments are arranged between the two sides; the platform records what was agreed.

---

## 2. The four kinds of accounts

When you sign up you choose one of three account types. The fourth (Admin) is for the platform's own team.

| Account | Who it is for | What they can do |
|---|---|---|
| **Talent** | Creators, journalists, speakers, experts, public figures | Claim or create a public profile, list services and prices, set availability, receive hire requests, apply to campaigns, sign agreements, get reviews, choose a manager. |
| **Business / Organization** | Companies, brands, marketing/PR agencies, NGOs, universities, event organizers, government bodies | Get verified, hire talent, post campaigns, keep shortlists, compare people, draft and sign agreements, leave reviews. |
| **Manager / Agent** | People or agencies who represent talent | Get verified, link with talent (only with the talent's approval), manage their profiles and services, answer their hire requests and handle their agreements. |
| **Admin** | The platform team | Approve profile claims, verify businesses and managers, handle reports and disputes, manage users, read the audit log and the newsletter list. |

> **"Verified"** means the platform team has checked that the person or company is real. Only verified businesses can hire, and only verified talent can be hired.

---

## 3. The top bar (navbar)

The top bar is a floating, rounded bar that stays at the top of every page while you scroll.

**On the left:** the name **Influence Platform**. Click it to go back to the home page.

**In the middle (on large screens):**

| Link | Goes to |
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

### 11.6 A manager starts representing a talent
1. Sign up as **Manager / Agent** → **Manager details** → **Send for verification** → the admin verifies you.
2. Open a talent's profile → **Request to represent** with a short introduction. (Or the talent invites you by email.)
3. The talent **accepts** and chooses your permissions (**Manage profile**, **Handle hire requests**).
4. The talent now shows *"Represented by [you]"*, and you work for them from **My talents**, **Hire requests** and **Agreements**.
5. The talent can change permissions or remove you at any time; either side can end it.

---

## 12. What the coloured labels mean

| Area | Labels |
|---|---|
| **Profile claim** | Send code → Waiting for talent → Verified (code correct) → Approved / Rejected / OTP failed |
| **Business** | Waiting for code → Code sent → Code verified → Verified / Rejected / Locked |
| **Manager** | Pending review → Verified / Rejected |
| **Hire request** | Waiting for reply → Accepted / Declined / Cancelled |
| **Campaign** | Draft → Open → Closed |
| **Application** | Under review → Selected / Not selected / Withdrawn |
| **Agreement** | Agreeing terms → Active → Completed, or Disputed / Cancelled |
| **Milestone** | To do → Delivered → Approved |
| **Report** | Open → Reviewing → Resolved / Rejected |
| **User** | Active / Suspended |

---

## 13. Languages, dark mode and mobile

- **Three languages:** English, **اردو (Urdu)** and **العربية (Arabic)**. Urdu and Arabic switch the whole layout to **right-to-left**. Change it from the globe in the top bar (or the menu on phones).
- **Dark mode:** from the moon/sun icon, or **Settings → Appearance** (Light, Dark, System).
- **Mobile friendly:** every page works on phones and tablets. Menus collapse into the ☰ button, tab bars scroll sideways, filters open as a sheet, and tables fit the screen.

---

## 14. Trust, safety and privacy

- **Verification everywhere:** talent prove their profile with a one-time code; businesses and managers are checked by the team before they can hire or represent anyone.
- **Honest reviews:** reviews come only from **completed agreements**, so every star comes from real work.
- **Public data only:** unclaimed profiles are built from public sources, which are listed on the profile. Anyone can report a mistake or ask for removal.
- **Contacts are private** until a hire request is accepted.
- **Managers act only with the talent's permission**, and every action they take is shown as done on the talent's behalf.
- **Signed agreements** carry a fingerprint, signing time and record of who signed.
- **Admin actions are logged** in the audit log, and important actions always ask for confirmation.
- **Security:** limits on repeated login and code attempts (codes lock after 5 wrong tries), secure log-in sessions, and protected file uploads (images only, up to 2 MB).
- **Delete your account** any time from Settings.

---

## 15. Frequently asked questions

**Is it free?**
Yes, everything is free right now: searching, accounts, claiming, shortlists, hire requests, campaigns and agreements.

**Is this an agency?**
No. Businesses contact talent (or their manager) directly, and talent set their own prices.

**Who can hire?**
Only **verified businesses**, and only **verified talent** can be hired.

**How are payments made?**
Payment is arranged directly between the two sides, following the milestones and payment terms written in the signed agreement.

**I found a mistake on a profile.**
Open the profile and use **Report an error or request removal**.

**I can't find my profile.**
Create one from your talent dashboard. It goes live after your official account is verified.

**How do I contact the team?**
Email **hello@influenceplatform.com** or use **Contact us** in the footer. The team replies within 1–2 working days.

---

## 16. For the technical team

- **Live website:** https://influencer-frontend-kappa.vercel.app
- **Live backend (API):** https://influencer-backend-psi.vercel.app. The website reaches it through `/api` on its own domain, set in `vercel.json`.
- **Code:** this repository (website) and `influencer_backend` (server and database).
- **Built with:** React, TypeScript, Vite, Tailwind CSS, React Router, TanStack Query, and i18next for the three languages.
- **Hosting:** Vercel. Every push to `main` deploys automatically.
- **Useful commands:** `npm install`, `npm run dev` (development), `npm run build` (production build), `npm run lint` (code checks).
- **Translations** live in `src/i18n/locales/` (`en.json`, `ur.json`, `ar.json`). Every text on the site must exist in all three.
