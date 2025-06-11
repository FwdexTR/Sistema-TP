
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  addTaskToHistory: (task: Task) => void;
  updateTaskInHistory: (task: Task) => void;
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

  useEffect(() => {
    const savedHistory = localStorage.getItem('dronecore_client_history');
    if (savedHistory) {
      setClientHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveHistory = (history: { [clientName: string]: Task[] }) => {
    setClientHistory(history);
    localStorage.setItem('dronecore_client_history', JSON.stringify(history));
  };

  const getClientHistory = (clientName: string): Task[] => {
    return clientHistory[clientName] || [];
  };

  const addTaskToHistory = (task: Task) => {
    const updatedHistory = {
      ...clientHistory,
      [task.client]: [...(clientHistory[task.client] || []), task]
    };
    saveHistory(updatedHistory);
  };

  const updateTaskInHistory = (task: Task) => {
    const clientTasks = clientHistory[task.client] || [];
    const updatedTasks = clientTasks.map(t => t.id === task.id ? task : t);
    
    const updatedHistory = {
      ...clientHistory,
      [task.client]: updatedTasks
    };
    saveHistory(updatedHistory);
  };

  const value = {
    getClientHistory,
    addTaskToHistory,
    updateTaskInHistory,
  };

  return (
    <ClientHistoryContext.Provider value={value}>
      {children}
    </ClientHistoryContext.Provider>
  );
};
