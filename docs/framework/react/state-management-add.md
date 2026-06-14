### Q12: Redux Toolkit 和传统 Redux 的区别？createSlice 的原理？

> **🔥 中等 · framework/react/state-management**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Redux Toolkit (RTK) 是 Redux 官方推荐的现代化写法。**

**传统 Redux 的问题：**

```jsx
// 1. 样板代码过多
const ADD_TODO = 'ADD_TODO'
const REMOVE_TODO = 'REMOVE_TODO'

// action types
const ADD_TODO = 'ADD_TODO'

// action creators
function addTodo(text) {
  return { type: ADD_TODO, text }
}

// reducer
function todos(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return [...state, { text: action.text, id: Date.now() }]
    default:
      return state
  }
}

// store
const store = createStore(todos)
```

**Redux Toolkit 简化：**

```jsx
import { createSlice, configureStore } from '@reduxjs/toolkit'

const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    addTodo: (state, action) => {
      state.push({ text: action.payload, id: Date.now() })  // Immer 允许直接修改
    },
    removeTodo: (state, action) => {
      return state.filter(todo => todo.id !== action.payload)
    }
  }
})

export const { addTodo, removeTodo } = todosSlice.actions

const store = configureStore({
  reducer: {
    todos: todosSlice.reducer
  }
})
```

**createSlice 原理：**

**1. 自动生成 action types**

```jsx
// 输入
createSlice({
  name: 'todos',
  reducers: {
    add: () => {},
    remove: () => {}
  }
})

// 输出
{
  'todos/add': 'todos/add',
  'todos/remove': 'todos/remove'
}
```

**2. 自动生成 action creators**

```jsx
// 无需手动定义
slice.actions.add  // { type: 'todos/add', payload: ... }
slice.actions.remove  // { type: 'todos/remove', payload: ... }
```

**3. 使用 Immer 支持"直接修改"**

```jsx
// 内部使用 Immer 的 produce 函数
const nextState = produce(currentState, draft => {
  draft.push({ id: 1 })  // 看似修改，实际是不可变更新
})
```

**4. 自动组合 reducer**

```jsx
// createSlice 返回
{
  name: 'todos',
  reducer: (state, action) => {...},  // 组合后的 reducer
  actions: { add: fn, remove: fn },    // action creators
  caseReducers: { add: fn, remove: fn }  // 原始 reducer
}
```

**完整对比：**

| 特性 | 传统 Redux | Redux Toolkit |
|------|-----------|---------------|
| 样板代码 | 大量 | 极少 |
| 不可变更新 | 手动展开 | Immer 自动 |
| DevTools | 手动配置 | 内置 |
| TS 支持 | 复杂 | 简单 |
| 推荐度 | 遗留项目 | 新项目首选 |

**知识点：** `Redux Toolkit` `createSlice` `Immer` `不可变更新` `样板代码`

:::

### Q13: Zustand 和 Redux 的对比？

> **🔥 中等 · framework/react/state-management**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Zustand 是轻量级状态管理库，API 更简洁。**

**基本用法对比：**

```jsx
// Redux
const store = configureStore({
  reducer: {
    counter: counterReducer,
    user: userReducer
  }
})

function Counter() {
  const count = useSelector(state => state.counter.value)
  const dispatch = useDispatch()
  return (
    <button onClick={() => dispatch(increment())}>
      {count}
    </button>
  )
}

// Zustand
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}))

function Counter() {
  const count = useStore(state => state.count)
  const increment = useStore(state => state.increment)
  return <button onClick={increment}>{count}</button>
}
```

**核心区别：**

| 特性 | Redux | Zustand |
|------|-------|---------|
| 包大小 | ~28KB | ~1KB |
| 样板代码 | 多 | 极少 |
| Provider | 需要 | 不需要 |
| DevTools | 需要配置 | 内置 |
| 中间件 | 复杂 | 简单 |
| TS 支持 | 复杂 | 简单 |
| 选择器 | 需要记忆化 | 自动优化 |

**Zustand 特性：**

**1. 无需 Provider**

```jsx
// Redux - 需要 Provider 包裹
<Provider store={store}>
  <App />
</Provider>

// Zustand - 直接使用
// 可以在组件外使用
const count = useStore.getState().count
```

**2. 自动性能优化**

```jsx
// Redux - 需要 useMemo 或 useSelector
const data = useSelector(state => state.data, shallowEqual)

// Zustand - 选择器相等时不重渲染
const data = useStore(state => state.data)  // 自动 shallow compare
```

**3. 持久化中间件**

```jsx
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 }))
    }),
    { name: 'storage-key' }  // localStorage key
  )
)
```

**4. 多 store 支持**

```jsx
// 可以创建多个独立的 store
const useAuthStore = create(...)
const useCartStore = create(...)

// Redux 通常单 store
```

**选择建议：**

- **Redux**: 大型应用、团队开发、需要完整 DevTools
- **Zustand**: 中小型应用、追求简洁、快速开发
- **Jotai/Recoil**: 原子化状态、更细粒度控制

**知识点：** `Zustand` `Redux` `状态管理` `轻量级` `中间件` `持久化`

:::

### Q14: Jotai 和 Recoil 的原子化状态管理思路？

> **💀 困难 · framework/react/state-management**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**原子化状态管理：将状态拆分为最小独立单元（atom）。**

**Recoil 示例：**

```jsx
import { atom, useRecoilState, useRecoilValue } from 'recoil'

// 定义 atom
const countAtom = atom({
  key: 'count',
  default: 0
})

const doubleAtom = atom({
  key: 'double',
  default: 0
})

// 派生状态（selector）
const doubledCount = selector({
  key: 'doubledCount',
  get: ({ get }) => get(countAtom) * 2
})

// 组件使用
function Counter() {
  const [count, setCount] = useRecoilState(countAtom)
  const doubled = useRecoilValue(doubledCount)
  
  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <span>双倍：{doubled}</span>
    </div>
  )
}
```

**Jotai 示例：**

```jsx
import { atom, useAtom } from 'jotai'

// 定义 atom（更简洁）
const countAtom = atom(0)

// 派生 atom
const doubleAtom = atom((get) => get(countAtom) * 2)

// 可写派生 atom
const doubleWithSetAtom = atom(
  (get) => get(countAtom) * 2,
  (get, set, update) => set(countAtom, update / 2)
)

function Counter() {
  const [count, setCount] = useAtom(countAtom)
  const [double] = useAtom(doubleAtom)
  
  return (
    <button onClick={() => setCount(c => c + 1)}>
      {count} × 2 = {double}
    </button>
  )
}
```

**核心思路对比：**

| 特性 | Recoil | Jotai |
|------|--------|-------|
| 原子定义 | 需要 key | 不需要 key |
| Selector | 显式定义 | 自动推导 |
| TS 支持 | 较好 | 更好 |
| 包大小 | ~14KB | ~5KB |
| 维护状态 | Meta 维护 | 社区维护 |
| 推荐度 | ⚠️ 已不再积极维护 | ✅ 推荐 |

**原子化优势：**

**1. 细粒度更新**

```jsx
// Redux - 整个 reducer 状态变化可能触发重渲染
const data = useSelector(state => state.data.items)

// 原子化 - 只订阅特定 atom
const items = useAtomValue(itemsAtom)  // 只在这个 atom 变化时更新
```

**2. 自动依赖追踪**

```jsx
// 派生状态自动更新
const totalAtom = atom((get) => {
  const prices = get(priceAtom)
  const quantities = get(quantityAtom)
  return prices.reduce((sum, p, i) => sum + p * quantities[i], 0)
})
```

**3. 状态 colocated**

```jsx
// 状态可以定义在组件附近
const modalAtom = atom(false)

function ModalButton() {
  const [open, setOpen] = useAtom(modalAtom)
  return <button onClick={() => setOpen(true)}>打开</button>
}
```

**使用场景：**
- 表单状态
- UI 状态（弹窗、Tab）
- 细粒度缓存
- 复杂派生状态

**知识点：** `Jotai` `Recoil` `原子化状态` `细粒度更新` `派生状态`

:::

### Q15: React Context 性能问题如何解决？

> **🔥 中等 · framework/react/state-management**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Context 的性能问题：Provider value 变化时，所有 Consumer 都会重渲染。**

**问题示例：**

```jsx
const ThemeContext = createContext()

function App() {
  const [theme, setTheme] = useState('light')
  const [user, setUser] = useState(null)
  
  // ❌ 问题：theme 或 user 变化都会导致所有 Consumer 重渲染
  return (
    <ThemeContext.Provider value={{ theme, setTheme, user, setUser }}>
      <DeepChild />
    </ThemeContext.Provider>
  )
}

function DeepChild() {
  const { theme } = useContext(ThemeContext)
  // 即使只用 theme，user 变化时也会重渲染
  return <div className={theme}>内容</div>
}
```

**解决方案 1：拆分 Context**

```jsx
const ThemeContext = createContext()
const UserContext = createContext()

function App() {
  const [theme, setTheme] = useState('light')
  const [user, setUser] = useState(null)
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <UserContext.Provider value={{ user, setUser }}>
        <DeepChild />
      </UserContext.Provider>
    </ThemeContext.Provider>
  )
}

function DeepChild() {
  const { theme } = useContext(ThemeContext)  // 只订阅 theme
  return <div className={theme}>内容</div>
}
```

**解决方案 2：memo + selector 模式**

```jsx
function useProtectedSelector(context, selector) {
  const value = useContext(context)
  const selected = useMemo(() => selector(value), [value])
  return selected
}

// 或使用 memoization
const ThemeContext = createContext()

function Child() {
  const { theme } = useContext(ThemeContext)  // 只在自己依赖变化时更新
  return <div className={theme}>内容</div>
}
```

**解决方案 3：Context + useReducer**

```jsx
const StateContext = createContext()
const DispatchContext = createContext()

function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

// 组件只订阅需要的部分
function Component() {
  const count = useContext(StateContext).count
  const dispatch = useContext(DispatchContext)
  // 只有 count 变化时才更新
}
```

**解决方案 4：使用状态管理库**

```jsx
// Zustand - 自动优化
const useStore = create((set) => ({
  count: 0,
  user: null,
  setCount: (count) => set({ count }),
  setUser: (user) => set({ user })
}))

function Component() {
  const count = useStore(state => state.count)  // 只订阅 count
  return <div>{count}</div>  // user 变化时不会重渲染
}
```

**最佳实践：**

1. **拆分 Context**：按功能域划分
2. **使用 memo**：包裹 Consumer 组件
3. **选择器模式**：只订阅需要的数据
4. **考虑替代方案**：Zustand/Jotai 等

**知识点：** `Context` `性能优化` `Provider` `Consumer` `重渲染`

:::