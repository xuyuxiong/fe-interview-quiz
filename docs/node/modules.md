---
title: 模块系统与包管理
description: 深入考察 Node.js 的 CJS 与 ESM 模块系统、require 加载机制、模块缓存与循环依赖、package.json 关键字段、npm/pnpm/yarn 核心差异等知识
---

# 模块系统与包管理

### Q1: CommonJS 和 ES Module 有什么核心区别？

> **⭐ 简单 · Node.js**

::: details 点击查看答案与解析

| 维度 | CommonJS (CJS) | ES Module (ESM) |
|------|----------------|-----------------|
| 语法 | `require()` / `module.exports` | `import` / `export` |
| 加载方式 | **运行时动态加载** | **编译时静态分析** |
| 输出类型 | **值的拷贝**（浅拷贝） | **值的引用**（live binding） |
| this 指向 | `module.exports` | `undefined` |
| 同步/异步 | 同步加载 | 异步加载 |
| 顶层 await | ❌ 不支持 | ✅ 支持（top-level await） |
| Tree Shaking | ❌ 无法静态分析 | ✅ 可静态分析 |
| 循环依赖 | 返回已执行部分的快照 | 返回引用，但可能读到 TDZ |
| 模块作用域变量 | `__dirname` / `__filename` ✅ | ❌ 需通过 `import.meta` |

**值的拷贝 vs 引用：**

```javascript
// CJS — 值的拷贝
// counter.js
let count = 0;
module.exports = { count, increment: () => ++count };

// main.js
const { count, increment } = require('./counter');
console.log(count);      // 0
increment();
console.log(count);      // 0（仍然是拷贝值，不会更新）
```

```javascript
// ESM — 值的引用（live binding）
// counter.mjs
export let count = 0;
export const increment = () => ++count;

// main.mjs
import { count, increment } from './counter.mjs';
console.log(count);      // 0
increment();
console.log(count);      // 1（引用更新了！）
```

**Node.js 中启用 ESM 的方式：**

1. 文件后缀为 `.mjs`
2. `package.json` 中设置 `"type": "module"`
3. `--input-type=module` 命令行参数

```json
{
  "type": "module"
}
```

**知识点：** `CJS` `ESM` `值拷贝vs引用` `静态分析` `TreeShaking`

:::

---

### Q2: `require()` 的加载机制是什么？模块是如何被解析的？

> **⭐ 中等 · Node.js**

::: details 点击查看答案与解析

`require()` 的完整加载流程：

```
require(id)
  │
  ▼
1. 缓存检查 → module._cache[filename]
  │ 未命中
  ▼
2. 路径解析 → Module._resolveFilename(id, parent)
  │
  ▼
3. 创建模块对象 → new Module(id, parent)
  │
  ▼
4. 缓存模块 → module._cache[filename] = module
  │
  ▼
5. 编译执行 → module.load(filename)
  │
  ▼
6. 返回 module.exports
```

**路径解析规则（Module._resolveFilename）：**

| require 路径 | 解析规则 |
|-------------|----------|
| `./foo` / `../foo` | 相对路径：基于当前文件目录解析 |
| `/foo` | 绝对路径：直接使用 |
| `foo` / `@scope/foo` | 模块查找：逐级向上查找 `node_modules` |

**模块查找优先级：**

```
require('./foo') 的查找顺序：
1. foo.js
2. foo.json
3. foo/index.js
4. foo/index.json
5. foo 目录下的 package.json → "main" 字段
```

**node_modules 查找算法：**

```
当前文件: /project/src/utils/a.js
require('lodash')

查找路径：
/project/src/utils/node_modules/lodash
/project/src/node_modules/lodash
/project/node_modules/lodash
/node_modules/lodash
```

**require 的源码简化：**

```javascript
function require(id) {
  // 1. 计算绝对路径
  const filename = Module._resolveFilename(id, this);
  
  // 2. 检查缓存
  if (Module._cache[filename]) {
    return Module._cache[filename].exports;
  }
  
  // 3. 加载模块
  const module = new Module(filename, this);
  Module._cache[filename] = module;
  
  // 4. 编译执行
  module.load(filename);
  
  // 5. 返回 exports
  return module.exports;
}
```

**知识点：** `require` `模块解析` `node_modules查找` `模块缓存` `加载流程`

:::

---

### Q3: 模块缓存机制是什么？如何清除缓存？

> **⭐ 中等 · Node.js**

::: details 点击查看答案与解析

**缓存机制：** Node.js 在第一次 `require()` 模块后，会将 `module.exports` 缓存到 `require.cache` 中。后续所有 `require()` 同一模块都返回**缓存中的同一个对象**。

```javascript
// counter.js
let count = 0;
module.exports = {
  count,
  increment: () => ++count,
};

// main.js
const a = require('./counter');
const b = require('./counter');

console.log(a === b);  // true — 同一个对象
a.increment();
console.log(b.count);  // 0 — count 是原始值的拷贝，不受影响
```

**缓存 key 是什么？**

缓存的 key 是模块的**绝对路径**（`filename`），而非 `require()` 的参数。

```javascript
// 以下两个 require 指向同一文件，使用同一缓存
require('./foo');
require('./foo/index');
```

**清除缓存：**

```javascript
// 清除单个模块缓存
const modulePath = require.resolve('./counter');
delete require.cache[modulePath];

// 清除所有缓存
Object.keys(require.cache).forEach((key) => {
  delete require.cache[key];
});

// 清除特定前缀的缓存（热更新场景）
Object.keys(require.cache).forEach((key) => {
  if (key.includes('/my-module/')) {
    delete require.cache[key];
  }
});
```

**缓存的应用场景：**

| 场景 | 方式 |
|------|------|
| 单例模式 | 天然支持，require 即单例 |
| 热更新（HMR） | 删除缓存后重新 require |
| 测试隔离 | 每个测试前清除缓存 |
| 配置热加载 | 删除缓存 + 重新 require |

**⚠️ 注意事项：**

- 清除缓存后重新 require 可能得到新的模块实例，但旧引用仍然指向旧对象
- ESM 没有缓存清除 API（import 是静态的）
- 清缓存操作不推荐在生产环境中使用

**知识点：** `模块缓存` `require.cache` `单例模式` `热更新`

:::

---

### Q4: 什么是循环依赖？Node.js 如何处理？会带来什么问题？

> **⭐ 中等 · Node.js**

::: details 点击查看答案与解析

**循环依赖**指两个或多个模块互相引用：

```
A.js → require B → B.js → require A → A.js（循环！）
```

**Node.js 的处理方式：返回已执行部分的快照**

```javascript
// a.js
exports.loaded = false;
const b = require('./b');
exports.loaded = true;
console.log('a.js: b.loaded =', b.loaded);

// b.js
exports.loaded = false;
const a = require('./a');  // 返回 a.js 已执行部分的 exports
exports.loaded = true;
console.log('b.js: a.loaded =', a.loaded);

// 执行 node a.js
// 输出：b.js: a.loaded = false
//       a.js: b.loaded = true
```

**执行时序图：**

```
node a.js
  │
  ├─ a.js 开始执行，exports.loaded = false
  ├─ require('./b')
  │   │
  │   ├─ b.js 开始执行，exports.loaded = false
  │   ├─ require('./a')
  │   │   └─ a.js 已在缓存中（但只执行了一部分！）
  │   │   └─ 返回 { loaded: false }  ← 部分导出
  │   │
  │   ├─ b.js: a.loaded = false  ← ⚠️ 可能不是期望的值
  │   ├─ b.js 执行完成，exports.loaded = true
  │   └─ 返回 b.js 的完整 exports
  │
  ├─ a.js: b.loaded = true
  └─ a.js 执行完成
```

**CJS vs ESM 循环依赖差异：**

| 方面 | CJS | ESM |
|------|-----|-----|
| 返回值 | 已执行部分的浅拷贝 | Live binding（引用） |
| 未初始化变量 | 返回 `undefined` | 访问时抛出 TDZ 错误 |
| 表现形式 | 静默失败，难以调试 | 明确报错，容易发现 |

**解决方案：**

1. **重构模块结构** — 提取公共部分到第三个模块
2. **延迟 require** — 将 require 移到函数内部
3. **依赖注入** — 通过参数传递而非直接引用

```javascript
// 方案 1：提取公共模块
// shared.js
module.exports = { shared: true };

// 方案 2：延迟 require
// a.js
module.exports = {
  fnA() {
    const b = require('./b'); // 在函数内部 require
    return b.fnB();
  }
};
```

**知识点：** `循环依赖` `模块加载顺序` `部分导出` `CJS vs ESM`

:::

---

### Q5: package.json 中有哪些关键字段？它们的作用是什么？

> **⭐ 中等 · Node.js**

::: details 点击查看答案与解析

| 字段 | 作用 | 示例 |
|------|------|------|
| `name` | 包名（必须小写，可含 `@scope/`） | `"@myorg/mypackage"` |
| `version` | 语义化版本号 | `"1.2.3"` |
| `type` | 模块系统类型 | `"module"` / `"commonjs"` |
| `main` | CJS 入口文件 | `"./dist/index.js"` |
| `module` | ESM 入口文件（非官方但广泛使用） | `"./dist/index.mjs"` |
| `exports` | 现代化入口映射（优先级最高） | 见下方 |
| `imports` | 包内部的导入映射 | 见下方 |
| `bin` | 可执行文件映射 | `{ "mycli": "./bin/cli.js" }` |
| `files` | npm 发布时包含的文件 | `["dist", "README.md"]` |
| `engines` | Node/npm 版本约束 | `{ "node": ">=18" }` |
| `scripts` | 生命周期脚本 | `{ "start": "node index.js" }` |
| `dependencies` | 生产依赖 | `{ "express": "^4.18.0" }` |
| `devDependencies` | 开发依赖 | `{ "jest": "^29.0.0" }` |
| `peerDependencies` | 宿主依赖（插件模式） | `{ "react": ">=18" }` |
| `optionalDependencies` | 可选依赖 | `{ "fsevents": "^2.3.0" }` |
| `workspaces` | monorepo 工作空间 | `["packages/*"]` |
| `sideEffects` | Tree Shaking 标记 | `false` 或文件数组 |
| `private` | 防止意外发布 | `true` |

**`exports` 字段详解（Node 12.7+）：**

```json
{
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    },
    "./feature": "./dist/feature.js",
    "./utils/*": "./dist/utils/*"
  }
}
```

- `exports` 存在时，`main` 仅作向后兼容
- `"."` 代表包根路径
- 条件导出：`import` / `require` / `node` / `browser` / `default`
- 显式导出之外的路径将被拒绝（防止内部文件泄露）

**`imports` 字段：**

```json
{
  "imports": {
    "#utils": "./src/utils/index.js",
    "#config": "./src/config.js"
  }
}

// 在包内部使用
import { helper } from '#utils';
```

**语义化版本（SemVer）：**

| 符号 | 含义 | `^1.2.3` | `~1.2.3` |
|------|------|----------|----------|
| `^` | 兼容版本 | `>=1.2.3 <2.0.0` | — |
| `~` | 补丁版本 | — | `>=1.2.3 <1.3.0` |
| `*` | 任意版本 | — | — |

**知识点：** `package.json` `exports` `imports` `semver` `依赖类型`

:::

---

### Q6: npm、yarn、pnpm 有什么区别？pnpm 的优势在哪？

> **⭐ 简单 · Node.js**

::: details 点击查看答案与解析

| 特性 | npm | yarn | pnpm |
|------|-----|------|------|
| 包存储 | 各项目独立 `node_modules` | 各项目独立 `.yarn` | 全局 store + 硬链接 |
| 锁文件 | `package-lock.json` | `yarn.lock` | `pnpm-lock.yaml` |
| 安装速度 | 较慢 | 快 | 最快 |
| 磁盘占用 | 高（每个项目完整复制） | 高 | 低（硬链接共享） |
| 幽灵依赖 | ✅ 有 | ✅ 有 | ❌ 默认严格隔离 |
| Monorepo | `workspaces` | `workspaces` | `workspaces`（最佳） |
| 即时安装 | — | — | ✅ `pnpm deploy` |
| 插件系统 | — | ✅ Yarn 2+ (Berry) | — |

**pnpm 的核心优势 — 内容寻址存储（Content-Addressable Store）：**

```
传统 npm/yarn：
  project-a/node_modules/lodash/    → 完整拷贝（1MB）
  project-b/node_modules/lodash/    → 完整拷贝（1MB）
  project-c/node_modules/lodash/    → 完整拷贝（1MB）
  总占用：3MB

pnpm：
  ~/.pnpm-store/v3/files/xx/yy      → 唯一副本（1MB）
  project-a/node_modules/lodash/    → 硬链接到 store
  project-b/node_modules/lodash/    → 硬链接到 store
  project-c/node_modules/lodash/    → 硬链接到 store
  总占用：1MB
```

**pnpm 的严格依赖隔离：**

```bash
# npm/yarn：扁平化 node_modules（幽灵依赖问题）
node_modules/
  lodash/           # 直接依赖 ✅
  express/          # 直接依赖 ✅
  accepts/          # express 的依赖，但也能被 require ❌（幽灵依赖）

# pnpm：嵌套结构 + 软链接
node_modules/
  .pnpm/
    lodash@4.17.21/
      node_modules/
        lodash/     ← 真实文件
    express@4.18.2/
      node_modules/
        express/
        accepts/    ← 只对 express 可见
  lodash/           ← 软链接到 .pnpm/lodash@4.17.21/node_modules/lodash
  express/          ← 软链接到 .pnpm/express@4.18.2/node_modules/express
  # accepts 不可直接引用！
```

**幽灵依赖问题：**

```javascript
// package.json 中没有 declares accepts
// 但在 npm/yarn 中因为扁平化，以下代码可以运行
const accepts = require('accepts'); // ❌ 幽灵依赖

// pnpm 中直接报错：Cannot find package 'accepts'
// 必须在 package.json 中显式声明
```

**pnpm 常用命令：**

```bash
pnpm add lodash          # 添加依赖
pnpm add -D jest         # 添加开发依赖
pnpm install             # 安装依赖
pnpm run build           # 运行脚本
pnpm -r run build        # monorepo 递归执行
pnpm store prune         # 清理未引用的 store 内容
```

**知识点：** `npm` `yarn` `pnpm` `硬链接` `幽灵依赖` `内容寻址`

:::

---

### Q7: `require` 和 `import` 可以混用吗？有哪些坑？

> **⭐ 中等 · Node.js**

::: details 点击查看答案与解析

**结论：可以混用，但有很多坑，生产环境应尽量避免。**

### CJS 引用 ESM

**✅ 使用动态 import()（推荐）：**

```javascript
// CJS 文件中引用 ESM
const { default: foo, bar } = await import('./module.mjs');
```

**❌ 不能使用 require() 直接引用 ESM：**

```javascript
// 报错：require() of ES Module not supported
const foo = require('./module.mjs');
```

> 因为 ESM 是异步加载的，而 `require()` 是同步的，无法等待。

### ESM 引用 CJS

**✅ 可以使用 import：**

```javascript
// ESM 中引用 CJS
import cjsModule from './cjs-module.cjs';
// 等价于 const cjsModule = require('./cjs-module.cjs')

// 具名导出需要用 default
import pkg from 'cjs-pkg';
const { named } = pkg; // 解构 default
```

**⚠️ 坑：CJS 的 module.exports vs ESM 的 default**

```javascript
// CJS 模块
module.exports = { a: 1, b: 2 };

// ESM 中引用
import mod from './cjs.cjs';
console.log(mod);     // { a: 1, b: 2 } ✅
import { a } from './cjs.cjs';
console.log(a);       // undefined ❌（具名导入不生效）

// CJS 模块（具名导出写法）
module.exports = { a: 1, b: 2 };
module.exports.a = 1;

// ESM 中引用（Node.js 会尝试提取具名导出）
import { a } from './cjs.cjs';
console.log(a);       // 1 ✅（Node.js 静态分析提取）
// 但如果是动态赋值则无法提取：
module.exports = computeExports(); // ❌ 具名导入全部 undefined
```

### 混用的常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| CJS 中 require ESM | 报错 | 用 `await import()` |
| CJS 中 `this` | `module.exports` | ESM 中 `this` 是 `undefined` |
| ESM 中 `__dirname` | 不存在 | 用 `import.meta.url` + `fileURLToPath` |
| ESM 中 `require` | 不存在 | 用 `createRequire(import.meta.url)` |
| JSON 导入 | CJS: `require('./data.json')` | ESM: `import data from './data.json' assert { type: 'json' }` |

**ESM 中模拟 require：**

```javascript
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');
```

**知识点：** `CJS与ESM混用` `动态import` `default导出` `__dirname替代`

:::

---

### Q8: npm workspaces 和 pnpm workspaces 在 monorepo 中有何差异？

> **⭐ 困难 · Node.js**

::: details 点击查看答案与解析

| 特性 | npm workspaces | pnpm workspaces |
|------|---------------|-----------------|
| 配置文件 | `package.json` 的 `workspaces` | `pnpm-workspace.yaml` |
| 依赖提升 | 全部提升到根目录 | 默认严格隔离 |
| 幽灵依赖 | 有 | 无 |
| 性能 | 中等 | 快（硬链接） |
| 过滤执行 | 不支持（需借助脚本） | ✅ `--filter` |
| 发布控制 | — | ✅ `pnpm deploy` |
| 依赖覆盖 | `overrides` | `pnpm.overrides` + `peerDependencyRules` |

**pnpm workspaces 配置：**

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - '!**/test/**'
```

**pnpm 的核心优势 — 过滤器：**

```bash
# 只在变更的包中执行
pnpm -r run build --filter=...[origin/main]

# 只在某个包及其依赖中执行
pnpm -r run test --filter=app...packages/utils

# 排除某个包
pnpm -r run build --filter=!legacy-app

# 在特定包中执行
pnpm --filter @myorg/ui run build
```

**Monorepo 依赖管理最佳实践：**

```json
// packages/ui/package.json
{
  "name": "@myorg/ui",
  "dependencies": {
    "@myorg/utils": "workspace:*"   // pnpm workspace 协议
  }
}
```

```json
// 根目录 package.json（npm workspaces）
{
  "workspaces": ["packages/*", "apps/*"]
}
```

**Turborepo / Nx 与 pnpm 的配合：**

```bash
# Turborepo + pnpm 是常见的 monorepo 方案
turbo run build --filter=app    # 利用 turbo 的缓存和并行能力
```

**常见问题与解决：**

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 包 A 引用不到包 B | 依赖提升或隔离问题 | 确认 `workspace:*` 声明 |
| 构建顺序不对 | 没有声明包间依赖 | 在 `package.json` 中声明依赖关系 |
| 发布时版本不同步 | workspace 协议未正确替换 | `pnpm publish` 自动处理 |
| CI 安装慢 | 重复下载依赖 | 启用 pnpm store 缓存 |

**知识点：** `monorepo` `workspaces` `pnpm filter` `workspace协议` `依赖管理`

:::

---

### Q9: `.npmrc` 配置文件有哪些常用配置？

> **⭐ 简单 · Node.js**

::: details 点击查看答案与解析

`.npmrc` 是 npm/yarn/pnpm 的配置文件，支持多级配置：

**配置文件优先级（从高到低）：**

| 位置 | 作用范围 | 路径 |
|------|----------|------|
| 命令行 | 单次命令 | `--registry=xxx` |
| 项目级 | 当前项目 | `/project/.npmrc` |
| 用户级 | 当前用户 | `~/.npmrc` |
| 全局级 | 全局 | `$PREFIX/etc/npmrc` |
| 内置 | npm 自带 | `/path/to/npm/npmrc` |

**常用配置项：**

```ini
# 镜像源
registry=https://registry.npmmirror.com

# 作用域包的镜像
@myorg:registry=https://npm.myorg.com

# 认证信息
//npm.myorg.com/:_authToken=${NPM_TOKEN}

# 严格模式
strict-ssl=true

# 依赖提升控制（pnpm）
shamefully-hoist=true
hoist-pattern[]=*eslint*

# 安装行为
save=false              # npm install 不自动加入 dependencies
save-exact=true         # 锁定精确版本
package-lock=false      # 不生成 lock 文件

# 忽略脚本（安全加固）
ignore-scripts=true

# 代理
proxy=http://proxy.company.com:8080
https-proxy=http://proxy.company.com:8080

# 缓存
cache=/path/to/cache

# pnpm 专用
node-linker=hoisted     # 提升模式（兼容性）
dedupe-peer-dependents=true
```

**安全最佳实践：**

```ini
# .npmrc（项目级）
ignore-scripts=true        # 防止恶意 install 脚本
audit=true                 # 启用安全审计
fund=false                 # 关闭 fund 提示
```

**知识点：** `npmrc` `镜像源` `认证配置` `pnpm配置` `安全加固`

:::

---

### Q10: 什么是幽灵依赖（Phantom Dependencies）？如何检测和解决？

> **⭐ 困难 · Node.js**

::: details 点击查看答案与解析

**幽灵依赖**：代码中引用了未在 `package.json` 中声明的包，它作为其他包的依赖被间接安装到了 `node_modules` 中。

**产生原因：**

npm v3+ 和 yarn 默认采用**扁平化安装**，将依赖提升到 `node_modules` 根目录：

```
package.json:
  dependencies: { express }  # 只声明了 express

node_modules/（扁平化后）:
  express/         ← 直接依赖
  accepts/         ← express 的依赖，被提升到根目录
  body-parser/     ← 同上
  ...              ← 几十个子依赖都暴露了
```

**问题：**

```javascript
// 代码中引用了未声明的包
const accepts = require('accepts'); // 能运行！但随时可能消失

// 当 express 升级且不再依赖 accepts 时：
// → npm install 后 accepts 消失
// → 线上报错：Cannot find module 'accepts'
```

**检测方法：**

| 工具 | 说明 |
|------|------|
| **eslint-plugin-import** | `no-extraneous-dependencies` 规则 |
| **depcheck** | 检测未使用和缺失的依赖 |
| **pnpm** | 默认严格隔离，直接报错 |
| **arethetypeswrong** | 检测类型问题 |
| **check-dependencies** | CI 中验证依赖一致性 |

```bash
# 使用 depcheck 检测
npx depcheck

# 使用 eslint
npx eslint --rule 'import/no-extraneous-dependencies: error' src/
```

**解决方案：**

| 方案 | 做法 | 推荐度 |
|------|------|--------|
| **切换 pnpm** | 默认严格隔离，杜绝幽灵依赖 | ⭐⭐⭐⭐⭐ |
| **显式声明依赖** | 在 `package.json` 中添加缺失的依赖 | ⭐⭐⭐⭐ |
| **eslint 规则** | 启用 `no-extraneous-dependencies` | ⭐⭐⭐⭐ |
| **CI 检查** | `depcheck` 或 `check-dependencies` | ⭐⭐⭐ |
| **yarn PnP** | Yarn 2+ 的 Plug'n'Play 模式 | ⭐⭐⭐ |

**pnpm 的解决方式：**

```bash
# pnpm 默认严格模式，幽灵依赖直接报错
node -e "require('accepts')"
# Error: Cannot find package 'accepts'

# 如果必须用扁平化（兼容性考虑），可在 .npmrc 中设置
echo "shamefully-hoist=true" > .npmrc
# 但这会重新引入幽灵依赖问题，不推荐
```

**知识点：** `幽灵依赖` `扁平化` `pnpm严格模式` `depcheck` `依赖安全`

:::
---

### Q11: Node.js 的模块缓存机制是怎样的？require 的查找流程？

> **🔥 中等 · 模块系统**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Node.js 模块首次加载后缓存在内存，require 有明确的文件查找规则。**

**1. 模块缓存机制：**

```javascript
// 缓存位置
require.cache  // Map<路径，Module 对象>

// 流程
第一次 require('./a.js')
  ↓
1. 检查缓存
2. 无则加载执行
3. 存入 require.cache
4. 返回 exports

第二次 require('./a.js')
  ↓
1. 检查缓存 ✅
2. 直接返回 exports
（不会重新执行）

// 验证
delete require.cache[require.resolve('./a')];
require('./a');  // 重新加载
```

**2. require 查找流程：**

```text
步骤 1：判断路径类型
- 绝对路径：从/开头
- 相对路径：./或../开头
- 核心模块：fs, path 等
- node_modules：包名

步骤 2：文件查找（相对路径）
1. 尝试 require('/path/a.js')
2. 失败则尝试 /path/a.js
3. 失败则尝试 /path/a.js/index.js

步骤 3：node_modules 查找
从当前目录向上遍历：
/project/node_modules/a.js
/node_modules/a.js
直到根目录

步骤 4：遍历 package.json exports
```

**3. 查找算法：**

```javascript
// 简化版查找流程
function requireResolve(request, from) {
  if (isCoreModule(request)) {
    return loadCoreModule(request);
  }
  
  if (isAbsolutePath(request) || isRelativePath(request)) {
    return loadLocalModule(path.resolve(from, request));
  }
  
  // node_modules 查找
  return findInNodeModules(request, from);
}

function findInNodeModules(id, from) {
  let current = from;
  while (current !== '/') {
    const modulePath = path.join(current, 'node_modules', id);
    if (exists(modulePath)) return modulePath;
    current = path.dirname(current);
  }
}
```

**4. 缓存清除：**

```javascript
// 清除单个模块
delete require.cache[require.resolve('./module')];

// 清除所有缓存
Object.keys(require.cache).forEach(key => {
  delete require.cache[key];
});

// 使用场景：
// - 需要热重载
// - 测试时需要隔离
// - 配置变更时
```

**知识点：** `模块缓存` `require 解析` `node_modules` `模块加载`

:::

---

### Q12: package.json 中的 exports 字段的作用？

> **🔥 中等 · 模块**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**exports 字段控制包的公开导出路径，替代 pkg.main 提供更细粒度的控制。**

**1. exports 基础用法：**

```json
{
  "name": "my-package",
  "exports": {
    ".": "./index.js",
    "./utils": "./utils/index.js",
    "./package.json": "./package.json"
  }
}
```

**2. 条件导出：**

```json
{
  "exports": {
    ".": {
      "require": "./cjs/index.js",
      "import": "./esm/index.js",
      "browser": "./browser/index.js",
      "default": "./index.js"
    }
  }
}
```

**3. 主要作用：**

```text
1. 控制公开 API
   - 隐藏内部结构
   - 只暴露指定路径

2. 支持多入口
   - 允许用户导入不同子模块
   - ./package/utils 等

3. 环境区分
   - ESM/CJS 不同入口
   - 浏览器/Node 不同实现

4. 防止非法访问
   - 未列出的路径无法 require
   - 报错 MODULE_NOT_FOUND
```

**4. 使用示例：**

```javascript
// 用户使用
import pkg from 'my-package';           // 使用 "."
import utils from 'my-package/utils';   // 使用 "./utils"

// 以下会报错（未导出）
import internal from 'my-package/internal';

// 服务端判断环境
if (process.browser) {
  // 使用 browser 导出
}
```

**5. 与 main 对比：**

| 特性 | main | exports |
|------|------|---------|
| 标准 | 旧标准 | 新标准 |
| 子路径 | ❌ | ✅ |
| 条件导出 | ❌ | ✅ |
| 限制访问 | ❌ | ✅ |
| 工具支持 | 全 | Node 12+ |

**知识点：** `package.json` `exports` `模块导出` `ESM` `入口`

:::
