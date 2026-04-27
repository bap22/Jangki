// In-memory game store (for Vercel serverless)
import { GameState, createInitialGame } from './jangki';

const games = new Map<string, GameState>();

export function getGame(roomId: string): GameState | undefined {
  return games.get(roomId);
}

export function createGame(roomId: string): GameState {
  const game = createInitialGame(roomId);
  games.set(roomId, game);
  return game;
}

export function updateGame(roomId: string, state: GameState): void {
  games.set(roomId, state);
}

export function deleteGame(roomId: string): void {
  games.delete(roomId);
}

export function listGames(): string[] {
  return Array.from(games.keys());
}
