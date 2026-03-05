'use client';

import { useState, useRef } from 'react';
import { useCreateMaterial } from '@/hooks/useMaterials';
import { Upload, Loader2, FileText, Download, Trash2 } from 'lucide-react';

interface MaterialUploaderProps {
  eventId: string;
  onSuccess?: () => void;
}

export function MaterialUploader({ eventId, onSuccess }: MaterialUploaderProps) {
  const [title, setTitle] = useState('');
  const [fileType, setFileType] = useState('application/pdf');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createMaterial = useCreateMaterial();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    await createMaterial.mutateAsync({
      event_id: eventId,
      title: title.trim(),
      file_type: fileType,
    });

    setTitle('');
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Material Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="e.g., Session Slides, Lecture Notes"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          File Type
        </label>
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="application/pdf">PDF</option>
          <option value="application/vnd.ms-powerpoint">PowerPoint</option>
          <option value="application/vnd.openxmlformats-officedocument.presentationml.presentation">PowerPoint (New)</option>
          <option value="application/msword">Word</option>
          <option value="application/vnd.openxmlformats-officedocument.wordprocessingml.document">Word (New)</option>
          <option value="video/mp4">Video</option>
          <option value="application/zip">ZIP Archive</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={createMaterial.isPending || !title.trim()}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
      >
        {createMaterial.isPending ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Upload size={18} />
        )}
        Create Upload Link
      </button>
    </form>
  );
}

// Material List Item
interface MaterialListItemProps {
  material: {
    id: string;
    title: string;
    file_url: string;
    file_type?: string;
  };
  onDownload?: () => void;
  onDelete?: () => void;
}

export function MaterialListItem({ material, onDownload, onDelete }: MaterialListItemProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50/80 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-50 rounded-lg">
          <FileText size={20} className="text-primary-600" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{material.title}</h4>
          <p className="text-sm text-gray-500">{material.file_type || 'File'}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {onDownload && (
          <button
            onClick={onDownload}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
            title="Download"
          >
            <Download size={18} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
            title="Delete"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
