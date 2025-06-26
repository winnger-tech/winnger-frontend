'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  color = '#ffc32b' 
}: LoadingSpinnerProps) {
  return (
    <SpinnerContainer>
      <Spinner $size={size} $color={color} />
    </SpinnerContainer>
  );
}

// Animations
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Styled Components
const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Spinner = styled.div<{
  $size: string;
  $color: string;
}>`
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid ${props => props.$color};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  
  ${props => {
    switch (props.$size) {
      case 'small':
        return `
          width: 20px;
          height: 20px;
          border-width: 2px;
        `;
      case 'large':
        return `
          width: 60px;
          height: 60px;
          border-width: 4px;
        `;
      default:
        return `
          width: 40px;
          height: 40px;
          border-width: 3px;
        `;
    }
  }}
`;
