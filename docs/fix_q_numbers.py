#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Q 编号修复和去重脚本 - 最终版
根据精确的规则删除重复题目并重编号
"""

import re
from pathlib import Path

BASE_DIR = Path('/Users/xilin/Desktop/fe-interview-quiz/docs')


def read_file(path: Path) -> str:
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def write_file(path: Path, content: str):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)


def parse_questions(content: str) -> list:
    """
    解析所有题目，返回 [(q_num, title, start_line, end_line, content), ...]
    """
    lines = content.split('\n')
    questions = []
    current_q = None
    current_lines = []
    start_line = 0
    
    for i, line in enumerate(lines):
        match = re.match(r'^(### )Q(\d+):(.*)$', line)
        if match:
            # 保存上一个
            if current_q is not None:
                title = match.group(3) if questions else current_lines[0].split(':', 1)[1] if current_lines else ''
                questions.append((current_q, current_lines[:], start_line, i))
            
            current_q = int(match.group(2))
            start_line = i
            current_lines = [line]
        elif current_q is not None:
            current_lines.append(line)
    
    # 最后一个
    if current_q is not None:
        questions.append((current_q, current_lines, start_line, len(lines)))
    
    return questions


def extract_title(q_line: str) -> str:
    """从 Q 行提取标题（用于比较重复）"""
    match = re.match(r'^### Q\d+:\s*(.+)$', q_line)
    if match:
        return match.group(1).strip()
    return ''


def normalize_title(title: str) -> str:
    """标准化标题用于比较"""
    t = title.lower()
    t = re.sub(r'[^\w\s\u4e00-\u9fff]', '', t)
    t = ' '.join(t.split())
    return t


def get_title_keyword(title: str) -> str:
    """提取标题关键词用于匹配"""
    # 提取核心关键词
    t = title.lower()
    # 去掉疑问词
    t = re.sub(r'^(什么是 | 如何 | 为什么 | 有哪些 | 怎么 | 区别|原理)', '', t)
    return t[:50]  # 取前 50 字符作为关键词


def fix_file(filepath: Path, duplicates_to_remove: dict):
    """
    修复文件中的重复题目
    duplicates_to_remove: {normalized_keyword: [q_nums_to_keep_first]}
    """
    if not filepath.exists():
        print(f"⚠️  文件不存在：{filepath}")
        return
    
    content = read_file(filepath)
    questions = parse_questions(content)
    
    print(f"\n📄 {filepath.name}")
    print(f"   原始题目数：{len(questions)}")
    
    # 构建标题到 Q 编号的映射
    title_map = {}
    for q_num, lines, start, end in questions:
        title_line = lines[0] if lines else ''
        title = extract_title(title_line)
        normalized = normalize_title(title)
        keyword = get_title_keyword(title)
        
        if keyword not in title_map:
            title_map[keyword] = []
        title_map[keyword].append((q_num, title, len(''.join(lines))))
    
    # 找出要删除的 Q 编号
    to_delete = set()
    
    for keyword, items in title_map.items():
        if len(items) > 1:
            # 有重复，保留内容最长的（通常是第一个）
            items_sorted = sorted(items, key=lambda x: x[2], reverse=True)
            # 保留第一个，删除其他
            for q_num, title, length in items_sorted[1:]:
                to_delete.add(q_num)
                print(f"   发现重复 Q{q_num}: '{title[:30]}...'")
    
    # 应用指定的删除规则
    for explicit_q in duplicates_to_remove.get(filepath.name, []):
        if explicit_q not in to_delete:
            to_delete.add(explicit_q)
    
    if not to_delete:
        print(f"   ✅ 无需删除")
        return
    
    print(f"   待删除 Q 编号：{sorted(to_delete)}")
    
    # 解析行范围
    q_ranges = []
    for q_num, lines, start, end in questions:
        if q_num in to_delete:
            q_ranges.append((start, end))
    
    # 从后往前删除，避免索引问题
    q_ranges.sort(key=lambda x: x[0], reverse=True)
    
    lines = content.split('\n')
    for start, end in q_ranges:
        del lines[start:end]
    
    content = '\n'.join(lines)
    
    # 重新编号
    content = renumber_questions(content)
    
    # 验证
    final_q_nums = [int(m.group(1)) for m in re.finditer(r'### Q(\d+):', content)]
    expected = list(range(1, len(final_q_nums) + 1))
    is_valid = final_q_nums == expected
    
    print(f"   修复后：{len(final_q_nums)} 题，连续：{'✅' if is_valid else '❌'}")
    
    write_file(filepath, content)
    
    return len(to_delete)


def renumber_questions(content: str) -> str:
    """重新编号 Q 使其连续"""
    lines = content.split('\n')
    result = []
    counter = 0
    
    for line in lines:
        match = re.match(r'^(### )Q(\d+):(.*)$', line)
        if match:
            counter += 1
            result.append(f'{match.group(1)}Q{counter}:{match.group(3)}')
        else:
            result.append(line)
    
    return '\n'.join(result)


def main():
    print("=" * 60)
    print("Q 编号修复和去重工具")
    print("=" * 60)
    
    # 根据任务描述定义的删除规则
    # 格式：{文件名：[要删除的 Q 编号]}
    files_config = {
        'xss-csrf.md': [10, 12, 13],  # Q10 重复 Q4, Q12 重复 Q9, Q13 出现两次
        'basics.md': [11, 14, 15, 16],  # git 的 Q11 重复 Q15, Q14 重复 Q4, Q15 重复 Q3, Q16 重复 Q8/9
        'vue-basics.md': [11, 12, 20, 21, 22, 23, 24, 25],  
        'principles.md': [5, 8, 11, 20],  # Q5 重复 Q12, Q8 重复 Q18, Q11/Q20 重复 Q3
        'open-questions.md': [12],  # Q12 重复 Q3
    }
    
    total_removed = 0
    
    # 1. security/xss-csrf.md
    total_removed += fix_file(
        BASE_DIR / 'security' / 'xss-csrf.md',
        {'xss-csrf.md': [10, 12, 13]}
    ) or 0
    
    # 2. git/basics.md - 需要检查实际的 Q 编号
    total_removed += fix_file(
        BASE_DIR / 'git' / 'basics.md',
        {'basics.md': [11, 14, 15, 16]}
    ) or 0
    
    # 3. framework/vue/vue-basics.md
    total_removed += fix_file(
        BASE_DIR / 'framework' / 'vue' / 'vue-basics.md',
        {'vue-basics.md': [11, 12, 20, 21, 22, 23, 24, 25]}
    ) or 0
    
    # 4. framework/react/principles.md
    total_removed += fix_file(
        BASE_DIR / 'framework' / 'react' / 'principles.md',
        {'principles.md': [5, 8, 11, 20]}
    ) or 0
    
    # 5. interview/open-questions.md
    total_removed += fix_file(
        BASE_DIR / 'interview' / 'open-questions.md',
        {'open-questions.md': [12]}
    ) or 0
    
    # 6. mini-program/basics.md
    total_removed += fix_file(
        BASE_DIR / 'mini-program' / 'basics.md',
        {'basics.md': [11, 17]}
    ) or 0
    
    # 7. network/tcp-ip.md - 只重编号
    renumber_only(BASE_DIR / 'network' / 'tcp-ip.md')
    
    # 8. other/graphql-electron.md - 只重编号
    renumber_only(BASE_DIR / 'other' / 'graphql-electron.md')
    
    print("\n" + "=" * 60)
    print(f"✅ 全部完成！共删除 {total_removed} 道重复题目")
    print("=" * 60)


def renumber_only(filepath: Path):
    """只重编号，不删除"""
    if not filepath.exists():
        return
    
    content = read_file(filepath)
    original_nums = [int(m.group(1)) for m in re.finditer(r'### Q(\d+):', content)]
    
    if not original_nums:
        return
    
    # 检查是否需要重编号
    expected = list(range(1, len(original_nums) + 1))
    if original_nums == expected:
        print(f"\n📄 {filepath.name}: 编号已连续，跳过")
        return
    
    print(f"\n📄 {filepath.name}: 重编号 {original_nums} → 1-{len(original_nums)}")
    
    content = renumber_questions(content)
    write_file(filepath, content)
    
    # 验证
    final = [int(m.group(1)) for m in re.finditer(r'### Q(\d+):', content)]
    print(f"   ✅ 新编号：{final[:5]}{'...' if len(final) > 5 else ''}")


if __name__ == '__main__':
    main()