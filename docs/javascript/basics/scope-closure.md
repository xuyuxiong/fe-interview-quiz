---
title: 作用域与闭包
description: 词法作用域、闭包原理、变量提升、IIFE、块级作用域、let/const 暂时性死区、内存泄漏等核心面试题
---

# 作用域与闭包

作用域和闭包是 JavaScript 最核心的概念之一，理解它们对于写出正确的异步代码和避免内存泄漏至关重要。

---

## 📝 题目

### Q1: 以下代码输出什么？为什么？

> **🔥 中等 · JavaScript**

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => {
    console.log(i);
  }, 100);
}
```

::: details 🔍 点击查看答案与解析

**✅ 答案：** 输出三次 `3`

**💡 解析：**
使用 `var` 声明的 `i` 是**函数作用域**（在此例中是全局作用域），三个定时器共享同一个 `i` 变量。当定时器执行时，循环已经结束，`i` 的值为 3。

**如何输出 0, 1, 2？两种方案：**

**方案 1：使用 let（块级作用域）**
```js
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
```

**方案 2：使用 IIFE 创建闭包**
```js
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}
```

**知识点：** `var 函数作用域` `let 块级作用域` `闭包捕获变量`

:::

---

### Q2: 什么是词法作用域？

> **⭐ 简单 · JavaScript**

```js
let a = 1;
function outer() {
  let b = 2;
  function inner() {
    let c = 3;
    console.log(a, b, c);
  }
  inner();
}
outer();
```

什么是词法作用域？inner 函数能访问哪些变量？

::: details 🔍 点击查看答案与解析

**✅ 答案：** 输出 `1 2 3`。inner 函数可以访问 a、b、c 三个变量。

**💡 解析：**
**词法作用域（Lexical Scope）** 是指函数的作用域在函数定义时就已经确定，而不是在调用时确定。内层函数可以访问外层函数的变量，形成作用域链。

**作用域链查找规则：**
1. 先在当前作用域查找
2. 找不到则向上一层作用域查找
3. 一直查找到全局作用域
4. 如果全局作用域也找不到，则抛出 ReferenceError

**知识点：** `词法作用域` `作用域链` `变量访问`

:::

---

### Q3: 什么是变量提升？var、let、const 有什么区别？

> **⭐ 简单 · JavaScript**

```js
console.log(a);
console.log(b);
console.log(c);

var a = 1;
let b = 2;
const c = 3;
```

这段代码会输出什么？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
undefined
ReferenceError: Cannot access 'b' before initialization
ReferenceError: Cannot access 'c' before initialization
```

**💡 解析：**
**var 变量提升：** `var` 声明的变量会被提升到作用域顶部，但赋值不会提升。所以 `a` 在声明前访问得到 `undefined`。

**let/const 暂时性死区（TDZ）：** `let` 和 `const` 虽然也会被提升，但在声明前访问会抛出 ReferenceError。从作用域开始到变量声明的区域称为"暂时性死区"。

**var vs let vs const：**
| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数作用域 | 块级作用域 | 块级作用域 |
| 变量提升 | 是（初始化为 undefined） | 是（TDZ） | 是（TDZ） |
| 重复声明 | 允许 | 不允许 | 不允许 |
| 必须初始化 | 否 | 否 | 是 |

**知识点：** `变量提升` `暂时性死区` `var vs let vs const`

:::

---

### Q4: 什么是 IIFE？有什么作用？

> **⭐ 简单 · JavaScript**

```js
(function() {
  const privateVar = '我是私有变量';
  console.log(privateVar);
})();

console.log(typeof privateVar);
```

这段代码的输出是什么？IIFE 有什么作用？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
我是私有变量
undefined
```

**💡 解析：**
**IIFE（Immediately Invoked Function Expression）** 是立即调用函数表达式。它在定义后立即执行，创造了独立的作用域。

**常见写法：**
```js
// 方式 1
(function() {})();

// 方式 2
(() => {})();

// 方式 3
!function() {};

// 方式 4
void function() {};
```

**作用：**
1. 创建独立作用域，避免污染全局命名空间
2. 实现私有变量（闭包）
3. 在 ES6 之前模拟块级作用域
4. 捕获循环变量（let 出现前的解决方案）

**知识点：** `IIFE` `立即调用函数` `作用域隔离`

:::

---

### Q5: 什么是闭包？闭包的优缺点是什么？

> **🔥 中等 · JavaScript**

```js
function createCounter() {
  let count = 0;
  return function() {
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
console.log(counter()); // 3
```

为什么 count 没有被垃圾回收？

::: details 🔍 点击查看答案与解析

**✅ 答案：** 闭包是指函数能够访问并记住其词法作用域中的变量，即使函数在其作用域外执行。

**💡 解析：**
**闭包原理：**
当内层函数引用了外层函数的变量时，会形成闭包。外层函数执行完毕后，其变量本应被销毁，但由于内层函数仍然持有对这些变量的引用，所以这些变量会被保留在内存中。

**闭包的优点：**
1. 实现数据私有化（模拟私有变量）
2. 保持状态（如计数器）
3. 实现函数柯里化
4. 实现防抖节流

**闭包的缺点：**
1. 可能导致内存泄漏（变量无法被 GC）
2. 占用更多内存
3. 可能引发性能问题

**避免内存泄漏：**
```js
// 不使用时将闭包引用设为 null
counter = null;
```

**知识点：** `闭包原理` `内存管理` `数据私有化`

:::

---

### Q6: 块级作用域和函数作用域有什么区别？

> **⭐ 简单 · JavaScript**

```js
function test() {
  if (true) {
    var a = 1;
    let b = 2;
    const c = 3;
  }
  console.log(a); // ?
  console.log(b); // ?
  console.log(c); // ?
}
test();
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
1
ReferenceError: b is not defined
ReferenceError: c is not defined
```

**💡 解析：**
**函数作用域（var）：** `var` 声明的变量在整个函数内都有效，不受块级结构（如 if、for）限制。

**块级作用域（let/const）：** `let` 和 `const` 声明的变量只在最近的块级作用域内有效。块级作用域由 `{}` 包围的代码块定义。

**块级作用域场景：**
- `if` 语句块
- `for`/`while` 循环块
- `switch` 语句块
- 任意 `{}` 代码块

**知识点：** `块级作用域` `函数作用域` `let vs var`

:::

---

### Q7: 使用闭包实现防抖函数

> **🔥 中等 · JavaScript**

请实现一个防抖函数，并解释其原理。

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```js
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    const context = this;
    // 清除之前的定时器
    if (timer) clearTimeout(timer);
    // 重新设置定时器
    timer = setTimeout(() => {
      fn.apply(context, args);
    }, delay);
  };
}

// 使用示例
const inputHandler = debounce(function(e) {
  console.log('搜索:', e.target.value);
}, 300);
```

**💡 解析：**
**防抖原理：** 在事件被触发 n 秒后再执行回调，如果在这 n 秒内又被触发，则重新计时。

**闭包的作用：** `timer` 变量通过闭包被保留，每次调用时都能访问和修改同一个 timer 变量。

**应用场景：**
- 搜索框输入（减少 API 请求）
- 窗口 resize 事件
- 表单提交按钮
- 滚动事件

**知识点：** `防抖` `闭包应用` `定时器`

:::

---

### Q8: 使用闭包实现节流函数

> **🔥 中等 · JavaScript**

请实现一个节流函数，并解释其原理。

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```js
function throttle(fn, delay) {
  let lastTime = 0;
  return function(...args) {
    const context = this;
    const now = Date.now();
    // 距离上次执行超过 delay 才执行
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(context, args);
    }
  };
}

// 使用示例
const scrollHandler = throttle(function() {
  console.log('滚动位置:', window.scrollY);
}, 100);
window.addEventListener('scroll', scrollHandler);
```

**💡 解析：**
**节流原理：** 保证函数在指定的时间间隔内只执行一次。无论触发多少次，每隔 delay 时间只执行一次。

**闭包的作用：** `lastTime` 变量通过闭包被保留，用于记录上次执行时间。

**防抖 vs 节流：**
- **防抖**：n 秒内只执行最后一次
- **节流**：n 秒内只执行一次

**应用场景：**
- 滚动加载
- 按钮重复点击
- API 请求频率限制

**知识点：** `节流` `闭包应用` `性能优化`

:::

---

### Q9: 闭包常见的内存泄漏场景有哪些？

> **💀 困难 · JavaScript**

```js
// 场景 1：意外的全局变量
function leak1() {
  leakedVar = '我是全局变量';
}

// 场景 2：被遗忘的定时器
function leak2() {
  const data = new Array(1000000).fill('x');
  setInterval(() => {
    console.log(data.length);
  }, 1000);
}

// 场景 3：闭包引用
function createLeak() {
  const bigData = new Array(1000000).fill('data');
  return function() {
    console.log('我只需要一个标记');
  };
}
```

这些场景为什么会导致内存泄漏？如何避免？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**💡 解析：**

**场景 1：意外的全局变量**
- 忘记使用 `var/let/const` 声明的变量会成为全局变量
- 全局变量在页面关闭前不会被回收
- **解决：** 始终使用 `var/let/const` 声明变量

**场景 2：被遗忘的定时器**
- 定时器回调持有外部变量引用
- 定时器不清除会一直运行
- **解决：** 使用 `clearInterval` 清除定时器

**场景 3：闭包引用大对象**
- 闭包内部虽然没有使用 bigData，但整个作用域都被保留
- **解决：** 只保留需要的数据，或手动解除引用

**最佳实践：**
```js
// 显式清除引用
let timer = setInterval(() => {}, 1000);
// 完成后清除
clearInterval(timer);
timer = null;
```

**知识点：** `内存泄漏` `闭包陷阱` `定时器清理`

:::

---

### Q10: 使用闭包实现私有变量

> **🔥 中等 · JavaScript**

使用闭包实现一个具有私有变量的计数器类。

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```js
function Counter() {
  // 私有变量
  let count = 0;
  
  // 特权方法（可以访问私有变量）
  this.increment = function() {
    count++;
    return count;
  };
  
  this.decrement = function() {
    count--;
    return count;
  };
  
  this.getCount = function() {
    return count;
  };
}

const counter = new Counter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.count);       // undefined (私有)
```

**💡 解析：**
**实现原理：**
- `count` 变量在构造函数内部声明，外部无法直接访问
- 通过特权方法（在构造函数内定义的方法）访问私有变量
- 每个实例都有自己独立的闭包作用域

**ES6 class 实现：**
```js
class Counter {
  #count = 0;  // ES2022 私有字段
  
  increment() {
    return ++this.#count;
  }
}
```

**知识点：** `私有变量` `闭包封装` `特权方法`

:::

---

### Q11: 使用闭包实现函数柯里化

> **💀 困难 · JavaScript**

请实现一个通用的柯里化函数，并解释其原理。

```js
// 期望效果
function add(a, b, c) {
  return a + b + c;
}
const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3));     // 6
console.log(curriedAdd(1, 2)(3));     // 6
console.log(curriedAdd(1)(2, 3));     // 6
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```js
function curry(fn) {
  // 获取函数需要的参数个数
  const arity = fn.length;
  
  return function curried(...args) {
    // 如果参数够了，直接执行
    if (args.length >= arity) {
      return fn.apply(this, args);
    }
    // 否则返回一个新函数，累积参数
    return function(...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}

// 测试
function add(a, b, c) {
  return a + b + c;
}
const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3));   // 6
console.log(curriedAdd(1, 2)(3));   // 6
console.log(curriedAdd(1)(2, 3));   // 6
```

**💡 解析：**
**柯里化原理：** 将接收多个参数的函数转换为接收单个参数的函数链，每次只接收一个（或部分）参数。

**闭包的作用：** 通过闭包保存已传入的参数，直到参数足够时再执行原函数。

**应用场景：**
- 参数复用
- 函数组合
- 延迟执行

**知识点：** `函数柯里化` `闭包` `参数累积`

:::

---

## 🔑 核心知识点总结

### 1. 作用域类型

| 类型 | 关键字 | 特点 |
|------|--------|------|
| 全局作用域 | - | 整个程序可访问 |
| 函数作用域 | var | 函数内可访问 |
| 块级作用域 | let/const | {} 内可访问 |

### 2. 变量提升对比

```js
// var - 提升并初始化为 undefined
console.log(a); // undefined
var a = 1;

// let/const - 提升但有 TDZ
console.log(b); // ReferenceError
let b = 2;
```

### 3. 闭包应用场景

- **数据私有化**：模拟私有变量
- **状态保持**：计数器、累加器
- **函数工厂**：创建特定功能的函数
- **防抖节流**：性能优化
- **柯里化**：函数式编程
- **迭代器**：生成器之前的方案

### 4. 避免闭包内存泄漏

1. 及时清除定时器
2. 移除事件监听器
3. 手动解除大对象引用
4. 避免不必要的全局变量

## 💡 面试技巧

1. **闭包核心**：函数 + 词法作用域 = 闭包
2. **var 问题**：函数作用域、变量提升、循环陷阱
3. **let/const 优势**：块级作用域、TDZ、更合理
4. **闭包两面性**：功能强大但要小心内存
5. **防抖节流**：必考的性能优化手段
6. **IIFE 用途**：创造独立作用域
---

### Q12: 箭头函数和普通函数有什么区别？能当构造函数吗？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心区别：**

| 特性 | 箭头函数 | 普通函数 |
|------|----------|----------|
| this 指向 | 词法作用域（继承外层） | 动态绑定（调用方式决定） |
| arguments | ❌ 无 | ✅ 有 |
| prototype | ❌ 无 | ✅ 有 |
| 可作构造函数 | ❌ 不能 new | ✅ 可以 |
| Yield | ❌ 不能yield | ✅ generators |
| callee/caller | ❌ 无 | ✅ 有 |

**1. this 指向差异：**

```js
// 普通函数 - this 动态绑定
function regular() {
  console.log(this)
}

regular()  // this = window/undefined
new regular()  // this = 新实例
obj.regular()  // this = obj

// 箭头函数 - this 词法绑定
const arrow = () => {
  console.log(this)
}

arrow()  // this = 定义时的外层 this
```

**2. 箭头函数 this 陷阱：**

```js
// ❌ 错误：对象方法用箭头函数
const obj = {
  name: '张三',
  greet: () => {
    console.log(`Hello, ${this.name}`)  // this 不是 obj！
  }
}

obj.greet()  // Hello, undefined

// ✅ 正确：普通函数
const obj = {
  name: '张三',
  greet() {
    console.log(`Hello, ${this.name}`)
  }
}

obj.greet()  // Hello, 张三
```

**3. 不能当构造函数：**

```js
const Person = (name) => {
  this.name = name  // ❌ this 不是新对象
}

const p = new Person('张三')  // ❌ TypeError: Person is not a constructor
```

**4. 没有 arguments：**

```js
function regular() {
  console.log(arguments)  // ✅ [1, 2, 3]
}

const arrow = (...args) => {
  console.log(arguments)  // ❌ ReferenceError
  console.log(args)  // ✅ [1, 2, 3]
}

regular(1, 2, 3)
arrow(1, 2, 3)
```

**5. 不能 yield（不是生成器）：**

```js
const arrowGen = function*() {
  yield 1
  yield 2
}
// ✅ 生成器必须是普通函数

const arrow = () => {
  yield 1  // ❌ SyntaxError
}
```

**适用场景：**

✅ **箭头函数适合：**
- 回调函数（setTimeout、数组方法）
- 需要继承外层 this 的场景
- 简洁的表达式函数

```js
// ✅ 典型场景
[1, 2, 3].map(x => x * 2)
setTimeout(() => this.update(), 1000)
```

❌ **不要用箭头函数：**
- 对象方法（需要 this）
- 构造函数
- 需要 arguments
- 事件处理器（需要 this 指向元素）

**知识点：** `箭头函数` `this 指向` `arguments` `prototype` `构造函数`

:::

---

### Q13: CommonJS 和 ES Module 的区别？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心差异：**

| 特性 | CommonJS | ES Module |
|------|----------|-----------|
| 环境 | Node.js (服务端) | 浏览器/Node |
| 语法 | require/module.exports | import/export |
| **值拷贝 vs 引用** | 值拷贝 | 实时引用 |
| **加载时机** | 运行时 | 编译时（静态分析） |
| **top-level await** | ❌ | ✅ |
| this | 指向模块 Export 对象 | undefined |

**1. 值拷贝 vs 引用：**

```js
// CommonJS - 值拷贝
// a.js
let count = 0
module.exports = { count }

// b.js
const a = require('./a')
console.log(a.count)  // 0
a.count++
console.log(a.count)  // 1

// a.js 再导出时，b.js 的 count 不会变（值拷贝）

// ES Module - 实时引用
// a.mjs
export let count = 0
setInterval(() => count++, 1000)

// b.mjs
import { count } from './a.mjs'
setInterval(() => {
  console.log(count)  // 每秒输出递增的值（实时引用）
}, 1000)
```

**2. 运行时 vs 编译时：**

```js
// CommonJS - 运行时，动态
const path = './' + fileName
const module = require(path)  // ✅ 可以动态

// ES Module - 编译时，静态
import module from './' + fileName  // ❌ 必须静态字符串
import { func } from './module.js'  // ✅
```

**3. 循环引用差异：**

```js
// CommonJS - 循环引用问题
// a.js
const b = require('./b')
console.log('a:', b)  // 可能输出不完整

// b.js
const a = require('./a')
module.exports = { a }

// ES Module - 循环引用正确处理
// 使用 export/import 语句，按需同步
```

**4. 典型使用：**

```js
// CommonJS (Node.js)
const fs = require('fs')
const { readFile } = require('fs')
module.exports = function() {}
exports.name = 'test'

// ES Module (现代)
import fs from 'fs'
import { readFile } from 'fs'
export default function() {}
export const name = 'test'

// Node.js 中使用 ESM
// package.json: "type": "module"
// 或文件后缀：.mjs
```

**兼容性：**

```js
// ES Module 导入 CommonJS
import cjs from './cjs-module.js'  // ✅

// CommonJS 导入 ES Module（需要动态import）
const esm = await import('./esm-module.js')  // ✅
```

**知识点：** `CommonJS` `ES Module` `值拷贝` `实时引用` `编译时` `运行时`

:::

---

### Q14: Map 和 WeakMap 的区别？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心区别：**

| 特性 | Map | WeakMap |
|------|-----|---------|
| **key 类型** | 任意类型 | 仅对象（不能是原始值） |
| **引用强度** | 强引用 | 弱引用（可被 GC） |
| **可迭代** | ✅ 可遍历 | ❌ 不可遍历 |
| **size 属性** | ✅ | ❌ |
| **clear() 方法** | ✅ | ❌ |
| **内存泄漏风险** | 需注意 | 自动回收，避免泄漏 |

**1. Key 类型差异：**

```js
// Map - 支持任意 key
const map = new Map()
map.set('string', '字符串 key')
map.set(123, '数字 key')
map.set({}, '对象 key')
map.set(null, 'null key')

// WeakMap - 仅支持对象 key
const weakMap = new WeakMap()
const obj = {}
weakMap.set(obj, '值')
// weakMap.set('key', 'value')  // ❌ TypeError
```

**2. 弱引用和垃圾回收：**

```js
// Map - 强引用，不释放
const map = new Map()
let obj = { name: '张三' }
map.set(obj, '数据')

obj = null  // obj 没被回收，因为 map 还在引用

// WeakMap - 弱引用，自动 GC
const weakMap = new WeakMap()
let obj = { name: '张三' }
weakMap.set(obj, '数据')

obj = null  // ✅ 对象可被垃圾回收
```

**3. 应用场景：**

```js
// Map - 缓存、字典、频繁操作
const cache = new Map()
cache.set('key1', { data: '...' })
cache.get('key1')
cache.delete('key1')

// WeakMap - 元数据、私有属性、DOM 关联
const weakMeta = new WeakMap()

function addMeta(element, meta) {
  weakMeta.set(element, meta)  // 元素删除后自动清理
}

// 私有属性模拟
const privates = new WeakMap()
class MyClass {
  constructor() {
    privates.set(this, { secret: 'value' })
  }
}
```

**4. DOM 元素关联：**

```js
// 避免内存泄漏
const elementData = new WeakMap()

function setData(el, data) {
  elementData.set(el, data)
}

function getData(el) {
  return elementData.get(el)
}

// 当元素从 DOM 移除，数据自动被 GC
document.body.removeChild(el)  // elementData 中的条目可被回收
```

**API 对比：**

```js
// Map 完整 API
const map = new Map()
map.set('k', 'v')
map.get('k')
map.has('k')
map.delete('k')
map.clear()
map.size
map.forEach((v, k) => {})

// WeakMap 有限 API
const weakMap = new WeakMap()
weakMap.set(obj, 'v')
weakMap.get(obj)
weakMap.has(obj)
weakMap.delete(obj)
// ❌ 无 size, clear, forEach, 遍历
```

**知识点：** `Map` `WeakMap` `弱引用` `垃圾回收` `内存管理`

:::

---

### Q15: Proxy 能监听基本数据类型吗？如何实现？

> **💀 困难 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**直接回答：不能直接代理基本数据类型。**

Proxy 只能代理对象（包括数组、函数），不能代理原始值（string、number、boolean、null、undefined、symbol、bigint）。

```js
// ❌ 错误：基本类型不能代理
const str = 'hello'
const proxy = new Proxy(str, {
  get(target, key) {
    return target[key]
  }
})  // TypeError: Cannot create proxy with a non-object as target

// ❌ 错误
const num = 42
new Proxy(num, {})  // TypeError
```

**实现方案：**

**1. 使用包装对象（Object wrapper）**

```js
// 将基本类型包装成对象
function createProxiedString(value) {
  const obj = { value }
  
  return new Proxy(obj, {
    get(target, key) {
      if (key === 'valueOf') {
        return () => target.value
      }
      if (key === 'toString') {
        return () => target.value.toString()
      }
      return Reflect.get(target, key)
    },
    set(target, key, newValue) {
      target.value = newValue
      console.log(`值已更新：${newValue}`)
      return true
    }
  })
}

const proxy = createProxiedString('hello')
console.log(proxy.valueOf())  // 'hello'
proxy.value = 'world'  // "值已更新：world"
```

**2. 使用 getter/setter 模拟（Vue 2 方案）**

```js
function reactivePrimitive(value) {
  let internalValue = value
  
  return {
    get value() {
      console.log('读取值')
      return internalValue
    },
    set value(newValue) {
      console.log(`值从 ${internalValue} 变为 ${newValue}`)
      internalValue = newValue
    }
  }
}

const state = reactivePrimitive(0)
console.log(state.value)  // 0
state.value = 1  // "值从 0 变为 1"
```

**3. 使用 Proxy 代理包含基本类型的对象**

```js
function createReactive(initialData) {
  return new Proxy(initialData, {
    get(target, key) {
      const value = target[key]
      console.log(`读取 ${key}`)
      return value
    },
    set(target, key, value) {
      console.log(`设置 ${key} = ${value}`)
      target[key] = value
      return true
    }
  })
}

const state = createReactive({ count: 0, name: '张三' })
state.count++  // "读取 count" → "设置 count = 1"
```

**4. Vue 3 的 ref 实现**

```js
// Vue 3 原理
function ref(value) {
  const refObj = {
    _value: value,
    get value() {
      track(refObj, 'value')
      return refObj._value
    },
    set value(newValue) {
      refObj._value = newValue
      trigger(refObj, 'value')
    }
  }
  return refObj
}

const count = ref(0)
console.log(count.value)  // 0
count.value++  // 触发响应式更新
```

**核心总结：**

```
基本类型 → 不可变 → 无法直接 Proxy
解决方案：
1. 包装成对象（封装 _value）
2. 使用 getter/setter
3. 代理包含基本类型的对象
```

**知识点：** `Proxy` `基本数据类型` `包装对象` `getter/setter` `响应式`

:::

---

### Q16: 为什么 JS 要设计变量提升？背后的原因是什么？

> **💀 困难 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**变量提升（Hoisting）** 是 JavaScript 引擎在编译阶段处理声明的方式，将变量和函数声明"提升"到作用域顶部。

**设计原因：**

**1. 支持函数和变量在声明前使用**
```js
// 变量可以在声明前使用
console.log(a);  // undefined（不是 ReferenceError）
var a = 1;

// 函数可以在声明前调用
sayHello();  // 'Hello'
function sayHello() {
  console.log('Hello');
}
```

**2. 引擎两阶段处理机制**
JavaScript 引擎执行代码前分为两个阶段：

```js
// 阶段 1：编译/创建阶段 —— 处理所有声明
// 引擎扫描代码，处理：
// - var 声明 → 创建绑定并初始化为 undefined
// - function 声明 → 创建函数对象
// - let/const 声明 → 创建绑定（TDZ 状态）

// 阶段 2：执行阶段 —— 执行代码逻辑
// - 赋值操作
// - 函数调用
```

**3. 互递归函数支持**
```js
// 没有提升就无法实现互递归
function even(n) {
  if (n === 0) return true;
  return odd(n - 1);
}

function odd(n) {
  if (n === 0) return false;
  return even(n - 1);
}

// 不管声明顺序如何，都能正常工作
console.log(even(4));  // true
```

**4. 代码组织和灵活性**
```js
// 主要逻辑在前，实现细节在后
main();

function main() {
  // 主逻辑
}

function helper() {
  // 辅助函数
}

// 无需关心声明顺序，按逻辑组织代码
```

**变量提升的底层实现：**

```js
// 源代码
console.log(a);
var a = 1;
fn();
function fn() {}

// 引擎内部处理（简化）
// 编译阶段
var a;           // 声明并初始化为 undefined
function fn() {} // 创建函数对象

// 执行阶段
console.log(a);  // undefined
a = 1;           // 赋值
fn();            // 调用
```

**var vs let/const 提升差异：**

```js
// var —— 提升并初始化为 undefined
console.log(a);  // undefined
var a = 1;

// let/const —— 提升但有 TDZ（暂时性死区）
console.log(b);  // ReferenceError: Cannot access 'b' before initialization
let b = 2;

// TDZ 存在的原因：
// 1. 避免 undefined 导致的 bug
// 2. 强制先声明后使用
// 3. 更符合开发者直觉
```

**为什么 let/const 不设计为完全的提升？**

```js
// 如果 let 也初始化为 undefined
console.log(a);  // undefined ← 容易忽略声明
let a = 1;

// ReferenceError 强制开发者注意声明位置
console.log(b);  // ReferenceError ← 明确提示错误
let b = 1;
```

**实际开发建议：**

```js
// ✅ 推荐：使用 let/const，声明在顶部或使用前
const API_URL = 'https://api.example.com';

function fetchData() {
  const timeout = 5000;
  let retryCount = 0;
  // ...
}

// ❌ 避免：依赖 var 提升的模糊行为
function bad() {
  if (false) { var x = 1; }
  console.log(x);  // undefined（容易混淆）
}
```

**知识点：** `变量提升` `执行上下文` `编译阶段` `TDZ` `引擎原理`

:::

---

### Q17: IIFE 是什么？为什么需要它？现代替代方案？

> **⭐ 简单 · JavaScript**

请解释 IIFE 的概念和现代写法。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**IIFE（Immediately Invoked Function Expression）** 是立即调用函数表达式，在定义后立即执行。

**常见写法：**
```js
// 方式 1：括号包裹（最常见）
(function() {
  console.log('IIFE 执行了');
})();

// 方式 2：箭头函数
(() => {
  console.log('箭头 IIFE');
})();

// 方式 3：Void 运算符
void function() {
  console.log('void IIFE');
}();

// 方式 4：一元运算符
!function() {
  console.log('! IIFE');
}();
```

**为什么需要 IIFE？**

**1. 避免污染全局命名空间：**
```js
// ❌ 变量暴露在全局
var count = 0;
function init() { }

// ✅ 使用 IIFE 隔离
(function() {
  var count = 0;
  function init() { }
})();
```

**2. 捕获循环变量（let 出现前）：**
```js
// ❌ var 问题
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);  // 3, 3, 3
}

// ✅ IIFE 捕获变量
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100);  // 0, 1, 2
  })(i);
}
```

**3. 实现模块模式：**
```js
const module = (function() {
  let privateVar = 0;
  
  return {
    increment() { privateVar++; },
    getCount() { return privateVar; }
  };
})();
```

**现代替代方案：**

**1. 使用 let/const（块级作用域）：**
```js
// 循环变量
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);  // 0, 1, 2
}

// 块级隔离
{
  const temp = compute();
  process(temp);
}
// temp 在这里不可访问
```

**2. 使用 ES6 模块：**
```js
// module.js - 天然的作用域隔离
let privateVar = 0;
export function increment() { privateVar++; }
```

**3. 使用 class：**
```js
class Counter {
  #privateVar = 0;  // 私有字段
  
  increment() { this.#privateVar++; }
}
```

**知识点：** `IIFE` `立即调用函数` `作用域隔离` `模块模式`

:::

---

### Q18: 闭包会导致内存泄漏吗？如何避免？

> **🔥 中等 · JavaScript**

请说明闭包与内存泄漏的关系及预防措施。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**闭包本身不会导致内存泄漏**，但不当使用会导致内存无法被回收。

**可能导致泄漏的场景：**

**1. 定时器持有大对象引用：**
```js
function leak() {
  const bigData = new Array(1000000).fill('data');
  setInterval(() => {
    console.log(bigData.length);  // 持有 bigData 引用
  }, 1000);
  // 即使不需要 bigData，也无法被 GC
}
```

**2. 事件监听器未移除：**
```js
function setup() {
  const data = { large: 'object' };
  element.addEventListener('click', function handler() {
    console.log(data);  // 持有 data 引用
  });
  // 如果 handler 不移除，data 无法被 GC
}
```

**3. 全局闭包引用：**
```js
const handlers = [];

function createHandler() {
  const bigData = new BigObject();
  handlers.push(() => {
    // 持有 bigData
    return bigData.process();
  });
}
// handlers 中的闭包会一直持有 bigData
```

**如何避免：**

**1. 清除定时器：**
```js
let timer = setInterval(() => {}, 1000);

// 用完清除
clearInterval(timer);
timer = null;
```

**2. 移除事件监听器：**
```js
function handler() { console.log('click'); }
element.addEventListener('click', handler);

// 清理时移除
element.removeEventListener('click', handler);
```

**3. 及时解除引用：**
```js
let data = loadBigData();
process(data);
data = null;  // 手动解除引用
```

**4. React useEffect 清理：**
```js
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer);  // 组件卸载时清理
}, []);
```

**5. WeakMap 替代：**
```js
// 使用 WeakMap，对象可被自动回收
const cache = new WeakMap();
function associate(obj, data) {
  cache.set(obj, data);  // obj 删除后，data 可被 GC
}
```

**知识点：** `闭包` `内存泄漏` `垃圾回收` `定时器清理` `事件监听器`

:::

---

### Q19: 块级作用域和函数作用域的区别是什么？

> **⭐ 简单 · JavaScript**

请说明块级作用域和函数作用域的区别。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**函数作用域（var）：**
变量在整个函数内有效，不受块级结构限制。

```js
function test() {
  if (true) {
    var a = 1;
    for (var i = 0; i < 3; i++) {
      var j = i;
    }
  }
  console.log(a);  // 1 ✓
  console.log(i);  // 3 ✓
  console.log(j);  // 2 ✓
}
```

**块级作用域（let/const）：**
变量只在最近的花括号 `{}` 内有效。

```js
function test() {
  if (true) {
    let a = 1;
  }
  // console.log(a);  // ReferenceError
  
  for (let i = 0; i < 3; i++) {
    let j = i;
  }
  // console.log(i);  // ReferenceError
  // console.log(j);  // ReferenceError
}
```

**块级作用域的场景：**
```js
// 1. if 语句
if (condition) {
  const temp = compute();
  use(temp);
}
// temp 不可访问

// 2. for 循环
for (let i = 0; i < 3; i++) {
  // i 只在循环内有效
}

// 3. 任意代码块
{
  const secret = 'xxx';
  process(secret);
}
// secret 不可访问
```

**对比表格：**

| 特性 | var（函数作用域） | let/const（块级作用域） |
|------|------------------|------------------------|
| 作用域范围 | 整个函数 | 最近的 {} |
| 变量提升 | 是（undefined） | 是（TDZ） |
| 重复声明 | 允许 | 不允许 |
| 循环变量 | 泄漏到外部 | 限制在循环内 |

**知识点：** `块级作用域` `函数作用域` `var` `let` `const`

:::

---

### Q20: eval 和 with 为什么不推荐使用？对作用域有什么影响？

> **💀 困难 · JavaScript**

请解释 eval 和 with 的问题及为什么被废弃。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**eval 的问题：**

1. **破坏词法作用域**：在运行时修改作用域
```js
function test() {
  var x = 1;
  eval('var x = 2');  // 修改了外部 x
  console.log(x);     // 2
}
```

2. **性能问题**：无法优化
```js
// JS 引擎无法确定 eval 会访问哪些变量
// 导致无法进行作用域优化
```

3. **安全隐患**：代码注入风险
```js
// ❌ 危险
eval(userInput);  // XSS 攻击

// ✅ 替代方案
JSON.parse(userInput);
Function('return ' + userInput)();  // 受限
```

**with 的问题：**

1. **模糊作用域**：无法确定属性来自哪里
```js
// 无法确定 obj 是否有 x 属性
with (obj) {
  x = 1;  // 是修改 obj.x 还是外部 x？
}
```

2. **性能问题**：作用域链查找变慢
```js
// with 会在作用域链顶部创建新对象
// 访问变量需要遍历更长的链
```

3. **严格模式禁用**："use strict" 下使用 with 会报错

**现代替代方案：**

**eval 替代：**
```js
// 1. 访问动态属性
obj[dynamicKey];  // 替代 eval("obj." + key)

// 2. 执行代码
new Function('a', 'b', 'return a + b');

// 3. JSON 解析
JSON.parse(jsonString);
```

**with 替代：**
```js
// 明确指定对象
obj.x = 1;
obj.y = 2;

// 解构
const { x, y } = obj;
```

**知识点：** `eval` `with` `作用域` `严格模式` `安全风险`

:::
