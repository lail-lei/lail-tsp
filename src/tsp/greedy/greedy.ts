import { Edge } from '../mst/mst';

export class GreedyHeuristics {
  distances: Matrix;
  isHamiltonianPath: boolean;

  constructor(distances: Matrix, isHamiltonianPath: boolean) {
    this.distances = distances;
    this.isHamiltonianPath = isHamiltonianPath;
  }

  findNearestNeighbor = (vertex: number, visited: Set<number>) => {
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

  findFarthestNeighbor = (vertex: number, visited: Set<number>) => {
    let max = -Infinity;
    let maxIndex = -1;
    for (let c = 0; c < this.distances[0].length + 1; c++) {
      if (vertex === c || visited.has(c)) continue;
      if (this.distances[vertex][c] >= max) {
        maxIndex = c;
        max = this.distances[vertex][maxIndex];
      }
    }
    return maxIndex;
  };

  nearestNeighborPath = (): number[] => {
    const stack: number[] = [];
    const path: number[] = [];
    const visited = new Set<number>();

    if (this.isHamiltonianPath) {
      // start at 2 to ensure first and last node do not connect
      stack.push(2);
      path.push(1);
      // ignore dummy node
      visited.add(0);
      visited.add(1);
    } else {
      stack.push(0);
    }

    while (stack.length > 0) {
      const current = stack.pop();
      if (current === undefined) continue;
      path.push(current);
      const next = this.findNearestNeighbor(current, visited);
      // encountered all, so break
      if (next === -1) break;
      visited.add(current);
      stack.push(next);
    }

    if (!this.isHamiltonianPath) return path;

    // move start node to end of path, and reverse
    return [...path.slice(1), 1].reverse();
  };

  insertionPath = (nearest: boolean): number[] => {
    let path: number[] = [];
    const visited = new Set<number>();

    const getNextBestNeighbor = (node: number) =>
      nearest ? this.findNearestNeighbor(node, visited) : this.findFarthestNeighbor(node, visited);

    if (this.isHamiltonianPath) {
      path.push(1);
      path.push(2);
      // ignore dummy node
      visited.add(0);
      visited.add(1);
      visited.add(2);
    } else {
      path.push(0);
      const next = getNextBestNeighbor(0);
      path.push(next);
      visited.add(0);
      visited.add(next);
    }

    const findEdgeToReplace = (path: number[], newNeighbor: number): Edge | null => {
      const computeIncreaseInPathLength = (edge: Edge, newNode: number) => {
        const costNewToA = this.distances[edge.vertexA][newNode];
        const costNewToB = this.distances[newNode][edge.vertexB];
        return costNewToA + costNewToB - edge.weight;
      };

      const edges: Edge[] = [];

      for (let i = 0; i < path.length - 1; i++)
        edges.push({ vertexA: path[i], vertexB: path[i + 1], weight: this.distances[path[i]][path[i + 1]] });

      let min = Infinity;
      let replaceEdge: Edge | null = null;

      edges.forEach((edge: Edge) => {
        const currentSubTourCost = computeIncreaseInPathLength(edge, newNeighbor);
        if (currentSubTourCost < min) {
          min = currentSubTourCost;
          replaceEdge = edge;
        }
      });

      return replaceEdge;
    };

    while (visited.size < this.distances.length) {
      const candidates: number[] = path
        .map((node: number) => getNextBestNeighbor(node))
        .sort((a: number, b: number) => a - b);
      const nextBest: number = nearest ? candidates[0] : candidates[candidates.length - 1];
      const replaceEdge = findEdgeToReplace(path, nextBest);
      if (!replaceEdge) throw new Error('Bad input. Encountered unreachable locations');
      const indexA = path.indexOf(replaceEdge.vertexA);
      const before = path.slice(0, indexA + 1);
      const after = path.slice(indexA + 1);
      path = [...before, nextBest, ...after];
      visited.add(nextBest);
    }

    return path;
  };

  nearestInsertionPath = () => this.insertionPath(true);
  farthestInsertionPath = () => this.insertionPath(false);
}
