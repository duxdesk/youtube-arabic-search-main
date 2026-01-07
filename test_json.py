import json
import os

def test_json_file(file_path):
    """
    Tests if a JSON file exists and is syntactically valid.
    """
    # 1. Check if the file exists
    if not os.path.exists(file_path):
        return False, f"Error: The file '{file_path}' does not exist."

    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            # 2. Try to parse the JSON
            data = json.load(file)
            return True, "Success: File is valid JSON."
            
    except json.JSONDecodeError as e:
        # 3. Handle syntax errors (missing commas, unclosed braces, etc.)
        return False, f"Invalid JSON syntax: {e.msg} at line {e.lineno}, column {e.colno}"
    
    except Exception as e:
        # 4. Handle other potential issues (e.g., permission errors)
        return False, f"An unexpected error occurred: {str(e)}"

# Example Usage:
path="/home/saad/Desktop/transcripts_process/transcripts/ready_to_upload/Arnest William/ready_to_uppload_Arnest_lives.json"
is_ok, message = test_json_file(path)
print(message)
