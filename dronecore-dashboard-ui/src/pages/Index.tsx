
import React from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex font-body">
      <Sidebar />
      <Dashboard />
    </div>
  );
};

export default Index;
