export interface GameMeta {
  id: string;
  name: string;
  description: string;
  route: string;
  available: boolean;
  label: "Daily" | "Coming Soon";
}

export const GAMES: GameMeta[] = [
  {
    id: "wordle",
    name: "Beaver Wordle",
    description: "Guess today's 5-letter word — a new challenge every day",
    route: "/games/wordle",
    available: true,
    label: "Daily",
  },
];
