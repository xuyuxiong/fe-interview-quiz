---
title: 低代码平台
description: 低代码引擎、可视化拖拽、物料系统、出码能力面试题
---

# 低代码平台

## 面试题

### Q1: 低代码解决了什么问题？有什么局限性？

> **⭐ 简单 · 低代码**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**解决的问题：**
1. 重复 CRUD 页面开发效率低
2. 表单/列表/详情等标准化页面开发量大
3. 非前端人员无法参与页面搭建
4. 迭代周期长，从需求到上线链路多

**局限性：**
1. 复杂交互难以实现（拖拽/画布/游戏）
2. 性能不如手写代码优化
3. 生成代码可维护性差
4. 学习成本不低（平台本身需要学习）
5. 灵活性受限于平台能力

**适用场景：** 中后台管理页面、表单/列表/详情页、运营活动页、数据看板

**不适用：** 复杂交互页面、高性能要求页面、创意型页面

**知识点：** `低代码` `适用场景` `局限性` `CRUD页面`

:::

### Q2: 低代码引擎的核心架构是什么？

> **🔥 中等 · 低代码**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

以阿里低代码引擎为例，核心架构：

```
┌─────────────────────────────────────┐
│            编辑器框架               │
├─────────┬──────────┬───────────────┤
│ 物料面板 │  画布区  │   属性面板     │
│ (组件库) │ (可视化  │ (配置表单)     │
│         │  编辑)   │               │
├─────────┴──────────┴───────────────┤
│           核心引擎层               │
├──────────┬──────────┬──────────────┤
│  Schema  │  渲染器  │   出码器      │
│  (JSON)  │ (运行时) │ (源码生成)    │
└──────────┴──────────┴──────────────┘
```

**核心概念：**

| 概念 | 说明 |
|------|------|
| Schema | 页面结构的 JSON 描述 |
| 物料 | 可复用的组件（基础组件/业务组件） |
| 画布 | 可视化拖拽编辑区域 |
| 渲染器 | 将 Schema 渲染为真实页面 |
| 出码器 | 将 Schema 转换为源码 |

```json
// Schema 示例
{
  "componentName": "Page",
  "props": {},
  "children": [{
    "componentName": "Button",
    "props": { "type": "primary", "text": "提交" }
  }]
}
```

**知识点：** `低代码引擎` `Schema` `物料` `渲染器` `出码器`

:::

### Q3: 可视化拖拽的实现原理是什么？

> **💀 困难 · 低代码**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心流程：** 拖拽→定位→插入 Schema→重新渲染

```js
// 1. 拖拽开始
function onDragStart(e, component) {
  e.dataTransfer.setData('component', JSON.stringify(component))
}

// 2. 拖拽经过 - 显示插入指示器
function onDragOver(e) {
  e.preventDefault()
  // 计算插入位置（前/后/子节点）
  const dropPosition = calcDropPosition(e, container)
  showIndicator(dropPosition)
}

// 3. 放置 - 更新 Schema
function onDrop(e, targetNode, position) {
  const component = JSON.parse(e.dataTransfer.getData('component'))

  // 在 Schema 树中插入节点
  const newNode = {
    componentName: component.name,
    props: component.defaultProps,
    children: []
  }

  // 根据 position 插入：before/after/inner
  schema.insertNode(targetNode, newNode, position)

  // 重新渲染画布
  renderCanvas(schema)
}

// 4. 选中 - 显示属性面板
function onSelect(nodeId) {
  const node = schema.getNode(nodeId)
  showPropertyPanel(node.props)  // 展示属性配置表单
}

// 5. 修改属性 - 更新 Schema
function onPropChange(nodeId, key, value) {
  schema.updateProp(nodeId, key, value)
  renderCanvas(schema)  // 实时预览
}
```

**关键技术：**
- HTML5 Drag & Drop API 或自定义鼠标事件
- 位置计算：鼠标坐标 → 画布坐标 → 节点位置
- 实时预览：Schema 变更 → 增量渲染

**知识点：** `可视化拖拽` `Drag&Drop` `Schema插入` `位置计算`

:::

### Q4: 低代码的物料系统怎么设计？

> **🔥 中等 · 低代码**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**物料 = 组件 + 元信息（meta）**

```js
// 物料定义
const ButtonMeta = {
  componentName: 'Button',
  title: '按钮',
  docUrl: 'https://docs.example.com/button',
  // 1. 属性配置描述
  props: {
    type: {
      type: 'string',
      title: '按钮类型',
      enum: ['primary', 'default', 'dashed', 'danger'],
      default: 'default'
    },
    text: {
      type: 'string',
      title: '按钮文字',
      default: '按钮'
    }
  },
  // 2. 嵌套规则
  nesting: {
    canDragIn: false,    // 不能拖入子节点
    canDragOut: false
  },
  // 3. 分组
  group: '通用',
  category: '基础组件',
  // 4. 默认 Schema
  schema: {
    componentName: 'Button',
    props: { type: 'primary', text: '按钮' }
  }
}
```

**物料分类：**

| 类型 | 说明 | 示例 |
|------|------|------|
| 基础组件 | 通用 UI | Button/Input/Select |
| 布局组件 | 页面结构 | Row/Col/Card/Tab |
| 业务组件 | 业务逻辑 | OrderForm/UserCard |
| 自定义组件 | 用户开发 | 接入第三方 |

**知识点：** `物料系统` `组件元信息` `属性配置` `物料注册`

:::

### Q5: 低代码 vs 无代码边界是什么？

> **🔥 中等 · 低代码**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 维度 | 低代码 | 无代码 |
|------|--------|--------|
| 目标用户 | 开发者为主 | 非技术人员 |
| 编程能力 | 需要少量代码 | 完全不需要 |
| 灵活性 | 高（可写代码扩展） | 低（受限于平台） |
| 复杂度 | 中高复杂度 | 简单场景 |
| 典型产品 | 阿里低代码引擎、Retool | 宜搭、简道云 |
| 产出 | 源码可导出 | 仅平台内运行 |

**边界模糊化趋势：**
- 低代码平台降低门槛 → 趋近无代码
- 无代码平台开放扩展 → 趋近低代码

**核心区别：** 低代码允许穿插代码（Pro Code），无代码完全图形化。

**知识点：** `低代码` `无代码` `Pro Code` `边界`

:::

### Q6: 低代码平台如何实现出码？

> **💀 困难 · 低代码**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

出码 = 将 Schema JSON 转换为可运行的源码项目

```
Schema JSON → 解析 → 模板引擎 → 源码文件 → 项目工程
```

```js
// 出码器核心逻辑
class CodeGenerator {
  generate(schema) {
    // 1. 解析 Schema 树
    const ast = this.parseSchema(schema)

    // 2. 生成 import 语句
    const imports = this.generateImports(ast)

    // 3. 生成 JSX
    const jsx = this.generateJSX(ast)

    // 4. 生成完整文件
    return this.generateFile(imports, jsx)
  }

  generateJSX(node) {
    const props = Object.entries(node.props)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ')

    const children = node.children
      .map(child => this.generateJSX(child))
      .join('\n')

    return `<${node.componentName} ${props}>\n${children}\n</${node.componentName}>`
  }
}

// 输出示例
// import { Button, Form, Input } from 'antd'
// export default function Page() {
//   return (
//     <Form>
//       <Form.Item label="姓名">
//         <Input />
//       </Form.Item>
//       <Button type="primary">提交</Button>
//     </Form>
//   )
// }
```

**出码 vs 运行时渲染：**

| 方式 | 优势 | 劣势 |
|------|------|------|
| 出码 | 可维护、可调试、可二次开发 | 不可逆（改了源码无法回到 Schema） |
| 运行时 | 实时预览、可逆 | 性能差、不可维护 |

**知识点：** `出码` `Schema转源码` `运行时渲染` `代码生成`

:::
### Q7: 低代码解决了什么问题？

> **🔥 中等 · 低代码**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**痛点：**

| 问题 | 说明 |
|------|------|
| 重复工作 | 大量表单/列表/详情页结构雷同 |
| 开发效率低 | 简单页面也要走完整开发流程 |
| 人力成本 | 初中级开发者做重复工作，高级开发者做类似架构 |
| 需求响应慢 | 运营/产品改动依赖开发排期 |
| 质量不统一 | 不同开发者风格和水平参差 |

**低代码核心价值：**

```text
页面可视化搭建
  → 拖拽组件生成页面
    → 物料市场复用组件
      → 逻辑编排配置交互
        → 一键发布上线
```

**适用场景：**

| 适合 | 不适合 |
|------|--------|
| 表单/列表/详情/CURD页 | 高交互复杂动画页 |
| 运营活动页/H5 | 数据可视化大屏（复杂） |
| 内部管理系统 | 核心业务功能 |
| 简单数据展示 | 高性能要求页面 |

**技术实现：**

```js
// 低代码引擎核心概念
const schema = {
  componentName: 'Page',
  children: [{
    componentName: 'Form',
    props: { layout: 'horizontal' },
    children: [{
      componentName: 'Input',
      props: { label: '姓名', name: 'username' }
    }, {
      componentName: 'Select',
      props: { label: '城市', name: 'city', options: [...] }
    }]
  }]
}

// 渲染器：JSON Schema → React/Vue 组件
function Renderer({ schema }) {
  const Component = componentMap[schema.componentName]
  return (
    <Component {...schema.props}>
      {schema.children?.map((child, i) => <Renderer key={i} schema={child} />)}
    </Component>
  )
}
```

**知识点：** `低代码` `可视化搭建` `JSON Schema` `物料市场` `渲染器`

:::

### Q8: 没有考虑使用已有低代码项目做二次改造吗？

> **🔥 中等 · 低代码**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**市面上主要低代码方案：**

| 方案 | 类型 | 特点 | 适用 |
|------|------|------|------|
| 阿里低代码引擎 | 开源引擎 | 协议标准化、可扩展 | 中后台页面 |
| amis | 百度开源 | JSON驱动、百度风格 | 表单/CRUD |
| Formily | 阿里 | 表单方案 | 复杂表单场景 |
| Retool | 商业 | 连接数据源 | 内部工具 |
| Appsmith | 开源 | 低代码平台 | 内部工具 |

**二次改造的考量：**

```text
✅ 选择二次改造的理由：
├── 节省开发时间，专注业务差异化
├── 社区生态，物料/组件复用
├── 标准化协议，团队协作
└── 持续维护，bug修复有保障

❌ 不选择二次改造的理由：
├── 学习成本 — 需要理解引擎架构
├── 定制受限 — 业务需求可能超出引擎能力
├── 黑盒风险 — 引擎bug难以定位修复
├── 版本绑定 — 升级可能breaking change
└── 性能开销 — 引擎运行时有一定开销
```

**决策框架：**

| 条件 | 建议 |
|------|------|
| 需求标准化+快速交付 | 用成熟方案二次改造 |
| 需求差异化大+团队有实力 | 自研引擎 |
| 核心业务页面 | 自研（可控性优先） |
| 内部工具/运营页 | 二次改造（效率优先） |

**知识点：** `低代码引擎` `二次改造` `技术选型` `amis` `阿里低代码`

:::

### Q9: 怎么界定低代码和无代码的边界？

> **🔥 中等 · 低代码**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**三端谱系：**

```text
Pro Code ←────────────────────────→ No Code
  (纯代码)    Low Code    Light Code    (无代码)
   │            │             │          │
 开发者写      可视化+       配置化+    业务人员
 全部代码      代码扩展      少量脚本    拖拽配置
   │            │             │          │
 React/Vue    阿里LowCode   amis       宜搭/简道
 Next.js      Appsmith      Formily    腾讯微搭
```

| 维度 | Pro Code | Low Code | No Code |
|------|----------|----------|---------|
| 使用者 | 开发者 | 开发者+业务 | 业务人员 |
| 灵活性 | ★★★★★ | ★★★★ | ★★ |
| 学习成本 | 高 | 中 | 低 |
| 产出效率 | 低 | 中 | 高 |
| 定制能力 | 无限 | 扩展点 | 模板内 |
| 典型场景 | 所有 | 标准化业务 | 简单表单/流程 |

**边界判断原则：**

```text
1. 能用 No Code → 不用 Low Code（效率优先）
2. 需要写代码 → Low Code（灵活+效率平衡）
3. 代码占比 > 50% → Pro Code（低代码反增复杂度）

警惕"伪低代码"：
- 配置项比写代码还复杂 → 不如直接写代码
- 需求超出能力边界 → 硬凑低代码反而更慢
- 团队全员开发者 → Pro Code效率更高
```

**知识点：** `低代码` `无代码` `Pro Code` `技术谱系` `边界判断`

:::

### Q10: 市面上已有的低代码方案对比？

> **🔥 中等 · 低代码**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 方案 | 来源 | 开源 | 技术栈 | 定位 | 优势 | 劣势 |
|------|------|------|--------|------|------|------|
| **阿里低代码引擎** | 阿里 | ✅ | React | 引擎级 | 协议开放、可扩展、生态好 | React绑定 |
| **amis** | 百度 | ✅ | React | JSON驱动 | JSON描述UI、功能丰富 | 百度UI风格 |
| **Formily** | 阿里 | ✅ | React/Vue | 表单方案 | 表单能力强、性能好 | 只解决表单 |
| **Appsmith** | - | ✅ | React | 内部工具 | 数据源丰富、社区活跃 | 定制性一般 |
| **ToolJet** | - | ✅ | React | 内部工具 | 插件生态好 | 功能而非页面导向 |
| **Retool** | - | ❌ | React | 内部工具 | 体验好、集成强 | 商业付费 |
| **宜搭** | 阿里 | ❌ | - | SaaS平台 | 开箱即用、钉钉集成 | 定制受限 |
| **微搭** | 腾讯 | ❌ | - | 小程序 | 微信生态、小程序 | 生态绑定 |
| **Power Apps** | 微软 | ❌ | - | 企业级 | Office集成、数据 | 贵、学习曲线 |

**选型建议：**

```text
需求分析：
├── 自研产品、需要深度定制 → 阿里低代码引擎 / 自研
├── 内部工具、快速搭建 → Appsmith / Retool
├── 大量表单场景 → Formily / amis
├── 运营活动页 → 自研搭建平台
├── 小程序低代码 → 微搭
└── 企业办公 → 宜搭 / Power Apps
```

**阿里低代码引擎核心协议：**

```json
{
  "componentName": "Page",
  "props": {},
  "children": [{
    "componentName": "Button",
    "props": { "type": "primary", "children": "提交" }
  }],
  "dataSource": {
    "list": [{
      "id": "fetchUser",
      "options": { "uri": "/api/user", "method": "GET" }
    }]
  }
}
```

**知识点：** `低代码方案` `阿里低代码引擎` `amis` `Formily` `技术选型`

:::
