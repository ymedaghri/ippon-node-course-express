import { Application, Request, Response } from 'express';

const board = [0, 0, 0, 0, 0, 0, 0, 0, 0]
const PLAYER_MARK = 1
const COMPUTER_MARK = 2

export default (app: Application) => {
    /**
    * @swagger
    * /new-game:
    *   post:
    *     summary: Create a new tic tac toe game.
    *     description: Create a new tic tac toe game and return an empty board.
    *     responses:
    *       200:
    *         description: un message simple.
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 board:
    *                   type: array
    *                   items:
    *                     type: number
    *                     enum: [0, 1, 2]
    */
    app.post('/new-game', (req: Request, res: Response) => {
        board.forEach((_, index) => board[index] = 0);
        res.status(201).json({ board });
    });

    /**
    * @swagger
    * /mark-player/{cellNumber}:
    *   put:
    *     summary: Marks the sell with player mark (1).
    *     description: Marks the sell with player mark (1).
    *     responses:
    *       200:
    *         description: un message simple.
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 board:
    *                   type: array
    *                   items:
    *                     type: number
    *                     enum: [0, 1, 2]
    */
    app.put('/mark-player/:cellNumber', (req: Request, res: Response) => {
        const cellNumber = parseInt(req.params.cellNumber)
        if (board[cellNumber] === 0) {
            board[cellNumber] = PLAYER_MARK
        }
        res.json({ board });
    });

    /**
    * @swagger
    * /get-computer-mark:
    *   get:
    *     summary: Get the computer mark.
    *     description: Let the computer play and mark its position.
    *     responses:
    *       200:
    *         description: un message simple.
    *         content:
    *           application/json:
    *             schema:
    *               type: object
    *               properties:
    *                 board:
    *                   type: array
    *                   items:
    *                     type: number
    *                     enum: [0, 1, 2]
    */
    app.get('/get-computer-mark', (req: Request, res: Response) => {
        const boardAferComputerPlay = playComputer(board)
        res.json({ board: boardAferComputerPlay })
    });
};

export const playComputer = (board: number[]) => {
    // If there's a winning move, take it.
    const computerEventualWinningMove = getWinningMove(board, COMPUTER_MARK, PLAYER_MARK)
    if (computerEventualWinningMove !== null) {
        board[computerEventualWinningMove] = COMPUTER_MARK
        return board
    }

    // If the opponent has a winning move, block it.
    const playerEventualWinningMove = getWinningMove(board, PLAYER_MARK, COMPUTER_MARK)
    if (playerEventualWinningMove !== null) {
        board[playerEventualWinningMove] = COMPUTER_MARK
        return board
    }

    // If the center is open, take it.
    if (board[4] === 0) {
        board[4] = COMPUTER_MARK
        return board
    }

    // Take any available move
    const availableMoves = getAvailableMoves(board)
    const cell =
        availableMoves[Math.round(Math.random() * (availableMoves.length - 1))]
    board[cell] = COMPUTER_MARK
    return board
}

function getWinningMove(board: number[], currentPlayerMark: number, opponentMark: number) {
    for (let i = 0; i < 3; i++) {
        if (
            board[i * 3] !== opponentMark &&
            board[i * 3 + 1] !== opponentMark &&
            board[i * 3 + 2] !== opponentMark
        ) {
            const marks = [board[i * 3], board[i * 3 + 1], board[i * 3 + 2]].filter(
                (cellMark) => cellMark === currentPlayerMark,
            )
            if (marks.length == 2) {
                if (board[i * 3] === 0) {
                    return i * 3
                }
                if (board[i * 3 + 1] === 0) {
                    return i * 3 + 1
                }
                if (board[i * 3 + 2] === 0) {
                    return i * 3 + 2
                }
            }
        }
        if (
            board[i] !== opponentMark &&
            board[i + 3] !== opponentMark &&
            board[i + 6] !== opponentMark
        ) {
            const marks = [board[i], board[i + 3], board[i + 6]].filter(
                (cellMark) => cellMark === currentPlayerMark,
            )
            if (marks.length == 2) {
                if (board[i] === 0) {
                    return i
                }
                if (board[i + 3] === 0) {
                    return i + 3
                }
                if (board[i + 6] === 0) {
                    return i + 6
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
            (cellMark) => cellMark === currentPlayerMark,
        )
        if (marks.length == 2) {
            if (board[0] === 0) {
                return 0
            }
            if (board[4] === 0) {
                return 4
            }
            if (board[8] === 0) {
                return 8
            }
        }
    }

    if (
        board[2] !== opponentMark &&
        board[4] !== opponentMark &&
        board[6] !== opponentMark
    ) {
        const marks = [board[2], board[4], board[6]].filter(
            (cellMark) => cellMark === currentPlayerMark,
        )
        if (marks.length == 2) {
            if (board[2] === 0) {
                return 2
            }
            if (board[4] === 0) {
                return 4
            }
            if (board[6] === 0) {
                return 6
            }
        }
    }

    return null
}

function getAvailableMoves(board: number[]) {
    const moves = []
    for (let i = 0; i < 9; i++) {
        if (board[i] === 0) {
            moves.push(i)
        }
    }
    return moves
}