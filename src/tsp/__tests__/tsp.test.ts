import { PathNode } from 'lail-astar';
import { TSP } from '../tsp';

const floorplan = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

const nodes = [
  new PathNode(0, 0),
  new PathNode(10, 10),
  new PathNode(2, 5),
  new PathNode(7, 0),
  new PathNode(25, 49),
  new PathNode(6, 24),
  new PathNode(11, 20),
  new PathNode(10, 30),
  new PathNode(2, 11),
  new PathNode(8, 0),
  new PathNode(21, 40),
  new PathNode(7, 24),
  new PathNode(18, 30),
  new PathNode(11, 45),
  new PathNode(24, 24),
  new PathNode(1, 30),
  new PathNode(2, 19),
  new PathNode(19, 42),
  new PathNode(4, 24),
  new PathNode(3, 8),
  new PathNode(11, 11),
  new PathNode(3, 1),
  new PathNode(2, 20),
  new PathNode(3, 7),
  new PathNode(3, 28),
  new PathNode(6, 2),
  new PathNode(6, 7),
  new PathNode(3, 21),
  new PathNode(10, 31),
  new PathNode(12, 25),
  new PathNode(7, 26),
  new PathNode(7, 30),
  new PathNode(12, 5),
  new PathNode(11, 28),
  new PathNode(3, 20),
];

describe('simple test', () => {
  it('floorplan 1, start: 0,0 end: 25,49, greedy path', async () => {
    const tsp = new TSP({ nodes, floorplan, start: new PathNode(0, 0), end: new PathNode(25, 49) });
    await tsp.init();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { path, estimatedCost } = tsp.nearestNeighborPath();
    console.log(estimatedCost);
  });

  it('floorplan 1, start: 0,0 end: 25,49, simulated annealing', async () => {
    const tsp = new TSP({ nodes, floorplan, start: new PathNode(0, 0), end: new PathNode(25, 49) });
    await tsp.init();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { path, estimatedCost } = tsp.simulatedAnnealing();
    console.log(estimatedCost);
  });

  it('floorplan 1, start: 0,0 end: 25,49, nearest insertion', async () => {
    const tsp = new TSP({ nodes, floorplan, start: new PathNode(0, 0), end: new PathNode(25, 49) });
    await tsp.init();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { path, estimatedCost } = tsp.nearestInsertionPath();
    console.log(estimatedCost);
  });

  it('floorplan 1, start: 0,0 end: 25,49, farthest insertion', async () => {
    const tsp = new TSP({ nodes, floorplan, start: new PathNode(0, 0), end: new PathNode(25, 49) });
    await tsp.init();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { path, estimatedCost } = tsp.farthestInsertionPath();
    console.log(estimatedCost);
  });

  it('no floorplan, start: 0,0 end: 25,49, farthest insertion', async () => {
    const tsp = new TSP({ nodes, start: new PathNode(0, 0), end: new PathNode(25, 49) });
    await tsp.init();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { path, estimatedCost } = tsp.farthestInsertionPath();
  });

  it('no floorplan, start: 0,0 end: 25,49, nearest insertion', async () => {
    const tsp = new TSP({ nodes, start: new PathNode(0, 0), end: new PathNode(25, 49) });
    await tsp.init();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { path, estimatedCost } = tsp.nearestInsertionPath();
  });

  it('no floorplan, start: 0,0 end: 25,49, nearest neighbor', async () => {
    const tsp = new TSP({ nodes, start: new PathNode(0, 0), end: new PathNode(25, 49) });
    await tsp.init();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { path, estimatedCost } = tsp.nearestNeighborPath();
  });

  it('floorplan 1, start: 0,0 end: 25,49, nearest insertion, reconstructs path', async () => {
    const tsp = new TSP({
      nodes,
      floorplan,
      start: new PathNode(0, 0),
      end: new PathNode(25, 49),
      reconstructPath: true,
    });

    await tsp.init();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { path, estimatedCost, reconstruction } = tsp.nearestInsertionPath();
  });
  it('floorplan 1, start: 0,0 end: 25,49, farthest insertion, reconstructs path', async () => {
    const tsp = new TSP({
      nodes,
      floorplan,
      start: new PathNode(0, 0),
      end: new PathNode(25, 49),
      reconstructPath: true,
    });
    await tsp.init();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { path, estimatedCost, reconstruction } = tsp.farthestInsertionPath();
  });
  it('floorplan 1, start: 0,0 end: 25,49, nearest neighbor, reconstructs path', async () => {
    const tsp = new TSP({
      nodes,
      floorplan,
      start: new PathNode(0, 0),
      end: new PathNode(25, 49),
      reconstructPath: true,
    });
    await tsp.init();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { path, estimatedCost, reconstruction } = tsp.nearestNeighborPath();
  });
});
