import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ServerSummary {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  channelCount: number;
}

export default function Home() {
  const [servers, setServers] = useState<ServerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetch('/api/servers', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setServers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load servers');
        setLoading(false);
      });
  }, []);

  const handleCreateServer = async () => {
    const name = prompt('Enter server name');
    if (!name) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/servers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });
    if (res.ok) {
      const data = await res.json();
      setServers((prev) => [...prev, { id: data.id, name: data.name, memberCount: 1, channelCount: 1 }]);
    } else {
      alert('Failed to create server');
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }
  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Servers</h1>
      <button
        className="mb-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        onClick={handleCreateServer}
      >
        Create Server
      </button>
      {servers.length === 0 ? (
        <p>You are not a member of any servers yet.</p>
      ) : (
        <ul className="space-y-2">
          {servers.map((srv) => (
            <li key={srv.id} className="border rounded p-3 hover:bg-gray-100">
              <Link href={`/servers/${srv.id}`}>{srv.name}</Link>
              <p className="text-sm text-gray-500">{srv.memberCount} members, {srv.channelCount} channels</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}