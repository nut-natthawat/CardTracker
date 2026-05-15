'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push('/admin');
      } else {
        setError('รหัสผ่านไม่ถูกต้อง');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Outfit:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          background: #0d0d0d;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', sans-serif;
          font-weight: 300;
          padding: 24px;
        }

        .login-wrap {
          width: 100%;
          max-width: 340px;
          display: flex;
          flex-direction: column;
          gap: 48px;
        }

        .login-header {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .login-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: #e8e4dc;
          text-transform: uppercase;
        }
        .login-logo span { color: #c9a227; }

        .login-subtitle {
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(232,228,220,0.25);
        }

        /* Divider */
        .login-divider {
          width: 32px;
          height: 1px;
          background: rgba(255,255,255,0.12);
        }

        /* Form */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .login-label {
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(232,228,220,0.28);
        }

        .login-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid rgba(255,255,255,0.15);
          color: #e8e4dc;
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.1em;
          padding: 10px 0;
          outline: none;
          width: 100%;
          transition: border-color 0.2s;
        }
        .login-input::placeholder { color: rgba(232,228,220,0.15); }
        .login-input:focus { border-bottom-color: #c9a227; }

        /* Error */
        .login-error {
          font-size: 11px;
          letter-spacing: 0.06em;
          color: rgba(200,80,80,0.85);
          padding: 0;
          margin-top: -16px;
        }

        /* Submit button */
        .login-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(232,228,220,0.55);
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 14px 0;
          width: 100%;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s;
        }
        .login-btn:hover:not(:disabled) {
          border-color: #c9a227;
          color: #c9a227;
        }
        .login-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        /* Loading dots animation */
        .login-btn-loading::after {
          content: '';
          display: inline-block;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: currentColor;
          margin-left: 8px;
          vertical-align: middle;
          animation: dot-blink 1s infinite;
        }
        @keyframes dot-blink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>

      <div className="login-root">
        <div className="login-wrap">

          <div className="login-header">
            <p className="login-logo">OP<span>·</span>TRACKER</p>
            <p className="login-subtitle">Admin Access</p>
          </div>

          <div className="login-divider" />

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label className="login-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="login-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button
              type="submit"
              className={`login-btn${loading ? ' login-btn-loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Verifying' : 'Enter'}
            </button>
          </form>

        </div>
      </div>
    </>
  );
}