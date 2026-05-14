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
      'byeol': '卒',
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

  const CELL_SIZE = 60;
  const PADDING = 30;
  const BOARD_WIDTH = CELL_SIZE * 8;
  const BOARD_HEIGHT = CELL_SIZE * 9;

  // Create arrays for rendering - don't flip indices, just flip visual order
  const rowIndices = perspective === 'blue' 
    ? [9,8,7,6,5,4,3,2,1,0] 
    : [0,1,2,3,4,5,6,7,8,9];
  const colIndices = perspective === 'blue' 
    ? [8,7,6,5,4,3,2,1,0] 
    : [0,1,2,3,4,5,6,7,8];

  return (
    <div style={styles.container}>
      {/* Row labels */}
      <div style={styles.labelsWrapper}>
        <div style={styles.rowLabels}>
          {rowIndices.map(row => (
            <div key={`rl-${row}`} style={{ ...styles.rowLabel, height: CELL_SIZE }}>
              {10 - row}
            </div>
          ))}
        </div>

        {/* Board area */}
        <div style={styles.boardArea}>
          {/* Column labels at top */}
          <div style={styles.colLabelsTop}>
            <div style={{ width: PADDING }}></div>
            {colIndices.map(col => (
              <div key={`ct-${col}`} style={{ ...styles.colLabel, width: CELL_SIZE }}>
                {String.fromCharCode(65 + col)}
              </div>
            ))}
          </div>

          {/* SVG Grid */}
          <svg width={BOARD_WIDTH + PADDING * 2} height={BOARD_HEIGHT + PADDING * 2} style={styles.svg}>
            {/* Horizontal lines */}
            {rowIndices.map((_, i) => (
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
            {colIndices.map((_, i) => (
              <g key={`v-${i}`}>
                <line
                  x1={PADDING + i * CELL_SIZE}
                  y1={PADDING}
                  x2={PADDING + i * CELL_SIZE}
                  y2={PADDING + 4 * CELL_SIZE}
                  stroke="#1a1a1a"
                  strokeWidth="1.5"
                />
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

            {/* Intersection dots */}
            {rowIndices.map((row, ri) =>
              colIndices.map((col, ci) => (
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

          {/* Clickable pieces layer */}
          <div style={styles.piecesLayer}>
            {rowIndices.map((row, ri) => (
              <div key={`pr-${row}`} style={{ display: 'flex', height: CELL_SIZE }}>
                {colIndices.map((col, ci) => {
                  const piece = board[row][col];
                  const selected = isSelected(row, col);
                  const validMove = isValidMove(row, col);
                  
                  return (
                    <div
                      key={`pc-${col}`}
                      onClick={() => onSquareClick({ row, col }, piece)}
                      style={{
                        ...styles.pieceCell,
                        width: CELL_SIZE,
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

          {/* Column labels at bottom */}
          <div style={styles.colLabelsBottom}>
            <div style={{ width: PADDING }}></div>
            {colIndices.map(col => (
              <div key={`cb-${col}`} style={{ ...styles.colLabel, width: CELL_SIZE }}>
                {String.fromCharCode(65 + col)}
              </div>
            ))}
          </div>
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
  labelsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  rowLabels: {
    display: 'flex',
    flexDirection: 'column',
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
  boardArea: {
    display: 'flex',
    flexDirection: 'column',
  },
  colLabelsTop: {
    display: 'flex',
    marginBottom: '0',
  },
  colLabelsBottom: {
    display: 'flex',
    marginTop: '5px',
  },
  colLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  svg: {
    display: 'block',
    backgroundColor: '#f5deb3',
  },
  piecesLayer: {
    position: 'absolute',
    top: PADDING,
    left: PADDING,
    pointerEvents: 'none',
  },
  pieceCell: {
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
};
