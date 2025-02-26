import { Deque } from 'data-structure-typed';

// Deque with max length
export class deque {
    constructor(maxLen) {
      this.deque = new Deque();
      this.maxLen = maxLen;
    }
  
    push(value) {
      this.deque.push(value);
      this._enforceMaxLength();
    }
    unshift(value) {
      this.deque.unshift(value);
      this._enforceMaxLength();
    }
    pop() {
      return this.deque.pop();
    }
    shift() {
      return this.deque.shift();
    }
    _enforceMaxLength() {
      while (this.deque.size > this.maxLen) {
        this.deque.shift();
      }
    }
    size() {
      return this.deque.length;
    }
    toArray() {
      return this.deque.toArray();
    }
    clear() {
      this.deque.clear();
    }
  }
