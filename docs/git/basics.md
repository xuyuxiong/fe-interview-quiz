### Q1: 常用的 Git 命令有哪些？

> **⭐ 简单 · git/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**基础命令：**
- `git init` - 初始化仓库
- `git clone <url>` - 克隆仓库
- `git status` - 查看状态
- `git add <file>` - 添加文件
- `git commit -m "msg"` - 提交
- `git push` - 推送
- `git pull` - 拉取
- `git branch` - 分支
- `git checkout` / `git switch` - 切换
- `git merge` - 合并
- `git log` - 查看历史

**知识点：**`Git` `常用命令` `基础操作`

:::

### Q2: git rebase 和 git merge 的区别？

> **🔥 中等 · git/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 对比项 | merge | rebase |
|--------|-------|--------|
| 提交历史 | 保留完整分支历史 | 线性历史 |
| 提交节点 | 创建合并提交 | 变基重写 |
| 适用场景 | 公共分支 | 本地分支整理 |

**merge 保留真实历史：**
```
A---B---C master
     \
      D---E feature

git merge feature:

A---B---C---F master
     \     /
      D---E feature
```

**rebase 线性历史：**
```
A---B---C---D'---E' master (rebase 后)
     \
      D---E feature
```

**注意：** 不要对公共分支 rebase

**知识点：**`git rebase` `git merge` `变基` `合并`

:::

### Q3: 代码回滚：revert 和 reset 的区别？

> **🔥 中等 · git/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 对比项 | revert | reset |
|--------|--------|-------|
| 原理 | 创建新提交撤销变更 | 移动 HEAD 指针 |
| 历史记录 | 保留 | 删除 |
| 安全性 | 安全（公共分支可用） | 危险（会丢失提交） |
| 场景 | 撤销已推送的提交 | 撤销本地提交 |

**使用示例：**
```bash
# revert 撤销某个提交（保留历史）
git revert HEAD~1

# reset 退回某个版本（不保留）
git reset --hard HEAD~1

# reset 保留修改
git reset --soft HEAD~1
```

**知识点：**`git revert` `git reset` `代码回滚`

:::

### Q4: 如何解决代码冲突？

> **🔥 中等 · git/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**冲突产生：** 多人修改同一文件同一位置

**解决步骤：**
1. `git status` 查看冲突文件
2. 打开文件，找到冲突标记
3. 编辑保留需要的代码
4. `git add <file>` 标记解决
5. `git commit` 完成合并

**冲突标记：**
```git
<<<<<<< HEAD
当前分支代码
=======
合并分支代码
>>>>>>> feature
```

**预防：** 经常 pull 更新，小步提交

**知识点：**`代码冲突` `Git 合并` `冲突解决`

:::

### Q5: git submodule 是什么？如何使用？

> **🔥 中等 · git/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**submodule 用于在仓库中嵌入其他仓库。**

**使用场景：** 依赖子项目、多仓库协作

**常用命令：**
```bash
# 添加子模块
git submodule add <url> path/to/submodule

# 克隆包含子模块的仓库
git clone --recursive <url>

# 更新子模块
git submodule update --init --recursive

# 删除子模块
git submodule deinit path/to/submodule
```

**知识点：**`git submodule` `子模块` `多仓库`

:::

### Q6: 如何修改最近的 commit 信息？

> **⭐ 简单 · git/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```bash
# 修改最后一次提交信息
git commit --amend -m "新的提交信息"

# 修改提交内容（追加文件）
git add <新增文件>
git commit --amend --no-edit
```

**注意：** 已推送的提交不要 amend

**知识点：**`git commit --amend` `修改提交`

:::

### Q7: pre-commit 和 commit-msg 钩子的区别？

> **🔥 中等 · git/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 钩子 | 触发时机 | 用途 |
|------|----------|------|
| pre-commit | commit 前 | 代码检查、格式化 |
| commit-msg | 提交信息输入后 | 验证提交信息格式 |

**示例：**
```bash
# .git/hooks/pre-commit
#!/bin/bash
npm run lint  # 检查不通过则阻止提交

# .git/hooks/commit-msg
#!/bin/bash
# 验证提交信息规范
if ! grep -q "^feat\|^fix\|^docs" "$1"; then
  echo "提交信息格式错误"
  exit 1
fi
```

**知识点：**`Git Hook` `pre-commit` `commit-msg`

:::

### Q8: Git Hook 的设计原理？

> **💀 困难 · git/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Git Hook 是 Git 内置的事件驱动机制。**

**工作原理：**
1. 特定 Git 操作触发钩子事件
2. 执行 `.git/hooks/` 下对应脚本
3. 脚本返回非 0 则中断操作

**钩子类型：**
- 客户端：pre-commit, commit-msg, post-commit
- 服务端：pre-receive, post-receive

**应用：** 代码检查、提交规范、CI/CD

**知识点：**`Git Hook` `设计原理` `事件驱动`

:::

### Q9: 常用的 Git Hook 有哪些？

> **⭐ 简单 · git/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**客户端钩子：**
- `pre-commit` - 提交前检查
- `commit-msg` - 验证提交信息
- `post-commit` - 提交后通知
- `pre-push` - 推送前检查

**服务端钩子：**
- `pre-receive` - 接收前验证
- `post-receive` - 接收后触发 CI

**工具：** Husky, pre-commit

**知识点：**`Git Hook` `常用钩子`

:::

### Q10: 如何用 commit 信息关联 GitHub issues？

> **⭐ 简单 · git/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**提交信息中引用 issue 编号：**
```bash
git commit -m "fix: 修复登录问题

Closes #123
Fixes #456"
```

**GitHub 自动关闭 issue 的关键词：**
- `closes #123`
- `fixes #123`
- `resolves #123`

**知识点：**`commit 信息` `GitHub` `issue 关联`

:::

### Q11: git stash 的使用场景

> **⭐ 简单 · git/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**stash 临时保存未提交的工作。**

**使用场景：** 切换分支前保存现场

**命令：**
```bash
git stash          # 暂存
git stash list     # 列表
git stash pop      # 恢复并删除
git stash apply    # 恢复不删除
git stash drop     # 删除
```

**知识点：**`git stash` `暂存` `分支切换`

:::

### Q12: Git 大文件处理 (git lfs)

> **🔥 中等 · git/basics**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Git LFS 管理大文件，只存储指针。**

**使用：**
```bash
git lfs install
git lfs track "*.psd"
git add .gitattributes
git add file.psd
git commit -m "add large file"
```

**知识点：**`Git LFS` `大文件` `扩展`

:::

 details 🔍 点击查看答案与解析

#### ✅ 答案

**设计通用 Git Hook 方案的核心要点：**

**1. 使用 husky 管理 Hook：**

```json
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint .",
    "test": "vitest run"
  },
  "devDependencies": {
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "commitlint": "^19.0.0",
    "commitizen": "^4.3.0",
    "@commitlint/config-conventional": "^19.0.0"
  },
  "lint-staged": {
    "*.{js,ts,jsx,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,md,json}": ["prettier --write"]
  }
}
```

**2. 配置 commitlint：**

```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'revert']
    ],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never']
  }
};
```

**3. 创建 Husky hooks：**

```bash
# 初始化 husky
npx husky init

# 添加 pre-commit hook（会自动添加到 package.json prepare 脚本）
npx husky add .husky/pre-commit 'npx lint-staged'

# 添加 commit-msg hook
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit $1'

# 添加 pre-push hook
npx husky add .husky/pre-push 'npm run test'
```

**4. 配置 commitizen（可选，规范化提交）：**

```javascript
// .czrc
{
  "path": "cz-conventional-changelog"
}

// 使用
npx cz
# 或
npm run commit
```

**5. 目录结构：**

```
project/
├── .husky/
│   ├── pre-commit      # lint-staged
│   ├── commit-msg      # commitlint
│   └── pre-push        # 运行测试
├── package.json
└── commitlint.config.js
```

**知识点：** `Git Hook` `husky` `commitlint` `commitizen` `lint-staged`

:::
