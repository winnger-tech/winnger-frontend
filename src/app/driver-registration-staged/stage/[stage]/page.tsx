"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '../../../../store/hooks';
import { DashboardProvider } from '../../../../context/DashboardContext';
import StageContainer from '../../../../components/stages/StageContainer';
import Navbar from '../../../component/Navbar';

export default function DriverRegistrationStagePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user || user.type !== 'driver') {
      router.push('/driverlogin');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <DashboardProvider userType="driver">
        <StageContainer userType="driver" />
      </DashboardProvider>
    </>
  );
}
