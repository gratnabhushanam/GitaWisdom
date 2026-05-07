import React from 'react';
import { useLocation } from 'react-router-dom';

export default function LayoutWrapper({ children }) {
  const location = useLocation();
  const isFullScreenRoute = location.pathname.startsWith('/reels');
  
  // Reels specifically needs its own scroll-snap controller and doesn't want the global padding-bottom block
  // since it has its own specialized padding implemented already.
  const paddingBottomStyle = isFullScreenRoute
      ? 'env(safe-area-inset-bottom)'
      : 'calc(80px + env(safe-area-inset-bottom))';

  return (
    <div 
      className="layout-wrapper w-full relative z-0 flex flex-col flex-1"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: paddingBottomStyle,
        scrollPaddingBottom: '100px',
      }}
    >
      <div className="min-h-full pb-8">
        {children}
      </div>
    </div>
  );
}
