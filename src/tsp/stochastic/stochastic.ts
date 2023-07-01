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

  private swapTwo(path: number[]): number[] {
    const n = path.length;
    const min = 1; // the start node (0) must be preserved
    const max = n - 2; // the last node (n - 1) must be preserved

    const clone = [...path];

    const generateRandomIndex = () => Math.floor(Math.random() * (max - min + 1) + min);

    const index1 = generateRandomIndex();
    let index2 = generateRandomIndex();
    // ensure real swap happens
    while (index1 === index2) index2 = generateRandomIndex();

    const temp = clone[index1];
    clone[index1] = clone[index2];
    clone[index2] = temp;

    return clone;
  }

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
    initialPath = this.isHamiltonianPath ? [0, ...initialPath.slice(2), 1] : [0, ...initialPath, 0];

    let currentTemp = initialTemp;

    let prevPath = initialPath;
    let prevCost = this.computeCost(prevPath);

    let bestPath = prevPath;
    let bestCost = prevCost;

    while (currentTemp > minTemp) {
      const currentPath = this.swapTwo(prevPath);
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
