import { useState } from 'react';
import Shell from '../components/Shell';
import { apiDelete, apiGet, apiPost, apiPut } from '../lib/api';

export default function AdminPage() {
  const [tab, setTab] = useState('users');
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [dailySlokas, setDailySlokas] = useState([]);
  const [videos, setVideos] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [mentor, setMentor] = useState({ type: 'stress', slokaText: '', meaningSimple: '', teluguExplanation: '', realLifeGuidance: '' });
  const [video, setVideo] = useState({ title: '', thumbnail: '', videoUrl: '', language: 'english', category: 'kids', type: '' });
  const [chapter, setChapter] = useState({ chapterNumber: 1, title: '', description: '', backgroundImage: '' });
  const [dailySloka, setDailySloka] = useState({ date: '', slokaText: '', meaning: '', audioUrl: '' });

  const login = async () => {
    const data = await apiPost('/api/login', { email, password });
    setToken(data.token);
    setMessage('Authenticated');
  };

  const loadTabData = async () => {
    if (!token) {
      setMessage('Login required to load admin data');
      return;
    }

    try {
      setMessage('Loading...');

      if (tab === 'users') {
        const data = await apiGet('/api/admin/users', token);
        setUsers(data);
      } else if (tab === 'mentor') {
        const data = await apiGet('/api/admin/mentor', token);
        setMentors(data);
      } else if (tab === 'videos') {
        const data = await apiGet('/api/admin/videos', token);
        setVideos(data);
      } else if (tab === 'chapters') {
        const data = await apiGet('/api/admin/chapters', token);
        setChapters(data);
      } else if (tab === 'daily') {
        const data = await apiGet('/api/admin/daily-sloka', token);
        setDailySlokas(data);
      }

      setMessage('Loaded');
    } catch (error) {
      setMessage('Could not load admin data');
    }
  };

  const saveMentor = async () => {
    if (!token) return setMessage('Login required to save data');
    try {
      if (editingId) await apiPut(`/api/admin/mentor/${editingId}`, mentor, token);
      else await apiPost('/api/admin/mentor', mentor, token);
      setMentor({ type: 'stress', slokaText: '', meaningSimple: '', teluguExplanation: '', realLifeGuidance: '' });
      setEditingId(null);
      await loadTabData();
    } catch {
      setMessage('Could not save mentor');
    }
  };

  const saveVideo = async () => {
    if (!token) return setMessage('Login required to save data');
    try {
      if (editingId) await apiPut(`/api/admin/videos/${editingId}`, video, token);
      else await apiPost('/api/admin/videos', video, token);
      setVideo({ title: '', thumbnail: '', videoUrl: '', language: 'english', category: 'kids', type: '' });
      setEditingId(null);
      await loadTabData();
    } catch {
      setMessage('Could not save video');
    }
  };

  const saveChapter = async () => {
    if (!token) return setMessage('Login required to save data');
    try {
      if (editingId) await apiPut(`/api/admin/chapters/${editingId}`, chapter, token);
      else await apiPost('/api/admin/chapters', chapter, token);
      setChapter({ chapterNumber: 1, title: '', description: '', backgroundImage: '' });
      setEditingId(null);
      await loadTabData();
    } catch {
      setMessage('Could not save chapter');
    }
  };

  const saveDailySloka = async () => {
    if (!token) return setMessage('Login required to save data');
    try {
      if (editingId) await apiPut(`/api/admin/daily-sloka/${editingId}`, dailySloka, token);
      else await apiPost('/api/admin/daily-sloka', dailySloka, token);
      setDailySloka({ date: '', slokaText: '', meaning: '', audioUrl: '' });
      setEditingId(null);
      await loadTabData();
    } catch {
      setMessage('Could not save daily sloka');
    }
  };

  const removeItem = async (path) => {
    if (!token) return setMessage('Login required to delete data');
    try {
      await apiDelete(path, token);
      await loadTabData();
    } catch {
      setMessage('Could not delete item');
    }
  };

  const loadUsers = async () => {
    if (!token) return setMessage('Login required to load users');
    try {
      const data = await apiGet('/api/admin/users', token);
      setUsers(data);
    } catch {
      setMessage('Could not load users');
    }
  };

  return (
    <Shell>
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
      <p className="text-sm text-gray-600 mb-4">{message}</p>

      <div className="flex gap-2 flex-wrap mb-4">
        {[
          { id: 'users', label: 'Users' },
          { id: 'mentor', label: 'Mentor Slokas' },
          { id: 'videos', label: 'Videos' },
          { id: 'chapters', label: 'Chapters' },
          { id: 'daily', label: 'Daily Sloka' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`px-3 py-2 rounded ${tab === item.id ? 'bg-ink text-sandal' : 'bg-white border'}`}
          >
            {item.label}
          </button>
        ))}
        <button className="bg-saffron text-white px-4 py-2 rounded disabled:opacity-50" onClick={loadTabData} disabled={!token}>Refresh</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-saffron/20 p-4">
          <h3 className="font-bold mb-3">Admin Login (JWT)</h3>
          <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className="w-full border rounded px-3 py-2 mb-2" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="bg-ink text-sandal px-4 py-2 rounded" onClick={login}>Login</button>
          {token && <p className="text-xs text-green-700 mt-2">Authenticated</p>}
        </section>

        {tab === 'videos' && (
          <section className="bg-white rounded-2xl border border-saffron/20 p-4">
            <h3 className="font-bold mb-3">Upload Video</h3>
            <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Title" value={video.title} onChange={(e) => setVideo((v) => ({ ...v, title: e.target.value }))} />
            <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Thumbnail URL" value={video.thumbnail} onChange={(e) => setVideo((v) => ({ ...v, thumbnail: e.target.value }))} />
            <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Video URL" value={video.videoUrl} onChange={(e) => setVideo((v) => ({ ...v, videoUrl: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input className="border rounded px-3 py-2" placeholder="Language" value={video.language} onChange={(e) => setVideo((v) => ({ ...v, language: e.target.value }))} />
              <input className="border rounded px-3 py-2" placeholder="Duration" value={video.duration || ''} onChange={(e) => setVideo((v) => ({ ...v, duration: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className="border rounded px-3 py-2" placeholder="Category (kids/movie)" value={video.category} onChange={(e) => setVideo((v) => ({ ...v, category: e.target.value }))} />
              <input className="border rounded px-3 py-2" placeholder="Type (movie optional)" value={video.type} onChange={(e) => setVideo((v) => ({ ...v, type: e.target.value }))} />
            </div>
            <button className="bg-saffron text-white px-4 py-2 rounded mt-3" onClick={saveVideo}>{editingId ? 'Update Video' : 'Add Video'}</button>
          </section>
        )}

        {tab === 'mentor' && (
          <section className="bg-white rounded-2xl border border-saffron/20 p-4">
            <h3 className="font-bold mb-3">Mentor Sloka</h3>
            <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Type" value={mentor.type} onChange={(e) => setMentor((v) => ({ ...v, type: e.target.value }))} />
            <textarea className="w-full border rounded px-3 py-2 mb-2" placeholder="Sloka text" value={mentor.slokaText} onChange={(e) => setMentor((v) => ({ ...v, slokaText: e.target.value }))} />
            <textarea className="w-full border rounded px-3 py-2 mb-2" placeholder="Meaning" value={mentor.meaningSimple} onChange={(e) => setMentor((v) => ({ ...v, meaningSimple: e.target.value }))} />
            <textarea className="w-full border rounded px-3 py-2 mb-2" placeholder="Telugu explanation" value={mentor.teluguExplanation} onChange={(e) => setMentor((v) => ({ ...v, teluguExplanation: e.target.value }))} />
            <textarea className="w-full border rounded px-3 py-2" placeholder="Real-life guidance" value={mentor.realLifeGuidance} onChange={(e) => setMentor((v) => ({ ...v, realLifeGuidance: e.target.value }))} />
            <button className="bg-saffron text-white px-4 py-2 rounded mt-3" onClick={saveMentor}>{editingId ? 'Update Mentor' : 'Add Mentor'}</button>
          </section>
        )}

        {tab === 'chapters' && (
          <section className="bg-white rounded-2xl border border-saffron/20 p-4">
            <h3 className="font-bold mb-3">Chapter</h3>
            <input type="number" className="w-full border rounded px-3 py-2 mb-2" placeholder="Chapter number" value={chapter.chapterNumber} onChange={(e) => setChapter((v) => ({ ...v, chapterNumber: Number(e.target.value) }))} />
            <input className="w-full border rounded px-3 py-2 mb-2" placeholder="Title" value={chapter.title} onChange={(e) => setChapter((v) => ({ ...v, title: e.target.value }))} />
            <textarea className="w-full border rounded px-3 py-2 mb-2" placeholder="Description" value={chapter.description} onChange={(e) => setChapter((v) => ({ ...v, description: e.target.value }))} />
            <input className="w-full border rounded px-3 py-2" placeholder="Background image URL" value={chapter.backgroundImage} onChange={(e) => setChapter((v) => ({ ...v, backgroundImage: e.target.value }))} />
            <button className="bg-saffron text-white px-4 py-2 rounded mt-3" onClick={saveChapter}>{editingId ? 'Update Chapter' : 'Add Chapter'}</button>
          </section>
        )}

        {tab === 'daily' && (
          <section className="bg-white rounded-2xl border border-saffron/20 p-4">
            <h3 className="font-bold mb-3">Daily Sloka</h3>
            <input type="date" className="w-full border rounded px-3 py-2 mb-2" value={dailySloka.date} onChange={(e) => setDailySloka((v) => ({ ...v, date: e.target.value }))} />
            <textarea className="w-full border rounded px-3 py-2 mb-2" placeholder="Sloka text" value={dailySloka.slokaText} onChange={(e) => setDailySloka((v) => ({ ...v, slokaText: e.target.value }))} />
            <textarea className="w-full border rounded px-3 py-2 mb-2" placeholder="Meaning" value={dailySloka.meaning} onChange={(e) => setDailySloka((v) => ({ ...v, meaning: e.target.value }))} />
            <input className="w-full border rounded px-3 py-2" placeholder="Audio URL" value={dailySloka.audioUrl} onChange={(e) => setDailySloka((v) => ({ ...v, audioUrl: e.target.value }))} />
            <button className="bg-saffron text-white px-4 py-2 rounded mt-3" onClick={saveDailySloka}>{editingId ? 'Update Sloka' : 'Add Sloka'}</button>
          </section>
        )}
      </div>

      <section className="bg-white rounded-2xl border border-saffron/20 p-4 mt-6">
        {tab === 'users' && (
          <>
            <h3 className="font-bold mb-3">Users</h3>
            <button className="bg-ink text-sandal px-4 py-2 rounded mb-3" onClick={loadUsers}>Load Users</button>
            <ul className="space-y-2">
              {users.map((u) => (
                <li key={u.id} className="border rounded p-2">{u.name} ({u.email}) - {u.role}</li>
              ))}
            </ul>
          </>
        )}

        {tab === 'videos' && (
          <ul className="space-y-2">
            {videos.map((item) => (
              <li key={item.id} className="border rounded p-2 flex justify-between gap-2">
                <span>{item.title} ({item.category})</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => { setVideo(item); setEditingId(item.id); }}>Edit</button>
                  <button className="px-3 py-1 bg-red-200 rounded" onClick={() => removeItem(`/api/admin/videos/${item.id}`)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === 'mentor' && (
          <ul className="space-y-2">
            {mentors.map((item) => (
              <li key={item.id} className="border rounded p-2 flex justify-between gap-2">
                <span>{item.type}</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => { setMentor(item); setEditingId(item.id); }}>Edit</button>
                  <button className="px-3 py-1 bg-red-200 rounded" onClick={() => removeItem(`/api/admin/mentor/${item.id}`)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === 'chapters' && (
          <ul className="space-y-2">
            {chapters.map((item) => (
              <li key={item.id} className="border rounded p-2 flex justify-between gap-2">
                <span>{item.chapterNumber}. {item.title}</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => { setChapter(item); setEditingId(item.id); }}>Edit</button>
                  <button className="px-3 py-1 bg-red-200 rounded" onClick={() => removeItem(`/api/admin/chapters/${item.id}`)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {tab === 'daily' && (
          <ul className="space-y-2">
            {dailySlokas.map((item) => (
              <li key={item.id} className="border rounded p-2 flex justify-between gap-2">
                <span>{new Date(item.date).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => { setDailySloka({ ...item, date: item.date.slice(0, 10) }); setEditingId(item.id); }}>Edit</button>
                  <button className="px-3 py-1 bg-red-200 rounded" onClick={() => removeItem(`/api/admin/daily-sloka/${item.id}`)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  );
}
