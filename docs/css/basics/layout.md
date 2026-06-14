---
title: CSS 布局方式
description: Flexbox、Grid 布局、两栏/三栏布局、圣杯/双飞翼、居中方案、清除浮动等核心面试题
---

# CSS 布局方式

CSS 布局是前端开发的核心技能。掌握 Flexbox、Grid 以及各种经典布局方案对于实现复杂页面至关重要。

---

## 📝 题目

### Q1: Flexbox 的容器属性和项目属性有哪些？

> **⭐ 简单 · CSS**

请列举常用的 Flexbox 属性。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**容器属性：**
```css
.container {
  /* 主轴方向 */
  flex-direction: row | row-reverse | column | column-reverse;
  
  /* 换行 */
  flex-wrap: nowrap | wrap | wrap-reverse;
  
  /* 简写 */
  flex-flow: <direction> <wrap>;
  
  /* 主轴对齐 */
  justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly;
  
  /* 交叉轴对齐 */
  align-items: flex-start | flex-end | center | baseline | stretch;
  
  /* 多行对齐 */
  align-content: flex-start | flex-end | center | space-between | space-around | stretch;
}
```

**项目属性：**
```css
.item {
  /* 排序 */
  order: <integer>;
  
  /* 放大比例 */
  flex-grow: <number>;
  
  /* 缩小比例 */
  flex-shrink: <number>;
  
  /* 基础大小 */
  flex-basis: <length> | auto;
  
  /* 简写 */
  flex: <grow> <shrink> <basis>;
  
  /* 单独对齐 */
  align-self: auto | flex-start | flex-end | center | baseline | stretch;
}
```

**知识点：** `Flexbox` `容器属性` `项目属性`

:::

---

### Q2: Grid 布局的基本用法

> **⭐ 简单 · CSS**

请说明 Grid 布局的容器和项目属性。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**容器属性：**
```css
.container {
  /* 定义行列 */
  grid-template-columns: 100px 1fr 2fr;
  grid-template-rows: repeat(3, 100px);
  
  /* 定义区域 */
  grid-template-areas: 
    "header header header"
    "sidebar main main"
    "footer footer footer";
  
  /* 间距 */
  gap: 20px;
  column-gap: 10px;
  row-gap: 10px;
  
  /* 对齐 */
  justify-items: start | end | center | stretch;
  align-items: start | end | center | stretch;
  justify-content: start | end | center | space-around | space-between | space-evenly;
  align-content: start | end | center | space-around | space-between | space-evenly;
}
```

**项目属性：**
```css
.item {
  /* 位置 */
  grid-column-start: 1;
  grid-column-end: 3;
  grid-row-start: 1;
  grid-row-end: 2;
  
  /* 简写 */
  grid-column: 1 / 3;
  grid-row: 1 / 2;
  grid-area: header;  /* 或 row-start / col-start / row-end / col-end */
  
  /* 单独对齐 */
  justify-self: start | end | center | stretch;
  align-self: start | end | center | stretch;
}
```

**知识点：** `Grid 布局` `网格容器` `网格项目`

:::

---

### Q3: 实现两栏布局的 5 种方法

> **🔥 中等 · CSS**

左侧固定 200px，右侧自适应，请用至少 5 种方法实现。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**1. 浮动 + BFC**
```css
.left {
  float: left;
  width: 200px;
}
.right {
  overflow: hidden;  /* BFC */
}
```

**2. 绝对定位**
```css
.parent {
  position: relative;
}
.left {
  position: absolute;
  left: 0;
  width: 200px;
}
.right {
  margin-left: 200px;
}
```

**3. Flexbox（推荐）**
```css
.parent {
  display: flex;
}
.left {
  width: 200px;
}
.right {
  flex: 1;
}
```

**4. Grid**
```css
.parent {
  display: grid;
  grid-template-columns: 200px 1fr;
}
```

**5. 表格布局（不推荐）**
```css
.parent {
  display: table;
  width: 100%;
}
.left, .right {
  display: table-cell;
}
.left {
  width: 200px;
}
```

**知识点：** `两栏布局` `Flexbox` `Grid`

:::

---

### Q4: 实现三栏布局的方法

> **🔥 中等 · CSS**

左右固定 200px，中间自适应，请列举实现方法。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**1. Flexbox**
```css
.parent {
  display: flex;
}
.left, .right {
  width: 200px;
}
.center {
  flex: 1;
}
```

**2. Grid**
```css
.parent {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
}
```

**3. 浮动 + BFC**
```css
.left { float: left; width: 200px; }
.right { float: right; width: 200px; }
.center {
  margin: 0 200px;  /* 或 overflow: hidden */
}
```

**4. 绝对定位**
```css
.parent { position: relative; }
.left { position: absolute; left: 0; width: 200px; }
.right { position: absolute; right: 0; width: 200px; }
.center { margin: 0 200px; }
```

**知识点：** `三栏布局` `Flexbox` `Grid`

:::

---

### Q5: 圣杯布局和双飞翼布局的区别

> **💀 困难 · CSS**

请实现圣杯布局和双飞翼布局，并说明区别。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**圣杯布局：**
```html
<div class="container">
  <div class="center">中间</div>
  <div class="left">左侧</div>
  <div class="right">右侧</div>
</div>
```

```css
.container {
  padding: 0 200px;  /* 两侧预留空间 */
}
.center, .left, .right {
  float: left;
}
.center {
  width: 100%;
}
.left {
  width: 200px;
  margin-left: -100%;
  position: relative;
  left: -200px;
}
.right {
  width: 200px;
  margin-left: -200px;
  position: relative;
  right: -200px;
}
```

**双飞翼布局：**
```html
<div class="container">
  <div class="center">
    <div class="inner">中间</div>
  </div>
  <div class="left">左侧</div>
  <div class="right">右侧</div>
</div>
```

```css
.container {
  /* 不需要 padding */
}
.center, .left, .right {
  float: left;
}
.center {
  width: 100%;
}
.inner {
  margin: 0 200px;  /* 通过内部 margin 留空间 */
}
.left {
  width: 200px;
  margin-left: -100%;
}
.right {
  width: 200px;
  margin-left: -200px;
}
```

**区别：**
| 特性 | 圣杯布局 | 双飞翼布局 |
|------|---------|-----------|
| 容器 padding | 需要 | 不需要 |
| 额外元素 | 不需要 | 需要内层 div |
| 定位方式 | position | 浮动 |

**知识点：** `圣杯布局` `双飞翼布局` `经典布局`

:::

---

### Q6: 水平垂直居中的 8 种方法

> **🔥 中等 · CSS**

请列举至少 8 种实现水平垂直居中的方法。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**1. 绝对定位 + transform**
```css
.parent { position: relative; }
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

**2. Flexbox（推荐）**
```css
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

**3. Grid**
```css
.parent {
  display: grid;
  place-items: center;
}
```

**4. 绝对定位 + margin**
```css
.parent { position: relative; }
.child {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200px;
  height: 100px;
  margin: -50px 0 0 -100px;
}
```

**5. 表格布局**
```css
.parent {
  display: table-cell;
  text-align: center;
  vertical-align: middle;
}
.child {
  display: inline-block;
}
```

**6. 绝对定位 + auto**
```css
.parent { position: relative; }
.child {
  position: absolute;
  top: 0; left: 0; bottom: 0; right: 0;
  margin: auto;
  width: 200px;
  height: 100px;
}
```

**7. Flexbox without size**
```css
.parent {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
```

**8. Grid full viewport**
```css
.parent {
  display: grid;
  min-height: 100vh;
  place-items: center;
}
```

**知识点：** `水平垂直居中` `Flexbox` `绝对定位`

:::

---

### Q7: sticky 定位的原理和使用场景

> **⭐ 简单 · CSS**

```css
.header {
  position: sticky;
  top: 0;
}
```

请解释 sticky 定位的工作原理。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**工作原理：**
1. 元素在正常文档流中
2. 滚动到阈值（top 值）时固定
3. 离开包含块时恢复滚动

**生效条件：**
- 必须设置 `top`、`bottom`、`left` 或 `right`
- 祖先元素不能超过阈值高度
- 不能用于 inline 元素

**使用场景：**
```css
/* 吸顶导航 */
.nav {
  position: sticky;
  top: 0;
}

/* 表格标题 */
th {
  position: sticky;
  top: 0;
  background: white;
}

/* 侧边目录 */
.toc {
  position: sticky;
  top: 20px;
}
```

**特点：**
- 相对定位和固定定位的混合
- 不脱离文档流
- 支持过渡动画

**知识点：** `sticky` `定位` `吸顶效果`

:::

---

### Q8: 清除浮动的方法

> **⭐ 简单 · CSS**

请列举清除浮动的多种方法。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**1. 额外元素法**
```html
<div class="clearfix">
  <div class="float">浮动元素</div>
  <div style="clear: both;"></div>
</div>
```

**2. overflow 法（推荐）**
```css
.clearfix {
  overflow: hidden;  /* 或 auto */
}
```

**3. 伪元素法（最常用）**
```css
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}
```

**4. BFC 法**
```css
.clearfix {
  display: flow-root;  /* 现代浏览器 */
}
```

**5. 父元素浮动（不推荐）**
```css
.parent {
  float: left;
}
```

**最佳实践：**
```css
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}
```

**知识点：** `清除浮动` `clearfix` `BFC`

:::

---

### Q9: Flex 和 Grid 的区别及选择

> **🔥 中等 · CSS**

```html
<!-- 一维布局用 Flex -->
<nav>
  <a href="#">Link 1</a>
  <a href="#">Link 2</a>
  <a href="#">Link 3</a>
</nav>

<!-- 二维布局用 Grid -->
<div class="gallery">
  <img src="1.jpg">
  <img src="2.jpg"><img src="3.jpg">
</div>
```

Flex 和 Grid 有什么区别？如何选择？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

| 特性 | Flexbox | Grid |
|------|---------|------|
| 维度 | 一维（行或列） | 二维（行和列） |
| 对齐 | 内容优先 | 布局优先 |
| 项目大小 | 根据内容 | 根据网格 |
| 重叠 | 不支持 | 支持 |
| 能力 | 相对简单 | 更强大复杂 |

**选择建议：**
```css
/* 使用 Flexbox */
- 导航栏
- 按钮组
- 表单元素对齐
- 单行/单列布局

/* 使用 Grid */
- 页面整体布局
- 图片画廊
- 复杂表单
- 需要行列对齐
- 需要元素重叠
```

**组合使用：**
```css
.parent {
  display: grid;  /* 整体布局 */
  grid-template-columns: 200px 1fr;
}
.sidebar {
  display: flex;  /* 内部元素排列 */
  flex-direction: column;
}
```

**知识点：** `Flex vs Grid` `布局选择` `一维二维`

:::

---

### Q10: CSS3 有哪些新特性？

> **⭐ 简单 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 类别 | 属性 | 说明 |
|------|------|------|
| 动画 | animation / transition | 关键帧动画 / 过渡效果 |
| 变换 | transform | rotate/scale/translate/skew |
| 圆角 | border-radius | 圆角边框 |
| 阴影 | box-shadow / text-shadow | 盒阴影 / 文字阴影 |
| 布局 | Flexbox / Grid | 弹性布局 / 网格布局 |
| 渐变 | linear-gradient / radial-gradient | 线性/径向渐变 |
| 背景 | background-size / background-clip / multiple bg | 多背景/裁剪/尺寸 |
| 选择器 | :nth-child / :not / :nth-of-type | 新增伪类 |
| 伪元素 | ::before / ::after | 内容生成 |
| 边框 | border-image | 图片边框 |
| 文字 | word-wrap / text-overflow / @font-face | 换行/溢出/自定义字体 |
| 媒体 | @media | 响应式设计 |
| 滤镜 | filter | blur/grayscale/opacity 等 |
| 变量 | --custom-property / var() | CSS 自定义属性 |
| 用户界面 | resize / outline-offset / box-sizing | 缩放/轮廓/盒模型 |

```css
/* 实战示例 */
.card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* CSS 变量 */
:root { --primary: #42b883; }
.btn { background: var(--primary); }

/* CSS Grid */
.layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
```

**知识点：** `CSS3` `新特性` `Flexbox` `Grid` `动画` `渐变` `CSS 变量`

:::

---

### Q11: 伪元素和伪类有什么区别？

> **🔥 中等 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**伪类（Pseudo-class）：** 选择元素的某种**状态**，用单冒号 `:`

**伪元素（Pseudo-element）：** 创建元素的某个**部分**，用双冒号 `::`

| 维度 | 伪类 | 伪元素 |
|------|------|--------|
| 语法 | `:hover` | `::before` |
| 作用 | 选择已有元素的特殊状态 | 创建虚拟元素 |
| 数量 | 一个选择器可多个 | 每个选择器最多 1 个 |
| DOM | 不创建新节点 | 创建虚拟 DOM 节点 |
| 优先级 | 与类相同 (0,1,0) | 与元素相同 (0,0,1) |

```css
/* 伪类 — 选择状态 */
a:hover { color: red; }           /* 悬停状态 */
li:first-child { font-weight: bold; } /* 第一个子元素 */
input:focus { border-color: blue; }   /* 聚焦状态 */
input:not(.disabled) { cursor: pointer; } /* 排除 */
tr:nth-child(odd) { background: #f5f5f5; } /* 奇数行 */

/* 伪元素 — 创建虚拟元素 */
.quote::before { content: '"'; }   /* 前面加引号 */
.clearfix::after {                 /* 清除浮动 */
  content: '';
  display: block;
  clear: both;
}
p::first-line { font-weight: bold; } /* 首行加粗 */
p::selection { background: yellow; }  /* 选中样式 */
```

**常见伪类：** `:hover` `:active` `:focus` `:first-child` `:last-child` `:nth-child()` `:not()` `:checked` `:disabled` `:root` `:empty`

**常见伪元素：** `::before` `::after` `::first-line` `::first-letter` `::selection` `::placeholder`

**知识点：** `伪类` `伪元素` `选择器` `单冒号` `双冒号`

:::

---

### Q12: CSS 中哪些属性可继承？哪些不可继承？

> **🔥 中等 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**可继承属性（子元素自动获得父元素的值）：**

| 类别 | 属性 |
|------|------|
| 字体 | font-family / font-size / font-weight / font-style / font-variant |
| 文本 | text-align / text-indent / text-transform / line-height / word-spacing / letter-spacing |
| 颜色 | color |
| 可见性 | visibility |
| 列表 | list-style / list-style-type / list-style-position |
| 表格 | border-collapse / border-spacing |
| 其他 | cursor / quotes |

**不可继承属性：**

| 类别 | 属性 |
|------|------|
| 盒模型 | width / height / margin / padding / border |
| 布局 | display / position / float / clear / overflow |
| 背景 | background / background-color / background-image |
| 定位 | top / right / bottom / left / z-index |
| 其他 | min-width / max-width / min-height / max-height / vertical-align |

```css
/* 继承示例 */
body {
  color: #333;          /* 子元素都会继承 */
  font-family: Arial;   /* 子元素都会继承 */
  background: #fff;     /* 子元素不会继承！ */
  border: 1px solid;    /* 子元素不会继承 */
}

div {
  /* color: #333 — 继承自 body */
  /* font-family: Arial — 继承自 body */
  /* background: transparent — 默认值，不是继承！ */
}

/* 强制继承 */
.child {
  background: inherit;  /* 显式继承不可继承属性 */
}

/* all: initial 重置所有继承 */
.reset {
  all: initial;  /* 重置所有属性为初始值 */
}
```

**注意：** `background` 的默认值是 `transparent`，不是继承！这是很多人误以为不可继承属性会继承父值的原因。

**知识点：** `CSS 继承` `可继承属性` `不可继承属性` `inherit` `initial`

:::

---

### Q13: transition 和 animation 的区别？

> **🔥 中等 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心区别：**

| 特性 | transition | animation |
|------|------------|-----------|
| 触发方式 | 状态改变（hover/class） | 自动执行/手动触发 |
| 关键帧 | ❌ 只有起止 | ✅ 可定义多帧 |
| 循环 | ❌ 不支持 | ✅ infinite |
| 控制粒度 | 粗（起始→结束） | 细（百分比控制） |
| 暂停/继续 | ❌ 不支持 | ✅ animation-play-state |
| 触发时机 | 属性变化时 | 加载后/添加类后 |

**transition 示例：**

```css
.btn {
  background: blue;
  transition: background 0.3s ease;
}

.btn:hover {
  background: red;
}
```

**animation 示例：**

```css
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.box {
  animation: fadeIn 1s ease-in-out;
  animation: fadeIn 1s ease-in-out infinite;  /* 无限循环 */
  animation: fadeIn 1s ease-in-out alternate;  /* 往返动画 */
}
```

**选择建议：**

- **简单状态切换** → transition（hover、focus、class 切换）
- **复杂流程动画** → animation（Loading、引导动画、循环效果）
- **需要暂停/继续** → animation
- **自动触发** → animation

**知识点：** `transition` `animation` `关键帧` `状态切换` `CSS 过渡`

:::

---

### Q14: 移动端高清方案怎么做？

> **💀 困难 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**问题背景：**

移动端设备 DPR（Device Pixel Ratio）不同，导致 1px 在高清屏上显示过粗。

| 设备 | DPR | 1 物理像素 = 多少 CSS 像素 |
|------|-----|--------------------------|
| iPhone 6/7/8 | 2 | 2px |
| iPhone 6+/7+/8+ | 3 | 3px |
| Retina 屏 | 2+ | 2px+ |

**解决方案：**

**1. viewport + rem 适配方案**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no">
```

```js
// 动态设置 rem
(function() {
  const doc = document.documentElement
  const fontSize = doc.clientWidth / 10  // 10 等分
  doc.style.fontSize = fontSize + 'px'
})()
```

```css
/* 使用 rem */
.container {
  width: 10rem;  /* 假设屏幕宽 375px，则 10rem = 375px */
  padding: 0.15rem;
}
```

**2. 1px 边框解决方案**

```css
/* 方案 1: transform 缩放 */
.hairline {
  position: relative;
}

.hairline::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: #ddd;
  transform: scaleY(0.5);
  transform-origin: 0 0;
}

/* 针对 DPR=3 */
@media (-webkit-min-device-pixel-ratio: 3) {
  .hairline::after {
    transform: scaleY(0.33);
  }
}
```

```css
/* 方案 2: linear-gradient */
.border-bottom {
  background: linear-gradient(to bottom, transparent 50%, #ddd 50%);
  background-size: 100% 1px;
  background-repeat: no-repeat;
  background-position: bottom;
}
```

```css
/* 方案 3: box-shadow */
.border-shadow {
  box-shadow: 0 1px 1px -1px rgba(0, 0, 0, 0.5);
}
```

**3. vw/vh 方案**

```css
/* vw: viewport width 的 1% */
/* vh: viewport height 的 1% */

.container {
  width: 100vw;
  height: 50vh;
  padding: 2vw;
  font-size: 4vw;
}

/* 配合 postcss-px-to-viewport */
/* 自动将 px 转换为 vw */
```

**4. 完整 viewport 设置**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, viewport-fit=cover">
```

**5. 安全区域适配（刘海屏）**

```css
.container {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

**知识点：** `DPR` `rem 适配` `vw/vh` `1px 边框` `viewport` `安全区域`

:::

---

## 🔑 核心知识点总结

### 1. Flexbox

```css
.container {
  display: flex;
  justify-content: center;  /* 主轴对齐 */
  align-items: center;      /* 交叉轴对齐 */
}
```

### 2. Grid

```css
.container {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 20px;
}
```

### 3. 经典布局

- 两栏：float + BFC、flex、grid
- 三栏：flex、grid、圣杯、双飞翼
- 居中：transform、flex、grid、表格

### 4. 清除浮动

- overflow: hidden
- 伪元素 ::after
- display: flow-root

## 💡 面试技巧

1. **Flexbox**：记住容器和项目属性
2. **Grid**：理解二维布局优势
3. **经典布局**：掌握圣杯和双飞翼区别
4. **居中**：能列举 5 种以上方法
5. **清除浮动**：理解 BFC 原理### Q15: 圣杯布局/双飞翼布局的 float 实现细节

> **🔥 中等 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

圣杯布局和双飞翼布局的核心思路相同：**中间自适应，两侧固定，中间内容优先渲染**。区别在于处理侧栏定位的方式不同。

**圣杯布局：**

```html
<div class="container">
  <div class="center">center</div>
  <div class="left">left</div>
  <div class="right">right</div>
</div>
```

```css
.container {
  padding: 0 200px;  /* 为两侧留空间 */
  overflow: hidden;   /* BFC清除浮动 */
}
.center { float: left; width: 100%; }
.left {
  float: left; width: 200px;
  margin-left: -100%;          /* 拉到center左侧 */
  position: relative;
  left: -200px;                /* 补偿container的padding */
}
.right {
  float: left; width: 200px;
  margin-left: -200px;         /* 拉到container右侧 */
  position: relative;
  right: -200px;               /* 补偿container的padding */
}
```

**双飞翼布局：**

```html
<div class="center-wrap">
  <div class="center">center</div>
</div>
<div class="left">left</div>
<div class="right">right</div>
```

```css
.center-wrap { float: left; width: 100%; }
.center { margin: 0 200px; }   /* 用margin给两侧留空间 */
.left { float: left; width: 200px; margin-left: -100%; }
.right { float: left; width: 200px; margin-left: -200px; }
```

**核心技巧 — 负margin：**

```text
margin-left: -100%  → 元素拉到上一行最左侧（100%是父容器宽度=center宽度）
margin-left: -200px → 元素向左偏移自身宽度，到上一行右侧

圣杯用 position:relative + left/right 补偿padding
双飞翼用 center的margin 给侧栏留空间（不需要relative）
```

**现代Flexbox方案（推荐）：**

```css
.container {
  display: flex;
}
.left, .right { width: 200px; flex-shrink: 0; }
.center { flex: 1; }

/* HTML顺序：left → center → right */
```

| 对比 | 圣杯 | 双飞翼 | Flex |
|------|------|--------|------|
| 侧栏定位 | relative+left/right | center的margin | flex属性 |
| 额外DOM | 无 | center多一层包裹 | 无 |
| 复杂度 | 较复杂 | 中等 | 简单 |
| 兼容性 | IE6+ | IE6+ | IE10+ |
| 推荐 | 历史项目 | 历史项目 | ✅ 新项目 |

**知识点：** `圣杯布局` `双飞翼布局` `float` `负margin` `Flexbox` `三栏布局`

:::

### Q16: CSS Grid 常用布局模式

> **🔥 中等 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. 响应式网格（最常用）：**

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}
/* 自动填充，每列最小250px，自动换行 */
```

**2. 经典页面布局：**

```css
.layout {
  display: grid;
  grid-template-areas:
    "header header  header"
    "sidebar main   aside"
    "footer footer  footer";
  grid-template-columns: 200px 1fr 200px;
  grid-template-rows: 60px 1fr 60px;
  min-height: 100vh;
}
.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.aside   { grid-area: aside; }
.footer  { grid-area: footer; }
```

**3. 12列栅格系统：**

```css
.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 16px;
}
.col-6  { grid-column: span 6; }  /* 占6列=50% */
.col-4  { grid-column: span 4; }  /* 占4列=33.3% */
.col-3  { grid-column: span 3; }  /* 占3列=25% */
.col-8  { grid-column: span 8; }  /* 占8列=66.7% */
```

**4. 不规则布局：**

```css
.masonry {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-auto-rows: 100px;
  gap: 16px;
}
.item-2row { grid-row: span 2; }  /* 跨2行 */
.item-2col { grid-column: span 2; }  /* 跨2列 */
```

**5. 居中（Grid最简方式）：**

```css
.center {
  display: grid;
  place-items: center;  /* 水平+垂直居中，一行搞定 */
}
```

**Grid vs Flexbox 选择：**

```text
用 Grid：
- 二维布局（行+列）
- 整体页面框架
- 卡片网格
- 复杂不规则布局

用 Flexbox：
- 一维布局（单行或单列）
- 导航栏
- 工具栏
- 元素对齐/分布
```

**知识点：** `CSS Grid` `grid-template-areas` `auto-fill` `minmax` `响应式网格` `12列栅格`

:::

### Q17: 圣杯布局和双飞翼布局的实现与区别？

> **🔥 中等 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**圣杯布局和双飞翼布局都是三栏布局方案，中间栏优先渲染，两侧固定宽度。**

---

## 一、共同目标

```text
┌─────────────────────────────────────────┐
│           Header（100% 宽度）            │
├──────────┬──────────────┬───────────────┤
│  Left    │   Center     │    Right      │
│  200px   │  自适应      │    200px      │
├──────────┴──────────────┴───────────────┤
│           Footer（100% 宽度）            │
└─────────────────────────────────────────┘

要求：
1. 中间栏自适应（占满剩余空间）
2. 两侧固定 200px
3. 中间栏内容优先渲染（SEO 友好）
4. 中间栏先加载完就先显示（用户体验）
```

---

## 二、圣杯布局实现

**核心思路：container 使用 padding 给两侧留空间，侧栏用 position + negative margin 定位。**

```html
<div class="cup-container">
  <div class="center">中间内容（优先渲染）</div>
  <div class="left">左侧边栏</div>
  <div class="right">右侧边栏</div>
</div>
```

```css
.cup-container {
  padding: 0 200px;        /* 关键：为两侧栏预留空间 */
  overflow: hidden;        /* BFC 清除浮动 */
}

.center, .left, .right {
  float: left;
}

.center {
  width: 100%;             /* 中间占满整行（含 padding 区域） */
}

.left {
  width: 200px;
  margin-left: -100%;      /* 向左移动 100%（父容器宽度）到最左侧 */
  position: relative;
  left: -200px;            /* 补偿 container 的左侧 padding */
}

.right {
  width: 200px;
  margin-left: -200px;     /* 向左移动自身宽度到右侧 */
  position: relative;
  right: -200px;           /* 补偿 container 的右侧 padding */
}
```

**圣杯布局原理：**

```text
第 1 步：三个元素都 float:left
  center(100%)  → 占一整行（含 padding）
  left(200px)   → 被挤到第二行
  right(200px)  → 被挤到第三行

第 2 步：left 用 margin-left:-100%
  -100% 是父容器宽度（含 padding）
  left 被拉到第一行最左侧

第 3 步：right 用 margin-left:-200px
  -200px 是自身宽度
  right 被拉到第一行右侧

第 4 步：用 position relative + left/right 补偿 padding
  left: -200px  → left 向左补偿左侧 padding
  right: -200px → right 向右补偿右侧 padding
```

---

## 三、双飞翼布局实现

**核心思路：在中间栏内部加一层 wrapper，通过 wrapper 的 margin 为两侧留空间。**

```html
<div class="wing-container">
  <div class="center-wrap">      <!-- 新增的 wrapper -->
    <div class="center">中间内容</div>
  </div>
  <div class="left">左侧边栏</div>
  <div class="right">右侧边栏</div>
</div>
```

```css
.wing-container {
  /* 不需要 padding */
}

.center-wrap, .left, .right {
  float: left;
}

.center-wrap {
  width: 100%;                   /* 占满整行 */
}

.center {
  margin: 0 200px;               /* 关键：用 margin 为两侧留空间 */
}

.left {
  width: 200px;
  margin-left: -100%;            /* 拉到最左侧 */
}

.right {
  width: 200px;
  margin-left: -200px;           /* 拉到右侧 */
}
```

**双飞翼布局原理：**

```text
第 1 步：三个 wrapper 都 float:left
  center-wrap(100%) → 占一整行
  left(200px)       → 被挤到第二行
  right(200px)      → 被挤到第三行

第 2 步：left 用 margin-left:-100%
  left 被拉到第一行最左侧

第 3 步：right 用 margin-left:-200px
  right 被拉到第一行右侧

第 4 步：中间内容用 margin:0 200px 留空间
  center 在 center-wrap 内部
  margin 将内容向外"挤"，给两侧栏腾出空间
```

---

## 四、圣杯 vs 双飞翼 对比

| 维度 | 圣杯布局 | 双飞翼布局 |
|------|---------|-----------|
| **额外 DOM** | ❌ 不需要 | ✅ center 需要 wrapper |
| **container 样式** | 需要 padding | 不需要特殊样式 |
| **侧栏定位** | position + left/right | 纯 margin 负值 |
| **容器被遮挡** | ✅ 会被侧栏覆盖 | ❌ 不会被覆盖 |
| **代码复杂度** | 较复杂 | 中等 |
| **现代替代** | Flexbox | Flexbox |

**关键区别：container 是否被覆盖**

```text
圣杯布局问题：
container 设置了 padding:0 200px
但 left/right 覆盖到了 padding 区域
→ 如果 container 有背景色，会被侧栏覆盖

双飞翼布局解决：
center 的 margin 将内容真正"挤"在中间
container 没有被覆盖问题
```

---

## 五、现代 Flexbox 方案（推荐）

```html
<div class="modern-layout">
  <div class="left">左侧</div>
  <div class="center">中间（优先）</div>
  <div class="right">右侧</div>
</div>
```

```css
.modern-layout {
  display: flex;
}

.left, .right {
  width: 200px;
  flex-shrink: 0;            /* 禁止压缩 */
}

.center {
  flex: 1;                    /* 占满剩余空间 */
  order: -1;                  /* 优先渲染（HTML 顺序可任意） */
}
```

**知识点：** `圣杯布局` `双飞翼布局` `三栏布局` `float` `负 margin` `Flexbox`

:::

---

### Q18: sticky 定位的工作原理和常见坑？

> **🔥 中等 · CSS**

请解释 position: sticky 的工作原理，以及使用时的常见问题。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**sticky 定位原理：**

`position: sticky` 是相对定位和固定定位的混合体。元素在跨越特定阈值前表现为 relative，之后表现为 fixed。

```css
.sticky {
  position: sticky;
  top: 0;  /* 必须指定阈值 */
}
```

**工作机制：**
1. **在视口内**：表现为 `position: relative`
2. **滚动到阈值**：表现为 `position: fixed`
3. **父元素边界**：到达父元素底部时停止固定

**完整示例：**
```css
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
}
```

**常见坑和注意事项：**

**1. 必须指定至少一个方向阈值**
```css
/* ❌ 错误：没有阈值，sticky 无效 */
.sticky {
  position: sticky;
}

/* ✅ 正确：至少一个方向 */
.sticky {
  position: sticky;
  top: 0;
}
```

**2. 父元素 overflow 不能是 hidden/auto/scroll**
```css
/* ❌ 父元素 overflow 触发 BFC，sticky 失效 */
.parent {
  overflow: hidden;
}

/* ✅ 解决：修改父元素 overflow */
.parent {
  overflow: visible;
}
```

**3. 父元素高度必须大于 sticky 元素**
```css
/* ❌ 父元素与 sticky 等高，没有滚动空间 */
.parent {
  height: 50px;
}
.sticky {
  height: 50px;
}

/* ✅ 父元素足够高 */
.parent {
  height: 500px;
}
```

**4. 表格中的 sticky**
```css
/* ✅ 表格头 sticky */
th {
  position: sticky;
  top: 0;
  background: white;
}
```

**5. z-index 层叠问题**
```css
/* sticky 元素可能需要 z-index */
.sticky {
  position: sticky;
  top: 0;
  z-index: 100;
}
```

**实际应用场景：**

**1. 吸顶导航**
```css
.nav {
  position: sticky;
  top: 0;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
```

**2. 列表分组头**
```css
.group-header {
  position: sticky;
  top: 0;
  background: #f5f5f5;
}
```

**3. 表格固定表头**
```css
thead th {
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
}
```

**4. 侧边目录导航**
```css
.toc {
  position: sticky;
  top: 20px;  /* 距离顶部 20px 开始固定 */
}
```

**浏览器兼容性：**
- Chrome 56+ ✅
- Firefox 32+ ✅
- Safari 6.1+ ✅ (需要 -webkit- 前缀)
- Edge 16+ ✅
- IE ❌ 不支持

```css
/* 兼容旧 Safari */
.sticky {
  position: -webkit-sticky;
  position: sticky;
  top: 0;
}
```

**知识点：** `sticky` `定位` `滚动效果` `常见陷阱`

:::

---

### Q19: Flexbox 的 flex: 1 和 flex: auto 有什么区别？

> **🔥 中等 · CSS**

请解释 flex: 1 和 flex: auto 的区别及使用场景。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**flex 简写属性：**
```css
flex: <flex-grow> <flex-shrink> <flex-basis>;
```

**flex: 1 的展开：**
```css
flex: 1;
/* 等价于 */
flex: 1 1 0%;
/* flex-grow: 1 */
/* flex-shrink: 1 */
/* flex-basis: 0% */
```

**flex: auto 的展开：**
```css
flex: auto;
/* 等价于 */
flex: 1 1 auto;
/* flex-grow: 1 */
/* flex-shrink: 1 */
/* flex-basis: auto */
```

**核心区别：flex-basis 不同**

| 属性 | flex-grow | flex-shrink | flex-basis | 行为 |
|------|-----------|-------------|------------|------|
| flex: 1 | 1 | 1 | 0% | 忽略内容宽度 |
| flex: auto | 1 | 1 | auto | 考虑内容宽度 |

**实际效果对比：**

```html
<div class="container">
  <div class="item1" style="flex: 1;">短</div>
  <div class="item2" style="flex: 1;">这是一段很长的内容内容内容</div>
</div>
```

```css
.container {
  display: flex;
  width: 500px;
}

/* flex: 1 - 两列等宽 (各 250px) */
/* 因为 flex-basis: 0%，忽略内容宽度 */

.item1, .item2 {
  flex: 1;
}
```

```html
<div class="container">
  <div class="item1" style="flex: auto;">短</div>
  <div class="item2" style="flex: auto;">这是一段很长的内容内容内容</div>
</div>
```

```css
/* flex: auto - 第二列更宽 */
/* 因为 flex-basis: auto，考虑内容宽度 */

.item1, .item2 {
  flex: auto;
}
```

**使用场景：**

**flex: 1 适用场景：**

**1. 等分布局**
```css
.columns {
  display: flex;
}

.column {
  flex: 1;  /* 所有列等宽 */
}
```

**2. 填充剩余空间**
```css
.layout {
  display: flex;
}

.sidebar {
  width: 200px;
  flex-shrink: 0;
}

.main {
  flex: 1;  /* 占据所有剩余空间 */
}
```

**3. 表单布局**
```css
.form-row {
  display: flex;
  gap: 10px;
}

.form-row input {
  flex: 1;  /* 输入框等宽 */
}
```

**flex: auto 适用场景：**

**1. 内容优先的按钮组**
```css
.button-group {
  display: flex;
  gap: 10px;
}

.btn {
  flex: auto;  /* 按钮宽度根据内容 */
  white-space: nowrap;
}
```

**2. 标签列表**
```css
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  flex: auto;  /* 标签宽度适应内容 */
}
```

**3. 导航菜单**
```css
.nav {
  display: flex;
}

.nav-item {
  flex: auto;  /* 根据文字宽度分配 */
}
```

**其他常见值：**

```css
/* 不伸缩 */
flex: none;      /* 0 0 auto */

/* 只放大不缩小 */
flex: 1 0 auto;

/* 只缩小不放大 */
flex: 0 1 auto;

/* 固定宽度 */
flex: 0 0 200px; /* width: 200px */
```

**最佳实践：**
- 需要等宽分布：用 `flex: 1`
- 需要内容自适应：用 `flex: auto`
- 固定尺寸：用 `flex: 0 0 <size>`
- 不要混用 flex: 1 和 flex: auto 在同一容器中

**知识点：** `Flexbox` `flex 简写` `flex-basis` `布局技巧`

:::

---

### Q20: Grid 布局中 auto-fill 和 auto-fit 的区别？

> **🔥 中等 · CSS**

请解释 `repeat(auto-fill, minmax(200px, 1fr))` 和 `repeat(auto-fit, minmax(200px, 1fr))` 的区别。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**auto-fill 和 auto-fit 都用于创建响应式网格**，但处理空白列的方式不同。

**auto-fill：**
- 尽可能多地创建列
- **保留空白列**的占位

```css
.grid-auto-fill {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
```

**auto-fit：**
- 尽可能多地创建列
- **合并空白列**，让现有项扩展

```css
.grid-auto-fit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
```

**视觉对比：**

假设容器宽度 650px，每个卡片最小 200px：

```
auto-fill:
┌──────┬──────┬──────┬──────┐
│ 卡片  │ 卡片  │ 卡片  │ 空白  │  ← 空白列保留
└──────┴──────┴──────┴──────┘

auto-fit:
┌───────────┬───────────┬───────────┐
│   卡片    │   卡片    │   卡片    │  ← 卡片占据所有空间
└───────────┴───────────┴───────────┘
```

**工作原理：**

**auto-fill 工作流程：**
1. 计算容器能容纳多少列：650px ÷ 200px ≈ 3 列
2. 创建 3 列轨道（实际有内容的）+ 可能的空白轨道
3. **保留所有轨道**，包括空白轨道

**auto-fit 工作流程：**
1. 计算容器能容纳多少列
2. 创建轨道
3. **合并没有内容的轨道**
4. 有内容的轨道扩展填充

**代码对比：**

```html
<div class="container">
  <div class="card">1</div>
  <div class="card">2</div>
  <div class="card">3</div>
</div>
```

```css
/* auto-fill：可能产生空白列 */
.container-fill {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

/* auto-fit：卡片拉伸填充 */
.container-fit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
```

**使用建议：**

**选择 auto-fit 的场景：**
- 卡片数量不固定
- 希望卡片均匀分布
- 不希望出现空白列
-  сделала красивые крупные карточки

**选择 auto-fill 的场景：**
- 需要保持列的固定数量
- 占位符或 loading 状态
- 预留空间给未来内容

**实际案例：**

```css
/* 产品列表 - 推荐 auto-fit */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

/* 图片库预留位置 - 用 auto-fill */
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 10px;
}

/* 配合 minmax 实现完全响应式 */
.responsive-grid {
  grid-template-columns: repeat(
    auto-fit,
    minmax(min(250px, 100%), 1fr)
  );
}
```

**对比表格：**

| 特性 | auto-fill | auto-fit |
|------|-----------|----------|
| 空白列 | 保留 | 合并 |
| 项目宽度 | 固定 | 可拉伸 |
| 适用场景 | 占位/预订 | 内容展示 |
| 视觉效果 | 可能有空白 | 填满容器 |

**知识点：** `Grid` `auto-fill` `auto-fit` `响应式布局`

:::

---

### Q21: 如何实现一个等高布局？有几种方案？

> **🔥 中等 · CSS**

请说明实现等高布局的多种方案及其原理。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**等高布局**：多列内容不同，但视觉高度保持一致。

**方案一：Flexbox（最推荐）**
```css
.container {
  display: flex;
}

.column {
  flex: 1;
  /* 默认 stretch，自动等高 */
}
```

**原理**：Flex 容器的 `align-items: stretch` 默认值使项目等高。

```html
<div class="flex-container">
  <div class="col">短内容</div>
  <div class="col">很长很长的内容<br>...<br>...</div>
  <div class="col">中等内容</div>
</div>
```

```css
.flex-container {
  display: flex;
  /* align-items: stretch; 默认 */
}

.col {
  flex: 1;
  background: #f0f0f0;
}
```

**方案二：Grid（同样推荐）**
```css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

/* Grid 默认就是等高的 */
```

**原理**：Grid 行自动拉伸以容纳最高的项目。

```css
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.col {
  background: #f0f0f0;
}
```

**方案三：表格布局（老方法）**
```css
.container {
  display: table;
  width: 100%;
}

.column {
  display: table-cell;
  width: 33.33%;
}
```

**原理**：表格单元格天然等高。

```css
.table-container {
  display: table;
  table-layout: fixed;
  width: 100%;
}

.col {
  display: table-cell;
  background: #f0f0f0;
}
```

**方案四：padding + margin 负值（hack）**
```css
.container {
  overflow: hidden;
}

.column {
  float: left;
  width: 33.33%;
  padding-bottom: 9999px;
  margin-bottom: -9999px;
  background: #f0f0f0;
}
```

**原理**：用超大 padding 延伸背景，负 margin 抵消高度。

**方案五：伪元素背景（视觉等高）**
```html
<div class="container">
  <div class="col">短</div>
  <div class="col">长内容</div>
  <div class="col">中</div>
</div>
```

```css
.container {
  position: relative;
  background: #f0f0f0;  /* 共同背景 */
}

.col {
  position: relative;
  z-index: 1;
  background: white;  /* 覆盖多余背景 */
  /* 只有内容区域有背景，露出容器背景 */
}
```

**方案对比：**

| 方案 | 兼容性 | 代码量 | 真等高 | 推荐度 |
|------|--------|--------|--------|--------|
| Flexbox | IE10+ | 少 | ✅ | ⭐⭐⭐⭐⭐ |
| Grid | IE11+ | 少 | ✅ | ⭐⭐⭐⭐⭐ |
| 表格 | 全兼容 | 少 | ✅ | ⭐⭐⭐ |
| padding hack | 全兼容 | 中 | ❌视觉 | ⭐⭐ |
| 伪元素 | 全兼容 | 中 | ❌视觉 | ⭐⭐⭐ |

**推荐使用：**

```css
/* 现代浏览器首选 Flexbox */
.equal-height {
  display: flex;
}

.equal-height > * {
  flex: 1;
}

/* 需要更复杂布局用 Grid */
.equal-height-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
```

**注意事项：**

1. **内容溢出**：等高布局不限制内容高度
2. **响应式**：小屏可能需改为垂直堆叠
```css
@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}
```

**知识点：** `等高布局` `Flexbox` `Grid` `表格布局` `CSS hack`

:::
