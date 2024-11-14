// src/__tests__/OpenHandHistory.test.ts
import { OpenHandHistory } from "../index";

describe("OpenHandHistory", () => {
  let ohh: OpenHandHistory;

  beforeEach(() => {
    ohh = new OpenHandHistory();
  });

  test("creates instance with default values", () => {
    const json = JSON.parse(ohh.toJSON());
    expect(json.spec_version).toBe("1.4.6");
    expect(json.game_type).toBe("Holdem");
    expect(json.table_size).toBe(3);
    expect(json.currency).toBe("Chips");
    expect(json.players).toEqual([]);
    expect(json.rounds).toEqual([]);
    expect(json.pots).toEqual([]);
  });

  test("creates instance with custom values", () => {
    const customOHH = new OpenHandHistory({
      specVersion: "2.0.0",
      gameType: "PLO",
      tableSize: 6,
      currency: "USD",
    });

    const json = JSON.parse(customOHH.toJSON());
    expect(json.spec_version).toBe("2.0.0");
    expect(json.game_type).toBe("PLO");
    expect(json.table_size).toBe(6);
    expect(json.currency).toBe("USD");
  });

  test("adds player correctly", () => {
    const player = {
      name: "Player 1",
      id: 1,
      startingStack: 1000,
      seat: 1,
    };
    ohh.addPlayer(player);
    const json = JSON.parse(ohh.toJSON());
    expect(json.players).toHaveLength(1);
    expect(json.players[0]).toEqual(player);
  });

  test("adds multiple players correctly", () => {
    const players = [
      { name: "Player 1", id: 1, startingStack: 1000, seat: 1 },
      { name: "Player 2", id: 2, startingStack: 2000, seat: 2 },
    ];

    players.forEach((player) => ohh.addPlayer(player));
    const json = JSON.parse(ohh.toJSON());
    expect(json.players).toHaveLength(2);
    expect(json.players).toEqual(players);
  });

  test("adds round correctly", () => {
    const round = {
      id: 1,
      street: "PREFLOP",
      actions: [],
      cards: ["As", "Kd"],
    };

    ohh.addRound(round);
    const json = JSON.parse(ohh.toJSON());
    expect(json.rounds).toHaveLength(1);
    expect(json.rounds[0]).toEqual(round);
  });

  test("adds action to round correctly", () => {
    const round = {
      id: 1,
      street: "PREFLOP",
      actions: [],
    };

    const action = {
      actionNumber: 1,
      playerId: 1,
      action: "RAISE",
      amount: 100,
    };

    ohh.addRound(round);
    ohh.addActionToRound(1, action);

    const json = JSON.parse(ohh.toJSON());
    expect(json.rounds[0].actions).toHaveLength(1);
    expect(json.rounds[0].actions[0]).toEqual(action);
  });

  test("adds pot correctly", () => {
    const pot = {
      number: 1,
      amount: 1000,
      playerWins: [{ playerId: 1, winAmount: 1000 }],
    };

    ohh.addPot(pot);
    const json = JSON.parse(ohh.toJSON());
    expect(json.pots).toHaveLength(1);
    expect(json.pots[0]).toEqual(pot);
  });

  test("handles complex hand history correctly", () => {
    // Add players
    ohh.addPlayer({ name: "Player 1", id: 1, startingStack: 1000, seat: 1 });
    ohh.addPlayer({ name: "Player 2", id: 2, startingStack: 1000, seat: 2 });

    // Add preflop round
    const preflopRound = { id: 1, street: "PREFLOP", actions: [] };
    ohh.addRound(preflopRound);

    // Add preflop actions
    ohh.addActionToRound(1, {
      actionNumber: 1,
      playerId: 1,
      action: "RAISE",
      amount: 100,
    });

    ohh.addActionToRound(1, {
      actionNumber: 2,
      playerId: 2,
      action: "CALL",
      amount: 100,
    });

    // Add pot
    ohh.addPot({
      number: 1,
      amount: 200,
      playerWins: [{ playerId: 1, winAmount: 200 }],
    });

    const json = JSON.parse(ohh.toJSON());
    expect(json.players).toHaveLength(2);
    expect(json.rounds).toHaveLength(1);
    expect(json.rounds[0].actions).toHaveLength(2);
    expect(json.pots).toHaveLength(1);
  });
});
