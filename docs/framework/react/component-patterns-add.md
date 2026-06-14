### Q6: React 高阶组件（HOC）的模式和问题？

> **🔥 中等 · framework/react/component-patterns**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**高阶组件（HOC）是参数为组件，返回值为新组件的函数。**

**基本模式：**

```jsx
function withLogging(WrappedComponent) {
  return class extends React.Component {
    componentDidMount() {
      console.log(`Mounting: ${WrappedComponent.name}`)
    }
    
    render() {
      return <WrappedComponent {...this.props} />
    }
  }
}

// 使用
const LoggedButton = withLogging(Button)
```

**常见 HOC 模式：**

**1. Props Proxy（属性代理）**

```jsx
function withProps(WrappedComponent) {
  return function Enhanced(props) {
    const extraProps = { userId: 123 }
    return <WrappedComponent {...extraProps} {...props} />
  }
}
```

**2. 反向继承（Inheritance Inversion）**

```jsx
function withState(WrappedComponent) {
  return class extends WrappedComponent {
    render() {
      return super.render()
    }
  }
}
```

**3. 条件渲染**

```jsx
function withAuth(WrappedComponent) {
  return function Authenticated(props) {
    if (!props.isAuthenticated) {
      return <Login />
    }
    return <WrappedComponent {...props} />
  }
}
```

**HOC 的问题：**

**1. 静态方法丢失**

```jsx
// 原组件有静态方法
MyComponent.fetchData = () => {...}

// 被 HOC 包裹后丢失
const Enhanced = withLogging(MyComponent)
Enhanced.fetchData  // undefined ❌

// 解决：hoist-non-react-statics
import hoistNonReactStatics from 'hoist-non-react-statics'

function withLogging(WrappedComponent) {
  class Enhanced extends React.Component {...}
  return hoistNonReactStatics(Enhanced, WrappedComponent)
}
```

**2. Ref 无法传递**

```jsx
// Ref 会传递给 HOC，而非内部组件
const LoggedInput = withLogging(Input)
<input ref={ref} />  // ref 指向 HOC 而非 Input

// 解决：使用 React.forwardRef
const LoggedInput = React.forwardRef((props, ref) => {
  return <Input {...props} ref={ref} />
})
```

**3. 包装链过长**

```jsx
// 多层 HOC 嵌套
export default withTheme(withAuth(withLogging(Profile)))
// 调试困难，性能受影响
```

**4. Props 来源不清晰**

```jsx
// 无法直观看出 props 被注入
<Profile userId={123} />  // userId 从哪来？

// 理想情况（Hooks 更清晰）
function Profile() {
  const userId = useAuth()  // 明确来源
}
```

**HOC vs Hooks：**

| 特性 | HOC | Hooks |
|------|-----|-------|
| 语法 | 包裹组件 | 函数调用 |
| Props 冲突 | 可能 | 不会 |
| Ref 转发 | 需特殊处理 | 天然支持 |
| 调试 | 困难 | 容易 |
| 推荐度 | 遗留代码 | 新代码首选 |

**知识点：** `HOC` `高阶组件` `Props Proxy` `Ref 转发` `静态方法`

:::

### Q7: Render Props 模式是什么？和 HOC 相比的优缺点？

> **🔥 中等 · framework/react/component-patterns**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Render Props 是一种组件间复用逻辑的技术，通过函数类型的 prop 实现。**

**基本模式：**

```jsx
// 使用 render prop 的组件
class MouseTracker extends React.Component {
  state = { x: 0, y: 0 }
  
  handleMouseMove = (e) => {
    this.setState({ x: e.clientX, y: e.clientY })
  }
  
  render() {
    return (
      <div onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    )
  }
}

// 使用
<MouseTracker render={({ x, y }) => (
  <h1>鼠标位置：{x}, {y}</h1>
)} />
```

**实际应用场景：**

**1. 权限控制**

```jsx
<Authorize roles={['admin']}>
  {({ isAuthorized }) => (
    isAuthorized ? <AdminPanel /> : <NoAccess />
  )}
</Authorize>
```

**2. 表单验证**

```jsx
<FormField validate={validateEmail}>
  {({ value, error, onChange }) => (
    <input 
      value={value}
      onChange={onChange}
      className={error ? 'invalid' : ''}
    />
  )}
</FormField>
```

**3. 数据获取**

```jsx
<Fetch url="/api/users">
  {({ data, loading, error }) => {
    if (loading) return <Spinner />
    if (error) return <Error />
    return <UserList users={data} />
  }}
</Fetch>
```

**Render Props vs HOC 对比：**

| 特性 | Render Props | HOC |
|------|--------------|-----|
| 组合方式 | 函数调用 | 组件包裹 |
| Props 冲突 | 不会 | 可能 |
| 嵌套问题 | 深度嵌套 | 包装链 |
| 可读性 | 较好 | 较差 |
| 灵活性 | 高 | 中 |

**Render Props 的问题：**

**1. 回调地狱（嵌套过深）**

```jsx
// ❌ 多层嵌套难以维护
<MouseTracker>
  {({ x, y }) => (
    <ThemeConsumer>
      {({ theme }) => (
        <AuthConsumer>
          {({ user }) => (
            <div style={{ color: theme }}>
              {user ? <Profile x={x} y={y} /> : null}
            </div>
          )}
        </AuthConsumer>
      )}
    </ThemeConsumer>
  )}
</MouseTracker>
```

**解决：提取为独立组件或使用 Hooks**

```jsx
// Hooks 更简洁
function useMousePosition() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handler = e => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])
  return pos
}

function Component() {
  const { x, y } = useMousePosition()
  return <h1>位置：{x}, {y}</h1>
}
```

**知识点：** `Render Props` `HOC` `函数作为 Children` `逻辑复用` `嵌套问题`

:::

### Q8: React Compound Components（复合组件）模式？

> **💀 困难 · framework/react/component-patterns**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**复合组件模式：多个组件配合工作，共享隐式状态。**

**核心特征：**
- 父组件提供上下文
- 子组件消费上下文
- 组件间隐式通信

**经典案例：Select 组件**

```jsx
// 使用方式
<Select value={selected} onChange={setSelected}>
  <Select.Option value="1">选项 1</Select.Option>
  <Select.Option value="2">选项 2</Select.Option>
  <Select.Option value="3">选项 3</Select.Option>
</Select>
```

**实现方式 1：Context API**

```jsx
const SelectContext = React.createContext(null)

function Select({ value, onChange, children }) {
  return (
    <SelectContext.Provider value={{ value, onChange }}>
      <div className="select">{children}</div>
    </SelectContext.Provider>
  )
}

function Option({ value, children }) {
  const context = React.useContext(SelectContext)
  const isSelected = context.value === value
  
  return (
    <div 
      className={`option ${isSelected ? 'selected' : ''}`}
      onClick={() => context.onChange(value)}
    >
      {children}
    </div>
  )
}

Select.Option = Option
```

**实现方式 2：克隆元素（React.cloneElement）**

```jsx
function Select({ value, onChange, children }) {
  const options = React.Children.map(children, child => {
    if (child.type === Option) {
      return React.cloneElement(child, {
        value,
        onChange,
        isSelected: child.props.value === value
      })
    }
    return child
  })
  
  return <div className="select">{options}</div>
}
```

**更复杂的应用：Tabs 组件**

```jsx
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Trigger value="tab1">标签 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">标签 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">内容 1</Tabs.Content>
  <Tabs.Content value="tab2">内容 2</Tabs.Content>
</Tabs>
```

**使用场景：**
- 表单组件（Form, Field, Label, Error）
- 菜单组件（Menu, MenuItem, MenuDivider）
- 对话框组件（Dialog, DialogHeader, DialogContent, DialogFooter）
- 手风琴组件（Accordion, AccordionItem, AccordionTrigger, AccordionContent）

**优势：**
- API 表达力强
- 组件灵活组合
- 隐式状态共享

**劣势：**
- 实现相对复杂
- 需要理解 Context 或 cloneElement

**知识点：** `Compound Components` `Context API` `克隆元素` `组件组合` `状态共享`

:::

### Q9: React 中的状态提升和状态下放分别是什么？

> **🔥 中等 · framework/react/component-patterns**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**状态提升（Lifting State Up）：将状态移动到最近的共同父组件。**

**场景：多个组件需要同步状态**

```jsx
// ❌ 问题：两个组件状态不同步
function TemperatureInput() {
  const [temp, setTemp] = useState(0)
  return <input value={temp} onChange={e => setTemp(e.target.value)} />
}

// ✅ 解决：状态提升到共同父组件
function Calculator() {
  const [temperature, setTemperature] = useState('')
  
  return (
    <>
      <TemperatureInput 
        scale="celsius"
        temperature={temperature}
        onTemperatureChange={setTemperature}
      />
      <TemperatureInput 
        scale="fahrenheit"
        temperature={temperature}
        onTemperatureChange={setTemperature}
      />
    </>
  )
}
```

**状态提升的原则：**
1. 找到所有需要该状态的组件
2. 定位最近的共同祖先
3. 将状态移到这里
4. 通过 props 传递给子组件

---

**状态下放（Pushing State Down）：将状态移动到更需要的地方。**

**场景：状态被过多组件传递但只有少数需要**

```jsx
// ❌ 问题：中间组件不需要状态但必须转发
function App() {
  const [user, setUser] = useState(null)
  return <Layout user={user} />
}

function Layout({ user }) {
  return <Sidebar user={user} />  // 只是转发
}

function Sidebar({ user }) {
  return <Header user={user} />  // 还是转发
}

function Header({ user }) {
  return <Avatar user={user} />  // 终于用到了
}
```

**状态下放的方案：**

**1. 使用 Context**

```jsx
const UserContext = createContext(null)

function App() {
  const [user, setUser] = useState(null)
  return (
    <UserContext.Provider value={user}>
      <Layout />
    </UserContext.Provider>
  )
}

function Header() {
  const user = useContext(UserContext)  // 直接消费
  return <Avatar user={user} />
}
```

**2. 组件组合**

```jsx
function Layout({ user }) {
  return (
    <>
      <Sidebar />  {/* 不需要 user */}
      <Header user={user} />  {/* 直接传递 */}
    </>
  )
}
```

**选择原则：**

| 场景 | 策略 |
|------|------|
| 多个兄弟组件需要同状态 | 状态提升 |
| 深层组件需要状态 | Context / 组件组合 |
| 状态被过多层传递 | 状态下放 |
| 全局状态（用户、主题） | Context / 状态管理库 |

**知识点：** `状态提升` `状态下放` `Props Drilling` `Context` `组件设计`

:::

### Q10: React 组件通信有哪些方式？

> **🔥 中等 · framework/react/component-patterns**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React 组件通信的 7 种主要方式：**

---

**1. Props（父 → 子）**

```jsx
function Parent() {
  const [count, setCount] = useState(0)
  return <Child count={count} onIncrement={() => setCount(c => c + 1)} />
}

function Child({ count, onIncrement }) {
  return <button onClick={onIncrement}>{count}</button>
}
```

**2. Callback 函数（子 → 父）**

```jsx
function Parent() {
  const handleData = (data) => {
    console.log('收到子组件数据:', data)
  }
  return <Child onSend={handleData} />
}

function Child({ onSend }) {
  const handleClick = () => {
    onSend({ id: 1, name: '测试' })
  }
  return <button onClick={handleClick}>发送</button>
}
```

**3. Context（跨层级）**

```jsx
const ThemeContext = createContext('light')

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <DeepChild />
    </ThemeContext.Provider>
  )
}

function DeepChild() {
  const theme = useContext(ThemeContext)
  return <div className={theme}>主题：{theme}</div>
}
```

**4. Ref（父访问子实例）**

```jsx
function Parent() {
  const inputRef = useRef(null)
  
  const focusInput = () => {
    inputRef.current?.focus()
  }
  
  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>聚焦输入框</button>
    </>
  )
}
```

**5. 事件总线（任意组件）**

```jsx
// 创建事件总线
const eventEmitter = {
  events: {},
  on(event, callback) {
    if (!this.events[event]) this.events[event] = []
    this.events[event].push(callback)
  },
  emit(event, data) {
    this.events[event]?.forEach(cb => cb(data))
  }
}

// 组件 A 发送
eventEmitter.emit('data-change', { id: 1 })

// 组件 B 接收
eventEmitter.on('data-change', handleData)
```

**6. 状态管理库（Redux/Zustand/Jotai）**

```jsx
// Zustand
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}))

function ComponentA() {
  const increment = useStore(state => state.increment)
  return <button onClick={increment}>增加</button>
}

function ComponentB() {
  const count = useStore(state => state.count)
  return <div>计数：{count}</div>
}
```

**7. window 对象 / localStorage（持久化通信）**

```jsx
// 使用 localStorage 事件
window.addEventListener('storage', (e) => {
  if (e.key === 'sharedData') {
    console.log('收到数据:', e.newValue)
  }
})

// 触发
localStorage.setItem('sharedData', JSON.stringify(data))
```

**选择指南：**

| 通信场景 | 推荐方式 |
|----------|----------|
| 父子组件 | Props + Callback |
| 隔代组件 | Props 透传 / Context |
| 深层嵌套 | Context / 状态管理 |
| 任意组件 | 状态管理库 / 事件总线 |
| 跨标签页 | localStorage |
| 访问子组件 | Ref |

**知识点：** `Props` `Context` `Ref` `状态管理` `事件总线` `组件通信`

:::