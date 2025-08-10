import React, { useEffect, useMemo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthForm.css';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function Settings() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // single source of truth
  const [theme, setTheme] = useState('system');            // "system" | "light" | "dark"
  const [defaultPlatform, setDefaultPlatform] = useState('codeforces');
  const [isPublic, setIsPublic] = useState(true);

  // derived: is dark currently applied?
  const appliedDark = useMemo(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }, [theme]);

  // header button toggles theme value
  const toggleThemeBtn = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    const load = async () => {
      setLoading(true); setErr(''); setMsg('');
      try {
        const res = await fetch(`${API}/api/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load settings');
        setTheme(data.theme || 'system');
        setDefaultPlatform(data.defaultPlatform || 'codeforces');
        setIsPublic(Boolean(data.isPublic));
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, navigate]);

  // apply to document + persist preference locally for other pages
  useEffect(() => {
    document.body.classList.toggle('dark-mode', appliedDark);
    localStorage.setItem('darkMode', JSON.stringify(appliedDark));
  }, [appliedDark]);

  const saveSettings = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    try {
      const res = await fetch(`${API}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ theme, defaultPlatform, isPublic })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save settings');
      setMsg('✅ Settings updated');
    } catch (e) {
      setErr(e.message);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setErr(''); setMsg('');
    try {
      const res = await fetch(`${API}/api/me/password`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password');
      setMsg('✅ Password changed');
      setCurrentPassword(''); setNewPassword('');
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
            <button className="theme-btn" onClick={toggleThemeBtn} title="Toggle theme">
              {appliedDark ? '🌙' : '☀️'}
            </button>
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
          <button className="theme-btn" onClick={toggleThemeBtn} title="Toggle theme">
            {appliedDark ? '🌙' : '☀️'}
          </button>
        </div>
      </div>

      <div className="form-wrapper">
        <form className="auth-form auth-form--wide" onSubmit={saveSettings}>
          <h2>Settings</h2>

          <label>Theme
            <select value={theme} onChange={e=>setTheme(e.target.value)}>
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>

          <label>Default Platform
            <select value={defaultPlatform} onChange={e=>setDefaultPlatform(e.target.value)}>
              <option value="codeforces">Codeforces</option>
              <option value="leetcode">LeetCode</option>
            </select>
          </label>

          <label className="inline" style={{display:'flex', alignItems:'center', gap:8}}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={e=>setIsPublic(e.target.checked)}
            />
            Make my profile public
          </label>

          <div style={{display:'flex', gap:10}}>
            <button type="submit" style={{flex:1}}>Save Settings</button>
            <button
              type="button"
              style={{flex:1, background:'#2e2e2e'}}
              onClick={() => { setTheme('system'); setDefaultPlatform('codeforces'); setIsPublic(true); }}
            >
              Reset
            </button>
          </div>

          {msg && <div className="success-message" style={{marginTop:'12px'}}>{msg}</div>}
          {err && <div className="error-message" style={{marginTop:'12px'}}>{err}</div>}
        </form>

        <form className="auth-form auth-form--wide" onSubmit={changePassword} style={{marginTop:'1.25rem'}}>
          <h2>Change Password</h2>
          <label>Current Password
            <input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required />
          </label>
          <label>New Password
            <input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
          </label>
          <button type="submit">Update Password</button>
        </form>
      </div>

      <footer className="page-footer">© {new Date().getFullYear()} Codemate</footer>
    </div>
  );
}
