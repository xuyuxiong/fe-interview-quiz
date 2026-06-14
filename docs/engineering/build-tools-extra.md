---
title: 构建工具补充面试题
description: webpack loader/plugin、SourceMap、模块联邦等面试题
---

# 构建工具补充面试题

### Q1: webpack 常见的 loader 和 plugin 有哪些？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**常见 Loader：**

| Loader | 作用 | 配置示例 |
|--------|------|---------|
| babel-loader | ES6+ → ES5 | `test: /\.js$/` |
| ts-loader | TypeScript → JS | `test: /\.ts$/` |
| css-loader | 解析 @import/url() | 处理 CSS 依赖 |
| style-loader | 将 CSS 注入 DOM | `<style>` 标签 |
| sass-loader | SCSS → CSS | 配合 css-loader |
| postcss-loader | CSS 后处理 | autoprefixer 等 |
| file-loader | 文件输出到目录 | 图片/字体等 |
| url-loader | 小文件 base64 | 配置 limit |
| raw-loader | 文件内容作为字符串 | 导入文本文件 |
| vue-loader | SFC 解析 | Vue 单文件组件 |

**常见 Plugin：**

| Plugin | 作用 |
|--------|------|
| HtmlWebpackPlugin | 自动生成 HTML 并注入 JS/CSS |
| MiniCssExtractPlugin | 提取 CSS 为独立文件 |
| CleanWebpackPlugin | 构建前清空输出目录 |
| DefinePlugin | 定义环境变量 |
| HotModuleReplacementPlugin | 热更新 |
| CopyWebpackPlugin | 复制静态文件 |
| TerserPlugin | 压缩 JS |
| BundleAnalyzerPlugin | 打包体积分析 |

**知识点：** `webpack` `loader` `plugin` `babel-loader` `HtmlWebpackPlugin` `构建流程`

:::

### Q2: webpack SourceMap 有哪些类型？生产环境用哪种？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| devtool | 构建 | 重建 | 适合环境 | 质量 |
|---------|------|------|---------|------|
| `(none)` | 最快 | 最快 | 生产 | 无映射 |
| `eval` | 快 | 最快 | 开发 | 行映射 |
| `cheap-eval-source-map` | 较快 | 快 | 开发 | 行映射（转码后） |
| `cheap-module-eval-source-map` | 较快 | 快 | 开发 ✅ | 行映射（源码） |
| `source-map` | 最慢 | 最慢 | 生产 | 行 + 列映射 |
| `hidden-source-map` | 最慢 | 最慢 | 生产 ✅ | 行 + 列映射（不暴露） |
| `nosources-source-map` | 较慢 | 较慢 | 生产 | 只有映射无源码 |

**生产环境推荐：**

```js
// hidden-source-map（推荐）
module.exports = {
  devtool: 'hidden-source-map'
}

// nosources-source-map
module.exports = {
  devtool: 'nosources-source-map'
}
```

**开发环境推荐：**

```js
module.exports = {
  devtool: 'cheap-module-source-map'
}
```

**知识点：** `SourceMap` `devtool` `hidden-source-map` `错误还原` `SourceMap 类型`

:::

### Q3: webpack 模块联邦（Module Federation）的优缺点？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**配置示例：**

```js
// 远程应用
new ModuleFederationPlugin({
  name: 'remoteApp',
  filename: 'remoteEntry.js',
  exposes: {
    './Button': './src/components/Button',
    './utils': './src/utils/shared'
  },
  shared: {
    react: { singleton: true, requiredVersion: '^18.0.0' },
    'react-dom': { singleton: true }
  }
})

// 主应用
new ModuleFederationPlugin({
  name: 'hostApp',
  remotes: {
    remoteApp: 'remoteApp@http://localhost:3001/remoteEntry.js'
  },
  shared: {
    react: { singleton: true },
    'react-dom': { singleton: true }
  }
})
```

**优点：**
- 运行时集成
- 独立部署
- 共享依赖
- 渐进式迁移
- 跨框架（理论上）

**缺点：**
- 版本冲突
- 加载时序
- 调试困难
- 类型安全
- 样式冲突
- 缓存策略

**知识点：** `Module Federation` `模块联邦` `微前端` `shared` `远程模块`

:::

### Q4: Vite 的完整构建流程是怎样的？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**开发环境（dev）流程：**

```
用户启动 dev → 依赖预构建 (esbuild) → 启动 ESM 开发服务器 → 浏览器请求模块 → 按需转换 → HMR 更新
```

**1. 依赖预构建（Pre-bundling）：**

```javascript
// vite.config.js
export default {
  optimizeDeps: {
    include: ['lodash', 'axios'],
    exclude: ['special-lib'],
    esbuildOptions: { target: 'es2020' }
  }
}

// 预构建结果存储在：node_modules/.vite/deps/
```

**2. ESM 按需加载：**

```javascript
// main.ts - 浏览器直接请求
import { createApp } from 'vue'
import App from './App.vue'

// Vite 处理流程：
// 1. main.ts 被请求
// 2. esbuild 转换 TS → JS
// 3. 返回 ESM 代码
// 4. 浏览器请求 App.vue
// 5. @vitejs/plugin-vue 编译 .vue → JS
```

**3. HMR 更新：**

```javascript
// Vite 使用 WebSocket 推送更新
const socket = new WebSocket(`ws://localhost:${hmrPort}`)

socket.onmessage = (event) => {
  const update = JSON.parse(event.data)
  
  if (update.type === 'update') {
    update.payload.forEach(({ path }) => {
      import(path + '?t=' + timestamp)
    })
  }
}
```

**生产环境（build）流程：**

```
vite build → Rollup 打包 → Tree Shaking → Code Splitting → 压缩输出
```

**知识点：** `Vite` `构建流程` `预构建` `ESM` `HMR` `Rollup`

:::

### Q5: esbuild 为什么快？（Go 语言、AST 并行、无缓存直接生成）

> **🔥 中等 · engineering/build-tools-extra**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**esbuild 快的核心原因：**

**1. Go 语言编译**

```text
Babel（JavaScript）：单线程，解释执行
esbuild（Go）：编译为机器码，原生执行

性能对比：
- Babel:  ~500ms / 1000 行代码
- esbuild: ~3ms / 1000 行代码
- 快约 100 倍
```

**2. 并行处理**

```go
// esbuild 内部使用 Go 的 goroutine 并行处理
go func() {
  // 并行解析多个文件
  parseAllFiles(files)
}()

go func() {
  // 并行转换 AST
  transformAllASTs()
}()
```

**3. AST 直接生成，无中间缓存**

```text
传统流程（Babel）：
源码 → 解析为 AST → 遍历转换 → 生成新 AST → 打印为代码
      ↓                    ↓
   解析缓存               转换缓存

esbuild 流程：
源码 → 解析为 AST → 直接生成代码
      ↓
   一次性完成，无中间缓存
```

**4. 内存优化**

```go
// esbuild 将所有 AST 保存在内存中，避免磁盘 I/O
// 使用高效的字符串 interning 减少内存复制
```

**esbuild 在 Vite 中的应用：**

```javascript
// vite.config.js
export default {
  build: {
    minify: 'esbuild',  // 用 esbuild 压缩
    target: 'es2020',
    cssMinify: 'lightningcss'  // 更快的 CSS 压缩
  },
  
  // 依赖预构建也用 esbuild
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
      format: 'esm'
    }
  }
}
```

**esbuild 限制：**

| 限制 | 说明 |
|------|------|
| 插件生态 | 不如 Babel 丰富 |
| 自定义转换 | 需要写 Go 插件 |
| 语法支持 | 仅支持主流语法，不支持实验性语法 |
| Source Map | 支持但功能有限 |

**esbuild 配置示例：**

```javascript
// esbuild API
import * as esbuild from 'esbuild';

await esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  format: 'esm',
  target: 'es2020',
  minify: true,
  sourcemap: true,
  splitting: true,  // 代码分割
  metafile: true,   // 生成元数据用于分析
  treeShaking: true
});
```

**知识点：** `esbuild` `构建性能` `Go 语言` `并行编译` `AST` `Vite`

:::

### Q6: SWC 和 Babel 的区别？Rust 编译器的优势？

> **🔥 中等 · engineering/build-tools-extra**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**SWC vs Babel 对比：**

| 特性 | SWC | Babel |
|------|-----|-------|
| 语言 | Rust | JavaScript |
| 速度 | 快 20-70 倍 | 基准 |
| 生态 | 逐步完善 | 最丰富 |
| 兼容性 | 主流语法 | 最全 |
| 插件 | 有限 | 丰富 |
| 配置 | 简单 | 复杂 |

**Rust 编译器的优势：**

**1. 内存安全**

```rust
// Rust 编译器在编译时保证内存安全
// 无 GC 开销，无悬垂指针
fn transform(code: &str) -> String {
  // 无需担心内存泄漏
  compile(code)
}
```

**2. 零成本抽象**

```rust
// Rust 的抽象在编译时消除，无运行时开销
// 相比 JavaScript 的动态特性快 100 倍 +
```

**3. 并行编译**

```rust
// 使用 Rayon 库轻松实现并行
use rayon::prelude::*;

fn compile_files(files: Vec<File>) -> Vec<Result> {
  files.par_iter()  // 并行迭代
    .map(|file| compile(file))
    .collect()
}
```

**SWC 在 Next.js 中的应用：**

```javascript
// next.config.js
module.exports = {
  swcMinify: true,  // 使用 SWC 压缩
  
  // SWC 配置
  jsc: {
    parser: {
      syntax: 'typescript',
      jsx: true,
      decorators: true
    },
    transform: {
      react: {
        runtime: 'automatic'
      }
    }
  }
}
```

**SWC 配置示例：**

```javascript
// .swcrc
{
  "jsc": {
    "parser": {
      "syntax": "typescript",
      "tsx": true,
      "decorators": true
    },
    "transform": {
      "react": {
        "runtime": "automatic"
      }
    },
    "target": "es2020"
  },
  "minify": true,
  "sourceMaps": true
}
```

**性能对比实测：**

```text
编译 1000 行 TypeScript 代码：
- Babel:     500ms
- SWC:        20ms
- esbuild:     3ms

编译 10 万行代码：
- Babel:     50 秒
- SWC:        2 秒
- esbuild:  0.3 秒
```

**SWC 限制：**

| 限制 | 说明 |
|------|------|
| 插件生态 | 不如 Babel 丰富 |
| 自定义转换 | 需要写 Rust 插件 |
| 实验性语法 | 支持有限 |
| 调试工具 | 相对较少 |

**选择建议：**

```text
选择 SWC：
- Next.js 项目（内置支持）
- 追求极致构建速度
- 不需要复杂自定义转换

选择 Babel：
- 需要丰富插件生态
- 自定义转换多
- 实验性语法支持
```

**知识点：** `SWC` `Babel` `Rust` `编译器对比` `构建性能` `Next.js`

:::