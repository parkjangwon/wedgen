export class UndoRedoManager<T> {
  private past: T[] = [];
  private present: T | null = null;
  private future: T[] = [];
  private maxHistory: number;

  constructor(maxHistory: number = 50) {
    this.maxHistory = maxHistory;
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  undo(): T | null {
    if (!this.canUndo()) return null;

    const previous = this.past[this.past.length - 1];
    this.past = this.past.slice(0, -1);

    if (this.present !== null) {
      this.future = [this.present, ...this.future];
    }

    this.present = previous;
    return this.present;
  }

  redo(): T | null {
    if (!this.canRedo()) return null;

    const next = this.future[0];
    this.future = this.future.slice(1);

    if (this.present !== null) {
      this.past = [...this.past, this.present];
    }

    this.present = next;
    return this.present;
  }

  execute(state: T): void {
    if (this.present !== null) {
      this.past = [...this.past, this.present];

      if (this.past.length > this.maxHistory) {
        this.past = this.past.slice(1);
      }
    }

    this.present = state;
    this.future = [];
  }

  clear(): void {
    this.past = [];
    this.future = [];
    this.present = null;
  }

  getState(): {
    past: T[];
    present: T | null;
    future: T[];
    canUndo: boolean;
    canRedo: boolean;
  } {
    return {
      past: this.past,
      present: this.present,
      future: this.future,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    };
  }
}
