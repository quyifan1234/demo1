# SI 装备库 · 个人 AI 资源工作台

集中管理 AI 应用、素材、技能与密钥的 Web 工作台。前端为 React + Vite 单页应用，数据与鉴权由 Meoo 云服务（Supabase）提供，通过 Meoo CDN 发布。

## 技术栈

| 层 | 选型 |
|---|---|
| 框架 | React + TypeScript + Vite 7（产物 `dist/`，端口固定 **3015**） |
| 路由 | TanStack Router 文件路由（`src/routes/`，`routeTree.gen.ts` 自动生成，勿手改） |
| 样式 | Tailwind CSS v4 + shadcn/ui（`src/components/ui/`，已全量预装） |
| 数据 | `@supabase/supabase-js`，查询封装在 `src/lib/queries.ts` |
| 测试 | Vitest + Testing Library（jsdom） |

## 快速开始

```bash
pnpm install
pnpm dev          # http://localhost:3015
```

### 环境变量

`.env` **不再纳入版本控制**。首次克隆后执行：

```bash
meoo login
meoo cloud pull-env      # 生成 .env（VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 等）
```

缺少 `.env` 时构建不会失败，但产物中的 Supabase 配置为空，运行时会报错。

## 常用命令

| 命令 | 说明 |
|---|---|
| `pnpm dev` | 本地开发（3015，`strictPort`） |
| `pnpm build` | `tsc --noEmit` + 构建到 `dist/` |
| `pnpm typecheck` | 仅类型检查 |
| `pnpm test` | Vitest 单测（`./test_setup.sh` 为等价快捷脚本） |

## 目录结构

```
src/
├── api/          # 数据访问层：apps / assets / skills / keys / outputs / prefs
├── components/   # 业务组件；ui/ 为 shadcn 组件
├── hooks/        # useAuth 等
├── lib/          # queries、supabase 客户端、format、constants
├── routes/       # TanStack 文件路由，_app 为登录后布局
├── store/        # 全局状态
└── styles.css    # 主题变量
migrations/       # 数据库迁移（幂等 SQL，按文件名字典序执行）
```

## 界面主题

三套主题通过 `<html data-theme>` 切换，定义在 `src/styles.css`，切换组件为 `src/components/theme-switch.tsx`：

- `light` — 浅色原生（默认）
- `dark` — 暗色控制台
- `editorial` — 编辑排版

## 部署

```bash
meoo deploy                             # 构建并发布到 Meoo CDN
meoo deploy --skip-push --skip-build    # 复用已构建的 dist/ 直接发布
```

## 平台约束（勿改动）

- 技术栈固定 react + vite，不要更换框架或构建工具（如切换为 Angular / Svelte），否则导入平台时会被拒绝
- **不要删除** `meoo-manifest.json`、`meoo-cloud-snapshot.json`（重新导入平台时需要；同名隐藏文件为平台兼容副本）
- `src/supabase/client.ts` 不要删除或重命名（平台靠它检测云服务状态）
- 数据库结构改动在 `migrations/` **新增** `.sql` 文件，不要修改或删除已有迁移；必须使用幂等语法（`CREATE TABLE IF NOT EXISTS` 等）
- 云函数放在 `functions/<函数名>/index.ts`
- 开发服务器端口固定 3015，不要修改

## 仓库整理记录

2026-10-09 清理（详见对应 PR）：

- 取消跟踪 `.env`，改为本地 `meoo cloud pull-env` 生成；`.gitignore` 补齐 `.env.*` 规则
- 删除零引用死代码：`AppFormDialog`、`KeyFormDialog`、`OutputFormDialog`、`SkillFormDialog`、`MobileTabBar`、`navItems`、`EmptyState`（`EmptyState` 实际由 `bits.tsx` 导出）
- 删除与 pnpm 冲突的 `package-lock.json`（项目统一使用 pnpm）
- `package.json` 增加 `test` / `test:watch` 脚本
