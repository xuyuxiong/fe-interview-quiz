---
title: 类型体操与工具类型
description: TypeScript 类型体操技巧、常用工具类型实现、高级类型操作面试题
---

# 类型体操与工具类型

**知识点：** `类型体操` `工具类型` `条件类型` `递归类型` `类型计算` `字符串操作类型`

**难度分布：** 简单 30% / 中等 50% / 困难 20%

---

### Q1: TypeScript 有哪些内置工具类型？列举至少 8 个。

> **⭐ 简单 · TypeScript**

请列举 TypeScript 内置的常用工具类型，并简要说明其作用。

::: details 点击查看答案与解析

**答案：**

| 工具类型 | 作用 | 实现简述 |
|----------|------|----------|
| `Partial<T>` | 所有属性变可选 | `{ [K in keyof T]?: T[K] }` |
| `Required<T>` | 所有属性变必选 | `{ [K in keyof T]-?: T[K] }` |
| `Readonly<T>` | 所有属性变只读 | `{ readonly [K in keyof T]: T[K] }` |
| `Record<K, T>` | 构造键值对类型 | `{ [P in K]: T }` |
| `Pick<T, K>` | 选取部分属性 | `{ [P in K]: T[P] }` |
| `Omit<T, K>` | 排除部分属性 | `Pick<T, Exclude<keyof T, K>>` |
| `Exclude<T, U>` | 从联合类型排除 | `T extends U ? never : T` |
| `Extract<T, U>` | 从联合类型提取 | `T extends U ? T : never` |
| `NonNullable<T>` | 排除 null 和 undefined | `T extends null \| undefined ? never : T` |
| `ReturnType<T>` | 获取函数返回类型 | `T extends (...args: any[]) => infer R ? R : any` |
| `Parameters<T>` | 获取函数参数类型 | `T extends (...args: infer P) => any ? P : never` |
| `InstanceType<T>` | 获取构造函数实例类型 | `T extends new (...args: any[]) => infer R ? R : any` |
| `ThisParameterType<T>` | 获取 this 参数类型 | - |
| `OmitThisParameter<T>` | 移除 this 参数 | - |
| `Mutable<T>` | 移除 readonly | 与 Readonly 相反 |

**解析：**

- 这些工具类型定义在 `lib.es5.d.ts` 等内置类型文件中
- 大部分基于条件类型和映射类型实现
- 熟练使用工具类型可以大幅提升开发效率
- 理解原理后可以自定义更贴合业务的工具类型

:::

---

### Q2: 如何实现一个 DeepPartial 工具类型？

> **⭐ 中等 · TypeScript**

请手写实现 `DeepPartial<T>`，将对象及其所有嵌套对象的属性都变为可选。

::: details 点击查看答案与解析

**答案：**

```ts
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepPartial<T[K]>
    : T[K]
}

// 测试
interface Config {
  server: {
    host: string
    port: number
    options: {
      timeout: number
      retries: number
    }
  }
  database: {
    url: string
    credentials: {
      username: string
      password: string
    }
  }
}

type PartialConfig = DeepPartial<Config>

// 可以只设置深层的某个属性
const config: PartialConfig = {
  server: {
    options: {
      timeout: 5000
    }
  }
}
```

**解析：**

- 使用递归条件类型处理嵌套对象
- 需要排除函数类型（函数不应该被递归处理）
- 只处理 `object` 类型，基础类型保持不变
- 这是类型体操的经典入门题目

:::

---

### Q3: 如何实现一个 FlatMap 类型，将嵌套数组合并？

> **⭐ 困难 · TypeScript**

请实现 `FlatMap<T>` 类型，将 `T` 中所有嵌套的数组展开一层。

::: details 点击查看答案与解析

**答案：**

```ts
type FlatMap<T> = T extends Array<infer U>
  ? U extends Array<infer V>
    ? V[]
    : U[]
  : T

// 测试
type A = FlatMap<(string | number)[]>       // string | number
type B = FlatMap<string[][]>                 // string[]
type C = FlatMap<(string[] | number[])[]>    // string | number

// 更通用的版本（处理任意嵌套）
type Flatten<T, D extends number = 1> = 
  D extends 0 
    ? T 
    : T extends Array<infer U>
      ? Flatten<U, Decrement[D]>
      : T

// TypeScript 没有内置的 Decrement，需要手动定义
type Decrement = [0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

// 简化版本
type SimpleFlatten<T> = T extends Array<infer U> ? U : T

type Result = SimpleFlatten<(string | number)[]>  // string | number
```

**解析：**

- 使用 `infer` 提取数组元素类型
- 嵌套条件类型处理多层数组
- 完全通用的深度展开需要递归和数字运算
- TypeScript 5.x 对递归深度有限制

:::

---

### Q4: 如何实现一个 Trim 类型，去除字符串首尾空格？

> **⭐ 困难 · TypeScript**

请使用模板字面量类型实现 `Trim<T>`，去除字符串字面量类型首尾的空格。

::: details 点击查看答案与解析

**答案：**

```ts
// 去除首尾空格
type Trim<T extends string> = TrimEnd<TrimStart<T>>

// 去除开头空格
type TrimStart<T extends string> = T extends ` ${infer Rest}`
  ? TrimStart<Rest>
  : T

// 去除结尾空格
type TrimEnd<T extends string> = T extends `${infer Rest} `
  ? TrimEnd<Rest>
  : T

// 测试
type A = Trim<"  Hello World  ">   // "Hello World"
type B = TrimStart<"  Test">        // "Test"
type C = TrimEnd<"Test  ">          // "Test"
type D = Trim<"NoSpaces">           // "NoSpaces"

// 去除所有空白字符（包括换行、制表符）
type TrimAll<T extends string> = T extends 
  ` ${infer R}` | `\t${infer R}` | `\n${infer R}` | `\r${infer R}`
  ? TrimAll<R>
  : T extends 
    `${infer R} ` | `${infer R}\t` | `${infer R}\n` | `${infer R}\r`
  ? TrimAll<R>
  : T
```

**解析：**

- 使用递归模板字面量类型
- `infer` 捕获剩余部分继续递归
- 基础情况：不匹配空格模式时返回原类型
- 可以扩展支持更多空白字符

:::

---

### Q5: 如何实现 CamelCase 类型转换？

> **⭐ 困难 · TypeScript**

请实现 `CamelCase<T>`，将 kebab-case 或 snake_case 字符串转换为 camelCase。

::: details 点击查看答案与解析

**答案：**

```ts
// 辅助类型：首字母大写
type Capitalize<T extends string> = 
  T extends `${infer First}${infer Rest}`
    ? `${Uppercase<First>}${Rest}`
    : T

// 将 kebab-case 转为 camelCase
type CamelCase<T extends string> = 
  T extends `${infer First}-${infer Rest}`
    ? `${Lowercase<First>}${CapitalizeCamel<Rest>}`
    : T

// 处理剩余部分（首字母大写拼接）
type CapitalizeCamel<T extends string> = 
  T extends `${infer First}-${infer Rest}`
    ? `${Capitalize<First>}${CapitalizeCamel<Rest>}`
    : Capitalize<T>

// 处理 snake_case
type SnakeToCamel<T extends string> = 
  T extends `${infer First}_${infer Rest}`
    ? `${Lowercase<First>}${CapitalizeCamelUnderscore<Rest>}`
    : T

type CapitalizeCamelUnderscore<T extends string> = 
  T extends `${infer First}_${infer Rest}`
    ? `${Capitalize<First>}${CapitalizeCamelUnderscore<Rest>}`
    : Capitalize<T>

// 测试
type A = CamelCase<"user-name">           // "userName"
type B = CamelCase<"first-middle-last">   // "firstMiddleLast"
type C = SnakeToCamel<"user_name">        // "userName"
type D = SnakeToCamel<"api_response_data"> // "apiResponseData"

// 通用版本：同时支持 - 和 _
type ToCamelCase<T extends string> = 
  T extends `${infer First}-${infer Rest}` | `${infer First}_${infer Rest}`
    ? `${Lowercase<First>}${ToCamelCaseTail<Rest>}`
    : T

type ToCamelCaseTail<T extends string> = 
  T extends `${infer First}-${infer Rest}` | `${infer First}_${infer Rest}`
    ? `${Capitalize<First>}${ToCamelCaseTail<Rest>}`
    : Capitalize<T>
```

**解析：**

- 使用模板字面量类型匹配分隔符
- `infer` 捕获分隔符前后的部分
- 配合 `Capitalize` 和 `Lowercase` 内置工具
- 可以用联合类型同时处理多种分隔符

:::

---

### Q6: 如何实现一个 TupleToUnion 类型？

> **⭐ 中等 · TypeScript**

请实现 `TupleToUnion<T>`，将元组类型转换为联合类型。

::: details 点击查看答案与解析

**答案：**

```ts
// 方法 1：索引访问
type TupleToUnion<T extends readonly any[]> = T[number]

// 测试
type A = TupleToUnion<["a", "b", "c"]>  // "a" | "b" | "c"
type B = TupleToUnion<[string, number, boolean]>  // string | number | boolean

// 方法 2：使用 infer 和递归
type TupleToUnionV2<T extends readonly any[]> = 
  T extends readonly [infer First, ...infer Rest]
    ? First | TupleToUnionV2<Rest>
    : never

// 测试
type C = TupleToUnionV2<["x", "y", "z"]>  // "x" | "y" | "z"

// 变体：获取元组最后一个元素
type LastElement<T extends readonly any[]> = 
  T extends [...infer _, infer Last] ? Last : never

type D = LastElement<[1, 2, 3, 4]>  // 4

// 变体：获取元组长度
type TupleLength<T extends readonly any[]> = T["length"]
type E = TupleLength<[string, number, boolean]>  // 3
```

**解析：**

- `T[number]` 是最简洁的实现方式
- TypeScript 允许用数字索引访问元组得到联合类型
- 递归版本展示了类型体操的思路
- 理解元组与联合类型的关系很重要

:::

---

### Q7: 如何实现一个 Chain 类型的 API 调用链类型推断？

> **⭐ 困难 · TypeScript**

请参考链式调用场景，实现一个支持方法链的类型推断。

::: details 点击查看答案与解析

**答案：**

```ts
// 链式调用的类型定义
interface Chainable<T = {}> {
  option<K extends string, V>(
    key: K,
    value: V
  ): Chainable<T & { [P in K]: V }>
  
  get(): T
}

// 使用示例（实际实现）
function createChainable(): Chainable {
  const result: any = {}
  
  return {
    option(key: string, value: any) {
      result[key] = value
      return this
    },
    get() {
      return result
    }
  }
}

// 类型层面的 Chain
type ChainResult = Chainable
  & {
    option<K extends string, V>(
      key: K,
      value: V
    ): Chainable<{ [P in K]: V }>
  }

// 手写类型模拟链式推导
type ChainState<T = {}> = {
  set<K extends string, V>(
    key: K,
    value: V
  ): ChainState<T & Record<K, V>>
  done: T
}

// 测试
type Step1 = ChainState["set"<"name", string>]
type Step2 = Step1["set"<"age", number>]
type Result = Step2["done"]  // { name: string; age: number }
```

**解析：**

- 链式调用类型需要返回新的类型状态
- 每次调用都返回包含累积类型的新实例
- 使用交叉类型 `&` 累加属性
- 这种模式在 Builder 模式和 Fluent API 中很常见

:::

---

### Q8: 如何实现一个 AnyOf 类型？

> **⭐ 困难 · TypeScript**

请实现 `AnyOf<T>`，检查数组中是否有任何 truthy 值，返回布尔字面量类型。

::: details 点击查看答案与解析

**答案：**

```ts
// truthy 判断类型
type IsTruthy<T> = 
  T extends 0 | "" | false | null | undefined | 0n
    ? false
    : true

// AnyOf 实现
type AnyOf<T extends readonly any[]> = 
  T extends [infer First, ...infer Rest]
    ? IsTruthy<First> extends true
      ? true
      : AnyOf<Rest>
    : false

// 测试
type A = AnyOf<[0, "", false, null]>      // false
type B = AnyOf<[0, "", "hello", null]>    // true
type C = AnyOf<[0, 0, 0]>                 // false
type D = AnyOf<[]>                        // false
type E = AnyOf<[1, 2, 3]>                 // true

// 更完整的 truthy 检查
type IsFalsy<T> = 
  T extends 0 | 0n | "" | false | null | undefined | [] | Record<string, never>
    ? true
    : false

type AnyOfV2<T extends readonly any[]> = 
  T extends [infer First, ...infer Rest]
    ? IsFalsy<First> extends true
      ? AnyOfV2<Rest>
      : true
    : false
```

**解析：**

- 使用递归检查数组每个元素
- 需要定义什么是 falsy 值
- JavaScript 的 falsy 值：0、""、false、null、undefined、NaN、0n
- 这是类型层面实现逻辑运算的例子

:::

---

### Q9: 如何实现一个 Replace 字符串替换类型？

> **⭐ 中等 · TypeScript**

请实现 `Replace<T, From, To>`，将字符串 `T` 中的第一个 `From` 替换为 `To`。

::: details 点击查看答案与解析

**答案：**

```ts
// 替换第一个匹配
type Replace<T extends string, From extends string, To extends string> = 
  From extends ""
    ? T
    : T extends `${infer Prefix}${From}${infer Suffix}`
      ? `${Prefix}${To}${Suffix}`
      : T

// 测试
type A = Replace<"Hello World", "World", "TypeScript">  
// "Hello TypeScript"

type B = Replace<"foo bar foo", "foo", "baz">  
// "baz bar foo" (只替换第一个)

type C = Replace<"No match here", "xyz", "abc">  
// "No match here" (无匹配)

// 替换所有匹配
type ReplaceAll<T extends string, From extends string, To extends string> = 
  From extends ""
    ? T
    : T extends `${infer Prefix}${From}${infer Suffix}`
      ? `${Prefix}${To}${ReplaceAll<Suffix, From, To>}`
      : T

// 测试
type D = ReplaceAll<"foo bar foo", "foo", "baz">  
// "baz bar baz"

type E = ReplaceAll<"aaa", "a", "X">  
// "XXX"
```

**解析：**

- 使用模板字面量类型和 `infer` 捕获匹配前后
- `Replace` 只替换第一个匹配
- `ReplaceAll` 递归替换所有匹配
- 需要处理空字符串的边界情况

:::

---

### Q10: 如何实现一个 AppendArgument 类型？

> **⭐ 中等 · TypeScript**

请实现 `AppendArgument<T, A>`，在函数类型 `T` 的参数列表末尾追加一个新参数 `A`。

::: details 点击查看答案与解析

**答案：**

```ts
type AppendArgument<T extends (...args: any[]) => any, A> = 
  T extends (...args: infer P) => infer R
    ? (...args: [...P, A]) => R
    : never

// 测试
type Fn1 = (a: number, b: string) => boolean
type Fn2 = AppendArgument<Fn1, boolean>  
// (a: number, b: string, arg: boolean) => boolean

type Fn3 = () => void
type Fn4 = AppendArgument<Fn3, string>  
// (arg: string) => void

type Fn5 = (x: { id: number }) => string
type Fn6 = AppendArgument<Fn5, number>  
// (x: { id: number }, arg: number) => string

// 变体：在开头添加参数
type PrependArgument<T extends (...args: any[]) => any, A> = 
  T extends (...args: infer P) => infer R
    ? (arg: A, ...args: P) => R
    : never

type Fn7 = PrependArgument<Fn1, Date>  
// (arg: Date, a: number, b: string) => boolean
```

**解析：**

- 使用 `infer P` 提取参数元组
- 使用 `infer R` 提取返回类型
- 用元组展开语法 `[...P, A]` 追加参数
- 这是改造函数签名的典型例子

:::

---

### Q11: 实现 DeepPartial、DeepRequired、DeepReadonly？

> **🔥 困难 · TypeScript**

请实现一组深度递归工具类型：`DeepPartial`、`DeepRequired`、`DeepReadonly`。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**DeepPartial 实现：**

```ts
type DeepPartial<T> = T extends Function
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T

// 测试
interface Config {
  server: {
    host: string
    port: number
  }
  db: {
    url: string
    auth: {
      user: string
      pass: string
    }
  }
}

type PartialConfig = DeepPartial<Config>
// {
//   server?: {
//     host?: string
//     port?: number
//   }
//   db?: {
//     url?: string
//     auth?: {
//       user?: string
//       pass?: string
//     }
//   }
// }
```

**DeepRequired 实现：**

```ts
type DeepRequired<T> = T extends Function
  ? T
  : T extends object
    ? { [K in keyof T]-?: DeepRequired<T[K]> }
    : T

// 测试
type RequiredConfig = DeepRequired<PartialConfig>
// 恢复到原始 Config 类型
```

**DeepReadonly 实现：**

```ts
type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T

// 测试
interface State {
  count: number
  nested: {
    items: string[]
  }
}

type ReadonlyState = DeepReadonly<State>
// {
//   readonly count: number
//   readonly nested: {
//     readonly items: readonly string[]
//   }
// }
```

**综合版本（可组合）：**

```ts
// 深度可变的
type DeepMutable<T> = T extends Function
  ? T
  : T extends object
    ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
    : T

// 组合使用
type ReadonlyThenPartial<T> = DeepPartial<DeepReadonly<T>>
type ReadonlyThenRequired<T> = DeepRequired<DeepReadonly<T>>
```

**注意事项：**

```ts
// 1. 处理数组
type DeepPartialArray<T> = T extends Array<infer U>
  ? DeepPartial<U>[]
  : T extends object
    ? { [K in keyof T]?: DeepPartialArray<T[K]> }
    : T

// 2. 处理 Map/Set 等内置类型
type DeepPartialBuiltIn<T> = T extends Map<infer K, infer V>
  ? Map<DeepPartialBuiltIn<K>, DeepPartialBuiltIn<V>>
  : T extends Set<infer U>
    ? Set<DeepPartialBuiltIn<U>>
    : T extends Function
      ? T
      : T extends object
        ? { [K in keyof T]?: DeepPartialBuiltIn<T[K]> }
        : T
```

**知识点：** `DeepPartial` `DeepRequired` `DeepReadonly` `递归类型`

:::

---

### Q12: 实现 UnionToIntersection？利用函数参数逆变？

> **🔥 困难 · TypeScript**

请实现 `UnionToIntersection<T>`，将联合类型转换为交叉类型。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**实现原理：利用函数参数的逆变特性**

```ts
// 核心实现
type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends 
    ((k: infer I) => void) 
      ? I 
      : never

// 测试
type A = UnionToIntersection<{ a: string } | { b: number }>
// { a: string } & { b: number }

type B = UnionToIntersection<(() => void) | ((x: number) => void)>
// (() => void) & ((x: number) => void)
```

**工作原理详解：**

```ts
// 步骤 1: 分布式条件类型
// U extends any ? (k: U) => void : never
// 当 U = A | B | C 时，会分发为:
// ((k: A) => void) | ((k: B) => void) | ((k: C) => void)

// 步骤 2: 利用逆变捕获
// 函数类型是逆变的，所以:
// ((k: A) => void) | ((k: B) => void)
// 作为参数类型时等价于:
// (k: A & B) => void

// 步骤 3: infer 提取
// 从 (k: infer I) => void 中提取 I
// 得到 A & B
```

**实际应用：**

```ts
// 1. 合并多个接口的属性
type Props = { onClick: () => void } | { onFocus: () => void }
type MergedProps = UnionToIntersection<Props>
// { onClick: () => void } & { onFocus: () => void }

// 2. 提取所有方法的返回类型
type Methods<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : never
}[keyof T]

type ReturnTypes<T> = 
  UnionToIntersection<ReturnType<Methods<T>>>

// 3. 合并多个类的实例类型
class A { a: string }
class B { b: number }
type C = UnionToIntersection<InstanceType<typeof A> | InstanceType<typeof B>>
// { a: string } & { b: number }
```

**变体：获取联合类型的最后一个成员**

```ts
type LastOfUnion<U> = 
  UnionToIntersection<U extends any ? () => U : never> extends 
    () => infer R 
      ? R 
      : never

type Last = LastOfUnion<"a" | "b" | "c">  // "c"
```

**注意：**

- 联合类型的顺序是不确定的
- 这个技巧依赖于 TypeScript 的内部实现细节
- 在复杂场景中可能不如预期工作

**知识点：** `UnionToIntersection` `函数参数逆变` `类型技巧`

:::

---

### Q13: 实现 PickByType、OmitByType？按值类型选择属性？

> **🔥 困难 · TypeScript**

请实现按值类型过滤对象属性的工具类型。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**PickByType 实现：**

```ts
type PickByType<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K]
}

// 测试
interface Mixed {
  name: string
  age: number
  active: boolean
  email: string
  score: number
}

type StringProps = PickByType<Mixed, string>
// { name: string; email: string }

type NumberProps = PickByType<Mixed, number>
// { age: number; score: number }

type BooleanProps = PickByType<Mixed, boolean>
// { active: boolean }
```

**OmitByType 实现：**

```ts
type OmitByType<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K]
}

// 测试
type NonStringProps = OmitByType<Mixed, string>
// { age: number; active: boolean; score: number }

type NonNumberProps = OmitByType<Mixed, number>
// { name: string; active: boolean; email: string }
```

**精确匹配版本（排除子类型）：**

```ts
type ExactType<T, U> = 
  [T] extends [U] 
    ? [U] extends [T] 
      ? T 
      : never 
    : never

type PickByExactType<T, V> = {
  [K in keyof T as ExactType<T[K], V> extends never ? never : K]: T[K]
}

// 测试
interface Data {
  str: string
  lit: "exact"
  num: number
}

type ExactStrings = PickByExactType<Data, string>
// { str: string } // 不包括 lit，因为 "exact" 不是精确的 string

type ExactLits = PickByExactType<Data, "exact">
// { lit: "exact" }
```

**实用工具组合：**

```ts
// 按类型分组所有属性
type GroupByType<T> = {
  string: PickByType<T, string>
  number: PickByType<T, number>
  boolean: PickByType<T, boolean>
  function: PickByType<T, (...args: any) => any>
  object: PickByType<T, object>
}

// 提取可选属性
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]

type PickOptional<T> = Pick<T, OptionalKeys<T>>

// 提取必选属性
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

type PickRequired<T> = Pick<T, RequiredKeys<T>>
```

**使用场景：**

```ts
// API 响应数据清理
interface APIResponse {
  id: number
  name: string
  createdAt: Date
  updatedAt: Date
  metadata: Record<string, any>
}

// 只保留字符串属性用于展示
type DisplayProps = PickByType<APIResponse, string>

// 只保留可序列化的属性
type Serializable = OmitByType<APIResponse, Date | Function>
```

**知识点：** `PickByType` `OmitByType` `as 子句` `条件类型`

:::

---

### Q14: 实现 IsEqual？为什么 A extends B extends A 不够？

> **🔥 困难 · TypeScript**

请实现一个类型级别的相等检查 `IsEqual<A, B>`。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**简单版本的问题：**

```ts
// 常见错误实现
type SimpleEqual<A, B> = 
  A extends B 
    ? B extends A 
      ? true 
      : false 
    : false

// 问题 1: any 的情况
type T1 = SimpleEqual<any, any>  // false ❌ (应该是 true)
// 因为 any extends anything 总是 true，但 any 不等于 any

// 问题 2: never 的情况  
type T2 = SimpleEqual<never, never>  // true ✅

// 问题 3: 联合类型的顺序
type T3 = SimpleEqual<1 | 2, 2 | 1>  // true ✅ (联合类型无序)
```

**正确的 IsEqual 实现：**

```ts
type IsEqual<A, B> = 
  (<T>() => T extends A ? 1 : 2) extends 
  (<T>() => T extends B ? 1 : 2)
    ? true
    : false

// 测试
type A1 = IsEqual<string, string>      // true
type A2 = IsEqual<string, number>      // false
type A3 = IsEqual<any, any>            // true ✅
type A4 = IsEqual<never, never>        // true ✅
type A5 = IsEqual<{ a: 1 }, { a: 1 }>  // true
type A6 = IsEqual<1 | 2, 2 | 1>        // true ✅
```

**工作原理：**

```ts
// 利用泛型函数的返回值类型进行比较
// <T>() => T extends A ? 1 : 2 是一个泛型箭头函数类型

// 当 A = string 时：
// <T>() => T extends string ? 1 : 2

// 当 B = string 时：
// <T>() => T extends string ? 1 : 2

// 两个函数类型相同，所以 extends 返回 true

// 关键：这种方式绕过了 any 的特殊行为
```

**更健壮的实现（处理边缘情况）：**

```ts
type IsEqualV2<A, B> = 
  (<T>() => T extends A ? 1 : 0) extends 
  (<U>() => U extends B ? 1 : 0)
    ? (<V>() => V extends B ? 1 : 0) extends
      (<W>() => W extends A ? 1 : 0)
        ? true
        : false
    : false

// 使用 0 和 1 避免数字字面量的特殊情况
```

**实际应用：**

```ts
// 条件类型中的精确匹配
type IfEqual<A, B, Then, Else = never> = 
  IsEqual<A, B> extends true ? Then : Else

type Result1 = IfEqual<string, string, "yes", "no">  // "yes"
type Result2 = IfEqual<string, number, "yes", "no">  // "no"

// 防止过度泛化
type ExactMatch<T, Expected> = 
  IsEqual<T, Expected> extends true 
    ? T 
    : "Type mismatch"

// 类型测试断言
type AssertEqual<T, U> = 
  IsEqual<T, U> extends true 
    ? true 
    : { error: "Types are not equal"; got: T; expected: U }
```

**为什么 A extends B && B extends A 不够：**

```ts
// 问题 1: any 的双向 extends 也是 true
type TestAny = any extends string ? true : false  // true ❌
type TestAny2 = string extends any ? true : false // true ✅
// any extends string 是 true，这违反直觉

// 问题 2: 某些边缘类型
type TestNever = never extends never ? true : false // true
// 但 never 是底部类型，任何 extends never 都是 false

// 泛型函数方法规避了这些问题
```

**知识点：** `IsEqual` `类型相等` `泛型函数` `类型比较`

:::

---

## 总结

本章深入探讨了 TypeScript 类型体操的技巧和应用：

- **内置工具类型**：熟悉 Partial、Pick、Omit 等常用工具
- **DeepPartial**：递归处理嵌套对象
- **FlatMap/Flatten**：数组展开类型
- **Trim**：字符串处理类型
- **CamelCase**：字符串格式转换
- **TupleToUnion**：元组与联合类型转换
- **Chainable**：链式调用类型推断
- **AnyOf**：类型层面的逻辑运算
- **Replace**：字符串替换
- **AppendArgument**：函数签名改造
- **DeepPartial/DeepRequired/DeepReadonly**：深度递归工具
- **UnionToIntersection**：联合转交叉的高级技巧
- **PickByType/OmitByType**：按值类型过滤属性
- **IsEqual**：类型相等的精确判断

掌握这些类型体操技巧，可以编写出更强大、更灵活的类型定义。