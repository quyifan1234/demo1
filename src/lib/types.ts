export interface AiApp {
  id: string; user_id: string; name: string; url: string | null;
  category: string; description: string | null; specialties: string[];
  quota_total: number | null; quota_remaining: number | null;
  quota_unit: string; quota_updated_at: string | null;
  status: string; is_favorite: boolean; rating: number;
  icon_url: string | null; note: string | null;
  created_at: string; updated_at: string;
}

export interface ApiKey {
  id: string; user_id: string; name: string; platform: string | null;
  key_value: string; note: string | null; is_active: boolean;
  created_at: string; updated_at: string;
}

export interface AppKeyLink {
  id: string; user_id: string; app_id: string; key_id: string;
}

export interface AppOutput {
  id: string; user_id: string; app_id: string; title: string;
  kind: string; content: string | null; asset_url: string | null;
  created_at: string;
}

export interface Skill {
  id: string; user_id: string; name: string; category: string;
  scene: string | null; content: string | null; tags: string[];
  usage_count: number; created_at: string; updated_at: string;
}

export interface SkillAppLink {
  id: string; user_id: string; skill_id: string; app_id: string;
}

export interface Asset {
  id: string; user_id: string; name: string; url: string | null;
  category: string; description: string | null; tags: string[];
  is_favorite: boolean;
  created_at: string; updated_at: string;
}

export interface UserPrefs {
  user_id: string; quota_threshold: number; default_sort: string;
}

export interface Profile {
  id: string; nickname: string | null; bio: string | null;
  avatar_url: string | null; username: string | null;
}

export const APP_CATEGORIES = ['对话', '绘画', '写作', '编程', '音视频', '搜索', '其他'];
export const APP_STATUSES = ['在用', '观望', '已弃用'];
export const SKILL_CATEGORIES = ['Prompt 模板', '工作流', '提示词片段', '其他'];
export const ASSET_CATEGORIES = ['UI设计', '写代码', '功能设计', '其他'];
export const OUTPUT_KINDS = ['图片', '文案', '代码', '文件链接', '其他'];
export const QUOTA_UNITS = ['次', '点数', '美元', '字符'];
export const SORTS = [
  { value: 'updated', label: '最近更新' },
  { value: 'name', label: '名称' },
  { value: 'quota', label: '剩余额度' },
  { value: 'favorite', label: '收藏优先' },
];
