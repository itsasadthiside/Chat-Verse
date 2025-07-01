'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '../lib/axios';

type User = {
  _id: string;
  username: string;
  isFriend: boolean;
  requestSent: boolean;
  requestReceived: boolean;
};

export default function SelectPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await axios.get('/users');
      setUsers(res.data);
    } catch (err: any) {
      console.error('❌ Error fetching users:', err?.response?.data || err.message);
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (toUsername: string) => {
    try {
      await axios.post('/send-request', { toUsername }); // ✅ use username not _id
      loadUsers();
    } catch (err) {
      console.error('❌ Error sending request:', err);
      alert('Failed to send request');
    }
  };

  const acceptRequest = async (fromUsername: string) => {
    try {
      await axios.post('/accept-request', { fromUsername }); // ✅ use username not _id
      loadUsers();
    } catch (err) {
      console.error('❌ Error accepting request:', err);
      alert('Failed to accept request');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      loadUsers();
    }
  }, []);

  return (
    <div
      style={{
        padding: '30px',
        background: 'linear-gradient(to right, #1c1c2c, #3a3a5a)',
        color: '#fff',
        minHeight: '100vh',
      }}
    >
      <h2 style={{ fontSize: '26px', marginBottom: '20px' }}>People</h2>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        users.map((user) => (
          <div
            key={user._id}
            style={{
              marginBottom: '12px',
              padding: '12px 20px',
              background: '#2e2e3f',
              borderRadius: '10px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <strong>{user.username}</strong>

            {user.isFriend ? (
              <button
                onClick={() => router.push(`/chat/${user.username}`)}
                style={styles.chatBtn}
              >
                💬 Chat
              </button>
            ) : user.requestReceived ? (
              <button onClick={() => acceptRequest(user.username)} style={styles.acceptBtn}>
                ✅ Accept
              </button>
            ) : user.requestSent ? (
              <span style={{ color: 'orange' }}>⏳ Requested</span>
            ) : (
              <button onClick={() => sendRequest(user.username)} style={styles.sendBtn}>
                ➕ Send Request
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  sendBtn: {
    backgroundColor: '#00c6ff',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  acceptBtn: {
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  chatBtn: {
    backgroundColor: '#ff9900',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
