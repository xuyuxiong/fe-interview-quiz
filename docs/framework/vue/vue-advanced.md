---
title: Vue 模板与进阶面试题
description: Vue 模板编译、mixin、slot、emit、transition、Vuex vs Pinia 等面试题
---

# Vue 模板与进阶面试题

### Q1: Vue 的模板编译过程是怎样的？

> **💀 困难 · Vue 进阶**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Vue 模板编译三阶段：**

```text
模板字符串 → parse → AST → transform → 优化AST → generate → render 函数
```

**1. 解析（Parse）— 模板 → AST**
```js
// 输入
const template = `<div id="app"><p>{{ message }}</p></div>`

// 输出 AST
const ast = {
  type: 'Element',
  tag: 'div',
  props: [{ type: 'Attribute', name: 'id', value: 'app' }],
  children: [{
    type: 'Element',
    tag: 'p',
    children: [{
      type: 'Interpolation',
      content: { type: 'Expression', content: 'message' }
    }]
  }]
}
```

**2. 转换（Transform）— AST 优化**
```js
// Vue 3 的 transform 阶段：
// - 标记静态节点（不会变化的节点）
// - 提升静态子树（hoistStatic）
// - 缓存事件处理器（cacheHandlers）
// - 标记 PatchFlag（精确更新）

// 静态提升
// 之前：每次渲染都创建静态 VNode
// 之后：静态 VNode 只创建一次，复用

// PatchFlag 标记
const PatchFlags = {
  TEXT: 1,           // 动态文本
  CLASS: 2,          // 动态 class
  STYLE: 4,          // 动态 style
  PROPS: 8,          // 动态属性
  FULL_PROPS: 16,    // 有动态 key
  HYDRATE_EVENTS: 32, // 有事件监听器
  STABLE_FRAGMENT: 64, // 稳定的 fragment
  // ...
}
```

**3. 生成（Generate）— AST → render 函数**
```js
// Vue 3 生成的 render 函数
import { createElementVNode as _createVNode, toDisplayString as _toDisplayString, Fragment as _Fragment, openBlock as _openBlock, createElementBlock as _createElementBlock } from 'vue'

export function render(_ctx) {
  return (_openBlock(), _createElementBlock('div', { id: 'app' }, [
    _createVNode('p', null, _toDisplayString(_ctx.message), 1 /* TEXT */)
  ]))
}

// Vue 2 生成的 render 函数
function render() {
  with(this) {
    return _c('div', { attrs: { id: 'app' } }, [
      _c('p', [_v(_s(message))])
    ])
  }
}
```

**知识点：** `模板编译` `AST` `parse` `transform` `generate` `静态提升` `PatchFlag`

:::

### Q2: Vue mixin 有什么问题？Composition API 如何解决？

> **🔥 中等 · Vue 进阶**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Mixin 的三大问题：**

```js
// 1. 命名冲突
const mouseMixin = {
  data() { return { x: 0, y: 0 } },    // ⚠️ 如果组件也有 x/y 会冲突
  methods: { update() {} }               // ⚠️ 方法也可能冲突
}

const scrollMixin = {
  data() { return { x: 0 } },           // ⚠️ 和 mouseMixin 的 x 冲突
  methods: { update() {} }              // ⚠️ 方法冲突，后者覆盖前者
}

// 2. 数据来源不清晰
export default {
  mixins: [mouseMixin, scrollMixin, themeMixin, loggerMixin],
  // ❌ x, y, update, theme 从哪来？根本看不出来
}

// 3. 隐式依赖
const loggerMixin = {
  methods: {
    log() {
      console.log(this.title)  // ⚠️ 隐式依赖组件的 title
    }
  }
}
```

**Composition API 的解决方案：**

```js
// 1. useMouse — 命名明确
function useMouse() {
  const x = ref(0)
  const y = ref(0)
  const update = (e) => { x.value = e.clientX; y.value = e.clientY }
  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))
  return { x, y }  // ✅ 想叫什么就叫什么
}

// 2. 使用时清晰
export default {
  setup() {
    const { x: mouseX, y: mouseY } = useMouse()  // ✅ 重命名，不冲突
    const { x: scrollX } = useScroll()            // ✅ 明确来源
    const { theme } = useTheme()
    return { mouseX, mouseY, scrollX, theme }
  }
}

// 3. 依赖显式
function useLogger(title) {  // ✅ 依赖作为参数传入
  const log = (msg) => console.log(`[${title}]`, msg)
  return { log }
}

// 对比总结
// | 问题 | Mixin | Composition API |
// |------|-------|----------------|
// | 命名冲突 | 后者覆盖 | 可重命名 |
// | 来源不清晰 | 隐式混入 | 显式引入 |
// | 隐式依赖 | this.xxx | 参数传入 |
// | 类型推导 | 无 | 有（TS） |
// | 代码复用 | 继承 | 组合 |
```

**知识点：** `Mixin` `Composition API` `命名冲突` `代码复用` `composables`

:::

### Q3: Vue 的 slot 插槽机制是怎样的？

> **🔥 中等 · Vue 进阶**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```vue
<!-- 1. 默认插槽 -->
<!-- 子组件 Card.vue -->
<template>
  <div class="card">
    <slot>默认内容</slot>
  </div>
</template>

<!-- 使用 -->
<Card>
  <p>这是插槽内容</p>
</Card>

<!-- 2. 具名插槽 -->
<!-- 子组件 Layout.vue -->
<template>
  <div class="layout">
    <header><slot name="header" /></header>
    <main><slot /></main>
    <footer><slot name="footer" /></footer>
  </div>
</template>

<!-- 使用 -->
<Layout>
  <template #header>
    <h1>页面标题</h1>
  </template>
  <template #default>
    <p>内容区域</p>
  </template>
  <template #footer>
    <p>页脚</p>
  </template>
</Layout>

<!-- 3. 作用域插槽 — 子组件向插槽传递数据 -->
<!-- 子组件 List.vue -->
<template>
  <ul>
    <li v-for="item in items" :key="item.id">
      <slot name="item" :item="item" :index="item.id">
        {{ item.name }} <!-- 默认渲染 -->
      </slot>
    </li>
  </ul>
</template>

<!-- 使用 — 自定义每项渲染 -->
<List :items="users">
  <template #item="{ item, index }">
    <span>{{ index }}. {{ item.name }} - {{ item.email }}</span>
  </template>
</List>

<!-- 4. 高级 — 可复用的无渲染组件 -->
<!-- DataFetcher.vue -->
<template>
  <slot :data="data" :loading="loading" :error="error" :refetch="fetch" />
</template>

<!-- 使用 -->
<DataFetcher :url="'/api/users'">
  <template #default="{ data, loading, error, refetch }">
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">{{ error.message }} <button @click="refetch">重试</button></div>
    <ul v-else>
      <li v-for="user in data" :key="user.id">{{ user.name }}</li>
    </ul>
  </template>
</DataFetcher>
```

| 插槽类型 | 语法 | 用途 |
|---------|------|------|
| 默认插槽 | `<slot>` | 传入任意内容 |
| 具名插槽 | `<slot name="xxx">` + `#xxx` | 多区域分发 |
| 作用域插槽 | `<slot :data="xxx">` + `#default="{ data }"` | 子传父数据 |

**知识点：** `slot` `具名插槽` `作用域插槽` `无渲染组件` `v-slot`

:::

### Q4: Vue 3 的 defineEmits 和 defineProps 怎么使用？

> **⭐ 简单 · Vue 进阶**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```vue
<!-- Child.vue -->
<script setup lang="ts">
// 1. defineProps
interface Props {
  title: string
  count?: number
  items?: string[]
}

// 方式1：泛型（推荐 ✅）
const props = defineProps<Props>()

// 方式2：运行时声明
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 },
  items: { type: Array, default: () => [] }
})

// 默认值 — withDefaults
const props = withDefaults(defineProps<Props>(), {
  count: 0,
  items: () => []
})

// 2. defineEmits
// 方式1：类型式（推荐 ✅）
const emit = defineEmits<{
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
  (e: 'change', value: string, oldValue: string): void
}>()

// 方式2：运行时声明
const emit = defineEmits(['update', 'delete', 'change'])

// 使用
emit('update', 'new value')
emit('delete', 123)

// 3. v-model 双向绑定
const modelValue = defineModel<string>()          // v-model
const title = defineModel<string>('title')        // v-model:title
const count = defineModel<number>('count', { required: true }) // v-model:count

// 等价于 Vue 2 的:
// props: ['modelValue', 'title', 'count'],
// emits: ['update:modelValue', 'update:title', 'update:count']
</script>

<!-- 父组件使用 -->
<template>
  <Child
    title="Hello"
    :count="5"
    @update="handleUpdate"
    @delete="handleDelete"
    v-model="name"
    v-model:title="pageTitle"
    v-model:count="itemCount"
  />
</template>
```

| API | 用途 | TypeScript |
|-----|------|-----------|
| `defineProps<T>()` | 声明props | 泛型 ✅ |
| `withDefaults` | 设置默认值 | 配合泛型 |
| `defineEmits<T>()` | 声明事件 | 函数重载 ✅ |
| `defineModel<T>()` | 双向绑定 | 3.4+ ✅ |
| `defineExpose` | 暴露给父组件 | 泛型 |

**知识点：** `defineProps` `defineEmits` `defineModel` `withDefaults` `v-model`

:::

### Q5: Vuex 和 Pinia 有什么区别？为什么推荐 Pinia？

> **🔥 中等 · Vue 进阶**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 对比 | Vuex 4 | Pinia |
|------|--------|-------|
| 模块 | modules + namespaced | 独立 store |
| Mutations | 必须通过 mutation 改状态 | 直接修改，无 mutation |
| TypeScript | 支持弱 | 完整支持 ✅ |
| 代码量 | 多（state/getter/mutation/action） | 少（state/getter/action） |
| Composition API | 不友好 | 天然支持 |
| DevTools | 支持 | 支持 |
| 插件 | 支持 | 支持 |
| SSR | 需要额外配置 | 内置支持 |
| 体积 | ~2KB | ~1KB |

```js
// Vuex 4 — 繁琐
const store = createStore({
  state: { count: 0 },
  getters: {
    double: (state) => state.count * 2
  },
  mutations: {
    INCREMENT(state) { state.count++ }     // 必须通过 mutation
  },
  actions: {
    increment({ commit }) {
      commit('INCREMENT')                   // 还要 commit
    }
  },
  modules: {
    user: {
      namespaced: true,
      state: { name: '' },
      mutations: { SET_NAME(state, name) { state.name = name } },
      actions: { setName({ commit }, name) { commit('SET_NAME', name) } }
    }
  }
})

// 使用
this.$store.dispatch('user/setName', '张三')
this.$store.state.user.name
```

```ts
// Pinia — 简洁
// stores/counter.ts
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  const increment = () => count.value++    // 直接修改，无 mutation

  return { count, double, increment }
})

// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const name = ref('')
  const setName = (newName: string) => { name.value = newName }
  return { name, setName }
})

// 组件中使用
import { useCounterStore, useUserStore } from '@/stores'

const counter = useCounterStore()
counter.increment()         // ✅ 直接调用
counter.count++             // ✅ 直接修改

const user = useUserStore()
user.setName('张三')        // ✅ 清晰明了
```

**Pinia 为什么更好？**

1. **无 Mutation** — 减少样板代码，直接修改或使用 action
2. **完美 TS** — 类型自动推导，无需手写类型
3. **Composition API** — 和 setup 完美融合
4. **轻量** — 删除了不必要的概念
5. **模块扁平** — 每个 store 独立，无需嵌套模块
6. **DevTools** — 完整支持时间旅行调试

**知识点：** `Vuex` `Pinia` `状态管理` `mutation` `Composition Store` `TypeScript`

:::

### Q6: Vue 的 transition 和动画系统怎么使用？

> **🔥 中等 · Vue 进阶**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```vue
<!-- 1. 单元素过渡 -->
<template>
  <button @click="show = !show">Toggle</button>
  <transition name="fade">
    <p v-if="show">Hello!</p>
  </transition>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<!-- 2. 自定义过渡类名（配合 Animate.css） -->
<transition
  enter-active-class="animate__animated animate__fadeIn"
  leave-active-class="animate__animated animate__fadeOut"
>
  <p v-if="show">Animated!</p>
</transition>

<!-- 3. JavaScript 钩子 -->
<transition
  @before-enter="beforeEnter"
  @enter="onEnter"
  @after-enter="afterEnter"
  @before-leave="beforeLeave"
  @leave="onLeave"
  @after-leave="afterLeave"
>
  <div v-if="show">JS Animation</div>
</transition>

<script setup>
import { animate } from '@/utils/animation'

const onEnter = (el, done) => {
  // el = 真实 DOM 元素
  // done = 动画完成的回调
  animate(el, { opacity: 1, transform: 'scale(1)' }, { duration: 500 })
    .then(done)
}

const onLeave = (el, done) => {
  animate(el, { opacity: 0, transform: 'scale(0)' }, { duration: 500 })
    .then(done)
}
</script>

<!-- 4. 列表过渡（<TransitionGroup>） -->
<TransitionGroup name="list" tag="ul">
  <li v-for="item in items" :key="item.id">{{ item.text }}</li>
</TransitionGroup>

<style>
.list-enter-active, .list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from { opacity: 0; transform: translateX(-30px); }
.list-leave-to { opacity: 0; transform: translateX(30px); }
.list-move { transition: transform 0.5s; }  /* 移动动画 */
.list-leave-active { position: absolute; }   /* 离开时绝对定位 */
</style>

<!-- 5. 模式 — 同时 vs 顺序 -->
<transition name="fade" mode="out-in">  <!-- 先出后进 -->
  <component :is="currentView" />
</transition>

<transition name="fade" mode="in-out">  <!-- 先进后出 -->
  <component :is="currentView" />
</transition>
```

| 类名 | 阶段 |
|------|------|
| `v-enter-from` | 进入开始 |
| `v-enter-active` | 进入过程 |
| `v-enter-to` | 进入结束 |
| `v-leave-from` | 离开开始 |
| `v-leave-active` | 离开过程 |
| `v-leave-to` | 离开结束 |

**知识点：** `transition` `TransitionGroup` `动画钩子` `CSS过渡` `Animate.css` `列表动画`

:::

### Q7: Vue 3 的 provide/inject 什么时候用？和 Pinia 有什么区别？

> **🔥 中等 · Vue 进阶**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**适用场景：**

| provide/inject | Pinia |
|---------------|-------|
| 组件树内共享（祖先→后代） | 全局共享（任何组件） |
| 轻量、临时方案 | 完整状态管理 |
| 适合主题、配置、i18n | 适合业务数据、全局状态 |
| 无 DevTools 支持 | DevTools 时间旅行 |
| 无持久化 | 可配合插件持久化 |

```ts
// provide/inject — 主题配置
// ThemeProvider.vue
import { provide, ref, readonly } from 'vue'
import { THEME_KEY } from './keys'

const theme = ref<'light' | 'dark'>('light')
const toggleTheme = () => {
  theme.value = theme.value === 'light' ? 'dark' : 'light'
}

// readonly 防止子组件直接修改
provide(THEME_KEY, { theme: readonly(theme), toggleTheme })

// DeepChild.vue
import { inject } from 'vue'
import { THEME_KEY } from './keys'

const { theme, toggleTheme } = inject(THEME_KEY)!
// 只能通过 toggleTheme 修改，不能直接改 theme

// 2. TypeScript 类型安全
interface ThemeContext {
  theme: Readonly<Ref<'light' | 'dark'>>
  toggleTheme: () => void
}

const THEME_KEY: InjectionKey<ThemeContext> = Symbol('theme')

provide(THEME_KEY, { theme: readonly(theme), toggleTheme })
const ctx = inject(THEME_KEY)! // 自动类型推导

// 3. 默认值
const config = inject('config', { color: 'blue' })         // 字面量默认值
const locale = inject('locale', () => detectLocale(), true) // 工厂函数默认值
```

**最佳实践：**

1. **总是用 `readonly` 包裹 provide 的值** — 防止子组件随意修改
2. **用 Symbol 做 key** — 避免命名冲突
3. **用 InjectionKey 做类型** — TypeScript 支持
4. **只传数据和方法，不直接传 ref** — 单向数据流

**知识点：** `provide/inject` `InjectionKey` `readonly` `依赖注入` `组件通信`

:::

### Q8: Vue 组件的 name 属性有什么用？

> **⭐ 简单 · Vue 进阶**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```vue
<!-- 1. 递归组件 — 组件内调用自己 -->
<script setup>
// 方式1：使用 defineOptions（Vue 3.3+）
defineOptions({ name: 'TreeNode' })
</script>

<template>
  <div>
    <span>{{ node.label }}</span>
    <TreeNode
      v-for="child in node.children"
      :key="child.id"
      :node="child"
    />
  </div>
</template>

<!-- 2. keep-alive 的 include/exclude -->
<KeepAlive include="Home,Dashboard">
  <router-view />
</KeepAlive>
<!-- 这里用的是组件 name -->

<!-- 3. DevTools 中显示名称 — 调试友好 -->
<!-- 没有 name: <Anonymous> 或 <index>
     有 name: <UserCard> ✅ 清晰 -->

<!-- 4. Vue 2 中 <keep-alive> 和递归必须要有 name -->

<!-- 5. Vue 3 <script setup> 中的 name -->
<!-- 方式1：defineOptions（Vue 3.3+ ✅ 推荐） -->
<script setup>
defineOptions({ name: 'UserCard' })
</script>

<!-- 方式2：双 script（3.3 之前） -->
<script>
export default { name: 'UserCard' }
</script>
<script setup>
// setup 逻辑
</script>

<!-- 方式3：unplugin-vue-define-options 插件 -->
```

| 用途 | 说明 |
|------|------|
| 递归组件 | 通过 name 在模板中调用自身 |
| KeepAlive | include/exclude 匹配组件名 |
| DevTools | 调试时显示可读名称 |
| 事件 | 在组件上使用时提供有意义的名称 |

**知识点：** `组件name` `递归组件` `defineOptions` `KeepAlive` `DevTools`

:::

### Q9: Vue 3 的 Teleport 组件有什么用？

> **🔥 中等 · Vue 进阶**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Teleport — 将组件内容"传送"到 DOM 其他位置**

```vue
<!-- 1. 模态框 — 最常见场景 -->
<template>
  <button @click="showModal = true">打开弹窗</button>

  <!-- Teleport 将内容渲染到 body 下 -->
  <Teleport to="body">
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal-content" @click.stop>
        <h2>弹窗标题</h2>
        <p>弹窗内容</p>
        <button @click="showModal = false">关闭</button>
      </div>
    </div>
  </Teleport>
</template>

<!-- 2. 多个 Teleport — 按顺序渲染 -->
<Teleport to="#modals">
  <div>A</div>
</Teleport>
<Teleport to="#modals">
  <div>B</div>
</Teleport>
<!-- 渲染顺序: A → B（即使交叉出现） -->

<!-- 3. 条件禁用 Teleport -->
<Teleport to="body" :disabled="isMobile">
  <!-- isMobile 为 true 时，内容留在原位 -->
  <div>内容</div>
</Teleport>

<!-- 4. 全局通知 -->
<template>
  <Teleport to="#notifications">
    <TransitionGroup name="notify">
      <div v-for="n in notifications" :key="n.id" class="notify">
        {{ n.message }}
      </div>
    </TransitionGroup>
  </Teleport>
</template>
```

**为什么不用直接放在 body？**

```text
❌ 直接在 body 下写：
  - 组件上下文丢失（无法访问父组件状态）
  - 样式作用域失效（scoped 不起作用）
  - 事件冒泡不正常

✅ Teleport：
  - 保持在组件树内（事件冒泡正常）
  - 保持样式作用域
  - 逻辑在组件内，渲染在别处
```

| 属性 | 说明 |
|------|------|
| `to` | 目标选择器（必填），如 `body`、`#modals` |
| `disabled` | 是否禁用传送，为 true 则留在原位 |

**知识点：** `Teleport` `传送门` `模态框` `全局通知` `Portal`

:::

### Q10: Vue 的错误处理有哪些方式？

> **🔥 中等 · Vue 进阶**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 1. 全局错误处理 — app.config.errorHandler
const app = createApp(App)
app.config.errorHandler = (err, instance, info) => {
  console.error('全局错误:', err)
  console.error('组件实例:', instance)
  console.error('错误来源:', info)  // 如 "render function"、"v-on handler"
  // 上报错误
  reportError(err, { info })
}

// 2. 全局警告处理 — app.config.warnHandler
app.config.warnHandler = (msg, instance, trace) => {
  // 生产环境忽略警告
  if (import.meta.env.PROD) return
  console.warn('Vue 警告:', msg)
}

// 3. 组件内错误捕获 — errorCaptured
export default {
  errorCaptured(err, instance, info) {
    // 捕获后代组件的错误
    // 返回 false 阻止错误继续向上传播
    console.error('子组件错误:', err)
    this.hasError = true
    return false  // 阻止冒泡
  }
}

// 4. 生命周期错误 — onErrorCaptured（Composition API）
import { onErrorCaptured } from 'vue'

onErrorCaptured((err, instance, info) => {
  console.error('捕获错误:', err)
  return false  // 阻止冒泡
})

// 5. 异步组件错误处理
const AsyncComp = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: Loading,
  errorComponent: ErrorDisplay,
  delay: 200,
  timeout: 3000
})

// 6. watch / watchEffect 错误处理
watch(source, (val) => {
  try {
    // 可能在回调中出错的逻辑
    processData(val)
  } catch (err) {
    console.error('watch 错误:', err)
  }
}, { onError: (err) => {  // Vue 3.5+ watchEffect 支持
  reportError(err)
}})

// 7. 事件处理错误
// Vue 3 不会自动捕获事件处理器中的错误，需要手动 try/catch
// 或使用全局 errorHandler
```

**错误传播链：**

```text
组件内错误
  → errorCaptured（当前组件）
  → errorCaptured（父组件）
  → errorCaptured（祖先组件）
  → app.config.errorHandler（全局）
  → window.onerror / unhandledrejection
```

| 方式 | 作用范围 | 返回 false 阻止冒泡 |
|------|---------|-------------------|
| `errorHandler` | 全局 | 不适用 |
| `warnHandler` | 全局警告 | 不适用 |
| `errorCaptured` | 后代组件 | ✅ |
| `onErrorCaptured` | 后代组件 | ✅ |

**知识点：** `errorHandler` `errorCaptured` `onErrorCaptured` `错误边界` `异步组件`

:::
### Q11: Vue 模板编译的三个阶段？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Vue 模板编译三阶段：parse → transform → generate**

**1. Parse（解析）** - 模板字符串 → AST
```js
const template = `<div><p>{{ msg }}</p></div>`

// 解析为 AST
const ast = {
  type: 1,  // 元素节点
  tag: 'div',
  children: [{
    type: 1,
    tag: 'p',
    children: [{
      type: 2,  // 插值节点
      content: { content: 'msg' }
    }]
  }]
}
```

**2. Transform（转换）** - AST 优化
```js
// 静态节点标记
if (node.type === 1 && isStatic(node)) {
  node.patchFlag = 0  // 静态节点，跳过 diff
}

// 动态节点收集
if (node.type === 5) {  // 插值
  dynamicChildren.push(node)
}

// 优化提升（hoistStatic）
// 静态节点提升为常量，避免重复创建
const hoisted = Blockly.createVNode('div', null, 'static')
```

**3. Generate（生成）** - AST → render 函数
```js
// 生成的 render 函数
function render(_ctx, _cache) {
  return _createElementVNode('div', null, [
    _createElementVNode('p', null, _toDisplayString(_ctx.msg), 1 /* TEXT */)
  ])
}
```

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
  _hoisted_1,  // 直接复用
  _createElementVNode('span', null, _toDisplayString(dynamic), 1)
])
```

**2. 补丁标志（Patch Flags）**
```js
// 标记动态类型，diff 时跳过静态部分
_createElementVNode('span', null, text, 1 /* TEXT */)
_createElementVNode('div', { class: cls }, null, 2 /* CLASS */)
_createElementVNode('button', { onClick: handler }, null, 8 /* PROPS */)
```

**3. 树 Flutter（Block Tree）**
```js
// 只收集动态子节点，diff 时跳过静态分支
const block = {
  type: Block,
  dynamicChildren: [动态节点数组]
}
```

** runtime + compile vs runtime-only：**
```js
// runtime + compiler（完整版）
// 支持 template 选项
new Vue({ template: '<div>{{ msg }}</div>' })

// runtime-only（运行时版，体积更小）
// 需要预编译
new Vue({ render: h('div', this.msg) })
```

**知识点：** `模板编译` `AST` `静态提升` `Patch Flags` `render 函数`

:::

### Q12: KeepAlive 组件原理？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**KeepAlive** 是 Vue 的内置组件，缓存动态组件，避免重复渲染。

**基本用法：**
```vue
<template>
  <keep-alive>
    <component :is="currentComponent" />
  </keep-alive>
</template>

<!-- 或路由 -->
<router-view v-slot="{ Component }">
  <keep-alive>
    <component :is="Component" />
  </keep-alive>
</router-view>

<!-- 条件缓存 -->
<keep-alive :include="['Home', 'About']">
  <component :is="Current" />
</keep-alive>

<keep-alive :exclude="['NoCache']">
  <component :is="Current" />
</keep-alive>

<!-- 最大缓存数 -->
<keep-alive :max="10">
  <component :is="Current" />
</keep-alive>
```

**生命周期钩子：**
```vue
<script setup>
onActivated(() => {
  console.log('组件被激活')
})

onDeactivated(() => {
  console.log('组件被停用')
})
</script>
```

**原理：**

**1. 缓存结构**
```js
// KeepAlive 内部维护两个 Map
const cache = new Map()      // key -> vnode
const keys = new Set()       // 缓存的 key 集合

// 组件实例保存在 vnode.component
```

**2. 缓存流程**
```js
// 组件挂载
if (cache.has(key)) {
  vnode.component = cache.get(key).component  // 复用实例
  vnode.el = cache.get(key).el
} else {
  cache.set(key, vnode)  // 首次创建并缓存
  keys.add(key)
}

// 组件卸载（实际是停用）
if (keys.size > max) {
  const firstKey = keys.keys().next().value
  pruneCacheEntry(cache.get(firstKey))  // 删除最旧的
}
```

**3. 匹配规则**
```js
function matches(pattern, name) {
  if (Array.isArray(pattern)) {
    return pattern.some(p => matches(p, name))
  } else if (typeof pattern === 'string') {
    return pattern.split(',').includes(name)
  } else if (pattern instanceof RegExp) {
    return pattern.test(name)
  }
}
```

**适用场景：**
- 表单页面缓存（返回保留填写内容）
- 列表详情切换（保持列表位置）
- Tab 切换缓存

**注意事项：**
- 无名字的组件无法被缓存
- 配合 include/exclude 控制缓存范围
- max 限制防止内存泄漏

**知识点：** `KeepAlive` `组件缓存` `onActivated` `onDeactivated` `LRU`

:::

### Q13: Teleport 组件是什么？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Teleport** 是 Vue 3 的内置组件，将子组件渲染到 DOM 的其他位置。

**基本用法：**
```vue
<template>
  <teleport to="body">
    <div class="modal">
      <slot />
    </div>
  </teleport>
</template>

<!-- 或指定选择器 -->
<teleport to="#modal-root">
  <Modal />
</teleport>

<teleport to=".dropdown-container">
  <Dropdown />
</teleport>
```

**使用场景：**

**1. 模态框**
```vue
<template>
  <button @click="open = true">打开弹窗</button>
  
  <teleport to="body">
    <div v-if="open" class="modal-overlay">
      <div class="modal">
        <slot />
        <button @click="open = false">关闭</button>
      </div>
    </div>
  </teleport>
</template>

<style>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  /* 不受父元素 overflow 影响 */
}
</style>
```

**2. 通知/Toast**
```vue
<teleport to="body">
  <transition-group name="toast">
    <Toast v-for="t in toasts" :key="t.id" />
  </transition-group>
</teleport>
```

**3. 下拉菜单**
```vue
<teleport to="body">
  <div v-if="open" class="dropdown-menu">
    <slot />
  </div>
</teleport>
```

**Teleport vs Portal（React）：**
- Vue 3 内置，React 需要 react-dom/createPortal
- 使用方式类似

**disable 属性：**
```vue
<!-- 条件禁用 teleport -->
<teleport to="body" :disabled="isMobile">
  <Modal />
</teleport>
<!-- disabled=true 时渲染到原位置 -->
```

**注意事项：**
- to 必须是有效的 CSS 选择器
- 目标元素必须存在于 DOM 中
- 可以与 transition-group 配合
- disabled 时渲染到当前位置

**知识点：** `Teleport` `DOM  teleport` `模态框` `Portal`

:::

### Q14: provide/inject 和 Props 传递的区别？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Props 传递：** 显式、逐层传递
```vue
<!-- 祖父组件 -->
<Parent :user="user" />

<!-- 父组件 -->
<Child :user="user" />

<!-- 子组件 -->
<GrandChild :user="user" />
```

**provide/inject：** 隐式、跨层级传递
```vue
<!-- 祖先组件 -->
<script setup>
const user = ref({ name: 'John' })
provide('user', user)  // 或 provide('user', { user, updateUser })
</script>

<!-- 后代组件（任意层级） -->
<script setup>
const user = inject('user')
// 或带默认值
const theme = inject('theme', 'light')
// 或响应式
const user = inject('user', ref(null))
</script>
```

**对比：**

| 维度 | Props | provide/inject |
|------|-------|----------------|
| 传递方向 | 父→子 | 祖先→后代 |
| 显式性 | 显式 | 隐式 |
| 层级 | 相邻 | 跨任意层 |
| 类型推导 | ✅ 完整 | ⚠️ 需手动定义 |
| 可维护性 | 高 | 中（依赖链不清晰） |

**provide/inject 使用场景：**

**1. 主题/配置**
```js
// 祖先
provide('theme', {
  primary: '#007bff',
  dark: computed(() => isDark.value)
})

// 后代
const theme = inject('theme')
<div :style="{ color: theme.primary }">
```

**2. 共享状态（小型应用）**
```js
// 祖先
const store = reactive({ user: null, token: null })
provide('store', store)

// 后代
const store = inject('store')
```

**3. 组件库内部**
```js
// 组件库
provide('form', {
  model: props.modelValue,
  update: (v) => emit('update:modelValue', v)
})
```

**组合使用：**
```vue
<!-- Props 用于外部传入 -->
<template>
  <Form :model="formData">
    <FormItem prop="name" />  <!-- inject 获取 Form 上下文 -->
  </Form>
</template>

<!-- Form 组件 -->
<script setup>
const props = defineProps(['model'])
provide('formContext', { model: props.model })
</script>
```

**最佳实践：**
- Props 优先（显式优于隐式）
- 跨层级共享用 provide/inject
- 大型应用用 Pinia/Vuex
- 定义 Symbol key 避免冲突

```js
export const themeKey = Symbol('theme')
provide(themeKey, theme)
const theme = inject(themeKey)
```

**知识点：** `provide` `inject` `Props` `跨层级通信` `依赖注入`

:::
