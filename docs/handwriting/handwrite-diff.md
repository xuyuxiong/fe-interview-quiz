---
title: 手写 Diff 算法面试题
description: 覆盖 React/Vue Diff 策略/key 作用/列表 Diff 等 8 道题
---

# 手写 Diff 算法面试题

### Q1: React Diff 三策略

> **🔥 中等 · Diff 原理**

请解释 React Diff 算法的三大策略。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React Diff 三大策略：**

### 1. Tree Diff（树层级比较）
- 只对同层节点进行比较，不跨层级
- 如果节点类型不同，直接替换整个树
- **时间复杂度：O(n)**

```js
function diffTree(oldTree, newTree) {
  // 类型不同，直接替换
  if (oldTree.type !== newTree.type) {
    return { type: 'REPLACE', tree: newTree }
  }
  
  // 类型相同，继续比较子节点
  return diffChildren(oldTree.children, newTree.children)
}
```

### 2. Component Diff（组件级比较）
- 同一组件类型：认为结构相同，继续 diff
- 不同组件类型：销毁重建
- 可通过 `shouldComponentUpdate` 或 `React.memo` 优化

```js
function diffComponent(oldComp, newComp) {
  if (oldComp.type === newComp.type) {
    // 更新 props
    return updateProps(oldComp.props, newComp.props)
  } else {
    // 销毁旧组件，创建新组件
    return { type: 'REPLACE', component: newComp }
  }
}
```

### 3. Element Diff（元素级比较）
- 使用 key 标识同层元素
- key 相同：复用节点
- key 不同：创建新节点
- 无 key：使用索引（不推荐）

```js
function diffElement(oldElm, newElm) {
  if (oldElm.key === newElm.key) {
    // 复用节点，只更新属性
    return updateAttributes(oldElm, newElm)
  }
  // key 不同，替换
  return { type: 'REPLACE', element: newElm }
}
```

**优化建议：**
- 稳定且可预测的 key
- 避免使用 index 作为 key
- 列表项移动时，key 保持不变

**知识点：** `React Diff` `三策略` `key 作用`

:::

### Q2: Vue2 双端对比算法

> **💀 困难 · Vue Diff**

请实现 Vue 2 的双端对比 Diff 算法。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// Vue2 双端 Diff 实现
function patchChildren(oldVNodes, newVNodes, parentElm) {
  let oldStartIdx = 0
  let oldEndIdx = oldVNodes.length - 1
  let newStartIdx = 0
  let newEndIdx = newVNodes.length - 1
  
  let oldStartVNode = oldVNodes[0]
  let oldEndVNode = oldVNodes[oldEndIdx]
  let newStartVNode = newVNodes[0]
  let newEndVNode = newVNodes[newEndIdx]
  
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    // 1. 旧头与新头对比
    if (sameVNode(oldStartVNode, newStartVNode)) {
      patchVNode(oldStartVNode, newStartVNode)
      oldStartVNode = oldVNodes[++oldStartIdx]
      newStartVNode = newVNodes[++newStartIdx]
    }
    // 2. 旧尾与新尾对比
    else if (sameVNode(oldEndVNode, newEndVNode)) {
      patchVNode(oldEndVNode, newEndVNode)
      oldEndVNode = oldVNodes[--oldEndIdx]
      newEndVNode = newVNodes[--newEndIdx]
    }
    // 3. 旧头与新尾对比
    else if (sameVNode(oldStartVNode, newEndVNode)) {
      patchVNode(oldStartVNode, newEndVNode)
      parentElm.insertBefore(oldStartVNode.elm, oldEndVNode.elm.nextSibling)
      oldStartVNode = oldVNodes[++oldStartIdx]
      newEndVNode = newVNodes[--newEndIdx]
    }
    // 4. 旧尾与新头对比
    else if (sameVNode(oldEndVNode, newStartVNode)) {
      patchVNode(oldEndVNode, newStartVNode)
      parentElm.insertBefore(oldEndVNode.elm, oldStartVNode.elm)
      oldEndVNode = oldVNodes[--oldEndIdx]
      newStartVNode = newVNodes[++newStartIdx]
    }
    // 5. 都不匹配，通过 key 查找
    else {
      const keyToIdx = buildKeyMap(oldVNodes, oldStartIdx, oldEndIdx)
      const idxInOld = keyToIdx.get(newStartVNode.key)
      
      if (idxInOld !== undefined) {
        const vnodeToMove = oldVNodes[idxInOld]
        patchVNode(vnodeToMove, newStartVNode)
        oldVNodes[idxInOld] = null
        parentElm.insertBefore(vnodeToMove.elm, oldStartVNode.elm)
      } else {
        // 新节点，创建
        parentElm.insertBefore(createElm(newStartVNode), oldStartVNode.elm)
      }
      newStartVNode = newVNodes[++newStartIdx]
    }
  }
  
  // 处理剩余节点
  if (oldStartIdx > oldEndIdx) {
    // 还有新节点未处理
    for (let i = newStartIdx; i <= newEndIdx; i++) {
      parentElm.insertBefore(createElm(newVNodes[i]), oldVNodes[oldStartIdx]?.elm || null)
    }
  } else if (newStartIdx > newEndIdx) {
    // 还有旧节点需要删除
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      if (oldVNodes[i]) removeVNode(oldVNodes[i])
    }
  }
}

function sameVNode(a, b) {
  return a.key === b.key && a.tag === b.tag
}

function buildKeyMap(vnodes, start, end) {
  const map = new Map()
  for (let i = start; i <= end; i++) {
    if (vnodes[i] && vnodes[i].key != null) {
      map.set(vnodes[i].key, i)
    }
  }
  return map
}
```

**知识点：** `Vue2 Diff` `双端对比` `指针移动`

:::

### Q3: Vue3 最长递增子序列

> **💀 困难 · Vue3 Diff**

请解释 Vue3 使用最长递增子序列（LIS）优化 Diff 的原理。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Vue3 Diff 优化：**

Vue3 在双端对比基础上，使用 LIS 算法减少 DOM 移动操作。

```js
// Vue3 patchKeyedChildren 简化版
function patchKeyedChildren(c1, c2, container, anchor) {
  let i = 0
  const l2 = c2.length
  let e1 = c1.length - 1
  let e2 = l2 - 1
  
  // 1. 同步头部
  while (i <= e1 && i <= e2) {
    if (!sameVNodeType(c1[i], c2[i])) break
    patch(c1[i], c2[i], container, null)
    i++
  }
  
  // 2. 同步尾部
  while (i <= e1 && i <= e2) {
    if (!sameVNodeType(c1[e1], c2[e2])) break
    patch(c1[e1], c2[e2], container, null)
    e1--
    e2--
  }
  
  // 3. 处理中间部分
  if (i > e1 && i <= e2) {
    // 新节点比旧节点多，需要添加
    for (let j = i; j <= e2; j++) {
      mount(c2[j], container, anchor)
    }
  } else if (i > e2 && i <= e1) {
    // 旧节点比新节点多，需要删除
    for (let j = i; j <= e1; j++) {
      unmount(c1[j])
    }
  } else {
    // 4. 通用情况：使用 LIS 优化
    const s1 = i
    const s2 = i
    const source = new Array(e2 - s2 + 1).fill(-1)
    const keyToNewIdx = new Map()
    
    for (let j = s2; j <= e2; j++) {
      keyToNewIdx.set(c2[j].key, j)
    }
    
    let moved = false
    let patched = 0
    
    for (let j = s1; j <= e1; j++) {
      const oldVNode = c1[j]
      const newIdx = keyToNewIdx.get(oldVNode.key)
      
      if (newIdx === undefined) {
        unmount(oldVNode)
      } else {
        patch(oldVNode, c2[newIdx], container, null)
        source[newIdx - s2] = j
        if (newIdx < patched) moved = true
        else patched = newIdx
      }
    }
    
    // 5. 使用 LIS 找到最少移动
    const increasingSeq = moved ? getSequence(source) : []
    let j = increasingSeq.length - 1
    
    for (let i = e2 - s2; i >= 0; i--) {
      const next = s2 + i
      const anchor = c2[next + 1]?.elm || anchor
      if (source[i] === -1) {
        mount(c2[next], container, anchor)
      } else if (moved) {
        if (j < 0 || i !== increasingSeq[j]) {
          move(c2[next], container, anchor)
        } else {
          j--
        }
      }
    }
  }
}

// 最长递增子序列（O(nlogn)）
function getSequence(arr) {
  const p = arr.slice()
  const result = [0]
  
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === -1) continue
    
    const lastIdx = result[result.length - 1]
    if (arr[i] > arr[lastIdx]) {
      p[i] = lastIdx
      result.push(i)
      continue
    }
    
    // 二分查找
    let left = 0
    let right = result.length - 1
    while (left < right) {
      const mid = (left + right) >> 1
      if (arr[result[mid]] < arr[i]) left = mid + 1
      else right = mid
    }
    
    if (arr[i] < arr[result[left]]) {
      if (left > 0) p[i] = result[left - 1]
      result[left] = i
    }
  }
  
  // 重建路径
  let len = result.length
  let last = result[len - 1]
  while (len-- > 0) {
    result[len] = last
    last = p[last]
  }
  
  return result
}
```

**知识点：** `Vue3 Diff` `LIS` `最少移动`

:::

### Q4: key 的作用

> **⭐ 简单 · key 原理**

请解释 Diff 中 key 的作用。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**key 的核心作用：**

1. **唯一标识**：帮助算法识别节点身份
2. **复用节点**：key 相同则复用，避免重建
3. **减少移动**：准确计算节点位置变化

```js
// 有 key 的情况
const oldList = [
  { key: 'a', text: 'A' },
  { key: 'b', text: 'B' },
  { key: 'c', text: 'C' }
]

const newList = [
  { key: 'b', text: 'B Changed' },  // key 相同，复用，只更新文本
  { key: 'a', text: 'A' },          // key 相同，复用，移动位置
  { key: 'c', text: 'C' },          // key 相同，复用
  { key: 'd', text: 'D' }           // 新 key，创建
]
// 结果：复用 3 个，移动 1 个，创建 1 个

// 无 key（使用索引）的情况
const oldList = ['A', 'B', 'C']
const newList = ['B', 'A', 'C', 'D']
// 索引对比：每个位置都不同
// 结果：可能重建所有节点！
```

**key 的最佳实践：**

```js
// ❌ 不好的做法：使用索引
items.map((item, index) => <Item key={index} />)

// ❌ 不好的做法：使用随机值
items.map(item => <Item key={Math.random()} />)

// ✅ 好的做法：使用稳定唯一 ID
items.map(item => <Item key={item.id} />)

// ✅ 好的做法：组合 key
items.map(item => <Item key={`${type}-${item.id}`} />)
```

**知识点：** `key` `节点复用` `性能优化`

:::

### Q5: 同层比较原理

> **🔥 中等 · Diff 策略**

请解释为什么 Diff 只在同层进行比较。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**同层比较原理：**

React/Vue 的 Diff 算法只在同一层级比较节点，不会跨层级比较。

**原因：**
1. **性能考虑**：跨层级 diff 复杂度 O(n³)，同层是 O(n)
2. **实际场景**：DOM 树中跨层级移动节点极少见

```js
// 同层比较示例
<div>
  <Header />  <!-- 只和同层的其他节点比较 -->
  <Content>
    <p>...</p>  <!-- 只和 Content 内的其他 p 比较 -->
  </Content>
  <Footer />
</div>

// 跨层级移动（不推荐）
// 旧结构
<div>
  <ul>
    <li>A</li>
  </ul>
</div>

// 新结构
<div>
  <li>A</li>  <!-- Diff 认为这是新节点，会删除重建 -->
</div>
```

**实现原理：**

```js
function diffTree(oldNode, newNode) {
  // 层级不同，直接替换
  if (oldNode.depth !== newNode.depth) {
    return replaceNode(oldNode, newNode)
  }
  
  // 同层级，继续 diff
  return diffSameLevel(oldNode, newNode)
}

function diffSameLevel(oldNode, newNode) {
  // 类型不同，替换
  if (oldNode.type !== newNode.type) {
    return replaceNode(oldNode, newNode)
  }
  
  // 类型相同，比较属性和子节点
  return {
    type: 'UPDATE',
    props: diffProps(oldNode.props, newNode.props),
    children: diffChildren(oldNode.children, newNode.children)
  }
}
```

**知识点：** `同层比较` `性能优化` `层级深度`

:::

### Q6: 列表 Diff（新增/删除/移动）

> **🔥 中等 · 列表操作**

请实现处理列表新增、删除、移动的 Diff 逻辑。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 列表 Diff 处理
function diffList(oldList, newList) {
  const operations = []
  const oldKeyMap = new Map()
  const newKeyMap = new Map()
  
  // 建立 key 映射
  oldList.forEach((item, idx) => oldKeyMap.set(item.key, { item, idx }))
  newList.forEach((item, idx) => newKeyMap.set(item.key, { item, idx }))
  
  // 1. 找出需要删除的
  oldList.forEach((oldItem, oldIdx) => {
    if (!newKeyMap.has(oldItem.key)) {
      operations.push({
        type: 'REMOVE',
        key: oldItem.key,
        fromIndex: oldIdx
      })
    }
  })
  
  // 2. 找出需要新增的
  newList.forEach((newItem, newIdx) => {
    if (!oldKeyMap.has(newItem.key)) {
      operations.push({
        type: 'ADD',
        key: newItem.key,
        toIndex: newIdx,
        item: newItem
      })
    }
  })
  
  // 3. 找出需要移动的
  newList.forEach((newItem, newIdx) => {
    const oldEntry = oldKeyMap.get(newItem.key)
    if (oldEntry && oldEntry.idx !== newIdx) {
      operations.push({
        type: 'MOVE',
        key: newItem.key,
        fromIndex: oldEntry.idx,
        toIndex: newIdx
      })
    }
  })
  
  // 4. 找出需要更新的
  newList.forEach((newItem, newIdx) => {
    const oldEntry = oldKeyMap.get(newItem.key)
    if (oldEntry && !isSameContent(oldEntry.item, newItem)) {
      operations.push({
        type: 'UPDATE',
        key: newItem.key,
        index: newIdx,
        oldItem: oldEntry.item,
        newItem
      })
    }
  })
  
  // 排序操作：先删除，再移动，最后添加（避免索引错乱）
  return sortOperations(operations)
}

// 优化：计算最少操作
function diffListOptimized(oldList, newList) {
  // 使用 LIS 找到不需要移动的节点
  const lis = findLISIndices(oldList, newList)
  const toMove = new Set()
  
  for (let i = 0; i < newList.length; i++) {
    if (!lis.includes(i)) {
      toMove.add(newList[i].key)
    }
  }
  
  return {
    keep: lis.map(i => newList[i].key),
    move: Array.from(toMove).map(key => {
      const oldIdx = oldList.findIndex(i => i.key === key)
      const newIdx = newList.findIndex(i => i.key === key)
      return { key, oldIdx, newIdx }
    })
  }
}
```

**知识点：** `列表 Diff` `CRUD 操作` `操作排序`

:::

### Q7: 文本节点处理

> **⭐ 简单 · 文本处理**

请说明 Diff 中如何处理文本节点。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 文本节点 Diff
function patchText(oldVNode, newVNode) {
  if (oldVNode.text !== newVNode.text) {
    oldVNode.elm.textContent = newVNode.text
  }
  return oldVNode.elm
}

// 文本节点 vs 元素节点
function patchNode(oldVNode, newVNode) {
  // 类型改变：文本变元素或反之
  if (oldVNode.type !== newVNode.type) {
    const newElm = createElm(newVNode)
    if (oldVNode.elm?.parentNode) {
      oldVNode.elm.parentNode.replaceChild(newElm, oldVNode.elm)
    }
    return newElm
  }
  
  // 都是文本节点
  if (oldVNode.isText()) {
    return patchText(oldVNode, newVNode)
  }
  
  // 都是元素节点
  return patchElement(oldVNode, newVNode)
}

// 子节点包含文本的情况
function patchChildren(oldChildren, newChildren) {
  // 都无子节点
  if (!oldChildren && !newChildren) return
  
  // 旧无子节点，新有
  if (!oldChildren) {
    newChildren.forEach(child => {
      parentElm.appendChild(createElm(child))
    })
    return
  }
  
  // 旧有子节点，新无
  if (!newChildren) {
    oldChildren.forEach(child => {
      if (child.elm) parentElm.removeChild(child.elm)
    })
    return
  }
  
  // 都有子节点
  patchChildrenDiff(oldChildren, newChildren)
}

// 纯文本子节点优化
function patchTextChildren(parentElm, oldText, newText) {
  if (oldText !== newText) {
    parentElm.textContent = newText
  }
}
```

**知识点：** `文本节点` `textContent` `类型判断`

:::

### Q8: React vs Vue Diff 性能对比

> **💀 困难 · 框架对比**

请对比 React 和 Vue 的 Diff 算法性能差异。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React vs Vue Diff 对比：**

| 特性 | React 18 | Vue 3 |
|------|----------|-------|
| 算法 | Fiber 架构 + 启发式 | 双端对比 + LIS |
| key 要求 | 必需（列表） | 可选，但推荐 |
| 更新粒度 | 组件级 | 细粒度（基于依赖追踪） |
| 时间切片 | ✅ | ❌（编译时优化） |
| Diff 触发 | setState/reRender | 响应式更新 |

**性能差异分析：**

```js
// React：组件级更新
// 父组件渲染会导致所有子组件重新 diff
function Parent() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <h1>{count}</h1>
      <Child />  {/* 即使 Child props 没变也会 diff */}
    </div>
  )
}

// 优化：React.memo
const MemoChild = React.memo(Child)

// Vue：细粒度更新
// 只有依赖数据变化的组件会更新
const App = {
  setup() {
    const count = ref(0)
    const name = ref('Vue')
    // count 变化不会触发依赖 name 的组件更新
    return { count, name }
  }
}
```

**性能优化对比：**

1. **React 优化手段：**
   - React.memo（组件记忆）
   - useMemo/useCallback（值/函数记忆）
   - key 优化
   - 代码分割

2. **Vue 优化手段：**
   - 编译时静态标记（PatchFlags）
   - 缓存事件处理函数
   - 基于依赖的精确更新
   - v-once / v-memo

**知识点：** `Diff 对比` `性能分析` `框架差异`

:::