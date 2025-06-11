import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useClientHistory } from '../contexts/ClientHistoryContext';
import { Plus, Search, Filter, Calendar, User, MapPin, Play, CheckCircle, History, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import TaskCalendar from '../components/TaskCalendar';
import TaskModal, { Task as TaskModalTask } from '../components/TaskModal';
import ProgressiveTaskExecution from '../components/ProgressiveTaskExecution';
import { generateServiceReport } from '../utils/professionalReportGenerator';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
}

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

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const { addTaskToHistory, updateTaskInHistory, getClientHistory } = useClientHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isExecutionModalOpen, setIsExecutionModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Inspeção de Torres de Transmissão',
      description: 'Inspeção visual das torres de transmissão na região norte',
      assignee: 'João Silva',
      status: 'in-progress',
      priority: 'high',
      dueDate: '2024-01-15',
      location: 'Setor Norte',
      hectares: 100,
      client: 'Empresa A',
      createdAt: '2024-01-10',
      completedHectares: 50,
      googleMapsLink: '',
      kmlFile: '',
      drone: '',
      car: '',
      serviceValue: 25000,
      progressEntries: [{
        date: '2024-01-14T10:00:00Z',
        hectares: 50,
        photos: [],
        notes: 'Primeira fase concluída',
        assignee: 'João Silva'
      }]
    },
    {
      id: '2',
      title: 'Mapeamento Agrícola',
      description: 'Mapeamento de área cultivada para análise de produtividade',
      assignee: 'Maria Santos',
      status: 'pending',
      priority: 'medium',
      dueDate: '2024-01-18',
      location: 'Fazenda São João',
      hectares: 25.0,
      client: 'Fazenda São João',
      createdAt: '2024-01-10',
      completedHectares: 0,
      googleMapsLink: '',
      kmlFile: '',
      drone: '',
      car: '',
      serviceValue: 6250
    }
  ]);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tpdrones_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tpdrones_tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Get users from localStorage to include newly created users
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([
    { id: '1', name: 'João Silva', email: 'joao@tpdrones.com', role: 'employee' },
    { id: '2', name: 'Maria Santos', email: 'maria@tpdrones.com', role: 'employee' },
    { id: '3', name: 'Carlos Oliveira', email: 'carlos@tpdrones.com', role: 'employee' },
    { id: '4', name: 'Ana Costa', email: 'ana@tpdrones.com', role: 'employee' }
  ]);

  // Load users from localStorage on component mount
  useEffect(() => {
    const savedUsers = localStorage.getItem('tpdrones_users');
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      const employeeUsers = users.filter((u: User) => u.role === 'employee');
      setRegisteredUsers(prev => {
        // Merge with existing users, avoiding duplicates
        const existingEmails = prev.map(u => u.email);
        const newUsers = employeeUsers.filter((u: User) => !existingEmails.includes(u.email));
        return [...prev, ...newUsers];
      });
    }
  }, []);

  // Get clients from localStorage to include newly created clients
  const [clients, setClients] = useState([
    { id: '1', name: 'Empresa A', email: 'contato@empresaa.com' },
    { id: '2', name: 'Fazenda São João', email: 'contato@fazenda.com' },
    { id: '3', name: 'Distrito Industrial', email: 'contato@distrito.com' },
    { id: '4', name: 'Cooperativa ABC', email: 'contato@coop.com' },
    { id: '5', name: 'Indústria XYZ', email: 'contato@industria.com' }
  ]);

  useEffect(() => {
    const savedClients = localStorage.getItem('tpdrones_clients');
    if (savedClients) {
      const clientList = JSON.parse(savedClients);
      const clientOptions = clientList.map((client: any) => ({
        id: client.id,
        name: client.name,
        email: client.email || ''
      }));
      setClients(prev => {
        // Merge with existing clients, avoiding duplicates
        const existingNames = prev.map(c => c.name);
        const newClients = clientOptions.filter((c: any) => !existingNames.includes(c.name));
        return [...prev, ...newClients];
      });
    }
  }, []);

  // Filter tasks - employees see only their assigned tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;
    
    // If user is employee, only show their tasks
    if (user?.role === 'employee') {
      result = result.filter(task => task.assignee === user.name);
    }
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }
    
    return result;
  }, [tasks, user, searchTerm, statusFilter]);

  // Get tasks for selected date
  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    const dateString = selectedDate.toISOString().split('T')[0];
    return filteredTasks.filter(task => task.dueDate === dateString);
  }, [filteredTasks, selectedDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-orange-100 text-orange-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in-progress': return 'Em Progresso';
      case 'completed': return 'Concluída';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const handleTaskSave = (taskData: Omit<TaskModalTask, 'id' | 'createdAt'>) => {
    if (selectedTask) {
      // Update existing task
      const updatedTask: Task = { 
        ...selectedTask, 
        ...taskData,
        createdAt: selectedTask.createdAt,
        drone: taskData.drone || '',
        car: taskData.car || ''
      };
      setTasks(prev => prev.map(task => 
        task.id === selectedTask.id ? updatedTask : task
      ));
      updateTaskInHistory(updatedTask);
    } else {
      // Create new task
      const newTask: Task = {
        id: `task_${Date.now()}`,
        status: 'pending',
        completedHectares: 0,
        progressEntries: [],
        createdAt: new Date().toISOString().split('T')[0],
        drone: taskData.drone || '',
        car: taskData.car || '',
        ...taskData
      };
      setTasks(prev => [...prev, newTask]);
      addTaskToHistory(newTask);
    }
    setSelectedTask(null);
  };

  const handleStartTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && (user?.role === 'admin' || task.assignee === user?.name)) {
      const updatedTask = { ...task, status: 'in-progress' as const };
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      updateTaskInHistory(updatedTask);
    }
  };

  const handleProgressUpdate = (taskId: string, progressData: any) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && (user?.role === 'admin' || task.assignee === user?.name)) {
      const updatedTask = { ...task, ...progressData };
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      updateTaskInHistory(updatedTask);
    }
  };

  const handleCompleteTask = (taskId: string, completionData: any) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && (user?.role === 'admin' || task.assignee === user?.name)) {
      const completedTask = { ...task, ...completionData };
      setTasks(prev => prev.map(task => 
        task.id === taskId ? completedTask : task
      ));
      updateTaskInHistory(completedTask);
    }
  };

  const handleDownloadReport = async (task: Task) => {
    try {
      const clientHistory = getClientHistory(task.client);
      await generateServiceReport(task, { photos: [] }, clientHistory);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    }
  };

  const openExecutionModal = (task: Task) => {
    if (user?.role === 'admin' || task.assignee === user?.name) {
      setSelectedTask(task);
      setIsExecutionModalOpen(true);
    }
  };

  const openClientHistory = (clientName: string) => {
    setSelectedClient(clientName);
    setIsHistoryModalOpen(true);
  };

  const canStartOrContinueTask = (task: Task) => {
    return user?.role === 'admin' || task.assignee === user?.name;
  };

  const isTaskCompleted = (task: Task) => {
    return task.status === 'completed' || (task.completedHectares && task.completedHectares >= task.hectares);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 font-title">Tarefas</h2>
        <p className="text-gray-600">
          {user?.role === 'admin' 
            ? 'Gerencie as tarefas de voo e operações dos drones'
            : 'Suas tarefas atribuídas'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Column */}
        <div className="lg:col-span-1">
          <TaskCalendar
            tasks={filteredTasks}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
        </div>

        {/* Tasks Column */}
        <div className="lg:col-span-2">
          {/* Filters and Search */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Buscar tarefas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-80"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400" size={18} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Todos os Status</option>
                  <option value="pending">Pendente</option>
                  <option value="in-progress">Em Progresso</option>
                  <option value="completed">Concluída</option>
                </select>
              </div>
            </div>

            {user?.role === 'admin' && (
              <Button 
                className="flex items-center gap-2"
                onClick={() => {
                  setSelectedTask(null);
                  setIsTaskModalOpen(true);
                }}
              >
                <Plus size={18} />
                Nova Tarefa
              </Button>
            )}
          </div>

          {/* Selected Date Tasks */}
          {selectedDate && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tarefas para {selectedDate.toLocaleDateString('pt-BR')}
              </h3>
              
              {selectedDateTasks.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">Nenhuma tarefa para este dia</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDateTasks.map((task) => (
                    <div key={task.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 flex-1">{task.title}</h4>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority || 'medium')}`}>
                            {getPriorityText(task.priority || 'medium')}
                          </span>
                          {user?.role === 'admin' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openClientHistory(task.client)}
                              className="flex items-center gap-1"
                            >
                              <History size={14} />
                              Histórico
                            </Button>
                          )}
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4">{task.description}</p>

                      {/* Progress Bar for In-Progress Tasks */}
                      {task.status === 'in-progress' && task.completedHectares !== undefined && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progresso: {task.completedHectares}/{task.hectares} ha</span>
                            <span>{((task.completedHectares / task.hectares) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(task.completedHectares / task.hectares) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="mr-2" size={16} />
                          <span>{task.assignee}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="mr-2" size={16} />
                          <span>{task.location}</span>
                        </div>
                        <div>
                          <span className="font-medium">Cliente:</span> {task.client}
                        </div>
                        <div>
                          <span className="font-medium">Hectares:</span> {task.hectares}
                        </div>
                        {task.serviceValue && (
                          <div className="col-span-2">
                            <span className="font-medium">Valor do Serviço:</span> R$ {task.serviceValue.toFixed(2)}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                            {getStatusText(task.status)}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          {/* Download Report Button for completed tasks - Admin only */}
                          {user?.role === 'admin' && isTaskCompleted(task) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadReport(task)}
                              className="flex items-center gap-1"
                            >
                              <Download size={14} />
                              Baixar Relatório
                            </Button>
                          )}

                          {/* Action buttons for assigned employee or admin */}
                          {canStartOrContinueTask(task) && (
                            <>
                              {task.status === 'pending' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleStartTask(task.id)}
                                  className="flex items-center gap-1"
                                >
                                  <Play size={14} />
                                  Iniciar
                                </Button>
                              )}
                              {task.status === 'in-progress' && !isTaskCompleted(task) && (
                                <Button
                                  size="sm"
                                  onClick={() => openExecutionModal(task)}
                                  className="flex items-center gap-1"
                                >
                                  <CheckCircle size={14} />
                                  {task.completedHectares === 0 ? 'Iniciar' : 'Continuar'}
                                </Button>
                              )}
                            </>
                          )}

                          {/* Edit button for admins */}
                          {user?.role === 'admin' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTask(task);
                                setIsTaskModalOpen(true);
                              }}
                            >
                              Editar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleTaskSave}
        task={selectedTask}
        users={registeredUsers}
        clients={clients}
      />

      <ProgressiveTaskExecution
        isOpen={isExecutionModalOpen}
        onClose={() => {
          setIsExecutionModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        onProgressUpdate={handleProgressUpdate}
        onComplete={handleCompleteTask}
      />

      {/* Client History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico do Cliente: {selectedClient}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {getClientHistory(selectedClient).length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum histórico encontrado para este cliente</p>
            ) : (
              getClientHistory(selectedClient).map((historyTask) => (
                <div key={historyTask.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{historyTask.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(historyTask.status)}`}>
                      {getStatusText(historyTask.status)}
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

export default Tasks;
