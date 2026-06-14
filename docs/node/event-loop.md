---
title: 事件循环与异步 I/O
description: 深入考察 Node.js 事件循环的六个阶段、与浏览器事件循环的差异、微任务与宏任务执行时机、setImmediate 与 setTimeout 的优先级等核心知识
---

# 事件循环与异步 I/O

### Q1: Node.js 事件循环有哪些阶段？每个阶段的作用是什么？

> **⭐ 简单 · Node.js**

::: details 点击查看答案与解析

Node.js 事件循环由 **libuv** 驱动，分为 **6 个阶段**，每次循环按顺序经过：

```
   ┌───────────────────────────┐
┌─>│         timers             │  ← setTimeout / setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks      │  ← 系统级回调（TCP 错误等）
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare        │  ← 内部使用（libuv 内部）
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll             │  ← I/O 回调（文件读取、网络等）
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check            │  ← setImmediate
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       close callbacks      │  ← socket.on('close')
│  └─────────────┬─────────────┘
│                │
└────────────────┘ ← 进入下一轮循环
```

| 阶段 | 说明 |
|------|------|
| **timers** | 执行 `setTimeout` 和 `setInterval` 的回调 |
| **pending callbacks** | 执行上一轮循环延迟到本轮的 I/O 回调（如 TCP 连接错误） |
| **idle, prepare** | libuv 内部使用，开发者通常不涉及 |
| **poll** | 获取新 I/O 事件，执行 I/O 相关回调。若无回调且无 timers，则阻塞等待 |
| **check** | 执行 `setImmediate` 回调 |
| **close callbacks** | 执行关闭事件的回调，如 `socket.on('close')` |

**每个阶段执行规则：**

- 每个阶段都有自己的 FIFO 队列
- 进入某阶段后，执行该阶段队列中的所有回调（直到队列为空或达到系统限制）
- 当前阶段队列清空后，才进入下一个阶段

**知识点：** `事件循环` `libuv` `六阶段` `timers` `poll` `check`

:::

---

### Q2: Node.js 事件循环和浏览器事件循环有什么区别？

> **⭐ 中等 · Node.js**

::: details 点击查看答案与解析

| 维度 | 浏览器 | Node.js |
|------|--------|---------|
| 规范 | HTML5 规范 | libuv 实现 |
| 宏任务队列 | 1 个 FIFO 队列 | 按阶段分为多个队列 |
| 微任务队列 | 2 个：`Promise.then` / `MutationObserver` | 2 个：`process.nextTick` / `Promise.then` |
| `setImmediate` | ❌ 不存在 | ✅ check 阶段执行 |
| `process.nextTick` | ❌ 不存在 | ✅ 最高优先级微任务 |
| 微任务执行时机 | 每个宏任务之后 | 每个阶段切换之间（乃至每个回调之后） |
| requestAnimationFrame | ✅ 渲染前执行 | ❌ 不存在 |

**关键差异 1：微任务优先级**

```javascript
// Node.js 中
Promise.resolve().then(() => console.log('Promise'));
process.nextTick(() => console.log('nextTick'));
// 输出：nextTick → Promise
// nextTick 优先级高于 Promise
```

**关键差异 2：微任务插入时机**

```javascript
// Node.js 11+ 行为（与浏览器趋同）
setTimeout(() => {
  console.log('timer1');
  Promise.resolve().then(() => console.log('promise1'));
}, 0);

setTimeout(() => {
  console.log('timer2');
}, 0);

// Node 11+ 输出（与浏览器一致）：
// timer1 → promise1 → timer2

// Node 10 及以下输出：
// timer1 → timer2 → promise1
```

> **Node 11+** 改为每个宏任务回调执行后立即清空微任务队列，与浏览器行为对齐。

**关键差异 3：宏任务的分类方式不同**

- 浏览器：所有宏任务放在同一个队列，先入先出
- Node.js：按阶段分类，不同类型的回调在不同阶段执行

**知识点：** `事件循环差异` `微任务` `宏任务` `nextTick` `Node 11+`

:::

---

### Q3: `setImmediate` 和 `setTimeout(fn, 0)` 有什么区别？

> **⭐ 中等 · Node.js**

::: details 点击查看答案与解析

| 对比项 | `setImmediate` | `setTimeout(fn, 0)` |
|--------|----------------|---------------------|
| 所属阶段 | **check** 阶段 | **timers** 阶段 |
| 设计目的 | 在 I/O 事件后立即执行 | 延迟最少 1ms 后执行 |
| 最小延迟 | 无额外延迟 | 受 `1ms` 最小值限制 |

**执行顺序取决于调用上下文：**

```javascript
// 场景 1：主模块中调用 — 顺序不确定！
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
// 结果取决于进程性能，可能是 timeout → immediate
// 也可能是 immediate → timeout
```

```javascript
// 场景 2：在 I/O 回调中调用 — setImmediate 一定先执行
const fs = require('fs');

fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});
// 结果一定是：immediate → timeout
// 因为 I/O 回调在 poll 阶段，接下来是 check 阶段（setImmediate）
// 而不是回到 timers 阶段（setTimeout）
```

**原因分析：**

```
I/O 回调执行完毕（poll 阶段）
  → 进入 check 阶段 → 执行 setImmediate
  → 回到 timers 阶段 → 执行 setTimeout
```

**实际建议：**

- 在 I/O 回调中想尽快执行 → 用 `setImmediate`（语义更明确）
- 需要延迟执行 → 用 `setTimeout`
- 主模块中两者顺序不可靠 → 不要依赖执行顺序

**知识点：** `setImmediate` `setTimeout` `check阶段` `timers阶段` `I/O回调`

:::

---

### Q4: `process.nextTick` 和 `Promise.then` 的区别是什么？为什么 nextTick 优先级更高？

> **⭐ 中等 · Node.js**

::: details 点击查看答案与解析

两者都属于**微任务**，但 `process.nextTick` 的优先级更高。

| 对比项 | `process.nextTick` | `Promise.then` |
|--------|--------------------|----------------|
| 队列 | nextTick 队列 | 微任务队列（microtask queue） |
| 优先级 | 更高（先执行） | 较低（后执行） |
| 来源 | Node.js 特有 | ES 规范 |
| 执行时机 | 当前操作完成后、事件循环继续之前 | nextTick 队列清空后 |

```javascript
process.nextTick(() => console.log('nextTick 1'));
Promise.resolve().then(() => console.log('promise 1'));
process.nextTick(() => console.log('nextTick 2'));
Promise.resolve().then(() => console.log('promise 2'));

// 输出：
// nextTick 1
// nextTick 2
// promise 1
// promise 2
```

**为什么 nextTick 优先级更高？**

1. **历史原因**：`process.nextTick` 出现得比 Promise 早，是为了在当前调用栈清空后立即执行回调
2. **设计目的**：`nextTick` 用于保证回调在事件循环继续之前执行（如清理资源、错误处理）
3. **V8 的 Promise 微任务** 由引擎管理，而 `nextTick` 由 Node.js 自身管理，Node.js 选择先处理自己的队列

**⚠️ nextTick 的陷阱：**

```javascript
// ❌ nextTick 饥饿：永远不会执行 promise
function recursiveNextTick() {
  process.nextTick(() => {
    console.log('nextTick');
    recursiveNextTick();
  });
}
recursiveNextTick();
// Promise 永远无法执行——nextTick 队列不会被清空
```

**最佳实践：**

- 优先使用 `Promise.resolve().then()` 而非 `process.nextTick()`
- 只有在需要保证回调在事件循环继续之前执行时，才使用 `nextTick`
- `nextTick` 适用于：错误处理、资源清理、保证同步语义

**知识点：** `process.nextTick` `Promise微任务` `微任务优先级` `饥饿问题`

:::

---

### Q5: poll 阶段的运行机制是什么？它在什么情况下会阻塞？

> **⭐ 困难 · Node.js**

::: details 点击查看答案与解析

poll 阶段是事件循环的核心，负责**获取新的 I/O 事件并执行 I/O 相关回调**。

**poll 阶段的行为逻辑：**

```
进入 poll 阶段
  │
  ├─ poll 队列有回调？
  │     └─ 是 → 执行队列中的回调（达到系统限制后停止）
  │
  └─ poll 队列为空？
        │
        ├─ 有 setImmediate 回调？
        │     └─ 是 → 结束 poll，进入 check 阶段
        │
        ├─ 有 timers 回调？
        │     └─ 是 → 结束 poll，回到 timers 阶段
        │
        └─ 都没有？
              └─ 阻塞等待 I/O 事件到来（最大阻塞时间由最近的 timer 决定）
```

**三种情况详解：**

1. **poll 队列非空** → 依次执行回调
2. **poll 队列为空且有 setImmediate** → 立即进入 check 阶段
3. **poll 队列为空，无 setImmediate，有 timers** → 阻塞等待直到最近的 timer 触发时间
4. **poll 队列为空，无 setImmediate，无 timers** → 阻塞等待直到有 I/O 事件

```javascript
// 情况 3 示例：poll 阶段会阻塞到 timer 触发
const start = Date.now();
setTimeout(() => {
  console.log(`timer: ${Date.now() - start}ms`);
}, 1000);

// poll 阶段无 I/O 回调，会阻塞约 1000ms 等待 timer
```

```javascript
// 情况 2 示例：有 setImmediate 时 poll 不会阻塞
fs.readFile(__filename, () => {
  // 在 I/O 回调中注册 setImmediate
  setImmediate(() => console.log('immediate'));
  // poll 阶段检测到有 setImmediate → 立即进入 check 阶段
});
```

**`uv_backend_timeout` 的作用：**

libuv 通过 `uv_backend_timeout()` 计算 poll 阻塞的最大时长：

- 有即将到期的 timer → 返回剩余时间
- 有活跃的 handle 但无 timer → 返回 -1（无限阻塞）
- 无任何活跃 handle → 返回 0（不阻塞，退出循环）

**知识点：** `poll阶段` `阻塞机制` `libuv` `uv_backend_timeout` `事件循环调度`

:::

---

### Q6: 请分析以下代码的输出顺序，并解释原因。

> **⭐ 困难 · Node.js**

::: details 点击查看答案与解析

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => console.log('3'));
  process.nextTick(() => console.log('4'));
}, 0);

new Promise((resolve) => {
  console.log('5');
  resolve();
}).then(() => {
  console.log('6');
  setTimeout(() => console.log('7'), 0);
});

process.nextTick(() => {
  console.log('8');
  Promise.resolve().then(() => console.log('9'));
});

setImmediate(() => console.log('10'));

console.log('11');
```

**输出：**

```
1 → 5 → 11 → 8 → 9 → 6 → 2 → 4 → 3 → 7 → 10
```

**逐步解析：**

**第一轮（同步代码）：**

| 步骤 | 代码 | 输出 | 说明 |
|------|------|------|------|
| 1 | `console.log('1')` | 1 | 同步 |
| 2 | `new Promise(executor)` | 5 | Promise 构造函数是同步执行 |
| 3 | `console.log('11')` | 11 | 同步 |

注册的异步任务：
- timers 队列：`setTimeout → '2'`
- nextTick 队列：`() => '8'`
- microtask 队列：`() => '6'`
- check 队列：`() => '10'`

**清空微任务（nextTick 优先）：**

| 步骤 | 回调 | 输出 | 新注册任务 |
|------|------|------|-----------|
| 4 | nextTick `() => '8'` | 8 | 注册 Promise.then `'9'` |
| 5 | Promise.then `'9'` | 9 | — |
| 6 | Promise.then `'6'` | 6 | 注册 setTimeout `'7'` |

**进入 timers 阶段（setTimeout '2'）：**

| 步骤 | 回调 | 输出 | 新注册任务 |
|------|------|------|-----------|
| 7 | `() => '2'` | 2 | 注册 Promise.then `'3'`、nextTick `'4'` |
| 8 | nextTick `'4'` | 4 | — |
| 9 | Promise.then `'3'` | 3 | — |

**再次进入 timers 阶段（setTimeout '7'）：**

| 步骤 | 回调 | 输出 |
|------|------|------|
| 10 | `() => '7'` | 7 |

**进入 check 阶段（setImmediate '10'）：**

| 步骤 | 回调 | 输出 |
|------|------|------|
| 11 | `() => '10'` | 10 |

**知识点：** `事件循环` `执行顺序` `nextTick优先级` `微任务` `宏任务`

:::

---

### Q7: Node.js 的异步 I/O 是如何实现的？为什么说它是"非阻塞"的？

> **⭐ 中等 · Node.js**

::: details 点击查看答案与解析

**异步 I/O 的本质：** 应用程序发起 I/O 请求后**不需要等待完成**，可以继续执行后续代码；I/O 完成后由系统通知，事件循环在 poll 阶段将回调加入队列执行。

**实现机制（以文件读取为例）：**

```
JavaScript 调用 fs.readFile()
  │
  ▼
Node C++ Bindings (fs.binding)
  │
  ▼
libuv 发起 I/O 请求
  │
  ├─ 网络 I/O → epoll(Linux) / kqueue(macOS) / IOCP(Windows)
  │              → 由操作系统异步完成，事件循环监听
  │
  └─ 文件 I/O → 提交到 libuv 线程池
                 → 工作线程完成 I/O
                 → 通知事件循环
  │
  ▼
事件循环 poll 阶段执行回调
  │
  ▼
JavaScript 回调被执行
```

**"非阻塞"的三层含义：**

1. **JavaScript 主线程不阻塞** — I/O 请求发出后立即返回，主线程继续执行
2. **操作系统层面不阻塞** — 网络 I/O 利用 epoll/kqueue/IOCP 实现真正异步
3. **文件 I/O 用线程池模拟** — 因为多数 OS 不提供异步文件 I/O API，libuv 用线程池实现"伪异步"

```javascript
// 非阻塞 I/O 示例
console.log('开始读取');
fs.readFile('large.txt', (err, data) => {
  console.log('读取完成');  // 回调在 I/O 完成后执行
});
console.log('继续执行');    // 主线程不等待，立即执行

// 输出顺序：
// 开始读取 → 继续执行 → 读取完成
```

**libuv 线程池：**

| 配置 | 默认值 | 说明 |
|------|--------|------|
| `UV_THREADPOOL_SIZE` | 4 | 线程池大小，最大 128 |
| 处理类型 | — | 文件 I/O、DNS lookup、用户自定义任务 |
| 网络I/O | 不经过线程池 | 直接使用系统异步 I/O |

```bash
# 增大线程池
UV_THREADPOOL_SIZE=8 node app.js
```

**知识点：** `异步I/O` `libuv` `epoll` `线程池` `非阻塞`

:::

---

### Q8: 微任务在 Node.js 中的执行时机是什么？和宏任务的关系如何？

> **⭐ 中等 · Node.js**

::: details 点击查看答案与解析

**微任务队列结构（优先级从高到低）：**

```
┌──────────────────────┐
│  nextTick Queue      │  ← process.nextTick 注册的回调
├──────────────────────┤
│  Microtask Queue     │  ← Promise.then / queueMicrotask 注册的回调
└──────────────────────┘
```

**执行规则：**

1. 每个宏任务（或事件循环每个阶段的每个回调）执行后，**先清空 nextTick 队列，再清空 Microtask 队列**
2. 微任务执行过程中产生的新微任务，也会在本轮清空
3. `process.nextTick` 始终在 `Promise.then` 之前执行

```
宏任务回调执行完毕
  │
  ▼
清空 nextTick 队列（全部执行完）
  │
  ▼
清空 Microtask 队列（全部执行完）
  │
  ▼
执行下一个宏任务回调
```

**代码验证：**

```javascript
setTimeout(() => {
  console.log('A');
  
  process.nextTick(() => {
    console.log('B');
    process.nextTick(() => console.log('C'));
  });
  
  Promise.resolve().then(() => {
    console.log('D');
    Promise.resolve().then(() => console.log('E'));
  });
  
  console.log('F');
}, 0);

// 输出：A → F → B → C → D → E
// 解析：同步 A,F → nextTick B(注册C),C → Promise D(注册E),E
```

**Node.js 版本差异：**

| 版本 | 微任务执行时机 |
|------|---------------|
| Node ≤ 10 | 每个阶段结束后（而非每个回调后）清空微任务 |
| Node ≥ 11 | 每个宏任务回调后立即清空微任务（与浏览器一致） |

```javascript
// Node 10 及以下
setTimeout(() => { console.log('1'); Promise.resolve().then(() => console.log('2')); }, 0);
setTimeout(() => { console.log('3'); }, 0);
// 输出：1 → 3 → 2（两个 timer 回调都执行完才清微任务）

// Node 11+
// 输出：1 → 2 → 3（每个宏任务回调后立即清微任务）
```

**知识点：** `微任务` `宏任务` `nextTick优先级` `执行时机` `Node版本差异`

:::

---

### Q9: 什么是事件循环的 `unhandledRejection` 和 `uncaughtException`？如何正确处理？

> **⭐ 困难 · Node.js**

::: details 点击查看答案与解析

两者都是 Node.js 全局错误事件，未处理会导致进程退出。

| 事件 | 触发条件 | 默认行为 |
|------|----------|----------|
| `uncaughtException` | 同步代码抛出异常未被捕获 | 打印错误 + 进程退出（exit code 1） |
| `unhandledRejection` | Promise 被 reject 但没有 `.catch()` | Node 15+ 默认进程退出（之前仅警告） |

**uncaughtException 处理：**

```javascript
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  // ⚠️ 不要继续运行！
  // 进程可能处于不确定状态
  process.exit(1);
});

// 更安全的做法：记录日志后重启
process.on('uncaughtException', (err) => {
  logger.fatal('uncaughtException', err);
  process.exit(1);  // 让 PM2/systemd 等进程管理器重启
});
```

**unhandledRejection 处理：**

```javascript
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason);
  // 建议：记录日志并退出
  logger.error('unhandledRejection', { reason, stack: reason?.stack });
  process.exit(1);
});
```

**最佳实践：**

1. **不要把 `uncaughtException` 当作 try-catch 的替代品** — 它是最后的防线
2. **监听后仍应退出进程** — 异常后状态不可预测，继续运行可能产生更多错误
3. **使用 PM2 等工具自动重启** — 退出后由进程管理器拉起
4. **async/await + try-catch 是更优方案**

```javascript
// ✅ 推荐：Express 错误处理中间件
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ✅ 推荐：async 路由的高阶函数
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

app.get('/data', asyncHandler(async (req, res) => {
  const data = await fetchData();
  res.json(data);
}));
```

**Node 15+ 的变化：**

```bash
# Node 15 之前：unhandledRejection 只发出警告
# Node 15+：unhandledRejection 默认导致进程退出（exit code 1）

# 可回退旧行为（不推荐）
node --unhandled-rejections=warn app.js
```

**知识点：** `uncaughtException` `unhandledRejection` `错误处理` `进程退出` `PM2`

:::

---

### Q10: 如何检测和监控 Node.js 事件循环的延迟？

> **⭐ 困难 · Node.js**

::: details 点击查看答案与解析

事件循环延迟（Event Loop Lag）是衡量 Node.js 健康状态的关键指标。延迟越大，说明主线程被阻塞越严重。

**方法 1：手动监测**

```javascript
// 最简单的延迟检测
setInterval(() => {
  const start = Date.now();
  setImmediate(() => {
    const lag = Date.now() - start;
    if (lag > 100) {
      console.warn(`事件循环延迟: ${lag}ms`);
    }
  });
}, 1000);
```

**方法 2：`perf_hooks`（Node 16+）**

```javascript
const { performance, monitorEventLoopDelay } = require('perf_hooks');

// 获取事件循环延迟统计
const histogram = monitorEventLoopDelay({
  resolution: 10  // 采样精度（ms）
});
histogram.enable();

// 定期读取
setInterval(() => {
  console.log({
    min: histogram.min,
    max: histogram.max,
    mean: histogram.mean,
    p50: histogram.percentile(50),
    p90: histogram.percentile(90),
    p99: histogram.percentile(99),
  });
  histogram.reset();
}, 10000);
```

**方法 3：APM 工具集成**

| 工具 | 监控方式 |
|------|----------|
| **New Relic** | 自动采集事件循环延迟 |
| **Datadog** | `dogstatsd` + 自定义 histogram |
| **Prometheus** | `nodejs_eventloop_lag_seconds` 指标 |
| **Clinic.js** | 开发时性能分析工具 |

```javascript
// Prometheus 暴露指标
const client = require('prom-client');
const histogram = monitorEventLoopDelay({ resolution: 10 });
histogram.enable();

const eventLoopLag = new client.Histogram({
  name: 'nodejs_eventloop_lag_seconds',
  help: 'Event loop lag in seconds',
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

setInterval(() => {
  eventLoopLag.observe(histogram.mean / 1000);
}, 5000);
```

**延迟的常见原因与解决方案：**

| 原因 | 解决方案 |
|------|----------|
| 大量 JSON.parse/stringify | 使用流式解析或 `worker_threads` |
| 正则表达式回溯 | 限制正则复杂度，使用 `re2` 库 |
| 同步文件 I/O | 使用 `fs.promises` 异步 API |
| 复杂计算 | 拆分任务或移到 `worker_threads` |
| 大量 `nextTick` 递归 | 改用 `setImmediate` 或 Promise |

**知识点：** `事件循环延迟` `monitorEventLoopDelay` `perf_hooks` `性能监控` `APM`

:::
---

### Q11: Node.js 中 process.nextTick 为什么优先于 Promise.then？

> **🔥 中等 · 事件循环**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**process.nextTick 在当前操作完成后立即执行，优先级高于 Promise 微任务。**

**1. 执行顺序：**

```text
事件循环优先级：
1. 当前同步代码
2. process.nextTick 队列 ← 优先清空
3. 微任务队列（Promise.then）
4. 宏任务（setTimeout）

示例代码：
console.log('1');
Promise.resolve().then(() => console.log('2'));
process.nextTick(() => console.log('3'));
console.log('4');

输出：1, 4, 3, 2
```

**2. 为什么 nextTick 优先级更高：**

```javascript
// 设计原因：
// 1. nextTick 不允许 I/O，仅用于纯回调
// 2. Promise 可能包含 I/O 操作
// 3. nextTick 要立即处理当前逻辑

// 原始意图：
// - nextTick：阻止 I/O 开始前的回调
// - Promise：异步操作完成后的回调
```

**3. nextTick 队列机制：**

```text
nextTick 队列为空条件：
1. 执行 nextTick 回调
2. 回调中可能有新的 nextTick
3. 递归执行直到队列空
4. 再执行 Promise 微任务

代码验证：
process.nextTick(() => {
  console.log('nextTick 1');
  process.nextTick(() => {
    console.log('nextTick 2');
  });
});

Promise.resolve().then(() => {
  console.log('Promise 1');
});

// 输出：nextTick 1, nextTick 2, Promise 1
```

**4. 使用场景：**

```javascript
// nextTick：立即执行的回调
function emit(event) {
  const handlers = getHandlers(event);
  handlers.forEach(h => {
    process.nextTick(h); // 同步事件异步化
  });
}

// Promise：异步操作完成后
fetch(url)
  .then(res => res.json())
  .then(data => console.log(data));
```

**5. 陷阱：**

```javascript
// 会阻塞事件循环
process.nextTick(function tick() {
  process.nextTick(tick);
  // 无限递归，I/O 被阻塞
});
```

**知识点：** `process.nextTick` `事件循环` `优先级` `微任务`

:::

---

### Q12: Node.js 事件循环中 poll 阶段的行为是什么？

> **🔥 中等 · 事件循环**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**poll 阶段处理 I/O 回调，是事件循环中最关键的阶段。**

**1. poll 阶段职责：**

```text
poll 阶段：
1. 计算应等待多久
2. 处理 poll 队列回调
3. 如果队列空：
   - 有 setImmediate：进入 check
   - 无定时器：阻塞等待新 I/O
   - 有定时器：进入 timers
```

**2. poll 阻塞行为：**

```javascript
const fs = require('fs');

// 模拟阻塞
fs.readFile('/dev/random', (err, data) => {
  // 这个回调在 poll 阶段执行
  console.log('读取完成');
});

// poll 会阻塞等待 I/O
// 除非有 setImmediate 或定时器到期
```

**3. 与 setImmediate 交互：**

```javascript
const fs = require('fs');

fs.readFile('file.txt', () => {
  console.log('I/O 完成');
  setImmediate(() => {
    console.log('immediate');
  });
  setTimeout(() => {
    console.log('timeout');
  }, 0);
});

// 输出：I/O 完成, immediate, timeout
// immediate 在 check 阶段优先
```

**4. 特殊 poll 行为：**

```text
条件 1：有 setImmediate 回调
- poll 阶段不阻塞
- 直接到 check 阶段

条件 2：有 timer 即将到期
- poll 可能提前退出
- 进入 timers 阶段

条件 3：poll 队列空
- 阻塞等待新 I/O
- 或被 setImmediate 打断
```

**5. 实战理解：**

```javascript
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));

// 输出不确定！
// - 启动时 timer 队列有 0delay
// - timers 先执行：timeout, immediate
// - poll 先执行：immediate, timeout
```

**知识点：** `poll` `I/O回调` `事件循环` `阻塞` `setImmediate`

:::
