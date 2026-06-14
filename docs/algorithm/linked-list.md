---
title: 链表面试题
description: 覆盖反转/环检测/合并/删除等8道经典链表题
---

# 链表面试题

### Q1: 反转链表（递归 + 迭代）

> **⭐ 简单 · 链表基础**

请分别用递归和迭代两种方式实现链表反转。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 链表节点定义
class ListNode {
  constructor(val, next = null) {
    this.val = val
    this.next = next
  }
}

// 迭代法
function reverseListIterative(head) {
  let prev = null
  let curr = head
  while (curr) {
    const nextTemp = curr.next
    curr.next = prev
    prev = curr
    curr = nextTemp
  }
  return prev
}

// 递归法
function reverseListRecursive(head) {
  if (!head || !head.next) return head
  const newHead = reverseListRecursive(head.next)
  head.next.next = head
  head.next = null
  return newHead
}
```

**知识点：** `链表反转` `递归` `迭代` `双指针`

:::

### Q2: 检测链表环（快慢指针）

> **🔥 中等 · 链表基础**

请实现检测链表中是否存在环的算法，并找出环的入口。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// Floyd 判圈算法（快慢指针）
function hasCycle(head) {
  if (!head || !head.next) return false
  let slow = head
  let fast = head.next
  while (fast && fast.next) {
    if (slow === fast) return true
    slow = slow.next
    fast = fast.next.next
  }
  return false
}

// 找出环的入口
function detectCycleEntry(head) {
  if (!head || !head.next) return null
  let slow = head
  let fast = head
  // 1. 找到相遇点
  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) break
  }
  if (!fast || !fast.next) return null
  // 2. 从头和相遇点同时出发，相遇点即为入口
  slow = head
  while (slow !== fast) {
    slow = slow.next
    fast = fast.next
  }
  return slow
}
```

**知识点：** `Floyd 判圈` `快慢指针` `数学证明`

:::

### Q3: 合并两个有序链表

> **⭐ 简单 · 链表操作**

请实现合并两个升序链表的函数。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 迭代法
function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0)
  let curr = dummy
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      curr.next = l1
      l1 = l1.next
    } else {
      curr.next = l2
      l2 = l2.next
    }
    curr = curr.next
  }
  curr.next = l1 || l2
  return dummy.next
}

// 递归法
function mergeTwoListsRecursive(l1, l2) {
  if (!l1) return l2
  if (!l2) return l1
  if (l1.val <= l2.val) {
    l1.next = mergeTwoListsRecursive(l1.next, l2)
    return l1
  } else {
    l2.next = mergeTwoListsRecursive(l1, l2.next)
    return l2
  }
}
```

**知识点：** `归并思想` `虚拟头节点` `递归`

:::

### Q4: 删除倒数第 N 个节点

> **🔥 中等 · 链表操作**

请实现删除链表倒数第 N 个节点的函数。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 快慢指针（一趟扫描）
function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head)
  let fast = dummy
  let slow = dummy
  // fast 先走 n+1 步
  for (let i = 0; i <= n; i++) {
    fast = fast.next
  }
  // 同时前进直到 fast 到达末尾
  while (fast) {
    fast = fast.next
    slow = slow.next
  }
  // 删除 slow 的下一个节点
  slow.next = slow.next.next
  return dummy.next
}

// 两趟扫描（先计算长度）
function removeNthFromEndTwoPass(head, n) {
  let length = 0
  let curr = head
  while (curr) {
    length++
    curr = curr.next
  }
  const dummy = new ListNode(0, head)
  curr = dummy
  for (let i = 0; i < length - n; i++) {
    curr = curr.next
  }
  curr.next = curr.next.next
  return dummy.next
}
```

**知识点：** `快慢指针` `虚拟头节点` `倒数第 N 个`

:::

### Q5: 链表中间节点

> **⭐ 简单 · 链表基础**

请实现找到链表中间节点的函数（如有两个中间节点，返回第二个）。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
function middleNode(head) {
  let slow = head
  let fast = head
  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
  }
  return slow
}

// 如果有两个中间节点返回第一个（改动：fast 从 head.next 开始）
function middleNodeFirst(head) {
  let slow = head
  let fast = head.next
  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
  }
  return slow
}
```

**知识点：** `快慢指针` `中间节点`

:::

### Q6: 相交链表的起始点

> **🔥 中等 · 链表操作**

请实现找到两个相交链表相交起始节点的函数。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 双指针法（A+B = B+A）
function getIntersectionNode(headA, headB) {
  if (!headA || !headB) return null
  let pA = headA
  let pB = headB
  while (pA !== pB) {
    pA = pA ? pA.next : headB
    pB = pB ? pB.next : headA
  }
  return pA
}

// 哈希表法
function getIntersectionNodeHash(headA, headB) {
  const visited = new Set()
  let curr = headA
  while (curr) {
    visited.add(curr)
    curr = curr.next
  }
  curr = headB
  while (curr) {
    if (visited.has(curr)) return curr
    curr = curr.next
  }
  return null
}
```

**知识点：** `双指针技巧` `哈希表` `相交链表`

:::

### Q7: LRU 缓存（双向链表实现）

> **💀 困难 · 数据结构设计**

请使用双向链表 + 哈希表实现 LRU 缓存。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.map = new Map()
    this.head = new Node(0, 0)
    this.tail = new Node(0, 0)
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  get(key) {
    if (!this.map.has(key)) return -1
    const node = this.map.get(key)
    this._remove(node)
    this._addToTail(node)
    return node.value
  }

  put(key, value) {
    if (this.map.has(key)) {
      this._remove(this.map.get(key))
    }
    const node = new Node(key, value)
    this._addToTail(node)
    this.map.set(key, node)
    if (this.map.size > this.capacity) {
      const first = this.head.next
      this._remove(first)
      this.map.delete(first.key)
    }
  }

  _addToTail(node) {
    node.prev = this.tail.prev
    node.next = this.tail
    this.tail.prev.next = node
    this.tail.prev = node
  }

  _remove(node) {
    node.prev.next = node.next
    node.next.prev = node.prev
  }
}

class Node {
  constructor(key, value) {
    this.key = key
    this.value = value
    this.prev = null
    this.next = null
  }
}
```

**知识点：** `LRU` `双向链表` `哈希表` `O(1) 操作`

:::

### Q8: 链表排序（归并排序）

> **💀 困难 · 链表排序**

请使用归并排序实现链表排序（O(nlogn) 时间，O(1) 空间）。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
function sortList(head) {
  if (!head || !head.next) return head
  // 1. 找到中间节点（快慢指针）
  let slow = head
  let fast = head
  let prev = null
  while (fast && fast.next) {
    prev = slow
    slow = slow.next
    fast = fast.next.next
  }
  prev.next = null // 断开链表
  // 2. 递归排序
  const left = sortList(head)
  const right = sortList(slow)
  // 3. 合并
  return mergeSortedLists(left, right)
}

function mergeSortedLists(l1, l2) {
  const dummy = new ListNode(0)
  let curr = dummy
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      curr.next = l1
      l1 = l1.next
    } else {
      curr.next = l2
      l2 = l2.next
    }
    curr = curr.next
  }
  curr.next = l1 || l2
  return dummy.next
}
```

**知识点：** `归并排序` `链表分割` `O(1) 空间`

:::
### Q9: 用栈实现队列

> **⭐ 简单 · 数据结构**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**思路：** 两个栈，一个负责入队（push栈），一个负责出队（pop栈）。

```js
class MyQueue {
  constructor() {
    this.pushStack = []  // 入队栈
    this.popStack = []   // 出队栈
  }

  // 入队 — O(1)
  push(x) {
    this.pushStack.push(x)
  }

  // 出队 — 均摊 O(1)
  pop() {
    if (this.popStack.length === 0) {
      this._transfer()
    }
    return this.popStack.pop()
  }

  // 查看队首
  peek() {
    if (this.popStack.length === 0) {
      this._transfer()
    }
    return this.popStack[this.popStack.length - 1]
  }

  // 判空
  empty() {
    return this.pushStack.length === 0 && this.popStack.length === 0
  }

  // 将 pushStack 全部倒入 popStack
  _transfer() {
    while (this.pushStack.length) {
      this.popStack.push(this.pushStack.pop())
    }
  }
}

// 测试
const queue = new MyQueue()
queue.push(1)
queue.push(2)
queue.push(3)
console.log(queue.peek())  // 1
console.log(queue.pop())   // 1
console.log(queue.pop())   // 2
queue.push(4)
console.log(queue.pop())   // 3
console.log(queue.pop())   // 4
console.log(queue.empty()) // true
```

**均摊复杂度分析：** 每个元素最多被 push 两次、pop 两次，均摊每次操作 O(1)。

**知识点：** `栈` `队列` `均摊复杂度` `双栈`

:::

### Q10: 判断链表是否有环

> **⭐ 简单 · 数据结构**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 方法1: 快慢指针（推荐）— O(n) 时间, O(1) 空间
function hasCycle(head) {
  let slow = head
  let fast = head

  while (fast && fast.next) {
    slow = slow.next       // 慢指针走1步
    fast = fast.next.next  // 快指针走2步
    if (slow === fast) return true  // 相遇 = 有环
  }
  return false
}

// 方法2: Set 记录 — O(n) 时间, O(n) 空间
function hasCycleSet(head) {
  const visited = new Set()
  let curr = head
  while (curr) {
    if (visited.has(curr)) return true
    visited.add(curr)
    curr = curr.next
  }
  return false
}

// 进阶：找到环的入口节点
function detectCycle(head) {
  let slow = head
  let fast = head

  // 第一次相遇
  while (fast && fast.next) {
    slow = slow.next
    fast = fast.next.next
    if (slow === fast) {
      // 从 head 和相遇点同时走，再次相遇即为入口
      let ptr = head
      while (ptr !== slow) {
        ptr = ptr.next
        slow = slow.next
      }
      return ptr  // 环的入口
    }
  }
  return null
}
```

**为什么快慢指针一定能相遇？**

```text
设环长 c，快指针每次比慢指针多走 1 步
在环内，快指针以相对速度 1 追赶慢指针
最多 c 步必然相遇（c 为环的长度）
```

**知识点：** `链表环` `快慢指针` `Floyd算法` `环入口`

:::

### Q11: 合并两个有序链表？

> **🔥 中等 · 链表**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**迭代解法（推荐）：**

```js
function mergeTwoLists(l1, l2) {
  // 虚拟头节点
  const dummy = new ListNode(0)
  let current = dummy
  
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      current.next = l1
      l1 = l1.next
    } else {
      current.next = l2
      l2 = l2.next
    }
    current = current.next
  }
  
  // 连接剩余部分
  current.next = l1 || l2
  
  return dummy.next
}
```

**递归解法：**

```js
function mergeTwoLists(l1, l2) {
  if (!l1) return l2
  if (!l2) return l1
  
  if (l1.val <= l2.val) {
    l1.next = mergeTwoLists(l1.next, l2)
    return l1
  } else {
    l2.next = mergeTwoLists(l1, l2.next)
    return l2
  }
}
```

**复杂度分析：**

| 方法 | 时间复杂度 | 空间复杂度 |
|------|-----------|-----------|
| 迭代 | O(m + n) | O(1) |
| 递归 | O(m + n) | O(m + n) |

**知识点：** `链表合并` `虚拟头节点` `递归` `迭代`

:::

### Q12: 链表的归并排序？

> **🔥 中等 · 链表**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**链表归并排序实现：**

```js
function sortList(head) {
  // 空链表或单节点
  if (!head || !head.next) return head
  
  // 1. 找中点（快慢指针）
  let slow = head
  let fast = head
  let prev = null
  
  while (fast && fast.next) {
    prev = slow
    slow = slow.next
    fast = fast.next.next
  }
  
  // 2. 断开链表
  prev.next = null
  
  // 3. 递归排序左右两部分
  const left = sortList(head)
  const right = sortList(slow)
  
  // 4. 合并有序链表
  return merge(left, right)
}

function merge(l1, l2) {
  const dummy = new ListNode(0)
  let current = dummy
  
  while (l1 && l2) {
    if (l1.val <= l2.val) {
      current.next = l1
      l1 = l1.next
    } else {
      current.next = l2
      l2 = l2.next
    }
    current = current.next
  }
  
  current.next = l1 || l2
  return dummy.next
}
```

**为什么链表适合归并排序？**

```text
1. 归并排序时间复杂度 O(n log n)，适合链表
2. 链表可以 O(1) 空间合并（不像数组需要额外空间）
3. 快慢指针可以 O(1) 找到中点
4. 不需要随机访问，适合链表特性
```

**复杂度：**
- 时间：O(n log n)
- 空间：O(log n) - 递归栈

**知识点：** `归并排序` `链表排序` `快慢指针` `分治`

:::

### Q13: 判断链表是否是回文？

> **🔥 中等 · 链表**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**方案一：数组辅助（简单）**

```js
function isPalindrome(head) {
  const values = []
  let current = head
  
  while (current) {
    values.push(current.val)
    current = current.next
  }
  
  // 双指针判断回文
  let left = 0
  let right = values.length - 1
  
  while (left < right) {
    if (values[left] !== values[right]) return false
    left++
    right--
  }
  
  return true
}
```

**方案二：反转后半部分（O(1) 空间）**

```js
function isPalindrome(head) {
  if (!head || !head.next) return true
  
  // 1. 找中点
  let slow = head
  let fast = head
  
  while (fast.next && fast.next.next) {
    slow = slow.next
    fast = fast.next.next
  }
  
  // 2. 反转后半部分
  let secondHalf = slow.next
  slow.next = null  // 断开
  
  let prev = null
  let current = secondHalf
  
  while (current) {
    const next = current.next
    current.next = prev
    prev = current
    current = next
  }
  
  // 3. 比较前后两部分
  let left = head
  let right = prev
  
  while (left && right) {
    if (left.val !== right.val) return false
    left = left.next
    right = right.next
  }
  
  // 4. 恢复链表（可选）
  // ...反转回去
  
  return true
}
```

**方案三：递归（优雅但栈空间 O(n)）**

```js
function isPalindrome(head) {
  let left = head
  
  function recurse(right) {
    if (!right) return true
    
    // 递归到末尾
    const isPalin = recurse(right.next)
    
    // 后序遍历，从后往前比较
    const result = isPalin && (left.val === right.val)
    left = left.next
    
    return result
  }
  
  return recurse(head)
}
```

**复杂度对比：**

| 方案 | 时间 | 空间 | 修改原链表 |
|------|------|------|-----------|
| 数组 | O(n) | O(n) | 否 |
| 反转 | O(n) | O(1) | 是 |
| 递归 | O(n) | O(n) | 否 |

**知识点：** `回文链表` `快慢指针` `链表反转` `双指针`

:::
