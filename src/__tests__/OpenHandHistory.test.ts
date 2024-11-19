// src/__tests__/OpenHandHistory.test.ts
import { OpenHandHistory } from "../index";

describe("OpenHandHistory", () => {
  let ohh: OpenHandHistory;

  beforeEach(() => {
    ohh = new OpenHandHistory();
  });

  test("creates instance with default values", () => {
    const json = ohh.toJSON();
    expect(json.ohh.spec_version).toBe("1.4.6");
    expect(json.ohh.game_type).toBe("Holdem");
    expect(json.ohh.table_size).toBe(3);
    expect(json.ohh.currency).toBe("Chips");
    expect(json.ohh.players).toEqual([]);
    expect(json.ohh.rounds).toEqual([]);
    expect(json.ohh.pots).toEqual([]);
  });

  test("creates instance with custom values", () => {
    const customOHH = new OpenHandHistory({
      specVersion: "2.0.0",
      gameType: "PLO",
      tableSize: 6,
      currency: "USD",
    });

    const json = customOHH.toJSON();
    expect(json.ohh.spec_version).toBe("2.0.0");
    expect(json.ohh.game_type).toBe("PLO");
    expect(json.ohh.table_size).toBe(6);
    expect(json.ohh.currency).toBe("USD");
  });

  test("adds player correctly", () => {
    const player = {
      name: "Player 1",
      id: 1,
      starting_stack: 1000,
      seat: 1,
    };
    ohh.addPlayer(player);
    const json = ohh.toJSON();
    expect(json.ohh.players).toHaveLength(1);
    expect(json.ohh.players[0]).toEqual(player);
  });

  test("adds multiple players correctly", () => {
    const players = [
      { name: "Player 1", id: 1, starting_stack: 1000, seat: 1 },
      { name: "Player 2", id: 2, starting_stack: 2000, seat: 2 },
    ];

    players.forEach((player) => ohh.addPlayer(player));
    const json = ohh.toJSON();
    expect(json.ohh.players).toHaveLength(2);
    expect(json.ohh.players).toEqual(players);
  });

  test("adds round correctly", () => {
    const round = {
      id: 1,
      street: "Preflop" as const,
      actions: [],
      cards: ["As", "Kd"],
    };

    ohh.addRound(round);
    const json = ohh.toJSON();
    expect(json.ohh.rounds).toHaveLength(1);
    expect(json.ohh.rounds[0]).toEqual(round);
  });

  test("adds action to round correctly", () => {
    const round = {
      id: 1,
      street: "Preflop" as const,
      actions: [],
    };

    const action = {
      action_number: 1,
      player_id: 1,
      action: "Raise" as const,
      amount: 100,
    };

    ohh.addRound(round);
    ohh.addActionToRound(1, action);

    const json = ohh.toJSON();
    expect(json.ohh.rounds[0].actions).toHaveLength(1);
    expect(json.ohh.rounds[0].actions[0]).toEqual(action);
  });

  test("adds pot correctly", () => {
    const pot = {
      number: 1,
      amount: 1000,
      player_wins: [{ player_id: 1, win_amount: 1000 }],
    };

    ohh.addPot(pot);
    const json = ohh.toJSON();
    expect(json.ohh.pots).toHaveLength(1);
    expect(json.ohh.pots[0]).toEqual(pot);
  });

  test("handles complex hand history correctly", () => {
    // Add players
    ohh.addPlayer({ name: "Player 1", id: 1, starting_stack: 1000, seat: 1 });
    ohh.addPlayer({ name: "Player 2", id: 2, starting_stack: 1000, seat: 2 });

    // Add preflop round
    const preflopRound = { id: 1, street: "Preflop" as const, actions: [] };
    ohh.addRound(preflopRound);

    // Add preflop actions
    ohh.addActionToRound(1, {
      action_number: 1,
      player_id: 1,
      action: "Raise" as const,
      amount: 100,
    });

    ohh.addActionToRound(1, {
      action_number: 2,
      player_id: 2,
      action: "Call" as const,
      amount: 100,
    });

    // Add pot
    ohh.addPot({
      number: 1,
      amount: 50,
      player_wins: [{ player_id: 1, win_amount: 0 }],
    });

    const json = ohh.toJSON();
    expect(json.ohh.players).toHaveLength(2);
    expect(json.ohh.rounds).toHaveLength(1);
    expect(json.ohh.rounds[0].actions).toHaveLength(2);
    expect(json.ohh.pots).toHaveLength(1);
  });

  describe("winning calculations", () => {
    beforeEach(() => {
      ohh = new OpenHandHistory({
        smallBlindAmount: 5,
        bigBlindAmount: 10,
        dealerSeat: 1,
      });
      ohh.addPlayer({ name: "Player 1", id: 1, starting_stack: 1000, seat: 1 });
      ohh.addPlayer({ name: "Player 2", id: 2, starting_stack: 1000, seat: 2 });
      ohh.addPlayer({ name: "Player 3", id: 3, starting_stack: 1000, seat: 3 });
    });

    test("calculates winning amount correctly for winner", () => {
      const round = { id: 1, street: "Preflop" as const, actions: [] };
      ohh.addRound(round);
      ohh.addActionToRound(1, {
        action_number: 1,
        player_id: 2,
        action: "Post SB" as const,
        amount: 1,
      });
      ohh.addActionToRound(1, {
        action_number: 2,
        player_id: 3,
        action: "Post BB" as const,
        amount: 2,
      });
      ohh.addActionToRound(1, {
        action_number: 3,
        player_id: 1,
        action: "Raise" as const,
        amount: 6,
      });
      ohh.addActionToRound(1, {
        action_number: 4,
        player_id: 2,
        action: "Fold" as const,
      });
      ohh.addActionToRound(1, {
        action_number: 5,
        player_id: 3,
        action: "Fold" as const,
      });
      const win_amount = ohh.calculateWinningAmount(1);
      ohh.addPot({
        number: 1,
        amount: 9,
        player_wins: [{ player_id: 1, win_amount }],
      });

      const json = ohh.toJSON();
      expect(json.ohh.pots[0].player_wins[0].win_amount).toBe(5); // 50 (pot) - 20 (raise)
    });
  });
});
