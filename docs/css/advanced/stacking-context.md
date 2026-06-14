---
title: 层叠上下文
description: z-index 规则、层叠上下文创建条件、层叠顺序、渲染合成层、GPU 加速等核心面试题
---

# 层叠上下文

层叠上下文（Stacking Context）决定了 HTML 元素在 Z 轴上的显示顺序。理解层叠上下文对于解决 z-index 相关问题至关重要。

---

## 📝 题目

### Q1: z-index 在什么情况下生效？

> **⭐ 简单 · CSS**

```css
.element {
  z-index: 10;
}
```

什么情况下这个 z-index 会起作用？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

z-index 只在以下情况生效：

1. **元素有定位**（position 不为 static）
   - `position: relative`
   - `position: absolute`
   - `position: fixed`
   - `position: sticky`

2. **元素是 flex 项目**
   ```css
   .parent { display: flex; }
   .child { z-index: 10; }  /* 有效 */
   ```

3. **元素是 grid 项目**
   ```css
   .parent { display: grid; }
   .child { z-index: 10; }  /* 有效 */
   ```

4. **元素 opacity < 1**
   ```css
   .element {
     opacity: 0.9;
     z-index: 10;  /* 有效 */
   }
   ```

5. **其他创建层叠上下文的情况**

**无效情况：**
```css
.element {
  position: static;  /* 默认值 */
  z-index: 10;       /* 无效 */
}
```

**知识点：** `z-index` `定位` `层叠上下文`

:::

---

### Q2: 哪些属性会创建新的层叠上下文？

> **🔥 中等 · CSS**

请列举至少 5 种创建层叠上下文的 CSS 属性。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**创建层叠上下文的属性：**

1. **根元素**：`html`

2. **position + z-index**
   ```css
   position: relative/absolute/fixed/sticky;
   z-index: 非 auto;
   ```

3. **opacity < 1**
   ```css
   opacity: 0.9;
   ```

4. **transform**
   ```css
   transform: rotate(45deg);
   ```

5. **filter**
   ```css
   filter: blur(5px);
   ```

6. **perspective**
   ```css
   perspective: 1000px;
   ```

7. **mix-blend-mode**
   ```css
   mix-blend-mode: multiply;
   ```

8. **will-change**
   ```css
   will-change: transform;
   ```

9. **isolation: isolate**
   ```css
   isolation: isolate;
   ```

10. **contain**
    ```css
    contain: layout paint style;
    ```

11. **display: flex/grid** 的子元素
    ```css
    display: flex;
    /* 子元素自动创建层叠上下文 */
    ```

**知识点：** `层叠上下文` `创建条件` `z-index`

:::

---

### Q3: 层叠顺序的 7 层是什么？

> **💀 困难 · CSS**

请说明 CSS 层叠的 7 个层级。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**从底到顶的 7 层：**

```
┌─────────────────────────────────────────┐
│ 7. position: fixed/sticky (z-index)     │ 最高
├─────────────────────────────────────────┤
│ 6. 负 z-index                           │
├─────────────────────────────────────────┤
│ 5. position: relative/absolute (z>0)    │
├─────────────────────────────────────────┤
│ 4. 普通流中的 inline/inline-block       │
├─────────────────────────────────────────┤
│ 3. 浮动元素 (float)                     │
├─────────────────────────────────────────┤
│ 2. 普通流中的 block                     │
├─────────────────────────────────────────┤
│ 1. 背景/边框 (background/border)        │ 最低
└─────────────────────────────────────────┘
```

**同层内比较：**
- 后出现的元素在上面
- z-index 值大的在上面

**示例：**
```css
.background { 
  position: relative; 
  z-index: -1;  /* 第 6 层 */
}
.normal {
  /* 第 2 层 */
}
.floated {
  float: left;   /* 第 3 层 */
}
.positioned {
  position: relative;
  z-index: 1;    /* 第 5 层 */
}
.fixed {
  position: fixed;
  z-index: 100;  /* 第 7 层 */
}
```

**知识点：** `层叠顺序` `层叠层级` `z-index`

:::

---

### Q4: 为什么 z-index 有时候不生效？

> **🔥 中等 · CSS**

```html
<div class="parent1">
  <div class="child1" style="z-index: 100;">元素 1</div>
</div>
<div class="parent2">
  <div class="child2" style="z-index: 1;">元素 2</div>
</div>
```

为什么 child2 可能在 child1 上面？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**💡 解析：**

父元素 parent1 或 parent2 可能创建了**层叠上下文**，子元素的 z-index 只在父层叠上下文内有效。

**示例：**
```css
.parent1 {
  position: relative;
  z-index: 1;        /* 创建层叠上下文 */
}
.child1 {
  position: relative;
  z-index: 100;      /* 只在 parent1 的上下文中是最大的 */
}

.parent2 {
  position: relative;
  z-index: 2;        /* parent2 在 parent1 上面 */
}
.child2 {
  position: relative;
  z-index: 1;        /* 但 child2 随 parent2 在上面 */
}
```

**层级关系：**
```
parent2 + child2 (z-index: 2 > 1)
  └─ child2 (z-index: 1)

parent1 + child1
  └─ child1 (z-index: 100)  /* 但受 parent1 限制 */
```

**解决方法：**
```css
/* 移除父元素的 z-index 或定位 */
.parent1 {
  /* 不设置 z-index */
}

/* 或者提升 child1 的层级 */
.child1 {
  position: fixed;  /* 脱离父级层叠上下文 */
}
```

**知识点：** `z-index 不生效` `层叠上下文嵌套`

:::

---

### Q5: 渲染合成层是什么？

> **🔥 中等 · CSS**

什么情况下元素会创建渲染合成层？有什么好处？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**渲染合成层（Compositing Layer）：** 浏览器为特定元素创建独立的层，用于 GPU 加速渲染。

**创建条件（Chrome）：**
1. **3D 变换**
   ```css
   transform: translateZ(0);
   transform: translate3d(0, 0, 0);
   ```

2. **video、canvas、webgl**

3. **will-change: transform**

4. **有子元素已经是合成层**

5. **position: fixed**

6. **will-change: opacity**

7. **backface-visibility: hidden**

**好处：**
1. **GPU 加速**：渲染交给 GPU
2. **独立渲染**：不触发其他层重绘
3. **性能提升**：动画更流畅

**潜在问题：**
1. **内存占用**：每层消耗内存
2. **层爆炸**：过多层导致性能下降
3. **字体模糊**：某些情况下

**使用建议：**
```css
/* 推荐：用于动画元素 */
.animated {
  will-change: transform;
}

/* 不推荐：滥用 */
* {
  transform: translateZ(0);  /* 性能杀手 */
}
```

**知识点：** `渲染合成层` `GPU 加速` `will-change`

:::

---

### Q6: 如何实现元素的全局置顶？

> **⭐ 简单 · CSS**

如何实现一个始终在顶部的遮罩层或弹窗？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**方法 1：固定定位 + 大 z-index**
```css
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}
```

**方法 2:脱离层叠上下文**
```css
.modal {
  position: fixed;  /* 创建新的层叠上下文 */
  z-index: 9999;
}
```

**注意事项：**
1. **避免父级层叠上下文限制**
   ```html
   <!-- 不好：modal 在可能有 z-index 的容器内 -->
   <div class="app">
     <div class="modal"></div>
   </div>
   
   <!-- 好：直接放在 body 下 -->
   <body>
     <div class="app"></div>
     <div class="modal"></div>
   </body>
   ```

2. **z-index 不要过大**
   ```css
   /* 推荐 */
   .modal { z-index: 1000; }
   
   /* 不推荐 */
   .modal { z-index: 999999999; }
   ```

3. **考虑多弹窗场景**
   ```css
   :root {
     --z-modal: 1000;
     --z-dropdown: 100;
     --z-tooltip: 50;
   }
   ```

**知识点：** `全局置顶` `fixed 定位` `弹窗层级`

:::

---

### Q7: isolation: isolate 的作用

> **🔥 中等 · CSS**

```css
.isolated {
  isolation: isolate;
}
```

这个属性有什么作用？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

`isolation: isolate` 用于创建新的层叠上下文。

**作用：**
1. **混合模式隔离**
   ```css
   .parent {
     isolation: isolate;
   }
   .child {
     mix-blend-mode: multiply;  /* 只在 parent 内混合 */
   }
   ```

2. **强制创建层叠上下文**
   ```css
   /* 不使用 z-index 也能创建层叠上下文 */
   .stack {
     isolation: isolate;
   }
   ```

3. **内容隔离**
   - 隔离混合模式效果
   - 创建独立的渲染区域

**使用场景：**
```css
/* 混合模式效果限制在容器内 */
.blend-container {
  isolation: isolate;
}
.blend-item {
  mix-blend-mode: overlay;
}

/* 创建层叠上下文但不改变位置 */
.modal {
  isolation: isolate;
  /* z-index 只在 modal 内部有效 */
}
```

**浏览器支持：**
- Chrome 41+
- Firefox 36+
- Safari 8+
- Edge 79+

**知识点：** `isolation` `层叠上下文` `混合模式`

:::

---

### Q8: 层叠上下文的嵌套问题

> **💀 困难 · CSS**

```html
<div class="container1">
  <div class="child1" style="z-index: 10;">1</div>
</div>
<div class="container2">
  <div class="child2" style="z-index: 5;">2</div>
</div>
```

如果 container1 的 z-index 小于 container2，child1 和 child2 谁在上面？

::: details 🔍 点击查看答案与解析

**✅ 答案：** child2 在上面

**💡 解析：**

**层叠上下文嵌套规则：**
1. 子层叠上下文的热序取决于父层叠上下文
2. 子元素的 z-index 只在父层叠上下文内有效

**示例详解：**
```css
.container1 {
  position: relative;
  z-index: 1;        /* 创建层叠上下文，层级为 1 */
}
.child1 {
  position: relative;
  z-index: 10;       /* 在 container1 内层级 10 */
}

.container2 {
  position: relative;
  z-index: 2;        /* 创建层叠上下文，层级为 2 */
}
.child2 {
  position: relative;
  z-index: 5;        /* 在 container2 内层级 5 */
}
```

**层级比较：**
```
container2 (层级 2) > container1 (层级 1)
  └─ child2 (层级 5 within container2)
  
container1 (层级 1)
  └─ child1 (层级 10 within container1)
```

**结果：** container2 > container1，所以 child2 > child1

**知识点：** `层叠嵌套` `父子层级` `z-index`

:::

---


---

### Q9: z-index: 9999 不起作用的常见原因？

> **🔥 中等 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**z-index 值很大但不生效的常见原因：**

**1. 创建了新的层叠上下文**

父元素创建了新的层叠上下文，子元素的 z-index 只在父容器内有效：

```html
<div class="parent1" style="position: relative; z-index: 1;">
  <div class="child" style="position: absolute; z-index: 9999;">
    子元素
  </div>
</div>

<div class="parent2" style="position: relative; z-index: 2;">
  <div>另一个父容器的内容</div>
</div>
```

**结果：** parent2 (z-index: 2) > parent1 (z-index: 1)，所以 child 即使 z-index: 9999 也会被 parent2 的内容覆盖。

**2. position 为非定位元素**

```css
/* ❌ 无效 - static 元素 */
.element {
  z-index: 9999; /* 不起作用 */
}

/* ✅ 有效 - 需要定位 */
.element {
  position: relative; /* 或 absolute/fixed/sticky */
  z-index: 9999;
}
```

**3. 以下属性会创建新的层叠上下文**

| 属性 | 示例 | 说明 |
|------|------|------|
| opacity | `opacity: 0.9` | 任何小于 1 的值 |
| transform | `transform: rotate(5deg)` | 任何变换 |
| filter | `filter: blur(5px)` | 任何滤镜 |
| perspective | `perspective: 500px` | 3D 透视 |
| will-change | `will-change: transform` | 即将变化的属性 |
| isolation | `isolation: isolate` | 强制隔离 |
| contain | `contain: layout` | CSS containment |

**4. flex/grid 项目的特殊情况**

```css
.parent {
  display: flex;
}

.child {
  /* flex 项目即使没有 position 也可以 z-index */
  z-index: 10; /* 有效 */
}
```

**调试技巧：**

```js
// 检查元素是否创建了层叠上下文
function checkStackingContext(el) {
  const style = getComputedStyle(el)
  const creates = []
  
  if (style.position !== 'static' && style.zIndex !== 'auto') creates.push('position + z-index')
  if (parseFloat(style.opacity) < 1) creates.push('opacity < 1')
  if (style.transform !== 'none') creates.push('transform')
  if (style.filter !== 'none') creates.push('filter')
  if (style.willChange !== 'auto') creates.push('will-change')
  if (style.isolation === 'isolate') creates.push('isolation')
  
  return creates
}

checkStackingContext(document.querySelector('.element'))
```

**知识点：** `z-index` `层叠上下文` `定位` `opacity` `transform`

:::

---

### Q10: will-change 属性的作用和正确使用方式？

> **🔥 中等 · CSS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**will-change 的作用：**

`will-change` 告诉浏览器元素即将发生哪些变化，让浏览器提前优化（如创建合成层）。

```css
/* 告知浏览器这些属性即将变化 */
.animated-element {
  will-change: transform, opacity;
}
```

**浏览器优化行为：**

1. **创建合成层**（Compositor Layer）
   - 将元素提升到 GPU 加速层
   - 减少主线程的渲染负担

2. **预先计算**
   - 为即将变化的属性做优化准备

**正确使用方式：**

**1. 在动画开始前临时添加**

```js
const element = document.querySelector('.element')

// 动画前添加
element.style.willChange = 'transform'

// 执行动画
element.animate(
  [{ transform: 'translateX(0)' }, { transform: 'translateX(100px)' }],
  { duration: 300 }
)

// 动画结束后移除（重要！）
setTimeout(() => {
  element.style.willChange = 'auto'
}, 300)
```

**2. 在 CSS 中针对特定状态**

```css
/* hover 时触发 */
.button {
  transition: transform 0.2s;
}

.button:hover {
  will-change: transform;
  transform: scale(1.05);
}

/* 展开时触发 */
.dropdown {
  transition: opacity 0.3s;
}

.dropdown.open {
  will-change: opacity;
  opacity: 1;
}
```

**3. 避免滥用**

```css
/* ❌ 错误 - 对大量元素使用 will-change */
.list-item {
  will-change: transform; /* 每个列表项都创建合成层，内存爆炸 */
}

/* ✅ 正确 - 只对真正需要动画的元素使用 */
.list-item.active {
  will-change: transform;
}
```

**常见用途：**

| 场景 | will-change 值 | 说明 |
|------|---------------|------|
| 滚动视差 | `transform` | 提前创建合成层 |
| 淡入淡出 | `opacity` | 避免重绘 |
| 复杂动画 | `transform, opacity` | GPU 加速 |
| 固定背景 | `transform` | 滚动性能优化 |

**注意事项：**

1. **及时清理**：动画后移除 will-change，避免内存泄漏
2. **不要过度使用**：每个 will-change 都会消耗内存
3. **不能解决所有性能问题**：优先考虑 transform/opacity 动画

**知识点：** `will-change` `性能优化` `合成层` `GPU 加速`

:::

---
## 🔑 核心知识点总结

### 1. z-index 生效条件

- position 不为 static
- 是 flex/grid 项目
- opacity < 1
- 其他创建层叠上下文的属性

### 2. 创建层叠上下文的属性

- position + z-index
- opacity < 1
- transform/filter/perspective
- will-change
- isolation: isolate

### 3. 层叠顺序

```
背景 → block → 浮动 → inline → position(z>0) → 负 z-index → fixed(z)
```

### 4. 层叠嵌套

- 子层叠序取决于父层叠序
- z-index 只在同层叠序内比较

### 5. 渲染合成层

- GPU 加速
- transform: translateZ(0)
- will-change: transform

## 💡 面试技巧

1. **z-index 生效**：知道 position 要求
2. **创建条件**：记住常见属性
3. **层级顺序**：记住 7 层顺序
4. **嵌套问题**：理解父子层叠关系
5. **性能优化**：知道渲染合成层