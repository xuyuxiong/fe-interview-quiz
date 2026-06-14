---
title: 测试框架与工具
description: Jest 配置、Vitest、E2E 测试、组件测试最佳实践面试题
---

# 测试框架与工具

## 面试题

### Q1: Vitest 和 Jest 有什么区别？为什么选 Vitest？

> **🔥 中等 · 测试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 特性 | Jest | Vitest |
|------|------|--------|
| 构建工具 | 自带(基于 transform) | 基于 Vite |
| 配置 | jest.config.js | vite.config.ts 共享 |
| ESM 支持 | 需要额外配置 | 原生支持 |
| 转译速度 | 较慢（Babel/ts-jest） | 快（esbuild） |
| HMR | 无 | 支持（测试热更新） |
| 生态 | 最丰富 | 快速成长 |
| API | - | 兼容 Jest API |

**Vitest 优势：**
1. Vite 项目零配置——共享 vite.config.ts
2. 原生 ESM 支持，无需编译
3. 测试文件修改后只重新运行相关测试（HMR）
4. esbuild 转译速度极快

```ts
// vite.config.ts - Vitest 和 Vite 共享配置
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  }
})
```

**知识点：** `Vitest` `Jest` `ESM` `Vite` `测试框架选型`

:::

### Q2: Cypress 和 Playwright 如何选择？

> **🔥 中等 · 测试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 特性 | Cypress | Playwright |
|------|---------|-----------|
| 浏览器 | Chrome/Electron(内嵌) | Chrome/Firefox/Safari |
| 语言 | JavaScript/TypeScript | JS/TS/Python/Java/C# |
| 并行 | 需付费 Dashboard | 内置并行 |
| 速度 | 较慢 | 较快 |
| 调试 | Time Travel + GUI | Trace Viewer + CodeGen |
| 架构 | 浏览器内执行 | CDP 协议 |
| 跨域 | 有限制 | 无限制 |
| 移动端 | 基本 viewport 模拟 | 原生移动端模拟 |

**选型建议：**
- **Cypress**：中小项目、团队 JavaScript 为主、Time Travel 调试友好
- **Playwright**：需要多浏览器、大型项目、需要并行、需要 Python/Java

```js
// Playwright 示例
import { test, expect } from '@playwright/test'

test('login flow', async ({ page }) => {
  await page.goto('/login')
  await page.fill('[name="username"]', 'admin')
  await page.fill('[name="password"]', '123456')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('.welcome')).toContainText('Welcome')
})
```

**知识点：** `Cypress` `Playwright` `E2E测试` `跨浏览器测试`

:::

### Q3: React Testing Library 和 Enzyme 有什么区别？

> **⭐ 简单 · 测试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 特性 | Enzyme | React Testing Library |
|------|--------|----------------------|
| 测试对象 | 组件实例 | DOM 节点/用户视角 |
| 访问内部 | state/props/方法 | 仅能访问渲染内容 |
| 更新状态 | setState() | 模拟用户操作 |
| 重构友好 | 差（依赖实现细节） | 好（测试行为） |
| React 18 | 不支持 | 支持 |
| 官方推荐 | ❌ | ✅ |

```js
// Enzyme - 测试实现细节（不推荐）
const wrapper = shallow(<Counter />)
expect(wrapper.state('count')).toBe(0)
wrapper.instance().increment()
expect(wrapper.state('count')).toBe(1)

// RTL - 测试用户行为（推荐）
render(<Counter />)
expect(screen.getByText('0')).toBeInTheDocument()
await userEvent.click(screen.getByText('+'))
expect(screen.getByText('1')).toBeInTheDocument()
```

**核心原则：** 测试用户能看到和操作的内容，而不是组件内部实现。

**知识点：** `Enzyme` `RTL` `测试用户行为` `测试原则`

:::

### Q4: 组件测试的最佳实践是什么？

> **🔥 中等 · 测试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

1. **测试行为而非实现**
2. **使用正确的查询方法**（getByRole 优先）
3. **模拟用户交互**（userEvent 优先于 fireEvent）
4. **Mock 外部依赖**（API/路由/Store）
5. **异步状态用 waitFor**

```js
// ❌ 不好：测试实现细节
expect(wrapper.find('Button').prop('disabled')).toBe(true)

// ✅ 好：测试用户视角
expect(screen.getByRole('button', { name: '提交' })).toBeDisabled()

// ❌ 不好：fireEvent
fireEvent.change(input, { target: { value: 'hello' } })

// ✅ 好：userEvent（更真实）
await userEvent.type(input, 'hello')

// ❌ 不好：直接 mock 内部函数
component.handleSubmit = jest.fn()

// ✅ 好：mock 外部 API，验证结果
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ data: { success: true } })
}))
```

**查询优先级（从高到低）：**
1. `getByRole` - 可访问性最佳
2. `getByLabelText` - 表单关联
3. `getByPlaceholderText` - 输入提示
4. `getByText` - 文本内容
5. `getByDisplayValue` - 当前值
6. `getByTestId` - 最后手段

**知识点：** `组件测试` `RTL最佳实践` `userEvent` `查询优先级`

:::

### Q5: 如何在 CI 中配置前端测试？

> **🔥 中等 · 测试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit -- --coverage --ci
      - uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/

  e2e-test:
    runs-on: ubuntu-latest
    needs: unit-test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

**CI 测试策略：**
- PR 阶段：单元测试 + 集成测试（快速反馈）
- main 分支：全量测试含 E2E
- 覆盖率门槛不达标则失败
- E2E 失败时上传截图/trace

**知识点：** `CI测试` `GitHub Actions` `Playwright CI` `覆盖率`

:::

### Q6: MSW 是什么？为什么比 jest.mock(axios) 更好？

> **💀 困难 · 测试**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**MSW (Mock Service Worker)** = 在 Service Worker 层拦截网络请求，返回模拟数据。

```js
// 1. 定义 handlers
import { rest } from 'msw'
export const handlers = [
  rest.get('/api/user', (req, res, ctx) => {
    return res(ctx.json({ name: 'test', id: 1 }))
  }),
  rest.post('/api/login', async (req, res, ctx) => {
    const { username } = await req.json()
    if (username === 'admin') {
      return res(ctx.status(200), ctx.json({ token: 'xxx' }))
    }
    return res(ctx.status(401), ctx.json({ error: 'Unauthorized' }))
  })
]

// 2. 设置 server
import { setupServer } from 'msw/node'
const server = setupServer(...handlers)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// 3. 测试中使用
it('should login successfully', async () => {
  render(<Login />)
  await userEvent.type(screen.getByLabelText('用户名'), 'admin')
  await userEvent.click(screen.getByText('登录'))
  expect(await screen.findByText('欢迎')).toBeInTheDocument()
})
```

**MSW vs jest.mock(axios)：**

| 对比 | jest.mock(axios) | MSW |
|------|------------------|-----|
| 拦截层 | 模块层 | 网络层 |
| 真实度 | 差（mock 了整个库） | 高（真实网络请求） |
| 切换库 | 需要改 mock 代码 | 不受影响 |
| E2E 复用 | 不可 | 可复用 handler |
| 错误场景 | 需要手动模拟 | 自动支持网络错误 |

**知识点：** `MSW` `Mock Service Worker` `网络层Mock` `测试隔离`

:::
---

> **🔥 中等 · Playwright 调试**

### Q7: Playwright 的 Trace Viewer 怎么用？调试 E2E 测试？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Trace Viewer 是 Playwright 最强大的调试工具，可以像"时间旅行"一样查看测试执行过程。**

**启用 Trace：**
```ts
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  use: {
    trace: 'on-first-retry'  // 失败重试时记录 trace
    // 或 trace: 'retain-on-failure'  // 失败时保留
    // 或 trace: 'on'  // 总是记录
  }
})
```

**运行测试并查看 Trace：**
```bash
# 运行测试
npx playwright test

# 失败后查看 trace
npx playwright show-trace trace.zip
```

**Trace Viewer 功能：**
- **时间线**：按时间顺序显示所有操作
- **快照**：查看每一步的页面截图
- **DOM 快照**：查看每一步的 DOM 结构
- **控制台日志**：查看 console.log 和错误
- **网络请求**：查看所有 HTTP 请求/响应
- **源代码**：定位到对应的测试代码行

**Codegen 录制测试：**
```bash
# 打开浏览器，操作自动生成代码
npx playwright codegen https://example.com
```

**其他调试技巧：**
```bash
# 运行时有 UI
npx playwright test --headed

# 慢动作执行
npx playwright test --debug
```

**知识点：** `Playwright` `Trace Viewer` `E2E 调试` `Codegen`

:::

---

> **🔥 中等 · Vitest 迁移**

### Q8: Vitest 和 Jest 的迁移成本大吗？如何迁移？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**迁移成本：低 - Vitest API 高度兼容 Jest。**

**Vitest 兼容 Jest API：**
```ts
// 以下 API 可以直接使用
describe() / it() / test()
expect()
beforeAll() / beforeEach()
jest.fn() / jest.mock() / jest.spyOn()
```

**迁移步骤：**

**1. 安装 Vitest**
```bash
npm install -D vitest @vitest/ui jsdom
```

**2. 配置 vite.config.ts**
```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: { provider: 'v8' }
  }
})
```

**3. 更新 scripts**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**主要差异：**
| Jest | Vitest |
|------|--------|
| `jest.fn()` | `vi.fn()` (都支持) |
| `jest.mock()` | `vi.mock()` |
| 配置独立 | 共享 vite.config.ts |

**迁移收益：**
- ✅ 开发速度更快（esbuild 转译）
- ✅ 原生 ESM 支持
- ✅ HMR 测试热更新

**知识点：** `Vitest` `Jest 迁移` `测试框架`

:::

---

> **💀 困难 · 测试质量**

### Q9: 前端测试的 Code Coverage 和 Mutation Testing 有什么区别？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Code Coverage（代码覆盖率）：**
- **定义**：测试执行到的代码比例
- **维度**：行覆盖率、分支覆盖率、函数覆盖率
- **局限**：高覆盖率≠高质量，无法检测错误的断言

**Mutation Testing（变异测试）：**
- **定义**：故意修改代码，看测试能否发现
- **原理**：制造"变异体"→运行测试→看是否失败
- **指标**：变异分数 = 杀死的变异体/总变异体

**对比：**
| 维度 | Code Coverage | Mutation Testing |
|------|---------------|------------------|
| 衡量对象 | 代码执行情况 | 测试检测能力 |
| 可靠性 | 中等（可刷） | 高（难以作弊） |
| 执行速度 | 快 | 慢 |
| 适用 | 日常开发 | 定期质量检查 |

**工具**：Stryker（JS/TS 变异测试工具）

**最佳实践：**
- 日常用覆盖率（CI 门槛 70-80%）
- 定期用变异测试评估测试质量
- 两者结合使用

**知识点：** `代码覆盖率` `变异测试` `测试质量` `Stryker`

:::

---

> **🔥 中等 · Hook 测试**

### Q10: 如何测试 React Hook？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**方案一：@testing-library/react-hooks（推荐）**
```bash
npm install -D @testing-library/react-hooks
```

```ts
import { renderHook, act } from '@testing-library/react-hooks'
import { useCounter } from './useCounter'

test('should increment count', () => {
  const { result } = renderHook(() => useCounter())
  
  act(() => {
    result.current.increment()
  })
  
  expect(result.current.count).toBe(1)
})
```

**方案二：在组件中测试**
```ts
// 创建测试用组件包裹 Hook
function TestComponent() {
  const { count, increment } = useCounter()
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={increment}>+</button>
    </div>
  )
}

test('hook works', async () => {
  render(<TestComponent />)
  await userEvent.click(screen.getByText('+'))
  expect(screen.getByTestId('count')).toHaveTextContent('1')
})
```

**测试带副作用的 Hook：**
```ts
// 使用 fake timers
beforeEach(() => { jest.useFakeTimers() })
afterEach(() => { jest.useRealTimers() })

test('debounce works', () => {
  const { result, rerender } = renderHook(
    ({ v }) => useDebounce(v, 300),
    { initialProps: { v: 'a' } }
  )
  rerender({ v: 'b' })
  jest.advanceTimersByTime(300)
  expect(result.current).toBe('b')
})
```

**测试依赖 Context 的 Hook：**
```ts
// 提供 wrapper
function createWrapper() {
  const client = new QueryClient()
  return ({ children }) => (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  )
}

const { result } = renderHook(() => useFetch(), {
  wrapper: createWrapper()
})
```

**最佳实践：**
- 测行为不测实现
- 使用 act 包裹状态更新
- 清理副作用（定时器、事件监听）

**知识点：** `React Hook 测试` `renderHook` `Testing Library` `act`

:::

### Q11: Cypress 和 Playwright 的对比？

> **🔥 中等 · 测试框架**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心架构对比：**

| 特性 | Cypress | Playwright |
|------|---------|------------|
| 执行方式 | 与浏览器同域 | 通过 DevTools 协议 |
| 多浏览器 | Chrome/Firefox/Edge | Chromium/Firefox/WebKit |
| 语言支持 | JS/TS | JS/TS/Python/Java/.NET |
| 并行测试 | Dashboard（付费） | 内置支持 |
| 移动端 | 有限 | iOS/Android 支持 |
| 开源协议 | MIT | Apache 2.0 |

**Cypress 特点：**

```js
// 安装
npm install cypress --save-dev

// 运行
npx cypress open  // GUI
npx cypress run    // CLI

// 测试示例
describe('Login', () => {
  it('success', () => {
    cy.visit('/login')
    cy.get('[data-testid="email"]').type('user@test.com')
    cy.get('[data-testid="password"]').type('password')
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })
})

// 优点：
// - 易上手
// - 时间旅行调试
// - 自动重试
// - 丰富的插件

// 缺点:
// - 不支持多标签页
// - iframe 限制
// - 不支持原生事件
```

**Playwright 特点：**

```js
// 安装
npm install playwright --save-dev
npx playwright install  // 安装浏览器

// 测试示例
import { test, expect } from '@playwright/test'

test.describe('Login', () => {
  test('success', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'user@test.com')
    await page.fill('[data-testid="password"]', 'password')
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/dashboard/)
  })
})

// 并行测试（自动）
// playwright.config.js
export default {
  workers: 4,           // 4 个并行
  fullyParallel: true   // 文件内并行
}

// 优点:
// - 支持多语言
// - 真正的跨浏览器
// - 移动端仿真
// - 内置并行

// 缺点:
// - 学习曲线略陡
// - 社区相对较小
```

**功能对比：**

```
网络拦截:
- Cypress: cy.intercept()
- Playwright: page.route()

文件下载:
- Cypress: 需要配置
- Playwright: 原生支持

截图/录屏:
- Cypress: 失败自动截图
- Playwright: 支持视频/截图

移动端测试:
- Cypress: 有限
- Playwright: deviceDescriptors 支持各种设备
```

**选择建议：**

```
选择 Cypress:
✅ 纯 Web 项目
✅ 快速上手需求
✅ React/Vue 单页应用
✅ 已有 Cypress 使用经验

选择 Playwright:
✅ 需要多浏览器测试
✅ 需要移动端测试
✅ 需要多语言支持
✅ 大型项目、需要并行
```

**知识点：** `Cypress` `Playwright` `E2E 测试` `自动化测试` `框架对比`

:::

### Q12: Testing Library 的设计理念？

> **🔥 中等 · 测试框架**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心理念：**

```
测试应该像用户一样使用应用
- 不测试实现细节
- 关注用户可见的行为
- 使用语义化查询
```

**查询优先级：**

```
1. getByRole    (优先)
   getByRole('button', { name: '提交' })

2. getByLabelText
   getByLabelText('用户名')

3. getByPlaceholderText
   getByPlaceholderText('请输入邮箱')

4. getByText
   getByText('欢迎回来')

5. getByTestId    (最后手段)
   getByTestId('submit-button')
```

**代码示例：**

```jsx
// ❌ 差：测试实现细节
const input = document.querySelector('input.form-control')
expect(input.value).toBe('test')

// ✅ 好：测试用户行为
const input = screen.getByLabelText('用户名')
expect(input).toHaveValue('test')
```

**用户事件模拟：**

```js
import { userEvent } from '@testing-library/user-event'

// 用户视角的交互
await userEvent.type(emailInput, 'user@test.com')
await userEvent.click(screen.getByRole('button', { name: '登录' }))

// 而不是：
// fireEvent.change(input, { target: { value: '...' } })
```

**异步处理：**

```js
// findBy 自动等待
const button = await screen.findByRole('button')
expect(button).toBeEnabled()

// waitFor 自定义等待
await waitFor(() => {
  expect(screen.getByText('保存成功')).toBeInTheDocument()
})
```

**常见查询方法：**

```js
// 单选
getByRole, queryByRole, findByRole
getByText, queryByText, findByText

// 多选
getAllByRole, queryAllByRole, findAllByRole

// 断言存在/不存在
expect(screen.queryByText('错误')).not.toBeInTheDocument()
```

**组件测试示例：**

```jsx
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TodoList from './TodoList'

test('添加待办事项', async () => {
  render(<TodoList />)
  
  // 输入
  await userEvent.type(
    screen.getByPlaceholderText('添加任务'),
    '学习 Testing Library'
  )
  
  // 提交
  await userEvent.click(screen.getByRole('button', { name: '添加' }))
  
  // 验证
  await waitFor(() => {
    expect(screen.getByText('学习 Testing Library')).toBeInTheDocument()
  })
  
  // 验证清空
  expect(screen.getByPlaceholderText('添加任务')).toHaveValue('')
})
```

**最佳实践：**

```
1. 使用语义化查询（getByRole > getByText > getByTestId）
2. 使用 userEvent 代替 fireEvent
3. 避免测试内部状态
4. 测试用户可见的行为
5. 使用 findBy 自动等待
6. mock 外部依赖
```

**与 Enzyme 对比：**

```
Enzyme (旧):
- 测试实现细节
- 可以访问组件实例
- 可以测试生命周期

Testing Library (新):
- 测试用户行为
- 不关心组件内部
- 更接近真实使用场景
```

**知识点：** `Testing Library` `用户行为测试` `语义化查询` `React 测试` `最佳实践`

:::
