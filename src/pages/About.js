import React from 'react';
import { BookOpenIcon, UsersIcon, GlobeAltIcon, HeartIcon } from '@heroicons/react/24/outline';

const About = () => {
  const features = [
    {
      icon: BookOpenIcon,
      title: 'Comprehensive Dictionary',
      description: 'Thousands of English-Lisu word translations with detailed definitions, examples, and pronunciations.'
    },
    {
      icon: UsersIcon,
      title: 'Community Driven',
      description: 'Built by and for the Lisu community to preserve and share our beautiful language with the world.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Cultural Bridge',
      description: 'Connecting Lisu speakers worldwide and helping others learn about our rich cultural heritage.'
    },
    {
      icon: HeartIcon,
      title: 'Language Preservation',
      description: 'Dedicated to preserving the Lisu language for future generations through digital innovation.'
    }
  ];

  const stats = [
    { label: 'Words in Dictionary', value: '10,000+' },
    { label: 'Active Users', value: '5,000+' },
    { label: 'Countries Reached', value: '25+' },
    { label: 'Community Contributors', value: '100+' }
  ];

  const team = [
    {
      name: 'Dr. Sarah Lisu',
      role: 'Chief Linguist',
      image: '/images/team/sarah.jpg',
      bio: 'PhD in Tibeto-Burman linguistics with 20 years of experience in Lisu language research.'
    },
    {
      name: 'John Chen',
      role: 'Technical Lead',
      image: '/images/team/john.jpg',
      bio: 'Full-stack developer passionate about using technology to preserve endangered languages.'
    },
    {
      name: 'Mary Alisu',
      role: 'Cultural Advisor',
      image: '/images/team/mary.jpg',
      bio: 'Elder and storyteller from the Lisu community, ensuring cultural authenticity in our translations.'
    }
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 to-purple-700">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            About Our Dictionary
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Preserving and celebrating the Lisu language through modern technology
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              The English-Lisu Dictionary is more than just a translation tool—it's a bridge between cultures,
              a preservation effort for an indigenous language, and a celebration of linguistic diversity.
              Our mission is to make the beautiful Lisu language accessible to both native speakers and
              language learners worldwide.
            </p>
          </div>

          <div className="prose prose-lg prose-blue mx-auto">
            <h3>The Lisu Language</h3>
            <p>
              Lisu is a Tibeto-Burman language spoken by approximately 1 million people across China,
              Myanmar, Thailand, and India. It has a rich oral tradition and a unique writing system
              that reflects the cultural heritage of the Lisu people.
            </p>

            <h3>Why This Dictionary Matters</h3>
            <p>
              In our increasingly connected world, smaller languages face the risk of being overshadowed
              by more dominant ones. This dictionary serves as a digital preservation effort, ensuring
              that the Lisu language continues to thrive in the digital age while making it accessible
              to new generations and curious learners.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Makes Us Special
            </h2>
            <p className="text-lg text-gray-600">
              Discover the features that make our dictionary unique
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-blue-600 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-blue-100">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Meet Our Team
          </h2>
          <p className="text-lg text-gray-600">
            The passionate people behind the dictionary
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {team.map((member, index) => (
            <div key={index} className="text-center">
              <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <div className="text-gray-400 text-lg font-medium">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {member.name}
              </h3>
              <p className="text-blue-600 font-medium mb-3">
                {member.role}
              </p>
              <p className="text-gray-600 text-sm">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact/Contribute Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Get Involved
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            We're always looking for contributors, whether you're a native Lisu speaker,
            a language enthusiast, or a developer who wants to help preserve endangered languages.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:contact@english-lisu-dictionary.org"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="/contribute"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Contribute Words
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
