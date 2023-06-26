import { Edge } from '../mst/mst';

interface BestNeighbor {
  index: number;
  distance: number;
}

/**
 * Heuristic approaches to solving TSP.
 *
 * @export
 * @class GreedyHeuristics
 */
export class GreedyHeuristics {
  distances: number[][];
  isHamiltonianPath: boolean;

  /**
   * Creates an instance of GreedyHeuristics.
   * @param {number[][]} distances
   * @param {boolean} isHamiltonianPath
   * @memberof GreedyHeuristics
   */
  constructor(distances: number[][], isHamiltonianPath: boolean) {
    this.distances = distances;
    this.isHamiltonianPath = isHamiltonianPath;
  }

  /**
   * Returns next closest, unvisited node to provided vertex, and the distance between
   * the provided vertex and next closest neighbor. Used in nearest insertion
   * and nearest neighbor paths.
   *
   * @todo - consider abstracting some of the logic of this function so that
   * it can be reused in findFarthestNeighbor
   * @param {number} vertex
   * @param {Set<number>} visited
   * @returns {BestNeighbor}
   * @memberof GreedyHeuristics
   */
  private findNearestNeighbor = (vertex: number, visited: Set<number>): BestNeighbor => {
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

  /**
   * Returns next farthest, unvisited node to provided vertex, and the distance between
   * the provided vertex and next farthest neighbor. Used in farthest insertion
   *
   * @todo - consider abstracting some of the logic of this function so that
   * it can be reused in findNearestNeighbor
   * @param {number} vertex
   * @param {Set<number>} visited
   * @returns {BestNeighbor}
   * @memberof GreedyHeuristics
   */
  private findFarthestNeighbor = (vertex: number, visited: Set<number>): BestNeighbor => {
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

  /**
   * Helper function that uses insertion to compute node order (suboptimal).
   *
   * @param {boolean} nearest - represents whether to use nearest (true) or farthest insertion  (false)
   * @memberof GreedyHeuristics
   * @returns array of indices representing all nodes in path.
   */
  private insertionPath = (nearest: boolean): number[] => {
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

    /**
     * After the next best neighbor (say vertexN) is found for the path,
     * find the edge (say vertexA -> vertexB) such that spliting the edge up
     * and creating a new tour including next best neighbor would result in cheapest cost.
     * (vertexA -> vertexB transformed to vertexA -> vertexN -> vertexB)
     *
     * This edge (vertexA -> vertexB) is returned.
     *
     * @param {number[]} path
     * @param {number} newNeighbor
     * @return {{(Edge | null)}
     */
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

  /**
   * Returns node indices in suboptimal nearest neighbor order.
   *
   * @memberof GreedyHeuristics
   * @returns array of indices representing all nodes in path.
   */
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

  /**
   * Returns node indices in suboptimal nearest insertion order.
   *
   * @returns array of indices representing all nodes in path.
   * @memberof GreedyHeuristics
   */
  nearestInsertionPath = (): number[] => this.insertionPath(true);

  /**
   * Returns node indices in suboptimal farthest insertion order.
   *
   * @returns array of indices representing all nodes in path.
   * @memberof GreedyHeuristics
   */
  farthestInsertionPath = (): number[] => this.insertionPath(false);
}
