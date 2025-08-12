// src/pages/Contact.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Contact.css';

export default function Contact() {
  const navigate = useNavigate();

  // ---- Dark mode (same logic as Home.jsx) ----
  const getInitialMode = () => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [darkMode, setDarkMode] = useState(getInitialMode);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // ---- Team data ----
  const teamMembers = [
    {
      name: 'Md. Ashraful Islam',
      role: 'Frontend Developer',
      email: 'ashrafasif63@gmail.com',
      github: 'https://github.com/asif63',
      image: '/me.jpg'
    },
    {
      name: 'Md. Mizbah Uddin',
      role: 'Backend Developer',
      email: 'mdmizbah2002@gmail.com',
      github: 'https://github.com/member2',
      image: '/Mizbah Vai.jpg'
    },
    {
      name: 'Robin Dey',
      role: 'Database Engineer',
      email: 'robindey12052@gmail.com',
      github: 'https://github.com/member3',
      image: '/Robin Da.jpg'
    }
  ];

  return (
    <div className="contact-root">
      {/* ===== Navbar (same look as Home) ===== */}
      <header className="navbar-wrapper">
        <div className="navbar">
          {/* Left side: back arrow + logo */}
          <div className="nav-left">
            <button className="back-arrow" onClick={() => navigate('/')}>←</button>
            <div className="logo">CodeMate</div>
          </div>

          {/* Right side: links + toggle */}
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>

            <div className="dropdown">
              <span className="dropdown-label">CP Topics ▼</span>
              <div className="dropdown-content">
                <Link to="/topics/dp">Dynamic Programming</Link>
                <Link to="/topics/graphs">Graphs</Link>
                <Link to="/topics/greedy">Greedy Algorithms</Link>
              </div>
            </div>

            <Link to="/contact">Contact</Link>

            <button onClick={toggleDarkMode} className="dark-mode-toggle">
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </header>

      {/* ===== Main content ===== */}
      <main className="contact-page">
        <h1>Meet Our Team</h1>
        <p className="subtitle">The minds behind Codemate</p>

        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <img src={member.image} alt={member.name} className="team-photo" />
              <h2>{member.name}</h2>
              <p className="role">{member.role}</p>
              <p className="email">{member.email}</p>
              <a
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                className="github-link"
              >
                GitHub Profile
              </a>
            </div>
          ))}
        </div>
      </main>

      {/* ===== Minimal footer ===== */}
      <footer className="contact-footer">
        <div className="footer-center">CodeMate 2025</div>
      </footer>
    </div>
  );
}
