import React, { createContext, useContext, useState, useEffect } from 'react';
import { getClientHistory, createClientHistory } from '../services/api';

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
  completedAt?: string;
}

interface ClientHistoryContextType {
  getClientHistory: (clientName: string) => Task[];
  addTaskToHistory: (task: Task) => Promise<void>;
  updateTaskInHistory: (task: Task) => void;
  loading: boolean;
  error: string | null;
}

const ClientHistoryContext = createContext<ClientHistoryContextType | undefined>(undefined);

export const useClientHistory = () => {
  const context = useContext(ClientHistoryContext);
  if (context === undefined) {
    throw new Error('useClientHistory must be used within a ClientHistoryProvider');
  }
  return context;
};

export const ClientHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clientHistory, setClientHistory] = useState<{ [clientName: string]: Task[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClientHistory();
  }, []);

  const loadClientHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const historyData = await getClientHistory();
      
      // Organizar dados por cliente
      const organizedHistory: { [clientName: string]: Task[] } = {};
      historyData.forEach((entry: any) => {
        if (entry.client && entry.task) {
          const clientName = entry.client.name;
          if (!organizedHistory[clientName]) {
            organizedHistory[clientName] = [];
          }
          organizedHistory[clientName].push(entry.task);
        }
      });
      
      setClientHistory(organizedHistory);
    } catch (err) {
      setError('Erro ao carregar histórico de clientes');
      console.error('Erro ao carregar histórico de clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  const getClientHistory = (clientName: string): Task[] => {
    return clientHistory[clientName] || [];
  };

  const addTaskToHistory = async (task: Task) => {
    try {
      setError(null);
      await createClientHistory({
        clientId: task.client, // Assumindo que task.client é o ID do cliente
        taskId: task.id,
        action: 'task_created',
        description: `Tarefa "${task.title}" criada`
      });
      
      const updatedHistory = {
        ...clientHistory,
        [task.client]: [...(clientHistory[task.client] || []), task]
      };
      setClientHistory(updatedHistory);
    } catch (err) {
      setError('Erro ao adicionar tarefa ao histórico');
      console.error('Erro ao adicionar tarefa ao histórico:', err);
      throw err;
    }
  };

  const updateTaskInHistory = (task: Task) => {
    const clientTasks = clientHistory[task.client] || [];
    const updatedTasks = clientTasks.map(t => t.id === task.id ? task : t);
    
    const updatedHistory = {
      ...clientHistory,
      [task.client]: updatedTasks
    };
    setClientHistory(updatedHistory);
  };

  const value = {
    getClientHistory,
    addTaskToHistory,
    updateTaskInHistory,
    loading,
    error
  };

  return (
    <ClientHistoryContext.Provider value={value}>
      {children}
    </ClientHistoryContext.Provider>
  );
};
