import { motion } from 'framer-motion';
import Shell from '../components/Shell';

export default function Home() {
  return (
    <Shell>
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-ink via-[#3b2414] to-[#7a4b21] text-sandal p-8 md:p-16 shadow-[0_30px_90px_rgba(31,19,10,0.28)] gold-glow">
        <div className="absolute inset-0 bg-aura opacity-70"></div>
        <div className="relative z-10 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] mb-6 animate-soft-pulse">
            Bhagavad Gita Wisdom
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
            Gita Wisdom
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-lg md:text-xl max-w-2xl text-sandal/90">
            A spiritual learning platform for mentors, students, kids, and families with daily wisdom, dynamic chapters, animated guidance, and secure admin tools.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm border border-white/15">Mentor</span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm border border-white/15">Kids</span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm border border-white/15">Daily Sloka</span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm border border-white/15">Chapters</span>
          </motion.div>
        </div>
      </section>
    </Shell>
  );
}
