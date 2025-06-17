import React, { useRef, useState } from 'react';
import styled from 'styled-components';

interface CameraUploadProps {
  label: string;
  onChange: (file: File) => void;
  error?: string;
  required?: boolean;
  isLiveOnly?: boolean;
}

export const CameraUpload: React.FC<CameraUploadProps> = ({
  label,
  onChange,
  error,
  required,
  isLiveOnly = false
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access camera. Please ensure camera permissions are granted.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to file
        canvas.toBlob((blob) => {
          if (blob) {
            // Create file with metadata indicating live capture
            const file = new File([blob], `live_capture_${Date.now()}.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            onChange(file);
            
            // Stop camera stream
            const stream = video.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            setShowCamera(false);
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isLiveOnly) {
        alert('Please use the camera to take a live photo.');
        e.target.value = '';
        return;
      }
      onChange(file);
    }
  };

  return (
    <Container>
      <Label>
        {label} {required && <Required>*</Required>}
      </Label>
      
      {showCamera ? (
        <CameraContainer>
          <Video ref={videoRef} autoPlay playsInline />
          <Canvas ref={canvasRef} style={{ display: 'none' }} />
          <CaptureButton onClick={capturePhoto}>
            Take Photo
          </CaptureButton>
        </CameraContainer>
      ) : (
        <ButtonContainer>
          <CameraButton onClick={startCamera}>
            Open Camera
          </CameraButton>
          {!isLiveOnly && (
            <FileInput
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              hasError={!!error}
            />
          )}
        </ButtonContainer>
      )}
      
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
};

const Container = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2d3748;
`;

const Required = styled.span`
  color: #e53e3e;
  margin-left: 0.25rem;
`;

const CameraContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
`;

const Video = styled.video`
  width: 100%;
  border-radius: 0.375rem;
`;

const Canvas = styled.canvas``;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const CameraButton = styled.button`
  background-color: #4299e1;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: #3182ce;
  }
`;

const CaptureButton = styled.button`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background-color: #e53e3e;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    background-color: #c53030;
  }
`;

const FileInput = styled.input<{ hasError: boolean }>`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid ${(props) => (props.hasError ? '#e53e3e' : '#e2e8f0')};
  border-radius: 0.375rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  }
`;

const ErrorText = styled.p`
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
`; 