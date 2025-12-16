# 🚀 Quick Start Guide

## Get Started in 3 Steps!

### Step 1: Start the App
'''cd  /home/saad/Desktop/myapp/youtube-arabic-search-main'''
```bash
npm run dev
```

The app will open at `http://localhost:8080`

### Step 2: Add Sample Data (Optional)

To test the app with sample data:

```bash
# Create sample data files
python3 create_sample_data.py

# This creates:
# - sample_youtubers.json
# - sample_transcripts.json
```

### Step 3: Import Data

1. Open `http://localhost:8080/dashboard`
2. Click on "اليوتيوبرز" tab
3. Upload `sample_youtubers.json`
4. Click "إظهار" to see YouTuber IDs
5. Copy an ID and update `sample_transcripts.json`
6. Switch to "النصوص" tab
7. Upload `sample_transcripts.json`

## 🎉 Done!

Now you can:
- Browse YouTubers at `/`
- Search transcripts at `/search/:youtuberId`
- Manage data at `/dashboard`

## 📝 Using Your Own Data

### Option 1: Convert Existing CSV
```bash
python3 convert_csv_to_json.py
```

### Option 2: Create JSON Manually

See `LOCAL_STORAGE_GUIDE.md` for JSON format examples.

### Option 3: Use the Dashboard

Add YouTubers manually through the web interface.

## 🔍 Search Features

- **Full-text search** in video transcripts
- **Timestamp navigation** - Click on results to jump to that moment
- **Saved searches** - Save frequently used search terms
- **Fast client-side search** - No server needed!

## 📚 More Help

- `LOCAL_STORAGE_GUIDE.md` - Detailed usage guide
- `MIGRATION_SUMMARY.md` - What changed from Supabase
- `README.md` - Original project documentation

## ⚡ Tips

1. **Backup your data** regularly using the export function
2. **Use meaningful YouTuber names** for easy searching
3. **Include timestamps** in transcripts for better navigation
4. **Save common searches** to quickly re-run them

Enjoy your YouTube Arabic Search app! 🎊
