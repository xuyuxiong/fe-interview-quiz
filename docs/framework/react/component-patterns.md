
### Q1: React 中 Portal 的理解？使用场景？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Portal：** 将子组件渲染到 DOM 中的其他位置，而非父组件 DOM 内部。

```jsx
import { createPortal } from 'react-dom'

function Modal({ children, onClose }) {
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body  // 渲染到 body 下，而非组件内部
  )
}

// 使用
function App() {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ overflow: 'hidden', position: 'relative' }}>
      <button onClick={() => setOpen(true)}>打开弹窗</button>
      {open && <Modal onClose={() => setOpen(false)}>内容</Modal>}
    </div>
  )
}
```

**为什么需要 Portal？**

| 问题 | 原因 | Portal 解决 |
|------|------|-------------|
| z-index 被覆盖 | 父元素 z-index 低 | 渲染到 body，不受父级影响 |
| overflow: hidden | 父元素裁剪 | 绕过父元素限制 |
| position: relative | 父元素定位干扰 | 绝对定位不受影响 |

**常用场景：** Modal / Dialog / Toast / Tooltip / Dropdown / 通知

**注意：** Portal 的事件冒泡仍然遵循 React 组件树（而非 DOM 树），所以父组件的事件处理器仍然能捕获到 Portal 内的事件。

**知识点：** `Portal` `createPortal` `Modal` `z-index` `事件冒泡`

:::

### Q2: React 组件间有哪些通信方式？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 方式 | 方向 | 适用场景 |
|------|------|---------|
| Props | 父→子 | 最基本方式 |
| Callback | 子→父 | 子组件调用父传入的函数 |
| Context | 跨层级 | 主题/语言/用户信息 |
| Redux/Zustand | 全局 | 复杂状态管理 |
| Event Bus | 任意 | 解耦通信（不推荐） |
| Ref | 父→子 | 调用子组件方法 |
| 状态提升 | 兄弟 | 共享状态提到共同父组件 |
| Props 透传 | 祖→孙 | 逐层传递（会用解构简化） |

```jsx
// 1. Props + Callback（父子通信）
function Parent() {
  const [data, setData] = useState('')
  return <Child value={data} onChange={setData} />
}

// 2. Context（跨层级）
const ThemeCtx = createContext('light')
function Grandchild() {
  const theme = useContext(ThemeCtx) // 直接获取，不用逐层传递
}

// 3. Ref（父调用子方法）
function Parent() {
  const childRef = useRef()
  return <Child ref={childRef} />
  // childRef.current.doSomething()
}
const Child = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({ doSomething: () => {} }))
})

// 4. 状态提升（兄弟通信）
function Parent() {
  const [shared, setShared] = useState('')
  return (
    <>
      <A value={shared} onChange={setShared} />
      <B value={shared} onChange={setShared} />
    </>
  )
}
```

**知识点：** `组件通信` `Props` `Context` `状态提升` `Ref` `Redux`

:::

---

### Q3: React 类组件和函数组件的区别？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心区别：**

| 特性 | 类组件 | 函数组件 + Hooks |
|------|--------|-----------------|
| 语法 | class 继承 React.Component | 函数 |
| 状态管理 | this.state | useState |
| 生命周期 | componentDidMount 等 | useEffect |
| this | 需要 bind | 无 this |
| 代码复用 | HOC、Render Props | Custom Hooks |
| 性能优化 | shouldComponentUpdate | React.memo、useMemo |
| Tree Shaking | 差 | 好 |
| 包大小 | 大（继承类） | 小 |

**类组件示例：**

```jsx
class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { count: 0 }
    this.handleClick = this.handleClick.bind(this)
  }
  
  handleClick() {
    this.setState({ count: this.state.count + 1 })
  }
  
  componentDidMount() {
    console.log('组件挂载')
  }
  
  componentDidUpdate(prevProps, prevState) {
    console.log('组件更新')
  }
  
  componentWillUnmount() {
    console.log('组件卸载')
  }
  
  render() {
    return (
      <button onClick={this.handleClick}>
        Count: {this.state.count}
      </button>
    )
  }
}
```

**函数组件等价实现：**

```jsx
function Counter() {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    console.log('组件挂载')
    return () => {
      console.log('组件卸载')
    }
  }, [])
  
  useEffect(() => {
    console.log('组件更新')
  })
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

**性能对比：**

```jsx
// 类组件 - 每次创建新实例
class ExpensiveComponent extends React.Component {
  constructor(props) {
    super(props)
    this.handler = this.handler.bind(this)  // 每次实例化都要 bind
  }
}

// 函数组件 - 无实例开销
function ExpensiveComponent() {
  // 无实例创建
  const handler = useCallback(() => {}, [])  // 可缓存
  return <div />
}
```

**Hook 优势：**

```jsx
// ✅ 逻辑复用（Custom Hooks）
function useWindowSize() {
  const [size, setSize] = useState({ w: 0, h: 0 })
  
  useEffect(() => {
    const resize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])
  
  return size
}

// 多个组件复用
function A() { const { w, h } = useWindowSize() }
function B() { const { w, h } = useWindowSize() }

// ❌ 类组件复用困难（需要 HOC 或 Render Props）
```

**选择建议：**

| 场景 | 推荐 |
|------|------|
| 新项目 | 函数组件 + Hooks |
| 老项目 | 混合使用 |
| 简单组件 | 函数组件 |
| 复杂状态逻辑 | 函数组件 + useReducer |
| 错误边界 | 类组件（ErrorBoundary） |
| 仍需 Class | React 2025 年将废弃 |

**知识点：** `类组件` `函数组件` `Hooks` `性能` `逻辑复用`

:::

---

### Q4: React 如何实现组件销毁？

> **⭐ 简单 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**函数组件的销毁（清理）：**

通过 `useEffect` 的返回函数实现。

```jsx
function Component() {
  useEffect(() => {
    // 挂载时执行
    console.log('组件挂载')
    
    const timer = setInterval(() => {}, 1000)
    
    // 返回的函数在卸载时执行
    return () => {
      console.log('组件卸载')
      clearInterval(timer)
    }
  }, [])  // 空依赖数组 = 只在卸载时清理
}
```

**常见清理场景：**

```jsx
// 1. 清除定时器
useEffect(() => {
  const timer = setInterval(update, 1000)
  return () => clearInterval(timer)
}, [])

// 2. 取消网络请求
useEffect(() => {
  const controller = new AbortController()
  fetch('/api', { signal: controller.signal })
  
  return () => {
    controller.abort()  // 取消请求
  }
}, [])

// 3. 移除事件监听
useEffect(() => {
  const handler = () => console.log('resize')
  window.addEventListener('resize', handler)
  
  return () => {
    window.removeEventListener('resize', handler)
  }
}, [])

// 4. 清理订阅
useEffect(() => {
  const subscription = eventBus.subscribe(handler)
  return () => {
    subscription.unsubscribe()
  }
}, [])
```

**类组件的销毁：**

```jsx
class Component extends React.Component {
  componentDidMount() {
    this.timer = setInterval(() => {}, 1000)
  }
  
  componentWillUnmount() {
    // 类组件的销毁钩子
    clearInterval(this.timer)
  }
  
  render() {
    return <div />
  }
}
```

**从组件树中移除：**

```jsx
// 1. 条件渲染
{show && <Component />}  // show=false 时组件卸载

// 2. key 变化
<Component key={id} />  // id 变化时，旧组件卸载

// 3. 渲染 null
function Component() {
  if (!auth) return null  // 返回 null 也会触发清理
  return <div />
}
```

**内存泄漏防范：**

```jsx
function Component() {
  useEffect(() => {
    let mounted = true
    
    async function fetchData() {
      const data = await api.get('/data')
      if (mounted) setData(data)  // 检查是否已卸载
    }
    
    fetchData()
    
    return () => {
      mounted = false
    }
  }, [])
}
```

**知识点：** `useEffect` `清理函数` `componentWillUnmount` `内存泄漏`

:::

---

### Q5: HTML 和 React 事件处理的区别？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心区别：**

| 特性 | HTML DOM | React |
|------|----------|-------|
| 命名 | onclick (小写) | onClick (camelCase) |
| 传值 | 字符串 | 函数 |
| 默认行为 | 自动触发 | 需用 preventDefault |
| 事件委托 | 每个元素绑定 | 统一委托到 root |
| this | 指向元素 | undefined（严格模式） |

**命名差异：**

```html
<!-- HTML -->
<button onclick="handleClick()">点击</button>
<button onkeydown="handleKeyDown()">输入</button>

<!-- React -->
<button onClick={handleClick}>点击</button>
<input onKeyDown={handleKeyDown} />
```

**传值差异：**

```js
// HTML - 字符串
<button onclick="alert('clicked')">点击</button>

// React - 函数
<button onClick={() => alert('clicked')}>点击</button>
<button onClick={handleClick}>点击</button>  // ✅
<button onClick={handleClick()}>点击</button>  // ❌ 立即执行
```

**阻止默认行为：**

```js
// HTML
<form onsubmit="handleSubmit(); return false">

// React
function handleSubmit(e) {
  e.preventDefault()  // 必须显式调用
}
```

**事件差异：**

```jsx
// React 使用合成事件（SyntheticEvent）
function Component() {
  const handleClick = (e) => {
    // e 是 React 的合成事件，跨浏览器兼容
    console.log(e.target)
    console.log(e.type)  // 'click'
    console.log(e.nativeEvent)  // 原生事件
  }
  
  return <button onClick={handleClick}>点击</button>
}
```

**事件委托原理：**

```jsx
// React 17+：事件委托到 root
// 所有事件都绑定在 root 节点
// 而不是每个元素上

// 好处：
// 1. 减少内存占用
// 2. 动态添加的元素自动有事件
// 3. 统一处理事件

// 示例
function List() {
  const handleClick = (e) => {
    console.log(e.target.textContent)
  }
  
  return (
    <ul onClick={handleClick}>
      <li>A</li>
      <li>B</li>
      <li>C</li>
    </ul>
  )
}
```

**React vs 原生混合：**

```jsx
// ⚠️ 避免：原生事件监听 React 事件
const ref = useRef(null)

useEffect(() => {
  ref.current.addEventListener('click', handler)  // 可能触发两次
  return () => ref.current.removeEventListener('click', handler)
}, [])

return <button ref={ref}>点击</button>

// ✅ 正确：都用 React 事件
<button onClick={handler}>点击</button>
```

**事件池（React 16 及之前）：**

```jsx
// React 16: 事件会被回收
handleChange = (e) => {
  setTimeout(() => {
    console.log(e.target.value)  // ❌ null（事件对象被回收）
  }, 1000)
}

// 解决方案：e.persist()
handleChange = (e) => {
  e.persist()
  setTimeout(() => {
    console.log(e.target.value)  // ✅
  }, 1000)
}

// React 17+: 事件池已移除，无需 persist
```

**知识点：** `合成事件` `事件委托` `camelCase` `preventDefault`

:::

### Q6: React 高阶组件（HOC）的模式和问题？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**高阶组件（HOC）：** 接收一个组件，返回一个新组件的函数。是 React 中复用组件逻辑的经典模式。

```jsx
// HOC 定义
function withLogging(WrappedComponent) {
  return function LoggedComponent(props) {
    useEffect(() => {
      console.log(`${WrappedComponent.name} 已挂载`)
      return () => console.log(`${WrappedComponent.name} 将卸载`)
    }, [])
    
    return <WrappedComponent {...props} />
  }
}

// 使用
const ButtonWithLog = withLogging(Button)

// 参数传递的 HOC（工厂函数）
function withTheme(themeName) {
  return function(WrappedComponent) {
    return function ThemedComponent(props) {
      const theme = themes[themeName]
      return <WrappedComponent theme={theme} {...props} />
    }
  }
}

const PrimaryButton = withTheme('primary')(Button)
```

**常见 HOC 模式：**

| HOC | 功能 | 示例 |
|-----|------|------|
| 日志/调试 | 生命周期追踪 | withLogging |
| 权限控制 | 条件渲染 | withAuth |
| 数据获取 | 通用数据加载 | withData |
| 样式主题 | 注入 theme | withTheme |
| 表单处理 | 注入 form props | withForm |

**HOC 的问题：**

1. **包装链过长**：多个 HOC 嵌套导致调试困难
```jsx
export default withA(withB(withC(Component)))  // 难以追踪
```

2. **静态方法丢失**：HOC 返回新组件，原静态方法不会自动继承
```jsx
Component.staticMethod = () => {}
const Enhanced = withLogging(Component)
Enhanced.staticMethod  // undefined ❌

// 解决：hoist-non-react-statics
import hoistNonReactStatic from 'hoist-non-react-statics'
function withLogging(WrappedComponent) {
  function LoggedComponent(props) { ... }
  return hoistNonReactStatics(LoggedComponent, WrappedComponent)
}
```

3. **Props 冲突**：HOC 注入的 props 可能与组件原有 props 重名

4. **Debug 困难**：组件树中看不到 HOC 名称

**现代替代方案：Hooks**
```jsx
function useLogging(componentName) {
  useEffect(() => {
    console.log(`${componentName} 已挂载`)
  }, [])
}

function Button() {
  useLogging('Button')
  return <button>Click</button>
}
```

**知识点：** `HOC` `高阶组件` `组件复用` `包装器` `Hooks 替代`

:::

### Q7: Render Props 模式是什么？和 HOC 相比的优缺点？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Render Props：** 组件通过一个值为函数的 prop 来暴露内容/逻辑，函数返回 React 元素。

```jsx
function DataFetcher({ url, render, children }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch(url).then(res => res.json()).then(setData).finally(() => setLoading(false))
  }, [url])
  
  return render ? render({ data, loading }) : children({ data, loading })
}

// 使用
<DataFetcher url="/api/user" render={({ data, loading }) => (
  loading ? <Spinner /> : <UserProfile user={data} />
)}/>
```

**Render Props vs HOC 对比：**

| 维度 | Render Props | HOC |
|------|-------------|-----|
| 代码可见性 | ✅ 清晰，直接在 JSX 中看到 | ❌ 隐藏 |
| Props 冲突 | ✅ 无冲突 | ❌ 可能覆盖 |
| 组合性 | ⚠️ 嵌套过深 | ⚠️ 包装链长 |

**缺点：嵌套地狱**
```jsx
<DataFetcher url="/user">
  {({ data: user }) => (
    <DataFetcher url="/posts">
      {({ data: posts }) => (
        <UserProfile user={user} posts={posts} />
      )}
    </DataFetcher>
  )}
</DataFetcher>
```

**现代替代方案：Custom Hooks**
```jsx
function useDataFetcher(url) {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch(url).then(res => res.json()).then(setData)
  }, [url])
  return data
}
```

**知识点：** `Render Props` `children 函数` `组件复用` `嵌套地狱` `Hooks 替代`

:::

### Q8: React Compound Components（复合组件）模式？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**复合组件模式：** 多个组件一起工作，共享隐含的状态，通过组合形成灵活的 API。

```jsx
// 使用示例
<Tabs defaultTab={0}>
  <TabList>
    <Tab>首页</Tab>
    <Tab>关于</Tab>
  </TabList>
  <TabPanels>
    <TabPanel>首页内容</TabPanel>
    <TabPanel>关于内容</TabPanel>
  </TabPanels>
</Tabs>
```

**实现：Context + 状态共享**
```jsx
const TabsContext = React.createContext()

function Tabs({ defaultTab = 0, children }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  )
}

function Tab({ children, index }) {
  const { activeTab, setActiveTab } = useContext(TabsContext)
  return (
    <button onClick={() => setActiveTab(index)}>
      {children}
    </button>
  )
}

function TabPanel({ children, index }) {
  const { activeTab } = useContext(TabsContext)
  return activeTab === index ? <div>{children}</div> : null
}

Tabs.TabList = TabList
Tabs.Tab = Tab
Tabs.TabPanel = TabPanel
```

**优势：** 灵活 API、隐含状态共享、语义化、易维护

**真实库：** Chakra UI、Radix UI、Headless UI

**知识点：** `Compound Components` `Context` `组件组合` `状态共享`

:::

### Q9: React 中的状态提升和状态下放分别是什么？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**状态提升（Lifting State Up）：** 将子组件的状态移动到共同的父组件中，使多个子组件可以共享同一状态。

```jsx
// 两个输入框需要同步
function App() {
  const [temperature, setTemperature] = useState('')
  const [scale, setScale] = useState('celsius')
  
  return (
    <>
      <TemperatureInput scale="celsius" value={temperature} onChange={setTemperature} />
      <TemperatureInput scale="fahrenheit" value={temperature} onChange={setTemperature} />
    </>
  )
}
```

**状态提升时机：** 多个组件需要相同状态、兄弟组件共享状态、跨组件验证

**状态下放（Pushing State Down）：** 将状态放在最接近使用它的组件中。

```jsx
// ❌ 状态太高
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  return <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
}

// ✅ 状态内部
function Modal() {
  const [isOpen, setIsOpen] = useState(false)
  return <Dialog />
}
```

**原则：** 就近原则、共享需求、单一数据源

**知识点：** `状态提升` `状态下放` `共享状态` `单向数据流`

:::

### Q10: React 组件通信有哪些方式？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. 父子：Props + 回调**
```jsx
// 父→子
<Child count={count} />

// 子→父
<Child onEvent={(data) => console.log(data)} />
```

**2. 兄弟：通过父组件中转**
```jsx
function Parent() {
  const [shared, setShared] = useState(null)
  return (
    <>
      <ChildA sendData={setShared} />
      <ChildB data={shared} />
    </>
  )
}
```

**3. 跨层级：Context**
```jsx
const UserContext = createContext()
<UserContext.Provider value={{ user, setUser }}>
  <DeepComponent />
</UserContext.Provider>
```

**4. 状态管理库**
```jsx
// Zustand
const useStore = create((set) => ({ count: 0, inc: () => set(s => ({ count: s.count + 1 })) }))
const count = useStore(s => s.count)
const inc = useStore(s => s.inc)
```

**5. 事件总线**
```jsx
eventBus.emit('login', { id: 1 })
eventBus.on('login', handler)
```

**6. Ref（少用）**
```jsx
const Child = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({ focus: () => {} }))
})
```

**知识点：** `组件通信` `Props` `Context` `状态管理` `事件总线`

:::
