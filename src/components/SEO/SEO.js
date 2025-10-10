import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component for managing meta tags
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.keywords - SEO keywords (comma-separated)
 * @param {string} props.image - Open Graph image URL
 * @param {string} props.url - Canonical URL
 * @param {string} props.type - Open Graph type (default: 'website')
 * @param {Object} props.structuredData - JSON-LD structured data
 */
const SEO = ({
  title = 'English-Lisu Dictionary | Learn Lisu Language with Etymology',
  description = 'Free English-Lisu dictionary with 59+ words, detailed etymology, examples, and translations. Learn the Lisu language with pronunciation guides, synonyms, and community discussions.',
  keywords = 'English-Lisu dictionary, Lisu language, Lisu translation, English to Lisu, Lisu etymology, learn Lisu, Lisu Fraser script, minority language dictionary, language learning',
  image = '/images/hero/lisu-people.jpg',
  url = window.location.href,
  type = 'website',
  structuredData = null
}) => {
  const siteUrl = process.env.REACT_APP_SITE_URL || 'https://www.lisudictionar.com';
  const fullImageUrl = image.startsWith('http') ? image : `${siteUrl}${image}`;
  const canonicalUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="Lisu Dictionary" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />

      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;

// Predefined SEO configs for common pages
export const SEOConfigs = {
  home: {
    title: 'English-Lisu Dictionary | Learn Lisu Language with Etymology',
    description: 'Free English-Lisu dictionary with 59+ words, detailed etymology, examples, and translations. Learn the Lisu language with pronunciation guides, synonyms, and community discussions.',
    keywords: 'English-Lisu dictionary, Lisu language, Lisu translation, English to Lisu, Lisu etymology, learn Lisu',
    url: '/'
  },

  dictionary: {
    title: 'Browse Dictionary | English-Lisu Dictionary',
    description: 'Browse our comprehensive English-Lisu dictionary with detailed word meanings, etymology, examples, synonyms, and antonyms. Learn Lisu language effectively.',
    keywords: 'Lisu dictionary, browse Lisu words, English to Lisu translation, Lisu vocabulary',
    url: '/dictionary'
  },

  discussions: {
    title: 'Community Discussions | Lisu Dictionary',
    description: 'Join the Lisu language learning community. Ask questions, share insights, and discuss Lisu language, culture, and etymology with fellow learners.',
    keywords: 'Lisu language community, Lisu discussions, learn Lisu online, Lisu language forum',
    url: '/discussions'
  },

  about: {
    title: 'About Us | Lisu Dictionary',
    description: 'Learn about the Lisu Dictionary project, our mission to preserve and promote the Lisu language, and the team behind this comprehensive English-Lisu dictionary.',
    keywords: 'about Lisu dictionary, Lisu language preservation, Lisu culture, Lisu Fraser script',
    url: '/about'
  },

  contact: {
    title: 'Contact Us | Lisu Dictionary',
    description: 'Get in touch with the Lisu Dictionary team. We welcome feedback, suggestions, and collaboration opportunities to improve Lisu language resources.',
    keywords: 'contact Lisu dictionary, Lisu language support, feedback',
    url: '/contact'
  },

  members: {
    title: 'Community Members | Lisu Dictionary',
    description: 'Discover active members of the Lisu Dictionary community. Connect with Lisu language learners, native speakers, and contributors.',
    keywords: 'Lisu community, Lisu speakers, language learners',
    url: '/members'
  }
};

// Helper function to generate word detail SEO
export const generateWordSEO = (word) => {
  if (!word) return SEOConfigs.dictionary;

  return {
    title: `${word.english_word} in Lisu | ${word.lisu_word} | English-Lisu Dictionary`,
    description: `Learn the Lisu translation of "${word.english_word}" (${word.lisu_word}). ${word.meaning || word.english_definition || ''} Includes etymology, examples, synonyms, and pronunciation.`,
    keywords: `${word.english_word} in Lisu, ${word.lisu_word}, Lisu translation ${word.english_word}, ${word.part_of_speech || ''}`,
    url: `/words/${word.id}`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      "name": word.english_word,
      "inDefinedTermSet": "Lisu Dictionary",
      "description": word.meaning || word.english_definition,
      "termCode": word.lisu_word,
      "url": `https://www.lisudictionar.com/words/${word.id}`
    }
  };
};

// Helper function to generate discussion SEO
export const generateDiscussionSEO = (discussion) => {
  if (!discussion) return SEOConfigs.discussions;

  return {
    title: `${discussion.title} | Lisu Dictionary Discussions`,
    description: discussion.content?.substring(0, 155) + '...' || 'Join the discussion about Lisu language and culture.',
    keywords: `Lisu discussion, ${discussion.tags?.join(', ') || 'Lisu language'}`,
    url: `/discussion/${discussion.id}`,
    type: 'article',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "DiscussionForumPosting",
      "headline": discussion.title,
      "text": discussion.content,
      "author": {
        "@type": "Person",
        "name": discussion.created_by_name || "Anonymous"
      },
      "datePublished": discussion.created_at,
      "interactionStatistic": {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/CommentAction",
        "userInteractionCount": discussion.answer_count || 0
      }
    }
  };
};

// Helper function to generate user profile SEO
export const generateUserProfileSEO = (profile) => {
  if (!profile) return SEOConfigs.members;

  return {
    title: `${profile.full_name || profile.username} | Lisu Dictionary Community`,
    description: `View ${profile.full_name || profile.username}'s profile. ${profile.bio || 'Active member of the Lisu Dictionary community.'}`,
    keywords: `Lisu community member, ${profile.username}`,
    url: `/profile/${profile.username}`,
    type: 'profile',
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": profile.full_name || profile.username,
      "description": profile.bio,
      "url": `https://www.lisudictionar.com/profile/${profile.username}`
    }
  };
};
