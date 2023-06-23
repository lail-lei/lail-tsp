import { Edge } from '../mst/mst';

interface BestNeighbor {
  index: number;
  distance: number;
}

export class GreedyHeuristics {
  distances: number[][];
  isHamiltonianPath: boolean;

  constructor(distances: number[][], isHamiltonianPath: boolean) {
    this.distances = distances;
    this.isHamiltonianPath = isHamiltonianPath;
  }

  findNearestNeighbor = (vertex: number, visited: Set<number>): BestNeighbor => {
    let min = Infinity;
    let minIndex = -1;
    for (let c = 0; c < this.distances[0].length + 1; c++) {
      if (vertex === c || visited.has(c)) continue;
      if (this.distances[vertex][c] <= min) {
        minIndex = c;
        min = this.distances[vertex][minIndex];
      }
    }
    return { index: minIndex, distance: min };
  };

  findFarthestNeighbor = (vertex: number, visited: Set<number>): BestNeighbor => {
    let max = -Infinity;
    let maxIndex = -1;
    for (let c = 0; c < this.distances[0].length + 1; c++) {
      if (vertex === c || visited.has(c)) continue;
      if (this.distances[vertex][c] >= max) {
        maxIndex = c;
        max = this.distances[vertex][maxIndex];
      }
    }
    return { index: maxIndex, distance: max };
  };

  nearestNeighborPath = (): number[] => {
    const stack: number[] = [];
    const path: number[] = [];
    const visited = new Set<number>();

    if (this.isHamiltonianPath) {
      // start at 1 to ensure first and last node do not connect
      stack.push(1);
      path.push(0);
      visited.add(1);
    } else {
      stack.push(0);
    }

    while (stack.length > 0) {
      const current = stack.pop();
      if (current === undefined) continue;
      path.push(current);
      const { index: next } = this.findNearestNeighbor(current, visited);
      // encountered all, so break
      if (next === -1) break;
      visited.add(current);
      stack.push(next);
    }

    if (!this.isHamiltonianPath) return path;

    // move start node to end of path, and reverse
    return [...path.slice(1), 0].reverse();
  };

  insertionPath = (nearest: boolean): number[] => {
    let path: number[] = [];
    const visited = new Set<number>();

    const getNextBestNeighbor = (node: number) =>
      nearest ? this.findNearestNeighbor(node, visited) : this.findFarthestNeighbor(node, visited);

    if (this.isHamiltonianPath) {
      path.push(0);
      path.push(1);
      visited.add(0);
      visited.add(1);
    } else {
      path.push(0);
      const { index: next } = getNextBestNeighbor(0);
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
      const candidates: BestNeighbor[] = path
        .map((node: number) => getNextBestNeighbor(node))
        .sort((a: BestNeighbor, b: BestNeighbor) => a.distance - b.distance);
      const nextBestIndex: number = nearest ? candidates[0].index : candidates[candidates.length - 1].index;
      const replaceEdge = findEdgeToReplace(path, nextBestIndex);
      if (!replaceEdge) throw new Error('Bad input. Encountered unreachable locations');
      const indexA = path.indexOf(replaceEdge.vertexA);
      const before = path.slice(0, indexA + 1);
      const after = path.slice(indexA + 1);
      path = [...before, nextBestIndex, ...after];
      visited.add(nextBestIndex);
    }

    return path;
  };

  nearestInsertionPath = () => this.insertionPath(true);
  farthestInsertionPath = () => this.insertionPath(false);
}
