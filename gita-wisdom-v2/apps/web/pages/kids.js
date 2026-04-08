import { useEffect, useState } from 'react';
import Shell from '../components/Shell';
import { apiGet } from '../lib/api';

export default function KidsPage() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    apiGet('/api/videos?category=kids').then(setVideos).catch(() => setVideos([]));
  }, []);

  return (
    <Shell>
      <h2 className="text-3xl font-bold mb-6">Kids Spiritual Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {videos.map((v) => (
          <article key={v.id} className="bg-white rounded-2xl border border-saffron/20 shadow p-3">
            <img src={v.thumbnail} alt={v.title} className="w-full h-44 object-cover rounded-xl" />
            <h3 className="font-bold mt-3">{v.title}</h3>
            <p className="text-sm text-gray-600">{v.language}</p>
            <a className="inline-block mt-2 text-saffron font-semibold" href={v.videoUrl} target="_blank">Watch</a>
          </article>
        ))}
      </div>
    </Shell>
  );
}
