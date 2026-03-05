'use client';

import { useState } from 'react';
import { usePolls, usePollResults, useCreatePoll } from '@/hooks/usePolls';
import { PollForm } from '@/components/PollForm';
import { Plus, Vote, Loader2 } from 'lucide-react';
import { Modal } from '@/components/Modal';

export default function PollsPage() {
  const { data: pollsData, isLoading } = usePolls();
  const polls = pollsData?.polls || pollsData || [];
  const [showModal, setShowModal] = useState(false);
  const [selectedPoll, setSelectedPoll] = useState<string | null>(null);

  const { data: pollResults } = usePollResults(selectedPoll || '');

  const totalVotes = pollResults?.results?.reduce((sum: number, r: any) => sum + r.votes, 0) ?? 0;

  return (
    <div className="w-full max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Polls</h1>
          <p className="text-sm text-gray-500 mt-1">Create and view poll results</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          Create Poll
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 rounded-xl border border-gray-200 bg-white">
          <Loader2 className="animate-spin text-primary-500" size={28} />
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll: any) => (
            <div
              key={poll.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:border-gray-300 transition-colors"
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
            <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-gray-200 bg-white text-center">
              <p className="text-gray-500 mb-2">No polls yet</p>
              <p className="text-sm text-gray-400 mb-4">Create a poll to collect responses from attendees</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
              >
                <Plus size={18} />
                Create Poll
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Create Poll</h2>
            <p className="text-sm text-gray-500 mb-6">Add a question and options for your event</p>
            <PollForm eventId="default" onSuccess={() => setShowModal(false)} />
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
              {pollResults.results.map((result: any, index: number) => {
                const total = pollResults.results.reduce((sum: number, r: any) => sum + r.votes, 0);
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
