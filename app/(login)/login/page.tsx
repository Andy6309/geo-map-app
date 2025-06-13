'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/utils/supabase/client';

// Mountain landscape background from Unsplash
const backgroundImage = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop';

const LoginPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      setIsMounted(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const redirectTo = searchParams.get('redirectedFrom') || '/';
        router.push(redirectTo);
      }
    };
    
    checkSession();
  }, [router, searchParams, supabase.auth]);

  const clearAlerts = () => {
    setError('');
    setSuccess('');
  };

  const toggleForms = () => {
    setIsLogin(!isLogin);
    clearAlerts();
    // Keep the username when toggling between login/register
    setPassword('');
    setConfirmPassword('');
  };

  const { signIn, signUp } = useAuth();

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearAlerts();
    
    // Validate username (alphanumeric, underscores, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username.trim())) {
      setError('Username must be 3-20 characters and can only contain letters, numbers, and underscores');
      return;
    }

    if (!password.trim() || (!isLogin && !confirmPassword.trim())) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(username, password);
        if (error) throw error;
        const redirectTo = searchParams.get('redirectedFrom') || '/';
        router.push(redirectTo);
      } else {
        const { error } = await signUp(username, password);
        if (error) throw error;
        
        setSuccess('Account created successfully! Signing you in...');
        // Auto-login after signup
        const { error: loginError } = await signIn(username, password);
        if (loginError) throw loginError;
        
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4" 
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh'
      }}
    >
      <div className="w-full max-w-md bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg shadow-xl p-8">
      <Head>
        <title>{isLogin ? 'Login' : 'Register'} | Geo Map App</title>
      </Head>
      
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-white/20 p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Hunt-Topo' : 'Create Account'}
          </h2>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to access our Map' : 'Create your account to get started'}
          </p>
        </div>
          
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          </div>
        )}
          
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <input 
              type="text" 
              id={isLogin ? 'username' : 'regUsername'}
              placeholder="Username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
              required
            />
          </div>
          
          <div className="relative w-full">
            <input 
              type={showPassword ? 'text' : 'password'} 
              id={isLogin ? 'password' : 'regPassword'}
              placeholder={isLogin ? 'Password' : 'Create a password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded pr-10 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent text-base box-border"
              required
              minLength={6}
            />
            <button 
              type="button" 
              onClick={togglePassword}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none w-6 h-6 flex items-center justify-center"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          
          {!isLogin && (
            <div className="form-group">
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="confirmPassword"
                placeholder="Confirm Password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
                required
                minLength={6}
              />
            </div>
          )}
          
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#4CAF50] text-white p-3 rounded hover:bg-[#45a049] transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:ring-offset-2"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLogin ? 'Logging in...' : 'Creating account...'}
              </span>
            ) : isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        
        <div className="form-footer text-center mt-4">
          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button 
              onClick={toggleForms} 
              className="text-[#4CAF50] hover:underline focus:outline-none"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p> {new Date().getFullYear()} Geo Map App. All rights reserved.</p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default LoginPage;