---
title: CSS 选择器与优先级
description: CSS 选择器类型、权重计算、!important、伪类伪元素、CSS 变量、选择器性能等核心面试题
---

# CSS 选择器与优先级

CSS 选择器优先级是解决样式冲突的核心机制。理解选择器权重计算对于编写可维护的 CSS 至关重要。

---

## 📝 题目

### Q1: 以下哪个选择器的优先级最高？

> **⭐ 简单 · CSS**

```css
#header .nav a
.header .nav a:hover
#header #nav
div div div a
```

::: details 🔍 点击查看答案与解析

**✅ 答案：** `#header #nav`

**💡 解析：**
**优先级计算规则**为 `(ID 数，类/伪类/属性数，元素/伪元素数)`：

- `#header .nav a` → (1, 1, 1)
- `.header .nav a:hover` → (0, 3, 1)
- `#header #nav` → (2, 0, 0) ✓ 最高
- `div div div a` → (0, 0, 4)

ID 选择器权重远高于类和元素选择器，2 个 ID 的优先级最高。

**知识点：** `优先级计算` `ID 选择器` `权重比较`

:::

---

### Q2: CSS 选择器有哪些类型？

> **⭐ 简单 · CSS**

请列举 CSS 中的选择器类型。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**1. 基本选择器：**
```css
*              /* 通用选择器 */
div            /* 元素选择器 */
.class         /* 类选择器 */
#id            /* ID 选择器 */
```

**2. 组合选择器：**
```css
div p          /* 后代选择器 */
div > p        /* 子选择器 */
div + p        /* 相邻兄弟 */
div ~ p        /* 通用兄弟 */
```

**3. 属性选择器：**
```css
[attr]         /* 有属性 */
[attr=value]   /* 等于 */
[attr~=value]  /* 包含单词 */
[attr|=value]  /* 开头匹配 */
[attr^=value]  /* 开头 */
[attr$=value]  /* 结尾 */
[attr*=value]  /* 包含 */
```

**4. 伪类选择器：**
```css
:hover         /* 悬停 */
:focus         /* 聚焦 */
:active        /* 激活 */
:first-child   /* 第一个子元素 */
:last-child    /* 最后一个子元素 */
:nth-child(n)  /* 第 n 个子元素 */
:not(selector) /* 否定 */
```

**5. 伪元素选择器：**
```css
::before       /* 之前插入 */
::after        /* 之后插入 */
::first-letter /* 首字母 */
::first-line   /* 首行 */
```

**知识点：** `选择器类型` `伪类` `伪元素`

:::

---

### Q3: CSS 优先级（Specificity）如何计算？

> **🔥 中等 · CSS**

请解释 CSS 优先级的计算规则。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**优先级权重 = (a, b, c, d)**

- **a** = inline style (1000)
- **b** = ID 选择器数量 (100)
- **c** = 类/属性/伪类数量 (10)
- **d** = 元素/伪元素数量 (1)

**示例计算：**
```css
#header .nav a:hover
/* (0, 1, 2, 1) = 0*1000 + 1*100 + 2*10 + 1*1 = 121 */

#header ul #nav a
/* (0, 2, 0, 2) = 202 */
```

**优先级顺序：**
```
!important > inline style > ID > class/attr/pseudo-class > element/pseudo-element > *
```

**知识点：** `优先级计算` `权重` `CSS 规则`

:::

---

### Q4: !important 的作用和弊端？

> **⭐ 简单 · CSS**

```css
.text {
  color: red !important;
  color: blue;
}
```

最终文字是什么颜色？

::: details 🔍 点击查看答案与解析

**✅ 答案：** 红色

**💡 解析：**

**!important 优先级最高**，会覆盖任何其他样式声明（除了另一个 !important 且更高特异性）。

**弊端：**
1. **破坏层叠**：破坏 CSS 的自然优先级
2. **难以维护**：后续需要更多 !important 覆盖
3. **调试困难**：难以追踪样式来源
4. **团队协作**：导致优先级竞赛

**正确使用场景：**
1. **Utility CSS**：工具类库
2. **覆盖第三方**：强制覆盖外部库
3. **用户样式**：浏览器扩展/自定义样式

**替代方案：**
```css
/* 提高选择器特异性 */
.header .nav .link { color: blue; }
/* 而非 */
.link { color: blue !important; }
```

**知识点：** `!important` `优先级` `最佳实践`

:::

---

### Q5: :nth-child() 和 :nth-of-type() 的区别？

> **🔥 中等 · CSS**

```html
<div>
  <p>1</p>
  <span>A</span>
  <p>2</p>
  <span>B</span>
  <p>3</p>
</div>
```

```css
p:nth-child(2)      /* 选择什么？*/
p:nth-of-type(2)    /* 选择什么？*/
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
- `p:nth-child(2)` → **无匹配**（第 2 个子元素是 span）
- `p:nth-of-type(2)` → **第 2 个 p**（文字"2"）

**💡 解析：**

**:nth-child(n)**
- 在所有子元素中数第 n 个
- 必须同时满足是 p 且是第 n 个子元素

**:nth-of-type(n)**
- 在同类元素中数第 n 个
- 只数 p 元素

**常见参数：**
```css
:nth-child(1)       /* 第一个 */
:nth-child(odd)     /* 奇数 */
:nth-child(even)    /* 偶数 */
:nth-child(2n+1)    /* 奇数的公式写法 */
:nth-child(-n+3)    /* 前 3 个 */
:nth-child(3n+1)    /* 1,4,7,10... */
```

**知识点：** `nth-child` `nth-of-type` `伪类选择器`

:::

---

### Q6: ::before 和 ::after 伪元素的作用？

> **⭐ 简单 · CSS**

伪元素 `::before` 和 `::after` 有什么用途？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

伪元素用于在元素内容前后插入虚拟元素。

**基本用法：**
```css
.element::before {
  content: "▶ ";
  color: gray;
}

.element::after {
  content: "";
  display: block;
  clear: both;
}
```

**常见用途：**

**1. 装饰元素**
```css
.button::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(...);
}
```

**2. 清除浮动**
```css
.clearfix::after {
  content: "";
  display: table;
  clear: both;
}
```

**3. 图标/符号**
```css
.external-link::after {
  content: "↗";
  font-size: 12px;
  margin-left: 4px;
}
```

**4. 引号**
```css
blockquote::before { content: """; }
blockquote::after { content: """; }
```

**注意事项：**
- 必须有 `content` 属性
- 双冒号 `::` 表示伪元素（CSS3 标准）
- 单冒号 `:` 兼容旧浏览器

**知识点：** `伪元素` `before` `after` `CSS 技巧`

:::

---

### Q7: CSS 变量（Custom Properties）的用法？

> **⭐ 简单 · CSS**

```css
:root {
  --primary-color: #007bff;
  --spacing: 16px;
}

.button {
  background: var(--primary-color);
  padding: var(--spacing);
}
```

CSS 变量有什么特点？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**CSS 变量特点：**
1. **可继承**：在作用域内可被子元素使用
2. **层叠性**：可被覆盖
3. **动态更新**：JavaScript 可操作
4. **默认值**：`var(--name, default)`

**使用场景：**
```css
/* 主题切换 */
:root {
  --bg: white;
  --text: black;
}

.dark-mode {
  --bg: #1a1a1a;
  --text: white;
}

body {
  background: var(--bg);
  color: var(--text);
}

/* JS 切换 */
document.body.classList.toggle('dark-mode');
```

**知识点：** `CSS 变量` `Custom Properties` `主题切换`

:::

---

### Q8: 属性选择器有哪些匹配模式？

> **⭐ 简单 · CSS**

请说明各种属性选择器的匹配规则。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

| 选择器 | 含义 | 示例 |
|--------|------|------|
| `[attr]` | 有属性 | `[href]` |
| `[attr=value]` | 完全等于 | `[target="_blank"]` |
| `[attr~=value]` | 包含单词 | `[class~="btn"]` |
| `[attr^=value]` | 开头 | `[href^="http"]` |
| `[attr$=value]` | 结尾 | `[href$=".pdf"]` |
| `[attr*=value]` | 包含子串 | `[class*="btn-"]` |
| `[attr\|=value]` | 语言匹配 | `[lang|="en"]` |

**知识点：** `属性选择器` `匹配模式` `CSS 选择器`

:::

---

### Q9: 伪类和伪元素的区别？

> **⭐ 简单 · CSS**

请解释伪类和伪元素的区别，并各举 3 个例子。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**伪类（:）**：选择特定状态的元素
```css
:hover      /* 悬停状态 */
:focus      /* 聚焦状态 */
:checked    /* 选中状态 */
```

**伪元素（::）**：创建虚拟元素
```css
::before    /* 在内容前插入 */
::after     /* 在内容后插入 */
::first-letter  /* 首字母 */
```

**区别：**
- 伪类不创建新元素，伪元素创建虚拟元素
- 伪元素必须配合 content 属性
- 伪元素用双冒号（CSS3 标准）

**知识点：** `伪类` `伪元素` `选择器`

:::

---

### Q10: 有哪些高优先级的选择器技巧？

> **🔥 中等 · CSS**

在不使用 !important 的情况下，如何提高选择器优先级？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**1. 增加 ID**
```css
/* 提高优先级 */
#page .button { }  /* 101 */
```

**2. 增加类**
```css
.button-theme.primary { }  /* 20 */
```

**3. 层叠同类**
```css
.button.button { }  /* 20，合法但奇怪 */
```

**4. 增加属性选择器**
```css
button[type="submit"] { }  /* 11 */
```

**5. 增加:not()（算 1 个类）**
```css
.button:not(.disabled) { }  /* 20 */
```

**对比：**
```css
.header .nav a           /* 12 */
#nav a                   /* 101 */
.nav a:hover             /* 21 */
#nav .link:hover         /* 111 */
```

**知识点：** `优先级提升` `选择器技巧` `CSS 架构`

:::

---

### Q11: :is()、:where()、:not() 伪类的选择器权重如何计算？

> **🔥 中等 · CSS**

请解释这三个伪类的优先级计算规则。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**:not() 否定伪类**

`:not()` 的选择器权重等于其参数的权重。

```css
/* (0, 1, 0) = 10 - 一个类 */
:not(.active) { }

/* (0, 2, 1) = 21 - 两个类 + 一个元素 */
:not(.active.disabled) { }

/* (0, 1, 0) - 参数是类选择器 */
:not(.disabled) { }
```

**:is() 匹配任意一个**

`:is()` 的权重等于其参数中**权重最高的选择器**。

```css
/* = (0, 1, 0) = 10 */
:is(.btn, .button) { }

/* = (1, 0, 0) = 100，取最高的#main */
:is(#main, .content, article) { }

/* 嵌套使用 */
:is(#header, .nav) :is(a, span) { }
/* = (1, 1, 1) = 111 */
```

**:where() 零权重**

`:where()` 的权重永远是 **0**，无论参数是什么。

```css
/* = (0, 0, 0) = 0 */
:where(.btn, .button) { }

/* = (0, 0, 0) = 0 */
:where(#main, .content, article) { }
```

**三者优先级对比：**

```css
/* 权重 0 - 最低，用于重置 */
:where(p, span, div) {
  margin: 0;
  padding: 0;
}

/* 权重 10 - 普通样式 */
:not(.disabled) {
  color: black;
}

/* 权重 100 - 最高，覆盖其他 */
:is(#header, .main-nav) a {
  color: blue;
}
```

**使用场景：**

**:where() - 低权重重置**
```css
/* 重置样式，容易被覆盖 */
:where(*) {
  box-sizing: border-box;
}
```

**:is() - 分组选择**
```css
/* 简化重复代码 */
:is(h1, h2, h3, h4, h5, h6) {
  font-weight: bold;
  line-height: 1.2;
}
```

**:not() - 排除特定**
```css
/* 排除某些元素 */
a:not([href]) {
  color: gray;
  pointer-events: none;
}
```

**浏览器支持：**
- `:not()`：所有浏览器 ✅
- `:is()`：现代浏览器 ✅
- `:where()`：现代浏览器 ✅

| 浏览器 | :not() | :is() | :where() |
|--------|--------|-------|----------|
| Chrome | 全版本 | 88+ | 88+ |
| Firefox | 全版本 | 79+ | 78+ |
| Safari | 全版本 | 14+ | 14+ |
| Edge | 全版本 | 88+ | 88+ |
| IE | 9+ | ❌ | ❌ |

**知识点：** `选择器权重` `:is()` `:where()` `:not()`

:::

---

### Q12: CSS 变量（Custom Properties）的继承和作用域规则？

> **🔥 中等 · CSS**

请详细解释 CSS 变量的继承机制、作用域规则，以及如何在 JS 中操作。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CSS 变量继承规则：**

CSS 变量**可以继承**，继承行为与普通属性类似。

```css
/* 全局作用域 */
:root {
  --primary: #007bff;
  --spacing: 16px;
}

/* 子元素可访问 */
.child {
  color: var(--primary);  /* 继承自:root */
}

/* 局部覆盖 */
.section {
  --primary: #dc3545;  /* 覆盖局部 */
}

.section .child {
  color: var(--primary);  /* 红色，使用局部值 */
}
```

**作用域规则：**

**1. 全局作用域（:root）**
```css
:root {
  --global-var: '全局';
}
/* 所有元素可访问 */
```

**2. 局部作用域**
```css
.component {
  --local-var: '局部';
}
/* 只有 .component 及其子元素可访问 */
```

**3. 媒体查询作用域**
```css
:root {
  --bg: white;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #1a1a1a;  /* 只在暗黑模式下生效 */
  }
}
```

**4. 伪类作用域**
```css
.card {
  --bg: white;
}

.card:hover {
  --bg: #f0f0f0;  /* hover 时变化 */
}
```

**层叠和覆盖：**

```css
/* 优先级低的 */
.component {
  --color: blue;
}

/* 优先级高的会覆盖 */
#app .component {
  --color: red;  /* 红色生效 */
}

/* 内联样式优先级更高 */
```

```html
<div class="component" style="--color: green;">
  <!-- green 生效 -->
</div>
```

**JavaScript 操作：**

**1. 读取变量**
```js
// 读取计算后的值
const color = getComputedStyle(document.documentElement)
  .getPropertyValue('--primary')
  .trim();

// 读取局部变量
const local = getComputedStyle(element)
  .getPropertyValue('--local-var');
```

**2. 修改变量**
```js
// 修改全局变量
document.documentElement.style.setProperty('--primary', '#ff0000');

// 修改局部变量
element.style.setProperty('--spacing', '24px');

// 删除变量
element.style.removeProperty('--spacing');
```

**3. 响应式主题切换**
```js
// 切换主题
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// CSS 配合
:root[data-theme="dark"] {
  --bg: #1a1a1a;
  --text: #ffffff;
}

:root[data-theme="light"] {
  --bg: #ffffff;
  --text: #1a1a1a;
}
```

**默认值语法：**
```css
.element {
  color: var(--text-color, #000);  /* 如果--text-color 不存在，用#000 */
  padding: var(--spacing, 16px);
}
```

**Fallback 链：**
```css
.element {
  color: var(--primary, var(--secondary, #000));
  /* 先尝试--primary，再--secondary，最后#000 */
}
```

**应用场景：**

**1. 主题系统**
```css
:root {
  --color-primary: #007bff;
}

[data-theme="dark"] {
  --color-primary: #0d6efd;
}
```

**2. 响应式间距**
```css
:root {
  --spacing: 16px;
}

@media (min-width: 768px) {
  :root {
    --spacing: 24px;
  }
}
```

**3. 动态交互**
```css
.tooltip {
  --tooltip-bg: rgba(0,0,0,0.8);
}

.tooltip:hover {
  --tooltip-bg: rgba(0,0,0,0.9);
}
```

**知识点：** `CSS 变量` `作用域` `继承` `JavaScript 操作`

:::

---

## 🔑 核心知识点总结

### 1. 优先级计算

```
优先级 = (inline, ID, class/attr/pseudo-class, element/pseudo-element)
!important > inline > ID > class > element > *
```

### 2. 选择器类型

- 基本：`*`、元素、`.class`、`#id`
- 组合：后裔 ` `、子 `>`、相邻 `+`、兄弟 `~`
- 属性：`[attr]`、`[attr=val]` 等
- 伪类：`:hover`、`:nth-child` 等
- 伪元素：`::before`、`::after`

### 3. CSS 变量

```css
:root { --color: red; }
.element { color: var(--color); }
```

### 4. 性能优化

- 避免深层嵌套
- 避免通用选择器
- 使用类选择器
- 减少关键选择器右侧约束

## 💡 面试技巧

1. **优先级计算**：记住 (ID, class, element) 格式
2. **伪类 vs 伪元素**：知道区别，伪元素双冒号
3. **!important 弊端**：知道为什么避免使用
4. **nth-child**：能解释与 nth-of-type 区别
5. **性能**：知道选择器性能优化原则