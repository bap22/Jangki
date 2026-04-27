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
      'janggun': '將',
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

  const is_validMove = (row: number, col: number): boolean => {
    return validMoves.some(m => m.row === row && m.col === col);
  };

  const isSelected = (row: number, col: number): boolean => {
    return selectedPos?.row === row && selectedPos?.col === col;
  };

  // Flip board for blue player
  const rows = perspective === 'blue' ? [9,8,7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7,8,9];
  const cols = perspective === 'blue' ? [8,7,6,5,4,3,2,1,0] : [0,1,2,3,4,5,6,7,8];

  return (
    <div style={styles.boardContainer}>
      <div style={styles.board}>
        {rows.map((row, rowIndex) => (
          <div key={row} style={styles.row}>
            {cols.map((col, colIndex) => {
              const piece = board[row][col];
              const selected = isSelected(row, col);
              const validMove = is_validMove(row, col);
              
              return (
                <div
                  key={col}
                  onClick={() => onSquareClick({ row, col }, piece)}
                  style={{
                    ...styles.square,
                    backgroundColor: selected ? '#fbbf24' : validMove ? '#86efac' : (rowIndex + colIndex) % 2 === 0 ? '#f5deb3' : '#deb887',
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
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={styles.labels}>
        <div style={styles.rowLabels}>
          {rows.map(row => (
            <div key={row} style={styles.rowLabel}>{10 - row}</div>
          ))}
        </div>
        <div style={styles.colLabels}>
          {cols.map((_, i) => (
            <div key={i} style={styles.colLabel}>{String.fromCharCode(65 + i)}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  boardContainer: {
    display: 'inline-block',
    position: 'relative',
  },
  board: {
    display: 'flex',
    flexDirection: 'column',
    border: '3px solid #8b4513',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
  },
  square: {
    width: '50px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s',
  },
  piece: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '2px solid',
    backgroundColor: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  validMarker: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
    opacity: 0.6,
  },
  labels: {
    position: 'absolute',
    top: 0,
    left: 0,
    pointerEvents: 'none',
  },
  rowLabels: {
    position: 'absolute',
    left: '-25px',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  rowLabel: {
    width: '25px',
    height: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: '#666',
  },
  colLabels: {
    position: 'absolute',
    bottom: '-25px',
    left: 0,
    display: 'flex',
    width: '100%',
  },
  colLabel: {
    width: '50px',
    height: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: '#666',
  },
};
