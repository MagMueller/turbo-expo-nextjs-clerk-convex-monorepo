import React from 'react';
import { FaTrophy, FaWallet } from 'react-icons/fa';

interface ScoreBudgetDisplayProps {
  score: number;
  budget: number;
  darkMode?: boolean;
}

const ScoreBudgetDisplay: React.FC<ScoreBudgetDisplayProps> = ({ score, budget, darkMode = false }) => {
  const textColor = darkMode ? 'text-white' : 'text-gray-800';
  const iconColor = darkMode ? 'text-yellow-400' : 'text-yellow-600';
  const walletColor = darkMode ? 'text-green-400' : 'text-green-600';

  return (
    <div className={`flex items-center space-x-4 mr-4 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'} p-2 rounded`}>
      <div className="flex items-center">
        <FaTrophy className={`${iconColor} mr-2`} />
        <span className={`font-bold ${textColor}`}>Score: {score}</span>
      </div>
      <div className="flex items-center">
        <FaWallet className={`${walletColor} mr-2`} />
        <span className={`font-bold ${textColor}`}>Budget: {budget}</span>
      </div>
    </div>
  );
};

export default ScoreBudgetDisplay;