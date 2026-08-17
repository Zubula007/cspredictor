import { supabase } from "../lib/supabase";

export interface CompetitionRecord {
  id: string;
  name: string;
  activeRound: number;
}

class CompetitionRepository {
  /*
   * ============================================================
   * GET ALL COMPETITIONS
   * ============================================================
   */

  async getAll(): Promise<CompetitionRecord[]> {
    const { data, error } = await supabase
      .from("competitions")
      .select(
        "id, name, active_round"
      )
      .order("id", {
        ascending: true,
      });

    if (error) {
      throw new Error(
        `Unable to load competitions from Supabase: ${error.message}`
      );
    }

    return (data ?? []).map(
      (row) => ({
        id: String(row.id),

        name: String(row.name),

        activeRound:
          Number(row.active_round) > 0
            ? Number(row.active_round)
            : 1,
      })
    );
  }

  /*
   * ============================================================
   * GET COMPETITION
   * ============================================================
   */

  async getById(
    competitionId: string
  ): Promise<CompetitionRecord | undefined> {
    const { data, error } = await supabase
      .from("competitions")
      .select(
        "id, name, active_round"
      )
      .eq("id", competitionId)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Unable to load competition from Supabase: ${error.message}`
      );
    }

    if (!data) {
      return undefined;
    }

    return {
      id: String(data.id),

      name: String(data.name),

      activeRound:
        Number(data.active_round) > 0
          ? Number(data.active_round)
          : 1,
    };
  }

  /*
   * ============================================================
   * GET ACTIVE ROUND
   * ============================================================
   *
   * Supabase competitions.active_round
   * is the single source of truth.
   */

  async getActiveRound(
    competitionId: string
  ): Promise<number> {
    const competition =
      await this.getById(
        competitionId
      );

    if (!competition) {
      return 1;
    }

    return competition.activeRound;
  }

  /*
   * ============================================================
   * SET ACTIVE ROUND
   * ============================================================
   *
   * Admin changes the active round here.
   *
   * The value is saved to Supabase so that
   * every user sees the same active round.
   */

  async setActiveRound(
    competitionId: string,
    round: number
  ): Promise<number> {
    if (
      !Number.isInteger(round) ||
      round < 1
    ) {
      return this.getActiveRound(
        competitionId
      );
    }

    const { data, error } =
      await supabase
        .from("competitions")
        .update({
          active_round: round,
        })
        .eq("id", competitionId)
        .select(
          "id, name, active_round"
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        `Unable to save active round to Supabase: ${error.message}`
      );
    }

    if (!data) {
      return this.getActiveRound(
        competitionId
      );
    }

    const savedRound =
      Number(data.active_round);

    if (
      Number.isInteger(savedRound) &&
      savedRound > 0
    ) {
      return savedRound;
    }

    return round;
  }
}

const competitionRepository =
  new CompetitionRepository();

export default competitionRepository;