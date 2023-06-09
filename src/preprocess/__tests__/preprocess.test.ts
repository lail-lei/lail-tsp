import { LocationType, createPathNode, preprocessList } from '../preprocess';

describe('simple tests', () => {
  it('converts 1235678_A01 to path node 0,0', () => {
    const result = createPathNode('1235678_a01', LocationType.ALPHANUMERIC);
    const node = result;
    const x = node.x;
    const y = node.y;
    expect(x).toBe(0);
    expect(y).toBe(0);
  });

  it('converts 1235678_Z50 to path node 0,0', () => {
    const result = createPathNode('1235678_Z50', LocationType.ALPHANUMERIC);
    const node = result;
    const x = node.x;
    const y = node.y;
    expect(x).toBe(25);
    expect(y).toBe(49);
  });

  it('converts 1235678_M25 to path node 12,24', () => {
    const result = createPathNode('1235678_M25', LocationType.ALPHANUMERIC);
    const node = result;
    const x = node.x;
    const y = node.y;
    expect(x).toBe(12);
    expect(y).toBe(24);
  });

  it('creates path node 0,0 from coordinate, 0,0', () => {
    const result = createPathNode('0,0', LocationType.COORDINATE);
    const node = result;
    const x = node.x;
    const y = node.y;
    expect(x).toBe(0);
    expect(y).toBe(0);
  });

  it('creates path node 25,49 from coordinate, 25,49', () => {
    const result = createPathNode('25,49', LocationType.COORDINATE);
    const node = result;
    const x = node.x;
    const y = node.y;
    expect(x).toBe(25);
    expect(y).toBe(49);
  });

  it('creates path node 25,49 from coordinate, 2 , 49', () => {
    const result = createPathNode(' 25 , 49 ', LocationType.COORDINATE);
    const node = result;
    const x = node.x;
    const y = node.y;
    expect(x).toBe(25);
    expect(y).toBe(49);
  });

  it('creates path node 25,49 from coordinate, 2 , 49', () => {
    const result = createPathNode(' 25,49 ', LocationType.COORDINATE);
    const node = result;
    const x = node.x;
    const y = node.y;
    expect(x).toBe(25);
    expect(y).toBe(49);
  });

  it('creates array of path nodes', () => {
    const result = preprocessList({ locationType: LocationType.ALPHANUMERIC, list: ['A11', 'B10', 'C,20'] });
    const length = result.length;
    expect(length).toBe(3);
  });
});
