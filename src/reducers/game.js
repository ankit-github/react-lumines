import {
  RESTART,
  PAUSE,
  LOOP,
  NEXT,
  SCAN,
  UPDATE_DETACHED,
  UPDATE_GRID,
} from '../actions';
import {
  range,
  generateRandomPiece,
  nextScanLineX,
  nextBlockY,
} from '../utils';
import { gameStates, dimensions, speeds } from '../constants';

const getInitialState = () => ({
  now: performance.now(),
  gameState: gameStates.PLAYING,
  gameTime: 0,
  score: 0,
  scanned: 0,
  scanLine: {
    x: 0,
    speed: speeds.SCAN_LINE_MEDIUM,
  },
  queue: range(3).map(() => generateRandomPiece()),
  grid: range(dimensions.GRID_COLUMNS).map(() =>
    range(dimensions.GRID_ROWS).map(() => null),
  ),
  current: {
    x: dimensions.SQUARE_SIZE * 7,
    y: 0,
    blocks: generateRandomPiece(),
    dropped: false,
    speed: speeds.DROP_SLOW,
  },
  detached: [],
});

const reducer = (state = getInitialState(), action) => {
  switch (action.type) {
    case RESTART:
      return getInitialState();
    case PAUSE:
      return { ...state, paused: !state.paused };
    case LOOP:
      if (state.gameState === gameStates.PLAYING) {
        return {
          ...state,
          now: action.now,
          gameTime: state.gameTime + action.elapsed,
          scanLine: {
            ...state.scanLine,
            x: nextScanLineX(state.scanLine, action.elapsed),
          },
          current: {
            ...state.current,
            y: nextBlockY(state.current, action.elapsed),
          },
          detached: state.detached.map(block => ({
            ...block,
            y: nextBlockY(block, action.elapsed),
          })),
        };
      }
      return state;
    case NEXT:
      const { queue } = state;
      return {
        ...state,
        current: {
          x: dimensions.SQUARE_SIZE * 7,
          y: 0,
          blocks: queue[0],
          dropped: false,
          speed: speeds.DROP_SLOW,
        },
        queue: [queue[1], queue[2], action.next],
      };
    case SCAN:
      const count = action.scanned.filter(block => block.head).length;
      return {
        ...state,
        scanned: action.end ? 0 : state.scanned + count,
        score: action.end ? state.score + state.scanned : state.score,
      };
    case UPDATE_DETACHED:
      return { ...state, detached: action.detached };
    case UPDATE_GRID:
      return { ...state, grid: action.grid };
    default:
      return state;
  }
};

export default reducer;
