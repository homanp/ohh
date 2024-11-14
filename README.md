<div align="center">

<img src="https://github.com/user-attachments/assets/c9305341-9c90-42f1-83ff-d016904e3da2" alt="OHH Logo" height="80" />

# 🃏 OHH

A TypeScript library for creating and managing poker hand histories following the [Open Hand History](https://hh-specs.handhistory.org/) standard.

[Installation](#installation) | [Quick Start](#quick-start) | [API Reference](#api-reference) | [Development](#development) | [Contributing](#contributing)

</div>

## Installation

```bash
npm install ohh
```

## Quick Start

```typescript
import { OpenHandHistory } from 'open-hand-history';

// Initialize hand history
const ohh = new OpenHandHistory({
  siteName: 'MyPokerSite',
  tableSize: 6
  // other properties...
});

// Add a player
ohh.addPlayer({
  name: 'Player 1',
  id: 1,
  startingStack: 1000,
  seat: 1
});

// Add a round
ohh.addRound({
  id: 1,
  street: 'PREFLOP',
  actions: []
});

// Add action to round
ohh.addActionToRound(1, {
  actionNumber: 1,
  playerId: 1,
  action: 'RAISE',
  amount: 100
});

// Save to file
ohh.saveToFile('hand_history.json');
```

## API Reference

### OpenHandHistory

#### Constructor Options
```typescript
{
  specVersion?: string;         // Default: '1.4.6'
  internalVersion?: string;     // Default: '1.4.6'
  networkName?: string;         // Default: 'CustomGame'
  siteName?: string;            // Default: 'HomeGame'
  gameType?: string;            // Default: 'Holdem'
  tableName?: string;           // Default: 'Sample Table'
  tableSize?: number;           // Default: 3
  gameNumber?: string;          // Default: '1'
  startDateUTC?: string;        // Default: current date
  currency?: string;            // Default: 'Chips'
  anteAmount?: number;          // Default: 0
  smallBlindAmount?: number;    // Default: 1
  bigBlindAmount?: number;      // Default: 2
  betCap?: number;              // Default: 0
  betType?: string;             // Default: 'NL'
  dealerSeat?: number;          // Default: 1
  heroPlayerId?: number;        // Default: 0
}
```

#### Methods

##### `addPlayer(player: Player): void`
Add a player to the hand history.
```typescript
interface Player {
  name: string;
  id: number;
  startingStack: number;
  seat: number;
  cards?: string[];
}
```

##### `addRound(round: Round): void`
Add a new round to the hand history.
```typescript
interface Round {
  id: number;
  cards?: string[];
  street: string;
  actions: Action[];
}
```

##### `addActionToRound(roundId: number, action: Action): void`
Add an action to a specific round.
```typescript
interface Action {
  actionNumber: number;
  playerId: number;
  action: string;
  amount?: number;
  isAllIn?: boolean;
}
```

##### `addPot(pot: Pot): void`
Add a pot to the hand history.
```typescript
interface Pot {
  rake?: number;
  number: number;
  amount: number;
  playerWins: { playerId: number; winAmount: number }[];
}
```

##### `toJSON(): string`
Convert the hand history to JSON string.

##### `saveToFile(filename: string): void`
Save the hand history to a file.

## Development

### Setup
```bash
git clone https://github.com/yourusername/open-hand-history.git
cd open-hand-history
npm install
```

### Testing
```bash
npm test
```

### Building
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
