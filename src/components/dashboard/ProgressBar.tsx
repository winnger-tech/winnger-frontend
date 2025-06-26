'use client';

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface ProgressInfo {
  totalStages: number;
  completedStages: number;
  currentStage: number;
  percentage: number;
}

interface ProgressBarProps {
  progress: ProgressInfo;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <Container>
      <ProgressHeader>
        <ProgressTitle>Registration Progress</ProgressTitle>
        <ProgressStats>
          {progress.completedStages} of {progress.totalStages} steps completed
        </ProgressStats>
      </ProgressHeader>
      
      <ProgressBarContainer>
        <ProgressBarBackground>
          <ProgressBarFill
            as={motion.div}
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </ProgressBarBackground>
        <ProgressPercentage>{Math.round(progress.percentage)}%</ProgressPercentage>
      </ProgressBarContainer>

      <StageIndicators>
        {Array.from({ length: progress.totalStages }, (_, index) => {
          const stageNumber = index + 1;
          const isCompleted = stageNumber <= progress.completedStages;
          const isCurrent = stageNumber === progress.currentStage;
          
          return (
            <StageIndicator
              key={stageNumber}
              $isCompleted={isCompleted}
              $isCurrent={isCurrent}
              as={motion.div}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              {isCompleted ? '✓' : stageNumber}
            </StageIndicator>
          );
        })}
      </StageIndicators>
    </Container>
  );
}

// Styled Components
const Container = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
`;

const ProgressTitle = styled.h3`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const ProgressStats = styled.span`
  color: #ffc32b;
  font-size: 1rem;
  font-weight: 500;
`;

const ProgressBarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ProgressBarBackground = styled.div`
  flex: 1;
  height: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressBarFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #ffc32b 0%, #4CAF50 100%);
  border-radius: 6px;
  transition: width 0.3s ease;
`;

const ProgressPercentage = styled.span`
  color: white;
  font-size: 1rem;
  font-weight: 600;
  min-width: 45px;
  text-align: right;
`;

const StageIndicators = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 768px) {
    gap: 0.5rem;
  }
`;

const StageIndicator = styled.div<{
  $isCompleted: boolean;
  $isCurrent: boolean;
}>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  
  ${props => {
    if (props.$isCompleted) {
      return `
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: white;
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
      `;
    } else if (props.$isCurrent) {
      return `
        background: linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%);
        color: #403E2D;
        box-shadow: 0 4px 15px rgba(255, 195, 43, 0.3);
      `;
    } else {
      return `
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.3);
      `;
    }
  }}

  @media (max-width: 768px) {
    width: 35px;
    height: 35px;
    font-size: 0.8rem;
  }
`;
