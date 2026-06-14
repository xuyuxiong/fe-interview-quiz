---
title: CSS 预处理器与现代 CSS 面试题
description: CSS 预处理器、CSS Modules、CSS-in-JS、Tailwind 等 8 道核心面试题
---

# CSS 预处理器与现代 CSS 面试题

> **📚 共 8 题 · 简单 30% · 中等 50% · 困难 20%**

---

### Q1: Sass、Less、Stylus 有什么区别？

> **⭐ 简单 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**对比:**

| 特性 | Sass | Less | Stylus |
|------|------|------|--------|
| 语法 | .scss/.sass | .less | .styl |
| 变量符号 | $ | @ | 无 |
| 嵌套 | ✅ | ✅ | ✅ |
| 混入 | ✅ | ✅ | ✅ |
| 函数 | ✅ | ✅ | ✅ |
| 浏览器 | 编译后 | 编译后 | 编译后 |

**Sass 示例:**

```scss
$primary-color: #007bff;

@mixin button($bg: $primary-color) {
  background: $bg;
  color: white;
  
  &:hover {
    background: darken($bg, 10%);
  }
}

.btn {
  @include button();
  
  &--large {
    padding: 15px 30px;
  }
}
```

**知识点：** `Sass` `Less` `预处理器`

:::

---

### Q2: CSS Modules 原理是什么？

> **🔥 中等 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**原理:**

构建时为类名生成唯一 hash，实现局部作用域。

```css
/* button.module.css */
.btn {
  color: blue;
}

.btn-primary {
  background: blue;
}
```

```js
// 构建后
// .btn → .button_btn__abc123
// .btn-primary → .button_btn-primary__def456
```

**使用:**

```jsx
// React
import styles from './button.module.css'

function Button() {
  return <button className={styles.btn}>Click</button>
}
```

**知识点：** `CSS Modules` `局部作用域`

:::

---

### Q3: CSS-in-JS 的优缺点是什么？

> **🔥 中等 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**styled-components:**

```jsx
import styled from 'styled-components'

const Button = styled.button`
  background: ${p => p.primary ? 'blue' : 'white'};
  color: ${p => p.primary ? 'white' : 'blue'};
  padding: 10px 20px;
  
  &:hover {
    opacity: 0.8;
  }
`

function App() {
  return <Button primary>Click</Button>
}
```

**优点:**

- 组件和样式在一起
- 动态样式方便
- 自动厂商前缀
- 关键 CSS 提取

**缺点:**

- 运行时性能开销
- 调试复杂
- 学习曲线

**Emotion:**

```jsx
import { css } from '@emotion/react'

function Component() {
  return (
    <div css={css`color: hotpink;`}>
      Hello
    </div>
  )
}
```

**知识点：** `CSS-in-JS` `styled-components`

:::

---

### Q4: Tailwind CSS 的理念是什么？

> **⭐ 简单 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**原子化 CSS:**

```html
<!-- Tailwind -->
<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  Click
</button>

<!-- 等同于 -->
<style>
.btn {
  background-color: #3b82f6;
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}
.btn:hover {
  background-color: #1d4ed8;
}
</style>
```

**优点:**

- 无需命名类
- 开发速度快
- 体积小 (PurgeCSS)

**知识点：** `Tailwind` `原子化 CSS`

:::

---

### Q5: CSS 自定义属性 (变量) 如何使用？

> **⭐ 简单 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**定义和使用:**

```css
:root {
  --primary-color: #007bff;
  --spacing: 1rem;
}

.btn {
  background: var(--primary-color);
  padding: var(--spacing);
}

/* 带默认值 */
.text {
  color: var(--text-color, #333);
}
```

**动态修改:**

```js
document.documentElement.style
  .setProperty('--primary-color', '#ff0000')
```

**知识点：** `CSS 变量` `自定义属性`

:::

---

### Q6: CSS @layer 层级控制如何使用？

> **🔥 中等 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**层级声明:**

```css
@layer reset, base, theme, utilities;

@layer reset {
  * { margin: 0; }
}

@layer utilities {
  .hidden { display: none; }
}

/* 未声明的层级最高 */
.special { color: red; }
```

**知识点：** `@layer` `CSS 层级`

:::

---

### Q7: Container Queries 容器查询是什么？

> **⭐ 简单 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**容器查询:**

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    display: flex;
  }
}
```

**知识点：** `Container Queries` `响应式`

:::

---

### Q8: 现代 CSS 新特性有哪些？

> **⭐ 简单 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**新特性:**

1. **color-mix()**
```css
color: color-mix(in srgb, blue 50%, red);
```

2. **:has() 选择器**
```css
.card:has(img:first-child) { }
```

3. **嵌套语法**
```css
.card {
  & .title { color: blue; }
  &:hover { opacity: 0.8; }
}
```

**知识点：** `现代 CSS` `新特性`

:::

---

---

### Q9: PostCSS 和 Sass/Less 的区别？为什么需要 PostCSS？

> **🔥 中等 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心区别：**

**Sass/Less 是 CSS 预处理器**，在编译阶段将扩展语法转换为 CSS：

```scss
// Sass 源码
$primary: #007bff;
@mixin btn($bg: $primary) {
  background: $bg;
  &:hover { background: darken($bg, 10%); }
}
.btn { @include btn(); }

// 编译后 CSS
.btn { background: #007bff; }
.btn:hover { background: #0062cc; }
```

**PostCSS 是 CSS 后处理器/转换器**，用 JavaScript 插件转换 CSS：

```css
/* 原始 CSS */
.element {
  display: flex;
}

/* PostCSS + autoprefixer 处理后 */
.element {
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
}
```

**对比表：**

| 特性 | Sass/Less | PostCSS |
|------|-----------|---------|
| 类型 | 预处理器 | 后处理器/转换工具 |
| 语法 | 扩展语法（变量$、混入等） | 标准 CSS + 插件语法 |
| 实现 | Ruby/JavaScript | JavaScript |
| 功能 | 变量、嵌套、混入、函数 | 取决于插件（自治原则） |
| 灵活性 | 固定功能集 | 高度灵活，可自定义插件 |
| 生态 | 成熟稳定 | 插件丰富，更新快 |

**为什么需要 PostCSS：**

**1. 插件化架构**

```js
// postcss.config.js
module.exports = {
  plugins: [
    require('autoprefixer'),        // 自动添加浏览器前缀
    require('postcss-preset-env'),  // 使用未来 CSS 语法
    require('cssnano'),             // 压缩 CSS
    require('postcss-import'),      // 处理 @import
    require('tailwindcss'),         // Tailwind CSS
  ]
}
```

**2. 现代化 CSS 语法**

```css
/* 使用 PostCSS Preset Env */
:root {
  --color: oklab(50% 0.1 200); /* OKLCH 颜色 */
}

.element {
  background-color: var(--color);
  &:hover { opacity: 0.8; } /* 嵌套语法 */
}

@container (min-width: 400px) { /* 容器查询 */
  .card { display: flex; }
}
```

**3. 与构建工具集成**

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [{
      test: /\.css$/,
      use: [
        'style-loader',
        'css-loader',
        'postcss-loader'  // PostCSS 处理
      ]
    }]
  }
}
```

**4. 自定义插件能力**

```js
// 自定义 PostCSS 插件
const myPlugin = () => ({
  postcssPlugin: 'my-plugin',
  Declaration(decl) {
    if (decl.prop === 'color') {
      decl.cloneBefore({ prop: 'background', value: '#fff' })
    }
  }
})
```

**实际使用建议：**

- **Sass/Less**：项目已有、团队熟悉、需要变量/混入
- **PostCSS**：现代项目、需要最新 CSS 特性、高度定制需求
- **组合使用**：Sass 编译 → PostCSS 处理（常见方案）

**知识点：** `PostCSS` `Sass` `Less` `预处理器` `构建工具`

:::

---

### Q10: CSS Modules 和 CSS-in-JS 的优缺点对比？

> **🔥 中等 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CSS Modules：**

构建时为类名生成唯一 hash，实现样式局部作用域。

```css
/* Button.module.css */
.btn {
  padding: 10px 20px;
  background: blue;
}

.btn-primary {
  background: #007bff;
}
```

```jsx
// React 组件
import styles from './Button.module.css'

function Button() {
  return (
    <button className={styles.btn}>
      <span className={styles['btn-primary']}>点击</span>
    </button>
  )
}
// 编译后: class="Button_btn__x7k2m"
```

**CSS-in-JS：**

在 JavaScript 中编写 CSS，通常配合 React 使用。

```jsx
// styled-components
import styled from 'styled-components'

const Button = styled.button`
  padding: 10px 20px;
  background: ${props => props.primary ? '#007bff' : 'gray'};
  
  &:hover {
    opacity: 0.8;
  }
  
  @media (min-width: 768px) {
    padding: 15px 30px;
  }
`

function App() {
  return <Button primary>点击</Button>
}
```

```jsx
// Emotion
import { css } from '@emotion/react'

const styles = css`
  padding: 10px 20px;
  background: blue;
  
  &:hover {
    opacity: 0.8;
  }
`

function Button() {
  return <button css={styles}>点击</button>
}
```

**对比表：**

| 特性 | CSS Modules | CSS-in-JS |
|------|-------------|-----------|
| 语法 | 标准 CSS | JavaScript/模板字符串 |
| 作用域 | 构建时 hash | 运行时生成 |
| 动态样式 | 有限（需组合类名） | 强大（props 驱动） |
| 性能 | ⭐⭐⭐⭐ 构建时处理 | ⭐⭐⭐ 运行时开销 |
| 代码分割 | 需要配置 | 自动支持 |
| SSR 支持 | 需要额外配置 | 原生支持 |
| 学习曲线 | 低（标准 CSS） | 中（需学库 API） |
| 生态 | webpack/vite 内置 | styled-components, Emotion |
| 调试 | 较难（hash 类名） | 较易（开发模式友好） |
| 体积 | 小 | 较大（运行时库） |

**优缺点分析：**

**CSS Modules 优点：**
- ✅ 标准 CSS 语法，零学习成本
- ✅ 构建时处理，无运行时开销
- ✅ 与任何框架配合使用
- ✅ 支持 CSS 所有特性（Media Query、Animation 等）

**CSS Modules 缺点：**
- ❌ 动态样式能力弱（需手动组合类名）
- ❌ 无法直接使用 JS 变量/逻辑
- ❌ 调试时类名被 hash

**CSS-in-JS 优点：**
- ✅ 强大的动态样式能力（props 驱动）
- ✅ 可直接使用 JS 变量、函数、逻辑
- ✅ 组件与样式紧密耦合，便于维护
- ✅ 自动处理供应商前缀
- ✅ 主题系统内置支持

**CSS-in-JS 缺点：**
- ❌ 运行时性能开销
- ❌ 需要学习特定库的 API
- ❌ 增加 bundle 体积
- ❌ SSR 需要额外配置（部分库）

**使用建议：**

| 场景 | 推荐方案 |
|------|---------|
| 传统项目迁移 | CSS Modules |
|  React 中大型应用 | CSS-in-JS（Emotion/styled-components） |
| 需要极致性能 | CSS Modules |
| 高度动态主题 | CSS-in-JS |
| 团队协作（设计师参与） | CSS Modules（标准 CSS） |
| 设计系统开发 | CSS-in-JS |

**知识点：** `CSS Modules` `CSS-in-JS` `styled-components` `Emotion` `样式方案`

:::

---

## 总结

| 知识点 | 重要度 |
|--------|--------|
| 预处理器 | 🔥🔥🔥 |
| CSS Modules | 🔥🔥🔥 |
| CSS-in-JS | 🔥🔥 |
| Tailwind | 🔥🔥🔥 |
| CSS 变量 | 🔥🔥🔥 |
| @layer | 🔥 |
| Container Queries | 🔥🔥 |

---