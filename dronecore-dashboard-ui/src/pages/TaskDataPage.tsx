import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { Eye, Edit, Save, X, Calendar, User, MapPin, Camera, FileText, Trash2, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { getTasks, updateTask } from '../services/api';

interface Task {
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
  completedAt?: string;
  createdAt: string;
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

const TaskDataPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<number | null>(null);
  const [editedEntry, setEditedEntry] = useState<any>({});

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const tasksData = await getTasks();
      // Filter tasks that have progress entries
      const tasksWithProgress = tasksData.filter((task: Task) => 
        task.progressEntries && task.progressEntries.length > 0
      );
      setTasks(tasksWithProgress);
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
    }
  };

  const handleEditEntry = (taskId: string, entryIndex: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.progressEntries) {
      setEditingEntry(entryIndex);
      setEditedEntry({ ...task.progressEntries[entryIndex] });
    }
  };

  const handleSaveEntry = async (taskId: string, entryIndex: number) => {
    try {
      const updatedTasks = tasks.map(task => {
        if (task.id === taskId && task.progressEntries) {
          const updatedEntries = [...task.progressEntries];
          updatedEntries[entryIndex] = editedEntry;
          return { ...task, progressEntries: updatedEntries };
        }
        return task;
      });

      setTasks(updatedTasks);
      
      // Update task in database
      const taskToUpdate = updatedTasks.find(t => t.id === taskId);
      if (taskToUpdate) {
        await updateTask(taskId, taskToUpdate);
      }
      
      setEditingEntry(null);
      setEditedEntry({});
    } catch (err) {
      console.error('Erro ao salvar entrada:', err);
    }
  };

  const handleDeleteEntry = async (taskId: string, entryIndex: number) => {
    if (confirm('Tem certeza que deseja excluir esta entrada? Esta ação não pode ser desfeita.')) {
      try {
        const updatedTasks = tasks.map(task => {
          if (task.id === taskId && task.progressEntries) {
            const updatedEntries = task.progressEntries.filter((_, index) => index !== entryIndex);
            return { ...task, progressEntries: updatedEntries };
          }
          return task;
        }).filter(task => task.progressEntries && task.progressEntries.length > 0);

        setTasks(updatedTasks);
        
        // Update task in database
        const taskToUpdate = updatedTasks.find(t => t.id === taskId);
        if (taskToUpdate) {
          await updateTask(taskId, taskToUpdate);
        }
      } catch (err) {
        console.error('Erro ao deletar entrada:', err);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditedEntry({});
  };

  const getTotalHectaresByEmployee = () => {
    const employeeStats: { [key: string]: number } = {};
    
    tasks.forEach(task => {
      if (task.progressEntries) {
        task.progressEntries.forEach(entry => {
          if (!employeeStats[entry.assignee]) {
            employeeStats[entry.assignee] = 0;
          }
          employeeStats[entry.assignee] += entry.hectares;
        });
      }
    });
    
    return employeeStats;
  };

  const getTasksCount = () => {
    return {
      total: tasks.length,
      completed: tasks.filter(task => task.status === 'completed').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length
    };
  };

  const isValidFile = (photo: any): photo is File => {
    return photo instanceof File;
  };

  const employeeStats = getTotalHectaresByEmployee();
  const taskStats = getTasksCount();

  return (
    <div className="min-h-screen bg-gray-50 flex font-body">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 font-title">Dados das Tarefas</h2>
          <p className="text-gray-600">
            Visualize e edite todas as informações inseridas pelos funcionários
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total de Tarefas</p>
                <p className="text-2xl font-bold">{taskStats.total}</p>
              </div>
              <FileText className="h-12 w-12 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Concluídas</p>
                <p className="text-2xl font-bold">{taskStats.completed}</p>
              </div>
              <Calendar className="h-12 w-12 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Em Progresso</p>
                <p className="text-2xl font-bold">{taskStats.inProgress}</p>
              </div>
              <User className="h-12 w-12 text-orange-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Funcionários Ativos</p>
                <p className="text-2xl font-bold">{Object.keys(employeeStats).length}</p>
              </div>
              <MapPin className="h-12 w-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Employee Statistics */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas por Funcionário</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(employeeStats).map(([employee, hectares]) => (
              <div key={employee} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{employee}</p>
                    <p className="text-sm text-gray-600">{hectares.toFixed(1)} hectares</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Tarefas com Dados Registrados</h3>
          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="border border-gray-100 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{task.title}</h4>
                    <p className="text-sm text-gray-600">{task.client} - {task.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {task.status === 'completed' ? 'Concluída' : 'Em Progresso'}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedTask(task);
                        setIsDetailModalOpen(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Eye size={14} />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>

                {/* Progress Summary */}
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                  <div>Total: {task.hectares} ha</div>
                  <div>Concluído: {task.progressEntries?.reduce((sum, entry) => sum + entry.hectares, 0) || 0} ha</div>
                  <div>Entradas: {task.progressEntries?.length || 0}</div>
                </div>

                {/* Recent entries preview */}
                {task.progressEntries && task.progressEntries.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 mb-2">Últimas atividades:</p>
                    {task.progressEntries.slice(-2).map((entry, index) => (
                      <div key={index} className="text-xs text-gray-700 mb-1">
                        <span className="font-medium">{entry.assignee}</span> - {entry.hectares} ha 
                        ({new Date(entry.date).toLocaleDateString('pt-BR')})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Task Details Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalhes da Tarefa: {selectedTask?.title}</DialogTitle>
            </DialogHeader>
            
            {selectedTask && (
              <div className="space-y-6">
                {/* Task Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Informações da Tarefa</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-600">Cliente:</span> {selectedTask.client}</div>
                    <div><span className="text-gray-600">Local:</span> {selectedTask.location}</div>
                    <div><span className="text-gray-600">Total:</span> {selectedTask.hectares} ha</div>
                    <div><span className="text-gray-600">Concluído:</span> {selectedTask.progressEntries?.reduce((sum, entry) => sum + entry.hectares, 0) || 0} ha</div>
                  </div>
                </div>

                {/* Progress Entries */}
                {selectedTask.progressEntries && selectedTask.progressEntries.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Entradas de Progresso</h4>
                    <div className="space-y-4">
                      {selectedTask.progressEntries.map((entry, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          {editingEntry === index ? (
                            // Edit mode
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Funcionário</label>
                                  <Input
                                    value={editedEntry.assignee || ''}
                                    onChange={(e) => setEditedEntry(prev => ({ ...prev, assignee: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Hectares</label>
                                  <Input
                                    type="number"
                                    value={editedEntry.hectares || 0}
                                    onChange={(e) => setEditedEntry(prev => ({ ...prev, hectares: Number(e.target.value) }))}
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Drone</label>
                                  <Input
                                    value={editedEntry.drone || ''}
                                    onChange={(e) => setEditedEntry(prev => ({ ...prev, drone: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-gray-700">Carro</label>
                                  <Input
                                    value={editedEntry.car || ''}
                                    onChange={(e) => setEditedEntry(prev => ({ ...prev, car: e.target.value }))}
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium text-gray-700">Observações</label>
                                <Textarea
                                  value={editedEntry.notes || ''}
                                  onChange={(e) => setEditedEntry(prev => ({ ...prev, notes: e.target.value }))}
                                  rows={3}
                                />
                              </div>
                              
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveEntry(selectedTask.id, index)}
                                  className="flex items-center gap-1"
                                >
                                  <Save size={14} />
                                  Salvar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancelEdit}
                                  className="flex items-center gap-1"
                                >
                                  <X size={14} />
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // View mode
                            <div>
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h5 className="font-medium text-gray-900">{entry.assignee}</h5>
                                  <p className="text-sm text-gray-600">
                                    {new Date(entry.date).toLocaleDateString('pt-BR')} às {new Date(entry.date).toLocaleTimeString('pt-BR')}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditEntry(selectedTask.id, index)}
                                    className="flex items-center gap-1"
                                  >
                                    <Edit size={14} />
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDeleteEntry(selectedTask.id, index)}
                                    className="flex items-center gap-1 text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 size={14} />
                                    Excluir
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                <div><span className="text-gray-600">Hectares:</span> {entry.hectares}</div>
                                <div><span className="text-gray-600">Drone:</span> {entry.drone || 'N/A'}</div>
                                <div><span className="text-gray-600">Carro:</span> {entry.car || 'N/A'}</div>
                                <div><span className="text-gray-600">Fotos:</span> {entry.photos?.length || 0}</div>
                              </div>
                              
                              {entry.notes && (
                                <div className="bg-gray-50 p-2 rounded text-sm">
                                  <span className="text-gray-600">Observações:</span> {entry.notes}
                                </div>
                              )}
                              
                              {entry.photos && entry.photos.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm text-gray-600 mb-2">Fotos anexadas:</p>
                                  <div className="grid grid-cols-4 gap-2">
                                    {entry.photos.map((photo, photoIndex) => {
                                      if (isValidFile(photo)) {
                                        return (
                                          <div key={photoIndex} className="relative">
                                            <img
                                              src={URL.createObjectURL(photo)}
                                              alt={`Foto ${photoIndex + 1}`}
                                              className="w-full h-20 object-cover rounded"
                                            />
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div key={photoIndex} className="relative bg-gray-200 w-full h-20 rounded flex items-center justify-center">
                                            <Camera size={16} className="text-gray-400" />
                                            <span className="text-xs text-gray-500 ml-1">Foto {photoIndex + 1}</span>
                                          </div>
                                        );
                                      }
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default TaskDataPage;
