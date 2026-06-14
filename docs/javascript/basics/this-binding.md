---
title: this 指向
description: this 绑定规则、call/apply/bind、箭头函数 this、隐式/显式绑定、this 丢失等核心面试题
---

# this 指向

this 是 JavaScript 中最容易混淆的概念之一。理解 this 的绑定规则对于正确使用面向对象和函数式编程至关重要。

---

## 📝 题目

### Q1: this 的绑定规则有哪些？优先级如何？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

this 的绑定规则有 4 种，优先级从低到高：

| 优先级 | 规则 | this 指向 | 触发方式 |
|--------|------|-----------|---------|
| 4（最低） | 默认绑定 | 全局对象/undefined | 独立函数调用 |
| 3 | 隐式绑定 | 调用对象 | obj.fn() |
| 2 | 显式绑定 | 指定对象 | call/apply/bind |
| 1（最高） | new 绑定 | 新创建的对象 | new Fn() |

**1. 默认绑定：**

```js
function foo() {
  console.log(this)
}
foo()              //_window（非严格模式）
foo()              // undefined（严格模式）

'use strict'
function bar() {
  console.log(this) // undefined
}
```

**2. 隐式绑定：**

```js
const obj = {
  name: 'Alice',
  greet() { console.log(this.name) }
}
obj.greet()  // 'Alice' — this 指向 obj

// ⚠️ 隐式丢失
const fn = obj.greet
fn()  // undefined — this 丢失，变成默认绑定

// ⚠️ 回调中的隐式丢失
setTimeout(obj.greet, 100)  // undefined
```

**3. 显式绑定：**

```js
function greet() { console.log(this.name) }
const user = { name: 'Alice' }

greet.call(user)     // 'Alice' — 立即调用，this = user
greet.apply(user)    // 'Alice' — 立即调用，this = user

const bound = greet.bind(user)
bound()              // 'Alice' — 返回新函数，永久绑定

// 硬绑定防止丢失
setTimeout(obj.greet.bind(obj), 100)  // 'Alice'
```

**4. new 绑定：**

```js
function Person(name) {
  this.name = name
}
const p = new Person('Alice')  // this → 新对象 { name: 'Alice' }
```

**优先级验证：**

```js
// 显式绑定 > 隐式绑定
const obj1 = { name: 'A', foo: function() { console.log(this.name) } }
const obj2 = { name: 'B' }
obj1.foo.call(obj2)  // 'B' — 显式绑定优先

// new > 显式绑定
const bound = Person.bind({ name: 'ignored' })
const p2 = new bound('Bob')  // { name: 'Bob' } — new 优先
```

**箭头函数例外：** 箭头函数没有 this，继承外层词法作用域的 this，无法被以上规则改变。

```js
const obj = {
  name: 'Alice',
  greet: () => console.log(this.name)  // undefined — this 是外层的window
}
obj.greet()

const obj2 = {
  name: 'Bob',
  greet() {
    const inner = () => console.log(this.name)  // 'Bob' — 继承greet的this
    inner()
  }
}
```

**知识点：** `this绑定` `call/apply/bind` `new绑定` `箭头函数` `隐式丢失`

:::

:::

---

### Q2: 默认绑定 RULE

> **⭐ 简单 · JavaScript**

```js
function foo() {
  console.log(this);
}

foo();  // 非严格模式
'use strict';
foo();  // 严格模式
```

输出分别是什么？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
window (或 globalThis)  // 非严格模式
undefined               // 严格模式
```

**💡 解析：**
**默认绑定规则：**
- 函数独立调用时（不作为对象方法），使用默认绑定
- 非严格模式下，this 指向全局对象（浏览器是 window，Node.js 是 global）
- 严格模式下，this 为 undefined
- 这是最常见的 this 丢失场景

**避免默认绑定丢失：**
```js
const obj = {
  value: 42,
  getValue() {
    function inner() {
      console.log(this.value);  // this 丢失
    }
    inner();
  }
};
```

**知识点：** `默认绑定` `严格模式` `this 丢失`

:::

---

### Q3: 隐式绑定与 this 丢失

> **🔥 中等 · JavaScript**

```js
function foo() {
  console.log(this.a);
}

const obj = {
  a: 2,
  foo: foo
};

const bar = obj.foo;
const a = 1;

obj.foo();  // ?
bar();      // ?
```

输出分别是什么？为什么？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
2   // obj.foo() - 隐式绑定
1   // bar() - 默认绑定
```

**💡 解析：**
**隐式绑定规则：** 当函数作为对象的方法调用时，this 指向该对象。

**this 丢失场景：**
```js
const bar = obj.foo;  // 只是引用赋值，不是绑定
bar();  // 独立调用，this 指向全局（或 undefined）
```

**常见丢失场景：**
1. 方法赋值给变量后调用
2. 回调函数（setTimeout、数组方法等）
3. 事件处理函数

**解决方案：**
```js
// 方案 1：bind 显式绑定
const bar = obj.foo.bind(obj);

// 方案 2：箭头函数
setTimeout(() => this.foo(), 0);

// 方案 3：保存 this 引用
const self = this;
```

**知识点：** `隐式绑定` `this 丢失` `回调函数 this`

:::

---

### Q4: 显式绑定 call/apply/bind

> **⭐ 简单 · JavaScript**

```js
function greet(greeting, punctuation) {
  console.log(`${greeting}, ${this.name}${punctuation}`);
}

const person = { name: 'Alice' };

greet.call(person, 'Hello', '!');
greet.apply(person, ['Hi', '?']);
const boundGreet = greet.bind(person, 'Hey', '.');
boundGreet();
```

这三个调用的输出分别是什么？call/apply/bind 有什么区别？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
Hello, Alice!
Hi, Alice?
Hey, Alice.
```

**💡 解析：**
**call/apply/bind 相同点：**
- 都可以显式指定 this 指向
- 第一个参数都是 this 值

**区别：**
| 方法 | 参数传递 | 返回值 | 执行时机 |
|------|---------|--------|---------|
| call | 逐个传递 | 原函数返回值 | 立即执行 |
| apply | 数组传递 | 原函数返回值 | 立即执行 |
| bind | 逐个传递 | 新函数 | 返回新函数，需手动调用 |

**使用场景：**
- **call**：直接调用并传递参数
- **apply**：参数在数组中，或需要展开数组
- **bind**：需要创建新函数稍后调用

**知识点：** `call` `apply` `bind` `显式绑定`

:::

---

### Q5: 箭头函数的 this 指向有什么特殊之处？

> **🔥 中等 · JavaScript**

```js
const obj = {
  name: 'Alice',
  regularFunc: function() {
    console.log(this.name);
  },
  arrowFunc: () => {
    console.log(this.name);
  },
  method: function() {
    const innerArrow = () => {
      console.log(this.name);
    };
    innerArrow();
  }
};

obj.regularFunc();
obj.arrowFunc();
obj.method();
```

输出分别是什么？为什么？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
Alice        // regularFunc - 隐式绑定
undefined    // arrowFunc - 词法 this，指向全局
Alice        // method 中的 innerArrow - 继承 method 的 this
```

**💡 解析：**
**箭头函数 this 规则：**
- 箭头函数**没有自己的 this**
- 箭头函数的 this 继承自定义时的词法作用域
- 箭头函数的 this **不能被 call/apply/bind 改变**

**场景分析：**
1. `obj.regularFunc()` - 普通函数，隐式绑定到 obj
2. `obj.arrowFunc` - 箭头函数，定义时在全局作用域，this 指向全局（window.name 通常为""）
3. `method` 中的箭头函数 - 继承 method 的 this（即 obj）

**箭头函数适用场景：**
- 回调函数中保持外部 this
- 不需要重绑定 this 的地方

**不适用场景：**
- 对象方法（需要动态 this）
- 构造函数（不能用作构造函数）

**知识点：** `箭头函数 this` `词法 this` `this 继承`

:::

---

### Q6: new 绑定的原理是什么？

> **🔥 中等 · JavaScript**

```js
function Person(name) {
  this.name = name;
  this.sayHi = function() {
    console.log(`Hi, I'm ${this.name}`);
  };
}

const p = new Person('Bob');
p.sayHi();

// 手动模拟 new
function myNew(fn, ...args) {
  // 实现 new 操作
}
```

请解释 new 操作符的原理，并实现 myNew 函数。

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```js
function myNew(fn, ...args) {
  // 1. 创建一个空对象
  const obj = {};
  
  // 2. 将对象的原型指向构造函数的 prototype
  Object.setPrototypeOf(obj, fn.prototype);
  
  // 3. 执行构造函数，this 指向新对象
  const result = fn.apply(obj, args);
  
  // 4. 如果构造函数返回对象，则返回该对象，否则返回新对象
  return result instanceof Object ? result : obj;
}

// 测试
const p1 = new Person('Bob');
const p2 = myNew(Person, 'Bob');
console.log(p1.name); // Bob
console.log(p2.name); // Bob
```

**💡 解析：**
**new 操作符执行步骤：**
1. 创建一个空对象
2. 将新对象的原型指向构造函数的 prototype
3. 执行构造函数，this 绑定到新对象
4. 如果构造函数返回对象，返回该对象；否则返回新对象

**注意：** 构造函数中的 return 如果返回原始值会被忽略，如果返回对象则会覆盖 new 的结果。

**知识点：** `new 绑定` `原型链` `构造函数`

:::

---

### Q7: this 在 class 中的行为

> **⭐ 简单 · JavaScript**

```js
class MyClass {
  constructor(name) {
    this.name = name;
  }
  
  sayName1() {
    console.log(this.name);
  }
  
  sayName2 = () => {
    console.log(this.name);
  }
  
  static sayName3() {
    console.log(this);
  }
}

const obj = new MyClass('Test');
const fn1 = obj.sayName1;
const fn2 = obj.sayName2;

obj.sayName1();
fn1();
obj.sayName2();
fn2();
MyClass.sayName3();
```

输出分别是什么？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
Test            // obj.sayName1() - 隐式绑定
undefined       // fn1() - this 丢失（默认绑定）
Test            // obj.sayName2() - 箭头函数继承 obj 的 this
Test            // fn2() - 箭头函数定义时就绑定了 obj
undefined       // sayName3() - 静态方法，this 指向类本身
```

**💡 解析：**
**class 中 this 的注意事项：**
1. 普通方法作为回调时会丢失 this
2. 箭头函数方法会自动绑定实例的 this
3. 静态方法的 this 指向类本身
4. 构造函数中的 this 指向新实例

**解决方案：**
```js
// 方案 1：构造函数中绑定
class MyClass {
  constructor(name) {
    this.name = name;
    this.sayName = this.sayName.bind(this);
  }
  sayName() {
    console.log(this.name);
  }
}

// 方案 2：使用箭头函数属性
class MyClass {
  sayName = () => {
    console.log(this.name);
  }
}
```

**知识点：** `class this` `实例方法` `箭头函数方法`

:::

---

### Q8: 以下复杂场景的 this 指向

> **💀 困难 · JavaScript**

```js
const obj = {
  name: 'obj',
  foo: {
    name: 'foo',
    bar: function() {
      console.log(this.name);
    }
  }
};

const fooObj = obj.foo;
const bar = fooObj.bar;

obj.foo.bar();
fooObj.bar();
bar();
```

输出分别是什么？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
foo   // obj.foo.bar() - 隐式绑定到 obj.foo
foo   // fooObj.bar() - 隐式绑定到 fooObj
undefined  // bar() - 默认绑定（全局 name 通常为 undefined）
```

**💡 解析：**
**this 绑定只看调用位置：**
- `obj.foo.bar()` - 方法是 `obj.foo.bar`，this 绑定到 `obj.foo`（即 foo 对象）
- `fooObj.bar()` - 方法是 `fooObj.bar`，this 绑定到 `fooObj`（即 foo 对象）
- `bar()` - 独立调用，this 默认绑定到全局

**关键点：** this 的绑定与函数定义的位置无关，只与**调用方式**有关。

**知识点：** `this 调用位置` `嵌套对象 this` `隐式绑定`

:::

---

### Q9: 实现 call/apply/bind

> **💀 困难 · JavaScript**

请手写实现 call、apply 和 bind 函数。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**实现 call：**
```js
Function.prototype.myCall = function(context, ...args) {
  // 1. context 为 null/undefined 时，默认绑定到全局对象
  context = context || globalThis;
  
  // 2. 给 context 添加一个唯一属性指向当前函数
  const fnKey = Symbol('fn');
  context[fnKey] = this;
  
  // 3. 执行函数
  const result = context[fnKey](...args);
  
  // 4. 删除临时属性
  delete context[fnKey];
  
  // 5. 返回结果
  return result;
};
```

**实现 apply：**
```js
Function.prototype.myApply = function(context, args) {
  context = context || globalThis;
  const fnKey = Symbol('fn');
  context[fnKey] = this;
  const result = args ? context[fnKey](...args) : context[fnKey]();
  delete context[fnKey];
  return result;
};
```

**实现 bind：**
```js
Function.prototype.myBind = function(context, ...boundArgs) {
  const targetFn = this;
  
  function boundFn(...callArgs) {
    // 判断是否作为构造函数调用
    if (this instanceof boundFn) {
      return new targetFn(...boundArgs, ...callArgs);
    }
    return targetFn.apply(context, [...boundArgs, ...callArgs]);
  }
  
  // 继承原型
  boundFn.prototype = Object.create(targetFn.prototype);
  
  return boundFn;
};
```

**知识点：** `call 实现` `apply 实现` `bind 实现` `this 显式绑定`

:::

---

### Q10: setTimeout 和事件监听中的 this 问题

> **🔥 中等 · JavaScript**

```js
const obj = {
  name: 'Test',
  greet: function() {
    console.log(`Hello, ${this.name}`);
  },
  
  greetLater1: function() {
    setTimeout(function() {
      console.log(`Hello, ${this.name}`);
    }, 100);
  },
  
  greetLater2: function() {
    setTimeout(() => {
      console.log(`Hello, ${this.name}`);
    }, 100);
  }
};

obj.greetLater1();
obj.greetLater2();
```

输出分别是什么？如何修复 greetLater1？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
Hello, undefined  // greetLater1 - this 指向 window
Hello, Test       // greetLater2 - 箭头函数继承 this
```

**💡 解析：**
**问题分析：**
- `setTimeout` 的回调是独立调用，this 默认绑定到全局
- 箭头函数从词法作用域继承 this，保持了指向 obj 的引用

**修复方案：**
```js
// 方案 1：箭头函数（推荐）
greetLater1: function() {
  setTimeout(() => {
    console.log(`Hello, ${this.name}`);
  }, 100);
}

// 方案 2：bind 绑定
greetLater1: function() {
  setTimeout(function() {
    console.log(`Hello, ${this.name}`);
  }.bind(this), 100);
}

// 方案 3：保存 this 引用
greetLater1: function() {
  const self = this;
  setTimeout(function() {
    console.log(`Hello, ${self.name}`);
  }, 100);
}
```

**知识点：** `setTimeout this` `事件回调 this` `this 丢失修复`

:::

---

## 🔑 核心知识点总结

### 1. 四种绑定规则

| 规则 | 调用方式 | this 指向 |
|------|---------|----------|
| 默认绑定 | fn() | 全局/undefined |
| 隐式绑定 | obj.fn() | obj |
| 显式绑定 | fn.call(obj) | obj |
| new 绑定 | new Fn() | 新对象 |

### 2. 优先级顺序

```
new 绑定 > 显式绑定 > 隐式绑定 > 默认绑定
```

### 3. 箭头函数特点

- 没有自己的 this、arguments、super、new.target
- this 从定义时的词法作用域继承
- 不能用作构造函数
- 不能用作 Generator 函数

### 4. this 丢失场景

1. 回调函数（setTimeout、数组方法等）
2. 方法赋值给变量后调用
3. 事件处理函数（普通函数写法）

## 💡 面试技巧

1. **口诀**：谁调用指向谁（隐式），独立调用看严格模式
2. **箭头函数**：定义时就决定了 this，无法修改
3. **class 方法**：最好用箭头函数或在构造函数中 bind
4. **回调函数**：优先用箭头函数保持 this
5. **重写 bind**：要注意构造函数调用的情况
---

### Q11: 箭头函数的 this 指向什么时候确定？能通过 call/bind 改变吗？

> **🔥 中等 · JavaScript**

请说明箭头函数 this 的特性。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**箭头函数的 this 在定义时确定**，继承自外层作用域，不能被 call/bind/apply 改变。

**this 继承示例：**
```js
const obj = {
  value: 42,
  regular() {
    console.log(this.value);  // 42（this 指向 obj）
  },
  arrow: () => {
    console.log(this.value);  // undefined（this 继承自外层，即 window/global）
  }
};

obj.regular();  // 42
obj.arrow();    // undefined
```

**嵌套箭头函数：**
```js
function outer() {
  console.log(this.value);  // this 由调用决定
  
  const arrow = () => {
    console.log(this.value);  // 继承 outer 的 this
  };
  
  arrow();
}

outer.call({ value: 42 });  // 42, 42
```

**不能使用 call/bind/apply 改变：**
```js
const arrow = function() {
  console.log(this.value);
}.bind({ value: 1 });

arrow.call({ value: 2 });  // 1（bind 时已确定）

// 箭头函数完全不受影响
const arrow2 = () => {
  console.log(this.value);
};
arrow2.call({ value: 3 });  // 仍然是外层的 this
```

**应用场景：**
```js
// ✅ 适合：需要继承外层 this
class Timer {
  constructor() {
    this.seconds = 0;
    setInterval(() => {
      this.seconds++;  // this 指向 Timer 实例
    }, 1000);
  }
}

// ❌ 不适合：需要动态 this
const obj = {
  value: 42,
  method: () => {
    console.log(this.value);  // 不是 obj！
  }
};
```

**知识点：** `箭头函数` `this 指向` `词法绑定` `call` `bind`

:::

---

### Q12: class 中方法默认的 this 绑定是什么？如何解决丢失问题？

> **🔥 中等 · JavaScript**

请说明 class 方法 this 丢失的原因和解决方案。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**问题：方法解构后 this 丢失**
```js
class Button {
  constructor(text) {
    this.text = text;
  }
  
  handleClick() {
    console.log(`${this.text} clicked`);
  }
}

const btn = new Button('Submit');
const handler = btn.handleClick;

// ❌ this 丢失
button.addEventListener('click', handler);  // undefined clicked

// ✅ 直接调用没问题
btn.handleClick();  // Submit clicked
```

**解决方案：**

**1. 构造函数中绑定（推荐）：**
```js
class Button {
  constructor(text) {
    this.text = text;
    this.handleClick = this.handleClick.bind(this);
  }
  
  handleClick() {
    console.log(`${this.text} clicked`);
  }
}
```

**2. 使用箭头函数属性：**
```js
class Button {
  constructor(text) {
    this.text = text;
  }
  
  handleClick = () => {
    console.log(`${this.text} clicked`);  // this 继承自实例
  };
}
```

**3. 调用时绑定：**
```js
button.addEventListener('click', btn.handleClick.bind(btn));

// 或内联箭头函数
button.addEventListener('click', (e) => btn.handleClick(e));
```

**4. React 类组件中的使用：**
```js
// 方式 1：构造函数绑定（传统）
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
}

// 方式 2：类属性语法（需要 babel）
class MyComponent extends React.Component {
  handleClick = () => {
    // this 自动绑定
  }
}
```

**对比：**
| 方案 | 优点 | 缺点 |
|------|------|------|
| 构造函数 bind | 标准语法 | 样板代码多 |
| 箭头函数属性 | 简洁 | 需要转译，每个实例独立函数 |
| 调用时绑定 | 灵活 | 容易忘记 |

**知识点：** `class` `this 绑定` `方法丢失` `bind` `箭头函数属性`

:::

---

### Q13: 事件处理函数中 this 指向什么？箭头函数事件处理有什么区别？

> **⭐ 简单 · JavaScript**

请说明事件处理中 this 的行为。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**普通函数事件处理：**
```js
// 传统方式
button.addEventListener('click', function(e) {
  console.log(this);  // 指向触发事件的元素（button）
  console.log(this === e.currentTarget);  // true
});
```

**箭头函数事件处理：**
```js
// 箭头函数
button.addEventListener('click', (e) => {
  console.log(this);  // 指向外层作用域的 this（不是 button）
});
```

**对比示例：**
```js
class Counter {
  constructor() {
    this.count = 0;
    this.button = document.querySelector('#btn');
    
    // ❌ 箭头函数，this 指向 Counter 实例
    this.button.addEventListener('click', () => {
      this.count++;  // ✅ this 是 Counter
      console.log(this.textContent);  // ❌ undefined
    });
    
    // ✅ 普通函数，this 指向 button
    this.button.addEventListener('click', function() {
      this.count++;  // ❌ this 是 button，没有 count
      console.log(this.textContent);  // ✅ 按钮文本
    });
    
    // ✅ 最佳：普通函数 + 外部引用
    this.button.addEventListener('click', function() {
      console.log(this.textContent);  // 按钮文本
      this.count++;  // Counter 的 count
    }.bind(this));
  }
}
```

**React 中的事件处理：**
```js
// React 自动绑定事件
class MyComponent extends React.Component {
  handleClick(e) {
    console.log(this);  // 组件实例
    console.log(e.currentTarget);  // 触发事件的元素
  }
  
  render() {
    return <button onClick={this.handleClick}>Click</button>;
  }
}

// 箭头函数写法
const MyComponent = () => {
  const handleClick = (e) => {
    console.log(this);  // 注意：不是组件实例（函数组件没有 this）
  };
  
  return <button onClick={handleClick}>Click</button>;
};
```

**知识点：** `事件处理` `this 指向` `箭头函数` `addEventListener`

:::

---

### Q14: 如何安全地解构对象方法而不丢失 this 绑定？

> **🔥 中等 · JavaScript**

请说明解构方法时保持 this 的方法。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**问题：解构方法丢失 this**
```js
const obj = {
  name: 'Alice',
  greet() {
    console.log(`Hello, ${this.name}`);
  }
};

const { greet } = obj;
greet();  // ❌ Hello, undefined（this 丢失）
```

**解决方案：**

**1. 解构时绑定：**
```js
const { greet } = obj;
const boundGreet = greet.bind(obj);
boundGreet();  // Hello, Alice
```

**2. 使用箭头函数定义方法：**
```js
const obj = {
  name: 'Alice',
  greet: function() {
    console.log(`Hello, ${this.name}`);
  }
};
```
但注意：如果方法内用到 this，箭头函数可能不合适。

**3. 解构整个对象：**
```js
const { name, greet } = obj;
// 手动处理
```

**4. 保持方法调用上下文：**
```js
// 使用 call/apply
const { greet } = obj;
greet.call(obj);  // Hello, Alice

// 或使用包装
const wrappedGreet = (...args) => greet.call(obj, ...args);
wrappedGreet();
```

**5. React 中的处理：**
```js
// ❌ 直接解构会丢失 this
class MyComponent extends React.Component {
  render() {
    const { handleClick } = this;
    return <button onClick={handleClick}>Click</button>;
  }
}

// ✅ 在构造函数绑定
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    console.log(this);
  }
  render() {
    const { handleClick } = this;
    return <button onClick={handleClick}>Click</button>;
  }
}

// ✅ 或使用箭头函数属性
class MyComponent extends React.Component {
  handleClick = () => {
    console.log(this);
  };
  render() {
    const { handleClick } = this;
    return <button onClick={handleClick}>Click</button>;
  }
}
```

**知识点：** `解构` `方法 this` `bind` `call` `apply`

:::
