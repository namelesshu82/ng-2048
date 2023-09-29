import { Direction } from '../enums/direction';
import { Cell } from '../models/cell.model';

import { Observable, from, of } from 'rxjs';
import { map, delay, mergeMap, pairwise } from 'rxjs/operators';

function operation(entry1: Cell[], entry2: Cell[]): number {
  let mergeScore = 0;
  entry1.forEach((cell1, index) => {
    const cell2 = entry2[index];
    if (cell1.merge(cell2)) {
      mergeScore += cell1.value || 0;
    }
  });
  return mergeScore;
}

function merge(operands: Cell[][][]): Observable<number> {
  return from(operands).pipe(
    mergeMap((operand) => {
      let delayTime = 0;
      return from(operand).pipe(
        pairwise(),
        mergeMap(([op1, op2]) => {
          delayTime += 50;
          return of([op1, op2]).pipe(delay(delayTime));
        })
      );
    }),
    map(([op1, op2]) => operation(op2, op1))
  );
}

function resetMerge(entites: Cell[][]) {
  entites.forEach(cells => cells.forEach(cell => cell.resetMerged()));
}

export const ACTION_HANDLER: { [x: number]: (entry: Cell[][]) => Observable<any> } = {
  [Direction.Up]: (rows: Cell[][]) => {
    resetMerge(rows);
    const operands = [[rows[1], rows[0]], [rows[2], rows[1], rows[0]], [rows[3], rows[2], rows[1], rows[0]]];
    return merge(operands);
  },
  [Direction.Down]: (rows: Cell[][]): Observable<any> => {
    resetMerge(rows);
    const operands = [[rows[2], rows[3]], [rows[1], rows[2], rows[3]], [rows[0], rows[1], rows[2], rows[3]]];
    return merge(operands);
  },
  [Direction.Left]: (columns: Cell[][]): Observable<any> => {
    resetMerge(columns);
    const operands = [[columns[1], columns[0]], [columns[2], columns[1], columns[0]], [columns[3], columns[2], columns[1], columns[0]]];
    return merge(operands);
  },
  [Direction.Right]: (columns: Cell[][]): Observable<any> => {
    resetMerge(columns);
    const operands = [[columns[2], columns[3]], [columns[1], columns[2], columns[3]], [columns[0], columns[1], columns[2], columns[3]]];
    return merge(operands);
  }
};