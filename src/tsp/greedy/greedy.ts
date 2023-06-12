import { Edge } from "../mst/mst";
import { sumPathCost } from "../util";

export class GreedyHeuristics {
  distances: Matrix;
  isHamiltonianPath: boolean;

  constructor(distances: Matrix, isHamiltonianPath: boolean) {
    this.distances = distances;
    this.isHamiltonianPath = isHamiltonianPath;
  }

  findNearestNeighbor = (vertex: number, visited: Set<number>) => {
    let min = Infinity;
    let minIndex = -1;
    for (let c = 0; c < this.distances[0].length + 1; c++) {
      if (vertex === c || visited.has(c)) continue;
      if (this.distances[vertex][c] <= min) {
        minIndex = c;
        min = this.distances[vertex][minIndex];
      }
    }
    return minIndex;
  };

  findFarthestNeighbor = (vertex: number, visited: Set<number>) => {
    let max = -Infinity;
    let maxIndex = -1;
    for (let c = 0; c < this.distances[0].length + 1; c++) {
      if (vertex === c || visited.has(c)) continue;
      if (this.distances[vertex][c] >= max) {
        maxIndex = c;
        max = this.distances[vertex][maxIndex];
      }
    }
    return maxIndex;
  };

  nearestNeighborPath = (): number[] => {
    const stack: number[] = [];
    const path: number[] = [];
    const visited = new Set<number>();

    if (this.isHamiltonianPath) {
      stack.push(2);
      path.push(1);
      // ignore dummy node
      visited.add(0);
      visited.add(1);
    } else {
      stack.push(0);
    }


    while (stack.length > 0) {
      const current = stack.pop();
      if (current === undefined) continue;
      path.push(current);
      const next = this.findNearestNeighbor(current, visited);
      // encountered all, so break
      if (next === -1) break;
      visited.add(current);
      stack.push(next);
    }

    return path;
  };




  insertionPath = (nearest: boolean): number[] => {

    let path: number[] = [];
    const visited = new Set<number>();

    if (this.isHamiltonianPath) {
      path.push(1);
      path.push(2);
      // ignore dummy node
      visited.add(0);
      visited.add(1);
      visited.add(2);
    } else {
      path.push(0);
      visited.add(0);
    }

    const getNextBestNeighbor = (node: number) => nearest ? this.findNearestNeighbor(node, visited) : this.findFarthestNeighbor(node, visited);

    const insertAtIndex = (path: number[], insertionIndex: number, value: number) => {
      const before = path.slice(0, insertionIndex);
      const after = path.slice(insertionIndex);
      return [...before, value, ...after];
    }

    // while (visited.size < this.distances.length) {
    //   const possibleNewEdges = path.map((node: number) => {
    //     const neighbor = getNextBestNeighbor(node);
    //     return { weight: this.distances[node][neighbor], vertexB: neighbor, vertexA: node } as Edge;
    //   });  

    //   possibleNewEdges.sort((edgeA: Edge, edgeB: Edge) => edgeA.weight - edgeB.weight);

    //   const nextBestEdge = nearest ? possibleNewEdges[0] : possibleNewEdges[possibleNewEdges.length - 1];
    //   const { vertexA: source, vertexB: newNeighbor } = nextBestEdge;
    //   const sourceIndex = path.findIndex((node: number) => node === source);

    //   console.log(newNeighbor);

    //   visited.add(newNeighbor);

    //   // all paths have defined end point
    //   if (sourceIndex === 0) {
    //     path = insertAtIndex(path, 1, newNeighbor)
    //     continue;
    //   }

    //   // hamiltonian paths have defined end point
    //   if (this.isHamiltonianPath && sourceIndex === path.length - 1) {
    //     path = insertAtIndex(path, path.length - 1, newNeighbor)
    //     continue;
    //   }

    //   const costToInsertBefore = sumPathCost([path[sourceIndex - 1], newNeighbor, source], this.distances);
    //   const costToInsertAfter = sumPathCost([path[sourceIndex - 1], newNeighbor, source], this.distances);

    //   if (costToInsertBefore < costToInsertAfter)
    //     path = insertAtIndex(path, sourceIndex, newNeighbor);

    //   else
    //     path = insertAtIndex(path, sourceIndex + 1, newNeighbor)
    // }

    return path;

  }


  nearestInsertionPath = () => this.insertionPath(true);
  farthestInsertionPath = () => this.insertionPath(false);

}
