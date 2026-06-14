---
title: 手写 LRU 缓存
description: LRU 和 LFU 缓存实现
---

# 手写 LRU 缓存

---

### Q1: 实现 LRU 缓存

> **🔥 中等 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.cache = new Map()
  }

  get(key) {
    if (!this.cache.has(key)) return -1
    
    const value = this.cache.get(key)
    // 更新访问顺序：删除后重新添加
    this.cache.delete(key)
    this.cache.set(key, value)
    
    return value
  }

  put(key, value) {
    // 已存在，更新并移到末尾
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      // 删除最旧（第一个）
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }
    
    this.cache.set(key, value)
  }
}

// 使用
const cache = new LRUCache(3)
cache.put(1, 1)
cache.put(2, 2)
cache.put(3, 3)
console.log(cache.get(1))  // 1
cache.put(4, 4)            // 淘汰 key 2
console.log(cache.get(2))  // -1
```

**知识点：** `LRU` `Map` `缓存`

:::

---

### Q2: 手写 LFU 缓存

> **🔥 困难 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class LFUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.size = 0
    this.minFreq = 0
    this.keyMap = new Map()      // key -> {value, freq}
    this.freqMap = new Map()     // freq -> Set<key>
  }

  get(key) {
    if (!this.keyMap.has(key)) return -1
    
    const item = this.keyMap.get(key)
    this._updateFreq(key, item)
    
    return item.value
  }

  put(key, value) {
    if (this.capacity <= 0) return

    if (this.keyMap.has(key)) {
      const item = this.keyMap.get(key)
      item.value = value
      this._updateFreq(key, item)
    } else {
      if (this.size >= this.capacity) {
        this._evict()
      }
      
      this.keyMap.set(key, { value, freq: 1 })
      this._addToFreq(1, key)
      this.minFreq = 1
      this.size++
    }
  }

  _updateFreq(key, item) {
    const oldFreq = item.freq
    const newFreq = oldFreq + 1
    
    // 从旧频率列表移除
    const oldSet = this.freqMap.get(oldFreq)
    oldSet.delete(key)
    if (oldSet.size === 0) {
      this.freqMap.delete(oldFreq)
      if (this.minFreq === oldFreq) {
        this.minFreq = newFreq
      }
    }
    
    // 更新频率
    item.freq = newFreq
    this._addToFreq(newFreq, key)
  }

  _addToFreq(freq, key) {
    if (!this.freqMap.has(freq)) {
      this.freqMap.set(freq, new Set())
    }
    this.freqMap.get(freq).add(key)
  }

  _evict() {
    const minSet = this.freqMap.get(this.minFreq)
    const key = minSet.values().next().value
    minSet.delete(key)
    
    if (minSet.size === 0) {
      this.freqMap.delete(this.minFreq)
    }
    
    this.keyMap.delete(key)
    this.size--
  }
}

// 使用
const cache = new LFUCache(2)
cache.put(1, 1)
cache.put(2, 2)
console.log(cache.get(1))  // 1
cache.put(3, 3)           // 淘汰 key 2（频率最低）
console.log(cache.get(2)) // -1
```

**知识点：** `LFU` `缓存淘汰` `频率`

:::

---

### Q3: Map 实现的 LRU 简化版

> **🔥 中等 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 利用 Map 的有序特性简化实现
function createLRU(capacity) {
  const cache = new Map()
  
  return {
    get(key) {
      if (!cache.has(key)) return null
      
      const value = cache.get(key)
      // 删除后重新插入，移到末尾（最近使用）
      cache.delete(key)
      cache.set(key, value)
      return value
    },
    
    put(key, value) {
      if (cache.has(key)) {
        cache.delete(key)
      } else if (cache.size >= capacity) {
        // 删除第一个（最旧）
        const firstKey = cache.keys().next().value
        cache.delete(firstKey)
      }
      cache.set(key, value)
    },
    
    delete(key) {
      return cache.delete(key)
    },
    
    clear() {
      cache.clear()
    },
    
    size: () => cache.size
  }
}

// 使用
const lru = createLRU(3)
lru.put('a', 1)
lru.put('b', 2)
console.log(lru.get('a'))  // 1
lru.put('c', 3)
```

**知识点:**`LRU` `Map` `简化实现`

:::

---

### Q4: 带过期时间的 LRU 缓存

> **💀 困难 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class ExpiringLRUCache {
  constructor(capacity, defaultTTL = 300000) {
    this.capacity = capacity
    this.defaultTTL = defaultTTL
    this.cache = new Map()
  }

  get(key) {
    const item = this.cache.get(key)
    if (!item) return undefined
    
    // 检查过期
    if (Date.now() > item.expire) {
      this.cache.delete(key)
      return undefined
    }
    
    // 更新访问顺序
    this.cache.delete(key)
    this.cache.set(key, item)
    
    return item.value
  }

  put(key, value, ttl = this.defaultTTL) {
    // 检查过期项
    this._cleanup()
    
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      // 删除最旧
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }
    
    this.cache.set(key, {
      value,
      expire: Date.now() + ttl
    })
  }

  delete(key) {
    return this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }

  _cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache) {
      if (now > item.expire) {
        this.cache.delete(key)
      }
    }
  }
}

// 使用
const cache = new ExpiringLRUCache(100, 60000)
cache.put('data', { id: 1 }, 30000)  // 30 秒过期
console.log(cache.get('data'))
```

**知识点:**`LRU` `过期时间` `TTL`

:::

---

### Q5: 手写Redis风格的缓存

> **💀 困难 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class RedisCache {
  constructor() {
    this.store = new Map()
    this.expires = new Map()
  }

  get(key) {
    if (this.isExpired(key)) {
      this.del(key)
      return null
    }
    return this.store.get(key)
  }

  set(key, value, options = {}) {
    const { ttl, nx = false, xx = false } = options
    
    // NX: 只在不存在时设置
    if (nx && this.store.has(key)) return false
    
    // XX: 只在存在时设置
    if (xx && !this.store.has(key)) return false
    
    this.store.set(key, value)
    
    if (ttl) {
      this.expires.set(key, Date.now() + ttl)
    }
    
    return true
  }

  del(key) {
    this.store.delete(key)
    this.expires.delete(key)
  }

  exists(key) {
    return this.store.has(key) && !this.isExpired(key)
  }

  ttl(key) {
    if (!this.store.has(key)) return -2  // 不存在
    const expire = this.expires.get(key)
    if (!expire) return -1  // 永久
    return Math.max(0, Math.floor((expire - Date.now()) / 1000))
  }

  keys(pattern = '*') {
    const regex = new RegExp(
      '^' + pattern.replace('*', '.*').replace('?', '.') + '$'
    )
    return Array.from(this.store.keys()).filter(k => regex.test(k))
  }

  isExpired(key) {
    const expire = this.expires.get(key)
    return expire && Date.now() > expire
  }
}

// 使用
const redis = new RedisCache()
redis.set('user:1', { name: 'Alice' }, { ttl: 60000 })
console.log(redis.get('user:1'))
console.log(redis.ttl('user:1'))
// -> 60
```

**知识点:**`Redis` `缓存` `TTL` `NX` `XX`

:::

---

### Q6: 手写 Shannon 缓存（自适应）

> **💀 困难 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 结合热点检测和容量管理
class AdaptiveCache {
  constructor(capacity, options = {}) {
    this.capacity = capacity
    this.hotThreshold = options.hotThreshold || 3
    this.cache = new Map()
    this.frequency = new Map()
    this.stats = { hits: 0, misses: 0 }
  }

  get(key) {
    if (!this.cache.has(key)) {
      this.stats.misses++
      return undefined
    }
    
    this.stats.hits++
    const freq = this.frequency.get(key) + 1
    this.frequency.set(key, freq)
    
    // 提升热点
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)
    
    return value
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.capacity) {
      this._evict()
    }
    
    this.cache.set(key, value)
    this.frequency.set(key, 0)
  }

  _evict() {
    // 淘汰冷数据
    for (const [key, freq] of this.frequency) {
      if (freq < this.hotThreshold) {
        this.cache.delete(key)
        this.frequency.delete(key)
        return
      }
    }
    
    // 全热点，淘汰第一个
    const firstKey = this.cache.keys().next().value
    this.cache.delete(firstKey)
    this.frequency.delete(firstKey)
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses
    return {
      ...this.stats,
      hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(2) + '%' : '0%',
      size: this.cache.size
    }
  }
}
```

**知识点:**`自适应缓存` `热点检测` `统计`

:::

---

### Q7: 手写 LFU 缓存？

> **🔥 中等 · 手写**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class LFUCache {
  constructor(capacity) {
    this.capacity = capacity
    this.keyVal = new Map()    // key -> value
    this.keyFreq = new Map()   // key -> freq
    this.freqKeys = new Map()  // freq -> [keys]
    this.minFreq = 0
  }

  get(key) {
    if (!this.keyVal.has(key)) return -1
    
    this._increaseFreq(key)
    return this.keyVal.get(key)
  }

  put(key, value) {
    if (this.capacity <= 0) return
    
    if (this.keyVal.has(key)) {
      this.keyVal.set(key, value)
      this._increaseFreq(key)
    } else {
      if (this.keyVal.size >= this.capacity) {
        this._evict()
      }
      this.keyVal.set(key, value)
      this.keyFreq.set(key, 1)
      this._addFreq(1, key)
      this.minFreq = 1
    }
  }

  _increaseFreq(key) {
    const freq = this.keyFreq.get(key)
    this.keyFreq.set(key, freq + 1)
    
    // 从旧频率移除
    const freqSet = this.freqKeys.get(freq)
    freqSet.delete(key)
    if (freqSet.size === 0) {
      this.freqKeys.delete(freq)
      if (this.minFreq === freq) {
        this.minFreq++
      }
    }
    
    // 加入新频率
    this._addFreq(freq + 1, key)
  }

  _addFreq(freq, key) {
    if (!this.freqKeys.has(freq)) {
      this.freqKeys.set(freq, new Set())
    }
    this.freqKeys.get(freq).add(key)
  }

  _evict() {
    const freqSet = this.freqKeys.get(this.minFreq)
    const key = freqSet.values().next().value
    freqSet.delete(key)
    this.keyVal.delete(key)
    this.keyFreq.delete(key)
  }
}
```

**知识点:**`LFU` `频率淘汰` `最小频率`

:::

---

### Q8: LRU 在浏览器/CDN 缓存中的应用？

> **🔥 中等 · 应用**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**浏览器缓存应用：**

```javascript
// 图片懒加载缓存
class ImageCache {
  constructor(limit = 100) {
    this.cache = new Map()
    this.limit = limit
  }

  preload(src) {
    if (this.cache.has(src)) return
    
    const img = new Image()
    img.src = src
    
    img.onload = () => {
      if (this.cache.size >= this.limit) {
        const first = this.cache.keys().next().value
        this.cache.delete(first)
      }
      this.cache.set(src, img)
    }
  }

  get(src) {
    if (!this.cache.has(src)) return null
    
    const img = this.cache.get(src)
    // 移到末尾（LRU）
    this.cache.delete(src)
    this.cache.set(src, img)
    return img
  }
}

// CDN 缓存策略
function cdnCacheControl(url) {
  return {
    // HTTP 头
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',  // 1 年缓存
      'ETag': '"abc123"',
      'Last-Modified': 'Mon, 01 Jan 2024 00:00:00 GMT'
    },
    
    // CDN 配置
    cdn: {
      purge: () => fetch('/purge', { method: 'POST', body: url }),
      prefetch: (predUrls) => preload(predUrls)
    }
  }
}
```

**知识点:**`浏览器缓存` `CDN` `LRU 应用`

:::