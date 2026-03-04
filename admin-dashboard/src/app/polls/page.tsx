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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Polls</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
        >
          <Plus size={18} />
          Create Poll
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-gray-400" size={24} />
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll: any) => (
            <div 
              key={poll.id}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{poll.question}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Event ID: {poll.event_id}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  poll.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {poll.status}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedPoll(poll.id)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-primary-600 hover:bg-primary-50 rounded-lg"
                >
                  <Vote size={16} />
                  View Results
                </button>
              </div>
            </div>
          ))}
          
          {polls.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No polls yet. Create your first poll!
            </div>
          )}
        </div>
      )}

      {/* Create Poll Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Poll</h2>
            <PollForm 
              eventId="default" 
              onSuccess={() => setShowModal(false)} 
            />
          </div>
        </Modal>
      )}

      {/* Poll Results Modal */}
      {selectedPoll && pollResults && (
        <Modal onClose={() => setSelectedPoll(null)}>
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {pollResults.question}
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Total votes: {pollResults.results.reduce((sum: number, r: any) => sum + r.votes, 0)}
            </p>
            
            <div className="space-y-3">
              {pollResults.results.map((result: any, index: number) => {
                const total = pollResults.results.reduce((sum: number, r: any) => sum + r.votes, 0);
                const percentage = total > 0 ? Math.round((result.votes / total) * 100) : 0;
                
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{result.option}</span>
                      <span className="text-gray-500">{result.votes} votes ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full" 
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
