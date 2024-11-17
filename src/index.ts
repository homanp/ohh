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

    const lastPotIndex = this.ohh.pots.length - 1;
    this.ohh.pots[lastPotIndex] = {
      ...this.ohh.pots[lastPotIndex],
      player_wins: this.ohh.pots[lastPotIndex].player_wins.map((win) => ({
        ...win,
        win_amount: this.calculateWinningAmount(win.player_id),
      })),
    };
  }

  toJSON(): OHHData {
    return this.ohh;
  }

  saveToFile(filename: string): void {
    const stringRepresentation = JSON.stringify(this.toJSON(), null, 2);
    writeFileSync(filename, stringRepresentation);
  }

  calculateWinningAmount(playerId: number): number {
    let totalWinnings = 0;
    let playerPosition = this.getPlayerPosition(playerId);

    for (const round of this.ohh.rounds) {
      let roundWinnings = 0;
      for (const action of round.actions) {
        if (action.player_id === playerId) {
          if (
            action.action === "Bet" ||
            action.action === "Raise" ||
            action.action === "Call"
          ) {
            roundWinnings -= action.amount || 0;
          }
        } else {
          if (action.action === "Fold") {
            roundWinnings += this.calculatePotContribution(
              action.player_id,
              round
            );
          }
        }
      }
      totalWinnings += roundWinnings;
    }

    // Add winnings from pots
    totalWinnings += this.ohh.pots.reduce((total, pot) => {
      const playerWin = pot.player_wins.find(
        (win) => win.player_id === playerId
      );
      return total + (playerWin ? playerWin.win_amount : 0);
    }, 0);

    // Adjust for blinds
    if (playerPosition === "SB") {
      totalWinnings -= this.ohh.small_blind_amount;
    } else if (playerPosition === "BB") {
      totalWinnings -= this.ohh.big_blind_amount;
    }

    return totalWinnings;
  }

  private getPlayerPosition(
    playerId: number
  ): "Button" | "SB" | "BB" | "Other" {
    const playerIndex = this.ohh.players.findIndex(
      (player) => player.id === playerId
    );
    const dealerIndex = this.ohh.players.findIndex(
      (player) => player.seat === this.ohh.dealer_seat
    );

    if (playerIndex === dealerIndex) return "Button";
    if (playerIndex === (dealerIndex + 1) % this.ohh.players.length)
      return "SB";
    if (playerIndex === (dealerIndex + 2) % this.ohh.players.length)
      return "BB";
    return "Other";
  }

  private calculatePotContribution(playerId: number, round: Round): number {
    return round.actions.reduce((total, action) => {
      if (
        action.player_id === playerId &&
        (action.action === "Bet" ||
          action.action === "Raise" ||
          action.action === "Call")
      ) {
        return total + (action.amount || 0);
      }
      return total;
    }, 0);
  }
}

export * from "./types";
