### Q12: JWT 和 Token 有什么区别？

> **🔥 中等 · 安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**关系：** JWT 是一种 Token 的具体实现格式。

**区别对比：**

| 特性 | Token（通用） | JWT |
|------|-------------|-----|
| 定义 | 身份令牌（通用概念） | JSON Web Token（具体格式） |
| 结构 | 不固定 | header.payload.signature |
| 自包含 | 不一定 | ✅ 签名包含声明信息 |
| 可验证 | 需查数据库 | ✅ 通过签名验证 |
| 大小 | 不固定 | 较大（几 KB） |

**Token 类型：**

```js
// 1. 不透明 Token（Opaque Token）
// 仅是一串随机字符串，服务端需查数据库验证
const token = 'random_string_xyz123'
// 服务端验证：SELECT * FROM sessions WHERE token = 'xyz123'

// 2. JWT（自包含）
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
// 包含 header + payload + signature，可通过签名验证
```

**JWT 结构：**

```
header.payload.signature

// header
{
  "alg": "HS256",
  "typ": "JWT"
}

// payload（声明）
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,
  "exp": 1516242622,
  "role": "admin"
}

// signature
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

**使用场景：**

| 场景 | 推荐方案 |
|------|---------|
| 简单会话 | 不透明 Token + Session |
| 微服务 | JWT（无状态验证） |
| 跨域认证 | JWT |
| 高安全性 | 不透明 Token（可撤销） |

**知识点：** `JWT` `Token` `无状态` `签名` `身份认证`

:::

---

### Q13: 多接口请求怎么优化？时序性/优先级怎么保证？

> **🔥 中等 · 场景**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**并发优化：**

```js
// 1. Promise.all - 全部完成
const [user, posts] = await Promise.all([
  fetch('/api/user'),
  fetch('/api/posts')
])

// 2. Promise.allSettled - 等待全部
const results = await Promise.allSettled([p1, p2])

// 3. Promise.race - 第一个完成
const result = await Promise.race([p1, timeout(3000)])
```

**时序性保证：**

```js
// 串行执行
async function fetchUserPosts(userId) {
  const user = await fetch(`/api/user/${userId}`)
  const posts = await fetch(`/api/posts?userId=${user.id}`)
  return { user, posts }
}
```

**请求队列（优先级）：**

```js
class RequestQueue {
  constructor(concurrency = 3) {
    this.queue = []
    this.running = 0
  }
  
  add(fn, priority = 0) {
    this.queue.push({ fn, priority })
    this.queue.sort((a, b) => b.priority - a.priority)
    this.next()
  }
}
```

**知识点：** `Promise.all` `并发控制` `优先级` `请求合并`

:::

---

### Q14: 如何实现页面切换保存数据且记忆滚动位置？

> **🔥 中等 · Vue/React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Vue - keepAlive：**

```vue
<router-view v-slot="{ Component }">
  <keep-alive>
    <component :is="Component" v-if="$route.meta.keepAlive" />
  </keep-alive>
</router-view>

<script>
export default {
  activated() {
    window.scrollTo(0, this.scrollTop)
  },
  deactivated() {
    this.scrollTop = window.scrollY
  }
}
</script>
```

**React - sessionStorage：**

```jsx
useEffect(() => {
  const saved = sessionStorage.getItem('scroll')
  if (saved) window.scrollTo(0, parseInt(saved))
  
  return () => {
    sessionStorage.setItem('scroll', String(window.scrollY))
  }
}, [])
```

**知识点：** `keepAlive` `滚动位置` `状态持久化`

:::

---

### Q15: React 如何优先渲染某个部分？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. Suspense + lazy：**

```jsx
<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

**2. startTransition（低优先级）：**

```jsx
function App() {
  const [isPending, startTransition] = useTransition()
  
  startTransition(() => {
    setFilteredList(search(text))
  })
}
```

**3. useDeferredValue：**

```jsx
const deferredQuery = useDeferredValue(query)
const results = useMemo(() => search(deferredQuery), [deferredQuery])
```

**知识点：** `Suspense` `startTransition` `useDeferredValue` `Concurrent`

:::

---

### Q16: 组件封装有哪些原则？

> **🔥 中等 · React/Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

1. **单一职责** - 每个组件只做一件事
2. **可复用** - 通用组件，避免硬编码
3. **受控/非受控** - 支持两种模式
4. **可配置** - Props 配置行为
5. **接口稳定** - API 不轻易变动
6. **组合优于继承** - 用组合实现复用

**示例：**

```jsx
function Button({ variant, size, loading, children, ...props }) {
  return (
    <button className={`btn-${variant}`} {...props}>
      {loading ? <Spinner /> : children}
    </button>
  )
}
```

**知识点：** `单一职责` `可复用` `组合` `接口设计`

:::---

### Q17: 如何实现一个拖拽排序组件？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**方案一：HTML5 Drag and Drop API**

```html
<ul id="sortable-list">
  <li draggable="true" data-id="1">项目 1</li>
  <li draggable="true" data-id="2">项目 2</li>
  <li draggable="true" data-id="3">项目 3</li>
</ul>

<script>
const list = document.getElementById('sortable-list')
let draggedItem = null

list.addEventListener('dragstart', (e) => {
  draggedItem = e.target
  e.target.classList.add('dragging')
  e.dataTransfer.effectAllowed = 'move'
})

list.addEventListener('dragend', (e) => {
  e.target.classList.remove('dragging')
  draggedItem = null
})

list.addEventListener('dragover', (e) => {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  
  const afterElement = getDragAfterElement(list, e.clientY)
  if (afterElement) {
    list.insertBefore(draggedItem, afterElement)
  } else {
    list.appendChild(draggedItem)
  }
})

// 获取拖拽元素应该插入的位置
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('li:not(.dragging)')]
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect()
    const offset = y - box.top - box.height / 2
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child }
    } else {
      return closest
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element
}
</script>

<style>
li.dragging {
  opacity: 0.5;
  border: 2px dashed #007bff;
}
</style>
```

**方案二：MouseEvent 实现（更灵活）**

```html
<ul id="sortable-list">
  <li data-id="1">项目 1</li>
  <li data-id="2">项目 2</li>
  <li data-id="3">项目 3</li>
</ul>

<script>
class SortableList {
  constructor(container) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container
    this.draggedItem = null
    this.placeholder = null
    this.init()
  }
  
  init() {
    this.container.addEventListener('mousedown', this.onMouseDown.bind(this))
    document.addEventListener('mousemove', this.onMouseMove.bind(this))
    document.addEventListener('mouseup', this.onMouseUp.bind(this))
  }
  
  onMouseDown(e) {
    const item = e.target.closest('li')
    if (!item || !this.container.contains(item)) return
    
    this.draggedItem = item
    this.startY = e.clientY
    
    // 创建占位符
    this.placeholder = document.createElement('li')
    this.placeholder.className = 'placeholder'
    this.placeholder.style.height = item.offsetHeight + 'px'
    
    item.style.position = 'fixed'
    item.style.width = item.offsetWidth + 'px'
    item.style.zIndex = 1000
    document.body.appendChild(item)
    
    this.moveItem(e.clientY)
  }
  
  onMouseMove(e) {
    if (!this.draggedItem) return
    
    e.preventDefault()
    this.draggedItem.style.top = e.clientY - this.draggedItem.offsetHeight / 2 + 'px'
    this.draggedItem.style.left = e.clientX - this.draggedItem.offsetWidth / 2 + 'px'
    
    this.moveItem(e.clientY)
  }
  
  onMouseUp(e) {
    if (!this.draggedItem) return
    
    this.draggedItem.style.position = ''
    this.draggedItem.style.width = ''
    this.draggedItem.style.top = ''
    this.draggedItem.style.left = ''
    this.draggedItem.style.zIndex = ''
    
    if (this.placeholder && this.placeholder.parentNode) {
      this.placeholder.parentNode.insertBefore(this.draggedItem, this.placeholder)
      this.placeholder.remove()
    }
    
    this.draggedItem = null
    this.placeholder = null
    
    // 触发排序完成事件
    this.onSortComplete()
  }
  
  moveItem(y) {
    const items = [...this.container.querySelectorAll('li')]
      .filter(li => li !== this.draggedItem && li !== this.placeholder)
    
    for (const item of items) {
      const box = item.getBoundingClientRect()
      if (y < box.top + box.height / 2) {
        this.container.insertBefore(this.placeholder || this.draggedItem, item)
        return
      }
    }
    
    this.container.appendChild(this.placeholder || this.draggedItem)
  }
  
  onSortComplete() {
    // 获取新顺序
    const newOrder = [...this.container.querySelectorAll('li')]
      .map(li => li.dataset.id)
    console.log('新顺序:', newOrder)
  }
}

// 使用
new SortableList('#sortable-list')
</script>
```

**性能优化：**

```javascript
// 1. 使用 requestAnimationFrame 优化拖动
function requestAnimFrameMove(y) {
  requestAnimationFrame(() => {
    this.moveItem(y)
  })
}

// 2. 防抖排序事件
let sortTimeout
function onSortComplete() {
  clearTimeout(sortTimeout)
  sortTimeout = setTimeout(() => {
    // 发送排序结果到服务器
  }, 500)
}

// 3. 使用 CSS transform 而不是 top/left
this.draggedItem.style.transform = `translate(${x}px, ${y}px)`
```

**知识点：** `拖拽排序` `HTML5 Drag API` `MouseEvent` `排序算法`

:::

---

### Q18: 如何实现一个 Watermark 水印组件？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**方案一：Canvas 绘制水印**

```javascript
class Watermark {
  constructor(options = {}) {
    this.container = options.container || document.body
    this.text = options.text || '内部资料 严禁外传'
    this.color = options.color || 'rgba(0, 0, 0, 0.1)'
    this.fontSize = options.fontSize || 16
    this.rotate = options.rotate || -30
    this.gapX = options.gapX || 200
    this.gapY = options.gapY || 200
    this.width = options.width || 300
    this.height = options.height || 200
  }
  
  render() {
    // 创建 canvas
    const canvas = document.createElement('canvas')
    canvas.width = this.width
    canvas.height = this.height
    
    const ctx = canvas.getContext('2d')
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = this.color
    ctx.font = `${this.fontSize}px sans-serif`
    
    // 旋转绘制
    ctx.translate(this.width / 2, this.height / 2)
    ctx.rotate((this.rotate * Math.PI) / 180)
    ctx.fillText(this.text, 0, 0)
    
    // 转换为背景图
    const dataUrl = canvas.toDataURL()
    this.applyWatermark(dataUrl)
  }
  
  applyWatermark(dataUrl) {
    const watermarkDiv = document.createElement('div')
    watermarkDiv.className = 'watermark-container'
    watermarkDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      background-image: url(${dataUrl});
      background-repeat: repeat;
    `
    
    this.container.appendChild(watermarkDiv)
    this.watermarkElement = watermarkDiv
  }
  
  destroy() {
    if (this.watermarkElement) {
      this.watermarkElement.remove()
    }
  }
}

// 使用
const watermark = new Watermark({
  text: '409350-徐誉雄',
  color: 'rgba(200, 0, 0, 0.15)',
  fontSize: 14,
  rotate: -25
})
watermark.render()
```

**方案二：防删除水印（MutationObserver）**

```javascript
class SecureWatermark extends Watermark {
  constructor(options) {
    super(options)
    this.observer = null
  }
  
  applyWatermark(dataUrl) {
    // 使用 Shadow DOM 隔离
    const host = document.createElement('div')
    host.className = 'watermark-host'
    host.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;'
    
    const shadow = host.attachShadow({ mode: 'open' })
    const container = document.createElement('div')
    container.style.cssText = `
      width: 100%;
      height: 100%;
      background-image: url(${dataUrl});
      background-repeat: repeat;
    `
    shadow.appendChild(container)
    
    this.container.appendChild(host)
    this.watermarkElement = host
    
    // 监听水印被删除
    this.setupObserver()
  }
  
  setupObserver() {
    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const removedNode of mutation.removedNodes) {
          if (removedNode === this.watermarkElement) {
            // 水印被删除，立即恢复
            this.container.appendChild(this.watermarkElement)
            console.warn('水印被尝试删除，已恢复')
          }
        }
      }
    })
    
    this.observer.observe(this.container, {
      childList: true,
      subtree: true
    })
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect()
    }
    super.destroy()
  }
}

// 使用
const secureWatermark = new SecureWatermark({
  text: '机密资料',
  color: 'rgba(255, 0, 0, 0.1)'
})
secureWatermark.render()
```

**方案三：SVG 水印（更清晰）**

```javascript
function createSvgWatermark(text) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', '300')
  svg.setAttribute('height', '200')
  
  const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  textEl.setAttribute('x', '150')
  textEl.setAttribute('y', '100')
  textEl.setAttribute('text-anchor', 'middle')
  textEl.setAttribute('fill', 'rgba(0,0,0,0.1)')
  textEl.setAttribute('font-size', '16')
  textEl.setAttribute('transform', 'rotate(-30 150 100)')
  textEl.textContent = text
  
  svg.appendChild(textEl)
  
  const dataUrl = 'data:image/svg+xml;base64,' + btoa(new XMLSerializer().serializeToString(svg))
  return dataUrl
}

// 使用
const svgWatermarkUrl = createSvgWatermark('内部资料')
```

**应用场景：**

- 后台管理系统防截图
- 敏感数据展示
- 文档预览页面
- 设计稿评审

**知识点：** `Canvas` `MutationObserver` `Shadow DOM` `水印` `防删除`

:::

---

### Q19: 如何实现一个虚拟键盘组件？

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**虚拟键盘组件实现：**

```html
<input type="text" id="input" placeholder="点击输入" readonly />
<div id="keyboard" class="virtual-keyboard"></div>

<script>
class VirtualKeyboard {
  constructor(options = {}) {
    this.target = typeof options.target === 'string' 
      ? document.querySelector(options.target) 
      : options.target
    this.onInput = options.onInput || (() => {})
    this.layout = options.layout || 'default'
    this.init()
  }
  
  init() {
    this.render()
    this.bindEvents()
  }
  
  render() {
    const layouts = {
      default: [
        ['Q','W','E','R','T','Y','U','I','O','P'],
        ['A','S','D','F','G','H','J','K','L'],
        ['Z','X','C','V','B','N','M'],
        ['123', 'space', 'delete']
      ],
      number: [
        ['1','2','3','4','5','6','7','8','9','0'],
        ['-','/','@','.'],
        ['done']
      ]
    }
    
    const layout = layouts[this.layout]
    const html = layout.map(row => 
      `<div class="keyboard-row">
        ${row.map(key => this.renderKey(key)).join('')}
      </div>`
    ).join('')
    
    this.keyboard = document.createElement('div')
    this.keyboard.className = 'virtual-keyboard'
    this.keyboard.innerHTML = html
    document.body.appendChild(this.keyboard)
  }
  
  renderKey(key) {
    const specialKeys = {
      'space': '␣',
      'delete': '⌫',
      'done': '完成',
      '123': '123'
    }
    
    const label = specialKeys[key] || key
    const className = `key ${key === 'space' ? 'key-space' : ''} ${key === 'delete' ? 'key-delete' : ''}`
    
    return `<button class="${className}" data-key="${key}">${label}</button>`
  }
  
  bindEvents() {
    this.keyboard.addEventListener('click', (e) => {
      const key = e.target.closest('button')?.dataset.key
      if (!key) return
      
      this.handleKeyPress(key)
    })
    
    // 长按删除键快速删除
    let deleteInterval
    this.keyboard.addEventListener('mousedown', (e) => {
      if (e.target.dataset.key === 'delete') {
        deleteInterval = setInterval(() => {
          this.handleKeyPress('delete')
        }, 100)
      }
    })
    
    this.keyboard.addEventListener('mouseup', () => {
      clearInterval(deleteInterval)
    })
  }
  
  handleKeyPress(key) {
    let value = this.target.value
    
    if (key === 'space') {
      value += ' '
    } else if (key === 'delete') {
      value = value.slice(0, -1)
    } else if (key === 'done') {
      this.hide()
      return
    } else if (key === '123') {
      this.layout = this.layout === 'default' ? 'number' : 'default'
      this.render()
      this.bindEvents()
      return
    } else {
      value += key.toLowerCase()
    }
    
    this.target.value = value
    this.onInput(value, key)
    
    // 光标定位
    this.target.focus()
    this.target.setSelectionRange(value.length, value.length)
  }
  
  show() {
    this.keyboard.classList.add('visible')
  }
  
  hide() {
    this.keyboard.classList.remove('visible')
  }
  
  toggle() {
    this.keyboard.classList.toggle('visible')
  }
}

// 使用
const keyboard = new VirtualKeyboard({
  target: '#input',
  onInput: (value, key) => {
    console.log('输入:', value, key)
  }
})

// 点击输入框显示键盘
document.getElementById('input').addEventListener('focus', () => {
  keyboard.show()
})
</script>

<style>
.virtual-keyboard {
  position: fixed;
  bottom: -100%;
  left: 0;
  width: 100%;
  background: #f0f0f0;
  padding: 10px;
  transition: bottom 0.3s;
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

.virtual-keyboard.visible {
  bottom: 0;
}

.keyboard-row {
  display: flex;
  justify-content: center;
  margin-bottom: 8px;
}

.key {
  min-width: 40px;
  height: 45px;
  margin: 0 3px;
  border: none;
  border-radius: 5px;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
  font-size: 16px;
  font-weight: bold;
}

.key:active {
  background: #ddd;
}

.key-space {
  min-width: 150px;
}

.key-delete {
  min-width: 60px;
  background: #ff6b6b;
  color: white;
}
</style>
```

**中文输入法兼容：**

```javascript
// 对于中文输入，使用组合事件
class ZhVirtualKeyboard extends VirtualKeyboard {
  constructor(options) {
    super(options)
    this.composing = false
    this.compositionText = ''
  }
  
  bindEvents() {
    super.bindEvents()
    
    // 处理中文输入组合
    this.target.addEventListener('compositionstart', () => {
      this.composing = true
      this.compositionText = ''
    })
    
    this.target.addEventListener('compositionupdate', (e) => {
      this.compositionText = e.data
    })
    
    this.target.addEventListener('compositionend', (e) => {
      this.composing = false
      this.compositionText = ''
      this.onInput(this.target.value, 'composition')
    })
  }
  
  handleKeyPress(key) {
    // 中文输入过程中不处理
    if (this.composing) return
    
    super.handleKeyPress(key)
  }
}
```

**知识点：** `虚拟键盘` `输入法兼容` `composition 事件` `光标定位`

:::

---