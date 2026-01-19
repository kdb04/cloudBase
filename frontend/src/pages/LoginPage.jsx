import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaPlane } from 'react-icons/fa';
import { Layout } from '../components/layout';
import { Card, Button, Input } from '../components/ui';

function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    if (password.length < 8) {
      setError('Password length must be 8 characters');
      return;
    }

    const hasAlphabet = /[a-zA-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialCharacter = /[!@#$%^&*()_+{}\[\]:;<>,.?]/g.test(password);

    if (!hasAlphabet || !hasDigit || !hasSpecialCharacter) {
      setError('Invalid password');
      return;
    }

    try {
      if (email === 'admin@example.com') {
        onLoginSuccess(email);
        setSuccess('Admin Login Successful');
        setError(null);
        navigate('/admin');
        return;
      }

      const response = await fetch('http://localhost:3000/api/login', {
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
      onLoginSuccess(email);

      if (data.user.role == 'admin') {
        console.log('Admin logged in', data.user);
        navigate('/admin');
      } else {
        console.log('User logged in', data.user);
        navigate('/booking');
      }
    } catch (err) {
      setError(err.message);
      setSuccess(null);
    }
  };

  const validateEmail = (email) => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return valid.test(email);
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent py-12 px-mobile md:px-tablet lg:px-desktop">
        <Card className="w-full max-w-md" padding="lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <FaPlane className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to access your account
            </p>
          </div>

          {/* Error/Success Messages */}
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

          {/* Login Form */}
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
              placeholder="Enter your password"
              value={password}
              onChange={handleInput}
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <a href="#" className="text-primary hover:text-primary-hover font-medium">
                Forgot password?
              </a>
            </div>

            <Button type="submit" fullWidth size="lg">
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <a href="#" className="text-primary hover:text-primary-hover font-medium">
                Sign up
              </a>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-dark-border">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Demo Credentials:
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Admin: admin@example.com
              <br />
              Password must be 8+ chars with letters, digits & special chars
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export default LoginForm;
