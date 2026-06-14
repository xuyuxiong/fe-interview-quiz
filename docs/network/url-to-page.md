---
title: 从 URL 到页面展示
description: DNS 解析、TCP 连接、TLS 握手、HTTP 请求响应、关键渲染路径、性能优化
---

# 从 URL 到页面展示

完整理解输入 URL 后发生的一切，是前端性能优化的基础。

---

### Q1: 在浏览器中输入 URL 后发生了什么？（完整流程）

> **🔥 中等 · 完整流程**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**完整流程**：

```
1. URL 解析
   ↓
2. DNS 解析
   ↓
3. TCP 连接
   ↓
4. TLS 握手（HTTPS）
   ↓
5. HTTP 请求/响应
   ↓
6. 浏览器解析渲染
   ↓
7. 页面展示
```

**详细信息**：

**1. URL 解析**
```
协议：https
域名：www.example.com
路径：/page
参数：?id=1
锚点：#section
```

**2. DNS 解析**
```
浏览器 DNS 缓存
  ↓
系统 DNS 缓存/hosts
  ↓
本地 DNS 服务器
  ↓
根 DNS → 顶级 DNS → 权威 DNS
  ↓
获得 IP 地址
```

**3. TCP 连接**
```
三次握手建立 TCP 连接
```

**4. TLS 握手**
```
交换密钥
建立加密信道
```

**5. HTTP 请求**
```
发送 GET /page HTTP/1.1
Host: www.example.com
...
```

**6. 服务器处理**
```
接收请求
业务处理
返回响应
```

**7. 浏览器渲染**
```
解析 HTML → DOM
解析 CSS → CSSOM
构建 Render Tree
Layout（布局）
Paint（绘制）
Composite（合成）
```

**知识点：** `URL 解析` `DNS` `TCP` `TLS` `渲染流程`

:::

---

### Q2: DNS 解析过程是怎样的？

> **⭐ 简单 · DNS 解析**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**DNS 解析步骤**：

```
1. 浏览器 DNS 缓存（2 分钟）
   ↓
2. 系统 hosts 文件
   ↓
3. 本地 DNS 服务器
   ↓
4. 递归/迭代查询
   ↓
5. 获得 IP 地址
```

**递归查询**：
```
本地 DNS → 根 DNS → .com DNS → example.com DNS
             ↓           ↓            ↓
          返回答案（由本地 DNS 完成所有查询）
```

**迭代查询**：
```
客户端 → 根 DNS（返回.com 地址）
客户端 → .com DNS（返回 example 地址）
客户端 → example DNS（返回 IP）
```

**DNS 缓存层级**：
| 层级 | 缓存时间 |
|------|----------|
| 浏览器 | 几分钟 |
| 系统 | TTL 决定 |
| ISP | TTL 决定 |
| 权威 DNS | 由所有者设置 |

**DNS 优化**：
```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//cdn.example.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://api.example.com">
```

**知识点：** `DNS 解析` `递归查询` `迭代查询` `DNS 缓存` `预解析`

:::

---

### Q3: TCP 三次握手和四次挥手的过程？

> **⭐ 简单 · TCP 连接**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**三次握手**：
```
客户端                    服务端
  │                         │
  │── SYN ─────────────────>│
  │                         │
  │<─ SYN+ACK ──────────────│
  │                         │
  │── ACK ─────────────────>│
  │                         │
  【连接建立】
```

**四次挥手**：
```
客户端                    服务端
  │                         │
  │── FIN ─────────────────>│
  │                         │
  │<─ ACK ──────────────────│
  │                         │
  │    (服务端发送剩余数据)  │
  │                         │
  │<─ FIN ──────────────────│
  │                         │
  │── ACK ─────────────────>│
  │                         │
  【连接关闭】
```

**状态变化**：
```
三次握手:
CLOSED → SYN_SENT → ESTABLISHED
         (客户端)
CLOSED → SYN_RCVD → ESTABLISHED
         (服务端)

四次挥手:
ESTABLISHED → FIN_WAIT → TIME_WAIT → CLOSED
ESTABLISHED → CLOSE_WAIT → LAST_ACK → CLOSED
```

**知识点：** `三次握手` `四次挥手` `TCP 状态机` `连接管理`

:::

---

### Q4: TLS 握手过程是什么？

> **🔥 中等 · TLS 握手**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**TLS 1.2 握手**：
```
Client                     Server
  │                          │
  │── ClientHello ─────────>│
  │   TLS 版本，密码套件     │
  │   随机数 A               │
  │                          │
  │<─ ServerHello ──────────│
  │   选择的版本/套件        │
  │   随机数 B               │
  │                          │
  │<─ Certificate ──────────│
  │   服务器证书             │
  │                          │
  │<─ ServerHelloDone ──────│
  │                          │
  │── ClientKeyExchange ───>│
  │   预主密钥 (RSA 加密)     │
  │                          │
  │── ChangeCipherSpec ────>│
  │   切换到加密             │
  │                          │
  │── Finished ────────────>│
  │   握手验证              │
  │                          │
  │<─ ChangeCipherSpec ─────│
  │<─ Finished ─────────────│
  │                          │
  │  【加密通信开始】        │
```

**会谈秘钥计算**：
```
pre_master_secret (RSA 解密)
+ 随机数 A + 随机数 B
↓
master_secret
↓
加密密钥/ MAC 密钥
```

**知识点：** `TLS` `握手流程` `密钥交换` `会话密钥`

:::

---

### Q5: HTTP 请求响应过程是怎样的？

> **⭐ 简单 · HTTP 通信**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**请求报文**：
```
GET /index.html HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0
Accept: text/html
Cookie: session=abc

（空行）
```

**响应报文**：
```
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 1234
Set-Cookie: new=value

（空行）
<!DOCTYPE html>
<html>...</html>
```

**处理流程**：
```
1. 建立 TCP 连接
2. 发送请求报文
3. 服务器解析请求
4. 业务处理
5. 构建响应
6. 发送响应
7. 客户端解析
8. 保持连接（Keep-Alive）
```

**知识点：** `HTTP 请求` `HTTP 响应` `报文格式` `Keep-Alive`

:::

---

### Q6: 浏览器的关键渲染路径是什么？

> **🔥 中等 · 关键渲染路径**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**关键渲染路径（CRP）**：

```
HTML → DOM ─┐
            ├→ Render Tree → Layout → Paint → Composite
CSS → CSSOM ┘
```

**详细步骤**：

**1. 解析 HTML 构建 DOM**
```
HTML 解析器逐字节解析
遇到<script>暂停解析
构建 DOM 树
```

**2. 解析 CSS 构建 CSSOM**
```
解析 CSS 规则
构建 CSSOM 树
CSS 是阻塞渲染的
```

**3. 构建 Render Tree**
```
DOM + CSSOM
排除 display: none
包含可见节点样式
```

**4. Layout（回流）**
```
计算元素位置大小
从 root 开始递归
```

**5. Paint（绘制）**
```
填充颜色、文字、图片
转换为像素
```

**6. Composite（合成）**
```
多个图层合成
GPU 加速
```

**优化点**：
- 减少关键资源
- 缩短关键路径
- 减少关键字节

**知识点：** `关键渲染路径` `DOM` `CSSOM` `Render Tree` `Layout`

:::

---

### Q7: DOMContentLoaded 和 load 事件有什么区别？

> **⭐ 简单 · 页面事件**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**DOMContentLoaded**：
```
触发时机：HTML 解析完成
不等待：图片、样式表、iframe
执行：DOM 操作、绑定事件
```

**load**：
```
触发时机：所有资源加载完成
等待：图片、样式、子 frame
执行：依赖资源的操作
```

**时序图**：
```
开始 → 解析 HTML → DOMContentLoaded
                    ↓
                    等待资源
                    ↓
                    load
```

**使用场景**：
```javascript
// DOM 操作 - 用 DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// 依赖图片尺寸 - 用 load
window.addEventListener('load', () => {
  calculateLayout();
});

// 更早执行 - 用 async 脚本
<script async src="analytics.js"></script>
```

**测量时间**：
```javascript
performance.timing.domContentLoadedEventEnd
  - performance.timing.navigationStart

performance.timing.loadEventEnd
  - performance.timing.navigationStart
```

**知识点：** `DOMContentLoaded` `load 事件` `页面事件` `性能指标`

:::

---

### Q8: DNS 预解析、preconnect、prefetch、preload 有什么区别？

> **⭐ 简单 · 资源预加载**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**对比表格**：

| 类型 | 时机 | 目的 |
|------|------|------|
| `dns-prefetch` | 空闲时 | DNS 解析 |
| `preconnect` | 立即 | DNS+TCP+TLS |
| `prefetch` | 空闲时 | 获取资源 |
| `preload` | 立即 | 获取当前页资源 |

**dns-prefetch**：
```html
<link rel="dns-prefetch" href="//cdn.example.com">
<!-- 仅 DNS 解析 -->
```

**preconnect**：
```html
<link rel="preconnect" href="https://api.example.com">
<!-- DNS + TCP + TLS 握手 -->
```

**prefetch**：
```html
<link rel="prefetch" href="/next-page.html">
<!-- 可能用到的资源，空闲时加载 -->
```

**preload**：
```html
<link rel="preload" href="/font.woff2" as="font">
<!-- 立即加载，当前页必需 -->
```

**使用建议**：
```
首屏关键资源 → preload
下一页 → prefetch
第三方域名 → preconnect
不确定用不用 → dns-prefetch
```

**知识点：** `预加载` `preconnect` `prefetch` `preload` `性能优化`

:::

---

### Q9: 如何减少回流和重绘？

> **🔥 中等 · 性能优化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**触发回流的操作**：
```
- 增删 DOM 元素
- 修改尺寸（width, height, margin）
- 修改位置（top, left）
- 读取布局属性（offsetWidth）
```

**触发重绘的操作**：
```
- 修改颜色
- 修改背景
- 修改 visibility
```

**优化方案**：

**1. 批量修改**
```javascript
// ❌ 多次回流
element.style.width = '100px';
element.style.height = '200px';

// ✅ 使用 class
element.classList.add('new-size');
```

**2. 脱离文档流**
```css
.animated {
  position: absolute;
  /* 变动不影响其他元素 */
}
```

**3. 使用 transform**
```css
/* ✅ 只触发合成 */
.box {
  transform: translateX(100px);
}
```

**4. 避免强制同步布局**
```javascript
// ❌ 读写交替
const h = el.offsetHeight;
el.style.height = h + 10;

// ✅ 先读后写
const h = el.offsetHeight;
requestAnimationFrame(() => {
  el.style.height = h + 10;
});
```

**知识点：** `回流` `重绘` `性能优化` `批量操作` `强制同步布局`

:::

---

### Q10: 首屏优化有哪些方案？

> **🔥 中等 · 首屏优化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**首屏优化方案**：

**1. SSR（服务端渲染）**
```
HTML 包含完整内容
无需等待 JS 执行
```

**2. 关键 CSS 内联**
```html
<style>
  /* 首屏关键样式 */
  .header { ... }
</style>
<link rel="preload" href="main.css" as="style">
```

**3. 资源预加载**
```html
<link rel="preload" href="font.woff2" as="font">
<link rel="preload" href="hero.webp" as="image">
```

**4. 图片优化**
```
- WebP 格式
- 响应式图片
- 懒加载
```

**5. 代码分割**
```javascript
const Component = lazy(() => import('./Component'));
```

**6. 减少 HTTP 请求**
```
- 合并小文件
- 使用雪碧图
- HTTP/2 多路复用
```

**7. 使用 CDN**
```
静态资源走 CDN
边缘节点加速
```

**8. 骨架屏**
```
等待时显示占位结构
减少感知延迟
```

**性能指标**：
```
FCP < 1.8s
LCP < 2.5s
TTI < 3.8s
```

**知识点：** `首屏优化` `SSR` `关键 CSS` `资源预加载` `代码分割`

:::

---
---

### Q11: 从输入 URL 到页面渲染，哪些步骤可以优化？

> **🔥 中等 · 性能优化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**整个加载流程的关键优化点包括 DNS、连接、传输、解析、渲染各阶段。**

**1. 完整流程及优化点：**

```text
流程步骤：              优化方案：
1. DNS 解析            → DNS 预解析、DNS prefetch、HTTP/2
2. TCP 连接            → 连接复用、预连接、QUIC
3. TLS 握手            → TLS 1.3、0-RTT、OCSP Stapling
4. 服务器处理          → CDN、缓存、SSR
5. 下载资源            → 压缩、分块传输、HTTP/2 多路复用
6. 解析 HTML           → 流式渲染、增量加载
7. 构建 DOM/CSSOM      → 关键 CSS 内联、异步加载
8. 执行 JavaScript     → 代码分割、Tree Shaking、懒加载
9. 布局渲染            → 避免回流、GPU 加速
10. 事件绑定           → 事件委托、防抖节流
```

**2. DNS 优化：**

```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//cdn.example.com">

<!-- 预连接（DNS+TCP+TLS） -->
<link rel="preconnect" href="https://api.example.com">

<!-- DNS 缓存 -->
TTL 设置：CDN 域名设置较长 TTL（如 1 天）
本地缓存：操作系统和浏览器 DNS 缓存
```

**3. 连接优化：**

```javascript
// HTTP/2 连接复用
fetch("https://same-domain.com/api/1");
fetch("https://same-domain.com/api/2");
// 复用同一 TCP 连接

// 预连接关键资源
<link rel="preconnect" href="https://fonts.googleapis.com">

// QUIC（HTTP/3）减少握手
// 自动在支持 HTTP/3 的浏览器使用
```

**4. 传输优化：**

```http
响应头优化：
Content-Encoding: gzip/br        # 压缩
Cache-Control: max-age=31536000  # 强缓存
Last-Modified: ...               # 协商缓存
ETag: "abc123"                   # 资源标识
Link: </style.css>; rel=preload  # 预加载提示
```

**5. 解析渲染优化：**

```html
<!-- 关键 CSS 内联 -->
<style>/* 首屏关键样式 */</style>

<!-- 异步加载 CSS -->
<link rel="preload" href="style.css" as="style" onload="this.rel=stylesheet">

<!-- 异步加载 JS -->
<script defer src="app.js"></script>
<script async src="analytics.js"></script>

<!-- 图片懒加载 -->
<img loading="lazy" src="image.jpg">

<!-- 预加载关键资源 -->
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
```

**6. 性能监控指标：**

```javascript
// Core Web Vitals
const metrics = {
  FCP: getFCP(),      // 首次内容绘制 (<1.8s)
  LCP: getLCP(),      // 最大内容绘制 (<2.5s)
  CLS: getCLS(),      // 累积布局偏移 (<0.1)
  TTI: getTTI(),      // 可交互时间 (<3.8s)
  TBT: getTBT(),      // 总阻塞时间 (<200ms)
};
```

**知识点：** `性能优化` `DNS 预解析` `连接复用` `关键渲染路径` `资源加载` `Core Web Vitals`

:::

---

### Q12: 浏览器的预解析和预加载机制？

> **🔥 中等 · 浏览器**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**浏览器通过预解析（Pre-scanning）和预加载（Preloading）提前发现并加载关键资源。**

**1. 预解析（Pre-scanning）：**

```text
工作原理：
1. HTML 解析器解析文档
2. 遇到外部资源（脚本、样式、图片）
3. 预解析器并行发现资源
4. 提前发起资源请求

发现资源：
<link rel="stylesheet">
<script src="...">
<img src="...">
@import url(...) (CSS 中)
background: url(...) (CSS 中)

不会发现：
JavaScript 动态创建的元素
CSS 中的条件加载
DOM 操作后添加的资源
```

**2. 预加载提示（Resource Hints）：**

```html
<!-- dns-prefetch: DNS 预解析 -->
<link rel="dns-prefetch" href="//cdn.example.com">

<!-- preconnect: 预连接（DNS+TCP+TLS） -->
<link rel="preconnect" href="https://api.example.com">

<!-- prefetch: 预取资源（空闲时） -->
<link rel="prefetch" href="/next-page.css">

<!-- preload: 预加载当前页面必需资源 -->
<link rel="preload" href="font.woff2" as="font" type="font/woff2">

<!-- prerender: 预渲染完整页面 -->
<link rel="prerender" href="/next-page.html">

<!-- modulepreload: 预加载 ES 模块 -->
<link rel="modulepreload" href="module.js">
```

**3. 各种预加载对比：**

| 类型 | 用途 | 优先级 | 使用时机 |
|------|------|--------|----------|
| dns-prefetch | DNS 解析 | 低 | 早期发现域名 |
| preconnect | 建立连接 | 中 | 确定要用该源 |
| prefetch | 预取资源 | 低 | 导航后可能用 |
| preload | 预加载资源 | 高 | 当前页必需 |
| prerender | 预渲染页面 | 最高 | 确定要访问 |

**4. 使用示例：**

```html
<head>
  <!-- 关键字体预加载 -->
  <link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>
  
  <!-- 关键 CSS 预加载 -->
  <link rel="preload" href="critical.css" as="style">
  
  <!-- CDN 预连接 -->
  <link rel="preconnect" href="https://cdn.example.com">
  
  <!-- 下页预取 -->
  <link rel="prefetch" href="/next-page.js">
</head>
```

**5. 预加载扫描器限制：**

```text
不会预加载：
- <script> 在<noscript>中
- 动态创建的<script>
- 条件注释中的资源
- 隐藏的<img>（某些浏览器）
- CSS 中的@import

解决方案：
- 使用<link rel="preload">
- 关键资源高位插入
- 避免 CSS @import
```

**知识点：** `预解析` `预加载` `Resource Hints` `性能优化` `关键资源`

:::

---

### Q13: Service Worker 在页面加载过程中扮演什么角色？

> **🔥 中等 · Service Worker**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Service Worker 作为网络代理，可以拦截和处理所有网络请求，实现离线缓存和加载优化。**

**1. Service Worker 生命周期：**

```text
安装（Install）:
  - 首次注册或脚本变更
  - 缓存关键资源（precache）
  - 激活前的准备阶段

激活（Activate）:
  - 清理旧缓存
  - 接管所有受控页面
  - 开始拦截请求

空闲（Idle）:
  - 等待事件触发
  - 可能被浏览器终止

终止（Terminated）:
  - 长时间空闲
  - 内存压力

事件驱动唤醒：
  - fetch: 拦截网络请求
  - message: 接收消息
  - sync: 后台同步
```

**2. 页面加载拦截：**

```javascript
// Service Worker 注册
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

// sw.js - 安装时缓存
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll([
        "/",
        "/index.html",
        "/styles.css",
        "/app.js",
      ]);
    })
  );
});

// 拦截请求
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**3. 缓存策略：**

| 策略 | 适用场景 | 实现方式 |
|------|----------|----------|
| Cache First | 静态资源 | `caches.match()` → `fetch()` |
| Network First | API 请求 | `fetch()` → `caches.match()` |
| Stale While Revalidate | 图片等 | 立即返回缓存，后台更新 |
| Cache Only | 离线资源 | `caches.match()`  |
| Network Only | 实时数据 | `fetch()` |

**4. 预缓存策略：**

```javascript
// Precache 关键资源
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE_VERSION).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});
```

**5. 加载性能提升：**

```text
有 Service Worker（首次）：
1. 安装 SW (~50ms)
2. 缓存资源 (~100ms)
3. 加载页面（来自网络，~500ms）
总：~650ms

有 Service Worker（后续）:
1. SW 拦截请求
2. 从缓存返回 (~10ms)
总：~10ms（提升 50 倍）

优势：
✅ 离线可用
✅ 加载极快
✅ 节省流量
✅ 降低服务器压力
```

**知识点：** `Service Worker` `离线缓存` `请求拦截` `PWA` `缓存策略` `预缓存`

:::

