
import React from 'react';
import Sidebar from '../components/Sidebar';
import Reports from './Reports';

const ReportsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex font-body">
      <Sidebar />
      <Reports />
    </div>
  );
};

export default ReportsPage;
