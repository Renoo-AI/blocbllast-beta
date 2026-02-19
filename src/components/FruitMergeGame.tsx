import React, { useEffect, useRef, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { FRUIT_TYPES, WORLD_WIDTH, WORLD_HEIGHT, SPAWN_Y } from '../fruitConstants';
import { RotateCcw, ArrowLeft, Trophy, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FruitMergeGameProps {
  onBack: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

interface FruitBody extends Matter.Body {
  plugin: {
    level: number;
  };
}

export const FruitMergeGame: React.FC<FruitMergeGameProps> = ({ onBack, soundEnabled, onToggleSound }) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const gameOverTimeoutRef = useRef<number | null>(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('fruitMerge_highScore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [gameOver, setGameOver] = useState(false);
  const [nextFruitLevel, setNextFruitLevel] = useState(0);
  const [canDrop, setCanDrop] = useState(true);
  const [mouseX, setMouseX] = useState(WORLD_WIDTH / 2);

  const spawnFruit = useCallback((x: number, y: number, level: number, isStatic = false) => {
    if (!engineRef.current) return;

    const fruitType = FRUIT_TYPES[level];
    const fruit = Matter.Bodies.circle(x, y, fruitType.radius, {
      label: `fruit_${level}`,
      restitution: 0.3,
      friction: 0.1,
      isStatic: isStatic,
      render: {
        visible: false
      },
      plugin: { level }
    }) as FruitBody;

    Matter.World.add(engineRef.current.world, fruit);
    return fruit;
  }, []);

  const handleDrop = useCallback(() => {
    if (!canDrop || gameOver) return;

    setCanDrop(false);
    spawnFruit(mouseX, SPAWN_Y, nextFruitLevel);

    setNextFruitLevel(Math.floor(Math.random() * 5));

    setTimeout(() => {
      setCanDrop(true);
    }, 600);
  }, [canDrop, gameOver, mouseX, nextFruitLevel, spawnFruit]);

  const resetGame = useCallback(() => {
    if (!engineRef.current) return;
    Matter.World.clear(engineRef.current.world, false);

    const ground = Matter.Bodies.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT + 25, WORLD_WIDTH, 50, { isStatic: true });
    const leftWall = Matter.Bodies.rectangle(-25, WORLD_HEIGHT / 2, 50, WORLD_HEIGHT, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle(WORLD_WIDTH + 25, WORLD_HEIGHT / 2, 50, WORLD_HEIGHT, { isStatic: true });
    Matter.World.add(engineRef.current.world, [ground, leftWall, rightWall]);

    setScore(0);
    setGameOver(false);
    setNextFruitLevel(Math.floor(Math.random() * 5));
    setCanDrop(true);
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;

    const engine = Matter.Engine.create();
    engineRef.current = engine;

    const render = Matter.Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: WORLD_WIDTH,
        height: WORLD_HEIGHT,
        wireframes: false,
        background: 'transparent',
      },
    });
    renderRef.current = render;

    const runner = Matter.Runner.create();
    runnerRef.current = runner;

    const ground = Matter.Bodies.rectangle(WORLD_WIDTH / 2, WORLD_HEIGHT + 25, WORLD_WIDTH, 50, { isStatic: true });
    const leftWall = Matter.Bodies.rectangle(-25, WORLD_HEIGHT / 2, 50, WORLD_HEIGHT, { isStatic: true });
    const rightWall = Matter.Bodies.rectangle(WORLD_WIDTH + 25, WORLD_HEIGHT / 2, 50, WORLD_HEIGHT, { isStatic: true });

    Matter.World.add(engine.world, [ground, leftWall, rightWall]);

    Matter.Events.on(render, 'afterRender', () => {
      const ctx = render.context;
      const bodies = Matter.Composite.allBodies(engine.world);

      bodies.forEach(body => {
        if (body.label.startsWith('fruit_')) {
          const level = (body as FruitBody).plugin.level;
          const fruitType = FRUIT_TYPES[level];
          const { x, y } = body.position;
          const radius = fruitType.radius;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(body.angle);

          // 2.3D Shadow
          ctx.beginPath();
          ctx.arc(2, 4, radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,0,0,0.2)';
          ctx.fill();

          // Main Body
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fillStyle = fruitType.color;
          ctx.fill();

          // Emoji
          ctx.font = `${radius * 1.4}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(fruitType.emoji, 0, 2);

          // Highlight (Gloss) - subtle since we have emoji
          ctx.beginPath();
          ctx.arc(-radius * 0.3, -radius * 0.3, radius * 0.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fill();

          // Shading (Bottom)
          const gradient = ctx.createRadialGradient(0, 0, radius * 0.8, 0, 0, radius);
          gradient.addColorStop(0, 'rgba(0,0,0,0)');
          gradient.addColorStop(1, 'rgba(0,0,0,0.15)');
          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();

          ctx.restore();
        }
      });
    });

    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach(pair => {
        const { bodyA, bodyB } = pair;
        if (bodyA.label.startsWith('fruit_') && bodyA.label === bodyB.label) {
          const level = (bodyA as FruitBody).plugin.level;
          if (level < FRUIT_TYPES.length - 1) {
            const midX = (bodyA.position.x + bodyB.position.x) / 2;
            const midY = (bodyA.position.y + bodyB.position.y) / 2;

            Matter.World.remove(engine.world, [bodyA, bodyB]);

            spawnFruit(midX, midY, level + 1);
            setScore(prev => {
                const next = prev + FRUIT_TYPES[level + 1].score;
                setHighScore(current => {
                    if (next > current) {
                        localStorage.setItem('fruitMerge_highScore', next.toString());
                        return next;
                    }
                    return current;
                });
                return next;
            });
          }
        }
      });
    });

    Matter.Events.on(engine, 'afterUpdate', () => {
        const bodies = Matter.Composite.allBodies(engine.world);
        let isOverflowing = false;

        bodies.forEach(body => {
            if (body.label.startsWith('fruit_') && body.position.y < 100 && body.velocity.y > -0.1) {
                if (body.position.y > SPAWN_Y + 20) {
                    isOverflowing = true;
                }
            }
        });

        if (isOverflowing) {
            if (!gameOverTimeoutRef.current) {
                gameOverTimeoutRef.current = window.setTimeout(() => {
                    setGameOver(true);
                }, 2000);
            }
        } else {
            if (gameOverTimeoutRef.current) {
                window.clearTimeout(gameOverTimeoutRef.current);
                gameOverTimeoutRef.current = null;
            }
        }
    });

    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);

    return () => {
      Matter.Runner.stop(runner);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
      if (gameOverTimeoutRef.current) window.clearTimeout(gameOverTimeoutRef.current);
    };
  }, [spawnFruit]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameOver) return;
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return;

    let x;
    if ('touches' in e) {
        if (e.touches.length === 0) return;
        x = e.touches[0].clientX - rect.left;
    } else {
        x = (e as React.MouseEvent).clientX - rect.left;
    }

    const radius = FRUIT_TYPES[nextFruitLevel].radius;
    const clampedX = Math.max(radius, Math.min(WORLD_WIDTH - radius, x));
    setMouseX(clampedX);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#e2e8f0] p-4 font-sans select-none overflow-hidden text-slate-900">
       {/* Header */}
       <div className="w-full max-w-[400px] flex justify-between items-center mb-4">
        <button onClick={onBack} className="p-2 bg-white rounded-xl shadow-lg border-b-4 border-slate-200 text-slate-600 hover:bg-slate-50 active:translate-y-1 active:border-b-0 transition-all">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <motion.div
            key={score}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="bg-white px-6 py-2 rounded-2xl shadow-lg border-b-4 border-slate-200"
        >
          <span className="text-3xl font-black">{score}</span>
        </motion.div>
        <div className="flex gap-2">
            <div className="bg-white px-4 py-2 rounded-2xl shadow-lg border-b-4 border-slate-200 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-black text-slate-600">{highScore}</span>
            </div>
            <button
                onClick={onToggleSound}
                className="p-2 bg-white rounded-xl shadow-lg border-b-4 border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:translate-y-1 active:border-b-0"
            >
                {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>
        </div>
      </div>

      {/* Game Container */}
      <div
        className="relative bg-slate-50 rounded-[40px] overflow-hidden shadow-2xl border-b-8 border-slate-300 cursor-crosshair touch-none"
        style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onClick={handleDrop}
        onTouchEnd={(e) => {
            e.preventDefault();
            handleDrop();
        }}
      >
        <div ref={sceneRef} className="absolute inset-0 z-10" />

        {/* Drop Line / Guide */}
        <div className="absolute top-[100px] left-0 right-0 h-0.5 bg-red-400/30 dashed pointer-events-none z-0"
             style={{ borderTop: '2px dashed rgba(248, 113, 113, 0.4)' }} />

        {/* Pending Fruit */}
        {canDrop && !gameOver && (
            <div
                className="absolute pointer-events-none z-20 transition-all duration-75 flex items-center justify-center text-center"
                style={{
                    left: mouseX,
                    top: SPAWN_Y,
                    transform: 'translate(-50%, -50%)',
                    width: FRUIT_TYPES[nextFruitLevel].radius * 2,
                    height: FRUIT_TYPES[nextFruitLevel].radius * 2,
                    backgroundColor: FRUIT_TYPES[nextFruitLevel].color,
                    borderRadius: '50%',
                    boxShadow: 'inset 0 3px 0 0 rgba(255,255,255,0.5), inset 0 -5px 0 0 rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.1)',
                    fontSize: `${FRUIT_TYPES[nextFruitLevel].radius * 1.4}px`
                }}
            >
                {FRUIT_TYPES[nextFruitLevel].emoji}
            </div>
        )}

        {/* Game Over Overlay */}
        <AnimatePresence>
            {gameOver && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center"
                >
                    <h2 className="text-5xl font-black text-white mb-4 leading-tight">BOX<br/>FULL!</h2>
                    <p className="text-white/80 font-bold mb-8">Final Score: {score}</p>
                    <button
                        onClick={resetGame}
                        className="w-full bg-blue-600 text-white text-2xl font-black py-5 rounded-3xl shadow-[0_8px_0_0_#1e40af] hover:bg-blue-700 active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
                    >
                        <RotateCcw className="w-8 h-8" />
                        RETRY
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* Progression Hint */}
      <div className="w-full max-w-[400px] mt-4 mb-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-3 rounded-2xl whitespace-nowrap min-w-max border border-white/50 shadow-sm">
              {FRUIT_TYPES.map((fruit, i) => (
                  <React.Fragment key={fruit.level}>
                    <div className="flex flex-col items-center">
                        <div className="text-xl">{fruit.emoji}</div>
                        <div className="text-[8px] font-black text-slate-400">{fruit.radius}</div>
                    </div>
                    {i < FRUIT_TYPES.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                    )}
                  </React.Fragment>
              ))}
          </div>
      </div>

      {/* Footer / Next Piece */}
      <div className="flex items-center gap-4">
        <div className="bg-white p-4 rounded-3xl shadow-xl border-b-4 border-slate-100 flex items-center gap-4 min-w-[160px]">
          <div className="flex flex-col">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Next</p>
            <p className="font-bold text-slate-700">{FRUIT_TYPES[nextFruitLevel].name}</p>
          </div>
          <div
            className="w-10 h-10 rounded-full shadow-inner relative flex items-center justify-center text-xl"
            style={{
                backgroundColor: FRUIT_TYPES[nextFruitLevel].color,
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
              {FRUIT_TYPES[nextFruitLevel].emoji}
          </div>
        </div>

        <button
            onClick={resetGame}
            className="p-4 bg-white rounded-3xl shadow-xl border-b-4 border-slate-100 text-slate-600 hover:bg-slate-50 active:translate-y-1 active:border-b-0 transition-all"
        >
            <RotateCcw className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
