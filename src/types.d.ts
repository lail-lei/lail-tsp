type Matrix = number[][]
interface Edge { vertexA: number; vertexB: number, weight: number }
interface AdjencyList { [vertex: number]: Edge[] }
interface PathResult { path: any[], estimatedCost: number }