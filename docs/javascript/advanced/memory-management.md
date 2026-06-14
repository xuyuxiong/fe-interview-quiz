---
title: 内存管理
description: V8 垃圾回收、内存泄漏场景、Chrome DevTools 内存分析、WeakMap/WeakSet 等核心面试题
---

# 内存管理

理解 JavaScript 的内存管理机制对于编写高性能应用和避免内存泄漏至关重要。

---

## 📝 题目

### Q1: V8 引擎的垃圾回收机制是什么？

> **🔥 中等 · JavaScript**

请解释 V8 的垃圾回收策略，包括新生代和老生代。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**V8 内存分区：**
```
┌─────────────────────────────────────┐
│           V8 Memory Heap            │
├──────────────┬──────────────────────┤
│   新生代     │      老生代          │
│  (New Gen)   │   (Old Gen)         │
│  0-16MB      │    其余空间         │
└──────────────┴──────────────────────┘
```

**新生代算法（Scavenge）：**
- 使用 Cheney 算法
- 将对象分配到 From 和 To 两个半区
- 存活的对象复制到 To 区
- 清空 From 区，交换 From 和 To
- 适合短生命周期对象

**老生代算法（Mark-Sweep/Mark-Compact）：**
- 标记 - 清除：标记所有可达对象，清除未标记的
- 标记 - 整理：清除后整理内存碎片
- 适合长生命周期对象

**对象晋升规则：**
1. 新生代中经历过一次回收仍存活
2. To 区使用率超过 25%

**知识点：** `V8` `垃圾回收` `内存分区`

:::

---

### Q2: 常见的内存泄漏场景有哪些？

> **🔥 中等 · JavaScript**

请列举并说明至少 4 种内存泄漏场景。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**1. 全局变量：**
```js
// 忘记声明
function leak() {
  leakedVar = 'I am global';
}

//  intentional
var globalData = [];
```

**2. 遗忘的定时器：**
```js
function start() {
  const data = new Array(10000).fill('x');
  setInterval(() => {
    console.log(data.length);
  }, 1000);
  // 没有 clearInterval
}
```

**3. 闭包引用：**
```js
function createLeak() {
  const bigData = new Array(1000000).fill('data');
  return function() {
    console.log('I only need a flag');
    // 虽然只用到了 flag，但 bigData 也被保留
  };
}
```

**4. 分离的 DOM：**
```js
let data;
function attach() {
  const div = document.createElement('div');
  data = { ref: div };
  document.body.appendChild(div);
}
// 移除 DOM 但 JS 引用还在
document.body.innerHTML = '';
// data.ref 仍然持有 DOM 引用
```

**5. 事件监听器：**
```js
element.addEventListener('click', handler);
// 没有 removeEventListener
```

**知识点：** `内存泄漏` `常见场景` `预防`

:::

---

### Q3: 如何使用 Chrome DevTools 分析内存？

> **⭐ 简单 · JavaScript**

请说明 Chrome DevTools 中常用的内存分析工具。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**Performance Monitor（性能监控）：**
- 实时监控内存使用
- 观察内存增长趋势

**Heap Snapshot（堆快照）：**
1. 打开 DevTools > Memory
2. 点击 Heap snapshot
3. Take snapshot
4. 对比多个快照找泄漏

**snapshot 分析视图：**
- **Summary**: 按类型分组
- **Containment**: 对象引用关系
- **Statistics**: 内存分配统计

**Allocation instrumentation:**
- 实时跟踪内存分配
- 定位分配热点代码

**Memory 面板操作步骤：**
```
1. 记录初始快照
2. 执行操作
3. 记录操作后快照
4. 对比差异
5. 查看保留树（Retained tree）
6. 定位泄漏源
```

**知识点：** `DevTools` `内存分析` `Heap snapshot`

:::

---

### Q4: WeakMap 和 WeakSet 如何帮助内存管理？

> **🔥 中等 · JavaScript**

请解释 WeakMap/WeakSet 的特点和内存管理作用。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**特点：**
1. **弱引用**：不阻止垃圾回收
2. **键必须是对象**：不能是原始值
3. **不可遍历**：没有 forEach、keys 等方法
4. **没有 size 属性**

**内存管理作用：**

**1. 私有数据（自动清理）：**
```js
const privateData = new WeakMap();
class MyClass {
  constructor(secret) {
    privateData.set(this, { secret });
  }
  getSecret() {
    return privateData.get(this).secret;
  }
}
// 实例被 GC 后，WeakMap 中的数据自动清理
```

**2. DOM 元素关联数据：**
```js
const elementData = new WeakMap();

function setElementData(el, data) {
  elementData.set(el, data);
}

getData(el) {
  return elementData.get(el);
}
// 元素被移除后，关联数据自动清理
```

**3. 缓存（自动过期）：**
```js
const cache = new WeakMap();
function heavyComputation(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = /* 耗时计算 */;
  cache.set(obj, result);
  return result;
}
```

**知识点：** `WeakMap` `弱引用` `GC 友好`

:::

---

### Q5: 标记清除和引用计数有什么区别？

> **⭐ 简单 · JavaScript**

请解释这两种垃圾回收算法的区别。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

| 算法 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| 引用计数 | 记录引用数量，归 0 时回收 | 简单，及时 | 无法处理循环引用 |
| 标记清除 | 从根遍历标记，清除未标记 | 处理循环引用 | 可能有碎片 |

**引用计数问题：**
```js
function circular() {
  const a = {};
  const b = {};
  a.ref = b;
  b.ref = a;
  // 互相引用，计数永远不为 0
}
circular();
// 函数返回后对象应该被回收，但引用计数无法处理
```

**标记清除流程：**
```
1. 从根对象（全局对象、栈）开始
2. 遍历所有可达对象并标记
3. 清除未标记的对象
4. 可选：整理内存碎片
```

**现代浏览器普遍使用标记清除算法。**

**知识点：** `标记清除` `引用计数` `循环引用`

:::

---

### Q6: 什么是内存碎片？如何整理？

> **🔥 中等 · JavaScript**

请解释内存碎片问题及解决方案。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**内存碎片：**
- 频繁分配和释放导致的内存空洞
- 可用内存被分割成小块
- 大对象无法分配，尽管总空闲内存足够

**问题示例：**
```
内存状态： [已用][空闲][已用][空闲][已用][空闲]
          每个空闲块 4KB，总共 12KB 空闲
          但需要分配 8KB 对象 → 失败
```

**解决方案：标记 - 整理（Mark-Compact）**
```
1. 标记所有存活对象
2. 将存活对象向一端移动
3. 清理边界外的所有内存
4. 消除碎片
```

**整理后：**
```
内存状态： [已用][已用][已用][空闲---------------]
                                   连续 12KB
```

**V8 的策略：**
- 小对象使用 Scavenge（复制算法，无碎片）
- 大对象使用 Mark-Compact（整理消除碎片）

**知识点：** `内存碎片` `标记整理` `V8 优化`

:::

---

### Q7: 如何检测和修复内存泄漏？

> **💀 困难 · JavaScript**

在实际项目中如何发现和解决内存泄漏？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**检测步骤：**

**1. 复现问题**
```js
// 固定步骤触发泄漏
function triggerLeak() {
  for (let i = 0; i < 100; i++) {
    createComponent();
  }
}
```

**2. 使用 Heap Snapshot 对比**
```
1. 操作前拍摄快照
2. 执行可能泄漏的操作
3. 拍摄快照
4. 对比两个快照
5. 查找 Detached DOM trees
6. 查看对象保留路径
```

**3. 使用 Allocation sampling**
```
- 实时记录分配
- 找出分配热点
- 定位泄漏代码
```

**4. 手动搜索分离的 DOM**
```js
// DevTools Console
const detached = document.querySelectorAll(':scope > *');
console.log('Detached elements:', detached.length);
```

**修复方法：**
```js
// 1. 清除定时器
component.unmount = () => {
  clearInterval(timer);
  timer = null;
};

// 2. 移除事件监听
element.removeEventListener('click', handler);

// 3. 销毁引用
component.data = null;

// 4. 清理 DOM
container.innerHTML = '';
```

**知识点：** `内存检测` `泄漏修复` `DevTools`

:::

---

### Q8: Buffers 和 Typed Arrays 对内存的影响

> **🔥 中等 · JavaScript**

```js
// ArrayBuffer 示例
const buffer = new ArrayBuffer(1024);
const view = new Uint8Array(buffer);

// buffer 多大？如何影响内存？
```

请解释 Typed Arrays 的内存特点。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**Typed Arrays 特点：**
1. **固定大小**：创建后不能改变
2. **连续内存**：存储在 ArrayBuffer 中
3. **二进制数据**：适合处理音频、图片等
4. **高效访问**：比普通数组快

**内存占用：**
```js
new Uint8Array(1000)   // 1000 字节
new Uint16Array(1000)  // 2000 字节
new Float64Array(1000) // 8000 字节
```

**使用场景：**
```js
// 图片处理
const imageData = ctx.getImageData(0, 0, w, h);
const pixels = imageData.data;  // Uint8ClampedArray

// WebSocket 二进制数据
ws.onmessage = (e) => {
  const data = new Uint8Array(e.data);
};

// 文件读取
const reader = new FileReader();
reader.onload = (e) => {
  const buffer = e.target.result;  // ArrayBuffer
};
```

**GC 注意事项：**
- TypedArray 本身是引用
- 如果只使用部分数据，考虑 slice() 复制
- 大 buffer 用完及时释放引用

**知识点：** `TypedArray` `ArrayBuffer` `内存占用`

:::

---

## 🔑 核心知识点总结

### 1. V8 垃圾回收

| 代 | 对象类型 | 算法 | 频率 |
|----|---------|------|------|
| 新生代 | 短生命周期 | Scavenge | 频繁 |
| 老生代 | 长生命周期 | Mark-Compact | 较少 |

### 2. 内存泄漏场景

1. 全局变量
2. 遗忘的定时器
3. 闭包引用
4. 分离的 DOM
5. 事件监听器

### 3. 分析工具

- Performance Monitor
- Heap Snapshot
- Allocation instrumentation
- Memory 面板对比

### 4. WeakMap 用途

- 私有数据
- DOM 关联
- 自动清理缓存

## 💡 面试技巧

1. **V8 回收**：知道新生代/老生代区分
2. **泄漏场景**：能举出 4-5 个例子
3. **DevTools**：知道基本操作步骤
4. **WeakMap**：理解弱引用的好处
5. **性能优化**：知道如何避免泄漏
---

### Q9: V8 引擎的垃圾回收机制是怎样的？

> **💀 困难 · JavaScript**

请说明 V8 的垃圾回收机制。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**V8 垃圾回收采用分代回收策略**，将对象分为新生代和老生代。

**内存分代：**
```
新生代（New Space）  - 约 1-8MB，存放新对象
老生代（Old Space）  - 存放长期存活的对象
大对象区（Large Object Space） - 大字符串/对象直接分配
```

**新生代回收（Scavenge 算法）：**
```
采用 Cheney 算法，将空间分为 From 和 To 两个区域
1. 遍历 From 空间的存活对象
2. 复制到 To 空间
3. 清空 From 空间
4. 交换 From 和 To

对象晋升条件：
- 经历一次 Scavenge 后依然存活
- To 空间使用率超过 25%（防止浪费）
```

**老生代回收（Mark-Sweep + Mark-Compact）：**
```js
// Mark-Sweep（标记清除）
// 1. 标记所有可达对象
// 2. 清除未标记对象
// 3. 缺点：内存碎片

// Mark-Compact（标记整理）
// 1. 标记所有可达对象
// 2. 将存活对象向一端移动
// 3. 清理边界外的内存
// 4. 优点：无碎片

// V8 采用两者结合
```

**增量标记（减少停顿）：**
```js
// 传统：一次性标记所有对象（长停顿）
// 增量：分片标记，与 JS 执行交替进行

标记过程：
1. 初始标记（STW，短停顿）
2. 并发标记（与 JS 并行）
3. 重新标记（STW，处理并发期间的变化）
4. 并发清除
```

**触发时机：**
- 新生代空间不足
- 老生代达到阈值
- 主动调用 gc（需要 --expose-gc）

**优化技巧：**
```js
// 避免内存泄漏
let data = loadData();
process(data);
data = null;  // 手动解除引用

// 避免大对象
const largeArray = new Array(1000000);  // 可能进入大对象区

// 使用 Map 替代对象存储动态键
const map = new Map();  // 比对象更高效
```

**知识点：** `V8 垃圾回收``分代回收` `Scavenge` `Mark-Sweep` `增量标记`

:::

---

### Q10: 闭包变量在内存中如何存储？何时被回收？

> **🔥 中等 · JavaScript**

请说明闭包的内存管理机制。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**闭包变量的存储：**
闭包变量存储在堆内存中，而不是栈内存。

```js
function createCounter() {
  let count = 0;  // 存储在堆中
  
  return function() {
    count++;  // 闭包引用堆中的 count
    return count;
  };
}

const counter = createCounter();
// createCounter 执行完毕，但 count 没有被回收
// 因为返回的函数仍然引用它
```

**回收时机：**
```js
// 1. 闭包不再被引用
let handler = createHandler();
handler = null;  // 闭包变量可被回收

// 2. 闭包不再需要某个变量
function factory() {
  const bigData = new Array(1000000);
  const smallData = 42;
  
  return function() {
    return smallData;  // 只引用 smallData
  };  // bigData 可被回收（V8 优化）
}

// 3. 显式解除引用
let closure;
function setup() {
  let data = loadBigData();
  closure = () => data;
}
setup();
closure = null;  // data 可被回收
```

**V8 的闭包优化：**
```js
// 1. 逃逸分析
function outer() {
  let x = 1;
  let y = 2;
  
  return function() {
    return x;  // y 不会被捕获
  };  // y 可能被优化掉
}

// 2. 作用域链扁平化
function outer() {
  let a = 1, b = 2, c = 3;
  
  return {
    getA: () => a,  // 只捕获 a
    getB: () => b   // 只捕获 b
  };  // c 不会被捕获
}
```

**内存泄漏场景：**
```js
// 1. 意外的全局变量
function leak() {
  clickedVar = true;  // 全局变量
}

// 2. 定时器未清理
let data;
function start() {
  data = loadData();
  setInterval(() => {
    console.log(data.length);  // data 无法回收
  }, 1000);
}

// 3. DOM 引用
function setup() {
  const el = document.getElementById('big');
  el.onclick = () => {
    console.log(el.innerHTML);  // el 被引用
  };
}
```

**知识点：** `闭包内存` `垃圾回收` `作用域链` `内存泄漏`

:::

---

### Q11: WeakRef 和 FinalizationRegistry 是什么？有什么用途？

> **💀 困难 · JavaScript**

请说明 ES2021 新增的弱引用 API。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**WeakRef（弱引用）：**
持有对象的弱引用，不阻止垃圾回收。

```js
const obj = { name: 'Alice' };
const weakRef = new WeakRef(obj);

// 获取对象（可能为 undefined）
const value = weakRef.deref();
if (value) {
  console.log(value.name);  // 对象还存在
} else {
  console.log('对象已被回收');
}

// 强引用释放后
let strongRef = obj;
strongRef = null;
// 下次 GC 时，obj 可能被回收
// weakRef.deref() 返回 undefined
```

**FinalizationRegistry（终结器注册）：**
监听对象被垃圾回收的事件。

```js
const registry = new FinalizationRegistry(heldValue => {
  console.log(`对象被回收：${heldValue}`);
});

const obj = { name: 'Alice' };

// 注册对象
registry.register(obj, 'user-Alice');

// 注册时传入清理回调
registry.register(
  { data: 'temp' },  // 目标对象
  'temp-data',       // 回收时的值
  obj                // 取消注册时的 token（可选）
);

// 取消注册
registry.unregister(obj);

// 当 obj 被回收时，回调被调用（异步）
```

**使用场景：**

**1. 缓存（不阻止 GC）：**
```js
const cache = new Map();
const refs = new WeakMap();

function cached(key, value) {
  const ref = new WeakRef(value);
  cache.set(key, ref);
  
  // 注册清理
  registry.register(value, key, ref);
}

function get(key) {
  const ref = cache.get(key);
  if (ref) {
    const value = ref.deref();
    if (value) return value;
    cache.delete(key);  // 清理缓存
  }
}
```

**2. DOM 元素关联：**
```js
const elementData = new FinalizationRegistry(id => {
  console.log(`元素 ${id} 已清理`);
  // 清理关联数据
});

function associate(element, data) {
  const weak = new WeakRef(element);
  elementDataMap.set(element, data);
  elementData.register(element, element.id);
}
```

**注意事项：**
- 回调执行时间不确定
- 不应依赖回调做关键逻辑
- 可能影响性能，谨慎使用

**知识点：** `WeakRef` `FinalizationRegistry` `弱引用` `垃圾回收通知`

:::

---

### Q12: 常见的内存泄漏场景有哪些？

> **🔥 中等 · JavaScript**

请列举并说明常见的内存泄漏场景。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. 全局变量：**
```js
// 忘记声明
function fn() {
  leaked = 'value';  // 变成全局变量
}

// 显式全局
window.data = largeData;  // 页面关闭前不会释放
```

**2. 定时器未清理：**
```js
function startTimer() {
  const data = loadBigData();
  setInterval(() => {
    console.log(data);  // data 无法回收
  }, 1000);
}

// 解决
let timerId;
function startTimer() {
  const data = loadBigData();
  timerId = setInterval(() => {
    console.log(data);
  }, 1000);
}
function stopTimer() {
  clearInterval(timerId);
}
```

**3. 闭包引用大对象：**
```js
function createHandler() {
  const bigData = new Array(1000000).fill('x');
  return function() {
    console.log('clicked');  // 实际不需要 bigData
  };  // 但 bigData 被闭包持有
}
```

**4. DOM 引用未清理：**
```js
//删除元素但保留引用
const elements = [];
function add() {
  const el = document.createElement('div');
  elements.push(el);  // 即使从 DOM 移除也无法回收
  document.body.appendChild(el);
}
function remove() {
  document.body.innerHTML = '';  // DOM 删除了
  // 但 elements 数组仍持有引用
}
```

**5. 事件监听器未移除：**
```js
class Component {
  constructor() {
    this.data = loadData();
    window.addEventListener('scroll', this.onScroll);
  }
  
  onScroll = () => {
    console.log(this.data);  // data 被持有
  };
  
  destroy() {
    // 忘记移除监听器
    // window.removeEventListener('scroll', this.onScroll);
  }
}
```

**6. React 中的泄漏：**
```js
// 忘记清理副作用
function Component() {
  useEffect(() => {
    const timer = setInterval(() => {}, 1000);
    // return () => clearInterval(timer);
  }, []);
}

// 订阅未取消
useEffect(() => {
  const subscription = store.subscribe(update);
  return () => subscription.unsubscribe();
}, []);
```

**检测工具：**
- Chrome DevTools Memory 面板
- Performance Monitor
- Heap Snapshot 对比

**知识点：** `内存泄漏` `定时器` `闭包` `事件监听器` `DOM 引用`

:::
