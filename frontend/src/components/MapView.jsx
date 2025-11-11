import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapView({ listings, onListingClick, userLocation }) {
  const mapRef = useRef();

  // Use user's selected location or default to Houston/Dallas area
  const LOCAL_CITY_CENTER = userLocation?.coords || [29.7604, -95.3698]; // Houston, TX (default)
  const MAX_DISTANCE_KM = 50; // Only show listings within 50km of city center

  // Helper function to calculate distance between two coordinates (Haversine formula)
  const getDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Filter listings that have coordinates AND are within local area
  const mappableListings = listings.filter(
    (listing) => {
      if (listing.latitude == null || listing.longitude == null) return false;
      const distance = getDistanceKm(
        LOCAL_CITY_CENTER[0],
        LOCAL_CITY_CENTER[1],
        listing.latitude,
        listing.longitude
      );
      return distance <= MAX_DISTANCE_KM;
    }
  );

  // Fixed center on local city
  const center = LOCAL_CITY_CENTER;

  // Fixed zoom level for city view (prevent zooming out to see entire country)
  const zoom = 11;

  useEffect(() => {
    // Keep map centered on local city, don't auto-fit to all markers
    // This ensures the map stays focused on your local area
    if (mapRef.current) {
      mapRef.current.setView(LOCAL_CITY_CENTER, zoom);
    }
  }, [mappableListings]);

  if (mappableListings.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '500px',
          background: '#f5f5f5',
          borderRadius: '8px',
          color: '#666',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '18px', marginBottom: '8px' }}>📍 No local listings found</p>
          <p style={{ fontSize: '14px' }}>
            No listings within {MAX_DISTANCE_KM}km of your area have location data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      ref={mapRef}
      style={{ height: '600px', width: '100%', borderRadius: '8px' }}
      scrollWheelZoom={true}
      minZoom={10}
      maxZoom={15}
      maxBounds={[
        [LOCAL_CITY_CENTER[0] - 0.5, LOCAL_CITY_CENTER[1] - 0.5],
        [LOCAL_CITY_CENTER[0] + 0.5, LOCAL_CITY_CENTER[1] + 0.5]
      ]}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {mappableListings.map((listing) => (
        <Marker key={listing.id} position={[listing.latitude, listing.longitude]}>
          <Popup>
            <div style={{ minWidth: '200px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{listing.title}</h3>
              {listing.location && (
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                  📍 {listing.location}
                </p>
              )}
              {listing.description && (
                <p
                  style={{
                    margin: '8px 0',
                    fontSize: '14px',
                    maxHeight: '60px',
                    overflow: 'hidden',
                  }}
                >
                  {listing.description.substring(0, 100)}
                  {listing.description.length > 100 ? '...' : ''}
                </p>
              )}
              <button
                onClick={() => onListingClick && onListingClick(listing)}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  width: '100%',
                }}
              >
                View Details
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
