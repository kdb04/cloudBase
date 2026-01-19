import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border mt-auto">
      <div className="max-w-container mx-auto px-mobile md:px-tablet lg:px-desktop py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">CloudBase Airways</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your trusted partner for flight bookings worldwide. We connect you to destinations across the globe.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/About" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/Booking" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors">
                  Book a Flight
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-primary hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <FaFacebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-primary hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <FaTwitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-primary hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="p-2 bg-gray-200 dark:bg-gray-800 rounded-full hover:bg-primary hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-dark-border text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} CloudBase Airways. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
