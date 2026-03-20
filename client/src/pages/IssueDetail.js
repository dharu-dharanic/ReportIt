import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssue, upvoteIssue } from '../services/api';
import { useAuth } from '../context/AuthContext';

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      const { data } = await getIssue(id);
      setIssue(data);
    } catch (err) {
      setError('Issue not found');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setUpvoting(true);
    try {
      const { data } = await upvoteIssue(id);
      setIssue(prev => ({
        ...prev,
        upvoteCount: data.upvoteCount
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upvote');
    } finally {
      setUpvoting(false);
    }
  };

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return 'bg-red-100 text-red-600';
    if (severity === 'moderate') return 'bg-yellow-100 text-yellow-600';
    return 'bg-green-100 text-green-600';
  };

  const getStatusColor = (status) => {
    if (status === 'resolved') return 'bg-green-100 text-green-600';
    if (status === 'in-progress') return 'bg-blue-100 text-blue-600';
    if (status === 'assigned') return 'bg-yellow-100 text-yellow-600';
    return 'bg-gray-100 text-gray-600';
  };

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
      <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1
          className="text-xl font-bold cursor-pointer"
          onClick={() => navigate('/')}
        >
          ReportIt
        </h1>
        <button
          onClick={() => navigate('/issues')}
          className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100"
        >
          ← Back to Issues
        </button>
      </nav>

      <div className="max-w-3xl mx-auto p-6">

        {/* Title + Badges */}
        <div className="bg-white p-6 rounded-lg shadow mb-4">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {issue.title}
            </h2>
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
          <p className="text-gray-600 mb-4">{issue.description}</p>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium capitalize">{issue.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reported By</p>
              <p className="font-medium">
                {issue.isAnonymous ? 'Anonymous' : issue.reporter?.name}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reported On</p>
              <p className="font-medium">
                {new Date(issue.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Deadline</p>
              <p className="font-medium">
                {new Date(issue.deadline).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="mb-4">
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">📍 {issue.location.address}</p>
          </div>

          {/* Images */}
          {issue.images.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Images</p>
              <div className="flex gap-2 flex-wrap">
                {issue.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt="issue"
                    className="w-32 h-32 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upvote */}
          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={handleUpvote}
              disabled={upvoting}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            >
              👍 Upvote
            </button>
            <span className="text-gray-600 font-medium">
              {issue.upvoteCount} upvotes
            </span>
          </div>

        </div>

        {/* Resolution Images */}
        {issue.resolutionImages.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow mb-4">
            <h3 className="font-bold text-gray-800 mb-3">
              Resolution Proof
            </h3>
            <div className="flex gap-2 flex-wrap">
              {issue.resolutionImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="resolution"
                  className="w-32 h-32 object-cover rounded"
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default IssueDetail;