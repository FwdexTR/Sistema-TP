import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { Plus, Edit, Trash2, Battery, Wifi, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface Drone {
  id: string;
  model: string;
  serialNumber: string;
  status: 'available' | 'in-use' | 'maintenance' | 'inactive';
  batteryLevel: number;
  flightHours: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

const DronesPage: React.FC = () => {
  const [drones, setDrones] = useState<Drone[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDrone, setSelectedDrone] = useState<Drone | null>(null);
  const [formData, setFormData] = useState({
    model: '',
    serialNumber: '',
    status: 'available' as Drone['status']
  });

  const handleSaveDrone = () => {
    if (selectedDrone) {
      // Update existing drone
      setDrones(prev => prev.map(drone => 
        drone.id === selectedDrone.id 
          ? { ...drone, ...formData }
          : drone
      ));
    } else {
      // Create new drone
      const newDrone: Drone = {
        id: `DRN-${String(drones.length + 1).padStart(3, '0')}`,
        model: formData.model,
        serialNumber: formData.serialNumber,
        status: formData.status,
        batteryLevel: 100,
        flightHours: 0,
        lastMaintenance: new Date().toISOString().split('T')[0],
        nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      setDrones(prev => [...prev, newDrone]);
    }
    
    setIsModalOpen(false);
    setSelectedDrone(null);
    setFormData({ model: '', serialNumber: '', status: 'available' });
  };

  const handleEditDrone = (drone: Drone) => {
    setSelectedDrone(drone);
    setFormData({
      model: drone.model,
      serialNumber: drone.serialNumber,
      status: drone.status
    });
    setIsModalOpen(true);
  };

  const handleDeleteDrone = (droneId: string) => {
    if (confirm('Tem certeza que deseja excluir este drone?')) {
      setDrones(prev => prev.filter(drone => drone.id !== droneId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'in-use': return 'bg-blue-100 text-blue-700';
      case 'maintenance': return 'bg-orange-100 text-orange-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'in-use': return 'Em Uso';
      case 'maintenance': return 'Manutenção';
      case 'inactive': return 'Inativo';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-body">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 font-title">Drones</h2>
              <p className="text-gray-600">
                Gerencie a frota de drones e acompanhe o status de cada equipamento
              </p>
            </div>
            <Button 
              onClick={() => {
                setSelectedDrone(null);
                setFormData({ model: '', serialNumber: '', status: 'available' });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus size={18} />
              Novo Drone
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Drones</p>
                <p className="text-2xl font-bold text-gray-900">{drones.length}</p>
              </div>
              <Wifi className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                <p className="text-2xl font-bold text-green-600">
                  {drones.filter(d => d.status === 'available').length}
                </p>
              </div>
              <Battery className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Uso</p>
                <p className="text-2xl font-bold text-blue-600">
                  {drones.filter(d => d.status === 'in-use').length}
                </p>
              </div>
              <Wifi className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Manutenção</p>
                <p className="text-2xl font-bold text-orange-600">
                  {drones.filter(d => d.status === 'maintenance').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Drones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drones.map((drone) => (
            <div key={drone.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{drone.id}</h3>
                  <p className="text-sm text-gray-600">{drone.model}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(drone.status)}`}>
                  {getStatusText(drone.status)}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Série:</span>
                  <span className="text-sm font-medium text-gray-900">{drone.serialNumber}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Bateria:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          drone.batteryLevel > 60 ? 'bg-green-500' :
                          drone.batteryLevel > 30 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${drone.batteryLevel}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{drone.batteryLevel}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Horas de voo:</span>
                  <span className="text-sm font-medium text-gray-900">{drone.flightHours}h</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Próxima manutenção:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(drone.nextMaintenance).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditDrone(drone)}
                  className="flex-1"
                >
                  <Edit size={14} className="mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteDrone(drone.id)}
                  className="text-red-600"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Drone Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedDrone ? 'Editar Drone' : 'Novo Drone'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Modelo
                </label>
                <Input
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="Ex: DJI Mavic 3"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Número de Série
                </label>
                <Input
                  value={formData.serialNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                  placeholder="Ex: DJI001234"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Status
                </label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="in-use">Em Uso</SelectItem>
                    <SelectItem value="maintenance">Manutenção</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveDrone} className="flex-1">
                  {selectedDrone ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DronesPage;
