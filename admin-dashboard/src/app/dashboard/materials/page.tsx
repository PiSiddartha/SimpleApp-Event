'use client';

import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { useMaterials, useDeleteMaterial, useDownloadUrl } from '@/hooks/useMaterials';
import { MaterialUploader, MaterialListItem } from '@/components/MaterialUploader';
import { Loader2, FileText } from 'lucide-react';

export default function MaterialsPage() {
  const { data: events } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const { data: materials, isLoading, refetch } = useMaterials(selectedEvent);
  const deleteMaterial = useDeleteMaterial();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Materials</h1>
        <p className="mt-1 text-sm text-gray-500">Upload and manage event materials</p>
      </header>

      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <label htmlFor="materials-event-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Event
        </label>
        <p className="mb-3 text-sm text-gray-500">Pick an event to upload files or view its materials.</p>
        <select
          id="materials-event-select"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
          className="w-full max-w-md rounded-lg border border-gray-300 bg-white px-3 py-2.5 focus:border-primary-500 focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Choose an event…</option>
          {Array.isArray(events) && events.map((event: any) => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </section>

      {selectedEvent ? (
        <>
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
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
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-col items-center justify-center px-8 py-14 text-center sm:py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
              <FileText size={32} className="text-gray-400" aria-hidden />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Choose an event</h2>
            <p className="mt-2 max-w-sm text-sm text-gray-500">
              Select an event from the dropdown above to upload materials and manage files for that event.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
