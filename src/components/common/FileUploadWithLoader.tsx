import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { FaUpload, FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';

interface FileUploadWithLoaderProps {
  label: string;
  onFileSelect: (file: File) => Promise<void>;
  onFileUploaded?: (url: string) => void;
  error?: string;
  required?: boolean;
  accept?: string;
  isUploading?: boolean;
  uploadedUrl?: string;
  onRemove?: () => void;
}

export const FileUploadWithLoader: React.FC<FileUploadWithLoaderProps> = ({
  label,
  onFileSelect,
  onFileUploaded,
  error,
  required = false,
  accept = '.pdf,.jpg,.jpeg,.png',
  isUploading = false,
  uploadedUrl,
  onRemove
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await onFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!isUploading && !uploadedUrl) {
      fileInputRef.current?.click();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await onFileSelect(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  const getFileIcon = () => {
    if (uploadedUrl) {
      return <FaCheck className="text-green-500" />;
    }
    if (isUploading) {
      return <FaSpinner className="text-blue-500 animate-spin" />;
    }
    return <FaUpload className="text-gray-400" />;
  };

  const getStatusText = () => {
    if (uploadedUrl) {
      return 'File uploaded successfully';
    }
    if (isUploading) {
      return 'Uploading...';
    }
    return 'Click to upload or drag and drop';
  };

  return (
    <UploadContainer>
      <Label>
        {label}
        {required && <Required>*</Required>}
      </Label>
      
      <UploadArea
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        $dragActive={dragActive}
        $hasError={!!error}
        $isUploading={isUploading}
        $hasFile={!!uploadedUrl}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
          required={required}
          disabled={isUploading || !!uploadedUrl}
        />
        
        <UploadContent>
          <IconContainer>
            {getFileIcon()}
          </IconContainer>
          
          <UploadText>
            <p className="text-sm font-medium">
              {getStatusText()}
            </p>
            {!uploadedUrl && !isUploading && (
              <p className="text-xs text-gray-500 mt-1">
                {accept.split(',').join(', ')} files only
              </p>
            )}
          </UploadText>

          {uploadedUrl && onRemove && (
            <RemoveButton onClick={handleRemove}>
              <FaTimes />
            </RemoveButton>
          )}
        </UploadContent>
      </UploadArea>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {uploadedUrl && (
        <FilePreview>
          <a 
            href={uploadedUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View uploaded file
          </a>
        </FilePreview>
      )}
    </UploadContainer>
  );
};

const UploadContainer = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #403E2D;
  margin-bottom: 0.5rem;
`;

const Required = styled.span`
  color: #e74c3c;
  margin-left: 0.25rem;
`;

const UploadArea = styled.div<{
  $dragActive: boolean;
  $hasError: boolean;
  $isUploading: boolean;
  $hasFile: boolean;
}>`
  width: 100%;
  padding: 1.5rem;
  border: 2px dashed;
  border-color: ${props => {
    if (props.$hasError) return '#e74c3c';
    if (props.$dragActive) return '#3b82f6';
    if (props.$hasFile) return '#10b981';
    if (props.$isUploading) return '#3b82f6';
    return '#d1d5db';
  }};
  border-radius: 0.5rem;
  cursor: ${props => props.$isUploading || props.$hasFile ? 'default' : 'pointer'};
  background-color: ${props => {
    if (props.$dragActive) return '#eff6ff';
    if (props.$hasFile) return '#f0fdf4';
    if (props.$isUploading) return '#eff6ff';
    return '#ffffff';
  }};
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => {
      if (props.$hasError) return '#e74c3c';
      if (props.$hasFile) return '#10b981';
      if (props.$isUploading) return '#3b82f6';
      return '#3b82f6';
    }};
    background-color: ${props => {
      if (props.$hasFile) return '#f0fdf4';
      if (props.$isUploading) return '#eff6ff';
      return '#f8fafc';
    }};
  }
`;

const UploadContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  position: relative;
`;

const IconContainer = styled.div`
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UploadText = styled.div`
  text-align: center;
  flex: 1;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.3s ease;
  
  &:hover {
    background: #c0392b;
    transform: scale(1.1);
  }
`;

const ErrorMessage = styled.p`
  color: #e74c3c;
  font-size: 0.75rem;
  margin-top: 0.25rem;
`;

const FilePreview = styled.div`
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 0.25rem;
  text-align: center;
`; 