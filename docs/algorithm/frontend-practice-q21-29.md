### Q21: 手写快排

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 标准快排实现
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivotIndex = Math.floor(arr.length / 2);
  const pivot = arr[pivotIndex];
  const left = [];
  const right = [];
  const equal = [pivot];
  
  for (let i = 0; i < arr.length; i++) {
    if (i === pivotIndex) continue;
    if (arr[i] < pivot) left.push(arr[i]);
    else if (arr[i] > pivot) right.push(arr[i]);
    else equal.push(arr[i]);
  }
  
  return [...quickSort(left), ...equal, ...quickSort(right)];
}

// 原地快排（空间 O(logn)）
function quickSortInPlace(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return;
  
  const pivotIndex = partition(arr, left, right);
  quickSortInPlace(arr, left, pivotIndex - 1);
  quickSortInPlace(arr, pivotIndex + 1, right);
  
  return arr;
}

function partition(arr, left, right) {
  const pivot = arr[right];
  let i = left - 1;
  
  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
  return i + 1;
}

// 使用
console.log(quickSort([3, 6, 1, 5, 2, 4]));  // [1,2,3,4,5,6]
```

**复杂度分析：**
- 时间：平均 O(nlogn)，最坏 O(n²)
- 空间：O(logn) 递归栈
- 不稳定排序

**知识点：**`快速排序` `分治` `partition` `原地排序`

:::

### Q22: 二叉树右视图

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// BFS 方法：每层最后一个节点
function rightSideView(root) {
  if (!root) return [];
  
  const result = [];
  const queue = [root];
  
  while (queue.length > 0) {
    const size = queue.length;
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      // 每层最后一个节点
      if (i === size - 1) {
        result.push(node.val);
      }
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  
  return result;
}

// DFS 方法：先右后左，记录每层第一个访问的节点
function rightSideViewDFS(root) {
  const result = [];
  
  function dfs(node, depth) {
    if (!node) return;
    // 第一次到达该深度
    if (depth === result.length) {
      result.push(node.val);
    }
    // 先右后左
    dfs(node.right, depth + 1);
    dfs(node.left, depth + 1);
  }
  
  dfs(root, 0);
  return result;
}

// 使用
//     1
//    / \
//   2   3
//    \   \
//     5   4
// 输出：[1, 3, 4]
```

**知识点：**`BFS` `DFS` `二叉树` `层序遍历`

:::

### Q23: 翻转二叉树

> **⭐ 简单 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 递归解法
function invertTree(root) {
  if (!root) return null;
  
  // 交换左右子树
  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
  
  return root;
}

// 迭代解法（BFS）
function invertTreeIterative(root) {
  if (!root) return null;
  
  const queue = [root];
  while (queue.length > 0) {
    const node = queue.shift();
    [node.left, node.right] = [node.right, node.left];
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return root;
}

// 使用
//     4
//    / \
//   2   7
//  / \ / \
// 1  3 6  9
// 翻转后
//     4
//    / \
//   7   2
//  / \ / \
// 9  6 3  1
```

**知识点：**`二叉树` `递归` `DFS`

:::

### Q24: 栈实现队列

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class QueueWithStacks {
  constructor() {
    this.inStack = [];
    this.outStack = [];
  }
  
  // 入队 O(1)
  push(x) {
    this.inStack.push(x);
  }
  
  // 出队 O(1) 均摊
  pop() {
    this._shift();
    return this.outStack.pop();
  }
  
  // 查看队首 O(1) 均摊
  peek() {
    this._shift();
    return this.outStack[this.outStack.length - 1];
  }
  
  // 是否为空
  empty() {
    return this.inStack.length === 0 && this.outStack.length === 0;
  }
  
  // 将 inStack 倒入 outStack
  _shift() {
    if (this.outStack.length === 0) {
      while (this.inStack.length > 0) {
        this.outStack.push(this.inStack.pop());
      }
    }
  }
}

// 使用
const queue = new QueueWithStacks();
queue.push(1);
queue.push(2);
console.log(queue.pop());  // 1
console.log(queue.peek()); // 2
```

**复杂度分析：**
- push: O(1)
- pop: O(1) 均摊，最坏 O(n)
- 空间：O(n)

**知识点：**`栈` `队列` `数据结构` `均摊分析`

:::

### Q25: 判断完全二叉树

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// BFS 层序遍历
function isCompleteTree(root) {
  if (!root) return true;
  
  const queue = [root];
  let metNull = false;  // 是否遇到过 null
  
  while (queue.length > 0) {
    const node = queue.shift();
    
    if (node === null) {
      metNull = true;
    } else {
      // 遇到过 null 后又出现非 null 节点 → 不是完全二叉树
      if (metNull) return false;
      queue.push(node.left);
      queue.push(node.right);
    }
  }
  
  return true;
}

// 使用
//     1
//    / \
//   2   3
//  /   /
// 4   5
// 不是完全二叉树（3 的左子树存在但 2 的右子树缺失）
```

**知识点：**`完全二叉树` `BFS` `层序遍历`

:::

### Q26: 链表环检测

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 快慢指针（Floyd 判圈算法）
function hasCycle(head) {
  if (!head || !head.next) return false;
  
  let slow = head;
  let fast = head.next;
  
  while (fast && fast.next) {
    if (slow === fast) return true;
    slow = slow.next;
    fast = fast.next.next;
  }
  
  return false;
}

// 找环的入口点
function detectCycleEntry(head) {
  const hasCycle = () => {
    let slow = head, fast = head;
    while (fast && fast.next) {
      slow = slow.next;
      fast = fast.next.next;
      if (slow === fast) return slow;
    }
    return null;
  };
  
  const meetPoint = hasCycle();
  if (!meetPoint) return null;
  
  // 从头和相遇点同时走，相遇处即为入口
  let ptr = head;
  while (ptr !== meetPoint) {
    ptr = ptr.next;
    meetPoint = meetPoint.next;
  }
  
  return ptr;
}

// 数学证明：
// 设起点到入口距离 a，入口到相遇点距离 b，相遇点回入口距离 c
// 快指针走的距离 = a + b + n(b+c)，慢指针 = a + b
// 2(a + b) = a + b + n(b+c) => a = (n-1)(b+c) + c
// 所以从头走和从相遇点走会在入口相遇
```

**知识点：**`快慢指针` `Floyd 算法` `链表` `数学证明`

:::

### Q27: 判断子集（含重复元素）

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 方法 1：排序 + 双指针
function isSubset(a, b) {
  // 判断 a 是否是 b 的子集（a 的所有元素都出现在 b 中）
  if (a.length > b.length) return false;
  
  // 排序
  a.sort((x, y) => x - y);
  b.sort((x, y) => x - y);
  
  let i = 0, j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
    } else if (a[i] < b[j]) {
      // a 中有元素 b 中没有
      return false;
    } else {
      j++;
    }
  }
  
  return i === a.length;
}

// 方法 2：HashMap 计数（更准确处理重复元素）
function isSubsetMap(a, b) {
  const countA = {};
  const countB = {};
  
  for (const x of a) countA[x] = (countA[x] || 0) + 1;
  for (const x of b) countB[x] = (countB[x] || 0) + 1;
  
  for (const key in countA) {
    if (!countB[key] || countB[key] < countA[key]) {
      return false;
    }
  }
  
  return true;
}

// 使用
isSubset([1, 2, 2], [1, 2, 3, 2]);  // true
isSubset([1, 2, 2, 2], [1, 2, 2]);  // false（a 中有 3 个 2，b 只有 2 个）
```

**知识点：**`双指针` `HashMap` `排序` `子集判断`

:::

### Q28: 手写 query 链式调用

> **💀 困难 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 链式 API 设计，懒执行
class Query {
  constructor(data) {
    this._data = data;
    this._operations = [];
  }
  
  // 收集操作，不立即执行
  where(condition) {
    this._operations.push({ type: 'filter', fn: condition });
    return this;
  }
  
  sortBy(key, order = 'asc') {
    this._operations.push({ type: 'sort', key, order });
    return this;
  }
  
  groupBy(key) {
    this._operations.push({ type: 'group', key });
    return this;
  }
  
  limit(n) {
    this._operations.push({ type: 'limit', n });
    return this;
  }
  
  // 懒执行：收集完所有操作后一次性执行
  execute() {
    let result = [...this._data];
    
    for (const op of this._operations) {
      switch (op.type) {
        case 'filter':
          result = result.filter(op.fn);
          break;
        case 'sort':
          result.sort((a, b) => {
            const val = op.order === 'asc' ? 1 : -1;
            return (a[op.key] - b[op.key]) * val;
          });
          break;
        case 'group':
          result = Object.values(result.reduce((acc, item) => {
            const key = item[op.key];
            (acc[key] = acc[key] || []).push(item);
            return acc;
          }, {}));
          break;
        case 'limit':
          result = result.slice(0, op.n);
          break;
      }
    }
    
    return result;
  }
}

// 使用
const users = [
  { name: 'Alice', age: 25, dept: 'Eng' },
  { name: 'Bob', age: 30, dept: 'Eng' },
  { name: 'Carol', age: 28, dept: 'Design' }
];

const result = new Query(users)
  .where(u => u.age > 25)
  .sortBy('age')
  .limit(2)
  .execute();

console.log(result);
```

**知识点：**`链式 API` `懒执行` `方法链` `设计模式`

:::

### Q29: 手写 get 方法（安全访问嵌套属性）

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 支持路径：'a.b.c' 或 'a[0].b' 或 'a.b[0].c'
function get(obj, path, defaultValue) {
  if (!obj || !path) return defaultValue;
  
  // 处理数组索引表示法 a[0].b => a.0.b
  const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
  const keys = normalizedPath.split('.').filter(k => k !== '');
  
  let result = obj;
  for (const key of keys) {
    if (result == null || !(key in Object(result))) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result !== undefined ? result : defaultValue;
}

// reduce 版本
function getReduce(obj, path, defaultValue) {
  return path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean)
    .reduce((acc, key) => acc?.[key], obj) ?? defaultValue;
}

// 使用
const obj = { a: { b: { c: 42 } } };
get(obj, 'a.b.c');              // 42
get(obj, 'a.b.d', 'default');   // 'default'
get(obj, 'a.x.y.z');            // undefined

const arr = { users: [{ name: 'Tom' }] };
get(arr, 'users[0].name');      // 'Tom'
get(arr, 'users[1].name', 'N/A'); // 'N/A'
```

**知识点：**`可选链` `路径解析` `reduce` `安全访问`

:::