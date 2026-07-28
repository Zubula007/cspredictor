import fixtures from "../data/fixtures";
import type { Fixture } from "../types/fixture";
import type { FirstTeamToScoreType } from "../lib/enums";

class FixtureRepository {
  getAll(): Fixture[] {
    return fixtures;
  }

  getPublished(): Fixture[] {
    return fixtures.filter((fixture) => fixture.published);
  }

  getByCompetition(competitionId: string): Fixture[] {
    return fixtures.filter(
      (fixture) => fixture.competitionId === competitionId
    );
  }

  getById(id: string): Fixture | undefined {
    return fixtures.find((fixture) => fixture.id === id);
  }

  getByRound(round: number): Fixture[] {
    return fixtures.filter((fixture) => fixture.round === round);
  }

  getByStreak(streak: number): Fixture[] {
    return fixtures.filter(
      (fixture) => fixture.streak === streak
    );
  }

  updateResult(
    fixtureId: string,
    homeScore: number,
    awayScore: number,
    firstTeamToScore: FirstTeamToScoreType
  ): Fixture | undefined {

    const fixture = fixtures.find(
      (item) => item.id === fixtureId
    );

    if (!fixture) {
      return undefined;
    }

    fixture.homeScore = homeScore;
    fixture.awayScore = awayScore;
    fixture.firstTeamToScore = firstTeamToScore;

    return fixture;
  }
}

const fixtureRepository = new FixtureRepository();

export default fixtureRepository;