---
title: 监控与埋点
description: 前端性能监控、错误采集、用户行为追踪面试题
---

# 监控与埋点

## 面试题

### Q1: 前端监控体系包含哪些方面？

> **⭐ 简单 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

三大监控：

| 类型 | 目标 | 关键指标 |
|------|------|----------|
| 性能监控 | 页面加载/运行时性能 | FCP/LCP/CLS/FID/TTFB |
| 错误监控 | 运行时异常 | JS 异常/资源异常/API 异常 |
| 业务监控 | 用户行为/业务指标 | PV/UV/点击率/转化率 |

```js
// 监控 SDK 基础架构
class Monitor {
  constructor(options) {
    this.appId = options.appId
    this.reportUrl = options.reportUrl
    this.initPerformance()  // 性能监控
    this.initError()        // 错误监控
    this.initBehavior()     // 行为监控
  }

  report(data) {
    // 批量上报 + sendBeacon
  }
}
```

**知识点：** `前端监控` `性能监控` `错误监控` `业务监控`

:::

### Q2: 如何采集 Web Vitals 性能指标？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 使用 web-vitals 库
import { onLCP, onFID, onCLS, onTTFB, onINP } from 'web-vitals'

onLCP(metric => report(metric))   // Largest Contentful Paint
onFID(metric => report(metric))   // First Input Delay
onCLS(metric => report(metric))   // Cumulative Layout Shift
onTTFB(metric => report(metric))  // Time to First Byte
onINP(metric => report(metric))   // Interaction to Next Paint
```

**核心指标阈值：**

| 指标 | 好 | 需改进 | 差 |
|------|------|--------|-----|
| LCP | ≤2.5s | ≤4s | >4s |
| FID | ≤100ms | ≤300ms | >300ms |
| CLS | ≤0.1 | ≤0.25 | >0.25 |

**知识点：** `Web Vitals` `LCP` `CLS` `FID` `PerformanceObserver`

:::

### Q3: 前端错误采集有哪些类型？如何捕获？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**5 种错误类型及捕获方式：**

| 错误类型 | 捕获方式 | 示例 |
|---------|----------|------|
| JS 运行时异常 | window.onerror / addEventListener('error') | TypeError, ReferenceError |
| Promise 异常 | addEventListener('unhandledrejection') | .then 未 catch |
| 资源加载异常 | addEventListener('error', true) 捕获阶段 | img/script 404 |
| API 请求异常 | 拦截 fetch/XHR | 500/超时/网络断开 |
| React 错误边界 | ErrorBoundary 组件 | 渲染异常 |

```js
// 完整错误采集
// 1. JS 运行时异常
window.onerror = (msg, url, line, col, error) => {
  report({ type: 'js', msg, stack: error?.stack, url, line, col })
  return false
}

// 2. Promise 异常
window.addEventListener('unhandledrejection', (e) => {
  report({ type: 'promise', reason: e.reason?.message || e.reason })
})

// 3. 资源加载异常（需要捕获阶段）
window.addEventListener('error', (e) => {
  if (e.target !== window) {
    report({
      type: 'resource',
      tag: e.target.tagName,
      src: e.target.src || e.target.href
    })
  }
}, true)

// 4. API 请求异常 - 拦截 fetch
const originFetch = window.fetch
window.fetch = async (...args) => {
  const res = await originFetch(...args)
  if (!res.ok) report({ type: 'api', url: args[0], status: res.status })
  return res
}
```

**知识点：** `错误采集` `onerror` `unhandledrejection` `ErrorBoundary` `资源异常`

:::

### Q4: 用户行为追踪（PV/UV）如何实现？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**PV（Page View）采集：**

```js
// SPA 路由切换监听
const trackPageView = () => {
  report({
    type: 'pv',
    url: location.href,
    referrer: document.referrer,
    title: document.title,
    timestamp: Date.now()
  })
}

// 监听 history 路由
const originPushState = history.pushState
history.pushState = function(...args) {
  originPushState.apply(this, args)
  trackPageView()
}

// 监听 hash 路由
window.addEventListener('hashchange', trackPageView)
```

**UV 识别方案：**

```js
// 方案 1: localStorage + 过期时间
const getUV = () => {
  const key = 'monitor_uv'
  const uv = localStorage.getItem(key)
  const now = Date.now()
  if (!uv || now - Number(uv) > 86400000) { // 过期重新计数
    localStorage.setItem(key, String(now))
    return true // 新 UV
  }
  return false // 已有 UV
}
```

**知识点：** `PV` `UV` `行为追踪` `路由监听` `声明式埋点`

:::

### Q5: 数据上报策略有哪些？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 方式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| sendBeacon | 页面卸载也能发送 | 数据大小限制 (64KB) | 优先推荐 |
| Image 1x1 GIF | 兼容好，无跨域 | GET 限制长度 | 简单上报 |
| fetch | 灵活，POST 无限制 | 页面卸载可能丢 | 大数据量 |
| XMLHttpRequest | 兼容最好 | 代码复杂 | 旧浏览器 |

```js
class Reporter {
  constructor(url) {
    this.url = url
    this.queue = []
    this.timer = null
  }

  // 核心上报方法
  report(data) {
    this.queue.push({ ...data, timestamp: Date.now() })
    // 批量上报：满 10 条或 5 秒后上报
    if (this.queue.length >= 10) this.flush()
    else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), 5000)
    }
  }

  flush() {
    if (!this.queue.length) return
    const data = this.queue.splice(0)

    // 优先 sendBeacon
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.url, JSON.stringify(data))
    } else {
      // 降级 Image
      new Image().src = `${this.url}?data=${encodeURIComponent(JSON.stringify(data))}`
    }

    clearTimeout(this.timer)
    this.timer = null
  }
}

// 页面卸载前上报
window.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') this.flush()
})
```

**知识点：** `数据上报` `sendBeacon` `批量上报` `页面卸载`

:::

### Q6: Sentry 如何接入和配置？

> **⭐ 简单 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 1. 安装
// npm install @sentry/react @sentry/tracing

// 2. 初始化
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://xxx@sentry.io/project',
  environment: process.env.NODE_ENV,
  release: process.env.REACT_APP_VERSION,
  tracesSampleRate: 0.1, // 性能采样率 10%
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()  // Session Replay
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // 过滤无关错误
  ignoreErrors: ['ResizeObserver loop', 'Network request failed'],
  // 添加用户信息
  initialScope: {
    user: { id: userId, email: userEmail }
  }
})

// 3. 手动上报
Sentry.captureException(new Error('手动上报错误'))
Sentry.captureMessage('重要事件', 'warning')

// 4. 添加面包屑
Sentry.addBreadcrumb({ category: 'click', message: '点击提交按钮' })
```

**核心功能：** 错误捕获、性能监控、Session Replay（回放用户操作）、Source Map 反解。

**知识点：** `Sentry` `错误监控` `性能监控` `SourceMap`

:::

### Q7: 自定义埋点方案如何设计？

> **💀 困难 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**两种埋点方式：**

**1. 声明式埋点（代码侵入少）：**

```html
<button data-track="click_submit" data-track-params='{"id":123}'>提交</button>
```

```js
// 全局自动采集
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-track]')
  if (el) track(el.dataset.track, JSON.parse(el.dataset.trackParams || '{}'))
})
```

**2. 命令式埋点（灵活精确）：**

```js
import { track } from '@/monitor'

track('click_submit', { productId: 123, source: 'home' })
track('page_view', { page: 'product_detail', id: 456 })
track('api_error', { api: '/api/order', status: 500 })
```

**知识点：** `埋点方案` `声明式埋点` `命令式埋点` `自动埋点` `SDK 设计`

:::

### Q8: 监控报警与降级策略如何设计？

> **💀 困难 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**报警规则设计：**

| 指标 | 告警阈值 | 级别 |
|------|----------|------|
| JS 错误率 | > 1% | P0 |
| API 失败率 | > 5% | P0 |
| LCP | > 4s | P1 |
| 白屏时间 | > 3s | P1 |
| 内存泄漏 | 持续增长 | P2 |

**降级策略：**

```js
// 1. 功能降级
const featureFlags = {
  newDashboard: true,
  aiRecommend: true
}

async function loadFeature(flag, loader) {
  try {
    if (!featureFlags[flag]) return null
    return await loader()
  } catch (e) {
    featureFlags[flag] = false  // 关闭出问题的功能
    report({ type: 'fallback', flag, error: e.message })
    return null  // 降级
  }
}

// 2. 接口降级
async function fetchWithFallback(url, fallbackUrl) {
  try {
    return await fetch(url).then(r => r.json())
  } catch {
    return fetch(fallbackUrl).then(r => r.json())  // 降级到备用接口
  }
}

// 3. 缓存降级
async function getData(key) {
  try {
    const res = await fetch('/api/data')
    localStorage.setItem(key, JSON.stringify(res))
    return res
  } catch {
    return JSON.parse(localStorage.getItem(key))  // 降级到本地缓存
  }
}
```

**报警通道：** 钉钉/飞书机器人 → 企业微信 → 电话（按级别升级）

**知识点：** `监控报警` `降级策略` `Feature Flag` `缓存降级` `熔断`

:::

### Q9: 前端错误监控的实现方案？（window.onerror、unhandledrejection、try-catch、资源加载错误）

> **🔥 中等 · engineering/monitoring**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**前端错误监控方案：5 种错误类型捕获**

**1. JS 运行时异常（window.onerror）**

```javascript
// 方案 1：window.onerror
window.onerror = function(message, source, lineno, colno, error) {
  reportError({
    type: 'js-error',
    message: message,
    filename: source,
    line: lineno,
    column: colno,
    stack: error?.stack,
    userAgent: navigator.userAgent,
    url: location.href
  });
  return false;
};

// 方案 2：addEventListener('error')
window.addEventListener('error', (event) => {
  reportError({
    type: 'js-error',
    message: event.message,
    filename: event.filename,
    line: event.lineno,
    column: event.colno,
    stack: event.error?.stack
  });
}, true);
```

**2. Promise 异常（unhandledrejection）**

```javascript
window.addEventListener('unhandledrejection', (event) => {
  reportError({
    type: 'promise-error',
    reason: event.reason?.message || event.reason || 'Unknown Promise rejection',
    stack: event.reason?.stack,
    promise: event.promise
  });
});
```

**3. try-catch 包裹（主动捕获）**

```javascript
// 包裹关键代码
try {
  riskyOperation();
} catch (error) {
  reportError({
    type: 'caught-error',
    message: error.message,
    stack: error.stack,
    context: { operation: 'riskyOperation' }
  });
}

// 包裹异步函数
async function safeAsync() {
  try {
    await api.call();
  } catch (error) {
    reportError({
      type: 'async-error',
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
}

// Vue 全局错误处理
app.config.errorHandler = (error, instance, info) => {
  reportError({
    type: 'vue-error',
    message: error.message,
    stack: error.stack,
    info: info,
    component: instance?.$options.name
  });
};

// React ErrorBoundary
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    reportError({
      type: 'react-error',
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }
  
  render() {
    return this.state.hasError ? <Fallback /> : this.props.children;
  }
}
```

**4. 资源加载错误（img/script/css）**

```javascript
// 需要在捕获阶段监听
window.addEventListener('error', (event) => {
  if (event.target !== window) {
    reportError({
      type: 'resource-error',
      tag: event.target.tagName,
      src: event.target.src || event.target.href || event.target.currentSrc,
      message: `Failed to load ${event.target.tagName} resource`
    });
  }
}, true);
```

**5. fetch/XHR 错误监控**

```javascript
// 拦截 fetch
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  try {
    const response = await originalFetch(...args);
    if (!response.ok) {
      reportError({
        type: 'api-error',
        url: args[0],
        status: response.status,
        statusText: response.statusText,
        method: args[1]?.method || 'GET'
      });
    }
    return response;
  } catch (error) {
    reportError({
      type: 'fetch-error',
      url: args[0],
      message: error.message
    });
    throw error;
  }
};
```

**知识点：** `错误监控` `window.onerror` `unhandledrejection` `资源错误` `try-catch` `ErrorBoundary`

:::

### Q10: 性能监控指标采集方案？（Performance API、Web Vitals、自定义指标）

> **🔥 中等 · engineering/monitoring**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. 使用 web-vitals 库**

```javascript
import { onLCP, onFID, onCLS, onTTFB, onINP } from 'web-vitals';

onLCP(metric => reportMetric('LCP', metric));
onFID(metric => reportMetric('FID', metric));
onCLS(metric => reportMetric('CLS', metric));
onTTFB(metric => reportMetric('TTFB', metric));
onINP(metric => reportMetric('INP', metric));

function reportMetric(name, metric) {
  if (metric.rating !== 'good') {
    navigator.sendBeacon('/api/metrics', JSON.stringify({
      metric: name,
      value: metric.value,
      rating: metric.rating,
      url: location.href
    }));
  }
}
```

**2. PerformanceObserver 原生采集**

```javascript
// LCP 采集
new PerformanceObserver((entryList) => {
  const entries = entryList.getEntries();
  const lastEntry = entries[entries.length - 1];
  reportMetric('LCP', { value: lastEntry.startTime });
}).observe({ type: 'largest-contentful-paint', buffered: true });

// CLS 采集
let clsValue = 0;
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    if (!entry.hadRecentInput) clsValue += entry.value;
  }
  reportMetric('CLS', { value: clsValue });
}).observe({ type: 'layout-shift', buffered: true });

// 长任务采集
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    if (entry.duration > 50) {
      reportMetric('LongTask', { duration: entry.duration });
    }
  }
}).observe({ type: 'longtask', buffered: true });
```

**3. Navigation Timing API**

```javascript
function getNavigationTiming() {
  const navigation = performance.getEntriesByType('navigation')[0];
  
  return {
    dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcpConnect: navigation.connectEnd - navigation.connectStart,
    ttfb: navigation.responseStart - navigation.requestStart,
    domReady: navigation.domContentLoadedEventEnd - navigation.fetchStart,
    loadComplete: navigation.loadEventEnd - navigation.fetchStart
  };
}
```

**4. 自定义指标**

```javascript
// 首屏渲染时间
const firstScreenObserver = new MutationObserver((mutations, observer) => {
  const firstScreenEl = document.querySelector('#first-screen');
  if (firstScreenEl && isVisible(firstScreenEl)) {
    reportMetric('FirstScreen', { value: performance.now() });
    observer.disconnect();
  }
});
firstScreenObserver.observe(document.body, { childList: true, subtree: true });

function isVisible(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

// 白屏时间
const whiteScreenStart = performance.now();
window.addEventListener('load', () => {
  reportMetric('WhiteScreen', { value: performance.now() - whiteScreenStart });
});
```

**知识点：** `性能监控` `Web Vitals` `LCP` `CLS` `FID` `PerformanceObserver` `Navigation Timing`

:::

### Q11: 前端监控的上报策略？（批量上报、Beacon API、sendBeacon、requestIdleCallback）

> **💀 困难 · engineering/monitoring**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. sendBeacon（推荐）**

```javascript
function report(data) {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/monitor', blob);
  } else {
    fallbackReport(data);
  }
}
```

**2. 批量上报（Batch Report）**

```javascript
class BatchReporter {
  constructor(options = {}) {
    this.url = options.url;
    this.maxSize = options.maxSize || 10;
    this.maxWait = options.maxWait || 5000;
    this.queue = [];
    this.timer = null;
  }
  
  report(data) {
    this.queue.push({
      ...data,
      timestamp: Date.now(),
      url: location.href,
      ua: navigator.userAgent
    });
    
    if (this.queue.length >= this.maxSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.maxWait);
    }
  }
  
  flush() {
    if (this.queue.length === 0) return;
    
    const data = this.queue.splice(0);
    clearTimeout(this.timer);
    this.timer = null;
    
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      navigator.sendBeacon(this.url, blob);
    } else {
      this.sendWithImage(data);
    }
  }
  
  sendWithImage(data) {
    const img = new Image();
    img.src = `${this.url}?data=${encodeURIComponent(JSON.stringify(data))}`;
  }
}
```

**3. requestIdleCallback 上报**

```javascript
function idleReport(data) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      sendBeaconReport(data);
    }, { timeout: 2000 });
  } else {
    setTimeout(() => sendBeaconReport(data), 1000);
  }
}
```

**4. 页面卸载前上报**

```javascript
// visibilitychange
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && queue.length > 0) {
    flush();
  }
});

// pagehide
window.addEventListener('pagehide', () => {
  if (queue.length > 0) flush();
});
```

**5. 错误上报重试策略**

```javascript
async function reportWithRetry(data, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const success = navigator.sendBeacon('/api/error', JSON.stringify(data));
      if (success) return;
    } catch (e) {}
    await sleep(Math.pow(2, i) * 1000);
  }
  storeInLocalStorage(data); // 失败存入 localStorage
}

function storeInLocalStorage(data) {
  const key = 'pending_errors';
  const pending = JSON.parse(localStorage.getItem(key) || '[]');
  pending.push(data);
  if (pending.length > 50) pending.shift();
  localStorage.setItem(key, JSON.stringify(pending));
}

// 页面加载时检查待上报的错误
window.addEventListener('load', () => {
  const pending = JSON.parse(localStorage.getItem('pending_errors') || '[]');
  if (pending.length > 0) {
    localStorage.removeItem('pending_errors');
    setTimeout(() => {
      navigator.sendBeacon('/api/error', JSON.stringify(pending));
    }, 5000);
  }
});
```

**6. 采样上报**

```javascript
const sampleRates = {
  'js-error': 1.0,       // JS 错误全量上报
  'api-error': 0.1,      // API 错误 10% 采样
  'performance': 0.01,   // 性能指标 1% 采样
  'click': 0.001         // 点击埋点 0.1% 采样
};

function report(type, data) {
  const rate = sampleRates[type] || 0.1;
  if (Math.random() > rate) return;
  sendBeaconReport({ type, ...data });
}
```

**上报方案对比：**

| 方案 | 可靠性 | 性能影响 | 数据量 | 推荐场景 |
|------|--------|---------|--------|---------|
| sendBeacon | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 中 | 错误/性能上报 |
| 批量上报 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 少 | 所有监控 |
| requestIdleCallback | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 少 | 非关键指标 |
| 图片上报 | ⭐⭐ | ⭐⭐⭐ | 少 | 降级方案 |

**知识点：** `监控上报` `sendBeacon` `批量上报` `requestIdleCallback` `采样策略` `重试机制`

:::