---
title: 手写 Promise 面试题
description: 覆盖 Promise 三状态/then 链/all/race/微任务/错误处理等 10 道题
---

# 手写 Promise 面试题

### Q1: Promise 三状态机制

> **⭐ 简单 · Promise 基础**

请解释 Promise 的三种状态及其转换规则。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Promise 三种状态：**

1. **pending**（等待态）：初始状态，既未 fulfilled 也未 rejected
2. **fulfilled**（成功态）：操作成功完成
3. **rejected**（失败态）：操作失败

**状态转换规则：**
- pending → fulfilled（调用 resolve）
- pending → rejected（调用 reject）
- **状态一旦改变，不可逆转**

```js
class MyPromise {
  static PENDING = 'pending'
  static FULFILLED = 'fulfilled'
  static REJECTED = 'rejected'
  
  constructor(executor) {
    this._state = MyPromise.PENDING
    this._value = null
    this._reason = null
    this._onFulfilledCallbacks = []
    this._onRejectedCallbacks = []
    
    const resolve = (value) => {
      if (this._state !== MyPromise.PENDING) return
      this._state = MyPromise.FULFILLED
      this._value = value
      this._onFulfilledCallbacks.forEach(fn => fn())
    }
    
    const reject = (reason) => {
      if (this._state !== MyPromise.PENDING) return
      this._state = MyPromise.REJECTED
      this._reason = reason
      this._onRejectedCallbacks.forEach(fn => fn())
    }
    
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }
}
```

**知识点：** `三态` `状态不可逆` `异步回调队列`

:::

### Q2: then 链式调用与返回值

> **🔥 中等 · Promise 核心**

请实现 then 方法，支持链式调用和返回值处理。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
class MyPromise {
  // ... constructor同上 ...
  
  then(onFulfilled, onRejected) {
    // 参数可选，需要透传
    onFulfilled = typeof onFulfilled === 'function' 
      ? onFulfilled 
      : value => value
    onRejected = typeof onRejected === 'function' 
      ? onRejected 
      : reason => { throw reason }
    
    return new MyPromise((resolve, reject) => {
      const fulfilledFn = () => {
        try {
          const x = onFulfilled(this._value)
          this._resolvePromise(x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      }
      
      const rejectedFn = () => {
        try {
          const x = onRejected(this._reason)
          this._resolvePromise(x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      }
      
      if (this._state === MyPromise.FULFILLED) {
        queueMicrotask(fulfilledFn)
      } else if (this._state === MyPromise.REJECTED) {
        queueMicrotask(rejectedFn)
      } else {
        this._onFulfilledCallbacks.push(fulfilledFn)
        this._onRejectedCallbacks.push(rejectedFn)
      }
    })
  }
  
  _resolvePromise(x, resolve, reject) {
    if (x === this) {
      return reject(new TypeError('Chaining cycle detected'))
    }
    
    let called = false
    
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      try {
        const then = x.then
        if (typeof then === 'function') {
          then.call(x, 
            y => {
              if (called) return
              called = true
              this._resolvePromise(y, resolve, reject)
            },
            r => {
              if (called) return
              called = true
              reject(r)
            }
          )
        } else {
          resolve(x)
        }
      } catch (e) {
        if (!called) reject(e)
      }
    } else {
      resolve(x)
    }
  }
}
```

**知识点：** `链式调用` `then 返回值` `Promise 解析`

:::

### Q3: Promise.resolve 和 Promise.reject

> **⭐ 简单 · Promise 静态方法**

请实现 Promise.resolve 和 Promise.reject。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
class MyPromise {
  static resolve(value) {
    if (value instanceof MyPromise) {
      return value
    }
    return new MyPromise(resolve => resolve(value))
  }
  
  static reject(reason) {
    return new MyPromise((resolve, reject) => reject(reason))
  }
}

// 使用示例
MyPromise.resolve(42).then(console.log) // 42
MyPromise.reject(new Error('oops')).catch(console.error)
```

**知识点：** `静态方法` `值包装` `Promise 透传`

:::

### Q4: Promise.all / race / allSettled / any

> **🔥 中等 · Promise 组合**

请实现 Promise.all、race、allSettled、any 方法。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
class MyPromise {
  // Promise.all（全部成功才成功，一个失败则失败）
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = []
      let completed = 0
      
      if (promises.length === 0) {
        resolve(results)
        return
      }
      
      promises.forEach((p, i) => {
        MyPromise.resolve(p).then(
          value => {
            results[i] = value
            completed++
            if (completed === promises.length) {
              resolve(results)
            }
          },
          reject
        )
      })
    })
  }
  
  // Promise.race（第一个完成的结果）
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(p => {
        MyPromise.resolve(p).then(resolve, reject)
      })
    })
  }
  
  // Promise.allSettled（等待所有完成，返回状态）
  static allSettled(promises) {
    return new MyPromise((resolve) => {
      const results = []
      let completed = 0
      
      if (promises.length === 0) {
        resolve(results)
        return
      }
      
      promises.forEach((p, i) => {
        MyPromise.resolve(p).then(
          value => {
            results[i] = { status: 'fulfilled', value }
            completed++
            if (completed === promises.length) resolve(results)
          },
          reason => {
            results[i] = { status: 'rejected', reason }
            completed++
            if (completed === promises.length) resolve(results)
          }
        )
      })
    })
  }
  
  // Promise.any（第一个成功的，都失败则抛 AggregateError）
  static any(promises) {
    return new MyPromise((resolve, reject) => {
      const errors = []
      let failed = 0
      
      if (promises.length === 0) {
        reject(new AggregateError([], 'All promises were rejected'))
        return
      }
      
      promises.forEach((p, i) => {
        MyPromise.resolve(p).then(resolve, reason => {
          errors[i] = reason
          failed++
          if (failed === promises.length) {
            reject(new AggregateError(errors, 'All promises were rejected'))
          }
        })
      })
    })
  }
}
```

**知识点：** `Promise 组合` `并发处理` `错误聚合`

:::

### Q5: 微任务 queueMicrotask

> **⭐ 简单 · 事件循环**

请解释 Promise 微任务的实现原理。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 微任务实现（使用 MutationObserver 模拟）
const queueMicrotaskPolyfill = (function() {
  let pending = false
  const queue = []
  
  const observer = new MutationObserver(() => {
    pending = false
    const callbacks = queue.slice()
    queue.length = 0
    callbacks.forEach(fn => fn())
  })
  
  const node = document.createTextNode('')
  observer.observe(node, { characterData: true })
  
  return function(fn) {
    queue.push(fn)
    if (!pending) {
      node.data = Date.now()
      pending = true
    }
  }
})()

// 在 Promise 中使用微任务
class MyPromise {
  then(onFulfilled, onRejected) {
    return new MyPromise((resolve, reject) => {
      const fulfilledFn = () => {
        // ... 
      }
      
      if (this._state === MyPromise.FULFILLED) {
        // 使用微任务确保异步执行
        queueMicrotask(fulfilledFn)
      }
    })
  }
}
```

**事件循环顺序：**
1. 同步代码
2. 微任务（Promise.then、queueMicrotask、MutationObserver）
3. 渲染
4. 宏任务（setTimeout、setInterval、I/O）

**知识点：** `微任务` `事件循环` `异步时机`

:::

### Q6: 错误冒泡机制

> **🔥 中等 · 错误处理**

请解释 Promise 链中的错误冒泡机制并实现 catch 方法。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
class MyPromise {
  // catch 是 then 的语法糖
  catch(onRejected) {
    return this.then(null, onRejected)
  }
  
  // finally（不接收参数，不影响链的值）
  finally(onFinally) {
    return this.then(
      value => MyPromise.resolve(onFinally()).then(() => value),
      reason => MyPromise.resolve(onFinally()).then(() => { throw reason })
    )
  }
}

// 错误冒泡示例
new MyPromise((resolve, reject) => {
  reject(new Error('初始错误'))
})
  .then(value => {
    console.log('不会执行', value)
    return 42
  })
  .then(value => {
    console.log('不会执行', value)
    return 100
  })
  .catch(err => {
    console.log('捕获错误:', err.message)
    return '恢复值'
  })
  .then(value => {
    console.log('继续执行:', value) // '恢复值'
  })
```

**错误冒泡规则：**
1. 链中任何位置抛出错误，会跳到下一个 catch
2. catch 可以恢复链的执行
3. catch 中抛出错误，继续向后冒泡

**知识点：** `错误冒泡` `catch` `链式恢复`

:::

### Q7: Promise 并发限制（N 个一组）

> **💀 困难 · Promise 应用**

请实现限制并发数的 Promise 执行函数。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 方法一：控制正在执行的数量
function promiseAllLimit(tasks, limit) {
  return new MyPromise((resolve, reject) => {
    const results = new Array(tasks.length)
    let completed = 0
    let index = 0
    let running = 0
    
    function runNext() {
      while (running < limit && index < tasks.length) {
        const currentIndex = index++
        running++
        MyPromise.resolve(tasks[currentIndex]())
          .then(value => {
            results[currentIndex] = value
            completed++
            running--
            if (completed === tasks.length) {
              resolve(results)
            } else {
              runNext()
            }
          })
          .catch(reject)
      }
    }
    
    runNext()
  })
}

// 方法二：N 个一组执行
async function promiseBatch(tasks, batchSize) {
  const results = []
  for (let i = 0; i < tasks.length; i += batchSize) {
    const batch = tasks.slice(i, i + batchSize)
    const batchResults = await MyPromise.all(batch.map(task => task()))
    results.push(...batchResults)
  }
  return results
}

// 使用示例
const tasks = [
  () => fetch('/api/1'),
  () => fetch('/api/2'),
  () => fetch('/api/3'),
  () => fetch('/api/4'),
  () => fetch('/api/5')
]
promiseAllLimit(tasks, 2) // 最多 2 个并发
```

**知识点：** `并发控制` `任务队列` `限流`

:::

### Q8: 完整 Promise 实现（APLUS 规范）

> **💀 困难 · Promise 综合**

请实现符合 Promise/A+ 规范的完整 Promise。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
const PENDING = 'pending'
const FULFILLED = 'fulfilled'
const REJECTED = 'rejected'

class MyPromise {
  constructor(executor) {
    this._state = PENDING
    this._value = null
    this._reason = null
    this._onFulfilledCallbacks = []
    this._onRejectedCallbacks = []
    
    const resolve = (value) => {
      if (this._state !== PENDING) return
      this._state = FULFILLED
      this._value = value
      this._onFulfilledCallbacks.forEach(fn => fn())
    }
    
    const reject = (reason) => {
      if (this._state !== PENDING) return
      this._state = REJECTED
      this._reason = reason
      this._onRejectedCallbacks.forEach(fn => fn())
    }
    
    try {
      executor(resolve, reject)
    } catch (e) {
      reject(e)
    }
  }
  
  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : v => v
    onRejected = typeof onRejected === 'function' ? onRejected : r => { throw r }
    
    return new MyPromise((resolve, reject) => {
      const fulfilledFn = () => {
        try {
          const x = onFulfilled(this._value)
          this._resolvePromise(x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      }
      
      const rejectedFn = () => {
        try {
          const x = onRejected(this._reason)
          this._resolvePromise(x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      }
      
      if (this._state === FULFILLED) queueMicrotask(fulfilledFn)
      else if (this._state === REJECTED) queueMicrotask(rejectedFn)
      else {
        this._onFulfilledCallbacks.push(fulfilledFn)
        this._onRejectedCallbacks.push(rejectedFn)
      }
    })
  }
  
  _resolvePromise(x, resolve, reject) {
    if (x === this) return reject(new TypeError('Cycle'))
    
    let called = false
    if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
      try {
        const then = x.then
        if (typeof then === 'function') {
          then.call(x, 
            y => { if (!called) { called = true; this._resolvePromise(y, resolve, reject) } },
            r => { if (!called) { called = true; reject(r) } }
          )
        } else resolve(x)
      } catch (e) {
        if (!called) reject(e)
      }
    } else resolve(x)
  }
  
  catch(onRejected) { return this.then(null, onRejected) }
  
  finally(onFinally) {
    return this.then(
      v => MyPromise.resolve(onFinally()).then(() => v),
      r => MyPromise.resolve(onFinally()).then(() => { throw r })
    )
  }
  
  static resolve(value) {
    if (value instanceof MyPromise) return value
    return new MyPromise(resolve => resolve(value))
  }
  
  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason))
  }
  
  static all(promises) {
    return new MyPromise((resolve, reject) => {
      const results = []
      let completed = 0
      if (promises.length === 0) return resolve(results)
      promises.forEach((p, i) => {
        MyPromise.resolve(p).then(v => {
          results[i] = v
          if (++completed === promises.length) resolve(results)
        }, reject)
      })
    })
  }
  
  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(p => MyPromise.resolve(p).then(resolve, reject))
    })
  }
}
```

**知识点：** `Promise/A+` `完整实现` `规范兼容`

:::
### Q9: 手写 EventBus（发布订阅模式）

> **🔥 中等 · 手写代码**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
class EventBus {
  constructor() {
    this.events = new Map()
  }

  // 订阅事件
  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event).add(handler)
    return this // 支持链式调用
  }

  // 只订阅一次
  once(event, handler) {
    const wrapper = (...args) => {
      handler.apply(this, args)
      this.off(event, wrapper)
    }
    this.on(event, wrapper)
    return this
  }

  // 取消订阅
  off(event, handler) {
    if (!this.events.has(event)) return this
    if (handler) {
      this.events.get(event).delete(handler)
      // 如果事件没有监听器了，删除该事件
      if (this.events.get(event).size === 0) {
        this.events.delete(event)
      }
    } else {
      // 不传 handler 则移除该事件所有监听
      this.events.delete(event)
    }
    return this
  }

  // 触发事件
  emit(event, ...args) {
    if (!this.events.has(event)) return this
    this.events.get(event).forEach(handler => {
      handler.apply(this, args)
    })
    return this
  }

  // 清空所有事件
  clear() {
    this.events.clear()
    return this
  }
}

// 使用示例
const bus = new EventBus()

bus.on('login', (user) => {
  console.log(`欢迎 ${user}`)
})

bus.once('first-visit', () => {
  console.log('首次访问奖励')
})

bus.emit('login', '张三')  // 欢迎 张三
bus.emit('first-visit')     // 首次访问奖励
bus.emit('first-visit')     // 不触发（已自动移除）

bus.off('login')
bus.emit('login', '李四')  // 不触发
```

**面试延伸：**

```js
// Vue 3 中使用 mitt 库
import mitt from 'mitt'
const emitter = mitt()

// React 中使用自实现 EventBus 或 zustand
// 注意：EventBus 在框架中容易造成内存泄漏，组件卸载时务必 off
useEffect(() => {
  bus.on('event', handler)
  return () => bus.off('event', handler) // cleanup!
}, [])
```

**知识点：** `EventBus` `发布订阅模式` `once` `内存泄漏` `链式调用`

:::
### Q10: 手写 AJAX 请求

> **⭐ 简单 · 手写代码**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
function ajax(options) {
  const { method = 'GET', url, data = null, headers = {}, timeout = 10000 } = options

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    // 超时
    xhr.timeout = timeout
    xhr.ontimeout = () => reject(new Error('请求超时'))

    // 状态变化
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return
      
      if (xhr.status >= 200 && xhr.status < 300) {
        const contentType = xhr.getResponseHeader('Content-Type')
        const response = contentType?.includes('application/json')
          ? JSON.parse(xhr.responseText)
          : xhr.responseText
        resolve(response)
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`))
      }
    }

    xhr.onerror = () => reject(new Error('网络错误'))

    // 发送请求
    xhr.open(method, url, true)

    // 设置请求头
    if (data && typeof data === 'object') {
      xhr.setRequestHeader('Content-Type', 'application/json')
    }
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value)
    })

    xhr.send(data ? JSON.stringify(data) : null)
  })
}

// 使用
ajax({
  method: 'POST',
  url: '/api/users',
  data: { name: 'Tom', age: 25 },
  headers: { Authorization: 'Bearer xxx' }
}).then(data => console.log(data))
  .catch(err => console.error(err))
```

**readyState 状态值：**

| 值 | 状态 | 含义 |
|----|------|------|
| 0 | UNSENT | XMLHttpRequest已创建 |
| 1 | OPENED | open()已调用 |
| 2 | HEADERS_RECEIVED | send()已调用，头部已获取 |
| 3 | LOADING | 下载中 |
| 4 | DONE | 请求完成 |

**知识点：** `AJAX` `XMLHttpRequest` `Promise封装` `HTTP请求`

:::

### Q11: 手写 rem 适配方案

> **⭐ 简单 · 手写代码**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**rem适配原理：** 根据屏幕宽度动态设置html的fontSize，然后用rem单位布局。

```js
// 方案1：基础rem适配
function setRem() {
  const designWidth = 375   // 设计稿宽度
  const baseFontSize = 16  // 基准字号
  const scale = document.documentElement.clientWidth / designWidth
  document.documentElement.style.fontSize = baseFontSize * scale + 'px'
}

setRem()
window.addEventListener('resize', setRem)
window.addEventListener('pageshow', (e) => {
  if (e.persisted) setRem()  // 处理bfcache
})

// 方案2：限制最大最小宽度
function setRem() {
  const designWidth = 375
  const minWidth = 320
  const maxWidth = 750
  const baseFontSize = 37.5  // 设计稿375px = 10rem，1rem = 37.5px
  
  const clientWidth = Math.min(maxWidth, Math.max(minWidth, document.documentElement.clientWidth))
  const fontSize = clientWidth / designWidth * baseFontSize
  document.documentElement.style.fontSize = fontSize + 'px'
}

setRem()
window.addEventListener('resize', setRem)

// 方案3：配合 postcss-pxtorem 自动转换
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 37.5,        // 基准值（设计稿375/10）
      propList: ['*', '!border*'],  // 转换属性，排除border
      minPixelValue: 2         // 小于2px不转换
    }
  }
}

// 开发时写px，构建时自动转rem
// .box { width: 200px; }  →  .box { width: 5.3333rem; }
```

**rem vs vw vs viewport适配对比：**

| 方案 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| rem | 动态fontSize | 兼容性好 | 需要JS设置 |
| vw | 视口单位 | 纯CSS方案 | 兼容性稍差 |
| viewport meta | 缩放 | 简单 | 模糊问题 |

```html
<!-- 常用rem + viewport方案 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```

**知识点：** `rem适配` `移动端适配` `postcss-pxtorem` `viewport`

:::
