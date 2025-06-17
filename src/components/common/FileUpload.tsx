import React, { useRef } from 'react';

interface FileUploadProps {
  label: string;
  onFileSelect: (file: File) => void;
  error?: string;
  required?: boolean;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  onFileSelect,
  error,
  required = false,
  accept = '.pdf,.jpg,.jpeg,.png'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        onClick={handleClick}
        className={`w-full px-3 py-2 border-2 border-dashed rounded-md cursor-pointer hover:border-blue-500 transition-colors ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
          required={required}
        />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            {accept.split(',').join(', ')} files only
          </p>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}; 