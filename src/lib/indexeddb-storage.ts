import type { DraftStorage, DraftSnapshot } from "./draft-storage";

const DB_NAME = "WedgenEditorDB";
const DB_VERSION = 1;
const STORE_DRAFTS = "drafts";
const STORE_SLOT_NAMES = "slotNames";

export class IndexedDBDraftStorage implements DraftStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
          db.createObjectStore(STORE_DRAFTS, { keyPath: "key" });
        }
        if (!db.objectStoreNames.contains(STORE_SLOT_NAMES)) {
          db.createObjectStore(STORE_SLOT_NAMES, { keyPath: "key" });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error("Failed to initialize IndexedDB");
    }
    return this.db;
  }

  private createKey(templateId: string, suffix: string): string {
    return `${templateId}:${suffix}`;
  }

  async loadAutosave(templateId: string): Promise<DraftSnapshot | null> {
    const db = await this.ensureDB();
    const key = this.createKey(templateId, "autosave");

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_DRAFTS], "readonly");
      const store = transaction.objectStore(STORE_DRAFTS);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as { key: string; draft: DraftSnapshot } | undefined;
        resolve(result?.draft || null);
      };
    });
  }

  async saveAutosave(templateId: string, draft: DraftSnapshot): Promise<void> {
    const db = await this.ensureDB();
    const key = this.createKey(templateId, "autosave");

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_DRAFTS], "readwrite");
      const store = transaction.objectStore(STORE_DRAFTS);
      const request = store.put({ key, draft, timestamp: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async removeAutosave(templateId: string): Promise<void> {
    const db = await this.ensureDB();
    const key = this.createKey(templateId, "autosave");

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_DRAFTS], "readwrite");
      const store = transaction.objectStore(STORE_DRAFTS);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async loadSlot(templateId: string, slot: 1 | 2 | 3): Promise<DraftSnapshot | null> {
    const db = await this.ensureDB();
    const key = this.createKey(templateId, `slot:${slot}`);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_DRAFTS], "readonly");
      const store = transaction.objectStore(STORE_DRAFTS);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as { key: string; draft: DraftSnapshot } | undefined;
        resolve(result?.draft || null);
      };
    });
  }

  async saveSlot(templateId: string, slot: 1 | 2 | 3, draft: DraftSnapshot): Promise<void> {
    const db = await this.ensureDB();
    const key = this.createKey(templateId, `slot:${slot}`);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_DRAFTS], "readwrite");
      const store = transaction.objectStore(STORE_DRAFTS);
      const request = store.put({ key, draft, timestamp: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async removeSlot(templateId: string, slot: 1 | 2 | 3): Promise<void> {
    const db = await this.ensureDB();
    const key = this.createKey(templateId, `slot:${slot}`);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_DRAFTS], "readwrite");
      const store = transaction.objectStore(STORE_DRAFTS);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getSlotName(templateId: string, slot: 1 | 2 | 3): Promise<string> {
    const db = await this.ensureDB();
    const key = this.createKey(templateId, "slot-names");
    const defaultNames: Record<1 | 2 | 3, string> = {
      1: "예식 초안 A",
      2: "예식 초안 B",
      3: "예식 초안 C",
    };

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_SLOT_NAMES], "readonly");
      const store = transaction.objectStore(STORE_SLOT_NAMES);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result as { key: string; names: Record<string, string> } | undefined;
        resolve(result?.names?.[String(slot)] || defaultNames[slot]);
      };
      request.onerror = () => resolve(defaultNames[slot]);
    });
  }

  async setSlotName(templateId: string, slot: 1 | 2 | 3, name: string): Promise<void> {
    const db = await this.ensureDB();
    const key = this.createKey(templateId, "slot-names");

    const current = await this.getAllSlotNames(templateId);
    current[String(slot)] = name;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_SLOT_NAMES], "readwrite");
      const store = transaction.objectStore(STORE_SLOT_NAMES);
      const request = store.put({ key, names: current });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  private async getAllSlotNames(templateId: string): Promise<Record<string, string>> {
    const db = await this.ensureDB();
    const key = this.createKey(templateId, "slot-names");

    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_SLOT_NAMES], "readonly");
      const store = transaction.objectStore(STORE_SLOT_NAMES);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result as { key: string; names: Record<string, string> } | undefined;
        resolve(result?.names || {});
      };
      request.onerror = () => resolve({});
    });
  }
}

export const indexedDBStorage = new IndexedDBDraftStorage();
