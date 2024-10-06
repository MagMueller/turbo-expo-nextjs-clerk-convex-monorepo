"use client";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { FaCalendarAlt, FaCheck, FaEdit, FaTrash, FaUserCheck, FaWallet } from "react-icons/fa";

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
  isCompleted: boolean;
}

const GoalItem: React.FC<GoalProps> = ({ goal, onDelete, onUpdate, onComplete, isCompleted }) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isVerifierSelectOpen, setIsVerifierSelectOpen] = useState(false);
  const [verifierSearch, setVerifierSearch] = useState("");
  const datePickerRef = useRef<HTMLDivElement>(null);
  const dateButtonRef = useRef<HTMLButtonElement>(null);
  const verifierButtonRef = useRef<HTMLButtonElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(goal.title);
  const [editedDeadline, setEditedDeadline] = useState(goal.deadline || "");
  const [editedVerifier, setEditedVerifier] = useState(goal.verifierId || "");
  const [editedBudget, setEditedBudget] = useState(goal.budget || 0);

  const friends = useQuery(api.friends.getFriends);
  
  const verifier = useQuery(api.users.getUser, goal.verifierId ? { userId: goal.verifierId } : "skip");

  const filteredFriends = friends?.filter(friend => 
    friend.friendName.toLowerCase().includes(verifierSearch.toLowerCase()) ||
    (friend.friendEmail?.toLowerCase().includes(verifierSearch.toLowerCase()) ?? false)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node) && !dateButtonRef.current?.contains(event.target as Node)) {
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

  const handleUpdate = () => {
    onUpdate({
      id: goal._id,
      title: editedTitle,
      deadline: editedDeadline || undefined,
      verifierId: editedVerifier || undefined,
      budget: editedBudget,
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4" id={goal._id.toString()} tabIndex={0}>
      {isEditing ? (
        <div className="space-y-2">
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="date"
            value={editedDeadline}
            onChange={(e) => setEditedDeadline(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={editedVerifier}
            onChange={(e) => setEditedVerifier(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Verifier ID"
          />
          <input
            type="number"
            value={editedBudget}
            onChange={(e) => setEditedBudget(Number(e.target.value))}
            className="w-full p-2 border rounded"
          />
          <div className="flex justify-end space-x-2">
            <button onClick={handleUpdate} className="p-2 bg-green-500 text-white rounded">Save</button>
            <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-500 text-white rounded">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">{goal.title}</h3>
            <div className="flex space-x-2">
              <button onClick={() => setIsEditing(true)} className="p-3 bg-blue-500 text-white rounded text-lg">
                <FaEdit />
              </button>
              {!isCompleted && (
                <button onClick={onComplete} className="p-3 bg-green-500 text-white rounded text-lg">
                  <FaCheck />
                </button>
              )}
              <button onClick={onDelete} className="p-3 bg-red-500 text-white rounded text-lg">
                <FaTrash />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center text-gray-600">
            <span className="flex items-center">
              <FaCalendarAlt className="mr-2" />
              {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : 'No deadline'}
            </span>
            <span className="flex items-center">
              <FaUserCheck className="mr-2" />
              {goal.verifierId ? 'Has verifier' : 'No verifier'}
            </span>
            <span className="flex items-center">
              <FaWallet className="mr-2" />
              Budget: {goal.budget}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Status: {goal.status}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalItem;