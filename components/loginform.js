import React, { useState } from 'react';

const LoginForm = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to log in');
            }

            onLogin(username);
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #4e54c8, #8f94fb)',  // Original gradient background
                backgroundImage: 'url("/images/topo.jpg")', // Add your image path here (commented out for now)
                backgroundSize: 'cover', // Ensures the image covers the entire background
                backgroundPosition: 'center', // Centers the image
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
                    alignItems: 'center', // Aligning all elements center
                    textAlign: 'center',  // Centering the text
                }}
            >
                <h2 style={{ marginBottom: '30px', color: '#333', fontSize: '26px' }}>
                    Hunt Topo
                </h2>

                {error && (
                    <div style={{ color: '#e74c3c', marginBottom: '16px', fontWeight: 'bold' }}>
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
                        textAlign: 'right', // Right-aligning label text
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
                    onFocus={(e) => e.target.style.borderColor = '#4e54c8'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
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
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#364f97';
                        e.target.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#4e54c8';
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    Login
                </button>
            </form>
        </div>
    );
};

export default LoginForm;
