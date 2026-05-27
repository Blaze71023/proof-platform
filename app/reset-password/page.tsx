"use client";

import { CSSProperties, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, Shield } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

const T = {
  page: "linear-gradient(180deg, #0d1a2b 0%, #0f1f33 42%, #0b1827 100%)",
  card: "linear-gradient(180deg, rgba(20,33,50,0.98) 0%, rgba(14,25,40,0.99) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderAccent: "1px solid rgba(47,107,255,0.36)",
  text: "#f0f5fc",
  textSoft: "rgba(210,225,242,0.78)",
  textMuted: "rgba(180,200,222,0.58)",
  blue: "#2f6bff",
  buttonBlue: "linear-gradient(180deg, #2f6bff 0%, #2158e8 100%)",
  inputBg: "rgba(255,255,255,0.06)",
  errorBg: "rgba(220,38,38,0.12)",
  errorBorder: "rgba(220,38,38,0.32)",
  errorText: "#fb7185",
  successBg: "rgba(5,150,105,0.12)",
  successBorder: "rgba(5,150,105,0.30)",
  successText: "#34d399",
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"request" | "set">("request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // If Supabase redirects here with a recovery token, switch to "set" mode
  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("set");
      }
    });
  }, []);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required."); return; }
    setLoading(true);
    setError("");

    const supabase = getSupabaseClient();
    if (!supabase) { setError("Supabase not configured."); setLoading(false); return; }

    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSuccess("Check your email for a password reset link.");
    }
  }

  async function handleSet(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) { setError("Password is required."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    setError("");

    const supabase = getSupabaseClient();
    if (!supabase) { setError("Supabase not configured."); setLoading(false); return; }

    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      setSuccess("Password updated successfully. Redirecting...");
      setTimeout(() => router.push("/shopproof/dashboard"), 2000);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: T.page, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(47,107,255,0.14)", border: "1px solid rgba(47,107,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={20} color={T.blue} />
            </div>
            <span style={{ fontWeight: 950, fontSize: 20, letterSpacing: "-0.03em", color: T.text }}>ShopPROOF</span>
          </div>
        </div>

        <div style={{ borderRadius: 22, border: T.border, background: T.card, padding: "28px 24px", boxShadow: "0 30px 80px rgba(0,0,0,0.35)" }}>
          <h1 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 950, letterSpacing: "-0.03em", color: T.text }}>
            {mode === "request" ? "Reset your password" : "Set new password"}
          </h1>
          <p style={{ margin: "0 0 22px", fontSize: 13, color: T.textMuted, lineHeight: 1.5 }}>
            {mode === "request"
              ? "Enter your email and we'll send a reset link."
              : "Choose a strong password for your account."}
          </p>

          {error && (
            <div style={{ marginBottom: 16, borderRadius: 12, border: `1px solid ${T.errorBorder}`, background: T.errorBg, padding: "11px 14px", fontSize: 13, color: T.errorText, fontWeight: 700 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ marginBottom: 16, borderRadius: 12, border: `1px solid ${T.successBorder}`, background: T.successBg, padding: "11px 14px", fontSize: 13, color: T.successText, fontWeight: 700 }}>
              {success}
            </div>
          )}

          {mode === "request" ? (
            <form onSubmit={handleRequest} style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@shop.com"
                  style={inputStyle}
                />
              </div>
              <button type="submit" disabled={loading} style={submitStyle}>
                {loading ? <LoaderCircle size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
                Send Reset Link
              </button>
            </form>
          ) : (
            <form onSubmit={handleSet} style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={labelStyle}>New password</label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Minimum 8 characters"
                    style={{ ...inputStyle, paddingRight: 44 }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeBtn}>
                    {showPassword ? <EyeOff size={16} color={T.textMuted} /> : <Eye size={16} color={T.textMuted} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Confirm password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  placeholder="Repeat your password"
                  style={inputStyle}
                />
              </div>
              <button type="submit" disabled={loading} style={submitStyle}>
                {loading ? <LoaderCircle size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
                Update Password
              </button>
            </form>
          )}

          <div style={{ marginTop: 18, textAlign: "center", fontSize: 12, color: T.textMuted }}>
            <a href="/login" style={{ color: T.blue, textDecoration: "none", fontWeight: 700 }}>Back to login</a>
          </div>
        </div>
      </div>
      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 800,
  color: "rgba(180,200,222,0.70)",
  marginBottom: 7,
  letterSpacing: "0.04em",
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: 46,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.10)",
  background: "rgba(255,255,255,0.06)",
  color: "#f0f5fc",
  fontSize: 14,
  fontWeight: 600,
  padding: "0 14px",
  outline: "none",
  boxSizing: "border-box",
};

const submitStyle: CSSProperties = {
  width: "100%",
  height: 48,
  borderRadius: 13,
  border: "1px solid rgba(47,107,255,0.40)",
  background: "linear-gradient(180deg, #2f6bff 0%, #2158e8 100%)",
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 900,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 9,
  boxShadow: "0 8px 24px rgba(47,107,255,0.22)",
};

const eyeBtn: CSSProperties = {
  position: "absolute",
  right: 12,
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  display: "flex",
  alignItems: "center",
};
