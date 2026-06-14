# 前端面试题库 - fe-interview-quiz

> 自测式前端面试学习，覆盖 JavaScript / CSS / HTML / 浏览器 / 网络 / React / Vue / 工程化 / 算法

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![VitePress](https://img.shields.io/badge/VitePress-1.6.3-green.svg)

## 🎯 项目介绍

这是一个基于 VitePress 构建的前端面试题库文档站点，采用 Quiz 自测互动方式，帮助你更高效地准备前端面试。

### ✨ 特色功能

- 🎯 **自测互动** - 每题可折叠答案，先思考再验证
- 📊 **难度分级** - 简单/中等/困难三级标注，循序渐进
- 🔥 **高频考点** - 覆盖大厂高频面试题，每题附带考点标签
- 💡 **深度解析** - 不只给答案，更讲清楚原理和底层逻辑
- ✍️ **代码实战** - 手写题附带完整可运行代码和注释
- 🏗️ **场景设计** - 组件/架构/性能优化等场景题，培养系统思维

## 📚 题库分类

- 🟢 **JavaScript 基础篇** - 类型转换、作用域闭包、this 指向、原型继承、异步编程、ES6+
- 🔵 **JavaScript 进阶篇** - 事件循环、Promise、模块化、内存管理、函数式编程、设计模式
- 🟡 **CSS 基础篇** - 选择器、盒模型、布局方式、响应式设计
- 🟠 **CSS 进阶篇** - BFC、层叠上下文、动画过渡、性能优化、预处理器
- 🟣 **HTML 篇** - 语义化标签、表单校验、可访问性、SEO、HTML5
- 🟤 **浏览器篇** - 渲染原理、事件机制、存储机制、性能优化、安全、跨域
- 🔴 **计算机网络篇** - HTTP、HTTPS、TCP/IP、缓存、WebSocket、URL 到页面
- ⚛️ **React 篇** - 基础、Hooks、状态管理、性能优化、Fiber 原理、Next.js
- 💚 **Vue 篇** - 基础、响应式原理、组合式 API、性能优化、Vue3、Nuxt.js
- 🛠️ **工程化篇** - 构建工具、Babel、代码规范、CI/CD、微前端、监控埋点
- 🧮 **算法篇** - 排序、链表、树图、动态规划、贪心回溯、前端实战
- ✍️ **手写代码篇** - Promise、call/apply/bind、节流防抖、深拷贝、发布订阅、vDOM、Diff、LRU
- 🎯 **场景设计篇** - 组件设计、状态管理、性能优化、首屏优化、长列表、权限系统

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run docs:dev
```

在浏览器中打开 `http://localhost:5173/fe-interview-quiz/` 查看效果。

### 构建生产版本

```bash
npm run docs:build
```

构建产物位于 `docs/.vitepress/dist/` 目录。

### 本地预览

```bash
npm run docs:preview
```

### 部署到 GitHub Pages

```bash
npm run deploy
```

## 📖 使用指南

### Quiz 自测模式

每道题目都采用折叠式设计：

1. 阅读题目和问题
2. 独立思考并尝试解答
3. 点击「点击查看答案解析」
4. 对照答案，找出差距
5. 记忆知识点标签

### 难度说明

- 🟢 **简单** - 基础概念，必会知识点
- 🟡 **中等** - 需要理解，常考知识点
- 🔴 **困难** - 深入原理，面试加分项

### 学习建议

1. 按顺序学习，不要跳级
2. 每道题先思考再看答案
3. 代码题一定要动手写
4. 定期复习薄弱环节
5. 模拟面试练习表达

## 🛠️ 技术栈

- [VitePress](https://vitepress.dev/) - 基于 Vite 的静态站点生成器
- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [GitHub Pages](https://pages.github.com/) - 免费静态站点托管

## 📝 目录结构

```
fe-interview-quiz/
├── docs/
│   ├── .vitepress/
│   │   ├── config.ts          # VitePress 配置
│   │   └── theme/
│   │       ├── index.js       # 主题入口
│   │       └── custom.css     # 自定义样式
│   ├── public/
│   │   └── logo.svg           # 站点 Logo
│   ├── guide/
│   │   └── overview.md        # 题库总览
│   ├── javascript/
│   │   ├── basics/            # JS 基础篇
│   │   └── advanced/          # JS 进阶篇
│   ├── css/
│   │   ├── basics/            # CSS 基础篇
│   │   └── advanced/          # CSS 进阶篇
│   ├── html/                  # HTML 篇
│   ├── browser/               # 浏览器篇
│   ├── network/               # 网络篇
│   ├── framework/
│   │   ├── react/             # React 篇
│   │   └── vue/               # Vue 篇
│   ├── engineering/           # 工程化篇
│   ├── algorithm/             # 算法篇
│   ├── handwriting/           # 手写代码篇
│   ├── scenario/              # 场景设计篇
│   └── index.md               # 首页
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Actions 部署配置
├── package.json
├── .gitignore
└── README.md
```

## 🤝 贡献指南

欢迎贡献题目、解析或改进建议！

1. Fork 本项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 开源协议

[MIT License](LICENSE)

## 👤 作者

- **xilin** - [@xilin-code](https://github.com/xilin-code)

## 🙏 致谢

感谢所有为前端面试题库做出贡献的开发者！

---

**Happy Coding! 🎉**