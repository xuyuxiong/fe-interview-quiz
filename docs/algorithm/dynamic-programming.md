---
title: 动态规划面试题
description: 覆盖 DP 四步骤/爬楼梯/零钱兑换/LIS/背包/编辑距离等 8 道经典题
---

# 动态规划面试题

### Q1: DP 解题四步骤

> **⭐ 简单 · DP 基础**

请描述动态规划解题的四个步骤，并用爬楼梯问题示例说明。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**动态规划四步骤：**

1. **定义状态**：明确 dp[i] 的含义
2. **状态转移方程**：找出 dp[i] 与之前状态的关系
3. **初始化**：确定边界条件
4. **遍历顺序**：确定计算顺序确保依赖的状态已计算

```js
// 爬楼梯问题示例
// 问题：每次可以爬 1 或 2 阶，爬到 n 阶有多少种方法？

// 1. 定义状态：dp[i] = 爬到第 i 阶的方法数
// 2. 状态转移：dp[i] = dp[i-1] + dp[i-2]
// 3. 初始化：dp[0] = 1, dp[1] = 1
// 4. 遍历顺序：从 2 到 n

function climbStairs(n) {
  if (n <= 1) return 1
  let prev2 = 1 // dp[0]
  let prev1 = 1 // dp[1]
  for (let i = 2; i <= n; i++) {
    const curr = prev1 + prev2
    prev2 = prev1
    prev1 = curr
  }
  return prev1
}

// 完整 DP 数组版本
function climbStairsDP(n) {
  const dp = new Array(n + 1)
  dp[0] = 1
  dp[1] = 1
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2]
  }
  return dp[n]
}
```

**知识点：** `状态定义` `转移方程` `空间优化`

:::

### Q2: 零钱兑换问题

> **🔥 中等 · DP 基础**

给定不同面额的硬币和总金额，计算最少需要多少枚硬币。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 完全背包问题
function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity)
  dp[0] = 0
  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] = Math.min(dp[i], dp[i - coin] + 1)
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}

// 返回具体组合
function coinChangeWithPath(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity)
  const prev = new Array(amount + 1).fill(null)
  dp[0] = 0
  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) {
      if (dp[i - coin] + 1 < dp[i]) {
        dp[i] = dp[i - coin] + 1
        prev[i] = coin
      }
    }
  }
  if (dp[amount] === Infinity) return { count: -1, coins: [] }
  // 重建路径
  const result = []
  let curr = amount
  while (curr > 0) {
    result.push(prev[curr])
    curr -= prev[curr]
  }
  return { count: dp[amount], coins: result }
}

// 记忆化搜索版本
function coinChangeMemo(coins, amount) {
  const memo = new Map()
  function dp(remain) {
    if (remain === 0) return 0
    if (remain < 0) return Infinity
    if (memo.has(remain)) return memo.get(remain)
    let min = Infinity
    for (const coin of coins) {
      min = Math.min(min, 1 + dp(remain - coin))
    }
    memo.set(remain, min)
    return min
  }
  const result = dp(amount)
  return result === Infinity ? -1 : result
}
```

**知识点：** `完全背包` `最少硬币` `状态转移`

:::

### Q3: 最长递增子序列（LIS）

> **🔥 中等 · DP 经典**

请实现找到最长递增子序列长度的函数。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// DP O(n²)
function lengthOfLIS(nums) {
  if (nums.length === 0) return 0
  const dp = new Array(nums.length).fill(1)
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1)
      }
    }
  }
  return Math.max(...dp)
}

// 贪心 + 二分 O(nlogn)
function lengthOfLISGreedy(nums) {
  const tails = []
  for (const num of nums) {
    // 找到第一个 >= num 的位置
    let left = 0
    let right = tails.length
    while (left < right) {
      const mid = Math.floor((left + right) / 2)
      if (tails[mid] < num) left = mid + 1
      else right = mid
    }
    tails[left] = num
  }
  return tails.length
}

// 返回具体序列
function getLIS(nums) {
  const tails = []
  const prev = new Array(nums.length).fill(-1)
  const indices = []
  for (let i = 0; i < nums.length; i++) {
    const num = nums[i]
    let left = 0
    let right = tails.length
    while (left < right) {
      const mid = Math.floor((left + right) / 2)
      if (tails[mid] < num) left = mid + 1
      else right = mid
    }
    tails[left] = num
    indices[left] = i
    if (left > 0) prev[i] = indices[left - 1]
  }
  // 重建路径
  const result = []
  let i = indices[tails.length - 1]
  while (i !== -1) {
    result.unshift(nums[i])
    i = prev[i]
  }
  return result
}
```

**知识点：** `LIS` `贪心` `二分查找` `耐心排序`

:::

### Q4: 0-1 背包问题

> **🔥 中等 · DP 经典**

给定物品重量和价值，背包容量限制，求最大价值（每件物品只能用一次）。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 二维 DP
function knapsack01(weights, values, capacity) {
  const n = weights.length
  const dp = Array.from({ length: n + 1 }, () => 
    new Array(capacity + 1).fill(0))
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j <= capacity; j++) {
      dp[i][j] = dp[i - 1][j]
      if (j >= weights[i - 1]) {
        dp[i][j] = Math.max(dp[i][j], 
          dp[i - 1][j - weights[i - 1]] + values[i - 1])
      }
    }
  }
  return dp[n][capacity]
}

// 一维 DP 空间优化（倒序遍历）
function knapsack01Optimized(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0)
  for (let i = 0; i < weights.length; i++) {
    for (let j = capacity; j >= weights[i]; j--) {
      dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i])
    }
  }
  return dp[capacity]
}

// 返回具体选择的物品
function knapsackWithPath(weights, values, capacity) {
  const n = weights.length
  const dp = Array.from({ length: n + 1 }, () => 
    new Array(capacity + 1).fill(0))
  for (let i = 1; i <= n; i++) {
    for (let j = 0; j <= capacity; j++) {
      dp[i][j] = dp[i - 1][j]
      if (j >= weights[i - 1]) {
        dp[i][j] = Math.max(dp[i][j], 
          dp[i - 1][j - weights[i - 1]] + values[i - 1])
      }
    }
  }
  // 回溯找路径
  const selected = []
  let j = capacity
  for (let i = n; i > 0; i--) {
    if (dp[i][j] !== dp[i - 1][j]) {
      selected.push(i - 1)
      j -= weights[i - 1]
    }
  }
  return { maxValue: dp[n][capacity], items: selected.reverse() }
}
```

**知识点：** `0-1 背包` `状态压缩` `路径重建`

:::

### Q5: 完全背包问题

> **🔥 中等 · DP 经典**

与 0-1 背包不同，完全背包中每件物品可以用无限次。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 完全背包（正序遍历）
function knapsackComplete(weights, values, capacity) {
  const dp = new Array(capacity + 1).fill(0)
  for (let i = 0; i < weights.length; i++) {
    for (let j = weights[i]; j <= capacity; j++) {
      dp[j] = Math.max(dp[j], dp[j - weights[i]] + values[i])
    }
  }
  return dp[capacity]
}

// 爬楼梯（完全背包的特例）
function climbStairsComplete(n) {
  const dp = new Array(n + 1).fill(0)
  dp[0] = 1
  const steps = [1, 2] // 每次可以爬 1 或 2 阶
  for (const step of steps) {
    for (let i = step; i <= n; i++) {
      dp[i] += dp[i - step]
    }
  }
  return dp[n]
}

// 零钱兑换 II（组合数）
function change(amount, coins) {
  const dp = new Array(amount + 1).fill(0)
  dp[0] = 1
  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] += dp[i - coin]
    }
  }
  return dp[amount]
}
```

**知识点：** `完全背包` `正序遍历` `物品无限`

:::

### Q6: 编辑距离（Levenshtein Distance）

> **💀 困难 · DP 经典**

给定两个单词，计算将 word1 转换为 word2 所需的最少操作数（插入、删除、替换）。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
function minDistance(word1, word2) {
  const m = word1.length
  const n = word2.length
  const dp = Array.from({ length: m + 1 }, () => 
    new Array(n + 1).fill(0))
  // 初始化
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  // 状态转移
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // 删除
          dp[i][j - 1] + 1,     // 插入
          dp[i - 1][j - 1] + 1  // 替换
        )
      }
    }
  }
  return dp[m][n]
}

// 返回具体操作序列
function minDistanceWithOps(word1, word2) {
  const m = word1.length
  const n = word2.length
  const dp = Array.from({ length: m + 1 }, () => 
    new Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + 1
        )
      }
    }
  }
  // 回溯操作
  const ops = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i === 0) {
      ops.unshift(`插入 '${word2[j - 1]}'`)
      j--
    } else if (j === 0) {
      ops.unshift(`删除 '${word1[i - 1]}'`)
      i--
    } else if (word1[i - 1] === word2[j - 1]) {
      ops.unshift(`匹配 '${word1[i - 1]}'`)
      i--
      j--
    } else if (dp[i][j] === dp[i - 1][j - 1] + 1) {
      ops.unshift(`替换 '${word1[i - 1]}' -> '${word2[j - 1]}'`)
      i--
      j--
    } else if (dp[i][j] === dp[i - 1][j] + 1) {
      ops.unshift(`删除 '${word1[i - 1]}'`)
      i--
    } else {
      ops.unshift(`插入 '${word2[j - 1]}'`)
      j--
    }
  }
  return { distance: dp[m][n], operations: ops }
}
```

**知识点：** `编辑距离` `二维 DP` `字符串`

:::

### Q7: 最长公共子序列（LCS）

> **🔥 中等 · DP 经典**

给定两个字符串，找到它们的最长公共子序列长度。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 基础 LCS
function longestCommonSubsequence(text1, text2) {
  const m = text1.length
  const n = text2.length
  const dp = Array.from({ length: m + 1 }, () => 
    new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }
  return dp[m][n]
}

// 返回具体子序列
function getLCS(text1, text2) {
  const m = text1.length
  const n = text2.length
  const dp = Array.from({ length: m + 1 }, () => 
    new Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }
  // 回溯
  let i = m, j = n
  const result = []
  while (i > 0 && j > 0) {
    if (text1[i - 1] === text2[j - 1]) {
      result.unshift(text1[i - 1])
      i--
      j--
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }
  return result.join('')
}
```

**知识点：** `LCS` `子序列` `二维 DP`

:::

### Q8: DP 综合应用题

> **💀 困难 · DP 综合**

请比较以下 DP 问题的异同点。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 问题类型 | 状态定义 | 转移方程特点 | 遍历顺序 |
|----------|----------|--------------|----------|
| 0-1 背包 | dp[j] 容量 j 的最大价值 | dp[j] = max(dp[j], dp[j-w]+v) | 倒序 |
| 完全背包 | dp[j] 容量 j 的最大价值 | dp[j] = max(dp[j], dp[j-w]+v) | 正序 |
| 爬楼梯 | dp[i] 到第 i 阶的方法数 | dp[i] = dp[i-1] + dp[i-2] | 正序 |
| LIS | dp[i] 以 i 结尾的 LIS 长度 | dp[i] = max(dp[j]+1) | 正序 |
| 编辑距离 | dp[i][j] word1[0..i] 到 word2[0..j] | 取 min(插入/删除/替换) +1 | 正序 |
| LCS | dp[i][j] text1[0..i] 与 text2[0..j] 的 LCS | 相等则 +1，否则 max | 正序 |

**DP 问题分类：**

1. **计数问题**（爬楼梯、零钱兑换）：求方案数，用加法
2. **最值问题**（背包、LIS）：求最大/最小值，用 max/min
3. **存在性问题**（单词拆分）：bool 值，用或运算

**空间优化技巧：**
- 一维数组滚动优化（背包问题）
- 两个变量代替数组（斐波那契、爬楼梯）
- 状态压缩（位运算）

**知识点：** `DP 分类` `状态压缩` `问题建模`

:::
### Q9: 最长公共子序列（LCS）

> **💀 困难 · 动态规划**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 返回 LCS 长度
function longestCommonSubsequence(text1, text2) {
  const m = text1.length
  const n = text2.length

  // dp[i][j] = text1[0..i-1] 和 text2[0..j-1] 的 LCS 长度
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  return dp[m][n]
}

// 返回具体的 LCS 字符串
function getLCS(text1, text2) {
  const m = text1.length
  const n = text2.length
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  // 回溯找具体序列
  let i = m, j = n
  const result = []
  while (i > 0 && j > 0) {
    if (text1[i - 1] === text2[j - 1]) {
      result.unshift(text1[i - 1])
      i--; j--
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  return result.join('')
}

// 测试
console.log(longestCommonSubsequence('abcde', 'ace'))  // 3
console.log(getLCS('abcde', 'ace'))                    // 'ace'
```

**DP 表推演示例：**

```text
text1 = "abcde", text2 = "ace"

      ""  a  c  e
  ""   0  0  0  0
  a    0  1  1  1
  b    0  1  1  1
  c    0  1  2  2
  d    0  1  2  2
  e    0  1  2  3

状态转移：
  相同: dp[i][j] = dp[i-1][j-1] + 1
  不同: dp[i][j] = max(dp[i-1][j], dp[i][j-1])
```

| 复杂度 | 值 |
|--------|------|
| 时间 | O(m × n) |
| 空间 | O(m × n)，可优化到 O(min(m,n)) |

**知识点：** `动态规划` `LCS` `二维DP` `回溯` `状态转移`

:::
