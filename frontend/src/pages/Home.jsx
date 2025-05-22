// src/pages/Home.jsx
import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Home.css";
import ContestCard from "../pages/ContestCard";

export default function Home() {
  const [cards, setCards] = useState([]);
  const [darkMode, setDarkMode] = useState(false); // ✅ New state for Dark Mode

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  useEffect(() => {
    // Your existing API code unchanged
    const cf = axios
      .get("https://codeforces.com/api/contest.list")
      .then((res) =>
        res.data.result
          .filter(
            (c) =>
              c.phase === "BEFORE" && typeof c.startTimeSeconds === "number"
          )
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

    const cc = axios.get("/api/codechef").then((res) =>
      res.data.future_contests
        .map((c) => ({
          id: `cc-${c.contest_code}`,
          name: c.contest_name,
          startTime: new Date(c.contest_start_date_iso).getTime(),
          url: `https://www.codechef.com/${c.contest_code}`,
        }))
        .filter((c) => c.startTime > Date.now())
    );

    const lc = axios
      .post("/api/leetcode", {
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
        res.data.data.allContests
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
      .then(([cfList, ccList, lcList]) => {
        setCards([...cfList, ...ccList, ...lcList]);
      })
      .catch(console.error);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

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
              </div>
            </div>

            <Link to="/contact">Contact</Link>
            {/* ✅ Dark mode toggle button */}
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
              <ContestCard
                key={c.id}
                name={c.name}
                startTime={c.startTime}
                url={c.url}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
