'use client';

import { useState, useRef, useCallback } from 'react';

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

export default function FileUpload({ label, accept, description, value, onChange }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (file: File) => {
    setError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload?type=file', { method: 'POST', body: formData });
      const json = await res.json();
      if (res.ok && json.success) {
        onChange({ _type: 'file', asset: { _type: 'reference', _ref: json.data._ref } });
      } else {
        setError(json.message || 'שגיאה בהעלאת הקובץ');
      }
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
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          {uploading ? (
            <p className="text-sm text-gray-500">מעלה...</p>
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
