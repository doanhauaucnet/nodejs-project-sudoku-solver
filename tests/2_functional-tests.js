const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const validPuzzle =
  '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
const solvedPuzzle =
  '135762984946381257728459613694517832812936745357824196473298561581673429269145378';

suite('Functional Tests', () => {
  suite('POST /api/solve', () => {
    test('1.Solve a puzzle with valid puzzle string', done => {
      chai
        .request(server)
        .post('/api/solve')
        .send({ puzzle: validPuzzle })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'solution');
          assert.equal(res.body.solution, solvedPuzzle);
          done();
        });
    });

    test('2.Solve a puzzle with missing puzzle string', done => {
      chai
        .request(server)
        .post('/api/solve')
        .send({})
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Required field missing');
          done();
        });
    });

    test('3.Solve a puzzle with invalid characters', done => {
      const invalidPuzzle = validPuzzle.replace('.', 'x');
      chai
        .request(server)
        .post('/api/solve')
        .send({ puzzle: invalidPuzzle })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Invalid characters in puzzle');
          done();
        });
    });

    test('4.Solve a puzzle with incorrect length', done => {
      const shortPuzzle = validPuzzle.slice(0, 80);
      chai
        .request(server)
        .post('/api/solve')
        .send({ puzzle: shortPuzzle })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
          done();
        });
    });

    test('5.Solve a puzzle that cannot be solved', done => {
      // For example, puzzle with a conflict making it unsolvable:
      const unsolvablePuzzle = validPuzzle.replace('1', '9');
      chai
        .request(server)
        .post('/api/solve')
        .send({ puzzle: unsolvablePuzzle })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Puzzle cannot be solved');
          done();
        });
    });
  });

  suite('POST /api/check', () => {
    test('6.Check a puzzle placement with all fields', done => {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'A2', value: '3' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'valid');
          assert.isTrue(res.body.valid);
          done();
        });
    });

    test('7.Check a puzzle placement with single placement conflict', done => {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'A2', value: '1' }) // 1 conflicts in row
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'valid');
          assert.isFalse(res.body.valid);
          assert.property(res.body, 'conflict');
          assert.include(res.body.conflict, 'row');
          done();
        });
    });

    test('8.Check a puzzle placement with multiple placement conflicts', done => {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'A2', value: '2' }) // 2 conflicts row and region
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isFalse(res.body.valid);
          assert.includeMembers(res.body.conflict, ['row', 'region']);
          done();
        });
    });

    test('9.Check a puzzle placement with all placement conflicts', done => {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'A2', value: '5' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isFalse(res.body.valid);
          assert.includeMembers(res.body.conflict, ['row', 'region']);
          done();
        });
    });

    test('10.Check a puzzle placement with missing required fields', done => {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, value: '1' }) // missing coordinate
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Required field(s) missing');
          done();
        });
    });

    test('11.Check a puzzle placement with invalid characters', done => {
      const invalidPuzzle = validPuzzle.replace('.', 'x');
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: invalidPuzzle, coordinate: 'A2', value: '1' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Invalid characters in puzzle');
          done();
        });
    });

    test('12.Check a puzzle placement with incorrect length', done => {
      const shortPuzzle = validPuzzle.slice(0, 80);
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: shortPuzzle, coordinate: 'A2', value: '1' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
          done();
        });
    });

    test('13.Check a puzzle placement with invalid placement coordinate', done => {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'Z9', value: '1' }) // invalid coordinate
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Invalid coordinate');
          done();
        });
    });

    test('14.Check a puzzle placement with invalid placement value', done => {
      chai
        .request(server)
        .post('/api/check')
        .send({ puzzle: validPuzzle, coordinate: 'A2', value: '0' }) // invalid value (must be 1-9)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.property(res.body, 'error');
          assert.equal(res.body.error, 'Invalid value');
          done();
        });
    });
  });
});
