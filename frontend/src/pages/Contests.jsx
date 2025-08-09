// src/pages/Contests.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import ContestCard from './ContestCard';
import '../styles/Contests.css';

export default function Contests() {
  const navigate = useNavigate();

  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [platforms, setPlatforms] = useState({ cf: true, cc: true, lc: true });

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // Codeforces
        const cfRes = await fetch('https://codeforces.com/api/contest.list');
        const cfJson = await cfRes.json();
        const cf = (cfJson.result || [])
          .filter(c => c.phase === 'BEFORE' && typeof c.startTimeSeconds === 'number')
          .map(c => ({
            id: `cf-${c.id}`,
            platform: 'cf',
            name: c.name,
            startTime: c.startTimeSeconds * 1000,
            url: `https://codeforces.com/contest/${c.id}`,
          }));

        // CodeChef (dev via Vite proxy; prod should call your backend)
        const ccRes = await fetch('/api/codechef');
        const ccJson = await ccRes.json();
        const cc = (ccJson.future_contests || []).map(c => ({
          id: `cc-${c.contest_code}`,
          platform: 'cc',
          name: c.contest_name,
          startTime: new Date(c.contest_start_date_iso).getTime(),
          url: `https://www.codechef.com/${c.contest_code}`,
        }));

        // LeetCode (dev via Vite proxy; prod should call your backend)
        const lcRes = await fetch('/api/leetcode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
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
          }),
        });
        const lcJson = await lcRes.json();
        const lc = (lcJson?.data?.allContests || [])
          .filter(c => c.startTime * 1000 > Date.now())
          .sort((a, b) => a.startTime - b.startTime)
          .slice(0, 25)
          .map(c => ({
            id: `lc-${c.titleSlug}`,
            platform: 'lc',
            name: c.title,
            startTime: c.startTime * 1000,
            url: `https://leetcode.com/contest/${c.titleSlug}/`,
          }));

        const merged = [...cf, ...cc, ...lc]
          .filter(x => x.startTime > Date.now())
          .sort((a, b) => a.startTime - b.startTime);

        if (mounted) setAll(merged);
      } catch (e) {
        console.error('Contests fetch failed:', e);
        if (mounted) setAll([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return all.filter(c => {
      if (!platforms.cf && c.platform === 'cf') return false;
      if (!platforms.cc && c.platform === 'cc') return false;
      if (!platforms.lc && c.platform === 'lc') return false;
      if (term && !c.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [all, q, platforms]);

  return (
    <>
      {/* centered brand + back arrow */}
      <header className="cm-topbar">
        <button
          className="cm-back"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          title="Go back"
        >
          <FaArrowLeft />
        </button>
        <div className="cm-brand">CodeMate</div>
        <div className="cm-right-spacer" />
      </header>

      <div className="contests-page">
        <header className="contests-header">
          <h1>Upcoming Contests</h1>
          <p className="muted">Codeforces, CodeChef, and LeetCode — in your local time.</p>

          <div className="controls">
            <div className="platforms">
              <label>
                <input
                  type="checkbox"
                  checked={platforms.cf}
                  onChange={() => setPlatforms(p => ({ ...p, cf: !p.cf }))}
                />
                Codeforces
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={platforms.cc}
                  onChange={() => setPlatforms(p => ({ ...p, cc: !p.cc }))}
                />
                CodeChef
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={platforms.lc}
                  onChange={() => setPlatforms(p => ({ ...p, lc: !p.lc }))}
                />
                LeetCode
              </label>
            </div>

            <input
              className="search"
              placeholder="Search contests…"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
        </header>

        {loading ? (
          <div className="loading">Loading contests…</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No upcoming contests match your filters.</div>
        ) : (
          <div className="contest-grid">
            {filtered.map(c => (
              <div key={c.id} className={`contest-wrap ${c.platform}`}>
                <div className="pill">
                  {c.platform === 'cf' ? 'Codeforces' : c.platform === 'cc' ? 'CodeChef' : 'LeetCode'}
                </div>
                <ContestCard name={c.name} startTime={c.startTime} url={c.url} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
