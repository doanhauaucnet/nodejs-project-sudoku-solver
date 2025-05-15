class SudokuSolver {

  validate(puzzleString) {
    if (!puzzleString) return { error: 'Required field missing' };
    if (puzzleString.length !== 81) return { error: 'Expected puzzle to be 81 characters long' };
    if (/[^1-9\.]/.test(puzzleString)) return { error: 'Invalid characters in puzzle' };
    return { valid: true };
  }
  

  checkRowPlacement(puzzleString, row, column, value) {
    const start = row * 9;
    for (let i = 0; i < 9; i++) {
      if (i === column) continue;
      if (puzzleString[start + i] === value) return false;
    }
    return true;
  }
  

  checkColPlacement(puzzleString, row, column, value) {
    for (let i = 0; i < 9; i++) {
      if (i === row) continue;
      if (puzzleString[i * 9 + column] === value) return false;
    }
    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(column / 3) * 3;
  
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (r === row && c === column) continue;
        if (puzzleString[r * 9 + c] === value) return false;
      }
    }
    return true;
  }

  solve(puzzleString) {
    if (this.validate(puzzleString).error) return false;
  
    let puzzleArr = puzzleString.split('');
  
    const solveHelper = () => {
      const emptyIndex = puzzleArr.findIndex(ch => ch === '.');
      if (emptyIndex === -1) return true; // solved
  
      const row = Math.floor(emptyIndex / 9);
      const col = emptyIndex % 9;
  
      for (let num = 1; num <= 9; num++) {
        const val = num.toString();
        if (
          this.checkRowPlacement(puzzleArr.join(''), row, col, val) &&
          this.checkColPlacement(puzzleArr.join(''), row, col, val) &&
          this.checkRegionPlacement(puzzleArr.join(''), row, col, val)
        ) {
          puzzleArr[emptyIndex] = val;
          if (solveHelper()) return true;
          puzzleArr[emptyIndex] = '.';
        }
      }
      return false;
    };
  
    if (solveHelper()) return puzzleArr.join('');
    return false;
  }
  
}

module.exports = SudokuSolver;

