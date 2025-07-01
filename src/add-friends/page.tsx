'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

type User = {
  _id: string;
  username: string;
  isFriend: boolean;
  requestSent: boolean;
  requestReceived: boolean;
};

export default function AddFriendsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const sendRequest = async (toUserId: string) => {
    try {
      await axios.post(
        '/send-request',
        { toUserId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchUsers(); // Refresh after sending
    } catch (err) {
      console.error('Error sending request:', err);
      alert('Failed to send request');
    }
  };

  return (
    <div
      style={{
        padding: '30px',
        background: 'linear-gradient(to right, #000428, #004e92)',
        color: '#fff',
        minHeight: '100vh',
      }}
    >
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Add Friends</h1>

      {users.map((user) => (
        <div
          key={user._id}
          style={{
            marginBottom: '12px',
            padding: '12px 20px',
            background: '#1e1e2f',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{user.username}</span>

          {user.isFriend ? (
            <span style={{ color: 'lime' }}>✔️ Friend</span>
          ) : user.requestSent ? (
            <span style={{ color: 'orange' }}>⏳ Requested</span>
          ) : user.requestReceived ? (
            <span style={{ color: 'gold' }}>📥 Request Received</span>
          ) : (
            <button
              onClick={() => sendRequest(user._id)}
              style={{
                background: '#00c6ff',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              ➕ Add
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
