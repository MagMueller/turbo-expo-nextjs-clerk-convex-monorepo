"use client";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { FaCalendarAlt, FaCheck, FaTimes, FaUserCheck, FaWallet } from "react-icons/fa";

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
  onComplete: () => void;
  onNotAchieved: () => void;
}

const GoalItem: React.FC<GoalProps> = ({ goal, onComplete, onNotAchieved }) => {
  const verifier = useQuery(api.users.getUser, goal.verifierId ? { userId: goal.verifierId } : "skip");

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : "Overdue";
  };

  const isCompleted = goal.status === "completed" || goal.status === "failed";

  return (
    <div className="bg-white rounded-lg shadow-md p-2 mb-2 flex justify-between items-center" id={goal._id.toString()} tabIndex={0}>
      <div className="flex-grow">
        <div className="goal-title">
          <span className="text-lg font-semibold">
            {goal.title}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
          <span className="flex items-center">
            <FaCalendarAlt className="mr-1" />
            {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No Deadline'}
          </span>
          <span className="flex items-center">
            <FaUserCheck className="mr-1" />
            {verifier?.name || 'No Verifier'}
          </span>
          <span className="flex items-center">
            <FaWallet className="mr-1" />
            {goal.budget || 0}
          </span>
          {goal.deadline && <span>{getDaysLeft(goal.deadline)}</span>}
        </div>
      </div>
      {!isCompleted && (
        <div className="flex space-x-2">
          <button 
            onClick={onComplete} 
            className="p-2 bg-green-500 text-white rounded text-sm"
            title="Mark as Completed"
          >
            <FaCheck />
          </button>
          <button 
            onClick={onNotAchieved} 
            className="p-2 bg-red-500 text-white rounded text-sm"
            title="Mark as Not Achieved"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default GoalItem;