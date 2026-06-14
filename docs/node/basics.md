---
title: Node.js 基础与架构
description: Node.js基础面试题，覆盖V8/libuv架构、单线程模型、Buffer/Stream、全局对象、Node与浏览器区别等核心考点
---

# Node.js 基础与架构

---

> **⭐ 简单 · Node.js 基础**

### Q1: Node.js 和浏览器的 JavaScript 有什么区别？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 对比项 | 浏览器 | Node.js |
|--------|--------|---------|
| 运行环境 | 浏览器沙箱 | 操作系统直接访问 |
| 全局对象 | `window` | `global` / `globalThis` |
| 模块系统 | ESM (import/export) | CJS (require/module.exports) + ESM |
| DOM | ✅ | ❌ |
| 文件系统 | ❌ (受限) | ✅ `fs` 模块 |
| 网络 | `fetch`/`XMLHttpRequest` | `http`/`https`/`net` |
| 进程 | ❌ | ✅ `process`/`child_process` |
| Buffer | ❌ | ✅ `Buffer` |
| 定时器精度 | 受标签页影响 | 更精确 |
| 目标 | 渲染 UI | 处理 I/O 和网络请求 |

**Node.js 架构：**
```
┌───────────────────────────────────┐
│           Node.js Bindings        │  ← C++ 桥接层
├───────────┬───────────────────────┤
│   V8 引擎  │     libuv 事件循环    │  ← 核心引擎
├───────────┴───────────────────────┤
│         操作系统 (Linux/Windows)    │  ← 底层 OS
└───────────────────────────────────┘
```

- **V8**：JavaScript 引擎，解析执行 JS 代码
- **libuv**：C 库，提供事件循环、异步 I/O、线程池
- **Bindings**：C++ 桥接层，将底层能力暴露给 JS

**知识点：** `V8` `libuv` `CJS/ESM` `全局对象`

:::

---

> **🔥 中等 · 单线程模型**

### Q2: Node.js 是单线程的吗？如何处理并发？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Node.js 的"单线程"含义：**
- JavaScript 代码在**主线程**上单线程执行
- 但底层 libuv 有**线程池**处理 I/O
- 某些操作（DNS 查询、文件 I/O、zip 等）由 libuv 线程池处理

```
主线程（单线程）
  │
  ├── 同步代码执行
  ├── 事件循环
  │
  └── libuv 线程池（默认 4 线程）
       ├── 文件 I/O
       ├── DNS 查询
       ├── 压缩/加密
       └── ...
```

**并发处理方式：**

| 方式 | 说明 | 适用场景 |
|------|------|----------|
| 事件循环 | 非阻塞 I/O | 网络请求、数据库查询 |
| 线程池 | libuv 默认 4 线程 | 文件 I/O、DNS、加密 |
| child_process | 创建子进程 | CPU 密集型 |
| worker_threads | 创建工作线程 | CPU 密集型（共享内存） |
| cluster | 多进程 | 充分利用多核 CPU |

```js
// 修改线程池大小
process.env.UV_THREADPOOL_SIZE = 8

// CPU 密集型用 worker_threads
const { Worker } = require('worker_threads')
const worker = new Worker('./heavy-task.js', { workerData: { n: 42 } })
worker.on('message', result => console.log(result))
```

**为什么单线程能处理高并发：**
- 非阻塞 I/O：I/O 操作交给操作系统，不阻塞主线程
- 事件驱动：I/O 完成后通过回调/事件通知
- 没有线程切换开销

**知识点：** `单线程` `libuv线程池` `事件循环` `非阻塞I/O`

:::

---

> **🔥 中等 · Buffer**

### Q3: Node.js 的 Buffer 是什么？有哪些常用操作？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

Buffer 是 Node.js 中处理二进制数据的全局对象，无需 require。

```js
// 创建 Buffer
const buf1 = Buffer.alloc(10)              // 10 字节，初始化为 0
const buf2 = Buffer.allocUnsafe(10)        // 10 字节，不初始化（更快但可能含旧数据）
const buf3 = Buffer.from('hello')          // 从字符串创建
const buf4 = Buffer.from([1, 2, 3])        // 从数组创建
const buf5 = Buffer.from('hello', 'utf8')  // 指定编码

// 读写
buf1.write('hi', 0, 'utf8')               // 从偏移 0 写入 'hi'
const byte = buf1[0]                       // 读取第 0 个字节

// 转换
buf3.toString()                            // 'hello'
buf3.toString('hex')                       // '68656c6c6f'
buf3.toJSON()                              // { type: 'Buffer', data: [104, 101, 108, 108, 111] }

// 拼接
const combined = Buffer.concat([buf3, buf4])

// 比较
buf3.equals(Buffer.from('hello'))          // true
buf3.compare(Buffer.from('world'))         // -1 (hello < world)

// 切片
const slice = buf3.subarray(0, 3)          // 'hel' (视图，共享内存)
const copy = Buffer.from(buf3.subarray(0, 3))  // 独立副本

// 编码转换
const base64 = buf3.toString('base64')     // 'aGVsbG8='
Buffer.from(base64, 'base64')             // 还原
```

**Buffer vs TypedArray：**
| 对比项 | Buffer | TypedArray |
|--------|--------|------------|
| 来源 | Node.js 全局 | ES6 标准 |
| 内存 | 堆外（V8 堆外） | V8 堆内 |
| 大小限制 | `buffer.constants.MAX_LENGTH` | 2^32 - 1 |
| 编码支持 | ✅ utf8/hex/base64 | ❌ |

**知识点：** `Buffer` `二进制数据` `编码` `allocUnsafe`

:::

---

> **🔥 中等 · Stream**

### Q4: Node.js 的 Stream 有哪些类型？如何使用管道处理大文件？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**四种 Stream 类型：**

| 类型 | 描述 | 示例 |
|------|------|------|
| Readable | 可读 | `fs.createReadStream` |
| Writable | 可写 | `fs.createWriteStream` |
| Duplex | 可读可写（独立缓冲区） | `net.Socket` |
| Transform | 可读可写（变换数据） | `zlib.createGzip()` |

**两种读取模式：**
- **Paused 模式**：需手动调用 `read()` 读取
- **Flowing 模式**：数据自动推送，通过事件消费

```js
// 管道处理大文件：读取 → Gzip 压缩 → 写入
const fs = require('fs')
const zlib = require('zlib')
const { pipeline } = require('stream')

// 方法 1：pipe 链式
fs.createReadStream('input.txt')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('output.txt.gz'))

// 方法 2：pipeline（推荐，自动处理错误和清理）
pipeline(
  fs.createReadStream('input.txt'),
  zlib.createGzip(),
  fs.createWriteStream('output.txt.gz'),
  (err) => {
    if (err) console.error('Pipeline failed:', err)
    else console.log('Pipeline succeeded')
  }
)
```

**自定义 Transform Stream：**
```js
const { Transform } = require('stream')

const upperCase = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase())
  }
})

pipeline(
  fs.createReadStream('input.txt'),
  upperCase,
  fs.createWriteStream('output.txt'),
  (err) => { /* ... */ }
)
```

**为什么用 Stream：**
- 内存友好：不需要将整个文件加载到内存
- 时间友好：边读边处理，首字节延迟低
- 1GB 文件用 Stream 只需几 MB 内存

**知识点：** `Stream` `pipe` `pipeline` `Transform` `背压`

:::

---

> **⭐ 简单 · 全局对象**

### Q5: Node.js 有哪些常用的全局对象和全局变量？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 全局对象 | 用途 |
|----------|------|
| `global` / `globalThis` | 全局命名空间 |
| `process` | 当前进程信息（env/argv/exit） |
| `Buffer` | 二进制数据处理 |
| `console` | 日志输出 |
| `setTimeout/setInterval` | 定时器 |
| `__dirname` | 当前文件所在目录（CJS） |
| `__filename` | 当前文件完整路径（CJS） |
| `exports/require/module` | CJS 模块系统 |
| `URL/URLSearchParams` | URL 解析 |
| `TextEncoder/TextDecoder` | 编码转换 |
| `queueMicrotask` | 微任务队列 |
| `structuredClone` | 深拷贝 |

```js
// process 常用 API
process.env.NODE_ENV          // 环境变量
process.argv                   // 命令行参数
process.cwd()                  // 当前工作目录
process.exit(0)                // 退出进程
process.nextTick(cb)           // 下一个微任务
process.on('uncaughtException', handler)  // 全局异常捕获
process.memoryUsage()          // 内存使用
process.uptime()               // 运行时间
process.pid                    // 进程 ID
```

**注意：** `__dirname` 和 `__filename` 在 ESM 中不可用，需用：
```js
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```

**知识点：** `process` `global` `__dirname` `全局对象`

:::

---

> **🔥 中等 · 模块加载机制**

### Q6: Node.js 的 `require` 加载模块的流程是什么？模块缓存机制是怎样的？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**require 加载流程：**
```
require('module-name')
  │
  ├── 1. 解析路径
  │     ├── 核心模块 → 直接返回 (fs, http, path...)
  │     ├── 文件模块 → 解析为绝对路径
  │     └── 第三方模块 → node_modules 逐级查找
  │
  ├── 2. 检查缓存
  │     └── require.cache / Module._cache
  │
  ├── 3. 编译执行
  │     ├── .js → 读取文件，包装函数，执行
  │     ├── .json → JSON.parse
  │     └── .node → dlopen 加载 C++ 插件
  │
  └── 4. 返回 module.exports
```

**模块包装函数：**
```js
// Node.js 内部将每个模块包裹在这个函数中
(function(exports, require, module, __filename, __dirname) {
  // 你的模块代码
})
```

**模块缓存：**
```js
// 第一次 require 时执行并缓存
const a1 = require('./a')  // 执行 a.js
const a2 = require('./a')  // 直接返回缓存，不再执行

// 查看缓存
console.log(require.cache)

// 清除缓存（不推荐，但有时需要）
delete require.cache[require.resolve('./a')]
```

**node_modules 查找规则：**
```
当前目录/node_modules/module-name
父目录/node_modules/module-name
祖父目录/node_modules/module-name
...
/node_modules/module-name  (根目录)
```

**package.json 的 main/exports 字段：**
```json
{
  "main": "./dist/index.js",       // CJS 入口
  "module": "./dist/index.mjs",    // ESM 入口（打包工具用）
  "exports": {
    ".": {
      "import": "./dist/index.mjs",   // ESM
      "require": "./dist/index.js"    // CJS
    }
  }
}
```

**知识点：** `require` `模块缓存` `node_modules查找` `exports`

:::

---

> **💀 困难 · 错误处理**

### Q7: Node.js 中如何进行全局错误处理？未捕获的异常会导致什么问题？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**未捕获异常的后果：** Node.js 进程会崩溃退出。

**全局错误处理层级：**

```js
// 1. 同步异常
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  // ⚠️ 不要继续运行！记录日志后退出
  process.exit(1)
})

// 2. 未处理的 Promise 拒绝
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason)
})

// 3. 未处理的信号
process.on('SIGTERM', () => {
  console.log('SIGTERM received, graceful shutdown...')
  server.close(() => process.exit(0))
})

process.on('SIGINT', () => {
  console.log('SIGINT received (Ctrl+C)')
  server.close(() => process.exit(0))
})

// 4. Express/Koa 中间件错误处理
// Express
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal Server Error' })
})

// 5. async/await 错误处理包装器
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

app.get('/api', asyncHandler(async (req, res) => {
  const data = await fetchData()
  res.json(data)
}))
```

**优雅关闭最佳实践：**
```js
const server = app.listen(3000)

function gracefulShutdown(signal) {
  console.log(`${signal} received, shutting down...`)
  
  // 1. 停止接收新连接
  server.close(() => {
    console.log('HTTP server closed')
    
    // 2. 关闭数据库连接
    db.close().then(() => {
      console.log('Database connection closed')
      process.exit(0)
    })
  })
  
  // 3. 超时强制退出
  setTimeout(() => {
    console.error('Forced shutdown after timeout')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
```

**知识点：** `uncaughtException` `unhandledRejection` `优雅关闭` `SIGTERM`

:::

---

> **🔥 中等 · Node.js 版本管理**

### Q8: 如何管理多个 Node.js 版本？nvm/n/fnm 有什么区别？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 工具 | 语言 | 速度 | 特点 |
|------|------|------|------|
| **nvm** | Bash | 较慢 | 最流行，支持 .nvmrc |
| **n** | Bash | 中等 | 简洁，全局安装 |
| **fnm** | Rust | ⚡ 最快 | 跨平台，兼容 .node-version/.nvmrc |
| **Volta** | Rust | 快 | 自动切换，项目管理 |
| **asdf** | Bash | 较慢 | 多语言版本管理 |

**fnm 使用（推荐）：**
```bash
# 安装
curl -fsSL https://fnm.vercel.app/install | bash

# 安装/切换版本
fnm install 20        # 安装 Node 20
fnm install --lts     # 安装最新 LTS
fnm use 18            # 切换到 Node 18
fnm default 20        # 设置默认版本

# 项目级版本管理
echo "20" > .node-version    # 或 .nvmrc
cd project && fnm use         # 自动切换
```

**Volta 使用（项目管理推荐）：**
```bash
# 安装
curl https://get.volta.sh | bash

# 项目固定版本
volta pin node@20
# 自动在 package.json 中记录：
# "volta": { "node": "20.11.0" }

# 固定包管理器版本
volta pin pnpm@8
```

**.nvmrc 文件：**
```
20.11.0
```
```bash
nvm use   # 自动读取 .nvmrc
```

**知识点：** `nvm` `fnm` `Volta` `版本管理` `.nvmrc`

:::

---

> **🔥 中等 · npm/npx/pnpm**

### Q9: npm、yarn、pnpm 有什么区别？npx 的作用是什么？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 对比项 | npm | yarn | pnpm |
|--------|-----|------|------|
| 安装速度 | 较慢 | 快 | ⚡ 最快 |
| 锁文件 | package-lock.json | yarn.lock | pnpm-lock.yaml |
| 幽灵依赖 | ✅ 有 | ✅ 有 | ❌ 无（严格） |
| 磁盘空间 | 每项目独立 | 每项目独立 | ✅ 全局硬链接 |
| Monorepo | workspaces | workspaces | ✅ workspace 原生 |
| 隔离性 | 扁平 node_modules | 扁平 node_modules | ✅ 严格隔离 |

**pnpm 的优势：**
```
# 传统 npm/yarn：扁平 node_modules
node_modules/
  ├── react/         ← 直接访问（幽灵依赖）
  ├── lodash/        ← 没声明也能访问
  └── your-pkg/
      └── node_modules/
          └── (部分包)

# pnpm：严格的依赖树 + 软链接
node_modules/
  ├── .pnpm/         ← 真实存储（硬链接到全局 store）
  │   ├── react@18/
  │   └── lodash@4/
  └── react -> .pnpm/react@18/node_modules/react  （软链接）
```

**npx 的作用：**
```bash
# 1. 执行未安装的包
npx create-react-app my-app   # 临时下载并执行

# 2. 执行项目本地安装的包
npx eslint .                   # 使用 node_modules/.bin/eslint

# 3. 指定版本
npx eslint@8.50.0 .

# npm 7+ 的等价命令
npm exec create-react-app my-app
npm run eslint .
```

**pnpm 常用命令：**
```bash
pnpm add react                 # 添加依赖
pnpm add -D typescript         # 添加开发依赖
pnpm install                   # 安装所有依赖
pnpm run build                 # 运行脚本
pnpm --filter @scope/pkg build # Monorepo 中运行指定包的脚本
```

**知识点：** `npm` `yarn` `pnpm` `npx` `幽灵依赖` `硬链接`

:::

---

> **💀 困难 · Node.js 性能调优**

### Q10: Node.js 应用的性能调优有哪些手段？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. 运行时优化**
```js
// 设置最大老生代内存
node --max-old-space-size=4096 app.js

// 启用 V8 压缩指针（Node 20+）
node --max-old-space-size=4096 app.js

// 使用 worker_threads 处理 CPU 密集任务
const { Worker } = require('worker_threads')
```

**2. I/O 优化**
```js
// 流式处理大文件
fs.createReadStream('large.json')
  .pipe(parseStream())
  .pipe(transform())
  .pipe(fs.createWriteStream('output.json'))

// 连接池（数据库）
const pool = mysql.createPool({
  connectionLimit: 50,
  acquireTimeout: 30000
})
```

**3. 缓存策略**
```js
// 内存缓存
const cache = new Map()
app.get('/api/data', async (req, res) => {
  const key = req.url
  if (cache.has(key)) return res.json(cache.get(key))
  const data = await db.query()
  cache.set(key, data)
  res.json(data)
})

// Redis 缓存
const cached = await redis.get(key)
if (cached) return JSON.parse(cached)
```

**4. 监控与分析**
```bash
# CPU profiling
node --prof app.js
node --prof-process isolate-*.log

# 内存快照
node --heapsnapshot-signal=SIGUSR2 app.js
# kill -USR2 <pid>  生成快照

# 使用 clinic.js
npx clinic doctor -- node app.js
npx clinic flame -- node app.js
npx clinic heapprofiler -- node app.js
```

**5. 集群模式**
```js
const cluster = require('cluster')
const os = require('os')

if (cluster.isPrimary) {
  const cpus = os.cpus().length
  for (let i = 0; i < cpus; i++) {
    cluster.fork()
  }
  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died, restarting...`)
    cluster.fork()
  })
} else {
  require('./app')  // 启动 HTTP 服务器
}
```

**知识点：** `性能调优` `Worker` `缓存` `集群` `profiling`

:::
---

### Q11: Node.js 服务端渲染 SSR 的原理？

> **🔥 中等 · Node.js**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**SSR 原理：**

服务端执行 JS 代码，生成 HTML 字符串返回给浏览器，首屏即可见内容。

**基本流程：**

```
用户请求 → Node.js 服务器 → 执行 React/Vue 代码 
        → 生成 HTML 字符串 → 返回浏览器
        → 浏览器解析 HTML → 显示内容
        → 下载 JS Bundle → 接管（Hydration）
```

**React SSR 示例：**

```jsx
// server.js
import express from 'express'
import { renderToString } from 'react-dom/server'
import App from './App'

const app = express()

app.get('*', (req, res) => {
  // 1. 服务端渲染组件为 HTML
  const html = renderToString(<App />)
  
  // 2. 返回完整 HTML
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>SSR App</title>
      </head>
      <body>
        <div id="root">${html}</div>
        <script src="/bundle.js"></script>
      </body>
    </html>
  `)
})
```

**Vue SSR 示例：**

```js
// server.js
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'

app.get('*', async (req, res) => {
  const app = createSSRApp(App)
  const html = await renderToString(app)
  
  res.send(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id="app">${html}</div>
        <script type="module" src="/main.js"></script>
      </body>
    </html>
  `)
})
```

**同构（Hydration）：**

```jsx
// 客户端入口
import { hydrateRoot } from 'react-dom/client'
import App from './App'

hydrateRoot(document.getElementById('root'), <App />)
// hydrateRoot 会复用服务端 HTML，而不是重新渲染

// Vue 客户端
import { createSSRApp, hydrateApp } from 'vue'

const app = createSSRApp(App)
hydrateApp(app, document.getElementById('app'))
```

**数据预取：**

```jsx
// React - 服务端预取数据
app.get('*', async (req, res) => {
  // 1. 服务端请求数据
  const userData = await fetchUser(req.params.id)
  
  // 2. 传递数据给组件
  const html = renderToString(
    <App initialData={{ user: userData }} />
  )
  
  res.send(`
    <script>
      window.__INITIAL_DATA__ = ${JSON.stringify({ user: userData })}
    </script>
    <div id="root">${html}</div>
  `)
})

// 客户端使用
function App({ initialData }) {
  const [user, setUser] = useState(
    window.__INITIAL_DATA__?.user || initialData?.user
  )
}
```

**SSR 优势：**

| 指标 | SPA | SSR |
|------|-----|-----|
| 首屏时间 | 慢（需下载 JS） | 快（HTML 即内容） |
| SEO | 差 | 好 |
| 服务器负载 | 低 | 高 |
| 开发复杂度 | 低 | 高 |

**SSR 框架：**

```bash
# React
npm install next.js      # Next.js

# Vue
npm install nuxt         # Nuxt.js

# 其他
npm install @sveltejs/kit   # SvelteKit
npm install remix         # Remix
npm install gatsby        # Gatsby（SSG）
```

**知识点：** `SSR` `服务端渲染` `renderToString` `同构` `Hydration` `SEO`

:::

### Q12: Node.js 如何实现 SSR？render 和 renderToString 的区别？

> **💀 困难 · Node.js**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**SSR 实现流程：**

```js
// server.js - Express + React SSR
import express from 'express'
import { renderToString } from 'react-dom/server'
import App from './App'

const app = express()

app.get('*', (req, res) => {
  // 1. 匹配路由
  const context = {}
  
  // 2. 数据预取
  const data = await fetchData(req.url)
  
  // 3. renderToString 生成静态 HTML
  const html = renderToString(
    <StaticRouter location={req.url} context={context}>
      <App initialData={data} />
    </StaticRouter>
  )
  
  // 4. 注入数据到 HTML
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>SSR App</title></head>
      <body>
        <div id="root">${html}</div>
        <script>window.__INITIAL_DATA__ = ${JSON.stringify(data)}</script>
        <script src="/bundle.js"></script>
      </body>
    </html>
  `)
})
```

**render vs renderToString：**

| API | 作用 | 输出 | 事件绑定 | 生命周期 |
|-----|------|------|---------|---------|
| `render` | 客户端渲染 | 挂载到DOM | ✅ 有 | 完整 |
| `renderToString` | 服务端渲染 | HTML字符串 | ❌ 无 | 只执行到render |
| `renderToStaticMarkup` | 静态页面 | HTML字符串 | ❌ 无 | 无data-reactid |

```js
// renderToString 特点
// 1. 生成纯静态 HTML 字符串
// 2. 不绑定事件、不执行 componentDidMount
// 3. 添加 data-reactroot 标记用于 hydration
// 4. 只执行构造函数、render、UNSAFE_componentWillMount（已废弃）

const html = renderToString(<App />)
// -> '<div data-reactroot=""><h1>Hello</h1></div>'
```

**Hydration（注水）：**

```js
// 客户端：hydrate 复用服务端 HTML，绑定事件
import { hydrateRoot } from 'react-dom/client'

// React 18
hydrateRoot(document.getElementById('root'), <App />)

// 而不是 createRoot().render() — 那会丢弃SSR的HTML重新渲染
```

**完整 SSR 架构：**

```text
客户端请求 → Express路由匹配
  → 数据预取（fetch API）
  → renderToString → 静态HTML + 初始数据
  → 返回完整HTML响应
    → 浏览器渲染静态页面（FCP极快）
    → 加载JS bundle
    → hydrate 绑定事件（TTI可交互）
```

**知识点：** `SSR` `renderToString` `hydrate` `同构渲染` `数据预取` `StaticRouter` `React服务端渲染`

:::

### Q13: Docker 是怎么实现选镜像并启动容器的？什么是联合文件系统？

> **🔥 中等 · Node.js**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Docker 镜像与容器：**

```dockerfile
# Dockerfile - 定义镜像
FROM node:18-alpine       # 基础镜像层
WORKDIR /app              # 设置工作目录
COPY package*.json ./     # 复制依赖文件
RUN npm ci --production   # 安装依赖（新增层）
COPY . .                  # 复制源代码（新增层）
EXPOSE 3000               # 声明端口
CMD ["node", "server.js"] # 启动命令
```

**镜像层与联合文件系统（UnionFS）：**

```text
镜像层（只读）:
┌─────────────────────────┐
│  Layer 4: CMD node...   │  ← 新增层
├─────────────────────────┤
│  Layer 3: COPY . .      │  ← 新增层
├─────────────────────────┤
│  Layer 2: RUN npm ci    │  ← 新增层
├─────────────────────────┤
│  Layer 1: FROM node:18  │  ← 基础镜像
└─────────────────────────┘

容器层（可写）:
┌─────────────────────────┐
│  Container Layer (R/W)  │  ← 运行时修改
└─────────────────────────┘
```

**Docker 架构：**

| 概念 | 说明 |
|------|------|
| 镜像(Image) | 只读模板，包含运行应用所需的一切 |
| 容器(Container) | 镜像的运行实例，有可写层 |
| Dockerfile | 构建镜像的指令文件 |
| UnionFS | 联合文件系统，将多层叠加为一个文件系统 |
| namespace | 进程隔离（PID/NET/MNT/UTS/IPC/USER） |
| cgroup | 资源限制（CPU/内存/IO） |

```bash
# 构建镜像
docker build -t my-app:1.0 .

# 启动容器
docker run -d -p 3000:3000 --name my-container my-app:1.0

# Docker daemon 处理流程：
# 1. 检查本地是否有 node:18-alpine 镜像
# 2. 没有则从 Docker Hub 拉取
# 3. 逐层执行 Dockerfile 指令
# 4. 创建容器可写层
# 5. 通过 namespace 隔离进程
# 6. 通过 cgroup 限制资源
```

**前端应用 Docker 化最佳实践：**

```dockerfile
# 多阶段构建 - 减小最终镜像体积
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build           # 构建静态文件

FROM nginx:alpine           # 第二阶段：只用 nginx
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
# 最终镜像只有 ~20MB，不包含 node_modules
```

**知识点：** `Docker` `容器化` `联合文件系统` `namespace` `cgroup` `多阶段构建` `前端部署`

:::

---

### Q14: Node.js 的 Streams 有哪几种？pipe 的作用？

> **🔥 中等 · Stream**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Node.js Stream 有四种类型，pipe 用于连接可读流和可写流实现数据自动传输。**

**1. 四种 Stream 类型：**

| 类型 | 说明 | 示例 |
|------|------|------|
| Readable | 只能读取数据 | fs.createReadStream() |
| Writable | 只能写入数据 | fs.createWriteStream() |
| Duplex | 可读写 | net.Socket |
| Transform | 可修改数据 | zlib.createGzip() |

**2. Stream 使用示例：**

```javascript
const fs = require('fs');

// Readable
const readable = fs.createReadStream('input.txt', {
  encoding: 'utf8',
  highWaterMark: 64 * 1024  // 64KB 缓冲
});

// Writable
const writable = fs.createWriteStream('output.txt');

// pipe 连接
readable.pipe(writable);

// 带 Transform
const zlib = require('zlib');
readable
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('output.txt.gz'));
```

**3. pipe 内部原理：**

```javascript
// pipe 自动处理：
// 1. 数据流动
readable.on('data', (chunk) => {
  const canContinue = writable.write(chunk);
  if (!canContinue) readable.pause();
});

// 2. 背压控制
writable.on('drain', () => {
  readable.resume();
});

// 3. 错误处理
readable.on('error', () => writable.end());
writable.on('error', () => readable.destroy());

// 4. 结束处理
readable.on('end', () => writable.end());
```

**4. 手动实现 pipe：**

```javascript
function pipe(source, dest) {
  source.on('data', (chunk) => {
    const canContinue = dest.write(chunk);
    if (!canContinue) source.pause();
  });
  
  dest.on('drain', () => source.resume());
  source.on('end', () => dest.end());
  source.on('error', (err) => dest.emit('error', err));
}
```

**知识点：** `Stream` `Readable` `Writable` `pipe` `背压` `流处理`

:::

---

### Q15: Node.js 的 Buffer 是什么？和 ArrayBuffer 的区别？

> **🔥 中等 · Buffer**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Buffer 是 Node.js 用于处理二进制数据的类，ArrayBuffer 是浏览器标准的二进制缓冲区。**

**1. Buffer 特点：**

```javascript
// 创建 Buffer
const buf1 = Buffer.from('Hello');
const buf2 = Buffer.alloc(1024);
const buf3 = Buffer.allocUnsafe(1024); // 未初始化（快）

// 操作
buf1.toString('utf8');  // 'Hello'
buf1[0];  // 72 (H 的 ASCII)
buf1.write('Hi', 0);
```

**2. 与 ArrayBuffer 对比：**

| 特性 | Buffer | ArrayBuffer |
|------|--------|-------------|
| 环境 | Node.js | 浏览器/Node |
| 大小 | 可调 | 固定 |
| API | Node 特定 | 标准 Web API |
| 编码 | 支持字符串 | 无字符串 |
| 视图 | 无 | DataView/TypedArray |

**3. 互相转换：**

```javascript
// Buffer → ArrayBuffer
const ab = buffer.buffer.slice(
  buffer.byteOffset,
  buffer.byteOffset + buffer.byteLength
);

// ArrayBuffer → Buffer
const buf = Buffer.from(ab);
```

**4. 使用场景：**

```javascript
// Buffer: Node 文件/网络
fs.readFile('file.bin', (err, data) => {
  // data is Buffer
});

// ArrayBuffer: 浏览器二进制
fetch('/file.bin')
  .then(r => r.arrayBuffer());
```

**知识点：** `Buffer` `ArrayBuffer` `二进制` `Node.js` `Web API`

:::

---

### Q16: Node.js 的 cluster 模块是什么？如何利用多核？

> **🔥 中等 · 集群**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**cluster 模块允许创建子进程共享端口，充分利用多核 CPU。**

**1. 为什么需要 cluster：**

```text
问题：
- Node.js 单线程
- 单进程只用 1 个 CPU 核心
- 多核 CPU 浪费

解决方案：
- cluster 创建 worker 进程
- 每个 worker 独立进程
- 共享端口（端口复用）
```

**2. 基本使用：**

```javascript
const cluster = require('cluster');
const os = require('os');
const numCPUs = os.cpus().length;

if (cluster.isMaster) {
  // Master 进程
  console.log(`Master ${process.pid} started`);
  
  // 创建 worker
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  
  // 监听退出
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork(); // 自动重启
  });
} else {
  // Worker 进程
  require('http').createServer((req, res) => {
    res.writeHead(200);
    res.end(`Worker ${process.pid}`);
  }).listen(3000);
}
```

**3. 负载均衡模式：**

```javascript
// 模式 1：Round-Robin（默认）
// Master 分发请求给 worker

// 模式 2：直接分发（性能好）
cluster.schedulingPolicy = cluster.SCHED_NONE;
```

**4. 进程通信：**

```javascript
// Master → Worker
worker.send({ type: 'reload' });

worker.on('message', (msg) => {
  console.log('From worker:', msg);
});

// Worker → Master
process.send({ type: 'ready' });
process.on('message', (msg) => {
  console.log('From master:', msg);
});
```

**5. 生产实践：**

```javascript
const cluster = require('cluster');
const express = require('express');

if (cluster.isMaster) {
  const workers = [];
  
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    workers.push(worker);
    
    worker.on('message', (msg) => {
      // 广播给其他 worker
      workers.forEach(w => {
        if (w !== worker) w.send(msg);
      });
    });
  }
} else {
  // Worker 中正常启动应用
  const app = express();
  app.listen(3000);
}
```

**知识点：** `cluster` `多进程` `多核` `负载均衡` `进程通信`

:::
