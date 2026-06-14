---
title: 类型转换
description: JavaScript 隐式转换、== vs ===、类型判断、ToPrimitive、Symbol/BigInt 等核心面试题
---

# 类型转换

类型转换是 JavaScript 中最基础也是最重要的概念之一。理解隐式转换和显式转换的规则，能帮你避免很多陷阱。

---

## 📝 题目

### Q1: 以下代码的输出结果是什么？

> **⭐ 简单 · JavaScript**

```js
console.log('1' + 1);
console.log('1' - 1);
console.log('1' * 2);
console.log('1' / 2);
console.log('1' % 2);
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
'11'    // 字符串拼接
0       // 1 - 1
2       // 1 * 2
0.5     // 1 / 2
1       // 1 % 2
```

**💡 解析：**
除了加法运算符 `+` 在遇到字符串时会进行字符串拼接外，其他算术运算符（`-`、`*`、`/`、`%`）都会先将操作数转换为数字再进行计算。这就是为什么 `'1' - 1` 会将字符串 `'1'` 转换为数字 `1` 后再计算。

**知识点：** `加法特殊规则` `算术运算符转换` `隐式转换`

:::

---

### Q2: 以下表达式的结果分别是什么？

> **🔥 中等 · JavaScript**

```js
console.log([] + []);
console.log([] + {});
console.log({} + []);
console.log({} + {});
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
''                    // 两个空数组都转为空字符串
'[object Object]'     // 数组转为空字符串，对象转为字符串
'[object Object]'     // 在浏览器环境中
'[object Object][object Object]'
```

**💡 解析：**
对象转换为字符串时，先调用 `valueOf()`，如果返回原始值则使用该值，否则调用 `toString()`。

- `[] + []`: 两个空数组都调用 `toString()` 返回空字符串，拼接结果为 `''`
- `[] + {}`: 数组 `toString()` 返回`空字符串，对象返回 `'[object Object]'`
- `{} + []`: 在浏览器中，开头的 `{}` 可能被解析为空代码块，实际执行 `+[]` 结果为 `0`；但在某些环境中会转为字符串
- `{} + {}`: 两个对象都转为 `'[object Object]'` 后拼接

**知识点：** `对象转字符串` `valueOf` `toString` `代码块歧义`

:::

---

### Q3: 解释以下经典面试题的结果

> **💀 困难 · JavaScript**

```js
console.log([] == ![]);
console.log([] == false);
console.log([0] == false);
console.log('0' == false);
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
true    // [] == ![]
true    // [] == false
true    // [0] == false
true    // '0' == false
```

**💡 解析：**
**[] == ![]** 的推导过程：
1. `![]` 结果为 `false`
2. `[] == false`，两边类型不同，进行隐式转换
3. `[]` 转为数字：`[] → '' → 0`
4. `false` 转为数字：`false → 0`
5. `0 == 0` 结果为 `true`

**[] == false** 同理，空数组转为 0，false 转为 0。
**[0] == false**：`[0] → '0' → 0`，`false → 0`，结果 `true`。
**'0' == false**：`'0' → 0`，`false → 0`，结果 `true`。

**知识点：** `== 运算符转换` `数组转数字` `布尔值转换`

:::

---

### Q4: == 和 === 有什么区别？Object.is 与 === 又有什么不同？

> **🔥 中等 · JavaScript**

```js
console.log(0 == false);
console.log(0 === false);
console.log(-0 === +0);
console.log(Object.is(-0, +0));
console.log(NaN === NaN);
console.log(Object.is(NaN, NaN));
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
true    // == 进行类型转换
false   // === 类型不同直接 false
true    // === 认为 -0 和 +0 相等
false   // Object.is 认为 -0 和 +0 不相等
false   // === 认为 NaN 不等于自身
true    // Object.is 认为 NaN 等于自身
```

**💡 解析：**
**== (松散相等)**: 如果类型不同，会进行隐式类型转换后再比较。
**=== (严格相等)**: 不进行类型转换，类型不同直接返回 `false`。
**Object.is()**: 与 `===` 几乎相同，但有两个例外：
- `Object.is(-0, +0)` 返回 `false`，而 `-0 === +0` 返回 `true`
- `Object.is(NaN, NaN)` 返回 `true`，而 `NaN === NaN` 返回 `false`

**知识点：** `== vs ===` `Object.is` `NaN 特性` `-0 与 +0`

:::

---

### Q5: 哪些值在 JavaScript 中是假值（falsy）？

> **⭐ 简单 · JavaScript**

```js
const values = [false, 0, -0, 0n, '', null, undefined, NaN, [], {}, '0', function(){}];
values.forEach(v => {
  console.log(v, '→', Boolean(v));
});
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
false       → false
0           → false
-0          → false
0n          → false
''          → false
null        → false
undefined   → false
NaN         → false
[]          → true   (空数组是真值)
{}          → true   (空对象是真值)
'0'         → true   (非空字符串是真值)
function(){} → true
```

**💡 解析：**
JavaScript 中只有 **7 个假值**：
1. `false`
2. `0` (包括 `-0`)
3. `0n` (BigInt 零)
4. `''` (空字符串)
5. `null`
6. `undefined`
7. `NaN`

注意：空数组 `[]`、空对象 `{}`、字符串 `'0'` 都是**真值**！

**知识点：** `假值列表` `空对象是真值` `Boolean 转换`

:::

---

### Q6: Symbol 类型在类型转换中有什么特殊行为？

> **💀 困难 · JavaScript**

```js
const sym = Symbol('test');
console.log(sym + '');
console.log(String(sym));
console.log(Number(sym));
console.log(Boolean(sym));
console.log(sym == true);
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
TypeError: Cannot convert a Symbol value to a string
'Symbol(test)'  // String() 可以转换
TypeError: Cannot convert a Symbol value to a number
true            // Symbol 是真值
TypeError: Cannot convert a Symbol value to a boolean
```

**💡 解析：**
Symbol 是 ES6 引入的原始类型，在类型转换中有特殊规则：
- **不能隐式转换为字符串**: `sym + ''` 会抛出 TypeError
- **可以显式转换为字符串**: `String(sym)` 返回 `'Symbol(test)'`
- **不能转换为数字**: `Number(sym)` 抛出 TypeError
- **不能与布尔值比较**: `sym == true` 抛出 TypeError
- **作为布尔值时**: Symbol 总是真值，`Boolean(sym)` 返回 `true`

**知识点：** `Symbol 转换限制` `显式 vs 隐式转换` `Symbol 布尔值`

:::

---

### Q7: 解释 null 和 undefined 在比较运算中的行为

> **🔥 中等 · JavaScript**

```js
console.log(null == undefined);
console.log(null === undefined);
console.log(null > 0);
console.log(null < 0);
console.log(null >= 0);
console.log(undefined == 0);
console.log(undefined > 0);
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
true    // null 和 undefined 松散相等
false   // 严格相等需要类型相同
false   // null 转换为 0，0 > 0 为 false
false   // 0 < 0 为 false
true    // 0 >= 0 为 true
false   // undefined 与数字比较转为 NaN
false   // NaN 与任何比较都返回 false
```

**💡 解析：**
**null 和 undefined 的特殊规则：**
- `null == undefined` 总是返回 `true`（特殊规则）
- `null === undefined` 返回 `false`（类型不同）
- 关系运算符（`>`、`<`、`>=`）会将 `null` 转换为 `0`
- `undefined` 与数字比较时转换为 `NaN`
- `NaN` 与任何值比较（包括自身）都返回 `false`

**知识点：** `null 与 undefined` `关系运算符转换` `NaN 比较特性`

:::

---

### Q8: 如何自定义对象的类型转换行为？

> **💀 困难 · JavaScript**

```js
const obj = {
  value: 10,
  [Symbol.toPrimitive](hint) {
    console.log('hint:', hint);
    if (hint === 'string') return 'obj:' + this.value;
    if (hint === 'number') return this.value * 2;
    return this.value;
  }
};
console.log(obj + 1);
console.log(String(obj));
console.log(Number(obj));
console.log(`${obj}`);
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
hint: default
11
hint: string
'obj:10'
hint: number
20
hint: string
'obj:10'
```

**💡 解析：**
ES6 引入了 `Symbol.toPrimitive` 方法，允许自定义对象的原始值转换行为。该方法接收一个 `hint` 参数：
- `'string'`: 需要字符串原始值（如 `String()`、模板字符串）
- `'number'`: 需要数字原始值（如 `Number()`、一元 `+`）
- `'default'`: 没有明确偏好（如 `==`、`+` 运算符）

`Symbol.toPrimitive` 的优先级高于 `valueOf()` 和 `toString()`，如果定义了该方法，JS 会优先调用它。

**知识点：** `Symbol.toPrimitive` `自定义类型转换` `hint 参数`

:::

---

### Q9: 一元运算符 + 和 - 如何影响类型转换？

> **🔥 中等 · JavaScript**

```js
console.log(+'123');
console.log(+'abc');
console.log(-'123');
console.log(+true);
console.log(+false);
console.log(+null);
console.log(+undefined);
console.log(+[]);
console.log(+{});
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
123       // 字符串转数字
NaN       // 无法转换
-123      // 字符串转数字后取负
1         // true 转 1
0         // false 转 0
0         // null 转 0
NaN       // undefined 转 NaN
0         // 空数组转空字符串再转 0
NaN       // 对象转 '[object Object]' 无法转数字
```

**💡 解析：**
一元 `+` 和 `-` 运算符会将操作数转换为数字（调用 `ToNumber` 抽象操作）：
- 字符串：解析为数字，失败则 `NaN`
- 布尔值：`true → 1`，`false → 0`
- `null → 0`
- `undefined → NaN`
- 数组：先 `toString()`，再转数字
- 对象：先 `toPrimitive('number')`，再转数字

**知识点：** `一元运算符` `ToNumber 规则` `隐式转换`

:::

---

### Q10: 解释 0.1 + 0.2 !== 0.3 的原因

> **⭐ 简单 · JavaScript**

```js
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
console.log(Number.EPSILON);
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
0.30000000000000004  // 不是精确的 0.3
false                // 因为精度问题
2.220446049250313e-16
true                 // 正确的比较方式
```

**💡 解析：**
JavaScript 使用 IEEE 754 双精度浮点数表示所有数字。0.1 和 0.2 在二进制中是无限循环小数，无法精确表示，导致计算结果有微小误差。

**解决方案：**
1. 使用 `Number.EPSILON` 比较浮点数
2. 使用整数运算（如将金额转换为分）
3. 使用专门库如 `decimal.js` 或 `big.js`

**知识点：** `浮点数精度` `IEEE 754` `Number.EPSILON`

:::

---

### Q11: 如何正确判断 JavaScript 中的类型？

> **🔥 中等 · JavaScript**

请列举并解释 4 种类型判断方法及其适用场景。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**1. typeof 操作符：**
```js
typeof 123          // 'number'
typeof 'hello'      // 'string'
typeof true         // 'boolean'
typeof undefined    // 'undefined'
typeof Symbol()     // 'symbol'
typeof 1n           // 'bigint'
typeof function(){} // 'function'
typeof {}           // 'object'
typeof []           // 'object' ← 无法区分数组和对象
typeof null         // 'object' ← 历史遗留 bug
```

**2. instanceof 操作符：**
```js
[] instanceof Array    // true
{} instanceof Object   // true
// 缺点：无法判断原始类型，跨 iframe 失效
```

**3. Object.prototype.toString.call()：**
```js
Object.prototype.toString.call([])     // '[object Array]'
Object.prototype.toString.call(null)   // '[object Null]'
Object.prototype.toString.call({})     // '[object Object]'
// 最准确的类型判断方法
```

**4. Array.isArray()（专用于数组）：**
```js
Array.isArray([])  // true
Array.isArray({})  // false
```

**知识点：** `typeof` `instanceof` `toString` `类型判断`

:::

---

### Q12: 解释包装类型和自动装箱/拆箱

> **🔥 中等 · JavaScript**

```js
const str = 'hello';
console.log(str.length);        // 5
console.log(str.toUpperCase()); // 'HELLO'

const num = 42;
console.log(num.toString());    // '42'

const bool = true;
console.log(bool.toString());   // 'true'
```

为什么原始类型可以调用方法？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
JavaScript 有 3 种包装类型：`String`、`Number`、`Boolean`。当对原始类型调用方法时，JS 会自动将其包装为对应的对象类型，这个过程叫**自动装箱**。方法调用完成后，包装对象立即被销毁（**自动拆箱**）。

**流程：**
```js
str.length
// 1. 创建临时包装对象：new String(str)
// 2. 访问 length 属性
// 3. 销毁临时对象
```

**注意事项：**
```js
const s1 = 'hello';
const s2 = new String('hello');
console.log(s1 == s2);  // true（值相等）
console.log(s1 === s2); // false（类型不同）
```

**知识点：** `包装类型` `自动装箱` `自动拆箱` `原始类型 vs 对象`

:::

---

### Q13: 数组的本质是什么，运用了什么样的设计模式？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**数组的本质**：

在 JavaScript 中，**数组本质是特殊的对象**。

```js
const arr = [1, 2, 3];

// 数组是对象
console.log(typeof arr);           // 'object'
console.log(arr instanceof Array); // true
console.log(arr instanceof Object); // true

// 数字索引实际是字符串键
console.log(arr[0]);         // 1
console.log(arr['0']);       // 1（等价）
console.log(arr.hasOwnProperty(0));      // true
console.log(arr.hasOwnProperty('0'));    // true
```

**设计模式：迭代器模式**

数组实现了迭代器模式，可以通过迭代器访问元素：

```js
const arr = [1, 2, 3];

// 获取迭代器
const iterator = arr[Symbol.iterator]();

console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: 3, done: false }
console.log(iterator.next()); // { value: undefined, done: true }

// for...of 底层使用迭代器
for (const item of arr) {
  console.log(item);
}
```

**数组的特殊性：**

1. **length 属性自动更新**
```js
const arr = [1, 2, 3];
arr[5] = 6;
console.log(arr.length); // 6（自动更新）
console.log(arr);        // [1, 2, 3, empty × 2, 6]
```

2. **继承自 Array.prototype**
```js
// 拥有丰富的数组方法
arr.map(x => x * 2);
arr.filter(x => x > 1);
arr.reduce((a, b) => a + b, 0);
```

**知识点：** `数组本质` `对象` `迭代器模式` `Symbol.iterator`

:::

---

### Q14: 类数组和数组的区别是什么？如何转换？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**类数组**（Array-like Object）：具有 length 属性但没有数组方法的对象。

**常见类数组**：
```js
// 1. arguments
function fn() {
  console.log(arguments); // { '0': 1, '1': 2, '2': 3, length: 3 }
}
fn(1, 2, 3);

// 2. NodeList
document.querySelectorAll('div'); // NodeList[div, div, div]

// 3. HTMLCollection
document.body.children; // HTMLCollection[...]

// 4. 字符串
'hello'; // 有 length 和索引，但不是数组
```

**类数组 vs 数组**：

| 特性 | 数组 | 类数组 |
|------|------|--------|
| length 属性 | ✅ | ✅ |
| 数字索引 | ✅ | ✅ |
| Array 方法 | ✅ | ❌ |
| instanceof Array | ✅ | ❌ |
| 可迭代 | ✅ | 部分可迭代 |

**转换方法**：

**1. Array.from**（推荐）
```js
const arrayLike = { 0: 'a', 1: 'b', length: 2 };
const arr = Array.from(arrayLike);
console.log(arr); // ['a', 'b']

// 带映射函数
const nums = Array.from({ length: 3 }, (_, i) => i * 2);
console.log(nums); // [0, 2, 4]
```

**2. 展开运算符**
```js
const arrayLike = { 0: 'a', 1: 'b', length: 2 };
const arr = [...arrayLike];
console.log(arr); // ['a', 'b']

// NodeList 转数组
const nodes = document.querySelectorAll('div');
const arr = [...nodes];
arr.map(node => node.textContent);
```

**3. Array.prototype.slice**
```js
function fn() {
  const args = Array.prototype.slice.call(arguments);
  // 或 [...arguments]
  return args.map(arg => arg * 2);
}
```

**知识点：** `类数组` `Array.from` `展开运算符` `arguments` `NodeList`

:::

---

### Q15: forEach 和 filter 有什么区别？

> **⭐ 简单 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**forEach**: 遍历数组，对每个元素执行回调，**没有返回值**。

```js
const arr = [1, 2, 3, 4, 5];

// forEach 无返回值，返回 undefined
const result = arr.forEach((item, index) => {
  console.log(`item: ${item}, index: ${index}`);
});
console.log(result); // undefined

// 无法用 break 中断
arr.forEach(item => {
  if (item === 3) return; // 只是跳过当前元素，不会停止遍历
  console.log(item);
});
```

**filter**: 过滤数组，**返回新数组**，包含所有满足条件的元素。

```js
const arr = [1, 2, 3, 4, 5];

// filter 返回新数组
const result = arr.filter(item => item > 2);
console.log(result); // [3, 4, 5]
console.log(arr);    // [1, 2, 3, 4, 5]（原数组不变）
```

**对比表格**：

| 特性 | forEach | filter |
|------|---------|--------|
| 返回值 | undefined | 新数组 |
| 原数组 | 不变 | 不变 |
| 适用场景 | 遍历、副作用 | 过滤、筛选 |
| 链式调用 | ❌ | ✅ |
| 可中断 | ❌ | ❌（用 some/every） |

**使用示例**：

```js
// forEach：执行副作用
arr.forEach(item => {
  console.log(item);
  // 发送请求
  // 修改 DOM
  // 累加计数
});

// filter：获取过滤后的数组
const evenNums = arr.filter(item => item % 2 === 0);
const activeUsers = users.filter(user => user.isActive);

// 链式调用
const result = arr
  .filter(x => x > 2)
  .map(x => x * 2)
  .reduce((a, b) => a + b, 0);
```

**注意事项**：
```js
// ❌ forEach 不能用于异步操作
arr.forEach(async item => {
  await fetchData(item); // 不会按顺序等待
});

// ✅ 使用 for...of 或 Promise.all
for (const item of arr) {
  await fetchData(item);
}
// 或
await Promise.all(arr.map(item => fetchData(item)));
```

**知识点：** `forEach` `filter` `数组方法` `返回值` `链式调用`

:::

---

### Q16: 作用域和作用域链是什么？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**作用域**（Scope）：变量和函数的可访问范围，由代码书写位置决定（词法作用域）。

**作用域类型**：

```js
// 1. 全局作用域
const globalVar = 'global';

function fn() {
  // 2. 函数作用域
  const fnVar = 'function';
  
  if (true) {
    // 3. 块级作用域（ES6）
    const blockVar = 'block';
    console.log(blockVar); // 可以访问
  }
  // console.log(blockVar); // ReferenceError
}
```

**作用域链**（Scope Chain）：当访问变量时，JavaScript 引擎会沿着作用域链逐级向上查找。

```js
const a = 'global';

function outer() {
  const b = 'outer';
  
  function inner() {
    const c = 'inner';
    console.log(a); // 'global'（沿着作用域链查找）
    console.log(b); // 'outer'
    console.log(c); // 'inner'
  }
  
  inner();
}

outer();
// console.log(b); // ReferenceError
// console.log(c); // ReferenceError
```

**词法作用域 vs 动态作用域**：

```js
// JavaScript 使用词法作用域（静态作用域）
// 作用域在代码书写时确定，而不是运行时

const a = 'global';

function outer() {
  const a = 'outer';
  
  function inner() {
    console.log(a); // 'outer'（根据书写位置决定）
  }
  
  return inner;
}

const fn = outer();
fn(); // 'outer'（仍然是 outer）
```

**作用域链查找规则**：

1. 从当前作用域开始查找
2. 如果没找到，向上一级作用域查找
3. 直到全局作用域
4. 如果全局作用域还没找到，抛出 ReferenceError

```js
var a = 1;

function level1() {
  var b = 2;
  
  function level2() {
    var c = 3;
    
    function level3() {
      var d = 4;
      console.log(a, b, c, d); // 1 2 3 4
    }
    
    level3();
  }
  
  level2();
}

level1();
```

**知识点：** `作用域` `作用域链` `词法作用域` `变量查找`

:::

---

### Q17: JS 中为什么会出现变量提升？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**变量提升**（Hoisting）：变量和函数声明在代码执行前被"提升"到作用域顶部的现象。

**var 声明提升**：

```js
console.log(a); // undefined（不是 ReferenceError）
var a = 1;

// 等价于：
var a;           // 声明提升到顶部
console.log(a);  // undefined
a = 1;           // 赋值留在原地
```

**函数声明提升**：

```js
sayHello(); // 'Hello'

function sayHello() {
  console.log('Hello');
}

// 等价于：
function sayHello() {} // 整个函数声明提升
sayHello();
```

**let/const 不提升**（有 TDZ）：

```js
console.log(a); // ReferenceError
let a = 1;

// 存在暂时性死区（TDZ）
// 从作用域开始到 let/const 执行前，变量不可访问
```

**提升的原因**：

**引擎预编译阶段处理**：

JavaScript 引擎在执行代码前会进行两个阶段：

1. **编译阶段**：处理所有声明（var、function）
   - 将变量声明添加到作用域
   - 初始化 var 为 undefined
   - 存储整个函数声明

2. **执行阶段**：执行代码逻辑
   - 进行赋值操作
   - 执行函数调用

```js
// 源代码
console.log(a);
var a = 1;
function fn() {}
fn();

// 引擎编译后
var a;          // var 声明并初始化为 undefined
function fn(){} // 函数声明

// 执行
console.log(a); // undefined
a = 1;
fn();
```

**函数声明 vs 函数表达式**：

```js
// 函数声明（整体提升）
fn1(); // 'fn1'
function fn1() {
  console.log('fn1');
}

// 函数表达式（只有变量名提升）
fn2(); // TypeError: fn2 is not a function
var fn2 = function() {
  console.log('fn2');
};
// 等价于：
// var fn2; -> fn2() 时是 undefined -> TypeError
// fn2 = function() {}
```

**提升带来的问题**：

```js
// ❌ 容易混淆
function fn() {
  console.log(a); // undefined
  if (false) {
    var a = 1;
  }
  console.log(a); // undefined
}
fn();

// ✅ 使用 let/const 避免提升问题
function fn() {
  console.log(a); // ReferenceError
  let a = 1;
}
```

**知识点：** `变量提升` `hoisting` `TDZ` `预编译` `函数声明`

:::

---

## 🔑 核心知识点总结

### 1. 显式转换方法

```js
// 转为字符串
String(123);        // '123'
(123).toString();   // '123'

// 转为数字
Number('123');      // 123
parseInt('123');    // 123
parseFloat('3.14'); // 3.14
+'123';             // 123 (一元 +)

// 转为布尔值
Boolean('');        // false
Boolean('hello');   // true
!!'hello';          // true
```

### 2. 隐式转换触发场景

| 运算/场景 | 转换规则 |
|----------|---------|
| `+` | 有一方是字符串则进行字符串拼接 |
| `-` `*` `/` `%` | 都转为数字 |
| `==` | 尝试转换为相同类型再比较 |
| `!` | 先转为布尔值再取反 |
| 一元 `+` `-` | 转为数字 |
| 关系运算符 `<` `>` | 转为数字或字符串 |

### 3. 假值列表（7 个）

```js
false, 0, -0, 0n, '', null, undefined, NaN
```

### 4. 对象转原始值优先级

1. `Symbol.toPrimitive` (如果定义)
2. 根据 hint 调用 `valueOf()` 或 `toString()`

## 💡 面试技巧

1. **看到 `+` 先判断类型** - 有字符串就是拼接，否则是加法
2. **对象转字符串** - 先 `valueOf` 后 `toString`（除非 hint 为 string）
3. **善用 `===`** - 避免隐式转换带来的问题
4. **牢记 7 个假值** - 空数组和空对象是真值！
5. **null 和 undefined** - `==` 相等但 `===` 不等
6. **NaN 特性** - 不等于任何值包括自身，用 `Object.is()` 或 `Number.isNaN()`
7. **Symbol 不能隐式转换** - 只能显式用 `String()` 转换
---

### Q18: 数组去重有哪些方法？

> **⭐ 简单 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. Set 去重（最简洁）**

```js
const arr = [1, 2, 2, 3, 4, 4, 5]
const unique = [...new Set(arr)]
// [1, 2, 3, 4, 5]

// 或
const unique = Array.from(new Set(arr))
```

**2. indexOf 去重**

```js
function unique(arr) {
  const result = []
  for (let i = 0; i < arr.length; i++) {
    if (result.indexOf(arr[i]) === -1) {
      result.push(arr[i])
    }
  }
  return result
}
```

**3. includes 去重**

```js
function unique(arr) {
  const result = []
  for (let item of arr) {
    if (!result.includes(item)) {
      result.push(item)
    }
  }
  return result
}
```

**4. filter + indexOf（保留第一次出现）**

```js
const unique = arr.filter((item, index) => {
  return arr.indexOf(item) === index
})
```

**5. Map 去重（适合对象数组）**

```js
function uniqueBy(arr, key) {
  const map = new Map()
  const result = []
  for (let item of arr) {
    const val = item[key]
    if (!map.has(val)) {
      map.set(val, true)
      result.push(item)
    }
  }
  return result
}

// 使用
const users = [{id: 1, name: 'A'}, {id: 1, name: 'B'}, {id: 2, name: 'C'}]
uniqueBy(users, 'id')  // [{id: 1, name: 'A'}, {id: 2, name: 'C'}]
```

**6. reduce 去重**

```js
const unique = arr.reduce((acc, cur) => {
  if (!acc.includes(cur)) {
    acc.push(cur)
  }
  return acc
}, [])
```

**性能对比：**

| 方法 | 时间复杂度 | 性能 | 推荐场景 |
|------|-----------|------|---------|
| Set | O(n) | ⭐⭐⭐ | 简单去重（首选） |
| indexOf | O(n²) | ⭐ | 小数组 |
| filter+indexOf | O(n²) | ⭐ | 小数组，链式 |
| Map | O(n) | ⭐⭐⭐ | 对象数组 |
| reduce | O(n²) | ⭐⭐ | 函数式风格 |

**知识点：** `数组去重` `Set` `indexOf` `Map` `filter`

:::

---

### Q19: new 操作符做了什么？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**new 操作符做了 4 件事：**

```js
// 手动实现 new
function myNew(Constructor, ...args) {
  // 1. 创建一个空对象
  const obj = {}
  
  // 2. 将空对象的原型链接到构造函数的原型
  obj.__proto__ = Constructor.prototype
  // 或 Object.setPrototypeOf(obj, Constructor.prototype)
  
  // 3. 将 this 绑定到新对象，执行构造函数
  const result = Constructor.apply(obj, args)
  
  // 4. 如果构造函数返回对象则返回它，否则返回新对象
  return (typeof result === 'object' && result !== null) ? result : obj
}

// 使用示例
function Person(name, age) {
  this.name = name
  this.age = age
}

Person.prototype.sayHi = function() {
  console.log(`Hi, I'm ${this.name}`)
}

const p = myNew(Person, '张三', 18)
p.sayHi()  // "Hi, I'm 张三"
```

**详细步骤：**

```js
// 步骤 1：创建空对象
const obj = {}

// 步骤 2：链接原型
// obj 的内部 [[Prototype]] 指向 Constructor.prototype
obj.__proto__ = Constructor.prototype

// 步骤 3：绑定 this 并执行
// 此时构造函数内的 this 指向新对象 obj
Constructor.call(obj, arg1, arg2)

// 步骤 4：返回值判断
// 如果构造函数显式返回对象，则返回该对象
// 否则返回新创建的 obj
```

**示例对比：**

```js
function Car(model) {
  this.model = model
}

const c1 = new Car('Tesla')
// c1 = { model: 'Tesla', __proto__: Car.prototype }

function Bike(model) {
  this.model = model
  return { type: 'Bike' }  // 返回对象
}

const b1 = new Bike('Giant')
// b1 = { type: 'Bike' }  // 返回的是 { type: 'Bike' }，不是新对象
```

**注意事项：**

```js
// 构造函数不能是箭头函数（箭头函数没有 prototype）
const Arrow = (name) => { this.name = name }
const a = new Arrow('test')  // ❌ TypeError

// 构造函数首字母建议大写（约定）
function person(name) {}  // ⚠️ 虽然能工作，但不推荐
const p = new person('test')
```

**知识点：** `new 操作符` `构造函数` `原型链` `this 绑定`

:::

---

### Q20: 为什么 0.1 + 0.2 !== 0.3？浮点数精度问题如何解决？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**问题原因：**

JavaScript 使用 **IEEE 754 双精度浮点数**表示所有数字。0.1 和 0.2 在二进制中是无限循环小数，无法精确表示，导致计算结果有微小误差。

```js
console.log(0.1 + 0.2);           // 0.30000000000000004
console.log(0.1 + 0.2 === 0.3);   // false
```

**二进制表示问题：**
```
0.1 十进制转二进制 = 0.0001100110011001100... (1100 无限循环)
0.2 十进制转二进制 = 0.0011001100110011001... (1100 无限循环)
```
IEEE 754 双精度用 64 位存储（1 位符号 +11 位指数 +52 位尾数），超出 52 位的部分被截断，导致精度丢失。

**解决方案：**

**1. 使用 Number.EPSILON 比较（推荐）**
```js
function floatEqual(a, b, epsilon = Number.EPSILON) {
  return Math.abs(a - b) < epsilon;
}

console.log(floatEqual(0.1 + 0.2, 0.3));  // true
console.log(Number.EPSILON);  // 2.220446049250313e-16
```

**2. 转换为整数运算（金额计算场景）**
```js
// 金额转为分（整数）计算
const price1 = 10;  // 0.1 元 = 10 分
const price2 = 20;  // 0.2 元 = 20 分
const total = (price1 + price2) / 100;  // 0.3 元

function addFloat(a, b, precision = 10) {
  const multiplier = Math.pow(10, precision);
  return (a * multiplier + b * multiplier) / multiplier;
}
console.log(addFloat(0.1, 0.2));  // 0.3
```

**3. 使用 toFixed（注意返回字符串）**
```js
console.log((0.1 + 0.2).toFixed(1));  // "0.3"
console.log(parseFloat((0.1 + 0.2).toFixed(10)));  // 0.3
```

**4. 使用专门库（生产环境推荐）**
```js
import Decimal from 'decimal.js';
console.log(new Decimal(0.1).plus(0.2).toString());  // "0.3"
```

**实际应用对比：**
```js
// ❌ 直接累加
let total = 0;
for (let i = 0; i < 10; i++) total += 0.1;
console.log(total === 1);  // false

// ✅ 整数累加
let totalCents = 0;
for (let i = 0; i < 10; i++) totalCents += 1;
console.log(totalCents / 100 === 1);  // true
```

**知识点：** `浮点数精度` `IEEE 754` `Number.EPSILON` `decimal.js` `金额计算`

:::

---

### Q21: Symbol 类型有什么特点？有哪些内置 Symbol？

> **🔥 中等 · JavaScript**

请说明 Symbol 的特点和常见的内置 Symbol。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Symbol 的特点：**

1. **唯一性**：每个 Symbol 都是唯一的
```js
Symbol('id') === Symbol('id');  // false
```

2. **不可隐式转换**：不能与字符串拼接或转为数字
```js
const sym = Symbol('test');
sym + '';        // TypeError
Number(sym);     // TypeError
sym == true;     // TypeError
String(sym);     // 'Symbol(test)' ✓
```

3. **非枚举属性**：不会出现在 for...in 或 Object.keys 中
```js
const obj = { [Symbol('id')]: 1, name: 'test' };
Object.keys(obj);        // ['name']
Object.getOwnPropertySymbols(obj);  // [Symbol(id)]
```

**常见的内置 Symbol：**

| Symbol | 用途 |
|--------|------|
| `Symbol.iterator` | 定义默认迭代器 |
| `Symbol.toPrimitive` | 自定义类型转换 |
| `Symbol.toStringTag` | 自定义 toString 输出 |
| `Symbol.hasInstance` | 自定义 instanceof 行为 |
| `Symbol.match/replace/search/split` | 自定义字符串方法 |
| `Symbol.species` | 派生构造函数 |

**使用示例：**
```js
// 1. 迭代器
const obj = {
  data: [1, 2, 3],
  [Symbol.iterator]() {
    let i = 0;
    return {
      next: () => ({ value: this.data[i++], done: i > this.data.length })
    };
  }
};
[...obj];  // [1, 2, 3]

// 2. 类型转换
const price = {
  amount: 100,
  [Symbol.toPrimitive](hint) {
    return hint === 'string' ? `¥${this.amount}` : this.amount;
  }
};
console.log(+price);     // 100
console.log(`${price}`); // ¥100

// 3. 自定义 toString
const arr = [];
arr[Symbol.toStringTag] = 'MyArray';
String(arr);  // '[object MyArray]'
```

**知识点：** `Symbol` `唯一标识` `内置 Symbol` `类型转换` `迭代器`

:::

---

### Q22: BigInt 和 Number 的区别？能混合运算吗？

> **🔥 中等 · JavaScript**

请说明 BigInt 的特点和使用注意事项。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**BigInt 特点：**

1. **任意精度整数**：可以表示超出 Number 范围的整数
```js
const max = Number.MAX_SAFE_INTEGER;  // 9007199254740991
console.log(max + 1 === max + 2);     // true（精度丢失）

const big = 9007199254740992n;
console.log(big + 1n === big + 2n);   // false（精确）
```

2. **区分类型**：BigInt 和 Number 是不同的类型
```js
typeof 1n;        // 'bigint'
typeof 1;         // 'number'
1n === 1;         // false
```

3. **只能与 BigInt 运算**：不能混合运算
```js
1n + 1;           // ❌ TypeError
1n + 1n;          // ✅ 2n
BigInt(1) + 1n;   // ✅ 2n
```

**转换方法：**
```js
// Number → BigInt
BigInt(10);       // 10n
10n;              // 10n

// BigInt → Number（可能丢失精度）
Number(10n);      // 10
```

**使用场景：**
```js
// 1. 精确的大整数计算
const bigId = 999999999999999999n;

// 2. 时间戳（纳秒级）
const now = BigInt(Date.now()) * 1000000n;

// 3. 金融计算（避免浮点误差）
const amount = 100000n;  // 1.00 元（以分为单位）
```

**注意事项：**
```js
// ❌ Math 方法不支持 BigInt
Math.abs(-5n);  // TypeError

// ❌ JSON 不支持 BigInt
JSON.stringify({ val: 1n });  // TypeError

// ✅ 解决方法
JSON.stringify({ val: 1n }, (key, val) =>
  typeof val === 'bigint' ? val.toString() : val
);
```

**知识点：** `BigInt` `大整数` `精度` `类型转换`

:::

---

### Q23: 什么是 Optional Chaining (?.) 和 Nullish Coalescing (??)？

> **⭐ 简单 · JavaScript**

请说明可选链和空值合并运算符的用法。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**可选链运算符 (?.)：**

安全访问嵌套属性，遇到 null/undefined 时返回 undefined 而不报错。

```js
// 传统写法
const name = user && user.profile && user.profile.name;

// 可选链
const name = user?.profile?.name;

// 可选调用
obj.method?.();

// 可选访问数组
const first = arr?.[0];

// 结合使用
const city = user?.profile?.contact?.address?.city ?? 'Unknown';
```

**空值合并运算符 (??)：**

只在左侧为 null 或 undefined 时返回右侧默认值。

```js
// || 的问题
const count = 0;
count || 10;    // 10（0 被当作假值，错误）

// ?? 的正确行为
count ?? 10;    // 0（只检查 null/undefined）

// 实际场景
const timeout = config.timeout ?? 5000;
const name = user.name ?? '匿名用户';
```

**对比 || 和 ??：**
```js
undefined || 'default'  // 'default'
null || 'default'       // 'default'
0 || 'default'          // 'default' ← 可能不是想要的
'' || 'default'         // 'default' ← 可能不是想要的

undefined ?? 'default'  // 'default'
null ?? 'default'       // 'default'
0 ?? 'default'          // 0 ← 保留原值
'' ?? 'default'         // '' ← 保留原值
```

**知识点：** `可选链` `空值合并` `?.` `??` `null` `undefined`

:::

---

### Q24: Object.is() 和 === 的区别？

> **🔥 中等 · JavaScript**

请说明 Object.is() 与严格相等运算符的区别。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Object.is() 和 === 的区别：**

两者几乎相同，有两个例外：`-0 vs +0` 和 `NaN vs NaN`。

**对比测试：**
```js
// 大部分情况相同
Object.is(1, 1);          // true（同 ===）
Object.is('a', 'a');      // true（同 ===）
Object.is({}, {});        // false（同 ===，引用不同）

// 区别 1：-0 和 +0
-0 === +0;               // true
Object.is(-0, +0);       // false

// 区别 2：NaN 和 NaN
NaN === NaN;             // false
Object.is(NaN, NaN);     // true
```

**为什么有这个区别？**

IEEE 754 标准中，-0 和 +0 在数值上相等但有符号位区别。NaN 按标准不等于任何值包括自身。

Object.is() 提供了更符合数学直觉的比较。

**使用场景：**
```js
// 1. 精确比较（如缓存 key）
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = args.find(arg => 
      cache.has(arg) && Object.is(arg, [...cache.keys()].find(k => true))
    );
    // ...
  };
}

// 2. 检测 NaN
function isNaN(value) {
  return Object.is(value, NaN);
}

// 3. React 中的 shallow compare
function shallowEqual(obj1, obj2) {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (let key of keys1) {
    if (!Object.is(obj1[key], obj2[key])) return false;
  }
  
  return true;
}
```

**知识点：** `Object.is` `===` `严格相等` `NaN` `-0`

:::
