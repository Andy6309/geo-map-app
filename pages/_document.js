import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  // Get the Mapbox token from environment variables
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
  
  // Create a script to initialize Mapbox with the token
  const mapboxScript = `
    window.MAPBOX_ACCESS_TOKEN = '${mapboxToken}';
    window.mapboxgl = {
      accessToken: '${mapboxToken}'
    };
  `;

  return (
    <Html lang="en">
      <Head>
        {/* Preload Mapbox GL CSS */}
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v3.11.0/mapbox-gl.css"
          rel="stylesheet"
        />
        {/* Initialize Mapbox token before any other scripts */}
        <script dangerouslySetInnerHTML={{ __html: mapboxScript }} />
        {/* Pass environment variables to client */}
        <script
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
