---
title: 手写事件发布订阅
description: EventEmitter 实现、发布订阅模式面试题
---

# 手写事件发布订阅

---

### Q1: 实现一个简单的 EventEmitter

> **⭐ 中等 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class EventEmitter {
  constructor() {
    this.events = new Map()
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event).push(callback)
    return () => this.off(event, callback)
  }

  off(event, callback) {
    const callbacks = this.events.get(event)
    if (!callbacks) return
    const index = callbacks.indexOf(callback)
    if (index !== -1) {
      callbacks.splice(index, 1)
    }
  }

  emit(event, ...args) {
    const callbacks = this.events.get(event)
    if (!callbacks) return false
    callbacks.forEach(cb => cb(...args))
    return true
  }

  once(event, callback) {
    const wrapper = (...args) => {
      this.off(event, wrapper)
      callback(...args)
    }
    return this.on(event, wrapper)
  }
}

// 使用
const emitter = new EventEmitter()
emitter.on('click', (e) => console.log('clicked', e))
emitter.emit('click', { x: 100, y: 200 })
emitter.off('click', callback)
```

**知识点：** `EventEmitter` `发布订阅` `on` `off` `emit`

:::

---

### Q2: 如何实现事件命名空间？

> **🔥 困难 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class NamespacedEventEmitter {
  constructor() {
    this.events = new Map()
    this.listeners = new Map() // listener -> Set<event>
  }

  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event).add(listener)

    // 记录 listener -> events 映射，方便批量取消
    if (!this.listeners.has(listener)) {
      this.listeners.set(listener, new Set())
    }
    this.listeners.get(listener).add(event)

    return () => this.off(event, listener)
  }

  off(event, listener) {
    const listeners = this.events.get(event)
    if (!listeners) return

    listeners.delete(listener)
    
    const events = this.listeners.get(listener)
    if (events) events.delete(event)
  }

  offAll(listener) {
    const events = this.listeners.get(listener)
    if (!events) return

    for (const event of events) {
      this.off(event, listener)
    }
    this.listeners.delete(listener)
  }

  emit(event, ...args) {
    const listeners = this.events.get(event)
    if (!listeners) return false
    listeners.forEach(fn => fn(...args))
    return true
  }
}

// 使用
const emitter = new NamespacedEventEmitter()
const handler1 = () => {}
const handler2 = () => {}

emitter.on('user:login', handler1)
emitter.on('user:logout', handler1)
emitter.on('page:load', handler2)

// 取消 handler1 的所有订阅
emitter.offAll(handler1)  // 移除了 user:login 和 user:logout
```

**知识点:**`EventEmitter` `命名空间` `offAll`

:::

---

### Q3: 如何实现优先级队列的事件系统？

> **💀 困难 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class PriorityEventEmitter {
  constructor() {
    this.events = new Map()
  }

  on(event, callback, priority = 0) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    
    const listeners = this.events.get(event)
    const item = { callback, priority, id: Symbol() }
    
    // 按优先级插入（高优先级在前）
    let inserted = false
    for (let i = 0; i < listeners.length; i++) {
      if (priority > listeners[i].priority) {
        listeners.splice(i, 0, item)
        inserted = true
        break
      }
    }
    if (!inserted) listeners.push(item)

    return () => this.off(event, item.id)
  }

  off(event, id) {
    const listeners = this.events.get(event)
    if (!listeners) return
    const index = listeners.findIndex(item => item.id === id)
    if (index !== -1) {
      listeners.splice(index, 1)
    }
  }

  emit(event, ...args) {
    const listeners = this.events.get(event)
    if (!listeners) return false
    
    // 按优先级顺序执行
    listeners.forEach(item => item.callback(...args))
    return true
  }
}

// 使用
const emitter = new PriorityEventEmitter()

emitter.on('submit', () => console.log('低优先级'), 1)
emitter.on('submit', () => console.log('高优先级 - 先执行'), 10)
emitter.on('submit', () => console.log('中优先级'), 5)

emitter.emit('submit')
// 输出顺序：高优先级 → 中优先级 → 低优先级
```

**知识点:**`EventEmitter` `优先级` `队列`

:::

---

### Q4: 如何实现异步事件总线？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class AsyncEventEmitter {
  constructor() {
    this.events = new Map()
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event).push(callback)
    return () => this.off(event, callback)
  }

  off(event, callback) {
    const callbacks = this.events.get(event)
    if (!callbacks) return
    const index = callbacks.indexOf(callback)
    if (index !== -1) callbacks.splice(index, 1)
  }

  async emit(event, ...args) {
    const callbacks = this.events.get(event)
    if (!callbacks) return []
    
    // 并发执行所有处理器
    const promises = callbacks.map(cb => cb(...args))
    return Promise.allSettled(promises)
  }

  async emitSeries(event, ...args) {
    const callbacks = this.events.get(event)
    if (!callbacks) return []
    
    // 串行执行
    const results = []
    for (const cb of callbacks) {
      try {
        results.push(await cb(...args))
      } catch (e) {
        results.push({ status: 'rejected', reason: e })
      }
    }
    return results
  }

  emitFirst(event, ...args) {
    const callbacks = this.events.get(event)
    if (!callbacks || callbacks.length === 0) return null
    
    // 返回第一个完成的
    return Promise.race(callbacks.map(cb => cb(...args)))
  }
}

// 使用
const bus = new AsyncEventEmitter()

bus.on('fetch', async (url) => {
  const res = await fetch(url)
  return res.json()
})

// 并发执行
await bus.emit('fetch', '/api/data')

// 串行执行
await bus.emitSeries('middleware', request, response)
```

**知识点:**`AsyncEventEmitter` `异步` `Promise.allSettled`

:::

---

### Q5: 如何实现带错误处理的 EventEmitter？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class SafeEventEmitter {
  constructor(options = {}) {
    this.events = new Map()
    this.maxListeners = options.maxListeners || 10
    this.silent = options.silent || false
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }

    const listeners = this.events.get(event)
    if (listeners.length >= this.maxListeners && !this.silent) {
      console.warn(
        `MaxListenersExceededWarning: ${event} has ${listeners.length} listeners`
      )
    }

    listeners.push(callback)
    return () => this.off(event, callback)
  }

  off(event, callback) {
    const callbacks = this.events.get(event)
    if (!callbacks) return
    const index = callbacks.indexOf(callback)
    if (index !== -1) callbacks.splice(index, 1)
  }

  emit(event, ...args) {
    const callbacks = this.events.get(event)
    if (!callbacks) return false

    const errors = []
    const results = []

    for (const cb of callbacks) {
      try {
        results.push(cb(...args))
      } catch (err) {
        errors.push(err)
        // 可选：触发 error 事件
        this.emit('error', { event, error: err, callback: cb })
      }
    }

    return errors.length === 0
  }

  async emitAsync(event, ...args) {
    const callbacks = this.events.get(event)
    if (!callbacks) return { results: [], errors: [] }

    const results = []
    const errors = []

    for (const cb of callbacks) {
      try {
        results.push(await cb(...args))
      } catch (err) {
        errors.push({ error: err, callback: cb })
      }
    }

    return { results, errors }
  }

  setMaxListeners(n) {
    this.maxListeners = n
  }

  getMaxListeners() {
    return this.maxListeners
  }

  listenerCount(event) {
    return this.events.get(event)?.length || 0
  }

  removeAllListeners(event) {
    if (event) {
      this.events.delete(event)
    } else {
      this.events.clear()
    }
  }
}

// 使用
const emitter = new SafeEventEmitter({ maxListeners: 5 })

emitter.on('data', (data) => {
  if (data.invalid) throw new Error('Invalid data')
  console.log(data)
})

emitter.on('error', ({ event, error }) => {
  console.error(`Error in ${event}:`, error.message)
})

emitter.emit('data', { invalid: true })  // 不会抛出未捕获异常
```

**知识点:**`EventEmitter` `错误处理` `maxListeners`

:::

---

### Q6: 如何实现一个支持通配符的 EventEmitter？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class WildcardEventEmitter {
  constructor() {
    this.events = new Map()
    this.wildcardHandlers = new Map() // pattern -> handlers
  }

  on(event, callback, options = {}) {
    const { wildcard = false } = options

    if (wildcard) {
      // 通配符订阅
      if (!this.wildcardHandlers.has(event)) {
        this.wildcardHandlers.set(event, [])
      }
      this.wildcardHandlers.get(event).push(callback)
    } else {
      // 精确订阅
      if (!this.events.has(event)) {
        this.events.set(event, [])
      }
      this.events.get(event).push(callback)
    }

    return () => this.off(event, callback, { wildcard })
  }

  off(event, callback, options = {}) {
    const { wildcard = false } = options

    if (wildcard) {
      const handlers = this.wildcardHandlers.get(event)
      if (!handlers) return
      const index = handlers.indexOf(callback)
      if (index !== -1) handlers.splice(index, 1)
    } else {
      const handlers = this.events.get(event)
      if (!handlers) return
      const index = handlers.indexOf(callback)
      if (index !== -1) handlers.splice(index, 1)
    }
  }

  emit(event, ...args) {
    let emitted = false

    // 1. 触发精确匹配
    const exactHandlers = this.events.get(event)
    if (exactHandlers) {
      exactHandlers.forEach(h => h(event, ...args))
      emitted = true
    }

    // 2. 触发通配符匹配
    for (const [pattern, handlers] of this.wildcardHandlers) {
      if (this.matchesPattern(event, pattern)) {
        handlers.forEach(h => h(event, ...args))
        emitted = true
      }
    }

    return emitted
  }

  matchesPattern(event, pattern) {
    // 支持 *（匹配单级）和 **（匹配多级）
    if (pattern === '*') return true
    
    const patternParts = pattern.split('.')
    const eventParts = event.split('.')

    return this.matchParts(eventParts, patternParts)
  }

  matchParts(eventParts, patternParts) {
    let ei = 0, pi = 0

    while (ei < eventParts.length && pi < patternParts.length) {
      if (patternParts[pi] === '**') {
        // ** 匹配剩余所有
        if (pi === patternParts.length - 1) return true
        // 否则，尝试匹配后续部分
        for (let i = ei; i < eventParts.length; i++) {
          if (this.matchParts(eventParts.slice(i), patternParts.slice(pi + 1))) {
            return true
          }
        }
        return false
      }

      if (patternParts[pi] !== '*' && patternParts[pi] !== eventParts[ei]) {
        return false
      }

      ei++
      pi++
    }

    return ei === eventParts.length && pi === patternParts.length
  }
}

// 使用
const emitter = new WildcardEventEmitter()

// 订阅所有 user 事件
emitter.on('user.*', (event, data) => {
  console.log(`User event: ${event}`, data)
}, { wildcard: true })

// 订阅所有事件
emitter.on('*', (event, data) => {
  console.log('Any event:', event)
}, { wildcard: true })

// 深层通配符
emitter.on('api.**.success', (event, data) => {
  console.log('API success:', event)
}, { wildcard: true })

// 触发
emitter.emit('user.login', { userId: 123 })      // 匹配 user.*
emitter.emit('api.v1.users.create.success', {})  // 匹配 api.**.success
```

**知识点:**`EventEmitter` `通配符` `模式匹配`

:::

---

### Q7: 手写 EventEmitter（on/off/emit/once/offAll）

> **🔥 中等 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class EventEmitter {
  constructor() {
    this._events = Object.create(null)  // 无原型对象
    this._maxListeners = 10
    this._onceListeners = new Map()     // once 回调映射
  }

  // 注册事件监听
  on(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function')
    }

    if (!this._events[event]) {
      this._events[event] = []
    }

    // 检查监听器数量限制
    if (this._events[event].length >= this._maxListeners) {
      console.warn(
        `MaxListenersExceededWarning: ${event} has ${this._events[event].length} listeners`
      )
    }

    this._events[event].push(listener)
    return this
  }

  // 移除事件监听
  off(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function')
    }

    const listeners = this._events[event]
    if (!listeners) return this

    const index = listeners.indexOf(listener)
    if (index !== -1) {
      listeners.splice(index, 1)
    }

    // 清理空数组
    if (listeners.length === 0) {
      delete this._events[event]
    }

    return this
  }

  // 触发事件
  emit(event, ...args) {
    const listeners = this._events[event]
    if (!listeners) return false

    // 复制数组，防止 emit 过程中数组变化
    const listenersCopy = listeners.slice()
    
    for (const listener of listenersCopy) {
      try {
        listener.apply(this, args)
      } catch (err) {
        // 异步错误处理
        setTimeout(() => { throw err })
      }
    }

    return true
  }

  // 一次性监听
  once(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function')
    }

    const onceWrapper = (...args) => {
      this.off(event, onceWrapper)
      this._onceListeners.delete(onceWrapper)
      listener.apply(this, args)
    }

    // 存储映射，支持 off 移除 once 回调
    this._onceListeners.set(listener, onceWrapper)
    this._onceListeners.set(onceWrapper, listener)

    return this.on(event, onceWrapper)
  }

  // 移除单个监听器的所有订阅
  offAll(listener) {
    for (const event of Object.keys(this._events)) {
      const listeners = this._events[event]
      if (!listeners) continue

      // 查找直接订阅
      const index = listeners.indexOf(listener)
      if (index !== -1) {
        listeners.splice(index, 1)
      }

      // 查找 once 包装
      const onceWrapper = this._onceListeners.get(listener)
      if (onceWrapper) {
        const wrapperIndex = listeners.indexOf(onceWrapper)
        if (wrapperIndex !== -1) {
          listeners.splice(wrapperIndex, 1)
        }
      }

      // 清理
      if (listeners.length === 0) {
        delete this._events[event]
      }
    }

    return this
  }

  // 移除事件的所有监听
  removeAllListeners(event) {
    if (event) {
      delete this._events[event]
    } else {
      for (const key of Object.keys(this._events)) {
        delete this._events[key]
      }
    }
    this._onceListeners.clear()
    return this
  }

  // 获取监听器数量
  listenerCount(event) {
    const listeners = this._events[event]
    return listeners ? listeners.length : 0
  }

  // 获取所有事件名
  eventNames() {
    return Object.keys(this._events)
  }

  // 设置最大监听器数量
  setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || Number.isNaN(n)) {
      throw new RangeError('n must be a non-negative number')
    }
    this._maxListeners = n
    return this
  }

  // 获取最大监听器数量
  getMaxListeners() {
    return this._maxListeners
  }
}

// 使用示例
const emitter = new EventEmitter()

// 基本使用
const handler = (data) => console.log('收到:', data)

emitter.on('message', handler)
emitter.emit('message', 'Hello')

// once 使用
emitter.once('single', () => console.log('只执行一次'))
emitter.emit('single')
emitter.emit('single')  // 不会执行

// 移除监听
emitter.off('message', handler)

// offAll 使用
emitter.on('a', handler)
emitter.on('b', handler)
emitter.offAll(handler)  // 移除 handler 在所有事件上的订阅

// 链式调用
emitter
  .on('event1', () => {})
  .on('event2', () => {})
  .emit('event1', 'data')
```

**知识点:**`EventEmitter` `on` `off` `emit` `once` `offAll` `发布订阅`

:::

---

### Q8: 手写 once 方法的实现？

> **🔥 困难 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class EventEmitter {
  constructor() {
    this._events = {}
    this._wrapperMap = new WeakMap()  // 原始回调 -> 包装回调
  }

  on(event, listener) {
    if (!this._events[event]) {
      this._events[event] = []
    }
    this._events[event].push(listener)
    return this
  }

  off(event, listener) {
    const listeners = this._events[event]
    if (!listeners) return this

    const index = listeners.indexOf(listener)
    if (index !== -1) {
      listeners.splice(index, 1)
    }

    if (listeners.length === 0) {
      delete this._events[event]
    }
    return this
  }

  emit(event, ...args) {
    const listeners = this._events[event]
    if (!listeners) return false

    // 复制防止并发修改
    const listenersCopy = [...listeners]
    for (const listener of listenersCopy) {
      listener.apply(this, args)
    }
    return true
  }

  /**
   * once 实现 - 方法 1: WeakMap 存储映射
   */
  once(event, listener) {
    // 包装函数
    const wrapper = (...args) => {
      this.off(event, wrapper)
      listener.apply(this, args)
    }

    // 存储映射关系
    this._wrapperMap.set(listener, wrapper)

    return this.on(event, wrapper)
  }

  /**
   * once 实现 - 方法 2: 使用 once 标志
   */
  onceV2(event, listener) {
    let fired = false

    const wrapper = (...args) => {
      if (fired) return
      fired = true
      listener.apply(this, args)
      this.off(event, wrapper)
    }

    // 存储原始回调引用
    wrapper.listener = listener

    return this.on(event, wrapper)
  }
}

// 使用示例
const emitter = new EventEmitter()

const handler = (data) => console.log('触发:', data)

// once 测试
emitter.once('test', handler)

emitter.emit('test', '第一次')  // 输出：触发：第一次
emitter.emit('test', '第二次')  // 不会输出

// off 移除 once 回调
emitter.once('test2', handler)
emitter.off('test2', handler)  // 通过 WeakMap 也可以找到 wrapper

// Promise 版本
function oncePromise(emitter, event) {
  return new Promise((resolve) => {
    emitter.once(event, resolve)
  })
}

// 等待特定事件
const result = await oncePromise(emitter, 'done')
```

**知识点:**`once` `EventEmitter` `WeakMap` `闭包`

:::

---

### Q9: 手写带命名空间的 EventEmitter？

> **🔥 困难 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class NamespacedEventEmitter {
  constructor() {
    this._events = {}        // 事件 -> 回调数组
    this._subscriptions = {} // 回调 -> 事件 Set
  }

  // 支持命名空间：'user.created' 或 'user.*' 或 '*'
  on(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function')
    }

    if (!this._events[event]) {
      this._events[event] = []
    }
    this._events[event].push(listener)

    // 记录订阅关系，用于快速 offAll
    if (!this._subscriptions[listener]) {
      this._subscriptions[listener] = new Set()
    }
    this._subscriptions[listener].add(event)

    return () => this.off(event, listener)
  }

  off(event, listener) {
    const listeners = this._events[event]
    if (!listeners || !listener) return this

    const index = listeners.indexOf(listener)
    if (index !== -1) {
      listeners.splice(index, 1)
    }

    // 清理订阅记录
    const subscribed = this._subscriptions[listener]
    if (subscribed) {
      subscribed.delete(event)
      if (subscribed.size === 0) {
        delete this._subscriptions[listener]
      }
    }

    // 清理空数组
    if (listeners.length === 0) {
      delete this._events[event]
    }

    return this
  }

  // 匹配事件和模式
  _matches(event, pattern) {
    // 精确匹配
    if (event === pattern) return true
    
    // * 匹配
    if (pattern === '*') return true
    
    const patternParts = pattern.split('.')
    const eventParts = event.split('.')
    
    // 逐级匹配
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i] === '*') {
        // * 匹配当前级
        continue
      }
      if (patternParts[i] !== eventParts[i]) {
        return false
      }
    }
    
    // 如果 pattern 更长，需要特殊处理
    return patternParts.length <= eventParts.length
  }

  // 触发事件（支持通配符）
  emit(event, ...args) {
    let emitted = false
    const matchedEvents = []

    // 查找所有匹配的事件
    for (const pattern of Object.keys(this._events)) {
      if (this._matches(event, pattern)) {
        matchedEvents.push(pattern)
      }
    }

    // 触发所有匹配的监听器
    for (const pattern of matchedEvents) {
      const listeners = this._events[pattern]
      if (listeners) {
        // 复制防止修改
        const copy = [...listeners]
        for (const listener of copy) {
          try {
            listener.apply(this, [event, ...args])
          } catch (err) {
            // 异步错误
            setTimeout(() => { throw err })
          }
        }
        emitted = true
      }
    }

    return emitted
  }

  // 移除监听器的所有订阅
  offAll(listener) {
    const subscribed = this._subscriptions[listener]
    if (!subscribed) return this

    // 复制 Set 防止并发修改
    for (const event of [...subscribed]) {
      this.off(event, listener)
    }

    return this
  }

  // 获取事件列表
  eventNames() {
    return Object.keys(this._events)
  }

  // 获取监听器数量
  listenerCount(event) {
    return this._events[event]?.length || 0
  }
}

// 使用示例
const emitter = new NamespacedEventEmitter()

// 命名空间订阅
emitter.on('user.created', (event, data) => {
  console.log('用户创建:', data)
})

emitter.on('user.*', (event, data) => {
  console.log('用户事件:', event, data)
})

emitter.on('*', (event, data) => {
  console.log('所有事件:', event, data)
})

// 触发
emitter.emit('user.created', { id: 1, name: 'Alice' })

// 输出：
// 用户创建：{ id: 1, name: 'Alice' }
// 用户事件：user.created { id: 1, name: 'Alice' }
// 所有事件：user.created { id: 1, name: 'Alice' }

// offAll 测试
const handler = () => {}
emitter.on('a.b.c', handler)
emitter.on('a.b.d', handler)
emitter.on('a.*', handler)

emitter.offAll(handler)  // 移除 handler 的所有订阅
```

**知识点:**`EventEmitter` `命名空间` `通配符` `offAll`

:::