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
