'use client';

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface StageInfo {
  title: string;
  description: string;
  fields: string[];
  completed: boolean;
  isCurrentStage: boolean;
}

interface StageCardProps {
  stageNumber: number;
  stageInfo: StageInfo;
  onClick: () => void;
  isCurrent: boolean;
  isCompleted: boolean;
}

export default function StageCard({ 
  stageNumber, 
  stageInfo, 
  onClick, 
  isCurrent, 
  isCompleted 
}: StageCardProps) {
  const getStageIcon = () => {
    if (isCompleted) return '✓';
    if (isCurrent) return '⚡';
    return stageNumber;
  };

  const getStageStatus = () => {
    if (isCompleted) return 'Completed';
    if (isCurrent) return 'In Progress';
    return 'Pending';
  };

  return (
    <Card
      as={motion.div}
      onClick={onClick}
      $isCompleted={isCompleted}
      $isCurrent={isCurrent}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <CardHeader>
        <StageIndicator $isCompleted={isCompleted} $isCurrent={isCurrent}>
          {getStageIcon()}
        </StageIndicator>
        <StageInfo>
          <StageTitle>{stageInfo.title}</StageTitle>
          <StageStatus $isCompleted={isCompleted} $isCurrent={isCurrent}>
            {getStageStatus()}
          </StageStatus>
        </StageInfo>
      </CardHeader>

      <StageDescription>{stageInfo.description}</StageDescription>

      <FieldsList>
        <FieldsTitle>Required Fields:</FieldsTitle>
        <Fields>
          {stageInfo.fields.slice(0, 3).map((field, index) => (
            <Field key={index}>{field}</Field>
          ))}
          {stageInfo.fields.length > 3 && (
            <Field>+{stageInfo.fields.length - 3} more</Field>
          )}
        </Fields>
      </FieldsList>

      <CardFooter>
        <ActionButton $isCompleted={isCompleted} $isCurrent={isCurrent}>
          {isCompleted ? 'Review' : isCurrent ? 'Continue' : 'Start'}
        </ActionButton>
      </CardFooter>
    </Card>
  );
}

// Styled Components
const Card = styled.div<{
  $isCompleted: boolean;
  $isCurrent: boolean;
}>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  ${props => {
    if (props.$isCompleted) {
      return `
        border-color: #4CAF50;
        box-shadow: 0 10px 30px rgba(76, 175, 80, 0.2);
      `;
    } else if (props.$isCurrent) {
      return `
        border-color: #ffc32b;
        box-shadow: 0 10px 30px rgba(255, 195, 43, 0.2);
      `;
    } else {
      return `
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      `;
    }
  }}

  &:hover {
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StageIndicator = styled.div<{
  $isCompleted: boolean;
  $isCurrent: boolean;
}>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  flex-shrink: 0;
  
  ${props => {
    if (props.$isCompleted) {
      return `
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: white;
      `;
    } else if (props.$isCurrent) {
      return `
        background: linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%);
        color: #403E2D;
      `;
    } else {
      return `
        background: linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%);
        color: #666;
      `;
    }
  }}
`;

const StageInfo = styled.div`
  flex: 1;
`;

const StageTitle = styled.h4`
  font-size: 1.3rem;
  font-weight: 600;
  color: #403E2D;
  margin: 0 0 0.25rem 0;
`;

const StageStatus = styled.span<{
  $isCompleted: boolean;
  $isCurrent: boolean;
}>`
  font-size: 0.9rem;
  font-weight: 500;
  
  ${props => {
    if (props.$isCompleted) {
      return `color: #4CAF50;`;
    } else if (props.$isCurrent) {
      return `color: #ffc32b;`;
    } else {
      return `color: #999;`;
    }
  }}
`;

const StageDescription = styled.p`
  font-size: 1rem;
  color: #666;
  line-height: 1.5;
  margin-bottom: 1.5rem;
`;

const FieldsList = styled.div`
  margin-bottom: 2rem;
`;

const FieldsTitle = styled.h5`
  font-size: 0.9rem;
  font-weight: 600;
  color: #403E2D;
  margin-bottom: 0.75rem;
`;

const Fields = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Field = styled.span`
  background: rgba(64, 62, 45, 0.1);
  color: #403E2D;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ActionButton = styled.button<{
  $isCompleted: boolean;
  $isCurrent: boolean;
}>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => {
    if (props.$isCompleted) {
      return `
        background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        color: white;
        
        &:hover {
          box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
        }
      `;
    } else if (props.$isCurrent) {
      return `
        background: linear-gradient(135deg, #ffc32b 0%, #f3b71e 100%);
        color: #403E2D;
        
        &:hover {
          box-shadow: 0 5px 15px rgba(255, 195, 43, 0.3);
        }
      `;
    } else {
      return `
        background: linear-gradient(135deg, #e0e0e0 0%, #d0d0d0 100%);
        color: #666;
        
        &:hover {
          background: linear-gradient(135deg, #d0d0d0 0%, #c0c0c0 100%);
        }
      `;
    }
  }}

  &:hover {
    transform: translateY(-2px);
  }
`;
