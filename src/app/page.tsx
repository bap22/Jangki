'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState('');
  const [games, setGames] = useState<Array<{
    roomId: string;
    players: { red?: string; blue?: string };
    gameOver: boolean;
  }>>([]);

  useEffect(() => {
    fetchGames();
    const interval = setInterval(fetchGames, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchGames() {
    try {
      const res = await fetch('/api/games');
      const data = await res.json();
      setGames(data);
    } catch (err) {
      console.error('Failed to fetch games:', err);
    }
  }

  async function createGame() {
    setCreating(true);
    try {
      const res = await fetch('/api/games', { method: 'POST' });
      const data = await res.json();
      router.push(`/game/${data.roomId}`);
    } catch (err) {
      console.error('Failed to create game:', err);
    }
    setCreating(false);
  }

  async function joinGame(roomId: string) {
    try {
      const playerId = `player-${Math.random().toString(36).slice(2, 9)}`;
      await fetch(`/api/games/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', playerId }),
      });
      router.push(`/game/${roomId}`);
    } catch (err) {
      console.error('Failed to join game:', err);
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🎮 Jangki</h1>
      <p style={styles.subtitle}>Korean Chess - Multiplayer</p>

      <div style={styles.section}>
        <button
          onClick={createGame}
          disabled={creating}
          style={styles.button}
        >
          {creating ? 'Creating...' : 'Create New Game'}
        </button>
      </div>

      <div style={styles.section}>
        <h2 style={styles.heading}>Join Existing Game</h2>
        <div style={styles.inputGroup}>
          <input
            type="text"
            value={joiningId}
            onChange={(e) => setJoiningId(e.target.value)}
            placeholder="Enter Room ID"
            style={styles.input}
          />
          <button
            onClick={() => joinGame(joiningId)}
            disabled={!joiningId}
            style={styles.button}
          >
            Join
          </button>
        </div>
      </div>

      {games.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.heading}>Active Games</h2>
          {games.map((game) => (
            <div key={game.roomId} style={styles.gameCard}>
              <div style={styles.gameInfo}>
                <span style={styles.roomId}>Room: {game.roomId}</span>
                <span style={styles.players}>
                  👥 {Object.keys(game.players).length}/2
                </span>
                {game.gameOver && <span style={styles.over}>Finished</span>}
              </div>
              <button
                onClick={() => joinGame(game.roomId)}
                disabled={Object.keys(game.players).length >= 2 || game.gameOver}
                style={styles.joinButton}
              >
                {Object.keys(game.players).length >= 2 ? 'Full' : 'Join'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={styles.rules}>
        <h3 style={styles.rulesHeading}>📖 How to Play</h3>
        <p style={styles.rulesText}>
          Learn the rules of Janggi (Korean Chess) - a strategic board game similar to chess, 
          but with unique pieces and movement patterns.
        </p>
        <a 
          href="https://www.ymimports.com/pages/how-to-play-janggi" 
          target="_blank" 
          rel="noopener noreferrer"
          style={styles.rulesLink}
        >
          Read Full Rules & Guide →
        </a>
        <ul style={styles.rulesList}>
          <li><strong>Objective:</strong> Capture the opponent's General (Janggun)</li>
          <li><strong>Red moves first</strong></li>
          <li><strong>Palace:</strong> Generals and Guards can move within the 3×3 palace (orthogonally and diagonally)</li>
          <li><strong>River:</strong> Soldiers can move diagonally after crossing the river</li>
          <li>Share the room ID with your opponent</li>
        </ul>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
  },
  title: {
    fontSize: '3rem',
    textAlign: 'center',
    marginBottom: '0.5rem',
    color: '#1a1a1a',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '2rem',
  },
  section: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
  heading: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#333',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  inputGroup: {
    display: 'flex',
    gap: '0.5rem',
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ddd',
    borderRadius: '6px',
  },
  gameCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '6px',
    marginBottom: '0.5rem',
  },
  gameInfo: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  roomId: {
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  players: {
    color: '#666',
  },
  over: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
  joinButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#16a34a',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  rules: {
    marginTop: '2rem',
    padding: '1.5rem',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
  },
  rulesHeading: {
    fontSize: '1.25rem',
    marginBottom: '0.5rem',
  },
  rulesText: {
    marginBottom: '1rem',
    lineHeight: '1.6',
    color: '#333',
  },
  rulesLink: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    backgroundColor: '#2563eb',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    marginBottom: '1rem',
    transition: 'background-color 0.2s',
  },
  rulesList: {
    paddingLeft: '1.5rem',
    lineHeight: '1.8',
  },
};
