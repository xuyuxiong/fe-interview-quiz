### Q1: 小程序的架构是什么？双线程模型了解吗？

> **🔥 中等 · mini-program/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**小程序采用双线程架构：**

1. **逻辑层（JSCore）**
   - 运行 JS 逻辑代码
   - 独立线程，无 DOM/BOM
   - 通过 Native 桥接通信

2. **渲染层（WebView）**
   - 渲染页面结构
   - 多个 WebView 并行
   - 每个页面一个 WebView

**通信机制：**
```
逻辑层 (JSCore) ←→ Native 桥接 ←→ 渲染层 (WebView)
```

**优势：**
- 安全隔离（逻辑层无法直接操作 DOM）
- 并行渲染（多页面不阻塞）
- 管控能力（Native 层审核）

**知识点：**`小程序架构` `双线程` `JSCore` `WebView`

:::

### Q2: 为什么小程序拿不到 DOM？

> **⭐ 简单 · mini-program/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**逻辑层和渲染层分离，逻辑层运行在 JSCore 中，没有 DOM/BOM API。**

**原因：**
1. 安全考虑（隔离脚本和渲染）
2. 性能考虑（避免频繁跨线程通信）
3. 管控需要（统一渲染标准）

**替代方案：** 使用 setData() 更新数据

```javascript
// 错误：没有 document
document.getElementById('app')

// 正确：数据驱动
this.setData({ text: 'hello' })
```

**知识点：**`小程序` `DOM` `双线程` `setData`

:::

### Q3: 小程序三层架构是什么？

> **🔥 中等 · mini-program/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**三层架构：**

1. **应用层（App）**
   - 全局配置、生命周期
   - 页面路由管理

2. **页面层（Page）**
   - 页面逻辑、数据
   - 事件处理

3. **组件层（Component）**
   - 可复用 UI 组件
   - 属性、数据、方法

**目录结构：**
```
app.js          // 应用逻辑
app.json        // 应用配置
pages/
  index/
    index.js    // 页面逻辑
    index.wxml  // 页面结构
    index.wxss  // 页面样式
    index.json  // 页面配置
```

**知识点：**`小程序架构` `三层架构` `App` `Page` `Component`

:::

### Q4: Taro 跨端是如何实现的？

> **💀 困难 · mini-program/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Taro 通过编译时转换实现跨端：**

1. **统一 API 层**
   - 封装各端差异
   - 提供统一接口

2. **编译时转换**
   - JSX → 各端模板（WXML/SwiftUI 等）
   - 样式转换（CSS → WXSS/React Native 样式）

3. **运行时适配**
   - 多端 API 实现
   - 差异处理

**工作流程：**
```
React/Vue 代码
    ↓
Babel 编译
    ↓
生成 AST
    ↓
平台特定转换
    ↓
小程序代码 / H5 / RN
```

**知识点：**`Taro` `跨端` `编译时` `AST`

:::

### Q5: Taro 如何同时兼容 React 和 Vue？

> **💀 困难 · mini-program/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Taro 3.0+ 采用运行时架构：**

1. **统一 DSL 层**
   - 基于标准 Web API
   - 框架无关

2. **框架适配层**
   - React 使用 React Reconciler
   - Vue 使用 Vue Runtime

3. **统一渲染**
   - 通过 @tarojs/runtime 渲染到各端

**配置：**
```javascript
// config/index.js
module.exports = {
  framework: 'react',  // 或 'vue', 'vue3'
  // ...
}
```

**知识点：**`Taro` `React` `Vue` `运行时架构`

:::

### Q6: Taro 性能优化方案有哪些？

> **🔥 中等 · mini-program/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**优化方案：**

1. **分包加载**
```javascript
// app.json
{
  "subPackages": [
    {
      "root": "pages/activity",
      "pages": ["index"]
    }
  ]
}
```

2. **按需引入**
```javascript
// 引入单个组件
import { Button } from '@tarojs/components'
```

3. **图片优化**
- 使用 CDN
- WebP 格式
- 懒加载

4. **减少 setData**
- 合并更新
- 避免大对象

**知识点：**`Taro` `性能优化` `分包` `按需引入`

:::

### Q7: 小程序在安卓和 iOS 上有什么区别？

> **🔥 中等 · mini-program/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**主要差异：**

| 对比项 | iOS | 安卓 |
|--------|-----|------|
| WebView | WKWebView | X5/系统 WebView |
| 时间格式化 | 支持 | 部分不支持'-' |
| 音频播放 | 策略严格 | 相对宽松 |
| 文件路径 | 一致 | 可能有差异 |

**兼容处理：**
```javascript
// 时间格式化兼容
const date = new Date('2026/01/01')  // 用/不用-

// 用户代理判断
const isIOS = /iOS/.test(navigator.userAgent)
```

**知识点：**`小程序` `兼容性` `iOS` `安卓`

:::

### Q8: 为什么要用 Taro？有什么优势？

> **⭐ 简单 · mini-program/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Taro 优势：**

1. **跨端能力**
   - 一套代码多端运行
   - 小程序、H5、React Native

2. **技术栈灵活**
   - 支持 React/Vue
   - 前端开发者快速上手

3. **生态完善**
   - 丰富的组件库
   - 活跃的社区

4. **开发效率**
   - 代码复用
   - 减少维护成本

**适用场景：**
- 多端业务
- 快速迭代
- 团队技术栈统一

**知识点：**`Taro` `跨端框架` `优势`

:::

### Q9: 小程序生命周期有哪些？

> **⭐ 简单 · mini-program/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**应用生命周期：**
- `onLaunch` - 初始化
- `onShow` - 显示
- `onHide` - 隐藏

**页面生命周期：**
- `onLoad` - 加载
- `onShow` - 显示
- `onReady` - 初次渲染
- `onHide` - 隐藏
- `onUnload` - 卸载

**知识点：**`小程序` `生命周期`

:::

### Q10: 小程序通信方式有哪些？

> **🔥 中等 · mini-program/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**通信方式：**

1. **页面间**
   - getUrlParams 传递
   - 全局数据（getApp）

2. **组件间**
   - properties 父传子
   - triggerEvent 子传父

3. **全局**
   - 全局变量
   - 事件总线

**知识点：**`小程序` `通信` `数据传递`

:::

### Q11: 为什么要用 Taro？Taro 如何实现跨端？

> **🔥 中等 · 小程序**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Taro** 是京东凹凸实验室推出的多端统一开发框架，核心价值是"一套代码，多端运行"。

**支持的目标平台：**

| 平台 | 运行方式 | 支持框架 |
|------|---------|---------|
| 微信小程序 | 编译为WXML/WXSS/JS | React/Vue |
| 支付宝小程序 | 编译为AXML/ACSS/JS | React/Vue |
| H5 | 编译为HTML/CSS/JS | React/Vue |
| React Native | 编译为原生组件 | React |
| 鸿蒙(Harmony) | 编译为ArkTS | React/Vue |

**Taro 跨端原理：**

```text
开发者代码(React JSX / Vue SFC)
        ↓ AST解析 + 代码转换
        ↓
   ┌────┼────┬────────┐
   ↓    ↓    ↓        ↓
 微信  支付宝  H5    React Native
 WXML  AXML  HTML   Native组件
```

```js
// 开发者写的代码
export default function Index() {
  const [list, setList] = useState([])
  return (
    <View className="container">
      <Text>Hello Taro</Text>
      {list.map(item => <View key={item.id}>{item.name}</View>)}
    </View>
  )
}

// 编译到微信小程序 →
// index.wxml: <view class="container"><text>Hello Taro</text>...</view>
// index.wxss: .container { ... }
// index.js: Component({ ... })

// 编译到H5 →
// index.html: <div class="container"><span>Hello Taro</span>...</div>
```

**Taro vs uni-app 对比：**

| 维度 | Taro | uni-app |
|------|------|---------|
| 语法 | React/Vue | Vue |
| 背景 | 京东 | DCloud |
| RN支持 | ✅ | ❌ |
| 编译方式 | AST转换 | 模板编译 |
| TypeScript | ✅ 原生支持 | ✅ 支持 |
| 社区 | 较大 | 更大 |

**跨端兼容性处理：**

```js
// 1. 条件编译
// #ifdef WEAPP
wx.navigateTo({ url: '/pages/detail' })
// #endif

// #ifdef ALIPAY
my.navigateTo({ url: '/pages/detail' })
// #endif

// 2. Taro API 统一（推荐）
Taro.navigateTo({ url: '/pages/detail' })

// 3. 环境判断
if (process.env.TARO_ENV === 'weapp') {
  // 微信特有逻辑
}
```

**知识点：** `Taro` `跨端开发` `AST编译` `多端适配` `条件编译`

:::
### Q12: 小程序的双线程模型是什么？

> **🔥 中等 · 小程序**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**双线程模型架构：**

```
┌─────────────────┐         ┌─────────────────┐
│  逻辑层 (JS)    │         │  渲染层 (View)  │
│  AppService    │         │  WebView       │
│                │         │                │
│  - 业务逻辑    │ <-----> │  - WXML 渲染   │
│  - 数据处理    │  JSBridge │  - WXSS 样式   │
│  - API 调用    │         │  - 用户交互    │
└─────────────────┘         └─────────────────✖
        │                           │
        └─────────┬─────────────────┘
                  │
            ┌────▼────┐
            │ Native  │
            │ 桥接层  │
            └─────────┘
```

**为什么采用双线程？**

```
1. 安全隔离：逻辑层运行在沙箱中，无法直接操作 DOM
2. 性能优化：渲染层专注于 UI 渲染，逻辑层专注于数据处理
3. 防止恶意代码：限制 JS 能力，只能通过 Native 桥接调用 API
```

**通信机制（JSBridge）：**

```js
// 逻辑层 -> 渲染层
// setData 时，数据通过 JSBridge 发送到渲染层
this.setData({ count: this.data.count + 1 })

// 渲染层 -> 逻辑层
// 用户交互事件通过 JSBridge 发送到逻辑层
Page({
  onButtonTap(e) {
    console.log('用户点击', e.detail)
  }
})
```

**性能影响：**

```
问题：频繁 setData 会导致多次跨线程通信，影响性能

解决方案:
1. 批量更新：合并多次 setData
2. 减少数据量：只传变化的数据
3. 使用自定义组件隔离：组件间 setData 不影响页面
4. 避免大对象：不要传整个 app.globalData
```

**最佳实践：**

```js
// ❌ 差：频繁 setData
for (let i = 0; i < 100; i++) {
  this.setData({ count: i })
}

// ✅ 好：批量更新
const updates = {}
for (let i = 0; i < 100; i++) {
  updates.count = i
}
this.setData(updates)

// ✅ 好：使用独立 pageData
this.pageData.temp = value  // 不触发渲染
// 需要时再 setData
this.setData({ displayValue: this.pageData.temp })
```

**知识点：** `双线程模型` `JSBridge` `setData` `性能优化` `小程序原理`

:::

### Q13: 小程序的自定义组件开发？

> **🔥 中等 · 小程序**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**组件基础结构：**

```javascript
// components/my-component/index.js
Component({
  // 组件属性
  properties: {
    title: {
      type: String,
      value: '默认标题',
      observer(newVal, oldVal) {
        console.log('title 变化', newVal)
      }
    },
    count: {
      type: Number,
      value: 0
    }
  },
  
  // 组件数据
  data: {
    internalCount: 0
  },
  
  // 组件方法
  methods: {
    handleTap() {
      this.setData({ internalCount: this.data.internalCount + 1 })
      // 触发事件
      this.triggerEvent('countchange', { 
        value: this.data.internalCount + 1 
      })
    },
    
    // 获取父组件实例
    getParentData() {
      const parent = this.selectOwnerComponent()
      return parent?.data
    }
  },
  
  // 生命周期
  lifetimes: {
    created() {
      console.log('组件创建')
    },
    attached() {
      console.log('组件挂载到页面')
    },
    ready() {
      console.log('组件初次渲染完成')
    },
    detached() {
      console.log('组件销毁')
    }
  },
  
  // 组件所在页面的生命周期
  pageLifetimes: {
    show() {
      console.log('页面显示')
    },
    hide() {
      console.log('页面隐藏')
    }
  }
})
```

**组件模板：**

```html
<!-- components/my-component/index.wxml -->
<view class="my-component" bindtap="handleTap">
  <text>{{title}}</text>
  <text>计数：{{internalCount}}</text>
  <slot></slot>  <!-- 插槽 -->
</view>
```

**组件样式：**

```css
/* components/my-component/index.wxss */
.my-component {
  padding: 20rpx;
  background: #f0f0f0;
}
```

**组件配置：**

```json
{
  "component": true,
  "usingComponents": {},
  "styleIsolation": "isolated"
}
```

**使用组件：**

```html
<!-- page.wxml -->
<my-component 
  title="自定义标题" 
  count="{{pageCount}}"
  bind:countchange="handleCountChange"
>
  <view>插槽内容</view>
</my-component>
```

```javascript
// page.js
Page({
  data: {
    pageCount: 0
  },
  
  handleCountChange(e) {
    this.setData({ pageCount: e.detail.value })
  }
})
```

**组件通信方式：**

| 方式 | 场景 | 实现 |
|------|------|------|
| 父传子 | 属性传递 | properties |
| 子传父 | 事件触发 | triggerEvent |
| 兄弟组件 | 通过共同祖先 | 事件冒泡/ globalevent |
| 跨层级 | 任意组件 | require 共享/全局事件 |

**知识点：** `自定义组件` `properties` `triggerEvent` `生命周期` `组件通信`

:::

### Q14: 小程序的分包加载？

> **🔥 中等 · 小程序**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**为什么需要分包？**

```
小程序主包限制：2MB
全部资源限制：20MB

当项目变大时，必须使用分包加载
```

**分包配置：**

```json
// app.json
{
  "pages": [
    "pages/index/index",
    "pages/home/home"
  ],
  "subPackages": [
    {
      "root": "packages/moduleA",
      "name": "moduleA",
      "pages": [
        "pages/detail/index",
        "pages/list/index"
      ],
      "independent": false
    },
    {
      "root": "packages/moduleB",
      "name": "moduleB",
      "pages": [
        "pages/activity/index"
      ],
      "independent": true,  // 独立分包
      "plugins": {}
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["moduleA"]
    }
  }
}
```

**分包类型：**

| 类型 | 特点 | 适用场景 |
|------|------|----------|
| 普通分包 | 依赖主包 | 大部分业务模块 |
| 独立分包 | 不依赖主包，可独立运行 | 小程序推广落地页 |
| 分包预下载 | 使用时自动下载其他分包 | 提升体验 |

**分包原则：**

```
1. 页面路径必须写在分包的 pages 中
2. 引用其他分包的资源要用绝对路径
3. app.js 只放在主包
4. 公共组件/工具放在主包
5. 分包间不能直接引用代码
```

**分包优化策略：**

```js
// 1. 按功能模块分包
模块 A(2MB) + 模块 B(2MB) + 模块 C(2MB)

// 2. 按使用频率分包
高频功能 -> 主包
低频功能 -> 分包

// 3. 按入口分包
首页相关 -> 主包
二级页面 -> 分包

// 4. 独立分包场景
营销活动页 -> 独立分包（可分享）
```

**分包大小检查：**

```bash
# 使用开发者工具查看分包大小
# 或使用 webpack-bundle-analyzer 分析

# 压缩优化：
- 图片压缩
- 删除未使用代码
- 按需引入组件库
- 使用分包异步化
```

**分包异步化：**

```js
// 某些框架支持分包异步加载
await import(/* webpackChunkName: "moduleA" */ 'packages/moduleA/index')
```

**知识点：** `小程序分包` `性能优化` `包大小限制` `独立分包` `预下载`

:::
