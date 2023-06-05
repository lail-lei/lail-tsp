type Matrix = number[][]
interface Edge { vertexA: number; vertexB: number, weight: number }
interface AdjencyList { [vertex: number]: Edge[] }
// duplicate type declaration from aStar package - consider revising this 
interface PathNode { x: number, y: number, parent: PathNode | null, id: string, cost: number }
interface PathResult { path: PathNode[], estimatedCost: number }