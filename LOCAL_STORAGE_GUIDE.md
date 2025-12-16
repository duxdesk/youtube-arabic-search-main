# YouTube Arabic Search - Local Storage Guide

## 🎉 Your app now uses LOCAL STORAGE!

All data is stored locally in your browser using **localStorage** and **JSON files**. No external databases needed!

## 📁 Data Storage

Your data is stored in three places:

1. **Browser localStorage** - For runtime data persistence
2. **JSON files** - Initial data templates in `src/data/`
   - `youtubers.json` - List of YouTubers
   - `transcripts.json` - Video transcripts
   - `saved-searches.json` - Saved searches

## 🚀 How to Add Data

### Option 1: Upload JSON Files (Dashboard)

1. Go to `/dashboard`
2. Choose between "اليوتيوبرز" or "النصوص" tabs
3. Click "تحميل نموذج JSON" to download a sample file
4. Fill in your data following the sample format
5. Upload the JSON file

### Option 2: Manual Entry (Dashboard)

1. Go to `/dashboard`
2. Switch to "اليوتيوبرز" tab
3. Fill in the form and click "إضافة يوتيوبر"

## 📋 JSON Format Examples

### YouTubers JSON Format:
```json
[
  {
    "arabic_name": "أحمد سعد زايد",
    "english_name": "Ahmed Saad Zayed",
    "description": "قناة معنية بالتنوير الفكري",
    "channel_url": "https://www.youtube.com/@ahmedsaadzayed",
    "avatar_url": "https://yt3.googleusercontent.com/...",
    "subscriber_count": "1.5M",
    "category": "تعليم"
  }
]
```

### Transcripts JSON Format:
```json
[
  {
    "youtuber_id": "COPY_ID_FROM_DASHBOARD",
    "video_title": "عنوان الفيديو",
    "video_id": "VIDEO_ID",
    "video_url": "https://youtube.com/watch?v=VIDEO_ID",
    "publish_date": "2024-01-15",
    "duration": "15:30",
    "timestamps": [
      {
        "start_time": 0,
        "end_time": 45,
        "text": "النص الأول هنا"
      },
      {
        "start_time": 45,
        "end_time": 120,
        "text": "النص الثاني هنا"
      }
    ]
  }
]
```

## ⚠️ Important Notes

1. **YouTuber IDs**: When adding transcripts, you MUST use the YouTuber's ID (not their name). You can find IDs in the Dashboard under "قائمة معرفات اليوتيوبرز".

2. **Data Persistence**: All data is stored in your browser's localStorage. If you clear your browser data, you'll lose everything!

3. **Export/Backup**: You can export all your data from the browser console:
   ```javascript
   // In browser console
   import { exportData } from '@/lib/local-storage';
   exportData();
   ```

4. **Import Data**: To import a backup:
   ```javascript
   // In browser console
   import { importData } from '@/lib/local-storage';
   // Paste your JSON data as a string
   importData('{"youtubers": [...], "transcripts": [...]}');
   ```

## 🔄 Converting Your Existing CSV Data

If you have existing CSV files, you can convert them to JSON:

### For YouTubers CSV:
```bash
# Use an online CSV to JSON converter or write a simple script
# Make sure the JSON has these fields:
# - arabic_name
# - english_name
# - avatar_url
# - subscriber_count
# - category
# - description (optional)
# - channel_url (optional)
```

### For Transcripts CSV:
```bash
# Convert your CSV to JSON with these fields:
# - youtuber_id (REQUIRED - get from Dashboard)
# - video_title
# - video_id
# - video_url (optional)
# - publish_date (optional)
# - duration (optional)
# - timestamps (array of {start_time, end_time, text})
```

## 🎯 Features

- ✅ No authentication required
- ✅ No external database needed
- ✅ Works completely offline
- ✅ Fast local search
- ✅ All data stays in your browser
- ✅ Easy JSON import/export

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📝 Notes

- The app automatically saves to localStorage when you add data
- Search is performed client-side for instant results
- All timestamps are preserved for video navigation
- Saved searches are stored per YouTuber

Enjoy your local YouTube Arabic Search app! 🎉
