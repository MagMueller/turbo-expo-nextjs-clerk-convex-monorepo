import Image from 'next/image';
import Link from "next/link";
import { useState } from "react";
import DatePicker from "./DatePicker";

export interface GoalProps {
  goal: {
    title: string;
    _id: string;
    _creationTime: number;
    deadline?: string;
  };
  deleteGoal: any;
  updateGoal: (id: string, deadline: string) => void;
}

const GoalItem = ({ goal, deleteGoal, updateGoal }: GoalProps) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const daysUntilDeadline = goal.deadline
    ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24))
    : null;

  const handleDeadlineChange = (newDeadline: string) => {
    updateGoal(goal._id, newDeadline);
    setIsDatePickerOpen(false);
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
          onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
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
            />
          </div>
        )}
      </div>
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
