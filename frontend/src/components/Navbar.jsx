import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Book, Menu, X, BrainCircuit, User, Star, Zap, Heart, Search, Film, Shield, Users, Bell, Download, CheckCheck, Info, Megaphone, Gift, Sparkles, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useNotifications } from '../hooks/useNotifications';

const NOTIF_ICON_MAP = {
  system:  { icon: Info,      color: 'text-blue-400',   bg: 'bg-blue-500/10',   border: 'border-blue-500/30' },
  promo:   { icon: Gift,      color: 'text-devotion-gold', bg: 'bg-devotion-gold/10', border: 'border-devotion-gold/30' },
  content: { icon: Sparkles,  color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  default: { icon: Megaphone, color: 'text-gray-400',   bg: 'bg-white/5',       border: 'border-white/10' },
};

function NotificationItem({ n }) {
  const isUnread = !n.isRead && !n.read;
  const { icon: Icon, color, bg, border } = NOTIF_ICON_MAP[n.type] || NOTIF_ICON_MAP.default;
  const timeAgo = n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '';

  return (
    <div className={`flex items-start gap-4 p-5 rounded-[1.8rem] mb-3 border transition-all duration-300 group cursor-pointer ${isUnread ? `${bg} ${border} shadow-xl scale-[1.01]` : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'}`}>
      <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 ${isUnread ? `${bg} ${border} shadow-inner` : 'bg-white/5 border-white/10'}`}>
        <Icon className={`w-6 h-6 ${isUnread ? color : 'text-gray-500'}`} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex justify-between items-start mb-1.5">
          <p className={`text-[13px] font-black leading-tight tracking-tight uppercase ${isUnread ? 'text-white' : 'text-gray-400'}`}>
            {n.title || 'Divine Update'}
          </p>
          {timeAgo && <p className="text-[9px] text-gray-700 font-black uppercase tracking-widest whitespace-nowrap ml-2">{timeAgo}</p>}
        </div>
        <p className={`text-xs leading-relaxed font-medium ${isUnread ? 'text-gray-200' : 'text-gray-500'}`}>
          {n.body || n.message || n.text}
        </p>
        <div className="flex items-center justify-end mt-3">
           {isUnread && <div className="w-2 h-2 bg-devotion-gold rounded-full shadow-[0_0_12px_rgba(255,215,0,1)] animate-pulse" />}
        </div>
      </div>
    </div>
  );
}

function DesktopNotificationPanel({ notifications, unreadCount, handleMarkAsRead }) {
  return (
    <div className="absolute right-0 top-full mt-4 w-96 bg-[#0B121F]/95 backdrop-blur-3xl border border-devotion-gold/30 rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.7)] overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200">
      <div className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-[#141C2B]">
        <div className="flex items-center gap-3">
          <Bell className="w-4 h-4 text-devotion-gold" />
          <span className="text-[10px] font-black text-devotion-gold uppercase tracking-[0.3em]">Notifications</span>
          {unreadCount > 0 && (
            <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAsRead} className="flex items-center gap-1.5 text-[9px] text-white/40 hover:text-devotion-gold uppercase tracking-widest font-black transition-all active:scale-95">
            <CheckCheck className="w-3.5 h-3.5" /> MARK ALL READ
          </button>
        )}
      </div>
      <div className="max-h-[420px] overflow-y-auto p-4 scrollbar-hide">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 mx-auto mb-4 text-white/5" />
            <p className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">Spiritual silence</p>
            <p className="text-[10px] text-white/10 mt-1">No new alerts found</p>
          </div>
        ) : (
          notifications.map(n => <NotificationItem key={n._id} n={n} />)
        )}
      </div>
      {notifications.length > 0 && (
        <div className="px-6 py-3 border-t border-white/5 bg-[#141C2B]/50 text-center">
           <button className="text-[9px] font-black text-devotion-gold/60 hover:text-devotion-gold uppercase tracking-[0.3em] transition-colors">
              SEE ALL HISTORY
           </button>
        </div>
      )}
    </div>
  );
}

function MobileNotificationSheet({ notifications, unreadCount, handleMarkAsRead, onClose }) {
  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col justify-end" onClick={handleBackdrop}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" />
      <div className="relative w-full max-h-[85vh] bg-[#070F1D] rounded-t-[2.5rem] border-t border-devotion-gold/30 shadow-[0_-20px_100px_rgba(0,0,0,0.9)] animate-in slide-in-from-bottom duration-500 flex flex-col overflow-hidden pb-safe">
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1.5 bg-white/10 rounded-full" />
        </div>
        <div className="px-6 py-4 flex justify-between items-center border-b border-white/5 bg-[#0D1424]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-devotion-gold/10 border border-devotion-gold/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-devotion-gold" />
            </div>
            <div>
              <p className="text-sm font-black text-white uppercase tracking-[0.2em]">Notifications</p>
              <p className="text-[10px] text-devotion-gold/60 font-black uppercase tracking-widest mt-0.5">
                {unreadCount > 0 ? `${unreadCount} DIVINE ALERTS` : 'PEACEFUL HEART'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button onClick={handleMarkAsRead} className="p-2.5 bg-devotion-gold/10 border border-devotion-gold/30 text-devotion-gold rounded-xl active:scale-90 transition-all">
                <CheckCheck className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="p-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl active:scale-90 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 pb-12 scrollbar-hide">
          {notifications.length === 0 ? (
            <div className="text-center py-24 px-8">
              <div className="w-24 h-24 rounded-[2rem] bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-8 animate-pulse">
                <Bell className="w-10 h-10 text-white/10" />
              </div>
              <p className="text-lg font-black text-white/40 uppercase tracking-[0.2em] mb-3">All caught up!</p>
              <p className="text-sm text-white/20 font-serif italic">Your spiritual path is clear of alerts.</p>
            </div>
          ) : (
            notifications.map(n => <NotificationItem key={n._id} n={n} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { isInstallable, showInstallModal, setShowInstallModal, handleInstallClick } = useInstallPrompt();
  const { notifications, showNotifications, setShowNotifications, unreadCount, handleMarkAsRead } = useNotifications(user);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'G';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 1);
  };

  const navLinks = [
    { name: 'Home', path: '/home', icon: <BookOpen className="w-4 h-4 mr-2" /> },
    { name: 'Mentor', path: '/mentor', icon: <Heart className="w-4 h-4 mr-2" /> },
    { name: 'Reels', path: '/reels', icon: <Zap className="w-4 h-4 mr-2" /> },
    { name: 'Kids', path: '/kids', icon: <Star className="w-4 h-4 mr-2" /> },
    { name: 'Movies', path: '/movies', icon: <Film className="w-4 h-4 mr-2" /> },
    { name: 'Quizzes', path: '/quizzes', icon: <BrainCircuit className="w-4 h-4 mr-2" /> },
    { name: 'Daily Sloka', path: '/daily-sloka', icon: <Star className="w-4 h-4 mr-2" /> },
    { name: 'Chapters', path: '/chapters', icon: <Book className="w-4 h-4 mr-2" /> },
    ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin', icon: <Shield className="w-4 h-4 mr-2" /> }] : []),
  ];

  const isActive = (path) => location.pathname === path;
  const toggleNotifications = () => { setIsOpen(false); setShowNotifications(prev => !prev); };

  return (
    <nav className="sticky top-0 w-full z-50 bg-[#06101E]/95 backdrop-blur-2xl border-b border-white/5 shadow-2xl tv:h-24 transition-all duration-500">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 pl-safe pr-safe">
        <div className="flex items-center justify-between h-16 tv:h-24">
          <Link to="/home" className="group flex items-center gap-3 hover:opacity-80 transition-all">
            <div className="w-9 h-9 tv:w-14 tv:h-14 rounded-xl overflow-hidden flex items-center justify-center bg-devotion-gold/10 border border-devotion-gold/30 shadow-[0_0_20px_rgba(255,215,0,0.1)] group-hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] transition-all">
              <img src="/logo-om-v2.png" alt="Logo" className="w-full h-full object-cover scale-90 group-hover:scale-105 transition-transform" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg tv:text-2xl font-black bg-gradient-to-r from-devotion-gold to-white bg-clip-text text-transparent tracking-tighter uppercase leading-none">GitaWisdom</span>
              <span className="text-[8px] tv:text-xs font-black text-devotion-gold uppercase tracking-[0.4em] opacity-60">Divine Path</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                className={`flex items-center px-3 xl:px-4 py-2 rounded-xl font-black text-[10px] tv:text-sm uppercase tracking-[0.18em] transition-all duration-300 ${isActive(link.path) ? 'bg-devotion-gold/15 text-devotion-gold border border-devotion-gold/30 shadow-[0_0_20px_rgba(255,215,0,0.15)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            
            <div className="h-6 w-px bg-white/10 mx-2 xl:mx-4"></div>
            
            <button onClick={handleInstallClick} className="group relative px-5 py-2 bg-gradient-to-br from-devotion-gold to-[#FFB800] text-[#06101E] text-[10px] tv:text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] transition-all flex items-center gap-2 overflow-hidden active:scale-95">
               <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" /> GET APP
            </button>
          
            {user && (
              <div className="relative ml-2">
                <button onClick={toggleNotifications} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${showNotifications ? 'bg-devotion-gold/20 text-devotion-gold' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-[#06101E] animate-pulse shadow-[0_0_8px_rgba(220,38,38,0.5)]"></span>}
                </button>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-50" onClick={() => setShowNotifications(false)} />
                    <DesktopNotificationPanel notifications={notifications} unreadCount={unreadCount} handleMarkAsRead={handleMarkAsRead} />
                  </>
                )}
              </div>
            )}
            
            {user ? (
              <Link to="/profile" className="flex items-center gap-3 pl-4 border-l border-white/10 ml-2 group">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 group-hover:border-devotion-gold/50 transition-colors">
                  {user.profilePicture ? <img src={user.profilePicture} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-devotion-gold/10 flex items-center justify-center text-devotion-gold font-black text-xs uppercase">{getInitials(user.name)}</div>}
                </div>
                <div className="hidden xl:flex flex-col">
                  <span className="text-[10px] font-black text-white group-hover:text-devotion-gold transition-colors uppercase tracking-widest truncate max-w-[100px]">{user.name}</span>
                  <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Devotee</span>
                </div>
              </Link>
            ) : (
              <Link to="/login" className="px-6 py-2 border border-devotion-gold/30 text-devotion-gold hover:bg-devotion-gold hover:text-devotion-darkBlue rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ml-2 shadow-[0_0_20px_rgba(255,215,0,0.05)]">LOGIN</Link>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-3">
            {user && (
              <button onClick={toggleNotifications} className="relative w-10 h-10 flex items-center justify-center text-devotion-gold bg-devotion-gold/10 rounded-xl border border-devotion-gold/20 active:scale-90 transition-all">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-[#06101E] animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.6)]" />}
              </button>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="w-10 h-10 flex items-center justify-center text-devotion-gold bg-white/5 rounded-xl border border-white/10 active:scale-90 transition-all">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-[#08111F] border-b border-white/5 absolute w-full shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="px-6 pt-4 pb-8 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-3 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all ${isActive(link.path) ? 'bg-devotion-gold/10 text-devotion-gold border border-devotion-gold/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                {link.icon} {link.name}
              </Link>
            ))}
            <button onClick={() => { handleInstallClick(); setIsOpen(false); }} className="w-full mt-4 py-4 bg-gradient-to-r from-devotion-gold to-[#FFB800] text-[#06101E] rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-3"><Download className="w-5 h-5" /> INSTALL DIVINE APP</button>
            {user ? (
              <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-4 mt-6 p-4 bg-white/5 rounded-2xl border border-white/10 group">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-devotion-gold/30">
                  {user.profilePicture ? <img src={user.profilePicture} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-devotion-gold/10 flex items-center justify-center text-devotion-gold font-black text-xs">{getInitials(user.name)}</div>}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="text-xs font-black text-white uppercase tracking-widest truncate">{user.name}</span>
                  <span className="text-[9px] font-bold text-devotion-gold uppercase tracking-widest">Open Profile</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </Link>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="w-full mt-4 py-4 border-2 border-devotion-gold/30 text-devotion-gold rounded-2xl font-black text-[11px] uppercase tracking-widest text-center">LOGIN / JOIN COMMUNITY</Link>
            )}
          </div>
        </div>
      )}

      {showNotifications && isMobile && (
        <MobileNotificationSheet notifications={notifications} unreadCount={unreadCount} handleMarkAsRead={handleMarkAsRead} onClose={() => setShowNotifications(false)} />
      )}

      {showInstallModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-[#0B121F] border border-devotion-gold/30 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] w-full max-w-sm overflow-hidden relative animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowInstallModal(false)} className="absolute top-6 right-6 text-white/40 hover:text-white transition-all active:scale-90"><X className="w-6 h-6" /></button>
            <div className="p-10 text-center">
              <div className="w-24 h-24 mx-auto bg-devotion-gold/10 rounded-[2rem] border border-devotion-gold/30 flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-br from-devotion-gold/20 to-transparent animate-pulse" />
                 <img src="/logo-om-v2.png" alt="Logo" className="w-14 h-14 object-contain relative z-10 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter font-serif">Divine Installation</h3>
              <p className="text-[13px] text-gray-400 leading-relaxed mb-8 font-medium italic font-serif">"Carry the Gita Wisdom in your pocket. Fast, secure, and always available offline."</p>
              <div className="space-y-4 mb-8">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left">
                    <p className="text-[10px] font-black text-devotion-gold uppercase tracking-[0.2em] mb-2">Instructions</p>
                    <p className="text-[11px] text-gray-300 font-medium leading-relaxed">
                       Tap <span className="text-white font-bold">Share</span> or <span className="text-white font-bold">Menu (⋮)</span> and select <span className="text-devotion-gold font-bold italic underline">"Add to Home Screen"</span>.
                    </p>
                 </div>
              </div>
              <button onClick={() => setShowInstallModal(false)} className="w-full py-5 bg-gradient-to-r from-devotion-gold to-[#FFB800] text-[#06101E] rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:shadow-[0_0_40px_rgba(255,215,0,0.5)] transition-all active:scale-95">REVEAL WISDOM</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
