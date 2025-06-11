
import React from 'react';
import { BarChart } from 'lucide-react';

const FlightActivityCard: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Atividade de Voos</h3>
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <BarChart className="text-4xl text-gray-400 mb-2 mx-auto" size={48} />
          <p className="text-gray-500">Gráfico de voos por dia</p>
        </div>
      </div>
    </div>
  );
};

export default FlightActivityCard;
