---
title: 模块化
description: CJS vs ESM 差异、tree-shaking 原理、UMD、动态 import、模块循环依赖、Worker 线程通信等核心面试题
---

# 模块化

模块化是现代 JavaScript 开发的基石。理解不同模块系统的原理和差异对于编写可维护的代码至关重要。

---

## 📝 题目

### Q1: CommonJS 和 ES Module 有什么主要区别？

> **🔥 中等 · JavaScript**

请列举 CommonJS 和 ES Module 的 6 点主要差异。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

| 特性 | CommonJS | ES Module |
|------|---------|----------|
| 语法 | require/module.exports | import/export |
| 加载时机 | 运行时加载 | 编译时静态分析 |
| this 指向 | 当前模块对象 | undefined |
| 导出方式 | module.exports | export default/named |
| 循环依赖 | 返回不完整导出 | 返回 live binding |
| tree-shaking | 不支持 | 支持 |

**示例对比：**
```js
// CommonJS
const mod = require('./module');
module.exports = { a: 1 };

// ES Module
import mod from './module.js';
export const a = 1;
```

**知识点：** `CJS` `ESM` `模块语法`

:::

---

### Q2: 什么是 tree-shaking？原理是什么？

> **🔥 中等 · JavaScript**

请解释 tree-shaking 的原理，以及为什么 CommonJS 不支持。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**tree-shaking：** 移除未使用代码的优化技术。

**原理：**
1. **静态分析**：ESM 的 import/export 是静态的
2. **构建时分析**：Rollup/Vite 分析 AST
3. **标记未使用**：识别未导出的代码
4. **删除死代码**：打包时移除

**示例：**
```js
// utils.js
export function used() { return 1; }
export function unused() { return 2; }

// main.js
import { used } from './utils.js';
console.log(used());
// unused 函数被 tree-shake 掉
```

**CJS 不支持原因：**
```js
// 动态导出，无法静态分析
if (condition) {
  module.exports = require('./a');
} else {
  module.exports = require('./b');
}
```

**知识点：** `tree-shaking` `静态分析` `优化`

:::

---

### Q3: ES Module 的动态 import 是什么？

> **⭐ 简单 · JavaScript**

```js
// 动态导入
const module = await import('./module.js');

// 与静态导入的区别
import './module.js';
```

动态 import 有什么用途？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**特点：**
1. 返回 Promise
2. 可以动态计算路径
3. 支持代码分割/懒加载
4. 条件加载

**使用场景：**

**1. 路由懒加载：**
```js
const routes = {
  home: () => import('./pages/Home.vue'),
  about: () => import('./pages/About.vue')
};
```

**2. 条件加载：**
```js
if (supportsFeature()) {
  import('./feature.js').then(m => m.init());
}
```

**3. 大文件分割：**
```js
button.onclick = async () => {
  const { heavyFunction } = await import('./heavy.js');
  heavyFunction();
};
```

**知识点：** `动态 import` `代码分割` `懒加载`

:::

---

### Q4: UMD 是什么？如何编写 UMD 模块？

> **🔥 中等 · JavaScript**

请解释 UMD 的原理，并编写一个 UMD 模块模板。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**UMD（Universal Module Definition）：** 兼容 CommonJS、AMD 和全局变量的模块格式。

**UMD 模板：**
```js
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['exports'], factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    factory(exports);
  } else {
    // 全局变量
    factory((root.MyModule = {}));
  }
}(typeof self !== 'undefined' ? self : this, function(exports) {
  // 模块代码
  exports.hello = function() {
    console.log('Hello!');
  };
  exports.version = '1.0.0';
}));
```

**使用方式：**
```js
// AMD
define(['MyModule'], m => m.hello());

// CommonJS
const m = require('MyModule');
m.hello();

// 全局
MyModule.hello();
```

**知识点：** `UMD` `模块兼容` `多环境`

:::

---

### Q5: 模块循环依赖如何处理？

> **💀 困难 · JavaScript**

```js
// a.js
import { b } from './b.js';
export const a = 'a';
console.log('a loaded, b =', b);

// b.js
import { a } from './a.js';
export const b = 'b';
console.log('b loaded, a =', a);
```

输出是什么？如何避免循环依赖？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**输出：**
```
a loaded, b = undefined
b loaded, a = a
```

**💡 解析：**
**ESM 循环依赖：**
- ESM 导出的是值的「引用」（live binding）
- 模块 a 加载时，b 还未执行，b 为 undefined
- 模块 b 执行后，a 已有值

**避免循环依赖：**
```js
// 方式 1：重构消除依赖
// common.js
export const shared = {};

// a.js
import { shared } from './common.js';

// b.js  
import { shared } from './common.js';

// 方式 2：函数延迟调用
// a.js
export function getB() { return b; }

// 方式 3：模块初始化函数
export function init() { /* ... */ }
```

**知识点：** `循环依赖` `live binding` `模块顺序`

:::

---

### Q6: Worker 线程如何通信？

> **🔥 中等 · JavaScript**

请说明主线程和 Worker 线程的通信方式。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**通信方式：postMessage**

**主线程：**
```js
const worker = new Worker('worker.js');

worker.postMessage({ type: 'start', data: 42 });

worker.onmessage = (e) => {
  console.log('From worker:', e.data);
};

worker.onerror = (e) => {
  console.error('Error:', e.message);
};
```

**Worker 线程：**
```js
// worker.js
self.onmessage = (e) => {
  if (e.data.type === 'start') {
    const result = compute(e.data.data);
    self.postMessage({ type: 'result', value: result });
  }
};

function compute(n) { return n * 2; }
```

**结构化数据：**
```js
// 可以传输的对象
const data = {
  number: 123,
  string: 'hello',
  array: [1, 2, 3],
  object: { nested: true },
  typedArray: new Uint8Array([1, 2, 3])
};
// 不能传输：函数、DOM、原型链
```

**知识点：** `Worker` `postMessage` `线程通信`

:::

---

### Q7: ES Module 的 export 和 export default 有何区别？

> **⭐ 简单 · JavaScript**

```js
// 命名导出
export const a = 1;
export function fn() {}

// 默认导出
export default function() {}

// 导入方式
import a, { fn } from './module.js';
```

有什么区别？

::: details 🔍 点击查看答案与解析

**✅ 答案：**

**| 特性 | export | export default |**
|------|--------|---------------|
| 数量 | 多个 | 每文件一个 |
| 导入 | 需要 {} | 不需要 {} |
| 重命名 | 导入时需指定 | 导入时可任意命名 |
| 用途 | 工具函数集合 | 单个组件/类 |

**示例：**
```js
// 命名导入
import { a, fn as fn2 } from './module.js';

// 默认导入
import DefaultComp from './module.js';

// 混合导入
import Default, { named } from './module.js';

// 全部导入
import * as Module from './module.js';
```

**知识点：** `export` `export default` `导入语法`

:::

---

### Q8: 如何实现模块的动态加载？

> **🔥 中等 · JavaScript**

请实现一个支持动态加载的模块系统。

::: details 🔍 点击查看答案与解析

**✅ 答案：**

```js
// 模块加载器
class ModuleLoader {
  constructor() {
    this.cache = new Map();
  }
  
  async load(url) {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }
    
    const response = await fetch(url);
    const code = await response.text();
    
    // 简单实现：用 Function 构造器
    const module = {};
    const exports = {};
    
    const fn = new Function('exports', 'module', 'require', code);
    fn(exports, module, this.load.bind(this));
    
    const result = module.exports || exports;
    this.cache.set(url, result);
    return result;
  }
}

// 使用示例
const loader = new ModuleLoader();
const mod = await loader.load('./module.js');
```

**知识点：** `动态加载` `模块解析` `缓存`

:::

---

### Q9: ESM 和 CommonJS 的本质区别有哪些？

> **🔥 中等 · JavaScript**

请从编译时/运行时、引用/拷贝、tree shaking 等角度分析 ESM 和 CommonJS 的本质区别。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**ESM 和 CommonJS 的本质区别：**

**1. 加载时机：编译时 vs 运行时**
```js
// ESM - 编译时静态分析
import { a } from './module.js'; // 解析阶段就确定依赖

// CommonJS - 运行时动态加载
const a = require('./module'); // 代码执行时才加载
```

**2. 值的传递：引用 vs 拷贝**
```js
// ESM - live binding（实时绑定/引用）
// counter.js
export let count = 0;
export function increment() { count++; }

// main.js
import { count, increment } from './counter.js';
console.log(count); // 0
increment();
console.log(count); // 1（值会变，是引用）

// CommonJS - 值的拷贝
// counter.js
let count = 0;
module.exports = { count, increment: () => count++ };

// main.js
const { count, increment } = require('./counter');
console.log(count); // 0
increment();
console.log(count); // 0（是拷贝，不变）
```

**3. tree-shaking 支持**
- ESM：静态结构允许构建工具分析未使用代码
- CommonJS：动态 require 无法静态分析，不支持 tree-shaking

**4. this 指向**
- ESM：顶层 this 是 undefined
- CommonJS：顶层 this 指向 module.exports

**5. 循环依赖处理**
- ESM：返回未完全初始化的值（undefined）
- CommonJS：返回不完整的 exports 对象

**6. 文件扩展名**
- ESM：必须是 .mjs 或 package.json 中 type: "module"
- CommonJS：默认 .js 或 .cjs

**知识点：** `ESM` `CommonJS` `模块系统` `引用传递` `编译时分析`

:::

---

### Q10: 什么是 Tree Shaking？为什么 CommonJS 不支持？

> **🔥 中等 · JavaScript**

请解释 Tree Shaking 的原理，并说明为什么 CommonJS 模块无法进行 Tree Shaking。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Tree Shaking 定义：**

Tree Shaking 是一种构建优化工语，指在打包过程中移除未使用的代码（dead code），像摇树一样把枯叶（无用代码）摇掉。

**工作原理：**

```js
// utils.js
export function used() { return 'used'; }
export function unused() { return 'unused'; }
export const PI = 3.14159;

// main.js
import { used } from './utils.js';
console.log(used());

// 打包后只包含 used 函数，unused 和 PI 被移除
```

**实现步骤：**
1. **静态分析**：解析 ESM 的 import/export 语法
2. **构建依赖图**：标记所有被引用的导出
3. **识别死代码**：找出未被引用的导出
4. **移除未使用**：打包时排除这些代码

**为什么 CommonJS 不支持？**

```js
// CommonJS 动态性导致无法静态分析

// 1. 动态 require 路径
const module = condition ? require('./a') : require('./b');

// 2. 动态属性访问
const utils = require('./utils');
const func = utils[someVariable]; // 无法确定使用哪个

// 3. 条件导出
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./prod');
} else {
  module.exports = require('./dev');
}

// 4. 修改 exports 对象
const obj = require('./module');
obj.newProp = 'added'; // 运行时修改
```

**ESM 支持 Tree Shaking 的原因：**
- import/export 是静态语法，在代码执行前就能分析
- 导出是命名式的，可以精确追踪每个 exports 的使用
- 不允许动态修改导出内容

**实际应用：**
```js
// 正确：支持 tree-shaking
import { debounce } from 'lodash-es';

// 错误：会导入整个 lodash
import _ from 'lodash';
```

**知识点：** `Tree Shaking` `死代码消除` `静态分析` `构建优化`

:::

---

### Q11: 动态 import() 的原理和使用场景？

> **🔥 中等 · JavaScript**

请解释动态 import() 的返回结果、执行时机，以及常见使用场景。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**动态 import() 原理：**

动态 import() 是一个函数形式的导入语法，返回一个 Promise，解析为模块的命名空间对象。

```js
// 基本用法
import('./module.js')
  .then(module => {
    console.log(module.default);
    console.log(module.namedExport);
  });

// async/await
const module = await import('./module.js');
```

**返回结果：**
```js
// module.js
export default class User {}
export const VERSION = '1.0';
export function init() {}

// 动态导入后
const mod = await import('./module.js');
// mod = { default: User, VERSION: '1.0', init: init }
```

**与静态 import 的区别：**

| 特性 | 静态 import | 动态 import() |
|------|-----------|-------------|
| 语法位置 | 必须顶层 | 任意位置 |
| 返回类型 | 静态绑定 | Promise |
| 执行时机 | 模块加载时 | 运行时调用 |
| 路径要求 | 字符串字面量 | 可以是表达式 |
| tree-shaking | 支持 | 代码分割点 |

**使用场景：**

**1. 路由懒加载（最常用）**
```js
// Vue Router
const routes = [
  {
    path: '/home',
    component: () => import('./pages/Home.vue')
  },
  {
    path: '/about',
    component: () => import('./pages/About.vue')
  }
];

// React Router
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
```

**2. 条件加载**
```js
// 按需加载功能
if (userPermission === 'admin') {
  const adminModule = await import('./admin.js');
  adminModule.init();
}

// 功能开关
if (featureFlags.newFeature) {
  const newFeature = await import('./newFeature.js');
  newFeature.enable();
}
```

**3. 大文件分割**
```js
// 初始不加载重型库
button.addEventListener('click', async () => {
  const { processImage } = await import('./imageProcessor.js');
  await processImage(file);
});
```

**4. 国际化懒加载**
```js
// 按需加载语言包
async function loadLocale(locale) {
  const messages = await import(`./locales/${locale}.js`);
  return messages.default;
}

loadLocale('zh-CN').then(msgs => {
  // 使用中文包
});
```

**5. 插件系统**
```js
// 动态加载插件
const plugins = ['plugin1', 'plugin2', 'plugin3'];
for (const name of plugins) {
  const plugin = await import(`./plugins/${name}.js`);
  registerPlugin(plugin.default);
}
```

**知识点：** `动态 import` `代码分割` `懒加载` `Promise` `路由优化`

:::

---

### Q12: AMD、CMD、UMD 有了解吗？为什么被淘汰了？

> **🔥 中等 · JavaScript**

请解释 AMD、CMD、UMD 模块规范的区别，并说明为什么它们逐渐被淘汰。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**三大模块规范对比：**

| 特性 | AMD | CMD | UMD |
|------|-----|-----|-----|
| 全称 | Asynchronous Module Definition | Common Module Definition | Universal Module Definition |
| 推出者 | RequireJS | SeaJS | 社区标准 |
| 依赖声明 | 前置声明 | 就近依赖 | 兼容多格式 |
| 加载时机 | 依赖提前加载 | 依赖按需加载 | 取决于目标格式 |
| 使用场景 | 浏览器端 | 浏览器端 | 多环境兼容 |

**AMD（RequireJS）：**
```js
define(['jquery', './module'], function($, module) {
  // 依赖提前声明，提前加载
  return {
    init: function() {
      $.ajax({ /* ... */ });
      module.doSomething();
    }
  };
});
```

**CMD（SeaJS）：**
```js
define(function(require, exports, module) {
  // 就近依赖，按需加载
  var $ = require('jquery');
  var module = require('./module');
  
  module.init();
});
```

**UMD（通用模块定义）：**
```js
(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['exports'], factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    factory(exports);
  } else {
    // 全局变量
    factory((root.MyLib = {}));
  }
}(this, function(exports) {
  exports.version = '1.0.0';
}));
```

**为什么被淘汰？**

**1. ESM 成为官方标准**
- 2015 年 ES6 正式发布 import/export 语法
- 浏览器原生支持，无需额外加载器
- 语言级别的标准化

**2. 工具链生态转变**
```js
// ESM 原生支持
import React from 'react';
import { debounce } from 'lodash-es';

// 构建工具原生支持
// Vite、Rollup、Webpack 都优先支持 ESM
```

**3. Tree Shaking 需求**
- AMD/CMD 无法进行 Tree Shaking
- ESM 静态分析支持体积优化
- 现代应用对包体积敏感

**4. 同步/异步统一**
- AMD/CMD 区分浏览器异步和 Node 同步
- ESM 统一语法，浏览器和 Node 都支持
- 简化开发心智负担

**5. 动态 import() 补充**
- ESM 通过 import() 实现按需加载
- 兼顾了 AMD/CMD 的优势
- 基于 Promise，更符合现代 JS

**现状：**
- **AMD**：基本淘汰，仅在老项目使用
- **CMD**：阿里系项目仍在使用，新项目很少
- **UMD**：作为发布兼容性包的过渡方案

**知识点：** `AMD` `CMD` `UMD` `模块历史` `ESM 标准`

:::

---

## 🔑 核心知识点总结

### 1. 模块系统对比

| 特性 | CJS | AMD | ESM |
|------|-----|-----|-----|
| 环境 | Node.js | 浏览器 | 现代 |
| 加载 | 同步 | 异步 | 静态 |
| 语法 | require | define | import |

### 2. 导入导出

```js
// 导出
export const a = 1;
export default fn;
export { a, b as c };

// 导入
import { a } from './mod.js';
import def from './mod.js';
import * as all from './mod.js';
```

### 3. 最佳实践

1. 使用 ESM（现代项目）
2. 避免循环依赖
3. 动态 import 用于懒加载
4. tree-shaking 优化体积

## 💡 面试技巧

1. **ESM vs CJS**：6 点差异要背熟
2. **tree-shaking**：知道原理和限制
3. **循环依赖**：了解问题和解决方案
4. **动态导入**：代码分割场景
5. **Worker**：线程通信方式