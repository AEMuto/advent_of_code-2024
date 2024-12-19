class PriorityQueue<T> {
  private heap: { item: T, priority: number }[] = [];

  constructor(private comparator: (a: number, b: number) => number) {}

  // Push a new element with its priority
  push(item: T, priority: number): void {
      this.heap.push({ item, priority });
      this.bubbleUp();
  }

  // Pop the element with the lowest priority
  pop(): T {
      if (this.isEmpty()) throw new Error("PriorityQueue is empty");
      this.swap(0, this.heap.length - 1);
      const { item } = this.heap.pop()!;
      this.bubbleDown();
      return item;
  }

  // Peek at the element with the lowest priority without removing it
  peek(): T {
      if (this.isEmpty()) throw new Error("PriorityQueue is empty");
      return this.heap[0].item;
  }

  // Check if the queue is empty
  isEmpty(): boolean {
      return this.heap.length === 0;
  }

  // Swap two elements in the heap
  private swap(i: number, j: number): void {
      [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  // Restore the heap property going up
  private bubbleUp(): void {
      let index = this.heap.length - 1;
      while (index > 0) {
          const parentIndex = Math.floor((index - 1) / 2);
          if (this.comparator(this.heap[index].priority, this.heap[parentIndex].priority) >= 0) break;
          this.swap(index, parentIndex);
          index = parentIndex;
      }
  }

  // Restore the heap property going down
  private bubbleDown(): void {
      let index = 0;
      const length = this.heap.length;
      while (true) {
          const leftChild = 2 * index + 1;
          const rightChild = 2 * index + 2;
          let smallest = index;

          if (leftChild < length && this.comparator(this.heap[leftChild].priority, this.heap[smallest].priority) < 0) {
              smallest = leftChild;
          }
          if (rightChild < length && this.comparator(this.heap[rightChild].priority, this.heap[smallest].priority) < 0) {
              smallest = rightChild;
          }
          if (smallest === index) break;
          this.swap(index, smallest);
          index = smallest;
      }
  }
}

export default PriorityQueue;