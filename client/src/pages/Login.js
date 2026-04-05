// import { useState } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate, Link } from 'react-router-dom';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     try {
//       const data = await login(email, password);

//       // Redirect based on role
//       if (data.user.role === 'admin') {
//         navigate('/admin/dashboard');
//       } else if (data.user.role === 'worker') {
//         navigate('/worker/dashboard');
//       } else {
//         navigate('/');
//       }

//     } catch (err) {
//       setError(err.response?.data?.message || 'Invalid email or password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center">
//       <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">

//         <h2 className="text-2xl font-bold text-center text-blue-600 mb-6">
//           Login to ReportIt
//         </h2>

//         {error && (
//           <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
//               placeholder="Enter your email"
//               required
//             />
//           </div>

//           <div className="mb-6">
//             <label className="block text-gray-700 mb-2">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
//               placeholder="Enter your password"
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
//           >
//             {loading ? 'Logging in...' : 'Login'}
//           </button>
//         </form>

//         <p className="text-center text-gray-600 mt-4">
//           Don't have an account?{' '}
//           <Link to="/register" className="text-blue-600 hover:underline">
//             Register
//           </Link>
//         </p>

//       </div>
//     </div>
//   );
// };

// export default Login;



import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(email, password);
      if (data.user.role === 'admin') navigate('/admin/dashboard');
      else if (data.user.role === 'worker') navigate('/worker/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
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
          <span className="text-white font-bold text-xl">
            ReportIt
          </span>
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Making Indian Cities
            <span className="block text-green-200">Better Together</span>
          </h1>
          <p className="text-green-100 text-lg mb-8">
            Join thousands of citizens reporting and resolving civic issues across India.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { number: '10K+', label: 'Issues Reported' },
              { number: '8K+', label: 'Issues Resolved' },
              { number: '50K+', label: 'Active Citizens' }
            ].map(stat => (
              <div key={stat.label} className="bg-green-500 bg-opacity-50 rounded-xl p-4">
                <p className="text-2xl font-bold">{stat.number}</p>
                <p className="text-green-200 text-xs mt-1">{stat.label}</p>
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
            Welcome back
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Sign in to your ReportIt account
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

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
                  placeholder="Enter your password"
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

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

          </form>

          {/* Register Link */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-green-600 font-medium hover:underline"
            >
              Create one free
            </Link>
          </p>

        </div>
      </div>

    </div>
  );
};

export default Login;