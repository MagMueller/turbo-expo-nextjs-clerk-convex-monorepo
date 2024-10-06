"use client";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useState } from "react";
import { FaCalendarAlt, FaCheck, FaTrash, FaUserCheck } from "react-icons/fa";
import DatePicker from "./DatePicker";

export interface GoalProps {
  goal: {
    _id: Id<"goals">;
    title: string;
    _creationTime: number;
    deadline?: string;
    verifierId?: string;
    status?: string;
  };
  deleteGoal: any;
  updateGoal: (id: Id<"goals">, deadline: string) => void;
  updateVerifier: (id: Id<"goals">, verifierId: string) => void;
  completeGoal: (id: Id<"goals">) => void;
}

const GoalItem: React.FC<GoalProps> = ({ goal, deleteGoal, updateGoal, updateVerifier, completeGoal }) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isVerifierSelectOpen, setIsVerifierSelectOpen] = useState(false);
  const [verifierSearch, setVerifierSearch] = useState("");

  const friends = useQuery(api.friends.getFriends);
  
  // Use "skip" when there's no verifierId
  const verifier = useQuery(api.users.getUser, goal.verifierId ? { userId: goal.verifierId } : "skip");

  const filteredFriends = friends?.filter(friend => 
    friend.friendName.toLowerCase().includes(verifierSearch.toLowerCase()) ||
    (friend.friendEmail?.toLowerCase().includes(verifierSearch.toLowerCase()) ?? false)
  );

  const handleDeleteGoal = () => {
    deleteGoal({ goalId: goal._id });
  };

  const handleUpdateGoal = (deadline: string) => {
    updateGoal(goal._id, deadline);
    setIsDatePickerOpen(false);
  };

  const handleUpdateVerifier = (verifierId: string) => {
    updateVerifier(goal._id, verifierId);
    setIsVerifierSelectOpen(false);
  };

  const handleCompleteGoal = () => {
    completeGoal(goal._id);
  };

  const handleVerifierSelectToggle = () => {
    setIsVerifierSelectOpen(!isVerifierSelectOpen);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center space-x-4">
        <span className="text-lg font-semibold">{goal.title}</span>
        {goal.deadline && (
          <span className="text-sm text-gray-500">
            Deadline: {new Date(goal.deadline).toLocaleDateString()}
          </span>
        )}
        {verifier && (
          <span className="text-sm text-gray-500">
            Verifier: {verifier.name}
          </span>
        )}
        <span className="text-sm text-gray-500">
          Status: {goal.status || "Unfinished"}
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <FaCalendarAlt />
        </button>
        <button
          onClick={handleVerifierSelectToggle}
          className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          <FaUserCheck />
        </button>
        <button
          onClick={handleCompleteGoal}
          className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          <FaCheck />
        </button>
        <button
          onClick={handleDeleteGoal}
          className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          <FaTrash />
        </button>
      </div>
      {isDatePickerOpen && (
        <div className="absolute z-10 mt-2">
          <DatePicker
            value={goal.deadline || ""}
            onChange={handleUpdateGoal}
            onClose={() => setIsDatePickerOpen(false)}
          />
        </div>
      )}
      {isVerifierSelectOpen && (
        <div className="absolute z-10 mt-2 bg-white border rounded shadow-lg p-4">
          <input
            type="text"
            placeholder="Search friends"
            value={verifierSearch}
            onChange={(e) => setVerifierSearch(e.target.value)}
            className="w-full p-2 mb-2 border rounded"
          />
          <ul className="max-h-40 overflow-y-auto">
            {filteredFriends?.map((friend) => (
              <li
                key={friend.friendId}
                onClick={() => handleUpdateVerifier(friend.friendId)}
                className="cursor-pointer hover:bg-gray-100 p-2"
              >
                {friend.friendName}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GoalItem;