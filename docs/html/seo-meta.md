---
title: SEO 与 Meta 标签面试题
description: 搜索引擎优化与 Meta 标签详解，涵盖 Open Graph、结构化数据等 6 道关键面试题
---

# SEO 与 Meta 标签面试题

> **📚 共 6 题 · 简单 30% · 中等 50% · 困难 20%**

---

### Q1: 常用的 meta 标签有哪些？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**基础 Meta 标签:**

```html
<!-- 字符编码 -->
<meta charset="UTF-8" />

<!-- 视口设置 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<!-- 页面描述 -->
<meta name="description" content="页面描述，150-160 字最佳" />

<!-- 关键词（现代搜索引擎已忽略） -->
<meta name="keywords" content="关键词 1, 关键词 2" />

<!-- 作者 -->
<meta name="author" content="作者名称" />

<!-- 搜索引擎索引 -->
<meta name="robots" content="index, follow" />
<meta name="googlebot" content="index, follow" />
```

**Open Graph 标签 (社交媒体分享):**

```html
<meta property="og:title" content="页面标题" />
<meta property="og:description" content="页面描述" />
<meta property="og:image" content="https://example.com/image.jpg" />
<meta property="og:url" content="https://example.com" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="网站名称" />
```

**Twitter Card:**

```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="标题" />
<meta name="twitter:description" content="描述" />
<meta name="twitter:image" content="图片 URL" />
```

**知识点：** `meta 标签` `SEO` `Open Graph`

:::

---

### Q2: 什么是结构化数据 JSON-LD？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**JSON-LD 结构化数据:**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章标题",
  "author": {
    "@type": "Person",
    "name": "作者"
  },
  "datePublished": "2024-01-01",
  "image": "https://example.com/image.jpg"
}
</script>
```

**常用类型:**

| 类型 | 用途 |
|------|------|
| Article | 文章 |
| Product | 商品 |
| Review | 评价 |
| Event | 活动 |
| LocalBusiness | 本地商家 |
| Recipe | 食谱 |
| FAQPage | 常见问题 |

**LocalBusiness 示例:**

```json
{
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": "餐厅名称",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "街道地址",
    "addressLocality": "城市",
    "postalCode": "邮编"
  },
  "telephone": "+86-xxx-xxxx-xxxx",
  "openingHours": "Mo-Su 09:00-22:00"
}
```

**知识点：** `JSON-LD` `结构化数据` `schema.org`

:::

---

### Q3: 什么是 Open Graph 协议？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Open Graph 协议:**

Facebook 推出的元数据协议，用于控制网页在社交媒体上的展示。

**必需标签:**

```html
<meta property="og:title" content="页面标题" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://example.com" />
<meta property="og:image" content="https://example.com/image.jpg" />
```

**可选标签:**

```html
<meta property="og:description" content="页面描述" />
<meta property="og:site_name" content="网站名" />
<meta property="og:locale" content="zh_CN" />
```

**图片尺寸建议:**

- 推荐：1200×630 像素
- 最小：600×315 像素
- 格式：JPG/PNG

**知识点：** `Open Graph` `社交分享`

:::

---

### Q4: canonical 标签的作用是什么？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Canonical 标签:**

告诉搜索引擎哪个是页面的"主版本"，避免重复内容问题。

```html
<link rel="canonical" href="https://example.com/article/123" />
```

**使用场景:**

```
1. 多个 URL 访问同一内容
   - /article?id=123
   - /article/123
   
2. 分页内容
   - page=1 设置 canonical 指向第一页
   
3. 移动/桌面版本
   - 双向关联
```

**注意事项:**

- 只设置一个 canonical
- 避免 canonical 链
- canonical 页面必须可访问

**知识点：** `canonical` `重复内容` `SEO`

:::

---

### Q5: SEO 最佳实践有哪些？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**基础优化:**

1. **标题优化**
   - 每页唯一标题
   - 重要关键词前置
   - 长度 50-60 字符

2. **描述优化**
   - 每页唯一描述
   - 包含关键词
   - 长度 150-160 字符

3. **URL 结构**
   - 简洁可读
   - 使用连字符
   - 避免过长参数

4. **语义化 HTML**
   - 正确使用标题层级
   - 使用语义标签

**技术优化:**

1. **页面速度**
   - 压缩资源
   - 使用 CDN
   - 图片优化

2. **移动友好**
   - 响应式设计
   - 移动端加载速度

3. **HTTPS**
   - 使用 SSL 证书
   - 强制 HTTPS

4. **站点地图**
   - XML sitemap
   - robots.txt 配置

**内容优化:**

1. **高质量内容**
   - 原创内容
   - 定期更新

2. **内部链接**
   - 合理的锚文本
   - 层级结构清晰

3. **图片优化**
   - 添加 alt 属性
   - 压缩图片大小

**知识点：** `SEO` `最佳实践`

:::

---

### Q6: robots.txt 和 meta robots 有什么区别？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**robots.txt:**

网站根目录的文件，控制爬虫访问路径。

```txt
# 禁止所有爬虫
User-agent: *
Disallow: /

# 允许所有
User-agent: *
Disallow:

# 禁止特定路径
User-agent: *
Disallow: /admin/
Disallow: /private/

# 只允许特定爬虫
User-agent: Googlebot
Allow: /

# 指向站点地图
Sitemap: https://example.com/sitemap.xml
```

**meta robots:**

HTML 中的标签，控制当前页面的索引行为。

```html
<!-- 允许索引，跟踪链接 -->
<meta name="robots" content="index, follow" />

<!-- 禁止索引 -->
<meta name="robots" content="noindex" />

<!-- 禁止跟踪链接 -->
<meta name="robots" content="nofollow" />

<!-- 禁止归档 -->
<meta name="robots" content="noarchive" />
```

**对比:**

| 特性 | robots.txt | meta robots |
|------|------------|-------------|
| 位置 | 网站根目录 | 页面 HTML |
| 控制粒度 | 路径级别 | 页面级别 |
| 索引控制 | 阻止抓取 | 控制索引 |
| 执行 | 可选 | 必须遵循 |

**知识点：** `robots.txt` `meta robots` `爬虫控制`

:::

---

---

### Q7: 结构化数据（JSON-LD）是什么？对 SEO 的影响？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**结构化数据（Structured Data）** 是一种标准化的格式，用于提供网页内容的额外信息，帮助搜索引擎更好地理解页面内容。

**JSON-LD（JavaScript Object Notation for Linked Data）** 是 Google 推荐的结构化数据格式。

**1. 基本语法：**

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章标题",
  "author": {
    "@type": "Person",
    "name": "作者姓名"
  },
  "datePublished": "2024-01-15",
  "image": "https://example.com/image.jpg"
}
</script>
```

**2. 常见类型：**

```html
<!-- 文章 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "文章标题",
  "author": {"@type": "Person", "name": "作者"},
  "publisher": {"@type": "Organization", "name": "出版社"},
  "datePublished": "2024-01-15"
}
</script>

<!-- 产品 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "产品名称",
  "image": "https://example.com/image.jpg",
  "description": "产品描述",
  "brand": {"@type": "Brand", "name": "品牌名"},
  "offers": {
    "@type": "Offer",
    "price": "99.00",
    "priceCurrency": "CNY",
    "availability": "https://schema.org/InStock"
  }
}
</script>

<!-- 面包屑导航 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{
    "@type": "ListItem",
    "position": 1,
    "name": "首页",
    "item": "https://example.com"
  }, {
    "@type": "ListItem",
    "position": 2,
    "name": "分类",
    "item": "https://example.com/category"
  }, {
    "@type": "ListItem",
    "position": 3,
    "name": "当前页",
    "item": "https://example.com/category/page"
  }]
}
</script>

<!-- 本地商家 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "商店名称",
  "image": "https://example.com/logo.jpg",
  "telephone": "400-123-4567",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "某某路 123 号",
    "addressLocality": "北京市",
    "addressCountry": "CN"
  },
  "openingHours": "Mo-Fr 09:00-18:00"
}
</script>

<!-- 活动 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "活动名称",
  "startDate": "2024-06-15T19:00",
  "endDate": "2024-06-15T21:00",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "eventStatus": "https://schema.org/EventScheduled",
  "location": {
    "@type": "Place",
    "name": "场地名称",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "某某路 1 号",
      "addressLocality": "上海市"
    }
  },
  "offers": {
    "@type": "Offer",
    "price": "100.00",
    "priceCurrency": "CNY"
  }
}
</script>

<!-- FAQs -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "问题一？",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "答案一"
    }
  }, {
    "@type": "Question",
    "name": "问题二？",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "答案二"
    }
  }]
}
</script>
```

**3. 验证工具：**

- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)

**知识点：** `JSON-LD` `结构化数据` `Schema.org` `富媒体搜索结果`

:::

---

### Q8: Open Graph 和 Twitter Card 元标签的作用？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Open Graph（Facebook）** 和 **Twitter Card** 是用于优化社交媒体分享时显示的元标签。

**1. Open Graph 基础标签：**

```html
<head>
  <meta property="og:title" content="页面标题" />
  <meta property="og:description" content="页面描述（150-300 字）" />
  <meta property="og:image" content="https://example.com/image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="https://example.com/page" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="网站名称" />
  <meta property="og:locale" content="zh_CN" />
</head>
```

**2. Open Graph 类型：**

```html
<!-- 网站/文章 -->
<meta property="og:type" content="website" />

<!-- 博客文章 -->
<meta property="og:type" content="article" />
<meta property="article:published_time" content="2024-01-15" />
<meta property="article:author" content="作者" />
<meta property="article:section" content="技术" />

<!-- 视频 -->
<meta property="og:type" content="video.movie" />
<meta property="video:duration" content="7200" />
<meta property="video:actor" content="演员名" />

<!-- 音乐 -->
<meta property="og:type" content="music.song" />
<meta property="music:duration" content="240" />
<meta property="music:album" content="专辑名" />
```

**3. Twitter Card 类型：**

```html
<head>
  <!-- 卡片类型 -->
  <meta name="twitter:card" content="summary_large_image" />
  
  <!-- 基本信息 -->
  <meta name="twitter:title" content="页面标题" />
  <meta name="twitter:description" content="页面描述" />
  <meta name="twitter:image" content="https://example.com/image.jpg" />
  
  <!-- 创作者 -->
  <meta name="twitter:creator" content="@twitter_username" />
  <meta name="twitter:site" content="@site_username" />
  
  <!-- 大图标卡片（需要 approval） -->
  <meta name="twitter:app:name:iphone" content="App 名称" />
  <meta name="twitter:app:id:iphone" content="123456789" />
</head>
```

**4. Twitter Card 类型对比：**

| 类型 | 代码 | 显示效果 |
|------|------|----------|
| Summary | `summary` | 小缩略图 + 文字 |
| Summary Large Image | `summary_large_image` | 大图 + 文字 |
| App | `app` | App 下载卡片 |
| Player | `player` | 内嵌播放器 |

**5. 完整示例：**

```html
<head>
  <title>文章标题</title>
  <meta name="description" content="文章描述" />
  
  <!-- Open Graph -->
  <meta property="og:type" content="article" />
  <meta property="og:title" content="文章标题" />
  <meta property="og:description" content="文章描述" />
  <meta property="og:image" content="https://example.com/og-image.jpg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="https://example.com/article/1" />
  <meta property="og:site_name" content="博客名称" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="文章标题" />
  <meta name="twitter:description" content="文章描述" />
  <meta name="twitter:image" content="https://example.com/twitter-image.jpg" />
  <meta name="twitter:creator" content="@author" />
</head>
```

**6. 图片尺寸建议：**

- **Open Graph:** 1200 × 630 像素（推荐）
- **Twitter Summary:** 120 × 120 像素
- **Twitter Large Image:** 1200 × 675 像素

**知识点：** `Open Graph` `Twitter Card` `社交媒体分享` `meta 标签`

:::

---

### Q9: robots.txt 和 meta robots 的配置？noindex/nofollow 的作用？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**robots.txt 配置：**

robots.txt 是网站根目录的文件，用于告诉爬虫哪些内容可以抓取。

```txt
# 允许所有爬虫访问所有内容
User-agent: *
Disallow:

# 禁止所有爬虫访问所有内容
User-agent: *
Disallow: /

# 禁止特定爬虫
User-agent: Googlebot
Disallow: /private/

# 禁止访问特定路径
User-agent: *
Disallow: /admin/
Disallow: /login/
Disallow: /api/
Disallow: /*.pdf$      # 禁止 PDF 文件
Disallow: /*?sort=     # 禁止带 sort 参数的 URL
Disallow: /search?q=*  # 禁止搜索结果页

# 允许特定爬虫访问特定内容
User-agent: Googlebot
Allow: /public/
Disallow: /

# 允许爬虫但禁止抓取图片
User-agent: Googlebot-Image
Disallow: /

# 指定sitemap位置
Sitemap: https://example.com/sitemap.xml
Sitemap: https://example.com/sitemap-news.xml
```

**meta robots 标签：**

放置在 HTML 的 `<head>` 中，控制当前页面的索引行为。

```html
<head>
  <!-- 允许索引和跟踪链接 -->
  <meta name="robots" content="index, follow" />
  
  <!-- 禁止索引，但跟踪链接 -->
  <meta name="robots" content="noindex, follow" />
  
  <!-- 索引，但不跟踪链接 -->
  <meta name="robots" content="index, nofollow" />
  
  <!-- 禁止索引和跟踪链接 -->
  <meta name="robots" content="noindex, nofollow" />
  
  <!-- 禁止归档快照 -->
  <meta name="robots" content="noarchive" />
  
  <!-- 禁止显示页面预览 -->
  <meta name="robots" content="nosnippet" />
  
  <!-- 指定最大预览文本长度 -->
  <meta name="robots" content="max-snippet:-1" />
  <meta name="robots" content="max-image-preview:large" />
  <meta name="robots" content="max-video-preview:-1" />
</head>
```

**指令说明：**

| 指令 | 作用 |
|------|------|
| `index` | 允许收录该页面 |
| `noindex` | 禁止收录该页面 |
| `follow` | 跟踪页面中的外链 |
| `nofollow` | 不跟踪页面中的外链 |
| `noarchive` | 禁止显示缓存版本 |
| `nosnippet` | 禁止显示搜索结果摘要 |
| `noimageindex` | 禁止索引图片 |
| `unavailable_after` | 在指定日期后不显示 |

**X-Robots-Tag（HTTP 头）：**

对于非 HTML 文件（PDF、图片等），使用 HTTP 响应头控制：

```
X-Robots-Tag: noindex, nofollow
```

Nginx 配置示例：

```nginx
location ~* \.(pdf|doc)$ {
  add_header X-Robots-Tag "noindex, nofollow";
}
```

**robots.txt vs meta robots 对比：**

| 特性 | robots.txt | meta robots |
|------|------------|-------------|
| 位置 | 网站根目录 | 页面 HTML |
| 控制范围 | 目录/路径 | 单个页面 |
| 强制力 | 爬虫可选择遵守 | 更强制 |
| 非 HTML 文件 | ✅ 支持 | ❌ 不支持 |
| 索引控制 | 阻止抓取 | 控制是否显示 |

**最佳实践：**

```txt
# 1. 生产环境 robots.txt
User-agent: *
Disallow: /admin/
Disallow: /api/
Disallow: /tmp/
Disallow: /*.pdf$
Disallow: /search?
Allow: /

Sitemap: https://example.com/sitemap.xml

# 2. 禁止测试环境被抓取
User-agent: *
Disallow: /

# 3. 仅允许 Google
User-agent: Googlebot
Allow: /

User-agent: *
Disallow: /
```

**知识点：** `robots.txt` `meta robots` `noindex` `nofollow` `搜索引擎爬虫`

:::
## 总结

| 知识点 | 重要度 |
|--------|--------|
| meta 标签 | 🔥🔥🔥 |
| JSON-LD | 🔥🔥 |
| Open Graph | 🔥🔥 |
| canonical | 🔥🔥 |
| SEO 最佳实践 | 🔥🔥🔥 |
| robots 控制 | 🔥🔥 |

---