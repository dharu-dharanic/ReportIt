import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllIssues } from '../services/api';
import Navbar from '../components/Navbar';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('myissues');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data } = await getAllIssues();
      // Filter issues reported by this citizen
      const myIssues = data.filter(
        issue => issue.reporter?._id === user?.id ||
                 issue.reporter === user?.id
      );
      setIssues(myIssues);
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === 'resolved') return 'bg-green-100 text-green-600';
    if (status === 'in-progress') return 'bg-blue-100 text-blue-600';
    if (status === 'assigned') return 'bg-yellow-100 text-yellow-600';
    return 'bg-gray-100 text-gray-600';
  };

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return 'bg-red-100 text-red-600';
    if (severity === 'moderate') return 'bg-yellow-100 text-yellow-600';
    return 'bg-green-100 text-green-600';
  };

  const getBadgeColor = (badge) => {
    if (badge === 'gold') return 'bg-yellow-400 text-white';
    if (badge === 'silver') return 'bg-gray-400 text-white';
    return 'bg-orange-400 text-white';
  };

  // Stats
  const totalReported = issues.length;
  const resolved = issues.filter(i => i.status === 'resolved').length;
  const inProgress = issues.filter(i => i.status === 'in-progress' || i.status === 'assigned').length;
  const pending = issues.filter(i => i.status === 'reported').length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-blue-600 text-xl">Loading...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-red-600 text-xl">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">

        {/* Welcome + Badge */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.name} 👋
          </h2>
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-lg shadow text-sm">
              ⭐ Reputation: <span className="font-bold text-blue-600">
                {user?.reputationScore || 0}
              </span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getBadgeColor(user?.badge)}`}>
              {user?.badge || 'bronze'} 🏅
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-blue-600">
              {totalReported}
            </h3>
            <p className="text-gray-600 text-sm">Total Reported</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-yellow-500">
              {pending}
            </h3>
            <p className="text-gray-600 text-sm">Pending</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-blue-500">
              {inProgress}
            </h3>
            <p className="text-gray-600 text-sm">In Progress</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-green-600">
              {resolved}
            </h3>
            <p className="text-gray-600 text-sm">Resolved</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['myissues', 'notifications'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'myissues' ? 'My Issues' : 'Notifications'}
            </button>
          ))}
        </div>

        {/* My Issues Tab */}
        {activeTab === 'myissues' && (
          <div>
            {issues.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <p className="text-gray-500 mb-4">
                  You haven't reported any issues yet.
                </p>
                <button
                  onClick={() => navigate('/report')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Report Your First Issue
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {issues.map(issue => (
                  <div
                    key={issue._id}
                    className="bg-white p-5 rounded-lg shadow hover:shadow-md transition cursor-pointer"
                    onClick={() => navigate(`/issues/${issue._id}`)}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-800">
                        {issue.title}
                      </h3>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-2">
                      {issue.description.substring(0, 100)}...
                    </p>

                    {/* Footer */}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>📍 {issue.location.address.substring(0, 50)}...</span>
                      <div className="flex gap-3">
                        <span>👍 {issue.upvoteCount}</span>
                        <span>
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Resolution Images */}
                    {issue.resolutionImages?.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-green-600 font-medium mb-2">
                          ✅ Resolution Proof Available
                        </p>
                        <div className="flex gap-2">
                          {issue.resolutionImages.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt="resolution"
                              className="w-16 h-16 object-cover rounded"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-500 text-center">
              No notifications yet.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default CitizenDashboard;