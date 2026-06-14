---
title: 微前端
description: qiankun、Module Federation、微前端架构面试题
---

# 微前端

## 面试题

### Q1: 微前端解决了什么问题？

> **⭐ 简单 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

微前端解决的问题：

1. **巨石应用**：项目越来越大，构建部署缓慢
2. **技术栈绑架**：无法渐进式升级技术栈
3. **独立开发部署**：团队协同困难，牵一发动全身
4. **代码量膨胀**：单应用超过百万行难以维护

微前端核心理念：

| 特性 | 说明 |
|------|------|
| 技术栈无关 | 各子应用可选不同框架 |
| 独立开发 | 各团队独立开发测试 |
| 独立部署 | 子应用可独立发布 |
| 增量迁移 | 老系统逐步替换 |
| 独立运行时 | 样式/JS 沙箱隔离 |

**知识点：** `微前端` `巨石应用` `独立部署` `增量迁移`

:::

### Q2: qiankun 的核心原理是什么？

> **💀 困难 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

qiankun 基于 single-spa 封装，核心三大能力：

**1. HTML Entry：**
```
获取子应用 HTML → 解析出 JS/CSS → 执行 JS → 渲染到容器
```

**2. JS 沙箱（3种）：**

| 沙箱类型 | 原理 | 适用场景 |
|---------|------|----------|
| proxySandbox | Proxy 代理 window | 多实例(推荐) |
| legacySandbox | diff patch window | 单实例 |
| snapshotSandbox | 快照对比 | 不支持 Proxy |

**3. CSS 隔离：**
- strictStyleIsolation: Shadow DOM
- experimentalStyleIsolation: 运行时 scope 前缀

```js
import { registerMicroApps, start } from 'qiankun'

registerMicroApps([{
  name: 'sub-app',
  entry: '//localhost:8081',
  container: '#sub-container',
  activeRule: '/sub',
  props: { token: 'xxx' }  // 传递数据
}])

start({ prefetch: 'all', sandbox: { strictStyleIsolation: true } })
```

**知识点：** `qiankun` `HTML Entry` `JS沙箱` `CSS隔离` `single-spa`

:::

### Q3: qiankun 三种 JS 沙箱原理分别是什么？

> **💀 困难 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. ProxySandbox（推荐）：**

```js
class ProxySandbox {
  constructor() {
    const fakeWindow = Object.create(null)
    this.proxy = new Proxy(window, {
      get(target, key) {
        // 优先从 fakeWindow 取，不存在则取真实 window
        return key in fakeWindow ? fakeWindow[key] : target[key]
      },
      set(target, key, value) {
        // 只写入 fakeWindow，不污染真实 window
        fakeWindow[key] = value
        return true
      }
    })
  }
}
// 多实例互不影响，最安全
```

**2. LegacySandbox：**
- 操作真实 window，但记录修改（新增/更新/删除三份记录）
- 卸载时按记录恢复 window 属性
- 只能单实例运行

**3. SnapshotSandbox：**
- 激活时遍历 window 拍摄快照
- 卸载时 diff 当前 window 与快照，恢复变更
- 兼容不支持 Proxy 的浏览器（IE11）
- 性能较差（全量遍历对比）

| 沙箱 | 性能 | 多实例 | 兼容性 |
|------|------|--------|--------|
| ProxySandbox | 最好 | 支持 | 不支持 IE |
| LegacySandbox | 好 | 不支持 | 不支持 IE |
| SnapshotSandbox | 差 | 不支持 | 全兼容 |

**知识点：** `JS沙箱` `proxySandbox` `legacySandbox` `snapshotSandbox` `Proxy`

:::

### Q4: CSS 隔离有哪些方案？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 方案 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| Shadow DOM | 浏览器原生隔离 | 完全隔离 | 弹窗层级问题 |
| Scoped CSS | 添加属性选择器前缀 | 兼容好 | 全局样式仍可能影响 |
| CSS Modules | 编译时 hash 类名 | 零运行时 | 需构建工具 |
| CSS-in-JS | 运行时生成唯一类名 | 灵活 | 运行时开销 |
| 运行时前缀 | qiankun 实验性方案 | 兼容好 | 性能开销 |

```css
/* qiankun experimentalStyleIsolation 原理 */
/* 在子应用样式选择器前加前缀 */
div { color: red; }
/* 转换后 */
[data-qiankun="sub-app"] div { color: red; }
```

**推荐方案：** Shadow DOM 适合隔离要求高的场景，CSS Modules 适合大多数项目。

**知识点：** `CSS隔离` `Shadow DOM` `Scoped CSS` `CSS Modules` `CSS-in-JS`

:::

### Q5: Module Federation 的原理是什么？

> **💀 困难 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

Module Federation 允许运行时动态加载其他构建的模块：

```js
// 远程应用 - 暴露模块
new ModuleFederationPlugin({
  name: 'remote',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/components/Button',
    './utils': './src/utils'
  },
  shared: ['react', 'react-dom']
})

// 主应用 - 消费模块
new ModuleFederationPlugin({
  name: 'host',
  remotes: {
    remote: 'remote@http://cdn.com/remoteEntry.js'
  },
  shared: ['react', 'react-dom']
})
```

**加载流程：**
1. 主应用加载 remoteEntry.js（清单文件）
2. remoteEntry 注册可用模块映射
3. 运行时 `import('remote/Button')` 按需加载
4. shared 依赖版本协商，避免重复加载

**与 qiankun 区别：**

| 特性 | Module Federation | qiankun |
|------|------------------|---------|
| 共享粒度 | 模块级 | 应用级 |
| 沙箱 | 无 | 有 |
| 技术栈 | 需相同构建工具 | 无限制 |
| 适用场景 | 共享组件/库 | 独立子应用 |

**知识点：** `Module Federation` `模块共享` `运行时加载` `Webpack5`

:::

### Q6: 微前端的应用间通信方案有哪些？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. qiankun initGlobalState：**

```js
// 主应用
const { onGlobalStateChange, setGlobalState } = initGlobalState({
  user: 'admin',
  token: 'xxx'
})

// 子应用
export function mount(props) {
  props.onGlobalStateChange((state, prev) => {
    console.log('主应用状态变化:', state)
  })
  props.setGlobalState({ user: 'new' })
}
```

**2. CustomEvent：**

```js
// 发送
window.dispatchEvent(new CustomEvent('micro-msg', {
  detail: { type: 'update', data: {} }
}))

// 接收
window.addEventListener('micro-msg', (e) => {
  console.log(e.detail)
})
```

**3. URL/路由参数：** 通过路由传递参数

**4. Shared Worker：** 跨 tab 共享 Worker 通信

**5. localStorage + storage 事件：**

```js
// 写入
localStorage.setItem('micro-data', JSON.stringify(data))
// 监听
window.addEventListener('storage', (e) => {
  if (e.key === 'micro-data') console.log(e.newValue)
})
```

**选型：** 简单场景用 initGlobalState，跨框架用 CustomEvent。

**知识点：** `微前端通信` `initGlobalState` `CustomEvent` `状态共享`

:::

### Q7: 微前端如何注入权限？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**方案：主应用通过 props 传递权限信息**

```js
// 主应用
registerMicroApps([{
  name: 'sub-app',
  entry: '//localhost:8081',
  container: '#container',
  activeRule: '/sub',
  props: {
    userInfo: { name: 'admin', role: 'admin' },
    permissions: ['read', 'write', 'delete'],
    token: localStorage.getItem('token')
  }
}])

// 子应用
export function mount(props) {
  const { userInfo, permissions, token } = props
  // 1. 根据权限渲染菜单
  // 2. 请求头注入 token
  // 3. 按钮级权限控制
}
```

**架构原则：**
- 认证（登录）在主应用完成
- 权限数据通过 props 下发给子应用
- 子应用自行决定如何使用权限
- Token 过期由主应用统一处理刷新

**知识点：** `微前端权限` `权限注入` `Token` `RBAC`

:::

### Q8: iframe 作为微前端方案的优劣是什么？

> **⭐ 简单 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**优点：**
- 天然 CSS/JS 完全隔离
- 最简单的集成方式
- 无需框架支持

**缺点：**
- 性能差（每个 iframe 独立进程）
- URL 不同步
- 弹窗/下拉定位错乱
- 通信麻烦（postMessage）
- SEO 不友好
- 前进后退导航困难
- 全局上下文隔离（cookie/localStorage）

**适用场景：**
- 完全独立的第三方系统嵌入
- 对隔离要求极高、交互要求低的场景

**不适用：** 需要深度交互、共享状态的场景

**知识点：** `iframe` `微前端方案` `隔离` `通信`

:::

### Q9: 微前端性能如何优化？

> **💀 困难 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

1. **预加载**：空闲时预加载子应用资源

```js
import { prefetchApps } from 'qiankun'
prefetchApps([{ name: 'sub', entry: '//cdn/sub' }])
```

2. **公共依赖抽取**：shared 避免重复加载

```js
// Module Federation
shared: { react: { singleton: true }, 'react-dom': { singleton: true } }
```

3. **路由级按需加载**：只加载当前路由的子应用

4. **资源缓存**：CDN + 长期缓存 + content hash

5. **骨架屏**：子应用加载时展示骨架占位

6. **样式裁剪**：只加载当前页面需要的 CSS

7. **子应用保活**：KeepAlive 缓存已加载的子应用

8. **共享运行时**：React/Vue 只加载一次

**知识点：** `微前端性能` `预加载` `公共依赖` `缓存` `KeepAlive`

:::

### Q10: qiankun Entry 路由加载的完整流程是什么？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 1. 注册子应用
registerMicroApps([{
  name: 'sub-app',
  entry: '//localhost:8081',
  container: '#container',
  activeRule: '/sub-app'
}])

// 2. 启动
start({ prefetch: 'all' })
```

**HTML Entry 加载流程：**

```
1. fetch(entry) 获取子应用 HTML 文本
2. 解析 HTML，提取 <script> 和 <link> 标签
3. 创建沙箱环境
4. 按顺序执行 JS 脚本（在沙箱中）
5. 调用子应用的 bootstrap → mount 生命周期
6. 将子应用 DOM 渲染到 container 中
```

**路由匹配：**
- browser 路由：URL pathname 匹配 activeRule
- hash 路由：hash 部分匹配
- 函数：自定义匹配逻辑

**卸载流程：** 路由离开 → 调用 unmount → 清除沙箱 → 清除 DOM

**知识点：** `qiankun` `HTML Entry` `路由加载` `生命周期`

:::
### Q11: 微前端为什么要用？解决什么问题？

> **🔥 中等 · 微前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**微前端解决的问题：**

| 问题 | 说明 |
|------|------|
| 巨石应用 | 单一仓库代码量巨大，构建慢、维护难 |
| 技术栈老旧 | 老项目升级困难，新技术无法引入 |
| 团队协作 | 多团队并行开发，代码冲突频繁 |
| 独立部署 | 全量发布风险高，无法局部更新 |
| 代码复用 | 公共模块重复开发，无法跨应用共享 |

**微前端核心价值：**

- **技术栈无关** — 各子应用可独立选择技术栈
- **独立开发** — 各团队独立仓库、独立开发
- **独立部署** — 子应用可单独发布，不影响其他
- **独立运行** — 子应用之间运行时隔离，互不影响

**什么时候需要微前端？**

```text
✅ 适合微前端：
- 多个团队维护一个大型应用
- 技术栈需要渐进式升级（如 Vue2 → Vue3）
- 不同模块发布频率差异大
- 需要集成第三方应用

❌ 不适合微前端：
- 小型项目（增加了复杂度）
- 团队规模小（维护成本 > 收益）
- 技术栈完全统一（用 monorepo 更好）
- 子应用之间高度耦合
```

**知识点：** `微前端` `巨石应用` `技术栈无关` `独立部署`

:::

### Q12: qiankun 的实现原理是什么？

> **💀 困难 · 微前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**qiankun 基于 single-spa，核心三件事：HTML Entry、JS 沙箱、CSS 隔离**

**1. HTML Entry — 加载子应用**

```text
流程：
1. fetch 子应用的 HTML
2. 解析 HTML，提取 style 和 script
3. 创建 DOM 容器，插入 style
4. 执行 script（在沙箱中）
5. 调用子应用导出的生命周期
```

```js
// qiankun 配置
registerMicroApps([{
  name: 'sub-app',
  entry: '//localhost:3001',  // HTML Entry
  container: '#sub-container',
  activeRule: '/sub-app',
  props: { token: 'xxx' }   // 传参给子应用
}])
```

**2. JS 沙箱 — 三种实现**

```text
快照沙箱（SnapshotSandbox）：
  - 激活时保存 window 快照
  - 卸载时恢复快照
  - 缺点：污染全局 window，不支持多实例
  - 适用：不支持 Proxy 的浏览器

代理沙箱（LegacySandbox）：
  - 基于 Proxy 代理 window
  - 记录新增/修改/删除的属性
  - 卸载时恢复
  - 缺点：仍然操作真实 window，单实例

代理沙箱（ProxySandbox）：
  - 创建一个 fakeWindow 对象
  - 所有操作在 fakeWindow 上进行
  - 不污染真实 window ✅
  - 支持多实例同时运行 ✅
  - 推荐方式
```

**3. CSS 隔离 — 两种方案**

```text
严格隔离（strictStyleIsolation）：
  - 使用 Shadow DOM
  - 完全隔离，但弹窗/弹层可能出问题

实验性隔离（experimentalStyleIsolation）：
  - 给子应用 CSS 选择器加前缀
  - div.xxx → div[data-qiankun="app-name"].xxx
  - 兼容性好，但动态样式可能失效
```

**4. 生命周期**

```js
// 子应用需要导出三个生命周期
export async function bootstrap() { /* 初始化 */ }
export async function mount(props) { /* 挂载 */ }
export async function unmount() { /* 卸载 */ }
```

**知识点：** `qiankun` `single-spa` `HTML Entry` `JS沙箱` `ProxySandbox` `CSS隔离`

:::

### Q13: qiankun 和 Module Federation 的对比？各适合什么场景？

> **🔥 中等 · engineering/micro-frontend**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**qiankun vs Module Federation 核心对比：**

| 特性 | qiankun | Module Federation |
|------|---------|------------------|
| 基础 | single-spa + HTML Entry | Webpack 5 原生特性 |
| JS 沙箱 | ✅（Proxy/快照） | ❌ |
| CSS 隔离 | ✅（Shadow DOM/scope） | ❌ |
| 技术栈 | 无限制（Vue/React/Angular） | 需 Webpack 构建 |
| 共享粒度 | 应用级 | 模块/组件级 |
| 独立部署 | ✅ | ✅ |
| 子应用保活 | ❌（切换会卸载） | ✅（模块缓存） |
| 通信方式 | initGlobalState/CustomEvent | shared 状态/事件 |
| 接入成本 | 低（子应用改生命周期） | 中（需配置 Webpack） |

**qiankun 架构：**

```
主应用（qiankun）
  ├── 注册子应用（entry: URL）
  ├── 路由匹配 activeRule
  ├── 加载子应用 HTML
  ├── 创建沙箱环境
  ├── 执行子应用 JS
  └── 渲染到 container

子应用配置：
export async function bootstrap() { /* 初始化 */ }
export async function mount(props) { /* 挂载 */ }
export async function unmount() { /* 卸载 */ }
```

**Module Federation 架构：**

```
主应用（Host）
  ├── remotes: { remoteApp: 'remoteApp@https://...' }
  ├── 运行时加载 remoteEntry.js
  ├── 动态 import('remoteApp/Button')
  └── 共享依赖（react、react-dom）

远程应用（Remote）
  ├── exposes: { './Button': './src/Button' }
  ├── shared: { react: { singleton: true } }
  └── 构建输出 remoteEntry.js
```

**qiankun 适合场景：**

```text
✅ 适合 qiankun：
- 多技术栈共存（Vue2 + React18 + Angular）
- 需要强隔离（JS 沙箱 + CSS 隔离）
- 独立团队开发独立子应用
- 子应用有独立路由
- 需要应用级权限控制

示例：阿里内部、大型 SaaS 平台、企业后台系统
```

**Module Federation 适合场景：**

```text
✅ 适合 Module Federation：
- 统一技术栈（都是 React 或都是 Vue）
- 共享组件库/工具库
- 需要模块级共享（不是整个应用）
- 统一使用 Webpack 构建
- 需要运行时动态加载组件

示例：微组件架构、设计系统、跨团队组件共享
```

**组合使用方案：**

```javascript
// 主应用使用 qiankun 集成子应用
// 子应用内部使用 Module Federation 共享组件

// 主应用配置
registerMicroApps([{
  name: 'cart-app',
  entry: '//localhost:3001',
  container: '#cart',
  activeRule: '/cart'
}]);

// 子应用 cart-app 配置（Module Federation）
new ModuleFederationPlugin({
  name: 'cartApp',
  filename: 'remoteEntry.js',
  exposes: {
    './CartWidget': './src/CartWidget',
    './CartAPI': './src/api'
  },
  shared: { react: { singleton: true } }
});

// 其他子应用可以直接 import 共享组件
import CartWidget from 'cartApp/CartWidget';
```

**知识点：** `qiankun` `Module Federation` `微前端对比` `技术选型` `沙箱隔离` `模块共享`

:::

### Q14: 微前端的应用间通信方案有哪些？（CustomEvent、共享状态、URL 参数）

> **🔥 中等 · engineering/micro-frontend**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**微前端应用间通信方案：**

**1. qiankun initGlobalState（推荐）**

```javascript
// 主应用 - 初始化全局状态
import { initGlobalState } from 'qiankun';

const initialState = {
  user: { name: 'admin', id: '123' },
  token: 'xxx',
  theme: 'dark'
};

const actions = initGlobalState(initialState);

// 监听状态变化
actions.onGlobalStateChange((state, prev) => {
  console.log('状态变化:', state, prev);
}, true); // true 表示首次也触发

// 设置状态
actions.setGlobalState({ theme: 'light' });

// 子应用中使用
export function mount(props) {
  // props 包含 onGlobalStateChange、setGlobalState
  props.onGlobalStateChange((state) => {
    console.log('主应用状态:', state);
  });
  
  props.setGlobalState({ user: { name: 'new' } });
}
```

**2. CustomEvent（跨框架通用）**

```javascript
// 发送事件
window.dispatchEvent(new CustomEvent('micro-message', {
  detail: {
    type: 'user_login',
    data: { userId: '123', name: 'admin' }
  }
}));

// 接收事件
window.addEventListener('micro-message', (event) => {
  console.log('收到消息:', event.detail.type, event.detail.data);
});

// 移除监听
window.removeEventListener('micro-message', handler);

// 封装工具类
class MicroEventBus {
  static emit(type, data) {
    window.dispatchEvent(new CustomEvent(type, { detail: data }));
  }
  
  static on(type, handler) {
    window.addEventListener(type, handler);
    return () => window.removeEventListener(type, handler);
  }
}

// 使用
MicroEventBus.emit('cart_update', { count: 5 });
const off = MicroEventBus.on('cart_update', (data) => {
  console.log('购物车更新:', data.count);
});
```

**3. URL 参数/路由参数**

```javascript
// 主应用传递参数给子应用
registerMicroApps([{
  name: 'user-app',
  entry: '//localhost:3001',
  props: {
    userId: '123',
    token: localStorage.getItem('token')
  }
}]);

// 子应用接收
export function mount(props) {
  const { userId, token } = props;
  // 使用参数
}

// 通过 URL hash 传递
// 主应用：http://localhost/#/user?id=123&token=xxx
// 子应用：location.hash 解析参数
```

**4. localStorage + storage 事件**

```javascript
// 写入数据
localStorage.setItem('micro-data', JSON.stringify({
  key: 'value',
  timestamp: Date.now()
}));

// 监听数据变化（只能在其他标签页/窗口触发）
window.addEventListener('storage', (event) => {
  if (event.key === 'micro-data') {
    console.log('数据变化:', JSON.parse(event.newValue));
  }
});

// 同页面触发方案
window.addEventListener('micro-storage-change', (event) => {
  console.log('自定义事件:', event.detail);
});

function setMicroStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent('micro-storage-change', {
    detail: { key, value }
  }));
}
```

**5. Shared Worker（跨标签页通信）**

```javascript
// 主应用
const worker = new SharedWorker('/shared-worker.js');
worker.port.start();

worker.port.postMessage({ type: 'update', data: { user: 'admin' } });

worker.port.onmessage = (event) => {
  console.log('从其他应用收到:', event.data);
};

// shared-worker.js
const ports = [];

onconnect = (event) => {
  const port = event.ports[0];
  ports.push(port);
  
  port.onmessage = (e) => {
    // 广播给其他端口
    ports.filter(p => p !== port).forEach(p => p.postMessage(e.data));
  };
};
```

**6. 第三方状态管理库（Redux/Mobx/Zustand）**

```javascript
// 创建共享 store（需要打包成独立库）
import { createStore } from 'redux';

// 所有子应用使用同一个 store 实例（通过 CDN 或 Module Federation）
const sharedStore = createStore(reducer);

// 子应用 A
sharedStore.dispatch({ type: 'UPDATE_USER', payload: {...} });

// 子应用 B
sharedStore.subscribe(() => {
  const state = sharedStore.getState();
  // 响应状态变化
});
```

**方案选型对比：**

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| initGlobalState | 官方方案，简洁 | 仅限 qiankun | qiankun 项目 |
| CustomEvent | 跨框架，简单 | 需要约定事件名 | 通用场景 |
| URL 参数 | 简单直观 | 数据量有限 | 初始化参数 |
| localStorage | 持久化 | 同页面需配合事件 | 跨标签页 |
| Shared Worker | 真正跨标签页 | 兼容性一般 | 复杂跨应用 |

**知识点：** `微前端通信` `initGlobalState` `CustomEvent` `状态共享` `跨应用通信` `消息总线`

:::

### Q15: 微前端的样式隔离方案有哪些？（Shadow DOM、CSS Modules、CSS Scope、运行时隔离）

> **🔥 中等 · engineering/micro-frontend**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**微前端样式隔离方案：**

**1. Shadow DOM（最彻底）**

```javascript
// qiankun 配置
start({
  sandbox: {
    strictStyleIsolation: true  // 启用 Shadow DOM
  }
});

// 原理：
// 子应用渲染在 shadowRoot 内部
// 外部 CSS 无法影响内部，内部 CSS 也无法影响外部

// 手动创建 Shadow DOM
const container = document.getElementById('app');
const shadowRoot = container.attachShadow({ mode: 'open' });

shadowRoot.innerHTML = `
  <style>
    div { color: red; }  /* 只影响 shadow DOM 内部 */
  </style>
  <div>只在内部生效</div>
`;
```

**Shadow DOM 优点：**
- ✅ 完全隔离（CSS/JS/DOM）
- ✅ 浏览器原生支持
- ✅ 性能较好

**Shadow DOM 缺点：**
- ❌ 弹窗/下拉组件定位问题（脱离文档流）
- ❌ 全局样式（如 CSS Reset）无法生效
- ❌ 第三方库可能不兼容
- ❌ 事件冒泡需要特殊处理

**适用场景：** 隔离要求极高、交互简单的子应用

---

**2. CSS Modules（编译时隔离）**

```javascript
// webpack 配置
module.exports = {
  module: {
    rules: [{
      test: /\.module\.css$/,
      use: ['style-loader', {
        loader: 'css-loader',
        options: {
          modules: {
            localIdentName: '[name]__[local]___[hash:base64:5]'
          }
        }
      }]
    }]
  }
};

// 使用
// Button.module.css
.btn { color: red; }

// Button.jsx
import styles from './Button.module.css';
<button className={styles.btn}>按钮</button>;
// 编译后: className="Button__btn___a3f2c"
```

**CSS Modules 优点：**
- ✅ 编译时处理，零运行时开销
- ✅ 类型安全（配合 TypeScript）
- ✅ 生态成熟，工具支持好

**CSS Modules 缺点：**
- ❌ 需要构建工具支持
- ❌ 动态类名不方便
- ❌ 无法隔离全局样式（body、html）

**适用场景：** 统一构建工具的项目

---

**3. CSS Scope/命名空间（运行时隔离）**

```javascript
// qiankun 实验性方案
start({
  sandbox: {
    experimentalStyleIsolation: true  // CSS 作用域隔离
  }
});

// 原理：重写选择器，添加前缀
// 原始 CSS:
div { color: red; }
.container > .item { margin: 10px; }

// 转换后:
div[data-qiankun="sub-app"] { color: red; }
[data-qiankun="sub-app"] .container > .item { margin: 10px; }
```

**手动实现命名空间：**

```scss
// 子应用使用嵌套命名空间
#sub-app-namespace {
  @import './styles/base.scss';
  
  .container {
    .item { margin: 10px; }
  }
}
```

**CSS Scope 优点：**
- ✅ 兼容性好
- ✅ 无需构建工具
- ✅ 可以部分隔离

**CSS Scope 缺点：**
- ❌ 无法隔离伪元素（::before/::after）
- ❌ 动态插入的样式难以处理
- ❌ 性能开销（运行时重写）

**适用场景：** qiankun 项目、需要兼容旧浏览器

---

**4. CSS-in-JS（运行时隔离）**

```javascript
// styled-components
import styled from 'styled-components';

const Button = styled.button`
  color: red;
  &:hover { color: blue; }
`;

// 自动添加唯一类名
// <Button> → <button class="sc-abc123">

// emotion
import { css } from '@emotion/react';

const styles = css`
  color: red;
  [data-theme="dark"] & { color: white; }
`;
```

**CSS-in-JS 优点：**
- ✅ 动态样式
- ✅ 自动作用域
- ✅ 按需加载

**CSS-in-JS 缺点：**
- ❌ 运行时开销
- ❌ SSR 配置复杂
- ❌ 学习成本

**适用场景：** React 项目、动态主题需求

---

**5. BEM 命名约定（约定式隔离）**

```css
/* BEM 命名 */
.sub-app__container { }
.sub-app__container__item { }
.sub-app__container__item--active { }
```

```javascript
// 配合项目前缀
// main-app: .main-xxx
// sub-app-a: .app-a-xxx
// sub-app-b: .app-b-xxx
```

**BEM 优点：**
- ✅ 无运行时
- ✅ 简单直观
- ✅ 文档清晰

**BEM 缺点：**
- ❌ 依赖团队约定
- ❌ 无法强制约束
- ❌ 命名冗长

**适用场景：** 团队协作、规范严格的项目

---

**方案对比总结：**

| 方案 | 隔离强度 | 性能 | 兼容性 | 推荐度 |
|------|---------|------|--------|--------|
| Shadow DOM | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| CSS Modules | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| CSS Scope | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| CSS-in-JS | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| BEM 命名 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**知识点：** `CSS 隔离` `Shadow DOM` `CSS Modules` `CSS Scope` `CSS-in-JS` `BEM` `微前端样式`

:::
