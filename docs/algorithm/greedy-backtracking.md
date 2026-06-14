---
title: 贪心与回溯面试题
description: 覆盖贪心算法条件/活动选择/跳跃游戏/回溯模板/N 皇后/排列组合等 6 道题
---

# 贪心与回溯面试题

### Q1: 贪心算法适用条件

> **⭐ 简单 · 贪心基础**

请说明贪心算法的适用条件，并与动态规划对比。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**贪心算法适用条件：**

1. **最优子结构**：问题的最优解包含子问题的最优解
2. **贪心选择性质**：局部最优选择能导致全局最优解

**贪心 vs 动态规划：**

| 特性 | 贪心算法 | 动态规划 |
|------|----------|----------|
| 选择方式 | 每一步选当前最优 | 考虑所有可能 |
| 依赖方向 | 自顶向下 | 自底向上或记忆化 |
| 子问题 | 只解决一个 | 解决多个后选择 |
| 正确性证明 | 需要证明贪心选择 | 自然正确 |
| 时间复杂度 | 通常更优 | 可能更高 |

**何时用贪心：**
- 活动选择问题
- 霍夫曼编码
- 最小生成树（Prim/Kruskal）
- 分数背包（可分割）

**何时不用贪心：**
- 0-1 背包（需动态规划）
- 找零钱问题（某些面额组合下贪心不最优）

```js
// 贪心示例：分数背包
function fractionalKnapsack(items, capacity) {
  // 按单位重量价值排序
  items.sort((a, b) => b.value / b.weight - a.value / a.weight)
  let totalValue = 0
  let remaining = capacity
  for (const item of items) {
    if (remaining <= 0) break
    const take = Math.min(remaining, item.weight)
    totalValue += take * (item.value / item.weight)
    remaining -= take
  }
  return totalValue
}
```

**知识点：** `贪心选择` `最优子结构` `与 DP 对比`

:::

### Q2: 活动选择问题

> **🔥 中等 · 贪心经典**

给定活动的开始时间和结束时间，选择最多的互不冲突的活动。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 按结束时间排序的贪心策略
function maxActivities(activities) {
  // activities: [{ start, end, id }]
  // 按结束时间排序
  activities.sort((a, b) => a.end - b.end)
  const selected = []
  let lastEnd = -Infinity
  for (const activity of activities) {
    if (activity.start >= lastEnd) {
      selected.push(activity)
      lastEnd = activity.end
    }
  }
  return selected
}

// 返回最大活动数和具体活动
function maxActivitiesCount(activities) {
  activities.sort((a, b) => a.end - b.end)
  let count = 0
  let lastEnd = -Infinity
  const selected = []
  for (const activity of activities) {
    if (activity.start >= lastEnd) {
      count++
      selected.push(activity)
      lastEnd = activity.end
    }
  }
  return { count, selected }
}

// 证明：为什么按结束时间排序是最优的？
// 1. 结束越早，留给后面的时间越多
// 2. 假设最优解不包含最早结束的活动 A，而包含 B
//    用 A 替换 B，不会使解变差（A 结束更早）
// 3. 因此贪心选择能构造最优解
```

**知识点：** `活动选择` `按结束时间排序` `区间调度`

:::

### Q3: 跳跃游戏

> **🔥 中等 · 贪心应用**

给定数组，每个元素代表在该位置能跳跃的最大长度，判断能否到达最后一个位置。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 跳跃游戏 I（能否到达）
function canJump(nums) {
  let maxReach = 0
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false
    maxReach = Math.max(maxReach, i + nums[i])
    if (maxReach >= nums.length - 1) return true
  }
  return maxReach >= nums.length - 1
}

// 跳跃游戏 II（最少跳跃次数）
function jump(nums) {
  if (nums.length <= 1) return 0
  let jumps = 0
  let currentEnd = 0
  let farthest = 0
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i])
    if (i === currentEnd) {
      jumps++
      currentEnd = farthest
      if (currentEnd >= nums.length - 1) break
    }
  }
  return jumps
}

// 跳跃游戏 III（能否跳到值为 0 的位置）
function canReachZero(arr, start) {
  const visited = new Set()
  const queue = [start]
  while (queue.length) {
    const pos = queue.shift()
    if (arr[pos] === 0) return true
    if (visited.has(pos)) continue
    visited.add(pos)
    if (pos - arr[pos] >= 0) queue.push(pos - arr[pos])
    if (pos + arr[pos] < arr.length) queue.push(pos + arr[pos])
  }
  return false
}
```

**知识点：** `跳跃游戏` `贪心` `最远可达`

:::

### Q4: 回溯算法模板

> **⭐ 简单 · 回溯基础**

请写出回溯算法的通用模板。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 回溯通用模板
function backtrack(路径，选择列表) {
  // 1. 结束条件
  if (满足结束条件) {
    结果集.push(路径.slice())
    return
  }
  // 2. 做选择
  for (const 选择 of 选择列表) {
    // 做选择
    路径.push(选择)
    // 剪枝（可选）
    if (剪枝条件) continue
    // 递归
    backtrack(路径，新的选择列表)
    // 撤销选择
    路径.pop()
  }
}

// 示例：子集问题
function subsets(nums) {
  const result = []
  function backtrack(start, path) {
    result.push(path.slice()) // 每个节点都是有效子集
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i])
      backtrack(i + 1, path)
      path.pop()
    }
  }
  backtrack(0, [])
  return result
}

// 示例：组合问题（无重复）
function combine(n, k) {
  const result = []
  function backtrack(start, path) {
    if (path.length === k) {
      result.push(path.slice())
      return
    }
    for (let i = start; i <= n; i++) {
      path.push(i)
      backtrack(i + 1, path)
      path.pop()
    }
  }
  backtrack(1, [])
  return result
}
```

**知识点：** `回溯模板` `递归` `状态恢复`

:::

### Q5: N 皇后问题

> **💀 困难 · 回溯经典**

在 N×N 棋盘上放置 N 个皇后，使它们互不攻击。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
function solveNQueens(n) {
  const result = []
  const board = Array.from({ length: n }, () => 
    '.'.repeat(n).split(''))
  
  function isValid(row, col) {
    // 检查列
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 'Q') return false
    }
    // 检查左上对角线
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 'Q') return false
    }
    // 检查右上对角线
    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
      if (board[i][j] === 'Q') return false
    }
    return true
  }
  
  function backtrack(row) {
    if (row === n) {
      result.push(board.map(row => row.join('')))
      return
    }
    for (let col = 0; col < n; col++) {
      if (!isValid(row, col)) continue
      board[row][col] = 'Q'
      backtrack(row + 1)
      board[row][col] = '.'
    }
  }
  
  backtrack(0)
  return result
}

// 返回 N 皇后总数（使用集合优化）
function totalNQueens(n) {
  let count = 0
  const cols = new Set()
  const diag1 = new Set() // 主对角线 row - col
  const diag2 = new Set() // 副对角线 row + col
  
  function backtrack(row) {
    if (row === n) {
      count++
      return
    }
    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) {
        continue
      }
      cols.add(col)
      diag1.add(row - col)
      diag2.add(row + col)
      backtrack(row + 1)
      cols.delete(col)
      diag1.delete(row - col)
      diag2.delete(row + col)
    }
  }
  
  backtrack(0)
  return count
}
```

**知识点：** `N 皇后` `回溯` `对角线判断` `剪枝`

:::

### Q6: 全排列与组合问题

> **🔥 中等 · 回溯应用**

请实现全排列、组合、子集等经典回溯问题。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 全排列（无重复）
function permute(nums) {
  const result = []
  const used = new Array(nums.length).fill(false)
  function backtrack(path) {
    if (path.length === nums.length) {
      result.push(path.slice())
      return
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue
      used[i] = true
      path.push(nums[i])
      backtrack(path)
      path.pop()
      used[i] = false
    }
  }
  backtrack([])
  return result
}

// 全排列（有重复）
function permuteUnique(nums) {
  nums.sort((a, b) => a - b)
  const result = []
  const used = new Array(nums.length).fill(false)
  function backtrack(path) {
    if (path.length === nums.length) {
      result.push(path.slice())
      return
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue
      // 去重：同一层不选相同元素
      if (i > 0 && nums[i] === nums[i - 1] && !used[i - 1]) continue
      used[i] = true
      path.push(nums[i])
      backtrack(path)
      path.pop()
      used[i] = false
    }
  }
  backtrack([])
  return result
}

// 组合（无重复）
function combine(n, k) {
  const result = []
  function backtrack(start, path) {
    if (path.length === k) {
      result.push(path.slice())
      return
    }
    for (let i = start; i <= n; i++) {
      path.push(i)
      backtrack(i + 1, path)
      path.pop()
    }
  }
  backtrack(1, [])
  return result
}

// 子集（幂集）
function subsets(nums) {
  const result = []
  function backtrack(start, path) {
    result.push(path.slice())
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i])
      backtrack(i + 1, path)
      path.pop()
    }
  }
  backtrack(0, [])
  return result
}

// 组合总和（可重复使用）
function combinationSum(candidates, target) {
  const result = []
  function backtrack(start, path, sum) {
    if (sum === target) {
      result.push(path.slice())
      return
    }
    if (sum > target) return
    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i])
      backtrack(i, path, sum + candidates[i]) // i 不是 i+1（可重复）
      path.pop()
    }
  }
  backtrack(0, [], 0)
  return result
}
```

**知识点：** `全排列` `组合` `子集` `去重技巧` `回溯`

:::