import React from 'react';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  GlobeAltIcon,
  HeartIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  MapIcon
} from '@heroicons/react/24/outline';

const About = () => {
  const teamMembers = [
    {
      name: 'Dr. Lisu Chen',
      role: 'Founder & Chief Linguist',
      image: null,
      initials: 'LC',
      bio: 'PhD in Tibeto-Burman linguistics with 20+ years of experience researching and documenting the Lisu language.',
      color: 'bg-teal-600'
    },
    {
      name: 'Byar Par',
      role: 'Lead Developer',
      image: null,
      initials: 'BP',
      bio: 'Full-stack developer passionate about using technology to preserve indigenous languages and cultures.',
      color: 'bg-orange-500'
    },
    {
      name: 'Elder Mary Alisu',
      role: 'Cultural Advisor',
      image: null,
      initials: 'MA',
      bio: 'Respected Lisu elder and storyteller, ensuring cultural authenticity and traditional knowledge in our content.',
      color: 'bg-purple-600'
    },
    {
      name: 'Sarah Thompson',
      role: 'Community Manager',
      image: null,
      initials: 'ST',
      bio: 'Connecting Lisu speakers worldwide and fostering an inclusive, vibrant learning community.',
      color: 'bg-blue-600'
    }
  ];

  const lisuRegions = [
    { country: 'China', speakers: '700,000+', regions: 'Yunnan, Sichuan' },
    { country: 'Myanmar', speakers: '300,000+', regions: 'Kachin, Shan States' },
    { country: 'Thailand', speakers: '50,000+', regions: 'Northern provinces' },
    { country: 'India', speakers: '60,000+', regions: 'Arunachal Pradesh' }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section with Cultural Image */}
      <section
        className="relative h-[450px] overflow-hidden bg-gradient-to-br from-teal-800 to-teal-600"
        style={{
          backgroundImage: 'url(/images/hero/lisu-people.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30"></div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                About the Lisu<br />Lisu Dictionary
              </h1>
              <p className="text-lg md:text-xl text-white/95 mb-6 leading-relaxed">
                Our Mission to Preserve, Promote, and<br />Connect through the Lisu Language
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center px-6 py-2.5 bg-white text-teal-700 font-medium rounded-md hover:bg-gray-100 transition-colors duration-200 shadow-lg text-sm"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area - Modular Blocks */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        {/* Our Story Section - 3 Column Layout */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Story Block */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Our Story
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                You're downloading this from avast language resource through our comprehensive Lisu-English dictionary and community platform.
              </p>
            </div>

            {/* Vision Block */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Our Vision
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                To become the central hub for Lisu language resources, connecting learners and speakers worldwide.
              </p>
              <div className="flex items-center space-x-3 mt-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">LC</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">BP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* The Lisu Language Block */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                The Lisu Language
              </h2>
              <div className="mb-3">
                <MapIcon className="h-10 w-10 text-teal-600 dark:text-teal-400 mb-2" />
                <p className="text-base font-semibold text-teal-700 dark:text-teal-400 mb-2">
                  ꓡꓲ ꓢꓳ (Lisu)
                </p>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Spoken by over 1 million people and online live this loto Burmese language.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Statement - Full Width */}
        <section className="mb-20 bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 lg:p-12 text-white">
          <div className="flex items-start mb-6">
            <AcademicCapIcon className="h-12 w-12 text-teal-200 mr-4 flex-shrink-0" />
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Our Mission
              </h2>
              <p className="text-xl leading-relaxed text-teal-50">
                To create the most comprehensive and accessible digital Lisu-English dictionary, fostering language learning and cultural understanding while preserving linguistic heritage for future generations.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-2">Preserve</h3>
              <p className="text-teal-100 text-sm">Document and protect the Lisu language in digital form</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-2">Promote</h3>
              <p className="text-teal-100 text-sm">Encourage learning and daily use among all generations</p>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-6 backdrop-blur-sm">
              <h3 className="font-semibold text-lg mb-2">Connect</h3>
              <p className="text-teal-100 text-sm">Bridge communities and cultures through shared language</p>
            </div>
          </div>
        </section>

        {/* The Lisu Language - Detailed Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              About the Lisu Language
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              A rich linguistic tradition spanning centuries and connecting communities across Asia
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
            {/* Origin & Characteristics */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Origins & Characteristics</h3>
              <div className="prose prose-teal max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  The Lisu language belongs to the Lolo-Burmese branch of the Tibeto-Burman language family. It is closely related to other languages in the region and has preserved many ancient linguistic features.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  <strong>Unique Features:</strong>
                </p>
                <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                  <li>• <strong>Tonal System:</strong> 6 distinct tones that change word meanings</li>
                  <li>• <strong>Fraser Script:</strong> Phonetic alphabet created specifically for Lisu</li>
                  <li>• <strong>Rich Oral Tradition:</strong> Epic poems, folk songs, and stories</li>
                  <li>• <strong>Cultural Significance:</strong> Deeply tied to Lisu identity and heritage</li>
                </ul>
              </div>
            </div>

            {/* Where It's Spoken */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Where Lisu is Spoken</h3>
              <div className="space-y-4">
                {lisuRegions.map((region, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-l-4 border-teal-600 dark:border-teal-500">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{region.country}</h4>
                      <span className="text-teal-600 dark:text-teal-400 font-semibold">{region.speakers}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{region.regions}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-teal-50 dark:bg-teal-900/20 rounded-lg p-6">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <GlobeAltIcon className="h-5 w-5 text-teal-600 dark:text-teal-400 inline mr-2" />
                  The Lisu people have migrated across Southeast Asia over centuries, creating diverse dialects while maintaining linguistic unity.
                </p>
              </div>
            </div>
          </div>

          {/* Why Preservation Matters */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 dark:border-orange-600 rounded-lg p-8">
            <div className="flex items-start">
              <HeartIcon className="h-8 w-8 text-orange-600 dark:text-orange-400 mr-4 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  Why Language Preservation Matters
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  Every language carries unique ways of understanding the world. When a language disappears, humanity loses irreplaceable knowledge about culture, environment, and human cognition.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  By documenting and promoting Lisu, we help ensure that future generations can access their linguistic heritage, connect with their roots, and contribute to global linguistic diversity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Meet the Team
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Our passionate team of linguists, developers, and community members dedicated to preserving the Lisu language
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="p-6">
                  {/* Avatar */}
                  <div className="flex justify-center mb-4">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <div className={`w-24 h-24 rounded-full ${member.color} flex items-center justify-center`}>
                        <span className="text-2xl font-bold text-white">{member.initials}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 text-center mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-teal-600 dark:text-teal-400 text-center mb-4">
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Contributors Note */}
          <div className="mt-12 text-center bg-gray-50 dark:bg-gray-800 rounded-lg p-8">
            <UsersIcon className="h-12 w-12 text-teal-600 dark:text-teal-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Our Valued Contributors
            </h3>
            <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-6">
              This dictionary wouldn't be possible without the dedicated contributions of over 100 community members, volunteers, and Lisu language speakers who have shared their knowledge and expertise.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Thank you to everyone who has contributed translations, recordings, cultural insights, and feedback!
            </p>
          </div>
        </section>

        {/* Call-to-Action Section */}
        <section className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 lg:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Join Our Mission
          </h2>
          <p className="text-xl text-teal-50 mb-8 max-w-3xl mx-auto">
            Whether you're a Lisu speaker, language learner, or someone passionate about linguistic preservation, there's a place for you in our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contribute"
              className="inline-flex items-center justify-center px-8 py-3 bg-white text-teal-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              Contribute Words
              <ArrowRightIcon className="h-5 w-5 ml-2" />
            </Link>
            <Link
              to="/discussions"
              className="inline-flex items-center justify-center px-8 py-3 bg-teal-800 text-white font-semibold rounded-lg hover:bg-teal-900 transition-colors duration-200 border-2 border-white"
            >
              Join Discussions
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-3 bg-transparent text-white font-semibold rounded-lg hover:bg-white hover:text-teal-700 transition-colors duration-200 border-2 border-white"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
