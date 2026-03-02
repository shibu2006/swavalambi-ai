import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Phone, Mail, Lock } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "http://localhost:8000/api";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address."); return;
    }
    if (!password.trim() || password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }
    
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          password, 
          name,
          phone_number: phone || undefined 
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) { 
        setError(data.detail || "Registration failed. Please try again."); 
        return; 
      }
      
      // Cognito sends verification email automatically
      setNeedsVerification(true);
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) { setError("Please enter the verification code."); return; }
    
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/verify-email?email=${encodeURIComponent(email)}&code=${encodeURIComponent(verificationCode)}`, {
        method: "POST",
      });
      
      if (!res.ok) { 
        const data = await res.json();
        setError(data.detail || "Invalid verification code. Please try again."); 
        return; 
      }
      
      // Email verified successfully, now redirect to login
      alert("Email verified successfully! Please login with your credentials.");
      navigate("/login");
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header gradient */}
      <header
        className="pt-12 pb-14 px-6 text-center text-white"
        style={{ background: "linear-gradient(135deg, #ff8c00 0%, #ffb347 80%, #ffe0b2 100%)" }}
      >
        <h1 className="text-3xl font-extrabold tracking-tight">Swavalambi</h1>
        <p className="text-sm text-white/80 mt-1">Skills to Self-Reliance</p>
      </header>

      <section className="flex-1 bg-white px-6 pt-6 rounded-t-3xl -mt-6 overflow-y-auto shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        {/* Title */}
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-gray-800">
            {needsVerification ? "Verify Email" : "Create Account"}
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {needsVerification
              ? `Verification code sent to ${email}`
              : "Join our community of skilled professionals"}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">
            {error}
          </div>
        )}

        {!needsVerification ? (
          <form className="space-y-4" onSubmit={handleRegister}>
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Full Name <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-10 pr-4 py-3 border border-transparent rounded-xl outline-none bg-gray-50 text-gray-800 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="Enter your full name"
                  required type="text"
                  value={name} onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Email Address <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-10 pr-4 py-3 border border-transparent rounded-xl outline-none bg-gray-50 text-gray-800 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="you@example.com"
                  required type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <p className="text-[11px] text-gray-400 pl-1">Verification code will be sent here</p>
            </div>

            {/* Mobile Number (Optional) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Mobile Number (Optional)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm select-none">
                  +91
                </span>
                <input
                  className="w-full pl-12 pr-4 py-3 border border-transparent rounded-xl outline-none bg-gray-50 text-gray-800 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  pattern="[0-9]{10}"
                  placeholder="98765 43210"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Create Password <span className="text-primary">*</span>
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-10 pr-4 py-3 border border-transparent rounded-xl outline-none bg-gray-50 text-gray-800 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  placeholder="At least 8 characters"
                  required type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <p className="text-[11px] text-gray-400 pl-1">Must be at least 8 characters</p>
            </div>

            <div className="pt-2">
              <button
                type="submit" disabled={loading}
                className="bg-primary hover:bg-primary-dark text-white w-full py-4 rounded-xl font-bold text-lg shadow-md active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {loading ? "Creating Account…" : "Create Account →"}
              </button>
            </div>
          </form>
        ) : (
          <form className="space-y-4" onSubmit={handleVerifyEmail}>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Verification Code
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  className="w-full pl-10 pr-4 py-3 border border-transparent rounded-xl outline-none bg-gray-50 text-gray-800 text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  maxLength={6}
                  placeholder="• • • • • •"
                  inputMode="numeric"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400 pl-1 text-center">Check your email for the 6-digit code</p>
            </div>
            <button
              type="submit" disabled={loading}
              className="bg-primary hover:bg-primary-dark text-white w-full py-4 rounded-xl font-bold text-lg shadow-md active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? "Verifying…" : "Verify & Continue →"}
            </button>
            <button
              type="button"
              onClick={() => { setNeedsVerification(false); setVerificationCode(""); setError(""); }}
              className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              ← Back
            </button>
          </form>
        )}

        <footer className="text-center mt-6 pb-10">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Log In
            </Link>
          </p>
        </footer>
      </section>
    </div>
  );
}
