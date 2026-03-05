'use client';

import { useState } from 'react';
import { useEvents, useEventAnalytics } from '@/hooks/useEvents';
import { Users, TrendingUp, Vote, FileText, Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: events } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const { data: analytics, isLoading } = useEventAnalytics(selectedEvent);

  return (
    <div className="w-full max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Engagement and attendance by event</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
        <select
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full max-w-md px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
        >
          <option value="">Choose an event…</option>
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
            <div className="flex items-center justify-center py-16 rounded-xl border border-gray-200 bg-white">
              <Loader2 className="animate-spin text-primary-500" size={28} />
            </div>
          ) : analytics ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                  value={analytics.materials?.total_materials ?? 0}
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

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900">Top Engaged Students</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Ranked by engagement score</p>
                </div>
                <div className="overflow-x-auto">
                  {analytics.top_students && analytics.top_students.length > 0 ? (
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">#</th>
                          <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">User</th>
                          <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {analytics.top_students.map((student: any, index: number) => (
                          <tr key={student.user_id} className="hover:bg-gray-50/50">
                            <td className="px-6 py-4">
                              <span className="inline-flex w-7 h-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
                                {index + 1}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-900 font-mono text-sm">
                              {student.user_id.slice(0, 8)}…
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-semibold text-primary-600 tabular-nums">{student.score}</span>
                              <span className="text-sm text-gray-500 ml-1">pts</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>No engagement data yet</p>
                      <p className="text-sm mt-1">Activity will appear as students join and participate</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </>
      )}

      {!selectedEvent && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          <p>Select an event above to view analytics</p>
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
  iconColor,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${color}`}>
          <Icon className={iconColor} size={22} />
        </div>
      </div>
    </div>
  );
}
