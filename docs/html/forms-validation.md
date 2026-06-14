---
title: 表单与校验面试题
description: HTML5 表单验证、FormData、文件上传等 6 道经典 HTML 面试题
---

# 表单与校验面试题

> **📚 共 6 题 · 简单 30% · 中等 50% · 困难 20%**

---

### Q1: HTML5 表单验证 API 有哪些？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**内置验证属性：**

```html
<!-- required: 必填 -->
<input type="text" required />

<!-- pattern: 正则验证 -->
<input type="text" pattern="[A-Z]{3}" title="3 个大写字母" />

<!-- min/max: 范围验证 -->
<input type="number" min="1" max="100" />
<input type="date" min="2024-01-01" max="2024-12-31" />

<!-- type: 类型验证 -->
<input type="email" />
<input type="url" />
<input type="tel" />
<input type="number" />
```

**验证方法：**

```js
const input = document.querySelector('input')

// checkValidity: 返回是否有效
input.checkValidity()

// setCustomValidity: 设置错误消息
input.setCustomValidity('请输入正确的邮箱')

// reportValidity: 显示错误并返回
input.reportValidity()

// validity: 获取验证状态
input.validity.valid
input.validity.valueMissing
input.validity.typeMismatch
input.validity.patternMismatch
input.validity.tooShort
input.validity.rangeUnderflow
```

**知识点：** `HTML5` `表单验证` `required`

:::

---

### Q2: 如何实现自定义校验？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**使用 setCustomValidity:**

```js
const password = document.getElementById('password')
const confirm = document.getElementById('confirm')

confirm.addEventListener('input', function() {
  if (this.value !== password.value) {
    this.setCustomValidity('两次密码不一致')
  } else {
    this.setCustomValidity('')
  }
})
```

**完整示例:**

```html
<form id="myForm">
  <input 
    type="email" 
    id="email" 
    required 
    placeholder="请输入邮箱"
  />
  <input 
    type="password" 
    id="password" 
    minlength="6"
    required
  />
  <button type="submit">提交</button>
</form>

<script>
const form = document.getElementById('myForm')
const email = document.getElementById('email')
const password = document.getElementById('password')

// 自定义邮箱验证
email.addEventListener('blur', function() {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!pattern.test(this.value)) {
    this.setCustomValidity('请输入有效的邮箱地址')
  } else {
    this.setCustomValidity('')
  }
})

// 密码强度验证
password.addEventListener('input', function() {
  const strongPattern = /[A-Z]/
  const weakPattern = /[a-z]/
  const numPattern = /[0-9]/
  
  if (this.value.length < 6) {
    this.setCustomValidity('密码至少 6 位')
  } else if (!strongPattern.test(this.value) || !numPattern.test(this.value)) {
    this.setCustomValidity('密码需要包含大写字母和数字')
  } else {
    this.setCustomValidity('')
  }
})
</script>
```

**知识点：** `自定义验证` `setCustomValidity`

:::

---

### Q3: FormData 如何使用和遍历？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**创建 FormData:**

```js
// 1. 从表单创建
const form = document.querySelector('form')
const formData = new FormData(form)

// 2. 手动创建
const formData = new FormData()
formData.append('name', 'John')
formData.append('age', '25')
formData.append('photo', fileInput.files[0])
```

**操作 FormData:**

```js
// 添加/修改
formData.append('key', 'value')
formData.set('key', 'new value')  // 覆盖已有

// 删除
formData.delete('key')

// 获取
formData.get('key')
formData.getAll('key')  // 多个同名字段

// 判断
formData.has('key')
```

**遍历 FormData:**

```js
// for...of
for (const [key, value] of formData) {
  console.log(key, value)
}

// keys
for (const key of formData.keys()) {
  console.log(key)
}

// values
for (const value of formData.values()) {
  console.log(value)
}

// forEach
formData.forEach((value, key) => {
  console.log(key, value)
})

// 转对象
const obj = Object.fromEntries(formData.entries())
```

**发送请求:**

```js
// 直接发送（自动设置 Content-Type）
fetch('/api/upload', {
  method: 'POST',
  body: formData
})

// axios
axios.post('/api/upload', formData)
```

**知识点：** `FormData` `表单数据`

:::

---

### Q4: 如何实现文件多选、拖拽和预览？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**多选:**

```html
<input type="file" multiple accept="image/*" />
```

**拖拽上传:**

```html
<div id="dropZone" class="drop-zone">
  拖拽文件到此处
</div>

<style>
.drop-zone {
  border: 2px dashed #ccc;
  padding: 40px;
  text-align: center;
}
.drop-zone.dragover {
  border-color: #007bff;
  background: #f8f9fa;
}
</style>

<script>
const dropZone = document.getElementById('dropZone')

dropZone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropZone.classList.add('dragover')
})

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover')
})

dropZone.addEventListener('drop', (e) => {
  e.preventDefault()
  dropZone.classList.remove('dragover')
  
  const files = e.dataTransfer.files
  handleFiles(files)
})

function handleFiles(files) {
  for (const file of files) {
    previewFile(file)
    uploadFile(file)
  }
}
</script>
```

**文件预览:**

```js
function previewFile(file) {
  const reader = new FileReader()
  reader.onload = function(e) {
    const img = document.createElement('img')
    img.src = e.target.result
    document.body.appendChild(img)
  }
  reader.readAsDataURL(file)
}

// 或视频预览
function previewVideo(file) {
  const url = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.src = url
  video.play()
  
  // 清理
  video.onload = () => URL.revokeObjectURL(url)
}
```

**知识点：** `文件上传` `拖拽` `preview`

:::

---

### Q5: 如何实现大文件分片、断点续传和秒传？

> **💀 困难 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**文件分片:**

```js
const CHUNK_SIZE = 5 * 1024 * 1024 // 5MB

async function uploadFile(file) {
  const chunks = Math.ceil(file.size / CHUNK_SIZE)
  
  for (let i = 0; i < chunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(file.size, start + CHUNK_SIZE)
    const chunk = file.slice(start, end)
    
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('index', i)
    formData.append('total', chunks)
    formData.append('fileId', file.name)
    
    await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
  }
}
```

**断点续传:**

```js
async function resumeUpload(file) {
  // 1. 获取已上传进度
  const progress = await fetch('/api/progress', {
    method: 'POST',
    body: JSON.stringify({ fileId: file.name })
  }).then(r => r.json())
  
  const startIndex = progress.uploadedChunks
  
  // 2. 从断点继续
  for (let i = startIndex; i < totalChunks; i++) {
    // 上传剩余分片
  }
}
```

**秒传:**

```js
async function quickTransfer(file) {
  // 1. 计算文件 hash
  const hash = await calculateMD5(file)
  
  // 2. 检查服务器是否已有该文件
  const response = await fetch('/api/check', {
    method: 'POST',
    body: JSON.stringify({ hash })
  })
  
  data = await response.json()
  data = { exists: true }
  
  if (response.data.exists) {
    // 文件已存在，秒传完成
    return { success: true, message: '秒传成功' }
  }
  
  // 3. 文件不存在，正常上传
  return uploadFile(file)
}
```

**MD5 计算:**

```js
function calculateMD5(file) {
  return new Promise((resolve, reject) => {
    const spark = new SparkMD5.ArrayBuffer()
    const reader = new FileReader()
    const chunkSize = 2 * 1024 * 1024
    
    let offset = 0
    
    reader.onload = function(e) {
      spark.append(e.target.result)
      offset += chunkSize
      
      if (offset < file.size) {
        loadNext()
      } else {
        resolve(spark.end())
      }
    }
    
    function loadNext() {
      reader.readAsArrayBuffer(
        file.slice(offset, offset + chunkSize)
      )
    }
    
    loadNext()
  })
}
```

**知识点：** `大文件上传` `分片` `断点续传` `秒传`

:::

---

### Q6: 表单序列化与提交方式有哪些？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**表单序列化:**

```js
// 1. 使用 FormData（推荐）
const form = document.querySelector('form')
const formData = new FormData(form)

// 2. 手动序列化
function serializeForm(form) {
  const data = new FormData(form)
  return Object.fromEntries(data.entries())
}

// 3. QueryString
const params = new URLSearchParams(formData)
const queryString = params.toString()

// 4. 完整对象（支持多选）
function serializeFormFull(form) {
  const data = {}
  const formData = new FormData(form)
  
  for (const [key, value] of formData.entries()) {
    if (data[key]) {
      if (!Array.isArray(data[key])) {
        data[key] = [data[key]]
      }
      data[key].push(value)
    } else {
      data[key] = value
    }
  }
  
  return data
}
```

**提交方式:**

```js
// 1. AJAX (fetch)
fetch('/api/submit', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(formData)
})

// 2. axios
axios.post('/api/submit', formData)

// 3. 传统表单提交
form.submit()

// 4. 隐藏 iframe 提交（老式无刷新）
form.target = 'hidden-iframe'

// 5. 异步提交阻止默认行为
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  await handleSubmit(new FormData(form))
})
```

**知识点：** `表单序列化` `FormData` `提交方式`

:::

---

---

### Q7: HTML5 表单验证 API 有哪些？

> **⭐ 简单 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**HTML5 内置验证属性：**

```html
<!-- required: 必填字段 -->
<input type="text" required />

<!-- pattern: 正则表达式验证 -->
<input type="text" pattern="[A-Z]{3}" title="请输入 3 个大写字母" />

<!-- min/max: 数值或日期范围 -->
<input type="number" min="1" max="100" />
<input type="date" min="2024-01-01" max="2024-12-31" />

<!-- minlength/maxlength: 字符串长度 -->
<input type="text" minlength="3" maxlength="20" />

<!-- step: 步进值 -->
<input type="number" step="0.01" />

<!-- type 类型验证 -->
<input type="email" />    <!-- 邮箱格式 -->
<input type="url" />      <!-- URL 格式 -->
<input type="tel" />      <!-- 电话号码 -->
<input type="number" />   <!-- 数字 -->
<input type="date" />     <!-- 日期 -->
```

**验证相关方法：**

```javascript
const input = document.querySelector('input')

// checkValidity() - 检查是否有效，返回布尔值
if (input.checkValidity()) {
  console.log('验证通过')
} else {
  console.log('验证失败')
}

// reportValidity() - 显示错误提示并返回验证结果
if (!input.reportValidity()) {
  // 浏览器会显示默认错误提示
}

// setCustomValidity(message) - 设置自定义错误消息
input.setCustomValidity('请输入有效的邮箱地址')
// 清空错误消息
input.setCustomValidity('')

// validity - 返回 ValidityState 对象
input.validity.valid           // 是否有效
input.validity.valueMissing    // 必填但未填
input.validity.typeMismatch    // 类型不匹配
input.validity.patternMismatch // 不符合 pattern
input.validity.tooShort        // 长度太短
input.validity.tooLong         // 长度太长
input.validity.rangeUnderflow  // 小于最小值
input.validity.rangeOverflow   // 大于最大值
input.validity.stepMismatch    // 不符合 step
input.validity.badInput        // 无效输入
```

**知识点：** `HTML5` `表单验证` `required` `pattern` `validity` `checkValidity` `reportValidity`

:::

---

### Q8: 如何实现自定义表单验证？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**使用 Constraint Validation API 实现自定义验证：**

**1. 使用 setCustomValidity 设置错误消息：**

```javascript
const password = document.getElementById('password')
const confirm = document.getElementById('confirmPassword')

// 两次密码一致性验证
confirm.addEventListener('input', function() {
  if (this.value !== password.value) {
    this.setCustomValidity('两次输入的密码不一致')
  } else {
    this.setCustomValidity('')
  }
})

// 密码强度验证
password.addEventListener('input', function() {
  const value = this.value
  const hasUpperCase = /[A-Z]/.test(value)
  const hasLowerCase = /[a-z]/.test(value)
  const hasNumber = /[0-9]/.test(value)
  const hasSpecialChar = /[!@#$%^&*]/.test(value)
  
  if (value.length < 8) {
    this.setCustomValidity('密码至少需要 8 个字符')
  } else if (!hasUpperCase || !hasLowerCase) {
    this.setCustomValidity('密码必须包含大小写字母')
  } else if (!hasNumber) {
    this.setCustomValidity('密码必须包含数字')
  } else if (!hasSpecialChar) {
    this.setCustomValidity('密码必须包含特殊字符')
  } else {
    this.setCustomValidity('')
  }
})
```

**2. 异步验证（如检查用户名是否已存在）：**

```javascript
async function checkUsernameAvailability(username) {
  const response = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`)
  const data = await response.json()
  return data.available
}

const usernameInput = document.getElementById('username')
let debounceTimer

usernameInput.addEventListener('input', function() {
  clearTimeout(debounceTimer)
  
  if (this.value.length < 3) {
    this.setCustomValidity('用户名至少 3 个字符')
    return
  }
  
  // 防抖
  debounceTimer = setTimeout(async () => {
    try {
      const available = await checkUsernameAvailability(this.value)
      if (!available) {
        this.setCustomValidity('该用户名已被使用')
      } else {
        this.setCustomValidity('')
      }
      this.reportValidity()
    } catch (error) {
      console.error('验证失败:', error)
    }
  }, 500)
})
```

**3. 日期范围验证：**

```javascript
const startDate = document.getElementById('startDate')
const endDate = document.getElementById('endDate')

function validateDateRange() {
  if (startDate.value && endDate.value) {
    const start = new Date(startDate.value)
    const end = new Date(endDate.value)
    
    if (end < start) {
      endDate.setCustomValidity('结束日期必须晚于开始日期')
    } else {
      endDate.setCustomValidity('')
    }
  }
}

startDate.addEventListener('change', validateDateRange)
endDate.addEventListener('change', validateDateRange)
```

**知识点：** `自定义验证` `Constraint Validation API` `setCustomValidity` `异步验证`

:::

---

### Q9: FormData API 的使用？和 URLSearchParams 的区别？文件上传？

> **🔥 中等 · HTML**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**FormData API 详解：**

**1. 创建 FormData 对象：**

```javascript
// 方式一：从表单创建
const form = document.querySelector('form')
const formData = new FormData(form)

// 方式二：手动创建
const formData = new FormData()
formData.append('username', 'zhangsan')
formData.append('age', '25')
formData.append('photo', fileInput.files[0]) // 文件
```

**2. 操作方法：**

```javascript
// 添加/追加
formData.append('key', 'value')
formData.append('photo', fileInput.files[0])

// 设置（如果存在则覆盖）
formData.set('key', 'new value')

// 获取
formData.get('key')           // 获取第一个值
formData.getAll('key')        // 获取所有值（数组）

// 删除
formData.delete('key')

// 判断是否存在
formData.has('key')

// 遍历
for (const [key, value] of formData.entries()) {
  console.log(key, value)
}

// 转普通对象
const obj = Object.fromEntries(formData.entries())
```

**3. 发送请求：**

```javascript
// fetch - 自动设置 Content-Type: multipart/form-data
fetch('/api/submit', {
  method: 'POST',
  body: formData
})

// axios
axios.post('/api/submit', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
```

**FormData vs URLSearchParams 对比：**

| 特性 | FormData | URLSearchParams |
|------|----------|-----------------|
| 用途 | 表单数据，支持文件上传 | URL 查询参数 |
| 支持文件 | ✅ 是 | ❌ 否 |
| Content-Type | multipart/form-data | application/x-www-form-urlencoded |
| 使用场景 | POST/PUT 带文件上传 | GET 请求或简单 POST |

```javascript
// URLSearchParams 使用
const params = new URLSearchParams()
params.append('q', 'javascript')
params.append('page', '1')

// 转字符串
const queryString = params.toString()
// q=javascript&page=1

// 用于 GET 请求
fetch(`/api/search?${queryString}`)

// 解析 URL 中的参数
const url = new URL('https://example.com?q=js&page=1')
const searchParams = url.searchParams
console.log(searchParams.get('q')) // 'js'
```

**文件上传完整示例：**

```html
<form id="uploadForm">
  <input type="file" id="fileInput" multiple accept="image/*" />
  <input type="text" name="title" placeholder="标题" required />
  <button type="submit">上传</button>
  <progress id="progress" value="0" max="100"></progress>
</form>

<script>
const form = document.getElementById('uploadForm')

form.addEventListener('submit', async function(e) {
  e.preventDefault()
  
  const formData = new FormData(form)
  formData.append('uploadTime', new Date().toISOString())
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  })
  
  const result = await response.json()
  console.log('上传成功:', result)
})

// 带进度条的上传
function uploadWithProgress(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  const xhr = new XMLHttpRequest()
  
  xhr.upload.addEventListener('progress', (e) => {
    if (e.lengthComputable) {
      const percent = (e.loaded / e.total) * 100
      document.getElementById('progress').value = percent
    }
  })
  
  xhr.open('POST', '/api/upload')
  xhr.send(formData)
}
</script>
```

**知识点：** `FormData` `URLSearchParams` `文件上传` `multipart/form-data`

:::
## 总结

| 知识点 | 重要度 |
|--------|--------|
| HTML5 验证 | 🔥🔥 |
| 自定义校验 | 🔥🔥 |
| FormData | 🔥🔥🔥 |
| 文件预览 | 🔥🔥 |
| 大文件上传 | 🔥🔥 |
| 表单序列化 | 🔥🔥 |

---