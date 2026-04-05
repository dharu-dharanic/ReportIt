// import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useNavigate } from 'react-router-dom';
// import { getAllIssues } from '../services/api';
// import Navbar from '../components/Navbar';

// const Home = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [stats, setStats] = useState({
//     total: 0,
//     resolved: 0,
//     active: 0
//   });
//   const [statsLoading, setStatsLoading] = useState(true);

//   useEffect(() => {
//     fetchStats();
//   }, []);

//   const fetchStats = async () => {
//     try {
//       const { data } = await getAllIssues();
//       const total = data.length;
//       const resolved = data.filter(i => i.status === 'resolved').length;
//       setStats({
//         total,
//         resolved,
//         active: total - resolved
//       });
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setStatsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100">

//       {/* Navbar */}
//       <Navbar />

//       {/* Hero Section */}
//       <div className="flex flex-col items-center justify-center p-16 text-center">
//         <h2 className="text-4xl font-bold text-blue-600 mb-4">
//           Report Civic Issues in Your City
//         </h2>
//         <p className="text-gray-600 text-lg mb-8 max-w-xl">
//           ReportIt helps citizens report and track civic issues like potholes,
//           garbage, water problems and more. Together we can make our city better.
//         </p>
//         {user ? (
//           user.role === 'citizen' && (
//             <button
//               onClick={() => navigate('/report')}
//               className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition"
//             >
//               Report an Issue
//             </button>
//           )
//         ) : (
//           <button
//             onClick={() => navigate('/register')}
//             className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition"
//           >
//             Get Started
//           </button>
//         )}
//       </div>

//       {/* Stats Section */}
//       <div className="flex justify-center gap-8 px-8 pb-8">
//         <div className="bg-white p-6 rounded-lg shadow text-center w-40 hover:shadow-md transition">
//           <h3 className="text-3xl font-bold text-blue-600">
//             {statsLoading ? '...' : stats.total}
//           </h3>
//           <p className="text-gray-600">Issues Reported</p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow text-center w-40 hover:shadow-md transition">
//           <h3 className="text-3xl font-bold text-green-600">
//             {statsLoading ? '...' : stats.resolved}
//           </h3>
//           <p className="text-gray-600">Issues Resolved</p>
//         </div>
//         <div className="bg-white p-6 rounded-lg shadow text-center w-40 hover:shadow-md transition">
//           <h3 className="text-3xl font-bold text-orange-500">
//             {statsLoading ? '...' : stats.active}
//           </h3>
//           <p className="text-gray-600">Active Issues</p>
//         </div>
//       </div>

//       {/* How It Works Section */}
//       <div className="max-w-4xl mx-auto px-8 pb-8">
//         <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
//           How It Works
//         </h3>
//         <div className="grid grid-cols-3 gap-6">
//           <div className="bg-white p-6 rounded-lg shadow text-center hover:shadow-md transition">
//             <div className="text-4xl mb-3">📸</div>
//             <h4 className="font-bold text-gray-800 mb-2">Report</h4>
//             <p className="text-gray-600 text-sm">
//               Take a photo and report any civic issue in your area
//             </p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow text-center hover:shadow-md transition">
//             <div className="text-4xl mb-3">👍</div>
//             <h4 className="font-bold text-gray-800 mb-2">Upvote</h4>
//             <p className="text-gray-600 text-sm">
//               Upvote issues to increase their priority for faster resolution
//             </p>
//           </div>
//           <div className="bg-white p-6 rounded-lg shadow text-center hover:shadow-md transition">
//             <div className="text-4xl mb-3">✅</div>
//             <h4 className="font-bold text-gray-800 mb-2">Track</h4>
//             <p className="text-gray-600 text-sm">
//               Track the status of your reported issues in real time
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Categories Section */}
//       <div className="max-w-4xl mx-auto px-8 pb-8">
//         <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
//           Issue Categories
//         </h3>
//         <div className="grid grid-cols-5 gap-4">
//           {[
//             { icon: '🛣️', label: 'Road' },
//             { icon: '🗑️', label: 'Garbage' },
//             { icon: '💧', label: 'Water' },
//             { icon: '⚡', label: 'Electricity' },
//             { icon: '🔧', label: 'Other' }
//           ].map(cat => (
//             <div
//               key={cat.label}
//               onClick={() => navigate('/issues')}
//               className="bg-white p-4 rounded-lg shadow text-center cursor-pointer hover:shadow-md hover:scale-105 transition-all"
//             >
//               <div className="text-3xl mb-2">{cat.icon}</div>
//               <p className="text-gray-600 text-sm">{cat.label}</p>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Footer */}
//       <footer className="bg-blue-600 text-white text-center p-4 mt-4">
//         <p>© {new Date().getFullYear()} ReportIt — Making Cities Better Together</p>
//       </footer>

//     </div>
//   );
// };

// export default Home;






import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAllIssues } from '../services/api';
import Navbar from '../components/Navbar';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    resolved: 0,
    active: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getAllIssues();
      const total = data.length;
      const resolved = data.filter(i => i.status === 'resolved').length;
      setStats({
        total,
        resolved,
        active: total - resolved
      });
    } catch (err) {
      console.log(err);
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="max-w-5xl mx-auto px-6 py-20 text-center">
          <div className="inline-block bg-green-500 text-green-100 text-xs font-medium px-3 py-1 rounded-full mb-6">
            🇮🇳 Making Indian Cities Better
          </div>
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Report Civic Issues
            <span className="block text-green-200">
              In Your City
            </span>
          </h1>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            ReportIt connects citizens with local authorities to resolve
            civic issues faster. Together we build better cities.
          </p>
          <div className="flex gap-4 justify-center">
            {user ? (
              user.role === 'citizen' && (
                <button
                  onClick={() => navigate('/report')}
                  className="bg-white text-green-600 px-8 py-3 rounded-xl font-semibold hover:bg-green-50 transition shadow-lg"
                >
                  + Report an Issue
                </button>
              )
            ) : (
              <>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-white text-green-600 px-8 py-3 rounded-xl font-semibold hover:bg-green-50 transition shadow-lg"
                >
                  Get Started Free
                </button>
                <button
                  onClick={() => navigate('/issues')}
                  className="bg-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-400 transition"
                >
                  View Issues
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-5xl mx-auto px-6 -mt-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-100">
            <h3 className="text-4xl font-bold text-green-600 mb-1">
              {statsLoading ? '...' : stats.total}
            </h3>
            <p className="text-gray-500 text-sm">Issues Reported</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-100">
            <h3 className="text-4xl font-bold text-blue-600 mb-1">
              {statsLoading ? '...' : stats.resolved}
            </h3>
            <p className="text-gray-500 text-sm">Issues Resolved</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-100">
            <h3 className="text-4xl font-bold text-orange-500 mb-1">
              {statsLoading ? '...' : stats.active}
            </h3>
            <p className="text-gray-500 text-sm">Active Issues</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            How ReportIt Works
          </h2>
          <p className="text-gray-500">
            Three simple steps to get your civic issue resolved
          </p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[
            {
              step: '01',
              icon: '📸',
              title: 'Report',
              desc: 'Take a photo and report any civic issue in your area with exact GPS location'
            },
            {
              step: '02',
              icon: '👍',
              title: 'Upvote',
              desc: 'Upvote issues reported by others to increase their priority for faster resolution'
            },
            {
              step: '03',
              icon: '✅',
              title: 'Track',
              desc: 'Track the status of your reported issues in real time and get notified instantly'
            }
          ].map(item => (
            <div
              key={item.step}
              className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition"
            >
              <div className="text-xs font-bold text-green-600 mb-3">
                STEP {item.step}
              </div>
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">
                {item.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Issue Categories
            </h2>
            <p className="text-gray-500">
              Report any type of civic issue in your area
            </p>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {[
              { icon: '🛣️', label: 'Road', color: 'bg-red-50 hover:bg-red-100' },
              { icon: '🗑️', label: 'Garbage', color: 'bg-yellow-50 hover:bg-yellow-100' },
              { icon: '💧', label: 'Water', color: 'bg-blue-50 hover:bg-blue-100' },
              { icon: '⚡', label: 'Electricity', color: 'bg-purple-50 hover:bg-purple-100' },
              { icon: '🔧', label: 'Other', color: 'bg-gray-50 hover:bg-gray-100' }
            ].map(cat => (
              <div
                key={cat.label}
                onClick={() => navigate('/issues')}
                className={`${cat.color} p-6 rounded-xl text-center cursor-pointer transition`}
              >
                <div className="text-4xl mb-2">{cat.icon}</div>
                <p className="text-gray-700 font-medium text-sm">{cat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!user && (
        <div className="bg-green-600 py-16">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Make a Difference?
            </h2>
            <p className="text-green-100 mb-8">
              Join thousands of citizens already making their cities better
            </p>
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-green-600 px-8 py-3 rounded-xl font-semibold hover:bg-green-50 transition shadow-lg"
            >
              Join ReportIt Today
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-8">
        <div className="max-w-5xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 text-white w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm">
              R
            </div>
            <span className="text-white font-bold">
              Report<span className="text-green-400">It</span>
            </span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} ReportIt — Making Cities Better Together
          </p>
          <div className="flex gap-4 text-sm">
            <button
              onClick={() => navigate('/issues')}
              className="hover:text-white transition"
            >
              Issues
            </button>
            <button
              onClick={() => navigate('/register')}
              className="hover:text-white transition"
            >
              Register
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;