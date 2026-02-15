import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Plane } from 'lucide-react';
import { Layout } from '../components/layout';
import { Card, Button, Input } from '../components/ui';
import { getApiUrl, ENDPOINTS } from '../utils/api';
import { setAuthToken, isAdminUser } from '../utils/auth';
import { handleApiResponse } from '../utils/errorHandling';
import { validateEmail, validatePassword } from '../utils/validators';

function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

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

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error);
      return;
    }

    try {
      const response = await fetch(getApiUrl(ENDPOINTS.LOGIN), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await handleApiResponse(response);

      setSuccess(data.message);
      setError(null);
      setAuthToken(data.token);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      onLoginSuccess(email);

      if (isAdminUser(email)) {
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

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent py-12 px-mobile md:px-tablet lg:px-desktop">
        <Card className="w-full max-w-md" padding="lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <Plane className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to access your account
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
              icon={Mail}
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
              icon={Lock}
              placeholder="Enter your password"
              value={password}
              onChange={handleInput}
              required
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              <Link to="/ForgotPassword" className="text-primary hover:text-primary-hover font-medium">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth size="lg">
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/SignUp" className="text-primary hover:text-primary-hover font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export default LoginForm;
