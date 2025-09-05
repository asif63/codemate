// src/pages/Practice.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/ProblemsPage.css';

export default function Practice() {
  const navigate = useNavigate();

  // Dark mode (same pattern you use elsewhere)
  const getInitialMode = () => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return JSON.parse(saved);
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  const [darkMode, setDarkMode] = useState(getInitialMode);
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // -------- CF state --------
  const [cfAll, setCfAll] = useState([]);
  const [cfLoading, setCfLoading] = useState(true);
  const [cfSearch, setCfSearch] = useState('');
  const [cfTags, setCfTags] = useState([]);
  const [cfSelectedTags, setCfSelectedTags] = useState(new Set());
  const [cfMin, setCfMin] = useState(800);
  const [cfMax, setCfMax] = useState(2000);
  const [cfExcludeSolved, setCfExcludeSolved] = useState(false);
  const [cfHandle, setCfHandle] = useState('');
  const [cfSolvedSet, setCfSolvedSet] = useState(new Set());
  const [cfErr, setCfErr] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setCfLoading(true);
      setCfErr('');
      try {
        const res = await fetch('https://codeforces.com/api/problemset.problems');
        const json = await res.json();
        const problems = json?.result?.problems ?? [];
        const withRating = problems.filter(p => typeof p.rating === 'number');
        const tagSet = new Set();
        withRating.forEach(p => (p.tags || []).forEach(t => tagSet.add(t)));
        const tagList = Array.from(tagSet).sort((a, b) => a.localeCompare(b));
        if (mounted) {
          setCfAll(withRating);
          setCfTags(tagList);
        }
      } catch (e) {
        console.error('CF load error', e);
        if (mounted) setCfErr('Failed to load Codeforces problemset.');
      } finally {
        if (mounted) setCfLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const fetchCfSolved = async () => {
    setCfErr('');
    setCfSolvedSet(new Set());
    if (!cfExcludeSolved || !cfHandle.trim()) return;
    try {
      const r = await fetch(
        `https://codeforces.com/api/user.status?handle=${encodeURIComponent(cfHandle.trim())}`
      );
      const j = await r.json();
      const s = new Set();
      (j?.result || []).forEach(sub => {
        if (sub.verdict === 'OK' && sub.problem?.contestId && sub.problem?.index) {
          s.add(`${sub.problem.contestId}-${sub.problem.index}`);
        }
      });
      setCfSolvedSet(s);
    } catch (e) {
      console.error('CF solved fetch err', e);
      setCfErr('Could not fetch solved problems for that handle.');
    }
  };

  const cfFiltered = useMemo(() => {
    const q = cfSearch.trim().toLowerCase();
    const hasTags = cfSelectedTags.size > 0;
    return cfAll.filter(p => {
      if (p.rating < cfMin || p.rating > cfMax) return false;
      if (hasTags) {
        const ptags = p.tags || [];
        let ok = false;
        for (const t of ptags) if (cfSelectedTags.has(t)) { ok = true; break; }
        if (!ok) return false;
      }
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (cfExcludeSolved && cfSolvedSet.size > 0) {
        if (cfSolvedSet.has(`${p.contestId}-${p.index}`)) return false;
      }
      return true;
    });
  }, [cfAll, cfMin, cfMax, cfSelectedTags, cfSearch, cfExcludeSolved, cfSolvedSet]);

  const tagToggle = (t) => {
    setCfSelectedTags(prev => {
      const copy = new Set(prev);
      if (copy.has(t)) copy.delete(t); else copy.add(t);
      return copy;
    });
  };

  return (
    <>
      <header className="cm-topbar">
        <button className="cm-back" onClick={() => navigate(-1)} aria-label="Go back">
          <FaArrowLeft />
        </button>
        <div className="cm-brand">CodeMate</div>
        <div className="cm-right-spacer">
          <button className="theme-btn" onClick={() => setDarkMode(d => !d)}>
            {darkMode ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <div className="problems-page">
        <h2 style={{marginBottom: 10}}>Practice (Codeforces)</h2>

        {/* Filters (same as before) */}
        <section className="filters">
          <div className="row">
            <div className="field">
              <label>Search title</label>
              <input
                value={cfSearch}
                onChange={e => setCfSearch(e.target.value)}
                placeholder="e.g., Two Buttons"
              />
            </div>
            <div className="field range">
              <label>Rating</label>
              <div className="range-inputs">
                <input type="number" value={cfMin} min={800} max={3600} step={100}
                       onChange={e => setCfMin(Number(e.target.value))}/>
                <span>to</span>
                <input type="number" value={cfMax} min={800} max={3600} step={100}
                       onChange={e => setCfMax(Number(e.target.value))}/>
              </div>
            </div>
            <div className="field">
              <label className="inline">
                <input type="checkbox" checked={cfExcludeSolved}
                       onChange={(e) => setCfExcludeSolved(e.target.checked)}/>
                Exclude solved by handle
              </label>
              <input value={cfHandle} onChange={e => setCfHandle(e.target.value)}
                     placeholder="Your CF handle" onBlur={fetchCfSolved}
                     disabled={!cfExcludeSolved}/>
            </div>
          </div>

          <details className="tags-panel">
            <summary>Select tags (optional)</summary>
            <div className="tags-select">
              {cfTags.map(t => (
                <label key={t} className={`tag-choice ${cfSelectedTags.has(t) ? 'on' : ''}`}>
                  <input type="checkbox" checked={cfSelectedTags.has(t)} onChange={() => tagToggle(t)}/>
                  {t}
                </label>
              ))}
            </div>
          </details>
        </section>

        {cfLoading ? (
          <div className="state muted">Loading Codeforces problems…</div>
        ) : cfErr ? (
          <div className="state error">{cfErr}</div>
        ) : (
          <>
            <h3 className="section-title">Results ({cfFiltered.length})</h3>
            <div className="prob-grid">
              {cfFiltered.slice(0, 60).map((p) => (
                <button
                  key={`${p.contestId}-${p.index}`}
                  className="prob-card prob-card--button"
                  onClick={() => navigate(`/practice/cf/${p.contestId}/${p.index}`)}
                  title="Open statement & run code"
                >
                  <div className="prob-title">{p.name}</div>
                  <div className="prob-meta">
                    <span className="pill">CF</span>
                    <span className="pill rating">{p.rating}</span>
                  </div>
                  <div className="tags">
                    {(p.tags || []).slice(0, 4).map(t => <span key={t}>{t}</span>)}
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <footer className="dashboard-footer">© {new Date().getFullYear()} CodeMate</footer>
    </>
  );
}
