---
title: AI 流式渲染与 SSE
description: SSE原理、流式输出、打字机效果、ReadableStream解析等AI前端核心面试题
---

# AI 流式渲染与 SSE

## 面试题

### Q1: SSE 和 WebSocket 有什么区别？为什么 AI 聊天场景多采用 SSE？

> **🔥 中等 · AI前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 特性 | SSE (Server-Sent Events) | WebSocket |
|------|-------------------------|-----------|
| 通信方向 | 服务端→客户端（单向） | 双向 |
| 协议 | HTTP/1.1+ | WS 独立协议 |
| 数据格式 | 纯文本 | 文本/二进制 |
| 断线重连 | 自动（内置） | 需手动实现 |
| 浏览器支持 | 原生（除 IE） | 原生 |
| 代理/防火墙 | 友好（基于HTTP） | 可能被拦截 |
| 连接数限制 | 6个（HTTP/1.1） | 无限制 |

**AI 聊天选 SSE 的原因：**

1. **模型输出是单向的**：大模型生成 token 后推送给前端，不需要客户端主动发消息
2. **断线重连友好**：SSE 内置 `Last-Event-ID`，重连后可续传
3. **HTTP 协议兼容性好**：穿透代理、CDN、防火墙无障碍
4. **实现简单**：不需要 WebSocket 升级握手
5. **资源开销小**：不需要维持双向连接状态

```js
// SSE 客户端
const eventSource = new EventSource('/api/chat/stream?q=hello')
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  appendText(data.content) // 逐 token 追加
}
eventSource.onerror = () => eventSource.close()

// SSE 服务端（Node.js）
res.writeHead(200, {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive'
})
for await (const chunk of llmStream) {
  res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`)
}
res.write('data: [DONE]\n\n')
```

**知识点：** `SSE` `WebSocket` `流式输出` `Server-Sent Events` `单向通信`

:::

### Q2: 如何用 Fetch API 处理流式响应（ReadableStream）？

> **🔥 中等 · AI前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
async function fetchStream(prompt) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  })

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    // 解码二进制块为文本
    buffer += decoder.decode(value, { stream: true })

    // 按换行分割处理（SSE 格式）
    const lines = buffer.split('\n')
    buffer = lines.pop() || '' // 保留不完整的行

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data === '[DONE]') return
        try {
          const parsed = JSON.parse(data)
          appendContent(parsed.content)
        } catch {
          // 非 JSON 数据，直接追加
          appendContent(data)
        }
      }
    }
  }
}
```

**关键技术点：**
1. `response.body` 是 ReadableStream，使用 `getReader()` 逐块读取
2. `TextDecoder` 将 Uint8Array 转为字符串
3. 处理 **不完整数据块**：TCP 分包可能导致 JSON 被截断，需要 buffer 拼接
4. SSE 格式：`data: xxx\n\n`，需按行解析

**知识点：** `ReadableStream` `TextDecoder` `流式解析` `SSE格式` `TCP分包`

:::

### Q3: 如何实现 ChatGPT 风格的逐字打印（打字机）效果？

> **🔥 中等 · AI前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```jsx
function useStreamChat() {
  const [content, setContent] = useState('')
  const abortRef = useRef(null)

  const sendMessage = async (prompt) => {
    setContent('') // 清空之前内容
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: controller.signal
      })

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        // 逐步追加内容，形成打字机效果
        setContent(prev => prev + text)
      }
    } catch (err) {
      if (err.name !== 'AbortError') throw err
    }
  }

  const stopGeneration = () => abortRef.current?.abort()

  return { content, sendMessage, stopGeneration }
}

// 使用
function ChatBox() {
  const { content, sendMessage, stopGeneration } = useStreamChat()
  return (
    <div>
      <div className="markdown-body">{content}</div>
      <button onClick={() => stopGeneration()}>■ 停止生成</button>
    </div>
  )
}
```

**CSS 打字机光标效果：**

```css
.typing-cursor::after {
  content: '▋';
  animation: blink 1s step-end infinite;
  color: var(--vp-c-brand);
}
@keyframes blink {
  50% { opacity: 0; }
}
```

**关键点：** 每次 `setContent(prev => prev + text)` 触发 React 重新渲染，自然形成逐字效果。

**知识点：** `打字机效果` `流式渲染` `AbortController` `React Hook` `CSS动画`

:::

### Q4: 流式输出时如何解决页面布局抖动（Layout Shift）？

> **💀 困难 · AI前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**布局抖动原因：** 流式输出不断追加内容，导致页面高度变化，引发 CLS (Cumulative Layout Shift)。

**解决方案：**

1. **最小高度预留：**
```css
.chat-response {
  min-height: 100px;  /* 预留最小高度 */
}
```

2. **锚点滚动而非内容推移：**
```js
// 自动滚动到底部（非抖动）
function scrollToBottom() {
  const container = document.getElementById('chat-container')
  container.scrollTop = container.scrollHeight
}
```

3. **CSS contain 属性：**
```css
.message-item {
  contain: layout style;  /* 限制布局影响范围 */
}
```

4. **虚拟列表 + 异步渲染：**
```js
// 大文本异步渲染，避免一次性重排
function useStreamingRender(content) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)

  useEffect(() => {
    if (indexRef.current >= content.length) return
    const chunkSize = 5 // 每帧渲染5个字符
    const next = content.slice(0, indexRef.current + chunkSize)
    requestAnimationFrame(() => {
      setDisplayed(next)
      indexRef.current += chunkSize
    })
  }, [content])

  return displayed
}
```

5. **流式 Markdown 分段渲染：** 不等全部内容到齐再渲染，而是增量解析渲染。

**知识点：** `Layout Shift` `CLS` `contain` `虚拟列表` `增量渲染`

:::

### Q5: AI 聊天界面中自动滚动到底部，如何处理用户手动上滑的"夺权"问题？

> **🔥 中等 · AI前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

核心思路：检测用户是否在底部附近，是则自动滚动，否则不"夺权"。

```js
function useAutoScroll(containerRef) {
  const isAtBottomRef = useRef(true)
  const observerRef = useRef(null)

  // 检测是否在底部
  const checkIfAtBottom = () => {
    const el = containerRef.current
    if (!el) return
    // 距底部 100px 以内视为"在底部"
    const threshold = 100
    isAtBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  }

  // 监听滚动事件
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('scroll', checkIfAtBottom, { passive: true })
    return () => el.removeEventListener('scroll', checkIfAtBottom)
  }, [])

  // 自动滚动（仅当用户在底部时）
  const scrollToBottom = useCallback((smooth = true) => {
    if (!isAtBottomRef.current) return  // 用户不在底部，不夺权
    const el = containerRef.current
    if (!el) return
    el.scrollTo({
      top: el.scrollHeight,
      behavior: smooth ? 'smooth' : 'instant'
    })
  }, [])

  // 用户点击"回到底部"按钮
  const forceScrollToBottom = () => {
    isAtBottomRef.current = true
    scrollToBottom()
  }

  return { scrollToBottom, forceScrollToBottom, isAtBottom: isAtBottomRef }
}
```

**UX 增强：** 当用户上滑时，显示"↓ 回到最新"悬浮按钮。

**知识点：** `自动滚动` `夺权问题` `滚动检测` `用户体验`

:::

### Q6: CSS 中 `white-space: pre-wrap` 和 `word-break: break-all` 在 AI 文本展示中的作用？

> **⭐ 简单 · AI前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```css
.ai-response {
  white-space: pre-wrap;    /* 保留换行和空格，自动换行 */
  word-break: break-word;   /* 长单词在词内断行 */
}
```

| 属性 | 作用 | AI 场景意义 |
|------|------|-------------|
| `pre-wrap` | 保留空白+自动换行 | 保留 Markdown 中的换行和缩进 |
| `break-all` | 允许任意位置断行 | 防止长 URL/代码溢出容器 |
| `break-word` | 优先词边界断行 | 比 break-all 更美观 |
| `overflow-wrap: anywhere` | 任意位置允许断行 | 长英文/代码不溢出 |

**AI 场景常见问题：**
- 代码块内容超宽 → `overflow-x: auto` + `pre`
- 中文不自换行 → `word-break: break-all`
- 连续空格被合并 → `white-space: pre-wrap`
- 长链接溢出 → `overflow-wrap: anywhere`

**知识点：** `white-space` `word-break` `pre-wrap` `文本换行`

:::

### Q7: 如何实现 AI 生成的长文本 Markdown 高性能实时渲染？

> **💀 困难 · AI前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**挑战：** 流式输出时 Markdown 内容不完整，频繁全量解析渲染性能差。

**方案：增量 Markdown 渲染**

```js
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkReact from 'remark-react'

// 方案1: 防抖渲染（简单）
function useMarkdownRender(content, delay = 50) {
  const [html, setHtml] = useState('')
  const timerRef = useRef(null)

  useEffect(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setHtml(renderMarkdown(content))
    }, delay)
    return () => clearTimeout(timerRef.current)
  }, [content, delay])

  return html
}

// 方案2: 增量渲染（高性能）
function StreamingMarkdown({ content }) {
  // 将内容分为"已稳定"和"流式中"两部分
  const stableContent = useMemo(() => {
    // 找到最后一个完整块（双换行符分割）
    const lastCompleteBlock = content.lastIndexOf('\n\n')
    return lastCompleteBlock > 0 ? content.slice(0, lastCompleteBlock) : ''
  }, [content])

  const streamingContent = useMemo(() => {
    const lastCompleteBlock = content.lastIndexOf('\n\n')
    return lastCompleteBlock > 0 ? content.slice(lastCompleteBlock) : content
  }, [content])

  return (
    <div>
      {/* 已稳定内容：只渲染一次 */}
      <MemoizedMarkdown content={stableContent} />
      {/* 流式中内容：频繁更新但体量小 */}
      <StreamingBlock content={streamingContent} />
    </div>
  )
}

// 代码高亮用 Web Worker 异步处理
const worker = new Worker('highlight-worker.js')
worker.postMessage({ code, language })
worker.onmessage = (e) => setHighlightedCode(e.data)
```

**方案3: 虚拟化 Markdown（超长文本）：** 只渲染可视区域的 Markdown 块。

**知识点：** `Markdown渲染` `增量渲染` `防抖` `代码高亮` `Web Worker`

:::

### Q8: 如何处理流式 Markdown 中的代码块高亮和一键复制？

> **🔥 中等 · AI前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**代码块高亮的挑战：** 流式输出时代码块可能不完整（缺少闭合 ``` ）。

```js
// 检测代码块是否完整
function isCodeBlockComplete(content) {
  const codeBlockCount = (content.match(/```/g) || []).length
  return codeBlockCount % 2 === 0 // 偶数个 ``` 表示完整
}

// 流式 Markdown 渲染组件
function StreamingCodeBlock({ content }) {
  const isComplete = isCodeBlockComplete(content)

  // 不完整时用灰色背景占位
  if (!isComplete) {
    return <pre className="code-streaming"><code>{content}</code></pre>
  }

  // 完整后高亮渲染
  return <HighlightedCode code={content} language={language} />
}
```

**一键复制实现：**

```js
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  }

  return (
    <button onClick={handleCopy}>
      {copied ? '✓ 已复制' : '复制'}
    </button>
  )
}
```

**知识点：** `代码高亮` `代码块完整性` `一键复制` `clipboard API`

:::

### Q9: React useEffect 的闭包陷阱在 AI 流式返回中如何避免？

> **🔥 中等 · AI前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**闭包陷阱：** useEffect 中引用的 state 是创建时的快照，不是最新值。

```js
// ❌ 闭包陷阱：每次 append 拿到的 content 都是初始值
useEffect(() => {
  const ws = new WebSocket(url)
  ws.onmessage = (e) => {
    setContent(content + e.data) // content 永远是初始空字符串
  }
}, []) // content 不在依赖数组中

// ✅ 解决方案1: 使用函数式更新
useEffect(() => {
  const ws = new WebSocket(url)
  ws.onmessage = (e) => {
    setContent(prev => prev + e.data) // prev 始终是最新的
  }
}, [])

// ✅ 解决方案2: useRef 保存最新值
const contentRef = useRef('')
useEffect(() => {
  const ws = new WebSocket(url)
  ws.onmessage = (e) => {
    contentRef.current += e.data
    setContent(contentRef.current)
  }
}, [])

// ✅ 解决方案3: 使用 useReducer
const [content, dispatch] = useReducer((state, action) => {
  return action.type === 'append' ? state + action.payload : state
}, '')

useEffect(() => {
  const ws = new WebSocket(url)
  ws.onmessage = (e) => {
    dispatch({ type: 'append', payload: e.data })
  }
}, [])
```

**最佳实践：** 流式追加场景优先用 `setContent(prev => prev + data)` 函数式更新。

**知识点：** `闭包陷阱` `函数式更新` `useRef` `useReducer` `流式数据`

:::
### Q10: AI 对话的流式响应实现方案？

> **🔥 中等 · AI 应用**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**流式响应原理：**

```
服务端：LLM 生成 token → 实时推送
客户端：接收 chunk → 增量渲染
```

**方案一：Server-Sent Events (SSE)**

```js
// 服务端 (Express)
app.post('/chat', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  
  const stream = await llm.chat({ stream: true })
  
  for await (const chunk of stream) {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`)
  }
  
  res.write('data: [DONE]\n\n')
  res.end()
})

// 客户端
const eventSource = new EventSource('/chat')

eventSource.onmessage = (e) => {
  if (e.data === '[DONE]') {
    eventSource.close()
    return
  }
  const chunk = JSON.parse(e.data)
  appendContent(chunk.content)
}
```

**方案二：Fetch + ReadableStream**

```js
// 客户端
async function streamChat(messages) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, stream: true })
  })
  
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    
    const chunk = decoder.decode(value)
    // 解析 SSE 格式
    const lines = chunk.split('\n')
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6)
        if (data !== '[DONE]') {
          appendContent(JSON.parse(data).content)
        }
      }
    }
  }
}
```

**方案三：WebSocket（双向通信）**

```js
// 客户端
const ws = new WebSocket('ws://localhost:3000/chat')

ws.onopen = () => {
  ws.send(JSON.stringify({ messages, action: 'chat' }))
}

ws.onmessage = (e) => {
  const chunk = JSON.parse(e.data)
  appendContent(chunk.content)
}

// 服务端 (ws 库)
wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    const { messages } = JSON.parse(data)
    const stream = await llm.chat({ messages, stream: true })
    
    for await (const chunk of stream) {
      ws.send(JSON.stringify(chunk))
    }
  })
})
```

**React 实现：**

```jsx
function ChatBox() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const sendMessage = async (message) => {
    setIsLoading(true)
    setContent('')
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: [{ role: 'user', content: message }] })
      })
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            const data = JSON.parse(line.slice(6))
            setContent(prev => prev + data.content)
          }
        }
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div>
      <div className="content">{content}</div>
      <button onClick={() => sendMessage('你好')} disabled={isLoading}>
        {isLoading ? '生成中...' : '发送'}
      </button>
    </div>
  )
}
```

**打字机效果优化：**

```js
// 平滑渲染，避免跳动
function Typewriter({ text }) {
  const [display, setDisplay] = useState('')
  const index = useRef(0)
  
  useEffect(() => {
    if (index.current < text.length) {
      const timer = setTimeout(() => {
        setDisplay(prev => prev + text[index.current])
        index.current++
      }, 30)
      return () => clearTimeout(timer)
    }
  }, [text])
  
  return <div>{display}</div>
}
```

**知识点：** `流式响应` `SSE` `WebSocket` `ReadableStream` `渐进式渲染`

:::

### Q11: 前端实现 Markdown 实时渲染？

> **🔥 中等 · AI 应用**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**方案一：marked.js (轻量)**

```js
import { marked } from 'marked'

// 基础使用
const html = marked.parse('# Hello\n\n**World**')

// React 组件
function Markdown({ content }) {
  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: marked.parse(content || '') 
      }}
    />
  )
}

//  configs
marked.setOptions({
  breaks: true,        // GFM 换行
  gfm: true,           // GitHub 风格
  headerIds: false,    // 不生成 id
  mangle: false        // 不转义邮箱
})
```

**方案二：markdown-it (功能强)**

```js
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

// 插件扩展
import markdownItHighlight from 'markdown-it-highlightjs'
md.use(markdownItHighlight)

// 自定义规则
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
  tokens[idx].attrPush(['target', '_blank'])
  tokens[idx].attrPush(['rel', 'noopener noreferrer'])
  return self.renderToken(tokens, idx, options)
}

const html = md.render(content)
```

**方案三：react-markdown (React 原生)**

```jsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

function Markdown({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        code({node, className, children, ...props}) {
          // 自定义代码块
          return (
            <code className={className} {...props}>
              {children}
            </code>
          )
        },
        a({node, ...props}) {
          return <a target="_blank" rel="noopener" {...props} />
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
```

**代码高亮：**

```js
// 使用 highlight.js
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  }
})
```

**流式 Markdown 渲染：**

```jsx
function StreamingMarkdown() {
  const [content, setContent] = useState('')
  
  useEffect(() => {
    // 接收流式数据
    const eventSource = new EventSource('/api/chat')
    
    eventSource.onmessage = (e) => {
      const chunk = JSON.parse(e.data)
      setContent(prev => prev + chunk.content)
    }
    
    return () => eventSource.close()
  }, [])
  
  return <Markdown content={content} />
}
```

**安全考虑：**

```js
// XSS 防护 - 使用 DOMPurify
import DOMPurify from 'isomorphic-dompurify'

const cleanHtml = DOMPurify.sanitize(marked.parse(content))

// 或者使用 react-markdown（默认安全）
```

**性能优化：**

```jsx
// 使用 useMemo 缓存
function Markdown({ content }) {
  const html = useMemo(() => {
    return marked.parse(content)
  }, [content])
  
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

// 或使用 Web Worker 解析大文档
```

**知识点：** `Markdown 渲染` `marked` `markdown-it` `react-markdown` `代码高亮` `XSS 防护`

:::

### Q12: AI 前端应用的状态管理挑战？

> **🔥 中等 · AI 应用**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**AI 应用特有状态：**

```
1. 对话历史状态
   - messages: {role, content, timestamp, id}[]
   - 需要支持编辑、删除、重命名

2. 流式响应状态
   - 当前生成内容
   - 生成状态 (idle/streaming/error)
   - 可中断标志

3. Token 使用状态
   - 已用 token 数
   - 剩余配额
   - 费用估算

4. 模型状态
   - 模型选择
   - 温度/参数配置
   - 系统提示词

5. 知识库状态（RAG）
   - 上传的文档
   - 向量索引状态
   - 检索结果
```

**状态管理挑战：**

```js
// 挑战 1：流式更新
const [messages, setMessages] = useState([])

// ❌ 问题：流式内容频繁更新导致重渲染
messages.push({ role: 'assistant', content: streamingContent })

// ✅ 解决：分离流式状态
const [streamingId, setStreamingId] = useState(null)
const [streamingContent, setStreamingContent] = useState('')

// 渲染时合并
const displayedMessages = [
  ...messages,
  streamingId && { id: streamingId, content: streamingContent }
]
```

```js
// 挑战 2：乐观更新
async function sendMessage(content) {
  const tempId = nanoid()
  
  // 1. 乐观添加用户消息
  setMessages(prev => [...prev, {
    id: tempId,
    role: 'user',
    content
  }])
  
  try {
    // 2. 请求 API
    await api.chat(content)
  } catch {
    // 3. 失败回滚
    setMessages(prev => prev.filter(m => m.id !== tempId))
    showError('发送失败')
  }
}
```

```js
// 挑战 3：大状态 performance
// 方案：useMemo + React.memo
const MessageList = React.memo(({ messages }) => {
  return (
    <div>
      {messages.map(m => (
        <Message key={m.id} message={m} />
      ))}
    </div>
  )
}, (prev, next) => {
  // 自定义比较，避免不必要重渲染
  return prev.messages.length === next.messages.length
})
```

```js
// 挑战 4：状态持久化
useEffect(() => {
  // 保存到 localStorage
  localStorage.setItem('chat-history', JSON.stringify(messages))
}, [messages])

// 复杂场景用 Zustand/Redux
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useChatStore = create(
  persist(
    (set) => ({
      messages: [],
      addMessage: (msg) => set(s => ({ messages: [...s.messages, msg] })),
      clearHistory: () => set({ messages: [] })
    }),
    { name: 'chat-storage' }
  )
)
```

**推荐方案：**

| 场景 | 推荐 | 原因 |
|------|------|------|
| 简单对话 | useState/useReducer | 轻量 |
| 多标签对话 | Zustand | 简洁 + 持久化 |
| 企业级应用 | Redux Toolkit | 可维护性 |
| 实时协作 | Jotai/Recoil | 原子化状态 |

**知识点：** `状态管理` `流式更新` `乐观更新` `Zustand` `AI 应用`

:::
