"use client";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
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
    budget?: number;
  };
  onDelete: () => void;
  onUpdate: (args: { id: Id<"goals">; deadline?: string; budget?: number }) => void;
  onComplete: () => void;
}

const GoalItem: React.FC<GoalProps> = ({ goal, onDelete, onUpdate, onComplete }) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isVerifierSelectOpen, setIsVerifierSelectOpen] = useState(false);
  const [verifierSearch, setVerifierSearch] = useState("");
  const datePickerRef = useRef<HTMLDivElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const verifierButtonRef = useRef<HTMLButtonElement>(null);
  //useMutation(api.users.forceSetAllUsersWithDefaultValues);


  const friends = useQuery(api.friends.getFriends);
  
  const verifier = useQuery(api.users.getUser, goal.verifierId ? { userId: goal.verifierId } : "skip");

  const filteredFriends = friends?.filter(friend => 
    friend.friendName.toLowerCase().includes(verifierSearch.toLowerCase()) ||
    (friend.friendEmail?.toLowerCase().includes(verifierSearch.toLowerCase()) ?? false)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (verifierButtonRef.current && !verifierButtonRef.current.contains(event.target as Node)) {
        setIsVerifierSelectOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUpdateGoal = (deadline: string) => {
    onUpdate({ id: goal._id, deadline });
    setIsDatePickerOpen(false);
  };

  const handleUpdateVerifier = (verifierId: string) => {
    onUpdate({ id: goal._id, verifierId });
    setIsVerifierSelectOpen(false);
  };

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : 'Overdue';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-semibold">{goal.title}</span>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <button
              ref={dateButtonRef}
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <FaCalendarAlt />
            </button>
            {isDatePickerOpen && (
              <div 
                ref={datePickerRef}
                className="absolute z-10 mt-2 right-0"
              >
                <DatePicker
                  value={goal.deadline || ""}
                  onChange={handleUpdateGoal}
                  onClose={() => setIsDatePickerOpen(false)}
                />
              </div>
            )}
          </div>
          <div className="relative">
            <button
              ref={verifierButtonRef}
              onClick={() => setIsVerifierSelectOpen(!isVerifierSelectOpen)}
              className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <FaUserCheck />
            </button>
            {isVerifierSelectOpen && (
              <div 
                className="absolute z-10 mt-2 right-0 bg-white border rounded shadow-lg p-4"
              >
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
          <button
            onClick={onComplete}
            className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            <FaCheck />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        {goal.deadline && (
          <span>
            Deadline: {getDaysLeft(goal.deadline)}
          </span>
        )}
        {verifier && (
          <span>
            Verifier: {verifier.name}
          </span>
        )}
        <span>
          Status: {goal.status || "Unfinished"}
        </span>
        <span>
          Budget: ${goal.budget || 0}
        </span>
      </div>
    </div>
  );
};

export default GoalItem;