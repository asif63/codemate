import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/AuthForm.css";

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const [formData, setFormData] = useState({ email: "", password: "" });

  // Prefill remembered email
  useEffect(() => {
    const saved = localStorage.getItem("rememberEmail");
    if (saved) {
      setFormData(f => ({ ...f, email: saved }));
      setRemember(true);
    }
  }, []);

  const handleChange = (e) =>
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        setIsError(true);
        setLoading(false);
        return;
      }

      if (remember) localStorage.setItem("rememberEmail", formData.email);
      else localStorage.removeItem("rememberEmail");

      localStorage.setItem("token", data.token);
      setMessage("✅ Login successful!");
      setIsError(false);

      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Something went wrong. Try again.");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page login-page">
      {/* Top bar */}
      <div className="top-bar">
        <button className="back-arrow" onClick={() => navigate(-1)} aria-label="Go back">
          <FaArrowLeft size={18} color="white" />
        </button>
        <h1 className="brand-title">CodeMate</h1>
      </div>

      {/* Centered form */}
      <div className="form-wrapper">
        <form className="auth-form auth-form--login" onSubmit={handleSubmit} noValidate>
          <div className="form-head">
            <h2>Login</h2>
          </div>

          <label>
            <span>Email</span>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              inputMode="email"
            />
          </label>

          <label className="password-field">
            <span>Password</span>
            <div className="password-input-wrapper">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(p => !p)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </label>

          {/* <div className="row-between">
            <label className="inline">
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <span className="muted-link" role="link" tabIndex={0}>Forgot password?</span>
          </div> */}

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Signing in…" : "Login"}
          </button>

          <p className="alternate">
            Don’t have an account?{" "}
            <Link to="/signup" className="link">Sign Up</Link>
          </p>
        </form>

        {message && (
          <div className={isError ? "error-message" : "success-message"}>
            {message}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="page-footer">© 2025 CodeMate</footer>
    </div>
  );
}
