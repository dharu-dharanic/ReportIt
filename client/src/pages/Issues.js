import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllIssues } from '../services/api';
import Navbar from '../components/Navbar';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const categoryColors = {
  road: '#ef4444',
  garbage: '#92400e',
  water: '#3b82f6',
  electricity: '#eab308',
  other: '#6b7280'
};

const Issues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('list');
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

  // Get map center from first issue or default to India
  const mapCenter = filteredIssues.length > 0
    ? [
        filteredIssues[0].location.coordinates[1],
        filteredIssues[0].location.coordinates[0]
      ]
    : [20.5937, 78.9629];

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-600">
            All Issues
          </h2>

          {/* View Toggle */}
          <div className="flex bg-white rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 text-sm font-medium transition ${
                view === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              📋 List
            </button>
            <button
              onClick={() => setView('map')}
              className={`px-4 py-2 text-sm font-medium transition ${
                view === 'map'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              🗺️ Map
            </button>
          </div>
        </div>

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

        {/* Category Legend for Map */}
        {view === 'map' && (
          <div className="flex gap-4 mb-4 flex-wrap bg-white p-3 rounded-lg shadow">
            {Object.entries(categoryColors).map(([cat, color]) => (
              <div key={cat} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-600 capitalize">{cat}</span>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-600">Loading issues...</p>
        ) : (
          <>
            {/* List View */}
            {view === 'list' && (
              <div className="space-y-4">
                {filteredIssues.length === 0 ? (
                  <p className="text-center text-gray-600">No issues found.</p>
                ) : (
                  filteredIssues.map(issue => (
                    <div
                      key={issue._id}
                      onClick={() => navigate(`/issues/${issue._id}`)}
                      className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition"
                    >
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
                      <p className="text-gray-600 text-sm mb-2">
                        {issue.description.substring(0, 100)}...
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>📍 {issue.location.address.substring(0, 50)}...</span>
                        <div className="flex gap-3">
                          <span>👍 {issue.upvoteCount}</span>
                          <span>🏷️ {issue.category}</span>
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
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {filteredIssues.length === 0 ? (
                  <p className="text-center text-gray-600 p-8">
                    No issues to show on map.
                  </p>
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
                          <div className="p-1 min-w-40">
                            <h3 className="font-bold text-gray-800 mb-1">
                              {issue.title}
                            </h3>
                            <p className="text-gray-600 text-xs mb-2">
                              {issue.description.substring(0, 80)}...
                            </p>
                            <div className="flex gap-1 mb-2">
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded capitalize">
                                {issue.category}
                              </span>
                              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded capitalize">
                                {issue.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">
                              👍 {issue.upvoteCount} upvotes
                            </p>
                            <button
                              onClick={() => navigate(`/issues/${issue._id}`)}
                              className="w-full bg-blue-600 text-white text-xs py-1.5 rounded hover:bg-blue-700"
                            >
                              View Details
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