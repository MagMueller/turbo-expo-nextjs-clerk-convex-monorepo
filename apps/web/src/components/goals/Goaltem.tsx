import { api } from "@packages/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import Image from 'next/image';
import Link from "next/link";
import { useRef, useState } from "react";
import DatePicker from "./DatePicker";

export interface GoalProps {
  goal: {
    title: string;
    _id: string;
    _creationTime: number;
    deadline?: string;
    verifierId?: string;
    status?: string;
  };
  deleteGoal: any;
  updateGoal: (id: string, deadline: string) => void;
  updateVerifier: (id: string, verifierId: string) => void;
  completeGoal: (id: string) => void;
}

const GoalItem = ({ goal, deleteGoal, updateGoal, updateVerifier, completeGoal }: GoalProps) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isVerifierSelectOpen, setIsVerifierSelectOpen] = useState(false);
  const [datePickerPosition, setDatePickerPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const verifierRef = useRef<HTMLButtonElement>(null);

  const friends = useQuery(api.friends.getFriends);

  const daysUntilDeadline = goal.deadline
    ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    : null;

  const handleDeadlineChange = (newDeadline: string) => {
    updateGoal(goal._id, newDeadline);
    setIsDatePickerOpen(false);
  };

  const handleVerifierChange = (newVerifierId: string) => {
    updateVerifier(goal._id, newVerifierId);
    setIsVerifierSelectOpen(false);
  };

  const handleDatePickerToggle = () => {
    if (!isDatePickerOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDatePickerPosition({
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + window.scrollX - 100,
      });
    }
    setIsDatePickerOpen(!isDatePickerOpen);
  };

  const handleVerifierSelectToggle = () => {
    setIsVerifierSelectOpen(!isVerifierSelectOpen);
  };

  return (
    <div className="flex justify-between items-center min-h-[74px] bg-[#F9FAFB] py-5 px-5 sm:px-11 gap-x-5 sm:gap-x-10">
      <Link href={`/goals/${goal._id}`} className="flex-1">
        <h1 className="text-[#2D2D2D] text-[17px] sm:text-2xl not-italic font-normal leading-[114.3%] tracking-[-0.6px]">
          {goal.title}
        </h1>
      </Link>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleDatePickerToggle}
          className="text-[#2D2D2D] text-center text-xl font-medium leading-[114.3%] tracking-[-0.5px]"
          title={goal.deadline ? new Date(goal.deadline).toLocaleDateString() : "Set deadline"}
        >
          {goal.deadline ? (
            <span className="text-2xl font-light">{daysUntilDeadline} days left</span>
          ) : (
            "Set Deadline"
          )}
        </button>
        {isDatePickerOpen && (
          <div className="absolute z-10 right-0 mt-2">
            <DatePicker
              value={goal.deadline || ""}
              onChange={handleDeadlineChange}
              onClose={() => setIsDatePickerOpen(false)}
            />
          </div>
        )}
      </div>
      <div className="relative">
        <button
          ref={verifierRef}
          onClick={handleVerifierSelectToggle}
          className="text-[#2D2D2D] text-center text-xl font-medium leading-[114.3%] tracking-[-0.5px]"
        >
          {goal.verifierId ? "Change Verifier" : "Set Verifier"}
        </button>
        {isVerifierSelectOpen && (
          <div className="absolute z-10 right-0 mt-2 bg-white border border-gray-300 rounded-md shadow-lg">
            <select
              value={goal.verifierId || ""}
              onChange={(e) => handleVerifierChange(e.target.value)}
              className="block w-full px-4 py-2 text-sm"
            >
              <option value="">Select a verifier</option>
              {friends?.map((friend) => (
                <option key={friend.friendId} value={friend.friendId}>
                  {friend.friendId}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div className="text-[#2D2D2D] text-center text-xl font-medium leading-[114.3%] tracking-[-0.5px]">
        {goal.status || "pending"}
      </div>
      {!goal.verifierId && (
        <button
          onClick={() => completeGoal(goal._id)}
          className="p-2 bg-green-500 text-white rounded text-xl font-medium"
        >
          Complete
        </button>
      )}
      <Image
        src="/images/delete.svg"
        width={20}
        height={20}
        alt="delete"
        className="cursor-pointer"
        onClick={() => deleteGoal({ goalId: goal._id })}
      />
    </div>
  );
};

export default GoalItem;