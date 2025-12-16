import json
import os

file_path = 'ready_to_uppload_Arnest_videso.json'

print(f"File size: {os.path.getsize(file_path)} bytes")
print(f"Line count: {sum(1 for _ in open(file_path))}")

# Hex peek (first 32 bytes)
with open(file_path, 'rb') as f:
    first_bytes = f.read(32)
    print(f"First 32 bytes (hex): {first_bytes.hex()}")
    print(f"First 32 bytes (decoded repr): {repr(first_bytes.decode('utf-8', errors='replace'))}")

# Text peek
with open(file_path, 'r', encoding='utf-8') as f:
    peek = f.read(500)
    print(f"\nText peek (first 500 chars repr): {repr(peek[:200])}...")

# Safe JSON load
try:
    with open(file_path, 'r', encoding='utf-8-sig') as f:  # -sig strips BOM if present
        data = json.load(f)
    if isinstance(data, list):
        print(f"\n✅ SUCCESS: Valid JSON array with {len(data)} videos.")
        print(f"Sample keys from first video: {list(data[0].keys())[:6]}")
        print(f"Timestamps in first video: {len(data[0].get('timestamps', []))}")
    else:
        print(f"\n❌ Loaded but not list: {type(data)}")
except json.JSONDecodeError as e:
    print(f"\n❌ JSON Error: {e}")
    print(f"Error position: line {e.lineno}, col {e.colno}")
except UnicodeDecodeError as e:
    print(f"\n❌ Encoding Error: {e}")
except FileNotFoundError:
    print(f"\n❌ File not found: {file_path}")
