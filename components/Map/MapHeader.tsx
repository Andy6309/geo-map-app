'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Search } from 'lucide-react';
import { useEffect } from 'react';

interface MapHeaderProps {
  geocoderContainerRef?: React.RefObject<HTMLDivElement | null>;
  showSearch?: boolean;
  onSearchToggle?: () => void;
}

export default function MapHeader({ geocoderContainerRef, showSearch, onSearchToggle }: MapHeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  // Focus the geocoder input when search opens
  useEffect(() => {
    if (showSearch && geocoderContainerRef?.current) {
      setTimeout(() => {
        const input = geocoderContainerRef.current?.querySelector('input');
        if (input) {
          input.focus();
        }
      }, 100);
    }
  }, [showSearch, geocoderContainerRef]);

  return (
    <>
      <div className="absolute top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
        <div className={`flex items-center justify-between ${isMobile ? 'px-2 py-2' : 'px-4 py-3'}`}>
          <div className="flex items-center space-x-2 overflow-hidden">
            <h1 className={`${isMobile ? 'text-sm' : 'text-xl'} font-bold text-gray-900 whitespace-nowrap`}>
              {isMobile ? 'Geo Map' : 'Geospatial Map'}
            </h1>
            {user && !isMobile && (
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-500">|</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium truncate max-w-[150px]">{user.email}</span>
                </div>
              </div>
            )}
          </div>
        
          <div className={`flex items-center ${isMobile ? 'space-x-1' : 'space-x-3'}`}>
          {/* Search Icon - Mobile Only */}
          {isMobile && onSearchToggle && (
            <button
              onClick={onSearchToggle}
              className={`p-1.5 rounded-md transition-colors ${
                showSearch 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Search"
            >
              <Search size={16} />
            </button>
          )}
          
          <a 
            href="https://www.mapbox.com/about/maps/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`${isMobile ? 'text-[10px]' : 'text-xs'} text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap`}
          >
            © Mapbox
          </a>
          {!isMobile && (
            <>
              <span className="text-gray-300">|</span>
              <a 
                href="https://www.openstreetmap.org/copyright" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                © OpenStreetMap
              </a>
            </>
          )}
          {user && (
            <>
              {!isMobile && <span className="text-gray-300">|</span>}
              <button
                onClick={handleLogout}
                className={`${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-1.5 text-sm'} font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors`}
              >
                {isMobile ? 'Exit' : 'Logout'}
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Search Dropdown - Mobile Only */}
      {isMobile && showSearch && geocoderContainerRef && (
        <div 
          className="absolute left-0 right-0 bg-white shadow-lg border-t border-gray-200"
          onClick={(e) => {
            console.log('🔍 Search dropdown clicked!', e.target);
            e.stopPropagation();
          }}
          style={{ 
            top: '100%',
            zIndex: 99999,
            pointerEvents: 'auto',
            isolation: 'isolate'
          }}
        >
          <div className="p-3" style={{ pointerEvents: 'auto' }}>
            <div 
              ref={geocoderContainerRef}
              style={{ 
                width: '100%',
                minHeight: '40px',
                pointerEvents: 'auto',
                position: 'relative',
                zIndex: 100000
              } as React.CSSProperties}
            />
          </div>
          
          {/* Ensure geocoder elements are interactive */}
          <style jsx global>{`
            .mapboxgl-ctrl-geocoder {
              pointer-events: auto !important;
              position: relative !important;
              z-index: 100001 !important;
              touch-action: auto !important;
            }
            .mapboxgl-ctrl-geocoder * {
              pointer-events: auto !important;
            }
            .mapboxgl-ctrl-geocoder input {
              pointer-events: auto !important;
              cursor: text !important;
              touch-action: auto !important;
              -webkit-user-select: text !important;
              user-select: text !important;
            }
            .mapboxgl-ctrl-geocoder--input {
              pointer-events: auto !important;
            }
            .mapboxgl-ctrl-geocoder--suggestions {
              pointer-events: auto !important;
              z-index: 100002 !important;
            }
            .suggestions {
              pointer-events: auto !important;
              z-index: 100002 !important;
            }
          `}</style>
        </div>
      )}
    </div>
    </>
  );
}
