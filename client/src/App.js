import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';


// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Pending from './pages/Pending';
import IssueDetail from './pages/IssueDetail';
import ReportIssue from './pages/ReportIssue';
import Issues from './pages/Issues';
import AdminDashboard from './pages/AdminDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import CitizenDashboard from './pages/CitizenDashboard';




// Add this route

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending" element={<Pending />} />

          {/* Citizen Routes */}

          <Route path="/report" element={
            <ProtectedRoute allowedRoles={['citizen', 'admin']}>
              <ReportIssue />
            </ProtectedRoute>
          } />

          <Route path="/issues" element={<Issues />} />
          <Route path="/issues/:id" element={<IssueDetail />} />


          {/* Worker Routes */}
          <Route path="/worker/dashboard" element={
            <ProtectedRoute allowedRoles={['worker']}>
              <WorkerDashboard />
            </ProtectedRoute>
          } />

        <Route path="/citizen/dashboard" element={
          <ProtectedRoute allowedRoles={['citizen']}>
            <CitizenDashboard />
          </ProtectedRoute>
        } />

          <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;