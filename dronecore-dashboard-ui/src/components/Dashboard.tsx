
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Users, FileText, DollarSign, Car, Wifi, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

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
  car?: string;
  completedAt?: string;
}

interface Client {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  totalMissions: number;
}

interface User {
  id: string;
  name: string;
  role: 'admin' | 'employee';
  active: boolean;
}

interface Car {
  id: string;
  model: string;
  status: 'available' | 'in-use' | 'maintenance';
}

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [cars, setCars] = useState<Car[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const loadData = () => {
      // Tasks
      const savedTasks = localStorage.getItem('tpdrones_tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }

      // Clients
      const savedClients = localStorage.getItem('tpdrones_clients');
      if (savedClients) {
        setClients(JSON.parse(savedClients));
      }

      // Users
      const savedUsers = localStorage.getItem('tpdrones_users');
      if (savedUsers) {
        setUsers(JSON.parse(savedUsers));
      }

      // Cars
      const savedCars = localStorage.getItem('tpdrones_cars');
      if (savedCars) {
        setCars(JSON.parse(savedCars));
      }
    };

    loadData();
    
    // Update data every 5 seconds to stay in sync
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Calculate metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.status === 'active').length;
  
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.active).length;
  const employees = users.filter(u => u.role === 'employee' && u.active).length;
  
  const totalCars = cars.length;
  const availableCars = cars.filter(c => c.status === 'available').length;
  const carsInUse = cars.filter(c => c.status === 'in-use').length;
  const carsInMaintenance = cars.filter(c => c.status === 'maintenance').length;

  const totalHectares = tasks.reduce((sum, task) => sum + task.hectares, 0);
  const completedHectares = tasks
    .filter(t => t.status === 'completed')
    .reduce((sum, task) => sum + task.hectares, 0);

  // Chart data
  const taskStatusData = [
    { name: 'Concluídas', value: completedTasks, color: '#10B981' },
    { name: 'Em Progresso', value: inProgressTasks, color: '#3B82F6' },
    { name: 'Pendentes', value: pendingTasks, color: '#F59E0B' }
  ];

  const monthlyTasksData = (() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();
    
    return months.map((month, index) => {
      const monthTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate.getMonth() === index && taskDate.getFullYear() === currentYear;
      });
      
      return {
        month,
        total: monthTasks.length,
        completed: monthTasks.filter(t => t.status === 'completed').length,
        pending: monthTasks.filter(t => t.status === 'pending').length
      };
    });
  })();

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 font-title">Dashboard</h2>
        <p className="text-gray-600">Visão geral das operações da TpDrones</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total de Tarefas</p>
              <p className="text-2xl font-bold text-gray-900">{totalTasks}</p>
              <p className="text-sm text-green-600">{completedTasks} concluídas</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Clientes Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{activeClients}</p>
              <p className="text-sm text-gray-500">de {totalClients} total</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Funcionários</p>
              <p className="text-2xl font-bold text-gray-900">{employees}</p>
              <p className="text-sm text-blue-600">{activeUsers} usuários ativos</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Hectares Concluídos</p>
              <p className="text-2xl font-bold text-gray-900">{completedHectares.toFixed(1)}</p>
              <p className="text-sm text-gray-500">de {totalHectares.toFixed(1)} total</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FileText className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status das Tarefas</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="text-green-600" size={16} />
                <span className="text-sm text-gray-600">Concluídas</span>
              </div>
              <span className="font-medium text-gray-900">{completedTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="text-blue-600" size={16} />
                <span className="text-sm text-gray-600">Em Progresso</span>
              </div>
              <span className="font-medium text-gray-900">{inProgressTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-yellow-600" size={16} />
                <span className="text-sm text-gray-600">Pendentes</span>
              </div>
              <span className="font-medium text-gray-900">{pendingTasks}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Frota de Carros</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="text-green-600" size={16} />
                <span className="text-sm text-gray-600">Disponíveis</span>
              </div>
              <span className="font-medium text-gray-900">{availableCars}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="text-blue-600" size={16} />
                <span className="text-sm text-gray-600">Em Uso</span>
              </div>
              <span className="font-medium text-gray-900">{carsInUse}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="text-red-600" size={16} />
                <span className="text-sm text-gray-600">Manutenção</span>
              </div>
              <span className="font-medium text-gray-900">{carsInMaintenance}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Equipamentos</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wifi className="text-blue-600" size={16} />
                <span className="text-sm text-gray-600">Drones</span>
              </div>
              <span className="font-medium text-gray-900">5</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="text-purple-600" size={16} />
                <span className="text-sm text-gray-600">Carros</span>
              </div>
              <span className="font-medium text-gray-900">{totalCars}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarefas por Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tarefas por Mês</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyTasksData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completed" fill="#10B981" name="Concluídas" />
              <Bar dataKey="pending" fill="#F59E0B" name="Pendentes" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
