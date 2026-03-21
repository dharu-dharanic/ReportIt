import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIssue } from '../services/api';
import Navbar from '../components/Navbar';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle map click
const LocationPicker = ({ onLocationSelect }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    }
  });
  return null;
};

const ReportIssue = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('road');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [markerPos, setMarkerPos] = useState(null);
  const [images, setImages] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
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
        setError('Could not get location. Please click on map to select location.');
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      images.forEach((image) => {
        formData.append('images', image);
      });
      await createIssue(formData);
      navigate('/issues');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report issue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <Navbar />

      <div className="max-w-2xl mx-auto p-6">

        <h2 className="text-2xl font-bold text-blue-600 mb-6">
          Report an Issue
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">

          {/* Title */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">
              Issue Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
              placeholder="e.g. Large pothole on main road"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
              placeholder="Describe the issue in detail..."
              rows="4"
              required
            />
          </div>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
            >
              <option value="road">🛣️ Road</option>
              <option value="garbage">🗑️ Garbage</option>
              <option value="water">💧 Water</option>
              <option value="electricity">⚡ Electricity</option>
              <option value="other">🔧 Other</option>
            </select>
          </div>

          {/* Location */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">
              Location
            </label>

            {/* GPS Button */}
            <button
              type="button"
              onClick={getLocation}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-3 text-sm"
            >
              {locationLoading ? 'Getting location...' : '📍 Use My Current Location'}
            </button>

            {/* Map Picker */}
            <div className="rounded-lg overflow-hidden border border-gray-300 mb-3">
              <p className="text-xs text-gray-500 bg-gray-50 px-3 py-1.5 border-b">
                📌 Click anywhere on map to select location
              </p>
              <MapContainer
                center={mapCenter}
                zoom={markerPos ? 15 : 5}
                style={{ height: '250px', width: '100%' }}
                key={mapCenter.toString()}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationPicker onLocationSelect={handleLocationSelect} />
                {markerPos && (
                  <Marker position={markerPos} />
                )}
              </MapContainer>
            </div>

            {/* Address Display */}
            {address ? (
              <div className="bg-green-50 border border-green-200 rounded p-2 text-sm text-gray-700">
                📍 {address}
              </div>
            ) : (
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 text-sm"
                placeholder="Or type address manually"
              />
            )}
          </div>

          {/* Images */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium">
              Upload Images (optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImages(Array.from(e.target.files))}
              className="w-full border border-gray-300 rounded p-2 text-sm"
            />
            {images.length > 0 && (
              <p className="text-green-600 text-sm mt-1">
                {images.length} image(s) selected
              </p>
            )}
          </div>

          {/* Anonymous */}
          <div className="mb-6 flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="anonymous" className="text-gray-700 text-sm">
              Report anonymously
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded hover:bg-blue-700 transition font-medium"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ReportIssue;