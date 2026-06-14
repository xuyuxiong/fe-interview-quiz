---
title: Vue 性能优化
description: Vue 性能优化、v-once/v-memo、KeepAlive、虚拟滚动面试题
---

# Vue 性能优化

## 面试题

### Q1: v-once 和 v-memo 的区别是什么？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 特性 | v-once | v-memo |
|------|--------|--------|
| Vue 版本 | Vue 2+ | Vue 3.2+ |
| 更新频率 | 从不更新 | 依赖变化时更新 |
| 适用场景 | 绝对静态内容 | 低频更新内容 |

```vue
<!-- v-once：只渲染一次 -->
<span v-once>版本号: {{ version }}</span>

<!-- v-memo：只有 count 变化时才更新 -->
<div v-memo="[count]">
  <p>{{ count }} - {{ expensiveCompute(count) }}</p>
</div>
```

**v-memo 原理：** 缓存上次渲染的 VNode，依赖值未变时直接复用，跳过 diff。

```vue
<!-- 列表场景：只有选中项变化才更新 -->
<div v-for="item in list" :key="item.id" v-memo="[item.id === selectedId]">
  <Item :data="item" :selected="item.id === selectedId" />
</div>
```

**知识点：** `v-once` `v-memo` `渲染优化` `VNode缓存`

:::

### Q2: KeepAlive 的原理是什么？max 参数如何工作？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**KeepAlive** 缓存动态组件实例，避免重复创建销毁。

```vue
<template>
  <!-- 基础用法 -->
  <KeepAlive>
    <component :is="currentComp" />
  </KeepAlive>

  <!-- include/exclude/max -->
  <KeepAlive :include="['Home', 'About']" :max="5">
    <component :is="currentComp" />
  </KeepAlive>
</template>
```

**生命周期钩子：**

```js
onActivated(() => console.log('从缓存激活'))
onDeactivated(() => console.log('移入缓存'))
```

**max + LRU 缓存原理：**

```
max = 3, 访问顺序: A → B → C → D

缓存: [A] → [A,B] → [A,B,C] → [B,C,D]（A 被淘汰）
访问 B: [C,D,B]（B 移到末尾，最近使用）
```

**原理：** KeepAlive 内部维护一个 Map 和 keys 数组，超过 max 时移除最旧的（LRU）。

**知识点：** `KeepAlive` `LRU` `onActivated` `onDeactivated` `组件缓存`

:::

### Q3: 如何减少 Vue 中的不必要 re-render？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. shallowRef / shallowReactive：** 只代理第一层

```js
// shallowRef：只有 .value 变化才触发更新
const list = shallowRef([1, 2, 3])
list.value.push(4)     // ❌ 不触发更新
list.value = [...list.value, 4]  // ✅ 触发更新

// shallowReactive：只有根级属性变化才更新
const state = shallowReactive({ foo: 1, nested: { bar: 2 } })
state.foo = 3          // ✅ 触发
state.nested.bar = 4   // ❌ 不触发
```

**2. computed 缓存：** 依赖未变时不会重新计算

```js
const expensive = computed(() => heavyCalc(data.value))
// data 不变，expensive 直接返回缓存值
```

**3. v-once / v-memo：** 跳过部分 diff

**4. 组件按需更新：** 合理拆分组件粒度

```vue
<!-- ❌ 整个列表重新渲染 -->
<template v-for="item in items" :key="item.id">
  <Item :data="item" :selected="selectedId" />
</template>

<!-- ✅ 只有选中项更新 -->
<template v-for="item in items" :key="item.id">
  <Item v-memo="[item.id === selectedId]" :data="item" />
</template>
```

**知识点：** `shallowRef` `shallowReactive` `computed缓存` `re-render优化`

:::

### Q4: Vue 异步组件 defineAsyncComponent 如何使用？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```vue
<script setup>
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,      // 200ms 后显示 loading
  timeout: 3000,   // 3 秒超时显示 error
})
</script>

<template>
  <Suspense>
    <AsyncComp />
    <template #fallback>Loading...</template>
  </Suspense>
</template>
```

**使用场景：**
- 体积大的组件（图表编辑器、富文本）
- 条件渲染的组件（弹窗/抽屉）
- 路由级别的代码分割

**知识点：** `defineAsyncComponent` `异步组件` `代码分割` `Suspense`

:::

### Q5: 响应式数据如何优化？大对象怎么处理？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. 避免不必要的深度响应式：**

```js
// ❌ 大对象全部响应式（递归代理开销大）
const form = reactive({
  user: { name: '', address: { city: '', street: '' } },
  settings: { /* 100 个字段 */ }
})

// ✅ 按模块拆分
const user = reactive({ name: '', address: reactive({ city: '', street: '' }) })
const settings = shallowReactive({ /* 不需要深层响应 */ })
```

**2. 标记原始数据：**

```js
import { markRaw } from 'vue'

// 不需要响应式的第三方类实例
const chart = markRaw(new Chart(ctx, config))
state.chartInstance = chart  // 不被代理
```

**3. 冻结不变的列表：**

```js
// 大量静态数据不需要响应式
const staticList = Object.freeze(bigArray)
```

**4. computed 惰性求值：** 只在访问时才计算，依赖不变时返回缓存

```js
const filtered = computed(() => list.value.filter(/* ... */))
```

**知识点：** `shallowReactive` `markRaw` `Object.freeze` `响应式优化`

:::

### Q6: v-for 和 v-if 一起使用会有什么问题？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**问题：** v-for 优先级高于 v-if（Vue 3），先遍历再判断，每次都遍历全部列表，浪费性能。

```vue
<!-- ❌ 每次遍历全部 1000 项才过滤出 10 项 -->
<div v-for="item in items" :key="item.id" v-if="item.active">
  {{ item.name }}
</div>

<!-- ✅ 使用 computed 先过滤 -->
<div v-for="item in activeItems" :key="item.id">
  {{ item.name }}
</div>

<script setup>
const activeItems = computed(() => items.value.filter(item => item.active))
</script>
```

**Vue 2 vs Vue 3 差异：**

| 版本 | 优先级 | 结果 |
|------|--------|------|
| Vue 2 | v-for > v-if | 先遍历再判断（浪费） |
| Vue 3 | v-for > v-if | 先遍历再判断（浪费） |

**最佳实践：** 永远不要在同一个元素上同时使用 v-for 和 v-if，用 computed 过滤。

**知识点：** `v-for` `v-if` `computed过滤` `优先级`

:::

### Q7: Vue 大列表渲染如何优化？

> **💀 困难 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. 虚拟滚动（最有效）：**

```vue
<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ items: Array, itemHeight: { type: Number, default: 50 } })
const scrollTop = ref(0)
const containerHeight = 600

const totalHeight = computed(() => props.items.length * props.itemHeight)
const visibleCount = Math.ceil(containerHeight / props.itemHeight)
const startIndex = computed(() => Math.floor(scrollTop.value / props.itemHeight))
const endIndex = computed(() => Math.min(startIndex.value + visibleCount + 2, props.items.length))
const visibleItems = computed(() =>
  props.items.slice(startIndex.value, endIndex.value).map((item, i) => ({
    ...item,
    top: (startIndex.value + i) * props.itemHeight
  }))
)
</script>

<template>
  <div class="container" :style="{ height: containerHeight + 'px', overflow: 'auto' }"
       @scroll="scrollTop = $event.target.scrollTop">
    <div :style="{ height: totalHeight + 'px', position: 'relative' }">
      <div v-for="item in visibleItems" :key="item.id"
           :style="{ position: 'absolute', top: item.top + 'px', height: itemHeight + 'px', width: '100%' }">
        {{ item.name }}
      </div>
    </div>
  </div>
</template>
```

**2. 分页加载：** 每页 20-50 条

**3. 时间分片：** `requestAnimationFrame` 分批渲染

```js
const renderBatch = (items, batchSize = 50) => {
  let i = 0
  const render = () => {
    const batch = items.slice(i, i + batchSize)
    renderedItems.value.push(...batch)
    i += batchSize
    if (i < items.length) requestAnimationFrame(render)
  }
  render()
}
```

**4. Object.freeze：** 冻结不变数据跳过响应式

**知识点：** `虚拟滚动` `分页加载` `时间分片` `Object.freeze` `大数据渲染`

:::

### Q8: Vue 组件级别的性能优化有哪些手段？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 优化手段 | 说明 | 适用场景 |
|---------|------|----------|
| v-once | 只渲染一次 | 静态内容 |
| v-memo | 依赖变化才更新 | 低频更新 |
| KeepAlive | 缓存组件实例 | Tab 切换 |
| shallowRef | 浅层响应式 | 大对象 |
| computed | 缓存计算结果 | 派生数据 |
| markRaw | 跳过响应式 | 第三方实例 |
| defineAsyncComponent | 异步加载 | 体积大的组件 |
| 拆分组件 | 缩小更新范围 | 细粒度更新 |

```vue
<!-- 综合优化示例 -->
<template>
  <!-- 静态头部 -->
  <header v-once>
    <h1>{{ appTitle }}</h1>
  </header>

  <!-- 缓存 Tab -->
  <KeepAlive :include="['Dashboard', 'Settings']" :max="3">
    <component :is="currentTab" />
  </KeepAlive>

  <!-- 列表虚拟滚动 + v-memo -->
  <VirtualList :items="items" :item-height="50">
    <template #default="{ item }">
      <div v-memo="[item.id === selectedId]">
        <ItemRow :item="item" />
      </div>
    </template>
  </VirtualList>

  <!-- 异步加载重组件 -->
  <Suspense>
    <HeavyChart />
    <template #fallback><LoadingSpinner /></template>
  </Suspense>
</template>

<script setup>
const items = shallowRef(largeArray)         // 浅层响应式
const selectedId = ref(null)
const chartInstance = markRaw(new Chart())   // 跳过响应式
</script>
```

**知识点：** `Vue性能优化` `v-once` `KeepAlive` `shallowRef` `异步组件`

:::
### Q9: Vue 大型应用的性能优化策略？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. 路由级别优化**
```js
// 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import('./Dashboard.vue')
  }
]

// 预加载
router.beforeEach((to, from, next) => {
  // 预加载目标路由组件
  const routes = router.getRoutes()
  const target = routes.find(r => r.path === to.path)
  if (target?.components?.default) {
    target.components.default()  // 触发加载
  }
  next()
})
```

**2. 组件级别优化**
```vue
<script setup>
// 浅层响应式（大型对象）
import { shallowRef, markRaw } from 'vue'
const largeData = shallowRef(apiResult)
const editor = markRaw(new CodeEditor())

// 缓存计算结果
const computedValue = computed(() => {
  // 昂贵计算
  return heavyComputation(largeData.value)
})

// 冻结不可变数据
const staticConfig = Object.freeze({ ... })
</script>
```

**3. 列表优化**
```vue
<!-- 虚拟滚动 -->
<RecycleScroller
  :items="items"
  :item-size="50"
  key-field="id"
/>

<!-- v-memo 缓存 -->
<div v-for="item in items" :key="item.id" v-memo="[item.selected]">
  {{ item.name }}
</div>

<!-- 分页/无限滚动 -->
<InfiniteLoading @infinite="loadMore" />
```

**4. 状态管理优化**
```js
// Pinia 订阅优化
const store = useStore()

// 只订阅变化的部分
const value = storeToRefs(store, ['specificField'])

// 避免整个 store 响应式
const rawStore = store.$state
```

**5. 渲染优化**
```vue
<!-- v-once 静态内容 -->
<div v-once>{{ staticContent }}</div>

<!-- KeepAlive 缓存 -->
<KeepAlive :max="10" :include="cachedComponents">
  <RouterView />
</KeepAlive>

<!-- 条件渲染优化 -->
<template v-if="show">内容</template>  <!-- 频繁切换用 v-show -->
```

**6. 包体积优化**
```js
// 按需加载
import { defineAsyncComponent } from 'vue'
const Chart = defineAsyncComponent(() => import('./Chart.vue'))

// Tree-shaking
import { ref, computed } from 'vue'  // ✅
// import Vue from 'vue'  // ❌
```

**7. 构建优化**
```js
// vite.config.js
export default {
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia']
        }
      }
    }
  }
}
```

**8. 监控和分析**
```js
// 性能监控
app.config.performance = true  // Vue Devtools

// 自定义监控
app.config.errorHandler = (err, vm, info) => {
  reportError(err, info)
}
```

**知识点：** `性能优化` `懒加载` `虚拟列表` `KeepAlive` `Tree-shaking`

:::

### Q10: Vue 编译时优化有哪些？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Vue 3 编译优化：**

**1. 静态提升（Static Hoisting）**
```vue
<!-- 模板 -->
<div>
  <span>静态文本</span>
  <span>{{ dynamic }}</span>
</div>

<!-- 编译后 -->
const _hoisted_1 = /*#__PURE__*/_createElementVNode('span', null, '静态文本')

return _createElementVNode('div', null, [
  _hoisted_1,  // 复用 hoisted 节点
  _createElementVNode('span', null, _toDisplayString(dynamic), 1)
])
```

**2. 补丁标志（Patch Flags）**
```js
// 标记动态类型，diff 时只处理动态部分
_createElementVNode('div', null, text, 1 /* TEXT */)
_createElementVNode('button', { onClick: handler }, null, 8 /* PROPS */)
_createElementVNode('input', { value: val }, null, 2 /* CLASS */)
```

**Patch Flag 类型：**
```js
export const PatchFlags = {
  TEXT: 1,           // 文本内容
  CLASS: 2,          // class
  STYLE: 4,          // style
  PROPS: 8,          // 动态 props
  FULL_PROPS: 16,    // 所有 props
  NEED_HYDRATION: 32 // 需要水合
}
```

**3. Block Tree（块树）**
```js
// 只收集动态子节点到 block
const block = {
  type: 'div',
  dynamicChildren: [
    // 只有动态子节点
    { type: 'span', patchFlag: 1 }
  ]
}

// diff 时跳过静态分支
function patchBlock(oldBlock, newBlock) {
  for (let i = 0; i < newBlock.dynamicChildren.length; i++) {
    patch(oldBlock.children[i], newBlock.dynamicChildren[i])
  }
}
```

**4. 内联字符串优化**
```vue
<!-- 模板 -->
<div :class="'item ' + (active ? 'active' : '')">

<!-- 编译后 -->
// 编译时计算静态部分
_createElementVNode('div', {
  class: _normalizeClass(['item', active ? 'active' : ''])
})
```

**5. 缓存事件处理器**
```vue
<!-- 模板 -->
<button @click="handleClick">点击</button>

<!-- 编译后 -->
// setup 中缓存
const onClick = (...args) => handleClick(...args)

// render 中复用
createElementVNode('button', { onClick }, null)
```

**6. v-once 编译**
```vue
<div v-once>{{ expensive }}</div>

<!-- 编译后 -->
// 一次性渲染，后续跳过
const hoisted = _createElementVNode('div', null, _toDisplayString(expensive))
// 后续 render 直接使用 hoisted
```

**7. 树抖动（Tree Shaking）**
```js
// 未使用的 API 会被移除
import { ref, computed, watch } from 'vue'
// 如果只用了 ref，computed 和 watch 会被 tree-shake

// 编译时标记
// #__PURE__ 标记可以被 tree-shake
const vnode = /*#__PURE__*/createVNode(Component)
```

**编译选项：**
```js
// vue.config.js / vite.config.js
export default {
  compilerOptions: {
    hoistStatic: true,      // 静态提升
    cacheHandlers: true,    // 缓存事件
    prefixIdentifiers: true // 作用域标识符
  }
}
```

**Vue 2 vs Vue 3 编译对比：**

| 优化 | Vue 2 | Vue 3 |
|------|-------|-------|
| 静态提升 | ❌ | ✅ |
| Patch Flags | ❌ | ✅ |
| Block Tree | ❌ | ✅ |
| 事件缓存 | ❌ | ✅ |
| v-once | ✅ | ✅ 增强 |

**知识点：** `编译优化` `静态提升` `Patch Flags` `Block Tree` `Tree-shaking`

:::
