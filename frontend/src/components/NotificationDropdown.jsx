import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, XCircle, X } from 'lucide-react';
import axios from 'axios';

export default function NotificationDropdown({ token }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const dropdownRef = useRef();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    axios.get('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => setNotifications(res.data))
      .catch(() => setError('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, [open, token]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const markAllRead = async () => {
    await axios.post('/api/notifications/read-all', {}, { headers: { Authorization: `Bearer ${token}` } });
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative p-2 rounded-full hover:bg-devotion-gold/10 transition-all active:scale-90"
        onClick={() => setOpen(v => !v)}
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-devotion-gold" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-600 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.5)]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Mobile Overlay Background */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99] md:hidden" onClick={() => setOpen(false)} />
          
          <div className="fixed md:absolute right-0 md:right-0 top-1/2 md:top-auto translate-y-[-50%] md:translate-y-0 left-4 right-4 md:left-auto md:mt-2 w-auto md:w-96 bg-[#0D1424] border border-devotion-gold/30 rounded-3xl md:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] overflow-hidden animate-fade-in-up">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#161F32]">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-devotion-gold" />
                <span className="font-black text-devotion-gold uppercase tracking-[0.2em] text-[10px]">Notifications</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  className="text-[9px] font-black text-white/40 uppercase tracking-widest hover:text-devotion-gold disabled:opacity-30 transition-colors"
                  onClick={markAllRead}
                  disabled={loading || notifications.length === 0}
                >
                  Clear All
                </button>
                <button onClick={() => setOpen(false)} className="md:hidden text-white/60 p-1 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] md:max-h-96 overflow-y-auto divide-y divide-white/5 scrollbar-hide">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-devotion-gold mx-auto mb-4"></div>
                  <p className="text-devotion-gold/60 text-[10px] font-black uppercase tracking-widest">Searching records...</p>
                </div>
              ) : error ? (
                <div className="p-8 text-center text-red-400">
                  <XCircle className="w-10 h-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-12 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-white/5" />
                  <p className="text-white/40 text-sm font-medium italic">No spiritual alerts yet.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`px-6 py-5 flex items-start gap-4 transition-colors hover:bg-white/5 cursor-pointer relative ${n.read ? 'opacity-60' : 'bg-devotion-gold/[0.03]'}`}
                  >
                    {!n.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-devotion-gold shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
                    )}
                    <div className="pt-1">
                      {n.type === 'system' ? (
                        <div className="w-8 h-8 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-devotion-gold/10 flex items-center justify-center border border-devotion-gold/20">
                          <Bell className="w-4 h-4 text-devotion-gold" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-sm mb-0.5 line-clamp-1">{n.title}</div>
                      <div className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-2">{n.body}</div>
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">{new Date(n.createdAt).toLocaleDateString()}</span>
                         {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-devotion-gold animate-pulse shadow-[0_0_8px_rgba(255,215,0,0.8)]" />}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-4 bg-[#161F32] border-t border-white/5 text-center">
                <button className="text-[9px] font-black text-devotion-gold uppercase tracking-[0.3em] hover:opacity-80 transition-opacity">
                   View Full History
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
