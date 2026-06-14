---
title: 工程化 CI/CD 补充面试题
description: Jenkins CI/CD、平台设计、服务回滚等面试题
---

# 工程化 CI/CD 补充面试题

### Q1: Jenkins CI/CD 怎么配置？部署流程是怎样的？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CI/CD 核心流程：**

```text
代码提交 → 自动构建 → 自动测试 → 自动部署
```

```groovy
// Jenkinsfile（声明式 Pipeline）
pipeline {
  agent any

  environment {
    REGISTRY = 'registry.example.com'
    IMAGE_NAME = 'frontend-app'
    VERSION = "${env.BUILD_NUMBER}"
  }

  stages {
    stage('Install') {
      steps { sh 'npm ci' }
    }
    stage('Lint') {
      steps { sh 'npm run lint' }
    }
    stage('Test') {
      steps { sh 'npm run test:unit -- --coverage' }
    }
    stage('Build') {
      steps { sh 'npm run build' }
    }
    stage('Docker Build') {
      steps {
        sh "docker build -t ${REGISTRY}/${IMAGE_NAME}:${VERSION} ."
        sh "docker push ${REGISTRY}/${IMAGE_NAME}:${VERSION}"
      }
    }
    stage('Deploy') {
      steps {
        sh "kubectl set image deployment/${IMAGE_NAME} ${IMAGE_NAME}=${REGISTRY}/${IMAGE_NAME}:${VERSION}"
        sh "kubectl rollout status deployment/${IMAGE_NAME}"
      }
    }
  }

  post {
    success { echo 'Deploy succeeded!' }
    failure { echo 'Deploy failed!' }
  }
}
```

**服务回滚：**

```bash
# K8s 回滚
kubectl rollout undo deployment/frontend-app          # 回滚到上一版本
kubectl rollout undo deployment/frontend-app --to-revision=3  # 回滚到指定版本
kubectl rollout history deployment/frontend-app       # 查看历史

# Docker 回滚 — 重新部署旧版本镜像
kubectl set image deployment/app app=registry.example.com/app:PREVIOUS_VERSION
```

| 步骤 | 工具 | 说明 |
|------|------|------|
| 代码提交 | Git | 触发 Webhook |
| 自动构建 | Jenkins/GitLab CI | Pipeline 编排 |
| 自动测试 | Jest/Cypress | 质量关卡 |
| 镜像构建 | Docker | 标准化交付 |
| 部署 | K8s | 滚动更新 |
| 回滚 | kubectl | 快速回退 |

**知识点：** `CI/CD` `Jenkins` `Pipeline` `Docker` `K8s` `服务回滚`

:::

### Q2: 如何设计一个 CI/CD 工程平台？

> **💀 困难 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**平台架构：**

```text
┌─────────┐   webhook   ┌──────────┐   trigger   ┌───────────┐
│  Git 仓库 │ ──────────→ │  调度服务  │ ──────────→ │  构建节点   │
└─────────┘             └──────────┘             └───────────┘
                              │                        │
                              ▼                        ▼
                        ┌──────────┐             ┌───────────┐
                        │  任务队列  │             │  产物存储   │
                        └──────────┘             └───────────┘
                              │                        │
                              ▼                        ▼
                        ┌──────────┐             ┌───────────┐
                        │  状态推送  │             │  部署服务   │
                        └──────────┘             └───────────┘
```

**核心模块：**

```ts
// 1. 流水线配置
interface Pipeline {
  name: string
  stages: Stage[]
  triggers: Trigger[]   // webhook / 定时 / 手动
  env: Record<string, string>
}

interface Stage {
  name: string
  steps: Step[]
  when?: Condition      // 条件执行
  retry?: number
  timeout?: number
}

// 2. 构建节点 — K8s Pod 动态调度
// - 构建环境隔离（Docker 容器）
// - 资源限制（CPU/内存）
// - 构建缓存（node_modules）

// 3. 部署策略
type DeployStrategy =
  | 'rolling'       // 滚动更新（默认）
  | 'blue-green'    // 蓝绿部署
  | 'canary'        // 金丝雀发布
  | 'gray'          // 灰度发布（按比例）
```

| 模块 | 能力 | 技术选型 |
|------|------|---------|
| 流水线 | 可视化编排/模板复用 | YAML + DAG |
| 构建 | 并行/缓存/隔离 | Docker + K8s |
| 测试 | 单元/集成/E2E 门禁 | Jest + Cypress |
| 部署 | 多策略/灰度/回滚 | K8s + ArgoCD |
| 监控 | 时长/成功率/告警 | Prometheus |
| 安全 | 凭证/扫描/审计 | Vault + SonarQube |

**知识点：** `CI/CD 平台` `流水线设计` `构建节点` `部署策略` `灰度发布`

:::

### Q3: Docker 在前端部署中的应用？Dockerfile 编写最佳实践？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Docker 在前端部署中的价值：**

| 优势 | 说明 |
|------|------|
| 环境一致性 | 开发/测试/生产环境完全一致 |
| 快速部署 | 镜像构建一次，到处运行 |
| 隔离性 | 不同应用互不干扰 |
| 回滚方便 | 切回旧镜像即可回滚 |
| 资源利用 | 比虚拟机更轻量 |

**典型前端 Docker 部署流程：**
```text
本地开发 → 构建镜像 → 推送 Registry → K8s 拉取 → 滚动更新
```

**Dockerfile 最佳实践：**

**1. 多阶段构建（减小镜像体积）**
```dockerfile
# 阶段 1: 构建阶段
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 阶段 2: 生产阶段（只用 Nginx 托管静态文件）
FROM nginx:alpine
# 复制自定义 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**2. 合理使用 .dockerignore**
```dockerignore
node_modules
npm-debug.log
.git
.gitignore
.env
Dockerfile
.dockerignore
dist
coverage
*.md
```

**3. 优化层缓存**
```dockerfile
# 差：每次代码变化都会重新安装依赖
COPY . .
RUN npm install

# 好：只有 package.json 变化时才重新安装
COPY package*.json ./
RUN npm ci
COPY . .
```

**4. 使用非 root 用户**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
CMD ["npm", "start"]
```

**5. 指定具体版本**
```dockerfile
# 差：版本号会变
FROM node:latest

# 好：固定版本
FROM node:18.16.0-alpine
```

**6. 合并 RUN 指令（减少层数）**
```dockerfile
# 差：创建多个层
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git

# 好：合并为一条
RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*
```

**Nginx 配置示例：**
```nginx
server {
  listen 80;
  server_name localhost;
  root /usr/share/nginx/html;
  index index.html;

  # Gzip 压缩
  gzip on;
  gzip_types text/plain application/json application/javascript text/css;
  gzip_min_length 1000;

  # 缓存策略
  location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }

  # SPA 路由支持
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

**镜像体积优化对比：**

| 方案 | 镜像大小 | 说明 |
|------|---------|------|
| node:latest + 全部源码 | 1.2GB+ | 包含 devDependencies |
| node:alpine + 多阶段 | 50MB 以下 | 只包含静态文件 |
| nginx:alpine 单阶段 | 25MB 左右 | 最小方案 |

**知识点：** `Docker` `多阶段构建` `镜像优化` `Nginx` `容器化部署`

:::

### Q4: Nginx 作为前端部署服务器的常用配置？（gzip、缓存策略、反向代理、负载均衡）

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Nginx 是前端部署的核心组件，掌握关键配置至关重要。**

**1. Gzip 压缩配置**
```nginx
http {
  # 开启 gzip
  gzip on;
  
  # 压缩级别（1-9，越大压缩比越高但 CPU 消耗越大）
  gzip_comp_level 6;
  
  # 最小压缩大小
  gzip_min_length 1000;
  
  # 压缩类型
  gzip_types 
    text/plain
    text/css
    text/xml
    application/json
    application/javascript
    application/xml
    application/xhtml+xml
    image/svg+xml;
  
  # 根据浏览器 Accept-Encoding 决定是否压缩
  gzip_vary on;
  
  # 禁用 IE6 gzip
  gzip_disable "msie6";
}
```

**2. 缓存策略配置**
```nginx
server {
  listen 80;
  server_name example.com;
  root /var/www/html;

  # 静态资源 - 强缓存（1 年）
  location ~* \.(jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
  }

  # JS/CSS 文件 - 强缓存（带 hash 的文件名）
  location ~* \.(js|css)$ {
    expires 30d;
    add_header Cache-Control "public, max-age=2592000";
  }

  # HTML 文件 - 不缓存（确保用户获取最新内容）
  location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
  }

  # API 请求 - 代理到后端
  location /api/ {
    proxy_pass http://backend-server:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

**3. 反向代理配置**
```nginx
# 单服务器反向代理
upstream backend {
  server 192.168.1.100:3000;
}

server {
  listen 80;
  server_name api.example.com;

  location / {
    proxy_pass http://backend;
    
    # 传递真实 IP
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # 超时设置
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # 缓冲设置
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 4k;
  }
}
```

**4. 负载均衡配置**
```nginx
# 轮询（默认）
upstream backend {
  server 192.168.1.100:3000;
  server 192.168.1.101:3000;
  server 192.168.1.102:3000;
}

# 权重轮询
upstream backend {
  server 192.168.1.100:3000 weight=3;  # 3/6 请求
  server 192.168.1.101:3000 weight=2;  # 2/6 请求
  server 192.168.1.102:3000 weight=1;  # 1/6 请求
}

# IP Hash（同一 IP 固定到同一服务器）
upstream backend {
  ip_hash;
  server 192.168.1.100:3000;
  server 192.168.1.101:3000;
}

# 最少连接数
upstream backend {
  least_conn;
  server 192.168.1.100:3000;
  server 192.168.1.101:3000;
}

server {
  listen 80;
  server_name example.com;

  location / {
    proxy_pass http://backend;
    
    # 故障转移设置
    proxy_next_upstream error timeout invalid_header http_500 http_502 http_503;
    proxy_next_upstream_tries 3;
  }
}
```

**5. HTTPS 配置**
```nginx
server {
  listen 443 ssl http2;
  server_name example.com;

  # SSL 证书
  ssl_certificate /etc/nginx/ssl/example.com.crt;
  ssl_certificate_key /etc/nginx/ssl/example.com.key;

  # SSL 优化
  ssl_session_cache shared:SSL:10m;
  ssl_session_timeout 10m;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
  ssl_prefer_server_ciphers on;

  # HSTS（强制 HTTPS）
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

  location / {
    root /var/www/html;
    index index.html;
    try_files $uri $uri/ /index.html;
  }
}

# HTTP 自动跳转 HTTPS
server {
  listen 80;
  server_name example.com;
  return 301 https://$server_name$request_uri;
}
```

**6. SPA 路由支持（Vue/React Router）**
```nginx
server {
  listen 80;
  server_name example.com;
  root /var/www/html;
  index index.html;

  # 所有路径都返回 index.html，交给前端路由处理
  location / {
    try_files $uri $uri/ /index.html;
  }

  # 静态资源
  location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

**7. 安全配置**
```nginx
server {
  # 隐藏 Nginx 版本
  server_tokens off;

  # 防止点击劫持
  add_header X-Frame-Options "SAMEORIGIN" always;

  # 防止 MIME 类型嗅探
  add_header X-Content-Type-Options "nosniff" always;

  # XSS 防护
  add_header X-XSS-Protection "1; mode=block" always;

  # CSP 内容安全策略
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.example.com; style-src 'self' 'unsafe-inline';" always;
}
```

**性能优化检查清单：**

| 配置项 | 推荐值 | 效果 |
|--------|--------|------|
| gzip 压缩 | 开启 | 减少 70% 传输量 |
| 静态资源缓存 | 1 年 | 减少重复请求 |
| worker_processes | auto | 充分利用 CPU |
| worker_connections | 1024+ | 提高并发能力 |
| keepalive_timeout | 65s | 复用连接 |
| sendfile | on | 零拷贝传输 |

**知识点：** `Nginx` `gzip` `缓存策略` `反向代理` `负载均衡` `HTTPS` `安全配置`

:::

### Q5: 前端监控体系搭建？（Sentry 错误监控、Web Vitals 性能监控、用户行为追踪）

> **💀 困难 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**完整的前端监控体系包含三个维度：**

```text
┌─────────────────────────────────────────────────┐
│              前端监控体系                        │
├─────────────┬─────────────┬─────────────────────┤
│  错误监控   │  性能监控   │  用户行为追踪       │
│  (Sentry)   │ (Web Vitals)│  (埋点/日志)        │
└─────────────┴─────────────┴─────────────────────┘
```

**一、错误监控（Sentry）**

**1. 安装与配置**
```bash
npm install @sentry/react @sentry/tracing
```

```js
// Sentry 初始化
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: 'https://your-dsn@sentry.io/123456',
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ],
  // 性能追踪采样率
  tracesSampleRate: 0.1,  // 10% 的请求
  // 会话重播采样率
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // 环境
  environment: process.env.NODE_ENV,
  // 发布版本
  release: 'v1.2.3',
  // 忽略特定错误
  ignoreErrors: [
    'NetworkError',
    'ResizeObserver loop limit exceeded'
  ],
  // 数据处理钩子
  beforeSend(event, hint) {
    // 过滤敏感信息
    if (event.request?.url?.includes('password')) {
      return null
    }
    return event
  }
})
```

**2. React 错误边界**
```jsx
import { ErrorBoundary } from '@sentry/react'

function App() {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div>
          <h2>出错了</h2>
          <button onClick={resetError}>重试</button>
        </div>
      )}
    >
      <Router>
        <Routes>...</Routes>
      </Router>
    </ErrorBoundary>
  )
}
```

**3. 手动捕获**
```js
// 捕获异常
try {
  riskyOperation()
} catch (error) {
  Sentry.captureException(error, {
    tags: { section: 'checkout' },
    extra: { userId: 123, action: 'payment' }
  })
}

// 自定义消息
Sentry.captureMessage('用户完成购买', {
  level: 'info',
  tags: { eventType: 'purchase' }
})

// 设置用户上下文
Sentry.setUser({
  id: '123',
  username: 'zhangsan',
  email: 'zhangsan@example.com'
})

// 添加 Breadcrumbs（面包屑）
Sentry.addBreadcrumb({
  message: '用户点击购买按钮',
  category: 'ui.click',
  data: { productId: 456 }
})
```

**二、性能监控（Web Vitals）**

**1. 核心指标**
```js
import { getCLS, getFID, getFCP, getLCP, getTTFB, getINP } from 'web-vitals'

// Core Web Vitals
getCLS(console.log)  // Cumulative Layout Shift（累积布局偏移）
getINP(console.log)  // Interaction to Next Paint（交互到下次绘制）
getLCP(console.log)  // Largest Contentful Paint（最大内容绘制）

// 传统指标
getFCP(console.log)  // First Contentful Paint
getFID(console.log)  // First Input Delay（已废弃，用 INP 替代）
getTTFB(console.log) // Time to First Byte
```

**2. 指标阈值**
```js
const thresholds = {
  LCP: { good: 2500, needImprovement: 4000 },  // ms
  FID: { good: 100, needImprovement: 300 },   // ms
  CLS: { good: 0.1, needImprovement: 0.25 },  // 分数
  INP: { good: 200, needImprovement: 500 },   // ms
  FCP: { good: 1800, needImprovement: 3000 }, // ms
  TTFB: { good: 800, needImprovement: 1800 }  // ms
}

// 评分逻辑
function rateMetric(value, thresholds) {
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.needImprovement) return 'needs-improvement'
  return 'poor'
}
```

**3. 上报到分析平台**
```js
function sendToAnalytics(metric) {
  const body = {
    metric: metric.name,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    rating: rateMetric(metric.value, thresholds[metric.name]),
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now()
  }

  // 使用 sendBeacon（页面关闭也能发送）
  navigator.sendBeacon('/api/web-vitals', JSON.stringify(body))
  
  // 或者发送到监控平台
  // fetch('https://monitor.example.com/vitals', {
  //   method: 'POST',
  //   body: JSON.stringify(body)
  // })
}

getLCP(sendToAnalytics)
getCLS(sendToAnalytics)
getINP(sendToAnalytics)
```

**4. Performance API 自定义监控**
```js
// 监听资源加载
const observer = new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`)
    
    // 报告慢资源
    if (entry.duration > 3000) {
      reportSlowResource({
        url: entry.name,
        duration: entry.duration,
        type: entry.initiatorType
      })
    }
  }
})
observer.observe({ entryTypes: ['resource', 'navigation', 'paint'] })

// 获取关键指标
const timing = performance.getEntriesByType('navigation')[0]
console.log({
  DNS 查询：timing.domainLookupEnd - timing.domainLookupStart,
  TCP 连接：timing.connectEnd - timing.connectStart,
  首字节：timing.responseStart - timing.requestStart,
  DOM 解析：timing.domComplete - timing.domInteractive,
  完全加载：timing.loadEventEnd - timing.navigationStart
})
```

**三、用户行为追踪**

**1. 埋点方案设计**
```js
// 埋点工具类
class AnalyticsTracker {
  constructor() {
    this.queue = []
    this.userId = null
  }

  // 设置用户 ID
  setUserId(id) {
    this.userId = id
  }

  // 记录事件
  track(event, properties = {}) {
    const eventObj = {
      event,
      properties: {
        ...properties,
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        screen: `${window.screen.width}x${window.screen.height}`
      },
      userId: this.userId,
      timestamp: Date.now(),
      sessionId: this.getSessionId()
    }
    
    this.queue.push(eventObj)
    this.flush()
  }

  // 批量上报
  flush() {
    if (this.queue.length === 0) return
    
    const events = [...this.queue]
    this.queue = []
    
    navigator.sendBeacon('/api/analytics', JSON.stringify(events))
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = 'sess_' + Math.random().toString(36).substr(2)
      sessionStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }
}

export const tracker = new AnalyticsTracker()
```

**2. 自动追踪（无埋点）**
```js
// 页面浏览追踪
tracker.track('page_view', {
  page: window.location.pathname,
  title: document.title
})

// 点击追踪
document.addEventListener('click', (e) => {
  const target = e.target.closest('[data-track]')
  if (target) {
    tracker.track('click', {
      element: target.dataset.track,
      text: target.textContent
    })
  }
})

// 表单提交追踪
document.addEventListener('submit', (e) => {
  const form = e.target
  tracker.track('form_submit', {
    formId: form.id,
    action: form.action
  })
})

// 页面停留时间
let pageEnterTime = Date.now()
window.addEventListener('beforeunload', () => {
  const stayTime = Date.now() - pageEnterTime
  tracker.track('page_leave', {
    stayTime: Math.round(stayTime / 1000),
    page: window.location.pathname
  })
})
```

**3. 关键业务事件**
```js
// 用户注册
function onRegister(userId, method) {
  tracker.track('user_register', {
    userId,
    method: method // 'email' | 'phone' | 'wechat'
  })
}

// 加入购物车
function onAddToCart(product) {
  tracker.track('add_to_cart', {
    productId: product.id,
    productName: product.name,
    price: product.price,
    quantity: 1
  })
}

// 购买完成
function onPurchase(order) {
  tracker.track('purchase', {
    orderId: order.id,
    amount: order.total,
    items: order.items.map(i => i.productId)
  })
}
```

**4. 错误率监控**
```js
// 全局错误监听
window.onerror = function(message, source, lineno, colno, error) {
  tracker.track('js_error', {
    message,
    source,
    lineno,
    colno,
    stack: error?.stack
  })
  return false // 不阻止默认行为
}

// Promise 错误
window.addEventListener('unhandledrejection', (event) => {
  tracker.track('unhandled_rejection', {
    reason: event.reason?.message || event.reason
  })
})

// 资源加载失败
window.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT') {
    tracker.track('resource_error', {
      url: e.target.src || e.target.href,
      type: e.target.tagName
    })
  }
}, true)
```

**监控体系集成：**

```js
// 统一监控初始化
import { init as initSentry } from './sentry'
import { init as initWebVitals } from './web-vitals'
import { tracker } from './analytics'

export function initMonitoring() {
  // 1. 错误监控
  initSentry()
  
  // 2. 性能监控
  initWebVitals()
  
  // 3. 用户追踪
  if (window.__USER_ID__) {
    tracker.setUserId(window.__USER_ID__)
  }
  
  // 4. 页面浏览
  tracker.track('page_view', {
    page: window.location.pathname,
    title: document.title
  })
}
```

**知识点：** `Sentry` `Web Vitals` `LCP` `CLS` `INP` `错误监控` `性能监控` `埋点` `用户行为` `sendBeacon`

:::