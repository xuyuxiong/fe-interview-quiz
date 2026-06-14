---
title: 性能优化方案面试题
description: 覆盖性能优化方法论/首屏优化/运行时优化/图片优化/代码分割等 8 道题
---

# 性能优化方案面试题

### Q1: 性能优化方法论

> **⭐ 简单 · 优化流程**

请说明性能优化的标准流程。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**性能优化四步法：**

### 1. 度量（Measure）
- 使用工具收集性能数据
- 确定基准线和优化目标

**工具：**
- Lighthouse（综合评分）
- WebPageTest（详细分析）
- Chrome DevTools（Network/Performance）
- 真实用户监控（RUM）

### 2. 分析（Analyze）
- 识别性能瓶颈
- 确定优先级

**常见瓶颈：**
- 资源过大
- 请求过多
- 渲染阻塞
- JavaScript 执行慢

### 3. 优化（Optimize）
- 针对性优化
- 渐进式改进

### 4. 监控（Monitor）
- 持续监控
- 防止性能回归

**性能指标优先级：**
1. LCP（最大内容绘制）
2. FID（首次输入延迟）
3. CLS（累积布局偏移）

```js
// 性能监控 SDK
function trackPerformance() {
  // LCP
  new PerformanceObserver((list) => {
    const entries = list.getEntries()
    const lastEntry = entries[entries.length - 1]
    console.log('LCP:', lastEntry.startTime)
  }).observe({ entryTypes: ['largest-contentful-paint'] })
  
  // FID
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      console.log('FID:', entry.processingStart - entry.startTime)
    })
  }).observe({ entryTypes: ['first-input'] })
  
  // CLS
  new PerformanceObserver((list) => {
    let cls = 0
    list.getEntries().forEach((entry) => {
      if (!entry.hadRecentInput) cls += entry.value
    })
    console.log('CLS:', cls)
  }).observe({ entryTypes: ['layout-shift'] })
}
```

**知识点：** `度量` `分析` `优化` `监控` `核心指标`

:::

### Q2: 首屏加载优化

> **🔥 中等 · 首屏性能**

请列举首屏加载优化方案。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**10 种首屏优化方案：**

### 1. 服务端渲染（SSR）
```jsx
// Next.js SSR
export async function getServerSideProps() {
  const data = await fetch('...')
  return { props: { data } }
}
```

### 2. 静态生成（SSG）
```jsx
// Next.js SSG
export async function getStaticProps() {
  return { props: {} }
}
```

### 3. 资源预加载
```html
<link rel="preload" href="/main.js" as="script">
<link rel="preload" href="/styles.css" as="style">
<link rel="prefetch" href="/next-page.js" as="script">
```

### 4. 关键 CSS 内联
```html
<style>
  /* 首屏关键 CSS */
  .header { ... }
  .hero { ... }
</style>
<link rel="stylesheet" href="/styles.css" media="print" onload="this.media='all'">
```

### 5. 图片优化
```html
<img 
  src="image.webp" 
  srcset="image-400.webp 400w, image-800.webp 800w"
  sizes="(max-width: 600px) 400px, 800px"
  loading="lazy"
  width="800"
  height="600"
>
```

### 6. 代码分割
```jsx
const HeavyComponent = lazy(() => import('./Heavy'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  )
}
```

### 7. 减少 JavaScript
- 移除未使用代码（Tree Shaking）
- 延迟加载非关键 JS
- 使用 Web Workers

### 8. CDN 加速
```jsx
// 静态资源走 CDN
<img src="https://cdn.example.com/images/hero.jpg" />
<script src="https://cdn.example.com/app.js"></script>
```

### 9. Gzip/Brotli 压缩
```nginx
# Nginx 配置
gzip on;
gzip_types text/plain application/json text/css application/javascript;
brotli on;
brotli_types text/plain application/json text/css application/javascript;
```

### 10. 骨架屏
```jsx
function Page() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetchData().then(setData)
  }, [])
  
  if (!data) return <Skeleton />
  return <Content data={data} />
}
```

**知识点：** `SSR` `SSG` `预加载` `代码分割` `CDN`

:::

### Q3: 运行时性能优化

> **🔥 中等 · 运行时**

请说明运行时性能优化方案。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. 避免长任务**

```js
// ❌ 长任务阻塞主线程
function processData(data) {
  return data.map(transform).filter(valid).sort(compare)
}

// ✅ 拆分为多个小任务
async function processDataAsync(data) {
  const chunkSize = 1000
  const results = []
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize)
    const chunkResult = await new Promise(resolve => {
      requestIdleCallback(() => {
        resolve(chunk.map(transform).filter(valid))
      })
    })
    results.push(...chunkResult)
  }
  return results.sort(compare)
}
```

**2. 虚拟列表**
```jsx
import { FixedSizeList } from 'react-window'

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={50}
    >
      {({ index, style }) => (
        <div style={style}>{items[index]}</div>
      )}
    </FixedSizeList>
  )
}
```

**3. 防抖节流**
```jsx
function SearchInput() {
  const [query, setQuery] = useState('')
  
  const debouncedSearch = useCallback(
    debounce(async (q) => {
      const results = await search(q)
    }, 300),
    []
  )
  
  return (
    <input 
      onChange={e => {
        setQuery(e.target.value)
        debouncedSearch(e.target.value)
      }}
    />
  )
}
```

**4. 避免重排重绘**
```jsx
// ❌ 频繁触发重排
function badAnimation() {
  element.style.width = '100px'
  element.offsetHeight // 强制重排
  element.style.width = '200px'
}

// ✅ 批量修改
function goodAnimation() {
  element.style.transform = 'translateX(200px)'
  element.style.transform = 'scale(1.2)'
}

// ✅ 使用 CSS 类
element.classList.add('animating')
```

**5. Web Workers**
```js
// worker.js
self.onmessage = (e) => {
  const result = heavyComputation(e.data)
  self.postMessage(result)
}

// 主线程
const worker = new Worker('worker.js')
worker.postMessage(data)
worker.onmessage = (e) => console.log(e.data)
```

**知识点：** `长任务` `虚拟列表` `防抖节流` `重排重绘` `Web Workers`

:::

### Q4: 图片优化全方案

> **🔥 中等 · 图片性能**

请说明图片优化的完整方案。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. 格式优化**

```
格式选择优先级：
AVIF > WebP > JPEG XL > MozJPEG > 原始 JPEG/PNG

浏览器支持：
- AVIF: Chrome 85+, Firefox 93+
- WebP: Chrome 23+, Firefox 65+, Safari 14+
```

**2. 响应式图片**
```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="" loading="lazy">
</picture>

<!-- srcset/sizes -->
<img
  src="image-800.jpg"
  srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  alt=""
>
```

**3. 懒加载**
```jsx
// 原生懒加载
<img src="image.jpg" loading="lazy" alt="">

// IntersectionObserver 懒加载
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target
      img.src = img.dataset.src
      observer.unobserve(img)
    }
  })
}, { rootMargin: '200px' })
```

**4. 图片 CDN**
```jsx
// imgix/Cloudinary 等
<img 
  src={`https://cdn.example.com/images/hero.jpg?w=800&q=80&fit=crop`}
  alt=""
/>
```

**5. 占位符**
```jsx
function ImageWithBlur({ src, alt }) {
  const [loaded, setLoaded] = useState(false)
  
  return (
    <div className="image-container">
      <img 
        src={`${src}?w=20&q=10`} 
        className={loaded ? 'loaded' : 'blur'}
        onLoad={() => setLoaded(true)}
        alt={alt}
      />
    </div>
  )
}
```

**6. 预加载关键图片**
```html
<link rel="preload" as="image" href="/hero.jpg">
<link rel="preload" as="image" href="/logo.png">
```

**知识点：** `图片格式` `响应式图片` `懒加载` `CDN` `占位符`

:::

### Q5: 代码分割策略

> **🔥 中等 · 代码分割**

请说明代码分割的实现策略。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. 路由级分割**
```jsx
// React Router + lazy
const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <Suspense fallback={<Loading />}>
          <Home />
        </Suspense>
      } />
    </Routes>
  )
}
```

**2. 组件级分割**
```jsx
// 大组件单独拆分
const Editor = lazy(() => import('./components/Editor'))

function PostCreate() {
  const [showEditor, setShowEditor] = useState(false)
  
  return (
    <>
      <button onClick={() => setShowEditor(true)}>
        打开编辑器
      </button>
      {showEditor && (
        <Suspense fallback={<Loading />}>
          <Editor />
        </Suspense>
      )}
    </>
  )
}
```

**3. 库分割**
```js
// webpack 配置
optimization: {
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendors: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 10
      },
      react: {
        test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
        name: 'react',
        priority: 20
      }
    }
  }
}
```

**4. 预加载**
```jsx
// 鼠标悬停时预加载
function NavLink({ to, children }) {
  const prefetch = () => {
    import(/* webpackPrefetch: true */ './pages/About')
  }
  
  return (
    <Link to={to} onMouseEnter={prefetch}>
      {children}
    </Link>
  )
}
```

**知识点：** `路由分割` `组件分割` `库分割` `预加载`

:::

### Q6: 预加载策略

> **⭐ 简单 · 资源预加载**

请说明 preload/prefetch/preconnect/dns-prefetch 的区别。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**预加载类型对比：**

| 类型 | 优先级 | 使用时机 | 示例 |
|------|--------|---------|------|
| preload | 高 | 当前页面必需 | 关键 CSS/JS/图片 |
| prefetch | 中 | 下一页可能用 | 路由组件 |
| preconnect | 中 | 需要连接外部域 | CDN/API 域名 |
| dns-prefetch | 低 | 可能连接 | 第三方域名 |

```html
<!-- preload：当前页面必需资源 -->
<link rel="preload" href="/main.css" as="style">
<link rel="preload" href="/main.js" as="script">
<link rel="preload" href="/font.woff2" as="font" type="font/woff2" crossorigin>

<!-- prefetch：下一页可能用 -->
<link rel="prefetch" href="/next-page.js">

<!-- preconnect：建立连接（TCP+TLS） -->
<link rel="preconnect" href="https://cdn.example.com">

<!-- dns-prefetch：仅 DNS 解析 -->
<link rel="dns-prefetch" href="https://analytics.example.com">

<!-- 完整示例 -->
<head>
  <!-- DNS 预解析 -->
  <link rel="dns-prefetch" href="//fonts.googleapis.com">
  <link rel="dns-prefetch" href="//cdn.example.com">
  
  <!-- 预连接 -->
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
  <link rel="preconnect" href="https://cdn.example.com">
  
  <!-- 预加载关键资源 -->
  <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="/critical.css" as="style">
  <link rel="preload" href="/hero.webp" as="image">
  
  <!-- 预取下一页 -->
  <link rel="prefetch" href="/about.js">
</head>
```

**React 内预加载**
```jsx
function ProductList() {
  const products = useData()
  
  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>
          <Link 
            to={`/product/${product.id}`}
            onMouseEnter={() => {
              // 预加载产品详情页
              import(/* webpackPrefetch: true */ './ProductDetail')
            }}
          >
            {product.name}
          </Link>
        </li>
      ))}
    </ul>
  )
}
```

**知识点：** `preload` `prefetch` `preconnect` `dns-prefetch`

:::

### Q7: Service Worker 缓存策略

> **💀 困难 · SW 缓存**

请说明 Service Worker 的缓存策略。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Service Worker 缓存策略：**

### 1. Cache First
```js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request)
    })
  )
})
// 适用：静态资源（图片/CSS/JS）
```

### 2. Network First
```js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  )
})
// 适用：API 请求，需要最新数据
```

### 3. Stale While Revalidate
```js
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open('dynamic').then((cache) => {
      return cache.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((response) => {
          cache.put(event.request, response.clone())
          return response
        })
        return cached || fetchPromise
      })
    })
  )
})
// 适用：经常更新但不关键的内容
```

### 4. Cache Only
```js
self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request))
})
// 适用：离线资源
```

### 5. Network Only
```js
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request))
})
// 适用：需要实时数据的请求
```

**Workbox 简化实现**
```js
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'

// 静态资源：Cache First
registerRoute(
  /\.(?:js|css|png|jpg|svg|woff2?)$/,
  new CacheFirst({
    cacheName: 'static-resources',
    fetchOptions: { credentials: 'omit' }
  })
)

// API 请求：Network First
registerRoute(
  /^https:\/\/api\.example\.com\//,
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3
  })
)

// 导航请求：Network First
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache'
  })
)
```

**知识点：** `Service Worker` `缓存策略` `Workbox` `离线缓存`

:::

### Q8: 性能预算

> **💀 困难 · 性能预算**

请解释性能预算（Performance Budget）的概念和实施方法。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**性能预算概念：**
为应用设置性能指标上限，确保性能不随迭代退化。

**核心指标预算：**

| 指标 | 目标值 | 警告值 | 失败值 |
|------|--------|--------|--------|
| LCP | < 2.5s | < 4s | >= 4s |
| FID | < 100ms | < 300ms | >= 300ms |
| CLS | < 0.1 | < 0.25 | >= 0.25 |
| Bundle Size | < 170kb | < 250kb | >= 250kb |
| TTI | < 3.8s | < 7.3s | >= 7.3s |

**实施方法：**

### 1. Lighthouse CI
```json
// lighthouse.config.js
module.exports = {
  extends: 'lighthouse:default',
  settings: {
    budgets: [{
      path: '/',
      resourceSizes: [
        { resourceType: 'script', budget: 170 },
        { resourceType: 'document', budget: 30 },
        { resourceType: 'stylesheet', budget: 30 },
        { resourceType: 'image', budget: 500 }
      ],
      resourceCounts: [
        { resourceType: 'total', budget: 50 }
      ]
    }]
  }
}
```

### 2. Webpack Bundle Analyzer
```js
// webpack.config.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      default_sizes: 'gzip'
    })
  ]
}
```

### 3. CI 检查
```yaml
# .github/workflows/performance.yml
name: Performance Budget

on: [push]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v8
        with:
          budgetPath: ./budget.json
          uploadArtifacts: true
```

### 4. 实时监控
```js
// 性能监控上报
function reportPerformance() {
  // 获取性能指标
  const lcp = getLCP()
  const fid = getFID()
  const cls = getCLS()
  
  // 超过预算则上报
  if (lcp.value > 2500 || fid.value > 100 || cls.value > 0.1) {
    sendToAnalytics({ lcp, fid, cls })
  }
}
```

**知识点：** `性能预算` `Lighthouse CI` `Bundle 分析` `CI 检查`

:::
### Q9: 如何设计一个前端性能监控系统？

> **🔥 中等 · 监控**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**性能监控系统架构：**

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│  数据采集   │ -> │  数据上报    │ -> │  存储分析   │
│  (Browser) │    │  (SDK)       │    │  (Backend) │
└─────────────┘    └──────────────┘    └─────────────┘
```

**1. 核心指标采集**

```js
// Core Web Vitals
import { onLCP, onFID, onCLS, onINP } from 'web-vitals'

const performanceData = {
  lcp: null,
  fid: null,
  cls: 0,
  inP: null,
  fcp: null,
  tti: null
}

onLCP(({ value, attribution }) => {
  performanceData.lcp = {
    value,
    element: attribution.element?.tagName,
    url: attribution.url,
    time: performance.now()
  }
})

onFID(({ value }) => { performanceData.fid = value })
onCLS(({ value }) => { performanceData.cls = value })
onINP(({ value }) => { performanceData.inp = value })

// FCP
new PerformanceObserver((list) => {
  const entries = list.getEntries()
  performanceData.fcp = entries.at(-1)?.startTime
}).observe({ entryTypes: ['paint'] })
```

**2. 资源性能监控**

```js
// 资源加载时间
const resources = performance.getEntriesByType('resource')
const resourceMetrics = resources.map(r => ({
  name: r.name,
  type: r.initiatorType,
  duration: r.duration,
  transferSize: r.transferSize,
  encodedBodySize: r.encodedBodySize,
  decodedBodySize: r.decodedBodySize
}))

// 慢资源检测
const slowResources = resources.filter(r => r.duration > 1000)
```

**3. 错误监控**

```js
// JS 错误
window.onerror = (msg, src, line, col, err) => {
  reportError({ type: 'js', message: msg, source: src, line, col, stack: err?.stack })
}

// Promise 错误
window.onunhandledrejection = (e) => {
  reportError({ type: 'promise', reason: e.reason })
}

// 资源加载错误
window.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT') {
    reportError({ type: 'resource', url: e.target.src })
  }
}, true)
```

**4. 上报策略**

```js
// 使用 sendBeacon 保证离线也能上报
function report(data) {
  const blob = new Blob([JSON.stringify({
    ...data,
    ua: navigator.userAgent,
    url: location.href,
    timestamp: Date.now()
  })], { type: 'application/json' })
  
  navigator.sendBeacon('/api/perf', blob)
}

// 批量上报，减少请求数
const buffer = []
const REPORT_INTERVAL = 5000

setInterval(() => {
  if (buffer.length > 0) {
    report({ metrics: buffer.splice(0, 100) })
  }
}, REPORT_INTERVAL)
```

**5. 性能预算告警**

```js
const BUDGETS = {
  lcp: 2500,
  fid: 100,
  cls: 0.1,
  fcp: 1800
}

Object.entries(performanceData).forEach(([key, value]) => {
  if (value && value > BUDGETS[key]) {
    reportViolation({ metric: key, value, budget: BUDGETS[key] })
  }
})
```

**6. 可视化分析**

```
Dashboard 指标:
├─ 趋势图（P50/P75/P90/P99）
├─ 地域分布热力图
├─ 设备/浏览器占比
├─ 慢页面 TOP10
└─ 错误类型分布
```

**知识点：** `性能监控` `Core Web Vitals` `sendBeacon` `指标采集` `告警系统`

:::

### Q10: 大文件上传的断点续传方案？（切片、哈希、秒传）

> **🔥 中等 · 文件上传**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**大文件上传完整方案：**

```
1. 文件切片
2. 计算文件哈希
3. 后端检查（秒传/断点续传）
4. 分片上传
5. 分片合并
```

**1. 文件切片**

```js
function sliceFile(file, chunkSize = 2 * 1024 * 1024) {
  const chunks = []
  let start = 0
  
  while (start < file.size) {
    const chunk = file.slice(start, start + chunkSize)
    chunks.push({
      chunk,
      index: chunks.length,
      start,
      end: start + chunk.size
    })
    start += chunkSize
  }
  
  return chunks
}
```

**2. 计算文件哈希（Web Worker）**

```js
// worker.js
self.onmessage = async (e) => {
  const { file } = e.data
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  self.postMessage({ hash })
}

// 主线程
const worker = new Worker('hash-worker.js')
worker.postMessage({ file })
worker.onmessage = (e) => {
  const fileHash = e.data.hash
  checkFileExists(fileHash)
}
```

**3. 秒传检测**

```js
async function checkFileExists(hash) {
  const res = await fetch(`/api/file/check?hash=${hash}`)
  const result = await res.json()
  
  if (result.exists) {
    // 秒传成功
    onUploadComplete({ url: result.url, status: 'exists' })
    return null
  }
  
  return result.uploadId
}
```

**4. 断点续传**

```js
async function resumeUpload(uploadId, hash, chunks) {
  // 获取已上传的分片
  const res = await fetch(`/api/file/progress?uploadId=${uploadId}`)
  const { uploadedChunks } = await res.json()
  
  // 过滤未上传的分片
  const remainingChunks = chunks.filter(
    chunk => !uploadedChunks.includes(chunk.index)
  )
  
  return remainingChunks
}
```

**5. 并发上传**

```js
async function uploadChunks(chunks, uploadId, hash, concurrency = 4) {
  const results = []
  
  // 使用信号量控制并发数
  const semaphore = new Semaphore(concurrency)
  
  const uploadTasks = chunks.map(async (chunk) => {
    await semaphore.acquire()
    try {
      const formData = new FormData()
      formData.append('file', chunk.chunk)
      formData.append('index', chunk.index)
      formData.append('uploadId', uploadId)
      formData.append('hash', hash)
      
      const res = await fetch('/api/file/upload', {
        method: 'POST',
        body: formData,
        onProgress: (e) => {
          const progress = (chunk.index / chunks.length) * 100
          onProgress(progress)
        }
      })
      
      results.push(await res.json())
    } finally {
      semaphore.release()
    }
  })
  
  await Promise.all(uploadTasks)
  return results
}
```

**6. 合并分片**

```js
async function mergeChunks(uploadId, hash, totalChunks) {
  const res = await fetch('/api/file/merge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uploadId, hash, totalChunks })
  })
  return await res.json()
}
```

**完整流程：**

```jsx
async function uploadFile(file) {
  const hash = await computeHash(file)
  const uploadId = await checkFileExists(hash)
  
  if (!uploadId) return { status: 'exists' }
  
  const chunks = sliceFile(file)
  const remainingChunks = await resumeUpload(uploadId, hash, chunks)
  
  if (remainingChunks.length > 0) {
    await uploadChunks(remainingChunks, uploadId, hash)
  }
  
  const { url } = await mergeChunks(uploadId, hash, chunks.length)
  return { status: 'success', url }
}
```

**知识点：** `大文件上传` `分片上传` `断点续传` `秒传` `文件哈希` `并发控制`

:::

### Q11: 图片优化全方案？格式选择、压缩、懒加载、CDN、响应式图片？

> **🔥 中等 · 性能优化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**图片优化完整方案：**

**1. 格式选择**

| 格式 | 适用场景 | 压缩率 | 浏览器支持 |
|------|----------|--------|-----------|
| WebP | 通用图片 | 比 JPEG 小 30% | 现代浏览器 |
| AVIF | 高质量图片 | 比 WebP 小 20% | 较新浏览器 |
| JPEG | 照片 | 有损压缩 | 全兼容 |
| PNG | 透明图片 | 无损 | 全兼容 |
| SVG | 图标/图形 | 矢量 | 全兼容 |

```jsx
// 现代格式 + 降级
<picture>
  <source srcSet="/image.avif" type="image/avif" />
  <source srcSet="/image.webp" type="image/webp" />
  <img src="/image.jpg" alt="Fallback" />
</picture>
```

**2. 图片压缩**

```js
// 使用 imagemin 压缩
import imagemin from 'imagemin'
import imageminWebp from 'imagemin-webp'

await imagemin(['images/*.{jpg,png}'], {
  destination: 'images/optimized',
  plugins: [
    imageminWebp({ quality: 75 }),
    imageminMozjpeg({ quality: 75 })
  ]
})

// 在线工具：TinyPNG、Squoosh
```

**3. 懒加载**

```jsx
// 原生懒加载
<img src="image.jpg" loading="lazy" alt="lazy" />

// 或使用 Intersection Observer
function LazyImage({ src, alt }) {
  const [loaded, setLoaded] = useState(false)
  const ref = useRef(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          ref.current.src = src
          setLoaded(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [src])
  
  return (
    <img 
      ref={ref} 
      src={loaded ? src : 'placeholder.jpg'} 
      alt={alt}
      loading="lazy"
    />
  )
}
```

**4. CDN 加速**

```
CDN 优化策略:
├─ 就近节点分发
├─ 浏览器缓存（Cache-Control）
├─ 压缩传输（Gzip/Brotli）
└─ HTTP/2多路复用

配置示例:
Cache-Control: public, max-age=31536000, immutable
```

**5. 响应式图片**

```jsx
// srcset 根据屏幕密度加载
<img
  src="image-800.jpg"
  srcSet="
    image-400.jpg 400w,
    image-800.jpg 800w,
    image-1200.jpg 1200w
  "
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Responsive"
/>

// 根据艺术指导
<picture>
  <source media="(max-width: 600px)" srcSet="mobile.jpg" />
  <source media="(max-width: 1200px)" srcSet="tablet.jpg" />
  <img src="desktop.jpg" alt="Art Directed" />
</picture>
```

**6. 性能监控**

```js
// 监控图片加载
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('load', () => {
    const entry = performance.getEntriesByName(img.src)[0]
    console.log(`Image loaded in ${entry.duration}ms`)
  })
})
```

**最佳实践总结：**

```
1. 选择合适的格式（WebP/AVIF > JPEG/PNG）
2. 按需压缩（质量 75-85）
3. 懒加载非首屏图片
4. 使用 CDN 分发
5. 响应式图片适配多端
6. 设置长期缓存
7. 使用 SVG 替代图标字体
```

**知识点：** `图片格式` `图片压缩` `懒加载` `CDN` `响应式图片` `srcset` `性能优化`

:::
