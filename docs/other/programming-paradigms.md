---
title: 编程范式与工程思维面试题
description: 面向过程、面向对象、函数式编程、pnpm 等工程化思维面试题
---

# 编程范式与工程思维面试题

### Q1: 面向过程、面向对象、函数式编程的区别？

> **🔥 中等 · 编程范式**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 维度 | 面向过程 | 面向对象 | 函数式编程 |
|------|---------|---------|-----------|
| 核心 | 步骤和流程 | 对象和交互 | 纯函数和数据变换 |
| 数据 | 全局共享 | 封装在对象中 | 不可变 |
| 状态 | 可变 | 封装 | 避免共享状态 |
| 复用 | 函数调用 | 继承/组合 | 函数组合 |
| 副作用 | 允许 | 允许 | 尽量避免 |
| 典型语言 | C | Java/C++ | Haskell/Scala |
| JS 风格 | 过程式 | 原型链/Class | 高阶函数/纯函数 |

```js
// 面向过程 — 关注步骤
function getTotal(items) {
  let total = 0
  for (let i = 0; i < items.length; i++) {
    if (items[i].stock > 0) {
      total += items[i].price * items[i].quantity
    }
  }
  return total
}

// 面向对象 — 关注对象和交互
class ShoppingCart {
  constructor() { this.items = [] }
  addItem(item) { this.items.push(item) }
  getTotal() {
    return this.items
      .filter(item => item.inStock())
      .reduce((sum, item) => sum + item.subtotal(), 0)
  }
}

// 函数式编程 — 关注数据变换
const getTotal = (items) =>
  items
    .filter(item => item.stock > 0)
    .map(item => item.price * item.quantity)
    .reduce((sum, subtotal) => sum + subtotal, 0)
```

**JS 是多范式语言：**

```js
// JS 常见函数式用法
const result = [1, 2, 3, 4, 5]
  .filter(n => n % 2 === 0)     // 纯函数
  .map(n => n * 2)              // 不可变
  .reduce((sum, n) => sum + n)  // 组合

// 函数组合
const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x)
const add1 = x => x + 1
const double = x => x * 2
const add1ThenDouble = compose(double, add1)
add1ThenDouble(3) // 8
```

**知识点：** `面向过程` `面向对象` `函数式编程` `纯函数` `不可变性` `函数组合`

:::

### Q2: 为什么 pnpm 这么快？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**pnpm 快的三大核心原理：**

**1. 内容寻址存储（Content-Addressable Storage）**

```text
传统 npm/yarn:
  node_modules/react/     → 复制一份到项目 A
  node_modules/react/     → 又复制一份到项目 B
  10 个项目 = 10 份 react

pnpm:
  .pnpm-store/react@18.2.0/  → 只存一份（硬链接）
  项目 A/node_modules/react   → 硬链接指向 store
  项目 B/node_modules/react   → 硬链接指向 store
  10 个项目 = 1 份 react（磁盘空间节省 70%+）

硬链接：同一磁盘数据，多个文件名指向同一 inode
  - 不占用额外空间
  - 删除项目不影响 store
  - 安装速度极快（只创建链接，不复制文件）
```

**2. 符号链接 + 嵌套结构（严格的依赖隔离）**

```text
pnpm 的 node_modules 结构:
node_modules/
  .pnpm/                    ← 所有包的实际位置
    react@18.2.0/
      node_modules/
        react/              ← react 包
        prop-types@15.8.1/  ← react 的依赖
    lodash@4.17.21/
      node_modules/
        lodash/
  react -> .pnpm/react@18.2.0/node_modules/react  ← 符号链接
  lodash -> .pnpm/lodash@4.17.21/node_modules/lodash

效果：
  - 只能访问 package.json 声明的依赖
  - 防止"幽灵依赖"（偷偷引用未声明的包）
  - 扁平访问 + 严格隔离
```

**3. 并发安装 + 流式下载**

```text
npm:  串行下载包 → 一个接一个
yarn: 并行下载（有限） → 并发但有锁
pnpm: 完全并发 + 流式 → 最大并行度 + 小包优先
```

| 对比 | npm | yarn | pnpm |
|------|-----|------|------|
| 磁盘空间 | 高（每项目独立） | 高 | 低（全局 store 共享） |
| 安装速度 | 慢 | 较快 | 最快 |
| 幽灵依赖 | 有 | 有 | 无 |
| Monorepo | workspaces | workspaces | workspace + 原生支持 |
| 严格性 | 弱 | 弱 | 强 |

**知识点：** `pnpm` `硬链接` `符号链接` `内容寻址存储` `幽灵依赖` `依赖隔离`

:::

### Q3: event loop 时序题：下列代码输出什么？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
console.log('1')
setTimeout(() => console.log('2'), 0)
Promise.resolve().then(() => console.log('3'))
  .then(() => console.log('4'))
async function foo() {
  console.log('5')
  await Promise.resolve()
  console.log('6')
}
foo()
console.log('7')

// 输出：1 5 7 3 6 4 2
```

**执行流程：**

```text
1. 同步代码：console.log('1') → 输出 1
2. setTimeout → 宏任务队列
3. Promise.resolve().then() → 微任务队列
4. foo() 同步部分：console.log('5') → 输出 5
5. await 暂停，后续代码加入微任务队列
6. console.log('7') → 输出 7
7. 清空微任务队列：3 → 6 → 4
8. 执行宏观任务：2
```

| 分类 | 示例 | 执行时机 |
|------|------|---------|
| 同步代码 | console.log | 立即执行 |
| 微任务 | Promise.then, await 后续，queueMicrotask | 同步代码后，宏任务前 |
| 宏任务 | setTimeout, setInterval, I/O | 下一轮事件循环 |

**知识点：** `Event Loop` `微任务` `宏任务` `async/await` `执行时序`

:::

### Q4: ES7/ES8/ES9/ES10/ES11 有哪些新特性？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 版本 | 年份 | 新特性 |
|------|------|--------|
| ES2016(ES7) | 2017 | `Array.includes`、指数运算符 `**` |
| ES2017(ES8) | 2017 | `async/await`、`Object.values/entries`、`String.padStart/padEnd`、`Object.getOwnPropertyDescriptors` |
| ES2018(ES9) | 2018 | 异步迭代 `for await...of`、对象扩展运算符 `...`、`Promise.finally`、正具名捕获组 |
| ES2019(ES10) | 2019 | `Array.flat/flatMap`、`Object.fromEntries`、`String.trimStart/trimEnd`、`Symbol.description`、`try...catch` 可省略参数 |
| ES2020(ES11) | 2020 | 可选链 `?.`、空值合并 `??`、`Promise.allSettled`、`BigInt`、`globalThis`、`import()` 动态导入 |
| ES2021(ES12) | 2021 | 逻辑赋值 `||=`/`&&=`/`??=`、`String.replaceAll`、`Promise.any`、数字分隔符 `1_000` |
| ES2022(ES13) | 2022 | 顶层 `await`、`Object.hasOwn`、`Array.at()`、`Error.cause`、类字段 |
| ES2023(ES14) | 2023 | `Array.findLast/findLastIndex`、`Hashbang 语法`、`Symbols as WeakMap keys` |

```js
// ES7
[1, 2, 3].includes(2)   // true
2 ** 10                   // 1024

// ES8
Object.values({ a: 1, b: 2 })   // [1, 2]
Object.entries({ a: 1, b: 2 })  // [['a',1],['b',2]]
'hello'.padStart(10, 'x')       // 'xxxxxhello'

// ES2019
[1, [2, [3]]].flat(Infinity)    // [1, 2, 3]
Object.fromEntries([['a', 1]])  // { a: 1 }

// ES2020
const name = user?.profile?.name ?? 'unknown'
await Promise.allSettled([p1, p2, p3])  // 永不 reject

// ES2022
const arr = [1, 2, 3]
arr.at(-1)  // 3（等价于 arr[arr.length - 1]）
```

**知识点：** `ECMAScript` `ES 新特性` `includes` `async/await` `可选链` `空值合并`

:::

### Q5: 函数式编程和面向对象编程的对比？各自的优劣势？

> **🔥 中等 · 编程范式**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心对比：**

| 维度 | 面向对象 (OOP) | 函数式编程 (FP) |
|------|----------------|------------------|
| 核心单元 | 对象 (Object) | 函数 (Function) |
| 状态管理 | 封装在对象内部，可变 | 不可变数据，避免共享状态 |
| 数据流 | 通过方法修改对象状态 | 通过函数转换数据 |
| 副作用 | 允许（方法可修改状态） | 尽量避免（纯函数） |
| 复用方式 | 继承、组合、多态 | 函数组合、高阶函数 |
| 执行顺序 | 命令式，有明确顺序 | 声明式，关注"做什么" |
| 典型语言 | Java、C++、C# | Haskell、Scala、Erlang |
| JS 代表 | Class、Prototype | Map/Filter/Reduce、Immutable.js |

**OOP 优势：**
```js
// 1. 封装性好 — 数据和行为绑定
class ShoppingCart {
  constructor() {
    this._items = []  // 私有数据
    this._discount = 1
  }
  
  addItem(item) {     // 公开方法
    this._items.push(item)
  }
  
  getTotal() {
    return this._items.reduce((sum, i) => sum + i.price, 0) * this._discount
  }
  
  applyDiscount(code) {  // 内部逻辑隐藏
    if (isValidCode(code)) {
      this._discount = 0.9
    }
  }
}

// 2. 多态性 — 统一接口，不同实现
class Payment {
  pay(amount) { throw 'Abstract' }
}
class Alipay extends Payment {
  pay(amount) { console.log(`支付宝支付￥${amount}`) }
}
class WechatPay extends Payment {
  pay(amount) { console.log(`微信支付￥${amount}`) }
}
```

**FP 优势：**
```js
// 1. 纯函数 — 可测试、可预测、可缓存
const double = x => x * 2  // 相同输入永远得到相同输出
double(5)  // 10
double(5)  // 10（可缓存结果）

// 2. 不可变性 — 避免副作用
const original = [1, 2, 3]
const modified = [...original, 4]  // 不修改原数组
console.log(original)  // [1, 2, 3] 保持不变

// 3. 函数组合 — 构建复杂逻辑
const compose = (...fns) => (x) => fns.reduceRight((v, f) => f(v), x)
const add1 = x => x + 1
const double = x => x * 2
const transform = compose(double, add1)  // (x + 1) * 2
transform(5)  // 12

// 4. 链式调用 — 清晰的数据流
const result = [1, 2, 3, 4, 5]
  .filter(n => n % 2 === 0)    // [2, 4]
  .map(n => n * 10)            // [20, 40]
  .reduce((sum, n) => sum + n, 0)  // 60
```

**OOP 劣势：**
- 继承层次过深导致代码耦合
- 对象状态变化难以追踪
- 多线程环境下需要额外同步机制

**FP 劣势：**
- 学习曲线陡峭（尤其是 Monad 等概念）
- 过度使用可能降低可读性
- 某些场景性能开销较大（不可变数据结构）

**实际项目中的混合使用：**
```js
// React 是 OOP + FP 混合的典型
// Class Component — OOP 风格
class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { count: 0 }  // 封装状态
  }
}

// Function Component + Hooks — FP 风格
function Counter() {
  const [count, setCount] = useState(0)  // 不可变更新
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

**知识点：** `OOP` `函数式编程` `纯函数` `不可变性` `封装` `函数组合`

:::

### Q6: 响应式编程（Reactive Programming）是什么？RxJS 的核心概念？

> **🔥 中等 · 编程范式**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**响应式编程定义：** 面向异步数据流的编程范式，核心思想是"数据变化时自动传播和更新"。

**RxJS 核心概念：**

**1. Observable（可观察对象）— 数据流**
```js
import { Observable } from 'rxjs'

const stream$ = new Observable(subscriber => {
  subscriber.next(1)      // 发送数据
  setTimeout(() => subscriber.next(2), 1000)
  setTimeout(() => subscriber.complete(), 2000)  // 完成
})

// 订阅（开始消费数据流）
stream$.subscribe({
  next: value => console.log(value),  // 1, 2
  complete: () => console.log('完成')
})
```

**2. Observer（观察者）— 订阅者**
```js
const observer = {
  next: value => console.log('收到:', value),
  error: err => console.error('错误:', err),
  complete: () => console.log('完成')
}
observable$.subscribe(observer)
```

**3. 操作符（Operators）— 数据转换**
```js
import { fromEvent } from 'rxjs'
import { map, filter, debounceTime, distinctUntilChanged } from 'rxjs/operators'

// 搜索框即时搜索（防抖 + 去重）
const input$ = fromEvent(document.querySelector('input'), 'input')
const search$ = input$.pipe(
  map(e => e.target.value),      // 提取输入值
  filter(text => text.length > 2), // 过滤短词
  debounceTime(300),              // 防抖 300ms
  distinctUntilChanged()          // 去重
)
search$.subscribe(query => fetchResults(query))
```

**4. 常用操作符分类：**

| 类别 | 操作符 | 说明 |
|------|--------|------|
| 创建 | `of`, `from`, `fromEvent`, `interval` | 创建 Observable |
| 转换 | `map`, `scan`, `pluck` | 转换数据 |
| 过滤 | `filter`, `debounceTime`, `throttle`, `distinct` | 筛选数据 |
| 组合 | `merge`, `concat`, `combineLatest`, `zip` | 合并多个流 |
| 错误处理 | `catchError`, `retry`, `retryWhen` | 错误恢复 |
| 多播 | `share`, `shareReplay`, `publish` | 共享流 |

**5. 实际应用场景：**

```js
// 场景 1: 搜索框自动完成（防抖 + 取消旧请求）
const searchResults = input$.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query =>  // 取消上一个请求
    from(fetch(`/api/search?q=${query}`))
  )
)

// 场景 2: 权重轮询（指数退避重试）
const apiRequest$ = from(fetchData()).pipe(
  retryWhen(errors =>
    errors.pipe(
      scan((retryCount, err) => {
        if (retryCount >= 3) throw err
        return retryCount + 1
      }, 0),
      delay(retryCount => Math.pow(2, retryCount) * 1000)  // 指数退避
    )
  )
)

// 场景 3: 表单验证（组合多个字段）
const username$ = fromEvent(usernameInput, 'input').pipe(map(e => e.target.value))
const password$ = fromEvent(passwordInput, 'input').pipe(map(e => e.target.value))

const isValid$ = combineLatest([username$, password$]).pipe(
  map(([user, pass]) => 
    user.length >= 3 && pass.length >= 8 && /[A-Z]/.test(pass)
  )
)

isValid$.subscribe(valid => {
  submitButton.disabled = !valid
})
```

**6. 冷 Observable vs 热 Observable：**

```js
// 冷 Observable — 每个订阅者独立执行
const cold$ = new Observable(sub => {
  console.log('开始执行')
  sub.next(Math.random())
})
cold$.subscribe(v => console.log('订阅 1:', v))  // 开始执行，随机数 A
cold$.subscribe(v => console.log('订阅 2:', v))  // 开始执行，随机数 B

// 热 Observable — 共享执行结果
const hot$ = cold$.pipe(share())
hot$.subscribe(v => console.log('订阅 1:', v))  // 开始执行，随机数 C
hot$.subscribe(v => console.log('订阅 2:', v))  // 相同随机数 C
```

**知识点：** `响应式编程` `RxJS` `Observable` `操作符` `数据流` `异步` `切换流`

:::

### Q7: 面向切面编程（AOP）在前端中的应用？（装饰器模式、日志/权限/性能切面）

> **🔥 中等 · 编程范式**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**AOP（面向切面编程）定义：** 将横切关注点（日志、权限、性能监控等）从业务逻辑中分离，实现解耦。

**核心概念：**

| 术语 | 说明 | 举例 |
|------|------|------|
| 切面 (Aspect) | 横切关注点的封装 | 日志模块、权限模块 |
| 连接点 (Join Point) | 程序执行的特定点 | 函数调用前后 |
| 通知 (Advice) | 在连接点执行的动作 | 前置通知、后置通知 |
| 切入点 (Pointcut) | 匹配连接点的规则 | 所有以 `handle` 开头的方法 |
| 织入 (Weaving) | 将切面应用到目标对象 | 装饰器自动注入 |

**AOP 实现方式：**

**方式 1：函数拦截（手动 AOP）**
```js
// 拦截器工厂
function createInterceptor(fn) {
  const beforeHooks = []
  const afterHooks = []
  
  return {
    before(hook) { beforeHooks.push(hook); return this },
    after(hook) { afterHooks.push(hook); return this },
    invoke(...args) {
      beforeHooks.forEach(hook => hook.apply(this, args))
      const result = fn.apply(this, args)
      afterHooks.forEach(hook => hook.call(this, result, ...args))
      return result
    }
  }
}

// 使用
function saveUser(data) { /* 保存用户逻辑 */ }
const saveUserWithAOP = createInterceptor(saveUser)
  .before(data => console.log('前置：参数校验', data))
  .before(data => console.log('前置：权限检查'))
  .after((result, data) => console.log('后置：记录日志', result))
  .after((result, data) => console.log('后置：性能监控'))

saveUserWithAOP.invoke({ name: '张三' })
```

**方式 2：装饰器（Decorator）— TypeScript**
```ts
// 日志切面
function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value
  descriptor.value = function(...args: any[]) {
    console.log(`[${propertyKey}] 调用参数:`, args)
    const result = original.apply(this, args)
    console.log(`[${propertyKey}] 返回结果:`, result)
    return result
  }
}

// 权限切面
function RequireAuth(roles: string[]) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value
    descriptor.value = function(...args: any[]) {
      const userRole = getCurrentUserRole()
      if (!roles.includes(userRole)) {
        throw new Error('权限不足')
      }
      return original.apply(this, args)
    }
  }
}

// 性能监控切面
function MeasurePerformance() {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const original = descriptor.value
    descriptor.value = function(...args: any[]) {
      const start = performance.now()
      const result = original.apply(this, args)
      const end = performance.now()
      console.log(`[${propertyKey}] 耗时：${(end - start).toFixed(2)}ms`)
      return result
    }
  }
}

// 应用装饰器
class UserService {
  @Log
  @RequireAuth(['admin', 'manager'])
  @MeasurePerformance()
  saveUser(data: any) {
    // 业务逻辑
    return { id: 123, ...data }
  }
}
```

**方式 3：Proxy 实现 AOP**
```js
// 通用 AOP 代理
function createAOPProxy(target, aspects = {}) {
  return new Proxy(target, {
    get(target, prop, receiver) {
      const originalMethod = target[prop]
      if (typeof originalMethod === 'function') {
        return function(...args) {
          // 前置通知
          aspects.before?.[prop]?.apply(this, args)
          
          const result = originalMethod.apply(this, args)
          
          // 后置通知
          aspects.after?.[prop]?.call(this, result, args)
          
          return result
        }
      }
      return Reflect.get(target, prop, receiver)
    }
  })
}

// 使用
const userService = createAOPProxy(new UserService(), {
  before: {
    saveUser: (data) => console.log('前置日志:', data),
    deleteUser: (_, id) => checkPermission(id)
  },
  after: {
    saveUser: (result) => logToAnalytics('user_save', result),
    deleteUser: (result) => console.log('删除完成:', result)
  }
})
```

**前端实际应用场景：**

**1. 权限控制**
```ts
function Auth(role: string) {
  return (target: any, key: string, desc: PropertyDescriptor) => {
    const original = desc.value
    desc.value = function(...args: any[]) {
      if (!hasPermission(role)) {
        throw new Error(`需要${role}权限`)
      }
      return original.apply(this, args)
    }
  }
}

class OrderController {
  @Auth('admin')
  deleteOrder(id: number) { /* ... */ }
}
```

**2. 性能监控**
```ts
function TrackEvent(eventName: string) {
  return (target: any, key: string, desc: PropertyDescriptor) => {
    const original = desc.value
    desc.value = function(...args: any[]) {
      const start = performance.now()
      const result = original.apply(this, args)
      const duration = performance.now() - start
      reportMetric(eventName, { duration })
      return result
    }
  }
}
```

**3. 错误处理统一化**
```ts
function HandleError() {
  return (target: any, key: string, desc: PropertyDescriptor) => {
    const original = desc.value
    desc.value = function(...args: any[]) {
      try {
        return original.apply(this, args)
      } catch (error) {
        logError(error)
        throw error  // 统一上报后继续抛出
      }
    }
  }
}
```

**知识点：** `AOP` `装饰器` `切面` `横切关注点` `前置通知` `后置通知` `Proxy`

:::

### Q8: 声明式编程和命令式编程的区别？前端框架为什么选择声明式？

> **🔥 中等 · 编程范式**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心区别：**

| 维度 | 命令式编程 | 声明式编程 |
|------|------------|------------|
| 关注点 | **怎么做**（How） | **做什么**（What） |
| 代码风格 | 过程描述，步骤明确 | 结果描述，隐藏过程 |
| 状态管理 | 显式定义和管理状态 | 框架自动管理 |
| 控制流 | 循环、条件、函数调用 | 表达式、配置、数据流 |
| 典型代表 | jQuery、原生 DOM 操作 | React、Vue、Angular |
| 代码量 | 通常较多 | 通常较少 |
| 可维护性 | 状态变化难追踪 | 单向数据流，易追踪 |

**命令式示例（jQuery）：**
```js
// 1. 获取 DOM 元素
const list = document.getElementById('todo-list')
const input = document.getElementById('todo-input')
const button = document.getElementById('add-btn')

// 2. 监听事件
button.addEventListener('click', () => {
  const text = input.value.trim()
  if (text) {
    // 3. 创建 DOM
    const li = document.createElement('li')
    li.textContent = text
    
    // 4. 插入 DOM
    list.appendChild(li)
    
    // 5. 清空输入
    input.value = ''
    
    // 6. 手动更新状态
    todoCount = (todoCount || 0) + 1
    document.getElementById('count').textContent = todoCount
  }
})

// 7. 手动删除
list.addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    e.target.remove()
    todoCount--  // 手动更新状态
  }
})
```

**声明式示例（React）：**
```jsx
function TodoList() {
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, input.trim()])  // 状态更新 → UI 自动刷新
      setInput('')
    }
  }

  const removeTodo = (index) => {
    setTodos(todos.filter((_, i) => i !== index))
  }

  return (
    <div>
      <input value={input} onChange={e => setInput(e.target.value)} />
      <button onClick={addTodo}>添加</button>
      <ul>
        {todos.map((todo, i) => (
          <li key={i} onClick={() => removeTodo(i)}>
            {todo}
          </li>
        ))}
      </ul>
      <p>共 {todos.length} 项</p>
    </div>
  )
}
```

**前端框架选择声明式的原因：**

**1. 状态与 UI 同步自动化**
```js
// 命令式：手动同步
state = { count: 0 }
function increment() {
  state.count++
  document.getElementById('count').textContent = state.count  // 手动同步
}

// 声明式：自动同步
const [count, setCount] = useState(0)
function increment() {
  setCount(count + 1)  // 状态变化 → UI 自动更新
}
```

**2. 单向数据流，可预测性强**
```
事件 → 状态更新 → 视图重新渲染
（清晰的因果关系，易于调试和测试）
```

**3. 组件化与复用**
```jsx
// 声明式组件：关注数据输入和输出
function Button({ onClick, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

// 复用方式简单直观
<Button onClick={handleSubmit} disabled={loading}>提交</Button>
```

**4. 虚拟 DOM 优化性能**
```jsx
// React 自动计算最小更新路径
// 开发者只需描述 UI 应该是什么样
function List({ items }) {
  return (
    <ul>
      {items.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  )
}
// 数据变化时，React 自动找出需要更新的 DOM 节点
```

**5. 更易测试**
```jsx
// 声明式组件测试（纯函数）
function Counter({ count }) {
  return <div>{count}</div>
}

// 测试简单
expect(shallow(<Counter count={5} />).text()).toBe('5')
```

**6. 开发者体验更好**
```jsx
// 声明式模板：所见即所得
<div className="container">
  {items.map(item => 
    <Card key={item.id} {...item} />
  )}
</div>

// vs 命令式：需要知道每个 DOM 操作步骤
```

**命令式仍然适用的场景：**

```js
// 1. 性能敏感场景
function animateElement() {
  const el = document.getElementById('box')
  let current = 0
  const frame = () => {
    current += 1
    el.style.transform = `translateX(${current}px)`
    if (current < 100) requestAnimationFrame(frame)
  }
  frame()
}

// 2. 复杂动画控制
function complexAnimation() {
  // 需要精确控制每一帧
}

// 3. 底层工具库
function createTemplate(str) {
  // 直接操作字符串/DOM
}
```

**知识点：** `声明式` `命令式` `单向数据流` `虚拟 DOM` `状态管理` `组件化`

:::
---

### Q9: 软件设计原则 SOLID 是什么？前端如何应用？

> **🔥 中等 · 架构**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**SOLID 是面向对象设计的五大原则：**

| 原则 | 全称 | 含义 |
|------|------|------|
| **S** | Single Responsibility | 单一职责：一个类/模块只负责一件事 |
| **O** | Open/Closed | 开闭原则：对扩展开放，对修改关闭 |
| **L** | Liskov Substitution | 里氏替换：子类可以替换父类 |
| **I** | Interface Segregation | 接口隔离：不应强迫实现不需要的接口 |
| **D** | Dependency Inversion | 依赖倒置：依赖抽象而非具体实现 |

**前端应用示例：**

```typescript
// S - 单一职责：每个组件只做一件事
// ❌ 违反：UserCard 既展示用户又处理登录
class UserCard {
  render() { /* 展示用户信息 */ }
  login() { /* 处理登录逻辑 */ } // 不应在这里
}

// ✅ 正确：拆分职责
class UserCard { render() {} }
class AuthManager { login() {} }

// O - 开闭原则：通过扩展而非修改
interface Shape { area(): number }
class Circle implements Shape {
  area() { return Math.PI * this.r ** 2 }
}
// 新增形状只需新建类，不修改已有代码

// D - 依赖倒置：依赖抽象接口
interface IApiClient { get(url: string): Promise<any> }
class UserService {
  constructor(private api: IApiClient) {} // 依赖注入
}
```

**React 中的 SOLID：**

```tsx
// S - 单一职责：拆分组件
const UserName = ({ name }) => <span>{name}</span>
const UserAvatar = ({ src }) => <img src={src} />

// O - 开闭原则：高阶组件
const withAuth = (Component) => (props) => {
  const { user } = useAuth()
  return user ? <Component {...props} user={user} /> : <Login />
}
// D - 依赖倒置：Props 注入
```

**知识点：** `SOLID` `单一职责` `开闭原则` `依赖倒置` `设计原则`

:::
