
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllIssues, updateStatus } from '../services/api';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assigned');
  const [resolutionImages, setResolutionImages] = useState({});
  const [uploading, setUploading] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIssues();

    const socket = io(SOCKET_URL);
    if (user?.id) socket.emit('join', user.id);

    socket.on('issueAssigned', ({ issueId, message }) => {
      setNotifications(prev => [{
        id: Date.now(),
        message,
        time: new Date().toLocaleTimeString(),
        read: false
      }, ...prev]);
      fetchIssues();
    });

    return () => socket.disconnect();
  }, [user]);

  const fetchIssues = async () => {
    try {
      const { data } = await getAllIssues();
      const myIssues = data.filter(
        issue => issue.assignedTo?._id === user?.id ||
                 issue.assignedTo === user?.id
      );
      setIssues(myIssues);
    } catch (err) {
      setError('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (issueId, status) => {
    try {
      await updateStatus(issueId, { status });
      fetchIssues();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleResolutionUpload = async (issueId) => {
    setUploading(prev => ({ ...prev, [issueId]: true }));
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      const images = resolutionImages[issueId];
      if (images && images.length > 0) {
        images.forEach(img => formData.append('images', img));
      }
      await axios.put(
        `http://localhost:5000/api/issues/${issueId}/resolve`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      alert('Issue resolved successfully!');
      fetchIssues();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to resolve issue');
    } finally {
      setUploading(prev => ({ ...prev, [issueId]: false }));
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

  const assignedIssues = issues.filter(i => i.status === 'assigned');
  const inProgressIssues = issues.filter(i => i.status === 'in-progress');
  const resolvedIssues = issues.filter(i => i.status === 'resolved');

  const displayIssues = activeTab === 'assigned'
    ? assignedIssues
    : activeTab === 'in-progress'
    ? inProgressIssues
    : activeTab === 'resolved'
    ? resolvedIssues
    : [];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-3">⏳</div>
        <p className="text-gray-500">Loading your assignments...</p>
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
              <p className="text-green-200 text-sm mb-1">Worker Dashboard</p>
              <h2 className="text-2xl font-bold">{user?.name} 👷</h2>
              <p className="text-green-200 text-sm mt-1">
                Resolving civic issues for a better city
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Assigned', value: assignedIssues.length, color: 'bg-yellow-500' },
                { label: 'In Progress', value: inProgressIssues.length, color: 'bg-blue-500' },
                { label: 'Resolved', value: resolvedIssues.length, color: 'bg-green-500' }
              ].map(stat => (
                <div key={stat.label} className="bg-green-500 bg-opacity-40 rounded-xl p-3 text-center">
                  <div className={`w-2 h-2 rounded-full ${stat.color} mx-auto mb-1`}></div>
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-green-200 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-4">

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'assigned', label: '📋 Assigned', count: assignedIssues.length },
            { key: 'in-progress', label: '🔧 In Progress', count: inProgressIssues.length },
            { key: 'resolved', label: '✅ Resolved', count: resolvedIssues.length },
            { key: 'notifications', label: '🔔 Notifications', count: unreadCount }
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
                    : tab.key === 'notifications'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Issues List */}
        {activeTab !== 'notifications' && (
          <div className="pb-8">
            {displayIssues.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
                <div className="text-5xl mb-4">
                  {activeTab === 'assigned' ? '📋' : activeTab === 'in-progress' ? '🔧' : '✅'}
                </div>
                <p className="text-gray-700 font-medium mb-1">
                  No {activeTab} issues
                </p>
                <p className="text-gray-400 text-sm">
                  {activeTab === 'assigned'
                    ? 'No issues have been assigned to you yet'
                    : activeTab === 'in-progress'
                    ? 'No issues currently in progress'
                    : 'No issues resolved yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayIssues.map(issue => (
                  <div
                    key={issue._id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                  >
                    {/* Issue Header */}
                    <div className="p-5 border-b border-gray-100">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                            {categoryIcons[issue.category]}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800">
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
                          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(issue.status)}`}>
                            {issue.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-3">
                        {issue.description}
                      </p>

                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>📍 {issue.location.address.substring(0, 50)}...</span>
                        <span>⏰ {new Date(issue.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Issue Images */}
                    {issue.images.length > 0 && (
                      <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                        <p className="text-xs text-gray-500 mb-2 font-medium">
                          Issue Photos:
                        </p>
                        <div className="flex gap-2">
                          {issue.images.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt="issue"
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {issue.status !== 'resolved' && (
                      <div className="p-5 space-y-4">
                        {/* Status Update */}
                        <div className="flex items-center gap-3">
                          <label className="text-sm text-gray-600 font-medium whitespace-nowrap">
                            Update Status:
                          </label>
                          <select
                            onChange={(e) => handleStatusUpdate(issue._id, e.target.value)}
                            defaultValue={issue.status}
                            className="border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-green-500 flex-1"
                          >
                            <option value="assigned">Assigned</option>
                            <option value="in-progress">In Progress</option>
                          </select>
                        </div>

                        {/* Resolution Upload */}
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <p className="text-sm font-medium text-green-700 mb-3">
                            ✅ Mark as Resolved
                          </p>
                          <label className="block border-2 border-dashed border-green-300 rounded-lg p-4 text-center cursor-pointer hover:border-green-400 transition mb-3">
                            <span className="text-2xl block mb-1">📸</span>
                            <span className="text-xs text-green-600 font-medium">
                              Upload resolution proof (optional)
                            </span>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => setResolutionImages(prev => ({
                                ...prev,
                                [issue._id]: Array.from(e.target.files)
                              }))}
                              className="hidden"
                            />
                          </label>
                          {resolutionImages[issue._id]?.length > 0 && (
                            <p className="text-xs text-green-600 mb-3">
                              {resolutionImages[issue._id].length} photo(s) selected
                            </p>
                          )}
                          <button
                            onClick={() => handleResolutionUpload(issue._id)}
                            disabled={uploading[issue._id]}
                            className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                          >
                            {uploading[issue._id]
                              ? '⏳ Resolving...'
                              : '✅ Mark as Resolved'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Resolution Images */}
                    {issue.resolutionImages?.length > 0 && (
                      <div className="px-5 py-4 bg-green-50 border-t border-green-100">
                        <p className="text-xs text-green-600 font-medium mb-2">
                          ✅ Resolution Proof Submitted
                        </p>
                        <div className="flex gap-2">
                          {issue.resolutionImages.map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt="resolution"
                              className="w-20 h-20 object-cover rounded-lg"
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
                  You'll be notified when issues are assigned to you
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
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl">🔔</span>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-1 flex-shrink-0"></span>
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

export default WorkerDashboard;