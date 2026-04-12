import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Activity, CheckCircle, RefreshCw } from 'lucide-react';

export default function JapaCounter() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);
  const [malas, setMalas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(true);

  // Load from local storage on mount to prevent loss
  useEffect(() => {
    try {
      const savedCount = localStorage.getItem('japa_current_count') || '0';
      const savedMalas = localStorage.getItem('japa_today_malas') || '0';
      setCount(parseInt(savedCount, 10));
      setMalas(parseInt(savedMalas, 10));
    } catch (e) {
      console.error('Error loading japa state', e);
    }
  }, []);

  const handleTap = () => {
    let nextCount = count + 1;
    let nextMalas = malas;

    if (nextCount >= 108) {
      nextCount = 0;
      nextMalas += 1;
      // Trigger a light haptic feedback if mobile
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate([50, 100, 50]);
      }
    } else {
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(20);
      }
    }

    setCount(nextCount);
    setMalas(nextMalas);
    setSynced(false);

    localStorage.setItem('japa_current_count', nextCount.toString());
    localStorage.setItem('japa_today_malas', nextMalas.toString());
  };

  const syncWithServer = async () => {
    if (!user || synced) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/profile/japa', {
        beads: count,
        malas: malas
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSynced(true);
    } catch (err) {
      console.error('Failed to sync japa count', err);
    } finally {
      setLoading(false);
    }
  };

  const resetCounter = () => {
    if (window.confirm('Are you sure you want to reset your current bead progress?')) {
      setCount(0);
      localStorage.setItem('japa_current_count', '0');
    }
  };

  return (
    <div className="bg-glass-gradient backdrop-blur-md rounded-3xl p-6 border border-devotion-gold/20 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-devotion-gold to-transparent opacity-50"></div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-devotion-gold" />
            Japa Counter
          </h3>
          <p className="text-xs text-gray-400 mt-1">Track your daily chanting</p>
        </div>
        
        <button 
          onClick={syncWithServer} 
          disabled={loading || synced}
          className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all outline-none focus:outline-none ${synced ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-devotion-gold/10 text-devotion-gold border border-devotion-gold/30 hover:bg-devotion-gold/20'}`}
        >
          {loading ? (
            <Activity className="w-3 h-3 animate-spin" />
          ) : synced ? (
            <CheckCircle className="w-3 h-3" />
          ) : (
             <span className="w-2 h-2 rounded-full bg-devotion-gold animate-pulse"></span>
          )}
          {synced ? 'Synced' : 'Save'}
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-4">
        {/* The interactive tap zone */}
        <button 
          onClick={handleTap}
          className="relative w-40 h-40 rounded-full border-4 border-devotion-gold/30 bg-[#06101E] shadow-[0_0_40px_rgba(255,215,0,0.15)] flex flex-col items-center justify-center outline-none focus:outline-none hover:scale-105 active:scale-95 transition-transform"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.1),transparent_70%)] rounded-full"></div>
          <span className="text-5xl font-black text-white tracking-tighter mb-1 relative z-10">{count}</span>
          <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold relative z-10">/ 108</span>
          
          {/* Circular progress visual */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle 
              cx="76" cy="76" r="72" 
              fill="transparent" 
              stroke="rgba(255,255,255,0.05)" 
              strokeWidth="4" 
            />
            <circle 
              cx="76" cy="76" r="72" 
              fill="transparent" 
              stroke="#f7d77d" 
              strokeWidth="4" 
              strokeDasharray={`${(count / 108) * 452} 452`} 
              className="transition-all duration-300 ease-out" 
            />
          </svg>
        </button>

        <div className="mt-8 flex w-full justify-between items-center text-center px-4 bg-white/5 py-3 rounded-2xl border border-white/10">
           <div>
             <p className="text-2xl font-bold text-white">{malas}</p>
             <p className="text-[9px] uppercase tracking-widest text-devotion-gold font-black">Malas Completed</p>
           </div>
           
           <button onClick={resetCounter} className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors tooltip-trigger relative group">
             <RefreshCw className="w-4 h-4" />
             <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[9px] font-bold px-2 py-1 rounded text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Reset Beads</span>
           </button>
        </div>
      </div>
    </div>
  );
}
