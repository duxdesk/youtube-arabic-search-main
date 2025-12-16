import json
import pandas as pd
from typing import List, Dict, Any

class JSONToCSVConverter:
    """
    A class to read a JSON file containing a list of video objects with nested timestamps
    and convert it to a flattened CSV file where each row represents a timestamp with repeated video metadata.
    
    JSON Structure Example:
    [
      {
        "youtuber_id": "paste_youtuber_id_here",
        "video_title": "عنوان الفيديو",
        "video_url": "https://youtube.com/watch?v=VIDEO_ID",
        "video_id": "VIDEO_ID",
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
    
    Usage:
    converter = JSONToCSVConverter('input.json')
    data = converter.read()
    converter.write('output.csv')
    """
    
    def __init__(self, input_file: str):
        """
        Initialize with the input JSON file path.
        
        Args:
            input_file (str): Path to the input JSON file.
        """
        self.input_file = input_file
        self.data: List[Dict[str, Any]] = None
    
    def read(self) -> List[Dict[str, Any]]:
        """
        Read the input JSON file into a list of dictionaries.
        
        Returns:
            List[Dict[str, Any]]: The loaded list of video objects.
        
        Raises:
            ValueError: If the file is not a valid JSON list.
        """
        with open(self.input_file, 'r', encoding='utf-8') as f:
            self.data = json.load(f)
        
        if not isinstance(self.data, list):
            raise ValueError("The JSON file must contain a list of video objects.")
        
        return self.data
    
    def write(self, output_file: str = 'output.csv') -> None:
        """
        Flatten the loaded data (video metadata repeated for each timestamp) and write to CSV.
        
        Args:
            output_file (str): Path for the output CSV file. Default is 'output.csv'.
        
        Raises:
            ValueError: If data is not loaded.
        """
        if self.data is None:
            raise ValueError("Please call read() first to load the data.")
        
        flattened_rows = []
        for video in self.data:
            video_base = {
                'youtuber_id': video.get('youtuber_id', ''),
                'video_title': video.get('video_title', ''),
                'video_url': video.get('video_url', ''),
                'video_id': video.get('video_id', ''),
                'publish_date': video.get('publish_date', ''),
                'duration': video.get('duration', '')
            }
            
            timestamps = video.get('timestamps', [])
            if not timestamps:
                # If no timestamps, add a row with empty timestamp fields
                flattened_rows.append({**video_base, 'start_time': '', 'end_time': '', 'text': ''})
            else:
                for ts in timestamps:
                    row = {
                        **video_base,
                        'start_time': ts.get('start_time', ''),
                        'end_time': ts.get('end_time', ''),
                        'text': ts.get('text', '')
                    }
                    flattened_rows.append(row)
        
        if flattened_rows:
            df = pd.DataFrame(flattened_rows)
            df.to_csv(output_file, index=False, encoding='utf-8')
            print(f"Successfully wrote {len(flattened_rows)} rows to {output_file}")
        else:
            print("No data to write.")
# Assuming you have a file 'input.json' with the described structure
converter = JSONToCSVConverter('/home/saad/Desktop/search_trans_app/transcripts/ready_to_upload/Arnest William/ready_to_uppload_Arnest_lives.json')
data = converter.read()  # Loads the list of dicts
converter.write('videos_with_timestamps.csv')  # Outputs a flattened CSV