export interface Player {
  name: string;
  id: number;
  startingStack: number;
  seat: number;
  cards?: string[];
}

export interface Action {
  actionNumber: number;
  playerId: number;
  action: string;
  amount?: number;
  isAllIn?: boolean;
}

export interface Round {
  id: number;
  cards?: string[];
  street: string;
  actions: Action[];
}

export interface Pot {
  rake?: number;
  number: number;
  amount: number;
  playerWins: { playerId: number; winAmount: number }[];
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
