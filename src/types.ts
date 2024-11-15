export interface Player {
  name: string;
  id: number;
  starting_stack: number;
  seat: number;
  cards?: string[];
}

export interface Action {
  action_number: number;
  player_id: number;
  action:
    | "Dealt Card"
    | "Post SB"
    | "Post BB"
    | "Fold"
    | "Check"
    | "Bet"
    | "Raise"
    | "Call";
  amount?: number;
  is_allin?: boolean;
}

export interface Round {
  id: number;
  cards?: string[];
  street: "Preflop" | "Flop" | "Turn" | "River" | "Showdown";
  actions: Action[];
}

export interface Pot {
  rake?: number;
  number: number;
  amount: number;
  player_wins: { player_id: number; win_amount: number }[];
}

export interface OHHData {
  spec_version: string;
  internal_version: string;
  network_name: string;
  site_name: string;
  game_type: string;
  table_name: string;
  table_size: number;
  game_number: string;
  start_date_utc: string;
  currency: string;
  ante_amount: number;
  small_blind_amount: number;
  big_blind_amount: number;
  bet_limit: {
    bet_cap: number;
    bet_type: string;
  };
  dealer_seat: number;
  hero_player_id: number;
  players: Player[];
  rounds: Round[];
  pots: Pot[];
}
