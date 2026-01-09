// src/pages/auth/register.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import AiRegister from "../../components/dify/AiRegister";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(name, email, password);
    if (success) {
      setError("Your registration request is received and being processed.");
    } else {
      setError("Registration failed");
    }
  };

  /**
   * 處理來自 AI 助手的成功事件
   */
  const handleAiSuccess = (message: string) => {
    setError(message);
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <>
      <div
        style={{
          maxWidth: 400,
          margin: "2rem auto",
          padding: "2rem",
          border: "1px solid #ccc",
          borderRadius: 8,
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Register</h2>

        {error && (
          <p
            style={{
              color: error.includes("received") ? "#10b981" : "red",
              marginBottom: "1rem",
              textAlign: "center",
              fontWeight: "bold"
            }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: 5 }}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: "8px", marginBottom: "1rem", border: "1px solid #ccc", borderRadius: 4 }}
          />

          <label style={{ marginBottom: 5 }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: "8px", marginBottom: "1rem", border: "1px solid #ccc", borderRadius: 4 }}
          />

          <label style={{ marginBottom: 5 }}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: "8px", marginBottom: "1.5rem", border: "1px solid #ccc", borderRadius: 4 }}
          />

          <button
            type="submit"
            style={{
              padding: "10px",
              backgroundColor: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            Register
          </button>
        </form>
      </div>

      {/* 傳入 handleAiSuccess 函數 */}
      <AiRegister onRegistrationSuccess={handleAiSuccess} />
    </>
  );
}