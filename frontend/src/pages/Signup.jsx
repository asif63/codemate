import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "../styles/AuthForm.css";

const Signup = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:5000/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Signup failed");
      return;
    }

    console.log("✅ Signup successful:", data);
    setSuccess(true);
    setFormData({ username: "", email: "", password: "" });

    setTimeout(() => setSuccess(false), 3000);
  } catch (err) {
    console.error("Signup error:", err);
    alert("Something went wrong. Please try again.");
  }
};


// Optionally hide message after few seconds
// setTimeout(() => setSuccess(false), 3000);


  return (
  <div className="auth-page">
    {/* Top black bar */}
    <div className="top-bar">
      <div className="back-arrow" onClick={() => navigate(-1)}>
        <FaArrowLeft size={20} color="white" />
      </div>
      <h1 className="brand-title">Codemate</h1>
    </div>

    {/* Centered sign up form */}
    <div className="form-wrapper">
  

      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
       <input
  type="text"
  name="username"
  placeholder="Name"
  value={formData.username}
  onChange={handleChange}
/>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
        />
        <button type="submit">Sign Up</button>
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
