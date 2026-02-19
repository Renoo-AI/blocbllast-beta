import React from 'react';
import { LayoutGrid, Cherry } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomeProps {
  onSelectGame: (game: 'block-puzzle' | 'fruit-merge') => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectGame }) => {
  return (
    <div className="min-h-screen bg-[#e2e8f0] flex flex-col items-center justify-center p-6 font-sans text-slate-900 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center mb-16 relative"
      >
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-red-400/10 rounded-full blur-3xl" />

        <h1 className="text-7xl font-black text-slate-800 mb-3 tracking-tighter drop-shadow-sm">
          GAME<span className="text-blue-600">BOX</span>
        </h1>
        <div className="flex items-center justify-center gap-2">
            <span className="h-px w-8 bg-slate-300"></span>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">Premium Collection</p>
            <span className="h-px w-8 bg-slate-300"></span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl relative z-10">
        {/* Block Puzzle Card */}
        <motion.button
          whileHover={{ scale: 1.05, y: -8 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectGame('block-puzzle')}
          className="bg-white p-10 rounded-[48px] shadow-2xl border-b-[12px] border-slate-200 text-left flex flex-col items-start transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 group-hover:bg-blue-100 transition-colors" />

          <div className="bg-blue-600 text-white p-5 rounded-[28px] mb-8 shadow-lg shadow-blue-200 relative">
            <LayoutGrid className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-3">Block<br/>Puzzle</h2>
          <p className="text-slate-500 font-bold leading-relaxed mb-8">Clear lines and master the grid in 2.3D style.</p>

          <div className="mt-auto bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-colors">
            Play Game
          </div>
        </motion.button>

        {/* Fruit Merge Card */}
        <motion.button
          whileHover={{ scale: 1.05, y: -8 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectGame('fruit-merge')}
          className="bg-white p-10 rounded-[48px] shadow-2xl border-b-[12px] border-slate-200 text-left flex flex-col items-start transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 group-hover:bg-red-100 transition-colors" />

          <div className="bg-red-500 text-white p-5 rounded-[28px] mb-8 shadow-lg shadow-red-200 relative">
            <Cherry className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-black text-slate-800 mb-3">Fruit<br/>Merge</h2>
          <p className="text-slate-500 font-bold leading-relaxed mb-8">Drop, merge, and grow the ultimate watermelon.</p>

          <div className="mt-auto bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-500 transition-colors">
            Play Game
          </div>
        </motion.button>
      </div>

      <div className="mt-20 flex flex-col items-center gap-2">
        <div className="flex gap-4">
            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
        </div>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Built with React & Matter.js</p>
      </div>
    </div>
  );
};
