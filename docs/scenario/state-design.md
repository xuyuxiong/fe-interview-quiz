---
title: 状态设计方案面试题
description: 覆盖客户端服务端状态/全局局部状态/状态管理选型/React Query 等 6 道题
---

# 状态设计方案面试题

### Q1: 客户端 vs 服务端状态

> **⭐ 简单 · 状态分类**

请解释客户端状态和服务端状态的区别。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**客户端状态（Client State）：**
- 由前端应用创建和管理
- 存储在浏览器本地
- 典型例子：UI 状态、表单输入、筛选条件

**服务端状态（Server State）：**
- 来源于后端 API
- 需要网络请求获取
- 典型例子：用户数据、商品列表、订单信息

**对比表格：**

| 特性 | 客户端状态 | 服务端状态 |
|------|-----------|-----------|
| 数据来源 | 用户交互/本地计算 | API 响应 |
| 持久化 | LocalStorage/内存 | 数据库 |
| 同步 | 单向（本地） | 双向（需要刷新） |
| 缓存 | 简单 | 需要失效策略 |
| 工具 | useState/useReducer | React Query/SWR |

```jsx
// 客户端状态示例
function FilterPanel() {
  const [filters, setFilters] = useState({
    category: '',
    priceRange: [0, 1000],
    inStock: false
  })
  
  return (
    <div>
      <select value={filters.category} 
              onChange={e => setFilters({...filters, category: e.target.value})}>
        <option value="">All</option>
        <option value="electronics">Electronics</option>
      </select>
    </div>
  )
}

// 服务端状态示例（传统方式）
function ProductList() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    setLoading(true)
    fetch('/api/products').then(...).catch(...)
  }, [])
  
  // ❌ 问题：
  // - 手动管理 loading/error
  // - 没有缓存
  // - 没有重新获取逻辑
}

// 服务端状态（使用 React Query）
function ProductList() {
  const { data, isLoading, error } = useQuery(
    ['products'], 
    () => fetch('/api/products').then(r => r.json())
  )
  
  // ✅ 优势：
  // - 自动缓存
  // - 自动重新获取
  // - 加载/错误状态
}
```

**知识点：** `客户端状态` `服务端状态` `状态分类`

:::

### Q2: 全局 vs 局部状态

> **⭐ 简单 · 状态作用域**

请说明何时使用全局状态，何时使用局部状态。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**局部状态（Local State）：**
- 只在单个组件内使用
- 使用 useState/useReducer
- Props 传递 1-2 层是可以接受的

**全局状态（Global State）：**
- 跨多个组件/页面共享
- 需要持久化或同步
- 使用 Context/Redux/Zustand

**判断标准：**

```jsx
// ✅ 使用局部状态
- 表单输入值
- 展开/收起状态
- 模态框显示/隐藏
- 本地筛选/排序
- 动画状态

// ✅ 使用全局状态
- 用户登录信息
- 主题设置
- 购物车
- 通知状态
- 语言设置
```

**状态提升决策树：**

```
1. 状态只在当前组件用？
   是 → 局部状态 useState
   
2. 需要传递给 1 个子组件？
   是 → Props 传递
   
3. 需要传递给多层子组件？
   是 → 考虑 Context 或 组件组合
   
4. 需要跨页面/跨模块共享？
   是 → 全局状态管理
```

```jsx
// 状态过近（不合适的全局状态）
// ❌ 不推荐：用 Redux 管理表单输入
const [formData, setFormData] = useRedux('formData')

// ✅ 推荐：组件内局部状态
function Form() {
  const [formData, setFormData] = useState({})
  onSubmit(formData) // 提交时才更新全局
}

// 状态过远（不合适的局部状态）
// ❌ 不推荐：多层 Props 传递
<App user={user} token={token} theme={theme} />
  <Layout user={user} token={token} theme={theme} />
    <Header user={user} token={token} theme={theme} />
      <UserMenu user={user} />

// ✅ 推荐：全局状态
const user = useSelector(state => state.user)
const theme = useTheme()
```

**知识点：** `局部状态` `全局状态` `状态作用域`

:::

### Q3: 状态管理选型

> **🔥 中等 · 状态管理**

请对比 Redux、Zustand、Pinia、Jotai 等状态管理方案。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**状态管理方案对比：**

| 方案 | 样板代码 | 学习曲线 | 大小 | 适用场景 |
|------|---------|---------|------|---------|
| Redux | 高 | 中等 | 27kb | 大型应用，复杂逻辑 |
| Zustand | 低 | 低 | 1kb | 中小型应用，简单直观 |
| Pinia | 低 | 低 | 2kb | Vue 3 首选 |
| Jotai | 低 | 中等 | 3kb | 原子化状态，细粒度 |
| Context | 低 | 低 | 内置 | 简单全局状态 |

**Redux Toolkit 示例：**

```js
// store.js
import { createSlice, configureStore } from '@reduxjs/toolkit'

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => { state.value++ },
    decrement: state => { state.value-- }
  }
})

export const store = configureStore({
  reducer: { counter: counterSlice.reducer }
})

// 组件中使用
const value = useSelector(state => state.counter.value)
const dispatch = useDispatch()
dispatch(counterSlice.actions.increment())
```

**Zustand 示例：**

```js
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set(({ count }) => ({ count: count + 1 })),
  decrement: () => set(({ count }) => ({ count: count - 1 }))
}))

// 组件中使用
const count = useStore(state => state.count)
const increment = useStore(state => state.increment)
```

**Jotai 示例：**

```js
import { atom, useAtom } from 'jotai'

const countAtom = atom(0)

function Counter() {
  const [count, setCount] = useAtom(countAtom)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

**选型建议：**
- 简单应用：Zustand 或 Context
- 中型应用：Zustand 或 Redux Toolkit
- 大型应用：Redux Toolkit
- Vue 3：Pinia
- 需要细粒度：Jotai

**知识点：** `Redux` `Zustand` `Pinia` `Jotai` `选型`

:::

### Q4: 服务器状态管理（React Query/SWR）

> **🔥 中等 · 服务端状态**

请说明 React Query 和 SWR 的使用场景。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React Query 核心功能：**

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// 查询
function UserInfo({ userId }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
    staleTime: 5 * 60 * 1000, // 5 分钟内认为数据是新鲜的
    cacheTime: 10 * 60 * 1000 // 缓存 10 分钟
  })
  
  if (isLoading) return <Loading />
  if (error) return <Error />
  return <div>{data.name}</div>
}

// 分页
function ProjectList({ page }) {
  const { data } = useQuery({
    queryKey: ['projects', page],
    queryFn: () => fetch(`/api/projects?page=${page}`).then(r => r.json())
  })
}

// 无限加载
function InfiniteList() {
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['projects'],
    queryFn: ({ pageParam = 0 }) => 
      fetch(`/api/projects?page=${pageParam}`).then(r => r.json()),
    getNextPageParam: (lastPage) => lastPage.nextPage
  })
}

// 突变
function EditForm({ userId }) {
  const queryClient = useQueryClient()
  
  const mutation = useMutation({
    mutationFn: (data) => fetch(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      // 失效并重新获取
      queryClient.invalidateQueries(['user', userId])
    }
  })
  
  return <form onSubmit={...}>...</form>
}

// 乐观更新
function TodoList() {
  const queryClient = useQueryClient()
  
  const mutation = useMutation({
    mutationFn: updateTodo,
    onMutate: async (newTodo) => {
      await queryClient.cancelQueries(['todos'])
      const previous = queryClient.getQueryData(['todos'])
      queryClient.setQueryData(['todos'], old => [...old, newTodo])
      return { previous }
    },
    onError: (err, newTodo, context) => {
      queryClient.setQueryData(['todos'], context.previous)
    }
  })
}
```

**SWR 示例：**

```jsx
import useSWR from 'swr'

const fetcher = url => fetch(url).then(r => r.json())

function Profile() {
  const { data, error } = useSWR('/api/user', fetcher)
  
  if (error) return <div>Error</div>
  if (!data) return <div>Loading</div>
  return <div>Hello {data.name}</div>
}

// 突变
import useSWRMutation from 'swr/mutation'

function Edit() {
  const { trigger } = useSWRMutation('/api/user', 
    (url, { arg }) => fetch(url, { 
      method: 'POST', 
      body: JSON.stringify(arg) 
    })
  )
  
  return <button onClick={() => trigger({ name: 'New' })}>Update</button>
}
```

**知识点：** `React Query` `SWR` `服务端状态` `缓存策略`

:::

### Q5: 状态持久化

> **🔥 中等 · 持久存储**

请实现状态持久化方案。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// LocalStorage 持久化 Hook
function usePersistedState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })
  
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch (e) {
      console.warn('LocalStorage error:', e)
    }
  }, [key, state])
  
  return [state, setState]
}

// Zustand 持久化中间件
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set) => ({
      count: 0,
      increment: () => set(({ count }) => ({ count: count + 1 })),
      theme: 'light',
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'my-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          return JSON.parse(str)
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => localStorage.removeItem(name)
      },
      partialize: (state) => ({ 
        theme: state.theme 
        // 只持久化 theme，不持久化 count
      })
    }
  )
)

// Redux 持久化（redux-persist）
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'settings'] // 只持久化这些 reducer
}

const persistedReducer = persistReducer(persistConfig, reducer)
const store = configureStore({ reducer: persistedReducer })
const persistor = persistStore(store)

// IndexedDB 存储（大文件）
function useIndexedDBStore(dbName, storeName) {
  const [db, setDb] = useState(null)
  
  useEffect(() => {
    const request = indexedDB.open(dbName, 1)
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => setDb(request.result)
  }, [dbName, storeName])
  
  const get = async (key) => {
    return new Promise((resolve) => {
      const tx = db.transaction(storeName)
      const store = tx.objectStore(storeName)
      const req = store.get(key)
      req.onsuccess = () => resolve(req.result)
    })
  }
  
  const set = async (data) => {
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readwrite')
      const store = tx.objectStore(storeName)
      store.put(data)
      tx.oncomplete = () => resolve()
    })
  }
  
  return { get, set }
}
```

**知识点：** `LocalStorage` `Zustand persist` `redux-persist` `IndexedDB`

:::

### Q6: 表单状态管理

> **🔥 中等 · 表单处理**

请对比 Formik 和 React Hook Form 的使用。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Formik 示例：**

```jsx
import { useFormik } from 'formik'
import * as Yup from 'yup'

function FormikForm() {
  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema: Yup.object({
      email: Yup.string().email().required('必填'),
      password: Yup.string().min(6, '至少 6 位').required('必填')
    }),
    onSubmit: (values) => {
      console.log(values)
    }
  })
  
  return (
    <form onSubmit={formik.handleSubmit}>
      <input
        name="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.email && formik.errors.email && (
        <div>{formik.errors.email}</div>
      )}
      
      <input
        name="password"
        type="password"
        value={formik.values.password}
        onChange={formik.handleChange}
      />
      
      <button type="submit">提交</button>
    </form>
  )
}
```

**React Hook Form 示例：**

```jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('无效邮箱'),
  password: z.string().min(6, '至少 6 位')
})

function RHF() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  })
  
  const onSubmit = (data) => {
    console.log(data)
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button type="submit">提交</button>
    </form>
  )
}
```

**性能对比：**

| 特性 | Formik | React Hook Form |
|------|--------|-----------------|
| 渲染次数 | 较多（每次输入都重渲染） | 少（无状态，基于 ref） |
| 性能 | 中等 | 优秀 |
| API 设计 | 对象 API | Hooks API |
| 学习曲线 | 中等 | 低 |
| 生态系统 | 成熟 | 成熟 |

**最佳实践：**

```jsx
// 复杂表单用 react-hook-form
function ComplexForm() {
  const { control, handleSubmit } = useForm()
  
  return (
    <Controller
      name="category"
      control={control}
      render={({ field }) => (
        <Select {...field} options={categories} />
      )}
    />
  )
}

// 简单表单用 useState
function SimpleForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  return (
    <form>
      <input value={email} onChange={e => setEmail(e.target.value)} />
      <input value={password} onChange={e => setPassword(e.target.value)} />
    </form>
  )
}
```

**知识点：** `Formik` `React Hook Form` `表单验证` `性能对比`

:::---

### Q7: 前端状态管理的演进历程？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**状态管理演进历程：**

**1. 全局变量阶段（2010 年前）**

```javascript
// 最简单的全局状态
const appState = {
  user: null,
  theme: 'light'
}

function updateUser(user) {
  appState.user = user
  render()
}

// 问题：命名冲突、难以追踪、耦合严重
```

**2. 事件总线/发布订阅模式（2010-2014）**

```javascript
// 事件总线
const events = {}

function on(event, callback) {
  if (!events[event]) events[event] = []
  events[event].push(callback)
}

function emit(event, data) {
  if (events[event]) {
    events[event].forEach(cb => cb(data))
  }
}

// 使用
on('user:login', (user) => {
  console.log('用户登录:', user)
})

emit('user:login', { id: 1 })

// 问题：事件命名随意、难以调试、内存泄漏
```

**3. Flux 架构（2014）**

```javascript
// Flux 核心：单向数据流
// Action -> Dispatcher -> Store -> View

// Action
const Actions = {
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT'
}

// Dispatcher
class Dispatcher {
  constructor() {
    this.callbacks = []
  }
  register(callback) {
    this.callbacks.push(callback)
  }
  dispatch(action) {
    this.callbacks.forEach(cb => cb(action))
  }
}

// Store
class UserStore {
  constructor(dispatcher) {
    this.state = { user: null }
    dispatcher.register(this.handleAction.bind(this))
  }
  handleAction(action) {
    switch (action.type) {
      case Actions.LOGIN:
        this.state.user = action.payload
        this.emitChange()
        break
    }
  }
}

// 问题：样板代码多、学习成本高
```

**4. Redux（2015）**

```javascript
import { createStore, combineReducers } from 'redux'

// Reducer（纯函数）
function userReducer(state = null, action) {
  switch (action.type) {
    case 'LOGIN':
      return action.payload
    case 'LOGOUT':
      return null
    default:
      return state
  }
}

// Store
const store = createStore(
  combineReducers({ user: userReducer })
)

// Action Creator
const login = (user) => ({ type: 'LOGIN', payload: user })

// 订阅
store.subscribe(() => {
  console.log('状态变化:', store.getState())
})

// 调度
store.dispatch(login({ id: 1, name: 'John' }))

// 问题：样板代码多、异步处理复杂
```

**5. MobX（2016）**

```javascript
import { observable, action, computed, makeAutoObservable } from 'mobx'

// 响应式状态
class UserStore {
  user = null
  theme = 'light'
  
  constructor() {
    makeAutoObservable(this)
  }
  
  // Action
  login(userData) {
    this.user = userData
  }
  
  // Computed
  get isLoggedIn() {
    return !!this.user
  }
  
  get userName() {
    return this.user?.name || 'Guest'
  }
}

const userStore = new UserStore()

// 自动追踪依赖
autorun(() => {
  console.log('用户:', userStore.userName)
})

// 修改状态（自动触发更新）
userStore.login({ id: 1, name: 'John' })

// 优势：简洁、自动依赖追踪
// 问题：隐式依赖、调试困难
```

**6. 原子化状态管理（2019-）**

```javascript
// Recoil
import { atom, useRecoilState } from 'recoil'

const currentUser = atom({
  key: 'currentUser',
  default: null
})

function UserProfile() {
  const [user, setUser] = useRecoilState(currentUser)
  return <div>{user?.name}</div>
}

// Zustand
import create from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}))

// Jotai
import { atom, useAtom } from 'jotai'

const countAtom = atom(0)

function Counter() {
  const [count, setCount] = useAtom(countAtom)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}

// 优势：细粒度更新、简洁
```

**7. 现代框架内置状态管理**

```javascript
// React Context + useReducer
const StateContext = createContext()

function StateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  )
}

// Vue 3 Provide/Inject
provide('state', state)
const state = inject('state')

// React Server Components（服务端状态）
async function UserProfile({ userId }) {
  const user = await fetchUser(userId) // 服务端直接获取
  return <div>{user.name}</div>
}
```

**演进对比：**

| 阶段 | 优点 | 缺点 | 代表 |
|------|------|------|------|
| 全局变量 | 简单 | 命名冲突、难追踪 | - |
| 事件总线 | 解耦 | 难调试、内存泄漏 | EventEmitter |
| Flux | 单向数据流 | 样板多 | Flux |
| Redux | 可预测、可回溯 | 样板代码多 | Redux |
| MobX | 简洁、自动追踪 | 隐式依赖 | MobX |
| 原子化 | 细粒度、灵活 | 生态新 | Recoil, Zustand |

**知识点：** `状态管理` `Redux` `MobX` `Flux` `原子化状态`

:::

---

### Q8: 有限状态机（FSM）在前端中的应用？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**有限状态机（Finite State Machine）** 是一种数学模型，用于描述系统在不同状态之间的转换。

**1. 基本概念：**

- **状态（State）：** 系统在某一时刻的条件
- **事件（Event）：** 触发状态转换的动作
- **转换（Transition）：** 从一个状态到另一个状态
- **动作（Action）：** 状态转换时执行的操作

**2. 简单实现：**

```javascript
class StateMachine {
  constructor(config) {
    this.states = config.states
    this.currentState = config.initial
  }
  
  can(event) {
    const state = this.states[this.currentState]
    return state.transitions?.[event] !== undefined
  }
  
  send(event, payload) {
    const state = this.states[this.currentState]
    const nextState = state.transitions?.[event]
    
    if (!nextState) {
      throw new Error(`Cannot ${event} in state ${this.currentState}`)
    }
    
    // 执行退出动作
    state.exit?.(payload)
    
    // 状态转换
    this.currentState = nextState
    
    // 执行进入动作
    this.states[nextState].entry?.(payload)
    
    return this.currentState
  }
}

// 定义状态机
const toggleMachine = new StateMachine({
  initial: 'off',
  states: {
    off: {
      entry: () => console.log('灯关闭'),
      transitions: { TOGGLE: 'on' }
    },
    on: {
      entry: () => console.log('灯打开'),
      transitions: { TOGGLE: 'off' }
    }
  }
})

toggleMachine.send('TOGGLE') // 灯打开
toggleMachine.send('TOGGLE') // 灯关闭
```

**3. XState 使用：**

```javascript
import { createMachine, interpret } from 'xstate'

// 定义状态机
const fetchMachine = createMachine({
  id: 'fetch',
  initial: 'idle',
  context: { data: null, error: null },
  states: {
    idle: {
      on: { FETCH: 'loading' }
    },
    loading: {
      invoke: {
        src: 'fetchData',
        onDone: {
          target: 'success',
          actions: 'assignData'
        },
        onError: {
          target: 'failure',
          actions: 'assignError'
        }
      }
    },
    success: {
      on: { RETRY: 'loading' }
    },
    failure: {
      on: { RETRY: 'loading' }
    }
  }
}, {
  actors: {
    fetchData: () => fetch('/api/data')
  },
  actions: {
    assignData: assign({ data: ({ event }) => event.output }),
    assignError: assign({ error: ({ event }) => event.error })
  }
})

// 使用
const service = interpret(fetchMachine)
service.subscribe((state) => {
  console.log('当前状态:', state.value)
})
service.start()
service.send({ type: 'FETCH' })
```

**4. 应用场景：**

**场景一：订单状态**

```javascript
const orderMachine = createMachine({
  initial: 'pending',
  states: {
    pending: {
      on: {
        PAY: 'paid',
        CANCEL: 'cancelled'
      }
    },
    paid: {
      on: {
        SHIP: 'shipped'
      }
    },
    shipped: {
      on: {
        DELIVER: 'delivered'
      }
    },
    delivered: {
      type: 'final'
    },
    cancelled: {
      type: 'final'
    }
  }
})
```

**场景二：播放器控制**

```javascript
const playerMachine = createMachine({
  initial: 'stopped',
  states: {
    stopped: {
      on: { PLAY: 'playing' }
    },
    playing: {
      on: {
        PAUSE: 'paused',
        STOP: 'stopped'
      }
    },
    paused: {
      on: {
        PLAY: 'playing',
        STOP: 'stopped'
      }
    }
  }
})
```

**场景三：复杂表单验证**

```javascript
const formMachine = createMachine({
  initial: 'editing',
  context: {
    values: {},
    errors: {},
    touched: {}
  },
  states: {
    editing: {
      on: {
        CHANGE: { actions: 'updateValue' },
        BLUR: { actions: 'markTouched' },
        SUBMIT: 'validating'
      }
    },
    validating: {
      always: [
        { target: 'submitting', guard: 'isValid' },
        { target: 'editing' }
      ]
    },
    submitting: {
      invoke: {
        src: 'submitForm',
        onDone: 'submitted',
        onError: 'editing'
      }
    },
    submitted: {
      type: 'final'
    }
  }
})
```

**5. 状态机优势：**

- 状态明确，不会出现不可能的状态组合
- 状态转换可预测
- 易于可视化和调试
- 便于文档化

**知识点：** `有限状态机` `FSM` `XState` `状态转换`

:::

---

### Q9: 如何设计一个撤销/重做（Undo/Redo）系统？

> **💀 困难 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**撤销/重做系统设计：**

**1. 命令模式实现：**

```javascript
// 命令接口
class Command {
  execute() {}
  undo() {}
}

// 具体命令
class AddItemCommand extends Command {
  constructor(list, item) {
    super()
    this.list = list
    this.item = item
    this.oldIndex = -1
  }
  
  execute() {
    this.list.push(this.item)
    this.oldIndex = this.list.length - 1
  }
  
  undo() {
    this.list.splice(this.oldIndex, 1)
  }
}

class EditItemCommand extends Command {
  constructor(list, index, newItem) {
    super()
    this.list = list
    this.index = index
    this.newItem = newItem
    this.oldItem = null
  }
  
  execute() {
    this.oldItem = this.list[this.index]
    this.list[this.index] = this.newItem
  }
  
  undo() {
    this.list[this.index] = this.oldItem
  }
}

// 历史记录管理器
class HistoryManager {
  constructor() {
    this.undoStack = []
    this.redoStack = []
    this.maxHistory = 50
  }
  
  execute(command) {
    command.execute()
    this.undoStack.push(command)
    this.redoStack = [] // 清空重做栈
    
    // 限制历史记录数量
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift()
    }
  }
  
  undo() {
    const command = this.undoStack.pop()
    if (command) {
      command.undo()
      this.redoStack.push(command)
    }
  }
  
  redo() {
    const command = this.redoStack.pop()
    if (command) {
      command.execute()
      this.undoStack.push(command)
    }
  }
  
  canUndo() {
    return this.undoStack.length > 0
  }
  
  canRedo() {
    return this.redoStack.length > 0
  }
  
  clear() {
    this.undoStack = []
    this.redoStack = []
  }
}

// 使用
const history = new HistoryManager()
const list = []

history.execute(new AddItemCommand(list, 'Item 1'))
history.execute(new AddItemCommand(list, 'Item 2'))
history.undo() // 撤销添加 Item 2
history.redo() // 重做添加 Item 2
```

**2. 状态快照模式（适合复杂状态）：**

```javascript
class UndoableState {
  constructor(initialState) {
    this.state = initialState
    this.undoStack = [JSON.stringify(initialState)]
    this.redoStack = []
    this.maxHistory = 50
  }
  
  setState(newState) {
    this.state = newState
    this.undoStack.push(JSON.stringify(newState))
    this.redoStack = []
    
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift()
    }
  }
  
  undo() {
    if (this.undoStack.length > 1) {
      this.redoStack.push(this.undoStack.pop())
      const prevState = JSON.parse(this.undoStack[this.undoStack.length - 1])
      this.state = prevState
    }
  }
  
  redo() {
    if (this.redoStack.length > 0) {
      const nextState = JSON.parse(this.redoStack.pop())
      this.undoStack.push(nextState)
      this.state = nextState
    }
  }
}

// 使用
const state = new UndoableState({ count: 0, text: '' })
state.setState({ count: 1, text: 'hello' })
state.setState({ count: 2, text: 'world' })
state.undo() // 回到 { count: 1, text: 'hello' }
state.redo() // 回到 { count: 2, text: 'world' }
```

**3. 空间优化（差异存储）：**

```javascript
// 使用 JSON Patch 存储差异
class DiffUndoManager {
  constructor() {
    this.states = []
    this.currentIndex = -1
  }
  
  applyPatch(state, patch) {
    // 应用 JSON Patch
    return jsonpatch.applyPatch(state, patch).newDocument
  }
  
  createDiff(oldState, newState) {
    return jsonpatch.compare(oldState, newState)
  }
  
  setState(newState) {
    const currentState = this.getCurrentState()
    const diff = this.createDiff(currentState, newState)
    
    // 移除当前索引之后的所有状态
    this.states = this.states.slice(0, this.currentIndex + 1)
    this.states.push({ state: newState, diff })
    this.currentIndex++
  }
  
  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--
      return this.states[this.currentIndex].state
    }
  }
  
  redo() {
    if (this.currentIndex < this.states.length - 1) {
      this.currentIndex++
      return this.states[this.currentIndex].state
    }
  }
}
```

**4. React Hook 实现：**

```javascript
import { useReducer, useCallback } from 'react'

function useUndoRedo(initialState) {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'SET':
        return {
          ...state,
          present: action.payload,
          past: [...state.past, state.present],
          future: []
        }
      case 'UNDO':
        if (state.past.length === 0) return state
        const previous = state.past[state.past.length - 1]
        const newPast = state.past.slice(0, -1)
        return {
          ...state,
          present: previous,
          past: newPast,
          future: [state.present, ...state.future]
        }
      case 'REDO':
        if (state.future.length === 0) return state
        const next = state.future[0]
        const newFuture = state.future.slice(1)
        return {
          ...state,
          present: next,
          past: [...state.past, state.present],
          future: newFuture
        }
      default:
        return state
    }
  }, {
    past: [],
    present: initialState,
    future: []
  })
  
  const set = useCallback((newState) => {
    dispatch({ type: 'SET', payload: newState })
  }, [])
  
  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' })
  }, [])
  
  const redo = useCallback(() => {
    dispatch({ type: 'REDO' })
  }, [])
  
  return {
    state: state.present,
    set,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0
  }
}

// 使用
function Editor() {
  const { state: content, set: setContent, undo, redo, canUndo, canRedo } = useUndoRedo('')
  
  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>撤销</button>
      <button onClick={redo} disabled={!canRedo}>重做</button>
      <textarea value={content} onChange={e => setContent(e.target.value)} />
    </div>
  )
}
```

**知识点：** `撤销重做` `命令模式` `状态快照` `差异存储` `Undoable`

:::

---

### Q10: 全局状态 vs 局部状态的设计原则？何时该提升状态？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**状态设计原则：**

**1. 优先考虑局部状态**

```javascript
// ✅ 好的设计 - 状态在需要的地方
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}

// ❌ 不好的设计 - 不必要的全局状态
const store = createStore({ count: 0 })

function Counter() {
  const count = useSelector(s => s.count)
  return <button onClick={() => store.dispatch({ type: 'INC' })}>{count}</button>
}
```

**2. 状态提升的时机**

**需要提升状态的场景：**

```javascript
// 场景 1：多个组件需要共享状态
function Parent() {
  // ✅ 状态提升到共同父组件
  const [selected, setSelected] = useState(null)
  
  return (
    <>
      <ItemList selected={selected} onSelect={setSelected} />
      <ItemDetail selected={selected} />
    </>
  )
}

// 场景 2：状态需要持久化
function App() {
  // ✅ 用户状态需要全局访问和持久化
  const [user, setUser] = usePersistedState('user', null)
  
  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Routes />
    </UserContext.Provider>
  )
}

// 场景 3：状态需要在路由间保持
function App() {
  // ✅ 主题状态需要在所有页面保持一致
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Routes />
    </ThemeContext.Provider>
  )
}
```

**不需要提升的场景：**

```javascript
// 场景 1：组件内部状态
function Form() {
  // ✅ 表单状态只在本组件使用
  const [formData, setFormData] = useState({})
  return <form>...</form>
}

// 场景 2：渲染优化相关
function ExpensiveComponent() {
  // ✅ 本地缓存状态
  const [cached, setCached] = useState(null)
  return <div>{cached || computeExpensive()}</div>
}

// 场景 3：UI 交互状态
function Dropdown() {
  // ✅ 展开/收起状态
  const [isOpen, setIsOpen] = useState(false)
  return <div onClick={() => setIsOpen(!isOpen)}>...</div>
}
```

**3. 状态分类管理**

```javascript
// 按类型分开放置不同状态

// URL 状态 - 使用路由参数
// /products?sort=price&order=asc

// 表单状态 - 组件内部
function SearchForm() {
  const [query, setQuery] = useState('')
}

// 服务器缓存 - React Query / SWR
const { data: products } = useQuery(['products'], fetchProducts)

// UI 状态 - 组件内部
const [isModalOpen, setIsModalOpen] = useState(false)

// 全局应用状态 - Context / Zustand
const useAuthStore = create((set) => ({
  user: null,
  login: (user) => set({ user })
}))
```

**4. 决策流程图：**

```
状态是否需要跨组件共享？
├─ 否 → 使用局部状态 (useState/useReducer)
└─ 是 → 是否需要跨路由/页面共享？
    ├─ 否 → 提升到最近共同父组件
    └─ 是 → 使用全局状态 (Context/Store)
```

**5. 实际案例 - 电商网站状态设计：**

```javascript
// 全局状态（使用 Zustand）
const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(i => i.id !== id)
  }))
}))

const useUserStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user })
}))

// 局部状态（组件内部）
function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore(s => s.addItem)
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img src={product.image} />
      <input 
        type="number" 
        value={quantity}
        onChange={e => setQuantity(e.target.value)}
      />
      <button onClick={() => addItem({ ...product, quantity })}>
        加入购物车
      </button>
    </div>
  )
}
```

**知识点：** `全局状态` `局部状态` `状态提升` `状态管理` `设计原则`

:::

---