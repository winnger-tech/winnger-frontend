"use client";

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppSelector } from '../../../../store/hooks';
import { DashboardProvider } from '../../../../context/DashboardContext';
import StageContainer from '../../../../components/stages/StageContainer';
import Navbar from '../../../component/Navbar';

export default function RestaurantStagePage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const stageId = params?.stage ? parseInt(params.stage as string) : 1;

  useEffect(() => {
    if (!isAuthenticated || !user || user.type !== 'restaurant') {
      router.push('/restaurantlogin');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || !params?.stage) {
    return null;
  }

  return (
    <>
      <Navbar />
      <DashboardProvider userType="restaurant">
        <StageContainer stageId={stageId} userType="restaurant" />
      </DashboardProvider>
    </>
  );
}
