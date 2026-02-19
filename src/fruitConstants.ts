export interface FruitType {
  level: number;
  name: string;
  radius: number;
  color: string;
  score: number;
}

export const FRUIT_TYPES: FruitType[] = [
  { level: 0, name: 'Cherry', radius: 15, color: '#ff4d4d', score: 2 },
  { level: 1, name: 'Strawberry', radius: 22, color: '#ff3366', score: 4 },
  { level: 2, name: 'Grape', radius: 30, color: '#9933ff', score: 8 },
  { level: 3, name: 'Dekopon', radius: 38, color: '#ff9933', score: 16 },
  { level: 4, name: 'Orange', radius: 48, color: '#ffcc00', score: 32 },
  { level: 5, name: 'Apple', radius: 60, color: '#ff0000', score: 64 },
  { level: 6, name: 'Pear', radius: 72, color: '#ccff33', score: 128 },
  { level: 7, name: 'Peach', radius: 85, color: '#ff99cc', score: 256 },
  { level: 8, name: 'Pineapple', radius: 100, color: '#ffff33', score: 512 },
  { level: 9, name: 'Melon', radius: 115, color: '#99ff33', score: 1024 },
  { level: 10, name: 'Watermelon', radius: 135, color: '#00cc44', score: 2048 },
];

export const WORLD_WIDTH = 400;
export const WORLD_HEIGHT = 600;
export const SPAWN_Y = 50;
