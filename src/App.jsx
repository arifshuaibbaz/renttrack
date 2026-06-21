import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Login from './pages/Login';
import PendingApproval from './pages/PendingApproval';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import RentTracker from './pages/RentTracker';
import Reports from './pages/Reports';
import Approvals from './pages/Approvals';
import Sidebar from './components/Sidebar';

function AppContent() {
  const { user, status, isOwner, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Logged in but not yet approved (or rejected) — block access to the app.
  if (status !== 'approved') {
    return <PendingApproval />;
  }

  return (
    <BrowserRouter>
      <div className="md:flex min-h-screen bg-slate-900">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/rent-tracker" element={<RentTracker />} />
              <Route path="/reports" element={<Reports />} />
              <Route
                path="/approvals"
                element={isOwner ? <Approvals /> : <Navigate to="/" />}
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
