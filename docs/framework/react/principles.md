### Q1: 如何理解虚拟 DOM？

> **🔥 中等 · framework/react/principles**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**虚拟 DOM 是真实 DOM 的 JavaScript 对象表示。**

**工作原理：**
1. 首次渲染：VDOM → 真实 DOM
2. 状态变化：生成新 VDOM
3. Diff 对比：找出变更
4. 批量更新：最小化 DOM 操作

**优势：**
- 跨平台（React Native）
- 批量更新优化
- 声明式编程

**劣势：**
- 首次渲染慢（多一层转换）
- 简单场景可能不如直接操作 DOM

**知识点：**`虚拟 DOM` `Diff` `性能`

:::

### Q2: 类组件和函数组件的区别？

> **⭐ 简单 · framework/react/principles**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 对比项 | 类组件 | 函数组件 |
|--------|--------|----------|
| 语法 | class 语法 | 函数语法 |
| 状态 | this.state | useState |
| 生命周期 | 生命周期方法 | useEffect |
| this | 需要绑定 | 无 this |
| 性能 | 稍慢 | 稍快 |
| 趋势 | 逐步淘汰 | 推荐 |

**知识点：**`类组件` `函数组件` `Hooks`

:::

### Q3: React 为什么要引入 Fiber？

> **💀 困难 · framework/react/principles**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**解决递归渲染不可中断的问题。**

**React 15 之前：**
- 递归遍历组件树
- 一旦开始无法中断
- 大组件树阻塞主线程

**Fiber 架构：**
- 将渲染任务拆分为小单元
- 可中断、恢复、优先级调度
- 支持并发模式

**带来的能力：**
- Suspense
- useTransition
- 自动批处理

**知识点：**`Fiber` `并发渲染` `性能优化`

:::

### Q4: React 如何实现组件销毁？

> **🔥 中等 · framework/react/principles**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**函数组件：useEffect 清理函数**

```javascript
function Component() {
  useEffect(() => {
    // 组件挂载
    const timer = setInterval(...);
    
    return () => {
      // 组件卸载前清理
      clearInterval(timer);
    };
  }, []);
  
  return <div>...</div>;
}
```

**类组件：componentWillUnmount**

```javascript
class Component extends React.Component {
  componentWillUnmount() {
    clearInterval(this.timer);
  }
}
```

**知识点：**`组件销毁` `useEffect` `清理` `生命周期`

:::

### Q5: HTML 事件和 React 事件的区别？

> **🔥 中等 · framework/react/principles**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 对比项 | HTML 事件 | React 事件 |
|--------|----------|------------|
| 命名 | onclick | onClick |
| 阻止默认 | return false | e.preventDefault() |
| 阻止冒泡 | return false | e.stopPropagation() |
| 事件对象 | 浏览器原生 | 合成事件 |
| 性能 | 每个元素绑定 | 事件委托 |

```jsx
// HTML
<button onclick="handleClick(event)">Click</button>

// React
<button onClick={handleClick}>Click</button>
```

**知识点：**`事件处理` `合成事件` `JSX`

:::

### Q6: 受控组件和非受控组件

> **🔥 中等 · framework/react/principles**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**受控组件：**
```jsx
function Controlled() {
  const [value, setValue] = useState('');
  return <input value={value} onChange={e => setValue(e.target.value)} />;
}
```

**非受控组件：**
```jsx
function Uncontrolled() {
  const inputRef = useRef();
  const handleSubmit = () => console.log(inputRef.current.value);
  return <input ref={inputRef} defaultValue="" />;
}
```

**选择：**
- 受控：表单验证、条件禁用、格式化输入
- 非受控：简单场景、文件输入、性能敏感

**知识点：**`受控组件` `非受控组件` `表单`

:::

### Q7: React 性能优化手段

> **🔥 中等 · framework/react/principles**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**优化手段：**

1. **React.memo** - memo 组件
2. **useMemo/useCallback** - memo 值和函数
3. **useTransition** - 优先级渲染
4. **虚拟列表** - 长列表优化
5. **代码分割** - lazy + Suspense
6. **避免内联对象** - 导致子组件重渲染

```jsx
// 错误：每次渲染都是新对象
<Component style={{ color: 'red' }} />

// 正确：缓存对象
const style = useMemo(() => ({ color: 'red' }), []);
<Component style={style} />
```

**知识点：**`性能优化` `React.memo` `useMemo`

:::

### Q8: React 组件通信有哪些方式？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 方式 | 适用场景 | 特点 |
|------|---------|------|
| Props | 父→子 | 最基础，单向数据流 |
| 回调函数 | 子→父 | 父传函数，子调用 |
| Context | 跨级组件 | 避免 props 逐层传递 |
| Redux/Zustand | 全局状态 | 任意组件间共享 |
| Ref | 父→子(命令式) | 调用子组件方法 |
| 事件总线 | 无关系组件 | 解耦但难维护 |

```jsx
// 1. Props 父→子
function Parent() {
  return <Child name="Alice" age={18} />
}
function Child({ name, age }) {
  return <div>{name}, {age}</div>
}

// 2. 回调函数 子→父
function Parent() {
  const handleData = (data) => console.log('收到:', data)
  return <Child onSend={handleData} />
}
function Child({ onSend }) {
  return <button onClick={() => onSend('hello')}>发送</button>
}

// 3. Context 跨级通信
const ThemeCtx = createContext('light')
function App() {
  return (
    <ThemeCtx.Provider value="dark">
      <DeepChild />
    </ThemeCtx.Provider>
  )
}
function DeepChild() {
  const theme = useContext(ThemeCtx)
  return <div>Theme: {theme}</div>
}

// 4. useImperativeHandle + Ref（父调子方法）
const Child = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    getValue: () => inputRef.current.value
  }))
  const inputRef = useRef()
  return <input ref={inputRef} />
})
function Parent() {
  const childRef = useRef()
  return <><Child ref={childRef} /><button onClick={() => childRef.current.focus()}>聚焦</button></>
}

// 5. 状态提升（兄弟组件通信）
function Parent() {
  const [shared, setShared] = useState('')
  return <><ChildA value={shared} onChange={setShared} /><ChildB value={shared} /></>
}
```

**知识点：** `组件通信` `Props` `Context` `Redux` `useImperativeHandle` `状态提升`

:::
### Q9: React 事件机制详解

> **💀 困难 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React 事件机制 = 合成事件（SyntheticEvent）+ 事件委托**

```text
React 事件处理流程：
1. 用户触发DOM事件
2. React 在 root 节点（React 17+）监听所有事件
3. 事件冒泡到 root 时，React 从事件源开始收集所有事件处理器
4. 构建 SyntheticEvent（合成事件）
5. 按React理解的冒泡/捕获顺序执行处理器
6. 执行完毕后回收事件对象
```

```jsx
// React 17+ 事件委托到 root 节点
// React 16 事件委托到 document
// 区别：17+ 支持微前端多React版本共存

function App() {
  const handleClick = (e) => {
    // e 是 SyntheticEvent，不是原生 Event
    console.log(e.nativeEvent)  // 获取原生事件
    console.log(e.type)         // 'click'
    e.stopPropagation()         // 阻止冒泡（React层级）
  }
  
  return <button onClick={handleClick}>Click</button>
}
```

**核心特性：**

| 特性 | 说明 |
|------|------|
| 事件委托 | 所有事件监听挂在root，不是每个元素 |
| 合成事件 | 跨浏览器兼容的事件包装器 |
| 事件池（React 16） | 事件对象复用，用完即回收 |
| 事件优先级 | 不同事件有不同优先级（离散/连续） |
| 批处理 | 多个setState在同一事件中批处理 |

**React 事件 vs 原生事件：**

```jsx
// 原生事件和React事件执行顺序
document.addEventListener('click', () => console.log('1. document原生'))
// React 17+: root 节点
rootElement.addEventListener('click', () => console.log('2. root原生'))

function App() {
  return (
    <div onClick={() => console.log('3. React事件')}>
      <button onClick={() => console.log('3. React事件(按钮)')}>
        Click
      </button>
    </div>
  )
}

// 点击按钮输出顺序：
// 1. document原生（冒泡到document）
// 2. root原生（冒泡到root）
// 3. React事件(按钮) → React事件(div)（React内部冒泡）
```

**React 16 vs 17 事件机制变化：**

| 维度 | React 16 | React 17+ |
|------|---------|----------|
| 委托节点 | document | react root |
| 事件池 | 有（复用对象） | 无（不再池化） |
| 微前端 | 多版本冲突 | 支持多版本共存 |
| e.persist() | 需要 | 不需要 |

**React 18 事件优先级：**

```text
离散事件（Discrete）：click, keydown, focus  → 离散优先级
连续事件（Continuous）：mousemove, scroll, drag → 连续优先级
其他：load, error, animation → 默认优先级

React 调度器按优先级安排更新：
高优先级（用户交互）→ 立即处理
低优先级（数据更新）→ 可中断让步
```

**常见陷阱：**

```jsx
// ❌ e.stopPropagation() 不能阻止原生事件
document.addEventListener('click', () => console.log('原生事件'))
// React中的stopPropagation只阻止React事件冒泡

// ✅ 阻止原生事件冒泡需要用原生方法
useEffect(() => {
  const handler = (e) => e.stopPropagation()
  document.addEventListener('click', handler, true)  // 捕获阶段
  return () => document.removeEventListener('click', handler, true)
}, [])
```

**知识点：** `React事件` `合成事件` `事件委托` `事件池` `事件优先级` `冒泡`

:::

### Q10: React Diff 算法详解

> **💀 困难 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React Diff 三大策略 — 将 O(n³) 降到 O(n)：**

| 策略 | 规则 | 原因 |
|------|------|------|
| 树级别 | 只对比同一层节点 | 跨层级移动极少 |
| 组件级别 | 同类型组件才Diff | 不同类型直接替换 |
| 元素级别 | 同级同key节点复用 | key标识节点身份 |

**1. 树级别对比：**

```text
只对比同一层级的节点，不跨层级比较

     A                A
    / \              / \
   B   C    →       B   D
  / \              / \
 D    E           D   E

对比第1层: A === A → 复用
对比第2层: B === B → 复用, C !== D → C卸载, D新建
对比第3层: D === D → 复用, E保留（只移动到B下）
```

**2. 组件级别对比：**

```jsx
// 不同类型组件 → 直接卸载重建
<div> → <span>  // 替换
<ClassA> → <ClassB>  // 卸载A，挂载B

// 相同类型组件 → 更新属性
<ClassA name="old"> → <ClassA name="new">
// 只更新name，不卸载组件
```

**3. 元素级别对比（Key的作用）：**

```jsx
// 没有 key — 就地复用（按索引匹配）
// 旧: [A, B, C]
// 新: [D, A, B, C]  (头部插入D)
// React认为: A→D(更新), B→A(更新), C→B(更新), C(新建)
// = 4次操作 ❌

// 有 key — 按key匹配
// 旧: [A(key=1), B(key=2), C(key=3)]
// 新: [D(key=4), A(key=1), B(key=2), C(key=3)]
// React: D(新建), A(移动), B(移动), C(不动)
// = 1次新建 + 2次移动 ✅
```

**Key 的注意事项：**

```jsx
// ❌ 用 index 作 key（列表会增删时）
{list.map((item, index) => <Item key={index} data={item} />)}
// 当列表头部插入元素时，index全部错位，导致不必要的更新

// ✅ 用唯一 id 作 key
{list.map(item => <Item key={item.id} data={item} />)}

// ❌ 用随机数作 key
{list.map(item => <Item key={Math.random()} data={item} />)}
// 每次渲染key都变，组件每次都重建

// ❌ 用拼接index作key
{list.map((item, i) => <Item key={`${item.id}-${i}`} data={item} />)}
// index参与拼接，列表变动时key还是会变
```

**Fiber 架构下的 Diff：**

```text
React 16+ Fiber 架构：
1. 可中断的 Diff — 协调阶段可以被暂停
2. 优先级调度 — 高优先级任务插队
3. 双缓冲 — current树和workInProgress树

Diff 过程：
beginWork(current, workInProgress) → 处理每个Fiber节点
  ├─ 比较props
  ├─ 比较type
  ├─ 比较key
  └─ 生成子Fiber（复用/新建/删除）

completeWork() → 收集Effect列表
commitWork() → 不可中断，一次性提交DOM操作
```

**知识点：** `React Diff` `O(n³)到O(n)` `Key的作用` `Fiber` `组件对比` `元素复用`

:::
### Q11: React 批处理机制是什么？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**批处理（Batching）**：React将多个状态更新合并为一次重渲染，提升性能。

```jsx
// React 18 自动批处理（所有场景）
function App() {
  const [count, setCount] = useState(0)
  const [flag, setFlag] = useState(false)

  function handleClick() {
    setCount(c => c + 1)  // 不会立即渲染
    setFlag(f => !f)       // 不会立即渲染
    // React 将两次更新合并，只渲染一次 ✅
  }

  return <button onClick={handleClick}>{count}</button>
}

// React 17 的问题 — 异步中不批处理
function handleClick() {
  fetch('/api').then(() => {
    setCount(c => c + 1)  // 渲染1次
    setFlag(f => !f)       // 又渲染1次
    // React 17: 渲染2次 ❌
    // React 18: 渲染1次 ✅ (自动批处理)
  })
}
```

**React 17 vs 18 批处理对比：**

| 场景 | React 17 | React 18 |
|------|---------|---------|
| 事件处理函数 | ✅ 批处理 | ✅ 批处理 |
| setTimeout | ❌ 不批处理 | ✅ 批处理 |
| Promise | ❌ 不批处理 | ✅ 批处理 |
| fetch回调 | ❌ 不批处理 | ✅ 批处理 |
| 原生DOM事件 | ❌ 不批处理 | ✅ 批处理 |

**flushSync — 退出批处理（强制同步渲染）：**

```jsx
import { flushSync } from 'react-dom'

function handleClick() {
  flushSync(() => {
    setCount(c => c + 1)  // 立即渲染
  })
  // 此时DOM已更新
  flushSync(() => {
    setFlag(f => !f)       // 立即渲染
  })
  // 两次渲染，慎用！
}
```

**React 18 批处理原理：**

```text
React 18 使用 createRoot 开启自动批处理：

// 自动批处理
const root = createRoot(document.getElementById('root'))
root.render(<App />)

// 不自动批处理（React 17模式）
ReactDOM.render(<App />, document.getElementById('root'))
```

```text
批处理流程：
setState → 加入更新队列 → 判断是否在批处理上下文中
  ├─ 是 → 等待批处理结束再渲染（合并更新）
  └─ 否 → 立即渲染（flushSync场景）

React 18所有上下文都是批处理上下文（通过Microtask实现）
```

**知识点：** `批处理` `Batching` `flushSync` `React 18` `性能优化`

:::

### Q12: React 为什么需要 Fiber 而 Vue 不需要？

> **💀 困难 · React 原理**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心原因：React 和 Vue 的更新机制不同**

**React Fiber 的问题：**

```text
React 15 之前 — 递归渲染（不可中断）
JSX → Virtual DOM → Diff → 更新
  ↓
递归遍历组件树（同步阻塞）
  ↓
大组件树阻塞主线程 > 16ms → 掉帧卡顿

问题根源：
1. JSX 动态性 — 无法静态分析依赖
2. 状态更新 — 无法精确知道哪些组件需要更新
3. 只能从上到下递归 Diff

Fiber 解决方案：
- 将递归改为可中断的迭代
- 支持优先级调度
- 支持并发渲染
```

**Vue 不需要 Fiber 的原因：**

```text
Vue 2/3 — 响应式系统（精确更新）
数据变化 → 通知订阅者 → 精确更新对应组件
  ↓
通过依赖收集知道谁需要更新
  ↓
无需全盘 Diff，直接更新变化组件

核心优势：
1. 响应式追踪 — 编译时/运行时收集依赖
2. 精确更新 — 只更新受影响的组件
3. 无需 Fiber — 更新本身就是细粒度的
```

**对比表：**

| 特性 | React | Vue |
|------|-------|-----|
| 更新方式 | 状态驱动重新渲染 | 响应式精确更新 |
| 依赖收集 | 运行时（Hooks） | 编译时 + 运行时 |
| Diff 范围 | 整棵子树 | 精确到组件 |
| 是否需要 Fiber | ✅ 需要 | ❌ 不需要 |
| 更新粒度 | 组件级 | 属性级 |

**代码对比：**

```jsx
// React — 状态变化触发整树重新渲染
function App() {
  const [count, setCount] = useState(0)
  return (
    <div>
      <ChildA />  {/* count 变化也会重新渲染 */}
      <ChildB />  {/* count 变化也会重新渲染 */}
      <button onClick={() => setCount(c => c + 1)}>+1</button>
    </div>
  )
}
// 需要 React.memo 优化
```

```vue
<!-- Vue — 只更新依赖 count 的组件 -->
<template>
  <div>
    <ChildA />  <!-- count 不变化，不重新渲染 -->
    <ChildB :count="count" />  <!-- 只更新这里 -->
    <button @click="count++">+1</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
// count 变化只触发依赖它的组件更新
</script>
```

**知识点：** `Fiber` `Vue 响应式` `React Diff` `依赖收集` `精确更新` `并发渲染`

:::

### Q13: React 生产环境如何定位到具体错误代码行数？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**生产环境错误定位方案：**

**1. Source Map（源代码映射）：**

```js
// webpack 配置
module.exports = {
  devtool: 'hidden-source-map',  // 生成.map 但不公开
  // 或
  devtool: 'nosources-source-map'  // 有映射无源码（更安全）
}

// 将.map 文件上传到错误监控平台
// Sentry / 自建平台使用.map 还原错误位置
```

**2. Error Boundaries（错误边界）：**

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null, errorInfo: null }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    // 记录错误组件栈
    console.error('Component Stack:', errorInfo.componentStack)
    // 上报到监控平台
    reportError(error, errorInfo.componentStack)
  }
  
  render() {
    if (this.state.hasError) {
      return <FallbackUI />
    }
    return this.props.children
  }
}

// 使用
<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>
```

**3. Sentry 等监控平台：**

```js
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://xxx@sentry.io/xxx',
  release: '1.0.0',
  environment: 'production',
  integrations: [new Sentry.BrowserTracing()],
  tracesSampleRate: 1.0
})

// 自动捕获错误并还原堆栈
Sentry.captureException(new Error('Something went wrong'))
```

**4. 自定义错误上报：**

```js
window.addEventListener('error', (event) => {
  reportError({
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    url: location.href,
    userAgent: navigator.userAgent
  })
})

window.addEventListener('unhandledrejection', (event) => {
  reportError({
    type: 'unhandledrejection',
    reason: event.reason,
    promise: event.promise
  })
})
```

**5. 组件栈追踪：**

```jsx
// React 16+ 提供 componentStack
componentDidCatch(error, errorInfo) {
  console.log(errorInfo.componentStack)
  /*
  in ComponentThatThrows (created by App)
    in ErrorBoundary (created by App)
      in div (created by App)
      in App
  */
}
```

**知识点：** `Source Map` `Error Boundary` `Sentry` `错误监控` `堆栈追踪` `componentStack`

:::

### Q14: React 的 Diff 算法是如何工作的？

> **💀 困难 · framework/react/principles**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React Diff 算法基于三个核心假设进行优化：**

**1. Tree Diff（树层级比较）**

React 采用"最小化"策略，只比较同层级的节点：
- 不同层级：直接删除重建，不跨层移动
- 相同层级：进行详细对比

```jsx
// 旧树                    // 新树
<div>                    <div>
  <ComponentA />    →      <ComponentB />  // 直接替换，不比较内部
</div>                   </div>
```

**2. Component Diff（组件层级比较）**

- 同类型组件：继续比较子树
- 不同类型组件：销毁重建

```jsx
// 类型相同，继续 diff 子树
<MyComponent /> → <MyComponent />  // ✅ 比较内部

// 类型不同，直接替换
<div /> → <span />  // ✅ 销毁 div，创建 span
<CompA /> → <CompB />  // ✅ 销毁 CompA，创建 CompB
```

**3. Element Diff（元素层级比较）**

同类型元素比较属性，使用 key 优化列表：

```jsx
// 没有 key - 性能差
items.map(item => <li>{item.name}</li>)
// 变化时可能全部重建

// 有 key - 精准定位
items.map(item => <li key={item.id}>{item.name}</li>)
// ✅ 只更新变化的项
```

**Key 的作用：**
- 帮助 React 识别哪些元素改变了
- 避免不必要的 DOM 操作
- key 应该是稳定且唯一的

**时间复杂度：** O(n³) → O(n)

**知识点：** `Diff 算法` `Tree Diff` `Component Diff` `Element Diff` `Key` `性能优化`

:::

### Q15: React 中 key 相同但组件类型不同会怎样？

> **🔥 中等 · framework/react/principles**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React 会销毁并重新创建组件，即使 key 相同。**

**核心规则：类型优先于 key**

```jsx
// 场景：key 相同但类型不同
{isEditing 
  ? <input key="field" defaultValue={value} />
  : <div key="field">{value}</div>
}
```

**当 isEditing 切换时：**
1. React 发现类型从 input 变为 div
2. 即使 key 都是 "field"，也会：
   - 完全销毁 input 组件（包括状态）
   - 创建新的 div 组件
   - 状态丢失，DOM 完全重建

**实际影响：**

```jsx
function Form() {
  const [isEditing, setIsEditing] = useState(false)
  const [count, setCount] = useState(0)
  
  return (
    <>
      {/* 类型切换，状态丢失 */}
      {isEditing 
        ? <InputWithState key="field" count={count} />
        : <DisplayWithState key="field" count={count} />
      }
      
      {/* 类型相同，状态保持 */}
      {isEditing 
        ? <Input key="field2" count={count} />
        : <Input key="field2" count={count} disabled />
      }
    </>
  )
}
```

**最佳实践：**

```jsx
// ❌ 避免：类型切换导致状态丢失
{isLoggedIn ? <UserPanel /> : <GuestPanel />}

// ✅ 更好：保持类型，用 props 控制
<Panel type={isLoggedIn ? 'user' : 'guest'} />

// ✅ 或：强制重置时显式处理
{isLoggedIn 
  ? <UserPanel key="user" />
  : <GuestPanel key="guest" />
}
```

**特殊情况：Component Type 是变量**

```jsx
// 组件定义在 render 内部 - 每次都是新类型！
function Parent() {
  function Nested() { return <div>Hi</div> }  // ❌ 每次重新定义
  return <Nested />
}

// ✅ 正确：组件定义在外部
function Nested() { return <div>Hi</div> }
function Parent() { return <Nested /> }
```

**知识点：** `Key` `组件类型` `状态保持` `组件销毁` `Diff 算法`

:::

### Q16: React 18 的并发特性有哪些？Suspense 的工作原理？

> **💀 困难 · framework/react/principles**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React 18 并发特性：**

**1. 并发渲染（Concurrent Rendering）**

- 可中断的渲染过程
- 支持多任务并行处理
- 自动优先级调度

```jsx
// 启用并发模式
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(<App />)  // 自动并发
```

**2. useTransition - 标记非紧急更新**

```jsx
import { useTransition, useState } from 'react'

function Search() {
  const [query, setQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [results, setResults] = useState([])
  
  const handleChange = (e) => {
    const value = e.target.value
    
    // 紧急更新：立即响应
    setQuery(value)
    
    // 非紧急更新：可中断
    startTransition(() => {
      setResults(filterItems(value))  // 耗时操作
    })
  }
  
  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <List items={results} />
    </>
  )
}
```

**3. useDeferredValue - 延迟更新值**

```jsx
import { useDeferredValue } from 'react'

function Search() {
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  
  const results = filterItems(deferredQuery)  // 使用延迟值
  
  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <List items={results} />
    </>
  )
}
```

**4. Suspense 工作原理**

**组件挂起机制：**

```jsx
// 数据加载中抛出 Promise
function wrapPromise(promise) {
  let status = 'pending'
  let result
  
  const suspender = promise.then(
    res => { status = 'success'; result = res },
    err => { status = 'error'; result = err }
  )
  
  return {
    read() {
      if (status === 'pending') throw suspender
      if (status === 'error') throw result
      return result
    }
  }
}
```

**使用场景：**

```jsx
<Suspense fallback={<Spinner />}>
  <ProfileDetails />
  <ProfileTimeline />
</Suspense>

// 组件内部
const data = resource.read()  // 加载中会 throw promise
```

**5. 自动批处理（Automatic Batching）**

```jsx
// React 17 之前
timeout(() => {
  setCount(c => c + 1)  // 触发渲染
  setFlag(f => !f)      // 触发另一次渲染
})  // 两次渲染

// React 18+
timeout(() => {
  setCount(c => c + 1)
  setFlag(f => !f)  // ✅ 一次批处理渲染
})
```

**知识点：** `并发渲染` `useTransition` `useDeferredValue` `Suspense` `自动批处理` `优先级调度`

:::

### Q17: React 的错误边界能捕获哪些错误？不能捕获哪些？

> **🔥 中等 · framework/react/principles**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**错误边界（Error Boundaries）只能使用类组件实现。**

**✅ 能捕获的错误：**

**1. 渲染过程中的错误**

```jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false }
  
  static getDerivedStateFromError(error) {
    return { hasError: true }
  }
  
  componentDidCatch(error, errorInfo) {
    logError(error, errorInfo)
  }
  
  render() {
    return this.state.hasError ? <Fallback /> : this.props.children
  }
}

// 捕获渲染错误
function BrokenComponent() {
  throw new Error('渲染错误')  // ✅ 被捕获
  return <div>OK</div>
}
```

**2. 生命周期方法中的错误**

```jsx
class ProblematicComponent extends React.Component {
  componentDidMount() {
    throw new Error('生命周期错误')  // ✅ 被捕获
  }
  
  render() {
    return <div>OK</div>
  }
}
```

**3. 构造函数中的错误**

```jsx
class ProblematicComponent extends React.Component {
  constructor(props) {
    super(props)
    throw new Error('构造函数错误')  // ✅ 被捕获
  }
}
```

**❌ 不能捕获的错误：**

**1. 事件处理中的错误**

```jsx
function Component() {
  const handleClick = () => {
    throw new Error('事件错误')  // ❌ 不会被捕获
  }
  
  return <button onClick={handleClick}>点击</button>
}

// 正确方式：在事件处理内部 try-catch
const handleClick = () => {
  try {
    // 可能出错的操作
  } catch (error) {
    handleError(error)
  }
}
```

**2. 异步代码中的错误**

```jsx
// ❌ 不会被错误边界捕获
setTimeout(() => {
  throw new Error('定时器错误')
}, 1000)

async function fetchData() {
  const data = await api.call()
  throw new Error('异步错误')  // ❌ 不会被捕获
}

// 正确方式：在异步代码内部处理
setTimeout(() => {
  try {
    // 操作
  } catch (error) {
    handleError(error)
  }
}, 1000)
```

**3. SSR 中的错误**

**4. 错误边界本身的错误**

```jsx
class ErrorBoundary extends React.Component {
  // 如果这里出错，无法被捕获
  componentDidCatch(error, errorInfo) {
    throw new Error('边界自身错误')  // ❌ 传播到外层
  }
}
```

**最佳实践：**

```jsx
// 多层次错误边界
<ErrorBoundary fallback={<AppError />}>
  <Header />
  <ErrorBoundary fallback={<SidebarError />}>
    <Sidebar />
  </ErrorBoundary>
  <ErrorBoundary fallback={<ContentError />}>
    <MainContent />
  </ErrorBoundary>
</ErrorBoundary>
```

**知识点：** `Error Boundary` `错误捕获` `getDerivedStateFromError` `componentDidCatch` `错误处理`

:::
