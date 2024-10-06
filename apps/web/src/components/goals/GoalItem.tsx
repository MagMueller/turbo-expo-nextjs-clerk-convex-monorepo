"use client";
import React from 'react';
import { FaCalendarAlt, FaCheck, FaTimes, FaUserCheck, FaWallet } from 'react-icons/fa';

export interface GoalProps {
  goal: {
    _id: string;
    title: string;
    _creationTime: number;
    deadline?: string;
    verifierId?: string;
    status?: string;
    budget?: number;
  };
  onComplete?: () => void;
  onNotAchieved?: () => void;
}

const GoalItem: React.FC<GoalProps> = ({ goal, onComplete, onNotAchieved }) => {
  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : "Overdue";
  };

  const isCompleted = goal.status === "completed" || goal.status === "failed";

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 transition duration-300 hover:shadow-lg">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">{goal.title}</h3>
        <div className="flex space-x-2">
          {!isCompleted && onComplete && onNotAchieved && (
            <>
              <button 
                onClick={onComplete} 
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition duration-300"
                title="Mark as Completed"
              >
                <FaCheck />
              </button>
              <button 
                onClick={onNotAchieved} 
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300"
                title="Mark as Not Achieved"
              >
                <FaTimes />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
        <span className="flex items-center">
          <FaCalendarAlt className="mr-1 text-blue-500" />
          {goal.deadline ? getDaysLeft(goal.deadline) : 'No Deadline'}
        </span>
        <span className="flex items-center">
          <FaUserCheck className="mr-1 text-green-500" />
          {goal.verifierId ? 'Has Verifier' : 'No Verifier'}
        </span>
        <span className="flex items-center">
          <FaWallet className="mr-1 text-yellow-500" />
          Budget: {goal.budget || 0}
        </span>
      </div>
    </div>
  );
};

export default GoalItem;