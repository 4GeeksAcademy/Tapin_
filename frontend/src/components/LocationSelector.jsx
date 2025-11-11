import React, { useState } from 'react';

const CITIES = [
  { name: 'Los Angeles, CA', coords: [34.0522, -118.2437] },
  { name: 'New York, NY', coords: [40.7128, -74.0060] },
  { name: 'Chicago, IL', coords: [41.8781, -87.6298] },
  { name: 'Houston, TX', coords: [29.7604, -95.3698] },
  { name: 'Phoenix, AZ', coords: [33.4484, -112.0740] },
  { name: 'Philadelphia, PA', coords: [39.9526, -75.1652] },
  { name: 'San Antonio, TX', coords: [29.4241, -98.4936] },
  { name: 'San Diego, CA', coords: [32.7157, -117.1611] },
  { name: 'Dallas, TX', coords: [32.7767, -96.7970] },
  { name: 'San Jose, CA', coords: [37.3382, -121.8863] },
  { name: 'Austin, TX', coords: [30.2672, -97.7431] },
  { name: 'Seattle, WA', coords: [47.6062, -122.3321] },
  { name: 'Denver, CO', coords: [39.7392, -104.9903] },
  { name: 'Boston, MA', coords: [42.3601, -71.0589] },
  { name: 'Miami, FL', coords: [25.7617, -80.1918] },
  { name: 'Atlanta, GA', coords: [33.7490, -84.3880] },
];

export default function LocationSelector({ onLocationSelected }) {
  const [selectedCity, setSelectedCity] = useState('');
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);

  const handleCitySelect = (e) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);

    if (cityName) {
      const city = CITIES.find(c => c.name === cityName);
      if (city) {
        onLocationSelected({
          coords: city.coords,
          name: city.name,
          type: 'city'
        });
      }
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        onLocationSelected({
          coords: [position.coords.latitude, position.coords.longitude],
          name: 'Your Location',
          type: 'geolocation'
        });
      },
      (error) => {
        setLocating(false);
        setError('Unable to retrieve your location. Please select a city instead.');
        console.error('Geolocation error:', error);
      }
    );
  };

  return (
    <div style={{
      padding: '40px 20px',
      maxWidth: '600px',
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '48px 32px',
        color: 'white',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '28px', fontWeight: '700' }}>
          📍 Choose Your Location
        </h2>
        <p style={{ margin: '0 0 32px 0', fontSize: '16px', opacity: 0.9 }}>
          Select your city or enable location to see nearby opportunities
        </p>

        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={handleUseMyLocation}
            disabled={locating}
            style={{
              width: '100%',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '600',
              background: locating ? '#ccc' : 'white',
              color: locating ? '#666' : '#667eea',
              border: 'none',
              borderRadius: '12px',
              cursor: locating ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              if (!locating) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
          >
            {locating ? (
              <>
                <span style={{
                  width: '20px',
                  height: '20px',
                  border: '3px solid #666',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
                Locating...
              </>
            ) : (
              <>
                <span style={{ fontSize: '20px' }}>🎯</span>
                Use My Current Location
              </>
            )}
          </button>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          margin: '24px 0'
        }}>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
          <span style={{ fontSize: '14px', opacity: 0.8 }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.3)' }}></div>
        </div>

        <div>
          <label style={{
            display: 'block',
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '600',
            textAlign: 'left',
            opacity: 0.9
          }}>
            Select a City
          </label>
          <select
            value={selectedCity}
            onChange={handleCitySelect}
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: '16px',
              background: 'white',
              color: '#333',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '20px',
              paddingRight: '40px'
            }}
          >
            <option value="">Choose your city...</option>
            {CITIES.map(city => (
              <option key={city.name} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#ffe0e0'
          }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      <p style={{
        marginTop: '24px',
        fontSize: '13px',
        color: '#666',
        lineHeight: '1.6'
      }}>
        We only show opportunities within your local area to help you<br />
        connect with your community. Your privacy is important to us.
      </p>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
