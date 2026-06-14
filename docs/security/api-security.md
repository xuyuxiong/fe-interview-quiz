---
title: 接口安全与防刷
description: 前端安全面试题，覆盖接口签名、防重放、限流算法、JWT 安全、OAuth2.0、数据脱敏、SQL 注入防御等核心考点
---

# 接口安全与防刷

---

> **🔥 中等 · 接口签名**

### Q1: 如何保证 API 接口的安全？接口签名的实现方案？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**接口签名方案：**

```
请求参数 + 时间戳 + 随机数 + 密钥 → HMAC 签名
```

```js
// 前端签名
function signRequest(params, secret) {
  const timestamp = Date.now()
  const nonce = Math.random().toString(36).slice(2)
  
  // 1. 参数按 key 字典排序
  const sorted = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  
  // 2. 拼接待签名字符串
  const signStr = `${sorted}&timestamp=${timestamp}&nonce=${nonce}`
  
  // 3. HMAC-SHA256 签名
  const signature = CryptoJS.HmacSHA256(signStr, secret).toString()
  
  return { ...params, timestamp, nonce, signature }
}

// 后端验证
function verifySignature(req, secret) {
  const { signature, timestamp, nonce, ...params } = req.body
  
  // 1. 检查时间戳（防重放，5 分钟有效）
  if (Math.abs(Date.now() - timestamp) > 5 * 60 * 1000) {
    return false
  }
  
  // 2. 检查 nonce 是否已使用（Redis 去重）
  const nonceKey = `nonce:${nonce}`
  if (await redis.get(nonceKey)) return false
  await redis.setex(nonceKey, 300, '1')  // 5 分钟过期
  
  // 3. 重新计算签名对比
  const sorted = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')
  const signStr = `${sorted}&timestamp=${timestamp}&nonce=${nonce}`
  const expected = crypto.createHmac('sha256', secret).update(signStr).digest('hex')
  
  return signature === expected
}
```

**知识点：** `HMAC` `签名` `时间戳` `nonce`

:::

---

> **🔥 中等 · 限流算法**

### Q2: 常见的限流算法有哪些？分别适用于什么场景？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 算法 | 原理 | 优点 | 缺点 | 适用 |
|------|------|------|------|------|
| **固定窗口** | 固定时间窗口内计数 | 简单 | 窗口边界突发 | 粗粒度限流 |
| **滑动窗口** | 滑动时间窗口计数 | 平滑 | 实现稍复杂 | 精确限流 |
| **令牌桶** | 固定速率放令牌 | 允许突发 | 实现复杂 | API 网关 |
| **漏桶** | 固定速率出水 | 流量均匀 | 不允许突发 | 流量整形 |

**令牌桶算法（推荐）：**
```js
class TokenBucket {
  constructor(capacity, refillRate) {
    this.capacity = capacity    // 桶容量（最大突发量）
    this.tokens = capacity      // 当前令牌数
    this.refillRate = refillRate // 每秒补充令牌数
    this.lastRefill = Date.now()
  }
  
  consume(count = 1) {
    this.refill()
    if (this.tokens >= count) {
      this.tokens -= count
      return true  // 允许请求
    }
    return false   // 拒绝请求
  }
  
  refill() {
    const now = Date.now()
    const elapsed = (now - this.lastRefill) / 1000
    this.tokens = Math.min(
      this.capacity,
      this.tokens + elapsed * this.refillRate
    )
    this.lastRefill = now
  }
}

// 使用：容量 100，每秒补充 10 个
const bucket = new TokenBucket(100, 10)
```

**前端防抖/节流也属于限流：**
```js
// 防抖（搜索框）= 固定窗口
function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// 节流（滚动事件）= 漏桶
function throttle(fn, interval) {
  let last = 0
  return (...args) => {
    const now = Date.now()
    if (now - last >= interval) {
      last = now
      fn(...args)
    }
  }
}
```

**知识点：** `令牌桶` `漏桶` `滑动窗口` `防抖节流`

:::

---

> **💀 困难 · OAuth 2.0**

### Q3: OAuth 2.0 的授权流程有哪些？前端如何安全地实现第三方登录？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**四种授权模式：**

| 模式 | 适用场景 | 安全性 |
|------|----------|--------|
| **授权码模式** | Web 后端 | ✅ 最高 |
| **PKCE 模式** | SPA/移动端 | ✅ 高 |
| **隐式模式** | SPA（已不推荐） | ❌ 低 |
| **客户端凭证** | 服务器间通信 | ✅ 高 |

**授权码模式流程：**
```
1. 用户点击"使用微信登录"
2. 重定向到微信授权页面
   https://open.weixin.qq.com/oauth/authorize?
     client_id=YOUR_ID&
     redirect_uri=https://yoursite.com/callback&
     response_type=code&
     scope=snsapi_userinfo&
     state=random_string

3. 用户同意授权
4. 微信回调 redirect_uri，携带 authorization code
   https://yoursite.com/callback?code=CODE&state=STATE

5. 后端用 code 换取 access_token（不经过前端）
   POST https://api.weixin.qq.com/sns/oauth2/access_token
   { client_id, client_secret, code, grant_type }

6. 后端用 access_token 获取用户信息
```

**SPA（前端）推荐使用 PKCE 模式：**
```js
// 1. 生成 code_verifier 和 code_challenge
const codeVerifier = generateRandomString(128)
const codeChallenge = base64UrlEncode(
  await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
)

// 2. 发起授权请求（带 code_challenge）
const authUrl = `https://auth.example.com/authorize?
  client_id=YOUR_ID&
  redirect_uri=https://yoursite.com/callback&
  response_type=code&
  code_challenge=${codeChallenge}&
  code_challenge_method=S256`

// 3. 回调时后端验证 code_verifier
// POST /token { code, code_verifier }
```

**前端安全注意事项：**
- 使用 `state` 参数防 CSRF
- Access Token 不要存在 URL 中
- 优先使用授权码+PKCE，不要用隐式模式
- 回调 URL 严格匹配（防开放重定向）

**知识点：** `OAuth2.0` `授权码` `PKCE` `第三方登录`

:::

---

> **🔥 中等 · SQL 注入**

### Q4: 什么是 SQL 注入？前端工程师需要了解哪些防护知识？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**SQL 注入示例：**
```sql
-- 正常查询
SELECT * FROM users WHERE username = 'admin' AND password = '123456'

-- 注入：用户输入 username = "admin' --"
SELECT * FROM users WHERE username = 'admin' --' AND password = '123456'
-- -- 注释了密码校验！
```

**防护方案（后端为主，前端了解）：**

**1. 参数化查询（最重要）**
```js
// ❌ 字符串拼接
db.query(`SELECT * FROM users WHERE id = ${req.params.id}`)

// ✅ 参数化查询
db.query('SELECT * FROM users WHERE id = ?', [req.params.id])

// ✅ ORM（自动参数化）
await User.findById(req.params.id)
```

**2. 输入验证**
```js
// 白名单验证
const allowedSortFields = ['name', 'created_at', 'price']
if (!allowedSortFields.includes(req.query.sort)) {
  return res.status(400).json({ error: 'Invalid sort field' })
}
```

**3. 最小权限原则**
- 数据库用户只授予必要权限
- 禁止应用账户执行 DROP/ALTER

**4. NoSQL 注入（MongoDB）**
```js
// ❌ 危险
const user = await db.collection('users').findOne({
  username: req.body.username,
  password: req.body.password
})
// 攻击：password = { $gt: '' }  ← 匹配所有！

// ✅ 安全
const user = await db.collection('users').findOne({
  username: String(req.body.username),
  password: String(req.body.password)  // 强制类型转换
})
```

**前端职责：**
- 前端验证只是用户体验，不能替代后端验证
- 输入格式化（去除特殊字符提示）
- 不暴露后端 SQL/数据库结构

**知识点:**`SQL 注入` `参数化查询` `NoSQL 注入` `输入验证`

:::

---

> **🔥 中等 · 数据脱敏**

### Q5: 什么是数据脱敏？前端如何处理敏感数据展示？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**脱敏规则：**

| 数据类型 | 脱敏方式 | 示例 |
|----------|----------|------|
| 手机号 | 中间 4 位`*` | 138****1234 |
| 身份证 | 中间 8 位`*` | 4301********1234 |
| 银行卡 | 仅显示后 4 位 | ************1234 |
| 邮箱 | @ 前 2 位 + `***` | yx***@example.com |
| 姓名 | 姓 + `*` | 张** |
| 地址 | 隐藏门牌号 | 湖南省长沙市*** |

```js
// 前端脱敏工具函数
const mask = {
  phone: (val) => val.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
  idCard: (val) => val.replace(/(\d{4})\d{8}(\d{4})/, '$1********$2'),
  bankCard: (val) => val.replace(/\d{12}(\d{4})/, '************$1'),
  email: (val) => val.replace(/(.{2}).*(@.*)/, '$1***$2'),
  name: (val) => val.charAt(0) + '*'.repeat(val.length - 1)
}

// 最佳实践：后端脱敏优于前端脱敏
// 后端返回数据时已脱敏，前端只是展示
// 避免敏感数据进入前端代码/网络请求
```

**前端额外防护：**
```js
// 禁止复制敏感信息
element.addEventListener('copy', (e) => {
  if (e.target.dataset.sensitive) {
    e.preventDefault()
  }
})

// 禁止右键（辅助防护）
element.addEventListener('contextmenu', (e) => {
  if (e.target.dataset.sensitive) e.preventDefault()
})

// CSS 防护
.sensitive {
  user-select: none;     /* 禁止选中 */
  -webkit-touch-callout: none; /* 禁止长按 */
}
```

**知识点：** `数据脱敏` `前端脱敏` `后端脱敏` `敏感数据`

:::

---

> **🔥 中等 · 加密传输**

### Q6: 前端如何实现敏感数据的加密传输？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. HTTPS（基础保障）**
- 所有传输都应该走 HTTPS
- HTTPS 加密整个传输通道，无需前端额外加密

**2. 非对称加密传输密码**
```js
// 1. 获取服务端公钥
const { publicKey } = await fetch('/api/public-key').then(r => r.json())

// 2. 用公钥加密密码
const encrypted = await crypto.subtle.encrypt(
  { name: 'RSA-OAEP' },
  await crypto.subtle.importKey('spki', base64ToArrayBuffer(publicKey), 
    { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']),
  new TextEncoder().encode(password)
)

// 3. 发送加密后的密码
await fetch('/api/login', {
  method: 'POST',
  body: JSON.stringify({ encrypted: arrayBufferToBase64(encrypted) })
})
```

**3. 前端加密的注意事项**
- 前端加密**不能替代 HTTPS**（中间人可替换 JS）
- 前端加密主要防止**服务端日志**记录明文密码
- 密码传输后仍需服务端 hash（bcrypt/argon2）
- 不要自创加密算法

**4. Web Crypto API（推荐）**
```js
// AES-GCM 对称加密（有密钥交换时）
async function encrypt(data, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(data)
  )
  return { iv, data: encrypted }
}
```

**知识点：** `HTTPS` `非对称加密` `Web Crypto` `AES-GCM`

:::

---

> **⭐ 简单 · 接口防刷**

### Q7: 前端如何配合后端防止接口被恶意刷调用？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**前端防刷手段：**

```js
// 1. 防抖/节流（基础防护）
const submitBtn = document.getElementById('submit')
submitBtn.addEventListener('click', debounce(submitForm, 1000))

// 2. 按钮置灰（防重复提交）
async function submitForm() {
  if (this.disabled) return
  this.disabled = true
  try {
    await fetch('/api/submit', { method: 'POST', body: formData })
  } finally {
    setTimeout(() => { this.disabled = false }, 2000)
  }
}

// 3. 验证码（人机验证）
// - 滑动验证
// - 图形验证码
// - reCAPTCHA / Turnstile

// 4. 请求指纹
const fingerprint = await generateFingerprint()
headers['X-Fingerprint'] = fingerprint
```

**后端防刷手段：**
```js
// 1. IP 限流（Redis 计数）
const limit = await redis.incr(`rate:${ip}`)
await redis.expire(`rate:${ip}`, 60)
if (limit > 100) return res.status(429).json({ error: 'Too many requests' })

// 2. 用户限流
const userLimit = await redis.incr(`rate:${userId}`)
if (userLimit > 50) return res.status(429).json({ error: 'Rate limit exceeded' })

// 3. 设备指纹
// - Canvas 指纹
// - WebGL 指纹
// - 浏览器特征

// 4. 风控规则
// - 异常时间段请求
// - 短时间多设备登录
// - 请求模式异常
```

**知识点：** `防刷` `限流` `验证码` `风控`

:::

---

> **🔥 中等 · 前端密码安全**

### Q8: 前端密码存储和传输的最佳实践是什么？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**密码存储（后端）：**
```js
// ✅ bcrypt（推荐）
const saltRounds = 12
const hash = await bcrypt.hash(password, saltRounds)
const match = await bcrypt.compare(inputPassword, hash)

// ✅ argon2（更强）
const hash = await argon2.hash(password, { type: argon2.argon2id })

// ❌ 绝对不要
MD5(password)                    // 太弱
SHA256(password)                 // 无盐，彩虹表可破
SHA256(password + '固定盐')       // 固定盐不安全
```

**密码传输（前端）：**
```js
// 方案 1：HTTPS + 明文传输（最常见，够用）
// HTTPS 已经加密了传输通道

// 方案 2：HTTPS + 非对称加密（更安全）
// 用服务端公钥加密密码，防止代理/日志看到明文

// ❌ 绝对不要
// 前端 MD5/SHA 后传输（hash 可被重放，等于新密码）
// 密码存在 localStorage
// 密码出现在 URL 中
```

**密码策略：**
```js
// 前端密码强度检测
function checkPasswordStrength(password) {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  if (!/(.)\1{2,}/.test(password)) score++  // 无连续重复
  
  return ['弱', '中', '强', '很强'][Math.min(score, 3)]
}
```

**知识点：** `密码安全` `bcrypt` `HTTPS` `密码强度`

:::

---

### Q9: 对称加密和非对称加密的区别？哪个更安全？

> **🔥 中等 · 安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**对称加密：**
- **特点**：加密和解密使用同一个密钥
- **算法**：AES、DES、3DES、RC4
- **优点**：加解密速度快，适合大量数据加密
- **缺点**：密钥分发困难，密钥管理复杂（N 个人需要 N*(N-1)/2 个密钥）

**非对称加密：**
- **特点**：使用公钥加密，私钥解密（或私钥签名，公钥验证）
- **算法**：RSA、ECC、ElGamal
- **优点**：密钥分发简单，支持数字签名
- **缺点**：加解密速度慢，不适合大量数据

**哪个更安全？**

两者不是简单的"谁更安全"的关系，而是**应用场景不同**：

```javascript
// 实际应用中通常结合使用（如 TLS/SSL）
// 1. 非对称加密用于密钥交换（安全传递对称密钥）
// 2. 对称加密用于数据传输（高效加密大量数据）

// RSA 示例（非对称）
const crypto = require('crypto');
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048
});
const encrypted = crypto.publicEncrypt(publicKey, Buffer.from('secret'));
const decrypted = crypto.privateDecrypt(privateKey, encrypted);

// AES 示例（对称）
const cipher = crypto.createCipher('aes-256-cbc', 'secret-key');
```

**实际应用建议：**
- 传输大量数据：先用非对称加密交换密钥，再用对称加密传输数据
- 数字签名：使用非对称加密（私钥签名，公钥验证）
- 存储加密：对称加密更合适（如数据库字段加密）

**知识点：** `对称加密` `非对称加密` `AES` `RSA` `密钥交换`

:::

---

### Q10: 混合加密模型是如何工作的？HTTPS 中的密钥交换过程？

> **🔥 中等 · 安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 维度 | 对称加密 | 非对称加密 |
|------|---------|-----------|
| 密钥数量 | 1 个（加密解密用同一个） | 2 个（公钥加密，私钥解密） |
| 速度 | 快（适合大数据量） | 慢（数学运算复杂） |
| 安全性 | 密钥分发是难题 | 公钥可公开，私钥保密 |
| 常见算法 | AES、DES、3DES | RSA、ECC、DSA |
| 应用场景 | 数据传输加密 | 密钥交换、数字签名 |

**实际方案：混合加密（HTTPS 就是这样做的）**

```text
HTTPS 加密流程：
1. 非对称加密交换对称密钥（安全但慢，只用于握手阶段）
2. 对称加密传输数据（快速，用协商好的密钥）

Client                          Server
  │                                │
  │─── ClientHello ───────────────→│
  │←── ServerHello + 证书 ────────│
  │                                │
  │  验证证书，生成随机密钥          │
  │  用公钥加密密钥                  │
  │─── 加密后的密钥 ──────────────→│
  │                                │
  │←── 用协商密钥加密的确认 ────────│
  │                                │
  │═══ 对称加密通信 ═══════════════│
  │═══ (AES-256-GCM) ═════════════│
```

```js
// Node.js 示例
const crypto = require('crypto')

// 对称加密（AES-256-GCM）
const key = crypto.randomBytes(32)
const iv = crypto.randomBytes(16)
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
const encrypted = Buffer.concat([cipher.update('敏感数据'), cipher.final()])

// 非对称加密（RSA）
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048
})
const enc = crypto.publicEncrypt(publicKey, Buffer.from('密钥'))
const dec = crypto.privateDecrypt(privateKey, enc)
```

**知识点：** `对称加密` `非对称加密` `AES` `RSA` `HTTPS 握手` `混合加密`

:::

---

### Q11: OAuth 2.0 的授权码流程是怎样的？PKCE 是什么？

> **🔥 中等 · 安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**OAuth 2.0 授权码流程（Authorization Code Flow）：**

```
┌────────────┐         ┌────────────┐         ┌────────────┐
│   Client   │         │   Auth     │         │  Resource  │
│  (前端)     │         │   Server   │         │   Server   │
└─────┬──────┘         └─────┬──────┘         └─────┬──────┘
      │                      │                       │
      │  1. 授权请求          │                       │
      │  response_type=code  │                       │
      │  client_id=xxx       │                       │
      │  redirect_uri=xxx    │                       │
      │─────────────────────→│                       │
      │                      │                       │
      │  2. 用户登录并授权    │                       │
      │ ←────────────────────│                       │
      │                      │                       │
      │  3. 授权码回调        │                       │
      │  code=AUTH_CODE      │                       │
      │ ←────────────────────│                       │
      │                      │                       │
      │  4. 用 code 换 token   │                       │
      │  code + client_secret│                       │
      │─────────────────────→│                       │
      │                      │                       │
      │  5. 返回 access_token │                       │
      │ ←────────────────────│                       │
      │                      │                       │
      │  6. 用 token 访问资源  │                       │
      │  Authorization: Bearer token                │
      │─────────────────────────────────────────────→│
      │                      │                       │
      │  7. 返回资源数据      │                       │
      │ ←────────────────────────────────────────────│
```

**详细步骤：**

```
1. 用户访问前端，点击"GitHub 登录"
2. 前端重定向到 GitHub 授权页：
   https://github.com/login/oauth/authorize?
     client_id=YOUR_CLIENT_ID&
     redirect_uri=https://yoursite.com/callback&
     response_type=code&
     scope=user:email&
     state=random_state_token

3. 用户在 GitHub 登录并授权
4. GitHub 回调 redirect_uri，携带 code：
   https://yoursite.com/callback?code=AUTH_CODE&state=random_state_token

5. 前端将 code 发送给后端（不经过前端直接后端处理更安全）
6. 后端用 code + client_secret 换 access_token：
   POST https://github.com/login/oauth/access_token
   {
     client_id: YOUR_CLIENT_ID,
     client_secret: YOUR_SECRET,
     code: AUTH_CODE
   }

7. GitHub 返回 access_token
8. 后端用 access_token 获取用户信息
9. 后端创建自己的 session/JWT，返回给前端
```

**PKCE（Proof Key for Code Exchange）：**

PKCE 是为公共客户端（SPA、移动端）设计的安全扩展。

```js
// 1. 生成 code_verifier（随机字符串）
const codeVerifier = generateRandomString(128)

// 2. 生成 code_challenge（code_verifier 的哈希）
const codeChallenge = base64UrlEncode(
  await crypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier))
)

// 3. 授权请求时带上 code_challenge
const authUrl = `https://auth.example.com/authorize?
  client_id=YOUR_ID&
  redirect_uri=${encodeURIComponent(redirectUri)}&
  response_type=code&
  scope=openid profile email&
  code_challenge=${codeChallenge}&
  code_challenge_method=S256`

// 4. 回调后用 code_verifier 换 token
const tokenResponse = await fetch('https://auth.example.com/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: authorizationCode,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier  // 关键：发送原始 verifier
  })
})
```

**PKCE 解决的问题：**

- 防止授权码被截获后冒用
- 即使 code 被拦截，攻击者没有 code_verifier 也无法换取 token
- 不需要 client_secret，适合前端应用

**知识点:**`OAuth2.0` `授权码` `PKCE` `第三方认证`

:::

---

### Q12: JWT 的结构是什么？如何防止 JWT 被篡改？

> **🔥 中等 · 安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**JWT 结构（JSON Web Token）：**

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

拆分为三部分：
Header.Payload.Signature
```

**1. Header（头部）：**
```json
{
  "alg": "HS256",    // 签名算法
  "typ": "JWT"       // 类型
}
// Base64Url 编码后：eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

**2. Payload（负载）：**
```json
{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022,     // 签发时间
  "exp": 1516242622,     // 过期时间
  "role": "admin"        // 自定义声明
}
// Base64Url 编码后：eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9
```

**3. Signature（签名）：**
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

**防止篡改的机制：**

```js
// 服务端验证 JWT
function verifyToken(token, secret) {
  const [headerB64, payloadB64, signatureB64] = token.split('.')
  
  // 1. 重新计算签名
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${headerB64}.${payloadB64}`)
    .digest('base64url')
  
  // 2. 对比签名
  if (signatureB64 !== expectedSignature) {
    throw new Error('Invalid signature - token may be tampered')
  }
  
  // 3. 解析 payload
  const payload = JSON.parse(Buffer.from(payloadB64, 'base64url'))
  
  // 4. 检查过期时间
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    throw new Error('Token expired')
  }
  
  return payload
}

// 使用库验证（推荐）
const jwt = require('jsonwebtoken')
try {
  const decoded = jwt.verify(token, secret)
  // token 有效
} catch (err) {
  // token 无效或过期
}
```

**增强 JWT 安全的措施：**

| 措施 | 说明 |
|------|------|
| 使用强密钥 | 至少 256 位随机密钥 |
| 设置合理过期时间 | access_token短期 (15min), refresh_token长期 (7day) |
| 签名算法选择 | RS256(非对称) 比 HS256(对称) 更安全 |
| 不在 payload 存敏感信息 | payload 可被解码，只是不可篡改 |
| 实现 token 黑名单 | 用户登出时使 token 失效 |
| 绑定用户指纹 | token 与设备/IP绑定 |

**常见攻击与防护：**

```js
// 攻击 1: 算法改为 none
// 防护：服务端强制指定期望算法
jwt.verify(token, secret, { algorithms: ['HS256'] })

// 攻击 2: 密钥猜测
// 防护：使用足够随机的强密钥

// 攻击 3: token 泄露
// 防护：短过期时间 + refresh_token 机制

// 攻击 4: XSS 窃取
// 防护：HttpOnly Cookie 存储，不用 localStorage
```

**知识点:**`JWT` `Token 安全` `数字签名` `认证授权`

:::

---

### Q13: 接口签名验证怎么做？timestamp + nonce 防重放攻击？

> **🔥 困难 · 安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**接口签名完整实现：**

```js
// ============= 前端签名 =============
async function signRequest(method, url, params, body, secretKey) {
  const timestamp = Date.now()
  const nonce = generateRandomString(16)
  
  // 1. 规范化请求数据
  const sortedParams = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&')
  
  const bodyStr = body ? JSON.stringify(body) : ''
  
  // 2. 构造待签名字符串
  const signStr = [
    method.toUpperCase(),
    url,
    sortedParams,
    bodyStr,
    timestamp.toString(),
    nonce
  ].join('|')
  
  // 3. HMAC-SHA256 签名
  const encoder = new TextEncoder()
  const keyData = await crypto.subtle.importKey(
    'raw', encoder.encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false, ['sign']
  )
  const signature = await crypto.subtle.sign(
    'HMAC', keyData, encoder.encode(signStr)
  )
  
  return {
    ...params,
    timestamp,
    nonce,
    signature: arrayBufferToHex(signature)
  }
}

// ============= 后端验证 =============
async function verifyRequest(req, secretKey) {
  const { signature, timestamp, nonce, ...params } = req.body
  
  // 1. 检查时间戳（5 分钟有效期）
  const now = Date.now()
  if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
    return { valid: false, reason: 'Request expired' }
  }
  
  // 2. 检查 nonce 是否已使用（防重放）
  const nonceKey = `nonce:${nonce}`
  const exists = await redis.get(nonceKey)
  if (exists) {
    return { valid: false, reason: 'Replay attack detected' }
  }
  // 存储 nonce 到过期时间
  await redis.setex(nonceKey, 300, '1')
  
  // 3. 重新计算签名
  const sortedParams = Object.keys(params)
    .sort()
    .map(k => `${k}=${params[k]}`)
    .join('&')
  
  const signStr = [
    req.method,
    req.path,
    sortedParams,
    req.body ? JSON.stringify(req.body) : '',
    timestamp.toString(),
    nonce
  ].join('|')
  
  const expected = crypto
    .createHmac('sha256', secretKey)
    .update(signStr)
    .digest('hex')
  
  // 4. 签名对比（常量时间比较，防时序攻击）
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return { valid: false, reason: 'Invalid signature' }
  }
  
  return { valid: true }
}

// ============= 辅助函数 =============
function generateRandomString(length) {
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map(b => b.toString(36).charAt(0))
    .join('')
}

function arrayBufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}
```

**防重放攻击原理：**

```
攻击者截获请求：
POST /api/transfer { amount: 100, to: "attacker", signature: "abc123..." }

防御机制：
1. timestamp: 请求超过 5 分钟直接拒绝
2. nonce: 每个请求唯一，使用过的 nonce 会被 Redis 记录

Redis 记录:
nonce:xyz123 → "1" (TTL: 300s)

如果攻击者重放相同请求：
- Redis 发现 nonce 已存在 → 拒绝
```

**进阶方案：**

```js
// 滑动窗口限流 + 防重放
class ReplayProtection {
  constructor(redis, windowMs = 300000) {
    this.redis = redis
    this.windowMs = windowMs
  }
  
  async check(userId, nonce, timestamp) {
    const now = Date.now()
    
    // 1. 时间窗口检查
    if (Math.abs(now - timestamp) > this.windowMs) {
      return false
    }
    
    // 2. 滑动窗口内的 nonce 检查
    const windowStart = now - this.windowMs
    const key = `replay:${userId}:${Math.floor(timestamp / 1000)}`
    
    // 使用 Redis Set 存储该秒内的所有 nonce
    const exists = await this.redis.sismember(key, nonce)
    if (exists) return false
    
    await this.redis.sadd(key, nonce)
    await this.redis.expire(key, 300)
    
    return true
  }
}
```

**知识点:**`接口签名` `防重放` `timestamp` `nonce` `HMAC`

:::