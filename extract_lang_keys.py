import re
import json

def extract_arabic_translations(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the 'ar' object within NECTAR_LANGS
    ar_match = re.search(r'ar:\s*{\n([^}]+?)\n\s*},', content, re.DOTALL)
    if not ar_match:
        return {}

    ar_content = ar_match.group(1)
    translations = {}

    # Extract key-value pairs. The regex now correctly handles escaped single quotes within the value.
    # It matches a key, then ':', then a single quote, then captures the value, then a closing single quote.
    # The value capture group `((?:[^\\']|\\.)*)` means: match any character that is not a single quote or a backslash, OR a backslash followed by any character.
    for match in re.finditer(r"^\s*([a-zA-Z0-9_]+):\s*'((?:[^\\']|\\.)*)'(?:,|$)", ar_content, re.MULTILINE):
        key = match.group(1)
        value = match.group(2)
        # Unescape common JavaScript escapes for newlines and quotes
        value = value.replace('\\n', '\n').replace("\\\'", "'") # Corrected this line
        translations[key] = value
        
    # Handle _dir, _name, _flag separately as they are not simple key-value pairs
    dir_match = re.search(r"_dir:'(.*?)'", ar_content)
    if dir_match: translations['_dir'] = dir_match.group(1)
    name_match = re.search(r"_name:'(.*?)'", ar_content)
    if name_match: translations['_name'] = name_match.group(1)
    flag_match = re.search(r"_flag:'(.*?)'", ar_content)
    if flag_match: translations['_flag'] = flag_match.group(1)

    return translations

if __name__ == '__main__':
    translations = extract_arabic_translations('/home/ubuntu/upload/lang.js')
    with open('/home/ubuntu/arabic_translations.json', 'w', encoding='utf-8') as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)
    print("Arabic translations extracted to arabic_translations.json")
