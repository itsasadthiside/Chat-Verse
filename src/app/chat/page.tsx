'use client';

import { useEffect, useRef, useState } from 'react';
import axios from '../lib/axios';
import { useRouter } from 'next/navigation';

type Message = {
  from: string;
  to: string;
  text: string;
  timestamp: string;
};

export default function ChatPage() {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const token = localStorage.getItem('token');
  const router = useRouter();
  const username = localStorage.getItem('username');

  const fetchFriends = async () => {
    try {
      const res = await axios.get('/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const onlyFriends = res.data.filter((u: any) => u.isFriend).map((u: any) => u.username);
      setFriends(onlyFriends);
    } catch (err) {
      console.error('Error fetching friends:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/messages/${selected}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    if (!token) return router.push('/login');

    fetchFriends();

    const wsClient = new WebSocket(`ws://localhost:5000?token=${token}`);
    wsClient.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === 'message') {
        setMessages((prev) => [...prev, msg]);
      }

      if (msg.type === 'online') {
        setOnlineUsers(msg.users);
      }

      if (msg.type === 'typing' && msg.from === selected) {
        console.log(`${msg.from} is typing...`);
      }
    };

    setWs(wsClient);

    return () => wsClient.close();
  }, []);

  useEffect(() => {
    if (selected) {
      fetchMessages();
    }
  }, [selected]);

  const sendMessage = () => {
    if (ws && text.trim()) {
      ws.send(JSON.stringify({ type: 'message', to: selected, text }));
      setText('');
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '25%', borderRight: '1px solid gray', padding: '10px' }}>
        <h3>Friends</h3>
        {friends.map((user) => (
          <div
            key={user}
            onClick={() => setSelected(user)}
            style={{ cursor: 'pointer', fontWeight: user === selected ? 'bold' : 'normal' }}
          >
            {user} {onlineUsers.includes(user) && '🟢'}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, padding: '10px' }}>
        {selected ? (
          <>
            <h3>Chat with {selected}</h3>
            <div style={{ height: '300px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ marginBottom: '10px' }}>
                  <b>{msg.from}</b>: {msg.text}
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              ))}
            </div>
            <input
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                ws?.send(JSON.stringify({ type: 'typing', to: selected }));
              }}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message"
              style={{ width: '100%', marginTop: '10px' }}
            />
          </>
        ) : (
          <p>Select a friend to start chatting.</p>
        )}
      </div>
    </div>
  );
}
