'use client';
import { useState } from 'react';
import axios from '../lib/axios';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/register', {
        username,
        password,
      });
      localStorage.setItem('token', res.data.token);
      router.push('/chat');
    } catch (err: any) {
      setError('Registration failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to right, #FFA500, #FF0080)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '28px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '32px', marginRight: '8px' }}>📝</span> Register
        </h1>

        {error && <p style={{ color: 'red', marginBottom: '15px' }}>{error}</p>}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '15px',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              marginBottom: '20px',
              border: '1px solid #ccc',
              borderRadius: '8px'
            }}
          />
          <button type="submit" style={{
            width: '100%',
            background: 'linear-gradient(to right, #FF416C, #FF4B2B)',
            color: 'white',
            padding: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'background 0.3s ease'
          }}>
            Register
          </button>
        </form>

        <p style={{ marginTop: '20px', fontSize: '14px' }}>
          Already have an account? <a href="/login" style={{ color: '#FF4B2B', textDecoration: 'none', fontWeight: 'bold' }}>Login</a>
        </p>
      </div>
    </div>
  );
}
