import fixtures from "../data/fixtures";
import type { Fixture } from "../types/fixture";
import type { FirstTeamToScoreType } from "../lib/enums";
import { supabase } from "../lib/supabase";

class FixtureRepository {
  private mapSupabaseFixture(
    row: Record<string, unknown>
  ): Fixture {
    return {
      id: row.id as string,

      competitionId:
        row.competition_id as Fixture["competitionId"],

      round:
        (row.round as number) ?? 0,

      streak: 0,

      matchDate:
        (row.match_date as string) ?? "",

      kickOff:
        (row.kick_off as string) ?? "",

      displayDate:
        (row.match_date as string) ?? "",

      homeTeam:
        row.home_team as string,

      awayTeam:
        row.away_team as string,

      status:
        row.status as Fixture["status"],

      homeScore:
        row.home_score as number | undefined,

      awayScore:
        row.away_score as number | undefined,

      firstTeamToScore:
        row.first_team_to_score as
          | "Home"
          | "Away"
          | "None"
          | null
          | undefined,

      published:
        (row.published as boolean) ?? false,
    };
  }

  private mapFixtureToSupabase(
    fixture: Fixture
  ) {
    return {
      id: fixture.id,

      competition_id:
        fixture.competitionId,

      round:
        fixture.round,

      match_date:
        fixture.matchDate,

      home_team:
        fixture.homeTeam,

      away_team:
        fixture.awayTeam,

      home_score:
        fixture.homeScore ?? null,

      away_score:
        fixture.awayScore ?? null,

      first_team_to_score:
        fixture.firstTeamToScore ?? null,

      status:
        fixture.status,

      kick_off:
        fixture.kickOff,

      published:
        fixture.published,
    };
  }

  async getAllFromSupabase(): Promise<Fixture[]> {
    const { data, error } = await supabase
      .from("fixtures")
      .select("*")
      .order("match_date", {
        ascending: true,
      });

    if (error) {
      throw new Error(
        `Unable to load fixtures from Supabase: ${error.message}`
      );
    }

    return (data ?? []).map(
      (row) =>
        this.mapSupabaseFixture(
          row as Record<string, unknown>
        )
    );
  }

  async getByCompetitionFromSupabase(
    competitionId: string
  ): Promise<Fixture[]> {
    const { data, error } = await supabase
      .from("fixtures")
      .select("*")
      .eq(
        "competition_id",
        competitionId
      )
      .order("match_date", {
        ascending: true,
      });

    if (error) {
      throw new Error(
        `Unable to load competition fixtures from Supabase: ${error.message}`
      );
    }

    return (data ?? []).map(
      (row) =>
        this.mapSupabaseFixture(
          row as Record<string, unknown>
        )
    );
  }

  async getAll(): Promise<Fixture[]> {
    return this.getAllFromSupabase();
  }

  async getPublished(): Promise<Fixture[]> {
    const fixtures =
      await this.getAllFromSupabase();

    return fixtures.filter(
      (fixture) => fixture.published
    );
  }

  async getByCompetition(
    competitionId: string
  ): Promise<Fixture[]> {
    return this.getByCompetitionFromSupabase(
      competitionId
    );
  }

  async getById(
    id: string
  ): Promise<Fixture | undefined> {
    const { data, error } = await supabase
      .from("fixtures")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Unable to load fixture from Supabase: ${error.message}`
      );
    }

    if (!data) {
      return undefined;
    }

    return this.mapSupabaseFixture(
      data as Record<string, unknown>
    );
  }

  async getByRound(
    round: number
  ): Promise<Fixture[]> {
    const { data, error } = await supabase
      .from("fixtures")
      .select("*")
      .eq("round", round)
      .order("match_date", {
        ascending: true,
      });

    if (error) {
      throw new Error(
        `Unable to load fixtures by round from Supabase: ${error.message}`
      );
    }

    return (data ?? []).map(
      (row) =>
        this.mapSupabaseFixture(
          row as Record<string, unknown>
        )
    );
  }

  async getByStreak(
    streak: number
  ): Promise<Fixture[]> {
    /*
     * The current Supabase fixtures table does not
     * contain a streak column.
     *
     * Keep the method for compatibility with the
     * existing application interface.
     *
     * Streak remains application-derived for now.
     */
    const allFixtures =
      await this.getAllFromSupabase();

    if (streak === 0) {
      return allFixtures;
    }

    return allFixtures.filter(
      (fixture) => fixture.streak === streak
    );
  }

  async addFixture(
    fixture: Fixture
  ): Promise<Fixture> {
    const payload =
      this.mapFixtureToSupabase(fixture);

    const { data, error } = await supabase
      .from("fixtures")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw new Error(
        `Unable to add fixture to Supabase: ${error.message}`
      );
    }

    return this.mapSupabaseFixture(
      data as Record<string, unknown>
    );
  }

  async updateFixture(
    fixtureId: string,
    updates: Partial<Fixture>
  ): Promise<Fixture | undefined> {
    const supabaseUpdates: Record<
      string,
      unknown
    > = {};

    if (
      updates.competitionId !== undefined
    ) {
      supabaseUpdates.competition_id =
        updates.competitionId;
    }

    if (updates.round !== undefined) {
      supabaseUpdates.round =
        updates.round;
    }

    if (updates.matchDate !== undefined) {
      supabaseUpdates.match_date =
        updates.matchDate;
    }

    if (updates.kickOff !== undefined) {
      supabaseUpdates.kick_off =
        updates.kickOff;
    }

    if (updates.homeTeam !== undefined) {
      supabaseUpdates.home_team =
        updates.homeTeam;
    }

    if (updates.awayTeam !== undefined) {
      supabaseUpdates.away_team =
        updates.awayTeam;
    }

    if (updates.homeScore !== undefined) {
      supabaseUpdates.home_score =
        updates.homeScore;
    }

    if (updates.awayScore !== undefined) {
      supabaseUpdates.away_score =
        updates.awayScore;
    }

    if (
      updates.firstTeamToScore !== undefined
    ) {
      supabaseUpdates.first_team_to_score =
        updates.firstTeamToScore;
    }

    if (updates.status !== undefined) {
      supabaseUpdates.status =
        updates.status;
    }

    if (updates.published !== undefined) {
      supabaseUpdates.published =
        updates.published;
    }

    if (
      Object.keys(supabaseUpdates).length === 0
    ) {
      return this.getById(fixtureId);
    }

    const { data, error } = await supabase
      .from("fixtures")
      .update(supabaseUpdates)
      .eq("id", fixtureId)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(
        `Unable to update fixture in Supabase: ${error.message}`
      );
    }

    if (!data) {
      return undefined;
    }

    return this.mapSupabaseFixture(
      data as Record<string, unknown>
    );
  }

  async deleteFixture(
    fixtureId: string
  ): Promise<boolean> {
    const { data, error } = await supabase
      .from("fixtures")
      .delete()
      .eq("id", fixtureId)
      .select("id");

    if (error) {
      throw new Error(
        `Unable to delete fixture from Supabase: ${error.message}`
      );
    }

    return (data ?? []).length > 0;
  }

  async updateResult(
    fixtureId: string,
    homeScore: number,
    awayScore: number,
    firstTeamToScore: FirstTeamToScoreType
  ): Promise<Fixture | undefined> {
    const { data, error } = await supabase
      .from("fixtures")
      .update({
        home_score: homeScore,
        away_score: awayScore,
        first_team_to_score:
          firstTeamToScore,
        status: "Completed",
        published: true,
      })
      .eq("id", fixtureId)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(
        `Unable to update fixture result in Supabase: ${error.message}`
      );
    }

    if (!data) {
      return undefined;
    }

    return this.mapSupabaseFixture(
      data as Record<string, unknown>
    );
  }

  /**
   * QA TOOLKIT RESET
   *
   * Returns fixtures to a fresh testing state:
   * - Removes published results
   * - Resets status to Scheduled
   * - Clears official scores
   */
  async resetFixtures(): Promise<void> {
    const { error } = await supabase
      .from("fixtures")
      .update({
        published: false,
        status: "Scheduled",
        home_score: null,
        away_score: null,
        first_team_to_score: null,
      })
      .not("id", "is", null);

    if (error) {
      throw new Error(
        `Unable to reset fixtures in Supabase: ${error.message}`
      );
    }
  }

  /**
   * Local seed data retained for reference during
   * migration and development.
   */
  getLocalSeedFixtures(): Fixture[] {
    return [...fixtures];
  }
}

const fixtureRepository =
  new FixtureRepository();

export default fixtureRepository;