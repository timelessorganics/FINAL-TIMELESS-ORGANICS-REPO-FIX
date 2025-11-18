#!/bin/bash

echo "🚀 Pushing to GitHub..."
echo ""

# Add all files
git add -A

# Commit
git commit -m "Initial commit: Timeless Organics Founding 100 launch site" || echo "Nothing to commit or already committed"

# Push
git push origin main || git push origin master

echo ""
echo "✅ Done! Check your repository at:"
echo "https://github.com/timelessorganics/Timeless-Organics-Fouding-100"
