'use client';

import { useState, useRef, useCallback } from 'react';
import { createClient } from '@sanity/client';

interface SanityFileValue {
  _type: 'file';
  asset: { _type: 'reference'; _ref: string };
}

interface FileUploadProps {
  label: string;
  accept: string;
  description?: string;
  value: SanityFileValue | null | undefined;
  onChange: (value: SanityFileValue | null) => void;
}

/**
 * Fetch a short-lived Sanity write token from the authenticated admin endpoint,
 * then upload the file directly to Sanity — bypasses Netlify's ~6 MB function limit.
 */
export default function FileUpload({ label, accept, description, value, onChange }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    setError('');
    setUploading(true);
    try {
      // 1. Get Sanity credentials from the authenticated admin endpoint
      const res = await fetch('/api/admin/upload-token');
      if (!res.ok) throw new Error('Failed to get upload credentials');
      const { data } = await res.json();

      // 2. Create a temporary Sanity client in memory (token never stored)
      const client = createClient({
        projectId: data.projectId,
        dataset: data.dataset,
        token: data.token,
        apiVersion: '2026-02-19',
        useCdn: false,
      });

      // 3. Upload directly to Sanity — no Netlify function size limit
      const asset = await client.assets.upload('file', file, {
        filename: file.name,
        contentType: file.type,
      });

      onChange({ _type: 'file', asset: { _type: 'reference', _ref: asset._id } });
    } catch {
      setError('שגיאה בהעלאת הקובץ');
    } finally {
      setUploading(false);
    }
  }, [onChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const hasFile = !!value?.asset?._ref;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hasFile ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <span className="text-sm text-green-700">קובץ הועלה בהצלחה</span>
          <button type="button" onClick={handleRemove} className="text-sm text-red-500 hover:text-red-700 underline">הסר</button>
        </div>
      ) : (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${uploading ? 'border-blue-300 bg-blue-50' : 'border-gray-300 cursor-pointer hover:border-blue-400'}`}
        >
          {uploading ? (
            <p className="text-sm text-blue-600 font-medium">מעלה ישירות ל-Sanity...</p>
          ) : (
            <p className="text-sm text-gray-500">{description || 'גרור קובץ או לחץ לבחירה'}</p>
          )}
        </div>
      )}
      <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} className="hidden" />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
