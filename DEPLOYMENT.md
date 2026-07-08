# CampusConnect Hub — Deployment Guide

> Step-by-step technical guide to deploy CampusConnect Hub from local development to production.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Local Git Initialization](#2-local-git-initialization)
3. [Push to GitHub](#3-push-to-github)
4. [Supabase Database Setup](#4-supabase-database-setup)
5. [Supabase Storage Setup](#5-supabase-storage-setup)
6. [Supabase Auth Configuration](#6-supabase-auth-configuration)
7. [Groq API Key Setup](#7-groq-api-key-setup)
8. [Deploy Frontend to Vercel](#8-deploy-frontend-to-vercel)
9. [Configure Production Environment Variables](#9-configure-production-environment-variables)
10. [Post-Deployment Verification](#10-post-deployment-verification)

---

## 1. Prerequisites

Ensure you have the following installed and configured:

- **Node.js** ≥ 18.x ([nodejs.org](https://nodejs.org))
- **npm** ≥ 9.x (bundled with Node.js)
- **Git** ([git-scm.com](https://git-scm.com))
- **GitHub account** ([github.com](https://github.com))
- **Supabase account** ([supabase.com](https://supabase.com)) — free tier is sufficient
- **Groq account** ([console.groq.com](https://console.groq.com)) — free tier available
- **Vercel account** ([vercel.com](https://vercel.com)) — free Hobby tier works

---

## 2. Local Git Initialization

Open your terminal in the project root (`CampusConnect/`) and run:

```bash
# Initialize a new git repository
git init

# Stage all files
git add .

# Create initial commit
git commit -m "feat: initial CampusConnect Hub - full-stack campus platform"
```

---

## 3. Push to GitHub

### Create the repository on GitHub:

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `campusconnect-hub`
3. Set to **Private** or **Public** as desired
4. Do **NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **Create repository**

### Push your local repository:

```bash
# Add the remote origin (replace with your actual repo URL)
git remote add origin https://github.com/YOUR_USERNAME/campusconnect-hub.git

# Push to main branch
git branch -M main
git push -u origin main
```

---

## 4. Supabase Database Setup

### 4.1 Create a Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com)
2. Click **New Project**
3. Fill in:
   - **Name**: `campusconnect-hub`
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the nearest to your users
4. Click **Create new project** and wait for provisioning (~2 minutes)

### 4.2 Retrieve Your API Credentials

1. In the Supabase dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **anon (public) key** → This is your `VITE_SUPABASE_ANON_KEY`

### 4.3 Run the Database Migration

1. In the Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open the file `supabase/migration.sql` from your project
4. Copy the **entire contents** of the file
5. Paste it into the SQL Editor
6. Click **Run** (or press `Ctrl/Cmd + Enter`)
7. Verify you see a success message with no errors

This creates the following tables:
- `profiles` — User profiles linked to `auth.users`
- `listings_housing` — Housing listings with amenities
- `listings_marketplace` — P2P marketplace items
- `project_teams` — Team matchmaking posts
- `career_board` — Job and referral postings
- `resources` — Shared documents and notes

All tables include:
- UUID primary keys
- Row Level Security (RLS) policies
- Performance indexes
- Auto-updating `updated_at` timestamps

---

## 5. Supabase Storage Setup

For file uploads in the Resources module:

1. In the Supabase dashboard, go to **Storage**
2. Click **New Bucket**
3. Bucket name: `resources`
4. Toggle **Public bucket** to **ON**
5. Click **Create bucket**

### Set Storage Policy:

1. Click on the `resources` bucket
2. Go to **Policies** tab
3. Click **New Policy** → **For full customization**
4. Create the following policy:
   - **Name**: `Allow authenticated uploads`
   - **Allowed operations**: `INSERT`
   - **Target roles**: `authenticated`
   - **Policy definition**: `true`
5. Click **Review** → **Save**
6. Create another policy:
   - **Name**: `Allow public reads`
   - **Allowed operations**: `SELECT`
   - **Target roles**: `public`
   - **Policy definition**: `true`
7. Click **Review** → **Save**

---

## 6. Supabase Auth Configuration

1. In the Supabase dashboard, go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled (it should be by default)
3. Optionally, go to **Authentication** → **Settings**:
   - **Site URL**: Set to your production URL (e.g., `https://campusconnect-hub.vercel.app`)
   - **Redirect URLs**: Add your production and local URLs:
     - `http://localhost:5173`
     - `https://campusconnect-hub.vercel.app`

---

## 7. Groq API Key Setup

1. Go to [console.groq.com](https://console.groq.com)
2. Sign in or create an account
3. Navigate to **API Keys**
4. Click **Create API Key**
5. Name it `campusconnect-hub`
6. Copy the generated key — this is your `VITE_GROQ_API_KEY`

> **Note**: The free tier provides generous rate limits. The app uses the `llama3-8b-8192` model for both the referral polisher and notes summarizer.

---

## 8. Deploy Frontend to Vercel

### 8.1 Connect Repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select your `campusconnect-hub` repository
4. Vercel will auto-detect the Vite framework

### 8.2 Configure Build Settings

Verify these settings (Vercel should auto-detect them):

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 8.3 Set Environment Variables

Before clicking **Deploy**, add the following environment variables:

| Variable Name | Value |
|---------------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL (from Step 4.2) |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key (from Step 4.2) |
| `VITE_GROQ_API_KEY` | Your Groq API key (from Step 7) |

> **Critical**: All three variables must be prefixed with `VITE_` for Vite to expose them to the client bundle.

### 8.4 Deploy

1. Click **Deploy**
2. Wait for the build to complete (~1-2 minutes)
3. Vercel will provide a production URL (e.g., `https://campusconnect-hub.vercel.app`)

---

## 9. Configure Production Environment Variables

### 9.1 Environment Variable Summary

| Variable | Where to Get It | Used For |
|----------|-----------------|----------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | Database, Auth, Storage |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon/public key | Client-side Supabase authentication |
| `VITE_GROQ_API_KEY` | console.groq.com → API Keys | AI referral polisher + notes summarizer |

### 9.2 Local Development (.env file)

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GROQ_API_KEY=gsk_...
```

> **Never commit `.env` to version control.** It is already listed in `.gitignore`.

### 9.3 Vercel Production

If you need to update environment variables after initial deployment:

1. Go to your project on [vercel.com](https://vercel.com)
2. Navigate to **Settings** → **Environment Variables**
3. Add or update the three `VITE_*` variables
4. Click **Save**
5. Go to **Deployments** → Click the three dots on the latest deployment → **Redeploy**

---

## 10. Post-Deployment Verification

After deployment, verify all features work correctly:

### Checklist

- [ ] **Auth**: Register with a `.edu` email address → verify email validation works
- [ ] **Auth**: Sign in with registered credentials
- [ ] **Auth**: Institutional accountability banner displays on the login page
- [ ] **Housing Hub**: Create a housing listing → verify it appears in the feed
- [ ] **Housing Hub**: Test budget and bedroom filters
- [ ] **Marketplace**: Create a marketplace item with WhatsApp number
- [ ] **Marketplace**: Click "Contact" → verify WhatsApp opens with pre-filled message
- [ ] **Team-Up**: Create a team post with skill tags
- [ ] **Team-Up**: Filter by skill tags → verify dynamic filtering works
- [ ] **Career Board**: Post a job with referral contact
- [ ] **Career Board**: Click "Polish Referral" → enter raw text → verify AI generates polished output
- [ ] **Resources**: Share a resource with text content
- [ ] **Resources**: Click "Summarize" → verify AI generates bulleted takeaways in drawer
- [ ] **Responsive**: Test on mobile viewport → verify sidebar collapses to hamburger menu

### Troubleshooting

| Issue | Solution |
|-------|----------|
| "Supabase credentials missing" console warning | Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly |
| Auth errors on sign-up | Run the migration SQL; ensure `profiles` table and RLS policies exist |
| AI features return errors | Verify `VITE_GROQ_API_KEY` is set and valid; check Groq API rate limits |
| File uploads fail | Create the `resources` storage bucket in Supabase and set policies (Step 5) |
| White screen after login | Check browser console for errors; ensure all tables exist in Supabase |
| "RLS policy violation" errors | Re-run the migration SQL to ensure all policies are created |

---

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Vercel     │────▶│  React SPA   │────▶│  Supabase   │
│   (CDN)      │     │  (Vite)      │     │  (Postgres) │
└─────────────┘     └──────┬───────┘     │  Auth       │
                           │              │  Storage    │
                           │              └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Groq API   │
                    │  (LLaMA 3)   │
                    └──────────────┘
```

---

## Continuous Deployment

Vercel automatically redeploys on every push to the `main` branch. To deploy:

```bash
git add .
git commit -m "feat: your changes"
git push origin main
```

Vercel will automatically build and deploy within ~1-2 minutes.
