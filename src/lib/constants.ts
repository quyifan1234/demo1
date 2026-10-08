// 全局业务常量：分类、状态、平台等枚举值，须与共享云服务字段默认值保持一致

export const APP_CATEGORIES = [
  '对话助手',
  '代码开发',
  '图像生成',
  '视频生成',
  '音频语音',
  '写作办公',
  '数据分析',
  '搜索研究',
  '其他',
] as const;

export const APP_STATUSES = ['active', 'paused', 'archived'] as const;

export const APP_STATUS_LABEL: Record<string, string> = {
  active: '在用',
  paused: '暂停',
  archived: '归档',
};

export const QUOTA_UNITS = ['次', 'tokens', '分钟', '秒', 'MB'] as const;

export const KEY_PLATFORMS = [
  'OpenAI',
  'Anthropic',
  'Google',
  '阿里云百炼',
  'DeepSeek',
  'Moonshot',
  '智谱',
  '百度',
  '字节火山',
  '其他',
] as const;

export const SKILL_CATEGORIES = [
  'Prompt 模板',
  '写作',
  '编程',
  '翻译',
  '分析',
  '营销',
  '其他',
] as const;

export const OUTPUT_KINDS = ['text', 'image', 'code', 'other'] as const;

export const OUTPUT_KIND_LABEL: Record<string, string> = {
  text: '文本',
  image: '图片',
  code: '代码',
  other: '其他',
};

export const SORT_OPTIONS = [
  { value: 'updated', label: '最近更新' },
  { value: 'created', label: '最新创建' },
  { value: 'rating', label: '评分最高' },
  { value: 'quota', label: '剩余额度最少' },
  { value: 'name', label: '名称 A-Z' },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]['value'];
