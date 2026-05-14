// In-memory game store (for Vercel serverless)
import { GameState, createInitialGame } from './jangki';

interface ChatMessage {
  id: string;
  playerId: string;
  playerColor?: 'red' | 'blue';
  text: string;
  timestamp: number;
}

interface GameWithChat {
  game: GameState;
  chat: ChatMessage[];
}

const games = new Map<string, GameWithChat>();

export function getGame(roomId: string): GameState | undefined {
  return games.get(roomId)?.game;
}

export function getChat(roomId: string): ChatMessage[] {
  return games.get(roomId)?.chat || [];
}

export function createGame(roomId: string): GameState {
  const game = createInitialGame(roomId);
  games.set(roomId, { game, chat: [] });
  return game;
}

export function updateGame(roomId: string, state: GameState): void {
  const existing = games.get(roomId);
  if (existing) {
    games.set(roomId, { game: state, chat: existing.chat });
  }
}

export function addChatMessage(roomId: string, message: ChatMessage): void {
  const existing = games.get(roomId);
  if (existing) {
    existing.chat.push(message);
    // Keep only last 50 messages
    if (existing.chat.length > 50) {
      existing.chat = existing.chat.slice(-50);
    }
    games.set(roomId, existing);
  }
}

export function deleteGame(roomId: string): void {
  games.delete(roomId);
}

export function listGames(): string[] {
  return Array.from(games.keys());
}
