import type { Prediction } from "../types/prediction";
import { supabase } from "../lib/supabase";

class PredictionRepository {
  /*
   * ============================================================
   * SUPABASE -> APP
   * ============================================================
   */

  private mapSupabasePrediction(
    row: Record<string, unknown>
  ): Prediction {
    const resultPoints =
      (row.result_points as number | null) ?? 0;

    const exactPoints =
      (row.exact_points as number | null) ?? 0;

    const fttsPoints =
      (row.ftts_points as number | null) ?? 0;

    const totalPoints =
      (row.total_points as number | null) ??
      resultPoints +
        exactPoints +
        fttsPoints;

    return {
      id: row.id as string,

      playerId:
        row.player_id as string,

      fixtureId:
        row.fixture_id as string,

      homeScore:
        (row.home_score as number) ?? 0,

      awayScore:
        (row.away_score as number) ?? 0,

      firstTeamToScore:
        row.first_team_to_score as Prediction["firstTeamToScore"],

      submittedAt:
        (row.submitted_at as string) ??
        new Date().toISOString(),

      status:
        row.status as Prediction["status"],

      locked: false,

      points: totalPoints,

      exactScore:
        exactPoints > 0,

      correctResult:
        resultPoints > 0,

      correctFTTS:
        fttsPoints > 0,

      scored:
        totalPoints > 0,
    };
  }

  /*
   * ============================================================
   * SUPABASE READS
   * ============================================================
   */

  async getAll(): Promise<Prediction[]> {
    const { data, error } =
      await supabase
        .from("predictions")
        .select("*")
        .order("submitted_at", {
          ascending: true,
        });

    if (error) {
      throw new Error(
        `Unable to load predictions from Supabase: ${error.message}`
      );
    }

    return (data ?? []).map(
      (row) =>
        this.mapSupabasePrediction(
          row as Record<string, unknown>
        )
    );
  }

  async getByPlayer(
    playerId: string
  ): Promise<Prediction[]> {
    const { data, error } =
      await supabase
        .from("predictions")
        .select("*")
        .eq("player_id", playerId)
        .order("submitted_at", {
          ascending: true,
        });

    if (error) {
      throw new Error(
        `Unable to load player predictions from Supabase: ${error.message}`
      );
    }

    return (data ?? []).map(
      (row) =>
        this.mapSupabasePrediction(
          row as Record<string, unknown>
        )
    );
  }

  async getByFixture(
    fixtureId: string
  ): Promise<Prediction[]> {
    const { data, error } =
      await supabase
        .from("predictions")
        .select("*")
        .eq("fixture_id", fixtureId)
        .order("submitted_at", {
          ascending: true,
        });

    if (error) {
      throw new Error(
        `Unable to load fixture predictions from Supabase: ${error.message}`
      );
    }

    return (data ?? []).map(
      (row) =>
        this.mapSupabasePrediction(
          row as Record<string, unknown>
        )
    );
  }

  /*
   * ============================================================
   * SAVE / UPSERT
   * ============================================================
   *
   * Prediction ID is:
   *
   * playerId-fixtureId
   *
   * Therefore a player can update their prediction without
   * creating duplicate records.
   */

  async save(
    prediction: Prediction
  ): Promise<void> {
    const payload = {
      id: prediction.id,

      player_id:
        prediction.playerId,

      fixture_id:
        prediction.fixtureId,

      home_score:
        prediction.homeScore,

      away_score:
        prediction.awayScore,

      first_team_to_score:
        prediction.firstTeamToScore,

      status:
        prediction.status,

      submitted_at:
        prediction.submittedAt,

      result_points:
        prediction.correctResult
          ? 3
          : 0,

      exact_points:
        prediction.exactScore
          ? 2
          : 0,

      ftts_points:
        prediction.correctFTTS
          ? 1
          : 0,

      total_points:
        prediction.points ?? 0,
    };

    const { error } =
      await supabase
        .from("predictions")
        .upsert(payload, {
          onConflict: "id",
        });

    if (error) {
      throw new Error(
        `Unable to save prediction to Supabase: ${error.message}`
      );
    }
  }

  /*
   * ============================================================
   * UPDATE SCORED PREDICTION
   * ============================================================
   */

  async updateScoredPrediction(
    predictionId: string,
    points: number,
    correctResult: boolean,
    exactScore: boolean,
    correctFTTS: boolean
  ): Promise<
    Prediction | undefined
  > {
    const resultPoints =
      correctResult ? 3 : 0;

    const exactPoints =
      exactScore ? 2 : 0;

    const fttsPoints =
      correctFTTS ? 1 : 0;

    const { data, error } =
      await supabase
        .from("predictions")
        .update({
          result_points:
            resultPoints,

          exact_points:
            exactPoints,

          ftts_points:
            fttsPoints,

          total_points:
            points,
        })
        .eq("id", predictionId)
        .select("*")
        .maybeSingle();

    if (error) {
      throw new Error(
        `Unable to update scored prediction in Supabase: ${error.message}`
      );
    }

    if (!data) {
      return undefined;
    }

    return this.mapSupabasePrediction(
      data as Record<string, unknown>
    );
  }

  /*
   * ============================================================
   * RESET
   * ============================================================
   */

  async reset(): Promise<void> {
    const { error } =
      await supabase
        .from("predictions")
        .delete()
        .not("id", "is", null);

    if (error) {
      throw new Error(
        `Unable to reset predictions in Supabase: ${error.message}`
      );
    }
  }
}

const predictionRepository =
  new PredictionRepository();

export default predictionRepository;