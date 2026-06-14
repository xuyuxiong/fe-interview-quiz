---
title: 排序算法面试题
description: 覆盖冒泡/选择/插入/快排/归并/堆排序/计数排序等8道经典排序算法题
---

# 排序算法面试题

### Q1: 冒泡排序的原理和实现

> **⭐ 简单 · 排序基础**

请描述冒泡排序的工作原理，并手写实现代码。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
function bubbleSort(arr) {
  const n = arr.length
  for (let i = 0; i < n - 1; i++) {
    let swapped = false
    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
        swapped = true
      }
    }
    if (!swapped) break
  }
  return arr
}
```

**知识点：** `交换排序` `稳定排序` `O(n²)`

:::

### Q2: 选择排序与插入排序的区别

> **⭐ 简单 · 排序对比**

请说明选择排序和插入排序的核心区别，并分别实现。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**选择排序：** 每次从未排序部分选择最小元素放到已排序部分末尾

**插入排序：** 每次将未排序元素插入到已排序部分的正确位置

```js
// 选择排序
function selectionSort(arr) {
  const n = arr.length
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
  }
  return arr
}

// 插入排序
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i]
    let j = i - 1
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j]
      j--
    }
    arr[j + 1] = key
  }
  return arr
}
```

**知识点：** `选择排序` `插入排序` `原地排序`

:::

### Q3: 快速排序的实现与优化

> **🔥 中等 · 分治算法**

请实现快速排序，并说明三路快排和随机化的优化点。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 基础快排
function quickSort(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return arr
  const pivotIdx = partition(arr, left, right)
  quickSort(arr, left, pivotIdx - 1)
  quickSort(arr, pivotIdx + 1, right)
  return arr
}

function partition(arr, left, right) {
  const pivot = arr[right]
  let i = left
  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]]
      i++
    }
  }
  [arr[i], arr[right]] = [arr[right], arr[i]]
  return i
}

// 三路快排（处理大量重复元素）
function quickSort3Way(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return arr
  const { lt, gt } = partition3Way(arr, left, right)
  quickSort3Way(arr, left, lt - 1)
  quickSort3Way(arr, gt + 1, right)
  return arr
}

function partition3Way(arr, left, right) {
  const pivot = arr[left]
  let lt = left
  let i = left + 1
  let gt = right
  while (i <= gt) {
    if (arr[i] < pivot) {
      [arr[lt], arr[i]] = [arr[i], arr[lt]]
      lt++
      i++
    } else if (arr[i] > pivot) {
      [arr[i], arr[gt]] = [arr[gt], arr[i]]
      gt--
    } else {
      i++
    }
  }
  return { lt, gt }
}

// 随机化快排（避免最坏情况）
function randomQuickSort(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return arr
  const randomIdx = Math.floor(Math.random() * (right - left + 1)) + left
  [arr[randomIdx], arr[right]] = [arr[right], arr[randomIdx]]
  const pivotIdx = partition(arr, left, right)
  randomQuickSort(arr, left, pivotIdx - 1)
  randomQuickSort(arr, pivotIdx + 1, right)
  return arr
}
```

**知识点：** `三路快排` `随机化` `重复元素优化`

:::

### Q4: 归并排序实现

> **🔥 中等 · 分治算法**

请实现归并排序，并分析其时间复杂度。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
function mergeSort(arr) {
  if (arr.length <= 1) return arr
  const mid = Math.floor(arr.length / 2)
  const left = mergeSort(arr.slice(0, mid))
  const right = mergeSort(arr.slice(mid))
  return merge(left, right)
}

function merge(left, right) {
  const result = []
  let i = 0, j = 0
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) {
      result.push(left[i++])
    } else {
      result.push(right[j++])
    }
  }
  return result.concat(left.slice(i)).concat(right.slice(j))
}

// 原地归并（空间优化）
function mergeSortInPlace(arr, temp = [], left = 0, right = arr.length - 1) {
  if (left >= right) return arr
  const mid = Math.floor((left + right) / 2)
  mergeSortInPlace(arr, temp, left, mid)
  mergeSortInPlace(arr, temp, mid + 1, right)
  mergeInPlace(arr, temp, left, mid, right)
  return arr
}

function mergeInPlace(arr, temp, left, mid, right) {
  for (let i = left; i <= right; i++) temp[i] = arr[i]
  let i = left, j = mid + 1, k = left
  while (i <= mid && j <= right) {
    if (temp[i] <= temp[j]) arr[k++] = temp[i++]
    else arr[k++] = temp[j++]
  }
  while (i <= mid) arr[k++] = temp[i++]
}
```

**知识点：** `归并排序` `稳定排序` `O(nlogn)`

:::

### Q5: 堆排序实现

> **💀 困难 · 堆数据结构**

请实现堆排序，并解释建堆和调整堆的过程。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
function heapSort(arr) {
  const n = arr.length
  // 建堆（从最后一个非叶子节点开始）
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i)
  }
  // 依次取出堆顶元素
  for (let i = n - 1; i > 0; i--) {
    [arr[0], arr[i]] = [arr[i], arr[0]]
    heapify(arr, i, 0)
  }
  return arr
}

function heapify(arr, n, i) {
  let largest = i
  const left = 2 * i + 1
  const right = 2 * i + 2
  if (left < n && arr[left] > arr[largest]) largest = left
  if (right < n && arr[right] > arr[largest]) largest = right
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]]
    heapify(arr, n, largest)
  }
}
```

**知识点：** `大顶堆` `完全二叉树` `O(nlogn)`

:::

### Q6: 计数排序与桶排序

> **🔥 中等 · 非比较排序**

请实现计数排序，并说明其适用场景。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 计数排序（适用于整数且范围已知）
function countingSort(arr, minVal, maxVal) {
  const range = maxVal - minVal + 1
  const count = new Array(range).fill(0)
  for (const num of arr) {
    count[num - minVal]++
  }
  const result = []
  for (let i = 0; i < range; i++) {
    while (count[i] > 0) {
      result.push(i + minVal)
      count[i]--
    }
  }
  return result
}

// 桶排序
function bucketSort(arr, bucketSize = 5) {
  if (arr.length === 0) return arr
  const minVal = Math.min(...arr)
  const maxVal = Math.max(...arr)
  const bucketCount = Math.floor((maxVal - minVal) / bucketSize) + 1
  const buckets = Array.from({ length: bucketCount }, () => [])
  for (const num of arr) {
    buckets[Math.floor((num - minVal) / bucketSize)].push(num)
  }
  return buckets.flatMap(bucket => insertionSort(bucket))
}
```

**知识点：** `计数排序` `桶排序` `空间换时间`

:::

### Q7: Array.sort() 底层原理

> **💀 困难 · 浏览器原理**

请解释 JavaScript 中 Array.sort() 的底层实现原理。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 引擎 | 算法 | 说明 |
|------|------|------|
| V8 (Chrome/Node) | TimSort | 归并排序 + 插入排序的混合 |
| SpiderMonkey (Firefox) | TimSort | 同上 |
| JavaScriptCore (Safari) | 快速排序 | 部分版本使用 |

**TimSort 特点：**
1. 识别数组中的有序片段（run）
2. 对短 run 使用插入排序
3. 对长 run 使用归并排序
4. 稳定排序，保持相等元素相对位置
5. 最好情况 O(n)，最坏情况 O(nlogn)

```js
// V8 中 sort 的大致逻辑
function timSort(arr) {
  const MIN_MERGE = 32
  // 1. 找到自然 runs
  // 2. 对短 runs 进行 galloping 模式
  // 3. 归并相邻 runs
  // 4. 使用临时数组优化
}
```

**知识点：** `TimSort` `V8 引擎` `稳定排序`

:::

### Q8: 排序算法复杂度对比

> **⭐ 简单 · 算法分析**

请完成以下排序算法的时间空间复杂度对比表。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 算法 | 最好时间 | 平均时间 | 最坏时间 | 空间 | 稳定性 |
|------|----------|----------|----------|------|--------|
| 冒泡排序 | O(n) | O(n²) | O(n²) | O(1) | 稳定 |
| 选择排序 | O(n²) | O(n²) | O(n²) | O(1) | 不稳定 |
| 插入排序 | O(n) | O(n²) | O(n²) | O(1) | 稳定 |
| 快速排序 | O(nlogn) | O(nlogn) | O(n²) | O(logn) | 不稳定 |
| 归并排序 | O(nlogn) | O(nlogn) | O(nlogn) | O(n) | 稳定 |
| 堆排序 | O(nlogn) | O(nlogn) | O(nlogn) | O(1) | 不稳定 |
| 计数排序 | O(n+k) | O(n+k) | O(n+k) | O(k) | 稳定 |
| 桶排序 | O(n+k) | O(n+k) | O(n²) | O(n+k) | 稳定 |

**知识点：** `时间复杂度` `空间复杂度` `稳定性`

:::
### Q9: 手写快速排序

> **🔥 中等 · 排序算法**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 方法1: 简单版（易懂，但空间 O(n)）
function quickSort(arr) {
  if (arr.length <= 1) return arr

  const pivot = arr[Math.floor(arr.length / 2)]
  const left = arr.filter(x => x < pivot)
  const middle = arr.filter(x => x === pivot)
  const right = arr.filter(x => x > pivot)

  return [...quickSort(left), ...middle, ...quickSort(right)]
}

// 方法2: 原地排序（标准实现，空间 O(log n)）
function quickSortInPlace(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return arr

  const pivotIndex = partition(arr, left, right)
  quickSortInPlace(arr, left, pivotIndex - 1)
  quickSortInPlace(arr, pivotIndex + 1, right)
  return arr
}

function partition(arr, left, right) {
  const pivot = arr[right]  // 选最右为基准
  let i = left

  for (let j = left; j < right; j++) {
    if (arr[j] < pivot) {
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      i++
    }
  }
  ;[arr[i], arr[right]] = [arr[right], arr[i]]
  return i
}

// 方法3: 随机化快排（避免最坏情况）
function randomizedQuickSort(arr, left = 0, right = arr.length - 1) {
  if (left >= right) return arr

  // 随机选 pivot
  const randIndex = left + Math.floor(Math.random() * (right - left + 1))
  ;[arr[randIndex], arr[right]] = [arr[right], arr[randIndex]]

  const pivotIndex = partition(arr, left, right)
  randomizedQuickSort(arr, left, pivotIndex - 1)
  randomizedQuickSort(arr, pivotIndex + 1, right)
  return arr
}

// 测试
console.log(quickSort([3, 6, 8, 10, 1, 2, 1]))
// [1, 1, 2, 3, 6, 8, 10]
```

| 版本 | 时间 | 空间 | 稳定性 |
|------|------|------|--------|
| 简单版 | O(n log n) | O(n) | ✅ 稳定 |
| 原地版 | O(n log n) | O(log n) | ❌ 不稳定 |
| 随机化 | O(n log n) 期望 | O(log n) | ❌ 不稳定 |

**知识点：** `快速排序` `分治` `原地排序` `partition` `时间复杂度`

:::

### Q10: 堆排序的原理和实现？

> **🔥 中等 · 排序**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**堆排序原理：**

```
1. 构建大顶堆（升序）或小顶堆（降序）
2. 将堆顶元素与末尾元素交换
3. 缩小堆的范围，重新调整堆
4. 重复步骤 2-3 直到堆为空
```

**实现代码：**

```js
// 大顶堆 - 升序排序
function heapSort(arr) {
  const n = arr.length
  
  // 1. 构建大顶堆（从最后一个非叶子节点开始）
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(arr, n, i)
  }
  
  // 2. 依次将堆顶元素与末尾交换
  for (let i = n - 1; i > 0; i--) {
    // 交换堆顶和当前末尾
    swap(arr, 0, i)
    // 重新调整堆（范围缩小）
    heapify(arr, i, 0)
  }
  
  return arr
}

// 堆调整（维护大顶堆性质）
function heapify(arr, heapSize, i) {
  let largest = i
  const left = 2 * i + 1
  const right = 2 * i + 2
  
  // 和左右子节点比较
  if (left < heapSize && arr[left] > arr[largest]) {
    largest = left
  }
  if (right < heapSize && arr[right] > arr[largest]) {
    largest = right
  }
  
  // 如果最大值不是当前节点，交换并继续调整
  if (largest !== i) {
    swap(arr, i, largest)
    heapify(arr, heapSize, largest)
  }
}

function swap(arr, i, j) {
  [arr[i], arr[j]] = [arr[j], arr[i]]
}

// 测试
console.log(heapSort([4, 10, 3, 5, 1]))
// [1, 3, 4, 5, 10]
```

**复杂度分析：**

| 指标 | 值 |
|------|-----|
| 时间复杂度 | O(n log n) - 最好/最坏/平均 |
| 空间复杂度 | O(1) - 原地排序 |
| 稳定性 | ❌ 不稳定 |

**堆排序特点：**

```text
优点:
├─ 时间复杂度稳定 O(n log n)
├─ 空间复杂度 O(1)
└─ 适合数据量大、内存有限的场景

缺点:
├─ 不稳定排序（相同元素可能交换）
├─ 实际性能不如快速排序（缓存不友好）
└─ 建堆过程有较多比较
```

**与快速排序对比：**

| 特性 | 堆排序 | 快速排序 |
|------|--------|----------|
| 时间 | O(n log n) | O(n log n) 平均 |
| 最坏情况 | O(n log n) | O(n²) |
| 空间 | O(1) | O(log n) |
| 稳定性 | ❌ | ❌ |
| 实际性能 | 较慢 | 较快 |

**知识点：** `堆排序` `大顶堆` `堆调整` `原地排序` `不稳定排序`

:::

### Q11: 计数排序和桶排序的适用场景？

> **🔥 中等 · 排序**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**计数排序（Counting Sort）：**

```js
function countingSort(arr, max) {
  // 1. 创建计数数组
  const count = new Array(max + 1).fill(0)
  
  // 2. 统计每个元素出现次数
  for (const num of arr) {
    count[num]++
  }
  
  // 3. 累加计数（确定位置）
  for (let i = 1; i < count.length; i++) {
    count[i] += count[i - 1]
  }
  
  // 4. 反向填充结果数组（保证稳定性）
  const result = new Array(arr.length)
  for (let i = arr.length - 1; i >= 0; i--) {
    result[count[arr[i]] - 1] = arr[i]
    count[arr[i]]--
  }
  
  return result
}

// 使用示例
const arr = [4, 2, 2, 8, 3, 3, 1]
console.log(countingSort(arr, 8))
// [1, 2, 2, 3, 3, 4, 8]
```

**桶排序（Bucket Sort）：**

```js
function bucketSort(arr, bucketCount = 5) {
  if (arr.length === 0) return arr
  
  // 1. 找最大值最小值
  const min = Math.min(...arr)
  const max = Math.max(...arr)
  
  // 2. 计算桶大小
  const bucketSize = Math.ceil((max - min + 1) / bucketCount)
  
  // 3. 创建桶
  const buckets = Array.from({ length: bucketCount }, () => [])
  
  // 4. 分配元素到桶
  for (const num of arr) {
    const index = Math.floor((num - min) / bucketSize)
    buckets[index].push(num)
  }
  
  // 5. 桶内排序（使用插入排序）
  for (const bucket of buckets) {
    insertionSort(bucket)
  }
  
  // 6. 合并桶
  return buckets.flat()
}

function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i]
    let j = i - 1
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j]
      j--
    }
    arr[j + 1] = key
  }
}

// 使用示例
console.log(bucketSort([42, 32, 33, 52, 37, 47, 51]))
// [32, 33, 37, 42, 47, 51, 52]
```

**适用场景对比：**

| 排序算法 | 时间复杂度 | 空间复杂度 | 适用场景 |
|----------|-----------|-----------|----------|
| 计数排序 | O(n + k) | O(k) | 整数范围小（k<<n） |
| 桶排序 | O(n + k) | O(n + k) | 数据均匀分布 |
| 基数排序 | O(d×n) | O(n + k) | 多位数/字符串 |

**计数排序适用：**
```
✅ 成绩统计（0-100 分）
✅ 年龄分布（0-150 岁）
✅ 字母频率统计
❌ 浮点数
❌ 范围过大的整数
```

**桶排序适用：**
```
✅ 均匀分布的浮点数
✅ 数据范围已知
✅ 可以分桶的场景
❌ 数据分布极度不均
```

**知识点：** `计数排序` `桶排序` `非比较排序` `线性时间排序` `稳定性`

:::

### Q12: 排序算法的稳定性是什么？哪些排序是稳定的？

> **⭐ 简单 · 排序**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**稳定性定义：**

```
排序后，相等元素的相对位置保持不变。

原数组：[(4, A), (3, B), (4, C), (2, D)]
        ↑数字       ↑括号内为标记

稳定排序结果：[(2, D), (3, B), (4, A), (4, C)]
              ↑ 4A 仍在 4C 前面 ✅

不稳定排序结果：[(2, D), (3, B), (4, C), (4, A)]
                ↑ 4A 和 4C 交换了 ❌
```

**常见排序算法稳定性：**

| 排序算法 | 稳定性 | 原因 |
|----------|--------|------|
| 冒泡排序 | ✅ 稳定 | 相邻元素比较，相等不交换 |
| 插入排序 | ✅ 稳定 | 从后往前找位置，相等时停在后面 |
| 归并排序 | ✅ 稳定 | 合并时相等元素先取左边的 |
| 计数排序 | ✅ 稳定 | 反向填充保证原顺序 |
| 桶排序 | ✅ 稳定 | 依赖桶内稳定排序 |
| 快速排序 | ❌ 不稳定 | partition 时长距离交换 |
| 选择排序 | ❌ 不稳定 | 选择最小值与前面交换 |
| 堆排序 | ❌ 不稳定 | 堆调整破坏原顺序 |
| 希尔排序 | ❌ 不稳定 | 分组插入破坏稳定性 |

**代码示例：为什么快速排序不稳定**

```js
// 不稳定示例
arr = [4a, 4b, 2]
     ↑    ↑
     
// pivot = 4b，partition 后
arr = [2, 4b, 4a]
         ↑    ↑
// 4a 和 4b 的相对位置改变了！
```

**稳定性的重要意义：**

```
场景：对学生按成绩排序后，再按姓名排序

1. 第一次排序（成绩）：
   [(90, 张三), (85, 李四), (90, 王五)]

2. 第二次排序（姓名，稳定）：
   [(85, 李四), (90, 张三), (90, 王五)]
   ↑ 成绩相同时，保持姓名顺序

3. 如果不稳定：
   [(85, 李四), (90, 王五), (90, 张三)]
   ↑ 成绩相同的人顺序乱了！
```

**记忆口诀：**

```
稳定排序：
"快（快速）选（选择）堆（堆）一（希尔）家（基数）"
  └─ 这些是不稳定的，其他基本稳定
```

**知识点：** `排序稳定性` `稳定排序` `不稳定排序` `算法特性`

:::
