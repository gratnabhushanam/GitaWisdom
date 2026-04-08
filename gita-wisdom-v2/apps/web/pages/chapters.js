import { useEffect, useMemo, useState } from 'react';
import Shell from '../components/Shell';
import { apiGet } from '../lib/api';

const DEITY_BACKGROUNDS = [
  { image: '/scene-ram.svg', label: 'Ram' },
  { image: '/scene-hanuman.svg', label: 'Hanuman' },
  { image: '/scene-krishna.svg', label: 'Krishna' },
];

export default function ChaptersPage() {
  const [chapters, setChapters] = useState([]);
  const [active, setActive] = useState(null);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    apiGet('/api/chapters')
      .then((data) => {
        setChapters(data);
        setActive(data[0] || null);
      })
      .catch(() => setChapters([]));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % DEITY_BACKGROUNDS.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const backgroundStyle = useMemo(
    () => ({ backgroundImage: `linear-gradient(rgba(8,10,16,.52), rgba(8,10,16,.52)), url(${DEITY_BACKGROUNDS[bgIndex].image})` }),
    [bgIndex]
  );

  return (
    <Shell>
      <section style={backgroundStyle} className="rounded-3xl p-8 bg-cover bg-center text-white mb-6 min-h-[220px] flex items-end transition-all duration-1000">
        {active && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-black text-[#E6C38A] mb-3">Auto Scene: {DEITY_BACKGROUNDS[bgIndex].label}</p>
            <h2 className="text-4xl font-bold">Chapter {active.chapterNumber}: {active.title}</h2>
            <p className="max-w-2xl">{active.description}</p>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {chapters.map((c) => (
          <button key={c.id} onClick={() => setActive(c)} className="text-left bg-white rounded-xl border border-saffron/20 p-4 hover:bg-sandal">
            <h3 className="font-bold">{c.chapterNumber}. {c.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>
          </button>
        ))}
      </div>
    </Shell>
  );
}
