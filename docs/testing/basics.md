---
title: 前端测试基础
description: 测试类型、Jest 核心 API、Mock、覆盖率等前端测试面试题
---

# 前端测试基础

## 面试题

### Q1: 前端测试有哪些类型？分别解决什么问题？

> **⭐ 简单 · 测试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 测试类型 | 范围 | 速度 | 数量 | 工具 |
|---------|------|------|------|------|
| 单元测试 | 函数/组件 | 毫秒 | 多 | Jest/Vitest |
| 集成测试 | 模块组合 | 秒级 | 中 | Testing Library |
| E2E 测试 | 完整流程 | 分钟 | 少 | Cypress/Playwright |
| 快照测试 | UI 结构 | 毫秒 | 中 | Jest |
| 静态测试 | 类型/语法 | 即时 | 全覆盖 | TypeScript/ESLint |

**测试金字塔原则：** 单元测试最多（快速、稳定），E2E 测试最少（慢、脆弱）。

```text
        /  E2E  \          ← 少、慢、脆弱
       / 集成测试 \         ← 适中
      /  单元测试   \       ← 多、快、稳定
     /_______________\
```

**知识点：** `测试金字塔` `单元测试` `集成测试` `E2E测试`

:::

### Q2: Jest 的核心 API 有哪些？如何使用？

> **⭐ 简单 · 测试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 1. describe/it/test - 组织测试
describe('Array', () => {
  it('should push element', () => {
    const arr = []
    arr.push(1)
    expect(arr).toHaveLength(1)
  })
})

// 2. expect - 断言
expect(value).toBe(1)              // 严格相等 ===
expect(obj).toEqual({ a: 1 })      // 深度相等
expect(arr).toContain(1)            // 包含
expect(fn).toThrow()                // 抛出异常
expect(value).toBeTruthy()          // 真值
expect(value).toBeNull()            // null
expect(value).toBeUndefined()       // undefined
expect(value).toBeDefined()         // 已定义
expect(value).toMatch(/pattern/)    // 正则匹配

// 3. 生命周期
beforeAll(() => { /* 所有测试前执行一次 */ })
afterAll(() => { /* 所有测试后执行一次 */ })
beforeEach(() => { /* 每个测试前执行 */ })
afterEach(() => { /* 每个测试后执行 */ })

// 4. 异步测试
it('async test', async () => {
  const data = await fetchData()
  expect(data).toBe('ok')
})

// 5. 参数化测试
test.each([[1, 1, 2], [2, 3, 5], [3, 5, 8]])(
  'add(%i, %i) = %i',
  (a, b, expected) => {
    expect(add(a, b)).toBe(expected)
  }
)
```

**知识点：** `Jest` `describe` `expect` `生命周期` `参数化测试`

:::

### Q3: Mock、Stub、Spy 有什么区别？

> **🔥 中等 · 测试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 概念 | 说明 | 验证内容 | Jest API |
|------|------|----------|----------|
| Stub | 替换函数返回值 | 不验证调用 | jest.fn().mockReturnValue() |
| Spy | 监听函数调用 | 验证调用次数/参数 | jest.spyOn() |
| Mock | 替换整个模块 | 验证行为+返回值 | jest.mock() |

```js
// Stub - 替换返回值
const getUser = jest.fn().mockReturnValue({ name: 'test' })

// Spy - 监听调用
const spy = jest.spyOn(console, 'log')
doSomething()
expect(spy).toHaveBeenCalledWith('hello')
spy.mockRestore() // 恢复原始实现

// Mock - 替换模块
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: { id: 1 } })
}))

// jest.mock 自动提升到文件顶部
// jest.mock 替换整个模块的所有导出
```

**使用场景：**
- **Stub**：只需要返回特定值（数据库查询、API 响应）
- **Spy**：需要验证函数是否被调用、调用参数
- **Mock**：需要完全控制模块行为（axios、localStorage）

**知识点：** `Mock` `Stub` `Spy` `jest.fn` `jest.spyOn` `jest.mock`

:::

### Q4: 如何测试 React 组件？

> **🔥 中等 · 测试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React Testing Library 原则：** 测试用户行为，而非实现细节。

```js
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Login from './Login'

describe('Login', () => {
  it('should submit form', async () => {
    const onSubmit = jest.fn()
    render(<Login onSubmit={onSubmit} />)

    // 模拟用户输入
    await userEvent.type(screen.getByLabelText('用户名'), 'admin')
    await userEvent.type(screen.getByLabelText('密码'), '123456')

    // 点击提交
    await userEvent.click(screen.getByRole('button', { name: '登录' }))

    // 验证
    expect(onSubmit).toHaveBeenCalledWith({
      username: 'admin',
      password: '123456'
    })
  })

  it('should show error on empty input', async () => {
    render(<Login />)

    await userEvent.click(screen.getByRole('button', { name: '登录' }))

    expect(screen.getByText('请输入用户名')).toBeInTheDocument()
  })
})
```

**查询优先级：**
1. `getByRole` - 最推荐（可访问性）
2. `getByLabelText` - 表单元素
3. `getByText` - 文本内容
4. `getByTestId` - 最后手段

**知识点：** `React Testing Library` `userEvent` `getByRole` `测试用户行为`

:::

### Q5: TDD 和 BDD 有什么区别？

> **🔥 中等 · 测试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 特性 | TDD | BDD |
|------|-----|-----|
| 全称 | Test-Driven Development | Behavior-Driven Development |
| 关注点 | 代码正确性 | 业务行为 |
| 编写者 | 开发者 | 开发者+QA+产品 |
| 表达方式 | 技术语言 | 自然语言 |
| 流程 | Red→Green→Refactor | Given→When→Then |
| 工具 | Jest/Vitest | Cucumber/Jest+describe |

**TDD 流程：**

```
Red（写失败的测试）→ Green（写最少代码让测试通过）→ Refactor（重构）
```

**BDD 示例：**

```gherkin
Given 用户在登录页面
When 用户输入正确的用户名和密码并点击登录
Then 页面跳转到首页并显示欢迎信息
```

```js
// 对应的 Jest 测试
describe('用户登录', () => {
  it('输入正确凭据后跳转首页', async () => {
    // Given
    render(<LoginPage />)

    // When
    await userEvent.type(screen.getByLabelText('用户名'), 'admin')
    await userEvent.type(screen.getByLabelText('密码'), '123456')
    await userEvent.click(screen.getByText('登录'))

    // Then
    await waitFor(() => {
      expect(screen.getByText('欢迎回来')).toBeInTheDocument()
    })
  })
})
```

**知识点：** `TDD` `BDD` `Red-Green-Refactor` `Given-When-Then`

:::

### Q6: 什么是快照测试？有什么局限性？

> **⭐ 简单 · 测试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**快照测试：** 捕获组件渲染输出，后续运行时对比是否变化。

```js
import { render } from '@testing-library/react'
import Button from './Button'

it('renders correctly', () => {
  const { container } = render(<Button>Click</Button>)
  expect(container).toMatchSnapshot()
})

// 首次运行生成 __snapshots__/Button.test.snap
// 后续运行对比，如果输出变化则测试失败
// 变更是预期行为时：jest --updateSnapshot
```

**局限性：**
1. **伪阳性**：输出变化但功能正确，快照仍报错
2. **伪阴性**：输出不变但行为变化，快照不报错
3. **大快照无意义**：几百行快照很难 review
4. **维护成本**：频繁更新快照

**最佳实践：**
- 快照只用于**纯展示组件**
- 使用 `toMatchInlineSnapshot()` 让快照内联
- 快照保持**小而精**

**知识点：** `快照测试` `toMatchSnapshot` `InlineSnapshot`

:::

### Q7: 测试覆盖率是什么？如何设置门槛？

> **🔥 中等 · 测试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**覆盖率维度：**

| 维度 | 说明 |
|------|------|
| 行覆盖率 (Lines) | 执行到的代码行 |
| 分支覆盖率 (Branches) | if/else 各分支 |
| 函数覆盖率 (Functions) | 被调用的函数 |
| 语句覆盖率 (Statements) | 执行到的语句 |

```json
// jest.config.json
{
  "collectCoverageFrom": [
    "src/**/*.{js,ts,jsx,tsx}",
    "!src/**/*.d.ts",
    "!src/main.tsx"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    },
    "./src/utils/": {
      "branches": 90,
      "functions": 90,
      "lines": 90
    }
  }
}
```

```bash
# 运行覆盖率
npx jest --coverage

# CI 中覆盖率低于门槛则构建失败
npx jest --coverage --ci
```

**注意：** 高覆盖率 ≠ 高质量，100% 覆盖不代表测试了所有边界情况。

**知识点：** `测试覆盖率` `coverageThreshold` `行覆盖率` `分支覆盖率`

:::

### Q8: 前端测试有哪些常见痛点？如何解决？

> **💀 困难 · 测试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 痛点 | 原因 | 解决方案 |
|------|------|----------|
| 测试不稳定 | 定时器/异步/网络 | 使用 fake timers, mock 网络 |
| Mock 地狱 | 过度 mock 导致测试脆弱 | mock 最小化，优先 mock 边界 |
| 测试太慢 | 大量 E2E/低效测试 | 分层测试，用 Vitest 提升 |
| 测试难以维护 | 过度耦合实现细节 | 测试行为不测实现 |
| 组件测试困难 | Context/Router/Store 依赖 | 自定义 render 包装 Provider |

**解决方案：**

```js
// 1. 自定义 render 包装 Provider
function renderWithProviders(ui, options) {
  return render(ui, {
    wrapper: ({ children }) => (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    ),
    ...options
  })
}

// 2. MSW mock API（替代 jest.mock(axios)）
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.get('/api/user', (req, res, ctx) => {
    return res(ctx.json({ name: 'test' }))
  })
)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// 3. fake timers 处理定时器
jest.useFakeTimers()
jest.advanceTimersByTime(5000)
jest.useRealTimers()
```

**知识点：** `测试痛点` `MSW` `fakeTimers` `自定义render` `Mock最小化`

:::
---

> **🔥 中等 · 异步代码测试**

### Q9: 如何测试异步代码？Promise/setTimeout/async-await？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Promise 测试：**
```js
// 测试返回的 Promise
it('should fetch data', async () => {
  const data = await fetchData()
  expect(data).toEqual({ id: 1, name: 'test' })
})

// 测试 Promise resolve
it('should resolve with data', () => {
  return fetchData().then(data => {
    expect(data).toEqual({ id: 1 })
  })
})

// 测试 Promise reject
it('should reject on error', async () => {
  await expect(fetchDataWithError()).rejects.toThrow('Network error')
})
```

**async/await 测试：**
```js
// 标准异步测试
it('should work with async/await', async () => {
  const result = await asyncFunction()
  expect(result).toBe('expected')
})

// 多个异步操作
it('should handle multiple async operations', async () => {
  const [user, posts] = await Promise.all([
    fetchUser(),
    fetchPosts()
  ])
  expect(user).toBeDefined()
  expect(posts).toHaveLength(5)
})
```

**setTimeout 测试（使用 fake timers）：**
```js
beforeEach(() => {
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

it('should call callback after delay', () => {
  const callback = jest.fn()
  setTimeout(callback, 1000)
  
  // 此时 callback 还未被调用
  expect(callback).not.toHaveBeenCalled()
  
  // 快进时间
  jest.advanceTimersByTime(1000)
  
  expect(callback).toHaveBeenCalledTimes(1)
})

it('should work with async fake timers', async () => {
  jest.useFakeTimers({ advanceTimers: true })
  
  const promise = delayedFunction(1000)
  
  // 等待 timer 完成
  await promise
  
  // 断言
  expect(/* ... */)
})
```

**测试防抖/节流函数：**
```js
it('should debounce function', () => {
  jest.useFakeTimers()
  const debouncedFn = jest.fn()
  
  // 连续调用多次
  debouncedFn()
  debouncedFn()
  debouncedFn()
  
  // 此时还未执行
  expect(debouncedFn).not.toHaveBeenCalled()
  
  // 快进到等待时间后
  jest.advanceTimersByTime(300)
  
  // 只执行了一次
  expect(debouncedFn).toHaveBeenCalledTimes(1)
})
```

**测试轮询/重试逻辑：**
```js
it('should retry on failure', async () => {
  jest.useFakeTimers()
  const mockFetch = jest.fn()
    .mockRejectedValueOnce(new Error('Network error'))
    .mockRejectedValueOnce(new Error('Network error'))
    .mockResolvedValueOnce({ data: 'success' })
  
  const promise = retryFetch(mockFetch, { retries: 3 })
  
  // 快进时间让重试完成
  jest.advanceTimersByTime(5000)
  
  const result = await promise
  expect(result).toEqual({ data: 'success' })
  expect(mockFetch).toHaveBeenCalledTimes(3)
})
```

**注意事项：**
- 异步测试必须返回 Promise 或使用 async/await
- fake timers 需要在测试前后正确清理
- 避免测试中使用真实定时器（测试会变慢且不可靠）

**知识点：** `异步测试` `Promise` `fake timers` `防抖节流`

:::

---

> **🔥 中等 · 测试替身**

### Q10: 什么是测试替身（Test Double）？有哪些类型？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**测试替身（Test Double）：** 在测试中替代真实对象的对象，用于隔离被测代码。

**五种类型（按复杂度递增）：**

| 类型 | 目的 | Jest API | 示例 |
|------|------|----------|------|
| **Dummy** | 占位，不使用 | `null` / `{}` | 不关心的参数 |
| **Fake** | 简单实现，不用于生产 | 手动实现 | 内存数据库 |
| **Stub** | 提供预设返回值 | `jest.fn().mockReturnValue()` | mock API 响应 |
| **Spy** | 监听函数调用 | `jest.spyOn()` | 验证方法被调用 |
| **Mock** | 预设行为 + 验证 | `jest.mock()` + expect | 完整模块替换 |

**Dummy（哑对象）：**
```js
// 只是占位，不会被使用
const dummyUser = { id: 1, name: 'dummy' }
createUser(dummyUser) // dummyUser 只是占位
```

**Fake（伪对象）：**
```js
// 简单的内存实现，用于测试
class FakeDatabase {
  constructor() {
    this.data = new Map()
  }
  save(key, value) {
    this.data.set(key, value)
  }
  find(key) {
    return this.data.get(key)
  }
}

// 测试中使用
const db = new FakeDatabase()
userService.saveUser(db, user)
```

**Stub（桩）：**
```js
// 提供预设的返回值
const getUserStub = jest.fn().mockReturnValue({ id: 1, name: 'test' })

// 按参数返回不同值
getProductStub.mockImplementation((id) => {
  if (id === 1) return { name: 'Product 1' }
  if (id === 2) return { name: 'Product 2' }
  return null
})

// 链式调用
userService.getUser = getUserStub
```

**Spy（间谍）：**
```js
// 监听真实函数的调用
const spy = jest.spyOn(console, 'log')

doSomething()

expect(spy).toHaveBeenCalledWith('hello')
expect(spy).toHaveBeenCalledTimes(1)

// 恢复原始实现
spy.mockRestore()

// 监听对象方法
const obj = { method: () => 'original' }
const spy = jest.spyOn(obj, 'method')
obj.method()
expect(spy).toHaveBeenCalled()
```

**Mock（模拟）：**
```js
// 完整替换模块
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({ data: { id: 1 } }),
  post: jest.fn().mockResolvedValue({ data: { success: true } })
}))

// 测试中验证行为
await api.createUser(data)
expect(axios.post).toHaveBeenCalledWith('/users', data)
```

**选择指南：**

```
只需要返回值？ → Stub
需要验证调用？ → Spy
需要完整控制模块？ → Mock
需要简单可工作的实现？ → Fake
只是占位？ → Dummy
```

**使用原则：**
1. **最小化 mock**：只 mock 必要的依赖
2. **mock 边界不 mock 内部**：mock API、数据库等外部依赖
3. **不要 mock 你拥有的代码**：优先测试真实实现

**知识点：** `测试替身` `Stub` `Spy` `Mock` `Fake`

:::

---

> **🔥 中等 · 测试环境搭建**

### Q11: 前端项目如何设置测试？从零搭建测试环境？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**从零搭建测试环境步骤：**

**Step 1: 选择测试框架**
```bash
# React/Vue 项目推荐 Vitest（Vite 项目）或 Jest
npm install -D vitest @testing-library/react @testing-library/jest-dom

# 或
npm install -D jest @testing-library/react @testing-library/jest-dom
```

**Step 2: 配置测试框架**

**Vitest 配置（vite.config.ts）：**
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
```

**Jest 配置（jest.config.js）：**
```js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  coverage: {
    collectCoverageFrom: [
      'src/**/*.{js,ts,jsx,tsx}',
      '!src/**/*.d.ts',
      '!src/main.tsx'
    ]
  }
}
```

**Step 3: 设置测试工具**
```ts
// src/test/setup.ts
import '@testing-library/jest-dom'

// 全局 mock
global.fetch = jest.fn()
```

**Step 4: 安装类型定义**
```bash
npm install -D @types/jest @testing-library/react
```

**Step 5: 配置 npm scripts**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:ci": "vitest run --coverage --ci"
  }
}
```

**Step 6: 创建测试文件**
```ts
// src/components/Button/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Button from './Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click')
  })

  it('calls onClick when clicked', async () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Click</Button>)
    
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

**Step 7: 配置 CI**
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test -- --coverage --ci
```

**推荐目录结构：**
```
src/
  components/
    Button/
      Button.tsx
      Button.test.tsx      # 组件测试
  hooks/
    useCounter/
      useCounter.ts
      useCounter.test.ts   # Hook 测试
  utils/
    format.ts
    format.test.ts         # 工具函数测试
  test/
    setup.ts               # 测试配置
    mock.ts                # 全局 mock
    utils.tsx              # 测试工具函数
```

**知识点：** `测试环境` `Vitest` `Jest` `Testing Library` `CI 配置`

:::

---

> **⭐ 简单 · TDD 红绿重构**

### Q12: 测试驱动开发（TDD）的红 - 绿 - 重构循环是什么？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**TDD 三步骤：**

```
Red（红） → Green（绿） → Refactor（重构）
   ↓           ↓              ↓
 写失败测试   写最少代码      优化代码
           让测试通过      保持测试通过
```

**Red（红）阶段：**
- 先写测试，定义期望的行为
- 运行测试，预期失败（因为功能还没实现）
- 如果测试通过了，说明测试写得不对

**Green（绿）阶段：**
- 写**最少**的代码让测试通过
- 不要考虑优雅、复用、性能
- 可以快速迭代，多次运行测试

**Refactor（重构）阶段：**
- 在保证测试通过的前提下优化代码
- 改善命名、结构、消除重复
- 测试是重构的安全网

**完整示例：**

**需求：** 实现一个加法函数

```js
// Step 1: Red - 写测试
// add.test.js
import { add } from './add'

test('adds two numbers', () => {
  expect(add(1, 2)).toBe(3)
})

// 运行测试：❌ FAIL - add is not defined

// Step 2: Green - 实现功能
// add.js
export function add(a, b) {
  return 3  // 硬编码让测试通过（极端例子）
}

// 运行测试：✅ PASS

// Step 3: Red - 添加更多测试
test('adds negative numbers', () => {
  expect(add(-1, -2)).toBe(-3)
})

// 运行测试：❌ FAIL - 硬编码的 3 不对了

// Step 2 again: Green - 修改实现
export function add(a, b) {
  return a + b  // 真正的实现
}

// 运行测试：✅ PASS

// Step 4: Refactor - 优化
// 添加类型、文档等
/**
 * 两个数字相加
 * @param {number} a - 第一个数字
 * @param {number} b - 第二个数字
 * @returns {number} 两数之和
 */
export function add(a: number, b: number): number {
  return a + b
}

// 运行测试：✅ PASS - 重构完成
```

**TDD 的优点：**
- 测试覆盖率高
- 设计更清晰（先想接口再实现）
- 重构有安全保障
- 减少调试时间

**TDD 的缺点：**
- 初期开发速度慢
- 需要纪律和练习
- 不适合所有场景（如 UI、探索性工作）

**何时使用 TDD：**
- ✅ 核心业务逻辑
- ✅ 算法和工具函数
- ✅ 有明确需求的场景
- ❌ UI 原型
- ❌ 探索性/实验性工作
- ❌ 一次性脚本

**知识点：** `TDD` `红绿重构` `测试优先` `重构`

:::

### Q13: 单元测试的覆盖率指标？

> **⭐ 简单 · 测试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**覆盖率类型：**

| 指标 | 含义 | 目标 |
|------|------|------|
| 语句覆盖率 (Statements) | 执行的语句占比 | >80% |
| 分支覆盖率 (Branches) | if/else等分支执行占比 | >70% |
| 函数覆盖率 (Functions) | 执行的函数占比 | >80% |
| 行覆盖率 (Lines) | 执行的代码行占比 | >80% |

**代码覆盖率示例：**

```js
// 被测函数
function abs(value) {
  if (value < 0) {    // 分支 1
    return -value
  } else {            // 分支 2
    return value
  }
}

// 测试
test('正数', () => {
  expect(abs(5)).toBe(5)  // 只覆盖了 else 分支
})

// 完整测试
test('负数', () => {
  expect(abs(-5)).toBe(5)  // 覆盖 if 分支
})
```

**覆盖率报告解读：**

```
----------------|---------|----------|---------|---------
File            | % Stmts | % Branch | % Funcs | % Lines
----------------|---------|----------|---------|---------
utils.js        |   85.71 |    75.00 |     100 |   85.71
----------------|---------|----------|---------|---------

绿色 (>90%): 优秀
黄色 (70-90%): 良好
红色 (<70%): 需要改进
```

**Jest 配置：**

```js
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80
    }
  }
}
```

**运行测试并生成报告：**

```bash
# 生成覆盖率
npm test -- --coverage

# 查看 HTML 报告
open coverage/index.html

# 覆盖率门槛检查
npm test -- --coverage --coverageThreshold
```

**100% 覆盖率陷阱：**

```js
// ❌ 追求 100% 但测试质量低
test('setup', () => {
  // 无意义的测试
  expect(true).toBe(true)
})

// ✅ 有意义的测试
test('计算正确', () => {
  expect(calculate(2, 3)).toBe(5)
  expect(calculate(-1, 1)).toBe(0)
})
```

**覆盖盲区常见位置：**

```
1. 错误处理（catch 分支）
2. 边界条件
3. 异步代码
4. 条件组合（if A && B）
5. 工具函数
```

**知识点：** `覆盖率` `语句覆盖` `分支覆盖` `Jest` `测试质量`

:::

### Q14: Jest 的 mock 功能？

> **🔥 中等 · 测试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Mock 函数：**

```js
// 1. 创建 mock 函数
const mockFn = jest.fn()
mockFn('arg1', 'arg2')
expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')

// 2. 实现自定义逻辑
const mockFn = jest.fn((x) => x * 2)
expect(mockFn(5)).toBe(10)

// 3. 返回固定值
const mockFn = jest.fn()
mockFn.mockReturnValue(42)
expect(mockFn()).toBe(42)

// 4. 实现 Promise
const mockFn = jest.fn()
mockFn.mockResolvedValue('data')
await expect(mockFn()).resolves.toBe('data')

// 5. 实现 Reject
mockFn.mockRejectedValue(new Error('error'))

// 6. 多次调用不同返回
mockFn
  .mockReturnValueOnce(1)
  .mockReturnValueOnce(2)
  .mockReturnValue(3)
```

**Mock 模块：**

```js
// mock 整个模块
jest.mock('axios')
import axios from 'axios'

axios.get.mockResolvedValue({ data: { users: [] } })
```

**Mock 部分实现：**

```js
jest.mock('lodash', () => {
  const original = jest.requireActual('lodash')
  return {
    ...original,
    debounce: jest.fn()
  }
})
```

**Mock 定时器：**

```js
jest.useFakeTimers()

setTimeout(() => {
  callback()
}, 1000)

// 快进时间
jest.advanceTimersByTime(1000)
// 或
jest.runAllTimers()

jest.useRealTimers()
```

**Spy（监视已有函数）：**

```js
// 监视对象方法
const obj = { fn: () => {} }
const spy = jest.spyOn(obj, 'fn')
obj.fn()
expect(spy).toHaveBeenCalled()

// 恢复
spy.mockRestore()
```

**Mock 高阶用法：**

```js
// 1. 带实现的 mock
jest.mock('./api', () => ({
  fetchUser: jest.fn(id => Promise.resolve({ id, name: 'Mock' }))
}))

// 2. __mocks__ 目录
// __mocks__/axios.js
module.exports = {
  get: jest.fn(),
  post: jest.fn()
}

// 3. 手动清除
beforeEach(() => {
  jest.clearAllMocks()
})

afterEach(() => {
  jest.resetAllMocks()
})
```

**测试异步代码：**

```js
// async/await
test('async', async () => {
  const data = await fetchData()
  expect(data).toEqual({})
})

// Promise
test('promise', () => {
  return fetchData().then(data => {
    expect(data).toEqual({})
  })
})

// resolves/rejects
await expect(fetchData()).resolves.toEqual({})
await expect(badFetch()).rejects.toThrow()
```

**知识点：** `Jest` `Mock` `Spy` `定时器` `异步测试`

:::

### Q15: 前端测试的 TDD 和 BDD 的区别？

> **🔥 中等 · 测试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**TDD (Test-Driven Development)：**

```
流程：红 → 绿 → 重构
1. 编写失败的测试
2. 写最少代码让测试通过
3. 重构代码
4. 重复

代码风格：
test('should return sum', () => {
  expect(sum(1, 2)).toBe(3)
})
```

**BDD (Behavior-Driven Development)：**

```
流程：Given → When → Then
1. 描述期望行为
2. 编写测试
3. 实现功能
4. 重构

代码风格：
describe('Calculator', () => {
  describe('add', () => {
    it('should return sum of two numbers', () => {
      // Given
      const a = 1, b = 2
      
      // When
      const result = calculator.add(a, b)
      
      // Then
      expect(result).toBe(3)
    })
  })
})
```

**对比：**

| 特性 | TDD | BDD |
|------|-----|-----|
| 关注点 | 功能正确性 | 用户行为 |
| 语言 | 技术术语 | 自然语言 |
| 参与者 | 开发者 | 开发 + 产品 + 测试 |
| 工具 | Jest, Mocha | Cucumber, Jasmine |
| 适合 | 单元测试 | 集成/E2E 测试 |

**TDD 示例：**

```js
// 1. 写测试（红）
test('add positive numbers', () => {
  expect(add(2, 3)).toBe(5)
})

// 2. 实现（绿）
function add(a, b) {
  return a + b
}

// 3. 重构
```

**BDD 示例：**

```js
// 使用 Jasmine/Mocha 风格
describe('User Authentication', () => {
  describe('when user is valid', () => {
    it('should login successfully', () => {
      // ...
    })
  })
  
  describe('when password is wrong', () => {
    it('should show error message', () => {
      // ...
    })
  })
})
```

**Gherkin 语法（Cucumber）：**

```gherkin
Feature: 用户登录

  Scenario: 正常登录
    Given 用户在登录页面
    When 输入正确的用户名和密码
    And 点击登录按钮
    Then 跳转到首页
    And 显示欢迎消息

  Scenario: 密码错误
    Given 用户在登录页面
    When 输入错误的密码
    And 点击登录按钮
    Then 显示错误提示
```

**何时使用：**

```
TDD 适合:
✅ 工具函数、算法
✅ API 接口
✅ 有明确输入输出的功能

BDD 适合:
✅ 用户流程
✅ 业务逻辑
✅ 跨团队协作
✅ 验收测试
```

**最佳实践：**

```
1. 不要为了覆盖率而测试
2. 测试维护成本要考虑
3. 优先测试核心逻辑
4. 不要测试第三方库
5. 保持测试简洁可读
```

**知识点：** `TDD` `BDD` `测试驱动` `行为驱动` `测试方法论`

:::
