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

  calculateWinningAmount(playerId: number): number {
    let totalCommitted = 0;
    let playerContribution = 0;
    let highestOtherBet = 0;
    let otherPlayersContribution = 0;

    // Calculate total committed and track contributions
    for (const round of this.ohh.rounds) {
      for (const action of round.actions) {
        if (
          ["Bet", "Raise", "Call", "Post SB", "Post BB"].includes(action.action)
        ) {
          const amount = action.amount || 0;
          totalCommitted += amount;
          if (action.player_id === playerId) {
            playerContribution += amount;
          } else {
            otherPlayersContribution += amount;
            highestOtherBet = Math.max(highestOtherBet, amount);
          }
        }
      }
    }

    // If the player's bet is fully called, return the entire pot
    if (otherPlayersContribution >= playerContribution) {
      return totalCommitted;
    }

    // Otherwise, calculate the winning amount as before
    const matchedPlayerBet = Math.min(playerContribution, highestOtherBet);
    const winningAmount =
      totalCommitted - playerContribution + matchedPlayerBet;

    return winningAmount;
  }
}

export * from "./types";
