---
title: ES6+ 新特性
description: let/const、解构赋值、模板字符串、箭头函数、Symbol、Map/Set、Proxy、迭代器生成器等核心面试题
---

# ES6+ 新特性

ES6（ES2015）是 JavaScript 历史上最重要的更新之一，引入了大量新特性和语法糖，极大地提升了开发体验。

---

## 📝 题目

### Q1: let、const、var 有什么区别？

> **⭐ 简单 · JavaScript**

```js
var a = 1;
let b = 2;
const c = 3;
```

请说明这三种声明方式的区别。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

| 特性 | var | let | const |
|------|-----|-----|-------|
| 作用域 | 函数级 | 块级 | 块级 |
| 变量提升 | 是 | 是（TDZ） | 是（TDZ） |
| 重复声明 | ✓ | ✗ | ✗ |
| 必须赋值 | ✗ | ✗ | ✓ |
| 可重新赋值 | ✓ | ✓ | ✗ |
| 暂时性死区 | ✗ | ✓ | ✓ |

**💡 解析：**
**var 的问题：**
```js
// 变量提升导致的问题
console.log(a);  // undefined
var a = 1;

// for 循环中的问题
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);  // 3, 3, 3
}
```

**let/const 优势：**
```js
// 块级作用域
if (true) {
  let a = 1;
  console.log(a);  // 1
}
console.log(a);  // ReferenceError

// 循环中正确工作
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);  // 0, 1, 2
}
```

**知识点：** `变量声明` `作用域` `块级作用域`

:::

---

### Q2: 什么是解构赋值？

> **⭐ 简单 · JavaScript**

```js
// 数组解构
const [a, b, ...rest] = [1, 2, 3, 4, 5];

// 对象解构
const { name, age, city = 'Unknown' } = { name: 'Alice', age: 25 };

// 嵌套解构
const { user: { name: userName } } = { user: { name: 'Bob' } };

console.log(a, b, rest);
console.log(name, age, city);
console.log(userName);
```

输出是什么？解构赋值有哪些用法？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
1 2 [3, 4, 5]
Alice 25 Unknown
Bob
```

**💡 解析：**
**数组解构：**
```js
// 基本用法
const [first, second] = [1, 2];

// 默认值
const [a = 1, b = 2] = [undefined];  // a=1, b=2

// 交换变量
let x = 1, y = 2;
[x, y] = [y, x];  // x=2, y=1
```

**对象解构：**
```js
// 变量重命名
const { name: n } = { name: 'Alice' };  // n = 'Alice'

// 默认值
const { active = true } = {};  // active = true

// 函数参数解构
function greet({ name, age = 0 }) {
  console.log(`${name}, ${age}`);
}
```

**知识点：** `解构赋值` `默认值` `变量交换`

:::

---

### Q3: 模板字符串有哪些特性？

> **⭐ 简单 · JavaScript**

```js
const name = 'Alice';
const age = 25;

// 基本用法
const greeting = `Hello, ${name}! You are ${age} years old.`;

// 多行字符串
const html = `
  <div>
    <p>${name}</p>
  </div>
`;

// 带标签的模板字符串
function tag(strings, ...values) {
  console.log(strings, values);
}
tag`Hello ${name}`;
```

模板字符串有哪些用法？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**特性：**
1. **字符串插值**：`${expression}`
2. **多行字符串**：保留换行
3. **表达式求值**：可以执行表达式
4. **标签模板**：自定义解析

**带标签的模板字符串应用：**
```js
// 1. 防 XSS
function safeHtml(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] ? escapeHtml(values[i]) : '';
    return result + str + value;
  }, '');
}

// 2. 国际化
function i18n(strings, ...values) {
  return strings.reduce((result, str, i) => {
    return result + str + (values[i] || '');
  }, '');
}

// 3. SQL 查询参数化
function sql(strings, ...values) {
  // 安全的 SQL 参数化
}
```

**知识点：** `模板字符串` `字符串插值` `标签模板`

:::

---

### Q4: 箭头函数与普通函数有什么区别？

> **🔥 中等 · JavaScript**

箭头函数与普通函数有哪些区别？箭头函数有哪些使用限制？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**区别：**
| 特性 | 普通函数 | 箭头函数 |
|------|---------|---------|
| this 绑定 | 动态 | 词法继承 |
| arguments | 有 | 无 |
| 可作构造函数 | ✓ | ✗ |
| yield 关键字 | ✓ | ✗ |
| prototype | 有 | 无 |

**💡 解析：**
**限制：**
```js
// 1. 不能用作构造函数
const Fn = () => {};
new Fn();  // TypeError

// 2. 没有 arguments
const fn = () => {
  console.log(arguments);  // ReferenceError
};

// 3. 不能用 yield
const gen = () => {
  yield 1;  // SyntaxError
};

// 4. 不能用作 Generator
```

**适用场景：**
```js
// ✓ 适合：回调函数中保持 this
array.map(x => x * 2);
setTimeout(() => console.log(this.value), 0);

// ✗ 不适合：需要动态 this
const obj = {
  name: 'test',
  // 错误
  method: () => console.log(this.name),
  // 正确
  method() { console.log(this.name); }
};
```

**知识点：** `箭头函数` `this 绑定` `函数对比`

:::

---

### Q5: Symbol 有什么特点和用途？

> **🔥 中等 · JavaScript**

```js
const sym1 = Symbol('id');
const sym2 = Symbol('id');
const sym3 = Symbol.for('id');
const sym4 = Symbol.for('id');

console.log(sym1 === sym2);
console.log(sym3 === sym4);
console.log(Symbol.keyFor(sym3));
```

输出是什么？Symbol 有哪些用途？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
false
true
'id'
```

**💡 解析：**
**Symbol 特点：**
1. 唯一性：每次创建的 Symbol 都不同
2. 全局注册：`Symbol.for()` 创建全局 Symbol
3. 非枚举：Object.keys 不会包含 Symbol 属性
4. 不能隐式转换

**用途：**
```js
// 1. 唯一属性名
const ID = Symbol('id');
const obj = { [ID]: 1 };

// 2. 私有属性（模拟）
const _secret = Symbol('secret');
class MyClass {
  [_secret] = 'private';
}

// 3. 内置 Symbol
const arr = [1, 2, 3];
arr[Symbol.iterator]();  // 迭代器

// 4. 类型检查
const TYPE = Symbol('type');
```

**知识点：** `Symbol` `唯一标识` `属性私有化`

:::

---

### Q6: Map 和 Set 与 Object 和 Array 有什么区别？

> **⭐ 简单 · JavaScript**

请说明 Map vs Object、Set vs Array 的区别。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**Map vs Object：**
| 特性 | Map | Object |
|------|-----|--------|
| 键类型 | 任意类型 | 字符串/Symbol |
| 大小获取 | size 属性 | 手动计算 |
| 可迭代 | ✓ | ✗（需 Object.keys） |
| 性能 | 频繁增删更好 | 简单查询好 |
| 原型 | 无原型污染 | 有原型链 |

**Set vs Array：**
| 特性 | Set | Array |
|------|-----|-------|
| 重复元素 | 不允许 | 允许 |
| 查找效率 | O(1) | O(n) |
| 遍历 | ✓ | ✓ |
| 索引访问 | ✗ | ✓ |

**示例：**
```js
// Map 示例
const map = new Map();
map.set({ key: 1 }, 'value');  // 对象作为键
map.size;  // 1

// Set 去重
const unique = [...new Set([1, 2, 2, 3])];  // [1, 2, 3]
```

**知识点：** `Map` `Set` `数据结构`

:::

---

### Q7: WeakMap 和 WeakSet 有什么特殊之处？

> **🔥 中等 · JavaScript**

WeakMap 和 WeakSet 与普通 Map/Set 有什么区别？有什么使用场景？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**特殊之处：**
1. **键必须是对象**（不能是原始值）
2. **弱引用**：不阻止垃圾回收
3. **不可遍历**：没有 forEach、keys 等方法
4. **没有 size 属性**

**使用场景：**
```js
// 1. 缓存（自动清理）
const cache = new WeakMap();
function processData(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = /* heavy computation */;
  cache.set(obj, result);
  return result;
}

// 2. 私有数据
const privateData = new WeakMap();
class MyClass {
  constructor() {
    privateData.set(this, { secret: 'value' });
  }
  getSecret() {
    return privateData.get(this).secret;
  }
}

// 3. DOM 节点数据
const nodeData = new WeakMap();
nodeData.set(domNode, { data: 'value' });
// 节点被移除后，WeakMap 中的引用自动清理
```

**知识点：** `WeakMap` `WeakSet` `弱引用`

:::

---

### Q8: Proxy 和 Reflect 是什么？

> **💀 困难 · JavaScript**

请说明 Proxy 的用途，并展示几个常见应用场景。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**Proxy 基础：**
```js
const handler = {
  get(target, prop, receiver) {
    console.log(`Getting ${prop}`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(`Setting ${prop} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  }
};

const proxy = new Proxy({}, handler);
proxy.name = 'Alice';  // Setting name = Alice
console.log(proxy.name);  // Getting name, Alice
```

**应用场景：**

**1. 实现响应式（Vue 3）：**
```js
function reactive(obj) {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      track(target, prop);
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver);
      trigger(target, prop);
      return result;
    }
  });
}
```

**2. 数据验证：**
```js
function createValidator(schema) {
  return new Proxy({}, {
    set(target, prop, value) {
      if (!schema[prop].test(value)) {
        throw new Error(`Invalid value for ${prop}`);
      }
      target[prop] = value;
      return true;
    }
  });
}
```

**3. API 请求封装：**
```js
const api = new Proxy({}, {
  get(target, prop) {
    return (data) => fetch(`/api/${prop}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
});

api.users({ name: 'Alice' });  // POST /api/users
```

**知识点：** `Proxy` `Reflect` `元编程`

:::

---

### Q9: 迭代器和生成器是什么？

> **🔥 中等 · JavaScript**

请解释迭代器和生成器的概念，并展示使用示例。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**迭代器协议：**
```js
const iterable = {
  [Symbol.iterator]() {
    let count = 0;
    return {
      next() {
        if (count < 3) {
          return { value: count++, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
};

for (const v of iterable) {
  console.log(v);  // 0, 1, 2
}
```

**生成器：**
```js
function* generatorFn() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = generatorFn();
console.log(gen.next());  // { value: 1, done: false }
console.log(gen.next());  // { value: 2, done: false }
console.log(gen.next());  // { value: 3, done: false }
console.log(gen.next());  // { value: undefined, done: true }
```

**生成器应用：**
```js
// 1. 无限序列
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// 2. 异步流程控制
function* fetchData() {
  const user = yield fetchUser();
  const posts = yield fetchPosts(user.id);
  return posts;
}

// 3. 惰性求值
function* range(start, end) {
  for (let i = start; i < end; i++) {
    yield i;
  }
}
```

**知识点：** `迭代器` `生成器` `yield`

:::

---

### Q10: for...of 和 for...in 有什么区别？

> **⭐ 简单 · JavaScript**

```js
const arr = ['a', 'b', 'c'];
arr.name = 'test';

for (let key in arr) {
  console.log('in:', key);
}

for (let value of arr) {
  console.log('of:', value);
}
```

输出是什么？有什么区别？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
in: 0
in: 1
in: 2
in: name
of: a
of: b
of: c
```

**💡 解析：**
**区别：**
| 特性 | for...in | for...of |
|------|---------|---------|
| 遍历对象 | ✓ | ✗（无 Symbol.iterable） |
| 遍历数组 | 索引 | 值 |
| 包含原型链 | ✓ | ✗ |
| 适合 Map/Set | ✗ | ✓ |

**使用建议：**
- **for...in**：遍历对象属性（建议配合 hasOwnProperty）
- **for...of**：遍历可迭代对象（数组、字符串、Map、Set）

**现代替代方案：**
```js
// 数组
arr.forEach((v, i) => {});
arr.map(v => v * 2);
arr.filter(v => v !== 'a');

// 对象
Object.entries(obj).forEach(([k, v]) => {});
Object.values(obj).forEach(v => {});
```

**知识点：** `for...of` `for...in` `可迭代对象`

:::

---

### Q11: 可选链和空值合并运算符是什么？

> **⭐ 简单 · JavaScript**

```js
const obj = { a: { b: null } };

// 可选链
console.log(obj?.a?.b?.c);

// 空值合并
const value = obj.a.b ?? 'default';

//  logical OR vs 空值合并
console.log(undefined || 'default');
console.log(null || 'default');
console.log(0 || 'default');
console.log(0 ?? 'default');
```

输出是什么？有什么区别？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
undefined
'25'
'default'
'default'
'default'
0
```

**💡 解析：**
**可选链 (?.)：**
```js
// 传统写法
const name = user && user.profile && user.profile.name;

// 可选链
const name = user?.profile?.name;

// 可选调用
obj.method?.();

// 可选访问数组
const first = arr?.[0];
```

**空值合并 (??)：**
- 只在左侧为 `null` 或 `undefined` 时返回右侧
- `||` 会在左侧为假值时返回右侧

```js
// 场景：默认值
const count = 0;
const result = count || 10;    // 10（错误，0 被当作假值）
const result = count ?? 10;    // 0（正确）
```

**知识点：** `可选链` `空值合并` `null vs undefined`

:::

---

### Q12: 常用的 ES6 数组方法有哪些？

> **🔥 中等 · JavaScript**

请列举并说明常用的 ES6 数组方法。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**变换方法：**
```js
// map - 映射
[1, 2, 3].map(x => x * 2);  // [2, 4, 6]

// filter - 过滤
[1, 2, 3].filter(x => x > 1);  // [2, 3]

// reduce - 归并
[1, 2, 3].reduce((acc, x) => acc + x, 0);  // 6

// flat - 扁平化
[[1, 2], [3, 4]].flat();  // [1, 2, 3, 4]

// flatMap - 映射 + 扁平化
[[1, 2], [3, 4]].flatMap(x => [x * 2]);  // [2, 4, 6, 8]
```

**查找方法：**
```js
// find - 查找第一个
arr.find(x => x > 2);

// findIndex - 查找索引
arr.findIndex(x => x > 2);

// includes - 包含检查
arr.includes(2);

// some - 部分满足
arr.some(x => x > 2);

// every - 全部满足
arr.every(x => x > 0);
```

**其他方法：**
```js
// sort - 排序
arr.sort((a, b) => a - b);

// splice - 增删改
arr.splice(1, 1, 'new');

// slice - 截取
arr.slice(0, 2);

// from - 从类数组创建
Array.from('hello');  // ['h','e','l','l','o']

// of - 创建数组
Array.of(1, 2, 3);  // [1, 2, 3]
```

**知识点：** `数组方法` `函数式编程` `链式调用`

:::

---

## 🔑 核心知识点总结

### 1. 变量声明

```js
var a = 1;       // 函数作用域，可提升
let b = 2;       // 块级作用域，TDZ
const c = 3;     // 块级作用域，只读
```

### 2. 数据结构

| 结构 | 用途 |
|------|------|
| Map | 任意类型键的字典 |
| Set | 唯一值集合 |
| WeakMap | 弱引用对象关联 |
| WeakSet | 弱引用对象集合 |

### 3. 新语法

- 模板字符串：`${expr}` + 多行
- 解构赋值：提取数据
- 可选链：`?.` 安全访问
- 空值合并：`??` 默认值

### 4. 函数增强

- 箭头函数：词法 this
- 默认参数：`fn(a = 1)`
- 剩余参数：`fn(...args)`
- 生成器：`function*` + `yield`

## 💡 面试技巧

1. **箭头函数**：记住 4 个不能（构造、arguments、yield、prototype）
2. **Map/Set**：知道与 Object/Array 的区别
3. **Proxy**：了解响应式原理
4. **迭代器**：理解 for...of 背后的协议
5. **可选链**：知道 ?? 和 || 的区别
### Q13: Generator 函数和 async 函数有什么区别？

> **🔥 中等 · ES6+**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 维度 | Generator | async/await |
|------|-----------|-------------|
| 声明 | `function*` | `async function` |
| 执行 | 返回迭代器，需手动 `.next()` | 自动执行，返回 Promise |
| 暂停 | `yield` 暂停，`next()` 恢复 | `await` 暂停，Promise resolve 恢复 |
| 语义 | 生成器/协程 | 异步流程控制 |
| 错误处理 | `.throw()` 手动抛出 | try/catch 自动捕获 |

```js
// Generator — 需要手动驱动
function* gen() {
  const a = yield fetch('/api/1')
  const b = yield fetch('/api/2')
  return [a, b]
}

const it = gen()
it.next()           // 启动
it.next(data1)      // 手动传入上一次 yield 的返回值

// async/await — 自动执行
async function fetchData() {
  const a = await fetch('/api/1')  // 自动暂停，resolve 后自动恢复
  const b = await fetch('/api/2')
  return [a, b]
}

fetchData().then(console.log)  // 调用即执行
```

**async/await 本质是 Generator +自动执行器的语法糖：**

```js
// co 库自动执行 Generator
const co = require('co')
co(function* () {
  const a = yield fetch('/api/1')
  const b = yield fetch('/api/2')
  return [a, b]
})
// 等价于 async/await
```

**知识点：** `Generator` `async/await` `yield` `迭代器` `自动执行器`

:::

### Q14: Symbol、Map、Decorator 的使用场景有哪些？

> **💀 困难 · ES6+**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Symbol — 唯一标识符：**

```js
// 1. 防止属性名冲突
const id = Symbol('id')
const obj = { [id]: 123, name: 'test' }
// 即使有其他 Symbol('id') 也不会冲突

// 2. 内置 Symbol — 自定义对象行为
const collection = {
  data: [1, 2, 3],
  [Symbol.iterator]() {
    let i = 0
    return {
      next: () => ({ value: this.data[i++], done: i > this.data.length })
    }
  }
}
;[...collection] // [1, 2, 3]

// 3. Symbol.toPrimitive — 自定义类型转换
const price = {
  amount: 100,
  [Symbol.toPrimitive](hint) {
    return hint === 'string' ? `¥${this.amount}` : this.amount
  }
}
console.log(+price)       // 100
console.log(`${price}`)   // '¥100'

// 4. 私有属性（模拟）
const _private = Symbol('private')
class Wallet {
  constructor(balance) { this[_private] = balance }
  get balance() { return this[_private] }
}
```

**Map — 任意类型的键值对：**

```js
// 1. 对象作为键（Object 做不到）
const userMap = new Map()
const user1 = { name: 'Alice' }
const user2 = { name: 'Bob' }
userMap.set(user1, { role: 'admin' })
userMap.set(user2, { role: 'guest' })

// 2. 缓存计算结果
const cache = new Map()
function expensiveCompute(key) {
  if (cache.has(key)) return cache.get(key)
  const result = /* ... */ key
  cache.set(key, result)
  return result
}

// 3. DOM 节点关联数据
const nodeData = new Map()
nodeData.set(document.getElementById('app'), { clicked: 0 })

// 4. 频率统计比 Object 更安全
const freq = new Map()
for (const item of arr) {
  freq.set(item, (freq.get(item) || 0) + 1)
}
```

**Decorator（装饰器）— 类/方法的增强：**

```js
// 类装饰器
function loggable(Class) {
  return class extends Class {
    log(...args) { console.log(`[${this.constructor.name}]`, ...args) }
  }
}

@loggable
class UserService {
  fetch() { this.log('fetching...') }
}

// 方法装饰器（Stage 3）
function debounce(ms) {
  return function(fn, context) {
    let timer
    return function(...args) {
      clearTimeout(timer)
      timer = setTimeout(() => fn.apply(this, args), ms)
    }
  }
}

class Search {
  @debounce(300)
  handleInput(e) { /* ... */ }
}
```

**知识点：** `Symbol` `Map` `Decorator` `唯一标识` `迭代协议` `装饰器模式`

:::

---

### Q15: for...in 和 for...of 有什么区别？

> **🔥 中等 · ES6**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**for...in 和 for...of 的核心区别：**

| 特性 | for...in | for...of |
|------|---------|----------|
| 遍历对象 | ✅ 可枚举属性 | ❌ 需要 Symbol.iterator |
| 遍历数组 | 索引 | 值 |
| 包含原型链 | ✅ | ❌ |
| 适合 Map/Set | ❌ | ✅ |

```js
const arr = ['a', 'b', 'c']
arr.name = 'test'

// for...in — 遍历可枚举属性（包括原型链）
for (const key in arr) {
  console.log(key)  // '0', '1', '2', 'name'
}

// for...of — 遍历可迭代对象的值
for (const value of arr) {
  console.log(value)  // 'a', 'b', 'c'（不会打印 name）
}

// 遍历对象
const obj = { a: 1, b: 2 }
for (const key in obj) console.log(key)  // 'a', 'b' ✅
// for (const value of obj) console.log(value)  // ❌ TypeError

// 遍历 Map
const map = new Map([['a', 1], ['b', 2]])
for (const [key, value] of map) console.log(key, value)  // ✅
for (const key in map) console.log(key)  // ❌ 空

// 遍历 Set
const set = new Set([1, 2, 3])
for (const value of set) console.log(value)  // ✅
for (const value in set) console.log(value)  // ❌ 空
```

**可枚举 vs 可迭代：**
- **可枚举（Enumerable）**：对象属性是否出现在 for...in 中
- **可迭代（Iterable）**：对象是否有 Symbol.iterator 方法

```js
// 数组是可迭代的
[].hasInstance // ❌
[] [Symbol.iterator] // ✅ 存在

// 普通对象是可枚举的，但不可迭代
const obj = { a: 1 }
Object.keys(obj) // ['a'] ✅
obj[Symbol.iterator] // undefined ❌
```

**知识点：** `for...in` `for...of` `可枚举` `可迭代` `Symbol.iterator` `遍历`

:::

### Q16: 类数组和数组的区别？如何转换？

> **🔥 中等 · ES6**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**类数组（Array-like）** 有 length 属性和索引，但没有数组方法。

| 类数组对象 | 说明 |
|-----------|------|
| arguments | 函数参数对象 |
| NodeList | DOM 查询结果 |
| HTMLCollection | DOM 元素集合 |
| String | 字符串有 length 和索引 |

```js
// arguments 是类数组
function fn() {
  console.log(arguments.length)  // 3
  console.log(arguments[0])  // 1
  // arguments.slice()  // ❌ TypeError
}
fn(1, 2, 3)

// NodeList 是类数组
const nodes = document.querySelectorAll('li')
console.log(nodes.length)  // 5
console.log(nodes[0])  // <li>元素
// nodes.map(...)  // ❌ TypeError
```

**类数组 → 数组的转换方法：**

```js
// 方法 1：Array.from（ES6 推荐）
const arr1 = Array.from(arguments)
const arr2 = Array.from(document.querySelectorAll('li'))

// 方法 2：扩展运算符（ES6）
const arr3 = [...arguments]
const arr4 = [...document.querySelectorAll('li')]

// 方法 3：[].slice.call（传统方式）
const arr5 = [].slice.call(arguments)
const arr6 = Array.prototype.slice.call(arguments)
```

**Array.from 的高级用法：**

```js
// 带映射函数
Array.from([1, 2, 3], x => x * 2)  // [2, 4, 6]

// 快速生成数组
Array.from({ length: 5 }, (_, i) => i)  // [0, 1, 2, 3, 4]

// 转换 Map 为数组
Array.from(new Map([['a', 1]]))  // [['a', 1]]

// 转换 Set 为数组
Array.from(new Set([1, 2, 2, 3]))  // [1, 2, 3]

// 转换字符串
Array.from('hello')  // ['h', 'e', 'l', 'l', 'o']
```

**知识点：** `类数组` `arguments` `NodeList` `Array.from` `扩展运算符` `Array.prototype.slice`

:::

---

### Q17: Proxy 和 Reflect 是什么？有哪些应用场景？

> **💀 困难 · JavaScript**

请解释 Proxy 和 Reflect 的用途及应用场景。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Proxy（代理）** 可以拦截并自定义对象的基本操作（如属性访问、赋值、函数调用等）。

**基本用法：**
```js
const handler = {
  get(target, prop, receiver) {
    console.log(`访问 ${prop}`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(`设置 ${prop} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  }
};

const proxy = new Proxy({ name: 'Alice' }, handler);
proxy.name;  // 访问 name
proxy.age = 25;  // 设置 age = 25
```

**Reflect** 提供了一套与 Proxy 配合使用的方法，用于操作对象。

**应用场景：**

**1. 数据验证：**
```js
const validator = {
  set(target, prop, value) {
    if (prop === 'age' && typeof value !== 'number') {
      throw new TypeError('age 必须是数字');
    }
    if (prop === 'email' && !value.includes('@')) {
      throw new TypeError('email 格式错误');
    }
    target[prop] = value;
    return true;
  }
};

const user = new Proxy({}, validator);
user.age = 25;
user.email = 'test@example.com';
```

**2. 自动日志/埋点：**
```js
function createTracked(obj, name) {
  return new Proxy(obj, {
    get(target, prop) {
      const value = target[prop];
      console.log(`[${name}] 访问 ${prop}`);
      trackAnalytics(name, prop);
      return value;
    }
  });
}
```

**3. 实现响应式（Vue 3 原理）：**
```js
function reactive(obj) {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      track(target, prop);  // 收集依赖
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver);
      trigger(target, prop);  // 触发更新
      return result;
    }
  });
}
```

**4. API 请求封装：**
```js
const api = new Proxy({}, {
  get(target, endpoint) {
    return (data) => fetch(`/api/${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
});

api.users({ name: 'Alice' });  // POST /api/users
```

**常用拦截器：**
- `get/set`: 属性访问/设置
- `has`: `in` 操作符
- `deleteProperty`: `delete` 操作符
- `apply`: 函数调用
- `construct`: `new` 调用

**知识点：** `Proxy` `Reflect` `元编程` `拦截器` `响应式`

:::

---

### Q18: Map 和 WeakMap 的区别？WeakMap 的用途？

> **🔥 中等 · JavaScript**

请说明 Map 和 WeakMap 的区别及使用场景。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心区别：**

| 特性 | Map | WeakMap |
|------|-----|---------|
| **键类型** | 任意类型 | 仅对象（不能是原始值） |
| **引用强度** | 强引用 | 弱引用（可被 GC） |
| **可迭代** | ✅ 可遍历 | ❌ 不可遍历 |
| **size 属性** | ✅ | ❌ |
| **clear()** | ✅ | ❌ |
| **内存泄漏风险** | 需注意 | 自动回收，低风险 |

**Map 使用场景：**
```js
// 1. 任意类型键
const map = new Map();
map.set('key', 'value');
map.set(123, 'number key');
map.set({}, 'object key');

// 2. 缓存
const cache = new Map();
function memoize(fn) {
  return function(key) {
    if (cache.has(key)) return cache.get(key);
    const result = fn(key);
    cache.set(key, result);
    return result;
  };
}

// 3. 频繁增删
map.set(k, v).delete(k).clear();
```

**WeakMap 使用场景：**
```js
// 1. DOM 节点关联数据（自动清理）
const elementData = new WeakMap();
function setElementData(el, data) {
  elementData.set(el, data);
}
// 当 el 从 DOM 移除后，关联数据可被 GC

// 2. 私有属性模拟
const privates = new WeakMap();
class MyClass {
  constructor() {
    privates.set(this, { secret: 'value' });
  }
  getSecret() {
    return privates.get(this).secret;
  }
}

// 3. 缓存计算结果（不阻止 GC）
const cache = new WeakMap();
function expensive(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = compute(obj);
  cache.set(obj, result);
  return result;
}
```

**为什么 WeakMap 不可遍历？**
- 因为键可能被随时回收，size 和遍历结果不稳定
- 这是设计决策，确保内存自动管理

**知识点：** `Map` `WeakMap` `弱引用` `垃圾回收` `DOM 关联`

:::

---

### Q19: Set 和 WeakSet 的区别？什么场景用 Set？

> **⭐ 简单 · JavaScript**

请说明 Set 和 WeakSet 的区别。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Set 特点：**
- 存储唯一值（不重复）
- 可存储任意类型
- 可遍历，有 size 属性
- 操作方法：add/delete/has/clear

**WeakSet 特点：**
- 只能存储对象
- 弱引用（对象可被 GC）
- 不可遍历，无 size 属性
- 只能 add/delete/has

**Set 使用场景：**

**1. 数组去重：**
```js
const unique = [...new Set([1, 2, 2, 3])];  // [1, 2, 3]
```

**2. 成员检查（O(1) vs O(n)）：**
```js
const allowed = new Set(['admin', 'user']);
if (allowed.has(role)) { /* ... */ }
```

**3. 交集/并集/差集：**
```js
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);

// 交集
const intersection = new Set([...a].filter(x => b.has(x)));

// 并集
const union = new Set([...a, ...b]);

// 差集
const difference = new Set([...a].filter(x => !b.has(x)));
```

**4. 跟踪已处理对象：**
```js
const visited = new Set();
function dfs(node) {
  if (visited.has(node)) return;
  visited.add(node);
  // 处理节点
}
```

**WeakSet 使用场景：**
```js
// 1. 标记对象（不阻止回收）
const processed = new WeakSet();
function process(obj) {
  if (processed.has(obj)) return;
  processed.add(obj);
  // 处理对象
}

// 2. 事件绑定标记
const boundElements = new WeakSet();
function addHandler(el) {
  if (boundElements.has(el)) return;
  boundElements.add(el);
  el.addEventListener('click', handler);
}
```

**知识点：** `Set` `WeakSet` `唯一值` `弱引用` `集合运算`

:::

---

### Q20: Generator 函数是什么？如何与 Iterator 配合？

> **🔥 中等 · JavaScript**

请解释 Generator 和 Iterator 的关系。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Iterator（迭代器协议）：**
对象实现 Iterator 协议需要：
1. 有 `Symbol.iterator` 方法
2. 返回一个有 `next()` 方法的对象
3. `next()` 返回 `{ value, done }`

```js
const iterable = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        return { value: i++, done: i > 3 };
      }
    };
  }
};

[...iterable];  // [0, 1, 2]
```

**Generator（生成器）：**
Generator 是特殊的 Iterator，使用 `function*` 和 `yield`。

```js
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

const iter = gen();
iter.next();  // { value: 1, done: false }
iter.next();  // { value: 2, done: false }
iter.next();  // { value: 3, done: false }
iter.next();  // { value: undefined, done: true }
```

**Generator 实现 Iterator：**
```js
// Generator 自动实现迭代器协议
function* range(start, end) {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

[...range(0, 3)];  // [0, 1, 2]
```

**使用场景：**

**1. 惰性求值：**
```js
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}
const fib = fibonacci();
fib.next().value;  // 0
fib.next().value;  // 1
fib.next().value;  // 1
```

**2. 异步流程控制（co 库）：**
```js
function* fetchData() {
  const user = yield fetchUser();
  const posts = yield fetchPosts(user.id);
  return posts;
}
```

**3. 自定义迭代行为：**
```js
const tree = {
  value: 1,
  children: [
    { value: 2, children: [] },
    { value: 3, children: [] }
  ]
};

function* traverse(node) {
  yield node.value;
  for (const child of node.children) {
    yield* traverse(child);
  }
}

[...traverse(tree)];  // [1, 2, 3]
```

**知识点：** `Generator` `Iterator` `yield` `惰性求值` `遍历`

:::

---

### Q21: 解构赋值有哪些高级用法？

> **🔥 中等 · JavaScript**

请说明解构赋值的各种高级用法。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**嵌套解构：**
```js
// 对象嵌套
const { user: { name: userName, age } } = data;

// 数组嵌套
const [first, [second, third]] = [1, [2, 3]];

// 混合嵌套
const { users: [firstUser] } = response;
```

**默认值：**
```js
// 基本默认值
const { name = 'Anonymous', age = 0 } = user;

// 函数参数默认值
function greet({ name = 'Guest' } = {}) {
  return `Hello, ${name}`;
}

// 数组默认值
const [a = 1, b = 2] = [undefined];  // a=1, b=2
```

**变量重命名：**
```js
// 对象属性重命名
const { name: userName, age: userAge } = user;

// 嵌套重命名
const { user: { name: userName } } = data;
```

**剩余参数：**
```js
// 数组剩余
const [first, ...rest] = [1, 2, 3, 4];  // first=1, rest=[2,3,4]

// 对象剩余
const { name, ...rest } = { name: 'A', age: 25, city: 'BJ' };
// name='A', rest={age: 25, city: 'BJ'}
```

**函数参数解构：**
```js
// 对象参数
function process({ url, method = 'GET', headers = {} }) {
  // ...
}

// 数组参数
function sum([a, b, ...rest]) {
  return [a, b, ...rest].reduce((s, n) => s + n, 0);
}

// 默认值 + 解构
function createPoint({ x = 0, y = 0 } = {}) {
  return { x, y };
}
```

**交换变量：**
```js
let a = 1, b = 2;
[a, b] = [b, a];  // a=2, b=1
```

**返回值解构：**
```js
// 函数返回多个值
function getUser() {
  return { name: 'Alice', age: 25 };
}
const { name, age } = getUser();

// JSON.parse 返回对象
const { data } = JSON.parse(responseText);
```

**知识点：** `解构赋值` `嵌套解构` `默认值` `重命名` `剩余参数`

:::
