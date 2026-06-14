#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量修复 18 道答案过浅的面试题
"""
import re
import os

BASE_DIR = "/Users/xilin/Desktop/fe-interview-quiz/docs"

Q7_ANSWER = """
**性能优化闭环是一个持续迭代的过程，包含 5 个核心步骤：**

| 步骤 | 目标 | 工具/方法 | 输出物 |
|------|------|-----------|--------|
| **测量** | 建立基线数据 | Lighthouse, WebPageTest, Performance API | 性能报告 |
| **分析** | 定位瓶颈原因 | Chrome DevTools, 埋点监控 | 问题清单 |
| **优化** | 针对性改进 | 代码重构，资源优化 | 优化方案 |
| **验证** | 对比优化效果 | A/B 测试，灰度发布 | 对比数据 |
| **持续** | 防止性能回归 | CI 集成，性能 budget | 监控告警 |

```js
// 1. 测量 - 使用 Performance API 收集核心指标
const getPerformanceMetrics = () => {
  const timing = performance.getEntriesByType('navigation')[0]
  const paint = performance.getEntriesByType('paint')
  return {
    dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
    tcpConnect: timing.connectEnd - timing.connectStart,
    ttfb: timing.responseStart - timing.requestStart,
    domInteractive: timing.domInteractive - timing.fetchStart,
    domComplete: timing.domComplete - timing.fetchStart,
    firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
    firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
  }
}

// 2. 分析 - 使用 Long Task API 检测主线程阻塞
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log('长任务耗时:', entry.duration, 'ms')
    reportToAnalytics({ type: 'long-task', ...entry })
  }
})
observer.observe({ entryTypes: ['longtask'] })

// 3. 优化 - 针对性措施
// 图片优化：WebP + 懒加载
// 代码优化：Tree Shaking + 代码分割  
// 缓存优化：Service Worker + HTTP 缓存

// 4. 验证 - A/B 测试对比
const runABTest = async (variant) => {
  const metrics = getPerformanceMetrics()
  await sendToAnalytics({ variant, metrics })
}

// 5. 持续 - 性能 budget 监控
const BUDGET = { lcp: 2500, inp: 200, cls: 0.1, jsBundle: 200 * 1024 }
const checkBudget = (metrics) => {
  if (metrics.lcp > BUDGET.lcp) alert('LCP 超出预算！')
}
```

**知识点：**`性能优化` `监控闭环` `Performance API` `Lighthouse` `A/B 测试` `性能 budget`
"""

Q18_ANSWER = """
**Webpack/Vite 打包优化的核心策略：**

| 策略 | 说明 | 配置示例 | 预期收益 |
|------|------|----------|----------|
| **Tree Shaking** | 移除无用导出 | sideEffects: false | 减少 30-50% 体积 |
| **代码分割** | 按需加载模块 | splitChunks | 首屏减少 40% |
| **压缩混淆** | 压缩代码体积 | TerserPlugin | 减少 60-70% |
| **公共库提取** | 复用 vendor 缓存 | cacheGroups | 二次访问快 80% |
| **模块联邦** | 微前端共享 | ModuleFederationPlugin | 跨应用复用 |

```js
// webpack.config.js - 完整优化配置
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10
        },
        common: {
          name: 'common',
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true
          }
        }
      })
    ],
    runtimeChunk: 'single'
  },
  cache: { type: 'filesystem' },
  output: {
    publicPath: 'https://cdn.example.com/',
    filename: 'js/[name].[contenthash:8].js'
  }
}
```

```js
// package.json - 分析打包体积
{
  "scripts": {
    "build:analyze": "webpack --profile --json > stats.json",
    "analyze": "webpack-bundle-analyzer stats.json"
  }
}
```

**Vite 优化：**
```js
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'lodash': ['lodash-es']
        }
      }
    },
    minify: 'terser',
    terserOptions: { compress: { drop_console: true } }
  }
}
```

**知识点：**`打包优化` `Webpack` `Tree Shaking` `代码分割` `Terser` `Vite`
"""

Q19_ANSWER = """
**虚拟列表（Virtual List）只渲染可见区域元素，大幅减少 DOM 节点数量。**

**核心原理：**

| 概念 | 说明 | 计算方式 |
|------|------|----------|
| **容器高度** | 可视区域高度 | containerHeight |
| **项高度** | 单个列表项高度 | itemHeight |
| **可见数量** | 可视区域能显示的项数 | Math.ceil(containerHeight / itemHeight) |
| **起始索引** | 当前滚动位置对应的第一项 | Math.floor(scrollTop / itemHeight) |
| **缓冲区** | 上下额外渲染的项数 | buffer = 5 |

```js
// 原生 JS 实现虚拟列表
class VirtualList {
  constructor(container, data, options = {}) {
    this.container = container
    this.data = data
    this.itemHeight = options.itemHeight || 50
    this.buffer = options.buffer || 5
    this.containerHeight = container.clientHeight
    this.visibleCount = Math.ceil(this.containerHeight / this.itemHeight)
    this.totalHeight = data.length * this.itemHeight
    
    this.wrapper = document.createElement('div')
    this.wrapper.style.cssText = `position: relative; height: ${this.totalHeight}px;`
    this.content = document.createElement('div')
    this.content.style.cssText = 'position: absolute; top: 0; left: 0; right: 0;'
    this.wrapper.appendChild(this.content)
    container.appendChild(this.wrapper)
    
    this.scrollTop = 0
    this.container.addEventListener('scroll', () => this.onScroll())
    this.render()
  }
  
  onScroll() {
    this.scrollTop = this.container.scrollTop
    this.render()
  }
  
  render() {
    const startIndex = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.buffer)
    const endIndex = Math.min(
      this.data.length,
      Math.ceil((this.scrollTop + this.containerHeight) / this.itemHeight) + this.buffer
    )
    this.content.style.transform = `translateY(${startIndex * this.itemHeight}px)`
    const visibleItems = this.data.slice(startIndex, endIndex)
    this.content.innerHTML = visibleItems.map(item => 
      `}