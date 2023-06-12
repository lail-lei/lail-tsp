import { AStar, PathNode, Matrix } from 'lail-astar';
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
  visitedNodes: Set<number> | undefined;
  floorPlan: Matrix; // wall data

  // contains predetermined start, end + dummy nodes
  allNodes: PathNode[];
  greedy?: GreedyHeuristics;
  mst?: MSTHeuristics;
  error?: string;

  constructor(nodes: PathNode[], floorplan: Matrix, start: PathNode, end?: PathNode) {
    this.floorPlan = floorplan;
    this.start = start;
    this.end = end ? end : null;
    this.nodes = nodes;
    this.allNodes =
      end && this.isHamiltonianPathProblem() ? [new PathNode(-1, -1), start, end, ...nodes] : [start, ...nodes];
    this.costMatrix = new Array(this.allNodes.length)
      .fill(false)
      .map(() => new Array(this.allNodes.length).fill(Infinity));
  }

  init = () => {
    this.calculateDistances();
    this.greedy = new GreedyHeuristics(this.costMatrix, this.isHamiltonianPathProblem());
    this.mst = new MSTHeuristics(this.costMatrix);
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
          const distance = aStar.search(start, end, false).minCost;

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
    // hamiltonian path may require dummy node for mst solutions
    if (this.isHamiltonianPathProblem()) {
      // no need to compute all distances for the dummy node (index 0)
      this.computeCostMatrix(1, 1);
      // handle the distances between the dummy nodes and the defined start and end nodes
      this.costMatrix[0][0] = 0;
      this.costMatrix[0][1] = -1;
      this.costMatrix[0][2] = -1;
      // override start and end node distances
      this.costMatrix[1][0] = -1;
      this.costMatrix[2][0] = -1;
      this.costMatrix[1][2] = Infinity;
      this.costMatrix[2][1] = Infinity;
    } else this.computeCostMatrix(0, 0);
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

  removeDummyNode = (path: PathNode[]) => {
    if (this.error) throw new Error(this.error);
    const filtered = path.slice(2);
    return [...filtered, path[1]];
  };

  connectBackToStart = (path: PathNode[]) => {
    if (this.error) throw new Error(this.error);
    return [...path, this.start];
  };

  nearestNeighborPath = (): PathResult => {
    if (this.error) throw new Error(this.error);
    if (this.greedy === undefined) throw new Error('must call TSP.init() before calculating paths');
    const rawPath = this.greedy.nearestNeighborPath();
    const transformed = this.transformRawPath(rawPath);
    const path = this.isHamiltonianPathProblem() ? transformed : this.connectBackToStart(transformed);
    return { path, estimatedCost: this.estimateTotalPathCost(rawPath) };
  };

  nearestInsertionPath = (): PathResult => {
    if (this.error) throw new Error(this.error);
    if (this.greedy === undefined) throw new Error('must call TSP.init() before calculating paths');
    const rawPath = this.greedy.nearestInsertionPath();
    const transformed = this.transformRawPath(rawPath);
    const path = this.isHamiltonianPathProblem() ? transformed : this.connectBackToStart(transformed);
    return { path, estimatedCost: this.estimateTotalPathCost(rawPath) };
  };

  farthestInsertionPath = (): PathResult => {
    if (this.error) throw new Error(this.error);
    if (this.greedy === undefined) throw new Error('must call TSP.init() before calculating paths');
    const rawPath = this.greedy.farthestInsertionPath();
    const transformed = this.transformRawPath(rawPath);
    const path = this.isHamiltonianPathProblem() ? transformed : this.connectBackToStart(transformed);
    return { path, estimatedCost: this.estimateTotalPathCost(rawPath) };
  };

  christofides = (): PathResult => {
    if (this.error) throw new Error(this.error);
    if (this.mst === undefined) throw new Error('must call TSP.init() before calculating paths');
    const rawPath = this.mst.christofides();
    const transformed = this.transformRawPath(rawPath);
    const path = this.isHamiltonianPathProblem()
      ? this.removeDummyNode(transformed)
      : this.connectBackToStart(transformed);
    return { path, estimatedCost: this.estimateTotalPathCost(rawPath) };
  };
}
