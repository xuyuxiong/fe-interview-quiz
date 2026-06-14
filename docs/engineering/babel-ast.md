---
title: Babel 与 AST
description: Babel 编译流程、AST 抽象语法树、插件开发面试题
---

# Babel 与 AST

## 面试题

### Q1: Babel 的编译流程分为哪几个阶段？

> **⭐ 简单 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**三阶段流程：**

1. **Parse（解析）**：将源码字符串转为 AST（@babel/parser）
2. **Transform（转换）**：遍历并修改 AST（@babel/traverse + 插件）
3. **Generate（生成）**：将 AST 转回代码字符串（@babel/generator）

```
源码 → Parse → AST → Transform → 新AST → Generate → 目标代码
```

```js
const babel = require('@babel/core')
const result = babel.transformSync('const fn = () => 1', {
  presets: ['@babel/preset-env']
})
// 输出: "var fn = function fn() { return 1; }"
```

**知识点：** `Babel` `Parse` `Transform` `Generate` `编译流程`

:::

### Q2: 什么是 AST？常见的节点类型有哪些？

> **⭐ 简单 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

AST（Abstract Syntax Tree）是源代码的树状结构表示，每个节点代表一个语法结构。

**常见节点类型：**

| 节点类型 | 说明 | 示例 |
|---------|------|------|
| Program | 程序根节点 | 整个文件 |
| ExpressionStatement | 表达式语句 | `a = 1` |
| Identifier | 标识符 | 变量名/函数名 |
| Literal | 字面量 | `1` / `"str"` |
| FunctionDeclaration | 函数声明 | `function fn(){}` |
| VariableDeclaration | 变量声明 | `const a = 1` |
| CallExpression | 函数调用 | `fn()` |
| MemberExpression | 成员访问 | `obj.prop` |
| ArrowFunctionExpression | 箭头函数 | `() => {}` |
| BinaryExpression | 二元运算 | `a + b` |

可通过 [astexplorer.net](https://astexplorer.net) 在线查看 AST 结构。

**知识点：** `AST` `节点类型` `语法树` `astexplorer`

:::

### Q3: 如何编写一个 Babel 插件？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

Babel 插件是返回 visitor 对象的函数：

```js
module.exports = function(babel) {
  const { types: t } = babel

  return {
    name: 'my-babel-plugin',
    visitor: {
      // 访问 BinaryExpression 节点
      BinaryExpression(path) {
        if (path.node.operator === '===') {
          path.node.operator = '==' // 将 === 替换为 ==
        }
      },
      // 访问函数调用
      CallExpression(path) {
        // 删除所有 console.log
        const callee = path.node.callee
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object, { name: 'console' })
        ) {
          path.remove()
        }
      }
    }
  }
}
```

**核心概念：**
- **visitor**：定义要访问的节点类型
- **path**：节点路径对象，包含节点信息和操作方法（replaceWith/remove/insertBefore等）
- **types(t)**：AST 节点构造和判断工具库

**知识点：** `Babel插件` `visitor` `path` `types`

:::

### Q4: @babel/preset-env 和 polyfill 的关系是什么？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

- **preset-env**：语法转换插件集合（箭头函数→function、let→var等）
- **polyfill**：API 补丁（Promise/Set/Array.includes 等新 API 的实现）

```js
// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: '> 0.5%, not dead',
      useBuiltIns: 'usage',  // 按需引入 polyfill
      corejs: 3              // core-js 版本
    }]
  ]
}
```

| useBuiltIns | 说明 | 体积 |
|------------|------|------|
| false | 不自动引入 polyfill | 最小 |
| entry | 入口全量引入 | 最大 |
| usage | 按需引入（推荐） | 适中 |

**preset-env vs transform-runtime：**

| 特性 | preset-env + corejs | transform-runtime |
|------|-------------------|------------------|
| 作用域 | 全局污染 | 沙箱隔离 |
| 适用场景 | 应用开发 | 库开发 |
| helper | 内联重复 | 统一引用去重 |

**知识点：** `preset-env` `polyfill` `core-js` `transform-runtime` `useBuiltIns`

:::

### Q5: Babel、SWC、esbuild 性能对比如何？

> **⭐ 简单 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 工具 | 语言 | 速度 | 生态 | 兼容性 |
|------|------|------|------|--------|
| Babel | JavaScript | 1x（基准） | 最全 | 最全 |
| SWC | Rust | 20x+ | 逐步完善 | 大部分 |
| esbuild | Go | 100x+ | 基础功能 | 基础 |

**SWC 优势：**
- Rust 编写，性能极强
- Next.js 13+ 默认使用
- 兼容大部分 Babel 插件

**esbuild 优势：**
- Go 编写，速度最快
- Vite 预构建核心引擎
- 仅支持语法转换，不支持自定义插件生态

**选型建议：**
- 新项目 → SWC（Next.js）/ esbuild（Vite）
- 旧项目 → Babel（渐进迁移）
- 库开发 → Babel（生态最全）

**知识点：** `SWC` `esbuild` `Babel性能` `编译器对比`

:::

### Q6: AST 在前端有哪些实际应用？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

AST 是前端工程化的基础设施：

1. **代码检查**：ESLint 遍历 AST 检查规则
2. **代码格式化**：Prettier 解析 AST 后按规则重构
3. **代码压缩**：Terser 基于 AST 删除空白、缩短变量名
4. **国际化 i18n**：扫描 AST 自动提取/替换中文文案
5. **自动注入**：import 自动引入、埋点注入
6. **类型检查**：TypeScript 将 TS 转为 AST 后类型推导
7. **框架编译**：Vue SFC 编译、JSX 转换

```js
// 实战：自动删除 console.log 的 Babel 插件
module.exports = function({ types: t }) {
  return {
    visitor: {
      CallExpression(path) {
        const callee = path.node.callee
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object, { name: 'console' }) &&
          t.isIdentifier(callee.property, { name: 'log' })
        ) {
          path.remove()
        }
      }
    }
  }
}
```

**知识点：** `AST应用` `ESLint` `Prettier` `i18n` `代码压缩`

:::

### Q7: 如何优化 Babel 编译性能？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

1. **缩小编译范围**：`exclude: /node_modules/`
2. **缓存编译结果**：`cacheDirectory: true`
3. **使用 SWC/esbuild 替代**：速度提升 20-100x
4. **按需引入 polyfill**：`useBuiltIns: 'usage'`
5. **减少 preset/plugins 数量**
6. **并行编译**：thread-loader 多线程处理

```js
// webpack babel-loader 优化配置
module.exports = {
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,           // 排除 node_modules
      use: {
        loader: 'babel-loader',
        options: {
          cacheDirectory: true,            // 开启缓存
          cacheCompression: false           // 关闭缓存压缩（更快）
        }
      }
    }]
  }
}
```

**Vite 中的替代方案：**

```js
// vite.config.ts - 使用 SWC 替代 Babel
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc' // SWC 替代 babel

export default defineConfig({
  plugins: [react()]
})
```

**知识点：** `Babel优化` `缓存` `SWC替代` `编译性能`

:::

### Q8: @babel/plugin-transform-runtime 的作用是什么？

> **💀 困难 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

解决两个核心问题：

**1. 避免 helper 函数重复注入：**

```js
// 没有 transform-runtime：每个文件内联 helper
function _classCallCheck(instance, Constructor) { ... } // 文件A
function _classCallCheck(instance, Constructor) { ... } // 文件B（重复！）

// 有 transform-runtime：统一从 @babel/runtime 引入
import _classCallCheck from '@babel/runtime/helpers/classCallCheck' // 只有一份
```

**2. 不污染全局的 polyfill：**

```js
// preset-env + corejs：全局修改
Array.prototype.includes = function() { ... }  // 污染全局

// transform-runtime + corejs：沙箱方式
import _includes from '@babel/runtime-corejs3/core-js/array/includes'
// 不修改全局原型
```

| 场景 | 推荐方案 | 原因 |
|------|----------|------|
| 应用开发 | preset-env + corejs | 全局 polyfill，体积更优 |
| 库开发 | transform-runtime | 沙箱隔离，不影响宿主环境 |

**知识点：** `transform-runtime` `helper去重` `沙箱polyfill` `库开发`

:::
### Q9: Babel 的编译流程（parse → transform → generate）

> **🔥 中等 · engineering/babel-ast**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Babel 编译三阶段流程：**

```
源码字符串 → Parse → AST → Transform → 新 AST → Generate → 目标代码字符串
```

**1. Parse（解析阶段）：**

```javascript
const parser = require('@babel/parser');
const code = 'const fn = () => 1';

// 将源码转为 AST
const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript']
});

console.log(JSON.stringify(ast, null, 2));
/*
{
  "type": "Program",
  "body": [{
    "type": "VariableDeclaration",
    "declarations": [{
      "type": "VariableDeclarator",
      "id": { "type": "Identifier", "name": "fn" },
      "init": {
        "type": "ArrowFunctionExpression",
        "params": [],
        "body": { "type": "NumericLiteral", "value": 1 }
      }
    }]
  }]
}
*/
```

**2. Transform（转换阶段）：**

```javascript
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');

traverse(ast, {
  // 访问 ArrowFunctionExpression 节点
  ArrowFunctionExpression(path) {
    // 将箭头函数转换为普通函数
    path.replaceWith(t.functionExpression(null, [], path.node.body));
  },
  
  // 访问 VariableDeclaration 节点
  VariableDeclaration(path) {
    if (path.node.kind === 'const') {
      path.node.kind = 'var'; // const → var
    }
  }
});
```

**3. Generate（生成阶段）：**

```javascript
const generate = require('@babel/generator').default;

const output = generate(ast, {
  sourceMaps: true,
  sourceFileName: 'input.js',
  compact: false,
  comments: true
}, code);

console.log(output.code);
// 输出："var fn = function() { return 1; }"
```

**完整 Babel 编译流程示例：**

```javascript
const babel = require('@babel/core');

const result = babel.transformSync('const fn = () => 1', {
  presets: ['@babel/preset-env'],
  sourceMaps: true,
  filename: 'input.js'
});

console.log(result.code);
// 输出转译后的 ES5 代码
console.log(result.map); // SourceMap
```

**知识点：** `Babel` `Parse` `Transform` `Generate` `编译流程` `@babel/parser` `@babel/traverse` `@babel/generator`

:::

### Q10: AST 是什么？常用 AST 节点类型？如何用 AST 做代码转换？

> **🔥 中等 · engineering/babel-ast**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**AST（Abstract Syntax Tree）抽象语法树：**

AST 是源代码的树状结构表示，每个节点代表一个语法结构。它是编译器/解释器的中间表示形式。

**如何查看 AST：**

- 在线工具：[astexplorer.net](https://astexplorer.net)
- 本地解析：`@babel/parser.parse(code)`

**常用 AST 节点类型：**

| 节点类型 | 说明 | 示例 |
|---------|------|------|
| `Program` | 程序根节点 | 整个文件 |
| `ExpressionStatement` | 表达式语句 | `a = 1` |
| `Identifier` | 标识符 | 变量名/函数名 `foo` |
| `Literal` / `StringLiteral` | 字面量 | `"str"` / `1` |
| `FunctionDeclaration` | 函数声明 | `function fn(){}` |
| `VariableDeclaration` | 变量声明 | `const a = 1` |
| `CallExpression` | 函数调用 | `fn()` |
| `MemberExpression` | 成员访问 | `obj.prop` |
| `ArrowFunctionExpression` | 箭头函数 | `() => {}` |
| `BinaryExpression` | 二元运算 | `a + b` |
| `ObjectExpression` | 对象字面量 | `{ a: 1 }` |
| `ArrayExpression` | 数组字面量 | `[1, 2]` |
| `IfStatement` | if 语句 | `if (cond) {}` |
| `ReturnStatement` | return 语句 | `return x` |
| `JSXElement` | JSX 元素 | `<div />` |

**用 AST 做代码转换示例：删除所有 console.log**

```javascript
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const code = `
console.log('hello');
const x = 1;
console.error('error');
`;

// 1. Parse
const ast = parser.parse(code);

// 2. Transform
traverse(ast, {
  CallExpression(path) {
    const callee = path.node.callee;
    
    // 匹配 console.log / console.error 等
    if (
      t.isMemberExpression(callee) &&
      t.isIdentifier(callee.object, { name: 'console' })
    ) {
      path.remove(); // 删除整个调用语句
    }
  }
});

// 3. Generate
const output = generate(ast, {}, code);

console.log(output.code);
/*
const x = 1;
*/
```

**实战：自动注入埋点**

```javascript
traverse(ast, {
  CallExpression(path) {
    const callee = path.node.callee;
    
    // 匹配特定的 API 调用
    if (
      t.isMemberExpression(callee) &&
      t.isIdentifier(callee.object, { name: 'api' }) &&
      t.isIdentifier(callee.property, { name: 'fetch' })
    ) {
      // 在调用前注入埋点
      const trackCall = t.callExpression(
        t.identifier('track'),
        [t.stringLiteral('api_call')]
      );
      path.insertBefore(t.expressionStatement(trackCall));
    }
  }
});
```

**知识点：** `AST` `抽象语法树` `节点类型` `代码转换` `@babel/types` `traverse` `astexplorer`

:::

### Q11: Babel 插件的编写？visitor 模式的工作原理？

> **💀 困难 · engineering/babel-ast**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Babel 插件本质：** 返回 visitor 对象的函数。

**基本结构：**

```javascript
// my-babel-plugin.js
module.exports = function(babel) {
  const { types: t } = babel;
  
  return {
    name: 'my-babel-plugin', // 插件名称
    visitor: {
      // 访问特定类型的节点
      BinaryExpression(path) {
        // 将 === 替换为 ==
        if (path.node.operator === '===') {
          path.node.operator = '==';
        }
      },
      
      // 访问函数调用
      CallExpression(path) {
        const callee = path.node.callee;
        
        // 删除 console.log
        if (
          t.isMemberExpression(callee) &&
          t.isIdentifier(callee.object, { name: 'console' }) &&
          t.isIdentifier(callee.property, { name: 'log' })
        ) {
          path.remove();
        }
      },
      
      // 进入和离开节点时分别处理
      FunctionDeclaration: {
        enter(path) {
          console.log('进入函数声明:', path.node.id.name);
        },
        exit(path) {
          console.log('离开函数声明:', path.node.id.name);
        }
      }
    }
  };
};
```

**Visitor 模式工作原理：**

```text
Visitor 模式是一种访问/操作 AST 的标准方式：

1. Babel 遍历 AST（深度优先）
2. 对于每个节点，检查 visitor 对象中是否有对应类型的处理函数
3. 如果有，调用该函数，传入 path 对象
4. 可以继续遍历子节点，或修改/替换/删除当前节点

遍历顺序：
Program
  → VariableDeclaration
    → VariableDeclarator
      → Identifier (id)
      → ArrowFunctionExpression (init)
        → Identifier (params)
        → NumericLiteral (body)
```

**Path 对象常用 API：**

```javascript
visitor: {
  CallExpression(path) {
    // 获取节点
    const node = path.node;
    
    // 替换节点
    path.replaceWith(t.identifier('newFunction'));
    
    // 删除节点
    path.remove();
    
    // 在之前插入
    path.insertBefore(t.expressionStatement(t.callExpression(...)));
    
    // 在之后插入
    path.insertAfter(t.expressionStatement(t.callExpression(...)));
    
    // 遍历子节点
    path.traverse({
      Identifier(childPath) {
        console.log(childPath.node.name);
      }
    });
    
    // 停止遍历子节点
    path.stop();
    
    // 跳过当前节点的剩余遍历
    path.skip();
    
    // 获取父节点
    const parent = path.parent;
    const parentPath = path.parentPath;
    
    // 判断节点类型
    if (path.isIdentifier({ name: 'foo' })) {
      // 是名为 foo 的标识符
    }
  }
};
```

**带配置的插件：**

```javascript
module.exports = function(babel, options) {
  const { types: t } = babel;
  const prefix = options.prefix || 'auto_';
  
  return {
    name: 'auto-prefix-plugin',
    visitor: {
      Identifier(path) {
        // 给所有变量名加前缀
        path.node.name = prefix + path.node.name;
      }
    }
  };
};

// 使用：
// { plugins: [['auto-prefix-plugin', { prefix: 'my_' }]] }
```

**实战：将 require 转为 import**

```javascript
module.exports = function(babel) {
  const { types: t } = babel;
  
  return {
    visitor: {
      CallExpression(path) {
        const { callee } = path.node;
        
        // 匹配 require() 调用
        if (
          t.isIdentifier(callee, { name: 'require' }) &&
          path.node.arguments.length === 1 &&
          t.isStringLiteral(path.node.arguments[0])
        ) {
          const source = path.node.arguments[0].value;
          const importDecl = t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier('module'))],
            t.stringLiteral(source)
          );
          
          // 用 import 声明替换 require 表达式所在的语句
          path.parentPath.replaceWith(importDecl);
        }
      }
    }
  };
};

// 输入：const mod = require('./module');
// 输出：import module from './module';
```

**知识点：** `Babel 插件` `visitor 模式` `path` `@babel/types` `AST 遍历` `插件编写`

:::
