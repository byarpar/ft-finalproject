import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  BookOpenIcon,
  UserGroupIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ArrowUpIcon,
  SparklesIcon,
  ShieldCheckIcon,
  LightBulbIcon,
  UsersIcon,
  BuildingLibraryIcon
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
    { id: 'mission', label: 'Our Mission & Vision' },
    { id: 'story', label: 'The Lisu Story' },
    { id: 'homelands', label: 'Where Lisu Live' },
    { id: 'approach', label: 'Our Approach' },
    { id: 'team', label: 'Meet The Team' },
    { id: 'impact', label: 'Community Impact' },
    { id: 'partners', label: 'Partners & Supporters' }
  ];

  // Team members data
  const teamMembers = [
    {
      name: 'Dr. Sarah Chen',
      role: 'Founder & Lead Linguist',
      bio: 'Dedicated to preserving endangered languages with over 15 years of field research experience.',
      image: '/images/team/member1.jpg'
    },
    {
      name: 'James Lisu',
      role: 'Cultural Advisor',
      bio: 'Native Lisu speaker and cultural expert, bridging traditional knowledge with modern technology.',
      image: '/images/team/member2.jpg'
    },
    {
      name: 'Maria Rodriguez',
      role: 'Lead Developer',
      bio: 'Building innovative platforms for language preservation and community engagement.',
      image: '/images/team/member3.jpg'
    },
    {
      name: 'David Wong',
      role: 'Community Manager',
      bio: 'Fostering connections and collaboration among Lisu speakers and learners worldwide.',
      image: '/images/team/member4.jpg'
    }
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

  // Impact statistics
  const impactStats = [
    { number: '500+', label: 'Community Contributors' },
    { number: '10,000+', label: 'Dictionary Entries' },
    { number: '50,000+', label: 'Monthly Users' },
    { number: '1,000+', label: 'Audio Pronunciations' }
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
              About Our Project
            </h1>
            <p className="text-2xl md:text-3xl text-teal-50 mb-6 font-light">
              Preserving the Soul of Lisu Language & Culture. Together.
            </p>
            <p className="text-lg md:text-xl text-teal-100 mb-8 max-w-3xl">
              Learn about the mission, history, and people behind the definitive Lisu-English Dictionary,
              and discover where the vibrant Lisu culture thrives.
            </p>
            <button
              onClick={() => scrollToSection('mission')}
              className="inline-flex items-center px-8 py-4 bg-white text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Explore Our Mission
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </button>
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
            {/* 1. Our Mission & Vision */}
            <section id="mission" className="scroll-mt-24">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Our Mission & Vision
                </h2>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Visual Element */}
                  <div className="order-2 md:order-1">
                    <div className="rounded-xl overflow-hidden shadow-xl border-2 border-teal-200 dark:border-teal-700 bg-white dark:bg-gray-700">
                      <img
                        src="/images/hero/LisuCulturalHeritage.png"
                        alt="Lisu Cultural Heritage - Traditional weaving and textile patterns"
                        className="w-full h-auto object-cover"
                        style={{ minHeight: '300px', maxHeight: '400px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 p-8 h-80 flex items-center justify-center">
                              <div class="text-center">
                                <svg class="w-24 h-24 mx-auto mb-4 text-teal-600 dark:text-teal-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                                </svg>
                                <p class="text-teal-700 dark:text-teal-400 font-semibold text-lg">Lisu Cultural Heritage</p>
                                <p class="text-teal-600 dark:text-teal-500 text-sm mt-2">Traditional Weaving & Textiles</p>
                              </div>
                            </div>
                          `;
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center italic">
                      Traditional Lisu weaving - A testament to cultural preservation
                    </p>
                  </div>

                  {/* Text Content */}
                  <div className="order-1 md:order-2 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                        <ShieldCheckIcon className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Preservation</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Documenting and preserving the Lisu language for future generations through comprehensive digital resources.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                        <GlobeAltIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Accessibility</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Making Lisu accessible to learners, educators, and researchers worldwide through our free online platform.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Empowerment</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Supporting Lisu communities in maintaining their linguistic heritage and cultural identity.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <UsersIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Collaboration</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Building a global community of contributors, speakers, and learners working together.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. The Lisu Story */}
            <section id="story" className="scroll-mt-24">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  The Lisu Story: A Language's Enduring Journey
                </h2>

                <div className="prose dark:prose-invert max-w-none">
                  <div className="float-right ml-6 mb-6 w-full md:w-1/2">
                    <div className="rounded-xl overflow-hidden shadow-xl border-2 border-teal-200 dark:border-teal-700">
                      <img
                        src="/images/hero/Language'sEnduringJourney.png"
                        alt="The Lisu Story - A Language's Enduring Journey through history and culture"
                        className="w-full h-auto object-cover"
                        style={{ minHeight: '280px', maxHeight: '380px' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div class="bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 p-8 h-80 flex items-center justify-center">
                              <div class="text-center">
                                <svg class="w-16 h-16 mx-auto mb-3 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <p class="text-teal-700 dark:text-teal-400 font-semibold text-lg">Language's Enduring Journey</p>
                                <p class="text-teal-600 dark:text-teal-500 text-sm mt-2">The Lisu Story</p>
                              </div>
                            </div>
                          `;
                        }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 italic text-center">
                      The enduring journey of the Lisu language through centuries
                    </p>
                  </div>

                  <div className="text-gray-700 dark:text-gray-300 space-y-4">
                    <p className="text-lg leading-relaxed">
                      The Lisu people are an ethnic group with a rich cultural heritage spanning thousands of years.
                      Originating in the mountainous regions of what is now Tibet and western China, the Lisu have
                      developed a unique language and culture that has endured through centuries of migration and change.
                    </p>

                    <p className="leading-relaxed">
                      The Lisu language belongs to the Loloish branch of the Tibeto-Burman language family and is spoken
                      by approximately 1.2 million people across Asia. What makes Lisu particularly fascinating is its
                      diverse orthographic traditions, including the Fraser alphabet (also known as Old Lisu), the New Lisu
                      script, and various other writing systems developed throughout its history.
                    </p>

                    <p className="leading-relaxed">
                      For much of its history, Lisu was primarily an oral language, with knowledge, stories, and traditions
                      passed down through generations by word of mouth. The development of written forms in the early 20th
                      century, particularly the Fraser script by missionaries James O. Fraser and Sara Ba Thaw, marked a
                      significant milestone in Lisu linguistic history.
                    </p>

                    <p className="leading-relaxed">
                      Today, the Lisu language faces the same challenges as many minority languages worldwide: globalization,
                      urbanization, and the dominance of major national languages. Younger generations often grow up speaking
                      the majority language of their country, with Lisu becoming secondary or, in some cases, lost entirely.
                    </p>

                    <div className="bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600 dark:border-teal-400 p-6 rounded-r-lg my-6">
                      <p className="text-teal-900 dark:text-teal-100 font-semibold mb-2">Why a Digital Dictionary Matters</p>
                      <p className="text-teal-800 dark:text-teal-200">
                        A comprehensive digital dictionary serves as more than just a translation tool—it's a living archive
                        of cultural knowledge, a bridge between generations, and a foundation for language education. By
                        documenting words, pronunciations, usage examples, and cultural context, we're preserving the essence
                        of Lisu culture for future generations while making it accessible to learners worldwide.
                      </p>
                    </div>

                    <p className="leading-relaxed">
                      This project was born from the recognition that technology can play a crucial role in language
                      preservation. Our goal is not just to create a static dictionary, but to build a dynamic, community-driven
                      platform where Lisu speakers, learners, and researchers can collaborate to keep the language vibrant
                      and growing.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Where Lisu Live - Geographic Distribution */}
            <section id="homelands" className="scroll-mt-24">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Where Lisu Live: Our Homelands & Linguistic Map
                </h2>

                {/* Map Image */}
                <div className="mb-8">
                  <div className="rounded-lg overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
                    <img
                      src="/images/hero/map.png"
                      alt="Map showing Lisu homelands across China, Myanmar, Thailand, and India"
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-700 dark:to-gray-600 rounded-lg p-8 border-2 border-dashed border-teal-300 dark:border-teal-700">
                            <div class="text-center">
                              <svg class="w-16 h-16 mx-auto mb-4 text-teal-600 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                              </svg>
                              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Lisu Homelands Map</h3>
                              <p class="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Explore the regions below to learn where Lisu speakers live and thrive.</p>
                            </div>
                          </div>
                        `;
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center italic">
                    Geographic distribution of Lisu communities across Southeast Asia
                  </p>
                </div>

                {/* Geographic Regions */}
                <div className="space-y-6">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      Primary Lisu-Speaking Regions
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      The Lisu people are primarily concentrated in the mountainous regions of Southeast Asia,
                      with communities spanning four main countries.
                    </p>
                  </div>

                  {regions.map((region, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-5xl">{region.icon}</div>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                              {region.country} – {region.region}
                            </h4>
                            <span className="px-3 py-1 bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 text-sm font-semibold rounded-full">
                              {region.population}
                            </span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {region.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Migration & Dialects Info */}
                <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <LightBulbIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Linguistic Diversity & Migration
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Geography has played a significant role in shaping Lisu linguistic diversity. Mountain ranges and
                    river valleys have led to the development of distinct dialects, with variations in pronunciation,
                    vocabulary, and even script usage across different regions.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    Historical migration patterns show that Lisu communities have moved southward over centuries,
                    from the Tibetan plateau into present-day Yunnan, and then further into Myanmar, Thailand, and India.
                    Each wave of migration has contributed to the rich tapestry of Lisu culture and language we see today.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Our Approach & Methodology */}
            <section id="approach" className="scroll-mt-24">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Our Approach: Linguistic Rigor, Community Collaboration, Digital Innovation
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-amber-600 dark:bg-amber-500 rounded-lg flex items-center justify-center">
                        <CheckCircleIcon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Source Validation</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Every entry is verified by native speakers and linguistic experts. We cross-reference definitions
                      with established dictionaries, academic resources, and community knowledge to ensure accuracy.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
                        <AcademicCapIcon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Linguistic Excellence</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Our team includes trained linguists who apply professional standards in phonetics, morphology,
                      and semantics to document the Lisu language with academic precision.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-600 dark:bg-green-500 rounded-lg flex items-center justify-center">
                        <UserGroupIcon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Community Engagement</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      We actively involve Lisu communities in the creation process. Contributors can suggest words,
                      improve definitions, and add cultural context, making this a truly collaborative project.
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-purple-600 dark:bg-purple-500 rounded-lg flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Digital Innovation</h3>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      We leverage modern technology including audio pronunciations, etymology tracking, usage examples,
                      and community discussions to create a comprehensive learning resource.
                    </p>
                  </div>
                </div>

                <div className="mt-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                    Our Commitment to Ethics & Accessibility
                  </h4>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                      <span>Free and open access to all dictionary features for learners worldwide</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                      <span>Ethical data handling with respect for contributor privacy and intellectual property</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                      <span>Transparent moderation processes and community-driven content guidelines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                      <span>Commitment to long-term preservation and sustainability of linguistic data</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 5. Meet The Team */}
            <section id="team" className="scroll-mt-24">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Meet Our Dedicated Team & Valued Experts
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                  Our diverse team brings together linguists, developers, cultural experts, and community leaders
                  united by a passion for language preservation.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  {teamMembers.map((member, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {member.name}
                          </h3>
                          <p className="text-teal-600 dark:text-teal-400 font-semibold mb-3">
                            {member.role}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            {member.bio}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center">
                  <Link
                    to="/discussions/members"
                    className="inline-flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-semibold text-lg"
                  >
                    View All Contributors & Community Members
                    <ChevronRightIcon className="w-5 h-5 ml-1" />
                  </Link>
                </div>
              </div>
            </section>

            {/* 6. Community Impact */}
            <section id="impact" className="scroll-mt-24">
              <div className="bg-gradient-to-br from-teal-600 to-cyan-700 rounded-lg shadow-lg p-8 text-white">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Our Impact: Building Bridges of Understanding
                </h2>

                {/* Impact Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  {impactStats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-4xl md:text-5xl font-bold mb-2">
                        {stat.number}
                      </div>
                      <div className="text-teal-100 text-sm md:text-base">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Testimonials */}
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">What Our Community Says</h3>
                  <div className="space-y-4">
                    <blockquote className="border-l-4 border-white/50 pl-4">
                      <p className="text-teal-50 mb-2 italic">
                        "This dictionary has been invaluable for preserving our language and teaching it to my children.
                        It's more than just words—it's our heritage."
                      </p>
                      <cite className="text-sm text-teal-200">— Mary L., Native Lisu Speaker</cite>
                    </blockquote>
                    <blockquote className="border-l-4 border-white/50 pl-4">
                      <p className="text-teal-50 mb-2 italic">
                        "As a researcher, I've found this platform to be an exceptional resource for linguistic study.
                        The audio pronunciations and etymology sections are particularly valuable."
                      </p>
                      <cite className="text-sm text-teal-200">— Dr. John K., Linguist</cite>
                    </blockquote>
                  </div>
                </div>
              </div>
            </section>

            {/* 7. Partners & Supporters */}
            <section id="partners" className="scroll-mt-24">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Our Valued Partners & Supporters
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  We're grateful to collaborate with institutions and organizations that share our commitment
                  to linguistic preservation and cultural heritage.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Partner placeholder cards */}
                  {[
                    { name: 'Academic Institutions', icon: BuildingLibraryIcon, color: 'blue' },
                    { name: 'Cultural Organizations', icon: UserGroupIcon, color: 'purple' },
                    { name: 'Linguistic Societies', icon: AcademicCapIcon, color: 'teal' }
                  ].map((partner, index) => (
                    <div
                      key={index}
                      className={`bg-gradient-to-br from-${partner.color}-50 to-${partner.color}-100 dark:from-${partner.color}-900/20 dark:to-${partner.color}-900/30 rounded-lg p-6 border border-${partner.color}-200 dark:border-${partner.color}-800 text-center`}
                    >
                      <partner.icon className={`w-12 h-12 mx-auto mb-4 text-${partner.color}-600 dark:text-${partner.color}-400`} />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {partner.name}
                      </h3>
                    </div>
                  ))}
                </div>

                <div className="mt-8 text-center bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Interested in partnering with us to support Lisu language preservation?
                  </p>
                  <Link
                    to="/contact"
                    className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    Get in Touch
                    <ChevronRightIcon className="w-5 h-5 ml-2" />
                  </Link>
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
