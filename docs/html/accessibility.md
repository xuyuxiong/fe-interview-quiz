---
title: 可访问性 (a11y) 面试题
description: 无障碍访问核心概念，涵盖 WCAG、ARIA、键盘导航等 6 道关键面试题
---

# 可访问性 (a11y) 面试题

> **📚 共 6 题 · 简单 30% · 中等 50% · 困难 20%**

---

### Q1: WCAG 2.1 的核心原则是什么？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**WCAG 2.1 四大原则 (POUR):**

1. **可感知 (Perceivable)**
   - 提供文本替代方案（alt 文本）
   - 提供字幕等替代媒体
   - 可适应的内容布局

2. **可操作 (Operable)**
   - 键盘可操作性
   - 足够的阅读时间
   - 不用触发癫痫的内容

3. **可理解 (Understandable)**
   - 文本可读易懂
   - 可预测的网页行为
   - 输入帮助

4. **健壮 (Robust)**
   - 与辅助技术兼容
   - 遵循标准 HTML

**三个一致性等级:**

| 等级 | 说明 | 最低要求 |
|------|------|----------|
| A | 基本 | 4 项 |
| AA | 中等 | 13 项 |
| AAA | 高级 | 23 项 |

**知识点：** `WCAG` `无障碍原则`

:::

---

### Q2: ARIA 属性有哪些？如何使用？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**常用 ARIA 角色:**

```html
<div role="alert">错误消息</div>
<div role="navigation">导航</div>
<div role="main">主要内容</div>
<div role="dialog" aria-modal="true">对话框</div>
```

**常用 ARIA 属性:**

```html
<!-- label 关联 -->
<button aria-label="关闭">✕</button>
<span id="label1">用户名</span>
<input aria-labelledby="label1" />

<!-- 描述 -->
<input aria-describedby="desc" />
<p id="desc">请输入有效的邮箱</p>

<!-- 状态 -->
<button aria-pressed="true">粗体</button>
<button aria-expanded="false" aria-controls="menu">菜单</button>
<input aria-invalid="true" aria-errormessage="error" />
<span id="error" role="alert">格式错误</span>

<!-- 隐藏 -->
<span aria-hidden="true">装饰图标</span>
```

**表单无障碍:**

```html
<label for="name">姓名</label>
<input 
  id="name" 
  type="text" 
  required 
  aria-required="true"
/>
```

**知识点：** `ARIA` `role` `无障碍标签`

:::

---

### Q3: 如何实现键盘导航和焦点管理？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**焦点管理:**

```html
<!-- tabindex -->
<div tabindex="0">可聚焦</div>
<div tabindex="-1">程序聚焦</div>
<div tabindex="1">优先聚焦</div>

<!-- 跳过链接 -->
<a href="#main" class="skip-link">跳至内容</a>
```

**自定义键盘事件:**

```js
// 自定义组件键盘支持
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    activateCurrentElement()
  }
  if (e.key === 'Escape') {
    closeDialog()
  }
  if (e.key === 'ArrowDown') {
    moveFocusDown()
  }
})
```

**焦点陷阱 (模态框):**

```js
function trapFocus(element) {
  const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]'
  const focusable = element.querySelectorAll(focusableSelectors)
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  })
  
  first.focus()
}
```

**知识点：** `键盘导航` `焦点管理` `tabindex`

:::

---

### Q4: 如何适配屏幕阅读器？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**标题层级:**

```html
<h1>页面标题</h1>
<h2>章节标题</h2>
<h3>子章节</h3>
```

**隐藏但可访问:**

```css
/* 对于屏幕阅读器可见，屏幕隐藏 */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

**动态内容通知:**

```html
<!-- 实时区域 -->
<div aria-live="polite" aria-atomic="true">
  <!-- 变化时会朗读 -->
</div>

<!-- 更紧急 -->
<div aria-live="assertive" role="alert">
  错误信息
</div>
```

**组件无障碍:**

```html
<!-- 自定义下拉 -->
<div role="listbox" aria-label="选择水果">
  <div role="option" aria-selected="true">苹果</div>
  <div role="option">香蕉</div>
  <div role="option">橙子</div>
</div>

<!-- 标签页 -->
<div role="tablist">
  <button role="tab" aria-selected="true">标签 1</button>
  <button role="tab">标签 2</button>
</div>
<div role="tabpanel">内容</div>
```

**知识点：** `屏幕阅读器` `aria-live` `role`

:::

---

### Q5: 语义化与可访问性的关系是什么？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**语义化即无障碍:**

```html
<!-- ❌ 无语义 -->
<div onclick="submit()">提交</div>

<!-- ✅ 有语义 -->
<button type="submit">提交</button>

<!-- ❌ 无语义 -->
<div class="nav">...</div>

<!-- ✅ 有语义 -->
<nav>...</nav>
```

**对比:**

| 非语义 | 语义化 |
|--------|--------|
| 屏幕阅读器无法识别 | 自动识别角色 |
| 需要 ARIA 补充 | 原生无障碍 |
| 点按范围不明确 | 预期行为清晰 |

**最佳实践:**

1. 优先使用语义标签
2. 无法用时加 role
3. 确保所有交互可键盘操作
4. 提供合适的替代文本

**知识点：** `语义化` `无障碍` `native HTML`

:::

---

### Q6: 颜色对比度有什么标准？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**对比度要求:**

| 等级 | 普通文本 | 大文本 (18px+) |
|------|----------|---------------|
| AA | 4.5:1 | 3:1 |
| AAA | 7:1 | 4.5:1 |

**计算和测试:**

```css
/* ✅ 通过 AA */
body {
  color: #333;  /* 对比度 12.63:1 */
  background: #fff;
}

/* ⚠️ 不通过 */
.low-contrast {
  color: #999;  /* 对比度 2.85:1 */
  background: #fff;
}
```

**工具:**

- WebAIM Contrast Checker
- Chrome Lighthouse
- axe DevTools

**知识点：** `颜色对比度` `WCAG` `对比度标准`

:::

---

## 总结

| 知识点 | 重要度 |
|--------|--------|
| WCAG 原则 | 🔥🔥🔥 |
| ARIA 属性 | 🔥🔥🔥 |
| 键盘导航 | 🔥🔥 |
| 屏幕阅读器适配 | 🔥🔥 |
| 语义化 | 🔥🔥🔥 |
| 颜色对比度 | 🔥🔥 |

---
### Q7: 如何处理 HTML5 新标签的浏览器兼容问题？

> **⭐ 简单 · HTML5**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HTML5 新标签在老版本浏览器中可能不被识别，需要兼容处理。**

**1. 问题背景：**

HTML5 引入的新标签如 `<header>`, `<nav>`, `<article>`, `<section>` 等，在 IE8 及以下版本中：
- 不被识别为块级元素
- 无法应用样式
- 不被 DOM 正确解析

**2. 解决方案：**

**方案一：HTML5 Shiv（推荐）**

```html
<!--[if lt IE 9]>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.min.js"></script>
<![endif]-->
```

```javascript
// html5shiv 原理
(function() {
  const tags = 'article section nav aside header footer main'.split(' ');
  for (let i = 0; i < tags.length; i++) {
    document.createElement(tags[i]);
  }
})();
```

**方案二：手动创建元素**

```javascript
// 在页面加载前执行
const html5Tags = [
  'article', 'section', 'nav', 'aside', 
  'header', 'footer', 'main', 'figure', 'figcaption'
];

for (let tag of html5Tags) {
  document.createElement(tag);
}
```

**方案三：CSS 重置块级显示**

```css
/* 确保新标签在老浏览器中显示为块级 */
article, section, nav, aside, 
header, footer, main, figure, figcaption {
  display: block;
}
```

**方案四：渐进增强**

```html
<!-- 使用 class 兜底 -->
<header class="page-header">
  <!-- 即使 header 不被识别，.page-header 样式仍生效 -->
</header>

<style>
.page-header {
  /* 兜底样式 */
}
</style>
```

**3. 检测浏览器支持：**

```javascript
function supportsHTML5Tag(tagName) {
  const element = document.createElement(tagName);
  return element instanceof HTMLElement;
}

if (!supportsHTML5Tag('article')) {
  // 加载兼容脚本
  loadScript('html5shiv.js');
}
```

**4. 现代项目处理：**

```javascript
// 使用 babel 或 autoprefixer 处理
// 大多数现代构建工具会自动处理

// webpack + @babel/preset-env
// .browserslistrc 指定支持范围
> 1%
last 2 versions
not dead
not ie 11
```

**5. 最佳实践：**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>HTML5 兼容页面</title>
  
  <!-- 条件注释加载兼容脚本 -->
  <!--[if lt IE 9]>
    <script src="html5shiv.js"></script>
    <script src="respond.min.js"></script>
  <![endif]-->
  
  <!-- 样式重置 -->
  <style>
    article, section, nav, aside, 
    header, footer, main {
      display: block;
    }
  </style>
</head>
<body>
  <header>...</header>
  <nav>...</nav>
  <main>
    <article>...</article>
  </main>
  <footer>...</footer>
</body>
</html>
```

**6. 兼容性查询：**

- [Can I Use](https://caniuse.com/) - 查询各特性浏览器支持
- MDN 浏览器兼容性表格

**知识点：** `HTML5` `浏览器兼容` `HTML5 Shiv` `渐进增强`

:::

---

### Q8: DOM 如何实现多个标签页之间的通信？

> **🔥 中等 · 浏览器**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**同域下的多个标签页可以通过以下几种方式通信：**

**1. localStorage（最常用）**

```javascript
// 页面 A - 发送消息
function sendMessage(data) {
  localStorage.setItem('message', JSON.stringify({
    data: data,
    timestamp: Date.now(),
    from: 'pageA'
  }));
}

// 页面 B - 监听变化
window.addEventListener('storage', (e) => {
  if (e.key === 'message') {
    const { data, from } = JSON.parse(e.newValue);
    console.log(`收到来自 ${from} 的消息:`, data);
  }
});

// 注意：当前页不会触发 storage 事件
// 需要一个中间页或使用其他技巧
```

```javascript
// 改进：使用 localStorage + 轮询或自定义事件
class TabMessenger {
  constructor(channel) {
    this.channel = channel;
    this.listeners = new Set();
    
    window.addEventListener('storage', (e) => {
      if (e.key === this.channel && e.newValue) {
        const msg = JSON.parse(e.newValue);
        this.listeners.forEach(cb => cb(msg));
      }
    });
  }
  
  postMessage(data) {
    localStorage.setItem(this.channel, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
    // 立即删除，触发其他页面的 storage 事件
    localStorage.removeItem(this.channel);
  }
  
  onMessage(callback) {
    this.listeners.add(callback);
  }
}

// 使用
const messenger = new TabMessenger('my_channel');
messenger.postMessage({ type: 'UPDATE' });
messenger.onMessage((msg) => console.log(msg));
```

**2. Broadcast Channel API（现代方案）**

```javascript
// 创建广播频道
const channel = new BroadcastChannel('tab_communication');

// 发送消息
channel.postMessage({
  type: 'NOTIFICATION',
  data: { message: 'Hello from tab 1' }
});

// 接收消息
channel.onmessage = (event) => {
  console.log('收到消息:', event.data);
};

// 关闭频道
channel.close();
```

```javascript
// 支持检测
if ('BroadcastChannel' in window) {
  // 使用 BroadcastChannel
} else {
  // 降级到 localStorage
}
```

**3. SharedWorker（适合复杂场景）**

```javascript
// shared-worker.js
const connections = [];

onconnect = function(e) {
  const port = e.ports[0];
  connections.push(port);
  
  port.onmessage = function(event) {
    // 广播给所有连接
    connections.forEach(p => {
      if (p !== port) {
        p.postMessage(event.data);
      }
    });
  };
};

// 页面 A - 连接 worker
const worker = new SharedWorker('shared-worker.js');
worker.port.start();
worker.port.postMessage({ type: 'SYNC' });
worker.port.onmessage = (e) => console.log(e.data);

// 页面 B - 同样连接
```

**4. window.open + postMessage**

```javascript
// 主页面
const popup = window.open('popup.html', 'popup');

// 延时发送（确保页面加载）
setTimeout(() => {
  popup.postMessage({ type: 'INIT' }, 'https://example.com');
}, 1000);

window.addEventListener('message', (e) => {
  if (e.origin !== 'https://example.com') return;
  console.log('从 popup 收到:', e.data);
});

// popup 页面
window.opener.postMessage({ type: 'READY' }, 'https://parent.com');
```

**5. cookies（不推荐，有大小限制）**

```javascript
// 设置 cookie
document.cookie = 'tabData=' + encodeURIComponent(JSON.stringify(data));

// 轮询检查 cookie 变化（性能差，不推荐）
setInterval(() => {
  const data = getCookie('tabData');
  // 检查是否变化
}, 1000);
```

**6. 方案对比：**

| 方案 | 优点 | 缺点 | 兼容性 |
|------|------|------|--------|
| localStorage | 简单，兼容好 | 同步阻塞，5MB 限制 | 全支持 |
| BroadcastChannel | 简洁高效 | 较新 API | 现代浏览器 |
| SharedWorker | 功能强大 | 复杂，资源开销 | 较好 |
| postMessage | 灵活 | 需保持引用 | 全支持 |

**7. 实战示例 - 单点登录同步：**

```javascript
class SingleSignOn {
  constructor() {
    this.channel = new BroadcastChannel('sso_channel');
    this.channel.onmessage = (e) => {
      if (e.data.type === 'LOGOUT') {
        this.logout();
      }
    };
  }
  
  logout() {
    localStorage.removeItem('token');
    this.channel.postMessage({ type: 'LOGOUT' });
    location.href = '/login';
  }
}

// 任一标签页登出，其他页面同步登出
```

**知识点：** `DOM` `跨标签页通信` `localStorage` `BroadcastChannel` `postMessage`

:::


---

### Q9: ARIA 属性有哪些常用的？何时需要使用？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**ARIA (Accessible Rich Internet Applications) 属性分类：**

**1. Role（角色）- 定义元素类型：**

```html
<!-- landmarks - 页面区域 -->
<header role="banner">头部</header>
<nav role="navigation">导航</nav>
<main role="main">主要内容</main>
<footer role="contentinfo">页脚</footer>
<aside role="complementary">侧边栏</aside>

<!-- widgets - 交互组件 -->
<div role="dialog" aria-modal="true">对话框</div>
<div role="menu">菜单</div>
<div role="tablist">标签页列表</div>
<div role="alert">警告提示</div>
<div role="status">状态信息</div>
<div role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100">
  进度 50%
</div>
```

**2. Labeling（标签）- 提供可访问名称：**

```html
<!-- aria-label - 直接提供标签文本 -->
<button aria-label="关闭">✕</button>
<input type="search" aria-label="搜索内容" />

<!-- aria-labelledby - 引用其他元素作为标签 -->
<span id="username-label">用户名</span>
<input type="text" aria-labelledby="username-label" />

<!-- aria-describedby - 提供额外描述 -->
<input type="email" aria-describedby="email-desc" />
<span id="email-desc">格式：name@example.com</span>
```

**3. 状态属性（States）：**

```html
<!-- aria-expanded - 展开/收起状态 -->
<button aria-expanded="false" aria-controls="menu">菜单</button>
<ul id="menu" hidden>...</ul>

<!-- aria-hidden - 隐藏装饰性内容 -->
<span aria-hidden="true">🔒</span> 安全连接

<!-- aria-disabled - 禁用状态 -->
<button aria-disabled="true">提交</button>

<!-- aria-checked - 复选框状态 -->
<div role="checkbox" aria-checked="true">记住我</div>

<!-- aria-selected - 选项选中状态 -->
<div role="option" aria-selected="true">选项 1</div>

<!-- aria-pressed - 切换按钮状态 -->
<button aria-pressed="true">粗体</button>
```

**4. 动态内容通知（Live Regions）：**

```html
<!-- aria-live - 动态内容更新通知 -->
<!-- polite: 空闲时朗读 -->
<div aria-live="polite">搜索结果将显示在这里</div>

<!-- assertive: 立即打断朗读 -->
<div aria-live="assertive" role="alert">错误：表单提交失败</div>

<!-- aria-atomic - 是否朗读整个区域 -->
<div aria-live="polite" aria-atomic="true">
  <span>共 10</span> 条结果
</div>

<!-- aria-busy - 内容加载中 -->
<div aria-busy="true">加载中...</div>
```

**何时需要使用 ARIA：**

| 场景 | 是否需要 ARIA | 示例 |
|------|--------------|------|
| 原生 HTML 标签 | ❌ 不需要 | `<button>`, `<nav>`, `<header>` 已有语义 |
| 自定义交互组件 | ✅ 需要 | 自定义下拉、标签页、模态框 |
| 动态内容更新 | ✅ 需要 | 搜索结果、通知消息、进度条 |
| 复杂表单验证 | ✅ 需要 | aria-invalid, aria-errormessage |
| 装饰性图标 | ✅ 需要 | aria-hidden="true" 隐藏 |
| 图标按钮 | ✅ 需要 | aria-label 提供文本说明 |

**使用原则：**

1. **优先使用原生 HTML** - 能用 `<button>` 就不用 `<div role="button">`
2. **不要改变原生语义** - 不要给 `<button>` 加 `role="link"`
3. **确保键盘可操作** - ARIA 只增加语义，不增加功能
4. **测试验证** - 使用屏幕阅读器和 Lighthouse 测试

**知识点：** `ARIA` `role` `aria-label` `aria-hidden` `aria-live` `aria-expanded`

:::

---

### Q10: 键盘导航的设计原则？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**键盘导航核心原则：**

**1. 所有功能可键盘访问**

```html
<!-- ❌ 不可键盘访问 -->
<div onclick="submit()">提交</div>

<!-- ✅ 可键盘访问 -->
<button type="button" onclick="submit()">提交</button>

<!-- 自定义组件需要 tabindex 和键盘事件 -->
<div role="button" tabindex="0" 
     onclick="handleClick()" 
     onkeydown="handleKeyDown(event)">
  自定义按钮
</div>

<script>
function handleKeyDown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleClick()
  }
}
</script>
```

**2. Tab 顺序逻辑清晰**

```html
<!-- 正确的 DOM 顺序 = Tab 顺序 -->
<nav>
  <a href="#home">首页</a>
  <a href="#about">关于</a>
  <a href="#contact">联系</a>
</nav>
<main>
  <h1>页面标题</h1>
  <p>内容...</p>
  <button>提交</button>
</main>

<!-- 使用 tabindex 调整顺序（谨慎使用） -->
<input type="text" tabindex="1" placeholder="第一步" />
<input type="email" tabindex="2" placeholder="第二步" />
<button tabindex="3">提交</button>

<!-- tabindex="-1" 可聚焦但跳过 Tab -->
<div id="modal" tabindex="-1">模态框内容</div>
```

**3. 焦点管理（Focus Management）**

```javascript
// 打开模态框时聚焦到第一个元素
function openModal() {
  const modal = document.getElementById('modal')
  modal.hidden = false
  const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
  firstFocusable?.focus()
}

// 关闭模态框时返回焦点
function closeModal() {
  const triggerElement = document.querySelector('[aria-controls="modal"]')
  modal.hidden = true
  triggerElement?.focus() // 返回到触发元素
}

// 程序化聚焦
document.getElementById('search-input').focus()

// 聚焦到特定位置（如错误字段）
function focusFirstError() {
  const errorField = document.querySelector('[aria-invalid="true"]')
  errorField?.focus()
}
```

**4. Skip Link（跳过链接）**

```html
<!-- 页面顶部的跳过链接 -->
<a href="#main-content" class="skip-link">
  跳至主要内容
</a>

<style>
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  padding: 8px;
  background: #000;
  color: #fff;
  text-decoration: none;
}

.skip-link:focus {
  top: 0; /* 聚焦时显示 */
}
</style>

<main id="main-content">
  <!-- 主要内容 -->
</main>
```

**5. 焦点陷阱（Focus Trap）**

```javascript
// 模态框焦点陷阱
function trapFocus(element) {
  const focusableSelectors = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ]
  
  const focusable = element.querySelectorAll(focusableSelectors)
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  
  function handleKeyDown(e) {
    if (e.key !== 'Tab') return
    
    if (e.shiftKey) { // Shift + Tab
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else { // Tab
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }
  
  element.addEventListener('keydown', handleKeyDown)
  first.focus()
  
  return () => element.removeEventListener('keydown', handleKeyDown)
}

// 使用
const cleanup = trapFocus(document.getElementById('modal'))
// 关闭时调用 cleanup()
```

**6. 自定义键盘快捷方式**

```javascript
// 全局快捷键
function handleGlobalKeydown(e) {
  // Ctrl/Cmd + K - 搜索
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    document.getElementById('search').focus()
  }
  
  // Escape - 关闭模态框
  if (e.key === 'Escape') {
    closeAllModals()
  }
  
  // Arrow keys - 导航菜单
  if (e.key === 'ArrowDown') {
    moveFocusToNextMenuItem()
  }
  if (e.key === 'ArrowUp') {
    moveFocusToPrevMenuItem()
  }
}

document.addEventListener('keydown', handleGlobalKeydown)
```

**7. 可见焦点样式**

```css
/* 不要移除 focus 样式！ */

/* 自定义美观的焦点样式 */
button:focus, a:focus, input:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}

/* 或者使用 :focus-visible（现代浏览器） */
button:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}

/* 移除鼠标点击时的 focus，保留键盘 focus */
button:focus:not(:focus-visible) {
  outline: none;
}
```

**8. 常见组件键盘交互模式**

| 组件 | Enter | Space | Arrow Keys | Escape |
|------|-------|-------|------------|--------|
| 按钮 | ✅ 激活 | ✅ 激活 | - | - |
| 链接 | ✅ 跳转 | - | - | - |
| 下拉菜单 | ✅ 打开 | ✅ 打开 | ↓↑ 导航 | ✅ 关闭 |
| 标签页 | ✅ 激活 | ✅ 激活 | ←→ 切换 | - |
| 模态框 | - | - | - | ✅ 关闭 |

**知识点：** `键盘导航` `Tab 顺序` `焦点管理` `Skip Link` `焦点陷阱`

:::

