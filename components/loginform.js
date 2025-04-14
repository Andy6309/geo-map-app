'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

const LoginForm = () => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Redirect to the map page if the user is already logged in
        const checkSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                router.push('/map'); // Redirect to map if logged in
            }
        };

        checkSession();
    }, [router]);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username.trim()) {
            setError('Username is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const trimmedUsername = username.trim();

            // Check if user exists in the users table
            const { data: existingUser, error: findError, status } = await supabase
                .from('users')
                .select('*')
                .eq('username', trimmedUsername)
                .maybeSingle(); // Use maybeSingle() to safely return null if no match

            // Handle any error during the select query
            if (findError) {
                console.error('Supabase select error:', JSON.stringify(findError, null, 2));
                setError('Failed to check username. Please try again.');
                return;
            }

            // If user doesn't exist, create a new user record
            if (!existingUser) {
                const { error: insertError } = await supabase
                    .from('users')
                    .insert({ username: trimmedUsername });

                if (insertError) {
                    console.error('Supabase insert error:', JSON.stringify(insertError, null, 2));
                    setError('Failed to create user. Please try again.');
                    return;
                }
            }

            // Set session and redirect user to the map page
            await supabase.auth.signInWithPassword({
                email: `${trimmedUsername}@example.com`, // Use username as email for simplicity
                password: 'defaultpassword', // Ideally, you would manage password storage and retrieval securely
            });

            // Redirect to map page on successful login
            router.push('/map');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #4e54c8, #8f94fb)',
                backgroundImage: 'url("/images/topo.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                fontFamily: "'Roboto', sans-serif",
                padding: '20px',
            }}
        >
            <form
                onSubmit={handleLogin}
                style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    padding: '40px 30px',
                    borderRadius: '12px',
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.1)',
                    width: '100%',
                    maxWidth: '400px',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                }}
            >
                <h2 style={{ marginBottom: '30px', color: '#333', fontSize: '26px' }}>
                    Hunt Topo
                </h2>

                {error && (
                    <div
                        style={{
                            color: '#e74c3c',
                            marginBottom: '16px',
                            fontWeight: 'bold',
                            textAlign: 'center',
                        }}
                    >
                        {error}
                    </div>
                )}

                <label
                    htmlFor="username"
                    style={{
                        display: 'block',
                        marginBottom: '8px',
                        fontWeight: '500',
                        fontSize: '16px',
                        color: '#444',
                        textAlign: 'right',
                    }}
                >
                    Username:
                </label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{
                        width: '100%',
                        padding: '14px',
                        marginBottom: '20px',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        fontSize: '16px',
                        color: '#333',
                        transition: 'border-color 0.3s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#4e54c8')}
                    onBlur={(e) => (e.target.style.borderColor = '#ddd')}
                />

                <button
                    type="submit"
                    style={{
                        width: '100%',
                        padding: '14px',
                        backgroundColor: '#4e54c8',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '18px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease, transform 0.2s ease',
                        opacity: loading ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                        if (!loading) {
                            e.target.style.backgroundColor = '#364f97';
                            e.target.style.transform = 'scale(1.05)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!loading) {
                            e.target.style.backgroundColor = '#4e54c8';
                            e.target.style.transform = 'scale(1)';
                        }
                    }}
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default LoginForm;
