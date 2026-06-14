### Q1: Git 代码回滚的方式有哪些？revert vs reset 的区别？

> **🔥 中等 · git/advanced**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**Git 代码回滚的几种方式：**

**1. git reset - 移动 HEAD 指针**

```bash
# 软回滚 - 保留更改到暂存区
git reset --soft HEAD~1

# 混合回滚 (默认) - 保留更改到工作区
git reset --mixed HEAD~1
git reset HEAD~1  # 等价

# 硬回滚 - 丢弃所有更改
git reset --hard HEAD~1
```

**2. git revert - 创建反向提交**

```bash
# 回滚单个提交
git revert <commit-hash>

# 回滚多个提交
git revert HEAD~2..HEAD

# 回滚合并提交
git revert -m 1 <merge-commit-hash>
```

**3. git checkout - 恢复文件**

```bash
# 恢复单个文件到上一次提交
git checkout HEAD -- file.txt

# 恢复整个工作区
git checkout .
```

**revert vs reset 核心区别：**

| 对比项 | git revert | git reset |
|--------|-----------|-----------|
| **原理** | 创建新提交（反向提交） | 移动 HEAD 指针 |
| **历史记录** | 保留完整历史 | 修改/删除历史 |
| **协作安全** | ✅ 安全，可公开使用 | ⚠️ 危险，仅限本地 |
| **可追溯性** | 可追溯回滚操作 | 难以追溯 |
| **使用场景** | 团队协作、已推送的提交 | 本地提交、未推送的提交 |

**详细对比：**

```
场景：回滚 commit C

原始历史: A — B — C

【git revert C】
新历史:   A — B — C — C' (C'是 C 的反向提交)
优点：历史记录完整，别人能看到你回滚了 C
缺点：历史变长

【git reset --hard B】
新历史:   A — B
优点：历史干净
缺点：C 的提交记录丢失，如果已推送会给队友造成困扰
```

**团队协作建议：**

```bash
# ✅ 已推送的提交 - 用 revert
git revert <commit-hash>
git push

# ⚠️ 仅本地未推送 - 可用 reset
git reset --soft HEAD~1
git commit -m "修正提交信息"

# ❌ 绝对不要对已推送的提交用 reset --hard
# 会导致 teammates 的历史和你不一致
```

**实际案例：**

```bash
# 案例 1: 回滚错误的 hotfix
git log --oneline
# abc1234 HOTFIX: fix login bug
# def5678 feat: add new feature

# 发现 hotfix 有问题，回滚
git revert abc1234
# 创建新提交，撤销 hotfix 的更改

# 案例 2: 清理本地提交历史
git log --oneline
# 111aaaa wip
# 222bbbb wip
# 333ccc feat: complete feature

# 合并为一个干净的提交
git reset --soft 333ccc^
git commit -m "feat: add new feature"
```

**知识点：**`git reset` `git revert` `代码回滚` `版本控制` `团队协作` `提交历史`

:::

### Q2: Git 代码冲突如何解决？

> **⭐ 简单 · git/advanced**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**代码冲突产生的原因：**

当两个人同时修改了同一个文件的同一部分，Git 无法自动合并时就会产生冲突。

**解决步骤：**

**1. 发现冲突**

```bash
$ git merge feature-branch
Auto-merging src/app.js
CONFLICT (content): Merge conflict in src/app.js
Automatic merge failed; fix conflicts and then commit the result.
```

**2. 查看冲突文件**

```bash
# 查看哪些文件有冲突
git status

# 输出示例:
# 双方修改：src/app.js
```

**3. 打开冲突文件**

```javascript
// src/app.js 冲突标记
<<<<<<< HEAD
// 当前分支的代码
function getUser() {
  return { id: 1, name: 'Alice' };
}
=======
// 要合并的分支代码
function getUser() {
  return { id: 1, name: 'Bob', email: 'bob@example.com' };
}
>>>>>>> feature-branch
```

**4. 解决冲突（手动编辑）**

```javascript
// 解决后的代码 - 保留双方修改
function getUser() {
  return { id: 1, name: 'Alice', email: 'bob@example.com' };
}

// 删除冲突标记 <<<<<<<, =======, >>>>>>>
```

**5. 标记解决并提交**

```bash
# 添加到暂存区（标记为已解决）
git add src/app.js

# 完成合并提交
git commit -m "Merge feature-branch, resolve conflicts"
```

**使用工具辅助：**

**1. mergetool**
```bash
# 配置合并工具
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd "code --wait $MERGED"

# 启动合并工具
git mergetool
```

**2. IDE 内置工具**
- VS Code: 显示冲突区域，点击 "Accept Current/Incoming/Both"
- WebStorm: 三栏对比，选择保留的更改
- GitHub Desktop: 可视化解决界面

**3. 命令行策略**

```bash
# 完全采用当前分支
git checkout --ours src/app.js

# 完全采用合并分支
git checkout --theirs src/app.js

# 使用 diff3 显示共同祖先
git config merge.conflictstyle diff3
```

**预防冲突的最佳实践：**

1. ✅ **频繁同步主分支**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. ✅ **小步提交** - 减少单次提交的改动范围

3. ✅ **及时沟通** - 同文件修改前先和队友沟通

4. ✅ **Code Review** - 及早发现潜在冲突

5. ✅ **模块化设计** - 减少文件级别的冲突

**知识点：**`代码冲突` `git merge` `冲突标记` `mergetool` `版本控制` `团队协作`

:::### Q3: Git Hook 在项目中有什么作用？

> **🔥 中等 · Git**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

Git Hook 是 Git 在特定事件发生时自动执行的脚本，用于自动化代码质量和工作流管理。

常用钩子：

| 钩子 | 触发时机 | 用途 |
|------|---------|------|
| pre-commit | commit前 | lint、格式化 |
| commit-msg | 编辑commit消息后 | 校验commit格式 |
| pre-push | push前 | 运行测试 |
| post-merge | pull后 | 自动npm install |
| post-checkout | 切换分支后 | 切换依赖版本 |

```json
// package.json - husky + lint-staged 配置
{
  "lint-staged": {
    "*.{js,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss}": ["stylelint --fix"]
  }
}
```

```bash
# husky 配置
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/commit-msg "npx commitlint --edit $1"
npx husky add .husky/pre-push "npm test"
```

```js
// commitlint.config.js - commit规范
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', ['feat','fix','docs','style','refactor','test','chore','ci']]
  }
}
// 合法: git commit -m "feat: 新增用户登录功能"
// 非法: git commit -m "新增登录功能"
```

完整Git Hook工作流：

git commit → pre-commit → lint-staged(格式化+lint)
         → commit-msg → commitlint(消息格式校验)
         → 通过 → 提交成功 / 失败 → 阻止提交

git push → pre-push → npm test
       → 通过 → 推送成功 / 失败 → 阻止推送

紧急跳过：`git commit --no-verify` / `git push --no-verify`

**知识点：** `Git Hook` `husky` `lint-staged` `commitlint` `pre-commit` `自动化`

:::
### Q4: 如何设计一个通用的 Git Hook 方案？

> **🔥 中等 · Git**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

通用Git Hook方案 = husky + lint-staged + commitlint + commitizen

**整体架构：**

```text
代码提交流程：
编辑代码 → git add → git commit
                         ↓
                    pre-commit
                    ├─ lint-staged (eslint + prettier)
                    └─ 类型检查 (tsc --noEmit)
                         ↓
                    commit-msg
                    └─ commitlint (校验格式)
                         ↓
                    commit 成功
                         ↓
                    git push
                         ↓
                    pre-push
                    └─ npm test (单元测试)
```

**1. 初始化husky：**

```bash
npm install husky -D
npm install lint-staged -D
npx husky init
```

**2. 配置lint-staged（只检查暂存区文件）：**

```json
// package.json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{css,scss,less}": ["stylelint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"],
    "*.vue": ["eslint --fix", "stylelint --fix", "prettier --write"]
  }
}
```

**3. 配置commitlint（commit格式）：**

```js
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor',
      'perf', 'test', 'build', 'ci', 'chore', 'revert'
    ]],
    'subject-max-length': [2, 'always', 100]
  }
}
```

**4. 配置commitizen（交互式commit）：**

```bash
npm install commitizen cz-conventional-changelog -D
npx commitizen init cz-conventional-changelog --save-dev --save-exact
```

```json
// package.json
{
  "scripts": {
    "commit": "cz"
  }
}
```

```text
交互式commit流程：
npx cz 或 npm run commit
  ? Select the type of change: feat
  ? What is the scope of this change: user
  ? Write a short description: 新增登录功能
  → 自动生成: feat(user): 新增登录功能
```

**5. 多项目复用（提取为脚手架模板）：**

```text
shared-hooks/
├── commitlint.config.js
├── .lintstagedrc.json
├── .prettierrc
├── .eslintrc.js
└── package.json (dependencies声明)

新项目只需：
npx create-frontend-app my-project --with-hooks
```

| 工具 | 作用 | 安装 |
|------|------|------|
| husky | Git Hook管理 | npm i husky -D |
| lint-staged | 只lint暂存文件 | npm i lint-staged -D |
| commitlint | 校验commit格式 | npm i @commitlint/cli @commitlint/config-conventional -D |
| commitizen | 交互式commit | npm i commitizen cz-conventional-changelog -D |

**知识点：** `Git Hook方案` `husky` `lint-staged` `commitlint` `commitizen` `代码规范`

:::

### Q4: git rebase 和 git merge 的区别？

> **🔥 中等 · Git**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**核心区别：**

```
git merge：保留完整历史，创建合并提交
git rebase：重写历史，保持线性提交
```

**图示对比：**

```
初始状态:
      A---B (feature)
     /
c---d---e (main)

git merge feature:
      A---B
     /     \
c---d---e---M (main)
            ↑ 合并提交

git rebase feature:
                A'--B' (feature)
               /
c---d---e (main)
↑ 提交被"变基"到 main 之上
```

**merge 操作：**

```bash
# 1. 切换到主分支
git checkout main

# 2. 合并 feature 分支
git merge feature

# 结果：保留两个分支的完整历史，创建合并节点
```

**rebase 操作：**

```bash
# 1. 切换到 feature 分支
git checkout feature

# 2. 变基到 main
git rebase main

# 或压缩提交
git rebase -i HEAD~3

# 3. 快进合并（可选）
git checkout main
git merge feature  # 快进，无合并提交
```

**使用场景：**

| 场景 | 推荐 | 原因 |
|------|------|------|
| 公共分支 | merge | 保留真实历史 |
| 个人特性分支 | rebase | 历史更清晰 |
| 合并到 main | rebase + merge | 线性历史 |
| 修复旧提交 | rebase -i | 修改提交历史 |

**交互式 rebase：**

```bash
# 改写最近 3 次提交
git rebase -i HEAD~3

# 编辑器打开，可选择：
# pick   - 保留提交
# reword - 修改提交信息
# edit   - 暂停修改
# squash - 合并到上一个提交
# fixup  - 合并（丢弃提交信息）
# drop   - 删除提交
```

**注意事项：**

```
⚠️ 不要对已推送的公共分支 rebase
⚠️ rebase 会改变提交 hash
✅ 只在本地私有分支使用 rebase
```

**知识点：** `git rebase` `git merge` `提交历史` `变基` `交互式 rebase`

:::

### Q5: git cherry-pick 是什么？使用场景？

> **🔥 中等 · Git**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**cherry-pick 定义：**

```
将某个提交从一个分支"采摘"到当前分支
```

**基本用法：**

```bash
# 采摘单个提交
git cherry-pick <commit-hash>

# 采摘多个提交
git cherry-pick <hash1> <hash2>

# 采摘提交范围（包含 A 和 B）
git cherry-pick A^..B

# 只应用改动，不提交
git cherry-pick --no-commit <hash>

# 放弃 cherry-pick
git cherry-pick --abort
```

**使用场景：**

**场景 1：热修复 bug**

```bash
# main 分支发现 bug
# bugfix 在 feature 分支已修复

# 1. 在 feature 分支找到修复提交
git log feature --oneline
# abc123 fix: 修复登录 bug

# 2. 切换到 main
git checkout main

# 3. 采摘修复
git cherry-pick abc123

# 4. 合并回 feature（可选）
git checkout feature
git merge main
```

**场景 2：跨分支同步提交**

```bash
# dev 分支的某个功能需要到 release 分支
git checkout release
git cherry-pick abc123
```

**场景 3：选取部分提交**

```bash
# feature 分支有 5 个提交，只需要其中 2 个
git cherry-pick abc123 def456
```

**可能遇到的问题：**

```bash
# 冲突处理
git cherry-pick <hash>
# CONFLICT (content): Merge conflict in file.js

# 1. 手动解决冲突
# 2. 继续
git add file.js
git cherry-pick --continue

# 3. 或放弃
git cherry-pick --abort
```

**cherry-pick vs merge：**

| 特性 | cherry-pick | merge |
|------|-------------|-------|
| 历史 | 复制提交 | 保留完整历史 |
| 提交 hash | 新生成 | 不变 |
| 适用场景 | 挑选特定提交 | 完整合并分支 |

**知识点：** `cherry-pick` `提交迁移` `冲突解决` `Git 高级操作`

:::

### Q6: git stash 的用法？

> **⭐ 简单 · Git**

::: details 🔍 点击查看答案与解析

#### ✅ 答案

**stash 基本用法：**

```bash
# 暂存当前改动
git stash

# 暂存并命名
git stash save "WIP: 正在开发登录功能"

# 包含未追踪文件
git stash -u

# 包含 ignored 文件
git stash -a

# 查看暂存列表
git stash list

# 应用最近一次暂存
git stash apply

# 应用并删除
git stash pop

# 应用指定暂存
git stash apply stash@{1}

# 删除暂存
git stash drop stash@{1}

# 清空所有暂存
git stash clear

# 基于暂存创建分支
git stash branch new-branch stash@{1}
```

**使用场景：**

**场景 1：临时切换分支**

```bash
# 正在开发，紧急修复 bug
# 当前改动不想提交

git stash              # 暂存改动
git checkout main      # 切换分支
git fix bug            # 修复 bug
git checkout feature   # 回来
git stash pop          # 恢复改动
```

**场景 2：保存工作现场**

```bash
# 尝试新想法，但想保留当前状态
git stash push -m "before-refactor"

# 尝试新方案...失败了
git stash pop          # 恢复原状态
```

**场景 3：多个工作现场**

```bash
git stash save "feature-A"
git stash save "feature-B"

git stash list
# stash@{0}: WIP on feature-B
# stash@{1}: WIP on feature-A

git stash apply stash@{1}  # 恢复 feature-A
```

**注意事项：**

```
⚠️ stash 是临时的，不要长期依赖
⚠️ 跨分支应用可能有冲突
✅ 重要改动还是应该提交
```

**最佳实践：**

```bash
# 1. 给 stash 起有意义的名字
git stash save "WIP: 用户登录页样式调整"

# 2. 及时清理没用的 stash
git stash list
git stash drop stash@{2}

# 3. 长期保存应该用分支
git checkout -b backup-branch
git commit -m "WIP backup"
```

**知识点：** `git stash` `工作现场` `暂存` `分支切换`

:::
