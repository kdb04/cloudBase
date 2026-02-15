import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowLeft } from 'lucide-react';
import { Layout } from '../components/layout';
import { Card, Button, Input } from '../components/ui';
import { getApiUrl, ENDPOINTS } from '../utils/api';
import { handleApiResponse } from '../utils/errorHandling';
import { validateEmail, validatePassword } from '../utils/validators';

function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const sendOTP = async () => {
    setError(null);

    if (!validateEmail(email)) {
      setError('Invalid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(getApiUrl(ENDPOINTS.SEND_OTP), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      await handleApiResponse(response);

      setSuccess('OTP sent to your email');
      setStep(2);
      setResendCooldown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    await sendOTP();
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError(null);

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(getApiUrl(ENDPOINTS.VERIFY_OTP), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      await handleApiResponse(response);

      setSuccess('OTP verified successfully');
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(null);

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      setError(passwordValidation.error);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(getApiUrl(ENDPOINTS.RESET_PASSWORD), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      await handleApiResponse(response);

      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              id="email"
              name="email"
              icon={Mail}
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                OTP sent to <span className="font-medium text-primary">{email}</span>
              </p>
            </div>
            <Input
              label="Enter OTP"
              type="text"
              id="otp"
              name="otp"
              icon={KeyRound}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
            />
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </Button>
            <button
              type="button"
              onClick={sendOTP}
              className="w-full text-sm text-primary hover:text-primary-hover disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={loading || resendCooldown > 0}
            >
              {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handleResetPassword} className="space-y-5">
            <Input
              label="New Password"
              type="password"
              id="newPassword"
              name="newPassword"
              icon={Lock}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              icon={Lock}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" fullWidth size="lg" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Forgot Password';
      case 2:
        return 'Verify OTP';
      case 3:
        return 'Reset Password';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return 'Enter your email to receive a password reset OTP';
      case 2:
        return 'Enter the OTP sent to your email';
      case 3:
        return 'Create a new password for your account';
      default:
        return '';
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent py-12 px-mobile md:px-tablet lg:px-desktop">
        <Card className="w-full max-w-md" padding="lg">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">{getStepTitle()}</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {getStepDescription()}
            </p>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    s <= step ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
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

          {renderStep()}

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-primary hover:text-primary-hover font-medium"
            >
              <ArrowLeft className="mr-2 w-3 h-3" />
              Back to Login
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export default ForgotPasswordPage;
