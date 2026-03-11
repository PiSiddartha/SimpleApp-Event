'use client';

import { Event } from '@/types/event';
import { Calendar, MapPin, Users, QrCode, Pencil } from 'lucide-react';
import { formatDateTimeInIst } from '@/utils/datetime';

interface EventCardProps {
  event: Event;
  onQRClick?: () => void;
  onEdit?: () => void;
  onClick?: () => void;
}

export function EventCard({ event, onQRClick, onEdit, onClick }: EventCardProps) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow hover:border-gray-300 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <h3 className="font-semibold text-gray-900">{event.name}</h3>
        <div className="flex items-center gap-1.5 shrink-0">
          {event.visibility === 'private' && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
              Private
            </span>
          )}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[event.status]}`}>
            {event.status}
          </span>
        </div>
      </div>
      
      {event.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>
      )}
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Calendar size={16} />
          <span>{formatDateTimeInIst(event.start_time)} IST</span>
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
      
      <div className="mt-3 flex gap-2">
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Pencil size={16} />
            Edit
          </button>
        )}
        {onQRClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQRClick();
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${onEdit ? 'flex-1' : 'w-full'} bg-primary-50 text-primary-600 hover:bg-primary-100`}
          >
            <QrCode size={16} />
            Generate QR Code
          </button>
        )}
      </div>
    </div>
  );
}
