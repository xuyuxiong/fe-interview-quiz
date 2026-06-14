---
title: React 性能优化面试题
description: React 性能优化全方位解析，涵盖 React.memo、useMemo、代码分割、虚拟列表等 8 道经典面试题
---

# React 性能优化面试题

> **📚 共 8 题 · 简单 30% · 中等 50% · 困难 20%**

---

### Q1: React.memo 的正确使用方式是什么？它在什么情况下会失效？

> **⭐ 简单 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React.memo 基础：**

```jsx
// 基础用法
const MyComponent = React.memo(function MyComponent(props) {
  return <div>{props.name}</div>;
});

// 带自定义比较函数
const MyComponent = React.memo(function MyComponent(props) {
  return <div>{props.name}</div>;
}, (prevProps, nextProps) => {
  // 返回 true 表示 props 相等，跳过渲染
  return prevProps.name === nextProps.name;
});
```

**工作原理：**

```jsx
function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('John');

  // count 变化时，由于 React.memo，Child 不会重新渲染
  return (
    <div>
      <span>{count}</span>
      <Child name={name} />
    </div>
  );
}

const Child = React.memo(({ name }) => {
  console.log('Child rendered');
  return <div>{name}</div>;
});
```

**失效场景 1：父组件传递新对象/函数**

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ 每次渲染都创建新对象，memo 失效
  const user = { name: 'John', age: 30 };
  return <Child user={user} />;

  // ❌ 每次渲染都创建新函数，memo 失效
  return <Child onClick={() => console.log('click')} />;
}

// ✅ 正确：使用 useCallback/useMemo
function Parent() {
  const user = useMemo(() => ({ name: 'John', age: 30 }), []);
  const handleClick = useCallback(() => console.log('click'), []);
  return <Child user={user} onClick={handleClick} />;
}
```

**失效场景 2：子组件内部使用无依赖的 useState**

```jsx
const Child = React.memo(({ name }) => {
  // ❌ 虽然外层 memo 了，但子组件内部状态变化会触发重渲染
  const [internal, setInternal] = useState(0);
  
  return (
    <div>
      <span>{name}</span>
      <button onClick={() => setInternal(i => i + 1)}>
        Internal: {internal}
      </button>
    </div>
  );
});
```

**失效场景 3：children 变化**

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // ❌ count 变化时，children 每次都新建，Child 会重渲染
  return (
    <Child>
      <span>{count}</span>
    </Child>
  );
}

const Child = React.memo(({ children }) => {
  console.log('Child rendered');
  return <div>{children}</div>;
});
```

**性能考量：**

```jsx
// ❌ 过度优化：简单组件不需要 memo
const Simple = React.memo(({ text }) => <span>{text}</span>);

// ✅ 合理使用： expensive 组件
const ExpensiveList = React.memo(({ items }) => {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});
```

**知识点：** `React.memo` `性能优化` `浅比较`

:::

---

### Q2: useMemo 和 useCallback 的正确使用场景是什么？常见的误区有哪些？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**useMemo - 缓存计算结果：**

```jsx
// ✅ 使用场景 1：昂贵的计算
function ExpensiveComponent({ items }) {
  const sortedItems = useMemo(() => {
    console.log('Sorting...');
    return items.sort((a, b) => a.value - b.value);
  }, [items]);

  return <div>{sortedItems.length} items</div>;
}

// ✅ 使用场景 2：保持引用稳定
function Parent() {
  const config = useMemo(() => ({
    apiUrl: '/api',
    timeout: 5000,
  }), []);

  return <Child config={config} />;
}

// ❌ 误区：没必要缓存简单计算
const doubled = useMemo(() => count * 2, [count]); // 不需要
```

**useCallback - 缓存函数引用：**

```jsx
// ✅ 使用场景 1：传递给 memo 组件
function Parent() {
  const [count, setCount] = useState(0);

  // 不加 useCallback，Child 每次都会重渲染
  const handleClick = useCallback(() => {
    console.log('clicked', count);
  }, [count]);

  return <Child onClick={handleClick} />;
}

const Child = React.memo(({ onClick }) => {
  console.log('Child rendered');
  return <button onClick={onClick}>Click</button>;
});
```

```jsx
// ✅ 使用场景 2：作为 useEffect/useMemo 依赖
function Component({ userId }) {
  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/users/${userId}`);
    return res.json();
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // ✅ 安全的依赖
}
```

**常见误区：**

**误区 1：过早优化**

```jsx
// ❌ 这些都不需要缓存
const name = useMemo(() => 'John', []);
const handleClick = useCallback(() => {}, []);
const styles = useMemo(() => ({ color: 'red' }), []);
```

**误区 2：依赖缺失**

```jsx
// ❌ 依赖不完整
const result = useMemo(() => {
  return data.filter(x => x > threshold);
}, [data]); // 缺少 threshold

// ✅ 正确
const result = useMemo(() => {
  return data.filter(x => x > threshold);
}, [data, threshold]);
```

**误区 3：useCallback 不配合 React.memo**

```jsx
function Parent() {
  const handleClick = useCallback(() => {}, []);
  // ❌ Child 没有 memo，useCallback 没有意义
  return <Child onClick={handleClick} />;
}
```

**误区 4：在渲染中创建依赖**

```jsx
function Component() {
  const [count, setCount] = useState(0);

  // ❌ 每次渲染 task 都是新引用
  const task = { id: 1, count };
  const handleTask = useCallback(() => {
    console.log(task);
  }, [task]); // ❌ 每次都变化
}
```

**性能对比：**

```jsx
// 测试：10000 次渲染
// 不使用缓存
function WithoutCache() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// 使用缓存
function WithCache() {
  const [count, setCount] = useState(0);
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  return <button onClick={handleClick}>{count}</button>;
}

// 结论：简单场景缓存的收益很小，甚至可能更慢
```

**最佳实践：**

1. 默认不使用，有性能问题时再优化
2. 优先优化渲染逻辑，而非添加缓存
3. 使用 React DevTools Profiler 定位问题
4. 缓存对象/函数给子组件使用时才需要

**知识点：** `useMemo` `useCallback` `性能优化` `常见误区`

:::

---

### Q3: 如何虚拟化长列表？react-window 和 react-virtualized 有什么区别？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**虚拟列表原理：**

只渲染可视区域内的列表项，而不是渲染全部数据。

```
传统列表：10000 项 → 10000 个 DOM 节点
虚拟列表：10000 项 → 可视区域约 20 个 DOM 节点
```

**react-window 基础用法：**

```jsx
import { FixedSizeList as List } from 'react-window';

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style} className="row">
      {items[index].name}
    </div>
  );

  return (
    <List
      height={600}           // 可视区域高度
      itemCount={items.length} // 总条目数
      itemSize={50}          // 每项高度（固定）
      width="100%"
    >
      {Row}
    </List>
  );
}
```

**可变高度列表：**

```jsx
import { VariableSizeList as List } from 'react-window';

function VirtualList({ items }) {
  const [itemSizes, setItemSizes] = useState({});

  const Row = ({ index, style }) => (
    <div
      style={style}
      ref={(el) => {
        if (el && itemSizes[index] === undefined) {
          setItemSizes(prev => ({
            ...prev,
            [index]: el.clientHeight,
          }));
        }
      }}
    >
      {items[index].content}
    </div>
  );

  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={(index) => itemSizes[index] || 100}
      width="100%"
      estimatedItemSize={100}
    >
      {Row}
    </List>
  );
}
```

**网格虚拟化：**

```jsx
import { FixedSizeGrid as Grid } from 'react-window';

function VirtualGrid({ items }) {
  const Cell = ({ columnIndex, rowIndex, style }) => (
    <div style={style} className="cell">
      {items[rowIndex][columnIndex]}
    </div>
  );

  return (
    <Grid
      columnCount={100}
      columnWidth={100}
      height={400}
      rowCount={100}
      rowHeight={50}
      width={600}
    >
      {Cell}
    </Grid>
  );
}
```

**react-window vs react-virtualized：**

| 特性 | react-window | react-virtualized |
|------|--------------|-------------------|
| 包大小 | ~3KB | ~22KB |
| API 设计 | 更简洁 | 较复杂 |
| 功能丰富度 | 基础 | 丰富 |
| 维护状态 | 活跃 | 维护模式 |
| 推荐度 | ✅ 首选 | ⚠️ 仅遗留项目 |

**优化技巧：**

```jsx
// 1. 结合 React.memo
const Row = React.memo(({ index, style, data }) => {
  return (
    <div style={style}>
      {data.items[index].name}
    </div>
  );
});

function VirtualList({ items }) {
  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
      itemData={{ items }} // 通过 data props 传递
    >
      {Row}
    </List>
  );
}

// 2. 自定义滚动条
import { List, FixedSizeList } from 'react-window';
import { Scrollbars } from 'react-custom-scrollbars';

function VirtualListWithCustomScrollbar({ items }) {
  const ref = useRef();

  return (
    <>
      <FixedSizeList
        ref={ref}
        height={600}
        itemCount={items.length}
        itemSize={50}
        width="100%"
        outerElementType={Scrollbars}
      >
        {Row}
      </FixedSizeList>
    </>
  );
}

// 3. 无限加载（结合 react-window-infinite-loader）
import InfiniteLoader from 'react-window-infinite-loader';

function InfiniteVirtualList({ items, loadMore }) {
  const isItemLoaded = (index) => !!items[index];

  return (
    <InfiniteLoader
      isItemLoaded={isItemLoaded}
      itemCount={items.length}
      loadMoreItems={loadMore}
    >
      {({ onItemsRendered, ref }) => (
        <List
          onItemsRendered={onItemsRendered}
          ref={ref}
          height={600}
          itemCount={items.length}
          itemSize={50}
          width="100%"
        >
          {Row}
        </List>
      )}
    </InfiniteLoader>
  );
}
```

**知识点：** `虚拟列表` `react-window` `长列表优化`

:::

---

### Q4: 如何实现代码分割？lazy 和 Suspense 的使用方式是什么？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React.lazy 基础：**

```jsx
// 基础用法
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HomePage />
    </Suspense>
  );
}
```

**路由代码分割：**

```jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

**嵌套 Suspense：**

```jsx
function Dashboard() {
  const ChartWidget = lazy(() => import('./widgets/Chart'));
  const TableWidget = lazy(() => import('./widgets/Table'));

  return (
    <div>
      <Suspense fallback={<ChartSkeleton />}>
        <ChartWidget />
      </Suspense>
      <Suspense fallback={<TableSkeleton />}>
        <TableWidget />
      </Suspense>
    </div>
  );
}
```

**错误处理：**

```jsx
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <ErrorFallback />;
  }

  return (
    <ErrorBoundaryInternal onError={() => setHasError(true)}>
      {children}
    </ErrorBoundaryInternal>
  );
}

// 或者使用 react-error-boundary 库
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<Loading />}>
        <LazyComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

**预加载策略：**

```jsx
// 1. 鼠标悬停时预加载
function Navigation() {
  const handleMouseEnter = (componentLoader) => {
    componentLoader.preload();
  };

  return (
    <nav>
      <a
        href="/about"
        onMouseEnter={() => AboutPage.preload()}
      >
        About
      </a>
    </nav>
  );
}

// 2. 空闲时预加载
function preloadOnIdle(loader) {
  requestIdleCallback(() => {
    loader.preload();
  });
}

// 3. 连接质量好时预加载
function preloadOnGoodConnection(loader) {
  if (navigator.connection.effectiveType !== 'slow-2g') {
    loader.preload();
  }
}
```

**最佳实践：**

```jsx
// ✅ 好的分割点
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));

// ❌ 过度分割（太小的组件不要分割）
const Button = lazy(() => import('./components/Button'));

// ✅ 结合 debounce 防止快速切换
function useDebouncePreload(loader, delay = 100) {
  const timeoutRef = useRef();

  return {
    preload: () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        loader.preload();
      }, delay);
    },
  };
}
```

**Webpack 配置优化：**

```js
// webpack.config.js
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

**知识点：** `代码分割` `lazy` `Suspense` `预加载`

:::

---

### Q5: 什么是并发模式？useTransition 和 useDeferredValue 的区别和使用场景是什么？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**并发模式（Concurrent Mode）：**

React 18 引入的并发特性，允许 React 中断渲染任务，优先处理高优先级任务。

**useTransition - 标记非紧急更新：**

```jsx
import { useState, useTransition } from 'react';

function TabContainer() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState('home');

  const handleTabChange = (newTab) => {
    // ✅ 标记为非紧急更新
    startTransition(() => {
      setTab(newTab);
    });
  };

  return (
    <div>
      <nav>
        <button
          onClick={() => handleTabChange('home')}
          className={tab === 'home' ? 'active' : ''}
        >
          Home
        </button>
        <button
          onClick={() => handleTabChange('about')}
          className={tab === 'about' ? 'active' : ''}
        >
          About
        </button>
      </nav>

      {isPending && <Spinner />}

      <main>
        {tab === 'home' && <HomeTab />}
        {tab === 'about' && <AboutTab />}
      </main>
    </div>
  );
}
```

**useDeferredValue - 延迟值更新：**

```jsx
import { useState, useDeferredValue } from 'react';

function SearchResults({ query }) {
  const [inputValue, setInputValue] = useState('');
  
  // deferredValue 会在输入后延迟更新
  const deferredValue = useDeferredValue(inputValue);

  const filteredResults = filterResults(deferredValue);

  return (
    <div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Search..."
      />
      <Results items={filteredResults} />
    </div>
  );
}
```

**对比：**

| 特性 | useTransition | useDeferredValue |
|------|---------------|------------------|
| 用途 | 标记状态更新为非紧急 | 获取延迟后的值 |
| 返回值 | [isPending, startTransition] | deferredValue |
| 使用场景 | Tab 切换、路由切换 | 输入过滤、搜索 |

**实际场景对比：**

**场景 1：输入过滤（useDeferredValue）**

```jsx
function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  // 立即更新输入框
  // 延迟更新搜索结果
  const results = useMemo(
    () => expensiveSearch(deferredQuery),
    [deferredQuery]
  );

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <SearchResults results={results} />
    </div>
  );
}
```

**场景 2：Tab 切换（useTransition）**

```jsx
function Dashboard() {
  const [tab, setTab] = useState('overview');
  const [isPending, startTransition] = useTransition();

  const selectTab = (newTab) => {
    startTransition(() => {
      setTab(newTab);
    });
  };

  return (
    <div>
      <TabNav selected={tab} onSelect={selectTab} />
      {isPending && <Spinner />}
      <TabContent tab={tab} />
    </div>
  );
}
```

**组合使用：**

```jsx
function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('all');
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const handleTabChange = (newTab) => {
    startTransition(() => setTab(newTab));
  };

  const results = useMemo(
    () => search(deferredQuery, tab),
    [deferredQuery, tab]
  );

  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <Tabs selected={tab} onSelect={handleTabChange} />
      <Results data={results} />
    </div>
  );
}
```

**性能提示：**

```jsx
// 使用条件检查避免不必要的计算
const deferredValue = useDeferredValue(value, {
  timeoutMs: 300, // 超过 300ms 强制更新
});

// 配合 React.memo 优化
const Results = React.memo(({ items }) => {
  return items.map(item => <ResultItem key={item.id} item={item} />);
});
```

**知识点：** `并发模式` `useTransition` `useDeferredValue`

:::

---

### Q6: 如何使用 React Profiler 进行性能分析？有哪些关键指标？

> **⭐ 简单 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React DevTools Profiler：**

1. 安装 React DevTools 浏览器扩展
2. 打开 Profiler 标签
3. 点击录制按钮，执行操作
4. 停止录制，分析结果

**关键指标解释：**

| 指标 | 含义 | 优化方向 |
|------|------|----------|
| Render time | 组件渲染耗时 | 减少渲染次数 |
| Commit time | 提交到 DOM 的时间 | 减少 DOM 操作 |
| Self time | 组件自身耗时（不含子组件） | 优化组件逻辑 |
| Total time | 总耗时（含子组件） | 整体优化 |

**分析步骤：**

```jsx
// 1. 使用 Profiler 组件包裹
import { Profiler } from 'react';

function onRenderCallback(
  id, // Profiler 的 id
  phase, // "mount" 或 "update"
  actualDuration, // 本次渲染的实际耗时
  baseDuration, // 无优化的预估耗时
  startTime, // React 开始渲染的时间
  commitTime // React 提交的时间
) {
  console.log(`${id} 渲染耗时：${actualDuration}ms`);
}

function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Dashboard />
    </Profiler>
  );
}
```

**常见问题诊断：**

**问题 1：组件频繁重渲染**

```
[症状]
- Self time 很低但 Total time 很高
- 子组件渲染次数多

[解决]
- React.memo 包裹子组件
- useCallback/useMemo 缓存 props
```

**问题 2：DOM 操作耗时**

```
[症状]
- Commit time 占比较高

[解决]
- 减少不必要的 DOM 节点
- 虚拟化长列表
- CSS 动画替代 JS 动画
```

**问题 3：大列表渲染**

```
[症状]
- 单个组件 render 时间超过 16ms

[解决]
- react-window 虚拟列表
- 分页加载
- 窗口化渲染
```

**性能基准：**

```
- 60fps = 每帧 16.67ms
- 理想渲染：< 8ms（留给用户交互）
- 可接受：8-16ms
- 需要优化：> 16ms
```

**知识点：** `Profiler` `性能分析` `关键指标`

:::

---

### Q7: 图片懒加载和预加载的实现方式有哪些？如何平衡性能和用户体验？

> **⭐ 简单 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**图片懒加载（Lazy Loading）：**

```jsx
// 方式 1：原生 loading="lazy"
function Image({ src, alt }) {
  return <img src={src} alt={alt} loading="lazy" />;
}

// 方式 2：Intersection Observer
function LazyImage({ src, alt, placeholder }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' } // 提前 50px 开始加载
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={ref}
      src={isInView ? src : placeholder}
      alt={alt}
      loading={isInView ? 'eager' : 'lazy'}
    />
  );
}

// 方式 3：第三方库 react-lazyload
import LazyLoad from 'react-lazyload';

function Gallery({ images }) {
  return (
    <div>
      {images.map(img => (
        <LazyLoad height={200} offset={100}>
          <img src={img.src} alt={img.alt} />
        </LazyLoad>
      ))}
    </div>
  );
}
```

**预加载（Preloading）：**

```jsx
// 方式 1：<link rel="preload">
// 在 HTML head 中添加
// <link rel="preload" href="/hero.jpg" as="image" />

// 方式 2：动态创建
function useImagePreload(sources) {
  useEffect(() => {
    sources.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, [sources]);
}

// 方式 3：使用 Priority Hints
function Component() {
  return (
    <img
      src="/hero.jpg"
      fetchpriority="high" // Chrome 99+
      alt="Hero"
    />
  );
}
```

**渐进式加载：**

```jsx
function ProgressiveImage({ src, placeholder }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="image-container">
      <img
        src={placeholder} // 低质量占位图
        className={loaded ? 'loaded' : ''}
        alt=""
      />
      <img
        src={src}
        onLoad={() => setLoaded(true)}
        className="progressive"
        alt="Main"
      />
    </div>
  );
}
```

**性能与体验平衡：**

| 策略 | 性能影响 | 用户体验 | 适用场景 |
|------|----------|----------|----------|
| 懒加载 | ✅ 减少初始加载 | ⚠️ 滚动时有延迟 | 长列表、图片墙 |
| 预加载 | ⚠️ 增加初始加载 | ✅ 无感知加载 | 首屏关键资源 |
| 渐进式 | ⚠️ 增加请求数 | ✅ 平滑过渡 | 大图展示 |

**最佳实践：**

```jsx
// 1. 关键路径图片预加载
<link rel="preload" as="image" href="/hero.jpg" />

// 2. 非关键图片懒加载
<img loading="lazy" src="/content.jpg" />

// 3. 使用 srcset 响应式图片
<img
  srcSet="
    /small.jpg 320w,
    /medium.jpg 768w,
    /large.jpg 1200w
  "
  sizes="(max-width: 320px) 320px, (max-width: 768px) 768px, 1200px"
  src="/large.jpg"
  alt="Responsive"
/>

// 4. 现代图片格式
<picture>
  <source srcSet="/image.webp" type="image/webp" />
  <source srcSet="/image.jpg" type="image/jpeg" />
  <img src="/image.jpg" alt="Fallback" />
</picture>
```

**知识点：** `图片懒加载` `预加载` `性能优化`

:::

---

### Q8: 什么是错误边界（ErrorBoundary）？如何实现和使用它？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**错误边界基础：**

错误边界是 React 组件，用于捕获子组件树中的 JavaScript 错误。

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
    // 可以上报到错误监控服务
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// 使用
function App() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Dashboard />
    </ErrorBoundary>
  );
}
```

**使用第三方库：**

```jsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {/* 重置状态 */}}
    >
      <Profile />
    </ErrorBoundary>
  );
}
```

**函数组件中的错误处理：**

```jsx
// 函数组件内部错误无法捕获，需要转换为错误边界
function Profile() {
  const [count, setCount] = useState(0);

  if (count > 5) {
    throw new Error('Count too high!'); // ❌ 这会导致应用崩溃
  }

  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}

// ✅ 正确：用错误边界包裹
<ErrorBoundary fallback={<ErrorFallback />}>
  <Profile />
</ErrorBoundary>
```

**异步错误处理：**

```jsx
// useEffect 中的错误不会被错误边界捕获
function Component() {
  useEffect(async () => {
    const data = await fetchData(); // ❌ 错误会逃逸
  }, []);
}

// ✅ 正确：手动 try-catch
function Component() {
  useEffect(() => {
    const handleError = async () => {
      try {
        await fetchData();
      } catch (error) {
        setError(error);
      }
    };
    handleError();
  }, []);
}
```

**逐级降级策略：**

```jsx
function App() {
  return (
    <Layout>
      <ErrorBoundary fallback={<NavFallback />}>
        <Navigation />
      </ErrorBoundary>

      <ErrorBoundary fallback={<ContentFallback />}>
        <MainContent />
      </ErrorBoundary>

      <ErrorBoundary fallback={<SidebarFallback />}>
        <Sidebar />
      </ErrorBoundary>

      <ErrorBoundary fallback={<FooterFallback />}>
        <Footer />
      </ErrorBoundary>
    </Layout>
  );
}
```

**知识点：** `ErrorBoundary` `错误处理` `降级策略`

:::

---

## 总结

| 优化技术 | 适用场景 | 优先级 |
|----------|----------|--------|
| React.memo | 纯展示组件 | ⭐⭐⭐ |
| useMemo/useCallback | 传给 memo 组件 | ⭐⭐⭐ |
| 虚拟列表 | 长列表渲染 | ⭐⭐⭐ |
| 代码分割 | 大型应用 | ⭐⭐⭐ |
| useTransition | 非紧急更新 | ⭐⭐ |
| 图片懒加载 | 图片密集型页面 | ⭐⭐⭐ |
| 错误边界 | 所有生产应用 | ⭐⭐⭐ |

**面试建议：**

- 理解每种优化技术的原理和权衡
- 能根据实际场景选择合适的优化方案
- 了解 React 18 的并发特性
- 掌握 Profiler 的使用方法

---
### Q9: React Profiler 如何使用？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React Profiler** 是 React DevTools 中的性能分析工具，用于测量渲染时间和找出性能瓶颈。

**使用方法：**

1. **打开 Profiler** - React DevTools → Profiler 标签
2. **点击开始** - 开始录制
3. **与应用交互** - 执行需要分析的操作
4. **停止录制** - 查看火焰图

**火焰图解读：**

```
┌──────────────────────────────────────┐
│ App (50ms)                           │
│ ┌─────────────────┐ ┌──────────────┐ │
│ │ Header (10ms)   │ │ Main (35ms)  │ │
│ │                 │ │ ┌──────────┐ │ │
│ │                 │ │ │ List(25) │ │ │
│ │                 │ │ │ ┌──────┐ │ │ │
│ │                 │ │ │ │Item(5)│ │ │ │
│ │                 │ │ │ └──────┘ │ │ │
│ │                 │ │ └──────────┘ │ │
│ │                 │ └──────────────┘ │
│ └─────────────────┘ └──────────────┘ └─
```

**关键指标：**
- **Render 时间** - 组件渲染耗时
- **自时间** - 组件自身渲染（不含子组件）
- **总时间** - 包含子组件

**通过代码收集 Profiler 数据：**
```jsx
function onRenderCallback(
  id, phase, actualDuration, baseDuration, startTime, commitTime
) {
  console.log(`${id} 渲染耗时：${actualDuration}ms`)
  // actualDuration: 本次渲染实际耗时
  // baseDuration: 记忆化子树的预计耗时
  // 可用于性能监控上报
}

<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>
```

**优化建议：**
1. 找出耗时最长的组件
2. 检查是否有不必要的重渲染
3. 使用 React.memo 优化
4. 拆分大组件

**知识点：** `Profiler` `性能分析` `火焰图` `DevTools`

:::

### Q10: memo、useMemo、useCallback 何时使用？过度使用的危害？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**三者的用途：**

| API | 用途 | 返回 |
|-----|------|------|
| React.memo | 组件级记忆化 | 记忆化的组件 |
| useMemo | 记忆化计算结果 | 记忆化的值 |
| useCallback | 记忆化函数 | 记忆化的回调 |

**使用场景：**

**1. React.memo - 纯展示组件**
```jsx
const UserItem = React.memo(({ user, onSelect }) => {
  console.log('UserItem render')
  return <li onClick={() => onSelect(user)}>{user.name}</li>
})

// 父组件重渲染但 user 不变时，跳过渲染
```

**2. useMemo - 昂贵计算**
```jsx
const filtered = useMemo(() => {
  return items.filter(item => item.price > 100).map(i => i.name)
}, [items])  // 仅 items 变化时重新计算
```

**3. useCallback - 稳定回调引用**
```jsx
const handleClick = useCallback(() => {
  console.log('clicked')
}, [])  // 函数引用不变

return <Button onClick={handleClick} />
// Button 用 memo 包裹时，handleClick 不变可避免重渲染
```

**过度使用的危害：**

1. **记忆化本身有成本**
```jsx
// ❌ 过度使用
const value = useMemo(() => a + b, [a, b])  // 比直接计算更慢
const func = useCallback(() => {}, [])  // 空依赖也有成本
```

2. **依赖数组错误导致 stale closure**
```jsx
// ❌ 遗漏依赖
const callback = useCallback(() => {
  console.log(count)  // 永远是初始值
}, [])

// ✅ 正确
const callback = useCallback(() => {
  console.log(count)
}, [count])
```

3. **对象/数组作为依赖**
```jsx
// ❌ 每次都是新引用
const config = { timeout: 5000 }
const data = useMemo(() => fetchData(config), [config])  // 每次都重新计算

// ✅ 正确
const config = useMemo(() => ({ timeout: 5000 }), [])
```

**何时使用：**
```jsx
// ✅ 值得记忆化的场景
<List items={expensiveComputation(data)} />
<Component onClick={handleClick} />

// ❌ 不值得
<Component value={a + b} />  // 简单计算
<Component onClick={() => {}} />  // 空函数
```

**最佳实践：**
1. 先用 Profiler 找出瓶颈
2. 只优化真正耗时的部分
3. 避免过早优化
4. 优先保证代码可读性

**知识点：** `React.memo` `useMemo` `useCallback` `性能优化` `依赖数组`

:::

### Q11: React 18 自动批处理对性能的影响？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**自动批处理（Automatic Batching）** 是 React 18 的核心性能优化，将多次状态更新合并为一次重渲染。

**React 17 及之前：**
```jsx
// ❌ 每次 setState 都触发重渲染
function handleClick() {
  setCount(c => c + 1)      // 渲染 1
  setFlag(f => !f)          // 渲染 2
  setData(newData)          // 渲染 3
}
```

**React 18 自动批处理：**
```jsx
// ✅ 三次更新合并为一次渲染
function handleClick() {
  setCount(c => c + 1)
  setFlag(f => !f)
  setData(newData)
  // 只渲染一次！
}
```

**批处理范围扩展：**

| 场景 | React 17 | React 18 |
|------|---------|---------|
| 事件处理器 | ✅ 批处理 | ✅ 批处理 |
| setTimeout | ❌ 不批处理 | ✅ 批处理 |
| Promise | ❌ 不批处理 | ✅ 批处理 |
| setInterval | ❌ 不批处理 | ✅ 批处理 |
| 原生事件 | ❌ 不批处理 | ✅ 批处理 |

**示例：**
```jsx
// React 18 中，以下情况都会批处理
setTimeout(() => {
  setCount(1)
  setFlag(true)  // 一次渲染
}, 1000)

fetch('/api').then(() => {
  setCount(1)
  setData([])  // 一次渲染
})
```

**退出批处理：**
```jsx
// 需要立即获取最新 DOM 状态
import { flushSync } from 'react-dom'

function handleClick() {
  flushSync(() => {
    setCount(1)  // 立即渲染
  })
  // DOM 已更新
  flushSync(() => {
    setFlag(true)  // 再次渲染
  })
}
```

**性能提升：**
- 减少渲染次数
- 降低 CPU 使用
- 提升响应速度
- 对大型列表特别有效

**知识点：** `React 18` `自动批处理` `flushSync` `性能优化`

:::

### Q12: 虚拟列表在 React 中的实现？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**虚拟列表（Virtual List）** 只渲染可视区域内的元素，大幅提升长列表性能。

**核心原理：**
1. 计算容器可视区域
2. 只渲染可见项 + 缓冲区
3. 用 padding/transform 模拟总高度
4. 滚动时动态更新渲染项

**使用 react-window：**
```jsx
import { FixedSizeList } from 'react-window'

function Row({ index, style }) {
  return <div style={style}>Item {index}</div>
}

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={400}           // 容器高度
      width={300}            // 容器宽度
      itemCount={items.length}
      itemSize={50}          // 每项高度
      overscanCount={5}      // 缓冲区数量
    >
      {({ index, style }) => (
        <div style={style}>
          {items[index]}
        </div>
      )}
    </FixedSizeList>
  )
}
```

**动态高度列表：**
```jsx
import { VariableSizeList } from 'react-window'

function VariableList({ items }) {
  const listRef = useRef()
  
  // 估计每项高度
  const getItemSize = (index) => {
    return items[index].long ? 100 : 50
  }
  
  return (
    <VariableSizeList
      ref={listRef}
      height={400}
      itemCount={items.length}
      itemSize={getItemSize}
    >
      {({ index, style }) => (
        <div style={style}>{items[index].content}</div>
      )}
    </VariableSizeList>
  )
}
```

**手动实现简化版：**
```jsx
function VirtualList({ items, itemHeight, containerHeight }) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(startIndex + visibleCount, items.length)
  
  const visibleItems = items.slice(startIndex, endIndex)
  const offsetY = startIndex * itemHeight
  
  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ 
          position: 'absolute',
          top: offsetY,
          left: 0,
          right: 0
        }}>
          {visibleItems.map((item, i) => (
            <div key={startIndex + i} style={{ height: itemHeight }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**优化技巧：**
1. **overscanCount** - 预渲染缓冲区减少白屏
2. **itemKey** - 稳定 key 避免重渲染
3. **onItemsRendered** - 懒加载触发
4. **React.memo** - 记忆化列表项组件

**对比原生列表：**

| 项目数量 | 原生渲染 | 虚拟列表 |
|---------|---------|---------|
| 100 | 20ms | 5ms |
| 1000 | 200ms | 8ms |
| 10000 | 2000ms（卡死）| 10ms |

**常用库：**
- react-window - 轻量，Robin Rico 维护
- react-virtualized - 功能多，较复杂
- react-virtuoso - 自动高度，动态项

**知识点：** `虚拟列表` `react-window` `性能优化` `长列表` `可视区域`

:::
