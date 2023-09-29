import { Component, HostListener} from '@angular/core';
import { KEY_MAP } from '../../constants/key-map';
import { GameService } from '../../services/game.service';
import { Cell } from '../../models/cell.model';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent  {

  cells: Cell[] | undefined;
  gameOver: boolean = false;
  score: number = -1;
  completed: boolean = false;

  @HostListener('window:keyup', ['$event']) handleKeyboardEvent(event: KeyboardEvent) {
    let moveSuccessful = false;
    const key = event.key;
    const direction = KEY_MAP[key];
    if (this.gameOver || direction === undefined) return;
  
    this.game.move(direction).subscribe({
      next: (mergeScore: number) => {
        moveSuccessful = moveSuccessful || this.score < mergeScore;
      },
      error: console.error,
      complete: () => {
        if (this.gameOver) return;
        if (moveSuccessful) this.game.randomize();
        this.score = this.game.score;
        this.gameOver = this.game.isGameOver;
      }
    });
  }

  constructor(private game: GameService) {
    this.initGame();
  }

  initGame() {
    this.cells = this.game.cells;
    this.gameOver = this.completed = false;
    this.game.randomize();
    this.game.randomize();
    this.cells.map(cell => cell.success.subscribe(this.successHandler));
  }

  restart() {
    this.score = 0;
    this.game.restart();
    this.initGame();
  }

  successHandler = () => {
    this.completed = true;
    this.gameOver = true;
  }
}