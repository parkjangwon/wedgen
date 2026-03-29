export interface DraftStorage {
  loadAutosave(templateId: string): Promise<DraftSnapshot | null>;
  saveAutosave(templateId: string, draft: DraftSnapshot): Promise<void>;
  removeAutosave(templateId: string): Promise<void>;

  loadSlot(templateId: string, slot: 1 | 2 | 3): Promise<DraftSnapshot | null>;
  saveSlot(templateId: string, slot: 1 | 2 | 3, draft: DraftSnapshot): Promise<void>;
  removeSlot(templateId: string, slot: 1 | 2 | 3): Promise<void>;

  getSlotName(templateId: string, slot: 1 | 2 | 3): Promise<string>;
  setSlotName(templateId: string, slot: 1 | 2 | 3, name: string): Promise<void>;
}

export interface DraftSnapshot {
  version: number;
  timestamp: number;
  locale: string;
  sectionOrder: string[];
  data: Record<string, unknown>;
  style: Record<string, string | undefined>;
  assets: Record<string, string | string[] | undefined>;
}

const STORAGE_VERSION = 1;
const STORAGE_KEY_PREFIX = "wedgen:draft:";

export function createStorageKey(templateId: string, suffix: string): string {
  return `${STORAGE_KEY_PREFIX}${templateId}:${suffix}`;
}

export class LocalStorageDraftStorage implements DraftStorage {
  async loadAutosave(templateId: string): Promise<DraftSnapshot | null> {
    const key = createStorageKey(templateId, "autosave");
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as DraftSnapshot;
      if (parsed.version !== STORAGE_VERSION) {
        window.localStorage.removeItem(key);
        return null;
      }
      return parsed;
    } catch {
      window.localStorage.removeItem(key);
      return null;
    }
  }

  async saveAutosave(templateId: string, draft: DraftSnapshot): Promise<void> {
    const key = createStorageKey(templateId, "autosave");
    const snapshot: DraftSnapshot = {
      ...draft,
      version: STORAGE_VERSION,
      timestamp: Date.now(),
    };
    window.localStorage.setItem(key, JSON.stringify(snapshot));
  }

  async removeAutosave(templateId: string): Promise<void> {
    const key = createStorageKey(templateId, "autosave");
    window.localStorage.removeItem(key);
  }

  async loadSlot(templateId: string, slot: 1 | 2 | 3): Promise<DraftSnapshot | null> {
    const key = createStorageKey(templateId, `slot:${slot}`);
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as DraftSnapshot;
      if (parsed.version !== STORAGE_VERSION) {
        window.localStorage.removeItem(key);
        return null;
      }
      return parsed;
    } catch {
      window.localStorage.removeItem(key);
      return null;
    }
  }

  async saveSlot(templateId: string, slot: 1 | 2 | 3, draft: DraftSnapshot): Promise<void> {
    const key = createStorageKey(templateId, `slot:${slot}`);
    const snapshot: DraftSnapshot = {
      ...draft,
      version: STORAGE_VERSION,
      timestamp: Date.now(),
    };
    window.localStorage.setItem(key, JSON.stringify(snapshot));
  }

  async removeSlot(templateId: string, slot: 1 | 2 | 3): Promise<void> {
    const key = createStorageKey(templateId, `slot:${slot}`);
    window.localStorage.removeItem(key);
  }

  async getSlotName(templateId: string, slot: 1 | 2 | 3): Promise<string> {
    const key = createStorageKey(templateId, "slot-names");
    const raw = window.localStorage.getItem(key);
    const defaultNames: Record<1 | 2 | 3, string> = {
      1: "예식 초안 A",
      2: "예식 초안 B",
      3: "예식 초안 C",
    };

    if (!raw) return defaultNames[slot];

    try {
      const names = JSON.parse(raw) as Record<string, string>;
      return names[String(slot)] || defaultNames[slot];
    } catch {
      return defaultNames[slot];
    }
  }

  async setSlotName(templateId: string, slot: 1 | 2 | 3, name: string): Promise<void> {
    const key = createStorageKey(templateId, "slot-names");
    const raw = window.localStorage.getItem(key);
    const names: Record<string, string> = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    names[String(slot)] = name;
    window.localStorage.setItem(key, JSON.stringify(names));
  }
}

export const draftStorage = new LocalStorageDraftStorage();
