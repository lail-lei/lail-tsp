import { AStar, PathNode, DistanceHeuristic } from 'lail-astar';
import { GreedyHeuristics } from './greedy';
import { MSTHeuristics } from './mst';

export interface PathResult {
  path: PathNode[];
  estimatedCost: number;
}

export class TSP {
  private nodes: PathNode[];
  private start: PathNode;
  private costMatrix: number[][];
  private floorPlan: number[][]; // for wall data
  private allNodes: PathNode[]; // contains predetermined start, end + dummy nodes
  private greedy: GreedyHeuristics;
  private mst: MSTHeuristics;
  private end?: PathNode | null;
  error?: string;
  private distanceHeuristic?: DistanceHeuristic;

  constructor({
    nodes,
    floorplan,
    start,
    end,
    distanceHeuristic,
    precalculatedDistances,
  }: {
    nodes: PathNode[];
    floorplan: number[][];
    start: PathNode;
    end?: PathNode;
    distanceHeuristic?: DistanceHeuristic;
    precalculatedDistances?: number[][];
  }) {
    this.floorPlan = floorplan;
    this.start = start;
    this.end = end ? end : null;
    this.distanceHeuristic = distanceHeuristic;
    this.nodes = nodes;
    this.allNodes = end && this.isHamiltonianPathProblem() ? [start, end, ...nodes] : [start, ...nodes];
    if (precalculatedDistances)
      this.costMatrix = precalculatedDistances;
    else {
      this.costMatrix = new Array(this.allNodes.length)
        .fill(false)
        .map(() => new Array(this.allNodes.length).fill(Infinity));
      this.calculateDistances();
    }

    this.greedy = new GreedyHeuristics(this.costMatrix, this.isHamiltonianPathProblem());
    this.mst = new MSTHeuristics(this.costMatrix, this.isHamiltonianPathProblem());
  }

  /** Constructor helpers */

  private calculateDistances = () => {
    const aStar = new AStar(this.floorPlan);

    for (let r = 0; r < this.allNodes.length; r++) {
      for (let c = 0; c < this.allNodes.length; c++) {
        if (r === c) this.costMatrix[r][c] = 0;
        else {
          const start = this.allNodes[r];
          const end = this.allNodes[c];
          const distance = aStar.search(start, end, false, this.distanceHeuristic).minCost;

          if (distance === Infinity) {
            const unreacahbleError = `Unreachable location encountered.`;
            this.error = unreacahbleError;
            throw new Error(unreacahbleError);
          } else this.costMatrix[r][c] = distance;
        }
      }
    }
    // hamiltonian path problem requires a specified start and end
    if (this.isHamiltonianPathProblem()) {
      this.costMatrix[0][1] = Infinity;
      this.costMatrix[1][0] = Infinity;
    }
  };


  private isHamiltonianPathProblem = () => !!(this.end && this.end.gridId !== this.start.gridId);


  /** Main (Path) Methods */

  nearestNeighborPath = (): PathResult => {
    if (this.error) throw new Error(this.error);
    return this.computePath(this.greedy.nearestNeighborPath);
  };

  nearestInsertionPath = (): PathResult => {
    if (this.error) throw new Error(this.error);
    return this.computePath(this.greedy.nearestInsertionPath);
  };

  farthestInsertionPath = (): PathResult => {
    if (this.error) throw new Error(this.error);
    return this.computePath(this.greedy.farthestInsertionPath);
  };

  private christofides = (): PathResult => {
    if (this.error) throw new Error(this.error);
    if (this.isHamiltonianPathProblem()) throw new Error('Christofides requires a complete graph to work');
    return this.computePath(this.mst.christofides);
  };

  alphanumericSort = (): PathResult => {
    if (this.error) throw new Error(this.error);
    const sorted = this.nodes.sort((nodeA: PathNode, nodeB: PathNode) => {
      if (nodeA.uid && nodeB.uid) return nodeA.uid.localeCompare(nodeB.uid);
      return nodeA.gridId.localeCompare(nodeB.gridId);
    });
    const path =
      this.end && this.isHamiltonianPathProblem()
        ? [this.start, ...sorted, this.end]
        : [this.start, ...sorted, this.start];
    const rawPath = path.map((node: PathNode) =>
      this.allNodes.findIndex((current: PathNode) => current.uid === node.uid),
    );
    return { path, estimatedCost: this.estimateTotalPathCost(rawPath) };
  };


  /** Main (Path) Methods helpers */
  private computePath = (computePath: () => number[]): PathResult => {
    // todo - if list is sufficiently short, return list without computing
    const rawPath = computePath();
    const transformed = this.transformRawPath(rawPath);
    const path = this.isHamiltonianPathProblem() ? transformed : this.connectBackToStart(transformed);
    return { path, estimatedCost: this.estimateTotalPathCost(rawPath) };
  };

  private transformRawPath = (rawPath: number[]): PathNode[] => rawPath.map((index: number) => this.allNodes[index]);

  private estimateTotalPathCost = (rawPath: number[]): number => {
    if (this.error) throw new Error(this.error);
    if (rawPath.length === 1) return rawPath[0];

    let sum = 0;
    for (let i = 0; i < rawPath.length - 2; i++) {
      const vertexA = rawPath[i];
      const vertexB = rawPath[i + 1];
      const cost = this.costMatrix[vertexA][vertexB];
      sum += cost;
    }
    return sum;
  };

  private connectBackToStart = (path: PathNode[]) => {
    if (this.error) throw new Error(this.error);
    return [...path, this.start];
  };


}
