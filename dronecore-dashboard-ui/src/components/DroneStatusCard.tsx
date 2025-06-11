
import React from 'react';

interface StatusItemProps {
  status: string;
  count: number;
  color: 'green' | 'yellow' | 'red';
}

const StatusItem: React.FC<StatusItemProps> = ({ status, count, color }) => {
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      dot: 'bg-green-500',
      text: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      dot: 'bg-yellow-500',
      text: 'text-yellow-600'
    },
    red: {
      bg: 'bg-red-50',
      dot: 'bg-red-500',
      text: 'text-red-600'
    }
  };

  const styles = colorClasses[color];

  return (
    <div className={`flex items-center justify-between p-3 ${styles.bg} rounded-lg`}>
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 ${styles.dot} rounded-full`}></div>
        <span className="text-sm font-medium text-gray-900">{status}</span>
      </div>
      <span className={`text-sm font-semibold ${styles.text}`}>{count}</span>
    </div>
  );
};

const DroneStatusCard: React.FC = () => {
  const statusData = [
    { status: 'Operacionais', count: 20, color: 'green' as const },
    { status: 'Manutenção', count: 3, color: 'yellow' as const },
    { status: 'Offline', count: 1, color: 'red' as const },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Drones</h3>
      <div className="space-y-4">
        {statusData.map((item, index) => (
          <StatusItem
            key={index}
            status={item.status}
            count={item.count}
            color={item.color}
          />
        ))}
      </div>
    </div>
  );
};

export default DroneStatusCard;
