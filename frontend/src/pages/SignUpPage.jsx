import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope, FaLock, FaPlane, FaUserPlus } from 'react-icons/fa';
import { Layout } from '../components/layout';
import { Card, Button, Input } from '../components/ui';
import { getApiUrl, ENDPOINTS } from '../utils/api';
import { setAuthToken } from '../utils/auth';
import { validateEmail, validatePassword } from '../utils/validators';

function SignUpPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleInput = (event) => {
    const { name, value } = event.target;

    switch (name) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateEmail(email)) {
      setError('Invalid Email address');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(getApiUrl(ENDPOINTS.SIGNUP), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setSuccess(data.message);
      setError(null);
      setAuthToken(data.token);
      onLoginSuccess(email);
      navigate('/booking');
    } catch (err) {
      setError(err.message);
      setSuccess(null);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent py-12 px-mobile md:px-tablet lg:px-desktop">
        <Card className="w-full max-w-md" padding="lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <FaUserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Create Account</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Sign up to start booking flights
            </p>
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
            <Input
              label="Email Address"
              type="email"
              id="email"
              name="email"
              icon={FaEnvelope}
              placeholder="you@example.com"
              value={email}
              onChange={handleInput}
              required
            />

            <Input
              label="Password"
              type="password"
              id="password"
              name="password"
              icon={FaLock}
              placeholder="Create a password"
              value={password}
              onChange={handleInput}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              icon={FaLock}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={handleInput}
              required
            />

            <Button type="submit" fullWidth size="lg">
              Sign Up
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/Login" className="text-primary hover:text-primary-hover font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export default SignUpPage;
