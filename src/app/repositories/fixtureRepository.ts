import fixtures from "../data/fixtures";
import type { Fixture } from "../types/fixture";

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
    return fixtures.filter((fixture) => fixture.streak === streak);
  }
}

const fixtureRepository = new FixtureRepository();

export default fixtureRepository;