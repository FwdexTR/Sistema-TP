
import React from 'react';

interface SummaryCardProps {
  icon: React.ReactNode;
  value: string | number;
  title: string;
  change: string;
  changeType?: 'positive' | 'negative';
  iconBgColor: string;
  iconColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  value,
  title,
  change,
  changeType = 'positive',
  iconBgColor,
  iconColor
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <div className={iconColor}>
            {icon}
          </div>
        </div>
        <span className="text-2xl font-bold text-gray-900">{value}</span>
      </div>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className={`text-xs mt-1 ${
        changeType === 'positive' ? 'text-green-600' : 'text-red-600'
      }`}>
        {change}
      </p>
    </div>
  );
};

export default SummaryCard;
