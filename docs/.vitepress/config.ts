import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '前端面试题库',
  description: '自测式前端面试学习，覆盖 JS/CSS/HTML/浏览器/网络/框架/工程化/算法/TS/Node/Git/安全/小程序',
  base: '/fe-interview-quiz/',
  lastUpdated: true,
  cleanUrls: true,
  
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#1a73e8' }]
  ],
  
  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: '首页', link: '/' },
      { text: 'JavaScript', link: '/javascript/basics/type-coercion' },
      { text: 'CSS/HTML', link: '/css/basics/selector-specificity' },
      { text: '网络/浏览器', link: '/network/http-protocol' },
      { text: '框架', items: [
        { text: '⚛️ React', link: '/framework/react/react-basics' },
        { text: '💚 Vue', link: '/framework/vue/vue-basics' }
      ]},
      { text: '工程化', link: '/engineering/build-tools' },
      { text: '算法', link: '/algorithm/sorting' },
      { text: '手写代码', link: '/handwriting/handwrite-promise' },
      { text: '场景设计', link: '/scenario/component-design' },
      { text: '更多', items: [
        { text: 'TypeScript', link: '/typescript/basics' },
        { text: 'Node.js', link: '/node/basics' },
        { text: 'Git', link: '/git/basics' },
        { text: '安全', link: '/security/xss-csrf' },
        { text: '小程序', link: '/mini-program/basics' },
        { text: '开放题/HR', link: '/interview/open-questions' },
        { text: '测试', link: '/testing/basics' },
        { text: '其他', link: '/other/3d-webgl' }
      ]}
    ],
    
    sidebar: {
      '/javascript/basics/': [
        {
          text: '🟢 JavaScript 基础篇',
          collapsed: false,
          items: [
            { text: '类型转换', link: '/javascript/basics/type-coercion' },
            { text: '作用域与闭包', link: '/javascript/basics/scope-closure' },
            { text: 'this 指向', link: '/javascript/basics/this-binding' },
            { text: '原型与继承', link: '/javascript/basics/prototype-inheritance' },
            { text: '异步编程基础', link: '/javascript/basics/async-basics' },
            { text: 'ES6+ 新特性', link: '/javascript/basics/es6-features' }
          ]
        }
      ],
      '/javascript/advanced/': [
        {
          text: '🔵 JavaScript 进阶篇',
          collapsed: false,
          items: [
            { text: '事件循环', link: '/javascript/advanced/event-loop' },
            { text: 'Promise 与 async/await', link: '/javascript/advanced/promise-async' },
            { text: '模块化', link: '/javascript/advanced/modules' },
            { text: '内存管理', link: '/javascript/advanced/memory-management' },
            { text: '函数式编程', link: '/javascript/advanced/functional-programming' },
            { text: '设计模式', link: '/javascript/advanced/design-patterns' },
            { text: '闭包与作用域补充', link: '/javascript/advanced/closure-scope-extra' }
          ]
        }
      ],
      '/css/basics/': [
        {
          text: '🟡 CSS 基础篇',
          collapsed: false,
          items: [
            { text: '选择器与优先级', link: '/css/basics/selector-specificity' },
            { text: '盒模型', link: '/css/basics/box-model' },
            { text: '布局方式', link: '/css/basics/layout' },
            { text: '响应式设计', link: '/css/basics/responsive-design' }
          ]
        }
      ],
      '/css/advanced/': [
        {
          text: '🟠 CSS 进阶篇',
          collapsed: false,
          items: [
            { text: 'BFC', link: '/css/advanced/bfc' },
            { text: '层叠上下文', link: '/css/advanced/stacking-context' },
            { text: 'CSS 动画与过渡', link: '/css/advanced/animation-transition' },
            { text: 'CSS 性能优化', link: '/css/advanced/performance' },
            { text: 'CSS 预处理器与现代 CSS', link: '/css/advanced/preprocessors' }
          ]
        }
      ],
      '/html/': [
        {
          text: '🟣 HTML 篇',
          collapsed: false,
          items: [
            { text: '语义化标签', link: '/html/semantic-tags' },
            { text: '表单与校验', link: '/html/forms-validation' },
            { text: '可访问性 (a11y)', link: '/html/accessibility' },
            { text: 'SEO 与 Meta 标签', link: '/html/seo-meta' },
            { text: 'HTML5 新特性', link: '/html/html5-features' }
          ]
        }
      ],
      '/browser/': [
        {
          text: '🟤 浏览器篇',
          collapsed: false,
          items: [
            { text: '渲染原理', link: '/browser/rendering' },
            { text: '事件机制', link: '/browser/event-mechanism' },
            { text: '存储机制', link: '/browser/storage' },
            { text: '性能优化', link: '/browser/performance' },
            { text: '安全 (XSS/CSRF)', link: '/browser/security' },
            { text: '跨域方案', link: '/browser/cors' }
          ]
        }
      ],
      '/network/': [
        {
          text: '🔴 计算机网络篇',
          collapsed: false,
          items: [
            { text: 'HTTP 协议', link: '/network/http-protocol' },
            { text: 'HTTPS 与加密', link: '/network/https-encryption' },
            { text: 'TCP/IP', link: '/network/tcp-ip' },
            { text: '缓存策略', link: '/network/caching' },
            { text: 'WebSocket', link: '/network/websocket' },
            { text: '从输入 URL 到页面展示', link: '/network/url-to-page' }
          ]
        }
      ],
      '/framework/react/': [
        {
          text: '⚛️ React 篇',
          collapsed: false,
          items: [
            { text: 'React 基础', link: '/framework/react/react-basics' },
            { text: 'Hooks 深度', link: '/framework/react/hooks-deep' },
            { text: '状态管理', link: '/framework/react/state-management' },
            { text: 'React 性能优化', link: '/framework/react/performance' },
            { text: 'React 原理', link: '/framework/react/principles' },
            { text: 'Next.js', link: '/framework/react/nextjs' }
          ]
        }
      ],
      '/framework/vue/': [
        {
          text: '💚 Vue 篇',
          collapsed: false,
          items: [
            { text: 'Vue 基础', link: '/framework/vue/vue-basics' },
            { text: '响应式原理', link: '/framework/vue/reactivity' },
            { text: '组合式 API', link: '/framework/vue/composition-api' },
            { text: 'Vue 性能优化', link: '/framework/vue/performance' },
            { text: 'Vue3 新特性', link: '/framework/vue/vue3-features' },
            { text: 'Nuxt.js', link: '/framework/vue/nuxtjs' },
            { text: 'Vue Router', link: '/framework/vue/vue-router' },
            { text: 'Vue 模板与进阶', link: '/framework/vue/vue-advanced' }
          ]
        }
      ],
      '/typescript/': [
        {
          text: '🔷 TypeScript 篇',
          collapsed: false,
          items: [
            { text: '基础类型与类型系统', link: '/typescript/basics' },
            { text: '泛型与高级类型', link: '/typescript/generics' },
            { text: '类型体操与工具类型', link: '/typescript/type-gymnastics' },
            { text: 'TS 工程化与配置', link: '/typescript/engineering' },
            { text: 'TS 面试实战题', link: '/typescript/interview-practice' }
          ]
        }
      ],
      '/node/': [
        {
          text: '🟫 Node.js 篇',
          collapsed: false,
          items: [
            { text: 'Node 基础与架构', link: '/node/basics' },
            { text: '事件循环与异步 I/O', link: '/node/event-loop' },
            { text: '模块系统与包管理', link: '/node/modules' },
            { text: '进程管理与部署', link: '/node/process' },
            { text: 'SSR 与同构', link: '/node/ssr' }
          ]
        }
      ],
      '/engineering/': [
        {
          text: '🛠️ 工程化篇',
          collapsed: false,
          items: [
            { text: '构建工具 (Webpack/Vite/Rollup)', link: '/engineering/build-tools' },
            { text: '构建工具补充', link: '/engineering/build-tools-extra' },
            { text: 'Babel 与 AST', link: '/engineering/babel-ast' },
            { text: '代码规范 (ESLint/Prettier)', link: '/engineering/code-style' },
            { text: 'CI/CD', link: '/engineering/cicd' },
            { text: 'CI/CD 补充', link: '/engineering/cicd-extra' },
            { text: '微前端', link: '/engineering/micro-frontend' },
            { text: '监控与埋点', link: '/engineering/monitoring' }
          ]
        }
      ],
      '/git/': [
        {
          text: '📋 Git 篇',
          collapsed: false,
          items: [
            { text: 'Git 基础与常用命令', link: '/git/basics' },
            { text: '分支策略与协作', link: '/git/branching' },
            { text: 'Git 高级操作与 Hook', link: '/git/advanced' }
          ]
        }
      ],
      '/security/': [
        {
          text: '🔒 安全篇',
          collapsed: false,
          items: [
            { text: 'XSS 与 CSRF', link: '/security/xss-csrf' },
            { text: 'HTTPS 与加密', link: '/security/https-encryption' },
            { text: '内容安全策略 (CSP)', link: '/security/csp' },
            { text: '接口安全与防刷', link: '/security/api-security' }
          ]
        }
      ],
      '/mini-program/': [
        {
          text: '📱 小程序篇',
          collapsed: false,
          items: [
            { text: '小程序架构与原理', link: '/mini-program/basics' },
            { text: '跨端方案 (Taro/RN)', link: '/mini-program/cross-platform' },
            { text: '小程序性能优化', link: '/mini-program/performance' }
          ]
        }
      ],
      '/algorithm/': [
        {
          text: '🧮 算法篇',
          collapsed: false,
          items: [
            { text: '排序算法', link: '/algorithm/sorting' },
            { text: '链表', link: '/algorithm/linked-list' },
            { text: '树与图', link: '/algorithm/tree-graph' },
            { text: '动态规划', link: '/algorithm/dynamic-programming' },
            { text: '贪心与回溯', link: '/algorithm/greedy-backtracking' },
            { text: '前端算法实战', link: '/algorithm/frontend-practice' }
          ]
        }
      ],
      '/handwriting/': [
        {
          text: '✍️ 手写代码篇',
          collapsed: false,
          items: [
            { text: '手写 Promise', link: '/handwriting/handwrite-promise' },
            { text: '手写 call/apply/bind', link: '/handwriting/handwrite-call-apply-bind' },
            { text: '手写节流防抖', link: '/handwriting/handwrite-throttle-debounce' },
            { text: '手写深拷贝', link: '/handwriting/handwrite-deep-clone' },
            { text: '手写发布订阅', link: '/handwriting/handwrite-pub-sub' },
            { text: '手写虚拟 DOM', link: '/handwriting/handwrite-vdom' },
            { text: '手写 Diff 算法', link: '/handwriting/handwrite-diff' },
            { text: '手写 LRU 缓存', link: '/handwriting/handwrite-lru' }
          ]
        }
      ],
      '/scenario/': [
        {
          text: '🎯 场景设计篇',
          collapsed: false,
          items: [
            { text: '组件设计', link: '/scenario/component-design' },
            { text: '状态设计方案', link: '/scenario/state-design' },
            { text: '性能优化方案', link: '/scenario/performance-design' },
            { text: '首屏优化', link: '/scenario/first-screen' },
            { text: '长列表优化', link: '/scenario/long-list' },
            { text: '权限系统设计', link: '/scenario/permission-system' }
          ]
        }
      ],
      '/ai-frontend/': [
        {
          text: '🤖 AI 前端篇',
          collapsed: false,
          items: [
            { text: '流式渲染与SSE', link: '/ai-frontend/streaming' },
            { text: 'Agent与RAG', link: '/ai-frontend/agent-rag' },
            { text: '安全与性能', link: '/ai-frontend/performance-security' }
          ]
        }
      ],
      '/testing/': [
        {
          text: '🧪 测试篇',
          collapsed: false,
          items: [
            { text: '测试基础', link: '/testing/basics' },
            { text: '测试框架与工具', link: '/testing/frameworks' }
          ]
        }
      ],
      '/other/': [
        {
          text: '🔮 其他篇',
          collapsed: false,
          items: [
            { text: '3D与WebGL', link: '/other/3d-webgl' },
            { text: '低代码平台', link: '/other/lowcode' },
            { text: 'GraphQL与Electron', link: '/other/graphql-electron' },
            { text: '包管理与杂项', link: '/other/pnpm-package' },
            { text: '编程范式与工程思维', link: '/other/programming-paradigms' }
          ]
        }
      ],
      '/interview/': [
        {
          text: '💡 开放题/HR 篇',
          collapsed: false,
          items: [
            { text: '技术开放题', link: '/interview/open-questions' },
            { text: 'HR 面试与职业规划', link: '/interview/hr-questions' }
          ]
        }
      ]
    },
    
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换'
                }
              }
            }
          }
        }
      }
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/xilin-code/fe-interview-quiz' }
    ],
    
    footer: {
      message: 'MIT License',
      copyright: 'Copyright 2026'
    }
  },
  
  markdown: {
    html: true,
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark'
    }
  },
  
  vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag: string) => tag.includes('-')
      }
    }
  }
})