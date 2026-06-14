---
title: 首屏优化面试题
description: 覆盖首屏指标/SSR/SSG/CSR/骨架屏/预加载等 8 道题
---

# 首屏优化面试题

### Q1: 首屏性能指标

> **⭐ 简单 · 性能指标**

请解释 FCP、FMP、LCP、TTFB 等首屏指标的含义。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Core Web Vitals 核心指标：**

### 1. LCP（Largest Contentful Paint）
- **定义**：最大内容元素渲染完成时间
- **目标**：<= 2.5 秒
- **测量内容**：图片、视频、文本块

### 2. FCP（First Contentful Paint）
- **定义**：首次绘制任何内容的时间
- **目标**：<= 1.8 秒
- **测量内容**：文本、图片、Canvas 等

### 3. TTI（Time to Interactive）
- **定义**：页面完全可交互时间
- **目标**：<= 3.8 秒
- **测量内容**：主线程空闲，事件响应 < 50ms

### 4. TBT（Total Blocking Time）
- **定义**：主线程被阻塞的总时间
- **目标**：<= 300ms
- **测量内容**：FCP 到 TTI 之间的阻塞时间

### 5. CLS（Cumulative Layout Shift）
- **定义**：累积布局偏移
- **目标**：< 0.1
- **测量内容**：意外布局移动的累积值

**TTFB（Time to First Byte）：**
- **定义**：从请求到收到第一个字节的时间
- **目标**：< 800ms
- **优化方向**：服务器响应、CDN、边缘计算

**测量方法：**
```js
// LCP 监控
new PerformanceObserver((list) => {
  const entries = list.getEntries()
  const lastEntry = entries[entries.length - 1]
  console.log('LCP:', lastEntry.startTime)
}).observe({ entryTypes: ['largest-contentful-paint'] })

// FCP 监控
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name === 'first-contentful-paint') {
      console.log('FCP:', entry.startTime)
    }
  }
}).observe({ entryTypes: ['paint'] })

// CLS 监控
new PerformanceObserver((list) => {
  let cls = 0
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) cls += entry.value
  }
  console.log('CLS:', cls)
}).observe({ entryTypes: ['layout-shift'] })
```

**知识点：** `LCP` `FCP` `TTI` `CLS` `TTFB` `Core Web Vitals`

:::

### Q2: SSR/SSG/CSR 对比

> **🔥 中等 · 渲染模式**

请对比 SSR、SSG、CSR 三种渲染模式。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**渲染模式对比：**

| 特性 | CSR | SSR | SSG |
|------|-----|-----|-----|
| 首屏速度 | 慢 | 快 | 最快 |
| SEO 友好 | ❌ | ✅ | ✅ |
| TTI | 慢 | 中等 | 快 |
| 服务器负担 | 低 | 高 | 低 |
| 适用场景 | 后台应用 | 动态内容 | 静态内容 |

**CSR（客户端渲染）**
```jsx
// React 纯客户端
function App() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetch('/api/data').then(setData)
  }, [])
  
  if (!data) return <Loading />
  return <Content data={data} />
}

// 优点：服务器简单，交互快
// 缺点：首屏慢，SEO 差，白屏
```

**SSR（服务端渲染）**
```jsx
// Next.js SSR
export async function getServerSideProps() {
  const data = await fetch('...')
  return { props: { data } }
}

export default function Page({ data }) {
  return <Content data={data} />
}

// 优点：首屏快，SEO 好
// 缺点：服务器压力大，每次请求都渲染
```

**SSG（静态生成）**
```jsx
// Next.js SSG
export async function getStaticProps() {
  const data = await fetch('...')
  return { props: { data } }
}

export async function getStaticPaths() {
  return { paths: ['/p/1', '/p/2'], fallback: true }
}

// 优点：最快，服务器无压力
// 缺点：数据可能不是最新，build 时间长
```

**ISR（增量静态再生）**
```jsx
export async function getStaticProps() {
  return {
    props: { ... },
    revalidate: 60 // 60 秒后重新生成
  }
}

// 优点：静态 + 增量更新
// 适用：博客、产品页
```

**选择建议：**
- 营销/内容站：SSG/ISR
- 后台/数据应用：CSR
- 电商/新闻：SSR/ISR
- 实时数据：SSR

**知识点：** `SSR` `SSG` `CSR` `ISR` `渲染对比`

:::

### Q3: 骨架屏实现

> **🔥 中等 · 加载体验**

请实现骨架屏组件。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**骨架屏实现方案：**

### 1. CSS 动画
```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 37%,
    #f0f0f0 63%
  );
  background-size: 400% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 100% 50%; }
  100% { background-position: 0 50%; }
}

.skeleton-title {
  @include skeleton;
  height: 24px;
  width: 200px;
  border-radius: 4px;
}

.skeleton-image {
  @include skeleton;
  height: 150px;
  width: 100%;
  border-radius: 8px;
}
```

### 2. React 组件
```jsx
function Skeleton({ type = 'text', width, height }) {
  return (
    <div 
      className={`skeleton skeleton-${type}`}
      style={{ width, height }}
    />
  )
}

function CardSkeleton() {
  return (
    <div className="card-skeleton">
      <Skeleton type="image" width="100%" height={200} />
      <Skeleton type="title" width="80%" height={24} />
      <Skeleton type="text" width="100%" height={16} />
      <Skeleton type="text" width="60%" height={16} />
    </div>
  )
}
```

### 3. 内容感知
```jsx
function ContentWithSkeleton({ children, loading }) {
  return loading ? (
    <Skeleton matching={children} />
  ) : children
}

function Skeleton({ matching }) {
  // 根据实际内容结构生成骨架
  const structure = analyzeStructure(matching)
  return <StructuredSkeleton {...structure} />
}

function analyzeStructure(element) {
  if (!element) return null
  
  const type = element.type
  const children = element.props?.children
  
  return {
    type,
    hasChildren: !!children,
    childrenCount: Array.isArray(children) ? children.length : 0
  }
}
```

### 4. 图片占位
```jsx
function ImageWithBlur({ src, width, height }) {
  const [loaded, setLoaded] = useState(false)
  
  return (
    <div className="image-wrapper" style={{ width, height }}>
      <img
        src={`data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"></svg>`}
        style={{ filter: 'blur(20px)' }}
        alt=""
      />
      {!loaded && <div className="skeleton-overlay" />}
      <img
        src={src}
        className={loaded ? 'loaded' : ''}
        onLoad={() => setLoaded(true)}
        alt=""
      />
    </div>
  )
}
```

**知识点：** `骨架屏` `CSS 动画` `加载占位` `用户体验`

:::

### Q4: 资源预加载

> **⭐ 简单 · 预加载**

请说明 preload/prefetch/preconnect/dns-prefetch 的使用场景。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**预加载类型详解：**

### preload（即刻需要）
```html
<!-- 当前页面必需的关键资源 -->
<link rel="preload" href="/main.js" as="script">
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/hero.webp" as="image" media="(max-width: 800px)">
```

**as 属性值：**
- `script` - JavaScript
- `style` - CSS
- `font` - 字体
- `image` - 图片
- `video` - 视频
- `document` - iframe
- `fetch` - XHR/Fetch

### prefetch（后续需要）
```html
<!-- 可能需要的下一页资源 -->
<link rel="prefetch" href="/about.js">
<link rel="prefetch" href="/contact.js">

<!-- React 路由预加载 -->
<Link to="/about" onMouseEnter={() => {
  import(/* webpackPrefetch: true */ './About')
}}>
  About
</Link>
```

### preconnect（第三方连接）
```html
<!-- 提前建立连接（TCP+TLS） -->
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="preconnect" href="https://api.example.com">
<link rel="preconnect" href="https://cdn.example.com">
```

### dns-prefetch（DNS 预解析）
```html
<!-- DNS 解析（轻量级） -->
<link rel="dns-prefetch" href="//analytics.example.com">
<link rel="dns-prefetch" href="//stats.example.com">
```

**优先级排序：**
```
preload > preconnect > prefetch > dns-prefetch
```

**使用示例：**
```html
<head>
  <!-- 1. DNS 预解析（最早） -->
  <link rel="dns-prefetch" href="//cdn.example.com">
  
  <!-- 2. 预连接（连接建立） -->
  <link rel="preconnect" href="https://cdn.example.com" crossorigin>
  
  <!-- 3. 预加载（当前页必需） -->
  <link rel="preload" href="/critical.css" as="style">
  <link rel="preload" href="/main.js" as="script">
  <link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
  
  <!-- 4. 预取（可能用到） -->
  <link rel="prefetch" href="/about.js">
</head>
```

**知识点：** `preload` `prefetch` `preconnect` `dns-prefetch` `资源优先级`

:::

### Q5: 关键 CSS 内联

> **🔥 中等 · CSS 优化**

请说明关键 CSS 内联的实现方案。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**关键 CSS 概念：**
首屏渲染所需的 CSS，内联到 HTML 中，避免阻塞渲染。

### 方案 1：Critical CSS 工具
```bash
# 使用 critical 生成关键 CSS
npx critical https://example.com --base ./dist --inline

# 或使用 penthouse
npx penthouse --url https://example.com --css styles.css --output critical.css
```

### 方案 2：手动分离
```html
<head>
  <!-- 关键 CSS 内联 -->
  <style>
    /* 首屏必需的 CSS */
    .header { ... }
    .hero { ... }
    .nav { ... }
  </style>
  
  <!-- 非关键 CSS 异步加载 -->
  <link rel="stylesheet" href="/styles.css" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="/styles.css"></noscript>
</head>
```

### 方案 3：React 实现
```jsx
// Generate critical CSS during build
export const criticalCSS = `
  .header{display:flex;...}
  .hero{height:100vh;...}
  .nav-item{...}
`

function Document({ html, css }) {
  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        <link 
          rel="stylesheet" 
          href="/styles.css" 
          media="print" 
          onLoad="this.media='all'"
        />
      </head>
      <body>
        <div id="root" dangerouslySetInnerHTML={{ __html: html }} />
      </body>
    </html>
  )
}
```

### 方案 4：动态加载
```jsx
// Critical CSS Chunk
import './critical.css' // 关键 CSS，同步加载

function DynamicCSS() {
  useEffect(() => {
    // 非关键 CSS 异步加载
    import('./non-critical.css').then(() => {
      document.body.classList.remove('loading-css')
    })
  }, [])
  
  return null
}

// 使用 CSS-in-JS 的关键 CSS
import { createCritical } from 'emotion-server'

const { critical, ids } = extractCritical(cssString)
```

**知识点：** `关键 CSS` `CSS 内联` `异步加载` `首屏优化`

:::

### Q6: 图片懒加载

> **⭐ 简单 · 懒加载**

请实现图片懒加载方案。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

### 方案 1：IntersectionObserver
```jsx
function LazyImage({ src, alt, width, height }) {
  const [wasVisible, setWasVisible] = useState(false)
  const ref = useRef()
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setWasVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' } // 提前 200px 开始加载
    )
    
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  
  return (
    <div ref={ref} className="lazy-image" style={{ width, height }}>
      {wasVisible && (
        <img src={src} alt={alt} loading="lazy" width={width} height={height} />
      )}
    </div>
  )
}
```

### 方案 2：原生 loading 属性
```jsx
// 浏览器原生懒加载（Safari 15+, Chrome 76+）
function NativeLazyImage({ src, alt }) {
  return <img src={src} alt={alt} loading="lazy" />
}

// 兼容性检测
function LazyImage({ src, alt }) {
  const supportsNative = 'loading' in HTMLImageElement.prototype
  
  if (supportsNative) {
    return <img src={src} alt={alt} loading="lazy" />
  }
  
  return <IntersectionObserverLazy src={src} alt={alt} />
}
```

### 方案 3：占位符 + 模糊加载
```jsx
function BlurHashLazyImage({ src, alt, blurhash }) {
  const [loaded, setLoaded] = useState(false)
  
  return (
    <div className="image-container">
      {!loaded && blurhash && (
        <BlurHash blurhash={blurhash} className="blurhash-placeholder" />
      )}
      <img
        src={src}
        alt={alt}
        className={loaded ? 'loaded' : 'loading'}
        onLoad={() => setLoaded(true)}
      />
      {!loaded && <div className="skeleton-overlay" />}
    </div>
  )
}

// 或者使用高质量占位图
function LQIPLazyImage({ src, alt }) {
  const lowQualitySrc = src.replace(/\.(jpg|png)$/, '-lqip.$1')
  
  return (
    <img
      src={lowQualitySrc}
      srcSet={`${lowQualitySrc} 300w, ${src} 1200w`}
      sizes="100vw"
      alt={alt}
    />
  )
}
```

### 方案 4：视口检测
```jsx
// 只加载视口附近的图片
function useLazyLoadImages() {
  useEffect(() => {
    const images = document.querySelectorAll('img[data-src]')
    
    const loadImages = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.src
          img.classList.remove('lazy')
          observer.disconnect()
        }
      })
    }
    
    const observer = new IntersectionObserver(loadImages, {
      rootMargin: '50px 0px'
    })
    
    images.forEach(img => observer.observe(img))
    
    return () => observer.disconnect()
  }, [])
}
```

**知识点：** `IntersectionObserver` `loading="lazy"` `占位符` `视口检测`

:::

### Q7: 代码分割（路由懒加载）

> **🔥 中等 · 代码分割**

请实现路由级别的代码分割。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

### React Router + lazy
```jsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))

function LoadingFallback() {
  return (
    <div className="loading">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

### Next.js 自动路由分割
```jsx
// pages/about.js - 自动代码分割
export default function About() {
  return <div>About Page</div>
}

// 不需要手动 lazy，Next.js 自动生成独立 chunk
```

### Vue Router 懒加载
```js
// Vue Router
const routes = [
  {
    path: '/about',
    component: () => import('./pages/About.vue') // Webpack 魔法注释
    // component: () => import(/* webpackChunkName: "about" */ './pages/About.vue')
  }
]

// catch-all 路由（404）
{
  path: '/:pathMatch(.*)*',
  component: () => import('./pages/NotFound.vue')
}
```

### 动态导入
```jsx
function DynamicRoute({ path, componentLoader }) {
  const [Component, setComponent] = useState(null)
  
  useEffect(() => {
    componentLoader().then(module => {
      setComponent(() => module.default)
    })
  }, [componentLoader])
  
  return Component ? <Component /> : <Loading />
}

// 使用
<DynamicRoute 
  path="/about" 
  componentLoader={() => import('./pages/About')} 
/>
```

### magic comments 优化
```js
// webpackChunkName: 指定 chunk 名
import(/* webpackChunkName: "charts" */ './Charts')

// webpackPrefetch: 空闲时预取
import(/* webpackPrefetch: true */ './Charts')

// webpackPreload: 父 chunk 加载时预加载
import(/* webpackPreload: true */ './Charts')

// 组合使用
import(/* 
  webpackChunkName: "admin",
  webpackPrefetch: true
*/ './Admin')
```

**知识点：** `路由分割` `lazy` `Suspense` `魔法注释`

:::

### Q8: Service Worker 预缓存

> **💀 困难 · SW 缓存**

请实现 Service Worker 预缓存策略。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Service Worker 预缓存：**

### 基本实现
```js
// service-worker.js
const CACHE_NAME = 'app-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/main.js',
  '/styles.css',
  '/logo.png'
]

// 安装：预缓存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
  self.skipWaiting()
})

// 激活：清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      )
    })
  )
  return self.clients.claim()
})

// 请求：缓存优先
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request)
    })
  )
})
```

### Workbox 实现
```js
// webpack.config.js
const { InjectManifest } = require('workbox-webpack-plugin')

module.exports = {
  plugins: [
    new InjectManifest({
      swSrc: './src/sw.js',
      swDest: 'sw.js',
      exclude: [/\.map$/, /manifest\.json$/]
    })
  ]
}

// src/sw.js
import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// 预缓存 vite/webpack 生成的 manifest
precacheAndRoute(self.__WB_MANIFEST)

// 图片缓存：Cache First
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 天
      })
    ]
  })
)

// API 缓存：Network First
registerRoute(
  /^https:\/\/api\.example\.com\//,
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3
  })
)

// 字体缓存：Cache First
registerRoute(
  /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
  new CacheFirst({
    cacheName: 'google-fonts'
  })
)
```

### 注册 Service Worker
```jsx
// index.jsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration.scope)
      })
      .catch((error) => {
        console.log('SW registration failed:', error)
      })
  })
}

// React 更新检查
function useSWUpdate() {
  const [update, setUpdate] = useState(null)
  
  useEffect(() => {
    navigator.serviceWorker?.ready.then((registration) => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdate({ 
              ready: () => newWorker.postMessage({ type: 'SKIP_WAITING' }),
              cancel: () => {}
            })
          }
        })
      })
    })
  }, [])
  
  return update
}
```

**知识点：** `Service Worker` `预缓存` `Workbox` `缓存策略`

:::
### Q9: 大文件分片上传怎么实现？

> **💀 困难 · 场景设计**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心流程：** 文件分片 → 逐片上传 → 合并通知

```js
class ChunkUploader {
  constructor(options) {
    this.file = options.file
    this.chunkSize = options.chunkSize || 5 * 1024 * 1024 // 5MB
    this.concurrent = options.concurrent || 3 // 并发数
    this.onProgress = options.onProgress
    this.fileHash = null
  }

  // 1. 计算文件 hash（用于秒传和断点续传）
  async calculateHash() {
    const chunks = this.createFileChunks()
    const spark = new SparkMD5.ArrayBuffer()
    for (const chunk of chunks) {
      spark.append(await chunk.file.arrayBuffer())
    }
    this.fileHash = spark.end()
    return this.fileHash
  }

  // 2. 文件分片
  createFileChunks() {
    const chunks = []
    const total = Math.ceil(this.file.size / this.chunkSize)
    for (let i = 0; i < total; i++) {
      const start = i * this.chunkSize
      const end = Math.min(start + this.chunkSize, this.file.size)
      chunks.push({
        file: this.file.slice(start, end),
        index: i,
        hash: `${this.fileHash}-${i}`,
        total
      })
    }
    return chunks
  }

  // 3. 秒传检查
  async checkUploaded() {
    const res = await fetch('/api/upload/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: this.fileHash, name: this.file.name, size: this.file.size })
    })
    return res.json() // { uploaded: true } 或 { uploadedChunks: [0, 1, 3] }
  }

  // 4. 并发上传分片
  async uploadChunks() {
    const chunks = this.createFileChunks()
    const { uploadedChunks = [] } = await this.checkUploaded()

    // 过滤已上传的分片
    const pending = chunks.filter(c => !uploadedChunks.includes(c.index))

    // 并发控制
    const pool = []
    for (const chunk of pending) {
      const task = this.uploadChunk(chunk)
      pool.push(task)
      if (pool.length >= this.concurrent) {
        await Promise.race(pool)
        pool.splice(pool.findIndex(t => t === Promise.race(pool)), 1)
      }
    }
    await Promise.all(pool)
  }

  // 单片上传（支持重试）
  async uploadChunk(chunk, retries = 3) {
    const formData = new FormData()
    formData.append('file', chunk.file)
    formData.append('hash', chunk.hash)
    formData.append('index', chunk.index)
    formData.append('total', chunk.total)

    for (let i = 0; i < retries; i++) {
      try {
        await fetch('/api/upload/chunk', { method: 'POST', body: formData })
        this.onProgress?.(chunk.index / chunk.total)
        return
      } catch (err) {
        if (i === retries - 1) throw err
      }
    }
  }

  // 5. 合并通知
  async mergeRequest() {
    await fetch('/api/upload/merge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hash: this.fileHash,
        name: this.file.name,
        size: this.file.size,
        total: Math.ceil(this.file.size / this.chunkSize)
      })
    })
  }

  // 完整流程
  async upload() {
    await this.calculateHash()
    const { uploaded } = await this.checkUploaded()
    if (uploaded) return console.log('秒传成功')
    await this.uploadChunks()
    await this.mergeRequest()
  }
}
```

**知识点：** `大文件上传` `分片上传` `断点续传` `秒传` `并发控制`

:::

### Q10: 文件断点续传怎么实现？

> **🔥 中等 · 场景设计**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**断点续传：** 上传中断后，重新上传时跳过已完成的分片。

```js
// 1. 服务端：记录已上传的分片
// POST /api/upload/check → { uploadedChunks: [0, 1, 2, 5] }

// 2. 客户端：断点续传逻辑
async function resumeUpload(file, fileHash) {
  // 查询已上传分片
  const { uploadedChunks } = await checkUploaded(fileHash)

  // 只上传未完成的分片
  const allChunks = createFileChunks(file)
  const pendingChunks = allChunks.filter(
    chunk => !uploadedChunks.includes(chunk.index)
  )

  // 逐个上传，记录进度
  for (const chunk of pendingChunks) {
    try {
      await uploadChunk(chunk)
      // 上传成功后，记录到本地（localStorage）
      saveProgress(fileHash, chunk.index)
    } catch (err) {
      // 上传失败，保存进度，下次继续
      console.error(`分片 ${chunk.index} 上传失败`)
      break
    }
  }

  // 全部上传完成，合并
  if (pendingChunks.length === 0 || isAllUploaded(fileHash, allChunks.length)) {
    await mergeRequest(fileHash, file.name)
  }
}

// 本地进度存储
function saveProgress(fileHash, chunkIndex) {
  const key = `upload_${fileHash}`
  const progress = JSON.parse(localStorage.getItem(key) || '[]')
  if (!progress.includes(chunkIndex)) {
    progress.push(chunkIndex)
    localStorage.setItem(key, JSON.stringify(progress))
  }
}
```

**关键点：**
- 文件 hash 用于唯一标识文件（Web Worker + SparkMD5 计算）
- 服务端维护已上传分片列表
- 客户端本地缓存进度（localStorage）
- 上传前先检查，跳过已上传分片

**知识点：** `断点续传` `文件hash` `分片进度` `localStorage`

:::

### Q11: 如何实现一个倒计时组件？

> **🔥 中等 · 场景设计**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
import { useState, useEffect, useRef, useCallback } from 'react'

function useCountdown(targetTime, options = {}) {
  const { interval = 1000, onEnd } = options
  const [remain, setRemain] = useState(() => calcRemain(targetTime))
  const timerRef = useRef(null)
  const endTimeRef = useRef(targetTime)

  function calcRemain(target) {
    const diff = new Date(target) - Date.now()
    return Math.max(0, diff)
  }

  function format(ms) {
    const seconds = Math.floor(ms / 1000) % 60
    const minutes = Math.floor(ms / 60000) % 60
    const hours = Math.floor(ms / 3600000) % 24
    const days = Math.floor(ms / 86400000)
    return { days, hours, minutes, seconds, total: ms }
  }

  const start = useCallback(() => {
    if (timerRef.current) return

    endTimeRef.current = targetTime
    timerRef.current = setInterval(() => {
      const remaining = calcRemain(endTimeRef.current)
      setRemain(remaining)
      if (remaining <= 0) {
        clearInterval(timerRef.current)
        timerRef.current = null
        onEnd?.()
      }
    }, interval)
  }, [targetTime, interval, onEnd])

  const pause = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = null
  }, [])

  const reset = useCallback((newTarget) => {
    pause()
    endTimeRef.current = newTarget || targetTime
    setRemain(calcRemain(endTimeRef.current))
  }, [targetTime, pause])

  useEffect(() => {
    start()
    return pause
  }, [])

  return { ...format(remain), start, pause, reset }
}

// 使用
function CountdownPage() {
  const { days, hours, minutes, seconds } = useCountdown(
    '2026-12-31T00:00:00',
    { onEnd: () => alert('倒计时结束!') }
  )
  return (
    <div>{days}天 {hours}时 {minutes}分 {seconds}秒</div>
  )
}
```

**注意事项：**
- 使用 `Date.now()` 而非 `setInterval` 定时器累计，避免时间漂移
- 页面隐藏时 `setInterval` 可能暂停，切回时需重新校准
- 使用 `requestAnimationFrame` 或 `visibilitychange` 修正偏差

**知识点：** `倒计时` `useRef` `时间校准` `React Hook`

:::

### Q12: 如何检测新版本并提示用户刷新？

> **⭐ 简单 · 场景设计**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**原理：** 部署新版本后，HTML 文件 hash 变化。检测到变化后提示用户刷新。

```js
// 1. 生成版本标识（构建时注入）
// vite.config.js
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(Date.now().toString())
  }
})

// 2. 版本检测逻辑
class VersionChecker {
  constructor(options = {}) {
    this.interval = options.interval || 5 * 60 * 1000 // 5分钟检测一次
    this.currentVersion = __APP_VERSION__
    this.timer = null
  }

  async fetchVersion() {
    try {
      // 加时间戳避免缓存
      const res = await fetch(`/version.json?t=${Date.now()}`)
      const data = await res.json()
      return data.version
    } catch {
      // 备选：请求 index.html，从 meta 标签中获取版本
      const res = await fetch(`/index.html?t=${Date.now()}`, { cache: 'no-store' })
      const html = await res.text()
      const match = html.match(/meta\s+name="version"\s+content="([^"]+)"/)
      return match?.[1]
    }
  }

  async check() {
    const latestVersion = await this.fetchVersion()
    if (latestVersion && latestVersion !== this.currentVersion) {
      this.onUpdate?.(latestVersion)
    }
  }

  start(onUpdate) {
    this.onUpdate = onUpdate
    // 页面可见时检测
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.check()
    })
    // 定时检测
    this.timer = setInterval(() => this.check(), this.interval)
  }

  stop() {
    clearInterval(this.timer)
  }
}

// 3. 使用
const checker = new VersionChecker()
checker.start((newVersion) => {
  // 显示更新提示
  showUpdateNotification({
    message: '发现新版本，点击刷新',
    onConfirm: () => window.location.reload(true)
  })
})
```

**知识点：** `版本检测` `缓存更新` `visibilitychange` `版本提示`

:::

### Q13: 白屏的原因有哪些？怎么解决？

> **🔥 中等 · 性能优化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**白屏原因：**

| 原因 | 说明 |
|------|------|
| JS 文件过大阻塞渲染 | 主 bundle 过大，解析执行时间长 |
| CSS 阻塞渲染 | 外联 CSS 未加载完成不渲染 |
| 同步脚本加载 | `<script>` 默认阻塞 DOM 解析 |
| DNS/网络延迟 | 首次访问 DNS 解析慢，RTT 高 |
| 服务端响应慢 | TTFB（首字节时间）过长 |
| 框架初始化耗时 | React/Vue 需要解析+挂载才渲染 |
| 资源加载串行 | 关键资源存在瀑布流依赖 |

**解决方案：**

```js
// 1. SSR - 服务端直出 HTML
import { renderToString } from 'react-dom/server'
app.get('*', (req, res) => {
  const html = renderToString(<App />)
  res.send(`<!DOCTYPE html><div id="root">${html}</div>`)
})

// 2. 骨架屏 - 感知优化
// 在 HTML 中内联骨架屏 CSS/HTML，JS 加载前用户就能看到布局
<div id="root">
  <div class="skeleton-header"></div>
  <div class="skeleton-content"></div>
</div>

// 3. 预渲染 - prerender-spa-plugin
new PrerenderSPAPlugin({
  staticDir: path.join(__dirname, 'dist'),
  routes: ['/', '/about', '/contact'],
})

// 4. 资源优化
// - 代码分割：React.lazy + Suspense
// - CSS 关键路径内联
// - script 标签加 defer / async
// - preload / prefetch 关键资源
```

```html
<!-- 关键资源预加载 -->
<link rel="preload" href="/main.js" as="script">
<link rel="preload" href="/main.css" as="style">
<link rel="dns-prefetch" href="//cdn.example.com">
<link rel="preconnect" href="//api.example.com">

<!-- 非关键脚本 defer -->
<script src="/analytics.js" defer></script>
```

**优化路线图：** 骨架屏（立即可做）→ CDN + 预连接 → 代码分割 → SSR/预渲染 → 边缘计算

**知识点：** `白屏优化` `SSR` `骨架屏` `预渲染` `代码分割` `资源预加载` `TTFB` `FCP`

:::

### Q14: 首屏加载优化有哪些方案？

> **🔥 中等 · 性能优化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**全链路优化：**

```text
用户输入URL
  → DNS解析（dns-prefetch）
  → TCP连接（preconnect / HTTP2）
  → 服务端响应（SSR / 边缘缓存 / CDN）
  → HTML下载（压缩 / 内联关键CSS）
  → 解析渲染（骨架屏 / preload）
  → JS执行（Code Splitting / Tree Shaking）
  → 页面可交互（Hydration / 懒加载）
```

| 阶段 | 方案 | 效果 |
|------|------|------|
| 网络层 | CDN部署、HTTP/2、dns-prefetch、preconnect | 减少RTT |
| 资源层 | Gzip/Brotli压缩、Tree Shaking、代码分割 | 减小包体积 |
| 渲染层 | SSR、骨架屏、关键CSS内联 | 加快FCP |
| 执行层 | defer/async脚本、Web Worker | 减少主线程阻塞 |
| 缓存层 | Service Worker、强缓存、协商缓存 | 二次访问秒开 |
| 感知层 | 骨架屏、进度条、渐进式图片 | 提升体验 |

**关键指标：**

| 指标 | 含义 | 目标值 |
|------|------|--------|
| FCP | 首次内容绘制 | < 1.8s |
| LCP | 最大内容绘制 | < 2.5s |
| FID | 首次输入延迟 | < 100ms |
| CLS | 累积布局偏移 | < 0.1 |
| TTI | 可交互时间 | < 3.8s |

**知识点：** `首屏优化` `CDN` `代码分割` `SSR` `骨架屏` `Core Web Vitals` `性能指标`

:::

### Q15: 骨架屏的实现方案？CSS vs 组件 vs 自动生成？

> **🔥 中等 · 首屏优化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**骨架屏三种实现方案对比：**

| 方案 | 实现方式 | 优点 | 缺点 | 适用场景 |
|------|----------|------|------|----------|
| CSS 手绘 | 手写 CSS 布局模拟内容结构 | 零依赖、体积小、可控性强 | 维护成本高、需手动适配多页面 | 页面结构固定、数量少 |
| 组件库 | 使用 UI 库的 Skeleton 组件 | 开发效率高、样式统一、容易复用 | 体积增加、灵活性受限 | 中大型企业项目 |
| 自动生成 | 根据 DOM 结构自动分析生成 | 零配置、适配任意页面、维护成本低 | 首屏需额外计算、可能不够精确 | 页面多、变化频繁 |

**方案一：CSS 手绘骨架屏**

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

.skeleton-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.skeleton-title {
  width: 200px;
  height: 20px;
  margin: 10px 0;
}

.skeleton-text {
  width: 100%;
  height: 16px;
  margin: 8px 0;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

```jsx
function Card() {
  return (
    <div className="card">
      {loading ? (
        <>
          <div className="skeleton skeleton-avatar" />
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-text" />
          <div className="skeleton skeleton-text" />
        </>
      ) : (
        <Content />
      )}
    </div>
  )
}
```

**方案二：组件库封装**

```jsx
import { Skeleton } from 'antd'

function UserCard() {
  return (
    <Skeleton loading={loading} avatar active>
      <Card title={user.name}>
        <p>{user.bio}</p>
        <p>{user.email}</p>
      </Card>
    </Skeleton>
  )
}
```

**方案三：自动生成骨架屏**

```js
const puppeteer = require('puppeteer')

async function generateSkeleton(url) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(url, { waitUntil: 'networkidle0' })
  
  const skeleton = await page.evaluate(() => {
    const elements = document.querySelectorAll('img, h1, h2, h3, p, article')
    return Array.from(elements).map(el => ({
      tag: el.tagName,
      width: el.offsetWidth,
      height: el.offsetHeight,
      type: el.tagName === 'IMG' ? 'image' : 'text'
    }))
  })
  
  await browser.close()
  return skeleton
}
```

**知识点：** `骨架屏` `首屏优化` `CSS 动画` `感知性能` `自动生成` `组件封装`

:::

### Q16: 首屏加载的 Core Web Vitals 优化策略？

> **🔥 中等 · 性能指标**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Core Web Vitals 三大核心指标：**

| 指标 | 含义 | 目标值 | 优化重点 |
|------|------|--------|----------|
| LCP | 最大内容绘制 | < 2.5s | 服务器响应、资源加载 |
| INP | 交互响应延迟 | < 200ms | 主线程优化、事件处理 |
| CLS | 累积布局偏移 | < 0.1 | 图片尺寸、字体加载 |

**LCP 优化策略：**

```js
// 1. 服务端响应优化 - TTFB < 800ms
// - CDN 边缘节点、SSR/SSG 预渲染、HTTP/3

// 2. 资源加载优先级
<link rel="preload" as="image" href="/hero.webp">
<img src="hero.webp" fetchpriority="high">

// 3. 关键 CSS 内联
<style>.hero { display: flex; }</style>
<link rel="preload" as="style" href="/main.css" onload="this.rel='stylesheet'">

// 4. 监控 LCP
new PerformanceObserver((list) => {
  const last = list.getEntries().at(-1)
  console.log('LCP:', last.startTime, last.element)
}).observe({ entryTypes: ['largest-contentful-paint'] })
```

**INP 优化策略：**

```js
// 1. 长任务拆分
function processInChunks(data, chunkSize = 50) {
  let index = 0
  function processChunk() {
    const end = Math.min(index + chunkSize, data.length)
    for (let i = index; i < end; i++) transform(data[i])
    index = end
    if (index < data.length) requestIdleCallback(processChunk)
  }
  requestIdleCallback(processChunk)
}

// 2. 事件处理优化
document.addEventListener('scroll', handleScroll, { passive: true })

// 3. Web Worker 处理复杂计算
const worker = new Worker('compute.js')
worker.postMessage({ data: largeData })
worker.onmessage = (e) => console.log(e.data)
```

**CLS 优化策略：**

```css
/* 1. 图片预留尺寸 */
img { aspect-ratio: 16 / 9; }

/* 2. 字体加载优化 */
@font-face {
  font-display: optional;
}

/* 3. 动态内容预留 */
.ad-placeholder { min-height: 250px; }

/* 4. 动画用 transform */
.animate { transform: translateY(0); }
```

**监控上报：**

```js
import { onLCP, onINP, onCLS } from 'web-vitals'
onLCP(sendToAnalytics)
onINP(sendToAnalytics)
onCLS(sendToAnalytics)
```

**知识点：** `Core Web Vitals` `LCP` `INP` `CLS` `性能监控` `资源优先级`

:::

### Q17: 大型 SPA 的预渲染方案？

> **🔥 中等 · 首屏优化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**预渲染 vs SSR 对比：**

| 特性 | SSR | 预渲染 | SSG | ISR |
|------|-----|--------|-----|-----|
| 渲染时机 | 每次请求 | 构建时 | 构建时 | 构建时 + 增量 |
| 服务器负担 | 高 | 无 | 无 | 低 |
| SEO 友好 | ✅ | ✅ | ✅ | ✅ |
| 适用场景 | 强交互/个性化 | 静态页 | 文档/博客 | 内容型 |

**方案一：Next.js - SSG + ISR**

```js
export async function getStaticProps({ params }) {
  const post = await fetchPost(params.slug)
  return {
    props: { post },
    revalidate: 3600
  }
}

export async function getStaticPaths() {
  const posts = await fetchAllPosts()
  return {
    paths: posts.map(p => ({ params: { slug: p.slug } })),
    fallback: 'blocking'
  }
}
```

**方案二：Nuxt.js - 混合渲染**

```js
export default defineNuxtComponent({
  prerender: { routes: ['/about', '/contact'] },
  ssr: true
})
```

**方案三：Vite + Prerender SPA Plugin**

```js
import prerender from '@prerenderer/vite-plugin'

export default {
  plugins: [
    prerender({
      routes: ['/', '/about', '/products'],
      renderer: '@prerenderer/puppeteer-renderer',
      rendererOptions: { renderAfterTime: 5000 }
    })
  ]
}
```

**方案四：Puppeteer 自研**

```js
import puppeteer from 'puppeteer'
import fs from 'fs'

async function prerender(routes) {
  const browser = await puppeteer.launch()
  for (const route of routes) {
    const page = await browser.newPage()
    await page.goto(`http://localhost:3000${route}`, {
      waitUntil: 'networkidle0'
    })
    const html = await page.content()
    fs.writeFileSync(`public${route}/index.html`, html)
    await page.close()
  }
  await browser.close()
}
```

**时机选择：**

```text
预渲染场景:
├─ 营销落地页、产品详情页
├─ 文档/博客、公开信息页
└─ 内容固定、流量大、需 SEO

SSR/CSR 场景:
├─ 用户后台、动态仪表盘
├─ 工具类应用、单页表单
└─ 需要登录、实时数据
```

**注意点：**

```js
// 1. Hydration 水合匹配
// 避免 dangerouslySetInnerHTML、随机数、时间戳

// 2. 环境区分
if (import.meta.env.SSR) {
  // 服务端代码
} else {
  // 客户端代码
}

// 3. 动态导入
const Chart = dynamic(() => import('./Chart'), { ssr: false })
```

**知识点：** `预渲染` `SSR` `SSG` `ISR` `Next.js` `SEO` `Hydration`

:::
