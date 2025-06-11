
import React, { useState } from 'react';
import { useCars } from '../contexts/CarsContext';
import { Plus, Edit, Trash2, Car, Calendar, Wrench } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface Car {
  id: string;
  model: string;
  plate: string;
  year: number;
  status: 'available' | 'in-use' | 'maintenance';
  createdAt: string;
}

const Cars: React.FC = () => {
  const { cars, addCar, updateCar, deleteCar, clearCars } = useCars();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState({
    model: '',
    plate: '',
    year: new Date().getFullYear(),
    status: 'available' as 'available' | 'in-use' | 'maintenance'
  });

  const handleSave = () => {
    if (selectedCar) {
      updateCar(selectedCar.id, formData);
    } else {
      addCar(formData);
    }
    setIsModalOpen(false);
    setSelectedCar(null);
    setFormData({
      model: '',
      plate: '',
      year: new Date().getFullYear(),
      status: 'available'
    });
  };

  const handleEdit = (car: Car) => {
    setSelectedCar(car);
    setFormData({
      model: car.model,
      plate: car.plate,
      year: car.year,
      status: car.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (carId: string) => {
    if (confirm('Tem certeza que deseja excluir este carro?')) {
      deleteCar(carId);
    }
  };

  const handleClearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados de carros?')) {
      clearCars();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-700';
      case 'in-use': return 'bg-blue-100 text-blue-700';
      case 'maintenance': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponível';
      case 'in-use': return 'Em Uso';
      case 'maintenance': return 'Manutenção';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return Car;
      case 'in-use': return Calendar;
      case 'maintenance': return Wrench;
      default: return Car;
    }
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 font-title">Carros</h2>
            <p className="text-gray-600">
              Gerencie a frota de veículos da empresa
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleClearData}
              className="text-red-600"
            >
              Limpar Dados
            </Button>
            <Button 
              onClick={() => {
                setSelectedCar(null);
                setFormData({
                  model: '',
                  plate: '',
                  year: new Date().getFullYear(),
                  status: 'available'
                });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus size={18} />
              Novo Carro
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total de Carros</h3>
          <p className="text-2xl font-bold text-gray-900">{cars.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Disponíveis</h3>
          <p className="text-2xl font-bold text-green-600">
            {cars.filter(c => c.status === 'available').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Em Uso</h3>
          <p className="text-2xl font-bold text-blue-600">
            {cars.filter(c => c.status === 'in-use').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Manutenção</h3>
          <p className="text-2xl font-bold text-red-600">
            {cars.filter(c => c.status === 'maintenance').length}
          </p>
        </div>
      </div>

      {/* Cars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => {
          const StatusIcon = getStatusIcon(car.status);
          return (
            <div key={car.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(car.status)}`}>
                    <StatusIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{car.model}</h3>
                    <p className="text-sm text-gray-600">{car.plate}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(car.status)}`}>
                  {getStatusText(car.status)}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ano:</span>
                  <span className="font-medium">{car.year}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cadastrado em:</span>
                  <span className="font-medium">
                    {new Date(car.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(car)}
                  className="flex-1"
                >
                  <Edit size={14} className="mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(car.id)}
                  className="text-red-600"
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {cars.length === 0 && (
        <div className="text-center py-12">
          <Car size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum carro cadastrado</h3>
          <p className="text-gray-500">Adicione o primeiro carro da frota</p>
        </div>
      )}

      {/* Car Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedCar ? 'Editar Carro' : 'Novo Carro'}
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
                placeholder="Ex: Toyota Hilux"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Placa
              </label>
              <Input
                value={formData.plate}
                onChange={(e) => setFormData(prev => ({ ...prev, plate: e.target.value }))}
                placeholder="Ex: ABC-1234"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Ano
              </label>
              <Input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                min="1990"
                max={new Date().getFullYear() + 1}
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
              <Button onClick={handleSave} className="flex-1">
                {selectedCar ? 'Atualizar' : 'Adicionar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cars;
