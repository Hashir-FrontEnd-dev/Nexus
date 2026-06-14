import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, CircleDollarSign, Building2, LogIn, Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { OtpInput } from '../../components/auth/OtpInput';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('entrepreneur');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password, role);
      setStep('otp');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpComplete = () => {
    navigate(role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
  };

  const loginDemo = async (userRole: UserRole) => {
    const demoEmail = userRole === 'entrepreneur' ? 'sarah@techwave.io' : 'michael@vcinnovate.com';
    setEmail(demoEmail);
    setPassword('password123');
    setRole(userRole);
    setError(null);
    localStorage.removeItem('business_nexus_tour_completed');
    setIsLoading(true);
    try {
      await login(demoEmail, 'password123', userRole);
      navigate(userRole === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-md flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {step === 'credentials' ? 'Sign in to Business Nexus' : 'Two-Factor Authentication'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {step === 'credentials' ? 'Connect with investors and entrepreneurs' : 'Enter the 6-digit code sent to your email'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && step === 'credentials' && (
            <div className="mb-4 bg-error-50 border border-error-500 text-error-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'credentials' ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${
                      role === 'entrepreneur'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setRole('entrepreneur')}
                  >
                    <Building2 size={18} className="mr-2" />
                    Entrepreneur
                  </button>
                  <button
                    type="button"
                    className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${
                      role === 'investor'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setRole('investor')}
                  >
                    <CircleDollarSign size={18} className="mr-2" />
                    Investor
                  </button>
                </div>
              </div>

              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                fullWidth
                startAdornment={<User size={18} />}
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                fullWidth
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
                </div>
                <div className="text-sm">
                  <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <Button type="submit" fullWidth isLoading={isLoading} leftIcon={<LogIn size={18} />}>
                Sign in
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-center gap-3">
                <Shield size={24} className="text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-primary-900">2FA Verification</p>
                  <p className="text-xs text-primary-700">A code has been sent to {email}</p>
                </div>
              </div>

              <OtpInput length={6} value={otp} onChange={setOtp} onComplete={handleOtpComplete} />

              <Button fullWidth onClick={handleOtpComplete} disabled={otp.length < 6}>
                Verify & Continue
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Didn't receive a code?</p>
                <Button variant="ghost" size="sm">Resend code</Button>
              </div>

              <div className="text-center">
                <button
                  onClick={() => { setStep('credentials'); setOtp(''); }}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft size={16} className="mr-1" /> Back to login
                </button>
              </div>
            </div>
          )}

          {step === 'credentials' && (
            <>
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Demo Accounts</span>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => loginDemo('entrepreneur')} leftIcon={<Building2 size={16} />}>
                    Entrepreneur Demo
                  </Button>
                  <Button variant="outline" onClick={() => loginDemo('investor')} leftIcon={<CircleDollarSign size={16} />}>
                    Investor Demo
                  </Button>
                </div>
              </div>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">Sign up</Link>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
