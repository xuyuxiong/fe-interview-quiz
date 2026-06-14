#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const BASE_DIR = "/Users/xilin/Desktop/fe-interview-quiz/docs";

// Q7 answer
const Q7 = `
**性能优化闭环是一个持续迭代的过程，包含 5 个核心步骤：**

| 步骤 | 目标 | 工具/方法 | 输出物 |
|------|------|-----------|--------|
| **测量** | 建立基线数据 | Lighthouse, WebPageTest, Performance API | 性能报告 |
| **分析** | 定位瓶颈原因 | Chrome DevTools, 埋点监控 | 问题清单 |
| **优化** | 针对性改进 | 代码重构，资源优化 | 优化方案 |
| **验证** | 对比优化效果 | A/B 测试，灰度发布 | 对比数据 |
| **持续** | 防止性能回归 | CI 集成，性能 budget | 监控告警 |

\`\`\`js
// 1. 测量 - Performance API
const getMetrics = () => {
  const t = performance.getEntriesByType('navigation')[0]
  return {
    ttfb: t.responseStart - t.requestStart,
    domReady: t.domInteractive - t.fetchStart,
    complete: t.domComplete - t.fetchStart
  }
}

// 2. 分析 - Long Task API
new PerformanceObserver(list => {
  list.getEntries().forEach(e => {
    console.log('长任务:', e.duration, 'ms')
    reportToAnalytics({ type: 'long-task', duration: e.duration })
  })
}).observe({ entryTypes: ['longtask'] })

// 3. 优化 - 针对性措施
// - 图片 WebP+ 懒加载
// - 代码 Tree Shaking+ 分割
// - 缓存 Service Worker

// 4. 验证 - A/B 测试
const test = async v => {
  const m = getMetrics()
  await send({ variant: v, metrics: m })
}

// 5. 持续 - budget 监控
const BUDGET = { lcp: 2500, inp: 200, cls: 0.1 }
if (metrics.lcp > BUDGET.lcp) alert('LCP 超标')
\`\`\`

**知识点：**\`性能优化\` \`监控闭环\` \`Performance API\` \`Lighthouse\` \`A/B 测试\` \`性能 budget\`
`;

// Q18 answer
const Q18 = `
**Webpack/Vite 打包优化核心策略：**

| 策略 | 说明 | 配置 | 收益 |
|------|------|------|------|
| **Tree Shaking** | 移除无用导出 | sideEffects: false | -30~50% |
| **代码分割** | 按需加载 | splitChunks | 首屏 -40% |
| **压缩混淆** | 压缩代码 | TerserPlugin | -60~70% |
| **公共库提取** | 复用缓存 | cacheGroups | 二访 +80% |
| **CDN 部署** | 边缘加速 | output.publicPath | 加载 +50% |

\`\`\`js
// webpack.config.js
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          priority: 10
        },
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: { drop_console: true, drop_debugger: true }
        }
      })
    ],
    runtimeChunk: 'single'
  },
  cache: { type: 'filesystem' },
  output: {
    publicPath: 'https://cdn.example.com/',
    filename: '[name].[contenthash:8].js'
  }
}
\`\`\`

\`\`\`js
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
\`\`\`

**知识点：**\`打包优化\` \`Webpack\` \`Tree Shaking\` \`代码分割\` \`Terser\` \`Vite\`
`;

// Q19 answer
const Q19 = `
**虚拟列表只渲染可见区域元素，大幅减少 DOM 节点。**

**核心原理：**

| 概念 | 计算方式 | 说明 |
|------|----------|------|
| 可见数量 | Math.ceil(containerHeight / itemHeight) | 可视区显示项数 |
| 起始索引 | Math.floor(scrollTop / itemHeight) | 当前第一项 |
| 缓冲区 | buffer = 5 | 上下各多渲染 5 项 |

\`\`\`js
// React 虚拟列表实现
function VirtualList({ data, itemHeight = 50 }) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerHeight = 300
  const buffer = 5
  
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer)
  const endIndex = Math.min(data.length, startIndex + visibleCount + buffer * 2)
  const visibleData = data.slice(startIndex, endIndex)
  
  return (
    <div 
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={e => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: data.length * itemHeight, position: 'relative' }}>
        <div style={{ 
          position: 'absolute',
          top: 0,
          transform: \`translateY(\${startIndex * itemHeight}px)\`
        }}>
          {visibleData.map((item, i) => (
            <div key={startIndex + i} style={{ height: itemHeight }}>
              {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
\`\`\`

\`\`\`js
// 原生 JS 实现
class VirtualList {
  constructor(container, data, itemHeight = 50) {
    this.container = container
    this.data = data
    this.itemHeight = itemHeight
    this.buffer = 5
    this.totalHeight = data.length * itemHeight
    
    container.innerHTML = \`
      <div style="height: \${this.totalHeight}px; position: relative;">
        <div id="content" style="position: absolute; top: 0;"></div>
      </div>
    \`
    container.addEventListener('scroll', () => this.render())
    this.render()
  }
  
  render() {
    const scrollTop = this.container.scrollTop
    const containerHeight = this.container.clientHeight
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer)
    const endIndex = Math.min(
      this.data.length,
      Math.ceil((scrollTop + containerHeight) / this.itemHeight) + this.buffer
    )
    
    const content = this.container.querySelector('#content')
    content.style.transform = \`translateY(\${startIndex * this.itemHeight}px)\`
    content.innerHTML = this.data.slice(startIndex, endIndex)
      .map(item => \`<div style="height: \${this.itemHeight}px">\${item.name}</div>\`)
      .join('')
  }
}
\`\`\`

**知识点：**\`虚拟列表\` \`长列表优化\` \`性能\` \`可见区域\` \`DOM 回收\`
`;

// Q21 answer
const Q21 = `
**性能 Budget 是团队约定的性能指标上限，防止性能回归。**

**Budget 标准：**

| 指标 | 优秀 | 良好 | 需改进 | 监控方式 |
|------|------|------|--------|----------|
| LCP | ≤2.5s | ≤4s | >4s | PerformanceObserver |
| INP | ≤200ms | ≤500ms | >500ms | PerformanceObserver |
| CLS | ≤0.1 | ≤0.25 | >0.25 | PerformanceObserver |
| JS Bundle | ≤200KB | ≤500KB | >500KB | webpack-bundle-analyzer |
| 图片 | ≤100KB | ≤300KB | >300KB | 上传校验 |

\`\`\`js
// 性能 budget 定义
const BUDGET = {
  LCP: 2500,    // 2.5s
  INP: 200,     // 200ms
  CLS: 0.1,     // 0.1
  FCP: 1500,    // 1.5s
  JS: 200 * 1024,  // 200KB
  IMG: 500 * 1024  // 500KB
}

// 监控实现
class BudgetMonitor {
  constructor() {
    this.violations = []
    this.observe()
  }
  
  observe() {
    new PerformanceObserver(list => {
      list.getEntries().forEach(e => {
        if (e.name === 'first-contentful-paint' && e.startTime > BUDGET.FCP) {
          this.report('FCP', e.startTime, BUDGET.FCP)
        }
      })
    }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
  }
  
  report(metric, value, threshold) {
    this.violations.push({ metric, value, threshold })
    fetch('/api/alert', {
      method: 'POST',
      body: JSON.stringify({ metric, value, threshold })
    })
  }
  
  // 检查资源大小
  checkResources() {
    const resources = performance.getEntriesByType('resource')
    let jsSize = 0, imgSize = 0
    resources.forEach(r => {
      if (r.initiatorType === 'script') jsSize += r.transferSize
      if (r.initiatorType === 'img') imgSize += r.transferSize
    })
    if (jsSize > BUDGET.JS) console.warn('JS 超标:', jsSize)
    if (imgSize > BUDGET.IMG) console.warn('图片超标:', imgSize)
  }
}
\`\`\`

\`\`\`json
// .lighthouserc.json - CI 集成
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["warn", { "minScore": 0.9 }],
        "circular:self": "error",
        "lt:LCP": ["warn", { "maxNumericValue": 2500 }]
      }
    }
  }
}
\`\`\`

**知识点：**\`性能预算\` \`监控\` \`PerformanceObserver\` \`Lighthouse CI\` \`资源限制\`
`;

// Read file and replace answer
function replaceAnswer(filePath, qMarker, newAnswer) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  const regex = new RegExp(
    `(### ${qMarker}.*?::: details 🔍 点击查看答案与解析\\n\\n#### ✅ 答案\\n)(.*?)(\\n\\n\\*\\*知识点：\\*\\*.*?)\\n\\n:::`,
    's'
  );
  
  const match = content.match(regex);
  if (match) {
    const oldBlock = match[0];
    const newBlock = match[1] + newAnswer.trim() + '\n\n' + match[3] + '\n\n:::';
    content = content.replace(oldBlock, newBlock);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${path.basename(filePath)} - ${qMarker}`);
    return true;
  }
  console.log(`❌ ${path.basename(filePath)} - ${qMarker} 未匹配`);
  return false;
}

// Main
let count = 0;
console.log('\n=== browser/performance.md ===');
const f1 = path.join(BASE_DIR, 'browser/performance.md');
if (replaceAnswer(f1, 'Q7: 性能优化闭环如何做？', Q7)) count++;
if (replaceAnswer(f1, 'Q18: 打包优化策略', Q18)) count++;
if (replaceAnswer(f1, 'Q19: 长列表渲染如何优化？虚拟列表原理是什么？', Q19)) count++;
if (replaceAnswer(f1, 'Q21: 性能 budget 如何制定？', Q21)) count++;

console.log(`\n✅ 已修复 ${count} 道题目\n`);