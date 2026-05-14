'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GameState, Piece, Player, Position, getValidMoves, Move } from '@/lib/jangki';
import Board from '@/components/Board';

interface ChatMessage {
  id: string;
  playerId: string;
  playerColor?: Player;
  text: string;
  timestamp: number;
}

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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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

  async function sendChat() {
    if (!chatInput.trim() || !game) return;
    
    try {
      await fetch(`/api/games/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'chat',
          playerId, 
          playerColor: myColor,
          text: chatInput.trim() 
        }),
      });
      setChatInput('');
    } catch (err) {
      console.error('Failed to send chat:', err);
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
      const moves = getValidMoves(game.board, pos);
      setValidMoves(moves);
    } else {
      setSelectedPos(null);
      setValidMoves([]);
    }
  }

  const formatMove = (move: Move, index: number): string => {
    const fromCol = String.fromCharCode(65 + move.from.col);
    const fromRow = 10 - move.from.row;
    const toCol = String.fromCharCode(65 + move.to.col);
    const toRow = 10 - move.to.row;
    
    const pieceNames: Record<string, string> = {
      'janggun': 'General',
      'sa': 'Guard',
      'sang': 'Elephant',
      'ma': 'Horse',
      'cha': 'Chariot',
      'po': 'Cannon',
      'byeol': 'Soldier',
    };
    
    const pieceName = pieceNames[move.piece.type];
    const capture = move.captured ? ` captures ${pieceNames[move.captured.type]}` : '';
    
    return `${index + 1}. ${move.piece.player === 'red' ? '🔴' : '🔵'} ${pieceName} ${fromCol}${fromRow} → ${toCol}${toRow}${capture}`;
  };

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
        <h2 style={styles.roomTitle}>🎮 Jangki Room: {roomId}</h2>
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
        <h1 style={styles.title}>🎮 Jangki</h1>
        <div style={styles.status}>
          <span style={styles.statusItem}>🏠 <strong>{roomId}</strong></span>
          <span style={styles.statusItem}>👤 <strong style={{ color: myColor === 'red' ? '#ef4444' : '#3b82f6' }}>{myColor.toUpperCase()}</strong></span>
          <span style={styles.statusItem}>🎯 <strong style={{ color: game.currentPlayer === 'red' ? '#ef4444' : '#3b82f6' }}>{game.currentPlayer.toUpperCase()}</strong></span>
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
        <div style={styles.yourTurn}>✅ Your turn!</div>
      )}

      {game.players.blue && game.currentPlayer !== myColor && !game.gameOver && (
        <div style={styles.theirTurn}>⏳ Opponent's turn...</div>
      )}

      <div style={styles.gameArea}>
        <div style={styles.boardSection}>
          <Board
            board={game.board}
            selectedPos={selectedPos}
            validMoves={validMoves}
            onSquareClick={handleSquareClick}
            perspective={myColor}
          />
        </div>

        <div style={styles.sidebar}>
          {/* Move Log */}
          <div style={styles.panel}>
            <h3 style={styles.panelTitle}>📜 Move Log</h3>
            <div style={styles.moveLog}>
              {game.moves.length === 0 ? (
                <p style={styles.emptyLog}>No moves yet</p>
              ) : (
                game.moves.map((move, index) => (
                  <div key={index} style={styles.moveEntry}>
                    {formatMove(move, index)}
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Chat */}
          <div style={styles.panel}>
            <h3 style={styles.panelTitle}>💬 Chat</h3>
            <div style={styles.chatMessages}>
              {chatMessages.length === 0 ? (
                <p style={styles.emptyChat}>Say something!</p>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={msg.id || index} style={styles.chatMessage}>
                    <span style={{ 
                      ...styles.chatPlayer, 
                      color: msg.playerColor === 'red' ? '#ef4444' : '#3b82f6' 
                    }}>
                      {msg.playerColor ? `${msg.playerColor.toUpperCase()}` : 'System'}:
                    </span>
                    <span style={styles.chatText}>{msg.text}</span>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={styles.chatInput}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendChat()}
                placeholder="Type a message..."
                style={styles.input}
                maxLength={200}
              />
              <button onClick={sendChat} style={styles.chatButton}>Send</button>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.footer}>
        <button onClick={() => router.push('/')} style={styles.secondaryButton}>← Back to Lobby</button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    padding: '1.5rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: '1rem',
    color: 'white',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '0.5rem',
  },
  status: {
    display: 'flex',
    justifyContent: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  statusItem: {
    fontSize: '1rem',
  },
  center: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    color: 'white',
  },
  roomTitle: {
    fontSize: '2rem',
    marginBottom: '1rem',
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
  gameOver: {
    textAlign: 'center',
    padding: '1.5rem',
    backgroundColor: '#fef3c7',
    borderRadius: '12px',
    marginBottom: '1rem',
    color: '#1a1a1a',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  winnerText: {
    fontSize: '1.25rem',
    margin: '1rem 0',
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
  gameArea: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  boardSection: {
    display: 'flex',
    justifyContent: 'center',
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    minWidth: '280px',
    maxWidth: '320px',
  },
  panel: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '1rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
  },
  panelTitle: {
    color: 'white',
    fontSize: '1.1rem',
    marginBottom: '0.75rem',
    borderBottom: '1px solid #334155',
    paddingBottom: '0.5rem',
  },
  moveLog: {
    maxHeight: '200px',
    overflowY: 'auto',
    backgroundColor: '#0f172a',
    borderRadius: '6px',
    padding: '0.75rem',
    fontSize: '0.85rem',
    fontFamily: 'system-ui, sans-serif',
  },
  moveEntry: {
    padding: '0.3rem 0',
    color: '#e2e8f0',
    borderBottom: '1px solid #1e293b',
  },
  emptyLog: {
    color: '#64748b',
    fontStyle: 'italic',
  },
  chatMessages: {
    maxHeight: '200px',
    overflowY: 'auto',
    backgroundColor: '#0f172a',
    borderRadius: '6px',
    padding: '0.75rem',
    fontSize: '0.9rem',
  },
  chatMessage: {
    padding: '0.25rem 0',
    borderBottom: '1px solid #1e293b',
  },
  chatPlayer: {
    fontWeight: 'bold',
  },
  chatText: {
    color: '#e2e8f0',
    marginLeft: '0.5rem',
  },
  emptyChat: {
    color: '#64748b',
    fontStyle: 'italic',
  },
  chatInput: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.75rem',
  },
  input: {
    flex: 1,
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: 'white',
    fontSize: '0.9rem',
  },
  chatButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
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
