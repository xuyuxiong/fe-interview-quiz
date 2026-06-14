---
title: Nuxt.js
description: Nuxt.js 服务端渲染、静态生成、路由系统面试题
---

# Nuxt.js

## 面试题

### Q1: Nuxt.js 的渲染模式有哪些？如何选型？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 渲染模式 | 说明 | 适用场景 |
|---------|------|----------|
| SSR | 服务端渲染，每次请求都在服务端生成 HTML | 动态内容、SEO 要求高 |
| SSG | 静态生成，构建时生成 HTML | 博客、文档站、内容不常变 |
| ISR | 增量静态再生，定期重新生成 | 内容偶尔更新 |
| CSR | 客户端渲染，同 SPA | 后台管理、SEO 不重要 |

```js
// nuxt.config.ts
export default defineNuxtConfig({
  routeRules: {
    '/': { prerender: true },          // SSG
    '/blog/**': { swr: 3600 },         // ISR (1小时)
    '/admin/**': { ssr: false },       // CSR
    '/api/**': { cors: true }          // API 路由
  }
})
```

**选型原则：** SEO 需求高 → SSR/SSG，交互密集 → CSR，内容偶尔更新 → ISR

**知识点：** `Nuxt.js` `SSR` `SSG` `ISR` `渲染模式`

:::

### Q2: App Router 与 Pages Router 有什么区别？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

Nuxt 3 使用 App Router（基于目录的文件路由）：

| 特性 | Pages Router (Nuxt 2) | App Router (Nuxt 3) |
|------|----------------------|---------------------|
| 路由定义 | pages/ 目录 | pages/ 目录（增强） |
| 布局 | layouts/ | layouts/ + app.vue |
| 中间件 | middleware/ | middleware/（增强） |
| 数据获取 | asyncData/fetch | useFetch/useAsyncData |
| 模式 | Options API 为主 | Composition API |

```
pages/
├── index.vue              → /
├── about.vue              → /about
├── users/
│   ├── index.vue          → /users
│   └── [id].vue           → /users/:id (动态路由)
└── blog/
    └── [...slug].vue      → /blog/* (Catch-all)
```

```vue
<!-- Nuxt 3 组合式写法 -->
<script setup>
const route = useRoute()
const { data } = await useFetch(`/api/users/${route.params.id}`)
</script>
```

**知识点：** `App Router` `文件路由` `动态路由` `Nuxt 3`

:::

### Q3: Nuxt Server Component 的原理是什么？

> **💀 困难 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

Nuxt 3 支持 Vue Server Components（VSC）：

**原理：**
1. 组件在服务端渲染，输出 VNode Payload（非 HTML）
2. Payload 发送到客户端，客户端只接收轻量数据
3. 服务端组件**零 JS**发送到客户端，减小 bundle

```vue
<!-- 服务端组件 -->
<script setup>
// 这段代码只在服务端运行
const data = await $fetch('/api/heavy-data')  // 直接访问数据库
</script>

<template>
  <!-- 渲染结果以 Payload 发送，不包含 JS -->
  <div>{{ data }}</div>
</template>
```

```vue
<!-- 客户端组件引用服务端组件 -->
<script setup>
// .server 后缀标记为服务端组件
import HeavyChart from '~/components/HeavyChart.server.vue'
</script>
```

**限制：** 服务端组件不能有交互（onClick 等），不能使用浏览器 API

**知识点：** `Server Component` `零JS` `VNode Payload` `Nuxt 3`

:::

### Q4: useFetch 和 useAsyncData 的区别是什么？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 特性 | useFetch | useAsyncData |
|------|----------|-------------|
| 定位 | 便捷的数据获取封装 | 更通用的异步数据管理 |
| 用法 | `useFetch(url)` | `useAsyncData(key, handler)` |
| key | 自动生成 | 必须手动指定 |
| 适用 | API 请求 | 任意异步操作 |

```js
// useFetch - 简单 API 请求
const { data, pending, error, refresh } = await useFetch('/api/users', {
  method: 'GET',
  query: { page: 1 },
  headers: { Authorization: `Bearer ${token}` }
})

// useAsyncData - 更灵活的异步操作
const { data } = await useAsyncData('user-stats', () =>
  $fetch('/api/stats', { method: 'POST', body: { userId: 1 } })
)

// useAsyncData - 非请求操作
const { data } = await useAsyncData('computed-data', () =>
  someExpensiveComputation()
)
```

**SSR 数据传递：** 两个方法都会在 SSR 时执行，结果序列化到 payload 中，客户端 hydration 时直接使用，避免重复请求。

**知识点：** `useFetch` `useAsyncData` `数据获取` `SSR`

:::

### Q5: Nuxt 中的 Hydration（水合）是什么？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Hydration** = 服务端渲染的静态 HTML + 客户端 JS 事件绑定 = 完整交互页面

**流程：**

```
1. SSR: 服务端渲染 HTML → 发送到浏览器
2. 浏览器显示静态 HTML（用户可见但不可交互）
3. 下载 JS bundle
4. Hydration: Vue 对比服务端 HTML 和客户端 VNode，绑定事件
5. 页面可交互
```

**Hydration 不匹配问题：**

```vue
<!-- ❌ 不匹配：服务端和客户端时间不同 -->
<template>
  <div>{{ new Date().toISOString() }}</div>
</template>

<!-- ✅ 修复：仅在客户端渲染 -->
<template>
  <ClientOnly>
    <div>{{ new Date().toISOString() }}</div>
  </ClientOnly>
</template>
```

**常见导致不匹配的原因：**
- 日期/时间/随机数
- 依赖浏览器 API（window/document）
- 第三方库使用 DOM API

**知识点：** `Hydration` `水合` `SSR` `不匹配` `ClientOnly`

:::

### Q6: Nuxt Middleware 中间件如何使用？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**三种中间件：**

```js
// 1. 匿名中间件（页面内联）
// pages/admin.vue
<script setup>
definePageMeta({
  middleware: [
    (to, from) => {
      if (!isAuthenticated()) return navigateTo('/login')
    }
  ]
})
</script>

// 2. 命名路由中间件
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  if (!isAuthenticated()) {
    return navigateTo('/login')
  }
})

// 页面中使用
definePageMeta({
  middleware: 'auth'
})

// 3. 全局中间件（自动执行）
// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to, from) => {
  // 每次路由切换都会执行
  console.log(`导航: ${from.path} → ${to.path}`)
})
```

**中间件执行顺序：** 全局中间件 → 页面定义中间件（按定义顺序）

**知识点：** `Nuxt Middleware` `路由守卫` `认证` `命名中间件`

:::

### Q7: Nuxt 如何处理 SEO？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```vue
<!-- 1. useHead - 动态 meta -->
<script setup>
useHead({
  title: '首页 - 我的网站',
  meta: [
    { name: 'description', content: '网站描述' },
    { property: 'og:title', content: '首页' },
    { property: 'og:image', content: '/og-image.png' }
  ],
  link: [
    { rel: 'canonical', href: 'https://example.com' }
  ]
})
</script>

<!-- 2. useSeoMeta - 便捷 SEO meta -->
<script setup>
useSeoMeta({
  title: '文章标题',
  ogTitle: '文章标题',
  description: '文章描述',
  ogDescription: '文章描述',
  ogImage: '/cover.jpg',
  twitterCard: 'summary_large_image'
})
</script>
```

```js
// 3. 全局 SEO 配置 - nuxt.config.ts
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  }
})
```

**SSR 对 SEO 的帮助：** 服务端渲染的 HTML 包含完整内容，搜索引擎可直接抓取，无需执行 JS。

**知识点：** `Nuxt SEO` `useHead` `useSeoMeta` `SSR` `Open Graph`

:::

### Q8: Nuxt 部署方案有哪些？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 部署方式 | 命令 | 说明 |
|---------|------|------|
| Vercel | `nuxi build` | 零配置部署，自动 SSR |
| Node.js | `node .output/server/index.mjs` | 自托管 SSR |
| 静态托管 | `nuxi generate` | SSG 静态文件 |
| Docker | Dockerfile | 容器化部署 |

```dockerfile
# Docker 部署
FROM node:18-alpine
WORKDIR /app
COPY .output .output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

```js
// nuxt.config.ts - 预设配置
export default defineNuxtConfig({
  nitro: {
    preset: 'node-server'  // 或 'vercel' / 'cloudflare' / 'netlify'
  }
})
```

**Nitro 引擎：** Nuxt 3 的服务端引擎，支持多平台部署预设（Vercel/Cloudflare/Netlify/AWS 等），构建输出自适应目标平台。

**知识点：** `Nuxt部署` `Vercel` `Docker` `Nitro` `SSG`

:::