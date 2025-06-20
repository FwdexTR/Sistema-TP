import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useClientHistory } from '../contexts/ClientHistoryContext';
import { Plus, Search, Phone, Mail, MapPin, Building, Edit, Trash2, History } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { getClients, createClient } from '../services/api';

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
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar clientes do backend
  useEffect(() => {
    setLoading(true);
    getClients()
      .then((data) => setClients(data))
      .catch(() => setError('Erro ao buscar clientes do servidor.'))
      .finally(() => setLoading(false));
  }, []);

  const handleAddClient = async () => {
    setLoading(true);
    setError(null);
    try {
      const newClient = await createClient({ ...formData });
      setClients((prev) => [...prev, newClient]);
      setIsAddModalOpen(false);
      setFormData({ name: '', company: '', email: '', phone: '', address: '' });
    } catch (err) {
      setError('Erro ao criar cliente.');
    } finally {
      setLoading(false);
    }
  };

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
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center text-sm text-gray-700"><Phone className="mr-1" size={14} />{client.phone}</span>
                      <span className="flex items-center text-sm text-gray-700"><Mail className="mr-1" size={14} />{client.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center text-sm text-gray-700"><MapPin className="mr-1" size={14} />{client.address}</span>
                  </td>
                  <td className="px-6 py-4 text-blue-600 font-bold">{client.totalMissions}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(client.status)}`}>{getStatusText(client.status)}</span>
                  </td>
                  <td className="px-6 py-4">{client.lastMission}</td>
                  {user?.role === 'admin' && (
                    <td className="px-6 py-4 flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openClientHistory(client.name)} title="Histórico">
                        <History size={18} />
                      </Button>
                      {/* <Button size="icon" variant="ghost" onClick={() => handleEditClient(client.id)} title="Editar">
                        <Edit size={18} />
                      </Button> */}
                      {/* <Button size="icon" variant="ghost" onClick={() => handleDeleteClient(client.id)} title="Excluir">
                        <Trash2 size={18} />
                      </Button> */}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-4">
            <Input
              placeholder="Nome"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              placeholder="Empresa"
              value={formData.company}
              onChange={e => setFormData({ ...formData, company: e.target.value })}
            />
            <Input
              placeholder="Email"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              placeholder="Telefone"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              placeholder="Endereço"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button onClick={handleAddClient} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Client History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Histórico de Missões</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedClient && (
              <ul className="list-disc pl-5">
                {getClientHistory(selectedClient).map((task, idx) => (
                  <li key={idx} className="mb-2">
                    <span className="font-semibold">{task.title}</span> - {task.status} - {task.dueDate}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
