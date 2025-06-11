
import React from 'react';
import Sidebar from '../components/Sidebar';
import Tasks from './Tasks';

const TasksPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex font-body">
      <Sidebar />
      <Tasks />
    </div>
  );
};

export default TasksPage;
