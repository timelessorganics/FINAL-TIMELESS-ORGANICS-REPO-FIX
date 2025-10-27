# 🎥 Deploy Videos to Netlify (Simple Guide)

**Time:** 10 minutes  
**Cost:** FREE (Netlify has generous bandwidth)  
**What it does:** Makes your smoke/fire videos visible on www.timeless.organic

---

## Option 1: Upload Directly to Netlify (EASIEST)

### Step 1: Build Your Site Locally

```bash
npm run build
```

This creates a `dist/` folder with your built React app.

### Step 2: Copy Videos to Build Folder

```bash
# Create public assets folder in dist
mkdir -p dist/assets

# Copy all 6 videos
cp "attached_assets/1-SMOKE HOVERING.mp4" dist/assets/
cp "attached_assets/2-SMOKE HOVERING.mp4" dist/assets/
cp "attached_assets/3-SMOKE HOVERING.mp4" dist/assets/
cp "attached_assets/4-FIRE HOVERING.mp4" dist/assets/
cp "attached_assets/5-FIRE HOVERING.mp4" dist/assets/
cp "attached_assets/6-FIRE HOVERING.mp4" dist/assets/
```

### Step 3: Deploy to Netlify

**Via Drag & Drop:**
1. Go to **https://app.netlify.com**
2. Drag your entire `dist/` folder to the Netlify dashboard
3. Netlify will upload everything (including videos)
4. Done! Videos are now at `https://www.timeless.organic/assets/1-SMOKE HOVERING.mp4`

**Via Netlify CLI:**
```bash
# Install Netlify CLI (one time)
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

---

## Option 2: Cloudflare R2 (FREE FOREVER - RECOMMENDED FOR SCALE)

**Why:** Zero bandwidth costs, perfect for videos

### Step 1: Create R2 Bucket

1. Go to **https://dash.cloudflare.com**
2. Click **R2** in left sidebar
3. Click **"Create bucket"**
4. Name it: `timeless-organics-videos`
5. Click **"Create bucket"**

### Step 2: Upload Videos

1. Click on your bucket
2. Click **"Upload"**
3. Drag all 6 video files
4. Wait for upload to complete

### Step 3: Make Public

1. Go to **Settings** tab
2. Scroll to **"Public Access"**
3. Click **"Allow Access"**
4. Copy your public bucket URL (e.g., `https://pub-xxxxx.r2.dev`)

### Step 4: Update Video URLs in Code

Edit `client/src/components/SmokeFireBackground.tsx`:

```typescript
// Change from:
const videos = [
  "/attached_assets/1-SMOKE HOVERING.mp4",
  // ...
];

// To:
const videos = [
  "https://pub-xxxxx.r2.dev/1-SMOKE HOVERING.mp4",
  "https://pub-xxxxx.r2.dev/2-SMOKE HOVERING.mp4",
  "https://pub-xxxxx.r2.dev/3-SMOKE HOVERING.mp4",
  "https://pub-xxxxx.r2.dev/4-FIRE HOVERING.mp4",
  "https://pub-xxxxx.r2.dev/5-FIRE HOVERING.mp4",
  "https://pub-xxxxx.r2.dev/6-FIRE HOVERING.mp4",
];
```

### Step 5: Push to GitHub

```bash
git add .
git commit -m "Update video URLs to Cloudflare R2"
git push origin main
```

Netlify will auto-rebuild with new video URLs!

---

## ✅ Which Option Should You Choose?

**Option 1 (Netlify):** 
- ✅ Fastest to set up (10 minutes)
- ✅ No code changes needed
- ⚠️ Costs money if you get lots of traffic (unlikely at start)

**Option 2 (Cloudflare R2):**
- ✅ FREE forever, unlimited bandwidth
- ✅ Better for scaling
- ⚠️ Requires small code change

**Recommendation:** Start with **Option 1** (Netlify), migrate to **Option 2** (R2) later if needed.

---

## Troubleshooting

**Videos not playing?**
- Check browser console for CORS errors
- Verify video URLs are publicly accessible
- Make sure file names match exactly (including spaces)

**Videos too slow?**
- Cloudflare R2 has global CDN (faster)
- Netlify also has CDN but may have bandwidth limits

**Videos work on Replit but not Netlify?**
- Verify videos were actually uploaded to Netlify
- Check that file paths are correct in `SmokeFireBackground.tsx`
