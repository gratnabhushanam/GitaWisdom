import { useEffect, useState } from 'react';
import Shell from '../components/Shell';
import { apiGet } from '../lib/api';

export default function DailySlokaPage() {
  const [sloka, setSloka] = useState(null);

  useEffect(() => {
    apiGet('/api/daily-sloka').then(setSloka).catch(() => setSloka(null));
  }, []);

  return (
    <Shell>
      <h2 className="text-3xl font-bold mb-6">Daily Sloka</h2>
      {!sloka && <p>No sloka configured for today.</p>}
      {sloka && (
        <div className="bg-white rounded-2xl p-6 shadow border border-saffron/20 space-y-3">
          <p className="text-xl font-semibold">{sloka.slokaText}</p>
          <p>{sloka.meaning}</p>
          <audio controls src={sloka.audioUrl} className="w-full" />
        </div>
      )}
    </Shell>
  );
}
