---
title: CI/CD 持续集成与部署
description: CI/CD 流程、Docker 部署、灰度发布面试题
---

# CI/CD 持续集成与部署

## 面试题

### Q1: CI 和 CD 的区别是什么？

> **⭐ 简单 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 概念 | 全称 | 说明 |
|------|------|------|
| CI | Continuous Integration | 持续集成：代码合并→自动构建→自动测试 |
| CD | Continuous Delivery | 持续交付：自动化到可发布状态（需人工确认） |
| CD | Continuous Deployment | 持续部署：自动发布到生产环境（无需人工） |

**前端典型 CI/CD 流程：**

```
git push → 触发 CI
  → 安装依赖 (npm ci)
  → Lint 检查 (ESLint/Prettier)
  → 单元测试 (Jest/Vitest)
  → 构建 (npm run build)
  → 构建产物上传 (artifact/CDN)
  → 部署到预发环境
  → E2E 测试
  → 人工验收/自动发布到生产
```

**知识点：** `CI/CD` `持续集成` `持续部署` `自动化流程`

:::

### Q2: Docker + Nginx 前端部署如何配置？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```dockerfile
# 多阶段构建
# 阶段 1：构建
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 阶段 2：运行
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
server {
    listen 80;
    server_name example.com;
    root /usr/share/nginx/html;

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://backend:3000/;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**知识点：** `Docker` `多阶段构建` `Nginx` `前端部署`

:::

### Q3: 灰度发布、金丝雀发布、蓝绿部署有什么区别？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 方案 | 原理 | 回滚速度 | 风险控制 |
|------|------|----------|----------|
| 蓝绿部署 | 两套环境切换，一次切全部 | 秒级 | 低但全量切换 |
| 金丝雀发布 | 先给少量用户 (1-5%)，逐步扩大 | 快 | 最安全 |
| 灰度发布 | 按规则 (用户/地区/比例) 分批发布 | 快 | 较安全 |

**灰度发布策略：**

- 按 UID 百分比：用户 ID % 100 < 灰度比例
- 按白名单：特定用户优先体验
- 按地区/渠道：部分地区先发布

```
灰度流程：1% → 5% → 10% → 25% → 50% → 100%
每阶段监控：错误率、性能指标、用户反馈
异常则立即回滚到上一阶段
```

**知识点：** `灰度发布` `金丝雀发布` `蓝绿部署` `发布策略`

:::

### Q4: GitHub Actions 如何配置前端 CI？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

**关键点：**
- `npm ci` 比 `npm install` 更快更可靠
- `cache: 'npm'` 缓存依赖加速后续构建
- 分步执行便于定位失败阶段

**知识点：** `GitHub Actions` `CI 配置` `workflow` `artifact`

:::

### Q5: 部署回滚策略和预案有哪些？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**回滚策略：**

1. **版本号回退**：指定上一版本号重新部署
2. **Git revert**：代码层面回退后重新构建
3. **蓝绿切换**：切回旧环境
4. **CDN 回退**：CDN 切换到上一个版本

**前端回滚最佳实践：**

```
1. 保留最近 N 个版本的构建产物
2. HTML 不缓存（入口文件始终最新）
3. 静态资源用内容 hash，新旧版本互不影响
4. 增量发布，避免全量替换
5. Feature Flag 控制功能开关，无需回滚代码即可关闭新功能
```

**预案要点：**
- 监控告警 → 自动/手动暂停灰度
- 一键回滚脚本（必须在 5 分钟内完成）
- 回滚后验证（冒烟测试）
- 事故复盘文档（5 Whys 分析）

**知识点：** `回滚策略` `蓝绿切换` `Feature Flag` `发布预案`

:::

### Q6: Nginx 常用前端配置有哪些？

> **⭐ 简单 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```nginx
server {
    listen 80;
    server_name example.com;
    root /usr/share/nginx/html;

    # SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 反向代理
    location /api/ {
        proxy_pass http://backend:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 静态资源长期缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip 压缩
    gzip on;
    gzip_types text/css application/javascript application/json;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
}
```

**知识点：** `Nginx` `反向代理` `缓存` `HTTPS` `Gzip` `安全头`

:::

### Q7: 前端自动化测试如何集成到 CI 中？

> **🔥 中等 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**测试金字塔：**

| 层级 | 类型 | 工具 | 速度 | 数量 |
|------|------|------|------|------|
| 底层 | 单元测试 | Jest / Vitest | 毫秒级 | 多 |
| 中层 | 集成测试 | Testing Library | 秒级 | 中 |
| 顶层 | E2E 测试 | Cypress / Playwright | 分钟级 | 少 |

**CI 集成策略：**

```yaml
# PR 阶段：快速反馈
jobs:
  test:
    steps:
      - run: npm run test:unit -- --coverage
      - run: npm run test:integration

# main 分支：全面验证
e2e:
  needs: test
  steps:
    - run: npm run test:e2e
```

```json
// jest.config.json - 覆盖率门槛
{
  "coverageThreshold": {
    "global": { "branches": 70, "functions": 70, "lines": 70 }
  }
}
```

- PR 阶段跑单元 + 集成测试（快速反馈）
- 合并 main 后跑 E2E 测试（全面验证）
- 设置覆盖率门槛，不达标则 CI 失败

**知识点：** `自动化测试` `Jest` `Playwright` `测试金字塔` `CI 集成`

:::

### Q8: 如何实现前端全流程自动化部署？

> **💀 困难 · 工程化**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```
git push → CI 构建
  → 产物上传到 CDN/OSS
  → HTML 部署到服务器
  → 健康检查
  → 灰度放量
  → 全量发布
```

**关键点：**
1. 静态资源（JS/CSS/图片）与 HTML 分离部署
2. HTML 不缓存，静态资源长期缓存
3. 健康检查前置，失败则不继续
4. 灰度逐步放量：5% → 25% → 50% → 100%
5. 保留最近 N 个版本用于回滚

**知识点：** `自动化部署` `CDN` `灰度` `健康检查` `CI/CD`

:::

### Q9: CI/CD 流水线中前端项目的关键步骤？（lint、test、build、deploy）

> **🔥 中等 · engineering/cicd**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**前端 CI/CD 完整流水线：**

```yaml
# .github/workflows/deploy.yml
name: Deploy Pipeline
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # 1. Lint 检查
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check  # TypeScript 检查

  # 2. 单元测试
  test-unit:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3  # 上传覆盖率

  # 3. 构建
  build:
    runs-on: ubuntu-latest
    needs: [lint, test-unit]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  # 4. E2E 测试
  test-e2e:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      - run: npm ci
      - run: npm run test:e2e

  # 5. 部署到预发
  deploy-staging:
    runs-on: ubuntu-latest
    needs: [build, test-e2e]
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/download-artifact@v4
      - run: ./scripts/deploy.sh staging

  # 6. 部署到生产
  deploy-prod:
    runs-on: ubuntu-latest
    needs: deploy-staging
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/download-artifact@v4
      - run: ./scripts/deploy.sh production
```

**关键步骤说明：**

| 步骤 | 命令 | 说明 | 失败处理 |
|------|------|------|----------|
| lint | `npm run lint` | ESLint/Prettier 检查 | 阻止合并 |
| type-check | `npm run type-check` | TypeScript 类型检查 | 阻止合并 |
| test:unit | `npm run test:unit` | 单元测试 + 覆盖率 | 阻止合并 |
| build | `npm run build` | 生产构建 | 阻止部署 |
| test:e2e | `npm run test:e2e` | E2E 测试 | 阻止部署 |
| deploy | `./deploy.sh` | 部署脚本 | 自动回滚 |

**知识点：** `CI/CD 流水线` `lint` `test` `build` `deploy` `GitHub Actions` `自动化测试`

:::

### Q10: 什么是 Feature Flag？如何影响 CI/CD 流程？

> **🔥 中等 · engineering/cicd**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Feature Flag（功能开关）：**

Feature Flag 是一种通过配置控制功能发布的技术，允许代码部署和功能发布解耦。

**基本用法：**

```javascript
// 功能开关封装
const featureFlags = {
  newCheckout: false,  // 新功能默认关闭
  darkMode: true,      // 已发布功能
  aiRecommend: false   // 灰度中功能
};

function isFeatureEnabled(flagName, userId = null) {
  const flag = featureFlags[flagName];
  
  // 简单开关
  if (typeof flag === 'boolean') return flag;
  
  // 按用户比例灰度
  if (typeof flag === 'number') {
    const hash = userId ? hashCode(userId) % 100 : Math.random() * 100;
    return hash < flag;
  }
  
  return false;
}

// 使用
if (isFeatureEnabled('newCheckout', userId)) {
  renderNewCheckout();
} else {
  renderOldCheckout();
}
```

**Feature Flag 对 CI/CD 的影响：**

```text
传统流程：
代码开发 → 测试 → 合入 main → 部署生产 → 功能可见
            ↑ 必须一次性发布全部功能

Feature Flag 流程：
代码开发 → 测试 → 合入 main → 部署生产 → 功能隐藏（开关关闭）
           ↓
           随时通过开关控制功能可见性
           ↓
           可按用户/比例灰度发布
```

**优势：**

| 优势 | 说明 |
|------|------|
| 代码与发布解耦 | 可以随时部署，功能开关控制可见性 |
| 快速回滚 | 发现问题直接关闭开关，无需回滚代码 |
| 灰度发布 | 按用户 ID/比例/地区逐步放量 |
| A/B 测试 | 同时运行多个版本，对比效果 |
| 降低风险 | 新功能出问题时不影响主流程 |

**Feature Flag 管理平台：**

```javascript
// 使用第三方服务（如 LaunchDarkly、Unleash）
import { useFeatureFlag } from '@launchdarkly/react-client-sdk';

function CheckoutPage() {
  const [newCheckout] = useFeatureFlag('new-checkout-flow');
  
  return newCheckout ? <NewCheckout /> : <OldCheckout />;
}

// 服务端获取 Flag
const flags = await ldClient.allFlagsState(userContext);
```

**最佳实践：**

```javascript
// 1. 短期 Flag - 发布后删除
if (flags.newCheckout) { /* ... */ }  // 发布稳定后删除 if

// 2. 长期 Flag - 配置化功能
if (flags.darkMode) { /* ... */ }  // 保留作为配置

// 3. 清理废弃 Flag
// 定期清理已发布稳定的 Flag，避免技术债务
```

**知识点：** `Feature Flag` `功能开关` `灰度发布` `A/B 测试` `CI/CD` `发布策略`

:::

### Q11: 前端项目的自动化测试策略？（单元测试/集成测试/E2E 测试的取舍）

> **🔥 中等 · engineering/cicd**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**测试金字塔：**

```
        /\          E2E 测试（10%）
       /  \         - 完整用户流程
      /----\        - 慢，易失败
     /      \
    /--------\      集成测试（30%）
   /          \     - 组件交互
  /------------\    - 中等速度
 /              \
/----------------\  单元测试（60%）
                    - 函数/组件逻辑
                    - 快速，稳定
```

**1. 单元测试（Unit Test）**

```javascript
// 测试工具函数
import { formatCurrency, parseDate } from './utils';

describe('utils', () => {
  test('formatCurrency formats correctly', () => {
    expect(formatCurrency(1234.56, 'CNY')).toBe('¥1,234.56');
  });
  
  test('parseDate handles invalid input', () => {
    expect(parseDate(null)).toBeNull();
    expect(parseDate('invalid')).toBeNull();
  });
});

// 测试 React 组件（业务逻辑）
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

test('Counter increments on click', () => {
  render(<Counter />);
  fireEvent.click(screen.getByText('+'));
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

**适用场景：**
- ✅ 工具函数、纯函数
- ✅ 复杂业务逻辑
- ✅ 组件的独立行为
- ❌ 组件间交互
- ❌ 完整用户流程

**2. 集成测试（Integration Test）**

```javascript
// 测试组件交互
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import OrderForm from './OrderForm';
import OrderSummary from './OrderSummary';

test('OrderForm submits and updates OrderSummary', async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <OrderForm />
      <OrderSummary />
    </QueryClientProvider>
  );
  
  fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '2' } });
  fireEvent.click(screen.getByText('Submit'));
  
  await waitFor(() => {
    expect(screen.getByText(/Total: \$\d+/)).toBeInTheDocument();
  });
});

// 测试 API 交互（Mock 后端）
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.post('/api/orders', (req, res, ctx) => {
    return res(ctx.json({ id: 1, status: 'success' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

**适用场景：**
- ✅ 组件间数据流
- ✅ 状态管理（Redux/Zustand）
- ✅ API 交互（配合 Mock）
- ❌ 完整用户旅程
- ❌ 跨页面流程

**3. E2E 测试（End-to-End Test）**

```javascript
// Playwright 示例
import { test, expect } from '@playwright/test';

test('complete purchase flow', async ({ page }) => {
  await page.goto('/');
  
  // 搜索商品
  await page.fill('[data-testid="search-input"]', 'laptop');
  await page.click('[data-testid="search-button"]');
  
  // 添加到购物车
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="cart-icon"]');
  
  // 结账
  await page.click('[data-testid="checkout-button"]');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="card"]', '4111111111111111');
  await page.click('[data-testid="place-order"]');
  
  // 验证订单成功
  await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
});
```

**适用场景：**
- ✅ 完整用户流程
- ✅ 跨页面导航
- ✅ 登录/支付等关键流程
- ❌ 边界情况
- ❌ 复杂逻辑验证

**测试策略建议：**

| 项目类型 | 单元测试 | 集成测试 | E2E 测试 |
|---------|---------|---------|---------|
| 组件库 | 60% | 30% | 10% |
| 业务应用 | 40% | 40% | 20% |
| 后台系统 | 30% | 40% | 30% |
| 电商/金融 | 30% | 30% | 40% |

**CI 集成配置：**

```yaml
# .github/workflows/test.yml
jobs:
  test:
    steps:
      # 单元测试（快速）
      - run: npm run test:unit -- --ci --coverage
      
      # 集成测试（中速）
      - run: npm run test:integration
      
      # E2E 测试（慢速，只在 main 分支）
      - if: github.ref == 'refs/heads/main'
        run: npm run test:e2e
```

**知识点：** `自动化测试` `单元测试` `集成测试` `E2E 测试` `测试金字塔` `Jest` `Playwright` `Testing Library`

:::