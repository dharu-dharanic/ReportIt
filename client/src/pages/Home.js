import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Navbar */}
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">ReportIt</h1>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span>Hello, {user.name}</span>
              <span className="bg-blue-800 px-2 py-1 rounded text-sm">
                {user.role}
              </span>
              <button
                onClick={handleLogout}
                className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-800 text-white px-3 py-1 rounded hover:bg-blue-900"
              >
                Register
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <h2 className="text-4xl font-bold text-blue-600 mb-4">
          Report Civic Issues in Your City
        </h2>
        <p className="text-gray-600 text-lg mb-8 max-w-xl">
          ReportIt helps citizens report and track civic issues like potholes, 
          garbage, water problems and more. Together we can make our city better.
        </p>
        {user ? (
          <button
            onClick={() => navigate('/report')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700"
          >
            Report an Issue
          </button>
        ) : (
          <button
            onClick={() => navigate('/register')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700"
          >
            Get Started
          </button>
        )}
      </div>

      {/* Stats Section */}
      <div className="flex justify-center gap-8 p-8">
        <div className="bg-white p-6 rounded-lg shadow text-center w-40">
          <h3 className="text-3xl font-bold text-blue-600">0</h3>
          <p className="text-gray-600">Issues Reported</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center w-40">
          <h3 className="text-3xl font-bold text-green-600">0</h3>
          <p className="text-gray-600">Issues Resolved</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center w-40">
          <h3 className="text-3xl font-bold text-purple-600">0</h3>
          <p className="text-gray-600">Active Users</p>
        </div>
      </div>

    </div>
  );
};

export default Home;