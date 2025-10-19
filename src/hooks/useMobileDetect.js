import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the viewport is mobile-sized
 * @param {number} breakpoint - The pixel width to consider as mobile (default: 768)
 * @returns {boolean} True if viewport width is less than the breakpoint
 */
const useMobileDetect = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < breakpoint);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
};

export default useMobileDetect;
