"use client";

import fixtureRepository from "../repositories/fixtureRepository";

import predictionService, {
  type ScoreFixtureSummary,
} from "./predictionService";

import bonusService from "./bonusService";

import type { Fixture } from "../types/fixture";
import type { FirstTeamToScoreType } from "../lib/enums";

export type PublishResultResponse = {
  fixture: Fixture;
  summary: ScoreFixtureSummary;
};

class FixtureService {
  async getAll(): Promise<Fixture[]> {
    return await fixtureRepository.getAll();
  }

  async getPublished(): Promise<Fixture[]> {
    return await fixtureRepository.getPublished();
  }

  async getByCompetition(
    competitionId: string
  ): Promise<Fixture[]> {
    return await fixtureRepository.getByCompetition(
      competitionId
    );
  }

  async getById(
    id: string
  ): Promise<Fixture | undefined> {
    return await fixtureRepository.getById(id);
  }

  async getByRound(
    round: number
  ): Promise<Fixture[]> {
    return await fixtureRepository.getByRound(round);
  }

  async getByStreak(
    streak: number
  ): Promise<Fixture[]> {
    return await fixtureRepository.getByStreak(streak);
  }

  async updateFixture(
    fixtureId: string,
    updates: Partial<Fixture>
  ): Promise<Fixture | undefined> {
    return await fixtureRepository.updateFixture(
      fixtureId,
      updates
    );
  }

  async updateResult(
    fixtureId: string,
    homeScore: number,
    awayScore: number,
    firstTeamToScore: FirstTeamToScoreType
  ): Promise<Fixture | undefined> {
    return await fixtureRepository.updateResult(
      fixtureId,
      homeScore,
      awayScore,
      firstTeamToScore
    );
  }

  async publishResult(
    fixtureId: string,
    homeScore: number,
    awayScore: number,
    firstTeamToScore: FirstTeamToScoreType
  ): Promise<PublishResultResponse | undefined> {
    const fixture =
      await fixtureRepository.updateResult(
        fixtureId,
        homeScore,
        awayScore,
        firstTeamToScore
      );

    if (!fixture) {
      return undefined;
    }

    fixture.status = "Completed";

    // Rescore every prediction for this fixture
    const summary =
      await predictionService.scoreFixture(
        fixture
      );

    // Recalculate the round winner bonus
    await bonusService.recalculateRound(
      fixture.round
    );

    return {
      fixture,
      summary,
    };
  }
}

const fixtureService =
  new FixtureService();

export default fixtureService;