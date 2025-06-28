import React, { useRef } from 'react';
import styled from 'styled-components';

interface FileUploadProps {
  onFileSelect: (file: File | null) => void;
  error?: string;
  required?: boolean;
  accept?: string;
  loading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  error,
  required = false,
  accept = '.pdf,.jpg,.jpeg,.png',
  loading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    } else {
      onFileSelect(null);
    }
  };

  const handleClick = () => {
    if (!loading) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (loading) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <UploadContainer>
      <UploadArea
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        $hasError={!!error}
        $loading={loading}
        $disabled={loading}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={accept}
          className="hidden"
          required={required}
          disabled={loading}
        />
        <UploadContent>
          {loading ? (
            <>
              <LoadingSpinner />
              <UploadText>Uploading...</UploadText>
            </>
          ) : (
            <>
              <UploadIcon>📁</UploadIcon>
              <UploadText>Click to upload or drag and drop</UploadText>
              <UploadSubtext>
                {accept.split(',').join(', ')} files only (max 10MB)
              </UploadSubtext>
            </>
          )}
        </UploadContent>
      </UploadArea>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </UploadContainer>
  );
};

const UploadContainer = styled.div`
  width: 100%;
`;

const UploadArea = styled.div<{ $hasError: boolean; $loading: boolean; $disabled: boolean }>`
  width: 100%;
  padding: 1.5rem;
  border: 2px dashed ${props => {
    if (props.$loading) return 'rgba(255, 255, 255, 0.3)';
    if (props.$hasError) return '#ff6b6b';
    return 'rgba(255, 255, 255, 0.3)';
  }};
  border-radius: 8px;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  background: ${props => props.$loading ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.05)'};
  opacity: ${props => props.$disabled ? 0.6 : 1};

  &:hover {
    border-color: ${props => {
      if (props.$disabled) return 'rgba(255, 255, 255, 0.3)';
      if (props.$hasError) return '#ff5252';
      return '#4CAF50';
    }};
    background: ${props => props.$disabled ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)'};
  }
`;

const UploadContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const UploadIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

const UploadText = styled.p`
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  margin: 0;
  text-align: center;
`;

const UploadSubtext = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  margin: 0;
  text-align: center;
`;

const ErrorMessage = styled.p`
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 0.5rem;
  font-weight: 500;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`; 