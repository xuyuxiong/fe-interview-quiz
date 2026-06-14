---
title: 浏览器渲染原理
description: 关键渲染路径、DOM/CSSOM/RenderTree、重排重绘触发条件与优化、合成层/GPU 加速、RAIL 模型、渲染进程线程
---

# 浏览器渲染原理

理解浏览器渲染机制是前端性能优化的核心基础。

---

### Q1: 请描述浏览器从接收到 HTML 到显示页面的完整渲染流程

> **🔥 中等 · 关键渲染路径**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**关键渲染路径（Critical Rendering Path）包含以下步骤：**

1. **解析 HTML 构建 DOM 树**
   - 浏览器逐字节解析 HTML
   - 将标签转换为 DOM 节点
   - 遇到 `<script>` 会阻塞解析（除非 async/defer）

2. **解析 CSS 构建 CSSOM 树**
   - CSS 解析不会阻塞 HTML 解析，但会阻塞渲染
   - CSSOM 包含每个节点的样式信息
   - CSS 是阻塞渲染的资源

3. **合并 DOM + CSSOM 生成 Render Tree**
   - 只包含可见节点（排除 display:none）
   - 包含节点的样式和几何信息

4. **Layout（布局/回流）**
   - 计算每个节点在视口中的精确位置和大小
   - 从 root 开始递归计算

5. **Paint（绘制）**
   - 将 Render Tree 转换为屏幕上的像素
   - 填充颜色、文字、图片、边框等

6. **Composite（合成）**
   - 将多个图层合并输出到屏幕
   - GPU 加速合成

```
HTML → DOM ─┐
            ├→ Render Tree → Layout → Paint → Composite → 屏幕
CSS → CSSOM ┘
```

**知识点：** `关键渲染路径` `DOM` `CSSOM` `Render Tree` `Layout` `Paint` `Composite`

:::

---

### Q2: DOM 树、CSSOM 树和 Render Tree 有什么区别？

> **⭐ 简单 · 渲染树**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 特性 | DOM 树 | CSSOM 树 | Render Tree |
|------|--------|----------|-------------|
| **来源** | HTML 解析 | CSS 解析 | DOM + CSSOM 合并 |
| **内容** | 所有 HTML 元素 | 所有 CSS 规则 | 可见元素及样式 |
| **包含隐藏元素** | 是 | 是 | 否（排除 display:none） |
| **结构** | 文档结构 | 样式规则层级 | 可视化的层级结构 |
| **阻塞渲染** | - | 是 | - |

**示例：**
```html
<div>
  <p>可见</p>
  <span style="display:none">隐藏</span>
</div>
```
- DOM 树：包含 div、p、span 所有节点
- Render Tree：只包含 div 和 p，排除 span

**知识点：** `DOM 树` `CSSOM` `Render Tree` `可见性`

:::

---

### Q3: 什么是回流（Reflow）？什么操作会触发回流？

> **🔥 中等 · 回流**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**回流（Reflow/Layout）**：当元素的几何属性（位置、尺寸）发生变化时，浏览器需要重新计算布局的过程。

**触发回流的常见操作：**

1. **DOM 变更**
   - 添加/删除可见 DOM 元素
   - 元素位置变化（DOM 顺序调整）

2. **尺寸变化**
   - 修改 `width`、`height`、`margin`、`padding`
   - 修改 `border-width`

3. **位置变化**
   - 修改 `top`、`left`、`right`、`bottom`
   - 修改 `position` 属性

4. **内容变化**
   - 修改文字内容
   - 修改 `font-size`、`font-family`
   - 文字换行

5. **窗口操作**
   - 调整浏览器窗口大小
   - 滚动页面（某些情况）

6. **读取布局属性**（强制同步回流）
   - `offsetWidth`、`offsetHeight`
   - `clientTop`、`clientLeft`
   - `getBoundingClientRect()`
   - `scrollTop`、`scrollLeft`

**优化建议：**
```javascript
// ❌ 多次触发回流
element.style.width = '100px';
element.style.height = '200px';
element.style.margin = '10px';

// ✅ 批量修改（只触发一次回流）
element.style.cssText = 'width:100px;height:200px;margin:10px;';

// ✅ 使用 class
element.classList.add('new-size');
```

**知识点：** `回流` `重排` `布局计算` `性能优化`

:::

---

### Q4: 什么是重绘（Repaint）？回流和重绘的区别是什么？

> **⭐ 简单 · 重绘**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**重绘（Repaint/Paint）**：当元素的外观发生变化但不影响布局时，浏览器重新绘制元素的过程。

**触发重绘的操作：**
- 修改 `color`、`background-color`
- 修改 `visibility`（从 hidden 到 visible）
- 修改 `outline`
- 修改 `box-shadow`

**回流 vs 重绘对比：**

| 特性 | 回流（Reflow） | 重绘（Repaint） |
|------|---------------|----------------|
| **触发条件** | 几何属性变化 | 外观变化 |
| **计算成本** | 高（需重新布局） | 中（只需重画） |
| **影响范围** | 可能影响子元素和兄弟元素 | 只影响当前元素 |
| **性能消耗** | 非常昂贵 | 较昂贵 |
| **关系** | 回流一定会触发重绘 | 重绘不一定会回流 |

**优化原则：**
- 避免频繁触发回流
- 使用 transform/opacity 做动画（只触发合成）
- 批量 DOM 操作

**知识点：** `重绘` `回流` `性能对比` `渲染优化`

:::

---

### Q5: 如何避免或减少回流和重绘？请列举至少 5 种优化方案

> **💀 困难 · 优化实践**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**10 种避免回流重绘的优化方案：**

1. **批量修改样式**
```javascript
// ❌ 多次回流
element.style.width = '100px';
element.style.height = '200px';

// ✅ 批量修改
element.style.cssText = 'width:100px;height:200px;';
```

2. **使用 CSS class 替代内联样式**
```javascript
// ✅ 推荐
element.classList.add('active');
```

3. **对复杂动画使用 position: fixed/absolute**
   - 脱离文档流，回流不影响其他元素

4. **使用 transform 替代定位属性**
```css
/* ❌ 触发回流 */
.box { left: 100px; }

/* ✅ 只触发合成 */
.box { transform: translateX(100px); }
```

5. **避免频繁读取布局属性**
```javascript
// ❌ 每次读取都触发回流
for(let i = 0; i < items.length; i++) {
  items[i].style.top = items[i].offsetTop + 10 + 'px';
}

// ✅ 先缓存，再批量写入
const positions = items.map(item => item.offsetTop);
for(let i = 0; i < items.length; i++) {
  items[i].style.top = positions[i] + 10 + 'px';
}
```

6. **使用 DocumentFragment 批量添加 DOM**
```javascript
const fragment = document.createDocumentFragment();
items.forEach(item => fragment.appendChild(item));
container.appendChild(fragment); // 只触发一次回流
```

7. **隐藏元素后批量操作**
```javascript
element.style.display = 'none';
// ... 多次修改
element.style.display = 'block'; // 只触发一次回流
```

8. **使用虚拟列表渲染大数据**
   - 只渲染可视区域的 DOM

9. **使用 will-change 提前告知浏览器**
```css
.box {
  will-change: transform, opacity;
}
```

10. **使用 CSS Containment**
```css
.box {
  contain: layout style paint;
}
```

**知识点：** `回流优化` `重绘优化` `批量操作` `transform` `will-change`

:::

---

### Q6: 什么是合成层（Compositing Layer）？如何创建独立的合成层？

> **💀 困难 · 合成层**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**合成层**：浏览器为某些元素创建的独立图层，可以单独进行合成操作，由 GPU 处理，避免影响其他元素。

**创建独立合成层的方式：**

```css
/* 1. 3D 变换 */
.layer {
  transform: translateZ(0);
  transform: translate3d(0, 0, 0);
}

/* 2. 指定 will-change */
.layer {
  will-change: transform, opacity;
}

/* 3. 特定定位 */
.layer {
  position: fixed;
}
/* position: sticky 也会创建 */

/* 4. 视频、Canvas、iframe */
<video>, <canvas>, <iframe>

/* 5. 不透明度 */
.layer {
  opacity: 0.9; /* 小于 1 */
}

/* 6. CSS 滤镜 */
.layer {
  filter: blur(5px);
}

/* 7. 负 z-index 的兄弟元素 */
```

**Chrome DevTools 查看合成层：**
- Layers 面板
- Rendering 面板 → Paint flashing

**注意事项：**
- 合成层不是越多越好
- 每层都占用显存和内存
- 过多层会增加合成开销
- 合理使用 will-change，动画结束应移除

**知识点：** `合成层` `GPU 加速` `translate3d` `will-change` `图层管理`

:::

---

### Q7: 什么是 RAIL 模型？如何用 RAIL 指导性能优化？

> **🔥 中等 · RAIL 模型**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**RAIL 模型**是 Google 提出的性能优化模型，将用户体验分为四个阶段：

| 阶段 | 含义 | 性能目标 | 优化策略 |
|------|------|----------|----------|
| **R**esponse（响应） | 用户交互到界面响应 | < 100ms | 使用 requestAnimationFrame，避免长任务 |
| **A**nimation（动画） | 动画和过渡效果 | 60 FPS (16.6ms/帧) | 使用 transform/opacity，避免回流重绘 |
| **I**dle（空闲） | 主线程空闲时间 | - | 延迟加载，后台任务，requestIdleCallback |
| **L**oad（加载） | 页面加载完成 | FCP < 1s, LCP < 2.5s | 关键资源优先，代码分割，CDN |

**响应优化（Response < 100ms）：**
```javascript
// 将耗时任务拆分为小块
function chunkedList(items, callback) {
  let index = 0;
  function processChunk() {
    const start = performance.now();
    while (index < items.length && performance.now() - start < 50) {
      callback(items[index++]);
    }
    if (index < items.length) {
      requestAnimationFrame(processChunk);
    }
  }
  processChunk();
}
```

**动画优化（Animation 60 FPS）：**
```css
/* 使用 GPU 加速的属性 */
.bad {
  left: 100px; /* 触发回流 */
}
.good {
  transform: translateX(100px); /* 只触发合成 */
}
```

**空闲调度（Idle）：**
```javascript
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    // 非关键任务
    loadAnalytics();
  });
}
```

**知识点：** `RAIL` `性能指标` `响应时间` `动画优化` `空闲调度`

:::

---

### Q8: 浏览器渲染进程中有哪些主要线程？各自职责是什么？

> **💀 困难 · 进程架构**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**浏览器多进程架构中的渲染进程包含以下线程：**

| 线程 | 职责 | 特点 |
|------|------|------|
| **主线程（Main Thread）** | 执行 JavaScript、DOM 操作、样式计算、布局、绘制 | 单线程，任务排队执行 |
| **合成线程（Compositor Thread）** | 处理图层合成、滚动、动画 | 独立于主线程，保障流畅滚动 |
| **光栅线程（Raster Thread）** | 将图层转换为位图 | 多线程并行，GPU 加速 |
| **网络线程（Network Thread）** | 处理网络请求（每个进程共享） | 异步处理 |
| **存储线程（Storage Thread）** | 处理 localStorage、IndexedDB 等 | - |

**多进程架构：**
- **Browser Process**：浏览器主进程，管理 UI、导航、网络等
- **Renderer Process**：渲染进程（每个标签页一个进程）
- **GPU Process**：GPU 进程，处理 3D 和合成
- **Network Service**：网络服务进程

**为什么需要多线程？**
1. **避免阻塞**：合成线程独立处理滚动，避免 JS 阻塞
2. **并行处理**：光栅化可以多线程并发
3. **稳定性**：单标签页崩溃不影响其他
4. **安全性**：进程隔离提供安全沙箱

**主线程任务优先级：**
```
1. 用户输入处理（最高）
2. 动画帧（requestAnimationFrame）
3. setTimeout / setInterval
4. setTimeout 回调
5. 微任务（Promise.then、MutationObserver）
6. 渲染任务
```

**知识点：** `浏览器线程` `多进程架构` `主线程` `合成线程` `事件循环`

:::

---

### Q9: 什么是 GPU 加速？哪些 CSS 属性可以触发 GPU 加速？

> **🔥 中等 · GPU 加速**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**GPU 加速**：将渲染任务从 CPU 转移到 GPU 处理，利用 GPU 的并行计算能力提升性能。

**触发 GPU 加速的 CSS 属性：**

| 属性 | 说明 | 性能 |
|------|------|------|
| `transform` | 3D 变换/2D 变换 | ⭐⭐⭐ 最推荐 |
| `opacity` | 透明度变化 | ⭐⭐⭐ 最推荐 |
| `filter` | 高斯模糊等滤镜 | ⭐⭐ |
| `will-change` | 提前告知浏览器 | ⭐⭐ |
| `contain` | CSS Containment | ⭐⭐ |

**GPU 加速原理：**
1. 创建合成层（Compositing Layer）
2. 将该层内容上传到 GPU 显存
3. 动画时只更新变换矩阵，不重新绘制
4. 合成线程直接操作 GPU

**使用示例：**
```css
/* 触发动画 GPU 加速 */
.animated-box {
  will-change: transform, opacity;
  /* 或者 */
  transform: translateZ(0);
  /* 或者 */
  backface-visibility: hidden;
}

/* 动画结束后的清理 */
.animated-box.done {
  will-change: auto;
}
```

**注意事项：**
- 不要滥用 GPU 加速（占用显存）
- will-change 应在动画前添加，动画后移除
- translateZ(0) 可以强制创建合成层

**知识点：** `GPU 加速` `硬件加速` `transform` `opacity` `合成层`

:::

---

### Q10: requestAnimationFrame 与 setTimeout/setInterval 做动画有什么区别？

> **🔥 中等 · 动画调度**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 特性 | requestAnimationFrame | setTimeout/setInterval |
|------|----------------------|------------------------|
| **执行时机** | 下一帧渲染前（~16.6ms） | 按指定延迟执行 |
| **频率** | 跟随屏幕刷新率（60Hz） | 固定时间间隔 |
| **性能** | 自动节流，页面不可见时暂停 | 持续执行，浪费资源 |
| **执行上下文** | 与渲染同步，避免抖动 | 可能与渲染不同步 |
| **浏览器优化** | 批量调用，减少回流 | 无特殊优化 |
| **返回值** | requestID（用于取消） | timeoutID |

**rAF 优势：**
1. **自动同步刷新率**：避免掉帧和画面撕裂
2. **页面不可见时暂停**：节省 CPU 和电量
3. **批量执行**：多次 rAF 合并为一次调用
4. **同步渲染周期**：在 Layout 和 Paint 之前执行

**使用示例：**
```javascript
// ❌ 使用 setTimeout
function animateWithTimeout() {
  element.style.transform = `translateX(${progress}px)`;
  progress++;
  if (progress < 100) {
    setTimeout(animateWithTimeout, 16); // 不精确
  }
}

// ✅ 使用 requestAnimationFrame
function animateWithRAF() {
  element.style.transform = `translateX(${progress}px)`;
  progress++;
  if (progress < 100) {
    requestAnimationFrame(animateWithRAF); // 精确同步
  }
}
requestAnimationFrame(animateWithRAF);
```

**适配高刷新率屏幕：**
```javascript
function animate(timestamp) {
  if (!startTime) startTime = timestamp;
  const elapsed = timestamp - startTime;
  
  // 基于时间而不是帧数
  element.style.transform = `translateX(${elapsed / 10}px)`;
  
  if (elapsed < 1000) {
    requestAnimationFrame(animate);
  }
}
requestAnimationFrame(animate);
```

**知识点：** `requestAnimationFrame` `动画性能` `屏幕刷新率` `渲染同步`

:::

---

### Q11: 什么是关键渲染路径（Critical Rendering Path）？如何优化 CRC？

> **💀 困难 · 关键渲染路径**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**关键渲染路径（Critical Rendering Path, CRP）**：浏览器将 HTML、CSS、JavaScript 转换为屏幕像素的整个过程。

**CRP 的三个核心部分：**
1. **关键资源**：阻塞渲染的资源（CSS、同步 JS）
2. **关键路径长度**：加载关键资源所需的往返次数
3. **关键字节数**：关键资源的总大小

**优化策略：**

**1. 减少关键资源数量**
```html
<!-- ❌ 阻塞渲染 -->
<link rel="stylesheet" href="non-critical.css">
<script src="non-critical.js"></script>

<!-- ✅ 非关键资源异步加载 -->
<link rel="preload" href="critical.css" as="style" onload="this.rel='stylesheet'">
<script src="non-critical.js" defer></script>
```

**2. 缩短关键路径长度**
```html
<!-- 使用 preload 提前加载 -->
<link rel="preload" href="font.woff2" as="font" crossorigin>
<link rel="preconnect" href="https://cdn.example.com">
<link rel="dns-prefetch" href="https://analytics.example.com">
```

**3. 减少关键字节数**
- CSS/JS 压缩
- 移除未使用的 CSS
- Tree Shaking
- 代码分割

**4. 内联关键 CSS**
```html
<head>
  <style>
    /* 首屏关键样式 */
    .hero { ... }
    .nav { ... }
  </style>
  <link rel="preload" href="rest.css" as="style" onload="this.rel='stylesheet'">
</head>
```

**5. 优化 JavaScript**
```html
<!-- 使用 defer 代替同步加载 -->
<script src="app.js" defer></script>
<!-- 或使用 module -->
<script type="module" src="app.js"></script>
```

**知识点：** `关键渲染路径` `CRP 优化` `preload` `defer` `关键 CSS`

:::

---

### Q12: 浏览器如何处理 CSS 阻塞？有哪些解决方案？

> **🔥 中等 · CSS 优化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CSS 阻塞问题**：CSSOM 构建会阻塞渲染，浏览器会等待所有 CSS 加载完成才渲染页面。

**为什么 CSS 阻塞渲染？**
- 浏览器需要完整的 CSSOM 才能构建 Render Tree
- 避免 FOUC（Flash of Unstyled Content）

**解决方案：**

**1. 内联关键 CSS**
```html
<head>
  <style>
    /* 只内联首屏关键样式 */
    .header, .hero, .nav { ... }
  </style>
  <link rel="stylesheet" href="main.css" media="print" onload="this.media='all'">
</head>
```

**2. 使用媒体查询**
```html
<!-- 非阻塞加载，仅打印时使用 -->
<link rel="stylesheet" href="print.css" media="print">
<!-- 非阻塞加载，特定尺寸使用 -->
<link rel="stylesheet" href="large.css" media="(min-width: 1000px)">
```

**3. 使用 preload + onload**
```html
<link rel="preload" href="style.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="style.css"></noscript>
```

**4. 异步加载 CSS（JS 方式）**
```javascript
function loadCSS(href) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}
// DOM 加载后调用
document.addEventListener('DOMContentLoaded', () => {
  loadCSS('non-critical.css');
});
```

**5. CSS 拆分策略**
- critical.css：内联首屏样式
- main.css：异步加载主体样式
- print.css：按需加载打印样式

**知识点：** `CSS 阻塞` `关键 CSS` `媒体查询` `preload` `FOUC`

:::

---

### Q13: 什么是 FOUC？如何避免？

> **⭐ 简单 · 样式闪烁**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**FOUC（Flash of Unstyled Content）**：页面加载时短暂显示无样式的 HTML 内容，然后突然显示正确样式的现象。

**产生原因：**
1. CSS 文件加载慢于 HTML 解析
2. CSS 放在 body 底部
3. 异步加载 CSS 时的短暂空白期
4. 动态修改 class 但 CSS 未加载

**避免方法：**

**1. CSS 放在 `<head>` 中**
```html
<head>
  <link rel="stylesheet" href="style.css"> <!-- ✅ 正确位置 -->
</head>
<body>
  <!-- ❌ 错误做法 -->
  <link rel="stylesheet" href="style.css">
</body>
```

**2. 内联关键 CSS**
```html
<head>
  <style>
    /* 首屏关键样式 */
    body { font-family: system-ui; margin: 0; }
    .header { background: #333; color: white; }
  </style>
  <link rel="stylesheet" href="main.css">
</head>
```

**3. 使用 visibility 隐藏内容直到 CSS 加载**
```html
<style>
  body { visibility: hidden; }
  body.loaded { visibility: visible; }
</style>
<script>
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
  });
</script>
```

**4. 预加载关键 CSS**
```html
<link rel="preload" href="critical.css" as="style">
```

**5. 使用 Critical CSS 工具**
- critical（NPM 包）
- Penthouse
- Critters（Webpack 插件）

**知识点：** `FOUC` `样式闪烁` `关键 CSS` `CSS 加载` `首屏优化`

:::

---

### Q14: 浏览器如何解析和执行 JavaScript？async 和 defer 有什么区别？

> **🔥 中等 · JS 加载**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**JS 加载执行流程：**
1. HTML 解析遇到 `<script>` 标签
2. 暂停 HTML 解析
3. 下载 JS 文件（如果是外部脚本）
4. 执行 JavaScript
5. 继续 HTML 解析

**script 标签属性对比：**

| 属性 | 无属性 | async | defer | module |
|------|--------|-------|-------|--------|
| **下载时机** | 解析到标签时 | 立即下载 | 立即下载 | 立即下载 |
| **执行时机** | 立即下载执行 | 下载完立即执行 | DOMContentLoaded 后执行 | DOMContentLoaded 后执行 |
| **阻塞解析** | 是 | 否 | 否 | 否 |
| **执行顺序** | 源码顺序 | 不确定 | 保持顺序 | 保持顺序 |
| **适用场景** | 同步依赖脚本 | 独立脚本（统计） | 依赖 DOM 的脚本 | ES6 模块 |

**执行时序图：**
```
HTML:  [==== parsing ====][== DOMContentLoaded ==][=== load ===]
无属性: [==JS1==][==JS2==]
async:     [JS2] [JS1]  (顺序不确定)
defer:                [JS1][JS2] (有序)
module:               [JS1][JS2] (有序，自动 defer)
```

**使用建议：**
```html
<!-- ✅ 统计脚本，独立无依赖 -->
<script async src="analytics.js"></script>

<!-- ✅ 业务脚本，依赖 DOM -->
<script defer src="app.js"></script>

<!-- ✅ ES6 模块，自动 defer -->
<script type="module" src="app.js"></script>

<!-- ❌ 避免阻塞渲染 -->
<script src="heavy-lib.js"></script>
```

**知识点：** `script 加载` `async` `defer` `模块` `阻塞解析`

:::

---

### Q15: 什么是重排抖动（Layout Thrashing）？如何检测和避免？

> **💀 困难 · 性能问题**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**重排抖动（Layout Thrashing）**：在 JavaScript 中交替执行 DOM 读取和写入操作，导致浏览器被迫同步执行多次回流的现象。

**问题代码：**
```javascript
// ❌ 导致 Layout Thrashing
function resizeItems() {
  for (let i = 0; i < items.length; i++) {
    // 读取布局属性 → 强制同步回流
    const height = items[i].offsetHeight;
    // 写入样式 → 触发回流
    items[i].style.height = height + 10 + 'px';
  }
  // 循环 n 次 = 触发 n 次回流！
}
```

**检测方式：**

**1. Chrome DevTools Performance**
- 录制页面操作
- 查找黄色的「Layout」块
- 查看 Forced Synchronous Layouts 警告

**2. 代码审查**
- 在循环中读取 offsetWidth/offsetHeight
- 在循环中调用 getBoundingClientRect()
- 读写交替执行

**优化方案：**

**1. 批量读取，批量写入**
```javascript
// ✅ 推荐做法
function resizeItemsOptimized() {
  // 第一步：批量读取
  const heights = items.map(item => item.offsetHeight);
  
  // 第二步：批量写入
  heights.forEach((height, i) => {
    items[i].style.height = height + 10 + 'px';
  });
  // 只触发 2 次回流
}
```

**2. 使用请求动画帧**
```javascript
function animateItem(item, targetHeight) {
  const startHeight = item.offsetHeight;
  const startTime = performance.now();
  
  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / 300, 1);
    
    // 只读取一次，写入多次但批次执行
    item.style.height = startHeight + (targetHeight - startHeight) * progress + 'px';
    
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}
```

**3. 使用 CSS 动画替代 JS 动画**
```css
@keyframes expand {
  from { height: 100px; }
  to { height: 200px; }
}
.item { animation: expand 0.3s ease-out; }
```

**知识点：** `Layout Thrashing` `强制同步布局` `性能检测` `批量操作`

:::

---
### Q16: setTimeout 为什么会造成内存泄漏？如何避免？

> **🔥 中等 · 浏览器**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**内存泄漏原因：** setTimeout 的回调持有对外部变量的闭包引用，阻止垃圾回收。

```js
// 典型泄漏场景：组件销毁但定时器仍在运行
class MyComponent {
  constructor() {
    this.data = new Array(1000000).fill('x') // 大数据
    this.timer = setTimeout(() => {
      // 回调持有 this.data 的引用
      console.log(this.data.length)
    }, 5000)
  }

  destroy() {
    // ❌ 没有清除定时器！this.data 无法被 GC
  }
}

// 正确做法
class MyComponent {
  destroy() {
    clearTimeout(this.timer) // ✅ 清除定时器，释放闭包引用
    this.data = null         // ✅ 解除引用
  }
}
```

**React 中常见泄漏：**

```jsx
function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
    // ❌ 缺少 cleanup → 组件卸载后仍在更新状态
  }, [])

  // ✅ 正确：清理定时器
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1)
    }, 1000)
    return () => clearInterval(timer) // cleanup
  }, [])
}
```

**常见泄漏模式：**

| 模式 | 原因 | 解决 |
|------|------|------|
| 未 clearTimeout | 闭包持有引用 | 组件卸载时清除 |
| 循环定时器 | setInterval 持续引用 | clearInterval |
| 闭包捕获大对象 | 回调函数引用外部变量 | 解除引用/WeakRef |
| DOM 引用 | 定时器操作已移除DOM | 操作前检查DOM存在性 |

**知识点：** `内存泄漏` `setTimeout` `闭包` `clearTimeout` `useEffect cleanup`

:::

### Q17: onload 和 DOMContentLoaded 的区别？

> **⭐ 简单 · 浏览器**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 事件 | 触发时机 | 包含 |
|------|---------|------|
| DOMContentLoaded | HTML 解析完，DOM 树构建完成 | 不等样式表/图片/子框架 |
| load | 所有资源加载完成 | 图片/CSS/iframe/字体等 |

```text
HTML 下载 → DOM 解析 → DOMContentLoaded → 加载子资源 → load
  |                                           |                    |
  |<---------- 可操作 DOM ----------->|         |                    |
  |<-------------------- 页面完全就绪 -------------------->|
```

```js
// DOMContentLoaded — 最早可操作 DOM 的时机
document.addEventListener('DOMContentLoaded', () => {
  // DOM 已就绪，可以操作元素
  document.getElementById('app') // ✅ 可以获取
  // 但图片可能还没加载完
  const img = document.querySelector('img')
  console.log(img.complete) // 可能 false
})

// load — 所有资源就绪
window.addEventListener('load', () => {
  // 图片、CSS、iframe 全部加载完
  const img = document.querySelector('img')
  console.log(img.complete) // true
  // 可以获取图片尺寸
  console.log(img.naturalWidth) // ✅
})

// 顺序：DOMContentLoaded → load
// 如果 CSS 中有 @font-face，DOMContentLoaded 不等字体加载
// 如果 <script> 没有 async/defer，会阻塞 DOMContentLoaded
```

**知识点：** `DOMContentLoaded` `onload` `页面加载` `事件顺序`

:::

### Q18: 如何排查内存泄漏？有哪些工具？

> **🔥 中等 · 浏览器**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Chrome DevTools 三大工具：**

**1. Performance Monitor（实时监控）**

```text
打开: F12 → More tools → Performance Monitor
关注: JS Heap Size — 如果持续增长不回落 = 泄漏
```

**2. Memory — Heap Snapshot（堆快照对比）**

```text
步骤:
1. F12 → Memory → Heap snapshot
2. 拍第一次快照
3. 执行操作（如切换页面/打开关闭弹窗）
4. 拍第二次快照
5. 选择 Comparison 视图，对比两次差异
6. 关注 Delta(新增) 列，找到持续增长的对象
```

**3. Memory — Allocation Timeline（分配时间线）**

```text
步骤:
1. F12 → Memory → Allocation instrumentation on timeline
2. 开始录制
3. 执行操作
4. 停止录制
5. 蓝色柱状 = 未回收的分配 = 可能泄漏
6. 点击柱状查看具体对象
```

**代码层面的检查：**

```js
// 1. 监控 DOM 节点数
setInterval(() => {
  console.log('DOM 节点数:', document.querySelectorAll('*').length)
}, 5000)

// 2. performance.memory（Chrome）
setInterval(() => {
  console.log('堆使用:', (performance.memory.usedJSHeapSize / 1048576).toFixed(1), 'MB')
}, 5000)

// 3. WeakRef 检测对象是否被 GC
const ref = new WeakRef(bigObject)
setTimeout(() => {
  if (ref.deref()) console.log('对象未被回收 — 可能泄漏')
  else console.log('对象已回收 ✅')
}, 10000)
```

**常见泄漏排查清单：**

| 检查项 | 方法 |
|--------|------|
| 未清除的定时器 | 搜索 setInterval/setTimeout |
| 未移除的事件监听 | 搜索 addEventListener |
| 闭包引用 | Heap Snapshot 查 Retainers |
| 脱离 DOM 的引用 | 搜索变量引用已移除的 DOM |
| 全局变量 | 搜索 window.xxx |

**知识点：** `内存泄漏排查` `Heap Snapshot` `Performance Monitor` `Chrome DevTools` `WeakRef`

:::

---

### Q19: GPU 加速的原理是什么？哪些 CSS 属性触发 GPU 加速？

> **🔥 中等 · 渲染性能**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**GPU 加速通过将渲染任务从 CPU 转移到 GPU 来提升性能，GPU 擅长并行处理图形计算。**

**1. GPU 加速原理：**

```text
CPU 渲染 vs GPU 渲染：

CPU（串行处理）:
┌──────────────┐
│  计算样式    │
│  计算布局    │
│  绘制图层    │ → 逐像素处理
│  合成        │
└──────────────┘

GPU（并行处理）:
┌──────────────┐
│  接收图层    │
│  并行处理像素 │ → 数千核心同时工作
│  合成输出    │
└──────────────┘
```

**2. 图层提升（Layer Promotion）：**

```text
普通元素：
- 在主图层绘制
- 回流重绘影响大

GPU 加速元素：
- 提升到独立图层
- 由 GPU 单独合成
- 不影响其他图层
```

**3. 触发 GPU 加速的 CSS 属性：**

```css
/* ✅ 推荐 - 仅触发合成 */
transform: translate3d(0, 0, 0);
transform: rotate(45deg);
transform: scale(1.1);
opacity: 0.8;
will-change: transform;

/* ✅ 3D 变换强制 GPU */
transform: translateZ(0);
transform: perspective(1000px);
backface-visibility: hidden;

/* ⚠️ 谨慎 - 可能触发分层 */
filter: blur(10px);
mix-blend-mode: multiply;
```

**4. 性能对比：**

```javascript
// ❌ 差 - 触发回流
element.style.left = "100px"; // 每帧触发 layout

// ✅ 好 - GPU 加速
element.style.transform = "translateX(100px)"; // 仅合成
```

**5. 强制启用 GPU 加速：**

```css
/* 3D 变换 hack */
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}

/* 动画优化 */
@keyframes slide {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
```

**6. 检测图层：**

```text
Chrome DevTools:
1. Layers 面板
2. 勾选 "Paint flash"
3. 查看图层边界

识别 GPU 图层：
- 独立边框显示
- 3D 视图可见高度
```

**知识点：** `GPU 加速` `图层提升` `transform` `合成` `渲染性能` `will-change`

:::

---

### Q20: will-change 属性如何使用？滥用有什么后果？

> **🔥 中等 · 性能优化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**will-change 提前告知浏览器元素的预期变化，但滥用会导致内存溢出和性能下降。**

**1. will-change 作用：**

```css
/* 告知浏览器即将变化的属性 */
.element {
  will-change: transform;
}

浏览器优化：
- 提前创建独立图层
- 预分配 GPU 资源
- 优化渲染路径
```

**2. 正确使用方式：**

```javascript
// ✅ 正确 - 动态添加移除
element.addEventListener("mouseenter", () => {
  element.style.willChange = "transform";
});

element.addEventListener("mouseleave", () => {
  element.style.willChange = "auto";
});

// ✅ 正确 - CSS 动画期间
.animated {
  will-change: transform, opacity;
  animation: slide 1s ease;
}
```

**3. 滥用后果：**

```text
问题 1：内存溢出
- 每个 will-change 创建新图层
- 每图层 ~几 MB 显存
- 过多图层导致内存耗尽

问题 2：性能下降
- 图层过多增加合成开销
- GPU 资源竞争
- 可能比不用更慢

问题 3：渲染延迟
- 图层创建需要时间
- 首屏可能变慢
```

**4. 使用限制：**

```css
/* ❌ 错误 - 全局应用 */
* {
  will-change: transform; /* 灾难！ */
}

/* ❌ 错误 - 永久应用 */
.element {
  will-change: transform; /* 一直占用资源 */
}

/* ❌ 错误 - 过多属性 */
.element {
  will-change: transform, opacity, filter, left, top; /* 太多 */
}

/* ✅ 正确 - 按需使用 */
.element {
  will-change: transform; /* 仅必要的 */
}
```

**5. 最佳实践：**

```javascript
// 1. 仅在动画前设置
const prepareAnimation = (el) => {
  el.style.willChange = "transform, opacity";
};

// 2. 动画后清除
const cleanupAnimation = (el) => {
  el.style.willChange = "auto";
};

// 3. 限制数量
// 页面上同时存在的 will-change 应 < 10

// 4. 只在动画期间
@keyframes slide {
  from { will-change: transform; }
  to { will-change: auto; }
}
```

**6. 替代方案：**

```css
/* 替代 1 - transform hack */
.animate {
  transform: translateZ(0);
}

/* 替代 2 - backface-visibility */
.animate {
  backface-visibility: hidden;
}

/* 替代 3 - 让浏览器自动优化 */
.animate {
  animation: slide 1s;
  /* 不指定 will-change */
}
```

**知识点：** `will-change` `图层优化` `性能陷阱` `GPU 加速` `内存管理`

:::

---

### Q21: 浏览器合成层的创建条件？

> **🔥 中等 · 渲染**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**浏览器根据特定条件自动创建合成层，满足条件的元素会提升到独立图层由 GPU 合成。**

**1. 自动创建条件：**

```css
/* 1. 3D 变换 */
transform: translateZ(0);
transform: rotate3d(1, 1, 0, 45deg);

/* 2. 视频/插件 */
<video>, <embed>, <object>

/* 3. 固定定位 */
position: fixed;

/* 4. will-change */
will-change: transform;

/* 5. 遮罩 */
mask: url(...);
mask-image: linear-gradient(...);

/* 6. 滤镜 */
filter: blur(10px);

/* 7. 混合模式 */
mix-blend-mode: multiply;

/* 8. 子元素有合成层 */
.position-relative {
  position: relative;
  z-index: 0; /* 子元素有合成层时 */
}

/* 9. iframe */
<iframe>

/* 10. 透明度动画 */
opacity: 0.9; /* 配合动画 */
```

**2. 合成层层级：**

```text
浏览器图层树：
Root Layer
├── Background Layer
├── Scrollbar Layer
├── Content Layers
│   ├── Layer 1 (合成层)
│   │   └── 子元素
│   ├── Layer 2 (合成层)
│   └── Layer 3 (普通层)
└── Overlay Layer
```

**3. 检测合成层：**

```text
Chrome DevTools:
1. DevTools → Rendering 面板
2. 勾选 "Layer borders"
3. 蓝色边框 = 合成层

查看 Layer 面板:
1. 查看 3D 视图
2. 独立图层有高度
```

**4. 性能影响：**

```text
优点：
✅ 独立绘制，不影响其他层
✅ GPU 加速合成
✅ 动画流畅

缺点：
❌ 每层占用显存 (~几 MB)
❌ 图层过多降低性能
❌ 层间通信开销
```

**5. 合理使用建议：**

```css
/* ✅ 适用场景 */
.modal {         /* 模态框 */
  position: fixed;
}

.video-player {  /* 视频 */
  transform: translateZ(0);
}

.animated-icon { /* 动画 */
  will-change: transform;
}

/* ❌ 避免 */
.list-item {     /* 大量重复元素 */
  will-change: transform; /* 会创建太多层 */
}
```

**知识点：** `合成层` `图层树` `GPU 合成` `渲染性能` `Layer`

:::

