import { NextResponse } from "next/server";

import {
  CompetitionIds,
  type CompetitionId,
} from "../../lib/enums";

/*
 * IMPORTANT
 * ----------
 * The PSL Match Centre currently returns the page shell but does not
 * contain the fixture data in the server-rendered HTML.
 *
 * SuperSport exposes the current Betway Premiership fixture schedule
 * server-side, so this API uses that page as the fixture source.
 */

const PSL_SOURCE_URL =
  "https://www.psl.co.za/tournament/betway-premiership";

const SUPERSPORT_FIXTURES_URL =
  "https://supersport.com/football/tour/882fc52f-14b7-4e7c-a259-5ff5d18bde67/fixtures";

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

/*
 * These are the current 2026/27 Betway Premiership teams
 * shown by SuperSport.
 *
 * We deliberately use a controlled list so that navigation,
 * sponsor text, stadium names, logos and other page content
 * cannot accidentally become team names.
 */
const TEAM_NAMES = [
  "Kaizer Chiefs",
  "Orlando Pirates",
  "Polokwane City",
  "AmaZulu FC",
  "Sekhukhune United",
  "Siwelele",
  "TS Galaxy",
  "Chippa United",
  "Golden Arrows",
  "Mamelodi Sundowns",
  "Marumo Gallants",
  "Richards Bay",
  "Durban City",
  "Stellenbosch FC",
  "Kruger United",
  "Milford FC",
] as const;

type TeamName =
  (typeof TEAM_NAMES)[number];

/*
 * Some sources occasionally use slightly different spellings.
 * Keep the canonical CSPredictor names on output.
 */
const TEAM_ALIASES: Record<
  string,
  TeamName
> = {
  "kaizer chiefs":
    "Kaizer Chiefs",

  "orlando pirates":
    "Orlando Pirates",

  "polokwane city":
    "Polokwane City",

  "amazulu fc":
    "AmaZulu FC",

  amazulu:
    "AmaZulu FC",

  "sekhukhune united":
    "Sekhukhune United",

  siwelele:
    "Siwelele",

  "ts galaxy":
    "TS Galaxy",

  "chippa united":
    "Chippa United",

  "golden arrows":
    "Golden Arrows",

  "mamelodi sundowns":
    "Mamelodi Sundowns",

  "marumo gallants":
    "Marumo Gallants",

  "richards bay":
    "Richards Bay",

  "durban city":
    "Durban City",

  "stellenbosch fc":
    "Stellenbosch FC",

  "stellenbosch":
    "Stellenbosch FC",

  "kruger united":
    "Kruger United",

  "milford fc":
    "Milford FC",
};

function normaliseWhitespace(
  value: string
): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(
  value: string
): string {
  return value
    .replace(/&amp;/gi, "&")
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&#x27;/gi, "'")
    .replace(/&#x2F;/gi, "/");
}

function stripHtml(
  value: string
): string {
  return normaliseWhitespace(
    decodeHtml(
      value
        .replace(
          /<br\s*\/?>/gi,
          " "
        )
        .replace(
          /<[^>]*>/g,
          " "
        )
    )
  );
}

function canonicalTeamName(
  value: string
): TeamName | null {
  const cleaned =
    normaliseWhitespace(
      value
    ).toLowerCase();

  return (
    TEAM_ALIASES[cleaned] ??
    null
  );
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
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );
}

function parseDateHeading(
  value: string
): {
  isoDate: string;
  displayDate: string;
} | null {
  const match =
    value.match(
      /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/i
    );

  if (!match) {
    return null;
  }

  const day =
    match[2].padStart(
      2,
      "0"
    );

  const monthName =
    match[3].toLowerCase();

  const year =
    match[4];

  const months: Record<
    string,
    string
  > = {
    january: "01",
    february: "02",
    march: "03",
    april: "04",
    may: "05",
    june: "06",
    july: "07",
    august: "08",
    september: "09",
    october: "10",
    november: "11",
    december: "12",
  };

  const month =
    months[monthName];

  if (!month) {
    return null;
  }

  return {
    isoDate:
      `${year}-${month}-${day}`,

    displayDate:
      `${match[2]} ${match[3]} ${year}`,
  };
}

function parseDateFromText(
  value: string
): {
  isoDate: string;
  displayDate: string;
} | null {
  const match =
    value.match(
      /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\b/i
    );

  if (!match) {
    return null;
  }

  const day =
    match[1].padStart(
      2,
      "0"
    );

  const monthName =
    match[2].toLowerCase();

  const year =
    match[3];

  const months: Record<
    string,
    string
  > = {
    january: "01",
    february: "02",
    march: "03",
    april: "04",
    may: "05",
    june: "06",
    july: "07",
    august: "08",
    september: "09",
    october: "10",
    november: "11",
    december: "12",
  };

  const month =
    months[monthName];

  if (!month) {
    return null;
  }

  return {
    isoDate:
      `${year}-${month}-${day}`,

    displayDate:
      `${match[1]} ${match[2]} ${year}`,
  };
}

/*
 * The current SuperSport page exposes match links containing text
 * similar to:
 *
 *   AmaZulu FC Orlando Pirates 17:30
 *
 * The venue is in a separate link immediately before it.
 *
 * We inspect <a> elements rather than relying on fragile CSS classes.
 */
interface MatchAnchor {
  index: number;
  text: string;
}

function extractAnchorTexts(
  html: string
): MatchAnchor[] {
  const anchors: MatchAnchor[] = [];

  const anchorRegex =
    /<a\b[^>]*>([\s\S]*?)<\/a>/gi;

  let match:
    RegExpExecArray | null;

  while (
    (match =
      anchorRegex.exec(html)) !==
    null
  ) {
    anchors.push({
      index: match.index,
      text: stripHtml(
        match[1]
      ),
    });
  }

  return anchors;
}

function findTeamsInText(
  text: string
): TeamName[] {
  const found: Array<{
    team: TeamName;
    index: number;
  }> = [];

  const lower =
    text.toLowerCase();

  for (const [
    alias,
    canonical,
  ] of Object.entries(
    TEAM_ALIASES
  )) {
    let start = 0;

    while (true) {
      const index =
        lower.indexOf(
          alias,
          start
        );

      if (index === -1) {
        break;
      }

      found.push({
        team: canonical,
        index,
      });

      start =
        index +
        alias.length;
    }
  }

  found.sort(
    (a, b) =>
      a.index - b.index
  );

  const unique: TeamName[] =
    [];

  for (const item of found) {
    if (
      !unique.includes(
        item.team
      )
    ) {
      unique.push(
        item.team
      );
    }
  }

  return unique;
}

function calculateRound(
  matchDate: string
): number {
  /*
   * The 2026/27 Betway Premiership
   * opened on 1 August 2026.
   *
   * This gives us a useful rolling round number
   * without depending on a fragile page field.
   */
  const seasonStart =
    new Date(
      "2026-08-01T00:00:00+02:00"
    );

  const date =
    new Date(
      `${matchDate}T00:00:00+02:00`
    );

  const difference =
    date.getTime() -
    seasonStart.getTime();

  if (
    Number.isNaN(
      difference
    ) ||
    difference < 0
  ) {
    return 1;
  }

  return (
    Math.floor(
      difference /
        (7 *
          24 *
          60 *
          60 *
          1000)
    ) + 1
  );
}

function isFutureFixture(
  matchDate: string,
  kickOff: string
): boolean {
  const value =
    new Date(
      `${matchDate}T${kickOff}:00+02:00`
    );

  if (
    Number.isNaN(
      value.getTime()
    )
  ) {
    return true;
  }

  return (
    value.getTime() >
    Date.now()
  );
}

function extractFixtureMatches(
  html: string,
  competitionId: CompetitionId
): PSLSourceMatch[] {
  const anchors =
    extractAnchorTexts(
      html
    );

  if (
    anchors.length === 0
  ) {
    throw new Error(
      "No SuperSport links could be parsed."
    );
  }

  /*
   * Locate the date headings in the raw HTML.
   *
   * We keep their raw positions so that every match can be
   * associated with the nearest preceding date.
   */
  const dateMatches: Array<{
    index: number;
    date: string;
    displayDate: string;
  }> = [];

  const dateRegex =
    /(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}/gi;

  let dateMatch:
    RegExpExecArray | null;

  while (
    (dateMatch =
      dateRegex.exec(html)) !==
    null
  ) {
    const parsed =
      parseDateFromText(
        dateMatch[0]
      );

    if (!parsed) {
      continue;
    }

    dateMatches.push({
      index:
        dateMatch.index,
      date:
        parsed.isoDate,
      displayDate:
        parsed.displayDate,
    });
  }

  if (
    dateMatches.length === 0
  ) {
    throw new Error(
      "No SuperSport fixture dates could be parsed."
    );
  }

  const matches: PSLSourceMatch[] =
    [];

  const seen = new Set<string>();

  for (const anchor of anchors) {
    /*
     * A match anchor contains a kickoff time.
     * This immediately eliminates most navigation/team links.
     */
    const timeMatch =
      anchor.text.match(
        /\b(\d{1,2}):(\d{2})\b/
      );

    if (!timeMatch) {
      continue;
    }

    const kickOff =
      `${timeMatch[1].padStart(
        2,
        "0"
      )}:${timeMatch[2]}`;

    const teams =
      findTeamsInText(
        anchor.text
      );

    if (
      teams.length !== 2
    ) {
      continue;
    }

    const homeTeam =
      teams[0];

    const awayTeam =
      teams[1];

    if (
      homeTeam ===
      awayTeam
    ) {
      continue;
    }

    /*
     * Find the latest date heading before this anchor.
     */
    let currentDate:
      | {
          date: string;
          displayDate: string;
        }
      | null = null;

    for (
      const date of dateMatches
    ) {
      if (
        date.index <=
        anchor.index
      ) {
        currentDate = {
          date:
            date.date,
          displayDate:
            date.displayDate,
        };
      } else {
        break;
      }
    }

    if (!currentDate) {
      continue;
    }

    /*
     * The SuperSport page also contains completed fixtures above
     * the upcoming schedule. This import is specifically for
     * fixtures, so only future matches are returned.
     */
    if (
      !isFutureFixture(
        currentDate.date,
        kickOff
      )
    ) {
      continue;
    }

    const round =
      calculateRound(
        currentDate.date
      );

    const id =
      createStableSourceId(
        competitionId,
        round,
        currentDate.date,
        homeTeam,
        awayTeam
      );

    if (
      seen.has(id)
    ) {
      continue;
    }

    seen.add(id);

    matches.push({
      id,

      competitionId,

      round,

      matchDate:
        currentDate.date,

      kickOff,

      displayDate:
        currentDate.displayDate,

      homeTeam,

      awayTeam,

      status:
        "Scheduled",

      source:
        "PSL",

      importType:
        "Fixture",
    });
  }

  /*
   * Remove accidental duplicates and sort chronologically.
   */
  matches.sort(
    (a, b) => {
      const aTime =
        new Date(
          `${a.matchDate}T${a.kickOff}:00+02:00`
        ).getTime();

      const bTime =
        new Date(
          `${b.matchDate}T${b.kickOff}:00+02:00`
        ).getTime();

      return (
        aTime - bTime
      );
    }
  );

  if (
    matches.length === 0
  ) {
    throw new Error(
      "No future Betway Premiership fixtures could be parsed from the SuperSport fixture page."
    );
  }

  return matches;
}

export async function GET(
  request: Request
) {
  try {
    const {
      searchParams,
    } = new URL(
      request.url
    );

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
        SUPERSPORT_FIXTURES_URL,
        {
          method: "GET",

          cache:
            "no-store",

          headers: {
            Accept:
              "text/html,application/xhtml+xml",

            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36",

            "Accept-Language":
              "en-ZA,en;q=0.9",
          },
        }
      );

    if (
      !response.ok
    ) {
      throw new Error(
        `SuperSport fixture request failed with status ${response.status}.`
      );
    }

    const html =
      await response.text();

    if (
      !html ||
      html.length <
        1000
    ) {
      throw new Error(
        "SuperSport returned an unexpectedly short response."
      );
    }

    const matches =
      extractFixtureMatches(
        html,
        competitionId
      );

    return NextResponse.json({
      source:
        "PSL",

      /*
       * Keep the official PSL page here so the existing
       * "Verify PSL website" UI continues to point to the
       * official competition page.
       */
      sourceUrl:
        PSL_SOURCE_URL,

      /*
       * Expose the actual data source as well.
       */
      dataSourceUrl:
        SUPERSPORT_FIXTURES_URL,

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
            : "Failed to retrieve Betway Premiership fixtures.",

        source:
          "PSL",

        sourceUrl:
          PSL_SOURCE_URL,

        dataSourceUrl:
          SUPERSPORT_FIXTURES_URL,
      },
      {
        status: 500,
      }
    );
  }
}