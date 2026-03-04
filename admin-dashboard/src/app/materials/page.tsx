'use client';

import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { useMaterials, useDeleteMaterial, useDownloadUrl } from '@/hooks/useMaterials';
import { MaterialUploader, MaterialListItem } from '@/components/MaterialUploader';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { Modal } from '@/components/Modal';

export default function MaterialsPage() {
  const { data: events } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const { data: materials, isLoading, refetch } = useMaterials(selectedEvent);
  const deleteMaterial = useDeleteMaterial();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Materials</h1>
      </div>

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
          {/* Upload Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Material</h2>
            <MaterialUploader 
              eventId={selectedEvent} 
              onSuccess={() => refetch()} 
            />
          </div>

          {/* Materials List */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Materials</h2>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin text-gray-400" size={24} />
              </div>
            ) : (
              <div className="space-y-3">
                {materials?.materials?.map((material: any) => (
                  <MaterialListItem
                    key={material.id}
                    material={material}
                    onDownload={() => window.open(material.file_url, '_blank')}
                    onDelete={() => deleteMaterial.mutate(material.id)}
                  />
                ))}
                
                {(!materials?.materials || materials.materials.length === 0) && (
                  <p className="text-center text-gray-500 py-8">
                    No materials uploaded yet
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
