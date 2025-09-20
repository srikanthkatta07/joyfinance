# Environment Variables for GitHub Pages

## Required Environment Variables

Your JoyCarDecors app needs these environment variables to work with Supabase:

### For Development (.env.local)
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_SUPABASE_PROJECT_ID=your_supabase_project_id
```

### For GitHub Pages (GitHub Secrets)
1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add these secrets:
   - **Name**: `VITE_SUPABASE_URL`
     **Value**: Your Supabase project URL (e.g., `https://yourproject.supabase.co`)
   - **Name**: `VITE_SUPABASE_PUBLISHABLE_KEY`
     **Value**: Your Supabase publishable key (the long string starting with `eyJ...`)
   - **Name**: `VITE_SUPABASE_PROJECT_ID`
     **Value**: Your Supabase project ID (found in project settings)

## How to Get Supabase Credentials

1. Go to your Supabase project dashboard
2. Click **Settings** → **API**
3. Copy:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon public** key → Use as `VITE_SUPABASE_PUBLISHABLE_KEY`
4. Click **Settings** → **General**
5. Copy:
   - **Project ID** → Use as `VITE_SUPABASE_PROJECT_ID`

## Important Notes

- ✅ **Supabase works with GitHub Pages** - It's a backend service, so your frontend can connect to it from anywhere
- ✅ **Environment variables are safe** - The publishable key is meant to be public
- ✅ **Database will work** - All your data and authentication will work normally
- ⚠️ **CORS settings** - Make sure your Supabase project allows requests from your GitHub Pages domain

## CORS Configuration

In your Supabase project:
1. Go to **Settings** → **API**
2. Add your GitHub Pages URL to "Additional redirect URLs":
   - `https://yourusername.github.io/joyfinance`
   - `https://yourusername.github.io/joyfinance/`

## GitHub Pages Setup (Required)

**IMPORTANT**: You must enable GitHub Pages in your repository settings:

### Step 1: Enable GitHub Pages
1. **Go to your GitHub repository**
2. **Click Settings** → **Pages**
3. **Source**: Select **"GitHub Actions"**
4. **Save** the settings

### Step 2: Verify Repository Settings
Make sure your repository:
- ✅ **Is public** (required for free GitHub Pages)
- ✅ **Has Pages enabled** with "GitHub Actions" as source
- ✅ **Has Actions enabled** (Settings → Actions → General → Allow all actions)

### Step 3: Run the Workflow
The workflow will automatically enable Pages if needed, but you should still configure it manually first.

This enables the GitHub Actions bot to deploy to Pages.

## Deployment Methods

### Manual Deployment (Only Method)
1. **Go to your GitHub repository**
2. **Click "Actions" tab**
3. **Select "Deploy to GitHub Pages" workflow**
4. **Click "Run workflow"**
5. **Choose branch** (default: main)
6. **Click "Run workflow"**

**Note**: This workflow only runs when manually triggered - no automatic deployments.

## Deployment Steps

1. **Push your code** to GitHub
2. **Add environment variables** as GitHub Secrets (see above)
3. **Enable GitHub Pages** in repository settings:
   - Go to **Settings** → **Pages**
   - Source: **GitHub Actions**
4. **Deploy manually** using the steps above

## Testing Environment Variables

To test if your environment variables are working:

1. **Check the build logs** in GitHub Actions
2. **Look for any errors** related to Supabase connection
3. **Test the app** on your GitHub Pages URL

Your app will be available at: `https://yourusername.github.io/joyfinance`

## Troubleshooting

### Build Fails with "Environment variable not found"
- Make sure you added the secrets in GitHub repository settings
- Check that the secret names match exactly: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_SUPABASE_PROJECT_ID`

### App loads but can't connect to Supabase
- Check your Supabase URL and key are correct
- Verify CORS settings in Supabase
- Check browser console for errors

### PWA not working
- Make sure you have the required icon files in `/public`
- Check that the manifest is being generated correctly

### "Permission denied to github-actions[bot]" Error
This error means GitHub Pages isn't properly configured:

1. **Go to Settings** → **Pages**
2. **Source**: Select **"GitHub Actions"** (not "Deploy from a branch")
3. **Save** the settings
4. **Re-run** the workflow

### "Get Pages site failed" Error
This error means GitHub Pages isn't properly configured:

1. **Check repository is public** (required for free GitHub Pages)
2. **Go to Settings** → **Pages**
3. **Source**: Select **"GitHub Actions"** (not "Deploy from a branch")
4. **Save** the settings
5. **Wait 2-3 minutes** for GitHub to process the changes
6. **Re-run** the workflow

### "HttpError: Not Found" Error
- Make sure your repository is **public**
- Verify GitHub Pages is enabled with "GitHub Actions" as source
- Check that Actions are enabled in repository settings
- Wait a few minutes after enabling Pages before running the workflow

### "Resource not accessible by integration" Error
This error means the GitHub Actions bot doesn't have proper permissions:

1. **Check repository is PUBLIC** (required for free GitHub Pages)
2. **Go to Settings** → **Pages**
3. **Source**: Select **"GitHub Actions"** (not "Deploy from a branch")
4. **Save** the settings
5. **Go to Settings** → **Actions** → **General**
6. **Workflow permissions**: Select **"Read and write permissions"**
7. **Allow GitHub Actions to create and approve pull requests**: Check this box
8. **Save** the settings
9. **Wait 2-3 minutes** for changes to take effect
10. **Re-run** the workflow

### Alternative: Use Personal Access Token
If the above doesn't work, you can use a Personal Access Token:

1. **Create a Personal Access Token** (Settings → Developer settings → Personal access tokens)
2. **Add it as a repository secret** named `PERSONAL_ACCESS_TOKEN`
3. **Update the workflow** to use `github_token: ${{ secrets.PERSONAL_ACCESS_TOKEN }}`
