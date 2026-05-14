

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllIssues } from '../services/api';
import Navbar from '../components/Navbar';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

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

    const socket = io(SOCKET_URL);
    if (user?.id) socket.emit('join', user.id);

    socket.on('issueUpdated', ({ issueId, status, message }) => {
      setNotifications(prev => [{
        id: Date.now(),
        message,
        time: new Date().toLocaleTimeString(),
        read: false
      }, ...prev]);
      setIssues(prev =>
        prev.map(issue =>
          issue._id === issueId ? { ...issue, status } : issue
        )
      );
    });

    socket.on('issueResolved', ({ issueId, message }) => {
      setNotifications(prev => [{
        id: Date.now(),
        message,
        time: new Date().toLocaleTimeString(),
        read: false,
        type: 'resolved'
      }, ...prev]);
      setIssues(prev =>
        prev.map(issue =>
          issue._id === issueId
            ? { ...issue, status: 'resolved' }
            : issue
        )
      );
    });

    return () => socket.disconnect();
  }, [user]);

  const fetchData = async () => {
    try {
      const { data } = await getAllIssues();
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

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getStatusColor = (status) => {
    if (status === 'resolved') return 'bg-green-100 text-green-700';
    if (status === 'in-progress') return 'bg-blue-100 text-blue-700';
    if (status === 'assigned') return 'bg-yellow-100 text-yellow-700';
    return 'bg-gray-100 text-gray-600';
  };

  const getStatusDot = (status) => {
    if (status === 'resolved') return 'bg-green-500';
    if (status === 'in-progress') return 'bg-blue-500';
    if (status === 'assigned') return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return 'bg-red-100 text-red-600';
    if (severity === 'moderate') return 'bg-yellow-100 text-yellow-600';
    return 'bg-green-100 text-green-600';
  };

  const getBadgeInfo = (badge) => {
    if (badge === 'gold') return { color: 'bg-yellow-400 text-white', icon: '🥇' };
    if (badge === 'silver') return { color: 'bg-gray-400 text-white', icon: '🥈' };
    return { color: 'bg-orange-400 text-white', icon: '🥉' };
  };

  const categoryIcons = {
    road: '🛣️', garbage: '🗑️',
    water: '💧', electricity: '⚡', other: '🔧'
  };

  const totalReported = issues.length;
  const resolved = issues.filter(i => i.status === 'resolved').length;
  const inProgress = issues.filter(
    i => i.status === 'in-progress' || i.status === 'assigned'
  ).length;
  const pending = issues.filter(i => i.status === 'reported').length;
  const badgeInfo = getBadgeInfo(user?.badge);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-3">⏳</div>
        <p className="text-gray-500">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-200 text-sm mb-1">Welcome back</p>
              <h2 className="text-2xl font-bold">{user?.name} 👋</h2>
              <p className="text-green-200 text-sm mt-1">
                Thank you for making your city better
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-500 bg-opacity-50 px-4 py-2 rounded-xl text-center">
                <p className="text-2xl font-bold">{user?.reputationScore || 0}</p>
                <p className="text-green-200 text-xs">Reputation</p>
              </div>
              <div className={`${badgeInfo.color} px-3 py-2 rounded-xl text-center`}>
                <p className="text-xl">{badgeInfo.icon}</p>
                <p className="text-xs capitalize font-medium mt-0.5">
                  {user?.badge || 'bronze'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-4">

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Reported', value: totalReported, color: 'text-green-600', bg: 'bg-green-50', icon: '📋' },
            { label: 'Pending', value: pending, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '⏳' },
            { label: 'In Progress', value: inProgress, color: 'text-blue-600', bg: 'bg-blue-50', icon: '🔧' },
            { label: 'Resolved', value: resolved, color: 'text-green-600', bg: 'bg-green-50', icon: '✅' }
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-4 text-center border border-white shadow-sm`}>
              <div className="text-xl mb-1">{stat.icon}</div>
              <h3 className={`text-2xl font-bold ${stat.color}`}>{stat.value}</h3>
              <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Action */}
        <div className="bg-green-600 rounded-xl p-4 mb-6 flex justify-between items-center">
          <div>
            <p className="text-white font-medium">See something wrong?</p>
            <p className="text-green-200 text-sm">Report it and help fix your city</p>
          </div>
          <button
            onClick={() => navigate('/report')}
            className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-50 transition"
          >
            + Report Issue
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('myissues')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === 'myissues'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            📋 My Issues ({totalReported})
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
              activeTab === 'notifications'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            🔔 Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* My Issues Tab */}
        {activeTab === 'myissues' && (
          <div className="pb-8">
            {issues.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
                <div className="text-5xl mb-4">📭</div>
                <p className="text-gray-700 font-medium mb-1">
                  No issues reported yet
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Start making your city better by reporting your first issue
                </p>
                <button
                  onClick={() => navigate('/report')}
                  className="bg-green-600 text-white px-6 py-2.5 rounded-xl hover:bg-green-700 transition font-medium"
                >
                  Report Your First Issue
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {issues.map(issue => (
                  <div
                    key={issue._id}
                    className="bg-white rounded-xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-green-200 transition group shadow-sm"
                    onClick={() => navigate(`/issues/${issue._id}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                          {categoryIcons[issue.category]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition">
                            {issue.title}
                          </h3>
                          <p className="text-gray-400 text-xs mt-0.5 capitalize">
                            {issue.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(issue.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(issue.status)}`}></span>
                          {issue.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                      {issue.description}
                    </p>

                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>📍 {issue.location.address.substring(0, 45)}...</span>
                      <div className="flex gap-3">
                        <span>👍 {issue.upvoteCount}</span>
                        <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {issue.resolutionImages?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-green-600 font-medium mb-2 flex items-center gap-1">
                          ✅ Resolution proof submitted
                        </p>
                        <div className="flex gap-2">
                          {issue.resolutionImages.slice(0, 3).map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt="resolution"
                              className="w-14 h-14 object-cover rounded-lg"
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
          <div className="pb-8">
            {notifications.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
                <div className="text-5xl mb-4">🔔</div>
                <p className="text-gray-700 font-medium mb-1">
                  No notifications yet
                </p>
                <p className="text-gray-400 text-sm">
                  You'll be notified when your issues are updated
                </p>
              </div>
            ) : (
              <div>
                <div className="flex justify-end mb-3">
                  <button
                    onClick={markAllRead}
                    className="text-green-600 text-sm hover:underline font-medium"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="space-y-3">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-xl border flex justify-between items-start shadow-sm ${
                        notification.read
                          ? 'bg-white border-gray-100'
                          : notification.type === 'resolved'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">
                          {notification.type === 'resolved' ? '✅' : '🔔'}
                        </span>
                        <div>
                          <p className={`text-sm font-medium ${
                            notification.type === 'resolved'
                              ? 'text-green-700'
                              : 'text-gray-700'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                      {!notification.read && (
                        <span className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${
                          notification.type === 'resolved'
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                        }`}></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default CitizenDashboard;