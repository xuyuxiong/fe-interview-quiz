---
title: 3D与WebGL
description: Three.js、WebGL渲染管线、3D性能优化、着色器面试题
---

# 3D与WebGL

## 面试题

### Q1: Three.js 的核心概念有哪些？

> **⭐ 简单 · 3D**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
import * as THREE from 'three'

// 1. Scene - 场景容器
const scene = new THREE.Scene()

// 2. Camera - 摄像机（观察角度）
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)

// 3. Renderer - 渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true })

// 4. Mesh - 网格物体 = Geometry + Material
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

// 5. Light - 光源
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(1, 1, 1)
scene.add(light)

// 6. 渲染循环
function animate() {
  requestAnimationFrame(animate)
  cube.rotation.x += 0.01
  renderer.render(scene, camera)
}
animate()
```

| 概念 | 说明 |
|------|------|
| Scene | 场景，所有 3D 对象的容器 |
| Camera | 摄像机，决定观察视角 |
| Renderer | 渲染器，将场景绘制到 Canvas |
| Mesh | 网格，Geometry(形状) + Material(材质) |
| Light | 光源，影响物体外观 |

**知识点：** `Three.js` `Scene` `Camera` `Mesh` `Light`

:::

### Q2: WebGL 渲染管线的流程是什么？

> **💀 困难 · 3D**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```
顶点数据 → 顶点着色器 → 图元装配 → 光栅化 → 片段着色器 → 测试混合 → 帧缓冲
```

1. **顶点着色器**：处理每个顶点位置（MVP 矩阵变换）
2. **图元装配**：将顶点组装为三角形
3. **光栅化**：将三角形转为像素片段
4. **片段着色器**：计算每个像素的颜色
5. **测试混合**：深度测试、模板测试、Alpha 混合
6. **帧缓冲**：最终输出到屏幕

```glsl
// 顶点着色器
attribute vec3 position;
uniform mat4 modelViewProjection;
void main() {
  gl_Position = modelViewProjection * vec4(position, 1.0);
}

// 片段着色器
uniform vec3 color;
void main() {
  gl_FragColor = vec4(color, 1.0);
}
```

**知识点：** `WebGL` `渲染管线` `顶点着色器` `片段着色器` `光栅化`

:::

### Q3: Three.js 有哪几种材质？如何选择？

> **🔥 中等 · 3D**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 材质 | 光照 | 性能 | 适用场景 |
|------|------|------|----------|
| MeshBasicMaterial | 无 | 最好 | 不需要光照的平面物体 |
| MeshLambertMaterial | 兰伯特 | 好 | 哑光表面（墙壁、地面） |
| MeshPhongMaterial | 冯氏 | 中 | 光滑表面（塑料、玻璃） |
| MeshStandardMaterial | PBR | 较低 | 真实感材质（金属、皮肤） |
| MeshPhysicalMaterial | PBR+ | 最低 | 高级物理效果（清漆、折射） |

```js
// PBR 材质 - 最常用
const material = new THREE.MeshStandardMaterial({
  color: 0xcccccc,
  metalness: 0.8,   // 金属度 0-1
  roughness: 0.2,    // 粗糙度 0-1
  envMap: envTexture  // 环境贴图
})

// 物理材质 - 高级效果
const glass = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  transmission: 0.9,  // 透光率
  ior: 1.5,           // 折射率
  thickness: 0.5      // 厚度
})
```

**选型：** 追求性能→Lambert，追求真实→Standard，追求极致效果→Physical。

**知识点：** `Three.js材质` `PBR` `metalness` `roughness` `MeshStandardMaterial`

:::

### Q4: 射线拾取（Raycaster）怎么使用？

> **🔥 中等 · 3D**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

Raycaster 用于鼠标点击/悬停检测 3D 物体：

```js
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

canvas.addEventListener('click', (event) => {
  // 1. 将屏幕坐标转为 NDC 坐标 (-1 到 1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

  // 2. 从摄像机发出射线
  raycaster.setFromCamera(mouse, camera)

  // 3. 检测与物体的交点
  const intersects = raycaster.intersectObjects(scene.children, true)

  if (intersects.length > 0) {
    const object = intersects[0].object
    const point = intersects[0].point     // 交点坐标
    const distance = intersects[0].distance  // 距离
    console.log('点击了:', object.name, '距离:', distance)
  }
})
```

**性能优化：** 避免对整个 scene 进行检测，只检测可交互的物体列表。

**知识点：** `Raycaster` `射线拾取` `NDC坐标` `鼠标交互`

:::

### Q5: Three.js 中常用的 Controller 有哪些？

> **⭐ 简单 · 3D**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```js
import { OrbitControls, FlyControls, TrackballControls } from 'three/addons/controls/'

// 1. OrbitControls - 最常用，轨道旋转
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true     // 阻尼效果
controls.dampingFactor = 0.05
controls.minDistance = 1           // 最近距离
controls.maxDistance = 100         // 最远距离
controls.autoRotate = true        // 自动旋转
controls.autoRotateSpeed = 2

// 2. FlyControls - 第一人称飞行
const flyControls = new FlyControls(camera, renderer.domElement)
flyControls.movementSpeed = 1
flyControls.rollSpeed = 0.5

// 3. TrackballControls - 自由旋转（无限制）
const trackControls = new TrackballControls(camera, renderer.domElement)
```

| 控制器 | 特点 | 适用场景 |
|--------|------|----------|
| OrbitControls | 围绕目标旋转/缩放 | 产品展示、模型查看 |
| FlyControls | 第一人称飞行 | 飞行模拟 |
| TrackballControls | 无限制自由旋转 | CAD 工具 |
| FirstPersonControls | 键盘+鼠标 | 游戏场景 |

**知识点：** `OrbitControls` `控制器` `3D交互` `阻尼`

:::

### Q6: 3D 场景性能如何优化？

> **💀 困难 · 3D**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

1. **几何体优化：**
```js
// 合并几何体减少 draw call
const merged = BufferGeometryUtils.mergeGeometries([geo1, geo2, geo3])

// LOD - 距离远用低精度模型
const lod = new THREE.LOD()
lod.addLevel(highPolyMesh, 0)     // 近距离
lod.addLevel(medPolyMesh, 20)     // 中距离
lod.addLevel(lowPolyMesh, 50)     // 远距离
```

2. **实例化渲染：**
```js
// 大量相同物体用 InstancedMesh（一个 draw call）
const instancedMesh = new THREE.InstancedMesh(geometry, material, count)
const matrix = new THREE.Matrix4()
for (let i = 0; i < count; i++) {
  matrix.setPosition(x, y, z)
  instancedMesh.setMatrixAt(i, matrix)
}
```

3. **纹理优化：**
- 使用压缩纹理（KTX2/Basis）
- 合并图集（Texture Atlas）
- Mipmap 自动生成

4. **材质优化：**
- 减少材质种类
- 用 MeshBasicMaterial 代替 PBR
- 关闭不需要的材质属性

5. **渲染控制：**
```js
// 按需渲染（不每帧都渲染）
controls.addEventListener('change', () => renderer.render(scene, camera))

// 视锥体剔除（默认开启）
renderer.frustumCulled = true

// 像素比限制
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
```

**知识点：** `3D性能优化` `LOD` `InstancedMesh` `合并几何体` `纹理压缩`

:::

### Q7: Three.js 坐标系和变换怎么理解？

> **🔥 中等 · 3D**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Three.js 使用右手坐标系：**
- X 轴：向右为正
- Y 轴：向上为正
- Z 轴：向屏幕外为正

```js
// 位置
mesh.position.set(0, 1, 0)      // 移动到 Y=1
mesh.position.x = 2              // X 方向移动

// 旋转（弧度）
mesh.rotation.set(Math.PI / 4, 0, 0)  // X 轴旋转 45°
mesh.rotation.y = THREE.MathUtils.degToRad(90)

// 缩放
mesh.scale.set(2, 2, 2)          // 放大 2 倍

// 变换顺序：缩放 → 旋转 → 平移（SRT）
// Three.js 默认顺序：先 scale，再 rotation，最后 position
```

**四元数（Quaternion）：** 避免万向锁

```js
// 使用四元数代替欧拉角
const quaternion = new THREE.Quaternion()
quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4)
mesh.quaternion.copy(quaternion)

// 平滑旋转
mesh.lookAt(targetPosition)  // 面向目标
```

**知识点：** `坐标系` `变换` `四元数` `万向锁` `SRT`

:::

### Q8: 着色器（Shader）基础是什么？

> **💀 困难 · 3D**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

Shader 是在 GPU 上运行的小程序，分两种：

**顶点着色器（Vertex Shader）：** 处理顶点位置

```glsl
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
attribute vec3 position;
varying vec3 vPosition;

void main() {
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**片段着色器（Fragment Shader）：** 处理像素颜色

```glsl
precision mediump float;
varying vec3 vPosition;
uniform float uTime;

void main() {
  // 根据位置和时间计算颜色
  vec3 color = 0.5 + 0.5 * cos(uTime + vPosition.xyx + vec3(0, 2, 4));
  gl_FragColor = vec4(color, 1.0);
}
```

**Three.js 中使用 ShaderMaterial：**

```js
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 }
  },
  vertexShader: vertexShader,
  fragmentShader: fragmentShader
})

// 动画中更新 uniform
function animate() {
  material.uniforms.uTime.value = performance.now() / 1000
}
```

**关键概念：**
- `attribute`：顶点属性（position、uv、normal）
- `uniform`：全局变量（矩阵、时间、颜色）
- `varying`：顶点→片段传递的插值变量

**知识点：** `Shader` `GLSL` `顶点着色器` `片段着色器` `ShaderMaterial`

:::
### Q9: 手写shader有哪些常见效果？

> **💀 困难 · 3D/WebGL**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**着色器基础：**

```glsl
// 顶点着色器 — 处理顶点位置
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// 片段着色器 — 处理像素颜色
uniform vec3 uColor;
uniform float uTime;

void main() {
  gl_FragColor = vec4(uColor, 1.0);
}
```

**常见Shader效果：**

```glsl
// 1. 波浪效果
uniform float uTime;
varying vec2 vUv;

void main() {
  vec3 pos = position;
  pos.z += sin(pos.x * 3.0 + uTime) * 0.1;
  pos.z += cos(pos.y * 2.0 + uTime) * 0.1;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}

// 2. 渐变颜色
varying vec2 vUv;
void main() {
  vec3 color = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), vUv.x);
  gl_FragColor = vec4(color, 1.0);
}

// 3. 发光效果 (Glow)
uniform float uTime;
void main() {
  float glow = 0.05 / abs(sin(uTime) * length(vUv - 0.5));
  gl_FragColor = vec4(vec3(0.1, 0.5, 1.0) * glow, 1.0);
}

// 4. 噪声/地形
// 使用 simple noise 函数生成地形高度图
```

| Shader类型 | 用途 | 语言 |
|-----------|------|------|
| 顶点着色器 | 顶点变换、变形动画 | GLSL |
| 片段着色器 | 颜色计算、纹理采样、后处理 | GLSL |
| 几何着色器 | 生成新图元 | GLSL |
| 计算着色器 | 通用GPU计算 | GLSL |

**知识点：** `Shader` `GLSL` `顶点着色器` `片段着色器` `GPU编程` `Three.js`

:::

### Q10: 多个模型共享材质，一个需要修改怎么办？

> **🔥 中等 · 3D/WebGL**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**问题：** Three.js 中材质共享时，修改一个会影响所有使用该材质的模型。

```js
// 共享材质 — 修改会影响所有模型
const sharedMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
const mesh1 = new THREE.Mesh(geometry1, sharedMaterial)
const mesh2 = new THREE.Mesh(geometry2, sharedMaterial)

sharedMaterial.color.set(0xff0000) // mesh1 和 mesh2 都变红！
```

**解决方案：**

```js
// 方案1：clone 材质（推荐）
const material1 = sharedMaterial.clone()
material1.color.set(0xff0000)  // 只影响 mesh1

// 方案2：直接创建新材质
const material2 = new THREE.MeshStandardMaterial({
  color: 0x0000ff,
  map: sharedMaterial.map,  // 共享纹理（纹理可以共享）
})

// 方案3：使用 onBeforeRender 动态修改
mesh1.onBeforeRender = (renderer, scene, camera, geometry, material) => {
  material.color.set(0xff0000)  // 仅本次渲染修改
  // 注意：需要在 onAfterRender 中恢复
}
```

**材质实例化（Material Instancing）：**

```js
// Three.js r132+ 支持材质实例化
// 适合大量相同几何体不同颜色的情况
const instancedMesh = new THREE.InstancedMesh(geometry, material, count)
const color = new THREE.Color()
const matrix = new THREE.Matrix4()

for (let i = 0; i < count; i++) {
  matrix.setPosition(x, y, z)
  instancedMesh.setMatrixAt(i, matrix)
  color.setHSL(i / count, 1, 0.5)
  instancedMesh.setColorAt(i, color)  // 每个实例不同颜色
}
instancedMesh.instanceMatrix.needsUpdate = true
instancedMesh.instanceColor.needsUpdate = true
```

| 方案 | 适用场景 | 性能 |
|------|---------|------|
| `material.clone()` | 少量不同材质 | 高（每个材质一次drawcall） |
| 创建新材质 | 材质参数差异大 | 中 |
| InstancedMesh | 大量同构不同色 | 最优（1次drawcall） |
| onBeforeRender | 临时修改 | 低（每次渲染执行） |

**知识点：** `Three.js` `材质共享` `clone` `InstancedMesh` `onBeforeRender`

:::

### Q11: WebGL 的着色器编程基础？

> **🔥 中等 · Web3D**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**着色器类型：**

```
1. 顶点着色器 (Vertex Shader)
   - 处理每个顶点
   - 计算顶点位置（gl_Position）
   - 传递数据给片元着色器

2. 片元着色器 (Fragment Shader)
   - 处理每个像素
   - 计算像素颜色（gl_FragColor）
   - 实现光照、纹理等效果
```

**GLSL 基础语法：**

```glsl
// 顶点着色器示例
attribute vec3 position;    // 顶点位置（输入）
attribute vec2 uv;          // UV 坐标
uniform mat4 modelMatrix;   // 模型矩阵
uniform mat4 viewMatrix;    // 视图矩阵
uniform mat4 projectionMatrix; // 投影矩阵

varying vec2 vUv;           // 传递给片元着色器

void main() {
  vUv = uv;
  // 计算最终位置 = 投影 × 视图 × 模型 × 原始位置
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}

// 片元着色器示例
precision mediump float;    // 精度声明

varying vec2 vUv;           // 从顶点着色器接收
uniform sampler2D texture;  // 纹理
uniform vec3 color;         // 颜色

void main() {
  // 采样纹理
  vec4 texColor = texture2D(texture, vUv);
  // 输出最终颜色
  gl_FragColor = texColor * vec4(color, 1.0);
}
```

**数据类型：**

```glsl
// 基本类型
float, int, bool
vec2, vec3, vec4      // 向量
mat2, mat3, mat4      // 矩阵
sampler2D, samplerCube // 纹理

// 限定词
attribute   // 顶点输入（仅顶点着色器）
uniform     // 全局统一变量
varying     // 顶点→片元传递
const       // 常量
```

**常用内置函数：**

```glsl
// 数学函数
sin(), cos(), tan()
pow(), sqrt(), exp()
mod(), min(), max(), clamp()
mix()        // 插值：mix(a, b, t)

// 几何函数
length()     // 长度
normalize()  // 归一化
dot()        // 点积
cross()      // 叉积
reflect()    // 反射
refract()    // 折射

// 纹理函数
texture2D(sampler, uv)
textureCube(sampler, direction)
```

**简单光照模型：**

```glsl
// 片元着色器 - 简单漫反射
precision mediump float;

varying vec3 vNormal;       // 法线
varying vec3 vPosition;     // 位置
uniform vec3 lightPosition; // 光源位置
uniform vec3 color;

void main() {
  // 计算光线方向
  vec3 lightDir = normalize(lightPosition - vPosition);
  
  // 计算法线方向
  vec3 normal = normalize(vNormal);
  
  // 漫反射 = max(点积，0)
  float diff = max(dot(normal, lightDir), 0.0);
  
  // 环境光
  vec3 ambient = 0.1 * color;
  
  // 漫反射光
  vec3 diffuse = diff * color;
  
  // 最终颜色
  gl_FragColor = vec4(ambient + diffuse, 1.0);
}
```

**Three.js 中使用自定义着色器：**

```js
const material = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(0xff0000) },
    uTexture: { value: texture }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    
    void main() {
      vec3 color = uColor * sin(uTime + vUv.x * 3.14);
      gl_FragColor = vec4(color, 1.0);
    }
  `
})
```

**知识点：** `WebGL` `着色器` `GLSL` `顶点着色器` `片元着色器` `光照模型`

:::

### Q12: Three.js 的性能优化策略？

> **🔥 中等 · Web3D**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**性能优化核心思路：**

```
1. 减少 Draw Call
2. 减少渲染对象数量
3. 优化几何体和材质
4. 合理使用LOD
5. 控制阴影和后期处理
```

**1. 减少 Draw Call（最重要）：**

```js
// ❌ 差：每个物体一个材质 = N 次 Draw Call
objects.forEach(obj => {
  obj.material = new THREE.MeshBasicMaterial({ color: randomColor() })
})

// ✅ 好：共享材质
const sharedMaterial = new THREE.MeshBasicMaterial()
objects.forEach(obj => {
  obj.material = sharedMaterial
  obj.material.color.set(randomColor())
})

// ✅ 最优：使用 InstancedMesh
const mesh = new THREE.InstancedMesh(geometry, material, count)
for (let i = 0; i < count; i++) {
  mesh.setMatrixAt(i, matrix)
  mesh.setColorAt(i, color)
}
```

**2. 几何体优化：**

```js
// 合并几何体
const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries)

// 简化网格（减少顶点）
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier'
const simplified = modifier.modify(geometry, ratio)

// 使用合适的细分
// 球体：16 段通常足够，不需要 64 段
const sphere = new THREE.SphereGeometry(1, 16, 16)
```

**3. 材质优化：**

```js
// 使用简单材质
// MeshBasicMaterial < MeshLambert < MeshPhong < MeshStandard < MeshPhysical

// 关闭不需要的特性
material.shadowSide = THREE.FrontSide  // 默认即可
material.side = THREE.FrontSide       // 不渲染背面

// 纹理压缩
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader'
```

**4. LOD (Level of Detail)：**

```js
const lod = new THREE.LOD()

// 远距离使用低模
lod.addLevel(highDetailMesh, 0)      // 0-100 单位
lod.addLevel(mediumDetailMesh, 100)  // 100-300 单位
lod.addLevel(lowDetailMesh, 300)     // 300+ 单位

scene.add(lod)
```

**5. 阴影优化：**

```js
// 只必要的物体投射/接收阴影
mesh.castShadow = true    // 只开启必要的
mesh.receiveShadow = true

// 降低阴影贴图分辨率
renderer.shadowMap.width = 1024   // 默认 512
renderer.shadowMap.height = 1024

// 使用合适的阴影类型
renderer.shadowMap.type = THREE.PCFShadowMap  // 性能较好
```

**6. 视锥体剔除：**

```js
// Three.js 默认开启
// 不可见的物体会自动跳过渲染

// 手动优化：大场景分区
// 只更新可见区域的物体
```

**7. 后期处理优化：**

```js
// 降低渲染分辨率
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// 减少后期效果
// Bloom、SSAO、抗锯齿等都很耗性能
```

**性能监控：**

```js
// 使用 Three.js 内置统计
import Stats from 'three/examples/jsm/libs/stats.module'
const stats = new Stats()
document.body.appendChild(stats.dom)

function animate() {
  stats.begin()
  renderer.render(scene, camera)
  stats.end()
  requestAnimationFrame(animate)
}

// Chrome DevTools - Performance 面板
// Three.js Inspector 扩展
```

**优化清单：**

```
□ 使用 InstancedMesh 渲染大量相同物体
□ 合并共享材质的几何体
□ 降低不必要的几何体细分
□ 使用合适的纹理尺寸和格式
□ 限制阴影数量和分辨率
□ 使用 LOD 处理远近物体
□ 控制后期效果
□ 及时 dispose 不再使用的资源
```

**知识点：** `Three.js` `性能优化` `Draw Call` `InstancedMesh` `LOD` `阴影优化`

:::
