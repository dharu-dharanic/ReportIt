import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllIssues, updateStatus, deleteIssue } from '../services/api';
import axios from 'axios';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('issues');
  const [issues, setIssues] = useState([]);
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
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

  // Analytics
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => i.status === 'resolved').length;
  const pendingIssues = issues.filter(i => i.status === 'reported').length;
  const inProgressIssues = issues.filter(i => i.status === 'in-progress').length;

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

      <div className="max-w-6xl mx-auto p-6">

        {/* Welcome */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Welcome, {user?.name} 👋
        </h2>

        {/* Analytics Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-blue-600">{totalIssues}</h3>
            <p className="text-gray-600">Total Issues</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-yellow-500">{pendingIssues}</h3>
            <p className="text-gray-600">Pending</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-blue-500">{inProgressIssues}</h3>
            <p className="text-gray-600">In Progress</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-green-600">{resolvedIssues}</h3>
            <p className="text-gray-600">Resolved</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['issues', 'workers', 'users'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded capitalize ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
              {tab === 'workers' && pendingWorkers.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingWorkers.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Issues Tab */}
        {activeTab === 'issues' && (
          <div className="space-y-4">
            {issues.length === 0 ? (
              <p className="text-center text-gray-600">No issues found.</p>
            ) : (
              issues.map(issue => (
                <div key={issue._id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800">{issue.title}</h3>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-2">{issue.description}</p>
                  <p className="text-gray-500 text-xs mb-3">
                    📍 {issue.location.address}
                  </p>

                  <div className="flex gap-2 flex-wrap">
                    {/* Assign to worker */}
                    <select
                      onChange={(e) => handleAssign(issue._id, e.target.value)}
                      className="border border-gray-300 rounded p-1 text-sm"
                      defaultValue=""
                    >
                      <option value="" disabled>Assign to worker</option>
                      {workers.map(worker => (
                        <option key={worker._id} value={worker._id}>
                          {worker.name}
                        </option>
                      ))}
                    </select>

                    {/* Update Status */}
                    <select
                      onChange={(e) => handleStatusUpdate(issue._id, e.target.value)}
                      className="border border-gray-300 rounded p-1 text-sm"
                      defaultValue={issue.status}
                    >
                      <option value="reported">Reported</option>
                      <option value="assigned">Assigned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(issue._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>

                    {/* View */}
                    <button
                      onClick={() => navigate(`/issues/${issue._id}`)}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Workers Tab */}
        {activeTab === 'workers' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">
              Pending Approvals ({pendingWorkers.length})
            </h3>
            {pendingWorkers.length === 0 ? (
              <p className="text-center text-gray-600">No pending workers.</p>
            ) : (
              pendingWorkers.map(worker => (
                <div
                  key={worker._id}
                  className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-gray-800">{worker.name}</p>
                    <p className="text-gray-600 text-sm">{worker.email}</p>
                    <p className="text-yellow-500 text-xs mt-1">⏳ Pending</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(worker._id)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Approve ✅
                    </button>
                    <button
                      onClick={() => handleReject(worker._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Reject ❌
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 text-lg">
              All Users ({allUsers.length})
            </h3>
            {allUsers.map(u => (
              <div
                key={u._id}
                className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-gray-800">{u.name}</p>
                  <p className="text-gray-600 text-sm">{u.email}</p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-xs capitalize">
                    {u.role}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs capitalize ${
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
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;