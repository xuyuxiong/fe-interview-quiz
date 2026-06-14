---
title: 构建工具
description: Webpack、Vite、Rollup 等构建工具面试题
---

# 构建工具

## 面试题

### Q1: webpack 常见的 loader 和 plugin 有哪些？

> **🔥 中等 · engineering/build-tools**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Loader**（加载器）

Loader 用于转换模块源代码，让 webpack 能处理非 JS 文件。

**常见 Loader 及用途：**

| Loader | 用途 | 安装 |
|--------|------|------|
| `babel-loader` | 转译 ES6+ → ES5 | `npm i -D babel-loader @babel/core @babel/preset-env` |
| `css-loader` | 解析 CSS 中的 `@import` 和 `url()` | `npm i -D css-loader` |
| `style-loader` | 将 CSS 注入 `<style>` 标签 | `npm i -D style-loader` |
| `sass-loader` | 编译 Sass/Scss | `npm i -D sass-loader sass` |
| `less-loader` | 编译 Less | `npm i -D less-loader less` |
| `postcss-loader` | PostCSS 处理（autoprefixer 等） | `npm i -D postcss-loader postcss` |
| `ts-loader` | 编译 TypeScript | `npm i -D ts-loader typescript` |
| `file-loader` | 处理文件（图片、字体） | `npm i -D file-loader` |
| `url-loader` | 文件转 base64（小文件） | `npm i -D url-loader` |
| `image-webpack-loader` | 图片压缩 | `npm i -D image-webpack-loader` |
| `html-loader` | 处理 HTML 文件 | `npm i -D html-loader` |
| `raw-loader` | 将文件作为字符串导入 | `npm i -D raw-loader` |

**Loader 配置示例：**

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.tsx?$/,
        use: ['ts-loader'],
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024 // 8kb 以下转 base64
          }
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        type: 'asset/resource'
      }
    ]
  }
};
```

**Plugin**（插件）

Plugin 用于执行更广泛的任务，如打包优化、资源管理、环境变量注入等。

**常见 Plugin 及用途：**

| Plugin | 用途 | 安装 |
|--------|------|------|
| `HtmlWebpackPlugin` | 生成 HTML 文件 | `npm i -D html-webpack-plugin` |
| `MiniCssExtractPlugin` | 提取 CSS 到独立文件 | `npm i -D mini-css-extract-plugin` |
| `CleanWebpackPlugin` | 清空 output 目录 | `npm i -D clean-webpack-plugin` |
| `DefinePlugin` | 定义环境变量 | 内置 |
| `HotModuleReplacementPlugin` | 模块热替换 | 内置 |
| `CopyPlugin` | 复制文件到输出目录 | `npm i -D copy-webpack-plugin` |
| `OptimizeCssAssetsPlugin` | 压缩 CSS | `npm i -D optimize-css-assets-webpack-plugin` |
| `TerserPlugin` | 压缩 JS | 内置 (webpack5) |
| `BundleAnalyzerPlugin` | 打包分析 | `npm i -D webpack-bundle-analyzer` |
| `ProgressPlugin` | 显示编译进度 | 内置 |

**Plugin 配置示例：**

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      minify: { collapseWhitespace: true, removeComments: true }
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].[contenthash:8].css'
    }),
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    new CopyPlugin({
      patterns: [{ from: 'public', to: '.' }]
    })
  ]
};
```

**知识点**：`webpack` `loader` `plugin` `babel` `CSS 处理` `打包优化`

:::

### Q2: webpack SourceMap 有哪些类型？生产环境用哪种？

> **🔥 中等 · engineering/build-tools**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**SourceMap 作用**：将打包压缩后的代码映射回原始源代码，便于调试和错误定位。

| 类型 | 速度 | 映射精度 | 打包结果 | 适用场景 |
|------|------|---------|---------|---------|
| `eval` | ⭐⭐⭐ | 低 | 无 .map | 开发快速调试 |
| `eval-source-map` | ⭐ | 高 | 无 .map | 开发精确调试 |
| `cheap-source-map` | ⭐⭐ | 中 | 有 .map | 开发平衡 |
| `cheap-module-source-map` | ⭐ | 中高 | 有 .map | 开发推荐 |
| `source-map` | ⭐ | 最高 | 有 .map | 生产调试 |
| `hidden-source-map` | ⭐ | 最高 | 有 .map | 生产推荐 |
| `nosources-source-map` | ⭐ | 高 | 有 .map | 生产推荐 |

**开发环境推荐**：`cheap-module-source-map`（最佳平衡）

**生产环境推荐**：`hidden-source-map` 或 `nosources-source-map`（不暴露源码）

**知识点**：`SourceMap` `webpack` `调试` `生产环境` `代码保护` `错误定位`

:::

### Q3: 如何编写一个 webpack loader？

> **💀 困难 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Loader 本质**：一个函数，接收源文件内容，返回转换后的内容。

```js
// 简单 loader：替换文案中的占位符
module.exports = function(source) {
  const options = this.getOptions();
  const result = source.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return options.replacements?.[key] || match;
  });
  return result;
};

// 异步 loader
module.exports = function(source) {
  const callback = this.async();
  setTimeout(() => {
    const result = source.replace(/old/g, 'new');
    callback(null, result);
  }, 1000);
  return null;
};

// Pitch loader（在 normal loader 之前执行）
module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  if (someCondition) {
    return `export default ${JSON.stringify(content)}`;
  }
  data.value = 42;
};
```

**常用 Loader API**：

| API | 作用 |
|-----|------|
| `this.getOptions()` | 获取配置 |
| `this.callback(err, result, map)` | 返回多个结果 |
| `this.async()` | 异步回调 |
| `this.emitFile(name, content)` | 输出额外文件 |

**知识点**：`webpack loader` `函数式转换` `pitch` `异步 loader` `loader 执行顺序`

:::

### Q4: 如何编写一个 webpack plugin？

> **💀 困难 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Plugin 本质**：一个带有 `apply` 方法的类，通过钩子介入编译流程。

```js
class FileListPlugin {
  constructor(options = {}) {
    this.filename = options.filename || 'filelist.md';
  }

  apply(compiler) {
    compiler.hooks.thisCompilation.tap('FileListPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'FileListPlugin',
          stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS
        },
        (assets) => {
          const fileList = Object.keys(assets).map(name => `- ${name}`).join('\n');
          compilation.emitAsset(
            this.filename,
            new compiler.webpack.sources.RawSource(`# Build Files\n${fileList}`)
          );
        }
      );
    });
  }
}

module.exports = FileListPlugin;
```

**常用 Compiler 钩子**：

| 钩子 | 类型 | 时机 |
|------|------|------|
| `entryOption` | SyncBailHook | 入口配置解析后 |
| `compilation` | SyncHook | compilation 创建完成 |
| `emit` | AsyncSeriesHook | 输出资源前 |
| `done` | AsyncSeriesHook | 编译完成 |

**知识点**：`webpack plugin` `apply` `Tapable` `compiler 钩子` `compilation`

:::

### Q5: webpack 如何提高构建速度？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**构建速度优化方案**：

```js
module.exports = {
  // 1. resolve 优化
  resolve: {
    extensions: ['.js', '.jsx', '.ts'],
    alias: { '@': path.resolve('src') },
    modules: ['node_modules']
  },
  
  // 2. 排除 node_modules
  module: {
    rules: [{
      test: /\.js$/,
      include: path.resolve('src'),
      exclude: /node_modules/,
      use: 'babel-loader'
    }],
    noParse: /jquery|lodash/
  },
  
  // 3. 持久化缓存
  cache: {
    type: 'filesystem',
    buildDependencies: { config: [__filename] }
  },
  
  // 4. 多线程
  module: {
    rules: [{
      test: /\.js$/,
      use: ['thread-loader', 'babel-loader']
    }]
  },
  
  // 5. externals 分离大型依赖
  externals: { react: 'React', 'react-dom': 'ReactDOM' }
};
```

| 方案 | 原理 | 提升幅度 |
|------|------|---------|
| resolve 缩小范围 | 减少文件搜索 | 10-30% |
| 持久化缓存 | 跳过未变模块 | 50-80% |
| thread-loader | 多线程编译 | 15-30% |
| externals | CDN 引入 | 10-20% |

**知识点**：`webpack 优化` `缓存` `多线程` `resolve` `externals`

:::

### Q6: tree-shaking 是文件级还是函数级？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Tree-shaking 是函数级**（模块导出级）

```js
// utils.js
export function used() { return 'used'; }      // ✅ 保留
export function unused() { return 'unused'; }  // ❌ 移除

// main.js
import { used } from './utils';
```

**原理：基于 ESM 的静态分析**

| 模块类型 | 静态分析 | Tree-shaking |
|---------|---------|-------------|
| ES6 Module | ✅ 编译时确定 | ✅ 支持 |
| CommonJS | ❌ 运行时确定 | ❌ 不支持 |

```js
// ES6 — 可 tree-shake
import { debounce } from 'lodash-es';

// CommonJS — 不可 tree-shake
const { debounce } = require('lodash');
```

**sideEffects 配置**：

```json
{
  "sideEffects": false
}
```

**知识点**：`tree-shaking` `ESM` `静态分析` `sideEffects` `Dead Code Elimination`

:::

### Q7: Vite 是什么？为什么快？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Vite 核心原理**：开发时 No-Bundle（基于 ESM），生产时 Rollup 打包。

**为什么快**：

| 技术点 | 说明 | 效果 |
|--------|------|------|
| ESM No-Bundle | 浏览器原生 import | 启动 O(1) |
| esbuild 预构建 | Go 编写，并行编译 | 快 10-100x |
| 按需编译 | 只编译当前页面模块 | 启动不等待 |
| HMR 精确更新 | 基于依赖图精确替换 | 改动秒级生效 |

```
Webpack 开发：修改代码 → 重新打包整个 bundle → 等待几秒
Vite 开发：修改代码 → 只编译修改模块 → HMR 瞬间更新
```

**知识点**：`Vite` `ESM` `esbuild` `No-Bundle` `HMR`

:::

### Q8: Vite HMR 原理？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HMR 完整流程**：

```
1. 文件修改 → chokidar 监听
2. 计算受影响模块（Module Graph）
3. WebSocket 通知浏览器
4. 浏览器 import()?t=timestamp 重新加载
5. 执行 accept 回调更新 UI
```

```js
// Vite Server 端
chokidar.watch(root).on('change', (file) => {
  const mods = moduleGraph.getModulesByFile(file);
  mods.forEach(mod => mod.importers.forEach(i => i.invalidate()));
  ws.send({ type: 'update', updates: [...] });
});

// 浏览器端
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    render(newModule.default);
  });
}
```

**知识点**：`Vite HMR` `WebSocket` `Module Graph` `ESM`

:::

### Q9: Vite 构建流程？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**开发环境**（dev）

```
浏览器请求 → Vite Server → esbuild 编译 TS/JSX → 返回 ESM
```

**生产环境**（build）

```
vite build → Rollup 解析入口 → 依赖图构建 → 代码转换
  → Tree-shaking → Code Splitting → esbuild 压缩 → dist/
```

**预构建**（Pre-bundling）

```
node_modules/react → .vite/deps/react.js（ESM）
node_modules/lodash-es → .vite/deps/lodash-es.js（合并）
```

**知识点**：`Vite 构建流程` `esbuild 预构建` `Rollup` `依赖图`

:::

### Q10: Webpack 5 有哪些新特性？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Webpack 5 核心特性**：

| 特性 | 说明 | 优势 |
|------|------|------|
| 持久化缓存 | filesystem 缓存 | 二次构建快 50-80% |
| Module Federation | 模块联邦 | 跨应用共享模块 |
| Asset Modules | 内置资源模块 | 替代 file-loader |
| Tree Shaking 改进 | 嵌套依赖分析 | 更彻底移除 |
| 原生 ESM 配置 | 配置可用 import/export | 现代化 |

```js
// 持久化缓存
cache: { type: 'filesystem', buildDependencies: { config: [__filename] } }

// Module Federation
new ModuleFederationPlugin({
  name: 'remoteApp',
  exposes: { './Button': './src/Button' },
  shared: { react: { singleton: true } }
});

// Asset Modules
{ test: /\.png$/, type: 'asset', parser: { dataUrlCondition: { maxSize: 8192 } } }
```

**知识点**：`Webpack 5` `持久化缓存` `Module Federation` `Asset Modules`

:::

### Q11: Webpack 动态加载（import()）的原理？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**动态 import() — 代码分割核心**

```js
// 静态导入（打包到一起）
import module from './module.js';

// 动态导入（生成独立 chunk）
const module = await import('./module.js');
```

**工作流程**：

```
1. 解析 import() → 2. 创建独立 chunk → 3. 生成加载代码
  → 4. 运行时按需加载 → 5. 模块执行返回 Promise
```

**React 路由懒加载**：

```jsx
const Dashboard = React.lazy(() => import('./Dashboard'));
function App() {
  return <Suspense fallback={<Loading />}><Dashboard /></Suspense>;
}
```

**魔法注释**：

```js
import(/* webpackChunkName: "dashboard" */ './Dashboard');
import(/* webpackPreload: true */ './CriticalModule');
import(/* webpackPrefetch: true */ './NextPage');
```

**知识点**：`动态导入` `代码分割` `import()` `懒加载` `webpackChunkName`

:::

### Q12: 模块联邦（Module Federation）的优缺点？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**配置示例**：

```js
// 远程应用
new ModuleFederationPlugin({
  name: 'remoteApp',
  filename: 'remoteEntry.js',
  exposes: { './Button': './src/Button' },
  shared: { react: { singleton: true } }
});

// 主应用
new ModuleFederationPlugin({
  remotes: { remoteApp: 'remoteApp@http://localhost:3001/remoteEntry.js' },
  shared: { react: { singleton: true } }
});
```

**优点**：运行时集成、独立部署、共享依赖、渐进式迁移

**缺点**：版本冲突、加载时序、调试困难、类型推导困难、无 CSS 隔离

**vs qiankun**：

| 特性 | Module Federation | qiankun |
|------|------------------|---------|
| JS 沙箱 | ❌ | ✅ |
| CSS 隔离 | ❌ | ✅ |
| 独立部署 | ✅ | ✅ |
| 子应用保活 | - | ❌ |

**知识点**：`Module Federation` `模块联邦` `微前端` `shared`

:::
### Q13: Webpack Loader 和 Plugin 的区别？手写一个简单的 Loader

> **🔥 中等 · engineering/build-tools**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Loader 和 Plugin 的核心区别：**

| 维度 | Loader | Plugin |
|------|--------|--------|
| 作用 | 转换模块源代码 | 扩展构建功能，介入整个编译流程 |
| 执行时机 | 模块加载时（每个模块） | 构建生命周期的特定钩子 |
| 输入输出 | 源码 → 转换后的源码 | 通过 hooks 操作 compiler/compilation |
| 本质 | 导出为函数的模块 | 带 apply 方法的类/对象 |
| 使用场景 | 文件转换（TS→JS、SCSS→CSS） | 打包优化、资源管理、环境变量注入 |

**手写一个简单的 Loader：将 Markdown 转为 HTML**

```javascript
// markdown-loader.js
const marked = require('marked');

module.exports = function(source) {
  const options = this.getOptions() || {};
  const callback = this.async(); // 异步模式
  
  const wrapper = options.wrapper || 'section';
  
  // 异步处理
  setTimeout(() => {
    const html = marked.parse(source);
    const result = `<${wrapper} class="markdown-body">${html}</${wrapper}>`;
    callback(null, result);
  }, 100);
  
  return null; // 异步模式必须返回 null
};

// 同步版本
module.exports = function(source) {
  const html = marked.parse(source);
  return `module.exports = ${JSON.stringify(html)}`;
};
```

**Pitch Loader（在 normal loader 之前执行）：**

```javascript
module.exports.pitch = function(remainingRequest, precedingRequest, data) {
  // pitch 从前往后执行，normal 从后往前执行
  if (someCondition) {
    return `export default ${JSON.stringify(processedContent)}`;
  }
  data.someValue = 42; // data 在 pitch 和 normal 之间共享
};
```

**Plugin 钩子类型：**

```javascript
// SyncHook - 同步钩子
compiler.hooks.compile.tap('MyPlugin', params => { ... });

// AsyncSeriesHook - 异步串行
compiler.hooks.emit.tapAsync('MyPlugin', (compilation, callback) => {
  setTimeout(() => callback(), 100);
});

// AsyncParallelHook - 异步并行
compiler.hooks.afterEmit.tapPromise('MyPlugin', compilation => {
  return Promise.all([uploadAssets()]);
});
```

**知识点：** `webpack loader` `webpack plugin` `loader 编写` `pitch` `Tapable 钩子` `compilation` `异步 loader`

:::

### Q14: Webpack 的 Tree Shaking 原理？为什么需要 ESM？

> **🔥 中等 · engineering/build-tools**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Tree Shaking 原理：基于 ESM 的静态分析**

```javascript
// utils.js
export const used = () => 'used';
export const unused = () => 'unused';

// main.js
import { used } from './utils.js';
console.log(used());

// Tree Shaking 结果：只打包 used 函数，unused 被移除
```

**为什么需要 ESM？**

```javascript
// ❌ CommonJS - 动态导入，无法静态分析
const { debounce } = require('lodash');
// require 是函数调用，webpack 不知道运行时会 require 什么
// 只能把整个 lodash 打包进去

// ✅ ESM - 静态导入，编译时确定
import { debounce } from 'lodash-es';
// import 是声明，webpack 可以静态分析出只用了 debounce
// 只打包 debounce 函数
```

**Tree Shaking 生效条件：**

```javascript
// 1. 必须是 ESM 语法
import { func } from './utils';      // ✅
export { func };                     // ✅

// 2. package.json 标注 sideEffects
{
  "sideEffects": false,              // 声明所有模块无副作用
  // 或只标注有副作用的文件
  "sideEffects": ["*.css", "./src/polyfills.js"]
}

// 3. 使用 production 模式
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    minimize: true
  }
};
```

**优化 Tree Shaking 的建议：**

```javascript
// 1. 使用 ESM 语法
import { debounce } from 'lodash-es';

// 2. 避免导出整个对象
export { func1, func2, func3 };   // ✅
export default { func1, func2 };   // ❌

// 3. 使用纯函数，避免副作用
print('hello');           // 副作用 - 不能 Tree Shake
window.myGlobal = 1;      // 副作用 - 不能 Tree Shake
```

**知识点：** `Tree Shaking` `ESM` `静态分析` `sideEffects` `Dead Code Elimination` `rollup` `Terser`

:::

### Q15: Vite 为什么快？esbuild 预构建 + ESM 按需加载的原理

> **🔥 中等 · engineering/build-tools**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Vite 快的两个核心原因：No-Bundle 开发 + esbuild 预构建**

**Webpack 开发流程：**
```
启动 → 解析入口 → 遍历依赖图 → 编译每个模块 → 打包成 bundle → 启动服务器（几秒到几十秒）
修改代码 → 重新走全流程
```

**Vite 开发流程（No-Bundle）：**
```
启动 → esbuild 预构建依赖（一次） → 启动服务器（几乎瞬间）
浏览器请求 → Vite 按需编译 → 返回 ESM 代码
修改代码 → 只编译修改的模块 → WebSocket 推送 HMR → 瞬间更新
```

**esbuild 预构建依赖（Pre-Bundling）：**

```javascript
// 为什么需要预构建？
// 1. 将 CommonJS 转换为 ESM（浏览器原生支持 ESM）
// 2. 将分散的模块合并，减少 HTTP 请求

// 示例：lodash-es 有 600+ 独立模块
import { debounce, throttle } from 'lodash-es';
// 没有预构建 → 600+ HTTP 请求

// esbuild 预构建后：
// node_modules/.vite/deps/lodash-es.js（单个文件）
// 只需 1 个请求
```

**预构建流程：**

```text
1. Vite 扫描源码中的 import 语句
2. 识别 node_modules 中的依赖
3. 使用 esbuild 转换为 ESM 格式
4. 输出到 node_modules/.vite/deps/
5. 添加缓存（package-lock.json 变化时才重新构建）

// esbuild 多快？
// Babel：1000 行代码需要 500ms
// esbuild：1000 行代码需要 3ms（快 100+ 倍）
```

**ESM 按需加载原理：**

```javascript
// main.ts（浏览器请求）
import { createApp } from 'vue';
import App from './App.vue';

// Vite 处理流程：
// 1. 浏览器请求 /src/main.ts
// 2. Vite 检测到 .ts → 用 esbuild 编译为 ESM
// 3. 返回编译后的代码（带 import URL）

// 响应代码：
import { createApp } from '/node_modules/.vite/deps/vue.js';  // 预构建过的
import App from '/src/App.vue?t=123456';                      // 需要编译
```

**生产构建为什么用 Rollup：**

| 特性 | 开发 (Vite) | 生产 (Rollup) |
|------|------------|---------------|
| 打包 | No-Bundle | 完整打包 |
| 编译 | esbuild 按需 | Rollup + esbuild |
| 优化 | 无 | Code Splitting/Tree Shaking |

**知识点：** `Vite` `esbuild` `预构建` `No-Bundle` `ESM` `HMR` `开发性能`

:::

### Q16: Rollup 和 Webpack 的区别？为什么库用 Rollup 打包？

> **🔥 中等 · engineering/build-tools**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Rollup vs Webpack 核心差异：**

| 特性 | Rollup | Webpack |
|------|--------|---------|
| 定位 | 库打包工具 | 应用打包工具 |
| 设计理念 | ES Module 优先 | 万物皆可打包 |
| Tree Shaking | 原生支持（更强） | 需要配置 |
| 代码分割 | 简化 | 灵活（multi-entry） |
| 热更新 | 无（专注库） | 支持（HMR） |
| 配置复杂度 | 简单 | 复杂 |
| 适用场景 | 库/组件打包 | SPA/多页面应用 |

**Rollup 配置示例：**

```javascript
// rollup.config.js
export default {
  input: 'src/index.js',
  output: [
    { file: 'dist/bundle.esm.js', format: 'esm', sourcemap: true },
    { file: 'dist/bundle.cjs.js', format: 'cjs', exports: 'named' },
    { file: 'dist/bundle.umd.js', format: 'umd', name: 'MyLibrary', exports: 'named' },
    { file: 'dist/bundle.iife.js', format: 'iife', name: 'MyLibrary' }
  ],
  external: ['react', 'react-dom'],
  plugins: [
    resolve(),
    commonjs(),
    typescript()
  ]
};
```

**库的 package.json 配置：**

```json
{
  "name": "my-library",
  "main": "dist/index.cjs.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js",
      "types": "./dist/index.d.ts"
    }
  },
  "sideEffects": false,
  "peerDependencies": { "react": ">=16.8.0" }
}
```

**为什么不用 Webpack 打包库：**

```text
Webpack 优点（适合应用）：
✅ 代码分割（多入口 + 动态导入）
✅ HMR（开发体验）
✅ 资产处理（CSS/图片/字体）
✅ 丰富的 loader 生态

Webpack 缺点（不适合库）：
❌ 输出较复杂（webpack runtime）
❌ Tree Shaking 依赖配置
❌ 产物体积偏大

Rollup 优点（适合库）：
✅ 更彻底的 Tree Shaking
✅ 输出简洁（无 runtime）
✅ 多种格式支持
✅ 专注 ESM，天然支持 Tree Shaking
```

**知识点：** `Rollup` `Webpack` `库打包` `ESM` `输出格式` `Tree Shaking` `peerDependencies`

:::
