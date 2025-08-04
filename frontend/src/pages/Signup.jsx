import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import "../styles/AuthForm.css";

const Signup = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Signup failed");
        return;
      }
      setSuccess(true);
      setFormData({ username: "", email: "", password: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <div className="top-bar">
        <div className="back-arrow" onClick={() => navigate(-1)}>
          <FaArrowLeft size={20} color="white" />
        </div>
        <h1 className="brand-title">CodeMate</h1>
      </div>

      <div className="form-wrapper">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Create an Account</h2>

          <label>
            <span>Name</span>
            <input
              type="text"
              name="username"
              placeholder="Your name"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
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
                type={showPassword ? "text" : "password"}
                name="password"
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

          <button type="submit" className="submit-btn">Sign Up</button>

          <p className="alternate">
            Already have an account?{" "}
            <Link to="/login" className="link">Sign In</Link>
          </p>
        </form>

        {success && (
          <div className="success-message">
            ✅ Signup Successful!
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
