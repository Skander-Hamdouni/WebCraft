# Phase 5 — Supabase Backend Integration Setup

## Overview
WebCraft now integrates Supabase for:
- **Authentication**: Email/password signup & signin with session management
- **Site Storage**: Auto-save to Supabase every 30 seconds + on publish
- **Referral System**: Automatic referral code generation and tracking
- **Dashboard**: Dynamic site loading from Supabase

## Setup Instructions

### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Note your **Project URL** and **Public Anon Key** (found in Settings → API)

### Step 2: Run SQL Migrations
1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire content from `SUPABASE_MIGRATIONS.sql` (in your WebCraft folder)
4. Paste and run (click play button)

This creates:
- `profiles` table (extends auth.users with referral codes)
- `sites` table (stores user sites with JSON data)
- Row Level Security policies
- Automatic profile creation trigger

### Step 3: Add Supabase Credentials
1. In the `app.js` file, find the `initSupabase()` function (around line 10)
2. Replace the placeholder values:
   ```javascript
   var SUPABASE_URL = 'https://your-project.supabase.co';
   var SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```
3. Paste your actual Project URL and Anon Key from Supabase

### Step 4: Test Authentication
1. Open WebCraft in your browser
2. Go to **Connexion** page
3. Click **Créer un compte** tab
4. Fill in email, password (8+ chars), and optionally a referral code
5. Click **Créer mon compte gratuit**
6. You should be redirected to Dashboard with your sites

## Features Implemented

### Authentication
- **Email/Password Signup**: Create account with display name and optional referral code
- **Email/Password Signin**: Login existing users
- **Session Persistence**: Session stored in localStorage, auto-restored on page reload
- **Logout**: Clear session and return to login page

### Dashboard
- **Dynamic Site List**: Load all user's sites from Supabase
- **Statistics**: Shows site count, last update, referral code
- **Referral Link**: Auto-generated unique referral code displayed
- **Site Management**: Create, edit, view, and delete sites

### Editor Integration
- **Auto-Save**: Canvas state saved to Supabase every 30 seconds
- **Saving Indicator**: "💾 Sauvegarde..." appears in topbar during save
- **Publish**: Saves site with "published" status to Supabase
- **Site Title Sync**: Title changes sync with Supabase

### Referral System
- **Auto-Generation**: Every new user gets a unique referral code (format: ABC-YYMM-XXXX)
- **Referral Linking**: If signup includes a referral code, user is linked to referrer
- **Tracking**: `referred_by` column in profiles table tracks who referred them

### Template Loading
- **Authenticated Users**: Clicking "Utiliser ce template" creates a new site in Supabase
- **Non-Authenticated**: Demo mode loads template into browser (local only)

## Database Schema

### profiles table
```sql
- id (UUID, pk) → references auth.users
- display_name (TEXT)
- referral_code (TEXT, unique)
- referred_by (UUID) → references auth.users [nullable]
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### sites table
```sql
- id (UUID, pk, auto-generated)
- user_id (UUID, fk) → references auth.users
- name (TEXT)
- data (JSONB) → { els: {}, elCounter: 0 }
- status (TEXT) → 'draft' or 'published'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## API Calls Made

### Authentication
- `supabase.auth.signInWithPassword()` - Email/password signin
- `supabase.auth.signUp()` - Email/password signup
- `supabase.auth.signOut()` - Logout
- `supabase.auth.getUser()` - Check current session

### Sites
- `supabase.from('sites').select()` - Load user's sites
- `supabase.from('sites').insert()` - Create new site
- `supabase.from('sites').update()` - Save site updates (auto-save & publish)
- `supabase.from('sites').delete()` - Delete site

### Profiles
- `supabase.from('profiles').select()` - Get user profile with referral code
- `supabase.from('profiles').update()` - Update profile (referred_by via linkReferral)

## Troubleshooting

### "Supabase library not loaded"
- Ensure Supabase CDN script loads before app.js: `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>`

### Auth errors (Invalid credentials)
- Check email/password in signup form
- Ensure password is 8+ characters
- Verify email isn't already registered

### Auto-save not working
- Check Supabase credentials are correct
- Open browser console (F12) for error messages
- Ensure RLS policies are enabled in SQL migrations

### Sites not loading on dashboard
- Check user authentication (should show in browser console)
- Verify `sites` table exists in Supabase
- Check RLS policy: `auth.uid() = user_id`

### Referral code issues
- Codes auto-generate on signup (format: `ABC-YYMM-XXXX`)
- Invalid referral codes are silently ignored (user still signs up)
- Check `profiles.referral_code` column in Supabase to see generated codes

## Security Notes

- **RLS Enabled**: All tables have Row Level Security policies
- **User Isolation**: Users can only access their own sites/profiles
- **Anon Key**: Using public anon key (safe - RLS prevents unauthorized access)
- **Password**: Stored securely by Supabase, never transmitted to WebCraft server

## Next Steps

- Implement social login (Google, GitHub) in `handleGoogleSignIn()` and `handleGithubSignIn()`
- Add payment integration for Pro plan
- Implement public site publishing/hosting
- Add team collaboration features
- Add site analytics tracking

## Files Modified

- `index.html`: Added Supabase CDN, updated login/dashboard forms, added saving indicator
- `app.js`: Added auth functions, site management, auto-save, referral handling
- `style.css`: Added error message styling
- `SUPABASE_MIGRATIONS.sql`: Database schema (new file)
- `supabase.config.js`: Configuration template (new file)

---

**Questions?** Check the browser console (F12) for detailed error messages during debugging.
