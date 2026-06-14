---
title: 语义化标签面试题
description: HTML 语义化标签与无障碍访问，涵盖 header/nav/main/article 等 14 道经典 HTML 面试题
---

# 语义化标签与 HTML 基础面试题

> **📚 共 14 题 · 简单 30% · 中等 50% · 困难 20%**

---

### Q1: HTML5 语义化标签有哪些？它们的含义和使用场景是什么？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**常用语义化标签：**

| 标签 | 含义 | 使用场景 |
|------|------|----------|
| `<header>` | 页面/区域头部 | 页眉、导航 |
| `<nav>` | 导航链接集合 | 主导航、侧边导航 |
| `<main>` | 主要内容区域 | 每页一个，核心内容 |
| `<article>` | 独立内容块 | 博客文章、新闻 |
| `<section>` | 内容区块 | 章节、分组 |
| `<aside>` | 侧边栏 | 相关引用、广告 |
| `<footer>` | 页面/区域底部 | 版权信息、页脚链接 |

**示例结构：**

```html
<body>
  <header>
    <nav>
      <ul>
        <li><a href="/">首页</a></li>
        <li><a href="/about">关于</a></li>
      </ul>
    </nav>
  </header>

  <main>
    <article>
      <header>
        <h1>文章标题</h1>
        <time datetime="2024-01-01">2024-01-01</time>
      </header>
      
      <section>
        <h2>第一章节</h2>
        <p>内容...</p>
      </section>
      
      <aside>
        <h3>相关文章</h3>
        <ul>...</ul>
      </aside>
    </article>
  </main>

  <footer>
    <p>© 2024 公司名称</p>
  </footer>
</body>
```

**语义化的好处：**

1. **SEO 友好**：搜索引擎更好理解内容
2. **可访问性**：屏幕阅读器更好导航
3. **代码可读性**：开发者更容易理解结构

**知识点：** `HTML5` `语义化` `无障碍`

:::

---

### Q2: 行内元素、块级元素和行内块元素有什么区别？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**三种类型对比：**

| 特性 | 块级元素 | 行内元素 | 行内块元素 |
|------|----------|----------|------------|
| 独占一行 | ✅ | ❌ | ❌ |
| 可设宽高 | ✅ | ❌ | ✅ |
| margin/padding | 所有方向 | 水平方向 | 所有方向 |
| 默认 display | block | inline | inline-block |

**块级元素：**

```html
<div>, <p>, <h1>-<h6>, <ul>, <ol>, <li>
<section>, <header>, <footer>, <nav>, <article>
```

**行内元素：**

```html
<span>, <a>, <strong>, <em>, <img>
<input>, <label>, <code>
```

**行内块元素：**

```html
<!-- 默认是 inline-block -->
<button>, <select>

<!-- display: inline-block -->
<style>
.inline-block { display: inline-block; }
</style>
```

**对比示例：**

```html
<!-- 块级：独占一行 -->
<div>块级 1</div>
<div>块级 2</div>

<!-- 行内：不独占一行 -->
<span>行内 1</span>
<span>行内 2</span>

<!-- 行内块：可调整大小的行内 -->
<span class="inline-block">可设宽高</span>
```

**知识点：** `块级元素` `行内元素` `display`

:::

---

### Q3: src 和 href 有什么区别？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心区别：**

| 特性 | src | href |
|------|-----|------|
| 含义 | Source(源) | Hyperlink Reference(超链接引用) |
| 作用 | 引入/嵌入资源 | 建立链接关系 |
| 阻塞渲染 | ✅ 会阻塞 | ❌ 不阻塞 (大多数情况) |
| 使用标签 | script, img, iframe | link, a |

**src 示例：**

```html
<!-- 脚本：下载并执行 -->
<script src="script.js"></script>

<!-- 图片：下载并显示 -->
<img src="image.jpg" alt="图片" />

<!-- iframe: 下载并嵌入 -->
<iframe src="https://example.com"></iframe>
```

**href 示例：**

```html
<!-- 样式表：下载并应用 -->
<link href="style.css" rel="stylesheet" />

<!-- 链接：点击跳转 -->
<a href="/about">关于页面</a>

<!-- 资源预加载 -->
<link rel="preload" href="font.woff2" as="font" />
```

**知识点：** `src` `href` `资源加载`

:::

---

### Q4: iframe 的优缺点是什么？有哪些应用场景？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**优点：**

1. **隔离性**：父页面和 iframe 内容独立
2. **跨域加载**：可以加载不同域名内容
3. **独立命名空间**：CSS/JS 不冲突
4. **逐步加载**：不阻塞父页面

**缺点：**

1. **SEO 不友好**：搜索引擎不优先索引 iframe 内容
2. **通信复杂**：跨域需要使用 postMessage
3. **加载性能**：额外 HTTP 请求
4. **移动端问题**：某些手机浏览器不支持
5. **安全性**：可能带来 XSS 风险

**应用场景：**

```html
<!-- 1. 第三方内容 -->
<iframe src="https://www.youtube.com/embed/videoId" frameborder="0">

<!-- 2. 广告横幅 -->
<iframe src="/ads/banner.html" width="728" height="90">

<!-- 3. 旧版系统嵌入 -->
<iframe src="/legacy/app.html" width="100%" height="500">

<!-- 4. 在线编辑器 -->
<iframe srcdoc="<p>Hello</p>" sandbox="allow-scripts">
```

**通信示例：**

```js
// 父页面发送消息
iframe.contentWindow.postMessage('Hello', 'https://child.com')

// 子页面接收
window.addEventListener('message', (e) => {
  if (e.origin === 'https://parent.com') {
    console.log(e.data)
  }
})
```

**安全性：**

```html
<!-- 沙箱限制 -->
<iframe src="content.html" 
        sandbox="allow-scripts allow-same-origin">
</iframe>
```

**知识点：** `iframe` `跨域` `postMessage`

:::

---

### Q5: Canvas 和 SVG 有什么区别？应该如何选择？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**对比表格：**

| 特性 | Canvas | SVG |
|------|--------|-----|
| 渲染方式 | 像素（光栅） | 矢量路径 |
| 分辨率 | 有损缩放 | 无限缩放 |
| DOM 访问 | ❌ 不可单独访问 | ✅ 每个元素可访问 |
| 事件处理 | 整体处理 | 每个元素单独处理 |
| 适合场景 | 游戏、图表、编辑 | 图标、地图、简单图形 |
| 复杂度 | 适合大量元素 | 适合少量复杂图形 |

**Canvas 示例：**

```html
<canvas id="canvas" width="400" height="200"></canvas>
<script>
const ctx = canvas.getContext('2d')
ctx.fillStyle = 'blue'
ctx.fillRect(10, 10, 100, 100)
</script>
```

**SVG 示例：**

```html
<svg width="100" height="100">
  <rect x="10" y="10" width="80" height="80" fill="blue" />
</svg>
```

**性能对比：**

```
Canvas: 
- 适合大量动态元素 (10000+)
- 游戏循环 (60fps)
- 像素级操作

SVG:
- 适合静态或少量元素 (<1000)
- 地图、图标
- 需要缩放时保真
```

**选择建议：**

| 场景 | 选择 |
|------|------|
| 游戏、动画 | Canvas |
| 数据图表 | Canvas/Chart.js |
| 图标系统 | SVG |
| 地图 | SVG/D3.js |
| 图像编辑 | Canvas |
| Logo、图标 | SVG |

**知识点：** `Canvas` `SVG` `图形渲染`

:::

---

### Q6: DOCTYPE 的作用是什么？严格模式和混杂模式有什么区别？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**DOCTYPE 声明：**

```html
<!-- HTML5 -->
<!DOCTYPE html>

<!-- HTML 4.01 Strict -->
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">

<!-- XHTML 1.0 -->
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
```

**作用：**

告诉浏览器使用哪种 HTML 版本解析文档，决定是否启用标准模式。

**两种模式对比：**

| 特性 | 严格模式 (Standards) | 混杂模式 (Quirks) |
|------|---------------------|-------------------|
| 盒模型 | W3C 标准 | IE 怪异 |
| 行内元素垂直对齐 | 基线对齐 | 底部对齐 |
| 表格布局 | 现代 | 旧 IE |
| 触发方式 | 有正确的 DOCTYPE | 没有或错误的 DOCTYPE |

**触发现代模式的方式：**

```html
<!-- ✅ 现代模式 -->
<!DOCTYPE html>

<!-- ❌ 混杂模式 -->
<html>  <!-- 缺少 DOCTYPE -->
```

**盒模型差异：**

```
严格模式：box-sizing: content-box
总宽度 = width + padding + border + margin

混杂模式：box-sizing: border-box (旧 IE)
总宽度 = width (包含 padding 和 border)
```

**知识点：** `DOCTYPE` `渲染模式` `盒模型`

:::

---

### Q7: 简述 HTML 解析流程

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**完整解析流程：**

```
1. HTML 解析 → DOM Tree
         ↓
2. CSS 解析 → CSSOM Tree
         ↓
3. DOM + CSSOM → Render Tree (渲染树)
         ↓
4. Layout (布局) → 计算每个节点位置
         ↓
5. Paint (绘制) → 调用 GPU 绘制
         ↓
6. Composite (合成) → 图层合成输出
```

**关键步骤：**

**1. DOM 构建：**

```
HTML → 分词 → Token → 构建 DOM
```

**2. 阻塞行为：**

```html
<!-- 会阻塞 DOM 构建 -->
<script src="script.js"></script>

<!-- 不阻塞 -->
<script defer src="script.js"></script>
<script async src="script.js"></script>
<link rel="stylesheet" href="style.css">
```

**3. 回流与重绘：**

```
回流 (Reflow): 布局变化 → 触发重新计算
重绘 (Repaint): 样式变化 → 触发重新绘制

优化：使用 transform/opacity 避免回流重绘
```

**知识点：** `HTML 解析` `DOM` `渲染流程`

:::

---

### Q8: label 标签与可访问性的关系是什么？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**label 的作用：**

```html
<!-- 1. 点击 label 聚焦输入框 -->
<label for="email">邮箱：</label>
<input type="email" id="email" />

<!-- 2. 包装式 -->
<label>
  用户名：
  <input type="text" name="username" />
</label>

<!-- 3. aria-label -->
<input type="text" aria-label="请输入姓名" />
```

**可访问性意义：**

1. **屏幕阅读器**：可以朗读标签文本
2. **点击区域**：扩大可点击范围
3. **移动设备**：更好的触控体验

**最佳实践：**

```html
<!-- ✅ 好：明确关联 -->
<input type="checkbox" id="agree" />
<label for="agree">我同意条款</label>

<!-- ✅ 好：包装式 -->
<label>
  <input type="radio" name="gender" value="male" />
  男
</label>

<!-- ⚠️ 避免：没有关联 -->
<div>用户名</div>
<input type="text" />
```

**秘要属性：**

```html
<!-- aria-labelledby: 引用可见文本 -->
<input aria-labelledby="label-text" />
<span id="label-text">用户名</span>

<!-- aria-describedby: 补充说明 -->
<input aria-describedby="desc" />
<span id="desc">请输入 5-20 字</span>

<!-- aria-required: 必填标识 -->
<input required aria-required="true" />
```

**知识点：** `label` `可访问性` `a11y`

:::

---

### Q9: 如何遍历一棵 DOM 树？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 方法 1: 深度优先递归（最常用）
function dfs(node, callback) {
  callback(node)
  node = node.firstChild
  while (node) {
    dfs(node, callback)
    node = node.nextSibling
  }
}

// 方法 2: 广度优先（层序遍历）
function bfs(root, callback) {
  const queue = [root]
  while (queue.length) {
    const node = queue.shift()
    callback(node)
    let child = node.firstChild
    while (child) {
      queue.push(child)
      child = child.nextSibling
    }
  }
}

// 方法 3: TreeWalker API（浏览器原生）
const walker = document.createTreeWalker(
  document.body,
  NodeFilter.SHOW_ELEMENT,  // 只遍历元素节点
  null,
  false
)
let node
while ((node = walker.nextNode())) {
  console.log(node.tagName)
}

// 方法 4: NodeIterator（类似 TreeWalker）
const iter = document.createNodeIterator(
  document.body,
  NodeFilter.SHOW_ELEMENT
)
let node
while ((node = iter.nextNode())) {
  console.log(node.tagName)
}
```

| 方式 | 特点 | 适用场景 |
|------|------|---------|
| 深度优先 (DFS) | 递归，内存少 | 遍历嵌套结构 |
| 广度优先 (BFS) | 队列，层级顺序 | 找最近节点 |
| TreeWalker | 原生 API，高效 | 大规模 DOM 筛选 |
| NodeIterator | 原生 API，简单 | 前向遍历 |

**知识点：** `DOM 遍历` `深度优先` `广度优先` `TreeWalker` `NodeIterator`

:::

---

### Q10: 常用的 meta 标签有哪些？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```html
<!-- 字符编码 -->
<meta charset="UTF-8">

<!-- 移动端视口 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0">

<!-- SEO -->
<meta name="keywords" content="前端，面试，JavaScript">
<meta name="description" content="前端面试题库">
<meta name="author" content="张三">
<meta name="robots" content="index, follow">

<!-- IE 兼容 -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">

<!-- 禁止爬虫 -->
<meta name="robots" content="noindex, nofollow">

<!-- Referrer 策略 -->
<meta name="referrer" content="no-referrer">

<!-- 禁止电话号码识别 -->
<meta name="format-detection" content="telephone=no">

<!-- 禁止邮箱识别 -->
<meta name="format-detection" content="email=no">

<!-- 主题色 -->
<meta name="theme-color" content="#42b883">

<!-- Apple Web App -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">

<!-- CSP 安全策略 -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">

<!-- 缓存控制 -->
<meta http-equiv="Cache-Control" content="no-cache">
```

**知识点：** `meta 标签` `viewport` `SEO` `CSP` `referrer`

:::

---

### Q11: Web Worker 在项目中怎么使用？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Web Worker：** 在后台线程中运行 JS，不阻塞主线程。

```js
// main.js — 主线程
const worker = new Worker('worker.js')

// 发送数据
worker.postMessage({ type: 'compute', data: largeArray })

// 接收结果
worker.onmessage = (e) => {
  console.log('计算结果:', e.data)
}

// 错误处理
worker.onerror = (e) => {
  console.error('Worker 错误:', e.message)
}

// 终止
worker.terminate()
```

```js
// worker.js — Worker 线程
self.onmessage = (e) => {
  const { type, data } = e.data
  if (type === 'compute') {
    const result = heavyComputation(data)
    self.postMessage(result)
  }
}

function heavyComputation(data) {
  // 耗时计算...
  return data.reduce((sum, n) => sum + n * n, 0)
}
```

**实战场景：**

```js
// 1. 大数据处理（CSV/JSON 解析）
worker.postMessage({ type: 'parseCSV', data: csvString })

// 2. 图片处理（压缩/滤镜）
worker.postMessage({ type: 'compress', data: imageData })

// 3. 加密计算
worker.postMessage({ type: 'encrypt', data: { text, key } })

// 4. 实时数据推送（SharedWorker）
const sharedWorker = new SharedWorker('shared-worker.js')
```

**Worker 限制：**
- 不能操作 DOM
- 不能使用 window 对象（用 self）
- 不能使用 XMLHttpRequest（用 fetch）
- 同源限制

**知识点：** `Web Worker` `多线程` `后台计算` `postMessage` `SharedWorker`

:::

---

### Q12: 谈谈以前端角度出发做好 SEO 需要考虑什么？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**SEO 优化要点：**

**1. Meta 标签优化：**

```html
<!-- 标题（最重要） -->
<title>核心关键词 - 品牌名</title>

<!-- 描述（影响点击率） -->
<meta name="description" content="150-160 字描述，包含关键词">

<!-- 关键词（权重降低但仍有用） -->
<meta name="keywords" content="前端，面试，JavaScript">

<!-- 视口（移动端友好） -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- 规范链接（避免重复） -->
<link rel="canonical" href="https://example.com/page">

<!-- Open Graph（社交媒体分享） -->
<meta property="og:title" content="页面标题">
<meta property="og:description" content="页面描述">
<meta property="og:image" content="https://example.com/image.jpg">
```

**2. 语义化标签：**

```html
<header>  <!-- 网站头部 -->
<nav>     <!-- 导航 -->
<main>    <!-- 主要内容 -->
<article> <!-- 独立文章 -->
<section> <!-- 内容区块 -->
<aside>   <!-- 侧边栏 -->
<footer>  <!-- 页脚 -->
```

**3. 关键词策略：**

- 标题标签包含核心关键词（最重要）
- H1 标签使用主关键词（每页一个）
- H2-H6 层次化使用相关关键词
- 首段内容自然包含关键词
- 图片 alt 属性描述图片内容

**4. SSR/预渲染：**

```js
// SPA 的 SEO 问题：搜索引擎不执行 JS
// 解决方案：

// 1. 服务端渲染 (SSR)
// Next.js / Nuxt.js

// 2. 静态站点生成 (SSG)
// Gatsby / Gridsome

// 3. 预渲染 (Prerender)
// prerender-spa-plugin
```

**5. 性能优化：**

```html
<!-- 资源加载优化 -->
<link rel="preload" href="font.woff2" as="font">
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- 图片懒加载 -->
<img src="image.jpg" loading="lazy" alt="描述">

<!-- 压缩资源 -->
<!-- 使用 gzip/brotli 压缩 -->
```

**6. 结构化数据（Schema.org）：**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章标题",
  "image": ["https://example.com/image.jpg"],
  "author": {
    "@type": "Person",
    "name": "作者名"
  },
  "datePublished": "2024-01-01"
}
</script>
```

**7. 其他要点：**

- robots.txt 配置
- sitemap.xml 提交
- 404 页面友好
- HTTPS 加密
- 移动端适配
- 页面加载速度（<3 秒）

**知识点：** `SEO` `Meta 标签` `语义化` `SSR` `结构化数据` `性能优化`

:::

---

### Q13: HTML5 离线缓存的原理和使用？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HTML5 离线缓存（Application Cache）** 已废弃，现代方案是 Service Worker，但了解原理仍有价值。

**原理：**

通过 manifest 文件指定需要缓存的资源，浏览器自动下载并缓存，离线时从缓存读取。

**manifest 文件结构：**

```manifest
CACHE MANIFEST
# 版本号（修改版本号强制更新缓存）
# 2024-01-01

CACHE:
# 需要缓存的资源
css/style.css
js/app.js
images/logo.png

NETWORK:
# 始终从网络获取（不缓存）
api/*
login.html

FALLBACK:
# 离线时的回退页面
/ offline.html
/api/ /offline-api.html
```

**HTML 引用 manifest：**

```html
<!DOCTYPE html>
<html manifest="app.manifest">
<head>
  <title>离线应用</title>
</head>
<body>
  <!-- 内容 -->
</body>
</html>
```

**缓存更新机制：**

```js
// 监听缓存事件
const appCache = window.applicationCache

appCache.addEventListener('cached', () => {
  console.log('缓存已完成')
})

appCache.addEventListener('updateready', () => {
  console.log('缓存已更新，需要刷新页面')
  appCache.swapCache()  // 切换到新缓存
  window.location.reload()
})

appCache.addEventListener('error', () => {
  console.error('缓存失败')
})
```

**localStorage 离线存储（替代方案）：**

```js
// 存储
localStorage.setItem('data', JSON.stringify({ name: '张三' }))

// 读取
const data = JSON.parse(localStorage.getItem('data'))

// 删除
localStorage.removeItem('data')

// 清空
localStorage.clear()
```

**IndexedDB 离线存储（大数据）：**

```js
// 打开数据库
const request = indexedDB.open('MyDB', 1)

request.onupgradeneeded = (e) => {
  const db = e.target.result
  const store = db.createObjectStore('users', { keyPath: 'id' })
}

request.onsuccess = (e) => {
  const db = e.target.result
  const tx = db.transaction('users', 'readwrite')
  tx.objectStore('users').add({ id: 1, name: '张三' })
}
```

**Service Worker（现代方案）：**

```js
// sw.js
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/app.js'
      ])
    })
  )
})

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request)
    })
  )
})
```

**知识点：** `离线缓存` `manifest` `CACHE` `NETWORK` `FALLBACK` `Service Worker`

:::

---

### Q14: 谈谈你对浏览器内核的理解？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**浏览器内核组成：**

```┌─────────────────────┐
│      浏览器内核     │
├─────────────────────┤
│  渲染引擎 + JS 引擎 │
└─────────────────────┘
```

**1. 渲染引擎（Rendering Engine）**

- 解析 HTML、CSS
- 计算布局（Layout）
- 绘制页面（Paint）

**2. JS 引擎（JavaScript Engine）**

- 解析 JavaScript 代码
- 编译和执行脚本
- 与渲染引擎交互

**主流浏览器内核：**

| 内核名称 | 别名 | 使用浏览器 | 特点 |
|----------|------|------------|------|
| **Trident** | IE 内核 | IE 浏览器 | 微软开发，已淘汰 |
| **Webkit** | - | Safari、旧 Chrome | 苹果开发，性能好 |
| **Blink** | - | Chrome、Edge、Opera | Google 从 Webkit 分叉 |
| **Gecko** | 火狐内核 | Firefox | 开源，标准支持好 |
| **Presto** | - | 旧版 Opera | 已弃用 |

**内核发展：**

```1990s: Trident (IE) 主导
2003: Webkit (Safari) 诞生
2005: Gecko (Firefox) 兴起
2008: V8 引擎 (Chrome) 革命
2013: Blink 从 Webkit 分叉
2019: Edge 改用 Blink
2022: Presto、Trident 退出历史舞台
```

**现代浏览器架构：**

```
多进程架构（Chrome）
├── 浏览器进程（主进程）
├── 渲染进程（每个标签页独立）
│   ├── 渲染线程
│   ├── JS 线程
│   └── 网络线程
├── 网络进程
├── GPU 进程
└── 插件进程
```

**内核差异影响：**

- **CSS 解析**：前缀兼容性（-webkit-, -moz-, -ms-）
- **JS 执行**：V8 优化（内联缓存、即时编译）
- **渲染性能**：硬件加速支持程度
- **新特性**：CSS Grid、ES6+ 支持进度

**内核检测：**

```js
const userAgent = navigator.userAgent

if (userAgent.includes('Chrome')) console.log('Blink')
else if (userAgent.includes('Safari')) console.log('Webkit')
else if (userAgent.includes('Firefox')) console.log('Gecko')
else if (userAgent.includes('MSIE') || userAgent.includes('Trident')) console.log('Trident')
```

**知识点：** `浏览器内核` `渲染引擎` `JS 引擎` `Trident` `Webkit` `Blink` `Gecko`

:::

---

## 总结

| 知识点 | 重要度 |
|--------|--------|
| 语义化标签 | 🔥🔥🔥 |
| 行内/块级元素 | 🔥🔥 |
| src vs href | 🔥🔥 |
| iframe 应用 | 🔥🔥 |
| Canvas vs SVG | 🔥🔥 |
| DOCTYPE | 🔥🔥 |
| HTML 解析 | 🔥🔥 |
| 可访问性 | 🔥🔥 |

---### Q15: script 标签中 defer 和 async 的区别是什么？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```text
无属性：    HTML解析 → 暂停 → 下载JS → 执行JS → 继续解析HTML
defer：     HTML解析 ──────→ 下载JS(并行) ──→ DOMContentLoaded前执行(按顺序)
async：     HTML解析 ──→ 下载JS(并行) → 下载完立即执行(暂停HTML解析)
```

| 属性 | 下载时机 | 执行时机 | 执行顺序 | DOM就绪 |
|------|---------|---------|---------|---------|
| 无 | 遇到即下载并执行 | 立即（阻塞解析） | 按出现顺序 | 执行时DOM可能未就绪 |
| defer | 与HTML解析并行 | DOMContentLoaded前 | 按出现顺序 | ✅ DOM已就绪 |
| async | 与HTML解析并行 | 下载完立即执行 | 不保证顺序 | ❌ 可能未就绪 |

```html
<!-- 关键脚本用defer -->
<script src="app.js" defer></script>
<script src="vendor.js" defer></script>
<!-- app.js一定在vendor.js之后执行，且DOM已就绪 -->

<!-- 独立脚本用async -->
<script src="analytics.js" async></script>
<script src="ads.js" async></script>
<!-- 执行顺序不确定，谁先下载完谁先执行 -->

<!-- 最佳实践 -->
<!-- 关键CSS内联 -->
<style>/* 首屏样式 */</style>
<!-- 非关键CSS预加载 -->
<link rel="preload" href="non-critical.css" as="style" onload="this.rel='stylesheet'">
<!-- JS用defer -->
<script src="app.js" defer></script>
```

**动态创建script默认async：**

```js
const script = document.createElement('script')
script.src = 'dynamic.js'
script.async = true  // 默认就是async
document.head.appendChild(script)

// 如果需要按顺序执行
script.async = false  // 设为false则按插入顺序执行
```

**知识点：** `defer` `async` `脚本加载` `DOMContentLoaded` `HTML解析`

:::

---

### Q16: link 标签的 rel="preload" 和 rel="prefetch" 的区别？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**preload 和 prefetch 都用于资源预加载，但用途和时机不同：**

**rel="preload"：预加载当前页面必需的资源**

```html
<!-- 预加载关键字体 -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin>

<!-- 预加载关键 CSS -->
<link rel="preload" href="/css/critical.css" as="style">

<!-- 预加载首屏图片 -->
<link rel="preload" href="/images/hero.jpg" as="image">

<!-- 预加载关键 JS -->
<link rel="preload" href="/js/app.js" as="script">
```

**特点：**
- 对**当前页面**至关重要
- 浏览器会**立即下载**，优先级高
- 需要 `as` 属性指定资源类型
- 下载后立即用于当前页面

**rel="prefetch"：预加载未来页面可能需要的资源**

```html
<!-- 预加载下一页可能用的资源 -->
<link rel="prefetch" href="/js/next-page.js" as="script">
<link rel="prefetch" href="/images/banner2.jpg" as="image">

<!-- 预加载 DNS -->
<link rel="dns-prefetch" href="//cdn.example.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://api.example.com">
```

**特点：**
- 用于**未来导航**可能用到的资源
- 浏览器在**空闲时**下载，优先级低
- 不需要 `as` 属性（_compat_）
- 可能不被下载（取决于浏览器策略）

**对比表：**

| 特性 | preload | prefetch |
|------|---------|----------|
| 用途 | 当前页面必需 | 未来页面可能用 |
| 优先级 | 高 | 低（空闲时） |
| 时机 | 立即 | 空闲时 |
| as 属性 | 必需 | 可选 |
| 跨域 | 支持（需 crossorigin） | 支持 |
| 浏览器支持 | 较好 | 很好 |

**实际使用场景：**

**1. 首屏优化（preload）**

```html
<head>
  <!-- 关键 CSS -->
  <link rel="preload" href="/css/critical.css" as="style">
  
  <!-- 关键字体 -->
  <link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
  
  <!-- LCP 图片 -->
  <link rel="preload" href="/images/hero.webp" as="image">
</head>
```

**2. 路由预加载（prefetch）**

```html
<!-- 首页，用户可能点击"关于" -->
<link rel="prefetch" href="/about.js">
<link rel="prefetch" href="/about.css">

<!-- 或 JS 动态预加载 -->
<script>
// 当链接进入视口时预加载
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const link = entry.target.querySelector('link[rel="prefetch"]')
      if (link) link.rel = 'preload' // 升级为 preload
    }
  })
})
</script>
```

**3. 结合使用**

```html
<head>
  <!-- 当前页面必需 -->
  <link rel="preload" href="/css/main.css" as="style">
  <link rel="preload" href="/js/app.js" as="script">
  
  <!-- 用户可能访问的下一页 -->
  <link rel="prefetch" href="/js/dashboard.js">
  <link rel="prefetch" href="/api/user-data">
  
  <!-- 预连接 CDN -->
  <link rel="preconnect" href="https://cdn.example.com">
  <link rel="dns-prefetch" href="https://analytics.example.com">
</head>
```

**注意事项：**

1. **不要滥用 preload**：过多 preload 会占用带宽，影响关键资源
2. ** prefetch 可能被忽略**：浏览器可能根据策略决定是否下载
3. **配合 Service Worker**：可以实现更智能的预加载策略

**知识点：** `preload` `prefetch` `性能优化` `资源加载` `preconnect`

:::

---

### Q17: 什么是 Web Components？Custom Elements、Shadow DOM、HTML Templates

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Web Components 是一套浏览器原生标准**，允许创建可复用的自定义 HTML 元素，无需框架。

**四大核心技术：**

**1. Custom Elements（自定义元素）**

定义新的 HTML 标签：

```js
// 定义自定义元素
class MyElement extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.render()
  }
  
  static get observedAttributes() {
    return ['title', 'count']
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    this.render()
  }
  
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .container { padding: 16px; }
      </style>
      <div class="container">
        <h2>${this.getAttribute('title') || '默认标题'}</h2>
        <slot>默认内容</slot>
      </div>
    `
  }
}

customElements.define('my-element', MyElement)
```

```html
<!-- 使用自定义元素 -->
<my-element title="我的组件">
  <p>这是内容</p>
</my-element>
```

**2. Shadow DOM（阴影 DOM）**

封装样式和结构，避免全局污染：

```js
class ScopedElement extends HTMLElement {
  constructor() {
    super()
    // 创建 Shadow DOM
    const shadow = this.attachShadow({ mode: 'open' })
    
    // Shadow DOM 内部样式不影响外部
    shadow.innerHTML = `
      <style>
        p { color: blue; } /* 只影响 Shadow DOM 内的 p */
      </style>
      <p>这个 p 标签不会受外部 CSS 影响</p>
      <slot></slot> <!-- 插槽：允许外部内容插入 -->
    `
  }
}

customElements.define('scoped-element', ScopedElement)
```

**Shadow DOM 穿透：**

```css
/* 从外部设置 Shadow DOM 内部样式（不推荐，破坏封装） */
scoped-element::part(label) {
  color: red;
}

/* 使用 :host 从内部访问宿主元素 */
:host(.active) {
  border: 2px solid blue;
}
```

**3. HTML Templates（HTML 模板）**

定义不立即渲染的模板内容：

```html
<!-- 定义模板（不渲染） -->
<template id="card-template">
  <div class="card">
    <img class="card-img" src="" alt="">
    <div class="card-body">
      <h4 class="card-title"></h4>
      <p class="card-text"></p>
    </div>
  </div>
</template>

<script>
// 克隆并使用模板
const template = document.getElementById('card-template')
const clone = template.content.cloneNode(true)

clone.querySelector('.card-img').src = '/image.jpg'
clone.querySelector('.card-title').textContent = '标题'
clone.querySelector('.card-text').textContent = '描述'

document.body.appendChild(clone)
</script>
```

**4. HTML Imports（已废弃，用 ES Modules 替代）**

```html
<!-- 旧方式（已废弃） -->
<link rel="import" href="/components/my-element.html">

<!-- 现代方式 -->
<script type="module">
import MyElement from '/components/my-element.js'
</script>
```

**完整示例 - 自定义卡片组件：**

```js
class CardElement extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: 'open' })
    
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }
        .img { width: 100%; height: 200px; object-fit: cover; }
        .body { padding: 16px; }
        ::slotted(h3) { margin: 0 0 8px; color: #333; }
      </style>
      <img class="img" part="image">
      <div class="body">
        <slot name="title"><h3>默认标题</h3></slot>
        <slot></slot>
      </div>
    `
  }
  
  static get observedAttributes() {
    return ['src', 'alt']
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'src') {
      this.shadowRoot.querySelector('.img').src = newValue
    }
  }
}

customElements.define('card-element', CardElement)
```

```html
<!-- 使用 -->
<card-element src="/image.jpg" alt="图片描述">
  <h3 slot="title">卡片标题</h3>
  <p>卡片内容描述...</p>
</card-element>
```

**优缺点对比：**

| 特性 | Web Components | 框架组件（React/Vue） |
|------|---------------|---------------------|
| 标准 | 浏览器原生标准 | 框架特定语法 |
| 体积 | 无运行时 | 需要框架运行时 |
| 兼容性 | 现代浏览器 | 取决于框架 |
| 生态 | 较小 | 丰富 |
| 学习曲线 | 较陡 | 框架文档丰富 |
| 样式封装 | Shadow DOM 原生支持 | 需 CSS Modules/Scoped |

**使用场景：**

- ✅ 设计系统/组件库（跨框架使用）
- ✅ 微前端架构（框架无关）
- ✅ 浏览器扩展 UI
- ❌ 复杂状态管理（建议配合框架）
- ❌ SSR（需要额外处理）

**知识点：** `Web Components` `Custom Elements` `Shadow DOM` `HTML Templates` `自定义元素`

:::

---
