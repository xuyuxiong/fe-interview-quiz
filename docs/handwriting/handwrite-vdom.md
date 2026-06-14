---
title: 手写虚拟 DOM
description: Virtual DOM、diff 算法、patch 函数实现
---

# 手写虚拟 DOM

---

### Q1: 实现 VNode 和 h 函数

> **⭐ 简单 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// VNode 类型
const VNodeTypes = {
  ELEMENT: 1,
  TEXT: 2,
  COMPONENT: 3
}

// 虚拟节点
function createVNode(type, props, children) {
  return {
    type,
    props: props || {},
    children: children || [],
    el: null,  // 真实 DOM 引用
    key: props?.key || null
  }
}

// h 函数 - 创建虚拟节点
function h(type, props, children) {
  // 处理 children
  if (typeof type === 'function') {
    // 组件
    return createVNode(VNodeTypes.COMPONENT, props, children)
  }
  
  // 字符串转文本节点
  if (typeof children === 'string' || typeof children === 'number') {
    children = String(children)
  }
  
  return createVNode(VNodeTypes.ELEMENT, { type, ...props }, children)
}

// 使用示例
const vnode = h('div', { id: 'app', class: 'container' }, [
  h('h1', {}, 'Hello'),
  h('p', {}, 'World')
])
```

**知识点:**`VNode` `h函数` `虚拟节点`

:::

---

### Q2: 实现简单的 mount 函数

> **🔥 中等 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function mount(vnode, container) {
  const el = vnode.type === VNodeTypes.TEXT
    ? document.createTextNode(vnode.children)
    : document.createElement(vnode.props.type)
  
  vnode.el = el
  
  // 设置属性
  const { props, children } = vnode
  
  for (const key in props) {
    if (key === 'type') continue
    if (key.startsWith('on')) {
      const event = key.slice(2).toLowerCase()
      el.addEventListener(event, props[key])
    } else if (key === 'style') {
      Object.assign(el.style, props[key])
    } else {
      el.setAttribute(key, props[key])
    }
  }
  
  // 递归挂载子节点
  if (Array.isArray(children)) {
    for (const child of children) {
      if (typeof child === 'string' || typeof child === 'number') {
        const textNode = document.createTextNode(String(child))
        el.appendChild(textNode)
        vnode.el = el
      } else {
        mount(child, el)
      }
    }
  } else if (children) {
    mount(children, el)
  }
  
  container.appendChild(el)
  return el
}

// 使用
const app = h('div', { id: 'app' }, [
  h('button', { onclick: () => alert('clicked') }, 'Click')
])
mount(app, document.body)
```

**知识点:**`mount` `渲染` `递归`

:::

---

### Q3: 实现 unmount 函数

> **🔥 中等 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function unmount(vnode) {
  if (!vnode || !vnode.el) return
  
  const { type, children } = vnode
  
  // 子组件卸载
  if (type === VNodeTypes.COMPONENT && vnode.component) {
    vnode.component.unmount()
  }
  
  // 递归卸载子节点
  if (children && typeof children !== 'string') {
    const childNodes = Array.isArray(children) ? children : [children]
    childNodes.forEach(unmount)
  }
  
  // 移除真实 DOM
  if (vnode.el.parentNode) {
    vnode.el.parentNode.removeChild(vnode.el)
  }
  
  vnode.el = null
}

// 使用
function cleanup() {
  unmount(app)
}
```

**知识点:**`unmount` `卸载` `递归`

:::

---

### Q4: 手写简单的 diff 算法

> **💀 困难 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function patch(n1, n2, container) {
  // 类型不同，直接替换
  if (n1.type !== n2.type) {
    const index = Array.from(container.children)
      .indexOf(n1.el)
    const newEl = mount(n2, container)
    container.removeChild(n1.el)
    return
  }
  
  const el = (n2.el = n1.el)
  const { props: p1, children: c1 } = n1
  const { props: p2, children: c2 } = n2
  
  // 更新 props
  patchProps(el, p1, p2)
  
  // 更新子节点
  patchChildren(c1, c2, el)
}

function patchProps(el, oldProps, newProps) {
  // 移除旧属性
  for (const key in oldProps) {
    if (!(key in newProps)) {
      if (key.startsWith('on')) {
        el.removeEventListener(
          key.slice(2).toLowerCase(),
          oldProps[key]
        )
      } else {
        el.removeAttribute(key)
      }
    }
  }
  
  // 添加新属性
  for (const key in newProps) {
    if (oldProps[key] === newProps[key]) continue
    
    if (key.startsWith('on')) {
      el.addEventListener(
        key.slice(2).toLowerCase(),
        newProps[key]
      )
    } else if (key === 'style') {
      Object.assign(el.style, newProps[key])
    } else {
      el.setAttribute(key, newProps[key])
    }
  }
}

function patchChildren(c1, c2, parent) {
  // 文本节点
  if (typeof c2 === 'string' || typeof c2 === 'number') {
    if (c1 !== c2) {
      parent.textContent = c2
    }
  }
  // 数组 diff（简化）
  else if (Array.isArray(c2)) {
    const len1 = c1?.length || 0
    const len2 = c2.length
    const common = Math.min(len1, len2)
    
    for (let i = 0; i < common; i++) {
      patch(c1[i], c2[i], parent)
    }
    
    // 添加新节点
    for (let i = common; i < len2; i++) {
      mount(c2[i], parent)
    }
    
    // 移除多余节点
    for (let i = common; i < len1; i++) {
      unmount(c1[i])
    }
  }
}
```

**知识点:**`diff` `同层比较` `属性更新`

:::

---

### Q5: 实现带 key 的 diff 算法（同层比较）

> **💀 困难 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function patchKeyedChildren(c1, c2, parent) {
  let i = 0
  const len1 = c1.length
  const len2 = c2.length
  const minLen = Math.min(len1, len2)
  
  // 1. 从头比较相同节点
  while (i < minLen && hasSameKey(c1[i], c2[i])) {
    patch(c1[i], c2[i], parent)
    i++
  }
  
  // 2. 从尾比较相同节点
  let j1 = len1 - 1
  let j2 = len2 - 1
  while (j1 >= i && j2 >= i && hasSameKey(c1[j1], c2[j2])) {
    patch(c1[j1], c2[j2], parent)
    j1--
    j2--
  }
  
  // 3. 新节点多于旧节点 - 添加
  if (i > j2) {
    while (j1 >= i) unmount(c1[j1--])
  }
  // 4. 旧节点多于新节点 - 移除
  else if (i > j1) {
    while (j2 >= i) {
      mount(c2[j2], parent, c2[j2 + 1]?.el || null)
      j2--
    }
  }
  // 5. 中间部分需要 diff
  else {
    const source = new Array(j2 - i + 1).fill(-1)
    const keyIndex = new Map()
    
    for (let k = i; k <= j2; k++) {
      keyIndex.set(c2[k].key, k)
    }
    
    let moved = false
    let patched = 0
    
    for (let k = i; k <= j1; k++) {
      const oldVNode = c1[k]
      const newIndex = keyIndex.get(oldVNode.key)
      
      if (newIndex === undefined) {
        unmount(oldVNode)
      } else {
        patch(oldVNode, c2[newIndex], parent)
        source[newIndex - i] = k
        if (newIndex < k) moved = true
        patched++
      }
    }
    
    // 使用 LIS 优化移动
    if (moved && patched > 0) {
      const lis = longestIncreasingSubsequence(source)
      let lisIdx = lis.length - 1
      for (let k = j2; k >= i; k--) {
        if (source[k - i] === -1) {
          mount(c2[k], parent, c2[k + 1]?.el || null)
        } else if (k !== lis[lisIdx]) {
          move(c2[k], parent, c2[k + 1]?.el || null)
        } else {
          lisIdx--
        }
      }
    }
  }
}

function hasSameKey(n1, n2) {
  return n1.key !== undefined && n1.key === n2.key
}

function longestIncreasingSubsequence(arr) {
  const result = []
  const prev = []
  
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === -1) continue
    
    const pos = binarySearch(result, arr[i])
    result[pos] = i
    prev[i] = pos