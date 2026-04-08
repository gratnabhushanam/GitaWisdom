import { useEffect, useState } from 'react';
import Shell from '../components/Shell';
import { apiGet } from '../lib/api';

export default function MoviesPage() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    apiGet('/api/videos?type=movie').then(setMovies).catch(() => setMovies([]));
  }, []);

  return (
    <Shell>
      <h2 className="text-3xl font-bold mb-6">Spiritual Movies</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {movies.map((m) => (
          <article key={m.id} className="bg-white rounded-2xl border border-saffron/20 shadow p-3">
            <img src={m.thumbnail} alt={m.title} className="w-full h-44 object-cover rounded-xl" />
            <h3 className="font-bold mt-3">{m.title}</h3>
            <p className="text-sm text-gray-600">{m.duration || 'N/A'}</p>
            <a className="inline-block mt-2 text-saffron font-semibold" href={m.videoUrl} target="_blank">Watch</a>
          </article>
        ))}
      </div>
    </Shell>
  );
}
