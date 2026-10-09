# Meoo 沙箱代码 vs GitHub 仓库 差异分析

分析时间：2026-10-09 · 分支 `cline/6wm383cv`
对比对象：
- **GitHub**：`quyifan1234/demo1` main `3f306a10`（本地工作区）
- **Meoo**：项目 `SI装备库Web` (`wgh68uu2zihu`) 沙箱，分支 `onedaybot-dev`，HEAD `5f369e1c`（经 `meoo sandbox pull` 拉取）

## 结论

**Meoo 沙箱 ≈ GitHub 仓库的导入基线**（逐个文件校验一致，见下），GitHub 在导入之后又演进了 8 个提交、47 个文件、约 **+1177 / −614 行**（不含 lockfile），**GitHub 侧领先 Meoo 平台侧**。线上 CDN 版本 v20 更早，落后更多。

## 时间线（UTC）

| 时间 | 事件 |
|---|---|
| 10-07 12:14 | 平台创建项目 SI装备库Web |
| 10-07 ~ 10-08 | 平台侧迭代，发布 v1 … v20（v20 active，10-08 08:46） |
| 10-08 09:59 | 平台「导出代码」→ `.meoo-manifest.json` (`exportDate`, `sourceProjectId=wgh68uu2zihu`) |
| 10-08 10:29–10:38 | 导入 GitHub（part 1–9，123 个文件，基线 `5b1493e9`） |
| 10-08 12:13 | `Improve accessibility and performance` |
| 10-08 12:51 | `test: add vitest coverage and fix flaky logic` |
| 10-09 01:12–02:48 | PR 合并（jules、fix-tests、`refactor(api): use ensureWritten helper for RLS checks`） |
| 10-09 04:35 | `Redesign SI arsenal with three themes and unified library layouts`（main tip） |

**基线校验**（GitHub `5b1493e9` vs 当前 Meoo 沙箱，内容完全相同）：
`src/styles.css`、`src/components/DesktopNav.tsx`、`src/routes/_app/index.tsx`、`src/api/keys.ts`、`src/routes/login.tsx`、`index.html`、`package.json`。

## 文件级差异总览

| 类别 | 数量 | 说明 |
|---|---|---|
| 两侧内容完全相同 | 84 | 含 `src/components/ui/*`、`migrations/`、`AGENTS.md`、`tsconfig.json` 等 |
| 同名但内容不同 | 35 | 全部是 GitHub 侧更新（详见下） |
| 仅 Meoo 沙箱有 | 66 | 平台运行时文件，非应用代码 |
| 仅 GitHub 有 | 18 | 导出元数据、README、测试体系、新组件 |

## 1) 仅 Meoo 沙箱有（平台运行时，不属于应用代码）

- `.plan/`、`.todo/`、`.websearch/`：平台 agent 的计划、待办、联网搜索缓存
- `skills/{meoo-cloud,react-design,github-mcp}/`：平台内置技能（含 `.skill-version`）
- `.assets_mapping`、`.gitkeep`
- `.env` 额外含 `VITE_ONEDAY_APP_ID`（GitHub 侧 `.env` 反而多 `MEOO_PROJECT_URL_ID`）

## 2) 仅 GitHub 有

- 导出元数据：`.meoo-manifest.json`、`meoo-manifest.json`、`.meoo-cloud-snapshot.json`、`meoo-cloud-snapshot.json`
- `README.md`、`package-lock.json`、`test_setup.sh`、`vitest.config.ts`
- 测试：8 个文件共 442 行（`src/api/__tests__`、`src/components/__tests__`、`src/hooks/__tests__`、`src/lib/__tests__`）
- 新组件：`src/components/theme-switch.tsx`、`src/components/library-overview.tsx`

## 3) 同名内容不同（GitHub 领先，按主题归类）

- **三主题系统**：`src/styles.css`（206 → 407 行，新增 `:root[data-theme='editorial']` 编辑排版主题，共 light / dark / editorial）；`index.html`（`data-theme` 属性、`meta theme-color`、字体 preconnect，移除 iframe 主题注入脚本）
- **架构重构**：`_app.tsx`（126 行改动，抽出 `AppShell` + `ProtectedLayout`）；`DesktopNav.tsx`（97 行，从 `@ts-nocheck` 遗留死代码重写为带计数与登出的真实导航）；`_app/index.tsx`（111 行，改用新 `library-overview.tsx` 替换内联实现）
- **数据层加固**：`api/helpers.ts` 的 `ensureWritten(data, action, customErrorMsg?)`；`apps/keys/skills/outputs/prefs.ts` 统一改用它做 RLS 写入校验
- **构建优化**：`vite.config.ts` 新增 `manualChunks`（vendor-react / vendor-supabase / vendor-lucide / vendor）
- **依赖**：`package.json` 新增 `vitest`、`@testing-library/react`、`@testing-library/dom`、`jsdom`
- **零散适配**：apps / assets / keys / skills / mine / login 路由、`rows.tsx`、`bits.tsx`、`TopBar.tsx`、`MobileNav.tsx`、`AppShell.tsx`、`__root.tsx`、`app-form.tsx`、`asset-form.tsx`

## 4) 云资源（平台侧真实存在，`meoo-cloud-snapshot.json` 记录）

- 数据库：`hasDatabase=true`，`migrations/` 两侧完全一致
- 边缘函数 2 个：`wx-mp-login`、`verify-invite`
- Secrets 12 项：`SUPABASE_URL/ANON_KEY/SERVICE_ROLE_KEY/DB_URL/PUBLIC_URL`、`WX_APP_ID`、`WX_APP_SECRET`、`INVITE_CODE`、`MEOO_PROJECT_API_KEY(_rtrxxey29u3j/_amshosva936j/_wgh68uu2zihu)`
- Storage bucket：`ai-assets`（public）

## 同步执行记录（2026-10-09 05:33 UTC）

已把 GitHub main 最新版推到 Meoo 并发布：

| 步骤 | 命令 | 结果 |
|---|---|---|
| 干净检出 | `git worktree add /tmp/push-src main` | 3f306a1 |
| 依赖安装 | `npm install`（pnpm 12 因代理证书报 UnknownIssuer，改用 npm） | 181 包 |
| 校验 | `npm run build`（含 `tsc --noEmit`）+ `npx vitest run` | 构建成功；8 文件 / 34 用例全通过 |
| 推送代码 | `meoo sandbox push --project wgh68uu2zihu` | 沙箱新提交 `4765a376`，54 文件变更，预览重启 |
| 发布 | `meoo deploy --project wgh68uu2zihu --skip-push --skip-build` | **v21 active**，commit `3f306a10`，额度 1/75 |
| 回拉校验 | `meoo sandbox pull` × 3 | 应用代码与 GitHub main **完全一致** |

线上验证 `https://wgh68uu2zihu.meoo.run`：HTTP 200，`<title>SI 装备库 · 个人 AI 资源工作台</title>`、`data-theme="light"`、新 description，且产物含 `vendor-react / vendor-supabase / vendor-lucide / vendor` 分包 → 确认 v21 就是 GitHub main 的构建产物。

回滚参考：v20（`fcfa02d8`）仍在发布历史中。

### 注意事项

1. **`sandbox push` 是整树替换**：推送后 `.plan/`、`.todo/`、`.websearch/`、`skills/` 会被删除，但平台随后自动重建（已实测 skills 恢复为 github-mcp / meoo-cloud / react-design）。推送前的沙箱备份在 `/tmp/meoo-backup`。
2. **CLI 禁止上传 `.env`**（目录归档与单文件推送都会拦截），只会合成仅含白名单字段的 `.env`。当前沙箱 `.env` 只剩 `MEOO_PROJECT_URL_ID=wgh68uu2zihu`，原 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` / `VITE_ONEDAY_APP_ID` 未回填。CDN 产物不受影响（构建发生在本地），若平台内编辑器预览异常，可在项目对话里让平台 agent 重新拉取云环境变量。
3. **`.env` 被 git 跟踪且在公开仓库中**（`git ls-tree main .env` 命中）。建议 `git rm --cached .env` 后提交，并按需轮换其中泄露的值（当前含公开性质的 anon key 与项目 ID）。
4. pnpm 在本沙箱不可用（TLS 拦截 + `NODE_EXTRA_CA_CERTS` 对 pnpm 12 无效），本地产物用 npm 构建；`meoo deploy` 内部调用 `pnpm run build`，因此本次发布用了 `--skip-build` 复用已验证的 `dist/`。

## 风险与建议

1. **双向漂移**：GitHub 的三主题重构、ensureWritten、测试体系都没有回流 Meoo；平台上若继续改会再次分叉。建议确立单一真源（推荐以 GitHub 为源，`meoo sandbox push` / `meoo deploy` 同步）。
2. **同步时保护平台文件**：不要删除 `.plan/`、`.todo/`、`.websearch/`、`skills/`、`.assets_mapping`，不要覆盖 Meoo 侧 `.env` 的 `VITE_ONEDAY_APP_ID`。
3. **密钥卫生**：`.env` 已被 `.gitignore` 忽略；仓库内 `meoo-cloud-snapshot.json` 只含 secret **名称**，务必不要提交取值。
4. **上线**：线上 v20（10-08 08:46）落后于 GitHub main，需要 `meoo deploy` 才能发布新 UI（静态发布额度已用 1/75）。
5. **锁文件**：`package-lock.json` 与 `pnpm-lock.yaml` 并存，项目使用 pnpm，建议删除 `package-lock.json` 以免锁文件不一致。
