---
title: 浏览器安全
description: 同源策略、CORS 原理、跨域方案、沙箱机制、XSS/CSRF 防御、浏览器安全策略
---

# 浏览器安全

安全是前端开发的核心关注点，了解常见攻击和防御手段至关重要。

---

### Q1: 什么是同源策略？为什么需要它？

> **⭐ 简单 · 同源策略**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**同源策略（Same-Origin Policy）**：浏览器实施的安全机制，限制不同源的文档或脚本如何交互。

**同源定义**：协议、域名、端口完全相同。

| URL 1 | URL 2 | 是否同源 |
|-------|-------|----------|
| http://example.com | http://example.com | ✅ 是 |
| http://example.com | https://example.com | ❌ 协议不同 |
| http://example.com:80 | http://example.com:8080 | ❌ 端口不同 |
| http://example.com | http://www.example.com | ❌ 域名不同 |
| http://a.example.com | http://b.example.com | ❌ 子域不同 |

**同源策略限制：**
- ❌ 无法访问不同源的 DOM
- ❌ 无法访问不同源的 localStorage/Cookie
- ❌ 无法发送 AJAX 请求（除非 CORS 允许）
- ✅ 可以嵌入不同源的 img/script/link/iframe

**为什么需要同源策略：**
- 防止恶意网站窃取用户数据
- 防止 CSRF 攻击
- 保护用户隐私
- 隔离不同网站的安全上下文

**绕过同源的方式：**
- CORS（跨域资源共享）
- postMessage
- document.domain（子域共享）
- window.name
- JSONP（已被 CORS 替代）

**知识点：** `同源策略` `Same-Origin` `安全隔离` `跨域限制`

:::

---

### Q2: 什么是 CORS？请描述简单请求和预检请求的区别

> **🔥 中等 · CORS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CORS（Cross-Origin Resource Sharing）**：基于 HTTP 头的跨域资源共享机制。

**简单请求（Simple Request）**：
同时满足以下条件：
1. 方法：GET、HEAD、POST
2. 自定义头：仅限 Accept、Accept-Language、Content-Language、Content-Type
3. Content-Type 仅限：application/x-www-form-urlencoded、multipart/form-data、text/plain
4. 无 ReadableStream

**预检请求（Preflight Request）**：
不满足简单请求条件时，浏览器先发送 OPTIONS 请求。

**请求对比：**

| 特性 | 简单请求 | 预检请求 |
|------|----------|----------|
| **方法** | OPTIONS | 实际方法 |
| **发送时机** | 直接发送 | OPTIONS 成功后 |
| **请求头** | Origin | Origin + Access-Control-Request-* |
| **目的** | 获取资源 | 询问服务器是否允许 |

**简单请求流程：**
```
浏览器                           服务器
  │ ─── Origin: https://a.com ───> │
  │ <─── Access-Control-Allow-Origin ───│
  │         (跨域响应头)              │
```

**预检请求流程：**
```
浏览器                           服务器
  │ ── OPTIONS (预检请求) ──────> │
  │    Origin: https://a.com      │
  │    Access-Control-Request-Method: POST
  │    Access-Control-Request-Headers: X-Custom
  │                                │
  │ <── Access-Control-Allow-Origin ──│
  │    Access-Control-Allow-Methods: POST
  │    Access-Control-Allow-Headers: X-Custom
  │    Access-Control-Max-Age: 86400
  │                                │
  │ ──── POST (实际请求) ─────────> │
  │ <───────── 响应 ──────────────> │
```

**服务端响应头：**
```nginx
# Nginx 配置
add_header Access-Control-Allow-Origin "https://a.com";
add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
add_header Access-Control-Allow-Headers "Content-Type, X-Requested-With";
add_header Access-Control-Allow-Credentials "true";
add_header Access-Control-Max-Age "86400";
```

**知识点：** `CORS` `简单请求` `预检请求` `OPTIONS` `跨域`

:::

---

### Q3: CORS 如何携带 Cookie？需要哪些配置？

> **🔥 中等 · CORS 凭证**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CORS 携带 Cookie 需要双方配置：**

**前端配置：**
```javascript
fetch('https://api.example.com/data', {
  credentials: 'include', // 关键：包含凭证
  headers: {
    'Content-Type': 'application/json'
  }
});

// Axios
axios.get('https://api.example.com/data', {
  withCredentials: true // 关键：包含凭证
});

// XMLHttpRequest
const xhr = new XMLHttpRequest();
xhr.withCredentials = true;
xhr.open('GET', 'https://api.example.com/data');
xhr.send();
```

**服务端配置：**
```
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: https://a.com  // 不能使用 *
```

**credentials 选项：**

| 值 | 含义 |
|----|------|
| `omit` | 从不携带凭证（默认） |
| `same-origin` | 仅同源请求携带 |
| `include` | 总是携带凭证 |

**重要限制：**
```javascript
// ❌ 错误：Access-Control-Allow-Origin 不能是 *
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: true
// 浏览器会拒绝

// ✅ 正确：必须指定具体域名
Access-Control-Allow-Origin: https://a.com
Access-Control-Allow-Credentials: true
```

**Cookie 发送规则：**
- 同源请求：默认携带
- 跨域请求：需 credentials: 'include' + 服务端允许
- Cookie 的 SameSite 属性会影响跨域发送

**SameSite Cookie 属性：**
| 值 | 行为 |
|----|------|
| `Strict` | 完全禁止跨站发送 |
| `Lax` | 允许 GET 请求跨站 |
| `None` | 允许跨站，必须配合 Secure |

**知识点：** `CORS` `凭证` `Cookie` `credentials` `Access-Control-Allow-Credentials`

:::

---

### Q4: 常见的跨域解决方案有哪些？

> **🔥 中等 · 跨域方案**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**常见跨域方案对比：**

| 方案 | 原理 | 支持方法 | 携带凭证 | 现状 |
|------|------|----------|----------|------|
| **CORS** | HTTP 头控制 | 全部 | ✅ | ✅ 推荐 |
| **JSONP** | script 标签 | 仅 GET | ❌ | ⚠️ 已废弃 |
| **代理** | 服务端转发 | 全部 | ✅ | ✅ 常用 |
| **postMessage** | 窗口通信 | - | - | ✅ 特定场景 |
| **WebSocket** | 独立协议 | - | ✅ | ✅ 实时通信 |

**1. CORS（现代标准）**
```javascript
// 前端
fetch('https://api.example.com/data', {
  headers: { 'Content-Type': 'application/json' }
});

// 服务端
res.setHeader('Access-Control-Allow-Origin', 'https://frontend.com');
```

**2. JSONP（老旧方案）**
```javascript
// 前端
function handleResponse(data) {
  console.log(data);
}
const script = document.createElement('script');
script.src = 'https://api.example.com/data?callback=handleResponse';
document.body.appendChild(script);

// 服务端
res.send('handleResponse(' + JSON.stringify(data) + ')');
```
缺点：仅支持 GET、XSS 风险、已废弃

**3. 开发环境代理**
```javascript
// Vite 配置
export default {
  server: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
};

// Webpack 配置
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'https://api.example.com',
        changeOrigin: true
      }
    }
  }
};
```

**4. Nginx 反向代理**
```nginx
server {
  listen 80;
  server_name frontend.com;
  
  location / {
    root /var/www/html;
  }
  
  location /api/ {
    proxy_pass https://api.example.com/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    
    # CORS 头
    add_header Access-Control-Allow-Origin "https://frontend.com";
    add_header Access-Control-Allow-Credentials "true";
  }
}
```

**5. Node.js 中间件代理**
```javascript
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/api', createProxyMiddleware({
  target: 'https://api.example.com',
  changeOrigin: true,
  pathRewrite: { '^/api': '' }
}));
```

**6. postMessage（窗口通信）**
```javascript
// 父页面
const iframeWindow = document.querySelector('iframe').contentWindow;
iframeWindow.postMessage({ type: 'REQUEST' }, 'https://other.com');

window.addEventListener('message', (e) => {
  if (e.origin !== 'https://other.com') return;
  console.log('收到:', e.data);
});
```

**知识点：** `跨域方案` `CORS` `JSONP` `代理` `postMessage`

:::

---

### Q5: 什么是 XSS 攻击？如何防御？

> **💀 困难 · XSS 防御**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**XSS（Cross-Site Scripting）**：跨站脚本攻击，注入恶意脚本到可信网站执行。

**XSS 类型：**

| 类型 | 说明 | 示例 |
|------|------|------|
| **反射型** | 通过 URL 参数注入 | 钓鱼链接 |
| **存储型** | 恶意脚本存储到服务器 | 评论、留言 |
| **DOM 型** | 纯前端 DOM 操作导致 | document.write |

**攻击示例：**
```javascript
// ❌ 反射型 XSS
// URL: https://site.com/search?q=<script>steal(document.cookie)</script>
const query = location.search.split('=')[1];
document.write('搜索结果：' + query); // 脚本执行

// ❌ 存储型 XSS
// 用户评论：<img src=x onerror="steal(cookie)">
// 其他用户查看时脚本执行

// ❌ DOM 型 XSS
// URL 包含 #<img src=x onerror="...">
const hash = location.hash.slice(1);
document.innerHTML = hash; // 脚本执行
```

**防御方案：**

**1. 输出编码（最重要）**
```javascript
// 转义 HTML 特殊字符
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// 框架自动转义
// React: <div>{userInput}</div> 自动转义
// Vue: {{ userInput }} 自动转义
```

**2. 使用框架 Sicherheits特性**
```jsx
// React - 避免 dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{__html: userInput}} /> // ❌

// 如果必须使用，先消毒
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(userInput)}} /> // ✅
```

**3. 设置 HttpOnly Cookie**
```javascript
// 服务端设置
res.cookie('session', token, {
  httpOnly: true,  // 禁止 JS 访问
  secure: true,
  sameSite: 'strict'
});
```

**4. 内容安全策略（CSP）**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;">

<!-- 或 HTTP 头 -->
Content-Security-Policy: default-src 'self'
```

**5. 输入验证**
```javascript
// 白名单验证
function validateInput(input) {
  const allowedPattern = /^[a-zA-Z0-9\s]+$/;
  if (!allowedPattern.test(input)) {
    throw new Error('非法输入');
  }
  return input;
}
```

**6. 其他措施**
- X-XSS-Protection 头（已废弃但可用）
- 不信任任何用户输入
- 定期安全审计

**知识点：** `XSS` `跨站脚本` `CSP` `输出编码` `HttpOnly`

:::

---

### Q6: 什么是 CSRF 攻击？如何防御？

> **💀 困难 · CSRF 防御**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CSRF（Cross-Site Request Forgery）**：跨站请求伪造，诱导用户在已登录状态下执行非预期操作。

**攻击原理：**
```
1. 用户登录银行网站 → 获得 Cookie
2. 用户访问恶意网站
3. 恶意网站发起请求：<img src="https://bank.com/transfer?to=attacker&amount=10000">
4. 浏览器自动携带银行 Cookie
5. 银行执行转账
```

**防御方案：**

**1. CSRF Token（最常用）**
```html
<!-- 表单中携带 token -->
<form action="/transfer" method="POST">
  <input type="hidden" name="csrfToken" value="abc123">
  <input name="amount" value="100">
</form>
```

```javascript
// 框架自动生成和验证
// Express + csurf middleware
const csrf = require('csurf');
app.use(csrf({ cookie: true }));

app.post('/transfer', (req, res) => {
  // token 已自动验证
});
```

**2. SameSite Cookie**
```javascript
// 设置 SameSite 属性
res.cookie('session', token, {
  sameSite: 'strict',  // 完全禁止跨站
  // 或
  sameSite: 'lax',     // 允许 GET 跨站
  secure: true
});
```

**3. 验证 Referer/Origin**
```javascript
app.post('/transfer', (req, res) => {
  const referer = req.get('Referer');
  const origin = req.get('Origin');
  
  if (!referer || !referer.startsWith('https://bank.com')) {
    return res.status(403).send('非法请求');
  }
});
```

**4. 双重验证**
- 敏感操作需要二次确认
- 短信验证码
- 密码确认

**5. 自定义请求头**
```javascript
// 需要 JavaScript 才能设置
fetch('/api/transfer', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json'
  }
});
```
原理：跨域时浏览器不会自动添加自定义头

**防御方案对比：**

| 方案 | 优点 | 缺点 |
|------|------|------|
| CSRF Token | 最可靠，标准做法 | 需要服务端实现 |
| SameSite Cookie | 简单，浏览器支持 | 部分旧浏览器不支持 |
| Referer 检查 | 无需改动 | 可被绕过，隐私泄露 |
| 双重验证 | 最安全 | 用户体验下降 |

**知识点：** `CSRF` `跨站请求伪造` `CSRF Token` `SameSite` `Referer 验证`

:::

---

### Q7: 什么是点击劫持（Clickjacking）？如何防御？

> **🔥 中等 · 点击劫持**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**点击劫持（Clickjacking）**：攻击者将透明 iframe 覆盖在可见按钮上，诱导用户点击非预期内容。

**攻击示例：**
```html
<!-- 恶意网站 -->
<div style="opacity: 0.5;">
  <p>点击领奖！</p>
</div>
<iframe 
  src="https://bank.com/transfer"
  style="position: absolute; top: 100px; opacity: 0;"
></iframe>
<!-- 用户以为点击按钮，实际点击了 iframe 内的转账 -->
```

**防御方案：**

**1. X-Frame-Options（传统方法）**
```nginx
# Nginx 配置
add_header X-Frame-Options "DENY";           # 禁止所有嵌入
add_header X-Frame-Options "SAMEORIGIN";     # 只允许同源嵌入
add_header X-Frame-Options "ALLOW-FROM https://trusted.com";
```

**2. Content-Security-Policy frame-ancestors（推荐）**
```nginx
# 禁止嵌入
add_header Content-Security-Policy "frame-ancestors 'none'";

# 只允许同源
add_header Content-Security-Policy "frame-ancestors 'self'";

# 允许特定域名
add_header Content-Security-Policy "frame-ancestors 'self' https://trusted.com";
```

**3. JavaScript 防御（不推荐单独使用）**
```javascript
// 检查是否被嵌入
if (top !== self) {
  top.location = self.location;
}

// 或使用 X-Content-Type-Options
```

**4. 其他措施**
- 验证码
- 关键操作二次确认
- 检测异常流量

**X-Frame-Options 值对比：**

| 值 | 含义 |
|----|------|
| `DENY` | 禁止所有网站嵌入 |
| `SAMEORIGIN` | 只允许同源嵌入 |
| `ALLOW-FROM uri` | 只允许特定 URI 嵌入（已废弃） |

**知识点：** `点击劫持` `Clickjacking` `X-Frame-Options` `CSP` `iframe 安全`

:::

---

### Q8: 什么是浏览器沙箱机制？

> **🔥 中等 · 沙箱机制**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**沙箱（Sandbox）**：浏览器为网页运行提供的安全隔离环境，限制代码的系统访问权限。

**沙箱限制：**
- ❌ 无法访问本地文件系统
- ❌ 无法直接访问硬件
- ❌ 无法访问其他域的数据
- ❌ 无法执行系统命令
- ✅ 只能访问同源资源
- ✅ 只能使用浏览器提供的 API

**iframe 沙箱属性：**
```html
<!-- 完全沙箱化，禁止所有功能 -->
<iframe src="page.html" sandbox></iframe>

<!-- 允许特定功能 -->
<iframe src="page.html" 
        sandbox="allow-scripts allow-same-origin allow-forms">
</iframe>
```

**沙箱权限：**

| 权限 | 说明 |
|------|------|
| `allow-scripts` | 允许执行脚本 |
| `allow-same-origin` | 允许同源访问 |
| `allow-forms` | 允许表单提交 |
| `allow-popups` | 允许弹窗 |
| `allow-modals` | 允许模态框 |
| `allow-top-navigation` | 允许跳转父页面 |
| `allow-downloads` | 允许下载 |
| `allow-presentation` | 允许演示请求 |

**Worker 沙箱：**
```javascript
// Worker 运行在独立线程
const worker = new Worker('worker.js');
// Worker 无法访问 DOM
// 可以执行计算密集型任务
```

**扩展沙箱：**
```javascript
// Service Worker 沙箱
// 运行在后台，无法访问 DOM
// 可以拦截网络请求

navigator.serviceWorker.register('/sw.js');
```

**沙箱安全边界：**
```
┌─────────────────────────────────┐
│         操作系统                 │
├─────────────────────────────────┤
│         浏览器进程               │
├─────────────────────────────────┤
│    渲染进程 1   │   渲染进程 2   │  ← 进程隔离
│    (沙箱 A)     │   (沙箱 B)     │
└─────────────────────────────────┘
```

**知识点：** `沙箱` `Sandbox` `安全隔离` `iframe` `进程隔离`

:::

---

### Q9: 什么是混合内容（Mixed Content）？有什么风险？

> **🔥 中等 · 混合内容**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**混合内容（Mixed Content）**：HTTPS 页面加载 HTTP 资源。

**类型：**

| 类型 | 示例 | 浏览器行为 | 风险 |
|------|------|------------|------|
| **被动混合** | img、video、audio | 允许加载，控制台警告 | 中间人可篡改内容 |
| **主动混合** | script、iframe、CSS | 阻止加载 | 极高，可劫持页面 |

**检查方式：**
```javascript
// 检查是否有混合内容
if (location.protocol === 'https:') {
  // 页面是 HTTPS
  // 检查资源
  document.querySelectorAll('img, script, link').forEach(el => {
    const src = el.src || el.href;
    if (src && src.startsWith('http://')) {
      console.warn('混合内容:', src);
    }
  });
}
```

**风险：**
- 中间人可篡改 HTTP 资源
- 脚本可窃取 HTTPS cookie
- 破坏端到端加密
- SEO 受影响

**解决方案：**

**1. 使用 HTTPS 资源**
```html
<!-- ❌ 混合内容 -->
<script src="http://cdn.example.com/lib.js"></script>

<!-- ✅ 正确 -->
<script src="https://cdn.example.com/lib.js"></script>

<!-- ✅ 协议自适应（不推荐） -->
<script src="//cdn.example.com/lib.js"></script>
```

**2. Content-Security-Policy 升级**
```html
<meta http-equiv="Content-Security-Policy" 
      content="upgrade-insecure-requests">
```
自动将所有 HTTP 请求升级为 HTTPS

**3. HTTP Strict Transport Security (HSTS)**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```
强制浏览器使用 HTTPS

**4. 检测混合内容**
```javascript
// DevTools Console
getEventListeners(document)

// 或使用 Lighthouse 审计
```

**知识点：** `混合内容` `Mixed Content` `HTTPS` `中间人攻击` `安全升级`

:::

---

### Q10: HTTPS 一定安全吗？有哪些潜在风险？

> **💀 困难 · HTTPS 安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HTTPS 不是绝对安全！仍有以下风险：**

**1. 中间人攻击（MITM）**
```
攻击者方法：
- 伪造证书
- 安装恶意根证书
- DNS 劫持
- ARP 欺骗
```

**防御：**
- 证书固定（Certificate Pinning）
- 检查证书链
- HSTS

**2. SSL 剥离攻击**
```
攻击方式：
1. 用户访问 http://site.com
2. 攻击者拦截，阻止跳转到 https
3. 用户在 HTTP 下输入敏感信息
```

**防御：**
- HSTS 预加载
- 服务端强制 301 到 HTTPS
- 使用 HTTPS-only Cookie

**3. 证书信任问题**
```
风险：
- CA 被入侵（如 DigiNotar 事件）
- 恶意根证书预装
- 自签名证书
```

**防御：**
- 使用知名 CA
- CT（Certificate Transparency）日志
- 证书固定

**4. 协议降级攻击**
```
攻击方式：
- 强制使用弱加密套件
- 降级到 SSL 3.0（POODLE 攻击）
```

**防御：**
- 禁用弱加密
- 使用 TLS 1.3
- AEAD 加密模式

**5. 内容仍可能被篡改**
```
风险：
- XSS 仍可执行
- CSRF 仍可发生
- 恶意 JS 可窃取数据
```

**防御：**
- 输入输出过滤
- CSRF Token
- CSP

**6. 第三方资源风险**
```html
<!-- 即使主站 HTTPS -->
<script src="https://cdn.third-party.com/lib.js"></script>
<!-- 第三方被入侵，用户仍受害 -->
```

**安全最佳实践：**

| 措施 | 说明 |
|------|------|
| **使用 TLS 1.3** | 禁用旧版本 |
| **强加密套件** | 禁用 RC4、3DES 等 |
| **HSTS** | 强制 HTTPS |
| **证书透明度** | 监控异常证书 |
| **CSP** | 限制资源加载 |
| **子资源完整性** | 验证第三方资源 |

**子资源完整性（SRI）：**
```html
<script 
  src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous">
</script>
```

**知识点：** `HTTPS 安全` `中间人攻击` `SSL 剥离` `证书固定` `HSTS`

:::

---

### Q11: 什么是内容安全策略（CSP）？如何配置？

> **💀 困难 · CSP**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CSP（Content Security Policy）**：通过白名单机制限制资源加载，防止 XSS 等攻击。

**配置方式：**

**1. HTTP 头（推荐）**
```
Content-Security-Policy: default-src 'self'; 
                         script-src 'self' https://trusted.com;
                         style-src 'self' 'unsafe-inline';
                         img-src 'self' data: https:;
```

**2. HTML Meta 标签**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'">
```

**3. 报告模式（仅报告不阻断）**
```
Content-Security-Policy-Report-Only: default-src 'self'
```

**常用指令：**

| 指令 | 控制内容 | 常用值 |
|------|----------|--------|
| `default-src` | 默认策略 | 'self'、'none'、https: |
| `script-src` | 脚本 | 'self'、'unsafe-inline'、'nonce-*' |
| `style-src` | 样式 | 'self'、'unsafe-inline' |
| `img-src` | 图片 | 'self'、data:、https: |
| `font-src` | 字体 | 'self' |
| `connect-src` | XHR/WebSocket | 'self'、API 域名 |
| `frame-src` | iframe | 'self'、'none' |
| `frame-ancestors` | 允许嵌入的父页面 | 'self'、'none' |
| `form-action` | 表单提交目标 | 'self' |
| `base-uri` | 基准 URL | 'self' |
| `upgrade-insecure-requests` | HTTP 升级 HTTPS | （无参数）|

**特殊值：**

| 值 | 含义 |
|----|------|
| `'self'` | 仅同源 |
| `'unsafe-inline'` | 允许内联脚本/样式 |
| `'unsafe-eval'` | 允许 eval() |
| `'none'` | 禁止所有 |
| `'strict-dynamic'` | 信任脚本动态加载的脚本 |
| `'nonce-***'` | 使用随机 nonce |
| `'sha384-***'` | 哈希验证 |

**Nonce 使用示例：**
```html
<!-- 服务端生成随机 nonce -->
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' 'nonce-abc123'">

<!-- 只有带正确 nonce 的脚本才能执行 -->
<script nonce="abc123">
  // 这个会执行
</script>

<script>
  // 这个不会执行
</script>
```

**Nginx 配置示例：**
```nginx
add_header Content-Security-Policy 
  "default-src 'self';
   script-src 'self' 'unsafe-inline' https://www.google-analytics.com;
   style-src 'self' 'unsafe-inline';
   img-src 'self' data: https:;
   connect-src 'self' https://api.example.com;
   frame-ancestors 'none';
   upgrade-insecure-requests";
```

**违规报告：**
```
Content-Security-Policy: default-src 'self'; report-uri /csp-report
```

```javascript
// 服务端接收报告
app.post('/csp-report', (req, res) => {
  console.log('CSP 违规:', req.body);
});
```

**知识点：** `CSP` `内容安全策略` `XSS 防御` `资源白名单` `安全头`

:::

---
---

### Q12: 点击劫持是什么？如何防范？

> **🔥 中等 · Web 安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**点击劫持（Clickjacking）是通过透明 iframe 诱导用户点击的攻击手法。**

**1. 攻击原理：**

```text
攻击场景：
1. 攻击者创建恶意页面
2. 用透明 iframe 嵌入目标网站（如银行转账）
3. 在上方覆盖诱导内容（如"点击抽奖"）
4. 用户以为点击诱导内容，实际点击了 iframe 中的按钮
5. 完成非预期的危险操作
```

**2. 攻击代码示例：**

```html
<!-- 攻击者页面 -->
<div style="opacity: 0.5;">
  <p>🎉 恭喜你中奖了！点击领取</p>
  <button style="font-size: 24px;">立即领取</button>
</div>

<!-- 透明 iframe 覆盖在按钮位置 -->
<iframe 
  src="https://bank.com/transfer?to=hacker&amount=10000" 
  style="position: absolute; top: 100px; left: 100px; 
         opacity: 0; width: 200px; height: 50px;">
</iframe>
```

**3. 防御方案 - X-Frame-Options：**

```http
# 响应头防御
X-Frame-Options: DENY           # 禁止所有 iframe
X-Frame-Options: SAMEORIGIN     # 允许同源 iframe
X-Frame-Options: ALLOW-FROM https://trusted.com/

# Nginx 配置
add_header X-Frame-Options "SAMEORIGIN" always;

# Apache 配置
Header always set X-Frame-Options "SAMEORIGIN"
```

**4. 防御方案 - Content-Security-Policy：**

```http
# CSP frame-ancestors 指令（推荐，替代 X-Frame-Options）
Content-Security-Policy: frame-ancestors self https://trusted.com

# 值说明：
self           - 只允许同源
none           - 不允许任何来源
https://a.com    - 允许指定来源
*                - 允许所有（不推荐）
```

**5. 防御方案 - Frame Busting JS：**

```javascript
// 顶层窗口检测
if (top !== window) {
  top.location = window.location;
}

// More 健壮版本
(function() {
  if (window.top !== window.self) {
    window.top.location = window.location;
  }
})();

// ⚠️ 注意：X-Frame-Options 优先于 JS 防御
```

**6. 现代浏览器防护：**

```text
浏览器内置防护：
- Chrome: 检测 X-Frame-Options 和 CSP
- Firefox: 严格的来源检查
- Safari: 默认阻止跨域 iframe

浏览器扩展：
- NoScript（阻止未知 iframe）
- uBlock Origin（过滤恶意嵌入）
```

**7. 各方案对比：**

| 方案 | 兼容性 | 安全性 | 推荐度 |
|------|--------|--------|--------|
| X-Frame-Options | 好 | 中 | ✅ |
| CSP frame-ancestors | 中 | 高 | ✅✅ |
| JS Frame Busting | 好 | 低 | ⚠️ |
| SameSite Cookie | 中 | 中 | ✅ |

**知识点：** `点击劫持` `X-Frame-Options` `CSP` `iframe 安全` `Web 安全`

:::

---

### Q13: 中间人攻击是什么？HTTPS 如何防范？

> **🔥 中等 · 网络安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**中间人攻击（MITM）是攻击者在通信双方之间拦截、篡改通信内容的攻击手法。**

**1. 攻击原理：**

```text
正常通信：
Client ←→ Server

MITM 攻击：
Client ←→ Attacker ←→ Server
         (拦截所有流量)

攻击者可以:
- 窃听通信内容（账号密码）
- 篡改数据（转账金额）
- 注入恶意代码
- 伪造身份
```

**2. HTTP 中间人攻击：**

```text
HTTP 无防护：
1. 客户端发送明文请求
2. 攻击者在网络中截获
3. 读取或修改内容
4. 转发给服务器/客户端

被窃听内容：
- Cookie/Session
- 账号密码
- 个人信息
- 通信内容
```

**3. HTTPS 防护机制：**

```text
HTTPS = HTTP + TLS/SSL

TLS 防护层：
┌─────────────────────────────────┐
│ 1. 身份认证                     │
│   - 证书验证服务器身份           │
│   - 防止伪造                    │
├─────────────────────────────────┤
│ 2. 加密传输                     │
│   - 对称加密（AES-256）         │
│   - 内容不可读                  │
├─────────────────────────────────┤
│ 3. 完整性校验                   │
│   - HMAC/签名                   │
│   - 防止篡改                    │
└─────────────────────────────────┘
```

**4. TLS 握手过程：**

```text
TLS 1.2 握手：
Client                    Server
   │── ClientHello ──────►│
   │◄── ServerHello ──────│
   │◄── Certificate ──────│ (证书验证)
   │◄── ServerKeyEx ──────│
   │── ClientKeyEx ──────►│ (密钥交换)
   │── ChangeCipher ──────►│
   │── Finished ──────────►│
   │◄── ChangeCipher ─────│
   │◄── Finished ─────────│
   │── 加密 HTTP 请求 ─────►│

结果:
- 会话密钥协商完成
- 后续通信加密
- MITM 无法解密
```

**5. 证书验证过程：**

```text
证书链验证：
1. 获取服务器证书
2. 使用中间证书公钥验证签名
3. 使用根证书验证中间证书
4. 根证书预装在 OS/浏览器

验证内容：
- 证书是否过期
- 域名是否匹配
- 证书是否被吊销（CRL/OCSP）
- 证书链是否完整
```

**6. 无法防范的场景：**

```text
HTTPS 不能防范：
❌ 客户端已感染恶意软件
❌ 用户安装了恶意根证书
❌ 企业代理监控（安装 CA）
❌ 伪造证书（CA 被攻破）
❌ DNS 解析被篡改

解决方案：
✅ Certificate Pinning（证书绑定）
✅ HSTS（强制 HTTPS）
✅ 信任 First 连接
✅ DNSSEC（DNS 安全）
```

**7. 最佳实践：**

```nginx
# Nginx 强制 HTTPS
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    
    # 强加密套件
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # HSTS
    add_header Strict-Transport-Security 
      "max-age=31536000; includeSubDomains; preload" always;
}
```

**知识点：** `中间人攻击` `HTTPS` `TLS` `证书验证` `加密通信` `网络安全`

:::

---

### Q14: 浏览器的沙箱机制是怎样的？站点隔离是什么？

> **🔥 中等 · 浏览器安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**浏览器沙箱将不同来源的运行环境隔离，站点隔离是防止 Spectre 攻击的关键防御。**

**1. 沙箱架构演进：**

```text
传统架构（单进程）:
┌─────────────────────────────┐
│       浏览器进程             │
│  ┌──────┬──────┬──────┐    │
│  │标签 1 │标签 2 │标签 3 │    │
│  └──────┴──────┴──────┘    │
└─────────────────────────────┘
问题：一个标签崩溃，整个浏览器崩溃

现代架构（多进程）:
┌─────────────────────────────┐
│         浏览器进程           │ (UI, 控制)
├─────────────────────────────┤
│         渲染进程 1           │ (站点 A)
│  ┌──────┬──────┐            │
│  │标签 1 │标签 2 │            │
│  └──────┴──────┘            │
├─────────────────────────────┤
│         渲染进程 2           │ (站点 B)
│  ┌──────┐                   │
│  │标签 3 │                   │
│  └──────┘                   │
└─────────────────────────────┘
优势：进程隔离，安全崩溃隔离
```

**2. 站点隔离（Site Isolation）：**

```text
站点定义：
- Scheme + eTLD+1
- https://example.com
- https://sub.example.com
- http://example.com ❌ (scheme 不同)

Spectre 攻击前提:
- 不同来源共享进程
- 恶意 iframe 读取跨域数据
- 通过侧信道攻击（缓存时序）

站点隔离:
- 每个站点独立渲染进程
- 跨 iframe 跨进程通信
- 无法访问其他站点内存
```

**3. 进程隔离级别：**

```text
Chrome 进程模型：

Browser Process
    ├── GPU Process
    ├── Network Service
    ├── Audio Service
    └── Renderer Processes
          ├── Site A (iframe A1, A2)
          ├── Site B (iframe B1)
          └── Site C (iframe C1, C2)

iframe 加载：
- 同源 iframe：同进程
- 异源 iframe：新进程
```

**4. 沙箱限制：**

```javascript
// 渲染进程权限受限
// ❌ 无法执行
require("fs").readFileSync("/etc/passwd");
eval("system()");

// ✅ 允许
DOM 操作
网络请求（受 CSP 限制）
本地存储（受同源限制）
```

**5. 安全边界：**

```text
跨进程通信（IPC）:
渲染进程──►浏览器进程──►渲染进程

步骤:
1. 子进程验证消息来源
2. 浏览器进程转发
3. 目标进程处理

优势:
- 恶意渲染进程无法直接访问其他进程
- 所有 IPC 经过浏览器进程审查
```

**6. 其他沙箱机制：**

```javascript
// iframe 沙箱
<iframe src="page.html" sandbox="allow-scripts allow-same-origin">
属性：
- allow-scripts: 允许 JS
- allow-forms: 允许表单
- allow-same-origin: 允许同源
- allow-popups: 允许弹窗
- allow-top-navigation: 允许顶层导航

// Content Security Policy
<meta http-equiv="Content-Security-Policy" 
      content="default-src self; script-src self">

// 跨域隔离 (COOP/COEP)
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

**7. 检测进程隔离：**

```javascript
// 检查是否跨进程
const frame = document.createElement("iframe");
frame.src = "https://other-site.com";
document.body.appendChild(frame);

// 同进程：crossOrigin 属性可访问
// 跨进程：crossOrigin 为 null

console.log(frame.contentWindow); // [object Window]
console.log(frame.contentWindow.location); // 跨域会抛错
```

**知识点：** `浏览器沙箱` `站点隔离` `进程隔离` `Spectre` `多进程架构` `安全`

:::

