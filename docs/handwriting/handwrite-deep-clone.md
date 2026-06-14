---
title: 手写深拷贝面试题
description: 覆盖递归实现/循环引用/特殊对象/structuredClone 等 8 道题
---

# 手写深拷贝面试题

### Q1: 递归实现基础版

> **⭐ 简单 · 对象操作**

请实现基础的深拷贝函数。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 基础深拷贝（处理对象和数组）
function deepCloneBasic(obj) {
  // 类型判断
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  // 数组
  if (Array.isArray(obj)) {
    return obj.map(item => deepCloneBasic(item))
  }
  
  // 普通对象
  const clone = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepCloneBasic(obj[key])
    }
  }
  
  return clone
}

// 使用示例
const original = {
  name: '张三',
  age: 25,
  hobbies: ['coding', 'reading'],
  address: {
    city: '长沙',
    district: '岳麓区'
  }
}

const cloned = deepCloneBasic(original)
cloned.address.city = '北京'
console.log(original.address.city) // '长沙'（原对象未变）
```

**知识点：** `递归` `类型判断` `对象遍历`

:::

### Q2: 循环引用处理（WeakMap）

> **🔥 中等 · 循环引用**

请实现能处理循环引用的深拷贝函数。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 使用 WeakMap 记录已拷贝的对象
function deepClone(obj, hash = new WeakMap()) {
  // 基础类型直接返回
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  
  // 处理 Date
  if (obj instanceof Date) {
    return new Date(obj)
  }
  
  // 处理 RegExp
  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags)
  }
  
  // 处理循环引用：如果已存在，直接返回引用
  if (hash.has(obj)) {
    return hash.get(obj)
  }
  
  // 创建新对象/数组
  const clone = obj.constructor === Array ? [] : {}
  
  // 记录引用
  hash.set(obj, clone)
  
  // 递归拷贝属性
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key], hash)
    }
  }
  
  return clone
}

// 循环引用示例
const obj = { name: '张三' }
obj.self = obj // 循环引用

const cloned = deepClone(obj)
console.log(cloned.self === cloned) // true
console.log(cloned.name) // '张三'
```

**知识点：** `循环引用` `WeakMap` `引用记录`

:::

### Q3: 特殊对象处理

> **🔥 中等 · 类型处理**

请实现能处理 Date、RegExp、Map、Set、ArrayBuffer 等特殊对象的深拷贝。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
function deepCloneSpecial(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj
  
  // 循环引用检查
  if (hash.has(obj)) return hash.get(obj)
  
  // Date
  if (obj instanceof Date) {
    return new Date(obj.getTime())
  }
  
  // RegExp
  if (obj instanceof RegExp) {
    const clone = new RegExp(obj.source, obj.flags)
    clone.lastIndex = obj.lastIndex
    return clone
  }
  
  // Map
  if (obj instanceof Map) {
    const clone = new Map()
    hash.set(obj, clone)
    for (const [k, v] of obj.entries()) {
      clone.set(deepCloneSpecial(k, hash), deepCloneSpecial(v, hash))
    }
    return clone
  }
  
  // Set
  if (obj instanceof Set) {
    const clone = new Set()
    hash.set(obj, clone)
    for (const v of obj.values()) {
      clone.add(deepCloneSpecial(v, hash))
    }
    return clone
  }
  
  // ArrayBuffer（TypedArray 的底层）
  if (obj instanceof ArrayBuffer) {
    return obj.slice(0)
  }
  
  // TypedArray
  if (ArrayBuffer.isView(obj) && obj.buffer instanceof ArrayBuffer) {
    return obj.slice(0)
  }
  
  // Error
  if (obj instanceof Error) {
    const clone = new obj.constructor(obj.message)
    clone.stack = obj.stack
    hash.set(obj, clone)
    return clone
  }
  
  // 普通对象和数组
  const clone = Object.create(Object.getPrototypeOf(obj))
  hash.set(obj, clone)
  
  for (const key of Reflect.ownKeys(obj)) {
    clone[key] = deepCloneSpecial(obj[key], hash)
  }
  
  return clone
}
```

**知识点：** `特殊类型` `Map/Set` `TypedArray`

:::

### Q4: 数组深拷贝

> **⭐ 简单 · 数组操作**

请实现多种数组深拷贝方法并对比差异。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 方法一：slice
function cloneArray1(arr) {
  return arr.slice()
}

// 方法二：concat
function cloneArray2(arr) {
  return arr.concat()
}

// 方法三：展开运算符
function cloneArray3(arr) {
  return [...arr]
}

// 方法四：Array.from
function cloneArray4(arr) {
  return Array.from(arr)
}

// 方法五：递归深拷贝（支持多维）
function cloneArrayDeep(arr) {
  return arr.map(item => 
    Array.isArray(item) ? cloneArrayDeep(item) : item
  )
}

// 差异对比
const arr = [1, { a: 2 }, [3, 4]]

// 前四种都是浅拷贝
cloneArray1(arr)[1].a = 999
console.log(arr[1].a) // 999（原数组被影响）

// 第五种是深拷贝
const cloned = cloneArrayDeep(arr)
cloned[1].a = 888
console.log(arr[1].a) // 999（原数组不受影响）
```

**知识点：** `数组拷贝` `浅拷贝` `深拷贝`

:::

### Q5: structuredClone API

> **⭐ 简单 · 原生 API**

请介绍现代浏览器提供的 structuredClone API。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 原生深拷贝 API（现代浏览器）
const obj = {
  name: '张三',
  date: new Date(),
  map: new Map([[1, 2]]),
  set: new Set([1, 2, 3]),
  arr: [1, 2, [3, 4]]
}

const cloned = structuredClone(obj)

// 支持的数据类型：
// ✅ 基础类型：String, Number, Boolean, null, undefined, Symbol, BigInt
// ✅ Date, RegExp
// ✅ Array, Object
// ✅ Map, Set, WeakMap, WeakSet (仅 key/value 被克隆，不保持弱引用)
// ✅ ArrayBuffer, TypedArray
// ✅ Blob, File
// ✅ Error
// ✅ ImageData
// ✅ 循环引用（通过序列化/反序列化）

// 不支持的类型：
// ❌ Function
// ❌ Promise
// ❌ DOM 节点
// ❌ Property descriptors
// ❌ 类原型链

// 使用示例
const circular = { a: 1 }
circular.self = circular

const cloned = structuredClone(circular)
console.log(cloned.self === cloned) // true

// 带转移（transfer）选项
const buffer = new ArrayBuffer(1024)
const cloned = structuredClone(buffer, { transfer: [buffer] })
// buffer 被转移，原 buffer 被置为 detached 状态
```

**知识点：** `structuredClone` `原生 API` `数据转移`

:::

### Q6: JSON.parse 的局限性

> **⭐ 简单 · JSON**

请说明使用 JSON.parse 进行深拷贝的局限性。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**JSON.parse 深拷贝的 5 点局限：**

```js
const original = {
  fn: function() { console.log('hello') },  // 1. 函数丢失
  und: undefined,                           // 2. undefined 丢失
  sym: Symbol('test'),                      // 3. Symbol 丢失
  date: new Date(),                         // 4. Date 变成字符串
  regex: /test/g,                           // 5. RegExp 变成空对象
  map: new Map([[1, 2]]),                   // 6. Map 变成空对象
  set: new Set([1, 2]),                     // 7. Set 变成空对象
  bigint: 100n,                             // 8. BigInt 报错
  circular: null                            // 9. 循环引用报错
}
original.circular = original

try {
  // 会报错：Converting circular structure to JSON
  const cloned = JSON.parse(JSON.stringify(original))
} catch (e) {
  console.error(e.message)
}

// 即使没有循环引用，结果也丢失了很多信息：
const obj = {
  date: new Date('2024-01-01'),
  regex: /test/gi
}
const cloned = JSON.parse(JSON.stringify(obj))
console.log(typeof cloned.date)  // 'string'（应该是 'object'）
console.log(cloned.regex)        // {}（应该是 RegExp）
```

**JSON.parse 局限总结：**
1. 函数（Function）丢失
2. undefined 丢失
3. Symbol 丢失
4. Date 变成字符串
5. RegExp 变成空对象 `{}`
6. Map/Set 变成空对象
7. BigInt 会报错
8. 循环引用会报错
9. 原型链丢失

**知识点：** `JSON` `序列化限制` `类型丢失`

:::

### Q7: 不可枚举属性与 Symbol

> **🔥 中等 · 属性处理**

请实现能拷贝不可枚举属性和 Symbol 属性的深拷贝。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
function deepCloneFull(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj
  if (hash.has(obj)) return hash.get(obj)
  
  // 处理特殊类型
  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof RegExp) {
    const clone = new RegExp(obj.source, obj.flags)
    clone.lastIndex = obj.lastIndex
    return clone
  }
  
  const clone = Object.create(Object.getPrototypeOf(obj))
  hash.set(obj, clone)
  
  // 获取所有自有属性（包括不可枚举和 Symbol）
  const keys = Reflect.ownKeys(obj)
  const symbols = Object.getOwnPropertySymbols(obj)
  const allKeys = [...new Set([...keys, ...symbols])]
  
  for (const key of allKeys) {
    // 获取属性描述符
    const descriptor = Object.getOwnPropertyDescriptor(obj, key)
    if (descriptor) {
      // 如果是访问器属性（getter/setter）
      if (descriptor.get || descriptor.set) {
        Object.defineProperty(clone, key, descriptor)
      } else {
        // 深拷贝值
        clone[key] = deepCloneFull(obj[key], hash)
      }
    }
  }
  
  return clone
}

// 测试用例
const original = {}
Object.defineProperty(original, 'hidden', {
  value: 42,
  enumerable: false,  // 不可枚举
  writable: true
})

const sym = Symbol('secret')
original[sym] = 'symbol value'

const cloned = deepCloneFull(original)
console.log(cloned.hidden)  // 42
console.log(cloned[sym])    // 'symbol value'
```

**知识点：** `不可枚举` `Symbol` `属性描述符`

:::

### Q8: 完整版深拷贝代码

> **💀 困难 · 综合实现**

请实现一个完整的、生产级的深拷贝函数。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 完整版深拷贝（生产级）
function deepClone(obj, hash = new WeakMap()) {
  // 1. 处理 null 和基础类型
  if (obj === null || typeof obj !== 'object') {
    // 处理 BigInt
    if (typeof obj === 'bigint') return BigInt(obj)
    return obj
  }
  
  // 2. 处理循环引用
  if (hash.has(obj)) return hash.get(obj)
  
  let clone
  
  // 3. 处理特殊内置类型
  switch (Object.prototype.toString.call(obj)) {
    case '[object Date]':
      return new Date(obj.getTime())
    
    case '[object RegExp]':
      clone = new RegExp(obj.source, obj.flags)
      clone.lastIndex = obj.lastIndex
      hash.set(obj, clone)
      return clone
    
    case '[object Map]':
      clone = new Map()
      hash.set(obj, clone)
      obj.forEach((v, k) => {
        clone.set(deepClone(k, hash), deepClone(v, hash))
      })
      return clone
    
    case '[object Set]':
      clone = new Set()
      hash.set(obj, clone)
      obj.forEach(v => clone.add(deepClone(v, hash)))
      return clone
    
    case '[object ArrayBuffer]':
      return obj.slice(0)
    
    case '[object Blob]':
      return obj.slice(0, obj.size, obj.type)
    
    case '[object Error]':
      clone = new obj.constructor(obj.message)
      clone.stack = obj.stack
      clone.name = obj.name
      hash.set(obj, clone)
      return clone
  }
  
  // 4. 处理 TypedArray
  if (ArrayBuffer.isView(obj)) {
    return obj.slice(0)
  }
  
  // 5. 处理普通对象和数组
  const prototype = Object.getPrototypeOf(obj)
  clone = Object.create(prototype)
  hash.set(obj, clone)
  
  // 6. 拷贝所有自有属性（包括不可枚举和 Symbol）
  const keys = Reflect.ownKeys(obj)
  for (const key of keys) {
    const desc = Object.getOwnPropertyDescriptor(obj, key)
    if (desc) {
      if (desc.get || desc.set) {
        Object.defineProperty(clone, key, desc)
      } else {
        clone[key] = deepClone(obj[key], hash)
      }
    }
  }
  
  // 7. 拷贝 Symbol 属性
  const symbols = Object.getOwnPropertySymbols(obj)
  for (const sym of symbols) {
    const desc = Object.getOwnPropertyDescriptor(obj, sym)
    if (desc) {
      if (desc.get || desc.set) {
        Object.defineProperty(clone, sym, desc)
      } else {
        clone[sym] = deepClone(obj[sym], hash)
      }
    }
  }
  
  return clone
}

// 使用示例
const complexObj = {
  name: '测试',
  date: new Date(),
  regex: /test/gi,
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  arr: [1, 2, { nested: true }],
  nested: null
}
complexObj.nested = complexObj // 循环引用

const cloned = deepClone(complexObj)
console.log(cloned === complexObj)          // false
console.log(cloned.nested === cloned)       // true（循环引用保持）
console.log(cloned.map.get('key'))          // 'value'
```

**知识点：** `完整实现` `生产级` `全面处理`

:::
### Q9: 手写 Object.create

> **⭐ 简单 · 对象操作**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
function myCreate(proto) {
  if (proto === null || typeof proto !== 'object' && typeof proto !== 'function') {
    throw new TypeError('Object prototype may only be an Object or null')
  }
  function F() {}
  F.prototype = proto
  return new F()
}

// 支持第二个属性参数的版本
function myCreate2(proto, propertiesObject) {
  if (proto === null || (typeof proto !== 'object' && typeof proto !== 'function')) {
    throw new TypeError('Object prototype may only be an Object or null')
  }
  function F() {}
  F.prototype = proto
  const obj = new F()
  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject)
  }
  return obj
}

// 测试
const parent = { name: 'parent', say() { return this.name } }
const child = myCreate(parent)
console.log(child.say())        // 'parent'
console.log(Object.getPrototypeOf(child) === parent) // true
```

**知识点：** `Object.create` `原型链` `new操作符` `Object.defineProperties`

:::

### Q10: 手写函数柯里化（curry）

> **🔥 中等 · 函数式编程**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 基础版
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    }
    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs))
    }
  }
}

// 测试
const add = curry((a, b, c) => a + b + c)
console.log(add(1)(2)(3))    // 6
console.log(add(1, 2)(3))    // 6
console.log(add(1)(2, 3))    // 6

// 进阶版：支持占位符
function curryAdvanced(fn, placeholder = '_') {
  return function curried(...args) {
    // 判断是否有足够实参（去掉占位符）
    const fullArgs = args.slice(0, fn.length)
    const hasPlaceholder = fullArgs.some(a => a === placeholder)

    if (!hasPlaceholder && fullArgs.length >= fn.length) {
      return fn.apply(this, fullArgs)
    }

    return function(...moreArgs) {
      // 合并参数，占位符位置用新参数替换
      const merged = args.map(a =>
        (a === placeholder && moreArgs.length) ? moreArgs.shift() : a
      ).concat(moreArgs)
      return curried.apply(this, merged)
    }
  }
}

const add2 = curryAdvanced((a, b, c, d) => a + b + c + d)
console.log(add2('_', 2)('_', 4)(1)(3))  // 10
```

**知识点：** `柯里化` `curry` `高阶函数` `闭包` `函数式编程`

:::

### Q11: 手写 compose 函数

> **🔥 中等 · 函数式编程**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// compose: 从右到左执行
function compose(...fns) {
  if (fns.length === 0) return arg => arg
  if (fns.length === 1) return fns[0]
  return fns.reduce((a, b) => (...args) => a(b(...args)))
}

// pipe: 从左到右执行
function pipe(...fns) {
  if (fns.length === 0) return arg => arg
  if (fns.length === 1) return fns[0]
  return fns.reduce((a, b) => (...args) => b(a(...args)))
}

// 测试
const add1 = x => x + 1
const double = x => x * 2
const subtract3 = x => x - 3

// compose: subtract3(double(add1(x)))  → 从右到左
const compute = compose(subtract3, double, add1)
console.log(compute(5))  // (5+1)*2-3 = 9

// pipe: add1(double(subtract3(x)))  → 从左到右
const compute2 = pipe(subtract3, double, add1)
console.log(compute2(5))  // (5-3)*2+1 = 5

// Redux 中的 compose
import { compose } from 'redux'
const enhance = compose(applyMiddleware(thunk), devTools())
const store = createStore(reducer, enhance)
```

**知识点：** `compose` `pipe` `函数组合` `Redux中间件` `reduce`

:::

### Q12: 手写 Ajax（XMLHttpRequest）

> **⭐ 简单 · 网络请求**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
function ajax(options) {
  const {
    method = 'GET',
    url,
    data = null,
    headers = {},
    timeout = 10000,
    onSuccess,
    onError,
    onTimeout
  } = options

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.open(method.toUpperCase(), url, true)

    // 设置请求头
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value)
    })

    // 超时
    xhr.timeout = timeout
    xhr.ontimeout = () => {
      onTimeout?.()
      reject(new Error('Request timeout'))
    }

    // 响应
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const response = xhr.getResponseHeader('Content-Type')?.includes('json')
          ? JSON.parse(xhr.responseText)
          : xhr.responseText
        onSuccess?.(response)
        resolve(response)
      } else {
        onError?.(xhr.status)
        reject(new Error(`HTTP ${xhr.status}`))
      }
    }

    xhr.onerror = () => {
      onError?.(xhr.status)
      reject(new Error('Network error'))
    }

    // 发送请求
    const body = data && typeof data === 'object' ? JSON.stringify(data) : data
    xhr.send(body)
  })
}

// 使用
ajax({
  method: 'POST',
  url: '/api/user',
  data: { name: 'test' },
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000
}).then(data => console.log(data))
  .catch(err => console.error(err))
```

**知识点：** `XMLHttpRequest` `Ajax` `Promise封装` `请求超时`

:::

### Q13: 手写 getUrlParams

> **⭐ 简单 · 字符串处理**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 方法1: 使用 URLSearchParams
function getUrlParams(url) {
  const search = url.includes('?') ? url.split('?')[1] : ''
  return Object.fromEntries(new URLSearchParams(search))
}

// 方法2: 正则解析
function getUrlParams2(url) {
  const params = {}
  const search = url.includes('?') ? url.split('?')[1] : url
  search.replace(/([^&=]+)=([^&=]*)/g, (_, key, value) => {
    params[decodeURIComponent(key)] = decodeURIComponent(value)
    return ''
  })
  return params
}

// 方法3: 手动解析（支持重复 key）
function getUrlParams3(url) {
  const params = {}
  const search = url.includes('?') ? url.split('#')[0].split('?')[1] : ''
  if (!search) return params

  search.split('&').forEach(pair => {
    const [key, value = ''] = pair.split('=')
    const decodedKey = decodeURIComponent(key)
    const decodedValue = decodeURIComponent(value)

    if (params[decodedKey]) {
      if (Array.isArray(params[decodedKey])) {
        params[decodedKey].push(decodedValue)
      } else {
        params[decodedKey] = [params[decodedKey], decodedValue]
      }
    } else {
      params[decodedKey] = decodedValue
    }
  })
  return params
}

// 测试
const url = 'https://example.com?name=张三&age=25&tags=a&tags=b'
console.log(getUrlParams3(url))
// { name: '张三', age: '25', tags: ['a', 'b'] }
```

**知识点：** `URLSearchParams` `URL解析` `decodeURIComponent` `重复参数`

:::

### Q14: 手写 reduce

> **🔥 中等 · 数组方法**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
Array.prototype.myReduce = function(callback, initialValue) {
  if (typeof callback !== 'function') {
    throw new TypeError(callback + ' is not a function')
  }

  const arr = this
  let acc = initialValue
  let startIndex = 0

  // 没有初始值时，取第一个元素作为初始值
  if (acc === undefined) {
    if (arr.length === 0) {
      throw new TypeError('Reduce of empty array with no initial value')
    }
    acc = arr[0]
    startIndex = 1
  }

  for (let i = startIndex; i < arr.length; i++) {
    if (i in arr) {  // 跳过稀疏数组的空位
      acc = callback(acc, arr[i], i, arr)
    }
  }

  return acc
}

// 测试
console.log([1, 2, 3].myReduce((sum, n) => sum + n, 0))       // 6
console.log([1, 2, 3].myReduce((sum, n) => sum + n))           // 6
console.log(['a','b','c'].myReduce((acc, s) => acc + s, ''))   // 'abc'
console.log([1,,3].myReduce((acc, n) => acc + n, 0))           // 4（跳过空位）

// 用 reduce 实现 map
Array.prototype.myMap = function(fn) {
  return this.myReduce((acc, item, i, arr) => {
    acc.push(fn(item, i, arr))
    return acc
  }, [])
}

// 用 reduce 实现 filter
Array.prototype.myFilter = function(fn) {
  return this.myReduce((acc, item, i, arr) => {
    if (fn(item, i, arr)) acc.push(item)
    return acc
  }, [])
}
```

**知识点：** `reduce` `数组方法实现` `稀疏数组` `reduce实现map/filter`

:::

### Q15: 手写模板引擎

> **💀 困难 · 手写代码**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 实现简单的模板引擎：支持 {{ var }} 和 {{ expression }}
function compile(template) {
  // 将模板转为可执行函数
  const code = template
    .replace(/<%=([\s\S]+?)%>/g, (_, expr) => `\`;__out+=${expr.trim()};__out+=\``)
    .replace(/<%([\s\S]+?)%>/g, (_, code) => `\`;${code.trim()};__out+=\``)
    .replace(/\{\{([\s\S]+?)\}\}/g, (_, expr) => `\`${expr.trim()}\``)

  // 或者简化版：只支持 {{ }}
  function simpleCompile(template) {
    const body = `
      with(obj) {
        return \`${template.replace(/\{\{(.+?)\}\}/g, '${'$'}{$1}')}\`
      }
    `
    return new Function('obj', body)
  }

  return simpleCompile(template)
}

// 使用
const tpl = '你好，{{ name }}！你今年 {{ age }} 岁了。'
const render = compile(tpl)
console.log(render({ name: '张三', age: 25 }))
// 你好，张三！你今年 25 岁了。

// 支持条件/循环的高级版本
function advancedCompile(template) {
  const tokens = []
  let lastIndex = 0
  const regex = /\{\{([\s\S]+?)\}\}/g
  let match

  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: template.slice(lastIndex, match.index) })
    }
    tokens.push({ type: 'expr', value: match[1].trim() })
    lastIndex = regex.lastIndex
  }
  if (lastIndex < template.length) {
    tokens.push({ type: 'text', value: template.slice(lastIndex) })
  }

  return function (data) {
    return tokens.map(token => {
      if (token.type === 'text') return token.value
      // 安全取值
      return new Function('obj', `with(obj){return ${token.value}}`)(data) ?? ''
    }).join('')
  }
}

const tpl2 = '{{ user.name }} 有 {{ items.length }} 件商品'
console.log(advancedCompile(tpl2)({
  user: { name: '李四' },
  items: [1, 2, 3]
}))
// 李四 有 3 件商品
```

**⚠️ 安全注意：** `with` + `new Function` 有 XSS 风险，生产环境应使用沙箱或 AST 解析。

**知识点：** `模板引擎` `正则替换` `new Function` `with语句` `编译`

:::
