'use client';

import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { useMaterials, useDeleteMaterial, useDownloadUrl } from '@/hooks/useMaterials';
import { MaterialUploader, MaterialListItem } from '@/components/MaterialUploader';
import { Loader2 } from 'lucide-react';

export default function MaterialsPage() {
  const { data: events } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const { data: materials, isLoading, refetch } = useMaterials(selectedEvent);
  const deleteMaterial = useDeleteMaterial();

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Materials</h1>
        <p className="text-sm text-gray-500 mt-1">Upload and manage event materials</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
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
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Upload Material</h2>
            <p className="text-sm text-gray-500 mb-4">Add a new material or upload link for this event</p>
            <MaterialUploader eventId={selectedEvent} onSuccess={() => refetch()} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Materials</h2>
              <p className="text-sm text-gray-500 mt-0.5">Files and links for this event</p>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-primary-500" size={28} />
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
                    <div className="text-center py-12 text-gray-500">
                      <p>No materials uploaded yet</p>
                      <p className="text-sm mt-1">Use the form above to add materials</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!selectedEvent && (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-gray-500">
          <p>Select an event above to upload and manage materials</p>
        </div>
      )}
    </div>
  );
}
