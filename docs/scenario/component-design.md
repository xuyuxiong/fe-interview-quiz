### Q1: JWT 和 Token 有什么区别？

> **🔥 中等 · scenario/component-design**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**JWT 是 Token 的一种具体实现格式。**

| 对比项 | Token | JWT |
|--------|-------|-----|
| 概念 | 通用的认证凭证 | 特定格式的 Token |
| 格式 | 任意 | Header.Payload.Signature |
| 存储 | 服务端 Session 或 客户端 | 客户端存储 |
| 验证 | 查数据库 | 验证签名 |

**知识点：**`JWT` `Token` `认证`

:::

### Q2: 多个接口请求如何优化？

> **🔥 中等 · scenario/component-design**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**优化方案：**

1. **并行请求**
```javascript
const [users, posts, comments] = await Promise.all([
  fetch('/users'),
  fetch('/posts'),
  fetch('/comments')
]);
```

2. **请求合并**
```javascript
// 后端提供批量接口
fetch('/batch?resources=users,posts,comments');
```

3. **BFF 层聚合**
```javascript
// 后端聚合多个微服务
fetch('/api/page-data');
```

4. **缓存复用**
```javascript
// React Query / SWR
const { data } = useQuery('users', fetchUsers);
```

**知识点：**`接口优化` `并行请求` `Promise.all`

:::

### Q3: 页面切换时如何保存数据？

> **🔥 中等 · scenario/component-design**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**方案：**

1. **全局状态管理**
```javascript
// Vuex/Redux/Zustand
store.state.formData = formValue;
```

2. **URL 参数**
```javascript
// 查询参数保存状态
history.pushState(null, '', `?page=${page}&filter=${filter}`);
```

3. **本地存储**
```javascript
localStorage.setItem('formData', JSON.stringify(data));
```

4. **Keep-Alive（Vue）**
```vue
<keep-alive>
  <router-view />
</keep-alive>
```

**知识点：**`状态管理` `数据持久化` `Keep-Alive`

:::

### Q4: React 如何实现优先渲染？

> **🔥 中等 · scenario/component-design**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**方案：**

1. **useTransition（React 18）**
```javascript
const [isPending, startTransition] = useTransition();

startTransition(() => {
  setSearchQuery(input);  // 低优先级
});
```

2. **useDeferredValue**
```javascript
const deferredQuery = useDeferredValue(query);
```

3. **Suspense**
```jsx
<Suspense fallback={<Spinner />}>
  <HeavyComponent />
</Suspense>
```

**知识点：**`React` `并发渲染` `优先级` `Suspense`

:::

### Q5: 组件封装的原则是什么？

> **⭐ 简单 · scenario/component-design**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**原则：**

1. **单一职责** - 一个组件只做一件事
2. **高内聚低耦合** - 内部逻辑独立，外部依赖少
3. **可复用性** - 通过 props 配置行为
4. **可测试性** - 纯函数、易 mock
5. **命名清晰** - 组件名反映用途

**知识点：**`组件设计` `封装原则` `最佳实践`

:::

### Q6: 为什么 0.1 + 0.2 !== 0.3？

> **⭐ 简单 · scenario/component-design**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**IEEE 754 浮点数精度问题。**

```javascript
0.1 + 0.2;  // 0.30000000000000004
```

**解决方案：**
```javascript
// 方案 1: toFixed
(0.1 + 0.2).toFixed(1);  // '0.3'

// 方案 2: 转为整数
(0.1 * 10 + 0.2 * 10) / 10;  // 0.3

// 方案 3: 精度库
import decimal from 'decimal.js';
new decimal(0.1).plus(0.2).toNumber();  // 0.3
```

**知识点：**`浮点数` `精度` `IEEE 754`

:::

### Q7: 多个视频同时播放如何优化？

> **💀 困难 · scenario/component-design**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**优化方案：**

1. **懒加载**
```javascript
// Intersection Observer
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.load();
    }
  });
});
```

2. **虚拟列表**
```jsx
// 只渲染可见区域视频
<VirtualList height={600} itemHeight={200}>
  {visibleVideos.map(video => <Video key={video.id} {...video} />)}
</VirtualList>
```

3. **暂停不可见视频**
```javascript
video.pause();  // 离开可视区域
video.play();   // 进入可视区域
```

4. **降低清晰度**
```javascript
// 不可见时使用低清
video.src = isVisible ? hdUrl : sdUrl;
```

**知识点：**`视频优化` `懒加载` `虚拟列表`

:::

### Q8: 200M 数据如何渲染？

> **💀 困难 · scenario/component-design**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**方案：**

1. **虚拟滚动**
```javascript
// 只渲染可见行
const visibleData = data.slice(startIndex, endIndex);
```

2. **时间分片**
```javascript
function renderChunk(data, chunkSize = 100) {
  if (data.length === 0) return;
  
  const chunk = data.slice(0, chunkSize);
  render(chunk);
  
  requestAnimationFrame(() => {
    renderChunk(data.slice(chunkSize), chunkSize);
  });
}
```

3. **Web Worker**
```javascript
// 大数据处理放到 Worker
const worker = new Worker('process.js');
worker.postMessage(largeData);
```

4. **服务端分页**
```javascript
fetch(`/api/data?page=${page}&size=50`);
```

**知识点：**`大数据` `虚拟列表` `时间分片` `Web Worker`

:::

### Q9: 微前端 qiankun 的实现原理？

> **💀 困难 · scenario/component-design**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**qiankun 基于 single-spa，核心原理：**

1. **HTML Entry**
   - 解析子应用 HTML
   - 提取 JS/CSS 执行

2. **JS 沙箱**
   - Proxy 隔离全局变量
   - 样式隔离（Shadow DOM / Scoped CSS）

3. **通信机制**
   - initState / onGlobalStateChange
   - Actions 事件总线

4. **生命周期**
   - bootstrap, mount, unmount

**知识点：**`微前端` `qiankun` `沙箱` `HTML Entry`

:::

### Q10: 性能优化闭环如何做？

> **🔥 中等 · scenario/component-design**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**闭环流程：**

```
1. 监控 → 发现性能问题
         ↓
2. 分析 → 定位瓶颈（Lighthouse/DevTools）
         ↓
3. 优化 → 针对性改进
         ↓
4. 验证 → 对比前后指标
         ↓
5. 回归 → 持续监控防止劣化
```

**指标：** FCP, LCP, FID, CLS

**知识点：**`性能优化` `监控` `闭环`

:::

### Q11: 虚拟列表组件如何设计？

> **💀 困难 · scenario/component-design**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心设计：**

```jsx
function VirtualList({ data, itemHeight, height }) {
  const [scrollTop, setScrollTop] = useState(0);
  
  // 计算可见范围
  const startIndex = Math.floor(scrollTop / itemHeight);
  const visibleCount = Math.ceil(height / itemHeight);
  const visibleData = data.slice(startIndex, startIndex + visibleCount);
  
  // 占位高度
  const totalHeight = data.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return (
    <div style={{ height }} onScroll={e => setScrollTop(e.target.scrollTop)}>
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleData.map(item => (
            <div key={item.id} style={{ height: itemHeight }}>
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

**知识点：**`虚拟列表` `组件设计` `性能优化`

:::

### Q12: 表单组件如何设计？

> **🔥 中等 · scenario/component-design**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**设计要点：**

1. **受控组件**
```jsx
<FormField
  value={value}
  onChange={setValue}
  rules={[{ required: true, message: '必填' }]}
/>
```

2. **表单上下文**
```jsx
const FormContext = createContext();

function Form({ initialValues, onSubmit }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  
  return (
    <FormContext.Provider value={{ values, setValues, errors, setErrors }}>
      <form onSubmit={() => onSubmit(values)}>{children}</form>
    </FormContext.Provider>
  );
}
```

**知识点：**`表单设计` `受控组件` `上下文`

:::

### Q13: Toast 组件如何设计？

> **⭐ 简单 · scenario/component-design**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**设计要点：**

1. **单例模式**
```javascript
const toast = {
  success: (msg) => showToast(msg, 'success'),
  error: (msg) => showToast(msg, 'error'),
};
```

2. **队列管理**
```javascript
const queue = [];
function showToast(msg, type) {
  queue.push({ msg, type, id: Date.now() });
  render();
  setTimeout(() => remove(id), 3000);
}
```

3. **命令式调用**
```jsx
<ToastContainer />  // 放在根节点
toast.success('操作成功');
```

**知识点：**`Toast` `单例` `命令式`

:::

### Q14: Modal 组件如何设计？

> **🔥 中等 · scenario/component-design**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**设计要点：**

1. **Portals 渲染**
```jsx
ReactDOM.createPortal(
  <ModalContent />,
  document.getElementById('modal-root')
);
```

2. **遮罩层管理**
```jsx
function Modal({ visible, onClose, children }) {
  if (!visible) return null;
  
  return (
    <div className="modal-mask" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
```

3. **嵌套支持**
```javascript
// 维护层级栈
const modalStack = [];
```

**知识点：**`Modal` `Portal` `遮罩层`

:::

### Q15: 下拉选择组件如何设计？

> **🔥 中等 · scenario/component-design**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**设计要点：**

1. **虚拟滚动（大数据）**
```jsx
<Select options={largeOptions} virtual />
```

2. **搜索过滤**
```javascript
const filtered = options.filter(o =>
  o.label.includes(searchText)
);
```

3. **多选支持**
```jsx
<Select mode="multiple" value={[1, 2, 3]} />
```

4. **可创建选项**
```jsx
<Select mode="tags" />  // 允许输入新值
```

**知识点：**`Select` `虚拟列表` `多选`

:::

### Q16: 如何做一个项目的国际化方案？

> **🔥 中等 · 场景设计**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**i18n 方案架构：**

```text
用户切换语言
  → 读取语言标识(locale)
    → 加载对应语言包(JSON)
      → 替换渲染文案
        → CSS direction适配(RTL)
          → 日期/数字格式化
```

**实现方案：**

```js
// 1. 语言包结构
// locales/zh-CN.json
{ "home.title": "欢迎回来", "home.desc": "今日待办 {count} 项" }

// locales/en-US.json
{ "home.title": "Welcome back", "home.desc": "{count} tasks today" }

// locales/ar-SA.json  (阿拉伯语 - RTL)
{ "home.title": "مرحباً بعودتك", "home.desc": "{count} مهام اليوم" }

// 2. i18n 核心
import { createI18n } from 'vue-i18n'  // 或 react-intl

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || navigator.language,
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': () => import('./locales/zh-CN.json'),
    'en-US': () => import('./locales/en-US.json'),
  }
})

// 3. 使用
// Vue: {{ $t('home.title') }}
// React: <FormattedMessage id="home.title" />
```

```css
/* 4. RTL 布局适配 */
[dir="rtl"] .sidebar { right: 0; left: auto; }
[dir="rtl"] .arrow-icon { transform: scaleX(-1); }

/* 5. 逻辑属性（现代方案） */
.sidebar {
  inset-inline-start: 0;      /* 替代 left/right */
  margin-inline-end: 16px;    /* 替代 margin-right/left */
  padding-block-start: 8px;   /* 替代 padding-top/bottom */
}
```

**关键考虑：**

| 问题 | 方案 |
|------|------|
| 语言包按需加载 | 动态 import() 减小首屏体积 |
| 日期格式差异 | `Intl.DateTimeFormat` |
| 数字/货币 | `Intl.NumberFormat` |
| 复数规则 | ICU Message Format |
| 文案超长 | 弹性布局 + 文字截断 |
| SEO | SSR 按语言渲染 + hreflang |
| 翻译协作 | Crowdin / Lokalise / Phrase |

**知识点：** `国际化` `i18n` `RTL` `语言包` `Intl API` `Vue I18n` `react-intl`

:::

### Q17: 如何建设项目的稳定性？

> **🔥 中等 · 场景设计**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**稳定性建设体系：**

```text
预防层                   监控层                   应急层
┌──────────┐       ┌──────────┐        ┌──────────┐
│ 自动化测试 │       │ 错误监控  │        │ 快速回滚  │
│ Code Review│  →    │ 性能监控  │   →    │ 限流降级  │
│ 灰度发布  │       │ 业务监控  │        │ 故障演练  │
│ 静态分析  │       │ 告警通知  │        │ 应急SOP   │
└──────────┘       └──────────┘        └──────────┘
```

**各层具体方案：**

```js
// 1. 错误监控 - Sentry
Sentry.init({
  dsn: 'xxx',
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  // 错误采样、过滤、用户信息关联
})

// 2. 性能监控 - Web Vitals
import { onLCP, onFID, onCLS, onINP } from 'web-vitals'
onLCP(metric => reportMetric('LCP', metric))
onFID(metric => reportMetric('FID', metric))

// 3. 业务监控 - 自定义指标
const reportBusiness = (name, data) => {
  navigator.sendBeacon('/api/monitor', JSON.stringify({
    name, data, timestamp: Date.now(), url: location.href
  }))
}
// 关键路径：支付成功率、页面跳出率、接口成功率
```

**灰度发布策略：**

```text
1% → 5% → 10% → 30% → 50% → 100%
 ↓     ↓      ↓
监控   观察    全量/回滚

灰度维度：
- 用户ID尾号
- 地域
- 设备类型
- 新老用户
```

**降级预案：**

| 故障场景 | 降级方案 |
|---------|---------|
| 接口超时 | 骨架屏 + 重试 + 降级数据 |
| CDN故障 | 备用CDN + 本地缓存 |
| 服务端挂 | PWA离线页 + Service Worker |
| 流量突增 | 静态化 + 限流 + 排队 |

**知识点：** `稳定性` `监控` `灰度发布` `降级` `回滚` `Sentry` `Web Vitals` `故障演练`

:::

### Q18: 实现一个轮播图组件需要考虑哪些？

> **🔥 中等 · 组件设计**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**轮播图核心实现：**

```js
// React 实现
function Carousel({ children, autoPlay = true, interval = 3000 }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timerRef = useRef(null)
  const trackRef = useRef(null)
  const touchStartRef = useRef(0)

  // 无限循环：克隆首尾 slide
  const slides = [children[children.length - 1], ...children, children[0]]

  // 自动播放
  useEffect(() => {
    if (!autoPlay) return
    timerRef.current = setInterval(next, interval)
    return () => clearInterval(timerRef.current)
  }, [autoPlay, interval])

  const next = () => {
    setIsTransitioning(true)
    setCurrentIndex(prev => prev + 1)
  }

  // 无缝衔接：transition结束后瞬移
  const handleTransitionEnd = () => {
    setIsTransitioning(false)
    if (currentIndex === 0) {
      // 瞬移到真正的最后一张（无动画）
      trackRef.current.style.transition = 'none'
      setCurrentIndex(children.length)
      requestAnimationFrame(() => {
        trackRef.current.style.transition = ''
      })
    } else if (currentIndex === children.length + 1) {
      trackRef.current.style.transition = 'none'
      setCurrentIndex(1)
      requestAnimationFrame(() => {
        trackRef.current.style.transition = ''
      })
    }
  }

  // 触摸滑动
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX
    clearInterval(timerRef.current)
  }

  const handleTouchEnd = (e) => {
    const diff = touchStartRef.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? next() : prev()
    if (autoPlay) timerRef.current = setInterval(next, interval)
  }

  return (
    <div className="carousel"
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div ref={trackRef}
        className="carousel-track"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? 'transform 0.3s ease' : 'none'
        }}
        onTransitionEnd={handleTransitionEnd}>
        {slides.map((slide, i) => <div key={i} className="slide">{slide}</div>)}
      </div>
      <Dots current={currentIndex} total={children.length} />
      <Arrow direction="left" onClick={prev} />
      <Arrow direction="right" onClick={next} />
    </div>
  )
}
```

**需要考虑的点：**

| 维度 | 考虑点 |
|------|--------|
| 性能 | transform代替left、will-change、图片懒加载 |
| 交互 | 触摸滑动、鼠标拖拽、键盘控制 |
| 无限循环 | 克隆首尾slide、transitionEnd瞬移 |
| 自动播放 | 定时器、hover暂停、页面可见性 |
| 响应式 | 不同屏幕尺寸、resize适配 |
| 可访问性 | aria-label、role、键盘导航 |
| 懒加载 | 只渲染可视区域+预加载相邻 |

**知识点：** `轮播图` `CSS transform` `触摸事件` `无限循环` `懒加载` `组件设计`

:::

### Q19: 图片懒加载怎么实现？

> **⭐ 简单 · 性能优化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**三种实现方案：**

```html
<!-- 方案1：IntersectionObserver（推荐） -->
<img data-src="real-image.jpg" src="placeholder.svg" class="lazy">
```

```js
// IntersectionObserver 实现
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target
      img.src = img.dataset.src      // 加载真实图片
      img.removeAttribute('data-src')
      observer.unobserve(img)        // 加载后停止观察
    }
  })
}, {
  rootMargin: '100px',  // 提前100px开始加载
  threshold: 0.01        // 1%可见即触发
})

document.querySelectorAll('img.lazy').forEach(img => observer.observe(img))
```

```js
// 方案2：getBoundingClientRect + scroll（兼容方案）
function lazyLoad() {
  const imgs = document.querySelectorAll('img[data-src]')
  const viewHeight = window.innerHeight
  imgs.forEach(img => {
    const rect = img.getBoundingClientRect()
    if (rect.top < viewHeight + 100) {
      img.src = img.dataset.src
      img.removeAttribute('data-src')
    }
  })
}
window.addEventListener('scroll', throttle(lazyLoad, 200))
```

```html
<!-- 方案3：原生 loading="lazy"（最简方案） -->
<img src="real-image.jpg" loading="lazy" alt="描述">
<!-- 浏览器原生懒加载，无需JS，兼容性良好 -->
```

**方案对比：**

| 方案 | 兼容性 | 性能 | 控制精度 |
|------|--------|------|---------|
| IntersectionObserver | IE不支持 | 最佳 | 高（rootMargin/threshold） |
| scroll + rect | 全兼容 | 一般(需节流) | 中 |
| loading="lazy" | Chrome/Edge | 最佳 | 低（浏览器控制） |

**知识点：** `懒加载` `IntersectionObserver` `getBoundingClientRect` `性能优化` `loading=lazy`

:::

### Q20: 实现 query 链式调用（filter/sort/groupBy/execute），类似 lodash chain

> **💀 困难 · 组件设计**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**链式调用核心：每个方法返回 this**

```js
class Query {
  constructor(data) {
    this._data = data
    this._operations = []
  }

  // 过滤
  filter(fn) {
    this._operations.push({ type: 'filter', fn })
    return this  // 返回 this 实现链式
  }

  // 排序
  sortBy(key, order = 'asc') {
    this._operations.push({ type: 'sortBy', key, order })
    return this
  }

  // 分组
  groupBy(key) {
    this._operations.push({ type: 'groupBy', key })
    return this
  }

  // 限制数量
  limit(n) {
    this._operations.push({ type: 'limit', n })
    return this
  }

  // 执行并返回结果
  execute() {
    let result = [...this._data]

    for (const op of this._operations) {
      switch (op.type) {
        case 'filter':
          result = result.filter(op.fn)
          break
        case 'sortBy':
          result.sort((a, b) => {
            const valA = a[op.key], valB = b[op.key]
            return op.order === 'asc' ? valA - valB : valB - valA
          })
          break
        case 'groupBy':
          result = result.reduce((acc, item) => {
            const key = item[op.key]
            acc[key] = [...(acc[key] || []), item]
            return acc
          }, {})
          break
        case 'limit':
          result = result.slice(0, op.n)
          break
      }
    }

    this._operations = []  // 清空操作
    return result
  }

  // 别名：value/valueOf 支持隐式执行
  value() {
    return this.execute()
  }

  valueOf() {
    return this.execute()
  }

  [Symbol.iterator]() {
    return this.execute()[Symbol.iterator]()
  }
}

// 工厂函数
function chain(data) {
  return new Query(data)
}

// 使用示例
const users = [
  { name: 'Alice', age: 25, city: 'NYC' },
  { name: 'Bob', age: 30, city: 'LA' },
  { name: 'Charlie', age: 25, city: 'NYC' },
  { name: 'David', age: 35, city: 'LA' }
]

// 链式调用示例
const result1 = chain(users)
  .filter(u => u.age > 28)
  .sortBy('age', 'desc')
  .limit(2)
  .execute()
// [{ name: 'David', age: 35 }, { name: 'Bob', age: 30 }]

const result2 = chain(users)
  .filter(u => u.city === 'NYC')
  .groupBy('age')
  .execute()
// { 25: [{ name: 'Alice'...}, { name: 'Charlie'...}] }

// for...of 遍历
for (const user of chain(users).filter(u => u.age > 28)) {
  console.log(user.name)
}
```

**可选：闭包版本（更简洁）**

```js
const chain = (data) => {
  let list = [...data]
  
  return {
    filter(fn) {
      list = list.filter(fn)
      return chain(list)  // 返回新链
    },
    sortBy(key, order = 'asc') {
      list.sort((a, b) => {
        const valA = a[key], valB = b[key]
        return order === 'asc' ? valA - valB : valB - valA
      })
      return chain(list)
    },
    execute() {
      return list
    }
  }
}

// 使用
chain(users)
  .filter(u => u.age > 28)
  .sortBy('age')
  .execute()
```

**知识点：** `链式调用` `设计模式` `迭代器` `操作链` `this 返回` `Symbol.iterator`

:::
