---
title: 长列表优化面试题
description: 覆盖虚拟滚动/懒加载/虚拟列表锚定/瀑布流/大数据表格等 8 道题
---

# 长列表优化面试题

### Q1: 虚拟滚动原理（固定高度）

> **🔥 中等 · 虚拟滚动**

请解释虚拟滚动的原理并实现固定高度的虚拟列表。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**虚拟滚动原理：**
只渲染视口内的元素，大幅减少 DOM 节点数量。

**核心思路：**
1. 计算视口内应该显示的起始/结束索引
2. 使用 padding 撑开滚动区域
3. 只渲染可见元素

```jsx
// 固定高度虚拟列表
function VirtualList({ items, itemHeight, containerHeight }) {
  const containerRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  
  // 总高度
  const totalHeight = items.length * itemHeight
  // 可见数量
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 1
  // 起始索引
  const startIndex = Math.floor(scrollTop / itemHeight)
  // 结束索引
  const endIndex = Math.min(startIndex + visibleCount, items.length)
  
  // 可见元素
  const visibleItems = items.slice(startIndex, endIndex)
  
  // 偏移量
  const offsetY = startIndex * itemHeight
  
  // 滚动处理
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop)
  }
  
  return (
    <div 
      ref={containerRef}
      className="virtual-list"
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      {/* 垫高区域 */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* 可见 items */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            transform: `translateY(${offsetY}px)`
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={item.id}
              style={{ height: itemHeight }}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// 使用
<VirtualList 
  items={data} 
  itemHeight={50} 
  containerHeight={600} 
/>
```

**知识点：** `虚拟滚动` `固定高度` `视口计算`

:::

### Q2: IntersectionObserver 懒加载

> **⭐ 简单 · 懒加载**

请使用 IntersectionObserver 实现懒加载。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

### 基础懒加载
```jsx
function LazyList({ items }) {
  const containerRef = useRef(null)
  const observerRef = useRef(null)
  
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target
            if (img.dataset.src) {
              img.src = img.dataset.src
              img.removeAttribute('data-src')
              observerRef.current.unobserve(img)
            }
          }
        })
      },
      { rootMargin: '100px 0px' }
    )
    
    const images = containerRef.current.querySelectorAll('img[data-src]')
    images.forEach(img => observerRef.current.observe(img))
    
    return () => observerRef.current.disconnect()
  }, [])
  
  return (
    <div ref={containerRef}>
      {items.map(item => (
        <div key={item.id}>
          <img data-src={item.src} alt={item.alt} />
          <p>{item.name}</p>
        </div>
      ))}
    </div>
  )
}
```

### 无限滚动加载
```jsx
function InfiniteScroll({ onLoadMore, hasMore, loading }) {
  const observerRef = useRef()
  const loadMoreRef = useRef()
  
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !loading) {
          onLoadMore()
        }
      },
      { rootMargin: '200px' }
    )
    
    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }
    
    return () => observerRef.current.disconnect()
  }, [hasMore, loading, onLoadMore])
  
  return (
    <div ref={loadMoreRef}>
      {loading ? '加载中...' : hasMore ? '' : '没有更多了'}
    </div>
  )
}

// 使用
function ProductList() {
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  
  const loadMore = async () => {
    const newProducts = await fetchProducts(page)
    setProducts([...products, ...newProducts])
    setHasMore(newProducts.length === 10)
    setPage(page + 1)
  }
  
  return (
    <div>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
      <InfiniteScroll 
        onLoadMore={loadMore} 
        hasMore={hasMore}
        loading={false}
      />
    </div>
  )
}
```

**知识点：** `IntersectionObserver` `懒加载` `无限滚动`

:::

### Q3: react-window/virtualized 对比

> **🔥 中等 · 滚动库**

请对比 react-window 和 react-virtualized。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**react-virtualized（老牌）：**
- 首次发布于 2016 年
- API 较重
- 功能全面
- 包大小较大（~84kb）

**react-window（现代）：**
- 首次发布于 2018 年
- 由同一作者开发
- API 更简洁
- 包大小更小（~15kb）
- Tree-shakable

**代码对比：**

```jsx
// react-virtualized
import { List } from 'react-virtualized'

function VirtualizedList({ items }) {
  return (
    <List
      width={800}
      height={600}
      rowCount={items.length}
      rowHeight={50}
      rowRenderer={({ index, key, style }) => (
        <div key={key} style={style}>
          {items[index].name}
        </div>
      )}
    />
  )
}

// react-window
import { FixedSizeList } from 'react-window'

function WindowList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={50}
      width={800}
    >
      {({ index, style }) => (
        <div style={style}>
          {items[index].name}
        </div>
      )}
    </FixedSizeList>
  )
}

// react-window 动态高度
import { VariableSizeList } from 'react-window'

function DynamicList({ items }) {
  const rowHeights = useRef(items.map(() => 50))
  
  return (
    <VariableSizeList
      height={600}
      itemCount={items.length}
      itemSize={(index) => rowHeights.current[index]}
      width={800}
    >
      {({ index, style }) => (
        <div style={style}>
          {items[index].name}
        </div>
      )}
    </VariableSizeList>
  )
}
```

**AutoSizer 响应式：**
```jsx
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

function ResponsiveList({ items }) {
  return (
    <div style={{ height: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <FixedSizeList
            height={height}
            width={width}
            itemCount={items.length}
            itemSize={50}
          >
            {({ index, style }) => (
              <div style={style}>{items[index].name}</div>
            )}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  )
}
```

**选型建议：**
- 新项目：react-window
- 需要 Grid：react-window
- 需要复杂布局：react-virtualized
- 已有项目：保持原有

**知识点：** `react-window` `react-virtualized` `库对比`

:::

### Q4: 虚拟列表锚定与滚动恢复

> **💀 困难 · 滚动定位**

请实现虚拟列表的锚定定位和滚动位置恢复。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```jsx
// 带锚定的虚拟列表
function AnchoredVirtualList({ items, anchorId }) {
  const listRef = useRef(null)
  const [scrollTop, setScrollTop] = useState(0)
  const itemHeight = 50
  
  useEffect(() => {
    if (anchorId) {
      // 找到锚定项的索引
      const anchorIndex = items.findIndex(item => item.id === anchorId)
      if (anchorIndex !== -1) {
        const scrollPosition = anchorIndex * itemHeight
        listRef.current.scrollTo(scrollPosition)
      }
    }
  }, [anchorId, items])
  
  // 滚动位置持久化
  useEffect(() => {
    const saved = localStorage.getItem('listScroll')
    if (saved) {
      listRef.current.scrollTo(parseInt(saved))
    }
  }, [])
  
  const handleScroll = (e) => {
    const position = e.target.scrollTop
    localStorage.setItem('listScroll', position)
    setScrollTop(position)
  }
  
  return (
    <FixedSizeList
      ref={listRef}
      height={600}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
      onScroll={handleScroll}
    >
      {({ index, style }) => (
        <div style={style} data-id={items[index].id}>
          {items[index].name}
        </div>
      )}
    </FixedSizeList>
  )
}

// 聊天列表（滚动到底部 + 保持位置）
function ChatList({ messages, newMessageId }) {
  const listRef = useRef(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const prevLength = useRef(messages.length)
  
  // 新消息到达时
  useEffect(() => {
    if (messages.length > prevLength.current) {
      if (autoScroll) {
        listRef.current.scrollToItem(messages.length - 1)
      }
    }
    prevLength.current = messages.length
  }, [messages])
  
  // 用户滚动时禁止自动滚动
  const handleScroll = ({ scrollUpdateWasRequested }) => {
    setAutoScroll(scrollUpdateWasRequested)
  }
  
  // 跳转到特定消息
  const scrollToMessage = (messageId) => {
    const index = messages.findIndex(m => m.id === messageId)
    if (index !== -1) {
      listRef.current.scrollToItem(index, 'center')
    }
  }
  
  return (
    <FixedSizeList
      ref={listRef}
      height={500}
      itemCount={messages.length}
      itemSize={60}
      onScroll={handleScroll}
    >
      {({ index, style }) => (
        <Message 
          key={messages[index].id} 
          style={style}
          message={messages[index]}
        />
      )}
    </FixedSizeList>
  )
}

// 带预估高度的动态列表
function EstimatedVirtualList({ items }) {
  const initialItemSize = 100
  
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={initialItemSize}
      estimatedItemSize={initialItemSize}
    >
      {({ index, style }) => (
        <div style={style}>{items[index].content}</div>
      )}
    </FixedSizeList>
  )
}
```

**知识点：** `滚动定位` `位置持久化` `自动滚动` `锚定`

:::

### Q5: 无限滚动 vs 分页 vs 虚拟滚动

> **⭐ 简单 · 方案对比**

请对比无限滚动、分页和虚拟滚动三种方案。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**三种方案对比：**

| 特性 | 无限滚动 | 分页 | 虚拟滚动 |
|------|---------|------|---------|
| 内存占用 | 高（持续增长） | 低（当前页） | 低（可见项） |
| 首屏性能 | 好 | 好 | 好 |
| 滚动体验 | 流畅 | 需要点击 | 流畅 |
| 可访问性 | 差 | 好 | 中等 |
| 适用场景 | 社交 Feed | 列表/搜索 | 超长列表 |

### 实现对比

**无限滚动：**
```jsx
function InfiniteScrollList() {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const loadMore = async () => {
    if (loading) return
    setLoading(true)
    const newItems = await fetchItems(page)
    setItems([...items, ...newItems])
    setPage(page + 1)
    setLoading(false)
  }
  
  useIntersectionObserver({
    onIntersect: loadMore,
    threshold: 0.1
  })
  
  return (
    <div>
      {items.map(item => <Item key={item.id} {...item} />)}
      {loading && <Loading />}
    </div>
  )
}
```

**分页：**
```jsx
function PaginatedList() {
  const [page, setPage] = useState(1)
  const pageSize = 20
  
  return (
    <div>
      {data.slice((page-1)*pageSize, page*pageSize).map(item => (
        <Item key={item.id} {...item} />
      ))}
      <Pagination 
        current={page} 
        total={Math.ceil(total/pageSize)}
        onChange={setPage}
      />
    </div>
  )
}
```

**虚拟滚动：**
```jsx
function VirtualList({ items }) {
  return (
    <FixedSizeList height={500} itemCount={items.length} itemSize={50}>
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  )
}
```

**选型建议：**
- 信息流/Feed：无限滚动
- 数据表格：分页
- 1000+ 条数据：虚拟滚动
- SEO 要求高：分页

**知识点：** `方案对比` `无限滚动` `分页` `虚拟滚动`

:::

### Q6: 瀑布流实现

> **🔥 中等 · 布局**

请实现瀑布流布局。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

### CSS Column 方案
```css
.masonry {
  column-count: 3;
  column-gap: 16px;
}

.masonry-item {
  break-inside: avoid;
  margin-bottom: 16px;
}
```

### CSS Grid 方案
```jsx
function GridMasonry({ items }) {
  return (
    <div 
      className="grid masonry"
      style={{
        display: 'grid',
        gridTemplateRows: 'masonry' // 仅 Firefox
      }}
    >
      {items.map(item => (
        <div className="item" key={item.id}>
          <img src={item.src} alt={item.alt} />
        </div>
      ))}
    </div>
  )
}
```

### JS 计算方案
```jsx
function MasonryGrid({ items, columnCount = 3, gap = 16 }) {
  const [columnHeights, setColumnHeights] = useState(
    new Array(columnCount).fill(0)
  )
  
  const columns = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => [])
    
    items.forEach((item, index) => {
      // 找到最短的列
      const minHeight = Math.min(...columnHeights)
      const minIndex = columnHeights.indexOf(minHeight)
      
      // 添加到该列
      cols[minIndex].push(item)
      columnHeights[minIndex] += item.aspectRatio > 1 ? 300 : 200
    })
    
    return cols
  }, [items, columnCount])
  
  return (
    <div className="masonry" style={{ display: 'flex', gap }}>
      {columns.map((col, i) => (
        <div key={i} className="column" style={{ flex: 1 }}>
          {col.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ))}
    </div>
  )
}

// 使用
<MasonryGrid 
  items={images} 
  columnCount={4} 
  gap={20}
/>
```

### react-masonry-css 库
```jsx
import Masonry from 'react-masonry-css'

function Gallery({ images }) {
  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1
  }
  
  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {images.map(img => (
        <div key={img.id}>
          <img src={img.src} alt={img.alt} />
        </div>
      ))}
    </Masonry>
  )
}
```

```css
.my-masonry-grid {
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  margin-left: -16px;
}
.my-masonry-grid_column {
  padding-left: 16px;
  background-clip: padding-box;
}
```

**知识点：** `瀑布流` `CSS Column` `Grid` `响应式`

:::

### Q7: 大数据表格（10 万行）优化

> **💀 困难 · 大数据**

请优化 10 万行数据表格的性能。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**优化策略：**

### 1. 虚拟滚动 + 列虚拟化
```jsx
import { FixedSizeGrid } from 'react-window'

function LargeTable({ data, columns }) {
  return (
    <FixedSizeGrid
      columnCount={columns.length}
      columnWidth={150}
      height={600}
      rowCount={data.length}
      rowHeight={35}
      width={1200}
    >
      {({ columnIndex, rowIndex, style }) => (
        <div style={style} className="cell">
          {data[rowIndex][columns[columnIndex].key]}
        </div>
      )}
    </FixedSizeGrid>
  )
}
```

### 2. 数据分页 + 懒加载
```jsx
function LazyTable({ totalData }) {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 100 })
  const [dataCache, setDataCache] = useState(new Map())
  
  useEffect(() => {
    const needed = []
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
      if (!dataCache.has(i)) needed.push(i)
    }
    
    if (needed.length > 0) {
      fetchRows(needed).then(rows => {
        setDataCache(prev => {
          const newMap = new Map(prev)
          rows.forEach(r => newMap.set(r.index, r.data))
          return newMap
        })
      })
    }
  }, [visibleRange])
  
  return (
    <VirtualList
      data={dataCache}
      onVisibleRangeChange={setVisibleRange}
    />
  )
}
```

### 3. Web Worker 数据处理
```js
// data-worker.js
self.onmessage = (e) => {
  const { data, operation } = e.data
  
  if (operation === 'filter') {
    const filtered = data.filter(row => 
      row.name.includes(e.data.query)
    )
    self.postMessage({ type: 'filter', result: filtered })
  }
  
  if (operation === 'sort') {
    const sorted = [...data].sort((a, b) => 
      a[e.data.column].localeCompare(b[e.data.column])
    )
    self.postMessage({ type: 'sort', result: sorted })
  }
}

// 主线程
const worker = new Worker('./data-worker.js')
worker.onmessage = (e) => {
  if (e.data.type === 'filter') {
    setFilteredData(e.data.result)
  }
}

function filter(query) {
  worker.postMessage({ 
    data: rawData, 
    operation: 'filter',
    query 
  })
}
```

### 4. 列虚拟化
```jsx
import { VariableSizeGrid } from 'react-window'

function BigDataTable({ data, columns }) {
  const getColWidth = (index) => {
    const col = columns[index]
    if (col.type === 'action') return 80
    if (col.type === 'text') return 120
    if (col.type === 'long') return 300
    return 150
  }
  
  return (
    <VariableSizeGrid
      columnCount={columns.length}
      columnWidth={getColWidth}
      height={500}
      rowCount={data.length}
      rowHeight={35}
      width={1000}
    >
      {({ columnIndex, rowIndex, style }) => {
        const col = columns[columnIndex]
        const row = data[rowIndex]
        return (
          <div style={{ ...style, borderBottom: '1px solid #eee' }}>
            {renderCell(row[col.key], col)}
          </div>
        )
      }}
    </VariableSizeGrid>
  )
}
```

### 5. Memo 优化
```jsx
const Row = React.memo(({ row, columns }) => {
  return (
    <tr>
      {columns.map(col => (
        <td key={col.key}>{row[col.key]}</td>
      ))}
    </tr>
  )
}, (prev, next) => {
  return prev.row === next.row
})

// 或者使用 useMemo 缓存渲染
function DataTable({ data }) {
  const rows = useMemo(() => 
    data.map(row => <Row key={row.id} row={row} />),
    [data]
  )
  return <table>{rows}</table>
}
```

**知识点：** `虚拟滚动` `Web Worker` `数据分页` `列虚拟化` `React.memo`

:::

### Q8: DOM 节点过多渲染方案

> **💀 困难 · 渲染优化**

请说明大量 DOM 节点时的渲染优化方案。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**问题症状：**
- 页面卡顿
- 滚动掉帧
- 内存占用高
- 响应缓慢

**优化方案：**

### 1. 内容可见性（Content Visibility）
```css
.list-item {
  content-visibility: auto;
  contain-intrinsic-size: 100px;
}
```
- 自动跳过不可见元素渲染
- Chrome 85+ 支持

### 2. CSS 容斥（Contain）
```css
.list {
  contain: layout style paint;
}
```
- 隔离子元素布局影响
- 提升渲染性能

### 3. 防过度渲染
```jsx
// 使用 ShouldComponentUpdate / React.memo
const ListItem = React.memo(({ item }) => {
  return <div>{item.name}</div>
}, (prev, next) => prev.item.id === next.item.id)

// 或使用 PureComponent
class ListItem extends React.PureComponent {
  render() {
    return <div>{this.props.item.name}</div>
  }
}
```

### 4. 只渲染可见区域
```jsx
function OnlyVisible({ items }) {
  const [visible, setVisible] = useState([])
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const item = entry.target
          if (entry.isIntersecting) {
            setVisible(v => [...v, item.dataset.id])
          }
        })
      }
    )
    
    items.forEach(item => {
      const el = document.querySelector(`[data-id="${item.id}"]`)
      if (el) observer.observe(el)
    })
  }, [items])
  
  return (
    <div>
      {items.map(item => (
        <div 
          key={item.id} 
          data-id={item.id}
          style={{ display: visible.includes(item.id) ? 'block' : 'none' }}
        >
          {item.name}
        </div>
      ))}
    </div>
  )
}
```

### 5. 使用 DocumentFragment
```jsx
// 批量 DOM 操作
function appendItems(items) {
  const fragment = document.createDocumentFragment()
  items.forEach(item => {
    const el = document.createElement('div')
    el.textContent = item.name
    fragment.appendChild(el)
  })
  container.appendChild(fragment) // 一次重排
}

// vs
items.forEach(item => {
  const el = document.createElement('div')
  container.appendChild(el) // N 次重排
})
```

### 6. 提前虚拟化
```jsx
// 不是所有 Item 都是真实的
function AbstractedList({ items }) {
  // 折叠相似项
  const grouped = useMemo(() => {
    return items.reduce((acc, item) => {
      const date = formatDate(item.date)
      if (!acc[date]) acc[date] = []
      acc[date].push(item)
      return acc
    }, {})
  }, [items])
  
  return (
    <div>
      {Object.entries(grouped).map(([date, items]) => (
        <Group key={date} date={date} items={items} />
      ))}
    </div>
  )
}
```

**知识点：** `Content Visibility` `Contain` `应变更` `虚拟渲染` `分组优化`

:::
### Q9: 虚拟滚动的实现原理？如何处理动态高度？

> **🔥 中等 · 长列表**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**虚拟滚动核心原理：**

只渲染可视区域内的元素，大幅减少 DOM 节点数量。

```jsx
function VirtualList({ items, itemHeight = 50, containerHeight = 500 }) {
  const [scrollTop, setScrollTop] = useState(0)
  
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(startIndex + visibleCount, items.length)
  const offsetY = startIndex * itemHeight
  
  const visibleItems = items.slice(startIndex, endIndex)
  
  return (
    <div style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={(e) => setScrollTop(e.target.scrollTop)}>
      <div style={{ height: items.length * itemHeight, position: 'relative' }}>
        <div style={{ position: 'absolute', top: offsetY }}>
          {visibleItems.map(item => (
            <div key={item.id} style={{ height: itemHeight }}>{item.content}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**动态高度处理：**

```jsx
function DynamicVirtualList({ items }) {
  const [sizes, setSizes] = useState(new Map())
  const itemRefs = useRef([])
  
  const measureItem = (index, el) => {
    if (!el) return
    const actualHeight = el.offsetHeight
    if (sizes.get(index) !== actualHeight) {
      setSizes(prev => new Map(prev).set(index, actualHeight))
    }
  }
  
  // 计算累积位置
  const positions = useMemo(() => {
    let top = 0
    return items.map((_, i) => {
      const h = sizes.get(i) || 100
      const pos = { top, height: h }
      top += h
      return pos
    })
  }, [items.length, sizes])
  
  return (
    <div style={{ height: 500, overflow: 'auto' }}>
      <div style={{ height: positions.at(-1)?.top || 0 }}>
        {items.map((item, i) => (
          <div key={item.id}
            ref={el => measureItem(i, el)}
            style={{ position: 'absolute', top: positions[i].top }}>
            {item.content}
          </div>
        ))}
      </div>
    </div>
  )
}
```

**知识点：** `虚拟滚动` `动态高度` `DOM 优化` `位置计算`

:::

### Q10: 虚拟列表的滚动性能优化？

> **🔥 中等 · 性能优化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**性能瓶颈：**
1. 滚动事件触发频繁（60+ 次/秒）
2. 频繁重渲染
3. 位置计算耗时
4. DOM 操作频繁

**优化方案：**

**1. 使用 RAF 同步渲染**
```js
const rafRef = useRef(null)
const handleScroll = (e) => {
  if (rafRef.current) cancelAnimationFrame(rafRef.current)
  rafRef.current = requestAnimationFrame(() => {
    const start = Math.floor(e.target.scrollTop / ITEM_HEIGHT)
    setRange({ start, end: start + VISIBLE_COUNT })
  })
}
```

**2. React.memo 避免重渲染**
```jsx
const VirtualItem = React.memo(({ item, style }) => (
  <div style={style}>{item.content}</div>
))
```

**3. CSS Contain 隔离**
```css
.virtual-item {
  contain: layout style paint;
  content-visibility: auto;
}
```

**4. Transform 替代 Top**
```jsx
<div style={{ transform: `translateY(${offsetY}px)`, willChange: 'transform' }} />
```

**性能对比：**

| 优化项 | 优化前 | 优化后 |
|--------|--------|--------|
| FPS | 30-40 | 60 |
| DOM 节点 | 1000+ | 20-30 |

**知识点：** `虚拟列表` `RAF` `React.memo` `CSS Contain` `滚动优化`

:::

### Q11: 无限滚动的实现方案？分页加载 vs 游标加载？

> **🔥 中等 · 长列表**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**方案一：分页加载 (Offset-based)**

```jsx
function InfiniteScroll() {
  const [page, setPage] = useState(1)
  const [items, setItems] = useState([])
  const [hasMore, setHasMore] = useState(true)
  
  const loadMore = async () => {
    const res = await fetch(`/api/items?page=${page}&size=20`)
    const { data, total } = await res.json()
    setItems(prev => [...prev, ...data])
    setHasMore(items.length + data.length < total)
    setPage(p => p + 1)
  }
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries[0].isIntersecting && loadMore(),
      { rootMargin: '200px' }
    )
    observer.observe(document.querySelector('#sentinel'))
    return () => observer.disconnect()
  }, [page, hasMore])
  
  return (
    <div>
      {items.map(item => <Item key={item.id} data={item} />)}
      <div id="sentinel">{hasMore ? <Spinner /> : <NoMore />}</div>
    </div>
  )
}
```

**方案二：游标加载 (Cursor-based)**

```jsx
const res = await fetch(`/api/items?cursor=${cursor}&limit=20`)
const { data, nextCursor } = await res.json()
setItems(prev => [...prev, ...data])
setCursor(nextCursor)
setHasMore(nextCursor !== null)
```

**分页 vs 游标对比：**

| 特性 | 分页加载 | 游标加载 |
|------|----------|----------|
| 数据一致性 | 差（数据变动会错位） | 好 |
| 适用场景 | 静态数据、后台 | 动态 feed 流 |
| 性能 | 深度分页慢 | 稳定 |
| 可跳转 | 支持 | 不支持 |

**SQL 对比：**
```sql
-- 分页：OFFSET 深度分页慢
SELECT * FROM items ORDER BY id LIMIT 20 OFFSET 100;

-- 游标：索引高效
SELECT * FROM items WHERE id < :last_id ORDER BY id DESC LIMIT 20;
```

**知识点：** `无限滚动` `分页加载` `游标分页` `Intersection Observer`

:::
