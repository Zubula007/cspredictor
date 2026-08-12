import fixtureRepository from "../repositories/fixtureRepository";
import type { Fixture } from "../types/fixture";
import type { PSLImport } from "../types/pslImport";

class PSLApprovalService {
  /**
   * Convert an approved PSL import into a CSPredictor fixture.
   *
   * Approved PSL data becomes the source for the public
   * CSPredictor fixture system.
   */
  async approveImport(
    importItem: PSLImport
  ): Promise<Fixture> {
    const existingFixture =
      await fixtureRepository.getById(
        importItem.id
      );

    const fixtureData: Partial<Fixture> = {
      competitionId:
        importItem.competitionId,

      round:
        importItem.round,

      matchDate:
        importItem.matchDate,

      kickOff:
        importItem.kickOff,

      displayDate:
        importItem.displayDate,

      homeTeam:
        importItem.homeTeam,

      awayTeam:
        importItem.awayTeam,

      status:
        importItem.status,

      homeScore:
        importItem.homeScore,

      awayScore:
        importItem.awayScore,

      firstTeamToScore:
        importItem.firstTeamToScore,

      published: true,
    };

    if (existingFixture) {
      const updated =
        await fixtureRepository.updateFixture(
          existingFixture.id,
          fixtureData
        );

      if (!updated) {
        throw new Error(
          "Unable to update the CSPredictor fixture."
        );
      }

      return updated;
    }

    const newFixture: Fixture = {
      id: importItem.id,

      competitionId:
        importItem.competitionId,

      round:
        importItem.round,

      /*
       * PSL imports do not contain a streak value.
       * New imported fixtures therefore start at 0.
       * Existing fixtures retain their current streak
       * when updated above.
       */
      streak: 0,

      matchDate:
        importItem.matchDate,

      kickOff:
        importItem.kickOff,

      displayDate:
        importItem.displayDate,

      homeTeam:
        importItem.homeTeam,

      awayTeam:
        importItem.awayTeam,

      status:
        importItem.status,

      homeScore:
        importItem.homeScore,

      awayScore:
        importItem.awayScore,

      firstTeamToScore:
        importItem.firstTeamToScore,

      published: true,
    };

    return await fixtureRepository.addFixture(
      newFixture
    );
  }
}

const pslApprovalService =
  new PSLApprovalService();

export default pslApprovalService;