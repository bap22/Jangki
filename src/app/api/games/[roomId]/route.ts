import { NextRequest, NextResponse } from 'next/server';
import { getGame, updateGame, deleteGame } from '@/lib/gameStore';
import { makeMove, Position } from '@/lib/jangki';

export async function GET(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const game = getGame(params.roomId);
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  return NextResponse.json(game);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { roomId: string } }
) {
  const game = getGame(params.roomId);
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  const body = await request.json();
  const { action, playerId } = body;

  if (action === 'join') {
    if (!game.players.red) {
      game.players.red = playerId;
    } else if (!game.players.blue) {
      game.players.blue = playerId;
    }
    updateGame(params.roomId, game);
    return NextResponse.json(game);
  }

  if (action === 'move') {
    const { from, to }: { from: Position; to: Position } = body;
    const newGame = makeMove(game, from, to);
    if (!newGame) {
      return NextResponse.json({ error: 'Invalid move' }, { status: 400 });
    }
    updateGame(params.roomId, newGame);
    return NextResponse.json(newGame);
  }

  if (action === 'delete') {
    deleteGame(params.roomId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
