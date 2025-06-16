import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  // Get the Mapbox token from environment variables
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
  
  // Create a script to initialize Mapbox with the token
  const mapboxScript = `
    // Set the Mapbox access token
    window.MAPBOX_ACCESS_TOKEN = '${mapboxToken}';
    
    // Initialize Mapbox GL JS configuration
    window.mapboxgl = window.mapboxgl || {};
    window.mapboxgl.accessToken = '${mapboxToken}';
    
    // Set Mapbox API base URL
    window.mapboxgl.baseApiUrl = 'https://api.mapbox.com';
    
    // Set Mapbox GL JS version
    window.mapboxgl.version = '3.11.0';
    
    // Set default configuration
    window.mapboxgl.config = {
      MAX_PARALLEL_IMAGE_REQUESTS: 16,
      REGISTERED_PROTOCOLS: {},
      WORKER_URL: '',
      workerCount: 4,
      workerClass: null
    };
  `;

  // Create a script to handle Mapbox GL JS loading
  const mapboxLoaderScript = `
    // Function to load Mapbox GL JS
    function loadMapboxGL() {
      return new Promise((resolve, reject) => {
        if (window.mapboxgl && window.mapboxgl.Map) {
          return resolve(window.mapboxgl);
        }
        
        const script = document.createElement('script');
        script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.11.0/mapbox-gl.js';
        script.integrity = 'sha384-6cF5b9de4c9d1a1c5eb83c6a937d0e9aae3534b3f9d8a3c9d5b5c5c5c5c5c5c5c';
        script.crossOrigin = 'anonymous';
        script.onload = () => {
          if (window.mapboxgl) {
            // Configure Mapbox GL JS with our token
            window.mapboxgl.accessToken = '${mapboxToken}';
            resolve(window.mapboxgl);
          } else {
            reject(new Error('Mapbox GL JS failed to load'));
          }
        };
        script.onerror = (error) => {
          reject(new Error('Failed to load Mapbox GL JS: ' + error.message));
        };
        document.head.appendChild(script);
      });
    }
    
    // Expose the loader function
    window.loadMapboxGL = loadMapboxGL;
  `;

  return (
    <Html lang="en">
      <Head>
        {/* Preload Mapbox GL CSS */}
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.11.0/mapbox-gl.css"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
        
        {/* Initialize Mapbox configuration before any other scripts */}
        <script 
          id="mapbox-config"
          dangerouslySetInnerHTML={{ __html: mapboxScript }}
        />
        
        {/* Script to handle Mapbox GL JS loading */}
        <script 
          id="mapbox-loader"
          dangerouslySetInnerHTML={{ __html: mapboxLoaderScript }}
        />
        
        {/* Pass environment variables to client */}
        <script
          id="env-vars"
          dangerouslySetInnerHTML={{
            __html: `
              window.ENV = {
                NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: '${mapboxToken}'
              };
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
