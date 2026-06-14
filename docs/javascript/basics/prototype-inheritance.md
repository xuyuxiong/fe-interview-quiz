---
title: 原型与继承
description: 原型链、__proto__ vs prototype、new 原理、继承方式、Object.create、instanceof 等核心面试题
---

# 原型与继承

原型和继承是 JavaScript 面向对象编程的基石。理解原型链的工作机制对于深入学习 JavaScript 至关重要。

---

## 📝 题目

### Q1: 什么是原型链？原型链的终点是什么？

> **⭐ 简单 · JavaScript**

请解释原型链的概念，并说明以下代码中的原型链关系：
```js
function Person(name) {
  this.name = name;
}

const p = new Person('Alice');
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**原型链：** 每个对象都有一个内部属性 `[[Prototype]]`（可通过 `__proto__` 或 `Object.getPrototypeOf()` 访问），指向它的原型对象。当访问一个属性时，如果对象自身没有该属性，会沿着原型链向上查找。

**上述代码的原型链：**
```
p
 └─ [[Prototype]] → Person.prototype
                    └─ [[Prototype]] → Object.prototype
                                       └─ [[Prototype]] → null
```

**原型链终点：** `null`（`Object.prototype.__proto__` 为 `null`）

**知识点：** `原型链` `__proto__` ` prototype`

:::

---

### Q2: __proto__ 和 prototype 有什么区别？

> **⭐ 简单 · JavaScript**

```js
function Foo() {}
const foo = new Foo();

console.log(Foo.prototype);      // ?
console.log(foo.__proto__);      // ?
console.log(Foo.__proto__);      // ?
console.log(foo.prototype);      // ?
```

这些输出分别是什么？__proto__ 和 prototype 有什么区别？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
Foo.prototype      // Foo 的原型对象
Foo.prototype      // foo.__proto__ 指向 Foo.prototype
[Function: Function] // Foo.__proto__ 指向 Function.prototype
undefined          // 实例对象没有 prototype 属性
```

**💡 解析：**
**prototype：**
- 只有函数（构造函数）才有 `prototype` 属性
- 用于指定由该构造函数创建的实例的原型
- `prototype` 是一个对象，默认有 `constructor` 属性

**__proto__：**
- 每个对象都有 `__proto__` 属性（包括函数）
- 指向该对象的原型对象
- ES6 规范中称为 `[[Prototype]]`

**关系：**
```js
foo.__proto__ === Foo.prototype  // true
Foo.__proto__ === Function.prototype  // true
Function.prototype.__proto__ === Object.prototype  // true
```

**知识点：** `__proto__` ` prototype` `实例 vs 原型`

:::

---

### Q3: new 操作符的原理是什么？

> **🔥 中等 · JavaScript**

请解释 new 操作符的执行过程，并手动实现一个 myNew 函数。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**new 执行过程：**
1. 创建一个空对象
2. 将新对象的 `__proto__` 指向构造函数的 `prototype`
3. 将构造函数的 this 绑定到新对象并执行
4. 如果构造函数返回对象，则返回该对象；否则返回新对象

**手动实现：**
```js
function myNew(ctor, ...args) {
  // 1. 创建空对象，原型指向构造函数的 prototype
  const obj = Object.create(ctor.prototype);
  
  // 2. 执行构造函数，this 绑定到新对象
  const result = ctor.apply(obj, args);
  
  // 3. 如果构造函数显式返回对象或函数，则返回该值；否则返回新对象
  return (result !== null && typeof result === 'object') || typeof result === 'function'
    ? result
    : obj;
}

// 测试
function Person(name, age) {
  this.name = name;
  this.age = age;
}
Person.prototype.sayHi = function() {
  console.log(`Hi, I'm ${this.name}`);
};

const p = myNew(Person, 'Alice', 25);
console.log(p.name);  // Alice
p.sayHi();           // Hi, I'm Alice
```

**知识点：** `new 操作符` `原型绑定` `构造函数`

:::

---

### Q4: JavaScript 有哪几种继承方式？

> **🔥 中等 · JavaScript**

请列举 JavaScript 中的继承方式，并说明各自的优缺点。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**1. 原型链继承：**
```js
function Parent() {
  this.name = 'parent';
  this.colors = ['red', 'blue'];
}
function Child() {}
Child.prototype = new Parent();
```
- **优点**：简单
- **缺点**：引用类型共享；无法传参

**2. 构造函数继承：**
```js
function Child() {
  Parent.call(this);
}
```
- **优点**：可传参；不共享引用类型
- **缺点**：无法继承原型方法

**3. 组合继承（最常用）：**
```js
function Child(name, age) {
  Parent.call(this, name);  // 第二次调用 Parent
  this.age = age;
}
Child.prototype = new Parent();       // 第一次调用 Parent
Child.prototype.constructor = Child;
```
- **优点**：结合原型链继承和构造函数继承的优点
- **缺点**：父类构造函数调用了两次（`new Parent()` 和 `Parent.call(this)`）

**4. 寄生组合继承（最优）：**
```js
function Child(name, age) {
  Parent.call(this, name);  // 只调用一次 Parent
  this.age = age;
}
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;
```
- **优点**：只调用一次父类构造函数，避免多余的属性初始化

**5. class 继承（ES6）：**
```js
class Child extends Parent {
  constructor() {
    super();
  }
}
```

**知识点：** `继承方式` `原型链` `组合继承`

:::

---

### Q5: Object.create 的原理是什么？

> **⭐ 简单 · JavaScript**

```js
const parent = {
  name: 'parent',
  greet() {
    console.log(`Hi, ${this.name}`);
  }
};

const child = Object.create(parent);
child.name = 'child';

console.log(child.name);
child.greet();
console.log(Object.getPrototypeOf(child) === parent);
```

Object.create 做了什么？有什么用途？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
child               // 自身属性
Hi, child          // this 指向 child
true               // child 的原型是 parent
```

**💡 解析：**
**Object.create(proto) 作用：**
- 创建一个新对象
- 新对象的 `__proto__` 指向传入的 `proto`
- 可选的第二个参数用于定义属性描述符

**手动实现：**
```js
function myCreate(proto) {
  function F() {}
  F.prototype = proto;
  return new F();
}
```

**使用场景：**
1. 原型继承（寄生组合继承）
2. 创建没有原型的对象：`Object.create(null)`
3. 工厂模式创建对象

**知识点：** `Object.create` `原型链` `原型继承`

:::

---

### Q6: instanceof 的原理是什么？

> **🔥 中等 · JavaScript**

```js
function Parent() {}
function Child() {}
Child.prototype = new Parent();

const c = new Child();
console.log(c instanceof Child);
console.log(c instanceof Parent);
console.log(c instanceof Object);
```

输出是什么？请手写实现 instanceof。

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
true
true
true
```

**💡 解析：**
**instanceof 原理：**
检查构造函数的 `prototype` 是否存在于对象的原型链上。

**手动实现：**
```js
function myInstanceof(obj, ctor) {
  // 获取构造函数的 prototype
  const proto = ctor.prototype;
  
  // 获取对象的原型
  let objProto = Object.getPrototypeOf(obj);
  
  // 沿着原型链查找
  while (objProto !== null) {
    if (objProto === proto) {
      return true;
    }
    objProto = Object.getPrototypeOf(objProto);
  }
  
  return false;
}

// 测试
console.log(myInstanceof(c, Child));   // true
console.log(myInstanceof(c, Parent));  // true
console.log(myInstanceof(c, Object));  // true
```

**注意点：**
- 基本类型用 typeof 判断
- instanceof 可被 `Symbol.hasInstance` 自定义

**知识点：** `instanceof` `原型链检查` `类型判断`

:::

---

### Q7: class 语法糖的本质是什么？

> **⭐ 简单 · JavaScript**

```js
class Person {
  constructor(name) {
    this.name = name;
  }
  
  sayHi() {
    console.log(`Hi, ${this.name}`);
  }
  
  static create(name) {
    return new Person(name);
  }
}

console.log(typeof Person);
console.log(Person.create);
console.log(new Person('A'));
```

class 的本质是什么？与普通构造函数有什么区别？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
function
[Function: create]
Person { name: 'A' }
```

**💡 解析：**
**class 是语法糖：** ES6 class 本质上还是基于原型的语法糖。

```js
// class 语法
class Person {
  constructor(name) {
    this.name = name;
  }
  sayName() {}
}

// 等价的构造函数
function Person(name) {
  this.name = name;
}
Person.prototype.sayName = function() {};
```

**class 的特点：**
1. 必须用 `new` 调用（否则报 TypeError）
2. 不可提升
3. 默认进入严格模式
4. 方法不可枚举
5. 支持 `extends` 继承
6. 支持 `static` 静态方法
7. 支持 getter/setter

**知识点：** `class` `语法糖` `原型等价`

:::

---

### Q8: 如何实现多重继承？

> **💀 困难 · JavaScript**

JavaScript 不支持多重继承，但有多种方式实现类似效果。请展示几种方式。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**方式 1：混入（Mixin）模式**
```js
const WalkMixin = {
  walk() {
    console.log(`${this.name} is walking`);
  }
};

const TalkMixin = {
  talk() {
    console.log(`${this.name} is talking`);
  }
};

class Person {}
Object.assign(Person.prototype, WalkMixin, TalkMixin);

const p = new Person();
p.name = 'Alice';
p.walk();
p.talk();
```

**方式 2：多原型组合**
```js
function mix(parents) {
  return parents.reduce((childClass, parent) => {
    return class extends parent {
      constructor(...args) {
        super(...args);
        parents.forEach(p => {
          if (p !== parent && p.prototype !== childClass.prototype) {
            Object.getOwnPropertyNames(p.prototype).forEach(name => {
              if (name !== 'constructor') {
                childClass.prototype[name] = p.prototype[name];
              }
            });
          }
        });
      }
    };
  }, Object);
}
```

**方式 3：组合优于继承**
```js
class Walker {
  walk() { console.log('walking'); }
}
class Talker {
  talk() { console.log('talking'); }
}
class Person {
  constructor() {
    this.walker = new Walker();
    this.talker = new Talker();
  }
}
```

**知识点：** `多重继承` `Mixin` `组合模式`

:::

---

### Q9: 为什么修改子类原型不会影响父类？

> **🔥 中等 · JavaScript**

```js
class Parent {
  greet() {
    console.log('Hello from parent');
  }
}

class Child extends Parent {}

const c = new Child();
c.greet();

// 修改 Child 的原型方法
Child.prototype.greet = function() {
  console.log('Hello from child');
};

c.greet();  // ?

// Parent 的实例？
const p = new Parent();
p.greet();  // ?
```

输出是什么？为什么？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
Hello from parent   // 调用父类方法
Hello from child    // 调用重写后的方法
Hello from parent   // 父类不受影响
```

**💡 解析：**
**原型链查找规则：**
1. 先查找对象自身
2. 再查找对象的直接原型（Child.prototype）
3. 沿着原型链向上（Parent.prototype）
4. 直到 Object.prototype

**extends 原理：**
```js
class Child extends Parent {}
// 等价于
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;
```

**关键点：**
- Child.prototype 是通过 `Object.create(Parent.prototype)` 创建的
- 修改 Child.prototype 不会影响 Parent.prototype
- 原型链是单向的，子类的修改不会影响父类

**知识点：** `原型链查找` `extends` `原型继承`

:::

---

### Q10: 箭头函数可以作为构造函数吗？

> **⭐ 简单 · JavaScript**

```js
const Arrow = (name) => {
  this.name = name;
};

try {
  const a = new Arrow('test');
  console.log(a);
} catch (e) {
  console.log('Error:', e.message);
}
```

这段代码会输出什么？为什么？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
Error: Arrow is not a constructor
```

**💡 解析：**
**箭头函数不能作为构造函数的原因：**

1. **没有 [[Construct]] 内部方法**：new 操作符需要调用这个内部方法
2. **没有 prototype 属性**：
   ```js
   const fn = () => {};
   console.log(fn.prototype);  // undefined
   ```
3. **this 是词法绑定**：箭头函数的 this 在定义时就确定了，不能在 new 时绑定新对象

**可以调用的对象特征：**
```js
// 普通函数有 [[Construct]]
function Fn() {}
console.log(Fn.prototype);  // {}
console.log(new Fn());      // Fn {}

// 箭头函数没有
const Arrow = () => {};
console.log(Arrow.prototype);  // undefined
```

**知识点：** `箭头函数` `构造函数` `new 操作符`

:::

---

## 🔑 核心知识点总结

### 1. 原型链结构

```
instance → Constructor.prototype → Object.prototype → null
```

### 2. 关键关系

```js
fn.__proto__ === Function.prototype
obj.__proto__ === Constructor.prototype
Constructor.prototype.constructor === Constructor
```

### 3. 继承方式对比

| 方式 | 优点 | 缺点 |
|------|------|------|
| 原型链 | 简单 | 引用共享，不能传参 |
| 构造函数 | 不共享，可传参 | 不能继承原型 |
| 组合 | 结合优点 | 调用两次构造函数 |
| 寄生组合 | 只调用一次 | 稍复杂 |
| class extends | 语法简洁 | 本质是语法糖 |

### 4. instanceof 检查

检查构造函数 prototype 是否在对象原型链上

## 💡 面试技巧

1. **原型链图示**：面试时可以画图说明
2. **手写实现**：准备 new、instanceof、Object.create 的实现
3. **对比记忆**：__proto__ vs prototype、instanceof vs typeof
4. **class 理解**：知道它是语法糖，本质还是原型
5. **继承选择**：知道各种继承方式的特点
---

### Q11: __proto__ 和 prototype 的区别？

> **🔥 中等 · JavaScript**

请说明 __proto__ 和 prototype 的区别。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心区别：**
- **prototype** 是函数特有的属性，用于设置实例的_proto__
- **__proto__** 是对象内部的 [[Prototype]] 链接，指向原型对象

**图示关系：**
```js
function Person(name) {
  this.name = name;
}

const p = new Person('Alice');

// Person.prototype 是 Person 函数的属性
// p.__proto__ 指向 Person.prototype
p.__proto__ === Person.prototype;  // true

// Person.prototype.__proto__ 指向 Object.prototype
Person.prototype.__proto__ === Object.prototype;  // true

// Object.prototype.__proto__ 是 null（原型链终点）
Object.prototype.__proto__ === null;  // true
```

**prototype 特点：**
```js
// 只有函数有 prototype
function Fn() {}
Fn.prototype;  // { constructor: Fn }

const obj = {};
obj.prototype;  // undefined

// 箭头函数没有 prototype
const arrow = () => {};
arrow.prototype;  // undefined
```

**__proto__ 特点：**
```js
// 所有对象都有 __proto__（非标准但广泛支持）
const obj = {};
obj.__proto__ === Object.prototype;  // true

// 标准写法：Object.getPrototypeOf
Object.getPrototypeOf(obj) === Object.prototype;  // true

// 设置原型
Object.setPrototypeOf(obj, Array.prototype);
```

**注意事项：**
- `__proto__` 是历史遗留属性，推荐使用 `Object.getPrototypeOf/SetPrototypeOf`
- 修改 `_proto__` 性能差，应避免

**知识点：** `__proto__` `prototype` `原型链` `继承`

:::

---

### Q12: Object.create(null) 创建的对象有什么特点？有什么用途？

> **🔥 中等 · JavaScript**

请说明 Object.create(null) 的特点和使用场景。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Object.create(null) 创建的对象：**
- **没有原型链**：`__proto__` 是 `null`
- **没有内置方法**：如 toString、hasOwnProperty 等
- **纯字典对象**：不会有任何继承属性

**与普通对象对比：**
```js
const normal = {};
const pure = Object.create(null);

// normal 有原型方法
normal.toString();  // '[object Object]'
normal.hasOwnProperty('key');  // true

// pure 没有原型方法
pure.toString();  // ❌ TypeError
pure.hasOwnProperty('key');  // ❌ TypeError
```

**使用场景：**

**1. 安全的字典/映射：**
```js
// ❌ 普通对象作为 Map 的问题
const map = {};
map.toString = 123;  // 覆盖了内置方法
map['constructor'];  // 可能有问题

// ✅ 纯对象作为字典
const dict = Object.create(null);
dict['toString'] = 123;  // 安全
dict['constructor'] = 456;  // 安全
```

**2. 避免原型污染：**
```js
// 用户输入作为 key
function createUserObject(input) {
  // ❌ 原型污染风险
  const obj = {};
  for (let key in input) {
    obj[key] = input[key];
  }
  
  // ✅ 避免污染
  const obj = Object.create(null);
  for (let key in input) {
    obj[key] = input[key];
  }
}
```

**3. 性能优化：**
```js
// 在没有原型链干扰的场景，纯对象访问更快
const cache = Object.create(null);
function memoize(key, value) {
  cache[key] = value;  // 不会与原型属性冲突
}
```

**检查对象是否为纯字典：**
```js
function isPlainObject(obj) {
  return Object.getPrototypeOf(obj) === null;
}

// 或使用 constructor 检查
function isPlainObject(obj) {
  if (typeof obj !== 'object') return false;
  const proto = Object.getPrototypeOf(obj);
  return proto === null || proto === Object.prototype;
}
```

**知识点：** `Object.create` `原型` `字典对象` `原型污染`

:::

---

### Q13: 如何判断两个对象是否属于同一个原型链？

> **🔥 中等 · JavaScript**

请说明检查对象原型链关系的方法。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**方法 1：instanceof 运算符**
```js
function Person() {}
const p = new Person();

p instanceof Person;  // true
p instanceof Object;  // true（原型链向上查找）

[] instanceof Array;   // true
[] instanceof Object;  // true
```

**方法 2：isPrototypeOf 方法**
```js
function Person() {}
Person.prototype.sayHi = function() {};
const p = new Person();

Person.prototype.isPrototypeOf(p);  // true
Object.prototype.isPrototypeOf(p);  // true
```

**方法 3：Object.getPrototypeOf 遍历**
```js
function isInPrototypeChain(obj, proto) {
  let current = Object.getPrototypeOf(obj);
  while (current !== null) {
    if (current === proto) return true;
    current = Object.getPrototypeOf(current);
  }
  return false;
}

// 使用
isInPrototypeChain(p, Person.prototype);  // true
```

**方法 4：检查构造函数**
```js
function getConstructorName(obj) {
  return obj?.constructor?.name;
}

const arr = [];
getConstructorName(arr);  // 'Array'
```

**注意跨 iframe 问题：**
```js
// 不同 iframe 的构造函数不同
// iframe 中的 [] instanceof Array 可能是 false
// 应使用 Object.prototype.toString
Object.prototype.toString.call([]);  // '[object Array]'
```

**实际应用：**
```js
// 类型检查
function isArrayLike(obj) {
  return obj != null && 
         typeof obj.length === 'number' &&
         !(obj instanceof Function);
}

// 判断是否来自同一构造函数
function sameConstructor(a, b) {
  return a?.constructor === b?.constructor;
}
```

**知识点：** `instanceof` `isPrototypeOf` `原型链` `构造函数`

:::

---

### Q14: ES6 class 和 ES5 构造函数的继承有什么本质区别？

> **💀 困难 · JavaScript**

请说明 ES6 class 与 ES5 构造函数继承的区别。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**ES5 构造函数继承：**
```js
function Parent(name) {
  this.name = name;
}
Parent.prototype.sayName = function() {
  console.log(this.name);
};

function Child(name, age) {
  Parent.call(this, name);  // 调用父类构造函数
  this.age = age;
}
Child.prototype = Object.create(Parent.prototype);  // 继承原型
Child.prototype.constructor = Child;

const c = new Child('Alice', 25);
c.sayName();  // Alice
```

**ES6 class 继承：**
```js
class Parent {
  constructor(name) {
    this.name = name;
  }
  sayName() {
    console.log(this.name);
  }
}

class Child extends Parent {
  constructor(name, age) {
    super(name);  // ✅ 必须先调用 super
    this.age = age;
  }
}

const c = new Child('Alice', 25);
c.sayName();  // Alice
```

**本质区别：**

**1. this 初始化顺序：**
```js
// ES5：先创建 this，再调用父类
function Child() {
  // this 已创建
  Parent.call(this);  // 修改 this
}

// ES6：先创建父类 this，再扩展
class Child extends Parent {
  constructor() {
    // this 不存在
    super();  // ✅ 创建 this
    // 现在才能使用 this
    this.x = 1;
  }
}
```

**2. 子类必须调用 super：**
```js
// ES6 中，子类 constructor 必须调用 super()
class Child extends Parent {
  constructor() {
    // ❌ 不调用 super 会报错
    this.x = 1;
  }
}
```

**3. static 方法继承：**
```js
class Parent {
  static create() {
    return new this();
  }
}

class Child extends Parent {}

Child.create() instanceof Child;  // true
// this 指向调用者（Child），不是 Parent
```

**4. 内置类继承差异：**
```js
// ES5 继承内置类有问题
function MyArray() {
  Array.call(this);
}
MyArray.prototype = Object.create(Array.prototype);

const arr = new MyArray();
arr.push(1);
arr instanceof MyArray;  // true
// 但内部 [[Class]] 可能不对

// ES6 正确支持内置类继承
class MyArray extends Array {}
const arr = new MyArray();
arr.push(1);
arr instanceof MyArray;  // true
```

**知识点：** `ES6 class` `ES5 继承` `super` `原型继承` `构造函数`

:::
