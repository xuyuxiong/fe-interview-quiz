---
title: CSS 动画与过渡
description: transition vs animation、@keyframes、性能优化、贝塞尔曲线、FLIP 动画等核心面试题
---

# CSS 动画与过渡

CSS 动画和过渡可以为网页添加动态效果。理解它们的区别和性能优化对于创建流畅的用户体验至关重要。

---

## 📝 题目

### Q1: transition 和 animation 有什么区别？

> **⭐ 简单 · CSS**

请比较 transition 和 animation 的区别。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

| 特性 | transition | animation |
|------|-----------|-----------|
| 触发方式 | 状态变化 | 自动播放 |
| 关键帧 | 只有起止 | 多关键帧 |
| 循环 | 不支持 | 支持 infinite |
| 初始状态 | 保留 | 可控制 |
| 播放控制 | 无 | play/pause |
| 复杂度 | 简单 | 复杂 |

**transition 示例：**
```css
.button {
  background: blue;
  transition: background 0.3s ease;
}
.button:hover {
  background: red;
}
```

**animation 示例：**
```css
.spinner {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0); }
  to { transform: rotate(360deg); }
}
```

**选择建议：**
- **transition**：简单状态变化
- **animation**：复杂动画、循环效果

**知识点：** `transition` `animation` `CSS 动画`

:::

---

### Q2: @keyframes 的基本语法

> **⭐ 简单 · CSS**

请说明 @keyframes 的语法和常用属性。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**基本语法：**
```css
@keyframes slide {
  0% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(100px);
  }
  100% {
    transform: translateX(0);
  }
}

/* 或使用 from/to */
@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

**animation 属性：**
```css
.element {
  /* 简写 */
  animation: slide 2s ease-in-out 0.5s infinite alternate;
  
  /* 各属性详解 */
  animation-name: slide;           /* 动画名称 */
  animation-duration: 2s;          /* 持续时间 */
  animation-timing-function: ease; /* 时间函数 */
  animation-delay: 0.5s;           /* 延迟 */
  animation-iteration-count: infinite; /* 次数 */
  animation-direction: alternate;  /* 方向 */
  animation-fill-mode: both;       /* 填充模式 */
  animation-play-state: running;   /* 播放状态 */
}
```

**fill-mode 值：**
- `none`：动画结束恢复初始
- `forwards`：保持结束状态
- `backwards`：延迟时应用起始
- `both`：两者结合

**知识点：** `@keyframes` `animation 属性` `关键帧`

:::

---

### Q3: 贝塞尔曲线（cubic-bezier）是什么？

> **🔥 中等 · CSS**

```css
.element {
  transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}
```

请解释贝塞尔曲线的含义。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**贝塞尔曲线** 定义了动画速度变化的曲线。

**语法：**
```css
cubic-bezier(x1, y1, x2, y2)
```
- x1, y1：第一个控制点（0 ≤ x ≤ 1）
- x2, y2：第二个控制点（0 ≤ x ≤ 1）

**常用预设：**
```css
/* 匀速 */
linear: cubic-bezier(0, 0, 1, 1);

/* 慢 - 快 - 慢（默认） */
ease: cubic-bezier(0.25, 0.1, 0.25, 1);

/* 慢 - 快 */
ease-in: cubic-bezier(0.42, 0, 1, 1);

/* 快 - 慢 */
ease-out: cubic-bezier(0, 0, 0.58, 1);

/* 慢 - 快 - 慢 */
ease-in-out: cubic-bezier(0.42, 0, 0.58, 1);
```

**自定义曲线：**
```css
/* 弹性效果 */
.spring: cubic-bezier(0.68, -0.55, 0.27, 1.55);

/* 快速开始 */
.quick-start: cubic-bezier(0.47, 0, 0.745, 0.715);

/* 平滑停止 */
smooth-stop: cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

**在线工具：**
- https://cubic-bezier.com/
- https://bezier.io/

**知识点：** `贝塞尔曲线` `缓动函数` `动画速度`

:::

---

### Q4: CSS 动画性能优化

> **🔥 中等 · CSS**

哪些 CSS 属性动画性能好？哪些应该避免？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**高性能属性（触发合成）：**
```css
/* 推荐：只合成，不重排重绘 */
transform: translate() rotate() scale();
opacity: 0.5;
will-change: transform, opacity;
```

**中等性能（触发重绘）：**
```css
/* 尽量避免动画 */
background-color
color
box-shadow
border-radius
visibility
```

**低性能（触发重排）：**
```css
/* 避免动画 */
width
height
padding
margin
top/left/right/bottom
font-size
display
```

**优化技巧：**

**1. 使用 transform 代替定位**
```css
/* 差 */
.element {
  left: 100px;
  transition: left 0.3s;
}

/* 好 */
.element {
  transform: translateX(100px);
  transition: transform 0.3s;
}
```

**2. 使用 will-change**
```css
.element {
  will-change: transform, opacity;
}
/* 动画结束移除 */
.element.ended {
  will-change: auto;
}
```

**3. 使用 GPU 加速**
```css
.element {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

**知识点：** `动画性能` `重排重绘` `GPU 加速`

:::

---

### Q5: requestAnimationFrame 的作用

> **🔥 中等 · JavaScript**

为什么使用 requestAnimationFrame 比 setTimeout 做动画更好？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**requestAnimationFrame（RAF）** 是浏览器专门为动画提供的 API。

**优势：**

**1. 与屏幕刷新同步**
```js
// RAF - 60fps（通常）
function animate() {
  // 动画逻辑
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// setTimeout - 不确定
function animate() {
  // 可能掉帧
  setTimeout(animate, 16);  // 16ms ≈ 60fps
}
```

**2. 页面不可见时暂停**
```js
// 切换到其他标签页时自动暂停
// 节省 CPU 和电量
```

**3. 批量更新**
- 多个 RAF 回调合并执行
- 减少重排重绘次数

**使用示例：**
```js
const element = document.querySelector('.box');
let start = null;

function animate(timestamp) {
  if (!start) start = timestamp;
  const elapsed = timestamp - start;
  
  // 更新动画
  element.style.transform = `rotate(${elapsed / 10}deg)`;
  
  if (elapsed < 2000) {
    requestAnimationFrame(animate);
  }
}

requestAnimationFrame(animate);
```

**知识点：** `requestAnimationFrame` `动画性能` `浏览器优化`

:::

---

### Q6: 什么是 FLIP 动画技术？

> **💀 困难 · JavaScript**

请解释 FLIP 动画的原理和实现。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**FLIP** = First, Last, Invert, Play

**原理：**
1. **First**：记录元素初始状态
2. **Last**：计算元素最终状态
3. **Invert**：创建反向变换
4. **Play**：播放动画

**实现示例：**
```js
function flipAnimation(element) {
  // First - 记录初始位置
  const first = element.getBoundingClientRect();
  const firstStyle = getComputedStyle(element);
  
  // 应用最终状态
  element.classList.add('final');
  
  // Last - 获取最终位置
  const last = element.getBoundingClientRect();
  
  // Invert - 计算差异
  const deltaX = first.left - last.left;
  const deltaY = first.top - last.top;
  const scaleX = first.width / last.width;
  const scaleY = first.height / last.height;
  
  // 应用反向变换
  element.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
  element.style.transition = 'none';
  
  // 强制重排
  element.offsetHeight;
  
  // Play - 播放动画
  element.style.transform = '';
  element.style.transition = 'transform 0.3s ease';
  
  // 清理
  setTimeout(() => {
    element.style.transition = '';
  }, 300);
}
```

**使用场景：**
- 列表项重新排序
- 元素位置动画
- 展开收起动画

**知识点：** `FLIP` `动画技术` `位置变换`

:::

---

### Q7: 如何实现复杂的动画序列？

> **🔥 中等 · CSS**

请实现一个元素依次出现、移动、消失的动画序列。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**方法 1：animation-delay**
```css
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(20px); }
  20% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-20px); }
}

.element {
  animation: fadeInOut 3s ease forwards;
}
```

**方法 2：多个动画**
```css
@keyframes fadeIn {
  to { opacity: 1; }
}
@keyframes move {
  to { transform: translateX(100px); }
}
@keyframes fadeOut {
  to { opacity: 0; }
}

.element {
  opacity: 0;
  animation:
    fadeIn 0.5s ease forwards,
    move 1s ease 0.5s forwards,
    fadeOut 0.5s ease 2s forwards;
}
```

**方法 3：animation-timeline（现代）**
```css
@keyframes sequence {
  0% { opacity: 0; }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

.element {
  animation: sequence 3s linear;
  animation-timeline: scroll();
}
```

**方法 4：JavaScript 控制**
```js
async function sequenceAnimation(el) {
  await el.animate({ opacity: [0, 1] }, 500).finished;
  await el.animate({ transform: ['translateY(0)', 'translateY(100px)'] }, 1000).finished;
  await el.animate({ opacity: [1, 0] }, 500).finished;
}
```

**知识点：** `动画序列` `animation-delay` `动画组合`

:::

---

### Q8: CSS 动画与 JS 动画的选择

> **🔥 中等 · CSS**

什么时候用 CSS 动画，什么时候用 JavaScript 动画？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**使用 CSS 动画的场景：**
1. **简单动画**：过渡、淡入淡出
2. **自动播放**：无需交互
3. **性能关键**：浏览器优化好
4. **声明式**：代码简洁

```css
/* 推荐用 CSS */
.button:hover {
  transform: scale(1.1);
  transition: transform 0.2s;
}

/* loading 动画 */
.loader {
  animation: spin 1s linear infinite;
}
```

**使用 JavaScript 动画的场景：**
1. **复杂交互**：基于用户输入
2. **动态控制**：暂停、倒带、跳转
3. **物理效果**：弹簧、重力
4. **精确控制**：时间轴管理

```js
// 推荐用 JS
// 拖拽动画
element.onDrag = (e) => {
  element.style.transform = `translate(${e.x}px, ${e.y}px)`;
};

// 物理弹跳
const spring = useSpring({ tension: 300, friction: 20 });
```

**混合使用：**
```css
/* CSS 处理基础过渡 */
.modal {
  transition: opacity 0.3s, transform 0.3s;
}
```

```js
// JS 控制播放
modal.classList.add('show');
setTimeout(() => modal.classList.remove('show'), 2000);
```

**知识点：** `CSS vs JS 动画` `动画选择` `性能优化`

:::

---

## 🔑 核心知识点总结

### 1. transition vs animation

| 特性 | transition | animation |
|------|-----------|-----------|
| 触发 | 状态变化 | 自动 |
| 关键帧 | 2 个 | 多个 |
| 循环 | 否 | support |

### 2. 性能优化

- **好**：transform、opacity
- **中**：background、color
- **差**：width、height、position

### 3. 贝塞尔曲线

- linear：匀速
- ease：慢 - 快 - 慢
- ease-in/out：慢 - 快/快 - 慢

### 4. 性能技巧

- 使用 transform 代替定位
- 使用 will-change
- 使用 RAF 代替 setTimeout
- 使用 FLIP 处理位置动画

## 💡 面试技巧

1. **transition/animation**：知道区别和用法
2. **性能**：记住哪些属性性能好
3. **贝塞尔**：知道常用预设
4. **RAF**：理解优势
5. **FLIP**：了解原理
### Q9: 如何优化 CSS 动画性能？

> **🔥 中等 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CSS 动画性能优化核心：使用 GPU 加速，减少重绘和回流。**

**1. 使用 transform 代替位置属性：**

```css
/* ❌ 性能差 - 触发 layout */
.element {
  left: 100px;
  top: 100px;
  animation: move 1s ease;
}

/* ✅ 性能好 - GPU 加速 */
.element {
  transform: translate(100px, 100px);
  animation: move 1s ease;
}

@keyframes move {
  from { transform: translateX(0); }
  to { transform: translateX(100px); }
}
```

**为什么？**
- `left/top` 改变会触发**layout + paint**
- `transform` 只触发**composite**（GPU 处理）

**2. 使用 translate3d 开启 GPU 加速：**

```css
.element {
  /* 强制启用 GPU 加速 */
  transform: translate3d(0, 0, 0);
  /* 或 */
  transform: translateZ(0);
}

/* 动画中 */
@keyframes slide {
  from {
    transform: translate3d(0, 0, 0);
  }
  to {
    transform: translate3d(100%, 0, 0);
  }
}
```

**原理：**
- translate3d 会创建新的**合成层（Compositing Layer）**
- 动画在独立层上进行，不影响其他元素
- GPU 处理合成，CPU 可继续处理其他任务

**3. 使用 will-change 优化：**

```css
.element {
  /* 告知浏览器哪些属性会变化 */
  will-change: transform, opacity;
}

/* 动画结束后可移除 */
.element.animate({
  transform: ['translateX(0)', 'translateX(100px)']
}, {
  duration: 1000
}).onfinish = () => {
  element.style.willChange = 'auto';
};
```

**注意：**
- 不要滥用 will-change（有内存开销）
- 在动画前动态添加
- 动画结束后移除

**4. 使用 requestAnimationFrame：**

```javascript
// ❌ 使用 setTimeout 会导致掉帧
function animate() {
  element.style.transform = `translateX(${pos}px)`;
  pos += speed;
  setTimeout(animate, 16);
}

// ✅ 使用 requestAnimationFrame
function animate() {
  element.style.transform = `translateX(${pos}px)`;
  pos += speed;
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
```

**5. 使用 FLIP 技术处理复杂动画：**

```javascript
// FLIP: First, Last, Invert, Play

// 获取初始位置
const first = element.getBoundingClientRect();

// 执行状态变化（如添加 class）
element.classList.add('expanded');

// 获取最终位置
const last = element.getBoundingClientRect();

// 计算差异
const deltaX = first.left - last.left;
const deltaY = first.top - last.top;

// 应用反向变换
element.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
element.style.transition = 'transform 0.3s ease';

// 强制重绘后移除变换
requestAnimationFrame(() => {
  element.style.transform = '';
});
```

**6. 减少重绘和回流：**

```css
/* ❌ 触发多次回流 */
.element {
  transition: width 0.3s, height 0.3s, padding 0.3s;
}

/* ✅ 批量处理 */
.element {
  transition: transform 0.3s;
}

/* 或使用 animations 替代 transitions */
.element.animate {
  animation: scale 0.3s ease forwards;
}
```

**7. 使用 CSS Contain 限制影响范围：**

```css
.element {
  /* 隔离布局、样式、绘制 */
  contain: layout style paint;
}

/* 动画不影响外部元素 */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

**8. 避免动画属性：**

| 高性能（composite） | 中等性能（paint） | 低性能（layout） |
|-------------------|-----------------|----------------|
| transform | color | width, height |
| opacity | background | margin, padding |
| filter（部分） | box-shadow | top, left, right |
| | visibility | border-width |

**9. 完整优化示例：**

```css
.animated-element {
  /* 开启 GPU 加速 */
  transform: translateZ(0);
  
  /* 告知浏览器优化目标 */
  will-change: transform, opacity;
  
  /* 定义动画 */
  animation: slideIn 0.5s ease forwards;
  
  /* 限制影响范围 */
  contain: layout style paint;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-100%) translateZ(0);
  }
  to {
    opacity: 1;
    transform: translateX(0) translateZ(0);
  }
}
```

```javascript
// 动态管理 will-change
function optimizeAnimation(element) {
  // 动画前
  element.style.willChange = 'transform, opacity';
  
  // 执行动画
  element.animate([
    { transform: 'translateX(-100%)', opacity: 0 },
    { transform: 'translateX(0)', opacity: 1 }
  ], {
    duration: 500,
    easing: 'ease-out'
  }).onfinish = () => {
    // 动画后清理
    element.style.willChange = 'auto';
  };
}
```

**10. 性能监控：**

```javascript
// 使用 Performance API 监控
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('动画时间:', entry.duration, 'ms');
  }
});
observer.observe({ entryTypes: ['longtask'] });
```

**知识点：** `CSS` `动画性能` `GPU 加速` `transform` `will-change` `requestAnimationFrame`

:::

