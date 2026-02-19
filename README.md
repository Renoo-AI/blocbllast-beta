# 2.3D Block Puzzle Game

A polished, fast, and responsive web app block puzzle game.

## Features
- **2.3D Cartoon Style**: Rounded blocks with soft bevels, shading, and shadows.
- **Fair RNG**: Shape bag system ensures a balanced variety of pieces.
- **Smooth Animations**: Snap-to-grid easing, pop-and-fade line clears, and confetti celebrations.
- **Responsive Design**: Works great on both desktop and mobile (touch support).
- **Persistence**: High score saved locally.
- **Combos**: Earn bonus points for clearing multiple lines or clearing lines consecutively.

## How to Play
1. Drag the 3 blocks from the bottom onto the 8x8 grid.
2. Fill entire rows or columns to clear them and score points.
3. Use all 3 blocks to get a new set.
4. The game ends when no more pieces can be placed on the board.

## Tech Stack
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Framer Motion** (Animations)
- **Canvas Confetti** (Effects)
- **Lucide React** (Icons)

## Development

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
npm install
```

### Running Locally
```bash
npm run dev
```

### Building for Production
```bash
npm run build
```

## Implementation Details
- **Game Logic**: Managed by a custom hook `useGameState.ts` which handles the 8x8 grid state, shape generation, collision detection, and scoring.
- **Drag and Drop**: Custom pointer event implementation in `DraggablePiece.tsx` for a smooth, lag-free experience on both mouse and touch.
- **2.3D Styling**: Achieved through layered CSS box-shadows and subtle transforms in `Block.tsx`.
