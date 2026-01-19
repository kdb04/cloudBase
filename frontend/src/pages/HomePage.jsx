import { Link } from 'react-router-dom';
import { FaPlane, FaSun, FaTint, FaWind, FaShieldAlt, FaHeartbeat, FaBook } from 'react-icons/fa';
import { Layout } from '../components/layout';
import { Card, Button, Badge } from '../components/ui';
import AirlineLogos from '../components/home/AirlineLogos';

const HomePage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-primary-hover to-purple-700 text-white">
        <div className="max-w-container mx-auto px-mobile md:px-tablet lg:px-desktop py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Welcome to CloudBase Airways
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-8">
              Experience seamless travel with our cutting-edge flight booking and management system
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/Booking">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <FaPlane className="mr-2" />
                  Book a Flight
                </Button>
              </Link>
              <Link to="/About">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards Section */}
      <div className="max-w-container mx-auto px-mobile md:px-tablet lg:px-desktop py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Security Alerts */}
          <Card hover className="group">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-success/10 rounded-lg group-hover:bg-success/20 transition-colors">
                <FaShieldAlt className="w-6 h-6 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Security Status</h3>
                <Badge variant="success" className="mb-2">All Clear</Badge>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No current security alerts. Airport operating normally.
                </p>
              </div>
            </div>
          </Card>

          {/* Weather Updates */}
          <Card hover className="group">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-info/10 rounded-lg group-hover:bg-info/20 transition-colors">
                <FaSun className="w-6 h-6 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-3">Weather Updates</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-gray-600 dark:text-gray-400">
                      <FaSun className="mr-2 w-4 h-4" /> Temperature
                    </span>
                    <span className="font-medium">28°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-gray-600 dark:text-gray-400">
                      <FaTint className="mr-2 w-4 h-4" /> Humidity
                    </span>
                    <span className="font-medium">60%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-gray-600 dark:text-gray-400">
                      <FaWind className="mr-2 w-4 h-4" /> Wind Speed
                    </span>
                    <span className="font-medium">15 km/h</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Travel Guidelines */}
          <Card hover className="group">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <FaBook className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Travel Guidelines</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Essential information for a smooth journey
                </p>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Arrive 2 hours before domestic flights</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Have ID and boarding pass ready</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Follow guidelines for carry-on items</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Health Guidelines */}
          <Card hover className="group">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-900/30 transition-colors">
                <FaHeartbeat className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Health Guidelines</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Stay informed about health protocols
                </p>
                <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Masks recommended for sick individuals</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Maintain social distancing if required</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Report any specific illness symptoms</span>
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-12 bg-gradient-to-r from-primary/5 to-purple-500/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Ready to Book Your Next Flight?</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Search and compare flights from hundreds of airlines
              </p>
            </div>
            <Link to="/Booking">
              <Button size="lg">
                <FaPlane className="mr-2" />
                Start Booking
              </Button>
            </Link>
          </div>
        </Card>

        {/* Airlines Section */}
        <div>
          <AirlineLogos />
        </div>
      </div>
    </Layout>
  );
};

export default HomePage;
