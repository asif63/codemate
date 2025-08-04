// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer, Legend
} from 'recharts';
import Problems from './Problems'; // will receive platform prop
import '../styles/Dashboard.css';

export default function Dashboard() {
  const [platform, setPlatform] = useState('codeforces');
  const [username, setUsername] = useState('');
  const [tagData, setTagData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleFetch = async () => {
    if (!username.trim()) {
      setError('Enter a username');
      return;
    }
    setError('');
    setLoading(true);
    setTagData([]);
    try {
      const res = await fetch(
        `http://localhost:5000/api/stats/${platform}/${username}`
      );
      const data = await res.json();
      if (!res.ok || !data.tags) {
        setError('No data found.');
      } else {
        const arr = Object.entries(data.tags)
          .map(([tag,count]) => ({ tag, count }))
          .sort((a,b)=>b.count-a.count);
        setTagData(arr);
      }
    } catch {
      setError('Fetch error');
    }
    setLoading(false);
  };

  // derived stats
  const total = tagData.reduce((s,t)=>s+t.count,0);
  const unique = tagData.length;
  const top  = unique? tagData[0].tag : '–';

  const stats = [
    { title: 'Total Solved', value: total },
    { title: 'Unique Tags', value: unique },
    { title: 'Top Tag',     value: top    }
  ];

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo">CodeMate</div>
        <nav className="nav-links">
          <Link to="/dashboard"   className="active">Dashboard</Link>
          <Link to="/contests">Contests</Link>
          <Link to="/problems">Problems</Link>
          <Link to="/topics">Topics</Link>
        </nav>
        <div className="user-wrapper">
          <FaUserCircle
            className="user-icon"
            size={28}
            onClick={()=>setShowMenu(!showMenu)}
          />
          {showMenu && (
            <div className="user-dropdown">
              <Link to="/profile">View Profile</Link>
              <Link to="/settings">Settings</Link>
              <button onClick={()=>alert('Logging out')}>
                Logout <FaSignOutAlt />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="dashboard-main">
        {/* Stats */}
        <section className="stats-grid">
          {stats.map(s => (
            <div key={s.title} className="stat-card">
              <h3>{s.title}</h3>
              <p>{s.value}</p>
            </div>
          ))}
        </section>

        {/* Search */}
        <section className="card search-card">
          <h2>Fetch Profile Stats</h2>
          <div className="search-group">
            <select
              value={platform}
              onChange={e=>setPlatform(e.target.value)}
            >
              <option value="codeforces">Codeforces</option>
              <option value="codechef">CodeChef</option>
              <option value="leetcode">LeetCode</option>
            </select>
            <input
              type="text"
              placeholder={`Username on ${platform}`}
              value={username}
              onChange={e=>setUsername(e.target.value)}
              onKeyPress={e=>e.key==='Enter'&&handleFetch()}
            />
            <button onClick={handleFetch} disabled={loading}>
              {loading?'Loading…':'Fetch'}
            </button>
          </div>
          {error && <p className="error-text">{error}</p>}
        </section>

        {/* Chart */}
        {(!loading && tagData.length>0) && (
          <section className="card chart-card">
            <h2>Tag Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tagData} margin={{top:20, right:30, left:20, bottom:5}}>
                <CartesianGrid stroke="#333" strokeDasharray="3 3"/>
                <XAxis dataKey="tag" stroke="#aaa" tick={{fontSize:12}}/>
                <YAxis stroke="#aaa" allowDecimals={false}/>
                <Tooltip/>
                <Legend />
                <Bar dataKey="count" fill="#4a90e2" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* Problems (filtered by platform) */}
        <section className="card problems-card">
          <h2>Practice Problems ({platform})</h2>
          <Problems platform={platform}/>
        </section>
      </main>

      <footer className="dashboard-footer">
        © {new Date().getFullYear()} CodeMate
      </footer>
    </div>
  );
}
