
import React from 'react';
import Sidebar from '../components/Sidebar';
import Clients from './Clients';

const ClientsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex font-body">
      <Sidebar />
      <Clients />
    </div>
  );
};

export default ClientsPage;
