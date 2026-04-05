// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { createIssue } from '../services/api';
// import Navbar from '../components/Navbar';
// import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';

// // Fix leaflet marker icon
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
//   iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
// });

// // Component to handle map click
// const LocationPicker = ({ onLocationSelect }) => {
//   useMapEvents({
//     click: async (e) => {
//       const { lat, lng } = e.latlng;
//       onLocationSelect(lat, lng);
//     }
//   });
//   return null;
// };

// const ReportIssue = () => {
//   const [title, setTitle] = useState('');
//   const [description, setDescription] = useState('');
//   const [category, setCategory] = useState('road');
//   const [address, setAddress] = useState('');
//   const [coordinates, setCoordinates] = useState(null);
//   const [markerPos, setMarkerPos] = useState(null);
//   const [images, setImages] = useState([]);
//   const [isAnonymous, setIsAnonymous] = useState(false);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [locationLoading, setLocationLoading] = useState(false);
//   const navigate = useNavigate();

//   const defaultCenter = [20.5937, 78.9629];
//   const mapCenter = markerPos || defaultCenter;

//   const handleLocationSelect = async (lat, lng) => {
//     setCoordinates([lng, lat]);
//     setMarkerPos([lat, lng]);
//     try {
//       const res = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
//       );
//       const data = await res.json();
//       setAddress(data.display_name);
//     } catch {
//       setAddress(`${lat}, ${lng}`);
//     }
//   };

//   const getLocation = () => {
//     setLocationLoading(true);
//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const { latitude, longitude } = position.coords;
//         await handleLocationSelect(latitude, longitude);
//         setLocationLoading(false);
//       },
//       () => {
//         setError('Could not get location. Please click on map to select location.');
//         setLocationLoading(false);
//       }
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!coordinates) {
//       setError('Please select your location on the map or use GPS.');
//       return;
//     }
//     setLoading(true);
//     setError('');
//     try {
//       const formData = new FormData();
//       formData.append('title', title);
//       formData.append('description', description);
//       formData.append('category', category);
//       formData.append('address', address);
//       formData.append('coordinates', JSON.stringify(coordinates));
//       formData.append('isAnonymous', isAnonymous.toString());
//       images.forEach((image) => {
//         formData.append('images', image);
//       });
//       await createIssue(formData);
//       navigate('/issues');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to report issue.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">

//       {/* Navbar */}
//       <Navbar />

//       <div className="max-w-2xl mx-auto p-6">

//         <h2 className="text-2xl font-bold text-blue-600 mb-6">
//           Report an Issue
//         </h2>

//         {error && (
//           <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">

//           {/* Title */}
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2 font-medium">
//               Issue Title
//             </label>
//             <input
//               type="text"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
//               placeholder="e.g. Large pothole on main road"
//               required
//             />
//           </div>

//           {/* Description */}
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2 font-medium">
//               Description
//             </label>
//             <textarea
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
//               placeholder="Describe the issue in detail..."
//               rows="4"
//               required
//             />
//           </div>

//           {/* Category */}
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2 font-medium">
//               Category
//             </label>
//             <select
//               value={category}
//               onChange={(e) => setCategory(e.target.value)}
//               className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
//             >
//               <option value="road">🛣️ Road</option>
//               <option value="garbage">🗑️ Garbage</option>
//               <option value="water">💧 Water</option>
//               <option value="electricity">⚡ Electricity</option>
//               <option value="other">🔧 Other</option>
//             </select>
//           </div>

//           {/* Location */}
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2 font-medium">
//               Location
//             </label>

//             {/* GPS Button */}
//             <button
//               type="button"
//               onClick={getLocation}
//               className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-3 text-sm"
//             >
//               {locationLoading ? 'Getting location...' : '📍 Use My Current Location'}
//             </button>

//             {/* Map Picker */}
//             <div className="rounded-lg overflow-hidden border border-gray-300 mb-3">
//               <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 border-b">
//                 📌 Click anywhere on map to select location
//               </p>
//               <MapContainer
//                 center={mapCenter}
//                 zoom={markerPos ? 15 : 5}
//                 style={{ height: '250px', width: '100%' }}
//                 key={mapCenter.toString()}
//               >
//                 <TileLayer
//                   attribution='&copy; OpenStreetMap contributors'
//                   url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 />
//                 <LocationPicker onLocationSelect={handleLocationSelect} />
//                 {markerPos && (
//                   <Marker position={markerPos} />
//                 )}
//               </MapContainer>
//             </div>

//             {/* Address Display */}
//             {address ? (
//               <div className="bg-green-50 border border-green-200 rounded p-2 text-sm text-gray-700">
//                 📍 {address}
//               </div>
//             ) : (
//               <input
//                 type="text"
//                 value={address}
//                 onChange={(e) => setAddress(e.target.value)}
//                 className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 text-sm"
//                 placeholder="Or type address manually"
//               />
//             )}
//           </div>

//           {/* Images */}
//           <div className="mb-4">
//             <label className="block text-gray-700 mb-2 font-medium">
//               Upload Images (optional)
//             </label>
//             <input
//               type="file"
//               multiple
//               accept="image/*"
//               onChange={(e) => setImages(Array.from(e.target.files))}
//               className="w-full border border-gray-300 rounded p-2 text-sm"
//             />
//             {images.length > 0 && (
//               <p className="text-green-600 text-sm mt-1">
//                 {images.length} image(s) selected
//               </p>
//             )}
//           </div>

//           {/* Anonymous */}
//           <div className="mb-6 flex items-center gap-2">
//             <input
//               type="checkbox"
//               id="anonymous"
//               checked={isAnonymous}
//               onChange={(e) => setIsAnonymous(e.target.checked)}
//               className="w-4 h-4"
//             />
//             <label htmlFor="anonymous" className="text-gray-700 text-sm">
//               Report anonymously
//             </label>
//           </div>

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-blue-600 text-white py-2.5 rounded hover:bg-blue-700 transition font-medium"
//           >
//             {loading ? 'Submitting...' : 'Submit Report'}
//           </button>

//         </form>
//       </div>
//     </div>
//   );
// };

// export default ReportIssue;


































import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIssue } from '../services/api';
import Navbar from '../components/Navbar';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LocationPicker = ({ onLocationSelect }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    }
  });
  return null;
};

const categories = [
  { value: 'road', label: 'Road', icon: '🛣️', desc: 'Potholes, damaged roads' },
  { value: 'garbage', label: 'Garbage', icon: '🗑️', desc: 'Waste, littering' },
  { value: 'water', label: 'Water', icon: '💧', desc: 'Leaks, supply issues' },
  { value: 'electricity', label: 'Electricity', icon: '⚡', desc: 'Power, streetlights' },
  { value: 'other', label: 'Other', icon: '🔧', desc: 'Other civic issues' }
];

const ReportIssue = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [markerPos, setMarkerPos] = useState(null);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const defaultCenter = [20.5937, 78.9629];
  const mapCenter = markerPos || defaultCenter;

  const handleLocationSelect = async (lat, lng) => {
    setCoordinates([lng, lat]);
    setMarkerPos([lat, lng]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await res.json();
      setAddress(data.display_name);
    } catch {
      setAddress(`${lat}, ${lng}`);
    }
  };

  const getLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await handleLocationSelect(latitude, longitude);
        setLocationLoading(false);
      },
      () => {
        setError('Could not get location. Please click on map.');
        setLocationLoading(false);
      }
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const urls = files.map(f => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) {
      setError('Please select a category.');
      return;
    }
    if (!coordinates) {
      setError('Please select your location on the map or use GPS.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('address', address);
      formData.append('coordinates', JSON.stringify(coordinates));
      formData.append('isAnonymous', isAnonymous.toString());
      images.forEach((image) => formData.append('images', image));
      await createIssue(formData);
      navigate('/issues');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <div className="bg-green-600 text-white py-8 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-1">Report a Civic Issue</h2>
          <p className="text-green-100 text-sm">
            Help make your city better by reporting issues in your area
          </p>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  step >= s
                    ? 'bg-white text-green-600'
                    : 'bg-green-500 text-green-200'
                }`}>
                  {s}
                </div>
                <span className={`text-xs ${step >= s ? 'text-white' : 'text-green-300'}`}>
                  {s === 1 ? 'Details' : s === 2 ? 'Location' : 'Photos'}
                </span>
                {s < 3 && (
                  <div className={`w-8 h-0.5 ${step > s ? 'bg-white' : 'bg-green-500'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Step 1 — Details */}
          <div className={`space-y-5 ${step !== 1 ? 'hidden' : ''}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Issue Details
              </h3>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Issue Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  placeholder="e.g. Large pothole on main road"
                  required
                />
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                  placeholder="Describe the issue in detail..."
                  rows="4"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  {description.length}/500 characters
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`p-3 rounded-lg border text-left transition ${
                        category === cat.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xl mb-1">{cat.icon}</div>
                      <div className="text-xs font-medium text-gray-800">
                        {cat.label}
                      </div>
                      <div className="text-xs text-gray-400">
                        {cat.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Anonymous */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Report Anonymously
                </p>
                <p className="text-xs text-gray-400">
                  Your name won't be shown publicly
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  isAnonymous ? 'bg-green-500' : 'bg-gray-200'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${
                  isAnonymous ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!title || !description || !category) {
                  setError('Please fill all required fields');
                  return;
                }
                setError('');
                setStep(2);
              }}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition"
            >
              Next — Select Location →
            </button>
          </div>

          {/* Step 2 — Location */}
          <div className={`space-y-4 ${step !== 2 ? 'hidden' : ''}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-4">
                Issue Location
              </h3>

              {/* GPS Button */}
              <button
                type="button"
                onClick={getLocation}
                className="w-full bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg hover:bg-green-100 mb-4 text-sm font-medium flex items-center justify-center gap-2"
              >
                {locationLoading
                  ? '⏳ Getting location...'
                  : '📍 Use My Current Location'}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or click on map</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden border border-gray-200 mb-4">
                <MapContainer
                  center={mapCenter}
                  zoom={markerPos ? 15 : 5}
                  style={{ height: '280px', width: '100%' }}
                  key={mapCenter.toString()}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker onLocationSelect={handleLocationSelect} />
                  {markerPos && <Marker position={markerPos} />}
                </MapContainer>
              </div>

              {/* Address */}
              {address ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">📍</span>
                  <span>{address}</span>
                </div>
              ) : (
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-green-500"
                  placeholder="Or type address manually"
                />
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!coordinates) {
                    setError('Please select location first');
                    return;
                  }
                  setError('');
                  setStep(3);
                }}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition"
              >
                Next — Add Photos →
              </button>
            </div>
          </div>

          {/* Step 3 — Photos */}
          <div className={`space-y-4 ${step !== 3 ? 'hidden' : ''}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-800 mb-1">
                Add Photos
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Optional — photos help resolve issues faster
              </p>

              {/* Image Upload */}
              <label className="block border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-green-400 transition">
                <div className="text-4xl mb-2">📸</div>
                <p className="text-sm font-medium text-gray-700">
                  Click to upload photos
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  JPG, PNG up to 5 images
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* Image Previews */}
              {previews.length > 0 && (
                <div className="flex gap-2 flex-wrap mt-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt="preview"
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = images.filter((_, i) => i !== index);
                          const newPreviews = previews.filter((_, i) => i !== index);
                          setImages(newImages);
                          setPreviews(newPreviews);
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-medium text-green-800 mb-2 text-sm">
                📋 Issue Summary
              </h4>
              <div className="space-y-1 text-xs text-green-700">
                <p><span className="font-medium">Title:</span> {title}</p>
                <p><span className="font-medium">Category:</span> {category}</p>
                <p><span className="font-medium">Anonymous:</span> {isAnonymous ? 'Yes' : 'No'}</p>
                <p><span className="font-medium">Photos:</span> {images.length} selected</p>
                <p><span className="font-medium">Location:</span> {address ? address.substring(0, 50) + '...' : 'Not set'}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50"
              >
                {loading ? '⏳ Submitting...' : '✅ Submit Report'}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ReportIssue;