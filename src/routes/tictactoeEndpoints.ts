// src/users/usersController.ts
import {
  Controller,
  Get,
  Path,
  Post,
  Put,
  Query,
  Route,
  SuccessResponse,
  Tags,
} from "tsoa";

import { iocContainer } from "../tsoa/ioc";

const board: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
const PLAYER_MARK = 1;
const COMPUTER_MARK = 2;
let invincible = false;


@Route("")
@Tags("🕹️ Tic Tac Toe")
export class TicTacToeEndpoints extends Controller {

  /**
   * Création d'une nouvelle partie du jeu TicTacToe (Morpion) et renvoi d'un tableau nommé board contenant neuf zéros.
   * @summary Créé une nouvelle partie de TicTacToe (Morpion)
   */
  @SuccessResponse("201", "Created")
  @Post("new-game")
  public async newGame(
    @Query("invincible") isInvincible?: boolean
  ): Promise<{ board: number[] }> {

    if (isInvincible) {
      invincible = true;
    } else {
      invincible = false;
    }
    board.forEach((_, index) => (board[index] = 0));
    this.setStatus(201);
    return { board }
  }

  /**
   * Marque la cellule indiquée avec un "1" si elle contenait un "0", sinon ne fait rien.
   * @summary Marque la cellule indiquée avec un "1".
   */
  @Put("mark-player/{cellNumber}")
  public async markPlayer(
    @Path() cellNumber: number
  ): Promise<{ board: number[] }> {

    if (board[cellNumber] === 0) {
      board[cellNumber] = PLAYER_MARK;
    }
    this.setStatus(200);
    return { board }
  }

  /**
   * Demande à l'ordinateur de jouer (marque une case avec un "2") et retourne un tableau nommé board après son action de jeu.
   * @summary Demande à l'ordinateur de jouer.
   */
  @Get("get-computer-mark")
  public async getComputerMark(
  ): Promise<{ board: number[] }> {

    const boardAferComputerPlay = playComputer(board);

    this.setStatus(200);
    return { board: boardAferComputerPlay }
  }

}

iocContainer.set(TicTacToeEndpoints, new TicTacToeEndpoints())


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