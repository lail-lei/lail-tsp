export const sumPathCost = (rawPath: number[], costMatrix: number[][]): number => {

    if (rawPath.length === 1) return rawPath[0];

    let sum = 0;
    for (let i = 0; i < rawPath.length - 2; i++) {
        const vertexA = rawPath[i];
        const vertexB = rawPath[i + 1];
        const cost = costMatrix[vertexA][vertexB];
        sum += cost;
    }
    return sum;
};