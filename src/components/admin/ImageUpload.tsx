'use client';

import { useState, useRef, useCallback } from 'react';
import { sanityImageUrl } from '@/lib/sanity/image';

interface SanityImageValue {
  _type: 'image';
  asset: { _type: 'reference'; _ref: string };
}

interface ImageUploadProps {
  label: string;
  value: SanityImageValue | null | undefined;
  onChange: (value: SanityImageValue | null) => void;
}

export default function ImageUpload({ label, value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageUrl = value ? sanityImageUrl(value) : '';

  const handleUpload = useCallback(async (file: File) => {
    setError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (res.ok && json.success) {
        onChange({
          _type: 'image',
          asset: { _type: 'reference', _ref: json.data._ref },
        });
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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>

      {imageUrl ? (
        <div className="relative inline-block">
          <img
            src={imageUrl}
            alt={label}
            className="h-32 w-32 object-cover rounded border border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
          >
            X
          </button>
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
            <p className="text-sm text-gray-500">גרור תמונה או לחץ לבחירה</p>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
