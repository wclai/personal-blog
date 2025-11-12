import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function NavBar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex items-center justify-between bg-gray-800 text-white px-6 py-3">
      <div className="text-xl font-bold">
        <Link href="/">My Personal Blog</Link>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span className="text-sm">Hello, {user.name}</span>
            <Link
              href="/dashboard"
              className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
            >
              Dashboard
            </Link>
            <button
              onClick={logout}
              className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="bg-green-600 px-3 py-1 rounded hover:bg-green-700"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
