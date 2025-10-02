import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import SearchBar from '../components/Search/SearchBar';

const Home = () => {
  const features = [
    {
      icon: MagnifyingGlassIcon,
      title: 'Bidirectional Search',
      description: 'Search for words in both English and Lisu with intelligent language detection and autocomplete suggestions.'
    },
    {
      icon: AcademicCapIcon,
      title: 'Etymology & Origins',
      description: 'Discover the fascinating history behind words with detailed etymology information and linguistic development.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Cultural Preservation',
      description: 'Help preserve the Lisu language and culture through comprehensive documentation and community contributions.'
    },
    {
      icon: BookOpenIcon,
      title: 'Comprehensive Definitions',
      description: 'Access detailed definitions, examples, synonyms, and pronunciation guides for enhanced learning.'
    }
  ];

  const stats = [
    { label: 'Dictionary Entries', value: '1,000+' },
    { label: 'Etymology Records', value: '500+' },
    { label: 'Community Users', value: '50+' },
    { label: 'Languages', value: '2' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 to-blue-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              English-Lisu Dictionary
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Bridge languages and cultures with our comprehensive bilingual dictionary
              featuring detailed etymology and word origins.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar
                placeholder="Search English or Lisu words..."
                className="text-lg"
                autoFocus={true}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/search"
                className="btn-primary btn-lg w-full sm:w-auto"
              >
                <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                Advanced Search
              </Link>
              <Link
                to="/about"
                className="btn-secondary btn-lg w-full sm:w-auto"
              >
                Learn More
                <ArrowRightIcon className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Dictionary Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover words, their meanings, and their rich historical backgrounds
              with our comprehensive linguistic tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center group hover:transform hover:scale-105 transition-transform duration-200"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors duration-200">
                  <feature.icon className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Growing Dictionary
            </h2>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Join our community in building the most comprehensive English-Lisu dictionary.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-primary-100 text-lg">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Language Showcase */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Preserving Lisu Heritage
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                The Lisu language is spoken by over 1 million people across China, Myanmar,
                Thailand, and India. Our dictionary helps preserve this rich linguistic
                tradition while making it accessible to new learners worldwide.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Comprehensive word definitions</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Cultural context and usage</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">Historical word development</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Sample Dictionary Entry
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-lg font-medium text-gray-900">English:</span>
                  <span className="text-lg ml-2">mountain</span>
                </div>
                <div>
                  <span className="text-lg font-medium text-gray-900">Lisu:</span>
                  <span className="text-lg ml-2 font-lisu">ꓡꓴꓸ</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Part of Speech:</span>
                  <span className="text-sm ml-2 text-gray-600">noun</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Definition:</span>
                  <p className="text-sm text-gray-600 mt-1">
                    A large natural elevation of the earth's surface
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Etymology:</span>
                  <p className="text-sm text-gray-600 mt-1">
                    From Middle English mountaine, from Old French montaigne...
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Start Exploring Today
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Whether you're learning Lisu, studying linguistics, or preserving cultural heritage,
            our dictionary is your gateway to understanding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/search"
              className="btn-primary btn-lg"
            >
              Start Searching
            </Link>
            <Link
              to="/register"
              className="btn-secondary btn-lg"
            >
              Join Community
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
