"use client";

import { useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);

    const supabase = getSupabaseClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "http://localhost:3000/shopproof/dashboard",
      },
    });

    setLoading(false);

    if (!error) {
      setSent(true);
    } else {
      alert(error.message);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>ShopPROOF Login</h1>

        {!sent ? (
          <>
            <input
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button style={styles.button} onClick={handleLogin} disabled={loading}>
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </>
        ) : (
          <p style={styles.success}>
            Check your email and click the login link.
          </p>
        )}
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
  },
  card: {
    background: "#111827",
    padding: 32,
    borderRadius: 12,
    width: 320,
    textAlign: "center",
  },
  title: {
    color: "#fff",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
    border: "1px solid #374151",
    background: "#020617",
    color: "#fff",
  },
  button: {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
  success: {
    color: "#22c55e",
  },
};