#!/usr/bin/env python3
"""
Convert CSV files to JSON format for the YouTube Arabic Search app
"""

import csv
import json
import sys
from pathlib import Path

def convert_youtubers_csv_to_json(csv_file, output_file):
    """Convert YouTubers CSV to JSON format"""
    youtubers = []
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            youtuber = {
                "arabic_name": row.get('arabic_name', ''),
                "english_name": row.get('english_name', ''),
                "description": row.get('description', ''),
                "channel_url": row.get('channel_url', ''),
                "avatar_url": row.get('avatar_url', ''),
                "subscriber_count": row.get('subscriber_count', '0'),
                "category": row.get('category', ''),
            }
            # Only add if has both names
            if youtuber['arabic_name'] and youtuber['english_name']:
                youtubers.append(youtuber)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(youtubers, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Converted {len(youtubers)} YouTubers to {output_file}")
    return youtubers

def convert_transcripts_csv_to_json(csv_file, output_file, youtuber_id_map):
    """Convert Transcripts CSV to JSON format"""
    transcripts = []
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Try to find youtuber_id from the map
            youtuber_id = row.get('youtuber_id', '')
            
            # Parse timestamps if they exist
            timestamps = []
            transcript_text = row.get('transcript', '')
            
            # If transcript has timestamp format, try to parse it
            # Otherwise, create a single timestamp entry
            if transcript_text:
                timestamps.append({
                    "start_time": 0,
                    "end_time": 0,
                    "text": transcript_text
                })
            
            transcript = {
                "youtuber_id": youtuber_id,
                "video_title": row.get('video_title', ''),
                "video_id": row.get('video_id', ''),
                "video_url": row.get('video_url', ''),
                "publish_date": row.get('publish_date', ''),
                "duration": row.get('duration', ''),
                "timestamps": timestamps
            }
            
            if transcript['youtuber_id'] and transcript['video_id']:
                transcripts.append(transcript)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(transcripts, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Converted {len(transcripts)} Transcripts to {output_file}")
    return transcripts

def main():
    print("🔄 CSV to JSON Converter for YouTube Arabic Search")
    print("=" * 50)
    
    # Check if files exist
    youtuber_csv = Path("YouTuber.csv")
    transcript_csv = Path("Transcript.csv")
    
    if not youtuber_csv.exists():
        print(f"❌ Error: {youtuber_csv} not found!")
        sys.exit(1)
    
    # Convert YouTubers
    print("\n📋 Converting YouTubers...")
    youtubers = convert_youtubers_csv_to_json(
        youtuber_csv,
        "src/data/youtubers.json"
    )
    
    # Create a map of youtuber names to IDs for transcript conversion
    # Note: Since we're generating new IDs, you'll need to manually update
    # the youtuber_id in transcripts after importing youtubers first
    print("\n⚠️  IMPORTANT: After importing YouTubers to the app:")
    print("   1. Go to /dashboard")
    print("   2. Click 'إظهار' under 'قائمة معرفات اليوتيوبرز'")
    print("   3. Copy each YouTuber's ID")
    print("   4. Update the youtuber_id in your transcripts JSON file")
    
    # Convert Transcripts if exists
    if transcript_csv.exists():
        print("\n📝 Converting Transcripts...")
        print("⚠️  Note: You'll need to update youtuber_id values manually!")
        transcripts = convert_transcripts_csv_to_json(
            transcript_csv,
            "src/data/transcripts.json",
            {}
        )
    else:
        print(f"\n⚠️  {transcript_csv} not found, skipping transcripts conversion")
    
    print("\n✅ Conversion complete!")
    print("\n📌 Next steps:")
    print("   1. Start your app: npm run dev")
    print("   2. Go to http://localhost:8080/dashboard")
    print("   3. Upload the generated JSON files")
    print("   4. For transcripts, make sure to use the correct youtuber_id!")

if __name__ == "__main__":
    main()
