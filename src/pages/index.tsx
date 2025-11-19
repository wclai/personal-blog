// src/pages/index.tsx

import { useAuth } from "../context/AuthContext";
import { mainShadow, mainSection } from "../styles/globalStyle";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <>
      {/* NavBar already rendered by layout or _app.tsx, so remove duplicate */}
      <div
        style={mainShadow}
      >
        <div
          style={{
            ...mainSection,
            textAlign: "center",
          }}
        >
          <h1 style={{ marginBottom: "1rem" }}>Welcome to My Personal Blog</h1>

          {user ? (
            <p>Logged in as: {user.name || user.email}</p>
          ) : (
            <p>Please <a href="/auth/login">login</a> or <a href="/auth/register">register</a> to access your dashboard and portfolio.</p>
          )}
        </div>
      </div>
    </>
  );
}
