import React, { useEffect, useRef } from 'react';
import Layout from '../components/layout/Layout.jsx'; // Layout with sidebar/header

const Maps = () => {
  const mapRef = useRef(null);
  const apiKey = "AIzaSyDiyfxTxJCt4ZgVnkblMoZkIS1-VO3j6yE"; // Your actual API Key

  useEffect(() => {
    const initMap = () => {
      if (mapRef.current && window.google && window.google.maps) {
        new window.google.maps.Map(mapRef.current, {
          center: { lat: 20.5937, lng: 78.9629 },
          zoom: 5,
        });
      } else {
        console.error("Google Maps API loaded but mapRef.current or google.maps is not available.");
      }
    };

    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    window.initMap = initMap;

    const scriptId = "google-maps-script";
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
      script.async = true;
      script.onerror = () => {
        console.error("Google Maps script failed to load. Check API key and console.");
        delete window.initMap;
      };
      document.head.appendChild(script);
    } else if (typeof window.initMap !== 'function') {
      window.initMap = initMap;
    }

    return () => {
      delete window.initMap;
    };
  }, [apiKey]);

  return (
    <Layout>
      <div className="h-full flex flex-col">
        <h1 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white shrink-0">Maps</h1>

        {/* 🛠️ Critical Fix: Set min or fixed height */}
        <div
          ref={mapRef}
          className="w-full rounded-md shadow"
          style={{ height: '500px' }} // Set fixed height or use h-[500px] via Tailwind
        />
      </div>
    </Layout>
  );
};

export default Maps;
