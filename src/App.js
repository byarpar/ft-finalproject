import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import PrivateRoute from './components/Auth/PrivateRoute';
import AdminRoute from './components/Auth/AdminRoute';

// Pages
import Home from './pages/Home';
import Search from './pages/Search';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminWords from './pages/AdminWords';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';
import AdminSearch from './components/admin/AdminSearch';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import Discussions from './pages/Discussions';

// Toaster component that responds to theme
const ThemedToaster = () => {
  const { darkMode } = useTheme();

  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: darkMode ? '#374151' : '#fff',
          color: darkMode ? '#f9fafb' : '#111827',
          border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
        },
        success: {
          style: {
            background: darkMode ? '#065f46' : '#ecfdf5',
            color: darkMode ? '#d1fae5' : '#065f46',
            border: darkMode ? '1px solid #059669' : '1px solid #a7f3d0',
          },
        },
        error: {
          style: {
            background: darkMode ? '#7f1d1d' : '#fef2f2',
            color: darkMode ? '#fecaca' : '#7f1d1d',
            border: darkMode ? '1px solid #dc2626' : '1px solid #fca5a5',
          },
        },
      }}
    />
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create a component to handle conditional footer rendering
const ConditionalFooter = () => {
  const location = useLocation();
  const isDiscussionsPage = location.pathname.startsWith('/discussions');

  // Don't render footer on discussions pages
  if (isDiscussionsPage) {
    return null;
  }

  return <Footer />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-300">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/discussions" element={<Discussions />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected Routes */}
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } />

                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                  <Route path="/admin/words" element={
                    <AdminRoute>
                      <AdminWords />
                    </AdminRoute>
                  } />
                  <Route path="/admin/users" element={
                    <AdminRoute>
                      <AdminUsers />
                    </AdminRoute>
                  } />
                  <Route path="/admin/settings" element={
                    <AdminRoute>
                      <AdminSettings />
                    </AdminRoute>
                  } />
                  <Route path="/admin/search" element={
                    <AdminRoute>
                      <AdminSearch />
                    </AdminRoute>
                  } />

                  {/* Error Pages */}
                  <Route path="/500" element={<ServerError />} />

                  {/* Catch-all route for 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <ConditionalFooter />
              <ThemedToaster />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
