import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon } from '@heroicons/react/24/outline';
import {
  FaTwitter,
  FaFacebook,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'Browse Courses', href: '/courses' },
        { name: 'Categories', href: '/categories' },
        { name: 'Become an Instructor', href: '/instructor/register' },
        { name: 'Enterprise', href: '/enterprise' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Community', href: '/community' },
        { name: 'System Status', href: '/status' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
        { name: 'Blog', href: '/blog' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'Accessibility', href: '/accessibility' },
      ],
    },
  ];

  const socialLinks = [
    { name: 'Twitter', icon: FaTwitter, href: 'https://twitter.com/vlp' },
    { name: 'Facebook', icon: FaFacebook, href: 'https://facebook.com/vlp' },
    { name: 'LinkedIn', icon: FaLinkedin, href: 'https://linkedin.com/company/vlp' },
    { name: 'Instagram', icon: FaInstagram, href: 'https://instagram.com/vlp' },
    { name: 'YouTube', icon: FaYoutube, href: 'https://youtube.com/vlp' },
  ];

  return (
    <footer className="bg-secondary-900 text-secondary-300">
      <div className="container-custom">
        {/* Main Footer Content */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <BookOpenIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-display font-bold text-white">
                  Virtual Learning Platform
                </span>
              </Link>
              <p className="text-secondary-400 mb-6 max-w-md">
                Empowering learners worldwide with AI-powered education. 
                Learn at your own pace, master new skills, and achieve your goals.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-secondary-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-white font-semibold mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-secondary-400 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-secondary-800 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-white font-semibold mb-2">
                Stay Updated
              </h3>
              <p className="text-secondary-400">
                Get the latest courses and updates delivered to your inbox.
              </p>
            </div>
            <div className="flex w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 bg-secondary-800 border border-secondary-700 rounded-l-lg text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-primary-600 text-white rounded-r-lg hover:bg-primary-700 transition-colors duration-200 font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-secondary-800 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-4 md:mb-0">
              <p className="text-secondary-400">
                © {currentYear} Virtual Learning Platform. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-secondary-400">
                  All systems operational
                </span>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-secondary-400">
                <span>🌍 English</span>
                <span>💰 USD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
