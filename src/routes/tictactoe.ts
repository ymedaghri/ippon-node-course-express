import { Application, Request, Response } from 'express';

const board = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const PLAYER_MARK = 1;
const COMPUTER_MARK = 2;
let invincible = false;

export default (app: Application) => {
  /**
   * @swagger
   * /new-game:
   *   post:
   *     tags:
   *       - 🕹️ Tic Tac Toe
   *     summary: Create a new tic tac toe game.
   *     description: Create a new tic tac toe game and return an empty board of nine cells.
   *     parameters:
   *       - name: invincible
   *         in: query
   *         description: A boolean to make the computer invincible
   *         required: false
   *         schema:
   *           type: string
   *     responses:
   *       201:
   *         description: A board of nine cells initialized with zeros.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 board:
   *                   type: array
   *                   example: [0, 0, 0, 0, 0, 0, 0, 0, 0]
   *                   items:
   *                     type: number
   *                     enum: [0, 1, 2]
   */
  app.post('/new-game', (req: Request, res: Response) => {
    const invincibleParam = req.query.invincible;
    if (invincibleParam) {
      invincible = true;
    } else {
      invincible = false;
    }
    board.forEach((_, index) => (board[index] = 0));
    res.status(201).json({ board });
  });

  /**
   * @swagger
   * /mark-player/{cellNumber}:
   *   put:
   *     tags:
   *       - 🕹️ Tic Tac Toe
   *     summary: Marks the sell with player mark (1).
   *     description: Marks the sell with player mark (1).
   *     parameters:
   *       - in: path
   *         name: cellNumber
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: A board of nine cells updated with the current player mark.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 board:
   *                   type: array
   *                   example: [0, 0, 1, 0, 0, 0, 0, 0, 0]
   *                   items:
   *                     type: number
   *                     enum: [0, 1, 2]
   */
  app.put('/mark-player/:cellNumber', (req: Request, res: Response) => {
    const cellNumber = parseInt(req.params.cellNumber);
    if (board[cellNumber] === 0) {
      board[cellNumber] = PLAYER_MARK;
    }
    res.json({ board });
  });

  /**
   * @swagger
   * /get-computer-mark:
   *   get:
   *     tags:
   *       - 🕹️ Tic Tac Toe
   *     summary: Get the computer mark.
   *     description: Let the computer play and mark its position.
   *     responses:
   *       200:
   *         description: A board of nine cells updated with the current computer mark.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 board:
   *                   type: array
   *                   example: [2, 0, 1, 0, 0, 0, 0, 0, 0]
   *                   items:
   *                     type: number
   *                     enum: [0, 1, 2]
   */
  app.get('/get-computer-mark', (req: Request, res: Response) => {
    const boardAferComputerPlay = playComputer(board);
    res.json({ board: boardAferComputerPlay });
  });
};

export const playComputer = (board: number[]) => {
  // If there's a winning move, take it.
  const computerEventualWinningMove = getWinningMove(
    board,
    COMPUTER_MARK,
    PLAYER_MARK
  );
  if (computerEventualWinningMove !== null) {
    board[computerEventualWinningMove] = COMPUTER_MARK;
    return board;
  }

  // If the opponent has a winning move, block it.
  const playerEventualWinningMove = getWinningMove(
    board,
    PLAYER_MARK,
    COMPUTER_MARK
  );
  if (playerEventualWinningMove !== null) {
    board[playerEventualWinningMove] = COMPUTER_MARK;
    return board;
  }

  // If the center is open, take it.
  if (board[4] === 0) {
    board[4] = COMPUTER_MARK;
    return board;
  }

  if (invincible) {
    // If the center is taken by the player and one corner is empty take it
    if (board[4] === PLAYER_MARK) {
      if (board[0] === 0) {
        board[0] = COMPUTER_MARK;
        return board;
      }
      if (board[2] === 0) {
        board[2] = COMPUTER_MARK;
        return board;
      }
      if (board[6] === 0) {
        board[6] = COMPUTER_MARK;
        return board;
      }
      if (board[8] === 0) {
        board[8] = COMPUTER_MARK;
        return board;
      }
    }
  }

  // Take any available move
  const availableMoves = getAvailableMoves(board);
  const cell =
    availableMoves[Math.round(Math.random() * (availableMoves.length - 1))];
  board[cell] = COMPUTER_MARK;
  return board;
};

function getWinningMove(
  board: number[],
  currentPlayerMark: number,
  opponentMark: number
) {
  for (let i = 0; i < 3; i++) {
    if (
      board[i * 3] !== opponentMark &&
      board[i * 3 + 1] !== opponentMark &&
      board[i * 3 + 2] !== opponentMark
    ) {
      const marks = [board[i * 3], board[i * 3 + 1], board[i * 3 + 2]].filter(
        (cellMark) => cellMark === currentPlayerMark
      );
      if (marks.length == 2) {
        if (board[i * 3] === 0) {
          return i * 3;
        }
        if (board[i * 3 + 1] === 0) {
          return i * 3 + 1;
        }
        if (board[i * 3 + 2] === 0) {
          return i * 3 + 2;
        }
      }
    }
    if (
      board[i] !== opponentMark &&
      board[i + 3] !== opponentMark &&
      board[i + 6] !== opponentMark
    ) {
      const marks = [board[i], board[i + 3], board[i + 6]].filter(
        (cellMark) => cellMark === currentPlayerMark
      );
      if (marks.length == 2) {
        if (board[i] === 0) {
          return i;
        }
        if (board[i + 3] === 0) {
          return i + 3;
        }
        if (board[i + 6] === 0) {
          return i + 6;
        }
      }
    }
  }

  if (
    board[0] !== opponentMark &&
    board[4] !== opponentMark &&
    board[8] !== opponentMark
  ) {
    const marks = [board[0], board[4], board[8]].filter(
      (cellMark) => cellMark === currentPlayerMark
    );
    if (marks.length == 2) {
      if (board[0] === 0) {
        return 0;
      }
      if (board[4] === 0) {
        return 4;
      }
      if (board[8] === 0) {
        return 8;
      }
    }
  }

  if (
    board[2] !== opponentMark &&
    board[4] !== opponentMark &&
    board[6] !== opponentMark
  ) {
    const marks = [board[2], board[4], board[6]].filter(
      (cellMark) => cellMark === currentPlayerMark
    );
    if (marks.length == 2) {
      if (board[2] === 0) {
        return 2;
      }
      if (board[4] === 0) {
        return 4;
      }
      if (board[6] === 0) {
        return 6;
      }
    }
  }

  return null;
}

function getAvailableMoves(board: number[]) {
  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] === 0) {
      moves.push(i);
    }
  }
  return moves;
}
