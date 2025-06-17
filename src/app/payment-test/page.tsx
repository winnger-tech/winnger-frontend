'use client';

import PaymentTestComponent from '@/components/PaymentTestComponent';
import Navbar from '../component/Navbar';
import styled from 'styled-components';

export default function PaymentTestPage() {
  return (
    <>
      <Navbar />
      <PageContainer>
        <PaymentTestComponent />
      </PageContainer>
    </>
  );
}

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 120px 20px 40px;
  background-color: #403E2D;
`; 