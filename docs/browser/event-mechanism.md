---
title: 浏览器事件机制
description: 事件捕获/冒泡/目标阶段、事件代理、addEventListener 参数、passive、自定义事件、React 合成事件
---

# 浏览器事件机制

掌握事件机制是前端开发的核心基础，涉及事件流、委托、性能优化等重要概念。

---

### Q1: 请描述 DOM 事件流的三个阶段

> **⭐ 简单 · 事件流**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**DOM 事件流分为三个阶段：**

```
            document
               │
          ┌────┴────┐
          │  html   │
          └────┬────┘
               │
          ┌────┴────┐
          │  body   │
          └────┬────┘
               │
          ┌────┴────┐
          │  div    │  ← 目标元素
          └─────────┘
```

**1. 捕获阶段（Capturing Phase）**
- 事件从 document 开始，逐层向下传播到目标元素的父节点
- 默认情况下监听器不在此阶段触发
- 可通过 `addEventListener(event, handler, true)` 启用

**2. 目标阶段（Target Phase）**
- 事件到达目标元素
- 在此阶段触发目标元素上的监听器

**3. 冒泡阶段（Bubbling Phase）**
- 事件从目标元素的父节点开始，逐层向上传播到 document
- 默认情况下监听器在此阶段触发
- 可通过 `event.stopPropagation()` 阻止

**代码示例：**
```javascript
const div = document.querySelector('div');

// 捕获阶段触发（第三个参数为 true）
div.addEventListener('click', () => {
  console.log('捕获阶段');
}, true);

// 冒泡阶段触发（默认）
div.addEventListener('click', () => {
  console.log('冒泡阶段');
}, false);

// 事件发生顺序：
// 1. 捕获阶段（document → html → body → div 父节点）
// 2. 目标阶段（div）
// 3. 冒泡阶段（div → body → html → document）
```

**知识点：** `事件流` `捕获` `冒泡` `目标阶段` `addEventListener`

:::

---

### Q2: 什么是事件代理（事件委托）？有什么优势和适用场景？

> **🔥 中等 · 事件代理**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**事件代理（Event Delegation）**：将事件监听器添加到父元素上，利用事件冒泡机制处理子元素的事件。

**实现原理：**
```javascript
// ❌ 直接绑定（性能差）
document.querySelectorAll('li').forEach(li => {
  li.addEventListener('click', handleClick);
});

// ✅ 事件代理（推荐）
const ul = document.querySelector('ul');
ul.addEventListener('click', (e) => {
  // e.target 是实际点击的元素
  if (e.target.tagName === 'LI') {
    handleClick(e);
  }
  // 或使用 closest
  const li = e.target.closest('li');
  if (li && ul.contains(li)) {
    handleClick(e);
  }
});
```

**优势：**

| 优势 | 说明 |
|------|------|
| **内存优化** | 只需一个监听器，减少内存占用 |
| **动态元素支持** | 新添加的子元素自动生效，无需重新绑定 |
| **性能提升** | 减少事件监听器数量，降低 DOM 操作 |
| **代码简洁** | 逻辑集中，便于维护 |

**适用场景：**
1. **列表项操作**：待办事项、菜单项
2. **表格操作**：行点击、删除按钮
3. **动态内容**：懒加载、异步添加的元素
4. **大量子元素**：减少监听器数量

**注意事项：**
```javascript
// 1. 注意事件目标判断
ul.addEventListener('click', (e) => {
  // 可能点到子元素（如 span、icon）
  const li = e.target.closest('li');
  if (!li) return;
  
  // 2. 注意阻止默认行为
  if (e.target.tagName === 'A') {
    e.preventDefault();
  }
  
  // 3. 注意事件兼容性
  // touchstart 和 click 都可能需要处理
});
```

**知识点：** `事件代理` `事件委托` `事件冒泡` `closest` `性能优化`

:::

---

### Q3: addEventListener 的第三个参数有哪些用法？

> **⭐ 简单 · addEventListener**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**addEventListener 第三个参数可以是布尔值或对象：**

**1. 布尔值用法（useCapture）**
```javascript
// true = 捕获阶段触发
element.addEventListener('click', handler, true);

// false = 冒泡阶段触发（默认）
element.addEventListener('click', handler, false);
element.addEventListener('click', handler); // 等同于 false
```

**2. 对象用法（Options 参数）**
```javascript
element.addEventListener('click', handler, {
  capture: false,      // 是否捕获阶段触发
  once: true,          // 只触发一次，自动移除
  passive: true,       // 不会调用 preventDefault()
  signal: abortSignal  // AbortSignal 用于移除监听器
});
```

**Options 参数详解：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `capture` | boolean | false | 是否在捕获阶段触发 |
| `once` | boolean | false | 是否只触发一次后自动移除 |
| `passive` | boolean | false | 是否不会调用 preventDefault() |
| `signal` | AbortSignal | - | 用于取消监听器的信号 |

**使用示例：**
```javascript
// once: 只触发一次
btn.addEventListener('click', () => {
  console.log('只执行一次');
}, { once: true });

// passive: 优化滚动性能
window.addEventListener('scroll', handleScroll, { passive: true });
document.addEventListener('touchstart', handleTouch, { passive: true });

// signal: 使用 AbortController 移除
const controller = new AbortController();
element.addEventListener('click', handler, { signal: controller.signal });
// 移除监听器
controller.abort();

// 组合使用
element.addEventListener('click', handler, {
  capture: true,
  once: true,
  passive: true
});
```

**知识点：** `addEventListener` `capture` `once` `passive` `AbortController`

:::

---

### Q4: 什么是 passive 事件监听器？为什么需要它？

> **🔥 中等 · passive 事件**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**passive 事件监听器**：告知浏览器该监听器不会调用 `preventDefault()`，浏览器可以立即执行默认行为，无需等待事件处理完成。

**问题背景：**
```javascript
// ❌ 非 passive 监听器
document.addEventListener('touchstart', (e) => {
  // 浏览器必须等待回调执行完
  // 因为我们可能调用 preventDefault()
  // 这会导致滚动延迟
  handleTouch(e);
}, { passive: false });
```

**为什么需要 passive：**
- 浏览器不知道事件处理函数是否会调用 `preventDefault()`
- 必须等待回调执行完才能执行默认行为（如滚动）
- 如果回调中有耗时操作，会导致滚动卡顿

**使用 passive 后：**
```javascript
// ✅ passive 监听器
document.addEventListener('touchstart', (e) => {
  // 浏览器知道这里不会调用 preventDefault()
  // 可以立即执行滚动，不等待回调
  handleTouch(e);
}, { passive: true });
```

**性能提升：**
- 滚动帧率提升
- 减少输入延迟
- 移动端体验更流畅

**强制检查（Chrome）：**
```javascript
// 如果 passive: true 但调用了 preventDefault()
// 浏览器会警告
document.addEventListener('touchmove', (e) => {
  e.preventDefault(); // ⚠️ 无效且有警告
}, { passive: true });
```

**适用场景：**
- `touchstart`、`touchmove`、`wheel` 等滚动相关事件
- 不需要阻止默认行为的场景

**禁用警告（不推荐）：**
```javascript
// Chrome 控制台会显示：
// [Unable to preventDefault inside passive event listener]
// 如果确实需要 preventDefault，不要用 passive
```

**知识点：** `passive` `touchstart` `preventDefault` `滚动性能` `移动端优化`

:::

---

### Q5: 如何创建和触发自定义事件？

> **🔥 中等 · 自定义事件**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CustomEvent API 创建自定义事件：**

**1. 基本用法**
```javascript
// 创建自定义事件
const event = new CustomEvent('myEvent', {
  detail: {
    message: 'Hello World',
    data: { id: 123 }
  },
  bubbles: true,     // 是否冒泡
  cancelable: true   // 是否可取消
});

// 监听
element.addEventListener('myEvent', (e) => {
  console.log(e.detail.message); // 'Hello World'
  console.log(e.detail.data);    // { id: 123 }
});

// 触发
element.dispatchEvent(event);
```

**2. 封装组件通信**
```javascript
// 事件总线
const eventBus = {
  events: {},
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(data));
    }
  },
  
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
};

// 使用
eventBus.on('user:login', (user) => {
  console.log(`${user.name} 登录了`);
});

eventBus.emit('user:login', { name: '张三' });
```

**3. DOM 事件方式（更推荐）**
```javascript
class MyComponent extends HTMLElement {
  constructor() {
    super();
    // 创建 shadow DOM 或使用普通 DOM
  }
  
  doSomething() {
    // 触发事件通知父组件
    this.dispatchEvent(new CustomEvent('action', {
      bubbles: true,
      composed: true, // 穿透 Shadow DOM
      detail: { type: 'submit', value: 42 }
    }));
  }
}

// 监听
component.addEventListener('action', (e) => {
  console.log(e.detail);
});
```

**4. 与第三方库集成**
```javascript
// Vue 3 中触发原生事件
emit('custom-event', { data: 123 });

// React 中
ref.current.dispatchEvent(new CustomEvent('change', {
  detail: { value: newValue }
}));
```

**知识点：** `CustomEvent` `自定义事件` `dispatchEvent` `事件总线` `组件通信`

:::

---

### Q6: React 合成事件（SyntheticEvent）的原理是什么？

> **💀 困难 · React 原理**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React 合成事件**：React 对原生 DOM 事件的封装，提供跨浏览器一致的事件系统。

**核心原理：**

**1. 事件代理**
```
React 17+：事件监听器挂载在 root 容器上
React 16 及之前：事件监听器挂载在 document 上

<div id="root">
  <button onClick={handleClick}>Click</button>
</div>

// React 在 root 上代理所有 click 事件
root.addEventListener('click', reactEventHandler);
```

**2. 事件委托流程**
```javascript
// 伪代码
function reactEventHandler(nativeEvent) {
  // 1. 获取事件目标
  const target = nativeEvent.target;
  
  // 2. 构建 React 事件路径
  const path = getEventPath(target);
  
  // 3. 执行捕获阶段（如果有）
  for (const node of path.reverse()) {
    const handler = getNodeCaptureHandler(node);
    if (handler) handler(nativeEvent);
  }
  
  // 4. 执行冒泡阶段
  for (const node of path) {
    const handler = getNodeBubbleHandler(node);
    if (handler) handler(nativeEvent);
  }
}
```

**3. SyntheticEvent 对象**
```javascript
// React 创建合成事件对象
const syntheticEvent = {
  nativeEvent: nativeEvent,  // 原始事件
  type: 'click',
  target: target,
  currentTarget: null,
  bubbles: true,
  cancelable: true,
  
  // 方法
  preventDefault() {
    this.defaultPrevented = true;
    const event = this.nativeEvent;
    event.preventDefault();
  },
  stopPropagation() {
    this.isPropagationStopped = true;
  }
};
```

**4. 事件池化（React 16 及之前）**
```javascript
// React 16: 事件对象会被复用
function handleClick(e) {
  // e 在事件处理完后会被清空
  setTimeout(() => {
    console.log(e.target); // ⚠️ null
  }, 100);
  
  // 解决：persist() 保留事件
  e.persist();
}

// React 17+：移除了事件池化
```

**5. 优势**
- 跨浏览器一致性
- 减少事件监听器数量（性能优化）
- 统一的事件接口
- 自动处理事件捕获和冒泡

**知识点：** `React 合成事件` `事件代理` `SyntheticEvent` `事件池化` `事件委托`

:::

---

### Q7: 事件循环（Event Loop）与渲染的关系是什么？

> **💀 困难 · 事件循环**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**事件循环与渲染时序：**

```
┌─────────────────────────────────────────────────────┐
│                     Event Loop                       │
├─────────────────────────────────────────────────────┤
│  1. 执行宏任务（MacroTask）                         │
│     - setTimeout、setInterval                       │
│     - I/O、UI 渲染                                   │
│     - setImmediate (Node.js)                        │
│  2. 渲染（如有需要）                                 │
│  3. 执行微任务（MicroTask）                          │
│     - Promise.then/catch/finally                    │
│     - MutationObserver                              │
│     - queueMicrotask                                │
└─────────────────────────────────────────────────────┘
```

**渲染时机：**
- 浏览器通常在宏任务执行后、微任务执行前进行渲染
- 但规范没有严格规定，各浏览器实现略有不同
- 一般规则：每个宏任务后可能渲染一次

**代码示例：**
```javascript
// 执行顺序分析
const box = document.getElementById('box');

// 同步执行
box.style.background = 'red';

// 微任务（在渲染前执行）
Promise.resolve().then(() => {
  box.style.background = 'blue';  // 先变蓝
});

// 微任务
queueMicrotask(() => {
  box.style.background = 'green'; // 再变绿
});

// 宏任务（在渲染后执行）
setTimeout(() => {
  box.style.background = 'yellow'; // 最后变黄
}, 0);

// 用户看到的颜色变化：
// 红 → 绿 → （渲染） → 黄
```

**实际渲染时机实验：**
```javascript
function test() {
  div.textContent = 'before';
  
  // 同步修改
  div.style.color = 'red';
  
  // Promise 后修改
  Promise.resolve().then(() => {
    div.textContent = 'after-promise';
    div.style.color = 'blue';
  });
  
  // setTimeout 后修改
  setTimeout(() => {
    div.textContent = 'after-timeout';
    div.style.color = 'green';
  }, 0);
}
```

**性能影响：**
1. **大量微任务会阻塞渲染**
```javascript
// ❌ 阻塞渲染
for (let i = 0; i < 10000; i++) {
  Promise.resolve().then(() => {
    // 耗时操作
  });
}
```

2. **使用 requestAnimationFrame 同步渲染**
```javascript
// ✅ 与渲染同步
requestAnimationFrame(() => {
  div.textContent = 'updated';
});
```

**知识点：** `事件循环` `宏任务` `微任务` `渲染时机` `Promise`

:::

---

### Q8: stopPropagation 和 stopImmediatePropagation 有什么区别？

> **⭐ 简单 · 事件传播**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 方法 | 作用 | 影响范围 |
|------|------|----------|
| `stopPropagation()` | 阻止事件继续传播 | 不影响当前元素的其他监听器 |
| `stopImmediatePropagation()` | 阻止事件传播 + 阻止同元素其他监听器 | 完全停止 |

**代码示例：**
```html
<div id="parent">
  <button id="btn">按钮</button>
</div>
```

```javascript
const btn = document.getElementById('btn');
const parent = document.getElementById('parent');

// 第一个点击处理
btn.addEventListener('click', (e) => {
  console.log('btn handler 1');
  e.stopPropagation(); // 只阻止冒泡
});

// 第二个点击处理
btn.addEventListener('click', () => {
  console.log('btn handler 2'); // 仍会执行
});

// 父元素点击处理
parent.addEventListener('click', () => {
  console.log('parent handler'); // 不会执行
});

// 输出：
// btn handler 1
// btn handler 2
```

**使用 stopImmediatePropagation：**
```javascript
btn.addEventListener('click', (e) => {
  console.log('btn handler 1');
  e.stopImmediatePropagation(); // 阻止一切
});

btn.addEventListener('click', () => {
  console.log('btn handler 2'); // 不会执行！
});

parent.addEventListener('click', () => {
  console.log('parent handler'); // 不会执行
});

// 输出：
// btn handler 1
```

**检查传播状态：**
```javascript
btn.addEventListener('click', function(e) {
  console.log('propagationStopped:', e.propagationStopped);
  // 调用 stopPropagation() 后为 true
});
```

**应用场景：**
- `stopPropagation()`：防止事件影响父元素
- `stopImmediatePropagation()`：完全阻止事件，包括同元素的其他监听器

**知识点：** `stopPropagation` `stopImmediatePropagation` `事件传播` `事件控制`

:::

---

### Q9: 如何兼容处理不同浏览器的事件绑定？

> **⭐ 简单 · 事件兼容**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**现代浏览器标准：**
```javascript
// 标准方式（推荐）
element.addEventListener('click', handler, false);
element.removeEventListener('click', handler, false);
```

**IE8 及以下兼容：**
```javascript
function addEvent(element, type, handler) {
  if (element.addEventListener) {
    // 标准浏览器
    element.addEventListener(type, handler, false);
  } else if (element.attachEvent) {
    // IE8 及以下
    element.attachEvent('on' + type, handler);
  } else {
    // 更老的浏览器
    element['on' + type] = handler;
  }
}

function removeEvent(element, type, handler) {
  if (element.removeEventListener) {
    element.removeEventListener(type, handler, false);
  } else if (element.detachEvent) {
    element.detachEvent('on' + type, handler);
  } else {
    element['on' + type] = null;
  }
}
```

**事件对象兼容：**
```javascript
function handleEvent(e) {
  // 获取事件对象
  const event = e || window.event;
  
  // 获取目标元素
  const target = event.target || event.srcElement;
  
  // 阻止默认行为
  if (event.preventDefault) {
    event.preventDefault();
  } else {
    event.returnValue = false;
  }
  
  // 阻止冒泡
  if (event.stopPropagation) {
    event.stopPropagation();
  } else {
    event.cancelBubble = true;
  }
}
```

**使用现代框架（推荐）：**
```javascript
// React 自动处理兼容性
<button onClick={handleClick}>Click</button>

// Vue 自动处理兼容性
<button @click="handleClick">Click</button>

// jQuery 抽象层
$element.on('click', handler);
```

**知识点：** `事件兼容` `addEventListener` `attachEvent` `事件对象` `IE 兼容`

:::

---

### Q10: 什么是防抖（Debounce）和节流（Throttle）？如何实现？

> **🔥 中等 · 事件优化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**防抖（Debounce）**：函数在 n 秒内只执行最后一次，期间重复触发会重新计时。

```javascript
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}

// 使用场景：搜索输入框
input.addEventListener('input', debounce((e) => {
  search(e.target.value);
}, 300));
```

**节流（Throttle）**：函数在 n 秒内只执行一次，不管触发多少次。

```javascript
// 时间戳版本
function throttle(fn, delay) {
  let lastTime = 0;
  return function(...args) {
    const context = this;
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(context, args);
    }
  };
}

// 定时器版本
function throttle(fn, delay) {
  let timer = null;
  return function(...args) {
    const context = this;
    if (!timer) {
      timer = setTimeout(() => {
        fn.apply(context, args);
        timer = null;
      }, delay);
    }
  };
}

// 使用场景：滚动事件
window.addEventListener('scroll', throttle(() => {
  loadMore();
}, 200));
```

**对比表格：**

| 特性 | 防抖（Debounce） | 节流（Throttle） |
|------|-----------------|-----------------|
| **原理** | 延迟执行，重复触发重置计时 | 固定时间间隔执行 |
| **执行时机** | 最后一次触发后 | 固定时间间隔 |
| **适用场景** | 搜索框、窗口 resize | 滚动、按钮点击 |
| **触发次数** | 1 次（稳定后） | 多次（按间隔） |

**带立即执行选项的防抖：**
```javascript
function debounce(fn, delay, immediate = false) {
  let timer = null;
  return function(...args) {
    const context = this;
    const callNow = immediate && !timer;
    
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (!immediate) {
        fn.apply(context, args);
      }
    }, delay);
    
    if (callNow) {
      fn.apply(context, args);
    }
  };
}
```

**知识点：** `防抖` `节流` `性能优化` `debounce` `throttle`

:::

---

### Q11: 如何移除事件监听器？常见陷阱有哪些？

> **🔥 中等 · 事件移除**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**基本移除方式：**
```javascript
// 添加
function handleClick() {
  console.log('clicked');
}
element.addEventListener('click', handleClick);

// 移除（必须同一函数引用）
element.removeEventListener('click', handleClick);
```

**常见陷阱：**

**1. 匿名函数无法移除**
```javascript
// ❌ 错误
element.addEventListener('click', () => {
  console.log('clicked');
});
element.removeEventListener('click', () => {
  console.log('clicked');
}); // 无效！不是同一引用

// ✅ 正确
const handler = () => console.log('clicked');
element.addEventListener('click', handler);
element.removeEventListener('click', handler);
```

**2. 参数必须一致**
```javascript
// ❌ 错误
element.addEventListener('click', handler, true);
element.removeEventListener('click', handler, false); // 无效

// ✅ 正确
element.addEventListener('click', handler, { capture: true });
element.removeEventListener('click', handler, { capture: true });
```

**3. 使用 AbortController（现代方案）**
```javascript
const controller = new AbortController();

element.addEventListener('click', handler, {
  signal: controller.signal
});

// 移除所有关联的监听器
controller.abort();
```

**4. once 选项自动移除**
```javascript
element.addEventListener('click', handler, { once: true });
// 执行一次后自动移除
```

**5. React 中的清理**
```javascript
useEffect(() => {
  const handleResize = () => {};
  window.addEventListener('resize', handleResize);
  
  // 清理函数
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);
```

**内存泄漏风险：**
```javascript
// ❌ 组件卸载时未清理事件
componentDidMount() {
  window.addEventListener('scroll', this.handleScroll);
}
// 没有 componentWillUnmount 清理
// 导致组件无法被垃圾回收
```

**知识点：** `removeEventListener` `事件清理` `内存泄漏` `AbortController` `引用一致`

:::

---

### Q12: 触摸事件（Touch Events）与鼠标事件有什么区别？

> **🔥 中等 · 触摸事件**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**触摸事件类型：**

| 事件 | 触发时机 | 替代鼠标事件 |
|------|----------|-------------|
| `touchstart` | 手指接触屏幕 | mousedown |
| `touchmove` | 手指在屏幕上移动 | mousemove |
| `touchend` | 手指离开屏幕 | mouseup |
| `touchcancel` | 系统取消触摸 | - |

**Touch 事件对象属性：**
```javascript
element.addEventListener('touchstart', (e) => {
  e.touches;        // 当前屏幕上所有触摸点列表
  e.targetTouches;  // 当前元素上的触摸点列表
  e.changedTouches; // 本次事件相关的触摸点
  
  const touch = e.changedTouches[0];
  console.log(touch.clientX, touch.clientY); // 坐标
  console.log(touch.identifier);             // 触摸点 ID
});
```

**主要区别：**

| 特性 | 触摸事件 | 鼠标事件 |
|------|----------|----------|
| **多点触控** | 支持 | 不支持 |
| **hover** | 不支持 | 支持 |
| **触发顺序** | touchstart → touchend → mouse 事件 | 直接触发 |
| **延迟** | 无 | 约 300ms（等待双击） |

**300ms 延迟问题：**
- 移动端点击会有约 300ms 延迟（等待判断是否双击）
- 解决方案：
  1. 使用 `touch-action: manipulation`
  2. 使用 fastclick 库
  3. 直接使用 touch 事件处理

**同时监听触摸和鼠标：**
```javascript
// 处理移动端和桌面端
function handleStart(e) {
  if (e.type === 'touchstart') {
    // 阻止后续 mouse 事件
    e.preventDefault();
  }
  handleClick(e);
}

element.addEventListener('touchstart', handleStart, { passive: false });
element.addEventListener('mousedown', handleStart);
```

**手势识别基础：**
```javascript
let startX, startY;

element.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

element.addEventListener('touchend', (e) => {
  const endX = e.changedTouches[0].clientX;
  const endY = e.changedTouches[0].clientY;
  
  const diffX = endX - startX;
  const diffY = endY - startY;
  
  if (Math.abs(diffX) > Math.abs(diffY)) {
    // 水平滑动
    console.log(diffX > 0 ? '右滑' : '左滑');
  } else {
    // 垂直滑动
    console.log(diffY > 0 ? '下滑' : '上滑');
  }
});
```

**知识点：** `触摸事件` `touchstart` `touchmove` `touchend` `移动端`

:::

---

### Q13: 什么是 events 属性？如何调试事件监听器？

> **⭐ 简单 · 事件调试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Chrome DevTools 查看事件监听器：**

**1. Elements 面板**
```
1. 右击元素 → Inspect
2. 右侧 → Event Listeners 面板
3. 按事件类型分组显示
4. 点击可查看监听器源码位置
```

**2. Event Listener Breakpoints**
```
1. Sources 面板 → 右侧 Event Listener Breakpoints
2. 勾选事件类别（Mouse、Keyboard 等）
3. 事件触发时自动断点
```

**3. getEventListeners API**
```javascript
// Chrome DevTools 控制台专用
const listeners = getEventListeners(element);
console.log(listeners);
// 输出：{ click: [{ listener: fn, useCapture: false }], ... }
```

**4. 编程方式检查**
```javascript
// 没有标准的 API 获取监听器列表
// 可以 monkey-patch addEventListener
const originalAdd = Element.prototype.addEventListener;
Element.prototype.addEventListener = function(type, fn, options) {
  console.log('添加监听器:', type, fn);
  originalAdd.call(this, type, fn, options);
};
```

**5. 检查元素是否可点击**
```css
/* 调试事件目标 */
* {
  outline: 1px solid red;
}

/* 检查 pointer-events */
.not-clickable {
  pointer-events: none;
}
```

**常见问题排查：**
1. **点击没反应**：检查是否有重叠元素覆盖
2. **事件不触发**：检查监听器是否正确绑定
3. **事件触发多次**：检查是否重复绑定
4. **事件冒泡问题**：检查是否有 stopPropagation

**知识点：** `事件调试` `DevTools` `Event Listeners` `断点调试` `getEventListeners`

:::

---
### Q14: onload 和 DOMContentLoaded 的区别？

> **⭐ 简单 · 事件机制**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**onload 和 DOMContentLoaded 都是页面加载事件，但触发时机不同。**

**1. 触发时机对比：**

```
1. HTML 解析开始
        ↓
2. DOM 树构建完成
        ↓
   ┌───📍 DOMContentLoaded 触发
   │   （DOM 就绪，但图片等资源可能未加载完）
   │
3. 资源加载（图片、样式表、iframe 等）
   │
   ↓
   ┌───📍 load 事件触发
       （所有资源完全加载）
```

**2. 代码示例：**

```javascript
// DOMContentLoaded - DOM 解析完成立即执行
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM 构建完成');
  // 可以操作 DOM 元素
  const btn = document.querySelector('#btn');
  btn.addEventListener('click', handleClick);
});

// load - 所有资源加载完成
window.addEventListener('load', () => {
  console.log('页面完全加载');
  // 可以获取图片尺寸等
  const img = document.querySelector('img');
  console.log('图片尺寸:', img.width, img.height);
});

// 等价写法
document.onreadystatechange = function() {
  if (document.readyState === 'interactive') {
    // 等价于 DOMContentLoaded
    console.log('interactive');
  }
  if (document.readyState === 'complete') {
    // 等价于 load
    console.log('complete');
  }
};
```

**3. readyState 状态：**

```javascript
// loading - HTML 还在解析中
// interactive - DOM 解析完成（DOMContentLoaded 已触发）
// complete - 所有资源加载完成（load 已触发）

console.log(document.readyState);

document.addEventListener('readystatechange', () => {
  console.log('readyState:', document.readyState);
});
```

**4. 实际应用场景：**

```javascript
// 场景 1：初始化 UI（使用 DOMContentLoaded）
document.addEventListener('DOMContentLoaded', () => {
  initUI();       // 绑定事件
  initLayout();   // 计算布局
  // 不需要等图片加载完
});

// 场景 2：获取资源信息（使用 load）
window.addEventListener('load', () => {
  // 图片懒加载初始化需要图片真实尺寸
  initLazyLoad();
  
  // 计算页面总高度
  const pageHeight = document.body.scrollHeight;
});

// 场景 3：性能指标采集
window.addEventListener('load', () => {
  const loadTime = performance.now();
  console.log('页面加载时间:', loadTime);
  
  // 上报性能数据
  reportMetrics({ loadTime });
});
```

**5. 对比表格：**

| 特性 | DOMContentLoaded | load |
|------|-----------------|------|
| 触发时机 | DOM 树构建完成 | 所有资源加载完成 |
| 触发对象 | document | window |
| 执行时间 | 较早 | 较晚 |
| 依赖资源 | 不依赖 CSS/图片 | 依赖所有资源 |
| 典型用途 | DOM 操作、事件绑定 | 资源尺寸、性能统计 |

**6. 注意事项：**

```javascript
// ⚠️ 如果动态添加脚本，事件可能已触发
function addScript(src) {
  const script = document.createElement('script');
  script.src = src;
  document.body.appendChild(script);
  
  // 检查是否在添加前已触发
  if (document.readyState === 'complete') {
    // 已经触发过了，直接执行回调
    onScriptLoaded();
  } else {
    script.onload = onScriptLoaded;
  }
}

// ⚠️ 可以手动触发（用于测试）
document.dispatchEvent(new Event('DOMContentLoaded'));
window.dispatchEvent(new Event('load'));
```

**知识点：** `事件机制` `DOMContentLoaded` `load` `页面生命周期` `性能优化`

:::


### Q15: 浏览器的安全策略有哪些？

> **🔥 中等 · 浏览器安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**浏览器核心安全策略：**

| 策略 | 作用 | 示例 |
|------|------|------|
| 同源策略 | 限制不同源的资源访问 | 阻止跨域 AJAX |
| CSP | 防止 XSS 攻击 | Content-Security-Policy 头 |
| CORS | 安全的跨域请求 | Access-Control-Allow-Origin |
| 沙箱机制 | 隔离不可信内容 | iframe sandbox 属性 |
| HTTPS | 加密传输 | TLS/SSL 加密 |

**1. 同源策略（Same-Origin Policy）：**

```text
同源 = 协议 + 域名 + 端口 三者完全相同

URL                  是否同源
http://a.com/index   ✅ 同源
http://a.com/page    ✅ 同源
https://a.com/page   ❌ 协议不同
http://b.com/page    ❌ 域名不同
http://a.com:8080    ❌ 端口不同
```

```js
// 同源策略限制：
// ✅ 允许：SCRIPT 标签、IMG 标签、LINK 标签加载跨域资源
// ❌ 禁止：AJAX/Fetch 跨域请求（除非 CORS）
// ❌ 禁止：iframe 跨域访问 DOM
// ❌ 禁止：localStorage/IndexedDB 跨域访问

// 绕过同源策略的方案：
// 1. CORS（服务端设置 Access-Control-Allow-Origin）
// 2. JSONP（仅 GET 请求）
// 3. postMessage（窗口/iframe 通信）
// 4. WebSocket（不受同源限制）
// 5. 代理服务器（同域代理）
```

**2. CSP（Content Security Policy）：**

```nginx
# Nginx 配置
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://cdn.example.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; frame-ancestors 'none';" always;
```

```text
CSP 指令说明：

| 指令 | 作用 | 示例 |
|------|------|------|
| default-src | 默认策略 | 'self' |
| script-src | JS 来源 | 'self' 'unsafe-inline' https://cdn.com |
| style-src | CSS 来源 | 'self' 'unsafe-inline' |
| img-src | 图片来源 | 'self' data: https: |
| connect-src | AJAX/WebSocket | 'self' https://api.com |
| font-src | 字体来源 | 'self' https://fonts.com |
| frame-ancestors | iframe 嵌套 | 'none' (防点击劫持) |
| base-uri | base 标签 | 'self' |
| form-action | 表单提交 | 'self' |
| upgrade-insecure-requests | HTTP 升级 HTTPS | 无值 |

危险值：
- 'unsafe-inline' — 允许内联脚本（降低 XSS 防护）
- 'unsafe-eval' — 允许 eval()（严重降低安全性）
- * — 允许所有来源（不推荐）
```

**3. CORS（跨域资源共享）：**

```js
// 服务端响应头
Access-Control-Allow-Origin: https://frontend.com  // 允许的源
Access-Control-Allow-Methods: GET, POST, PUT      // 允许的方法
Access-Control-Allow-Headers: Content-Type        // 允许的 header
Access-Control-Allow-Credentials: true             // 允许携带 Cookie
Access-Control-Max-Age: 86400                      // 预检缓存时间

// 前端请求
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include'  // 携带 Cookie
})
```

**4. 沙箱机制（Sandbox）：**

```html
<!-- iframe 沙箱 -->
<iframe src="page.html" sandbox="allow-scripts allow-same-origin">
<!-- 默认禁用所有权限，需显式开启 -->

沙箱权限：
- allow-scripts — 允许执行脚本
- allow-same-origin — 视为同源
- allow-forms — 允许提交表单
- allow-popups — 允许弹出窗口
- allow-modals — 允许模态框
- allow-top-navigation — 允许跳转父页面
```

**5. HTTPS 安全传输：**

```text
HTTPS = HTTP + TLS/SSL 加密

安全措施：
1. 数据加密 — 防止中间人窃听
2. 身份验证 — 证书验证服务器身份
3. 完整性保护 — 防止数据被篡改

HTTP 问题：
- 明文传输，可被窃听
- 易受中间人攻击
- 运营商劫持注入广告
```

**其他安全措施：**

```js
// 1. HttpOnly Cookie — 防止 XSS 窃取
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Strict

// 2. SameSite Cookie — 防止 CSRF
SameSite=Strict   // 禁止所有跨站发送
SameSite=Lax      // 允许 GET 跨站
SameSite=None     // 允许跨站（需 Secure）

// 3. X-Frame-Options — 防点击劫持
X-Frame-Options: DENY         // 禁止嵌套
X-Frame-Options: SAMEORIGIN   // 只允许同源嵌套

// 4. X-Content-Type-Options — 防 MIME 嗅探
X-Content-Type-Options: nosniff

// 5. Referrer-Policy — 控制 Referrer 信息
Referrer-Policy: no-referrer
Referrer-Policy: strict-origin-when-cross-origin
```

**知识点：** `同源策略` `CSP` `CORS` `沙箱` `HTTPS` `HttpOnly` `SameSite` `XSS 防护` `CSRF 防护`

:::
