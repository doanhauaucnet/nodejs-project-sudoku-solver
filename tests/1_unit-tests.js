const chai = require('chai');
const assert = chai.assert;

const SudokuSolver = require('../controllers/sudoku-solver.js');
const Solver = new SudokuSolver();

const validPuzzle =
  '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
const solvedPuzzle =
  '135762984946381257728459613694517832812936745357824196473298561581673429269145378';

suite('Unit Tests', () => {
  
  test('1.Logic handles a valid puzzle string of 81 characters', () => {
    const result = Solver.validate(validPuzzle);
    assert.isTrue(result === true || (result && result.valid === true), 'Valid puzzle string should pass');
  });

  test('2.Logic handles a puzzle string with invalid characters (not 1-9 or .)', () => {
    const invalidCharsPuzzle = validPuzzle.replace('.', 'x');
    const result = Solver.validate(invalidCharsPuzzle);
    assert.isObject(result);
    assert.property(result, 'error');
  });

  test('3.Logic handles a puzzle string that is not 81 characters in length', () => {
    const shortPuzzle = validPuzzle.slice(0, 80);
    const result = Solver.validate(shortPuzzle);
    assert.isObject(result);
    assert.property(result, 'error');
  });

  test('4.Logic handles a valid row placement', () => {
    const row = 0;     // First row
    const col = 2;     // Third column
    const value = '3'; // Check if '3' can be placed here
    const result = Solver.checkRowPlacement(validPuzzle, row, col, value);
    assert.isTrue(result);
  });

  test('5.Logic handles an invalid row placement', () => {
    const row = 0;
    const col = 2;
    const value = '1'; // '1' already exists in first row
    const result = Solver.checkRowPlacement(validPuzzle, row, col, value);
    assert.isFalse(result);
  });

  test('6.Logic handles a valid column placement', () => {
    const row = 0;
    const col = 1;
    const value = '3';
    const result = Solver.checkColPlacement(validPuzzle, row, col, value);
    assert.isTrue(result);
  });

  test('7.Logic handles an invalid column placement', () => {
    const row = 1;
    const col = 0;
    const value = '1'; // '1' exists in column 0
    const result = Solver.checkColPlacement(validPuzzle, row, col, value);
    assert.isFalse(result);
  });

  test('8.Logic handles a valid region (3x3 grid) placement', () => {
    const row = 0;
    const col = 1;
    const value = '3';
    const result = Solver.checkRegionPlacement(validPuzzle, row, col, value);
    assert.isTrue(result);
  });

  test('9.Logic handles an invalid region (3x3 grid) placement', () => {
    const row = 0;
    const col = 1;
    const value = '5'; // '5' exists in the 3x3 region
    const result = Solver.checkRegionPlacement(validPuzzle, row, col, value);
    assert.isFalse(result);
  });

  test('10.Valid puzzle strings pass the Solver', () => {
    const solution = Solver.solve(validPuzzle);
    assert.isString(solution);
    assert.equal(solution.length, 81);
    // Optionally check solved puzzle matches known solution:
    assert.equal(solution, solvedPuzzle);
  });

  test('11.Invalid puzzle strings fail the Solver', () => {
    const invalidPuzzle = validPuzzle.replace('.', 'x');
    const result = Solver.solve(invalidPuzzle);
    assert.isFalse(result, 'Solver should return false for invalid puzzle');
  });

  test('12.Solver returns the expected solution for an incomplete puzzle', () => {
    const solution = Solver.solve(validPuzzle);
    assert.equal(solution, solvedPuzzle);
  });

});
