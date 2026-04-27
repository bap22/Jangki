import { NextRequest, NextResponse } from 'next/server';
import { createGame, getGame, listGames } from '@/lib/gameStore';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const gameIds = listGames();
  const games = gameIds.map(id => {
    const game = getGame(id);
    return game ? {
      roomId: id,
      players: game.players,
      gameOver: game.gameOver,
      startTime: game.startTime,
    } : null;
  }).filter(Boolean);
  return NextResponse.json(games);
}

export async function POST(request: NextRequest) {
  const roomId = uuidv4().slice(0, 8);
  const game = createGame(roomId);
  return NextResponse.json({ roomId, game });
}
