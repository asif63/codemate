// src/lib/apiBase.js

// Use Vite env in production builds; fallback to local backend in dev
const RAW_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:5000';

// Normalize: remove any trailing slash so `${API_BASE}/api/...` is clean
export const API_BASE = RAW_BASE.replace(/\/$/, '');
