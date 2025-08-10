import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthForm.css';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function Profile() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const [form, setForm] = useState({
    email: '',
    username: '',
    cfHandle: '',
    lcUsername: '',
    bio: ''
  });

  // theme toggle (top-right)
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.body.classList.toggle('dark-mode', next);
    localStorage.setItem('darkMode', JSON.stringify(next));
  };

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const load = async () => {
      setLoading(true);
      setErr(''); setMsg('');
      try {
        const res = await fetch(`${API}/api/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load profile');
        setForm({
          email: data.email || '',
          username: data.username || '',
          cfHandle: data.cfHandle || '',
          lcUsername: data.lcUsername || '',
          bio: data.bio || ''
        });
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, navigate]);

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSave = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    try {
      const res = await fetch(`${API}/api/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          username: form.username,
          cfHandle: form.cfHandle,
          lcUsername: form.lcUsername,
          bio: form.bio
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      setMsg('✅ Profile updated');
    } catch (e) {
      setErr(e.message);
    }
  };

  if (loading) {
    return (
      <div className="auth-page">
        <div className="top-bar">
          <button className="back-arrow" onClick={()=>navigate(-1)} aria-label="Back"><FaArrowLeft color="white"/></button>
          <h1 className="brand-title">Codemate</h1>
          <div className="actions-right">
            <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">{dark ? '🌙' : '☀️'}</button>
          </div>
        </div>
        <div className="form-wrapper"><p>Loading…</p></div>
        <footer className="page-footer">© {new Date().getFullYear()} Codemate</footer>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="top-bar">
        <div className="back-arrow" onClick={() => navigate(-1)} aria-label="Back">
          <FaArrowLeft size={18} color="white" />
        </div>
        <h1 className="brand-title">Codemate</h1>
        <div className="actions-right">
          <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
            {dark ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      <div className="form-wrapper">
        <form className="auth-form auth-form--wide" onSubmit={onSave}>
          <h2>Profile</h2>

          <label>Email (read-only)
            <input type="email" value={form.email} readOnly />
          </label>

          <label>Username
            <input name="username" value={form.username} onChange={onChange} required />
          </label>

          <label>Codeforces Handle
            <input name="cfHandle" value={form.cfHandle} onChange={onChange} placeholder="e.g., tourist" />
          </label>

          <label>LeetCode Username
            <input name="lcUsername" value={form.lcUsername} onChange={onChange} placeholder="e.g., neetcode" />
          </label>

          <label>Bio
            <textarea
              name="bio"
              value={form.bio}
              onChange={onChange}
              placeholder="Short intro…"
            />
          </label>

          <button type="submit">Save Changes</button>

          {msg && <div className="success-message" style={{marginTop:'12px'}}>{msg}</div>}
          {err && <div className="error-message" style={{marginTop:'12px'}}>{err}</div>}
        </form>
      </div>

      <footer className="page-footer">© {new Date().getFullYear()} Codemate</footer>
    </div>
  );
}
