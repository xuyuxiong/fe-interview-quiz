---
title: Vue 3 新特性面试题
description: Vue 3 核心新特性全解析，涵盖 Proxy、Composition API、Fragment、Teleport 等 8 道关键面试题
---

# Vue 3 新特性面试题

> **📚 共 8 题 · 简单 30% · 中等 50% · 困难 20%**

---

### Q1: Vue 3 的 Proxy 响应式系统相比 Vue 2 的 Object.defineProperty 有哪些改进？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心改进：**

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 属性检测 | 无法检测新增/删除 | 完全支持 |
| 数组处理 | 重写方法 | 原生支持 |
| 对象层级 | 递归定义 | 惰性代理 |

**示例对比：**

```js
// Vue 2
const obj = {}
Object.defineProperty(obj, 'a', { /* ... */ })
obj.b = 1  // 不会响应式

// Vue 3
const obj = new Proxy({}, {
  get(target, key) { /* ... */ },
  set(target, key, value) { /* ... */ }
})
obj.b = 1  // 自动响应式
```

**知识点：** `Proxy` `响应式改进`

:::

---

### Q2: Composition API 相比 Options API 有哪些优势？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心优势：**

1. **更好的代码复用**：通过 composables
2. **更灵活的代码组织**：按逻辑功能而非选项
3. **更好的 TypeScript 支持**
4. **更小的生产包体积**：tree-shaking
5. **没有 this 指向问题**

**知识点：** `Composition API`

:::

---

### Q3: 什么是 Fragment？它解决了什么问题？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Fragment 定义：**

支持多根节点组件，无需包装元素。

```vue
<!-- Vue 2 需要包装 -->
<template>
  <div>
    <header>...</header>
    <main>...</main>
    <footer>...</footer>
  </div>
</template>

<!-- Vue 3 支持多根 -->
<template>
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
</template>
```

**知识点：** `Fragment` `多根节点`

:::

---

### Q4: Teleport 传送门如何使用？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Teleport 用法：**

```vue
<Teleport to="body">
  <Modal v-if="showModal" />
</Teleport>
```

将组件内容渲染到指定 DOM 位置。

**知识点：** `Teleport` `传送门`

:::

---

### Q5: Suspense 如何处理异步组件？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Suspense 用法：**

```vue
<Suspense>
  <template #default>
    <AsyncComponent />
  </template>
  <template #fallback>
    Loading...
  </template>
</Suspense>
```

**async setup:**

```vue
<script setup>
const data = await fetchData()
</script>
```

**知识点：** `Suspense` `异步组件`

:::

---

### Q6: createRenderer 自定义渲染器有什么用途？

> **💀 困难 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**自定义渲染器实现：**

```js
import { createRenderer } from '@vue/runtime-core'

const { render } = createRenderer({
  createElement: (type) => createMyElement(type),
  insert: (el, parent) => parent.appendChild(el),
  // ... 其他方法
})
```

**适用场景：**

- 渲染到 Canvas
- 渲染到原生应用
- 渲染到终端

**知识点：** `createRenderer` `自定义渲染`

:::

---

### Q7: Vue 3 全局 API 有哪些变更？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**主要变更：**

```js
// Vue 2
Vue.component()
Vue.directive()

// Vue 3
import { createApp } from 'vue'
const app = createApp(App)
app.component()
app.directive()
```

**知识点：** `全局 API` `createApp`

:::

---

### Q8: Vue 3 的 v-model 有哪些新特性？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**新特性：**

1. **多 v-model 支持：**
```vue
<UserName v-model:first-name="first" v-model:last-name="last" />
```

2. **自定义修饰符：**
```vue
<Child v-model.capitalize="text" />
```

3. **props/事件名变更：**
- modelValue 替代 value
- update:modelValue 替代 input

**知识点：** `v-model` `多绑定`

:::

---

## 总结

| 特性 | 重要度 |
|------|--------|
| Proxy | 🔥🔥🔥 |
| Composition API | 🔥🔥🔥 |
| Fragment | 🔥🔥 |
| Teleport | 🔥🔥 |
| Suspense | 🔥🔥 |
| createRenderer | 🔥 |
| 全局 API | 🔥🔥 |
| v-model 变更 | 🔥🔥 |

---
### Q9: Fragment 是什么？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Fragment** 允许多个根节点，无需包裹在单个元素中。

**Vue 2 限制：**
```vue
<!-- ❌ 错误：多个根节点 -->
<template>
  <h1>Title</h1>
  <p>Content</p>
</template>

<!-- ✅ 必须包裹 -->
<template>
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
</template>
```

**Vue 3 Fragment：**
```vue
<!-- ✅ 直接多个根节点 -->
<template>
  <h1>Title</h1>
  <p>Content</p>
  <footer>Footer</footer>
</template>

<script setup>
// 编译后为 Fragment 节点
// 不产生额外 DOM 包裹
</script>
```

**使用场景：**

**1. 列表组件（无需额外 div）**
```vue
<template>
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
</template>

<!-- 渲染为 -->
<li>A</li>
<li>B</li>
<li>C</li>
```

**2. 条件渲染同层级**
```vue
<template>
  <button v-if="canEdit">编辑</button>
  <button v-if="canDelete">删除</button>
  <button v-if="canView">查看</button>
</template>
```

**3. 文本和元素混排**
```vue
<template>
  <slot />
  <span class="badge">{{ count }}</span>
</template>
```

**注意事项：**
- Fragment 不能作为 ref 目标
- 多根组件的 attrs 默认给第一个根
- 用 `$attrs` 手动指定应用位置

```vue
<script setup>
// 明确指定 attrs 应用
defineOptions({ inheritAttrs: false })
</script>

<template>
  <div v-bind="$attrs">内容 1</div>
  <div>内容 2（不接收 attrs）</div>
</template>
```

**知识点：** `Fragment` `多根节点` `Vue 3`

:::

### Q10: Suspense 组件如何使用？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Suspense** 处理异步组件的加载状态，提供 fallback UI。

**基本用法：**
```vue
<script setup>
import { Suspense } from 'vue'
import Dashboard from './Dashboard.vue'  // 内部有 async setup
</script>

<template>
  <Suspense>
    <template #default>
      <Dashboard />
    </template>
    <template #fallback>
      <div>Loading...</div>
    </template>
  </Suspense>
</template>
```

**异步组件：**
```vue
<!-- Dashboard.vue -->
<script setup>
const data = await fetchDashboard()
</script>

<template>
  <div>{{ data.title }}</div>
</template>

<!-- 等同于 -->
<script setup>
import { onServerPrefetch } from 'vue'
const data = ref(null)
onServerPrefetch(async () => {
  data.value = await fetchDashboard()
})
</script>
```

**事件处理：**
```vue
<Suspense
  @pending="onPending"
  @resolve="onResolve"
>
  <AsyncComponent />
  <template #fallback>
    <Spinner />
  </template>
</Suspense>

<script setup>
function onPending() { console.log('开始加载') }
function onResolve() { console.log('加载完成') }
</script>
```

**嵌套 Suspense：**
```vue
<Suspense>
  <Suspense>
    <DeepAsync />
    <template #fallback>Loading Deep...</template>
  </Suspense>
  <template #fallback>Loading...</template>
</Suspense>
```

**路由中使用：**
```vue
<router-view v-slot="{ Component }">
  <Suspense>
    <component :is="Component" />
    <template #fallback>
      <div class="loading">Loading route...</div>
    </template>
  </Suspense>
</router-view>
```

**注意事项：**
- 实验性特性（Vue 3.3+）
- async setup 只能有一个顶层 await
- SSR 支持完善

**知识点：** `Suspense` `异步组件` `Loading 状态`

:::

### Q11: EffectScope API 是什么？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**EffectScope** 用于组织和管理响应式副作用的生命周期。

**基本用法：**
```js
import { effectScope, ref, watch } from 'vue'

const scope = effectScope()

scope.run(() => {
  const count = ref(0)
  watch(count, (v) => console.log(v))
  
  // 所有副作用绑定到 scope
})

// 销毁时清理所有副作用
scope.stop()
```

**使用场景：**

**1. 组合函数清理**
```js
function useFeature() {
  const scope = effectScope()
  
  scope.run(() => {
    const data = ref(null)
    watch(data, handler)
  })
  
  onUnmounted(() => {
    scope.stop()  // 清理所有副作用
  })
  
  return { data }
}
```

**2. 独立响应式系统**
```js
// 创建独立的响应式环境
const isolatedScope = effectScope(true)  // detached

isolatedScope.run(() => {
  // 独立的响应式追踪
})

// 销毁
isolatedScope.stop()
```

**3. 条件激活/停用**
```js
const scope = effectScope()

// 激活
scope.run(() => {
  // 重新建立响应式连接
})

// 停用
scope.stop()
```

**与组件生命周期集成：**
```js
// Vue 3.2+ onScopeDispose
import { onScopeDispose } from 'vue'

function useComposable() {
  const data = ref(null)
  
  onScopeDispose(() => {
    // 当前作用域销毁时调用
    console.log('cleanup')
  })
  
  return { data }
}
```

**知识点：** `EffectScope` `副作用管理` `响应式`

:::
