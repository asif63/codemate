import React, { useEffect, useState } from 'react';
import '../styles/ContestCard.css';

function formatCountdown(ms) {
  let total = Math.max(ms, 0) / 1000;
  const d = Math.floor(total / 86400); total %= 86400;
  const h = Math.floor(total / 3600); total %= 3600;
  const m = Math.floor(total / 60);  const s = Math.floor(total % 60);
  return `${d}d ${h}h ${m}m ${s}s`;
}

export default function ContestCard({ name, startTime, url }) {
  const [cd, setCd] = useState('');

  useEffect(() => {
    function tick() {
      setCd(formatCountdown(startTime - Date.now()));
    }
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [startTime]);

  const dt = new Date(startTime);
  const date = dt.toLocaleDateString();
  const time = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) + ' UTC';

  return (
    <div className="contest-card">
      <h3>{name}</h3>
      <p><strong>Date:</strong> {date}</p>
      <p><strong>Time:</strong> {time}</p>
      <p><strong>Countdown:</strong> {cd}</p>
      <a href={url} target="_blank" rel="noopener">Go to Contest</a>
    </div>
  );
}
