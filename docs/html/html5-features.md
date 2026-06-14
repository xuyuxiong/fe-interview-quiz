---
title: HTML5 新特性面试题
description: HTML5 新特性全解析，涵盖 Canvas、WebSocket、Web Worker 等 8 道核心面试题
---

# HTML5 新特性面试题

> **📚 共 8 题 · 简单 30% · 中等 50% · 困难 20%**

---

### Q1: Canvas 2D 绘图基础是什么？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**基础使用:**

```html
<canvas id="canvas" width="400" height="200"></canvas>
<script>
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

// 绘制矩形
ctx.fillStyle = 'blue'
ctx.fillRect(10, 10, 100, 50)

// 绘制圆形
ctx.beginPath()
ctx.arc(200, 100, 50, 0, Math.PI * 2)
ctx.fill()

// 绘制线条
ctx.beginPath()
ctx.moveTo(50, 150)
ctx.lineTo(150, 150)
ctx.strokeStyle = 'red'
ctx.lineWidth = 2
ctx.stroke()

// 绘制文字
ctx.font = '20px Arial'
ctx.fillText('Hello Canvas', 50, 50)

// 图片绘制
const img = new Image()
img.onload = () => ctx.drawImage(img, 0, 0)
img.src = 'image.jpg'
</script>
```

**知识点：** `Canvas` `2D 绘图`

:::

---

### Q2: WebSocket 如何实现双工通信？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**基础使用:**

```js
const ws = new WebSocket('ws://example.com/socket')

ws.onopen = () => {
  console.log('连接打开')
  ws.send('Hello Server')
}

ws.onmessage = (event) => {
  console.log('收到消息:', event.data)
}

ws.onerror = (error) => {
  console.error('错误:', error)
}

ws.onclose = () => {
  console.log('连接关闭')
}
```

**心跳保持:**

```js
let ws
let heartbeatTimer

function connect() {
  ws = new WebSocket('ws://example.com')
  
  ws.onopen = () => {
    heartbeatTimer = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000)
  }
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data)
    if (data.type === 'pong') {
      // 收到心跳响应
    }
  }
  
  ws.onclose = () => {
    clearInterval(heartbeatTimer)
    // 重连
    setTimeout(connect, 3000)
  }
}

connect()
```

**知识点：** `WebSocket` `双工通信`

:::

---

### Q3: Web Worker 和 Service Worker 有什么区别？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**对比表格:**

| 特性 | Web Worker | Service Worker |
|------|------------|----------------|
| 用途 | 计算密集型任务 | 网络代理/缓存 |
| 生命周期 | 页面关闭时结束 | 独立生命周期 |
| 网络请求 | ❌ 不能 | ✅ 可以 |
| 缓存 | ❌ 不能 | ✅ 可以 |
| 离线支持 | ❌ | ✅ PWA |

**Web Worker:**

```js
// main.js
const worker = new Worker('worker.js')
worker.postMessage({ type: 'calculate', data: numbers })
worker.onmessage = (e) => console.log(e.data)

// worker.js
self.onmessage = (e) => {
  const result = heavyComputation(e.data)
  self.postMessage(result)
}
```

**Service Worker:**

```js
// 注册
navigator.serviceWorker.register('/sw.js')

// sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll(['/index.html', '/style.css'])
    })
  )
})

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => {
      return res || fetch(event.request)
    })
  )
})
```

**知识点：** `Web Worker` `Service Worker` `多线程`

:::

---

### Q4: 离线存储如何实现？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Application Cache (已废弃):**

```html
<!-- 已废弃，不推荐使用 -->
<html manifest="cache.manifest">
```

**Service Worker 缓存:**

```js
// 缓存策略
self.addEventListener('fetch', (event) => {
  // 1. 缓存优先
  event.respondWith(
    caches.match(event.request).then((res) => {
      return res || fetch(event.request)
    })
  )
  
  // 2. 网络优先
  event.respondWith(
    fetch(event.request).then((res) => {
      const clone = res.clone()
      caches.open('v1').then((cache) => {
        cache.put(event.request, clone)
      })
      return res
    })
  )
  
  // 3. 仅网络
  event.respondWith(fetch(event.request))
})
```

**IndexedDB:**

```js
const request = indexedDB.open('MyDB', 1)

request.onupgradeneeded = (event) => {
  const db = event.target.result
  db.createObjectStore('users', { keyPath: 'id' })
}

request.onsuccess = (event) => {
  const db = event.target.result
  const tx = db.transaction('users', 'readwrite')
  tx.objectStore('users').add({ id: 1, name: 'John' })
}
```

**知识点：** `离线存储` `Service Worker` `IndexedDB`

:::

---

### Q5: Geolocation API 如何使用？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**基础使用:**

```js
// 获取位置
navigator.geolocation.getCurrentPosition(
  (pos) => {
    console.log('纬度:', pos.coords.latitude)
    console.log('经度:', pos.coords.longitude)
    console.log('精度:', pos.coords.accuracy)
  },
  (err) => {
    console.error('错误:', err.message)
  },
  {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }
)

// 持续监听
const watchId = navigator.geolocation.watchPosition(
  (pos) => console.log('位置更新:', pos.coords)
)

// 清除监听
navigator.geolocation.clearWatch(watchId)
```

**知识点：** `Geolocation` `地理位置`

:::

---

### Q6: Drag and Drop API 如何实现？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**实现拖拽:**

```html
<div draggable="true" id="dragItem">拖拽我</div>
<div id="dropZone">放置区域</div>

<script>
const dragItem = document.getElementById('dragItem')
const dropZone = document.getElementById('dropZone')

dragItem.addEventListener('dragstart', (e) => {
  e.dataTransfer.setData('text/plain', e.target.id)
  e.dataTransfer.effectAllowed = 'move'
})

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault() // 必须阻止默认行为
  e.dataTransfer.dropEffect = 'move'
})

dropZone.addEventListener('drop', (e) => {
  e.preventDefault()
  const id = e.dataTransfer.getData('text/plain')
  const dragged = document.getElementById(id)
  dropZone.appendChild(dragged)
})
</script>
```

**知识点：** `Drag and Drop` `拖拽 API`

:::

---

### Q7: Web Storage localStorage 和 sessionStorage 有什么区别？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**对比:**

| 特性 | localStorage | sessionStorage |
|------|--------------|----------------|
| 生命周期 | 永久 | 窗口关闭 |
| 存储大小 | ~5MB | ~5MB |
| 跨窗口共享 | ✅ | ❌ |
| 同源策略 | ✅ | ✅ |

**使用:**

```js
// localStorage
localStorage.setItem('key', 'value')
localStorage.getItem('key')
localStorage.removeItem('key')
localStorage.clear()

// sessionStorage
sessionStorage.setItem('key', 'value')
sessionStorage.getItem('key')

// 存储对象
const obj = { name: 'John' }
localStorage.setItem('user', JSON.stringify(obj))
const user = JSON.parse(localStorage.getItem('user'))
```

**知识点：** `localStorage` `sessionStorage` `Web Storage`

:::

---

### Q8: History API 如何使用？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**基础使用:**

```js
// 添加历史记录
history.pushState({ page: 1 }, 'Page 1', '/page1')

// 替换当前历史
history.replaceState({ page: 2 }, 'Page 2', '/page2')

// 监听前进后退
window.addEventListener('popstate', (event) => {
  console.log('当前状态:', event.state)
})
```

**单页路由实现:**

```js
function navigate(path) {
  history.pushState({ path }, '', path)
  render(path)
}

window.addEventListener('popstate', () => {
  const path = location.pathname
  render(path)
})
```

**知识点：** `History API` `pushState` `SPA 路由`

:::

---

## 总结

| 知识点 | 重要度 |
|--------|--------|
| Canvas | 🔥🔥 |
| WebSocket | 🔥🔥 |
| Web Worker | 🔥🔥 |
| Service Worker | 🔥🔥🔥 |
| Geolocation | 🔥 |
| localStorage | 🔥🔥🔥 |
| History API | 🔥🔥 |

---
### Q9: HTML5 离线缓存怎么使用？工作原理？

> **🔥 中等 · HTML5**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HTML5 离线缓存（Application Cache）允许网页在无网络时访问。**

**⚠️ 注意：Application Cache 已废弃，推荐使用 Service Worker**

**1. 使用方法：**

```html
<!-- HTML 中引用 manifest 文件 -->
<html manifest="cache.manifest">
<head>
  <title>离线应用</title>
</head>
</html>
```

```bash
# cache.manifest 文件
CACHE MANIFEST
# 版本：v1.0.0

# 需要缓存的资源
CACHE:
  /static/style.css
  /static/app.js
  /images/logo.png
  /offline.html

# 必须在线访问的资源
NETWORK:
  /api/*
  https://cdn.example.com/*

# 备用资源（网络不可用时使用）
FALLBACK:
  / /offline.html
  /api/ /offline-api.html
```

**2. 工作原理：**

```
┌─────────────────────────────────────────┐
│  1. 首次访问带 manifest 的页面           │
│           ↓                             │
│  2. 浏览器下载 manifest 文件             │
│           ↓                             │
│  3. 解析并缓存 CACHE 列出的资源          │
│           ↓                             │
│  4. 后续访问优先从缓存加载              │
│           ↓                             │
│  5. manifest 变化时触发更新             │
└─────────────────────────────────────────┘
```

**3. JavaScript API：**

```javascript
const appCache = window.applicationCache;

// 监听缓存状态变化
appCache.addEventListener('cached', () => {
  console.log('资源缓存完成');
});

appCache.addEventListener('checking', () => {
  console.log('检查 manifest 更新');
});

appCache.addEventListener('updateready', () => {
  // 有新版本，刷新页面应用
  if (confirm('有新版本，是否刷新？')) {
    window.location.reload();
  }
});

appCache.addEventListener('error', () => {
  console.log('缓存失败，可能离线');
});
```

**4. 浏览器兼容性处理：**

```javascript
// 检测支持情况
if ('applicationCache' in window) {
  // 支持 Application Cache
} else {
  // 降级使用 Service Worker 或其他方案
}
```

**5. 现代替代方案（Service Worker）：**

```javascript
// service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/app.js'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**知识点：** `HTML5` `离线缓存` `ApplicationCache` `Service Worker` `PWA`

:::

---

### Q10: 如何遍历一颗 DOM 树？用栈实现

> **⭐ 简单 · DOM**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**遍历 DOM 树常用深度优先（DFS）和广度优先（BFS）两种方式。**

**1. 深度优先遍历（栈实现 - 非递归）：**

```javascript
/**
 * 深度优先遍历 - 栈实现
 * @param {Element} root - 根节点
 * @param {Function} callback - 访问节点时的回调
 */
function dfsWithStack(root, callback) {
  const stack = [root];
  
  while (stack.length > 0) {
    const node = stack.pop();
    callback(node);
    
    // 子节点逆序入栈（保证正序遍历）
    const children = Array.from(node.children);
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i]);
    }
  }
}

// 使用示例
dfsWithStack(document.body, (node) => {
  console.log(node.tagName);
});
```

**2. 深度优先遍历（递归实现）：**

```javascript
function dfsRecursive(node, callback) {
  callback(node);
  
  for (const child of node.children) {
    dfsRecursive(child, callback);
  }
}
```

**3. 广度优先遍历（队列实现）：**

```javascript
function bfsWithQueue(root, callback) {
  const queue = [root];
  
  while (queue.length > 0) {
    const node = queue.shift();
    callback(node);
    
    // 子节点按顺序入队
    for (const child of node.children) {
      queue.push(child);
    }
  }
}
```

**4. 查找特定元素：**

```javascript
/**
 * 深度优先查找
 * @param {Element} root - 根节点
 * @param {string} selector - CSS 选择器
 * @returns {Element|null}
 */
function findElement(root, selector) {
  const stack = [root];
  
  while (stack.length > 0) {
    const node = stack.pop();
    
    if (node.matches && node.matches(selector)) {
      return node;
    }
    
    const children = Array.from(node.children);
    for (let i = children.length - 1; i >= 0; i--) {
      stack.push(children[i]);
    }
  }
  
  return null;
}

// 使用
const btn = findElement(document.body, '.submit-btn');
```

**5. 收集所有元素：**

```javascript
function getAllElements(root) {
  const result = [];
  const stack = [root];
  
  while (stack.length > 0) {
    const node = stack.pop();
    result.push(node);
    
    for (const child of node.children) {
      stack.push(child);
    }
  }
  
  return result;
}
```

**6. 性能对比：**

| 方法 | 空间复杂度 | 适用场景 |
|------|-----------|----------|
| 递归 DFS | O(h) 调用栈 | 代码简洁，树不太深 |
| 栈 DFS | O(w) 显式栈 | 避免递归溢出 |
| 队列 BFS | O(w) 队列 | 按层处理，找最近元素 |

**知识点：** `DOM` `遍历` `DFS` `BFS` `栈` `队列`

:::

---

### Q11: 常用的 meta 标签有哪些？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**meta 标签提供页面的元数据，不参与内容展示但影响 SEO、渲染和行为。**

**1. 字符编码：**

```html
<meta charset="UTF-8">
<!-- 必须放在 head 最前面 -->
```

**2. 视口设置（移动端适配）：**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

**3. SEO 相关：**

```html
<!-- 页面描述 -->
<meta name="description" content="前端面试题库 - 涵盖 HTML/CSS/JS 等核心知识点">

<!-- 关键词 -->
<meta name="keywords" content="前端，面试，JavaScript, HTML, CSS">

<!-- 作者 -->
<meta name="author" content="Your Name">

<!-- 搜索引擎爬虫控制 -->
<meta name="robots" content="index, follow">
<!-- noindex, nofollow, noarchive, nosnippet -->
```

**4. Open Graph（社交媒体分享）：**

```html
<meta property="og:title" content="页面标题">
<meta property="og:description" content="页面描述">
<meta property="og:image" content="https://example.com/share.jpg">
<meta property="og:url" content="https://example.com/page">
<meta property="og:type" content="website">
```

**5. HTTP 响应头控制：**

```html
<!-- 刷新/重定向 -->
<meta http-equiv="refresh" content="5">
<!-- 5 秒后刷新 -->

<meta http-equiv="refresh" content="0;url=https://new-page.com">
<!-- 立即跳转 -->

<!-- 兼容模式 -->
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<!-- 使用最新 IE 内核 -->

<!-- 内容安全策略 -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'">
```

**6. 移动端优化：**

```html
<!-- iOS Safari -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
<meta name="format-detection" content="telephone=no">

<!-- Android -->
<meta name="mobile-web-app-capable" content="yes">
```

**7. 主题颜色：**

```html
<!-- 浏览器地址栏颜色 -->
<meta name="theme-color" content="#ffffff">
```

**8. 完整示例：**

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="页面描述">
  <meta name="author" content="作者名">
  <meta name="robots" content="index, follow">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="theme-color" content="#1890ff">
  
  <!-- Open Graph -->
  <meta property="og:title" content="分享标题">
  <meta property="og:image" content="share.jpg">
  
  <title>页面标题</title>
</head>
```

**知识点：** `HTML` `meta` `SEO` `移动端适配` `Open Graph`

:::

---

### Q12: Web Worker、SharedWorker、ServiceWorker 的区别？各适用场景？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**三种 Worker 都是后台线程，但用途和特性不同：**

**1. Web Worker（专用 Worker）**

为当前页面创建后台线程，用于计算密集型任务：

```js
// main.js - 主线程
const worker = new Worker('worker.js')

// 发送数据给 worker
worker.postMessage({ type: 'CALCULATE', data: largeData })

// 接收 worker 消息
worker.onmessage = (e) => {
  console.log('Worker 结果:', e.data)
  worker.terminate() // 结束 worker
}

// 错误处理
worker.onerror = (error) => {
  console.error('Worker 错误:', error)
}

// worker.js - 后台线程
self.onmessage = (e) => {
  const { type, data } = e.data
  
  if (type === 'CALCULATE') {
    const result = heavyComputation(data)
    self.postMessage({ type: 'RESULT', result })
  }
}
```

**特点：**
- 与创建它的页面**一对一**绑定
- 页面关闭时自动终止
- **无法访问 DOM**
- 可访问：Web Storage、XHR、setTimeout 等

**2. SharedWorker（共享 Worker）**

多个页面/标签页可共享同一个 Worker：

```js
// 页面 A 和页面 B 都可以连接
const sharedWorker = new SharedWorker('shared-worker.js')

sharedWorker.port.start() // 必须调用 start()

// 发送消息
sharedWorker.port.postMessage('Hello from page A')

// 接收消息
sharedWorker.port.onmessage = (e) => {
  console.log('收到:', e.data)
}

// shared-worker.js
const connections = []

self.onconnect = (e) => {
  const port = e.ports[0]
  connections.push(port)
  
  port.start()
  
  port.onmessage = (e) => {
    // 广播给所有连接的页面
    connections.forEach(p => {
      if (p !== port) {
        p.postMessage(e.data)
      }
    })
  }
}
```

**特点：**
- 通过**端口（port）**通信
- 多个页面可连接同一 Worker
- 适用于：跨标签页同步、聊天室、协作编辑

**3. Service Worker（服务 Worker）**

网络代理和离线缓存：

```js
// 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js', {
    scope: '/'
  }).then(reg => {
    console.log('SW 注册成功:', reg.scope)
  })
}

// sw.js - Service Worker
const CACHE_NAME = 'app-v1'
const ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/app.js'
]

// 安装阶段：缓存资源
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS)
    })
  )
})

// 激活阶段：清理旧缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    })
  )
})

// 拦截网络请求
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      return cached || fetch(e.request)
    })
  )
})

// 接收推送消息
self.addEventListener('push', (e) => {
  const data = e.data.json()
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.png'
    })
  )
})
```

**特点：**
- **网络代理**：拦截和处理网络请求
- **离线支持**：缓存资源实现离线访问
- **推送通知**：支持后台推送
- **生命周期**：install → activate → fetch
- **独立于页面**：页面关闭后仍可运行

**对比表：**

| 特性 | Web Worker | SharedWorker | Service Worker |
|------|-----------|--------------|----------------|
| 通信对象 | 创建它的页面 | 多个页面 | 浏览器/网络 |
| 生命周期 | 页面关闭终止 | 所有连接关闭终止 | 独立存活 |
| 访问 DOM | ❌ | ❌ | ❌ |
| 网络拦截 | ❌ | ❌ | ✅ |
| 离线缓存 | ❌ | ❌ | ✅ |
| 推送通知 | ❌ | ❌ | ✅ |
| 通信方式 | postMessage | port 端口 | postMessage |

**使用场景：**

| 场景 | 推荐方案 |
|------|---------|
| 大文件处理/加密 | Web Worker |
| 复杂计算（图像处理） | Web Worker |
| 跨标签页同步状态 | SharedWorker |
| 多人协作编辑 | SharedWorker |
| PWA 离线支持 | Service Worker |
| 后台推送通知 | Service Worker |
| 网络请求缓存 | Service Worker |

**知识点：** `Web Worker` `SharedWorker` `Service Worker` `多线程` `PWA`

:::

---

### Q13: IndexedDB 和 localStorage 的区别？什么场景用 IndexedDB？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**localStorage 和 IndexedDB 都是浏览器本地存储方案，但设计目标不同：**

**localStorage：简单的键值存储**

```js
// 存储（字符串）
localStorage.setItem('user', JSON.stringify({ name: 'John', age: 30 }))
localStorage.token = 'abc123'

// 读取
const user = JSON.parse(localStorage.getItem('user'))
const token = localStorage.getItem('token')

// 删除
localStorage.removeItem('token')
localStorage.clear()

// 遍历
for (let key in localStorage) {
  console.log(key, localStorage[key])
}

// 容量：约 5MB
// 特性：同步 API、仅支持字符串、阻塞主线程
```

**IndexedDB：完整的客户端数据库**

```js
// 打开/创建数据库
const request = indexedDB.open('MyAppDB', 1)

request.onerror = () => console.error('DB 打开失败')
request.onsuccess = (e) => {
  const db = e.target.result
  console.log('DB 打开成功')
}

// 版本升级时创建对象仓库（表）
request.onupgradeneeded = (e) => {
  const db = e.target.result
  
  // 创建对象仓库
  if (!db.objectStoreNames.contains('users')) {
    const store = db.createObjectStore('users', { keyPath: 'id' })
    store.createIndex('email', 'email', { unique: true })
    store.createIndex('name', 'name', { unique: false })
  }
  
  // 创建带自增 key 的仓库
  if (!db.objectStoreNames.contains('posts')) {
    const store = db.createObjectStore('posts', { autoIncrement: true })
  }
}

// CRUD 操作
function addUser(db, user) {
  const tx = db.transaction(['users'], 'readwrite')
  const store = tx.objectStore('users')
  store.add(user)
  
  tx.oncomplete = () => console.log('用户添加成功')
}

// 查询
function getUser(db, id) {
  const tx = db.transaction(['users'], 'readonly')
  const store = tx.objectStore('users')
  const request = store.get(id)
  
  request.onsuccess = (e) => {
    console.log('用户数据:', e.target.result)
  }
}

// 索引查询
function getUserByEmail(db, email) {
  const tx = db.transaction(['users'], 'readonly')
  const store = tx.objectStore('users')
  const index = store.index('email')
  const request = index.get(email)
  
  request.onsuccess = (e) => {
    console.log('找到用户:', e.target.result)
  }
}

// 游标遍历
function getAllUsers(db) {
  const tx = db.transaction(['users'], 'readonly')
  const store = tx.objectStore('users')
  const request = store.openCursor()
  
  request.onsuccess = (e) => {
    const cursor = e.target.result
    if (cursor) {
      console.log(cursor.key, cursor.value)
      cursor.continue()
    }
  }
}

// 范围查询
function getUsersInRange(db, minId, maxId) {
  const tx = db.transaction(['users'], 'readonly')
  const store = tx.objectStore('users')
  const range = IDBKeyRange.bound(minId, maxId)
  const request = store.openCursor(range)
  
  request.onsuccess = (e) => {
    const cursor = e.target.result
    if (cursor) {
      console.log(cursor.value)
      cursor.continue()
    }
  }
}
```

**对比表：**

| 特性 | localStorage | IndexedDB |
|------|-------------|-----------|
| API 类型 | 同步 | 异步 |
| 数据格式 | 仅字符串 | 任意对象（结构化） |
| 容量 | ~5MB | 无硬性限制（通常 50MB+） |
| 索引支持 | ❌ | ✅ |
| 事务 | ❌ | ✅ |
| 范围查询 | ❌ | ✅ |
| 阻塞主线程 | ✅ | ❌ |
| 使用复杂度 | 简单 | 较复杂 |
| 浏览器支持 | 所有 | 现代浏览器 |

**IndexedDB 适用场景：**

1. **大量数据存储**：缓存 Thousands 条数据
2. **复杂查询需求**：按多个字段索引、范围查询
3. **离线优先应用**：离线存储数据，联网后同步
4. **二进制数据存储**：存储图片、文件等 Blob 数据
5. **版本管理**：数据库版本升级

**现代封装库：**

```js
// 使用 idb 库（简化 API）
import { openDB } from 'idb'

const db = await openDB('MyAppDB', 1, {
  upgrade(db) {
    db.createObjectStore('users', { keyPath: 'id' })
  }
})

await db.add('users', { id: 1, name: 'John' })
const user = await db.get('users', 1)
```

**知识点：** `IndexedDB` `localStorage` `本地存储` `离线存储` `数据库`

:::

---

### Q14: Geolocation API 和 Notification API 的使用和权限管理？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. Geolocation API（地理定位）**

获取用户地理位置信息：

```js
// 检查支持
if (!navigator.geolocation) {
  console.log('浏览器不支持地理定位')
}

// 获取当前位置（一次性）
navigator.geolocation.getCurrentPosition(
  // 成功回调
  (position) => {
    const { latitude, longitude, accuracy } = position.coords
    console.log(`纬度：${latitude}, 经度：${longitude}, 精度：${accuracy}m`)
    
    // 可选的时间戳和海拔
    console.log('时间:', position.timestamp)
    console.log('海拔:', position.coords.altitude)
  },
  // 错误回调
  (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.error('用户拒绝权限')
        break
      case error.POSITION_UNAVAILABLE:
        console.error('位置信息不可用')
        break
      case error.TIMEOUT:
        console.error('获取超时')
        break
      default:
        console.error('未知错误')
    }
  },
  // 选项
  {
    enableHighAccuracy: true, // 高精度（可能更耗电）
    timeout: 5000,            // 超时时间
    maximumAge: 0             // 不使用缓存
  }
)

// 持续监听位置变化
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    console.log('位置更新:', position.coords)
  },
  (error) => {
    console.error('监听错误:', error)
  }
)

// 停止监听
navigator.geolocation.clearWatch(watchId)
```

**2. Notification API（桌面通知）**

在系统层面显示通知：

```js
// 请求权限
Notification.requestPermission().then(permission => {
  console.log('用户权限:', permission)
  // granted | denied | default
  
  if (permission === 'granted') {
    showNotification()
  }
})

// 显示通知
function showNotification() {
  const notification = new Notification('新消息', {
    body: '您有一条新消息待查看',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    image: '/preview.jpg',
    lang: 'zh-CN',
    tag: 'message-123',   // 相同 tag 会替换
    requireInteraction: false,
    actions: [
      { action: 'open', title: '查看' },
      { action: 'close', title: '关闭' }
    ],
    vibrate: [200, 100, 200],
    silent: false
  })
  
  // 点击通知
  notification.onclick = () => {
    window.focus()
    window.open('/messages/123')
    notification.close()
  }
  
  // 通知关闭
  notification.onclose = () => {
    console.log('通知已关闭')
  }
}
```

**Service Worker 中的通知：**

```js
// sw.js
self.registration.showNotification('推送消息', {
  body: '这是来自服务 Worker 的通知',
  icon: '/icon.png',
  data: { url: '/messages/123' }
})

// 点击 Service Worker 通知
self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === e.notification.data.url && 'focus' in client) {
          return client.focus()
        }
      }
      return clients.openWindow(e.notification.data.url)
    })
  )
})
```

**权限管理：**

```js
// 检查通知权限状态
function checkNotificationPermission() {
  if (!('Notification' in window)) {
    return 'not-supported'
  }
  return Notification.permission
}

// 请求权限（必须在用户交互后）
async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return false
  }
  
  const permission = await Animation.requestPermission()
  return permission === 'granted'
}

// 地理位置权限查询
function checkGeolocationPermission() {
  if (!navigator.permissions) {
    return 'unknown'
  }
  
  navigator.permissions.query({ name: 'geolocation' })
    .then(result => {
      console.log('地理位置权限:', result.state)
      // 'granted' | 'denied' | 'prompt'
    })
}
```

**最佳实践：**

1. **适时请求权限**：用户交互后请求，不要页面加载就请求
2. **解释用途**：先显示说明，解释为什么要这个权限
3. **优雅降级**：不支持时提供替代方案

**隐私和安全：**

- 两种 API 都需要用户明确授权
- 只能在 HTTPS 或 localhost 下使用
- 用户可以随时撤销权限

**知识点：** `Geolocation` `Notification` `权限管理` `PWA` `浏览器 API`

:::

---