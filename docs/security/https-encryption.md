---
title: HTTPS 与加密
description: 前端安全加密考点：TLS 握手流程、TLS 1.3 改进、对称与非对称加密、数字证书链、HSTS、证书固定、混合内容
---

# HTTPS 与加密

### Q1: 请解释 HTTPS 的工作原理，特别是 TLS 握手的过程。

> **⭐ 简单 · 安全**

::: details 点击查看答案与解析

HTTPS = HTTP + TLS/SSL，在 TCP 连接建立后，通过 TLS 协议建立加密通道，再进行 HTTP 通信。

**TLS 1.2 握手流程（完整版）：**

```
客户端                                    服务端
  |                                         |
  |  1. ClientHello                         |
  |  (支持的TLS版本、加密套件列表、           |
  |   随机数R1、压缩方法)                    |
  | --------------------------------------> |
  |                                         |
  |            2. ServerHello                |
  |  (选定的TLS版本、加密套件、               |
  |   随机数R2、压缩方法)                    |
  |  + Certificate (服务端证书)              |
  |  + ServerKeyExchange (DH参数，可选)      |
  |  + ServerHelloDone                      |
  | <-------------------------------------- |
  |                                         |
  |  3. 客户端验证证书                       |
  |  4. KeyExchange (客户端DH参数/           |
  |     Pre-Master Secret加密)              |
  |  + ChangeCipherSpec                     |
  |  + Finished (加密握手消息)               |
  | --------------------------------------> |
  |                                         |
  |            5. ChangeCipherSpec           |
  |            + Finished                    |
  | <-------------------------------------- |
  |                                         |
  |  6. 双方使用协商的对称密钥加密通信         |
  | <======================================> |
```

**核心步骤解析：**

1. **协商参数**：客户端和服务端就 TLS 版本、加密算法达成一致
2. **身份验证**：客户端验证服务端证书的合法性
3. **密钥交换**：双方协商出会话密钥（对称密钥）
4. **加密通信**：使用会话密钥进行对称加密通信

**密钥生成过程：**

```
R1(客户端随机) + R2(服务端随机) + Pre-Master Secret
                    ↓
            Master Secret（主密钥）
                    ↓
    会话密钥（加密密钥 + MAC密钥 + IV）
```

**知识点：** `HTTPS` `TLS握手` `密钥协商` `证书验证`

:::

### Q2: TLS 1.3 相比 TLS 1.2 有哪些改进？

> **⭐ 中等 · 安全**

::: details 点击查看答案与解析

**TLS 1.3 的核心改进：**

**1. 握手从 2-RTT 缩短到 1-RTT**

```
TLS 1.2: ClientHello → ServerHello + Certificate + KeyExchange → ClientKeyExchange → Finished
        （2-RTT 才能开始加密通信）

TLS 1.3: ClientHello + KeyShare → ServerHello + KeyShare + Certificate + Finished
        （1-RTT 即可开始加密通信）
```

**2. 支持 0-RTT 恢复**

```
// 之前连接过的情况下，客户端可以在第一条消息中携带应用数据
ClientHello + KeyShare + EarlyData → ServerHello + KeyShare + Finished + EarlyData
（0-RTT 恢复，但有前向安全性和重放攻击的风险）
```

**3. 精简密码套件**

```
TLS 1.2 支持的算法（大量，部分不安全）：
- RSA 密钥交换
- CBC 模式加密
- SHA-1 Hash
- RC4、3DES 等

TLS 1.3 只保留 5 个密码套件（全部安全）：
- TLS_AES_128_GCM_SHA256
- TLS_AES_256_GCM_SHA384
- TLS_CHACHA20_POLY1305_SHA256
- TLS_AES_128_CCM_SHA256
- TLS_AES_128_CCM_8_SHA256
```

**4. 强制 PFS（前向安全性）**

```
TLS 1.2：支持 RSA 密钥交换（不具备前向安全性）
TLS 1.3：只支持 ECDHE/DHE 密钥交换（强制前向安全性）

// 前向安全性意味着：
// 即使服务端私钥泄露，历史通信记录也无法被解密
```

**5. 移除不安全特性**

| 移除的特性 | 原因 |
| --- | --- |
| RSA 密钥交换 | 不具备前向安全性 |
| CBC 模式加密 | 易受 BEAST/Lucky13 攻击 |
| RC4 加密 | 已被破解 |
| SHA-1 | 碰撞攻击 |
| 压缩协商 | CRIME 攻击 |
| 重新协商 | 可被利用进行注入攻击 |
| 非AEAD加密 | 无法同时保护机密性和完整性 |

**6. 握手加密更早**

```js
// TLS 1.2：握手消息大部分是明文
// TLS 1.3：ServerHello 之后的握手消息都是加密的
// 证书信息不再明文传输，保护了用户隐私
```

**知识点：** `TLS1.3` `0-RTT` `前向安全性` `密码套件` `AEAD`

:::

### Q3: 对称加密与非对称加密有什么区别？HTTPS 中是如何结合使用的？

> **⭐ 简单 · 安全**

::: details 点击查看答案与解析

**对称加密 vs 非对称加密：**

| 对比维度 | 对称加密 | 非对称加密 |
| --- | --- | --- |
| 密钥数量 | 1个（加解密用同一个密钥） | 2个（公钥加密，私钥解密） |
| 代表算法 | AES、ChaCha20、3DES | RSA、ECC、DSA |
| 速度 | 快（适合大数据量） | 慢（比对称加密慢100-1000倍） |
| 安全性 | 密钥分发困难 | 密钥分发容易 |
| 典型用途 | 数据加密传输 | 密钥交换、数字签名 |

**HTTPS 中的结合使用（混合加密）：**

```
1. 【非对称加密】用于安全的密钥协商
   - 客户端用服务端公钥加密 Pre-Master Secret
   - 服务端用私钥解密
   - 目的：安全地协商出对称密钥

2. 【对称加密】用于实际数据传输
   - 使用协商出的会话密钥加密 HTTP 数据
   - 目的：高效地加密大量数据

// 核心思路：用非对称加密解决密钥分发问题，用对称加密解决性能问题
```

**具体流程示例：**

```js
// 1. 客户端生成随机 Pre-Master Secret
const preMasterSecret = crypto.randomBytes(48);

// 2. 用服务端证书中的公钥加密
const encrypted = crypto.publicEncrypt(serverPublicKey, preMasterSecret);

// 3. 发送给服务端，服务端用私钥解密
const decrypted = crypto.privateDecrypt(serverPrivateKey, encrypted);

// 4. 双方从 Pre-Master Secret 派生出对称会话密钥
const masterSecret = PRF(preMasterSecret, clientRandom, serverRandom);
const sessionKey = deriveKey(masterSecret, 'client write key');

// 5. 后续所有通信使用 sessionKey 进行 AES 加密
const encryptedData = AES_GCM.encrypt(sessionKey, plaintext);
```

**为什么不全部用非对称加密？**

- 非对称加密速度极慢，RSA 加密 1MB 数据可能需要数秒
- 对称加密（如 AES-GCM）可以达到数 GB/s 的吞吐
- 实际 HTTPS 中 99.9% 的数据使用对称加密传输

**知识点：** `对称加密` `非对称加密` `混合加密` `AES` `RSA`

:::

### Q4: 请解释数字证书链的工作原理。浏览器是如何验证一个 HTTPS 网站的？

> **⭐ 中等 · 安全**

::: details 点击查看答案与解析

**数字证书链层级：**

```
根证书 (Root CA)
  └── 中间证书 (Intermediate CA)
        └── 终端证书 (End-entity / Leaf Certificate)
              └── example.com
```

**证书验证流程：**

```
1. 浏览器获取 example.com 的证书链：
   [Leaf Certificate] → [Intermediate CA Certificate] → [Root CA Certificate]

2. 逐级验证签名：
   - 用 Intermediate CA 的公钥验证 Leaf Certificate 的签名
   - 用 Root CA 的公钥验证 Intermediate CA 的签名
   - Root CA 的公钥从浏览器内置的根证书库中获取

3. 验证证书字段：
   - 证书是否在有效期内（Not Before ~ Not After）
   - 证书的 CN/SAN 是否匹配访问的域名
   - 证书是否被吊销（CRL / OCSP）

4. 验证通过，建立连接
```

**证书内容示例：**

```
终端证书 (Leaf Certificate)：
  - 版本：V3
  - 序列号：0A:F7:...
  - 签名算法：SHA256-RSA
  - 颁发者：Let's Encrypt Authority X3
  - 有效期：2024-01-01 ~ 2024-12-31
  - 使用者：CN=example.com
  - 公钥：RSA 2048-bit
  - SAN：example.com, www.example.com
  - 签名值：[用 Intermediate CA 私钥签名]
```

**OCSP 和 CRL：**

```js
// CRL (Certificate Revocation List) - 证书吊销列表
// 缺点：列表可能很大，更新不及时

// OCSP (Online Certificate Status Protocol) - 在线证书状态协议
// 优点：实时查询证书状态
// 请求：GET /OCSP?serial=0AF7...
// 响应：good | revoked | unknown

// OCSP Stapling - 服务端主动附上 OCSP 响应
// 避免客户端直接联系 CA，保护隐私且更快
```

**自签名证书为什么不被信任：**

- 自签名证书的签发者就是自己，不在浏览器内置的根证书库中
- 无法形成信任链
- 浏览器会显示"不安全"警告
- 用户可以选择手动信任，但存在中间人攻击风险

**知识点：** `证书链` `CA` `OCSP` `CRL` `证书验证`

:::

### Q5: 什么是 HSTS？它解决了什么问题？如何部署？

> **⭐ 中等 · 安全**

::: details 点击查看答案与解析

**HSTS（HTTP Strict Transport Security）** 是一种安全策略，告诉浏览器只能通过 HTTPS 访问网站，禁止降级到 HTTP。

**解决的问题：**

```
没有 HSTS 时的攻击场景：
1. 用户输入 example.com（浏览器默认用 HTTP）
2. 攻击者拦截 HTTP 请求（SSL 剥离攻击）
3. 攻击者伪装为代理，与服务器建立 HTTPS，与用户保持 HTTP
4. 用户数据以明文传输，被攻击者窃取

使用 HSTS 后：
1. 浏览器首次访问后记住 HSTS 策略
2. 之后用户输入 example.com，浏览器自动转为 HTTPS
3. 消除了 SSL 剥离攻击的窗口
```

**HSTS 响应头：**

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

| 参数 | 说明 |
| --- | --- |
| max-age | 策略有效期（秒），31536000 = 1年 |
| includeSubDomains | 策略涵盖所有子域名 |
| preload | 允许加入浏览器预加载列表 |

**部署步骤：**

**1. 服务端配置 HSTS 头**

```nginx
# Nginx 配置
server {
    listen 443 ssl;
    server_name example.com;

    # 基础配置：1年有效期 + 包含子域名
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 高级配置：加入预加载列表
    # add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
}
```

**2. HTTP 到 HTTPS 重定向**

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}
```

**3. 加入 HSTS Preload 列表（可选但推荐）**

```
1. 确保 HSTS 头包含 preload 指令
2. max-age 至少 63072000（2年）
3. includeSubDomains 必须设置
4. 访问 https://hstspreload.org/ 提交域名
5. 加入后，浏览器内置列表将强制 HTTPS，即使用户从未访问过
```

**注意事项：**

- 首次访问仍存在 SSL 剥离风险（浏览器还没收到 HSTS 头），Preload 列表可解决
- `includeSubDomains` 会影响所有子域名，确保所有子域名都已支持 HTTPS
- HSTS 策略一旦设置，在 max-age 过期前无法轻易撤销
- 建议先用较短的 max-age（如 300）测试，确认无误后再延长

**知识点：** `HSTS` `SSL剥离` `HTTPS降级` `Preload` `传输安全`

:::

### Q6: 什么是证书固定（Certificate Pinning）？它有什么优缺点？

> **⭐ 中等 · 安全**

::: details 点击查看答案与解析

证书固定（Certificate Pinning）是指客户端固定只信任特定的证书或公钥，而不完全依赖系统的 CA 信任链。

**为什么需要证书固定：**

```
普通 HTTPS 信任链的问题：
1. 系统内置了数百个根 CA
2. 任何一个 CA 被入侵或作恶，都可以签发伪造证书
3. 中间人可以伪造证书发起 MITM 攻击
4. 2011 年 DigiNotar CA 被入侵，签发了大量伪造证书

证书固定解决了：即使 CA 被攻破或政府强制签发证书，攻击者也无法冒充你的网站
```

**固定方式：**

```js
// 1. 固定完整证书（不推荐，证书轮换时需要更新）
// 2. 固定公钥（推荐，证书续期时公钥可以不变）
// 3. 固定公钥哈希（SPKI hash，最常用）

// 计算公钥指纹
const sha256 = require('crypto').createHash('sha256');
const spki = certificate.publicKey.export({ type: 'spki', format: 'der' });
const pin = sha256.update(spki).digest('base64');
// pin = "base64-encoded-sha256-hash"
```

**HTTP 公钥固定（HPKP，已废弃）：**

```
// 曾经通过 HTTP 头实现
Public-Key-Pins: pin-sha256="base64=="; max-age=5184000; includeSubDomains

// 2018 年已被 Chrome 废弃，因为配置错误会导致网站无法访问且难以恢复
```

**现代实现方式：**

**1. 移动端 App**

```swift
// iOS 实现
let pinnedCertificates = [ServerCertificate.googleCom]
let policy = ServerTrustManager(evaluators: [
    "google.com": PublicKeysTrustPerformers.performers(
        publicKeyHashes: ["hash1", "hash2"],
        performDefaultValidation: true,
        validateHost: true
    )
])
```

**2. 前端应用（有限支持）**

```js
// 浏览器原生不支持证书固定
// 替代方案1：使用 Service Worker 验证
self.addEventListener('fetch', event => {
  // 在 Service Worker 中验证证书信息（能力有限）
});

// 替代方案2：Expect-CT 头（要求证书透明度）
Expect-CT: max-age=86400, enforce, report-uri="https://example.com/report"

// 替代方案3：依赖 HSTS + 证书透明度（CT）
// Certificate Transparency 要求 CA 将签发记录写入公开日志
```

**优缺点：**

| 优点 | 缺点 |
| --- | --- |
| 防止 CA 作恶/被攻破 | 配置错误导致网站不可用 |
| 抵御中间人攻击 | 证书轮换复杂 |
| 增强安全性感知 | HPKP 已被废弃 |
| 移动端效果好 | Web 端缺乏原生支持 |

**知识点：** `证书固定` `HPKP` `SPKI` `Certificate Transparency` `公钥哈希`

:::

### Q7: 什么是混合内容？为什么 HTTPS 页面中不应加载 HTTP 资源？

> **⭐ 简单 · 安全**

::: details 点击查看答案与解析

**混合内容（Mixed Content）** 是指 HTTPS 页面中加载了 HTTP 资源，导致页面同时包含加密和非加密内容。

**分类：**

| 类型 | 示例 | 浏览器行为 |
| --- | --- | --- |
| 混合主动内容 | HTTP 的 script、iframe、XHR、Fetch | 自动阻断，页面功能异常 |
| 混合被动内容 | HTTP 的 img、audio、video、object | 可能加载但显示警告 |

**为什么危险：**

```
1. 安全性被整体削弱
   - HTTP 资源可被中间人篡改
   - 即使页面本身是 HTTPS，一个 HTTP 脚本可以让整个页面变得不安全

2. 混合主动内容的影响：
   - 攻击者注入恶意脚本 → 可窃取 HTTPS 页面的 Cookie
   - 可修改 DOM → 可伪造表单窃取用户输入
   - 可发起请求 → 可冒充用户操作

3. 混合被动内容的影响：
   - HTTP 图片可被替换为恶意内容
   - 用户隐私泄露（攻击者知道用户加载了什么资源）
   - Cookie 可能通过 HTTP 请求泄露
```

**检测和修复：**

```js
// 1. 使用 Chrome DevTools 检测
// 打开 Console，查看 Mixed Content 警告
// Security 面板可以查看所有混合内容

// 2. 使用 CSP 自动升级
// 所有 HTTP 资源自动升级为 HTTPS
Content-Security-Policy: upgrade-insecure-requests

// 3. 使用 <meta> 标签
// <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">

// 4. 手动修复：将所有 HTTP URL 改为 HTTPS
// 协议相对 URL（推荐）
<script src="//cdn.example.com/lib.js"></script>

// 或直接使用 HTTPS
<script src="https://cdn.example.com/lib.js"></script>
```

**CSP 阻断模式：**

```
// 阻断所有混合内容
Content-Security-Policy: block-all-mixed-content

// 注意：upgrade-insecure-requests 和 block-all-mixed-content 不要同时使用
// upgrade-insecure-requests 优先级更高
```

**知识点：** `混合内容` `Mixed Content` `upgrade-insecure-requests` `CSP`

:::

### Q8: 请解释前向安全性（Forward Secrecy）的概念及其重要性。

> **⭐ 困难 · 安全**

::: details 点击查看答案与解析

**前向安全性（Forward Secrecy / Perfect Forward Secrecy, PFS）** 是指即使长期密钥（服务端私钥）在未来被泄露，过去的通信会话密钥也不会被推导出来，历史通信仍然是安全的。

**没有前向安全性（RSA 密钥交换）：**

```
1. 客户端用服务端公钥加密 Pre-Master Secret
2. 服务端用私钥解密
3. 双方从 Pre-Master Secret 派生会话密钥

问题：
  如果服务端私钥被泄露（如 Heartbleed 漏洞后）
  + 攻击者之前录制的加密流量
  = 攻击者可以解密所有历史通信！
```

**有前向安全性（ECDHE 密钥交换）：**

```
1. 服务端生成临时 ECDH 密钥对（ephemeral）
2. 客户端生成临时 ECDH 密钥对
3. 双方交换公钥，各自计算共享密钥
4. 临时密钥对在会话结束后销毁

关键：
  - 每次会话使用不同的临时密钥对
  - 私钥仅用于身份验证（签名），不用于密钥交换
  - 即使私钥泄露，没有临时密钥就无法计算会话密钥
  - 临时密钥已销毁，无法被恢复
```

**Diffie-Hellman 密钥交换原理（简化）：**

```js
// 双方协商一个大素数 p 和生成器 g（公开参数）

// Alice（客户端）
const a = random();        // Alice 的临时私钥
const A = pow(g, a) % p;  // Alice 的临时公钥

// Bob（服务端）
const b = random();        // Bob 的临时私钥
const B = pow(g, b) % p;  // Bob 的临时公钥

// 公钥交换
// Alice 收到 B，计算: sharedSecret = pow(B, a) % p = pow(g, b*a) % p
// Bob   收到 A，计算: sharedSecret = pow(A, b) % p = pow(g, a*b) % p

// 两人得到相同的共享密钥，而窃听者只有 A、B、g、p，无法算出 a 或 b
```

**ECDHE vs DHE：**

| 特性 | DHE | ECDHE |
| --- | --- | --- |
| 基础 | 离散对数 | 椭圆曲线离散对数 |
| 密钥长度 | 2048-bit+ | 256-bit |
| 计算速度 | 慢 | 快 |
| 安全性 | 高 | 等效更高 |
| 推荐度 | 兼容场景 | 首选 |

**在 Nginx 中配置前向安全性：**

```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
# 所有密码套件都以 ECDHE 开头，确保前向安全性
```

**知识点：** `前向安全性` `PFS` `ECDHE` `Diffie-Hellman` `临时密钥`

:::

### Q9: HTTPS 连接建立过程中，哪些步骤可能成为性能瓶颈？如何优化？

> **⭐ 困难 · 安全**

::: details 点击查看答案与解析

**HTTPS 性能瓶颈分析：**

```
DNS 解析 → TCP 连接 → TLS 握手 → HTTP 请求/响应

TLS 握手额外开销：
- TLS 1.2: 2-RTT（首次）+ 证书验证
- TLS 1.3: 1-RTT（首次）+ 证书验证
```

**各环节瓶颈与优化：**

**1. DNS 解析优化**

```js
// DNS Prefetch
// <link rel="dns-prefetch" href="//cdn.example.com">

// 预连接（DNS + TCP + TLS）
// <link rel="preconnect" href="https://cdn.example.com">
```

**2. TLS 握手优化**

```
// Session 会话复用
// 方式1：Session ID
// 服务端保存会话状态，客户端下次携带 Session ID 即可跳过完整握手
// 限制：服务端内存消耗大，集群共享困难

// 方式2：Session Ticket（推荐）
// 服务端将会话状态加密后发送给客户端
// 客户端下次携带 Ticket，服务端解密恢复会话
// 优势：服务端无状态，集群容易共享

// TLS 1.3 0-RTT
// 之前连接过时，首条消息即可携带数据
// 适合 API 调用场景
```

**3. 证书链优化**

```nginx
# 减少证书链长度
# 1. 使用 ECDSA 证书（比 RSA 证书小）
# RSA 2048 证书链 ≈ 4-5KB
# ECDSA 256 证书链 ≈ 1-2KB

# 2. 证书链只包含必要的中级证书
# 不包含根证书（浏览器内置了）

# 3. OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
# 避免客户端单独请求 OCSP 服务器验证证书状态
```

**4. 密码套件优化**

```nginx
# 选择高性能密码套件
# AES-GCM：硬件加速（AES-NI），非常快
# ChaCha20-Poly1305：移动端无 AES-NI 时更快
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-ECDSA-CHACHA20-POLY1305';
```

**5. HTTP/2 与 HTTPS**

```
HTTP/2 的优势：
- 多路复用，减少连接数
- 头部压缩，减少数据量
- 服务端推送

注意：主流浏览器只支持基于 TLS 的 HTTP/2
ALPN 协议协商在 TLS 握手阶段完成
```

**6. 连接复用**

```nginx
# Keep-Alive
keepalive_timeout 75s;
keepalive_requests 1000;

# HTTP/2 连接复用更高效
# 单个连接处理所有请求
```

**性能对比（首次连接）：**

| 场景 | RTT | 说明 |
| --- | --- | --- |
| HTTP/1.1 | 1-RTT | TCP + 请求 |
| HTTPS (TLS 1.2) | 3-RTT | TCP + 2-RTT TLS + 请求 |
| HTTPS (TLS 1.3) | 2-RTT | TCP + 1-RTT TLS + 请求 |
| HTTPS (会话复用) | 1-RTT | TCP + 0-RTT TLS + 请求 |
| HTTPS (H2 会话复用) | 0-RTT | 连接复用，直接请求 |

**知识点：** `HTTPS性能优化` `Session Ticket` `OCSP Stapling` `0-RTT` `TLS1.3`

:::

### Q10: 在前端项目中，如何正确处理 HTTPS 相关的安全配置？请给出一个综合配置方案。

> **⭐ 困难 · 安全**

::: details 点击查看答案与解析

**Nginx 综合安全配置：**

```nginx
server {
    listen 443 ssl http2;
    server_name example.com;

    # ===== 证书配置 =====
    ssl_certificate     /etc/ssl/certs/example.com.pem;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    # ===== TLS 协议版本 =====
    ssl_protocols TLSv1.2 TLSv1.3;

    # ===== 密码套件（前向安全性 + 高性能）=====
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers on;

    # ===== 会话复用 =====
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets on;

    # ===== OCSP Stapling =====
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/ssl/certs/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;

    # ===== DH 参数（DHE 密码套件需要）=====
    ssl_dhparam /etc/ssl/dhparam.pem;

    # ===== 安全响应头 =====

    # HSTS：1年有效期 + 子域名 + 预加载
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

    # 禁止 MIME 类型嗅探
    add_header X-Content-Type-Options "nosniff" always;

    # 防止点击劫持
    add_header X-Frame-Options "SAMEORIGIN" always;

    # XSS 防护（已逐步被 CSP 取代）
    add_header X-XSS-Protection "0" always;

    # Referrer 策略
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # 权限策略
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # CSP
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'nonce-{nonce}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.example.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'" always;

    # ===== HTTP 重定向 =====
    # 在单独的 server 块中
}

server {
    listen 80;
    server_name example.com;

    # 301 永久重定向到 HTTPS
    return 301 https://$host$request_uri;
}
```

**前端安全配置清单：**

```js
// 1. 确保所有资源使用 HTTPS
// package.json / vite.config.js
const config = {
  // 开发环境也使用 HTTPS
  server: {
    https: true,
  },
  // CSP Hash/Nonce for inline scripts
};

// 2. 安全的 Cookie 设置
// 服务端
res.cookie('token', jwtToken, {
  httpOnly: true,    // 防止 XSS 读取
  secure: true,      // 仅 HTTPS 传输
  sameSite: 'Strict', // 防止 CSRF
  maxAge: 86400000,  // 1天过期
  path: '/',
});

// 3. Mixin Content 检测
// 在开发环境添加 CSP 报告
if (process.env.NODE_ENV === 'development') {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = 'upgrade-insecure-requests';
  document.head.appendChild(meta);
}

// 4. 安全的 API 请求
const apiClient = axios.create({
  baseURL: 'https://api.example.com', // 明确 HTTPS
  withCredentials: true,
  headers: {
    'X-Request-ID': crypto.randomUUID(),
  },
});

// 5. 证书透明度监控
// 使用 Expect-CT 头
// Expect-CT: max-age=86400, enforce, report-uri="https://example.com/ct-report"
```

**知识点：** `HTTPS配置` `安全响应头` `HSTS` `CSP` `OCSP Stapling` `Cookie安全`

:::