---
title: 进程管理与部署
description: 深入考察 Node.js 的 child_process 与 worker_threads、cluster 模块、进程守护(PM2)、IPC 通信、僵尸进程、优雅退出等核心知识
---

# 进程管理与部署

### Q1: `child_process` 和 `worker_threads` 有什么区别？如何选择？

> **⭐ 中单 · Node.js**

::: details 点击查看答案与解析

| 维度 | child_process | worker_threads |
|------|--------------|----------------|
| 本质 | 独立的进程 | 独立的线程 |
| 内存 | 进程间内存隔离 | 共享 `SharedArrayBuffer` |
| 通信 | IPC（序列化/反序列化） | `MessagePort`（可零拷贝转移） |
| 创建开销 | 重（需要 fork 新进程） | 轻（线程创建更快） |
| 稳定性 | 进程崩溃不影响主进程 | 线程崩溃可能导致主进程异常 |
| DOM/模块 | 完整的 Node.js 环境 | 完整的 Node.js 环境 |
| 适用场景 | 外部命令、高隔离任务 | CPU 密集计算、共享内存 |

**child_process 四种创建方式：**

| 方法 | 用途 | 示例 |
|------|------|------|
| `spawn` | 启动命令，流式输出 | `spawn('ls', ['-la'])` |
| `exec` | 启动命令，缓冲输出 | `exec('ls -la', callback)` |
| `fork` | 创建 Node 子进程（自动 IPC） | `fork('./child.js')` |
| `execFile` | 直接执行文件 | `execFile('./script.sh')` |

```javascript
// child_process.fork — 适合任务分发
const { fork } = require('child_process');
const child = fork('./worker.js');

child.send({ type: 'compute', data: [1, 2, 3] });
child.on('message', (result) => {
  console.log('结果:', result);
});
```

```javascript
// worker_threads — 适合 CPU 密集计算
const { Worker } = require('worker_threads');

const worker = new Worker('./heavy-compute.js', {
  workerData: { number: 45 }
});

worker.on('message', (result) => console.log('结果:', result));
worker.on('error', (err) => console.error('错误:', err));
worker.on('exit', (code) => console.log('退出码:', code));
```

**选择决策：**

```
需要运行外部命令？ → child_process.spawn/exec
需要高隔离性？ → child_process.fork
需要 CPU 密集计算？ → worker_threads
需要共享内存？ → worker_threads + SharedArrayBuffer
需要大量子任务？ → worker_threads（创建开销更小）
```

**知识点：** `child_process` `worker_threads` `进程vs线程` `IPC` `SharedArrayBuffer`

:::

---

### Q2: cluster 模块的工作原理是什么？如何实现多核利用？

> **⭐ 中等 · Node.js**

::: details 点击查看答案与解析

**cluster 模块** 允许创建共享同一端口的多个 Node.js 进程，实现多核 CPU 利用。

**工作原理：**

```
Master 进程（主进程）
  │
  ├─ fork() → Worker 1 (监听 3000 端口)
  ├─ fork() → Worker 2 (监听 3000 端口)
  ├─ fork() → Worker 3 (监听 3000 端口)
  └─ fork() → Worker 4 (监听 3000 端口)
```

**核心机制 — 端口共享：**

- Master 进程通过 `net.Server` 监听端口
- Worker 的 `server.listen()` 实际通过 IPC 通知 Master
- Master 的 `net.Server` 使用 `SO_REUSEPORT` 或内部路由分发连接

**两种调度策略：**

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| `cluster.SCHED_RR`（默认） | Master 轮询分发连接给 Worker | 通用场景，负载均匀 |
| `cluster.SCHED_NONE` | 操作系统决定调度 | 性能更好，但可能不均匀 |

```javascript
// 基本用法
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isPrimary) {
  console.log(`主进程 ${process.pid} 正在运行`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} 退出`);
    cluster.fork(); // 自动重启
  });
} else {
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(`Worker ${process.pid} 处理请求\n`);
  }).listen(3000);

  console.log(`Worker ${process.pid} 启动`);
}
```

**Master 与 Worker 的 IPC 通信：**

```javascript
// Master → Worker
worker.send({ cmd: 'reload' });

// Worker → Master
process.send({ cmd: 'ready', pid: process.pid });

// Master 监听 Worker 消息
worker.on('message', (msg) => {
  if (msg.cmd === 'ready') { /* ... */ }
});
```

**⚠️ 注意事项：**

1. Worker 之间不共享内存（每个都是独立进程）
2. Session/Sticky问题：同一用户的请求可能被分发到不同 Worker → 需要 Sticky Session
3. 静态资源建议由 Nginx 直接服务，不经过 Node.js
4. 生产环境更推荐使用 PM2 而非直接使用 cluster

**知识点：** `cluster` `多核利用` `端口共享` `轮询调度` `PM2`

:::

---

### Q3: PM2 的核心功能有哪些？如何配置生产环境部署？

> **⭐ 中等 · Node.js**

::: details 点击查看答案与解析

**PM2** 是 Node.js 最流行的进程管理器，提供进程守护、负载均衡、日志管理等功能。

**核心功能：**

| 功能 | 命令 / 配置 | 说明 |
|------|------------|------|
| 启动应用 | `pm2 start app.js` | 后台运行，自动守护 |
| 集群模式 | `-i max` | 利用所有 CPU 核心 |
| 自动重启 | ✅ 默认 | 进程崩溃自动拉起 |
| 日志管理 | `pm2 logs` | 合并日志、日志切割 |
| 监控面板 | `pm2 monit` | CPU/内存实时监控 |
| 零停机重启 | `pm2 reload` | 逐个重启 Worker |
| 启动脚本 | `pm2 startup` | 开机自启动 |
| 生态文件 | `ecosystem.config.js` | 统一管理多个应用 |

**生产环境配置：**

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'my-api',
      script: './dist/main.js',
      
      // 集群配置
      instances: 'max',          // 或具体数字
      exec_mode: 'cluster',      // cluster / fork
      
      // 环境变量
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 3001,
      },
      
      // 重启策略
      max_memory_restart: '1G',   // 内存超限自动重启
      min_uptime: '10s',         // 最小运行时间（低于此视为异常启动）
      max_restarts: 10,           // 最大重启次数
      restart_delay: 4000,        // 重启间隔
      
      // 日志配置
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      
      // 优雅退出
      kill_timeout: 5000,        // 发送 SIGKILL 前等待时间
      listen_timeout: 3000,      // 启动超时
      wait_ready: true,          // 等待 process.send('ready')
    },
  ],
};
```

**常用命令：**

```bash
# 启动
pm2 start ecosystem.config.js --env production

# 零停机重启
pm2 reload my-api

# 停止 / 删除
pm2 stop my-api
pm2 delete my-api

# 日志
pm2 logs my-api --lines 100
pm2 flush              # 清空日志

# 监控
pm2 monit              # 终端监控面板
pm2 list               # 进程列表
pm2 describe my-api    # 详细信息

# 启动脚本（开机自启）
pm2 startup
pm2 save               # 保存当前进程列表
```

**优雅退出（Graceful Shutdown）：**

```javascript
// 应用代码配合 PM2 的 wait_ready
process.on('SIGINT', async () => {
  console.log('收到退出信号，开始优雅关闭...');
  
  // 停止接收新请求
  server.close();
  
  // 等待现有请求完成
  await closeDatabaseConnections();
  await flushCache();
  
  // 通知 PM2 可以退出
  if (process.send) process.send('ready');
  process.exit(0);
});
```

**知识点：** `PM2` `进程守护` `集群模式` `零停机重启` `ecosystem.config`

:::

---

### Q4: IPC 通信有哪些方式？`child_process.fork` 的 IPC 是如何实现的？

> **⭐ 中等 · Node.js**

::: details 点击查看答案与解析

**Node.js 中的 IPC 通信方式对比：**

| 方式 | 场景 | 延迟 | 吞吐量 | 复杂度 |
|------|------|------|--------|--------|
| `process.send()` | fork 子进程 | 低 | 中 | 低 |
| `MessagePort` | worker_threads | 极低 | 高 | 低 |
| `SharedArrayBuffer` | worker_threads | 极低 | 极高 | 高 |
| Unix Socket | 本地进程间 | 低 | 高 | 中 |
| TCP Socket | 跨机器进程 | 中 | 高 | 中 |
| 文件 / 管道 | 简单场景 | 高 | 低 | 低 |
| Redis Pub/Sub | 分布式 | 中 | 高 | 中 |

**`child_process.fork` 的 IPC 底层实现：**

```
Parent Process                 Child Process
    │                              │
    │  ← Unix Domain Socket →     │
    │     (或 Windows Named Pipe)  │
    │                              │
process.send()   ──────→    message事件
message事件      ←──────    process.send()
```

**IPC 实现细节：**

1. fork 创建子进程时，通过环境变量 `NODE_CHANNEL_FD` 传递文件描述符
2. 底层使用 `libuv` 的 `uv_pipe_t`（Unix Domain Socket / Named Pipe）
3. 消息通过 JSON 序列化/反序列化传输
4. 支持 `net.Server` 和 `net.Socket` 的句柄传递

```javascript
// 进程间传递 Server 句柄
// parent.js
const { fork } = require('child_process');
const child = fork('./child.js');
const server = require('net').createServer();

server.listen(3000, () => {
  // 将 server 句柄发送给子进程
  child.send('server', server);
});

// child.js
process.on('message', (msg, server) => {
  if (msg === 'server') {
    server.on('connection', (socket) => {
      socket.end('handled by child\n');
    });
  }
});
```

**句柄传递的原理：**

- `send()` 的第二个参数可以传递 `net.Server` / `net.Socket` / `dgram.Socket`
- libuv 将文件描述符封装为 `uv_handle_t`，通过 `sendmsg` 的辅助数据传递
- 接收方通过 `recvmsg` 得到 fd，重建对应对象
- **同一时刻，同一 fd 只能被一个进程拥有**

**worker_threads 的 MessagePort：**

```javascript
const { Worker, MessageChannel } = require('worker_threads');

const { port1, port2 } = new MessageChannel();
const worker = new Worker('./worker.js');

// 传递通信端口
worker.postMessage({ port: port2 }, [port2]);

// port1 在主线程
port1.on('message', (data) => console.log('收到:', data));
port1.postMessage('hello worker');
```

**知识点：** `IPC` `child_process.fork` `UnixSocket` `句柄传递` `MessagePort`

:::

---

### Q5: 什么是僵尸进程？如何检测和处理？

> **⭐ 困难 · Node.js**

::: details 点击查看答案与解析

**僵尸进程（Zombie Process）：** 子进程已退出，但父进程尚未调用 `wait()` 回收其退出状态，导致子进程的进程描述符仍保留在系统中。

**产生条件：**

```
1. 父进程创建子进程
2. 子进程退出
3. 父进程没有调用 wait/waitpid 或未监听 'exit' 事件
4. 子进程变成僵尸状态（Z 状态）
```

**僵尸进程的特征：**

- 在 `ps` 中显示状态为 `Z`（zombie）
- 不占用 CPU 和内存，但占用进程表项（PID）
- 大量僵尸进程会导致 PID 耗尽，无法创建新进程

**检测僵尸进程：**

```bash
# 查找僵尸进程
ps aux | grep 'Z'

# 更精确的查找
ps -eo pid,ppid,stat,cmd | grep 'Z'

# 统计僵尸进程数量
ps -eo stat | grep -c 'Z'
```

**Node.js 中避免僵尸进程：**

```javascript
// ❌ 可能产生僵尸进程
const { spawn } = require('child_process');
const child = spawn('some-command');
// 没有监听 exit 事件 — 子进程退出后变成僵尸

// ✅ 正确处理
const child = spawn('some-command');

child.on('exit', (code, signal) => {
  console.log(`子进程退出: code=${code}, signal=${signal}`);
});

// ✅ 使用 detached + unref 让子进程独立
const child = spawn('some-command', [], {
  detached: true,
  stdio: 'ignore',
});
child.unref(); // 允许父进程独立退出
```

**`SIGCHLD` 信号处理：**

```javascript
// 忽略 SIGCHLD — 子进程退出后自动回收，不会变成僵尸
process.on('SIGCHLD', () => {
  // Node.js 默认会处理 SIGCHLD，调用 waitpid 回收子进程
});
```

**孤儿进程 vs 僵尸进程：**

| 类型 | 定义 | PID | 解决方案 |
|------|------|-----|----------|
| 僵尸进程 | 子进程死，父进程未回收 | 存在 | 父进程调用 `wait()`/监听 exit |
| 孤儿进程 | 父进程死，子进程还活着 | 被 init 收养 | init 会自动回收 |

**系统级处理：**

```bash
# 杀死僵尸进程（需要杀死其父进程）
kill -9 $(ps -o ppid= -p <zombie_pid>)

# 或者使用 SIGCHLD 让父进程回收
kill -SIGCHLD <parent_pid>
```

**知识点：** `僵尸进程` `孤儿进程` `SIGCHLD` `进程回收` `detached`

:::

---

### Q6: 如何实现 Node.js 应用的优雅退出（Graceful Shutdown）？

> **⭐ 中等 · Node.js**

::: details 点击查看答案与解析

**优雅退出的核心步骤：**

```
收到退出信号（SIGTERM/SIGINT）
  │
  ├─ 1. 停止接收新请求（从负载均衡移除）
  │
  ├─ 2. 等待正在处理的请求完成
  │
  ├─ 3. 关闭数据库连接
  │
  ├─ 4. 关闭缓存连接
  │
  ├─ 5. 清理临时资源
  │
  └─ 6. 退出进程
```

**完整实现：**

```javascript
const http = require('http');
const server = http.createServer(app);

// 连接追踪
let connections = new Set();
server.on('connection', (conn) => {
  connections.add(conn);
  conn.on('close', () => connections.delete(conn));
});

// 优雅退出
let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  console.log(`收到 ${signal}，开始优雅关闭...`);
  
  // 1. 停止接收新连接
  server.close(() => {
    console.log('HTTP 服务器已关闭');
  });
  
  // 2. 强制关闭空闲连接（keep-alive）
  connections.forEach((conn) => {
    if (!conn._httpMessage) {
      conn.destroy();
      connections.delete(conn);
    }
  });
  
  // 3. 等待活跃请求完成（带超时）
  const shutdownTimeout = setTimeout(() => {
    console.warn('优雅关闭超时，强制退出');
    process.exit(1);
  }, 30000); // 30 秒超时
  
  // 等待所有连接关闭
  await new Promise((resolve) => {
    const check = setInterval(() => {
      if (connections.size === 0) {
        clearInterval(check);
        resolve();
      }
    }, 1000);
  });
  
  clearTimeout(shutdownTimeout);
  
  // 4. 关闭数据库连接
  await closeDatabase();
  
  // 5. 关闭 Redis
  await closeRedis();
  
  console.log('优雅关闭完成');
  process.exit(0);
}

// 注册信号处理
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// 未捕获异常也需要优雅退出
process.on('uncaughtException', async (err) => {
  console.error('未捕获异常:', err);
  await gracefulShutdown('uncaughtException');
});
```

**Kubernetes 环境下的优雅退出：**

```yaml
# Pod 配置
spec:
  terminationGracePeriodSeconds: 30  # 优雅退出最大等待时间
  containers:
    - name: app
      lifecycle:
        preStop:
          exec:
            command: ["/bin/sh", "-c", "sleep 5"]  # 等待 Service 同步端点
```

**K8s 退出流程：**

1. Pod 收到删除请求
2. kubelet 发送 `SIGTERM`
3. 等待 `terminationGracePeriodSeconds`
4. 超时后发送 `SIGKILL`

**preStop 的作用：** 确保 Kubernetes 的 Service/Ingress 已经将 Pod 从端点列表移除，避免新请求路由到正在关闭的 Pod。

**知识点：** `优雅退出` `SIGTERM` `连接追踪` `Kubernetes` `preStop`

:::

---

### Q7: Docker 部署 Node.js 应用有哪些最佳实践？

> **⭐ 中等 · Node.js**

::: details 点击查看答案与解析

**Dockerfile 最佳实践：**

```dockerfile
# 1. 指定版本，不用 latest
FROM node:20-alpine

# 2. 设置安全用户
USER node

# 3. 设置工作目录
WORKDIR /app

# 4. 先拷贝依赖文件（利用 Docker 缓存）
COPY package.json pnpm-lock.yaml ./

# 5. 安装依赖
RUN corepack enable && pnpm install --frozen-lockfile --prod

# 6. 拷贝源代码
COPY --chown=node:node . .

# 7. 设置环境变量
ENV NODE_ENV=production

# 8. 暴露端口
EXPOSE 3000

# 9. 健康检查
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# 10. 启动命令
CMD ["node", "dist/main.js"]
```

**多阶段构建（减小镜像体积）：**

```dockerfile
# 构建阶段
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# 运行阶段（只包含构建产物）
FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile --prod
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/main.js"]
```

**关键优化点：**

| 优化项 | 做法 | 效果 |
|--------|------|------|
| 基础镜像 | `node:20-alpine`（~50MB）vs `node:20`（~350MB） | 镜像体积减小 6x |
| 多阶段构建 | 构建与运行分开 | 最终镜像不含 devDeps |
| `.dockerignore` | 排除 `node_modules`、`.git` | 减少构建上下文 |
| 非 root 用户 | `USER node` | 安全最佳实践 |
| 依赖安装 | `--frozen-lockfile` | 确保一致性 |
| `NODE_ENV` | 设为 `production` | 跳过 devDeps，启用优化 |

**`.dockerignore` 文件：**

```
node_modules
.git
.gitignore
.env
*.md
coverage
dist
.next
```

**安全加固：**

```dockerfile
# 只读文件系统 + 临时目录
FROM node:20-alpine
# ... 
RUN mkdir -p /app/tmp && chown node:node /app/tmp
USER node
VOLUME ["/app/tmp"]
CMD ["node", "--max-old-space-size=512", "dist/main.js"]
```

**知识点：** `Docker` `多阶段构建` `alpine镜像` `安全加固` `.dockerignore`

:::

---

### Q8: Node.js 应用的内存泄漏如何排查？

> **⭐ 困难 · Node.js**

::: details 点击查看答案与解析

**常见内存泄漏场景：**

| 场景 | 原因 | 示例 |
|------|------|------|
| 全局变量 | 永远不会被 GC | `global.cache[key] = data` |
| 闭包引用 | 闭包持有外层变量 | 事件回调中引用大对象 |
| 事件监听器 | 未移除 listener | `emitter.on()` 不调用 `off()` |
| 定时器 | 未清除 | `setInterval` 没有 `clearInterval` |
| 缓存无上限 | Map/Object 只增不减 | 本地缓存无过期/淘汰 |
| DOM 引用 | 已移除 DOM 仍被引用 | Node 中较少见 |

**排查方法 1：process.memoryUsage() 监控**

```javascript
setInterval(() => {
  const { rss, heapTotal, heapUsed, external } = process.memoryUsage();
  console.log({
    rss: `${(rss / 1024 / 1024).toFixed(2)} MB`,
    heapTotal: `${(heapTotal / 1024 / 1024).toFixed(2)} MB`,
    heapUsed: `${(heapUsed / 1024 / 1024).toFixed(2)} MB`,
    external: `${(external / 1024 / 1024).toFixed(2)} MB`,
  });
}, 10000);
```

**排查方法 2：Heap Snapshot**

```javascript
// 代码中生成堆快照
const v8 = require('v8');
const fs = require('fs');

// 触发快照（如通过 API 端点）
app.get('/debug/heapdump', (req, res) => {
  const fileName = `/tmp/heapdump-${Date.now}.heapsnapshot`;
  v8.writeHeapSnapshot(fileName);
  res.json({ file: fileName });
});
```

然后在 Chrome DevTools 中：`Memory` → `Load` → 打开 `.heapsnapshot` 文件

**排查方法 3：clinic.js**

```bash
# 安装
npm install -g clinic

# 诊断
clinic heapprofiler -- node app.js
# 自动打开报告页面
```

**排查方法 4：--inspect + Chrome DevTools**

```bash
# 启动时开启调试
node --inspect app.js

# Chrome 打开 chrome://inspect → 点击 inspect
# → Memory 标签 → Take Heap Snapshot
# 对比两个时间点的快照
```

**Heap Snapshot 分析步骤：**

1. 拍摄快照 A
2. 执行可能泄漏的操作
3. 等待一段时间
4. 拍摄快照 B
5. 选择 **Comparison** 视图
6. 按 **Delta** 排序，找出增长最多的对象

**常见修复方法：**

```javascript
// ❌ 泄漏：无限缓存
const cache = new Map();
function getData(key) {
  if (!cache.has(key)) {
    cache.set(key, fetchFromDB(key));
  }
  return cache.get(key);
}

// ✅ 修复：LRU 缓存
const LRU = require('lru-cache');
const cache = new LRU({ max: 1000, maxAge: 1000 * 60 * 10 });

// ❌ 泄漏：未移除监听器
function setup() {
  emitter.on('data', handler); // 重复注册不报错！
}

// ✅ 修复：先移除再添加
function setup() {
  emitter.off('data', handler);
  emitter.on('data', handler);
}

// ✅ 修复：使用 once
emitter.once('data', handler);

// ✅ 修复：使用 AbortController
const controller = new AbortController();
emitter.on('data', handler, { signal: controller.signal });
// 需要清理时
controller.abort();
```

**知识点：** `内存泄漏` `HeapSnapshot` `Chrome DevTools` `clinic.js` `LRU缓存`

:::

---

### Q9: 如何监控 Node.js 应用的运行状态？有哪些常用指标？

> **⭐ 中等 · Node.js**

::: details 点击查看答案与解析

**核心监控指标：**

| 类别 | 指标 | 来源 |
|------|------|------|
| **进程** | CPU 使用率 | `process.cpuUsage()` |
| **进程** | 内存使用 | `process.memoryUsage()` |
| **事件循环** | 循环延迟 | `monitorEventLoopDelay()` |
| **事件循环** | 句柄/请求数 | `process._getActiveHandles()` |
| **HTTP** | 请求速率 | 中间件统计 |
| **HTTP** | 响应时间 | 中间件统计 |
| **HTTP** | 错误率 | 中间件统计 |
| **GC** | GC 次数和时长 | `perf_hooks` |
| **系统** | Load Average | `os.loadavg()` |
| **系统** | 空闲内存 | `os.freemem()` |

**Prometheus 集成方案：**

```javascript
const client = require('prom-client');

// 默认指标（CPU、内存、GC 等）
client.collectDefaultMetrics({ register: client.register });

// 自定义指标
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

// 中间件
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    const route = req.route?.path || req.path;
    httpRequestsTotal.inc({ method: req.method, route, status: res.statusCode });
    end({ method: req.method, route, status: res.statusCode });
  });
  next();
});

// 暴露指标端点
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
```

**告警规则示例（Prometheus）：**

```yaml
# 持续高内存
- alert: HighMemory
  expr: process_resident_memory_bytes > 1073741824  # 1GB
  for: 5m

# 事件循环延迟
- alert: EventLoopLag
  expr: nodejs_eventloop_lag_seconds > 1
  for: 2m

# HTTP 错误率
- alert: HighErrorRate
  expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
  for: 3m
```

**可视化工具：**

| 工具 | 用途 |
|------|------|
| Grafana | 指标可视化仪表盘 |
| Prometheus | 指标采集与存储 |
| Jaeger | 分布式链路追踪 |
| ELK Stack | 日志聚合与分析 |

**知识点：** `监控` `Prometheus` `Grafana` `告警` `APM`

:::

---

### Q10: Node.js 的 `--max-old-space-size` 等内存相关参数有什么作用？

> **⭐ 困难 · Node.js**

::: details 点击查看答案与解析

**V8 内存限制：**

| 架构 | 默认堆内存上限 |
|------|---------------|
| 64 位 | ~1.4 GB |
| 32 位 | ~0.7 GB |

**原因：** V8 的 GC 在 1.4GB 堆上，一次 Full GC 需要约 1-2 秒的停顿，更大的堆会严重影响性能。

**常用 V8 内存参数：**

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `--max-old-space-size=SIZE` | ~1.4GB (64-bit) | 老生代内存最大值（最常用） |
| `--max-semi-space-size=SIZE` | ~1MB | 新生代半空间大小 |
| `--max-old-space-size` | — | 设置最大老生代堆大小 |
| `--optimize-for-size` | — | 优先减少内存（可能降低速度） |
| `--max-http-header-size` | 16KB | HTTP 头最大大小 |

**如何设置：**

```bash
# 方法 1：命令行参数
node --max-old-space-size=4096 app.js

# 方法 2：环境变量（NODE_OPTIONS）
export NODE_OPTIONS="--max-old-space-size=4096"
node app.js

# 方法 3：Docker 中设置
docker run -e NODE_OPTIONS="--max-old-space-size=4096" my-app
```

**内存结构简图：**

```
┌─────────────────────────────────────┐
│              V8 Heap                 │
│  ┌─────────────┐ ┌────────────────┐ │
│  │   新生代      │ │    老生代       │ │
│  │  (SemiSpace) │ │ (OldSpace)     │ │
│  │  短存活对象   │ │  长存活对象     │ │
│  │  ~1-2MB     │ │  --max-old-    │ │
│  │             │ │  space-size    │ │
│  └─────────────┘ └────────────────┘ │
└─────────────────────────────────────┘
```

**最佳实践：**

1. **不要盲目增大堆内存** — 更大的堆意味着更长的 GC 停顿
2. **容器部署时，设置合理的内存限制** — 建议容器内存 = 堆大小 × 1.5
3. **优先修复内存泄漏**，而非增大内存
4. **使用 `--inspect` 分析堆**，找出问题根源

```yaml
# Kubernetes 中设置
resources:
  limits:
    memory: "2Gi"
  requests:
    memory: "1Gi"
env:
  - name: NODE_OPTIONS
    value: "--max-old-space-size=1536"  # 1.5GB，容器2G的75%
```

**GC 相关参数：**

```bash
# 暴露 GC 统计信息
node --expose-gc app.js

# 打印 GC 日志
node --trace-gc app.js

# 使用新的 GC 策略
node --gc-interval=100 app.js
```

**知识点：** `V8内存` `max-old-space-size` `GC` `堆内存` `容器部署`

:::