import { EventEmitter } from '@angular/core';

export class Cell {
  wasMerged: boolean = false;
  success: EventEmitter<boolean> = new EventEmitter<boolean>();
  _value: number | null = null;

  toJSON(): any {
    return {
      wasMerged: this.wasMerged,
      _value: this._value
    }
  }

  fromJSON(json: any): void {
    this.wasMerged = json.wasMerged;
    this._value = json._value;
  }

  set value(val: number | null) {
    if (val === 2048) this.success.emit(true);
    this._value = val;
  }

  get value(): number | null {
    return this._value;
  }

  get isEmpty(): boolean {
    return this.value === null;
  };

  merge(cell: Cell): boolean {
    const val = cell.value;
    if (!val || this.wasMerged || cell.wasMerged) return false;
    if (this.value && this.value !== val) return false;
    if (this.value) {
      this.value += val;
      this.wasMerged = true;
    } else {
      this.value = val;
    }
    cell.value = null;
    return true;
  }

  resetMerged() {
    this.wasMerged = false;
  }

};