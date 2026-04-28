import re

# Read the updated HTML file
with open('/home/ubuntu/upload/index_updated.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# Find the position to insert the i18n script
# We'll insert it after the lang.js script
pattern = r'(<script src="\.\/lang\.js"><\/script>)'
replacement = r'\1\n<script src="./i18n.js"></script>'

html_content = re.sub(pattern, replacement, html_content)

# Save the modified HTML
with open('/home/ubuntu/upload/index_updated.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("i18n script added to index_updated.html")
