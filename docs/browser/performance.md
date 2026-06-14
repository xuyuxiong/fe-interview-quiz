### Q1: RAIL 性能模型是什么？

> **🔥 中等 · 浏览器**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**RAIL** 是 Google 提出的以用户为中心的性能模型，定义了4类关键交互的时间目标。

| 阶段 | 目标 | 用户体验阈值 | 技术实现 |
|------|------|-------------|---------|
| **R**esponse | 100ms内响应 | 点击按钮后有即时反馈 | 事件处理≤100ms |
| **A**nimation | 60fps（16ms/帧） | 动画流畅无卡顿 | CSS transform/opacity；避免布局抖动 |
| **I**dle | 50ms内完成空闲任务 | 不阻塞用户交互 | requestIdleCallback；任务分片 |
| **L**oad | 1000ms内可交互 | 页面快速可用 | 关键渲染路径优化；代码分割 |

```text
100ms：用户感知操作"即时"的阈值
  → 点击、输入、拖拽等交互的响应时间上限

16ms：60fps下一帧的预算
  → JS执行 + 样式计算 + 布局 + 绘制 + 合成 ≤ 16ms
  → 实际JS只有约6ms（其余给浏览器渲染）

50ms：空闲任务的上限
  → 超过50ms的任务会阻塞用户交互
  → 长任务需拆分为多个小任务

1000ms：用户保持注意力的极限
  → 超过1s用户会感觉"慢"
  → 首屏可交互时间（TTI）应≤1s
```

```js
// RAIL 实践示例

// 1. Response：事件处理 ≤ 100ms
button.addEventListener('click', (e) => {
  // 即时反馈（视觉响应）
  e.target.classList.add('active')
  
  // 耗时操作延后处理
  requestAnimationFrame(() => {
    processExpensiveAction()
  })
})

// 2. Animation：只使用合成属性
.animate {
  transform: translateX(100px);  /* ✅ GPU合成 */
  opacity: 0.5;                  /* ✅ GPU合成 */
  /* width: 200px;               ❌ 触发布局 */
  /* top: 100px;                 ❌ 触发布局 */
}

// 3. Idle：利用空闲时间
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && tasks.length) {
    const task = tasks.shift()
    task()
  }
})

// 4. Load：代码分割减小首屏体积
const Dashboard = React.lazy(() => import('./Dashboard'))
```

**知识点：** `RAIL` `性能模型` `FPS` `requestIdleCallback` `关键渲染路径`

:::

### Q2: 动画性能如何优化？

> **🔥 中等 · browser/performance**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**优化方案：**
1. 使用 transform 和 opacity（GPU 加速）
2. 避免 animate 布局属性（width、height）
3. 使用 will-change 提示浏览器
4. 减少绘制区域
5. 使用 requestAnimationFrame

```css
/* 好 */
.element {
  transform: translateX(100px);
  opacity: 0.5;
}

/* 差 */
.element {
  width: 100px;  /* 触发回流 */
}
```

**知识点：**`动画优化` `GPU 加速` `transform` `回流重绘`

:::

### Q3: 长列表渲染如何优化？虚拟列表原理是什么？

> **🔥 中等 · browser/performance**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**虚拟列表只渲染可见区域元素。**

**原理：**
1. 计算容器可视区域
2. 只渲染可见项 + 缓冲区
3. 滚动时动态更新渲染项

```javascript
// 简化版虚拟列表
function renderVisibleItems() {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const visibleItems = items.slice(startIndex, startIndex + visibleCount);
  render(visibleItems, startIndex * itemHeight);
}
```

**知识点：**`虚拟列表` `长列表` `性能优化`

:::

### Q4: 白屏时间如何计算和优化？

> **🔥 中等 · browser/performance**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**白屏时间 = 首字节到达 - 导航开始**

**计算公式：**
```javascript
const timing = performance.getEntriesByType('navigation')[0];
const whiteScreen = timing.responseStart - timing.fetchStart;
```

**优化方案：**
1. SSR 服务端渲染
2. 关键 CSS 内联
3. 资源预加载
4. 降级骨架屏

**知识点：**`白屏时间` `性能指标` `SSR`

:::

### Q5: CDN 原理和使用场景？

> **⭐ 简单 · browser/performance**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CDN 通过边缘节点缓存内容，就近访问。**

**使用场景：**
- 静态资源（JS、CSS、图片）
- 大文件下载
- 视频流媒体
- 全球访问的网站

**原理：**
1. DNS 调度到最近节点
2. 节点缓存命中直接返回
3. 未命中回源获取

**知识点：**`CDN` `缓存` `边缘节点`

:::

### Q6: 回流和重绘如何避免？

> **🔥 中等 · browser/performance**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**回流（Reflow）：** 布局变化，成本高
**重绘（Repaint）：** 样式变化，成本较低

**避免方法：**
1. 合并 DOM 操作（DocumentFragment）
2. 批量样式修改（class 切换）
3. 绝对定位脱离文档流
4. 避免频繁读取布局属性（offsetTop 等）

```javascript
// 差：每次循环触发回流
for (let i = 0; i < 100; i++) {
  element.style.left = i + 'px';
}

// 好：使用 transform
element.style.transform = `translateX(${i}px)`;
```

**知识点：**`回流` `重绘` `性能优化`

:::

### Q7: 性能优化闭环如何做？

> **🔥 中等 · 浏览器**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

性能优化不是一次性工作，而是一个持续迭代的过程：**测量 → 分析 → 优化 → 验证 → 监控**。

```text
         ┌──────────────────────────────────────┐
         │                                      │
    测量 ──→ 分析 ──→ 优化 ──→ 验证 ──→ 持续监控
    ↑                                     │
    └─────────────── 发现回归 ←──────────────┘
```

**1. 测量（建立基线）**

```js
// Performance API 采集关键指标
const [nav] = performance.getEntriesByType('navigation')
console.log('DNS:', nav.domainLookupEnd - nav.domainLookupStart)
console.log('TCP:', nav.connectEnd - nav.connectStart)
console.log('TTFB:', nav.responseStart - nav.requestStart)
console.log('DOM:', nav.domInteractive)
console.log('Load:', nav.loadEventEnd)

// Web Vitals
import { onLCP, onINP, onCLS } from 'web-vitals'
onLCP(metric => reportToAnalytics('LCP', metric))
onINP(metric => reportToAnalytics('INP', metric))
onCLS(metric => reportToAnalytics('CLS', metric))
```

**2. 分析（定位瓶颈）**

| 工具 | 用途 | 场景 |
|------|------|------|
| Chrome DevTools Performance | 火焰图、Long Task | 分析运行时卡顿 |
| Lighthouse | 综合评分 | 页面整体性能审计 |
| WebPageTest | 多地域测试 | 模拟不同网络环境 |
| webpack-bundle-analyzer | 包体积分析 | 找出过大的依赖 |
| Coverage Panel | 代码覆盖率 | 找出未使用的JS/CSS |

**3. 优化（针对性改进）**

```text
加载优化：代码分割、预加载、图片优化、CDN
运行时优化：虚拟列表、Web Worker、requestAnimationFrame
渲染优化：减少重排重绘、CSS contain、will-change
网络优化：HTTP/2、缓存策略、压缩
```

**4. 验证（A/B对比）**

```js
// 优化前后对比
// Before: LCP 4.2s → After: LCP 2.1s
// Before: JS Bundle 800KB → After: 320KB
// Before: CLS 0.25 → After: 0.05
```

**5. 持续监控（防回归）**

```yaml
# Lighthouse CI 配置
ci:
  collect:
    url: ['https://example.com']
    runs: 3
  assert:
    assertions:
      first-contentful-paint: ['error', { maxNumericValue: 2000 }]
      largest-contentful-paint: ['error', { maxNumericValue: 2500 }]
      interactive: ['error', { maxNumericValue: 5000 }]
      cumulative-layout-shift: ['error', { maxNumericValue: 0.1 }]
```

**知识点：** `性能优化` `测量分析` `Lighthouse CI` `Web Vitals` `持续监控`

:::

### Q8: setTimeout 会导致内存泄漏吗？

> **🔥 中等 · browser/performance**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**会，如果定时器引用未清理。**

**泄漏场景：**
```javascript
// 组件销毁未清除定时器
function Component() {
  setInterval(() => {
    // 引用了组件状态
    updateState();
  }, 1000);
  
  // 组件卸载后，定时器仍运行
}
```

**修复：**
```javascript
useEffect(() => {
  const timer = setInterval(...);
  return () => clearInterval(timer);  // 清理
}, []);
```

**知识点：**`setTimeout` `内存泄漏` `定时器`

:::

### Q9: onload 和 DOMContentLoaded 的区别？

> **⭐ 简单 · browser/performance**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 事件 | 触发时机 |
|------|----------|
| DOMContentLoaded | DOM 树构建完成（不含图片等资源） |
| load | 所有资源加载完成（包括图片、样式） |

**使用场景：**
- DOM 操作 → DOMContentLoaded
- 需要图片尺寸 → load

**知识点：**`onload` `DOMContentLoaded` `页面加载`

:::

### Q10: 内存泄漏如何排查？

> **💀 困难 · browser/performance**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**排查工具：** Chrome DevTools Memory 面板

**步骤：**
1. 截取堆快照（Heap Snapshot）
2. 执行可能泄漏的操作
3. 再次截取快照
4. 对比查找增长对象

**常见原因：**
- 未清理的定时器/监听器
- 闭包引用
- DOM 引用未释放
- 全局变量累积

**知识点：**`内存泄漏` `排查` `DevTools`

:::

### Q11: 前端性能监控手段有哪些？

> **🔥 中等 · browser/performance**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**监控指标：**
- FP/FCP（首屏绘制）
- LCP（最大内容绘制）
- FID（首次输入延迟）
- CLS（累积布局偏移）

**上报方式：**
```javascript
// Performance Observer
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    report(entry);
  }
});
observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
```

**知识点：**`性能监控` `Performance API` `核心指标`

:::

### Q12: Web Vitals 核心指标有哪些？

> **🔥 中等 · 浏览器**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Core Web Vitals** 是 Google 定义的核心性能指标，影响搜索排名。

| 指标 | 全称 | 好的阈值 | 需改进 | 差 | 衡量 |
|------|------|---------|--------|-----|------|
| **LCP** | Largest Contentful Paint | ≤2.5s | 2.5-4s | >4s | 加载性能 |
| **INP** | Interaction to Next Paint | ≤200ms | 200-500ms | >500ms | 交互响应 |
| **CLS** | Cumulative Layout Shift | ≤0.1 | 0.1-0.25 | >0.25 | 视觉稳定性 |

> 注：2024年3月 INP 已取代 FID 成为核心指标

```js
// 测量 Web Vitals
import { onLCP, onINP, onCLS } from 'web-vitals'

onLCP(console.log)   // LCP: 最大内容绘制时间
onINP(console.log)   // INP: 交互到下次绘制的延迟
onCLS(console.log)   // CLS: 累积布局偏移

// LCP 优化 — 加速最大内容元素渲染
// 常见LCP元素：<img>、<video>、背景图、大段文本
// 优化：预加载关键资源、优化图片、减少阻塞资源

// INP 优化 — 减少交互延迟
// 原因：长任务阻塞主线程、事件处理过慢
// 优化：任务分片、减少主线程工作、Web Worker

// CLS 优化 — 防止布局抖动
// 原因：无尺寸图片、动态注入内容、字体闪烁
// 优化：
```

```html
<!-- CLS 优化示例 -->
<!-- 1. 图片设置宽高 -->
<img src="hero.jpg" width="800" height="600" alt="hero">

<!-- 2. 字体显示策略 -->
<link rel="stylesheet" href="font.css"
  media="print" onload="this.media='all'">
<style>
  @font-face {
    font-family: 'CustomFont';
    src: url('font.woff2');
    font-display: swap;  /* 先用系统字体，加载后替换 */
  }
</style>

<!-- 3. 预留动态内容空间 -->
<div style="min-height: 300px;" id="ad-slot">
  <!-- 广告异步加载，预留高度防止偏移 -->
</div>
```

**其他重要 Web Vitals 指标：**

| 指标 | 说明 |
|------|------|
| FCP (First Contentful Paint) | 首次内容绘制 |
| TTFB (Time to First Byte) | 首字节时间 |
| TBT (Total Blocking Time) | 总阻塞时间 |

**知识点：** `Web Vitals` `LCP` `INP` `CLS` `FCP` `性能指标`

:::

### Q13: 资源预加载策略

> **🔥 中等 · browser/performance**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**预加载类型：**
```html
<!-- 预加载关键资源 -->
<link rel="preload" href="main.js" as="script">

<!-- 预连接 CDN -->
<link rel="preconnect" href="https://cdn.example.com">

<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//api.example.com">

<!-- 提前获取下一页面 -->
<link rel="prefetch" href="next.html">
```

**知识点：**`预加载` `preload` `preconnect`

:::

### Q14: 代码分割和懒加载

> **🔥 中等 · browser/performance**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**动态导入实现懒加载：**
```javascript
// 路由懒加载
const About = lazy(() => import('./About'));

//  Intersection Observer 懒加载
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadImage(entry.target);
    }
  });
});
```

**知识点：**`代码分割` `懒加载` `动态导入`

:::

### Q15: 图片优化策略

> **⭐ 简单 · browser/performance**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**优化方案：**
1. 使用 WebP/AVIF 格式
2. 响应式图片（srcset）
3. 懒加载
4. CDN 压缩
5. 适当尺寸

```html
<img src="image.jpg" 
     srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"
     sizes="(max-width: 600px) 480px, 800px"
     loading="lazy">
```

**知识点：**`图片优化` `WebP` `懒加载`

:::

### Q16: 防抖和节流

> **🔥 中等 · browser/performance**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**防抖（Debounce）：** 事件后延迟执行
```javascript
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
```

**节流（Throttle）：** 固定间隔执行
```javascript
function throttle(fn, interval) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn(...args);
    }
  };
}
```

**知识点：**`防抖` `节流` `性能优化`

:::

### Q17: Service Worker 缓存策略有哪些？

> **💀 困难 · 浏览器**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**6种核心缓存策略：**

| 策略 | 流程 | 适用场景 | 特点 |
|------|------|---------|------|
| Cache First | 缓存→未命中→网络 | 静态资源、字体 | 快，但可能过时 |
| Network First | 网络→失败→缓存 | API、频繁更新的内容 | 新鲜，但离线慢 |
| Stale While Revalidate | 返回缓存+后台更新 | 非关键的动态内容 | 快且更新 |
| Cache Only | 只从缓存取 | 离线页面、预缓存 | 极快，需预缓存 |
| Network Only | 只从网络取 | 非GET请求、实时数据 | 始终最新 |
| Cache + Network Race | 缓存和网络同时请求 | 追求最快响应 | 复杂但快 |

```js
// 1. Cache First（缓存优先）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  )
})

// 2. Network First（网络优先）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone()
        caches.open('v1').then(cache => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

// 3. Stale While Revalidate（先用缓存，后台更新）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open('v1').then(cache => {
      return cache.match(event.request).then(cached => {
        const fetchPromise = fetch(event.request).then(response => {
          cache.put(event.request, response.clone())
          return response
        })
        return cached || fetchPromise  // 有缓存先返回，同时后台更新
      })
    })
  )
})

// 4. Workbox 一行搞定（推荐）
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'

registerRoute(
  ({request}) => request.destination === 'image',
  new CacheFirst({ cacheName: 'images', plugins: [expirationPlugin] })
)
registerRoute(
  ({url}) => url.pathname.startsWith('/api/'),
  new NetworkFirst({ cacheName: 'api', networkTimeoutSeconds: 3 })
)
registerRoute(
  ({url}) => url.pathname.startsWith('/articles/'),
  new StaleWhileRevalidate({ cacheName: 'articles' })
)
```

**缓存策略选择决策树：**

```text
资源类型？
├── 静态资源（JS/CSS/字体/图片）→ Cache First
├── API数据
│   ├── 实时性要求高 → Network Only / Network First
│   └── 可接受短暂过时 → Stale While Revalidate
├── HTML页面 → Network First
└── 离线备用页 → Cache Only（预缓存）
```

**知识点：** `Service Worker` `缓存策略` `Cache First` `Network First` `Stale While Revalidate` `Workbox`

:::

### Q18: 打包优化策略有哪些？

> **🔥 中等 · 浏览器**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 优化方向 | 具体手段 | 效果 |
|---------|---------|------|
| 代码缩减 | Tree Shaking | 移除未引用代码 |
| 按需加载 | Code Splitting | 减小首屏体积 |
| 压缩 | Terser/mini-css | 减小文件体积 |
| 公共提取 | SplitChunks | 避免重复打包 |
| 并行处理 | thread-loader | 加快构建速度 |

```js
// webpack.config.js 完整优化配置
module.exports = {
  mode: 'production',
  
  // 1. 代码分割
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          minChunks: 2,
          name: 'common',
          chunks: 'all',
        }
      }
    },
    // 2. Tree Shaking（production模式自动开启）
    usedExports: true,
    minimize: true,
  },
  
  // 3. 并行构建
  module: {
    rules: [{
      test: /\.js$/,
      use: 'thread-loader',  // 多线程编译
    }]
  },
  
  // 4. 持久化缓存
  cache: { type: 'filesystem' },
  
  // 5. externals 减小包体积
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  }
}
```

```js
// 动态导入（按需加载）
const Dashboard = React.lazy(() => import('./Dashboard'))
const Settings = React.lazy(() => import('./Settings'))

// 路由级代码分割
<Route path="/dashboard" element={<Suspense fallback={<Loading />}><Dashboard /></Suspense>} />
<Route path="/settings" element={<Suspense fallback={<Loading />}><Settings /></Suspense>} />
```

**构建速度优化额外建议：**

```text
- esbuild-loader 替代 babel-loader（快10-100倍）
- 缩小 loader 作用范围（include/exclude）
- DLL Plugin 预编译不变依赖
- 合理使用 source-map（开发用eval-cheap，生产用hidden-source-map）
```

**知识点：** `打包优化` `Tree Shaking` `Code Splitting` `SplitChunks` `Webpack`

:::

### Q19: 长列表渲染如何优化？虚拟列表原理是什么？

> **💀 困难 · 浏览器**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心思想：只渲染可视区域内的元素**，而不是全部DOM节点。10万条数据只渲染二三十个DOM。

```text
全量渲染：  100,000 个 DOM → 页面卡死
虚拟列表：  100,000 条数据 → 只渲染 ~30 个 DOM → 流畅滚动
```

**虚拟列表原理：**

```text
┌─────────────────────────────┐
│  容器（overflow: auto）       │  ← 固定高度
│  ┌───────────────────────┐  │
│  │ 可见区域（Viewport）    │  │  ← 实际渲染的元素
│  │  Item 5               │  │
│  │  Item 6               │  │
│  │  Item 7               │  │
│  │  Item 8               │  │
│  │  Item 9               │  │
│  └───────────────────────┘  │
│                             │
│  上下各有缓冲区（Buffer）     │  ← 多渲染几个元素防闪烁
└─────────────────────────────┘
总高度 = itemHeight × totalCount  ← 撑开滚动条
```

**核心实现：**

```js
function VirtualList({ items, itemHeight = 40, containerHeight = 600, overscan = 3 }) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const totalHeight = items.length * itemHeight
  
  // 计算可见范围
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  )
  
  // 只渲染可见项
  const visibleItems = items.slice(startIndex, endIndex + 1)
  
  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={e => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, i) => {
          const index = startIndex + i
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: index * itemHeight,
                height: itemHeight,
                width: '100%',
              }}
            >
              {item.content}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**常见库对比：**

| 库 | 特点 | 适用场景 |
|------|------|---------|
| react-window | 轻量(6KB)、高性能 | 固定高度列表 |
| react-virtualized | 功能丰富(40KB) | 复杂布局、表格 |
| @tanstack/virtual | 框架无关 | React/Vue/Svelte |
| vue-virtual-scroller | Vue生态 | Vue项目 |

**进阶优化：**

```text
1. 动态高度：缓存已测量的高度，未测量的用预估高度
2. 无限滚动：滚动到底部触发加载更多
3. 滚动锚定：插入新数据时保持滚动位置不变
4. 惰性渲染：结合Intersection Observer
```

**知识点：** `虚拟列表` `长列表优化` `react-window` `DOM优化` `滚动性能`

:::

### Q20: 图片懒加载实现

> **⭐ 简单 · browser/performance**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**使用 Intersection Observer：**
```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});
```

**知识点：**`图片懒加载` `Intersection Observer`

:::

### Q21: 性能预算（Performance Budget）如何制定？

> **🔥 中等 · 浏览器**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

性能预算是为关键指标设定的量化目标，超出预算时构建失败或发出警告。

**制定原则：BASELINE + 渐进提升**

```text
1. 测量当前基线（取P75值）
2. 参考竞品和行业标准
3. 设定合理目标（不能太高也不能太低）
4. 集成到CI/CD，超预算则构建失败
```

**性能预算模板：**

| 类别 | 指标 | 目标值 | 告警值 |
|------|------|--------|--------|
| 体验指标 | LCP | ≤2.5s | >4s |
| 体验指标 | INP | ≤200ms | >500ms |
| 体验指标 | CLS | ≤0.1 | >0.25 |
| 资源大小 | JS总大小 | ≤200KB(gzip) | >300KB |
| 资源大小 | CSS总大小 | ≤50KB(gzip) | >100KB |
| 资源大小 | 图片 | ≤500KB | >1MB |
| 加载指标 | TTFB | ≤800ms | >1.5s |
| 加载指标 | FCP | ≤1.8s | >3s |
| 构建产物 | 入口chunk | ≤100KB | >150KB |
| 构建产物 | 路由chunk | ≤50KB | >80KB |

**CI/CD 集成配置：**

```js
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: ['https://staging.example.com/'],
      runs: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-byte-weight': ['warn', { maxNumericValue: 1000000 }],
      },
    },
  },
}
```

```js
// webpack 性能预算
module.exports = {
  performance: {
    maxEntrypointSize: 100 * 1024,   // 入口100KB
    maxAssetSize: 50 * 1024,          // 单文件50KB
    hints: 'error',                    // 超预算报错
  },
}
```

**知识点：** `性能预算` `Lighthouse CI` `webpack性能` `Web Vitals` `CI/CD`

:::
### Q22: RAIL 性能模型是什么？

> **🔥 中等 · 性能优化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**RAIL** 是 Google 提出的以用户为中心的性能模型：

| 阶段 | 目标 | 用户感知 |
|------|------|---------|
| **R**esponse（响应） | < 100ms | 点击后立即有反馈 |
| **A**nimation（动画） | < 16.6ms/帧（60fps） | 动画流畅无卡顿 |
| **I**dle（空闲） | < 50ms | 后台任务不阻塞交互 |
| **L**oad（加载） | < 5s | 首屏内容可交互 |

```text
用户操作 → RAIL指标 → 优化手段
├── 点击按钮  → Response 100ms → 事件处理优化/Web Worker
├── 滚动页面  → Animation 16ms → CSS transform/requestAnimationFrame
├── 空闲时间  → Idle 50ms      → requestIdleCallback/代码分割
└── 首次访问  → Load 5s        → SSR/CDN/懒加载/代码分割
```

```js
// Response: 100ms 内响应用户输入
button.addEventListener('click', (e) => {
  // 轻量操作立即执行
  updateUI(e)
  // 重量操作延迟处理
  requestIdleCallback(() => heavyCalculation())
})

// Animation: 使用 rAF 而非 setTimeout
function animate() {
  updatePosition()
  requestAnimationFrame(animate)  // 16.6ms 一帧
}
requestAnimationFrame(animate)

// Idle: 利用空闲时间
requestIdleCallback((deadline) => {
  while (deadline.timeRemaining() > 0 && tasks.length) {
    doTask(tasks.pop())
  }
})
```

**知识点：** `RAIL` `性能模型` `100ms` `60fps` `requestAnimationFrame` `requestIdleCallback`

:::

### Q23: 如何避免回流（Reflow）和重绘（Repaint）？

> **🔥 中等 · 性能优化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**回流 vs 重绘：**

| 操作 | 回流（Reflow） | 重绘（Repaint） |
|------|---------------|----------------|
| 改变几何属性（width/height/margin/padding） | ✅ 触发 | ✅ 触发 |
| 改变外观属性（color/background/visibility） | ❌ 不触发 | ✅ 触发 |
| 性能开销 | 大（重新计算布局） | 小（只更新像素） |

**触发回流的操作：**

```js
// 这些操作都会触发回流！
element.style.width = '100px'     // 修改几何属性
element.offsetHeight              // 读取布局属性（强制同步布局）
element.offsetTop                 // 读取布局属性
element.getBoundingClientRect()   // 读取布局属性
element.appendChild(child)        // DOM变更
element.className = 'new-class'   // 改变类名可能改变布局
```

**优化策略：**

```js
// ❌ 批量修改 — 每次都触发回流
element.style.width = '100px'
element.style.height = '200px'
element.style.margin = '10px'
// 3次回流！

// ✅ 1. 使用 cssText 批量修改
element.style.cssText = 'width:100px;height:200px;margin:10px'

// ✅ 2. 切换 class
element.className = 'new-style'  // 只1次回流

// ✅ 3. 离线DOM — DocumentFragment
const fragment = document.createDocumentFragment()
for (let i = 0; i < 100; i++) {
  fragment.appendChild(document.createElement('div'))
}
container.appendChild(fragment)  // 只1次回流

// ✅ 4. 缓存布局值 — 避免读写交替
const width = element.offsetWidth  // 先读
element.style.width = width + 10 + 'px'  // 后写
// 不要在循环中反复读写交替

// ✅ 5. 使用 transform 替代 top/left 做动画
element.style.transform = 'translateX(100px)'  // 不触发回流！
// 而不是 element.style.left = '100px'  // 触发回流

// ✅ 6. 使用 will-change 提示浏览器
element.style.willChange = 'transform'  // 浏览器优化
element.style.transform = 'translateX(100px)'
element.style.willChange = 'auto'  // 动画结束后移除
```

**知识点：** `回流` `重绘` `性能优化` `transform` `DocumentFragment` `cssText` `will-change`

:::

### Q24: setTimeout 为什么会导致内存泄漏？

> **🔥 中等 · browser/performance**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**setTimeout 导致内存泄漏的主要原因：闭包持有引用、未清除定时器、DOM 引用未释放。**

---

## 一、常见泄漏场景

**1. 组件卸载未清除定时器**

```javascript
// React 类组件
class MyComponent extends React.Component {
  componentDidMount() {
    // ❌ 定时器持有 this 引用
    this.timer = setInterval(() => {
      this.updateData()  // 引用组件实例
    }, 1000)
  }
  
  // ❌ 没有 componentWillUnmount 清理
  // 组件卸载后定时器仍在运行，this 无法被 GC
}

// ✅ 正确做法
componentWillUnmount() {
  clearInterval(this.timer)
  this.timer = null
}
```

**2. 闭包持有 DOM 引用**

```javascript
function setupTimer() {
  const element = document.getElementById('large-content')
  // ❌ 定时器回调持有 element 引用
  setInterval(() => {
    console.log(element.innerHTML)  // element 无法释放
  }, 1000)
}

// element 被闭包捕获，即使 DOM 被移除也无法 GC
```

**3. 频繁创建不清理**

```javascript
// ❌ 多次调用 setupTimer 创建多个定时器
function setupTimer() {
  setInterval(() => {
    doSomething()
  }, 1000)
}

// 调用 10 次 → 10 个定时器同时运行
// 应该先 clear 再创建
```

**4. 异步回调中的泄漏**

```javascript
async function fetchData() {
  // ❌ 组件卸载后 callback 仍会执行
  setTimeout(async () => {
    const data = await api.getData()
    setState(data)  // 组件已卸载，可能报错
  }, 5000)
}

// ✅ 使用 isMounted 标记
let isMounted = true
setTimeout(async () => {
  if (isMounted) {
    const data = await api.getData()
    setState(data)
  }
}, 5000)
```

---

## 二、泄漏原理分析

**闭包持有引用链：**

```text
定时器 → 回调函数 → 闭包变量 → DOM/组件实例 → 无法 GC

垃圾回收器（GC）判断对象是否可回收：
- 从全局对象（window）开始遍历引用链
- 能到达的对象都保留
- 定时器是全局的 → 回调可达 → 闭包变量可达 → DOM 可达

即使 DOM 从页面移除：
- innerHTML 仍可通过闭包访问
- GC 不会回收
```

**内存增长示意图：**

```text
时间 →
内存占用
  ↑
  │   ╱
  │  ╱
  │ ╱每个周期的对象都没释放
  │╱
  └──────────→
```

---

## 三、修复方案

**1. 统一清理模式**

```javascript
// React Hooks
useEffect(() => {
  const timer = setInterval(() => {
    updateData()
  }, 1000)
  
  // 清理函数
  return () => {
    clearInterval(timer)
  }
}, [])

// Vue 3
onMounted(() => {
  timer.value = setInterval(updateData, 1000)
})

onUnmounted(() => {
  clearInterval(timer.value)
})
```

**2. 避免闭包持有 DOM**

```javascript
// ❌ 持有 DOM 引用
function leakyTimer() {
  const el = document.getElementById('app')
  setInterval(() => {
    el.style.color = 'red'
  }, 1000)
}

// ✅ 使用选择器查询
function safeTimer() {
  setInterval(() => {
    const el = document.getElementById('app')
    if (el) el.style.color = 'red'
  }, 1000)
}
```

**3. 使用 WeakRef（现代浏览器）**

```javascript
const weakEl = new WeakRef(document.getElementById('app'))

setInterval(() => {
  const el = weakEl.deref()
  if (el) {
    el.style.color = 'red'
  }
}, 1000)

// WeakRef 不影响 GC，DOM 移除后可以回收
```

**4. AbortController 取消异步任务**

```javascript
const controller = new AbortController()

setTimeout(async () => {
  try {
    const res = await fetch('/api/data', {
      signal: controller.signal
    })
    const data = await res.json()
    setState(data)
  } catch (e) {
    if (e.name === 'AbortError') return
    console.error(e)
  }
}, 1000)

// 清理时取消
return () => {
  controller.abort()
}
```

---

## 四、检测内存泄漏

**Chrome DevTools Memory 面板：**

```text
1. 打开 DevTools → Memory
2. 选择 Heap Snapshot
3. 点击 Take snapshot
4. 执行可能泄漏的操作（如切换组件）
5. 再次 Take snapshot
6. 对比两个快照
   - 按 Constructor 排序
   - 查看 Detached DOM tree
   - 查找增长的对象
```

**Performance Monitor 实时监控：**

```javascript
// 监听 DOM 节点数
let prevCount = document.getElementsByTagName('*').length

setInterval(() => {
  const count = document.getElementsByTagName('*').length
  if (count > prevCount + 100) {
    console.warn('DOM nodes growing:', count)
  }
  prevCount = count
}, 5000)
```

**知识点：** `setTimeout` `内存泄漏` `闭包` `定时器清理` `GC` `WeakRef`

:::

### Q25: 如何实时监控内存泄漏？

> **💀 困难 · browser/performance**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**实时监控内存泄漏需要结合 Performance Observer、内存 API、自定义指标采样和阈值告警。**

---

## 一、浏览器内存 API

**1. performance.memory（Chrome 专用）**

```javascript
if ('memory' in performance) {
  setInterval(() => {
    const { usedJSHeapSize, totalJSHeapSize, jsHeapSizeLimit } = performance.memory
    
    const usagePercent = (usedJSHeapSize / jsHeapSizeLimit) * 100
    
    console.log('内存使用:', {
      used: (usedJSHeapSize / 1048576).toFixed(2) + 'MB',
      total: (totalJSHeapSize / 1048576).toFixed(2) + 'MB',
      limit: (jsHeapSizeLimit / 1048576).toFixed(2) + 'MB',
      usage: usagePercent.toFixed(1) + '%'
    })
    
    // 阈值告警
    if (usagePercent > 80) {
      reportMemoryWarning('high-usage', usagePercent)
    }
  }, 5000)
}
```

**注意：** `performance.memory` 仅在 Chrome/Edge 可用，需要 `userTiming` 标志。

**2. Performance Observer（标准 API）**

```javascript
// 监控 GC 相关的性能标记
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name.includes('gc')) {
      console.log('GC 事件:', entry)
    }
  }
})

observer.observe({ entryTypes: ['measure', 'mark'] })
```

---

## 二、自定义内存监控方案

**1. 采样监控**

```javascript
class MemoryMonitor {
  constructor(options = {}) {
    this.interval = options.interval || 5000
    this.threshold = options.threshold || 0.8  // 80%
    this.samples = []
    this.leakDetected = false
  }
  
  start() {
    this.pid = setInterval(() => this.sample(), this.interval)
  }
  
  stop() {
    clearInterval(this.pid)
  }
  
  sample() {
    const sample = {
      timestamp: Date.now(),
      jsHeapSize: performance.memory?.usedJSHeapSize || 0,
      domNodes: document.getElementsByTagName('*').length,
      listeners: this.countEventListeners(),
      detachedTrees: this.findDetachedTrees()
    }
    
    this.samples.push(sample)
    
    // 保留最近 100 个样本
    if (this.samples.length > 100) {
      this.samples.shift()
    }
    
    // 检测趋势
    this.detectLeakTrend()
  }
  
  countEventListeners() {
    // 通过 getEventListeners（DevTools API）不支持生产
    // 可以用 WeakMap 跟踪自定义监听器
    return window.__listenerCount || 0
  }
  
  findDetachedTrees() {
    // 检测脱离 DOM 树的节点
    // 需要配合 WeakRef 实现
    return window.__detachedCount || 0
  }
  
  detectLeakTrend() {
    if (this.samples.length < 10) return
    
    // 取最近 10 个样本的平均增长率
    const recent = this.samples.slice(-10)
    const first = recent[0].jsHeapSize
    const last = recent[recent.length - 1].jsHeapSize
    const growthRate = (last - first) / first
    
    // 如果持续增长且超过阈值
    if (growthRate > 0.05) {  // 5% 增长
      this.leakDetected = true
      this.report('memory-leak', {
        growthRate: (growthRate * 100).toFixed(2) + '%',
        heapSize: (last / 1048576).toFixed(2) + 'MB'
      })
    }
  }
  
  report(type, data) {
    // 发送到监控平台
    console.warn('内存泄漏警告:', type, data)
    // sendToSentry(type, data)
  }
}

// 使用
const monitor = new MemoryMonitor({ interval: 5000, threshold: 0.8 })
monitor.start()
```

**2. 堆快照自动化**

```javascript
// 使用 puppeteer 自动化采集堆快照（Node 环境）
const puppeteer = require('puppeteer')

async function captureHeapSnapshot(url) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  
  await page.goto(url)
  
  // 采集堆快照
  const session = await page.target().createCDPSession()
  await session.send('HeapProfiler.enable')
  
  // 快照 1
  await session.send('HeapProfiler.takeHeapSnapshot')
  const snapshot1 = await captureStream(session)
  
  // 执行操作
  await page.click('#load-data')
  await page.waitForTimeout(2000)
  
  // 快照 2
  const snapshot2 = await captureStream(session)
  
  // 对比分析
  const diff = compareSnapshots(snapshot1, snapshot2)
  console.log('增长的对象:', diff.growth)
  
  await browser.close()
}
```

---

## 三、关键检测指标

| 指标 | 检测方式 | 泄漏信号 |
|------|---------|---------|
| JS 堆内存 | `performance.memory` | 持续增长不下降 |
| DOM 节点数 | `document.getElementsByTagName('*')` | 只增不减 |
| 事件监听器 | 自跟踪计数 | 组件卸载后未减少 |
| 脱离 DOM 树 | DevTools / WeakRef | Detached DOM tree 增长 |
| Timer 数量 | 自跟踪计数 | setInterval 累积 |

**综合检测函数：**

```javascript
function getMemoryMetrics() {
  const metrics = {
    timestamp: Date.now(),
    
    // JS 堆
    jsHeapUsed: performance.memory?.usedJSHeapSize,
    jsHeapTotal: performance.memory?.totalJSHeapSize,
    
    // DOM
    domNodeCount: document.getElementsByTagName('*').length,
    imageCount: document.images.length,
    
    // 定时器（需要自己跟踪）
    intervalCount: window.__intervalCount || 0,
    timeoutCount: window.__timeoutCount || 0,
    
    // 性能
    fps: getFPS()
  }
  
  return metrics
}

function getFPS() {
  let frames = 0
  let lastTime = performance.now()
  let fps = 60
  
  function loop(now) {
    frames++
    const delta = now - lastTime
    if (delta >= 1000) {
      fps = frames
      frames = 0
      lastTime = now
    }
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
  
  return fps
}
```

---

## 四、告警策略

```javascript
// 配置阈值
const THRESHOLDS = {
  heapUsage: 0.8,        // 80% 使用率告警
  growthRate: 0.05,      // 5% 增长率告警
  domNodeMax: 10000,     // 最多 10000 节点
  fpsMin: 30            // 最低 30fps
}

// 实时告警
setInterval(() => {
  const metrics = getMemoryMetrics()
  
  // 检查各项指标
  if (metrics.jsHeapUsed / metrics.jsHeapTotal > THRESHOLDS.heapUsage) {
    alert('内存使用率过高！')
  }
  
  if (metrics.domNodeCount > THRESHOLDS.domNodeMax) {
    alert('DOM 节点过多！')
  }
  
  if (metrics.fps < THRESHOLDS.fpsMin) {
    alert('帧率过低！')
  }
}, 5000)
```

**知识点：** `内存监控` `Performance Observer` `performance.memory` `堆快照` `阈值告警` `GC`

:::
