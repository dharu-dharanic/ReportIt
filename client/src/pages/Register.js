
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerAPI } from '../services/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await registerAPI({ name, email, password, role });
      if (data.status === 'pending') {
        navigate('/pending');
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Left Side — Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green-600 to-green-700 text-white flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="bg-white text-green-600 w-9 h-9 rounded-lg flex items-center justify-center font-bold">
            R
          </div>
          <span className="text-white font-bold text-xl">ReportIt</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Join the Movement
            <span className="block text-green-200">
              For Better Cities
            </span>
          </h1>
          <p className="text-green-100 text-lg mb-8">
            Be part of a growing community of citizens making their cities cleaner, safer and better.
          </p>

          {/* Benefits */}
          <div className="space-y-3">
            {[
              '📸 Report issues with photos and GPS',
              '🗺️ View issues on interactive map',
              '🔔 Get real-time updates on your reports',
              '👍 Upvote issues that matter to you',
              '🏅 Earn reputation for active reporting'
            ].map(benefit => (
              <div key={benefit} className="flex items-center gap-3 bg-green-500 bg-opacity-30 rounded-lg px-4 py-2.5">
                <span className="text-sm text-green-100">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-green-300 text-sm">
          © {new Date().getFullYear()} ReportIt — Civic Issue Reporting Platform
        </p>
      </div>

      {/* Right Side — Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="bg-green-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm">
              R
            </div>
            <span className="text-gray-800 font-bold text-lg">
              Report<span className="text-green-600">It</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Create your account
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Join ReportIt and start making a difference
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition"
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition pr-10"
                  placeholder="Create a password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('citizen')}
                  className={`p-4 rounded-xl border text-left transition ${
                    role === 'citizen'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">👤</div>
                  <p className="font-medium text-sm text-gray-800">Citizen</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Report and track issues
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  className={`p-4 rounded-xl border text-left transition ${
                    role === 'worker'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">👷</div>
                  <p className="font-medium text-sm text-gray-800">
                    Municipality Worker
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Resolve civic issues
                  </p>
                </button>
              </div>
              {role === 'worker' && (
                <p className="text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 mt-2">
                  ⏳ Worker accounts require admin approval before login
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

          </form>

          {/* Login Link */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-green-600 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Register;