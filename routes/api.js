'use strict';

const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {

  let solver = new SudokuSolver();
  app.route('/api/check').post((req, res) => {
    const { puzzle, coordinate, value } = req.body;

    // 1. Check required fields
    if (!puzzle || !coordinate || !value) {
      return res.json({ error: 'Required field(s) missing' });
    }

    // 2. Validate puzzle string first (length and characters)
    const validation = solver.validate(puzzle);
    if (validation.error) {
      return res.json({ error: validation.error });
    }
    if (validation.valid === false) {
      return res.json({ error: 'Invalid puzzle' });
    }

    // 3. Validate coordinate length and characters after puzzle is valid
    if (coordinate.length !== 2) {
      return res.json({ error: 'Invalid coordinate' });
    }

    const rows = 'ABCDEFGHI';
    const cols = '123456789';

    const rowChar = coordinate[0].toUpperCase();
    const colChar = coordinate[1];

    if (!rows.includes(rowChar) || !cols.includes(colChar)) {
      return res.json({ error: 'Invalid coordinate' });
    }

    // 4. Validate value AFTER puzzle and coordinate are valid
    if (!'123456789'.includes(value)) {
      return res.json({ error: 'Invalid value' });
    }

    // 5. Convert coordinate to zero-based indexes
    const row = rows.indexOf(rowChar);
    const col = parseInt(colChar, 10) - 1;

    // 6. Check placements
    const conflicts = [];

    if (!solver.checkRowPlacement(puzzle, row, col, value)) conflicts.push('row');
    if (!solver.checkColPlacement(puzzle, row, col, value)) conflicts.push('column');
    if (!solver.checkRegionPlacement(puzzle, row, col, value)) conflicts.push('region');

    if (conflicts.length === 0) {
      return res.json({ valid: true });
    } else {
      return res.json({ valid: false, conflict: conflicts });
    }
  });

  app.route('/api/solve').post((req, res) => {
    const puzzle = req.body.puzzle;
    if (!puzzle) {
      return res.json({ error: 'Required field missing' });
    }

    const validation = solver.validate(puzzle);
    if (validation.error) return res.json({ error: validation.error });

    const solution = solver.solve(puzzle);

    if (!solution) {
      return res.json({ error: 'Puzzle cannot be solved' });
    }

    return res.json({ solution });
  });
};
