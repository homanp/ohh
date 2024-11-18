import { writeFileSync } from "fs";
import { Player, Round, Action, Pot, OHHData } from "./types";

export class OpenHandHistory {
  private ohh: OHHData;

  constructor({
    specVersion = "1.4.6",
    internalVersion = "1.4.6",
    networkName = "CustomGame",
    siteName = "HomeGame",
    gameType = "Holdem",
    tableName = "Sample Table",
    tableSize = 3,
    gameNumber = "1",
    startDateUTC = new Date().toISOString(),
    currency = "Chips",
    anteAmount = 0,
    smallBlindAmount = 1,
    bigBlindAmount = 2,
    betCap = 0,
    betType = "NL",
    dealerSeat = 1,
    heroPlayerId = 0,
  } = {}) {
    this.ohh = {
      spec_version: specVersion,
      internal_version: internalVersion,
      network_name: networkName,
      site_name: siteName,
      game_type: gameType,
      table_name: tableName,
      table_size: tableSize,
      game_number: gameNumber,
      start_date_utc: startDateUTC,
      currency,
      ante_amount: anteAmount,
      small_blind_amount: smallBlindAmount,
      big_blind_amount: bigBlindAmount,
      bet_limit: {
        bet_cap: betCap,
        bet_type: betType,
      },
      dealer_seat: dealerSeat,
      hero_player_id: heroPlayerId,
      players: [],
      rounds: [],
      pots: [],
    };
  }

  addPlayer(player: Player): void {
    this.ohh.players.push(player);
  }

  addRound(round: Round): void {
    this.ohh.rounds.push(round);
  }

  addActionToRound(roundId: number, action: Action): void {
    const round = this.ohh.rounds.find((r) => r.id === roundId);
    if (round) {
      round.actions.push(action);
    }
  }

  addPot(pot: Pot): void {
    this.ohh.pots.push(pot);
  }

  toJSON(): { ohh: OHHData } {
    return { ohh: this.ohh };
  }

  saveToFile(filename: string): void {
    const stringRepresentation = JSON.stringify(this.toJSON(), null, 2);
    writeFileSync(filename, stringRepresentation);
  }

  calculateWinningAmount(playerId: number, potAmount: number): number {
    let totalContribution = 0;

    // Calculate the total contribution of the player
    for (const round of this.ohh.rounds) {
      for (const action of round.actions) {
        if (
          action.player_id === playerId &&
          ["Bet", "Raise", "Call", "Post SB", "Post BB"].includes(action.action)
        ) {
          totalContribution += action.amount || 0; // Add the action amount if present
        }
      }
    }

    // Get the player's starting stack
    const player = this.ohh.players.find((p) => p.id === playerId);
    if (!player) {
      throw new Error(`Player with ID ${playerId} not found`);
    }

    const startingStack = player.starting_stack;

    // Calculate the final stack after winning the pot
    const finalStack = startingStack - totalContribution + potAmount;

    // Calculate the PokerTracker Win Amount (net change in stack)
    const winAmount = finalStack - startingStack;

    return winAmount;
  }
}

export * from "./types";
