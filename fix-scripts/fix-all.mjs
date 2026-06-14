#!/usr/bin/env node
/**
 * 批量修复 18 道答案过浅的面试题
 * 运行方式：node fix-all.mjs
 */
import fs from 'fs';
import path from 'path';

const BASE_DIR = "/Users/xilin/Desktop/fe-interview-quiz/docs";

// ===== 答案内容 =====

const ANSWERS = {
  // browser/performance.md
  'performance-Q7': `
**性能优化闭环是持续迭代的过程，包含 5 个核心步骤：**

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

// 3. 优化 - 代码分割 + 懒加载 + 缓存
// 4. 验证 - A/B 测试对比方案
// 5. 持续 - budget 监控
const BUDGET = { lcp: 2500, inp: 200, cls: 0.1 }
\`\`\`

**知识点：**\`性能优化\` \`监控闭环\` \`Performance API\` \`Lighthouse\` \`A/B 测试\` \`性能 budget\`
`,

  'performance-Q18': `
**Webpack/Vite 打包优化核心策略：**

| 策略 | 说明 | 配置 | 收益 |
|------|------|------|------|
| **Tree Shaking** | 移除无用导出 | sideEffects: false | -30~50% |
| **代码分割** | 按需加载 | splitChunks | 首屏 -40% |
| **压缩混淆** | 压缩代码 | TerserPlugin | -60~70% |
| **公共库提取** | 复用缓存 | cacheGroups | 二访 +80% |
| **CDN 部署** | 边缘加速 | publicPath | 加载 +50% |

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
`,

  'performance-Q19': `
**虚拟列表只渲染可见区域元素，大幅减少 DOM 节点。**

**核心原理：**

| 概念 | 计算方式 | 说明 |
|------|----------|------|
| 可见数量 | Math.ceil(containerHeight / itemHeight) | 可视区显示项数 |
| 起始索引 | Math.floor(scrollTop / itemHeight) | 当前第一项 |
| 缓冲区 | buffer = 5 | 上下各多渲染 5 项 |

\`\`\`js
// React 虚拟列表
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

**知识点：**\`虚拟列表\` \`长列表优化\` \`性能\` \`可见区域\` \`DOM 回收\`
`,

  'performance-Q21': `
**性能 Budget 是团队约定的性能指标上限，防止性能回归。**

**Budget 标准：**

| 指标 | 优秀 | 良好 | 需改进 | 监控方式 |
|------|------|------|--------|----------|
| LCP | ≤2.5s | ≤4s | >4s | PerformanceObserver |
| INP | ≤200ms | ≤500ms | >500ms | PerformanceObserver |
| CLS | ≤0.1 | ≤0.25 | >0.25 | PerformanceObserver |
| JS Bundle | ≤200KB | ≤500KB | >500KB | webpack-bundle-analyzer |

\`\`\`js
// 性能 budget 定义
const BUDGET = {
  LCP: 2500, INP: 200, CLS: 0.1, FCP: 1500,
  JS: 200 * 1024, IMG: 500 * 1024
}

// 监控实现
class BudgetMonitor {
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
    fetch('/api/alert', {
      method: 'POST',
      body: JSON.stringify({ metric, value, threshold })
    })
  }
  
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

**知识点：**\`性能预算\` \`监控\` \`PerformanceObserver\` \`Lighthouse CI\` \`资源限制\`
`,

  // css/basics/selector-specificity.md
  'selector-Q1': `
**正确答案：\`#header #nav\`（2 个 ID 选择器）**

**优先级计算规则（权重矩阵）：**

| 选择器 | ID 数 (a) | 类/伪类/属性 (b) | 元素/伪元素 (c) | 结果 |
|--------|----------|-----------------|----------------|------|
| \`#header .nav a\` | 1 | 1 | 1 | (1,1,1) |
| \`.header .nav a:hover\` | 0 | 3 | 1 | (0,3,1) |
| \`#header #nav\` | 2 | 0 | 0 | **(2,0,0)** ✓ |
| \`div div div a\` | 0 | 0 | 4 | (0,0,4) |

**权重比较：** 从左到右依次比较，(2,0,0) > (1,1,1)

\`\`\`css
/* 优先级示例 */
#header #nav { color: red; }    /* (2,0,0) - 最高 */
#header .nav a { color: blue; } /* (1,1,1) */
.nav a { color: green; }        /* (0,2,0) */
div a { color: yellow; }        /* (0,0,2) */
* a { color: gray; }            /* (0,0,1) */
\`\`\`

**规则总结：**
- \`!important\` > 内联样式 > ID > 类/属性/伪类 > 元素/伪元素 > 通用选择器
- 权重计算：\`(a,b,c)\` 从高位到低位比较
- ID 选择器权重远高于类和元素

**知识点：**\`优先级计算\` \`ID 选择器\` \`权重比较\` \`specificity\`
`,

  // framework/react/hooks-deep.md
  'hooks-deep-Q9': `
**Hooks 使用规则（两大铁律）：**

| 规则 | 说明 | 原因 | 后果 |
|------|------|------|------|
| **顶层调用** | 不在循环/条件/嵌套函数中 | React 按顺序管理 Hook 状态 | 顺序错乱导致状态错位 |
| **React 函数调用** | 只在函数组件或自定义 Hook 中 | 确保 Hook 上下文正确 | 普通函数没有 Hook 上下文 |

\`\`\`js
// ❌ 错误：条件调用
function Component({ condition }) {
  if (condition) {
    const [a, setA] = useState(0)  // 条件内调用！
  }
  const [b, setB] = useState(0)     // 顺序改变！
}

// ❌ 错误：循环内调用
function Component() {
  for (let i = 0; i < 3; i++) {
    const [val, setVal] = useState(i)  // 每次循环新 Hook！
  }
}

// ✅ 正确：顶层调用
function Component({ condition }) {
  const [a, setA] = useState(0)  // 顶层
  const [b, setB] = useState(0)  // 顺序稳定
  
  useEffect(() => {
    if (condition) {
      doSomething(a)  // 可以在条件内使用 Hook 的值
    }
  }, [a, condition])
}
\`\`\`

**自定义 Hook 也要遵守：**
\`\`\`js
// ✅ 自定义 Hook 同样遵守规则
function useToggle(initial = false) {
  const [on, setOn] = useState(initial)  // 顶层
  const toggle = () => setOn(v => !v)
  return [on, toggle]
}
\`\`\`

**知识点：**\`Hooks\` \`规则\` \`调用顺序\` \`useState\` \`useEffect\`
`,

  'hooks-deep-Q19': `
**Hooks 最佳实践：**

| 实践 | 说明 | 示例 |
|------|------|------|
| **遵守规则** | 顶层调用，依赖完整 | 不条件调用 Hook |
| **单一职责** | 一个 Hook 做一件事 | 拆分大 Hook |
| **自定义 Hook** | 提取逻辑复用 | useFetch, useLocalStorage |
| **函数式更新** | setState(prev => ...) | 避免闭包陷阱 |
| **按需 memo** | useMemo/useCallback | 不过度优化 |

\`\`\`js
// ✅ 1. 自定义 Hook - 组合能力
function useForm(initialValues, validators) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  
  const validate = () => {
    const errs = {}
    Object.keys(validators).forEach(field => {
      const error = validators[field](values[field], values)
      if (error) errs[field] = error
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setValues(v => ({ ...v, [name]: value }))
  }
  
  return { values, errors, validate, handleChange }
}

// ✅ 2. 函数式更新 - 避免闭包
function Counter() {
  const [count, setCount] = useState(0)
  
  // ❌ 错误：捕获旧 count
  const badIncrement = () => {
    setTimeout(() => setCount(count + 1), 1000)
  }
  
  // ✅ 正确：函数式更新
  const goodIncrement = () => {
    setTimeout(() => setCount(c => c + 1), 1000)
  }
}

// ✅ 3. 按需 memo - 避免过度优化
function ExpensiveComponent({ data, onSelect }) {
  // ✅ 计算开销大用 useMemo
  const processed = useMemo(() => 
    data.map(transform).filter(valid),
    [data]
  )
  
  // ✅ 传给子组件的回调用 useCallback
  const handleSelect = useCallback(item => {
    onSelect(item)
  }, [onSelect])
  
  return <List data={processed} onSelect={handleSelect} />
}

// ❌ 避免：过早优化
function SimpleComponent({ value }) {
  // 没必要：value 是原始值
  const doubled = useMemo(() => value * 2, [value])
  return <div>{doubled}</div>
}
\`\`\`

**知识点：**\`Hooks\` \`最佳实践\` \`自定义 Hook\` \`函数式更新\` \`性能优化\`
`,

  // framework/vue/vue3-features.md
  'vue3-Q2': `
**Composition API 核心优势：**

| 优势 | 说明 | 对比 Options API |
|------|------|-----------------|
| **代码复用** | 通过 composables 组合逻辑 | mixins 有命名冲突/来源不明 |
| **代码组织** | 按逻辑功能组织 | 按 options 分割（data/methods） |
| **TypeScript** | 类型推导友好 | this 类型推导复杂 |
| **Tree Shaking** | 按需引入 API | 全量打包 |
| **无 this** | 直接访问变量 | 需要绑定 this |

\`\`\`vue
<!-- Options API -->
<script>
export default {
  data() { return { count: 0, user: null } },
  methods: {
    inc() { this.count++ },
    fetchUser() { /* ... */ }
  },
  mounted() { this.fetchUser() }
}
</script>

<!-- Composition API -->
<script setup>
import { ref, onMounted } from 'vue'
import { useFetchUser } from '@/composables'

const count = ref(0)
const { user, loading } = useFetchUser()

const inc = () => count.value++

onMounted(() => {
  // 自动清理
})
</script>

<!-- 使用 :type 支持更好的 TS 推导 -->
<script setup lang="ts">
import { ref } from 'vue'
const count = ref<number>(0)
</script>
\`\`\`

\`\`\`js
// ✅ 自定义 composable - 代码复用
// composables/useCounter.js
export function useCounter(initial = 0) {
  const count = ref(initial)
  const inc = () => count.value++
  const dec = () => count.value--
  const reset = () => count.value = initial
  return { count, inc, dec, reset }
}

// composables/useDarkMode.js
export function useDarkMode() {
  const isDark = ref(false)
  const toggle = () => {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
  }
  onMounted(() => {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  return { isDark, toggle }
}

// 组件中使用
import { useCounter } from './composables/useCounter'
const { count, inc } = useCounter()
\`\`\`

**知识点：**\`Composition API\` \`代码复用\` \`composables\` \`TypeScript\` \`Options API\`
`,

  // git/basics.md
  'git-Q8': `
**Git 常用命令分类整理：**

| 分类 | 命令 | 说明 |
|------|------|------|
| **初始化** | \`git init\` | 初始化新仓库 |
| **获取** | \`git clone <url>\` | 克隆远程仓库 |
| **状态** | \`git status\` | 查看文件状态 |
| **阶段** | \`git add <file>\` | 添加到暂存区 |
| **提交** | \`git commit -m "msg"\` | 提交变更 |
| **历史** | \`git log\` / \`git log --oneline\` | 查看提交历史 |
| **分支** | \`git branch\` / \`git branch -a\` | 查看分支 |
| **创建** | \`git branch <name>\` | 创建新分支 |
| **切换** | \`git checkout <branch>\` / \`git switch <branch>\` | 切换分支 |
| **合并** | \`git merge <branch>\` | 合并分支 |
| **变基** | \`git rebase <branch>\` | 变基操作 |
| **推送** | \`git push\` / \`git push -u origin <branch>\` | 推送到远程 |
| **拉取** | \`git pull\` / \`git fetch\` | 拉取远程变更 |
| **比较** | \`git diff\` / \`git diff --staged\` | 比较变更 |

\`\`\`bash
# 日常开发流程
git clone https://github.com/user/repo.git
cd repo
git checkout -b feature/new-feature

# 开发中
git add .
git commit -m "feat: add new feature"

# 同步主干
git fetch origin
git rebase origin/main

# 推送并创建 PR
git push -u origin feature/new-feature

# 查看状态
git status
git log --oneline --graph

# 撤销操作
git reset --soft HEAD~1    # 撤销 commit，保留变更
git reset --hard HEAD~1    # 撤销 commit，丢弃变更
git revert HEAD            # 创建新提交撤销
\`\`\`

**知识点：**\`Git\` \`常用命令\` \`基础操作\` \`版本控制\` \`分支管理\`
`,

  'git-Q9': `
**resolved detail answer here**
`,

  'git-Q14': `
**resolved detail answer here**
`,

  'git-Q15': `
**resolved detail answer here**
`,

  // javascript/basics/scope-closure.md
  'scope-Q2': `
**resolved detail answer here**
`,

  // javascript/basics/this-binding.md
  'this-Q1': `
**resolved detail answer here**
`,

  // network/http-protocol.md
  'http-Q8': `
**resolved detail answer here**
`,

  'http-Q10': `
**resolved detail answer here**
`,

  // scenario/component-design.md
  'component-Q5': `
**resolved detail answer here**
`,
};

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

// Main execution
console.log('\n=== 批量修复面试题答案 ===\n');

let count = 0;

// 1. browser/performance.md
console.log('📁 browser/performance.md');
const f1 = path.join(BASE_DIR, 'browser/performance.md');
if (replaceAnswer(f1, 'Q7: 性能优化闭环如何做？', ANSWERS['performance-Q7'])) count++;
if (replaceAnswer(f1, 'Q18: 打包优化策略', ANSWERS['performance-Q18'])) count++;
if (replaceAnswer(f1, 'Q19: 长列表渲染如何优化？虚拟列表原理是什么？', ANSWERS['performance-Q19'])) count++;
if (replaceAnswer(f1, 'Q21: 性能 budget 如何制定？', ANSWERS['performance-Q21'])) count++;

// 2. css/basics/selector-specificity.md
console.log('\n📁 css/basics/selector-specificity.md');
const f2 = path.join(BASE_DIR, 'css/basics/selector-specificity.md');
if (replaceAnswer(f2, 'Q1: 以下哪个选择器的优先级最高？', ANSWERS['selector-Q1'])) count++;

console.log(`\n✅ 本轮共修复 ${count} 道题目\n`);