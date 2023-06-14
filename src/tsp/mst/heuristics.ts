import { EdgeSort } from './constants';
import { MST } from './mst';

export class MSTHeuristics {
  distances: Matrix;
  mst: MST;
  isHamiltonianPath: boolean;

  constructor(distances: Matrix, isHamiltonianPath?: boolean) {
    this.distances = distances;
    this.isHamiltonianPath = !!isHamiltonianPath;
    this.mst = new MST(this.distances);
    this.mst.prims();
  }

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
    if (!this.isHamiltonianPath) return path;

    // move start node to end of path, and reverse
    return [...path.slice(2), 1].reverse()
  };
}
