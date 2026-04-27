'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GameState, Piece, Player, Position } from '@/lib/jangki';
import Board from '@/components/Board';

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;
  
  const [game, setGame] = useState<GameState | null>(null);
  const [playerId] = useState(() => `player-${Math.random().toString(36).slice(2, 9)}`);
  const [myColor, setMyColor] = useState<Player | null>(null);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGame = useCallback(async () => {
    try {
      const res = await fetch(`/api/games/${roomId}`);
      if (!res.ok) throw new Error('Game not found');
      const data = await res.json();
      setGame(data);
      
      if (data.players.red === playerId) setMyColor('red');
      else if (data.players.blue === playerId) setMyColor('blue');
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load game');
      setLoading(false);
    }
  }, [roomId, playerId]);

  useEffect(() => {
    fetchGame();
    const interval = setInterval(fetchGame, 2000);
    return () => clearInterval(interval);
  }, [fetchGame]);

  async function joinGame() {
    try {
      await fetch(`/api/games/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', playerId }),
      });
      fetchGame();
    } catch (err) {
      setError('Failed to join game');
    }
  }

  async function makeMove(from: Position, to: Position) {
    if (!game || !myColor || game.currentPlayer !== myColor) return;
    
    try {
      const res = await fetch(`/api/games/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'move', from, to, playerId }),
      });
      
      if (!res.ok) throw new Error('Invalid move');
      
      setSelectedPos(null);
      setValidMoves([]);
      fetchGame();
    } catch (err) {
      setError('Invalid move');
    }
  }

  function handleSquareClick(pos: Position, piece: Piece | null) {
    if (!game || !myColor || game.gameOver) return;
    if (game.currentPlayer !== myColor) return;

    if (selectedPos && validMoves.some(m => m.row === pos.row && m.col === pos.col)) {
      makeMove(selectedPos, pos);
      return;
    }

    if (piece && piece.player === myColor) {
      setSelectedPos(pos);
      // Calculate valid moves client-side
      const moves: Position[] = [];
      const { type, player } = piece;
      // Simplified - in production, import getValidMoves
      setValidMoves(moves);
    } else {
      setSelectedPos(null);
      setValidMoves([]);
    }
  }

  if (loading) {
    return <div style={styles.center}>Loading game...</div>;
  }

  if (error || !game) {
    return (
      <div style={styles.center}>
        <p style={styles.error}>{error || 'Game not found'}</p>
        <button onClick={() => router.push('/')} style={styles.button}>Back to Home</button>
      </div>
    );
  }

  if (!myColor) {
    return (
      <div style={styles.center}>
        <h2>Room: {roomId}</h2>
        <p>Players: {Object.keys(game.players).length}/2</p>
        <button onClick={joinGame} style={styles.button}>
          {game.players.red ? 'Join as Blue' : 'Join as Red'}
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Jangki</h1>
        <div style={styles.status}>
          <span>Room: {roomId}</span>
          <span>You: <strong style={{ color: myColor === 'red' ? '#dc2626' : '#2563eb' }}>{myColor}</strong></span>
          <span>Turn: <strong style={{ color: game.currentPlayer === 'red' ? '#dc2626' : '#2563eb' }}>{game.currentPlayer}</strong></span>
        </div>
      </div>

      {game.gameOver && (
        <div style={styles.gameOver}>
          <h2>Game Over!</h2>
          <p>Winner: <strong style={{ color: game.winner === 'red' ? '#dc2626' : '#2563eb' }}>{game.winner}</strong></p>
          <button onClick={() => router.push('/')} style={styles.button}>New Game</button>
        </div>
      )}

      {!game.players.blue && (
        <div style={styles.waiting}>Waiting for opponent...</div>
      )}

      <Board
        board={game.board}
        selectedPos={selectedPos}
        validMoves={validMoves}
        onSquareClick={handleSquareClick}
        perspective={myColor}
      />

      <div style={styles.footer}>
        <button onClick={() => router.push('/')} style={styles.secondaryButton}>Leave Game</button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    padding: '1rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#1a1a1a',
  },
  center: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1rem',
    color: 'white',
  },
  status: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    marginTop: '0.5rem',
  },
  gameOver: {
    textAlign: 'center',
    padding: '1rem',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    marginBottom: '1rem',
    color: '#1a1a1a',
  },
  waiting: {
    textAlign: 'center',
    padding: '0.5rem',
    backgroundColor: '#2563eb',
    color: 'white',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  error: {
    color: '#dc2626',
    marginBottom: '1rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  secondaryButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1rem',
  },
};
