export type BonusType = "ROUND" | "MONTH";

export interface Bonus {
  id: string;
  playerId: string;

  type: BonusType;

  round?: number;
  month?: string;

  points: number;
}

const STORAGE_KEY = "csp-bonuses";

class BonusRepository {
  private getStored(): Bonus[] {
    if (typeof window === "undefined") {
      return [];
    }

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }

  private saveStored(bonuses: Bonus[]) {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(bonuses)
    );
  }

  getAll(): Bonus[] {
    return this.getStored();
  }

  getRoundBonus(round: number): Bonus | undefined {
    return this.getStored().find(
      (bonus) =>
        bonus.type === "ROUND" &&
        bonus.round === round
    );
  }

  removeRoundBonus(round: number) {
    const bonuses = this.getStored().filter(
      (bonus) =>
        !(
          bonus.type === "ROUND" &&
          bonus.round === round
        )
    );

    this.saveStored(bonuses);
  }

  save(bonus: Bonus) {
    const bonuses = this.getStored();

    bonuses.push(bonus);

    this.saveStored(bonuses);
  }

  reset(): void {
    this.saveStored([]);
  }
}

export default new BonusRepository();