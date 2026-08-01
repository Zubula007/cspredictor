"use client";

import fixtureRepository from "../repositories/fixtureRepository";
import predictionService, {
  type ScoreFixtureSummary,
} from "./predictionService";

import type { Fixture } from "../types/fixture";
import type { FirstTeamToScoreType } from "../lib/enums";

export type PublishResultResponse = {
  fixture: Fixture;
  summary: ScoreFixtureSummary;
};

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


  updateFixture(
    fixtureId: string,
    updates: Partial<Fixture>
  ): Fixture | undefined {
    return fixtureRepository.updateFixture(
      fixtureId,
      updates
    );
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
  ): PublishResultResponse | undefined {

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

    const summary = predictionService.scoreFixture(fixture);

    return {
      fixture,
      summary,
    };
  }
}

const fixtureService = new FixtureService();

export default fixtureService;