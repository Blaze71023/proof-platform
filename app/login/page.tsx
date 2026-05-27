"use client";

import { CSSProperties, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { Shield, Eye, EyeOff, LoaderCircle } from "lucide-react";

const THEME = {
  page: "linear-gradient(180deg, #0d1a2b 0%, #0f1f33 42%, #0b1827 100%)",
  card: "linear-gradient(180deg, rgba(20,33,50,0.98) 0%, rgba(14,25,40,0.99) 100%)",
  panel: "linear-gradient(180deg, rgba(28,44,64,0.72) 0%, rgba(20,34,52,0.82) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderAccent: "1px solid rgba(47,107,255,0.36)",
  text: "#f0f5fc",
  textSoft: "rgba(210,225,242,0.78)",
  textMuted: "rgba(180,200,222,0.58)",
  blue: "#2f6bff",
  blueGlow: "rgba(47,107,255,0.22)",
  buttonBlue: "linear-gradient(180deg, #2f6bff 0%, #2158e8 100%)",
  inputBg: "rgba(255,255,255,0.06)",
  errorBg: "rgba(220,38,38,0.12)",
  errorBorder: "rgba(220,38,38,0.32)",
  errorText: "#fb7185",
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Supabase is not configured. Check environment variables.");
      setLoading(false);
      return;
    }

    if (mode === "signup") {
      const { error: signupError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (signupError) {
        setError(signupError.message);
      } else {
        setSuccessMessage("Account created. Check your email to confirm, then sign in.");
        setMode("login");
      }
    } else {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (loginError) {
        setError(loginError.message);
      } else {
        router.push("/shopproof/dashboard");
      }
    }

    setLoading(false);
  }

  return (
    <main style={pageStyle}>
      <div style={innerStyle}>
        <div style={logoRowStyle}>
          <div style={logoIconStyle}>
            <Shield size={22} color={THEME.blue} />
          </div>
          <div>
            <div style={brandStyle}>ShopPROOF</div>
            <div style={taglineStyle}>Evidence-based repair documentation</div>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h1 style={cardTitleStyle}>
              {mode === "login" ? "Sign in to ShopPROOF" : "Create your account"}
            </h1>
            <p style={cardSubtitleStyle}>
              {mode === "login"
                ? "Access your shop's documentation dashboard."
                : "Get started with evidence-based repair documentation."}
            </p>
          </div>

          {successMessage ? (
            <div style={successBoxStyle}>{successMessage}</div>
          ) : null}

          {error ? (
            <div style={errorBoxStyle}>{error}</div>
          ) : null}

          <form onSubmit={handleSubmit} style={formStyle}>
            <label style={fieldStyle}>
              <span style={labelStyle}>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="your@email.com"
                style={inputStyle}
                autoComplete="email"
              />
            </label>

            <label style={fieldStyle}>
              <span style={labelStyle}>Password</span>
              <div style={passwordWrapStyle}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder={mode === "signup" ? "Create a strong password" : "Your password"}
                  style={{ ...inputStyle, paddingRight: 48 }}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={eyeButtonStyle}
                  tabIndex={-1}
                >
                  {showPassword
                    ? <EyeOff size={16} color={THEME.textMuted} />
                    : <Eye size={16} color={THEME.textMuted} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...submitButtonStyle,
                opacity: loading ? 0.72 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading
                ? <><LoaderCircle size={16} className="spin" /> {mode === "login" ? "Signing in..." : "Creating account..."}</>
                : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div style={switchRowStyle}>
            <span style={switchTextStyle}>
              {mode === "login" ? "Need an account?" : "Already have an account?"}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
                setSuccessMessage("");
              }}
              style={switchButtonStyle}
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </div>
        </div>

        <p style={footerTextStyle}>
          ShopPROOF by ZeroHour Systems — Documentation infrastructure for repair operations.
        </p>
      </div>

      <style jsx global>{`
        .spin {
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: ${THEME.textMuted};
        }
        input {
          font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  backgroundImage: THEME.page,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif",
  color: THEME.text,
};

const innerStyle: CSSProperties = {
  width: "100%",
  maxWidth: 440,
  display: "grid",
  gap: 24,
};

const logoRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 14,
  justifyContent: "center",
};

const logoIconStyle: CSSProperties = {
  width: 46,
  height: 46,
  borderRadius: 14,
  background: "rgba(47,107,255,0.12)",
  border: "1px solid rgba(47,107,255,0.28)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: `0 0 24px ${THEME.blueGlow}`,
};

const brandStyle: CSSProperties = {
  fontSize: 22,
  fontWeight: 950,
  letterSpacing: "-0.04em",
  color: THEME.text,
};

const taglineStyle: CSSProperties = {
  fontSize: 12,
  color: THEME.textMuted,
  fontWeight: 700,
  marginTop: 1,
};

const cardStyle: CSSProperties = {
  borderRadius: 24,
  background: THEME.card,
  border: THEME.border,
  boxShadow: "0 32px 80px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.06)",
  padding: "28px 26px 24px",
  display: "grid",
  gap: 20,
};

const cardHeaderStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 950,
  letterSpacing: "-0.04em",
  color: THEME.text,
};

const cardSubtitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 13,
  color: THEME.textSoft,
  lineHeight: 1.5,
};

const errorBoxStyle: CSSProperties = {
  borderRadius: 12,
  background: THEME.errorBg,
  border: `1px solid ${THEME.errorBorder}`,
  color: THEME.errorText,
  fontSize: 13,
  fontWeight: 700,
  padding: "10px 12px",
  lineHeight: 1.5,
};

const successBoxStyle: CSSProperties = {
  borderRadius: 12,
  background: "rgba(5,150,105,0.12)",
  border: "1px solid rgba(5,150,105,0.28)",
  color: "#34d399",
  fontSize: 13,
  fontWeight: 700,
  padding: "10px 12px",
  lineHeight: 1.5,
};

const formStyle: CSSProperties = {
  display: "grid",
  gap: 16,
};

const fieldStyle: CSSProperties = {
  display: "grid",
  gap: 8,
};

const labelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: THEME.textMuted,
};

const inputStyle: CSSProperties = {
  width: "100%",
  height: 48,
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.10)",
  background: THEME.inputBg,
  color: THEME.text,
  fontSize: 14,
  fontWeight: 700,
  padding: "0 14px",
  outline: "none",
  boxSizing: "border-box",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
};

const passwordWrapStyle: CSSProperties = {
  position: "relative",
};

const eyeButtonStyle: CSSProperties = {
  position: "absolute",
  right: 14,
  top: "50%",
  transform: "translateY(-50%)",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  display: "flex",
  alignItems: "center",
};

const submitButtonStyle: CSSProperties = {
  width: "100%",
  height: 52,
  borderRadius: 14,
  border: "1px solid rgba(47,107,255,0.44)",
  background: THEME.buttonBlue,
  color: "#f8fbff",
  fontSize: 15,
  fontWeight: 900,
  letterSpacing: "-0.01em",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  boxShadow: `0 16px 36px ${THEME.blueGlow}`,
};

const switchRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
};

const switchTextStyle: CSSProperties = {
  fontSize: 13,
  color: THEME.textMuted,
  fontWeight: 700,
};

const switchButtonStyle: CSSProperties = {
  background: "none",
  border: "none",
  color: THEME.blue,
  fontSize: 13,
  fontWeight: 900,
  cursor: "pointer",
  padding: 0,
};

const footerTextStyle: CSSProperties = {
  textAlign: "center",
  fontSize: 11,
  color: "rgba(180,200,222,0.38)",
  fontWeight: 700,
  margin: 0,
  lineHeight: 1.5,
};
