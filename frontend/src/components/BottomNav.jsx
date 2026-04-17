import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Film, BookOpen, User } from 'lucide-react';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/home', icon: Home },
    { name: 'Reels', path: '/reels', icon: Film },
    { name: 'Slokas', path: '/daily-sloka', icon: BookOpen },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-black/95 backdrop-blur-md border-t border-white/10 pb-safe z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive ? 'text-[#D39A4A]' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-[10px] font-medium tracking-wide">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
