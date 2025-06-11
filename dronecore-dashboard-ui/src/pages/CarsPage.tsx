
import React from 'react';
import Sidebar from '../components/Sidebar';
import Cars from './Cars';

const CarsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex font-body">
      <Sidebar />
      <Cars />
    </div>
  );
};

export default CarsPage;
