import { useAuth } from "../context/AuthContext";
import Link from "next/link";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to My Personal Blog</h1>

      {user ? (
        <div>
          <p className="text-lg mb-2">
            Logged in as <strong>{user.name}</strong>
          </p>
          <Link
            href="/dashboard"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 mb-4">
            Please log in or register to continue.
          </p>
          <Link
            href="/auth/login"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
          >
            Login
          </Link>
          <Link
            href="/auth/register"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
}
