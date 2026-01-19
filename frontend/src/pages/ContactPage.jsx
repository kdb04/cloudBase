import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaComments } from 'react-icons/fa';
import { Layout } from '../components/layout';
import { Card, Button, Input } from '../components/ui';

const ContactPage = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent">
        <div className="max-w-container mx-auto px-mobile md:px-tablet lg:px-desktop py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              We're here to help. Reach out to us anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Content */}
      <div className="max-w-container mx-auto px-mobile md:px-tablet lg:px-desktop py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card hover padding="lg">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FaPhone className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Phone</h3>
                  <p className="text-gray-600 dark:text-gray-400">+91 1234567890</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    Mon-Fri 9am-6pm IST
                  </p>
                </div>
              </div>
            </Card>

            <Card hover padding="lg">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-success/10 rounded-lg">
                  <FaEnvelope className="w-6 h-6 text-success" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Email</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    info@CloudBase.com
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                    We'll respond within 24 hours
                  </p>
                </div>
              </div>
            </Card>

            <Card hover padding="lg">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-info/10 rounded-lg">
                  <FaMapMarkerAlt className="w-6 h-6 text-info" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Address</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    123 Cross, MG Road
                    <br />
                    Bengaluru - 560001
                    <br />
                    Karnataka, India
                  </p>
                </div>
              </div>
            </Card>

            <Card hover padding="lg">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <FaClock className="w-6 h-6 text-warning" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Business Hours</h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                    <p>Saturday: 10:00 AM - 4:00 PM</p>
                    <p>Sunday: Closed</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card padding="lg">
              <div className="flex items-start space-x-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FaComments className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Send us a Message</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Fill out the form below and we'll get back to you as soon as possible
                  </p>
                </div>
              </div>

              <form className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="First Name"
                    type="text"
                    placeholder="John"
                    required
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    placeholder="Doe"
                    required
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  icon={FaEnvelope}
                  placeholder="you@example.com"
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  icon={FaPhone}
                  placeholder="+91 1234567890"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <select
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="booking">Booking Inquiry</option>
                    <option value="support">Customer Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Message
                  </label>
                  <textarea
                    rows="6"
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-primary px-3 py-2"
                    placeholder="Tell us how we can help you..."
                    required
                  ></textarea>
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="privacy"
                    className="w-4 h-4 mt-1 text-primary border-gray-300 rounded focus:ring-primary"
                    required
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-600 dark:text-gray-400">
                    I agree to the privacy policy and terms of service
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button type="submit" size="lg" className="flex-1">
                    Send Message
                  </Button>
                  <Button type="button" variant="outline" size="lg" className="flex-1">
                    Clear Form
                  </Button>
                </div>
              </form>
            </Card>

            {/* Additional Info */}
            <Card className="mt-6 bg-gradient-to-r from-primary/5 to-purple-500/5" padding="md">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Need immediate assistance? Call our 24/7 support line at{' '}
                <span className="font-semibold text-primary">+91 1234567890</span>
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
