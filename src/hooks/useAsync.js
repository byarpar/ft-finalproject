import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for handling async operations with loading, error, and data states
 * Provides a consistent pattern for data fetching across the application
 * 
 * @hook
 * @param {Function} asyncFunction - Async function to execute
 * @param {boolean} [immediate=true] - Whether to execute immediately on mount
 * @returns {Object} Hook state and methods
 * @returns {any} data - The returned data from async function
 * @returns {boolean} loading - Loading state
 * @returns {Error|null} error - Error object if operation failed
 * @returns {Function} execute - Function to manually trigger execution
 * @returns {Function} reset - Function to reset state
 * 
 * @example
 * const { data, loading, error, execute } = useAsync(
 *   () => api.fetchUsers(),
 *   true
 * );
 * 
 * if (loading) return <SkeletonLoader variant="list" count={5} />;
 * if (error) return <div>Error: {error.message}</div>;
 * return <div>{data}</div>;
 */
const useAsync = (asyncFunction, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  // Execute the async function
  const execute = useCallback(
    async (...params) => {
      setLoading(true);
      setError(null);

      try {
        const response = await asyncFunction(...params);
        setData(response);
        return response;
      } catch (err) {
        setError(err);
        console.error('Async operation failed:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  // Reset all states
  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  // Execute immediately if specified
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, execute, reset };
};

export default useAsync;
