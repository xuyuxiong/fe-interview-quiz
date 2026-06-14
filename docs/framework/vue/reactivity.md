---
title: Vue 响应式原理面试题
description: Vue 响应式原理深度解析，涵盖 Object.defineProperty、Proxy、依赖收集等 8 道核心面试题
---

# Vue 响应式原理面试题

> **📚 共 8 题 · 简单 30% · 中等 50% · 困难 20%**

---

### Q1: Vue 2 使用 Object.defineProperty 实现响应式有什么局限性？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Vue 2 响应式原理：**

```js
function defineReactive(obj, key, val) {
  const dep = new Dep()
  
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      if (Dep.target) {
        dep.depend()  // 收集依赖
      }
      return val
    },
    set(newVal) {
      if (newVal === val) return
      val = newVal
      dep.notify()  // 通知更新
    }
  })
}

// 递归处理对象
function observe(value) {
  if (typeof value !== 'object') return
  Object.keys(value).forEach(key => {
    defineReactive(value, key, value[key])
  })
}
```

**五大局限性：**

**1. 无法检测属性的添加：**

```js
const obj = { a: 1 }
observe(obj)

// ❌ 新增属性不会触发更新
obj.b = 2

// ✅ 需要使用 Vue.set
Vue.set(obj, 'b', 2)
this.$set(obj, 'b', 2)
```

**2. 无法检测属性的删除：**

```js
const obj = { a: 1, b: 2 }
observe(obj)

// ❌ 删除属性不会触发更新
delete obj.a

// ✅ 需要使用 Vue.delete
Vue.delete(obj, 'a')
this.$delete(obj, 'a')
```

**3. 无法检测数组索引的变化：**

```js
const arr = [1, 2, 3]
observe(arr)

// ❌ 通过索引设置不会触发更新
arr[0] = 100

// ✅ 需要使用变异方法
arr.splice(0, 1, 100)
```

**4. 无法检测数组长度的变化（特殊处理）：**

```js
// Vue 2 通过重写数组方法实现
const methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse']

const proto = Array.prototype
const arrayMethods = Object.create(proto)

methods.forEach(method => {
  arrayMethods[method] = function(...args) {
    const result = proto[method].apply(this, args)
    this.__ob__.dep.notify()  // 通知更新
    return result
  }
})
```

**5. 深度递归的性能开销：**

```js
// 嵌套对象需要递归
function defineReactive(obj, key, val) {
  observe(val)  // 子对象观察
}

// 深层对象：{ a: { b: { c: { d: ... } } } }
// 每层都需要递归创建 getter/setter
```

**Vue 2 响应式完整代码：**

```js
class Observer {
  constructor(value) {
    this.value = value
    this.dep = new Dep()
    
    if (Array.isArray(value)) {
      value.__proto__ = arrayMethods  // 重写数组方法
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
  
  walk(obj) {
    Object.keys(obj).forEach(key => {
      defineReactive(obj, key, obj[key])
    })
  }
  
  observeArray(items) {
    items.forEach(item => observe(item))
  }
}

function defineReactive(obj, key, val) {
  const dep = new Dep()
  const childOb = observe(val)
  
  Object.defineProperty(obj, key, {
    get() {
      if (Dep.target) {
        dep.depend()
        if (childOb) {
          childOb.dep.depend()
        }
      }
      return val
    },
    set(newVal) {
      if (newVal === val) return
      val = newVal
      observe(newVal)  // 递归观察新值
      dep.notify()
    }
  })
}
```

**知识点：** `Object.defineProperty` `Vue 2 响应式` `局限性`

:::

---

### Q2: Vue 3 使用 Proxy 实现了什么优势？有几点改进？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Vue 3 Proxy 响应式实现：**

```js
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      track(target, key)  // 收集依赖
      return res
    },
    set(target, key, value, receiver) {
      const oldVal = target[key]
      const res = Reflect.set(target, key, value, receiver)
      // 只有值真正变化才触发更新（注意 NaN !== NaN 的特殊情况）
      if (!Object.is(oldVal, value)) {
        trigger(target, key)  // 触发更新
      }
      return res
    },
    deleteProperty(target, key) {
      const res = Reflect.deleteProperty(target, key)
      trigger(target, key)
      return res
    }
  })
}
```

**五大优势：**

**1. 全属性监听：**

```js
const obj = reactive({ a: 1 })

// ✅ 新增属性自动响应式
obj.b = 2  // 自动追踪

// ✅ 删除属性自动通知
delete obj.a  // 自动触发更新
```

**2. 数组原生支持：**

```js
const arr = reactive([1, 2, 3])

// ✅ 索引修改自动追踪
arr[0] = 100  // 会自动触发更新

// ✅ 长度修改自动追踪
arr.push(4)
arr.length = 0
```

**3. 惰性转换：**

```js
// Vue 2: 递归所有属性
// Vue 3: 只有访问时才转为深层响应式
const obj = reactive({
  deep: {
    nested: {
      data: () => {
        // 只有访问时才会 reactive
      }
    }
  }
})
```

**4. 原生对象支持：**

```js
// 原生对象的各种操作都能拦截
const map = reactive(new Map())
map.set('key', 'value')  // 自动追踪

const set = reactive(new Set())
set.add('item')  // 自动追踪
```

**5. 可拦截的操作更多（13 种）：**

| 操作 | Proxy 拦截 | Object.defineProperty |
|------|------------|----------------------|
| get | ✅ | ✅ getter |
| set | ✅ | ✅ setter |
| has | ✅ | ❌ |
| deleteProperty | ✅ | ❌ |
| ownKeys | ✅ | ❌ |
| defineProperty | ✅ | ❌ |
| getPrototypeOf | ✅ | ❌ |
| setPrototypeOf | ✅ | ❌ |
| isExtensible | ✅ | ❌ |
| preventExtensions | ✅ | ❌ |
| getOwnPropertyDescriptor | ✅ | ❌ |
| apply | ✅ | ❌ |
| construct | ✅ | ❌ |

**完整 Proxy Handler 示例：**

```js
const handler = {
  get(target, key, receiver) {
    track(target, key)
    const res = Reflect.get(target, key, receiver)
    return isObject(res) ? reactive(res) : res
  },
  set(target, key, value, receiver) {
    const oldVal = target[key]
    const res = Reflect.set(target, key, value, receiver)
    if (oldVal !== value) {
      trigger(target, key)
    }
    return res
  },
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key)
    const res = Reflect.deleteProperty(target, key)
    if (hadKey && res) {
      trigger(target, key)
    }
    return res
  },
  has(target, key) {
    track(target, key)
    return hasOwn(target, key)
  },
  ownKeys(target) {
    track(target, 'iterator')
    return Reflect.ownKeys(target)
  }
}
```

**对比表格：**

| 特性 | Object.defineProperty | Proxy |
|------|----------------------|-------|
| 属性添加 | ❌ 无法检测 | ✅ 自动检测 |
| 属性删除 | ❌ 无法检测 | ✅ 自动检测 |
| 数组索引 | ❌ 无法检测 | ✅ 自动检测 |
| 数组长 | ❌ 特殊处理 | ✅ 自动检测 |
| 递归开销 | ✅ 需要递归 | ✅ 惰性 |
| 原生对象 | ❌ 不支持 | ✅ 支持 |

**知识点：** `Proxy` `Vue 3 响应式` `响应式原理`

:::

---

### Q3: 什么是依赖收集？Vue 是如何实现依赖收集的？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**依赖收集流程：**

```
响应式数据创建 → 读取数据时收集依赖 → 数据变化时触发更新
```

**核心概念：**

| 概念 | 作用 |
|------|------|
| ReactiveEffect | 副作用函数（渲染函数/计算属性） |
| deps | 存储当前 effect 的依赖 |
| targetMap | WeakMap 存储依赖关系 |

**依赖收集结构：**

```js
// WeakMap → Map → Set
// targetMap[reactive 对象][key] = Set<effect>

const targetMap = new WeakMap()

// 结构示例
// targetMap = {
//   [obj]: {
//     [key]: Set(effect1, effect2),
//     [key2]: Set(effect3)
//   }
// }
```

**核心代码实现：**

```js
// 当前激活的 effect
let activeEffect = null

// 依赖收集
function track(target, type, key) {
  if (!activeEffect) return
  
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  
  // 将当前 effect 加入依赖集合
  dep.add(activeEffect)
  
  // 反向追踪
  activeEffect.deps.push(dep)
}

// 触发更新
function trigger(target, type, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  const effectsToRun = new Set()
  const dep = depsMap.get(key)
  
  if (dep) {
    dep.forEach(effect => effectsToRun.add(effect))
  }
  
  effectsToRun.forEach(effect => effect.run())
}

// ReactiveEffect 类
class ReactiveEffect {
  constructor(fn) {
    this.fn = fn
    this.deps = []  // 收集 deps，用于 cleanup
  }
  
  run() {
    activeEffect = this  // 设为当前 effect
    return this.fn()     // 执行函数，触发 getter → track
  }
  
  stop() {
    // 清理依赖
    this.deps.forEach(dep => dep.delete(this))
  }
}
```

**实际使用示例：**

```vue
<script setup>
import { ref, effect } from 'vue'

const count = ref(0)

// 创建副作用（Vue 内部自动创建）
effect(() => {
  console.log('count:', count.value)  // 读取时收集依赖
  // DOM 更新...
})
// 此时 count 的 deps 中包含这个 effect

// 当 count 变化时
count.value++  // trigger 触发，执行所有收集的 effect
</script>
```

**WeakMap 的优势：**

```js
// 使用 WeakMap 而不是 Map
// 1. 防止内存泄漏 - 当响应式对象被回收时，WeakMap 的 key 也会被回收
// 2. 键名不可枚举 - 更安全

const obj = {}
const weakMap = new WeakMap()

weakMap.set(obj, 'value')
// obj 被垃圾回收后，weakMap 中的条目也会被回收

// 区别于 Map
const normalMap = new Map()
normalMap.set(obj, 'value')
// 即使 obj 被回收，normalMap 仍持有引用
```

**知识点：** `依赖收集` `targetMap` `effect`

:::

---

### Q4: ref 和 reactive 有什么区别？它们分别适用于什么场景？

> **⭐ 简单 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**ref：**

```vue
<script setup>
import { ref } from 'vue'

// 基本类型
const count = ref(0)
// count.value 访问

// 对象类型  
const user = ref({ name: 'John' })
// user.value.name 访问

// 在模板中自动解包
console.log(count.value)  // JS 中需要 .value
</script>

<template>
  <div>{{ count }}</div>  <!-- 模板中自动解包 -->
  <div>{{ user.name }}</div>  <!-- 自动解包一层 -->
</template>
```

**reactive：**

```vue
<script setup>
import { reactive } from 'vue'

const state = reactive({
  count: 0,
  user: { name: 'John', age: 20 }
})

// 直接访问，不需要 .value
console.log(state.count)
</script>

<template>
  <div>{{ state.count }}</div>
</template>
```

**core 区别：**

| 特性 | ref | reactive |
|------|-----|----------|
| 适用类型 | 任意类型 | 仅对象 |
| 访问方式 | .value | 直接访问 |
| 模板解包 | ✅ 自动 | ❌ 不自动 |
| 响应式代理 | ✅（对象时） | ✅ |
| 可替换性 | ✅ 可替换整个对象 | ❌ 不可替换 |

**场景对比：**

**使用 ref 的场景：**

```vue
<script setup>
import { ref, toRef } from 'vue'

// 1. 基本类型
const count = ref(0)
const name = ref('')
const active = ref(true)

// 2. 需要替换整个对象
const data = ref(null)
data.value = await fetchData()

// 3. 单独的对象属性
const user = reactive({ name: 'John' })
const nameRef = toRef(user, 'name')  // 响应式引用

// 4. DOM 元素引用
const inputRef = ref(null)
onMounted(() => inputRef.value.focus())
</script>
```

**使用 reactive 的场景：**

```vue
<script setup>
import { reactive } from 'vue'

// 1. 相关的状态组
const formState = reactive({
  name: '',
  email: '',
  age: 0
})

// 2. 复杂的对象状态
const tableState = reactive({
  data: [],
  loading: false,
  pagination: { page: 1, size: 20 },
  sort: { field: 'id', order: 'asc' }
})

// 3. 不需要替换整个对象
</script>
```

**注意事项：**

```vue
<script setup>
import { ref, reactive, toRefs } from 'vue'

// ❌ 错误：解构 reactive 会丢失响应性
const { count } = reactive({ count: 0 })
console.log(count)  // 不是响应式的

// ✅ 正确：使用 toRefs
const state = reactive({ count: 0 })
const { count } = toRefs(state)
console.log(count.value)  // 响应式的

// ❌ 错误：给 reactive 对象重新赋值
let state = reactive({ count: 0 })
state = reactive({ count: 1 })  // 丢失响应性！

// ✅ 正确：使用 ref
const state = ref({ count: 0 })
state.value = { count: 1 }  // OK
</script>
```

**API 设计建议：**

```js
// ✅ 良好的 API 设计 - 使用 ref
const useState = () => {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
}

// ❌ 不好的设计 - 使用 reactive
const useState = () => {
  return reactive({
    count: 0,
    increment() { this.count++ }  // this 指向问题
  })
}
</script>
```

**知识点：** `ref` `reactive` `使用场景`

:::

---

### Q5: computed 的惰性求值和缓存原理是什么？

> **💀 困难 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**computed 的实现原理：**

```js
class ComputedRefImpl {
  constructor(getter, setter) {
    this._getter = getter
    this._dirty = true  // 脏标记，表示需要重新计算
    
    // 创建一个 effect，但不立即执行
    this._effect = new ReactiveEffect(() => {
      this._value = getter()  // 真正计算
      this._dirty = false     // 计算完成，干净了
    })
  }
  
  get value() {
    // 1. 依赖收集
    track(this, 'get', 'value')
    
    // 2. 如果需要重新计算
    if (this._dirty) {
      this._dirty = false
      this._value = this._effect.run()
    }
    
    return this._value
  }
  
  // 当依赖变化时
  scheduler() {
    // 标记为脏，但不立即执行
    this._dirty = true
    
    // 触发依赖这个 computed 的 effect 更新
    trigger(this, 'set', 'value')
  }
}
```

**惰性求值：**

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)

// ✅ computed 不会立即执行
const doubled = computed(() => {
  console.log('计算中...')
  return count.value * 2
})
// 此时没有日志输出 - 惰性

// ✅ 访问时才计算
console.log(doubled.value)  
// 输出：计算中...
// 输出：0

// ❌ 依赖变化时也不会立即重新计算
count.value = 1
// 没有输出 - 只是标记为脏

// ✅ 再次访问时，因为脏标记重新计算
console.log(doubled.value)
// 输出：计算中...
// 输出：2
</script>
```

**缓存机制：**

```vue
<script setup>
import { ref, computed } from 'vue'

const count = ref(0)
const expensive = computed(() => {
  console.log('expensive computation')
  return heavyCalculation(count.value)
})

// 第一次访问
console.log(expensive.value)  // 计算并缓存
// 输出：expensive computation

// 第二次访问（count 未变）
console.log(expensive.value)  // 直接返回缓存
// 没有输出

// 依赖变化后
count.value = 1
// 只是标记为脏，不重新计算

// 再次访问
console.log(expensive.value)  // 重新计算
// 输出：expensive computation
</script>
```

**完整的 computed scheduler 流程：**

```
1. 创建 computed
   └─ dirty = true
   └─ 依赖的 ref 未收集这个 computed

2. 首次访问.value
   └─ track 收集依赖 (computed 收集 ref 的依赖)
   └─ 因为 dirty = true，执行 getter
   └─ dirty = false
   └─ 返回缓存的值

3. 依赖变化 (count++)
   └─ ref 的 setter 触发
   └─ trigger 通知所有 effect
   └─ computed 的 scheduler 执行
   └─ dirty = true  (标记为需要重新计算)

4. 再次访问.value
   └─ dirty = true
   └─ 重新执行 getter
   └─ 更新缓存
   └─ dirty = false
```

**可写的 computed：**

```vue
<script setup>
import { ref, computed } from 'vue'

const price = ref(100)
const discount = ref(0.9)

const finalPrice = computed({
  get() {
    return price.value * discount.value
  },
  set(value) {
    // 反向设置 price
    price.value = value / discount.value
  }
})

console.log(finalPrice.value)  // 90
finalPrice.value = 80          // 触发 setter
console.log(price.value)       // 88.88
</script>
```

**知识点：** `computed` `惰性求值` `缓存` `scheduler`

:::

---

### Q6: watch 和 watchEffect 有什么区别？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**watch 基础：**

```vue
<script setup>
import { ref, watch } from 'vue'

const count = ref(0)
const name = ref('')

// 1. 基础监听
watch(count, (newVal, oldVal) => {
  console.log('count changed', newVal, oldVal)
})

// 2. 监听多个值
watch([count, name], ([newCount, newName], [oldCount, oldName]) => {
  console.log('多个值变化')
})

// 3. 深度监听
const state = reactive({ a: { b: 1 } })
watch(state, (val) => {
  console.log('深度监听', val)
}, { deep: true })

// 4. 立即执行
watch(count, (val) => {
  console.log('立即执行', val)
}, { immediate: true })
</script>
```

**watchEffect 基础：**

```vue
<script setup>
import { ref, watchEffect } from 'vue'

const count = ref(0)

// 自动收集依赖
watchEffect(() => {
  console.log('当前值:', count.value)
  // 依赖 count
})

// 等价于
watch(count, (count) => {
  console.log('当前值:', count)
}, { immediate: true })
</script>
```

**core 区别：**

| 特性 | watch | watchEffect |
|------|-------|-------------|
| 指定数据源 | ✅ 必须 | ❌ 自动 |
| 访问旧值 | ✅ new, old | ❌ 只有新值 |
| 惰性执行 | ✅ 执行一次后等待变化 | ❌ 立即执行 |
| 返回值收集 | ❌ 忽略 | ✅ 用于 infinite watch |
| flush 默认值 | post | pre |

**使用场景对比：**

**使用 watch 的场景：**

```vue
<script setup>
import { ref, watch } from 'vue'

// 1. 只需要特定数据变化时执行
const count = ref(0)
watch(count, () => {
  // 只关心 count 的变化
})

// 2. 需要旧值
watch(value, (newVal, oldVal) => {
  console.log('从', oldVal, '变为', newVal)
})

// 3. 不响应式的数据
let nonReactive = ''
watch(artifact, (val) => {
  console.log(nonReactive)  // 不关心响应性
})

// 4. 需要精确控制
watch(getter, (val) => {
  // 只有 getter 变化时才执行
}, { flush: 'sync', deep: true })
</script>
```

**使用 watchEffect 的场景：**

```vue
<script setup>
import { ref, watchEffect } from 'vue'

// 1. 懒加载数据
const data = ref(null)
watchEffect(async (onCleanup) => {
  const controller = new AbortController()
  onCleanup(() => controller.abort())
  
  data.value = await fetch(url, { signal: controller.signal })
})

// 2. 多个依赖自动追踪
const firstName = ref('')
const lastName = ref('')
watchEffect(() => {
  // 自动追踪 firstName 和 lastName
  console.log('Full name:', firstName.value, lastName.value)
})

// 3. DOM 操作
watchEffect(() => {
  // 在 DOM 更新前执行
  updateChart(data.value)
})
</script>
```

**flush 选项详解：**

```vue
<script setup>
import { ref, watch, watchEffect } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)

// watch 默认 flush: 'post' (DOM 更新后)
watch(count, () => {
  // DOM 已更新
  console.log(count.value, document.querySelector('#count'))
})

// watchEffect 默认 flush: 'pre' (DOM 更新前)
watchEffect(() => {
  // 这里修改 DOM 可能会在下一个 tick 被覆盖
  console.log('pre')
})

// 修改 watchEffect 的 flush
watchEffect(() => {
  // 在 DOM 更新后执行
  console.log('post')
}, { flush: 'post' })

// 同步执行（响应式数据变化时立即执行）
watch(count, () => {
  // 响应式数据变化时立即执行，不等待 DOM 更新
}, { flush: 'sync' })
</script>
```

**知识点：** `watch` `watchEffect` `flush`

:::

---

### Q7: 什么是 effect 和调度器？它们是如何工作的？

> **💀 困难 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**ReactiveEffect 实现：**

```js
class ReactiveEffect {
  constructor(fn, scheduler = null) {
    this.fn = fn         // 副作用函数
    this.scheduler = scheduler  // 调度器
    this.active = true
    this.deps = []       // 依赖 collection
  }
  
  run() {
    if (!this.active) {
      return this.fn()
    }
    
    // 设为当前激活的 effect
    activeEffect = this
    pushEffectStack(this)
    
    try {
      return this.fn()
    } finally {
      popEffectStack()
      activeEffect = this.deps[0]  // 恢复
    }
  }
  
  stop() {
    if (this.active) {
      cleanupEffect(this)
      this.active = false
    }
  }
}

// 收集依赖
function track(target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  
  if (activeEffect) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}

// 触发更新
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  
  const dep = depsMap.get(key)
  const effectsToRun = new Set()
  
  dep.forEach(effect => {
    if (effect !== activeEffect) {
      effectsToRun.add(effect)
    }
  })
  
  effectsToRun.forEach(effect => {
    if (effect.scheduler) {
      effect.scheduler()  // 使用调度器
    } else {
      effect.run()  // 直接执行
    }
  })
}
```

**调度器的作用：**

```vue
<script setup>
import { ref, effect, ReactiveEffect } from 'vue'

const count = ref(0)
const jobs = []

// 自定义调度器 - 批量处理更新
const jobEffect = new ReactiveEffect(() => {
  console.log('effect 执行中...')
  // DOM 更新等副作用
}, function scheduler(effect) {
  jobs.push(effect)
  Promise.resolve().then(() => {
    jobs.forEach(job => job.run())
    jobs.length = 0
  })
})

jobEffect.run()

count.value++  // 不会立即执行，加入队列
count.value++  // 加入队列
// Promise.then: 批量执行一次
</script>
```

**Vue 内部的调度器：**

```js
// Vue 3 内部实现
let activeEffectScope = null

function effect(fn, options = {}) {
  const _effect = new ReactiveEffect(fn)
  
  if (options.scheduler) {
    _effect.scheduler = options.scheduler
  }
  
  _effect.run()
  
  const runner = _effect.run.bind(_effect)
  runner.effect = _effect
  
  return runner
}

// computed 使用调度器
const computed = (getter) => {
  let _value
  let _dirty = true
  
  const runner = effect(getter, {
    lazy: true,
    scheduler: () => {
      _dirty = true  // 标记为脏，重新计算
      trigger(computedRef, 'set', 'value')  // 触发依赖更新
    }
  })
  
  return {
    get value() {
      if (_dirty) {
        _value = runner()
        _dirty = false
      }
      track(computedRef, 'get', 'value')
      return _value
    },
    set value(newValue) {
      // ...
    }
  }
}
```

**应用场景：**

```vue
<script setup>
import { ref, watch } from 'vue'

// 1. 批量更新 (watch 内部使用调度器)
const queue = []
let isFlushing = false

function scheduler(effect) {
  queue.push(effect)
  if (!isFlushing) {
    isFlushing = true
    Promise.resolve().then(() => {
      queue.forEach(job => job())
      queue.length = 0
      isFlushing = false
    })
  }
}

// 2. 组件更新调度
// 组件更新使用调度器协调更新顺序
// 1. 父组件先更新
// 2. 子组件后更新（保证父组件 props 已更新）
</script>
```

**知识点：** `effect` `调度器` `ReactiveEffect`

:::

---

### Q8: shallowRef 和 shallowReactive 有哪些使用场景？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**core 概念：**

- `shallowRef`：只追踪 `.value` 的变化，不深度转换
- `shallowReactive`：只追踪第一层属性的变化

**shallowRef 实现：**

```js
function shallowRef(value) {
  return {
    __v_isShallow: true,
    __v_isRef: true,
    get value() {
      track(this, 'get', 'value')
      return value
    },
    set value(newValue) {
      if (value !== newValue) {
        value = newValue
        trigger(this, 'set', 'value')
      }
    }
  }
}

// 对比 ref
function ref(value) {
  // 会递归转换对象
}

// shallowRef 不会递归转换
const src = shallowRef({ a: { b: 1 } })
src.value.a = { b: 2 }
src.value.a.b = 3  // ❌ 不会触发更新

// 替换整个对象会触发
src.value = { a: { b: 1 } }  // ✅ 会触发更新
```

**shallowReactive 实现：**

```js
function shallowReactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key)
      const res = Reflect.get(target, key, receiver)
      return res  // 不递归响应式
    },
    set(target, key, value, receiver) {
      const oldVal = target[key]
      const res = Reflect.set(target, key, value, receiver)
      trigger(target, key)
      return res
    }
  })
}
```

**使用场景 1：大型只读对象：**

```vue
<script setup>
import { shallowRef, triggerRef, toRaw, shallowReactive } from 'vue'

// 场景：大型配置对象，很少变化
const config = shallowRef({
  theme: 'dark',
  language: 'zh',
  // ... 大量嵌套属性
})

// 直接修改内部属性不会触发更新
config.value.theme = 'light'  // ❌ 不触发

// 需要主动触发
config.value = { ...raw(config.value), theme: 'light' }  // ✅ 触发
// 或
triggerRef(config)  // 手动触发依赖
</script>
```

**使用场景 2：表单数据（频繁修改，只在提交时响应）：**

```vue
<script setup>
import { shallowReactive, toRefs } from 'vue'

// 大型表单，只在提交时校验
const formData = shallowReactive({
  name: '',
  email: '',
  phone: '',
  address: { province: '', city: '', detail: '' },
  // ... 更多字段
})

// 直接修改不触发更新（性能好）
formData.name = 'John'

// 提交时
const submit = () => {
  // 手动创建响应式副本进行校验
  const reactiveData = reactive({ ...formData })
  // 校验...
}
</script>
```

**使用场景 3：第三方库集成：**

```vue
<script setup>
import { shallowRef, onUnmounted } from 'vue'
import Editor from 'rich-editor'

// 第三方编辑器实例
const editorRef = shallowRef(null)

onMounted(() => {
  editorRef.value = new Editor('#editor')
})

// 不需要追踪编辑器内部的属性变化
// 只需要替换编辑器实例时响应
</script>
```

**使用场景 4：性能敏感的列表：**

```vue
<script setup>
import { shallowRef, triggerRef } from 'vue'

// 大型列表，只关心整体替换
const list = shallowRef([])

// 添加单个元素（不触发）
list.value.push({ id: 1, name: 'Item' })

// 需要手动触发
triggerRef(list)

// 替换整个列表（触发）
list.value = newList
</script>
```

**triggerRef 和 shallowReadonly：**

```vue
<script setup>
import { shallowRef, triggerRef, shallowReadonly } from 'vue'

// shallowRef + triggerRef
const data = shallowRef({ a: 1 })
data.value.a = 2
triggerRef(data)  // 手动触发

// shallowReadonly - 只读 shallow
const readonlyData = shallowReadonly({ a: { b: 1 } })
// readonlyData.a = 2  // ❌ 运行时报错

// 但内部属性仍可修改
readonlyData.a.b = 2  // ✅ 允许
</script>
```

**对比表格：**

| API | 第一层 | 深层属性 | 适用场景 |
|-----|--------|----------|----------|
| ref | ✅ 响应式 | ✅ 响应式 | 通用 |
| shallowRef | ✅ 响应式 | ❌ 非响应式 | 性能优化 |
| reactive | ✅ 响应式 | ✅ 响应式 | 对象通用 |
| shallowReactive | ✅ 响应式 | ❌ 非响应式 | 性能优化 |

**知识点：** `shallowRef` `shallowReactive` `性能优化`

:::

---

## 总结

| 知识点 | 重要度 | 面试频率 |
|--------|--------|----------|
| Object.defineProperty vs Proxy | 🔥🔥🔥 | 🔥🔥🔥 |
| 依赖收集原理 | 🔥🔥🔥 | 🔥🔥🔥 |
| ref vs reactive | 🔥🔥 | 🔥🔥🔥 |
| computed 缓存 | 🔥🔥 | 🔥🔥 |
| watch vs watchEffect | 🔥🔥 | 🔥🔥 |
| effect scheduler | 🔥🔥 | 🔥 |
| shallow 系列 | 🔥 | 🔥 |

**面试建议：**

- 理解/Vue 2 和 Vue 3 响应式的核心区别
- 能手写简化的响应式实现
- 了解 computed 缓存和 lazy 执行机制
- 掌握 shallowRef 的使用场景

---
### Q9: Vue 3 中为什么不需要 Fiber？

> **🔥 中等 · Vue**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**React 需要 Fiber 的原因：** React 的更新是"从根节点开始递归遍历整棵树"，不可中断，会长时间占用主线程。Fiber 将递归改为可中断的链表遍历。

**Vue 3 不需要 Fiber 的原因：**

**1. 响应式系统精确更新**

```js
// React: setState → 从根组件开始递归 diff
// 不知道哪些组件受影响，必须全部遍历
setState({ count: 1 }) // Root → App → Counter → ?

// Vue 3: 依赖收集 → 精确知道哪些组件需要更新
const count = ref(0)
count.value++ // 只通知依赖 count 的组件更新
// 依赖图: count → Counter 组件 → 直接更新
```

**2. 组件级更新粒度**

```text
React 更新粒度:  整棵 Fiber Tree（可能很大）
Vue 3 更新粒度:  单个组件（精确到组件）

React: root → App → Header → Counter → Button → ...
Vue 3: Counter 组件（直接定位）
```

**3. 编译时优化**

```vue
<!-- Vue 模板编译时标记了静态节点 -->
<div>
  <p class="static">静态文本</p>  <!-- block 标记，跳过 diff -->
  <span>{{ dynamic }}</span>       <!-- 只有这个需要更新 -->
</div>
```

```js
// Vue 3 编译优化
// 1. 静态提升：静态节点只创建一次
// 2. PatchFlag：标记动态节点类型
// 3. Block Tree：减少 diff 范围
// 4. 缓存事件处理器：避免重复创建
```

**4. 不需要时间切片**

```text
React 问题: 递归 diff 大树 → 长任务 → 卡帧 → 需要时间切片
Vue 3 方案: 精确定位更新 → 组件级任务很短 → 不需要切片

Vue 3 的组件更新通常在 1ms 内完成
React 的大组件树 diff 可能需要 10ms+
```

| 维度 | React + Fiber | Vue 3 |
|------|--------------|-------|
| 更新触发 | diff 整棵树 | 响应式精确触发 |
| 更新粒度 | 节点级 | 组件级 |
| 中断能力 | 可中断(Fiber) | 不需要中断 |
| 调度器 | Scheduler | 微任务队列(nextTick) |
| 编译优化 | 无 | 静态提升 + PatchFlag |

**知识点：** `Vue3` `Fiber` `响应式` `组件级更新` `编译优化` `PatchFlag`

:::
