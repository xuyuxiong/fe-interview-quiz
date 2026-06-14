---
title: 树与图面试题
description: 覆盖遍历/深度/LCA/BST/Dijkstra/拓扑排序等 8 道经典题
---

# 树与图面试题

### Q1: 二叉树的前中后序遍历（递归 + 迭代）

> **⭐ 简单 · 树基础**

请分别用递归和迭代实现二叉树的前序、中序、后序遍历。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val
    this.left = left
    this.right = right
  }
}

// 前序遍历：根左右
function preorderTraversal(root) {
  const result = []
  function dfs(node) {
    if (!node) return
    result.push(node.val)
    dfs(node.left)
    dfs(node.right)
  }
  dfs(root)
  return result
}

// 前序迭代
function preorderIterative(root) {
  if (!root) return []
  const result = []
  const stack = [root]
  while (stack.length) {
    const node = stack.pop()
    result.push(node.val)
    if (node.right) stack.push(node.right)
    if (node.left) stack.push(node.left)
  }
  return result
}

// 中序遍历：左根右
function inorderTraversal(root) {
  const result = []
  function dfs(node) {
    if (!node) return
    dfs(node.left)
    result.push(node.val)
    dfs(node.right)
  }
  dfs(root)
  return result
}

// 中序迭代
function inorderIterative(root) {
  const result = []
  const stack = []
  let curr = root
  while (curr || stack.length) {
    while (curr) {
      stack.push(curr)
      curr = curr.left
    }
    curr = stack.pop()
    result.push(curr.val)
    curr = curr.right
  }
  return result
}

// 后序遍历：左右根
function postorderTraversal(root) {
  const result = []
  function dfs(node) {
    if (!node) return
    dfs(node.left)
    dfs(node.right)
    result.push(node.val)
  }
  dfs(root)
  return result
}

// 后序迭代（双栈法）
function postorderIterative(root) {
  if (!root) return []
  const result = []
  const stack1 = [root]
  const stack2 = []
  while (stack1.length) {
    const node = stack1.pop()
    stack2.push(node)
    if (node.left) stack1.push(node.left)
    if (node.right) stack1.push(node.right)
  }
  while (stack2.length) {
    result.push(stack2.pop().val)
  }
  return result
}
```

**知识点：** `DFS` `栈` `遍历顺序`

:::

### Q2: 层序遍历（BFS）

> **⭐ 简单 · 树基础**

请实现二叉树的层序遍历（从上到下，从左到右）。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 基础层序遍历
function levelOrder(root) {
  if (!root) return []
  const result = []
  const queue = [root]
  while (queue.length) {
    const levelSize = queue.length
    const level = []
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()
      level.push(node.val)
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }
    result.push(level)
  }
  return result
}

// 之字形层序遍历
function zigzagLevelOrder(root) {
  if (!root) return []
  const result = []
  const queue = [root]
  let leftToRight = true
  while (queue.length) {
    const levelSize = queue.length
    const level = []
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()
      if (leftToRight) level.push(node.val)
      else level.unshift(node.val)
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }
    result.push(level)
    leftToRight = !leftToRight
  }
  return result
}
```

**知识点：** `BFS` `队列` `层序遍历`

:::

### Q3: 最大深度与最小深度

> **⭐ 简单 · 树基础**

请实现计算二叉树最大深度和最小深度的函数。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 最大深度（递归）
function maxDepth(root) {
  if (!root) return 0
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right))
}

// 最大深度（BFS）
function maxDepthBFS(root) {
  if (!root) return 0
  let depth = 0
  const queue = [root]
  while (queue.length) {
    depth++
    const levelSize = queue.length
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }
  }
  return depth
}

// 最小深度（注意：必须是到叶子节点）
function minDepth(root) {
  if (!root) return 0
  if (!root.left && !root.right) return 1
  if (!root.left) return 1 + minDepth(root.right)
  if (!root.right) return 1 + minDepth(root.left)
  return 1 + Math.min(minDepth(root.left), minDepth(root.right))
}

// 最小深度（BFS，遇到叶子节点立即返回）
function minDepthBFS(root) {
  if (!root) return 0
  const queue = [[root, 1]]
  while (queue.length) {
    const [node, depth] = queue.shift()
    if (!node.left && !node.right) return depth
    if (node.left) queue.push([node.left, depth + 1])
    if (node.right) queue.push([node.right, depth + 1])
  }
  return 0
}
```

**知识点：** `递归` `BFS` `叶子节点`

:::

### Q4: 翻转二叉树

> **⭐ 简单 · 树操作**

请实现翻转二叉树的函数（左右子树互换）。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 递归法
function invertTree(root) {
  if (!root) return null
  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)]
  return root
}

// 迭代法（BFS）
function invertTreeBFS(root) {
  if (!root) return null
  const queue = [root]
  while (queue.length) {
    const node = queue.shift()
    [node.left, node.right] = [node.right, node.left]
    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
  }
  return root
}

// 迭代法（DFS）
function invertTreeDFS(root) {
  if (!root) return null
  const stack = [root]
  while (stack.length) {
    const node = stack.pop()
    [node.left, node.right] = [node.right, node.left]
    if (node.left) stack.push(node.left)
    if (node.right) stack.push(node.right)
  }
  return root
}
```

**知识点：** `树翻转` `对称` `递归`

:::

### Q5: 最近公共祖先（LCA）

> **🔥 中等 · 树操作**

请实现找到二叉树中两个节点最近公共祖先的函数。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 递归法（后序遍历）
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root
  const left = lowestCommonAncestor(root.left, p, q)
  const right = lowestCommonAncestor(root.right, p, q)
  if (left && right) return root
  return left || right
}

// 存储父节点法
function lowestCommonAncestorParent(root, p, q) {
  const parentMap = new Map()
  const visited = new Set()
  // BFS 建立父节点映射
  const queue = [root]
  parentMap.set(root, null)
  while (queue.length && (!parentMap.has(p) || !parentMap.has(q))) {
    const node = queue.shift()
    if (node.left) {
      parentMap.set(node.left, node)
      queue.push(node.left)
    }
    if (node.right) {
      parentMap.set(node.right, node)
      queue.push(node.right)
    }
  }
  // 从 p 向上遍历到根
  let curr = p
  while (curr) {
    visited.add(curr)
    curr = parentMap.get(curr)
  }
  // 从 q 向上找第一个在 visited 中的节点
  curr = q
  while (!visited.has(curr)) {
    curr = parentMap.get(curr)
  }
  return curr
}
```

**知识点：** `LCA` `后序遍历` `分治`

:::

### Q6: 验证二叉搜索树（BST）

> **🔥 中等 · BST**

请实现验证二叉搜索树的函数。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 中序遍历法（BST 中序遍历是升序）
function isValidBST(root) {
  let prev = -Infinity
  function inorder(node) {
    if (!node) return true
    if (!inorder(node.left)) return false
    if (node.val <= prev) return false
    prev = node.val
    return inorder(node.right)
  }
  return inorder(root)
}

// 递归法（带上下界）
function isValidBSTRange(root) {
  function validate(node, min, max) {
    if (!node) return true
    if (node.val <= min || node.val >= max) return false
    return validate(node.left, min, node.val) && 
           validate(node.right, node.val, max)
  }
  return validate(root, -Infinity, Infinity)
}
```

**知识点：** `BST` `中序遍历` `上下界`

:::

### Q7: Dijkstra 最短路径算法

> **💀 困难 · 图算法**

请实现 Dijkstra 算法找到单源最短路径。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 使用优先队列（最小堆）
function dijkstra(graph, start) {
  const n = graph.length
  const dist = new Array(n).fill(Infinity)
  dist[start] = 0
  const visited = new Array(n).fill(false)
  // 优先队列：[距离，节点]
  const pq = [[0, start]]
  while (pq.length) {
    // 取出距离最小的节点
    pq.sort((a, b) => a[0] - b[0])
    const [d, u] = pq.shift()
    if (visited[u]) continue
    visited[u] = true
    // 更新邻居
    for (const [v, weight] of graph[u]) {
      if (!visited[v] && dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight
        pq.push([dist[v], v])
      }
    }
  }
  return dist
}

// 带路径重建
function dijkstraWithPath(graph, start) {
  const n = graph.length
  const dist = new Array(n).fill(Infinity)
  const prev = new Array(n).fill(null)
  dist[start] = 0
  const pq = [[0, start]]
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0])
    const [d, u] = pq.shift()
    if (d > dist[u]) continue
    for (const [v, weight] of graph[u]) {
      if (dist[u] + weight < dist[v]) {
        dist[v] = dist[u] + weight
        prev[v] = u
        pq.push([dist[v], v])
      }
    }
  }
  return { dist, prev }
}

// 重建路径
function reconstructPath(prev, start, end) {
  const path = []
  let curr = end
  while (curr !== null) {
    path.unshift(curr)
    curr = prev[curr]
  }
  return path[0] === start ? path : []
}
```

**知识点：** `Dijkstra` `贪心` `优先队列` `单源最短路径`

:::

### Q8: 拓扑排序（Kahn 算法）

> **💀 困难 · 图算法**

请实现拓扑排序算法（Kahn 算法）。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// Kahn 算法（基于入度）
function topologicalSort(numCourses, prerequisites) {
  // 建图并计算入度
  const inDegree = new Array(numCourses).fill(0)
  const graph = Array.from({ length: numCourses }, () => [])
  for (const [course, prereq] of prerequisites) {
    graph[prereq].push(course)
    inDegree[course]++
  }
  // 将入度为 0 的节点加入队列
  const queue = []
  for (let i = 0; i < numCourses; i++) {
    if (inDegree[i] === 0) queue.push(i)
  }
  const result = []
  while (queue.length) {
    const node = queue.shift()
    result.push(node)
    for (const neighbor of graph[node]) {
      inDegree[neighbor]--
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor)
      }
    }
  }
  // 如果有环，结果长度小于节点数
  return result.length === numCourses ? result : []
}

// DFS 法拓扑排序
function topologicalSortDFS(numCourses, prerequisites) {
  const graph = Array.from({ length: numCourses }, () => [])
  for (const [course, prereq] of prerequisites) {
    graph[prereq].push(course)
  }
  const visited = new Array(numCourses).fill(0) // 0 未访问，1 访问中，2 已完成
  const result = []
  let hasCycle = false
  function dfs(node) {
    if (hasCycle) return
    if (visited[node] === 1) {
      hasCycle = true
      return
    }
    if (visited[node] === 2) return
    visited[node] = 1
    for (const neighbor of graph[node]) {
      dfs(neighbor)
    }
    visited[node] = 2
    result.unshift(node)
  }
  for (let i = 0; i < numCourses; i++) {
    if (visited[i] === 0) dfs(i)
  }
  return hasCycle ? [] : result
}
```

**知识点：** `拓扑排序` ` Kahn 算法` `有向无环图` `课程表`

:::
---

### Q9: 二叉树的右视图

> **🔥 中等 · 算法**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**题目：** 给定二叉树，返回从右侧看到的节点值（每层最后一个节点）。

**BFS 层序遍历解法：**

```js
/**
 * Definition for a binary tree node.
 * function TreeNode(val, left, right) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.left = (left===undefined ? null : left)
 *     this.right = (right===undefined ? null : right)
 * }
 */

/**
 * @param {TreeNode} root
 * @return {number[]}
 */
function rightSideView(root) {
  if (!root) return []
  
  const result = []
  const queue = [root]
  
  while (queue.length > 0) {
    const levelSize = queue.length
    let rightmost = null
    
    // 遍历当前层所有节点
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()
      rightmost = node.val
      
      // 先左后右入队
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }
    
    // 每层最后一个节点
    result.push(rightmost)
  }
  
  return result
}
```

**DFS 解法（先右后左）：**

```js
function rightSideView(root) {
  const result = []
  
  function dfs(node, level) {
    if (!node) return
    
    // 第一次访问该层
    if (level === result.length) {
      result.push(node.val)
    }
    
    // 先遍历右子树
    dfs(node.right, level + 1)
    // 再遍历左子树
    dfs(node.left, level + 1)
  }
  
  dfs(root, 0)
  return result
}
```

**复杂度分析：**

| 方法 | 时间复杂度 | 空间复杂度 |
|------|-----------|-----------|
| BFS | O(n) | O(n) |
| DFS | O(n) | O(h) |

**测试用例：**

```js
// 示例：
//     1
//    / \
//   2   3
//    \    \
//     5    4

const root = new TreeNode(1)
root.left = new TreeNode(2)
root.right = new TreeNode(3)
root.left.right = new TreeNode(5)
root.right.right = new TreeNode(4)

rightSideView(root)  // [1, 3, 4]
```

**知识点：** `二叉树` `BFS` `DFS` `层序遍历` `右视图`

:::

---

### Q10: 二叉树的翻转

> **⭐ 简单 · 算法**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**题目：** 翻转二叉树，交换每个节点的左右子树。

**递归解法：**

```js
/**
 * @param {TreeNode} root
 * @return {TreeNode}
 */
function invertTree(root) {
  if (!root) return null
  
  // 交换左右子树
  const left = root.left
  root.left = invertTree(root.right)
  root.right = invertTree(left)
  
  return root
}
```

**更简洁的写法：**

```js
function invertTree(root) {
  if (!root) return null
  
  // 同时交换（利用解构）
  [root.left, root.right] = [
    invertTree(root.right),
    invertTree(root.left)
  ]
  
  return root
}
```

**BFS 迭代解法：**

```js
function invertTree(root) {
  if (!root) return null
  
  const queue = [root]
  
  while (queue.length > 0) {
    const node = queue.shift()
    
    // 交换当前节点的左右子树
    [node.left, node.right] = [node.right, node.left]
    
    // 子节点入队
    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
  }
  
  return root
}
```

**DFS 迭代解法（栈）：**

```js
function invertTree(root) {
  if (!root) return null
  
  const stack = [root]
  
  while (stack.length > 0) {
    const node = stack.pop()
    
    [node.left, node.right] = [node.right, node.left]
    
    if (node.left) stack.push(node.left)
    if (node.right) stack.push(node.right)
  }
  
  return root
}
```

**测试用例：**

```js
// 输入：
//     4
//    / \
//   2   7
//  / \ / \
// 1  3 6  9

// 输出：
//     4
//    / \
//   7   2
//  / \ / \
// 9  6 3  1

const root = new TreeNode(4)
root.left = new TreeNode(2)
root.right = new TreeNode(7)
// ... 其他节点

invertTree(root)
```

**复杂度分析：**

| 方法 | 时间复杂度 | 空间复杂度 |
|------|-----------|-----------|
| 递归 | O(n) | O(h) |
| BFS | O(n) | O(n) |
| DFS 栈 | O(n) | O(h) |

**知识点：** `二叉树` `递归` `翻转` `BFS` `DFS`

:::

### Q11: 二叉树的层序遍历？

> **🔥 中等 · 树**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**基础层序遍历（BFS）：**

```js
function levelOrder(root) {
  if (!root) return []
  
  const result = []
  const queue = [root]
  
  while (queue.length > 0) {
    const levelSize = queue.length
    const currentLevel = []
    
    // 处理当前层的所有节点
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()
      currentLevel.push(node.val)
      
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }
    
    result.push(currentLevel)
  }
  
  return result
}

// 示例：
//     3
//    / \
//   9  20
//      / \
//     15  7

// 输出：[[3], [9, 20], [15, 7]]
```

**之字形层序遍历：**

```js
function zigzagLevelOrder(root) {
  if (!root) return []
  
  const result = []
  const queue = [root]
  let leftToRight = true
  
  while (queue.length > 0) {
    const levelSize = queue.length
    const currentLevel = new Array(levelSize)
    
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()
      const index = leftToRight ? i : (levelSize - 1 - i)
      currentLevel[index] = node.val
      
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }
    
    result.push(currentLevel)
    leftToRight = !leftToRight
  }
  
  return result
}

// 输出：[[3], [20, 9], [15, 7]]
```

**记录层号的遍历：**

```js
function levelOrderWithLevel(root) {
  if (!root) return []
  
  const result = []
  const queue = [[root, 0]]  // [节点，层号]
  
  while (queue.length > 0) {
    const [node, level] = queue.shift()
    
    if (!result[level]) {
      result[level] = []
    }
    result[level].push(node.val)
    
    if (node.left) queue.push([node.left, level + 1])
    if (node.right) queue.push([node.right, level + 1])
  }
  
  return result
}
```

**复杂度分析：**

| 指标 | 值 |
|------|-----|
| 时间复杂度 | O(n) - 每个节点访问一次 |
| 空间复杂度 | O(n) - 队列最多存储一层节点 |

**应用场景：**

```
✅ 按层打印二叉树
✅ 计算树的宽度
✅ 找每层的最值/平均值
✅ 序列化/反序列化二叉树
```

**知识点：** `层序遍历` `BFS` `队列` `二叉树`

:::

### Q12: 最短路径算法？Dijkstra 的原理？

> **🔥 中等 · 图**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Dijkstra 算法原理：**

```
从起点开始，每次选择距离起点最近且未访问的节点，
更新其邻居节点的距离，直到到达终点或所有节点都被访问。

核心思想：贪心 + 优先队列
```

**Dijkstra 实现（带权有向图）：**

```js
function dijkstra(graph, start, end) {
  const n = graph.length
  const dist = new Array(n).fill(Infinity)
  const prev = new Array(n).fill(null)
  const visited = new Set()
  
  // 优先队列（最小堆）
  const pq = new MinPriorityQueue()
  
  dist[start] = 0
  pq.enqueue(start, 0)
  
  while (!pq.isEmpty()) {
    const { element: u } = pq.dequeue()
    
    if (visited.has(u)) continue
    visited.add(u)
    
    // 到达终点
    if (u === end) break
    
    // 更新邻居
    for (const [v, weight] of graph[u]) {
      const newDist = dist[u] + weight
      
      if (newDist < dist[v]) {
        dist[v] = newDist
        prev[v] = u
        pq.enqueue(v, newDist)
      }
    }
  }
  
  // 重建路径
  const path = []
  let current = end
  while (current !== null) {
    path.unshift(current)
    current = prev[current]
  }
  
  return { distance: dist[end], path }
}

// 图的表示：邻接表
// graph[u] = [[v1, w1], [v2, w2], ...]
const graph = [
  [[1, 4], [2, 1]],      // 0 -> 1(4), 0 -> 2(1)
  [[3, 1]],              // 1 -> 3(1)
  [[1, 2], [3, 5]],      // 2 -> 1(2), 2 -> 3(5)
  []                     // 3 无出边
]

console.log(dijkstra(graph, 0, 3))
// { distance: 4, path: [0, 2, 1, 3] }
```

**BFS 求无权图最短路径：**

```js
function bfsShortestPath(graph, start, end) {
  const queue = [[start, [start]]]
  const visited = new Set([start])
  
  while (queue.length > 0) {
    const [node, path] = queue.shift()
    
    if (node === end) return path
    
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push([neighbor, [...path, neighbor]])
      }
    }
  }
  
  return null  // 无路径
}
```

**算法对比：**

| 算法 | 适用场景 | 时间复杂度 | 空间 |
|------|----------|-----------|------|
| BFS | 无权图 | O(V + E) | O(V) |
| Dijkstra | 非负权图 | O((V+E)logV) | O(V) |
| Bellman-Ford | 可负权 | O(VE) | O(V) |
| Floyd | 所有点对 | O(V³) | O(V²) |

**Dijkstra 适用条件：**

```
✅ 边权非负
✅ 单源最短路径
❌ 有负权边（用 Bellman-Ford）
❌ 所有点对最短路径（用 Floyd）
```

**知识点：** `Dijkstra` `最短路径` `优先队列` `图算法` `BFS`

:::
