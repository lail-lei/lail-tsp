import { PathNode } from 'lail-astar';

export enum LocationFormat {
  COORDINATE = 'COORDINATE',
  ALPHABETICAL_Y = 'ALPHABETICAL_Y',
  ALPHABETICAL_X = 'ALPHABETICAL_X',
}

/**
 *
 * Takes a location string in one of 3 formats and returns a PathNode Object
 * to be used by TSP class.
 *
 * Supported formats include:
 * 1. Coordinate -> 'x,y' (zero-indexed)
 * 2. Alphabetical_X -> 'a04' where the 'a' represents an X coordinate value
 * 3. Alphabetical_Y -> 'a04' where the 'a' represents a Y coordinate value
 *
 * @param {string} location - location string in one of 3 formats
 * @param {LocationFormat} format
 * @return {PathNode}
 */
export const createPathNode = (location: string, format: LocationFormat): PathNode => {
  let x: number, y: number;
  if (format === LocationFormat.COORDINATE) {
    const split = location.replace(/' '/g, '').split(',');
    x = parseInt(split[0]);
    y = parseInt(split[1]);
  } else {
    const isolate = location.replace(/' '/g, '').slice(-3).toUpperCase();
    const characterCode = Math.abs(isolate.charCodeAt(0) - 65);
    const numericalSegment = parseInt(location.slice(-2)) - 1; // for 0 indexing

    if (format === LocationFormat.ALPHABETICAL_X) {
      x = characterCode;
      y = numericalSegment;
    } else {
      x = numericalSegment;
      y = characterCode;
    }
  }

  return new PathNode(x, y, undefined, location);
};

/**
 * Transforms an array of string locations to a PathNode array usable by TSP class.
 * Uses createPathNode @see {@link @createPathNode}.
 *
 * Note - all string locations must be 1 consistent location format.
 *
 * @param {string[]} list
 * @param {LocationFormat} format
 * @return {PathNode[]}
 */
export const preprocessList = (list: string[], format: LocationFormat): PathNode[] => {
  return list.map((location: string) => createPathNode(location, format));
};
