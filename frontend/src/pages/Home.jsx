// src/pages/Home.jsx
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Home.css";
import ContestCard from "../pages/ContestCard";
import { API_BASE } from "../lib/apiBase"; // <-- use our helper

export default function Home() {
  const [cards, setCards] = useState([]);

  // Dark mode
  const getInitialMode = () => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) return JSON.parse(savedMode);
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  const [darkMode, setDarkMode] = useState(getInitialMode);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(m => !m);

  // Build URLs: dev uses Vite proxy; prod uses backend base
  const CC_URL = import.meta.env.DEV ? "/api/codechef" : `${API_BASE}/api/codechef`;
  const LC_URL = import.meta.env.DEV ? "/api/leetcode" : `${API_BASE}/api/leetcode`;

  // Upcoming contests
  useEffect(() => {
    const cf = axios
      .get("https://codeforces.com/api/contest.list")
      .then((res) =>
        res.data.result
          .filter((c) => c.phase === "BEFORE" && typeof c.startTimeSeconds === "number")
          .map((c) => ({
            id: `cf-${c.id}`,
            name: c.name,
            startTime: c.startTimeSeconds * 1000,
            url: `https://codeforces.com/contest/${c.id}`,
          }))
          .filter((c) => c.startTime > Date.now())
          .sort((a, b) => a.startTime - b.startTime)
          .slice(0, 2)
      );

    const cc = axios.get(CC_URL).then((res) =>
      (res.data.future_contests || [])
        .map((c) => ({
          id: `cc-${c.contest_code}`,
          name: c.contest_name,
          startTime: new Date(c.contest_start_date_iso).getTime(),
          url: `https://www.codechef.com/${c.contest_code}`,
        }))
        .filter((c) => c.startTime > Date.now())
        .sort((a, b) => a.startTime - b.startTime)
        .slice(0, 2)
    );

    const lc = axios
      .post(LC_URL, {
        query: `
          query {
            allContests {
              title
              titleSlug
              startTime
              duration
            }
          }
        `,
      })
      .then((res) =>
        (res.data?.data?.allContests || [])
          .filter((c) => c.startTime * 1000 > Date.now())
          .sort((a, b) => a.startTime - b.startTime)
          .slice(0, 2)
          .map((c) => ({
            id: `lc-${c.titleSlug}`,
            name: c.title,
            startTime: c.startTime * 1000,
            url: `https://leetcode.com/contest/${c.titleSlug}/`,
          }))
      );

    Promise.all([cf, cc, lc])
      .then(([cfList, ccList, lcList]) => setCards([...cfList, ...ccList, ...lcList]))
      .catch((e) => {
        console.error("Home contests failed:", e);
        setCards([]); // show empty gracefully
      });
  }, []);

  return (
    <div className="home">
      <header className="navbar-wrapper">
        <div className="navbar">
          <div className="logo">CodeMate</div>
          <div className="nav-links">
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
            <div className="dropdown">
              <span className="dropdown-label">CP Topics ▼</span>
              <div className="dropdown-content">
                <Link to="/topics/dp">Dynamic Programming</Link>
                <Link to="/topics/graphs">Graphs</Link>
                <Link to="/topics/greedy">Greedy Algorithms</Link>
                <Link to="/topics/trees-lca">Trees & LCA</Link>
                <Link to="/topics/segtree">Segment Tree / Fenwick Tree</Link>
                <Link to="/topics/search">Binary & Ternary Search</Link>
                <Link to="/topics/bitmask">Bit Manipulation / Bitmask DP</Link>
                <Link to="/topics/number-theory">Number Theory</Link>
                <Link to="/topics/strings">String Algorithms</Link>
                <Link to="/topics/geometry">Computational Geometry</Link>
                <Link to="/topics/flow">Flow & Matching</Link>
                <Link to="/topics/advanced-ds">Advanced Data Structures</Link>
                <Link to="/topics/game-theory">Game Theory</Link>
                <Link to="/topics/probability">Probability & Expected Value</Link>
                <Link to="/topics/misc">Misc / Tricks</Link>
              </div>
            </div>
            <Link to="/contact">Contact</Link>
            <button onClick={toggleDarkMode} className="dark-mode-toggle">
              {darkMode ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <section className="hero">
          <h1>Track Contests. Know Your Stats. Improve Fast.</h1>
          <p>Upcoming contests from Codeforces, CodeChef, and LeetCode.</p>
        </section>

        <section className="contests">
          <h2>Upcoming Contests</h2>
          <div className="contest-list">
            {cards.map((c) => (
              <ContestCard key={c.id} name={c.name} startTime={c.startTime} url={c.url} />
            ))}
            {cards.length === 0 && <div className="muted">No contests to show.</div>}
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div className="footer-center">© CodeMate {new Date().getFullYear()}</div>
      </footer>
    </div>
  );
}
