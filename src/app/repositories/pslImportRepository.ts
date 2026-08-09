import type {
  PSLImport,
  PSLImportStatus,
} from "../types/pslImport";

const STORAGE_KEY = "csp-psl-imports";

class PSLImportRepository {
  private getStored(): PSLImport[] {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return [];
      }

      return JSON.parse(stored) as PSLImport[];
    } catch {
      return [];
    }
  }

  private saveStored(imports: PSLImport[]): void {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(imports)
    );
  }

  getAll(): PSLImport[] {
    return this.getStored();
  }

  getById(id: string): PSLImport | undefined {
    return this.getStored().find(
      (item) => item.id === id
    );
  }

  getByStatus(
    reviewStatus: PSLImportStatus
  ): PSLImport[] {
    return this.getStored().filter(
      (item) =>
        item.reviewStatus === reviewStatus
    );
  }

  add(importItem: PSLImport): PSLImport {
    const imports = this.getStored();

    const existing = imports.find(
      (item) => item.id === importItem.id
    );

    if (existing) {
      return existing;
    }

    imports.push(importItem);

    this.saveStored(imports);

    return importItem;
  }

  addMany(importItems: PSLImport[]): PSLImport[] {
    const imports = this.getStored();

    const existingIds = new Set(
      imports.map((item) => item.id)
    );

    const newItems = importItems.filter(
      (item) => !existingIds.has(item.id)
    );

    if (newItems.length === 0) {
      return imports;
    }

    const updated = [
      ...imports,
      ...newItems,
    ];

    this.saveStored(updated);

    return updated;
  }

  update(
    id: string,
    changes: Partial<PSLImport>
  ): PSLImport | undefined {
    const imports = this.getStored();

    const index = imports.findIndex(
      (item) => item.id === id
    );

    if (index === -1) {
      return undefined;
    }

    const updated: PSLImport = {
      ...imports[index],
      ...changes,
    };

    imports[index] = updated;

    this.saveStored(imports);

    return updated;
  }

  approve(
    id: string,
    reviewedBy: string
  ): PSLImport | undefined {
    return this.update(id, {
      reviewStatus: "Approved",
      reviewedAt: new Date().toISOString(),
      reviewedBy,
      rejectionReason: undefined,
    });
  }

  reject(
    id: string,
    reviewedBy: string,
    rejectionReason?: string
  ): PSLImport | undefined {
    return this.update(id, {
      reviewStatus: "Rejected",
      reviewedAt: new Date().toISOString(),
      reviewedBy,
      rejectionReason,
    });
  }

  remove(id: string): void {
    const imports = this.getStored().filter(
      (item) => item.id !== id
    );

    this.saveStored(imports);
  }

  clear(): void {
    this.saveStored([]);
  }
}

const pslImportRepository =
  new PSLImportRepository();

export default pslImportRepository;