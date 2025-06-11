import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useClientHistory } from '../contexts/ClientHistoryContext';
import { Plus, Search, Phone, Mail, MapPin, Building, Edit, Trash2, History } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  totalMissions: number;
  lastMission: string;
  createdAt: string;
}

const Clients: React.FC = () => {
  const { user } = useAuth();
  const { getClientHistory } = useClientHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    address: ''
  });

  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'Roberto Silva',
      company: 'Agro Tech Ltd',
      email: 'roberto@agrotech.com',
      phone: '+55 11 99999-1234',
      address: 'São Paulo, SP',
      status: 'active',
      totalMissions: 15,
      lastMission: '2024-01-10',
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Ana Costa',
      company: 'Urban Survey',
      email: 'ana@urbansurvey.com',
      phone: '+55 11 88888-5678',
      address: 'Rio de Janeiro, RJ',
      status: 'active',
      totalMissions: 8,
      lastMission: '2024-01-12',
      createdAt: '2024-01-02'
    },
    {
      id: '3',
      name: 'Carlos Mendes',
      company: 'Mining Corp',
      email: 'carlos@mining.com',
      phone: '+55 11 77777-9012',
      address: 'Belo Horizonte, MG',
      status: 'inactive',
      totalMissions: 23,
      lastMission: '2023-12-15',
      createdAt: '2023-12-01'
    },
    {
      id: '4',
      name: 'Mariana Santos',
      company: 'EcoMonitor',
      email: 'mariana@ecomonitor.com',
      phone: '+55 11 66666-3456',
      address: 'Curitiba, PR',
      status: 'active',
      totalMissions: 12,
      lastMission: '2024-01-08',
      createdAt: '2024-01-03'
    }
  ]);

  // Load and save clients to localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem('tpdrones_clients');
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    }
  }, []);

  const saveClients = (clientList: Client[]) => {
    setClients(clientList);
    localStorage.setItem('tpdrones_clients', JSON.stringify(clientList));
  };

  // Check for inactive clients (1 year without service)
  useEffect(() => {
    const checkInactiveClients = () => {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      
      const updatedClients = clients.map(client => {
        const lastMissionDate = new Date(client.lastMission);
        if (lastMissionDate < oneYearAgo && client.status === 'active') {
          return { ...client, status: 'inactive' as const };
        }
        return client;
      });
      
      if (JSON.stringify(updatedClients) !== JSON.stringify(clients)) {
        saveClients(updatedClients);
      }
    };

    checkInactiveClients();
  }, [clients]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-700' 
      : 'bg-red-100 text-red-700';
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Ativo' : 'Inativo';
  };

  const handleAddClient = () => {
    const newClient: Client = {
      id: `client_${Date.now()}`,
      ...formData,
      status: 'active',
      totalMissions: 0,
      lastMission: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    const updatedClients = [...clients, newClient];
    saveClients(updatedClients);
    
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      company: '',
      email: '',
      phone: '',
      address: ''
    });
  };

  const handleDeleteClient = (clientId: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      const updatedClients = clients.filter(client => client.id !== clientId);
      saveClients(updatedClients);
    }
  };

  const openClientHistory = (clientName: string) => {
    setSelectedClient(clientName);
    setIsHistoryModalOpen(true);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 font-title">Clientes</h2>
        <p className="text-gray-600">Gerencie informações dos clientes e histórico de serviços</p>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar clientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-80"
          />
        </div>

        {user?.role === 'admin' && (
          <Button 
            className="flex items-center gap-2"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={18} />
            Novo Cliente
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total de Clientes</h3>
          <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Clientes Ativos</h3>
          <p className="text-2xl font-bold text-green-600">
            {clients.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total de Missões</h3>
          <p className="text-2xl font-bold text-blue-600">
            {clients.reduce((sum, client) => sum + client.totalMissions, 0)}
          </p>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Cliente</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Contato</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Localização</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Missões</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Status</th>
                <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Última Missão</th>
                {user?.role === 'admin' && (
                  <th className="text-left text-sm font-medium text-gray-600 px-6 py-4">Ações</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Building className="mr-1" size={14} />
                        {client.company}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="mr-2" size={14} />
                        {client.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="mr-2" size={14} />
                        {client.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="mr-2" size={14} />
                      {client.address}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{client.totalMissions}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                      {getStatusText(client.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {new Date(client.lastMission).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  {user?.role === 'admin' && (
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openClientHistory(client.name)}
                          className="flex items-center gap-1"
                        >
                          <History size={14} />
                          Histórico
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteClient(client.id)}
                          className="text-red-600 flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Excluir
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Nenhum cliente encontrado</p>
        </div>
      )}

      {/* Add Client Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Nome
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Empresa
              </label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Telefone
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Endereço
              </label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleAddClient} className="flex-1">
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Client History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Serviços: {selectedClient}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {getClientHistory(selectedClient).length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum histórico encontrado para este cliente</p>
            ) : (
              getClientHistory(selectedClient).map((historyTask) => (
                <div key={historyTask.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{historyTask.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      historyTask.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      historyTask.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {historyTask.status === 'completed' ? 'Concluída' : 
                       historyTask.status === 'in-progress' ? 'Em Progresso' : 'Pendente'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{historyTask.description}</p>
                  <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
                    <div>Local: {historyTask.location}</div>
                    <div>Hectares: {historyTask.hectares}</div>
                    <div>Data: {new Date(historyTask.dueDate).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
