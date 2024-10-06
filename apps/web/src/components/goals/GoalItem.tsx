"use client";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useEffect, useRef, useState } from "react";
import { FaCalendarAlt, FaCheck, FaTimes, FaUserCheck, FaWallet } from "react-icons/fa";
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
  onUpdate: (args: { id: Id<"goals">; title?: string; deadline?: string; verifierId?: string; budget?: number }) => void;
  onComplete: () => void;
  onNotAchieved: () => void;
  isCompleted: boolean;
}

const GoalItem: React.FC<GoalProps> = ({ goal, onUpdate, onComplete, onNotAchieved, isCompleted }) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isVerifierSelectOpen, setIsVerifierSelectOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(goal.title);
  const [editedDeadline, setEditedDeadline] = useState(goal.deadline || "");
  const [editedVerifier, setEditedVerifier] = useState(goal.verifierId || "");
  const [editedBudget, setEditedBudget] = useState(goal.budget || 0);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const friends = useQuery(api.friends.getFriends);
  const verifier = useQuery(api.users.getUser, goal.verifierId ? { userId: goal.verifierId } : "skip");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!event.target) return;
      const target = event.target as HTMLElement;
      if (!target.closest('.date-picker') && !target.closest('.verifier-select')) {
        setIsDatePickerOpen(false);
        setIsVerifierSelectOpen(false);
      }
      if (isEditingTitle && !target.closest('.goal-title')) {
        setIsEditingTitle(false);
        onUpdate({ id: goal._id, title: editedTitle });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditingTitle, editedTitle, goal._id, onUpdate]);

  const handleEdit = (field: 'title' | 'deadline' | 'verifier' | 'budget', value: string | number) => {
    if (isCompleted) return;

    switch (field) {
      case 'title':
        setEditedTitle(value as string);
        break;
      case 'deadline':
        setEditedDeadline(value as string);
        onUpdate({ id: goal._id, deadline: value as string });
        break;
      case 'verifier':
        setEditedVerifier(value as string);
        onUpdate({ id: goal._id, verifierId: value as string });
        break;
      case 'budget':
        setEditedBudget(value as number);
        onUpdate({ id: goal._id, budget: value as number });
        break;
    }
  };

  const getDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days left` : 'Overdue';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-2 mb-2" id={goal._id.toString()} tabIndex={0}>
      <div className="flex justify-between items-center">
        <div className="goal-title">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={editedTitle}
              onChange={(e) => handleEdit('title', e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              className="text-lg font-semibold border-b-2 border-blue-500 focus:outline-none"
              autoFocus
            />
          ) : (
            <span 
              className="text-lg font-semibold cursor-pointer"
              onClick={() => !isCompleted && setIsEditingTitle(true)}
            >
              {editedTitle}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          {!isCompleted && (
            <button onClick={onComplete} className="p-2 bg-green-500 text-white rounded text-sm">
              <FaCheck />
            </button>
          )}
          <button onClick={onNotAchieved} className="p-2 bg-red-500 text-white rounded text-sm">
            <FaTimes />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
        <span className="flex items-center cursor-pointer date-picker" onClick={() => !isCompleted && setIsDatePickerOpen(!isDatePickerOpen)}>
          <FaCalendarAlt className="mr-1" />
          {editedDeadline ? new Date(editedDeadline).toLocaleDateString() : 'Set Deadline'}
        </span>
        <span className="flex items-center cursor-pointer verifier-select" onClick={() => !isCompleted && setIsVerifierSelectOpen(!isVerifierSelectOpen)}>
          <FaUserCheck className="mr-1" />
          {verifier?.name || 'Set Verifier'}
        </span>
        <span className="flex items-center">
          <FaWallet className="mr-1" />
          <input
            type="number"
            value={editedBudget}
            onChange={(e) => handleEdit('budget', Number(e.target.value))}
            className={`w-16 ${isCompleted ? 'bg-transparent' : 'bg-white'}`}
            disabled={isCompleted}
          />
        </span>
        {goal.deadline && <span>{getDaysLeft(goal.deadline)}</span>}
      </div>
      {isDatePickerOpen && (
        <div className="mt-2">
          <DatePicker
            value={editedDeadline}
            onChange={(date) => {
              handleEdit('deadline', date);
              setIsDatePickerOpen(false);
            }}
            onClose={() => setIsDatePickerOpen(false)}
          />
        </div>
      )}
      {isVerifierSelectOpen && (
        <div className="mt-2">
          <select
            value={editedVerifier}
            onChange={(e) => handleEdit('verifier', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Verifier</option>
            {friends?.map((friend) => (
              <option key={friend.friendId} value={friend.friendId}>
                {friend.friendName}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default GoalItem;