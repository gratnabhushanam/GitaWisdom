import { useState } from 'react';
import { motion } from 'framer-motion';
import Shell from '../components/Shell';
import { apiGet } from '../lib/api';
import { Wind, AlertTriangle, Target, MessageSquarePlus, Zap, BookOpen } from 'lucide-react';

const categories = [
  { id: 'stress', label: 'Stress', icon: Wind, color: 'from-blue-500 to-cyan-400' },
  { id: 'fear', label: 'Fear', icon: AlertTriangle, color: 'from-orange-500 to-red-400' },
  { id: 'anger', label: 'Anger', icon: Target, color: 'from-red-600 to-rose-400' },
  { id: 'confusion', label: 'Confusion', icon: MessageSquarePlus, color: 'from-purple-500 to-indigo-400' },
  { id: 'motivation', label: 'Motivation', icon: Zap, color: 'from-[#FFD700] to-[#FF9F1C]' },
];

export default function MentorPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const onPick = async (type) => {
    setLoading(true);
    try {
      const payload = await apiGet(`/api/gita-mentor?type=${type}`);
      setData(payload);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <section className="text-center mb-10 md:mb-14">
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-devotion-gold/40 bg-devotion-gold/5 text-devotion-gold text-[11px] font-black tracking-[0.35em] uppercase shadow-[0_0_30px_rgba(255,215,0,0.1)] mb-6">
          Gita Mentor
        </div>
        <h2 className="text-4xl md:text-6xl font-serif font-black text-white uppercase tracking-tighter mb-3">Seek Guidance</h2>
        <p className="text-gray-300 max-w-2xl mx-auto text-lg font-serif italic">Pick a life problem and receive a Bhagavad Gita verse, meaning, Telugu explanation, and practical guidance.</p>
      </section>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {categories.map((c) => {
          const Icon = c.icon;
          return (
          <button key={c.id} onClick={() => onPick(c.id)} className={`group rounded-[1.75rem] border border-white/10 bg-gradient-to-br ${c.color} p-[1px] transition-transform hover:-translate-y-1` }>
            <div className="rounded-[1.7rem] bg-[#0B1F3A]/90 backdrop-blur-xl p-5 min-h-[132px] flex flex-col items-center justify-center text-white">
              <Icon className="w-8 h-8 text-devotion-gold mb-3 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-black uppercase tracking-widest">{c.label}</span>
            </div>
          </button>
          );
        })}
      </div>

      {loading && <p className="text-devotion-gold font-bold">Loading guidance...</p>}

      {data && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="spiritual-panel p-6 md:p-8 space-y-4">
          <h3 className="text-2xl md:text-3xl font-serif font-black text-devotion-gold uppercase tracking-tighter">{data.type}</h3>
          <div className="space-y-4 text-gray-100 leading-relaxed">
            <p><span className="text-devotion-gold font-black uppercase text-xs tracking-[0.2em] block mb-2">Sloka</span>{data.slokaText}</p>
            <p><span className="text-devotion-gold font-black uppercase text-xs tracking-[0.2em] block mb-2">Meaning</span>{data.meaningSimple}</p>
            <p><span className="text-devotion-gold font-black uppercase text-xs tracking-[0.2em] block mb-2">Telugu</span>{data.teluguExplanation}</p>
            <p><span className="text-devotion-gold font-black uppercase text-xs tracking-[0.2em] block mb-2">Guidance</span>{data.realLifeGuidance}</p>
          </div>
        </motion.div>
      )}
    </Shell>
  );
}
