#!/usr/bin/env python3
"""
Create sample data for testing the YouTube Arabic Search app
"""

import json
from datetime import datetime, timedelta
import random

def create_sample_youtubers():
    """Create sample YouTubers data"""
    youtubers = [
        {
            "arabic_name": "أحمد سعد زايد",
            "english_name": "Ahmed Saad Zayed",
            "description": "قناة معنية بالتنوير الفكري والثقافي",
            "channel_url": "https://www.youtube.com/@ahmedsaadzayed",
            "avatar_url": "https://via.placeholder.com/150/FF6B6B/FFFFFF?text=أحمد",
            "subscriber_count": "500K",
            "category": "تعليم"
        },
        {
            "arabic_name": "خزعل الماجدي",
            "english_name": "Khazal Al-Majidi",
            "description": "باحث في التاريخ والأديان",
            "channel_url": "https://www.youtube.com/@khazalalmajidi",
            "avatar_url": "https://via.placeholder.com/150/4ECDC4/FFFFFF?text=خزعل",
            "subscriber_count": "300K",
            "category": "تاريخ"
        },
        {
            "arabic_name": "رشيد ايلال",
            "english_name": "Rachid Aylal",
            "description": "قناة الفكر الحر",
            "channel_url": "https://www.youtube.com/@aylalrachid",
            "avatar_url": "https://via.placeholder.com/150/45B7D1/FFFFFF?text=رشيد",
            "subscriber_count": "200K",
            "category": "فكر"
        },
        {
            "arabic_name": "إبراهيم عيسى",
            "english_name": "Ibrahim Eissa",
            "description": "كاتب وصحفي ومقدم برامج",
            "channel_url": "https://www.youtube.com/@ibrahimeissa",
            "avatar_url": "https://via.placeholder.com/150/96CEB4/FFFFFF?text=إبراهيم",
            "subscriber_count": "1M",
            "category": "إعلام"
        }
    ]
    
    with open("sample_youtubers.json", "w", encoding="utf-8") as f:
        json.dump(youtubers, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Created sample_youtubers.json with {len(youtubers)} YouTubers")
    return youtubers

def create_sample_transcripts():
    """Create sample transcripts data"""
    
    # Note: These are placeholder IDs - you'll need to replace them
    # with actual IDs after importing YouTubers
    sample_topics = [
        {
            "title": "الفلسفة الإسلامية في العصر الذهبي",
            "keywords": ["الفلسفة", "الإسلام", "العصر الذهبي", "ابن رشد", "الفارابي"],
            "texts": [
                "في هذا الفيديو نتحدث عن الفلسفة الإسلامية",
                "العصر الذهبي شهد ازدهاراً كبيراً في الفكر الفلسفي",
                "ابن رشد والفارابي كانا من أبرز الفلاسفة المسلمين",
                "الفلسفة الإسلامية أثرت بشكل كبير على الفكر الأوروبي"
            ]
        },
        {
            "title": "تاريخ الحضارات القديمة",
            "keywords": ["تاريخ", "حضارة", "سومر", "بابل", "مصر"],
            "texts": [
                "الحضارات القديمة في بلاد الرافدين",
                "سومر وبابل كانتا من أقدم الحضارات",
                "الكتابة المسمارية اختراع سومري عظيم",
                "الحضارة المصرية القديمة وأسرارها"
            ]
        },
        {
            "title": "الفكر النقدي والتفكير العلمي",
            "keywords": ["فكر", "نقد", "علم", "منهج", "عقل"],
            "texts": [
                "أهمية التفكير النقدي في حياتنا",
                "المنهج العلمي في البحث والتحليل",
                "كيف نميز بين الحقيقة والوهم",
                "العقل والنقل في التراث الإسلامي"
            ]
        }
    ]
    
    transcripts = []
    base_date = datetime.now() - timedelta(days=365)
    
    for i, topic in enumerate(sample_topics):
        # Create timestamps from the texts
        timestamps = []
        current_time = 0
        
        for text in topic["texts"]:
            duration = random.randint(30, 90)  # 30-90 seconds per segment
            timestamps.append({
                "start_time": current_time,
                "end_time": current_time + duration,
                "text": text
            })
            current_time += duration
        
        transcript = {
            "youtuber_id": "REPLACE_WITH_ACTUAL_ID",  # User needs to replace this
            "video_title": topic["title"],
            "video_id": f"VIDEO_{i+1:03d}",
            "video_url": f"https://youtube.com/watch?v=VIDEO_{i+1:03d}",
            "publish_date": (base_date + timedelta(days=i*30)).strftime("%Y-%m-%d"),
            "duration": f"{current_time // 60}:{current_time % 60:02d}",
            "timestamps": timestamps
        }
        transcripts.append(transcript)
    
    with open("sample_transcripts.json", "w", encoding="utf-8") as f:
        json.dump(transcripts, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Created sample_transcripts.json with {len(transcripts)} transcripts")
    print("\n⚠️  IMPORTANT: Replace 'REPLACE_WITH_ACTUAL_ID' with real YouTuber IDs!")
    print("   1. Import YouTubers first")
    print("   2. Get IDs from Dashboard")
    print("   3. Update the youtuber_id in sample_transcripts.json")
    
    return transcripts

def main():
    print("🎨 Creating Sample Data for YouTube Arabic Search")
    print("=" * 50)
    
    print("\n📋 Creating sample YouTubers...")
    create_sample_youtubers()
    
    print("\n📝 Creating sample transcripts...")
    create_sample_transcripts()
    
    print("\n✅ Sample data created successfully!")
    print("\n📌 Next steps:")
    print("   1. Go to http://localhost:8080/dashboard")
    print("   2. Upload sample_youtubers.json first")
    print("   3. Copy the YouTuber IDs from the Dashboard")
    print("   4. Edit sample_transcripts.json and replace 'REPLACE_WITH_ACTUAL_ID'")
    print("   5. Upload sample_transcripts.json")
    print("\n🎉 Then you can test the search functionality!")

if __name__ == "__main__":
    main()
