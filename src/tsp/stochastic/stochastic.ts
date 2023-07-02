export class Stochastic {
  distances: number[][];
  isHamiltonianPath: boolean;

  /**
   * Creates an instance of Stochastic.
   * @param {number[][]} distances
   * @param {boolean} isHamiltonianPath
   * @memberof Stochastic
   */
  constructor(distances: number[][], isHamiltonianPath: boolean) {
    this.distances = distances;
    this.isHamiltonianPath = isHamiltonianPath;
  }

  private generateNeighbor = (path: number[]): number[] => {
    const n = path.length;
    const min = 1; // the start node (0) must be preserved
    const max = n - 2; // the last node (n - 1) must be preserved

    const { index1, index2 } = this.generateSegmentIndices(min, max);
    const coinToss = Math.floor(Math.random() * (1 - 0 + 1) + 0);

    const clone = [...path];
    coinToss === 1 ? this.transportSegment(clone, index1, index2) : this.reverseSegment(clone, index1, index2);

    return clone;
  };

  private generateSegmentIndices = (min: number, max: number): { index1: number; index2: number } => {
    const generateRandomIndex = () => Math.floor(Math.random() * (max - min + 1) + min);
    const index1 = generateRandomIndex();
    let index2 = generateRandomIndex();
    if (index1 === index2) index2 += 1;
    return { index1: Math.min(index1, index2), index2: Math.max(index1, index2) };
  };

  private swap(path: number[], index1: number, index2: number) {
    const temp = path[index1];
    path[index1] = path[index2];
    path[index2] = temp;
  }

  private reverseSegment = (path: number[], index1: number, index2: number) => {
    let left = index1;
    let right = index2;
    while (left < right) {
      this.swap(path, left, right);
      left++;
      right--;
    }
  };

  private transportSegment = (path: number[], index1: number, index2: number) => {
    const sLength = index2 - index1;
    const segment = path.splice(index1, sLength);
    // insertion point cannot be the first or last number in the remainder path
    const getInsertionPoint = () => Math.floor(Math.random() * (path.length - 2 - 1 + 1) + 1);
    let insertionPoint = getInsertionPoint();
    if (insertionPoint === index1) insertionPoint += 1;

    const after = path.splice(insertionPoint);

    path.push(...segment);
    path.push(...after);
  };

  private computeCost = (path: number[]): number => {
    let start = 0;
    let end = 1;
    let sum = 0;

    while (end < path.length) {
      const vertexA = path[start];
      const vertexB = path[end];
      const cost = this.distances[vertexA][vertexB];
      sum += cost;
      start++;
      end++;
    }

    return sum;
  };

  simualtedAnnealing({
    initialTemp,
    minTemp,
    coolingRate,
  }: {
    initialTemp: number;
    minTemp: number;
    coolingRate: number;
  }): { path: number[]; estimatedCost: number } {
    let initialPath = this.distances.map((_current: number[], index: number) => index);
    initialPath = this.isHamiltonianPath ? [0, ...initialPath.slice(2), 1] : [...initialPath, 0];

    let currentTemp = initialTemp;

    let prevPath = initialPath;
    let prevCost = this.computeCost(prevPath);

    let bestPath = prevPath;
    let bestCost = prevCost;

    while (currentTemp > minTemp) {
      const currentPath = this.generateNeighbor(prevPath);
      const currentCost = this.computeCost(currentPath);

      if (currentCost < prevCost) {
        prevPath = currentPath;
        prevCost = currentCost;
      } else {
        const acceptanceProbability = Math.exp(-(currentCost - prevCost) / currentTemp);
        if (Math.random() <= acceptanceProbability) {
          prevPath = currentPath;
          prevCost = currentCost;
        }
      }

      if (bestCost > prevCost) {
        bestPath = prevPath;
        bestCost = prevCost;
      }
      currentTemp *= coolingRate;
    }

    return { path: bestPath, estimatedCost: bestCost };
  }
}
