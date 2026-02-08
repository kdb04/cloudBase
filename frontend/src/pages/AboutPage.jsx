import { motion } from 'framer-motion';
import {
  Compass,
  Telescope,
  Sparkles,
  Shield,
  CloudSun,
  Map,
  Activity,
  CircleCheck
} from 'lucide-react';
import { Layout } from '../components/layout';
import { Card } from '../components/ui';
import { fadeInUp, staggerContainer } from '../utils/animations';

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent">
        <div className="max-w-container mx-auto px-mobile md:px-tablet lg:px-desktop py-16 md:py-24">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About CloudBase</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Your premier gateway to the world, connecting people and places with excellence
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-container mx-auto px-mobile md:px-tablet lg:px-desktop py-12">
        {/* Mission & Vision */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          <motion.div variants={fadeInUp}>
            <Card hover padding="lg" className="h-full">
              <div className="flex items-start space-x-4 mb-4">
                <Compass className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We are dedicated to connecting people and places while ensuring the highest standards
                of safety and satisfaction. Following are the core values we like to follow.
              </p>
              <div className="border-t border-gray-200 dark:border-dark-border pt-4 mt-4">
                <h3 className="font-semibold mb-3">Our Values</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Innovation', 'Efficiency', 'Security', 'Customer Satisfaction'].map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <CircleCheck className="text-success w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <Card hover padding="lg" className="h-full">
              <div className="flex items-start space-x-4 mb-4">
                <Telescope className="w-8 h-8 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-2">Our Vision</h2>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We envision a future where travel is accessible, seamless, and enjoyable for everyone.
                By leveraging advanced technologies and fostering a culture of excellence, we aim to
                create a world-class airport experience.
              </p>
              <div className="border-t border-gray-200 dark:border-dark-border pt-4 mt-4">
                <h3 className="font-semibold mb-3">Our Team</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Led by industry veterans with over 50 years of combined experience in airport operations,
                  software development, and aviation security.
                </p>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* What We Offer */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
        >
          <Card className="mb-12" padding="lg">
            <div className="flex items-start space-x-4 mb-6">
              <Sparkles className="w-8 h-8 text-secondary flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2">What We Offer</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Comprehensive solutions tailored for airports of all sizes
                </p>
              </div>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Real-time Security Monitoring</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Advanced security systems with instant alerts and comprehensive monitoring
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex items-start space-x-3">
                <CloudSun className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Integrated Weather Systems</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Up-to-date weather information to ensure safe travel planning
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex items-start space-x-3">
                <Map className="w-5 h-5 text-info mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Travel Guideline Management</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Comprehensive resources for smooth and informed journeys
                  </p>
                </div>
              </motion.div>

              <motion.div variants={fadeInUp} className="flex items-start space-x-3">
                <Activity className="w-5 h-5 text-warning mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Health & Safety Protocols</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Implementation of the latest health and safety standards
                  </p>
                </div>
              </motion.div>
            </motion.div>

            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-dark-border">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our solutions are tailored to meet the unique needs of airports of all sizes,
                from regional hubs to international gateways.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Feedback Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={fadeInUp}
        >
          <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5" padding="lg">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-3">We Value Your Feedback</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Provide us with your valuable feedback to enhance the experience for everyone.
                Feel free to reach out to our customer service team or follow us on social media
                for the latest updates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold"
                >
                  Contact Us
                </a>
                <a
                  href="/Booking"
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-semibold"
                >
                  Book a Flight
                </a>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default About;
