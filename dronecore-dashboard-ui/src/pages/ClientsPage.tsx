import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Clients from './Clients';
import { getClients, createClient } from '../services/api';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getClients()
      .then((data) => setClients(data))
      .catch(() => setError('Erro ao buscar clientes do servidor.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex font-body">
      <Sidebar />
      <Clients />
    </div>
  );
};

export default ClientsPage;
