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

def parse_time_to_seconds(time_str):
    """Convert time string (HH:MM:SS or MM:SS) to total seconds"""
    if not time_str or not isinstance(time_str, str):
        try:
            return float(time_str or 0)
        except:
            return 0
            
    parts = time_str.split(':')
    try:
        if len(parts) == 3: # HH:MM:SS
            return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
        elif len(parts) == 2: # MM:SS
            return int(parts[0]) * 60 + int(parts[1])
        else:
            return float(time_str)
    except:
        return 0

def convert_transcripts_csv_to_json(csv_file, output_file, youtuber_id_map):
    """Convert Transcripts CSV to JSON format with support for multiple rows per video"""
    video_map = {} # Using a map to group multiple rows by video_id
    
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            video_id = row.get('video_id', '')
            if not video_id:
                continue
                
            # Try to find youtuber_id
            youtuber_id = row.get('youtuber_id', '')
            
            # Get text and timestamp - check multiple common column names
            text = row.get('text', row.get('transcript', row.get('content', '')))
            start_time_str = row.get('start_time', row.get('start', row.get('timestamp', row.get('time', '0'))))
            end_time_str = row.get('end_time', row.get('end', '0'))
            
            start_time = parse_time_to_seconds(start_time_str)
            end_time = parse_time_to_seconds(end_time_str)
            
            # Initialize video entry if not exists
            if video_id not in video_map:
                video_map[video_id] = {
                    "youtuber_id": youtuber_id,
                    "video_title": row.get('video_title', ''),
                    "video_id": video_id,
                    "video_url": row.get('video_url', f"https://youtube.com/watch?v={video_id}"),
                    "publish_date": row.get('publish_date', ''),
                    "duration": row.get('duration', ''),
                    "timestamps": []
                }
            
            # Add timestamp segment
            if text:
                video_map[video_id]["timestamps"].append({
                    "start_time": start_time,
                    "end_time": end_time,
                    "text": text
                })
    
    # Sort timestamps for each video and create final list
    transcripts = []
    for video_id in video_map:
        video = video_map[video_id]
        # Sort by start_time
        video["timestamps"].sort(key=lambda x: x["start_time"])
        
        # Only add if we have at least one valid youtuber_id and video_id
        if video['youtuber_id']:
            transcripts.append(video)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(transcripts, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Converted {len(transcripts)} videos (from multiple rows) to {output_file}")
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
