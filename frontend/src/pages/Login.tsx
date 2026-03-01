import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const API_BASE = "http://localhost:8000/api";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSendOtp = async () => {
    if (!phone.trim() || !name.trim()) {
      setError("Please enter your name and phone number.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await fetch(`${API_BASE}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, name }),
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
      // 1. Verify OTP (also upserts user in DynamoDB via backend)
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone, otp }),
      });
      if (!res.ok) {
        setError("Invalid OTP. Please try again.");
        return;
      }
      const data = await res.json();

      // 2. Store user identity in localStorage
      localStorage.setItem("swavalambi_user_id", data.user_id || phone);
      localStorage.setItem("swavalambi_name", data.name || name);

      navigate("/assistant");
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center p-4 pb-2 justify-between">
        <div className="text-slate-900 flex size-12 shrink-0 items-center justify-start">
          <ArrowLeft size={24} onClick={() => navigate(-1)} className="cursor-pointer" />
        </div>
        <h2 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          Swavalambi
        </h2>
      </div>

      {/* Hero gradient banner */}
      <div className="mx-4 mt-2 rounded-2xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #ff8c00 0%, #ffb347 60%, #ffe0b2 100%)" }}>
        <div className="p-6">
          <p className="text-white font-extrabold text-2xl leading-tight">Welcome to<br />Swavalambi 🇮🇳</p>
          <p className="text-white/80 text-sm mt-2">AI-powered jobs, loans & skill upgrades for skilled India</p>
        </div>
      </div>

      {/* Form */}
      <div className="px-6 pt-6 pb-2">
        <h2 className="text-slate-900 tracking-tight text-[28px] font-bold leading-tight text-center">
          {otpSent ? "Enter OTP" : "Get Started"}
        </h2>
        <p className="text-slate-600 text-base text-center mt-2">
          {otpSent ? `Code sent to ${phone}` : "Sign in to access your personalized dashboard"}
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
            <label className="flex flex-col w-full">
              <p className="text-slate-700 text-sm font-semibold leading-normal pb-2">Full Name</p>
              <input
                className="flex w-full rounded-xl text-slate-900 border-none bg-slate-200/50 focus:ring-2 focus:ring-primary h-14 placeholder:text-slate-500 p-[15px] text-base font-normal"
                placeholder="Enter your name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="flex flex-col w-full">
              <p className="text-slate-700 text-sm font-semibold leading-normal pb-2">Phone Number</p>
              <input
                className="flex w-full rounded-xl text-slate-900 border-none bg-slate-200/50 focus:ring-2 focus:ring-primary h-14 placeholder:text-slate-500 p-[15px] text-base font-normal"
                placeholder="+91 Enter phone number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            <div className="pt-2">
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex justify-center disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send OTP"}
              </button>
            </div>
            {/* Quick skip for demo */}
            <button
              onClick={() => {
                localStorage.setItem("swavalambi_user_id", "demo");
                localStorage.setItem("swavalambi_name", name || "Demo User");
                navigate("/assistant");
              }}
              className="text-center text-slate-500 text-sm underline"
            >
              Skip login (demo mode)
            </button>
          </>
        ) : (
          <>
            <label className="flex flex-col w-full">
              <p className="text-slate-700 text-sm font-semibold leading-normal pb-2">OTP Code</p>
              <input
                className="flex w-full rounded-xl text-slate-900 border-none bg-slate-200/50 text-center tracking-widest focus:ring-2 focus:ring-primary h-14 placeholder:text-slate-500 p-[15px] text-2xl font-bold"
                placeholder="• • • • • •"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
              />
            </label>
            <p className="text-xs text-slate-500 text-center">Hint: mock OTP is <strong>123456</strong></p>
            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={handleVerifyOtp}
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex justify-center disabled:opacity-60"
              >
                {loading ? "Verifying…" : "Verify & Login"}
              </button>
              <button
                onClick={() => { setOtpSent(false); setOtp(""); setError(""); }}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-4 rounded-xl transition-all flex justify-center"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
