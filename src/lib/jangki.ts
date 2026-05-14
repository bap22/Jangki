export function createInitialBoard(): (Piece | null)[][] {
  const board: (Piece | null)[][] = Array(10).fill(null).map(() => Array(9).fill(null));

  // Blue pieces (top) - Palace: rows 0-2, cols 3-5
  board[0][4] = { type: 'janggun', player: 'blue' };  // Center of palace back row
  board[0][3] = { type: 'sa', player: 'blue' };       // Left guard
  board[0][5] = { type: 'sa', player: 'blue' };       // Right guard
  board[0][2] = { type: 'sang', player: 'blue' };     // Left elephant
  board[0][6] = { type: 'sang', player: 'blue' };     // Right elephant
  board[0][0] = { type: 'cha', player: 'blue' };      // Left chariot
  board[0][8] = { type: 'cha', player: 'blue' };      // Right chariot
  board[0][1] = { type: 'ma', player: 'blue' };       // Left horse
  board[0][7] = { type: 'ma', player: 'blue' };       // Right horse
  board[2][1] = { type: 'po', player: 'blue' };       // Left cannon
  board[2][7] = { type: 'po', player: 'blue' };       // Right cannon
  board[3][0] = { type: 'byeol', player: 'blue' };    // Left soldier
  board[3][2] = { type: 'byeol', player: 'blue' };
  board[3][4] = { type: 'byeol', player: 'blue' };    // Center soldier
  board[3][6] = { type: 'byeol', player: 'blue' };
  board[3][8] = { type: 'byeol', player: 'blue' };    // Right soldier

  // Red pieces (bottom) - Palace: rows 7-9, cols 3-5
  board[9][4] = { type: 'janggun', player: 'red' };   // Center of palace back row
  board[9][3] = { type: 'sa', player: 'red' };        // Left guard
  board[9][5] = { type: 'sa', player: 'red' };        // Right guard
  board[9][2] = { type: 'sang', player: 'red' };      // Left elephant
  board[9][6] = { type: 'sang', player: 'red' };      // Right elephant
  board[9][0] = { type: 'cha', player: 'red' };       // Left chariot
  board[9][8] = { type: 'cha', player: 'red' };       // Right chariot
  board[9][1] = { type: 'ma', player: 'red' };        // Left horse
  board[9][7] = { type: 'ma', player: 'red' };        // Right horse
  board[7][1] = { type: 'po', player: 'red' };        // Left cannon
  board[7][7] = { type: 'po', player: 'red' };        // Right cannon
  board[6][0] = { type: 'byeol', player: 'red' };     // Left soldier
  board[6][2] = { type: 'byeol', player: 'red' };
  board[6][4] = { type: 'byeol', player: 'red' };     // Center soldier
  board[6][6] = { type: 'byeol', player: 'red' };
  board[6][8] = { type: 'byeol', player: 'red' };     // Right soldier

  return board;
}
