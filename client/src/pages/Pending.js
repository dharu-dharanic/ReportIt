import { useNavigate } from 'react-router-dom';

const Pending = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">

        {/* Icon */}
        <div className="text-6xl mb-4">⏳</div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-yellow-500 mb-4">
          Account Pending Approval
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-2">
          Your worker account registration has been received.
        </p>
        <p className="text-gray-600 mb-6">
          Please wait for admin approval before logging in.
        </p>

        {/* Status Badge */}
        <div className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full inline-block mb-6">
          Status: Pending ⏳
        </div>

        {/* What happens next */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
          <h3 className="font-bold text-gray-700 mb-2">What happens next?</h3>
          <ul className="text-gray-600 space-y-2">
            <li>✅ Admin reviews your registration</li>
            <li>✅ Admin approves your account</li>
            <li>✅ You can login with full access</li>
          </ul>
        </div>

        {/* Login Button */}
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
        >
          Go to Login
        </button>

      </div>
    </div>
  );
};

export default Pending;