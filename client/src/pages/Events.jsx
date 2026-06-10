import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

function ipfsToHttp(url) {
  if (!url) return null;
  return url.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${url.slice(7)}` : url;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getEvents()
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><p className="loading">Loading events…</p></div>;
  if (error) return <div className="page-container"><p className="error-msg">Error: {error}</p></div>;

  return (
    <div className="page-container">
      <h1 className="page-title">Events</h1>

      {events.length === 0 ? (
        <p className="loading">No events available.</p>
      ) : (
        <div className="events-grid">
          {events.map((event) => {
            const banner = ipfsToHttp(event.bannerUrl ?? event.banner_url ?? event.image);
            return (
              <div
                key={event.id}
                className="event-card"
                onClick={() => navigate(`/events/${event.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/events/${event.id}`)}
              >
                <div className="event-card-banner">
                  {banner
                    ? <img src={banner} alt={event.title} loading="lazy" />
                    : <div className="event-card-placeholder" />}
                </div>
                <div className="event-card-body">
                  <h2>{event.title}</h2>
                  <p className="event-card-date">{formatDate(event.date)}</p>
                  <p className="event-card-price">
                    From {event.minPrice ?? event.min_price ?? '—'} ETH
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
