// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/AuthForm.css";

export default function Login() {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Login failed");
        setIsError(true);
        return;
      }

      localStorage.setItem("token", data.token);
      setMessage("✅ Login successful!");
      setIsError(false);

      // Redirect after a short delay
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Something went wrong. Try again.");
      setIsError(true);
    }
  };

  return (
    <div className="auth-page">
      {/* Top bar */}
      <div className="top-bar">
        <div className="back-arrow" onClick={() => navigate(-1)}>
          <FaArrowLeft size={20} color="white" />
        </div>
        <h1 className="brand-title">CodeMate</h1>
      </div>

      {/* Form wrapper */}
      <div className="form-wrapper">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Login</h2>

          <label>
            <span>Email</span>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
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
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(p => !p)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </label>

          <button type="submit" className="submit-btn">Login</button>

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
    </div>
  );
}
