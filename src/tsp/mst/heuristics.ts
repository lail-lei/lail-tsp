import { EdgeSort } from './constants';
import { MST } from './mst';

/**
 * Heuristic approaches to solving TSP using MST.
 *
 * @export
 * @class MSTHeuristics
 */
export class MSTHeuristics {
  distances: number[][];
  mst: MST;
  isHamiltonianPath: boolean;

  /**
   * Creates an instance of MSTHeuristics.
   * @param {number[][]} distances
   * @param {boolean} [isHamiltonianPath]
   * @memberof MSTHeuristics
   */
  constructor(distances: number[][], isHamiltonianPath?: boolean) {
    this.distances = distances;
    this.isHamiltonianPath = !!isHamiltonianPath;
    this.mst = new MST(this.distances);
    this.mst.prims();
  }

  /**
   * Implementation of christofides algorithm.
   * @todo - confirm solutions are within 1.5x optimal distance.
   * @memberof MSTHeuristics
   */
  christofides = (): number[] => {
    // find MST tree
    const tree = this.mst.convertEdgePathToTree({
      path: this.mst.mstEdges,
      undirected: true,
      edgeSort: EdgeSort.BY_WEIGHT,
    });
    // find odd - degree vertices
    const oddDegreeVertices = this.mst.oddDegreeVertices(tree);
    // create min cost perfect matchings for odd degree vertices
    const perfectMatching = this.mst.getMinCostPerfectMatching(oddDegreeVertices);
    // add min cost perfect matching edges to mst
    for (const vertex in perfectMatching) {
      // we are creating a multigraph, so "duplicate" edges should be added to tree
      tree[vertex] = tree[vertex] ? [...tree[vertex], ...perfectMatching[vertex]] : [...perfectMatching[vertex]];
    }
    // sort edges again to ensure low weight (nearest edges) are chosen first
    this.mst.prioritizeLowWeightEdges(tree);
    // mst now should have 0 odd degree vertices
    // find eulerian tour
    const tour = this.mst.findEulerianTour(tree);
    // create hamiltonian path from tour
    const path = this.mst.createHamiltonianPath(tour);
    return path;
  };
}
