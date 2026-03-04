'use client';

import { Event } from '@/types/event';
import { Calendar, MapPin, Users, QrCode } from 'lucide-react';

interface EventCardProps {
  event: Event;
  onQRClick?: () => void;
  onClick?: () => void;
}

export function EventCard({ event, onQRClick, onClick }: EventCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBD';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{event.name}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[event.status]}`}>
          {event.status}
        </span>
      </div>
      
      {event.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>
      )}
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{formatDate(event.start_time)}</span>
        </div>
        
        {event.location && (
          <div className="flex items-center gap-2">
            <MapPin size={16} />
            <span>{event.location}</span>
          </div>
        )}
        
        {event.max_attendees && (
          <div className="flex items-center gap-2">
            <Users size={16} />
            <span>Max {event.max_attendees} attendees</span>
          </div>
        )}
      </div>
      
      {event.qr_code && onQRClick && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQRClick();
          }}
          className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
        >
          <QrCode size={16} />
          Generate QR Code
        </button>
      )}
    </div>
  );
}
