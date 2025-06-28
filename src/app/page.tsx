'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <div className="container">
        <h1>👋 Welcome to ChatVerse</h1>
        <p>Connect with your friends and the world in real-time.</p>
        <Link href="/login" className="button">Login</Link>
        <Link href="/register" className="button">Register</Link>
        <footer>Developed with ❤️ using Next.js & Node.js</footer>
      </div>

      <style>{`
        body, html {
          margin: 0;
          padding: 0;
          font-family: 'Segoe UI', sans-serif;
        }

        main {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea, #764ba2, #e66465);
          padding: 20px;
        }

        .container {
          background: white;
          border-radius: 16px;
          padding: 40px;
          text-align: center;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        h1 {
          font-size: 2rem;
          color: #333;
          margin-bottom: 16px;
        }

        p {
          color: #666;
          margin-bottom: 24px;
        }

        .button {
          display: inline-block;
          background: linear-gradient(to right, #8e2de2, #4a00e0);
          color: white;
          padding: 12px 24px;
          border-radius: 30px;
          margin: 10px 0;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s;
        }

        .button:hover {
          transform: scale(1.05);
        }

        footer {
          margin-top: 24px;
          color: #999;
          font-size: 0.85rem;
        }
      `}</style>
    </main>
  );
}
