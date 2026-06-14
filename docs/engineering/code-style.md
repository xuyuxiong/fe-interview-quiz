---
title: 代码规范
description: ESLint、Prettier、Husky、lint-staged 代码规范面试题
---

# 代码规范

## 面试题

### Q1: ESLint 的工作原理是什么？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

ESLint 基于 AST 工作，流程如下：

1. **解析**：将源码转为 AST（默认使用 Espree 解析器）
2. **遍历**：深度优先遍历 AST 节点
3. **匹配**：将节点与已注册规则匹配，检查违规
4. **报告**：输出错误/警告信息

```js
// 自定义 ESLint 规则
module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: '禁止使用 console' }
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'console'
        ) {
          context.report({
            node,
            message: '不允许使用 console 方法'
          })
        }
      }
    }
  }
}
```

**知识点：** `ESLint` `AST` `visitor 模式` `自定义规则`

:::

### Q2: ESLint 和 Prettier 的区别？如何配合使用？

> **⭐ 简单 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 特性 | ESLint | Prettier |
|------|--------|----------|
| 侧重点 | 代码质量 | 代码风格 |
| 能力 | 发现潜在错误 | 统一格式化 |
| 运行 | 检查 + 自动修复 | 只格式化 |
| 配置 | 规则 (error/warn) | 选项 (printWidth/tabWidth) |

**配合方案：**

```js
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier' // 必须放最后，覆盖前面的格式规则
  ]
}
```

**核心原则：** ESLint 负责质量检查，Prettier 负责格式化，互不干预。

**知识点：** `ESLint` `Prettier` `代码规范` `格式化`

:::

### Q3: Husky + lint-staged 的工作流程是什么？

> **⭐ 简单 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

- **Husky**：Git hooks 管理工具，在 git 操作时触发脚本
- **lint-staged**：只对暂存区文件执行 lint，提升速度

```json
// package.json
{
  "lint-staged": {
    "*.{js,ts}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["stylelint --fix", "prettier --write"],
    "*.md": ["prettier --write"]
  }
}
```

**工作流程：**

```
git commit
  → Husky 触发 pre-commit 钩子
  → lint-staged 检查暂存区文件
  → 通过 → 提交成功
  → 不通过 → 阻止提交，提示错误
```

**知识点：** `Husky` `lint-staged` `Git Hooks` `pre-commit`

:::

### Q4: TypeScript ESLint 有哪些特殊配置？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_'
    }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    'no-unused-vars': 'off'  // 关闭 JS 版本，用 TS 版本
  }
}
```

**关键点：**
- 必须使用 `@typescript-eslint/parser` 解析 TS 语法
- `@typescript-eslint/no-*` 规则替代 JS 版本
- 关闭 JS 的 `no-unused-vars`，开启 TS 版本

**知识点：** `TypeScript ESLint` `parser` `TS 规则` `配置`

:::

### Q5: commitlint 和 Conventional Commits 规范是什么？

> **⭐ 简单 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Conventional Commits 格式：**

```
<type>(<scope>): <subject>

<body>

<footer>
```

常见 type：

| type | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | feat(auth): add login page |
| fix | 修复 bug | fix(api): fix timeout error |
| docs | 文档 | docs: update README |
| style | 格式 | style: format code |
| refactor | 重构 | refactor: extract utils |
| perf | 性能 | perf: optimize render |
| test | 测试 | test: add unit tests |
| chore | 构建/工具 | chore: upgrade deps |

```js
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'chore'
    ]],
    'subject-max-length': [2, 'always', 100]
  }
}
```

**知识点：** `commitlint` `Conventional Commits` `Git 规范`

:::

### Q6: Monorepo 中如何统一管理代码规范？

> **💀 困难 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**方案：抽取共享配置包，各子项目引用**

```
monorepo/
├── packages/
│   ├── eslint-config/
│   ├── prettier-config/
│   ├── tsconfig/
│   ├── app-a/
│   └── app-b/
```

```js
// packages/eslint-config/index.js
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn'
  }
}

// packages/app-a/.eslintrc.js
module.exports = {
  root: true,
  extends: ['@repo/eslint-config'],
  rules: { /* 仅差异配置 */ }
}
```

**知识点：** `Monorepo` `共享配置` `ESLint 包` `代码规范统一`

:::

### Q7: ESLint 的工作原理？自定义规则的编写？

> **🔥 中等 · engineering/code-style**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**ESLint 工作原理：**

```
源码 → Parser → AST → Traverse → Rule Check → Report
       (Espree)        (visitor 模式)
```

**1. 解析阶段**
```javascript
const parser = require('@typescript-eslint/parser');
const ast = parser.parse(code, { ecmaVersion: 2020, sourceType: 'module' });
```

**2. 遍历阶段（visitor 模式）**
```javascript
// ESLint 遍历 AST，对每个节点调用注册的 visitor 函数
visitor: {
  Identifier(node) { ... },
  FunctionDeclaration(node) { ... },
  CallExpression(node) { ... }
}
```

**3. 规则匹配**
```javascript
// 每个规则是一个模块，导出 create 函数
module.exports = {
  meta: {
    type: 'problem',
    docs: { description: '规则说明', category: 'Best Practices' },
    fixable: 'code',
    schema: [] // 规则配置项
  },
  create(context) {
    return {
      // visitor 函数
      CallExpression(node) {
        // 检查逻辑
        if (isViolation(node)) {
          context.report({
            node,
            message: '违规消息',
            fix(fixer) {
              // 自动修复
              return fixer.replaceText(node, 'fixed');
            }
          });
        }
      }
    };
  }
};
```

**自定义规则示例：强制函数最大行数**

```javascript
// max-function-lines.js
module.exports = {
  meta: {
    type: 'suggestion',
    docs: { description: '限制函数最大行数', category: 'Best Practices' },
    schema: [{ type: 'integer', minimum: 1 }] // 配置项
  },
  create(context) {
    const maxLines = context.options[0] || 50; // 默认 50 行
    
    return {
      FunctionDeclaration(node) {
        const sourceCode = context.getSourceCode();
        const lines = sourceCode.getText(node).split('\n').length;
        
        if (lines > maxLines) {
          context.report({
            node,
            message: `函数 "${node.id.name}" 超过最大行数限制 (${lines}/${maxLines})`,
            data: { name: node.id.name, lines, maxLines }
          });
        }
      }
    };
  }
};

// .eslintrc.js
module.exports = {
  rules: {
    'max-function-lines': ['warn', 30] // 超过 30 行警告
  }
}
```

**知识点：** `ESLint` `AST` `visitor 模式` `自定义规则` `代码规范` `自动修复`

:::

### Q8: Prettier 和 ESLint 的冲突如何解决？（eslint-config-prettier）

> **🔥 中等 · engineering/code-style**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**冲突原因：**

ESLint 和 Prettier 都可能格式化代码，导致规则冲突。

```javascript
// ESLint 可能要求
indent: ['error', 2]        // 2 空格缩进
quotes: ['error', 'single'] // 单引号

// Prettier 配置
{
  "tabWidth": 4,           // 4 空格
  "singleQuote": false     // 双引号
}
```

**解决方案 1：eslint-config-prettier（推荐）**

```bash
npm install -D eslint-config-prettier
```

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'  // 必须放最后，覆盖所有格式冲突规则
  ]
};
```

**eslint-config-prettier 做了什么？**

```javascript
// 本质是关闭所有与 Prettier 冲突的 ESLint 规则
module.exports = {
  rules: {
    // 关闭缩进规则
    'indent': 'off',
    '@typescript-eslint/indent': 'off',
    
    // 关闭引号规则
    'quotes': 'off',
    '@typescript-eslint/quotes': 'off',
    
    // 关闭分号规则
    'semi': 'off',
    '@typescript-eslint/semi': 'off',
    
    // ... 等 100+ 条规则
  }
};
```

**解决方案 2：prettier-eslint（不推荐）**

```javascript
// 先运行 Prettier 格式化，再用 ESLint --fix 修复
// 问题：两次处理，速度慢，且可能冲突
```

**最佳实践：**

```javascript
// 1. .eslintrc.js - 只关注代码质量
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'  // 关闭格式规则
  ],
  rules: {
    // 只配置质量相关规则
    'no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'prefer-const': 'error'
  }
};

// 2. .prettierrc - 只关注代码风格
{
  "semi": false,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "all",
  "tabWidth": 2
}

// 3. .editorconfig - 编辑器统一
root = true
[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8

// 4. VS Code settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

**Vue/React 项目配置：**

```javascript
// Vue 项目
module.exports = {
  extends: [
    'plugin:vue/vue3-recommended',
    'prettier'
  ]
};

// React 项目
module.exports = {
  extends: [
    'react-app',
    'prettier'
  ]
};
```

**验证配置是否正确：**

```bash
# ESLint 检查（应该只显示质量错误，不显示格式错误）
npx eslint src/

# Prettier 检查
npx prettier --check src/

# 同时运行
npx eslint src/ && npx prettier --check src/
```

**知识点：** `Prettier` `ESLint` `eslint-config-prettier` `代码规范` `格式化冲突`

:::

### Q9: TypeScript 在代码质量保障中的作用？严格模式有哪些选项？

> **🔥 中等 · engineering/code-style**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**TypeScript 对代码质量的保障：**

| 作用 | 说明 |
|------|------|
| 静态类型检查 | 编译时发现类型错误 |
| 接口文档 | 类型定义即文档 |
| 自动补全 | IDE 智能提示 |
| 重构安全 | 修改类型自动发现影响范围 |
| 减少测试 | 类型错误编译阶段就发现 |

**tsconfig.json 严格模式配置：**

```json
{
  "compilerOptions": {
    // 开启所有严格检查
    "strict": true,
    
    // 或者单独配置
    "noImplicitAny": true,           // 禁止隐式 any
    "strictNullChecks": true,        // 严格 null 检查
    "strictFunctionTypes": true,     // 严格函数类型检查
    "strictBindCallApply": true,     // 严格 bind/call/apply 检查
    "strictPropertyInitialization": true,  // 严格属性初始化检查
    "noImplicitThis": true,          // 禁止隐式 this
    "alwaysStrict": true,            // 使用严格模式
    
    // 其他质量检查
    "noUnusedLocals": true,          // 未使用的局部变量报错
    "noUnusedParameters": true,      // 未使用的参数报错
    "noImplicitReturns": true,       // 函数必须返回所有分支
    "noFallthroughCasesInSwitch": true,  // switch 必须处理所有 case
    "noUncheckedIndexedAccess": true,    // 索引访问可能为 undefined
    "noPropertyAccessFromIndexSignature": true,  // 强制使用索引签名
    "exactOptionalPropertyTypes": true     // 可选属性不能为 undefined
  }
}
```

**严格模式选项详解：**

```typescript
// 1. noImplicitAny
let x;           // ❌ 错误：隐式 any
let x: unknown;  // ✅ 正确

// 2. strictNullChecks
let name: string;
name = null;     // ❌ 错误

let name: string | null;
name = null;     // ✅ 正确

// 3. strictPropertyInitialization
class User {
  name: string;  // ❌ 错误：属性未初始化
}

class User {
  name: string = '';  // ✅ 正确
  constructor(name: string) { this.name = name; }  // ✅ 正确
}

// 4. noUncheckedIndexedAccess
const arr: string[] = ['a', 'b'];
const first = arr[0];  // 类型：string | undefined

// 5. noImplicitReturns
function getStatus(code: number): string {
  if (code === 200) return 'OK';
  if (code === 404) return 'Not Found';
  // ❌ 错误：不是所有路径都有返回值
}

function getStatus(code: number): string {
  if (code === 200) return 'OK';
  if (code === 404) return 'Not Found';
  return 'Unknown';  // ✅ 正确
}
```

**配合 ESLint 使用：**

```javascript
// .eslintrc.js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/strict',  // TS 严格规则
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error'
  }
};
```

**渐进式严格模式：**

```json
{
  "compilerOptions": {
    // 第一阶段：基础检查
    "noImplicitAny": true,
    "strictNullChecks": true,
    
    // 第二阶段：添加更多检查
    // "strictFunctionTypes": true,
    // "noUnusedLocals": true,
    
    // 第三阶段：完全严格
    // "strict": true
  },
  // 对旧文件放宽要求
  "exclude": ["src/legacy/**/*"]
}
```

**知识点：** `TypeScript` `严格模式` `类型检查` `代码质量` `tsconfig` `static analysis`

:::