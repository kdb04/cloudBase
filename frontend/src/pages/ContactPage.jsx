import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, MessageSquare } from 'lucide-react';
import { Layout } from '../components/layout';
import { Card, Button, Input } from '../components/ui';
import { fadeInUp, staggerContainer } from '../utils/animations';
import { CONTACT_SUBJECTS } from '../utils/constants';
import { getApiUrl, ENDPOINTS } from '../utils/api';
import { hasAuthToken } from '../utils/auth';

const ContactPage = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const clearForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
    setAgreePrivacy(false);
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!hasAuthToken()) {
      navigate('/Login');
      return;
    }

    if (!agreePrivacy) {
      setError('Please agree to the privacy policy and terms of service');
      return;
    }

    if (!firstName || !lastName || !email || !subject || !message) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(getApiUrl(ENDPOINTS.CONTACT_SEND), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          subject,
          message
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSuccess(data.message);
      clearForm();
      setSuccess(data.message); // Re-set success after clearForm
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              We're here to help. Reach out to us anytime.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Contact Content */}
      <div className="max-w-container mx-auto px-mobile md:px-tablet lg:px-desktop py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <Card hover padding="lg">
                <div className="flex items-start space-x-4">
                  <Phone className="w-6 h-6 text-primary flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Phone</h3>
                    <p className="text-gray-600 dark:text-gray-400">+91 1234567890</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Mon-Fri 9am-6pm IST
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card hover padding="lg">
                <div className="flex items-start space-x-4">
                  <Mail className="w-6 h-6 text-success flex-shrink-0" />
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
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card hover padding="lg">
                <div className="flex items-start space-x-4">
                  <MapPin className="w-6 h-6 text-info flex-shrink-0" />
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
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card hover padding="lg">
                <div className="flex items-start space-x-4">
                  <Clock className="w-6 h-6 text-warning flex-shrink-0" />
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
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            className="lg:col-span-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
          >
            <Card padding="lg">
              <div className="flex items-start space-x-4 mb-6">
                <MessageSquare className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold mb-2">Send us a Message</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Fill out the form below and we'll get back to you as soon as possible
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              )}
              {success && (
                <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="First Name"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <Input
                    label="Last Name"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <Input
                  label="Email Address"
                  type="email"
                  icon={Mail}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  icon={Phone}
                  placeholder="+91 1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <select
                    className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  >
                    <option value="">Select a subject</option>
                    {CONTACT_SUBJECTS.map((subj) => (
                      <option key={subj.value} value={subj.value}>
                        {subj.label}
                      </option>
                    ))}
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
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="privacy"
                    className="w-4 h-4 mt-1 text-primary border-gray-300 rounded focus:ring-primary"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                  />
                  <label htmlFor="privacy" className="text-sm text-gray-600 dark:text-gray-400">
                    I agree to the privacy policy and terms of service
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button type="submit" size="lg" className="flex-1" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                  </Button>
                  <Button type="button" variant="outline" size="lg" className="flex-1" onClick={clearForm}>
                    Clear Form
                  </Button>
                </div>
              </form>
            </Card>

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="mt-6 bg-gradient-to-r from-primary/5 to-purple-500/5" padding="md">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Need immediate assistance? Call our 24/7 support line at{' '}
                  <span className="font-semibold text-primary">+91 1234567890</span>
                </p>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
