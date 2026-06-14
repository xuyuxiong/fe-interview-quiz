---
title: 闭包与作用域补充面试题
description: 箭头函数、CommonJS vs ESM、Map vs WeakMap、Proxy 监听等面试题
---

# 闭包与作用域补充面试题

### Q1: 箭头函数和普通函数有什么区别？能当构造函数吗？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 区别 | 普通函数 | 箭头函数 |
|------|---------|---------|
| this | 取决于调用方式 | 继承外层 this（定义时确定） |
| arguments | 有 | 无（用 rest 参数替代） |
| prototype | 有 | 无 |
| constructor | 可以 new | 不可以 new |
| yield | 可以做 Generator | 不可以 |
| super | 无 | 可以访问外层 super |

```js
// 1. this 绑定
const obj = {
  name: '张三',
  regularFn: function() { console.log(this.name) },  // '张三'
  arrowFn: () => { console.log(this.name) }           // undefined（this 是外层）
}
obj.regularFn() // '张三'
obj.arrowFn()   // undefined（this → window/undefined）

// 2. 不能当构造函数
const Foo = () => {}
new Foo() // TypeError: Foo is not a constructor

// 3. 没有 arguments
const arrow = () => console.log(arguments) // ReferenceError
const arrow2 = (...args) => console.log(args) // ✅ 用 rest 参数

// 4. 没有 prototype
const regular = function() {}
const arrow3 = () => {}
console.log(regular.prototype) // { constructor: f }
console.log(arrow3.prototype)  // undefined

// 5. 箭头函数适合的场景
const numbers = [1, 2, 3]
numbers.map(n => n * 2)                // 回调
setTimeout(() => console.log('hi'), 1000) // 定时器
class App {
  constructor() { this.count = 0 }
  increment = () => { this.count++ }   // 类方法自动绑定 this
}

// 6. 箭头函数不适合的场景
const obj2 = {
  name: '李四',
  getName: () => this.name  // ❌ this 指向外层
}
element.addEventListener('click', () => {
  console.log(this)  // ❌ this 不是元素
})
```

**知识点：** `箭头函数` `this 绑定` `arguments` `构造函数` `prototype`

:::

### Q2: CommonJS 和 ES Module 有什么区别？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 维度 | CommonJS | ES Module |
|------|----------|-----------|
| 语法 | require/module.exports | import/export |
| 加载 | 运行时加载 | 编译时静态分析 |
| 输出 | 值的拷贝 | 值的引用 |
| 同步/异步 | 同步 | 异步 |
| this | this = module | this = undefined |
| 循环引用 | 返回已执行部分 | 引用指向模块命名空间 |
| Tree Shaking | 不支持 | 支持 |
| 顶层 this | module | undefined |
| 动态导入 | 不支持（静态） | import() 动态导入 |

```js
// CommonJS — 值的拷贝
// a.js
let count = 1
setTimeout(() => { count = 2 }, 100)
module.exports = { count }

// b.js
const { count } = require('./a')
console.log(count) // 1 — 是拷贝，不会变

// ESM — 值的引用
// a.mjs
export let count = 1
setTimeout(() => { count = 2 }, 100)

// b.mjs
import { count } from './a.mjs'
setTimeout(() => console.log(count), 200) // 2 — 是引用，会更新

// 动态导入
const module = await import('./heavy.mjs')

// ESM 静态分析支持 Tree Shaking
import { used } from './utils'  // 只打包 used
// import * as utils from './utils'  // 无法 Tree Shaking
```

**知识点：** `CommonJS` `ES Module` `值拷贝 vs 引用` `Tree Shaking` `静态分析`

:::

### Q3: Map 和 WeakMap 的区别？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 维度 | Map | WeakMap |
|------|-----|---------|
| 键类型 | 任意类型 | 只能是对象（非 null） |
| 引用类型 | 强引用 | 弱引用 |
| 可迭代 | ✅ for...of/forEach | ❌ 不可迭代 |
| size 属性 | ✅ | ❌ |
| 清空方法 | clear() | ❌ |
| 垃圾回收 | 不回收键 | 键对象被 GC 后自动清除 |
| 用途 | 通用键值存储 | 私有数据/缓存/DOM 关联 |

```js
// Map — 通用
const map = new Map()
map.set('name', '张三')      // 字符串键
map.set(1, 'number key')     // 数字键
map.set({ id: 1 }, 'object key') // 对象键

// 遍历
for (const [key, value] of map) {
  console.log(key, value)
}
console.log(map.size) // 3

// WeakMap — 弱引用
const weakMap = new WeakMap()
let obj = { name: '临时对象' }
weakMap.set(obj, '关联数据')
console.log(weakMap.get(obj)) // '关联数据'

obj = null // 解除引用 → 垃圾回收会自动清除这个条目
// weakMap 中该条目自动被清除，不会内存泄漏

// 实际应用 1: DOM 节点关联数据（不泄漏）
const elementData = new WeakMap()
elementData.set(button, { clickCount: 0 })
// 按钮 DOM 移除后 → WeakMap 条目自动清除

// 实际应用 2: 类的私有数据
const privateData = new WeakMap()
class Person {
  constructor(name) {
    privateData.set(this, { name })
  }
  getName() {
    return privateData.get(this).name
  }
}
```

**Set vs WeakSet 同理：**

| Set | WeakSet |
|-----|---------|
| 任意值 | 只能是对象 |
| 可迭代 | 不可迭代 |
| size | 无 size |
| 强引用 | 弱引用 |

**知识点：** `Map` `WeakMap` `弱引用` `垃圾回收` `私有数据`

:::

### Q4: Proxy 能监听基本数据类型吗？如何实现？

> **💀 困难 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Proxy 不能直接代理基本数据类型**，只能代理对象。

```js
// ❌ Proxy 不能代理基本类型
const num = 42
const proxy = new Proxy(num, {}) // TypeError: Cannot create proxy with a non-object as target
```

**方案 1: 使用包装对象**
```js
const numObj = new Number(42)
const proxy = new Proxy(numObj, {
  get(target, prop) {
    console.log(`读取 ${prop}`)
    return Reflect.get(target, prop)
  }
})
proxy.valueOf() // 读取 valueOf → 42
proxy + 1       // 43
```

**方案 2: 使用对象包裹 + getter/setter**
```js
function reactive(value) {
  return new Proxy({ value }, {
    get(target, key) {
      if (key === 'value') {
        console.log(`读取：${target.value}`)
        return target.value
      }
      return Reflect.get(target, key)
    },
    set(target, key, newVal) {
      if (key === 'value') {
        console.log(`变化：${target.value} → ${newVal}`)
        target.value = newVal
        return true
      }
      return Reflect.set(target, key, newVal)
    }
  })
}

const count = reactive(0)
count.value   // 读取：0
count.value = 1 // 变化：0 → 1
```

**方案 3: Vue 3 的 ref 实现（核心原理）**
```js
// Vue 3 ref 的简化版
function ref(raw) {
  // 将基本类型包装为对象
  const r = {
    get value() {
      track(r, 'value') // 依赖收集
      return raw
    },
    set value(newVal) {
      raw = newVal
      trigger(r, 'value') // 触发更新
    }
  }
  return r
}

// 使用
const count = ref(0)
console.log(count.value) // 0
count.value++            // 触发更新
```

**方案 4: 使用闭包拦截**
```js
function watchable(initialValue, onChange) {
  let _value = initialValue
  return {
    get value() { return _value },
    set value(newVal) {
      const oldVal = _value
      _value = newVal
      if (oldVal !== newVal) onChange(newVal, oldVal)
    }
  }
}

const name = watchable('hello', (newVal, oldVal) => {
  console.log(`${oldVal} → ${newVal}`)
})
name.value = 'world' // hello → world
```

**总结：** 基本类型不能直接用 Proxy，需要包装成对象（如 ref、包装对象、闭包拦截）才能实现响应式。

**知识点：** `Proxy` `基本类型` `包装对象` `ref` `响应式原理`

:::

---

### Q5: 高阶函数的概念是什么？有哪些用法？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**高阶函数（Higher-Order Function）**：至少满足以下条件之一的函数：
1. 接收一个或多个函数作为参数
2. 返回一个函数

**用法 1：函数作为参数（回调函数）**
```js
// 数组方法
[1, 2, 3].map(x => x * 2);               // [2, 4, 6]
[1, 2, 3].filter(x => x > 1);            // [2, 3]
[1, 2, 3].reduce((a, b) => a + b, 0);    // 6

// 事件监听
btn.addEventListener('click', handleClick);

// 定时器
setTimeout(() => console.log('hi'), 1000);

// 自定义高阶函数
function forEach(array, fn) {
  for (let i = 0; i < array.length; i++) {
    fn(array[i], i);
  }
}
forEach([1, 2, 3], x => console.log(x));
```

**用法 2：函数作为返回值（函数工厂）**
```js
// 创建倍增函数
function createMultiplier(factor) {
  return function(x) {
    return x * factor;
  };
}
const double = createMultiplier(2);
const triple = createMultiplier(3);
console.log(double(5));  // 10
console.log(triple(5));  // 15
```

**用法 3：函数组合**
```js
// compose 从右到左组合
function compose(...fns) {
  return fns.reduce((a, b) => (...args) => a(b(...args)));
}
const add1 = x => x + 1;
const double = x => x * 2;
const fn = compose(double, add1);
console.log(fn(5));  // 12 (5+1=6, 6*2=12)

// pipe 从左到右组合
function pipe(...fns) {
  return fns.reduce((a, b) => (...args) => b(a(...args)));
}
const fn2 = pipe(add1, double);
console.log(fn2(5));  // 12
```

**用法 4：柯里化**
```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn(...args);
    }
    return (...nextArgs) => curried(...args, ...nextArgs);
  };
}
function add(a, b, c) { return a + b + c; }
const curriedAdd = curry(add);
console.log(curriedAdd(1)(2)(3));  // 6
```

**知识点：** `高阶函数` `回调函数` `函数组合` `柯里化` `函数式编程`

:::

---

### Q6: 柯里化和偏函数的区别？手写实现

> **💀 困难 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**柯里化（Currying）**：将接收多个参数的函数转换为接收单个参数的函数链。

**偏函数（Partial Application）**：固定函数的部分参数，返回接收剩余参数的新函数。

**核心区别：**

| 特性 | 柯里化 | 偏函数 |
|------|--------|--------|
| 参数传递 | 一次一个参数 | 一次多个参数 |
| 返回函数 | 总是单参数 | 接收剩余参数 |
| 目的 | 函数链式调用 | 参数预设 |
| 调用方式 | `f(1)(2)(3)` | `f(1,2)(3)` |

**柯里化实现：**
```js
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}

// 使用
function add(a, b, c) { return a + b + c; }
const curriedAdd = curry(add);
curriedAdd(1)(2)(3);        // 6
curriedAdd(1, 2)(3);        // 6
```

**偏函数实现：**
```js
function partial(fn, ...boundArgs) {
  return (...args) => fn(...boundArgs, ...args);
}

// 使用
function greet(greeting, name, punctuation) {
  return `${greeting}, ${name}${punctuation}`;
}

const sayHello = partial(greet, 'Hello');
console.log(sayHello('Alice', '!'));  // Hello, Alice!
```

**知识点：** `柯里化` `偏函数` `函数式编程` `参数复用` `手写实现`

:::

---

### Q7: 柯里化（Currying）和偏函数（Partial Application）的区别？手写实现

> **💀 困难 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**柯里化（Currying）** 与 **偏函数（Partial Application）** 是函数式编程中的两个重要概念，虽然相似但有本质区别。

**核心区别：**

| 特性 | 柯里化 (Currying) | 偏函数 (Partial Application) |
|------|-------------------|-----------------------------|
| 定义 | 将多参数函数转换为多个单参数函数链 | 固定函数的部分参数，返回剩余参数的函数 |
| 参数传递 | 每次只传一个参数 | 可以一次传多个参数 |
| 返回函数 | 总是返回单参数函数 | 返回接收剩余参数的函数 |
| 调用链 | `f(a)(b)(c)` | `f(a, b)(c)` |
| 主要用途 | 函数组合、延迟执行 | 参数预设、代码复用 |

**柯里化（Currying）详解：**

柯里化将一个接受多个参数的函数转换为一系列只接受一个参数的函数链。

```js
// 普通函数
function add(a, b, c) {
  return a + b + c;
}
add(1, 2, 3); // 6

// 柯里化版本
function curryAdd(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}
curryAdd(1)(2)(3); // 6

// 通用柯里化工具函数
function curry(fn) {
  return function curried(...args) {
    // 如果参数够了，直接调用原函数
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    // 否则返回新函数继续累积参数
    return function(...nextArgs) {
      return curried.apply(this, [...args, ...nextArgs]);
    };
  };
}

// 使用通用柯里化
const curriedAdd = curry(add);
curriedAdd(1)(2)(3);    // 6
curriedAdd(1, 2)(3);    // 6
curriedAdd(1)(2, 3);    // 6
curriedAdd(1, 2, 3);    // 6
```

**柯里化的实际应用：**

```js
// 1. 参数复用（函数工厂）
const multiply = curry((a, b) => a * b);
const double = multiply(2);
const triple = multiply(3);
double(5);  // 10
triple(5);  // 15

// 2. 函数组合
const compose = curry((f, g, x) => f(g(x)));
const add1 = x => x + 1;
const double = x => x * 2;
compose(double)(add1)(5);  // 12

// 3. 延迟执行
const log = curry((level, timestamp, msg) => {
  console.log(`[${level}] ${timestamp}: ${msg}`);
});
const errorLog = log('ERROR');
const errorLogNow = errorLog(new Date());
errorLogNow('An error occurred');

// 4. 配置预设
const get = curry((key, obj) => obj[key]);
const getName = get('name');
const getAge = get('age');
getName({ name: 'Alice', age: 25 });  // 'Alice'
getAge({ name: 'Alice', age: 25 });   // 25
```

**偏函数（Partial Application）详解：**

偏函数固定函数的部分参数，返回一个接收剩余参数的新函数。

```js
// 偏函数实现
function partial(fn, ...boundArgs) {
  return (...args) => fn(...boundArgs, ...args);
}

// 固定右侧参数的版本
function partialRight(fn, ...boundArgs) {
  return (...args) => fn(...args, ...boundArgs);
}

// 使用示例
function greet(greeting, punctuation, name) {
  return `${greeting}, ${name}${punctuation}`;
}

// 固定 greeting 和 punctuation
const sayHello = partial(greet, 'Hello', '!');
sayHello('Alice');  // Hello, Alice!
sayHello('Bob');    // Hello, Bob!

// 固定 punctuation
const helloToAll = partial(greet, 'Hello', '!');
helloToAll('Everyone');  // Hello, Everyone!

// 使用 partialRight 固定右侧参数
// 固定 punctuation，先传 greeting 和 name
const helloWithName = (greeting, name) => greet(greeting, '!', name);
```

**偏函数的实际应用：**

```js
// 1. API 调用预设
function apiRequest(method, url, options = {}) {
  return fetch(url, { method, headers: { 'Content-Type': 'application/json' }, ...options });
}

const getAPI = partial(apiRequest, 'GET');
const postAPI = partial(apiRequest, 'POST');

// 预设 baseURL
const api = partial(apiRequest, 'GET', 'https://api.example.com');
api('/users');  // 自动带上方法和 baseURL

// 2. 事件处理函数预设
function sendAnalytics(category, action, label) {
  analytics.track({ category, action, label });
}

const trackClick = partial(sendAnalytics, 'click');
trackClick('submit', 'checkout-button');
trackClick('link', 'nav-home');

// 3. 验证函数预设
function validate(min, max, value) {
  return value >= min && value <= max;
}

const isValidAge = partial(validate, 0, 120);
isValidAge(25);  // true
isValidAge(150); // false

// 4. 模板渲染
function renderTemplate(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key]);
}

const renderUserProfile = partial(renderTemplate, '<h1>{{name}}</h1><p>{{email}}</p>');
renderUserProfile({ name: 'Alice', email: 'alice@example.com' });
```

**对比总结：**

1. **柯里化** 更适合函数组合和构建可复用的函数链
2. **偏函数** 更适合预设配置和减少重复参数
3. 两者可以结合使用，先用柯里化转换函数，再用偏函数预设参数

```js
// 柯里化 + 偏函数结合
const multiply = curry((a, b, c) => a * b * c);
const double = multiply(2);        // 柯里化：预设第一个参数
const doubleAndTriple = double(3); // 柯里化：预设第二个参数
doubleAndTriple(4);  // 24 (2 * 3 * 4)

// 使用偏函数预设
const multiplyBy6 = partial((a, b, c) => a * b * c, 2, 3);
multiplyBy6(4);  // 24
```

**知识点：** `柯里化` `偏函数` `函数式编程` `参数复用` `函数组合` `手写实现`

:::

---

### Q8: 函数式编程中的 point-free 风格是什么？有哪些优势？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Point-free 风格（无点风格）** 是一种函数式编程的编程风格，函数定义不显式提及所操作的参数（数据），而是通过函数组合来表达。

**Point-free vs 非 Point-free：**

```js
// 非 Point-free：显式提及参数 x
const doubleAndAdd1 = x => add1(double(x));

// Point-free 风格：不提及参数，只组合函数
const doubleAndAdd1 = compose(add1, double);
```

**核心思想：** 关注"做什么"（函数组合），而不是"怎么做"（参数传递）。

**Point-free 的优势：**

**1. 代码更简洁**
```js
// 非 Point-free
const getAdultNames = users => {
  return users
    .filter(user => user.age >= 18)
    .map(user => user.name);
};

// Point-free 风格
const getAdultNames = pipe(
  filter(u => u.age >= 18),
  map(u => u.name)
);
```

**2. 强调函数组合**
```js
// 非 Point-free：关注数据处理流程
const processData = data => {
  const step1 = validate(data);
  const step2 = transform(step1);
  return format(step2);
};

// Point-free 风格：关注函数组合
const processData = pipe(validate, transform, format);
```

**3. 便于复用**
```js
// 组合好后可复用
const validateAndTransform = pipe(validate, transform);

// 可以在多个地方使用
const processData1 = pipe(validateAndTransform, format);
const processData2 = pipe(validateAndTransform, export);
```

**4. 减少命名污染**
```js
// 非 Point-free 需要为中间结果命名
const process = data => {
  const filtered = data.filter(x => x.active);
  const mapped = filtered.map(x => x.value);
  const reduced = mapped.reduce((sum, v) => sum + v, 0);
  return reduced;
};

// Point-free 风格无需命名中间状态
const process = pipe(
  filter(x => x.active),
  map(x => x.value),
  reduce((sum, v) => sum + v, 0)
);
```

**实现 Point-free 的工具函数：**

```js
// 组合函数（从右到左）
const compose = (...fns) =>
  fns.reduce((f, g) => (...args) => f(g(...args)));

// 管道函数（从左到右，更易读）
const pipe = (...fns) =>
  fns.reduce((f, g) => (...args) => g(f(...args)));

// 常用函数集合
const map = fn => arr => arr.map(fn);
const filter = fn => arr => arr.filter(fn);
const reduce = (fn, init) => arr => arr.reduce(fn, init);
const prop = key => obj => obj[key];
const toUpperCase = str => str.toUpperCase();
const take = n => arr => arr.slice(0, n);
```

**实际应用示例：**

```js
// 场景 1：处理数据管道
const processUsers = pipe(
  filter(u => u.active),
  map(u => ({ name: u.name, email: u.email })),
  sort((a, b) => a.name.localeCompare(b.name)),
  take(10)
);

processUsers(users);  // 无需提及数据

// 场景 2：字符串处理
const cleanText = pipe(
  trim,
  toLowerCase,
  replace(/\s+/g, '-'),
  slugify
);

cleanText('  Hello World  ');  // 'hello-world'

// 场景 3：数据转换
const extractUserNames = pipe(
  map(prop('user')),
  map(prop('name')),
  filter(name => name != null)
);

// 场景 4：事件处理
const handleClick = pipe(
  preventDefault,
  validateForm,
  submitData,
  showSuccess
);
```

**Point-free 的局限性：**

```js
// 1. 调试困难：中间状态不明确
const complex = pipe(f, g, h, i, j);
// 出现问题时难以定位哪一步出错

// 解决方案：添加日志函数
const trace = label => x => { console.log(label, x); return x; };
const withDebug = pipe(f, trace('after f'), g, trace('after g'));

// 2. 过度抽象：可读性下降
const process = pipe(map(f), filter(g), compose(h, i));
// 需要理解函数组合才能明白做了什么

// 3. 性能考虑：多次函数调用开销
// 对性能敏感场景可能需要内联
```

**最佳实践：**

1. 适度使用，不要过度追求 Point-free
2. 保持代码可读性
3. 为复杂的组合函数添加注释
4. 调试时使用 trace 等工具

**知识点：** `Point-free` `函数组合` `函数式编程` `代码简洁` `pipe` `compose`

:::