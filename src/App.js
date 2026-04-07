import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';

// Components
import { Navbar, Footer } from './components/LayoutComponents';
import { PrivateRoute, AdminRoute } from './components/AuthComponents';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import AuthCallback from './pages/AuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import RestoreAccount from './pages/RestoreAccount';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import Discussions from './pages/Discussions';
import NewDiscussion from './pages/NewDiscussion';
import DiscussionThread from './pages/DiscussionThread';
import Members from './pages/Members';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Messages from './pages/Messages';



// Create a component to handle conditional content layout
const ConditionalContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Render navbar only for non-admin pages */}
      {!isAdminPage && <Navbar />}

      {/* Main content with conditional padding */}
      <main className={`flex-grow ${!isAdminPage ? 'pt-14' : ''}`}>
        <Routes>
          <Route path="/" element={<Discussions />} />

          {/* Public Routes - No Login Required */}
          <Route path="/discussions" element={<Discussions />} />
          <Route path="/users" element={<Members />} />
          <Route path="/discussions/members" element={<Members />} />

          {/* Protected Routes - Login Required */}
          <Route path="/discussions/new" element={
            <PrivateRoute>
              <NewDiscussion />
            </PrivateRoute>
          } />
          <Route path="/discussions/:id" element={
            <PrivateRoute>
              <DiscussionThread />
            </PrivateRoute>
          } />
          <Route path="/users/:userId" element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          } />
          <Route path="/profile/:username" element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          } />
          {/* <Route path="/tags" element={<Tags />} /> */}

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/restore-account" element={<RestoreAccount />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Protected Routes */}
          <Route path="/settings" element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } />

          <Route path="/notifications" element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          } />

          <Route path="/messages" element={
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          } />

          {/* Admin Routes - All nested routes handled within AdminDashboard */}
          <Route path="/admin/*" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />

          {/* Error Pages */}
          <Route path="/500" element={<ServerError />} />

          {/* Catch-all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <ConditionalFooter />
      <Toaster position="top-right" />
    </div>
  );
};

// Create a component to handle conditional footer rendering
const ConditionalFooter = () => {
  const location = useLocation();
  const isDiscussionsPage = location.pathname.startsWith('/discussions');
  const isTagsPage = location.pathname.startsWith('/tags');
  const isAdminPage = location.pathname.startsWith('/admin');
  const isMessagesPage = location.pathname.startsWith('/messages');

  // Don't render footer on discussions, tags, admin, or messages pages
  if (isDiscussionsPage || isTagsPage || isAdminPage || isMessagesPage) {
    return null;
  }

  return <Footer />;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
      <AuthProvider>
        <Router>
          <ConditionalContent />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
