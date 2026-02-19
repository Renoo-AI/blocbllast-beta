export const GRID_SIZE = 8;

export type ShapeMatrix = number[][];

export interface Shape {
  id: string;
  matrix: ShapeMatrix;
  color: string;
}

export const COLORS = {
  blue: '#3b82f6',
  red: '#ef4444',
  green: '#10b981',
  yellow: '#f59e0b',
  purple: '#8b5cf6',
  cyan: '#06b6d4',
  orange: '#f97316',
  pink: '#ec4899',
};

export const SHAPES: Shape[] = [
  // Single
  { id: '1x1', matrix: [[1]], color: COLORS.blue },

  // Lines
  { id: '1x2-h', matrix: [[1, 1]], color: COLORS.green },
  { id: '1x2-v', matrix: [[1], [1]], color: COLORS.green },
  { id: '1x3-h', matrix: [[1, 1, 1]], color: COLORS.cyan },
  { id: '1x3-v', matrix: [[1], [1], [1]], color: COLORS.cyan },
  { id: '1x4-h', matrix: [[1, 1, 1, 1]], color: COLORS.purple },
  { id: '1x4-v', matrix: [[1], [1], [1], [1]], color: COLORS.purple },
  { id: '1x5-h', matrix: [[1, 1, 1, 1, 1]], color: COLORS.pink },
  { id: '1x5-v', matrix: [[1], [1], [1], [1], [1]], color: COLORS.pink },

  // Squares
  { id: '2x2', matrix: [[1, 1], [1, 1]], color: COLORS.yellow },
  { id: '3x3', matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], color: COLORS.orange },

  // L-shapes (3 blocks)
  { id: 'L3-1', matrix: [[1, 0], [1, 1]], color: COLORS.red },
  { id: 'L3-2', matrix: [[0, 1], [1, 1]], color: COLORS.red },
  { id: 'L3-3', matrix: [[1, 1], [1, 0]], color: COLORS.red },
  { id: 'L3-4', matrix: [[1, 1], [0, 1]], color: COLORS.red },

  // L-shapes (5 blocks)
  { id: 'L5-1', matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], color: COLORS.blue },
  { id: 'L5-2', matrix: [[0, 0, 1], [0, 0, 1], [1, 1, 1]], color: COLORS.blue },
  { id: 'L5-3', matrix: [[1, 1, 1], [1, 0, 0], [1, 0, 0]], color: COLORS.blue },
  { id: 'L5-4', matrix: [[1, 1, 1], [0, 0, 1], [0, 0, 1]], color: COLORS.blue },

  // T-shapes
  { id: 'T3', matrix: [[1, 1, 1], [0, 1, 0]], color: COLORS.purple },

  // Z/S shapes
  { id: 'Z', matrix: [[1, 1, 0], [0, 1, 1]], color: COLORS.green },
  { id: 'S', matrix: [[0, 1, 1], [1, 1, 0]], color: COLORS.green },
];

export const SCORING = {
  PLACE_BLOCK: 1, // per block in the shape
  CLEAR_LINE: 10, // per line
  COMBO_MULTIPLIER: 1.5,
};
