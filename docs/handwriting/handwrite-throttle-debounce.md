---
title: 手写下防抖节流
description: debounce 和 throttle 实现及变种
---

# 手写下防抖节流

---

### Q1: 实现防抖函数（debounce）

> **⭐ 简单 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 基础版
function debounce(fn, delay) {
  let timer = null
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

// 使用
const search = debounce((query) => {
  console.log('搜索:', query)
}, 300)

input.addEventListener('input', (e) => {
  search(e.target.value)
})
```

**知识点：** `防抖` `debounce` `setTimeout`

:::

---

### Q2: 实现节流函数（throttle）

> **⭐ 简单 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 时间戳版
function throttle(fn, interval) {
  let lastTime = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

// 定时器版
function throttle2(fn, interval) {
  let timer = null
  return function (...args) {
    if (timer) return
    timer = setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, interval)
  }
}

// 使用
const handleScroll = throttle(() => {
  console.log('滚动')
}, 100)

window.addEventListener('scroll', handleScroll)
```

**知识点：** `节流` `throttle` `间隔`

:::

---

### Q3: 防抖和节流的区别？使用场景？

> **🔥 中等 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 特性 | 防抖 | 节流 |
|------|------|------|
| 触发机制 | 最后一次触发后延迟执行 | 固定间隔执行一次 |
| 执行时机 | 事件停止后 | 事件进行中定时执行 |
| 调用次数 | 最多 1 次 | 多次（按间隔） |
| 适用场景 | 不关注中间值 | 需要持续反馈 |

**使用场景：**

```javascript
// 防抖场景：
// 1. 搜索框输入（只需最后一次）
debounce(search, 300)

// 2. 窗口大小调整（只做一次布局）
debounce(resize, 500)

// 3. 表单自动保存
debounce(save, 1000)

// 节流场景：
// 1. 滚动事件（持续响应）
throttle(onScroll, 100)

// 2. 按钮点击限制
throttle(submit, 1000)

// 3. 鼠标移动轨迹
throttle(trackMouse, 50)
```

**知识点：** `防抖` `节流` `区别`

:::

---

### Q4: 实现带立即执行选项的防抖

> **🔥 中等 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function debounce(fn, delay, immediate = false) {
  let timer = null
  
  return function (...args) {
    const callNow = immediate && !timer
    
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      if (!immediate) {
        fn.apply(this, args)
      }
    }, delay)
    
    if (callNow) {
      fn.apply(this, args)
    }
  }
}

// 使用 - 第一次立即执行，之后防抖
const handler = debounce(() => {
  alert('执行！')
}, 500, true)

handler()  // 立即执行
handler()  // 忽略，500ms 后再次触发才会立即执行
```

**知识点:**`debounce` `immediate` `立即执行`

:::

---

### Q5: 实现带取消功能的函数

> **🔥 困难 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 带取消的防抖
function debounce(fn, delay) {
  let timer = null
  
  const debounced = function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
  
  debounced.cancel = function () {
    clearTimeout(timer)
  }
  
  debounced.flush = function (...args) {
    clearTimeout(timer)
    fn.apply(this, args)
  }
  
  return debounced
}

// 带取消的节流
function throttle(fn, interval) {
  let lastTime = 0
  let timer = null
  
  const throttled = function (...args) {
    const now = Date.now()
    
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    } else {
      clearTimeout(timer)
      timer = setTimeout(() => {
        lastTime = Date.now()
        fn.apply(this, args)
      }, interval - (now - lastTime))
    }
  }
  
  throttled.cancel = function () {
    clearTimeout(timer)
  }
  
  return throttled
}

// 使用
const save = debounce(api.save, 1000)
save(data)
// 如果用户离开页面，可以取消
window.addEventListener('unload', () => {
  save.cancel()
})
```

**知识点:**`cancel` `flush` `取消`

:::

---

### Q6: 防抖节流组合（throttle + debounce）

> **🔥 困难 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 组合：节流基础上加防抖
// 高频触发时立即执行一次，然后节流，过低频阈值执行一次
function throttleDebounce(fn, delay) {
  let timer = null
  let lastRun = 0
  let pending = null
  
  const run = () => {
    lastRun = Date.now()
    fn.apply(this, pending)
    pending = null
  }
  
  return function (...args) {
    const now = Date.now()
    pending = args
    
    // 第一次立即执行
    if (!lastRun) {
      run.call(this)
      return
    }
    
    // 间隔内 - 防抖
    const remaining = delay - (now - lastRun)
    if (remaining <= 0) {
      clearTimeout(timer)
      run.call(this)
    } else if (!timer) {
      // 开启节流计时
      timer = setTimeout(() => {
        run.call(this)
        timer = null
      }, remaining)
    }
  }
}

// 简化版 - 先防抖后节流
function combined(fn, delay) {
  let timer = null
  let lastCall = 0
  
  return function (...args) {
    clearTimeout(timer)
    
    const now = Date.now()
    const elapsed = now - lastCall
    
    if (elapsed >= delay) {
      // 超过间隔 - 立即执行（节流）
      lastCall = now
      fn.apply(this, args)
    } else {
      // 间隔内 - 防抖
      timer = setTimeout(() => {
        lastCall = Date.now()
        fn.apply(this, args)
      }, delay - elapsed)
    }
  }
}
```

**知识点:**`组合` `防抖节流` `throttle` `debounce`

:::

---

### Q7: 手写带立即执行选项的 debounce（leading 选项）

> **🔥 中等 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
/**
 * 防抖函数 - 支持 leading 和 trailing 选项
 * @param {Function} fn - 要执行的函数
 * @param {number} wait - 等待毫秒数
 * @param {Object} options - 配置
 * @param {boolean} options.leading - 首调用
 * @param {boolean} options.trailing - 尾调用
 */
function debounce(fn, wait, options = {}) {
  const { leading = false, trailing = true } = options
  
  if (typeof fn !== 'function') {
    throw new TypeError('fn must be a function')
  }
  
  let timeout = null
  let result = undefined
  let lastCallTime = 0
  
  const debounced = function (...args) {
    const now = Date.now()
    
    // 清除之前的定时器
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    
    // 首次调用
    const isFirstCall = !lastCallTime
    
    lastCallTime = now
    
    if (leading && isFirstCall) {
      result = fn.apply(this, args)
    } else if (trailing) {
      timeout = setTimeout(() => {
        result = fn.apply(this, args)
      }, wait)
    }
    
    return result
  }
  
  // 取消
  debounced.cancel = function () {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    lastCallTime = 0
  }
  
  // 立即执行
  debounced.flush = function (...args) {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    lastCallTime = Date.now()
    return fn.apply(this, args)
  }
  
  return debounced
}

// 使用 - leading 模式
const search = debounce(
  (query) => console.log('搜索:', query),
  300,
  { leading: true, trailing: false }
)

// 第一次输入立即搜索，300ms 内的后续输入被忽略
```

**知识点:**`debounce` `leading` `选项`

:::

---

### Q8: 手写带取消功能的 throttle（cancel 方法）

> **🔥 中等 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
/**
 * 节流函数 - 支持取消
 * @param {Function} fn - 要执行的函数
 * @param {number} wait - 间隔毫秒数
 */
function throttle(fn, wait) {
  let timeout = null
  let previous = 0
  
  const throttled = function (...args) {
    const now = Date.now()
    const remaining = wait - (now - previous)
    
    if (remaining <= 0) {
      // 时间到了，立即执行
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      fn.apply(this, args)
    } else if (!timeout) {
      // 等待剩余时间
      timeout = setTimeout(() => {
        previous = Date.now()
        timeout = null
        fn.apply(this, args)
      }, remaining)
    }
  }
  
  // 取消
  throttled.cancel = function () {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    previous = 0
  }
  
  // 立即执行
  throttled.flush = function (...args) {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    previous = Date.now()
    return fn.apply(this, args)
  }
  
  return throttled
}

// 使用场景：组件卸载时取消
const resizeHandler = throttle(() => {
  console.log('窗口大小变化')
}, 200)

window.addEventListener('resize', resizeHandler)

// 组件卸载
function cleanup() {
  resizeHandler.cancel()
  window.removeEventListener('resize', resizeHandler)
}
```

**知识点:**`throttle` `cancel` `取消功能`

:::

---

### Q9: 防抖和节流的组合使用场景？

> **🔥 困难 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**场景 1：滚动监听（组合模式）**
```javascript
// 首次立即加载，然后节流
function loadMore() {
  console.log('加载更多数据')
}

// 滚动开始时立即加载，之后 1 秒节流
const onScroll = combined(getItems, 1000)
window.addEventListener('scroll', onScroll)
onScroll()  // 首次立即加载
```

**场景 2：视频播放追踪**
```javascript
// 暂停时防抖（避免频繁上报短暂停）
// 播放时节流（定期上报进度）
function trackPlaying(video) {
  const report = (event, time) => {
    api.report({ event, time, videoId: video.id })
  }
  
  // 播放开始时防抖上报
  const playReport = debounce(
    () => report('play', video.currentTime),
    2000
  )
  
  // 播放进度节流上报（每 30 秒）
  const progressReport = throttle(
    () => report('progress', video.currentTime),
    30000
  )
  
  video.addEventListener('play', playReport)
  video.addEventListener('timeupdate', progressReport)
}
```

**场景 3：即时通讯输入状态**
```javascript
// 输入时防抖显示"正在输入"（避免闪烁）
// 停止输入后节流发送"停留"状态
function onTyping(userId) {
  const typing = debounce(() => {
    socket.emit('typing', { userId })
  }, 500)
  
  const stopped = throttle(() => {
    socket.emit('stop-typing', { userId })
  }, 3000)
  
  return () => {
    typing()
    stopped()
  }
}
```

**场景 4：搜索建议（复杂防抖）**
```javascript
// 用户输入：
// 1. 立即搜索热门
// 2. 防抖搜索精确
// 3. 节流跟踪查询历史

function createSearchHandler() {
  // 立即搜索热门
  const searchPopular = debounce(api.searchPopular, 100)
  
  // 1 秒后搜索全部
  const searchAll = debounce(api.searchAll, 1000)
  
  // 节流记录历史
  const trackHistory = throttle(api.trackSearch, 60000)
  
  return (query) => {
    searchPopular(query)
    searchAll(query)
    trackHistory(query)
  }
}
```

**最佳实践总结：**

| 需求 | 推荐方案 |
|------|----------|
| 搜索框 | 防抖 300-500ms |
| 滚动加载 | 节流 100-200ms |
| 按钮防重 | 节流 1000ms + 禁用 |
| 输入追踪 | 组合（防抖 + 节流） |
| 复杂交互 | 考虑状态机 |

**知识点:**`防抖节流` `组合` `使用场景`

:::