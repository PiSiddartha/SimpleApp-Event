'use client';

import { useEvents, useEventAnalytics } from '@/hooks/useEvents';
import { Users, Calendar, TrendingUp, Vote, FileText, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { data: events, isLoading } = useEvents();
  
  // Get analytics for first few events
  const eventIds = events?.slice(0, 3).map((e: any) => e.id) || [];
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Events"
          value={isLoading ? '-' : events?.length || 0}
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
      
      {/* Recent Events */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Events</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin text-gray-400" size={24} />
          </div>
        ) : (
          <div className="space-y-4">
            {events?.slice(0, 5).map((event: any) => (
              <EventRow key={event.id} event={event} />
            ))}
            
            {(!events || events.length === 0) && (
              <p className="text-center text-gray-500 py-8">No events yet</p>
            )}
          </div>
        )}
      </div>
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

function EventRow({ event }: { event: any }) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <h3 className="font-medium text-gray-900">{event.name}</h3>
        <p className="text-sm text-gray-500">
          {event.location || 'No location'} • {event.start_time ? new Date(event.start_time).toLocaleDateString() : 'TBD'}
        </p>
      </div>
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[event.status]}`}>
        {event.status}
      </span>
    </div>
  );
}
