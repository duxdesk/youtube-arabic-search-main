import json
import sys

file_path = 'ready_to_uppload_Arnest_videso.json'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        # Peek first 1KB to check format
        peek = f.read(1024)
        print("First 1KB preview:\n", repr(peek[:500]), "...")  # repr shows hidden chars
        
        # Reset and try full load
        f.seek(0)
        data = json.load(f)
        
        if isinstance(data, list):
            print(f"✅ Valid JSON array with {len(data)} items (videos).")
            # Sample first item
            if data:
                print("Sample video keys:", list(data[0].keys())[:5])
                print("Sample timestamps count:", len(data[0].get('timestamps', [])))
        else:
            print("❌ Not a JSON list—top-level is:", type(data))
            
except json.JSONDecodeError as e:
    print(f"❌ JSON Error: {e}")
    print("Likely cause: Empty file, invalid chars at start, or not JSON.")
except UnicodeDecodeError:
    print("❌ Encoding issue—try 'latin1' or check file type.")
except Exception as e:
    print(f"❌ Other error: {e}")
