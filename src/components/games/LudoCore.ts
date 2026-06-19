export const PERIMETER = [
  // Left arm, top row
  [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
  // Top arm, left col
  [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
  // Top arm, edge
  [7, 0],
  // Top arm, right col
  [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5],
  // Right arm, top row
  [9, 6], [10, 6], [11, 6], [12, 6], [13, 6], [14, 6],
  // Right arm, edge
  [14, 7],
  // Right arm, bottom row
  [14, 8], [13, 8], [12, 8], [11, 8], [10, 8], [9, 8],
  // Bottom arm, right col
  [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14],
  // Bottom arm, edge
  [7, 14],
  // Bottom arm, left col
  [6, 14], [6, 13], [6, 12], [6, 11], [6, 10], [6, 9],
  // Left arm, bottom row
  [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  // Left arm, edge
  [0, 7]
]; // 52 cells

export const SAFE_INDICES = [1, 12, 14, 25, 27, 38, 40, 51];

export const COLORS = ['red', 'green', 'yellow', 'blue'] as const;
export type LudoColor = typeof COLORS[number];

export const TEAM_START_OFFSETS: Record<LudoColor, number> = {
  red: 1, // [1,6]
  yellow: 14, // [8,1]
  blue: 27, // [13,8]
  green: 40 // [6,13]
};

export const HOME_STRETCHES: Record<LudoColor, number[][]> = {
  red: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]], // ends at center
  yellow: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
  green: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
};

export function getPathForColor(color: LudoColor) {
  const startOffset = TEAM_START_OFFSETS[color];
  const path = [];
  for (let i = 0; i < 51; i++) {
    path.push(PERIMETER[(startOffset + i) % 52]);
  }
  path.push(...HOME_STRETCHES[color]);
  return path; // length 57 (indices 0..56). 0 is position 1, 56 is position 57
}

export const PATHS = {
  red: getPathForColor('red'),
  green: getPathForColor('green'),
  yellow: getPathForColor('yellow'),
  blue: getPathForColor('blue'),
};

export const YARD_CENTERS: Record<LudoColor, number[]> = {
  red: [2.5, 2.5], // wait, Red is top-left! [1,6] starts top-left arm
  yellow: [11.5, 2.5], // top-right
  blue: [11.5, 11.5], // bottom-right
  green: [2.5, 11.5]  // bottom-left
};
