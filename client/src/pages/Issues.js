import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllIssues } from '../services/api';
import Navbar from '../components/Navbar';

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const { data } = await getAllIssues();
      setIssues(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = filter === 'all'
    ? issues
    : issues.filter(issue => issue.category === filter);

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

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <Navbar />

      <div className="max-w-4xl mx-auto p-6">

        <h2 className="text-2xl font-bold text-blue-600 mb-6">
          All Issues
        </h2>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {['all', 'road', 'garbage', 'water', 'electricity', 'other'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm capitalize ${
                filter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Issues List */}
        {loading ? (
          <p className="text-center text-gray-600">Loading issues...</p>
        ) : filteredIssues.length === 0 ? (
          <p className="text-center text-gray-600">No issues found.</p>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map(issue => (
              <div
                key={issue._id}
                onClick={() => navigate(`/issues/${issue._id}`)}
                className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition"
              >
                {/* Header */}
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

                {/* Description */}
                <p className="text-gray-600 text-sm mb-2">
                  {issue.description.substring(0, 100)}...
                </p>

                {/* Footer */}
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>📍 {issue.location.address.substring(0, 50)}...</span>
                  <div className="flex gap-3">
                    <span>👍 {issue.upvoteCount}</span>
                    <span>🏷️ {issue.category}</span>
                    <span>
                      {new Date(issue.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Issues;