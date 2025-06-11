
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Download, Filter, Calendar, TrendingUp, Users, Plane, CheckCircle, Plus, Trash2, DollarSign } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

interface BankEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

interface ClientDebt {
  id: string;
  clientName: string;
  serviceDescription: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  date: string;
  taskId?: string;
}

interface ClientPayment {
  id: string;
  clientName: string;
  amount: number;
  date: string;
  debtId: string;
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState('30days');
  const [bankEntries, setBankEntries] = useState<BankEntry[]>([]);
  const [clientDebts, setClientDebts] = useState<ClientDebt[]>([]);
  const [clientPayments, setClientPayments] = useState<ClientPayment[]>([]);
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [entryForm, setEntryForm] = useState({
    description: '',
    amount: 0,
    type: 'expense' as 'income' | 'expense',
    category: ''
  });
  const [paymentForm, setPaymentForm] = useState({
    clientName: '',
    amount: 0,
    debtId: ''
  });

  // Load all data from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('tpdrones_bank_entries');
    if (savedEntries) {
      setBankEntries(JSON.parse(savedEntries));
    }

    const savedDebts = localStorage.getItem('tpdrones_client_debts');
    if (savedDebts) {
      setClientDebts(JSON.parse(savedDebts));
    }

    const savedPayments = localStorage.getItem('tpdrones_client_payments');
    if (savedPayments) {
      setClientPayments(JSON.parse(savedPayments));
    }

    // Load completed tasks and create debts
    const savedTasks = localStorage.getItem('tpdrones_tasks');
    if (savedTasks) {
      const tasks = JSON.parse(savedTasks);
      const completedTasks = tasks.filter((task: any) => task.status === 'completed' && task.serviceValue);
      
      completedTasks.forEach((task: any) => {
        const existingDebt = clientDebts.find(debt => debt.taskId === task.id);
        if (!existingDebt && task.serviceValue) {
          const newDebt: ClientDebt = {
            id: `debt_${Date.now()}_${task.id}`,
            clientName: task.client,
            serviceDescription: task.title,
            totalAmount: task.serviceValue,
            paidAmount: 0,
            remainingAmount: task.serviceValue,
            date: task.completedAt || task.dueDate,
            taskId: task.id
          };
          setClientDebts(prev => [...prev, newDebt]);
        }
      });
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('tpdrones_bank_entries', JSON.stringify(bankEntries));
  }, [bankEntries]);

  useEffect(() => {
    localStorage.setItem('tpdrones_client_debts', JSON.stringify(clientDebts));
  }, [clientDebts]);

  useEffect(() => {
    localStorage.setItem('tpdrones_client_payments', JSON.stringify(clientPayments));
  }, [clientPayments]);

  // Calculate real metrics from tasks and financial data
  const calculateMetrics = () => {
    const savedTasks = localStorage.getItem('tpdrones_tasks');
    const tasks = savedTasks ? JSON.parse(savedTasks) : [];
    
    const completedTasks = tasks.filter((task: any) => task.status === 'completed');
    const totalFlights = completedTasks.length;
    
    // Calculate total flight hours (assuming 1 hour per 10 hectares)
    const totalHectares = completedTasks.reduce((sum: number, task: any) => sum + (task.hectares || 0), 0);
    const flightHours = totalHectares / 10;
    
    // Success rate (completed vs total tasks)
    const totalTasks = tasks.length;
    const successRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    
    // Revenue from completed tasks
    const taskRevenue = completedTasks.reduce((sum: number, task: any) => sum + (task.serviceValue || 0), 0);
    const paymentRevenue = clientPayments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalRevenue = taskRevenue;

    return {
      totalFlights,
      flightHours,
      successRate,
      revenue: totalRevenue
    };
  };

  const metrics = calculateMetrics();

  const monthlyData = [
    { month: 'Jan', flights: 0, revenue: 0 },
    { month: 'Fev', flights: 0, revenue: 0 },
    { month: 'Mar', flights: 0, revenue: 0 },
    { month: 'Abr', flights: 0, revenue: 0 },
    { month: 'Mai', flights: 0, revenue: 0 },
    { month: 'Jun', flights: 0, revenue: 0 }
  ];

  const topClients = clientDebts.reduce((acc: any[], debt) => {
    const existing = acc.find(client => client.name === debt.clientName);
    if (existing) {
      existing.revenue += debt.totalAmount;
      existing.services += 1;
    } else {
      acc.push({
        name: debt.clientName,
        services: 1,
        revenue: debt.totalAmount
      });
    }
    return acc;
  }, []).sort((a, b) => b.revenue - a.revenue).slice(0, 4);

  const dronePerformance = [
    { drone: 'DRN-001', flights: 0, hours: 0, efficiency: 0 },
    { drone: 'DRN-003', flights: 0, hours: 0, efficiency: 0 },
    { drone: 'DRN-005', flights: 0, hours: 0, efficiency: 0 },
    { drone: 'DRN-007', flights: 0, hours: 0, efficiency: 0 }
  ];

  const handleAddEntry = () => {
    const newEntry: BankEntry = {
      id: `entry_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: entryForm.description,
      amount: entryForm.amount,
      type: entryForm.type,
      category: entryForm.category
    };

    setBankEntries(prev => [...prev, newEntry]);
    setEntryForm({ description: '', amount: 0, type: 'expense', category: '' });
    setIsAddEntryOpen(false);
  };

  const handleAddPayment = () => {
    const debt = clientDebts.find(d => d.id === paymentForm.debtId);
    if (!debt) return;

    const newPayment: ClientPayment = {
      id: `payment_${Date.now()}`,
      clientName: paymentForm.clientName,
      amount: paymentForm.amount,
      date: new Date().toISOString().split('T')[0],
      debtId: paymentForm.debtId
    };

    setClientPayments(prev => [...prev, newPayment]);

    // Update debt
    setClientDebts(prev => prev.map(debt => {
      if (debt.id === paymentForm.debtId) {
        const newPaidAmount = debt.paidAmount + paymentForm.amount;
        return {
          ...debt,
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, debt.totalAmount - newPaidAmount)
        };
      }
      return debt;
    }));

    // Add to bank entries as income
    const incomeEntry: BankEntry = {
      id: `income_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      description: `Pagamento de ${paymentForm.clientName}`,
      amount: paymentForm.amount,
      type: 'income',
      category: 'Receita de Clientes'
    };
    setBankEntries(prev => [...prev, incomeEntry]);

    setPaymentForm({ clientName: '', amount: 0, debtId: '' });
    setIsAddPaymentOpen(false);
  };

  const handleDeleteEntry = (entryId: string) => {
    setBankEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  const generateMonthlyExpenseReport = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = bankEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === currentMonth && 
             entryDate.getFullYear() === currentYear &&
             entry.type === 'expense';
    });

    const totalExpenses = monthlyExpenses.reduce((sum, entry) => sum + entry.amount, 0);
    
    const reportContent = `Relatório Mensal de Despesas\n\n` +
      `Mês: ${new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}\n` +
      `Total de Despesas: R$ ${totalExpenses.toFixed(2)}\n\n` +
      `Detalhamento:\n` +
      monthlyExpenses.map(entry => 
        `${entry.date} - ${entry.description} - R$ ${entry.amount.toFixed(2)} (${entry.category})`
      ).join('\n');

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_despesas_${new Date().toISOString().slice(0, 7)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    setBankEntries([]);
    setClientDebts([]);
    setClientPayments([]);
    localStorage.removeItem('tpdrones_bank_entries');
    localStorage.removeItem('tpdrones_client_debts');
    localStorage.removeItem('tpdrones_client_payments');
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 font-title">Finanças</h2>
        <p className="text-gray-600">Análise detalhada das finanças e performance</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="text-gray-400" size={18} />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="7days">Últimos 7 dias</option>
              <option value="30days">Últimos 30 dias</option>
              <option value="90days">Últimos 90 dias</option>
              <option value="1year">Último ano</option>
            </select>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="flex gap-2">
            <Button onClick={clearAllData} variant="destructive" className="flex items-center gap-2">
              <Trash2 size={18} />
              Excluir Dados
            </Button>
            <Button className="flex items-center gap-2" variant="outline">
              <Download size={18} />
              Exportar Relatório
            </Button>
          </div>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Voos Totais</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalFlights}</p>
                <p className="text-xs text-gray-600 mt-1">+0% vs mês anterior</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plane className="text-blue-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Horas de Voo</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.flightHours.toFixed(1)}h</p>
                <p className="text-xs text-gray-600 mt-1">+0% vs mês anterior</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.successRate.toFixed(1)}%</p>
                <p className="text-xs text-gray-600 mt-1">+0% vs mês anterior</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-green-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita</p>
                <p className="text-2xl font-bold text-gray-900">R$ {metrics.revenue.toLocaleString()}</p>
                <p className="text-xs text-gray-600 mt-1">+0% vs mês anterior</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-purple-600" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Resumo</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="drones">Desempenho de Drones</TabsTrigger>
          <TabsTrigger value="finances">Finanças</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-4 p-4">
                {monthlyData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-primary-500 rounded-t"
                      style={{ height: `${data.flights === 0 ? 10 : (data.flights / Math.max(...monthlyData.map(d => d.flights), 1)) * 200}px` }}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                    <span className="text-xs font-medium text-gray-900">{data.flights}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topClients.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum cliente com serviços concluídos</p>
                ) : (
                  topClients.map((client, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        <p className="text-sm text-gray-600">{client.services} serviços realizados</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">R$ {client.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">receita total</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Client Debts Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Débitos de Clientes</CardTitle>
              <Button onClick={() => setIsAddPaymentOpen(true)} size="sm">
                <Plus size={16} className="mr-2" />
                Registrar Pagamento
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clientDebts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum débito registrado</p>
                ) : (
                  clientDebts.map((debt) => (
                    <div key={debt.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{debt.clientName}</p>
                        <p className="text-sm text-gray-600">{debt.serviceDescription}</p>
                        <p className="text-xs text-gray-500">{debt.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">R$ {debt.totalAmount.toFixed(2)}</p>
                        <p className="text-sm text-green-600">Pago: R$ {debt.paidAmount.toFixed(2)}</p>
                        <p className={`text-sm font-medium ${debt.remainingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          Restante: R$ {debt.remainingAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drones" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho dos Drones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left text-sm font-medium text-gray-600 pb-3">Drone</th>
                      <th className="text-left text-sm font-medium text-gray-600 pb-3">Voos</th>
                      <th className="text-left text-sm font-medium text-gray-600 pb-3">Horas</th>
                      <th className="text-left text-sm font-medium text-gray-600 pb-3">Eficiência</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {dronePerformance.map((drone, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-3 text-sm font-medium text-gray-900">{drone.drone}</td>
                        <td className="py-3 text-sm text-gray-600">{drone.flights}</td>
                        <td className="py-3 text-sm text-gray-600">{drone.hours}h</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${drone.efficiency}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{drone.efficiency}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="finances" className="space-y-6">
          {/* Bank Entries Management */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Extratos Bancários e Despesas</CardTitle>
              <div className="flex gap-2">
                <Button onClick={generateMonthlyExpenseReport} variant="outline" size="sm">
                  <Download size={16} className="mr-2" />
                  Relatório Mensal
                </Button>
                <Button onClick={() => setIsAddEntryOpen(true)} size="sm">
                  <Plus size={16} className="mr-2" />
                  Adicionar Entrada
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bankEntries.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhuma entrada financeira registrada</p>
                ) : (
                  <div className="space-y-2">
                    {bankEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              entry.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {entry.type === 'income' ? 'Receita' : 'Despesa'}
                            </span>
                            <span className="text-sm text-gray-600">{entry.date}</span>
                            <span className="text-sm text-gray-600">{entry.category}</span>
                          </div>
                          <p className="font-medium text-gray-900 mt-1">{entry.description}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-semibold ${
                            entry.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {entry.type === 'income' ? '+' : '-'}R$ {entry.amount.toFixed(2)}
                          </span>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Financial Summary */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Total Receitas</p>
                    <p className="text-lg font-semibold text-green-600">
                      R$ {bankEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Total Despesas</p>
                    <p className="text-lg font-semibold text-red-600">
                      R$ {bankEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600">Saldo</p>
                    <p className="text-lg font-semibold text-blue-600">
                      R$ {(
                        bankEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0) -
                        bankEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
                      ).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Entry Modal */}
      <Dialog open={isAddEntryOpen} onOpenChange={setIsAddEntryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Entrada Financeira</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={entryForm.description}
                onChange={(e) => setEntryForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição da transação"
              />
            </div>
            <div>
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                value={entryForm.amount}
                onChange={(e) => setEntryForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="type">Tipo</Label>
              <select
                id="type"
                value={entryForm.type}
                onChange={(e) => setEntryForm(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={entryForm.category}
                onChange={(e) => setEntryForm(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Categoria da transação"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddEntryOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleAddEntry} className="flex-1">
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Payment Modal */}
      <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento de Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="debtSelect">Selecionar Débito</Label>
              <select
                id="debtSelect"
                value={paymentForm.debtId}
                onChange={(e) => {
                  const debt = clientDebts.find(d => d.id === e.target.value);
                  setPaymentForm(prev => ({ 
                    ...prev, 
                    debtId: e.target.value,
                    clientName: debt?.clientName || ''
                  }));
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Selecione um débito</option>
                {clientDebts.filter(debt => debt.remainingAmount > 0).map(debt => (
                  <option key={debt.id} value={debt.id}>
                    {debt.clientName} - {debt.serviceDescription} (R$ {debt.remainingAmount.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="paymentAmount">Valor do Pagamento</Label>
              <Input
                id="paymentAmount"
                type="number"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                placeholder="0.00"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsAddPaymentOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleAddPayment} className="flex-1" disabled={!paymentForm.debtId || paymentForm.amount <= 0}>
                Registrar Pagamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
