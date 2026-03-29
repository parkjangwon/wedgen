export interface VersionInfo {
  id: string;
  timestamp: number;
  label: string;
  description?: string;
  snapshot: unknown;
}

export class VersionManager {
  private versions: Map<string, VersionInfo> = new Map();
  private currentVersionId: string | null = null;
  private maxVersions: number;

  constructor(maxVersions: number = 20) {
    this.maxVersions = maxVersions;
  }

  createVersion(
    snapshot: unknown,
    label: string,
    description?: string
  ): VersionInfo {
    const id = `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const version: VersionInfo = {
      id,
      timestamp: Date.now(),
      label,
      description,
      snapshot,
    };

    this.versions.set(id, version);

    if (this.versions.size > this.maxVersions) {
      const oldestId = Array.from(this.versions.keys())[0];
      this.versions.delete(oldestId);
    }

    this.currentVersionId = id;
    return version;
  }

  getVersion(id: string): VersionInfo | undefined {
    return this.versions.get(id);
  }

  getAllVersions(): VersionInfo[] {
    return Array.from(this.versions.values()).sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }

  restoreVersion(id: string): unknown | null {
    const version = this.versions.get(id);
    if (version) {
      this.currentVersionId = id;
      return version.snapshot;
    }
    return null;
  }

  deleteVersion(id: string): boolean {
    if (this.currentVersionId === id) {
      this.currentVersionId = null;
    }
    return this.versions.delete(id);
  }

  getCurrentVersionId(): string | null {
    return this.currentVersionId;
  }

  clear(): void {
    this.versions.clear();
    this.currentVersionId = null;
  }

  exportToJSON(): string {
    return JSON.stringify({
      versions: Array.from(this.versions.values()),
      currentVersionId: this.currentVersionId,
    });
  }

  importFromJSON(json: string): void {
    try {
      const data = JSON.parse(json) as {
        versions: VersionInfo[];
        currentVersionId: string | null;
      };
      this.versions = new Map(data.versions.map((v) => [v.id, v]));
      this.currentVersionId = data.currentVersionId;
    } catch {
      console.error("Failed to import versions");
    }
  }
}
