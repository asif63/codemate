import Problems from '../pages/Problems';
import React, { useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from 'recharts';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [username, setUsername] = useState('');
  const [tagData, setTagData] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleFetchStats = async () => {
    if (!username.trim()) {
      setError('Please enter a Codeforces username.');
      setTagData([]);
      return;
    }
    setIsLoading(true);
    setError('');
    setTagData([]);

    try {
      const response = await axios.get(`http://localhost:5000/api/stats/codeforces/${username}`);
      const tags = response.data.tags;
      if (Object.keys(tags).length === 0) {
        setError(`No data found for user "${username}" or user has no tagged problems solved.`);
        setTagData([]);
      } else {
        const data = Object.entries(tags)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count);
        setTagData(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      if (err.response && err.response.status === 404) {
        setError(`Codeforces user "${username}" not found.`);
      } else {
        setError('Error fetching stats. The API might be down or username is invalid.');
      }
      setTagData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          <p className="tooltip-value">{`Solved: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>Codemate</h1>
        <div className="profile-container">
          <img
            src="https://ui-avatars.com/api/?name=User&background=4a90e2&color=fff&rounded=true"
            alt="Profile"
            className="profile-icon"
            onClick={() => setShowDropdown(!showDropdown)}
          />
          {showDropdown && (
            <div className="dropdown-menu">
              <button onClick={() => alert("View Profile clicked")}>View Profile</button>
              <button onClick={() => alert("Update Password clicked")}>Update Password</button>
              <button onClick={() => alert("Settings clicked")}>Settings</button>
              <button onClick={() => alert("Logout clicked")}>Logout</button>
            </div>
          )}
        </div>
      </header>

      {/* Search Card */}
      <section className="dashboard-card">
        <h2 className="dashboard-card-header">Search Competitive Profile</h2>
        <div className="search-input-group">
          <input
            type="text"
            placeholder="Enter Codeforces Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleFetchStats()}
          />
          <button onClick={handleFetchStats} disabled={isLoading}>
            {isLoading ? 'Fetching...' : 'Fetch Stats'}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </section>

      {/* Chart Section */}
      {(tagData.length > 0 || isLoading) && (
        <section className="dashboard-card chart-container">
          <h2 className="dashboard-card-header">Problem Tag Breakdown for {username}</h2>
          {isLoading && <p className="no-data-message">Loading chart data...</p>}
          {!isLoading && tagData.length > 0 && (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={tagData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                <XAxis dataKey="tag" stroke="#a0a0a0" tick={{ fontSize: 11 }} interval={0} />
                <YAxis stroke="#a0a0a0" allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(74, 144, 226, 0.1)' }} />
                <Legend wrapperStyle={{ color: '#a0a0a0', paddingTop: '10px' }} />
                <Bar dataKey="count" fill="#4ade80" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {!isLoading && tagData.length === 0 && !error && (
            <p className="no-data-message">No tag data to display for this user.</p>
          )}
        </section>
      )}

      {/* Problems Section */}
      <Problems />

      {/* Footer */}
      <footer className="dashboard-footer">
        © {new Date().getFullYear()} Codemate. Inspired by LeetCode UI.
      </footer>
      
    </div>
  );
};

export default Dashboard;
