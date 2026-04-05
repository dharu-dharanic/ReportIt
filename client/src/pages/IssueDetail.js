// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { getIssue, upvoteIssue } from '../services/api';
// import { useAuth } from '../context/AuthContext';
// import Navbar from '../components/Navbar';

// const IssueDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [issue, setIssue] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [upvoting, setUpvoting] = useState(false);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     fetchIssue();
//   }, [id]);

//   const fetchIssue = async () => {
//     try {
//       const { data } = await getIssue(id);
//       setIssue(data);
//     } catch (err) {
//       setError('Issue not found');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleUpvote = async () => {
//     if (!user) {
//       navigate('/login');
//       return;
//     }
//     setUpvoting(true);
//     try {
//       const { data } = await upvoteIssue(id);
//       setIssue(prev => ({
//         ...prev,
//         upvoteCount: data.upvoteCount
//       }));
//     } catch (err) {
//       setError(err.response?.data?.message || 'Could not upvote');
//     } finally {
//       setUpvoting(false);
//     }
//   };

//   const getSeverityColor = (severity) => {
//     if (severity === 'critical') return 'bg-red-100 text-red-600';
//     if (severity === 'moderate') return 'bg-yellow-100 text-yellow-600';
//     return 'bg-green-100 text-green-600';
//   };

//   const getStatusColor = (status) => {
//     if (status === 'resolved') return 'bg-green-100 text-green-600';
//     if (status === 'in-progress') return 'bg-blue-100 text-blue-600';
//     if (status === 'assigned') return 'bg-yellow-100 text-yellow-600';
//     return 'bg-gray-100 text-gray-600';
//   };

//   if (loading) return (
//     <div className="min-h-screen flex items-center justify-center">
//       <p className="text-blue-600 text-xl">Loading...</p>
//     </div>
//   );

//   if (error) return (
//     <div className="min-h-screen flex items-center justify-center">
//       <p className="text-red-600 text-xl">{error}</p>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gray-100">

//       {/* Navbar */}
//       <Navbar />

//       <div className="max-w-3xl mx-auto p-6">

//         {/* Back Button */}
//         <button
//           onClick={() => navigate('/issues')}
//           className="mb-4 text-blue-600 hover:underline flex items-center gap-1"
//         >
//           ← Back to Issues
//         </button>

//         {/* Title + Badges */}
//         <div className="bg-white p-6 rounded-lg shadow mb-4">
//           <div className="flex justify-between items-start mb-4">
//             <h2 className="text-2xl font-bold text-gray-800">
//               {issue.title}
//             </h2>
//             <div className="flex gap-2">
//               <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(issue.severity)}`}>
//                 {issue.severity}
//               </span>
//               <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(issue.status)}`}>
//                 {issue.status}
//               </span>
//             </div>
//           </div>

//           {/* Description */}
//           <p className="text-gray-600 mb-4">{issue.description}</p>

//           {/* Details */}
//           <div className="grid grid-cols-2 gap-4 mb-4">
//             <div>
//               <p className="text-sm text-gray-500">Category</p>
//               <p className="font-medium capitalize">{issue.category}</p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Reported By</p>
//               <p className="font-medium">
//                 {issue.isAnonymous ? 'Anonymous' : issue.reporter?.name}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Reported On</p>
//               <p className="font-medium">
//                 {new Date(issue.createdAt).toLocaleDateString()}
//               </p>
//             </div>
//             <div>
//               <p className="text-sm text-gray-500">Deadline</p>
//               <p className="font-medium">
//                 {new Date(issue.deadline).toLocaleDateString()}
//               </p>
//             </div>
//           </div>

//           {/* Location */}
//           <div className="mb-4">
//             <p className="text-sm text-gray-500">Location</p>
//             <p className="font-medium">📍 {issue.location.address}</p>
//           </div>

//           {/* Images */}
//           {issue.images.length > 0 && (
//             <div className="mb-4">
//               <p className="text-sm text-gray-500 mb-2">Images</p>
//               <div className="flex gap-2 flex-wrap">
//                 {issue.images.map((img, index) => (
//                   <img
//                     key={index}
//                     src={img}
//                     alt="issue"
//                     className="w-32 h-32 object-cover rounded"
//                   />
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Upvote — citizen only */}
//           {user?.role === 'citizen' && (
//             <div className="flex items-center gap-4 mt-4">
//               <button
//                 onClick={handleUpvote}
//                 disabled={upvoting}
//                 className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
//               >
//                 👍 Upvote
//               </button>
//               <span className="text-gray-600 font-medium">
//                 {issue.upvoteCount} upvotes
//               </span>
//             </div>
//           )}

//           {/* Show upvote count for non citizens */}
//           {user?.role !== 'citizen' && (
//             <div className="mt-4">
//               <span className="text-gray-600 font-medium">
//                 👍 {issue.upvoteCount} upvotes
//               </span>
//             </div>
//           )}

//         </div>

//         {/* Resolution Images */}
//         {issue.resolutionImages.length > 0 && (
//           <div className="bg-white p-6 rounded-lg shadow mb-4">
//             <h3 className="font-bold text-gray-800 mb-3">
//               Resolution Proof
//             </h3>
//             <div className="flex gap-2 flex-wrap">
//               {issue.resolutionImages.map((img, index) => (
//                 <img
//                   key={index}
//                   src={img}
//                   alt="resolution"
//                   className="w-32 h-32 object-cover rounded"
//                 />
//               ))}
//             </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default IssueDetail;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getIssue, upvoteIssue } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const categoryIcons = {
  road: '🛣️',
  garbage: '🗑️',
  water: '💧',
  electricity: '⚡',
  other: '🔧'
};

const categoryColors = {
  road: '#ef4444',
  garbage: '#92400e',
  water: '#3b82f6',
  electricity: '#eab308',
  other: '#6b7280'
};

const IssueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upvoting, setUpvoting] = useState(false);
  const [error, setError] = useState('');
  const [upvoted, setUpvoted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchIssue();
  }, [id]);

  const fetchIssue = async () => {
    try {
      const { data } = await getIssue(id);
      setIssue(data);
      // Check if user already upvoted
      if (user && data.upvotes?.includes(user.id)) {
        setUpvoted(true);
      }
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
    if (upvoted) return;
    setUpvoting(true);
    try {
      const { data } = await upvoteIssue(id);
      setIssue(prev => ({
        ...prev,
        upvoteCount: data.upvoteCount
      }));
      setUpvoted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not upvote');
    } finally {
      setUpvoting(false);
    }
  };

  const getSeverityColor = (severity) => {
    if (severity === 'critical') return 'bg-red-100 text-red-600 border-red-200';
    if (severity === 'moderate') return 'bg-yellow-100 text-yellow-600 border-yellow-200';
    return 'bg-green-100 text-green-600 border-green-200';
  };

  const getStatusColor = (status) => {
    if (status === 'resolved') return 'bg-green-100 text-green-700 border-green-200';
    if (status === 'in-progress') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (status === 'assigned') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getStatusDot = (status) => {
    if (status === 'resolved') return 'bg-green-500';
    if (status === 'in-progress') return 'bg-blue-500';
    if (status === 'assigned') return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  const getStatusMessage = (status) => {
    if (status === 'resolved') return '✅ This issue has been resolved';
    if (status === 'in-progress') return '🔧 Workers are actively working on this';
    if (status === 'assigned') return '👷 Issue has been assigned to a worker';
    return '⏳ Issue is waiting to be assigned';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-4xl mb-3">⏳</div>
        <p className="text-gray-500">Loading issue details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="text-5xl mb-3">😕</div>
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={() => navigate('/issues')}
          className="mt-4 text-green-600 hover:underline text-sm"
        >
          ← Back to Issues
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <Navbar />

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="full"
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-6">

        {/* Back Button */}
        <button
          onClick={() => navigate('/issues')}
          className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition mb-6 text-sm"
        >
          ← Back to Issues
        </button>

        {/* Status Banner */}
        <div className={`rounded-xl p-4 mb-4 border ${getStatusColor(issue.status)}`}>
          <p className="text-sm font-medium">
            {getStatusMessage(issue.status)}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-4">

          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
                {categoryIcons[issue.category]}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-800 mb-1">
                  {issue.title}
                </h1>
                <div className="flex gap-2 flex-wrap">
                  {issue.escalated && (
                    <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-600 border border-orange-200">
                      ⚠️ Escalated
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full border ${getSeverityColor(issue.severity)}`}>
                    {issue.severity}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${getStatusColor(issue.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(issue.status)}`}></span>
                    {issue.status}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 capitalize">
                    {issue.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">
              {issue.description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 p-6 border-b border-gray-100">
            <div>
              <p className="text-xs text-gray-400 mb-1">Reported By</p>
              <p className="text-sm font-medium text-gray-800">
                {issue.isAnonymous ? '🕵️ Anonymous' : `👤 ${issue.reporter?.name}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Reported On</p>
              <p className="text-sm font-medium text-gray-800">
                📅 {new Date(issue.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Deadline</p>
              <p className={`text-sm font-medium ${
                new Date(issue.deadline) < new Date()
                  ? 'text-red-600'
                  : 'text-gray-800'
              }`}>
                ⏰ {new Date(issue.deadline).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
                {new Date(issue.deadline) < new Date() && ' (Overdue)'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Assigned To</p>
              <p className="text-sm font-medium text-gray-800">
                {issue.assignedTo
                  ? `👷 ${issue.assignedTo.name}`
                  : '—  Not assigned yet'}
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="p-6 border-b border-gray-100">
            <p className="text-xs text-gray-400 mb-2">Location</p>
            <p className="text-sm text-gray-700 mb-3">
              📍 {issue.location.address}
            </p>
            {/* Mini Map */}
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <MapContainer
                center={[
                  issue.location.coordinates[1],
                  issue.location.coordinates[0]
                ]}
                zoom={15}
                style={{ height: '180px', width: '100%' }}
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <CircleMarker
                  center={[
                    issue.location.coordinates[1],
                    issue.location.coordinates[0]
                  ]}
                  radius={12}
                  fillColor={categoryColors[issue.category]}
                  color="#fff"
                  weight={2}
                  fillOpacity={0.9}
                />
              </MapContainer>
            </div>
          </div>

          {/* Images */}
          {issue.images.length > 0 && (
            <div className="p-6 border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-3">Issue Photos</p>
              <div className="grid grid-cols-3 gap-2">
                {issue.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt="issue"
                    onClick={() => setSelectedImage(img)}
                    className="w-full h-28 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upvote Section */}
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Community Support
                </p>
                <p className="text-xs text-gray-400">
                  {issue.upvoteCount} people have upvoted this issue
                </p>
              </div>
              {user?.role === 'citizen' && (
                <button
                  onClick={handleUpvote}
                  disabled={upvoting || upvoted}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition ${
                    upvoted
                      ? 'bg-green-100 text-green-600 cursor-default'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {upvoted ? '✅ Upvoted' : '👍 Upvote'}
                  <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full text-xs">
                    {issue.upvoteCount}
                  </span>
                </button>
              )}
              {user?.role !== 'citizen' && (
                <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">
                  <span>👍</span>
                  <span className="font-medium text-gray-700">
                    {issue.upvoteCount}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resolution Proof */}
        {issue.resolutionImages?.length > 0 && (
          <div className="bg-white rounded-xl border border-green-200 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">✅</span>
              <div>
                <h3 className="font-bold text-green-700">
                  Issue Resolved
                </h3>
                <p className="text-xs text-gray-400">
                  Resolution proof submitted by worker
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {issue.resolutionImages.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt="resolution"
                  onClick={() => setSelectedImage(img)}
                  className="w-full h-28 object-cover rounded-lg cursor-pointer hover:opacity-90 transition"
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