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
  end: PathNode;
  costMatrix: Matrix;
  visitedNodes: Set<number> | undefined;
  floorPlan: Matrix; // wall data

  // contains predetermined start, end + dummy nodes
  allNodes: PathNode[];
  greedy?: GreedyHeuristics;
  mst?: MSTHeuristics;
  error?: string;

  constructor(nodes: PathNode[], floorplan: Matrix, start: PathNode, end: PathNode) {
    this.floorPlan = floorplan;
    this.start = start;
    this.end = end;
    this.nodes = nodes;
    this.allNodes = [new PathNode(-1, -1), start, end, ...nodes];
    this.costMatrix = new Array(this.allNodes.length)
      .fill(false)
      .map(() => new Array(this.allNodes.length).fill(Infinity));
  }

  init = () => {
    this.calculateDistances();
    this.greedy = new GreedyHeuristics(this.costMatrix);
    this.mst = new MSTHeuristics(this.costMatrix);
  };

  calculateDistances = () => {
    const aStar = new AStar(this.floorPlan);

    // handle the distances between the dummy nodes and the defined start and end nodes
    this.costMatrix[0][0] = 0;
    this.costMatrix[0][1] = -1;
    this.costMatrix[0][2] = -1;
    this.costMatrix[1][0] = -1;
    this.costMatrix[2][0] = -1;

    for (let r = 1; r < this.allNodes.length; r++) {
      for (let c = 1; c < this.allNodes.length; c++) {
        if (r === c) this.costMatrix[r][c] = 0;
        else {
          const start = this.allNodes[r];
          const end = this.allNodes[c];
          const distance = aStar.search(start, end, false).minCost;

          if (distance === Infinity) {
            const unreacahbleError = `Unreachable location encountered. Unable to travel from ${start.uid} to ${end.uid}`;
            this.error = unreacahbleError;
            throw new Error(unreacahbleError);
          } else this.costMatrix[r][c] = distance;
        }
      }
    }
  };

  transformRawPath = (rawPath: number[]): PathNode[] => rawPath.map((index: number) => this.allNodes[index]);

  estimateTotalPathCost = (rawPath: number[]): number => {
    if (this.error) throw new Error(this.error);
    let sum = 0;
    for (let i = 0; i < rawPath.length - 2; i++) {
      const vertexA = rawPath[i];
      const vertexB = rawPath[i + 1];
      const cost = this.costMatrix[vertexA][vertexB];
      sum += cost;
    }
    return sum;
  };

  removeDummyNodeAndReverse = (path: PathNode[]) => {
    if (this.error) throw new Error(this.error);
    const filtered = path.slice(2);
    return [...filtered, path[1]];
  };

  nearestNeighborInsertion = (): PathResult => {
    if (this.error) throw new Error(this.error);
    if (this.greedy === undefined) throw new Error('must call TSP.init() before calculating paths');
    const rawPath = this.greedy.nearestNeighborInsertionPath();
    const transformed = this.transformRawPath(rawPath);
    return { path: this.removeDummyNodeAndReverse(transformed), estimatedCost: this.estimateTotalPathCost(rawPath) };
  };

  christofides = (): PathResult => {
    if (this.error) throw new Error(this.error);
    if (this.mst === undefined) throw new Error('must call TSP.init() before calculating paths');
    const rawPath = this.mst.christofides();
    const transformed = this.transformRawPath(rawPath);
    return { path: this.removeDummyNodeAndReverse(transformed), estimatedCost: this.estimateTotalPathCost(rawPath) };
  };
}
