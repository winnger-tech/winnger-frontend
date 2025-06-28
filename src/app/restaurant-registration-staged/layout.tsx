'use client';
import { DashboardProvider } from '@/context/DashboardContext';

export default function RestaurantStagedRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider userType="restaurant">
      {children}
    </DashboardProvider>
  );
} 