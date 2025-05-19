import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import apiClient from "../../service/apiClient";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate()

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Trying to signup");
      const data = await apiClient.signup( name, email, password );
      if (!data.success) {
        setError(data.message);
      } else {
        setSuccess(data.message);
        setTimeout(() => {
          navigate("/login")
        }, 1000);
      }
    } catch (error) {
      console.log("error from form", error);
    } finally{
      setLoading(false);
    }
  };

  return (
    <>
      <div>
        <h2>Welcome to App!</h2>
        <h3>Signup to get Started</h3>
      </div>
      <form onSubmit={handleFormSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            name="name"
            id="name"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            name="email"
            id="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">Password:</label>
          <input
            type="password"
            name="password"
            id="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Signup..." : "Signup"}
        </button>
      </form>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {!error && <div style={{ color: "green" }}>{success}</div>}
    </>
  );
}
