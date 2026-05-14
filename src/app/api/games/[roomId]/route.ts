import { NextRequest, NextResponse } from 'next/server';
import { getGame, updateGame, deleteGame, getChat, addChatMessage } from '@/lib/gameStore';
import { makeMove, Position } from '@/lib/jangki';
import { v4 as uuidv4 } from 'uuid';

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
  const { action, playerId, playerColor, from, to, text } = body;

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
    const fromPos: Position = from;
    const toPos: Position = to;
    const newGame = makeMove(game, fromPos, toPos);
    if (!newGame) {
      return NextResponse.json({ error: 'Invalid move' }, { status: 400 });
    }
    updateGame(params.roomId, newGame);
    return NextResponse.json(newGame);
  }

  if (action === 'chat') {
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }
    
    const message = {
      id: uuidv4(),
      playerId,
      playerColor: playerColor || undefined,
      text: text.trim().slice(0, 200),
      timestamp: Date.now(),
    };
    
    addChatMessage(params.roomId, message);
    return NextResponse.json({ success: true });
  }

  if (action === 'delete') {
    deleteGame(params.roomId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
