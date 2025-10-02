import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, HeartIcon } from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    dictionary: [
      { name: 'Search Words', href: '/search' },
      { name: 'Browse All Words', href: '/words' },
      { name: 'Etymology Guide', href: '/about#etymology' },
      { name: 'Language Info', href: '/about#languages' },
    ],
    support: [
      { name: 'About', href: '/about' },
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Feedback', href: '/feedback' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'License', href: '/license' },
      { name: 'Attribution', href: '/attribution' },
    ],
  };

  return (
    <footer className="bg-gray-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand section */}
          <div className="space-y-8 xl:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <BookOpenIcon className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold text-white">
                English-Lisu Dictionary
              </span>
            </Link>
            <p className="text-gray-400 text-base max-w-md">
              A comprehensive bilingual dictionary bridging English and Lisu languages,
              featuring detailed etymology and word origins to preserve linguistic heritage.
            </p>
            <div className="flex space-x-6">
              {/* Social links can be added here */}
              <a
                href="https://github.com/your-repo"
                className="text-gray-400 hover:text-gray-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links sections */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
                  Dictionary
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.dictionary.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
                  Support
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.support.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">
                  Legal
                </h3>
                <ul className="mt-4 space-y-4">
                  {footerLinks.legal.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className="text-base text-gray-400 hover:text-white transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <p className="text-gray-400 text-sm">
                Supporting linguistic diversity and cultural preservation
              </p>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-base text-gray-400 flex items-center justify-center md:justify-start">
                <span>&copy; {currentYear} English-Lisu Dictionary. Made with</span>
                <HeartIcon className="h-4 w-4 text-red-500 mx-1" />
                <span>for language preservation.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="text-center text-sm text-gray-500">
            <p>
              This dictionary is a community effort to preserve and share the Lisu language.
              Contributions and feedback are welcome.
            </p>
            <p className="mt-2">
              Etymology data sourced from linguistic research and historical records.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
