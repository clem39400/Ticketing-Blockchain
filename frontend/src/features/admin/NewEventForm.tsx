'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { setupEvent } from '@/lib/api';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { Plus, CalendarPlus } from 'lucide-react';

/** Admin form creating event metadata in the back-office (POST /setup-event). */
export function NewEventForm() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', description: '', date: '', banner: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.date) {
      setStatus('error');
      setMessage('Nom, description et date sont requis.');
      return;
    }
    setStatus('sending');
    setMessage('');
    try {
      await setupEvent({
        name: form.name.trim(),
        description: form.description.trim(),
        eventDate: form.date.split('T')[0], // API attend yyyy-MM-dd
        eventBanner: form.banner.trim() || undefined,
      });
      setStatus('ok');
      setMessage('Événement enregistré dans le back-office.');
      setForm({ name: '', description: '', date: '', banner: '' });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    } catch (err) {
      setStatus('error');
      setMessage(
        `Impossible de créer l'événement. ${err instanceof Error ? err.message : ''}`
      );
    }
  };

  return (
    <section className="card p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <CalendarPlus className="w-5 h-5 text-ink" />
        <h2 className="section-label">Nouvel événement</h2>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="field-label">Titre *</label>
          <input
            className="input"
            placeholder="ex: Concert Paris 1"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Description *</label>
          <textarea
            className="input min-h-[88px] resize-y"
            placeholder="Décrivez l'événement…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Date & heure *</label>
            <input
              type="datetime-local"
              className="input"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Bannière (URL, optionnel)</label>
            <input
              className="input"
              placeholder="https://… ou ipfs://…"
              value={form.banner}
              onChange={(e) => setForm({ ...form, banner: e.target.value })}
            />
          </div>
        </div>

        {status === 'error' && <Alert variant="error">{message}</Alert>}
        {status === 'ok' && <Alert variant="success">{message}</Alert>}

        <button type="submit" disabled={status === 'sending'} className="btn-primary">
          {status === 'sending' ? <Spinner /> : <Plus className="w-4 h-4" />}
          Créer l&apos;événement
        </button>
      </form>
    </section>
  );
}
