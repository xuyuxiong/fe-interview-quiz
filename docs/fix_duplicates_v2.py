#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Q 编号修复和去重脚本 - 精确匹配版
根据具体规则删除重复题目并重编号
"""

import re
import os
from pathlib import Path

# 项目根目录
BASE_DIR = Path('/Users/xilin/Desktop/fe-interview-quiz/docs')


def read_file(path: Path) -> str:
    """读取文件内容"""
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


def write_file(path: Path, content: str):
    """写入文件内容"""
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)


def get_question_blocks(content: str) -> dict:
    """
    按 Q 编号分割内容
    返回：{Q 编号：(完整内容块，起始行号)}
    """
    lines = content.split('\n')
    blocks = {}
    current_q = None
    current_lines = []
    start_line = 0
    
    for i, line in enumerate(lines):
        match = re.match(r'^(### )Q(\d+):', line)
        if match:
            # 保存上一个块
            if current_q is not None:
                blocks[current_q] = ('\n'.join(current_lines), start_line)
            
            # 开始新块
            current_q = int(match.group(2))
            start_line = i
            current_lines = [line]
        elif current_q is not None:
            current_lines.append(line)
    
    # 保存最后一个块
    if current_q is not None:
        blocks[current_q] = ('\n'.join(current_lines), start_line)
    
    return blocks


def remove_questions(content: str, q_nums_to_remove: set) -> str:
    """
    删除指定的 Q 编号题目
    """
    blocks = get_question_blocks(content)
    lines = content.split('\n')
    
    # 找出每个要删除的 Q 的行范围
    remove_ranges = []
    sorted_q_nums = sorted(q_nums_to_remove, reverse=True)
    
    for q_num in sorted_q_nums:
        if q_num in blocks:
            _, start_line = blocks[q_num]
            # 找到下一个 Q 的开始或文件末尾
            end_line = len(lines)
            for next_q in range(q_num + 1, max(blocks.keys()) + 2):
                if next_q in blocks:
                    _, next_start = blocks[next_q]
                    end_line = next_start
                    break
            remove_ranges.append((start_line, end_line))
    
    # 从后往前删除，避免索引偏移
    remove_ranges.sort(key=lambda x: x[0], reverse=True)
    
    for start, end in remove_ranges:
        del lines[start:end]
    
    return '\n'.join(lines)


def renumber_content(content: str) -> str:
    """
    重新编号 Q，使其连续
    """
    lines = content.split('\n')
    result_lines = []
    q_counter = 0
    
    for line in lines:
        match = re.match(r'^(### )Q(\d+):(.*)$', line)
        if match:
            q_counter += 1
            prefix = match.group(1)
            rest = match.group(3)
            new_line = f'{prefix}Q{q_counter}:{rest}'
            result_lines.append(new_line)
        else:
            result_lines.append(line)
    
    return '\n'.join(result_lines)


def fix_file(file_path: Path, q_to_remove: list) -> dict:
    """
    处理单个文件
    """
    if not file_path.exists():
        return {'error': f'文件不存在：{file_path}'}
    
    content = read_file(file_path)
    
    # 提取所有 Q 编号
    all_q_nums = set(int(m.group(1)) for m in re.finditer(r'### Q(\d+):', content))
    original_count = len(all_q_nums)
    
    print(f"\n📄 {file_path.name}")
    print(f"   现有 Q 编号：{sorted(all_q_nums)}")
    print(f"   准备删除：{q_to_remove}")
    
    # 删除指定的 Q
    content = remove_questions(content, set(q_to_remove))
    
    # 重新编号
    content = renumber_content(content)
    
    # 验证结果
    final_q_nums = [int(m.group(1)) for m in re.finditer(r'### Q(\d+):', content)]
    final_count = len(final_q_nums)
    
    # 检查是否连续
    expected = list(range(1, final_count + 1))
    is_continuous = final_q_nums == expected
    
    print(f"   删除后剩余：{final_count} 题")
    print(f"   新 Q 编号：{final_q_nums[:10]}{'...' if len(final_q_nums) > 10 else ''}")
    print(f"   连续：{'✅' if is_continuous else '❌'}")
    
    # 写入文件
    write_file(file_path, content)
    
    return {
        'file': str(file_path),
        'original_count': original_count,
        'final_count': final_count,
        'removed': original_count - final_count,
        'is_continuous': is_continuous
    }


def main():
    """主函数"""
    print("=" * 60)
    print("Q 编号修复和去重工具 - 精确匹配版")
    print("=" * 60)
    
    # 定义每个文件要删除的 Q 编号（删除重复的题目）
    files_config = [
        # 1. security/xss-csrf.md（最严重）
        {
            'path': BASE_DIR / 'security' / 'xss-csrf.md',
            'remove': [10, 12, 13, 13]  # Q10 重复 Q4, Q12 重复 Q9, 两个 Q13 重复
        },
        # 2. git/basics.md
        {
            'path': BASE_DIR / 'git' / 'basics.md',
            'remove': [14, 14, 15, 15, 16, 16, 17]  # 注意：有两个 Q14/Q15，只删除后面的
        },
        # 3. framework/vue/vue-basics.md
        {
            'path': BASE_DIR / 'framework' / 'vue' / 'vue-basics.md',
            'remove': [11, 12, 20, 21, 22, 23, 24, 25]  # 删除重复的后缀题
        },
        # 4. framework/react/principles.md
        {
            'path': BASE_DIR / 'framework' / 'react' / 'principles.md',
            'remove': [5, 8, 11, 20]  # Q5 重复 Q12, Q8 重复 Q18, Q11/Q20 重复 Q3
        },
        # 5. interview/open-questions.md
        {
            'path': BASE_DIR / 'interview' / 'open-questions.md',
            'remove': [12]  # Q12 重复 Q3
        },
        # 6. mini-program/basics.md
        {
            'path': BASE_DIR / 'mini-program' / 'basics.md',
            'remove': [11, 17]  # Q11 重复 Q7, Q17 重复 Q12
        },
        # 7. network/tcp-ip.md - 只需要重编号
        {
            'path': BASE_DIR / 'network' / 'tcp-ip.md',
            'remove': []  # 没有重复，只需重编号
        },
        # 8. other/graphql-electron.md - 只需要重编号
        {
            'path': BASE_DIR / 'other' / 'graphql-electron.md',
            'remove': []  # 没有重复，只需重编号
        },
    ]
    
    all_stats = []
    
    for config in files_config:
        file_path = config['path']
        q_to_remove = config['remove']
        
        if not file_path.exists():
            print(f"\n⚠️  文件不存在：{file_path}")
            continue
        
        # 对于有重复删除的文件，先处理删除
        if q_to_remove:
            # 读取当前文件的 Q 列表
            content = read_file(file_path)
            all_q = sorted(set(int(m.group(1)) for m in re.finditer(r'### Q(\d+):', content)))
            
            # 检查要删除的 Q 是否存在
            valid_remove = [q for q in q_to_remove if q in all_q]
            
            if valid_remove:
                stats = fix_file(file_path, valid_remove)
                all_stats.append(stats)
            else:
                print(f"\n📄 {file_path.name}")
                print(f"   ⚠️  无需删除（现有 Q: {all_q}, 待删除：{q_to_remove})")
    
    print("\n" + "=" * 60)
    print("✅ 批量修复完成!")
    print("=" * 60)
    
    total_removed = sum(s.get('removed', 0) for s in all_stats)
    print(f"总共删除重复题目：{total_removed}")
    print()


if __name__ == '__main__':
    main()