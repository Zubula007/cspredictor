import fixtureRepository from "../repositories/fixtureRepository";

import { CompetitionIds } from "../lib/enums";

class CompetitionService {
  async getActiveCompetition(): Promise<string> {
    const fixtures =
      await fixtureRepository.getAll();

    const now = new Date();

    // Upcoming fixtures
    const upcoming = fixtures
      .filter((fixture) => {
        const kickoff = new Date(
          `${fixture.matchDate}T${fixture.kickOff}:00`
        );

        return kickoff >= now;
      })
      .sort((a, b) => {
        const aDate = new Date(
          `${a.matchDate}T${a.kickOff}:00`
        ).getTime();

        const bDate = new Date(
          `${b.matchDate}T${b.kickOff}:00`
        ).getTime();

        return aDate - bDate;
      });

    if (upcoming.length > 0) {
      return upcoming[0].competitionId;
    }

    // No upcoming fixtures -> latest competition played
    const completed = [...fixtures].sort(
      (a, b) => {
        const aDate = new Date(
          `${a.matchDate}T${a.kickOff}:00`
        ).getTime();

        const bDate = new Date(
          `${b.matchDate}T${b.kickOff}:00`
        ).getTime();

        return bDate - aDate;
      }
    );

    if (completed.length > 0) {
      return completed[0].competitionId;
    }

    // Default
    return CompetitionIds.BET;
  }
}

const competitionService =
  new CompetitionService();

export default competitionService;