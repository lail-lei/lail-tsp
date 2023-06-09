import { PathNode } from 'lail-astar';

export enum LocationType {
  COORDINATE = 'COORDINATE',
  ALPHANUMERIC = 'ALPHANUMERIC',
}

export const createPathNode = (location: string, locationType: LocationType) => {
  let x: number, y: number;
  if (locationType === LocationType.ALPHANUMERIC) {
    const isolate = location.replace(/' '/g, '').slice(-3).toUpperCase();
    x = Math.abs(isolate.charCodeAt(0) - 65);
    y = parseInt(location.slice(-2)) - 1; // for 0 indexing
  } else {
    const split = location.replace(/' '/g, '').split(',');
    x = parseInt(split[0]);
    y = parseInt(split[1]);
  }
  return new PathNode(x, y, undefined, location);
};

export const preprocessList = ({ list, locationType }: { list: string[]; locationType: LocationType }): PathNode[] => {
  return list.map((location: string) => createPathNode(location, locationType));
};
