import { NextResponse } from "next/server";

import {
  CompetitionIds,
  type CompetitionId,
} from "../../lib/enums";

import pslService from "../../services/pslService";

const validCompetitionIds = Object.values(
  CompetitionIds
) as CompetitionId[];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(
      request.url
    );

    const competitionParam =
      searchParams.get("competition");

    if (
      !competitionParam ||
      !validCompetitionIds.includes(
        competitionParam as CompetitionId
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid or missing competition.",
        },
        {
          status: 400,
        }
      );
    }

    const competitionId =
      competitionParam as CompetitionId;

    const matches =
      await pslService.fetchMatches(
        competitionId
      );

    return NextResponse.json({
      source: "PSL",
      competitionId,
      matches,
    });
  } catch (error) {
    console.error(
      "PSL API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve PSL information.",
      },
      {
        status: 500,
      }
    );
  }
}