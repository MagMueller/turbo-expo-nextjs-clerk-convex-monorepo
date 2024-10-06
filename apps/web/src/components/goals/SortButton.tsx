import React from 'react';
import { IconType } from 'react-icons';

interface SortButtonProps {
  field: string;
  currentSort: string;
  onSort: (field: any) => void;  // Change this to accept any type
  icon: IconType;
}

const SortButton: React.FC<SortButtonProps> = ({ field, currentSort, onSort, icon: Icon }) => {
  return (
    <button 
      onClick={() => onSort(field)} 
      className={`flex items-center px-3 py-2 rounded ${
        currentSort === field ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'
      } hover:bg-blue-600 hover:text-white transition duration-300`}
    >
      {field.charAt(0).toUpperCase() + field.slice(1)} <Icon className="ml-1" />
    </button>
  );
};

export default SortButton;
