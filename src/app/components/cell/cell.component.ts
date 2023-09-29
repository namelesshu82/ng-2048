import { Component, Input } from '@angular/core';
import { Cell } from '../../models/cell.model';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.css'],
  animations: [
    trigger('cellState', [
      state('start', style({ transform: 'translateX(-100%)' })), 
      state('end', style({ transform: 'translateX(0)' })), 
      transition('start => end', animate('200ms ease-out')),
    ]),
  ],
})
export class CellComponent {
  @Input() cell: Cell;

  constructor() {
    this.cell = new Cell();
  }

  get class(): string {
    const base = `color-${this.cell.value}`;
    if (this.cell.value === null) return 'empty';
    if (this.cell.wasMerged) return `${base} merged`;
    return base;
  }

}