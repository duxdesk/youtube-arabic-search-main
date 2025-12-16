#!/bin/bash
cd ~/Desktop/myapp/youtube-arabic-search-main
git pull origin main
npm install
npm run build
pm2 restart youtube-app
echo "Deploy complete at $(date)"

