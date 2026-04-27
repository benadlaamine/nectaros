import re
import json

# Load translations
with open('/home/ubuntu/arabic_translations.json', 'r', encoding='utf-8') as f:
    translations = json.load(f)

# Read the HTML file
with open('/home/ubuntu/upload/index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Create a reverse mapping: Arabic text -> translation key
text_to_key = {v: k for k, v in translations.items()}

# Sort by length (longest first) to avoid partial replacements
sorted_texts = sorted(text_to_key.keys(), key=len, reverse=True)

# Counter for replacements
replacements_count = 0

# Process each Arabic text
for arabic_text in sorted_texts:
    key = text_to_key[arabic_text]
    
    # Create patterns to match the Arabic text in various HTML contexts
    # Pattern 1: Text in tags like <span>text</span>
    pattern1 = r'(>)(' + re.escape(arabic_text) + r')(<)'
    replacement1 = r'\1<span data-i18n="' + key + r'">\2</span>\3'
    
    # Pattern 2: Text in attributes (like placeholder, title, etc.)
    # This is more complex and needs to be handled carefully
    
    # Pattern 3: Text as direct content in tags
    pattern3 = r'(>[^<]*?)(' + re.escape(arabic_text) + r')([^<]*?<)'
    replacement3 = r'\1<span data-i18n="' + key + r'">\2</span>\3'
    
    # Apply replacements
    new_content = re.sub(pattern1, replacement1, html_content)
    if new_content != html_content:
        replacements_count += 1
        html_content = new_content

# Save the modified HTML
with open('/home/ubuntu/upload/index_updated.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"Processed {replacements_count} Arabic texts")
