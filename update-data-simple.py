"""
Update data file: keep 2024 data, replace 2025 data
Simple version
"""
import json

# Read original file
with open('js/data-bundle-mixed-v2.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Read new 2025 data
with open('2025-generated.json', 'r', encoding='utf-8') as f:
    data_2025 = json.load(f)

# Find where 2025 data starts (in the months array)
in_months = False
months_start_line = 0
for i, line in enumerate(lines):
    if 'months: [' in line:
        in_months = True
        months_start_line = i
        break

# Find 2025-01 line
for i, line in enumerate(lines):
    if '"date": "2025-01"' in line:
        # Lines from months_start to i-1 contain 2024 data
        # We want to keep these
        header = lines[:i]
        # Find the tail (after 2025-12 data)
        for j in range(i, len(lines)):
            if '];' in lines[j] and '}' in lines[j+1] if j+1 < len(lines) else False:
                tail = lines[j+1:]
                # Build new file
                new_lines = header + tail
                with open('js/data-bundle-mixed-v2.js', 'w', encoding='utf-8') as f:
                    f.writelines(new_lines)
                print("File structure updated")
                break
        break

# Now manually append the months data
# Actually, let's just rewrite the whole file
# Keep header up to 'months: ['
with open('js/data-bundle-mixed-v2.js', 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('months: [')
header = content[:idx+9]

# Find tail
tail_idx = content.find(']\\n};')
tail = content[tail_idx+4:]

# Load original 2024 data
import re
match = re.search(r'months:\s*\[(.*?)\]\\n};', content, re.DOTALL)
if match:
    original_months = json.loads('[' + match.group(1) + ']')
    data_2024 = [m for m in original_months if m['date'].startswith('2024')]
else:
    print("Could not parse original data")
    exit(1)

# Combine
all_months = data_2024 + data_2025

# Format
months_json = json.dumps(all_months, indent=2, ensure_ascii=False)
lines = months_json.split('\n')
formatted = '\n'.join('  ' + line for line in lines[1:-1])

# Write
with open('js/data-bundle-mixed-v2.js', 'w', encoding='utf-8') as f:
    f.write(header + '\n')
    f.write(formatted + '\n')
    f.write(tail)

print("OK - File updated!")
print(f"Total: {len(all_months)} months")
print(f"2024: {len(data_2024)} months")
print(f"2025: {len(data_2025)} months")
