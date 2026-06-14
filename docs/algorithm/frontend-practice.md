---
title: 算法手写代码题库
description: 前端面试常见算法手写代码题目与答案解析
---

### Q1: 如何实现 lodash.get 功能？

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function get(obj, path, defaultValue) {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result === undefined ? defaultValue : result;
}

// 使用
const obj = { a: { b: { c: 1 } } };
get(obj, 'a.b.c');           // 1
get(obj, 'a.b.d', 'default'); // 'default'
```

**知识点：**`lodash.get` `路径访问` `递归`

:::

### Q2: 如何实现 groupBy 分组函数？

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function groupBy(arr, iteratee) {
  return arr.reduce((result, item) => {
    const key = typeof iteratee === 'function' 
      ? iteratee(item) 
      : item[iteratee];
    
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {});
}

// 使用
const nums = [1.2, 2.3, 3.4, 4.5];
groupBy(nums, Math.floor);  // {1: [1.2], 2: [2.3], 3: [3.4], 4: [4.5]}

const users = [{age: 20}, {age: 25}, {age: 20}];
groupBy(users, 'age');  // {20: [...], 25: [...]}
```

**知识点：**`groupBy` `分组` `reduce`

:::

### Q3: 如何实现失败重试策略？

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
async function retry(fn, times = 3, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (times <= 0) throw error;
    
    await new Promise(resolve => 
      setTimeout(resolve, delay)
    );
    
    return retry(fn, times - 1, delay * 2);  // 指数退避
  }
}

// 使用
retry(() => fetch('/api/data'), 3, 1000);
```

**知识点：**`重试` `递归` `Promise` `指数退避`

:::

### Q4: 如何删除连续重复的字符？

> **⭐ 简单 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function removeDuplicates(s) {
  if (!s) return '';
  
  const stack = [];
  for (const char of s) {
    if (stack[stack.length - 1] !== char) {
      stack.push(char);
    }
  }
  return stack.join('');
}

// 使用
removeDuplicates('aaabbbccc');  // 'abc'
removeDuplicates('aabbccaa');   // 'abca'
```

**知识点：**`栈` `去重` `字符串`

:::

### Q5: 如何实现大数相加？

> **💀 困难 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function addBigNumbers(num1, num2) {
  let i = num1.length - 1, j = num2.length - 1;
  let carry = 0, result = '';
  
  while (i >= 0 || j >= 0 || carry) {
    const sum = (num1[i] || 0) + (num2[j] || 0) + carry;
    result = (sum % 10) + result;
    carry = Math.floor(sum / 10);
    i--; j--;
  }
  
  return result;
}

// 使用
addBigNumbers('999', '1');  // '1000'
addBigNumbers('123456789', '987654321');  // '1111111110'
```

**知识点：**`大数相加` `字符串` `进位`

:::

### Q6: 如何实现数字千分位格式化？

> **⭐ 简单 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 使用
formatNumber(1234567);  // '1,234,567'
formatNumber(1000);     // '1,000'

// 小数处理
function formatDecimal(num, decimals = 2) {
  return num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
formatDecimal(1234567.89);  // '1,234,567.89'
```

**知识点：**`正则` `千分位` `格式化`

:::

### Q7: 如何判断完全二叉树？

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function isCompleteTree(root) {
  if (!root) return true;
  
  const queue = [root];
  let hasNull = false;
  
  while (queue.length > 0) {
    const node = queue.shift();
    
    if (node === null) {
      hasNull = true;
    } else {
      if (hasNull) return false;  // 出现空节点后又有非空节点
      queue.push(node.left);
      queue.push(node.right);
    }
  }
  
  return true;
}
```

**知识点：**`完全二叉树` `BFS` `层序遍历`

:::

### Q8: 如何实现简单的模板引擎？

> **💀 困难 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function render(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : '';
  });
}

// 支持嵌套
function renderDeep(template, data) {
  return template.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
    return path.split('.').reduce((obj, key) => obj?.[key], data) || '';
  });
}

// 使用
render('Hello {{name}}!', { name: 'World' });  // 'Hello World!'
renderDeep('Hello {{user.name}}!', { user: { name: 'World' } });
```

**知识点：**`模板引擎` `正则` `字符串替换`

:::

### Q9: 完全二叉树的节点计数

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 普通 BFS
function countNodes(root) {
  if (!root) return 0;
  const queue = [root];
  let count = 0;
  while (queue.length) {
    const node = queue.shift();
    count++;
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return count;
}

// 优化：利用完全二叉树特性
function countNodesOptimized(root) {
  if (!root) return 0;
  
  let left = root, right = root;
  let leftHeight = 0, rightHeight = 0;
  
  while (left) { left = left.left; leftHeight++; }
  while (right) { right = right.right; rightHeight++; }
  
  if (leftHeight === rightHeight) {
    return Math.pow(2, leftHeight) - 1;  // 满二叉树
  }
  
  return 1 + countNodesOptimized(root.left) + countNodesOptimized(root.right);
}
```

**知识点：**`完全二叉树` `节点计数` `优化`

:::

### Q10: 如何用栈实现队列？

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class StackQueue {
  constructor() {
    this.inStack = [];
    this.outStack = [];
  }
  
  push(x) {
    this.inStack.push(x);
  }
  
  pop() {
    this._move();
    return this.outStack.pop();
  }
  
  peek() {
    this._move();
    return this.outStack[this.outStack.length - 1];
  }
  
  _move() {
    if (this.outStack.length === 0) {
      while (this.inStack.length > 0) {
        this.outStack.push(this.inStack.pop());
      }
    }
  }
}
```

**知识点：**`栈` `队列` `数据结构`

:::

### Q11: 如何检测链表是否有环？

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 快慢指针
function hasCycle(head) {
  if (!head || !head.next) return false;
  
  let slow = head, fast = head;
  
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    
    if (slow === fast) return true;
  }
  
  return false;
}

// 找环入口
function detectCycle(head) {
  let slow = head, fast = head;
  
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    
    if (slow === fast) {
      let ptr = head;
      while (ptr !== slow) {
        ptr = ptr.next;
        slow = slow.next;
      }
      return ptr;  // 环入口
    }
  }
  
  return null;
}
```

**知识点：**`链表` `环检测` `快慢指针`

:::

### Q12: LCS 最长公共子序列

> **💀 困难 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function longestCommonSubsequence(text1, text2) {
  const m = text1.length, n = text2.length;
  const dp = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  return dp[m][n];
}

// 使用
longestCommonSubsequence('abcde', 'ace');  // 3
```

**知识点：**`LCS` `动态规划` `子序列`

:::

### Q13: 快速排序实现

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// 原地版本
function quickSortInPlace(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return;
  
  const pivotIndex = partition(arr, left, right);
  quickSortInPlace(arr, left, pivotIndex - 1);
  quickSortInPlace(arr, pivotIndex + 1, right);
  
  return arr;
}

function partition(arr, left, right) {
  const pivot = arr[right];
  let i = left;
  
  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[right]] = [arr[right], arr[i]];
  return i;
}
```

**知识点：**`快速排序` `排序算法` `分治`

:::

### Q14: 二叉树的右视图

> **💀 困难 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
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
```

**知识点：**`二叉树` `BFS` `右视图`

:::

### Q15: 翻转二叉树

> **⭐ 简单 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function invertTree(root) {
  if (!root) return null;
  
  [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];
  
  return root;
}

// 迭代版本
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
```

**知识点：**`二叉树` `翻转` `递归`

:::

### Q16: 手写 reduce 实现

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
Array.prototype.myReduce = function(callback, initialValue) {
  if (this === null) {
    throw new TypeError('Array is null');
  }
  
  const arr = Object(this);
  const len = arr.length >>> 0;
  
  let accumulator = initialValue;
  let startIndex = 0;
  
  if (initialValue === undefined) {
    if (len === 0) {
      throw new TypeError('Reduce of empty array with no initial value');
    }
    accumulator = arr[0];
    startIndex = 1;
  }
  
  for (let i = startIndex; i < len; i++) {
    if (i in arr) {
      accumulator = callback(accumulator, arr[i], i, arr);
    }
  }
  
  return accumulator;
};

// 使用
[1, 2, 3].myReduce((sum, n) => sum + n, 0);  // 6
```

**知识点：**`reduce` `数组方法` `实现`

:::

### Q17: 拼手气红包算法

> **💀 困难 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 二倍均值法
function redPacket(total, count) {
  const result = [];
  let remaining = total;
  let remainingCount = count;
  
  for (let i = 0; i < count - 1; i++) {
    // 随机范围：[0.01, 剩余均值 * 2]
    const max = (remaining / remainingCount) * 2;
    const amount = Math.random() * max + 0.01;
    
    result.push(parseFloat(amount.toFixed(2)));
    remaining -= amount;
    remainingCount--;
  }
  
  // 最后一个红包
  result.push(parseFloat(remaining.toFixed(2)));
  
  return result;
}

// 使用
redPacket(100, 10);  // [8.23, 12.45, 5.67, ...]
```

**知识点：**`红包算法` `随机` `二倍均值法`

:::

### Q18: 版本号排序

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function versionSort(versions) {
  return versions.sort((a, b) => {
    const partsA = a.split('.').map(Number);
    const partsB = b.split('.').map(Number);
    
    const len = Math.max(partsA.length, partsB.length);
    
    for (let i = 0; i < len; i++) {
      const numA = partsA[i] || 0;
      const numB = partsB[i] || 0;
      
      if (numA !== numB) {
        return numA - numB;
      }
    }
    
    return 0;
  });
}

// 使用
versionSort(['1.0.0', '1.2.0', '1.10.0', '2.0.0', '1.1.0']);
// ['1.0.0', '1.1.0', '1.2.0', '1.10.0', '2.0.0']
```

**知识点：**`版本号` `排序` `字符串比较`

:::

### Q19: 二叉树的最大深度

> **⭐ 简单 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// DFS 递归
function maxDepth(root) {
  if (!root) return 0;
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

// BFS 迭代
function maxDepthBFS(root) {
  if (!root) return 0;
  
  const queue = [root];
  let depth = 0;
  
  while (queue.length > 0) {
    const size = queue.length;
    depth++;
    
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
  }
  
  return depth;
}
```

**知识点：**`二叉树` `深度` `DFS` `BFS`

:::

### Q20: 判断子集（含重复元素）

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

### Q21: 手写 query 链式调用

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

### Q22: 手写 lastPromise（连续请求只取最后一次结果）

> **🔥 中等 · algorithm/frontend-practice**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 场景：搜索框输入，连续发请求，只有最后一次返回结果才展示
function lastPromise(fn) {
  let lastId = 0
  return function (...args) {
    const currentId = ++lastId
    return fn.apply(this, args).then(result => {
      if (currentId === lastId) return result  // 只返回最新的
      return new Promise(() => {})              // 旧请求永不 resolve
    })
  }
}

// 使用示例
const fetchSearch = lastPromise(keyword =>
  fetch(`/api/search?q=${keyword}`).then(r => r.json())
)

// 连续触发 3 次搜索
fetchSearch('a')  // 被丢弃
fetchSearch('ab') // 被丢弃
fetchSearch('abc') // ✅ 只有这次的结果会返回
```

**原理：** 每次调用递增 `lastId`，异步回调中比较 `currentId === lastId`，只有最新的请求才 resolve，旧请求返回一个永远不 resolve 的 Promise（相当于忽略）。

**对比其他方案：**

| 方案 | 原理 | 特点 |
|------|------|------|
| lastPromise | 闭包 ID 比较 | 简洁，Promise 永不 reject |
| AbortController | 取消请求 | 真正中断网络请求 |
| debounce | 延迟执行 | 只执行最后一次触发 |

**知识点：**`lastPromise` `闭包` `异步控制` `竞态问题` `Promise`

:::