---
title: 浏览器存储机制
description: cookie/sessionStorage/localStorage/indexedDB 对比、session 与 cookie 区别、Service Worker 缓存、离线存储
---

# 浏览器存储机制

了解各种存储方式的特性、限制和使用场景是前端开发的基础。

---

### Q1: 请对比 cookie、localStorage、sessionStorage 和 IndexedDB 的区别

> **🔥 中等 · 存储对比**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 特性 | cookie | localStorage | sessionStorage | IndexedDB |
|------|--------|--------------|----------------|-----------|
| **容量** | 4KB | 5MB | 5MB | 不限（通常 50MB+） |
| **生命周期** | 可设置过期时间 | 永久 | 页面会话结束 | 永久 |
| **服务端通信** | 自动携带 | 不携带 | 不携带 | 不携带 |
| **同源限制** | 是 | 是 | 是 | 是 |
| **API** | 原生/手动操作 | 简单易用 | 简单易用 | 复杂（异步） |
| **数据类型** | 字符串 | 字符串 | 字符串 | 任意类型 |
| **索引支持** | 无 | 无 | 无 | 支持 |
| **事务支持** | 无 | 无 | 无 | 支持 |

**Cookie 详解：**
```javascript
// 设置 cookie
document.cookie = 'key=value; expires=Wed, 21 Oct 2026 07:28:00 GMT; path=/; secure; SameSite=Lax';

// 读取 cookie
const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
  const [key, value] = cookie.split('=');
  acc[key] = value;
  return acc;
}, {});

// 删除 cookie
document.cookie = 'key=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
```

**LocalStorage/SessionStorage：**
```javascript
// 存储（只能存字符串）
localStorage.setItem('key', JSON.stringify({ name: '张三' }));

// 读取
const data = JSON.parse(localStorage.getItem('key'));

// 删除
localStorage.removeItem('key');

// 清空
localStorage.clear();
```

**IndexedDB 基础：**
```javascript
// 打开数据库
const request = indexedDB.open('myDB', 1);

request.onupgradeneeded = (e) => {
  const db = e.target.result;
  // 创建对象仓库
  const store = db.createObjectStore('users', { keyPath: 'id' });
  store.createIndex('name', 'name', { unique: false });
};

request.onsuccess = (e) => {
  const db = e.target.result;
  // 操作数据...
};
```

**知识点：** `cookie` `localStorage` `sessionStorage` `IndexedDB` `存储对比`

:::

---

### Q2: localStorage 和 sessionStorage 有什么区别？

> **⭐ 简单 · Web Storage**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心区别：生命周期**

| 特性 | localStorage | sessionStorage |
|------|--------------|----------------|
| **生命周期** | 永久存储，除非手动删除 | 页面会话结束清除 |
| **作用域** | 同源窗口共享 | 仅当前标签页 |
| **刷新页面** | 数据保留 | 数据保留 |
| **关闭标签页** | 数据保留 | 数据清除 |
| **新标签页（同 URL）** | 共享数据 | 独立数据 |

**生命周期详解：**

```javascript
// localStorage - 持久化存储
localStorage.setItem('token', 'abc123');
// - 关闭浏览器：数据保留
// - 重启浏览器：数据仍可读
// - 删除：localStorage.removeItem('token')

// sessionStorage - 会话存储
sessionStorage.setItem('temp', 'xyz');
// - 刷新页面：数据保留
// - 关闭标签页：数据清除
// - 新标签页：独立存储，不共享
```

**场景对比：**

**localStorage 适用场景：**
- 用户偏好设置（主题、语言）
- 长期登录 token
- 离线数据缓存
- 购物车持久化

**sessionStorage 适用场景：**
- 表单临时数据
- 页面会话状态
- 一次性验证码
- 多步骤表单的中间状态

**共享与隔离：**
```
┌─────────────────────────────────────────┐
│  浏览器（同源）                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ Tab 1   │  │ Tab 2   │  │ Tab 3   │ │
│  │ ┌─────┐ │  │ ┌─────┐ │  │ ┌─────┐ │ │
│  │ │ LS  │◄─┼──►│ LS  │ │  │ │ LS  │ │ │ ← 共享
│  │ ├─────┤ │  │ ├─────┤ │  │ ├─────┤ │ │
│  │ │ SS1 │ │  │ │ SS2 │ │  │ │ SS3 │ │ │ ← 独立
│  │ └─────┘ │  │ └─────┘ │  │ └─────┘ │ │
│  └─────────┘  └─────────┘  └─────────┘ │
└─────────────────────────────────────────┘
```

**知识点：** `localStorage` `sessionStorage` `生命周期` `作用域` `Web Storage`

:::

---

### Q3: cookie 有哪些属性？各有什么作用？

> **⭐ 简单 · Cookie 属性**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Cookie 属性详解：**

```javascript
// 完整 cookie 格式
Set-Cookie: name=value; 
            Expires=Wed, 21 Oct 2026 07:28:00 GMT; 
            Max-Age=3600; 
            Path=/; 
            Domain=example.com; 
            Secure; 
            HttpOnly; 
            SameSite=Lax
```

| 属性 | 作用 | 说明 |
|------|------|------|
| **Expires** | 过期时间 | GMT 格式时间，过期后删除 |
| **Max-Age** | 最大生存期（秒） | 优先级高于 Expires |
| **Path** | 路径范围 | 指定哪些路径可以访问该 cookie |
| **Domain** | 域名范围 | 指定哪些域名可以访问该 cookie |
| **Secure** | 仅 HTTPS | 仅通过 HTTPS 传输 |
| **HttpOnly** | 禁止 JS 访问 | 防止 XSS 窃取 cookie |
| **SameSite** | 跨站请求限制 | Strict/Lax/None |

**SameSite 详解：**

| 值 | 行为 | 场景 |
|----|------|------|
| **Strict** | 完全禁止跨站发送 | 最安全，但影响用户体验 |
| **Lax** | 允许 GET 请求跨站 | 默认值，平衡安全与体验 |
| **None** | 允许跨站 | 必须配合 Secure 使用 |

**设置示例：**
```javascript
// JavaScript 设置
document.cookie = 'session=abc123; Max-Age=3600; Path=/; Secure; SameSite=Lax';

// Node.js Express 设置
res.cookie('token', 'xyz', {
  maxAge: 3600000,  // 1 小时
  httpOnly: true,   // 禁止 JS 访问
  secure: true,     // 仅 HTTPS
  sameSite: 'lax',
  path: '/'
});
```

**安全建议：**
- 敏感数据设置 HttpOnly
- 生产环境设置 Secure
- 合理设置 SameSite 防止 CSRF

**知识点：** `Cookie 属性` `Expires` `HttpOnly` `SameSite` `Secure`

:::

---

### Q4: Session 和 Cookie 有什么区别？

> **⭐ 简单 · Session vs Cookie**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心区别：存储位置**

| 特性 | Cookie | Session |
|------|--------|---------|
| **存储位置** | 客户端（浏览器） | 服务端 |
| **安全性** | 较低（可被篡改） | 较高（服务端控制） |
| **容量限制** | 4KB | 取决于服务器 |
| **性能影响** | 每次请求携带 | 需要查询存储 |
| **实现方式** | 浏览器原生支持 | 需要服务端实现 |
| **依赖** | 独立 | 依赖 Cookie（通常） |

**工作流程：**
```
┌──────────┐         ┌──────────┐
│  浏览器   │         │  服务端   │
└────┬─────┘         └────┬─────┘
     │ 1. 登录请求        │
     │───────────────────>│
     │                    │ 2. 创建 Session
     │                    │ 存储用户信息
     │ 3. 返回 SessionID  │
     │<───────────────────│ (通过 Cookie)
     │ Set-Cookie: SESSIONID=abc123
     │                    │
     │ 4. 后续请求        │
     │───────────────────>│
     │ Cookie: SESSIONID  │ 5. 查找 Session
     │                    │ 获取用户信息
```

**代码示例：**

**Node.js（Express + express-session）：**
```javascript
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: true,      // 生产环境开启
    maxAge: 3600000    // 1 小时
  }
}));

// 设置 session
app.post('/login', (req, res) => {
  req.session.userId = user.id;
  req.session.username = user.name;
  res.send('登录成功');
});

// 读取 session
app.get('/profile', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('未登录');
  }
  res.send(`欢迎 ${req.session.username}`);
});
```

**Session 存储方式：**
- 内存存储（开发，重启丢失）
- Redis（推荐，高性能）
- 数据库（持久化）
- 文件系统

**知识点：** `Session` `Cookie` `身份验证` `会话管理` `安全性`

:::

---

### Q5: 如何使用 localStorage 实现一个简单的缓存系统？

> **🔥 中等 · 缓存实现**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**带过期时间的缓存实现：**

```javascript
class Cache {
  constructor(prefix = 'app_cache_') {
    this.prefix = prefix;
  }
  
  // 设置缓存
  set(key, value, ttl = 3600) {
    const item = {
      value: value,
      expire: Date.now() + ttl * 1000
    };
    localStorage.setItem(this.prefix + key, JSON.stringify(item));
  }
  
  // 获取缓存
  get(key) {
    const raw = localStorage.getItem(this.prefix + key);
    if (!raw) return null;
    
    const item = JSON.parse(raw);
    if (Date.now() > item.expire) {
      // 过期删除
      localStorage.removeItem(this.prefix + key);
      return null;
    }
    return item.value;
  }
  
  // 删除缓存
  remove(key) {
    localStorage.removeItem(this.prefix + key);
  }
  
  // 清空所有缓存
  clear() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
  
  // 检查是否存在（未过期）
  has(key) {
    return this.get(key) !== null;
  }
}

// 使用
const cache = new Cache();
cache.set('userData', { name: '张三' }, 300); // 5 分钟
const data = cache.get('userData');
```

**LRU 缓存实现：**
```javascript
class LRUCache {
  constructor(maxSize = 50, maxAge = 3600000) {
    this.maxSize = maxSize;
    this.maxAge = maxAge;
    this.prefix = 'lru_cache_';
  }
  
  set(key, value) {
    // 检查是否需要淘汰
    this._evictIfNeeded();
    
    const item = {
      value,
      timestamp: Date.now()
    };
    // 同时维护访问顺序
    this._updateOrder(key);
    localStorage.setItem(this.prefix + key, JSON.stringify(item));
  }
  
  get(key) {
    const raw = localStorage.getItem(this.prefix + key);
    if (!raw) return null;
    
    const item = JSON.parse(raw);
    // 检查过期
    if (Date.now() - item.timestamp > this.maxAge) {
      this.remove(key);
      return null;
    }
    
    // 更新访问顺序
    this._updateOrder(key);
    return item.value;
  }
  
  _updateOrder(key) {
    let order = JSON.parse(localStorage.getItem(this.prefix + '_order') || '[]');
    order = order.filter(k => k !== key);
    order.push(key);
    localStorage.setItem(this.prefix + '_order', JSON.stringify(order));
  }
  
  _evictIfNeeded() {
    let order = JSON.parse(localStorage.getItem(this.prefix + '_order') || '[]');
    while (order.length >= this.maxSize) {
      const oldestKey = order.shift();
      localStorage.removeItem(this.prefix + oldestKey);
    }
    localStorage.setItem(this.prefix + '_order', JSON.stringify(order));
  }
  
  remove(key) {
    localStorage.removeItem(this.prefix + key);
    this._updateOrder(key); // 会从顺序列表移除
  }
}
```

**知识点：** `localStorage 缓存` `过期时间` `LRU 算法` `缓存淘汰` `缓存管理`

:::

---

### Q6: 什么是 Service Worker？它如何实现离线缓存？

> **💀 困难 · Service Worker**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Service Worker**：运行在后台的独立线程脚本，可拦截网络请求、实现离线缓存、推送通知等。

**核心特性：**
- 独立线程，不阻塞主线程
- 只能运行在 HTTPS 环境下（本地除外）
- 强大的网络拦截能力
- 生命周期独立于页面

**生命周期：**
```
1. 安装（install） → 缓存资源
2. 激活（activate） → 清理旧缓存
3. 运行（fetch） → 拦截请求
```

**基本注册：**
```javascript
// 主线程注册
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW registered:', reg.scope))
    .catch(err => console.error('SW registration failed:', err));
}
```

**缓存策略实现：**
```javascript
// sw.js
const CACHE_NAME = 'app-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js'
];

// 安装阶段 - 预缓存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 激活阶段 - 清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// 请求拦截 - 缓存优先策略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
```

**常用缓存策略：**

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| **Cache First** | 缓存优先，没有再网络 | 静态资源 |
| **Network First** | 网络优先，失败用缓存 | API 请求 |
| **Stale While Revalidate** | 缓存立即返回，后台更新 | 图片、非关键数据 |
| **Cache Only** | 只用缓存 | 离线模式 |
| **Network Only** | 只用网络 | 实时数据 |

**知识点：** `Service Worker` `离线缓存` `PWA` `缓存策略` `网络拦截`

:::

---

### Q7: 什么是 Application Cache？为什么被废弃？

> **🔥 中等 · 离线存储**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Application Cache（AppCache）**：HTML5 早期的离线存储方案，已于 2020 年被彻底移除。

**基本用法：**
```html
<!-- HTML 中声明 manifest -->
<html manifest="cache.manifest">

<!-- cache.manifest 文件 -->
CACHE MANIFEST
# 版本注释（修改这个来触发更新）
# v1.0.0

CACHE:
/index.html
/styles.css
/app.js

NETWORK:
*

FALLBACK:
/ /offline.html
```

**区域说明：**
- **CACHE**: 要缓存的资源
- **NETWORK**: 始终从网络获取（* 表示所有未列出的）
- **FALLBACK**: 离线时的回退页面

**被废弃的原因：**

| 问题 | 说明 |
|------|------|
| **强制缓存** | 一旦在 manifest 中，始终用缓存，难以更新 |
| **更新机制差** | 只有 manifest 变化才更新，一个文件变导致全量更新 |
| **调试困难** | 行为复杂，难以排查问题 |
| **API 设计缺陷** | 没有细粒度控制 |
| **安全问题** | 潜在的中间人攻击风险 |

**迁移到 Service Worker：**
```javascript
// AppCache:
// <html manifest="cache.manifest">

// Service Worker:
// 更灵活的控制
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/static/')) {
    event.respondWith(
      caches.match(event.request).then(cached => 
        cached || fetch(event.request)
      )
    );
  }
});
```

**浏览器支持：**
- AppCache：已移除
- Service Worker：现代浏览器支持良好

**知识点：** `Application Cache` `离线存储` `Service Worker` `manifest` `废弃原因`

:::

---

### Q8: 什么是 Web SQL？为什么被废弃？

> **🔥 中等 · Web SQL**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Web SQL**：浏览器端的关系型数据库 API，基于 SQLite，已被 W3C 废弃。

**基本用法：**
```javascript
// 打开数据库
const db = openDatabase('mydb', '1.0', 'Test DB', 2 * 1024 * 1024);

// 执行 SQL
db.transaction(tx => {
  tx.executeSql(
    'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT)',
    [],
    () => console.log('表创建成功'),
    (tx, error) => console.error('创建失败:', error)
  );
});

// 插入数据
db.transaction(tx => {
  tx.executeSql(
    'INSERT INTO users (name) VALUES (?)',
    ['张三'],
    () => console.log('插入成功')
  );
});

// 查询数据
db.transaction(tx => {
  tx.executeSql(
    'SELECT * FROM users',
    [],
    (tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        console.log(results.rows.item(i));
      }
    }
  );
});
```

**被废弃的原因：**

| 原因 | 说明 |
|------|------|
| **依赖 SQLite** | 规范变成特定实现，不符合开放标准 |
| **安全顾虑** | SQL 注入风险 |
| **Mozilla/Google 反对** | 推动 IndexedDB 作为标准 |
| **API 异步模型复杂** | 事务模式难以使用 |
| **关系型 vs 键值/对象** | Web 场景更适合对象存储 |

**替代方案：**

| 方案 | 特点 |
|------|------|
| **IndexedDB** | W3C 标准，对象存储 |
| **localStorage** | 简单键值存储 |
| **PouchDB** | 基于 IndexedDB 的抽象层 |
| **Dexie.js** | IndexedDB 友好封装 |

**知识点：** `Web SQL` `IndexedDB` `客户端数据库` `废弃原因` `SQLite`

:::

---

### Q9: IndexedDB 的基本使用方式是什么？

> **💀 困难 · IndexedDB**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**IndexedDB 基本概念：**
- 事务型数据库
- 支持存储任意类型数据（除函数外）
- 异步 API
- 基于对象仓库（Object Store）和索引（Index）

**完整使用示例：**

```javascript
// 1. 打开/创建数据库
const request = indexedDB.open('TodoDB', 1);

// 只在版本变化或首次创建时调用
request.onupgradeneeded = (event) => {
  const db = event.target.result;
  
  // 创建对象仓库（类似表）
  const store = db.createObjectStore('todos', {
    keyPath: 'id',
    autoIncrement: true
  });
  
  // 创建索引
  store.createIndex('status', 'status', { unique: false });
  store.createIndex('priority', 'priority', { unique: false });
};

request.onsuccess = (event) => {
  const db = event.target.result;
  console.log('数据库打开成功');
  
  // 添加数据
  addTodo(db, { title: '学习 IndexedDB', status: 'pending', priority: 1 });
  
  // 查询数据
  getAllTodos(db);
};

// 添加数据
function addTodo(db, todo) {
  const tx = db.transaction('todos', 'readwrite');
  const store = tx.objectStore('todos');
  store.add(todo);
  
  tx.oncomplete = () => console.log('添加成功');
  tx.onerror = () => console.error('添加失败');
}

// 查询所有
function getAllTodos(db) {
  const tx = db.transaction('todos', 'readonly');
  const store = tx.objectStore('todos');
  const request = store.getAll();
  
  request.onsuccess = () => {
    console.log('所有待办:', request.result);
  };
}

// 使用索引查询
function queryByStatus(db, status) {
  const tx = db.transaction('todos', 'readonly');
  const store = tx.objectStore('todos');
  const index = store.index('status');
  const request = index.getAll(status);
  
  request.onsuccess = () => {
    console.log('状态为', status, '的待办:', request.result);
  };
}

// 删除数据
function deleteTodo(db, id) {
  const tx = db.transaction('todos', 'readwrite');
  tx.objectStore('todos').delete(id);
}

// 事务控制
function batchUpdate(db, updates) {
  const tx = db.transaction('todos', 'readwrite');
  const store = tx.objectStore('todos');
  
  updates.forEach(update => {
    store.put(update); // put 可新增或更新
  });
  
  tx.oncomplete = () => console.log('批量更新完成');
  tx.onabort = () => console.error('批量更新失败');
}
```

**Promise 封装：**
```javascript
function openDB(name, version) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getData(dbName, storeName, key) {
  const db = await openDB(dbName);
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  
  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
```

**知识点：** `IndexedDB` `对象仓库` `索引` `事务` `异步数据库`

:::

---

### Q10: 如何解决 localStorage 的跨域共享问题？

> **💀 困难 · 跨域存储**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**localStorage 同源策略限制：**
- 只能同协议、同域名、同端口访问
- 不同子域名不共享
- iframe 跨域无法访问父页面 localStorage

**解决方案：**

**1. document.domain（仅限子域）**
```javascript
// a.example.com 和 b.example.com 都可以设置
document.domain = 'example.com';
// 现在可以共享 localStorage
```
限制：只能设置父域，且双方都需设置

**2. postMessage 跨域通信**
```javascript
// 父页面
const iframe = document.querySelector('iframe');
iframe.contentWindow.postMessage({ type: 'GET_DATA' }, 'https://other.com');

window.addEventListener('message', (e) => {
  if (e.origin !== 'https://other.com') return;
  if (e.data.type === 'DATA_RESPONSE') {
    console.log('收到数据:', e.data.value);
  }
});

// 子页面（https://other.com）
window.addEventListener('message', (e) => {
  if (e.origin !== 'https://parent.com') return;
  if (e.data.type === 'GET_DATA') {
    const value = localStorage.getItem('key');
    e.source.postMessage({ type: 'DATA_RESPONSE', value }, e.origin);
  }
});
```

**3. 服务端中转**
```javascript
// 数据存储到服务端数据库
// 通过 API 获取，不依赖 localStorage
fetch('/api/user-data')
  .then(res => res.json())
  .then(data => {
    localStorage.setItem('cachedData', JSON.stringify(data));
  });
```

**4. SharedStorage API（实验性）**
```javascript
// 新的跨域存储提案
await sharedStorage.set('key', 'value');
const value = await sharedStorage.get('key');
```

**5. Cookie（设置 Domain）**
```javascript
// 设置共享 cookie
document.cookie = 'shared=value; domain=.example.com; path=/';
// 所有子域名都可以读取
```

**实际场景建议：**
- 单页应用：使用同一域名，无需特殊处理
- 微前端：使用 postMessage 或自定义事件
- 跨域 iframe：必须使用 postMessage
- 子域共享：设置 document.domain 或使用 Cookie

**知识点：** `localStorage` `跨域` `postMessage` `同源策略` `document.domain`

:::

---

### Q11: 什么是 Storage 事件？如何实现多标签页通信？

> **🔥 中等 · 多标签通信**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Storage Event**：当 localStorage 在同一浏览器的其他标签页发生变化时触发。

**特性：**
- 只在其他标签页触发（当前页不触发）
- 只能监测 localStorage，不包括 sessionStorage
- 事件携带旧值和新值

**基本用法：**
```javascript
// 监听 storage 事件
window.addEventListener('storage', (e) => {
  console.log('storage 变化:', {
    key: e.key,
    oldValue: e.oldValue,
    newValue: e.newValue,
    url: e.url,
    storageArea: e.storageArea
  });
});
```

**多标签页通信实现：**
```javascript
// Tab A - 发送消息
function sendMessage(data) {
  localStorage.setItem('tab_message', JSON.stringify({
    data,
    timestamp: Date.now()
  }));
}

// Tab B - 接收消息
window.addEventListener('storage', (e) => {
  if (e.key === 'tab_message') {
    const message = JSON.parse(e.newValue);
    // 防止自己触发
    if (message.source !== window.tabId) {
      handleMessage(message.data);
    }
  }
});

// Tab ID 生成
window.tabId = Math.random().toString(36).slice(2);
```

**广播模式实现：**
```javascript
class TabBroadcastChannel {
  constructor(channelName) {
    this.channelName = `broadcast_${channelName}`;
    this.listeners = new Set();
    
    window.addEventListener('storage', this._handleStorage.bind(this));
  }
  
  _handleStorage(e) {
    if (e.key === this.channelName && e.newValue) {
      try {
        const { data, sourceTab } = JSON.parse(e.newValue);
        // 不处理自己发的消息
        if (sourceTab !== this.tabId) {
          this.listeners.forEach(cb => cb(data));
        }
      } catch (err) {
        console.error('解析消息失败:', err);
      }
    }
  }
  
  postMessage(data) {
    const message = JSON.stringify({
      data,
      sourceTab: this.tabId,
      timestamp: Date.now()
    });
    localStorage.setItem(this.channelName, message);
    // 立即清理，避免积累
    setTimeout(() => localStorage.removeItem(this.channelName), 100);
  }
  
  onMessage(callback) {
    this.listeners.add(callback);
  }
}

// 使用
const channel = new TabBroadcastChannel('my-app');
channel.postMessage({ type: 'LOGOUT' });
channel.onMessage((data) => {
  console.log('收到广播:', data);
});
```

**BroadcastChannel API（更好的方案）：**
```javascript
// 现代浏览器支持
const bc = new BroadcastChannel('my_channel');

bc.postMessage({ type: 'UPDATE', data: '...' });

bc.onmessage = (event) => {
  console.log('收到:', event.data);
};
```

**知识点：** `storage 事件` `多标签通信` `BroadcastChannel` `localStorage` `标签页同步`

:::

---

### Q12: 浏览器存储的安全风险有哪些？如何防范？

> **💀 困难 · 存储安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**安全风险：**

**1. XSS 攻击（最常见）**
```javascript
// ❌ 危险：XSS 可窃取 localStorage
const token = localStorage.getItem('token');
// 攻击者注入: <script>sendToAttacker(localStorage.getItem('token'))</script>

// ✅ 防御：敏感数据放 HttpOnly Cookie
document.cookie = 'token=xxx; HttpOnly; Secure; SameSite=Strict';
```

**2. CSRF 攻击**
```javascript
// ❌ 自动携带的 Cookie 可能被利用
// 攻击者诱导用户访问恶意网站，发起请求到目标站点

// ✅ 防御：设置 SameSite
document.cookie = 'session=xxx; SameSite=Strict; Secure';

// 或使用 CSRF Token
fetch('/api/transfer', {
  method: 'POST',
  headers: { 'X-CSRF-Token': csrfToken }
});
```

**3. 中间人攻击**
```javascript
// ❌ HTTP 传输可被窃听
// ✅ 防御：强制 HTTPS
document.cookie = 'secret=xxx; Secure';
```

**4. 敏感数据暴露**
```javascript
// ❌ 危险：存储敏感信息
localStorage.setItem('password', '123456');
localStorage.setItem('creditCard', '4111-xxxx-xxxx-1234');

// ✅ 只做缓存，敏感数据在服务端
```

**防范建议：**

| 风险 | 防范措施 |
|------|----------|
| **XSS** | 输入过滤输出转义、HttpOnly Cookie、CSP |
| **CSRF** | SameSite Cookie、CSRF Token、验证 Referer |
| **中间人** | HTTPS、HSTS、证书固定 |
| **数据泄露** | 加密存储、最小化存储、定期清理 |

**内容安全策略（CSP）：**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self'">
```

**加密存储示例：**
```javascript
// 使用 CryptoJS 加密后再存储
const encrypted = CryptoJS.AES.encrypt(
  JSON.stringify(sensitiveData),
  'secret-key'
).toString();
localStorage.setItem('encryptedData', encrypted);

// 读取时解密
const decrypted = CryptoJS.AES.decrypt(
  encrypted,
  'secret-key'
).toString(CryptoJS.enc.Utf8);
const data = JSON.parse(decrypted);
```

**知识点：** `存储安全` `XSS 防御` `CSRF 防御` `HttpOnly` `CSP`

:::

---
### Q13: cookie 和 session 的区别？

> **🔥 中等 · 浏览器**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Cookie 和 Session 都是用来跟踪用户状态的机制，但实现方式和应用场景不同。**

**1. 基本概念：**

| 特性 | Cookie | Session |
|------|--------|---------|
| **存储位置** | 客户端（浏览器） | 服务端（内存/数据库/Redis） |
| **安全性** | 较低（易被窃取/篡改） | 较高（数据在服务端） |
| **大小限制** | 4KB 左右 | 取决于服务器内存 |
| **传输** | 每次请求自动携带 | 通过 sessionId 间接使用 |
| **生命周期** | 可设置过期时间 | 默认会话结束失效 |

**2. 工作原理对比：**

```
┌─────────────┐                    ┌─────────────┐
│   浏览器     │                    │    服务器    │
│             │      登录请求       │             │
│             │ ──────────────────► │             │
│             │                     │ 创建 Session│
│             │                     │ 生成 sessionId│
│             │      Set-Cookie    │             │
│   Cookie    │ ◄─────────────────  │  存储 Session│
│  sessionId  │                     │             │
│             │      后续请求       │             │
│ (自动携带)  │ ──────────────────► │ 根据 sessionId 查找│
│             │                     │   Session 数据│
└─────────────┘                    └─────────────┘
```

**3. Cookie 详解：**

```javascript
// 服务器设置 Cookie
Set-Cookie: sessionId=abc123; Path=/; HttpOnly; Secure; Max-Age=3600

// 前端 JavaScript 访问（仅限非 HttpOnly）
document.cookie = "username=John; path=/; max-age=3600";

// 读取 Cookie
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}
```

**Cookie 属性：**

| 属性 | 说明 |
|------|------|
| `Path` | Cookie 有效的路径 |
| `Domain` | Cookie 有效的域名 |
| `Expires/Max-Age` | 过期时间 |
| `HttpOnly` | 禁止 JavaScript 访问（防 XSS） |
| `Secure` | 仅通过 HTTPS 传输 |
| `SameSite` | CSRF 防护（Strict/Lax/None） |

**4. Session 实现示例：**

```javascript
// Node.js + Express + express-session
const session = require('express-session');

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 1 天
  },
  store: new RedisStore({ client: redisClient }) // 建议用 Redis 存储
}));

// 使用 Session
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // 验证用户
  if (validUser(username, password)) {
    // 保存 Session
    req.session.userId = user.id;
    req.session.username = username;
    res.json({ success: true });
  }
});

app.get('/profile', (req, res) => {
  if (req.session.userId) {
    res.json({ user: req.session.username });
  } else {
    res.status(401).json({ error: '未登录' });
  }
});
```

**5. Session 存储方式：**

```javascript
// 方式一：内存存储（开发环境）
const session = require('express-session');
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

// 方式二：Redis 存储（生产环境推荐）
const RedisStore = require('connect-redis').default;
const Redis = require('ioredis');

const redisClient = new Redis();
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));

// 方式三：数据库存储（MySQL/PostgreSQL）
const MySQLStore = require('express-mysql-session')(session);
const sessionStore = new MySQLStore({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'sessions'
});

app.use(session({
  store: sessionStore,
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
```

**6. 实际项目中的使用：**

```javascript
// 前端：敏感数据不要存在 Cookie 中
localStorage.setItem('userData', JSON.stringify({
  // 非敏感数据
  avatar: '...',
  nickname: '...'
}));

// Cookie 只存储 sessionId（通过 HttpOnly，前端无法访问）
// Set-Cookie: sessionId=xxx; HttpOnly; Secure

// 发送请求时自动携带 Cookie
fetch('/api/user/profile', {
  credentials: 'include' // 携带 Cookie
});
```

**7. 常见安全问题：**

| 问题 | Cookie | Session | 防护 |
|------|--------|---------|------|
| XSS 窃取 | ✅ 易受攻击 | ❌ 较安全 | 设置 HttpOnly |
| CSRF 攻击 | ✅ 易受攻击 | ✅ 易受攻击 | SameSite + Token |
| 中间人 | ✅ HTTPS 防护 | ✅ HTTPS 防护 | 强制 HTTPS |
| 会话劫持 | ✅ | ✅ | 定期轮换 sessionId |

**8. 最佳实践：**

```javascript
// 安全的 Session 配置
app.use(session({
  secret: process.env.SESSION_SECRET, // 环境变量
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,    // 防 XSS
    secure: true,      // HTTPS only
    sameSite: 'strict', // 防 CSRF
    maxAge: 24 * 60 * 60 * 1000 // 24 小时
  },
  store: new RedisStore({
    client: redisClient,
    prefix: 'sess:'
  })
}));

// 定期轮换 sessionId
app.use((req, res, next) => {
  if (req.session && !req.session.regenerateAt) {
    req.session.regenerateAt = Date.now();
  }
  
  // 每 1 小时重新生成 sessionId
  if (req.session && Date.now() - req.session.regenerateAt > 3600000) {
    req.session.regenerate((err) => {
      if (err) console.error(err);
      req.session.regenerateAt = Date.now();
    });
  }
  next();
});
```

**知识点：** `Cookie` `Session` `会话管理` `HTTP` `安全` `认证`

:::

---

### Q14: setTimeout 为什么会造成内存泄漏？

> **🔥 中等 · 浏览器**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**setTimeout 造成内存泄漏的主要原因是闭包引用和清理不当。**

**1. 闭包引起的内存泄漏：**

```javascript
// 问题代码
function createTask() {
  const largeData = new Array(1000000).fill('data');
  
  setTimeout(() => {
    // 闭包引用了 largeData
    console.log('Task complete');
  }, 1000);
}

createTask();
// 即使 1 秒后执行完毕，largeData 仍被闭包持有
// 如果 createTask 被频繁调用，内存会不断增长
```

**修复：**

```javascript
function createTask() {
  const largeData = new Array(1000000).fill('data');
  
  const callback = () => {
    console.log('Task complete');
  };
  
  setTimeout(callback, 1000);
  
  // 及时置空引用
  largeData = null;
}
```

**2. 未清除的定时器：**

```javascript
// 问题代码 - 组件销毁后定时器仍在
class Counter {
  constructor() {
    this.count = 0;
    this.interval = setInterval(() => {
      this.count++;
      console.log(this.count);
    }, 1000);
  }
  
  // 如果组件销毁时未调用 destroy，interval 会一直运行
  destroy() {
    clearInterval(this.interval);
  }
}

// React 示例
function EffectComponent() {
  const [count, setCount] = useState(0);
  
  // 问题代码 - 缺少清理
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    // 组件卸载时未清除
  }, []);
  
  return <div>{count}</div>;
}

// 正确代码 - 添加清理函数
function SafeComponent() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    
    // 清理函数必须返回
    return () => clearInterval(timer);
  }, []);
  
  return <div>{count}</div>;
}
```

**3. DOM 引用泄漏：**

```javascript
// 问题代码
const elements = [];

function startTask() {
  const element = document.getElementById('large-element');
  elements.push(element);
  
  setTimeout(() => {
    // 即使 DOM 已删除，这里仍持有引用
    console.log(element.innerHTML);
  }, 5000);
  
  // 用户删除了 DOM，但引用未释放
  element.remove();
}

// 修复
function fixedTask() {
  const element = document.getElementById('large-element');
  const content = element.innerHTML; // 只保存需要的数据
  
  setTimeout(() => {
    console.log(content);
  }, 5000);
  
  element.remove();
}
```

**4. 事件监听器泄漏：**

```javascript
// 问题代码
function attachHandler() {
  const box = document.querySelector('.box');
  
  box.addEventListener('click', function handler() {
    setTimeout(() => {
      console.log('延迟处理');
    }, 1000);
  });
  
  // 如果 box 被移除，eventListener 和 setTimeout 都可能泄漏
}

// 修复 - 移除监听器
function safeHandler() {
  const box = document.querySelector('.box');
  
  function handler() {
    const timer = setTimeout(() => {
      console.log('延迟处理');
    }, 1000);
    
    // 保存 timer 引用以便清理
    box.dataset.timerId = timer;
  }
  
  box.addEventListener('click', handler);
  
  // 清理函数
  function cleanup() {
    box.removeEventListener('click', handler);
  }
}
```

**5. 使用 WeakMap 避免强引用：**

```javascript
// 场景：需要关联数据和 DOM，但不希望阻止垃圾回收
const elementData = new WeakMap();

function setData(element, data) {
  elementData.set(element, data);
}

function getData(element) {
  return elementData.get(element);
}

// 当 element 被删除，WeakMap 中的条目会自动清除
```

**6. 检测内存泄漏：**

```javascript
// 使用 Chrome DevTools Memory 面板
// 1. 打开 Memory 标签
// 2. Take heap snapshot
// 3. 执行操作
// 4. 再取快照
// 5. 比较两个快照，查找未释放的对象

// 性能监控
function monitorMemory() {
  if (performance.memory) {
    console.log('已用内存:', performance.memory.usedJSHeapSize / 1048576, 'MB');
    console.log('总内存:', performance.memory.totalJSHeapSize / 1048576, 'MB');
    console.log('限制:', performance.memory.jsHeapSizeLimit / 1048576, 'MB');
  }
}
```

**7. 最佳实践：**

```javascript
// 1. 组件卸载时清理所有定时器
class SafeComponent {
  constructor() {
    this.timers = new Set();
  }
  
  setTimeout(callback, delay) {
    const timer = window.setTimeout(() => {
      callback();
      this.timers.delete(timer);
    }, delay);
    this.timers.add(timer);
    return timer;
  }
  
  destroy() {
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();
  }
}

// 2. 使用 AbortController 取消异步操作
function fetchData() {
  const controller = new AbortController();
  const { signal } = controller;
  
  fetch('/api/data', { signal })
    .catch(err => {
      if (err.name === 'AbortError') {
        console.log('请求已取消');
      }
    });
  
  // 组件卸载时
  controller.abort();
}

// 3. React Cleanup
useEffect(() => {
  const timer = setTimeout(() => {
    doSomething();
  }, 1000);
  
  // 必须返回清理函数
  return () => clearTimeout(timer);
}, []);
```

**知识点：** `JavaScript` `内存管理` `闭包` `垃圾回收` `setTimeout` `内存泄漏`

:::


---

### Q15: Cookie 的 SameSite 属性有哪些值？默认行为的变化？

> **🔥 中等 · Cookie 安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**SameSite 属性控制 Cookie 是否在跨站请求中发送，用于防御 CSRF 攻击。**

**1. SameSite 三个值：**

```javascript
Set-Cookie: session=abc; SameSite=Strict
Set-Cookie: session=abc; SameSite=Lax
Set-Cookie: session=abc; SameSite=None; Secure
```

**2. 各值行为对比：**

| 值 | 行为 | 使用场景 |
|----|------|----------|
| Strict | 所有跨站请求都不发送 | 敏感操作（支付、密码修改） |
| Lax | 跨站子请求不发，导航 GET 请求发送 | 一般场景（默认值） |
| None | 所有请求都发送（需 Secure） | 跨站追踪、第三方服务 |

**3. 详细行为说明：**

```text
SameSite=Strict:
- 导航访问：❌（来自外部链接）
- 表单提交：❌
- 图片/API 请求：❌
- 完全隔离

SameSite=Lax (默认):
- 导航访问：✅（地址栏直接访问、外部链接）
- 表单提交：❌（POST/PUT/DELETE）
- GET 子请求：❌（<img>、<script>）
- 平衡安全与可用性

SameSite=None:
- 所有请求：✅
- 必须配合 Secure（HTTPS）
- 用于第三方 Cookie
```

**4. 默认行为演进：**

```text
Chrome 80+ (2020 年 2 月起):
- 未指定 SameSite 的 Cookie 视为 Lax
- 需要跨站的必须显式声明 SameSite=None; Secure
- 阻断不安全的跨站 Cookie

之前版本:
- 未指定 = 无限制（所有请求发送）
- 有 CSRF 风险
```

**5. 实际场景示例：**

```http
# 登录 Cookie（高安全）
Set-Cookie: session=abc123; SameSite=Strict; Secure; HttpOnly

# 用户偏好（一般安全）
Set-Cookie: theme=dark; SameSite=Lax; Max-Age=31536000

# 第三方统计（跨站跟踪）
Set-Cookie: _ga=xyz; SameSite=None; Secure
```

**6. CSRF 防护效果：**

```text
攻击场景:
 hacker.com
   <form action="https://bank.com/transfer" method="POST">
     <input name="to" value="hacker">
     <input name="amount" value="10000">
   </form>
   <script>form.submit()</script>

SameSite=Lax 防护:
- 跨站 POST 请求不发送 Cookie
- 服务器无法验证身份
- 攻击失败 ✅

SameSite=None:
- Cookie 被发送
- 需要其他 CSRF 防护（Token）
```

**7. 兼容性注意：**

```javascript
// 旧浏览器不支持 SameSite=None
// 解决方案：双 Cookie
Set-Cookie: session_new=abc; SameSite=None; Secure
Set-Cookie: session_legacy=abc;

// 服务端按浏览器支持选择
if (browser.supportsSameSiteNone) {
  use("session_new");
} else {
  use("session_legacy"); // 配合 CSRF Token
}
```

**知识点：** `Cookie` `SameSite` `CSRF` `跨站请求` `Web 安全`

:::

---

### Q16: Web SQL 被废弃的原因？IndexedDB 的优势在哪？

> **🔥 中等 · 浏览器存储**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Web SQL 因依赖专有 SQLite 实现被废弃，IndexedDB 作为标准替代提供更强大的 NoSQL 存储。**

**1. Web SQL 废弃原因：**

```text
问题 1：规范停滞
- W3C 2009 年发布草案
- 依赖 SQLite 实现
- 未成为正式推荐标准
- 2010 年暂停开发

问题 2：实现分歧
- 仅 Chrome、Safari、Opera 支持
- Firefox、IE 拒绝实现
- 无法统一标准

问题 3：维护困难
- SQLite 是嵌入式数据库
- 各浏览器版本不一致
- 安全漏洞难以修补

正式废弃:
- Chrome: 119+ 移除
- Safari: 仍保留但不推荐
- MDN: 标记为废弃
```

**2. IndexedDB 核心特性：**

```javascript
// 基本使用
const request = indexedDB.open("MyDB", 1);

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  
  // 创建对象仓库（类似表）
  if (!db.objectStoreNames.contains("users")) {
    const store = db.createObjectStore("users", { 
      keyPath: "id",
      autoIncrement: true 
    });
    
    // 创建索引
    store.createIndex("email", "email", { unique: true });
    store.createIndex("name", "name", { unique: false });
  }
};

request.onsuccess = (event) => {
  const db = event.target.result;
  
  // 添加数据
  const tx = db.transaction("users", "readwrite");
  tx.objectStore("users").add({ name: "John", email: "john@example.com" });
  
  // 查询数据
  const index = tx.objectStore("users").index("email");
  index.get("john@example.com").onsuccess = (e) => {
    console.log(e.target.result); // 查询结果
  };
};
```

**3. IndexedDB vs Web SQL 对比：**

| 特性 | Web SQL | IndexedDB |
|------|---------|-----------|
| 数据模型 | 关系型（SQL） | NoSQL（对象存储） |
| 查询语言 | SQL | API + 索引 |
| 事务支持 | ✅ | ✅ |
| 异步执行 | ❌（同步 API） | ✅ |
| 浏览器支持 | 废弃 | 全平台 |
| 存储容量 | ~5-25MB | ~50MB- 无上限 |
| 索引 | 手动 | 自动 |
| 游标 | ✅ | ✅ |

**4. IndexedDB 优势：**

```text
1. 标准化
   - W3C 正式推荐标准
   - 所有现代浏览器支持
   - 持续维护更新

2. 大容量存储
   - 无硬性上限
   - 按需申请空间
   - 适合离线应用

3. 异步非阻塞
   - 所有操作异步
   - 不阻塞主线程
   - 不卡顿 UI

4. 丰富数据类型
   - 支持任意 JS 对象
   - 支持 Blob/File
   - 支持二进制数据

5. 版本管理
   - 数据库版本控制
   - Schema 自动升级
   - 数据迁移支持
```

**5. 实际应用场景：**

```javascript
// PWA 离线存储
// 缓存文章、图片等大量数据

// 本地数据库
// 存储用户消息、联系人等结构化数据

// 媒体处理
// 存储视频/音频 Blob 进行编辑

// 复杂搜索
// 多索引支持快速查询
```

**6. 现代存储方案选择：**

```text
小数据简单键值：
→ localStorage (<5MB, 同步)

结构化数据：
→ IndexedDB (大容量，异步)

文件/媒体：
→ IndexedDB + File API

会话数据：
→ sessionStorage

临时数据：
→ Cache API (fetch 响应)

配置偏好：
→ localStorage cookies
```

**知识点：** `Web SQL` `IndexedDB` `浏览器存储` `LocalStorage` `离线存储`

:::

