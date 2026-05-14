'use client';

import { Piece, Player, Position } from '@/lib/jangki';

interface BoardProps {
  board: (Piece | null)[][];
  selectedPos: Position | null;
  validMoves: Position[];
  onSquareClick: (pos: Position, piece: Piece | null) => void;
  perspective: Player;
}

export default function Board({ board, selectedPos, validMoves, onSquareClick, perspective }: BoardProps) {
  const getPieceSymbol = (piece: Piece): string => {
    const symbols: Record<string, string> = {
      'janggun': piece.player === 'red' ? '楚' : '漢',
      'sa': '士',
      'sang': '象',
      'ma': '馬',
      'cha': '車',
      'po': '包',
      'byeol': piece.player === 'red' ? '卒' : '卒',
    };
    return symbols[piece.type];
  };

  const getPieceColor = (piece: Piece): string => {
    return piece.player === 'red' ? '#dc2626' : '#2563eb';
  };

  const isValidMove = (row: number, col: number): boolean => {
    return validMoves.some(m => m.row === row && m.col === col);
  };

  const isSelected = (row: number, col: number): boolean => {
    return selectedPos?.row === row && selectedPos?.col === col;
  };

  // Flip board for blue player
  const rows = perspective === 'blue' ? [9,8,7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7,8,9];
  const cols = perspective === 'blue' ? [8,7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7,8];

  const CELL_SIZE = 60;
  const PADDING = 30;
  const BOARD_WIDTH = CELL_SIZE * 8;
  const BOARD_HEIGHT = CELL_SIZE * 9;

  return (
    <div style={styles.container}>
      <div style={styles.boardWrapper}>
        {/* Row labels (1-10) */}
        <div style={styles.rowLabels}>
          {rows.map((row, i) => (
            <div key={row} style={{ ...styles.rowLabel, height: CELL_SIZE }}>
              {10 - row}
            </div>
          ))}
        </div>

        {/* Board with SVG grid */}
        <div style={{ position: 'relative' }}>
          <svg width={BOARD_WIDTH + PADDING * 2} height={BOARD_HEIGHT + PADDING * 2} style={styles.svg}>
            {/* Horizontal lines */}
            {rows.map((_, i) => (
              <line
                key={`h-${i}`}
                x1={PADDING}
                y1={PADDING + i * CELL_SIZE}
                x2={PADDING + BOARD_WIDTH}
                y2={PADDING + i * CELL_SIZE}
                stroke="#1a1a1a"
                strokeWidth="1.5"
              />
            ))}
            
            {/* Vertical lines - split at river */}
            {cols.map((_, i) => (
              <g key={`v-${i}`}>
                {/* Top half (rows 0-4) */}
                <line
                  x1={PADDING + i * CELL_SIZE}
                  y1={PADDING}
                  x2={PADDING + i * CELL_SIZE}
                  y2={PADDING + 4 * CELL_SIZE}
                  stroke="#1a1a1a"
                  strokeWidth="1.5"
                />
                {/* Bottom half (rows 5-9) */}
                <line
                  x1={PADDING + i * CELL_SIZE}
                  y1={PADDING + 5 * CELL_SIZE}
                  x2={PADDING + i * CELL_SIZE}
                  y2={PADDING + 9 * CELL_SIZE}
                  stroke="#1a1a1a"
                  strokeWidth="1.5"
                />
              </g>
            ))}

            {/* Palace diagonals - Blue (top) */}
            <line x1={PADDING + 3 * CELL_SIZE} y1={PADDING} x2={PADDING + 5 * CELL_SIZE} y2={PADDING + 2 * CELL_SIZE} stroke="#1a1a1a" strokeWidth="1.5" />
            <line x1={PADDING + 5 * CELL_SIZE} y1={PADDING} x2={PADDING + 3 * CELL_SIZE} y2={PADDING + 2 * CELL_SIZE} stroke="#1a1a1a" strokeWidth="1.5" />
            
            {/* Palace diagonals - Red (bottom) */}
            <line x1={PADDING + 3 * CELL_SIZE} y1={PADDING + 7 * CELL_SIZE} x2={PADDING + 5 * CELL_SIZE} y2={PADDING + 9 * CELL_SIZE} stroke="#1a1a1a" strokeWidth="1.5" />
            <line x1={PADDING + 5 * CELL_SIZE} y1={PADDING + 7 * CELL_SIZE} x2={PADDING + 3 * CELL_SIZE} y2={PADDING + 9 * CELL_SIZE} stroke="#1a1a1a" strokeWidth="1.5" />

            {/* Intersection markers */}
            {rows.map((row, ri) =>
              cols.map((col, ci) => (
                <circle
                  key={`dot-${row}-${col}`}
                  cx={PADDING + ci * CELL_SIZE}
                  cy={PADDING + ri * CELL_SIZE}
                  r="3"
                  fill="#1a1a1a"
                />
              ))
            )}
          </svg>

          {/* Clickable squares */}
          <div style={styles.squaresOverlay}>
            {rows.map((row, ri) => (
              <div key={row} style={{ display: 'flex' }}>
                {cols.map((col, ci) => {
                  const piece = board[row][col];
                  const selected = isSelected(row, col);
                  const validMove = isValidMove(row, col);
                  
                  return (
                    <div
                      key={col}
                      onClick={() => onSquareClick({ row, col }, piece)}
                      style={{
                        ...styles.square,
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        backgroundColor: selected ? '#fbbf24' : 'transparent',
                      }}
                    >
                      {piece && (
                        <div
                          style={{
                            ...styles.piece,
                            color: getPieceColor(piece),
                            borderColor: getPieceColor(piece),
                          }}
                        >
                          {getPieceSymbol(piece)}
                        </div>
                      )}
                      {validMove && !piece && <div style={styles.validMarker} />}
                      {validMove && piece && <div style={styles.validCaptureMarker} />}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Column labels (A-I) */}
        <div style={styles.colLabels}>
          <div style={{ width: PADDING }}></div>
          {cols.map((col, i) => (
            <div key={col} style={{ ...styles.colLabel, width: CELL_SIZE }}>
              {String.fromCharCode(65 + col)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'inline-block',
    padding: '10px',
    backgroundColor: '#f5deb3',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
  boardWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  rowLabels: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '0',
  },
  rowLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    width: '20px',
  },
  svg: {
    display: 'block',
    backgroundColor: '#f5deb3',
  },
  squaresOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
  square: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    pointerEvents: 'auto',
  },
  piece: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: '3px solid',
    backgroundColor: '#fef3c7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
    zIndex: 1,
  },
  validMarker: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
    opacity: 0.7,
  },
  validCaptureMarker: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: '4px solid #22c55e',
    borderRadius: '50%',
    opacity: 0.7,
  },
  colLabels: {
    display: 'flex',
    marginTop: '5px',
    alignItems: 'center',
  },
  colLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
};
