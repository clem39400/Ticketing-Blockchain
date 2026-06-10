import { useState, useEffect } from 'react';
import { api } from '../api';

const EMPTY_EVENT = { title: '', description: '', date: '', banner: null };
const EMPTY_CATEGORY = {
  eventId: '',
  title: '',
  description: '',
  price: '',
  totalSupply: '',
  image: null,
};

function StatusMsg({ status }) {
  if (!status) return null;
  if (status === 'loading') return <p className="checkout-status text-muted">Submitting…</p>;
  if (status === 'success') return <p className="checkout-status text-success">✓ Created successfully!</p>;
  if (status?.error) return <p className="checkout-status text-error">✗ {status.error}</p>;
  return null;
}

export default function Admin() {
  // ── New Event ──
  const [eventForm, setEventForm] = useState(EMPTY_EVENT);
  const [eventStatus, setEventStatus] = useState(null);

  // ── New Category ──
  const [catForm, setCatForm] = useState(EMPTY_CATEGORY);
  const [catStatus, setCatStatus] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    api.getEvents().then(setEvents).catch(() => {});
  }, []);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setEventStatus('loading');
    try {
      const fd = new FormData();
      fd.append('title', eventForm.title);
      fd.append('description', eventForm.description);
      fd.append('date', eventForm.date);
      if (eventForm.banner) fd.append('banner', eventForm.banner);
      const created = await api.createEvent(fd);
      setEvents((prev) => [...prev, created]);
      setEventForm(EMPTY_EVENT);
      setEventStatus('success');
    } catch (err) {
      setEventStatus({ error: err.message });
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!catForm.eventId) {
      setCatStatus({ error: 'Please select an event.' });
      return;
    }
    setCatStatus('loading');
    try {
      const fd = new FormData();
      fd.append('name', catForm.title);
      fd.append('description', catForm.description);
      fd.append('price', catForm.price);
      fd.append('totalSupply', catForm.totalSupply);
      if (catForm.image) fd.append('image', catForm.image);
      await api.createCategory(catForm.eventId, fd);
      setCatForm(EMPTY_CATEGORY);
      setCatStatus('success');
    } catch (err) {
      setCatStatus({ error: err.message });
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">ADMIN</h1>

      {/* ── New Event ── */}
      <div className="admin-section">
        <h2 className="admin-section-title">NEW EVENT</h2>
        <form onSubmit={handleCreateEvent}>
          <div className="form-group">
            <label htmlFor="ev-title">Title</label>
            <input
              id="ev-title"
              type="text"
              placeholder="Event title"
              value={eventForm.title}
              onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ev-desc">Description</label>
            <textarea
              id="ev-desc"
              placeholder="Event description"
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ev-date">Date & Time</label>
            <input
              id="ev-date"
              type="datetime-local"
              value={eventForm.date}
              onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ev-banner">Event banner (optional, stored on IPFS)</label>
            <input
              id="ev-banner"
              type="file"
              accept="image/*"
              onChange={(e) => setEventForm({ ...eventForm, banner: e.target.files[0] ?? null })}
            />
          </div>

          <StatusMsg status={eventStatus} />
          <button
            type="submit"
            className="btn-primary"
            disabled={eventStatus === 'loading'}
          >
            Create event
          </button>
        </form>
      </div>

      {/* ── New Ticket Category ── */}
      <div className="admin-section">
        <h2 className="admin-section-title">NEW TICKET CATEGORY</h2>
        <p className="form-hint">
          Creating a category pins the NFT image and metadata to IPFS, then deploys
          its NFT contract — this can take a moment.
        </p>
        <form onSubmit={handleCreateCategory}>
          <div className="form-group">
            <label htmlFor="cat-event">Select an event</label>
            <select
              id="cat-event"
              value={catForm.eventId}
              onChange={(e) => setCatForm({ ...catForm, eventId: e.target.value })}
              required
            >
              <option value="">Select an event…</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="cat-title">Title</label>
            <input
              id="cat-title"
              type="text"
              placeholder="e.g. VIP, Standard…"
              value={catForm.title}
              onChange={(e) => setCatForm({ ...catForm, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="cat-desc">Description</label>
            <textarea
              id="cat-desc"
              placeholder="Category description"
              value={catForm.description}
              onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label htmlFor="cat-price">Price in ETH</label>
              <input
                id="cat-price"
                type="number"
                min="0"
                step="0.001"
                placeholder="0.05"
                value={catForm.price}
                onChange={(e) => setCatForm({ ...catForm, price: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="cat-supply">Total supply</label>
              <input
                id="cat-supply"
                type="number"
                min="1"
                step="1"
                placeholder="100"
                value={catForm.totalSupply}
                onChange={(e) => setCatForm({ ...catForm, totalSupply: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cat-img">Ticket image (stored on IPFS, used as NFT image)</label>
            <input
              id="cat-img"
              type="file"
              accept="image/*"
              onChange={(e) => setCatForm({ ...catForm, image: e.target.files[0] ?? null })}
            />
          </div>

          <StatusMsg status={catStatus} />
          <button
            type="submit"
            className="btn-primary"
            disabled={catStatus === 'loading'}
          >
            Create category
          </button>
        </form>
      </div>
    </div>
  );
}
