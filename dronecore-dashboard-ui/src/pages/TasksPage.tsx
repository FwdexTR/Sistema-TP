import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Tasks from './Tasks';
import { getTasks, createTask } from '../services/api';

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getTasks()
      .then((data) => setTasks(data))
      .catch(() => setError('Erro ao buscar tarefas do servidor.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex font-body">
      <Sidebar />
      <Tasks />
    </div>
  );
};

export default TasksPage;
