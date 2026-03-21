import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllIssues, updateStatus } from '../services/api';
import axios from 'axios';
import Navbar from '../components/Navbar';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assigned');
  const [resolutionImages, setResolutionImages] = useState({});
  const [uploading, setUploading] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIssues();
  }, []);

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

      // Add images only if selected
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
      console.log('Error:', err.response?.data);
      alert(err.response?.data?.message || 'Failed to resolve issue');
    } finally {
      setUploading(prev => ({ ...prev, [issueId]: false }));
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

  const assignedIssues = issues.filter(i => i.status === 'assigned');
  const inProgressIssues = issues.filter(i => i.status === 'in-progress');
  const resolvedIssues = issues.filter(i => i.status === 'resolved');

  const displayIssues = activeTab === 'assigned'
    ? assignedIssues
    : activeTab === 'in-progress'
    ? inProgressIssues
    : resolvedIssues;

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

        {/* Welcome */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Welcome, {user?.name} 👷
        </h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-yellow-500">
              {assignedIssues.length}
            </h3>
            <p className="text-gray-600">Assigned</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-blue-500">
              {inProgressIssues.length}
            </h3>
            <p className="text-gray-600">In Progress</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-3xl font-bold text-green-600">
              {resolvedIssues.length}
            </h3>
            <p className="text-gray-600">Resolved</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['assigned', 'in-progress', 'resolved'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize text-sm font-medium ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
              {tab === 'assigned' && assignedIssues.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {assignedIssues.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Issues List */}
        {displayIssues.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500">No issues in this category.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayIssues.map(issue => (
              <div key={issue._id} className="bg-white p-5 rounded-lg shadow">

                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-bold text-gray-800 text-lg">
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
                <p className="text-gray-600 text-sm mb-3">
                  {issue.description}
                </p>

                {/* Location */}
                <p className="text-gray-500 text-xs mb-2">
                  📍 {issue.location.address}
                </p>

                {/* Deadline */}
                <p className="text-gray-500 text-xs mb-4">
                  ⏰ Deadline: {new Date(issue.deadline).toLocaleDateString()}
                </p>

                {/* Issue Images */}
                {issue.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Issue Images:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {issue.images.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt="issue"
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions — only for non resolved */}
                {issue.status !== 'resolved' && (
                  <div className="border-t pt-4 space-y-3">

                    {/* Update Status */}
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-gray-600 font-medium">
                        Update Status:
                      </label>
                      <select
                        onChange={(e) => handleStatusUpdate(issue._id, e.target.value)}
                        defaultValue={issue.status}
                        className="border border-gray-300 rounded-lg p-1.5 text-sm focus:outline-none focus:border-blue-500"
                      >
                        <option value="assigned">Assigned</option>
                        <option value="in-progress">In Progress</option>
                      </select>
                    </div>

                    {/* Resolution Proof */}
                    <div>
                      <p className="text-sm text-gray-600 font-medium mb-2">
                        Upload Resolution Proof (optional):
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setResolutionImages(prev => ({
                          ...prev,
                          [issue._id]: Array.from(e.target.files)
                        }))}
                        className="w-full border border-gray-300 rounded-lg p-2 text-sm mb-2"
                      />
                      <button
                        onClick={() => handleResolutionUpload(issue._id)}
                        disabled={uploading[issue._id]}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-600 transition disabled:opacity-50"
                      >
                        {uploading[issue._id]
                          ? 'Resolving...'
                          : '✅ Mark as Resolved'}
                      </button>
                    </div>

                  </div>
                )}

                {/* Resolution Images */}
                {issue.resolutionImages?.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Resolution Proof:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {issue.resolutionImages.map((img, index) => (
                        <img
                          key={index}
                          src={img}
                          alt="resolution"
                          className="w-24 h-24 object-cover rounded-lg"
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
    </div>
  );
};

export default WorkerDashboard;