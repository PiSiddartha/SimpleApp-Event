'use client';

import Link from 'next/link';
import { useEvents, useEventAnalytics } from '@/hooks/useEvents';
import { Users, Calendar, TrendingUp, Vote, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { data: events, isLoading } = useEvents();
  
  // Get analytics for first few events
  const eventIds = events?.slice(0, 3).map((e: any) => e.id) || [];
  
  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your events and engagement</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Events"
          value={isLoading ? '—' : events?.length ?? 0}
          icon={Calendar}
          color="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Active Attendees"
          value="142"
          icon={Users}
          color="bg-green-50"
          iconColor="text-green-600"
        />
        <StatCard
          title="Avg Engagement"
          value="68%"
          icon={TrendingUp}
          color="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Total Polls"
          value="24"
          icon={Vote}
          color="bg-orange-50"
          iconColor="text-orange-600"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
          <p className="text-sm text-gray-500 mt-0.5">Latest events you’ve created</p>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-primary-500" size={28} />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {events?.slice(0, 5).map((event: any) => (
                <EventRow key={event.id} event={event} />
              ))}
              {(!events || events.length === 0) && (
                <div className="text-center py-12 text-gray-500">
                  <p>No events yet</p>
                  <p className="text-sm mt-1">
                    <Link href="/dashboard/events" className="text-primary-600 hover:underline font-medium">Create an event</Link> to get started
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
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

function EventRow({ event }: { event: any }) {
  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700',
    published: 'bg-blue-100 text-blue-700',
    ongoing: 'bg-green-100 text-green-700',
    completed: 'bg-purple-100 text-purple-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  const status = event.status || 'draft';

  return (
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div className="min-w-0 flex-1">
        <h3 className="font-medium text-gray-900 truncate">{event.name}</h3>
        <p className="text-sm text-gray-500 mt-0.5">
          {event.location || 'No location'} · {event.start_time ? new Date(event.start_time).toLocaleDateString() : 'TBD'}
        </p>
      </div>
      <span className={`ml-4 shrink-0 px-2.5 py-1 text-xs font-medium rounded-full capitalize ${statusColors[status]}`}>
        {status}
      </span>
    </div>
  );
}
