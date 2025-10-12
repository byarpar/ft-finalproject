import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShieldCheckIcon,
  ChevronUpIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const lastUpdated = 'October 26, 2024';

  // Table of contents
  const sections = [
    { id: 'introduction', title: 'Introduction', number: '1' },
    { id: 'data-collect', title: 'What Data We Collect', number: '2' },
    { id: 'data-use', title: 'How We Use Your Data', number: '3' },
    { id: 'data-share', title: 'How We Share Your Data', number: '4' },
    { id: 'data-retention', title: 'Data Retention & Security', number: '5' },
    { id: 'your-rights', title: 'Your Rights & Choices', number: '6' },
    { id: 'children', title: 'Children\'s Privacy', number: '7' },
    { id: 'third-party', title: 'Links to Other Websites', number: '8' },
    { id: 'changes', title: 'Changes to This Policy', number: '9' },
    { id: 'contact', title: 'Contact Us', number: '10' }
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
  const scrollToSection = (sectionId) => {
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
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <Helmet>
        <title>Privacy Policy - Lisu Dictionary</title>
        <meta
          name="description"
          content="Learn how Lisu Dictionary collects, uses, and protects your personal data. Your privacy matters to us."
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-teal-600 to-cyan-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
              <ShieldCheckIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-teal-50 max-w-3xl mx-auto">
              Your privacy matters to us. Learn how we handle your data.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            {/* Table of Contents - Sticky Sidebar */}
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <DocumentTextIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  Table of Contents
                </h2>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeSection === section.id
                        ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 font-semibold'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                    >
                      <span className="font-medium">{section.number}.</span> {section.title}
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Main Content - Privacy Document */}
            <main className="lg:col-span-9">
              {/* Mobile Table of Contents */}
              <div className="lg:hidden mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Table of Contents
                </h2>
                <nav className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className="text-left px-3 py-2 rounded-lg text-sm text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors"
                    >
                      {section.number}. {section.title}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Privacy Document */}
              <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 lg:p-12">
                <header className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Website Privacy Policy
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Last Updated: {lastUpdated}
                  </p>
                </header>

                {/* Section 1: Introduction */}
                <section id="introduction" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-start gap-3">
                    <span className="text-teal-600 dark:text-teal-400">1.</span>
                    Introduction
                  </h3>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      Welcome to Lisu Dictionary. We respect your privacy and are committed to protecting
                      your personal data. This Privacy Policy explains how we collect, use, disclose, and
                      safeguard your information when you visit our website or use our services.
                    </p>
                    <p>
                      This policy applies to all users of the Lisu Dictionary website, mobile applications,
                      and related services (collectively, the "Service"). By using our Service, you agree
                      to the collection and use of information in accordance with this policy.
                    </p>
                    <p>
                      Please read this Privacy Policy carefully. If you do not agree with the terms of this
                      Privacy Policy, please do not access or use the Service. This policy should be read
                      in conjunction with our{' '}
                      <Link to="/terms" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
                        Terms of Service
                      </Link>.
                    </p>
                  </div>
                </section>

                {/* Section 2: What Data We Collect */}
                <section id="data-collect" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-start gap-3">
                    <span className="text-teal-600 dark:text-teal-400">2.</span>
                    What Data We Collect
                  </h3>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      We collect several types of information from and about users of our Service:
                    </p>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
                      2.1 Account Data
                    </h4>
                    <p>
                      When you create an account with us, we collect:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Username:</strong> Your chosen display name</li>
                      <li><strong>Email address:</strong> For account verification and communication</li>
                      <li><strong>Password:</strong> Stored in hashed (encrypted) form only</li>
                      <li><strong>Profile information:</strong> Optional bio, profile picture, and preferences</li>
                      <li><strong>Account creation date:</strong> Timestamp of registration</li>
                    </ul>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
                      2.2 Usage Data
                    </h4>
                    <p>
                      We automatically collect certain information when you use our Service:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>IP Address:</strong> For security and analytics purposes</li>
                      <li><strong>Browser type and version:</strong> To optimize the Service</li>
                      <li><strong>Operating system:</strong> For compatibility purposes</li>
                      <li><strong>Pages visited:</strong> Which pages you access on our site</li>
                      <li><strong>Time and date of visits:</strong> When you use the Service</li>
                      <li><strong>Time spent on pages:</strong> For analytics and improvements</li>
                      <li><strong>Search queries:</strong> Words you search in the dictionary</li>
                      <li><strong>Device information:</strong> Type of device used to access the Service</li>
                    </ul>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
                      2.3 User-Generated Content
                    </h4>
                    <p>
                      When you interact with our Service, we collect:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Discussion posts:</strong> Your posts, comments, and replies in discussions</li>
                      <li><strong>Dictionary contributions:</strong> Suggested words, definitions, or corrections</li>
                      <li><strong>Saved words:</strong> Words you bookmark or save for later</li>
                      <li><strong>Feedback and ratings:</strong> Your ratings of content or feedback submissions</li>
                    </ul>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
                      2.4 Cookies & Tracking Technologies
                    </h4>
                    <p>
                      We use cookies and similar tracking technologies to track activity on our Service:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Session Cookies:</strong> To keep you logged in during your visit</li>
                      <li><strong>Preference Cookies:</strong> To remember your settings (e.g., dark mode, language)</li>
                      <li><strong>Analytics Cookies:</strong> To understand how you use the Service (via Google Analytics or similar)</li>
                      <li><strong>Security Cookies:</strong> To detect and prevent security threats</li>
                    </ul>
                    <div className="bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-500 p-4 rounded-r-lg mt-4">
                      <p className="text-teal-900 dark:text-teal-100 font-medium">
                        💡 You can control cookie preferences through your browser settings. However,
                        disabling cookies may affect the functionality of the Service.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 3: How We Use Your Data */}
                <section id="data-use" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-start gap-3">
                    <span className="text-teal-600 dark:text-teal-400">3.</span>
                    How We Use Your Data
                  </h3>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      We use the collected data for various purposes:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>To provide and maintain the Service:</strong> Enable core functionality like
                        dictionary searches, user accounts, and discussions</li>
                      <li><strong>To improve the Service:</strong> Analyze usage patterns to enhance user
                        experience and add new features</li>
                      <li><strong>To communicate with you:</strong> Send account-related notifications,
                        updates, newsletters (with your consent), and respond to inquiries</li>
                      <li><strong>To ensure security:</strong> Detect and prevent fraud, abuse, and security
                        threats</li>
                      <li><strong>To personalize your experience:</strong> Remember your preferences and
                        provide customized content</li>
                      <li><strong>To enforce our policies:</strong> Monitor compliance with our Terms of
                        Service and Community Guidelines</li>
                      <li><strong>To fulfill legal obligations:</strong> Comply with applicable laws,
                        regulations, and legal processes</li>
                      <li><strong>For analytics and research:</strong> Understand how users interact with
                        the Service to make data-driven improvements</li>
                    </ul>
                    <div className="bg-gray-100 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-lg p-4 mt-4">
                      <p className="text-sm">
                        <strong>Legal Basis for Processing (GDPR):</strong> We process your data based on:
                      </p>
                      <ul className="list-disc pl-6 space-y-1 text-sm mt-2">
                        <li>Your consent (e.g., for marketing communications)</li>
                        <li>Contractual necessity (to provide the Service)</li>
                        <li>Legal obligations (compliance with laws)</li>
                        <li>Legitimate interests (improving and securing the Service)</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Section 4: How We Share Your Data */}
                <section id="data-share" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-start gap-3">
                    <span className="text-teal-600 dark:text-teal-400">4.</span>
                    How We Share Your Data
                  </h3>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      We do not sell your personal data. However, we may share your information in the
                      following circumstances:
                    </p>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
                      4.1 With Service Providers
                    </h4>
                    <p>
                      We may share your data with third-party companies that help us operate the Service:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Hosting providers:</strong> To store and serve our content</li>
                      <li><strong>Analytics services:</strong> Google Analytics or similar tools</li>
                      <li><strong>Email services:</strong> To send account-related emails</li>
                      <li><strong>Payment processors:</strong> If we offer paid features (currently not applicable)</li>
                    </ul>
                    <p className="text-sm italic">
                      These service providers are contractually obligated to protect your data and use it
                      only for the purposes we specify.
                    </p>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
                      4.2 For Legal Reasons
                    </h4>
                    <p>
                      We may disclose your information if required to do so by law or in response to valid
                      requests by public authorities:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>To comply with a legal obligation</li>
                      <li>To protect and defend our rights or property</li>
                      <li>To prevent or investigate possible wrongdoing</li>
                      <li>To protect the safety of users or the public</li>
                      <li>To protect against legal liability</li>
                    </ul>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
                      4.3 Business Transfers
                    </h4>
                    <p>
                      If Lisu Dictionary is involved in a merger, acquisition, or asset sale, your personal
                      data may be transferred. We will provide notice before your data is transferred and
                      becomes subject to a different Privacy Policy.
                    </p>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
                      4.4 With Your Consent
                    </h4>
                    <p>
                      We may share your information for any other purpose with your explicit consent.
                    </p>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
                      4.5 Aggregated or Anonymized Data
                    </h4>
                    <p>
                      We may share aggregated or anonymized information that cannot reasonably be used to
                      identify you. For example, we might share statistics about dictionary usage or popular
                      search terms.
                    </p>
                  </div>
                </section>

                {/* Section 5: Data Retention & Security */}
                <section id="data-retention" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-start gap-3">
                    <span className="text-teal-600 dark:text-teal-400">5.</span>
                    Data Retention & Security
                  </h3>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      5.1 How Long We Keep Your Data
                    </h4>
                    <p>
                      We retain your personal data only for as long as necessary to fulfill the purposes
                      outlined in this Privacy Policy:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Account data:</strong> Retained while your account is active and for a
                        reasonable period after deletion (typically 30-90 days) for backup purposes</li>
                      <li><strong>Usage data:</strong> Typically retained for 12-24 months for analytics</li>
                      <li><strong>User-generated content:</strong> Retained as long as it remains publicly
                        available on the Service</li>
                      <li><strong>Legal obligations:</strong> Some data may be retained longer if required
                        by law</li>
                    </ul>
                    <p>
                      When data is no longer needed, we will securely delete or anonymize it.
                    </p>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
                      5.2 How We Protect Your Data
                    </h4>
                    <p>
                      We implement appropriate technical and organizational security measures to protect
                      your personal data:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Encryption:</strong> Data transmitted between your device and our servers
                        is encrypted using SSL/TLS protocols (HTTPS)</li>
                      <li><strong>Password hashing:</strong> Passwords are never stored in plain text;
                        we use industry-standard hashing algorithms</li>
                      <li><strong>Access controls:</strong> Limited access to personal data on a need-to-know basis</li>
                      <li><strong>Regular security audits:</strong> Periodic reviews of our security practices</li>
                      <li><strong>Secure infrastructure:</strong> Hosting on reputable cloud providers with
                        strong security measures</li>
                    </ul>
                    <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
                      <p className="text-amber-900 dark:text-amber-100 font-medium">
                        ⚠️ <strong>Important:</strong> No method of transmission over the Internet or
                        electronic storage is 100% secure. While we strive to protect your personal data,
                        we cannot guarantee absolute security.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 6: Your Rights & Choices */}
                <section id="your-rights" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-start gap-3">
                    <span className="text-teal-600 dark:text-teal-400">6.</span>
                    Your Rights & Choices
                  </h3>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      Depending on your location, you may have certain rights regarding your personal data:
                    </p>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
                      6.1 General Rights (All Users)
                    </h4>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Access your data:</strong> Request a copy of the personal data we hold about you</li>
                      <li><strong>Update your data:</strong> Correct inaccurate or incomplete information
                        through your account settings</li>
                      <li><strong>Delete your account:</strong> Request deletion of your account and
                        associated data</li>
                      <li><strong>Opt-out of marketing:</strong> Unsubscribe from promotional emails via
                        the link in each email or your account settings</li>
                      <li><strong>Cookie management:</strong> Control cookies through your browser settings</li>
                    </ul>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
                      6.2 GDPR Rights (European Union Users)
                    </h4>
                    <p>
                      If you are located in the European Economic Area (EEA), you have additional rights:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Right to access:</strong> Obtain confirmation of whether we process your
                        data and receive a copy</li>
                      <li><strong>Right to rectification:</strong> Correct inaccurate data</li>
                      <li><strong>Right to erasure ("right to be forgotten"):</strong> Request deletion of
                        your data under certain circumstances</li>
                      <li><strong>Right to restrict processing:</strong> Request that we limit how we use
                        your data</li>
                      <li><strong>Right to data portability:</strong> Receive your data in a structured,
                        machine-readable format</li>
                      <li><strong>Right to object:</strong> Object to processing based on legitimate interests</li>
                      <li><strong>Right to withdraw consent:</strong> Withdraw consent at any time where
                        processing is based on consent</li>
                      <li><strong>Right to lodge a complaint:</strong> File a complaint with your local data
                        protection authority</li>
                    </ul>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
                      6.3 CCPA Rights (California Users)
                    </h4>
                    <p>
                      If you are a California resident, you have rights under the California Consumer
                      Privacy Act (CCPA):
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li><strong>Right to know:</strong> Request disclosure of categories and specific
                        pieces of personal information collected</li>
                      <li><strong>Right to delete:</strong> Request deletion of personal information</li>
                      <li><strong>Right to opt-out of sale:</strong> We do not sell personal information</li>
                      <li><strong>Right to non-discrimination:</strong> Not be discriminated against for
                        exercising your rights</li>
                    </ul>

                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
                      6.4 How to Exercise Your Rights
                    </h4>
                    <p>
                      To exercise any of these rights, please:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Email us at{' '}
                        <a href="mailto:privacy@lisudictionary.com" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
                          privacy@lisudictionary.com
                        </a>
                      </li>
                      <li>Use our{' '}
                        <Link to="/contact" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
                          Contact Form
                        </Link>
                      </li>
                      <li>Access your account settings (for some updates)</li>
                    </ul>
                    <p className="text-sm italic">
                      We will respond to your request within 30 days (or as required by applicable law).
                      We may need to verify your identity before processing your request.
                    </p>
                  </div>
                </section>

                {/* Section 7: Children's Privacy */}
                <section id="children" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-start gap-3">
                    <span className="text-teal-600 dark:text-teal-400">7.</span>
                    Children's Privacy
                  </h3>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      Our Service is not directed to children under the age of <strong>13</strong> (or the
                      applicable age of digital consent in your jurisdiction). We do not knowingly collect
                      personal information from children under 13.
                    </p>
                    <p>
                      If you are a parent or guardian and believe that your child has provided us with
                      personal information, please contact us at{' '}
                      <a href="mailto:privacy@lisudictionary.com" className="text-teal-600 dark:text-teal-400 hover:underline font-medium">
                        privacy@lisudictionary.com
                      </a>.
                      We will take steps to delete such information from our systems.
                    </p>
                    <p>
                      For users between 13 and 18 years old, we recommend obtaining parental consent
                      before using the Service, as stated in our Terms of Service.
                    </p>
                  </div>
                </section>

                {/* Section 8: Links to Other Websites */}
                <section id="third-party" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-start gap-3">
                    <span className="text-teal-600 dark:text-teal-400">8.</span>
                    Links to Other Websites
                  </h3>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      Our Service may contain links to third-party websites, plugins, and applications that
                      are not operated by us. If you click on a third-party link, you will be directed to
                      that third party's site.
                    </p>
                    <p>
                      <strong>We have no control over and assume no responsibility for the content, privacy
                        policies, or practices of any third-party sites or services.</strong> We strongly
                      advise you to review the Privacy Policy of every site you visit.
                    </p>
                    <p>
                      Examples of third-party services we may link to or integrate with:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Social media platforms (if we add social sharing features)</li>
                      <li>External authentication providers (e.g., Google OAuth)</li>
                      <li>Analytics services (e.g., Google Analytics)</li>
                      <li>Educational or cultural resources related to the Lisu language</li>
                    </ul>
                  </div>
                </section>

                {/* Section 9: Changes to This Policy */}
                <section id="changes" className="mb-12 scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-start gap-3">
                    <span className="text-teal-600 dark:text-teal-400">9.</span>
                    Changes to This Policy
                  </h3>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      We may update our Privacy Policy from time to time to reflect changes in our practices,
                      technology, legal requirements, or other factors.
                    </p>
                    <p>
                      When we make changes, we will:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Update the "Last Updated" date at the top of this policy</li>
                      <li>Post the new Privacy Policy on this page</li>
                      <li>For material changes, notify you via:
                        <ul className="list-circle pl-6 mt-2 space-y-1">
                          <li>Email (to the address associated with your account)</li>
                          <li>A prominent notice on our Service</li>
                        </ul>
                      </li>
                    </ul>
                    <p>
                      <strong>Your continued use of the Service after any changes to this Privacy Policy
                        constitutes your acceptance of the updated policy.</strong> If you do not agree to
                      the revised policy, please discontinue use of the Service.
                    </p>
                    <p>
                      We encourage you to review this Privacy Policy periodically to stay informed about
                      how we protect your information.
                    </p>
                  </div>
                </section>

                {/* Section 10: Contact Us */}
                <section id="contact" className="scroll-mt-24">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-start gap-3">
                    <span className="text-teal-600 dark:text-teal-400">10.</span>
                    Contact Us
                  </h3>
                  <div className="space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    <p>
                      If you have any questions, concerns, or requests regarding this Privacy Policy or our
                      data practices, please contact us:
                    </p>
                    <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-6 border border-teal-200 dark:border-teal-800">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Lisu Dictionary Privacy Team
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <strong>Email:</strong>{' '}
                          <a href="mailto:privacy@lisudictionary.com" className="text-teal-600 dark:text-teal-400 hover:underline">
                            privacy@lisudictionary.com
                          </a>
                        </p>
                        <p>
                          <strong>General Support:</strong>{' '}
                          <a href="mailto:support@lisudictionary.com" className="text-teal-600 dark:text-teal-400 hover:underline">
                            support@lisudictionary.com
                          </a>
                        </p>
                        <p>
                          <strong>Contact Form:</strong>{' '}
                          <Link to="/contact" className="text-teal-600 dark:text-teal-400 hover:underline">
                            Contact Page
                          </Link>
                        </p>
                      </div>
                    </div>
                    <p className="text-sm italic">
                      For data access, correction, or deletion requests, please include "Privacy Request"
                      in your subject line to help us process your request more quickly.
                    </p>
                  </div>
                </section>

                {/* Additional Information */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Additional Information
                  </h3>
                  <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    <p>
                      <strong>International Data Transfers:</strong> Your information may be transferred to
                      and maintained on computers located outside of your jurisdiction where data protection
                      laws may differ. By using the Service, you consent to such transfers.
                    </p>
                    <p>
                      <strong>Do Not Track Signals:</strong> Some browsers have a "Do Not Track" feature.
                      Currently, we do not respond to Do Not Track signals, but we respect your right to
                      privacy and provide options to control your data.
                    </p>
                  </div>
                </div>

                {/* Acknowledgment Footer */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-4">
                    By using Lisu Dictionary, you acknowledge that you have read and understood this
                    Privacy Policy.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                      to="/terms"
                      className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
                    >
                      View Terms of Service
                    </Link>
                    <span className="hidden sm:inline text-gray-400">•</span>
                    <Link
                      to="/help"
                      className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
                    >
                      Help Center
                    </Link>
                    <span className="hidden sm:inline text-gray-400">•</span>
                    <Link
                      to="/contact"
                      className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
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
    </>
  );
};

export default PrivacyPolicy;
