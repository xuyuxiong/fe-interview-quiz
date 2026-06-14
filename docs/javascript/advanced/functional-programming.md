---
title: 函数式编程
description: 纯函数、高阶函数、柯里化、组合、immutable、函子、函数式 vs 面向对象等核心面试题
---

# 函数式编程

函数式编程是一种编程范式，强调使用纯函数、不可变数据和函数组合。理解函数式编程思想有助于编写更简洁、可维护的代码。

---

## 📝 题目

### Q1: 什么是纯函数？有什么好处？

> **⭐ 简单 · JavaScript**

```js
// 纯函数
function add(a, b) {
  return a + b;
}

// 非纯函数
let counter = 0;
function increment() {
  counter++;
  return counter;
}
```

请解释纯函数的特点和好处。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**纯函数特点：**
1. **相同输入 → 相同输出**
2. **没有副作用**（不修改外部状态）
3. **不依赖外部状态**

**好处：**
1. **可测试性**：输入输出确定，容易单元测试
2. **可缓存**：可以备忘录化（memoization）
3. **可组合**：易于函数组合
4. **并发安全**：没有竞态条件
5. **可预测**：容易理解和推理

**示例：**
```js
// 纯函数
const double = x => x * 2;

// 非纯函数（有副作用）
const global = [];
const push = x => {
  global.push(x);  // 修改外部状态
  return global;
};

// 非纯函数（依赖外部状态）
function getDate() {
  return new Date();  // 每次调用结果不同
}
```

**知识点：** `纯函数` `副作用` `可测试性`

:::

---

### Q2: 什么是高阶函数？

> **⭐ 简单 · JavaScript**

请解释高阶函数的概念，并列举 3 个常见的例子。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**高阶函数：** 接受函数作为参数或返回函数的函数。

**常见例子：**

**1. 数组方法：**
```js
[1, 2, 3].map(x => x * 2);
[1, 2, 3].filter(x => x > 1);
[1, 2, 3].reduce((acc, x) => acc + x, 0);
```

**2. 事件处理：**
```js
element.addEventListener('click', handler);
```

**3. 柯里化：**
```js
function add(a) {
  return function(b) {
    return a + b;
  };
}
```

**手写高阶函数示例：**
```js
// forEach
function forEach(arr, fn) {
  for (let i = 0; i < arr.length; i++) {
    fn(arr[i], i);
  }
}

// compose
function compose(...fns) {
  return function(x) {
    return fns.reduceRight((acc, fn) => fn(acc), x);
  };
}
```

**知识点：** `高阶函数` `函数参数` `函数返回`

:::

---

### Q3: 柯里化和偏函数有什么区别？

> **🔥 中等 · JavaScript**

```js
// 柯里化
const add = a => b => a + b;
add(1)(2);  // 3

// 偏函数
const add = (a, b) => a + b;
const addOne = add.bind(null, 1);
addOne(2);  // 3
```

请解释两者的区别和应用场景。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**柯里化（Currying）：**
- 将多参数函数转换为单参数函数链
- 每次只接收一个参数
- 返回新函数直到参数完整

**偏函数（Partial Application）：**
- 预先填充部分参数
- 返回接收剩余参数的函数
- 一次可以填充多个参数

**区别：**
```js
// 柯里化 - 逐参数
const curriedAdd = a => b => c => a + b + c;
curriedAdd(1)(2)(3);

// 偏函数 - 预填充
const partialAdd = (a, b, c) => a + b + c;
const add5 = partialAdd.bind(null, 5);
add5(2, 3);  // 10
```

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
```

**应用场景：**
- 柯里化：函数组合、参数复用
- 偏函数：配置预设、回调绑定

**知识点：** `柯里化` `偏函数` `函数应用`

:::

---

### Q4: compose 和 pipe 有什么区别？

> **🔥 中等 · JavaScript**

请实现 compose 和 pipe 函数，并说明区别。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**compose（从右到左）：**
```js
function compose(...fns) {
  return function(x) {
    return fns.reduceRight((acc, fn) => fn(acc), x);
  };
}

// 使用
const result = compose(f, g, h)(x);
// 等价于 f(g(h(x)))
```

**pipe（从左到右）：**
```js
function pipe(...fns) {
  return function(x) {
    return fns.reduce((acc, fn) => fn(acc), x);
  };
}

// 使用
const result = pipe(f, g, h)(x);
// 等价于 h(g(f(x)))
```

**区别：**
- **compose**：数学的标准组合方式，从右到左
- **pipe**：数据流方式，从左到右，更直观

**实际应用：**
```js
// 数据处理管道
const processData = pipe(
  filter(x => x.active),
  map(x => x.value),
  reduce((a, b) => a + b, 0)
);

// Redux 中间件（compose）
const middleware = compose(
  applyMiddleware(thunk),
  applyMiddleware(logger)
)(createStore);
```

**知识点：** `compose` `pipe` `函数组合`

:::

---

### Q5: 什么是不可变数据（immutable）？

> **⭐ 简单 · JavaScript**

```js
// 可变数据
const obj = { a: 1 };
obj.a = 2;  // 修改原对象

// 不可变数据
const obj = { a: 1 };
const newObj = { ...obj, a: 2 };  // 创建新对象
```

不可变数据有什么好处？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**不可变数据：** 创建后不能被修改的数据。

**好处：**
1. **可预测**：数据不会意外改变
2. **调试友好**：可以追踪数据变化
3. **性能优化**：引用相等快速判断
4. **并发安全**：没有锁的需求
5. **时间旅行**：保存历史状态

**实现方式：**
```js
// 1. 展开运算符
const newObj = { ...obj, a: 2 };
const newItems = [...items, newItem];

// 2. 不可变库
import { Map } from 'immutable';
const map = Map({ a: 1 });
const newMap = map.set('a', 2);

// 3. immer（可写不可变）
import produce from 'immer';
const newState = produce(state, draft => {
  draft.a = 2;  // 看似修改，实际创建新对象
});
```

**React 中的应用：**
```js
// 错误的可变更新
state.items.push(newItem);
setState({ items: state.items });  // React 可能不检测

// 正确的不可变更新
setState({ items: [...state.items, newItem] });
```

**知识点：** `不可变数据` `纯函数` `性能优化`

:::

---

### Q6: 什么是函子（Functor）？Monad 是什么？

> **💀 困难 · JavaScript**

请解释函数式编程中的函子和 Monad 概念。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**函子（Functor）：**
- 实现了 `map` 方法的数据结构
- map 保持结构不变，只变换内部值

```js
// Maybe 函子
class Maybe {
  constructor(value) {
    this.value = value;
  }
  
  static of(value) {
    return new Maybe(value);
  }
  
  map(fn) {
    if (this.value === null || this.value === undefined) {
      return this;
    }
    return Maybe.of(fn(this.value));
  }
}

// 使用
Maybe.of(5)
  .map(x => x * 2)  // Maybe(10)
  .map(x => x + 1);  // Maybe(11)
```

**Monad：**
- 实现了 `map` 和 `flatMap`（或 `chain`）的函子
- 可以处理嵌套的上下文

```js
// Maybe Monad
class Maybe {
  // ... map 实现
  
  flatMap(fn) {
    return this.map(fn).join();
  }
  
  join() {
    return this.value instanceof Maybe 
      ? this.value 
      : this;
  }
}
```

**常见 Monad：**
1. **Maybe/Monad**：处理 null/undefined
2. **Either**：错误处理
3. **Promise**：异步计算
4. **List**：多个值
5. **IO**：副作用

**知识点：** `函子` `Monad` `函数式`

:::

---

### Q7: 函数式编程 vs 面向对象编程

> **🔥 中等 · JavaScript**

请比较函数式编程和面向对象编程的区别。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

| 维度 | 函数式编程 | 面向对象 |
|------|-----------|---------|
| 基本单元 | 函数 | 对象 |
| 数据状态 | 不可变 | 可变 |
| 副作用 | 避免 | 允许 |
| 组合方式 | 函数组合 | 继承/多态 |
| 重点 | 做什么 | 谁来做 |
| 数据流向 | 管道 | 消息传递 |

**示例对比：**
```js
// 函数式
const activeUsers = users
  .filter(u => u.active)
  .map(u => u.name);

// 面向对象
class UserService {
  getActiveNames() {
    return this.users
      .filter(u => u.active)
      .map(u => u.name);
  }
}
```

**各自优势：**
- **函数式**：更易于测试、推理、并行
- **面向对象**：更直观、封装性好、适合复杂系统

**混合使用（推荐）：**
```js
class User {
  constructor(name, active) {
    // 不可变属性
    Object.assign(this, { name, active });
  }
  
  // 纯方法
  isActive() {
    return this.active;
  }
}
```

**知识点：** `函数式` `面向对象` `编程范式`

:::

---

### Q8: 函数式编程在 React 中的应用

> **🔥 中等 · JavaScript**

请说明函数式编程思想在 React 中的体现。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**函数式组件：**
```jsx
// 纯函数
function Counter({ count }) {
  return <div>{count}</div>;
}
// props 输入 → JSX 输出
```

**不可变状态：**
```jsx
// 正确：创建新对象
setState({ items: [...state.items, newItem] });

// 错误：修改原对象
state.items.push(newItem);
setState(state);
```

**高阶组件（HOC）：**
```jsx
// 函数作为参数和返回值
function withLoading(Component) {
  return function({ loading, ...props }) {
    if (loading) return <Spinner />;
    return <Component {...props} />;
  };
}
```

**Hooks 的函数式思想：**
```jsx
// 函数组合
function UserProfile() {
  const [user, loading] = useFetch('/user');
  const styles = useStyle();
  // ...
}

// 自定义 Hook = 函数组合
function useToggle(initial = false) {
  const [on, setOn] = useState(initial);
  const toggle = () => setOn(!on);
  return [on, toggle];
}
```

**Redux（函数式状态管理）：**
```js
// 纯函数 reducer
function reducer(state = init, action) {
  switch (action.type) {
    case 'ADD':
      return { ...state, count: state.count + 1 };
    default:
      return state;
  }
}
```

**知识点：** `React` `函数式组件` `Hooks`

:::

---

### Q9: 函数组合 (compose) 和管道 (pipe) 是什么？手写实现

> **🔥 中等 · JavaScript**

请解释函数组合和管道的概念，并手写实现它们。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**函数组合（compose）：** 将多个函数组合成一个新函数，从右到左执行。

**实现：**
```js
// compose - 从右到左
function compose(...fns) {
  return function(x) {
    return fns.reduceRight((acc, fn) => fn(acc), x);
  };
}

// 使用示例
const add1 = x => x + 1;
const double = x => x * 2;
const addThenDouble = compose(double, add1);
addThenDouble(5);  // (5 + 1) * 2 = 12
```

**管道（pipe）：** 从左到右执行函数，更符合数据流思维。

```js
// pipe - 从左到右
function pipe(...fns) {
  return function(x) {
    return fns.reduce((acc, fn) => fn(acc), x);
  };
}

// 使用示例
const addThenDouble = pipe(add1, double);
addThenDouble(5);  // (5 + 1) * 2 = 12
```

**实际应用场景：**

**1. 数据处理管道**
```js
const processData = pipe(
  data => data.filter(x => x.active),
  data => data.map(x => x.value),
  data => data.reduce((sum, val) => sum + val, 0)
);

const result = processData(users);
```

**2. 字符串处理**
```js
const formatName = pipe(
  str => str.trim(),
  str => str.toLowerCase(),
  str => str.replace(/\s+/g, '-'),
  str => str.replace(/[^a-z0-9-]/g, '')
);

formatName("  Hello World!  ");  // "hello-world"
```

**3. Redux 中间件组合**
```js
// Redux 使用 compose
import { compose } from 'redux';

const enhancer = compose(
  applyMiddleware(thunk),
  applyMiddleware(logger),
  applyMiddleware(crashReporter)
);
```

**compose vs pipe 选择建议：**
- **compose**：数学背景，习惯从内到外思考
- **pipe**：数据流思维，代码阅读顺序一致（推荐）

**知识点：** `函数组合` `compose` `pipe` `高阶函数`

:::

---

### Q10: 纯函数是什么？为什么重要？副作用有哪些？

> **🔥 中等 · JavaScript**

请详细解释纯函数的定义、重要性，以及常见的副作用类型。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**纯函数定义：**
1. **确定性**：相同输入永远返回相同输出
2. **无副作用**：不修改外部状态或依赖外部可变状态

**纯函数示例：**
```js
// 纯函数
const add = (a, b) => a + b;
const double = x => x * 2;
const greet = name => `Hello, ${name}!`;

// 特点：只依赖参数，返回值确定
```

**为什么重要？**

**1. 可测试性**
```js
// 纯函数 - 易测试
test('add(2, 3) === 5', () => {
  expect(add(2, 3)).toBe(5);  // 永远成立
});

// 非纯函数 - 难测试（依赖外部状态）
let counter = 0;
const increment = () => ++counter;  // 需要重置 counter
```

**2. 可缓存（Memoization）**
```js
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

// 纯函数可以安全缓存
const memoizedAdd = memoize(add);
```

**3. 可组合性**
```js
// 纯函数可以轻松组合
const transform = pipe(
  data => data.filter(x => x > 0),
  data => data.map(x => x * 2),
  data => data.reduce((a, b) => a + b, 0)
);
```

**4. 并发安全**
```js
// 纯函数没有竞态条件
// 多个线程同时调用结果是确定的
```

**5. 引用透明（Referential Transparency）**
```js
// 可以用返回值替换函数调用
const result = add(2, 3);
// 等价于
const result = 5;
```

**常见副作用类型：**

**1. 修改外部变量**
```js
let count = 0;
const increment = () => { count++; };  // 副作用
```

**2. 修改参数**
```js
const addProperty = (obj, key, value) => {
  obj[key] = value;  // 修改传入对象
  return obj;
};
```

**3. I/O 操作**
```js
const log = msg => console.log(msg);  // I/O 副作用
const save = data => fs.write(data);  // 文件系统
```

**4. 网络请求**
```js
const fetchData = async () => {
  const res = await fetch('/api');  // 网络副作用
  return res.json();
};
```

**5. 随机性**
```js
const random = () => Math.random();  // 相同输入不同输出
const now = () => Date.now();  // 依赖时间
```

**6. DOM 操作**
```js
const updateUI = () => {
  document.body.innerHTML = '<h1>Hello</h1>';
};
```

**消除副作用的模式：**

```js
// 不直接修改，返回新值
const addProperty = (obj, key, value) => ({
  ...obj,
  [key]: value
});

// 将副作用隔离
const program = () => {
  const pureResult = pureComputation(data);
  sideEffect(pureResult);  // 副作用集中处理
};
```

**知识点：** `纯函数` `副作用` `引用透明` `可测试性`

:::

---

### Q11: 函子 (Functor) 和单子 (Monad) 是什么？Maybe/Either 的应用

> **💀 困难 · JavaScript**

请解释函子和 Monad 的概念，以及 Maybe 和 Either 的实际应用。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**函子（Functor）：**

函子是一个实现了 `map` 方法的数据容器，满足以下定律：
1. **恒等律**：`F.map(x => x)` 等价于 `F`
2. **组合律**：`F.map(f).map(g)` 等价于 `F.map(x => g(f(x)))`

```js
// 最简单的函子 - Identity
class Identity {
  constructor(value) {
    this.value = value;
  }
  
  static of(value) {
    return new Identity(value);
  }
  
  map(fn) {
    return Identity.of(fn(this.value));
  }
}

// 使用
Identity.of(5)
  .map(x => x + 1)
  .map(x => x * 2);  // Identity(12)
```

**Maybe 函子：处理 null/undefined**

```js
class Maybe {
  constructor(value) {
    this.value = value;
  }
  
  static of(value) {
    return new Maybe(value);
  }
  
  map(fn) {
    if (this.value == null) return this;
    return Maybe.of(fn(this.value));
  }
  
  getOrElse(defaultValue) {
    return this.value == null ? defaultValue : this.value;
  }
}

// 使用场景：安全访问嵌套属性
const user = {
  profile: {
    address: {
      city: 'Beijing'
    }
  }
};

// 传统方式
const city1 = user && user.profile && user.profile.address && user.profile.address.city;

// Maybe 方式
const city2 = Maybe.of(user)
  .map(u => u.profile)
  .map(p => p.address)
  .map(a => a.city)
  .getOrElse('Unknown');
```

**Either 函子：错误处理**

```js
// Left 表示错误，Right 表示成功
class Left {
  constructor(value) {
    this.value = value;
  }
  map() { return this; }  // Left 保持不变
  getOrElse(defaultValue) { return defaultValue; }
}

class Right {
  constructor(value) {
    this.value = value;
  }
  map(fn) {
    return new Right(fn(this.value));
  }
  getOrElse(defaultValue) { return this.value; }
}

// 使用场景：错误处理
function divide(a, b) {
  if (b === 0) return new Left('除零错误');
  return new Right(a / b);
}

divide(10, 2).getOrElse(0);  // Right(5) → 5
divide(10, 0).getOrElse(0);  // Left → 0
```

**Monad：可链接的函子**

Monad 是实现了 `flatMap`（或 `chain`）的函子，可以处理嵌套的上下文。

```js
class Maybe {
  // ... 之前的实现

  flatMap(fn) {
    if (this.value == null) return this;
    return fn(this.value);  // fn 返回 Maybe
  }
}

// 使用场景：链式调用返回 Maybe 的函数
const getUser = id => Maybe.of({ id, name: 'User' });
const getEmail = user => Maybe.of(`${user.name}@example.com`);

getUser(1)
  .flatMap(getEmail)  // 返回 Maybe 而不是 Maybe(Maybe)
  .getOrElse('no-email');
```

**实际应用：**

**1. API 请求链**
```js
const fetchUser = id => Maybe.of({ id, name: 'User' });
const fetchPosts = user => Maybe.of(['post1', 'post2']);

// 链式调用
const posts = fetchUser(1)
  .flatMap(fetchPosts)
  .getOrElse([]);
```

**2. 表单验证**
```js
const validateEmail = email => 
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? new Right(email)
    : new Left('邮箱格式错误');

const result = validateEmail('test@example.com');
```

**知识点：** `函子` `Monad` `Maybe` `Either` `错误处理`

:::

---

### Q12: 什么是不可变数据？Immutable.js 和 Immer 的原理？

> **🔥 中等 · JavaScript**

请解释不可变数据的概念，以及 Immutable.js 和 Immer 的实现原理。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**不可变数据：**

不可变数据指创建后不能被修改的数据结构。任何"修改"操作都返回新对象。

```js
// 可变（不推荐）
const obj = { a: 1 };
obj.a = 2;  // 修改原对象

// 不可变（推荐）
const obj = { a: 1 };
const newObj = { ...obj, a: 2 };  // 创建新对象
```

**为什么需要不可变数据？**

**1. 可预测性**
```js
// 可变数据的问题
const state = { count: 0 };
const oldState = state;
state.count = 1;
console.log(oldState.count);  // 1（意外改变）
```

**2. 性能优化**
```js
// React 中的浅比较
shouldComponentUpdate(nextProps) {
  return nextProps.data !== this.props.data;
}
// 不可变数据可以用 === 快速判断是否变化
```

**3. 时间旅行调试**
```js
// 保存历史状态
const history = [state1, state2, state3];
// 可以回滚到任意历史状态
```

**Immutable.js 原理：**

**1. 结构共享（Structural Sharing）**
```js
import { Map } from 'immutable';

const map1 = Map({ a: 1, b: 2, c: 3 });
const map2 = map1.set('b', 50);

// map1 和 map2 共享未改变的节点 a 和 c
// 只创建新的 b 节点路径
```

**2. 持久化数据结构**
```
原始 Map:          修改后:
    ┌───┐              ┌───┐
    │ b │              │ b'│
    └─┬─┘              └─┬─┘
      │                   │
    ┌─┴─┐              ┌──┴──┐
    │   │              │     │
  ┌─┴─┐ └── a        ┌─┴─┐ └── a
  │   │              │   │
  c   d              c   d
（共享节点）
```

**3. Hash Array Mapped Trie (HAMT)**
```js
// 使用哈希和位运算定位数据
// O(log32 N) 的访问时间复杂度
```

**Immutable.js 使用：**
```js
import { Map, List, Set } from 'immutable';

// 创建
const map = Map({ a: 1, b: 2 });

// 修改（返回新对象）
const newMap = map.set('c', 3);
const anotherMap = map.delete('a');

// 深层修改
const deepMap = Map({ a: Map({ b: Map({ c: 1 }) }) });
const updated = deepMap.setIn(['a', 'b', 'c'], 100);

// List（不可变数组）
const list = List([1, 2, 3]);
const newList = list.push(4);
```

**Immer 原理：**

Immer 使用 **Copy-on-Write (COW)** 和 **Proxy** 实现可写不可变。

```js
import produce from 'immer';

const state = { a: 1, b: { c: 2 } };

const newState = produce(state, draft => {
  draft.a = 100;           // 看似修改，实际创建副本
  draft.b.c = 200;         // 深层修改也是安全的
});

// state 保持不变，newState 是修改后的新对象
```

**Immer 工作流程：**

1. **创建 Proxy**：包裹原始数据
2. **追踪修改**：记录所有写操作
3. **惰性拷贝**：只有被修改的路径才复制
4. **生成新对象**：结合原数据和修改生成新对象

```
原始数据 → Proxy 包装 → 拦截 set 操作
              ↓
        记录修改路径
              ↓
        应用修改到新结构
              ↓
        返回新对象
```

**Immer vs Immutable.js：**

| 特性 | Immutable.js | Immer |
|------|-------------|-------|
| API | 专用 API | 原生 JS 语法 |
| 学习曲线 | 陡 | 低 |
| 性能 | 优秀（大规模） | 良好 |
| 包体积 | ~17KB | ~5KB |
| 使用场景 | 大型复杂应用 | 通用场景 |

**实际选择建议：**
- **Redux 项目**：推荐 Immer（配合 Redux Toolkit）
- **大型数据表**：Immutable.js 性能更好
- **简单场景**：原生展开运算符即可

```js
// Redux Toolkit 内置 Immer
import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'user',
  initialState: { name: 'John' },
  reducers: {
    setName(state, action) {
      state.name = action.payload;  // 看起来可变，实际不可变
    }
  }
});
```

**知识点：** `不可变数据` `Immutable.js` `Immer` `结构共享` `性能优化`

:::

---

## 🔑 核心知识点总结

### 1. 核心概念

| 概念 | 含义 |
|------|------|
| 纯函数 | 无副作用，确定性输出 |
| 高阶函数 | 函数作为参数/返回值 |
| 柯里化 | 多参数转单参数链 |
| 不可变 | 数据创建后不修改 |

### 2. 函数组合

```js
compose(f, g, h)(x)  // f(g(h(x)))
pipe(f, g, h)(x)     // h(g(f(x)))
```

### 3. 函子/Monad

- **Functor**：有 map 方法
- **Monad**：有 flatMap 方法的 Functor

### 4. React 中的函数式

- 函数组件
- Hooks
- 不可变状态
- 纯 Reducer

## 💡 面试技巧

1. **纯函数**：记住两个特点
2. **柯里化**：能手写实现
3. **compose/pipe**：知道区别
4. **immutable**：理解好处
5. **React 应用**：能举例说明