import React, { useEffect, useState } from 'react';
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

  const [theme, setTheme] = useState('system');            // system | light | dark
  const [defaultPlatform, setDefaultPlatform] = useState('codeforces'); // codeforces | leetcode
  const [isPublic, setIsPublic] = useState(true);

  // change password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

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

  // keep your existing darkMode in sync with chosen theme
  useEffect(() => {
    const apply = () => {
      let enableDark = false;
      if (theme === 'dark') enableDark = true;
      if (theme === 'light') enableDark = false;
      if (theme === 'system') {
        enableDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      document.body.classList.toggle('dark-mode', enableDark);
      localStorage.setItem('darkMode', JSON.stringify(enableDark));
    };
    apply();
  }, [theme]);

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

  if (loading) return <div className="auth-page"><div className="top-bar"><button className="back-arrow" onClick={()=>navigate(-1)}><FaArrowLeft color="white"/></button><h1 className="brand-title">Codemate</h1></div><div className="form-wrapper"><p>Loading…</p></div></div>;

  return (
    <div className="auth-page">
      <div className="top-bar">
        <div className="back-arrow" onClick={() => navigate(-1)}>
          <FaArrowLeft size={20} color="white" />
        </div>
        <h1 className="brand-title">Codemate</h1>
      </div>

      <div className="form-wrapper">
        {/* General Settings */}
        <form className="auth-form" onSubmit={saveSettings}>
          <h2>Settings</h2>

          <label style={{color:'#aaa', fontSize:'0.9rem'}}>Theme</label>
          <select
            value={theme}
            onChange={e=>setTheme(e.target.value)}
            style={{padding:'0.75rem 1rem', background:'#333', color:'#fff', border:'none', borderRadius:6, marginBottom:'1rem'}}
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>

          <label style={{color:'#aaa', fontSize:'0.9rem'}}>Default Platform</label>
          <select
            value={defaultPlatform}
            onChange={e=>setDefaultPlatform(e.target.value)}
            style={{padding:'0.75rem 1rem', background:'#333', color:'#fff', border:'none', borderRadius:6, marginBottom:'1rem'}}
          >
            <option value="codeforces">Codeforces</option>
            <option value="leetcode">LeetCode</option>
          </select>

          <label className="inline" style={{color:'#aaa', fontSize:'0.95rem', marginBottom:'1rem'}}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={e=>setIsPublic(e.target.checked)}
              style={{marginRight:8}}
            />
            Make my profile public
          </label>

          <button type="submit">Save Settings</button>

          {msg && <div className="success-message" style={{marginTop:'12px'}}>{msg}</div>}
          {err && <div className="error-message" style={{marginTop:'12px'}}>{err}</div>}
        </form>

        {/* Change Password */}
        <form className="auth-form" onSubmit={changePassword} style={{marginTop:'1.25rem'}}>
          <h2>Change Password</h2>
          <input
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={e=>setCurrentPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={e=>setNewPassword(e.target.value)}
            required
          />
          <button type="submit">Update Password</button>
        </form>
      </div>
    </div>
  );
}
