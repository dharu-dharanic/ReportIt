
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllIssues } from '../services/api';
import Navbar from '../components/Navbar';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = 'http://localhost:5000';

const categoryColors = {
  road: '#ef4444',
  garbage: '#92400e',
  water: '#3b82f6',
  electricity: '#eab308',
  other: '#6b7280'
};

const categoryIcons = {
  road: '🛣️',
  garbage: '🗑️',
  water: '💧',
  electricity: '⚡',
  other: '🔧'
};

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [view, setView] = useState('list');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchIssues();

    const socket = io(SOCKET_URL);
    socket.emit('joinIssues');

    socket.on('newIssue', (issue) => {
      setIssues(prev => [issue, ...prev]);
    });

    socket.on('issueStatusChanged', ({ issueId, status }) => {
      setIssues(prev =>
        prev.map(issue =>
          issue._id === issueId ? { ...issue, status } : issue
        )
      );
    });

    socket.on('issueUpvoted', ({ issueId, upvoteCount, severity }) => {
      setIssues(prev =>
        prev.map(issue =>
          issue._id === issueId
            ? { ...issue, upvoteCount, severity }
            : issue
        )
      );
    });

    socket.on('issueDeleted', ({ issueId }) => {
      setIssues(prev => prev.filter(issue => issue._id !== issueId));
    });

    return () => socket.disconnect();
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

  // Filter issues
  const filteredIssues = issues
    .filter(issue => filter === 'all' || issue.category === filter)
    .filter(issue => statusFilter === 'all' || issue.status === statusFilter)
    .filter(issue =>
      search === '' ||
      issue.title.toLowerCase().includes(search.toLowerCase()) ||
      issue.description.toLowerCase().includes(search.toLowerCase())
    );

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return 'bg-red-100 text-red-600';
    if (severity === 'moderate') return 'bg-yellow-100 text-yellow-600';
    return 'bg-green-100 text-green-600';
  };

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

  const mapCenter = filteredIssues.length > 0
    ? [
        filteredIssues[0].location.coordinates[1],
        filteredIssues[0].location.coordinates[0]
      ]
    : [20.5937, 78.9629];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Civic Issues
              </h2>
              <p className="text-gray-500 text-sm">
                {filteredIssues.length} issues found
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-3">
              {user?.role === 'citizen' && (
                <button
                  onClick={() => navigate('/report')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition"
                >
                  + Report Issue
                </button>
              )}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('list')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    view === 'list'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📋 List
                </button>
                <button
                  onClick={() => setView('map')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                    view === 'map'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🗺️ Map
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search issues..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {/* Category Filter */}
            <div className="flex gap-1.5 flex-wrap">
              {['all', 'road', 'garbage', 'water', 'electricity', 'other'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition ${
                    filter === cat
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat !== 'all' && categoryIcons[cat]} {cat}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-200 mx-1" />

            {/* Status Filter */}
            <div className="flex gap-1.5">
              {['all', 'reported', 'assigned', 'in-progress', 'resolved'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition ${
                    statusFilter === status
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">

        {/* Map Legend */}
        {view === 'map' && (
          <div className="flex gap-4 mb-4 flex-wrap bg-white p-3 rounded-lg border border-gray-200">
            {Object.entries(categoryColors).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-600 capitalize">
                  {categoryIcons[cat]} {cat}
                </span>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-4xl mb-3">⏳</div>
              <p className="text-gray-500">Loading issues...</p>
            </div>
          </div>
        ) : (
          <>
            {/* List View */}
            {view === 'list' && (
              <div className="space-y-3">
                {filteredIssues.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="text-5xl mb-4">🔍</div>
                    <p className="text-gray-500 font-medium">No issues found</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Try changing your filters
                    </p>
                  </div>
                ) : (
                  filteredIssues.map(issue => (
                    <div
                      key={issue._id}
                      onClick={() => navigate(`/issues/${issue._id}`)}
                      className="bg-white rounded-xl border border-gray-100 p-5 cursor-pointer hover:shadow-md hover:border-green-200 transition group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-start gap-3">
                          {/* Category Icon */}
                          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                            {categoryIcons[issue.category]}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 group-hover:text-green-600 transition">
                              {issue.title}
                            </h3>
                            <p className="text-gray-500 text-xs mt-0.5 capitalize">
                              {issue.category}
                            </p>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex gap-2 flex-shrink-0">
                          {issue.escalated && (
                            <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600">
                              ⚠️ Escalated
                            </span>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(issue.severity)}`}>
                            {issue.severity}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(issue.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(issue.status)}`}></span>
                            {issue.status}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {issue.description}
                      </p>

                      {/* Footer */}
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          📍 {issue.location.address.substring(0, 45)}...
                        </span>
                        <div className="flex items-center gap-3">
                          <span>👍 {issue.upvoteCount}</span>
                          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Map View */}
            {view === 'map' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {filteredIssues.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-gray-500">No issues to show on map.</p>
                  </div>
                ) : (
                  <MapContainer
                    center={mapCenter}
                    zoom={13}
                    style={{ height: '600px', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; OpenStreetMap contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {filteredIssues.map(issue => (
                      <CircleMarker
                        key={issue._id}
                        center={[
                          issue.location.coordinates[1],
                          issue.location.coordinates[0]
                        ]}
                        radius={10}
                        fillColor={categoryColors[issue.category] || '#6b7280'}
                        color="#fff"
                        weight={2}
                        fillOpacity={0.8}
                      >
                        <Popup>
                          <div className="p-1 min-w-44">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">
                                {categoryIcons[issue.category]}
                              </span>
                              <h3 className="font-bold text-gray-800 text-sm">
                                {issue.title}
                              </h3>
                            </div>
                            <p className="text-gray-600 text-xs mb-2">
                              {issue.description.substring(0, 80)}...
                            </p>
                            <div className="flex gap-1 mb-2">
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full capitalize">
                                {issue.category}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(issue.status)}`}>
                                {issue.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">
                              👍 {issue.upvoteCount} upvotes
                            </p>
                            <button
                              onClick={() => navigate(`/issues/${issue._id}`)}
                              className="w-full bg-green-600 text-white text-xs py-1.5 rounded-lg hover:bg-green-700"
                            >
                              View Details →
                            </button>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Issues;