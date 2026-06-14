---
title: HTTP 缓存策略
description: 强缓存/协商缓存、缓存位置、Service Worker 缓存、CDN 缓存、缓存决策流程
---

# HTTP 缓存策略

合理的缓存策略是性能优化的关键，能大幅减少网络请求。

---

### Q1: 强缓存和协商缓存有什么区别？

> **⭐ 简单 · 缓存分类**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**强缓存（本地缓存）**：不发送请求，直接使用本地缓存。

**控制头**：
- `Cache-Control`（HTTP/1.1，推荐）
- `Expires`（HTTP/1.0，已废弃）

**工作流程**：
```
请求
  ↓
检查 Cache-Control / Expires
  ↓
未过期 → 直接返回 (status: 200 from cache)
已过期 → 进入协商缓存
```

---

**协商缓存**：发送请求，由服务端判断缓存是否有效。

**控制头**：
- `Last-Modified` / `If-Modified-Since`
- `ETag` / `If-None-Match`

**工作流程**：
```
请求 + If-None-Match
  ↓
服务端比对
  ↓
未变化 → 返回 304 (使用本地缓存)
已变化 → 返回 200 + 新内容
```

---

**对比表格**：

| 特性 | 强缓存 | 协商缓存 |
|------|--------|----------|
| **是否发请求** | 否 | 是 |
| **状态码** | 200 (from cache) | 304 Not Modified |
| **控制头** | Cache-Control, Expires | ETag, Last-Modified |
| **优先级** | 高 | 低 |
| **服务器压力** | 无 | 有 |
| **适用** | 不常变资源 | 可能变化的资源 |

---

**缓存优先级**：
```
Cache-Control: no-cache
  ↓
检查 ETag / Last-Modified
  ↓
协商缓存
```

**实际应用**：
```
HTML: no-cache (每次都检查)
CSS/JS: max-age=31536000, fingerprint (强缓存)
API: no-store (不缓存)
```

**知识点：** `强缓存` `协商缓存` `Cache-Control` `ETag` `304`

:::

---

### Q2: Cache-Control 有哪些常用指令？

> **⭐ 简单 · Cache-Control**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Cache-Control 常用指令**：

| 指令 | 含义 | 适用场景 |
|------|------|----------|
| `max-age=秒` | 缓存有效期 | 静态资源 |
| `s-maxage=秒` | CDN 缓存时间 | CDN 分发 |
| `no-cache` | 使用缓存前必须验证 | HTML 页面 |
| `no-store` | 不存储任何缓存 | 敏感数据 |
| `private` | 仅浏览器缓存 | 用户专属内容 |
| `public` | 可被任何中间缓存 | 公共资源 |
| `must-revalidate` | 过期后必须验证 | 重要资源 |
| `immutable` | 内容永不变化 | 带 hash 的静态文件 |
| `proxy-revalidate` | 同 must-revalidate，仅对共享缓存 |

**组合示例**：

**1. 静态资源（带指纹）**
```
Cache-Control: public, max-age=31536000, immutable
→ 缓存 1 年，永不验证
```

**2. HTML 页面**
```
Cache-Control: no-cache
→ 每次都向服务器验证
```

**3. API 响应**
```
Cache-Control: no-store
→ 完全不缓存
```

**4. 用户专属内容**
```
Cache-Control: private, max-age=600
→ 仅浏览器缓存 10 分钟
```

**5. CDN 优化**
```
Cache-Control: public, max-age=300, s-maxage=3600
→ 浏览器 5 分钟，CDN 1 小时
```

**多指令组合**：
```
Cache-Control: public, max-age=3600, must-revalidate
→ 公共缓存 1 小时，过期后验证
```

**Nginx 配置**：
```nginx
# 静态资源
location ~* \.(css|js|png|jpg)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}

# HTML 不缓存
location ~* \.(html)$ {
  add_header Cache-Control "no-cache";
}
```

**知识点：** `Cache-Control` `max-age` `no-cache` `immutable` `缓存指令`

:::

---

### Q3: ETag 和 Last-Modified 有什么区别？

> **🔥 中等 · 协商缓存**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Last-Modified（最后修改时间）**：

**原理**：
```
服务端 → Last-Modified: Wed, 21 Oct 2026 07:28:00 GMT
客户端 → If-Modified-Since: Wed, 21 Oct 2026 07:28:00 GMT
```

**缺点**：
- 秒级精度，1 秒内多次修改无法识别
- 某些系统修改时间可能不准确
- 周期性变化的文件（日志）会误判

---

**ETag（实体标签）**：

**原理**：
```
服务端 → ETag: "abc123"
客户端 → If-None-Match: "abc123"
```

**生成方式**：
- 文件内容的哈希值（MD5、SHA1）
- 版本号
- inode + 修改时间

**类型**：
- 强 ETag: `"abc123"` - 字节完全相同
- 弱 ETag: `W/"abc123"` - 语义相同

---

**对比**：

| 特性 | Last-Modified | ETag |
|------|---------------|------|
| **精度** | 秒级 | 内容级 |
| **性能** | 高（直接读时间） | 低（需计算） |
| **准确性** | 中 | 高 |
| **带宽** | 少（只传时间） | 可多（哈希可能长） |
| **集群支持** | 需时间同步 | 需统一算法 |

---

**同时使用策略**：
```
服务端同时返回:
ETag: "abc123"
Last-Modified: Wed, 21 Oct 2026 07:28:00 GMT

客户端优先使用 ETag
ETag 不匹配再检查 Last-Modified
```

**Nginx 配置**：
```nginx
etag on;                    # 启用 ETag
last_modified on;           # 启用 Last-Modified
```

**强 ETag vs 弱 ETag**：
```
强 ETag: "0x8DCAE2D2D2D2D2D"
→ 要求字节完全相同
→ 可用于 Range 请求

弱 ETag: W/"0x8DCAE2D2D2D2D2D"
→ 语义相同即可
→ 适用于动态内容
```

**知识点：** `ETag` `Last-Modified` `协商缓存` `弱 ETag` `内容哈希`

:::

---

### Q4: 浏览器缓存有哪几个层级？

> **🔥 中等 · 缓存位置**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**浏览器缓存四层**：

```
内存缓存 (Memory Cache)
    ↓
磁盘缓存 (Disk Cache)
    ↓
Service Worker 缓存
    ↓
推送缓存 (Push Cache)
```

---

**1. 内存缓存（Memory Cache）**
```
特点：
- 存储在当前内存中
- 存取速度最快
- 进程结束清除
- 容量有限

适合：
- 小文件
- 当前页面资源
```

**2. 磁盘缓存（Disk Cache）**
```
特点：
- 存储在硬盘中
- 容量大
- 可跨会话
- 速度较慢

适合：
- 大文件
- 长期缓存资源
```

**3. Service Worker 缓存**
```
特点：
- 可编程控制
- 可缓存跨域资源
- 独立于浏览器生命周期
- 支持离线

适合：
- PWA 应用
- 离线缓存
- 精细控制
```

**4. 推送缓存（Push Cache, HTTP/2）**
```
特点：
- Session 级别
- 多个标签页共享
- 自动推送

适合：
- HTTP/2 Server Push
```

---

**缓存查找顺序**：
```
1. Service Worker
   ↓
2. Memory Cache
   ↓
3. Disk Cache
   ↓
4. 网络请求
```

---

**Chrome DevTools 查看**：
```
Application → Cache Storage  (Service Worker)
Application → Memory Cache
Network → Disable Cache     (禁用所有缓存)
```

**知识点：** `缓存层级` `Memory Cache` `Disk Cache` `Service Worker` `Push Cache`

:::

---

### Q5: 刷新操作对缓存有什么影响？

> **⭐ 简单 · 刷新缓存**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**不同刷新方式对缓存的影响**：

| 刷新方式 | 操作 | 强缓存 | 协商缓存 |
|----------|------|--------|----------|
| **地址栏回车** | 正常导航 | ✅ 使用 | ✅ 使用 |
| **F5 / 刷新按钮** | 强制刷新 | ❌ 跳过 | ✅ 使用 |
| **Ctrl+F5 / Ctrl+Shift+R** | 硬刷新 | ❌ 跳过 | ❌ 跳过 |

---

**详细行为**：

**1. 正常导航（地址栏回车）**
```
- 使用所有缓存
- Cache-Control 未过期直接用
- 过期则协商
- 304 或 200
```

**2. 强制刷新（F5）**
```
请求头：
Cache-Control: max-age=0

行为：
- 跳过强缓存
- 发送条件请求（If-None-Match）
- 服务端可返回 304
```

**3. 硬刷新（Ctrl+F5）**
```
请求头：
Cache-Control: no-cache
Pragma: no-cache

行为：
- 跳过所有缓存
- 服务端必须返回 200
- 更新所有缓存
```

---

**清除缓存**：
```
1. 清除浏览数据
   - 清除 Cookie
   - 清除缓存文件
   - 清除本地存储

2. 开发者工具
   - 右键刷新按钮
   - Empty Cache and Hard Reload
```

**知识点：** `页面刷新` `强制刷新` `硬刷新` `缓存清除`

:::

---

### Q6: Service Worker 如何实现缓存？

> **💀 困难 · Service Worker**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Service Worker 缓存 API**：

```javascript
// 1. 注册 Service Worker
navigator.serviceWorker.register('/sw.js');

// 2. 安装阶段 - 预缓存
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/app.js'
      ]);
    })
  );
});

// 3. 请求拦截
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;  // 缓存命中
        }
        return fetch(event.request);  // 网络请求
      })
  );
});
```

---

**缓存策略**：

**1. Cache First（缓存优先）**
```javascript
async fetchHandler(request) {
  const cached = await caches.match(request);
  return cached || fetch(request);
}
```

**2. Network First（网络优先）**
```javascript
async fetchHandler(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open('v1');
    cache.put(request, response.clone());
    return response;
  } catch {
    return caches.match(request);
  }
}
```

**3. Stale While Revalidate**
```javascript
async fetchHandler(request) {
  const cache = await caches.open('v1');
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    cache.put(request, response.clone());
    return response;
  });
  
  return cached || fetchPromise;
}
```

---

**缓存更新**：
```javascript
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== 'v2')
            .map(key => caches.delete(key))
      );
    })
  );
});
```

**知识点：** `Service Worker` `缓存策略` `预缓存` `离线缓存` `fetch 拦截`

:::

---

### Q7: CDN 缓存原理是什么？如何配置？

> **⭐ 简单 · CDN 缓存**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**CDN 缓存原理**：

```
用户请求
  ↓
CDN 边缘节点
  ↓ 缓存命中 → 直接返回
  ↓ 缓存未命中
CDN 回源 → 源服务器
  ↓
边缘节点缓存 + 返回给用户
```

---

**缓存层级**：
```
浏览器缓存
   ↓
CDN 边缘节点
   ↓
CDN 中间节点
   ↓
CDN 源站
   ↓
业务源服务器
```

---

**Cache-Control 作用**：
```
浏览器: max-age
CDN: s-maxage

Cache-Control: max-age=300, s-maxage=3600
→ 浏览器缓存 5 分钟，CDN 缓存 1 小时
```

---

**CDN 缓存配置**：

**1. 按文件类型**
```
图片/视频: 长期缓存 (1 年)
CSS/JS: 带 hash 长期缓存
HTML: 不缓存或短缓存
API: 不缓存
```

**2. 缓存键**
```
默认: URL
可配置: URL + Query + Header

避免:
- 带时间的 Query 参数
- 个性化的 Header
```

**3. 刷新和预热**
```
刷新: 清除 CDN 缓存
预热: 主动加载资源到 CDN
```

---

**Nginx CDN 配置示例**：
```nginx
# 静态资源
location ~* \.(css|js|png|jpg|woff)$ {
  add_header Cache-Control "public, max-age=31536000";
  add_header X-Cache-Status $upstream_cache_status;
}

# HTML 不缓存
location ~* \.html$ {
  add_header Cache-Control "no-cache";
}
```

**知识点：** `CDN` `边缘节点` `回源` `s-maxage` `缓存配置`

:::

---

### Q8: 如何判断缓存是否命中？

> **⭐ 简单 · 缓存检测**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Chrome DevTools 检测**：

**Network 面板**：
```
Size 列显示:
- memory cache  → 内存缓存命中
- disk cache    → 磁盘缓存命中
- ServiceWorker → SW 缓存命中
- (from cache)  → 强缓存命中
- 304           → 协商缓存命中
- 网络大小      → 未命中，从网络获取
```

---

**请求头判断**：

**强缓存命中**：
```
Status: 200 (from disk cache)
无网络请求
```

**协商缓存命中**：
```
请求: If-None-Match: "abc123"
响应: 304 Not Modified
```

**缓存未命中**：
```
请求: 无条件请求
响应: 200 OK + 完整内容
```

---

**编程检测**：
```javascript
// Performance API
performance.getEntriesByType('resource').forEach(entry => {
  console.log(entry.name, entry.transferSize);
  // transferSize = 0 表示缓存命中
});

// 缓存命中率
const resources = performance.getEntriesByType('resource');
const cached = resources.filter(r => r.transferSize === 0).length;
const hitRate = cached / resources.length;
```

---

**Nginx 缓存状态**：
```nginx
proxy_cache_path ...;

location / {
  proxy_cache my_cache;
  add_header X-Cache-Status $upstream_cache_status;
}

# 状态说明:
# MISS  - 未命中，回源
# HIT   - 命中
# EXPIRED - 过期，回源
# STALE  - 使用过期缓存
# UPDATING - 正在更新
```

**知识点：** `缓存命中` `DevTools` `304` `transferSize` `缓存状态`

:::

---

### Q9: 什么是缓存穿透、缓存击穿、缓存雪崩？

> **💀 困难 · 缓存问题**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**缓存穿透**：
```
问题：
查询不存在的数据
→ 缓存无
→ 数据库也无
→ 每次请求都到数据库

解决：
- 布隆过滤器
- 缓存空值
- 接口层校验
```

---

**缓存击穿**：
```
问题：
热点 key 过期
→ 大量并发请求
→ 全部打到数据库

解决：
- 互斥锁
- 永不过期
- 提前预热
```

---

**缓存雪崩**：
```
问题：
大量 key 同时过期
→ 瞬时流量激增
→ 数据库压力大

解决：
- 随机过期时间
- 热点数据永不过期
- 降级熔断
```

---

**前端场景**：

**缓存穿透示例**：
```javascript
// 用户 ID 不存在
async getUser(id) {
  const cached = localStorage.getItem(`user_${id}`);
  if (cached === 'null') return null;  // 缓存空值
  
  if (cached) return JSON.parse(cached);
  
  const user = await fetch(`/api/users/${id}`);
  if (!user) {
    localStorage.setItem(`user_${id}`, 'null');  // 缓存空值
    return null;
  }
  
  localStorage.setItem(`user_${id}`, JSON.stringify(user));
  return user;
}
```

**缓存击穿示例**：
```javascript
// 互斥锁
async getHotData(key) {
  const cached = await cache.get(key);
  if (cached) return cached;
  
  // 尝试获取锁
  const lock = await acquireLock(key);
  if (lock) {
    try {
      // 双重检查
      const cached = await cache.get(key);
      if (cached) return cached;
      
      const data = await fetchFromServer();
      await cache.set(key, data);
      return data;
    } finally {
      releaseLock(lock);
    }
  }
  
  // 等持有锁的线程完成
  await sleep(100);
  return getHotData(key);
}
```

**知识点：** `缓存穿透` `缓存击穿` `缓存雪崩` `布隆过滤器` `互斥锁`

:::

---

### Q10: HTTP/2 和 HTTP/3 对缓存有什么影响？

> **🔥 中等 · HTTP 缓存演进**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HTTP/2 对缓存的影响**：

**1. 多路复用减少连接开销**
```
HTTP/1.1: 多个连接并行
HTTP/2:   单连接多路复用

缓存策略可更激进
单连接维护成本更低
```

**2. Server Push 与缓存**
```
服务器主动推送:
PUSH_PROMISE: /styles.css
DATA: 样式内容

浏览器缓存推送的资源
下次请求直接使用
```

**3. 头部压缩**
```
HPACK 压缩
减少请求头大小
缓存命中率提升
```

---

**HTTP/3 (QUIC) 对缓存的影响**：

**1. 0-RTT 连接恢复**
```
之前连接过 → 直接发送请求
→ 等待时间更短
→ 缓存价值更高
```

**2. 连接迁移**
```
WiFi → 4G 切换
连接不中断
缓存继续有效
```

**3. 改进的拥塞控制**
```
更精准的网络状况感知
动态调整缓存策略
```

---

**推送缓存（Push Cache）**：
```
HTTP/2 新增
Session 级别
多个标签页共享
浏览器自动管理
```

**最佳实践演进**：
```
HTTP/1.1:
- 合并文件减少请求
- 雪碧图
- 内联小资源

HTTP/2+:
- 拆分文件利用多路复用
- 使用 Server Push
- 更多小文件并行
```

**知识点：** `HTTP/2 缓存` `HTTP/3 缓存` `Server Push` `多路复用` `0-RTT`

:::

---
---

### Q11: Service Worker 缓存策略有哪些？

> **🔥 中等 · 缓存**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Service Worker 提供多种缓存策略，可根据资源类型选择最优方案。**

**1. Cache First（缓存优先）：**

```javascript
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});

适用场景：
- 静态资源（JS、CSS、字体）
- 不经常变更的文件
- 离线可用的资源
```

**2. Network First（网络优先）：**

```javascript
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});

适用场景：
- API 请求
- 实时数据
- 需要最新内容的场景
```

**3. Stale While Revalidate（缓存优先，后台更新）：**

```javascript
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.open("dynamic").then((cache) => {
      return cache.match(event.request).then((cached) => {
        const fetchPromise = fetch(event.request).then((network) => {
          cache.put(event.request, network.clone());
          return network;
        });
        return cached || fetchPromise;
      });
    })
  );
});

适用场景：
- 图片资源
- 用户头像
- 可接受短暂过期的内容
```

**4. Cache Only（仅缓存）：**

```javascript
self.addEventListener("fetch", (event) => {
  event.respondWith(caches.match(event.request));
});

适用场景：
- 离线资源
- 版本化资源
- 缓存的不变更版本
```

**5. Network Only（仅网络）：**

```javascript
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});

适用场景：
- 表单提交
- 实时数据
- 敏感操作
```

**6. 组合策略（按请求类型）：**

```javascript
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  
  // 静态资源：Cache First
  if (event.request.destination === "script" || 
      event.request.destination === "style" ||
      event.request.destination === "font") {
    event.respondWith(
      caches.match(event.request).then((r) => r || fetch(event.request))
    );
    return;
  }
  
  // API：Network First
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }
  
  // 图片：Stale While Revalidate
  if (event.request.destination === "image") {
    event.respondWith(
      caches.open("images").then((cache) => {
        return cache.match(event.request).then((cached) => {
          fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
          });
          return cached || fetch(event.request);
        });
      })
    );
    return;
  }
  
  // 默认：Network First
  event.respondWith(fetch(event.request));
});
```

**知识点：** `Service Worker` `缓存策略` `离线优先` `Stale While Revalidate` `Cache First`

:::

---

### Q12: 什么是 Vary 头？在缓存中的作用是什么？

> **🔥 中等 · HTTP 缓存**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Vary 头告诉缓存服务器根据哪些请求头来区分缓存内容，实现按条件缓存。**

**1. Vary 工作原理：**

```text
问题场景：
客户端 1: Accept-Encoding: gzip
客户端 2: Accept-Encoding: br

无 Vary 时：
- CDN 只缓存一个版本
- 客户端 2 可能收到不支持的格式

有 Vary 时：
- CDN 根据 Accept-Encoding 分别缓存
- 每个客户端收到正确的编码版本
```

**2. 常见 Vary 值：**

```http
# 按编码区分
Vary: Accept-Encoding

# 按语言区分
Vary: Accept-Language

# 按设备类型区分
Vary: User-Agent

# 多个条件
Vary: Accept-Encoding, Accept-Language, User-Agent
```

**3. 缓存键组成：**

```text
缓存键 = URL + Vary 指定的请求头

示例：
URL: https://example.com/api/data
Vary: Accept-Encoding, Accept-Language

缓存键：
- https://example.com/api/data|gzip|zh-CN
- https://example.com/api/data|br|en-US
- https://example.com/api/data|gzip|en-US
```

**4. 代码示例（Node.js）：**

```javascript
const crypto = require("crypto");

// 生成缓存键
function getCacheKey(req) {
  const url = req.url;
  const encoding = req.headers["accept-encoding"] || "identity";
  const lang = req.headers["accept-language"] || "en-US";
  
  // 组合键
  return crypto
    .createHash("md5")
    .update(`${url}|${encoding}|${lang}`)
    .digest("hex");
}

// 响应头
res.setHeader("Vary", "Accept-Encoding, Accept-Language");
res.setHeader("Cache-Control", "public, max-age=3600");
```

**5. CDN 缓存影响：**

```text
Vary: * 的后果：
- 缓存绕过
- 每个请求都回源
- CDN 命中率降为 0

正确做法：
✅ 明确指定 Vary 条件
✅ 仅必要时使用 Vary
✅ 避免 Vary: User-Agent（太细粒度）
✅ 使用规范化值（小写）
```

**6. 实践建议：**

| Vary 条件 | 推荐度 | 说明 |
|-----------|--------|------|
| Accept-Encoding | ✅ 必须 | 压缩格式区分 |
| Accept-Language | ⚠️ 按需 | 多语言站点 |
| Accept | ⚠️ 谨慎 | API 版本协商 |
| User-Agent | ❌ 避免 | 粒度太细，缓存失效 |
| * | ❌ 禁止 | 完全绕过缓存 |

**知识点：** `Vary` `HTTP 缓存` `CDN` `缓存键` `内容协商` `性能优化`

:::

