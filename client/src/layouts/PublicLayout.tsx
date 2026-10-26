import React from 'react';
import { Outlet } from 'react-router-dom';
import { DemoBanner } from '../components/common/DemoBanner';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-hospital-slate selection:bg-hospital-teal selection:text-white">
      <DemoBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
