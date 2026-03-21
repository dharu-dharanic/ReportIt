import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllIssues } from '../services/api';
import Navbar from '../components/Navbar';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    active: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getAllIssues();
      const total = data.length;
      const resolved = data.filter(i => i.status === 'resolved').length;
      setStats({
        total,
        resolved,
        active: total - resolved
      });
    } catch (err) {
      console.log(err);
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <Navbar />

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
          user.role === 'citizen' && (
            <button
              onClick={() => navigate('/report')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition"
            >
              Report an Issue
            </button>
          )
        ) : (
          <button
            onClick={() => navigate('/register')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition"
          >
            Get Started
          </button>
        )}
      </div>

      {/* Stats Section */}
      <div className="flex justify-center gap-8 px-8 pb-8">
        <div className="bg-white p-6 rounded-lg shadow text-center w-40 hover:shadow-md transition">
          <h3 className="text-3xl font-bold text-blue-600">
            {statsLoading ? '...' : stats.total}
          </h3>
          <p className="text-gray-600">Issues Reported</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center w-40 hover:shadow-md transition">
          <h3 className="text-3xl font-bold text-green-600">
            {statsLoading ? '...' : stats.resolved}
          </h3>
          <p className="text-gray-600">Issues Resolved</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center w-40 hover:shadow-md transition">
          <h3 className="text-3xl font-bold text-orange-500">
            {statsLoading ? '...' : stats.active}
          </h3>
          <p className="text-gray-600">Active Issues</p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-4xl mx-auto px-8 pb-8">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
          How It Works
        </h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow text-center hover:shadow-md transition">
            <div className="text-4xl mb-3">📸</div>
            <h4 className="font-bold text-gray-800 mb-2">Report</h4>
            <p className="text-gray-600 text-sm">
              Take a photo and report any civic issue in your area
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center hover:shadow-md transition">
            <div className="text-4xl mb-3">👍</div>
            <h4 className="font-bold text-gray-800 mb-2">Upvote</h4>
            <p className="text-gray-600 text-sm">
              Upvote issues to increase their priority for faster resolution
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow text-center hover:shadow-md transition">
            <div className="text-4xl mb-3">✅</div>
            <h4 className="font-bold text-gray-800 mb-2">Track</h4>
            <p className="text-gray-600 text-sm">
              Track the status of your reported issues in real time
            </p>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-4xl mx-auto px-8 pb-8">
        <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Issue Categories
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {[
            { icon: '🛣️', label: 'Road' },
            { icon: '🗑️', label: 'Garbage' },
            { icon: '💧', label: 'Water' },
            { icon: '⚡', label: 'Electricity' },
            { icon: '🔧', label: 'Other' }
          ].map(cat => (
            <div
              key={cat.label}
              onClick={() => navigate('/issues')}
              className="bg-white p-4 rounded-lg shadow text-center cursor-pointer hover:shadow-md hover:scale-105 transition-all"
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <p className="text-gray-600 text-sm">{cat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-blue-600 text-white text-center p-4 mt-4">
        <p>© {new Date().getFullYear()} ReportIt — Making Cities Better Together</p>
      </footer>

    </div>
  );
};

export default Home;