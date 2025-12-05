
import os

file_path = 'content/resources/bibliography.bib'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# U+200E is the Left-to-Right Mark
sanitized_content = content.replace('\u200e', '')

if content != sanitized_content:
    print(f"Found and removed U+200E characters in {file_path}")
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(sanitized_content)
else:
    print(f"No U+200E characters found in {file_path}")
