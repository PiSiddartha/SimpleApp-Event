'use client';

import { useState } from 'react';
import { useEvents, useCreateEvent } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { Plus, Loader2, Calendar, QrCode, Users } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { CreateEventInput } from '@/types/event';
import QRCode from 'qrcode';

export default function EventsPage() {
  const { data: events, isLoading } = useEvents();
  const createEvent = useCreateEvent();
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrPayload, setQrPayload] = useState('');
  const [qrEventName, setQrEventName] = useState('');
  const [submitError, setSubmitError] = useState<string>('');
  const [formData, setFormData] = useState<CreateEventInput>({
    name: '',
    description: '',
    location: '',
    event_type: 'offline',
    start_time: '',
    end_time: '',
    max_attendees: 100,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (formData.start_time && formData.end_time && formData.end_time < formData.start_time) {
      setSubmitError('End time must be after start time.');
      return;
    }

    try {
      await createEvent.mutateAsync({
        ...formData,
        start_time: formData.start_time || undefined,
        end_time: formData.end_time || undefined,
        description: formData.description?.trim() || undefined,
        location: formData.location?.trim() || undefined,
        max_attendees: formData.max_attendees ? Math.max(1, formData.max_attendees) : undefined,
      });
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Failed to create event';
      setSubmitError(message);
    }
  };

  const handleQRClick = async (eventItem: any) => {
    const payload = eventItem?.id || eventItem?.qr_code;
    if (!payload) return;

    try {
      const dataUrl = await QRCode.toDataURL(payload, {
        width: 320,
        margin: 1,
      });
      setQrPayload(payload);
      setQrEventName(eventItem?.name || 'Event');
      setQrDataUrl(dataUrl);
      setShowQRModal(true);
    } catch (error) {
      setSubmitError('Unable to generate QR code. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      event_type: 'offline',
      start_time: '',
      end_time: '',
      max_attendees: 100,
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Events</h1>
            <p className="mt-1 text-sm text-gray-500">Create and manage your events</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            <Plus size={18} aria-hidden />
            Create Event
          </button>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-20 shadow-sm">
          <Loader2 className="animate-spin text-primary-500" size={32} aria-hidden />
        </div>
      ) : events && events.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {events.map((event: any) => (
            <EventCard
              key={event.id}
              event={event}
              onQRClick={() => handleQRClick(event)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-gradient-to-b from-primary-50/80 to-white px-8 py-14 sm:px-12 sm:py-16">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-100">
                <Calendar size={40} className="text-primary-600" aria-hidden />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">No events yet</h2>
              <p className="mt-3 text-gray-600">
                Create an event, share the QR code with attendees, and run polls and materials from the dashboard.
              </p>
              <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-gray-500">
                <li className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary-500" aria-hidden />
                  Create events
                </li>
                <li className="flex items-center gap-2">
                  <QrCode size={16} className="text-primary-500" aria-hidden />
                  QR check-in
                </li>
                <li className="flex items-center gap-2">
                  <Users size={16} className="text-primary-500" aria-hidden />
                  Track attendance
                </li>
              </ul>
              <button
                onClick={() => setShowModal(true)}
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
              >
                <Plus size={20} aria-hidden />
                Create your first event
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Create Event</h2>
            <p className="text-sm text-gray-500 mb-6">Add a new event for students to join</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="e.g. Annual Tech Workshop"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  rows={3}
                  placeholder="Brief description of the event"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Venue or link"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Event Type</label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value as CreateEventInput['event_type'] })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Time</label>
                  <input
                    type="datetime-local"
                    value={formData.start_time || ''}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">End Time</label>
                  <input
                    type="datetime-local"
                    value={formData.end_time || ''}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Attendees</label>
                <input
                  type="number"
                  value={formData.max_attendees ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_attendees: e.target.value === '' ? undefined : Math.max(1, parseInt(e.target.value, 10) || 1),
                    })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 max-w-[180px]"
                  min={1}
                />
              </div>

              {submitError && (
                <p className="text-sm text-red-600">{submitError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createEvent.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  {createEvent.isPending && <Loader2 size={18} className="animate-spin" />}
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {showQRModal && (
        <Modal onClose={() => setShowQRModal(false)}>
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Event QR Code</h2>
            <p className="text-sm text-gray-500 mb-6">
              Scan this code from the student app to join {qrEventName}.
            </p>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-6">
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${qrEventName}`}
                  className="mx-auto h-64 w-64"
                />
              )}
            </div>

            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-xs font-medium text-gray-500">QR Payload</p>
              <p className="mt-1 break-all text-sm text-gray-800">{qrPayload}</p>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(qrPayload);
                  } catch {
                    // Ignore clipboard failures in unsupported contexts.
                  }
                }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Copy Event ID
              </button>
              <a
                href={qrDataUrl}
                download={`event-${qrPayload}.png`}
                className="flex-1 text-center px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Download QR
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
