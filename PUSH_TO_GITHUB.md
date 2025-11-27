# Push Code to GitHub - Simple Instructions

## Step 1: Open the Shell Tab
Click on the **Shell** tab in your Replit workspace (it's at the bottom or right side)

## Step 2: Run These Commands (Copy & Paste One by One)

### Get your GitHub token from the integration:
```bash
node -e "
(async () => {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? 'repl ' + process.env.REPL_IDENTITY : null;
  const res = await fetch('https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github', {
    headers: { 'Accept': 'application/json', 'X_REPLIT_TOKEN': xReplitToken }
  });
  const data = await res.json();
  const token = data.items?.[0]?.settings?.access_token;
  console.log('GITHUB_TOKEN=' + token);
})();
"
```

This will output something like: `GITHUB_TOKEN=gho_xxxxxxxxxxxx`

### Copy that token, then run these commands (replace YOUR_TOKEN with the token above):

```bash
# Set git user (just for this push)
git config user.email "david@timeless.organic"
git config user.name "Timeless Organics"

# Add all files
git add -A

# Create commit
git commit -m "Initial commit: Timeless Organics Founding 100 launch site"

# Set the remote URL with your token (REPLACE YOUR_TOKEN)
git remote set-url origin https://YOUR_TOKEN@github.com/timelessorganics/FINAL-TIMELESS-ORGANICS-REPO-FIX.git

# Push to GitHub
git branch -M main
git push -u origin main --force

# Clean up - remove token from remote URL for security
git remote set-url origin https://github.com/timelessorganics/FINAL-TIMELESS-ORGANICS-REPO-FIX.git
```

## Step 3: Verify on GitHub
Go to https://github.com/timelessorganics/FINAL-TIMELESS-ORGANICS-REPO-FIX and you should see all your code!

## Step 4: Connect to Netlify
Once the code is pushed:

1. Go to Netlify: https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" 
4. Select the repository: `timelessorganics/FINAL-TIMELESS-ORGANICS-REPO-FIX`
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Branch to deploy**: `main`

6. Click "Add environment variables" and add these 8 variables:
   - `DATABASE_URL` (your Supabase connection string)
   - `SUPABASE_URL` 
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET`
   - `PAYFAST_MERCHANT_ID` = `32126679`
   - `PAYFAST_MERCHANT_KEY` = `mpr53oegzh4sn`
   - `PAYFAST_PASSPHRASE` = `DavidjunorTimeorg123`
   - `PAYFAST_MODE` = `production`

7. Click "Deploy site"

8. Once deployed, go to "Domain settings" and add your custom domain: `www.timeless.organic`

## Notes
- The GitHub connection is to your **timelessorganics** organization account (not personal)
- Your code will be at: https://github.com/timelessorganics/FINAL-TIMELESS-ORGANICS-REPO-FIX
- This will NOT overwrite your main timeless.organic site - this is a separate repository
- After deployment, your launch site will be at www.timeless.organic/founding100