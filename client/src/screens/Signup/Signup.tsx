import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext';

export const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account';
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-100 to-blue-300 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl flex overflow-hidden">
        {/* Left side - Branding */}
        <div className="flex-1 bg-white flex items-center justify-center p-12">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-black mb-4">Taskify</h1>
          </div>
        </div>

        {/* Right side - Signup form */}
        <div className="flex-1 p-12 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-3xl font-bold text-black mb-2">Welcome</h2>
            <p className="text-gray-600 mb-8">Enter your info to get started with taskify.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  required
                  className="h-12 border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                  className="h-12 border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="h-12 border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  required
                  className="h-12 border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex items-center">
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
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#ec4c7d] hover:bg-[#d43e6b] text-white font-medium rounded-lg"
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-black font-medium underline">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};