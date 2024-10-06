"use client";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { differenceInCalendarDays, format } from 'date-fns';
import React from 'react';
import { FaCalendarAlt, FaCheck, FaTimes, FaUserCheck, FaWallet } from 'react-icons/fa';

export interface GoalProps {
  goal: {
    _id: Id<"goals">;
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
  const verifier = useQuery(api.users.getUser, goal.verifierId ? { userId: goal.verifierId } : "skip");

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = differenceInCalendarDays(deadlineDate, today);
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < -1) return `${Math.abs(diffDays)} days ago`;
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} left`;
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'd. MMM yyyy');
  };

  const isCompleted = goal.status === "completed" || goal.status === "failed";
  const isPending = goal.status === "pending";

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 transition duration-300 hover:shadow-lg">
      <div className="flex justify-between items-center flex-wrap">
        <h3 className="text-xl font-semibold text-gray-800 mr-2">{goal.title}</h3>
        <div className="flex items-center space-x-4 flex-wrap">
          <span className="flex items-center">
            <FaCalendarAlt className="mr-1 text-black" />
            <span className="text-sm text-black">{goal.deadline ? `${formatDate(goal.deadline)} (${getDaysLeft(goal.deadline)})` : 'No Deadline'}</span>
          </span>
          <span className="flex items-center">
            <FaUserCheck className={`mr-1 ${goal.verifierId ? 'text-pink-500' : 'text-gray-400'}`} />
            <span className="text-sm">{goal.verifierId ? (verifier?.name || 'Loading...') : 'No Verifier'}</span>
          </span>
          <span className="flex items-center">
            <FaWallet className="mr-1 text-green-400" />
            <span className="text-sm">Budget: {goal.budget || 0}</span>
          </span>
          {!isCompleted && !isPending && onComplete && onNotAchieved && (
            <div className="flex space-x-2">
              <button 
                onClick={onComplete} 
                className="p-2 bg-green-700 text-white rounded-full hover:bg-green-800 transition duration-300"
                title="Mark as Completed"
              >
                <FaCheck className="text-xl" />
              </button>
              <button 
                onClick={onNotAchieved} 
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-300"
                title="Mark as Not Achieved"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
          )}
          {isPending && (
            <span className="text-yellow-500">Pending Verification</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalItem;