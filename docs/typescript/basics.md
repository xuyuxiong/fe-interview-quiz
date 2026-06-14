---
title: 基础类型与类型系统
description: TypeScript 基础类型、类型注解、类型推断与类型系统核心概念面试题
---

# 基础类型与类型系统

**知识点：** `类型注解` `类型推断` `基础类型` `类型系统` `any vs unknown`

**难度分布：** 简单 30% / 中等 50% / 困难 20%

---

### Q1: TypeScript 中有哪些基础原始类型？

> **⭐ 简单 · TypeScript**

请列举 TypeScript 支持的所有基础原始类型，并给出对应的类型注解示例。

::: details 点击查看答案与解析

**答案：**

TypeScript 支持以下基础原始类型：

| 类型 | 示例 | 说明 |
|------|------|------|
| `string` | `let name: string = "Homi"` | 字符串类型 |
| `number` | `let age: number = 25` | 数字类型（整数和浮点数） |
| `boolean` | `let isTS: boolean = true` | 布尔类型 |
| `null` | `let n: null = null` | null 值 |
| `undefined` | `let u: undefined = undefined` | undefined 值 |
| `symbol` | `let s: symbol = Symbol("id")` | ES6 Symbol |
| `bigint` | `let big: bigint = 100n` | ES2020 BigInt |

**解析：**

- `string`、`number`、`boolean` 是最常用的三种基础类型
- `null` 和 `undefined` 在严格模式下需要显式声明
- `symbol` 和 `bigint` 是较新的 JavaScript 特性，TypeScript 也提供了对应支持
- 注意：`void` 用于函数无返回值，`never` 用于永不返回的函数

:::

---

### Q2: 类型注解和类型推断有什么区别？

> **⭐ 简单 · TypeScript**

请解释类型注解（Type Annotation）和类型推断（Type Inference）的区别，并各举一个例子。

::: details 点击查看答案与解析

**答案：**

**类型注解**是显式声明变量或函数的类型：

```ts
let name: string = "HomiClaw"
function add(a: number, b: number): number {
  return a + b
}
```

**类型推断**是 TypeScript 根据上下文自动推导类型：

```ts
let name = "HomiClaw"        // 推断为 string
let count = 42               // 推断为 number
let items = [1, 2, 3]        // 推断为 number[]
```

**解析：**

- 类型注解提供更明确的类型约束，适合函数参数、返回值等
- 类型推断让代码更简洁，适合变量初始化场景
- 最佳实践：在边界处（函数签名、公开 API）使用类型注解，内部实现可依赖推断
- 当推断结果不符合预期时，需要显式注解

:::

---

### Q3: any 和 unknown 类型有什么区别？

> **⭐ 中等 · TypeScript**

请详细说明 `any` 和 `unknown` 的区别，以及各自的使用场景。

::: details 点击查看答案与解析

**答案：**

| 特性 | `any` | `unknown` |
|------|-------|-----------|
| 类型安全 | ❌ 完全关闭 | ✅ 保持类型安全 |
| 直接访问属性 | ✅ 允许 | ❌ 不允许 |
| 赋值给其他类型 | ✅ 允许 | ❌ 需要类型收窄 |
| 类型收窄 | 不需要 | 必须进行 |

```ts
// any - 放弃类型检查
let value: any = 42
value.toFixed()           // ✅ 编译通过（但运行时报错）
let num: number = value   // ✅ 允许

// unknown - 类型安全的任意值
let safe: unknown = 42
// safe.toFixed()         // ❌ 编译错误
if (typeof safe === "number") {
  safe.toFixed()          // ✅ 类型收窄后可用
}
let num2: number = safe as number  // ✅ 类型断言后允许
```

**解析：**

- `any` 会关闭所有类型检查，应该避免使用
- `unknown` 是类型安全的 `any`，使用前必须进行类型检查或断言
- 场景：处理外部输入、JSON 解析、第三方库返回值时用 `unknown`
- 原则：能用 `unknown` 就不用 `any`

:::

---

### Q4: void 和 never 类型有什么区别？

> **⭐ 中等 · TypeScript**

请解释 `void` 和 `never` 的区别，并说明各自的应用场景。

::: details 点击查看答案与解析

**答案：**

**`void`** 表示函数没有返回值（或返回 `undefined`）：

```ts
function log(message: string): void {
  console.log(message)
  // 隐含 return undefined
}

function greet(): void {
  return  // 只能 return undefined 或不写
}
```

**`never`** 表示函数永远不会正常返回：

```ts
// 抛出异常
function error(message: string): never {
  throw new Error(message)
}

// 无限循环
function loop(): never {
  while (true) {}
}

// 联合类型的穷尽检查
function assertNever(x: never): never {
  throw new Error(`Unexpected: ${x}`)
}
```

**解析：**

- `void` 函数会正常结束，只是不返回有用值
- `never` 函数永远不会到达终点（抛出异常或无限循环）
- `never` 是任何类型的子类型，但任何类型都不是 `never` 的子类型
- 穷尽检查（Exhaustive Check）是 `never` 的经典应用场景

:::

---

### Q5: 什么是类型断言？有哪些使用方式？

> **⭐ 中等 · TypeScript**

请说明类型断言（Type Assertion）的作用和两种语法形式，并指出使用风险。

::: details 点击查看答案与解析

**答案：**

**类型断言**用于告诉编译器"相信我，我知道这个值的类型"。

**两种语法形式：**

```ts
// 方式 1: as 语法（推荐）
let value: unknown = "Hello"
let str = value as string

// 方式 2: 尖括号语法（不适用于 JSX）
let str2 = <string>value
```

**常见场景：**

```ts
// DOM 元素类型断言
const input = document.getElementById("username") as HTMLInputElement
input.value = "test"

// JSON 解析后断言
const data = JSON.parse(jsonString) as User
```

**解析与风险：**

- 类型断言不会进行运行时检查，只是编译时的"承诺"
- 滥用会导致类型系统失效，应该谨慎使用
- 优先使用类型守卫（typeof、instanceof）进行类型收窄
- 当 TypeScript 推断的类型比实际更宽泛时，断言才有意义

:::

---

### Q6: 联合类型和交叉类型有什么区别？

> **⭐ 中等 · TypeScript**

请解释联合类型（Union Types）和交叉类型（Intersection Types）的区别，并给出示例。

::: details 点击查看答案与解析

**答案：**

**联合类型**使用 `|`，表示"或是"关系：

```ts
type ID = string | number

function printId(id: ID) {
  // 只能使用 string 和 number 共有的方法
  console.log(id.toString())  // ✅
  // console.log(id.toFixed())  // ❌ number 独有方法不可用
}
```

**交叉类型**使用 `&`，表示"且是"关系：

```ts
type A = { a: string }
type B = { b: number }
type AB = A & B  // { a: string } & { b: number }

const obj: AB = { a: "hello", b: 42 }
```

**解析：**

- 联合类型：值是其中任意一种，只能使用共有成员
- 交叉类型：值同时满足所有类型，合并所有成员
- 联合类型常用于参数允许多种类型
- 交叉类型常用于组合多个类型或混入（Mixin）

:::

---

### Q7: 什么是类型守卫？列举三种类型守卫方式。

> **⭐ 中等 · TypeScript**

请解释类型守卫的概念，并列举至少三种类型守卫的实现方式。

::: details 点击查看答案与解析

**答案：**

**类型守卫**是在运行时检查变量类型，从而在特定作用域内收窄类型的机制。

**三种常见方式：**

```ts
// 1. typeof 守卫（适用于基础类型）
function print(value: string | number) {
  if (typeof value === "string") {
    return value.toUpperCase()  // value 被收窄为 string
  }
  return value.toFixed(2)       // value 是 number
}

// 2. instanceof 守卫（适用于类实例）
function getDate(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString()
  }
  return new Date(value).toISOString()
}

// 3. 自定义类型守卫函数
type Fish = { swim: () => void }
type Bird = { fly: () => void }

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim()  // pet 是 Fish
  } else {
    pet.fly()   // pet 是 Bird
  }
}
```

**解析：**

- `typeof` 适用于 string、number、boolean、symbol、bigint、object、function
- `instanceof` 适用于类实例和内置对象（如 Date、Array）
- 自定义类型守卫使用 `param is Type` 返回类型语法
- 还有 `in` 守卫、`===` 守卫等多种方式

:::

---

### Q8: 什么是类型别名和接口？它们有什么区别？

> **⭐ 中等 · TypeScript**

请对比 `type` 别名和 `interface` 接口，说明它们的区别和使用场景。

::: details 点击查看答案与解析

**答案：**

```ts
// type 别名
type User = {
  id: number
  name: string
}

// interface 接口
interface Product {
  id: number
  name: string
}
```

| 特性 | type | interface |
|------|------|-----------|
| 基础类型别名 | ✅ 支持 | ❌ 不支持 |
| 联合类型 | ✅ 支持 | ❌ 不支持 |
| 元组类型 | ✅ 支持 | ❌ 不支持 |
| 声明合并 | ❌ 不支持 | ✅ 支持 |
| 实现接口 | ❌ | ✅ implements |
| 泛型支持 | ✅ | ✅ |

```ts
// type 可以做到但 interface 不能的
type ID = string | number
type Point = [number, number]
type Callback = () => void

// interface 支持声明合并
interface Config {
  host: string
}
interface Config {  // 合并
  port: number
}
// 最终：{ host: string } & { port: number }
```

**解析：**

- 需要联合类型、元组、基础类型别名时用 `type`
- 需要声明合并、implements、扩展类时用 `interface`
- 对象类型定义两者都能做，社区偏好 `interface` 用于对象结构
- 官方推荐：大部分情况用 `interface`，特殊场景用 `type`

:::

---

### Q9: 什么是字面量类型？有什么实际用途？

> **⭐ 简单 · TypeScript**

请解释什么是字面量类型，并给出至少两个实际应用场景。

::: details 点击查看答案与解析

**答案：**

**字面量类型**是精确指定某个具体值的类型：

```ts
type Direction = "up" | "down" | "left" | "right"
type StatusCode = 200 | 404 | 500
type Bool = true | false

function move(dir: Direction) {
  // 只能传入四个方向之一
  console.log(`Moving ${dir}`)
}

move("up")      // ✅
move("right")   // ✅
move("diagonal") // ❌ 编译错误
```

**实际应用场景：**

```ts
// 1. 状态机/状态管理
type ButtonState = "idle" | "loading" | "success" | "error"

interface ButtonProps {
  state: ButtonState
}

// 2. 配置选项限制
type Align = "left" | "center" | "right"
function setText(align: Align) {}

// 3. API 响应状态
type APIStatus = "pending" | "fulfilled" | "rejected"
```

**解析：**

- 字面量类型提供比基础类型更精确的约束
- 常用于枚举替代、状态管理、配置选项
- 配合联合类型可以创建强大的类型约束
- 比 `enum` 更轻量，编译后无额外 JS 代码

:::

---

### Q10: TypeScript 中的类型兼容性规则是什么？

> **⭐ 困难 · TypeScript**

请解释 TypeScript 的结构化类型系统，以及类型兼容性的判断规则。

::: details 点击查看答案与解析

**答案：**

TypeScript 使用**结构化类型系统**（Structural Type System），也称为"鸭子类型"：如果一个东西走起来像鸭子、叫起来像鸭子，那它就是鸭子。

**核心规则：**

```ts
// 1. 接口兼容性 - 目标类型必须有源类型的所有成员
interface Point2D { x: number; y: number }
interface Point3D { x: number; y: number; z: number }

let p2: Point2D = { x: 1, y: 2 }
let p3: Point3D = { x: 1, y: 2, z: 3 }

p2 = p3  // ✅ Point3D 包含 Point2D 的所有成员
p3 = p2  // ❌ Point2D 缺少 z 属性

// 2. 函数兼容性 - 参数逆变，返回值协变
type Func1 = (a: number) => void
type Func2 = (a: number, b: string) => void

let f1: Func1
let f2: Func2

f1 = f2  // ✅ 参数更少（目标可以接收更少参数）
f2 = f1  // ❌ 参数更多

// 3. 泛型兼容性
interface Box<T> { item: T }
let numBox: Box<number> = { item: 1 }
let anyBox: Box<any> = numBox  // ✅
```

**解析：**

- 结构化类型 vs 名义类型（Nominal）：TypeScript 不看名字，只看结构
- 函数参数是逆变的（允许接收更少的参数）
- 返回值是协变的（允许返回更具体的类型）
- 可选属性和函数重载有特殊处理规则
- 理解兼容性规则对设计 API 和类型系统至关重要

:::

---

### Q11: TypeScript 的类型推断规则？什么时候需要显式注解？

> **🔥 中等 · TypeScript**

请解释 TypeScript 的类型推断机制，以及在什么场景下需要显式类型注解。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**TypeScript 类型推断规则：**

```ts
// 1. 变量推断 - 从初始化值推断
let name = "Homi"      // 推断为 string
let age = 25           // 推断为 number
let active = true      // 推断为 boolean

// 2. 数组推断 - 取最佳共同类型
let nums = [1, 2, 3]        // number[]
let mixed = [1, "two", 3]   // (number | string)[]

// 3. 函数返回值推断
function add(a: number, b: number) {
  return a + b  // 推断返回 number
}

// 4. 上下文推断 - 从期望类型推断
window.onkeyup = (e) => {  // e 推断为 KeyboardEvent
  console.log(e.key)
}

// 5. 泛型推断 - 从参数推断类型参数
function identity<T>(arg: T): T { return arg }
let result = identity(42)  // T 推断为 number
```

**需要显式注解的场景：**

| 场景 | 示例 | 原因 |
|------|------|------|
| 函数参数 | `(x: number) => x * 2` | 参数无法推断，必须注解 |
| 无初始化变量 | `let count: number` | 没有初始值可供推断 |
| 泛型默认值 | `<T = string>` | 提供类型默认值 |
| 联合类型收窄 | `let x: number | null = null` | 避免推断为 `null` |
| 对象字面量 | `const user: User = {...}` | 确保符合接口 |
| 返回复杂类型 | `function(): Promise<User | null>` | 明确返回类型 |
| 类属性 | `class Foo { name: string }` | 明确定义属性类型 |

**最佳实践：**

```ts
// ✅ 推荐：函数参数必须注解
function greet(name: string) {
  return `Hello, ${name}`
}

// ✅ 推荐：公共 API 明确返回类型
function fetchUser(id: number): Promise<User> {
  // ...
}

// ⚠️ 避免过度注解（让 TS 推断）
const age: number = 25  // 不需要，直接 let age = 25
```

**知识点：** `类型推断` `类型注解` `上下文推断` `泛型推断`

:::

---

### Q12: interface 和 type 的区别？什么时候用哪个？

> **🔥 中等 · TypeScript**

TypeScript 中 `interface` 和 `type` 都可以定义类型，它们有什么区别？在实际项目中应该如何选择？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心区别对比：**

| 特性 | interface | type |
|------|-----------|------|
| 声明合并 | ✅ 支持 | ❌ 不支持 |
| 继承/扩展 | `extends` | `&` (交叉类型) |
| 联合类型 | ❌ 不支持直接 | ✅ `A \| B` |
| 映射类型 | ❌ 不支持 | ✅ 支持 |
| 元组/函数类型 | ❌ 不支持 | ✅ 支持 |
| 计算属性 | ✅ 支持 | ✅ 支持 |
| 泛型支持 | ✅ 支持 | ✅ 支持 |

**代码示例：**

```ts
// ============== 声明合并 ==============
interface User {
  id: number
  name: string
}

interface User {  // 自动合并
  email: string
}
// 最终 User = { id, name, email }

// type 不支持合并，会报错
// type User = { id: number }
// type User = { email: string }  // ❌ 重复声明

// ============== 继承扩展 ==============
interface BaseUser {
  id: number
}

interface AdminUser extends BaseUser {  // ✅ interface extends
  role: 'admin'
}

type AdminUser2 = BaseUser & {  // ✅ type 用交叉
  role: 'admin'
}

// ============== 联合类型 ==============
type Status = 'pending' | 'loading' | 'success' | 'error'  // ✅
// interface 无法直接定义联合类型

// ============== 映射类型 ==============
type ReadonlyUser<T> = {
  readonly [P in keyof T]: T[P]
}  // ✅ type 支持映射

// interface 不支持映射类型语法

// ============== 函数/元组类型 ==============
type Callback = (data: string) => void  // ✅
type Point = [number, number]           // ✅ 元组
```

**选择指南：**

```ts
// ✅ 优先使用 interface 的场景：
// - 定义对象类型，特别是可能扩展的
// - 需要声明合并（如第三方库的类型增强）
// - 实现类的接口（implements）

interface APIResponse {
  data: unknown
  status: number
}

class UserService implements APIResponse {
  // ...
}

// ✅ 使用 type 的场景：
// - 联合类型
// - 元组类型
// - 映射类型/条件类型
// - 函数类型
// - 原始类型的别名

type Status = 'success' | 'error'
type Point = [number, number]
type Nullable<T> = T | null
```

**知识点：** `interface` `type` `声明合并` `交叉类型` `联合类型`

:::

---

### Q13: TypeScript 的 enum 有什么问题？推荐的替代方案？

> **🔥 中等 · TypeScript**

TypeScript 的枚举（enum）有哪些缺陷？实际项目中有什么更好的替代方案？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Enum 的主要问题：**

```ts
// ❌ 问题 1: 编译后生成额外的 JS 代码
enum Direction {
  Up = 1,
  Down,
  Left,
  Right
}
// 编译后：
// var Direction;
// (function (Direction) {
//   Direction[Direction["Up"] = 1] = "Up";
//   ... 生成双向映射对象
// })(Direction || (Direction = {}));

// ❌ 问题 2: 双重包装导致类型不安全
enum Status {
  Pending = 'pending',
  Success = 'success'
}
// Status.Pending 的类型是 Status，不是 'pending'
// 与字符串字面量不兼容

// ❌ 问题 3: 不支持联合类型约束
function handle(direction: Direction) {
  // 无法细化为 Direction.Up | Direction.Down
}
```

**推荐替代方案：字面量类型 + const as const：**

```ts
// ✅ 方案 1: const 对象 + as const（推荐）
const Direction = {
  Up: 'up',
  Down: 'down',
  Left: 'left',
  Right: 'right'
} as const

type Direction = typeof Direction[keyof typeof Direction]
// Direction 类型：'up' | 'down' | 'left' | 'right'

function move(dir: Direction) {
  // 类型安全，编译后无额外代码
}

// ✅ 方案 2: 纯联合类型
const DIRECTIONS = ['up', 'down', 'left', 'right'] as const
type Direction = typeof DIRECTIONS[number]

// 带值的映射
const DirectionValue = {
  UP: 'up',
  DOWN: 'down'
} as const

// ✅ 方案 3: 字符串字面量联合
type StatusCode = 200 | 400 | 404 | 500
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

function handleResponse(status: StatusCode) {
  if (status === 200) {
    // 类型收窄
  }
}

// ✅ 方案 4: 需要运行时存在时使用 Map
const StatusMap = new Map([
  ['PENDING', { label: 'Pending', value: 'pending' }],
  ['SUCCESS', { label: 'Success', value: 'success' }]
]) as const
```

**对比表格：**

| 方案 | 运行时 | 类型安全 | 代码体积 | 推荐度 |
|------|--------|----------|----------|--------|
| enum | 生成对象 | 中等 | 大 | ⭐⭐ |
| const as const | 无额外 | 高 | 零 | ⭐⭐⭐⭐⭐ |
| 纯联合类型 | 无 | 高 | 零 | ⭐⭐⭐⭐ |
| Map | Map 对象 | 高 | 小 | ⭐⭐⭐ |

**知识点：** `enum` `字面量类型` `const` `类型安全`

:::

---

### Q14: TypeScript 的模块增强（Declaration Merging）是什么？

> **🔥 困难 · TypeScript**

请解释 TypeScript 的声明合并机制，以及如何使用它来增强现有模块的类型。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**声明合并（Declaration Merging）规则：**

```ts
// ============== 接口合并 ==============
interface Box {
  height: number
  width: number
}

interface Box {
  scale: number  // 自动合并
}
// 合并后：{ height: number, width: number, scale: number }

// ============== 命名空间合并 ==============
namespace Album {
  export let id: number
}

namespace Album {
  export let title: string  // 合并
}

// ============== 函数重载合并 ==============
function merge(arg1: string, arg2: string): string
function merge(arg1: number, arg2: number): string
function merge(arg1: any, arg2: any): any {
  return arg1 + arg2
}

// ============== 类型只能有一个声明（不合并）
type Box = { height: number }  // 第二个会报错
type Box = { width: number }   // ❌ Duplicate identifier
```

**模块增强（增强第三方库类型）：**

```ts
// ============== 增强全局对象 ==============
interface Window {
  myCustomProperty: string
}

window.myCustomProperty = 'custom'

// ============== 增强特定模块 ==============
// types/express.d.ts
import express from 'express'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        name: string
      }
    }
  }
}

// 使用时：
app.get('/', (req, res) => {
  const userId = req.user?.id  // ✅ 类型安全
})

// ============== 增强第三方库 ==============
// types/lodash.d.ts
declare module 'lodash' {
  export function customFunction<T>(arr: T[]): T[]
}

// tsconfig.json 需要配置：
// {
//   "compilerOptions": {
//     "typeRoots": ["./types", "./node_modules/@types"]
//   }
// }

// ============== 附加到现有函数 ==============
declare function consoleExt(msg: string): void

namespace consoleExt {
  export let version: string
  export function log(msg: string): void
}

consoleExt.version = '1.0'
consoleExt.log('message')
```

**注意事项：**

1. **只有 interface、namespace、enum、函数** 支持声明合并
2. **type 类型别名** 不支持合并
3. 同名声明才合并，否则会报错
4. 模块增强需要正确配置 `typeRoots`
5. 避免在多个包中增强同一模块导致冲突

**知识点：** `声明合并` `模块增强` `类型定义` `第三方库类型`

:::

---

## 总结

本章涵盖了 TypeScript 类型系统的基础知识，包括：

- 8 种基础原始类型及其使用
- 类型注解与类型推断的区别
- `any`、`unknown`、`void`、`never` 的特殊类型
- 类型断言的使用与风险
- 联合类型与交叉类型
- 类型守卫的多种方式
- `type` 别名与 `interface` 接口对比
- 字面量类型的实际价值
- 结构化类型系统的兼容性规则
- 类型推断规则与显式注解场景
- interface 与 type 的深度对比
- enum 的问题与替代方案
- 声明合并与模块增强

掌握这些基础是深入学习 TypeScript 泛型、装饰器和高级类型的前提。