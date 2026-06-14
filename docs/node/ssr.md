---
title: SSR 与同构
description: Node.js SSR 面试题，覆盖 SSR/CSR/SSG 差异、Next.js/Nuxt.js 原理、Hydration、性能优化、流式 SSR、RSC 等核心考点
---

# SSR 与同构

---

> **🔥 中等 · SSR vs CSR vs SSG**

### Q1: SSR、CSR、SSG 各是什么？如何选型？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 方案 | 全称 | 渲染时机 | TTFP | SEO | 服务器压力 |
|------|------|----------|------|-----|-----------|
| **CSR** | Client-Side Rendering | 浏览器端 | 慢 | 差 | 低 |
| **SSR** | Server-Side Rendering | 服务器端 | 快 | 好 | 高 |
| **SSG** | Static Site Generation | 构建时 | 最快 | 好 | 最低 |
| **ISR** | Incremental Static Regeneration | 构建时 + 按需更新 | 快 | 好 | 低 |

**选型建议：**

| 场景 | 推荐 | 原因 |
|------|------|------|
| 后台管理系统 | CSR | 无 SEO 需求，交互复杂 |
| 内容网站/博客 | SSG | 内容稳定，SEO 重要 |
| 电商首页 | SSR/ISR | SEO + 动态内容 |
| 社交媒体 | CSR + SSR 混合 | 首屏 SSR，交互 CSR |

**知识点：** `SSR` `CSR` `SSG` `ISR` `选型`

:::

---

> **🔥 中等 · Hydration**

### Q2: 什么是 Hydration（水合）？常见的水合问题有哪些？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Hydration**：服务器返回的静态 HTML 在浏览器端"激活"，绑定事件和状态，变成可交互的 SPA 应用。

**常见问题：**

**1. Hydration Mismatch（水合不匹配）**
```jsx
// ❌ 服务端和客户端渲染结果不一致
function Component() {
  const width = window.innerWidth  // Error!
  const time = new Date().toLocaleString()  // 不一致！
  const id = Math.random()  // 不一致！
}

// ✅ 正确做法
function Component() {
  const [width, setWidth] = useState(null)
  useEffect(() => {
    setWidth(window.innerWidth)
  }, [])
  if (width === null) return <div>Loading...</div>
  return <div>Width: {width}</div>
}
```

**知识点：** `Hydration` `Mismatch` `选择性水合` `SSR`

:::

---

> **🔥 中等 · Next.js 原理**

### Q3: Next.js 的渲染模式有哪些？App Router 和 Pages Router 的区别？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Next.js 渲染模式：**

| 模式 | 说明 | 使用方式 |
|------|------|----------|
| SSG | 构建时生成静态页面 | 默认 |
| SSR | 每次请求服务器渲染 | `export const dynamic = 'force-dynamic'` |
| ISR | 静态 + 按需重新验证 | `revalidate = 60` |
| CSR | 客户端渲染 | `'use client'` |

**Pages Router vs App Router：**

| 对比项 | Pages Router | App Router |
|--------|-------------|------------|
| 路由 | `pages/` 目录 | `app/` 目录 |
| 数据获取 | `getServerSideProps` | 组件内直接 `fetch` |
| 服务端组件 | 不支持 | ✅ 默认 |
| 流式渲染 | 不支持 | ✅ `loading.tsx` |

**知识点：** `Next.js` `App Router` `Server Component` `ISR`

:::

---

> **💀 困难 · 流式 SSR**

### Q4: 什么是流式 SSR？解决了什么问题？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**传统 SSR 的问题：** 服务器必须等所有数据获取完毕后才能返回 HTML。

**流式 SSR：** 将 HTML 分块逐步发送给浏览器。

```jsx
import { renderToPipeableStream } from 'react-dom/server'

app.get('/', (req, res) => {
  const { pipe } = renderToPipeableStream(<App />, {
    onShellReady() {
      res.setHeader('content-type', 'text/html')
      pipe(res)
    }
  })
})
```

**知识点：** `流式 SSR` `renderToPipeableStream` `Suspense` `TTFB`

:::

---

> **💀 困难 · React Server Components**

### Q5: React Server Components（RSC）是什么？和 SSR 有什么区别？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**RSC 核心思想：** 组件只在服务器执行，输出序列化格式，客户端解析渲染。

| 对比项 | SSR | RSC |
|--------|-----|-----|
| 输出 | HTML 字符串 | RSC Payload |
| 水合 | 需要 | Server Component 不需要 |
| JS Bundle | 全部组件 | 仅 Client Component |

```tsx
// Server Component（默认）
async function ProductPage({ id }) {
  const product = await db.product.findUnique({ where: { id } })
  return <div>{product.name}</div>
}

// Client Component
'use client'
function AddToCartButton({ productId }) {
  const [loading, setLoading] = useState(false)
  return <button onClick={() => setLoading(true)}>加入购物车</button>
}
```

**知识点：** `RSC` `Server Component` `Client Component` `零 JS`

:::

---

> **🔥 中等 · SSR 性能优化**

### Q6: SSR 应用有哪些性能优化手段？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. 缓存策略**
```js
// LRU 缓存
const LRU = require('lru-cache')
const ssrCache = new LRU({ max: 1000, ttl: 1000 * 60 * 5 })
```

**2. 流式渲染 + Suspense**
- 快组件先发送，慢组件后补
- 减少首字节时间（TTFB）

**3. 关键路径优化**
- 内联关键 CSS
- 预加载关键资源
- 延迟加载非关键脚本

**知识点：** `SSR 缓存` `流式渲染` `组件缓存` `PPR`

:::

---

> **🔥 中等 · SSR 安全**

### Q7: SSR 应用有哪些安全风险？如何防护？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. XSS（服务器注入）**
```jsx
// ❌ 危险
const html = `<div>${userInput}</div>`

// ✅ React 默认转义
return <div>{userInput}</div>
```

**2. 服务器信息泄露**
```js
app.disable('x-powered-by')
app.use(helmet())
```

**3. 请求伪造（SSRF）**
```js
// ✅ 校验 URL
const url = new URL(req.query.url)
if (!['https://api.example.com'].includes(url.origin)) {
  return res.status(403).json({ error: 'Forbidden' })
}
```

**知识点：** `SSR 安全` `XSS` `SSRF` `环境变量泄露` `DoS`

:::

---

> **⭐ 简单 · Nuxt.js SSR**

### Q8: Nuxt.js 的 SSR 模式如何配置？有哪些数据获取方式？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Nuxt 3 渲染模式配置：**
```ts
export default defineNuxtConfig({
  ssr: true,  // SSR 模式（默认）
  // ssr: false  // SPA 模式
})
```

**Nuxt 3 数据获取方式：**

| 方式 | 时机 | 服务端 | 客户端 |
|------|------|--------|--------|
| `useFetch` | 组件设置时 | ✅ | ✅ |
| `useAsyncData` | 组件设置时 | ✅ | ✅ |
| `useLazyFetch` | 导航后 | ✅ | ✅ |

**知识点：** `Nuxt.js` `useFetch` `useAsyncData` `SSR 配置`

:::

---

### Q9: SSR 的 hydration 过程是什么？常见的 hydration 不匹配问题？

> **🔥 中等 · SSR**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Hydration（水合）过程：**
1. 服务端渲染组件 → 生成 HTML 字符串
2. 发送 HTML 到浏览器 → 用户立即看到内容
3. 下载 JavaScript Bundle
4. 执行 JS → React/Vue 在客户端重新创建虚拟 DOM
5. 对比虚拟 DOM 和现有 DOM → 检查是否匹配
6. 绑定事件监听器 → 页面变为可交互

**常见水合不匹配问题：**

**1. 浏览器 API 在服务端不可用**
```jsx
// ❌ 错误
function Component() {
  const [width, setWidth] = useState(window.innerWidth)
}

// ✅ 正确
function Component() {
  const [width, setWidth] = useState(0)
  useEffect(() => setWidth(window.innerWidth), [])
}
```

**2. 时间不一致**
```jsx
// ❌ 服务端和客户端时间不同
const now = new Date().toLocaleString()

// ✅ 统一在客户端获取
const [time, setTime] = useState('')
useEffect(() => setTime(new Date().toLocaleString()), [])
```

**知识点：** `Hydration` `水合` `Mismatch` `服务端渲染` `客户端渲染`

:::

---

### Q10: React Server Components 和传统 SSR 的区别？

> **🔥 中等 · SSR**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心区别：**

| 对比项 | 传统 SSR | RSC |
|--------|----------|-----|
| 输出 | HTML 字符串 | RSC Payload |
| 水合 | 需要完整水合 | Server Component 无需水合 |
| JS Bundle | 所有组件代码 | **不包含** Server Component |
| 数据获取 | getServerSideProps | 组件内直接 await |

**性能对比：**
```text
传统 SSR 页面：
├─ HTML: 50KB
└─ JS Bundle: 200KB

RSC 页面：
├─ RSC Payload: 30KB
└─ Client Component JS: 20KB

JS 减少：90% ↓
```

**知识点：** `React Server Components` `RSC` `SSR` `Client Component` `零 JS` `水合`

:::

---

### Q11: SSR 的性能瓶颈和优化方案？（流式渲染、缓存策略、预渲染）

> **💀 困难 · SSR**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**性能瓶颈：**
- TTFB（首字节时间）长
- 服务端渲染阻塞
- 水合开销大

**优化方案：**

**1. 流式渲染**
```jsx
const { pipe } = renderToPipeableStream(<App />, {
  onShellReady() { pipe(res) }
})
```

**2. 缓存策略**
- CDN 缓存（SSG/ISR）
- 边缘缓存
- 服务端 LRU 缓存
- 数据缓存

**3. 预渲染**
- 静态生成（SSG）
- 增量静态生成（ISR）
- 按需静态生成（On-demand SSG）

**性能优化清单：**

| 优化项 | 效果 | 实现方式 |
|--------|------|----------|
| 流式渲染 | ↓ TTFB 50%+ | Suspense + Streaming |
| CDN 缓存 | ↓ 延迟 90% | SSG + CDN |
| 增量生成 | ↓ 服务器负载 95% | ISR |

**知识点：** `流式渲染` `SSR 缓存` `ISR` `边缘缓存` `预渲染` `性能优化`

:::