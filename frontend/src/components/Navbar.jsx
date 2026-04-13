import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Book, Menu, X, BrainCircuit, User, Star, Zap, Heart, Search, Film, Shield, Users, Bell, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        try {
          const { data } = await axios.get('/api/notifications', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setNotifications(Array.isArray(data) ? data : []);
        } catch (err) {
           console.error('Failed to fetch notifications:', err);
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length || notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async () => {
    try {
      await axios.post('/api/notifications/read-all', {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.map(n => ({...n, isRead: true, read: true})));
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 1);
  };

  const navLinks = [
    { name: 'Home', path: '/home', icon: <BookOpen className="w-4 h-4 mr-1.5" /> },
    { name: 'Gita Mentor', path: '/mentor', icon: <Heart className="w-4 h-4 mr-1.5" /> },
    { name: 'Reels', path: '/reels', icon: <Zap className="w-4 h-4 mr-1.5" /> },
    { name: 'Kids', path: '/kids', icon: <Star className="w-4 h-4 mr-1.5" /> },
    { name: 'Movies', path: '/movies', icon: <Film className="w-4 h-4 mr-1.5" /> },
    { name: 'Satsangs', path: '/satsangs', icon: <Users className="w-4 h-4 mr-1.5" /> },
    { name: 'Search', path: '/search', icon: <Search className="w-4 h-4 mr-1.5" /> },
    { name: 'Chapters', path: '/chapters', icon: <Book className="w-4 h-4 mr-1.5" /> },
      { name: 'Daily Sloka', path: '/daily-sloka', icon: <BrainCircuit className="w-4 h-4 mr-1.5" /> },
    ...(user?.role === 'admin' ? [{ name: 'Admin', path: '/admin', icon: <Shield className="w-4 h-4 mr-1.5" /> }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
  <nav className="fixed w-full z-50 bg-gradient-to-r from-[#04101D] via-[#061428] to-[#04101D]/95 backdrop-blur-xl border-b border-devotion-gold/15 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link to="/home" className="group flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center group-hover:drop-shadow-[0_0_12px_rgba(255,215,0,0.4)] transition-all">
                <img src="/logo.png" alt="Gita Wisdom Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-base font-bold bg-gradient-to-r from-devotion-gold to-[#FFE6A5] bg-clip-text text-transparent tracking-tight">
                GitaWisdom
              </span>
            </Link>
          </div>
          
          <div className="hidden lg:block">
            <div className="ml-8 flex items-center space-x-0.5">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path} 
                  className={`flex items-center px-2.5 py-1.5 rounded-lg font-semibold text-[10px] uppercase tracking-[0.16em] transition-all duration-300 ${isActive(link.path) ? 'bg-devotion-gold/15 text-devotion-gold border border-devotion-gold/30 shadow-[0_0_18px_rgba(255,215,0,0.12)]' : 'text-gray-400 hover:text-devotion-gold hover:bg-devotion-gold/10'}`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              
              <div className="h-5 w-px bg-devotion-gold/20 mx-2"></div>
              
              {isInstallable && (
                <button
                  onClick={handleInstallClick}
                  className="mr-3 px-3 py-1.5 bg-gradient-to-br from-devotion-gold to-[#FFE6A5] text-[#06101E] text-[10px] font-bold uppercase tracking-widest rounded-lg hover:shadow-[0_0_15px_rgba(255,215,0,0.4)] transition-all flex items-center"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Get App
                </button>
              )}
              
              {user && (
                 <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="group flex items-center justify-center w-8 h-8 rounded-lg hover:bg-devotion-gold/10 transition-colors mr-2 relative"
                    >
                       <Bell className="w-4 h-4 text-gray-400 group-hover:text-devotion-gold transition-colors" />
                       {unreadCount > 0 && (
                         <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#06101E] animate-pulse"></span>
                       )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-3 w-80 bg-[#081426] border border-devotion-gold/30 rounded-2xl shadow-2xl overflow-hidden py-2 z-50">
                         <div className="px-4 py-2 flex justify-between items-center border-b border-white/5 mb-2">
                            <span className="text-xs font-bold text-white uppercase tracking-widest">Notifications</span>
                            {unreadCount > 0 && (
                               <button onClick={handleMarkAsRead} className="text-[10px] text-devotion-gold hover:text-white uppercase tracking-[0.1em] font-bold">Mark all read</button>
                            )}
                         </div>
                         <div className="max-h-[300px] overflow-y-auto px-2">
                            {notifications.length === 0 ? (
                               <div className="text-center py-6 text-gray-500">
                                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                  <p className="text-xs font-medium uppercase tracking-[0.1em]">All caught up!</p>
                               </div>
                            ) : (
                               notifications.map((n) => (
                                 <div key={n._id} className={`p-3 rounded-xl mb-1 flex items-start gap-3 transition-colors ${!n.isRead && !n.read ? 'bg-devotion-gold/10 border border-devotion-gold/20' : 'hover:bg-white/5 border border-transparent'}`}>
                                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.isRead && !n.read ? 'bg-devotion-gold' : 'bg-gray-600'}`}></div>
                                    <div className="flex-1 min-w-0">
                                       {n.title && <p className="text-xs font-bold text-white mb-0.5 truncate">{n.title}</p>}
                                       <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{n.message || n.text}</p>
                                    </div>
                                 </div>
                               ))
                            )}
                         </div>
                      </div>
                    )}
                 </div>
              )}
              
              {user ? (
                <Link to="/profile" className="group flex items-center px-2.5 py-1.5 bg-devotion-gold/10 border border-devotion-gold/20 rounded-lg transition-all hover:border-devotion-gold/40 hover:bg-devotion-gold/20">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="" className="w-4 h-4 rounded-full object-cover mr-1.5 border border-devotion-gold/50" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-gradient-to-br from-devotion-gold/30 to-devotion-gold/10 flex items-center justify-center mr-1.5 border border-devotion-gold/50">
                       <span className="text-[9px] font-bold text-devotion-gold">{getInitials(user.name)}</span>
                    </div>
                  )}
                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gray-200">Profile</span>
                </Link>
              ) : (
                <Link to="/login" className="group flex items-center px-2.5 py-1.5 bg-gradient-to-r from-devotion-gold/20 to-[#FFE6A5]/10 border border-devotion-gold/30 rounded-lg transition-all hover:border-devotion-gold/50 hover:from-devotion-gold/30 hover:to-[#FFE6A5]/20">
                  <User className="w-3 h-3 mr-1 text-devotion-gold group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gray-200">Login</span>
                </Link>
              )}
            </div>
          </div>

          <div className="lg:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-devotion-gold hover:text-white transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-gradient-to-b from-[#081426] to-[#04101D] border-b border-devotion-gold/20 absolute w-full shadow-[0_14px_40px_rgba(0,0,0,0.35)]">
          <div className="px-4 pt-3 pb-5 space-y-2 sm:px-3 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg font-semibold text-[11px] uppercase tracking-[0.15em] transition-all ${isActive(link.path) ? 'bg-devotion-gold/15 text-devotion-gold border border-devotion-gold/30' : 'text-gray-400 hover:text-devotion-gold hover:bg-devotion-gold/10'}`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            
            {isInstallable && (
              <button
                onClick={() => {
                  handleInstallClick();
                  setIsOpen(false);
                }}
                className="flex items-center justify-center w-full mt-2 px-3 py-2.5 bg-gradient-to-r from-devotion-gold to-[#FFE6A5] text-[#06101E] rounded-lg font-bold text-[11px] uppercase tracking-widest shadow-md"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Install Gita Wisdom App
              </button>
            )}
            
            {user ? (
              <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-2 text-gray-400 hover:text-devotion-gold transition-colors mt-3 border-t border-devotion-gold/10 pt-3 text-xs">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="" className="w-6 h-6 rounded-full object-cover mr-3 border-2 border-devotion-gold/50" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-devotion-gold/30 to-devotion-gold/10 flex items-center justify-center mr-3 border-2 border-devotion-gold/50">
                     <span className="text-[10px] font-bold text-devotion-gold">{getInitials(user.name)}</span>
                  </div>
                )}
                Profile
              </Link>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center px-3 py-2 text-gray-400 hover:text-devotion-gold transition-colors mt-3 border-t border-devotion-gold/10 pt-3 text-xs">
                <User className="w-4 h-4 mr-2" />
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
