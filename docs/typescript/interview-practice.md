---
title: TS 面试实战题
description: TypeScript 面试实战综合题、代码分析题、场景应用题
---

# TS 面试实战题

**知识点：** `综合应用` `代码分析` `场景设计` `最佳实践` `问题排查` `架构设计`

**难度分布：** 简单 30% / 中等 50% / 困难 20%

---

### Q1: 分析以下代码的类型问题并修复

> **⭐ 简单 · TypeScript**

```ts
interface User {
  id: number
  name: string
  email?: string
}

function createUser(data: User): User {
  return data
}

// 以下调用有什么问题？
const user1 = createUser({ name: "Homi" })
const user2 = createUser({ id: 1, name: "Claw", email: null })
```

::: details 点击查看答案与解析

**答案：**

**问题分析：**

1. `user1` 调用缺少必需的 `id` 属性
2. `user2` 调用中 `email: null` 不合法（`string | undefined` 不能接受 `null`）

**修复方案：**

```ts
interface User {
  id: number
  name: string
  email?: string | null  // 方案 1: 允许 null
}

// 或者保持原接口，修正调用
const user1 = createUser({ id: 1, name: "Homi" })  // 补全 id
const user2 = createUser({ id: 1, name: "Claw" })   // 移除 email 或使用 undefined
```

**更好的设计：**

```ts
// 使用 Pick 创建部分类型
function createUser(data: Pick<User, "id" | "name" | "email">): User {
  return data as User
}

// 或者使用 Required/Partial
type CreateUserInput = Omit<User, "id"> & { id?: number }

// 最佳实践：分离输入和输出类型
interface CreateUserInput {
  name: string
  email?: string
}

interface User extends CreateUserInput {
  id: number
  createdAt: Date
}

function createUser(input: CreateUserInput): User {
  return {
    ...input,
    id: generateId(),
    createdAt: new Date()
  }
}
```

**解析：**

- 可选属性 `?:` 表示可以是 `undefined`，不是 `null`
- `strictNullChecks` 开启后 `null` 和 `undefined` 是独立的
- 分离输入输出类型是更好的设计模式
- 使用 `Omit`、`Pick` 等工具类型派生相关类型

:::

---

### Q2: 实现一个类型安全的 EventEmitter

> **⭐ 中等 · TypeScript**

请实现一个类型安全的 EventEmitter 类，支持事件名和回调参数的类型检查。

::: details 点击查看答案与解析

**答案：**

```ts
type EventMap = {
  connect: () => void
  message: (data: string) => void
  error: (err: Error) => void
  data: (id: number, payload: unknown) => void
}

class EventEmitter<Events extends Record<string, (...args: any[]) => void>> {
  private listeners = new Map<keyof Events, Set<(...args: any[]) => void>>()

  on<K extends keyof Events>(event: K, listener: Events[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener as any)
  }

  off<K extends keyof Events>(event: K, listener: Events[K]): void {
    this.listeners.get(event)?.delete(listener as any)
  }

  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
    this.listeners.get(event)?.forEach(listener => listener(...args))
  }
}

// 使用
const emitter = new EventEmitter<EventMap>()

emitter.on("connect", () => console.log("Connected"))
emitter.on("message", (data) => console.log(data))
emitter.on("error", (err) => console.error(err))

emitter.emit("connect")
emitter.emit("message", "Hello")
emitter.emit("data", 1, { foo: "bar" })

// 以下会报错
// emitter.emit("message")           // ❌ 缺少参数
// emitter.emit("message", 123)      // ❌ 类型错误
// emitter.on("unknown", () => {})   // ❌ 未知事件
```

**泛型版本（更灵活）：**

```ts
interface EventMap {
  [event: string]: (...args: any[]) => void
}

class TypedEventEmitter<Events extends EventMap> {
  private listeners = new Map<keyof Events, Set<(...args: any[]) => void>>()

  on<K extends keyof Events>(event: K, listener: Events[K]): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener as any)
    return this
  }

  off<K extends keyof Events>(event: K, listener: Events[K]): this {
    this.listeners.get(event)?.delete(listener as any)
    return this
  }

  once<K extends keyof Events>(event: K, listener: Events[K]): this {
    const wrapper = (...args: Parameters<Events[K]>) => {
      this.off(event, wrapper)
      listener(...args)
    }
    return this.on(event, wrapper as Events[K])
  }

  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): boolean {
    const listeners = this.listeners.get(event)
    if (!listeners) return false
    listeners.forEach(listener => listener(...args))
    return true
  }
}

// 使用
interface MyEvents {
  user:login: (userId: string, timestamp: Date) => void
  user:logout: (userId: string) => void
  data:update: (key: string, value: unknown) => void
}

const events = new TypedEventEmitter<MyEvents>()
events.on("user:login", (id, time) => {})  // 类型安全
```

**解析：**

- 使用泛型约束事件映射类型
- `Parameters<T>` 提取函数参数类型
- `keyof Events` 确保事件名有效
- 返回 `this` 支持链式调用

:::

---

### Q3: 设计一个 API 响应的类型系统

> **⭐ 中等 · TypeScript**

请为一个 REST API 设计类型安全的响应处理系统，支持成功和错误状态。

::: details 点击查看答案与解析

**答案：**

```ts
// 基础响应类型
interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  timestamp: number
}

interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// 区分成功和失败响应
type SuccessResponse<T> = {
  success: true
  data: T
  error?: never
  timestamp: number
}

type ErrorResponse = {
  success: false
  data?: never
  error: ApiError
  timestamp: number
}

type ApiResult<T> = SuccessResponse<T> | ErrorResponse

// 区分联合的辅助函数
function isSuccess<T>(response: ApiResult<T>): response is SuccessResponse<T> {
  return response.success === true
}

function isError<T>(response: ApiResult<T>): response is ErrorResponse {
  return response.success === false
}

// RPC 调用函数
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(endpoint, options)
    const body = await res.json()
    
    if (!res.ok) {
      return {
        success: false,
        error: { code: `HTTP_${res.status}`, message: body.message },
        timestamp: Date.now()
      }
    }
    
    return {
      success: true,
      data: body as T,
      timestamp: Date.now()
    }
  } catch (e) {
    return {
      success: false,
      error: { code: "NETWORK", message: String(e) },
      timestamp: Date.now()
    }
  }
}

// 使用示例
async function fetchUser(id: number) {
  const result = await apiCall<User>(`/api/users/${id}`)
  
  if (isSuccess(result)) {
    console.log(result.data.name)  // 类型安全
  } else {
    console.error(result.error.message)
  }
  
  // 或者使用 switch
  switch (result.success) {
    case true:
      return result.data
    case false:
      throw new Error(result.error.message)
  }
}

// 更优雅的结果类型（Rust 风格）
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E }

function ok<T>(value: T): Result<T, never> {
  return { ok: true, value }
}

function err<E>(error: E): Result<never, E> {
  return { ok: false, error }
}

// 使用
type UserResult = Result<User, ApiError>
```

**解析：**

- 使用可辨别联合（Discriminated Union）区分成功/失败
- never 类型确保互斥属性
- 类型守卫函数帮助类型收窄
- Result 模式是函数式编程的常见实践

:::

---

### Q4: 实现一个配置验证器

> **⭐ 困难 · TypeScript**

请实现一个类型安全的配置验证器，能在编译时检查配置结构。

::: details 点击查看答案与解析

**答案：**

```ts
// 配置模式定义
type ConfigSchema = {
  [key: string]: {
    type: "string" | "number" | "boolean" | "array" | "object"
    required?: boolean
    default?: unknown
    validate?: (value: unknown) => boolean
    children?: ConfigSchema
  }
}

// 从 schema 推断配置类型
type InferConfig<T extends ConfigSchema> = {
  [K in keyof T]: T[K]["required"] extends true
    ? InferType<T[K]>
    : InferType<T[K]> | undefined
}

type InferType<S extends ConfigSchema[string]> = 
  S["type"] extends "string" ? string :
  S["type"] extends "number" ? number :
  S["type"] extends "boolean" ? boolean :
  S["type"] extends "array" ? InferType<S extends { items: infer I } ? I : any>[] :
  S["type"] extends "object" && S extends { children: infer C } 
    ? InferConfig<C & ConfigSchema>
    : unknown

// 配置验证器类
class ConfigValidator<S extends ConfigSchema> {
  constructor(private schema: S) {}

  validate(config: Record<string, unknown>): InferConfig<S> {
    const result: Record<string, unknown> = {}
    
    for (const [key, definition] of Object.entries(this.schema)) {
      const value = config[key]
      
      if (value === undefined) {
        if (definition.required) {
          throw new Error(`Missing required config: ${key}`)
        }
        result[key] = definition.default
        continue
      }
      
      if (!this.checkType(value, definition.type)) {
        throw new Error(`Invalid type for ${key}`)
      }
      
      if (definition.validate && !definition.validate(value)) {
        throw new Error(`Validation failed for ${key}`)
      }
      
      result[key] = value
    }
    
    return result as InferConfig<S>
  }

  private checkType(value: unknown, type: string): boolean {
    switch (type) {
      case "string": return typeof value === "string"
      case "number": return typeof value === "number"
      case "boolean": return typeof value === "boolean"
      case "array": return Array.isArray(value)
      case "object": return typeof value === "object" && value !== null
      default: return true
    }
  }
}

// 使用示例
const appSchema = {
  host: { type: "string" as const, required: true, default: "localhost" },
  port: { type: "number" as const, required: true, default: 3000 },
  debug: { type: "boolean" as const, required: false, default: false },
  features: { 
    type: "array" as const, 
    required: false,
    validate: (v: unknown) => Array.isArray(v) && v.every(x => typeof x === "string")
  }
} as const

type AppConfig = InferConfig<typeof appSchema>
// {
//   host: string
//   port: number
//   debug?: boolean | undefined
//   features?: string[] | undefined
// }

const validator = new ConfigValidator(appSchema)
const config = validator.validate({ host: "0.0.0.0", port: 8080 })
```

**解析：**

- 使用 `as const` 保持字面量类型
- `InferConfig` 是复杂类型体操，从 schema 推断配置类型
- 运行时验证 + 编译时类型提示
- 可以用于配置文件、环境变量等场景

:::

---

### Q5: 实现一个类型安全的路由系统

> **⭐ 困难 · TypeScript**

请设计一个类型安全的前端路由系统，能根据路径参数推断组件 Props。

::: details 点击查看答案与解析

**答案：**

```ts
// 路由定义
type RouteConfig = {
  path: string
  name: string
  component: React.ComponentType<any>
  exact?: boolean
}

// 路径参数提取
type ExtractPathParams<T extends string> = 
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractPathParams<Rest>
    : T extends `${string}:${infer Param}`
      ? Param
      : never

// 路由映射
interface RouteMap {
  "/": { params: {}; query: {} }
  "/users": { params: {}; query: { page?: number; limit?: number } }
  "/users/:id": { params: { id: string }; query: {} }
  "/posts/:postId/comments/:commentId": { 
    params: { postId: string; commentId: string }
    query: { sort?: "asc" | "desc" }
  }
}

// 导航函数类型
type NavigateTo<T extends keyof RouteMap> = 
  (params?: RouteMap[T]["params"], query?: RouteMap[T]["query"]) => string

// 路由钩子
function useParams<T extends keyof RouteMap>(): RouteMap[T]["params"]
function useParams() {
  // 运行时实现
  return {} as any
}

function useNavigate() {
  return <T extends keyof RouteMap>(
    route: T,
    params?: RouteMap[T]["params"],
    query?: RouteMap[T]["query"]
  ) => {
    // 导航实现
  }
}

// 使用示例
function UserProfile() {
  const { id } = useParams<"/users/:id">()  // { id: string }
  const navigate = useNavigate()
  
  return (
    <button onClick={() => navigate("/users", { id: "123" })}>
      Go to user {id}
    </button>
  )
}

function PostComment() {
  const { postId, commentId } = useParams<"/posts/:postId/comments/:commentId">()
  // postId 和 commentId 都是 string 类型
  
  const navigate = useNavigate()
  navigate("/posts/:postId/comments/:commentId", 
    { postId: "1", commentId: "2" },
    { sort: "desc" }
  )
}

// 编译时检查
// navigate("/users/:id", { id: 123 })  // ❌ id 应该是 string
// navigate("/invalid-route")           // ❌ 路由不存在
```

**解析：**

- 使用模板字面量类型定义路径模式
- `ExtractPathParams` 从路径字符串提取参数名
- 路由映射定义参数和查询类型
- 泛型函数提供类型安全的导航 API

:::

---

### Q6: 分析并修复以下泛型问题

> **⭐ 困难 · TypeScript**

```ts
// 问题 1: 为什么以下代码报错？
function first<T>(arr: T[]): T {
  return arr[0]
}
first([])  // 报错：Type 'undefined' is not assignable to type 'T'

// 问题 2: 如何修复？
function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b }
}
const result = merge({ a: 1 }, { b: 2 })
result.a  // 类型是 number & undefined ???
```

::: details 点击查看答案与解析

**答案：**

**问题 1 分析与修复：**

```ts
// 问题：空数组首元素是 undefined，但返回类型是 T
// 修复 1: 返回 T | undefined
function first<T>(arr: T[]): T | undefined {
  return arr[0]
}

// 修复 2: 添加运行时检查
function first<T>(arr: T[], fallback?: T): T {
  if (arr.length === 0) {
    if (fallback === undefined) {
      throw new Error("Empty array")
    }
    return fallback
  }
  return arr[0]
}

// 修复 3: 重载
function first<T>(arr: [T, ...T[]]): T
function first<T>(arr: T[]): T | undefined
function first<T>(arr: T[]): T | undefined {
  return arr[0]
}
```

**问题 2 分析与修复：**

```ts
// 实际上 result.a 的类型是 number，不是 number & undefined
// 但如果这样写就会有问题：
function mergeBad<T extends object, U extends object>(
  a: T, 
  b: U
): T & U {
  return { ...a, ...b }
}

// 问题在于重叠属性的类型合并
type Result = { a: number } & { a: string }  // { a: number & string } = never

// 修复：使用正确的类型定义
type Merge<T, U> = {
  [K in keyof T | keyof U]: 
    K extends keyof U ? U[K] : 
    K extends keyof T ? T[K] : never
}

function merge<T extends object, U extends object>(a: T, b: U): Merge<T, U> {
  return { ...a, ...b } as Merge<T, U>
}

// 或者使用自带的工具类型
type Result = Omit<{ a: number }, "a"> & { a: string }  // { a: string }
```

**解析：**

- 空数组访问返回 `undefined`，需要处理边界情况
- 函数重载可以提供更精确的类型
- 交叉类型的属性会做 `&` 运算，可能导致 `never`
- TypeScript 5.x 有更好的对象合并类型支持

:::

---

### Q7: 设计一个类型安全的表单验证系统

> **⭐ 中等 · TypeScript**

请为一个表单验证库设计类型系统，支持字段验证和错误提示。

::: details 点击查看答案与解析

**答案：**

```ts
// 验证规则类型
type Validator<T = any> = (value: T) => string | null | Promise<string | null>

// 字段定义
type FieldConfig<T = any> = {
  value: T
  validators?: Validator<T>[]
  touched: boolean
  error: string | null
}

// 表单状态
type FormState<Schema extends Record<string, any>> = {
  [K in keyof Schema]: FieldConfig<Schema[K]>
}

// 表单 Hook 类型
interface FormApi<Schema extends Record<string, any>> {
  values: { [K in keyof Schema]: Schema[K] }
  errors: { [K in keyof Schema]?: string }
  touched: { [K in keyof Schema]: boolean }
  setFieldValue: <K extends keyof Schema>(field: K, value: Schema[K]) => void
  setFieldTouched: <K extends keyof Schema>(field: K, touched: boolean) => void
  validate: () => Promise<{ [K in keyof Schema]?: string }>
  handleSubmit: (onSubmit: (values: FormValues<Schema>) => void) => (e: React.FormEvent) => void
  isSubmitting: boolean
  isValid: boolean
}

type FormValues<T> = { [K in keyof T]: T[K] }

// 实现示例
function createForm<Schema extends Record<string, any>>(
  initialValues: Schema,
  validationSchema?: ValidationSchema<Schema>
): FormApi<Schema> {
  // 实现细节...
}

// 使用示例
interface LoginForm {
  email: string
  password: string
  remember: boolean
}

const loginForm = createForm<LoginForm>({
  email: "",
  password: "",
  remember: false
}, {
  email: [
    (v) => !v ? "Email is required" : null,
    (v) => !/\S+@\S+\.\S+/.test(v) ? "Invalid email" : null
  ],
  password: [
    (v) => v.length < 8 ? "Password must be at least 8 characters" : null
  ]
})

// 类型安全使用
loginForm.setFieldValue("email", "test@example.com")  // ✅
loginForm.setFieldValue("email", 123)  // ❌ 类型错误
```

**解析：**

- 使用泛型保持表单值的类型
- 验证器返回错误信息或 null
- 支持异步验证（返回 Promise）
- 错误状态与字段值关联

:::

---

### Q8: 实现一个类型安全的 Redux Store

> **⭐ 困难 · TypeScript**

请设计 Redux 的风格的状态管理类型系统。

::: details 点击查看答案与解析

**答案：**

```ts
// Action 类型
interface Action<T extends string = string> {
  type: T
}

interface ActionWithPayload<T extends string, P> extends Action<T> {
  payload: P
}

// Action 创建器
type ActionCreator<T extends string, P = void> = 
  P extends void
    ? () => Action<T>
    : (payload: P) => ActionWithPayload<T, P>

// Reducer 类型
type Reducer<S, A extends Action> = (state: S, action: A) => S

// Store 类型
interface Store<S, A extends Action> {
  getState: () => S
  dispatch: <T extends A>(action: T) => T
  subscribe: (listener: () => void) => () => void
}

// 实际实现示例
interface Todo {
  id: string
  text: string
  completed: boolean
}

interface TodosState {
  items: Todo[]
  filter: "all" | "active" | "completed"
}

// Action 类型定义
type TodosAction = 
  | Action<"@todos/ADD"> & { payload: { text: string } }
  | Action<"@todos/TOGGLE"> & { payload: { id: string } }
  | Action<"@todos/SET_FILTER"> & { payload: TodosState["filter"] }

// Action Creators
const addTodo = (text: string): ActionWithPayload<"@todos/ADD", { text: string }> => ({
  type: "@todos/ADD",
  payload: { text }
})

const toggleTodo = (id: string) => ({
  type: "@todos/TOGGLE" as const,
  payload: { id }
})

// Reducer
function todosReducer(
  state: TodosState = { items: [], filter: "all" },
  action: TodosAction
): TodosState {
  switch (action.type) {
    case "@todos/ADD":
      return {
        ...state,
        items: [...state.items, {
          id: crypto.randomUUID(),
          text: action.payload.text,
          completed: false
        }]
      }
    case "@todos/TOGGLE":
      return {
        ...state,
        items: state.items.map(todo =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      }
    case "@todos/SET_FILTER":
      return { ...state, filter: action.payload }
    default:
      return state
  }
}

// 更现代的 Redux Toolkit 风格
import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const todosSlice = createSlice({
  name: "todos",
  initialState: { items: [] as Todo[], filter: "all" as const },
  reducers: {
    addTodo(state, action: PayloadAction<string>) {
      state.items.push({
        id: crypto.randomUUID(),
        text: action.payload,
        completed: false
      })
    },
    toggleTodo(state, action: PayloadAction<string>) {
      const todo = state.items.find(t => t.id === action.payload)
      if (todo) todo.completed = !todo.completed
    }
  }
})

// 导出的类型
type TodosState = ReturnType<typeof todosSlice.reducer>
type AddTodoAction = ReturnType<typeof todosSlice.actions.addTodo>
```

**解析：**

- 使用泛型保持 Action 和 Reducer 的类型安全
- Redux Toolkit 使用 Immer 简化了不可变更新
- `ReturnType` 用于从 slice 推导状态类型
- `PayloadAction` 提供 payload 的类型

:::

---

### Q9: 处理异步操作的最佳类型模式是什么？

> **⭐ 中等 · TypeScript**

请说明 TypeScript 中处理异步操作的类型模式，包括 Promise、async/await 和类型转换。

::: details 点击查看答案与解析

**答案：**

**1. Promise 类型标注**

```ts
// 函数返回 Promise
function fetchData(): Promise<User> {
  return fetch("/api/user").then(res => res.json())
}

// async 函数自动推断返回 Promise
async function getUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`)
  return res.json()
}
```

**2. 类型守卫与异步**

```ts
// 类型收窄
async function handleResponse(response: Response): Promise<User | null> {
  if (!response.ok) {
    if (response.status === 404) return null
    throw new Error(`HTTP ${response.status}`)
  }
  const data = await response.json()
  return data as User  // 需要类型断言
}

// 使用类型守卫
function isApiResponse<T>(data: unknown): data is { success: true; data: T } {
  return (
    typeof data === "object" &&
    data !== null &&
    "success" in data &&
    (data as { success: boolean }).success === true
  )
}
```

**3. 实用工具类型**

```ts
// 从 async 函数提取返回值类型
type AsyncReturnType<T extends (...args: any[]) => Promise<any>> = 
  Awaited<ReturnType<T>>

async function fetchData(): Promise<User[]> {
  return []
}

type UserData = AsyncReturnType<typeof fetchData>  // User[]

// 简化版本
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T

// 处理多个 Promise
type MergedPromises<T extends Promise<any>[]> = 
  { [K in keyof T]: UnwrapPromise<T[K]> }
```

**4. Promise.all 类型处理**

```ts
// Promise.all 返回元组类型
const [user, posts] = await Promise.all([
  fetchUser(id),
  fetchPosts(id)
])
// user: User
// posts: Post[]

// 处理 Promise.allSettled
type SettledResult<T> = 
  | { status: "fulfilled"; value: T }
  | { status: "rejected"; reason: unknown }

const results = await Promise.allSettled([p1, p2, p3])
// results: SettledResult<...>[]
```

**5. 错误处理类型模式**

```ts
// Result 类型（类似 Rust）
type Result<T, E = Error> = 
  | { ok: true; value: T }
  | { ok: false; error: E }

async function safeFetch<T>(
  promise: Promise<T>
): Promise<Result<T>> {
  try {
    const value = await promise
    return { ok: true, value }
  } catch (error) {
    return { ok: false, error: error as Error }
  }
}

// 使用
const result = await safeFetch(fetchData())
if (result.ok) {
  console.log(result.value)  // T 类型
} else {
  console.error(result.error)
}
```

**解析：**

- async 函数返回类型自动包裹为 `Promise<T>`
- 使用 `Awaited<T>` 提取 Promise 内部类型
- Result 模式提供更好的错误处理类型
- `Promise.all` 返回元组，保持各元素类型

:::

---

### Q10: 实战场景 - 设计一个类型安全的 API 客户端

> **⭐ 困难 · TypeScript**

请为一个 REST API 设计完整的类型安全客户端，包括请求、响应、错误处理。

::: details 点击查看答案与解析

**答案：**

```ts
// API 端点定义
interface ApiEndpoints {
  "GET /users": { params: {}; response: User[] }
  "GET /users/:id": { params: { id: string }; response: User }
  "POST /users": { body: { name: string; email: string }; response: User }
  "PUT /users/:id": { params: { id: string }; body: Partial<User>; response: User }
  "DELETE /users/:id": { params: { id: string }; response: void }
}

// 从路径提取参数类型
type ExtractPathParams<Path extends string> = 
  Path extends `${string}:${infer P}/${infer Rest}`
    ? { [K in P | keyof ExtractPathParams<`/${Rest}`>]: string }
    : Path extends `${string}:${infer P}`
      ? { [K in P]: string }
      : {}

// 通用 API 类型
type ApiMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
type EndpointKey = keyof ApiEndpoints

// API 客户端类
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    })
    
    if (!res.ok) {
      throw new ApiError(res.status, await res.text())
    }
    
    if (res.status === 204) {
      return undefined as T
    }
    
    return res.json()
  }

  // 类型安全的 HTTP 方法
  async get<
    E extends EndpointKey,
    Path extends E & `GET ${string}`
  >(
    endpoint: Path,
    options?: { params?: ExtractPathParams<Path> }
  ): Promise<ApiEndpoints[E]["response"]> {
    // 实现...
    return this.request(endpoint)
  }

  async post<
    E extends EndpointKey,
    Path extends E & `POST ${string}`
  >(
    endpoint: Path,
    data: ApiEndpoints[E]["body"]
  ): Promise<ApiEndpoints[E]["response"]> {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }
}

// 使用示例
const api = new ApiClient("https://api.example.com")

// 类型安全调用
const users = await api.get("GET /users")
const user = await api.get("GET /users/:id", { params: { id: "123" } })
const created = await api.post("POST /users", { name: "Homi", email: "homi@example.com" })

// 错误类型
class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message)
  }
}

// 更简洁的 Hook 风格
function createApi<Endpoints extends Record<string, any>>() {
  return {
    async query<T extends keyof Endpoints>(
      endpoint: T,
      ...args: any[]
    ): Promise<Endpoints[T]["response"]> {
      // 实现
    }
  }
}

const apiHooks = createApi<ApiEndpoints>()
```

**解析：**

- 使用模板字面量类型定义端点
- 路径参数通过类型推断
- 每个 HTTP 方法有精确的类型约束
- 错误处理使用自定义错误类

:::

---

## 总结

本章通过实战题目覆盖了 TypeScript 在真实场景中的应用：

- **用户创建与验证**：可选属性与 null 处理
- **事件系统**：类型安全的 EventEmitter
- **API 响应**：可辨别联合与 Result 模式
- **配置验证**：从 Schema 推断类型
- **路由系统**：路径参数类型推断
- **泛型修复**：常见泛型陷阱与解决方案
- **表单验证**：状态管理与错误处理
- **Redux 模式**：状态管理类型设计
- **异步处理**：Promise 类型模式与 Result 类型
- **API 客户端**：完整的类型安全 API 层

掌握这些实战技巧，能够在实际项目中充分发挥 TypeScript 的类型系统优势。