import type {
  PSLImport,
  PSLImportStatus,
} from "../types/pslImport";

import { supabase } from "../lib/supabase";

class PSLImportRepository {
  private mapSupabaseImport(
    row: Record<string, unknown>
  ): PSLImport {
    const matchDate = row.match_date as string;

    return {
      id: row.id as string,

      source: row.source as "PSL",

      sourceUrl:
        (row.source_url as string) ?? "",

      importType:
        row.import_type as PSLImport["importType"],

      competitionId:
        row.competition_id as PSLImport["competitionId"],

      round:
        (row.round as number) ?? 0,

      matchDate:
        matchDate ?? "",

      kickOff:
        (row.kick_off as string) ?? "",

      displayDate:
        matchDate
          ? new Date(matchDate).toLocaleDateString(
              "en-ZA",
              {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              }
            )
          : "",

      homeTeam:
        (row.home_team as string) ?? "",

      awayTeam:
        (row.away_team as string) ?? "",

      status:
        row.status as PSLImport["status"],

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

      importedAt:
        (row.created_at as string) ??
        new Date().toISOString(),

      reviewStatus:
        (row.review_status as PSLImportStatus) ??
        "Pending",

      reviewedAt:
        row.reviewed_at as string | undefined,

      reviewedBy:
        row.reviewed_by as string | undefined,

      rejectionReason:
        row.rejection_reason as string | undefined,
    };
  }

  private mapImportToSupabase(
    importItem: PSLImport
  ) {
    return {
      id: importItem.id,

      source:
        importItem.source,

      source_url:
        importItem.sourceUrl,

      import_type:
        importItem.importType,

      competition_id:
        importItem.competitionId,

      round:
        importItem.round,

      match_date:
        importItem.matchDate,

      home_team:
        importItem.homeTeam,

      away_team:
        importItem.awayTeam,

      kick_off:
        importItem.kickOff,

      status:
        importItem.status,

      review_status:
        importItem.reviewStatus,

      reviewed_at:
        importItem.reviewedAt ?? null,

      reviewed_by:
        importItem.reviewedBy ?? null,

      rejection_reason:
        importItem.rejectionReason ?? null,

      raw_data:
        importItem,
    };
  }

  async getAll(): Promise<PSLImport[]> {
    const { data, error } = await supabase
      .from("psl_imports")
      .select("*")
      .order("match_date", {
        ascending: true,
      });

    if (error) {
      throw new Error(
        `Unable to load PSL imports from Supabase: ${error.message}`
      );
    }

    return (data ?? []).map(
      (row) =>
        this.mapSupabaseImport(
          row as Record<string, unknown>
        )
    );
  }

  async getById(
    id: string
  ): Promise<PSLImport | undefined> {
    const { data, error } = await supabase
      .from("psl_imports")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(
        `Unable to load PSL import from Supabase: ${error.message}`
      );
    }

    if (!data) {
      return undefined;
    }

    return this.mapSupabaseImport(
      data as Record<string, unknown>
    );
  }

  async getByStatus(
    reviewStatus: PSLImportStatus
  ): Promise<PSLImport[]> {
    const { data, error } = await supabase
      .from("psl_imports")
      .select("*")
      .eq("review_status", reviewStatus)
      .order("match_date", {
        ascending: true,
      });

    if (error) {
      throw new Error(
        `Unable to load PSL imports by status: ${error.message}`
      );
    }

    return (data ?? []).map(
      (row) =>
        this.mapSupabaseImport(
          row as Record<string, unknown>
        )
    );
  }

  async add(
    importItem: PSLImport
  ): Promise<PSLImport> {
    const payload =
      this.mapImportToSupabase(importItem);

    const { data, error } = await supabase
      .from("psl_imports")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw new Error(
        `Unable to add PSL import to Supabase: ${error.message}`
      );
    }

    return this.mapSupabaseImport(
      data as Record<string, unknown>
    );
  }

  async addMany(
    importItems: PSLImport[]
  ): Promise<PSLImport[]> {
    if (importItems.length === 0) {
      return [];
    }

    const payload =
      importItems.map((item) =>
        this.mapImportToSupabase(item)
      );

    const { data, error } = await supabase
      .from("psl_imports")
      .upsert(payload, {
        onConflict: "id",
      })
      .select("*");

    if (error) {
      throw new Error(
        `Unable to add PSL imports to Supabase: ${error.message}`
      );
    }

    return (data ?? []).map(
      (row) =>
        this.mapSupabaseImport(
          row as Record<string, unknown>
        )
    );
  }

  async update(
    id: string,
    changes: Partial<PSLImport>
  ): Promise<PSLImport | undefined> {
    const updates: Record<string, unknown> = {};

    if (changes.sourceUrl !== undefined) {
      updates.source_url =
        changes.sourceUrl;
    }

    if (changes.importType !== undefined) {
      updates.import_type =
        changes.importType;
    }

    if (changes.competitionId !== undefined) {
      updates.competition_id =
        changes.competitionId;
    }

    if (changes.round !== undefined) {
      updates.round = changes.round;
    }

    if (changes.matchDate !== undefined) {
      updates.match_date =
        changes.matchDate;
    }

    if (changes.kickOff !== undefined) {
      updates.kick_off =
        changes.kickOff;
    }

    if (changes.homeTeam !== undefined) {
      updates.home_team =
        changes.homeTeam;
    }

    if (changes.awayTeam !== undefined) {
      updates.away_team =
        changes.awayTeam;
    }

    if (changes.status !== undefined) {
      updates.status =
        changes.status;
    }

    if (changes.homeScore !== undefined) {
      updates.home_score =
        changes.homeScore;
    }

    if (changes.awayScore !== undefined) {
      updates.away_score =
        changes.awayScore;
    }

    if (
      changes.firstTeamToScore !== undefined
    ) {
      updates.first_team_to_score =
        changes.firstTeamToScore;
    }

    if (changes.reviewStatus !== undefined) {
      updates.review_status =
        changes.reviewStatus;
    }

    if (changes.reviewedAt !== undefined) {
      updates.reviewed_at =
        changes.reviewedAt;
    }

    if (changes.reviewedBy !== undefined) {
      updates.reviewed_by =
        changes.reviewedBy;
    }

    if (
      changes.rejectionReason !== undefined
    ) {
      updates.rejection_reason =
        changes.rejectionReason;
    }

    if (Object.keys(updates).length === 0) {
      return this.getById(id);
    }

    const { data, error } = await supabase
      .from("psl_imports")
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(
        `Unable to update PSL import in Supabase: ${error.message}`
      );
    }

    if (!data) {
      return undefined;
    }

    return this.mapSupabaseImport(
      data as Record<string, unknown>
    );
  }

  async approve(
    id: string,
    reviewedBy: string
  ): Promise<PSLImport | undefined> {
    return this.update(id, {
      reviewStatus: "Approved",
      reviewedAt:
        new Date().toISOString(),
      reviewedBy,
      rejectionReason: undefined,
    });
  }

  async reject(
    id: string,
    reviewedBy: string,
    rejectionReason?: string
  ): Promise<PSLImport | undefined> {
    return this.update(id, {
      reviewStatus: "Rejected",
      reviewedAt:
        new Date().toISOString(),
      reviewedBy,
      rejectionReason,
    });
  }

  async remove(
    id: string
  ): Promise<void> {
    const { error } = await supabase
      .from("psl_imports")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(
        `Unable to delete PSL import from Supabase: ${error.message}`
      );
    }
  }

  async clear(): Promise<void> {
    const { error } = await supabase
      .from("psl_imports")
      .delete()
      .not("id", "is", null);

    if (error) {
      throw new Error(
        `Unable to clear PSL imports from Supabase: ${error.message}`
      );
    }
  }
}

const pslImportRepository =
  new PSLImportRepository();

export default pslImportRepository;