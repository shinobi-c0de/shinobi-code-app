import { Deque } from 'data-structure-typed';

// Deque with max length
export class LimitedDeque<T> {
    private deque: Deque<T>;
    private maxLen: number;

    constructor(maxLen: number) {
      this.deque = new Deque<T>();
      this.maxLen = maxLen;
    }
  
    push(value: T): void {
      this.deque.push(value);
      this._enforceMaxLength("front");
    }
    unshift(value: T): void {
      this.deque.unshift(value);
      this._enforceMaxLength("back");
    }
    pop(): T | undefined {
      return this.deque.pop();
    }
    shift(): T | undefined {
      return this.deque.shift();
    }
    _enforceMaxLength(direction: "front" | "back"): void {
      while (this.deque.length > this.maxLen) {
        if (direction === "front") {
          this.deque.shift();
        } else {
          this.deque.pop();
        }
      }
    }
    size(): number {
      return this.deque.length;
    }
    toArray(): T[] {
      return this.deque.toArray();
    }
    clear(): void {
      this.deque.clear();
    }
  }
