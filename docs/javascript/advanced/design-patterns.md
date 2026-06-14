---
title: 设计模式
description: 单例、工厂、观察者、发布订阅、策略、代理、装饰器等 JavaScript 设计模式面试题
---

# 设计模式

设计模式是解决常见软件设计问题的可复用方案。理解常用的设计模式有助于编写更优雅的代码。

---

## 📝 题目

### Q1: 单例模式的实现及应用场景

> **⭐ 简单 · JavaScript**

请实现一个单例模式，并说明应用场景。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**实现：**
```js
// 方式 1：闭包
const Singleton = (function() {
  let instance;
  
  function createInstance() {
    return { message: 'I am singleton' };
  }
  
  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

// 方式 2：class
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    Singleton.instance = this;
    this.data = 'singleton data';
  }
}

// 方式 3：Proxy
const singleton = new Proxy({
  data: 'singleton'
}, {
  get(target, prop) {
    if (!target._initialized) {
      target._initialized = true;
      console.log('Initializing...');
    }
    return target[prop];
  }
});
```

**应用场景：**
1. 全局状态管理（Store）
2. 日志记录器
3. 数据库连接池
4. 配置管理

**知识点：** `单例模式` `全局实例` `懒加载`

:::

---

### Q2: 工厂模式的实现

> **⭐ 简单 · JavaScript**

请实现一个工厂模式，并说明应用场景。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**简单工厂：**
```js
function createCar(type) {
  if (type === 'sedan') {
    return {
      type: 'sedan',
      doors: 4,
      drive() { console.log('Driving sedan'); }
    };
  } else if (type === 'truck') {
    return {
      type: 'truck',
      doors: 2,
      drive() { console.log('Driving truck'); }
    };
  }
}

const car = createCar('sedan');
```

**工厂方法模式：**
```js
class Car {
  constructor() {
    this.type = 'car';
  }
  drive() { console.log('Driving'); }
}

class Sedan extends Car {
  constructor() {
    super();
    this.doors = 4;
  }
}

class Truck extends Car {
  constructor() {
    super();
    this.doors = 2;
  }
}

class CarFactory {
  createCar(type) {
    switch(type) {
      case 'sedan': return new Sedan();
      case 'truck': return new Truck();
    }
  }
}
```

**应用场景：**
1. UI 组件创建
2. 数据库驱动
3. 跨平台适配

**知识点：** `工厂模式` `对象创建` `解耦`

:::

---

### Q3: 观察者模式和发布订阅有什么区别？

> **🔥 中等 · JavaScript**

请实现观察者模式和发布订阅模式，并说明区别。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**观察者模式（紧耦合）：**
```js
class Subject {
  constructor() {
    this.observers = [];
  }
  
  subscribe(observer) {
    this.observers.push(observer);
  }
  
  notify(data) {
    this.observers.forEach(obs => obs.update(data));
  }
}

class Observer {
  update(data) {
    console.log('Received:', data);
  }
}
```

**发布订阅模式（解耦）：**
```js
class EventBus {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(data));
    }
  }
  
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(
        cb => cb !== callback
      );
    }
  }
}
```

**区别：**
| 特性 | 观察者 | 发布订阅 |
|------|--------|---------|
| 耦合度 | 紧耦合 | 解耦 |
| 中间层 | 无 | 事件总线 |
| 订阅管理 | Subject 管理 | 独立管理 |
| 应用场景 | 对象间通知 | 跨模块通信 |

**知识点：** `观察者` `发布订阅` `事件系统`

:::

---

### Q4: 策略模式的实现

> **⭐ 简单 · JavaScript**

请实现一个策略模式，用于不同的促销折扣计算。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

```js
// 策略定义
const strategies = {
  // 新用户 9 折
  newUser(price) {
    return price * 0.9;
  },
  // VIP 用户 8 折
  vip(price) {
    return price * 0.8;
  },
  // 双 11 满减
  double11(price) {
    return price >= 200 ? price - 50 : price;
  },
  // 原价
  normal(price) {
    return price;
  }
};

// 上下文
class PriceCalculator {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  setStrategy(strategy) {
    this.strategy = strategy;
  }
  
  calculate(price) {
    return this.strategy(price);
  }
}

// 使用
const calc = new PriceCalculator(strategies.newUser);
console.log(calc.calculate(100));  // 90

calc.setStrategy(strategies.double11);
console.log(calc.calculate(300));  // 250
```

**应用场景：**
1. 折扣计算
2. 排序算法选择
3. 表单验证
4. 支付方式

**优点：**
- 易于扩展新策略
- 避免大量 if-else
- 策略可复用

**知识点：** `策略模式` `算法封装` `可扩展`

:::

---

### Q5: 代理模式的实现

> **⭐ 简单 · JavaScript**

请实现一个代理模式，用于接口请求缓存和日志。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

```js
// 被代理对象
const api = {
  async getUser(id) {
    console.log('Fetching user:', id);
    return { id, name: 'User ' + id };
  }
};

// 代理
const apiProxy = new Proxy(api, {
  get(target, prop, receiver) {
    const original = target[prop];
    
    if (typeof original === 'function') {
      return async function(...args) {
        console.log(`[Proxy] Calling ${prop} with`, args);
        const start = Date.now();
        const result = await original.apply(this, args);
        console.log(`[Proxy] ${prop} took ${Date.now() - start}ms`);
        return result;
      };
    }
    
    return original;
  }
});

// 使用
await apiProxy.getUser(1);
// [Proxy] Calling getUser with [1]
// Fetching user: 1
// [Proxy] getUser took 100ms
```

**应用场景：**
1. 缓存代理
2. 日志代理
3. 权限代理
4. 虚拟代理（延迟加载）

**知识点：** `代理模式` `Proxy` `AOP`

:::

---

### Q6: 装饰器模式的实现

> **🔥 中等 · JavaScript**

请实现一个装饰器模式，用于给方法添加日志和权限校验。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**函数装饰器：**
```js
// 日志装饰器
function withLog(fn) {
  return function(...args) {
    console.log(`Calling with args:`, args);
    const result = fn.apply(this, args);
    console.log(`Result:`, result);
    return result;
  };
}

// 权限装饰器
function withAuth(fn, allowedRoles) {
  return function(...args) {
    if (!allowedRoles.includes(this.role)) {
      throw new Error('Unauthorized');
    }
    return fn.apply(this, args);
  };
}

// 使用
class UserService {
  constructor(role) {
    this.role = role;
  }
  
  getUser(id) {
    return { id, name: 'User' };
  }
}

const service = new UserService('admin');
service.getUser = withLog(
  withAuth(service.getUser.bind(service), ['admin'])
);
```

**Class 装饰器（ES 装饰器提案）：**
```js
function readonly(target, name, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

function log(target, name, descriptor) {
  const original = descriptor.value;
  descriptor.value = function(...args) {
    console.log(`Calling ${name}`);
    return original.apply(this, args);
  };
  return descriptor;
}

class Person {
  @readonly
  name = 'Alice';
  
  @log
  greet() {
    console.log('Hello');
  }
}
```

**知识点：** `装饰器模式` `AOP` `函数增强`

:::

---

### Q7: 适配器模式的实现

> **⭐ 简单 · JavaScript**

请实现一个适配器模式，用于新旧接口的兼容。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

```js
// 旧接口
class OldAPI {
  getData(cb) {
    cb({ status: 'ok', data: [] });
  }
}

// 新接口期望
class NewAPI {
  async fetch() {
    return { success: true, result: [] };
  }
}

// 适配器
class APIAdapter {
  constructor(oldAPI) {
    this.oldAPI = oldAPI;
  }
  
  async fetch() {
    return new Promise((resolve) => {
      this.oldAPI.getData((response) => {
        resolve({
          success: response.status === 'ok',
          result: response.data
        });
      });
    });
  }
}

// 使用
const oldAPI = new OldAPI();
const adapter = new APIAdapter(oldAPI);
const result = await adapter.fetch();
```

**应用场景：**
1. 新旧代码兼容
2. 第三方库封装
3. 接口标准化
4. 跨平台适配

**知识点：** `适配器模式` `接口兼容` `封装`

:::

---

### Q8: 中介者模式的实现

> **🔥 中等 · JavaScript**

请实现一个中介者模式，用于聊天室功能。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

```js
// 中介者
class ChatRoom {
  constructor() {
    this.users = [];
    this.messages = [];
  }
  
  addUser(user) {
    this.users.push(user);
    user.setChatRoom(this);
  }
  
  sendMessage(sender, message) {
    this.messages.push({ sender, message, time: new Date() });
    this.users.forEach(user => {
      if (user !== sender) {
        user.receiveMessage(sender.name, message);
      }
    });
  }
}

// 同事类
class User {
  constructor(name) {
    this.name = name;
    this.chatRoom = null;
  }
  
  setChatRoom(chatRoom) {
    this.chatRoom = chatRoom;
  }
  
  send(message) {
    this.chatRoom.sendMessage(this, message);
  }
  
  receiveMessage(from, message) {
    console.log(`${this.name} received from ${from}: ${message}`);
  }
}

// 使用
const room = new ChatRoom();
const alice = new User('Alice');
const bob = new User('Bob');

room.addUser(alice);
room.addUser(bob);

alice.send('Hello!');
// Bob received from Alice: Hello!
```

**特点：**
- 减少对象间直接通信
- 集中控制逻辑
- 降低耦合度

**知识点：** `中介者模式` `解耦` `集中控制`

:::

---

### Q9: 迭代器模式的实现

> **⭐ 简单 · JavaScript**

请实现一个迭代器模式，并说明 ES6 迭代器协议。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**手动实现迭代器：**
```js
const iterator = {
  current: 0,
  last: 5,
  next() {
    if (this.current < this.last) {
      return { value: this.current++, done: false };
    }
    return { value: undefined, done: true };
  },
  [Symbol.iterator]() {
    return this;
  }
};

for (const n of iterator) {
  console.log(n);  // 0, 1, 2, 3, 4
}
```

**自定义集合迭代器：**
```js
class Collection {
  constructor(items) {
    this.items = items;
  }
  
  [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => {
        if (index < this.items.length) {
          return { value: this.items[index++], done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
}

const collection = new Collection([1, 2, 3]);
for (const item of collection) {
  console.log(item);
}
```

**ES6 迭代器协议：**
- 对象有 `[Symbol.iterator]` 方法
- 返回具有 `next()` 方法的对象
- `next()` 返回 `{ value, done }`

**知识点：** `迭代器模式` `Symbol.iterator` `遍历协议`

:::

---

### Q10: Vue/React 中的设计模式

> **💀 困难 · JavaScript**

请说明 Vue 和 React 中使用了哪些设计模式。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**Vue 中的设计模式：**

1. **观察者模式**：响应式数据
```js
// Vue 2 的 Object.defineProperty
observe(data) {
  Object.keys(data).forEach(key => {
    const dep = new Dep();
    let val = data[key];
    Object.defineProperty(data, key, {
      get() { dep.depend(); return val; },
      set(newVal) { val = newVal; dep.notify(); }
    });
  });
}
```

2. **发布订阅**：事件系统
```js
this.$emit('event', data);
this.$on('event', handler);
```

3. **单例模式**：Vue 实例
4. **工厂模式**：组件创建
5. **装饰器模式**：mixin、provide/inject

**React 中的设计模式：**

1. **组合模式**：组件树
2. **高阶组件**（HOC）：装饰器
3. **渲染属性**：策略模式
4. **观察者模式**：Hooks 状态更新
5. **不可变模式**：状态管理

**共同模式：**
- **虚拟 DOM**：策略模式（diff 算法）
- **指令/属性**：命令模式
- **Context/Provide**：单例 + 观察者

**知识点：** `Vue 模式` `React 模式` `框架设计`

:::

---

## 🔑 核心知识点总结

### 1. 创建型模式

| 模式 | 用途 |
|------|------|
| 单例 | 全局唯一实例 |
| 工厂 | 封装对象创建 |

### 2. 结构型模式

| 模式 | 用途 |
|------|------|
| 代理 | 控制访问 |
| 装饰器 | 增强功能 |
| 适配器 | 接口兼容 |

### 3. 行为型模式

| 模式 | 用途 |
|------|------|
| 观察者 | 一对多通知 |
| 发布订阅 | 解耦通信 |
| 策略 | 算法切换 |
| 中介者 | 集中控制 |
| 迭代器 | 统一遍历 |

### 4. 框架中的应用

- Vue：响应式（观察者）、事件（发布订阅）
- React：组件组合、Hooks

## 💡 面试技巧

1. **单例/工厂**：能手写实现
2. **观察者 vs 发布订阅**：知道区别
3. **策略模式**：能举例说明
4. **代理/装饰器**：了解应用场景
5. **框架模式**：能分析 Vue/React
---

### Q11: 观察者模式和发布订阅模式的区别？

> **🔥 中等 · JavaScript**

请说明观察者模式和发布订阅模式的区别。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**观察者模式（Observer）：**
- 一对多的依赖关系
- 观察者直接订阅目标
- 目标知道所有观察者

```js
// 观察者模式
class Subject {
  constructor() {
    this.observers = [];
  }
  
  subscribe(observer) {
    this.observers.push(observer);
  }
  
  notify(data) {
    this.observers.forEach(obs => obs.update(data));
  }
}

class Observer {
  constructor(name) {
    this.name = name;
  }
  update(data) {
    console.log(`${this.name} 收到：${data}`);
  }
}

const subject = new Subject();
subject.subscribe(new Observer('A'));
subject.subscribe(new Observer('B'));
subject.notify('消息');
```

**发布订阅模式（PubSub）：**
- 基于事件通道
- 发布者和订阅者解耦
- 通过事件名区分

```js
// 发布订阅模式
class PubSub {
  constructor() {
    this.events = {};
  }
  
  subscribe(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  publish(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(data));
    }
  }
  
  unsubscribe(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

// 使用
const pubsub = new PubSub();
pubsub.subscribe('news', data => console.log('A 收到:', data));
pubsub.publish('news', '消息');
```

**对比：**

| 特性 | 观察者模式 | 发布订阅模式 |
|------|-----------|-------------|
| 耦合度 | 紧耦合 | 松耦合 |
| 中间层 | 无 | 事件中心 |
| 订阅方式 | 直接订阅目标 | 订阅事件名 |
| 匿名性 | 观察者对目标可见 | 完全匿名 |
| 应用场景 | MVC、响应式 | 事件总线、消息队列 |

**知识点：** `观察者模式` `发布订阅` `设计模式` `解耦`

:::

---

### Q12: 策略模式在前端中的应用？表单验证示例

> **🔥 中等 · JavaScript**

请说明策略模式及表单验证应用。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**策略模式：** 定义一系列可互换的算法，使它们可以独立于使用它们的客户端而变化。

**表单验证策略：**
```js
// 验证策略
const validators = {
  required: (value) => {
    return value.trim() !== '' ? null : '必填项';
  },
  
  minLength: (min) => (value) => {
    return value.length >= min ? null : `最少${min}个字符`;
  },
  
  maxLength: (max) => (value) => {
    return value.length <= max ? null : `最多${max}个字符`;
  },
  
  email: (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) ? null : '邮箱格式错误';
  },
  
  pattern: (regex, message) => (value) => {
    return regex.test(value) ? null : message;
  }
};

// 验证器类
class FormValidator {
  constructor() {
    this.rules = {};
  }
  
  addRule(field, strategy) {
    if (!this.rules[field]) {
      this.rules[field] = [];
    }
    this.rules[field].push(strategy);
  }
  
  validate(field, value) {
    const errors = [];
    const strategies = this.rules[field] || [];
    
    for (const strategy of strategies) {
      const error = strategy(value);
      if (error) {
        errors.push(error);
        break;  // 只返回第一个错误
      }
    }
    
    return errors;
  }
  
  validateAll(data) {
    const errors = {};
    for (const field in this.rules) {
      const fieldErrors = this.validate(field, data[field]);
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }
    return errors;
  }
}

// 使用
const validator = new FormValidator();
validator.addRule('username', validators.required);
validator.addRule('username', validators.minLength(3));
validator.addRule('email', validators.email);

const errors = validator.validateAll({
  username: 'ab',
  email: 'invalid'
});
console.log(errors);
// { username: ['最少 3 个字符'], email: ['邮箱格式错误'] }
```

**其他应用场景：**
- 排序算法策略
- 动画缓动函数
- 支付方式处理
- 数据格式化

**知识点：** `策略模式` `表单验证` `设计模式` `可替换算法`

:::

---

### Q13: 代理模式在前端中的应用？Vue 响应式/图片懒加载/缓存代理

> **🔥 中等 · JavaScript**

请说明代理模式及前端应用。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**代理模式：** 为对象提供代理以控制对它的访问。

**1. Vue 3 响应式代理：**
```js
function reactive(obj) {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      track(target, prop);  // 收集依赖
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver);
      trigger(target, prop);  // 触发更新
      return result;
    }
  });
}

const state = reactive({ count: 0 });
state.count++;  // 自动触发视图更新
```

**2. 图片懒加载代理：**
```js
class ImageProxy {
  constructor(src) {
    this.src = src;
    this.image = null;
    this.loaded = false;
  }
  
  load() {
    if (this.loaded) return this.image;
    
    this.image = new Image();
    this.image.src = this.src;
    this.image.onload = () => {
      this.loaded = true;
      console.log('图片加载完成');
    };
    return this.image;
  }
  
  display(container) {
    if (this.loaded) {
      container.appendChild(this.image);
    } else {
      // 显示占位图
      container.innerHTML = '<div class="placeholder">加载中...</div>';
      this.load();
    }
  }
}

// 使用
const imgProxy = new ImageProxy('large-image.jpg');
imgProxy.display(document.getElementById('container'));
```

**3. 缓存代理：**
```js
function createCacheProxy(api) {
  const cache = new Map();
  
  return new Proxy(api, {
    get(target, prop) {
      const method = target[prop];
      if (typeof method !== 'function') return method;
      
      return function(...args) {
        const key = JSON.stringify(args);
        
        if (cache.has(key)) {
          console.log('缓存命中');
          return Promise.resolve(cache.get(key));
        }
        
        return method.apply(this, args).then(result => {
          cache.set(key, result);
          return result;
        });
      };
    }
  });
}

// 使用
const api = {
  fetchUser: (id) => fetch(`/api/users/${id}`).then(r => r.json())
};

const cachedApi = createCacheProxy(api);
cachedApi.fetchUser(1);  // 网络请求
cachedApi.fetchUser(1);  // 缓存命中
```

**4. 虚拟代理（性能优化）：**
```js
// 文件上传代理（批量处理）
class UploadProxy {
  constructor(realUploader) {
    this.realUploader = realUploader;
    this.queue = [];
    this.timer = null;
  }
  
  add(file) {
    this.queue.push(file);
    
    if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), 1000);
    }
  }
  
  flush() {
    if (this.queue.length === 0) return;
    
    this.realUploader.uploadBatch(this.queue);
    this.queue = [];
    this.timer = null;
  }
}
```

**知识点：** `代理模式` `Vue 响应式` `懒加载` `缓存` `虚拟代理`

:::

---

### Q14: 装饰器模式在前端中的应用？（高阶组件/TS 装饰器）

> **🔥 中等 · JavaScript**

请说明装饰器模式及前端应用。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**装饰器模式：** 动态给对象添加职责，比继承更灵活。

**1. 函数装饰器（高阶函数）：**
```js
// 日志装饰器
function withLogging(fn) {
  return function(...args) {
    console.log(`调用 ${fn.name}`, args);
    const result = fn.apply(this, args);
    console.log(`返回`, result);
    return result;
  };
}

// 防抖装饰器
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 使用
const loggedFn = withLogging(someFunction);
const debouncedFn = debounce(submit, 300);
```

**2. React 高阶组件（HOC）：**
```js
// 认证装饰器
function withAuth(WrappedComponent) {
  return function Authenticated(props) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    useEffect(() => {
      checkAuth().then(setIsAuthenticated);
    }, []);
    
    if (!isAuthenticated) {
      return <Login />;
    }
    
    return <WrappedComponent {...props} />;
  };
}

// 使用
const ProtectedPage = withAuth(Dashboard);
```

**3. TypeScript 装饰器：**
```typescript
// 类装饰器
function logClass(target: Function) {
  console.log(`类 ${target.name} 被创建`);
}

// 方法装饰器
function logMethod(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;
  descriptor.value = function(...args: any[]) {
    console.log(`调用 ${propertyKey}`, args);
    return original.apply(this, args);
  };
}

// 使用
@logClass
class UserService {
  @logMethod
  getUser(id: number) {
    return fetch(`/api/users/${id}`);
  }
}
```

**4. 属性装饰器：**
```typescript
function readonly(target: any, propertyKey: string) {
  Object.defineProperty(target, propertyKey, {
    writable: false
  });
}

class Config {
  @readonly
  API_URL = 'https://api.example.com';
}
```

**知识点：** `装饰器模式` `高阶组件` `TypeScript 装饰器` `函数组合`

:::

---

### Q15: 迭代器模式和生成器的关系？for...of 的本质

> **🔥 中等 · JavaScript**

请说明迭代器模式与生成器的关系。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**迭代器模式：** 提供统一接口遍历集合，暴露内部结构。

**手动实现迭代器：**
```js
const myIterator = {
  data: [1, 2, 3],
  index: 0,
  
  [Symbol.iterator]() {
    return {
      next: () => {
        if (this.index < this.data.length) {
          return { value: this.data[this.index++], done: false };
        }
        return { done: true };
      }
    };
  }
};

for (const item of myIterator) {
  console.log(item);  // 1, 2, 3
}
```

**生成器简化迭代器：**
```js
function* createIterator(data) {
  for (const item of data) {
    yield item;
  }
}

const gen = createIterator([1, 2, 3]);
for (const item of gen) {
  console.log(item);
}
```

**生成器自动实现迭代器协议：**
```js
function* range(start, end) {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

// 生成器函数返回的就是迭代器
const it = range(0, 3);
it.next();  // { value: 0, done: false }
it.next();  // { value: 1, done: false }

// 可以直接用于 for...of
[...range(0, 3)];  // [0, 1, 2]
```

**for...of 的本质：**
```js
// for...of 等价于
const iterable = collection[Symbol.iterator]();
let result;
while (!(result = iterable.next()).done) {
  currentValue = result.value;
  // 执行循环体
}
```

**可迭代对象要求：**
```js
// 只要有 Symbol.iterator 方法就是可迭代的
const iterable = {
  [Symbol.iterator]() {
    return {
      next: () => ({ value: 'hello', done: false })
    };
  }
};

[...iterable];  // 可以展开
```

**应用场景：**
- 自定义集合遍历
- 惰性序列生成
- 异步数据流（async iterator）

**知识点：** `迭代器模式` `生成器` `for...of` `Symbol.iterator` `可迭代协议`

:::
