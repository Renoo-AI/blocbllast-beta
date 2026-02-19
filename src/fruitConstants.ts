export interface FruitType {
  level: number;
  name: string;
  radius: number;
  color: string;
  score: number;
  emoji: string;
}

export const FRUIT_TYPES: FruitType[] = [
  { level: 0, name: 'Cherry', radius: 15, color: '#ff4d4d', score: 2, emoji: '🍒' },
  { level: 1, name: 'Strawberry', radius: 22, color: '#ff3366', score: 4, emoji: '🍓' },
  { level: 2, name: 'Grape', radius: 30, color: '#9933ff', score: 8, emoji: '🍇' },
  { level: 3, name: 'Dekopon', radius: 38, color: '#ff9933', score: 16, emoji: '🍊' },
  { level: 4, name: 'Orange', radius: 48, color: '#ffcc00', score: 32, emoji: '🥭' },
  { level: 5, name: 'Apple', radius: 60, color: '#ff0000', score: 64, emoji: '🍎' },
  { level: 6, name: 'Pear', radius: 72, color: '#ccff33', score: 128, emoji: '🍐' },
  { level: 7, name: 'Peach', radius: 85, color: '#ff99cc', score: 256, emoji: '🍑' },
  { level: 8, name: 'Pineapple', radius: 100, color: '#ffff33', score: 512, emoji: '🍍' },
  { level: 9, name: 'Melon', radius: 115, color: '#99ff33', score: 1024, emoji: '🍈' },
  { level: 10, name: 'Watermelon', radius: 135, color: '#00cc44', score: 2048, emoji: '🍉' },
];

export const WORLD_WIDTH = 400;
export const WORLD_HEIGHT = 600;
export const SPAWN_Y = 50;
