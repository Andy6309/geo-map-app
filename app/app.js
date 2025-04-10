import React, { useState } from 'react';
import LoginForm from '../components/LoginForm';
import Map from '../components/Map';

const App = () => {
    const [userData, setUserData] = useState(null);

    const handleLogin = (data) => {
        setUserData(data); // Set the logged-in user's data
    };

    return (
        <div>
            {!userData ? (
                <LoginForm onLogin={handleLogin} />
            ) : (
                <Map userData={userData} />
            )}
        </div>
    );
};

export default App;
