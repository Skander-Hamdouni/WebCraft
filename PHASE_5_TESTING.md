# Phase 5 — Quick Testing Guide

## Quick Start (After Setup)

### 1. First Time Setup
```
1. Open index.html in browser
2. Update SUPABASE_URL and SUPABASE_ANON_KEY in app.js (line ~12-13)
3. Run SQL migrations in your Supabase SQL editor (copy from SUPABASE_MIGRATIONS.sql)
4. Refresh the page
```

### 2. Test Authentication

#### Sign Up Flow
```
1. Click "Connexion" in top nav
2. Click "Créer un compte" tab
3. Fill in:
   - Nom complet: "Test User"
   - Email: "test@example.com"
   - Mot de passe: "password123" (min 8 chars)
   - Code parrain: (leave empty or use existing referral code)
4. Click "Créer mon compte gratuit →"
5. Should redirect to Dashboard showing "Bonjour, Test User 👋"
```

#### Sign In Flow
```
1. Logout or click "Connexion" in nav
2. Stay on "Se connecter" tab
3. Enter email and password
4. Click "Se connecter →"
5. Should redirect to Dashboard
```

#### Logout Flow
```
1. In Dashboard, click "Déconnexion ✕" button (top right)
2. Should return to login page
3. Referral link input should be empty
```

### 3. Test Dashboard

#### Verify User Data
```
✓ "Bonjour, [Name] 👋" shows user's display name
✓ Stats show correct site count
✓ Referral code shown (format: ABC-YYMM-XXXX)
✓ "Partager mon lien" button works (copies: webcraft.io/ref/CODE)
```

#### Site Creation
```
1. On Dashboard, click "+ Nouveau site"
2. Select a template (e.g., "Restaurant")
3. Prompt appears: "Nom du site"
4. Enter "Mon Restaurant"
5. Site should appear in grid on Dashboard
6. In browser console, check: sites saved to Supabase
```

#### Site Editing
```
1. Click on any site card
2. Goes to Editor
3. Make changes to canvas (drag/edit blocks)
4. Wait 30 seconds OR change site title
5. Check browser console for "Auto-save" message
6. Close and reopen site - changes should persist
```

#### Site Deletion
```
1. In Dashboard, click site card
2. In site grid overlay, click "Supprimer"
3. Confirm deletion dialog
4. Site removed from grid and Supabase
```

### 4. Test Editor Features

#### Auto-Save Indicator
```
1. Open any site in Editor
2. Make a change (e.g., drag a block)
3. After 30 seconds, top bar shows "💾 Sauvegarde..."
4. Indicator disappears after save completes
5. Refresh page - changes still there
```

#### Publish Flow
```
1. In Editor, click "Publier ✦" button
2. Site saves to Supabase with status="published"
3. Success modal shows: "https://[slug].webcraft.io"
4. Click close to dismiss
5. Site status should show "published" (if displayed in dashboard)
```

#### Site Title Sync
```
1. Change site title in topbar input
2. Wait 30 seconds for auto-save
3. Go back to Dashboard and reopen - title should match
```

### 5. Test Referral System

#### Referral Code Generation
```
1. Sign up new user without referral code
2. In Supabase, query: SELECT referral_code FROM profiles WHERE id='[user-id]'
3. Should show auto-generated code (ABC-YYMM-XXXX format)
```

#### Referral Link Copy
```
1. In Dashboard, click "Partager mon lien" button
2. Copy notification appears for 1.5 seconds
3. Paste (Ctrl+V) - should show: webcraft.io/ref/[YOUR-CODE]
```

#### Referral Signup
```
1. Get referral code from existing user (e.g., "SKA-2503-1234")
2. In signup form, paste code in "Code parrain" field
3. Complete signup
4. In Supabase profiles table: new user should have referred_by=[referrer_id]
```

### 6. Test Session Persistence

#### localStorage Persistence
```
1. Sign up or sign in
2. Refresh page (F5)
3. Should remain logged in (no redirect to login)
4. Check browser Storage → localStorage → "sb_user" contains user JSON
```

#### Logout Clears Session
```
1. Logout from Dashboard
2. Check localStorage - "sb_user" should be removed
3. Refresh page - goes to login page
```

## Browser Console Debugging

### Check Current User State
```javascript
console.log(currentUser);     // Should show logged-in user object
console.log(currentSite);     // Should show currently editing site object
console.log(els);             // Should show canvas elements
```

### Check Supabase Connection
```javascript
console.log(supabase);        // Should show Supabase client object
// Test query:
supabase.from('sites').select('*').limit(1).then(r => console.log(r.data));
```

### Manually Trigger Auto-Save
```javascript
autoSaveCanvas();             // Saves current canvas to Supabase
```

### Check RLS Policies
```
In Supabase SQL Editor:
SELECT * FROM pg_policies WHERE tablename = 'sites';
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

## Common Issues

### Issue: "Supabase is not defined"
**Solution**: Ensure Supabase CDN loads before app.js:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="app.js"></script>
```

### Issue: Login fails with "missing credentials"
**Solution**: 
- Check email is valid format
- Password must be 8+ characters
- Verify user exists (check Supabase Auth tab)

### Issue: Sites not loading in Dashboard
**Possible causes**:
- Not logged in (check `currentUser` in console)
- RLS policy blocking query (check Supabase Row Security settings)
- Network error (check Network tab in DevTools)

**Solution**: 
```javascript
// In console, check auth status:
supabase.auth.getUser().then(r => console.log(r.data.user));
```

### Issue: Auto-save doesn't work
**Solution**:
- Check saving indicator appears after 30 seconds
- In console: `autoSaveCanvas()` manually to test
- Check Supabase credentials are correct
- Check browser console for errors

### Issue: Referral code not linking
**Solution**:
- Referral code must exist (uppercase, hyphens)
- If invalid code, user still signs up (code just ignored)
- Check `referred_by` column in profiles table after signup

## Files to Monitor During Testing

Monitor these files in your editor/IDE for changes:
- `app.js` - Main code changes (look for `console.log` messages)
- Browser DevTools Console - Supabase errors and logs
- Supabase Dashboard → Realtime → View Table Updates live

## Next: Production Checklist

Before going live:
- [ ] Update SUPABASE_URL and SUPABASE_ANON_KEY
- [ ] Enable RLS policies in Supabase
- [ ] Test all auth flows
- [ ] Test site CRUD operations
- [ ] Verify auto-save works
- [ ] Test referral signup with code
- [ ] Check error handling on network failures
- [ ] Test on mobile devices
- [ ] Set up backup/restore plan for Supabase
