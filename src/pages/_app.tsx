// src/pages/_app.tsx

import "../styles/globals.css";
import type { AppProps } from "next/app";
import { AuthProvider } from "../context/AuthContext";
import NavBar from "../components/NavBar";
import { useRouter } from "next/router";

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isPdfMode = router.query.pdf === "1";
  
  return (
    <AuthProvider>
      {!isPdfMode && <NavBar />}   {/* hide NavBar only in PDF mode */}
      <Component {...pageProps} />
    </AuthProvider>
  );
}
