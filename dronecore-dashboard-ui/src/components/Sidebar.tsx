import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Users, 
  DollarSign, 
  BarChart3, 
  UserPlus, 
  Settings,
  Car,
  Database,
  LogOut
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const isActive = (path: string) => location.pathname === path;

  const adminMenuItems = [
    { path: '/', icon: Home, label: 'Dashboard', adminOnly: true },
    { path: '/tasks', icon: Calendar, label: 'Tarefas', adminOnly: false },
    { path: '/task-data', icon: Database, label: 'Dados das Tarefas', adminOnly: true },
    { path: '/payments', icon: DollarSign, label: 'Pagamentos', adminOnly: true },
    { path: '/clients', icon: Users, label: 'Clientes', adminOnly: true },
    { path: '/reports', icon: BarChart3, label: 'Análise Detalhada de Operações e Desempenho', adminOnly: true },
    { path: '/users', icon: UserPlus, label: 'Usuários', adminOnly: true },
    { path: '/drones', icon: Settings, label: 'Drones', adminOnly: true },
    { path: '/cars', icon: Car, label: 'Carros', adminOnly: true },
  ];

  const employeeMenuItems = [
    { path: '/tasks', icon: Calendar, label: 'Minhas Tarefas', adminOnly: false },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : employeeMenuItems;

  return (
    <div className="bg-white border-r border-gray-200 w-64 min-h-screen p-6 font-body">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <img 
            src="/Photo-upload/c02fcc86-f1bb-4bb6-b6b2-63f5680e34db.png" 
            alt="TpDrones Logo" 
            className="h-12 w-12"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900 font-title">TpDrones</h1>
            <p className="text-sm text-gray-600">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
        <p className="text-xs text-gray-600">{user?.email}</p>
        <p className="text-xs text-blue-600 capitalize">{user?.role}</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          if (item.adminOnly && user?.role !== 'admin') return null;
          
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <button
          onClick={logout}
          className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
