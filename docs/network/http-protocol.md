---
title: HTTP 协议面试题
description: HTTP 报文、缓存机制、认证方式、网络模型等核心网络面试题
---

# HTTP 协议面试题

---

### Q1: HTTP 报文结构是怎样的？

> **🔥 中等 · HTTP**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HTTP 报文由请求行/状态行、头部和主体三部分组成。**

**1. 请求报文结构：**

```
┌─────────────────────────────────┐
│  请求行 (Request Line)          │
│  GET /path HTTP/1.1             │
├─────────────────────────────────┤
│  请求头部 (Headers)             │
│  Host: example.com              │
│  Content-Type: application/json │
│  ...                            │
├─────────────────────────────────┤
│  空行 (CRLF)                    │
├─────────────────────────────────┤
│  请求体 (Body)                  │
│  {"name": "test"}               │
└─────────────────────────────────┘
```

**2. 请求行组成：**

```
GET /api/users?id=123 HTTP/1.1
│   │                 │
│   │                 └─ HTTP 版本
│   └─ 请求路径（含查询参数）
└─ 请求方法
```

**3. 请求头示例：**

```http
GET /api/users HTTP/1.1
Host: api.example.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
Accept: application/json
Accept-Language: zh-CN,zh;q=0.9
Accept-Encoding: gzip, deflate
Connection: keep-alive
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Cookie: sessionId=abc123; user=john
Content-Type: application/json
Content-Length: 27
```

**4. 响应报文结构：**

```
┌─────────────────────────────────┐
│  状态行 (Status Line)           │
│  HTTP/1.1 200 OK                │
├─────────────────────────────────┤
│  响应头部 (Headers)             │
│  Content-Type: application/json │
│  Content-Length: 1234           │
│  ...                            │
├─────────────────────────────────┤
│  空行 (CRLF)                    │
├─────────────────────────────────┤
│  响应体 (Body)                  │
│  {"users": [...]}               │
└─────────────────────────────────┘
```

**5. 状态行组成：**

```
HTTP/1.1 200 OK
│        │   │
│        │   └─ 状态描述
│        └─ 状态码
└─ HTTP 版本
```

**6. 响应头示例：**

```http
HTTP/1.1 200 OK
Date: Mon, 01 Jan 2024 10:00:00 GMT
Server: nginx/1.18.0
Content-Type: application/json; charset=utf-8
Content-Length: 1234
Connection: keep-alive
Set-Cookie: sessionId=abc123; Path=/; HttpOnly
Cache-Control: no-cache, no-store, must-revalidate
ETag: "5f8a7b2c3d4e5f6a7b8c9d0e"
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```

**7. 完整示例 - 发起请求：**

```javascript
// 客户端
const response = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: JSON.stringify({
    name: 'John',
    email: 'john@example.com'
  })
});

// 实际发送的原始请求
/*
POST /users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Authorization: Bearer token123
Content-Length: 48

{"name":"John","email":"john@example.com"}
*/

// 服务器响应
/*
HTTP/1.1 201 Created
Content-Type: application/json
Content-Length: 52
Location: /users/123

{"id":123,"name":"John","email":"john@example.com"}
*/
```

**知识点：** `HTTP` `请求报文` `响应报文` `报文结构` `HTTP 头`

:::

---

### Q2: 强缓存和协商缓存有什么区别？

> **🔥 中等 · HTTP**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**强缓存直接使用本地缓存不请求服务器，协商缓存需要向服务器验证是否过期。**

| 对比项 | 强缓存 | 协商缓存 |
|--------|--------|----------|
| 触发条件 | 缓存未过期 | 缓存已过期 |
| 是否请求服务器 | 否 | 是 |
| 状态码 | 200 (from cache) | 304 或 200 |
| 控制字段 | Cache-Control, Expires | ETag, Last-Modified |

**强缓存相关字段：** `Cache-Control: max-age=3600`, `Expires: ...`
**协商缓存相关字段：** `ETag`, `Last-Modified`, `If-None-Match`, `If-Modified-Since`

**工作流程：**
- 强缓存：请求 → 检查 Cache-Control/Expires → 未过期 → 直接使用
- 协商缓存：请求 → 缓存过期 → 服务器比对 → 未变化返回 304 / 已变化返回 200+ 新内容

**知识点：** `强缓存` `协商缓存` `Cache-Control` `ETag` `Last-Modified` `304`

:::

---

### Q3: fetch API 和 XMLHttpRequest (XHR) 有什么区别？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 维度 | XMLHttpRequest | fetch |
|------|---------------|-------|
| 设计 | 事件驱动 | Promise 链式调用 |
| 语法 | 回调嵌套 | async/await |
| 请求取消 | `xhr.abort()` | `AbortController` |
| 超时 | `xhr.timeout` | 无原生支持 |
| 进度 | `onprogress` | 无原生支持（Streams API） |
| 拦截重定向 | `xhr.followRedirects` | `redirect: 'manual'` |
| Cookie | 默认发送 | 默认不发送（需 `credentials`） |
| 错误处理 | 网络错误触发 onerror | 4xx/5xx 不 reject |

```js
// XMLHttpRequest
const xhr = new XMLHttpRequest()
xhr.open('GET', '/api/data')
xhr.timeout = 5000
xhr.onload = () => {
  if (xhr.status === 200) {
    console.log(JSON.parse(xhr.responseText))
  }
}
xhr.onerror = () => console.error('网络错误')
xhr.onprogress = (e) => console.log(`${e.loaded}/${e.total}`)
xhr.send()

// fetch
try {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)
  
  const res = await fetch('/api/data', {
    signal: controller.signal,
    credentials: 'include',  // 发送 cookie
  })
  clearTimeout(timeoutId)
  
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
} catch (err) {
  if (err.name === 'AbortError') console.error('请求超时')
  else console.error('请求失败', err)
}
```

**fetch 注意事项：**

```js
// 1. 4xx/5xx 不会 reject！必须手动检查
const res = await fetch('/api/data')
if (!res.ok) throw new Error(res.statusText)  // 必须检查

// 2. 默认不发送 Cookie
fetch('/api/data', { credentials: 'include' })     // 跨域发送
fetch('/api/data', { credentials: 'same-origin' }) // 同源发送（默认）
fetch('/api/data', { credentials: 'omit' })        // 不发送

// 3. 没有原生超时，用 AbortController
const controller = new AbortController()
setTimeout(() => controller.abort(), 5000)
fetch('/api/data', { signal: controller.signal })
```

**知识点：** `fetch` `XMLHttpRequest` `AbortController` `Promise` `CORS` `credentials`

:::

---

### Q4: WebSocket 和 HTTP 有什么区别？

> **🔥 中等 · HTTP**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HTTP 是请求 - 响应模式，WebSocket 是双向持久连接。**

**核心区别：**

| 对比项 | HTTP | WebSocket |
|--------|------|-----------|
| 连接方式 | 短连接 | 长连接 |
| 通信模式 | 单向 | 双向 |
| 实时性 | 低 | 高 |
| 适用场景 | 常规 CRUD | 聊天、直播、实时协作 |

**知识点：** `WebSocket` `HTTP` `长连接` `双向通信` `实时推送` `Upgrade`

:::

---

### Q5: Token 认证和 Cookie 认证有什么区别？

> **🔥 中等 · HTTP**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Token 是无状态认证，Cookie 是有状态认证。**

| 对比项 | Token (JWT) | Cookie |
|--------|-----------|--------|
| 存储位置 | 客户端 | 浏览器自动管理 |
| 跨域支持 | 好 | 差 |
| CSRF 防护 | 天然免疫 | 需要防护 |
| 服务端状态 | 无状态 | 需要 session 存储 |

**知识点：** `Token` `JWT` `Cookie` `Session` `认证` `无状态`

:::

---

### Q6: DNS over HTTPS (DoH) 如何保护隐私？

> **🔥 中等 · HTTP**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**DoH (DNS over HTTPS)** 将 DNS 查询封装在 HTTPS 请求中，防止 DNS 污染和窃听。

```text
传统 DNS（UDP 53端口）：
Client → DNS查询(明文) → DNS服务器
       ↑ 可被窃听、篡改、劫持

DNS over HTTPS（HTTPS 443端口）：
Client → DNS查询(HTTPS加密) → DoH服务器
       ↑ 加密传输，与普通HTTPS流量无区别
```

**三种 DNS 加密方案对比：**

| 方案 | 端口 | 协议 | 特点 |
|------|------|------|------|
| DoH | 443 | HTTPS | 与Web流量混合，难被检测/封锁 |
| DoT | 853 | TLS | 专用端口，易被防火墙识别 |
| DoQ | 853 | QUIC | 基于QUIC，更快建立连接 |

**DoH 工作流程：**

```text
1. 浏览器需要解析 example.com
2. 向 DoH 服务器发送 HTTPS 请求：
   GET https://dns.google/dns-query?dns=AAABAAAB...
   Accept: application/dns-message
3. DoH 服务器返回加密的 DNS 响应
4. 浏览器解析响应获取 IP 地址
```

**主流 DoH 服务器：**

| 提供商 | URL |
|--------|-----|
| Google | `https://dns.google/dns-query` |
| Cloudflare | `https://cloudflare-dns.com/dns-query` |
| Alibaba | `https://dns.alidns.com/dns-query` |

**浏览器配置 DoH：** Chrome设置→安全→使用安全DNS；Firefox设置→隐私与安全→DNS over HTTPS

**知识点：** `DNS` `DoH` `DoT` `DNS加密` `隐私保护` `DNS污染`

:::

---

### Q7: 192.168.0.1 和 192.168.1.1 如何通信？

> **🔥 中等 · HTTP**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**192.168.0.1 和 192.168.1.1 属于不同子网，不能直接通信，需要路由器转发。**

**详细解析：**

1. **子网划分**
   ```
   假设子网掩码都是 255.255.255.0 (/24)
   
   192.168.0.1/24  → 网络号：192.168.0.0
   192.168.1.1/24  → 网络号：192.168.1.0
   
   网络号不同 → 不在同一子网
   ```

2. **通信过程**
   - step1: 判断目标 IP 是否在同一子网 → 不在
   - step2: 将数据包发送给自己的默认网关
   - step3: 网关通过 ARP 获取下一跳 MAC 地址
   - step4: 路由器根据路由表转发到目标网络
   - step5: 目标网络的路由器将数据送达

**知识点：** `子网掩码` `网关` `路由` `ARP` `跨网段通信` `IP 协议`

:::

---

### Q8: TCP 粘包是怎么回事？如何处理？

> **🔥 中等 · HTTP**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**TCP 粘包是指接收方无法区分多次发送的数据边界。**

**产生原因：**
1. TCP 是流式协议，没有消息边界
2. Nagle 算法合并小数据包
3. 接收缓冲区累积

**处理方案：**
1. 固定长度消息
2. 分隔符（如 `\r\n\r\n` 或 `\n`）
3. 长度前缀（4 字节长度 + 实际数据）

**知识点：** `TCP` `粘包` `流式协议` `消息边界` `长度前缀` `分隔符`

:::

---

### Q9: HTTP 七层网络模型各层作用？

> **⭐ 简单 · HTTP**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**OSI 七层模型（从上到下）：**

| 层级 | 名称 | 作用 | 典型协议 |
|------|------|------|----------|
| 7 | 应用层 | 直接为应用提供服务 | HTTP, FTP, SMTP, DNS |
| 6 | 表示层 | 数据格式转换、加密 | SSL/TLS, JPEG, ASCII |
| 5 | 会话层 | 建立、管理会话 | RPC, NetBIOS |
| 4 | 传输层 | 端到端传输、可靠性 | TCP, UDP |
| 3 | 网络层 | 路由选择、寻址 | IP, ICMP, ARP |
| 2 | 数据链路层 | 帧传输、MAC 寻址 | Ethernet, WiFi |
| 1 | 物理层 | 比特流传输 | 网线、光纤、无线电波 |

**知识点：** `OSI 模型` `网络分层` `HTTP` `TCP/IP` `协议栈`

:::

---

### Q10: 数字证书是什么？CA 证书的作用？

> **🔥 中等 · HTTP**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**数字证书：**

数字证书是由**CA 机构（Certificate Authority）**颁发的电子凭证，用于证明公钥的所有者身份。

**证书包含：** 持有者信息、公钥、有效期、颁发者、CA 签名、序列号

**CA 作用：**
1. 身份验证
2. 防止中间人攻击
3. 建立信任链（根 CA → 中间 CA → 网站证书）

**知识点：** `数字证书` `CA` `公钥加密` `中间人攻击` `证书链` `SSL/TLS`

:::

---

### Q11: OPTIONS 请求方法及使用场景

> **🔥 中等 · HTTP**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**OPTIONS 是 HTTP 的预检请求方法，用于跨域 CORS 检查和获取服务器支持的方法。**

**1. CORS 预检请求：**

```javascript
// 前端发起跨域请求
fetch('https://api.example.com/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer token123'
  },
  body: JSON.stringify({ name: 'test' })
});

// 浏览器自动发起 OPTIONS 预检
OPTIONS /users HTTP/1.1
Host: api.example.com
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization

// 服务器响应
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400  // 预检结果缓存 24 小时
```

**2. 什么情况下触发预检：**

```javascript
// ✅ 简单请求 - 不触发 OPTIONS
fetch('/api/data', {
  method: 'GET',  // GET/HEAD/POST
  headers: {
    'Accept': 'application/json'  // 简单头部
  }
});

// ❌ 复杂请求 - 触发 OPTIONS
fetch('/api/data', {
  method: 'PUT',  // 非简单方法
  headers: {
    'Content-Type': 'application/json',  // 非简单头部
    'X-Custom-Header': 'value'
  }
});

// ❌ Content-Type 为 application/json 也触发
fetch('/api/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'  // 只有这三种是简单：
    // application/x-www-form-urlencoded
    // multipart/form-data
    // text/plain
  }
});
```

**3. 其他使用场景：**

```javascript
// 场景 1：获取服务器支持的 HTTP 方法
fetch('/api/users', { method: 'OPTIONS' })
  .then(res => {
    const methods = res.headers.get('Allow');
    console.log('支持的方法:', methods);  // GET, POST, PUT, DELETE
  });

// 场景 2：RESTful API 设计
// 客户端通过 OPTIONS 了解资源可用操作
OPTIONS /api/users/123
// 响应：Allow: GET, PUT, DELETE

// 场景 3：调试和测试
// 测试跨域配置是否正确
```

**4. Node.js Express 实现：**

```javascript
app.options('/api/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});
```

**5. Nginx 配置：**

```nginx
location /api/ {
  if ($request_method = 'OPTIONS') {
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
    add_header 'Access-Control-Allow-Headers' 'Content-Type,Authorization';
    add_header 'Access-Control-Max-Age' 1728000;
    add_header 'Content-Type' 'text/plain charset=UTF-8';
    add_header 'Content-Length' 0;
    return 204;
  }
}
```

**知识点：** `HTTP` `OPTIONS` `CORS` `跨域` `预检请求`

:::

---

### Q12: HTTP/2 的头部压缩 (HPACK) 原理是什么？

> **💀 困难 · HTTP**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HPACK** 是 HTTP/2 的头部压缩算法，解决了 HTTP/1.x 每次请求都发送重复头部的问题。

```text
HTTP/1.x 问题：
请求1: GET /api/users  Host: example.com  User-Agent: Chrome ...
请求2: GET /api/posts  Host: example.com  User-Agent: Chrome ...
→ 每次都发送大量重复头部，浪费带宽！
```

**HPACK 三大机制：**

| 机制 | 说明 | 效果 |
|------|------|------|
| 静态表 | 61个常见头部字段预定义 | 常见头部1字节编码 |
| 动态表 | 双方维护的FIFO表，存储自定义/重复头部 | 相同头部1字节索引 |
| Huffman编码 | 对字符串值进行压缩 | 平均减少30%长度 |

```text
静态表示例：
索引 1  → :authority
索引 2  → :method GET
索引 3  → :method POST
索引 4  → :path /
索引 16 → accept-encoding
索引 49 → accept-encoding: gzip, deflate

编码：":method GET" → 索引2 → 仅需1字节！
```

**动态表工作流程：**

```text
首次请求：
  cookie: sessionid=abc123  → 新增到动态表（索引62）→ 传输完整值

后续请求：
  cookie: sessionid=abc123  → 查动态表命中（索引62）→ 只传输索引号62（1字节！）

动态表特性：连接级别、FIFO淘汰、双方同步维护
```

**压缩效果：** 原始800字节 → 首次400字节(50%) → 后续50字节(94%)

**知识点：** `HTTP/2` `HPACK` `头部压缩` `静态表` `动态表` `Huffman编码`

:::

---

### Q13: HTTP 499 状态码是什么？

> **🔥 中等 · HTTP**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HTTP 499** 是 Nginx 自定义状态码，表示**客户端主动关闭了连接**，服务端还未返回响应。

```text
正常流程：Client → 请求 → Server → 处理 → 响应 → Client ✅
499 场景：Client → 请求 → Server → 处理中... Client断开 → 499
```

**常见触发场景：**

| 场景 | 原因 | 处理建议 |
|------|------|----------|
| 前端请求超时 | axios/fetch timeout设置过短 | 增加超时时间 |
| 用户取消请求 | 页面跳转/组件卸载 | 业务正常，可忽略 |
| 服务端慢查询 | 接口响应>客户端超时 | 优化接口性能 |
| 网络不稳定 | 移动端网络波动 | 前端重试机制 |
| HTTPS握手失败 | SSL/TLS问题 | 检查证书配置 |

**前端排查499：**

```js
// 常见原因1: 请求超时
axios.get('/api/slow', { timeout: 5000 })  // 服务端>5s → 499

// 常见原因2: 组件卸载取消
useEffect(() => {
  const ctrl = new AbortController()
  fetch('/api/data', { signal: ctrl.signal })
  return () => ctrl.abort()  // 组件卸载 → 499
}, [])
```

**499 vs 504：** 499=客户端断开 | 504=服务端网关超时

**知识点：** `HTTP 499` `Nginx` `客户端断开` `请求超时` `状态码`

:::

---

## 总结

| 知识点 | 重要度 |
|--------|--------|
| HTTP 报文结构 | 🔥🔥🔥 |
| 缓存机制 | 🔥🔥🔥 |
| 认证方式 | 🔥🔥 |
| TCP 粘包 | 🔥🔥 |
| OSI 模型 | 🔥🔥 |
| HTTPS/证书 | 🔥🔥 |
| HTTP/2 | 🔥 |

---### Q14: HTTP 报文头部有哪些常用字段？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

HTTP头部分为四类：通用头部、请求头部、响应头部、实体头部。

**1. 通用头部（General Headers）：**

| 字段 | 说明 | 示例 |
|------|------|------|
| Cache-Control | 缓存控制 | `max-age=3600, no-cache` |
| Connection | 连接管理 | `keep-alive` |
| Date | 消息创建日期 | `Tue, 01 Jun 2026 10:00:00 GMT` |
| Transfer-Encoding | 传输编码 | `chunked` |
| Via | 代理服务器信息 | `1.1 proxy.example.com` |

**2. 请求头部（Request Headers）：**

| 字段 | 说明 | 示例 |
|------|------|------|
| Host | 目标主机名 | `example.com` |
| User-Agent | 客户端信息 | `Chrome/126.0.0.0` |
| Accept | 可接受的响应类型 | `text/html,application/json` |
| Accept-Encoding | 可接受的编码 | `gzip, deflate, br` |
| Accept-Language | 可接受的语言 | `zh-CN,zh;q=0.9,en;q=0.8` |
| Authorization | 认证信息 | `Bearer eyJhbGc...` |
| Cookie | 请求附带Cookie | `session_id=abc123` |
| Referer | 来源页面URL | `https://example.com/page` |
| If-Modified-Since | 协商缓存 | `Tue, 01 Jun 2026 00:00:00 GMT` |
| If-None-Match | 协商缓存(ETag) | `"abc123"` |
| Origin | 请求来源(跨域) | `https://frontend.com` |

**3. 响应头部（Response Headers）：**

| 字段 | 说明 | 示例 |
|------|------|------|
| Server | 服务器信息 | `nginx/1.24` |
| Set-Cookie | 设置Cookie | `session=xyz; HttpOnly; Secure` |
| Location | 重定向地址 | `https://new.example.com` |
| Access-Control-Allow-Origin | CORS允许源 | `https://frontend.com` |
| Content-Disposition | 内容处理方式 | `attachment; filename="file.pdf"` |
| ETag | 资源标识 | `"abc123"` |
| Last-Modified | 最后修改时间 | `Tue, 01 Jun 2026 00:00:00 GMT` |
| Strict-Transport-Security | HSTS | `max-age=31536000` |
| X-Frame-Options | 防iframe嵌入 | `SAMEORIGIN` |
| Content-Security-Policy | CSP | `default-src 'self'` |

**4. 实体头部（Entity Headers）：**

| 字段 | 说明 | 示例 |
|------|------|------|
| Content-Type | 内容类型 | `application/json; charset=utf-8` |
| Content-Length | 内容长度 | `12345` |
| Content-Encoding | 内容编码 | `gzip` |
| Content-Language | 内容语言 | `zh-CN` |
| Cache-Control | 缓存策略 | `public, max-age=3600` |
| Expires | 过期时间 | `Tue, 01 Jun 2027 00:00:00 GMT` |

**常见组合场景：**

```text
API请求：
请求: Host + Authorization + Content-Type: application/json
响应: Content-Type: application/json + Cache-Control: no-store

静态资源：
请求: If-None-Match + If-Modified-Since
响应: ETag + Last-Modified + Cache-Control: max-age=31536000

跨域请求：
请求: Origin + Access-Control-Request-Method
响应: Access-Control-Allow-Origin + Access-Control-Allow-Methods
```

**知识点：** `HTTP头部` `请求头` `响应头` `Content-Type` `缓存头` `CORS头`

:::

---

### Q15: HTTP/2 的多路复用和 HTTP/1.1 的管线化有什么区别？

> **🔥 中等 · HTTP/2**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HTTP/2 多路复用和 HTTP/1.1 管线化都是为了解决队头阻塞问题，但实现机制和效果完全不同。**

**1. HTTP/1.1 管线化（Pipelining）：**

```text
HTTP/1.1 管线化：
客户端：请求 1 → 请求 2 → 请求 3（连续发送，无需等待响应）
服务器：响应 1 → 响应 2 → 响应 3（必须按顺序返回）
```

**问题：**
- 响应必须按请求顺序返回，如果请求 1 处理慢，会阻塞后续响应（队头阻塞）
- 实际浏览器默认禁用管线化（Chrome、Firefox 均关闭）
- 连接错误时恢复复杂

**2. HTTP/2 多路复用（Multiplexing）：**

```text
HTTP/2 多路复用：
帧结构：
┌─────────────────────────────────────────┐
│ Frame: Stream 1, Type: HEADERS          │
├─────────────────────────────────────────┤
│ Frame: Stream 2, Type: DATA             │
├─────────────────────────────────────────┤
│ Frame: Stream 1, Type: DATA             │
├─────────────────────────────────────────┤
│ Frame: Stream 3, Type: HEADERS          │
└─────────────────────────────────────────┘
```

**优势：**
- 多个请求/响应可交错传输，通过 Stream ID 区分
- 无队头阻塞，任一请求不影响其他请求
- 二进制分帧层支持优先级和依赖关系

**3. 核心对比表：**

| 特性 | HTTP/1.1 管线化 | HTTP/2 多路复用 |
|------|----------------|----------------|
| 传输方式 | 文本，顺序 | 二进制，交错 |
| 响应顺序 | 必须按请求顺序 | 可乱序，按 Stream ID 重组 |
| 队头阻塞 | 存在（响应阻塞） | 消除 |
| 浏览器支持 | 默认关闭 | 广泛支持 |
| 连接利用 | 单请求单响应 | 单连接多请求并行 |
| 错误恢复 | 复杂 | 简单（帧级） |

**4. 代码示例 - 性能对比：**

```javascript
// HTTP/1.1 即使管线化，也会队头阻塞
fetch('/api/slow').then(r1 => console.log('1st done'));
fetch('/api/fast').then(r2 => console.log('2nd done'));
// 结果：fast 可能比 slow 先完成，但响应必须等 slow 先返回

// HTTP/2 多路复用：真正实现并行
Promise.all([
  fetch('/api/slow'),
  fetch('/api/fast')
]).then(([r1, r2]) => {
  console.log('Both done independently');
});
```

**5. 实际性能影响：**

```
HTTP/1.1 管线化加载 10 个资源：
请求 1 → 响应 1(阻塞) → 响应 2 → 响应 3 ...
总时间 = 所有响应时间之和（串行）

HTTP/2 多路复用加载 10 个资源：
请求 1,2,3... → 响应交错返回
总时间 ≈ 最慢响应时间（并行）
```

**知识点：** `HTTP/2` `多路复用` `管线化` `队头阻塞` `二进制分帧` `性能优化`

:::

---

### Q16: HTTP/3（QUIC）解决了 HTTP/2 的哪些问题？

> **🔥 中等 · HTTP/3**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HTTP/3 基于 QUIC 协议，主要解决了 HTTP/2 在不可靠网络下的传输层队头阻塞问题。**

**1. HTTP/2 遗留的队头阻塞问题：**

```text
HTTP/2 问题场景：
TCP 连接 → 数据包 1,2,3,4,5...
如果包 2 丢失：
TCP 重传包 2 之前，包 3,4,5 无法交付给应用层
→ 所有 HTTP/2 Stream 都被阻塞
```

**根本原因：** HTTP/2 多路复用在应用层，底层仍依赖 TCP，TCP 的丢包重传会影响所有流。

**2. HTTP/3/QUIC 解决方案：**

```text
HTTP/3/QUIC 架构：
┌──────────────────────────┐
│       HTTP/3             │
├──────────────────────────┤
│       QUIC (应用层)      │
│  - 多路复用              │
│  - 丢包重传（按 Stream） │
│  - 连接迁移              │
├──────────────────────────┤
│       UDP                │
└──────────────────────────┘
```

**3. 核心改进对比：**

| 问题 | HTTP/2 + TCP | HTTP/3/QUIC |
|------|-------------|-------------|
| 传输层层头阻塞 | 存在（TCP 丢包阻塞所有流） | 消除（按 Stream 独立重传） |
| 握手延迟 | TCP 3 次 + TLS 1-2 RTT | QUIC 0-1 RTT（首次 1，复用 0） |
| 连接迁移 | TCP 断线需重连 | 支持 Connection ID，网络切换不断线 |
| 拥塞控制 | TCP 级别 | QUIC 级别，可自定义 |
| 队头阻塞 | 应用层解决，传输层仍有 | 完全消除 |
| 默认加密 | HTTPS 可选 | QUIC 强制 TLS 1.3 |

**4. 0-RTT 握手示例：**

```text
TCP + TLS 1.2:
Client                Server
  │── SYN ───────────►│
  │◄── SYN-ACK ───────│
  │── ACK + ClientHello ──►│
  │◄── ServerHello + ... ─│
  │── Finished ──────►│
  │◄── Finished ──────│
总耗时：3 RTT

QUIC 0-RTT（复用连接）:
Client                Server
  │── ClientHello + 0-RTT Data ──►│
  │◄── ServerHello + Handshake ──│
  │── Handshake ────►│
总耗时：1 RTT（发送应用数据）
```

**5. 连接迁移能力：**

```javascript
// 移动端场景：WiFi → 4G 切换
// HTTP/2: TCP 连接断开，需重新握手，请求失败
// HTTP/3: QUIC Connection ID 不变，连接持续

// QUIC 连接迁移：
原始：ClientIP:Port <-> ServerIP:Port (ConnectionID: abc123)
切换：NewClientIP:Port <-> ServerIP:Port (ConnectionID: abc123)
// 连接保持，无需重连
```

**6. 实际应用场景：**

- 移动网络不稳定：QUIC 丢包不影响其他 Stream
- 弱网环境：0-RTT 减少首屏延迟
- 网络切换：电梯、地铁场景连接不中断
- 高丢包率：>5% 丢包率下 HTTP/3 优势明显

**知识点：** `HTTP/3` `QUIC` `队头阻塞` `0-RTT` `连接迁移` `UDP` `性能优化`

:::

---

### Q17: 请求方法 GET 和 POST 的本质区别是什么？

> **🔥 中等 · HTTP**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**GET 和 POST 的本质区别在于语义、安全性和幂等性，而非参数位置或长度限制。**

**1. 核心语义区别：**

| 特性 | GET | POST |
|------|-----|------|
| 语义 | 获取资源（查询） | 提交/创建资源（写入） |
| 安全性 | 安全（不应改变服务器状态） | 不安全（会改变状态） |
| 幂等性 | 幂等（多次请求效果相同） | 不幂等（多次提交可能多次创建） |
| 可缓存 | 可被浏览器/代理缓存 | 默认不缓存 |
| 可收藏 | URL 可收藏/分享 | 不可直接收藏 |
| 历史记录 | 保留在浏览器历史 | 不保留 |

**2. 常见误区澄清：**

**误区 1：GET 参数在 URL，POST 在 Body**
```text
真相：GET 也可以有 Body（HTTP 规范允许，但不推荐）
     POST 也可以有 URL 参数（查询条件）

实际约定：
GET: 参数放 URL 查询字符串
POST: 数据放请求体
```

**误区 2：GET 有长度限制，POST 没有**
```text
真相：HTTP 规范无长度限制
     实际限制来自浏览器和服务器配置

浏览器限制：
- IE: ~2083 字符
- Chrome: ~8KB
- Safari: ~8KB

服务器限制（可配置）：
- Nginx: large_client_header_buffers
- Apache: LimitRequestLine
```

**误区 3：POST 比 GET 安全**
```text
真相：二者在传输层都不安全（除非 HTTPS）
     POST 只是参数不在 URL 显示，避免日志泄露

安全性对比：
GET: 参数在 URL → 可能出现在服务器日志、代理日志、浏览器历史
POST: 参数在 Body → 不在 URL 显示，但仍可被拦截
最佳：HTTPS 加密传输
```

**3. 使用场景对比：**

```javascript
// GET 适用场景：
✅ 搜索查询：GET /api/search?q=keyword
✅ 分页：GET /api/users?page=2&size=20
✅ 获取详情：GET /api/users/123
✅ 过滤筛选：GET /api/products?category=books&price_min=10

// POST 适用场景：
✅ 创建资源：POST /api/users {name, email}
✅ 表单提交：POST /api/login {username, password}
✅ 文件上传：POST /api/upload (multipart/form-data)
✅ 复杂查询：POST /api/search/advanced {复杂过滤条件}
```

**4. 幂等性示例：**

```javascript
// GET 幂等：
GET /api/users/123  // 返回用户信息
GET /api/users/123  // 相同结果，无副作用
GET /api/users/123  // 仍然相同

// POST 不幂等：
POST /api/orders {itemId: 1}  // 创建订单 #001
POST /api/orders {itemId: 1}  // 创建订单 #002（重复下单！）
POST /api/orders {itemId: 1}  // 创建订单 #003

// 解决：使用唯一键或幂等令牌
POST /api/orders
Headers: Idempotency-Key: uuid-123
Body: {itemId: 1}
// 相同 Key 的重复请求返回相同结果
```

**5. RESTful API 设计实践：**

```text
GET    /api/users      # 获取用户列表
GET    /api/users/123  # 获取单个用户
POST   /api/users      # 创建新用户
PUT    /api/users/123  # 更新用户（完整替换，幂等）
PATCH  /api/users/123  # 部分更新用户
DELETE /api/users/123  # 删除用户（幂等）
```

**6. 缓存行为：**

```http
GET 请求可缓存：
请求：GET /api/products
响应：Cache-Control: max-age=3600
结果：浏览器缓存 1 小时

POST 请求默认不缓存：
请求：POST /api/orders
响应：默认 Cache-Control: no-store
结果：每次都发送新请求
```

**知识点：** `GET` `POST` `HTTP 方法` `幂等性` `安全性` `缓存` `RESTful API`

:::

