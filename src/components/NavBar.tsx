import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal";

export default function NavBar() {
  const { user, logout } = useAuth();
  const [isModalOpen, setModalOpen] = useState(false);

  const handleLogout = () => {
    setModalOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setModalOpen(false);
  };

  const cancelLogout = () => setModalOpen(false);

  return (
    <>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1rem 2rem",
          borderBottom: "1px solid #ccc",
          marginBottom: "2rem",
        }}
      >
        {/* Left side: feature buttons */}
        <div>
          <Link href="/" style={{ marginRight: 15 }}>
            Home
          </Link>
          <Link href="/portfolio" style={{ marginRight: 15 }}>
            Portfolio
          </Link>
          <Link href="/blog" style={{ marginRight: 15 }}>
            Blog
          </Link>
        </div>

        {/* Right side: login info or login/register */}
        <div>
          {user ? (
            <>
              <span style={{ marginRight: 10 }}>
                Hi, {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  padding: "4px 8px",
                  cursor: "pointer",
                  border: "1px solid #888",
                  borderRadius: 4,
                  background: "#f0f0f0",
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{ marginRight: 10 }}>
                Login
              </Link>
              <Link href="/auth/register">Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* Logout confirmation modal */}
      <Modal
        isOpen={isModalOpen}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </>
  );
}
