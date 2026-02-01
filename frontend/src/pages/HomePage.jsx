import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plane, ShieldCheck, Sun, Luggage, HeartPulse, Droplets, Wind } from 'lucide-react';
import { Layout } from '../components/layout';
import { Card, Button, Badge } from '../components/ui';
import AirlineLogos from '../components/home/AirlineLogos';
import { fadeInUp, staggerContainer, scaleIn } from '../utils/animations';

const HomePage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
        <div className="max-w-container mx-auto px-mobile md:px-tablet lg:px-desktop py-20 md:py-32">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Welcome to CloudBase
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-8">
              Experience seamless travel with our cutting-edge flight booking and management system
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/Booking">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Plane className="mr-2 w-5 h-5" />
                  Book a Flight
                </Button>
              </Link>
              <Link to="/About">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Info Cards Section */}
      <div className="max-w-container mx-auto px-mobile md:px-tablet lg:px-desktop py-12 md:py-16">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {/* Security Alerts */}
          <motion.div variants={fadeInUp}>
            <Card hover className="group h-full">
              <div className="flex items-start space-x-4">
                <ShieldCheck className="w-6 h-6 text-success flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Security Status</h3>
                  <Badge variant="success" className="mb-2">All Clear</Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No current security alerts. Airport operating normally.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Weather Updates */}
          <motion.div variants={fadeInUp}>
            <Card hover className="group h-full">
              <div className="flex items-start space-x-4">
                <Sun className="w-6 h-6 text-warning flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-3">Weather Updates</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-gray-600 dark:text-gray-400">
                        <Sun className="mr-2 w-4 h-4" /> Temperature
                      </span>
                      <span className="font-medium">28°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-gray-600 dark:text-gray-400">
                        <Droplets className="mr-2 w-4 h-4" /> Humidity
                      </span>
                      <span className="font-medium">60%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center text-gray-600 dark:text-gray-400">
                        <Wind className="mr-2 w-4 h-4" /> Wind Speed
                      </span>
                      <span className="font-medium">15 km/h</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Travel Guidelines */}
          <motion.div variants={fadeInUp}>
            <Card hover className="group h-full">
              <div className="flex items-start space-x-4">
                <Luggage className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
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
          </motion.div>

          {/* Health Guidelines */}
          <motion.div variants={fadeInUp}>
            <Card hover className="group h-full">
              <div className="flex items-start space-x-4">
                <HeartPulse className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
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
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
        >
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
                  <Plane className="mr-2 w-5 h-5" />
                  Start Booking
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Airlines Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={scaleIn}
        >
          <AirlineLogos />
        </motion.div>
      </div>
    </Layout>
  );
};

export default HomePage;
