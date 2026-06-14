---
title: Vue Router 面试题
description: Vue Router 路由模式、导航守卫、懒加载、动态路由等面试题
---

# Vue Router 面试题

### Q1: Vue Router 的 hash 模式和 history 模式有什么区别？

> **🔥 中等 · Vue Router**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 维度 | hash 模式 | history 模式 |
|------|----------|-------------|
| URL 格式 | `/#/page` | `/page` |
| 原理 | `hashchange` 事件 | `popstate` 事件 + `pushState/replaceState` |
| 服务器配置 | 不需要 | 需要配置 fallback 到 index.html |
| SEO | 不友好（# 后面不发送） | 友好 |
| 兼容性 | IE8+ | IE10+ |
| 刷新 | 不会 404 | 不配置服务器会 404 |

```js
// hash 模式原理
window.addEventListener('hashchange', () => {
  const path = window.location.hash.slice(1) // 去掉 #
  router.push(path)
})

// history 模式原理
window.addEventListener('popstate', (e) => {
  router.push(location.pathname)
})

// 编程式导航使用 pushState 不会触发 popstate
history.pushState(state, '', '/new-path')
```

```js
// Vue Router 创建方式
import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'

// hash 模式
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// history 模式（推荐）
const router = createRouter({
  history: createWebHistory(),
  routes
})
```

```nginx
# Nginx 配置 - history 模式必须
location / {
  try_files $uri $uri/ /index.html
}
```

**知识点：** `Vue Router` `hash模式` `history模式` `pushState` `SPA路由`

:::

### Q2: Vue Router 的导航守卫执行顺序是什么？

> **💀 困难 · Vue Router**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**完整导航解析流程：**

```text
1. 导航被触发
2. 调用失活组件的 beforeRouteLeave（组件内守卫）
3. 调用全局的 beforeEach（全局前置守卫）
4. 在重用的组件里调用 beforeRouteUpdate（组件内守卫）
5. 调用路由配置里的 beforeEnter（路由独享守卫）
6. 解析异步路由组件
7. 在被激活的组件里调用 beforeRouteEnter（组件内守卫）
8. 调用全局的 beforeResolve（全局解析守卫）
9. 导航被确认
10. 调用全局的 afterEach（全局后置钩子）
11. 触发 DOM 更新
12. 调用 beforeRouteEnter 守卫中传给 next 的回调函数
```

```js
// 1. 全局前置守卫
router.beforeEach((to, from, next) => {
  // 登录验证
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login')
  } else {
    next()
  }
})

// 2. 路由独享守卫
const routes = [
  {
    path: '/admin',
    beforeEnter: (to, from, next) => {
      // 只有此路由才验证
      if (isAdmin()) next()
      else next('/403')
    }
  }
]

// 3. 组件内守卫
export default {
  beforeRouteEnter(to, from, next) {
    // 不能访问 this（组件实例还未创建）
    next(vm => {
      // 通过 vm 访问组件实例
    })
  },
  beforeRouteUpdate(to, from, next) {
    // 路由参数变化时（如 /user/1 → /user/2）
    this.loadUser(to.params.id)
    next()
  },
  beforeRouteLeave(to, from, next) {
    // 离开确认
    if (this.hasUnsavedChanges) {
      if (confirm('确定离开？未保存的数据将丢失')) next()
      else next(false)
    } else {
      next()
    }
  }
}

// 4. 全局解析守卫
router.beforeResolve(async (to) => {
  // 确保所有守卫和异步组件都已解析
  if (to.meta.requiresData) {
    await store.dispatch('fetchData')
  }
})

// 5. 全局后置钩子
router.afterEach((to, from) => {
  // 修改页面标题、上报 PV 等
  document.title = to.meta.title || '默认标题'
  analytics.trackPageView(to.fullPath)
})
```

**知识点：** `导航守卫` `beforeEach` `beforeRouteLeave` `beforeEnter` `afterEach` `next()`

:::

### Q3: Vue Router 路由懒加载有哪几种方式？

> **⭐ 简单 · Vue Router**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 1. 动态 import（最常用 ✅）
const routes = [
  {
    path: '/about',
    component: () => import('../views/About.vue')
  }
]

// 2. Webpack 魔法注释 — 分组打包
const routes = [
  {
    path: '/about',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/contact',
    component: () => import(/* webpackChunkName: "about" */ '../views/Contact.vue')
    // about 和 contact 会打包到同一个 chunk
  }
]

// 3. Vite 的 import 方式
const routes = [
  {
    path: '/about',
    component: () => import('../views/About.vue')
    // Vite 自动代码分割
  }
]

// 4. 高级 — 按菜单分组
const loadView = (view) => () => import(`../views/${view}.vue`)

const routes = [
  { path: '/home', component: loadView('Home') },
  { path: '/user', component: loadView('User') }
]

// 5. 带预加载的懒加载
const routes = [
  {
    path: '/about',
    component: () => import('../views/About.vue'),
    meta: { preload: true }
  }
]
router.beforeResolve((to) => {
  if (to.meta.preload) {
    // 预加载即将进入的路由
  }
})
```

| 方式 | 适用场景 | 打包行为 |
|------|---------|---------|
| 动态 import | 通用 | 每个路由独立 chunk |
| webpackChunkName | 相关路由分组 | 多路由合并一个 chunk |
| 动态路径 | 菜单驱动路由 | 按目录分割 |
| 统一加载函数 | 大量路由管理 | 灵活，可分组 |

**知识点：** `路由懒加载` `动态import` `代码分割` `webpackChunkName` `Vite`

:::

### Q4: Vue Router 动态路由和嵌套路由怎么用？

> **🔥 中等 · Vue Router**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 1. 动态路由参数
const routes = [
  // 动态路径参数以 : 标记
  { path: '/user/:id', component: User },
  // 可匹配 /user/123, /user/abc

  // 可选参数
  { path: '/user/:id?', component: User },      // id 可选
  // 可重复参数
  { path: '/files/:path+', component: Files },   // /files/a/b/c
  // 自定义正则
  { path: '/user/:id(\\d+)', component: User }   // id 只能是数字
]

// 在组件中获取参数
import { useRoute } from 'vue-router'
const route = useRoute()
console.log(route.params.id) // 123

// 2. 嵌套路由
const routes = [
  {
    path: '/user/:id',
    component: User,
    children: [
      { path: '', component: UserHome },            // /user/123
      { path: 'profile', component: UserProfile },  // /user/123/profile
      { path: 'posts', component: UserPosts },      // /user/123/posts
    ]
  }
]

// User.vue 中必须有 <router-view>
<template>
  <div>
    <h2>User {{ $route.params.id }}</h2>
    <nav>
      <router-link to="profile">Profile</router-link>
      <router-link to="posts">Posts</router-link>
    </nav>
    <router-view />  <!-- 子路由渲染在这里 -->
  </div>
</template>

// 3. 编程式导航
import { useRouter } from 'vue-router'
const router = useRouter()

// push
router.push('/user/123')
router.push({ name: 'user', params: { id: 123 } })
router.push({ path: '/user', query: { name: '张三' } })  // /user?name=张三

// replace — 不留历史记录
router.replace('/login')

// go
router.go(-1) // 后退
router.go(1)  // 前进

// 4. 动态添加路由（权限控制）
const adminRoute = {
  path: '/admin',
  component: () => import('../views/Admin.vue'),
  meta: { requiresAuth: true }
}

if (user.role === 'admin') {
  router.addRoute(adminRoute)
}

// 删除路由
router.removeRoute('admin')
```

**知识点：** `动态路由` `嵌套路由` `路由参数` `编程式导航` `addRoute` `权限路由`

:::

### Q5: Vue Router 的路由元信息 meta 有什么用？

> **⭐ 简单 · Vue Router**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 定义路由 meta
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      requiresAuth: true,    // 需要登录
      title: '仪表盘',        // 页面标题
      roles: ['admin'],       // 允许的角色
      keepAlive: true,        // 需要缓存
      transition: 'slide'     // 过渡动画
    }
  },
  {
    path: '/login',
    component: Login,
    meta: {
      requiresAuth: false,
      title: '登录'
    }
  }
]

// 1. 在全局守卫中使用 meta
router.beforeEach((to, from) => {
  // 设置页面标题
  document.title = to.meta.title || '默认标题'

  // 登录验证
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})

// 2. 在组件中使用 meta
import { useRoute } from 'vue-router'
const route = useRoute()
console.log(route.meta.requiresAuth) // true

// 3. TypeScript 类型扩展
import 'vue-router'
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    title?: string
    roles?: string[]
    keepAlive?: boolean
    transition?: string
  }
}

// 4. 配合 KeepAlive 使用
<router-view v-slot="{ Component, route }">
  <keep-alive>
    <component :is="Component" v-if="route.meta.keepAlive" />
  </keep-alive>
  <component :is="Component" v-if="!route.meta.keepAlive" />
</router-view>

// 5. 配合过渡动画
<router-view v-slot="{ Component, route }">
  <transition :name="route.meta.transition || 'fade'">
    <component :is="Component" />
  </transition>
</router-view>
```

| meta 字段 | 用途 | 使用场景 |
|-----------|------|---------|
| requiresAuth | 登录验证 | 全局守卫 |
| title | 页面标题 | 后置钩子 |
| roles | 权限控制 | 角色验证守卫 |
| keepAlive | 页面缓存 | 配合 KeepAlive |
| transition | 过渡动画 | 配合 transition |
| breadcrumb | 面包屑 | 导航组件 |

**知识点：** `路由元信息` `meta` `RouteMeta` `权限控制` `页面标题`

:::

### Q6: Vue Router 如何实现路由过渡动画？

> **🔥 中等 · Vue Router**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```vue
<!-- 1. 基本过渡 -->
<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<!-- 2. 基于 meta 的动态过渡 -->
<template>
  <router-view v-slot="{ Component, route }">
    <transition :name="route.meta.transition || 'fade'" mode="out-in">
      <component :is="Component" :key="route.path" />
    </transition>
  </router-view>
</template>

<!-- 3. 基于路由方向的过渡（前进/后退） -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const transitionName = ref('slide-right')

router.beforeEach((to, from) => {
  const toIndex = to.meta.index || 0
  const fromIndex = from.meta.index || 0
  transitionName.value = toIndex > fromIndex ? 'slide-left' : 'slide-right'
})
</script>

<template>
  <router-view v-slot="{ Component }">
    <transition :name="transitionName" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
/* 滑动过渡 */
.slide-left-enter-active, .slide-left-leave-active,
.slide-right-enter-active, .slide-right-leave-active {
  transition: transform 0.3s ease;
}

.slide-left-enter-from { transform: translateX(100%); }
.slide-left-leave-to { transform: translateX(-100%); }
.slide-right-enter-from { transform: translateX(-100%); }
.slide-right-leave-to { transform: translateX(100%); }
</style>
```

| 过渡模式 | 说明 |
|---------|------|
| `out-in` | 当前元素先离开，新元素再进入（推荐） |
| `in-out` | 新元素先进入，当前元素再离开 |
| 默认 | 同时进出（可能闪烁） |

**知识点：** `路由过渡` `transition` `mode` `v-slot` `动态过渡`

:::

### Q7: Vue Router 滚动行为如何控制？

> **⭐ 简单 · Vue Router**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 1. 浏览器前进/后退时恢复滚动位置
    if (savedPosition) {
      return savedPosition
    }

    // 2. 锚点定位
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }

    // 3. 不同路由不同滚动位置
    if (to.meta.keepScroll) {
      return false // 不滚动
    }

    // 4. 默认回到顶部
    return { top: 0, behavior: 'smooth' }

    // 5. 滚动到特定元素
    // return { el: '#main-content', top: 100, behavior: 'smooth' }

    // 6. 异步滚动（等待页面渲染完成）
    // return new Promise(resolve => {
    //   setTimeout(() => resolve({ top: 0 }), 300)
    // })
  }
})
```

**常见场景：**

| 场景 | 返回值 |
|------|--------|
| 回到顶部 | `{ top: 0 }` |
| 平滑滚动 | `{ top: 0, behavior: 'smooth' }` |
| 锚点定位 | `{ el: '#section' }` |
| 恢复位置 | `savedPosition` |
| 不滚动 | `false` |
| 延迟滚动 | `Promise` |

**知识点：** `滚动行为` `scrollBehavior` `savedPosition` `锚点` `平滑滚动`

:::

### Q8: Vue Router 4 有哪些新特性？

> **🔥 中等 · Vue Router**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 特性 | Vue Router 3 | Vue Router 4 |
|------|-------------|-------------|
| 初始化 | `new VueRouter()` | `createRouter()` |
| History 模式 | `mode: 'history'` | `history: createWebHistory()` |
| 动态路由 | `router.addRoutes([])` | `router.addRoute(route)` |
| 删除路由 | 不支持 | `router.removeRoute(name)` |
| 通配符 | `path: '*'` | `path: '/:pathMatch(.*)*` |
| 路由匹配 | `path-to-regexp` | 自定义匹配器 |
| TypeScript | 弱类型 | 完整类型支持 |
| `<router-view>` | 组件 | 支持 `v-slot` 作用域 |

```js
// Vue Router 4 新增特性

// 1. 动态路由 — 更精细的 API
router.addRoute({ path: '/admin', component: Admin })          // 添加路由
router.addRoute('parent', { path: 'child', component: Child }) // 嵌套添加
router.removeRoute('admin')                                     // 删除路由
router.hasRoute('admin')                                        // 检查路由
router.getRoutes()                                              // 获取所有路由

// 2. 导航守卫返回值
// VR3: 必须 next() / next(false) / next('/path')
// VR4: 返回值即可，next 仍可用但不推荐
router.beforeEach((to, from) => {
  if (!isAuthenticated()) return '/login'    // ✅ 直接返回路径
  if (to.meta.requiresAdmin) return false    // ✅ 取消导航
  return true                                // ✅ 确认导航（可省略）
})

// 3. <router-view> v-slot
<router-view v-slot="{ Component, route }">
  <transition name="fade" mode="out-in">
    <keep-alive>
      <component :is="Component" :key="route.path" />
    </keep-alive>
  </transition>
</router-view>

// 4. 编码历史状态
router.push({ path: '/user', state: { from: 'home' } })
// 浏览器 history.state 中可以携带额外数据
```

**知识点：** `Vue Router 4` `addRoute` `removeRoute` `导航守卫` `v-slot` `createRouter`

:::### Q9: Vue Router 导航守卫有哪些？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**导航守卫分为三类：全局守卫、路由独享守卫、组件内守卫**

```text
导航执行顺序：
1. beforeRouteLeave（组件内 — 离开当前页）
2. beforeEach（全局 — 每次导航前）
3. beforeEnter（路由独享 — 进入该路由前）
4. beforeRouteEnter（组件内 — 进入新页）
5. beforeResolve（全局 — 导航确认前）
6. afterEach（全局 — 导航完成后）
```

**1. 全局守卫：**

```js
const router = createRouter({ ... })

// 全局前置守卫 — 最常用
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('token')
  if (to.meta.requireAuth && !isLoggedIn) {
    next('/login')  // 重定向到登录
  } else {
    next()  // 放行
  }
})

// 全局解析守卫 — 在路由独享和组件守卫之后
router.beforeResolve(async (to) => {
  if (to.meta.requireData) {
    await store.dispatch('fetchData')
  }
})

// 全局后置钩子 — 没有next
router.afterEach((to, from) => {
  document.title = to.meta.title || '默认标题'
  // 发送PV统计
})
```

**2. 路由独享守卫：**

```js
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      if (store.state.user.role === 'admin') {
        next()
      } else {
        next('/403')
      }
    }
  }
]
```

**3. 组件内守卫：**

```js
export default {
  // 离开前 — 可用于表单未保存提示
  beforeRouteLeave(to, from, next) {
    if (this.formDirty) {
      const confirm = window.confirm('有未保存的修改，确定离开？')
      next(confirm)
    } else {
      next()
    }
  },
  
  // 进入前 — 无法访问this（组件还没创建）
  beforeRouteEnter(to, from, next) {
    next(vm => {
      // 通过vm回调访问组件实例
      vm.fetchData()
    })
  },
  
  // 路由参数变化时（同一组件复用）
  beforeRouteUpdate(to, from, next) {
    // /user/1 → /user/2，组件复用，在此处理参数变化
    this.userId = to.params.id
    this.fetchUser()
    next()
  }
}
```

**Vue3 setup 语法糖写法：**

```vue
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

onBeforeRouteLeave((to, from) => {
  const answer = window.confirm('确定离开？')
  if (!answer) return false
})

onBeforeRouteUpdate((to, from) => {
  userId.value = to.params.id
  fetchUser()
})
</script>
```

| 守卫 | 位置 | 参数 | next | 常见用途 |
|------|------|------|------|---------|
| beforeEach | 全局 | to,from,next | 必须 | 登录验证 |
| beforeResolve | 全局 | to,from,next | 必须 | 数据预取 |
| afterEach | 全局 | to,from | 无 | 标题/统计 |
| beforeEnter | 路由配置 | to,from,next | 必须 | 权限控制 |
| beforeRouteEnter | 组件 | to,from,next | 必须 | 数据准备 |
| beforeRouteUpdate | 组件 | to,from,next | 必须 | 参数变化 |
| beforeRouteLeave | 组件 | to,from,next | 必须 | 离开确认 |

**知识点：** `Vue Router` `导航守卫` `beforeEach` `路由权限` `next`

:::

### Q9: 导航守卫执行顺序？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**完整执行顺序：**

```
导航触发
    ↓
1. beforeEach（全局）
    ↓
2. 在失活的组件中调用 beforeRouteLeave
    ↓
3. 全局 beforeResolve
    ↓
4. 路由独享 beforeEnter
    ↓
5. 在激活的组件中调用 beforeRouteEnter
    ↓
6. beforeRouteUpdate（组件复用）
    ↓
7. 导航确认
    ↓
8. afterEach（全局）
    ↓
导航完成
```

**示例代码：**
```js
// 1. 全局前置
router.beforeEach((to, from, next) => {
  console.log('beforeEach')
  next()
})

// 2. 全局解析（所有钩子 resolve 后，beforeEach 和 beforeEnter 之间）
router.beforeResolve((to, from) => {
  console.log('beforeResolve')
})

// 3. 路由独享
const routes = [
  {
    path: '/dashboard',
    component: Dashboard,
    beforeEnter: (to, from, next) => {
      console.log('beforeEnter')
      next()
    }
  }
]

// 4. 全局后置
router.afterEach((to, from) => {
  console.log('afterEach')
})

// 5. 组件内守卫
export default {
  beforeRouteEnter(to, from, next) {
    console.log('beforeRouteEnter')
    next(vm => {
      // 这里可以访问组件实例
      vm.fetchData()
    })
  },
  beforeRouteUpdate(to, from, next) {
    console.log('beforeRouteUpdate')
    next()
  },
  beforeRouteLeave(to, from, next) {
    console.log('beforeRouteLeave')
    next()
  }
}
```

**beforeRouteEnter 获取组件实例：**
```js
beforeRouteEnter(to, from, next) {
  next(vm => {
    // vm 是组件实例
    // 此时组件已创建
  })
  
  // 或使用 onBeforeRouteEnter (Vue 3.3+)
  onBeforeRouteEnter(to => {
    // 无法访问 this
  })
}
```

**取消导航：**
```js
// 返回 false
beforeEach((to, from) => {
  return false
})

// 或返回具体路由
beforeEach((to, from) => {
  return '/login'
})

// 或使用 next(false) / next('/login')
beforeEach((to, from, next) => {
  if (!loggedIn) return next('/login')
  next()
})
```

**知识点：** `导航守卫` `执行顺序` `beforeEach` `beforeEnter` `beforeRouteEnter`

:::

### Q10: hash 模式和 history 模式的区别？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Hash 模式：**
```js
// 创建
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// URL: http://example.com/#/about
```

**History 模式：**
```js
// 创建
const router = createRouter({
  history: createWebHistory('/app/'),  // 可选 base
  routes
})

// URL: http://example.com/app/about
```

**对比：**

| 维度 | Hash 模式 | History 模式 |
|------|----------|-------------|
| URL 格式 | #/path | /path |
| SEO | ❌ 不利于 SEO | ✅ 友好 |
| 服务器配置 | ❌ 无需配置 | ✅ 需配置 |
| 兼容性 | ✅ 支持旧浏览器 | ✅ 现代浏览器 |
| 美观度 | ❌ 有 # 号 | ✅ 干净 |

**History 模式服务器配置：**

**Nginx：**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache：**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Node.js/Express：**
```js
const history = require('connect-history-api-fallback')
app.use(history())
```

**Vue Router 4 模式 API：**
```js
import {
  createWebHashHistory,
  createWebHistory,
  createMemoryHistory
} from 'vue-router'

// Hash
createWebHashHistory()

// History
createWebHistory(base)  // 可选 base 路径

// Memory（SSR/测试）
createMemoryHistory()
```

**知识点：** `Hash 模式` `History 模式` `URL` `服务器配置` `SEO`

:::

### Q11: 路由懒加载如何实现？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**动态 import：**
```js
const routes = [
  {
    path: '/about',
    component: () => import('./views/About.vue')
  }
]
```

**Webpack 魔法注释（打标签）：**
```js
const routes = [
  {
    path: '/about',
    component: () => import(
      /* webpackChunkName: "about" */
      /* webpackPrefetch: true */
      './views/About.vue'
    )
  }
]
```

**魔法注释说明：**
```js
// 单独打包
webpackChunkName: "about"

// 预加载（父组件空闲时加载）
webpackPrefetch: true

// 立即加载（与父组件并行）
webpackPreload: true
```

**Vue Router 4 命名视图懒加载：**
```js
const routes = [
  {
    path: '/',
    components: {
      default: () => import('./Home.vue'),
      sidebar: () => import('./Sidebar.vue')
    }
  }
]
```

**组合使用：**
```js
// 按功能模块分包
const UserRoutes = [
  {
    path: '/user',
    component: () => import(/* webpackChunkName: "user" */ './User.vue'),
    children: [
      {
        path: 'profile',
        component: () => import(/* webpackChunkName: "user-profile" */ './Profile.vue')
      },
      {
        path: 'settings',
        component: () => import(/* webpackChunkName: "user-settings" */ './Settings.vue')
      }
    ]
  }
]
```

**Vite 自动分包：**
```js
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router'],
          'user-module': ['./src/views/User']
        }
      }
    }
  }
}
```

**加载状态处理：**
```js
// 工厂函数 + 加载提示
function asyncComponent(loader, delay = 200) {
  let component = null
  let loading = false
  
  return {
    setup() {
      const Comp = ref(null)
      const error = ref(null)
      
      onMounted(async () => {
        if (delay) {
          loading = true
          setTimeout(() => {
            loading = false
          }, delay)
        }
        
        try {
          const module = await loader()
          Comp.value = module.default
        } catch (e) {
          error.value = e
        }
      })
      
      return () => {
        if (Comp.value) return h(Comp.value)
        if (error.value) return h(LoadingError)
        return h(LoadingSpinner)
      }
    }
  }
}
```

**知识点：** `懒加载` `动态 import` `代码分割` `webpack 魔法注释`

:::

### Q12: Vue Router 4 有哪些新特性？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. 新的历史模式 API：**
```js
// Vue Router 3
mode: 'history',
base: '/app/'

// Vue Router 4
history: createWebHistory('/app/')
```

**2. 新的 props 定义：**
```js
// 路由配置
{
  path: '/user/:id',
  component: User,
  props: { default: true, sidebar: false }
}
```

**3. 移除 $router/$route 注入：**
```js
// Vue 3: 用组合式 API
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
```

**4. 新的元属性类型：**
```ts
// 类型安全
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth: boolean
    role?: string
  }
}
```

**5. 动态路由改进：**
```js
// 移除路由
router.removeRoute('admin')

// 获取添加的路由
const routes = router.getRoutes()
```

**6. 更好的 TypeScript 支持：**
```ts
// 类型安全路由
router.push({ name: 'user', params: { id: '123' } })

// 类型推导
const route = useRoute()
route.params.id  // string | string[]
```

**7. 新 Hooks：**
```js
// 组件内
onBeforeRouteUpdate()
onBeforeRouteLeave()

// 组合式
import { onBeforeRouteLeave } from 'vue-router'
```

**8. 废弃功能：**
- ❌ $on/$off（事件监听）
- ❌ 通配符路由（用 catch-all）
```js
// Vue 3 catch-all
{ path: '/:catchAll(.*)', component: NotFound }
```

**知识点：** `Vue Router 4` `新特性` `TypeScript` `动态路由`

:::
