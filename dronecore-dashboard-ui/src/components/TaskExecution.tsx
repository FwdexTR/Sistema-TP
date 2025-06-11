
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Camera, Upload, FileText } from 'lucide-react';
import { generateServiceReport } from '../utils/professionalReportGenerator';
import { useClientHistory } from '../contexts/ClientHistoryContext';

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  location: string;
  drone: string;
  hectares: number;
  client: string;
}

interface TaskExecutionProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onComplete: (taskId: string, completionData: any) => void;
}

const TaskExecution: React.FC<TaskExecutionProps> = ({ isOpen, onClose, task, onComplete }) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [notes, setNotes] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const { getClientHistory, updateTaskInHistory } = useClientHistory();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPhotos(prev => [...prev, ...files]);
  };

  const handleComplete = async () => {
    if (!task) return;
    
    setIsCompleting(true);
    
    const completionData = {
      photos,
      notes,
      completedAt: new Date().toISOString(),
      completedBy: task.assignee
    };

    // Get client history for the report
    const clientHistory = getClientHistory(task.client);

    // Generate professional PDF report
    await generateServiceReport(task, completionData, clientHistory);
    
    // Update task in client history
    const completedTask = { ...task, status: 'completed' as const, completedAt: completionData.completedAt };
    updateTaskInHistory(completedTask);
    
    onComplete(task.id, completionData);
    setIsCompleting(false);
    setPhotos([]);
    setNotes('');
    onClose();
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Executar Tarefa: {task.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Detalhes da Tarefa</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Cliente:</span>
                <span className="ml-2 font-medium">{task.client}</span>
              </div>
              <div>
                <span className="text-gray-600">Local:</span>
                <span className="ml-2 font-medium">{task.location}</span>
              </div>
              <div>
                <span className="text-gray-600">Drone:</span>
                <span className="ml-2 font-medium">{task.drone}</span>
              </div>
              <div>
                <span className="text-gray-600">Hectares:</span>
                <span className="ml-2 font-medium">{task.hectares}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Descrição:</span>
                <p className="mt-1 text-gray-900">{task.description}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Fotos da Execução *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Camera className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-600">Clique para adicionar fotos</p>
                <p className="text-sm text-gray-500">ou arraste e solte aqui</p>
              </label>
            </div>
            
            {photos.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  {photos.length} foto(s) selecionada(s):
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-20 object-cover rounded"
                      />
                      <button
                        onClick={() => setPhotos(prev => prev.filter((_, i) => i !== index))}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Observações da Execução
            </label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md text-sm"
              rows={4}
              placeholder="Adicione observações sobre a execução da tarefa..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleComplete}
              disabled={photos.length === 0 || isCompleting}
              className="flex-1"
            >
              <FileText className="mr-2 h-4 w-4" />
              {isCompleting ? 'Gerando Relatório...' : 'Concluir e Gerar Relatório'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskExecution;
