import React, { useRef, useState } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  currentUrl?: string | null;
  label?: string;
  helperText?: string;
  required?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  currentUrl,
  label = 'Upload Photograph',
  helperText = 'JPEG, PNG, or WebP up to 5MB',
  required = false,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) {
      return;
    }

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setError('Please upload a valid JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onChange(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setError(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const displayImage = preview || currentUrl;

  return (
    <div className="w-full">
      {label && (
        <label className="input-label">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-150 ${
          error
            ? 'border-red-300 bg-red-50/30'
            : displayImage
            ? 'border-surface-300 bg-surface-50'
            : 'border-surface-300 bg-white hover:bg-surface-50 hover:border-primary-400'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {displayImage ? (
          <div className="relative w-full max-h-60 flex items-center justify-center overflow-hidden rounded-lg">
            <img
              src={displayImage}
              alt="Preview"
              className="max-h-60 object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-surface-900/70 hover:bg-surface-900 text-white rounded-full p-1.5 transition-colors"
              title="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-surface-700">
              Click to select or drag and drop
            </p>
            <p className="text-xs text-surface-400 mt-1">{helperText}</p>
          </div>
        )}
      </div>

      {error && <p className="input-error">{error}</p>}
    </div>
  );
}
