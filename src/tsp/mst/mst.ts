import { EdgeSort } from './constants';
import blossom = require('edmonds-blossom-fixed');

export interface Edge {
  vertexA: number;
  vertexB: number;
  weight: number;
}
interface AdjencyList {
  [vertex: number]: Edge[];
}

/**
 * MST (minimal spanning tree) Object. Contains methods for creating, mutating, +
 * processing a MST.
 *
 * @export
 * @class MST
 */
export class MST {
  distances: number[][];
  numVertices: number;
  visited: Set<number>;
  mstEdges: Edge[];

  /**
   * Creates an instance of MST.
   * @param {number[][]} distances
   * @memberof MST
   */
  constructor(distances: number[][]) {
    this.distances = distances;
    this.numVertices = distances.length;
    this.visited = new Set<number>();
    this.mstEdges = [];
  }

  /**
   * Creates MST using modified Prim's algorithm.
   * MST (adjency list) is stored in MST.tree property.
   */
  prims = () => {
    /**
     * Finds the nearest unvisited + reachable edge to any
     * vertex in the MST.
     *
     * @return {Edge}  {Edge}
     */
    const getNearestReachableEdge = (): Edge => {
      const minEdge = { vertexA: -1, vertexB: -1, weight: Infinity } as Edge;
      // for each node,
      for (let a = 0; a < this.numVertices; a++) {
        // we only want to find children of visted nodes
        if (!this.visited.has(a)) continue;

        // we want to find the next closest unvisited node reachable from our current node
        // NOTE - for our usecase, all nodes are reachable from all other nodes
        for (let b = 0; b < this.numVertices; b++) {
          // if already visited, or if same node as r, skip
          if (this.visited.has(b)) continue;

          const weight = this.distances[a][b];
          if (weight < minEdge.weight) {
            minEdge.vertexA = a;
            minEdge.vertexB = b;
            minEdge.weight = weight;
          }
        }
      }

      return minEdge;
    };

    // start at first node
    let current = 0;
    // keep track of the order we add edges to MST
    const edgePath = [];

    // while we have not visited all nodes ... (exclude the first)
    while (this.visited.size < this.numVertices - 1) {
      // ...mark current node as visited
      this.visited.add(current);
      // find the next reachable edge with the smallest weight
      const minReachableEdge = getNearestReachableEdge();
      // the connecting node should now be added to MST
      current = minReachableEdge.vertexB;
      edgePath.push(minReachableEdge);
    }
    this.mstEdges = edgePath;
  };

  /**
   * Converts path of edges into a traversable tree (uses adjency list data structure).
   * Config options include:
   *
   * 1. undirected - whether the MST should contain 2 edges or 1 to represent connection between 2 vertices (if undirected, A -> B is different to B -> A)
   * 2. edgeSort - whether to order edges at a certain level of the tree by cost or by or number of children.
   *
   * Note - when creating a simple MST path/traversable tree we do not
   * want the MST to be considered undirected (i.e., once we visit a node, we don't want to go backwards).
   * however, for christofedes implementations, it is helpful to create an undirected graph
   *
   * @param {{
   *     path: Edge[];
   *     prioritizeLeafNodes?: boolean;
   *     undirected?: boolean;
   *     edgeSort?: EdgeSort;
   *   }} {
   *     path - array of edges, in order visited during prims algo,
   *     undirected - optional boolean, defaults to false.
   *     edgeSort - how to prioritize edges at a certain level of the adjency list
   *   }
   * @memberof MST
   */
  convertEdgePathToTree = ({
    path,
    undirected,
    edgeSort,
  }: {
    path: Edge[];
    undirected?: boolean;
    edgeSort?: EdgeSort;
  }): AdjencyList => {
    const addToTree = (tree: AdjencyList, vertex: number, edge: Edge) => {
      if (tree[vertex]) tree[vertex].push(edge);
      else tree[vertex] = [edge];
    };

    const tree = path.reduce((tree: AdjencyList, currentEdge: Edge) => {
      const { vertexA, vertexB, weight } = currentEdge;
      addToTree(tree, vertexA, currentEdge);
      if (undirected) addToTree(tree, vertexB, { vertexA: vertexB, vertexB: vertexA, weight });
      return tree;
    }, {});

    if (edgeSort === EdgeSort.PRIORITIZE_LEAF_NODES) this.prioritizeLeafNodes(tree);
    if (edgeSort === EdgeSort.BY_WEIGHT) this.prioritizeLowWeightEdges(tree);
    return tree;
  };

  /**
   * Note: Mutating function.
   *
   * When traversing our MST, prioritize visting leaf nodes before nodes that have many children
   * in tranversals. This more closely mimics the behavior of humans.
   * Example: 2 articles are equally close to your current location. One article, A, has no subsequent
   * articles close to it, the other article, B, has 5 other articles close to it,
   * but farther away from your current location.
   *
   * To avoid having to return to your current location once you leave it,
   * take article A first, then collect B and all other items close to B.
   *
   * @param tree - AdjencyList
   */
  prioritizeLeafNodes = (tree: AdjencyList) => {
    const treeSize = Object.keys(tree).length;
    if (treeSize === 0) return;
    for (let i = 0; i < treeSize; i++) {
      const edges = tree[i];
      if (!edges) continue;
      // mutating
      edges.sort((e1: Edge, e2: Edge) => {
        const v1 = e1.vertexB;
        const v2 = e2.vertexB;
        const length1 = tree[v1]?.length || 0;
        const length2 = tree[v2]?.length || 0;
        return length2 - length1;
      });
    }
  };

  /**
   * Note: Mutating function.
   *
   * When traversing our MST, prioritize visting nodes closest to the current nodes.
   * This more closely mimics the behavior of humans.
   *
   * @param tree - AdjencyList
   */
  prioritizeLowWeightEdges = (tree: AdjencyList) => {
    const treeSize = Object.keys(tree).length;
    if (treeSize === 0) return;
    for (let i = 0; i < treeSize; i++) {
      const edges = tree[i];
      if (!edges) continue;
      // mutating
      edges.sort((e1: Edge, e2: Edge) => {
        return e2.weight - e1.weight;
      });
    }
  };

  /**
   * Intended to return a deep copy of the tree (AdjencyList) passed
   * as param.
   *
   * @todo - confirm that tree returned is in fact a deep copy.
   * @param tree - AdjencyList
   */
  cloneTree = (tree: AdjencyList): AdjencyList => {
    return Object.keys(tree).reduce((clone: AdjencyList, vertex: string) => {
      const key = parseInt(vertex, 10);
      clone[key] = [...tree[key]];
      return clone;
    }, {} as AdjencyList);
  };

  /**
   * Performs preorder traversal on the MST stored in this.tree.
   *
   * @returns An array of vertices in preorder. vertices correspond to indices in graph.
   */
  preorderTraversal = (tree: AdjencyList): number[] => {
    const stack: number[] = [0];
    const path = [];
    while (stack.length !== 0) {
      const current = stack.pop();
      if (current === undefined) continue;
      path.push(current);
      tree[current]?.forEach((edge: Edge) => {
        stack.push(edge.vertexB);
      });
    }
    return path;
  };

  /**
   * Traverses generated tree and finds any vertex in
   * the mst that has an odd degree.
   *
   * @param tree - tree for which to find all odd degree vertices.
   * @returns An array of vertices (by index in graph) that have an odd degree.
   */
  oddDegreeVertices = (tree: AdjencyList): number[] => {
    const vertices = Object.keys(tree).map((key: string) => parseInt(key, 10));
    return vertices.filter((vertex: number) => tree[vertex]?.length % 2 !== 0);
  };

  /**
   * Uses edmund's blossom algoritm to find
   * minmum cost perfect matching for the vertices
   * passed as argument.
   *
   * @param vertices - an array of indices (from graph) of any vertice for which to create a min-cost perfect matching.
   * @returns An adjency list containing all edges in the min cost perfect matching.
   */
  getMinCostPerfectMatching = (vertices: number[]): AdjencyList => {
    const blossomArray: number[][] = [];
    vertices.forEach((vertex: number) => {
      vertices.forEach((ver: number) => {
        if (vertex !== ver) {
          // blossom algo finds max cost perfect matching, so
          // need to find inverse of weight
          const inverseWeight = Number.MAX_SAFE_INTEGER - this.distances[vertex][ver];
          blossomArray.push([vertex, ver, inverseWeight]);
        }
      });
    });

    const result = blossom(blossomArray);
    const visited = new Set<number>();
    // convert blossom algo result to adjency list format
    return result.reduce((matches: AdjencyList, num: number, index: number) => {
      // -1 indicates edge not included in matching
      if (num === -1) return matches;
      matches[num] = [{ vertexA: num, vertexB: index, weight: this.distances[num][index] }];
      visited.add(num);
      visited.add(index);
      return matches;
    }, {});
  };

  /**
   * Finds the Eulerian tour (circuit) of a tree.
   * Assumes that since we've added the perfect matching to our
   * MST, the graph contains no odd degree vertices.
   *
   * @todo Add check (if graph is eulerian) before executing function and throw error otherwise.
   *
   * @param eulerGraph - any adjency list with 0 odd degree vertices.
   * @returns An array of numbers (indices) representing each node, in the order visited in Eulerian Tour.
   */
  findEulerianTour = (eulerGraph: AdjencyList): number[] => {
    const clone = this.cloneTree(eulerGraph);
    const stack: number[] = [2];
    const tour: number[] = [0, 1, 2]; // ensure special nodes visited first
    let current: number | null = 0;

    while (stack.length > 0) {
      if (current === null) current = stack.pop() as number;
      const nextNeighbor: number | null = clone[current].length > 0 ? clone[current][0].vertexB : null;

      // if current vertex has no neighbors
      if (nextNeighbor === null) {
        // add to tour
        tour.push(current);
        // relaunch next cycle such that
        // the last vertex from the stack will be removed
        // and set to the current
        current = null;
        continue;
      }

      // else, if current vertex has neighbors

      // add current back to stack
      stack.push(current);

      // remove the edge from current -> nextNeighbor
      clone[current] = clone[current].filter((edge: Edge) => edge.vertexB !== nextNeighbor);
      clone[nextNeighbor] = clone[nextNeighbor].filter((edge: Edge) => edge.vertexB !== current);

      current = nextNeighbor;
    }

    return tour;
  };

  /**
   * Creates a Hamiltonian path from a Euler tour by skipping
   * any visited vertices.
   *
   * @param tour - an array of numbers (vertices), representing a Eulear tour.
   * @returns An array of numbers (indices) representing each node, in the order visited in Hamiltonian path.
   */
  createHamiltonianPath = (tour: number[]): number[] => {
    const visited = new Set<number>();
    return tour.reduce((path: number[], current: number) => {
      if (visited.has(current)) return path;
      path.push(current);
      visited.add(current);
      return path;
    }, []);
  };
}
