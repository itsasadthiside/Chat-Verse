'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from '../../lib/axios';
import toast from 'react-hot-toast'; // ✅ Import toast

type Message = {
  from: string;
  to: string;
  text: string;
  timestamp: string;
};

export default function ChatPage() {
  const router = useRouter();
  const { username: chatWithUsername } = useParams();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const myUsername = typeof window !== 'undefined' ? localStorage.getItem('username') : null;

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/messages/${chatWithUsername}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      toast.error('❌ Failed to load messages');
    }
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!token) return router.push('/login');
    fetchMessages();

    const wsClient = new WebSocket(`ws://localhost:5000?token=${token}`);

    wsClient.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === 'message') {
        const isRelevant =
          (msg.from === chatWithUsername && msg.to === myUsername) ||
          (msg.to === chatWithUsername && msg.from === myUsername);

        if (isRelevant) {
          setMessages((prev) => [...prev, msg]);
          if (msg.from !== myUsername) {
            toast.success(`📩 New message from ${msg.from}`);
          }
        }
      }

      if (msg.type === 'typing') {
        if (msg.from === chatWithUsername) {
          setTypingUser(msg.from);
          setTimeout(() => setTypingUser(null), 3000);
        }
      }

      if (msg.type === 'online') {
        setOnlineUsers(msg.users);
      }
    };

    setWs(wsClient);
    return () => wsClient.close();
  }, [chatWithUsername]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (ws && text.trim()) {
      const msgObj = {
        type: 'message',
        to: chatWithUsername,
        text,
      };
      ws.send(JSON.stringify(msgObj));
      toast('📤 Message sent!', { icon: '✅' });
      setText('');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.chatHeader}>
        Chatting with: <strong>{chatWithUsername}</strong>
        {typingUser && <span style={{ marginLeft: 10, fontStyle: 'italic', color: '#aaa' }}>{typingUser} is typing...</span>}
      </div>

      <div style={styles.messagesBox}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              ...styles.messageBubble,
              alignSelf: msg.from === myUsername ? 'flex-end' : 'flex-start',
              backgroundColor: msg.from === myUsername ? '#4f9a94' : '#5e5e8f',
            }}
          >
            <div><strong>{msg.from === myUsername ? 'You' : msg.from}</strong></div>
            <div>{msg.text}</div>
            <div style={styles.timestamp}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div style={styles.inputRow}>
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            ws?.send(JSON.stringify({ type: 'typing', to: chatWithUsername }));
          }}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.sendBtn}>Send</button>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#1e1e2f',
    padding: '20px',
    color: '#fff',
  },
  chatHeader: {
    fontSize: '18px',
    marginBottom: '10px',
    color: '#81a1c1',
  },
  messagesBox: {
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#2a2e3a',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '10px 14px',
    borderRadius: '12px',
    backgroundColor: '#5e5e8f',
    color: '#fff',
  },
  timestamp: {
    fontSize: '10px',
    color: '#ccc',
    marginTop: '5px',
    textAlign: 'right',
  },
  inputRow: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
  },
  sendBtn: {
    padding: '10px 16px',
    backgroundColor: '#5e81ac',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
