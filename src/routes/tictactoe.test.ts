import { expect, describe, test } from 'vitest';
import { playComputer } from './tictactoe';

describe('Tic Tac Toe', () => {
  test('Doit prendre le centre si il est vide', () => {
    // Given
    const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    // When
    playComputer(board);

    // Then
    expect(board).toEqual([0, 0, 0, 0, 2, 0, 0, 0, 0]);
  });

  test.each([
    ['première', [2, 2, 0, 0, 0, 0, 0, 0, 0], [2, 2, 2, 0, 0, 0, 0, 0, 0]],
    ['deuxième', [0, 0, 0, 0, 2, 2, 0, 0, 0], [0, 0, 0, 2, 2, 2, 0, 0, 0]],
    ['troisième', [0, 0, 0, 0, 0, 0, 2, 0, 2], [0, 0, 0, 0, 0, 0, 2, 2, 2]],
  ])(
    'Doit effectuer un mouvement gagnant sur la %s ligne si il est possible',
    (_, board, expectation) => {
      // When
      playComputer(board);

      // Then
      expect(board).toEqual(expectation);
    }
  );
});
