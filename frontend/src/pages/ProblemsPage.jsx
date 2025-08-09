// src/pages/ProblemsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles/ProblemsPage.css';

export default function ProblemsPage() {
  const navigate = useNavigate();

  const [tab, setTab] = useState('cf'); // 'cf' | 'lc' | 'cc'

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

  // ====== LOAD CODEFORCES PROBLEMS ======
  useEffect(() => {
    let mounted = true;
    const load = async () => {
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
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Exclude solved by handle
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

  // Filtered CF list
  const cfFiltered = useMemo(() => {
    const tset = cfSelectedTags;
    const hasTagFilter = tset.size > 0;
    const q = cfSearch.trim().toLowerCase();

    return cfAll.filter(p => {
      if (p.rating < cfMin || p.rating > cfMax) return false;
      if (hasTagFilter) {
        const ptags = p.tags || [];
        let ok = false;
        for (const tag of ptags) if (tset.has(tag)) { ok = true; break; }
        if (!ok) return false;
      }
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (cfExcludeSolved && cfSolvedSet.size > 0) {
        const key = `${p.contestId}-${p.index}`;
        if (cfSolvedSet.has(key)) return false;
      }
      return true;
    });
  }, [cfAll, cfMin, cfMax, cfSelectedTags, cfSearch, cfExcludeSolved, cfSolvedSet]);

  const cfRandomTen = () => {
    const copy = [...cfFiltered];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, 10);
  };

  const tagToggle = (t) => {
    setCfSelectedTags(prev => {
      const copy = new Set(prev);
      if (copy.has(t)) copy.delete(t); else copy.add(t);
      return copy;
    });
  };

  // -------- LeetCode curated links --------
  const lcDifficultyLinks = [
    { label: 'Easy',   href: 'https://leetcode.com/problemset/?difficulty=EASY' },
    { label: 'Medium', href: 'https://leetcode.com/problemset/?difficulty=MEDIUM' },
    { label: 'Hard',   href: 'https://leetcode.com/problemset/?difficulty=HARD' }
  ];
  const lcTopicLinks = [
    { label: 'Arrays',               href: 'https://leetcode.com/tag/array/' },
    { label: 'Strings',              href: 'https://leetcode.com/tag/string/' },
    { label: 'Linked List',          href: 'https://leetcode.com/tag/linked-list/' },
    { label: 'Binary Tree',          href: 'https://leetcode.com/tag/tree/' },
    { label: 'Graphs',               href: 'https://leetcode.com/tag/graph/' },
    { label: 'Dynamic Programming',  href: 'https://leetcode.com/tag/dynamic-programming/' },
    { label: 'Binary Search',        href: 'https://leetcode.com/tag/binary-search/' },
    { label: 'Greedy',               href: 'https://leetcode.com/tag/greedy/' },
    { label: 'Two Pointers',         href: 'https://leetcode.com/tag/two-pointers/' },
    { label: 'Sliding Window',       href: 'https://leetcode.com/tag/sliding-window/' },
    { label: 'Backtracking',         href: 'https://leetcode.com/tag/backtracking/' },
    { label: 'Heap / Priority Queue',href: 'https://leetcode.com/tag/heap-priority-queue/' },
    { label: 'Prefix Sum',           href: 'https://leetcode.com/tag/prefix-sum/' },
    { label: 'Hash Table',           href: 'https://leetcode.com/tag/hash-table/' },
  ];

  // -------- CodeChef curated links --------
  // NOTE: These are public Practice links with rating filters in the querystring.
  // CodeChef may change params over time; these currently work and avoid any API/auth.
  const ccDifficultyLinks = [
    { label: '≤ 999 (Beginner)', href: 'https://www.codechef.com/practice?start_rating=0&end_rating=999&sort_by=difficulty_rating&sort_order=asc' },
    { label: '1000–1399',        href: 'https://www.codechef.com/practice?start_rating=1000&end_rating=1399&sort_by=difficulty_rating&sort_order=asc' },
    { label: '1400–1699',        href: 'https://www.codechef.com/practice?start_rating=1400&end_rating=1699&sort_by=difficulty_rating&sort_order=asc' },
    { label: '1700–1999',        href: 'https://www.codechef.com/practice?start_rating=1700&end_rating=1999&sort_by=difficulty_rating&sort_order=asc' },
    { label: '2000–2399',        href: 'https://www.codechef.com/practice?start_rating=2000&end_rating=2399&sort_by=difficulty_rating&sort_order=asc' },
    { label: '2400+',            href: 'https://www.codechef.com/practice?start_rating=2400&end_rating=5000&sort_by=difficulty_rating&sort_order=asc' },
  ];

  // Topic pages; slugs are CodeChef’s tag pages.
  const ccTopicLinks = [
    { label: 'Dynamic Programming', href: 'https://www.codechef.com/tags/problems/dynamic-programming' },
    { label: 'Graphs',              href: 'https://www.codechef.com/tags/problems/graph-theory' },
    { label: 'Greedy',              href: 'https://www.codechef.com/tags/problems/greedy-algorithms' },
    { label: 'Binary Search',       href: 'https://www.codechef.com/tags/problems/binary-search' },
    { label: 'Number Theory',       href: 'https://www.codechef.com/tags/problems/number-theory' },
    { label: 'Strings',             href: 'https://www.codechef.com/tags/problems/strings' },
    { label: 'Segment Tree',        href: 'https://www.codechef.com/tags/problems/segment-tree' },
  ];

  const [ccQuery, setCcQuery] = useState('');

  // ---- UI helpers ----
  const cfListToCards = (list) => (
    <div className="prob-grid">
      {list.map((p) => (
        <a
          key={`${p.contestId}-${p.index}`}
          className="prob-card"
          href={`https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`}
          target="_blank" rel="noopener noreferrer"
        >
          <div className="prob-title">{p.name}</div>
          <div className="prob-meta">
            <span className="pill">CF</span>
            <span className="pill rating">{p.rating}</span>
          </div>
          <div className="tags">
            {(p.tags || []).slice(0, 4).map(t => <span key={t}>{t}</span>)}
          </div>
        </a>
      ))}
    </div>
  );

  return (
    <>
      {/* Top bar */}
      <header className="cm-topbar">
        <button className="cm-back" onClick={() => navigate(-1)} aria-label="Go back">
          <FaArrowLeft />
        </button>
        <div className="cm-brand">CodeMate</div>
        <div className="cm-right-spacer" />
      </header>

      <div className="problems-page">
        <div className="tabs">
          <button className={tab === 'cf' ? 'active' : ''} onClick={() => setTab('cf')}>Codeforces</button>
          <button className={tab === 'lc' ? 'active' : ''} onClick={() => setTab('lc')}>LeetCode</button>
          <button className={tab === 'cc' ? 'active' : ''} onClick={() => setTab('cc')}>CodeChef</button>
        </div>

        {tab === 'cf' ? (
          <>
            {/* CF Filters */}
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
                    <input
                      type="number"
                      value={cfMin}
                      min={800} max={3600} step={100}
                      onChange={e => setCfMin(Number(e.target.value))}
                    />
                    <span>to</span>
                    <input
                      type="number"
                      value={cfMax}
                      min={800} max={3600} step={100}
                      onChange={e => setCfMax(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="field">
                  <label className="inline">
                    <input
                      type="checkbox"
                      checked={cfExcludeSolved}
                      onChange={(e) => setCfExcludeSolved(e.target.checked)}
                    />
                    Exclude solved by handle
                  </label>
                  <input
                    value={cfHandle}
                    onChange={e => setCfHandle(e.target.value)}
                    placeholder="Your CF handle"
                    onBlur={fetchCfSolved}
                    disabled={!cfExcludeSolved}
                  />
                </div>
              </div>

              <details className="tags-panel">
                <summary>Select tags (optional)</summary>
                <div className="tags-select">
                  {cfTags.map(t => (
                    <label key={t} className={`tag-choice ${cfSelectedTags.has(t) ? 'on' : ''}`}>
                      <input
                        type="checkbox"
                        checked={cfSelectedTags.has(t)}
                        onChange={() => tagToggle(t)}
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </details>
            </section>

            <div className="actions">
              <button onClick={fetchCfSolved} disabled={!cfExcludeSolved || !cfHandle.trim()}>
                Refresh solved set
              </button>
              <button onClick={() => setCfSelectedTags(new Set())}>Clear tags</button>
            </div>

            {cfLoading ? (
              <div className="state muted">Loading Codeforces problems…</div>
            ) : cfErr ? (
              <div className="state error">{cfErr}</div>
            ) : (
              <>
                <h3 className="section-title">Filtered Results ({cfFiltered.length})</h3>
                {cfListToCards(cfFiltered.slice(0, 60))}

                <h3 className="section-title with-gap">Random 10</h3>
                {cfListToCards(cfRandomTen())}
              </>
            )}
          </>
        ) : tab === 'lc' ? (
          <>
            {/* LeetCode – curated links */}
            <section className="lc-links">
              <div className="link-card">
                <h4>Difficulty</h4>
                <div className="chips wrap">
                  {lcDifficultyLinks.map(l => (
                    <a key={l.label} className="chip on" href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="link-card">
                <h4>Popular Topics</h4>
                <div className="chips wrap">
                  {lcTopicLinks.map(l => (
                    <a key={l.label} className="chip" href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>

              <p className="hint">
                Want inline LeetCode lists here? Enable the backend proxy later and we’ll switch this tab back to the API view.
              </p>
            </section>
          </>
        ) : (
          <>
            {/* CodeChef – curated links + search */}
            <section className="lc-links">
              <div className="link-card">
                <h4>Difficulty (by rating)</h4>
                <div className="chips wrap">
                  {ccDifficultyLinks.map(l => (
                    <a key={l.label} className="chip on" href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="link-card">
                <h4>Popular Topics</h4>
                <div className="chips wrap">
                  {ccTopicLinks.map(l => (
                    <a key={l.label} className="chip" href={l.href} target="_blank" rel="noopener noreferrer">
                      {l.label}
                    </a>
                  ))}
                </div>
              </div>

              <div className="link-card">
                <h4>Quick search</h4>
                <div className="cc-search">
                  <input
                    value={ccQuery}
                    onChange={e => setCcQuery(e.target.value)}
                    placeholder="e.g., two pointers"
                  />
                  <a
                    className="chip"
                    href={`https://www.codechef.com/practice?search=${encodeURIComponent(ccQuery)}&sort_by=difficulty_rating&sort_order=asc`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Search on CodeChef
                  </a>
                </div>
              </div>

              <p className="hint">
                CodeChef doesn’t provide a stable public problems API. These curated links keep it reliable across localhost and production.
              </p>
            </section>
          </>
        )}
      </div>
    </>
  );
}
