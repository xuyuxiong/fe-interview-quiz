---
title: CSS 响应式设计
description: 媒体查询、响应式单位、移动端高清方案、viewport、响应式图片等核心面试题
---

# CSS 响应式设计

响应式设计使网站能够在各种设备和屏幕尺寸上良好显示。掌握媒体查询和响应式技术是现代前端开发的必备技能。

---

## 📝 题目

### Q1: 媒体查询的基本语法是什么？

> **⭐ 简单 · CSS**

请说明媒体查询的语法和常用断点。

::: details 🔍 点击查看答案与解析

**基本语法：**
```css
@media screen and (max-width: 768px) {
  .container { width: 100%; }
}

@media screen and (min-width: 768px) {
  .container { width: 750px; }
}
```

**常用断点：**
- 手机：`max-width: 767px`
- 平板：`min-width: 768px`
- 桌面：`min-width: 1024px`
- 大桌面：`min-width: 1200px`

**知识点：** `媒体查询` `断点` `响应式`

:::

---

### Q2: rem、em、vw、vh 的区别？

> **⭐ 简单 · CSS**

请对比这些响应式单位。

::: details 🔍 点击查看答案与解析

| 单位 | 相对于 | 特点 |
|------|--------|------|
| `rem` | 根元素字体大小 | 全局统一，推荐 |
| `em` | 父元素字体大小 | 嵌套时可能累积 |
| `vw` | 视口宽度的 1% | 纯视口比例 |
| `vh` | 视口高度的 1% | 纯视口比例 |
| `%` | 父元素对应属性 | 依赖上下文 |

```css
html { font-size: 16px; }
.text { font-size: 1.5rem; }  /* 24px */
.box { width: 50vw; }         /* 视口宽度的50% */
```

**知识点：** `rem` `em` `vw` `vh` `响应式单位`

:::

---

### Q3: viewport meta 标签有什么作用？

> **⭐ 简单 · CSS**

请解释 viewport 的配置。

::: details 🔍 点击查看答案与解析

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
```

| 属性 | 说明 | 推荐值 |
|------|------|--------|
| `width` | 视口宽度 | `device-width` |
| `initial-scale` | 初始缩放比 | `1.0` |
| `maximum-scale` | 最大缩放比 | `5.0` |
| `user-scalable` | 是否允许缩放 | `yes`（无障碍需求） |

**知识点：** `viewport` `移动端适配`

:::

---

### Q4: 如何实现 1px 边框问题？

> **🔥 中等 · CSS**

移动端 1px 边框显示过粗，如何解决？

::: details 🔍 点击查看答案与解析

**方案一：transform 缩放**
```css
.border-1px {
  position: relative;
}
.border-1px::after {
  content: '';
  position: absolute;
  left: 0; bottom: 0;
  width: 100%; height: 1px;
  background: #ccc;
  transform: scaleY(0.5);
  transform-origin: 0 0;
}
```

**方案二：viewport 缩放**
```html
<meta name="viewport" content="width=device-width, initial-scale=0.5">
```

**方案三：媒体查询 + DPR**
```css
@media (-webkit-min-device-pixel-ratio: 2) {
  .border { border-width: 0.5px; }
}
```

**知识点：** `1px问题` `DPR` `transform缩放`

:::

---

### Q5: 移动端高清方案怎么做？

> **🔥 中等 · CSS**

请说明 rem + flexible.js 和 vw 方案。

::: details 🔍 点击查看答案与解析

**方案一：rem + flexible.js**
```html
<script>
  // 动态设置 html font-size
  const width = document.documentElement.clientWidth
  document.documentElement.style.fontSize = width / 10 + 'px'
</script>
```
```css
.box { width: 7.5rem; } /* 设计稿 750px / 10 = 75rem基准 */
```

**方案二：vw 方案（推荐）**
```css
/* 设计稿 750px，1px = 100vw/750 = 0.1333vw */
.box { width: 50vw; } /* 不需要 JS */
```

**方案三：vw + rem 组合**
```css
html { font-size: calc(100vw / 3.75); } /* 375设计稿 */
.box { width: 2rem; } /* 2 * 100 = 200px 设计稿尺寸 */
```

**知识点：** `rem适配` `vw适配` `flexible.js` `移动端高清`

:::

---

### Q6: CSS 响应式布局有哪些方案？

> **🔥 中等 · CSS**

请列举响应式布局的主要实现方式。

::: details 🔍 点击查看答案与解析

| 方案 | 说明 | 适用场景 |
|------|------|---------|
| 媒体查询 | 断点切换样式 | 整体布局调整 |
| Flexbox | 弹性布局 | 一维自适应 |
| Grid | 网格布局 | 二维自适应 |
| vw/vh | 视口单位 | 字体/间距 |
| rem | 根字号单位 | 全面适配 |
| clamp() | 弹性范围值 | 流体排版 |

```css
/* 流体排版 */
h1 { font-size: clamp(1.5rem, 5vw, 3rem); }

/* 自适应网格 */
.grid {
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}
```

**知识点：** `响应式布局` `媒体查询` `Flexbox` `Grid` `流体排版`

:::

---

### Q7: 如何处理响应式图片？

> **🔥 中等 · CSS**

请说明不同屏幕加载不同图片的方案。

::: details 🔍 点击查看答案与解析

**srcset 方案：**
```html
<img src="image-400.jpg"
     srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
     sizes="(max-width: 600px) 400px, 800px"
     alt="响应式图片">
```

**picture 方案：**
```html
<picture>
  <source media="(max-width: 600px)" srcset="mobile.jpg">
  <source media="(max-width: 1024px)" srcset="tablet.jpg">
  <img src="desktop.jpg" alt="图片">
</picture>
```

**多格式支持：**
```html
<picture>
  <source type="image/webp" srcset="image.webp">
  <source type="image/jpeg" srcset="image.jpg">
  <img src="fallback.png" alt="图片">
</picture>
```

**知识点：** `srcset` `picture` `WebP` `响应式图片`

:::

---

### Q8: CSS 媒体查询的常见特性有哪些？

> **🔥 中等 · CSS**

除了屏幕宽度，还有哪些媒体特性可以使用？

::: details 🔍 点击查看答案与解析

```css
/* 暗黑模式 */
@media (prefers-color-scheme: dark) { }

/* 减弱动画偏好 */
@media (prefers-reduced-motion: reduce) { }

/* 高分辨率屏幕 */
@media (-webkit-min-device-pixel-ratio: 2) { }

/* 横屏/竖屏 */
@media (orientation: landscape) { }

/* 悬停能力 */
@media (hover: hover) { }

/* 触控设备 */
@media (pointer: coarse) { }

/* 打印样式 */
@media print { }

/* 强色模式 */
@media (prefers-contrast: high) { }
```

**知识点：** `媒体查询` `暗黑模式` `无障碍` `设备适配`

:::

---

### Q9: 容器查询（Container Queries）是什么？和媒体查询的区别？

> **🔥 中等 · CSS**

请解释容器查询的概念，以及与媒体查询的区别。

::: details 🔍 点击查看答案与解析

**容器查询**允许根据元素容器（而非视口）的尺寸来应用样式。

```css
.card {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card-title { font-size: 1.5rem; }
}
```

| 特性 | 媒体查询 | 容器查询 |
|------|---------|---------|
| 查询对象 | 视口 | 容器元素 |
| 适用场景 | 整体页面布局 | 组件内部响应 |
| 可复用性 | 全局断点 | 组件级断点 |

**浏览器支持：** Chrome 105+、Firefox 110+、Safari 16+

**知识点：** `容器查询` `Container Queries` `组件响应式`

:::

---

### Q10: CSS 的 clamp()、min()、max() 函数如何用于响应式？

> **🔥 中等 · CSS**

请解释这三个函数的用法及在响应式设计中的应用。

::: details 🔍 点击查看答案与解析

```css
/* clamp(最小值, 偏好值, 最大值) */
h1 { font-size: clamp(1.5rem, 5vw, 3rem); }

/* min() 取较小值 */
.container { width: min(100%, 1200px); }

/* max() 取较大值 */
.box { width: max(200px, 50vw); }
```

**流体排版：**
```css
h1 { font-size: clamp(2rem, 4vw, 4rem); }
h2 { font-size: clamp(1.5rem, 3vw, 3rem); }

.section {
  padding: clamp(1rem, 5vw, 4rem);
}
```

**自适应网格：**
```css
.card-grid {
  grid-template-columns: repeat(
    auto-fill,
    minmax(min(250px, 100%), 1fr)
  );
}
```

**知识点：** `clamp()` `min()` `max()` `流体排版`

:::

---

### Q11: 响应式图片有哪些方案？srcset 和 picture 元素的用法

> **🔥 中等 · CSS**

请说明响应式图片的实现方案，以及 srcset 和 picture 的区别。

::: details 🔍 点击查看答案与解析

**srcset（分辨率切换）：** 同一张图的不同分辨率版本

```html
<img src="image-800.jpg"
     srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
     sizes="(max-width: 600px) 400px, 800px"
     alt="图片">
```

**picture（艺术指导）：** 不同裁剪/内容的图片

```html
<picture>
  <source media="(max-width: 600px)" srcset="mobile.jpg">
  <source media="(max-width: 1024px)" srcset="tablet.jpg">
  <img src="desktop.jpg" alt="图片">
</picture>
```

| 特性 | srcset | picture |
|------|--------|---------|
| 用途 | 分辨率切换 | 艺术指导 |
| 选择依据 | 屏幕尺寸/DPR | 媒体查询 |
| 图片内容 | 相同（不同分辨率） | 可完全不同 |

**多格式支持：**
```html
<picture>
  <source type="image/webp" srcset="image.webp">
  <source type="image/jpeg" srcset="image.jpg">
  <img src="fallback.png" alt="图片">
</picture>
```

**知识点：** `响应式图片` `srcset` `picture` `WebP`

:::