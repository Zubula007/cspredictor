import fixtureRepository from "../repositories/fixtureRepository";
import type { Fixture } from "../types/fixture";

class FixtureService {
  getFixtures(): Fixture[] {
    return fixtureRepository.getPublished();
  }

  getFixture(id: string): Fixture | undefined {
    return fixtureRepository.getById(id);
  }

  getFixturesByCompetition(competitionId: string): Fixture[] {
    return fixtureRepository.getByCompetition(competitionId);
  }

  getFixturesByRound(round: number): Fixture[] {
    return fixtureRepository.getByRound(round);
  }

  getFixturesByStreak(streak: number): Fixture[] {
    return fixtureRepository.getByStreak(streak);
  }
}

const fixtureService = new FixtureService();

export default fixtureService;