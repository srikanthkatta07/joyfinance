# Environment Variables for GitHub Pages

## Required Environment Variables

Your JoyCarDecors app needs these environment variables to work with Supabase:

### For Development (.env.local)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
```

### For GitHub Pages (GitHub Secrets)
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these secrets:
   - **Name**: `VITE_SUPABASE_URL`
     **Value**: Your Supabase project URL (e.g., `https://yourproject.supabase.co`)
   - **Name**: `VITE_SUPABASE_ANON_KEY`
     **Value**: Your Supabase anonymous key (the long string starting with `eyJ...`)
   - **Name**: `VITE_SUPABASE_PROJECT_ID`
     **Value**: Your Supabase project ID (found in project settings)

## How to Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Click **Settings** → **API**
3. Copy:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon public** key → Use as `VITE_SUPABASE_ANON_KEY`
4. Click **Settings** → **General**
5. Copy:
   - **Project ID** → Use as `VITE_SUPABASE_PROJECT_ID`

## Important Notes

- ✅ **Supabase works with GitHub Pages** - It's a backend service, so your frontend can connect to it from anywhere
- ✅ **Environment variables are safe** - The anon key is meant to be public
- ✅ **Database will work** - All your data and authentication will work normally
- ⚠️ **CORS settings** - Make sure your Supabase project allows requests from your GitHub Pages domain

## CORS Configuration

In your Supabase project:
1. Go to **Settings** → **API**
2. Add your GitHub Pages URL to "Additional redirect URLs":
   - `https://yourusername.github.io/joyfinance`
   - `https://yourusername.github.io/joyfinance/`

## Deployment Steps

1. **Push your code** to GitHub
2. **Add environment variables** as GitHub Secrets (see above)
3. **Enable GitHub Pages** in repository settings:
   - Go to **Settings** → **Pages**
   - Source: **GitHub Actions**
4. **The GitHub Action will automatically deploy** when you push to main branch

## Testing Environment Variables

To test if your environment variables are working:

1. **Check the build logs** in GitHub Actions
2. **Look for any errors** related to Supabase connection
3. **Test the app** on your GitHub Pages URL

Your app will be available at: `https://yourusername.github.io/joyfinance`

## Troubleshooting

### Build Fails with "Environment variable not found"
- Make sure you added the secrets in GitHub repository settings
- Check that the secret names match exactly: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_SUPABASE_PROJECT_ID`

### App loads but can't connect to Supabase
- Check your Supabase URL and key are correct
- Verify CORS settings in Supabase
- Check browser console for errors

### PWA not working
- Make sure you have the required icon files in `/public`
- Check that the manifest is being generated correctly
