"use client";

import React from 'react';
import Navbar from '../component/Navbar';

export default function TestDashboardPage() {
  return (
    <>
      <Navbar />
      <div style={{
        padding: '2rem',
        background: 'linear-gradient(135deg, #403E2D 0%, #2d2b1f 100%)',
        minHeight: '100vh',
        color: 'white',
        fontFamily: 'Space Grotesk, sans-serif'
      }}>
        <h1>Test Dashboard</h1>
        <p>This is a simple test to verify the dashboard route is working.</p>
        <div style={{ marginTop: '2rem' }}>
          <h2>Dashboard Features:</h2>
          <ul>
            <li>✅ Routing is working</li>
            <li>✅ Navbar is rendering</li>
            <li>✅ Styling is applied</li>
            <li>🔄 Testing DashboardContext next...</li>
          </ul>
        </div>
      </div>
    </>
  );
}
