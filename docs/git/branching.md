---
title: 分支策略与协作
description: Git分支策略面试题，覆盖merge vs rebase、分支模型、冲突解决、cherry-pick、fork vs clone等核心考点
---

# 分支策略与协作

---

> **🔥 中等 · merge vs rebase**

### Q1: `git merge` 和 `git rebase` 的区别是什么？各自适用什么场景？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 对比项 | git merge | git rebase |
|--------|-----------|------------|
| 历史记录 | 保留完整分支历史（非线性） | 产生线性历史 |
| 提交数 | 多一个 merge commit | 不增加额外 commit |
| 冲突处理 | 一次性解决所有冲突 | 逐 commit 解决冲突 |
| 安全性 | 安全（不改写历史） | 危险（改写历史） |
| 回滚 | revert merge commit | reset 到 rebase 前 |

**merge 示例：**
```
main:    A---B---C---M (merge commit)
              \       /
feature:       D---E
```

**rebase 示例：**
```
main:    A---B---C
feature:          D'---E' (rebase 后，仿佛一直在 main 后开发)
```

**核心原则：**
- ✅ **公共分支用 merge**：main/develop 等共享分支绝不要 rebase
- ✅ **私有分支用 rebase**：feature 分支在合并前可以 rebase 保持线性
- ❌ **黄金法则**：**不要对已推送到远程的 commit 做 rebase！**

```bash
# feature 分支开发中，保持与 main 同步
git checkout feature
git rebase main     # 或 git pull --rebase origin main

# feature 开发完成，合并到 main
git checkout main
git merge feature   # 用 merge 合并（保留 feature 历史）
# 或
git merge --squash feature  # 压缩为单个 commit
```

**知识点：** `merge` `rebase` `线性历史` `黄金法则`

:::

---

> **🔥 中等 · 分支模型**

### Q2: 常见的 Git 分支模型有哪些？各适合什么团队规模？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**1. Git Flow**
```
main ──────────────────────────── (生产版本)
  \                                 /
develop ─────────────────┬────M────
  \        \            /    /
feature/1  feature/2   /    /
  \          /        /    /
   ───────────────────────/ release/1.0
                         \
hotfix/0.1 ──────────────────── (紧急修复)
```

| 分支 | 用途 | 生命周期 |
|------|------|----------|
| main | 生产代码 | 永久 |
| develop | 开发集成分支 | 永久 |
| feature/* | 功能开发 | 临时 |
| release/* | 发版准备 | 临时 |
| hotfix/* | 线上紧急修复 | 临时 |

**适合：** 有明确版本发布周期的项目（App、桌面软件）

**2. GitHub Flow（简化版）**
```
main ────M─────M─────M───
  \      /       \    /
feature/1    feature/2
```

- 只有 main + feature 分支
- feature 完成后 PR 合并到 main
- main 随时可部署

**适合：** 持续部署的 Web 项目、小团队

**3. GitLab Flow（环境分支）**
```
main ──M───M──
  \     \    \
staging──M────M──
  \            \
production─────M──
```

- main → staging → production 逐级推进
- 结合环境部署流程

**适合：** 需要多环境验证的中型团队

**选型建议：**

| 团队规模 | 推荐模型 | 原因 |
|----------|----------|------|
| 1-3 人 | GitHub Flow | 简单高效 |
| 4-20 人 | GitLab Flow | 平衡复杂度和流程 |
| 20+ 人 | Git Flow | 严格流程，并行开发 |

**知识点：** `Git Flow` `GitHub Flow` `GitLab Flow` `分支策略`

:::

---

> **🔥 中等 · cherry-pick**

### Q3: `git cherry-pick` 的作用是什么？适用什么场景？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

`cherry-pick`：将**指定的 commit** 应用到当前分支，而不是合并整个分支。

```bash
# 基本用法
git cherry-pick abc123          # 将 abc123 应用到当前分支
git cherry-pick abc123 def456   # 多个 commit

# 冲突处理
git cherry-pick --continue      # 解决冲突后继续
git cherry-pick --abort         # 放弃 cherry-pick
git cherry-pick --skip          # 跳过当前 commit

# 只取修改但不提交
git cherry-pick -n abc123       # 修改到暂存区，不自动 commit
```

**典型场景：**

**1. 热修复回移：**
```bash
# 在 hotfix 分支修复了 bug
git checkout hotfix/login-bug
git commit -m "fix: 修复登录bug"

# 将修复应用到 main
git checkout main
git cherry-pick <commit-hash>

# 也应用到 develop
git checkout develop
git cherry-pick <commit-hash>
```

**2. 选择性合并：**
```bash
# feature 分支有 10 个 commit，只要其中 3 个
git checkout release
git cherry-pick abc123 def456 ghi789
```

**注意事项：**
- cherry-pick 会创建新的 commit（不同 hash）
- 同一修改被 cherry-pick 可能导致后续 merge 冲突
- 大量 cherry-pick 时考虑是否应该用 merge

**知识点：** `cherry-pick` `热修复` `选择性合并`

:::

---

> **💀 困难 · rebase 冲突**

### Q4: rebase 过程中遇到冲突如何处理？和 merge 冲突有什么不同？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心区别：** merge 冲突一次性解决，rebase 冲突逐 commit 解决。

```bash
# rebase 过程中的冲突处理
git rebase main

# 如果有冲突，Git 会暂停并提示
# 1. 手动解决冲突文件
# 2. 标记为已解决
git add <resolved-file>

# 3. 继续 rebase
git rebase --continue

# 可能又遇到下一个冲突...重复 1-3

# 如果想放弃
git rebase --abort

# 如果想跳过当前 commit
git rebase --skip
```

**rebase 冲突的特点：**
- 每个 commit 可能单独产生冲突
- 如果 feature 分支有 10 个 commit，最多可能需解决 10 次冲突
- 解决后面 commit 的冲突时，要注意不要重复解决前面已处理的

**减少 rebase 冲突的方法：**

```bash
# 1. 在 rebase 前先交互式整理 commit
git rebase -i HEAD~5   # squash 相关 commit，减少冲突次数

# 2. 频繁从 main 同步
git pull --rebase origin main  # 每天同步一次

# 3. 如果冲突太多，改用 merge
git rebase --abort
git merge main  # 一次性解决
```

**知识点：** `rebase冲突` `--continue` `--abort` `交互式rebase`

:::

---

> **🔥 中等 · fork vs clone**

### Q5: Fork 和 Clone 的区别是什么？开源贡献的标准流程？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

| 对比项 | Fork | Clone |
|--------|------|-------|
| 操作位置 | GitHub/GitLab 服务器 | 本地 |
| 作用 | 在自己的账号下创建仓库副本 | 下载仓库到本地 |
| 权限 | 不需要原仓库写权限 | 需要读权限 |
| 目的 | 贡献代码到别人的项目 | 获取代码到本地开发 |

**开源贡献完整流程：**

```bash
# 1. Fork（在 GitHub 上操作）
# 在原仓库页面点击 Fork 按钮

# 2. Clone 自己的 fork
git clone https://github.com/YOUR-NAME/project.git
cd project

# 3. 添加上游仓库
git remote add upstream https://github.com/ORIGINAL/project.git

# 4. 创建功能分支
git checkout -b feature/my-feature

# 5. 开发并提交
git add .
git commit -m "feat: add new feature"

# 6. 推送到自己的 fork
git push origin feature/my-feature

# 7. 在 GitHub 上创建 Pull Request

# 8. 保持与上游同步
git fetch upstream
git rebase upstream/main
git push origin feature/my-feature --force  # rebase 后需要 force push
```

**知识点：** `fork` `clone` `upstream` `PR流程`

:::

---

> **🔥 中等 · 交互式 rebase**

### Q6: `git rebase -i` 有哪些操作？如何整理提交历史？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```bash
# 整理最近 5 个 commit
git rebase -i HEAD~5
```

打开编辑器显示：
```
pick abc1234 feat: 添加登录页面
pick def5678 fix: 修复按钮样式
pick ghi9012 feat: 添加注册页面
pick jkl3456 chore: 修改注释
pick mno7890 feat: 添加忘记密码
```

**可用操作：**

| 操作 | 缩写 | 作用 |
|------|------|------|
| pick | p | 保留该 commit |
| reword | r | 保留，但修改 commit 消息 |
| edit | e | 保留，但暂停修改内容 |
| squash | s | 合并到前一个 commit |
| fixup | f | 合并到前一个，丢弃消息 |
| drop | d | 丢弃该 commit |
| reorder | — | 调整 commit 顺序（直接移动行） |

**典型用法：**
```
pick abc1234 feat: 添加登录页面
squash def5678 fix: 修复按钮样式     # 合并到登录页面
pick ghi9012 feat: 添加注册页面
fixup jkl3456 chore: 修改注释       # 合并到注册页面，丢弃消息
pick mno7890 feat: 添加忘记密码
```

**注意事项：**
- 不要对已推送的 commit 执行 rebase -i
- squash 时 commit 消息可以编辑
- drop 删除 commit 可能产生冲突

**知识点：** `交互式rebase` `squash` `fixup` `历史整理`

:::

---

> **💀 困难 · 大型团队协作**

### Q7: 大型前端团队如何管理 Git 协作？如何处理多团队并行开发？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**分支命名规范：**
```
feature/JIRA-1234-login-page
bugfix/JIRA-5678-fix-crash
hotfix/JIRA-9999-security-patch
release/v2.1.0
```

**Commit 消息规范（Conventional Commits）：**
```
feat: 添加用户登录功能
fix: 修复登录页面样式错乱
docs: 更新 API 文档
chore: 升级 webpack 到 v5
refactor: 重构登录逻辑
test: 添加登录单元测试
ci: 修改 CI 配置
```

**多团队并行开发策略：**

```
main (保护分支)
  │
  ├── develop (集成分支)
  │     ├── team-a/feature-x
  │     ├── team-b/feature-y
  │     └── team-c/feature-z
  │
  └── release/v2.0 (发版分支)
```

**分支保护规则：**
- main/develop 禁止直接 push
- 必须通过 PR/MR 合并
- PR 至少 2 人 Code Review
- CI 全部通过才能合并
- 禁止 force push

**PR 最佳实践：**
- 一个 PR 只做一件事（100-400 行为宜）
- PR 描述模板：背景/变更/测试/截图
- 小 PR 更容易 Review，减少冲突
- 合并前 rebase 或 squash

**Monorepo 下的分支策略：**
```bash
# 只在修改的包目录下触发 CI
git diff --name-only origin/main...HEAD | grep '^packages/auth/'
# PR 中只 rerun 受影响的包的 CI
```

**知识点：** `分支规范` `Conventional Commits` `PR` `Code Review` `分支保护`

:::

---

> **🔥 中等 · tag 与版本发布**

### Q8: Git Tag 如何使用？语义化版本号规范是什么？

::: details 🔍 点击查看答案与解析

#### ✅ 答案

```bash
# 轻量标签
git tag v1.0.0

# 附注标签（推荐，包含作者/日期/消息）
git tag -a v1.0.0 -m "Release version 1.0.0"

# 给历史 commit 打标签
git tag -a v0.9.0 abc123 -m "Tag previous version"

# 推送标签到远程
git push origin v1.0.0          # 推送单个标签
git push origin --tags           # 推送所有标签

# 删除标签
git tag -d v1.0.0               # 删除本地标签
git push origin --delete v1.0.0  # 删除远程标签

# 查看标签
git tag                         # 列出所有
git tag -l "v1.*"               # 模式匹配
git show v1.0.0                 # 查看标签详情
```

**语义化版本号（SemVer）：**
```
vMAJOR.MINOR.PATCH

MAJOR: 不兼容的 API 变更（1.x.x → 2.0.0）
MINOR: 向后兼容的功能新增（1.1.x → 1.2.0）
PATCH: 向后兼容的 bug 修复（1.1.0 → 1.1.1）

先行版本:
v2.0.0-alpha.1   (内测)
v2.0.0-beta.2    (公测)
v2.0.0-rc.1      (候选)
```

**知识点：** `git tag` `SemVer` `语义化版本` `附注标签`

:::