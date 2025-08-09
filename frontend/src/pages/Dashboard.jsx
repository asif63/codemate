import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend
} from 'recharts';
import Problems from './ProblemsWidget';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();

  const [platform, setPlatform] = useState('codeforces');
  const [username, setUsername] = useState('');
  const [tagData, setTagData] = useState([]);
  const [totalSolved, setTotalSolved] = useState(0);
  const [rating, setRating] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setShowMenu(false);
    navigate('/login');
  };
  const go = (path) => { setShowMenu(false); navigate(path); };

  const handleFetch = async () => {
    if (!username.trim()) { setError('Enter a username'); return; }
    setError('');
    setLoading(true);
    setTagData([]);
    setTotalSolved(0);
    setRating(null);

    try {
      const res = await fetch(`http://localhost:5000/api/stats/${platform}/${username}`);
      const data = await res.json();

      if (!res.ok || !data.tags) {
        setError('No data found.');
      } else {
        const arr = Object.entries(data.tags)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count);

        setTagData(arr);
        setTotalSolved(data.totalSolved || 0);
        setRating(data.rating ?? 'N/A');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Fetch error');
    }

    setLoading(false);
  };

  const stats = [
    { title: 'Rating',       value: rating },
    { title: 'Total Solved', value: totalSolved },
    { title: 'Unique Tags',  value: tagData.length },
    { title: 'Top Tag',      value: tagData[0]?.tag || '–' }
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dash-logo">CodeMate</div>

        <nav className="dash-nav">
          <Link to="/dashboard" className="active">Dashboard</Link>
          <Link to="/contests">Contests</Link>
          <Link to="/problems">Problems</Link>
          <Link to="/topics">Topics</Link>
        </nav>

        <div className="user-wrapper" ref={menuRef}>
          <button
            className="user-button"
            aria-haspopup="menu"
            aria-expanded={showMenu}
            onClick={() => setShowMenu(v => !v)}
            title="Account"
          >
            <FaUserCircle className="user-icon" size={28} />
          </button>

          {showMenu && (
            <div className="user-dropdown" role="menu">
              <button role="menuitem" onClick={() => go('/profile')}>View Profile</button>
              <button role="menuitem" onClick={() => go('/settings')}>Settings</button>
              <button role="menuitem" onClick={handleLogout}>
                Logout <FaSignOutAlt style={{ marginLeft: 6 }} />
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="dashboard-main">
        <section className="stats-grid">
          {stats.map(s => (
            <div key={s.title} className="stat-card">
              <h3>{s.title}</h3>
              <p>{s.value}</p>
            </div>
          ))}
        </section>

        <section className="card search-card">
          <h2>Fetch Profile Stats</h2>
          <div className="search-group">
            <select value={platform} onChange={e => setPlatform(e.target.value)}>
              <option value="codeforces">Codeforces</option>
              <option value="leetcode">LeetCode</option>
            </select>
            <input
              type="text"
              placeholder={`Username on ${platform}`}
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
            />
            <button onClick={handleFetch} disabled={loading}>
              {loading ? 'Loading…' : 'Fetch'}
            </button>
          </div>
          {error && <p className="error-text">{error}</p>}
        </section>

        {!loading && tagData.length > 0 && (
          <section className="card chart-card">
            <h2>Tag Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tagData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" />
                <XAxis dataKey="tag" stroke="#aaa" tick={{ fontSize: 12 }} />
                <YAxis stroke="#aaa" allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#4a90e2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        <section className="card problems-card">
          <h2>Practice Problems ({platform})</h2>
          <Problems platform={platform} />
        </section>
      </main>

      <footer className="dashboard-footer">
        © {new Date().getFullYear()} CodeMate
      </footer>
    </div>
  );
}
