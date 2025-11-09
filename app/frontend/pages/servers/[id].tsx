import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export default function ServerPage() {
  const router = useRouter();
  const { id } = router.query;
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    if (!id) return;
    // Fetch existing messages
    fetch(`/api/messages/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
      });
    // Establish socket connection
    const s = io({
      auth: { token }
    });
    s.emit('join', id);
    s.on('message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [id]);

  const handleSend = async () => {
    const token = localStorage.getItem('token');
    if (!token || !newMessage) return;
    await fetch(`/api/messages/${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content: btoa(newMessage) })
    });
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 bg-primary text-white flex items-center">
        <button onClick={() => router.push('/')} className="mr-4">&larr; Back</button>
        <h1 className="text-xl font-bold">Server {id}</h1>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white p-2 rounded shadow">
            <div className="text-xs text-gray-500">{new Date(msg.createdAt).toLocaleString()}</div>
            <div className="font-semibold text-sm">{msg.senderId}</div>
            <div className="text-sm break-words">
              {/* decode base64 message for demonstration */}
              {(() => {
                try {
                  return atob(msg.content);
                } catch {
                  return '[encrypted]';
                }
              })()}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-white flex items-center space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border rounded p-2"
          placeholder="Type your message..."
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Send
        </button>
      </div>
    </div>
  );
}