import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "../styles/AuthForm.css";

export default function Login() {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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

    // Optional: redirect after short delay
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  } catch (err) {
    console.error("Login error:", err);
    setMessage("Something went wrong. Try again.");
    setIsError(true);
  }
};


  return (
    <div className="auth-page">
      <div className="top-bar">
        <div className="back-arrow" onClick={() => navigate(-1)}>
          <FaArrowLeft size={20} color="white" />
        </div>
        <h1 className="brand-title">Codemate</h1>
      </div>

      <div className="form-wrapper">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Login</h2>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
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
