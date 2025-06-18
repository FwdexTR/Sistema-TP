import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Camera, Plus, CheckCircle } from 'lucide-react';
import { Task } from './TaskModal';
import { useCars } from '../contexts/CarsContext';

interface ProgressiveTaskExecutionProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onProgressUpdate: (taskId: string, progressData: any) => void;
  onComplete: (taskId: string, completionData: any) => void;
}

const ProgressiveTaskExecution: React.FC<ProgressiveTaskExecutionProps> = ({
  isOpen,
  onClose,
  task,
  onProgressUpdate,
  onComplete
}) => {
  const { cars } = useCars();
  const [currentHectares, setCurrentHectares] = useState<number>(0);
  const [photos, setPhotos] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedDrone, setSelectedDrone] = useState('');
  const [selectedCar, setSelectedCar] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  // Get drones from localStorage
  const [drones, setDrones] = useState<string[]>([]);

  useEffect(() => {
    const savedDrones = localStorage.getItem('tpdrones_drones');
    if (savedDrones) {
      const droneList = JSON.parse(savedDrones);
      setDrones(droneList.map((drone: any) => drone.model || drone.name || drone));
    } else {
      // No drones available
      setDrones([]);
    }
  }, []);

  const availableCars = cars ? cars.filter(car => car.status === 'available') : [];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddProgress = () => {
    if (!task || currentHectares <= 0) return;

    const progressEntry = {
      date: new Date().toISOString(),
      hectares: currentHectares,
      photos,
      notes,
      assignee: task.assignee,
      drone: selectedDrone,
      car: selectedCar
    };

    const newCompletedHectares = (task.completedHectares || 0) + currentHectares;
    const newProgressEntries = [...(task.progressEntries || []), progressEntry];

    const progressData = {
      completedHectares: newCompletedHectares,
      progressEntries: newProgressEntries,
      status: newCompletedHectares >= task.hectares ? 'completed' : 'in-progress'
    };

    onProgressUpdate(task.id, progressData);

    // Reset form
    setCurrentHectares(0);
    setPhotos([]);
    setNotes('');
    setSelectedDrone('');
    setSelectedCar('');

    if (newCompletedHectares >= task.hectares) {
      onClose();
    }
  };

  const handleCompleteTask = () => {
    if (!task) return;
    
    setIsCompleting(true);
    
    const completionData = {
      status: 'completed',
      completedAt: new Date().toISOString()
    };

    onComplete(task.id, completionData);
    setIsCompleting(false);
    onClose();
  };

  const remainingHectares = task ? task.hectares - (task.completedHectares || 0) : 0;

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Executar Tarefa: {task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Informações da Tarefa</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-600">Cliente:</span> <span className="ml-2 font-medium">{task.client}</span></div>
              <div><span className="text-gray-600">Local:</span> <span className="ml-2 font-medium">{task.location}</span></div>
              <div><span className="text-gray-600">Total:</span> <span className="ml-2 font-medium">{task.hectares} ha</span></div>
              <div><span className="text-gray-600">Concluído:</span> <span className="ml-2 font-medium">{task.completedHectares || 0} ha</span></div>
              <div><span className="text-gray-600">Restante:</span> <span className="ml-2 font-medium text-blue-600">{remainingHectares} ha</span></div>
            </div>
            
            {/* Progress bar */}
            <div className="mt-3">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progresso</span>
                <span>{(((task.completedHectares || 0) / task.hectares) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((task.completedHectares || 0) / task.hectares) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Equipment Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="drone">Drone Utilizado</Label>
              <Select value={selectedDrone} onValueChange={setSelectedDrone}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um drone" />
                </SelectTrigger>
                <SelectContent>
                  {drones.map((drone) => (
                    <SelectItem key={drone} value={drone}>
                      {drone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="car">Carro Utilizado</Label>
              <Select value={selectedCar} onValueChange={setSelectedCar}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um carro" />
                </SelectTrigger>
                <SelectContent>
                  {availableCars.map((car) => (
                    <SelectItem key={car.id} value={`${car.model} - ${car.plate}`}>
                      {car.model} - {car.plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Progress Entry */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Adicionar Progresso</h4>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="hectares">Hectares Trabalhados Hoje</Label>
                <Input
                  id="hectares"
                  type="number"
                  value={currentHectares}
                  onChange={(e) => setCurrentHectares(Number(e.target.value))}
                  max={remainingHectares}
                  placeholder={`Máximo: ${remainingHectares} ha`}
                />
              </div>

              <div>
                <Label>Fotos do Trabalho</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center">
                    <Camera className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-600 text-sm">Clique para adicionar fotos</p>
                  </label>
                </div>
                
                {photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Descreva o trabalho realizado, condições, etc."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleAddProgress}
                disabled={currentHectares <= 0 || !selectedDrone}
                className="w-full flex items-center gap-2"
              >
                <Plus size={18} />
                Adicionar Progresso
              </Button>
            </div>
          </div>

          {/* Progress History */}
          {task.progressEntries && task.progressEntries.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Histórico de Progresso</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {task.progressEntries.map((entry, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{entry.hectares} ha - {entry.assignee}</span>
                      <span className="text-gray-500">
                        {new Date(entry.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    {entry.notes && <p className="text-gray-600 mt-1">{entry.notes}</p>}
                    <div className="flex gap-4 text-xs text-gray-500 mt-1">
                      {entry.drone && <span>Drone: {entry.drone}</span>}
                      {entry.car && <span>Carro: {entry.car}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fechar
            </Button>
            
            {remainingHectares <= 0 && (
              <Button
                onClick={handleCompleteTask}
                disabled={isCompleting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {isCompleting ? 'Concluindo...' : 'Marcar como Concluída'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProgressiveTaskExecution;
