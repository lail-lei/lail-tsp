import { AStar, PathNode, Matrix, DistanceHeuristic } from 'lail-astar';
import { GreedyHeuristics } from './greedy';
import { MSTHeuristics } from './mst';

export interface PathResult {
  path: PathNode[];
  estimatedCost: number;
}

export class TSP {
  nodes: PathNode[];
  start: PathNode;
  end?: PathNode | null;
  costMatrix: Matrix;
  floorPlan: Matrix; // wall data
  // contains predetermined start, end + dummy nodes
  allNodes: PathNode[];
  greedy?: GreedyHeuristics;
  mst?: MSTHeuristics;
  error?: string;
  distanceHeuristic?: DistanceHeuristic;

  constructor({
    nodes,
    floorplan,
    start,
    end,
    distanceHeuristic,
  }: {
    nodes: PathNode[];
    floorplan: Matrix;
    start: PathNode;
    end?: PathNode;
    distanceHeuristic?: DistanceHeuristic;
  }) {
    this.floorPlan = floorplan;
    this.start = start;
    this.end = end ? end : null;
    this.distanceHeuristic = distanceHeuristic;
    this.nodes = nodes;
    this.allNodes = end && this.isHamiltonianPathProblem() ? [start, end, ...nodes] : [start, ...nodes];
    this.costMatrix = new Array(this.allNodes.length)
      .fill(false)
      .map(() => new Array(this.allNodes.length).fill(Infinity));
  }

  init = () => {
    this.calculateDistances();
    this.greedy = new GreedyHeuristics(this.costMatrix, this.isHamiltonianPathProblem());
    this.mst = new MSTHeuristics(this.costMatrix, this.isHamiltonianPathProblem());
  };

  isHamiltonianPathProblem = () => !!(this.end && this.end.gridId !== this.start.gridId);

  computeCostMatrix = (rowIndex: number, columnIndex: number) => {
    const aStar = new AStar(this.floorPlan);

    for (let r = rowIndex; r < this.allNodes.length; r++) {
      for (let c = columnIndex; c < this.allNodes.length; c++) {
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
  };

  calculateDistances = () => {
    this.computeCostMatrix(0, 0);
    // hamiltonian path problem requires a specified start and end
    if (this.isHamiltonianPathProblem()) {
      this.costMatrix[0][1] = Infinity;
      this.costMatrix[1][0] = Infinity;
    }
  };

  transformRawPath = (rawPath: number[]): PathNode[] => rawPath.map((index: number) => this.allNodes[index]);

  estimateTotalPathCost = (rawPath: number[]): number => {
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

  connectBackToStart = (path: PathNode[]) => {
    if (this.error) throw new Error(this.error);
    return [...path, this.start];
  };

  computePath = (computePath: () => number[]): PathResult => {
    // todo - if list is sufficiently short, return list without computing
    const rawPath = computePath();
    const transformed = this.transformRawPath(rawPath);
    const path = this.isHamiltonianPathProblem() ? transformed : this.connectBackToStart(transformed);
    return { path, estimatedCost: this.estimateTotalPathCost(rawPath) };
  };

  nearestNeighborPath = (): PathResult => {
    if (this.error) throw new Error(this.error);
    if (this.greedy === undefined) throw new Error('must call TSP.init() before calculating paths');
    return this.computePath(this.greedy.nearestNeighborPath);
  };

  nearestInsertionPath = (): PathResult => {
    if (this.error) throw new Error(this.error);
    if (this.greedy === undefined) throw new Error('must call TSP.init() before calculating paths');
    return this.computePath(this.greedy.nearestInsertionPath);
  };

  farthestInsertionPath = (): PathResult => {
    if (this.error) throw new Error(this.error);
    if (this.greedy === undefined) throw new Error('must call TSP.init() before calculating paths');
    return this.computePath(this.greedy.farthestInsertionPath);
  };

  christofides = (): PathResult => {
    if (this.error) throw new Error(this.error);
    if (this.mst === undefined) throw new Error('must call TSP.init() before calculating paths');
    if (this.isHamiltonianPathProblem()) throw new Error('Christofides requires a complete graph to work');
    return this.computePath(this.mst.christofides);
  };

  alphanumericSort = (): PathResult => {
    if (this.error) throw new Error(this.error);
    if (this.greedy === undefined) throw new Error('must call TSP.init() before calculating paths');
    const sorted = this.nodes.sort((nodeA: PathNode, nodeB: PathNode) => {
      if (nodeA.uid && nodeB.uid) return nodeA.uid.localeCompare(nodeB.uid);
      return nodeA.gridId.localeCompare(nodeB.gridId);
    });
    const path = this.end ? [this.start, ...sorted, this.end] : [this.start, ...sorted];
    const rawPath = path.map((node: PathNode) =>
      this.allNodes.findIndex((current: PathNode) => current.uid === node.uid),
    );
    return { path, estimatedCost: this.estimateTotalPathCost(rawPath) };
  };
}
