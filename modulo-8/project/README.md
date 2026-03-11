# Next.js + Better Auth + GitHub OAuth Demo

A simple demo project showing how to integrate Better Auth with Next.js (App Router) and GitHub OAuth using SQLite.

## Features

- 🔐 GitHub OAuth authentication with Better Auth
- 🗄️ SQLite database for persistent storage
- 🎨 Beautiful UI with Tailwind CSS
- 📱 Responsive design
- ⚡ Next.js App Router with TypeScript

## Project Structure

```
.
├── app/
│   ├── api/
│   │   └── auth/[...all]/route.ts    # Better Auth API route handler
│   ├── login/
│   │   └── page.tsx                  # Login page with GitHub button
│   ├── globals.css                   # Tailwind CSS imports
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page (shows auth state)
├── lib/
│   └── auth.ts                       # Better Auth configuration
├── .env.local.example                # Environment variables template
├── next.config.ts                    # Next.js configuration
├── tsconfig.json                     # TypeScript configuration
├── tailwind.config.ts                # Tailwind CSS configuration
└── package.json                      # Dependencies
```

## Prerequisites

- Node.js 18+ (with npm)
- A GitHub OAuth App (for clientId/clientSecret)

## Setup Instructions

### 1. Clone/Copy the project and install dependencies

```bash
npm install
```

### 2. Create your GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click on "OAuth Apps" → "New OAuth App"
3. Fill in the form:
   - **Application name**: Better Auth Demo
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Copy the **Client ID** and **Client Secret**

### 3. Set up Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Add your GitHub credentials to `.env.local`:

```
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
BETTER_AUTH_SECRET=a-random-secret-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Database Migrations

Better Auth manages the database schema automatically. To initialize the database:

```bash
npx @better-auth/cli migrate
```

This will create the `better-auth.sqlite` file with the required tables.

### 5. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Usage

1. **Home Page** (`http://localhost:3000`)
   - Shows "You are not logged in" if not authenticated
   - Shows logged user info if authenticated

2. **Login Page** (`http://localhost:3000/login`)
   - Click "Sign in with GitHub" to start OAuth flow
   - You'll be redirected to GitHub for authentication
   - After login, you'll be redirected back to the home page

3. **Logout**
   - Click the "Exit" button to log out

## Key Technologies

- **Next.js**: React framework with App Router
- **Better Auth**: Modern authentication library
- **better-sqlite3**: Lightweight SQLite driver
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type-safe JavaScript

## Database

The SQLite database (`better-auth.sqlite`) will be created automatically:
- Stores user data
- Manages sessions
- Tracks OAuth tokens

## Troubleshooting

**Port 3000 already in use?**
```bash
npm run dev -- -p 3001
```

**Database issues?**
```bash
# Remove the database and re-run migrations
rm better-auth.sqlite
npx @better-auth/cli migrate
```

**GitHub OAuth not working?**
- Verify Client ID and Secret are correct
- Check the Authorization callback URL matches exactly
- Ensure `.env.local` is loaded (restart dev server)

## Building for Production

```bash
npm run build
npm run start
```

## License

MIT
