
import React from 'react';

interface Mission {
  id: string;
  client: string;
  drone: string;
  status: 'Concluída' | 'Em Progresso' | 'Planejada';
  date: string;
}

interface StatusBadgeProps {
  status: Mission['status'];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles = {
    'Concluída': 'text-green-700 bg-green-100',
    'Em Progresso': 'text-blue-700 bg-blue-100',
    'Planejada': 'text-yellow-700 bg-yellow-100',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

const RecentMissionsTable: React.FC = () => {
  const missions: Mission[] = [
    {
      id: '#M001',
      client: 'Agro Tech Ltd',
      drone: 'DRN-001',
      status: 'Concluída',
      date: '12/12/2023'
    },
    {
      id: '#M002',
      client: 'Urban Survey',
      drone: 'DRN-003',
      status: 'Em Progresso',
      date: '13/12/2023'
    },
    {
      id: '#M003',
      client: 'Mining Corp',
      drone: 'DRN-005',
      status: 'Planejada',
      date: '14/12/2023'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Missões Recentes</h3>
      </div>
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="text-sm font-medium text-gray-600 pb-3">ID Missão</th>
                <th className="text-sm font-medium text-gray-600 pb-3">Cliente</th>
                <th className="text-sm font-medium text-gray-600 pb-3">Drone</th>
                <th className="text-sm font-medium text-gray-600 pb-3">Status</th>
                <th className="text-sm font-medium text-gray-600 pb-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {missions.map((mission, index) => (
                <tr key={index} className="border-t border-gray-100">
                  <td className="py-3 text-sm font-medium text-gray-900">{mission.id}</td>
                  <td className="py-3 text-sm text-gray-600">{mission.client}</td>
                  <td className="py-3 text-sm text-gray-600">{mission.drone}</td>
                  <td className="py-3">
                    <StatusBadge status={mission.status} />
                  </td>
                  <td className="py-3 text-sm text-gray-600">{mission.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecentMissionsTable;
