### Q1: useReducer 如何使用？和 useState 有什么区别？

> **🔥 中等 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**useReducer 适用于复杂状态逻辑。**

```javascript
const [state, dispatch] = useReducer(reducer, initialState);

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      return state;
  }
}
```

**vs useState：**

| 对比项 | useState | useReducer |
|--------|----------|------------|
| 适用场景 | 简单状态 | 复杂状态逻辑 |
| 更新方式 | setState | dispatch |
| 性能 | 每次渲染 | 可优化（dispatch 稳定） |

**知识点：**`useReducer` `useState` `状态管理`

:::

### Q2: useMemo 和 useCallback 的区别？

> **🔥 中等 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**useMemo 缓存值，useCallback 缓存函数。**

```javascript
// useMemo - 缓存计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);

// useCallback - 缓存函数引用
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]);

// 等价于
const handleClick = useMemo(() => () => {
  doSomething(a, b);
}, [a, b]);
```

**使用场景：**
- useMemo：计算开销大的值
- useCallback：传递给子组件的回调（避免子组件重渲染）

**知识点：**`useMemo` `useCallback` `性能优化` `缓存`

:::

### Q3: React 合成事件原理

> **💀 困难 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React 17 之前：事件委托到 document**
**React 17+：事件委托到 root 容器**

**原理：**
1. 所有事件监听器注册在 root
2. 事件发生时，React 收集路径上的所有监听器
3. 模拟冒泡/捕获过程
4. 批量处理事件

**优势：**
- 跨浏览器兼容
- 事件批处理
- 内存优化（只需少量监听器）

**知识点：**`合成事件` `事件委托` `React 17`

:::

### Q4: React 批处理 (Batching) 原理

> **🔥 中等 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React 18 前：只在事件处理函数中批处理**
**React 18+：自动批处理（包括 Promise、setTimeout）**

```javascript
// React 18 前
setTimeout(() => {
  setCount(1);    // 渲染
  setFlag(true);  // 再次渲染
}, 0);

// React 18
setTimeout(() => {
  setCount(1);    // 批处理
  setFlag(true);  // 一次渲染
}, 0);
```

**知识点：**`批处理` `React 18` `性能优化`

:::

### Q5: Hook 的链表结构

> **💀 困难 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React 内部使用链表存储 Hook 状态。**

```javascript
// 简化模型
let firstHook = null;
let workInProgressHook = null;

function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null,
    next: null,
  };
  
  if (workInProgressHook === null) {
    firstHook = workInProgressHook = hook;
  } else {
    workInProgressHook = workInProgressHook.next = hook;
  }
  
  return workInProgressHook;
}
```

**调用顺序必须一致的原因：**
- React 通过调用顺序定位每个 Hook
- 顺序变了，状态就会错位

**知识点：**`Hook` `链表` `实现原理`

:::

### Q6: useState 的原理和缓存机制

> **💀 困难 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**原理：**

1. **首次渲染（mount）**
   - 创建 Hook 对象
   - 存储初始状态

2. **后续渲染（update）**
   - 按顺序遍历链表
   - 返回缓存的状态

```javascript
// 简化实现
let hooks = [];
let currentHook = 0;

function useState(initialState) {
  const hookIndex = currentHook;
  
  if (hooks[hookIndex] === undefined) {
    hooks[hookIndex] = initialState;
  }
  
  const setState = (newState) => {
    hooks[hookIndex] = newState;
    render();  // 触发重新渲染
  };
  
  currentHook++;
  return [hooks[hookIndex], setState];
}
```

**知识点：**`useState` `原理` `缓存机制`

:::

### Q7: 函数组件重渲染如何获取 prevState？

> **🔥 中等 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**函数组件每次渲染都是新函数执行，无法直接获取 prevProps/prevState。**

**解决方案：**

1. **useRef 保存**
```javascript
function Component(props) {
  const prevPropsRef = useRef();
  
  useEffect(() => {
    prevPropsRef.current = props;
  });
  
  const prevProps = prevPropsRef.current;
  // 使用 prevProps 对比
}
```

2. **自定义 Hook**
```javascript
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const prevCount = usePrevious(count);
```

**知识点：**`useRef` `previous value` `useEffect`

:::

### Q8: ErrorBoundary 如何使用？

> **⭐ 简单 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**ErrorBoundary 只能用于类组件。**

```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <FallbackUI />;
    }
    return this.props.children;
  }
}

// 使用
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

**知识点：**`ErrorBoundary` `错误处理` `类组件`

:::

### Q9: Hooks 只能在函数组件顶层调用

> **⭐ 简单 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**规则：**
1. 只在函数组件顶层调用
2. 只在自定义 Hook 中调用

**原因：**
- React 按调用顺序管理 Hook 状态
- 条件调用会导致顺序错乱

**知识点：**`Hooks` `规则` `调用顺序`

:::

### Q10: getDefaultProps 的作用

> **⭐ 简单 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**类组件中设置默认 props。**

```javascript
class MyComponent extends React.Component {
  static defaultProps = {
    name: 'Guest',
    count: 0
  };
}

// 函数组件用默认参数
function MyComponent({ name = 'Guest', count = 0 }) {
  // ...
}
```

**React 17+ 已废弃 getDefaultProps**

**知识点：**`defaultProps` `类组件` `默认值`

:::

### Q11: React 事件机制原理

> **💀 困难 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心机制：**

1. **事件委托** - 所有事件绑定到 root
2. **合成事件** - 跨浏览器兼容的包装
3. **事件池** - 复用事件对象（React 16 前）
4. **批量更新** - 事件处理中的 setState 批处理

**事件传播：**
```javascript
// 手动实现冒泡
function handleClick(e) {
  e.stopPropagation();  // 阻止冒泡
  e.preventDefault();   // 阻止默认行为
}
```

**知识点：**`事件机制` `合成事件` `事件委托`

:::

### Q12: Fiber 架构理解

> **💀 困难 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Fiber 是 React 16+ 的核心架构。**

**解决的问题：**
- 递归不可中断，大组件树阻塞主线程
- Fiber 可中断、恢复、优先级调度

**Fiber 节点结构：**
```javascript
const fiber = {
  type: Component,      // 组件类型
  props: {},            // 属性
  child: null,          // 第一个子节点
  sibling: null,        // 兄弟节点
  return: null,         // 父节点
  stateNode: null,      // DOM/实例
  // 调度相关
  lanes,                // 优先级
  // 双缓冲
  alternate             // 另一个树的对应节点
};
```

**工作流程：**
1. **Render 阶段** - 可中断，构建 Fiber 树
2. **Commit 阶段** - 不可中断，应用变更

**知识点：**`Fiber` `架构` `可中断渲染` `调度`

:::

### Q13: useState 整体运作流程

> **💀 困难 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**完整流程：**

1. **mount 阶段**
   - 创建 Hook 对象，存储 initialState
   - 返回 [state, dispatch]

2. **update 阶段**
   - 按顺序获取链表中的 Hook
   - 返回缓存的 state

3. **setState 调用**
   - 创建 update 对象
   - 加入队列
   - 调度更新（可能批处理）
   - 触发 render

4. **re-render**
   - 处理 update 队列
   - 计算新 state
   - 更新组件

**知识点：**`useState` `内部原理` `更新流程`

:::

### Q14: useEffect 和 useLayoutEffect 区别

> **🔥 中等 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 对比项 | useEffect | useLayoutEffect |
|--------|-----------|-----------------|
| 执行时机 | DOM 变更后异步执行（浏览器绘制之后） | DOM 变更后同步执行（浏览器绘制之前） |
| 阻塞渲染 | 否 | 是（阻塞浏览器绘制） |
| 闪烁风险 | 可能有视觉闪烁 | 无闪烁 |
| 使用场景 | 大多数副作用 | DOM 测量、同步 DOM 修改 |

```javascript
// useEffect - 不阻塞
useEffect(() => {
  fetchData();  // 异步操作
}, []);

// useLayoutEffect - 阻塞
useLayoutEffect(() => {
  const rect = ref.current.getBoundingClientRect();
  // 立即使用尺寸信息
}, []);
```

**知识点：**`useEffect` `useLayoutEffect` `副作用`

:::

### Q15: useRef 和 useState 区别

> **⭐ 简单 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 对比项 | useRef | useState |
|--------|--------|----------|
| 触发重渲染 | 否 | 是 |
| 持久化 | 是（整个生命周期） | 是（每次渲染独立） |
| 使用场景 | DOM 引用、不触发更新的值 | 状态管理 |

```javascript
// useRef - 不触发更新
const countRef = useRef(0);
countRef.current++;  // 不触发重渲染

// useState - 触发更新
const [count, setCount] = useState(0);
setCount(c => c + 1);  // 触发重渲染
```

**知识点：**`useRef` `useState` `区别`

:::

### Q16: 自定义 Hook 设计原则

> **🔥 中等 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**原则：**

1. **命名以 use 开头**
```javascript
function useFetch(url) { ... }
```

2. **可组合**
```javascript
function useForm(initialValues, validators) {
  const [values, setValues] = useState(initialValues);
  const errors = useValidation(values, validators);
  return { values, errors, setValues };
}
```

3. **关注单一功能**
```javascript
// 好
useLocalStorage(key, defaultValue);
useDarkMode();

// 避免混合职责
```

**知识点：**`自定义 Hook` `设计原则` `代码复用`

:::

### Q17: React.memo 和 useMemo 区别

> **🔥 中等 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 对比项 | React.memo | useMemo |
|--------|------------|---------|
| 作用对象 | 组件 | 值 |
| 缓存内容 | 整个组件 | 计算结果 |
| 使用方式 | HOC | Hook |

```javascript
// React.memo - memo 组件
const MemoComponent = React.memo(function MyComponent(props) {
  return <div>{props.value}</div>;
});

// useMemo - memo 值
const Component = ({ a, b }) => {
  const value = useMemo(() => a + b, [a, b]);
  return <div>{value}</div>;
};
```

**知识点：**`React.memo` `useMemo` `性能优化`

:::

### Q18: Hook 依赖数组陷阱

> **🔥 中等 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**常见陷阱：**

1. **引用类型依赖**
```javascript
// 错误：对象每次都是新引用
const options = { method: 'GET' };
useEffect(() => { /* ... */ }, [options]);  // 每次都执行

// 正确
useEffect(() => { /* ... */ }, []);  // 或把对象移入
```

2. **函数依赖**
```javascript
// 错误：函数每次都是新引用
const fetchData = () => { /* ... */ };
useEffect(() => { fetchData(); }, [fetchData]);

// 正确：用 useCallback
const fetchData = useCallback(() => { /* ... */ }, []);
```

3. **遗漏依赖**
```javascript
// 错误：使用了 count 但不依赖
useEffect(() => {
  setTimeout(() => setCount(count + 1), 1000);
}, []);  // count 永远是初始值

// 正确
useEffect(() => {
  setTimeout(() => setCount(c => c + 1), 1000);  // 函数式更新
}, []);
```

**知识点：**`useEffect` `依赖数组` `陷阱`

:::

### Q19: Hook 最佳实践

> **⭐ 简单 · framework/react/hooks-deep**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**最佳实践：**

1. **遵守规则** - 顶层调用，依赖完整
2. **单一职责** - 一个 Hook 做一件事
3. **自定义 Hook** - 提取逻辑复用
4. **函数式更新** - `setState(prev => ...)`
5. **避免过度优化** - 按需使用 useMemo/useCallback

**知识点：**`Hooks` `最佳实践`

:::

### Q20: React defaultProps 的作用及演进？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**defaultProps** 用于为组件设置默认 props 值，但在 React 18+ 中逐渐被淘汰。

```text
演进历史：
React 15: 类组件 static defaultProps
React 16.7: 函数组件 defaultProps
React 18.3: defaultProps 标记为废弃(deprecated)
未来版本: 将完全移除
```

```jsx
// ❌ 旧方式：类组件 static defaultProps（已废弃）
class Button extends React.Component {
  static defaultProps = {
    type: 'primary',
    size: 'medium'
  }
  render() {
    return <button className={"btn-" + this.props.type}>{this.props.children}</button>
  }
}

// ❌ 旧方式：函数组件 defaultProps（已废弃）
function Button({ type, size, children }) {
  return <button className={"btn-" + type}>{children}</button>
}
Button.defaultProps = {
  type: 'primary',
  size: 'medium'
}

// ✅ 推荐方式1：默认参数（最简洁）
function Button({ type = 'primary', size = 'medium', children }) {
  return <button className={"btn-" + type}>{children}</button>
}

// ✅ 推荐方式2：解构 + 默认值
function Button(props) {
  const { type = 'primary', size = 'medium', children } = props
  return <button className={"btn-" + type}>{children}</button>
}

// ✅ 推荐方式3：对象默认值 + 解构（嵌套场景）
function Card({ header = {}, content = '' }) {
  const { title = '默认标题', color = '#333' } = header
  return <div><h2 style={{color}}>{title}</h2><p>{content}</p></div>
}
```

**为什么废弃 defaultProps？**

| 原因 | 说明 |
|------|------|
| 类型推导 | TypeScript 无法正确推导 defaultProps 类型 |
| Flow 处理 | Flow 类型检查器需要特殊逻辑处理 |
| 函数组件 | 默认参数更符合 JS 语言习惯 |
| 性能 | 默认参数在调用时执行，无需额外处理 |

**知识点：** `defaultProps` `默认参数` `React 18` `废弃API`

:::

### Q21: React Hook 的链表结构是怎样的？

> **💀 困难 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

React 内部使用**单向链表**存储组件的所有 Hook 状态，这就是 Hook 调用顺序必须稳定的原因。

```text
Fiber 节点
  └── memoizedState → Hook1
                         ├── memoizedState: [state值]
                         ├── queue: {dispatch, lastRenderedState}
                         ├── next → Hook2
                         │            ├── memoizedState: [deps数组]
                         │            ├── queue: null
                         │            ├── next → Hook3
                         │            │            └── ...
                         │            └── (useEffect)
                         └── (useState)
```

```js
// 简化的 Hook 链表结构
const hook = {
  memoizedState: null,    // 当前Hook的状态值
  baseState: null,        // 初始状态
  baseQueue: null,        // 待处理的更新队列
  queue: null,            // 更新队列
  next: null              // 指向下一个Hook
}

// 组件渲染时，React 遍历链表
function renderComponent(component) {
  let hook = component.memoizedState  // 链表头
  while (hook) {
    // 处理每个Hook的状态
    processHook(hook)
    hook = hook.next  // 沿链表前进
  }
}
```

**为什么 Hook 调用顺序必须稳定？**

```jsx
// ❌ 错误：条件调用Hook
function BadComponent({ showCounter }) {
  if (showCounter) {
    const [count, setCount] = useState(0)  // 有时是第1个Hook，有时不存在
  }
  const [name, setName] = useState('')     // 有时是第1个，有时是第2个
  // React 按索引匹配Hook，顺序变了状态就乱了！
}

// ✅ 正确：Hook始终按相同顺序调用
function GoodComponent({ showCounter }) {
  const [count, setCount] = useState(0)    // 始终是第1个Hook
  const [name, setName] = useState('')     // 始终是第2个Hook
  // 链表结构稳定，状态匹配正确
}
```

**不同Hook在链表中的存储：**

| Hook | memoizedState 存储内容 |
|------|----------------------|
| useState | 当前state值 |
| useReducer | 当前state值 |
| useEffect | effect函数 + deps + 清理函数 |
| useRef | { current: value } |
| useMemo | [缓存值, deps] |
| useCallback | [回调函数, deps] |

**知识点：** `Hook` `链表` `Fiber` `memoizedState` `Hook规则` `实现原理`

:::
### Q22: React hooks 如何实现组件销毁？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

使用 `useEffect` 的 cleanup 函数实现组件销毁逻辑：

```jsx
function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId)
    connection.connect()
    
    // cleanup 函数：组件卸载或依赖变化时执行
    return () => {
      connection.disconnect()  // 清理连接
    }
  }, [roomId])  // roomId变化时也会先执行cleanup

  useEffect(() => {
    const timer = setInterval(() => {
      console.log('polling...')
    }, 1000)
    
    return () => clearInterval(timer)  // 清理定时器
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    
    fetch('/api/data', { signal: controller.signal })
      .then(res => res.json())
      .then setData)
    
    return () => controller.abort()  // 取消请求
  }, [])

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)  // 移除监听
  }, [])

  return <div>Chat Room: {roomId}</div>
}
```

**常见清理场景：**

| 场景 | cleanup |
|------|---------|
| 定时器 | `clearInterval(timer)` / `clearTimeout(timer)` |
| 事件监听 | `removeEventListener` |
| WebSocket | `ws.close()` |
| 订阅 | `subscription.unsubscribe()` |
| 网络请求 | `AbortController.abort()` |
| 动画 | `cancelAnimationFrame(id)` |

**注意事项：**

```jsx
// ❌ 错误：cleanup中引用旧闭包
useEffect(() => {
  const timer = setInterval(() => {
    setCount(count + 1)  // count是闭包中的旧值
  }, 1000)
  return () => clearInterval(timer)
}, [])

// ✅ 正确：使用函数式更新
useEffect(() => {
  const timer = setInterval(() => {
    setCount(prev => prev + 1)  // 总是使用最新值
  }, 1000)
  return () => clearInterval(timer)
}, [])
```

**知识点：** `useEffect` `cleanup` `组件销毁` `AbortController` `内存泄漏`

:::

### Q23: useReducer 的使用场景？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**useReducer** 是 useState 的替代方案，适合管理复杂状态逻辑。

```jsx
// 基础用法
const [state, dispatch] = useReducer(reducer, initialState)

function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT': return { count: state.count + 1 }
    case 'DECREMENT': return { count: state.count - 1 }
    case 'RESET':     return { count: 0 }
    case 'SET':       return { count: action.payload }
    default:          return state
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 })
  return (
    <>
      <p>{state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>重置</button>
    </>
  )
}
```

**useReducer vs useState：**

| 维度 | useState | useReducer |
|------|----------|------------|
| 状态类型 | 简单值 | 复杂对象 |
| 更新逻辑 | 直接设值 | 通过action描述 |
| 多个相关状态 | 需要多个useState | 一个reducer管理 |
| 业务逻辑 | 分散在组件中 | 集中在reducer |
| 可测试性 | 较难 | reducer纯函数易测试 |

**适用场景：**

```jsx
// 1. 表单状态管理
const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.field]: action.value }
    case 'RESET':
      return initialState
    case 'SET_ERRORS':
      return { ...state, errors: action.errors }
  }
}

// 2. 多步骤流程
const stepReducer = (state, action) => {
  switch (action.type) {
    case 'NEXT':  return { step: state.step + 1, data: { ...state.data, ...action.data } }
    case 'PREV':  return { step: state.step - 1 }
    case 'RESET': return initialState
  }
}

// 3. 异步数据获取
const fetchReducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START': return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS': return { ...state, loading: false, data: action.data }
    case 'FETCH_ERROR': return { ...state, loading: false, error: action.error }
  }
}
```

**知识点：** `useReducer` `状态管理` `reducer` `dispatch` `action` `复杂状态`

:::

### Q24: useMemo 和 useCallback 的区别？

> **⭐ 简单 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```jsx
// useMemo：缓存计算值
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])
// 只有 a 或 b 变化时才重新计算

// useCallback：缓存函数引用
const memoizedCallback = useCallback(() => doSomething(a, b), [a, b])
// 只有 a 或 b 变化时才返回新函数引用

// useCallback 等价于 useMemo 的语法糖
const memoizedCallback = useMemo(() => () => doSomething(a, b), [a, b])
```

| 维度 | useMemo | useCallback |
|------|---------|------------|
| 缓存内容 | 计算结果（任意值） | 函数引用 |
| 返回值 | `fn()` 的结果 | `fn` 本身 |
| 用途 | 避免重复计算 | 避免子组件不必要的重渲染 |
| 什么时候用 | 计算开销大时 | 传给子组件的回调函数 |

```jsx
function Parent() {
  const [count, setCount] = useState(0)
  const [text, setText] = useState('')
  
  // ❌ 每次 render 都创建新函数 → 子组件重渲染
  const handleClick = () => console.log(count)
  
  // ✅ 缓存函数引用 → 子组件不会因 text 变化而重渲染
  const memoHandleClick = useCallback(() => console.log(count), [count])
  
  // ✅ 缓存计算结果
  const expensiveResult = useMemo(() => {
    return Array(10000).fill(0).reduce((sum, _, i) => sum + i, 0)
  }, [])  // 只计算一次

  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <Child onClick={memoHandleClick} />
    </>
  )
}

const Child = React.memo(({ onClick }) => {
  console.log('Child render')  // 用useCallback才不会频繁打印
  return <button onClick={onClick}>Click</button>
})
```

**性能陷阱：** 不要过度使用，`useMemo`/`useCallback` 本身也有开销，只在确实需要优化时使用。

**知识点：** `useMemo` `useCallback` `性能优化` `缓存` `React.memo`

:::
### Q25: 为什么不能在循环或条件语句中使用 useState？

> **💀 困难 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**根本原因：React Hooks 用链表存储，调用顺序必须保持稳定。**

```text
Fiber 结构中的 memoizedState 是一个链表：
每个 Hook 按调用顺序串联：
useState(0) → useState('') → useEffect → ...

hook1(next) → hook2(next) → hook3(next) → null
```

```js
// React 内部简化实现
let workInProgressHook = null

function useState(initialState) {
  // 按链表顺序找到当前hook
  const hook = workInProgressHook
  workInProgressHook = workInProgressHook.next  // 移到下一个
  
  if (!hook.queue) {
    // 首次渲染：创建hook并入链表
    hook.memoizedState = initialState
  }
  return [hook.memoizedState, hook.dispatch]
}
```

**如果加了条件判断：**

```jsx
function BadComponent({ showName }) {
  const [count, setCount] = useState(0)
  
  // ❌ 条件中使用 Hook
  if (showName) {
    const [name, setName] = useState('Tom')  // 有时是hook2，有时不是
  }
  
  const [age, setAge] = useState(25)
  // showName=true:  hook1(count) → hook2(name) → hook3(age)
  // showName=false: hook1(count) → hook2(age)  ← 错位！
  
  // React把age对应到了name的hook，状态错乱！
}
```

```text
第一次渲染（showName=true）：
hook1: count=0
hook2: name='Tom'
hook3: age=25

第二次渲染（showName=false）：
hook1: count=0
hook2: age=25  ← React认为这是hook2(name)，但实际是age
→ 状态完全错乱！
```

**正确做法 — 条件判断放在Hook内部：**

```jsx
function GoodComponent({ showName }) {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('Tom')   // ✅ 始终调用
  const [age, setAge] = useState(25)

  // 条件判断放在使用时，不在Hook声明时
  return (
    <div>
      <p>{count}</p>
      {showName && <p>{name}</p>}  {/* 条件渲染，不影响Hook顺序 */}
      <p>{age}</p>
    </div>
  )
}
```

**ESLint规则自动检测：**

```json
// .eslintrc
{
  "rules": {
    "react-hooks/rules-of-hooks": "error"
  }
}
// 会自动报错：React Hook "useState" cannot be called inside a callback/condition
```

**Hook调用规则总结：**
- ✅ 只在最顶层使用Hook
- ✅ 只在函数组件或自定义Hook中使用
- ❌ 不在循环、条件或嵌套函数中使用
- ❌ 不在普通JS函数中使用（除自定义Hook）

**知识点：** `Hooks规则` `链表结构` `调用顺序` `Fiber` `React原理`

:::

### Q26: 为什么只在函数组件中使用 Hooks？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**三个原因：架构设计、实例模型、调用机制**

**1. 架构设计 — Hooks依赖Fiber链表**

```text
函数组件的 Fiber 节点：
memoizedState → hook1 → hook2 → hook3 → null
                 ↑ 链表存储所有Hook状态

类组件的 Fiber 节点：
memoizedState = { count: 0, name: 'Tom' }  
                ↑ 对象存储，不使用链表

Hooks的链表机制只在函数组件中实现，
类组件没有这个链表结构，无法使用Hooks。
```

**2. 实例模型不同**

```jsx
// 类组件：有实例，状态存在实例上
class Counter extends React.Component {
  state = { count: 0 }  // this.state
  render() { return <p>{this.state.count}</p> }
}
// 每次更新调用 this.render()，this指向同一个实例

// 函数组件：无实例，每次渲染都是新调用
function Counter() {
  const [count, setCount] = useState(0)  // 通过链表记住状态
  return <p>{count}</p>
}
// 每次渲染都调用新函数，通过闭包+链表保持状态
```

**3. 调用机制不兼容**

```text
函数组件调用：
renderFunctionComponent(fiber)
  → 执行函数体
  → 遇到useState → 从Fiber链表取对应Hook
  → 遇到useEffect → 加入effect链表

类组件调用：
new ClassComponent(props)
  → 创建实例
  → 调用 render() 方法
  → 没有Hook链表的接入点
```

**如果要在类组件中复用逻辑，应该用HOC或render Props：**

```jsx
// 类组件复用逻辑 — HOC模式
function withWindowSize(WrappedComponent) {
  return class extends React.Component {
    state = { width: window.innerWidth, height: window.innerHeight }
    componentDidMount() { window.addEventListener('resize', this.onResize) }
    componentWillUnmount() { window.removeEventListener('resize', this.onResize) }
    onResize = () => this.setState({ width: window.innerWidth, height: window.innerHeight })
    render() { return <WrappedComponent {...this.props} size={this.state} /> }
  }
}

// 函数组件 — Hook模式（更简洁）
function useWindowSize() {
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}
```

**知识点：** `Hooks` `函数组件` `类组件` `Fiber` `链表` `无实例`

:::

### Q27: React 组件的通信方式有哪些？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 方式 | 方向 | 适用场景 |
|------|------|---------|
| Props | 父→子 | 最基础，单向下传 |
| 回调函数 | 子→父 | 子组件触发父组件方法 |
| Context | 跨层级 | 主题、语言、用户信息 |
| Redux/Zustand | 全局 | 复杂状态管理 |
| Event Bus | 任意组件 | 解耦通信（不推荐React中用） |
| Ref | 父→子 | 调用子组件方法 |
| URL参数 | 页面间 | 路由传参 |

```jsx
// 1. Props 父→子
function Parent() {
  return <Child name="Tom" age={25} />
}
function Child({ name, age }) {
  return <p>{name}, {age}</p>
}

// 2. 回调函数 子→父
function Parent() {
  const [msg, setMsg] = useState('')
  return <Child onSend={(m) => setMsg(m)} />
}
function Child({ onSend }) {
  return <button onClick={() => onSend('hello')}>发送</button>
}

// 3. Context 跨层级
const ThemeCtx = createContext('light')
function App() {
  return (
    <ThemeCtx.Provider value="dark">
      <DeepChild />  {/* 无需逐层传props */}
    </ThemeCtx.Provider>
  )
}
function DeepChild() {
  const theme = useContext(ThemeCtx)
  return <p>{theme}</p>
}

// 4. Ref 调用子组件方法
function Parent() {
  const childRef = useRef()
  return (
    <>
      <button onClick={() => childRef.current.focus()}>聚焦</button>
      <Child ref={childRef} />
    </>
  )
}
const Child = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus()
  }))
  const inputRef = useRef()
  return <input ref={inputRef} />
})
```

**选择指南：**

```text
2层以内  → Props + 回调（简单直接）
3-5层    → Context（避免prop drilling）
5层+     → 状态管理库（Redux/Zustand/Jotai）
兄弟组件  → 提升到共同父组件 或 状态管理库
页面间   → URL参数 + 路由状态
```

**知识点：** `组件通信` `Props` `Context` `Redux` `Ref` `回调函数`

:::

### Q28: React Portals 的理解和应用场景？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Portal** 允许将子组件渲染到父组件DOM层次结构之外的DOM节点中。

```jsx
import { createPortal } from 'react-dom'

function Modal({ children, onClose }) {
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body  // 渲染到body，而不是当前组件DOM树内
  )
}
```

**为什么需要Portal：**

```text
不用Portal的问题：
<div className="app" style={{ overflow: 'hidden', zIndex: 1 }}>
  <div className="modal">    ← 被父级overflow:hidden裁剪
    内容                        ← 被父级z-index覆盖
  </div>
</div>

用Portal：
<div className="app" style={{ overflow: 'hidden' }}>
  <!-- 组件逻辑上属于app，但DOM渲染到body下 -->
</div>
<body>
  <div className="modal">    ← 不受父级样式影响
    内容                        ← 正确的z-index层级
  </div>
</body>
```

**常见应用场景：**

```jsx
// 1. Modal/Dialog
function Dialog({ open, onClose, children }) {
  if (!open) return null
  return createPortal(
    <div className="dialog-overlay">
      <div className="dialog">{children}</div>
    </div>,
    document.body
  )
}

// 2. Tooltip/Popover（避免被父元素overflow裁剪）
function Tooltip({ target, content }) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  // 计算位置...
  return createPortal(
    <div style={{ position: 'fixed', ...pos }}>{content}</div>,
    document.body
  )
}

// 3. 全局通知/Toast
function Toast({ message }) {
  return createPortal(
    <div className="toast">{message}</div>,
    document.getElementById('toast-container')
  )
}
```

**Portal的重要特性 — 事件冒泡：**

```jsx
function App() {
  const handleClick = () => console.log('App clicked')
  return (
    <div onClick={handleClick}>
      <p>点击Modal也会触发App的onClick</p>
      <Modal>尽管Modal在DOM上不在div内，事件冒泡仍然符合React组件树</Modal>
    </div>
  )
}
// Portal虽然DOM挂载在body下，
// 但React事件冒泡遵循虚拟DOM树，不遵循真实DOM树
```

**知识点：** `Portal` `createPortal` `Modal` `overflow裁剪` `事件冒泡` `z-index`

:::

### Q29: React.forwardRef 是什么？有什么用？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React.forwardRef** 用于将 ref 转发给子组件内部的 DOM 节点。

```jsx
// 问题：Fisher 组件默认不传递 ref
function Fisher(props) {
  return <input type="text" />  // ref 到不了这里
}
const ref = useRef()
;<Fisher ref={ref} />  // ref.current = null ❌

// 解决：forwardRef 转发 ref
const Fisher = React.forwardRef((props, ref) => {
  return <input type="text" ref={ref} />
})

const ref = useRef()
;<Fisher ref={ref} />  // ref.current = <input> ✅

// 使用 ref 调用 DOM 方法
ref.current.focus()
ref.current.value = 'Hello'
```

**配合 useImperativeHandle 暴露自定义方法：**

```jsx
const Child = React.forwardRef((props, ref) => {
  const inputRef = useRef()
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    getValue: () => inputRef.current.value,
    clear: () => { inputRef.current.value = '' }
  }), [])
  
  return <input ref={inputRef} />
})

// 父组件使用
function Parent() {
  const childRef = useRef()
  
  const handleClick = () => {
    childRef.current.focus()    // 调用子组件方法
    childRef.current.clear()    // 调用子组件方法
  }
  
  return <Child ref={childRef} />
}
```

**典型应用场景：**

```jsx
// 1. 表单组件封装
const FormInput = forwardRef((props, ref) => (
  <div className="form-field">
    <label>{props.label}</label>
    <input {...props} ref={ref} />
  </div>
))

// 2. 自定义按钮带 focus 方法
const CustomButton = forwardRef((props, ref) => (
  <button {...props} ref={ref} />
))

// 3. 高阶组件传递 ref（需用 forwardRef）
withLogging(forwardRef(Component))
```

**知识点：** `forwardRef` `useImperativeHandle` `ref 转发` `DOM 操作` `组件通信`

:::

### Q30: React 批处理机制是怎样的？React 18 有什么变化？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**批处理（Batching）**：React 将多个 setState 合并为一次渲染，提升性能。

**React 18 之前的问题：**

```jsx
// React 17：事件处理函数中会批处理
function handleClick() {
  setCount(c => c + 1)  // 不立即渲染
  setFlag(f => !f)       // 不立即渲染
  // 只渲染 1 次 ✅
}

// React 17：异步回调中不会批处理
setTimeout(() => {
  setCount(c => c + 1)   // 立即渲染 ❌
  setFlag(f => !f)       // 再次渲染 ❌
  // 渲染 2 次！
}, 0)

Promise.resolve().then(() => {
  setCount(c => c + 1)   // 立即渲染 ❌
  setFlag(f => !f)       // 再次渲染 ❌
})
```

**React 18 自动批处理（Automatic Batching）：**

```jsx
// React 18：所有场景都批处理
setTimeout(() => {
  setCount(c => c + 1)
  setFlag(f => !f)
  // 只渲染 1 次 ✅
}, 0)

Promise.resolve().then(() => {
  setCount(c => c + 1)
  setFlag(f => !f)
  // 只渲染 1 次 ✅
})

// 原生事件也批处理
element.addEventListener('click', () => {
  setCount(c => c + 1)
  setFlag(f => !f)
  // 只渲染 1 次 ✅
})
```

**批处理对比表：**

| 场景 | React 17 | React 18 |
|------|---------|---------|
| 事件处理函数 | ✅ 批处理 | ✅ 批处理 |
| setTimeout | ❌ 不批处理 | ✅ 自动批处理 |
| Promise | ❌ 不批处理 | ✅ 自动批处理 |
| fetch 回调 | ❌ 不批处理 | ✅ 自动批处理 |
| 原生 DOM 事件 | ❌ 不批处理 | ✅ 自动批处理 |

**flushSync — 强制立即渲染（退出批处理）：**

```jsx
import { flushSync } from 'react-dom'

function hurdle() {
  flushSync(() => {
    setCount(c => c + 1)  // 立即渲染
  })
  // DOM 已更新，可以读取
  console.log(count)
  
  flushSync(() => {
    setFlag(f => !f)  // 再次立即渲染
  })
  // 共渲染 2 次（不推荐滥用）
}
```

**批处理原理（React 18）：**

```text
React 18 使用微任务（Microtask）实现全局批处理：

setState → 加入更新队列 → 判断是否在批处理窗口
  ├─ 是 → 等待批处理结束统一刷新
  └─ 否 → 立即渲染（flushSync 场景）

批处理窗口通过调度器控制：
- 事件回调 → 自动开启批处理
- 异步回调 → React 18 也开启批处理
```

**知识点：** `批处理` `Batching` `React 18` `flushSync` `性能优化` `自动批处理`

:::

### Q31: useId 是什么？解决什么问题？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**useId** 是 React 18 引入的 Hook，生成服务端和客户端一致的 UUID，解决 SSR Hydration 不匹配问题。

**问题场景：**
```jsx
// ❌ SSR 问题：服务端和客户端 ID 不一致
function Form() {
  const id = Math.random()  // 服务端和客户端生成不同值
  return (
    <>
      <label htmlFor={id}>姓名</label>
      <input id={id} />
    </>
  )
}
```

**useId 解决方案：**
```jsx
import { useId } from 'react'

function Form() {
  const id = useId()  // :r1: - 服务端客户端一致
  return (
    <>
      <label htmlFor={id}>姓名</label>
      <input id={id} />
    </>
  )
}
```

**生成的 ID 格式：** `:r1:` `:r2:` `:r3:`

**使用场景：**
- 表单 label 和 input 关联
- aria-describedby 关联
- 可访问性属性

**注意事项：** 不用于 key，不用于列表

**知识点：** `useId` `UUID` `SSR` `Hydration` `可访问性`

:::

### Q32: useSyncExternalStore 是什么？如何订阅外部数据源？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**useSyncExternalStore** 是 React 18 引入的 Hook，用于订阅外部数据源，解决 tearing（撕裂）问题。

**基本用法：**
```jsx
import { useSyncExternalStore } from 'react'

const store = {
  value: 0,
  listeners: new Set(),
  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  },
  getValue() { return this.value }
}

function Counter() {
  const value = useSyncExternalStore(
    store.subscribe.bind(store),
    () => store.getValue()
  )
  return <div>{value}</div>
}
```

**参数：**
- subscribe: 订阅函数
- getSnapshot: 获取当前值
- getServerSnapshot: SSR 值（可选）

**使用场景：**
- 状态管理库内部（Redux/Zustand）
- 浏览器 API（window.innerWidth）
- WebSocket 订阅

**为什么需要：** 防止并发渲染时的视觉撕裂

**知识点：** `useSyncExternalStore` `外部订阅` `Tearing` `并发渲染`

:::

### Q33: useInsertionEffect 是什么？和 useLayoutEffect 的区别？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**useInsertionEffect** 是 React 18 引入的 Hook，在 DOM 插入前执行，用于 CSS-in-JS 库注入样式。

**执行时机：**
```
render → useInsertionEffect → useLayoutEffect → useEffect
```

**用法：**
```jsx
useInsertionEffect(() => {
  const style = document.createElement('style')
  style.textContent = css
  document.head.appendChild(style)
  return () => style.remove()
}, [css])
```

**与 useLayoutEffect 区别：**

| 维度 | useInsertionEffect | useLayoutEffect |
|------|-------------------|-----------------|
| 时机 | DOM 插入前 | DOM 布局后 |
| 用途 | 样式注入 | DOM 测量 |
| 读取 DOM | ❌ | ✅ |
| 使用者 | CSS-in-JS 库 | 业务组件 |

**普通业务代码不用，专为 CSS-in-JS 设计**

**知识点：** `useInsertionEffect` `CSS-in-JS` `样式注入`

:::

### Q34: React 19 中 useFormStatus 和 useOptimistic 的用法？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**useFormStatus - 表单提交状态**
```jsx
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>{pending ? '提交中...' : '提交'}</button>
}

function Form() {
  return (
    <form action={submitAction}>
      <input name="email" />
      <SubmitButton />
    </form>
  )
}
```

**useOptimistic - 乐观更新**
```jsx
import { useOptimistic } from 'react'

function MessageThread({ messages, sendMessage }) {
  const [optimisticMessages, add] = useOptimistic(
    messages,
    (state, msg) => [...state, msg]
  )
  
  async function submit(formData) {
    const msg = { text: formData.get('message'), sending: true }
    add(msg)  // 立即显示
    await sendMessage(formData)  // 后台请求
  }
  
  return (
    <>
      {optimisticMessages.map(m => <div key={m.id}>{m.text}</div>)}
      <form action={submit}><input name="message" /><button>发送</button></form>
    </>
  )
}
```

**乐观更新原理：** 用户操作→立即更新 UI→后台请求→真实数据覆盖

**使用场景：** 点赞、关注、购物车、消息发送

**知识点：** `useFormStatus` `useOptimistic` `React 19` `乐观更新`

:::

### Q35: 自定义 Hook 的最佳实践？如何测试自定义 Hook？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**最佳实践：**

1. **命名规范** - 以 use 开头：useLocalStorage, useFetch

2. **单一职责** - 一个 Hook 做一件事

3. **稳定返回** - 用 useMemo 缓存返回对象

4. **错误处理**
```jsx
function useFetch(url) {
  const [state, setState] = useState({ loading: true, error: null, data: null })
  useEffect(() => {
    fetch(url).then(setData).catch(setError)
  }, [url])
  return state
}
```

**测试自定义 Hook：**
```jsx
import { renderHook, act, waitFor } from '@testing-library/react'

// 测试初始值
test('初始值正确', () => {
  const { result } = renderHook(() => useCounter())
  expect(result.current.count).toBe(0)
})

// 测试更新
test('increment 增加计数', () => {
  const { result } = renderHook(() => useCounter())
  act(() => { result.current.increment() })
  expect(result.current.count).toBe(1)
})

// 测试异步
test('获取数据', async () => {
  global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({}) }))
  const { result } = renderHook(() => useFetch('/api'))
  await waitFor(() => expect(result.current.loading).toBe(false))
})
```

**知识点：** `自定义 Hook` `最佳实践` `测试` `renderHook`

:::
