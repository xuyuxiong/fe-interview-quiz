---
title: HTTPS 与加密
description: HTTPS原理、TLS握手、证书验证、加密算法、安全防护等核心面试题
---

# HTTPS 与加密

HTTPS 是 HTTP 安全通信的基础，掌握其原理对前端性能优化和安全防御至关重要。

---

### Q1: HTTPS 的工作原理是什么？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HTTPS = HTTP + TLS/SSL**，通过加密层保护数据传输安全。

**核心思路：非对称加密交换密钥 + 对称加密传输数据**

```text
HTTPS 通信全过程：

1. TCP 三次握手（建立连接）
2. TLS 握手（建立安全通道）
   ├── 客户端 → 服务端：ClientHello（随机数R1 + 支持的加密套件 + TLS版本）
   ├── 服务端 → 客户端：ServerHello（随机数R2 + 选定套件 + 证书 + ServerKeyExchange）
   ├── 客户端验证证书（证书链、有效期、域名、吊销状态）
   ├── 客户端生成预主密钥（Pre-Master Secret），用服务器公钥加密发送
   ├── 双方用 R1 + R2 + Pre-Master Secret 计算出会话密钥（Master Secret）
   └── 双方切换到对称加密通信
3. HTTP 通信（用协商好的对称密钥加密传输）
```

**TLS 1.2 vs TLS 1.3 握手对比：**

```text
TLS 1.2（2-RTT）：
Client → Server: ClientHello
Server → Client: ServerHello + Certificate + ServerKeyExchange
Client → Server: ClientKeyExchange + ChangeCipherSpec + Finished
Server → Client: ChangeCipherSpec + Finished

TLS 1.3（1-RTT）：
Client → Server: ClientHello + KeyShare
Server → Client: ServerHello + KeyShare + Certificate + Finished
Client → Server: Finished
→ 减少一半握手延迟！
```

**为什么不用纯非对称加密传输数据？**

| 对比 | 非对称加密 | 对称加密 |
|------|-----------|---------|
| 速度 | 慢（1000倍差距） | 快 |
| 适合 | 少量数据（密钥交换） | 大量数据（内容传输） |
| 算法 | RSA/ECC | AES-256-GCM |

**知识点：** `HTTPS` `TLS握手` `非对称加密` `对称加密` `密钥交换`

:::

### Q2: SSL/TLS 握手详细过程是什么？

> **💀 困难 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**TLS 1.2 完整握手（RSA密钥交换）：**

```text
客户端                                    服务端
  │                                         │
  │ ──── ClientHello ──────────────────→    │
  │      · 客户端随机数(R1)                  │
  │      · 支持的TLS版本(1.0~1.2)           │
  │      · 支持的加密套件列表               │
  │      · 压缩方法                         │
  │                                         │
  │ ←──── ServerHello ────────────────      │
  │      · 服务端随机数(R2)                  │
  │      · 选定的TLS版本                    │
  │      · 选定的加密套件                   │
  │                                         │
  │ ←──── Certificate ────────────────      │
  │      · 服务器证书链                      │
  │                                         │
  │ ←──── ServerKeyExchange ──────          │
  │      · DH参数（如使用ECDHE）            │
  │                                         │
  │ ←──── ServerHelloDone ──────            │
  │                                         │
  │      客户端验证证书：                    │
  │      1. 证书链是否完整？                 │
  │      2. 是否在有效期内？                 │
  │      3. 域名是否匹配？                   │
  │      4. 是否被吊销？(CRL/OCSP)          │
  │                                         │
  │ ──── ClientKeyExchange ────────→        │
  │      · 预主密钥(用服务器公钥加密)        │
  │                                         │
  │ ──── ChangeCipherSpec ────────→         │
  │      · 通知后续使用加密通信              │
  │                                         │
  │ ──── Finished ─────────────────→        │
  │      · 验证握手完整性                   │
  │                                         │
  │ ←──── ChangeCipherSpec ────────         │
  │ ←──── Finished ─────────────────        │
  │                                         │
  │ ══════ 加密通信开始 ════════════         │
```

**密钥生成过程：**

```text
1. 客户端生成随机数 R1
2. 服务端生成随机数 R2
3. 客户端生成预主密钥 Pre-Master Secret（46字节随机数）
4. 用服务器公钥加密 Pre-Master Secret 发送给服务端
5. 双方计算主密钥：
   Master Secret = PRF(Pre-Master Secret, "master secret", R1 + R2)
6. 从 Master Secret 派生出6个密钥：
   - 客户端写密钥（对称加密）
   - 服务端写密钥（对称加密）
   - 客户端写MAC密钥（完整性校验）
   - 服务端写MAC密钥
   - 客户端写IV
   - 服务端写IV
```

**TLS 1.3 改进：**

```text
1. 握手从2-RTT减少到1-RTT
2. 移除了RSA密钥交换，只保留ECDHE（前向安全）
3. 移除了不安全的加密套件
4. 支持0-RTT恢复（有重放风险）
```

**知识点：** `TLS握手` `密钥交换` `RSA` `ECDHE` `前向安全` `TLS 1.3`

:::

### Q3: HTTPS 证书验证流程是怎样的？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**浏览器验证证书的5步流程：**

```text
1. 证书链验证
   根CA证书(预装在浏览器中)
     └── 中间CA证书
           └── 站点证书(example.com)
   
   验证方式：用上级CA的公钥验证下级证书的签名
   直到追溯到浏览器信任的根CA

2. 有效期检查
   notBefore ≤ 当前时间 ≤ notAfter
   过期证书直接拒绝

3. 域名匹配
   证书的 Subject Alternative Name (SAN) 或 Common Name (CN)
   必须与访问的域名匹配
   支持通配符：*.example.com

4. 吊销检查
   CRL（证书吊销列表）：下载完整列表，检查证书是否被吊销
   OCSP（在线证书状态协议）：实时查询证书状态
   OCSP Stapling：服务器主动附带OCSP响应，减少客户端查询

5. 用途验证
   证书的 KeyUsage 和 ExtendedKeyUsage 必须包含服务器认证
```

```js
// Node.js 验证证书
const tls = require('tls')
const options = {
  host: 'example.com',
  port: 443,
  rejectUnauthorized: true  // 验证证书
}
const socket = tls.connect(options, () => {
  const cert = socket.getPeerCertificate()
  console.log('颁发者:', cert.issuer.O)
  console.log('有效期:', cert.valid_from, '-', cert.valid_to)
  console.log('SAN:', cert.subjectaltname)
  console.log('指纹:', cert.fingerprint)
})
```

**常见证书类型：**

| 类型 | 验证级别 | 适用场景 | 价格 |
|------|---------|---------|------|
| DV（域名验证） | 验证域名所有权 | 个人网站 | 免费(Let's Encrypt) |
| OV（组织验证） | 验证组织身份 | 企业网站 | 付费 |
| EV（扩展验证） | 严格身份验证 | 金融/电商 | 昂贵 |

**自签名证书问题：**

```bash
# 生成自签名证书（仅开发用）
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# 浏览器会警告"不安全"，因为证书不在受信任CA列表中
# 生产环境必须使用CA签发的证书
```

**知识点：** `证书验证` `证书链` `CA` `OCSP` `SAN` `CRL`

:::

### Q4: 对称加密和非对称加密的区别？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 维度 | 对称加密 | 非对称加密 |
|------|---------|-----------|
| 密钥数量 | 1个（加密解密用同一个） | 2个（公钥加密，私钥解密） |
| 速度 | 快（适合大数据量） | 慢（数学运算复杂，约慢1000倍） |
| 安全性 | 密钥分发是难题 | 公钥可公开，私钥保密 |
| 常见算法 | AES-256-GCM、ChaCha20 | RSA-2048、ECC-P256 |
| 应用场景 | 数据传输加密 | 密钥交换、数字签名 |
| 密钥长度 | AES-128/192/256位 | RSA-2048/4096位 |

**HTTPS中的混合加密方案：**

```text
握手阶段（非对称加密）：
Client → Server: 我要建立安全连接
Server → Client: 这是我的公钥（在证书中）
Client → Server: [用公钥加密] 这是我们的对称密钥
→ 安全地交换了对称密钥

数据传输阶段（对称加密）：
Client ←→ Server: [用对称密钥加密] 业务数据...
→ 高效地加密传输大量数据
```

```js
// Node.js 示例
const crypto = require('crypto')

// 对称加密（AES-256-GCM）
const key = crypto.randomBytes(32)
const iv = crypto.randomBytes(16)
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
const encrypted = Buffer.concat([cipher.update('敏感数据'), cipher.final()])
const tag = cipher.getAuthTag()  // GCM认证标签

// 解密
const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
decipher.setAuthTag(tag)
const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])

// 非对称加密（RSA）
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
const enc = crypto.publicEncrypt(publicKey, Buffer.from('密钥'))
const dec = crypto.privateDecrypt(privateKey, enc)
```

**知识点：** `对称加密` `非对称加密` `AES` `RSA` `混合加密` `HTTPS`

:::

### Q5: HTTPS 一定安全吗？什么情况下不安全？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HTTPS 不是绝对安全的，以下情况可能被攻击：**

| 攻击方式 | 原理 | 防范 |
|---------|------|------|
| 中间人攻击(MITM) | 伪造证书，拦截通信 | 证书固定(Certificate Pinning) |
| 证书伪造 | CA被入侵或签发不当 | HSTS + 证书透明度(CT) |
| 降级攻击 | 强制HTTP连接 | HSTS强制HTTPS |
| DNS劫持 | 篡改DNS指向恶意服务器 | DNSSEC + DoH |
| Charles/Fiddler代理 | 用户主动信任代理证书 | 不安装不信任的CA证书 |

```text
正常 HTTPS 通信：
Client ←→ TLS ←→ Server  ✅ 加密

中间人攻击：
Client ←→ TLS(MITM) ←→ TLS ←→ Server
         ↑ 伪造证书          ↑ 真实证书
         攻击者解密再加密
```

**实际不安全场景：**

1. **自己安装代理证书**：用Charles/Fiddler抓包时，等于信任了中间人
2. **公共WiFi**：可能遭遇DNS劫持+伪造证书
3. **过时浏览器**：不支持最新TLS版本
4. **混合内容**：HTTPS页面加载HTTP资源（浏览器会警告）
5. **服务端配置不当**：支持弱密钥套件
6. **CA机构被入侵**：如DigiNotar事件（2011年）

**防御措施：**

```nginx
# Nginx 安全配置
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'" always;
add_header X-Frame-Options "SAMEORIGIN" always;
```

**知识点：** `HTTPS安全` `中间人攻击` `HSTS` `证书固定` `证书透明度`

:::

### Q6: 中间人攻击如何防护？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**中间人攻击(MITM)**：攻击者位于通信双方之间，可以窃听、篡改数据。

```text
攻击场景：
1. 公共WiFi — 攻击者创建同名热点
2. ARP欺骗 — 局域网内劫持流量
3. DNS劫持 — 将域名解析到攻击者IP
4. 伪造证书 — 拦截HTTPS通信
```

**防护措施（按防御层级）：**

| 防御 | 作用 | 实现方式 | 防护层级 |
|------|------|---------|---------|
| HSTS | 防SSL降级 | `Strict-Transport-Security` 响应头 | 传输层 |
| Certificate Pinning | 防伪造证书 | 代码写死证书指纹 | 应用层 |
| 证书透明度(CT) | 审计证书签发 | `Expect-CT` 响应头 | CA层 |
| DNSSEC | 防DNS劫持 | DNS数字签名 | DNS层 |
| DoH/DoT | 防DNS窃听 | DNS over HTTPS/TLS | DNS层 |
| SRI | 防CDN劫持 | `integrity` 属性 | 资源层 |

```js
// 1. Certificate Pinning（移动端常用）
// Android
val pin = "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAA="
val certificatePinner = CertificatePinner.Builder()
  .add("example.com", pin)
  .build()

// 2. CSP 防止加载不安全资源
Content-Security-Policy: default-src https:; script-src https://cdn.example.com

// 3. SRI 防止CDN劫持
<script src="https://cdn.example.com/app.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxT9O7p1mY4p5P6X6f7g+d3p2+5h5G"
  crossorigin="anonymous"></script>
```

**开发者最佳实践：**
- 所有页面强制HTTPS（HSTS Preload）
- API只接受HTTPS请求
- 不忽略证书错误
- 不在公共WiFi上操作敏感信息
- 敏感操作二次验证

**知识点：** `中间人攻击` `证书固定` `HSTS` `CT` `DNSSEC` `SRI`

:::

### Q7: HTTP/2 多路复用原理是什么？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HTTP/1.1 问题 — 队头阻塞：**

```text
HTTP/1.1 同一连接只能串行处理请求：
请求1 ──→ 响应1 ──→ 请求2 ──→ 响应2 ──→ 请求3 ──→ 响应3
                 阻塞

解决方案：浏览器开6个TCP连接并行请求（但连接数有限）
```

**HTTP/2 多路复用：**

```text
HTTP/2 在一个TCP连接上同时传输多个请求/响应：

连接1 ─── ┌── 流1: 请求A → 响应A ──┐
          ├── 流2: 请求B → 响应B ──┤
          └── 流3: 请求C → 响应C ──┘

关键：每个请求/响应被拆分为多个帧，交错传输
```

**HTTP/2 核心概念：**

| 概念 | 说明 |
|------|------|
| 帧(Frame) | 最小通信单位，HEADERS帧/DATA帧/SETTINGS帧等 |
| 流(Stream) | 双向字节流，一个请求-响应对应一个流 |
| 消息(Message) | 一个完整的请求或响应，由多个帧组成 |

```text
帧结构：
+-----------------------------------------------+
|   Length (24)   | Type (8) | Flags (8) | R (1) |
+-----------------------------------------------+
|                 Stream Identifier (31)         |
+-----------------------------------------------+
|                  Frame Payload ...              |
+-----------------------------------------------+

流特性：
- 每个流有唯一ID（客户端奇数，服务端偶数）
- 流可以双向传输
- 流可以设置优先级和依赖关系
- 流可以由任一方关闭
```

**HTTP/1.1 vs HTTP/2 对比：**

| 维度 | HTTP/1.1 | HTTP/2 |
|------|---------|--------|
| 连接复用 | 需6个TCP连接 | 1个连接即可 |
| 请求/响应 | 串行 | 并行（多路复用） |
| 头部传输 | 每次完整发送 | HPACK压缩 |
| 优先级 | 无 | 流优先级 |
| 服务器推送 | 无 | Server Push |

**注意：HTTP/2 仍有TCP层队头阻塞**

```text
HTTP/2 解决了HTTP层队头阻塞
但 TCP 层丢包仍会阻塞所有流：
流1: ■ ■ □ □ □ □  ← 一个包丢失
流2: ■ ■ ■ ■ ■ ■  ← 被迫等待
流3: ■ ■ ■ ■ ■ ■  ← 被迫等待

HTTP/3 (QUIC) 解决了这个问题：每个流独立
```

**知识点：** `HTTP/2` `多路复用` `帧` `流` `队头阻塞` `QUIC`

:::

### Q8: HTTP/2 HPACK 头部压缩原理？

> **💀 困难 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HPACK** 是 HTTP/2 的头部压缩算法，解决了 HTTP/1.x 每次请求都发送重复头部的问题。

```text
HTTP/1.x 问题：
请求1: :method GET /api/users  Host: example.com  User-Agent: Chrome ...
请求2: :method GET /api/posts  Host: example.com  User-Agent: Chrome ...
→ 每次都发送大量重复头部，浪费带宽！
```

**HPACK 三大机制：**

| 机制 | 说明 | 效果 |
|------|------|------|
| 静态表 | 61个常见头部字段预定义 | 常见头部1字节编码 |
| 动态表 | 双方维护的FIFO表，存储自定义/重复头部 | 相同头部1字节索引 |
| Huffman编码 | 对字符串值进行压缩 | 平均减少30%长度 |

**静态表示例：**

```text
索引1  → :authority
索引2  → :method GET
索引3  → :method POST
索引4  → :path /
索引5  → :path /index.html
索引16 → accept-encoding
索引49 → accept-encoding: gzip, deflate
索引58 → user-agent

编码：头部字段 → 索引号（1-2字节）
例如 ":method GET" → 索引2 → 仅需1字节！
```

**动态表工作流程：**

```text
首次请求：
  cookie: sessionid=abc123  → 新增到动态表（索引62）
  → 传输完整值

后续请求：
  cookie: sessionid=abc123  → 查动态表命中（索引62）
  → 只传输索引号62（1字节！）

动态表特性：
- 连接级别（每个连接独立）
- FIFO策略（超出容量时淘汰最早的条目）
- 双方各自维护（编解码同步）
```

**Huffman 编码：**

```text
原始值：accept-encoding（15字节）
Huffman：高频字符用短编码 → 约8字节
组合效果：首次约减少50%，后续约减少90%
```

**压缩效果对比：**

```text
原始HTTP/1.x头部 ≈ 800字节
HPACK首次请求   ≈ 400字节（50%压缩率）
HPACK后续请求   ≈ 50字节（94%压缩率！）
```

**知识点：** `HTTP/2` `HPACK` `头部压缩` `静态表` `动态表` `Huffman编码`

:::

### Q9: HTTPS 降级攻击及防护

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**降级攻击（Downgrade Attack）**：攻击者强制通信双方使用较弱的安全协议版本或加密套件。

**SSL Stripping 攻击流程：**

```text
1. 用户输入 example.com（浏览器默认http）
2. 请求 http://example.com
3. 服务器返回 302 重定向到 https://example.com
4. 攻击者拦截302响应，改为继续http
5. 用户以为访问安全，实际在http明文传输
6. 攻击者与服务器保持HTTPS连接（双向代理）

  User ←── HTTP ──→ Attacker ←── HTTPS ──→ Server
         明文可见                     加密传输
```

**协议降级攻击：**

```text
1. 攻击者修改ClientHello，只支持TLS 1.0
2. 服务器被迫使用弱版本TLS
3. 攻击者利用TLS 1.0的漏洞（如BEAST/POODLE）
```

**防护措施：**

| 方案 | 原理 | 效果 |
|------|------|------|
| HSTS | 浏览器只使用HTTPS | 防SSL Stripping |
| HSTS Preload | 内置浏览器中的域名列表 | 首次访问也保护 |
| TLS降级保护 | TLS 1.3 handshake中嵌入服务端支持的最高版本 | 防协议降级 |
| 服务器配置 | 禁用TLS 1.0/1.1 | 消除弱版本 |

```nginx
# Nginx 防降级配置
# 1. HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# 2. 只允许TLS 1.2+
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

# 3. 禁用不安全套件
# 不要使用 RC4, DES, 3DES, MD5
```

**HSTS Preload 提交流程：**

```text
1. 配置HSTS响应头（max-age至少1年 + includeSubDomains + preload）
2. 提交到 hstspreload.org
3. Chrome/Firefox/Edge等浏览器内置该域名
4. 首次访问也强制HTTPS，无需先请求HTTP
```

**知识点：** `降级攻击` `SSL Stripping` `HSTS` `HSTS Preload` `TLS版本`

:::

### Q10: HTTPS 性能优化方案有哪些？

> **🔥 中等 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HTTPS 性能开销主要来源：**

```text
1. TLS握手延迟 — 增加1-2个RTT
2. 加密计算开销 — CPU消耗
3. 证书验证 — CRL/OCSP查询
4. 会话不可复用 — 每次重新握手
```

**优化方案：**

| 方案 | 原理 | 效果 |
|------|------|------|
| TLS会话复用 | 复用上次握手结果 | 减少1-RTT |
| OCSP Stapling | 服务器附带证书状态 | 减少客户端OCSP查询 |
| HTTP/2 | 多路复用 | 减少连接数 |
| TLS 1.3 | 1-RTT握手 | 降低握手延迟 |
| 0-RTT | 复用会话密钥 | 首包即发数据 |
| 硬件加速 | 专用加密卡 | 降低CPU开销 |
| ECDHE | 更快的密钥交换 | 比RSA快 |

**TLS会话复用方案：**

```nginx
# 1. Session ID 复用
ssl_session_cache shared:SSL:10m;   # 10MB缓存约4万个会话
ssl_session_timeout 1d;               # 1天有效期

# 2. Session Ticket 复用（推荐）
ssl_session_tickets on;
ssl_session_ticket_key /etc/nginx/ticket.key;  # 定期轮换密钥

# 区别：
# Session ID: 服务端存储会话状态，有状态
# Session Ticket: 客户端存储加密的会话信息，无状态
```

```nginx
# OCSP Stapling — 服务器主动附带OCSP响应
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/nginx/ca.crt;
resolver 8.8.8.8 8.8.4.4 valid=300s;

# 效果：客户端不需要自己去查询OCSP，减少1个RTT
```

```nginx
# 完整HTTPS优化配置
server {
    listen 443 ssl http2;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384;
    
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets on;
    
    ssl_stapling on;
    ssl_stapling_verify on;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}
```

**性能优化效果对比：**

| 优化组合 | 首次连接 | 后续连接 |
|---------|---------|---------|
| 无优化 | 3-RTT | 3-RTT |
| Session复用 | 3-RTT | 2-RTT |
| +OCSP Stapling | 2-RTT | 2-RTT |
| +TLS 1.3 | 1-RTT | 0-RTT |

**知识点：** `HTTPS优化` `会话复用` `OCSP Stapling` `TLS 1.3` `HTTP/2`

:::

### Q11: TLS 1.3 的 0-RTT 握手原理及风险

> **💀 困难 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**0-RTT（Zero Round Trip Time）**：复用之前会话的密钥信息，在首次请求时就携带应用数据。

```text
首次连接（1-RTT）：
Client → Server: ClientHello + KeyShare
Server → Client: ServerHello + KeyShare + Certificate + Finished
Client → Server: Finished + [应用数据]

后续连接（0-RTT）：
Client → Server: ClientHello + KeyShare + Early Data + Finished
                           ↑ 首包就携带应用数据！
Server → Client: ServerHello + Finished + [应用数据]
```

```js
// 服务端配置 0-RTT（Nginx）
ssl_early_data on;

// 代理配置 — 转发 Early Data
proxy_set_header Early-Data $ssl_early_data;
```

**0-RTT 工作原理：**

```text
1. 首次握手后，服务器发送 NewSessionTicket
2. 客户端保存会话信息（包含PSK - Pre-Shared Key）
3. 后续连接时，客户端用PSK加密Early Data
4. 首个请求就携带加密的应用数据
```

**0-RTT 的风险 — 重放攻击：**

```text
攻击场景：
1. 用户发送 POST /api/transfer 100元（0-RTT Early Data）
2. 攻击者截获这个请求
3. 攻击者重放该请求给服务器
4. 服务器可能执行两次转账！

核心问题：0-RTT数据无法保证新鲜度
服务器无法区分是首次请求还是重放的请求
```

**安全使用0-RTT的规则：**

| 操作类型 | 是否安全 | 示例 |
|---------|---------|------|
| 幂等GET请求 | ✅ 安全 | GET /api/user |
| 只读查询 | ✅ 安全 | 搜索、浏览 |
| 非幂等写操作 | ❌ 不安全 | POST /api/pay, POST /api/transfer |
| 状态变更 | ❌ 不安全 | 修改密码、删除数据 |

**服务端防范重放攻击：**

```js
// 1. 检查 Early-Data 头部
app.use((req, res, next) => {
  if (req.headers['early-data'] === '1') {
    // 0-RTT请求，只允许幂等操作
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return res.status(425).send('Too Early')  // HTTP 425
    }
  }
  next()
})

// 2. 使用单次票据（Single-Use Ticket）
// 每个Session Ticket只能用一次
// 服务器记录已使用的Ticket，拒绝重复

// 3. 限制时间窗口
// 0-RTT数据只在短时间内有效（如5分钟）
```

**HTTP 425 Too Early：** 专门为0-RTT风险设计的状态码，告诉客户端重试但不使用Early Data。

**知识点：** `TLS 1.3` `0-RTT` `重放攻击` `Early Data` `HTTP 425` `幂等性`

:::

### Q12: 如何劫持 HTTPS 请求？

> **💀 困难 · 网络**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

⚠️ **仅供安全学习和防御参考，禁止用于非法用途。**

**1. 代理工具劫持（Charles/Fiddler/mitmproxy）**

```text
原理：用户主动信任代理的CA证书
流程：
1. 代理生成自己的CA证书
2. 用户安装并信任该CA证书
3. 代理拦截HTTPS请求
4. 代理用自己CA签发伪造证书给客户端
5. 代理用真实证书连接服务端
6. 代理可以解密查看所有内容

  Client ←→ MITM Proxy ←→ Server
         伪造证书    真实证书
```

**2. 中间人攻击（无用户配合）**

```text
条件：需要能控制网络中的某个节点
方式：
- ARP欺骗：让流量经过攻击者
- DNS劫持：将域名解析到攻击者IP
- WiFi热点：伪造公共WiFi
- BGP劫持：篡改路由

限制：即使劫持了连接，没有有效证书浏览器会警告
```

**3. SSL Stripping（降级攻击）**

```text
原理：将HTTPS链接降级为HTTP
流程：
1. 用户访问 http://example.com
2. 服务器返回302重定向到 https://example.com
3. 攻击者拦截302，改为不跳转
4. 用户继续使用HTTP，攻击者可以查看所有内容
5. 攻击者同时与服务器建立HTTPS连接（双向代理）

防范：HSTS（Strict-Transport-Security）
```

**4. 伪造/窃取CA证书**

```text
历史事件：
- DigiNotar被入侵，签发了大量伪造证书（2011）
- Willis证书签发错误（2020）
- 政府级CA滥用签发

防范：证书透明度(CT)日志 + HSTS Preload
```

**防御措施汇总：**

| 防御 | 作用 | 实现方式 |
|------|------|---------|
| HSTS | 防SSL降级 | `Strict-Transport-Security` 响应头 |
| Certificate Pinning | 防伪造证书 | 代码写死证书hash |
| CT日志 | 审计证书签发 | `Expect-CT` 响应头 |
| DNSSEC | 防DNS劫持 | DNS数字签名 |
| DoH/DoT | 防DNS窃听 | DNS over HTTPS/TLS |

**知识点：** `HTTPS劫持` `中间人攻击` `SSL降级` `证书伪造` `HSTS` `安全防御`

:::
---

### Q13: TLS 1.2 和 TLS 1.3 的握手过程有什么区别？

> **🔥 中等 · TLS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**TLS 1.3 相比 TLS 1.2 最大的改进是握手延迟从 2-RTT 降低到 1-RTT（甚至 0-RTT），并移除了不安全的加密算法。**

**1. TLS 1.2 握手流程（2-RTT）：**

```text
TLS 1.2 完整握手：
Client                  Server
   │── ClientHello ────►│
   │                    │ (选择 cipher suite)
   │◄─── ServerHello ───│
   │◄─── Certificate ───│
   │◄─── ServerKeyEx ───│
   │◄─── ServerHelloDone │
   │                    │ (验证证书)
   │── ClientKeyEx ────►│
   │── ChangeCipher ────►│
   │── Finished ────────►│
   │◄── ChangeCipher ───│
   │◄── Finished ───────│
总耗时：2 个 RTT
```

**2. TLS 1.3 握手流程（1-RTT）：**

```text
TLS 1.3 完整握手：
Client                  Server
   │── ClientHello ────►│ (包含密钥共享)
   │                    │ (选择 cipher suite)
   │                    │ (生成密钥)
   │◄─── ServerHello ───│ (包含密钥共享)
   │◄─── Certificate ───│
   │◄─── CertificateVrf ─│
   │◄─── Finished ──────│
   │                    │ (验证证书，生成密钥)
   │── Finished ────────►│
   │                    │ 开始加密通信
总耗时：1 个 RTT
```

**3. 关键区别对比：**

| 特性 | TLS 1.2 | TLS 1.3 |
|------|---------|---------|
| 握手腕 RTT | 2 RTT | 1 RTT |
| 0-RTT 支持 | ❌ | ✅（复用连接） |
| 密钥交换 | RSA 或 DH | 仅 ECDHE |
| 加密启动 | 最后一步 | ServerHello 后即可 |
| Cipher 套件 | 多种（含不安全） | 仅 5 种安全套件 |
| 会话恢复 | Session ID/Ticket | 仅 Ticket + PSK |
| 证书加密 | ❌ | ✅（部分） |

**4. TLS 1.3 移除的不安全特性：**

```text
TLS 1.2 支持但 TLS 1.3 移除：
❌ RSA 密钥交换（无前向保密）
❌ SHA-1 哈希
❌ RC4 流密码
❌ CBC 模式密码（BEAST、Lucky13 攻击）
❌ 静态 DH
❌ 压缩（CRIME 攻击）
❌ 重协商
❌ 自定义 DHE 群

TLS 1.3 仅支持：
✅ AEAD 加密（GCM、CCM、ChaCha20）
✅ ECDHE 密钥交换（前向保密）
✅ SHA-256/SHA-384 哈希
```

**5. 0-RTT 握手（TLS 1.3 复用）：**

```text
TLS 1.3 0-RTT（会话恢复）：
Client                  Server
   │── ClientHello ────►│ (包含 PSK 和 0-RTT 数据)
   │   + 0-RTT Data     │
   │                    │ (验证 PSK)
   │◄─── ServerHello ───│
   │◄─── Finished ──────│
   │── Finished ────────►│
   │                    │ 立即处理 0-RTT 数据
总耗时：0 RTT（应用数据即时发送）

风险：0-RTT 数据不防重放攻击！
```

**6. 性能对比实测：**

```javascript
// TLS 1.2 首次连接
const start = Date.now();
await fetch('https://example.com');
console.log(Date.now() - start); // ~300-500ms (2 RTT)

// TLS 1.3 首次连接
await fetch('https://example.com');
console.log(Date.now() - start); // ~150-250ms (1 RTT)

// TLS 1.3 0-RTT 复用
await fetch('https://example.com');
console.log(Date.now() - start); // ~50-100ms (0 RTT)
```

**知识点：** `TLS 1.2` `TLS 1.3` `握手过程` `1-RTT` `0-RTT` `前向保密` `性能优化`

:::

---

### Q14: 证书链验证的过程是什么？根证书从哪里来？

> **🔥 中等 · 证书`

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**证书链验证是 HTTPS 建立信任的核心机制，根证书预装在操作系统和浏览器中。**

**1. 证书链结构：**

```text
证书链层级：
┌─────────────────────────────────┐
│  根证书 (Root CA)               │
│  - 自签名                       │
│  - 预装在 OS/浏览器信任库       │
│  - 有效期长（10-20 年）          │
│  - 离线存储，极少使用           │
└────────────┬────────────────────┘
             │ 签名
             ▼
┌─────────────────────────────────┐
│  中间证书 (Intermediate CA)     │
│  - 由根证书签名                 │
│  - 可多层级联                   │
│  - 有效期中等（5-10 年）         │
│  - 在线签发终端证书             │
└────────────┬────────────────────┘
             │ 签名
             ▼
┌─────────────────────────────────┐
│  终端证书 (Leaf/Server Cert)    │
│  - 由中间证书签名               │
│  - 绑定域名和公钥               │
│  - 有效期短（1-2 年）            │
│  - 部署在服务器                 │
└─────────────────────────────────┘
```

**2. 证书链验证流程：**

```text
验证步骤：
1. 获取服务器证书（Leaf）
2. 获取中间证书（服务器发送或 AIA 下载）
3. 验证 Leaf 证书：
   - 中间证书的公钥验证 Leaf 的签名
   - 检查有效期
   - 检查域名匹配（CN/SAN）
   - 检查 CRL/OCSP 吊销状态
4. 验证中间证书：
   - 根证书的公钥验证中间证书的签名
   - 检查有效期
   - 检查 CA 约束扩展
5. 验证根证书：
   - 是否在本地信任库中
   - 是否自签名且有效
6. 构建完整信任链：Root → Intermediate → Leaf
```

**3. 根证书来源：**

```text
根证书信任库：
┌─────────────────────────────────────────────┐
│  操作系统信任库                              │
│  - Windows: Certificate Trust List (CTL)    │
│  - macOS: Keychain System                   │
│  - Linux: /etc/ssl/certs/ca-certificates    │
│  - Android: System CA Store                 │
│  - iOS: Trust Store                         │
├─────────────────────────────────────────────┤
│  浏览器信任库                                │
│  - Chrome/Chromium: 使用 OS 信任库          │
│  - Firefox: 独立信任库（ NSS ）              │
│  - Safari: 使用 macOS 信任库               │
│  - Edge: 使用 Windows 信任库                │
└─────────────────────────────────────────────┘

根证书颁发机构：
- DigiCert（收购 Symantec）
- Let's Encrypt（免费，ISRG 根）
- GlobalSign
- Sectigo（原 Comodo）
- Entrust
- GeoTrust（DigiCert 旗下）
```

**4. 证书链验证代码示例：**

```javascript
// Node.js 验证证书链
const tls = require('tls');
const https = require('https');

const socket = tls.connect(443, 'example.com', () => {
  const cert = socket.getPeerCertificate(true);
  
  // 证书链
  console.log('证书链:', cert.issuerCertificate);
  
  // 验证状态
  console.log('验证错误:', socket.authorizationError);
  
  // 证书信息
  console.log('域名:', cert.subject.CN);
  console.log('颁发者:', cert.issuer.CN);
  console.log('有效期:', cert.valid_from, cert.valid_to);
});

socket.on('secureConnect', () => {
  console.log('✅ 证书验证通过');
});
```

**5. 常见证书链问题：**

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 证书链不完整 | 服务器未发送中间证书 | 配置服务器发送完整链 |
| 根证书不受信任 | 自签名或私有 CA | 安装根证书到信任库 |
| 证书过期 | 未续费 | 更新证书 |
| 域名不匹配 | 证书 CN/SAN 不匹配 | 申请正确域名证书 |
| 证书被吊销 | 私钥泄露等 | 重新申请证书 |

**6. 证书透明度（CT）：**

```text
CT 日志作用：
- 公开记录所有签发的 SSL 证书
- 防止 CA 恶意签发证书
- 浏览器强制要求 CT（Chrome 等）

验证流程：
1. CA 签发证书后提交到 CT 日志
2. CT 日志返回 Signed Certificate Timestamp (SCT)
3. 浏览器验证 SCT 存在性
4. 无有效 SCT 的证书不被信任
```

**知识点：** `证书链` `根证书` `CA` `信任库` `证书验证` `中间证书` `证书透明度`

:::

---

### Q15: HSTS 是什么？为什么需要它？

> **🔥 中等 · 安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HSTS（HTTP Strict Transport Security）是强制客户端使用 HTTPS 的安全机制，防止 SSL 剥离攻击。**

**1. HTTP 到 HTTPS 的安全问题：**

```text
无 HSTS 的攻击场景（SSL 剥离）：
1. 用户输入：http://example.com 或 example.com
2. 浏览器发起 HTTP 请求
3. 攻击者拦截 HTTP 请求
4. 攻击者阻止 301/302 重定向到 HTTPS
5. 用户继续通过 HTTP 通信（明文）
6. 攻击者窃取 Cookie、密码等敏感信息

即使网站配置了 HTTPS 重定向：
HTTP 请求 → 301 → HTTPS
      ↑
   攻击点：首次 HTTP 请求未加密
```

**2. HSTS 工作原理：**

```text
HSTS 工作流程：
1. 服务器响应包含 HSTS 头：
   Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

2. 浏览器记录 HSTS 策略（31536000 秒 = 1 年）

3. 后续访问（1 年内）：
   - 用户输入 http://example.com
   - 浏览器自动转换为 https://example.com
   - 不发起任何 HTTP 请求
   
4. 如果 HTTPS 证书无效：
   - 浏览器显示错误页面
   - 不允许用户绕过（无"继续访问"选项）
```

**3. HSTS 响应头详解：**

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

参数说明：
- max-age=31536000: HSTS 有效期（秒），建议至少 1 年
- includeSubDomains: 应用于所有子域名
- preload: 可提交到浏览器预加载列表
```

**4. HSTS 预加载列表：**

```text
预加载优势：
- 首次访问也强制 HTTPS（无需等待服务器响应头）
- 防止首次 HTTP 请求被攻击

提交预加载：
1. 网站配置 HSTS（至少 1 年+includeSubDomains+preload）
2. 提交到 https://hstspreload.org
3. 审核通过后进入 Chrome 预加载列表
4. 其他浏览器同步使用（Firefox、Safari、Edge）

检查是否预加载：
https://hstspreload.org/?domain=example.com
```

**5. 浏览器 HSTS 行为：**

```javascript
// 浏览器 HSTS 处理逻辑
if (域名在 HSTS 列表) {
  if (协议 === 'http') {
    自动替换为 'https'; // 内部替换，用户无感知
  }
  if (证书无效) {
    显示错误页面; // 不允许绕过
    不显示"继续访问"按钮;
  }
}

// 开发者工具查看 HSTS
// Chrome: chrome://net-internals/#hsts
// 查询域名 HSTS 状态
```

**6. HSTS 配置示例：**

```nginx
# Nginx 配置
server {
    listen 443 ssl http2;
    server_name example.com;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # 其他 SSL 配置...
}

# Apache 配置
<IfModule mod_headers.c>
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
</IfModule>

# Express.js 配置
const helmet = require('helmet');
app.use(helmet.hsts({
  maxAge: 31536000,
  includeSubDomains: true,
  preload: true
}));
```

**7. HSTS 局限性与注意事项：**

| 问题 | 说明 | 解决方案 |
|------|------|----------|
| 首次访问无效 | 需要至少一次 HTTPS 响应 | 使用预加载列表 |
| 无法回退 | 一旦设置，有效期强制 HTTPS | 谨慎设置 max-age |
| 子域名风险 | includeSubDomains 影响所有子域名 | 确保所有子域名支持 HTTPS |
| 开发环境 | 本地开发可能受影响 | 使用独立域名或清除 HSTS |

**8. 清除 HSTS（开发调试）：**

```text
Chrome 清除 HSTS：
1. 访问 chrome://net-internals/#hsts
2. 在 "Delete domain security policies" 输入域名
3. 点击 Delete

注意：生产环境不要轻易清除！
```

**知识点：** `HSTS` `SSL 剥离` `HTTPS` `安全头` `预加载` `强制 HTTPS`

:::

