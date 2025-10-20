import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  ChevronUpIcon,
  ScaleIcon
} from '@heroicons/react/24/outline';
import PageLayout from '../components/Layout/PageLayout';

/**
 * TermsOfService Component
 * 
 * Displays the terms of service for using the Lisu Dictionary platform.
 */

const TermsOfService = () => {
  const [activeSection, setActiveSection] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const lastUpdated = 'October 26, 2024';

  // Table of contents
  const sections = [
    { id: 'acceptance', title: 'Acceptance of Terms', number: '1' },
    { id: 'accounts', title: 'User Accounts', number: '2' },
    { id: 'conduct', title: 'User Conduct', number: '3' },
    { id: 'content', title: 'Content Ownership & Licensing', number: '4' },
    { id: 'intellectual', title: 'Intellectual Property', number: '5' },
    { id: 'disclaimer', title: 'Disclaimer of Warranties', number: '6' },
    { id: 'limitation', title: 'Limitation of Liability', number: '7' },
    { id: 'indemnification', title: 'Indemnification', number: '8' },
    { id: 'governing', title: 'Governing Law', number: '9' },
    { id: 'termination', title: 'Termination', number: '10' },
    { id: 'changes', title: 'Changes to Terms', number: '11' },
    { id: 'contact', title: 'Contact Information', number: '12' }
  ];

  // Handle scroll for active section and back to top button
  useEffect(() => {
    const handleScroll = () => {
      // Show back to top button after scrolling 500px
      setShowBackToTop(window.scrollY > 500);

      // Update active section based on scroll position
      const sectionElements = sections.map(section => ({
        id: section.id,
        element: document.getElementById(section.id)
      }));

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section.element) {
          const rect = section.element.getBoundingClientRect();
          if (rect.top <= 150) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Call once on mount

    return () => window.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smooth scroll to section
  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, []);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  return (
    <PageLayout
      title="Terms of Service - Lisu Dictionary"
      description="Read the Terms of Service for Lisu Dictionary. Understand your rights and responsibilities when using our platform."
      fullWidth={true}
      background=""
    >
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-teal-600 to-cyan-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <ScaleIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Terms of Service
            </h1>
            <p className="text-xl text-teal-50 max-w-3xl mx-auto">
              Please read these terms carefully before using the Lisu Dictionary website
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Table of Contents - Sticky Sidebar */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-teal-600" />
                  Table of Contents
                </h2>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === section.id
                        ? 'bg-teal-50 text-teal-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100:bg-gray-700'
                        }`}
                    >
                      <span className="font-medium">{section.number}.</span> {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content - Terms Document */}
            <main className="lg:col-span-9">
              {/* Mobile Table of Contents */}
              <div className="lg:hidden mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  Table of Contents
                </h2>
                <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="text-left px-3 py-2 rounded-lg text-sm text-teal-600 hover:bg-teal-50:bg-teal-900/20 transition-colors"
                    >
                      {section.number}. {section.title}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Terms Document */}
              <article className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 lg:p-12">
                <header className="mb-8 pb-6 border-b border-gray-200">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Website Terms of Service
                  </h2>
                  <p className="text-sm text-gray-600">
                    Last Updated: {lastUpdated}
                  </p>
                </header>

                {/* Introduction */}
                <div className="prose prose-lg max-w-none mb-8">
                  <p className="text-gray-700 leading-relaxed">
                    Welcome to Lisu Dictionary. By accessing or using our website, mobile application,
                    or any related services (collectively, the "Service"), you agree to be bound by
                    these Terms of Service ("Terms"). If you do not agree to these Terms, please do
                    not use our Service.
                  </p>
                </div>

                {/* Section 1: Acceptance of Terms */}
                <section id="acceptance" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-start gap-3">
                    <span className="text-teal-600">1.</span>
                    Acceptance of Terms
                  </h3>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      By accessing and using Lisu Dictionary, you acknowledge that you have read,
                      understood, and agree to be bound by these Terms of Service and our{' '}
                      <Link to="/privacy" className="text-teal-600 hover:underline font-medium">
                        Privacy Policy
                      </Link>.
                    </p>
                    <p>
                      These Terms constitute a legally binding agreement between you and Lisu Dictionary.
                      If you are using the Service on behalf of an organization, you represent and warrant
                      that you have the authority to bind that organization to these Terms.
                    </p>
                    <p>
                      You must be at least <strong>13 years old</strong> to use this Service. If you are
                      under 18, you must have your parent or legal guardian's permission to use the Service.
                    </p>
                  </div>
                </section>

                {/* Section 2: User Accounts */}
                <section id="accounts" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-start gap-3">
                    <span className="text-teal-600">2.</span>
                    User Accounts
                  </h3>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <h4 className="text-lg font-semibold text-gray-900">
                      2.1 Account Registration
                    </h4>
                    <p>
                      To access certain features of the Service, you may be required to create an account.
                      When creating an account, you agree to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Provide accurate, current, and complete information</li>
                      <li>Maintain and promptly update your account information</li>
                      <li>Maintain the security of your password and account</li>
                      <li>Accept all risks of unauthorized access to your account</li>
                      <li>Notify us immediately of any unauthorized use of your account</li>
                    </ul>

                    <h4 className="text-lg font-semibold text-gray-900 mt-6">
                      2.2 Account Security
                    </h4>
                    <p>
                      You are responsible for maintaining the confidentiality of your account credentials
                      and for all activities that occur under your account. <strong>You agree to immediately
                        notify Lisu Dictionary</strong> of any unauthorized use of your account or any other
                      breach of security.
                    </p>

                    <h4 className="text-lg font-semibold text-gray-900 mt-6">
                      2.3 Account Termination
                    </h4>
                    <p>
                      You may delete your account at any time through your account settings. We reserve
                      the right to suspend or terminate your account at our sole discretion, without
                      notice, for conduct that we believe violates these Terms or is harmful to other
                      users, us, or third parties, or for any other reason.
                    </p>
                  </div>
                </section>

                {/* Section 3: User Conduct */}
                <section id="conduct" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-start gap-3">
                    <span className="text-teal-600">3.</span>
                    User Conduct
                  </h3>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      You agree to use the Service in compliance with all applicable laws and regulations.
                      You further agree NOT to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Post or transmit any content that is illegal, harmful, threatening, abusive,
                        harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
                      <li>Impersonate any person or entity, or falsely state or misrepresent your
                        affiliation with any person or entity</li>
                      <li>Post or transmit any unsolicited advertising, promotional materials, spam,
                        or any other form of solicitation</li>
                      <li>Use the Service to collect or store personal data about other users without
                        their consent</li>
                      <li>Interfere with or disrupt the Service or servers or networks connected to
                        the Service</li>
                      <li>Attempt to gain unauthorized access to any portion of the Service or any
                        other systems or networks</li>
                      <li>Use any automated means (including bots, scrapers, or spiders) to access
                        the Service without our prior written permission</li>
                      <li>Violate our <strong>Community Guidelines</strong></li>
                    </ul>
                    <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
                      <p className="text-amber-900 font-medium">
                        ⚠️ Violation of these conduct rules may result in immediate account suspension
                        or termination, and we may report illegal activities to appropriate authorities.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 4: Content Ownership & Licensing */}
                <section id="content" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-start gap-3">
                    <span className="text-teal-600">4.</span>
                    Content Ownership & Licensing
                  </h3>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <h4 className="text-lg font-semibold text-gray-900">
                      4.1 Your Content
                    </h4>
                    <p>
                      You retain all rights to any content you submit, post, or display on or through
                      the Service ("User Content"). By submitting User Content, you grant Lisu Dictionary
                      a <strong>worldwide, non-exclusive, royalty-free, sublicensable, and transferable
                        license</strong> to use, reproduce, distribute, prepare derivative works of, display,
                      and perform your User Content in connection with the Service.
                    </p>

                    <h4 className="text-lg font-semibold text-gray-900 mt-6">
                      4.2 Content Representations
                    </h4>
                    <p>
                      By submitting User Content, you represent and warrant that:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>You own or have the necessary rights to the content</li>
                      <li>The content does not violate any third-party rights, including copyright,
                        trademark, privacy, or other personal or proprietary rights</li>
                      <li>The content complies with these Terms and all applicable laws</li>
                      <li>You have obtained all necessary permissions and consents</li>
                    </ul>

                    <h4 className="text-lg font-semibold text-gray-900 mt-6">
                      4.3 Content Moderation
                    </h4>
                    <p>
                      We reserve the right (but have no obligation) to <strong>review, monitor, edit,
                        or remove</strong> any User Content at our sole discretion, for any reason, at
                      any time, without notice to you.
                    </p>

                    <h4 className="text-lg font-semibold text-gray-900 mt-6">
                      4.4 Contributions to Dictionary
                    </h4>
                    <p>
                      When you contribute definitions, translations, examples, or other linguistic content
                      to the dictionary database, you agree that such contributions may be:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Made available to all users of the Service</li>
                      <li>Modified or edited for clarity, accuracy, or formatting</li>
                      <li>Used in derivative works or compiled databases</li>
                      <li>Attributed to you (if desired) or provided anonymously</li>
                    </ul>
                  </div>
                </section>

                {/* Section 5: Intellectual Property */}
                <section id="intellectual" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-start gap-3">
                    <span className="text-teal-600">5.</span>
                    Intellectual Property
                  </h3>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      The Service and its original content (excluding User Content), features, and
                      functionality are and will remain the exclusive property of Lisu Dictionary and
                      its licensors. The Service is protected by copyright, trademark, and other laws
                      of both the United States and foreign countries.
                    </p>
                    <p>
                      Our trademarks, logos, and service marks (collectively the "Trademarks") displayed
                      on the Service are the property of Lisu Dictionary. You are not permitted to use
                      these Trademarks without our prior written consent.
                    </p>
                    <p>
                      The dictionary database, including word entries, definitions, pronunciations, and
                      related linguistic data, is the proprietary content of Lisu Dictionary and is
                      protected by intellectual property laws. You may not:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Copy, reproduce, or distribute substantial portions of the dictionary database</li>
                      <li>Create derivative works based on our dictionary content without permission</li>
                      <li>Use automated tools to scrape or extract data from the Service</li>
                      <li>Reverse engineer or attempt to extract source code from the Service</li>
                    </ul>
                  </div>
                </section>

                {/* Section 6: Disclaimer of Warranties */}
                <section id="disclaimer" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-start gap-3">
                    <span className="text-teal-600">6.</span>
                    Disclaimer of Warranties
                  </h3>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
                      <p className="font-medium uppercase text-sm mb-3">
                        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND
                      </p>
                      <p>
                        <strong>TO THE FULLEST EXTENT PERMITTED BY LAW, LISU DICTIONARY DISCLAIMS ALL
                          WARRANTIES, EXPRESS OR IMPLIED</strong>, including but not limited to implied
                        warranties of merchantability, fitness for a particular purpose, and non-infringement.
                      </p>
                    </div>
                    <p>
                      We do not warrant that:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>The Service will function uninterrupted, secure, or available at any particular
                        time or location</li>
                      <li>Any errors or defects will be corrected</li>
                      <li>The Service is free of viruses or other harmful components</li>
                      <li>The results of using the Service will meet your requirements</li>
                      <li>The accuracy, completeness, or reliability of any content, including dictionary
                        entries, translations, or user-generated content</li>
                    </ul>
                    <p>
                      Your use of the Service is at your own risk. While we strive for accuracy in our
                      dictionary content, <strong>we do not guarantee the accuracy or reliability of any
                        linguistic information</strong> provided through the Service.
                    </p>
                  </div>
                </section>

                {/* Section 7: Limitation of Liability */}
                <section id="limitation" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-start gap-3">
                    <span className="text-teal-600">7.</span>
                    Limitation of Liability
                  </h3>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-6">
                      <p className="font-medium uppercase text-sm mb-3">
                        LIMITATION OF DAMAGES
                      </p>
                      <p>
                        <strong>TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL
                          LISU DICTIONARY, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE</strong>
                        for any indirect, incidental, special, consequential, or punitive damages,
                        including without limitation, loss of profits, data, use, goodwill, or other
                        intangible losses, resulting from:
                      </p>
                    </div>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Your access to or use of or inability to access or use the Service</li>
                      <li>Any conduct or content of any third party on the Service</li>
                      <li>Any content obtained from the Service</li>
                      <li>Unauthorized access, use, or alteration of your transmissions or content</li>
                    </ul>
                    <p>
                      <strong>In no event shall our aggregate liability exceed one hundred US dollars
                        ($100) or the amount you paid us, if any, in the past six months.</strong>
                    </p>
                    <p>
                      Some jurisdictions do not allow the exclusion of certain warranties or the
                      limitation or exclusion of liability for incidental or consequential damages.
                      Accordingly, some of the above limitations may not apply to you.
                    </p>
                  </div>
                </section>

                {/* Section 8: Indemnification */}
                <section id="indemnification" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-start gap-3">
                    <span className="text-teal-600">8.</span>
                    Indemnification
                  </h3>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      You agree to <strong>defend, indemnify, and hold harmless</strong> Lisu Dictionary,
                      its parent company, officers, directors, employees, agents, licensors, and suppliers
                      from and against any claims, actions, or demands, including without limitation
                      reasonable legal and accounting fees, arising from or relating to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Your use of or access to the Service</li>
                      <li>Your violation of these Terms</li>
                      <li>Your User Content or any content you post or share</li>
                      <li>Your violation of any rights of another person or entity</li>
                      <li>Your violation of any applicable laws or regulations</li>
                    </ul>
                    <p>
                      We reserve the right to assume the exclusive defense and control of any matter
                      subject to indemnification by you, and you agree to cooperate with our defense
                      of these claims.
                    </p>
                  </div>
                </section>

                {/* Section 9: Governing Law */}
                <section id="governing" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-start gap-3">
                    <span className="text-teal-600">9.</span>
                    Governing Law
                  </h3>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      These Terms shall be governed by and construed in accordance with the laws of
                      <strong> [Your State/Country]</strong>, without regard to its conflict of law
                      provisions.
                    </p>
                    <p>
                      Any legal action or proceeding arising under these Terms will be brought exclusively
                      in the federal or state courts located in <strong>[Your Jurisdiction]</strong>, and
                      you hereby irrevocably consent to personal jurisdiction and venue therein.
                    </p>
                    <p>
                      If you are a consumer based in the European Union, you will benefit from any
                      mandatory provisions of the law of the country in which you are resident.
                    </p>
                  </div>
                </section>

                {/* Section 10: Termination */}
                <section id="termination" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-start gap-3">
                    <span className="text-teal-600">10.</span>
                    Termination
                  </h3>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      We may <strong>terminate or suspend your account and access to the Service
                        immediately, without prior notice or liability</strong>, for any reason whatsoever,
                      including without limitation if you breach these Terms.
                    </p>
                    <p>
                      Upon termination:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Your right to use the Service will immediately cease</li>
                      <li>All provisions of these Terms which by their nature should survive termination
                        shall survive, including ownership provisions, warranty disclaimers,
                        indemnity, and limitations of liability</li>
                      <li>We may delete your account and any content associated with it</li>
                      <li>You remain liable for all obligations incurred prior to termination</li>
                    </ul>
                    <p>
                      If you wish to terminate your account, you may do so by discontinuing your use
                      of the Service or by requesting account deletion through your account settings
                      or by contacting us at{' '}
                      <a href="mailto:support@lisudictionary.com" className="text-teal-600 hover:underline font-medium">
                        support@lisudictionary.com
                      </a>.
                    </p>
                  </div>
                </section>

                {/* Section 11: Changes to Terms */}
                <section id="changes" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-start gap-3">
                    <span className="text-teal-600">11.</span>
                    Changes to Terms
                  </h3>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      We reserve the right, at our sole discretion, to <strong>modify or replace these
                        Terms at any time</strong>. If a revision is material, we will provide at least
                      30 days' notice prior to any new terms taking effect.
                    </p>
                    <p>
                      We will notify you of any changes by:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Posting the new Terms on this page</li>
                      <li>Updating the "Last Updated" date at the top of these Terms</li>
                      <li>Sending an email notification to registered users (for material changes)</li>
                      <li>Displaying a prominent notice on the Service</li>
                    </ul>
                    <p>
                      <strong>Your continued use of the Service after any changes to these Terms
                        constitutes acceptance of those changes.</strong> If you do not agree to the
                      new terms, you must stop using the Service.
                    </p>
                    <p>
                      We encourage you to review these Terms periodically to stay informed about our
                      policies and practices.
                    </p>
                  </div>
                </section>

                {/* Section 12: Contact Information */}
                <section id="contact" className="scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-start gap-3">
                    <span className="text-teal-600">12.</span>
                    Contact Information
                  </h3>
                  <div className="space-y-4 text-gray-700 leading-relaxed">
                    <p>
                      If you have any questions, concerns, or feedback regarding these Terms of Service,
                      please contact us:
                    </p>
                    <div className="bg-teal-50 rounded-lg p-6 border border-teal-200">
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Lisu Dictionary Legal Team
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Email:</strong>{' '}
                          <a href="mailto:legal@lisudictionary.com" className="text-teal-600 hover:underline">
                            legal@lisudictionary.com
                          </a>
                        </p>
                        <p>
                          <strong>General Support:</strong>{' '}
                          <a href="mailto:support@lisudictionary.com" className="text-teal-600 hover:underline">
                            support@lisudictionary.com
                          </a>
                        </p>
                        <p>
                          <strong>Contact Form:</strong>{' '}
                          <Link to="/contact" className="text-teal-600 hover:underline">
                            Contact Page
                          </Link>
                        </p>
                      </div>
                    </div>
                    <p className="text-sm italic">
                      For general help and support questions, please visit our{' '}
                      <Link to="/help" className="text-teal-600 hover:underline font-medium">
                        Help Center
                      </Link>.
                    </p>
                  </div>
                </section>

                {/* Additional Legal Provisions */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Additional Provisions
                  </h3>
                  <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                    <p>
                      <strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy
                      and any other legal notices published by us on the Service, constitute the entire
                      agreement between you and Lisu Dictionary concerning the Service.
                    </p>
                    <p>
                      <strong>Severability:</strong> If any provision of these Terms is held to be
                      invalid or unenforceable, such provision shall be struck and the remaining
                      provisions shall be enforced.
                    </p>
                    <p>
                      <strong>Waiver:</strong> No waiver of any term of these Terms shall be deemed
                      a further or continuing waiver of such term or any other term.
                    </p>
                    <p>
                      <strong>Assignment:</strong> You may not assign or transfer these Terms without
                      our prior written consent. We may assign our rights and obligations under these
                      Terms without restriction.
                    </p>
                    <p>
                      <strong>Force Majeure:</strong> We shall not be liable for any failure to perform
                      our obligations where such failure results from any cause beyond our reasonable
                      control.
                    </p>
                  </div>
                </div>

                {/* Acknowledgment Footer */}
                <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                  <p className="text-gray-700 font-medium mb-4">
                    By using Lisu Dictionary, you acknowledge that you have read, understood, and agree
                    to be bound by these Terms of Service.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      to="/privacy"
                      className="text-teal-600 hover:underline font-medium"
                    >
                      View Privacy Policy
                    </Link>
                    <span className="hidden sm:inline text-gray-400">•</span>
                    <Link
                      to="/help"
                      className="text-teal-600 hover:underline font-medium"
                    >
                      Help Center
                    </Link>
                    <span className="hidden sm:inline text-gray-400">•</span>
                    <Link
                      to="/contact"
                      className="text-teal-600 hover:underline font-medium"
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>
              </article>
            </main>
          </div>
        </div>

        {/* Back to Top Button */}
        {showBackToTop && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 z-50"
            aria-label="Back to top"
          >
            <ChevronUpIcon className="w-6 h-6" />
          </button>
        )}
      </div>
    </PageLayout>
  );
};

export default TermsOfService;
