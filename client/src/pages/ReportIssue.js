import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIssue } from '../services/api';
import Navbar from '../components/Navbar';

const ReportIssue = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('road');
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState(null);
  const [images, setImages] = useState([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const navigate = useNavigate();

  const getLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates([longitude, latitude]);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          setAddress(data.display_name);
        } catch {
          setAddress(`${latitude}, ${longitude}`);
        }
        setLocationLoading(false);
      },
      () => {
        setError('Could not get location. Please enter address manually.');
        setLocationLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!coordinates) {
      setError('Please get your location first.');
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
            <label className="block text-gray-700 mb-2">Issue Title</label>
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
            <label className="block text-gray-700 mb-2">Description</label>
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
            <label className="block text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500"
            >
              <option value="road">Road</option>
              <option value="garbage">Garbage</option>
              <option value="water">Water</option>
              <option value="electricity">Electricity</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Location */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Location</label>
            <button
              type="button"
              onClick={getLocation}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-2"
            >
              {locationLoading ? 'Getting location...' : '📍 Get My Location'}
            </button>
            {address && (
              <p className="text-gray-600 text-sm bg-green-50 p-2 rounded">
                📍 {address}
              </p>
            )}
            {!address && (
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 mt-2"
                placeholder="Or enter address manually"
              />
            )}
          </div>

          {/* Images */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Upload Images (optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImages(Array.from(e.target.files))}
              className="w-full border border-gray-300 rounded p-2"
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
            <label htmlFor="anonymous" className="text-gray-700">
              Report anonymously
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ReportIssue;