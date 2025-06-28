'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../lib/axios';

type Message = {
  from: string;
  to: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'seen';
};

export default function ChatPage() {
  const router = useRouter();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [users, setUsers] = useState<string[]>([]);
  const [online, setOnline] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typingFrom, setTypingFrom] = useState<string | null>(null);
  const [unread, setUnread] = useState<Record<string, number>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : '';

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !username) {
      router.push('/login');
      return;
    }

    axios.get('/users', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      const otherUsers = res.data.map((u: any) => u.username);
      setUsers(otherUsers);
    });

    const ws = new WebSocket(`ws://localhost:5000?token=${token}`);
    setSocket(ws);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'message') {
        const msgWithStatus = { ...data, status: data.status || 'sent' };

        if (
          (data.from === username && data.to === selectedUser) ||
          (data.to === username && data.from === selectedUser)
        ) {
          setMessages(prev => [...prev, msgWithStatus]);
        } else if (data.to === username) {
          setUnread(prev => ({
            ...prev,
            [data.from]: (prev[data.from] || 0) + 1,
          }));
        }
      }

      if (data.type === 'typing' && data.from === selectedUser) {
        setTypingFrom(data.from);
        setTimeout(() => setTypingFrom(null), 1000);
      }

      if (data.type === 'online') {
        setOnline(data.users);
      }

      if (data.type === 'seen') {
        setMessages(prev =>
          prev.map(msg =>
            msg.to === data.from ? { ...msg, status: 'seen' } : msg
          )
        );
      }
    };

    return () => ws.close();
  }, [router, selectedUser]);

  const sendMessage = () => {
    if (!input.trim() || !socket || !selectedUser) return;

    const message = {
      type: 'message',
      to: selectedUser,
      text: input,
    };

    socket.send(JSON.stringify(message));
    setInput('');
  };

  const handleTyping = () => {
    if (socket && selectedUser) {
      socket.send(JSON.stringify({ type: 'typing', to: selectedUser }));
    }
  };

  const logout = () => {
    localStorage.clear();
    router.push('/login');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (socket && selectedUser) {
      socket.send(JSON.stringify({
        type: 'seen',
        from: username,
        to: selectedUser,
      }));
    }

    if (selectedUser) {
      setUnread(prev => {
        const updated = { ...prev };
        delete updated[selectedUser];
        return updated;
      });
    }
  }, [selectedUser]);

  return (
    <main>
      <div className="container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h2>💬 Chats</h2>
            <button onClick={logout}>🚪</button>
          </div>
          <ul className="user-list">
            {users.map((user) => (
              <li
                key={user}
                onClick={() => {
                  setSelectedUser(user);
                  setMessages([]);
                }}
                className={selectedUser === user ? 'active' : ''}
              >
                <div className="user-info">
                  <img
                    src={`https://ui-avatars.com/api/?name=${user}&background=random`}
                    alt={user}
                    className="avatar"
                  />
                  <span>{user} {online.includes(user) ? '🟢' : '⚪'}</span>
                </div>
                {unread[user] && <span className="badge">{unread[user]}</span>}
              </li>
            ))}
          </ul>
        </aside>

        <section className="chat">
          {selectedUser ? (
            <>
              <div className="chat-header">{selectedUser}</div>
              <div className="chat-box">
                {messages.map((msg, i) => (
                  <div key={i} className={`msg ${msg.from === username ? 'self' : 'other'}`}>
                    <p>{msg.text}</p>
                    <small>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                      {msg.from === username && (
                        <>
                          {' '}
                          {msg.status === 'sent' && '✔️'}
                          {msg.status === 'delivered' && '✅'}
                          {msg.status === 'seen' && '👁️'}
                        </>
                      )}
                    </small>
                  </div>
                ))}
                {typingFrom && <p className="typing">{typingFrom} is typing...</p>}
                <div ref={messagesEndRef} />
              </div>
              <div className="input-area">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendMessage();
                    else handleTyping();
                  }}
                  placeholder="Type a message"
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </>
          ) : (
            <p className="select-user">Select a user to chat</p>
          )}
        </section>
      </div>

      <style>{`
        main {
          width: 100vw;
          height: 100vh;
          background: #ece5dd;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', sans-serif;
        }

        .container {
          width: 95vw;
          height: 95vh;
          max-width: 1400px;
          display: flex;
          background: #fff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          border-radius: 10px;
          overflow: hidden;
        }

        .sidebar {
          width: 30%;
          background: #2f4f4f;
          color: white;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 16px;
          background: #1c3838;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sidebar-header button {
          background: crimson;
          border: none;
          padding: 6px 10px;
          border-radius: 4px;
          color: white;
          cursor: pointer;
        }

        .user-list {
          list-style: none;
          padding: 0;
          margin: 0;
          overflow-y: auto;
          flex: 1;
        }

        .user-list li {
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          border-bottom: 1px solid #444;
        }

        .user-list li.active {
          background: #3d6466;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }

        .badge {
          background: #25d366;
          color: white;
          padding: 2px 8px;
          font-size: 0.8rem;
          border-radius: 20px;
        }

        .chat {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          padding: 14px 20px;
          background: #075e54;
          color: white;
          font-weight: bold;
        }

        .chat-box {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          background: #e5ddd5;
        }

        .msg {
          margin: 10px 0;
          padding: 10px;
          max-width: 70%;
          border-radius: 10px;
          word-wrap: break-word;
        }

        .self {
          align-self: flex-end;
          background: #dcf8c6;
        }

        .other {
          align-self: flex-start;
          background: white;
        }

        .msg small {
          display: block;
          font-size: 0.75rem;
          color: #555;
          margin-top: 4px;
        }

        .typing {
          font-style: italic;
          color: #555;
          font-size: 0.9rem;
          margin-top: 5px;
        }

        .input-area {
          display: flex;
          padding: 12px;
          background: #f0f0f0;
        }

        .input-area input {
          flex: 1;
          padding: 10px;
          border-radius: 20px;
          border: 1px solid #ccc;
          font-size: 1rem;
        }

        .input-area button {
          margin-left: 10px;
          padding: 0 16px;
          border: none;
          border-radius: 20px;
          background: #128c7e;
          color: white;
          font-weight: bold;
          cursor: pointer;
        }

        .select-user {
          margin: auto;
          color: #555;
          font-size: 1.2rem;
        }

        @media (max-width: 768px) {
          .container {
            flex-direction: column;
            height: 100vh;
          }

          .sidebar {
            width: 100%;
            height: 200px;
          }

          .chat {
            flex: 1;
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
