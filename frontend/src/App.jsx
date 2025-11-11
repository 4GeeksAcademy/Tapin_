import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import ListingCard from './components/ListingCard';
import EmptyState from './components/EmptyState';
import ListingDetail from './components/ListingDetail';
import Filters from './components/Filters';
import AuthForm from './components/AuthForm';
import CreateListingForm from './components/CreateListingForm';
import DashboardLanding from './pages/DashboardLanding';
import MapView from './components/MapView';
import LocationSelector from './components/LocationSelector';

export default function App() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [token, setToken] = useState(localStorage.getItem('access_token') || null);
  // Show the marketing-style landing page when there's no token (mobile-first)
  const [showLanding, setShowLanding] = useState(!token);
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [userLocation, setUserLocation] = useState(null); // Store user's selected location

  // Helper: fetch listings optionally filtered by q
  async function fetchListings(filter) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter && filter !== 'All') params.set('q', filter);
      const url = `http://127.0.0.1:5000/listings${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      setListings(data);
    } catch (error_) {
      setError(error_.message);
    } finally {
      setLoading(false);
    }
  }

  // Initialize filter from URL and fetch
  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search);
    const q = params.get('q') || 'All';
    setActiveFilter(q);
    fetchListings(q);
  }, []);

  useEffect(() => {
    async function fetchMe() {
      if (!token) return setUser(null);
      try {
        const res = await fetch('http://127.0.0.1:5000/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        setUser(data.user);
      } catch {
        setUser(null);
      }
    }
    fetchMe();
  }, [token]);

  function handleSelect(item) {
    setSelected(item);
  }

  function handleFilterChange(filter) {
    setActiveFilter(filter);
    const params = new URLSearchParams(globalThis.location.search);
    if (!filter || filter === 'All') params.delete('q');
    else params.set('q', filter);
    const qs = params.toString();
    const newUrl = qs ? `?${qs}` : globalThis.location.pathname;
    globalThis.history.replaceState(null, '', newUrl);
    fetchListings(filter);
  }

  function SkeletonList({ count = 3 }) {
    return (
      <ul className="listings skeleton-list">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="listing-item">
            <div className="skeleton-card">
              <div className="skeleton-title" />
              <div className="skeleton-line" />
              <div className="skeleton-line" style={{ width: '80%' }} />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (showLanding && !token) {
    return (
      <div className="app-root">
        <Header />
        <DashboardLanding onEnter={() => setShowLanding(false)} />
      </div>
    );
  }

  return (
    <div className="app-root">
      <Header />

      <div className="top-section">
        <div className="auth-section">
          {user ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span>Hi, {user.email}</span>
              <button
                className="chip"
                onClick={() => {
                  localStorage.removeItem('access_token');
                  setToken(null);
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <AuthForm
              onLogin={(d) => {
                localStorage.setItem('access_token', d.access_token);
                setToken(d.access_token);
              }}
            />
          )}
        </div>

        <Filters active={activeFilter} onChange={handleFilterChange} />
      </div>

      <main>
        {/* View Mode Toggle */}
        {!loading && !error && listings.length > 0 && (
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 16px',
                background: viewMode === 'list' ? '#007bff' : '#fff',
                color: viewMode === 'list' ? '#fff' : '#333',
                border: '1px solid #007bff',
                borderRadius: '4px 0 0 4px',
                cursor: 'pointer',
                fontWeight: viewMode === 'list' ? 'bold' : 'normal',
              }}
            >
              📋 List
            </button>
            <button
              onClick={() => setViewMode('map')}
              style={{
                padding: '8px 16px',
                background: viewMode === 'map' ? '#007bff' : '#fff',
                color: viewMode === 'map' ? '#fff' : '#333',
                border: '1px solid #007bff',
                borderLeft: 'none',
                borderRadius: '0 4px 4px 0',
                cursor: 'pointer',
                fontWeight: viewMode === 'map' ? 'bold' : 'normal',
              }}
            >
              🗺️ Map
            </button>
          </div>
        )}

        {loading && <SkeletonList count={3} />}
        {error && <p className="error">Error: {error}</p>}

        {!loading && !error && (
          <section>
            {listings.length === 0 ? (
              <EmptyState />
            ) : viewMode === 'list' ? (
              <ul className="listings">
                {listings.map((l) => (
                  <li key={l.id} className="listing-item">
                    <ListingCard listing={l} onSelect={handleSelect} />
                  </li>
                ))}
              </ul>
            ) : userLocation ? (
              <MapView listings={listings} onListingClick={handleSelect} userLocation={userLocation} />
            ) : (
              <LocationSelector onLocationSelected={setUserLocation} />
            )}
          </section>
        )}

        {user && (
          <div style={{ marginTop: 12 }}>
            <h3>Create a listing</h3>
            <CreateListingForm
              token={token}
              onCreated={(data) => {
                setListings((s) => [data, ...s]);
              }}
            />
          </div>
        )}
      </main>

      {selected && (
        <ListingDetail
          listing={selected}
          onClose={() => setSelected(null)}
          token={token}
          user={user}
        />
      )}

      <footer>
        <small>Tapin prototype</small>
      </footer>
    </div>
  );
}
