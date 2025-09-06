// src/pages/CFRunner.jsx
import React, { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

// Normalize API base: prefer VITE_API_BASE, fall back to localhost
const RAW_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const API_BASE = RAW_BASE.replace(/\/$/, ''); // strip trailing slash

export default function CFRunner() {
  const { contestId, index } = useParams();
  const [sp] = useSearchParams();
  const name = sp.get('name') || '';
  const rating = sp.get('rating') || '';

  const cfUrl = useMemo(
    () => `https://codeforces.com/problemset/problem/${contestId}/${index}`,
    [contestId, index]
  );

  const [language, setLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [stdin, setStdin] = useState('');
  const [out, setOut] = useState('');
  const [err, setErr] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    setOut('');
    setErr('');
    setStatus('');

    try {
      const token = localStorage.getItem('token'); // if your run API requires auth
      const res = await fetch(`${API_BASE}/api/judge/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ language, code, stdin }),
      });

      // Parse safely (in case the server returns HTML on error)
      const raw = await res.text();
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        data = { message: raw || 'Unexpected server response' };
      }

      if (!res.ok) {
        throw new Error(data?.message || 'Run failed');
      }

      setStatus(data.status || '');
      setOut((data.stdout || '').trim());
      const extra = `${data.compile_output || ''}\n${data.stderr || ''}`.trim();
      if (extra) setErr(extra);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="top-bar">
        <h1 className="brand-title">CodeMate</h1>
      </div>

      <div className="form-wrapper">
        <div className="auth-form auth-form--wide">
          <h2 style={{ marginBottom: 6 }}>{name || `CF ${contestId}${index}`}</h2>
          <div style={{ color: '#aaa', marginBottom: 12 }}>
            {rating ? `Rating: ${rating} • ` : ''}
            <a href={cfUrl} target="_blank" rel="noopener noreferrer">Open on Codeforces ↗</a>
          </div>

          <div style={{ display: 'grid', gap: 10 }}>
            <label>
              Language
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="cpp">C++17</option>
                <option value="python">Python 3</option>
                <option value="javascript">Node.js</option>
                <option value="java">Java 11</option>
              </select>
            </label>

            <label>
              Code
              <textarea
                rows={14}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Paste or write your solution here…"
              />
            </label>

            <label>
              Custom input (stdin)
              <textarea
                rows={6}
                value={stdin}
                onChange={(e) => setStdin(e.target.value)}
                placeholder="Provide sample input to test locally"
              />
            </label>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button type="button" onClick={run} disabled={busy || !code.trim()}>
                {busy ? 'Running…' : 'Run'}
              </button>

              {/* AC/WA submission requires hidden tests.
                  When you add tests to your backend DB, wire a /submit endpoint and show a Submit button here. */}
              <span style={{ alignSelf: 'center', color: '#aaa' }}>
                Tip: For AC/WA verdict, add hidden tests to your backend and wire “Submit”.
              </span>
            </div>

            {status && <div className="success-message">Status: {status}</div>}

            {!!out && (
              <div>
                <strong>Program output</strong>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    background: '#111',
                    color: '#eee',
                    padding: '10px',
                    borderRadius: 8,
                    border: '1px solid #333',
                  }}
                >
                  {out}
                </pre>
              </div>
            )}

            {!!err && (
              <div className="error-message" style={{ whiteSpace: 'pre-wrap' }}>
                {err}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="page-footer">© {new Date().getFullYear()} CodeMate</footer>
    </div>
  );
}
