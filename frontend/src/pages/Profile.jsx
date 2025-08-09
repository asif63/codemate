import React, { useEffect, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthForm.css'; // reuse your form styles

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
        <form className="auth-form" onSubmit={onSave}>
          <h2>Profile</h2>

          <label style={{color:'#aaa', fontSize:'0.9rem'}}>Email (read-only)</label>
          <input type="email" value={form.email} readOnly />

          <label style={{color:'#aaa', fontSize:'0.9rem'}}>Username</label>
          <input name="username" value={form.username} onChange={onChange} required />

          <label style={{color:'#aaa', fontSize:'0.9rem'}}>Codeforces Handle</label>
          <input name="cfHandle" value={form.cfHandle} onChange={onChange} placeholder="e.g., tourist" />

          <label style={{color:'#aaa', fontSize:'0.9rem'}}>LeetCode Username</label>
          <input name="lcUsername" value={form.lcUsername} onChange={onChange} placeholder="e.g., john_doe" />

          <label style={{color:'#aaa', fontSize:'0.9rem'}}>Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={onChange}
            rows={4}
            style={{resize:'vertical', background:'#333', color:'#fff', border:'none', borderRadius:6, padding:'0.75rem 1rem', marginBottom:'1rem'}}
            placeholder="Short intro…"
          />

          <button type="submit">Save Changes</button>

          {msg && <div className="success-message" style={{marginTop:'12px'}}>{msg}</div>}
          {err && <div className="error-message" style={{marginTop:'12px'}}>{err}</div>}
        </form>
      </div>
    </div>
  );
}
