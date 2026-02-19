import React from 'react';
import { LayoutGrid, Cherry, Hash, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomeProps {
  onSelectGame: (game: 'block-puzzle' | 'fruit-merge' | 'merge-2048' | 'emoji-match') => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectGame }) => {
  return (
    <div className="min-h-screen bg-[#e2e8f0] flex flex-col items-center justify-center p-6 font-sans text-slate-900 overflow-y-auto no-scrollbar py-20">
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
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectGame('block-puzzle')}
          className="bg-white p-8 rounded-[40px] shadow-xl border-b-[10px] border-slate-200 text-left flex flex-col items-start transition-all group relative overflow-hidden"
        >
          <div className="bg-blue-600 text-white p-4 rounded-[22px] mb-6 shadow-lg shadow-blue-200 relative">
            <LayoutGrid className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Block Puzzle</h2>
          <p className="text-slate-500 font-bold leading-tight mb-6">Clear lines and master the grid in 2.3D style.</p>
          <div className="mt-auto bg-slate-900 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest group-hover:bg-blue-600 transition-colors">
            Play Now
          </div>
        </motion.button>

        {/* Fruit Merge Card */}
        <motion.button
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectGame('fruit-merge')}
          className="bg-white p-8 rounded-[40px] shadow-xl border-b-[10px] border-slate-200 text-left flex flex-col items-start transition-all group relative overflow-hidden"
        >
          <div className="bg-red-500 text-white p-4 rounded-[22px] mb-6 shadow-lg shadow-red-200 relative">
            <Cherry className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Fruit Merge</h2>
          <p className="text-slate-500 font-bold leading-tight mb-6">Drop, merge, and grow the ultimate watermelon.</p>
          <div className="mt-auto bg-slate-900 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest group-hover:bg-red-500 transition-colors">
            Play Now
          </div>
        </motion.button>

        {/* Merge 2048 Card */}
        <motion.button
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectGame('merge-2048')}
          className="bg-white p-8 rounded-[40px] shadow-xl border-b-[10px] border-slate-200 text-left flex flex-col items-start transition-all group relative overflow-hidden"
        >
          <div className="bg-orange-500 text-white p-4 rounded-[22px] mb-6 shadow-lg shadow-orange-200 relative">
            <Hash className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Merge 2048</h2>
          <p className="text-slate-500 font-bold leading-tight mb-6">Slide and merge numbered blocks to reach 2048.</p>
          <div className="mt-auto bg-slate-900 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest group-hover:bg-orange-500 transition-colors">
            Play Now
          </div>
        </motion.button>

        {/* Emoji Match Card */}
        <motion.button
          whileHover={{ scale: 1.02, y: -5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelectGame('emoji-match')}
          className="bg-white p-8 rounded-[40px] shadow-xl border-b-[10px] border-slate-200 text-left flex flex-col items-start transition-all group relative overflow-hidden"
        >
          <div className="bg-purple-600 text-white p-4 rounded-[22px] mb-6 shadow-lg shadow-purple-200 relative">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 mb-2">Emoji Match</h2>
          <p className="text-slate-500 font-bold leading-tight mb-6">Test your memory and find all matching pairs.</p>
          <div className="mt-auto bg-slate-900 text-white px-6 py-2 rounded-xl font-black text-xs uppercase tracking-widest group-hover:bg-purple-600 transition-colors">
            Play Now
          </div>
        </motion.button>
      </div>

      <div className="mt-20 flex flex-col items-center gap-2">
        <div className="flex gap-4">
            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
            <div className="w-2 h-2 rounded-full bg-slate-300"></div>
        </div>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">Built for Mobile & Web</p>
      </div>
    </div>
  );
};
