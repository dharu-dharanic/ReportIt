import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">

        {/* 404 */}
        <h1 className="text-9xl font-bold text-blue-600 mb-4">
          404
        </h1>

        {/* Icon */}
        <div className="text-6xl mb-6">🗺️</div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Go Home
          </button>
          <button
            onClick={() => navigate('/issues')}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg border border-blue-600 hover:bg-blue-50 transition font-medium"
          >
            View Issues
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotFound;