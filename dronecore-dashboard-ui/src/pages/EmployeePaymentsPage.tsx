
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { DollarSign, User, FileText, Trash2, Eye, Download } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { generateEmployeePaymentReport, generateAggregatedPaymentReport, calculateEmployeeWorkData } from '../utils/professionalReportGenerator';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  active?: boolean;
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

const EmployeePaymentsPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [employeeRates, setEmployeeRates] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load employees from localStorage
    const savedUsers = localStorage.getItem('tpdrones_users');
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      const employeeList = users.filter((user: any) => user.role === 'employee' && user.active !== false);
      setEmployees(employeeList);
    }

    // Load tasks from localStorage
    const savedTasks = localStorage.getItem('tpdrones_tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }

    // Load employee rates from localStorage
    const savedRates = localStorage.getItem('tpdrones_employee_rates');
    if (savedRates) {
      setEmployeeRates(JSON.parse(savedRates));
    }
  };

  const handleClearData = () => {
    if (confirm('Tem certeza que deseja limpar todos os dados de pagamentos? Esta ação não pode ser desfeita.')) {
      // Clear completed tasks
      const updatedTasks = tasks.map(task => ({
        ...task,
        status: 'pending' as const,
        completedHectares: 0,
        progressEntries: []
      }));
      
      localStorage.setItem('tpdrones_tasks', JSON.stringify(updatedTasks));
      setTasks(updatedTasks);
      
      // Reset employee rates
      setEmployeeRates({});
      localStorage.removeItem('tpdrones_employee_rates');
    }
  };

  const handleGenerateReport = async () => {
    if (selectedEmployee) {
      const rate = employeeRates[selectedEmployee.id] || 0;
      await generateEmployeePaymentReport(selectedEmployee, tasks, rate);
    } else {
      alert('Selecione um funcionário para gerar o relatório.');
    }
  };

  const handleGenerateAggregatedReport = async () => {
    await generateAggregatedPaymentReport(employees, tasks, employeeRates);
  };

  const handleRateChange = (employeeId: string, rate: number) => {
    const updatedRates = { ...employeeRates, [employeeId]: rate };
    setEmployeeRates(updatedRates);
    localStorage.setItem('tpdrones_employee_rates', JSON.stringify(updatedRates));
  };

  const handleDeleteEmployeeData = (employeeId: string) => {
    if (confirm('Tem certeza que deseja excluir todos os dados deste funcionário?')) {
      // Remove from employee rates
      const updatedRates = { ...employeeRates };
      delete updatedRates[employeeId];
      setEmployeeRates(updatedRates);
      localStorage.setItem('tpdrones_employee_rates', JSON.stringify(updatedRates));
      
      // Clear progress entries for this employee
      const updatedTasks = tasks.map(task => ({
        ...task,
        progressEntries: task.progressEntries?.filter(entry => entry.assignee !== employees.find(e => e.id === employeeId)?.name) || []
      }));
      
      setTasks(updatedTasks);
      localStorage.setItem('tpdrones_tasks', JSON.stringify(updatedTasks));
      
      loadData();
    }
  };

  // Calculate work data for all employees
  const allEmployeeWorkData = calculateEmployeeWorkData(employees, tasks, employeeRates);

  const getEmployeeWorkData = (employeeName: string) => {
    return allEmployeeWorkData.find(data => data.employeeName === employeeName) || {
      employeeName,
      totalHectares: 0,
      earnings: 0,
      taskDetails: []
    };
  };

  const totalHectares = allEmployeeWorkData.reduce((sum, emp) => sum + emp.totalHectares, 0);
  const totalEarnings = allEmployeeWorkData.reduce((sum, emp) => sum + emp.earnings, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex font-body">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2 font-title">Pagamentos dos Funcionários</h2>
              <p className="text-gray-600">
                Gerencie pagamentos baseados em áreas trabalhadas por cada funcionário
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleGenerateAggregatedReport}
                className="flex items-center gap-2"
              >
                <Download size={18} />
                Relatório Agregado
              </Button>
              <Button 
                variant="outline"
                onClick={handleClearData}
                className="text-red-600 flex items-center gap-2"
              >
                <Trash2 size={18} />
                Limpar Dados do Mês
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total de Funcionários</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
              <User className="h-12 w-12 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Hectares</p>
                <p className="text-2xl font-bold">{totalHectares.toFixed(1)}</p>
              </div>
              <DollarSign className="h-12 w-12 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total a Pagar</p>
                <p className="text-2xl font-bold">R$ {totalEarnings.toFixed(2)}</p>
              </div>
              <FileText className="h-12 w-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Employees List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Lista de Funcionários</h3>
          <div className="space-y-6">
            {employees.map((employee) => {
              const workData = getEmployeeWorkData(employee.name);
              const rate = employeeRates[employee.id] || 0;
              
              return (
                <div key={employee.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-500">{employee.email}</p>
                        <div className="flex gap-4 mt-1 text-xs text-gray-600">
                          <span>Hectares: {workData.totalHectares.toFixed(1)} ha</span>
                          <span>Ganhos: R$ {workData.earnings.toFixed(2)}</span>
                          <span>Serviços: {workData.taskDetails.length}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">R$/ha:</label>
                        <Input
                          type="number"
                          placeholder="Taxa"
                          className="w-20 text-sm"
                          value={rate || ''}
                          onChange={(e) => handleRateChange(employee.id, parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setIsDetailModalOpen(true);
                        }}
                        className="flex items-center gap-1"
                      >
                        <Eye size={14} />
                        Detalhes
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => setSelectedEmployee(employee)}
                        className={selectedEmployee?.id === employee.id ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 border border-blue-500 hover:bg-blue-50'}
                      >
                        Selecionar
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteEmployeeData(employee.id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Employee Actions */}
        {selectedEmployee && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Ações para {selectedEmployee.name}
            </h3>
            <div className="flex gap-4">
              <Button
                onClick={handleGenerateReport}
                className="flex items-center gap-2"
              >
                <FileText size={18} />
                Gerar Relatório Individual
              </Button>
            </div>
          </div>
        )}

        {/* Employee Details Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Histórico de Trabalho: {selectedEmployee?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedEmployee && (() => {
                const workData = getEmployeeWorkData(selectedEmployee.name);
                return workData.taskDetails.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum trabalho registrado para este funcionário</p>
                ) : (
                  <div>
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Resumo</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>Total de Hectares: {workData.totalHectares.toFixed(1)} ha</div>
                        <div>Taxa por Hectare: R$ {(employeeRates[selectedEmployee.id] || 0).toFixed(2)}</div>
                        <div>Total a Receber: R$ {workData.earnings.toFixed(2)}</div>
                      </div>
                    </div>
                    
                    {workData.taskDetails.map((taskDetail, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{taskDetail.taskTitle}</h4>
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            {taskDetail.hectares} ha
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 mt-3">
                          <div>Cliente: {taskDetail.client}</div>
                          <div>Data: {new Date(taskDetail.date).toLocaleDateString('pt-BR')}</div>
                          <div>Valor: R$ {(taskDetail.hectares * (employeeRates[selectedEmployee.id] || 0)).toFixed(2)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EmployeePaymentsPage;
