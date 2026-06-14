---
title: 泛型与高级类型
description: TypeScript 泛型基础、泛型约束、条件类型、映射类型等高级类型特性面试题
---

# 泛型与高级类型

**知识点：** `泛型` `泛型约束` `条件类型` `映射类型` `协变逆变` `关键字类型`

**难度分布：** 简单 30% / 中等 50% / 困难 20%

---

### Q1: 什么是泛型？为什么要使用泛型？

> **⭐ 简单 · TypeScript**

请解释泛型的概念，并说明使用泛型的好处。

::: details 点击查看答案与解析

**答案：**

**泛型**（Generics）是"参数化类型"，允许在定义函数、接口或类时不指定具体类型，而在使用时再指定。

```ts
// 不使用泛型 - 需要多个重载
function identityString(arg: string): string {
  return arg
}
function identityNumber(arg: number): number {
  return arg
}

// 使用泛型 - 一个定义搞定
function identity<T>(arg: T): T {
  return arg
}

identity<string>("Hello")  // T = string
identity<number>(42)       // T = number
identity("Auto")           // 类型推断 T = string
```

**使用泛型的好处：**

1. **代码复用**：一套逻辑支持多种类型
2. **类型安全**：保持类型信息的完整性
3. **灵活性**：调用者决定具体类型
4. **减少重复**：避免为每种类型写重复代码

**解析：**

- 泛型是 TypeScript 最强大的特性之一
- 泛型参数通常用 `T`（Type）、`U`、`V` 等表示
- 多个泛型参数：`function merge<T, U>(a: T, b: U): T & U`
- 泛型可以用于函数、接口、类、类型别名

:::

---

### Q2: 泛型约束是什么？如何使用？

> **⭐ 中等 · TypeScript**

请解释泛型约束的概念，并给出使用示例。

::: details 点击查看答案与解析

**答案：**

**泛型约束**用于限制泛型参数必须是某种类型的子类型，使用 `extends` 关键字。

```ts
// 基础约束 - T 必须有 length 属性
interface Lengthwise {
  length: number
}

function logLength<T extends Lengthwise>(arg: T): void {
  console.log(arg.length)
}

logLength("Hello")     // ✅ string 有 length
logLength([1, 2, 3])   // ✅ 数组有 length
logLength(42)          // ❌ number 没有 length

// 多泛型参数的约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { name: "Homi", age: 3 }
getProperty(user, "name")  // ✅
getProperty(user, "email") // ❌ email 不是 user 的键

// 约束继承
interface Person { name: string }
interface Employee extends Person { empId: number }

function printName<T extends Person>(person: T) {
  console.log(person.name)  // ✅ 保证有 name 属性
}
```

**解析：**

- 约束确保泛型参数满足特定要求
- `extends` 可以接接口、类、联合类型
- `keyof T` 是常用的约束模式
- 可以多重约束：`T extends A & B`

:::

---

### Q3: 什么是条件类型？给出一个实际应用场景。

> **⭐ 中等 · TypeScript**

请解释条件类型的语法和用法，并给出至少一个实际应用示例。

::: details 点击查看答案与解析

**答案：**

**条件类型**的语法类似于三元表达式：`T extends U ? X : Y`

```ts
// 基础语法
type IsString<T> = T extends string ? true : false

type A = IsString<"hello">  // true
type B = IsString<42>       // false

// 实际工具类型示例
type MyExclude<T, U> = T extends U ? never : T

// 使用
type Animal = "dog" | "cat" | "fish"
type Mammal = MyExclude<Animal, "fish">  // "dog" | "cat"
```

**实际应用场景 - 从 Promise 中提取类型：**

```ts
type UnpackPromise<T> = T extends Promise<infer U> ? U : T

type A = UnpackPromise<Promise<string>>  // string
type B = UnpackPromise<number>           // number
type C = UnpackPromise<Promise<boolean>> // boolean

// 配合 async/await 返回值类型
type AsyncReturnType<T extends (...args: any[]) => any> = 
  UnpackPromise<ReturnType<T>>

async function fetchData(): Promise<string> {
  return "data"
}

type Data = AsyncReturnType<typeof fetchData>  // string
```

**解析：**

- 条件类型是高级类型编程的基础
- `infer` 用于在条件类型中推断类型
- 分布式条件类型：对联合类型会自动分配
- 复杂工具类型通常基于条件类型构建

:::

---

### Q4: 什么是映射类型？请实现一个将属性变为可选的映射类型。

> **⭐ 中等 · TypeScript**

请解释映射类型的概念，并手写实现 `Partial<T>` 工具类型。

::: details 点击查看答案与解析

**答案：**

**映射类型**基于旧类型创建新类型，语法类似对象字面量：

```ts
// 基础语法
type MappedType = {
  [K in keyof T]: NewType
}

// 实现 Partial<T> - 将所有属性变为可选
type MyPartial<T> = {
  [K in keyof T]?: T[K]
}

// 使用
interface Todo {
  id: number
  title: string
  completed: boolean
}

type PartialTodo = MyPartial<Todo>
// 等价于：{ id?: number; title?: string; completed?: boolean }

const todo: PartialTodo = { id: 1 }  // ✅ 只需部分属性
```

**其他常见映射类型变体：**

```ts
// Readonly<T> - 所有属性只读
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K]
}

// Required<T> - 所有属性必选
type MyRequired<T> = {
  [K in keyof T]-?: T[K]  // -? 移除可选
}

// Pick<T, K> - 选取部分属性
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P]
}

// Record<K, T> - 指定键类型和值类型
type MyRecord<K extends string, T> = {
  [P in K]: T
}
```

**解析：**

- 映射类型是创建新类型的强大工具
- `in` 循环遍历联合类型
- 可配合 `+`、`-`、`readonly`、`?` 修饰符
- 5.4+ 支持 `as` 子句进行键映射

:::

---

### Q5: infer 关键字的作用是什么？举两个使用示例。

> **⭐ 困难 · TypeScript**

请解释 `infer` 关键字的作用，并给出至少两个使用示例。

::: details 点击查看答案与解析

**答案：**

`infer` 用于在条件类型中**推断并捕获类型**，只能在 `extends` 的条件分支中使用。

**示例 1：从数组类型推断元素类型**

```ts
type ElementType<T> = T extends (infer U)[] ? U : T

type A = ElementType<string[]>      // string
type B = ElementType<number[]>      // number
type C = ElementType<42>            // 42（不是数组，返回原类型）
```

**示例 2：从函数类型推断返回值**

```ts
type ReturnOf<T> = T extends (...args: any[]) => infer R ? R : T

type A = ReturnOf<() => string>        // string
type B = ReturnOf<(x: number) => boolean>  // boolean
type C = ReturnOf<string>              // string（不是函数）
```

**示例 3：推断 Promise 的泛型参数**

```ts
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

type A = UnwrapPromise<Promise<number>>  // number
type B = UnwrapPromise<string>           // string
```

**解析：**

- `infer` 必须在 `extends` 条件类型内部使用
- 可以多次推断同一类型变量
- 常用于解构复杂类型、提取嵌套类型
- 是现代 TypeScript 工具类型的核心特性

:::

---

### Q6: 什么是分布式条件类型？请举例说明。

> **⭐ 困难 · TypeScript**

请解释分布式条件类型的概念，并说明其工作原理。

::: details 点击查看答案与解析

**答案：**

**分布式条件类型**：当条件类型的被检查类型是**裸类型参数**（naked type parameter）时，对联合类型会自动"分发"处理。

```ts
// 条件类型
type ToArray<T> = T extends any ? T[] : never

// 传入联合类型 - 自动分发
type Result = ToArray<string | number | boolean>
// 等价于：ToArray<string> | ToArray<number> | ToArray<boolean>
// 结果：string[] | number[] | boolean[]

// 对比：非裸类型参数 - 不分发
type ToArrayNonDistributed<T> = [T] extends [any] ? T[] : never
type Result2 = ToArrayNonDistributed<string | number>
// 结果：(string | number)[]   （联合类型整体作为一个元素）
```

**实际应用示例：**

```ts
// 提取联合类型中每个成员的类型
type Flatten<T> = T extends Array<infer U> ? U : T

type Result = Flatten<(string | number)[]>
// 分发后：Flatten<string[]> | Flatten<number[]>
// 结果：string | number

// 移除函数类型的参数
type UnwrapFunction<T> = T extends (...args: infer P) => any ? P : never

type Params = UnwrapFunction<(a: string, b: number) => boolean>
// 结果：[string, number]
```

**解析：**

- 裸类型参数：直接使用 `T`，而不是 `[T]` 或 `readonly T` 等包装
- 分发只对联合类型有效
- 可通过包装成元组 `[T]` 来阻止分发
- 理解分发机制对编写高级工具类型非常重要

:::

---

### Q7: 如何实现一个 DeepReadonly 工具类型？

> **⭐ 困难 · TypeScript**

请手写实现一个 `DeepReadonly<T>`，能将对象及其嵌套对象的所有属性都变为只读。

::: details 点击查看答案与解析

**答案：**

```ts
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K]
}

// 测试
interface User {
  name: string
  profile: {
    age: number
    hobbies: string[]
  }
}

type ReadonlyUser = DeepReadonly<User>
// 等价于:
// {
//   readonly name: string
//   readonly profile: {
//     readonly age: number
//     readonly hobbies: readonly string[]  // 注意数组处理
//   }
// }

// 使用
const user: ReadonlyUser = {
  name: "Homi",
  profile: { age: 25, hobbies: ["coding"] }
}

// user.name = "New"      // ❌ 只读
// user.profile.age = 26  // ❌ 只读
```

**优化版本（处理数组和元组）：**

```ts
type DeepReadonlyV2<T> = T extends Function
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonlyV2<T[K]> }
    : T
```

**解析：**

- 使用递归条件类型处理嵌套对象
- 需要特殊处理函数类型（保持原样）
- 数组和元组会递归处理元素类型
- TypeScript 5.x 对递归深度有限制，过深可能报错

:::

---

### Q8: 什么是协变和逆变？TypeScript 中如何处理？

> **⭐ 困难 · TypeScript**

请解释协变（Covariant）和逆变（Contravariant）的概念，并说明 TypeScript 中的处理方式。

::: details 点击查看答案与解析

**答案：**

**协变和逆变**描述类型构造器如何随着基础类型变化：

| 类型 | 定义 | 例子 |
|------|------|------|
| **协变** | 保持方向一致 | 返回值类型 |
| **逆变** | 方向相反 | 函数参数类型 |
| **双向协变** | 两个方向都行 | 当 strictFunctionTypes 关闭时 |

```ts
// 协变 - 返回值
type Animal = { name: string }
type Dog = Animal & { breed: string }

type ReturnAnimal = () => Animal
type ReturnDog = () => Dog

let returnAnimal: ReturnAnimal
let returnDog: ReturnDog

returnAnimal = returnDog  // ✅ Dog 是 Animal，可以返回更具体类型
returnDog = returnAnimal  // ❌ Animal 可能不是 Dog

// 逆变 - 参数
type AcceptAnimal = (a: Animal) => void
type AcceptDog = (a: Dog) => void

let acceptAnimal: AcceptAnimal
let acceptDog: AcceptDog

acceptDog = acceptAnimal   // ✅ 接受 Animal 的函数可以处理 Dog（说大了能处理说小的）
acceptAnimal = acceptDog   // ❌ 只接受 Dog 的函数不能处理所有 Animal
```

**TypeScript 的处理：**

```ts
// 函数参数是逆变的（strictFunctionTypes: true）
type HandlerA = (x: Animal) => void
type HandlerB = (x: Dog) => void

let handlers1: HandlerA[] = []
handlers1.push((x: Dog) => {})  // ✅ 逆变允许

// 数组是协变的
let animals: Animal[]
let dogs: Dog[] = []
animals = dogs  // ✅ 数组协变
```

**解析：**

- 返回值类型是协变（covariant）
- 函数参数类型是逆变（contravariant）
- 数组和某些泛型是协变
- 理解变型（Variance）对设计类型系统至关重要

:::

---

### Q9: 如何实现一个 ExcludeKeys 工具类型？

> **⭐ 中等 · TypeScript**

请手写实现 `Omit<T, K>` 或类似的排除属性工具类型。

::: details 点击查看答案与解析

**答案：**

```ts
// 标准库 Omit 的实现
type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>

// 使用
interface Todo {
  id: number
  title: string
  completed: boolean
  createdAt: Date
}

type TodoPreview = MyOmit<Todo, "id" | "createdAt">
// 等价于：{ title: string; completed: boolean }

// 手动实现版本（不用 Pick 和 Exclude）
type ExcludeKeys<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P]
}

type TodoPreview2 = ExcludeKeys<Todo, "id" | "createdAt">
// 结果相同
```

**解析：**

- `Exclude<T, U>` 从联合类型中排除 `U`
- `keyof T` 获取所有属性的联合类型
- `as` 子句（TS4.1+）可以过滤映射类型的键
- `never` 作为键在映射类型中会被省略

:::

---

### Q10: 什么是模板字面量类型？有什么用途？

> **⭐ 简单 · TypeScript**

请解释模板字面量类型的语法，并给出实际应用场景。

::: details 点击查看答案与解析

**答案：**

**模板字面量类型**使用反引号语法，类似模板字符串：

```ts
// 基础语法
type Greeting = `Hello, ${string}`

type Msg = Greeting  // "Hello, xxx" 形式的字符串
let msg: Msg = "Hello, World"  // ✅
msg = "Hi"  // ❌ 不符合模式

// 多个占位符
type EventName = `${"click" | "hover" | "focus"}${"Start" | "End"}`
// "clickStart" | "clickEnd" | "hoverStart" | "hoverEnd" | "focusStart" | "focusEnd"

// 实际应用场景
type CSSProperties = {
  [K in `margin${"Top" | "Bottom" | "Left" | "Right"}`]?: string
}
// 等价于:
// { marginTop?: string; marginBottom?: string; marginLeft?: string; marginRight?: string }

// 动态事件名绑定
type EventType = "load" | "error" | "ready"
type Element = "img" | "video" | "audio"
type EventNames = `${ElementType}-${EventType}`
// "img-load" | "img-error" | "video-load" ...
```

**解析：**

- 模板字面量类型在编译时进行字符串拼接
- 可以配合联合类型生成大量组合
- 常用于 CSS 属性、API 路径、事件名等场景
- 与映射类型结合使用非常强大

:::

---

### Q11: 泛型约束（extends）的常见用法？keyof + extends 的组合？

> **🔥 中等 · TypeScript**

请解释泛型约束的常见用法，以及 `keyof` + `extends` 组合的实际应用场景。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**泛型约束的常见用法：**

```ts
// 1. 基础约束 - 限制类型必须有某些属性
interface HasId {
  id: number
}

function printId<T extends HasId>(item: T) {
  console.log(item.id)  // ✅ 保证有 id 属性
}

// 2. 多重约束 - 同时满足多个条件
type Movable = { move(x: number, y: number): void }
type Drawable = { draw(): void }

function animate<T extends Movable & Drawable>(shape: T) {
  shape.move(0, 0)
  shape.draw()
}

// 3. 约束为字面量类型
type Status = 'pending' | 'success' | 'error'
function setStatus<T extends Status>(status: T) {
  // T 只能是三个状态之一
}
```

**keyof + extends 组合：**

```ts
// 1. 动态属性访问 - 保证 key 是对象的合法属性
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { name: "Homi", age: 25 }
getProperty(user, "name")  // ✅
getProperty(user, "email")  // ❌ email 不是 user 的键

// 2. 提取部分属性
function pickProps<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys) {
    result[key] = obj[key]
  }
  return result
}

// 3. 条件属性修改
type ModifyKey<T, K extends keyof T, V> = Omit<T, K> & { [P in K]: V }

type User = { name: string; age: number }
type UserWithStringAge = ModifyKey<User, "age", string>
// { name: string; age: string }

// 4. 提取指定类型的属性
type KeysOfType<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T]

interface Mixed {
  a: string
  b: number
  c: string
}

type StringKeys = KeysOfType<Mixed, string>  // "a" | "c"
```

**实际场景 - 实现类型安全的配置合并：**

```ts
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K]
}

function mergeConfig<T extends object>(
  defaultConfig: T,
  override: DeepPartial<T>
): T {
  const result = { ...defaultConfig }
  for (const key in override) {
    if (override.hasOwnProperty(key)) {
      const overrideValue = override[key]
      if (overrideValue !== undefined) {
        result[key] = overrideValue
      }
    }
  }
  return result
}
```

**知识点：** `泛型约束` `keyof` `extends` `类型推断`

:::

---

### Q12: 条件类型（Conditional Types）和 infer 关键字的用法？

> **🔥 困难 · TypeScript**

请详细解释条件类型的高级用法，以及 infer 关键字的各种 Capture 模式。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**条件类型基础回顾：**

```ts
// 基本语法：T extends U ? X : Y
type IsString<T> = T extends string ? true : false

// 分布式特性 - 对联合类型自动分发
type ToArray<T> = T extends any ? T[] : never
type Result = ToArray<string | number>  // string[] | number[]
```

**infer 的常见模式：**

```ts
// 1. 提取数组元素类型
type Flatten<T> = T extends Array<infer U> ? U : T
type A = Flatten<string[]>  // string

// 2. 提取函数返回值
type ReturnType2<T> = T extends (...args: any[]) => infer R ? R : T

// 3. 提取函数参数类型（元组）
type ArgsType<T> = T extends (...args: infer P) => any ? P : never
type Args = ArgsType<(a: string, b: number) => boolean>
// [string, number]

// 4. 提取 Promise 内部类型
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

// 5. 提取构造函数的实例类型
type InstanceType2<T> = T extends new (...args: any[]) => infer R ? R : T

// 6. 提取对象的值类型
type ValueOf<T> = T extends Record<string, infer V> ? V : T
```

**infer 的高级用法：**

```ts
// 1. 递归推断嵌套类型
type DeepFlatten<T> = T extends Array<infer U>
  ? DeepFlatten<U>
  : T

type Nested = DeepFlatten<number[][][]>  // number

// 2. 推断多个类型参数
type FirstTwo<T> = T extends [infer A, infer B, ...infer Rest]
  ? [A, B]
  : never

type Result = FirstTwo<[1, 2, 3, 4]>  // [1, 2]

// 3. 条件推断 - 配合多个条件
type Unwrap<T> = T extends Promise<infer U>
  ? U
  : T extends () => infer R
    ? R
    : T

type A = Unwrap<Promise<string>>      // string
type B = Unwrap<() => number>         // number
type C = Unwrap<boolean>              // boolean

// 4. 字符串模板推断（TS5.0+）
type ExtractRouteParams<T> = T extends `${string}:${infer Param}/${infer Rest}`
  ? Param | ExtractRouteParams<Rest>
  : T extends `${string}:${infer Param}`
    ? Param
    : never

type Params = ExtractRouteParams<"/api/:id/:name">  // "id" | "name"
```

**注意事项：**

```ts
// ❌ infer 必须在 extends 条件分支内使用
type Wrong<T> = infer U  // 语法错误

// ✅ 正确用法
type Right<T> = T extends string ? infer U : never

// infer 可以有约束（TS5.x）
type ExtractNumber<T> = T extends infer U extends number ? U : never
```

**知识点：** `条件类型` `infer` `类型推断` `分布式条件类型`

:::

---

### Q13: 模板字面量类型（Template Literal Types）的应用？

> **🔥 中等 · TypeScript**

请展示模板字面量类型的各种实际应用场景。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**基础用法回顾：**

```ts
// 字符串模式匹配
type Greeting = `Hello, ${string}`
let msg: Greeting = "Hello, World"  // ✅

// 多占位符
type EventName = `${"click" | "touch"}${"start" | "end"}`
// "clickstart" | "clickend" | "touchstart" | "touchend"
```

**实际应用场景：**

**1. CSS 属性映射：**

```ts
type Direction = "Top" | "Bottom" | "Left" | "Right"
type CSSMarginProps = {
  [K in `margin${Direction}`]?: string
}
// {
//   marginTop?: string
//   marginBottom?: string
//   marginLeft?: string
//   marginRight?: string
// }

// 配合 CSS 变量
type CSSVarName = `--${string}`
declare const cssVar: (name: CSSVarName) => string

cssVar("--primary-color")  // ✅
cssVar("primary-color")    // ❌
```

**2. API 路径类型生成：**

```ts
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"
type Resource = "user" | "post" | "comment"

type APIPath = `/api/${Resource}/${HttpMethod}`
// "/api/user/GET" | "/api/user/POST" | ...

// 更复杂的路径
type IdPath<T extends string> = `/api/${T}/\${number}`
```

**3. 事件系统类型安全：**

```ts
type EventType = "load" | "error" | "change" | "submit"
type EventTarget = "form" | "input" | "button" | "page"

type AppEvent = `${EventTarget}:${EventType}`
// "form:load" | "form:error" | "input:change" | ...

function emit(event: AppEvent, data?: any) {
  // ...
}

emit("form:submit")  // ✅
emit("unknown:event")  // ❌
```

**4. 方法名自动生成：**

```ts
type State = "idle" | "loading" | "success" | "error"

type StateMethods = {
  [K in `on${Capitalize<State>}`]: () => void
}
// {
//   onIdle: () => void
//   onLoading: () => void
//   onSuccess: () => void
//   onError: () => void
// }

// 带参数的版本
type StateWithPayload = {
  [K in `on${Capitalize<State>}`]: (payload: K) => void
}
```

**5. 字符串操作工具类型：**

```ts
// 首字母大写
type Capitalize2<S extends string> = S extends `${infer F}${infer R}`
  ? `${Uppercase<F>}${R}`
  : S

// 提取冒号后的部分
type AfterColon<S extends string> = S extends `${string}:${infer T}` ? T : S

type R1 = AfterColon<"name:string">  // "string"
type R2 = AfterColon<"name">         // "name"
```

**知识点：** `模板字面量类型` `字符串操作` `类型生成`

:::

---

### Q14: covariant 和 contravariant 在 TypeScript 中的体现？

> **🔥 困难 · TypeScript**

请详细解释 TypeScript 中协变和逆变的具体体现，以及如何正确使用。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**基础概念：**

```ts
// 类型层次
class Animal { name: string }
class Dog extends Animal { breed: string }

// Dog 是 Animal 的子类型 (Dog extends Animal)
```

**协变（Covariant）- 保持方向：**

```ts
// 返回值是协变的
type AnimalFactory = () => Animal
type DogFactory = () => Dog

let animalFn: AnimalFactory
let dogFn: DogFactory

// ✅ DogFactory 可以赋值给 AnimalFactory
// 因为承诺返回 Animal，实际返回更具体的 Dog
animalFn = dogFn  // ✅

// ❌ 反过来不行
dogFn = animalFn  // ❌ animalFn 可能返回 Cat
```

**逆变（Contravariant）- 方向相反：**

```ts
// 函数参数是逆变的
type AnimalHandler = (a: Animal) => void
type DogHandler = (d: Dog) => void

let animalHandler: AnimalHandler
let dogHandler: DogHandler

// ✅ AnimalHandler 可以赋值给 DogHandler
// 因为能处理 Animal 的函数一定能处理 Dog
dogHandler = animalHandler  // ✅

// ❌ 反过来不行
animalHandler = dogHandler  // ❌ DogHandler 不能处理所有 Animal
```

**TypeScript 中的具体体现：**

```ts
// 1. 函数类型
interface Comparer<T> {
  compare: (a: T, b: T) => number  // 参数逆变
}

function sort<T>(arr: T[], comparer: Comparer<T>) {
  // ...
}

// 2. 泛型接口
interface Producer<T> {
  produce: () => T  // 返回协变
}

interface Consumer<T> {
  consume: (item: T) => void  // 参数逆变
}

// 3. 数组是协变的
let animals: Animal[] = []
let dogs: Dog[] = []
animals = dogs  // ✅ 协变

// 4. 严格的函数检查
type StrictHandler = (x: Animal) => void
type LooseHandler = (x: Dog) => void

// strictFunctionTypes: true 时
let strictArr: StrictHandler[] = []
strictArr.push((x: Dog) => {})  // ✅ 逆变
```

**invariance（不变）- 双向都不允许：**

```ts
// 当类型同时出现在协变和逆变位置
interface Storage<T> {
  get: () => T      // 协变位置
  set: (v: T) => void  // 逆变位置
}

// Storage<Dog> 不能赋值给 Storage<Animal>，反之亦然
// 因为 T 同时出现在返回和参数位置
```

**实际应用：**

```ts
// 类型安全的回调设计
interface EventEmitter<T> {
  on: (event: keyof T, handler: (data: T[keyof T]) => void) => void
  emit: <K extends keyof T>(event: K, data: T[K]) => void
}

// 声明合并与变型
declare function map<T, U>(
  arr: T[],
  callback: (item: T, index: number) => U
): U[]
// callback 的参数 T 是逆变，返回值 U 是协变
```

**知识点：** `协变` `逆变` `函数类型` `类型系统`

:::

---

## 总结

本章深入探讨了 TypeScript 的高级类型特性：

- **泛型基础**：参数化类型，实现类型安全的复用代码
- **泛型约束**：使用 `extends` 限制泛型范围
- **条件类型**：`T extends U ? X : Y` 实现类型分支
- **映射类型**：基于现有类型创建新类型
- **infer 关键字**：在条件类型中推断和捕获类型
- **分布式条件类型**：联合类型的自动分发处理
- **协变与逆变**：理解类型构造器的变型规则
- **模板字面量类型**：编译时的字符串类型操作
- **泛型约束的高级用法**：keyof + extends 组合
- **条件类型与 infer 高级模式**：递归推断、多参数捕获
- **模板字面量类型应用**：CSS 属性、API 路径、事件系统
- **变型理论**：协变、逆变、不变在实际中的应用

掌握这些高级类型特性是成为 TypeScript 专家的关键。