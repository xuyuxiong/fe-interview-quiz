---
title: Vue 组合式 API 面试题
description: Vue 3 Composition API 深度解析，涵盖 setup 语法糖、composables、provide/inject 等 8 道经典面试题
---

# Vue 组合式 API 面试题

> **📚 共 8 题 · 简单 30% · 中等 50% · 困难 20%**

---

### Q1: setup 语法糖是如何工作的？defineProps、defineEmits、defineExpose 的用法是什么？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**script setup 编译原理：**

```vue
<!-- 源码 -->
<script setup>
import { ref } from 'vue'

const count = ref(0)
const msg = 'Hello'

function increment() {
  count.value++
}
</script>

<!-- 编译后 -->
<script>
import { ref } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const msg = 'Hello'
    
    function increment() {
      count.value++
    }
    
    return { count, msg, increment }
  }
}
</script>
```

**defineProps:**

```vue
<script setup>
// 1. 声明式（推荐，编译时类型推导）
const props = defineProps({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    default: 0
  }
})

// 2. 纯类型声明
interface Props {
  name: string
  age?: number
}
const props = withDefaults(defineProps<Props>(), {
  age: 0
})

// 3. 使用
console.log(props.name)
</script>
```

**defineEmits:**

```vue
<script setup>
// 1. 声明事件
const emit = defineEmits(['update', 'delete'])

// 2. 触发
emit('update', newValue)
emit('delete', id)

// 3. 类型声明
interface Emits {
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
}
const emit = defineEmits<Emits>()

// 4. 验证
const emit = defineEmits({
  update: (value) => {
    return typeof value === 'string'
  }
})
</script>
```

**defineExpose:**

```vue
<script setup>
import { ref } from 'vue'

const count = ref(0)
const increment = () => count.value++

// 默认所有绑定都暴露给父组件
// 使用 defineExpose 限制暴露的内容
defineExpose({
  count,
  increment
})
</script>

<!-- 父组件 -->
<ChildComponent ref="child" />
<script setup>
// child.value.count
// child.value.increment()
</script>
```

**其他宏命令：**

```vue
<script setup>
// defineSlots - 声明插槽
const slots = defineSlots<{
  default: (props: { msg: string }) => any
  header: () => any
}>()

// defineModel - v-model 支持 (Vue 3.3+)
const model1 = defineModel()
const model2 = defineModel('name')

// withDefaults - 默认值
interface Props {
  name: string
  tags?: string[]
}
withDefaults(defineProps<Props>(), {
  tags: () => []
})
</script>
```

**知识点：** `script setup` `defineProps` `defineEmits` `defineExpose`

:::

---

### Q2: 如何设计和实现 composables？有哪些最佳实践？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Composable 设计原则：**

**1. 命名规范：**

```ts
// 命名: use + 功能名
export function useCounter() {}
export function useFetch() {}
export function useToggle() {}
```

**2. 单一职责：**

```ts
// ✅ 好：单一职责
export function useCounter() { /* 计数器逻辑 */ }
export function useLocalStorage() { /* 存储逻辑 */ }

// ❌ 差：职责过多
export function useUserAndPosts() { /* 用户 + 帖子 */ }
```

**3. 返回值设计：**

```ts
// ✅ 清晰的返回值
export function useUser() {
  const user = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  const fetchUser = async () => {}
  
  return { user, isLoading, error, fetchUser }
}

// ❌ 混乱的返回值
export function useUser() {
  return { u: ref(null), l: ref(false), fetch: () => {} }
}
```

**常见 Composables 实现：**

**useCounter:**

```ts
// composables/useCounter.ts
import { ref } from 'vue'

export function useCounter(initialValue: number = 0) {
  const count = ref(initialValue)
  
  const increment = (amount: number = 1) => {
    count.value += amount
  }
  
  const decrement = (amount: number = 1) => {
    count.value -= amount
  }
  
  const reset = () => {
    count.value = initialValue
  }
  
  return { count, increment, decrement, reset }
}
```

**useFetch:**

```ts
// composables/useFetch.ts
import { ref, watchEffect, type Ref } from 'vue'

interface UseFetchReturn<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  refetch: () => void
}

export function useFetch<T>(url: string, options: RequestInit = {}): UseFetchReturn<T> {
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  const fetchData = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(url, options)
      data.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Fetch failed')
    } finally {
      loading.value = false
    }
  }
  
  // 可选：URL 变化时自动重新获取
  const controller = new AbortController()
  watchEffect(() => {
    fetchData()
  })
  
  return { data, loading, error, refetch: fetchData }
}
```

**useLocalStorage:**

```ts
// composables/useLocalStorage.ts
import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [Ref<T>, (value: T) => void] {
  // 读取 localStorage
  let parsed: T
  try {
    const item = localStorage.getItem(key)
    parsed = item ? JSON.parse(item) : initialValue
  } catch {
    parsed = initialValue
  }
  
  const state = ref<T>(parsed)
  
  // 响应 localStorage 变化
  window.addEventListener('storage', (e) => {
    if (e.key === key && e.newValue) {
      state.value = JSON.parse(e.newValue)
    }
  })
  
  // 自动保存到 localStorage
  watch(state, (value) => {
    localStorage.setItem(key, JSON.stringify(value))
  }, { deep: true })
  
  const setValue = (value: T) => {
    state.value = value
  }
  
  return [state, setValue]
}
```

**useDebounce:**

```ts
// composables/useDebounce.ts
import { ref, watch, type Ref } from 'vue'

export function useDebounce<T>(value: Ref<T>, delay: number): Ref<T> {
  const debouncedValue = ref(value.value)
  
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  
  watch(value, (newValue) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    
    timeoutId = setTimeout(() => {
      debouncedValue.value = newValue
    }, delay)
  })
  
  return debouncedValue
}
```

**组合使用 Composables:**

```vue
<script setup>
import { useCounter } from '@/composables/useCounter'
import { useLocalStorage } from '@/composables/useLocalStorage'

// 可以组合使用
const { count, increment } = useCounter(0)
const [saved, setSaved] = useLocalStorage<number>('count', 0)

// 同步到 localStorage
watch(count, setSaved, { immediate: true })
</script>
```

**知识点：** `composables` `use 模式` `代码复用`

:::

---

### Q3: provide / inject 在 Composition API 中如何使用？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**基础用法：**

```vue
<!-- 祖先组件 -->
<script setup>
import { provide, ref, readonly } from 'vue'

const theme = ref('light')
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

// 提供简单值
provide('theme', theme)
// 提供方法
provide('toggleTheme', toggleTheme)
// 提供只读值
provide('user', readonly({ name: 'John' }))

// 提供 ref（保持响应性）
// 子组件可以直接修改 of theme
</script>
```

```vue
<!-- 后代组件 -->
<script setup>
import { inject, computed } from 'vue'

// 注入
const theme = inject('theme', 'light')  // 第二个参数是默认值
const toggleTheme = inject('toggleTheme')

// 修改只提供的方法
const handleToggle = () => {
  toggleTheme?.()
}
</script>
```

**类型安全：**

```ts
// composables/useTheme.ts
import { provide, inject, ref, type Ref } from 'vue'

export const ThemeSymbol = Symbol('theme')

export interface Theme {
  name: Ref<string>
  toggle: () => void
}

// 提供者
export function provideTheme() {
  const name = ref('light')
  const toggle = () => {
    name.value = name.value === 'light' ? 'dark' : 'light'
  }
  
  provide(ThemeSymbol, { name, toggle })
}

// 消费者
export function useTheme(): Theme {
  const theme = inject(ThemeSymbol)
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return theme
}
```

```vue
<!-- 使用 -->
<script setup>
import { provideTheme, useTheme } from '@/composables/useTheme'

// 提供者
provideTheme()
</script>

<!-- 后代 -->
<script setup>
import { useTheme } from '@/composables/useTheme'

const { name, toggle } = useTheme()
</script>
```

**结合 default 值：**

```ts
const config = inject<{
  apiBaseUrl: string
  timeout: number
}>('config', {
  apiBaseUrl: '/api',
  timeout: 5000
})
```

**层叠使用：**

```vue
<!-- App.vue 提供最外层配置 -->
<script setup>
import { provide, readonly } from 'vue'

const config = readonly({
  apiBaseUrl: 'https://api.example.com',
  version: '1.0.0'
})
provide('config', config)
</script>

<!-- Layout.vue 提供布局相关 -->
<script setup>
const sidebarWidth = ref('240px')
provide('sidebarWidth', sidebarWidth)
</script>

<!-- 子组件可以获取所有层级的 provide -->
<script setup>
const config = inject('config')
const sidebarWidth = inject('sidebarWidth')
</script>
```

**使用场景：**

| 场景 | 推荐方案 |
|------|----------|
| 全局配置 | provide/inject |
| 主题/语言 | provide/inject |
| 用户信息 | Pinia |
| 表单状态 | provide/inject (表单内部) |

**避免滥用：**

```vue
<!-- ❌ 不推荐：把 provide/inject 当作全局状态 -->
<!-- 应该使用 Pinia 等状态管理 -->

<!-- ✅ 推荐：跨层级传递配置 -->
<script setup>
// 表单组件内部传递表单状态
provide('formContext', {
  registerField,
  unregisterField,
  validate
})
</script>
```

**知识点：** `provide` `inject` `依赖注入`

:::

---

### Q4: Pinia 状态管理的核心概念是什么？defineStore、actions、getters 如何使用？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Pinia 核心概念：**

```
defineStore → State + Getters + Actions
↓
useStore() → 在组件中使用
```

**定义 Store:**

```ts
// stores/counter.ts
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', {
  // State
  state: () => ({
    count: 0,
    name: 'Counter'
  }),
  
  // Getters (计算属性)
  getters: {
    doubleCount: (state) => state.count * 2,
    // 带参数的 getter
    getCountById: (state) => (id: number) => {
      return state.items.find(item => item.id === id)
    }
  },
  
  // Actions (方法)
  actions: {
    increment() {
      this.count++
    },
    
    decrement() {
      this.count--
    },
    
    // 异步 action
    async fetchData() {
      const res = await fetch('/api/data')
      this.$patch(await res.json())
    },
    
    // 单个 state 修改
    setCount(count: number) {
      this.$patch({ count })
    },
    
    // 函数式 patch
    mutateState() {
      this.$patch((state) => {
        state.count++
        state.name = 'updated'
      })
    }
  }
})
```

**选项式 vs Setup 式:**

**选项式（推荐）:**

```ts
export const useCounterStore = defineStore('counter', {
  state: () => ({ count: 0 }),
  getters: {
    double: (state) => state.count * 2
  },
  actions: {
    increment() {
      this.count++
    }
  }
})
```

**Setup 式:**

```ts
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  
  // 计算属性
  const double = computed(() => count.value * 2)
  
  // 方法
  function increment() {
    count.value++
  }
  
  return { count, double, increment }
})
```

**组件中使用:**

```vue
<script setup>
import { storeToRefs } from 'pinia'
import { useCounterStore } from '@/stores/counter'

const store = useCounterStore()

// 直接访问 state
console.log(store.count)
store.increment()

// Getters
console.log(store.doubleCount)

// 使用 storeToRefs 保持响应性
const { count, doubleCount } = storeToRefs(store)
// 现在 count.value 是响应式的 ref
</script>

<template>
  <div>{{ count }}</div>
  <button @click="increment">+</button>
</template>
```

**修改 State 的方式:**

```ts
// 1. 直接修改
store.count = 1

// 2. 使用 $patch
store.$patch({
  count: store.count + 1,
  name: 'updated'
})

// 3. 函数式 $patch
store.$patch((state) => {
  state.items.push(newItem)
})

// 4. 在 action 中
store.increment()
```

**持久化插件:**

```ts
// 使用 pinia-plugin-persistedstate
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    user: null
  }),
  persist: true  // 自动持久化到 localStorage
})
```

**对比 Vuex:**

| 特性 | Vuex | Pinia |
|------|------|-------|
| 体积 | 大 | 小 (1KB) |
| Type | 一般 | 优秀 |
| 灵活性 | 复杂 | 简单 |
| DevTools | ✅ | ✅ |
| 嵌套模块 | 需要 | 扁平化 |

**知识点：** `Pinia` `defineStore` `状态管理`

:::

---

### Q5: Teleport 和 Suspense 的用法和原理是什么？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Teleport（传送门）:**

将组件的部分模板渲染到 DOM 的其他位置。

```vue
<template>
  <!-- 默认渲染在组件内部 -->
  <button @click="showModal = true">Open Modal</button>
  
  <!-- 渲染到 body -->
  <Teleport to="body">
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
const showModal = ref(false)
</script>
```

**Teleport 应用场景:**

```vue
<!-- 1. 模态框 -->
<Teleport to="body">
  <Modal />
</Teleport>

<!-- 2. 弹窗/提示 -->
<Teleport to="body">
  <Toast v-if="showToast" />
</Teleport>

<!-- 3. 下拉菜单 -->
<Teleport to="body">
  <Dropdown v-if="showDropdown" />
</Teleport>

<!-- 4. 暗黑模式 / 独立的 UI 区域 -->
<Teleport to="#portal-target">
  <CustomContent />
</Teleport>
```

**disabled 属性:**

```vue
<Teleport to="body" :disabled="isMobile">
  <!-- 在桌面端传送，移动端不传送 -->
</Teleport>
```

**Suspense（异步组件）:**

处理异步组件的加载状态，无需手动处理 loading。

```vue
<template>
  <Suspense>
    <!-- 默认内容（异步组件） -->
    <template #default>
      <AsyncComponent />
    </template>
    
    <!-- loading 状态 -->
    <template #fallback>
      <div class="loader">Loading...</div>
    </template>
  </Suspense>
</template>
```

**async setup 组件:**

```vue
<!-- AsyncComponent.vue -->
<script setup>
// 异步 setup
const data = await fetch('/api/data')
const items = data.value
</script>

<template>
  <div>{{ items }}</div>
</template>
```

**Suspense 层级:**

```vue
<template>
  <div>
    <h1>Dashboard</h1>
    
    <Suspense>
      <ProfileComponent />
    </Suspense>
    
    <Suspense>
      <StatsComponent />
    </Suspense>
    
    <!-- 嵌套 Suspense -->
    <Suspense>
      <SectionComponent>
        <template #default>
          <InnerAsyncComponent />
        </template>
        <template #fallback>
          Local loading...
        </template>
      </SectionComponent>
    </Suspense>
  </div>
</template>
```

**同时等待多个异步:**

```vue
<script setup>
// 多个异步操作
const [userData, postsData] = await Promise.all([
  fetch('/api/user').then(r => r.json()),
  fetch('/api/posts').then(r => r.json())
])
</script>
```

**知识点：** `Teleport` `Suspense` `异步组件`

:::

---

### Q6: 如何自定义指令？有哪些常见的自定义指令用例？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**自定义指令生命周期:**

```ts
// 完整钩子
export default {
  beforeMount(el, binding, vnode) {
    // 指令绑定到元素前调用
  },
  mounted(el, binding, vnode) {
    // 元素插入父节点后调用
  },
  beforeUpdate(el, binding, vnode, prevVnode) {
    // 更新前调用
  },
  updated(el, binding, vnode, prevVnode) {
    // 更新后调用
  },
  beforeUnmount(el, binding, vnode) {
    // 元素卸载前调用
  },
  unmounted(el, binding, vnode) {
    // 元素卸载后调用
  }
}
```

**注册方式:**

```ts
// 1. 全局注册
// main.ts
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// 2. 局部注册
// Component.vue
const vFocus = {
  mounted(el) {
    el.focus()
  }
}

// <input v-focus />
```

**常用自定义指令:**

**v-lazy (懒加载):**

```ts
// directives/lazy.ts
export default {
  mounted(el, binding) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.src = binding.value
          observer.disconnect()
        }
      })
    })
    observer.observe(el)
  }
}
```

**v-loading:**

```ts
// directives/loading.ts
import { createLoading, closeLoading } from '@/components/Loading'

export default {
  mounted(el, binding) {
    if (binding.value) {
      const instance = createLoading({ parent: el })
      el._loadingInstance = instance
    }
  },
  updated(el, binding) {
    if (binding.value !== binding.oldValue) {
      binding.value ? createLoading({ parent: el }) : el._loadingInstance?.close()
    }
  },
  unmounted(el) {
    el._loadingInstance?.close()
  }
}

// 使用：<div v-loading="isLoading">...</div>
```

**v-permission (权限控制):**

```ts
// directives/permission.ts
import { useUserStore } from '@/stores/user'

export default {
  mounted(el, binding) {
    const userStore = useUserStore()
    const { value } = binding
    
    if (value && !userStore.hasPermission(value)) {
      el.parentNode?.removeChild(el)
    }
  }
}

// 使用：<button v-permission="'admin'">Admin</button>
```

**v-debounce:**

```ts
// directives/debounce.ts
import { debounce } from 'lodash-es'

export default {
  mounted(el, binding) {
    const event = binding.arg || 'input'
    const delay = binding.value || 300
    
    const input = el.querySelector('input')
    if (input) {
      const debouncedFn = debounce(() => {
        input.dispatchEvent(new Event('input-debounced'))
      }, delay)
      
      input.addEventListener(event, (e) => {
        debouncedFn()
        binding.value?.(e.target.value)
      })
    }
  }
}
```

**Vue 3 配置对象语法:**

```ts
export default {
  mounted(el, binding) {
    el.style.color = binding.value?.color || 'red'
    if (binding.value?.shout) {
      el.textContent = el.textContent.toUpperCase()
    }
  }
}
```

**知识点：** `自定义指令` `指令钩子` `v-指令`

:::

---

### Q7: 如何开发 Vue 3 插件？有哪些最佳实践？

> **ℹ️ 困难 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**插件基础结构:**

```ts
// plugins/myPlugin.ts
import type { App } from 'vue'

export interface MyPluginOptions {
  prefix?: string
  // 其他选项
}

export default {
  install(app: App, options: MyPluginOptions = {}) {
    const prefix = options.prefix || 'my'
    
    // 1. 注册全局组件
    app.component(`${prefix}-button`, MyButtonComponent)
    
    // 2. 注册全局指令
    app.directive('permission', permissionDirective)
    
    // 3. 注册全局属性
    app.config.globalProperties.$myMethod = () => {}
    
    // 4. 提供全局组合式函数
    app.provide('myPlugin', { prefix })
  }
}

// 使用
// main.ts
import { createApp } from 'vue'
import myPlugin from './plugins/myPlugin'

createApp(App)
  .use(myPlugin, { prefix: 'app' })
  .mount('#app')
```

**完整插件示例:**

```ts
// plugins/element.ts
import type { App, Component, Plugin } from 'vue'
import Button from './components/Button.vue'
import Input from './components/Input.vue'
import Dialog from './components/Dialog.vue'

const components: Component[] = [Button, Input, Dialog]

export default {
  install(app: App, options?: any) {
    // 注册所有组件
    components.forEach(component => {
      app.component(component.name as string, component)
    })
    
    // 全局配置
    const config = {
      size: options?.size || 'default',
      zIndex: options?.zIndex || 1000
    }
    
    app.provide('el-config', config)
  }
} as Plugin

// 单个组件也可以按需引入
export { Button, Input, Dialog }
```

**组合式函数插件:**

```ts
// plugins/useToast.ts
import { createApp, h, ref } from 'vue'
import Toast from './Toast.vue'

interface ToastOptions {
  message: string
  type?: 'success' | 'error' | 'warning'
  duration?: number
}

export function createToast() {
  const queue: any[] = []
  
  const toast = (options: ToastOptions) => {
    const instance = createApp({
      setup() {
        const show = ref(true)
        
        setTimeout(() => {
          show.value = false
        }, options.duration || 3000)
        
        return () => show.value ? h(Toast, options) : null
      }
    })
    
    const container = document.createElement('div')
    document.body.appendChild(container)
    instance.mount(container)
  }
  
  return { toast }
}

// 组合式函数
let instance: ReturnType<typeof Toast>
export const useToast = () => {
  if (!instance) {
    instance = createToast()
  }
  return instance
}
```

**类型导出:**

```ts
// types/index.ts
import type { App } from 'vue'

export interface PluginOptions {
  size: 'small' | 'medium' | 'large'
  theme: 'light' | 'dark'
}

export declare module 'vue' {
  interface ComponentCustomProperties {
    $toast: (options: ToastOptions) => void
  }
}

export type { App }
```

**最佳实践:**

1. **按需导入支持:**

```ts
// 支持全量和按需
import MyLib from 'my-lib'  // 全量
import { Button } from 'my-lib'  // 按需
```

2. **Tree-shaking 友好:**

```ts
// ✅ ESM 导出
export { Button, Input }
export default plugin

// ❌ 全量打包
module.exports = { ... }
```

3. **TypeScript 类型:**

```ts
import type { App } from 'vue'
// 提供完整的类型定义
```

**知识点：** `插件开发` `install` `最佳实践`

:::

---

### Q8: 有哪些常见的 Composition API 陷阱？如何避免？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**陷阱 1：解构失去响应性**

```vue
<script setup>
import { reactive, toRefs } from 'vue'

// ❌ 错误：解构失去响应性
const state = reactive({ count: 0 })
const { count } = state  // ❌

// ✅ 正确：使用 toRefs
const { count } = toRefs(state)  // ✅

// ✅ 或者直接使用
state.count  // ✅
</script>
```

**陷阱 2：返回值未解包**

```vue nom setup>
// ✅ default: 自动 tops-level props
const count = ref(0)
// 模板中自动解包 {{ count }}

const state = { count: ref(0) }
// 模板中需要 state.count.value ❌

// ✅ 正确：顶层 ref 自动解包
return { count }  // 自动解包
</script>
```

**陷阱 3：异步 setup 的错误处理**

```vue
<script setup>
// ✅ 错误处理
try {
  const data = await fetchData()
} catch (error) {
  console.error(error)
}

// ✅ 或使用 try-catch 包裹
async function loadData() {
  try {
    return await fetchData()
  } catch (error) {
    return null
  }
}
</script>
```

**陷阱 4：watch 的依赖问题**

```vue
<script setup>
const obj = reactive({ a: 1 })

// ❌ 可能是因为 ref 包装
watch(obj, () => {})  // ✅

// ✅ 更明确的方式
watch(() => obj.a, () => {})
</script>
```

**陷阱 5：use 未返回必要值**

```ts
// ❌ 不完整的 composable
function useCount() {
  const count = ref(0)
  return { count }  // 没有修改方法
}

// ✅ 完整
function useCount() {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
}
```

**知识点：** `Composition API` `常见陷阱` `最佳实践`

:::

---

## 总结

| 知识点 | 重要度 | 面试频率 |
|--------|--------|----------|
| script setup | 🔥🔥🔥 | 🔥🔥🔥 |
| composables | 🔥🔥 | 🔥🔥 |
| provide/inject | 🔥🔥 | 🔥🔥 |
| Pinia | 🔥🔥🔥 | 🔥🔥🔥 |
| Teleport/Suspense | 🔥🔥 | 🔥 |
| 自定义指令 | 🔥 | 🔥 |
| 插件开发 | 🔥 | 🔥 |
| 组合式陷阱 | 🔥🔥 | 🔥🔥 |

**面试建议：**

- 掌握 script setup 的语法糖
- 能手写常见的 composables
- 理解 Pinia 状态管理
- 了解 Composition API 的常见陷阱

---
---

### Q9: Vue nextTick 的原理是什么？为什么需要 nextTick？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**为什么需要 nextTick？**

Vue 的数据更新是**异步**的，修改数据后 DOM 不会立即更新。nextTick 用于在 DOM 更新后执行回调。

```js
// ❌ 问题示例
this.message = 'new value'
console.log(this.$el.textContent)  // 还是旧值！

// ✅ 解决方案
this.message = 'new value'
this.$nextTick(() => {
  console.log(this.$el.textContent)  // 'new value'
})

// Vue 3
import { nextTick, ref } from 'vue'
const message = ref('old')
message.value = 'new'
await nextTick()
// DOM 已更新
```

**原理：**

Vue 将同一事件循环中的所有数据变更放入队列，去重后在下一个 Tick 统一更新。

```js
// 简化的 nextTick 实现
const callbacks = []
let pending = false

function flushCallbacks() {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  copies.forEach(cb => cb())
}

function nextTick(cb) {
  callbacks.push(cb)
  if (!pending) {
    pending = true
    // 优先使用 Promise，降级到 setTimeout/MutationObserver
    Promise.resolve().then(flushCallbacks)
  }
}
```

**执行优先级：**

```
1. Promise.then（MicroTask，优先）
2. MutationObserver（MicroTask 降级）
3. setImmediate（Task，仅 Node/IE）
4. setTimeout(fn, 0)（Task，兜底）
```

**应用场景：**

```vue
<template>
  <div ref="list">
    <div v-for="item in items" :key="item.id">{{ item.name }}</div>
  </div>
</template>

<script>
export default {
  async mounted() {
    // 场景 1：等待 DOM 更新后获取尺寸
    this.items = largeData
    await this.$nextTick()
    const height = this.$refs.list.scrollHeight
  },
  
  methods: {
    // 场景 2：更新后滚动到底部
    addItem() {
      this.items.push(newItem)
      this.$nextTick(() => {
        this.$refs.list.scrollTop = this.$refs.list.scrollHeight
      })
    },
    
    // 场景 3：await 方式
    async handleUpdate() {
      this.loading = true
      await this.fetchData()
      await this.$nextTick()
      this.focusInput()
    }
  }
}
</script>
```

**Vue 2 vs Vue 3：**

```js
// Vue 2
this.$nextTick(() => {})
this.$nextTick().then(() => {})

// Vue 3
import { nextTick } from 'vue'
nextTick(() => {})
await nextTick()
```

**知识点：** `nextTick` `异步更新` `MicroTask` `DOM 更新` `事件循环`

:::

---

### Q10: Vue keepAlive 的原理？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**keepAlive 用于缓存组件实例，避免重复渲染。**

**基本用法：**

```vue
<template>
  <keep-alive :include="['User', 'Article']" :max="10">
    <router-view />
  </keep-alive>
</template>

<script>
import User from '@/views/User.vue'
import Article from '@/views/Article.vue'

export default {
  components: { User, Article }
}
</script>
```

**生命周期：**

```vue
<script>
export default {
  name: 'User',
  
  created() {
    console.log('created - 每次都执行')
  },
  
  activated() {
    console.log('activated - 被激活时触发')
  },
  
  deactivated() {
    console.log('deactivated - 被停用时触发')
  },
  
  beforeUnmount() {
    console.log('beforeUnmount - 真正销毁时')
  }
}
</script>
```

**执行流程：**

```
首次渲染:
created → mounted → activated

切换出去:
deactivated

切换回来:
activated（不触发 created/mounted）

真正销毁:
beforeUnmount → unmounted
```

**原理：**

**1. 缓存策略（LRU）：**

```js
// 简化原理
const cache = new Map()  // 缓存实例
const keys = []          // 记录 key 顺序

function getComponent(vnode) {
  const { key } = vnode
  if (cache.has(key)) {
    // 命中缓存
    const instance = cache.get(key)
    keys.splice(keys.indexOf(key), 1)
    keys.push(key)  // 提到末尾（最近使用）
    return instance
  } else {
    // 创建新实例
    const instance = createComponent()
    cache.set(key, instance)
    keys.push(key)
    
    // 超过最大缓存数，删除最久未使用
    if (keys.length > max) {
      const oldestKey = keys.shift()
      cache.delete(oldestKey)
    }
    return instance
  }
}
```

**2. include/exclude 匹配：**

```js
function matches(pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.some(p => matches(p, name))
  } else if (typeof pattern === 'string') {
    return pattern.split(',').includes(name)
  } else if (pattern instanceof RegExp) {
    return pattern.test(name)
  }
  return false
}
```

**3. 缓存条件：**

```vue
<!-- ✅ 会被缓存 -->
<keep-alive>
  <component :is="currentView" />
</keep-alive>

<!-- ❌ 不会被缓存 -->
<keep-alive>
  <router-view />  <!-- 没有 name 或动态 is -->
</keep-alive>
```

**使用场景：**

```vue
<!-- 列表 - 详情页面 -->
<keep-alive>
  <router-view v-if="$route.meta.keepAlive" />
</keep-alive>
<router-view v-else />

<!-- 表单页面缓存 -->
<keep-alive :max="5">
  <form-component v-if="showForm" />
</keep-alive>
```

**知识点：** `keepAlive` `组件缓存` `LRU` `activated` `deactivated` `include`

:::

---

### Q11: Vue 样式隔离是怎么做的？为什么用:deep 可以击穿？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**scoped 样式隔离原理：**

Vue 给每个组件的模板添加唯一的 `data-v-xxx` 属性，并在 CSS 中添加对应的属性选择器。

```vue
<!-- 源码 -->
<template>
  <div class="box">内容</div>
</template>

<style scoped>
.box {
  color: red;
}
</style>

<!-- 编译后 -->
<template>
  <div class="box" data-v-abcd1234>内容</div>
</template>

<style>
.box[data-v-abcd1234] {
  color: red;
}
</style>
```

**为什么:deep 可以击穿？**

`:deep()`（Vue 3）或`/deep/`（Vue 2）会被编译成后代选择器，不受 scoped 限制。

```vue
<style scoped>
/* 普通选择器：只作用于本组件 */
.box {
  color: red;  /* → .box[data-v-xxx] */
}

/* :deep() - Vue 3 */
.box :deep(.child) {
  color: blue;  /* → .box[data-v-xxx] .child */
}

/* 等价于 */
.box .child {
  color: blue;  /* 子组件的 .child 也会被影响 */
}
</style>
```

**穿透方式：**

```vue
<!-- Vue 3 -->
<style scoped>
:deep(.el-button) {
  font-size: 16px;
}

/* 或 */
:deep(.el-button) { ... }

/* 多个选择器 */
:deep(.parent .child) { ... }
</style>

<!-- Vue 2 -->
<style scoped>
/deep/ .el-button {
  font-size: 16px;
}

/* 或 */
::v-deep .el-button { ... }
</style>
```

**编译后对比：**

```css
/* scoped 正常选择器 */
.button[data-v-xxx] { }

/* :deep() 编译后 */
[data-v-xxx] .el-button { }  /* 后代选择器，可穿透 */

/* :slotted() - 仅作用于插槽内容 */
:slotted(.slot-content) { }  /* → .slot-content[data-v-xxx] */

/* :global() - 全局样式 */
:global(.global-class) { }  /* → .global-class（无 data-v） */
```

**使用场景：**

```vue
<!-- 修改 element-plus 组件样式 -->
<template>
  <el-button class="custom-btn">按钮</el-button>
</template>

<style scoped>
/* ✅ 穿透修改 */
.custom-btn :deep(.el-button__inner) {
  color: #42b883;
}

/* ❌ 无效 - 选择器编译后找不到 */
.el-button__inner {
  color: #42b883;
}
</style>
```

**注意事项：**

```vue
<!-- Vue 3 推荐 -->
<style scoped>
:deep(.child) { }
</style>

<!-- Vue 2 -->
<style scoped>
/deep/ .child { }
/* 或 */
::v-deep .child { }
</style>
```

**知识点：** `scoped` `样式隔离` `:deep()` `属性选择器` `穿透` `data-v`

:::

---

### Q12: Vue Router 有哪些路由守卫？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**全局守卫：**

```js
const router = createRouter({ /* ... */ })

// 1. 全局前置守卫（最常用）
router.beforeEach((to, from, next) => {
  console.log('全局前置', to.fullPath)
  // 权限检查
  if (to.meta.requiresAuth && !isLogin) {
    next('/login')
  } else {
    next()
  }
})

// 2. 全局解析守卫
router.beforeResolve((to, from, next) => {
  console.log('全局解析守卫', to.fullPath)
  next()
})

// 3. 全局后置守卫
router.afterEach((to, from) => {
  console.log('全局后置', to.fullPath)
  // 无需 next()
  // 统计页面访问
  trackPageView(to.fullPath)
})
```

**路由独享守卫：**

```js
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    beforeEnter: (to, from, next) => {
      console.log('路由独享守卫')
      // 仅对这个路由生效
      next()
    }
  }
]
```

**组件内守卫：**

```vue
<script>
export default {
  // 进入组件前
  beforeRouteEnter(to, from, next) {
    console.log('进入前')
    // 不能访问 this（实例未创建）
    next(vm => {
      // 通过 vm 访问组件实例
      vm.fetchData()
    })
  },
  
  // 路由更新前（参数变化）
  beforeRouteUpdate(to, from, next) {
    console.log('路由更新前')
    // 可访问 this
    this.fetchData(to.params.id)
    next()
  },
  
  // 离开组件前
  beforeRouteLeave(to, from, next) {
    console.log('离开前')
    const answer = window.confirm('确定离开吗？未保存的内容会丢失')
    if (answer) {
      next()
    } else {
      next(false)  // 取消导航
    }
  }
}
</script>
```

**守卫执行顺序：**

```
完整导航流程：
1. 导航触发
2. beforeRouteLeave（离开的组件）
3. beforeEach（全局）
4. beforeRouteUpdate（自更新组件）
5. beforeEnter（独享）
6. beforeResolve（全局解析）
7. 异步路由组件加载
8. beforeRouteEnter（进入的组件）
9. afterEach（全局后置）
10. DOM 更新
```

**权限控制示例：**

```js
// router/index.js
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  const userStore = useUserStore()
  
  // 1. 不需要登录的页面
  if (!to.meta.requiresAuth) {
    next()
    return
  }
  
  // 2. 已登录
  if (token) {
    next()
    return
  }
  
  // 3. 未登录，先尝试刷新 token
  try {
    await userStore.refreshToken()
    next(to.fullPath)
  } catch {
    // 4. 刷新失败，跳转登录
    next(`/login?redirect=${to.fullPath}`)
  }
})
```

**路由 meta 配置：**

```js
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      roles: ['admin', 'super-admin']
    }
  }
]

router.beforeEach((to, from, next) => {
  const roles = to.meta.roles || []
  if (roles.length && !roles.includes(userStore.role)) {
    next('/403')
    return
  }
  next()
})
```

**知识点：** `路由守卫` `beforeEach` `beforeEnter` `beforeRouteEnter` `权限控制`

:::
### Q13: Vue3 和 Vue2 的区别？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 维度 | Vue2 | Vue3 |
|------|------|------|
| API风格 | Options API | Composition API + Options API |
| 响应式 | Object.defineProperty | Proxy |
| 模板 | 单根节点 | Fragment(多根节点) |
| 生命周期 | beforeCreate/created等 | setup+onMounted等 |
| 组件 | mixins混入 | composables组合 |
| TypeScript | 支持较弱 | 原生友好 |
| 性能 | - | 提升1.2-2倍 |
| 新组件 | - | Teleport/Suspense |
| 全局API | Vue.xxx | app.xxx( tree-shakable) |
| 状态管理 | Vuex | Pinia |

**1. Composition API vs Options API：**

```js
// Vue2 Options API — 按选项组织
export default {
  data() { return { count: 0, name: '' } },
  computed: { doubleCount() { return this.count * 2 } },
  methods: { increment() { this.count++ } },
  mounted() { console.log('mounted') }
}
// 同一功能的代码分散在data/computed/methods中

// Vue3 Composition API — 按功能组织
import { ref, computed, onMounted } from 'vue'
export default {
  setup() {
    // 计数功能 — 代码集中
    const count = ref(0)
    const doubleCount = computed(() => count.value * 2)
    const increment = () => count.value++
    
    // 名称功能 — 代码集中
    const name = ref('')
    
    onMounted(() => console.log('mounted'))
    return { count, doubleCount, increment, name }
  }
}
```

**2. Proxy vs Object.defineProperty：**

```js
// Vue2 defineProperty — 需要递归遍历
Object.defineProperty(obj, 'name', {
  get() { /* 收集依赖 */ },
  set(val) { /* 触发更新 */ }
})
// ❌ 无法检测属性新增/删除
// ❌ 无法检测数组索引变化
// ❌ 初始化时递归遍历所有属性

// Vue3 Proxy — 懒代理
const proxy = new Proxy(obj, {
  get(target, key) { /* 收集依赖 */ },
  set(target, key, val) { /* 触发更新 */ },
  deleteProperty(target, key) { /* 触发更新 */ }
})
// ✅ 可检测属性新增/删除
// ✅ 可检测数组变化
// ✅ 懒代理（访问时才代理嵌套对象）
```

**3. 新增组件：**

```vue
<!-- Teleport — 传送门 -->
<Teleport to="body">
  <Modal>不受父级overflow/z-index影响</Modal>
</Teleport>

<!-- Suspense — 异步组件 -->
<Suspense>
  <template #default>
    <AsyncComponent />  <!-- 异步加载 -->
  </template>
  <template #fallback>
    <Loading />  <!-- 加载中显示 -->
  </template>
</Suspense>

<!-- Fragment — 多根节点 -->
<template>
  <h1>Title</h1>
  <p>Content</p>
  <!-- Vue2必须单根节点包裹，Vue3不需要 -->
</template>
```

**4. 全局API变化：**

```js
// Vue2 — 全局修改Vue对象
Vue.use(plugin)
Vue.component('MyComp', Comp)
Vue.mixin(mixin)

// Vue3 — app实例（tree-shakable）
const app = createApp(App)
app.use(plugin)
app.component('MyComp', Comp)
// 不同app实例互不影响
```

**知识点：** `Vue3` `Composition API` `Proxy` `Fragment` `Teleport` `Suspense`

:::

### Q14: setup 语法糖和普通 setup() 的区别？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**普通 setup() 函数：**
```vue
<script>
import { ref, computed } from 'vue'

export default {
  setup(props, { emit }) {
    // 必须返回才能在模板使用
    const count = ref(0)
    const double = computed(() => count.value * 2)
    
    function increment() {
      count.value++
    }
    
    // 暴露给模板
    return {
      count,
      double,
      increment,
      // props 需要手动解构
      title: props.title,
      // emit 也需要
      notify: (e) => emit('notify', e)
    }
  }
}
</script>
```

**setup 语法糖（`<script setup>`）：**
```vue
<script setup>
// 1. 顶层绑定自动暴露
const count = ref(0)
const double = computed(() => count.value * 2)

// 2. 函数自动暴露
function increment() {
  count.value++
}

// 3. props 用 defineProps
const props = defineProps({
  title: String
})

// 4. emits 用 defineEmits
const emit = defineEmits(['notify', 'update'])

// 5. 直接定义组件选项
defineOptions({
  name: 'MyComponent',
  inheritAttrs: false
})

// 6. 定义插槽
defineSlots(['default', 'header'])

// 7. 暴露给父组件（默认只暴露顶层绑定）
const privateData = ref(0)  // 模板可用，父组件ref不可访问
defineExpose({
  publicMethod() { return privateData.value }
})
</script>
```

**核心区别：**

| 维度 | 普通 setup() | `<script setup>` |
|------|-------------|------------------|
| 暴露方式 | return | 顶层自动 |
| 代码量 | 多（重复） | 少（简洁） |
| TypeScript | 手动推导 | 自动推导 |
| 宏命令 | ❌ | defineProps/defineEmits 等 |
| 组件注册 | 手动 | 自动（按文件名） |

**宏命令：**

**defineProps vs 普通 props：**
```vue
<!-- 运行时声明 -->
<script setup>
const props = defineProps({
  title: { type: String, required: true }
})
</script>

<!-- 纯类型声明（TS only） -->
<script setup lang="ts">
interface Props {
  title: string
  count?: number
}
const props = defineProps<Props>()
</script>
```

**withDefaults（TS 默认值）：**
```vue
<script setup lang="ts">
interface Props {
  name?: string
  count?: number
}
const props = withDefaults(defineProps<Props>(), {
  name: 'Guest',
  count: 0
})
</script>
```

**父组件 ref 获取子组件暴露：**
```vue
<!-- 父组件 -->
<script setup>
import Child from './Child.vue'
const childRef = ref()

onMounted(() => {
  childRef.value.publicMethod()  // 只能调用 defineExpose 暴露的
})
</script>

<Child ref="childRef" />

<!-- 子组件 -->
<script setup>
const privateData = ref(0)
defineExpose({
  publicMethod: () => privateData.value
})
</script>
```

**编译后：**
```js
// <script setup> 编译为 setup() 函数
export default {
  setup(__props, { expose }) {
    const count = ref(0)
    expose({ publicMethod })
    return { count }  // 自动 return
  }
}
```

**知识点：** `script setup` `语法糖` `defineProps` `defineExpose` `宏命令`

:::

### Q15: toRef 和 toRefs 的区别？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**toRef - 单个属性转 ref**
```js
const state = reactive({ count: 0, name: 'John' })

// 创建指向 state.count 的 ref
const countRef = toRef(state, 'count')

// 同步变化
countRef.value++
console.log(state.count)  // 1

state.count = 2
console.log(countRef.value)  // 2

// 第二个参数：默认值（原属性不存在时）
const ageRef = toRef(state, 'age', 18)
```

**toRefs - 所有属性转 ref 对象**
```js
const state = reactive({ count: 0, name: 'John' })

// 转换为 ref 对象
const { count, name } = toRefs(state)

// 解构后仍保持响应式
count.value++
console.log(state.count)  // 1
```

**使用场景对比：**

**toRef 场景：**
```js
// 1. 函数参数（保持响应式）
function useCounter(counterRef) {
  const double = computed(() => counterRef.value * 2)
  return { double }
}

const state = reactive({ count: 0 })
const { double } = useCounter(toRef(state, 'count'))

// 2. 组合函数返回
function useFeatureToggle(features, key) {
  return toRef(features, key)  // 返回单个 ref
}

const features = reactive({ darkMode: false, beta: true })
const darkMode = useFeatureToggle(features, 'darkMode')

// 3. 链接到现有 ref
import { defined } from '@vueuse/core'
const myRef = toRef(existingRef, 'value')
```

**toRefs 场景：**
```js
// 1. setup 返回（完整保持响应式）
export default {
  setup() {
    const state = reactive({ count: 0, name: 'John' })
    return toRefs(state)  // 解构后仍响应式
  }
}

// 2. 组合函数多个返回值
function useState() {
  const state = reactive({
    loading: false,
    error: null,
    data: null
  })
  return toRefs(state)
}

const { loading, error, data } = useState()
```

**与 ref 对比：**

| API | 创建新值 | 链接原对象 | 适用场景 |
|-----|---------|-----------|---------|
| ref(value) | ✅ | ❌ | 创建新响应式 |
| toRef(obj, key) | ❌ | ✅ | 单个属性链接 |
| toRefs(obj) | ❌ | ✅ | 批量属性链接 |

**注意事项：**
```js
const state = reactive({ count: 0 })

// ❌ 直接解构失去响应式
const { count } = state
count++  // 不影响 state.count

// ✅ toRefs 解构保持响应式
const { count } = toRefs(state)
count.value++  // state.count 也变化

// ✅ 或直接用 state.count
state.count++
```

**知识点：** `toRef` `toRefs` `reactive` `响应式解构` `属性链接`

:::

### Q16: shallowRef 和 shallowReactive 是什么？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**浅层响应式** - 只跟踪浅层变化，深层不追踪。

**shallowRef：**
```js
const state = shallowRef({ count: 0, nested: { value: 1 } })

// ✅ 浅层变化触发
state.value = { count: 1 }

// ❌ 深层变化不触发
state.value.count = 1  // 不触发更新
state.value.nested.value = 2  // 不触发更新

// 强制触发
triggerRef(state)  // 手动触发依赖更新
```

**shallowReactive：**
```js
const state = shallowReactive({
  count: 0,
  nested: { value: 1 }
})

// ✅ 浅层变化触发
state.count = 1
state.newProp = true

// ❌ 深层不追踪
state.nested.value = 2  // 不触发更新
```

**使用场景：**

**1. 大型对象/数组（性能优化）**
```js
// 不可变数据源
import { shallowRef } from 'vue'
const largeData = shallowRef(resultFromAPI)

// 替换整个对象时才更新
function refresh() {
  largeData.value = await fetchNewData()
}
```

**2. 第三方库实例**
```js
const editor = shallowRef(null)

onMounted(() => {
  editor.value = new CodeEditor(el, config)
  // 编辑器内部状态不追踪
})
```

**3. 表单数据（只追踪顶层）**
```js
const form = shallowReactive({
  name: '',
  email: '',
  profile: {}  // 不追踪深层
})

// 只追踪表单字段变化
form.name = 'John'  // ✅ 触发
form.profile.bio = '...'  // ❌ 不触发
```

**对比表：**

| API | 浅层 | 深层 | 替换整个 |
|-----|------|------|---------|
| ref | ✅ | ✅ | ✅ |
| shallowRef | ✅ | ❌ | ✅ |
| reactive | ✅ | ✅ | N/A |
| shallowReactive | ✅ | ❌ | N/A |

**转换 API：**
```js
// 浅层→深层
const deep = markRaw(shallowRef.value)  // 标记为非响应式
const shallow = shallowRef(deep)  // 再转浅层

// 或 markRaw 标记整个对象为非响应式
import { markRaw } from 'vue'
state.inactiveComponent = markRaw(new Component())
```

**性能收益：**
- 减少 Proxy 嵌套
- 降低内存占用
- 避免不必要的更新

**注意事项：**
- 需要手动触发时用 triggerRef
- 深层不响应，需替换整个对象
- 适合不可变数据模式

**知识点：** `shallowRef` `shallowReactive` `浅层响应式` `性能优化` `markRaw`

:::

### Q17: customRef 是什么？如何实现防抖 ref？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**customRef** - 自定义 ref 的创建和追踪行为。

**基本用法：**
```js
import { customRef } from 'vue'

function useDebouncedRef(value, delay = 200) {
  let timeout
  return customRef((track, trigger) => ({
    get() {
      track()  // 追踪依赖
      return value
    },
    set(newValue) {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        value = newValue
        trigger()  // 触发更新
      }, delay)
    }
  }))
}

// 使用
const searchText = useDebouncedRef('', 300)
```

**防抖 ref 完整实现：**
```js
function useDebouncedRef(initialValue, delay = 300) {
  let value = initialValue
  let timeout = null
  
  return customRef((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue) {
      if (timeout) clearTimeout(timeout)
      timeout = setTimeout(() => {
        value = newValue
        trigger()
      }, delay)
    }
  }))
}

// 组件中
const search = useDebouncedRef('', 500)
<input v-model="search" />  // 停止输入 500ms 后才更新
```

**其他用例：**

**1. 节流 ref**
```js
function useThrottledRef(value, interval = 200) {
  let lastTime = 0
  let timeout = null
  
  return customRef((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue) {
      const now = Date.now()
      if (now - lastTime >= interval) {
        value = newValue
        lastTime = now
        trigger()
      } else if (!timeout) {
        timeout = setTimeout(() => {
          value = newValue
          lastTime = Date.now()
          timeout = null
          trigger()
        }, interval - (now - lastTime))
      }
    }
  }))
}
```

**2. 带历史记录的 ref**
```js
function useRefWithHistory(initialValue, maxSize = 10) {
  let value = initialValue
  const history = [initialValue]
  let index = 0
  
  return customRef((track, trigger) => ({
    get() {
      track()
      return value
    },
    set(newValue) {
      value = newValue
      history.splice(index + 1, history.length - index - 1, newValue)
      if (history.length > maxSize) history.shift()
      index = history.length - 1
      trigger()
    }
  }))
}
```

**3. 异步 ref**
```js
function useAsyncRef(fetcher) {
  let value = null
  let pending = false
  
  return customRef((track, trigger) => ({
    get() {
      track()
      return { value, pending }
    },
    async set() {
      pending = true
      trigger()
      value = await fetcher()
      pending = false
      trigger()
    }
  }))
}
```

**track 和 trigger：**
- track(): 标记为依赖，组件渲染时调用
- trigger(): 通知依赖更新，set 时调用

**知识点：** `customRef` `防抖` `自定义 ref` `响应式`

:::
