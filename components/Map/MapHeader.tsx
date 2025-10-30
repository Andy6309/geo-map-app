'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function MapHeader() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-gray-900">Geospatial Map</h1>
          {user && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-500">|</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 font-medium">{user.email}</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          {user && (
            <button
              onClick={handleLogout}
              className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
