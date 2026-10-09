/**
 * 本地预览（演示）模式
 *
 * 用途：在没有云端账号 / 邀请码的情况下，也能在本地开发服务器上浏览全部页面。
 *
 * 约束：
 * - 仅在开发服务器（import.meta.env.DEV）下生效，`vite build` 产物永远不会进入演示模式；
 * - 演示数据全部为本地常量，不发起任何网络请求，也不会写入云端；
 * - 通过 localStorage 开关控制，开启 / 关闭后整页刷新，避免运行时半状态。
 */
import type { AiApp, ApiKey, AppKeyLink, AppOutput, Asset, Profile, Skill, SkillAppLink, UserPrefs } from './types';

const FLAG_KEY = 'si-preview-demo';

/** 演示模式是否开启（生产构建恒为 false） */
export function isPreviewDemoEnabled(): boolean {
  if (!import.meta.env.DEV) return false;
  try {
    return window.localStorage.getItem(FLAG_KEY) === '1';
  } catch {
    return false;
  }
}

export function enablePreviewDemo(): void {
  try { window.localStorage.setItem(FLAG_KEY, '1'); } catch { /* 忽略隐私模式下的写入失败 */ }
}

export function disablePreviewDemo(): void {
  try { window.localStorage.removeItem(FLAG_KEY); } catch { /* 同上 */ }
}

export const DEMO_USER_ID = 'demo-preview-user';

/** 演示模式下的“登录用户”，仅用于渲染界面，不具备任何云端权限 */
export const DEMO_USER = {
  id: DEMO_USER_ID,
  aud: 'authenticated',
  role: 'authenticated',
  email: 'demo@si-arsenal.local',
  created_at: '2026-01-01T00:00:00.000Z',
  app_metadata: {},
  user_metadata: { nickname: '示例用户' },
} as never;

const daysAgo = (days: number, hour = 10): string =>
  new Date(Date.now() - days * 86_400_000 + hour * 3_600_000).toISOString();

const app = (row: Partial<AiApp> & Pick<AiApp, 'id' | 'name' | 'category'>): AiApp => ({
  user_id: DEMO_USER_ID,
  url: null,
  description: null,
  specialties: [],
  quota_total: null,
  quota_remaining: null,
  quota_unit: '次',
  quota_updated_at: null,
  status: '在用',
  is_favorite: false,
  rating: 0,
  icon_url: null,
  note: null,
  created_at: daysAgo(30),
  updated_at: daysAgo(2),
  ...row,
} as AiApp);

export const DEMO_APPS: AiApp[] = [
  app({
    id: 'demo-app-chatgpt', name: 'ChatGPT Plus', category: '对话', url: 'https://chat.openai.com',
    description: '日常问答与长文写作，支持联网检索与文件分析。', specialties: ['长文写作', '资料总结', '方案推演'],
    quota_total: 500, quota_remaining: 320, quota_updated_at: daysAgo(1), is_favorite: true, rating: 5,
    updated_at: daysAgo(1),
  }),
  app({
    id: 'demo-app-claude', name: 'Claude Pro', category: '对话', url: 'https://claude.ai',
    description: '长上下文阅读与代码理解，适合整仓库级别的分析。', specialties: ['代码理解', '长文档', '严谨推理'],
    quota_total: 300, quota_remaining: 42, quota_updated_at: daysAgo(1), rating: 4.5,
    updated_at: daysAgo(1, 3),
  }),
  app({
    id: 'demo-app-midjourney', name: 'Midjourney', category: '绘画', url: 'https://www.midjourney.com',
    description: '概念设计与封面配图生成，风格一致性较好。', specialties: ['概念设计', '封面配图'],
    quota_total: 2000, quota_remaining: 1640, quota_unit: '点数', quota_updated_at: daysAgo(3), rating: 4,
    updated_at: daysAgo(3),
  }),
  app({
    id: 'demo-app-cursor', name: 'Cursor', category: '编程', url: 'https://cursor.com',
    description: 'AI 编辑器，负责重构与批量改写，配合技能库使用。', specialties: ['重构', '批量改写', '单元测试'],
    is_favorite: true, rating: 5, updated_at: daysAgo(4),
  }),
  app({
    id: 'demo-app-suno', name: 'Suno', category: '音视频', url: 'https://suno.com',
    description: '短视频配乐生成，用于内容发布的背景音乐。', specialties: ['配乐', '母带', '风格迁移'],
    quota_total: 100, quota_remaining: 11, status: '观望', quota_updated_at: daysAgo(6), rating: 3.5,
    updated_at: daysAgo(6),
  }),
  app({
    id: 'demo-app-perplexity', name: 'Perplexity', category: '搜索', url: 'https://www.perplexity.ai',
    description: '带引用的检索问答，已由内置搜索替代。', specialties: ['检索问答', '文献溯源'],
    quota_total: 1000, quota_remaining: 860, status: '已弃用', rating: 3, updated_at: daysAgo(20),
  }),
];

export const DEMO_KEYS: ApiKey[] = [
  {
    id: 'demo-key-openai', user_id: DEMO_USER_ID, name: 'OpenAI 主密钥', platform: 'OpenAI',
    key_value: 'sk-demo-0000000000000000000000000000abcd', note: '绑定 ChatGPT Plus 与 Cursor',
    is_active: true, created_at: daysAgo(28), updated_at: daysAgo(1),
  },
  {
    id: 'demo-key-anthropic', user_id: DEMO_USER_ID, name: 'Anthropic 密钥', platform: 'Anthropic',
    key_value: 'sk-ant-demo-1111111111111111111111efgh', note: '仅用于长文档批处理',
    is_active: true, created_at: daysAgo(21), updated_at: daysAgo(2),
  },
  {
    id: 'demo-key-aliyun', user_id: DEMO_USER_ID, name: '阿里云百炼密钥', platform: '阿里云百炼',
    key_value: 'sk-demo-2222222222222222222222ijkl', note: '额度用尽，已停用',
    is_active: false, created_at: daysAgo(15), updated_at: daysAgo(9),
  },
];

export const DEMO_SKILLS: Skill[] = [
  {
    id: 'demo-skill-outline', user_id: DEMO_USER_ID, name: '结构化长文提纲', category: 'Prompt 模板',
    scene: '写方案 / 公众号长文前，先让模型产出可执行提纲',
    content: '你是资深内容策划。请围绕「{{主题}}」输出三级提纲：\n1. 结论先行，给出核心观点\n2. 每个小节列出 3 个支撑论据\n3. 标注每节需要的素材类型',
    tags: ['写作', '提纲'], usage_count: 23, created_at: daysAgo(26), updated_at: daysAgo(1),
  },
  {
    id: 'demo-skill-review', user_id: DEMO_USER_ID, name: '代码评审清单', category: '工作流',
    scene: '合并请求前的自检，覆盖边界与并发',
    content: '请以评审者视角检查下列代码，按严重级别输出问题清单：\n- 空值与边界条件\n- 并发与竞态\n- 错误处理是否吞掉异常\n- 是否有可简化的重复逻辑',
    tags: ['代码', '评审'], usage_count: 17, created_at: daysAgo(18), updated_at: daysAgo(3),
  },
  {
    id: 'demo-skill-translate', user_id: DEMO_USER_ID, name: '中英技术翻译', category: '提示词片段',
    scene: '把中文技术文档翻译成地道英文，保留代码与术语',
    content: '将以下中文翻译为地道英文技术写作：保留专有名词与代码块原样，术语首次出现时附英文全称。',
    tags: ['翻译', '文档'], usage_count: 9, created_at: daysAgo(12), updated_at: daysAgo(5),
  },
  {
    id: 'demo-skill-insight', user_id: DEMO_USER_ID, name: '数据洞察三问', category: '其他',
    scene: '拿到报表后快速定位异常与机会',
    content: '基于这份数据回答三问：1) 最大异常点是什么 2) 可能的业务原因 3) 下一步应该验证什么指标。',
    tags: ['分析'], usage_count: 4, created_at: daysAgo(7), updated_at: daysAgo(7),
  },
];

export const DEMO_ASSETS: Asset[] = [
  {
    id: 'demo-asset-visual', user_id: DEMO_USER_ID, name: '品牌主视觉提示词包', category: 'UI设计',
    url: 'https://example.com/brand-visual', description: '12 组主视觉生成提示词，含留白与配色约束。',
    tags: ['品牌', '主视觉'], is_favorite: true, created_at: daysAgo(24), updated_at: daysAgo(2),
  },
  {
    id: 'demo-asset-theme', user_id: DEMO_USER_ID, name: '深色主题配色板', category: '功能设计',
    url: 'https://example.com/dark-theme', description: '暗色模式下的层级与对比度参考。',
    tags: ['设计系统', '配色'], is_favorite: false, created_at: daysAgo(16), updated_at: daysAgo(6),
  },
  {
    id: 'demo-asset-snippet', user_id: DEMO_USER_ID, name: '虚拟列表代码片段', category: '写代码',
    url: 'https://example.com/virtual-list', description: '长列表渲染优化，可直接替换进表格组件。',
    tags: ['性能', 'React'], is_favorite: true, created_at: daysAgo(10), updated_at: daysAgo(4),
  },
];

export const DEMO_OUTPUTS: AppOutput[] = [
  {
    id: 'demo-output-1', user_id: DEMO_USER_ID, app_id: 'demo-app-chatgpt', title: 'Q3 内容选题提纲',
    kind: '文案', content: '围绕「AI 工作流」拆解为 6 个选题，每个选题配 3 条论据。', asset_url: null,
    created_at: daysAgo(1),
  },
  {
    id: 'demo-output-2', user_id: DEMO_USER_ID, app_id: 'demo-app-midjourney', title: '新品发布主视觉',
    kind: '图片', content: null, asset_url: 'https://example.com/outputs/key-visual.png', created_at: daysAgo(3),
  },
  {
    id: 'demo-output-3', user_id: DEMO_USER_ID, app_id: 'demo-app-cursor', title: '列表组件重构补丁',
    kind: '代码', content: '抽取 useVirtualList，删除 120 行重复渲染逻辑。', asset_url: null, created_at: daysAgo(4),
  },
];

export const DEMO_KEY_LINKS: AppKeyLink[] = [
  { id: 'demo-link-1', user_id: DEMO_USER_ID, app_id: 'demo-app-chatgpt', key_id: 'demo-key-openai' },
  { id: 'demo-link-2', user_id: DEMO_USER_ID, app_id: 'demo-app-claude', key_id: 'demo-key-anthropic' },
  { id: 'demo-link-3', user_id: DEMO_USER_ID, app_id: 'demo-app-cursor', key_id: 'demo-key-openai' },
];

export const DEMO_SKILL_LINKS: SkillAppLink[] = [
  { id: 'demo-skill-link-1', user_id: DEMO_USER_ID, skill_id: 'demo-skill-outline', app_id: 'demo-app-chatgpt' },
  { id: 'demo-skill-link-2', user_id: DEMO_USER_ID, skill_id: 'demo-skill-review', app_id: 'demo-app-cursor' },
  { id: 'demo-skill-link-3', user_id: DEMO_USER_ID, skill_id: 'demo-skill-translate', app_id: 'demo-app-claude' },
];

export const DEMO_PREFS: UserPrefs = { user_id: DEMO_USER_ID, quota_threshold: 20, default_sort: 'updated' };

export const DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID, nickname: '示例用户', username: 'demo',
  bio: '本地演示模式：以下数据均为示例，不会写入云端。', avatar_url: null,
};

const DEMO_TABLES: Record<string, unknown[]> = {
  ai_apps: DEMO_APPS,
  api_keys: DEMO_KEYS,
  skills: DEMO_SKILLS,
  assets: DEMO_ASSETS,
  app_outputs: DEMO_OUTPUTS,
  app_key_links: DEMO_KEY_LINKS,
  skill_app_links: DEMO_SKILL_LINKS,
};

/** 按表名取演示数据；未知表返回空数组，保证页面进入空状态而不是报错 */
export function demoTable<T>(table: string): T[] {
  // 返回浅拷贝，避免 React Query 结构化共享把"已就地修改的同一数组"判定为无变化
  return [...(DEMO_TABLES[table] ?? [])] as T[];
}

/** 演示模式下的写入：只改内存中的示例数据，不触网、不入库 */
export function demoUpsert(table: string, payload: Record<string, unknown>, isNew: boolean, keyCol = 'id'): void {
  if (table === 'user_prefs') { Object.assign(DEMO_PREFS, payload); return; }
  if (table === 'profiles') { Object.assign(DEMO_PROFILE, payload); return; }
  const rows = DEMO_TABLES[table];
  if (!rows) return;
  const key = payload[keyCol];
  const index = isNew || !key ? -1 : rows.findIndex((row) => (row as Record<string, unknown>)[keyCol] === key);
  if (index >= 0) rows[index] = { ...(rows[index] as Record<string, unknown>), ...payload };
  else rows.unshift({ ...payload });
}

/** 演示模式下的删除：只改内存中的示例数据 */
export function demoRemove(table: string, id: string): void {
  const rows = DEMO_TABLES[table];
  if (!rows) return;
  const index = rows.findIndex((row) => (row as { id?: string }).id === id);
  if (index >= 0) rows.splice(index, 1);
}
