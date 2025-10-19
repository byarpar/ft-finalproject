import React from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

/**
 * Universal page layout wrapper component
 * Provides consistent page structure, SEO meta tags, and accessibility
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} props.title - Page title (for browser tab and SEO)
 * @param {string} [props.description] - Meta description for SEO
 * @param {string} [props.className] - Additional CSS classes for main container
 * @param {boolean} [props.fullWidth=false] - Whether content should span full width
 * @param {string} [props.background='bg-gray-50'] - Background classes
 * @param {Object} [props.meta] - Additional meta tags
 */
const PageLayout = ({
  children,
  title,
  description,
  className = '',
  fullWidth = false,
  background = 'bg-gray-50',
  meta = {}
}) => {
  // Construct full title
  const fullTitle = title ? `${title} | Lisu Dictionary` : 'Lisu Dictionary';

  // Default description
  const metaDescription = description || 'Learn and explore the Lisu language with our comprehensive dictionary, discussions, and community resources.';

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{fullTitle}</title>
        <meta name="description" content={metaDescription} />

        {/* Open Graph */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={metaDescription} />

        {/* Additional custom meta tags */}
        {Object.entries(meta).map(([key, value]) => (
          <meta key={key} name={key} content={value} />
        ))}
      </Helmet>

      {/* Page Container */}
      <div
        className={`min-h-screen ${background} transition-colors duration-300`}
        role="main"
      >
        {/* Content Container */}
        <div className={fullWidth ? '' : 'container mx-auto px-4 sm:px-6 lg:px-8'}>
          <div className={className}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

PageLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  className: PropTypes.string,
  fullWidth: PropTypes.bool,
  background: PropTypes.string,
  meta: PropTypes.object
};

export default PageLayout;
