/* eslint-disable no-unused-vars */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllIssues, updateStatus } from '../services/api';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://reportit-backend.onrender.com';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [issues, setIssues] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assigned');
  const [resolutionImages, setResolutionImages] = useState({});
  const [uploading, setUploading] = useState({});

  // ---------------- FETCH ISSUES ----------------
  const fetchIssues = useCallback(async () => {
    try {
      const { data } = await getAllIssues();

      const myIssues = data.filter(
        issue =>
          issue.assignedTo?._id === user?.id ||
          issue.assignedTo === user?.id
      );

      setIssues(myIssues);
    } catch (err) {
      console.log('Failed to load issues', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ---------------- SOCKET + INIT ----------------
  useEffect(() => {
    fetchIssues();

    const socket = io(SOCKET_URL);

    if (user?.id) {
      socket.emit('join', user.id);
    }

    socket.on('issueAssigned', ({ message }) => {
      setNotifications(prev => [
        {
          id: Date.now(),
          message,
          time: new Date().toLocaleTimeString(),
          read: false
        },
        ...prev
      ]);

      fetchIssues();
    });

    return () => socket.disconnect();
  }, [user?.id, fetchIssues]);

  // ---------------- STATUS UPDATE ----------------
  const handleStatusUpdate = async (issueId, status) => {
    try {
      await updateStatus(issueId, { status });
      fetchIssues();
    } catch {
      alert('Failed to update status');
    }
  };

  // ---------------- RESOLUTION UPLOAD ----------------
  const handleResolutionUpload = async (issueId) => {
    setUploading(prev => ({ ...prev, [issueId]: true }));

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      const images = resolutionImages[issueId];
      if (images?.length) {
        images.forEach(img => formData.append('images', img));
      }

      await axios.put(
        `https://reportit-backend.onrender.com/api/issues/${issueId}/resolve`,
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

  // ---------------- NOTIFICATIONS ----------------
  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // ---------------- UI HELPERS ----------------
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
    road: '🛣️',
    garbage: '🗑️',
    water: '💧',
    electricity: '⚡',
    other: '🔧'
  };

  // ---------------- FILTER ISSUES ----------------
  const assignedIssues = issues.filter(i => i.status === 'assigned');
  const inProgressIssues = issues.filter(i => i.status === 'in-progress');
  const resolvedIssues = issues.filter(i => i.status === 'resolved');

  const displayIssues =
    activeTab === 'assigned'
      ? assignedIssues
      : activeTab === 'in-progress'
      ? inProgressIssues
      : activeTab === 'resolved'
      ? resolvedIssues
      : [];

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-gray-500">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  // ---------------- UI ----------------
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
                <div
                  key={stat.label}
                  className="bg-green-500 bg-opacity-40 rounded-xl p-3 text-center"
                >
                  <div className={`w-2 h-2 rounded-full ${stat.color} mx-auto mb-1`} />
                  <p className="text-xl font-bold">{stat.value}</p>
                  <p className="text-green-200 text-xs">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-6 -mt-4">
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
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Issues */}
        {activeTab !== 'notifications' && (
          <div className="space-y-4 pb-8">
            {displayIssues.map(issue => (
              <div key={issue._id} className="bg-white rounded-xl p-5 border">
                <div className="flex justify-between">
                  <div className="flex gap-3">
                    <div className="text-xl">
                      {categoryIcons[issue.category]}
                    </div>
                    <div>
                      <h3 className="font-semibold">{issue.title}</h3>
                      <p className="text-xs text-gray-400">
                        {issue.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className={getSeverityColor(issue.severity)}>
                      {issue.severity}
                    </span>
                    <span className={getStatusColor(issue.status)}>
                      {issue.status}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-2">
                  {issue.description}
                </p>

                {/* Status update */}
                <select
                  onChange={(e) =>
                    handleStatusUpdate(issue._id, e.target.value)
                  }
                  value={issue.status}
                  className="mt-3 border p-2 rounded"
                >
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                </select>

                {/* Resolve */}
                {issue.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolutionUpload(issue._id)}
                    disabled={uploading[issue._id]}
                    className="mt-3 bg-green-600 text-white px-4 py-2 rounded"
                  >
                    {uploading[issue._id]
                      ? 'Resolving...'
                      : 'Mark Resolved'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Notifications */}
        {activeTab === 'notifications' && (
          <div className="space-y-3">
            <button
              onClick={markAllRead}
              className="text-green-600 text-sm"
            >
              Mark all read
            </button>

            {notifications.map(n => (
              <div key={n.id} className="p-3 bg-white border rounded">
                {n.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerDashboard;