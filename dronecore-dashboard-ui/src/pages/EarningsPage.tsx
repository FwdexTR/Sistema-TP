
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { Calculator, DollarSign, Calendar, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

interface Task {
  id: string;
  title: string;
  hectares: number;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  client: string;
}

const EarningsPage: React.FC = () => {
  const { user } = useAuth();
  const [baseRate, setBaseRate] = useState(15);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempRate, setTempRate] = useState(baseRate);

  // Mock tasks data - in a real app, this would come from an API
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Inspeção de Torres',
      hectares: 10.5,
      dueDate: '2024-01-15',
      status: 'completed',
      client: 'Empresa A'
    },
    {
      id: '2',
      title: 'Mapeamento Agrícola',
      hectares: 25.0,
      dueDate: '2024-01-18',
      status: 'completed',
      client: 'Fazenda São João'
    },
    {
      id: '3',
      title: 'Monitoramento Ambiental',
      hectares: 8.2,
      dueDate: '2024-01-20',
      status: 'in-progress',
      client: 'Distrito Industrial'
    }
  ];

  const userTasks = tasks.filter(task => 
    user?.role === 'admin' || task.title // For demo, show all tasks for admin
  );

  const completedTasks = userTasks.filter(task => task.status === 'completed');
  const totalHectares = completedTasks.reduce((sum, task) => sum + task.hectares, 0);
  const totalEarnings = totalHectares * baseRate;

  const pendingTasks = userTasks.filter(task => task.status !== 'completed');
  const pendingHectares = pendingTasks.reduce((sum, task) => sum + task.hectares, 0);
  const potentialEarnings = pendingHectares * baseRate;

  const handleSaveRate = () => {
    setBaseRate(tempRate);
    setIsSettingsOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-body">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 font-title">Ganhos</h2>
              <p className="text-gray-600">
                Acompanhe seus ganhos por hectare trabalhado
              </p>
            </div>
            <Button
              onClick={() => setIsSettingsOpen(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings size={18} />
              Configurar Taxa
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa por Hectare</p>
                <p className="text-2xl font-bold text-gray-900">R$ {baseRate}</p>
              </div>
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hectares Concluídos</p>
                <p className="text-2xl font-bold text-gray-900">{totalHectares.toFixed(1)}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ganhos Realizados</p>
                <p className="text-2xl font-bold text-green-600">R$ {totalEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ganhos Potenciais</p>
                <p className="text-2xl font-bold text-blue-600">R$ {potentialEarnings.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Tarefas Concluídas</h3>
          </div>
          <div className="p-6">
            {completedTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma tarefa concluída</p>
            ) : (
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600">{task.client}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{task.hectares} ha</p>
                      <p className="font-semibold text-green-600">
                        R$ {(task.hectares * baseRate).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Tarefas Pendentes</h3>
          </div>
          <div className="p-6">
            {pendingTasks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhuma tarefa pendente</p>
            ) : (
              <div className="space-y-4">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <p className="text-sm text-gray-600">{task.client}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{task.hectares} ha</p>
                      <p className="font-semibold text-blue-600">
                        R$ {(task.hectares * baseRate).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Settings Modal */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configurar Taxa por Hectare</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Taxa por Hectare (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={tempRate}
                  onChange={(e) => setTempRate(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={handleSaveRate} className="flex-1">
                  Salvar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EarningsPage;
