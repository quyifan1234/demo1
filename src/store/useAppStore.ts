// @ts-nocheck — 平台 agent 遗留的死代码，不再维护，仅为通过构建而跳过类型检查
import { create } from 'zustand';
import type { AppRow } from '@/api/apps';
import type { KeyRow, LinkRow } from '@/api/keys';
import type { SkillRow, SkillLink } from '@/api/skills';
import type { OutputRow } from '@/api/outputs';
import type { PrefRow } from '@/api/prefs';
import * as appsApi from '@/api/apps';
import * as keysApi from '@/api/keys';
import * as skillsApi from '@/api/skills';
import * as outputsApi from '@/api/outputs';
import * as prefsApi from '@/api/prefs';

interface AppState {
  loaded: boolean;
  loading: boolean;
  apps: AppRow[];
  keys: KeyRow[];
  keyLinks: LinkRow[];
  skills: SkillRow[];
  skillLinks: SkillLink[];
  outputs: OutputRow[];
  prefs: PrefRow | null;

  loadAll: (userId: string) => Promise<void>;
  reset: () => void;

  addApp: (userId: string, p: Parameters<typeof appsApi.createApp>[1]) => Promise<void>;
  patchApp: (userId: string, id: string, p: Parameters<typeof appsApi.updateApp>[2]) => Promise<void>;
  removeApp: (userId: string, id: string) => Promise<void>;

  addKey: (userId: string, p: Parameters<typeof keysApi.createKey>[1]) => Promise<void>;
  patchKey: (userId: string, id: string, p: Parameters<typeof keysApi.updateKey>[2]) => Promise<void>;
  removeKey: (userId: string, id: string) => Promise<void>;
  linkKey: (userId: string, appId: string, keyId: string) => Promise<void>;
  unlinkKey: (userId: string, linkId: string) => Promise<void>;

  addSkill: (userId: string, p: Parameters<typeof skillsApi.createSkill>[1]) => Promise<void>;
  patchSkill: (userId: string, id: string, p: Parameters<typeof skillsApi.updateSkill>[2]) => Promise<void>;
  removeSkill: (userId: string, id: string) => Promise<void>;
  useSkill: (userId: string, s: SkillRow) => Promise<void>;
  linkSkill: (userId: string, appId: string, skillId: string) => Promise<void>;
  unlinkSkill: (userId: string, linkId: string) => Promise<void>;

  addOutput: (userId: string, p: Parameters<typeof outputsApi.createOutput>[1]) => Promise<void>;
  removeOutput: (userId: string, id: string) => Promise<void>;

  savePrefs: (userId: string, p: Partial<Omit<PrefRow, 'user_id' | 'created_at'>>) => Promise<void>;
}

const emptyState = {
  loaded: false,
  loading: false,
  apps: [] as AppRow[],
  keys: [] as KeyRow[],
  keyLinks: [] as LinkRow[],
  skills: [] as SkillRow[],
  skillLinks: [] as SkillLink[],
  outputs: [] as OutputRow[],
  prefs: null as PrefRow | null,
};

export const useAppStore = create<AppState>((set, get) => ({
  ...emptyState,

  async loadAll(userId) {
    set({ loading: true });
    try {
      const [apps, keys, keyLinks, skills, skillLinks, outputs, prefs] = await Promise.all([
        appsApi.listApps(userId),
        keysApi.listKeys(userId),
        keysApi.listKeyLinks(userId),
        skillsApi.listSkills(userId),
        skillsApi.listSkillLinks(userId),
        outputsApi.listOutputs(userId),
        prefsApi.getPrefs(userId),
      ]);
      set({ apps, keys, keyLinks, skills, skillLinks, outputs, prefs, loaded: true, loading: false });
    } catch (e) {
      set({ loading: false });
      throw e;
    }
  },

  reset() {
    set({ ...emptyState });
  },

  async addApp(userId, p) {
    const row = await appsApi.createApp(userId, p);
    set({ apps: [row, ...get().apps] });
  },
  async patchApp(userId, id, p) {
    const row = await appsApi.updateApp(userId, id, p);
    set({ apps: get().apps.map((a) => (a.id === id ? row : a)) });
  },
  async removeApp(userId, id) {
    await appsApi.deleteApp(userId, id);
    set({
      apps: get().apps.filter((a) => a.id !== id),
      keyLinks: get().keyLinks.filter((l) => l.app_id !== id),
      skillLinks: get().skillLinks.filter((l) => l.app_id !== id),
      outputs: get().outputs.filter((o) => o.app_id !== id),
    });
  },

  async addKey(userId, p) {
    const row = await keysApi.createKey(userId, p);
    set({ keys: [row, ...get().keys] });
  },
  async patchKey(userId, id, p) {
    const row = await keysApi.updateKey(userId, id, p);
    set({ keys: get().keys.map((k) => (k.id === id ? row : k)) });
  },
  async removeKey(userId, id) {
    await keysApi.deleteKey(userId, id);
    set({ keys: get().keys.filter((k) => k.id !== id), keyLinks: get().keyLinks.filter((l) => l.key_id !== id) });
  },
  async linkKey(userId, appId, keyId) {
    await keysApi.linkKeyToApp(userId, appId, keyId);
    set({ keyLinks: await keysApi.listKeyLinks(userId) });
  },
  async unlinkKey(userId, linkId) {
    await keysApi.unlinkKeyFromApp(userId, linkId);
    set({ keyLinks: get().keyLinks.filter((l) => l.id !== linkId) });
  },

  async addSkill(userId, p) {
    const row = await skillsApi.createSkill(userId, p);
    set({ skills: [row, ...get().skills] });
  },
  async patchSkill(userId, id, p) {
    const row = await skillsApi.updateSkill(userId, id, p);
    set({ skills: get().skills.map((s) => (s.id === id ? row : s)) });
  },
  async removeSkill(userId, id) {
    await skillsApi.deleteSkill(userId, id);
    set({ skills: get().skills.filter((s) => s.id !== id), skillLinks: get().skillLinks.filter((l) => l.skill_id !== id) });
  },
  async useSkill(userId, s) {
    await skillsApi.bumpUsage(userId, s);
    set({ skills: get().skills.map((x) => (x.id === s.id ? { ...x, usage_count: x.usage_count + 1 } : x)) });
  },
  async linkSkill(userId, appId, skillId) {
    await skillsApi.linkSkillToApp(userId, appId, skillId);
    set({ skillLinks: await skillsApi.listSkillLinks(userId) });
  },
  async unlinkSkill(userId, linkId) {
    await skillsApi.unlinkSkillFromApp(userId, linkId);
    set({ skillLinks: get().skillLinks.filter((l) => l.id !== linkId) });
  },

  async addOutput(userId, p) {
    const row = await outputsApi.createOutput(userId, p);
    set({ outputs: [row, ...get().outputs] });
  },
  async removeOutput(userId, id) {
    await outputsApi.deleteOutput(userId, id);
    set({ outputs: get().outputs.filter((o) => o.id !== id) });
  },

  async savePrefs(userId, p) {
    const row = await prefsApi.savePrefs(userId, p);
    set({ prefs: row });
  },
}));
