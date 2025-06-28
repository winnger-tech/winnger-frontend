'use client';
import { DashboardProvider } from '@/context/DashboardContext';

export default function StagedRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardProvider userType="driver">
      {children}
    </DashboardProvider>
  );
}
