---
title: 事件循环
description: 宏任务、微任务、浏览器/Node 事件循环、process.nextTick、requestAnimationFrame 等核心面试题
---

# 事件循环

事件循环是 JavaScript 并发模型的核心。理解宏任务和微任务的执行顺序对于掌握异步编程至关重要。

---

## 📝 题目

### Q1: 以下代码的输出顺序是什么？

> **⭐ 简单 · JavaScript**

```js
console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('promise1');
});

console.log('script end');
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
script start
script end
promise1
setTimeout
```

**💡 解析：**
**执行顺序：**
1. **同步代码**先执行：`script start`、`script end`
2. `setTimeout` 回调放入**宏任务队列**
3. `Promise.then` 回调放入**微任务队列**
4. 同步代码执行完毕，执行**所有微任务**：`promise1`
5. 执行**一个宏任务**：`setTimeout`

**关键点：** 每次宏任务执行完后，会清空微任务队列，再执行下一个宏任务。

**知识点：** `同步代码优先` `微任务先于宏任务`

:::

---

### Q2: 解释以下代码的完整输出顺序

> **🔥 中等 · JavaScript**

```js
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

async1();

new Promise((resolve) => {
  console.log('promise1');
  resolve();
}).then(() => {
  console.log('promise2');
});

console.log('script end');
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
script start
async1 start
async2
promise1
script end
async1 end
promise2
setTimeout
```

**💡 解析：**
**详细执行流程：**

**同步阶段：**
1. `script start` - 同步代码
2. `async1 start` - async1 开始执行（同步）
3. `async2` - async2 开始执行（同步）
4. `await async2()` - 将 `async1 end` 包装为微任务
5. `promise1` - Promise 执行器同步执行
6. `.then` 回调放入微任务队列
7. `script end` - 同步代码结束

**微任务阶段：**
8. 执行微任务：`async1 end`
9. 执行微任务：`promise2`

**宏任务阶段：**
10. 执行宏任务：`setTimeout`

**知识点：** `async/await 微任务` `Promise 执行器同步`

:::

---

### Q3: 嵌套异步的执行顺序

> **🔥 中等 · JavaScript**

```js
console.log(1);

setTimeout(() => {
  console.log(2);
  Promise.resolve().then(() => {
    console.log(3);
  });
}, 0);

Promise.resolve().then(() => {
  console.log(4);
  setTimeout(() => {
    console.log(5);
  }, 0);
});

console.log(6);
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
1
6
4
2
3
5
```

**💡 解析：**
**执行轮次：**

**第 1 轮（同步）：** 1, 6

**第 1 轮微任务：** 4（第一个 Promise.then）
- 执行时注册了新的宏任务 setTimeout(5)

**第 2 轮宏任务：** 2（第一个 setTimeout）
- 执行时注册了新的微任务 Promise.then(3)

**第 2 轮微任务：** 3（在宏任务 2 执行完后立即执行）

**第 3 轮宏任务：** 5（第二轮的 setTimeout）

**关键点：** 微任务会在每一轮宏任务之后、下一轮宏任务之前执行。

**知识点：** `嵌套异步` `微任务插入时机`

:::

---

### Q4: Node.js 事件循环与浏览器有什么不同？

> **💀 困难 · JavaScript**

```js
// Node.js 环境
setTimeout(() => {
  console.log('timeout');
}, 0);

setImmediate(() => {
  console.log('immediate');
});
```

输出顺序是什么？为什么？在什么情况下顺序会确定？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
// 主模块中：顺序不确定（取决于性能）
// I/O 回调中：immediate 优先
```

**💡 解析：**
**Node 事件循环 6 阶段：**
1. **timers**: setTimeout/setInterval
2. **pending callbacks**: 系统操作回调
3. **idle/prepare**: 内部使用
4. **poll**: I/O 回调
5. **check**: setImmediate
6. **close callbacks**: close 事件

**顺序原因：**
- 在主模块中，timer 和 check 都在 timers 阶段后执行，顺序不确定
- 在 I/O 回调中，会先执行 check 阶段（setImmediate）

```js
// I/O 回调中的确定顺序
const fs = require('fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
});
// 总是：immediate 先于 timeout
```

**知识点：** `Node 事件循环` `阶段顺序` `setImmediate`

:::

---

### Q5: process.nextTick 与 Promise.then 有什么区别？

> **💀 困难 · JavaScript**

```js
console.log('start');

setTimeout(() => {
  console.log('timeout');
}, 0);

Promise.resolve().then(() => {
  console.log('promise');
});

process.nextTick(() => {
  console.log('nextTick');
});

console.log('end');
```

在 Node.js 中输出顺序是什么？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
start
end
nextTick
promise
timeout
```

**💡 解析：**
**优先级：**
1. 同步代码
2. **process.nextTick**（最高优先级微任务）
3. 其他微任务（Promise.then）
4. 宏任务（setTimeout）

**process.nextTick 特点：**
- 不属于事件循环的任何阶段
- 在当前执行栈完成后立即执行
- 优先级高于 Promise 微任务
- 可以递归调用（有上限防止阻塞）

**nextTick 队列 vs 微任务队列：**
```
┌─────────────────┐
│  同步代码执行   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ nextTick 队列   │  ← 先执行
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  微任务队列     │  ← 再执行
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   宏任务队列    │
└─────────────────┘
```

**知识点：** `process.nextTick` `微任务优先级`

:::

---

### Q6: requestAnimationFrame 的执行时机

> **🔥 中等 · JavaScript**

```js
console.log('start');

setTimeout(() => console.log('timeout'), 0);

requestAnimationFrame(() => {
  console.log('raf');
});

Promise.resolve().then(() => {
  console.log('promise');
});

console.log('end');
```

输出顺序是什么？raf 何时执行？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
start
end
promise
timeout
raf
```

**💡 解析：**
**requestAnimationFrame (raf) 特点：**
- 不是标准的宏任务或微任务
- 在下次重绘之前执行
- 大约每秒 60 次（16.6ms 间隔）
- 浏览器自动优化执行时机

**执行时机：**
```
事件循环 ─┬─→ 微任务 ─┬─→ raf (重绘前)
          │           └─→ 宏任务
          └─────────────────→
```

**适用场景：**
- 平滑动画（与屏幕刷新同步）
- 滚动/缩放效果
- Canvas 动画
- 性能优于 setInterval

```js
// 最佳实践
function animate() {
  // 更新动画状态
  requestAnimationFrame(animate);
}
animate();
```

**知识点：** `requestAnimationFrame` `动画性能` `渲染时机`

:::

---

### Q7: messageChannel 属于宏任务还是微任务？

> **🔥 中等 · JavaScript**

```js
const channel = new MessageChannel();
const port = channel.port2;

console.log('start');

port.postMessage('msg');
port.onmessage = () => {
  console.log('messageChannel');
};

Promise.resolve().then(() => {
  console.log('promise');
});

console.log('end');
```

输出顺序是什么？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
start
end
messageChannel
promise
```

**💡 解析：**
**MessageChannel 特性：**
- 属于**微任务**（在 Node.js 中）
- 优先级高于 Promise.then
- 浏览器中行为可能不同

**微任务优先级（Node.js）：**
1. process.nextTick
2. MutationObserver
3. MessageChannel
4. Promise.then

**应用场景：**
```js
// 用于实现宏任务
const channel = new MessageChannel();
const queue = [];

channel.port1.onmessage = () => {
  const cb = queue.shift();
  if (cb) cb();
};

function macroTask(cb) {
  queue.push(cb);
  channel.port2.postMessage(null);
}
```

**知识点：** `MessageChannel` `微任务类型` `优先级`

:::

---

### Q8: 微任务中注册微任务

> **💀 困难 · JavaScript**

```js
console.log('start');

Promise.resolve().then(() => {
  console.log('promise1');
  Promise.resolve().then(() => {
    console.log('promise1.1');
  });
});

Promise.resolve().then(() => {
  console.log('promise2');
});

console.log('end');
```

输出顺序是什么？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
start
end
promise1
promise2
promise1.1
```

**💡 解析：**
**执行过程：**
1. 执行同步代码：`start`, `end`
2. 执行微任务队列（初始）：
   - 执行 `promise1` 回调
   - 执行时注册了新的微任务 `promise1.1`
   - 执行 `promise2` 回调
3. 执行本轮新产生的微任务：
   - 执行 `promise1.1`

**关键规则：**
- 微任务执行过程中注册的新微任务，会在当前所有微任务执行完后执行
- 微任务队列是"实时"处理的，不是快照

```js
// 模拟微任务执行
while (microtaskQueue.length > 0) {
  const task = microtaskQueue.shift();
  task();  // 执行时可能添加新微任务
  // 新的微任务会被处理
}
```

**知识点：** `微任务嵌套` `队列处理`

:::

---

### Q9: setTimeout 为 0 真的会立即执行吗？

> **⭐ 简单 · JavaScript**

```js
console.log('start');
setTimeout(() => console.log('timeout'), 0);
console.log('end');

// 实际延迟时间是多少？
```

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
start
end
timeout  // 至少延迟 4ms（浏览器）
```

**💡 解析：**
**实际延迟：**
- **浏览器**：最小延迟 4ms（HTML5 规范）
- **Node.js**：最小延迟 1ms
- 嵌套超过 5 层后，最小延迟变为 4ms

**原因：**
```js
// 浏览器实现（简化）
const MIN_DELAY = 4;  // 最小延迟
const actualDelay = Math.max(0, MIN_DELAY);
```

**特殊情况：**
```js
// 后台标签页的 setTimeout 会被节流
// 最小延迟可能增加到 1000ms

// 嵌套 setTimeout 节流
let i = 0;
function cascade() {
  i++;
  if (i < 10) {
    setTimeout(cascade, 0);  // 超过 5 层后延迟 4ms
  }
}
cascade();
```

**知识点：** `setTimeout 最小延迟` `浏览器优化`

:::

---

### Q10: 综合事件循环分析题

> **💀 困难 · JavaScript**

```js
console.log('1');

setTimeout(() => {
  console.log('2');
  process.nextTick(() => {
    console.log('3');
  });
  new Promise((resolve) => {
    console.log('4');
    resolve();
  }).then(() => {
    console.log('5');
  });
});

process.nextTick(() => {
  console.log('6');
});

new Promise((resolve) => {
  console.log('7');
  resolve();
}).then(() => {
  console.log('8');
  setTimeout(() => {
    console.log('9');
  }, 0);
});

console.log('10');
```

在 Node.js 环境中的输出顺序是什么？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
1
6
7
10
8
2
3
4
5
9
```

**💡 解析：**
**详细分析：**

**同步执行：**
1. `1` - 同步
2. `6` - nextTick（注册）
3. `7` - Promise 执行器同步
4. `10` - 同步结束
5. `8` - Promise.then 注册

**第一轮微任务：**
- nextTick 队列：`6`
- 微任务队列：`8`

**第一轮宏任务（setTimeout）：**
- `2` - setTimeout 回调
  - 同步：`4`
  - nextTick：`3` 注册
  - Promise.then：`5` 注册

**第二轮微任务：**
- `3` - nextTick
- `5` - Promise.then

**第二轮宏任务：**
- `9` - setTimeout

**知识点：** `综合事件循环` `nextTick vs Promise` `Node.js`

:::

---

## 🔑 核心知识点总结

### 1. 任务类型

| 类型 | 包含 | 执行时机 |
|------|------|---------|
| 同步 | 普通代码 | 立即 |
| 微任务 | Promise.then、MutationObserver | 当前宏任务后 |
| 宏任务 | setTimeout、setImmediate | 下一轮 |

### 2. 执行顺序

```
同步代码 → nextTick → 微任务 → 宏任务 → 下一轮
```

### 3. 浏览器事件循环 6 阶段

```
timers → pending → idle → poll → check → close
                 ↑
               微任务在每阶段后执行
```

### 4. Node.js 特殊之处

- process.nextTick 优先级最高
- setImmediate 在 check 阶段
- timers 与 check 的顺序依赖上下文

## 💡 面试技巧

1. **口诀**：同步 → nextTick → 微任务 → 宏任务
2. **画图**：面试时可以画执行时序图
3. **async/await**：await 后的代码是微任务
4. **raf**：独立于事件循环，渲染前执行
5. **延迟**：setTimeout 最小 4ms，不是 0### Q11: ES7-ES14 新特性速览

> **🔥 中等 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 版本 | 年份 | 特性 | 示例 |
|------|------|------|------|
| ES7 | 2016 | Array.includes | `[1,2,3].includes(2)` |
| ES7 | 2016 | 幂运算符 | `2 ** 10 // 1024` |
| ES8 | 2017 | async/await | `await fetch(url)` |
| ES8 | 2017 | Object.values/entries | `Object.values(obj)` |
| ES8 | 2017 | String padding | `'5'.padStart(3,'0')` |
| ES8 | 2017 | Trailing commas | `fn(a,b,)` |
| ES9 | 2018 | 对象展开 | `{...obj}` |
| ES9 | 2018 | 异步迭代 | `for await(const x of asyncIter)` |
| ES9 | 2018 | Promise.finally | `p.finally(() => {})` |
| ES10 | 2019 | Array.flat/flatMap | `[1,[2,[3]]].flat(Infinity)` |
| ES10 | 2019 | Object.fromEntries | `Object.fromEntries(map)` |
| ES10 | 2019 | String trimStart/End | `' a '.trimStart()` |
| ES11 | 2020 | 可选链 | `user?.address?.city` |
| ES11 | 2020 | 空值合并 | `value ?? 'default'` |
| ES11 | 2020 | BigInt | `9007199254740991n` |
| ES11 | 2020 | globalThis | `globalThis.setTimeout` |
| ES11 | 2020 | 动态import | `import('./module.js')` |
| ES11 | 2020 | Promise.allSettled | `Promise.allSettled([p1,p2])` |
| ES12 | 2021 | 逻辑赋值 | `x ??= 'default'` |
| ES12 | 2021 | String.replaceAll | `'aabb'.replaceAll('a','x')` |
| ES12 | 2021 | Promise.any | `Promise.any([p1,p2])` |
| ES12 | 2021 | 数字分隔符 | `1_000_000` |
| ES13 | 2022 | 顶层await | `await fetch(url)`(模块顶层) |
| ES13 | 2022 | Object.hasOwn | `Object.hasOwn(obj,'key')` |
| ES13 | 2022 | Array.at | `arr.at(-1)` |
| ES14 | 2023 | Array.toSorted | `arr.toSorted()`(不修改原数组) |
| ES14 | 2023 | Array.toReversed | `arr.toReversed()` |
| ES14 | 2023 | Array.findLast | `arr.findLast(x => x > 5)` |
| ES14 | 2023 | Hashbang语法 | `#!/usr/bin/env node` |

**重点特性详解：**

```js
// 可选链 + 空值合并 — 最实用组合
const city = user?.address?.city ?? '未知'
// user不存在 → undefined → '未知'
// user.address不存在 → undefined → '未知'
// user.address.city不存在 → undefined → '未知'

// Array.at — 优雅获取末尾元素
const last = arr.at(-1)    // 等价 arr[arr.length-1]
const second = arr.at(-2)  // 倒数第二个

// 逻辑赋值 — 简写
x ??= 'default'  // x = x ?? 'default'
x &&= fn(x)      // x = x && fn(x)
x ||= 'default'  // x = x || 'default'

// Promise.any vs Promise.all vs Promise.allSettled
const p1 = fetch('/api/1')  // 可能失败
const p2 = fetch('/api/2')  // 可能失败

Promise.all([p1, p2])            // 任一失败即失败
Promise.allSettled([p1, p2])     // 等全部完成（无论成败）
Promise.any([p1, p2])            // 任一成功即成功

// toSorted/toReversed — 不可变操作
const sorted = arr.toSorted()       // 不修改原数组
const reversed = arr.toReversed()   // 不修改原数组
// 对比：arr.sort() / arr.reverse() 会修改原数组
```

**知识点：** `ES7-ES14` `可选链` `空值合并` `async/await` `BigInt` `Array.at`

:::

---

### Q11: requestAnimationFrame 是宏任务还是微任务？执行时机是什么？

> **🔥 中等 · 浏览器**

请说明 rAF 在事件循环中的位置。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**requestAnimationFrame (rAF) 既不是宏任务也不是微任务**，它在「渲染步骤」中执行。

**事件循环中的 rAF：**
```
1. 执行宏任务
2. 执行所有微任务
3. 渲染更新（rAF 在这里调用）
4. 回到步骤 1
```

**执行时机：**
```js
console.log('script');

Promise.resolve().then(() => {
  console.log('microtask');
});

setTimeout(() => {
  console.log('macrotask');
}, 0);

requestAnimationFrame(() => {
  console.log('raf');
});

// 输出顺序：
// script
// microtask
// raf（如果触发渲染）
// macrotask
```

**rAF vs setTimeout：**
```js
// setTimeout 不受刷新率限制
setTimeout(() => {}, 0);  // 约 4ms（浏览器最小间隔）

// rAF 跟随屏幕刷新率
requestAnimationFrame(() => {});  // 60fps = 16.6ms

// 动画用 rAF 更流畅
function animate() {
  element.style.transform = `translateX(${x}px)`;
  requestAnimationFrame(animate);
}
animate();
```

**rAF 不会执行的情况：**
- 标签页隐藏/后台（自动暂停）
- 没有 DOM 变化（可能跳过渲染）
- 浏览器负载高（可能降低频率）

**知识点：** `requestAnimationFrame` `事件循环` `渲染` `动画优化`

:::

---

### Q12: requestIdleCallback 是什么？和 requestAnimationFrame 的区别？

> **💀 困难 · 浏览器**

请说明 requestIdleCallback 的用途和使用场景。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**requestIdleCallback (rIC)** 在浏览器空闲时执行回调，用于非关键任务。

**基本用法：**
```js
requestIdleCallback(() => {
  // 浏览器空闲时执行
  doNonCriticalWork();
});

// 带超时（确保一定执行）
requestIdleCallback(() => {
  doWork();
}, { timeout: 1000 });  // 1 秒内必须执行
```

**与 rAF 的区别：**

| 特性 | rAF | rIC |
|------|-----|-----|
| 执行时机 | 下次渲染前 | 浏览器空闲时 |
| 触发频率 | 跟随刷新率 | 不固定（取决于空闲） |
| 用途 | 动画、视觉更新 | 后台任务、分析 |
| 时间片 | 约 16ms | 约 50ms |
| 后台执行 | 暂停 | 可能延迟 |

**使用场景：**
```js
// 1. 懒加载非关键资源
requestIdleCallback(() => {
  loadAnalytics();
  loadSocialWidgets();
});

// 2. 分批次处理大数据
function processLargeArray(array) {
  let i = 0;
  function chunk() {
    const deadline = requestIdleCallback((deadline) => {
      while (deadline.timeRemaining() > 0 && i < array.length) {
        process(array[i++]);
      }
      if (i < array.length) {
        requestIdleCallback(chunk);
      }
    });
  }
  chunk();
}

// 3. React 的 Concurrent Mode
// 利用 rIC 实现可中断渲染
```

**注意事项：**
```js
// 兼容性检查
if ('requestIdleCallback' in window) {
  requestIdleCallback(work);
} else {
  // 降级方案
  setTimeout(work, 1);
}

// 不要用于有时间要求的工作
// rIC 可能延迟很久或不执行
```

**知识点：** `requestIdleCallback` `空闲回调` `性能优化` `rAF 对比`

:::

---

### Q13: 微任务队列是先进先出吗？嵌套微任务的执行顺序？

> **💀 困难 · JavaScript**

请说明微任务队列的执行规则。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**微任务队列是先进先出（FIFO）**，但嵌套微任务会立即追加到队列末尾。

**基本顺序：**
```js
const p = Promise.resolve();

p.then(() => console.log(1));
p.then(() => console.log(2));
p.then(() => console.log(3));

// 输出：1, 2, 3（FIFO）
```

**嵌套微任务：**
```js
Promise.resolve().then(() => {
  console.log(1);
  
  // 嵌套的微任务追加到队列末尾
  Promise.resolve().then(() => {
    console.log(2);
  });
});

Promise.resolve().then(() => {
  console.log(3);
});

// 输出：1, 3, 2
// 解释：
// 1. 执行第一个 then，输出 1
// 2. 遇到嵌套 then，追加到队列
// 3. 执行第三个 then（原本就在队列），输出 3
// 4. 执行嵌套的 then，输出 2
```

**复杂嵌套示例：**
```js
console.log('start');

Promise.resolve().then(() => {
  console.log('p1');
  Promise.resolve().then(() => console.log('p1-inner'));
});

Promise.resolve().then(() => {
  console.log('p2');
});

setTimeout(() => {
  console.log('timeout');
  Promise.resolve().then(() => console.log('timeout-promise'));
}, 0);

// 输出顺序：
// start
// p1
// p2
// p1-inner
// timeout
// timeout-promise
```

**重要规则：**
1. 当前宏任务完成后，清空所有微任务
2. 微任务执行中产生的新微任务，会追加到队列末尾
3. 微任务全部执行完后，才执行下一个宏任务
4. process.nextTick（Node.js）优先级高于 Promise

**Node.js 中的优先级：**
```js
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));

// 输出：nextTick, promise
```

**知识点：** `微任务队列` `FIFO` `嵌套微任务` `执行顺序`

:::

---

### Q14: 浏览器和 Node.js 事件循环的主要差异有哪些？

> **💀 困难 · JavaScript**

请对比浏览器和 Node.js 的事件循环。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**主要差异：**

**1. 微任务优先级：**
```js
// Node.js
process.nextTick(() => console.log('nextTick'));
Promise.resolve().then(() => console.log('promise'));
// 输出：nextTick, promise（nextTick 优先级更高）

// 浏览器
// 只有 Promise 微任务，没有 nextTick
```

**2. 宏任务类型：**
| 浏览器 | Node.js |
|--------|---------|
| setTimeout | setTimeout |
| setInterval | setInterval |
| rAF | setImmediate |
| UI 渲染 | - |
| I/O | I/O |

**3. Node.js 的阶段：**
```
   ┌───────────────────────┐
┌─>│        timers         │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     I/O callbacks     │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     idle, prepare     │
│  └──────────┬────────────┘      ┌───────────────┐
│  ┌──────────┴────────────┐      │   incoming:   │
│  │         poll          │<─────┤  connections, │
│  └──────────┬────────────┘      │   data, etc.  │
│  ┌──────────┴────────────┐      └───────────────┘
│  │        check          │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
└──│    close callbacks    │
   └───────────────────────┘
```

**4. setTimeout(0) vs setImmediate：**
```js
// 在主模块中
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
// 输出不确定，取决于性能

// 在 I/O 回调中
fs.readFile('file', () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate'));
  // 输出：immediate, timeout（确定）
});
```

**5. process.nextTick 队列：**
```js
// Node.js 特有
// nextTick 在每个阶段结束后、微任务之前执行
// 可以导致「饥饿」问题

function recursive() {
  process.nextTick(recursive);
}
recursive();
// 阻塞所有 I/O，程序卡死
```

**知识点：** `事件循环` `Node.js` `浏览器` `nextTick` `setImmediate`

:::
