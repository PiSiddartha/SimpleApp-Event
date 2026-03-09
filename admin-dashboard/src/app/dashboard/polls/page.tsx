'use client';

import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { usePolls, usePollResults, useCreatePoll } from '@/hooks/usePolls';
import { PollForm } from '@/components/PollForm';
import { Plus, Vote, Loader2 } from 'lucide-react';
import { Modal } from '@/components/Modal';

export default function PollsPage() {
  const { data: events } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const { data: polls = [], isLoading } = usePolls(selectedEvent || undefined);
  const [showModal, setShowModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<string | null>(null);

  const { data: pollResults } = usePollResults(selectedPoll || '');

  const results = Array.isArray(pollResults?.results) ? pollResults.results : [];
  const totalVotes = results.reduce((sum: number, r: any) => sum + r.votes, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Polls</h1>
        <p className="mt-1 text-sm text-gray-500">Create and view poll results</p>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label htmlFor="polls-event-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Event
        </label>
        <p className="mb-3 text-sm text-gray-500">Pick an event to view its polls and create new ones.</p>
        <select
          id="polls-event-select"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Choose an event…</option>
          {Array.isArray(events) && events.map((event: any) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </section>

      {!selectedEvent ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
          <p className="text-gray-600 font-medium">Select an event</p>
          <p className="mt-2 text-sm text-gray-500">Choose an event above to view and create polls.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Polls for this event</h2>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
            >
              <Plus size={18} aria-hidden />
              Create Poll
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-20 shadow-sm">
              <Loader2 className="animate-spin text-primary-500" size={32} aria-hidden />
            </div>
          ) : (
        <div className="space-y-4">
          {polls.map((poll: any) => (
            <div
              key={poll.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-gray-300 hover:shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900">{poll.question}</h3>
                  <p className="text-sm text-gray-500 mt-1">Event ID: {poll.event_id}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      poll.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {poll.status}
                  </span>
                  <button
                    onClick={() => setSelectedPoll(poll.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
                  >
                    <Vote size={16} />
                    View Results
                  </button>
                </div>
              </div>
            </div>
          ))}

          {polls.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <p className="text-gray-600 font-medium">No polls yet</p>
              <p className="mt-2 text-sm text-gray-500">Create a poll to collect responses from attendees.</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-primary-700"
              >
                <Plus size={18} aria-hidden />
                Create Poll
              </button>
            </div>
          )}
        </div>
          )}
        </>
      )}

      {showModal && selectedEvent && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Create Poll</h2>
            <p className="text-sm text-gray-500 mb-6">Add a question and options for this event</p>
            <PollForm eventId={selectedEvent} onSuccess={() => setShowModal(false)} />
          </div>
        </Modal>
      )}

      {selectedPoll && pollResults && (
        <Modal onClose={() => setSelectedPoll(null)}>
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">{pollResults.question}</h2>
            <p className="text-sm text-gray-500 mb-6">
              Total votes: <span className="font-medium text-gray-700">{totalVotes}</span>
            </p>
            <div className="space-y-4">
              {results.map((result: any, index: number) => {
                const total = results.reduce((sum: number, r: any) => sum + r.votes, 0);
                const percentage = total > 0 ? Math.round((result.votes / total) * 100) : 0;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-800">{result.option}</span>
                      <span className="text-gray-500 tabular-nums">{result.votes} votes ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-primary-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
