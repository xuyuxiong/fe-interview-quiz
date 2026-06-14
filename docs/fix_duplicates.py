#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Q 编号修复和去重脚本
用于修复 markdown 文件中的重复题目并重编号
"""

import re
import os
from pathlib import Path
from typing import List, Tuple, Dict

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


def extract_questions(content: str) -> List[Tuple[int, str, str, int]]:
    """
    提取所有题目
    返回：[(Q 编号，题目标题，完整内容块，起始位置), ...]
    """
    questions = []
    # 匹配 ### Q{N}: 格式
    pattern = r'### Q(\d+):\s*([^\n]+)'
    
    for match in re.finditer(pattern, content):
        q_num = int(match.group(1))
        title = match.group(2).strip()
        start_pos = match.start()
        questions.append((q_num, title, match.group(0), start_pos))
    
    return questions


def find_duplicates(questions: List[Tuple[int, str, str, int]]) -> Dict[str, List[int]]:
    """
    查找重复的题目（基于标题相似度）
    返回：{标准化标题：[Q 编号列表]}
    """
    from collections import defaultdict
    
    # 标准化标题（去除标点、空格、统一大小写）
    def normalize(title: str) -> str:
        # 转小写
        t = title.lower()
        # 去除标点
        t = re.sub(r'[^\w\s\u4e00-\u9fff]', '', t)
        # 去除多余空格
        t = ' '.join(t.split())
        return t.strip()
    
    groups = defaultdict(list)
    for q_num, title, _, _ in questions:
        key = normalize(title)
        groups[key].append(q_num)
    
    # 只保留有重复的组
    return {k: v for k, v in groups.items() if len(v) > 1}


def get_question_content_blocks(content: str) -> Dict[int, Tuple[str, int, int]]:
    """
    获取每个 Q 编号的完整内容块（从 ### Q 到下一个 ### Q 或文件结尾）
    返回：{Q 编号：(内容块，起始位置，结束位置)}
    """
    blocks = {}
    lines = content.split('\n')
    
    current_q = None
    current_start = None
    current_content = []
    
    for i, line in enumerate(lines):
        match = re.match(r'^### Q(\d+):', line)
        if match:
            # 保存上一个 Q 的内容
            if current_q is not None:
                blocks[current_q] = ('\n'.join(current_content), current_start, i)
            
            # 开始新的 Q
            current_q = int(match.group(1))
            current_start = i
            current_content = [line]
        elif current_q is not None:
            current_content.append(line)
    
    # 保存最后一个 Q
    if current_q is not None:
        blocks[current_q] = ('\n'.join(current_content), current_start, len(lines))
    
    return blocks


def select_best_version(blocks: Dict[int, Tuple[str, int, int]], q_nums: List[int]) -> int:
    """
    从重复的题目中选择最佳的版本（保留更详细的）
    返回：应该保留的 Q 编号
    """
    if len(q_nums) == 1:
        return q_nums[0]
    
    # 默认保留第一个（通常更详细）
    # 可以根据内容长度、包含的代码块数量等判断
    best = q_nums[0]
    best_score = 0
    
    for q_num in q_nums:
        content, _, _ = blocks[q_num]
        # 评分标准：内容长度 + 代码块数量 * 100 + 表格数量 * 50
        score = len(content)
        score += len(re.findall(r'```', content)) * 100
        score += len(re.findall(r'\|.*\|', content)) * 50
        
        if score > best_score:
            best_score = score
            best = q_num
    
    return best


def fix_duplicates(content: str, duplicates: Dict[str, List[int]]) -> str:
    """
    删除重复的题目（只保留最佳版本）
    """
    blocks = get_question_content_blocks(content)
    
    # 收集要删除的 Q 编号
    to_delete = set()
    
    for norm_title, q_nums in duplicates.items():
        if len(q_nums) > 1:
            # 选择最佳版本
            best = select_best_version(blocks, q_nums)
            # 其他的标记为删除
            for q_num in q_nums:
                if q_num != best:
                    to_delete.add(q_num)
    
    if not to_delete:
        return content
    
    # 删除标记的题目
    lines = content.split('\n')
    result_lines = []
    skip_until_next = False
    current_skip_q = None
    
    i = 0
    while i < len(lines):
        line = lines[i]
        match = re.match(r'^### Q(\d+):', line)
        
        if match:
            q_num = int(match.group(1))
            if q_num in to_delete:
                # 跳过这个 Q 直到下一个 Q 或特定标记
                skip_until_next = True
                current_skip_q = q_num
                i += 1
                continue
            else:
                skip_until_next = False
        
        if skip_until_next:
            # 检查是否是下一个 Q 的开始或文件分隔符
            if i + 1 < len(lines) and re.match(r'^### Q\d+:', lines[i + 1]):
                skip_until_next = False
            else:
                i += 1
                continue
        
        result_lines.append(line)
        i += 1
    
    return '\n'.join(result_lines)


def renumber_questions(content: str) -> str:
    """
    重新编号 Q，使其连续（Q1, Q2, Q3...）
    """
    lines = content.split('\n')
    result_lines = []
    q_counter = 0
    
    for line in lines:
        match = re.match(r'^(### )Q(\d+):', line)
        if match:
            q_counter += 1
            # 替换为新的连续编号
            new_line = f'{match.group(1)}Q{q_counter}:{line.split(":", 1)[1]}'
            result_lines.append(new_line)
        else:
            result_lines.append(line)
    
    return '\n'.join(result_lines)


def process_file(file_path: Path, dry_run: bool = False) -> dict:
    """
    处理单个文件
    返回处理统计信息
    """
    content = read_file(file_path)
    original_content = content
    
    # 提取题目
    questions = extract_questions(content)
    original_count = len(questions)
    
    # 查找重复
    duplicates = find_duplicates(questions)
    
    # 如果有重复，先删除重复
    if duplicates:
        content = fix_duplicates(content, duplicates)
    
    # 重新编号
    content = renumber_questions(content)
    
    # 重新提取题目以获取最终数量
    final_questions = extract_questions(content)
    final_count = len(final_questions)
    
    stats = {
        'file': str(file_path),
        'original_count': original_count,
        'final_count': final_count,
        'removed': original_count - final_count,
        'duplicates_found': sum(len(v) - 1 for v in duplicates.values())
    }
    
    if not dry_run and content != original_content:
        write_file(file_path, content)
    
    return stats


def main():
    """主函数"""
    # 需要处理的文件列表
    files_to_process = [
        BASE_DIR / 'security' / 'xss-csrf.md',
        BASE_DIR / 'git' / 'basics.md',
        BASE_DIR / 'framework' / 'vue' / 'vue-basics.md',
        BASE_DIR / 'framework' / 'react' / 'principles.md',
        BASE_DIR / 'interview' / 'open-questions.md',
        BASE_DIR / 'mini-program' / 'basics.md',
        BASE_DIR / 'network' / 'tcp-ip.md',
        BASE_DIR / 'other' / 'graphql-electron.md',
    ]
    
    print("=" * 60)
    print("Q 编号修复和去重工具")
    print("=" * 60)
    print()
    
    all_stats = []
    
    for file_path in files_to_process:
        if not file_path.exists():
            print(f"⚠️  文件不存在：{file_path}")
            continue
        
        print(f"📄 处理：{file_path.name}")
        stats = process_file(file_path)
        all_stats.append(stats)
        
        print(f"   原题数：{stats['original_count']} → 最终：{stats['final_count']}")
        print(f"   删除重复：{stats['removed']}")
        print()
    
    print("=" * 60)
    print("✅ 处理完成!")
    print("=" * 60)
    
    total_removed = sum(s['removed'] for s in all_stats)
    print(f"总共删除重复题目：{total_removed}")
    print()


if __name__ == '__main__':
    main()