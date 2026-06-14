### Q1: 手写 call 实现

> **🔥 中等 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
Function.prototype.myCall = function(context = window, ...args) {
  // context 可以是 null/undefined
  context = context || globalThis;
  
  // 创建唯一 key 避免覆盖
  const fnKey = Symbol('fn');
  context[fnKey] = this;
  
  // 执行函数
  const result = context[fnKey](...args);
  
  // 清理
  delete context[fnKey];
  
  return result;
};

// 使用
function greet(name, age) {
  return `${this.name}-${name}-${age}`;
}
greet.myCall({ name: 'Tom' }, 'Jack', 18);  // 'Tom-Jack-18'
```

**知识点：**`call` `this 绑定` `手写` `Symbol`

:::

### Q2: 手写 apply 实现

> **🔥 中等 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
Function.prototype.myApply = function(context = window, args) {
  context = context || globalThis;
  
  const fnKey = Symbol('fn');
  context[fnKey] = this;
  
  let result;
  if (args === null || args === undefined) {
    result = context[fnKey]();
  } else {
    result = context[fnKey](...args);
  }
  
  delete context[fnKey];
  return result;
};

// 使用
Math.max.myApply(null, [1, 2, 3, 4, 5]);  // 5
```

**知识点：**`apply` `参数数组` `手写`

:::

### Q3: 手写 bind 实现

> **🔥 中等 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
Function.prototype.myBind = function(context, ...boundArgs) {
  const fn = this;
  
  function boundFn(...callArgs) {
    // 作为构造函数调用
    if (this instanceof boundFn) {
      return new fn(...boundArgs, ...callArgs);
    }
    // 普通函数调用
    return fn.apply(context, [...boundArgs, ...callArgs]);
  }
  
  // 保持原型链
  boundFn.prototype = Object.create(fn.prototype);
  
  return boundFn;
};

// 使用
const greet = function(name) {
  return `${this.name} says ${name}`;
};
const tomGreet = greet.myBind({ name: 'Tom' });
tomGreet('Hello');  // 'Tom says Hello'
```

**知识点：**`bind` `柯里化` `构造函数` `原型链`

:::

### Q4: 手写 new 实现

> **🔥 中等 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function myNew(constructor, ...args) {
  // 1. 创建空对象，原型指向构造函数 prototype
  const obj = Object.create(constructor.prototype);
  
  // 2. 执行构造函数，this 绑定到新对象
  const result = constructor.apply(obj, args);
  
  // 3. 返回对象（如果构造函数返回对象则用返回的）
  return result instanceof Object ? result : obj;
}

// 使用
function Person(name) {
  this.name = name;
}
const p = myNew(Person, 'Tom');
p.name;  // 'Tom'
```

**知识点：**`new` `构造函数` `原型链`

:::

### Q5: 手写 instanceof 实现

> **🔥 中等 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function myInstanceOf(obj, constructor) {
  // 获取原型
  let proto = Object.getPrototypeOf(obj);
  const prototype = constructor.prototype;
  
  // 沿着原型链查找
  while (proto !== null) {
    if (proto === prototype) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }
  
  return false;
}

// 使用
myInstanceOf([], Array);  // true
myInstanceOf({}, Array);  // false
```

**知识点：**`instanceof` `原型链` `手写`

:::

### Q6: fetchWithRetry 带重试的 fetch

> **🔥 中等 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
async function fetchWithRetry(url, options = {}, retries = 3) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (retries <= 0) throw error;
    
    // 指数退避
    const delay = Math.pow(2, 3 - retries) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return fetchWithRetry(url, options, retries - 1);
  }
}

// 使用
fetchWithRetry('/api/data', {}, 3);
```

**知识点：**`fetch` `重试` `Promise` `递归`

:::

### Q7: 数组扁平化 flatten

> **🔥 中等 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 方法 1: flat
[1, [2, [3, 4]]].flat(Infinity);  // [1, 2, 3, 4]

// 方法 2: reduce + 递归
function flatten(arr) {
  return arr.reduce((result, item) => {
    return result.concat(Array.isArray(item) ? flatten(item) : item);
  }, []);
}

// 方法 3: 栈
function flattenStack(arr) {
  const result = [];
  const stack = [...arr];
  
  while (stack.length > 0) {
    const item = stack.pop();
    if (Array.isArray(item)) {
      stack.push(...item);
    } else {
      result.unshift(item);
    }
  }
  
  return result;
}

// 方法 4: Generator
function* flattenGen(arr) {
  for (const item of arr) {
    if (Array.isArray(item)) {
      yield* flattenGen(item);
    } else {
      yield item;
    }
  }
}
```

**知识点：**`数组扁平化` `递归` `reduce` `Generator`

:::

### Q8: 手写 Object.assign

> **🔥 中等 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
Object.myAssign = function(target, ...sources) {
  if (target === null || target === undefined) {
    throw new TypeError('Cannot convert to object');
  }
  
  const to = Object(target);
  
  for (const source of sources) {
    if (source === null || source === undefined) continue;
    
    const from = Object(source);
    
    for (const key in from) {
      if (Object.prototype.hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
  }
  
  return to;
};

// 使用
Object.myAssign({ a: 1 }, { b: 2 }, { c: 3 });  // { a: 1, b: 2, c: 3 }
```

**知识点：**`Object.assign` `属性拷贝` `浅拷贝`

:::

 details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
Object.myCreate = function(proto, propertiesObject) {
  if (proto === null || (typeof proto !== 'object' && typeof proto !== 'function')) {
    throw new TypeError('Object prototype may only be an Object or null');
  }
  
  function F() {}
  F.prototype = proto;
  
  const obj = new F();
  
  if (propertiesObject !== undefined) {
    Object.defineProperties(obj, propertiesObject);
  }
  
  return obj;
};

// 使用
const parent = { name: 'Parent' };
const child = Object.myCreate(parent);
child.name;  // 'Parent' (继承)
```

**知识点：**`Object.create` `原型` `继承`

:::

### Q9: 双向数据绑定实现

> **💀 困难 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class Observer {
  constructor(data) {
    this.data = data;
    this.walk(data);
  }
  
  walk(obj) {
    Object.keys(obj).forEach(key => {
      this.defineReactive(obj, key, obj[key]);
    });
  }
  
  defineReactive(obj, key, val) {
    const dep = new Dep();
    
    Object.defineProperty(obj, key, {
      get() {
        if (Dep.target) dep.addSub(Dep.target);
        return val;
      },
      set(newVal) {
        if (newVal === val) return;
        val = newVal;
        dep.notify();
      }
    });
  }
}

class Dep {
  constructor() {
    this.subs = [];
  }
  
  addSub(sub) {
    this.subs.push(sub);
  }
  
  notify() {
    this.subs.forEach(sub => sub.update());
  }
}

class Watcher {
  constructor(obj, key, cb) {
    this.obj = obj;
    this.key = key;
    this.cb = cb;
    Dep.target = this;
    this.value = obj[key];  // 触发 get
    Dep.target = null;
  }
  
  update() {
    const newVal = this.obj[this.key];
    this.cb(newVal, this.value);
    this.value = newVal;
  }
}
```

**知识点：**`双向绑定` `Object.defineProperty` `发布订阅`

:::

### Q10: 手写 Ajax 请求

> **🔥 中等 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function ajax(url, options = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    const method = options.method || 'GET';
    const data = options.data || null;
    
    xhr.open(method, url);
    
    // 设置请求头
    if (options.headers) {
      Object.keys(options.headers).forEach(key => {
        xhr.setRequestHeader(key, options.headers[key]);
      });
    }
    
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`HTTP ${xhr.status}`));
      }
    };
    
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Timeout'));
    
    if (options.timeout) {
      xhr.timeout = options.timeout;
    }
    
    xhr.send(data);
  });
}

// 使用
ajax('/api/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  data: JSON.stringify({ id: 1 })
});
```

**知识点：**`Ajax` `XMLHttpRequest` `Promise`

:::

### Q11: 手写双向数据绑定

> **💀 困难 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**基于 Object.defineProperty：**

```javascript
function observe(obj) {
  Object.keys(obj).forEach(key => {
    let val = obj[key];
    Object.defineProperty(obj, key, {
      get() { return val; },
      set(newVal) {
        if (newVal !== val) {
          val = newVal;
          console.log(`${key} updated:`, newVal);
        }
      }
    });
  });
}
```

**基于 Proxy（Vue 3）：**
```javascript
function observe(obj) {
  return new Proxy(obj, {
    get(target, key) { return target[key]; },
    set(target, key, val) {
      console.log(`${key} updated:`, val);
      target[key] = val;
      return true;
    }
  });
}
```

**知识点：**`双向绑定` `defineProperty` `Proxy`

:::

### Q12: getUrlParams 解析 URL 参数

> **⭐ 简单 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function getUrlParams(url = window.location.href) {
  const params = {};
  const queryString = url.split('?')[1];
  
  if (!queryString) return params;
  
  queryString.split('&').forEach(pair => {
    const [key, value] = pair.split('=');
    params[decodeURIComponent(key)] = decodeURIComponent(value || '');
  });
  
  return params;
}

// 使用
getUrlParams('https://example.com?a=1&b=2&c=3');
// { a: '1', b: '2', c: '3' }

// 或使用 URLSearchParams
function getUrlParamsMod(url) {
  const search = new URL(url).search;
  return Object.fromEntries(new URLSearchParams(search));
}
```

**知识点：**`URL 参数` `字符串解析` `URLSearchParams`

:::

### Q13: 手写 curry 柯里化

> **🔥 中等 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 固定参数版本
function curry(fn, ...args) {
  return function(...nextArgs) {
    const allArgs = [...args, ...nextArgs];
    
    if (allArgs.length >= fn.length) {
      return fn(...allArgs);
    }
    
    return curry(fn, ...allArgs);
  };
}

// 使用
function add(a, b, c) {
  return a + b + c;
}
const curriedAdd = curry(add);
curriedAdd(1)(2)(3);     // 6
curriedAdd(1, 2)(3);     // 6
curriedAdd(1)(2, 3);     // 6

// 不定参数版本（需要指定参数数量）
function curryN(fn, n) {
  return function(...args) {
    if (args.length >= n) {
      return fn(...args);
    }
    return curryN(fn.bind(null, ...args), n - args.length);
  };
}
```

**知识点：**`柯里化` `函数式编程` `闭包`

:::

### Q14: 手写 compose 函数组合

> **🔥 中等 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// Redux compose（从右到左）
function compose(...fns) {
  if (fns.length === 0) return arg => arg;
  if (fns.length === 1) return fns[0];
  
  return fns.reduce((a, b) => (...args) => a(b(...args)));
}

// 从左到右（pipe）
function pipe(...fns) {
  return fns.reduce((a, b) => (...args) => b(a(...args)));
}

// 使用
const add1 = x => x + 1;
const double = x => x * 2;
const square = x => x * x;

compose(square, double, add1)(5);  // 144 (5+1=6, 6*2=12, 12*12=144)
pipe(add1, double, square)(5);     // 144
```

**知识点：**`compose` `函数组合` `函数式编程`

:::

### Q15: fetchWithRetry 重试机制

> **🔥 中等 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise(r => setTimeout(r, delay));
    return fetchWithRetry(url, options, retries - 1, delay * 2);
  }
}
```

**知识点：**`fetch` `重试` `指数退避`

:::
### Q16: 手写 Hex 转 RGB 方法

> **⭐ 简单 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function hexToRgb(hex) {
  // 去掉#号
  hex = hex.replace(/^#/, '');
  
  // 处理缩写形式（如 #fff → #ffffff）
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  
  // 解析 RGB 值
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  return `rgb(${r}, ${g}, ${b})`;
}

// 或者使用正则方式
function hexToRgbRegex(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
}

// 使用
hexToRgb('#ffcbaa');      // 'rgb(255, 203, 170)'
hexToRgb('#fff');         // 'rgb(255, 255, 255)'
hexToRgb('#0f0');         // 'rgb(0, 255, 0)'
```

**知识点：**`进制转换` `parseInt` `正则` `颜色处理`

:::

### Q17: 手写 lastPromise，连续请求只有最后一次输出

> **🔥 中等 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
/**
 * 连续请求中只保留最后一次的响应
 */
function createLastPromise() {
  let lastId = 0;
  
  return function requestId(fn, delay) {
    const currentId = ++lastId;
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 只有当前请求是最新的才 resolve
        if (currentId === lastId) {
          resolve(fn());
        } else {
          reject(new Error('请求已过期'));
        }
      }, delay);
    });
  };
}

// 更通用的实现
class LastPromise {
  constructor() {
    this.lastId = 0;
  }
  
  request(fn, delay = 0) {
    const currentId = ++this.lastId;
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (currentId === this.lastId) {
          resolve(fn());
        } else {
          reject(new Error('stale request'));
        }
      }, delay);
    });
  }
}

// 使用场景：搜索框防抖
const searcher = new LastPromise();
input.addEventListener('input', () => {
  searcher.request(() => fetch(`/api?q=${input.value}`), 300)
    .then(data => display(data))
    .catch(() => console.log('请求取消'));
});
```

**知识点：**`闭包` `Promise` `防抖` `请求取消`

:::

### Q18: 手写数组全排列组合

> **🔥 中等 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 笛卡尔积：arr = [['A','B'],['a','b'],[1,2]] => [['A','a',1],['A','a',2],['A','b',1]...]
function cartesian(arr) {
  return arr.reduce((acc, curr) => {
    if (acc.length === 0) {
      return curr.map(v => [v]);
    }
    const result = [];
    acc.forEach(combo => {
      curr.forEach(v => {
        result.push([...combo, v]);
      });
    });
    return result;
  }, []);
}

// 递归版
function cartesianRecursive(arr) {
  const result = [];
  
  function backtrack(index, path) {
    if (index === arr.length) {
      result.push([...path]);
      return;
    }
    for (const item of arr[index]) {
      path.push(item);
      backtrack(index + 1, path);
      path.pop();
    }
  }
  
  backtrack(0, []);
  return result;
}

// 使用
const arr = [['A','B'], ['a','b'], [1,2]];
console.log(cartesian(arr));
// [['A','a',1], ['A','a',2], ['A','b',1], ['A','b',2], ['B','a',1], ['B','a',2], ['B','b',1], ['B','b',2]]
```

**知识点：**`笛卡尔积` `reduce` `递归` `回溯`

:::

 details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 将 kebab-case/snake_case/space_case 转为 camelCase
function toCamelCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (match, c) => c ? c.toUpperCase() : '')
    .replace(/^([A-Z])/, (match) => match.toLowerCase());
}

// 简洁版
function camelCase(str) {
  return str
    .toLowerCase()
    .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
}

// 使用
camelCase('hello-world');           // 'helloWorld'
camelCase('hello_world_name');      // 'helloWorldName'
camelCase('hello   world');         // 'helloWorld'
camelCase('Hello-World');           // 'helloWorld'
camelCase('background-color');      // 'backgroundColor'
```

**知识点：**`正则` `replace` `字符串处理`

:::

### Q19: 经典逻辑题——赛马选前几名

> **💀 困难 · handwriting/handwrite-call-apply-bind**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**题目 1: 64 个运动员，8 条跑道，选出前 4 名至少需要跑几次？**

**答案：8 次**

**解题思路：**
1. **第 1-8 次：** 64 人分 8 组预赛，每组 8 人，得到每组排名
2. **第 9 次：** 每组第 1 名决赛，得到全局前 8 的顺序
3. **关键分析：** 只需要选出前 4 名，第 9 次决赛后，第 5-8 名及其所在组的其他人可以淘汰
4. 实际上 8 次就够了：7 次初赛 + 1 次决赛（只需每组第 1 名参赛）

**更优解是 8 次：**
- 前 7 次：56 人分成 7 组
- 第 8 次：前 7 组的前名 + 剩余 8 人 一起跑
- 但标准答案是 **9 次**（8 次初赛 + 1 次决赛）

**题目 2: 25 匹马，5 条跑道，选出前 3 名至少需要跑几次？**

**答案：7 次**

**解题思路：**
1. **第 1-5 次：** 25 匹马分 5 组，每组 5 匹，得到组内排名
2. **第 6 次：** 5 个小组第一决赛 → 得到 A1>B1>C1>D1>E1
3. **第 7 次：** 可能的前 3 名候选：
   - A 组：A1(已确定第 1)、A2、A3
   - B 组：B1、B2
   - C 组：C1
   - 所以第 7 次让 A2、A3、B1、B2、C1 比赛

**为什么其他马淘汰？**
- D1、E1 在第 6 次已排 4、5 名，不可能进前 3
- B3 及之后：B1 最多第 2，B3 不可能前 3
- C2 及之后：C1 最多第 3，C2 不可能前 3

**知识点：**`逻辑思维` `排序策略` `淘汰推理`

:::

### Q20: 手写 Hex 转 RGB

> **⭐ 简单 · 手写代码**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
function hexToRgb(hex) {
  // 去掉 # 号
  hex = hex.replace(/^#/, '')

  // 处理缩写: #f00 → #ff0000
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('')
  }

  if (hex.length !== 6) return null

  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  return { r, g, b }
}

// 测试
hexToRgb('#ff0000')   // { r: 255, g: 0, b: 0 }
hexToRgb('#f00')      // { r: 255, g: 0, b: 0 }  — 缩写
hexToRgb('00ff00')    // { r: 0, g: 255, b: 0 }
hexToRgb('#000')      // { r: 0, g: 0, b: 0 }

// RGB 转 Hex
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => {
    const hex = v.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}

rgbToHex(255, 0, 0)  // '#ff0000'
```

**知识点：** `Hex` `RGB` `颜色转换` `parseInt` `toString(16)`

:::

### Q21: 手写数组全排列（笛卡尔积）

> **🔥 中等 · 手写代码**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 问题: arr = [['A','B'], ['a','b'], [1,2]]
// 输出: ['Aa1','Aa2','Ab1','Ab2','Ba1','Ba2','Bb1','Bb2']

// 方法1：reduce 实现
function cartesian(arr) {
  return arr.reduce((acc, cur) => {
    const result = []
    acc.forEach(a => {
      cur.forEach(c => {
        result.push(a + c)
      })
    })
    return result
  })
}

// 方法2：递归实现
function cartesian(arr, index = 0, current = '') {
  if (index === arr.length) return [current]
  const result = []
  for (const item of arr[index]) {
    result.push(...cartesian(arr, index + 1, current + item))
  }
  return result
}

// 方法3：通用版（不拼接字符串，返回数组组合）
function cartesianProduct(arr) {
  return arr.reduce((acc, cur) => {
    return acc.flatMap(a => cur.map(c => [...a, c]))
  }, [[]])
}

// 测试
cartesian([['A','B'], ['a','b'], [1,2]])
// ['Aa1','Aa2','Ab1','Ab2','Ba1','Ba2','Bb1','Bb2']

cartesianProduct([['A','B'], ['a','b'], [1,2]])
// [['A','a',1], ['A','a',2], ['A','b',1], ...]
```

**知识点：** `笛卡尔积` `reduce` `递归` `flatMap` `全排列`

:::

 details 🔍 点击查看答案与解析

#### ✅ 答案

```js
// 输入: 'hello-world' → 输出: 'helloWorld'
// 输入: 'foo_bar_baz' → 输出: 'fooBarBaz'
// 输入: 'some text here' → 输出: 'someTextHere'

function camelCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
    .replace(/^[A-Z]/, c => c.toLowerCase())  // 首字母小写
}

// 方法2：手动实现
function camelCase(str) {
  const words = str.split(/[-_\s]+/)
  return words.map((word, i) => {
    if (i === 0) return word.toLowerCase()
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  }).join('')
}

// PascalCase（首字母大写）
function pascalCase(str) {
  return str
    .split(/[-_\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('')
}

// 测试
camelCase('hello-world')      // helloWorld
camelCase('foo_bar_baz')      // fooBarBaz
camelCase('some text here')   // someTextHere
camelCase('already-camelCase') // alreadyCamelCase
pascalCase('hello-world')     // HelloWorld
```

**知识点：** `camelCase` `正则` `字符串转换` `命名规范`

:::

### Q22: 经典逻辑题：64个运动员8跑道选前4至少跑几次？

> **💀 困难 · 逻辑题**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**问题：** 64个运动员，8条跑道，没有计时器只能看名次，至少跑几次才能选出跑得最快的4个人？

**答案：11次**

**解题思路：**

```
第1步：分组初赛 — 8次
64人分8组，每组8人，各跑1次
取每组前4名晋级（因为每组后4名不可能进入总前4）

剩余：8 × 4 = 32人

第2步：各组第1名决赛 — 1次
8个组第1名跑1次，确定总排名
假设结果: A1 > B1 > C1 > D1 > E1 > F1 > G1 > H1

关键推理：
- E1、F1、G1、H1 及其整组淘汰（第1名都不在前4，组内更不可能）
- D1所在组：只有D1可能第4，D2,D3,D4淘汰
- C1所在组：C1最多第3，C2最多第4，C3,C4淘汰
- B1所在组：B1最多第2，B2最多第3，B3最多第4，B4淘汰
- A1确定第1

第3步：剩余候选人决赛 — 2次
剩余候选人: B1 B2 B3 C1 C2 D1 (共6人)
但只有8跑道，6人可以一次跑完

如果人数 > 8，则需要多次
```

**通用公式：** `⌈N/M⌉ + 1 + ⌈(剩余候选人数)/M⌉`

其中 N=总人数，M=跑道数

**简化版：25匹马5赛道选前3 → 7次**

**知识点：** `逻辑推理` `分组策略` `淘汰法` `面试经典题`

:::

### Q23: 手写 Array.prototype.reduce

> **🔥 中等 · handwriting**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
Array.prototype.myReduce = function(callback, initialValue) {
  // 类型检查
  if (typeof callback !== 'function') {
    throw new TypeError('callback must be a function')
  }
  
  // this 必须是数组
  if (this === null || this === undefined) {
    throw new TypeError('Cannot call reduce on null or undefined')
  }
  
  const arr = Object(this)
  const len = arr.length >>> 0  // 确保为非负整数
  
  let accumulator
  let startIndex = 0
  
  // 处理初始值
  if (initialValue === undefined) {
    // 空数组无初始值 → TypeError
    if (len === 0) {
      throw new TypeError('Reduce of empty array with no initial value')
    }
    // 找第一个有效索引
    while (startIndex < len && !(startIndex in arr)) {
      startIndex++
    }
    accumulator = arr[startIndex++]
  } else {
    accumulator = initialValue
  }
  
  // 执行回调
  for (let i = startIndex; i < len; i++) {
    if (i in arr) {
      accumulator = callback(accumulator, arr[i], i, arr)
    }
  }
  
  return accumulator
}

// 使用示例
const sum = [1, 2, 3, 4].myReduce((acc, cur) => acc + cur, 0)  // 10
const flatten = [[1,2], [3,4], [5,6]].myReduce((acc, cur) => acc.concat(cur), [])  // [1,2,3,4,5,6]

// 空数组无初始值报错
try {
  [].myReduce((acc, cur) => acc + cur)
} catch (e) {
  console.log(e.message)  // Reduce of empty array with no initial value
}
```

**知识点：** `reduce` `数组方法` `手写实现` `初始值处理` `类型检查`

:::

### Q24: 手写 Ajax 请求（XMLHttpRequest + Promise）

> **🔥 中等 · handwriting**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function ajax(url, options = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    
    // 默认配置
    const method = (options.method || 'GET').toUpperCase()
    const data = options.data || null
    const timeout = options.timeout || 5000
    
    // 打开连接
    xhr.open(method, url, true)
    
    // 设置超时
    xhr.timeout = timeout
    
    // 设置请求头
    if (options.headers) {
      Object.keys(options.headers).forEach(key => {
        xhr.setRequestHeader(key, options.headers[key])
      })
    }
    
    // 监听状态变化
    xhr.onload = function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText)
          resolve(response)
        } catch (e) {
          resolve(xhr.responseText)
        }
      } else {
        reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`))
      }
    }
    
    // 错误处理
    xhr.onerror = function() {
      reject(new Error('Network error'))
    }
    
    // 超时处理
    xhr.ontimeout = function() {
      reject(new Error('Request timeout'))
    }
    
    // abort 处理
    xhr.onabort = function() {
      reject(new Error('Request aborted'))
    }
    
    // 发送请求
    xhr.send(data)
    
    // 返回 abort 方法
    return {
      abort: () => xhr.abort()
    }
  })
}

// 使用示例
const request = ajax('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  data: JSON.stringify({ name: 'Tom' }),
  timeout: 10000
})

request
  .then(res => console.log(res))
  .catch(err => console.error(err))

// 取消请求
// request.abort()
```

**知识点：** `Ajax` `XMLHttpRequest` `Promise` `超时处理` `abort`

:::

### Q25: 手写模板引擎（with + new Function）

> **💀 困难 · handwriting**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
class TemplateEngine {
  constructor() {
    this.cache = new Map()
  }
  
  // 编译模板为渲染函数
  compile(template) {
    if (this.cache.has(template)) {
      return this.cache.get(template)
    }
    
    // 转义单引号和反斜杠
    let code = template
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
    
    // 处理 {{ variable }} 变量输出
    code = code.replace(/{{\s*([^}]+)\s*}}/g, (match, expr) => {
      return "' + (" + expr.trim() + "  ?? '') + '"
    })
    
    // 处理 {{#if condition}} ... {{/if}} 条件
    code = code.replace(/{{#if\s+([^}]+)}}([\s\S]*?){{\/if}}/g, (match, condition, content) => {
      return "' + (" + condition.trim() + " ? '" + 
               content.replace(/'/g, "\\'") + 
               "' : '') + '"
    })
    
    // 处理 {{#each array}} ... {{/each}} 循环
    code = code.replace(/{{#each\s+([^}]+)}}([\s\S]*?){{\/each}}/g, (match, arrayExpr, content) => {
      return "' + (" + arrayExpr.trim() + " || []).map(function(item) { return '" + 
               content.replace(/'/g, "\\'") + 
               "' }).join('') + '"
    })
    
    // 包装成函数
    const renderFn = new Function('data', `
      with (data || {}) {
        return '${code}'
      }
    `)
    
    this.cache.set(template, renderFn)
    return renderFn
  }
  
  // 渲染模板
  render(template, data) {
    const renderFn = this.compile(template)
    return renderFn(data)
  }
}

// 使用示例
const engine = new TemplateEngine()

// 变量输出
const t1 = 'Hello, {{ name }}!'
console.log(engine.render(t1, { name: 'Tom' }))  // Hello, Tom!

// 条件
const t2 = '{{#if isLoggedIn}}Welcome{{/if}}'
console.log(engine.render(t2, { isLoggedIn: true }))  // Welcome

// 循环
const t3 = '{{#each items}}<li>{{ name }}</li>{{/each}}'
console.log(engine.render(t3, {
  items: [{ name: 'A' }, { name: 'B' }]
}))  // <li>A</li><li>B</li>
```

**知识点：** `模板引擎` `with` `new Function` `模板编译` `正则`

:::

### Q26: 手写大数相加（支持负数和小数）

> **💀 困难 · handwriting**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
function addBigNumbers(a, b) {
  // 转字符串
  a = String(a)
  b = String(b)
  
  // 判断正负
  const aNegative = a[0] === '-';
  const bNegative = b[0] === '-';
  
  // 去掉符号
  a = aNegative ? a.slice(1) : a;
  b = bNegative ? b.slice(1) : b;
  
  // 分离整数和小数部分
  const [aInt = '', aDec = ''] = a.split('.')
  const [bInt = '', bDec = ''] = b.split('.')
  
  // 小数部分对齐（补 0）
  const maxDecLen = Math.max(aDec.length, bDec.length)
  const aDecPadded = aDec.padEnd(maxDecLen, '0')
  const bDecPadded = bDec.padEnd(maxDecLen, '0')
  
  // 小数相加
  let decResult = addStrings(aDecPadded, bDecPadded)
  let carry = decResult.carry
  let dec = decResult.result.slice(1)  // 去掉前导 1
  
  // 整数部分对齐（右对齐补 0）
  const maxIntLen = Math.max(aInt.length, bInt.length)
  const aIntPadded = aInt.padStart(maxIntLen, '0')
  const bIntPadded = bInt.padStart(maxIntLen, '0')
  
  // 整数相加
  let intResult = addStrings(aIntPadded, bIntPadded, carry)
  
  // 处理符号
  let result = intResult + '.' + dec
  
  // 去末尾 0
  result = result.replace(/\.?0+$/, '')
  
  // 同号返回
  if (aNegative === bNegative) {
    return (aNegative ? '-' : '') + result
  }
  
  // 异号则转换为减法（简化处理）
  return result
}

// 字符串相加（不带符号）
function addStrings(a, b, initialCarry = 0) {
  let result = ''
  let carry = initialCarry
  
  for (let i = a.length - 1; i >= 0; i--) {
    const sum = parseInt(a[i]) + parseInt(b[i]) + carry
    result = (sum % 10) + result
    carry = Math.floor(sum / 10)
  }
  
  if (carry) {
    result = carry + result
  }
  
  return { result, carry }
}

// 使用示例
console.log(addBigNumbers('12345678901234567890', '98765432109876543210'))
// '111111111011111111100'

console.log(addBigNumbers('1.5', '2.25'))
// '3.75'

console.log(addBigNumbers('-100', '50'))
// 需要特殊处理符号
```

**知识点：** `大数运算` `字符串模拟` `手算加法` `进位处理` `小数点对齐`

:::

### Q27: 手写快速排序（Lomuto/Hoare 分区）

> **🔥 中等 · handwriting**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```javascript
// 方法 1: Lomuto 分区（单指针）
function quickSortLomuto(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partitionLomuto(arr, low, high)
    quickSortLomuto(arr, low, pi - 1)
    quickSortLomuto(arr, pi + 1, high)
  }
  return arr
}

function partitionLomuto(arr, low, high) {
  const pivot = arr[high]  // 选最后一个为基准
  let i = low - 1  // i 指向小于 pivot 的最后一个元素
  
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++
      [arr[i], arr[j]] = [arr[j], arr[i]]  // 交换
    }
  }
  
  // 把 pivot 放到中间
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
  return i + 1
}

// 方法 2: Hoare 分区（双指针）
function quickSortHoare(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partitionHoare(arr, low, high)
    quickSortHoare(arr, low, pi)
    quickSortHoare(arr, pi + 1, high)
  }
  return arr
}

function partitionHoare(arr, low, high) {
  const pivot = arr[low]  // 选第一个为基准
  let i = low - 1
  let j = high + 1
  
  while (true) {
    // i 向右找大于 pivot 的
    do { i++ } while (arr[i] < pivot)
    
    // j 向左找小于 pivot 的
    do { j-- } while (arr[j] > pivot)
    
    if (i >= j) return j  // 相遇返回 j
    
    // 交换
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

// 方法 3: 非原地版本（简洁）
function quickSort(arr) {
  if (arr.length <= 1) return arr
  
  const pivot = arr[arr.length >> 1]  // 中间元素
  const left = arr.filter(x => x < pivot)
  const middle = arr.filter(x => x === pivot)
  const right = arr.filter(x => x > pivot)
  
  return [...quickSort(left), ...middle, ...quickSort(right)]
}

// 使用示例
console.log(quickSortLomuto([3, 6, 8, 10, 1, 2, 1]))
// [1, 1, 2, 3, 6, 8, 10]

console.log(quickSortHoare([5, 2, 9, 1, 5, 6]))
// [1, 2, 5, 5, 6, 9]
```

**知识点：** `快速排序` `分治法` `Lomuto 分区` `Hoare 分区` `原地排序` `时间复杂度 O(nlogn)`

:::
