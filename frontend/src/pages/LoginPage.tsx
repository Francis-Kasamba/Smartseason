import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Sprout,
  Leaf,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const STAGE_PILLS = [
  { label: 'Sowing', dot: '#34d399' },
  { label: 'Nurturing', dot: '#6ee7b7' },
  { label: 'Blooming', dot: '#facc15' },
  { label: 'Harvesting', dot: '#a3e635' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return setError('Email address is required.');
    if (!password.trim()) return setError('Password is required.');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/agent/dashboard');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col relative overflow-hidden"
        style={{ backgroundColor: '#2a3d2a' }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,

            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 flex items-center gap-3 p-8">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
          >
            <Sprout size={18} className="text-green-300" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none tracking-wide">SmartSeason</p>
            <p
              className="text-xs tracking-widest uppercase mt-0.5"
              style={{ color: 'rgba(255,255,255,0.45)', fontSize: '9px' }}
            >
              Field Monitoring
            </p>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center px-10 xl:px-14">
          <div className="mb-6">
            <h1
              className="text-white leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.4rem, 4vw, 3.2rem)' }}
            >
              Empower your farm,
            </h1>
            <h1
              className="leading-tight"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 'clamp(2.4rem, 4vw, 3.2rem)',
                color: '#86efac',
                fontStyle: 'italic',
              }}
            >
              grow sustainably.
            </h1>
            <h1
              className="text-white leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 'clamp(2.4rem, 4vw, 3.2rem)' }}
            >
              Your future, nurtured.
            </h1>
          </div>

          <p
            className="text-sm leading-relaxed mb-8 max-w-xs"
            style={{ color: 'rgba(255,255,255,0.5)', fontFamily: "'DM Sans', sans-serif" }}
          >
            Discover the power of precision farming. Optimize resources, reduce waste, and achieve your sustainability goals with SmartSeason.
          </p>

          <div className="flex flex-wrap gap-2">
            {STAGE_PILLS.map(({ label, dot }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-white"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: dot }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        <div
          className="relative z-10 flex items-center gap-0 px-10 xl:px-14 py-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-white text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Join thousands of farmers who trust SmartSeason to revolutionize their agricultural practices.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative"
        style={{ backgroundColor: '#f4efe6' }}
      >
        <div className="absolute top-8 flex flex-col items-center gap-1">
          <div className="flex items-end gap-0.5">
            <Leaf size={20} style={{ color: '#2d5a2d', transform: 'rotate(-20deg) translateY(2px)' }} />
            <Leaf size={26} style={{ color: '#3a7a3a' }} />
            <Leaf size={20} style={{ color: '#2d5a2d', transform: 'rotate(20deg) translateY(2px)' }} />
          </div>
          <span
            className="text-xs tracking-widest uppercase font-semibold"
            style={{ color: '#2d5a2d', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.18em' }}
          >
            Shamba Records
          </span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h2
              className="text-gray-900 mb-1.5"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 }}
            >
              Welcome back
            </h2>
            <p
              className="text-sm"
              style={{ color: '#6b7280', fontFamily: "'DM Sans', sans-serif" }}
            >
              Sign in to your SmartSeason account
            </p>
          </div>

          {error && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-5 text-sm"
              style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                color: '#dc2626',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold tracking-widest uppercase mb-1.5"
                style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.1em' }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#9ca3af' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                  style={{
                    backgroundColor: '#fff',
                    border: '1.5px solid #e0d9ce',
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#111827',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#4a7c4a')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e0d9ce')}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-xs font-semibold tracking-widest uppercase mb-1.5"
                style={{ color: '#374151', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.1em' }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#9ca3af' }}
                />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg text-sm outline-none transition-all"
                  style={{
                    backgroundColor: '#fff',
                    border: '1.5px solid #e0d9ce',
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#111827',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = '#4a7c4a')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = '#e0d9ce')}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#9ca3af' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#4a7c4a')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  className="text-xs transition-colors"
                  style={{ color: '#4a7c4a', fontFamily: "'DM Sans', sans-serif" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#2d5a2d')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#4a7c4a')}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-sm font-semibold text-white transition-all mt-2"
              style={{
                backgroundColor: loading ? '#2d5a2d' : '#1c2b1c',
                fontFamily: "'DM Sans', sans-serif",
                letterSpacing: '0.02em',
                opacity: loading ? 0.8 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#2d5a2d';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#1c2b1c';
              }}
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p
            className="text-center text-xs mt-8"
            style={{ color: '#9ca3af', fontFamily: "'DM Sans', sans-serif" }}
          >
            Demo: <span style={{ color: '#6b7280' }}>admin@smartseason.com</span>
            {' '}·{' '}
            <span style={{ color: '#6b7280' }}>agent@smartseason.com</span>
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;1,700&family=DM+Sans:wght@400;500;600&display=swap');
      `}</style>
    </div>
  );
}
