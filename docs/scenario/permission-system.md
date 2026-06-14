---
title: 权限系统设计面试题
description: 覆盖 RBAC 模型/前端权限/动态路由/Token 刷新等 6 道题
---

# 权限系统设计面试题

### Q1: RBAC 权限模型

> **⭐ 简单 · 权限模型**

请解释 RBAC 权限模型的核心概念。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**RBAC（Role-Based Access Control）基于角色的访问控制：**

**核心概念：**

| 概念 | 说明 | 示例 |
|------|------|------|
| User（用户） | 系统使用者 | 张三、李四 |
| Role（角色） | 权限的集合 | 管理员、编辑、访客 |
| Permission（权限） | 操作授权 | 创建、删除、查看 |
| Resource（资源） | 被操作对象 | 文章、用户、订单 |

**关系图：**
```
用户  →  角色  →  权限  →  资源
  ↑              ↓
  └──── 继承 ────┘
```

**数据库设计：**
```sql
-- 用户表
CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(50),
  password VARCHAR(100)
);

-- 角色表
CREATE TABLE roles (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  code VARCHAR(50) -- admin, editor, viewer
);

-- 权限表
CREATE TABLE permissions (
  id INT PRIMARY KEY,
  code VARCHAR(50), -- user:create, user:delete
  name VARCHAR(100),
  resource VARCHAR(50)
);

-- 用户角色关联表
CREATE TABLE user_roles (
  user_id INT,
  role_id INT,
  PRIMARY KEY (user_id, role_id)
);

-- 角色权限关联表
CREATE TABLE role_permissions (
  role_id INT,
  permission_id INT,
  PRIMARY KEY (role_id, permission_id)
);
```

**前端实现：**
```js
// 角色权限配置
const rolePermissions = {
  admin: ['user:*', 'post:*', 'comment:*'],
  editor: ['post:create', 'post:update', 'post:delete:own', 'comment:*'],
  viewer: ['post:read', 'comment:read']
}

// 权限检查
function hasPermission(userRole, requiredPermission) {
  const userPermissions = rolePermissions[userRole] || []
  
  // 通配符匹配
  return userPermissions.some(p => {
    if (p === '*') return true
    if (p.endsWith(':*')) {
      return requiredPermission.startsWith(p.slice(0, -1))
    }
    return p === requiredPermission
  })
}

// 使用
if (hasPermission(currentUser.role, 'user:delete')) {
  showDeleteButton()
}
```

**知识点：** `RBAC` `用户角色` `权限配置` `通配符`

:::

### Q2: 前端权限类型

> **⭐ 简单 · 权限控制**

请说明前端三种权限类型（路由/菜单/按钮）的实现。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**前端权限分为三层：**

### 1. 路由权限（页面级）
```jsx
// 路由守卫
const routes = [
  {
    path: '/admin',
    component: Layout,
    meta: { requiresAuth: true, roles: ['admin'] },
    children: [
      { path: 'users', component: UserList },
      { path: 'settings', component: Settings }
    ]
  }
]

// 路由守卫实现
router.beforeEach((to, from, next) => {
  const user = useUserStore()
  const roles = to.meta.roles
  
  if (roles && !roles.some(role => user.roles.includes(role))) {
    next('/403')
  } else {
    next()
  }
})

// 或使用组件
function AuthRoute({ roles, children }) {
  const userRoles = useUserStore(state => state.roles)
  const hasRole = roles.some(r => userRoles.includes(r))
  
  if (!hasRole) return <Navigate to="/403" />
  return children
}
```

### 2. 菜单权限（导航级）
```jsx
// 菜单配置
const menus = [
  {
    title: '用户管理',
    path: '/users',
    icon: 'users',
    permission: 'user:view'
  },
  {
    title: '系统设置',
    path: '/settings',
    icon: 'settings',
    permission: 'settings:view'
  }
]

// 菜单渲染
function MenuTree({ items }) {
  const can = usePermissions()
  
  return (
    <nav>
      {items
        .filter(item => can(item.permission) || !item.permission)
        .map(item => (
          <Link key={item.path} to={item.path}>
            <Icon name={item.icon} />
            {item.title}
          </Link>
        ))}
    </nav>
  )
}
```

### 3. 按钮权限（操作级）
```jsx
// 权限指令
const can directive = (el, binding) => {
  const { userPermissions } = useUserStore()
  const hasPermission = userPermissions.includes(binding.value)
  
  if (!hasPermission) {
    el.parentNode?.removeChild(el)
  }
}

// 使用
<button v-can="'user:create'">新增用户</button>

// React 组件
function Can({ permission, children, fallback = null }) {
  const can = usePermissions()
  return can(permission) ? children : fallback
}

// 使用
<Can permission="user:delete">
  <Button danger>删除</Button>
</Can>

// 或 Hooks
function useButtonPermission(permission) {
  const userPermissions = useUserStore(state => state.permissions)
  return userPermissions.includes(permission)
}

// 组件中使用
function UserTable() {
  const canEdit = useButtonPermission('user:edit')
  const canDelete = useButtonPermission('user:delete')
  
  return (
    <Table>
      {canEdit && <Column action="edit" />}
      {canDelete && <Column action="delete" />}
    </Table>
  )
}
```

**知识点：** `路由权限` `菜单权限` `按钮权限` `权限指令`

:::

### Q3: 权限控制实现

> **🔥 中等 · 权限实现**

请说明权限控制的实现方式（自定义指令/高阶组件/Hook）。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

### 1. Vue 自定义指令
```js
// registerPermissions.js
export function registerPermissions(app) {
  app.directive('permission', {
    mounted(el, binding) {
      const { value: permission } = binding
      const permissions = useUserStore().permissions
      
      if (!permissions?.includes(permission)) {
        el.parentNode?.removeChild(el)
      }
    }
  })
}

// 使用
<template>
  <button v-permission="'user:create'">新增</button>
  <button v-permission="['user:edit', 'user:delete']">管理</button>
</template>
```

### 2. React 高阶组件
```jsx
// withPermission HOC
function withPermission(RequiredComponent, permission) {
  return function WithPermission(props) {
    const userPermissions = useUserStore(state => state.permissions)
    const hasPermission = userPermissions.includes(permission)
    
    if (!hasPermission) return null
    return <RequiredComponent {...props} />
  }
}

// 使用
const DeleteButton = withPermission(Button, 'user:delete')
```

### 3. Permission Hook
```jsx
// usePermission Hook
function usePermission(permission) {
  const permissions = useSelector(state => state.user.permissions)
  const hasPermission = permissions?.includes(permission)
  
  return {
    can: hasPermission,
    cannot: !hasPermission
  }
}

// usePermissions Hook（多个权限）
function usePermissions() {
  const permissions = useUserStore(state => state.permissions)
  
  return (required) => {
    if (Array.isArray(required)) {
      return required.some(p => permissions.includes(p))
    }
    return permissions.includes(required)
  }
}

// 使用
function ProductCard({ product }) {
  const canDelete = usePermissions('product:delete')
  const canEdit = usePermissions('product:edit')
  
  return (
    <div>
      <h3>{product.name}</h3>
      {canEdit && <EditButton />}
      {canDelete && <DeleteButton />}
    </div>
  )
}
```

### 4. Permission Guard
```jsx
// 守卫函数
function PermissionGuard({ required, children, fallback }) {
  const permissions = useUserStore(state => state.permissions)
  
  const hasPermission = Array.isArray(required)
    ? required.some(p => permissions.includes(p))
    : permissions.includes(required)
  
  return hasPermission ? children : fallback
}

// 使用
<PermissionGuard required="admin:delete" fallback={<AccessDenied />}>
  <DeleteButton />
</PermissionGuard>
```

**知识点：** `自定义指令` `HOC` `Hooks` `守卫组件`

:::

### Q4: 动态路由添加（addRoute）

> **🔥 中等 · 动态路由**

请实现后端返回路由的动态添加。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

### Vue Router 实现
```js
// 后端返回的路由结构
const asyncRoutes = [
  {
    path: '/user',
    component: 'Layout',
    children: [
      {
        path: 'list',
        component: 'UserList',
        meta: { title: '用户列表' }
      }
    ]
  }
]

// 动态添加路由
async function generateRoutes() {
  const store = useUserStore()
  const userRoutes = await fetchUserRoutes()
  
  const routeMap = {
    Layout: () => import('@/layout'),
    UserList: () => import('@/views/user/List'),
  }
  
  function filterAsyncRoutes(routes, roles) {
    return routes
      .filter(route => {
        if (!route.meta?.roles) return true
        return route.meta.roles.some(role => roles.includes(role))
      })
      .map(route => {
        const item = { ...route }
        if (route.component) {
          item.component = routeMap[route.component]
        }
        if (route.children) {
          item.children = filterAsyncRoutes(route.children, roles)
        }
        return item
      })
  }
  
  const routes = filterAsyncRoutes(userRoutes, store.roles)
  routes.forEach(route => router.addRoute(route))
}

// 初始化
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const hasToken = getToken()
  
  if (hasToken) {
    if (!userStore.name) {
      await userStore.getInfo()
      await generateRoutes()
      next({ ...to, replace: true })
    } else {
      next()
    }
  } else {
    next()
  }
})
```

### React Router 实现
```jsx
// 动态路由组件
function PermissionRoutes({ routes }) {
  const renderRoutes = (routeList) => {
    return routeList.map(route => {
      if (route.children) {
        return (
          <Route key={route.path} path={route.path} element={
            <Layout>{renderRoutes(route.children)}</Layout>
          } />
        )
      }
      return (
        <Route 
          key={route.path} 
          path={route.path} 
          element={<route.component />}
        />
      )
    })
  }
  
  return <Routes>{renderRoutes(routes)}</Routes>
}

// 从 API 获取路由
async function loadRoutes() {
  const routes = await fetch('/api/user/routes')
  return routes.map(route => ({
    ...route,
    component: () => {
      const Component = routeComponents[route.componentName]
      return Component ? <Component /> : <NotFound />
    }
  }))
}
```

### 路由表配置示例
```js
// constantRoutes.js（静态路由）
export const constantRoutes = [
  { path: '/login', component: () => import('@/views/Login') },
  { path: '/404', component: () => import('@/views/404') },
  { path: '/', redirect: '/dashboard' }
]

// asyncRoutes.js（需要权限）
export const asyncRoutes = [
  {
    path: '/admin',
    component: Layout,
    meta: { roles: ['admin'] },
    children: [
      {
        path: 'user',
        component: () => import('@/views/user'),
        meta: { roles: ['admin'], title: '用户管理' }
      }
    ]
  }
]

// 合并路由
const routes = constantRoutes

// 登录后
userRoutes.forEach(route => {
  router.addRoute(route)
  routes.push(route)
})
```

**知识点：** `动态路由` `addRoute` `权限路由` `路由守卫`

:::

### Q5: Token 无感刷新

> **💀 困难 · Token 管理**

请实现 Token 无感刷新方案。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**双 Token 机制：**
- **Access Token**：短期（15 分钟），用于 API 请求
- **Refresh Token**：长期（7 天），用于刷新 Access Token

### 方案一：队列等待
```js
// token.js
let isRefreshing = false
let refreshSubscribers = []

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb)
}

function onTokenRefreshed(token) {
  refreshSubscribers.forEach(cb => cb(token))
  refreshSubscribers = []
}

async function refreshToken() {
  const response = await fetch('/api/refresh', {
    method: 'POST',
    headers: { Authorization: `Bearer ${getRefreshToken()}` }
  })
  
  if (response.ok) {
    const { accessToken } = await response.json()
    setAccessToken(accessToken)
    return accessToken
  }
  
  // Token 过期，退出登录
  logout()
  return Promise.reject('Token expired')
}

async function authRequest(config) {
  if (needRefresh(config)) {
    const token = await refreshToken()
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}

// 请求拦截器
axios.interceptors.response.use(
  response => response,
  async error => {
    const { config, response } = error
    
    if (response?.status === 401 && !config._retry) {
      config._retry = true
      
      if (isRefreshing) {
        return new Promise(resolve => {
          subscribeTokenRefresh(token => {
            config.headers.Authorization = `Bearer ${token}`
            resolve(axios(config))
          })
        })
      }
      
      isRefreshing = true
      
      try {
        const token = await refreshToken()
        onTokenRefreshed(token)
        config.headers.Authorization = `Bearer ${token}`
        return axios(config)
      } catch (refreshError) {
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    return Promise.reject(error)
  }
)
```

### 方案二：并发控制
```js
let refreshPromise = null

async function refreshTokenWithLock() {
  if (refreshPromise) {
    return refreshPromise
  }
  
  refreshPromise = (async () => {
    try {
      const token = await refreshToken()
      return token
    } finally {
      refreshPromise = null
    }
  })()
  
  return refreshPromise
}

axios.interceptors.response.use(
  response => response,
  async error => {
    const { config, response } = error
    
    if (response?.status === 401) {
      await refreshTokenWithLock()
      return axios(config)
    }
    
    return Promise.reject(error)
  }
)
```

### 方案三：定时刷新
```js
// 在 Token 过期前主动刷新
let refreshTimer = null

function startTokenRefreshTimer(expiresIn) {
  // 提前 5 分钟刷新
  const refreshTime = expiresIn * 1000 - 5 * 60 * 1000
  
  refreshTimer = setTimeout(async () => {
    try {
      await refreshToken()
      const newExpires = await getTokenExpiresIn()
      startTokenRefreshTimer(newExpires)
    } catch (e) {
      logout()
    }
  }, refreshTime)
}

// 登录后
const tokenData = await login(username, password)
startTokenRefreshTimer(tokenData.expiresIn)
```

**知识点：** `双 Token` `无感刷新` `队列等待` `并发控制`

:::

### Q6: 权限缓存与实时更新

> **💀 困难 · 权限管理**

请实现权限缓存和实时更新方案。

::: details 🔍 点击查看答案与解析

#### ✅ 答案

### 权限缓存策略

```js
// 本地存储
const PERMISSION_CACHE_KEY = 'user_permissions'
const CACHE_EXPIRY = 10 * 60 * 1000 // 10 分钟

function getPermissionsFromCache() {
  const cached = localStorage.getItem(PERMISSION_CACHE_KEY)
  if (!cached) return null
  
  const { permissions, timestamp } = JSON.parse(cached)
  if (Date.now() - timestamp > CACHE_EXPIRY) {
    localStorage.removeItem(PERMISSION_CACHE_KEY)
    return null
  }
  
  return permissions
}

function setPermissionsCache(permissions) {
  localStorage.setItem(PERMISSION_CACHE_KEY, JSON.stringify({
    permissions,
    timestamp: Date.now()
  }))
}

// 使用
async function loadPermissions() {
  // 1. 检查缓存
  let permissions = getPermissionsFromCache()
  
  if (!permissions) {
    // 2. 从后端获取
    permissions = await fetch('/api/user/permissions')
    setPermissionsCache(permissions)
  }
  
  return permissions
}
```

### WebSocket 实时更新
```jsx
function PermissionUpdater() {
  const setPermissions = useUserStore(state => state.setPermissions)
  const wsRef = useRef(null)
  
  useEffect(() => {
    wsRef.current = new WebSocket('/ws/permissions')
    
    wsRef.current.onmessage = (event) => {
      const { type, permissions } = JSON.parse(event.data)
      
      if (type === 'permission_update') {
        setPermissions(permissions)
      }
    }
    
    wsRef.current.onclose = () => {
      // 重连
      setTimeout(() => {
        wsRef.current.reconnect()
      }, 3000)
    }
    
    return () => wsRef.current.close()
  }, [])
  
  return null
}
```

### 权限变更广播
```jsx
// 权限变更通知
function usePermissionSync() {
  const permissions = useUserStore(state => state.permissions)
  
  // 监听 storage 事件（多标签页同步）
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'permissions_update') {
        const newPermissions = JSON.parse(e.newValue)
        useUserStore.getState().setPermissions(newPermissions)
      }
    }
    
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])
  
  // 更新时广播
  const updatePermissions = useCallback((newPermissions) => {
    localStorage.setItem('permissions_update', JSON.stringify(newPermissions))
    window.dispatchEvent(new Event('storage'))
  }, [])
  
  return { permissions, updatePermissions }
}
```

### 权限降级策略
```jsx
// 优雅降级
async function checkPermission(permission) {
  const permissions = useUserStore.getState().permissions
  
  if (permissions.includes(permission)) {
    return true
  }
  
  // 检查后备权限
  const fallbacks = getFallbackPermissions(permission)
  for (const fallback of fallbacks) {
    if (permissions.includes(fallback)) {
      return true
    }
  }
  
  return false
}

// 权限继承关系
const permissionHierarchy = {
  'user:delete': ['user:manage'],
  'user:edit': ['user:create', 'user:manage'],
  'post:*': ['admin:*']
}

function hasPermission(userPermissions, required) {
  if (userPermissions.includes(required)) return true
  
  // 检查父级权限
  const wildcards = permissionHierarchy[required] || []
  return wildcards.some(p => userPermissions.some(up => up.includes(p)))
}
```

**知识点：** `权限缓存` `WebSocket` `实时更新` `多标签页同步` `降级策略`

:::---

### Q7: 前端权限控制的常见模型？

> **🔥 中等 · 架构**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**常见权限模型：**

**1. RBAC（Role-Based Access Control，基于角色的访问控制）**

```javascript
// 角色定义
const roles = {
  ADMIN: {
    permissions: ['view', 'edit', 'delete', 'manage_users']
  },
  EDITOR: {
    permissions: ['view', 'edit']
  },
  VIEWER: {
    permissions: ['view']
  }
}

// 用户拥有角色
const user = {
  id: 1,
  roles: ['EDITOR']
}

// 权限检查
function hasPermission(user, permission) {
  return user.roles.some(role => 
    roles[role]?.permissions.includes(permission)
  )
}

// 使用
if (hasPermission(user, 'edit')) {
  // 显示编辑按钮
}
```

**2. ABAC（Attribute-Based Access Control，基于属性的访问控制）**

```javascript
// 基于多个属性动态判断
const policy = {
  effect: 'allow',
  conditions: {
    subject: { department: 'engineering' },
    action: { type: ['read', 'write'] },
    resource: { type: 'document' },
    environment: { time: { between: ['09:00', '18:00'] } }
  }
}

function checkAccess(request) {
  const { user, action, resource, environment } = request
  
  return (
    user.department === 'engineering' &&
    ['read', 'write'].includes(action.type) &&
    resource.type === 'document' &&
    isWithinBusinessHours(environment.time)
  )
}

// 使用
const hasAccess = checkAccess({
  user: { department: 'engineering' },
  action: { type: 'write' },
  resource: { type: 'document' },
  environment: { time: '10:00' }
})
```

**3. ACL（Access Control List，访问控制列表）**

```javascript
// 资源级别的权限控制
const resources = {
  'doc:123': {
    owner: 'user:1',
    acl: [
      { user: 'user:1', permissions: ['read', 'write', 'delete'] },
      { user: 'user:2', permissions: ['read'] },
      { role: 'editor', permissions: ['read', 'write'] }
    ]
  }
}

function checkPermission(resourceId, userId, permission) {
  const resource = resources[resourceId]
  if (!resource) return false
  
  // 检查所有者
  if (resource.owner === userId) return true
  
  // 检查 ACL
  const entry = resource.acl.find(
    e => e.user === userId && e.permissions.includes(permission)
  )
  
  return !!entry
}
```

**模型对比：**

| 模型 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| RBAC | 简单直观、易管理 | 粒度较粗 | 企业内部系统 |
| ABAC | 灵活、细粒度 | 策略复杂 | 复杂业务规则 |
| ACL | 资源级别控制 | 管理成本高 | 文档/资源管理系统 |

**知识点：** `RBAC` `ABAC` `ACL` `权限模型` `访问控制`

:::

---

### Q8: 按钮级权限控制的实现方案？

> **🔥 中等 · 架构**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**方案一：指令方式（Vue）**

```vue
<!-- v-permission 指令 -->
<script>
export default {
  directives: {
    permission: {
      mounted(el, binding) {
        const { value } = binding
        const permissions = usePermissionStore().permissions
        
        if (value && !permissions.includes(value)) {
          el.parentNode?.removeChild(el)
        }
      }
    }
  }
}
</script>

<template>
  <button v-permission="'user:edit'">编辑</button>
  <button v-permission="'user:delete'">删除</button>
</template>
```

**方案二：HOC 方式（React Class）**

```jsx
function withPermission(WrappedComponent, requiredPermission) {
  return function PermissionWrapper(props) {
    const permissions = usePermissionStore(s => s.permissions)
    
    if (!permissions.includes(requiredPermission)) {
      return null
    }
    
    return <WrappedComponent {...props} />
  }
}

// 使用
const DeleteButton = withPermission(Button, 'user:delete')

function UserList() {
  return (
    <>
      <Button />
      <DeleteButton onClick={handleDelete}>删除</DeleteButton>
    </>
  )
}
```

**方案三：自定义 Hook（React）**

```jsx
function usePermission(permission) {
  const permissions = usePermissionStore(s => s.permissions)
  return permissions.includes(permission)
}

// Permission 组件
function Permission({ permission, children, fallback = null }) {
  const hasPermission = usePermission(permission)
  
  if (!hasPermission) {
    return fallback
  }
  
  return children
}

// 使用
function UserActions() {
  return (
    <div>
      <Permission permission="user:edit">
        <button>编辑</button>
      </Permission>
      <Permission 
        permission="user:delete"
        fallback={<button disabled>删除（无权限）</button>}
      >
        <button>删除</button>
      </Permission>
    </div>
  )
}
```

**方案四：权限包装组件**

```jsx
// AuthButton 组件
function AuthButton({ permission, ...props }) {
  const hasPermission = usePermission(permission)
  
  if (!hasPermission) {
    return null
  }
  
  return <Button {...props} />
}

// AuthFragment
function AuthFragment({ permissions, children }) {
  const hasAll = useHasAllPermissions(permissions)
  
  if (!hasAll) {
    return null
  }
  
  return children
}

// 使用
<AuthButton permission="user:edit">编辑用户</AuthButton>

<AuthFragment permissions={['user:view', 'user:edit']}>
  <div>
    <UserInfo />
    <EditButton />
  </div>
</AuthFragment>
```

**知识点：** `按钮权限` `权限指令` `HOC` `Custom Hook` `权限组件`

:::

---

### Q9: 动态路由权限的设计方案？

> **🔥 中等 · 架构**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. 后端返回菜单结构**

```javascript
// 后端返回路由配置
const menuRoutes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: 'DashboardView',
    meta: { title: '仪表盘', icon: 'dashboard' }
  },
  {
    path: '/user',
    name: 'User',
    meta: { title: '用户管理', icon: 'user' },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: 'UserListView',
        meta: { title: '用户列表' }
      },
      {
        path: 'role',
        name: 'Role',
        component: 'RoleView',
        meta: { title: '角色管理' }
      }
    ]
  }
]
```

**2. 动态注册路由**

```javascript
// Vue Router 3.x
import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/login', component: LoginView },
    { path: '/', redirect: '/dashboard' }
  ]
})

// 获取用户路由后动态添加
async function generateRoutes() {
  const menuRoutes = await fetchUserMenus()
  
  menuRoutes.forEach(route => {
    const component = resolveComponent(route.component)
    router.addRoute('app', {
      ...route,
      component
    })
  })
}

// Vue Router 4.x
async function setupDynamicRoutes() {
  const menuRoutes = await fetchUserMenus()
  
  menuRoutes.forEach(route => {
    router.addRoute({
      ...route,
      component: () => import(`@/views/${route.component}.vue`)
    })
  })
}
```

**3. 路由守卫**

```javascript
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (!token && to.path !== '/login') {
    next('/login')
    return
  }
  
  if (token && to.path === '/login') {
    next('/')
    return
  }
  
  // 检查路由权限
  const hasPermission = checkRoutePermission(to.path)
  if (!hasPermission) {
    next('/403')
    return
  }
  
  next()
})

// 检查路由权限
function checkRoutePermission(path) {
  const routes = router.getRoutes()
  const route = routes.find(r => r.path === path)
  
  if (!route) return false
  
  const requiredPermissions = route.meta?.permissions
  if (!requiredPermissions) return true
  
  const userPermissions = getUserPermissions()
  return requiredPermissions.every(p => userPermissions.includes(p))
}
```

**4. 菜单生成**

```vue
<script setup>
const menus = ref([])

onMounted(async () => {
  const userMenus = await fetchUserMenus()
  menus.value = filterMenusByPermission(userMenus)
})

function filterMenusByPermission(menus) {
  return menus.filter(menu => {
    const hasPermission = checkPermission(menu.permission)
    if (menu.children) {
      menu.children = filterMenusByPermission(menu.children)
    }
    return hasPermission
  })
}
</script>

<template>
  <el-menu>
    <el-sub-menu v-for="menu in menus" :key="menu.path">
      <el-menu-item v-for="child in menu.children" :key="child.path">
        {{ child.title }}
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>
```

**5. 完整流程：**

1. 用户登录获取 token
2. 获取用户信息和权限
3. 后端返回可访问路由
4. 动态注册路由
5. 生成菜单
6. 路由守卫校验

**知识点：** `动态路由` `路由守卫` `权限控制` `菜单生成`

:::

---

### Q10: 前端权限控制的安全性考量？能否完全依赖前端？

> **🔥 中等 · 安全**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**前端权限的安全性：**

**1. 前端权限的本质**

前端权限控制的主要目的是**用户体验**，而不是安全防护。

```javascript
// ❌ 错误：只依赖前端权限检查
function deleteResource(id) {
  if (user.hasPermission('delete')) {
    // 直接在前端检查，后端没有验证
    fetch(`/api/resource/${id}`, { method: 'DELETE' })
  }
}

// ✅ 正确：后端验证
async function deleteResource(id) {
  // 前端只显示/隐藏按钮
  const response = await fetch(`/api/resource/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  
  // 后端验证权限
  if (response.status === 403) {
    alert('无权操作')
  }
}
```

**2. 前端可以做什么：**

- 根据权限显示/隐藏菜单和按钮
- 禁用无权操作的功能
- 提升用户体验
- 防止普通用户误操作

**3. 前端无法防止什么：**

```javascript
// 危险：用户可以绕过前端检查
// 1. 直接调用 API
fetch('/api/admin/delete-user', { method: 'POST' })

// 2. 修改浏览器代码
// localStorage.permissions = JSON.stringify(['admin'])

// 3. 使用 Postman/curl
curl -X POST /api/admin/delete-user -H "Authorization: Bearer token"

// 4. 重放请求
// 获取到的权限校验响应可以重放
```

**4. 正确的权限架构：**

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  前端展示   │ -> │  前端 API 请求 │ -> │  后端验证    │
│  根据权限   │    │  带凭证      │    │  鉴权+授权   │
│  隐藏功能   │    │              │    │  业务逻辑   │
└─────────────┘    └──────────────┘    └──────────────┘
                        ↓
                  ┌──────────────┐
                  │  数据库操作   │
                  │  审计日志    │
                  └──────────────┘
```

**5. 最佳实践：**

```javascript
// 前端 - UI 层面的权限控制
function UserList() {
  const { permissions } = useAuth()
  
  return (
    <>
      {permissions.includes('user:view') && (
        <Table data={users} />
      )}
      
      {permissions.includes('user:edit') && (
        <Button onClick={handleEdit}>编辑</Button>
      )}
      
      {permissions.includes('user:delete') && (
        <Button onClick={handleDelete} danger>删除</Button>
      )}
    </>
  )
}

// 后端 - 业务层面的权限验证
@PreAuthorize("hasAuthority('user:delete')")
@DeleteMapping("/users/{id}")
public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
  // JWT 解析用户 -> 检查权限 -> 执行删除
  userService.delete(id)
  return ResponseEntity.ok().build()
}
```

**6. 前端权限被绕过的案例：**

- 直接请求接口
- 修改 localStorage/cookie
- 抓包重放
- 浏览器控制台修改状态
- 使用其他客户端

**结论：**

**前端权限不能替代后端验证！** 前端权限只是用来优化用户体验的，真正的安全校验必须在后端完成。

**知识点：** `前端权限` `安全性` `后端验证` `权限绕过的风险`

:::

---