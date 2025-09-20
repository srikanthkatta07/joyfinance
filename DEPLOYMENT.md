# Environment Variables for GitHub Pages

## Required Environment Variables

Your app needs these environment variables to work with Supabase:

### For Development (.env.local)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### For GitHub Pages (GitHub Secrets)
1. Go to your GitHub repository
2. Click Settings → Secrets and variables → Actions
3. Add these repository secrets:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## How to Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Click Settings → API
3. Copy:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon public** key → Use as `VITE_SUPABASE_ANON_KEY`

## Important Notes

- ✅ **Supabase works with GitHub Pages** - It's a backend service, so your frontend can connect to it from anywhere
- ✅ **Environment variables are safe** - The anon key is meant to be public
- ✅ **Database will work** - All your data and authentication will work normally
- ⚠️ **CORS settings** - Make sure your Supabase project allows requests from your GitHub Pages domain

## CORS Configuration

In your Supabase project:
1. Go to Settings → API
2. Add your GitHub Pages URL to "Additional redirect URLs":
   - `https://yourusername.github.io/joyfinance`
   - `https://yourusername.github.io/joyfinance/`

## Deployment Steps

1. **Push your code** to GitHub
2. **Add environment variables** as GitHub Secrets
3. **Enable GitHub Pages** in repository settings
4. **The GitHub Action will automatically deploy** when you push to main branch

Your app will be available at: `https://yourusername.github.io/joyfinance`
