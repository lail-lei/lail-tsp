export class GreedyHeuristics {
  distances: Matrix;
  isHamiltonianPath: boolean;

  constructor(distances: Matrix, isHamiltonianPath: boolean) {
    this.distances = distances;
    this.isHamiltonianPath = isHamiltonianPath;
  }

  nearestNeighborInsertionPath = (): number[] => {
    const stack: number[] = []
    const path: number[] = [];
    const visited = new Set<number>();

    if (this.isHamiltonianPath) {
      stack.push(2);
      path.push(0, 1);
      visited.add(0);
      visited.add(1);
    }

    else {
      stack.push(0);
    }

    const findNearestNeighborIndex = (vertex: number) => {
      let min = Infinity;
      let minIndex = -1;
      for (let c = 0; c < this.distances[0].length + 1; c++) {
        if (vertex === c || visited.has(c)) continue;
        if (this.distances[vertex][c] <= min) {
          minIndex = c;
          min = this.distances[vertex][minIndex];
        }
      }
      return minIndex;
    };

    while (stack.length > 0) {
      const current = stack.pop();
      if (current === undefined) continue;
      path.push(current);
      const next = findNearestNeighborIndex(current);
      // encountered all, so break
      if (next === -1) break;
      visited.add(current);
      stack.push(next);
    }

    return path;
  };
}
