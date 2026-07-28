import fixtureRepository from "../repositories/fixtureRepository";
import type { Fixture } from "../types/fixture";
import type { FirstTeamToScoreType } from "../lib/enums";

class FixtureService {
  getAll(): Fixture[] {
    return fixtureRepository.getAll();
  }

  getPublished(): Fixture[] {
    return fixtureRepository.getPublished();
  }

  getByCompetition(competitionId: string): Fixture[] {
    return fixtureRepository.getByCompetition(competitionId);
  }

  getById(id: string): Fixture | undefined {
    return fixtureRepository.getById(id);
  }

  getByRound(round: number): Fixture[] {
    return fixtureRepository.getByRound(round);
  }

  getByStreak(streak: number): Fixture[] {
    return fixtureRepository.getByStreak(streak);
  }

  updateResult(
    fixtureId: string,
    homeScore: number,
    awayScore: number,
    firstTeamToScore: FirstTeamToScoreType
  ): Fixture | undefined {
    return fixtureRepository.updateResult(
      fixtureId,
      homeScore,
      awayScore,
      firstTeamToScore
    );
  }

  publishResult(
    fixtureId: string,
    homeScore: number,
    awayScore: number,
    firstTeamToScore: FirstTeamToScoreType
  ): Fixture | undefined {
    const fixture = fixtureRepository.updateResult(
      fixtureId,
      homeScore,
      awayScore,
      firstTeamToScore
    );

    if (!fixture) {
      return undefined;
    }

    fixture.status = "Completed";

    return fixture;
  }
}

const fixtureService = new FixtureService();

export default fixtureService;