'use client';

import { useState } from 'react';
import { useEvents, useEventAnalytics } from '@/hooks/useEvents';
import { Users, TrendingUp, Vote, FileText, Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: events } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const { data: analytics, isLoading } = useEventAnalytics(selectedEvent);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Analytics</h1>

      {/* Event Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Event
        </label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Choose an event...</option>
          {events?.map((event: any) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      {selectedEvent && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-gray-400" size={24} />
            </div>
          ) : analytics && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Attendance"
                  value={analytics.attendance_count}
                  icon={Users}
                  color="bg-blue-50"
                  iconColor="text-blue-600"
                />
                <StatCard
                  title="Poll Participation"
                  value={analytics.poll_participation}
                  icon={Vote}
                  color="bg-green-50"
                  iconColor="text-green-600"
                />
                <StatCard
                  title="Materials"
                  value={analytics.materials?.total_materials || 0}
                  icon={FileText}
                  color="bg-purple-50"
                  iconColor="text-purple-600"
                />
                <StatCard
                  title="Avg Engagement"
                  value={`${analytics.average_engagement_score}%`}
                  icon={TrendingUp}
                  color="bg-orange-50"
                  iconColor="text-orange-600"
                />
              </div>

              {/* Top Engaged Students */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Top Engaged Students
                </h2>
                
                {analytics.top_students && analytics.top_students.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.top_students.map((student: any, index: number) => (
                      <div 
                        key={student.user_id}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center bg-primary-100 text-primary-600 rounded-full text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-gray-900">
                            User: {student.user_id.slice(0, 8)}...
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary-600">
                            {student.score}
                          </span>
                          <span className="text-sm text-gray-500">points</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No engagement data yet
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}

      {!selectedEvent && (
        <div className="text-center py-12 text-gray-500">
          Select an event to view analytics
        </div>
      )}
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  iconColor 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string; 
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className={iconColor} size={24} />
        </div>
      </div>
    </div>
  );
}
