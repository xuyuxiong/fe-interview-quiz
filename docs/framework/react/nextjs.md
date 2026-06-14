---
title: Next.js 面试题
description: Next.js 核心概念与实战，涵盖路由、Server Component、数据获取、部署等 8 道经典面试题
---

# Next.js 面试题

> **📚 共 8 题 · 简单 30% · 中等 50% · 困难 20%**

---

### Q1: Next.js 的路由系统是如何工作的？App Router 和 Pages Router 有什么区别？

> **⭐ 简单 · Next.js**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Pages Router（传统路由）：**

基于文件系统和 URL 的路由约定。

```
pages/
├── index.js          → /
├── about.js          → /about
├── blog/
│   ├── index.js      → /blog
│   └── [slug].js     → /blog/:slug
└── api/
    └── users.js      → /api/users
```

**核心 API：**

```jsx
// pages/about.js
import { useRouter } from 'next/router';

export default function About() {
  const router = useRouter();
  const { slug } = router.query; // [slug].js 的动态参数
  
  return <div>About: {slug}</div>;
}

// 获取数据
export async function getServerSideProps() {
  // 每次请求都执行
  return { props: { data: 'server' } };
}

export async function getStaticProps() {
  // 构建时执行
  return { props: { data: 'static' } };
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { slug: 'a' } }, { params: { slug: 'b' } }],
    fallback: false,
  };
}
```

**App Router（新架构，Next.js 13+）：**

基于 React Server Components 的路由系统。

```
app/
├── layout.js         → 根布局
├── page.js           → /
├── about/
│   └── page.js       → /about
├── blog/
│   ├── page.js       → /blog
│   └── [slug]/
│       └── page.js   → /blog/:slug
└── api/
    └── users/
        └── route.js  → /api/users
```

**核心特性：**

```jsx
// app/blog/[slug]/page.js
// Server Component 默认
export default async function BlogPost({ params }) {
  const post = await fetchPost(params.slug);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}

// 生成静态路径
export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}

// 元数据
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.excerpt,
  };
}

// 布局嵌套
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}

// app/dashboard/layout.js
export default function DashboardLayout({ children }) {
  return <div className="dashboard">{children}</div>;
}
```

**对比：**

| 特性 | Pages Router | App Router |
|------|--------------|------------|
| 目录 | pages/ | app/ |
| 组件类型 | 纯客户端 | Server Component 优先 |
| 数据获取 | getServerSideProps 等 | async/await 直接 fetch |
| 布局 | _app.js | nested layouts |
| 加载状态 | 手动实现 | loading.js |
| 错误处理 | _error.js | error.js |
| 流式传输 | ❌ | ✅ |
| 部分渲染 | ❌ | ✅ |

**知识点：** `路由系统` `App Router` `Pages Router`

:::

---

### Q2: 什么是 Server Component？它的原理和优势是什么？

> **💀 困难 · Next.js**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Server Component 定义：**

React Server Components (RSC) 是在服务器上渲染的组件，不会发送 JavaScript 到客户端。

**核心特性：**

```jsx
// Server Component (默认)
// app/page.js
import { db } from '@/db';

export default async function Page() {
  // ✅ 可以直接在组件内访问数据库
  const users = await db.users.findMany();
  
  // ✅ 可以使用 Node.js API
  const files = await fs.readdir('./data');
  
  // ❌ 不能使用客户端 Hook
  // const [count, setCount] = useState(0);
  
  return <UserList users={users} />;
}

// Client Component (需要指令)
// app/components/Counter.js
'use client';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**RSC Payload 原理：**

```
服务器                客户端
│                    │
│ 1. 渲染 Server      │
│    Component       │
│                    │
│ 2. 生成 RSC         │
│    Payload         │
│--------------------→│
│                    │
│ 3. 解析 Payload     │
│    重建组件树       │
│                    │
│ 4. Hydrate          │
│    Client          │
│    Component       │
```

**RSC Payload 格式：**

```jsx
// 服务器输出（简化）
// 0: div
// 1: "Hello, "
// 2: span
// 3: "World"
// 4: [$, "0", null, ["1", [$, "2", null, ["3"]]]]

// 客户端解析
// 重建为: <div>Hello, <span>World</span></div>
```

**优势：**

**1. 零 JavaScript 体积：**

```jsx
// Server Component
import { marked } from 'marked';

async function Markdown({ content }) {
  const html = marked.parse(content);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// 客户端不加载 marked 库
```

**2. 直接访问后端资源：**

```jsx
// Server Component
import db from '@/lib/db';

async function UserProfile({ userId }) {
  // 直接查询数据库
  const user = await db.user.findUnique({ where: { id: userId } });
  return <div>{user.name}</div>;
}
```

**3. 自动代码分割：**

```jsx
// 每个 Server Component 自动分割
// 客户端只下载需要的 Client Component
```

**4. 数据获取简化：**

```jsx
// 不再有 getServerSideProps
async function Page({ params }) {
  const data = await fetch(`https://api.example.com/${params.id}`);
  return <Component data={data} />;
}
```

**限制：**

| Server Component | Client Component |
|------------------|------------------|
| ❌ useState/useEffect | ✅ 完整的 React Hook |
| ❌ 事件处理 | ✅ onClick 等 |
| ❌ 浏览器 API | ✅ window/document |
| ✅ 数据库访问 | ❌ 需要 API 路由 |
| ✅ 文件系统 | ❌ 需要 API 路由 |
| ✅  Zero JS | ❌ 需要下载 JS |

**组合使用：**

```jsx
// Server Component
import { Counter } from './Counter';

async function Page() {
  const data = await fetchData();
  
  return (
    <div>
      <h1>{data.title}</h1>
      <Counter initialCount={data.count} /> {/* Client Component */}
    </div>
  );
}

// Client Component
'use client';

export function Counter({ initialCount }) {
  const [count, setCount] = useState(initialCount);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

**知识点：** `Server Component` `RSC` `零 JS`

:::

---

### Q3: Next.js 中有哪些数据获取方式？它们的使用场景是什么？

> **🔥 中等 · Next.js**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Pages Router 数据获取：**

**1. getStaticProps - 静态生成：**

```jsx
// 构建时执行，生成静态 HTML
export async function getStaticProps() {
  const posts = await getPosts();
  
  return {
    props: { posts },
    revalidate: 60, // ISR: 60 秒后重新验证
  };
}

export default function Blog({ posts }) {
  return <div>{posts.map(post => <Post key={post.id} {...post} />)}</div>;
}
```

**2. getServerSideProps - 服务端渲染：**

```jsx
// 每次请求都执行
export async function getServerSideProps(context) {
  const { req, res, query } = context;
  
  // 访问 Cookie
  const token = req.cookies.token;
  
  // 重定向
  if (!token) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  
  const user = await getUser(token);
  
  return { props: { user } };
}
```

**3. getStaticPaths - 动态路由：**

```jsx
export async function getStaticPaths() {
  const posts = await getAllPosts();
  
  return {
    paths: posts.map(post => ({ params: { slug: post.slug } })),
    fallback: 'blocking', // 或 false / true
  };
}
```

**App Router 数据获取：**

**使用 fetch + cache 选项：**

```jsx
// 1. 默认缓存（类似 getStaticProps）
async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <Component data={data} />;
}

// 2. 不缓存（类似 getServerSideProps）
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'no-store',
  });
  return <Component data={data} />;
}

// 3. ISR
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { revalidate: 60 }, // 60 秒
  });
  return <Component data={data} />;
}

// 4. 标签缓存
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    next: { tags: ['posts'] },
  });
  return <Component data={data} />;
}

// 在 mutation 中 revalidate
async function updatePost() {
  await db.post.update(...);
  revalidateTag('posts'); // 或 revalidatePath('/blog')
}
```

**使用 React Query (客户端)：**

```jsx
'use client';

import { useQuery } from '@tanstack/react-query';

function ClientComponent() {
  const { data, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => fetch('/api/posts').then(res => res.json()),
  });
  
  if (isLoading) return <Loading />;
  return <div>{/* ... */}</div>;
}
```

**对比表格：**

| 方式 | 执行时机 | 适用场景 |
|------|----------|----------|
| getStaticProps | 构建时 | 静态页面 |
| getStaticProps + revalidate | 构建时 + 按需 | ISR 增量更新 |
| getServerSideProps | 每次请求 | 用户特定数据 |
| fetch (App) | 取决于配置 | 灵活选择 |
| SWR/React Query | 客户端 | 交互式数据 |

**选型建议：**

- 静态内容 → `getStaticProps` 或 `fetch` 默认
- 个性化内容 → `getServerSideProps` 或 `cache: 'no-store'`
- 可过期内容 → `revalidate` 或 `next: { revalidate }`
- 客户端交互 → `SWR` / `React Query`

**知识点：** `数据获取` `SSR` `SSG` `ISR`

:::

---

### Q4: 什么是 ISR？如何实现增量静态再生？

> **🔥 中等 · Next.js**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**ISR (Incremental Static Regeneration)：**

允许在构建后按需生成静态页面。

**Pages Router 实现：**

```jsx
// pages/blog/[slug].js

export async function getStaticProps({ params }) {
  const post = await getPost(params.slug);
  
  return {
    props: { post },
    // 页面生成后 60 秒内，新请求使用缓存
    // 60 秒后的第一个请求触发重新生成
    revalidate: 60,
  };
}

export async function getStaticPaths() {
  return {
    paths: [{ params: { slug: 'post-1' } }],
    // fallback 选项
    fallback: 'blocking',
  };
}

export default function Post({ post }) {
  return <article>{post.content}</article>;
}
```

**fallback 选项：**

| 选项 | 行为 |
|------|------|
| `false` | 未预渲染的路径返回 404 |
| `true` | 首次访问时显示 fallback 页面，后台生成 |
| `blocking` | 首次访问时等待生成完成，后续访问使用缓存 |

**App Router 实现：**

```jsx
// app/blog/[slug]/page.js

// 方式 1：配置 revalidate
export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export default async function Post({ params }) {
  const post = await getPost(params.slug);
  
  // 不设置时也使用默认的
  // 可以通过 next.config.js 配置
  
  return <article>{post.content}</article>;
}

// 页面级别配置 revalidate
export const revalidate = 60; // 60 秒

// 或者在 fetch 中
async function getData() {
  return fetch('https://api.example.com/data', {
    next: { revalidate: 60 },
  });
}
```

**按需重新验证：**

```jsx
// API 路由触发 revalidate
// app/api/revalidate/route.js
import { revalidatePath, revalidateTag } from 'next/cache';

export async function POST(request) {
  const { path, tag } = await request.json();
  
  if (path) {
    revalidatePath(path);
  }
  
  if (tag) {
    revalidateTag(tag);
  }
  
  return Response.json({ revalidated: true });
}

// webhook 触发
export async function GET(request) {
  const token = request.nextUrl.searchParams.get('secret');
  
  if (token !== process.env.REVALIDATE_TOKEN) {
    return Response.json({ error: 'Invalid token' }, { status: 401 });
  }
  
  revalidateTag('posts');
  revalidatePath('/blog');
  
  return Response.json({ revalidated: true });
}
```

**完整示例：**

```jsx
// 创建 webhook
// 1. CMS (Contentful, Sanity 等) 发送 webhook
// 2. /api/revalidate 接收并触发
// 3. Next.js 重新生成页面

// CMS Webhook Payload
{
  "event": "entry.publish",
  "data": {
    "slug": "my-new-post"
  }
}

// API Handler
export async function POST(request) {
  const body = await request.json();
  
  // 验证签名
  const isValid = verifySignature(request.headers, body);
  if (!isValid) return new Response('Invalid', { status: 400 });
  
  // 重新验证
  revalidatePath(`/blog/${body.data.slug}`);
  
  return Response.json({ ok: true });
}
```

**知识点：** `ISR` `增量静态` `按需重新验证`

:::

---

### Q5: SSR、SSG、CSR 有什么区别？如何选择？

> **🔥 中等 · Next.js**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**三种渲染模式：**

**1. SSR (Server-Side Rendering) - 服务端渲染：**

```jsx
// 每次请求都服务端渲染
export async function getServerSideProps() {
  const user = await getCurrentUser();
  return { props: { user } };
}
```

**流程：**

```
用户请求 → 服务器执行 React → HTML + 数据 → 浏览器 → Hydrate
          ↑ 每次请求
```

| 优点 | 缺点 |
|------|------|
| SEO 友好 | 服务器压力大 |
| 数据实时 | 首屏稍慢 |
| 用户特定内容 | 缓存困难 |

**2. SSG (Static Site Generation) - 静态生成：**

```jsx
// 构建时生成静态 HTML
export async function getStaticProps() {
  const posts = await getPosts();
  return { props: { posts } };
}
```

**流程：**

```
构建时生成 HTML
         ↓
    CDN 缓存
         ↓
用户请求 → 直接返回 HTML → 浏览器 → Hydrate
```

| 优点 | 缺点 |
|------|------|
| 性能极佳 | 数据不实时 |
| CDN 缓存 | 构建时间长 |
| 服务器压力小 | 需要预知路径 |

**3. CSR (Client-Side Rendering) - 客户端渲染：**

```jsx
'use client';
import { useEffect, useState } from 'react';

export default function Page() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data').then(setData);
  }, []);
  
  return <div>{/* ... */}</div>;
}
```

**流程：**

```
用户请求 → HTML (空壳) → 浏览器 → 下载 JS → 执行 JS → 渲染
```

| 优点 | 缺点 |
|------|------|
| 服务器压力小 | SEO 不友好 |
| 交互丰富 | 首屏慢 |
| 简单 | 需要 JS |

**对比表格：**

| 维度 | SSR | SSG | CSR |
|------|-----|-----|-----|
| SEO | ✅ 优秀 | ✅ 优秀 | ❌ 差 |
| 首屏速度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ |
| 数据实时性 | ✅ 实时 | ❌ 构建时 | ✅ 实时 |
| 服务器压力 | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 构建时间 | - | ⭐ | ⭐⭐⭐⭐⭐ |
| 缓存 | 困难 | ✅ 容易 | ✅ 容易 |

**混合模式 (Next.js)：**

```jsx
// 静态部分 + 动态部分
async function Page() {
  // SSG - 缓存
  const staticData = await fetch('https://api.example.com/static', {
    cache: 'force-cache',
  });
  
  // SSR - 不缓存
  const userData = await fetch('https://api.example.com/user', {
    cache: 'no-store',
  });
  
  return (
    <div>
      <StaticContent data={staticData} />
      <UserContent data={userData} />
    </div>
  );
}
```

**选型指南：**

| 场景 | 推荐方案 |
|------|----------|
| 博客/文档 | SSG + ISR |
| 电商首页 | SSG + ISR |
| 电商商品页 | SSG + ISR |
| 用户 dashboard | SSR |
| 后台管理系统 | CSR |
| 社交媒体 | 混合 (SSR + CSR) |
| SaaS 应用 | CSR + SSR |

**知识点：** `SSR` `SSG` `CSR` `渲染模式`

:::

---

### Q6: 什么是 Hydration？不匹配（Mismatch）如何处理？

> **🔥 中等 · Next.js**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Hydration（水合）过程：**

```
1. 服务器渲染 HTML
          ↓
2. HTML 发送到客户端
          ↓
3. 客户端下载 JS bundle
          ↓
4. React 挂载到现有 DOM
          ↓
5. 添加事件监听器
          ↓
6. 应用变为交互式
```

**Hydration Mismatch（不匹配）：**

当服务器渲染的 HTML 与客户端首次渲染不一致时，出现警告。

**常见原因和解决：**

**原因 1：日期/时间**

```jsx
// ❌ 问题
function Page() {
  return <div>{new Date().toLocaleTimeString()}</div>;
}

// ✅ 解决
'use client';
function Clock() {
  const [time, setTime] = useState('');
  
  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
  }, []);
  
  return <div>{time || 'Loading...'}</div>;
}
```

**原因 2：浏览器 API**

```jsx
// ❌ 问题
function Page() {
  const width = window.innerWidth; // window 在服务端不存在
  return <div>{width}</div>;
}

// ✅ 解决
'use client';
function Width() {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);
  
  return <div>{width}</div>;
}
```

**原因 3：条件渲染不一致**

```jsx
// ❌ 问题
function Page() {
  const isLoggedIn = !!localStorage.getItem('token'); // SSR 会报错
  return <div>{isLoggedIn ? 'Logged in' : 'Guest'}</div>;
}

// ✅ 解决
'use client';
function AuthStatus() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);
  
  // SSR 和 CSR 都渲染相同的 HTML
  if (!isLoggedIn) return <div>Checking auth...</div>;
  
  return <div>{isLoggedIn ? 'Logged in' : 'Guest'}</div>;
}
```

**原因 4：随机数**

```jsx
// ❌ 问题
function Page() {
  return <div>{Math.random()}</div>;
}

// ✅ 解决 - 在服务端生成并传入
export async function getServerSideProps() {
  return { props: { random: Math.random() } };
}

function Page({ random }) {
  return <div>{random}</div>;
}
```

**Suppressing Mismatch（抑制警告）：**

```jsx
// 当差异是预期内的
function Page() {
  return (
    <div suppressHydrationWarning>
      {/* 只比较第一层 */}
      <span>{randomNumber}</span>
    </div>
  );
}
```

**调试工具：**

```jsx
// 在开发环境
// React 会在控制台显示详细的不匹配信息

// 也可以使用这个调试技巧
if (typeof window !== 'undefined') {
  console.log('Client rendered');
}
```

**最佳实践：**

1. 避免在 SSR 中使用非确定性值
2. 使用 useEffect 访问浏览器 API
3. 对于预期的差异使用 suppressHydrationWarning
4. 保持 SSR 和 CSR 的初始渲染一致

**知识点：** `Hydration` `水合` `SSR 不匹配`

:::

---

### Q7: Next.js Middleware 是什么？有哪些使用场景？

> **⭐ 简单 · Next.js**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Middleware 定义：**

中间件在请求到达页面或 API 路由之前执行，用于拦截和修改请求/响应。

**基础使用：**

```jsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 检查认证
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// 配置匹配路径
export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
```

**常见场景：**

**1. 认证和授权：**

```jsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('session');
  const { pathname } = request.nextUrl;
  
  // 需要登录才能访问
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 已登录不能访问登录页
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // 权限检查
  if (pathname.startsWith('/admin')) {
    const user = getUserFromToken(token?.value);
    if (!user?.isAdmin) {
      return NextResponse.redirect(new URL('/403', request.url));
    }
  }
  
  return NextResponse.next();
}
```

**2. 国际化 (i18n)：**

```jsx
// middleware.ts
import { NextResponse } from 'next/server';

const locales = ['en', 'zh', 'ja'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查路径是否有 locale
  const pathnameHasLocale = locales.some(locale => 
    pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  if (!pathnameHasLocale) {
    // 从 Accept-Language header 检测
    const acceptLang = request.headers.get('accept-language') || 'en';
    const locale = acceptLang.split(',')[0].split('-')[0];
    
    // 重定向到对应 locale
    const url = new URL(`/${locale}${pathname}`, request.url);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}
```

**3. A/B 测试：**

```jsx
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // 添加 A/B 测试标识
  const abTest = Math.random() > 0.5 ? 'variantA' : 'variantB';
  
  // 写入 cookie
  response.cookies.set('ab_test', abTest, { maxAge: 60 * 60 * 24 });
  
  // 添加到 header
  response.headers.set('x-ab-test', abTest);
  
  return response;
}
```

**4. 速率限制：**

```jsx
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 请求/10 秒
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
  }
  
  return NextResponse.next();
}
```

**5. 请求/响应修改：**

```jsx
// middleware.ts
export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // 添加安全 headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}
```

**配置选项：**

```jsx
export const config = {
  // 匹配路径
  matcher: [
    '/api/:path*',      // API 路由
    '/dashboard/:path*', // dashboard 下所有路径
    '/about',           // 精确匹配
    '/users/:id',       // 动态参数
    '/((?!_next|static|favicon.ico).*)', // 排除特定路径
  ],
};
```

**知识点：** `Middleware` `中间件` `认证` `i18n`

:::

---

### Q8: Next.js 的部署方式有哪些？比较 Vercel、Docker 和 standalone 模式

> **⭐ 简单 · Next.js**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. Vercel（官方推荐）：**

```yaml
# vercel.json (可选配置)
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install"
}
```

**部署流程：**

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel

# 生产部署
vercel --prod
```

| 优点 | 缺点 |
|------|------|
| 零配置 | 绑定 Vercel 平台 |
| 自动 HTTPS | 免费额度有限 |
| Edge Functions | 定制性有限 |
| 预览部署 | VPC 等高级功能收费 |
| 自动 ISR | |

**2. Docker 容器部署：**

```dockerfile
# 多阶段构建
FROM node:20-alpine AS base

# 依赖安装
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 构建
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# 生产运行
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3'
services:
  nextjs:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://...
    restart: unless-stopped
```

| 优点 | 缺点 |
|------|------|
| 平台无关 | 需要管理容器 |
| 灵活部署 | 配置复杂 |
| 本地测试 | 需要处理日志/监控 |
| 可移植 | |

**3. Standalone 模式：**

```js
// next.config.js
module.exports = {
  output: 'standalone',
};
```

**输出结构：**

```
.next/
  standalone/
    server.js          # 独立服务器
    package.json
    node_modules/      # 仅需要的依赖
  static/              # 静态资源
```

**运行：**

```bash
npm run build
cd .next/standalone
node server.js
```

| 优点 | 缺点 |
|------|------|
| 最小化输出 | 需要自己管理流程 |
| 标准 Node.js | 没有自动扩展 |
| 任何主机 | 需要自己配置 HTTPS |

**4. 其他部署选项：**

**AWS:**
```bash
# 使用 Amplify
amplify init
amplify push
amplify publish

# 或 EC2 + PM2
pm2 start npm --name "next" -- run start
```

**传统服务器 (Nginx + PM2):**

```nginx
# nginx.conf
server {
  listen 80;
  server_name example.com;
  
  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

```bash
# PM2
pm2 start npm --name "my-next-app" -- run start
pm2 save
pm2 startup
```

**选型建议：**

| 场景 | 推荐方案 |
|------|----------|
| 快速上线/原型 | Vercel |
| 企业内网部署 | Docker |
| 已有云服务器 | Standalone + PM2 |
| 大规模生产 | Docker + K8s |
| AWS 生态 | Amplify 或 ECS |

**知识点：** `部署` `Vercel` `Docker` `Standalone`

:::

---

## 总结

| Next.js 特性 | 重要度 | 使用频率 |
|--------------|--------|----------|
| App Router | 🔥🔥🔥 | 🔥🔥🔥 |
| Server Component | 🔥🔥🔥 | 🔥🔥🔥 |
| 数据获取 | 🔥🔥🔥 | 🔥🔥🔥 |
| ISR | 🔥🔥 | 🔥🔥 |
| SSR/SSG/CSR | 🔥🔥🔥 | 🔥🔥🔥 |
| Hydration | 🔥🔥 | 🔥🔥 |
| Middleware | 🔥🔥 | 🔥🔥 |
| 部署 | 🔥🔥 | 🔥 |

**面试建议：**

- 理解 Server Component 的原理和优势
- 掌握各种渲染模式的区别和选型
- 能够说明 ISR 的实现机制
- 了解 App Router 的新特性

---
### Q9: Next.js App Router 和 Pages Router 的区别？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Pages Router（传统）** 基于文件路由，每个页面是独立组件。

```
pages/
├── index.js          → /
├── about.js          → /about
├── blog/
│   └── [slug].js     → /blog/:slug
└── api/
    └── user.js       → /api/user
```

**App Router（Next.js 13+）** 基于 React Server Components，使用 layout 和 loading 等约定。

```
app/
├── layout.tsx        # 根布局
├── page.tsx          # 首页
├── about/
│   └── page.tsx      # /about
├── blog/
│   ├── layout.tsx    # blog 布局
│   ├── page.tsx      # /blog
│   └── [slug]/
│       └── page.tsx  # /blog/:slug
└── loading.tsx       # 全局 loading
```

**核心区别：**

| 维度 | Pages Router | App Router |
|------|-------------|-----------|
| 目录 | pages/ | app/ |
| 组件类型 | 默认客户端 | 默认服务端 |
| 数据获取 | getInitialProps/getServerSideProps | async/await 直接获取 |
| 布局 | 手动包裹 | layout.tsx 自动嵌套 |
| Loading | 手动 useState | loading.tsx 自动 |
| 错误处理 | getInitialProps | error.tsx |
| 嵌套路由 | 手动 | 天然支持 |
| 服务端组件 | ❌ | ✅ |

**代码对比：**

```jsx
// Pages Router
export async function getServerSideProps() {
  const data = await fetch('...')
  return { props: { data } }
}

export default function Page({ data }) {
  return <div>{data}</div>
}

// App Router
export default async function Page() {
  const data = await fetch('...')
  return <div>{data}</div>
}
```

**App Router 优势：**
- 简化数据获取
- 自动代码分割
- 更好的缓存控制
- 流式渲染支持

**知识点：** `App Router` `Pages Router` `路由系统` `Server Component`

:::

### Q10: Next.js Server Components 和 Client Components 如何选择？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Server Components（RSC）** 在服务端渲染，不发送 JS 到客户端。

**Client Components** 在客户端运行，支持交互。

**选择原则：**

```
默认用 Server Component
    ↓
需要交互？—— 是 ——→ Client Component
    ↓ 否
Server Component
```

**必须用 Client Component 的场景：**
```jsx
'use client'

// 1. 事件处理器
<button onClick={() => {}} />

// 2. State/Hooks
function Counter() {
  const [count, setCount] = useState(0)
  return <button>{count}</button>
}

// 3. 生命周期
useEffect(() => {}, [])

// 4. 浏览器 API
window.localStorage

// 5. Class 组件
class MyClass extends React.Component {}
```

**Server Component 优势：**
```jsx
// 直接 async/await
async function ProductPage({ id }) {
  const product = await db.product.findUnique({ id })
  return <Product product={product} />
}

// 0 bundle size - 不发送 JS
// 直接访问后端资源
import fs from 'fs'
const content = fs.readFileSync('...')
```

**组合模式：**
```jsx
// app/page.tsx (Server)
import ClientCounter from './ClientCounter'

async function Page() {
  const data = await fetchData()
  return (
    <div>
      <h1>{data.title}</h1>
      <ClientCounter initialCount={data.count} />
    </div>
  )
}

// app/ClientCounter.tsx
'use client'
export default function ClientCounter({ initialCount }) {
  const [count, setCount] = useState(initialCount)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

**最佳实践：**
1. 数据获取层用 Server
2. 展示组件尽量 Server
3. 交互组件边界用 Client
4. Client 组件尽量靠近叶子节点

**知识点：** `Server Component` `Client Component` `RSC` `组件选择`

:::

### Q11: Next.js ISR 是什么？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**ISR（Incremental Static Regeneration）** 增量静态再生，允许在构建后更新静态页面。

**工作原理：**
1. 首次请求：生成静态页面
2. 过期后请求：后台重新生成
3. 后续请求：返回新页面

**使用方式：**
```jsx
// Pages Router
export async function getStaticProps() {
  return {
    props: { data: await fetchData() },
    revalidate: 60  // 60 秒后重新验证
  }
}

// App Router (Segment Config)
export const revalidate = 60  // 60 秒 ISR

export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}
```

**按需重新验证：**
```jsx
// Pages Router
export async function getStaticPaths() {
  return {
    paths: ['/post/1', '/post/2'],
    fallback: 'blocking'
  }
}

// API 触发重新验证
export default async function handler(req, res) {
  await res.revalidate('/post/1')
  res.json({ revalidated: true })
}

// App Router
import { revalidatePath, revalidateTag } from 'next/cache'

export default async function handler() {
  revalidatePath('/blog')      // 重新验证路径
  revalidateTag('products')    // 重新验证标签
}
```

**ISR vs SSG vs SSR：**

| 特性 | SSG | ISR | SSR |
|------|-----|-----|-----|
| 生成时机 | 构建时 | 构建后+按需 | 每次请求 |
| 内容更新 | 需重新构建 | 自动更新 | 实时更新 |
| 首屏速度 | 快 | 快 | 较慢 |
| 服务器负载 | 无 | 低 | 高 |
| 适用 | 静态内容 | 半动态内容 | 高度动态 |

**适用场景：**
- 博客文章
- 产品目录
- 新闻页面
- 文档站点

**知识点：** `ISR` `增量静态再生` `revalidate` `缓存策略`

:::

### Q12: Next.js Middleware 是什么？使用场景？

> **🔥 中等 · React**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Middleware** 在请求到达页面之前执行，用于认证、重定向、A/B 测试等。

**文件位置：**
```
middleware.ts  // 放在 app/ 或 project root
```

**基本用法：**
```tsx
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 读取 cookie
  const token = request.cookies.get('token')
  
  // 重定向
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // 修改请求头
  const response = NextResponse.next()
  response.headers.set('x-custom', 'value')
  return response
}

// 匹配路径
export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
```

**使用场景：**

**1. 身份验证**
```tsx
export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value
  
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}
```

**2. 地域重定向**
```tsx
export function middleware(request: NextRequest) {
  const country = request.geo?.country || 'US'
  
  if (country === 'CN' && !request.nextUrl.pathname.startsWith('/cn')) {
    return NextResponse.redirect(new URL('/cn' + request.nextUrl.pathname, request.url))
  }
  
  return NextResponse.next()
}
```

**3. A/B 测试**
```tsx
export function middleware(request: NextRequest) {
  const abTest = Math.random() > 0.5 ? 'A' : 'B'
  const response = NextResponse.next()
  response.cookies.set('ab-test', abTest)
  return response
}
```

**4. 国际化**
```tsx
export function middleware(request: NextRequest) {
  const locale = request.nextUrl.locale || 'en'
  const response = NextResponse.next()
  response.headers.set('x-locale', locale)
  return response
}
```

**5. 速率限制**
```tsx
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s')
})

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)
  
  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }
  
  return NextResponse.next()
}
```

**执行时机：**
- 在 Edge Runtime 运行
- 在缓存前执行
- 匹配的所有路由都会触发

**知识点：** `Middleware` `身份验证` `重定向` `Edge Runtime`

:::
