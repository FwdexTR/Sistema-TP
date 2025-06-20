import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { getDrones, getCars } from '../services/api';

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  location: string;
  hectares: number;
  client: string;
  createdAt: string;
  completedAt?: string;
  completedHectares?: number;
  googleMapsLink?: string;
  kmlFile?: string;
  drone?: string;
  car?: string;
  serviceValue?: number;
  progressEntries?: Array<{
    date: string;
    hectares: number;
    photos: File[];
    notes: string;
    assignee: string;
    drone?: string;
    car?: string;
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  task?: Task | null;
  users: User[];
  clients: Client[];
}

const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  task,
  users,
  clients,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
    location: '',
    hectares: 0,
    client: '',
    googleMapsLink: '',
    kmlFile: '',
    drone: '',
    car: '',
    serviceValue: 0
  });

  const [drones, setDrones] = useState([]);
  const [cars, setCars] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load drones from API
        const dronesData = await getDrones();
        setDrones(dronesData);

        // Load cars from API
        const carsData = await getCars();
        setCars(carsData);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description,
        assignee: task.assignee,
        priority: task.priority,
        dueDate: task.dueDate,
        location: task.location,
        hectares: task.hectares,
        client: task.client,
        googleMapsLink: task.googleMapsLink || '',
        kmlFile: task.kmlFile || '',
        drone: task.drone || '',
        car: task.car || '',
        serviceValue: task.serviceValue || 0
      });
    } else {
      setFormData({
        title: '',
        description: '',
        assignee: '',
        priority: 'medium',
        dueDate: '',
        location: '',
        hectares: 0,
        client: '',
        googleMapsLink: '',
        kmlFile: '',
        drone: '',
        car: '',
        serviceValue: 0
      });
    }
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      status: task?.status || 'pending',
      completedHectares: task?.completedHectares || 0,
      progressEntries: task?.progressEntries || []
    });
    onClose();
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                placeholder="Título da tarefa"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descrição detalhada da tarefa"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="client">Cliente</Label>
              <select
                id="client"
                value={formData.client}
                onChange={(e) => handleInputChange('client', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Selecione um cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.name}>{client.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="assignee">Responsável</Label>
              <select
                id="assignee"
                value={formData.assignee}
                onChange={(e) => handleInputChange('assignee', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Selecione um responsável</option>
                {users.map(user => (
                  <option key={user.id} value={user.name}>{user.name}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                required
                placeholder="Local da operação"
              />
            </div>

            <div>
              <Label htmlFor="hectares">Hectares</Label>
              <Input
                id="hectares"
                type="number"
                value={formData.hectares}
                onChange={(e) => handleInputChange('hectares', Number(e.target.value))}
                required
                min="0"
                step="0.1"
                placeholder="Área em hectares"
              />
            </div>

            <div>
              <Label htmlFor="serviceValue">Valor do Serviço (R$)</Label>
              <Input
                id="serviceValue"
                type="number"
                value={formData.serviceValue}
                onChange={(e) => handleInputChange('serviceValue', Number(e.target.value))}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="priority">Prioridade</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>

            <div>
              <Label htmlFor="dueDate">Data de Vencimento</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="drone">Drone</Label>
              <select
                id="drone"
                value={formData.drone}
                onChange={(e) => handleInputChange('drone', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Selecione um drone</option>
                {drones.map((drone: any) => (
                  <option key={drone.id} value={drone.model}>{drone.model}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="car">Carro</Label>
              <select
                id="car"
                value={formData.car}
                onChange={(e) => handleInputChange('car', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Selecione um carro</option>
                {cars.map((car: any) => (
                  <option key={car.id} value={car.model}>{car.model}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="googleMapsLink">Link do Google Maps</Label>
              <Input
                id="googleMapsLink"
                value={formData.googleMapsLink}
                onChange={(e) => handleInputChange('googleMapsLink', e.target.value)}
                placeholder="https://maps.google.com/..."
                type="url"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="kmlFile">Arquivo KML</Label>
              <Input
                id="kmlFile"
                value={formData.kmlFile}
                onChange={(e) => handleInputChange('kmlFile', e.target.value)}
                placeholder="Nome do arquivo KML"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {task ? 'Atualizar' : 'Criar'} Tarefa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
