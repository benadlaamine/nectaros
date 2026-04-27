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
    
    # Escape special regex characters in the Arabic text
    escaped_text = re.escape(arabic_text)
    
    # Pattern to match Arabic text inside HTML tags
    # This pattern looks for >...text...< but avoids replacing text that's already wrapped in data-i18n
    pattern = r'(>)([^<]*?)' + escaped_text + r'([^<]*?<)'
    
    def replacement_func(match):
        before = match.group(1)
        prefix = match.group(2)
        suffix = match.group(3)
        
        # Check if already has data-i18n
        if 'data-i18n' in prefix or 'data-i18n' in suffix:
            return match.group(0)
        
        # If prefix or suffix is not empty, wrap only the Arabic text
        if prefix or suffix:
            return before + prefix + '<span data-i18n="' + key + '">' + arabic_text + '</span>' + suffix
        else:
            return before + '<span data-i18n="' + key + '">' + arabic_text + '</span><'
    
    html_content = re.sub(pattern, replacement_func, html_content)
    replacements_count += 1

# Save the modified HTML
with open('/home/ubuntu/upload/index_updated.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"Processed {replacements_count} Arabic translation keys")
