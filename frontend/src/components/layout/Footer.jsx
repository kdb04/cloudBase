import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border mt-auto">
      <div className="max-w-container mx-auto px-mobile md:px-tablet lg:px-desktop py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 -ml-24">CloudBase</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
              Your trusted partner for flight bookings worldwide. We connect you to destinations across the globe.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:flex md:flex-col md:items-center">
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/booking" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                    Book a Flight
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media */}
          <div className="md:flex md:flex-col md:items-center">
            <div>
              <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-primary hover:text-white dark:hover:text-blue-200 active:bg-primary active:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.x.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-primary hover:text-white dark:hover:text-blue-200 active:bg-primary active:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-primary hover:text-white dark:hover:text-blue-200 active:bg-primary active:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-primary hover:text-white dark:hover:text-blue-200 active:bg-primary active:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-dark-border text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} CloudBase. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
