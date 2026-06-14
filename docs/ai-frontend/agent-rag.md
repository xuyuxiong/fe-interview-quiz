---
title: AI Agent 与 RAG
description: AI Agent架构、Function Calling、RAG前端优化、Token管理、向量数据库等AI前端面试题
---

# AI Agent 与 RAG

## 面试题

### Q1: AI Agent 的核心架构是什么？与普通聊天机器人有什么区别？

> **🔥 中等 · AI前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 维度 | 普通聊天机器人 | AI Agent |
|------|-------------|----------|
| 交互模式 | 单轮问答 | 多轮自主决策 |
| 工具使用 | 无 | 可调用外部工具（搜索/计算/代码执行） |
| 规划能力 | 无 | 任务分解、步骤规划 |
| 记忆 | 短期上下文 | 长期记忆 + 工作记忆 |
| 自主性 | 被动回答 | 主动推理和行动 |

**Agent 核心架构：**

```
用户输入 → 意图理解 → 规划(Planning) → 工具选择(Tool Selection)
                                                    ↓
                                              执行工具(Action)
                                                    ↓
                                          观察结果(Observation)
                                                    ↓
                                         反思(Reflection) → 循环直到完成
                                                    ↓
                                              输出最终回答
```

**前端实现要点：**
1. **状态机管理**：思考→工具调用→观察→回答 的状态流转
2. **逐步展示**：向用户实时展示 Agent 的思考过程
3. **工具调用 UI**：展示调用了什么工具、参数是什么、结果是什么
4. **错误恢复**：工具调用失败时的重试/替代方案

**知识点：** `AI Agent` `ReAct` `工具调用` `状态机` `规划`

:::

### Q2: Function Calling（函数调用）在前端如何实现？

> **🔥 中等 · AI前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Function Calling 流程：**

```
用户提问 → LLM 判断需要调用工具 → 返回 tool_calls → 前端执行工具
→ 将结果返回 LLM → LLM 生成最终回答
```

```js
// 1. 定义工具
const tools = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: '获取指定城市天气',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: '城市名' }
        },
        required: ['city']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_knowledge',
      description: '搜索知识库',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: '搜索关键词' }
        },
        required: ['query']
      }
    }
  }
]

// 2. 前端处理流程
async function chatWithTools(messages) {
  // 第一次请求：让 LLM 决定是否调用工具
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ messages, tools })
  })
  const data = await response.json()

  // 检查是否有工具调用
  if (data.tool_calls) {
    // 3. 执行所有工具调用
    const toolResults = await Promise.all(
      data.tool_calls.map(async (call) => {
        const args = JSON.parse(call.function.arguments)
        const result = await executeTool(call.function.name, args)
        return {
          tool_call_id: call.id,
          role: 'tool',
          content: JSON.stringify(result)
        }
      })
    )

    // 4. 将工具结果返回给 LLM
    messages.push(data)           // AI 的工具调用消息
    messages.push(...toolResults) // 工具执行结果
    return chatWithTools(messages) // 递归调用
  }

  return data.content // 最终回答
}

// 5. 工具执行路由
async function executeTool(name, args) {
  switch (name) {
    case 'get_weather':
      return fetch(`/api/weather?city=${args.city}`).then(r => r.json())
    case 'search_knowledge':
      return fetch(`/api/search?q=${args.query}`).then(r => r.json())
    default:
      throw new Error(`Unknown tool: ${name}`)
  }
}
```

**前端注意事项：**
- 工具调用可能嵌套（LLM 可能连续调用多个工具）
- 需要展示工具调用过程给用户（透明性）
- 需要超时和错误处理

**知识点：** `Function Calling` `工具调用` `OpenAI API` `tool_calls`

:::

### Q3: RAG（检索增强生成）在前端可以做哪些优化？

> **💀 困难 · AI前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**RAG 前端优化链路：**

```
用户输入 → 查询预处理 → 向量检索 → 上下文注入 → LLM 生成 → 后处理 → 展示
```

| 环节 | 前端优化点 |
|------|----------|
| 查询预处理 | 意图识别、Query 改写、关键词提取 |
| 向量检索 | 前端缓存检索结果、预加载 |
| 上下文注入 | 突出引用来源、引用高亮 |
| LLM 生成 | 流式展示、引用标注 |
| 展示 | Markdown 渲染、来源跳转 |

```js
// 1. 查询预处理 - 前端侧
function preprocessQuery(query) {
  // 去除无关字符
  const cleaned = query.trim().replace(/[^\w\u4e00-\u9fa5？?]/g, ' ')
  // 意图识别（前端简单判断）
  const isCodeQuery = /代码|实现|写一个/.test(cleaned)
  const isConceptQuery = /是什么|介绍|解释/.test(cleaned)
  return { cleaned, intent: isCodeQuery ? 'code' : isConceptQuery ? 'concept' : 'general' }
}

// 2. 检索结果缓存
const searchCache = new Map()
async function searchWithCache(query) {
  if (searchCache.has(query)) return searchCache.get(query)
  const result = await fetch('/api/rag/search', { body: JSON.stringify({ query }) })
  const data = await result.json()
  searchCache.set(query, data)
  return data
}

// 3. 引用来源展示
function RAGResponse({ content, sources }) {
  return (
    <div>
      <Markdown content={content} />
      <div className="sources">
        <h4>参考来源：</h4>
        {sources.map((src, i) => (
          <div key={i} className="source-item">
            <span className="source-index">[{i + 1}]</span>
            <a href={src.url}>{src.title}</a>
            <span className="relevance">相关度: {(src.score * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// 4. 预加载 - 用户输入时预检索
function usePreSearch() {
  const timerRef = useRef(null)
  const onInputChange = (value) => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      if (value.length > 3) searchWithCache(value) // 预搜索
    }, 300)
  }
  return { onInputChange }
}
```

**知识点：** `RAG` `检索增强生成` `查询预处理` `引用来源` `前端缓存`

:::

### Q4: 什么是 Token？前端为什么需要关注 Token 的计算和限制？

> **🔥 中等 · AI前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Token 是什么：** LLM 处理文本的最小单位，约 1 个中文字 ≈ 1-2 个 token，1 个英文单词 ≈ 1-3 个 token。

**前端为什么关注 Token：**

1. **模型上下文窗口限制：** GPT-4 上下文 128K tokens，超出会截断
2. **费用计算：** 按 token 计费，需要前端估算成本
3. **流式输出 token 计数：** 实时显示已生成/剩余 token
4. **长对话管理：** 超出限制时需要裁剪历史

```js
// Token 估算（前端简易版）
function estimateTokens(text) {
  // 中文约 1 字 = 1.5 token，英文约 4 字符 = 1 token
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length
  const otherChars = text.length - chineseChars
  return Math.ceil(chineseChars * 1.5 + otherChars / 4)
}

// 长对话 Token 管理
class ConversationManager {
  constructor(maxTokens = 4000) {
    this.maxTokens = maxTokens
    this.messages = []
  }

  addMessage(role, content) {
    this.messages.push({ role, content })
    this.trimIfNeeded()
  }

  trimIfNeeded() {
    let totalTokens = this.messages.reduce(
      (sum, m) => sum + estimateTokens(m.content), 0
    )
    // 保留 system 消息，从最早的消息开始裁剪
    while (totalTokens > this.maxTokens && this.messages.length > 1) {
      if (this.messages[0].role === 'system') {
        // 跳过 system 消息，裁剪第二条
        const removed = this.messages.splice(1, 1)[0]
        totalTokens -= estimateTokens(removed.content)
      } else {
        const removed = this.messages.shift()
        totalTokens -= estimateTokens(removed.content)
      }
    }
  }
}
```

**Token 溢出处理策略：**
- **滑动窗口：** 保留最近 N 轮对话
- **摘要压缩：** 对早期对话生成摘要替代
- **向量检索：** 用 RAG 代替全量历史

**知识点：** `Token` `上下文窗口` `费用估算` `长对话管理` `滑动窗口`

:::

### Q5: 向量数据库是什么？前端什么时候会直接与向量数据库交互？

> **🔥 中等 · AI前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**向量数据库：** 存储和检索高维向量的专用数据库，用于语义搜索，而非关键词匹配。

| 向量数据库 | 特点 |
|-----------|------|
| Pinecone | 云托管，API 友好 |
| Milvus | 开源，高性能 |
| Weaviate | 开源，支持混合搜索 |
| Chroma | 轻量，Python 优先 |
| Qdrant | Rust 编写，高性能 |

**前端直接交互场景：**

1. **客户端嵌入搜索：** 纯前端向量搜索（小规模数据）
2. **浏览器端嵌入计算：** 使用 Transformers.js 在浏览器计算 embedding
3. **RAG 知识库可视化：** 向量空间可视化展示

```js
// 浏览器端向量搜索（小规模）
class VectorSearch {
  constructor() {
    this.vectors = []  // { id, embedding, metadata }
  }

  // 添加向量
  add(id, embedding, metadata) {
    this.vectors.push({ id, embedding, metadata })
  }

  // 余弦相似度搜索
  search(queryEmbedding, topK = 5) {
    const similarities = this.vectors.map(v => ({
      ...v,
      score: this.cosineSimilarity(queryEmbedding, v.embedding)
    }))
    return similarities
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
  }

  cosineSimilarity(a, b) {
    const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
    const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0))
    const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0))
    return dot / (normA * normB)
  }
}

// 使用 Transformers.js 在浏览器计算 embedding
import { pipeline } from '@xenova/transformers'
const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
const embedding = await embedder('搜索文本', { pooling: 'mean', normalize: true })
```

**知识点：** `向量数据库` `嵌入` `余弦相似度` `Transformers.js` `语义搜索`

:::

### Q6: Prompt Engineering（提示工程）是什么？前端如何管理 Prompt？

> **🔥 中等 · AI前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Prompt Engineering：** 通过精心设计输入提示来引导 LLM 生成期望输出的技术。

**常见 Prompt 技术：**

| 技术 | 说明 |
|------|------|
| Zero-shot | 不给示例，直接提问 |
| Few-shot | 给几个示例再提问 |
| CoT（思维链） | 让模型"一步一步思考" |
| Prompt Chaining | 将复杂任务拆分为多个 prompt |
| RAG | 检索相关文档注入上下文 |

**前端 Prompt 管理方案：**

```js
// 1. 模板化管理
const promptTemplates = {
  codeReview: {
    system: '你是一个代码审查专家，请用中文审查以下代码：',
    variables: ['language', 'code', 'focus'],
    template: (vars) => `
请审查以下 ${vars.language} 代码，重点关注${vars.focus}方面：
\`\`\`${vars.language}
${vars.code}
\`\`\`
请给出：1. 问题列表 2. 改进建议 3. 评分(1-10)
    `
  },
  summarize: {
    system: '你是一个文档摘要专家',
    variables: ['content', 'length'],
    template: (vars) => `请将以下内容总结为${vars.length}字以内的摘要：\n${vars.content}`
  }
}

// 2. Prompt 版本管理
class PromptManager {
  constructor() {
    this.prompts = new Map()
  }

  register(name, template, version = '1.0') {
    this.prompts.set(`${name}@${version}`, template)
  }

  get(name, version = 'latest') {
    return this.prompts.get(`${name}@${version}`)
  }

  render(name, vars, version) {
    const template = this.get(name, version)
    return template(vars)
  }
}

// 3. 防注入：用户输入隔离
function buildSafePrompt(systemPrompt, userInput) {
  // 用分隔符隔离用户输入
  return `${systemPrompt}\n\n--- 用户输入开始 ---\n${sanitize(userInput)}\n--- 用户输入结束 ---`
}
```

**知识点：** `Prompt Engineering` `思维链` `Prompt模板` `版本管理` `防注入`

:::

### Q7: 如何设计一个通用的 AI Chat 组件库？

> **💀 困难 · AI前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心模块设计：**

```
@ai-chat/core        - 核心抽象层（Provider/Message/Tool）
@ai-chat/react       - React 组件
@ai-chat/vue         - Vue 组件
@ai-chat/markdown    - Markdown 渲染插件
@ai-chat/code-block  - 代码高亮插件
@ai-chat/tools       - 内置工具（搜索/绘图/代码执行）
```

```tsx
// 核心 API 设计
interface AIChatConfig {
  provider: LLMProvider          // OpenAI/Anthropic/本地模型
  model: string                  // 模型名称
  systemPrompt?: string          // 系统提示
  tools?: ToolDefinition[]       // 可用工具
  maxTokens?: number             // 最大 token
  temperature?: number           // 温度
  streaming?: boolean            // 是否流式
}

// 消息类型
type Message = {
  id: string
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  toolCalls?: ToolCall[]         // 工具调用
  toolResults?: ToolResult[]     // 工具结果
  metadata?: { tokens?: number, latency?: number }
  status: 'sending' | 'streaming' | 'done' | 'error'
}

// 特性：
// 1. Provider 抽象 - 一套API适配多种模型
// 2. 插件系统 - Markdown渲染/代码高亮/工具展示
// 3. 主题定制 - CSS变量/样式覆盖
// 4. 无障碍 - 键盘导航/屏幕阅读器
// 5. 虚拟滚动 - 万条消息不卡顿
```

**知识点：** `AI组件库` `Provider抽象` `插件系统` `跨框架` `消息类型`

:::

### Q8: WebGPU 是什么？它对前端 AI 应用有什么影响？

> **🔥 中等 · AI前端**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**WebGPU：** 浏览器中的 GPU 计算API，是 WebGL 的后继者。

| 特性 | WebGL | WebGPU |
|------|-------|--------|
| 主要用途 | 图形渲染 | 通用计算+图形渲染 |
| 计算着色器 | ❌ | ✅ |
| 性能 | 较低 | 更高（更接近原生） |
| API 风格 | 状态机 | 面向对象 |
| 多线程 | 有限 | 支持 |

**对 AI 的影响：**

```js
// WebGPU 可以在浏览器中运行 LLM 推理
import { MLCChat } from '@mlc-ai/web-llm'

const chat = new MLCChat()
await chat.reload('Llama-2-7b-chat-hf-q4f32_1')

const response = await chat.generate('Hello!', {
  streaming: true,
  onChunk: (chunk) => appendText(chunk)
})
```

**关键应用场景：**
1. **浏览器端推理：** 无需服务器，直接在浏览器运行小模型
2. **图像生成：** Stable Diffusion 浏览器版
3. **向量计算加速：** embedding 计算和相似度搜索
4. **视频处理：** 实时 AI 视频效果

**限制：** 目前仅 Chrome 113+ 支持，模型大小受浏览器内存限制。

**知识点：** `WebGPU` `计算着色器` `浏览器端推理` `MLC` `WebLLM`

:::
### Q9: RAG 的完整流程？文档切片策略？

> **🔥 中等 · AI 应用**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**RAG (Retrieval-Augmented Generation) 完整流程：**

```
用户查询
  ↓
1. 查询理解与改写
  ↓
2. 向量检索（从知识库找相关文档）
  ↓
3. 重排序（可选，精细排序）
  ↓
4. 构建 Prompt（上下文 + 查询）
  ↓
5. LLM 生成回答
  ↓
返回结果
```

**实现代码：**

```js
// 1. 文档预处理（离线）
async function processDocument(text) {
  // 切片
  const chunks = chunkDocument(text)
  
  // 向量化
  const embeddings = []
  for (const chunk of chunks) {
    const embedding = await getEmbedding(chunk)
    embeddings.push({ chunk, embedding })
  }
  
  // 存储到向量数据库
  await vectorDB.insert(embeddings)
}

// 2. 查询流程（在线）
async function ragQuery(userQuery) {
  // 1. 查询向量化
  const queryEmbedding = await getEmbedding(userQuery)
  
  // 2. 向量检索
  const results = await vectorDB.search(queryEmbedding, {
    topK: 5,
    filter: { category: 'docs' }
  })
  
  // 3. 构建 Prompt
  const context = results.map(r => r.chunk).join('\n\n')
  const prompt = `基于以下文档回答问题：

${context}

问题：${userQuery}
回答：`
  
  // 4. LLM 生成
  const answer = await llm.generate(prompt)
  return { answer, sources: results }
}
```

**文档切片策略：**

| 策略 | 方法 | 适用场景 |
|------|------|----------|
| 固定长度 | 每 500 token 一切 | 通用文档 |
| 按段落 | 自然段落分割 | 文章/博客 |
| 按标题 | H1/H2/H3 分割 | 技术文档 |
| 递归切片 | 大段递归细分 | 长文档 |
| 语义切片 | 主题变化处分割 | 高质量要求 |

**切片代码示例：**

```js
function chunkDocument(text, options = {}) {
  const {
    chunkSize = 500,
    chunkOverlap = 50,
    separator = '\n'
  } = options
  
  // 按段落分割
  const paragraphs = text.split(/\n\s*\n/)
  const chunks = []
  let currentChunk = []
  let currentLength = 0
  
  for (const para of paragraphs) {
    const tokens = countTokens(para)
    
    if (currentLength + tokens > chunkSize) {
      // 保存当前块
      chunks.push(currentChunk.join(separator))
      // 重叠部分
      currentChunk = currentChunk.slice(-Math.floor(chunkOverlap / 10))
      currentLength = currentChunk.reduce((s, t) => s + countTokens(t), 0)
    }
    
    currentChunk.push(para)
    currentLength += tokens
  }
  
  // 最后一个块
  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(separator))
  }
  
  return chunks
}
```

**优化技巧：**

```js
// 1. 元数据增强
{
  chunk: "内容",
  embedding: [...],
  metadata: {
    source: "doc.pdf",
    page: 5,
    section: "第三章",
    timestamp: "2024-01-01"
  }
}

// 2. 混合检索
// 向量检索 + 关键词检索结合
const vectorResults = await vectorSearch(query)
const keywordResults = await keywordSearch(query)
const combined = rerank([...vectorResults, ...keywordResults])

// 3. 查询改写
// 将模糊查询转为具体查询
// "怎么退款" → "退款流程 退款政策 退款入口"
```

**知识点：** `RAG` `文档切片` `向量检索` `Embedding` `检索增强生成`

:::

### Q10: Embedding 模型的选型和评估？

> **🔥 中等 · AI 应用**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**主流 Embedding 模型对比：**

| 模型 | 维度 | 最大长度 | 优点 | 适用场景 |
|------|------|----------|------|----------|
| text-embedding-ada-002 | 1536 | 8191 | OpenAI 官方，稳定 | 通用 |
| text-embedding-3-small | 1536 | 8191 | 性价比高 | 大规模 |
| text-embedding-3-large | 3072 | 8191 | 效果更好 | 高质量 |
| bge-large-zh | 1024 | 512 | 中文优化 | 中文场景 |
| m3e-base | 768 | 512 | 开源免费 | 私有化 |
| jina-embeddings | 768 | 8192 | 长文本 | 长文档 |

**选型维度：**

```
1. 语言支持
   - 中文：bge-large-zh, m3e
   - 多语言：LaBSE, multilingual-e5

2. 上下文长度
   - 短文本 (<512): 大部分模型
   - 长文本 (>1000): jina, ada-002

3. 部署方式
   - API: OpenAI, Cohere
   - 本地：sentence-transformers, ONNX

4. 成本
   - 付费：OpenAI ($0.0001/1K tokens)
   - 免费：MTEB 开源模型
```

**评估方法：**

```js
// 1. MTEB 基准测试
// 参考 https://huggingface.co/spaces/mteb/leaderboard

// 2. 自定义评估
async function evaluateEmbedding(model) {
  // 语义相似度测试
  const pairs = [
    ['猫', '狗', 0.7],        // 相似
    ['苹果', '香蕉', 0.6],    // 相似
    ['电脑', '水果', 0.1],    // 不相似
  ]
  
  const scores = []
  for (const [text1, text2, expected] of pairs) {
    const e1 = await model.encode(text1)
    const e2 = await model.encode(text2)
    const similarity = cosineSimilarity(e1, e2)
    scores.push(Math.abs(similarity - expected))
  }
  
  return { mse: mean(scores) }
}

// 3. 检索质量评估
// 使用标注好的 query-doc 对，计算 Recall@K
```

**余弦相似度计算：**

```js
function cosineSimilarity(a, b) {
  let dot = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}
```

**使用示例：**

```js
// LangChain 使用
import { OpenAIEmbeddings } from '@langchain/openai'
import { HuggingFaceTransformersEmbeddings } from '@langchain/community'

// OpenAI
const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-small'
})

// 本地模型
const embeddings = new HuggingFaceTransformersEmbeddings({
  modelName: 'Xenova/bge-large-zh-v1.5'
})

// 向量化
const vector = await embeddings.embedQuery('你好')
```

**知识点：** `Embedding` `向量模型` `语义相似度` `MTEB` `模型选型`

:::
