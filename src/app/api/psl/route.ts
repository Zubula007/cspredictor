import { NextResponse } from "next/server";

import {
  CompetitionIds,
  type CompetitionId,
} from "../../lib/enums";

const PSL_SOURCE_URL =
  "https://www.psl.co.za/tournament/betway-premiership";

const PSL_MATCH_CENTRE_URL =
  "https://www.psl.co.za/matchcentre?type=log&tournament=betway-premiership";

const validCompetitionIds =
  Object.values(CompetitionIds) as CompetitionId[];

interface PSLSourceMatch {
  id?: string;

  competitionId: CompetitionId;

  round: number;

  matchDate: string;

  kickOff: string;

  displayDate: string;

  homeTeam: string;

  awayTeam: string;

  status:
    | "Scheduled"
    | "Postponed"
    | "Live"
    | "Completed"
    | "Cancelled";

  homeScore?: number;

  awayScore?: number;

  firstTeamToScore?:
    | "Home"
    | "Away"
    | "None"
    | null;

  source: "PSL";

  importType: "Fixture" | "Result";
}

const completedRoundCounts: Record<
  string,
  number
> = {
  "Mamelodi Sundowns": 0,
  "Marumo Gallants": 0,
};

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function stripHtml(value: string): string {
  return decodeHtml(
    value
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]*>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function createStableSourceId(
  competitionId: CompetitionId,
  round: number,
  matchDate: string,
  homeTeam: string,
  awayTeam: string
): string {
  return [
    competitionId,
    round,
    matchDate,
    homeTeam,
    awayTeam,
  ]
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseDate(value: string): string {
  const parts = value.trim().split(/\s+/);

  if (parts.length !== 3) {
    throw new Error(
      `Invalid PSL date: ${value}`
    );
  }

  const day = parts[0].padStart(2, "0");
  const monthName =
    parts[1].toLowerCase();
  const year = parts[2];

  const months: Record<string, string> = {
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    may: "05",
    jun: "06",
    jul: "07",
    aug: "08",
    sep: "09",
    oct: "10",
    nov: "11",
    dec: "12",
  };

  const month = months[monthName];

  if (!month) {
    throw new Error(
      `Invalid PSL month: ${monthName}`
    );
  }

  return `${year}-${month}-${day}`;
}

function getRound(
  homeTeam: string,
  awayTeam: string
): number {
  const homeCount =
    completedRoundCounts[homeTeam] ?? 0;

  const awayCount =
    completedRoundCounts[awayTeam] ?? 0;

  const round =
    Math.max(
      homeCount,
      awayCount
    ) + 1;

  completedRoundCounts[homeTeam] =
    round;

  completedRoundCounts[awayTeam] =
    round;

  return round;
}

function extractFixtureMatches(
  html: string,
  competitionId: CompetitionId
): PSLSourceMatch[] {
  const matchCentreIndex =
    html.indexOf("Match Centre");

  if (matchCentreIndex === -1) {
    throw new Error(
      "Could not locate the PSL Match Centre."
    );
  }

  const loadMoreMatch =
    html.match(/load\s+more/i);

  const loadMoreIndex =
    loadMoreMatch?.index ??
    html.length;

  const fixtureSection =
    html.slice(
      matchCentreIndex,
      loadMoreIndex
    );

  const teamMatches = [
    ...fixtureSection.matchAll(
      /<h6\b[^>]*>([\s\S]*?)<\/h6>/gi
    ),
  ].map((match) =>
    stripHtml(match[1])
  );

  const dateHeadings = [
    ...fixtureSection.matchAll(
      /\b(\d{1,2}\s+[A-Za-z]{3}\s+\d{4})\b/g
    ),
  ].map((match) => ({
    value: match[1],
    index: match.index ?? 0,
  }));

  const fixtureDetails = [
    ...fixtureSection.matchAll(
      /(\d{1,2}\s+[A-Za-z]{3})\s+(\d{1,2}:\d{2})\s+-/g
    ),
  ].map((match) => ({
    date: match[1],
    kickOff: match[2],
    index: match.index ?? 0,
  }));

  if (
    teamMatches.length === 0 ||
    fixtureDetails.length === 0
  ) {
    throw new Error(
      "No PSL fixtures could be parsed from the Match Centre."
    );
  }

  if (
    teamMatches.length <
    fixtureDetails.length * 2
  ) {
    throw new Error(
      "PSL fixture parser found fewer teams than fixtures."
    );
  }

  const matches: PSLSourceMatch[] = [];

  let dateHeadingIndex = 0;
  let currentDisplayDate = "";

  for (
    let index = 0;
    index < fixtureDetails.length;
    index += 1
  ) {
    const detail =
      fixtureDetails[index];

    while (
      dateHeadingIndex <
        dateHeadings.length &&
      dateHeadings[
        dateHeadingIndex
      ].index < detail.index
    ) {
      currentDisplayDate =
        dateHeadings[
          dateHeadingIndex
        ].value;

      dateHeadingIndex += 1;
    }

    if (!currentDisplayDate) {
      throw new Error(
        "Could not determine the date for a PSL fixture."
      );
    }

    const homeTeam =
      teamMatches[index * 2];

    const awayTeam =
      teamMatches[index * 2 + 1];

    if (!homeTeam || !awayTeam) {
      continue;
    }

    const matchDate =
      parseDate(
        currentDisplayDate
      );

    const round =
      getRound(
        homeTeam,
        awayTeam
      );

    matches.push({
      id: createStableSourceId(
        competitionId,
        round,
        matchDate,
        homeTeam,
        awayTeam
      ),

      competitionId,

      round,

      matchDate,

      kickOff:
        detail.kickOff,

      displayDate:
        currentDisplayDate,

      homeTeam,

      awayTeam,

      status: "Scheduled",

      source: "PSL",

      importType: "Fixture",
    });
  }

  return matches;
}

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const competitionParam =
      searchParams.get(
        "competition"
      );

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

    if (
      competitionId !==
      CompetitionIds.BET
    ) {
      return NextResponse.json(
        {
          error:
            "PSL import currently supports the Betway Premiership only.",
        },
        {
          status: 400,
        }
      );
    }

    const response =
      await fetch(
        PSL_MATCH_CENTRE_URL,
        {
          method: "GET",
          cache: "no-store",
          headers: {
            Accept:
              "text/html,application/xhtml+xml",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/151 Safari/537.36",
          },
        }
      );

    if (!response.ok) {
      throw new Error(
        `PSL website request failed with status ${response.status}.`
      );
    }

    const html =
      await response.text();

    const matches =
      extractFixtureMatches(
        html,
        competitionId
      );

    return NextResponse.json({
      source: "PSL",
      sourceUrl:
        PSL_SOURCE_URL,
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