"""
更新数据文件：保留2024年数据，替换2025年数据
"""
import json
import re

# 读取原始文件
with open('js/data-bundle-mixed-v2.js', 'r', encoding='utf-8') as f:
    original_content = f.read()

# 读取新生成的2025年数据
with open('2025-generated.json', 'r', encoding='utf-8') as f:
    data_2025 = json.load(f)

# 提取原始数据（使用正则表达式匹配）
match = re.search(r'const ARENA_DATA = \{.*?months:\s*\[(.*?)\]\s*\};', original_content, re.DOTALL)
if not match:
    print("无法找到原始数据")
    exit(1)

# 解析原始的months数组
original_months_json = '[' + match.group(1) + ']'
original_months = json.loads(original_months_json)

# 提取2024年数据
data_2024 = [m for m in original_months if m['date'].startswith('2024')]

# 合并数据
all_months = data_2024 + data_2025

# 构建新的文件内容
# 提取头部（到months: [之前）
header_end = original_content.find('months: [')
header = original_content[:header_end + 9]  # 包含"months: ["

# 提取尾部（从];}开始）
tail_start = original_content.find('];}\\n\\nif (typeof module')
tail = original_content[tail_start:]

# 构建中间数据部分
months_json = json.dumps(all_months, indent=2, ensure_ascii=False)

# 格式化：每一行前面加2个空格
lines = months_json.split('\n')
formatted_months = '\n'.join('  ' + line for line in lines[1:-1])  # 跳过第一行[和最后一行]

# 组合完整内容
new_content = header + '\n' + formatted_months + '\n' + tail

# 写入文件
with open('js/data-bundle-mixed-v2.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("OK - Data file updated successfully!")
print(f"Total months: {len(all_months)}")
print(f"2024: {len(data_2024)} months")
print(f"2025: {len(data_2025)} months")
