import { useQuery } from 'convex/react';
import React from 'react';
import { FaTrophy, FaWallet } from 'react-icons/fa';
import { api } from '../../../convex/_generated/api';

const Header: React.FC = () => {
  const currentUser = useQuery(api.users.getCurrentUser);

  return (
    <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="text-2xl font-bold">Your App Name</div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center">
          <FaTrophy className="text-yellow-400 mr-2 text-xl" />
          <span className="font-bold text-xl">Score: {currentUser?.score || 0}</span>
        </div>
        <div className="flex items-center">
          <FaWallet className="text-green-400 mr-2 text-xl" />
          <span className="font-bold text-xl">Budget: {currentUser?.budget || 0}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;