'use client';

import { useState } from 'react';
import axios from '../lib/axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const res = await axios.post('/login', { username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('username', username);
      router.push('/chat');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <main>
      <div className="box">
        <h2>🔐 Login</h2>
        {error && <p className="error">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>

      <style>{`
        main {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6a11cb, #2575fc);
          padding: 20px;
          font-family: 'Segoe UI', sans-serif;
        }

        .box {
          background: white;
          border-radius: 16px;
          padding: 40px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
          text-align: center;
        }

        h2 {
          font-size: 1.8rem;
          margin-bottom: 20px;
          color: #333;
        }

        input {
          display: block;
          width: 100%;
          padding: 12px;
          margin-bottom: 15px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 1rem;
        }

        button {
          width: 100%;
          padding: 12px;
          background: linear-gradient(to right, #00c6ff, #0072ff);
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          transition: transform 0.2s;
        }

        button:hover {
          transform: scale(1.05);
        }

        .error {
          color: red;
          margin-bottom: 15px;
        }
      `}</style>
    </main>
  );
}
