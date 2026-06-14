---
title: GraphQL与Electron
description: GraphQL核心概念、Electron架构、桌面应用开发面试题
---

# GraphQL与Electron

## 面试题

### Q1: GraphQL 核心概念有哪些？与 REST 有什么区别？

> **⭐ 简单 · GraphQL**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心概念：**

| 概念 | 说明 |
|------|------|
| Schema | 类型定义，描述 API 能力 |
| Query | 查询数据（读） |
| Mutation | 修改数据（写） |
| Subscription | 实时订阅（WebSocket） |
| Resolver | 解析函数，返回实际数据 |
| Type | 标量类型/String/Int/Boolean/自定义类型 |

**GraphQL vs REST：**

| 维度 | REST | GraphQL |
|------|------|---------|
| 接口 | 多个 URL | 单一端点 |
| 数据获取 | 固定结构 | 按需查询 |
| 过度获取 | 常见 | 避免 |
| 不足获取 | 需多次请求 | 一次搞定 |
| 版本管理 | v1/v2 | 无需版本 |
| 文档 | 需额外维护 | Schema 即文档 |
| 缓存 | HTTP 缓存成熟 | 需自行处理 |

```graphql
# GraphQL - 客户端按需查询
query {
  user(id: 1) {
    name
    email
    posts {
      title
    }
  }
}
# 只返回 name, email, posts.title，不多不少
```

**知识点：** `GraphQL` `Schema` `Query` `Mutation` `REST对比`

:::

### Q2: GraphQL Resolver 解析链是怎样的？

> **🔥 中等 · GraphQL**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

Resolver 负责返回 Schema 定义中每个字段的数据，按层级执行：

```js
const resolvers = {
  Query: {
    user: (_, { id }) => getUserById(id),        // 第一层
  },
  User: {
    posts: (user) => getPostsByUserId(user.id),    // 第二层
    friends: (user) => getFriendsByUserId(user.id), // 第二层
  },
  Post: {
    comments: (post) => getCommentsByPostId(post.id), // 第三层
    author: (post) => getUserById(post.authorId),     // 第三层
  }
}
```

**执行流程：**

```
Query.user(id:1)
  → getUserById(1) → { id: 1, name: "Tom" }
    → User.posts → getPostsByUserId(1) → [{ id: 1, title: "..." }]
      → Post.comments → getCommentsByPostId(1) → [...]
      → Post.author → getUserById(1) → { name: "Tom" }
    → User.friends → getFriendsByUserId(1) → [...]
```

**N+1 问题：** 查询 100 个用户，每个用户的 posts 需要 1 次查询 → 1 + 100 = 101 次

**解决方案：DataLoader**

```js
const postLoader = new DataLoader(async (userIds) => {
  const posts = await getPostsByUserIds(userIds) // 批量查询
  return userIds.map(id => posts.filter(p => p.userId === id))
})

// Resolver 中使用
User: {
  posts: (user) => postLoader.load(user.id)
}
```

**知识点：** `Resolver` `解析链` `N+1问题` `DataLoader`

:::

### Q3: GraphQL Subscription 怎么实现实时数据？

> **🔥 中等 · GraphQL**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

Subscription 基于 WebSocket 实现实时推送：

```graphql
# 客户端订阅
subscription {
  messageAdded(roomId: 1) {
    id
    content
    sender {
      name
    }
  }
}
```

```js
// 服务端 (Apollo Server)
import { PubSub } from 'graphql-subscriptions'

const pubsub = new PubSub()
const MESSAGE_ADDED = 'MESSAGE_ADDED'

const resolvers = {
  Subscription: {
    messageAdded: {
      subscribe: () => pubsub.asyncIterator([MESSAGE_ADDED])
    }
  },
  Mutation: {
    sendMessage: (_, { content, roomId }) => {
      const message = createMessage(content, roomId)
      pubsub.publish(MESSAGE_ADDED, { messageAdded: message })
      return message
    }
  }
}
```

```js
// 客户端 (Apollo Client)
import { gql, useSubscription } from '@apollo/client'

const MESSAGE_SUB = gql`
  subscription OnMessageAdded($roomId: ID!) {
    messageAdded(roomId: $roomId) { id content sender { name } }
  }
`

function ChatRoom({ roomId }) {
  const { data } = useSubscription(MESSAGE_SUB, { variables: { roomId } })
  return <div>{data?.messageAdded.content}</div>
}
```

**知识点：** `Subscription` `WebSocket` `PubSub` `实时数据`

:::

### Q4: Electron 的架构是怎样的？

> **⭐ 简单 · Electron**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

Electron 由两个进程组成：

```
┌─────────────────────────────────────┐
│            主进程 (Main)              │
│  - Node.js 环境                      │
│  - 管理窗口/菜单/托盘                │
│  - 文件系统/原生 API                 │
│  - 只有一个                          │
├──────────────┬──────────────────────┤
│   渲染进程1    │    渲染进程2          │
│  (BrowserWindow)│  (BrowserWindow)   │
│  - Chromium 环境  │  - Chromium 环境   │
│  - 渲染 UI        │  - 渲染 UI        │
│  - 可多个         │  - 可多个          │
└──────────────┴──────────────────────┘
      ↕ IPC 通信 ↕
```

```js
// main.js - 主进程
const { app, BrowserWindow, ipcMain } = require('electron')

app.whenReady().then(() => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,  // 安全：隔离上下文
      nodeIntegration: false   // 安全：禁用 Node
    }
  })
  win.loadFile('index.html')
})

// 主进程接收渲染进程消息
ipcMain.handle('read-file', async (_, filePath) => {
  return fs.readFile(filePath, 'utf-8')
})
```

**知识点：** `Electron` `主进程` `渲染进程` `IPC` `BrowserWindow`

:::

### Q5: Electron 主进程和渲染进程如何通信？

> **🔥 中等 · Electron**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**IPC 通信方式：**

```js
// 1. ipcMain / ipcRenderer - 基础通信

// preload.js（桥接层）
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  onNotification: (callback) => ipcRenderer.on('notification', (_, data) => callback(data))
})

// 渲染进程调用
const content = await window.api.readFile('/path/to/file')

// 2. ipcRenderer.send / ipcMain.on - 单向通信
ipcMain.on('log-message', (_, message) => {
  console.log(message)
})

// 3. ipcMain.handle / ipcRenderer.invoke - 双向通信（推荐）
ipcMain.handle('get-system-info', () => ({
  platform: process.platform,
  cpuUsage: process.getCPUUsage()
}))
const info = await ipcRenderer.invoke('get-system-info')

// 4. WebContents.send - 主进程向渲染进程推送
win.webContents.send('update-available', { version: '2.0.0' })
```

**最佳实践：** 使用 `contextBridge` + `ipcRenderer.invoke` 模式，最安全。

**知识点：** `IPC` `ipcMain` `ipcRenderer` `contextBridge` `preload`

:::

### Q6: Electron 如何做性能优化？

> **🔥 中等 · Electron**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

1. **减小打包体积：**
```js
// webpack 配置 externals 排除大型依赖
externals: {
  electron: 'commonjs electron',
  fsevents: 'commonjs fsevents'
}
// 使用 electron-builder 的 asar 打包
```

2. **减少内存占用：**
```js
// 窗口隐藏时释放资源
win.on('hide', () => win.webContents.session.clearCache())

// 限制渲染进程数量
// 复用窗口而非创建新窗口
```

3. **启动优化：**
```js
// 延迟加载非关键模块
app.whenReady().then(async () => {
  createMainWindow()       // 优先创建窗口
  await loadHeavyModule()  // 延迟加载重模块
})

// 窗口先显示再加载内容
win.show()
win.loadURL('app://./index.html')
```

4. **CPU 密集任务放子进程：**
```js
const { Worker } = require('worker_threads')
const worker = new Worker('./heavy-task.js')
worker.postMessage(data)
worker.on('message', result => { /* ... */ })
```

5. **网络优化：** 离线缓存、请求去重、请求合并

**知识点：** `Electron性能` `打包优化` `内存管理` `启动优化` `Worker`

:::

### Q7: Electron 安全是怎么保障的？

> **💀 困难 · Electron**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**安全威胁与防御：**

| 威胁 | 防御措施 |
|------|----------|
| XSS 加载恶意脚本 | contextIsolation + nodeIntegration: false |
| remote 模块滥用 | 禁用 remote 模块 |
| 不安全的 webview | 禁用 webview 或严格配置 |
| 加载远程内容 | 限制加载来源 |
| IPC 消息伪造 | 校验 sender 来源 |

```js
// 安全的 BrowserWindow 配置
const win = new BrowserWindow({
  webPreferences: {
    contextIsolation: true,     // 隔离预加载脚本和渲染进程
    nodeIntegration: false,     // 禁止渲染进程使用 Node
    sandbox: true,               // 沙箱模式
    preload: path.join(__dirname, 'preload.js')
  }
})

// 安全的 preload.js
const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('api', {
  // 只暴露必要的 API
  readFile: (path) => {
    // 校验路径
    if (!isSafePath(path)) throw new Error('Invalid path')
    return ipcRenderer.invoke('read-file', path)
  }
})

// CSP 头
session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': ["default-src 'self'"]
    }
  })
})
```

**知识点：** `Electron安全` `contextIsolation` `CSP` `sandbox` `预加载脚本`

:::

### Q8: Electron 如何打包和自动更新？

> **🔥 中等 · Electron**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**打包工具：electron-builder**

```json
// package.json
{
  "build": {
    "appId": "com.example.app",
    "productName": "MyApp",
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.productivity"
    },
    "win": {
      "target": ["nsis", "portable"]
    },
    "linux": {
      "target": ["AppImage", "deb"]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

**自动更新：electron-updater**

```js
const { autoUpdater } = require('electron-updater')

app.whenReady().then(() => {
  // 检查更新
  autoUpdater.checkForUpdatesAndNotify()

  autoUpdater.on('update-available', (info) => {
    // 通知用户有更新
  })

  autoUpdater.on('update-downloaded', () => {
    // 提示用户重启安装
    autoUpdater.quitAndInstall()
  })
})
```

**更新流程：**

```
1. 发布新版本到 GitHub Releases / S3 / 自建服务器
2. 应用启动时检查 latest-mac.yml / latest.yml
3. 对比版本号，发现新版本
4. 下载差量更新（blockmap）
5. 下载完成后提示重启安装
```

**知识点：** `electron-builder` `自动更新` `electron-updater` `多平台打包`

:::
### Q9: 为什么要使用 GraphQL？

> **🔥 中等 · 前端架构**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**REST vs GraphQL：**

```text
REST — 多个端点，固定结构
GET /api/user/1        → { id, name, email, avatar, ... }
GET /api/user/1/posts  → [{ id, title, content, ... }]
GET /api/user/1/followers → [{ id, name, ... }]

GraphQL — 单一端点，按需查询
POST /graphql
{
  user(id: 1) {
    name        ← 只要 name，不要 email
    posts {
      title     ← 只要 title，不要 content
    }
  }
}
```

| 问题 | REST | GraphQL |
|------|------|---------|
| 过度获取 | 接口返回全量数据 | 客户端指定字段 |
| 不足获取 | 需要多次请求 | 一次查询关联数据 |
| 接口膨胀 | 每个场景新接口 | Schema自动生成 |
| 弱类型 | JSON无约束 | 强类型Schema |
| 版本管理 | /v1 /v2 | 字段级废弃(@deprecated) |
| 文档 | 需手动维护 | Schema即文档 |

**GraphQL 核心：**

```graphql
# Schema — 定义类型和操作
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Query {
  user(id: ID!): User
  users(limit: Int): [User!]!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
}

type Subscription {
  userUpdated(id: ID!): User!  # 实时订阅
}

# Resolver — 数据获取逻辑
# const resolvers = {
#   Query: {
#     user: (_, { id }) => db.user.findById(id),
#   },
#   User: {
#     posts: (user) => db.post.findByAuthorId(user.id),
#   }
# }
```

**GraphQL 不适合的场景：**
- 二进制文件上传（用 REST + multipart）
- 极其简单的 CRUD（REST 更直观）
- HTTP 缓存依赖（GraphQL 单端点难缓存）
- 团队无 Schema 驱动意识

**知识点：** `GraphQL` `REST` `Schema` `Resolver` `过度获取` `类型系统`

:::

### Q10: RxJS 的优缺点？

> **🔥 中等 · 前端架构**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**RxJS 核心概念：** 一切皆为数据流（Observable），通过操作符组合处理。

```js
import { fromEvent, interval, merge } from 'rxjs'
import { map, filter, debounceTime, switchMap, takeUntil } from 'rxjs/operators'

// 搜索框输入 → 防抖 → 请求 → 展示结果
const search$ = fromEvent(input, 'input').pipe(
  map(e => e.target.value),
  filter(text => text.length > 2),
  debounceTime(300),              // 防抖300ms
  distinctUntilChanged(),          // 去重
  switchMap(keyword =>             // 切换到最新请求
    from(fetch(`/api/search?q=${keyword}`).then(r => r.json()))
  ),
  takeUntil(destroy$)             // 组件销毁时取消
)

search$.subscribe(results => {
  renderResults(results)
})
```

**优点：**

| 优点 | 说明 |
|------|------|
| 统一抽象 | 事件、定时器、Promise、WebSocket 都是 Observable |
| 声明式 | 代码描述"做什么"而非"怎么做" |
| 组合能力 | pipe 操作符链式组合，像搭积木 |
| 取消管理 | switchMap/takeUntil 自动清理旧订阅 |
| 背压控制 | throttle/debounce/buffer 控制数据流速 |
| 缓存 | shareReplay 实现请求缓存 |

**缺点：**

| 缺点 | 说明 |
|------|------|
| 学习曲线陡 | 概念多（Observer/Subject/Scheduler） |
| 调试困难 | 声明式链难以断点、调用栈复杂 |
| 包体积 | rxjs ~30KB gzipped |
| 过度设计 | 简单场景不需要 RxJS |
| 内存泄漏 | 忘记 unsubscribe 导致泄漏 |

**何时使用 RxJS：**

```text
✅ 适合：
- 复杂异步流（多事件源组合/竞态）
- 实时数据（WebSocket/实时通知）
- 复杂交互（拖拽/手势/动画组合）
- Angular 项目（内置）

❌ 不适合：
- 简单 CRUD 页面
- 只需 1-2 个异步操作
- 团队不熟悉 RxJS
- 小型项目
```

**知识点：** `RxJS` `Observable` `操作符` `响应式编程` `switchMap` `数据流`

:::

### Q11: GraphQL Type 和 Schema 是什么？

> **🔥 中等 · 前端架构**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Schema 定义了 API 的类型系统：**

```graphql
# 标量类型（Scalar）— 叶子节点
scalar DateTime

# 对象类型（Object Type）
type User {
  id: ID!              # ! 表示非空
  name: String!
  email: String!
  age: Int
  posts: [Post!]!      # 非空Post数组
  createdAt: DateTime
}

type Post {
  id: ID!
  title: String!
  content: String
  author: User!         # 对象间关联
  tags: [String!]
}

# 枚举类型
enum Role {
  ADMIN
  EDITOR
  VIEWER
}

# 输入类型（用于 Mutation 参数）
input CreateUserInput {
  name: String!
  email: String!
  role: Role = VIEWER   # 默认值
}

# 查询（Query）— 读取数据
type Query {
  user(id: ID!): User
  users(limit: Int, offset: Int): [User!]!
  search(query: String!): [SearchResult!]!
}

# 变更（Mutation）— 修改数据
type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}

# 订阅（Subscription）— 实时数据
type Subscription {
  userUpdated(id: ID): User!
  newPost: Post!
}

# Schema 入口
schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
```

**Resolver — 数据获取逻辑：**

```js
const resolvers = {
  Query: {
    user: (_, { id }) => db.user.findById(id),
    users: (_, { limit = 10, offset = 0 }) =>
      db.user.findAll({ limit, offset }),
  },
  User: {
    posts: (user) => db.post.findByAuthorId(user.id),  // 关联查询
  },
  Mutation: {
    createUser: (_, { input }) => db.user.create(input),
  },
  Subscription: {
    userUpdated: {
      subscribe: () => pubsub.asyncIterator('USER_UPDATED'),
    },
  },
}
```

**类型系统层级：**

```text
Schema
├── Query（读入口）
├── Mutation（写入口）
├── Subscription（订阅入口）
├── Object Types（User, Post...）
│   ├── Fields（name, email...）
│   └── Relations（posts → Post）
├── Input Types（CreateUserInput）
├── Enum Types（Role）
├── Scalar Types（ID, String, Int, DateTime）
├── Interface（可复用字段集）
└── Union（多类型联合）
```

**知识点：** `GraphQL Schema` `Type` `Query` `Mutation` `Subscription` `Resolver` `强类型`

:::

### Q12: 什么是同构渲染？为什么需要在服务端和客户端各执行一次？

> **🔥 中等 · 前端架构**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**同构渲染 = SSR（首次）+ CSR（后续）**

```text
首次访问（SSR）：
浏览器请求 → 服务端执行 React/Vue → 生成完整 HTML → 返回
→ 浏览器显示页面（FCP极快）→ 下载 JS → Hydration → 页面可交互

后续导航（CSR）：
用户点击链接 → 客户端路由 → JS 渲染组件 → 无需请求服务端
```

**为什么需要执行两次？**

| 阶段 | 执行位置 | 作用 |
|------|---------|------|
| 服务端渲染 | Node.js | 生成静态 HTML，SEO 友好，首屏快 |
| 客户端注水 | 浏览器 | 绑定事件、恢复状态，页面可交互 |

**只执行一次的问题：**

```text
只 SSR 不注水：
→ 页面可见但不可交互（点击按钮无响应）
→ 因为 HTML 是纯静态的，没有事件绑定

只 CSR 不 SSR：
→ 首屏白屏久（需要等JS下载执行）
→ SEO 不友好（爬虫看到的空白页）
```

**Hydration 注水过程：**

```js
// React 18 同构渲染
import { hydrateRoot } from 'react-dom/client'

// 服务端
const html = renderToString(<App />)

// 客户端：hydrate 复用已有 HTML，只绑定事件
hydrateRoot(document.getElementById('root'), <App />)

// ⚠️ hydration mismatch — 服务端和客户端渲染结果不一致会报警告
// 原因：使用了 window/date/随机数等浏览器特有API
```

**Vue 同构示例：**

```js
// server-entry.js
import { renderToString } from 'vue/server-renderer'
const app = createSSRApp(App)
const html = await renderToString(app)

// client-entry.js
const app = createSSRApp(App)
app.mount('#app')  // Vue 自动执行 hydration
```

**常见问题：**

| 问题 | 原因 | 解决 |
|------|------|------|
| Hydration mismatch | SSR/CSR 渲染结果不同 | 避免使用 Date.now()/window 等 |
| 内存泄漏 | Node 进程未释放 | 确保无全局状态，每次请求创建新实例 |
| 首屏数据 | SSR 需要预取数据 | asyncData / getServerSideProps |
| 样式闪烁 | CSS 未随 HTML 输出 | critical CSS 内联 / CSS-in-JS SSR |

**知识点：** `同构渲染` `SSR` `Hydration` `注水` `SEO` `首屏优化` `Universal App`

:::

### Q13: Electron 优化方案有哪些？

> **🔥 中等 · 桌面端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Electron 性能问题根源：Chromium + Node.js = 内存占用大**

| 优化方向 | 方案 | 效果 |
|---------|------|------|
| 包体积 | asar打包/Tree-shaking | 减少30-50% |
| 启动速度 | 延迟加载/预加载 | 减少50%启动时间 |
| 内存占用 | 进程管理/手动GC | 减少30-50% |
| CPU占用 | Web Worker/原生模块 | 减少主线程阻塞 |

**1. 包体积优化：**

```js
// package.json 排除不需要的文件
// electron-builder.yml
files:
  - "dist/**/*"
  - "node_modules/**/*"
  - "!node_modules/**/README*"
  - "!node_modules/**/test/**"

// asar 打包
const { asar } = require('@electron/asar')
asar.createPackage('app', 'app.asar')  // 单文件，减少IO

// Tree-shaking — 只打包用到的代码
// vite/webpack production mode 自动生效
```

**2. 启动速度优化：**

```js
// 延迟加载非关键模块
let heavyModule = null
async function getHeavyModule() {
  if (!heavyModule) heavyModule = await import('./heavy-module')
  return heavyModule
}

// 窗口预创建（隐藏窗口池）
const hiddenWindow = new BrowserWindow({ show: false })
// 需要时直接显示
hiddenWindow.show()

// 优化启动流程
app.on('ready', async () => {
  // 先显示窗口（用户感知快）
  const win = createWindow()
  win.show()
  // 再加载重模块
  await loadHeavyFeatures()
})
```

**3. 内存优化：**

```js
// 限制渲染进程数量
app.on('window-all-closed', () => {
  // 所有窗口关闭时退出（而不是在后台运行）
  if (process.platform !== 'darwin') app.quit()
})

// 手动触发GC（开发时）
if (process.env.NODE_ENV === 'development') {
  setInterval(() => global.gc(), 30000)
}

// Webview 进程管理
webview.addEventListener('destroyed', () => {
  // 释放Webview占用的资源
})

// 限制V8内存
app.commandLine.appendSwitch('js-flags', '--max-old-space-size=512')
```

**4. 进程优化：**

```js
// CPU密集任务放Worker
const { Worker } = require('worker_threads')
const worker = new Worker('./heavy-task.js')
worker.postMessage({ data: largeData })
worker.on('message', result => console.log(result))

// 渲染进程通信优化
// ❌ 频繁 ipc 通信
ipcRenderer.send('update', data)  // 每次都序列化

// ✅ 批量更新
let updateQueue = []
let updateTimer = null
function batchUpdate(data) {
  updateQueue.push(data)
  if (!updateTimer) {
    updateTimer = setTimeout(() => {
      ipcRenderer.send('batch-update', updateQueue)
      updateQueue = []
      updateTimer = null
    }, 16)  // 合并到一帧
  }
}
```

**知识点：** `Electron优化` `asar` `进程管理` `内存优化` `启动速度` `Web Worker`

:::

### Q14: Electron 多窗口通信怎么做？

> **🔥 中等 · 桌面端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Electron 多窗口通信方式：**

```text
主进程（Main）←→ 渲染进程A（Renderer A）←→ 渲染进程B（Renderer B）

渲染进程之间不能直接通信，必须通过主进程中转
```

**1. ipcMain/ipcRenderer — 主进程与渲染进程通信：**

```js
// 主进程 main.js
const { ipcMain, BrowserWindow } = require('electron')

ipcMain.on('msg-from-renderer', (event, data) => {
  console.log('收到渲染进程消息:', data)
  // 转发给另一个窗口
  otherWindow.webContents.send('msg-from-main', data)
  
  // 回复发送者
  event.reply('reply', '主进程已收到')
})

// 渲染进程A
const { ipcRenderer } = require('electron')
ipcRenderer.send('msg-from-renderer', { type: 'update', payload: '...' })
ipcRenderer.on('reply', (event, data) => console.log(data))
```

**2. BrowserWindow.webContents — 主进程主动推送给渲染进程：**

```js
// 主进程
const winA = new BrowserWindow({ ... })
const winB = new BrowserWindow({ ... })

// 主进程主动推送给窗口A
winA.webContents.send('notification', { message: '窗口B已更新' })

// 广播给所有窗口
BrowserWindow.getAllWindows().forEach(win => {
  win.webContents.send('broadcast', data)
})
```

**3. 渲染进程间通信（通过主进程中转）：**

```js
// 封装进间通信模块
// renderer-bridge.js (主进程)
const windows = new Map()

ipcMain.on('register-window', (event, windowId) => {
  windows.set(windowId, event.sender)
})

ipcMain.on('send-to-window', (event, { target, channel, data }) => {
  const targetWindow = windows.get(target)
  if (targetWindow) {
    targetWindow.send(channel, data)
  }
})

// 渲染进程A发送消息给渲染进程B
ipcRenderer.send('send-to-window', {
  target: 'window-b',
  channel: 'data-update',
  data: { key: 'value' }
})
```

**4. 共享数据 — 不同窗口共享状态：**

```js
// 方案1：SharedArrayBuffer（同源窗口）
const sharedBuffer = new SharedArrayBuffer(1024)
const sharedArray = new Int32Array(sharedBuffer)

// 方案2：主进程作为数据中转站
ipcMain.on('set-shared-data', (event, { key, value }) => {
  sharedData.set(key, value)
  // 通知其他窗口数据变化
  BrowserWindow.getAllWindows().forEach(win => {
    if (win.webContents !== event.sender) {
      win.webContents.send('shared-data-changed', { key, value })
    }
  })
})

// 方案3：本地文件/IndexedDB共享
// 适合持久化数据，注意读写锁
```

| 通信方式 | 适用场景 | 特点 |
|---------|---------|------|
| ipcMain/ipcRenderer | 主进程↔渲染进程 | 基础，最常用 |
| webContents.send | 主进程→渲染进程 | 主动推送 |
| 主进程中转 | 渲染进程↔渲染进程 | 间接通信 |
| SharedArrayBuffer | 高频数据共享 | 性能好，同源限制 |

**知识点：** `Electron` `IPC通信` `多窗口` `ipcMain` `ipcRenderer` `webContents`

:::

### Q15: Electron 崩溃监控怎么做？

> **💀 困难 · Electron**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Electron 崩溃监控方案：**

**1. 使用 crashReporter 收集 minidump：**

```javascript
// 主进程
const { crashReporter } = require('electron')

crashReporter.start({
  productName: 'YourApp',
  companyName: 'YourCompany',
  submitURL: 'https://your-domain.com/crash-report',
  uploadToServer: true,  // 自动上传到服务器
  extra: {
    version: app.getVersion(),
    environment: process.env.NODE_ENV
  }
})
```

**2. 监听渲染进程崩溃事件：**

```javascript
const { app, BrowserWindow } = require('electron')

app.on('render-process-gone', (event, webContents, details) => {
  console.log('渲染进程崩溃:', details.reason)
  // reasons: clean-exit, abnormal-exit, crashed, killed, launched, oom, crashed-oom
  
  // 发送崩溃报告
  sendCrashReport({
    type: 'renderer-crash',
    reason: details.reason,
    exitCode: details.exitCode,
    timestamp: Date.now(),
    extra: crashReporter.getLastCrashReport()
  })
})

app.on('child-process-gone', (event, details) => {
  console.log('子进程崩溃:', details)
  // details.type: 'GPU', 'Utility', 'Zygote', 'Plugin', 'Worker'
})
```

**3. 监听 uncaughtException 和 unhandledRejection：**

```javascript
// 主进程
process.on('uncaughtException', (error) => {
  console.error('主进程未捕获异常:', error)
  sendCrashReport({
    type: 'main-process-error',
    error: {
      message: error.message,
      stack: error.stack
    }
  })
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason)
})

// 渲染进程
window.addEventListener('error', (event) => {
  console.error('渲染进程错误:', event.error)
  sendCrashReport({
    type: 'renderer-error',
    error: {
      message: event.error?.message,
      stack: event.error?.stack
    }
  })
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise:', event.reason)
})
```

**4. minidump 文件位置：**

```javascript
const { app } = require('electron')
const path = require('path')

// crashDumps 目录
const crashDumpsDir = path.join(app.getPath('userData'), 'Crashpad', 'reports')
console.log('Crash dumps:', crashDumpsDir)

// 读取最新的 crash report
const fs = require('fs')
const reports = fs.readdirSync(crashDumpsDir)
const latestReport = reports[reports.length - 1]
console.log('Latest crash:', latestReport)
```

**5. 上传分析崩溃报告：**

```javascript
// 服务端接收 crash report（使用 breakpad-server 或自建）
const express = require('express')
const multer = require('multer')
const upload = multer({ dest: 'crashes/' })

app.post('/crash-report', upload.fields([
  { name: 'upload_file_minidump' },
  { name: 'prod' }
]), async (req, res) => {
  const crashData = {
    minidump: req.files.upload_file_minidump?.[0]?.path,
    version: req.body.prod,
    timestamp: Date.now()
  }
  
  // 分析 minidump
  const analysis = await analyzeMinidump(crashData.minidump)
  console.log('Crash analysis:', analysis)
  
  // 发送到 Sentry 或其他监控平台
  await sendToSentry(analysis)
})
```

**6. 集成 Sentry（推荐）：**

```javascript
const { init } = require('@sentry/electron')

init({
  dsn: 'https://xxx@sentry.io/xxx',
  beforeSend: (event) => {
    // 可以在这里添加额外信息
    return event
  }
})
```

**知识点：** `Electron` `崩溃监控` `crashReporter` `minidump` `render-process-gone` `Sentry`

:::

### Q16: 100x100 的 Canvas 占多少内存？如何计算？

> **🔥 中等 · Canvas**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Canvas 内存占用计算公式：**

```
内存 = width × height × 4 bytes（RGBA） × devicePixelRatio²
```

**详细推导：**

1. **每个像素占 4 字节**：
   - R（Red）：1 byte（0-255）
   - G（Green）：1 byte（0-255）
   - B（Blue）：1 byte（0-255）
   - A（Alpha）：1 byte（0-255，透明度）
   - 总计：4 bytes = 32 bits（RGBA32 格式）

2. **高分屏（Retina）影响**：
   - devicePixelRatio = 1（普通屏）：1 CSS 像素 = 1 物理像素
   - devicePixelRatio = 2（Retina）：1 CSS 像素 = 2×2 = 4 物理像素
   - devicePixelRatio = 3（iPhone Plus）：1 CSS 像素 = 3×3 = 9 物理像素

3. **计算示例**：

```javascript
// 100x100 的 Canvas
const width = 100
const height = 100

// 普通屏 (DPR=1)
const memory1x = width * height * 4  // 40,000 bytes = 39 KB

// Retina 屏 (DPR=2)
const dpr = 2
const memory2x = (width * dpr) * (height * dpr) * 4  // 160,000 bytes = 156 KB

// iPhone Plus (DPR=3)
const dpr3 = 3
const memory3x = (width * dpr3) * (height * dpr3) * 4  // 360,000 bytes = 352 KB
```

**完整计算函数：**

```javascript
function calculateCanvasMemory(width, height, devicePixelRatio = 1) {
  const physicalWidth = width * devicePixelRatio
  const physicalHeight = height * devicePixelRatio
  const bytesPerPixel = 4  // RGBA
  
  const totalBytes = physicalWidth * physicalHeight * bytesPerPixel
  const totalKB = totalBytes / 1024
  const totalMB = totalKB / 1024
  
  return {
    width: physicalWidth,
    height: physicalHeight,
    bytes: totalBytes,
    kb: totalKB.toFixed(2),
    mb: totalMB.toFixed(2)
  }
}

// 测试结果
console.log(calculateCanvasMemory(100, 100, 1))   // 39.06 KB
console.log(calculateCanvasMemory(100, 100, 2))   // 156.25 KB
console.log(calculateCanvasMemory(100, 100, 3))   // 351.56 KB
console.log(calculateCanvasMemory(1920, 1080, 2)) // 16.02 MB (全屏 Canvas)
```

**优化建议：**

```javascript
// 1. 按需创建 Canvas，避免过大的离屏 Canvas
const canvas = document.createElement('canvas')
canvas.width = window.innerWidth * Math.min(window.devicePixelRatio, 2)  // 限制最大 DPR
canvas.height = window.innerHeight * Math.min(window.devicePixelRatio, 2)

// 2. 及时清理不用的 Canvas
function cleanupCanvas(canvas) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  canvas.width = 0  // 释放内存
  canvas.height = 0
}

// 3. 使用 createImageBitmap 替代大 Canvas
const bitmap = await createImageBitmap(image)  // 更高效的位图存储
```

**不同设备实际内存对比：**

| 设备 | DPR | 100×100 内存 | 1920×1080 内存 |
|------|-----|-------------|---------------|
| 普通笔记本 | 1 | 39 KB | 7.91 MB |
| MacBook Pro | 2 | 156 KB | 31.64 MB |
| iPhone 标准 | 2 | 156 KB | 31.64 MB |
| iPhone Plus | 3 | 352 KB | 71.19 MB |

**知识点：** `Canvas` `内存计算` `devicePixelRatio` `RGBA` `性能优化` `离屏渲染`

:::
