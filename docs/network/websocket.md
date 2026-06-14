---
title: WebSocket
description: WebSocket协议、握手、通信模式、安全、性能优化等核心面试题
---

# WebSocket

WebSocket 是一种全双工通信协议，适用于实时推送、聊天、游戏等场景。

---

### Q1: WebSocket 协议握手过程是怎样的？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

WebSocket 握手基于 HTTP Upgrade 机制，一次握手即可升级为长连接。

```text
客户端请求：
GET /ws HTTP/1.1
Host: example.com
Upgrade: websocket                    ← 声明升级协议
Connection: Upgrade                   ← 声明升级连接
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==  ← 随机Base64编码（16字节）
Sec-WebSocket-Version: 13             ← 协议版本

服务器响应：
HTTP/1.1 101 Switching Protocols      ← 101表示协议切换
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=  ← 验证Key
```

**Sec-WebSocket-Accept 计算方式：**

```js
// 服务端将客户端Key + 固定GUID做SHA-1哈希
const crypto = require('crypto')
const key = 'dGhlIHNhbXBsZSBub25jZQ=='
const guid = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
const accept = crypto.createHash('sha1')
  .update(key + guid)
  .digest('base64')
// s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

**握手流程：**

```text
1. 客户端发起HTTP请求，携带Upgrade头
2. 服务端验证WebSocket Key
3. 服务端返回101 Switching Protocols
4. TCP连接升级为WebSocket连接
5. 后续通信使用WebSocket帧格式

总耗时：1个RTT（已有TCP连接后）
```

**握手失败场景：**

| 场景 | 服务端响应 | 原因 |
|------|-----------|------|
| 版本不支持 | 400 Bad Request | Sec-WebSocket-Version不匹配 |
| Key无效 | 400 Bad Request | Sec-WebSocket-Key格式错误 |
| 子协议不匹配 | 400 Bad Request | 无法协商子协议 |
| Origin拒绝 | 403 Forbidden | 跨域策略限制 |

**知识点：** `WebSocket握手` `HTTP Upgrade` `Sec-WebSocket-Key` `101`

:::

### Q2: WebSocket 和 HTTP 长轮询的区别？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 维度 | WebSocket | 长轮询(Long Polling) | 短轮询(Short Polling) |
|------|-----------|---------------------|---------------------|
| 通信方式 | 全双工 | 半双工 | 半双工 |
| 连接 | 持久连接 | 反复建立连接 | 反复建立连接 |
| 延迟 | 极低(~ms) | 中等(秒级) | 高(取决于轮询间隔) |
| 服务器推送 | ✅ 主动推送 | ⚠️ 伪推送(挂起请求) | ❌ 客户端拉取 |
| 头部开销 | 仅握手时 | 每次请求完整HTTP头 | 每次请求完整HTTP头 |
| 连接数 | 1个 | 1个(挂起)+新请求 | 1个(反复) |
| 浏览器支持 | IE10+ | 所有 | 所有 |
| 代理/防火墙 | 可能被拦截 | 无问题 | 无问题 |

```text
短轮询流程：
Client → GET /api/data → Server
Client ← 200 (无数据)  ← Server
... 5秒后 ...
Client → GET /api/data → Server
Client ← 200 (有数据)  ← Server

长轮询流程：
Client → GET /api/data → Server
Client ... 等待 ...       Server（有数据才返回）
Client ← 200 (有数据)  ← Server
Client → GET /api/data → Server（立即发起新请求）

WebSocket流程：
Client → Upgrade: websocket → Server
Client ← 101 Switching       ← Server
Client ← data ← Server（随时推送）
Client → data → Server（随时发送）
```

**选择建议：**

```text
用 WebSocket：
- 聊天/即时通讯
- 多人游戏
- 实时协作（文档/白板）
- 股票行情
- 高频数据推送

用 SSE（Server-Sent Events）：
- 只需服务端推送（单向）
- 通知/告警
- 实时日志

用 长轮询：
- WebSocket不可用的降级方案
- 兼容老浏览器
- 推送频率很低
```

**知识点：** `WebSocket` `长轮询` `短轮询` `实时通信` `全双工`

:::

### Q3: SSE 和 WebSocket 的区别？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**SSE (Server-Sent Events)** 是基于 HTTP 的单向服务端推送技术。

| 维度 | SSE | WebSocket |
|------|-----|-----------|
| 通信方向 | 单向（服务端→客户端） | 双向 |
| 协议 | HTTP | ws/wss 独立协议 |
| 数据格式 | 文本（UTF-8） | 文本+二进制 |
| 重连 | 浏览器自动重连 | 需手动实现 |
| 事件ID | 支持(Last-Event-ID) | 无内置机制 |
| 连接数限制 | 6个(同域HTTP限制) | 无限制 |
| 浏览器支持 | IE不支持 | IE10+ |
| 复杂度 | 简单 | 较复杂 |

```js
// SSE 使用（极简）
const sse = new EventSource('/api/stream')

sse.onmessage = (event) => {
  console.log(event.data)
}

// SSE 自定义事件
sse.addEventListener('notification', (event) => {
  console.log(event.data)
})

// 服务端（Node.js）
res.writeHead(200, {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive'
})
res.write('data: Hello\n\n')                          // 简单消息
res.write('event: notification\ndata: New msg\n\n')   // 自定义事件
res.write('id: 123\ndata: With ID\n\n')               // 带ID（断线重连续传）
```

```js
// WebSocket 使用
const ws = new WebSocket('wss://example.com/ws')

ws.onmessage = (event) => {
  console.log(event.data)
}

// 双向通信
ws.send('Hello')  // 客户端也能发
```

**SSE 适用场景：**
- 实时通知、消息推送
- 股票行情（只看不需要发）
- 实时日志流
- ChatGPT 流式输出（SSE）

**知识点：** `SSE` `WebSocket` `服务端推送` `EventSource` `单向通信`

:::

### Q4: WebSocket 心跳机制如何实现？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

心跳用于检测连接是否存活，防止连接被代理/防火墙静默断开。

**协议层 Ping/Pong：**

```js
// 服务端
const { WebSocketServer } = require('ws')
const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws) => {
  // 30秒无消息则发Ping
  ws.isAlive = true
  ws.on('pong', () => { ws.isAlive = true })

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate()
      ws.isAlive = false
      ws.ping()  // 协议层Ping
    })
  }, 30000)

  ws.on('close', () => clearInterval(interval))
})
```

**应用层心跳（更可控）：**

```js
class WebSocketClient {
  constructor(url) {
    this.url = url
    this.heartbeatInterval = 30000  // 30秒
    this.timeoutInterval = 10000    // 10秒超时
    this.connect()
  }

  connect() {
    this.ws = new WebSocket(this.url)
    
    this.ws.onopen = () => {
      this.startHeartbeat()
    }

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === 'pong') {
        this.resetHeartbeat()
        return
      }
      // 处理业务消息
    }

    this.ws.onclose = () => {
      this.stopHeartbeat()
      this.reconnect()
    }
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }))
        // 启动超时检测
        this.timeoutTimer = setTimeout(() => {
          console.log('心跳超时，关闭连接')
          this.ws.close()
        }, this.timeoutInterval)
      }
    }, this.heartbeatInterval)
  }

  resetHeartbeat() {
    clearTimeout(this.timeoutTimer)
  }

  stopHeartbeat() {
    clearInterval(this.heartbeatTimer)
    clearTimeout(this.timeoutTimer)
  }
}
```

**心跳参数调优：**

| 场景 | 心跳间隔 | 超时时间 | 说明 |
|------|---------|---------|------|
| 高频通信 | 60s | 10s | 消息本身就保活 |
| 普通场景 | 30s | 10s | 默认推荐 |
| 低频通信 | 15s | 5s | 需要更频繁检测 |
| 移动端 | 20s | 8s | 网络不稳定需快速检测 |

**知识点：** `WebSocket` `心跳` `Ping/Pong` `连接保活` `超时检测`

:::

### Q5: WebSocket 断线重连如何实现？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

断线重连需考虑退避策略、最大重试、消息补偿等问题。

**指数退避重连：**

```js
class ReconnectWebSocket {
  constructor(url, options = {}) {
    this.url = url
    this.maxRetries = options.maxRetries ?? Infinity
    this.maxDelay = options.maxDelay ?? 30000  // 最大延迟30s
    this.baseDelay = options.baseDelay ?? 1000  // 基础延迟1s
    this.retries = 0
    this.readyState = 'disconnected'
    this.messageQueue = []  // 离线消息队列
    
    this.connect()
  }

  connect() {
    this.ws = new WebSocket(this.url)
    
    this.ws.onopen = () => {
      this.retries = 0
      this.readyState = 'connected'
      this.flushQueue()  // 发送离线期间缓存的消息
      this.onOpen?.()
    }

    this.ws.onmessage = (event) => {
      this.onMessage?.(event.data)
    }

    this.ws.onclose = (event) => {
      this.readyState = 'disconnected'
      this.onClose?.(event)
      if (!event.wasClean) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = (error) => {
      this.onError?.(error)
    }
  }

  scheduleReconnect() {
    if (this.retries >= this.maxRetries) {
      this.readyState = 'failed'
      this.onFailed?.()
      return
    }

    // 指数退避 + 随机抖动
    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.retries) + Math.random() * 1000,
      this.maxDelay
    )
    this.retries++
    
    console.log(`${this.retries}次重连，${Math.round(delay/1000)}秒后...`)
    this.reconnectTimer = setTimeout(() => this.connect(), delay)
  }

  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(data)
    } else {
      this.messageQueue.push(data)  // 离线缓存
    }
  }

  flushQueue() {
    while (this.messageQueue.length > 0) {
      this.ws.send(this.messageQueue.shift())
    }
  }

  close() {
    clearTimeout(this.reconnectTimer)
    this.ws?.close(1000, 'Normal closure')
  }
}
```

**重连策略对比：**

| 策略 | 延迟计算 | 优点 | 缺点 |
|------|---------|------|------|
| 固定间隔 | `delay = 3000` | 简单 | 服务器恢复瞬间大量连接 |
| 线性退避 | `delay = retries * 1000` | 逐步减少压力 | 恢复较慢 |
| 指数退避 | `delay = 2^retries * 1000` | 快速收敛 | 可能等待过久 |
| 指数+抖动 | `2^retries * 1000 + random` | ✅ 最佳实践 | 实现稍复杂 |

**断线期间的通信补偿：**

```text
1. 离线消息队列：客户端缓存待发消息，重连后发送
2. 消息序号：服务端为消息编号，重连后请求缺失消息
3. 增量同步：重连后发送最后收到的消息ID，获取增量
```

**知识点：** `WebSocket` `断线重连` `指数退避` `消息补偿` `离线队列`

:::

### Q6: WebSocket 安全注意事项有哪些？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. 传输加密 — 使用 wss://**

```text
ws://  → 明文传输，中间人可窃听
wss:// → TLS加密，安全传输（必须）
```

**2. Origin 验证防 CSRF**

```js
// 服务端验证 Origin
wss.on('connection', (ws, req) => {
  const origin = req.headers.origin
  const allowedOrigins = ['https://example.com', 'https://app.example.com']
  
  if (!allowedOrigins.includes(origin)) {
    ws.close(1008, 'Origin not allowed')  // 1008 = Policy Violation
    return
  }
})
```

**3. 认证与授权**

```js
// WebSocket 不支持自定义 Header！
// 认证方案：
// 方案1: Cookie（握手时自动携带）
const ws = new WebSocket('wss://example.com/ws')  // 同域自动带Cookie

// 方案2: URL参数传递Token（Token会出现在日志，不推荐）
const ws = new WebSocket(`wss://example.com/ws?token=${token}`)

// 方案3: 连接后首条消息认证（推荐）
ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'auth', token }))
}

// 服务端验证
wss.on('connection', (ws, req) => {
  ws.isAuthed = false
  
  ws.on('message', (data) => {
    const msg = JSON.parse(data)
    
    if (!ws.isAuthed) {
      if (msg.type === 'auth' && verifyToken(msg.token)) {
        ws.isAuthed = true
        ws.userId = decodeToken(msg.token).userId
      } else {
        ws.close(1008, 'Unauthorized')
      }
      return
    }
    
    // 处理业务消息
  })
  
  // 超时未认证断开
  setTimeout(() => {
    if (!ws.isAuthed) ws.close(1008, 'Auth timeout')
  }, 5000)
})
```

**4. 输入校验防注入**

```js
ws.on('message', (data) => {
  // ✅ 严格校验消息格式
  let msg
  try {
    msg = JSON.parse(data)
  } catch {
    return ws.close(1007, 'Invalid message format')
  }
  
  // ✅ 校验消息类型白名单
  const allowedTypes = ['chat', 'ping', 'subscribe']
  if (!allowedTypes.includes(msg.type)) return
  
  // ✅ 校验消息大小
  if (data.length > 65536) {
    return ws.close(1009, 'Message too large')
  }
  
  // ✅ 防XSS — 不信任任何客户端输入
  const sanitized = escapeHtml(msg.content)
})
```

**5. 限流防 DDoS**

```js
// 连接数限制
const MAX_CONNECTIONS_PER_IP = 10
const ipCounts = new Map()

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress
  const count = (ipCounts.get(ip) || 0) + 1
  
  if (count > MAX_CONNECTIONS_PER_IP) {
    ws.close(1008, 'Too many connections')
    return
  }
  ipCounts.set(ip, count)
})

// 消息频率限制
const messageRates = new Map()
ws.on('message', () => {
  const now = Date.now()
  const lastMsg = messageRates.get(ws) || 0
  if (now - lastMsg < 100) {  // 100ms内只能发1条
    return ws.close(1008, 'Rate limit exceeded')
  }
  messageRates.set(ws, now)
})
```

**安全检查清单：**

| 检查项 | 措施 |
|--------|------|
| 传输加密 | wss:// |
| 跨域 | 验证 Origin |
| 认证 | Token/Cookie + 超时 |
| 输入校验 | 格式+大小+类型白名单 |
| 限流 | 连接数+消息频率 |
| 日志 | 不记录敏感Token |

**知识点：** `WebSocket安全` `wss` `Origin验证` `认证` `限流` `输入校验`

:::

### Q7: WebSocket 需要 Cookie 吗？为什么？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**默认不需要，但通常需要搭配 Cookie 实现认证。**

```text
WebSocket 连接建立过程：
1. 客户端发送 HTTP 升级请求（包含Cookie）
2. 服务端验证身份，返回101 Switching Protocols
3. 连接升级为WebSocket，后续通信不再自动携带Cookie
```

```js
// WebSocket 握手时会自动携带同域 Cookie
const ws = new WebSocket('wss://example.com/ws')
// 等同于：
// GET /ws HTTP/1.1
// Upgrade: websocket
// Cookie: session_id=xxx  ← 握手时自动携带

// 跨域时默认不携带Cookie

// ❌ WebSocket API 没有自定义Header的能力
// ws.setRequestHeader('Authorization', 'Bearer xxx')  // 不存在！

// ✅ 替代方案1：通过URL参数传递Token
const token = localStorage.getItem('token')
const ws = new WebSocket(`wss://example.com/ws?token=${token}`)

// ✅ 替代方案2：依赖握手时的Cookie认证
// 服务端在握手阶段验证Cookie，建立连接后保持认证状态

// ✅ 替代方案3：连接后第一条消息发送认证信息
ws.onopen = () => {
  ws.send(JSON.stringify({ type: 'auth', token: 'xxx' }))
}
```

**Cookie vs Token 在 WebSocket 中：**

| 方式 | 优点 | 缺点 |
|------|------|------|
| Cookie | 握手时自动携带 | 跨域受限、CSRF风险 |
| URL参数 | 简单直接 | Token暴露在URL/日志中 |
| 首条消息 | 安全灵活 | 需额外处理未认证连接 |

**知识点：** `WebSocket` `Cookie` `认证` `Token` `握手`

:::

### Q8: WebSocket 怎么实现点对点通信和广播通信？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

WebSocket 本身是客户端-服务器通信，不能直接点对点。需要服务端中转：

```text
点对点通信：
ClientA → Server → ClientB
        路由转发

广播通信：
Server → ClientA
      → ClientB  
      → ClientC
      同一消息发给所有连接
```

**服务端实现（Node.js）：**

```js
const { WebSocketServer } = require('ws')
const wss = new WebSocketServer({ port: 8080 })

// 用户连接映射
const clients = new Map()  // userId → ws

wss.on('connection', (ws, req) => {
  const userId = getUserIdFromRequest(req)
  clients.set(userId, ws)

  ws.on('message', (data) => {
    const msg = JSON.parse(data)

    switch (msg.type) {
      // 点对点：发给指定用户
      case 'private':
        const target = clients.get(msg.to)
        if (target?.readyState === 1) {
          target.send(JSON.stringify({
            from: userId,
            content: msg.content
          }))
        }
        break

      // 广播：发给所有连接
      case 'broadcast':
        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({
              from: userId,
              content: msg.content
            }))
          }
        })
        break

      // 群组：发给指定房间
      case 'group':
        const room = rooms.get(msg.roomId)
        room?.members.forEach(memberId => {
          const member = clients.get(memberId)
          if (member?.readyState === 1 && memberId !== userId) {
            member.send(JSON.stringify({
              from: userId,
              room: msg.roomId,
              content: msg.content
            }))
          }
        })
        break
    }
  })

  ws.on('close', () => clients.delete(userId))
})
```

| 通信模式 | 实现方式 | 应用场景 |
|---------|---------|---------|
| 点对点 | 服务端根据to字段路由 | 私聊、通知 |
| 广播 | 遍历所有连接发送 | 系统公告 |
| 群组 | 维护房间成员列表 | 聊天室、协作 |

**知识点：** `WebSocket` `点对点通信` `广播` `群组` `消息路由`

:::

### Q9: WebSocket 消息质量 QoS 如何保证？

> **💀 困难 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

WebSocket 本身不保证消息可靠送达（类似UDP语义），需应用层实现QoS。

**三级 QoS 模型：**

| 级别 | 保证 | 适用场景 | 实现复杂度 |
|------|------|---------|-----------|
| QoS 0 | 至多一次 | 状态更新、位置同步 | 低 |
| QoS 1 | 至少一次 | 聊天消息、通知 | 中 |
| QoS 2 | 恰好一次 | 支付、关键操作 | 高 |

**QoS 1 实现 — ACK + 重传：**

```js
class ReliableWebSocket {
  constructor(url) {
    this.ws = new WebSocket(url)
    this.msgId = 0
    this.pending = new Map()  // msgId → { data, timer, retries }
    this.maxRetries = 3
    this.retryDelay = 2000
  }

  sendReliable(data, qos = 1) {
    const id = ++this.msgId
    const msg = { id, qos, data, timestamp: Date.now() }

    if (qos >= 1) {
      // 存储待确认消息
      this.pending.set(id, {
        msg,
        retries: 0,
        timer: setTimeout(() => this.retry(id), this.retryDelay)
      })
    }

    this.ws.send(JSON.stringify(msg))
  }

  retry(id) {
    const pending = this.pending.get(id)
    if (!pending || pending.retries >= this.maxRetries) {
      this.pending.delete(id)
      this.onSendFailed?.(id)
      return
    }
    pending.retries++
    pending.timer = setTimeout(() => this.retry(id), this.retryDelay * pending.retries)
    this.ws.send(JSON.stringify(pending.msg))
  }

  // 接收方
  handleMessage(raw) {
    const msg = JSON.parse(raw)

    if (msg.qos >= 1) {
      // 发送ACK
      this.ws.send(JSON.stringify({ type: 'ack', id: msg.id }))
    }

    if (msg.type === 'ack') {
      // 发送方收到ACK，清除待确认
      const pending = this.pending.get(msg.id)
      if (pending) {
        clearTimeout(pending.timer)
        this.pending.delete(msg.id)
      }
    }
  }
}
```

**消息去重（QoS 2）：**

```js
// 接收方维护最近消息ID集合
const receivedIds = new Set()

function handleMessage(msg) {
  // 去重检查
  if (receivedIds.has(msg.id)) {
    return  // 重复消息，丢弃
  }
  receivedIds.add(msg.id)

  // 限制集合大小
  if (receivedIds.size > 1000) {
    const oldest = receivedIds.values().next().value
    receivedIds.delete(oldest)
  }

  // 处理消息
  processMessage(msg)
}
```

**消息顺序保证：**

```js
// 消息带序列号，乱序时缓存等待
const recvBuffer = new Map()
let expectedSeq = 1

function handleMessage(msg) {
  if (msg.seq === expectedSeq) {
    processMessage(msg)
    expectedSeq++
    // 检查缓冲区
    while (recvBuffer.has(expectedSeq)) {
      processMessage(recvBuffer.get(expectedSeq))
      recvBuffer.delete(expectedSeq)
      expectedSeq++
    }
  } else if (msg.seq > expectedSeq) {
    recvBuffer.set(msg.seq, msg)  // 缓存乱序消息
  }
  // seq < expectedSeq 的重复消息直接丢弃
}
```

**知识点：** `WebSocket` `QoS` `ACK` `重传` `去重` `消息顺序`

:::

### Q10: WebSocket 子协议协商是什么？

> **💀 困难 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

子协议允许客户端和服务端在WebSocket上约定应用层协议。

```text
握手过程：
1. 客户端发送支持的子协议列表
   Sec-WebSocket-Protocol: chat, graphql-ws, socket.io

2. 服务端选择一个返回（只能选一个）
   Sec-WebSocket-Protocol: graphql-ws

3. 如果服务端不支持任何子协议，握手失败
```

```js
// 客户端
const ws = new WebSocket('wss://example.com/ws', ['graphql-ws', 'chat'])

// 服务端（Node.js ws库）
wss.on('headers', (headers, req) => {
  const protocols = req.headers['sec-websocket-protocol']?.split(', ')
  if (protocols?.includes('graphql-ws')) {
    headers.push('Sec-WebSocket-Protocol: graphql-ws')
  }
  // 不设置任何协议 → 握手失败
})

// ws库内置支持
const wss = new WebSocketServer({
  port: 8080,
  handleProtocols: (protocols, req) => {
    if (protocols.has('graphql-ws')) return 'graphql-ws'
    if (protocols.has('chat')) return 'chat'
    return false  // 拒绝连接
  }
})
```

**常见子协议：**

| 子协议 | 用途 |
|--------|------|
| graphql-ws | GraphQL 订阅 |
| socket.io | Socket.IO 通信 |
| chat | 自定义聊天协议 |
| wamp | WebSocket应用消息协议 |

**子协议的意义：**
- 同一端口支持多种业务
- 确保客户端和服务端使用相同的消息格式
- 避免协议不匹配导致的通信错误

**知识点：** `WebSocket` `子协议` `Sec-WebSocket-Protocol` `协议协商`

:::

### Q11: WebSocket 压缩扩展 permessage-deflate

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**permessage-deflate** 是 WebSocket 的内置压缩扩展，基于 DEFLATE 算法压缩消息。

```text
握手协商：
客户端请求：
Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits

服务端同意：
Sec-WebSocket-Extensions: permessage-deflate; client_max_window_bits=12

服务端拒绝：
（不返回 Sec-WebSocket-Extensions 头）
```

```js
// Node.js ws 库启用压缩
const { WebSocketServer } = require('ws')
const wss = new WebSocketServer({
  port: 8080,
  perMessageDeflate: {
    zlibDeflateOptions: {
      level: 3,              // 压缩级别1-9
    },
    threshold: 1024,         // 大于1KB才压缩
    concurrencyLimit: 10,    // 并发压缩数
    serverMaxWindowBits: 12, // 服务端滑动窗口大小
    clientMaxWindowBits: 12  // 客户端滑动窗口大小
  }
})
```

**压缩参数详解：**

| 参数 | 说明 | 默认值 |
|------|------|--------|
| server_no_context_takeover | 服务端不重用压缩上下文 | false |
| client_no_context_takeover | 客户端不重用压缩上下文 | false |
| server_max_window_bits | 服务端LZ77窗口大小(8-15) | 15 |
| client_max_window_bits | 客户端LZ77窗口大小(8-15) | 15 |

**压缩效果：**

```text
文本消息：
  原始大小: 1000 bytes
  压缩后:   ~200 bytes（5倍压缩率）

JSON消息：
  原始大小: 2000 bytes  
  压缩后:   ~400 bytes（5倍压缩率）

二进制数据：
  原始大小: 1000 bytes
  压缩后:   ~1000 bytes（几乎无压缩）

小消息（<100 bytes）：
  可能反而更大（压缩头开销）
```

**注意事项：**

```text
1. 小消息不要压缩（阈值设为1024字节以上）
2. 压缩消耗CPU，高并发时可能是瓶颈
3. 二进制数据（图片/视频）压缩率极低，建议跳过
4. no_context_takeover 降低内存但降低压缩率
```

**知识点：** `WebSocket` `permessage-deflate` `压缩` `DEFLATE` `性能`

:::

### Q12: WebSocket 连接池管理

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

大规模 WebSocket 应用需精心管理连接池，确保稳定性和性能。

**1. 连接数管理：**

```js
const { WebSocketServer } = require('ws')

const wss = new WebSocketServer({
  port: 8080,
  maxPayload: 100 * 1024,  // 最大消息100KB
  clientTracking: true
})

const connectionManager = {
  clients: new Map(),       // clientId → ws
  ipCounts: new Map(),      // ip → count
  maxConnections: 50000,    // 单进程最大连接
  maxPerIp: 20,             // 单IP最大连接

  add(clientId, ws, ip) {
    // 全局连接数限制
    if (this.clients.size >= this.maxConnections) {
      ws.close(1013, 'Server overloaded')
      return false
    }
    // 单IP限制
    const ipCount = (this.ipCounts.get(ip) || 0) + 1
    if (ipCount > this.maxPerIp) {
      ws.close(1008, 'Too many connections')
      return false
    }
    
    this.clients.set(clientId, ws)
    this.ipCounts.set(ip, ipCount)
    return true
  },

  remove(clientId, ip) {
    this.clients.delete(clientId)
    const count = this.ipCounts.get(ip) - 1
    if (count <= 0) this.ipCounts.delete(ip)
    else this.ipCounts.set(ip, count)
  }
}
```

**2. 空闲连接回收：**

```js
// 定期检查并清理空闲连接
setInterval(() => {
  const now = Date.now()
  wss.clients.forEach(ws => {
    // 超过1小时未活动则断开
    if (now - ws.lastActivity > 3600000) {
      ws.close(1000, 'Idle timeout')
    }
  })
}, 300000)  // 每5分钟检查
```

**3. 多进程/集群方案：**

```text
单进程限制：
- 内存：每个WS连接约10-50KB
- 50000连接 ≈ 1-2.5GB内存
- CPU：压缩/JSON解析开销

多进程方案：
                   ┌── Worker 1 (50000 connections)
Load Balancer ────┼── Worker 2 (50000 connections)
   (Nginx/HAProxy) └── Worker 3 (50000 connections)

问题：用户连接在Worker1，消息发给Worker2的用户
解决：Redis Pub/Sub 跨进程通信
```

```js
// Redis Pub/Sub 跨进程通信
const Redis = require('ioredis')
const sub = new Redis()  // 订阅
const pub = new Redis()  // 发布

// Worker 1
sub.subscribe('ws:broadcast')
sub.on('message', (channel, message) => {
  // 广播给本进程的所有连接
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(message)
  })
})

// Worker 2 发广播
pub.publish('ws:broadcast', JSON.stringify({ from: 'user1', content: 'hello' }))
```

**4. 负载均衡配置：**

```nginx
# Nginx WebSocket 负载均衡
upstream websocket {
  ip_hash;  # 同一客户端分配到同一后端
  server 127.0.0.1:8080;
  server 127.0.0.1:8081;
  server 127.0.0.1:8082;
}

server {
  location /ws {
    proxy_pass http://websocket;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 3600s;   # 1小时超时
    proxy_send_timeout 3600s;
  }
}
```

**知识点：** `WebSocket` `连接池` `负载均衡` `Redis Pub/Sub` `集群`

:::

### Q13: HTTP 103 状态码是什么？

> **⭐ 简单 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**103 Early Hints** — 服务器在最终响应前，提前返回资源提示，让浏览器预加载。

```text
正常流程（无103）：
1. Client → GET /page
2. Server 处理中...（查询DB、渲染模板，耗时200ms）
3. Server → 200 OK + HTML（包含CSS/JS引用）
4. Client 开始加载CSS/JS
   总等待：200ms + 资源加载时间

103 Early Hints 流程：
1. Client → GET /page
2. Server → 103 Early Hints
   Link: </style.css>; rel=preload; as=style
   Link: </app.js>; rel=preload; as=script
3. Client 立即开始预加载CSS/JS ← 节省等待！
4. Server → 200 OK + HTML
   总等待：资源加载与服务器处理并行
```

```nginx
# Nginx 配置 103 Early Hints
location / {
  add_header Link "</css/style.css>; rel=preload; as=style" early;
  add_header Link "</js/app.js>; rel=preload; as=script" early;
  proxy_pass http://backend;
}
```

**适用场景：**

| 场景 | 效果 |
|------|------|
| 服务端渲染(SSR) | 等待数据时预加载资源 |
| API网关 | 后端慢时提前告知前端资源 |
| CDN预热 | 提前触发CDN缓存 |

**浏览器支持：** Chrome 103+、Edge 103+、Firefox 未支持

**知识点：** `HTTP 103` `Early Hints` `资源预加载` `性能优化`

:::
---

### Q14: WebSocket 的心跳机制如何实现？断线重连策略？

> **🔥 中等 · WebSocket**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**WebSocket 心跳机制用于检测连接存活，断线重连策略确保服务可用性。**

**1. 为什么需要心跳？**

```text
问题场景：
- 客户端和服务器长时间无数据交互
- 中间网络设备（路由器、防火墙）超时关闭空闲连接
- 一方崩溃，另一方不知情（半开连接）
- 资源泄漏（连接句柄、内存）

心跳作用：
✅ 检测连接是否存活
✅ 防止中间设备关闭空闲连接
✅ 及时发现断线并重连
✅ 保持 NAT 映射（移动端）
```

**2. WebSocket Ping/Pong 机制：**

```text
RFC 6455 定义的 Ping/Pong 帧：
Client → Server: Ping
Server → Client: Pong (必须响应)
```

**3. 服务端心跳实现（Node.js）：**

```javascript
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8080 });
const HEARTBEAT_INTERVAL = 30000;

wss.on("connection", (ws) => {
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });
});

const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, HEARTBEAT_INTERVAL);
```

**4. 断线重连策略（指数退避）：**

```javascript
class WebSocketClient {
  constructor(url) {
    this.url = url;
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 30000;
    this.reconnectCount = 0;
    this.connect();
  }
  
  connect() {
    this.ws = new WebSocket(this.url);
    this.ws.onopen = () => {
      this.reconnectCount = 0;
      this.reconnectDelay = 1000;
    };
    this.ws.onclose = () => {
      this.reconnectCount++;
      const delay = Math.min(
        this.reconnectDelay * 1.5,
        this.maxReconnectDelay
      );
      setTimeout(() => this.connect(), delay);
    };
  }
}
```

**5. 心跳间隔建议：**

| 场景 | 心跳间隔 | 超时时间 |
|------|----------|----------|
| 高频交易 | 5-10 秒 | 3 秒 |
| 实时聊天 | 30 秒 | 10 秒 |
| 在线游戏 | 10-15 秒 | 5 秒 |
| IoT 设备 | 60 秒 | 30 秒 |

**知识点：** `WebSocket` `心跳机制` `Ping/Pong` `断线重连` `指数退避` `连接保活`

:::


---

### Q15: SSE 和 WebSocket 的区别？各适合什么场景？

> **🔥 中等 · 实时通信**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**SSE（Server-Sent Events）是单向服务器推送，WebSocket 是双向全双工通信。**

**1. 核心区别对比：**

| 特性 | SSE | WebSocket |
|------|-----|-----------|
| 通信方向 | 单向（服务器→客户端） | 双向（全双工） |
| 协议 | HTTP（文本） | WebSocket（二进制） |
| 自动重连 | ✅ 内置支持 | ❌ 需手动实现 |
| 数据类型 | 文本 | 二进制/文本 |
| 头部开销 | 较大 | 小（2-14 字节） |
| 浏览器支持 | 除 IE 外都支持 | 所有现代浏览器 |

**2. SSE 代码示例：**

```javascript
// 客户端
const eventSource = new EventSource("/events");
eventSource.onmessage = (e) => {
  console.log("收到消息:", JSON.parse(e.data));
};
eventSource.onerror = () => {
  // 自动重连（间隔 3 秒）
};

// 服务端（Node.js）
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  const timer = setInterval(() => {
    res.write(`data: ${Date.now()}

`);
  }, 1000);
  req.on("close", () => clearInterval(timer));
});
```

**3. 场景选择：**

**SSE 适用场景：**
- ✅ 股票价格、汇率推送
- ✅ 系统通知、消息提醒
- ✅ 文件上传进度
- ✅ 日志实时监控
- ✅ 社交 Feed 流

**WebSocket 适用场景：**
- ✅ 在线聊天室
- ✅ 多人协作编辑
- ✅ 在线游戏
- ✅ 远程桌面控制
- ✅ 高频交易系统

**4. 决策树：**

```text
需要双向通信？
  ├── No → 用 SSE（简单，自动重连）
  └── Yes → 用 WebSocket（全双工）
```

**知识点：** `SSE` `WebSocket` `服务器推送` `实时通信` `EventSource` `双向通信`

:::

