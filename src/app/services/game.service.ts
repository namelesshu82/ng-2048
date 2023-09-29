import { Injectable } from '@angular/core';
import { Cell } from '../models/cell.model';
import { Direction } from '../enums/direction';
import { ACTION_HANDLER } from '../handlers/action-handler';

import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const sameValueCells = (cell1: Cell, cell2: Cell) => cell1.value === cell2.value;

const GAME_STORAGE_KEY = 'ng2048_game';

@Injectable()
export class GameService {

  cells: Cell[] = Array(16).fill(null).map(_ => new Cell());
  rows: Cell[][] = [];
  columns: Cell[][] = [];
  score: number = 0;

  private hasMoves() {

    const column1 = this.columns[0];
    const column2 = this.columns[1];
    const column3 = this.columns[2];
    const column4 = this.columns[3];

    const hasColumnMoves =
      sameValueCells(column1[0], column1[1]) || sameValueCells(column1[1], column1[2]) || sameValueCells(column1[2], column1[3]) ||
      sameValueCells(column2[0], column2[1]) || sameValueCells(column2[1], column2[2]) || sameValueCells(column2[2], column2[3]) ||
      sameValueCells(column3[0], column3[1]) || sameValueCells(column3[1], column3[2]) || sameValueCells(column3[2], column3[3]) ||
      sameValueCells(column4[0], column4[1]) || sameValueCells(column4[1], column4[2]) || sameValueCells(column4[2], column4[3]);

    if (hasColumnMoves) return true;

    const row1 = this.rows[0];
    const row2 = this.rows[1];
    const row3 = this.rows[2];
    const row4 = this.rows[3];

    const hasRowMoves =
      sameValueCells(row1[0], row1[1]) || sameValueCells(row1[1], row1[2]) || sameValueCells(row1[2], row1[3]) ||
      sameValueCells(row2[0], row2[1]) || sameValueCells(row2[1], row2[2]) || sameValueCells(row2[2], row2[3]) ||
      sameValueCells(row3[0], row3[1]) || sameValueCells(row3[1], row3[2]) || sameValueCells(row3[2], row3[3]) ||
      sameValueCells(row4[0], row4[1]) || sameValueCells(row4[1], row4[2]) || sameValueCells(row4[2], row4[3]);

    return hasRowMoves;
  }

  private getEmptyCells(): Cell[] {
    return this.cells.reduce((acc: Cell[], cell) => {
      if (cell.isEmpty) acc.push(cell);
      return acc;
    }, []);
  }

  get isGameOver(): boolean {
    return !this.hasMoves() && this.getEmptyCells().length === 0;
  }

  restart() {
    localStorage.removeItem(GAME_STORAGE_KEY);
    this.cells = Array(16).fill(null).map(_ => new Cell());
    this.score = 0;
    this.initializeGame();
  }

  initializeGame() {

    this.columns = [
      [this.cells[0], this.cells[4], this.cells[8], this.cells[12]],
      [this.cells[1], this.cells[5], this.cells[9], this.cells[13]],
      [this.cells[2], this.cells[6], this.cells[10], this.cells[14]],
      [this.cells[3], this.cells[7], this.cells[11], this.cells[15]],
    ];

    this.rows = [
      [this.cells[0], this.cells[1], this.cells[2], this.cells[3]],
      [this.cells[4], this.cells[5], this.cells[6], this.cells[7]],
      [this.cells[8], this.cells[9], this.cells[10], this.cells[11]],
      [this.cells[12], this.cells[13], this.cells[14], this.cells[15]],
    ];

  }

  saveGame(): void {
    const gameData = {
      cells: this.cells.map((cell) => cell.toJSON()),
      score: this.score,
    };
  
    localStorage.setItem(GAME_STORAGE_KEY, JSON.stringify(gameData));
  }

  loadGame(): void {
    const savedGameData = localStorage.getItem(GAME_STORAGE_KEY);
  
    if (savedGameData) {
      const gameData = JSON.parse(savedGameData);
  
      this.cells.forEach((cell, index) => {
        cell.fromJSON(gameData.cells[index]);
      });
  
      this.score = gameData.score;
    }
  }

  constructor() {
    this.loadGame();
    this.initializeGame();
  }

  move(direction: Direction): Observable<any> {
    return ACTION_HANDLER[direction](direction === Direction.Left || direction === Direction.Right ? this.columns : this.rows)
      .pipe(switchMap((mergeScore: number) => {
        this.score += mergeScore;
        this.saveGame();
        return of(this.score);
      }));
  }

  randomize() {
    const emptyCell: Cell[] = this.getEmptyCells();
    if (emptyCell.length === 0) return;
    const randIndex = rand(0, emptyCell.length - 1);
    const randValue = Math.random() < 0.8 ? 2 : 4;
    const newCell = emptyCell[randIndex];
    newCell.value = randValue;
  }
}