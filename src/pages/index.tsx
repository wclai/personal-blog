// src/pages/index.tsx
import { useAuth } from "../context/AuthContext";
// Remove: import NavBar from "../components/NavBar";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <>
      {/* NavBar already rendered by layout or _app.tsx, so remove duplicate */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "4rem",
        }}
      >
        <div
          style={{
            width: 500,
            padding: "2rem",
            border: "1px solid #ccc",
            borderRadius: 8,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            backgroundColor: "#fff",
            textAlign: "center",
          }}
        >
          <h1 style={{ marginBottom: "1rem" }}>Welcome to My Personal Blog</h1>

          {user ? (
            <p>Logged in as: {user.name || user.email}</p>
          ) : (
            <p>Please login or register to access your dashboard and portfolio.</p>
          )}
        </div>
      </div>
    </>
  );
}
