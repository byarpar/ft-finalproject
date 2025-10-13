import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BookOpenIcon,
  GlobeAltIcon,
  ArrowUpIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import SEO, { SEOConfigs } from '../components/SEO/SEO';

const About = () => {
  const [activeSection, setActiveSection] = useState('mission');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Handle scroll to show/hide scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll to section
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveSection(sectionId);
    }
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Navigation sections
  const sections = [
    { id: 'mission', label: 'Mission' },
    { id: 'story', label: 'The Lisu Language' },
    { id: 'homelands', label: 'Geographic Distribution' }
  ];

  // Lisu geographic regions
  const regions = [
    {
      country: 'China',
      region: 'Yunnan Province',
      description: 'The historical heartland of the Lisu people, with the largest population concentration.',
      population: '~700,000',
      icon: '🇨🇳'
    },
    {
      country: 'Myanmar',
      region: 'Kachin & Shan States',
      description: 'Significant Lisu communities maintaining rich cultural traditions and linguistic diversity.',
      population: '~350,000',
      icon: '🇲🇲'
    },
    {
      country: 'Thailand',
      region: 'Northern Provinces',
      description: 'Vibrant Lisu settlements integrated into Thai society while preserving cultural identity.',
      population: '~50,000',
      icon: '🇹🇭'
    },
    {
      country: 'India',
      region: 'Arunachal Pradesh',
      description: 'Distinct Lisu communities with unique dialectal characteristics and traditions.',
      population: '~20,000',
      icon: '🇮🇳'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* SEO Meta Tags */}
      <SEO {...SEOConfigs.about} />
      <Helmet>
        <title>About Us - Preserving the Lisu Language | Lisu Dictionary</title>
        <meta
          name="description"
          content="Learn about the Lisu Dictionary project, our mission to preserve and promote the Lisu language, the Lisu people, and where this vibrant culture thrives across Asia."
        />
      </Helmet>

      {/* Hero Section - Cultural & Mission Statement */}
      <section className="relative bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-700 text-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/hero/about.png")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 via-teal-800/80 to-teal-700/70" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Lisu-English Dictionary
            </h1>
            <p className="text-2xl md:text-3xl text-teal-50 mb-6 font-light">
              Preserving a Language, Connecting Communities
            </p>
            <p className="text-lg md:text-xl text-teal-100 mb-8 max-w-3xl">
              A comprehensive digital resource for the Lisu language spoken by over one million people across Asia.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Sticky Navigation */}
          <aside className="lg:w-1/4">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* On This Page Navigation */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BookOpenIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  On This Page
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ${activeSection === section.id
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </aside>

          {/* Right Main Content Area */}
          <main className="lg:w-3/4 space-y-16">
            {/* 1. Mission */}
            <section id="mission" className="scroll-mt-24">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Mission
                </h2>

                <div className="prose dark:prose-invert max-w-none mb-8">
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                    The Lisu-English Dictionary is a comprehensive digital resource dedicated to preserving and promoting the Lisu language.
                    Spoken by over one million people across China, Myanmar, Thailand, and India, Lisu is a vital part of cultural identity
                    for communities throughout Asia.
                  </p>
                  <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                    Our dictionary provides accurate translations, pronunciation guides, and usage examples to support language learners,
                    educators, researchers, and native speakers in maintaining this linguistic heritage.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <BookOpenIcon className="w-12 h-12 mx-auto mb-4 text-teal-600 dark:text-teal-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Comprehensive</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Extensive word entries with definitions and examples
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <GlobeAltIcon className="w-12 h-12 mx-auto mb-4 text-teal-600 dark:text-teal-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Accessible</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Free online access for users worldwide
                    </p>
                  </div>
                  <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <UsersIcon className="w-12 h-12 mx-auto mb-4 text-teal-600 dark:text-teal-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Community-Driven</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Built with input from native speakers and linguists
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. The Lisu Language */}
            <section id="story" className="scroll-mt-24">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  The Lisu Language
                </h2>

                <div className="text-gray-700 dark:text-gray-300 space-y-4">
                  <p className="text-lg leading-relaxed">
                    The Lisu people are an ethnic group originating from the mountainous regions of Tibet and western China,
                    with a unique language and culture spanning thousands of years.
                  </p>

                  <p className="leading-relaxed">
                    The Lisu language belongs to the Loloish branch of the Tibeto-Burman language family, spoken by
                    approximately 1.2 million people across Asia. It features diverse orthographic traditions, including
                    the Fraser alphabet (Old Lisu), the New Lisu script, and various other writing systems.
                  </p>

                  <p className="leading-relaxed">
                    Historically an oral language, Lisu saw significant development with the creation of the Fraser script
                    in the early 20th century by James O. Fraser and Sara Ba Thaw, marking a milestone in written
                    documentation.
                  </p>

                  <p className="leading-relaxed">
                    Like many minority languages, Lisu faces challenges from globalization and urbanization. This digital
                    dictionary serves as a living archive and educational resource, preserving the language for current
                    and future generations.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Where Lisu Live - Geographic Distribution */}
            <section id="homelands" className="scroll-mt-24">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Geographic Distribution
                </h2>

                {/* Map Image */}
                <div className="mb-8">
                  <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                    <img
                      src="/images/hero/map.png"
                      alt="Map showing Lisu communities across Southeast Asia"
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-8 text-center">
                            <svg class="w-16 h-16 mx-auto mb-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Geographic Distribution Map</h3>
                            <p class="text-gray-600 dark:text-gray-400">Lisu communities across Southeast Asia</p>
                          </div>
                        `;
                      }}
                    />
                  </div>
                </div>

                {/* Geographic Regions */}
                <div className="space-y-4">
                  {regions.map((region, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-4xl">{region.icon}</div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                              {region.country} – {region.region}
                            </h4>
                            <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-sm font-semibold rounded-full">
                              {region.population}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">
                            {region.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center z-50"
          aria-label="Scroll to top"
        >
          <ArrowUpIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default About;
