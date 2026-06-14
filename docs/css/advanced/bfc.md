---
title: BFC（块级格式化上下文）
description: BFC 触发条件、特性、应用场景、与 IFC/FFC/GFC 的区别等核心面试题
---

# BFC（块级格式化上下文）

BFC（Block Formatting Context）是 CSS 中一个重要的概念，理解 BFC 对于解决布局问题非常关键。

---

## 📝 题目

### Q1: 什么是 BFC？如何触发？

> **⭐ 简单 · CSS**

请解释 BFC 的概念并列举触发条件。

::: details 🔍 点击查看答案与解析

**BFC（Block Formatting Context）**：块级格式化上下文，是 Web 页面中盒模型布局的渲染区域，决定元素如何定位以及与其他元素的关系。

**触发条件：**
1. 根元素（`<html>`）
2. `float` 不为 `none`
3. `position` 为 `absolute` 或 `fixed`
4. `overflow` 不为 `visible`（如 `hidden`、`auto`、`scroll`）
5. `display` 为 `inline-block`、`table-cell`、`table-caption`、`flex`、`grid`、`inline-flex`、`inline-grid`
6. `display: flow-root`（专门用于触发 BFC）

```css
/* 常用触发方式 */
.bfc {
  overflow: hidden;  /* 最常用 */
}

/* 或者 */
.bfc {
  display: flow-root;  /* 专门触发 BFC */
}
```

**知识点：** `BFC` `触发条件` `格式化上下文`

:::

---

### Q2: BFC 有哪些特性？

> **⭐ 简单 · CSS**

请说明 BFC 的主要特性。

::: details 🔍 点击查看答案与解析

**BFC 特性：**

1. **内部 Box 垂直排列**：BFC 内部的块级盒子会在垂直方向上一个接一个放置
2. **同一个 BFC 中相邻 Box 的 margin 会重叠**：属于同一个 BFC 的两个相邻盒子的垂直 margin 会发生折叠
3. **BFC 区域不会与浮动元素重叠**：BFC 可以阻止元素被浮动元素覆盖
4. **BFC 可以包含浮动元素**：计算 BFC 高度时，浮动元素也参与计算
5. **BFC 是独立容器**：容器里面的元素不会影响外面的元素，反之亦然

```css
/* BFC 内部的 margin 不会影响外部 */
.bfc-container {
  overflow: hidden;  /* 触发 BFC */
}

/* BFC 不会与浮动重叠 */
.float-element {
  float: left;
}

.bfc-element {
  overflow: hidden;  /* 不会被浮动元素覆盖 */
}
```

**知识点：** `BFC` `margin 折叠` `清除浮动` `隔离容器`

:::

---

### Q3: BFC 如何解决 margin 折叠问题？

> **🔥 中等 · CSS**

请说明 margin 折叠的原因及 BFC 如何解决。

::: details 🔍 点击查看答案与解析

**margin 折叠条件：**
- 属于同一个 BFC
- 垂直方向相邻（只发生在垂直方向）
- 两个块级元素

**解决方案：让它们不属于同一个 BFC**

```html
<!-- 问题：margin 折叠 -->
<div class="box" style="margin-bottom: 20px;"></div>
<div class="box" style="margin-top: 30px;"></div>
<!-- 实际间距：30px，不是 50px -->

<!-- 解决：包裹不同的 BFC -->
<div class="bfc-wrapper">
  <div class="box" style="margin-bottom: 20px;"></div>
</div>
<div class="box" style="margin-top: 30px;"></div>
<!-- 实际间距：50px -->
```

```css
.bfc-wrapper {
  overflow: hidden;  /* 触发 BFC */
}
```

**知识点：** `margin 折叠` `BFC` `垂直间距`

:::

---

### Q4: BFC 如何清除浮动？

> **🔥 中等 · CSS**

请说明 BFC 清除浮动的原理。

::: details 🔍 点击查看答案与解析

**问题：** 浮动元素脱离文档流，导致父容器高度塌陷

```html
<!-- 高度塌陷 -->
<div class="parent">
  <div class="float-child" style="float: left; height: 100px;"></div>
</div>
<!-- parent 高度为 0 -->
```

**解决方案：触发父元素 BFC**

```css
.parent {
  overflow: hidden;  /* 触发 BFC，包含浮动 */
}

/* 或者 */
.parent {
  display: flow-root;  /* 推荐方式，无副作用 */
}
```

**原理：** BFC 在计算高度时，会包含浮动元素的高度。

**各方案对比：**

| 方案 | 优点 | 缺点 |
|------|------|------|
| `overflow: hidden` | 简单 | 可能裁切内容 |
| `display: flow-root` | 专门用途，无副作用 | 兼容性（IE 不支持） |
| `clearfix` 伪元素 | 无副作用 | 代码稍多 |

**知识点：** `清除浮动` `BFC` `flow-root`

:::

---

### Q5: BFC 如何实现自适应两栏布局？

> **🔥 中等 · CSS**

请使用 BFC 实现左侧固定、右侧自适应的两栏布局。

::: details 🔍 点击查看答案与解析

**原理：** BFC 区域不会与浮动元素重叠

```html
<div class="container">
  <div class="left">左侧固定</div>
  <div class="right">右侧自适应</div>
</div>
```

```css
.left {
  float: left;
  width: 200px;
  height: 300px;
  background: #f0f0f0;
}

.right {
  overflow: hidden; /* 触发 BFC，不与浮动重叠 */
  height: 300px;
  background: #e0e0e0;
}
```

**效果：** 右侧内容不会跑到左侧浮动元素下面，自适应填满剩余空间。

**知识点：** `BFC` `两栏布局` `自适应`

:::

---

### Q6: BFC 和 IFC 的区别？

> **🔥 中等 · CSS**

请对比 BFC 和 IFC 的主要区别。

::: details 🔍 点击查看答案与解析

| 特性 | BFC（块级格式化上下文） | IFC（行内格式化上下文） |
|------|------------------------|------------------------|
| 排列方式 | 垂直排列 | 水平排列 |
| 内部元素 | 块级盒子 | 行内盒子 |
| 宽高 | 占满整行 | 由内容决定 |
| 触发 | display: block/flow-root | display: inline |
| margin 折叠 | 垂直 margin 折叠 | 水平方向有效 |

**知识点：** `BFC` `IFC` `格式化上下文`

:::

---

### Q7: 哪些 CSS 属性会创建新的 BFC？

> **🔥 中等 · CSS**

请列举所有会创建 BFC 的 CSS 属性值。

::: details 🔍 点击查看答案与解析

| 属性 | 值 | 说明 |
|------|------|------|
| `float` | `left` / `right` | 浮动元素 |
| `position` | `absolute` / `fixed` | 绝对/固定定位 |
| `overflow` | `hidden` / `auto` / `scroll` | 非 visible |
| `display` | `inline-block` | 行内块 |
| `display` | `table-cell` / `table-caption` | 表格元素 |
| `display` | `flex` / `inline-flex` | 弹性盒 |
| `display` | `grid` / `inline-grid` | 网格 |
| `display` | `flow-root` | **推荐方式** |
| `contain` | `layout` / `content` / `strict` | CSS Containment |

**最佳实践：** `display: flow-root` 是创建 BFC 最安全的方式，没有副作用。

```css
.container {
  display: flow-root; /* 推荐：专门用于触发 BFC */
}
```

**知识点：** `BFC` `触发条件` `flow-root`

:::

---

### Q8: BFC 在实际开发中常见的应用场景？

> **🔥 中等 · CSS**

请列举 BFC 在实际项目中的常见应用。

::: details 🔍 点击查看答案与解析

**1. 清除浮动**
```css
.container {
  display: flow-root; /* 触发 BFC，包含浮动子元素 */
}
```

**2. 防止 margin 折叠**
```css
.wrapper {
  overflow: hidden; /* 创建新 BFC，阻止 margin 折叠 */
}
```

**3. 自适应两栏布局**
```css
.sidebar { float: left; width: 200px; }
.main { overflow: hidden; /* BFC 不与浮动重叠 */ }
```

**4. 防止文字环绕浮动元素**
```css
.content { overflow: hidden; /* BFC 不与浮动重叠 */ }
```

**知识点：** `BFC` `清除浮动` `margin折叠` `两栏布局`

:::

---

### Q9: IFC（行内格式化上下文）是什么？vertical-align 的基线规则？

> **🔥 中等 · CSS**

请解释 IFC 的概念以及 vertical-align 的工作原理。

::: details 🔍 点击查看答案与解析

**IFC（Inline Formatting Context）** 是处理行内元素的格式化上下文。

**IFC 特点：**
1. 内部只能包含行内元素
2. 元素在一行内水平排列
3. 高度由行高决定

**基线（Baseline）概念：**

基线是字母（如 a, x, n）底部的参考线。

**vertical-align 取值：**

| 值 | 含义 |
|----|------|
| baseline | 基线对齐（默认） |
| top | 顶部对齐 |
| middle | 中间对齐 |
| bottom | 底部对齐 |
| text-top | 文本顶部 |
| text-bottom | 文本底部 |

**常见问题：图片下的间隙**

```css
/* 解决方案 1 */
img { vertical-align: bottom; }

/* 解决方案 2 */
img { display: block; }

/* 解决方案 3 */
div { line-height: 0; }
```

**知识点：** `IFC` `vertical-align` `基线对齐`

:::

---

### Q10: CSS 新的格式化上下文：FFC（弹性盒）和 GFC（网格）的特点？

> **🔥 中等 · CSS**

请解释 Flexbox 和 Grid 创建的格式化上下文的特点。

::: details 🔍 点击查看答案与解析

**FFC（Flex Formatting Context）** - `display: flex`

特点：一维布局、项目可伸缩、主轴和交叉轴对齐

**GFC（Grid Formatting Context）** - `display: grid`

特点：二维布局、网格线定位、命名区域、自动填充

| 特性 | FFC (Flex) | GFC (Grid) |
|------|------------|------------|
| 维度 | 一维 | 二维 |
| 对齐 | 项目级 | 区域级 |
| 内容优先 | ✅ | ❌ |
| 布局优先 | ❌ | ✅ |

```css
/* FFC - 一维布局 */
.nav { display: flex; gap: 16px; }

/* GFC - 二维布局 */
.page {
  display: grid;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}
```

**知识点：** `FFC` `GFC` `Flexbox` `Grid` `格式化上下文`

:::