// src/pages/dashboard.tsx

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { mainShadow, mainSection, mainHeader } from "../styles/globalStyle";
import ChangePasswordForm from "../components/ChangePasswordForm";

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (!user) {
    return (
      <div style={mainShadow}>
        <div style={mainSection}>
          <h2>Please login to access the dashboard.</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={mainShadow}>
      <div style={mainSection}>
        <h1 style={mainHeader}>
          Dashboard
        </h1>
        <p>
          Welcome, <strong>{user.name || user.email}</strong>!
        </p>

        <p style={{ marginTop: "1rem" }}>
          This is your dashboard. You can manage your account here.
        </p>

        {loading && <p>Loading your data...</p>}
        
        <p style={{ marginTop: "1rem" }}></p>
        <ChangePasswordForm />
        
      </div>
    </div>
  );
}
