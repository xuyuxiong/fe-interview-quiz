---
title: 异步编程基础
description: 回调地狱、Promise 基础、链式调用、错误处理、Promise 组合方法、async/await 等核心面试题
---

# 异步编程基础

异步编程是 JavaScript 的核心特性之一。从回调函数到 Promise，再到 async/await，理解这些演进对于编写现代 JavaScript 代码至关重要。

---

## 📝 题目

### Q1: 什么是回调地狱？如何解决？

> **⭐ 简单 · JavaScript**

```js
// 回调地狱示例
getData(function(a) {
  getMoreData(a, function(b) {
    getMoreData(b, function(c) {
      getMoreData(c, function(d) {
        console.log('Done:', d);
      });
    });
  });
});
```

这段代码有什么问题？如何改进？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**问题：**
1. 代码嵌套层级深，难以阅读
2. 错误处理困难
3. 逻辑流程不清晰
4. 难以维护和调试

**解决方案 1：Promise 链式调用**
```js
getData()
  .then(a => getMoreData(a))
  .then(b => getMoreData(b))
  .then(c => getMoreData(c))
  .then(d => console.log('Done:', d))
  .catch(err => console.error(err));
```

**解决方案 2：async/await**
```js
async function fetchData() {
  try {
    const a = await getData();
    const b = await getMoreData(a);
    const c = await getMoreData(b);
    const d = await getMoreData(c);
    console.log('Done:', d);
  } catch (err) {
    console.error(err);
  }
}
```

**知识点：** `回调地狱` `Promise 链` `async/await`

:::

---

### Q2: Promise 的三种状态是什么？

> **⭐ 简单 · JavaScript**

请说明 Promise 的状态及其转换规则。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**三种状态：**
1. **pending（进行中）**：初始状态
2. **fulfilled（已成功）**：操作成功完成
3. **rejected（已失败）**：操作失败

**状态转换规则：**
```
pending → fulfilled  (通过 resolve)
pending → rejected   (通过 reject)
```

**特点：**
- 状态转换是**单向**的，只能从 pending 变为 fulfilled 或 rejected
- 状态一旦改变就**不可逆转**
- 状态改变后，再次调用 resolve/reject 无效

**示例：**
```js
const p = new Promise((resolve, reject) => {
  resolve('success');
  reject('error');  // 无效，状态已改变
});

p.then(value => console.log(value));  // 'success'
```

**知识点：** `Promise 状态` `状态转换` `不可逆`

:::

---

### Q3: 如何实现 Promise 链式调用？

> **🔥 中等 · JavaScript**

```js
function getData() {
  return Promise.resolve(1);
}

getData()
  .then(value => {
    console.log(value);
    return value + 1;
  })
  .then(value => {
    console.log(value);
    return Promise.resolve(value + 1);
  })
  .then(value => {
    console.log(value);
  });
```

输出是什么？为什么 can return 普通值和 Promise？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
1
2
3
```

**💡 解析：**
**then 的返回值规则：**
1. 返回普通值 → 自动包装为 Promise.resolve(value)
2. 返回 Promise → 直接使用该 Promise
3. 抛出异常 → 变为 Promise.reject(error)

**链式调用原理：**
```js
Promise.prototype.then = function(onFulfilled, onRejected) {
  return new Promise((resolve, reject) => {
    // ...处理回调
    // 根据返回值决定下一个 Promise 的状态
  });
};
```

**每个 then 都返回新的 Promise**，所以可以无限链式调用。

**知识点：** `Promise 链` `then 返回值` `链式调用`

:::

---

### Q4: Promise 错误处理有几种方式？

> **⭐ 简单 · JavaScript**

```js
// 方式 1
promise.then(
  value => console.log(value),
  error => console.error(error)
);

// 方式 2
promise.then(
  value => console.log(value)
).catch(error => console.error(error));

// 方式 3
promise.then(
  value => console.log(value)
).finally(() => console.log('cleanup'));
```

这三种方式有什么区别？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**💡 解析：**

**方式 1：then 的第二个参数**
- 只捕获当前 Promise 的错误
- 如果 then 回调中抛出错误，不会被捕获

**方式 2：catch 方法**
- 捕获前面所有 Promise 的错误
- 推荐写法，更清晰

**方式 3：finally 方法**
- 无论成功失败都会执行
- 通常用于清理操作
- finally 的回调不接收参数

**最佳实践：**
```js
async function fetchData() {
  try {
    const data = await api.getData();
    console.log(data);
  } catch (error) {
    console.error('请求失败:', error);
  } finally {
    hideLoading();
  }
}
```

**知识点：** `Promise 错误处理` `catch` `finally`

:::

---

### Q5: Promise.all、Promise.race、Promise.allSettled 有什么区别？

> **🔥 中等 · JavaScript**

请说明以下方法的区别和使用场景：
- Promise.all
- Promise.race
- Promise.allSettled
- Promise.any

::: details 🔍 点击查看答案与解析

**✅ 答案：**

| 方法 | 成功条件 | 失败条件 | 返回值 |
|------|---------|---------|--------|
| Promise.all | 全部成功 | 任一失败 | 成功结果数组 |
| Promise.race | 任一完成 | 任一失败 | 第一个结果 |
| Promise.allSettled | 全部完成 | 永不失败 | 状态数组 |
| Promise.any | 任一成功 | 全部失败 | 第一个成功 |

**示例对比：**
```js
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);
const p3 = Promise.reject('error');

// all - 一个失败就全部失败
Promise.all([p1, p2, p3]).catch(e => console.log(e)); // 'error'

// race - 最快的一个
Promise.race([p1, p2]).then(v => console.log(v)); // 1

// allSettled - 等待全部完成
Promise.allSettled([p1, p2, p3]).then(results => {
  console.log(results);
  // [{status:'fulfilled',value:1}, {status:'fulfilled',value:2}, {status:'rejected',reason:'error'}]
});

// any - 一个成功就成功
Promise.any([p3, p1]).then(v => console.log(v)); // 1
```

**使用场景：**
- **all**: 并行请求多个接口，都成功才继续
- **race**: 请求超时控制
- **allSettled**: 需要知道每个请求的结果
- **any**: 多个备用接口，任意一个成功即可

**知识点：** `Promise 组合方法` `并行处理` `错误处理`

:::

---

### Q6: async/await 的本质是什么？

> **🔥 中等 · JavaScript**

```js
async function foo() {
  return 42;
}

const result = foo();
console.log(result instanceof Promise);
```

输出是什么？async/await 的本质是什么？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
true
```

**💡 解析：**
**async/await 本质：**
- `async` 函数**总是返回 Promise**
- `await` 是**语法糖**，底层还是 Promise
- async/await 可以用 Generator + Promise 实现

**转换关系：**
```js
// async/await
async function fetchData() {
  const a = await getData();
  const b = await getMoreData(a);
  return b;
}

// 等价于 Generator
function fetchData() {
  return getData()
    .then(a => getMoreData(a))
    .then(b => b);
}
```

**特点：**
1. async 函数返回 Promise
2. await 只能在 async 函数中使用
3. await 等待 Promise 完成
4. 可以用 try/catch 捕获 await 错误

**知识点：** `async/await` `Promise 语法糖` `异步同步化`

:::

---

### Q7: 如何用 Promise 实现并发控制？

> **💀 困难 · JavaScript**

请实现一个并发控制函数，限制同时执行的异步任务数量。

```js
// 期望效果
const limit = concurrencyLimit(3);  // 最多同时执行 3 个

const tasks = [
  () => delay(100).then(() => 'task1'),
  () => delay(200).then(() => 'task2'),
  // ... 更多任务
];

const results = await Promise.all(tasks.map(limit));
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```js
function concurrencyLimit(limit) {
  const queue = [];
  let running = 0;
  
  function next() {
    if (running < limit && queue.length > 0) {
      running++;
      const { task, resolve } = queue.shift();
      task()
        .then(resolve)
        .finally(() => {
          running--;
          next();
        });
    }
  }
  
  return function(task) {
    return new Promise(resolve => {
      queue.push({ task, resolve });
      next();
    });
  };
}

// 使用示例
async function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

const limit = concurrencyLimit(3);
const tasks = Array.from({ length: 10 }, (_, i) => 
  () => delay(100).then(() => `task${i}`)
);

Promise.all(tasks.map(limit)).then(console.log);
```

**💡 解析：**
**实现思路：**
1. 维护一个任务队列
2. 记录当前正在运行的任务数
3. 只有当运行数小于限制时才执行新任务
4. 任务完成后触发下一个任务

**知识点：** `并发控制` `Promise 队列` `限流`

:::

---

### Q8: 如何实现异步迭代器？

> **💀 困难 · JavaScript**

请实现一个异步迭代器，可以快速生成数据用于测试。

```js
const asyncIterable = {
  async *[Symbol.asyncIterator]() {
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 100));
      yield i;
    }
  }
};

// 如何使用？
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```js
// 方式 1：for await...of 循环
(async () => {
  for await (const value of asyncIterable) {
    console.log(value);  // 0, 1, 2, 3, 4
  }
})();

// 方式 2：手动迭代
(async () => {
  const iterator = asyncIterable[Symbol.asyncIterator]();
  let result;
  while (!(result = await iterator.next()).done) {
    console.log(result.value);
  }
})();
```

**💡 解析：**
**异步迭代器协议：**
- 对象实现 `Symbol.asyncIterator` 方法
- 返回迭代器对象
- 迭代器有 `next()` 方法，返回 Promise
- Promise resolve 的对象包含 `{ value, done }`

**使用场景：**
- 流式数据处理
- 分页数据获取
- WebSocket 消息处理

**示例：分页获取数据**
```js
async function* fetchDataPages() {
  let page = 1;
  while (true) {
    const data = await fetch(`/api/data?page=${page}`);
    if (data.length === 0) break;
    yield data;
    page++;
  }
}
```

**知识点：** `异步迭代器` `for await...of` `Generator`

:::

---

### Q9: 实现 Promise.race 的超时控制

> **🔥 中等 · JavaScript**

请实现一个带超时的请求函数。

```js
function fetchWithTimeout(url, timeout = 5000) {
  // 实现带超时的 fetch
}
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```js
function fetchWithTimeout(url, timeout = 5000) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('请求超时')), timeout);
  });
  
  return Promise.race([
    fetch(url),
    timeoutPromise
  ]);
}

// 使用示例
fetchWithTimeout('/api/data', 3000)
  .then(response => response.json())
  .catch(error => console.error(error));
```

**💡 解析：**
**原理：**
- 创建一个超时的 Promise
- 使用 Promise.race 竞争
- 先完成的决定最终结果

**现代写法（AbortController）：**
```js
async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

**知识点：** `Promise.race` `超时控制` `AbortController`

:::

---

### Q10: async/await 中如何正确处理并发？

> **🔥 中等 · JavaScript**

```js
// 串行执行（慢）
async function fetchSequential() {
  const user = await fetchUser();
  const posts = await fetchPosts(user.id);
  const comments = await fetchComments(posts[0].id);
  return { user, posts, comments };
}

// 如何改为并发执行？
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```js
// 方式 1：Promise.all 并发
async function fetchParallel() {
  const [{ user }, posts] = await Promise.all([
    fetchUser(),
    fetchPosts()
  ]);
  const comments = await fetchComments(posts[0].id);
  return { user, posts, comments };
}

// 方式 2：不 await 直接开始
async function fetchOptimized() {
  const userPromise = fetchUser();
  const postsPromise = fetchPosts();
  
  const user = await userPromise;
  const posts = await postsPromise;
  
  const comments = await fetchComments(posts[0].id);
  return { user, posts, comments };
}
```

**💡 解析：**
**性能对比：**
- **串行**：总时间 = t1 + t2 + t3
- **并发**：总时间 = max(t1, t2) + t3

**注意事项：**
```js
// ❌ 错误：forEach 中的 await 不会等待
items.forEach(async item => {
  await process(item);
});

// ✅ 正确：使用 Promise.all
await Promise.all(items.map(item => process(item)));
```

**知识点：** `并发处理` `Promise.all` `性能优化`

:::

---

## 🔑 核心知识点总结

### 1. 异步演进历程

```
回调函数 → Promise → Generator → async/await
```

### 2. Promise 状态

| 状态 | 说明 | 转换 |
|------|------|------|
| pending | 进行中 | → fulfilled/rejected |
| fulfilled | 成功 | 终态 |
| rejected | 失败 | 终态 |

### 3. 组合方法

| 方法 | 特点 |
|------|------|
| all | 全成功才成功 |
| race | 最快完成 |
| allSettled | 全部完成，记录状态 |
| any | 一个成功就成功 |

### 4. async/await 要点

- async 返回 Promise
- await 阻塞当前 async 函数
- try/catch 捕获错误
- 可配合 Promise.all 并发

## 💡 面试技巧

1. **手写 Promise**：掌握 then 链式调用
2. **并发控制**：常考的实际场景
3. **错误处理**：知道 catch 和 try/catch 的用法
4. **性能优化**：串行 vs 并发的区别
5. **超时控制**：Race 模式的实际应用
---

### Q11: postMessage API 能否跨域通信？原理是什么？

> **🔥 中等 · 浏览器**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**postMessage 可以跨域通信**，是 HTML5 提供的安全跨窗口通信 API。

**跨域通信场景：**
- 父页面与 iframe（不同源）
- 窗口与 popup
- Service Worker 与主线程
- Web Worker 与主线程

**基本原理：**
```js
// 发送方（父页面）
const iframe = document.querySelector('iframe');
iframe.contentWindow.postMessage(
  { type: 'REQUEST', data: 'Hello' },  // 消息内容
  'https://child.example.com'          // 目标源（*表示任意）
);

// 接收方（子页面）
window.addEventListener('message', (event) => {
  // 1. 验证来源（安全关键！）
  if (event.origin !== 'https://parent.example.com') return;
  
  // 2. 处理消息
  console.log('收到消息:', event.data);
  
  // 3. 回复
  event.source.postMessage(
    { type: 'RESPONSE', data: 'Hi back!' },
    event.origin
  );
});
```

**MessageEvent 对象属性：**
```js
interface MessageEvent {
  data: any;          // 消息数据（结构化克隆）
  origin: string;     // 发送方源
  source: WindowProxy;// 发送方窗口引用
  ports: MessagePort[];// 消息通道（Channel Messaging）
}
```

**安全最佳实践：**
```js
// ❌ 错误：不验证来源
window.addEventListener('message', (e) => {
  process(e.data);  // 可能被恶意页面利用
});

// ✅ 正确：验证来源
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://trusted.com') return;
  process(e.data);
});

// ✅ 更安全：验证消息格式
if (
  e.origin === 'https://trusted.com' &&
  typeof e.data === 'object' &&
  e.data.type === 'EXPECTED_TYPE'
) {
  process(e.data.payload);
}
```

**Channel Messaging（更高效的通信）：**
```js
// 父页面
const channel = new MessageChannel();
iframe.contentWindow.postMessage(
  'init',
  'https://child.com',
  [channel.port2]  // 传输端口
);
channel.port1.onmessage = (e) => {
  console.log('通过端口收到:', e.data);
};
channel.port1.start();

// 子页面
window.addEventListener('message', (e) => {
  if (e.ports && e.ports[0]) {
    const port = e.ports[0];
    port.onmessage = (e) => {
      console.log('通过端口：', e.data);
      port.postMessage('reply');
    };
    port.start();
  }
});
```

**应用场景：**
```js
// 1. iframe 嵌入第三方组件（如支付、地图）
parent.postMessage({action: 'resize', height: 500}, '*');

// 2. 跨域嵌入统计代码
tracker.postMessage({event: 'pageview', url: location.href}, '*');

// 3. 微前端子应用通信
window.postMessage({type: 'MICRO_APP_READY'}, 'https://app.example.com');
```

**知识点：** `postMessage` `跨域通信` `消息传递` `安全验证` `Channel Messaging`

:::

---

### Q12: 什么是微任务和宏任务？常见的有哪些？

> **🔥 中等 · JavaScript**

请解释微任务（microtask）和宏任务（macrotask）的区别，并列举常见的任务类型。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**微任务（Microtask）** 和 **宏任务（Macrotask）** 是 JavaScript 事件循环中的两种任务类型，它们的执行时机不同。

**执行顺序：**
```
1. 执行当前同步代码
2. 执行所有微任务（清空微任务队列）
3. 渲染 DOM（如果需要）
4. 执行一个宏任务
5. 回到步骤 2
```

**常见的宏任务：**
- `setTimeout`
- `setInterval`
- `setImmediate` (Node.js)
- `requestAnimationFrame` (浏览器)
- I/O 操作
- UI 渲染
- 整段同步代码（宏任务）

**常见的微任务：**
- `Promise.then/catch/finally`
- `MutationObserver`
- `process.nextTick` (Node.js，优先级最高)
- `queueMicrotask()`
- async/await 后的代码

**示例对比：**
```js
console.log('script start');  // 宏任务（同步代码）

setTimeout(() => {
  console.log('setTimeout');  // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('Promise 1');  // 微任务
}).then(() => {
  console.log('Promise 2');  // 微任务
});

queueMicrotask(() => {
  console.log('queueMicrotask');  // 微任务
});

console.log('script end');  // 宏任务（同步代码）

// 输出顺序：
// script start
// script end
// Promise 1
// Promise 2
// queueMicrotask
// setTimeout
```

**为什么微任务优先？**
- 微任务在当前宏任务结束后立即执行
- 确保异步操作尽快完成，减少延迟
- Promise 作为微任务，能保证链式调用的顺序执行

**实际应用：**
```js
// 1. 批量更新 DOM（微任务中合并多次更新）
let updates = [];
function scheduleUpdate(data) {
  updates.push(data);
  queueMicrotask(() => {
    batchUpdate(updates);
    updates = [];
  });
}

// 2. 确保在 DOM 更新后执行
Promise.resolve().then(() => {
  // 这里的代码在渲染后执行
});
```

**知识点：** `微任务` `宏任务` `事件循环` `Promise` `执行顺序`

:::

---

### Q13: async/await 的错误处理方式有哪些？

> **🔥 中等 · JavaScript**

请列举并说明 async/await 中的错误处理方式。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**async/await 有三种主要的错误处理方式：**

**1. try-catch（推荐）**
```js
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('请求失败:', error);
    throw error;  // 可选：继续向上抛出
  }
}

// 调用处也可以捕获
fetchData().catch(err => console.error(err));
```

**2. .catch() 链式处理**
```js
async function fetchData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
}

// 在调用处用 .catch()
fetchData()
  .then(data => console.log(data))
  .catch(error => console.error(error));
```

**3. Wrapper 函数（统一错误处理）**
```js
// 高阶函数封装错误处理
function asyncWrapper(fn) {
  return async function(...args) {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('统一错误处理:', error);
      return { error: true, message: error.message };
    }
  };
}

// Express 中的使用
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get('/data', asyncHandler(async (req, res) => {
  const data = await fetchData();
  res.json(data);
}));
```

**对比分析：**

| 方式 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| try-catch | 代码集中，类似同步 | 每个 async 都要写 | 单个函数内部处理 |
| .catch() | 链式清晰 | 需要记住添加 | 调用处统一处理 |
| wrapper | 统一处理，DRY | 增加抽象层 | 框架/大型项目 |

**知识点：** `async/await` `错误处理` `try-catch` `Promise.catch` `wrapper 函数`

:::

---

### Q14: Promise.allSettled 和 Promise.all 的区别？

> **🔥 中等 · JavaScript**

请说明 Promise.allSettled 和 Promise.all 的区别及使用场景。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心区别：**

| 特性 | Promise.all | Promise.allSettled |
|------|-------------|--------------------|
| 成功条件 | 全部成功 | 全部完成（不论成功失败） |
| 失败条件 | 任一失败立即 reject | 永不 reject |
| 返回值 | 成功值数组 | 状态对象数组 |
| 适用场景 | 依赖全部成功 | 需要知道每个结果 |

**Promise.all 行为：**
```js
const p1 = Promise.resolve(1);
const p2 = Promise.reject('error');
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3])
  .catch(error => console.error('失败:', error));  // 立即触发
```

**Promise.allSettled 行为：**
```js
Promise.allSettled([p1, p2, p3]).then(results => {
  console.log(results);
  // [
  //   { status: 'fulfilled', value: 1 },
  //   { status: 'rejected', reason: 'error' },
  //   { status: 'fulfilled', value: 3 }
  // ]
});
```

**使用场景：**
- **Promise.all**: 需要所有数据才能继续（如加载仪表盘）
- **Promise.allSettled**: 需要知道每个请求的结果（如批量上传文件）

**知识点：** `Promise.all` `Promise.allSettled` `Promise 组合` `错误处理`

:::

---

### Q15: 如何实现请求重试机制？

> **💀 困难 · JavaScript**

请实现一个带重试机制的请求函数，支持指数退避和最大重试次数。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**基础实现（固定延迟）：**
```js
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return await response.json();
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
      if (i === maxRetries - 1) break;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  throw lastError;
}
```

**进阶实现（指数退避）：**
```js
async function fetchWithExponentialBackoff(url, options = {}, maxRetries = 5) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      lastError = error;
      if (attempt === maxRetries) break;
      const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}
```

**指数退避原理：** 每次重试延迟翻倍（1s, 2s, 4s, 8s, 16s），上限 30 秒。

**知识点：** `重试机制` `指数退避` `错误恢复` `异步请求`

:::

---

### Q16: 什么是 AbortController？如何取消 fetch 请求？

> **🔥 中等 · JavaScript**

请说明 AbortController 的用途和使用方法。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**AbortController** 是用于取消异步操作（特别是 fetch 请求）的 API。

**基本用法：**
```js
const controller = new AbortController();
const signal = controller.signal;

fetch('/api/data', { signal })
  .then(response => response.json())
  .catch(error => {
    if (error.name === 'AbortError') {
      console.log('请求已取消');
    }
  });

// 取消请求
controller.abort();
```

**应用场景：**

**1. 取消超时请求：**
```js
async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
```

**2. 取消组件卸载后的请求：**
```js
useEffect(() => {
  const controller = new AbortController();
  
  fetch('/api/data', { signal: controller.signal })
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') throw err;
    });
  
  return () => controller.abort();  // 清理时取消
}, []);
```

**知识点：** `AbortController` `fetch 取消` `请求管理` `资源清理`

:::

---

### Q17: async generator 是什么？有什么使用场景？

> **💀 困难 · JavaScript**

请解释 async generator 的概念和使用方法。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Async Generator** 是结合了 async 和 generator 的特性，可以 produce 异步数据流。

**基本语法：**
```js
async function* asyncGenerator() {
  yield await Promise.resolve(1);
  yield await Promise.resolve(2);
  yield await Promise.resolve(3);
}

// 消费
(async () => {
  for await (const value of asyncGenerator()) {
    console.log(value);  // 1, 2, 3
  }
})();
```

**使用场景：**

**1. 分页数据流：**
```js
async function* fetchPages(baseUrl) {
  let page = 1;
  while (true) {
    const response = await fetch(`${baseUrl}?page=${page}`);
    const data = await response.json();
    if (data.length === 0) break;
    yield* data;  // 展开当前页数据
    page++;
  }
}

// 消费
for await (const item of fetchPages('/api/items')) {
  console.log(item);
}
```

**2. 轮询数据：**
```js
async function* pollStatus(jobId, interval = 1000) {
  while (true) {
    const status = await fetch(`/api/jobs/${jobId}/status`);
    yield await status.json();
    if (status.complete) break;
    await new Promise(r => setTimeout(r, interval));
  }
}
```

**3. 事件流处理：**
```js
async function* eventStream(reader) {
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield value;
  }
}
```

**知识点：** `async generator` `异步迭代` `数据流` `for await...of`

:::
