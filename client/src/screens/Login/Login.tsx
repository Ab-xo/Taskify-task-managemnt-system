import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-blue-300 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl flex overflow-hidden lg:flex-row flex-col">
        {/* Left side - Branding */}
        <div className="flex-1 bg-white flex items-center justify-center p-8 lg:p-12 lg:block hidden">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-black mb-4">Taskify</h1>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex-1 p-6 lg:p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            {/* Mobile Taskify title */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-4xl font-bold text-black mb-4">Taskify</h1>
              <hr className="border-gray-300 mb-6" />
            </div>
            
            <h2 className="text-2xl lg:text-3xl font-bold text-black mb-2">Welcome back</h2>
            <p className="text-gray-600 mb-6 lg:mb-8">Enter your credential to continue</p>

            <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Phone number, username or email"
                  required
                  className="h-12 lg:h-12 border-gray-300 rounded-lg text-base"
                />
              </div>

              <div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="h-12 lg:h-12 border-gray-300 rounded-lg text-base"
                />
              </div>

              <div className="flex items-center justify-between">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="showPassword" className="text-sm text-gray-600">
                  Show password
                </label>
                <a href="#" className="text-sm text-gray-600 hover:text-black">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 lg:h-12 bg-[#ec4c7d] hover:bg-[#d43e6b] text-white font-medium rounded-lg disabled:opacity-50 text-base"
              >
                {isLoading ? 'Logging in...' : 'Log In'}
              </Button>
            </form>

            <div className="mt-4 lg:mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <Link to="/signup" className="text-black font-medium underline">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};