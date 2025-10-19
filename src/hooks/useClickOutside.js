import { useEffect } from 'react';

/**
 * Custom hook to detect clicks outside of a referenced element
 * @param {React.RefObject} ref - React ref object pointing to the element
 * @param {function} handler - Callback function to execute when click occurs outside
 */
const useClickOutside = (ref, handler) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler]);
};

export default useClickOutside;
