# Copilot Instructions

This is a Next.js + Better Auth + GitHub OAuth + SQLite demo project.

## Project Overview
- Framework: Next.js (App Router) with TypeScript
- Authentication: Better Auth with GitHub OAuth
- Database: SQLite (better-sqlite3)
- UI: Tailwind CSS
- Package Manager: npm

## Key Files
- `lib/auth.ts` - Better Auth configuration
- `app/api/auth/[...all]/route.ts` - Auth API routes
- `app/page.tsx` - Home page with auth state
- `app/login/page.tsx` - Login page
- `better-auth.sqlite` - SQLite database (auto-generated)

## Quick Start
1. Install dependencies: `npm install`
2. Create `.env.local` from `.env.local.example`
3. Add GitHub OAuth credentials
4. Start dev server: `npm run dev`
5. View at `http://localhost:3000`

## Environment Setup
Copy `.env.local.example` to `.env.local` and add:
- `GITHUB_CLIENT_ID` - from GitHub OAuth App
- `GITHUB_CLIENT_SECRET` - from GitHub OAuth App
- `BETTER_AUTH_SECRET` - any random string

## Database
SQLite database auto-initializes on first run.
To reset: `rm better-auth.sqlite && npm run dev`

## Project Status
✅ Next.js setup complete
✅ Better Auth configured
✅ GitHub OAuth integration ready
✅ Database schema initialized
✅ UI components created
✅ Dev server running on port 3000
