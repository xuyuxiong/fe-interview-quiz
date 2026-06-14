---
title: React 基础面试题
description: React 基础核心概念，涵盖 JSX、虚拟 DOM、组件、Props/State 等 15 道经典面试题
---

# React 基础面试题

> **📚 共 15 题 · 简单 30% · 中等 50% · 困难 20%**

---

### Q1: 请解释 JSX 是什么？JSX 是如何被转换为 JavaScript 的？

> **⭐ 简单 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**JSX (JavaScript XML)** 是 JavaScript 的语法扩展，允许在 JavaScript 中直接编写类似 HTML 的标记语法。

**转换过程：**

1. **Babel 编译**：JSX 不能被浏览器直接执行，需要通过 Babel 等工具转换为普通 JavaScript
2. **React.createElement()**：JSX 最终被转换为 `React.createElement()` 调用

```jsx
// JSX 写法
const element = <h1 className="greeting">Hello, world!</h1>;

// Babel 转换后
const element = React.createElement(
  'h1',
  { className: 'greeting' },
  'Hello, world!'
);
```

**转换规则：**

| JSX 语法 | 转换结果 |
|---------|---------|
| `<div />` | `React.createElement('div')` |
| `<MyComponent />` | `React.createElement(MyComponent)` |
| `<div>{expression}</div>` | 表达式会被求值后作为 children |
| `<div {...props} />` | 展开属性为对象的各个属性 |

**关键点：**

- JSX 标签首字母大写表示自定义组件，小写表示 HTML 元素
- JSX 可以嵌入任意 JavaScript 表达式（使用 `{}`）
- JSX 本质是语法糖，不是必需的，但能显著提升代码可读性

**知识点：** `JSX` `Babel` `React.createElement`

:::

---

### Q2: 什么是虚拟 DOM？虚拟 DOM 为什么能提升性能？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**虚拟 DOM (Virtual DOM)** 是一个轻量级的 JavaScript 对象，用于描述 UI 的真实结构。

**核心原理：**

```
真实 DOM 操作（慢）→ 虚拟 DOM 比对（快）→ 最小化更新
```

**为什么能提升性能：**

1. **减少直接 DOM 操作**：DOM 操作是昂贵的，虚拟 DOM 将多次更新合并为一次

2. **Diff 算法优化**：
   - React 使用启发式 O(n) 算法进行树比对
   - 通过 key 属性快速识别节点变化
   - 只更新实际发生变化的部分

3. **批量更新**：
   - React 会将多次 setState 合并为一次更新
   - 避免频繁的重新渲染

**虚拟 DOM 的局限：**

- 首次渲染时，虚拟 DOM 有额外开销
- 对于简单静态页面，直接操作 DOM 可能更快
- 虚拟 DOM 的优势在于频繁的 UI 更新场景

**知识点：** `虚拟 DOM` `Diff 算法` `性能优化`

:::

---

### Q3: 函数组件和类组件有什么区别？在现代 React 中应该如何选择？

> **⭐ 简单 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**类组件 (Class Component)：**

```jsx
class Welcome extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }

  render() {
    return <h1>{this.state.count}</h1>;
  }
}
```

**函数组件 (Function Component)：**

```jsx
function Welcome(props) {
  const [count, setCount] = useState(0);
  return <h1>{count}</h1>;
}
```

**核心区别：**

| 特性 | 类组件 | 函数组件 |
|------|--------|----------|
| 语法 | 繁琐（class、this、constructor） | 简洁 |
| State | this.state / this.setState | useState Hook |
| 生命周期 | componentDidMount 等 | useEffect Hook |
| this 指向 | 需要绑定 | 无 this 问题 |
| 逻辑复用 | HOC / Render Props | 自定义 Hooks |
| 性能 | 有额外开销 | 更轻量 |
| Tree Shaking | 较难优化 | 更容易优化 |

**现代 React 推荐：**

- **默认选择函数组件**：配合 Hooks 更简洁、更易测试
- **使用类组件的场景**：
  - 维护老旧代码
  - 需要使用 Error Boundary（目前只有类组件支持）
  - 某些第三方库要求类组件

**知识点：** `函数组件` `类组件` `Hooks`

:::

---

### Q4: Props 和 State 有什么区别？为什么它们都应该是不可变的？

> **⭐ 简单 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Props (属性)：**

- 从父组件传递到子组件
- 对子组件来说是**只读**的
- 组件不能修改自己的 props

```jsx
function Welcome(props) {
  // ❌ 错误：不能修改 props
  props.name = 'New Name';
  
  // ✅ 正确：只能读取
  return <h1>Hello, {props.name}</h1>;
}
```

**State (状态)：**

- 组件内部管理的数据
- 可以由组件自己修改（通过 setState / useState）
- 状态变化会触发重新渲染

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  
  // ✅ 正确：通过 setter 更新
  const increment = () => setCount(count + 1);
  
  return <button onClick={increment}>{count}</button>;
}
```

**为什么不可变？**

1. **可预测性**：不可变数据更容易追踪和调试
2. **性能优化**：React 通过浅比较 `prevProps !== nextProps` 来判断是否更新
3. **时间旅行**：不可变数据支持撤销/重做功能

**错误示例：**

```jsx
// ❌ 直接修改 state
this.state.count = 1; // React 不会检测到变化，不会重新渲染

// ✅ 使用正确方式
this.setState({ count: 1 }); // 或 setCount(1)
```

**知识点：** `Props` `State` `不可变性`

:::

---

### Q5: React 中如何实现条件渲染？列表渲染时 key 的作用是什么？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**条件渲染的几种方式：**

```jsx
// 1. if/else
function Greeting({ isLoggedIn }) {
  if (isLoggedIn) {
    return <h1>Welcome back!</h1>;
  }
  return <h1>Please log in.</h1>;
}

// 2. 三元运算符
function Greeting({ isLoggedIn }) {
  return isLoggedIn ? <h1>Welcome back!</h1> : <h1>Please log in.</h1>;
}

// 3. 逻辑与 &&
function Mailbox({ unreadMessages }) {
  return (
    <div>
      {unreadMessages.length > 0 && (
        <h2>You have {unreadMessages.length} unread messages.</h2>
      )}
    </div>
  );
}
```

**列表渲染与 key：**

```jsx
function NumberList({ numbers }) {
  // ✅ 正确：使用稳定的唯一 id 作为 key
  return (
    <ul>
      {numbers.map((number) => (
        <li key={number.id}>{number.value}</li>
      ))}
    </ul>
  );
}

// ❌ 错误：使用 index 作为 key（当列表会变化时）
{numbers.map((number, index) => (
  <li key={index}>{number}</li>
))}
```

**key 的作用：**

1. **标识节点身份**：帮助 React 识别哪些元素被改变、添加或移除
2. **优化 Diff 算法**：快速定位变化的节点，减少不必要的 DOM 操作
3. **保持组件状态**：正确的 key 能确保输入框等状态组件保持正确状态

**知识点：** `条件渲染` `列表渲染` `key`

:::

---

### Q6: 什么是受控组件和非受控组件？它们分别适用于什么场景？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**受控组件 (Controlled Component)：**

表单数据由 React 状态管理，输入元素的值由 state 控制。

```jsx
function ControlledForm() {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <input
      value={value}
      onChange={handleChange}
    />
  );
}
```

**非受控组件 (Uncontrolled Component)：**

表单数据由 DOM 自身管理，通过 ref 获取值。

```jsx
function UncontrolledForm() {
  const inputRef = useRef(null);

  const handleSubmit = () => {
    console.log(inputRef.current.value);
  };

  return (
    <input
      ref={inputRef}
      defaultValue=""
    />
  );
}
```

**对比：**

| 特性 | 受控组件 | 非受控组件 |
|------|----------|------------|
| 数据来源 | React state | DOM |
| 实时验证 | ✅ 支持 | ❌ 不支持 |
| 条件禁用 | ✅ 支持 | ❌ 困难 |
| 强制格式 | ✅ 支持 | ❌ 困难 |
| 性能 | 每次输入都渲染 | 性能更好 |
| 代码量 | 较多 | 较少 |

**使用场景：**

- **受控组件**：需要实时验证、条件禁用、强制输入格式、多字段联动
- **非受控组件**：简单表单、与非 React 代码集成、文件输入、性能敏感场景

**知识点：** `受控组件` `非受控组件` `表单`

:::

---

### Q7: 请解释 React 中 key 的作用，以及在什么情况下可以使用 index 作为 key？

> **💀 困难 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**key 的核心作用：**

1. **节点身份标识**：key 是 React 用于识别哪些元素在列表中被改变、添加或移除的唯一标识
2. **优化 Diff 算法**：帮助 React 快速定位变化的节点，避免不必要的 DOM 操作
3. **保持组件状态**：确保列表项的本地状态（如输入框内容）与正确的数据项关联

**可以使用 index 作为 key 的情况：**

1. 列表是**静态的**，不会发生增删改
2. 列表项**没有本地状态**（如输入框）
3. 列表**顺序不会改变**

```jsx
// ✅ 可以使用 index
const categories = ['React', 'Vue', 'Angular']; // 静态不变化
{categories.map((item, index) => (
  <span key={index}>{item}</span>
))}

// ❌ 不应该使用 index
todos.map((todo, index) => (
  <TodoItem key={index} todo={todo} /> // 列表会增删、顺序会变
))
```

**知识点：** `key` `Diff 算法` `列表渲染`

:::

---

### Q8: 什么是 Ref？forwardRef 和 useImperativeHandle 的使用场景是什么？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Ref 基础：**

Ref 用于访问 DOM 元素或组件实例。

```jsx
function InputFocus() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  return <input ref={inputRef} />;
}
```

**forwardRef - 转发 ref：**

当需要将 ref 传递给子组件内部的实际 DOM 元素时使用。

```jsx
const FancyInput = React.forwardRef((props, ref) => {
  return <input ref={ref} className="fancy" />;
});
```

**useImperativeHandle - 自定义暴露的实例值：**

允许子组件控制通过 ref 暴露给父组件的 API。

```jsx
const FancyInput = React.forwardRef((props, ref) => {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    blur: () => inputRef.current.blur(),
  }));

  return <input ref={inputRef} />;
});
```

**知识点：** `ref` `forwardRef` `useImperativeHandle`

:::

---

### Q9: React 元素和 React 组件有什么区别？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React 元素 (React Element)：**

是描述 UI 的**不可变对象**，是 React 的最小构建单元。

```jsx
const element = React.createElement('div', { className: 'greeting' }, 'Hello');
// 或 JSX
const element = <div className="greeting">Hello</div>;
```

**React 组件 (React Component)：**

是**函数或类**，接收 props 并返回 React 元素树。

```jsx
// 函数组件
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}

// 类组件
class Welcome extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

**核心区别：**

| 特性 | React 元素 | React 组件 |
|------|------------|------------|
| 本质 | 对象 (POJO) | 函数或类 |
| 可变性 | 不可变 | 可以有内部状态 |
| 生命周期 | 无 | 有生命周期 |

**知识点：** `React 元素` `React 组件`

:::

---

### Q10: 什么是 React 严格模式 (StrictMode)？它有什么作用？

> **⭐ 简单 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**严格模式 (StrictMode)** 是 React 提供的开发工具，用于检查应用程序的潜在问题。

```jsx
import { StrictMode } from 'react';

function App() {
  return (
    <StrictMode>
      <MyComponent />
    </StrictMode>
  );
}
```

**严格模式的检查内容：**

1. **识别不安全的生命周期**：警告使用已废弃的生命周期方法
2. **检测意外的副作用**：在开发模式下，组件会**渲染两次**
3. **检测 legacy 上下文 API**：警告使用旧的 context API
4. **检测字符串 ref**：字符串 ref 已废弃

**严格模式的特点：**

- **只在开发模式生效**：生产构建中不会有任何影响
- **不影响生产性能**：不会添加到生产包中

**知识点：** `StrictMode` `开发模式`

:::

---

### Q11: React 中 key 的作用是什么？为什么不能用 index 做 key？

> **💀 困难 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**key 的核心作用：**

1. **节点身份标识**：key 是 React 用于识别哪些元素在列表中被改变、添加或移除的唯一标识
2. **优化 Diff 算法**：帮助 React 快速定位变化的节点，避免不必要的 DOM 操作
3. **保持组件状态**：正确的 key 能确保列表项的本地状态与正确的数据项关联

**为什么不能用 index 作为 key？**

```jsx
// ❌ 错误示例：使用 index 作为 key
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo, index) => (
        <TodoItem key={index} todo={todo} />
      ))}
    </ul>
  );
}

// 问题场景：
// 初始：['A', 'B', 'C'] → key: 0, 1, 2
// 删除第一个后：['B', 'C'] → key: 0, 1
// React 认为：
//   - key=0 的元素从 'A' 变成了 'B'（实际应该删除）
//   - key=1 的元素从 'B' 变成了 'C'（实际应该前移）
// 结果：不必要的更新 + 状态错乱
```

**可以使用 index 的场景：**

```jsx
// ✅ 静态列表，不会增删改
const colors = ['red', 'green', 'blue'];
{colors.map((color, index) => (
  <span key={index}>{color}</span>
))}

// ✅ 纯展示，无状态，顺序不变
const staticItems = ['Item 1', 'Item 2', 'Item 3'];
{staticItems.map((item, index) => (
  <div key={index}>{item}</div>
))}
```

**正确做法：**

```jsx
// ✅ 使用唯一 id
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}
```

**知识点：** `key` `Diff 算法` `列表渲染` `性能优化`

:::

---

### Q12: React 组件的 name 属性和 displayName 有什么用？

> **⭐ 简单 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**name 属性：**

函数的 `name` 属性是 JavaScript 内置的，用于获取函数名。

```jsx
function MyComponent() {
  return <div>Hello</div>;
}
console.log(MyComponent.name); // "MyComponent"

const ArrowComponent = () => <div>Hello</div>;
console.log(ArrowComponent.name); // "ArrowComponent"
```

**displayName 属性：**

`displayName` 是 React 特有的属性，用于在 DevTools 中显示组件名称。

```jsx
// 高阶组件场景
function withLogging(WrappedComponent) {
  function WithLogging(props) {
    return <WrappedComponent {...props} />;
  }
  
  WithLogging.displayName = `withLogging(${WrappedComponent.name})`;
  
  return WithLogging;
}

// 使用
const LoggedButton = withLogging(Button);
// DevTools 中显示：withLogging(Button)
```

**React.memo 场景：**

```jsx
const MyComponent = React.memo(function MyComponent(props) {
  return <div>{props.text}</div>;
});

// 自动设置 displayName
console.log(MyComponent.displayName); // "MyComponent"
```

**对比：**

| 属性 | 来源 | 用途 |
|------|------|------|
| name | JavaScript | 函数标识 |
| displayName | React | DevTools 显示 |

**知识点：** `displayName` `组件名称` `DevTools` `调试`

:::

---

### Q13: React 中的受控组件和非受控组件的区别？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**受控组件 (Controlled Component)：**

表单数据由 React 状态管理，输入元素的值由 state 控制。

```jsx
function ControlledForm() {
  const [value, setValue] = useState('');

  const handleChange = (e) => {
    setValue(e.target.value);
    // 实时验证
    if (e.target.value.length < 3) {
      alert('至少 3 个字符');
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={handleChange}
      disabled={value.length > 100}
    />
  );
}
```

**非受控组件 (Uncontrolled Component)：**

表单数据由 DOM 自身管理，通过 ref 获取值。

```jsx
function UncontrolledForm() {
  const inputRef = useRef(null);

  const handleSubmit = () => {
    console.log('输入值:', inputRef.current.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" defaultValue="" ref={inputRef} />
      <button type="submit">提交</button>
    </form>
  );
}
```

**对比表格：**

| 特性 | 受控组件 | 非受控组件 |
|------|----------|------------|
| 数据来源 | React state | DOM |
| 实时更新 | ✅ 支持 | ❌ 不支持 |
| 表单验证 | ✅ 实时验证 | ❌ 提交时验证 |
| 条件禁用 | ✅ 支持 | ❌ 困难 |
| 代码量 | 较多 | 较少 |
| 性能 | 每次输入都渲染 | 性能更好 |
| 文件输入 | ❌ 不支持 | ✅ 必须 |

**使用场景：**

- **受控组件**：需要实时验证、条件禁用、强制输入格式、多字段联动
- **非受控组件**：简单表单、文件输入、与非 React 代码集成

**知识点：** `受控组件` `非受控组件` `表单处理` `ref`

:::

---

### Q14: React Portal 是什么？有什么使用场景？（弹窗/抽屉/Tooltip）

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Portal 基础：**

`createPortal` 允许将子组件渲染到父组件 DOM 层次结构之外的 DOM 节点中。

```jsx
import { createPortal } from 'react-dom';

function Modal({ children, onClose }) {
  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body // 渲染到 body，而不是组件内部
  );
}
```

**为什么需要 Portal？**

解决以下问题：
- **z-index 被覆盖**：父元素 z-index 低，Portal 渲染到 body 不受影响
- **overflow: hidden**：父元素裁剪子元素，Portal 绕过限制
- **position: relative**：父元素定位干扰，Portal 绝对定位不受影响

**常见使用场景：**

```jsx
// 1. Modal/Dialog
function Dialog({ open, onClose, children }) {
  if (!open) return null;
  return createPortal(
    <div className="dialog-overlay">
      <div className="dialog">{children}</div>
    </div>,
    document.body
  );
}

// 2. Tooltip（避免被父元素 overflow 裁剪）
function Tooltip({ target, content }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return createPortal(
    <div style={{ position: 'fixed', ...pos }}>{content}</div>,
    document.body
  );
}

// 3. 全局通知/Toast
function Toast({ message }) {
  return createPortal(
    <div className="toast">{message}</div>,
    document.getElementById('toast-container')
  );
}
```

**Portal 的重要特性 — 事件冒泡：**

Portal 虽然 DOM 挂载在 body 下，但 React 事件冒泡遵循虚拟 DOM 树，不遵循真实 DOM 树。

```jsx
function App() {
  const handleClick = () => console.log('App clicked');
  
  return (
    <div onClick={handleClick}>
      <Modal>尽管 Modal 在 DOM 上不在 div 内，事件冒泡仍然遵循 React 组件树</Modal>
    </div>
  );
}
```

**知识点：** `Portal` `createPortal` `Modal` `z-index` `事件冒泡`

:::

---

### Q15: React 中的 SyntheticEvent 和原生事件有什么区别？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**SyntheticEvent（合成事件）：**

React 对原生浏览器事件的跨浏览器包装，提供一致的事件接口。

**核心区别：**

| 特性 | SyntheticEvent | 原生 Event |
|------|---------------|-----------|
| 跨浏览器兼容 | ✅ React 统一处理 | ❌ 各浏览器差异大 |
| 事件委托 | ✅ 委托到 root | 每个元素独立绑定 |
| 事件池化 | React 16 有，17+ 移除 | 无 |
| 属性访问 | 统一 API | 浏览器差异 |

**事件委托机制：**

```jsx
// React 17+：事件委托到 root 容器
// React 16：事件委托到 document

function App() {
  const handleClick = (e) => {
    // e 是 SyntheticEvent
    console.log(e.target);      // 触发事件的元素
    console.log(e.nativeEvent); // 原生事件对象
  };
  
  return <button onClick={handleClick}>点击</button>;
}
```

**事件池化（React 16 及之前）：**

```jsx
// React 16：事件对象会被回收
function Component() {
  const handleClick = (e) => {
    e.persist(); // 保留事件对象
    setTimeout(() => {
      console.log(e.target.value); // ✅
    }, 1000);
  };
}

// React 17+：事件池化已移除，可直接使用 e
```

**React 事件 vs 原生事件混合：**

```jsx
useEffect(() => {
  const handleNativeClick = (e) => {
    console.log('原生事件');
  };
  document.addEventListener('click', handleNativeClick);
  return () => document.removeEventListener('click', handleNativeClick);
}, []);

// e.stopPropagation() 只能阻止 React 事件冒泡，不能阻止原生事件
```

**知识点：** `SyntheticEvent` `事件委托` `事件池` `原生事件` `React 17+`

:::

---

## 总结

| 知识点 | 难度 | 重要度 |
|--------|------|--------|
| JSX 原理 | ⭐ | 🔥🔥🔥 |
| 虚拟 DOM | 🔥 | 🔥🔥🔥 |
| 函数/类组件 | ⭐ | 🔥🔥 |
| Props/State | ⭐ | 🔥🔥🔥 |
| 条件/列表渲染 | ⭐ | 🔥🔥 |
| 受控/非受控 | 🔥 | 🔥🔥 |
| key 作用 | 💀 | 🔥🔥🔥 |
| Ref 系列 | 🔥 | 🔥🔥 |
| 元素 vs 组件 | 🔥 | 🔥🔥 |
| 严格模式 | ⭐ | 🔥 |
| Portal | 🔥 | 🔥🔥 |
| SyntheticEvent | 🔥 | 🔥🔥 |

**面试建议：**

- React 基础是面试的必考内容
- 重点掌握 JSX 转换、虚拟 DOM、key 的作用
- 能够手写简单的组件转换示例
- 理解受控组件与非受控组件的适用场景
- 了解 Portal 的使用场景和 SyntheticEvent 的特性

---