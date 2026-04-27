'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GameState, Piece, Player, Position, getValidMoves } from '@/lib/jangki';
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
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Invalid move');
      }
      
      setSelectedPos(null);
      setValidMoves([]);
      fetchGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid move');
      setTimeout(() => setError(null), 2000);
    }
  }

  function handleSquareClick(pos: Position, piece: Piece | null) {
    if (!game || !myColor || game.gameOver) return;
    if (game.currentPlayer !== myColor) return;

    // If clicking on a valid move destination
    if (selectedPos && validMoves.some(m => m.row === pos.row && m.col === pos.col)) {
      makeMove(selectedPos, pos);
      return;
    }

    // If clicking on own piece, select it and show valid moves
    if (piece && piece.player === myColor) {
      setSelectedPos(pos);
      const moves = getValidMoves(game.board, pos);
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
        <p style={styles.waitingText}>Players: {Object.keys(game.players).length}/2</p>
        <button onClick={joinGame} style={styles.button}>
          {game.players.red ? 'Join as Blue' : 'Join as Red'}
        </button>
        <p style={styles.hint}>Share this room ID with your opponent</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>🎮 Jangki</h1>
        <div style={styles.status}>
          <span>🏠 Room: <strong>{roomId}</strong></span>
          <span>👤 You: <strong style={{ color: myColor === 'red' ? '#ef4444' : '#3b82f6' }}>{myColor.toUpperCase()}</strong></span>
          <span>🎯 Turn: <strong style={{ color: game.currentPlayer === 'red' ? '#ef4444' : '#3b82f6' }}>{game.currentPlayer.toUpperCase()}</strong></span>
        </div>
      </div>

      {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

      {game.gameOver && (
        <div style={styles.gameOver}>
          <h2>🏆 Game Over!</h2>
          <p style={styles.winnerText}>
            Winner: <strong style={{ color: game.winner === 'red' ? '#ef4444' : '#3b82f6' }}>{game.winner?.toUpperCase()}</strong>
          </p>
          <button onClick={() => router.push('/')} style={styles.button}>Play Again</button>
        </div>
      )}

      {!game.players.blue && (
        <div style={styles.waiting}>
          ⏳ Waiting for opponent to join...
        </div>
      )}

      {game.players.blue && game.currentPlayer === myColor && !game.gameOver && (
        <div style={styles.yourTurn}>✅ Your turn to move!</div>
      )}

      {game.players.blue && game.currentPlayer !== myColor && !game.gameOver && (
        <div style={styles.theirTurn}>⏳ Opponent is thinking...</div>
      )}

      <Board
        board={game.board}
        selectedPos={selectedPos}
        validMoves={validMoves}
        onSquareClick={handleSquareClick}
        perspective={myColor}
      />

      <div style={styles.footer}>
        <button onClick={() => router.push('/')} style={styles.secondaryButton}>← Back to Lobby</button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    padding: '1rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  center: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#0f172a',
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
    flexWrap: 'wrap',
  },
  gameOver: {
    textAlign: 'center',
    padding: '1.5rem',
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    marginBottom: '1rem',
    color: '#1a1a1a',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  waiting: {
    textAlign: 'center',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontWeight: '500',
  },
  waitingText: {
    color: '#94a3b8',
    marginBottom: '1rem',
    fontSize: '1.1rem',
  },
  hint: {
    color: '#64748b',
    marginTop: '1rem',
    fontSize: '0.9rem',
  },
  yourTurn: {
    textAlign: 'center',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#22c55e',
    color: 'white',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontWeight: '600',
  },
  theirTurn: {
    textAlign: 'center',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f59e0b',
    color: 'white',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontWeight: '500',
  },
  errorBanner: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#ef4444',
    color: 'white',
    borderRadius: '8px',
    marginBottom: '1rem',
    fontWeight: '500',
  },
  error: {
    color: '#ef4444',
    marginBottom: '1rem',
    fontSize: '1.1rem',
  },
  winnerText: {
    fontSize: '1.25rem',
    margin: '1rem 0',
  },
  button: {
    padding: '0.875rem 2rem',
    fontSize: '1.05rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s',
  },
  secondaryButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#475569',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.5rem',
  },
};
