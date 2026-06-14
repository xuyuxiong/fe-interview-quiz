---
title: TS 工程化与配置
description: TypeScript 项目配置、tsconfig.json、编译选项、工程化最佳实践面试题
---

# TS 工程化与配置

**知识点：** `tsconfig.json` `编译选项` `模块解析` `声明文件` `项目引用` `构建配置`

**难度分布：** 简单 30% / 中等 50% / 困难 20%

---

### Q1: tsconfig.json 中最重要的配置项有哪些？

> **⭐ 简单 · TypeScript**

请列举 tsconfig.json 中最常用的配置项，并说明其作用。

::: details 点击查看答案与解析

**答案：**

| 配置项 | 作用 | 常用值 |
|--------|------|--------|
| `target` | 编译目标 JS 版本 | "ES5", "ES2015", "ES2020", "ESNext" |
| `module` | 模块系统 | "commonjs", "ESNext", "ES2020", "NodeNext" |
| `lib` | 包含的库声明文件 | ["DOM", "ES2020", "DOM.Iterable"] |
| `strict` | 启用严格类型检查 | true/false |
| `esModuleInterop` | ES 模块互操作 | true/false |
| `skipLibCheck` | 跳过声明文件检查 | true/false |
| `outDir` | 输出目录 | "./dist" |
| `rootDir` | 源代码根目录 | "./src" |
| `declaration` | 生成 .d.ts 文件 | true/false |
| `sourceMap` | 生成 source map | true/false |
| `jsx` | JSX 处理方式 | "preserve", "react", "react-jsx" |
| `moduleResolution` | 模块解析策略 | "node", "classic", "bundler" |
| `baseUrl` | 模块解析基础路径 | "." |
| `paths` | 路径映射别名 | {"@/*": ["src/*"]} |
| `include` | 包含的文件 | ["src/**/*"] |
| `exclude` | 排除的文件 | ["node_modules", "dist"] |

**解析：**

- `target` 和 `module` 决定编译输出格式
- `strict` 是多个严格检查选项的快捷方式
- `esModuleInterop` 允许 `import x from 'module'` 导入 CommonJS
- `skipLibCheck` 可以加速编译，但可能隐藏类型问题

:::

---

### Q2: strict 模式包含哪些具体的类型检查选项？

> **⭐ 中等 · TypeScript**

请列举 `strict: true` 会启用的所有子选项，并说明其作用。

::: details 点击查看答案与解析

**答案：**

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

等价于同时开启以下选项：

```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,      // null/undefined 独立检查
    "strictFunctionTypes": true,   // 函数参数逆变检查
    "strictBindCallApply": true,   // bind/call/apply 严格检查
    "strictPropertyInitialization": true,  // 类属性初始化检查
    "noImplicitThis": true,        // this 隐式 any 检查
    "noImplicitAny": true,         // 隐式 any 报错
    "useUnknownInCatchVariables": true  // catch 变量类型为 unknown
  }
}
```

**详细说明：**

| 选项 | 作用 | 示例 |
|------|------|------|
| `strictNullChecks` | null/undefined 不能赋给其他类型 | `let x: string = null` ❌ |
| `strictFunctionTypes` | 函数参数严格逆变检查 | 防止不安全的函数赋值 |
| `strictBindCallApply` | bind/call/apply 参数类型检查 | 确保参数匹配 |
| `strictPropertyInitialization` | 类属性必须初始化或标注可选 | `class C { x: number }` ❌ |
| `noImplicitThis` | this 不能是隐式 any | 要求显式标注 this 类型 |
| `noImplicitAny` | 禁止隐式推断为 any | 无类型注解且无法推断时报错 |
| `useUnknownInCatchVariables` | catch 变量类型为 unknown | `catch (e)` 中 e 是 unknown |

**解析：**

- 建议新项目始终开启 `strict: true`
- 老项目可以逐步开启各个子选项
- 严格模式能捕获更多潜在问题
- 某些选项可能带来较多报错，需要渐进式修复

:::

---

### Q3: 如何配置 TypeScript 支持路径别名？

> **⭐ 中等 · TypeScript**

请说明如何配置 TypeScript 支持 `@/components` 这样的路径别名。

::: details 点击查看答案与解析

**答案：**

**tsconfig.json 配置：**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@types": ["src/types/index.ts"]
    }
  }
}
```

**使用示例：**

```ts
// 之前
import { Button } from "../../../components/Button"
import { formatDate } from "../../utils/date"

// 使用别名后
import { Button } from "@/components/Button"
import { formatDate } from "@/utils/date"
```

**注意事项：**

1. **运行时需要配套配置**

   - Vite: `vite.config.ts` 中配置 `resolve.alias`
   - Webpack: `webpack.config.js` 中配置 `resolve.alias`
   - Jest: `jest.config.js` 中配置 `moduleNameMapper`
   - Node.js: 使用 `tsconfig-paths` 或 `tsc-alias`

2. **Vite 配置示例：**

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

3. **Node.js 运行时支持：**

```json
{
  "scripts": {
    "build": "tsc && tsc-alias"
  }
}
```

```bash
npm install -D tsc-alias
```

**解析：**

- `baseUrl` 必须以 `.` 开头表示相对路径
- `paths` 支持通配符 `*`
- 只配置 TypeScript 不够，运行时需要打包工具/运行时支持
- `moduleResolution: "bundler"` (TS5.0+) 对路径别名支持更好

:::

---

### Q4: 什么是声明文件（.d.ts）？如何编写？

> **⭐ 中等 · TypeScript**

请解释声明文件的作用，并说明如何为 JavaScript 库编写声明文件。

::: details 点击查看答案与解析

**答案：**

**声明文件作用：**

- 为 JavaScript 代码提供类型信息
- 让 TypeScript 能"理解"无类型的 JS 库
- 文件扩展名为 `.d.ts`
- 只包含类型声明，不包含实现

**基本语法：**

```ts
// global.d.ts - 全局声明
declare const API_BASE: string
declare function fetch(url: string): Promise<any>

// 全局变量
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production"
  }
}

// 模块声明
declare module "lodash" {
  export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): T
  export const version: string
}

// 类声明
declare class EventEmitter {
  on(event: string, listener: (...args: any[]) => void): this
  emit(event: string, ...args: any[]): boolean
}

// 函数重载声明
declare function log(message: string): void
declare function log(message: string, level: "info" | "warn"): void
```

**为 JS 库编写声明文件：**

```ts
// types/mylib.d.ts
declare module "mylib" {
  export interface Config {
    host: string
    port: number
  }
  
  export function createClient(config: Config): Client
  
  export class Client {
    connect(): Promise<void>
    disconnect(): void
    on(event: "ready", handler: () => void): void
  }
}

// 或者使用 export = 语法（匹配 CommonJS）
declare module "mylib" {
  interface Config { host: string }
  class Client { connect(): Promise<void> }
  
  function createClient(config: Config): Client
  
  export = { createClient, Client }
}
```

**发布声明文件：**

```json
{
  "name": "mylib",
  "version": "1.0.0",
  "main": "index.js",
  "types": "index.d.ts",
  "exports": {
    ".": {
      "types": "./index.d.ts",
      "require": "./index.js",
      "import": "./index.mjs"
    }
  }
}
```

**解析：**

- 声明文件以 `declare` 关键字开头
- 可以为全局变量、模块、类、函数等提供类型
- DefinitelyTyped 社区维护了数万第三方库的类型
- 优先使用 `declare module` 而不是 `export =`

:::

---

### Q5: 什么是项目引用（Project References）？有什么优势？

> **⭐ 困难 · TypeScript**

请解释 TypeScript 项目引用的概念和使用场景。

::: details 点击查看答案与解析

**答案：**

**项目引用**（Project References）是 TypeScript 3.0+ 引入的特性，用于管理多项目工作区。

**项目结构：**

```
monorepo/
├── tsconfig.json           # 解决方案文件
├── packages/
│   ├── core/
│   │   ├── tsconfig.json   # 核心包配置
│   │   └── src/index.ts
│   └── app/
│       ├── tsconfig.json   # 应用配置
│       └── src/index.ts
```

**解决方案 tsconfig.json：**

```json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/app" }
  ]
}
```

**packages/core/tsconfig.json：**

```json
{
  "compilerOptions": {
    "composite": true,          // 必须启用
    "declaration": true,        // 必须生成声明文件
    "declarationMap": true,     // 推荐：生成声明映射
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**packages/app/tsconfig.json：**

```json
{
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist"
  },
  "references": [
    { "path": "../core" }       // 引用核心包
  ],
  "include": ["src/**/*"]
}
```

**优势：**

1. **增量编译**：只编译变更的项目，大幅提升编译速度
2. **隔离构建**：每个项目独立编译，可以并行
3. **清晰的依赖关系**：通过 reference 显式声明依赖
4. **更好的 IDE 支持**：VS Code 能更好处理大型代码库

**构建命令：**

```bash
# 构建所有项目（包括依赖）
tsc --build

# 构建特定项目
tsc --build packages/app

# 清理构建产物
tsc --build --clean

# 强制重新构建
tsc --build --force
```

**解析：**

- 项目引用适合大型 monorepo 项目
- 需要启用 `composite: true`
- 被引用的项目必须开启 `declaration`
- TSC 会处理依赖顺序和增量编译

:::

---

### Q6: 如何配置 TypeScript 支持 JSX/React？

> **⭐ 中等 · TypeScript**

请说明 TypeScript 中 JSX 的配置选项，以及 React 17+ 的新 JSX transform。

::: details 点击查看答案与解析

**答案：**

**jsx 配置选项：**

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",        // React 17+ 推荐
    "jsxImportSource": "react" // 指定 JSX 运行时
  }
}
```

| 值 | 说明 | 输出 |
|---|------|------|
| `"preserve"` | 保留 JSX 不做转换 | `<div />` → `<div />` |
| `"react"` | 经典 transform | `<div />` → `React.createElement("div")` |
| `"react-native"` | React Native | `<div />` → `React.createElement("div")` |
| `"react-jsx"` | React 17+ | `<div />` → `jsx("div", null)` |
| `"react-jsxdev"` | React 17+ dev | 开发版本 |

**经典 vs 新 JSX Transform：**

```tsx
// 经典方式 (jsx: "react")
import React from "react"  // 必须导入
function App() {
  return <h1>Hello</h1>
}
// 编译后：React.createElement("h1", null, "Hello")

// 新方式 (jsx: "react-jsx")
function App() {
  return <h1>Hello</h1>
}
// 编译后：jsx("h1", null, "Hello")
// 不需要导入 React
```

**React 17+ 推荐配置：**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "types": ["react", "react-dom"]
  }
}
```

**React 类型声明：**

```bash
# 安装类型
npm install -D @types/react @types/react-dom
```

**解析：**

- React 17+ 项目推荐使用 `"react-jsx"`
- 新 transform 不再需要 `import React`
- `"react-jsxdev"` 用于开发环境，包含额外调试信息
- Vue 3 项目使用 `"preserve"` 配合 Vite 处理

:::

---

### Q7: 如何配置 TypeScript 用于 Node.js 项目？

> **⭐ 中等 · TypeScript**

请说明 Node.js 项目的 TypeScript 最佳配置。

::: details 点击查看答案与解析

**答案：**

**现代 Node.js 项目配置（TypeScript 5.0+）：**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmitOnError": true,
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**关键点说明：**

| 配置项 | 说明 |
|--------|------|
| `module: "NodeNext"` | 使用 Node.js 的 ESM/CJS 解析 |
| `moduleResolution: "NodeNext"` | Node.js 模块解析策略 |
| `resolveJsonModule` | 允许 `import data from "./config.json"` |
| `types: ["node"]` | 包含 Node.js 类型声明 |

**package.json 配置：**

```json
{
  "name": "my-node-app",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js"
  },
  "devDependencies": {
    "@types/node": "^20.x",
    "tsx": "^4.x",
    "typescript": "^5.x"
  }
}
```

**运行配置：**

```json
{
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node --loader ts-node/esm src/index.ts"
  }
}
```

**解析：**

- TypeScript 5.0+ 推荐使用 `NodeNext` 模块系统
- `@types/node` 提供 Node.js API 类型
- 配合 `tsx` 可以实现 TypeScript 直接运行
- 考虑使用 `tsup`、`rolldown` 等现代打包工具

:::

---

### Q8: 什么是 isolatedModules 选项？为什么要开启？

> **⭐ 困难 · TypeScript**

请解释 `isolatedModules` 的作用和使用场景。

::: details 点击查看答案与解析

**答案：**

**isolatedModules** 告诉 TypeScript 每个文件可以被独立转译，而不需要查看其他文件的信息。

**为什么重要：**

1. **Babel/SWC/esbuild 等工具**只处理单个文件，无法做跨文件类型检查
2. **确保与这些工具兼容**，避免转译结果与 tsc 不一致
3. **现代构建工具**（Vite、Next.js、Remix）依赖此选项

**案例：**

```ts
// ❌ 没有 isolatedModules 可能没问题
// 但开启后以下代码会报错：
const enum Direction { Up, Down }  // ❌ const enum 需要跨文件信息

// ✅ 正确用法
enum Direction { Up, Down }

// ❌ 不允许
export const value = 1
const x = value  // 非导出的变量可能被优化

// ✅ 确保使用的内容被导出或不被优化
```

**推荐配置：**

```json
{
  "compilerOptions": {
    "isolatedModules": true,
    "noEmit": true
  }
}
```

**实际场景：**

- **Create React App**、**Next.js**、**Vite** 默认开启
- 配合 `ts-loader` 或 `babel-loader` 时必需
- 确保运行时转换与类型检查行为一致

**解析：**

- 开启后 TypeScript 会执行额外检查确保文件独立
- 禁止使用需要跨文件信息的特性（如 `const enum`）
- 建议在使用 Babel/SWC 转译的生产环境中始终开启
- 开发时可以用 `tsc --noEmit` 做类型检查

:::

---

### Q9: 如何排除 TypeScript 中的特定错误？

> **⭐ 简单 · TypeScript**

请列举几种抑制 TypeScript 错误的方法和使用场景。

::: details 点击查看答案与解析

**答案：**

**方法 1：@ts-ignore（忽略整行）**

```ts
// @ts-ignore: 解释原因
const x: number = "string"

// @ts-expect-error: 期望有错误（用于测试类型）
const y: number = "string"
```

**方法 2：@ts-expect-error**

```ts
// @ts-expect-error 类型应该不匹配
const error: number = "string"

// 如果下一行没有错误，@ts-expect-error 本身会报错
const correct: number = 42  // ❌ @ts-expect-error 期望有错误但实际没有
```

**方法 3：// eslint-disable-next-line @typescript-eslint/规则名**

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fn = (x: any) => x
```

**方法 4：类型断言（不推荐滥用）**

```ts
const value = "42"
const num = value as unknown as number  // 双重断言绕过检查
```

**方法 5：在 tsconfig.json 中关闭特定检查**

```json
{
  "compilerOptions": {
    "noImplicitAny": false,
    "skipLibCheck": true
  }
}
```

**最佳实践：**

```ts
// ✅ 好的做法 - 说明原因
// @ts-ignore: API 返回类型与实际不符，待上游修复

// ✅ 测试类型断言
type Test<T> = T extends string ? "yes" : "no"
// @ts-expect-error
type Assert = Test<number> extends "yes" ? true : false

// ❌ 不好的做法 - 无理由忽略
// @ts-ignore
const x: any = getValue()
```

**解析：**

- `@ts-ignore` 会抑制下一行的所有错误
- `@ts-expect-error` 用于测试（下一行必须有错误）
- 应该始终添加注释说明忽略原因
- TypeScript 5.0+ 支持 `@ts-expect-error` 带消息解释
- 优先修复类型问题，忽略是最后手段

:::

---

### Q10: 如何优化 TypeScript 项目的编译速度？

> **⭐ 困难 · TypeScript**

请列举至少 5 种优化 TypeScript 编译速度的方法。

::: details 点击查看答案与解析

**答案：**

**1. 启用增量编译**

```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

**2. 使用项目引用（Project References）**

```json
{
  "files": [],
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/app" }
  ]
}
```

**3. 缩小 include/exclude 范围**

```json
{
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts", "**/*.spec.ts"]
}
```

**4. 使用 skipLibCheck**

```json
{
  "compilerOptions": {
    "skipLibCheck": true  // 跳过 node_modules 中的类型检查
  }
}
```

**5. 使用 isolatedModules 配合 esbuild/SWC**

```ts
// vite.config.ts 或 esbuild 配置
export default {
  build: {
    target: "es2020",
    // 使用 esbuild 进行快速转译
  }
}
```

**6. 避免过大的类型**

```ts
// ❌ 避免
type HugeObject = { [K in string]: any }

// ✅ 推荐
interface MyObject {
  specific: string
  fields: number
}
```

**7. 使用 tsc --noEmit 做纯类型检查**

```json
{
  "scripts": {
    "type-check": "tsc --noEmit",
    "build": "tsc && ..."
  }
}
```

**8. 升级 TypeScript 版本**

- TS 5.0+ 性能有显著提升
- 关注 release notes 中的性能改进

**9. 分析编译性能**

```bash
# 生成编译性能报告
tsc --extendedDiagnostics
tsc --generateTrace ./trace
# 用 https://ui.ts.uk/ 可视化分析
```

**10. 使用 TypeScript 5.0+ 的 --explainFiles (调试用)**

```bash
tsc --explainFiles > explanation.txt
```

**解析：**

- 优先使用增量编译和项目引用
- 限制类型检查范围，排除不必要的文件
- 生产构建可以考虑用 esbuild/SWC 只做转译
- 定期分析编译性能瓶颈

:::

---

### Q11: TypeScript 的 project references 是什么？大型项目如何组织？

> **🔥 中等 · TypeScript**

请详细解释 TypeScript 项目引用的工作原理，以及如何在大型 monorepo 中组织项目结构。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Project References 核心概念：**

Project References 是 TypeScript 3.0+ 引入的特性，允许将大型项目拆分为多个子项目，每个子项目独立编译。

**基本配置：**

```json
// 根 tsconfig.json（解决方案文件）
{
  "files": [],
  "references": [
    { "path": "./packages/shared" },
    { "path": "./packages/api" },
    { "path": "./packages/web" }
  ]
}
```

**子项目配置：**

```json
// packages/shared/tsconfig.json
{
  "compilerOptions": {
    "composite": true,        // 必须
    "declaration": true,      // 必须 - 生成 .d.ts
    "declarationMap": true,   // 推荐 - 生成 .d.ts.map
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true
  },
  "include": ["src/**/*"]
}
```

**大型项目组织模式：**

```
monorepo/
├── tsconfig.json              # 解决方案
├── packages/
│   ├── core/                  # 核心库
│   │   ├── tsconfig.json
│   │   └── src/
│   ├── utils/                 # 工具库
│   │   ├── tsconfig.json
│   │   └── src/
│   ├── api-client/            # API 客户端
│   │   ├── tsconfig.json
│   │   └── src/
│   └── web-app/               # Web 应用
│       ├── tsconfig.json
│       └── src/
├── apps/
│   └── admin/                 # 管理后台
│       ├── tsconfig.json
│       └── src/
└── tools/
    └── build-config/          # 共享构建配置
        └── tsconfig.base.json
```

**依赖关系配置：**

```json
// packages/api-client/tsconfig.json
{
  "extends": "../../tools/build-config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "references": [
    { "path": "../core" },
    { "path": "../utils" }
  ],
  "include": ["src/**/*"]
}
```

**构建脚本：**

```json
{
  "scripts": {
    "build": "tsc --build",
    "build:clean": "tsc --build --clean",
    "build:force": "tsc --build --force",
    "watch": "tsc --build --watch"
  }
}
```

**优势：**

1. **增量编译**：只编译变更的项目
2. **并行构建**：独立项目可以并行编译
3. **清晰的依赖图**：显式声明项目依赖
4. **更好的 IDE 体验**：VS Code 能更好处理大型项目
5. **输出隔离**：每个项目有独立的输出目录

**知识点：** `Project References` `Monorepo` `增量编译` `composite`

:::

---

### Q12: TypeScript 的 path mapping 和 baseUrl 配置？

> **🔥 中等 · TypeScript**

请详细解释 baseUrl 和 paths 的配置方式，以及运行时需要做什么。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**基础配置：**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@types": ["src/types/index.ts"],
      "@config": ["config/index.ts"]
    }
  }
}
```

**baseUrl 说明：**

- 必须是相对路径（以 `.` 开头）
- 作为所有非相对模块解析的基础
- 影响 `paths` 的解析

**paths 语法：**

```json
{
  "paths": {
    // 精确匹配
    "jquery": ["node_modules/jquery/dist/jquery"]
    
    // 通配符匹配
    "@/*": ["src/*"]
    
    // 多候选（按顺序尝试）
    "@api/*": ["src/api/v2/*", "src/api/v1/*"]
  }
}
```

**运行时需要配置：**

**1. Vite：**

```ts
// vite.config.ts
import path from 'path'

export default {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@components': path.resolve(__dirname, 'src/components')
    }
  }
}
```

**2. Webpack：**

```js
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
}
```

**3. Jest：**

```js
// jest.config.js
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1'
  }
}
```

**4. Node.js 运行时（tsc-alias）：**

```bash
npm install -D tsc-alias
```

```json
{
  "scripts": {
    "build": "tsc && tsc-alias"
  }
}
```

**5. TypeScript 5.0+ 的 moduleResolution: "bundler"：**

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**路径映射最佳实践：**

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      // 优先匹配具体的
      "@types": ["src/types/index.ts"],
      // 然后匹配通配符
      "@types/*": ["src/types/*"],
      "@/*": ["src/*"]
    }
  }
}
```

**常见问题：**

1. **编译后路径不变**：需要使用 `tsc-alias` 或 `paths` 插件
2. **IDE 跳转不工作**：确保 tsconfig.json 被正确识别
3. **测试运行失败**：Jest/Vitest 需要配置 moduleNameMapper

**知识点：** `baseUrl` `paths` `模块解析` `别名配置`

:::

---

### Q13: TypeScript 的声明文件（.d.ts）如何编写和发布？

> **🔥 中等 · TypeScript**

请说明如何为 JavaScript 库编写类型声明，以及如何发布到 npm。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**声明文件基础：**

```ts
// 全局声明
declare const VERSION: string
declare function init(options: InitOptions): void

// 命名空间
declare namespace MyApp {
  interface Config {
    debug: boolean
  }
  function create(config: Config): void
}

// 模块声明
declare module "lodash" {
  export function debounce<T extends Function>(fn: T, wait: number): T
  export const version: string
}

// 类声明
declare class EventEmitter {
  on(event: string, fn: Function): this
  emit(event: string, ...args: any[]): boolean
}
```

**为现有 JS 库编写声明：**

```ts
// types/mylib/index.d.ts
declare module "mylib" {
  export interface Options {
    host: string
    port: number
    timeout?: number
  }
  
  export class Client {
    constructor(options: Options)
    connect(): Promise<void>
    disconnect(): void
    request<T>(path: string, data?: any): Promise<T>
  }
  
  export function createClient(options: Options): Client
  export const version: string
  export default Client
}
```

**声明文件组织结构：**

```
types/
├── index.d.ts          # 主入口
├── global.d.ts         # 全局声明
├── modules/
│   ├── api.d.ts
│   └── utils.d.ts
└── lib/
    └── index.d.ts      # 库声明
```

**package.json 配置：**

```json
{
  "name": "mylib",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "typesVersions": {
    "<5.0": { "dist/*": ["dist/ts4/*"] }
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./utils": {
      "types": "./dist/utils.d.ts",
      "import": "./dist/utils.mjs"
    }
  },
  "files": [
    "dist",
    "types"
  ]
}
```

**构建脚本：**

```json
{
  "scripts": {
    "build": "tsc && tsc-alias",
    "build:types": "tsc --emitDeclarationOnly",
    "prepublishOnly": "npm run build && npm test"
  }
}
```

**发布到 DefinitelyTyped：**

```bash
# 1. 克隆 DT 仓库
git clone https://github.com/DefinitelyTyped/DefinitelyTyped.git

# 2. 创建类型目录
mkdir types/mylib

# 3. 编写 index.d.ts 和 mylib-tests.ts

# 4. 运行测试
cd types/mylib
npm install
npm test

# 5. 提交 PR
```

**DT 类型文件结构：**

```ts
// types/mylib/index.d.ts
// Type definitions for mylib 1.0
// Project: https://github.com/user/mylib
// Definitions by: Author Name <https://github.com/author>

declare module "mylib" {
  export interface Config {
    host: string
  }
  export function create(config: Config): void
  export default create
}
```

**最佳实践：**

1. 使用 `declare module` 而不是 `export =`
2. 为泛型提供合理的默认值
3. 提供详细的 JSDoc 注释
4. 包含使用示例
5. 编写类型测试文件

**知识点：** `声明文件` `@types` `DefinitelyTyped` `typesVersions`

:::

---

### Q14: TypeScript 5.x 的新特性有哪些？

> **🔥 困难 · TypeScript**

请列举 TypeScript 5.x 的主要新特性及其使用场景。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**TypeScript 5.0 新特性：**

**1. 支持装饰器（Stage 3）**

```ts
function logged(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value
  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey}`)
    return original.apply(this, args)
  }
}

class UserService {
  @logged
  getUser(id: number) {
    return { id, name: "User" }
  }
}
```

**2. const 类型参数**

```ts
// 5.0 之前
function createTuple<T>(value: T): [T, T] {
  return [value, value]
}
const result = createTuple("hello")  // ["hello", "hello"]

// 5.0+ 使用 const
function createTuple<T>(value: T): readonly [T, T] {
  return [value, value] as const
}
const result = createTuple("hello" as const)  // readonly ["hello", "hello"]
```

**3. 模板字面量类型的改进**

```ts
// 更好的字符串操作类型支持
type Route = `/user/${number}` extends `/user/${infer Id extends number}` 
  ? Id 
  : never
```

**TypeScript 5.1 新特性：**

**4. 泛型类型访问的改进**

```ts
interface Person {
  name: string
  age: number
}

type PersonKeys = keyof Person  // "name" | "age"

// 更好的 infer 支持
type FirstElement<T extends readonly any[]> = 
  T extends [infer First, ...any[]] ? First : never
```

**5. 支持 ESM 中的 --moduleResolution nodenext**

```ts
// package.json
{
  "type": "module"
}

// tsconfig.json
{
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  }
}
```

**TypeScript 5.2 新特性：**

**6. using 声明和显式资源管理**

```ts
// 需要 lib: "ESNext" 或 "ES2023"
{
  using file = openFile("data.txt")
  // file 在块结束时自动关闭
}

// await using 用于异步资源
{
  await using connection = db.connect()
  // 异步清理
}
```

**7. 导入属性（Import Attributes）**

```ts
import config from "./config.json" with { type: "json" }

// 在 tsconfig 中配置
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

**TypeScript 5.3 新特性：**

**8. 导入类型修饰符**

```ts
// 显式标注类型导入
import type { Type } from "module"
import { type Component } from "vue"

// 可以减少循环依赖
```

**9. 更好的路径别名支持**

```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**TypeScript 5.4 新特性：**

**10. NoInfer 工具类型**

```ts
// 防止类型推断
function fn<T>(value: T, callback: (v: NoInfer<T>) => void) {
  // ...
}

// 防止泛型推断过于宽泛
```

**11. Object.groupBy 支持**

```ts
const grouped = Object.groupBy(items, item => item.category)
```

**性能改进：**

- 5.0+: 装饰器性能优化
- 5.1+: 更快的类型检查
- 5.2+: 减少内存占用
- 5.3+: 增量编译优化

**知识点：** `TypeScript 5.x` `装饰器` `ES2023` `新特性`

:::

---

## 总结

本章涵盖了 TypeScript 工程化与配置的核心内容：

- **tsconfig.json**：核心配置项详解
- **strict 模式**：严格类型检查子选项
- **路径别名**：baseUrl 和 paths 配置
- **声明文件**：.d.ts 编写指南
- **项目引用**：大型项目管理与增量编译
- **JSX 配置**：React 项目配置
- **Node.js 配置**：服务端最佳实践
- **isolatedModules**：与构建工具兼容
- **错误抑制**：@ts-ignore 和 @ts-expect-error
- **性能优化**：编译速度优化技巧
- **Project References**：大型 monorepo 组织
- **Path Mapping**：运行时需要配套配置
- **声明文件发布**：为 npm 包编写和发布类型
- **TypeScript 5.x**：新特性与性能改进