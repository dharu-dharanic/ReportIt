import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllIssues, updateStatus } from '../services/api';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://reportit-backend.onrender.com';

const WorkerDashboard = () => {
  const { user } = useAuth();

  const [issues, setIssues] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assigned');
  const [resolutionImages, setResolutionImages] = useState({});
  const [uploading, setUploading] = useState({});

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
      console.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, [user]);

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

    return () => {
      socket.disconnect();
    };
  }, [user, fetchIssues]);

  const handleStatusUpdate = async (issueId, status) => {
    try {
      await updateStatus(issueId, { status });
      fetchIssues();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleResolutionUpload = async (issueId) => {
    setUploading(prev => ({
      ...prev,
      [issueId]: true
    }));

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();

      const images = resolutionImages[issueId];

      if (images && images.length > 0) {
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
      setUploading(prev => ({
        ...prev,
        [issueId]: false
      }));
    }
  };

  const markAllRead = () => {
    setNotifications(prev =>
      prev.map(n => ({
        ...n,
        read: true
      }))
    );
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
    road: '🛣️',
    garbage: '🗑️',
    water: '💧',
    electricity: '⚡',
    other: '🔧'
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* rest of your UI remains EXACTLY same */}
    </div>
  );
};

export default WorkerDashboard;