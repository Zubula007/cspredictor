import fixtures from "../data/fixtures";
import type { Fixture } from "../types/fixture";
import type { FirstTeamToScoreType } from "../lib/enums";

const STORAGE_KEY = "cspredictor-fixtures";

class FixtureRepository {
  private fixtures: Fixture[];

  constructor() {
    this.fixtures = this.loadFixtures();
  }

  private loadFixtures(): Fixture[] {
    if (typeof window === "undefined") {
      return [...fixtures];
    }

    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      return JSON.parse(saved);
    }

    return [...fixtures];
  }

  private refreshFixtures() {
    if (typeof window === "undefined") {
      return;
    }

    this.fixtures = this.loadFixtures();
  }

  private saveFixtures() {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.fixtures)
    );
  }

  getAll(): Fixture[] {
    this.refreshFixtures();

    return this.fixtures;
  }

  getPublished(): Fixture[] {
    this.refreshFixtures();

    return this.fixtures.filter(
      (fixture) => fixture.published
    );
  }

  getByCompetition(
    competitionId: string
  ): Fixture[] {
    this.refreshFixtures();

    return this.fixtures.filter(
      (fixture) =>
        fixture.competitionId === competitionId
    );
  }

  getById(
    id: string
  ): Fixture | undefined {
    this.refreshFixtures();

    return this.fixtures.find(
      (fixture) =>
        fixture.id === id
    );
  }

  getByRound(
    round: number
  ): Fixture[] {
    this.refreshFixtures();

    return this.fixtures.filter(
      (fixture) =>
        fixture.round === round
    );
  }

  getByStreak(
    streak: number
  ): Fixture[] {
    this.refreshFixtures();

    return this.fixtures.filter(
      (fixture) =>
        fixture.streak === streak
    );
  }

  addFixture(
    fixture: Fixture
  ): Fixture {
    this.refreshFixtures();

    this.fixtures.push(fixture);

    this.saveFixtures();

    return fixture;
  }

  updateFixture(
    fixtureId: string,
    updates: Partial<Fixture>
  ): Fixture | undefined {
    this.refreshFixtures();

    const fixture =
      this.fixtures.find(
        (item) =>
          item.id === fixtureId
      );

    if (!fixture) {
      return undefined;
    }

    Object.assign(
      fixture,
      updates
    );

    this.saveFixtures();

    return fixture;
  }

  deleteFixture(
    fixtureId: string
  ): boolean {

    this.refreshFixtures();

    const originalLength =
      this.fixtures.length;

    this.fixtures =
      this.fixtures.filter(
        (fixture) =>
          fixture.id !== fixtureId
      );

    if (
      this.fixtures.length === originalLength
    ) {
      return false;
    }

    this.saveFixtures();

    return true;
  }

  updateResult(
    fixtureId: string,
    homeScore: number,
    awayScore: number,
    firstTeamToScore: FirstTeamToScoreType
  ): Fixture | undefined {

    this.refreshFixtures();

    const fixture =
      this.fixtures.find(
        (item) =>
          item.id === fixtureId
      );

    if (!fixture) {
      return undefined;
    }

    fixture.homeScore = homeScore;
    fixture.awayScore = awayScore;
    fixture.firstTeamToScore = firstTeamToScore;
    fixture.status = "Completed";
    fixture.published = true;

    this.saveFixtures();

    return fixture;
  }

  /**
   * QA TOOLKIT RESET
   *
   * Returns fixtures to a fresh testing state:
   * - Removes published results
   * - Unlocks fixtures
   * - Clears official scores
   */
  resetFixtures(): void {
    this.refreshFixtures();

    this.fixtures = this.fixtures.map(
      (fixture) => ({
        ...fixture,

        published: false,

        status: "Scheduled",

        homeScore: undefined,

        awayScore: undefined,

        firstTeamToScore: undefined,
      })
    );

    this.saveFixtures();
  }
}

const fixtureRepository =
  new FixtureRepository();

export default fixtureRepository;