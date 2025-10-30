# Vercel Deployment Guide

## Environment Variables Required

Make sure these are set in your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=https://mougikqqyeybvphzskrg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

## Supabase Configuration

### 1. Add Vercel URL to Supabase Auth Settings

Go to: https://supabase.com/dashboard/project/mougikqqyeybvphzskrg/auth/url-configuration

Add these URLs to **Redirect URLs**:
- `https://your-app.vercel.app/auth/callback`
- `https://your-app.vercel.app`

### 2. Site URL
Set the **Site URL** to: `https://your-app.vercel.app`

## Files Added for Production

1. **`app/auth/callback/route.ts`** - Handles OAuth callback and session exchange
2. **Updated `middleware.ts`** - Properly refreshes Supabase sessions

## Build Command

```bash
npm run build
```

## Deployment Steps

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy
5. Update Supabase redirect URLs with your Vercel domain
6. Test login/logout functionality

## Troubleshooting

### Can't login after deployment?
- Check environment variables are set in Vercel
- Verify Supabase redirect URLs include your Vercel domain
- Check browser console for errors
- Verify cookies are being set (check Application tab in DevTools)

### Database migration needed?
Run the migration in Supabase SQL Editor:
```sql
-- Run: supabase/migrations/001_initial_schema.sql
-- Run: supabase/migrations/002_add_coordinates.sql
```
