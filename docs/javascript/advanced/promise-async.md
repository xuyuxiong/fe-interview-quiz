---
title: Promise 与 async/await
description: Promise A+规范手写、错误穿透、async 实现原理、并发限制、Promise 缓存、取消 Promise 等核心面试题
---

# Promise 与 async/await

Promise 是 JavaScript 异步编程的核心。深入理解 Promise 的内部原理和高级用法对于编写可靠的异步代码至关重要。

---

## 📝 题目

### Q1: 手写实现一个简化的 Promise

> **💀 困难 · JavaScript**

请根据 Promise A+ 规范，手写一个简化的 Promise 实现。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

```js
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';

function MyPromise(executor) {
  this.status = PENDING;
  this.value = undefined;
  this.reason = undefined;
  this.onFulfilledCallbacks = [];
  this.onRejectedCallbacks = [];

  const resolve = (value) => {
    if (this.status !== PENDING) return;
    this.status = FULFILLED;
    this.value = value;
    this.onFulfilledCallbacks.forEach(cb => cb());
  };

  const reject = (reason) => {
    if (this.status !== PENDING) return;
    this.status = REJECTED;
    this.reason = reason;
    this.onRejectedCallbacks.forEach(cb => cb());
  };

  try {
    executor(resolve, reject);
  } catch (err) {
    reject(err);
  }
}

MyPromise.prototype.then = function(onFulfilled, onRejected) {
  onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v;
  onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e; };

  return new MyPromise((resolve, reject) => {
    const handleFulfilled = () => {
      try {
        const x = onFulfilled(this.value);
        resolvePromise(x, resolve, reject);
      } catch (err) {
        reject(err);
      }
    };

    const handleRejected = () => {
      try {
        const x = onRejected(this.reason);
        resolvePromise(x, resolve, reject);
      } catch (err) {
        reject(err);
      }
    };

    if (this.status === FULFILLED) {
      setTimeout(handleFulfilled);
    } else if (this.status === REJECTED) {
      setTimeout(handleRejected);
    } else {
      this.onFulfilledCallbacks.push(handleFulfilled);
      this.onRejectedCallbacks.push(handleRejected);
    }
  });
};

function resolvePromise(x, resolve, reject) {
  if (x === null || (typeof x !== 'object' && typeof x !== 'function')) {
    return resolve(x);
  }
  let called = false;
  try {
    const then = x.then;
    if (typeof then === 'function') {
      then.call(x, y => {
        if (called) return;
        called = true;
        resolvePromise(y, resolve, reject);
      }, r => {
        if (called) return;
        called = true;
        reject(r);
      });
    } else {
      resolve(x);
    }
  } catch (err) {
    if (called) return;
    reject(err);
  }
}

MyPromise.resolve = function(value) {
  return new MyPromise(resolve => resolve(value));
};

MyPromise.reject = function(reason) {
  return new MyPromise((_, reject) => reject(reason));
};
```

**知识点：** `Promise A+` `手写实现` `状态管理`

:::

---

### Q2: Promise 的错误穿透是什么？

> **🔥 中等 · JavaScript**

```js
Promise.resolve('success')
  .then(() => {
    throw new Error('error');
  })
  .catch(err => {
    console.log('catch 1:', err.message);
    return 'recovered';
  })
  .then(value => {
    console.log('then 2:', value);
    throw new Error('error 2');
  })
  .catch(err => {
    console.log('catch 2:', err.message);
  });
```

输出是什么？什么是错误穿透？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
catch 1: error
then 2: recovered
catch 2: error 2
```

**💡 解析：**
**错误穿透规则：**
1. 如果 onFulfilled 或 onRejected 抛出错误，Promise 变为 rejected
2. 如果 then 没有提供 onRejected，错误会穿透到下一个 catch
3. catch 处理成功（不抛出错误），返回的值会进入下一个 then

```js
// 错误穿透示例
Promise.reject('error')
  .then(v => console.log(v))      // 跳过
  .then(v => console.log(v))      // 跳过
  .catch(e => console.log(e));    // 'error' - 捕获

// 不穿透的情况
Promise.reject('error')
  .catch(e => console.log(e))     // 'error'
  .then(v => console.log(v));     // undefined - 继续
```

**知识点：** `错误处理` `catch 链式` `错误穿透`

:::

---

### Q3: async/await 的实现原理

> **💀 困难 · JavaScript**

async/await 是基于什么实现的？请手写一个简单的 async/await 转换。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**基于 Generator + Promise：**
```js
// async/await 代码
async function fn() {
  const a = await Promise.resolve(1);
  const b = await Promise.resolve(2);
  return a + b;
}

// 等价于 Generator
function fn() {
  return spawn(function* () {
    const a = yield Promise.resolve(1);
    const b = yield Promise.resolve(2);
    return a + b;
  });
}

// spawn 实现
function spawn(genFn) {
  return new Promise((resolve, reject) => {
    const gen = genFn();
    
    function step(nextFn) {
      let result;
      try {
        result = nextFn();
      } catch (e) {
        return reject(e);
      }
      
      if (result.done) {
        return resolve(result.value);
      }
      
      Promise.resolve(result.value)
        .then(v => step(() => gen.next(v)))
        .catch(e => step(() => gen.throw(e)));
    }
    
    step(() => gen.next());
  });
}
```

**要点：**
1. async 函数返回 Promise
2. await 暂停执行，等待 Promise 完成
3. 错误用 try/catch 捕获

**知识点：** `async/await` `Generator` `spawn`

:::

---

### Q4: 如何用 Promise 实现并发控制？

> **💀 困难 · JavaScript**

实现一个函数，限制同时执行的 Promise 数量。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

```js
function limitPromiseConcurrency(tasks, limit) {
  return new Promise((resolve, reject) => {
    let completed = 0;
    let running = 0;
    let index = 0;
    const results = [];

    function runNext() {
      while (running < limit && index < tasks.length) {
        const currentIndex = index++;
        running++;
        
        Promise.resolve(tasks[currentIndex]())
          .then(result => {
            results[currentIndex] = result;
          })
          .catch(reject)
          .finally(() => {
            running--;
            completed++;
            
            if (completed === tasks.length) {
              resolve(results);
            } else {
              runNext();
            }
          });
      }
    }
    
    runNext();
  });
}

// 使用示例
const tasks = [
  () => delay(100).then(() => 'task1'),
  () => delay(200).then(() => 'task2'),
  () => delay(150).then(() => 'task3'),
];

limitPromiseConcurrency(tasks, 2).then(console.log);
```

**知识点：** `并发控制` `Promise 队列` `限流`

:::

---

### Q5: 如何实现 Promise 缓存（Promise 复用）？

> **🔥 中等 · JavaScript**

请实现一个异步缓存，避免重复请求相同的数据。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

```js
class PromiseCache {
  constructor() {
    this.cache = new Map();
  }
  
  get(key, fetcher) {
    // 如果已存在缓存，直接返回
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    // 创建 Promise 并缓存
    const promise = Promise.resolve()
      .then(fetcher)
      .finally(() => {
        // 完成后从缓存移除（可选）
        // this.cache.delete(key);
      });
    
    this.cache.set(key, promise);
    return promise;
  }
  
  // 强制刷新
  refresh(key, fetcher) {
    this.cache.delete(key);
    return this.get(key, fetcher);
  }
}

// 使用示例
const cache = new PromiseCache();

// 多个地方调用，只执行一次请求
cache.get('user:1', () => fetch('/api/user/1'));
cache.get('user:1', () => fetch('/api/user/1'));  // 复用同一个 Promise
```

**知识点：** `Promise 缓存` `请求复用` `防重复`

:::

---

### Q6: 如何取消 Promise？

> **💀 困难 · JavaScript**

Promise 本身不能取消，如何实现可取消的 Promise？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**方式 1：封装可取消的 Promise**
```js
function cancellablePromise(promise) {
  let isCancelled = false;
  
  const wrapped = new Promise((resolve, reject) => {
    promise.then(
      v => isCancelled ? reject(new CancelError('Cancelled')) : resolve(v),
      e => isCancelled ? reject(new CancelError('Cancelled')) : reject(e)
    );
  });
  
  wrapped.cancel = () => {
    isCancelled = true;
  };
  
  return wrapped;
}

class CancelError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CancelError';
  }
}

// 使用
const p = cancellablePromise(fetch('/api/data'));
// 需要时取消
p.cancel();
```

**方式 2：AbortController（现代方案）**
```js
const controller = new AbortController();

fetch('/api/data', { signal: controller.signal })
  .then(r => r.json())
  .catch(e => {
    if (e.name === 'AbortError') {
      console.log('请求被取消');
    }
  });

// 取消请求
controller.abort();
```

**知识点：** `Promise 取消` `AbortController` `可取消异步`

:::

---

### Q7: 如何实现 Promise 超时处理？

> **🔥 中等 · JavaScript**

请实现一个带超时功能的 Promise 函数。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

```js
// 方式 1: Promise.race
function withTimeout(promise, timeout) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Timeout')), timeout);
  });
  return Promise.race([promise, timeoutPromise]);
}

// 方式 2: 带取消的超时
function withTimeoutV2(promise, timeout) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Timeout')), timeout);
  });
  
  return Promise.race([promise, timeoutPromise])
    .finally(() => clearTimeout(timer));
}

// 使用示例
withTimeout(fetch('/api/slow'), 3000)
  .then(r => r.json())
  .catch(e => console.error(e));
```

**知识点：** `Promise 超时` `race` `错误处理`

:::

---

### Q8: async/await 中如何正确处理错误？

> **⭐ 简单 · JavaScript**

```js
// 方式 1
try {
  const data = await fetchData();
  const user = await fetchUser(data.id);
  console.log(user);
} catch (e) {
  console.error('错误:', e);
}

// 方式 2
fetchData()
  .then(data => fetchUser(data.id))
  .then(user => console.log(user))
  .catch(e => console.error('错误:', e));
```

这两种方式有什么区别？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**💡 解析：**
**await try/catch:**
- 更接近同步代码，可读性好
- 可以精确控制 try 块范围
- 可以直接使用传统控制流

**Promise.then/catch:**
- 适合函数式编程风格
- 可以链式组合多个操作
- catch 可以捕获前面所有错误

**最佳实践：**
```js
// 精确错误处理
async function loadData() {
  try {
    const data = await fetchData();
  
    try {
      const user = await fetchUser(data.id);
      console.log(user);
    } catch (e) {
      console.error('获取用户失败:', e);
    }
  } catch (e) {
    console.error('获取数据失败:', e);
  }
}

// 或使用 Promise.allSettled
const [dataResult, userResult] = await Promise.allSettled([
  fetchData(),
  fetchUserId()
]);
```

**知识点：** `错误处理` `try/catch` `Promise 错误`

:::

---

### Q9: Promise.all 和 Promise.allSettled 有什么区别？

> **⭐ 简单 · JavaScript**

```js
const p1 = Promise.resolve(1);
const p2 = Promise.reject('error');
const p3 = Promise.resolve(3);

Promise.all([p1, p2, p3])
  .then(console.log)
  .catch(console.log);

Promise.allSettled([p1, p2, p3])
  .then(console.log);
```

输出分别是什么？

::: details 🔍 点击查看答案与解析

**✅ 答案：**
```
// Promise.all 输出:
'error'  // 一个失败就 reject

// Promise.allSettled 输出:
[
  { status: 'fulfilled', value: 1 },
  { status: 'rejected', reason: 'error' },
  { status: 'fulfilled', value: 3 }
]
```

**💡 解析：**
**区别：**
| 方法 | 一个失败 | 返回值 | 使用场景 |
|------|---------|--------|---------|
| all | 整体失败 | 成功值数组 | 全部成功才继续 |
| allSettled | 继续等待 | 状态数组 | 需要知道每个结果 |
| any | 继续等待 | 第一个成功 | 任意成功即可 |
| race | 继续等待 | 第一个完成 | 最快响应 |

**知识点：** `Promise 组合` `错误处理`

:::

---

### Q10: 手写实现 Promise.all

> **🔥 中等 · JavaScript**

请手写实现 Promise.all。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

```js
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (!Array.isArray(promises)) {
      return reject(new TypeError('必须传入数组'));
    }
    
    const results = [];
    let completed = 0;
    
    if (promises.length === 0) {
      return resolve(results);
    }
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results[index] = value;
          completed++;
          if (completed === promises.length) {
            resolve(results);
          }
        })
        .catch(reject);
    });
  });
}

// 测试
promiseAll([
  Promise.resolve(1),
  2,
  Promise.resolve(3)
]).then(console.log);  // [1, 2, 3]
```

**知识点：** `Promise.all` `手写实现` `并发处理`

:::

---

## 🔑 核心知识点总结

### 1. Promise 状态

```
pending → fulfilled (resolve)
pending → rejected (reject)
```

### 2. 异步控制

| 需求 | 方法 |
|------|------|
| 并行处理 | Promise.all |
| 最快响应 | Promise.race |
| 全部完成 | Promise.allSettled |
| 并发限制 | 队列控制 |
| 超时处理 | Promise.race + timeout |
| 取消请求 | AbortController |

### 3. async/await

- 基于 Generator + Promise
- try/catch 处理错误
- 可配合 Promise.all 并发

## 💡 面试技巧

1. **手写 Promise**：掌握状态和 then 链
2. **并发控制**：理解队列和限流原理
3. **错误处理**：try/catch vs then/catch
4. **取消机制**：知道 AbortController
5. **性能优化**：Promise 缓存复用### Q11: Promise A+ 规范手写要点

> **💀 困难 · JavaScript**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Promise A+ 规范核心要求：**

```text
1. 三种状态：pending → fulfilled / pending → rejected（不可逆）
2. then方法返回新Promise（链式调用）
3. 值穿透：then非函数参数时忽略，值向下传递
4. resolve/reject只能调用一次
5. then回调异步执行（微任务）
```

```js
class MyPromise {
  static PENDING = 'pending'
  static FULFILLED = 'fulfilled'
  static REJECTED = 'rejected'

  constructor(executor) {
    this.status = MyPromise.PENDING
    this.value = undefined
    this.reason = undefined
    this.onFulfilledCallbacks = []
    this.onRejectedCallbacks = []

    const resolve = (value) => {
      if (this.status !== MyPromise.PENDING) return
      if (value instanceof MyPromise) {
        // 如果resolve的是Promise，递归处理
        value.then(resolve, reject)
        return
      }
      this.status = MyPromise.FULFILLED
      this.value = value
      this.onFulfilledCallbacks.forEach(fn => fn())
    }

    const reject = (reason) => {
      if (this.status !== MyPromise.PENDING) return
      this.status = MyPromise.REJECTED
      this.reason = reason
      this.onRejectedCallbacks.forEach(fn => fn())
    }

    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }

  then(onFulfilled, onRejected) {
    // 值穿透：非函数参数替换为透传函数
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
    onRejected = typeof onRejected === 'function' ? onRejected : e => { throw e }

    // then返回新Promise（链式调用核心）
    const promise2 = new MyPromise((resolve, reject) => {
      const fulfilledTask = () => {
        queueMicrotask(() => {
          try {
            const x = onFulfilled(this.value)
            this.resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }

      const rejectedTask = () => {
        queueMicrotask(() => {
          try {
            const x = onRejected(this.reason)
            this.resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }

      if (this.status === MyPromise.FULFILLED) fulfilledTask()
      else if (this.status === MyPromise.REJECTED) rejectedTask()
      else {
        // pending状态，存入回调队列
        this.onFulfilledCallbacks.push(fulfilledTask)
        this.onRejectedCallbacks.push(rejectedTask)
      }
    })

    return promise2
  }

  // Promise解析过程（核心难点）
  resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) {
      // 循环引用检测
      return reject(new TypeError('Chaining cycle detected'))
    }
    if (x instanceof MyPromise) {
      // x是Promise，递归处理
      x.then(resolve, reject)
    } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      // x是thenable
      let then
      try {
        then = x.then
      } catch (e) {
        return reject(e)
      }
      if (typeof then === 'function') {
        let called = false  // 防止多次调用
        try {
          then.call(x,
            y => { if (!called) { called = true; this.resolvePromise(promise2, y, resolve, reject) } },
            r => { if (!called) { called = true; reject(r) } }
          )
        } catch (e) {
          if (!called) reject(e)
        }
      } else {
        resolve(x)
      }
    } else {
      resolve(x)
    }
  }

  static resolve(value) { return new MyPromise(r => r(value)) }
  static reject(reason) { return new MyPromise((_, r) => r(reason)) }
}
```

**Promise A+ 规范关键测试点：**

| 测试项 | 要求 |
|--------|------|
| 状态不可逆 | pending→fulfilled后不能变rejected |
| then链式调用 | then返回新Promise |
| 值穿透 | then(1).then(2).then(v=>v) 正确传值 |
| 循环引用 | then返回自身Promise要reject |
| thenable处理 | x.then是函数时递归解析 |
| 多次调用 | resolve/reject只能执行一次 |
| 异步执行 | then回调必须异步（微任务） |

**知识点：** `Promise A+` `手写Promise` `链式调用` `值穿透` `thenable` `微任务`

:::

---

### Q11: Promise 为什么是微任务？如何实现一个 Promise 的链式调用？

> **💀 困难 · JavaScript**

请解释 Promise 的执行机制并实现链式调用。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Promise 是微任务的原因：**

Promise 回调（then/catch）在微任务队列中执行，优先级高于宏任务。

```js
Promise.resolve().then(() => {
  console.log('Promise 回调');  // 先执行
});

setTimeout(() => {
  console.log('setTimeout');  // 后执行
}, 0);
```

**为什么设计为微任务：**
- 确保异步结果尽快处理
- 保证链式调用的顺序性
- 避免中间状态被外部观察到

**Promise 链式调用实现：**
```js
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = null;
    this.callbacks = [];
    
    const resolve = (value) => {
      if (this.state !== 'pending') return;
      this.state = 'fulfilled';
      this.value = value;
      this.callbacks.forEach(cb => cb());
    };
    
    const reject = (reason) => {
      if (this.state !== 'pending') return;
      this.state = 'rejected';
      this.value = reason;
      this.callbacks.forEach(cb => cb());
    };
    
    try {
      executor(resolve, reject);
    } catch (e) {
      reject(e);
    }
  }
  
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const callback = () => {
        try {
          if (this.state === 'fulfilled') {
            const result = onFulfilled(this.value);
            resolve(result);
          } else {
            const result = onRejected(this.value);
            resolve(result);  // 捕获错误后转为成功
          }
        } catch (e) {
          reject(e);
        }
      };
      
      if (this.state !== 'pending') {
        queueMicrotask(callback);
      } else {
        this.callbacks.push(callback);
      }
    });
  }
}
```

**链式调用原理：**
每个 then 返回新 Promise，前一个的结果传递给下一个。

```js
Promise.resolve(1)
  .then(v => v + 1)      // 返回 Promise(2)
  .then(v => v * 2)      // 返回 Promise(4)
  .then(console.log);    // 4
```

**知识点：** `Promise` `微任务` `链式调用` `then 实现`

:::

---

### Q12: Promise.finally 的作用是什么？和 .then(() => {}, () => {}) 的区别？

> **🔥 中等 · JavaScript**

请说明 finally 的用途和特点。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Promise.finally 特点：**
- 无论成功失败都会执行
- 不接收任何参数（不知道前一个状态）
- 返回原 Promise 的结果

**与 then 对比：**
```js
// finally - 不改变结果
Promise.resolve(1)
  .finally(() => {
    console.log('cleanup');
    return 999;  // 被忽略
  })
  .then(v => console.log(v));  // 1

// then(() => {}, () => {}) - 可以改变结果
Promise.resolve(1)
  .then(
    v => v,
    e => 999  // 如果有错误，会返回 999
  );
```

**finally 使用场景：**
```js
// 1. 隐藏 loading
fetchData()
  .then(setData)
  .catch(showError)
  .finally(() => hideLoading());

// 2. 清理资源
let connection;
db.connect()
  .then(c => {
    connection = c;
    return db.query(connection);
  })
  .finally(() => {
    if (connection) connection.close();
  });

// 3. 重试前重置
async function retry(fn, times) {
  for (let i = 0; i < times; i++) {
    try {
      return await fn();
    } catch (e) {
      // 清理后重试
      await cleanup().finally(() => {});
    }
  }
}
```

**finally 返回值规则：**
```js
// finally 返回正常值 - 传递原结果
Promise.resolve(1).finally(() => 2);  // 1

// finally 返回 Promise - 等待它完成
Promise.resolve(1).finally(() => delay(1000));  // 1 秒后 resolve(1)

// finally 抛出错误 - 覆盖原结果
Promise.resolve(1).finally(() => { throw 'error'; });  // reject('error')
```

**实现示例：**
```js
Promise.prototype.finally = function(callback) {
  return this.then(
    v => Promise.resolve(callback()).then(() => v),
    e => Promise.resolve(callback()).then(() => { throw e; })
  );
};
```

**知识点：** `Promise.finally` `清理操作` `结果传递`

:::

---

### Q13: 如何实现 Promise 的并发控制？（限制同时请求数量）

> **💀 困难 · JavaScript**

请实现一个限制并发数量的 Promise 调度器。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**并发控制实现：**

```js
class PromiseScheduler {
  constructor(limit) {
    this.limit = limit;
    this.running = 0;
    this.queue = [];
  }
  
  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.run();
    });
  }
  
  run() {
    while (this.running < this.limit && this.queue.length > 0) {
      this.running++;
      const { task, resolve, reject } = this.queue.shift();
      
      task()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.running--;
          this.run();
        });
    }
  }
}

// 使用
const scheduler = new PromiseScheduler(3);  // 最多 3 个并发

const tasks = Array.from({ length: 10 }, (_, i) => 
  () => fetch(`/api/${i}`).then(r => r.json())
);

Promise.all(tasks.map(t => scheduler.add(t)))
  .then(results => console.log('全部完成', results));
```

**简化函数版本：**
```js
function concurrentExec(tasks, limit) {
  return new Promise((resolve, reject) => {
    let idx = 0;
    let running = 0;
    const results = [];
    let finished = false;
    
    function run() {
      while (running < limit && idx < tasks.length) {
        const i = idx++;
        running++;
        
        tasks[i]()
          .then(res => { results[i] = res; })
          .catch(reject)
          .finally(() => {
            running--;
            if (finished) return;
            if (idx >= tasks.length && running === 0) {
              finished = true;
              resolve(results);
            } else {
              run();
            }
          });
      }
    }
    
    run();
  });
}
```

**应用场景：**
- 批量 API 请求避免服务器压力
- 图片并发加载
- 数据库连接池
- 爬虫请求限速

**知识点：** `Promise 并发` `限流` `任务队列` `调度器`

:::

---

### Q14: Promise 中的回调是微任务，那 new Promise(() => {}) 中的代码呢？

> **🔥 中等 · JavaScript**

请说明 Promise 执行器的执行时机。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**new Promise 中的执行器是同步执行的**。

```js
console.log('script start');

new Promise((resolve) => {
  console.log('executor');  // 同步执行
  resolve();
}).then(() => {
  console.log('then');  // 微任务
});

console.log('script end');

// 输出顺序：
// script start
// executor
// script end
// then
```

**执行时机对比：**
```js
// 1. Promise 执行器 - 同步
const p1 = new Promise(() => {
  console.log(1);  // 立即执行
});

// 2. then 回调 - 微任务
p1.then(() => {
  console.log(2);  // 当前宏任务结束后
});

// 3. setTimeout - 宏任务
setTimeout(() => {
  console.log(3);  // 下一个宏任务
}, 0);

// 输出：1, 2, 3
```

**实际影响：**
```js
// 如果执行器中有耗时操作，会阻塞主线程
new Promise(() => {
  // 耗时计算会阻塞页面
  let sum = 0;
  for (let i = 0; i < 1e9; i++) sum += i;
});

// 正确做法：用 setTimeout 包裹
const heavyTask = () => new Promise(resolve => {
  setTimeout(() => {
    let sum = 0;
    for (let i = 0; i < 1e9; i++) sum += i;
    resolve(sum);
  }, 0);
});
```

**React useEffect 中的陷阱：**
```js
// ❌ 错误：执行器同步执行
useEffect(() => {
  new Promise(() => {
    // 这里同步执行，可能访问未准备好的数据
    loadData();
  });
}, []);

// ✅ 正确
useEffect(() => {
  const loadData = async () => {
    // 异步执行
  };
  loadData();
}, []);
```

**知识点：** `Promise 执行器` `同步执行` `微任务` `执行时机`

:::

---

### Q15: 如何实现一个带超时的 Promise？(Promise.race 用法)

> **🔥 中等 · JavaScript**

请实现带超时控制的 Promise。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**方式 1：Promise.race 超时**
```js
function withTimeout(promise, timeout, errorMessage = '超时') {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeout);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

// 使用
withTimeout(fetch('/api/data'), 5000)
  .then(r => r.json())
  .catch(e => {
    if (e.message === '超时') {
      console.log('请求超时');
    }
  });
```

**方式 2：AbortController 超时（推荐）**
```js
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
```

**方式 3：封装通用超时函数**
```js
function timeout(ms) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
  });
}

// 使用
Promise.race([
  fetch('/api/data'),
  timeout(5000)
])
.then(r => r.json())
.catch(e => console.error(e));
```

**方式 4：Promise.withResolvers + race**
```js
function createTimeoutPromise(timeout) {
  const { promise, reject } = Promise.withResolvers();
  const timeoutId = setTimeout(
    () => reject(new Error('Timeout')),
    timeout
  );
  return { promise, cancel: () => clearTimeout(timeoutId) };
}
```

**实际应用 - 请求重试 + 超时：**
```js
async function fetchWithRetry(url, options = {}) {
  const { maxRetries = 3, timeout = 5000 } = options;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await withTimeout(fetch(url), timeout);
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

**知识点：** `Promise.race` `超时控制` `AbortController` `请求管理`

:::
