import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp]         = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !phone) { setError('Please fill in your name and phone number.'); return; }
    setLoading(true);
    setError('');
    try {
      await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone, name }),
      });
      setOtpSent(true);
    } catch {
      setError('Could not send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone, otp }),
      });
      if (!res.ok) { setError('Invalid OTP. Please try again.'); return; }
      const data = await res.json();

      localStorage.setItem('swavalambi_user_id', data.user_id || phone);
      localStorage.setItem('swavalambi_name', data.name || name);

      navigate('/assistant');
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header gradient */}
      <header className="pt-12 pb-12 px-6 text-center text-white bg-gradient-to-b from-primary to-orange-100">
        <h1 className="text-3xl font-bold tracking-tight">Swavalambi 🇮🇳</h1>
        <p className="text-sm opacity-90 mt-1">Skills to Self-Reliance</p>
      </header>

      <section className="flex-1 bg-white px-6 pt-6 rounded-t-3xl -mt-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800">
          {otpSent ? 'Verify Phone' : 'Create Account'}
        </h2>
        <p className="text-gray-500 text-sm mt-0.5">
          {otpSent ? `OTP sent to ${phone} (hint: 123456)` : 'Join our community of skilled professionals'}
        </p>

        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-xl">{error}</div>
        )}

        {!otpSent ? (
          <form className="space-y-4 mt-5" onSubmit={handleSendOtp}>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
              <input
                className="w-full px-4 py-3 border rounded-xl outline-none border-transparent bg-gray-50 text-gray-800 focus:ring-2 focus:ring-primary"
                placeholder="Enter your full name"
                required type="text"
                value={name} onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">+91</span>
                <input
                  className="w-full pl-14 pr-4 py-3 border rounded-xl outline-none border-transparent bg-gray-50 text-gray-800 focus:ring-2 focus:ring-primary"
                  pattern="[0-9]{10}" placeholder="00000 00000"
                  required type="tel"
                  value={phone} onChange={e => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit" disabled={loading}
                className="bg-primary hover:bg-primary-dark text-white w-full py-4 rounded-xl font-bold text-lg shadow-md active:scale-[0.98] transition-all disabled:opacity-60"
              >
                {loading ? 'Sending OTP…' : 'Get Started →'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 mt-5">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">OTP Code</label>
              <input
                className="w-full px-4 py-3 border rounded-xl outline-none border-transparent bg-gray-50 text-gray-800 text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-primary"
                maxLength={6} placeholder="• • • • • •"
                value={otp} onChange={e => setOtp(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
              />
            </div>
            <button
              onClick={handleVerifyOtp} disabled={loading}
              className="bg-primary hover:bg-primary-dark text-white w-full py-4 rounded-xl font-bold text-lg shadow-md active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {loading ? 'Verifying…' : 'Verify & Continue →'}
            </button>
            <button onClick={() => { setOtpSent(false); setOtp(''); setError(''); }}
              className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-semibold">
              ← Back
            </button>
          </div>
        )}

        <footer className="text-center mt-6 pb-10">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">Log In</Link>
          </p>
        </footer>
      </section>
    </div>
  );
}
