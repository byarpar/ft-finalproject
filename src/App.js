import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './contexts/AuthContext';

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

/**
 * PageLoadingBar — thin teal progress bar shown on every route change.
 * Renders inside the Router so it can access useLocation.
 */
const PageLoadingBar = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);

  const animate = useCallback(() => {
    setVisible(true);
    setWidth(0);
    // Quick jump to 70%, then slowly inch towards 95%
    const t1 = setTimeout(() => setWidth(70), 20);
    const t2 = setTimeout(() => setWidth(90), 300);
    const t3 = setTimeout(() => {
      setWidth(100);
      const t4 = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 300);
      return () => clearTimeout(t4);
    }, 700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  useEffect(() => {
    const cleanup = animate();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-0.5">
      <div
        className="h-full bg-teal-500 transition-all ease-out shadow-[0_0_8px_rgba(20,184,166,0.8)]"
        style={{ width: `${width}%`, transitionDuration: width === 100 ? '200ms' : '600ms' }}
      />
    </div>
  );
};

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/restore-account', '/auth/callback'];

const ConditionalContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAuthPage = AUTH_PATHS.some(p => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PageLoadingBar />
      {/* Hide navbar on admin and auth pages */}
      {!isAdminPage && !isAuthPage && <Navbar />}

      {/* Main content with conditional padding */}
      <main className={`flex-grow ${!isAdminPage && !isAuthPage ? 'pt-14' : ''}`}>
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

          <Route path="/chat" element={
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
  const isAuthPage = AUTH_PATHS.some(p => location.pathname.startsWith(p));

  // Don't render footer on discussions, tags, admin, messages, or auth pages
  if (isDiscussionsPage || isTagsPage || isAdminPage || isMessagesPage || isAuthPage) {
    return null;
  }

  return <Footer />;
};

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
      <AuthProvider>
        <Router>
          <AppBootLoader />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

/**
 * AppBootLoader — waits for AuthContext to finish verifying the token
 * then renders the main app. Prevents content flash on first load.
 */
const AppBootLoader = () => {
  const { loading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-teal-100" />
            <div className="absolute inset-0 rounded-full border-4 border-t-teal-600 animate-spin" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return <ConditionalContent />;
};

export default App;
