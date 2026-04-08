import Link from 'next/link';

export default function Shell({ children }) {
  return (
    <div className="min-h-screen page-bg text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#06101E]/75 backdrop-blur-xl">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 overflow-x-auto">
          <Link href="/" className="spiritual-button bg-devotion-gold text-devotion-darkBlue px-4 py-2 rounded-full shadow-md whitespace-nowrap">Home</Link>
          <Link href="/mentor" className="spiritual-button bg-white/5 border border-white/10 text-white whitespace-nowrap">Mentor</Link>
          <Link href="/kids" className="spiritual-button bg-white/5 border border-white/10 text-white whitespace-nowrap">Kids</Link>
          <Link href="/movies" className="spiritual-button bg-white/5 border border-white/10 text-white whitespace-nowrap">Movies</Link>
          <Link href="/chapters" className="spiritual-button bg-white/5 border border-white/10 text-white whitespace-nowrap">Chapters</Link>
          <Link href="/daily-sloka" className="spiritual-button bg-white/5 border border-white/10 text-white whitespace-nowrap">Daily Sloka</Link>
          <Link href="/admin" className="spiritual-button bg-devotion-gold text-devotion-darkBlue shadow-md whitespace-nowrap">Admin</Link>
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">{children}</main>
    </div>
  );
}
