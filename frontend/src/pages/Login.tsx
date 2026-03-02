import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Phone, Mail, Lock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "http://localhost:8000/api";

/** Returns 'phone' if the value looks like a phone number, 'email' otherwise */
function detectInputType(value: string): "phone" | "email" {
  const cleaned = value.replace(/[\s\-()]/g, "");
  return /^[+\d]{7,}$/.test(cleaned) ? "phone" : "email";
}

function isValidIdentifier(value: string): boolean {
  const cleaned = value.trim();
  if (!cleaned) return false;
  const isPhone = /^[+\d\s\-()]{7,15}$/.test(cleaned);
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
  return isPhone || isEmail;
}

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authMethod, setAuthMethod] = useState<"otp" | "password">("otp");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const inputType = detectInputType(identifier);
  const isPhone = inputType === "phone";

  const handleSendOtp = async () => {
    if (!isValidIdentifier(identifier)) {
      setError("Please enter a valid phone number or email address.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isPhone ? { phone_number: identifier } : { email: identifier },
        ),
      });
      setOtpSent(true);
    } catch {
      setError("Could not send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isPhone
            ? { phone_number: identifier, otp }
            : { email: identifier, otp },
        ),
      });
      if (!res.ok) {
        setError("Invalid OTP. Please try again.");
        return;
      }
      const data = await res.json();
      localStorage.setItem("swavalambi_user_id", data.user_id || identifier);
      localStorage.setItem("swavalambi_name", data.name || "");
      navigate("/assistant");
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async () => {
    if (!isValidIdentifier(identifier) || !password.trim()) {
      setError("Please enter a valid identifier and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      if (!res.ok) {
        setError("Invalid credentials. Please try again.");
        return;
      }
      const data = await res.json();
      localStorage.setItem("swavalambi_user_id", data.user_id || identifier);
      localStorage.setItem("swavalambi_name", data.name || "");
      navigate("/assistant");
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center p-4 pb-2 justify-between">
        <div className="text-slate-900 flex size-12 shrink-0 items-center justify-start">
          <ArrowLeft
            size={24}
            onClick={() => navigate(-1)}
            className="cursor-pointer"
          />
        </div>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          Swavalambi
        </h2>
      </div>

      {/* Hero gradient banner */}
      <div
        className="mx-4 mt-2 rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #ff8c00 0%, #ffb347 60%, #ffe0b2 100%)",
        }}
      >
        <div className="p-6">
          <p className="text-white font-extrabold text-2xl leading-tight">
            Welcome to
            <br />
            Swavalambi
          </p>
          <p className="text-white/80 text-sm mt-2">
            AI-powered jobs, loans & skill upgrades for skilled India
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-slate-900 tracking-tight text-[28px] font-bold leading-tight text-center">
          {otpSent ? "Enter OTP" : "Sign In"}
        </h2>
        <p className="text-slate-600 text-base text-center mt-2">
          {otpSent
            ? `Code sent to ${identifier}`
            : "Use your phone number or email to sign in"}
        </p>
      </div>

      {error && (
        <div className="mx-6 mb-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-y-4 px-6 py-4 max-w-[480px] mx-auto w-full">
        {!otpSent ? (
          <>
            {/* Smart single field */}
            <label className="flex flex-col w-full">
              <p className="text-slate-700 text-sm font-semibold leading-normal pb-2">
                Phone Number or Email
              </p>
              <div className="relative">
                {/* Dynamic icon based on what user is typing */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  {identifier && isPhone ? (
                    <Phone size={18} />
                  ) : (
                    <Mail size={18} />
                  )}
                </div>
                <input
                  className="flex w-full rounded-xl text-slate-900 border border-slate-200 bg-slate-100/60 focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 placeholder:text-slate-400 pl-11 pr-4 text-base font-normal outline-none transition-all"
                  placeholder="e.g. +91 98765 43210 or name@email.com"
                  type="text"
                  inputMode="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  autoComplete="username"
                />
              </div>
              {/* Subtle type hint below input */}
              {identifier.length > 2 && (
                <p className="text-xs mt-1.5 flex items-center gap-1 text-slate-400">
                  {isPhone ? (
                    <>
                      <Phone size={11} /> Sending OTP via SMS
                    </>
                  ) : (
                    <>
                      <Mail size={11} /> Sending OTP via Email
                    </>
                  )}
                </p>
              )}
            </label>

            {authMethod === "password" && (
              <label className="flex flex-col w-full animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-slate-700 text-sm font-semibold leading-normal pb-2">
                  Password
                </p>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    className="flex w-full rounded-xl text-slate-900 border border-slate-200 bg-slate-100/60 focus:border-primary focus:ring-2 focus:ring-primary/20 h-14 placeholder:text-slate-400 pl-11 pr-4 text-base font-normal outline-none transition-all"
                    placeholder="Enter your password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handlePasswordLogin()}
                    autoComplete="current-password"
                  />
                </div>
              </label>
            )}

            <div className="pt-1 flex flex-col gap-3">
              <button
                onClick={authMethod === "otp" ? handleSendOtp : handlePasswordLogin}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex justify-center disabled:opacity-60"
              >
                {loading ? (authMethod === "otp" ? "Sending…" : "Signing in…") : (authMethod === "otp" ? "Send OTP →" : "Sign In →")}
              </button>

              <button
                onClick={() => setAuthMethod(authMethod === "otp" ? "password" : "otp")}
                className="text-center text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
              >
                {authMethod === "otp" ? "Use password instead" : "Use OTP instead"}
              </button>
            </div>

            <p className="text-center text-slate-500 text-sm">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary font-bold hover:underline"
              >
                Register
              </Link>
            </p>

            {/* Quick skip for demo */}
            <button
              onClick={() => {
                localStorage.setItem("swavalambi_user_id", "demo");
                localStorage.setItem("swavalambi_name", "Demo User");
                navigate("/assistant");
              }}
              className="text-center text-slate-400 text-xs underline"
            >
              Skip login (demo mode)
            </button>
          </>
        ) : (
          <>
            <label className="flex flex-col w-full">
              <p className="text-slate-700 text-sm font-semibold leading-normal pb-2">
                OTP Code
              </p>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  className="flex w-full rounded-xl text-slate-900 border border-slate-200 bg-slate-100/60 focus:border-primary focus:ring-2 focus:ring-primary/20 text-center tracking-widest h-14 placeholder:text-slate-400 pl-11 pr-4 text-2xl font-bold outline-none"
                  placeholder="• • • • • •"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                />
              </div>
              <p className="text-xs text-slate-400 text-center mt-1.5">
                Hint: mock OTP is <strong>123456</strong>
              </p>
            </label>

            <div className="pt-1 flex flex-col gap-3">
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex justify-center disabled:opacity-60"
              >
                {loading ? "Verifying…" : "Verify & Login →"}
              </button>
              <button
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                  setError("");
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-all flex justify-center"
              >
                ← Change {isPhone ? "Phone" : "Email"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
