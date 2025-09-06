// src/pages/PracticeSolve.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import CodeRunner from '../pages/CFRunner';
import '../styles/ProblemsPage.css';
import { API_BASE } from '../lib/apiBase';

// Talk to backend directly (bypass Vite proxy). Set VITE_API_BASE in .env if needed.


export default function PracticeSolve() {
  const navigate = useNavigate();
  const { contestId, index } = useParams();

  // --- Theme ---
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

  // --- Problem statement state ---
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [data, setData] = useState(null);

  // --- Runner state ---
  const [stdin, setStdin] = useState('');
  const [code, setCode] = useState('');

  // Normalize CF math delimiters: $$$x$$$ -> $x$, $$$$X$$$$ -> $$X$$
  const normalizeCFMath = (html) => {
    if (!html) return '';
    let out = html;
    // handle display first to avoid interfering with the triple-$ rule
    out = out.replace(/\$\$\$\$(.+?)\$\$\$\$/gs, (_, m) => `$$${m}$$`);
    // then inline
    out = out.replace(/\$\$\$(.+?)\$\$\$/gs, (_, m) => `$${m}$`);
    return out;
  };

  // Load MathJax once with $ / $$ support
  useEffect(() => {
    if (!window.__codemate_mjx) {
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$'], ['\\(', '\\)']],
          displayMath: [['$$', '$$'], ['\\[', '\\]']],
          processEscapes: true,
          processEnvironments: true,
        },
        options: {
          skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
          ignoreHtmlClass: 'tex2jax_ignore',
          processHtmlClass: 'tex2jax_process',
        },
      };
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
      s.async = true;
      document.head.appendChild(s);
      window.__codemate_mjx = true;
    }
  }, []);

  // Fetch statement (defensive JSON parsing to catch HTML responses)
  const fetchStatement = useCallback(async () => {
    setLoading(true);
    setErr('');
    const url = `${API_BASE}/api/cf2/problem/${contestId}/${index}`;
    try {
      const res = await fetch(url, { credentials: 'omit' });
      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        throw new Error(`Non-JSON from ${url} [${res.status}]: ${text.slice(0, 200)}`);
      }
      if (!res.ok) throw new Error(json?.error || `Failed to load statement (${res.status})`);
      setData(json);
      if (json?.samples?.length && json.samples[0]?.input) setStdin(json.samples[0].input);
      else setStdin('');
    } catch (e) {
      setErr(e.message || 'Failed to load statement');
    } finally {
      setLoading(false);
    }
  }, [contestId, index]);

  useEffect(() => {
    let mounted = true;
    (async () => { if (mounted) await fetchStatement(); })();
    return () => { mounted = false; };
  }, [fetchStatement]);

  // Typeset math after HTML injection
  useEffect(() => {
    if (window.MathJax && data && !loading && !err) {
      setTimeout(() => window.MathJax.typesetPromise?.(), 0);
    }
  }, [data, loading, err]);

  // Build external links
  const openUrl = data?.url || `https://codeforces.com/contest/${contestId}/problem/${index}`;
  const submitUrl = useMemo(() => {
    return `https://codeforces.com/problemset/submit?contestId=${contestId}&problemIndex=${index}`;
  }, [contestId, index]);

  // --- Submission helpers ---
  const copyAndOpen = async () => {
    try { await navigator.clipboard.writeText(code || ''); } catch {}
    window.open(submitUrl, '_blank', 'noopener');
  };

  const openCFWithCode = () => {
    // Optional userscript auto-fill (Tampermonkey). Fallback to copy for huge code.
    const enc = encodeURIComponent(code || '');
    const b64 = btoa(unescape(enc));
    const fragment = `cm_code=${b64}&cm_lang=${encodeURIComponent('GNU G++17')}`;
    if (fragment.length > 120000) return copyAndOpen(); // URL too large → fallback
    window.open(`${submitUrl}#${fragment}`, '_blank', 'noopener');
  };

  // Samples helpers
  const handleSampleToStdin = (text) => setStdin(text || '');
  const copyText = async (text) => { try { await navigator.clipboard.writeText(text || ''); } catch {} };

  // Apply the $$$ → $ normalization right before rendering
  const processedHtml = useMemo(
    () => normalizeCFMath(data?.statementHtml || ''),
    [data?.statementHtml]
  );

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
        <div className="statement-card">
          {loading ? (
            <div className="state muted">Loading statement…</div>
          ) : err ? (
            <div className="state error">
              {err}
              <div>
                <button className="btn" onClick={fetchStatement} style={{ marginTop: 8 }}>
                  Retry
                </button>
                <a className="btn ghost" href={openUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 8 }}>
                  Open on Codeforces ↗
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="stm-head">
                <h2>{data?.title || `CF ${contestId}${index}`}</h2>
                <div className="stm-actions">
                  <a className="open-link" href={openUrl} target="_blank" rel="noreferrer">
                    Open on Codeforces ↗
                  </a>
                  <a className="submit-link" href={submitUrl} target="_blank" rel="noreferrer">
                    Submit on Codeforces ⤴
                  </a>
                </div>
              </div>

              <div className="stm-meta">
                {data?.timeLimit && <span>⏱ {data.timeLimit}</span>}
                {data?.memoryLimit && <span>🧠 {data.memoryLimit}</span>}
                {data?.inputFile && <span>📥 {data.inputFile}</span>}
                {data?.outputFile && <span>📤 {data?.outputFile}</span>}
              </div>

              {/* Sanitized + normalized statement HTML */}
              <article
                className="stm-html"
                dangerouslySetInnerHTML={{ __html: processedHtml }}
              />

              <div className="samples-box">
                <h3>Sample Tests</h3>
                {data?.samples?.length ? (
                  data.samples.map((s, i) => (
                    <div key={i} className="s-row">
                      <div>
                        <div className="lbl">Input</div>
                        <pre>{s.input}</pre>
                        <div className="s-actions">
                          <button className="btn" onClick={() => handleSampleToStdin(s.input)}>Use as stdin</button>
                          <button className="btn ghost" onClick={() => copyText(s.input)}>Copy</button>
                        </div>
                      </div>
                      <div>
                        <div className="lbl">Output</div>
                        <pre>{s.output}</pre>
                        <div className="s-actions">
                          <button className="btn ghost" onClick={() => copyText(s.output)}>Copy</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="muted">No samples found.</p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="runner-card">
          <h3>Run your solution</h3>
          <CodeRunner
            defaultLanguage="cpp"
            defaultStdin={stdin}
            onStdinChange={setStdin}
            onCodeChange={setCode}  // make sure CFRunner passes code back up
          />
          <div className="runner-actions" style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" onClick={copyAndOpen}>Copy & open submit ↗</button>
            <button className="btn ghost" onClick={openCFWithCode} title="Optional userscript auto-fill">
              Open CF with code ↗
            </button>
          </div>
          <p className="muted" style={{ marginTop: 6 }}>
            Tip: “Open CF with code” needs an optional userscript. Otherwise use “Copy & open submit”.
          </p>
        </div>
      </div>

      <footer className="dashboard-footer">© {new Date().getFullYear()} CodeMate</footer>
    </>
  );
}
