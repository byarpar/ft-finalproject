/**
 * Navigation utility functions
 */

/**
 * Check if a path is currently active based on the current location
 * @param {string} path - The path to check
 * @param {object} location - The current location object from useLocation()
 * @returns {boolean} True if the path is active
 */
export const isActive = (path, location) => {
  return location.pathname === path || location.pathname.startsWith(path + '/');
};

/**
 * Handle user logout
 * @param {function} logout - The logout function from auth context
 * @param {function} navigate - The navigate function from useNavigate()
 */
export const handleLogout = async (logout, navigate) => {
  try {
    await logout();
    navigate('/');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
