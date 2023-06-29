import { AStar, PathNode, DistanceHeuristic } from 'lail-astar';
import { GreedyHeuristics } from './greedy';

export interface PathResult {
  path: PathNode[];
  estimatedCost: number;
}

/**
 * Traveling Salesperson Problem class. Takes array of locations (in PathNode format),
 * calculates distances using AStar algorithm (with configurable distance heuristic),
 * and provides 3 heuristic and 1 naive approaches to solving TSP.
 *
 * @export
 * @class TSP
 */
export class TSP {
  private nodes: PathNode[];
  private start: PathNode;
  private costMatrix: number[][];
  private floorPlan?: number[][]; // for wall data
  private allNodes: PathNode[]; // contains predetermined start, end + dummy nodes
  private greedy: GreedyHeuristics;
  private end?: PathNode | null;
  error?: string;
  private distanceHeuristic?: DistanceHeuristic;

  /**
   * Creates an instance of TSP.
   *
   * @param {{
   *     nodes: PathNode[];
   *     floorplan: number[][];
   *     start: PathNode;
   *     end?: PathNode;
   *     distanceHeuristic?: DistanceHeuristic;
   *   }} {
   *     nodes - unique locations for nodes in the list,
   *     floorplan - number array where 0s represent walkable spaces and 1 represents walls,
   *     start - required path node designating the starting position of the path,
   *     end - optional path node designating ending position of the path,
   *     distanceHeuristic - optional distance heuristic used in distance calculations. Defaults to Manhattan distance.
   *   }
   * @memberof TSP
   */
  constructor({
    nodes,
    floorplan,
    start,
    end,
    distanceHeuristic,
  }: {
    nodes: PathNode[];
    floorplan?: number[][];
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
    this.calculateDistances();
    this.greedy = new GreedyHeuristics(this.costMatrix, this.isHamiltonianPathProblem());
  }

  /** Constructor helpers */

  /**
   * Calculates distances between each node in path (including start node) using AStar algorithm.
   * If problem is Hamilontian path, distances between all nodes and the end node are also calculated.
   *
   * @private
   * @memberof TSP
   */
  private calculateDistances = () => {
    let aStar;
    if (this.floorPlan) aStar = new AStar(this.floorPlan);

    for (let r = 0; r < this.allNodes.length; r++) {
      for (let c = 0; c < this.allNodes.length; c++) {
        if (r === c) this.costMatrix[r][c] = 0;
        else {
          const start = this.allNodes[r];
          const end = this.allNodes[c];
          const distance = aStar
            ? aStar.search(start, end, false, this.distanceHeuristic).minCost
            : this.distanceHeuristic === DistanceHeuristic.EUCLIDEAN
            ? start.calculateEuclideanDistance(end)
            : start.calculateManhattenDistance(end);

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
      this.costMatrix[0][1] = Infinity; // start node = costMatrix[0]
      this.costMatrix[1][0] = Infinity; // end node  = costMatrix[1]
    }
  };

  /**
   * Returns true if the problem (TSP parent class) has a defined end node
   * that is not the same location as the start.
   *
   * @private
   * @memberof TSP
   */
  private isHamiltonianPathProblem = (): boolean => !!(this.end && this.end.gridId !== this.start.gridId);

  /** Main (Path) Methods */

  /**
   * Greedy path-finding heuristic.
   * Returns path in nearest neighbor order.
   *
   * @memberof TSP
   * @returns {PathResult}
   */
  nearestNeighborPath = (): PathResult => {
    if (this.error) throw new Error(this.error);
    return this.computeGreedyPath(this.greedy.nearestNeighborPath);
  };

  /**
   * Greedy path-finding heuristic.
   * Returns path created by nearest insertion.
   * Performs better for Hamiltonian Paths than true TSP problems.
   *
   * @memberof TSP
   * @returns {PathResult}
   */
  nearestInsertionPath = (): PathResult => {
    if (this.error) throw new Error(this.error);
    return this.computeGreedyPath(this.greedy.nearestInsertionPath);
  };

  /**
   * Greedy path-finding heuristic.
   * Returns path created by farthest insertion.
   * Performs better for Hamiltonian Paths than true TSP problems.
   *
   * @memberof TSP
   * @returns {PathResult}
   */
  farthestInsertionPath = (): PathResult => {
    if (this.error) throw new Error(this.error);
    return this.computeGreedyPath(this.greedy.farthestInsertionPath);
  };

  /**
   * Naive path-finding method.
   * Returns locations sorted into alphanumeric order.
   * Example 1:  [A11, B30, A08, D20, C13] -> [A08, A11, B30, C13, D20]
   * Example 2:  ['20,10', '0,7', '0,0', '3,4', '20,0' ] -> ['0,0', '0,7', '3,4', '20,0', '20,10']
   *
   * @memberof TSP
   * @returns {PathResult}
   */
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

  /**
   * Abstracted method that:
   * 1. Computes path using parameter function.
   * 2. Takes raw computed path (node indices) and creates a PathNode array
   * 3. Transforms the path into a circular tour if not a Hamiltonian Path problem
   *
   * @private
   * @param {() => number[]} computePath - heuristic function to compute a Hamilton Path
   * @returns {PathResult}
   * @memberof TSP
   */
  private computeGreedyPath = (computePath: () => number[]): PathResult => {
    // todo - if list is sufficiently short, return list without computing
    const rawPath = computePath();
    const transformed = this.createPathNodeArray(rawPath);
    const path = this.isHamiltonianPathProblem() ? transformed : this.connectBackToStart(transformed);
    return { path, estimatedCost: this.estimateTotalPathCost(rawPath) };
  };

  /**
   * Converts raw path (array of indices representing nodes in TSP.allNodes) to
   * a PathNode array (contains all node information).
   *
   * @private
   * @param {number[]} rawPath
   * @memberof TSP
   */
  private createPathNodeArray = (rawPath: number[]): PathNode[] => rawPath.map((index: number) => this.allNodes[index]);

  /**
   * Estimates distance to traverse provided path. Iterates over
   * list and sums the distance from each path node.
   *
   * @private
   * @param {number[]} path
   * @returns {number} - estimated distance to traverse param path.
   * @memberof TSP
   */
  private estimateTotalPathCost = (path: number[]): number => {
    if (this.error) throw new Error(this.error);
    if (path.length === 1) return path[0];

    let sum = 0;
    for (let i = 0; i < path.length - 2; i++) {
      const vertexA = path[i];
      const vertexB = path[i + 1];
      const cost = this.costMatrix[vertexA][vertexB];
      sum += cost;
    }
    return sum;
  };

  /**
   * Appends start node to path (PathNode array).
   *
   * @private
   * @param {PathNode[]} path
   * @returns {PathNode[]} - PathNode array with identical start and end PathNodes.
   * @memberof TSP
   */
  private connectBackToStart = (path: PathNode[]): PathNode[] => {
    if (this.error) throw new Error(this.error);
    return [...path, this.start];
  };
}
