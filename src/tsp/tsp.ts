import { AStar, PathNode, DistanceHeuristic } from 'lail-astar';
import { GreedyHeuristics } from './greedy';
import { Stochastic } from './stochastic';

export interface PathResult {
  path: PathNode[];
  estimatedCost: number;
  reconstruction?: PathNode[];
  executionTimeInMS?: number;
}

interface ShortestPathSegment {
  row: number;
  col: number;
  estimatedCost: number;
  path?: PathNode[];
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
  private greedy?: GreedyHeuristics;
  private stochastic?: Stochastic;
  private end?: PathNode | null;
  error?: string;
  private distanceHeuristic?: DistanceHeuristic;
  private reconstructPath: boolean;
  private shortestPaths: PathNode[][][] | undefined;

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
    reconstructPath,
  }: {
    nodes: PathNode[];
    floorplan?: number[][];
    start: PathNode;
    end?: PathNode;
    distanceHeuristic?: DistanceHeuristic;
    reconstructPath?: boolean;
  }) {
    this.floorPlan = floorplan;
    this.start = start;
    this.end = end ? end : null;
    this.distanceHeuristic = distanceHeuristic;
    this.nodes = nodes;
    this.allNodes = end && this.isHamiltonianPathProblem() ? [start, end, ...nodes] : [start, ...nodes];
    this.reconstructPath = !!reconstructPath;
    this.costMatrix = this.createNodeMatrix(Infinity);
    this.shortestPaths = reconstructPath ? this.createNodeMatrix([]) : undefined;
  }

  /** Constructor helpers */

  /**
   * Create Nodes Matrix. Matrix can be used store cost of path between nodes or the
   * actual path data itself.
   * @todo - it might be better NOT abstracting this
   * @private
   * @memberof TSP
   */
  private createNodeMatrix = (fill: number | PathNode[]) => {
    return new Array<number | PathNode | undefined>(this.allNodes.length)
      .fill(undefined)
      .map(() => new Array(this.allNodes.length).fill(fill));
  };

  /**
   * Calculates initial distances between all nodes in the path, stores any reconstructed paths,
   * and inits greedy and stochastic subclasses classes.
   *
   * @private
   * @memberof TSP
   */
  init = async () => {
    await this.calculateDistances();
    this.greedy = new GreedyHeuristics(this.costMatrix, this.isHamiltonianPathProblem());
    this.stochastic = new Stochastic(this.costMatrix, this.isHamiltonianPathProblem());
  };

  /**
   * Calculates distances between each node (including start node) using AStar algorithm.
   * If problem is Hamilontian path, distances between all nodes and the end node are also calculated.
   * If TSP configuration option reconstructPath is set to true, this method also stores
   * reconstructed path in this.shortestPaths
   *
   * @private
   * @memberof TSP
   */
  private calculateDistances = async () => {
    const aStar = this.floorPlan ? new AStar(this.floorPlan) : undefined;

    const coordinates = this.allNodes.reduce((coords: number[][], _node: PathNode, row: number) => {
      coords.push(...this.allNodes.map((_node: PathNode, col: number) => [row, col]));
      return coords;
    }, []);

    const results = await Promise.all(
      coordinates.map((coords: number[]) => this.calculateShortestPathSegment(coords[0], coords[1], aStar)),
    );

    results.forEach((result: ShortestPathSegment) => {
      const { row, col, estimatedCost, path } = result;

      this.costMatrix[row][col] = estimatedCost;
      if (this.reconstructPath && this.shortestPaths) this.shortestPaths[row][col] = path || [];
    });

    // hamiltonian path problem requires a specified start and end
    if (this.isHamiltonianPathProblem()) {
      this.costMatrix[0][1] = Infinity; // start node = costMatrix[0]
      this.costMatrix[1][0] = Infinity; // end node  = costMatrix[1]
    }
  };

  /**
   * Calculates distances between 2 nodes using AStar algorithm (if floorplan is available).
   * If TSP configuration option reconstructPath is set to true, this method returns stores
   * reconstructed path
   *
   * Asynchronous to speed up engine initialization
   *
   * @param {number} row - index of node that starts path segment
   * @param {number} col - index of node that ends path segment
   * @param {AStar} aStar - optional aStar engine
   * @returns {Promise<ShortestPathSegment>}
   *
   * @private
   * @memberof TSP
   */
  private calculateShortestPathSegment = async (
    row: number,
    col: number,
    aStar?: AStar,
  ): Promise<ShortestPathSegment> => {
    return new Promise((resolve, reject) => {
      if (row === col) return resolve({ estimatedCost: 0, path: [], row, col });
      else {
        const start = this.allNodes[row];
        const end = this.allNodes[col];
        const result = { row, col } as ShortestPathSegment;
        if (aStar) {
          const { minCost, path } = aStar.search(start, end, this.reconstructPath, this.distanceHeuristic);
          result.estimatedCost = minCost;
          if (path && this.shortestPaths) result.path = path;
        } else {
          result.estimatedCost =
            this.distanceHeuristic === DistanceHeuristic.EUCLIDEAN
              ? start.calculateEuclideanDistance(end)
              : start.calculateManhattenDistance(end);
        }
        if (result.estimatedCost === Infinity) {
          const unreacahbleError = `Unreachable location encountered.`;
          this.error = unreacahbleError;
          return reject(new Error(unreacahbleError));
        } else return resolve(result);
      }
    });
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
    if (!this.greedy) throw new Error('Engine not initalized. Please call init() before computing path.');
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
    if (!this.greedy) throw new Error('Engine not initalized. Please call init() before computing path.');
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
    if (!this.greedy) throw new Error('Engine not initalized. Please call init() before computing path.');
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
    const startTime = Date.now();
    const sorted = this.nodes.sort((nodeA: PathNode, nodeB: PathNode) => {
      if (nodeA.uid && nodeB.uid) return nodeA.uid.localeCompare(nodeB.uid);
      return nodeA.gridId.localeCompare(nodeB.gridId);
    });
    const path =
      this.end && this.isHamiltonianPathProblem()
        ? [this.start, ...sorted, this.end]
        : [this.start, ...sorted, this.start];
    const endTime = Date.now();
    const rawPath = path.map((node: PathNode) =>
      this.allNodes.findIndex((current: PathNode) => current.uid === node.uid),
    );

    return { path, estimatedCost: this.estimateTotalPathCost(rawPath), executionTimeInMS: endTime - startTime };
  };

  /**
   * Stochastic path-finding method.
   *
   * @param {number} initialTemp - optional, defaults to 1
   * @param {number} minTemp - optional, defaults to 0.1
   * @param {number} alpha - optional, defaults to 0.99
   * @param {number} successesPerTemp - optional, successes to hit before cooling (defaults to 10 * list length)
   * @param {number} maxAttemptsPerTemp - optional, how many attempts before temp must cool
   * @memberof TSP
   * @returns {PathResult}
   */
  simulatedAnnealing = (
    initialTemp?: number,
    minTemp?: number,
    coolingRate?: number,
    successesPerTemp?: number,
    maxAttemptsPerTemp?: number,
  ): PathResult => {
    if (this.error) throw new Error(this.error);
    if (!this.stochastic) throw new Error('Engine not initalized. Please call init() before computing path.');
    const startTime = Date.now();
    const { path: rawPath, estimatedCost } = this.stochastic.simualtedAnnealing({
      initialTemp: initialTemp || 1,
      minTemp: minTemp || 0.0001,
      coolingRate: coolingRate || 0.99,
      successesPerTemp,
      maxAttemptsPerTemp,
    });
    const path = this.createPathNodeArray(rawPath);
    const endTime = Date.now();
    const result = { path, estimatedCost, executionTimeInMS: endTime - startTime } as PathResult;
    if (this.reconstructPath) result.reconstruction = this.reconstructTruePath(rawPath);
    return result;
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
    const startTime = Date.now();
    const rawPath = computePath();
    // connect raw path back to start node if not a hamiltonian path;
    if (!this.isHamiltonianPathProblem()) rawPath.push(0);
    const transformed = this.createPathNodeArray(rawPath);
    const endTime = Date.now();
    const result = {
      path: transformed,
      estimatedCost: this.estimateTotalPathCost(rawPath),
      executionTimeInMS: endTime - startTime,
    } as PathResult;
    if (this.reconstructPath) result.reconstruction = this.reconstructTruePath(rawPath);
    return result;
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

    let start = 0;
    let end = 1;
    let sum = 0;

    while (end < path.length) {
      const vertexA = path[start];
      const vertexB = path[end];
      const cost = this.costMatrix[vertexA][vertexB];
      sum += cost;
      start++;
      end++;
    }

    return sum;
  };

  /**
   * Creates reconstructed path between nodes. Iterates over
   * list and appends the path data from each path node.
   *
   * @private
   * @param {number[]} path
   * @returns {PathNode[]} - path data (including walls from each path)
   * @memberof TSP
   */
  private reconstructTruePath = (path: number[]): PathNode[] => {
    if (this.error) throw new Error(this.error);
    if (!this.reconstructPath || !this.shortestPaths)
      throw new Error(
        "Path reconstruction data was not stored. Please pass parament 'reconstruct path' when creating TSP object",
      );
    if (!this.floorPlan) new Error('Cannot reconstruct true path if no floorplan provided');

    const result: PathNode[] = [];
    let start = 0;
    let end = 1;

    while (end < path.length) {
      const vertexA = path[start];
      const vertexB = path[end];
      result.push(...this.shortestPaths[vertexA][vertexB]);
      start++;
      end++;
    }
    return result;
  };
}
