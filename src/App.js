import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';

// Components
// import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import PrivateRoute from './components/Auth/PrivateRoute';
import AdminRoute from './components/Auth/AdminRoute';

// Pages
import Home from './pages/Home';
import Dictionary from './pages/Dictionary';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import AuthCallback from './pages/AuthCallback';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import Discussions from './pages/Discussions';
import NewDiscussion from './pages/NewDiscussion';
import DiscussionThread from './pages/DiscussionThread';
import Members from './pages/Members';
import UserProfile from './pages/UserProfile';
import HelpCenter from './pages/HelpCenter';
import HelpCategory from './pages/HelpCategory';
import HelpArticle from './pages/HelpArticle';
import HelpSearch from './pages/HelpSearch';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Contribute from './pages/Contribute';
import FAQ from './pages/FAQ';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import WordDetail from './pages/WordDetail';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create a component to handle conditional navbar rendering
/*
const ConditionalNavbar = () => {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';
  const isHelpPage = location.pathname.startsWith('/help');
  const isDictionaryPage = location.pathname === '/dictionary' || location.pathname === '/search';
  const isDiscussionsPage = location.pathname.startsWith('/discussions');
  const isAboutPage = location.pathname === '/about';
  const isUserProfilePage = location.pathname.startsWith('/users/');
  const isSettingsPage = location.pathname === '/settings';
  const isChatPage = location.pathname.startsWith('/chat');
  const isWordDetailPage = location.pathname.startsWith('/word/') || location.pathname.startsWith('/words/');

  // Don't render navbar on admin pages, home page, login page, register page, help pages, dictionary page, discussions pages, about page, user profile pages, settings page, word detail pages, or chat page
  if (isAdminPage || isHomePage || isLoginPage || isRegisterPage || isHelpPage || isDictionaryPage || isDiscussionsPage || isAboutPage || isUserProfilePage || isSettingsPage || isWordDetailPage || isChatPage) {
    return null;
  }

  return <Navbar />;
};
*/

// Create a component to handle conditional footer rendering
const ConditionalFooter = () => {
  const location = useLocation();
  const isDiscussionsPage = location.pathname.startsWith('/discussions');
  const isTagsPage = location.pathname.startsWith('/tags');
  const isChatPage = location.pathname.startsWith('/chat');
  const isAdminPage = location.pathname.startsWith('/admin');

  // Don't render footer on discussions, tags, chat, or admin pages
  if (isDiscussionsPage || isTagsPage || isChatPage || isAdminPage) {
    return null;
  }

  return <Footer />;
};

function App() {
  return (
    <HelmetProvider>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || ''}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 flex flex-col">
                {/* <ConditionalNavbar /> */}
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/dictionary" element={<Dictionary />} />
                    <Route path="/search" element={<Dictionary />} />
                    <Route path="/word/:id" element={<WordDetail />} />
                    <Route path="/words/:id" element={<WordDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/contribute" element={<Contribute />} />
                    <Route path="/faq" element={<FAQ />} />

                    {/* Legal Pages */}
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                    {/* Help Center Routes */}
                    <Route path="/help" element={<HelpCenter />} />
                    <Route path="/help/category/:categoryId" element={<HelpCategory />} />
                    <Route path="/help/article/:articleId" element={<HelpArticle />} />
                    <Route path="/help/search" element={<HelpSearch />} />

                    {/* Protected Discussions Routes - Login Required */}
                    <Route path="/discussions" element={
                      <PrivateRoute>
                        <Discussions />
                      </PrivateRoute>
                    } />
                    <Route path="/discussions/new" element={
                      <PrivateRoute>
                        <NewDiscussion />
                      </PrivateRoute>
                    } />
                    <Route path="/discussions/members" element={
                      <PrivateRoute>
                        <Members />
                      </PrivateRoute>
                    } />
                    <Route path="/discussions/:id" element={
                      <PrivateRoute>
                        <DiscussionThread />
                      </PrivateRoute>
                    } />
                    <Route path="/users" element={
                      <PrivateRoute>
                        <Members />
                      </PrivateRoute>
                    } />
                    <Route path="/users/:userId" element={
                      <PrivateRoute>
                        <UserProfile />
                      </PrivateRoute>
                    } />
                    {/* <Route path="/tags" element={<Tags />} /> */}
                    <Route path="/chat" element={
                      <PrivateRoute>
                        <Chat />
                      </PrivateRoute>
                    } />

                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify-email" element={<VerifyEmail />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    } />
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
            </Router>
          </AuthProvider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </HelmetProvider>
  );
}

export default App;
