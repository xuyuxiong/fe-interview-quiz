---
title: 跨域方案详解
description: 同源策略定义、CORS 详解、Nginx 代理、JSONP、postMessage、WebSocket 跨域、开发环境 proxy
---

# 跨域方案详解

跨域是前端开发中常见的问题，了解各种跨域方案的原理和使用场景非常重要。

---

### Q1: 什么是同源策略？为什么需要跨域？

> **⭐ 简单 · 同源策略**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**同源策略（Same-Origin Policy）**：浏览器的安全基石，限制不同源的文档或脚本如何交互。

**同源定义**：协议、域名（子域名）、端口三者完全相同。

**示例判断：**

| URL A | URL B | 是否同源 |
|-------|-------|----------|
| `http://example.com` | `http://example.com` | ✅ 是 |
| `http://example.com` | `https://example.com` | ❌ 协议不同 |
| `http://example.com:80` | `http://example.com:8080` | ❌ 端口不同 |
| `http://a.example.com` | `http://b.example.com` | ❌ 子域不同 |
| `http://example.com` | `http://www.example.com` | ❌ 域名不同 |
| `http://example.com/page` | `http://example.com/other` | ✅ 是（路径不影响） |

**同源策略限制的操作：**
- ❌ XMLHttpRequest/fetch 请求不同源
- ❌ 访问不同源的 localStorage、Cookie
- ❌ 访问不同源 iframe 的 DOM
- ❌ 获取不同源窗口的引用

**同源策略允许的嵌入：**
- ✅ `<script src="不同源">`
- ✅ `<link href="不同源">`
- ✅ `<img src="不同源">`
- ✅ `<iframe src="不同源">`（但无法访问其 DOM）

**为什么需要同源策略？**
1. **保护用户隐私**：防止恶意网站窃取 Cookie 和存储数据
2. **防止 CSRF**：限制跨站请求
3. **隔离安全上下文**：不同网站互不干扰

**跨域需求场景：**
- 前后端分离架构
- CDN 资源加载
- 微服务架构
- 第三方服务集成

**知识点：** `同源策略` `Same-Origin` `安全策略` `跨域需求`

:::

---

### Q2: CORS 的简单请求和预检请求有什么区别？

> **🔥 中等 · CORS 请求类型**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**简单请求（Simple Request）** 需同时满足：

**请求方法限制：**
- 仅限 GET、HEAD、POST

**请求头限制：**
- 只能包含安全字段（Accept、Accept-Language、Content-Language、Content-Type）
- 不能包含自定义头

**Content-Type 限制：**
- `application/x-www-form-urlencoded`
- `multipart/form-data`
- `text/plain`

**示例 - 简单请求：**
```javascript
// 这是简单请求
fetch('https://api.example.com/data', {
  method: 'GET'
});

fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: 'name=张三'
});
```

**预检请求（Preflight Request）**：
不满足简单请求条件时，浏览器自动发送 OPTIONS 请求。

**触发预检的场景：**
```javascript
// ❌ 不是简单请求 - Content-Type 不符合
fetch('https://api.example.com/data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: '张三' })
});

// ❌ 不是简单请求 - 有自定义头
fetch('https://api.example.com/data', {
  headers: {
    'X-Custom-Header': 'value'
  }
});

// ❌ 不是简单请求 - 方法不符合
fetch('https://api.example.com/data', {
  method: 'PUT'
});
```

**预检请求流程：**
```
┌─────────┐                         ┌─────────┐
│ 浏览器   │                         │  服务器  │
└────┬────┘                         └────┬────┘
     │                                   │
     │─── OPTIONS (预检) ───────────────>│
     │    Origin: https://a.com          │
     │    Access-Control-Request-Method: POST
     │    Access-Control-Request-Headers: Content-Type
     │                                   │
     │<── 响应允许 ──────────────────────│
     │    Access-Control-Allow-Origin: https://a.com
     │    Access-Control-Request-Method: POST
     │    Access-Control-Allow-Headers: Content-Type
     │                                   │
     │─── POST (实际请求) ──────────────>│
     │<─── 响应 ─────────────────────────│
```

**预检缓存（优化）：**
```
Access-Control-Max-Age: 86400  // 预检结果缓存 24 小时
```
缓存期间相同请求不再预检。

**知识点：** `CORS` `简单请求` `预检请求` `OPTIONS` `请求分类`

:::

---

### Q3: 如何用 Nginx 配置 CORS？

> **🔥 中等 · Nginx 代理**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Nginx CORS 完整配置：**

```nginx
server {
  listen 80;
  server_name api.example.com;

  location / {
    # 动态获取请求 Origin（支持多个域名）
    if ($http_origin ~* (https://www.example.com|https://admin.example.com)) {
      set $cors_origin $http_origin;
    }

    # CORS 响应头
    add_header Access-Control-Allow-Origin $cors_origin;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With";
    add_header Access-Control-Allow-Credentials true;
    add_header Access-Control-Max-Age 86400;

    # 处理预检请求
    if ($request_method = 'OPTIONS') {
      return 204;
    }

    # 代理到后端
    proxy_pass http://backend:3000;
  }
}
```

**常用配置组合：**

**1. 允许特定域名**
```nginx
set $cors '';
if ($http_origin ~ 'https://www.example.com') {
  set $cors 'true';
}

if ($cors = 'true') {
  add_header Access-Control-Allow-Origin $http_origin;
  add_header Access-Control-Allow-Credentials 'true';
}
```

**2. 允许所有域名（慎用）**
```nginx
add_header Access-Control-Allow-Origin *;
```

**3. 带缓存配置**
```nginx
location /api/ {
  # 预检请求处理
  if ($request_method = 'OPTIONS') {
    add_header Access-Control-Allow-Origin *;
    add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
    add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    add_header Access-Control-Max-Age 1728000;
    add_header Content-Type 'text/plain; charset=utf-8';
    add_header Content-Length 0;
    return 204;
  }

  # 实际请求响应
  add_header Access-Control-Allow-Origin *;
  add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
  add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
  add_header Access-Control-Expose-Headers 'Content-Length,Content-Range';
  
  proxy_pass http://backend;
}
```

**4. 生产环境推荐（指定域名）**
```nginx
map $http_origin $allow_origin {
  default "";
  "https://www.example.com" $http_origin;
  "https://admin.example.com" $http_origin;
  "https://m.example.com" $http_origin;
}

add_header Access-Control-Allow-Origin $allow_origin;
add_header Access-Control-Allow-Credentials true;
```

**知识点：** `Nginx` `CORS 配置` `反向代理` `预检处理`

:::

---

### Q4: JSONP 的原理是什么？有什么局限性？

> **⭐ 简单 · JSONP**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**JSONP（JSON with Padding）**：利用 `<script>` 标签不受同源策略限制实现跨域。

**原理：**
1. 前端定义回调函数
2. 动态创建 `<script>` 标签，src 指向跨域 API
3. 返回的 JS 代码调用回调函数，传入数据

**实现代码：**

**前端：**
```javascript
function jsonp(url, callback) {
  // 1. 生成唯一回调名
  const cbName = 'jsonp_cb_' + Math.random().toString(36).slice(2);
  
  // 2. 创建 script 标签
  const script = document.createElement('script');
  
  // 3. 定义回调函数
  window[cbName] = function(data) {
    callback(data);
    // 清理
    delete window[cbName];
    script.remove();
  };
  
  // 4. 设置 src
  script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + cbName;
  
  // 5. 错误处理
  script.onerror = function() {
    callback(null);
    delete window[cbName];
    script.remove();
  };
  
  document.body.appendChild(script);
}

// 使用
jsonp('https://api.example.com/data', function(data) {
  console.log(data);
});
```

**后端（Node.js）：**
```javascript
app.get('/api/data', (req, res) => {
  const data = { name: '张三', age: 25 };
  const callback = req.query.callback;
  
  // 返回 JS 代码
  res.send(`${callback}(${JSON.stringify(data)})`);
});
```

**JSONP 局限性：**

| 限制 | 说明 |
|------|------|
| **仅支持 GET** | 只能使用 script 标签 |
| **XSS 风险** | 返回的是可执行 JS |
| **无法获取状态码** | 无法判断请求失败原因 |
| **不支持自定义头** | 无法发送认证头等 |
| **已废弃** | 现代应用应使用 CORS |

**与 CORS 对比：**

| 特性 | JSONP | CORS |
|------|-------|------|
| 支持方法 | 仅 GET | 全部 |
| 错误处理 | 弱 | 完整 |
| 安全性 | 低 | 高 |
| 浏览器支持 | 所有 | IE10+ |
| 推荐度 | ❌ 不推荐 | ✅ 推荐 |

**知识点：** `JSONP` `跨域历史方案` `script 标签` `回调函数`

:::

---

### Q5: 如何使用 postMessage 实现跨域通信？

> **🔥 中等 · postMessage**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**postMessage**：HTML5 提供的跨窗口通信 API，支持跨域。

**使用场景：**
- 父子页面通信（iframe）
- 多标签页通信
- 弹窗与主窗口通信
- Worker 通信

**基本用法：**

```javascript
// 发送消息
targetWindow.postMessage(
  { type: 'USER_LOGIN', data: { id: 1 } },  // 消息内容
  'https://trusted.com'  // 目标源
);

// 接收消息
window.addEventListener('message', (event) => {
  // 1. 验证来源
  if (event.origin !== 'https://trusted.com') return;
  
  // 2. 处理消息
  console.log('收到:', event.data);
  
  // 3. 可选：回复
  event.source.postMessage({ type: 'ACK' }, event.origin);
});
```

**iframe 跨域通信示例：**

**父页面：**
```html
<iframe src="https://other.com/child.html" id="child"></iframe>
<script>
  const iframe = document.getElementById('child');
  
  // 发送消息
  iframe.contentWindow.postMessage(
    { action: 'resize', height: 600 },
    'https://other.com'
  );
  
  // 监听消息
  window.addEventListener('message', (e) => {
    if (e.origin !== 'https://other.com') return;
    if (e.data.action === 'updateHeight') {
      iframe.style.height = e.data.height + 'px';
    }
  });
</script>
```

**子页面：**
```javascript
// 发送消息给父页面
parent.postMessage(
  { action: 'updateHeight', height: 1000 },
  'https://parent.com'
);

// 监听父页面消息
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://parent.com') return;
  if (e.data.action === 'resize') {
    document.body.style.height = e.data.height + 'px';
  }
});
```

**消息序列化（复杂数据）：**
```javascript
// 发送前序列化
const message = {
  type: 'FORM_DATA',
  payload: JSON.stringify(formData)
};
target.postMessage(message, targetOrigin);

// 接收后反序列化
window.addEventListener('message', (e) => {
  if (e.data.payload) {
    const data = JSON.parse(e.data.payload);
  }
});
```

**安全最佳实践：**
```javascript
// ✅ 始终指定 targetOrigin，不要用 *
target.postMessage(data, 'https://specific-domain.com');

// ✅ 始终验证 event.origin
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://trusted.com') {
    console.warn('拒绝未知来源消息');
    return;
  }
  // 处理消息
});

// ✅ 使用消息 ID 防止重放攻击
const messageId = Date.now() + Math.random();
postMessage({ id: messageId, data: '...' });
```

**知识点：** `postMessage` `跨窗口通信` `iframe 通信` `消息验证`

:::

---

### Q6: WebSocket 如何实现跨域？

> **🔥 中等 · WebSocket**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**WebSocket 跨域**：WebSocket 握手请求遵循同源策略，但可通过服务端配置允许跨域。

**握手流程：**
```
浏览器                           服务器
  │                               │
  │─── WebSocket 握手请求 ───────>│
  │   Upgrade: websocket         │
  │    Connection: Upgrade       │
  │    Sec-WebSocket-Key: xxx    │
  │    Origin: https://client.com│
  │                               │
  │<── 握手响应 ──────────────────│
  │    Upgrade: websocket        │
  │    Connection: Upgrade       │
  │    Sec-WebSocket-Accept: yyy │
  │                               │
  │    【连接建立，可双向通信】    │
```

**服务端配置（Node.js）：**
```javascript
const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  console.log('新连接:', req.headers.origin);
  
  ws.on('message', (message) => {
    console.log('收到:', message);
    ws.send('收到消息');
  });
});

server.listen(8080);
```

**跨域配置：**

**Node.js (ws 库)：**
```javascript
const wss = new WebSocket.Server({ 
  port: 8080,
  
  // 验证来源
  verifyClient: (info) => {
    const allowedOrigins = [
      'https://www.example.com',
      'https://admin.example.com'
    ];
    return allowedOrigins.includes(info.origin);
  }
});
```

**Spring Boot：**
```java
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {
  @Override
  public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
    registry.addHandler(new MyHandler(), "/ws")
      .setAllowedOrigins("https://www.example.com");
  }
}
```

**Nginx 反向代理：**
```nginx
location /ws {
  proxy_pass http://backend:8080;
  proxy_http_version 1.1;
  proxy_set_header Upgrade $http_upgrade;
  proxy_set_header Connection "upgrade";
  
  # CORS 头
  add_header Access-Control-Allow-Origin "https://www.example.com";
}
```

**客户端连接：**
```javascript
const ws = new WebSocket('wss://chat.example.com/ws');

ws.onopen = () => {
  console.log('连接成功');
  ws.send(JSON.stringify({ type: 'login', token: 'xxx' }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到:', data);
};

ws.onerror = (error) => {
  console.error('错误:', error);
};

ws.onclose = () => {
  console.log('连接关闭');
};
```

**知识点：** `WebSocket` `跨域连接` `握手协议` `实时通信`

:::

---

### Q7: 开发环境如何配置 proxy？

> **⭐ 简单 · 开发代理**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**开发环境代理**：本地开发时将 API 请求代理到开发服务器，避免跨域问题。

**Vite 配置：**
```javascript
// vite.config.js
export default {
  server: {
    proxy: {
      // 简单字符串匹配
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      
      // 正则匹配
      '^/api/v\\d+': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/v\d+/, '/api')
      },
      
      // WebSocket 代理
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true
      },
      
      // 多代理配置
      '/api/v1': {
        target: 'http://dev-api.example.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('X-Custom-Header', 'value');
          });
        }
      }
    }
  }
};
```

**Webpack 配置：**
```javascript
// webpack.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        pathRewrite: { '^/api': '' },
        secure: false,
        logLevel: 'debug'
      },
      '/auth': {
        target: 'http://auth-server:8080',
        changeOrigin: true
      }
    }
  }
};
```

**Create React App：**
```javascript
// package.json
{
  "proxy": "http://localhost:3000"
}

// 或使用 http-middleware 配置文件
// 在 src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use('/api', createProxyMiddleware({
    target: 'http://localhost:3000',
    changeOrigin: true
  }));
};
```

**Vue CLI 配置：**
```javascript
// vue.config.js
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        ws: true,
        pathRewrite: { '^/api': '' }
      }
    }
  }
};
```

**注意事项：**
- 生产环境需配置 CORS 或 Nginx 反向代理
- 代理只解决开发环境跨域
- changeOrigin: true 会修改 Host 头

**知识点：** `开发代理` `Vite proxy` `Webpack proxy` `开发环境`

:::

---

### Q8: OPTIONS 预检请求是如何工作的？

> **🔥 中等 · OPTIONS 请求**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**OPTIONS 预检请求**：CORS 复杂请求前的"询问"请求，确认服务器是否允许实际请求。

**触发预检的条件：**
```javascript
// 这些情况会触发预检

// 1. 非 GET/HEAD/POST 方法
fetch(url, { method: 'PUT' });

// 2. POST 使用非简单 Content-Type
fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});

// 3. 自定义请求头
fetch(url, {
  headers: { 'X-Custom-Header': 'value' }
});
```

**预检请求头：**
```
OPTIONS /api/data HTTP/1.1
Host: api.example.com
Origin: https://www.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization
```

**服务端响应：**
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://www.example.com
Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

**Nginx 完整预检处理：**
```nginx
location /api/ {
  # 处理 OPTIONS 预检
  if ($request_method = 'OPTIONS') {
    add_header Access-Control-Allow-Origin $http_origin;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    add_header Access-Control-Allow-Credentials true;
    add_header Access-Control-Max-Age 86400;
    add_header Content-Length 0;
    add_header Content-Type text/plain;
    return 204;
  }
  
  # 实际请求处理
  add_header Access-Control-Allow-Origin $http_origin;
  add_header Access-Control-Allow-Credentials true;
  
  proxy_pass http://backend;
}
```

**Node.js (Express) 处理：**
```javascript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://www.example.com');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.header('Access-Control-Max-Age', '86400');
  
  // 预检请求直接返回
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
});
```

**预检缓存优化：**
```
Access-Control-Max-Age: 86400  // 缓存 24 小时
```
缓存期间相同 URL、方法、头的请求不再预检。

**知识点：** `OPTIONS` `预检请求` `CORS` `请求头验证`

:::

---
---

### Q9: CORS 预检请求什么时候触发？如何减少预检？

> **🔥 中等 · CORS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CORS 预检请求用 OPTIONS 方法探测服务器是否允许实际请求，合理设计可减少预检提升性能。**

**1. 预检触发条件：**

```text
触发预检的请求（复杂请求）:
- 方法：PUT, DELETE, PATCH
- Content-Type: application/json
- 自定义请求头
- 带凭证的请求

不触发预检（简单请求）:
- 方法：GET, HEAD, POST
- Content-Type: 
  - application/x-www-form-urlencoded
  - multipart/form-data
  - text/plain
- 无自定义头
```

**2. 预检缓存：**

```http
Access-Control-Max-Age: 86400  # 缓存 24 小时

缓存期内：
- 相同 URL + 方法 + 头
- 不发 OPTIONS
- 直接发实际请求
```

**3. 减少预检策略：**

```javascript
// 策略 1：使用简单请求
fetch("/api", {
  method: "POST",
  headers: { "Content-Type": "text/plain" },
  body: JSON.stringify(data)
});

// 策略 2:GET 替代 POST（查询操作）
fetch("/api/search?q=keyword");

// 策略 3：合并自定义头
headers: { "X-Custom-All": "a:b:c" }
```

**知识点：** `CORS` `预检请求` `OPTIONS` `跨域` `性能优化`

:::

---

### Q10: CORS 的 Credentials 模式有哪些注意事项？

> **🔥 中等 · CORS**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CORS 凭证模式控制是否发送 Cookie 和认证信息，需要前后端配合配置。**

**1. credentials 三个值：**

```javascript
fetch(url, { credentials: "include" });     // 始终发送
fetch(url, { credentials: "same-origin" }); // 默认，仅同源
fetch(url, { credentials: "omit" });        // 从不发送
```

**2. 服务端配置要求：**

```http
Access-Control-Allow-Credentials: true
Access-Control-Allow-Origin: https://specific.com  # 不能是 *
```

**3. 常见陷阱：**

```javascript
// 错误：通配符 origin + credentials
// 后端（错误）:
res.setHeader("Access-Control-Allow-Origin", "*");
res.setHeader("Access-Control-Allow-Credentials", "true");

// 正确：动态设置 origin
const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
}
```

**4. SameSite 交互：**

```text
Cookie: SameSite=Lax
- 跨站导航 GET: 发送
- 跨站 POST: 不发送

Cookie: SameSite=None; Secure
- 所有请求：发送
- 需credentials: "include"
```

**知识点：** `CORS` `credentials` `Cookie` `跨域认证` `SameSite`

:::
