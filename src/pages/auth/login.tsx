// src/pages/auth/login.tsx

import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    setLoading(false);

    if (result.success) {
      router.push("/dashboard");
      return;
    }

    // Handle error cases from AuthContext.login()
    if (result.errorCode === "ACCOUNT_INACTIVE") {
      setError("Your account has not been activated yet. Please contact the administrator.");
    } else if (result.errorCode === "INVALID_CREDENTIALS") {
      setError("Invalid email or password.");
    } else {
      setError(result.message || "Login failed. Please try again.");
    }
  };

  return (
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
      <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Login</h2>

      {error && (
        <p
          style={{
            color: "red",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
        <label style={{ marginBottom: 5 }}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "8px",
            marginBottom: "1rem",
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        />

        <label style={{ marginBottom: 5 }}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "8px",
            marginBottom: "1.5rem",
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "10px",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}