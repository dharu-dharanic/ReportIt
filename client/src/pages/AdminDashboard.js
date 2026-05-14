import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllIssues, updateStatus, deleteIssue } from '../services/api';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('issues');
  const [issues, setIssues] = useState([]);
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchIssue, setSearchIssue] = useState('');

  useEffect(() => {
    fetchData();

    const socket = io(SOCKET_URL);

    socket.on('issueEscalated', ({ issueId, title, severity, message }) => {
      setNotifications(prev => [{
        id: Date.now(),
        message,
        title,
        severity,
        time: new Date().toLocaleTimeString(),
        read: false,
        type: 'escalated'
      }, ...prev]);
      setIssues(prev =>
        prev.map(issue =>
          issue._id === issueId ? { ...issue, severity } : issue
        )
      );
    });

    socket.on('newIssue', (issue) => {
      setIssues(prev => [issue, ...prev]);
      setNotifications(prev => [{
        id: Date.now(),
        message: `New issue reported: ${issue.title}`,
        time: new Date().toLocaleTimeString(),
        read: false,
        type: 'new'
      }, ...prev]);
    });

    socket.on('issueStatusChanged', ({ issueId, status }) => {
      setIssues(prev =>
        prev.map(issue =>
          issue._id === issueId ? { ...issue, status } : issue
        )
      );
    });

    return () => socket.disconnect();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [issuesRes, pendingRes, usersRes] = await Promise.all([
        getAllIssues(),
        axios.get('http://localhost:5000/api/auth/pending-workers', { headers }),
        axios.get('http://localhost:5000/api/auth/users', { headers })
      ]);

      setIssues(issuesRes.data);
      setPendingWorkers(pendingRes.data);
      setAllUsers(usersRes.data);
      setWorkers(usersRes.data.filter(u => u.role === 'worker' && u.status === 'active'));
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/auth/approve/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingWorkers(prev => prev.filter(w => w._id !== id));
      alert('Worker approved successfully');
    } catch (err) {
      alert('Failed to approve worker');
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/auth/reject/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPendingWorkers(prev => prev.filter(w => w._id !== id));
      alert('Worker rejected');
    } catch (err) {
      alert('Failed to reject worker');
    }
  };

  const handleAssign = async (issueId, workerId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/issues/${issueId}/assign`,
        { workerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchData();
      alert('Issue assigned successfully');
    } catch (err) {
      alert('Failed to assign issue');
    }
  };

  const handleStatusUpdate = async (issueId, status) => {
    try {
      await updateStatus(issueId, { status });
      fetchData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;
    try {
      await deleteIssue(issueId);
      setIssues(prev => prev.filter(i => i._id !== issueId));
    } catch (err) {
      alert('Failed to delete issue');
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

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return 'bg-red-100 text-red-600';
    if (severity === 'moderate') return 'bg-yellow-100 text-yellow-600';
    return 'bg-green-100 text-green-600';
  };

  const categoryIcons = {
    road: '🛣️', garbage: '🗑️',
    water: '💧', electricity: '⚡', other: '🔧'
  };

  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => i.status === 'resolved').length;
  const pendingIssues = issues.filter(i => i.status === 'reported').length;
  const inProgressIssues = issues.filter(i => i.status === 'in-progress').length;

  const filteredIssues = issues.filter(issue =>
    searchIssue === '' ||
    issue.title.toLowerCase().includes(searchIssue.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-3">⏳</div>
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-5xl mb-3">😕</div>
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-200 text-sm mb-1">Admin Dashboard</p>
              <h2 className="text-2xl font-bold">{user?.name} 👋</h2>
              <p className="text-green-200 text-sm mt-1">
                Managing civic issues across the city
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Total', value: totalIssues, color: 'bg-green-500' },
                { label: 'Pending', value: pendingIssues, color: 'bg-yellow-500' },
                { label: 'Active', value: inProgressIssues, color: 'bg-blue-500' },
                { label: 'Resolved', value: resolvedIssues, color: 'bg-green-400' }
              ].map(stat => (
                <div
                  key={stat.label}
                  className="bg-green-500 bg-opacity-40 rounded-xl p-3 text-center min-w-16"
                >
                  <div className={`w-2 h-2 rounded-full ${stat.color} mx-auto mb-1`}></div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-green-200 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-4">

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'issues', label: '📋 Issues', count: totalIssues },
            { key: 'workers', label: '👷 Workers', count: pendingWorkers.length },
            { key: 'users', label: '👥 Users', count: allUsers.length },
            { key: 'notifications', label: '🔔 Alerts', count: unreadCount }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                activeTab === tab.key
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? 'bg-green-500 text-white'
                    : tab.key === 'workers' || tab.key === 'notifications'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div className="pb-8">

            {/* Search */}
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                value={searchIssue}
                onChange={(e) => setSearchIssue(e.target.value)}
                placeholder="Search issues..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500 bg-white"
              />
            </div>

            {filteredIssues.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-500">No issues found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIssues.map(issue => (
                  <div
                    key={issue._id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    {/* Issue Header */}
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                            {categoryIcons[issue.category]}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {issue.title}
                            </h3>
                            <p className="text-gray-400 text-xs mt-0.5 capitalize">
                              {issue.category} • {new Date(issue.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap justify-end">
                          {issue.escalated && (
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600">
                              ⚠️ Escalated
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(issue.severity)}`}>
                            {issue.severity}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(issue.status)}`}>
                            {issue.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-500 text-sm mb-3 line-clamp-2">
                        {issue.description}
                      </p>

                      <p className="text-gray-400 text-xs mb-4">
                        📍 {issue.location.address.substring(0, 60)}...
                      </p>

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap items-center pt-3 border-t border-gray-100">

                        {/* Assign */}
                        <select
                          onChange={(e) => handleAssign(issue._id, e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-green-500 bg-white"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            👷 Assign to worker
                          </option>
                          {workers.map(worker => (
                            <option key={worker._id} value={worker._id}>
                              {worker.name}
                            </option>
                          ))}
                        </select>

                        {/* Status */}
                        <select
                          onChange={(e) => handleStatusUpdate(issue._id, e.target.value)}
                          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-green-500 bg-white"
                          defaultValue={issue.status}
                        >
                          <option value="reported">Reported</option>
                          <option value="assigned">Assigned</option>
                          <option value="in-progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>

                        {/* View */}
                        <button
                          onClick={() => navigate(`/issues/${issue._id}`)}
                          className="bg-green-50 text-green-600 border border-green-200 px-3 py-1.5 rounded-lg text-sm hover:bg-green-100 transition font-medium"
                        >
                          View →
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(issue._id)}
                          className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-sm hover:bg-red-100 transition font-medium"
                        >
                          🗑️ Delete
                        </button>

                        {/* Upvotes */}
                        <span className="text-xs text-gray-400 ml-auto">
                          👍 {issue.upvoteCount} upvotes
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Workers Tab */}
        {activeTab === 'workers' && (
          <div className="pb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">
                Pending Approvals
              </h3>
              <span className="text-sm text-gray-400">
                {pendingWorkers.length} pending
              </span>
            </div>

            {pendingWorkers.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="text-5xl mb-4">✅</div>
                <p className="text-gray-700 font-medium mb-1">
                  All caught up!
                </p>
                <p className="text-gray-400 text-sm">
                  No pending worker approvals
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingWorkers.map(worker => (
                  <div
                    key={worker._id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center font-bold text-lg">
                          {worker.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {worker.name}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {worker.email}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                            <span className="text-xs text-yellow-600 font-medium">
                              Pending Approval
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(worker._id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition flex items-center gap-1"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleReject(worker._id)}
                          className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition flex items-center gap-1"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="pb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">All Users</h3>
              <span className="text-sm text-gray-400">
                {allUsers.length} total
              </span>
            </div>

            <div className="space-y-3">
              {allUsers.map(u => (
                <div
                  key={u._id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex justify-between items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                      u.role === 'admin' ? 'bg-red-500' :
                      u.role === 'worker' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{u.name}</p>
                      <p className="text-gray-400 text-xs">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                      u.role === 'admin'
                        ? 'bg-red-100 text-red-600'
                        : u.role === 'worker'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {u.role}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${
                      u.status === 'active'
                        ? 'bg-green-100 text-green-600'
                        : u.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {u.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="pb-8">
            {notifications.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="text-5xl mb-4">🔔</div>
                <p className="text-gray-700 font-medium mb-1">
                  No alerts yet
                </p>
                <p className="text-gray-400 text-sm">
                  You'll be notified when issues are escalated or new issues reported
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
                          : notification.type === 'escalated'
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">
                          {notification.type === 'escalated' ? '⚠️' : '🔔'}
                        </span>
                        <div>
                          <p className={`text-sm font-medium ${
                            notification.type === 'escalated'
                              ? 'text-orange-700'
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
                          notification.type === 'escalated'
                            ? 'bg-orange-500'
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

export default AdminDashboard;